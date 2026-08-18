import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let css = await readFile(join(root, "lib", "styles.css"), "utf8");
const font = await readFile(join(root, "fonts", "Monocraft.ttf"));
const fontMarker = "__MONOCRAFT_FONT_DATA__";
if (!css.includes(fontMarker)) throw new Error("styles.css is missing the font marker");
css = css.replace(fontMarker, font.toString("base64"));

let template = await readFile(join(root, "lib", "client.template.js"), "utf8");
const marker = "\"__MINECRAFT_CSS__\"";
if (!template.includes(marker)) throw new Error("client.template.js is missing the CSS marker");
const escaped = css.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
template = template.replace(marker, `\`${escaped}\``);
await writeFile(join(root, "lib", "client.js"), template);
console.log(`assembled lib/client.js (${css.length} CSS bytes, embedded Monocraft)`);
