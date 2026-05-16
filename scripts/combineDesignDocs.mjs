import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIR = String.raw`c:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\design`;
const OUT = join(DIR, 'COMBINED_UIUX_DESIGN_SYSTEM.md');

const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.md') && f !== 'COMBINED_UIUX_DESIGN_SYSTEM.md')
  .sort();

const now = new Date().toLocaleString('en-US', {
  timeZone: 'America/Los_Angeles',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
});

const toc = files
  .map((f, i) => {
    const label = f.replace('.md', '').replace(/_/g, ' ');
    const anchor = f.replace('.md', '').toLowerCase().replace(/_/g, '-');
    return `${i + 1}. [${label}](#${anchor})`;
  })
  .join('\n');

const header = [
  '# CareIndeed UI/UX Design System — Combined Reference',
  '',
  `> **Generated:** ${now} (local)`,
  '> **Source folder:** `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/`',
  `> **Files merged:** ${files.length}`,
  '',
  'This document concatenates all design-system markdown files in the folder above into a single reference.',
  'Each section is separated by a horizontal rule and labelled with its source filename.',
  '',
  '---',
  '',
  '## Table of Contents',
  '',
  toc,
  '',
  '---',
].join('\n');

const sections = files.map((f) => {
  const content = readFileSync(join(DIR, f), 'utf8').replace(/\r\n/g, '\n').trimEnd();
  const anchor = f.replace('.md', '').toLowerCase().replace(/_/g, '-');
  return `\n\n---\n\n<a name="${anchor}"></a>\n\n## SOURCE: ${f}\n\n${content}\n`;
});

writeFileSync(OUT, header + sections.join(''), 'utf8');

const mb = Math.round(statSync(OUT).size / 1024 / 1024 * 100) / 100;
console.log(`Written: ${OUT}`);
console.log(`Files merged: ${files.length}`);
console.log(`Size: ${mb} MB`);
