import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

test("package is an installable DSH bundle and web client", async () => {
  const pkg = JSON.parse(await read("package.json"));
  assert.equal(pkg.name, "dsh-minecraft-ui");
  assert.equal(pkg.dsh.bundle.patch, "./cordis.patch.yml");
  assert.equal(pkg.dsh.client.platform, "web");
  assert.equal(pkg.dsh.client.immediately, true);
  assert.equal(pkg.exports["./client"], "./lib/client.js");
  assert.equal(pkg.exports["./cordis.patch.yml"], "./cordis.patch.yml");
});

test("Cordis patch keeps row identity while resolving canonical package", async () => {
  const patch = await read("cordis.patch.yml");
  assert.match(patch, /- id:\s+minecraft-ui\b/);
  assert.match(patch, /name:\s+dsh-minecraft-ui\b/);
  assert.doesNotMatch(patch, /disabled:\s+true/);
});

test("client factory id exactly matches package name", async () => {
  const pkg = JSON.parse(await read("package.json"));
  const client = await read("lib/client.js");
  const id = /window\.__ModuleLoader__\.load\(\{\s*id:\s*["']([^"']+)["']/.exec(client)?.[1];
  assert.equal(id, pkg.name);
});

test("published file whitelist contains runtime and both licenses only", async () => {
  const pkg = JSON.parse(await read("package.json"));
  assert.deepEqual(pkg.files, [
    "lib/index.js",
    "lib/client.js",
    "cordis.patch.yml",
    "README.md",
    "LICENSE",
    "licenses/Monocraft-LICENSE.txt",
  ]);
});
