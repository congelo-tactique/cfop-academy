// Pré-assemble cubing.js (mélanges + solveur) dans public/vendor/cubing.
// Vite ne doit pas ré-empaqueter cubing.js : ses web workers casseraient en production.
import { build } from "esbuild";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "node_modules/cubing/dist/lib/cubing");
const out = resolve(root, "public/vendor/cubing");

rmSync(out, { recursive: true, force: true });
await build({
  entryPoints: {
    scramble: `${src}/scramble/index.js`,
    search: `${src}/search/index.js`,
    puzzles: `${src}/puzzles/index.js`,
    "chunks/search-worker-entry": `${src}/chunks/search-worker-entry.js`,
  },
  outdir: out,
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
  chunkNames: "chunks/[name]-[hash]",
  logLevel: "warning",
  // modules Node optionnels référencés par cubing.js, jamais chargés dans le navigateur
  external: ["node:*"],
});
console.log("cubing.js prêt dans public/vendor/cubing");
