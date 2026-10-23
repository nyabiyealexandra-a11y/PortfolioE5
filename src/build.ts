/**
 * Builds the site into `dist/`:
 *   1. validates the content (stops on the first build with errors),
 *   2. renders `dist/index.html` with the stylesheet inlined,
 *   3. copies everything in `public/` (PDFs, images…) next to it.
 *
 * Run with `npm run build`.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { site } from "./content/site.ts";
import { countTodos, renderPage } from "./dsl/render.ts";
import { validatePage } from "./dsl/validate.ts";

const root = join(import.meta.dirname, "..");
const publicDir = join(root, "public");
const distDir = join(root, "dist");

const errors = validatePage(site, { fileExists: (path) => existsSync(join(publicDir, path)) });
if (errors.length > 0) {
  console.error(`✗ The content has ${errors.length} problem(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

const css = readFileSync(join(import.meta.dirname, "styles", "site.css"), "utf8");
const html = renderPage(site, { css });

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
cpSync(publicDir, distDir, { recursive: true, filter: (source) => !source.endsWith(".gitkeep") });
writeFileSync(join(distDir, "index.html"), html);

console.log(`✓ Built dist/index.html (${(html.length / 1024).toFixed(1)} kB, ${site.sections.length} sections)`);

const todos = countTodos(html);
if (todos > 0) console.warn(`! ${todos} "À compléter" marker(s) left on the page. Search for todo( in src/content/.`);
