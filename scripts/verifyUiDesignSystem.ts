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
 *
 * Run: tsx --tsconfig tsconfig.app.json scripts/verifyUiDesignSystem.ts
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

// ── 7-10. Source scans ────────────────────────────────────────────
for (const file of files) {
  if (file.endsWith('.css')) continue;
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  const text = read(file);
  const lines = text.split(/\r?\n/);

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
  }

  // 9. PM right panel slate hardcoding
  if (rel.startsWith('src/policy/components/pm/') && /bg-slate-(900|800|400)\b/.test(text)) {
    if (!issues.some(x => x.file === rel && x.rule === 'pm.slate-pin')) {
      issues.push({ level: 'warn', rule: 'pm.slate-pin', file: rel, msg: 'PM file pins slate-* palette; migrate panel surface to <GlassPanel> + --ci-* tokens' });
    }
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
