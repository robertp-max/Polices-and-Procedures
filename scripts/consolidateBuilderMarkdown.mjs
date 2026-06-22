/**
 * One-shot consolidation of documentation under Builder/ into a single Markdown file
 * with per-file sections and SHA-256 deduplication of identical bodies.
 *
 * Includes: `.md`, `.mdx`, `.csv` anywhere under Builder/, plus extensionless text
 * files directly in Builder/_chatGPT/ (e.g. ACHC-Crosswalk).
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

function isWalkedDocFile(name) {
  const n = name.toLowerCase();
  return n.endsWith('.md') || n.endsWith('.mdx') || n.endsWith('.csv');
}

/** Markdown-like paths: emit body as-is; otherwise wrap in fenced block for safe embedding. */
function formatSectionBody(rel, text) {
  const n = rel.toLowerCase();
  if (n.endsWith('.md') || n.endsWith('.mdx')) {
    return text.endsWith('\n') ? text : `${text}\n`;
  }
  const lang = n.endsWith('.csv') ? 'csv' : 'text';
  const inner = text.endsWith('\n') ? text.slice(0, -1) : text;
  return `\`\`\`${lang}\n${inner}\n\`\`\`\n`;
}

/** @param {string} dir @param {string[]} acc */
function walkBuilderDocs(dir, acc = []) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (SKIP_DIR.has(e.name)) continue;
        walkBuilderDocs(p, acc);
      } else if (e.isFile() && isWalkedDocFile(e.name)) {
        const rel = relative(BUILDER, p).split(sep).join('/');
        if (rel.startsWith('_chatGPT/current_state_')) continue;
        acc.push(p);
      }
    }
  } catch {
    return acc;
  }
  return acc;
}

/** Extensionless text artifacts in `Builder/_chatGPT/` (e.g. `ACHC-Crosswalk`) are not picked up by extension walk. */
function appendChatGptExtensionless(paths) {
  const dir = join(BUILDER, '_chatGPT');
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    const have = new Set(paths.map((p) => p.toLowerCase()));
    for (const e of entries) {
      if (!e.isFile()) continue;
      if (e.name.startsWith('current_state_')) continue;
      if (isWalkedDocFile(e.name)) continue;
      const abs = join(dir, e.name);
      if (have.has(abs.toLowerCase())) continue;
      paths.push(abs);
      have.add(abs.toLowerCase());
    }
  } catch {
    return;
  }
}

const files = walkBuilderDocs(BUILDER);
appendChatGptExtensionless(files);
files.sort((a, b) => relative(BUILDER, a).localeCompare(relative(BUILDER, b)));

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
  sections.push(`\n\n---\n\n## ${rel}\n\n${formatSectionBody(rel, text)}`);
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
  'This file merges documentation under `Builder/`: `.md`, `.mdx`, `.csv`, plus extensionless text files ' +
    'directly in `Builder/_chatGPT/` (lexicographic path order). ' +
    'Non-Markdown bodies are wrapped in fenced code blocks. ' +
    'If two files have identical bytes, the first occurrence keeps the full body; later paths reference the first and omit the duplicate body.',
  '',
  '| Metric | Value |',
  '| --- | ---: |',
  `| Files scanned | ${files.length} |`,
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
