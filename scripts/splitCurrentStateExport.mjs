/**
 * Split Builder/_chatGPT/current_state_*.md into N byte-balanced parts
 * at real merged-file boundaries (`##` line matches a Builder-relative doc path:
 * `*.md`, `*.mdx`, `*.csv`, or extensionless `_chatGPT/` artifact).
 * Does not remove the source file.
 *
 * Usage:
 *   node scripts/splitCurrentStateExport.mjs <src.md> [parts]
 *   node scripts/splitCurrentStateExport.mjs Builder/_chatGPT/current_state_2026-05-14_090235.md 5
 *
 * Defaults: newest current_state_*.md in Builder/_chatGPT/, 5 parts.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = fileURLToPath(new URL('..', import.meta.url));
const CHAT_DIR = join(REPO, 'Builder/_chatGPT');

function newestFullExport() {
  const files = readdirSync(CHAT_DIR)
    .filter((f) => /^current_state_\d{4}-\d{2}-\d{2}_\d{6}\.md$/.test(f))
    .sort();
  if (!files.length) throw new Error('No current_state_*.md found in Builder/_chatGPT/');
  return join(CHAT_DIR, files[files.length - 1]);
}

const srcPath = process.argv[2] ? join(REPO, process.argv[2].replace(/^[/\\]+/, '')) : newestFullExport();
const PARTS = Math.max(2, parseInt(process.argv[3] ?? '5', 10) || 5);

const MERGED_HEAD = '# Merged content (by path)';
const NEEDLE = '\n\n---\n\n## ';

function isExportSectionPath(line) {
  if (line.includes('\\')) return false;
  if (line.startsWith('SOURCE:') || line.startsWith('source:')) return false;
  if (line.endsWith('.md') || line.endsWith('.mdx') || line.endsWith('.csv')) return true;
  const slab = line.includes('/') ? line.slice(line.lastIndexOf('/') + 1) : line;
  if (line.startsWith('_chatGPT/') && !slab.includes('.')) return true;
  return false;
}

/** Returns byte-offsets inside `tail` where each real merged-file section starts. */
function findSectionStarts(tail) {
  const starts = [];
  let pos = 0;
  while (pos < tail.length) {
    const i = tail.indexOf(NEEDLE, pos);
    if (i === -1) break;
    const pathStart = i + NEEDLE.length;
    const lineEnd = tail.indexOf('\n', pathStart);
    if (lineEnd === -1) break;
    if (isExportSectionPath(tail.slice(pathStart, lineEnd))) starts.push(i);
    pos = pathStart;
  }
  return starts;
}

/**
 * Given section byte-lengths, return the split indices (section counts per part)
 * such that each part is as byte-balanced as possible.
 */
function byteBalancedSplitIndices(lens, parts) {
  const total = lens.reduce((a, b) => a + b, 0);
  const target = total / parts;
  const splitAfter = []; // section index (0-based) after which to cut
  let acc = 0;
  let cuts = 0;
  for (let i = 0; i < lens.length; i += 1) {
    acc += lens[i];
    if (cuts < parts - 1 && acc >= target * (cuts + 1)) {
      splitAfter.push(i + 1); // number of sections in this part
      cuts += 1;
    }
  }
  return splitAfter; // length == parts-1; section counts: splitAfter[0], diff, diff, ..., rest
}

// ── load ──────────────────────────────────────────────────────────────────────
const content = readFileSync(srcPath, 'utf8');
const headPos = content.indexOf(MERGED_HEAD);
if (headPos === -1) { console.error(`"${MERGED_HEAD}" not found in ${srcPath}`); process.exit(1); }

const prefixEnd = headPos + MERGED_HEAD.length;
const prefix = content.slice(0, prefixEnd);
const tail = content.slice(prefixEnd);

const starts = findSectionStarts(tail);
const n = starts.length;
if (n === 0) { console.error('No merged sections found.'); process.exit(1); }

const actualParts = Math.min(PARTS, n);

const sectionLens = starts.map((s, i) => (i + 1 < n ? starts[i + 1] : tail.length) - s);
const cutCounts = byteBalancedSplitIndices(sectionLens, actualParts); // section counts for parts 1..(P-1)

// Build part boundaries: array of [fromSection, toSection) pairs
const boundaries = [];
let prev = 0;
for (const cut of cutCounts) {
  boundaries.push([prev, cut]);
  prev = cut;
}
boundaries.push([prev, n]);

const srcBase = basename(srcPath);

// ── write each part ───────────────────────────────────────────────────────────
const written = [];
for (let p = 0; p < boundaries.length; p += 1) {
  const [fromSec, toSec] = boundaries[p];
  const partNum = p + 1;
  const outPath = srcPath.replace(/\.md$/i, `_part${partNum}.md`);

  const tailStart = starts[fromSec] ?? tail.length;
  const tailEnd = toSec < n ? starts[toSec] : tail.length;
  const body = tail.slice(tailStart, tailEnd);

  const text = partNum === 1
    ? prefix + tail.slice(0, tailEnd)
    : (() => {
        const intro = [
          `# Builder documentation — consolidated export (part ${partNum} of ${actualParts})`,
          '',
          `Continuation of **${srcBase}**. Sections ${fromSec + 1}–${toSec} of ${n} (byte-balanced split).`,
          '',
          `Source (unchanged): \`Builder/_chatGPT/${srcBase}\``,
          '',
          '---',
          '',
          MERGED_HEAD,
          '',
        ].join('\n');
        return intro + (body.length ? body : '\n\n*(No additional merged sections.)*\n');
      })();

  writeFileSync(outPath, text, 'utf8');
  const mb = Math.round((text.length / 1024 / 1024) * 100) / 100;
  written.push({ partNum, sections: toSec - fromSec, outPath: basename(outPath), mb });
}

console.log(`\nSplit ${n} sections into ${actualParts} parts (byte-balanced):`);
for (const { partNum, sections, outPath, mb } of written) {
  console.log(`  part ${partNum}: ${sections} sections → ${outPath} (${mb} MB)`);
}
console.log(`\nSource preserved: ${srcPath}`);
