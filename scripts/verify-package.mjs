import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFile(join(root, path), "utf8");
const packageJson = JSON.parse(await read("package.json"));

assert.equal(packageJson.name, "dsh-minecraft-ui", "canonical npm package name changed unexpectedly");
// dsh-guardian-preflight-ignore: verifies this package's own Bundle patch, never a profile file.
assert.equal(packageJson.dsh?.bundle?.patch, "./cordis.patch.yml", "missing dsh.bundle patch manifest");
assert.equal(packageJson.dsh?.client?.platform, "web", "client platform must be web");
assert.equal(packageJson.exports?.["./client"], "./lib/client.js", "missing client export");
// dsh-guardian-preflight-ignore: verifies this package's own Bundle patch export.
assert.equal(packageJson.exports?.["./cordis.patch.yml"], "./cordis.patch.yml", "missing patch export");

const requiredFiles = [
  "lib/index.js",
  "lib/client.js",
  // dsh-guardian-preflight-ignore: package-owned Bundle patch in the publish whitelist.
  "cordis.patch.yml",
  "README.md",
  "LICENSE",
  "licenses/Monocraft-LICENSE.txt",
];
assert.deepEqual(packageJson.files, requiredFiles, "published files must use the reviewed whitelist");

// dsh-guardian-preflight-ignore: reads only this package's own Bundle patch.
const patch = await read("cordis.patch.yml");
assert.match(patch, /- id:\s+minecraft-ui\b/, "bundle patch must preserve the stable Cordis row id");
assert.match(patch, /name:\s+dsh-minecraft-ui\b/, "bundle patch must reference the canonical package name");

const client = await read("lib/client.js");
assert.match(
  client.slice(0, 300),
  /window\.__ModuleLoader__\.load\(\{\s*id:\s*["']dsh-minecraft-ui["']/,
  "client factory id must match package.json.name",
);
const clientSize = (await stat(join(root, "lib", "client.js"))).size;
assert.ok(clientSize > 1000, "client bundle is unexpectedly empty");
assert.ok(clientSize <= 2_000_000, `client bundle exceeds the 2 MB budget (${clientSize} bytes)`);

const host = await read("lib/index.js");
const exportBlock = /export\s*\{([\s\S]*?)\};/.exec(host)?.[1] || "";
for (const symbol of ["name", "inject", "Config", "apply"]) {
  assert.match(exportBlock, new RegExp(`\\b${symbol}\\b`), `host bundle must export ${symbol}`);
}

await access(join(root, "LICENSE"));
await access(join(root, "licenses", "Monocraft-LICENSE.txt"));

const staleFiles = [
  "scripts/assemble.mjs",
  "scripts/smoke.mjs",
  "scripts/host-smoke.mjs",
  "lib/client.template.js",
  "lib/styles.css",
  "client/src/generated-styles.js",
];
for (const path of staleFiles) {
  try {
    await access(join(root, path));
    assert.fail(`obsolete build artifact is still present: ${path}`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

console.log(`verified ${packageJson.name} package contract (${clientSize} client bytes)`);
