// The GitHub upload tool used to publish this repo only accepts text files,
// so binary assets (icons, font) are stored base64-encoded in binary-assets/.
// This script decodes them back to their real paths before dev/build.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";

const root = join(dirname(new URL(import.meta.url).pathname), "..");
const src = join(root, "binary-assets");

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".b64")) {
      const target = join(root, relative(src, p).slice(0, -4));
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, Buffer.from(readFileSync(p, "utf8").replace(/\s+/g, ""), "base64"));
    }
  }
}
walk(src);
