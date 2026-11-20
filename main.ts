// Leonida Legend — make.fun entry program (Node 22, standard library only).
//
// What it hands in: this repository's app/ folder (the offline trophy guide
// and tracker, plain static files) plus screenshots/ of it, copied into the
// output directory, with /output/dossier.json written by the vendored
// make.fun library so the judge can read the entry.
//
// The program is deterministic: it wipes the output directory first, then
// copies the same files in the same order, so two runs write identical
// bytes. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// vendor/makefun-frontend.ts is the kit's copy and is left untouched — the
// scorer rebuilds the dossier with its own copy and compares byte for byte.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");

function countEntries(dir) {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    total += 1;
    if (statSync(path).isDirectory()) total += countEntries(path);
  }
  return total;
}

function fail(message) {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

const appDir = join(repoRoot, "app");
const shotsDir = join(repoRoot, "screenshots");

if (!existsSync(appDir)) fail("app/ is missing from the repository");
if (!existsSync(join(appDir, "index.html"))) fail("app/index.html is missing");
if (!existsSync(join(appDir, "data", "trophies.json"))) fail("app/data/trophies.json is missing");

// Start from a clean output directory so a stale file from an earlier run
// can never leak into the submission.
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

cpSync(appDir, join(outputDir, "app"), { recursive: true });

const outShots = join(outputDir, "screenshots");
mkdirSync(outShots, { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, outShots, { recursive: true });
}
const shotCount = existsSync(outShots) ? readdirSync(outShots).filter((n) => !n.startsWith(".")).length : 0;
if (shotCount < 3 || shotCount > 4) fail(`expected 3 or 4 screenshots, found ${shotCount}`);

// The scorer's own caps: the dossier text cap shapes the bytes; the other
// caps refuse an entry the scorer would refuse (more than 4 screenshots or
// one over 256 KiB; more than 993 files and directories in app/ or 48 MiB
// of app files — app/ counts beside /output's own 1000-entry cap).
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);

console.log(
  `Leonida Legend handed in: ${countEntries(join(outputDir, "app"))} app entries, ` +
  `${shotCount} screenshots, dossier ${dossier.length} bytes -> ${outputDir}`,
);
