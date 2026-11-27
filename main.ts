// main.ts — the entry program for "The Great Gobble Escape".
// Copies game/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier from
// vendor/makefun-game.ts. Standard library only, Node 22, no network.
//
// Run locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The grader runs it twice; both runs must write identical bytes.

import { buildDossier } from './vendor/makefun-game.ts';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyTree(name) {
  const from = join(repoRoot, name);
  const to = join(outputDir, name);
  if (!existsSync(from)) {
    throw new Error(`main.ts: ${name}/ is missing from the repository`);
  }
  cpSync(from, to, { recursive: true, dereference: false });
}

// The grader mounts its output directory as a Docker volume, so the
// directory itself is a mount point: never delete it (rmdir fails EBUSY
// and the run exits 1). Clear only its contents, then recreate the trees.
mkdirSync(outputDir, { recursive: true });
for (const entry of readdirSync(outputDir)) {
  rmSync(join(outputDir, entry), { recursive: true, force: true });
}

copyTree('game');
copyTree('screenshots');

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

console.log(`wrote ${join(outputDir, 'dossier.json')} (${dossier.length} bytes)`);
