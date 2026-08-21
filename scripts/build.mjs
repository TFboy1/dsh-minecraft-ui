import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const clientSource = join(root, "client", "src");
const lib = join(root, "lib");
const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const packageName = String(packageJson.name || "").trim();
if (!packageName) throw new Error("package.json must declare a package name");

const css = `${await readFile(join(clientSource, "styles.css"), "utf8")}\n${await readFile(join(clientSource, "styles-interactions.css"), "utf8")}`;
const font = await readFile(join(root, "fonts", "Monocraft.ttf"));
const hydratedCss = css.replace("__MONOCRAFT_FONT_DATA__", font.toString("base64"));
if (hydratedCss.includes("__MONOCRAFT_FONT_DATA__")) throw new Error("font marker was not replaced");
const styleSegments = [];
for (let start = 0; start < hydratedCss.length;) {
  let end = Math.min(start + 8192, hydratedCss.length);
  if (end < hydratedCss.length && /[\uD800-\uDBFF]/.test(hydratedCss[end - 1])) end -= 1;
  styleSegments.push(hydratedCss.slice(start, end));
  start = end;
}
const generatedStylesSource = [
  "const parts = [];",
  ...styleSegments.map(segment => `parts.push(${JSON.stringify(segment)});`),
  "export default parts.join(\"\");",
].join("\n");

const generatedStylesPlugin = {
  name: "dshcraft-generated-styles",
  setup(buildContext) {
    buildContext.onResolve({ filter: /^\.\/generated-styles\.js$/ }, () => ({
      path: "generated-styles",
      namespace: "dshcraft",
    }));
    buildContext.onLoad({ filter: /^generated-styles$/, namespace: "dshcraft" }, () => ({
      contents: generatedStylesSource,
      loader: "js",
    }));
  },
};

await mkdir(lib, { recursive: true });

await build({
  entryPoints: [join(root, "src", "index.js")],
  outfile: join(lib, "index.js"),
  bundle: false,
  format: "esm",
  platform: "node",
  target: ["node22"],
  sourcemap: false,
  legalComments: "none",
});

const result = await build({
  entryPoints: [join(clientSource, "index.jsx")],
  bundle: true,
  format: "cjs",
  platform: "browser",
  target: ["chrome110"],
  external: ["react", "react/jsx-runtime"],
  plugins: [generatedStylesPlugin],
  write: false,
  sourcemap: false,
  minify: false,
  legalComments: "none",
  jsx: "automatic",
});
const bundled = result.outputFiles?.[0]?.text;
if (!bundled) throw new Error("esbuild produced no client output");

const wrapped = `window.__ModuleLoader__.load({\n  id: ${JSON.stringify(packageName)},\n  factory: (require) => {\n    var module = { exports: {} };\n    var exports = module.exports;\n${bundled}\n    return module.exports;\n  }\n});\n`;
await writeFile(join(lib, "client.js"), wrapped, "utf8");
console.log(`built ${packageName} host and client (${wrapped.length} client bytes)`);
