/* ═══════════════════════════════════════════════════════════════
   verifyJourneyGuardrails.ts — source scan for banned patterns (§12/§15).

     npm run journey:verify:guardrails   (from apps/employee-journey)

   FAILS (exit 1) on hard guardrail violations:
     - target="_blank" / window.open        (same-tab-only rule)
     - hard-coded localhost outside the env-gated resolver allowlist
   WARNS (exit 0, reported) on tracked-deferred items:
     - unapproved x-user-* identity headers (Nolan auth is a tracked follow-up)
   Logo drift is covered separately by verifyBrandLogo.ts.
   ═══════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(__dirname, '../app');

// Only these files may reference "localhost" (env-gated dev fallbacks that fail
// closed in production — verified by verifyJourneyCorrections.ts).
const LOCALHOST_ALLOWLIST = new Set(['mainAppUrl.ts']);

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = walk(APP_DIR);
const hardViolations: string[] = [];
const warnings: string[] = [];

for (const file of files) {
  const rel = path.relative(APP_DIR, file);
  const base = path.basename(file);
  const text = fs.readFileSync(file, 'utf8');
  text.split(/\r?\n/).forEach((rawLine, i) => {
    const n = i + 1;
    // Ignore comment lines (JSDoc/block/line/CSS) — we scan CODE, not prohibition prose.
    const trimmed = rawLine.trim();
    if (/^(\*|\/\/|\/\*|\*\/|<!--)/.test(trimmed)) return;
    // Strip an inline // line-comment before matching.
    const line = rawLine.replace(/\/\/.*$/, '');
    if (/target\s*=\s*["'`]_blank/.test(line)) hardViolations.push(`${rel}:${n}  target="_blank"`);
    if (/\bwindow\.open\s*\(/.test(line)) hardViolations.push(`${rel}:${n}  window.open(`);
    if (/localhost/.test(line) && !LOCALHOST_ALLOWLIST.has(base)) {
      hardViolations.push(`${rel}:${n}  hard-coded localhost outside the env-gated resolver`);
    }
    if (/["'`]x-user-(id|display-name|role)["'`]/.test(line)) {
      warnings.push(`${rel}:${n}  x-user-* dev header (Nolan authenticated-client follow-up)`);
    }
  });
}

console.log(`Scanned ${files.length} files under app/`);
if (warnings.length) {
  console.log(`\nWARNINGS (tracked deferred — Nolan auth):`);
  for (const w of warnings) console.log(`  ! ${w}`);
}
if (hardViolations.length) {
  console.error(`\nFAIL — ${hardViolations.length} hard guardrail violation(s):`);
  for (const v of hardViolations) console.error(`  ✗ ${v}`);
  process.exit(1);
}
console.log(`\nPASS — no target=_blank / window.open / unguarded localhost.`);
