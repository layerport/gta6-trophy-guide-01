// Leonida Legend — GTA VI trophy guide, entrypoint (Node 22, stdlib only).
//
// What this program does, in three steps:
//   1. Copy the static guide (app/) into the output directory.
//   2. Copy the maker's screenshots (screenshots/) alongside it.
//   3. Write dossier.json with the vendored make.fun library, so the judge
//      reads the screenshots, the first load's files and bytes, and the source.
//
// The guide itself is plain files: app/index.html opens in desktop Chrome
// with the network off, its data in app/data/trophies.json, its logic in
// app/app.js and app/roadmap.js, its look in app/style.css. No build step,
// no network request at runtime, nothing to install.
//
// Run it outside the grader's container with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// It must write byte-identical output on every run, so it copies files in a
// fixed order and never stamps a time or a random value anywhere.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Where the repository lives, and where the entry goes. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse — more than
// 4 screenshots or one over 256 KiB, more than 993 files and directories in
// app/, or 48 MiB of app files (app/ shares /output's own 1000-entry cap
// with screenshots/ and dossier.json, so leave them room).
const DOSSIER_OPTIONS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
} as const;

// Copy a directory tree in a fixed, deterministic order: entries sorted by
// name, directories before the files inside them, so two runs agree byte
// for byte. Symlinks and special files are refused — the guide is plain
// files only, which is what the gate requires of app/ anyway.
function copyTreeSorted(source: string, target: string): void {
  mkdirSync(target, { recursive: true });
  const entries = readdirSync(source, { withFileTypes: true }).sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
  );
  for (const entry of entries) {
    const from = join(source, entry.name);
    const to = join(target, entry.name);
    if (entry.isDirectory()) {
      copyTreeSorted(from, to);
    } else if (entry.isFile()) {
      cpSync(from, to);
    } else {
      throw new Error(`refusing non-regular entry in ${from}`);
    }
  }
}

function handIn(): void {
  const appSource = join(repoRoot, 'app');
  const shotsSource = join(repoRoot, 'screenshots');
  if (!statSync(appSource).isDirectory()) throw new Error('app/ is missing');
  if (!existsSync(shotsSource)) throw new Error('screenshots/ is missing');

  mkdirSync(outDir, { recursive: true });
  copyTreeSorted(appSource, join(outDir, 'app'));
  copyTreeSorted(shotsSource, join(outDir, 'screenshots'));

  // vendor/makefun-frontend.ts is the kit's copy, unchanged: the scorer
  // rebuilds the dossier with the same library and compares byte for byte.
  const dossier = buildDossier(outDir, DOSSIER_OPTIONS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

handIn();
