#!/usr/bin/env node
/**
 * DESIGNLESS / NO-LEGACY-BLEED REGRESSION GATE
 * --------------------------------------------
 * Run BEFORE and AFTER any V6 design work to guarantee no old maroon/original
 * design, no legacy viewer/shell components, and no dead viewer routes ever
 * reappear in the ACTIVE app.
 *
 * It scans the BUILT output (dist/) — the ground truth of what actually ships —
 * plus the source tree for stale .js shadows. Preserved-but-inactive process
 * logic under src/policy/** is intentionally ignored (it is never bundled).
 *
 * Usage:  npm run build && node scripts/check-designless.mjs
 * Exit 0 = clean baseline. Exit 1 = legacy bleed detected.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SRC = path.join(ROOT, 'src');

const LEGACY_COLOR = /maroon|burgundy|ci-ion|#420808|#0a0202|#310707|#5d0e0e|#0b0f15|#0f131a|#7f1d1d|#881337|#991b1b|#9f1239|wine\b/i;
const LEGACY_NAMES = /CommandCenterLayout|PolicyViewer32|PolicyDetailPage|LibraryPage|FormViewer|FormPrintView|PrintPage|GVGBPrintDocument|GVGBAppendixPrint|TravelightBG|DotGrid|GlobalDotBackground|v3Tokens|SharedPolicyDetailView|PolicyLibraryDocumentView/;
const LEGACY_ROUTES = /["'`]\/(library|forms|print|appendix)(\/|["'`])/;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const problems = [];
function scan(label, files, patterns) {
  for (const f of files) {
    let txt; try { txt = fs.readFileSync(f, 'utf8'); } catch { continue; }
    for (const [name, re] of patterns) {
      if (re.test(txt)) problems.push(`[${label}] ${name} in ${path.relative(ROOT, f)}`);
    }
  }
}

// 1) Built output must contain no legacy color/name/route
if (!fs.existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}
const distFiles = walk(DIST).filter(f => /\.(js|css|html)$/.test(f));
scan('dist', distFiles, [
  ['legacy-color', LEGACY_COLOR],
  ['legacy-component', LEGACY_NAMES],
  ['legacy-route', LEGACY_ROUTES],
]);

// 2) No stale .js shadows under src (compiled-into-src bug)
const staleJs = walk(SRC).filter(f => /\.jsx?$/.test(f) && !/\.config\.js$/.test(f));
for (const f of staleJs) problems.push(`[stale-js] ${path.relative(ROOT, f)}`);

if (problems.length) {
  console.error('❌ DESIGNLESS GATE FAILED — legacy bleed detected:\n');
  for (const p of problems) console.error('  ' + p);
  console.error(`\n${problems.length} issue(s).`);
  process.exit(1);
}
console.log('✅ DESIGNLESS GATE PASSED — no legacy colors, components, routes, or stale .js in the active build.');
