/**
 * One-shot consolidation of all Markdown under Builder/ into a single file
 * with per-file sections and SHA-256 deduplication of identical bodies.
 *
 * Run from repo root:
 *   node scripts/consolidateBuilderMarkdown.mjs
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = fileURLToPath(new URL('..', import.meta.url));
const BUILDER = join(REPO, 'Builder');
const OUT_DIR = join(BUILDER, '_chatGPT');

function pad2(n) {
  return String(n).padStart(2, '0');
}

function stampLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}_${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
}

const SKIP_DIR = new Set(['node_modules', '.git']);

/** @param {string} dir @param {string[]} acc */
function walkMd(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIR.has(e.name)) continue;
      walkMd(p, acc);
    } else if (e.isFile() && e.name.endsWith('.md')) {
      const rel = relative(BUILDER, p).split(sep).join('/');
      if (rel.startsWith('_chatGPT/current_state_') && rel.endsWith('.md')) continue;
      acc.push(p);
    }
  }
  return acc;
}

const files = walkMd(BUILDER).sort((a, b) => relative(BUILDER, a).localeCompare(relative(BUILDER, b)));

const hashToFirstPath = new Map();
const sections = [];

let includedFiles = 0;
let skippedDupBodies = 0;
let totalInBytes = 0;
let uniqueInBytes = 0;

for (const abs of files) {
  const rel = relative(BUILDER, abs).split(sep).join('/');
  const buf = readFileSync(abs);
  totalInBytes += buf.length;
  const text = buf.toString('utf8').replace(/\r\n/g, '\n');
  const h = createHash('sha256').update(buf).digest('hex');

  if (hashToFirstPath.has(h)) {
    skippedDupBodies += 1;
    const first = hashToFirstPath.get(h);
    sections.push(
      `\n\n---\n\n## ${rel}\n\n` +
        `_Identical body omitted (duplicate of \`${first}\`). SHA-256: \`${h}\`._\n`,
    );
    continue;
  }

  hashToFirstPath.set(h, rel);
  uniqueInBytes += buf.length;
  includedFiles += 1;
  sections.push(`\n\n---\n\n## ${rel}\n\n${text.endsWith('\n') ? text : `${text}\n`}`);
}

mkdirSync(OUT_DIR, { recursive: true });
const stamp = stampLocal();
const outName = `current_state_${stamp}.md`;
const outPath = join(OUT_DIR, outName);

const header = [
  '# Builder documentation — consolidated export',
  '',
  `Generated (local): **${stamp.replace('_', ' ')}**`,
  '',
  'This file merges every `.md` file under `Builder/` (folder order = lexicographic path). ' +
    'If two files have identical bytes, the first occurrence keeps the full body; later paths reference the first and omit the duplicate body.',
  '',
  '| Metric | Value |',
  '| --- | ---: |',
  `| Markdown files scanned | ${files.length} |`,
  `| Unique bodies (full text below) | ${includedFiles} |`,
  `| Duplicate bodies (reference only) | ${skippedDupBodies} |`,
  `| Total bytes (all inputs) | ${totalInBytes} |`,
  `| Bytes in unique bodies only | ${uniqueInBytes} |`,
  '',
  '## File index (paths)',
  '',
  ...files.map((abs) => `- \`${relative(BUILDER, abs).split(sep).join('/')}\``),
  '',
  '---',
  '',
  '# Merged content (by path)',
].join('\n');

writeFileSync(outPath, header + sections.join(''), 'utf8');
console.log(`Wrote ${outPath} (${files.length} files, ${skippedDupBodies} duplicate bodies)`);
