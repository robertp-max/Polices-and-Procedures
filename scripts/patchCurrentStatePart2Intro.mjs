/**
 * Rewrites the first few lines of a split `*_part2.md` so they reference the
 * canonical full-export filename (avoids editing multi‑MB files in tooling
 * that may truncate on replace).
 *
 * Usage:
 *   node scripts/patchCurrentStatePart2Intro.mjs Builder/_chatGPT/current_state_2026-05-06_100829_part2.md current_state_2026-05-07_110904.md
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = fileURLToPath(new URL('..', import.meta.url));
const part2Path = join(REPO, process.argv[2] ?? '');
const intermediateName = process.argv[3] ?? '';
if (!part2Path.endsWith('.md') || !intermediateName) {
  console.error('Usage: node scripts/patchCurrentStatePart2Intro.mjs <path-to-part2.md> <intermediate-export-basename.md>');
  process.exit(1);
}

const canonical = 'current_state_2026-05-06_100829.md';
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let s = readFileSync(part2Path, 'utf8');

s = s.replace(
  new RegExp(`Continuation of \\*\\*${esc(intermediateName)}\\*\\*`, 'g'),
  `Continuation of **${canonical}**`,
);
s = s.replace(
  new RegExp(`Source \\(unchanged\\): \`Builder/_chatGPT/${esc(intermediateName)}\``, 'g'),
  `Source (full export): \`Builder/_chatGPT/${canonical}\``,
);

writeFileSync(part2Path, s, 'utf8');
console.log(`Patched intro in ${basename(part2Path)} (${s.length} chars)`);
