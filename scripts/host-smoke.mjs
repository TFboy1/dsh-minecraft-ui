import assert from "node:assert/strict";
import { apply, name } from "../lib/index.js";

assert.equal(name, "minecraft-ui");
assert.equal(apply(), undefined);
console.log("minecraft-ui host smoke test passed");
