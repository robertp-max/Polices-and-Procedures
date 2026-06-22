#!/usr/bin/env node
/**
 * DESIGNLESS / NO-LEGACY-BLEED + V6 CONTRACT GATE
 * ----------------------------------------------
 * Run BEFORE and AFTER any V6 design work. Guarantees no legacy design,
 * no legacy components, no banned typography, and no CDN dependencies ever
 * reach the active app.
 *
 * WHERE IT LOOKS (per V6 audit P0-1/P0-6/P0-7):
 *  - dist/      : compiled ground truth — legacy colors, banned weights, CDN strings.
 *  - ACTIVE src : src/** EXCLUDING src/policy/** (preserved-but-inactive logic is
 *                 never bundled, so it must not trip the gate) — legacy component
 *                 identifiers (word-boundaried), banned fonts/weights, CDN strings.
 *  - src/**     : stale .js/.jsx shadow guard.
 *
 * IMPORTANT (P0-1): reused PUBLIC ROUTE PATHS (/library, /forms, /print, /appendix)
 * are INTENTIONALLY allowed with new V6-native implementations. The gate blocks
 * legacy COMPONENTS + COLORS + COMPILED legacy output + CDNs — never a path name.
 * Legacy component identifiers are matched with \b word boundaries so V6-native
 * names (FormViewerV6, LibraryPageV6, V6Shell) PASS.
 *
 * Usage:  npm run build && node scripts/check-designless.mjs
 * Exit 0 = clean. Exit 1 = violation.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SRC = path.join(ROOT, 'src');
// ACTIVE V6 namespace = scaffold + future src/v6. Everything else under src/
// (policy, auth, components, contexts, services, assets, …) is preserved-but-
// inactive headless code, excluded from the tsconfig build and never bundled —
// it legitimately contains legacy refs/AWS URLs, so it must NOT trip the gate.
// dist/ remains the ground-truth guard for anything that actually ships.
const ACTIVE_DIRS = [path.join(SRC, '_scaffold'), path.join(SRC, 'v6')];
const ACTIVE_FILES = ['main.tsx', 'App.tsx', 'index.css', 'vite-env.d.ts'].map(f => path.join(SRC, f));

// --- legacy design (P0 anti-bleed) ---
const LEGACY_COLOR = /maroon|burgundy|ci-ion|#420808|#0a0202|#310707|#5d0e0e|#0b0f15|#0f131a|#7f1d1d|#881337|#991b1b|#9f1239|\bwine\b/i;
// P0-1: \b word boundaries — bans EXACT legacy identifiers; V6-native suffixed names pass.
const LEGACY_NAMES = /\b(CommandCenterLayout|PolicyViewer32|PolicyDetailPage|LibraryPage|FormViewer|FormPrintView|PrintPage|GVGBPrintDocument|GVGBAppendixPrint|TravelightBG|DotGrid|GlobalDotBackground|v3Tokens|SharedPolicyDetailView|PolicyLibraryDocumentView)\b/;
// P0-1: LEGACY_ROUTES check REMOVED — reused public paths are allowed with V6-native components.

// --- P0-6: typography lock (Roboto 300;500 only) ---
const FORBIDDEN_FONT = /['"](Inter|Montserrat)['"]|font-family:[^;}{]*\b(Inter|Montserrat)\b|font-\[?(inter|montserrat)\b/i;
const FORBIDDEN_WEIGHT = /\bfont-(semibold|bold|extrabold|black)\b|font-weight:\s*(600|700|800|900)\b/i;

// --- P0-7: CDN / external-asset ban (CSP-blocked in prod) ---
const CDN_BAN = /fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.tailwindcss\.com|cdnjs\.cloudflare\.com|use\.fontawesome\.com|fontawesome|cdn\.jsdelivr\.net|unpkg\.com|@babel\/standalone|babel-standalone|\.cloudfront\.net/i;

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
    try {
      const txt = fs.readFileSync(f, 'utf8');
      for (const [name, re] of patterns) {
        if (re.test(txt)) problems.push(`[${label}] ${name} in ${path.relative(ROOT, f)}`);
      }
    } catch { continue; }
  }
}

// 1) Compiled output (dist/) — colors, banned weights, CDN strings
if (!fs.existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}
const distFiles = walk(DIST).filter(f => /\.(js|css|html)$/.test(f));
scan('dist', distFiles, [
  ['legacy-color', LEGACY_COLOR],
  ['banned-font', FORBIDDEN_FONT],
  ['banned-weight', FORBIDDEN_WEIGHT],
  ['cdn-dependency', CDN_BAN],
]);

// 2) ACTIVE V6 source only — legacy names, fonts, weights, CDN
const activeSrc = [
  ...ACTIVE_DIRS.flatMap(d => walk(d)),
  ...ACTIVE_FILES.filter(f => fs.existsSync(f)),
].filter(f => /\.(tsx?|jsx?|css|html)$/.test(f) && !/\.d\.ts$/.test(f));
scan('src', activeSrc, [
  ['legacy-component', LEGACY_NAMES],
  ['legacy-color', LEGACY_COLOR],
  ['banned-font', FORBIDDEN_FONT],
  ['banned-weight', FORBIDDEN_WEIGHT],
  ['cdn-dependency', CDN_BAN],
]);

// 3) index.html (entry) — CDN / fonts / weights
const indexHtml = path.join(ROOT, 'index.html');
if (fs.existsSync(indexHtml)) scan('index.html', [indexHtml], [
  ['cdn-dependency', CDN_BAN],
  ['banned-font', FORBIDDEN_FONT],
]);

// 4) Stale .js/.jsx shadows anywhere under src/
const staleJs = walk(SRC).filter(f => /\.jsx?$/.test(f) && !/\.config\.js$/.test(f));
for (const f of staleJs) problems.push(`[stale-js] ${path.relative(ROOT, f)}`);

if (problems.length) {
  console.error('❌ DESIGNLESS / V6 GATE FAILED:\n');
  for (const p of problems) console.error('  ' + p);
  console.error(`\n${problems.length} issue(s). Reused public route paths are allowed; legacy COMPONENTS, colors, CDNs, and banned typography are not.`);
  process.exit(1);
}
console.log('✅ DESIGNLESS / V6 GATE PASSED — no legacy components/colors, no banned fonts/weights, no CDN deps, no stale .js. (Reused public route paths allowed.)');
