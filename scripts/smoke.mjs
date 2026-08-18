import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const styles = [];
const classes = new Set();
let plugin;

globalThis.document = {
  body: {
    classList: {
      toggle(name, on) { if (on) classes.add(name); else classes.delete(name); },
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
      contains(name) { return classes.has(name); }
    }
  },
  head: {
    appendChild(node) { styles.push(node); node.parentNode = this; }
  },
  createElement() {
    return {
      dataset: {},
      textContent: "",
      remove() {
        const index = styles.indexOf(this);
        if (index >= 0) styles.splice(index, 1);
      }
    };
  },
  querySelector(selector) {
    const match = selector.match(/data-plugin-css="([^"]+)"/);
    return match ? styles.find((node) => node.dataset.pluginCss === match[1]) ?? null : null;
  }
};
globalThis.window = {
  __ModuleLoader__: {
    load(definition) { plugin = definition.factory(() => { throw new Error("unexpected require"); }); }
  }
};

await import(pathToFileURL(join(root, "lib", "client.js")).href + `?smoke=${Date.now()}`);
assert.equal(typeof plugin?.apply, "function");
assert.deepEqual(plugin.inject, ["theme"]);
assert.equal(plugin.themeDefinition.id, "minecraft");

function mount() {
  const effects = [];
  const listeners = new Map();
  const registrations = [];
  let snapshot = { preference: "dark", active: { id: "dark" }, themes: [], revision: 0 };
  const ctx = {
    effect(fn) {
      const dispose = fn();
      effects.push(typeof dispose === "function" ? dispose : () => {});
      return dispose;
    },
    on(name, listener) {
      listeners.set(name, listener);
      return () => listeners.delete(name);
    },
    theme: {
      getTheme() { return snapshot; },
      register(definition) {
        registrations.push(definition);
        return () => {
          const index = registrations.indexOf(definition);
          if (index >= 0) registrations.splice(index, 1);
          snapshot = { ...snapshot, preference: "dark", active: { id: "dark" } };
        };
      },
      setTheme(id) {
        snapshot = { ...snapshot, preference: id, active: { id }, revision: snapshot.revision + 1 };
        listeners.get("theme/change")?.(snapshot);
      }
    }
  };
  plugin.apply(ctx);
  return {
    registrations,
    emit(snapshotValue) { snapshot = snapshotValue; listeners.get("theme/change")?.(snapshot); },
    dispose() { for (const fn of effects.reverse()) fn(); }
  };
}

for (let cycle = 0; cycle < 2; cycle += 1) {
  const run = mount();
  assert.equal(styles.length, 1, "exactly one stylesheet is mounted");
  assert.equal(run.registrations.length, 1, "theme is registered");
  assert.equal(document.body.classList.contains("minecraft-ui-active"), true, "theme class is active while mounted");
  run.dispose();
  assert.equal(styles.length, 0, "stylesheet is removed");
  assert.equal(document.body.classList.contains("minecraft-ui-active"), false, "theme class is removed");
  assert.equal(run.registrations.length, 0, "theme registration is removed");
}

console.log("minecraft-ui smoke test passed");
