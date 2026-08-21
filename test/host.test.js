import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  Config,
  DEFAULT_CONFIG,
  apply,
  parseInstallCommand,
  resolveDataDirectory,
  validateCatalogUrl,
} from "../src/index.js";

function createHostHarness() {
  let rpcHandler;
  let rpcDisposed = 0;
  let restrictionDisposed = 0;
  const listeners = new Map();
  const agent = {
    sessionId: "s1",
    preset: "code",
    running: true,
    ctx: {
      tools: {
        restrict({ deny }) {
          assert.deepEqual(deny, ["read"]);
          return () => { restrictionDisposed += 1; };
        },
      },
    },
  };
  const schemas = [
    { name: "read", description: "Read files" },
    { name: "run_code", description: "Protected" },
  ];
  const ctx = {
    connection: {
      rpc: {
        handle(channel, handler, options) {
          assert.equal(channel, "/minecraft-ui");
          assert.deepEqual(options, { authority: "loopback" });
          rpcHandler = handler;
          return () => { rpcDisposed += 1; };
        },
      },
    },
    agents: { get: id => id === "s1" ? agent : undefined },
    tools: { schemas: () => schemas },
    on(name, listener) {
      listeners.set(name, listener);
      return () => listeners.delete(name);
    },
  };
  return {
    ctx,
    invoke: (endpoint, payload) => rpcHandler(endpoint, payload),
    listeners,
    counts: () => ({ rpcDisposed, restrictionDisposed }),
  };
}

test("Config fills defaults and rejects out-of-range values", () => {
  assert.deepEqual(Config({}), DEFAULT_CONFIG);
  assert.throws(() => Config({ catalogLimit: 0 }), /catalogLimit|greater than or equal/i);
  assert.throws(() => Config({ catalogCacheTtlMs: 100 }), /catalogCacheTtlMs|greater than or equal/i);
  assert.throws(() => Config({ confirmationTtlMs: 1000 }), /confirmationTtlMs|greater than or equal/i);
});

test("data directory and catalog URL validation fail loudly", async () => {
  const root = await mkdtemp(join(tmpdir(), "dshcraft-path-"));
  try {
    assert.equal(resolveDataDirectory(root, "state"), join(root, "state"));
    assert.throws(() => resolveDataDirectory(root, "../escape"), /inside DSH_HOME/);
    assert.throws(() => resolveDataDirectory(root, root), /relative path/);
    assert.equal(validateCatalogUrl("https://example.com/plugins.json"), "https://example.com/plugins.json");
    assert.throws(() => validateCatalogUrl("file:///tmp/plugins.json"), /HTTP or HTTPS/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("community install command parser accepts one inert package spec only", () => {
  assert.deepEqual(parseInstallCommand("dsh plugin --profile web add @scope/plugin#abc"), {
    profile: "web",
    packageSpec: "@scope/plugin#abc",
  });
  assert.equal(parseInstallCommand("dsh plugin --profile web add pkg --danger"), null);
  assert.equal(parseInstallCommand("dsh plugin --profile main add pkg"), null);
  assert.equal(parseInstallCommand("cmd /c calc"), null);
});

test("host RPC is disposable and community confirmation stays Guardian dry-run", async () => {
  const root = await mkdtemp(join(tmpdir(), "dshcraft-host-"));
  const previousHome = process.env.DSH_HOME;
  process.env.DSH_HOME = root;
  const harness = createHostHarness();
  const dispose = apply(harness.ctx, {
    ...DEFAULT_CONFIG,
    dataDirectory: "state",
    catalogUrl: "http://127.0.0.1:1/plugins.json",
  });
  try {
    const initial = await harness.invoke("capabilities.list", { sessionId: "s1" });
    assert.equal(initial.ok, true);
    assert.deepEqual(initial.value.items.map(item => item.id), ["read"]);

    const restricted = await harness.invoke("capabilities.set", {
      sessionId: "s1",
      id: "read",
      enabled: false,
    });
    assert.equal(restricted.ok, true);
    assert.equal(restricted.value.items[0].enabled, false);

    const persisted = JSON.parse(await readFile(join(root, "state", "capabilities.json"), "utf8"));
    assert.deepEqual(persisted.sessions.s1, ["read"]);

    const catalog = await harness.invoke("community.catalog", {});
    assert.equal(catalog.ok, true);
    assert.equal(catalog.value.offline, true);
    assert.ok(catalog.value.items.length > 0);

    const item = catalog.value.items[0];
    assert.equal((await harness.invoke("community.collection.claim", { id: item.id })).ok, true);
    const prepared = await harness.invoke("community.install.prepare", { id: item.id });
    assert.equal(prepared.ok, true);
    assert.equal(prepared.value.mode, "dry-run");
    assert.equal(prepared.value.requiresGuardian, true);

    const confirmed = await harness.invoke("community.install.confirm", { token: prepared.value.token });
    assert.equal(confirmed.ok, true);
    assert.equal(confirmed.value.status, "dry-run");
    assert.equal(confirmed.value.requiresGuardian, true);
    assert.match(confirmed.value.message, /Guardian/);

    const replay = await harness.invoke("community.install.confirm", { token: prepared.value.token });
    assert.equal(replay.ok, false);
    assert.match(replay.error.message, /expired/);
  } finally {
    dispose();
    if (previousHome === undefined) delete process.env.DSH_HOME;
    else process.env.DSH_HOME = previousHome;
    await rm(root, { recursive: true, force: true });
  }
  assert.equal(harness.listeners.size, 0);
  assert.deepEqual(harness.counts(), { rpcDisposed: 1, restrictionDisposed: 1 });
});

test("host source contains no process-spawning installer path", async () => {
  const source = await readFile(new URL("../src/index.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /node:child_process|\bspawn\s*\(/);
  assert.doesNotMatch(source, /DSHCRAFT_COMMUNITY_INSTALL/);
});
