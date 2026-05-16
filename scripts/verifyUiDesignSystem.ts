/**
 * verifyUiDesignSystem — guards Care Indeed UI architecture invariants.
 *
 * Checks (warn vs fail noted per check):
 *   1. FAIL  CSS tokens for Care Indeed dark mode are present in src/index.css.
 *   2. FAIL  useCiModeStore exists.
 *   3. FAIL  CommandCenterLayout writes data-ci-mode attribute.
 *   4. FAIL  CommandCenterLayout still writes data-theme (brand toggle preserved).
 *   5. FAIL  CommandCenterLayout still calls toggleTheme on logo click (brand toggle untouched).
 *   6. FAIL  ThemeModeToggle present and rendered when isLight only.
 *   7. WARN  Hardcoded `text-black` AND `bg-black` co-occur on the same element.
 *   8. WARN  Inline style background:'#000' (use --ci-bg).
 *   9. WARN  Files in src/policy/components/pm/ pinning slate- palette
 *            instead of token classes (suggests migration to GlassPanel).
 *  10. WARN  EntityLink hardcoded `text-cyan-300` outside of EntityLink.tsx
 *            (callers should not override; primitive owns colour).
 *  11. WARN  Raw hex / rgb literal in className or inline style (Stabilization
 *            D-01 / MVP §4 L810). Flags `#xxxxxx`, `rgb(...)`, `rgba(...)` in
 *            JSX attribute values. Exceptions: print/PDF builders, eCign
 *            navy/orange brand surface (FormSigningWorkspace), the verifier
 *            itself, generated files. Replace with `var(--ci-*)` tokens.
 *  12. WARN  Glass-stack density >3 in a single file (Stabilization D-03 /
 *            MVP §C1). Counts inline `backdropFilter` style assignments plus
 *            Tailwind `backdrop-blur-*` class usages per file. >3 hits
 *            suggests stacked glass surfaces — Layer 3 is reserved for
 *            elevated portal modals only.
 *
 * Run: tsx --tsconfig tsconfig.app.json scripts/verifyUiDesignSystem.ts
 *
 * Promotion path: D-01 (hex/rgb) and D-03 (glass-stack) emit WARN today so
 * the existing surfaces don't fail the build. Promote to FAIL after the
 * MVP Wave 0 design-token cleanup pass lands and the WARN count is zero.
 */
import { readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { readdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');

interface Issue {
  level: 'fail' | 'warn';
  rule: string;
  file?: string;
  line?: number;
  msg: string;
}
const issues: Issue[] = [];

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    if (e.startsWith('.')) continue;
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|css)$/.test(e)) out.push(p);
  }
  return out;
}

const files = walk(SRC);
const read = (p: string): string => readFileSync(p, 'utf8');

// ── 1. Tokens present ────────────────────────────────────────────
const indexCss = read(join(SRC, 'index.css'));
if (!indexCss.includes(`html[data-theme="care-indeed-light"][data-ci-mode="dark"]`)) {
  issues.push({ level: 'fail', rule: 'tokens.dark-mode', msg: 'Care Indeed dark mode tokens missing in src/index.css' });
}
for (const tok of ['--ci-bg', '--ci-surface', '--ci-text-primary', '--ci-link', '--ci-cta', '--ci-glass-bg', '--radius-md', '--space-4']) {
  if (!indexCss.includes(tok)) {
    issues.push({ level: 'fail', rule: 'tokens.semantic', msg: `Missing token ${tok} in src/index.css` });
  }
}

// ── 2. ciModeStore exists ────────────────────────────────────────
const ciModeStorePath = join(SRC, 'policy/stores/ciModeStore.ts');
try {
  const s = read(ciModeStorePath);
  if (!s.includes('useCiModeStore') || !s.includes('toggleMode')) {
    issues.push({ level: 'fail', rule: 'mode.store', msg: 'useCiModeStore must export toggleMode' });
  }
  if (!s.includes(`'ci-care-indeed-mode'`)) {
    issues.push({ level: 'warn', rule: 'mode.persistence', msg: 'Mode should persist to localStorage key ci-care-indeed-mode' });
  }
} catch {
  issues.push({ level: 'fail', rule: 'mode.store', msg: 'src/policy/stores/ciModeStore.ts not found' });
}

// ── 3-5. CommandCenterLayout invariants ──────────────────────────
const layoutPath = join(SRC, 'policy/components/CommandCenterLayout.tsx');
const layout = read(layoutPath);
if (!layout.includes('document.documentElement.dataset.ciMode')) {
  issues.push({ level: 'fail', rule: 'layout.ci-mode-attr', file: layoutPath, msg: 'CommandCenterLayout must set document.documentElement.dataset.ciMode' });
}
if (!layout.includes('document.documentElement.dataset.theme')) {
  issues.push({ level: 'fail', rule: 'layout.brand-attr', file: layoutPath, msg: 'CommandCenterLayout must still set data-theme (brand toggle)' });
}
if (!/onClick=\{toggleTheme\}/.test(layout)) {
  issues.push({ level: 'fail', rule: 'layout.brand-toggle', file: layoutPath, msg: 'Logo click brand toggle missing from CommandCenterLayout' });
}
if (!layout.includes('ThemeModeToggle')) {
  issues.push({ level: 'fail', rule: 'layout.mode-toggle', file: layoutPath, msg: 'ThemeModeToggle must be rendered in shell header' });
}
if (!/\{isLight\s*&&\s*<ThemeModeToggle/.test(layout)) {
  issues.push({ level: 'warn', rule: 'layout.mode-toggle.gating', file: layoutPath, msg: 'ThemeModeToggle should be gated to isLight (Care Indeed brand)' });
}

// Files exempted from raw hex / rgb scan (rule 11). These either own their
// own brand surface (eCign navy/orange per its standalone product), are
// print/PDF builders where vector colours must be exact, or are the
// verifier itself / generated outputs.
const HEX_SCAN_EXEMPT = new RegExp(
  [
    '^src/policy/components/FormSigningWorkspace\\.tsx$',
    '^src/policy/components/FormSignatureContext\\.tsx$',
    '^src/policy/components/FormViewer\\.tsx$',
    '^src/policy/pages/.*Print.*\\.tsx$',
    '^src/policy/pages/FormPrintView\\.tsx$',
    '^src/policy/pages/PrintPage\\.tsx$',
    '^src/policy/ecign/.*$',
    '^src/policy/print/.*$',
    '^src/policy/data/.*\\.generated\\..*$',
    '^src/policy/autogen/.*$',
    '^scripts/.*$',
    '^server/.*$',
  ].join('|'),
);

// Per-file glass-stack budget (rule 12). Sum of inline `backdropFilter`
// declarations + Tailwind `backdrop-blur-*` class occurrences per file.
// MVP §C1: max 3 glass layers total, Layer 3 portal-only. >3 in a single
// file is a strong signal that a surface is stacking glass on glass.
const GLASS_STACK_BUDGET = 3;

// ── 7-12. Source scans ────────────────────────────────────────────
for (const file of files) {
  if (file.endsWith('.css')) continue;
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  const text = read(file);
  const lines = text.split(/\r?\n/);

  let glassStackHits = 0;

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];

    // 7. text-black + bg-black on same element
    if (/className=.*\btext-black\b.*\bbg-black\b/.test(ln) ||
        /className=.*\bbg-black\b.*\btext-black\b/.test(ln)) {
      issues.push({ level: 'warn', rule: 'a11y.black-on-black', file: rel, line: i + 1, msg: 'text-black on bg-black; use --ci-text-primary on --ci-bg' });
    }

    // 8. inline #000 background
    if (/background:\s*['"]#000['"]/i.test(ln) || /backgroundColor:\s*['"]#000['"]/i.test(ln)) {
      issues.push({ level: 'warn', rule: 'a11y.inline-black', file: rel, line: i + 1, msg: 'Hardcoded inline #000 background; use var(--ci-bg) or var(--ci-surface)' });
    }

    // 10. EntityLink-style cyan classes outside the primitive
    if (!file.endsWith('EntityLink.tsx')) {
      if (/text-cyan-300|text-cyan-700/.test(ln) && /<EntityLink|EntityLink\s+/.test(text)) {
        // Only flag once per file
        if (!issues.some(x => x.file === rel && x.rule === 'links.cyan-override')) {
          issues.push({ level: 'warn', rule: 'links.cyan-override', file: rel, line: i + 1, msg: 'EntityLink caller overrides link colour; prefer omitting className so token --ci-link applies' });
        }
      }
    }

    // 11. Raw hex / rgb in className or style (Stabilization D-01 / MVP §4 L810)
    if (!HEX_SCAN_EXEMPT.test(rel)) {
      // Hex literals: #abc, #aabbcc, #aabbccdd in JSX-attribute string contexts.
      // Match conservatively — only inside quoted values to avoid hashbang/anchor noise.
      const hexInValue = /['"`][^'"`]*?#[0-9A-Fa-f]{3,8}\b[^'"`]*?['"`]/.exec(ln);
      if (hexInValue && /(className|style|background|color|border|fill|stroke)/i.test(ln)) {
        if (!issues.some(x => x.file === rel && x.rule === 'tokens.hex-literal' && x.line === i + 1)) {
          issues.push({
            level: 'warn',
            rule: 'tokens.hex-literal',
            file: rel,
            line: i + 1,
            msg: 'Raw hex literal in className/style; replace with var(--ci-*) token',
          });
        }
      }
      // rgb()/rgba() in style attributes
      const rgbInValue = /(rgb|rgba)\s*\([^)]*\)/.exec(ln);
      if (rgbInValue && /(className|style|background|color|border|fill|stroke)/i.test(ln)) {
        if (!issues.some(x => x.file === rel && x.rule === 'tokens.rgb-literal' && x.line === i + 1)) {
          issues.push({
            level: 'warn',
            rule: 'tokens.rgb-literal',
            file: rel,
            line: i + 1,
            msg: 'Raw rgb()/rgba() in className/style; replace with var(--ci-*) token',
          });
        }
      }
    }

    // 12. Glass-stack density count (Stabilization D-03 / MVP §C1)
    if (/backdropFilter\s*:/.test(ln)) glassStackHits += 1;
    const blurMatches = ln.match(/\bbackdrop-blur(?:-[a-z0-9]+)?\b/g);
    if (blurMatches) glassStackHits += blurMatches.length;
  }

  // 9. PM right panel slate hardcoding
  if (rel.startsWith('src/policy/components/pm/') && /bg-slate-(900|800|400)\b/.test(text)) {
    if (!issues.some(x => x.file === rel && x.rule === 'pm.slate-pin')) {
      issues.push({ level: 'warn', rule: 'pm.slate-pin', file: rel, msg: 'PM file pins slate-* palette; migrate panel surface to <GlassPanel> + --ci-* tokens' });
    }
  }

  // 12 (file-level emit): glass-stack budget exceeded
  if (glassStackHits > GLASS_STACK_BUDGET && !HEX_SCAN_EXEMPT.test(rel)) {
    issues.push({
      level: 'warn',
      rule: 'glass.stack-budget',
      file: rel,
      msg: `Glass-stack hits ${glassStackHits} (>${GLASS_STACK_BUDGET}). MVP §C1: max 3 layers; Layer 3 portal-only. Audit nested backdrop-filter/backdrop-blur usage.`,
    });
  }
}

// ── 6. ThemeModeToggle exists ────────────────────────────────────
try {
  const t = read(join(SRC, 'policy/components/ui/ThemeModeToggle.tsx'));
  if (!t.includes('useCiModeStore')) {
    issues.push({ level: 'fail', rule: 'toggle.uses-store', msg: 'ThemeModeToggle must use useCiModeStore' });
  }
} catch {
  issues.push({ level: 'fail', rule: 'toggle.exists', msg: 'src/policy/components/ui/ThemeModeToggle.tsx not found' });
}

// ── Report ───────────────────────────────────────────────────────
const fails = issues.filter(i => i.level === 'fail');
const warns = issues.filter(i => i.level === 'warn');

console.log('\n=== Care Indeed UI Design System verifier ===\n');

if (fails.length === 0) {
  console.log('FAIL checks: 0  ✓ all required invariants hold');
} else {
  console.log(`FAIL checks: ${fails.length}`);
  for (const f of fails) {
    console.log(`  ✗ [${f.rule}] ${f.file ?? ''}${f.line ? ':' + f.line : ''} — ${f.msg}`);
  }
}
console.log(`\nWARN checks: ${warns.length}`);
const grouped = new Map<string, Issue[]>();
for (const w of warns) {
  const arr = grouped.get(w.rule) ?? [];
  arr.push(w);
  grouped.set(w.rule, arr);
}
for (const [rule, arr] of grouped) {
  console.log(`  • ${rule} (${arr.length})`);
  for (const w of arr.slice(0, 5)) {
    console.log(`      - ${w.file ?? ''}${w.line ? ':' + w.line : ''} — ${w.msg}`);
  }
  if (arr.length > 5) console.log(`      …and ${arr.length - 5} more`);
}

console.log('');
process.exit(fails.length === 0 ? 0 : 1);
