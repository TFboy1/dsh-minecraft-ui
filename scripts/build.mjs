import { build } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "client", "src");
const css = `${await readFile(join(source, "styles.css"), "utf8")}\n${await readFile(join(source, "styles-interactions.css"), "utf8")}`;
const font = await readFile(join(root, "fonts", "Monocraft.ttf"));
const hydratedCss = css.replace("__MONOCRAFT_FONT_DATA__", font.toString("base64"));
if (hydratedCss.includes("__MONOCRAFT_FONT_DATA__")) throw new Error("font marker was not replaced");
await writeFile(join(source, "generated-styles.js"), `export default ${JSON.stringify(hydratedCss)};\n`, "utf8");
const result = await build({
  entryPoints: [join(source, "index.jsx")],
  bundle: true,
  format: "cjs",
  platform: "browser",
  target: ["chrome110"],
  external: ["react", "react/jsx-runtime"],
  write: false,
  sourcemap: false,
  minify: false,
  legalComments: "none",
  jsx: "automatic"
});
const bundled = result.outputFiles?.[0]?.text;
if (!bundled) throw new Error("esbuild produced no client output");
const wrapped = `window.__ModuleLoader__.load({\n  id: "minecraft-ui",\n  factory: (require) => {\n    var module = { exports: {} };\n    var exports = module.exports;\n${bundled}\n    return module.exports;\n  }\n});\n`;
await mkdir(join(root, "lib"), { recursive: true });
await writeFile(join(root, "lib", "client.js"), wrapped, "utf8");
console.log(`built minecraft-ui client (${wrapped.length} bytes)`);
