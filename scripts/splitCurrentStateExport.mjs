/**
 * Split Builder/_chatGPT/current_state_*.md into _part1 and _part2
 * at real merged-file boundaries only (## line is Builder-relative *.md).
 * Does not remove the source file.
 *
 * Usage:
 *   node scripts/splitCurrentStateExport.mjs
 *   node scripts/splitCurrentStateExport.mjs Builder/_chatGPT/current_state_2026-05-06_100829.md
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = fileURLToPath(new URL('..', import.meta.url));
const DEFAULT_SRC = join(REPO, 'Builder/_chatGPT/current_state_2026-05-06_100829.md');

const srcPath = process.argv[2] ? join(REPO, process.argv[2].replace(/^\/+/, '')) : DEFAULT_SRC;
const MERGED_HEAD = '# Merged content (by path)';
const NEEDLE = '\n\n---\n\n## ';

function isExportSectionPath(line) {
  if (!line.endsWith('.md')) return false;
  if (line.startsWith('SOURCE:') || line.startsWith('source:')) return false;
  if (line.includes('\\')) return false;
  return true;
}

/** @returns {number[]} start offsets in `tail` where each merged file section begins */
function findSectionStartsInTail(tail) {
  const starts = [];
  let pos = 0;
  while (pos < tail.length) {
    const i = tail.indexOf(NEEDLE, pos);
    if (i === -1) break;
    const pathStart = i + NEEDLE.length;
    const lineEnd = tail.indexOf('\n', pathStart);
    if (lineEnd === -1) break;
    const pathLine = tail.slice(pathStart, lineEnd);
    if (isExportSectionPath(pathLine)) starts.push(i);
    pos = pathStart;
  }
  return starts;
}

const content = readFileSync(srcPath, 'utf8');
const headPos = content.indexOf(MERGED_HEAD);
if (headPos === -1) {
  console.error(`Missing "${MERGED_HEAD}" in ${srcPath}`);
  process.exit(1);
}

const prefixEnd = headPos + MERGED_HEAD.length;
const prefix = content.slice(0, prefixEnd);
const tail = content.slice(prefixEnd);

const starts = findSectionStartsInTail(tail);
const n = starts.length;
if (n === 0) {
  console.error('No merged sections found (path filter).');
  process.exit(1);
}

/** Section byte lengths (same order as `starts`) */
const sectionLens = [];
for (let i = 0; i < n; i += 1) {
  const from = starts[i];
  const to = i + 1 < n ? starts[i + 1] : tail.length;
  sectionLens.push(to - from);
}
const totalTail = tail.length;
const target = totalTail / 2;
let acc = 0;
/** Number of merged sections in part 1 (sections 0..splitIdx-1). */
let splitIdx = n;
for (let i = 0; i < n; i += 1) {
  acc += sectionLens[i];
  if (acc >= target) {
    splitIdx = i + 1;
    break;
  }
}
if (n === 1) {
  splitIdx = 1;
} else if (splitIdx >= n) {
  splitIdx = n - 1;
}

const splitAt = splitIdx >= n ? tail.length : starts[splitIdx];
const sectionsInPart1 = splitIdx >= n ? n : splitIdx;
const sectionsInPart2 = n - sectionsInPart1;

const part1Path = srcPath.replace(/\.md$/i, '_part1.md');
const part2Path = srcPath.replace(/\.md$/i, '_part2.md');

const part1 = prefix + tail.slice(0, splitAt);

const part2Intro = [
  '# Builder documentation — consolidated export (part 2 of 2)',
  '',
  sectionsInPart2 > 0
    ? `Continuation of **${basename(srcPath)}**. Part 1 has merged file sections 1–${sectionsInPart1} of ${n} (byte-balanced split). This file is sections ${sectionsInPart1 + 1}–${n}.`
    : `**${basename(srcPath)}** fits entirely in part 1 (single merged section). This file has no duplicate body.`,
  '',
  `Source (unchanged): \`Builder/_chatGPT/${basename(srcPath)}\``,
  '',
  '---',
  '',
  MERGED_HEAD,
  '',
].join('\n');

const tail2 = tail.slice(splitAt);
const part2 =
  tail2.length > 0
    ? part2Intro + tail2
    : part2Intro + '\n\n*(No additional merged sections.)*\n';

writeFileSync(part1Path, part1, 'utf8');
writeFileSync(part2Path, part2, 'utf8');

console.log(
  `Split ${n} merged sections (~${Math.round((100 * splitAt) / totalTail)}% / ~${Math.round((100 * (totalTail - splitAt)) / totalTail)}% bytes): ${sectionsInPart1} → ${basename(part1Path)}, ${sectionsInPart2} → ${basename(part2Path)}`,
);
console.log(`Source preserved: ${srcPath}`);
