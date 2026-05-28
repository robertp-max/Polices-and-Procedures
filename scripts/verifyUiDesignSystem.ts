/**
 * verifyUiDesignSystem — guards the app-wide V3-only design contract.
 *
 * V3 is the sole production design system. V4 can add a normal/light mode
 * later, but the current production verifier should fail old parallel design
 * assumptions instead of preserving them.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.')) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, out);
    else if (/\.(ts|tsx|css)$/.test(entry)) out.push(path);
  }
  return out;
}

const read = (path: string) => readFileSync(path, 'utf8');
const files = walk(SRC);
const indexCss = read(join(SRC, 'index.css'));
const layoutPath = join(SRC, 'policy/components/CommandCenterLayout.tsx');
const layout = read(layoutPath);
const evidencePagePath = join(SRC, 'policy/pages/EvidenceCenterPage.tsx');
const evidencePage = read(evidencePagePath);
const evidenceHierarchyPath = join(SRC, 'policy/components/evidence/CesEvidenceHierarchyPanel.tsx');
const evidenceHierarchy = read(evidenceHierarchyPath);
const masterCalendarPath = join(SRC, 'policy/pages/MasterCalendarPage.tsx');
const masterCalendar = read(masterCalendarPath);
const globalTaskDrawerPath = join(SRC, 'policy/components/pm/GlobalTaskDrawer.tsx');
const globalTaskDrawer = read(globalTaskDrawerPath);

for (const token of [
  '--v3-base-bg',
  '--v3-glass-card',
  '--v3-glass-blur',
  '--v3-border-subtle',
  '--v3-teal-light',
  '--v3-text-primary',
  '--v3-text-secondary',
  '--v3-text-tertiary',
]) {
  if (!indexCss.includes(token)) {
    issues.push({ level: 'fail', rule: 'v3.tokens', msg: `Missing V3 token ${token} in src/index.css` });
  }
}

if (!layout.includes(`dataset.theme = 'v3-veil'`)) {
  issues.push({ level: 'fail', rule: 'layout.v3-theme', file: relative(ROOT, layoutPath), msg: 'CommandCenterLayout must force data-theme to v3-veil.' });
}
if (!layout.includes(`dataset.ciMode = 'v3'`)) {
  issues.push({ level: 'fail', rule: 'layout.v3-mode', file: relative(ROOT, layoutPath), msg: 'CommandCenterLayout must force data-ci-mode to v3.' });
}
if (/onClick=\{toggleTheme\}/.test(layout)) {
  issues.push({ level: 'fail', rule: 'layout.legacy-toggle', file: relative(ROOT, layoutPath), msg: 'Brand/theme toggle must not remain a production design control.' });
}

if (/Upload evidence/.test(evidencePage)) {
  issues.push({ level: 'fail', rule: 'evidence.no-global-upload', file: relative(ROOT, evidencePagePath), msg: 'Evidence Center must not expose a global upload action; upload belongs in task-scoped CES drawers.' });
}
if (!/role="tree"/.test(evidenceHierarchy) || !/aria-expanded=/.test(evidenceHierarchy)) {
  issues.push({ level: 'fail', rule: 'evidence.tree-a11y', file: relative(ROOT, evidenceHierarchyPath), msg: 'Evidence hierarchy must expose a tree role and expanded state.' });
}
if (/<TaskDetailRightPanel\b/.test(masterCalendar)) {
  issues.push({ level: 'fail', rule: 'drawers.no-nested-task-panel', file: relative(ROOT, masterCalendarPath), msg: 'Use TaskDetailContent inside drawer shells; do not mount TaskDetailRightPanel inside another drawer.' });
}
if (!/V3StackedDrawerHost/.test(globalTaskDrawer)) {
  issues.push({ level: 'fail', rule: 'drawers.stacked-host', file: relative(ROOT, globalTaskDrawerPath), msg: 'Global task drawer must route through V3StackedDrawerHost.' });
}

const EXEMPT = new RegExp([
  '^src/ui-staging/.*$',
  '^src/policy/pages/.*Print.*\\.tsx$',
  '^src/policy/pages/FormPrintView\\.tsx$',
  '^src/policy/pages/PrintPage\\.tsx$',
  '^src/policy/ecign/.*$',
  '^src/policy/print/.*$',
  '^src/policy/data/.*\\.generated\\..*$',
  '^src/policy/autogen/.*$',
  '.*\\.old\\.tsx$',
].join('|'));

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  if (EXEMPT.test(rel)) continue;
  const text = read(file);
  const lines = text.split(/\r?\n/);

  if (/glassVariant\s*=\s*['"]ci-ion['"]/.test(text)) {
    issues.push({ level: 'fail', rule: 'legacy.drawer-variant', file: rel, msg: 'Drawer/modal call site opts into legacy ci-ion variant.' });
  }
  if (/ThemeModeToggle/.test(text)) {
    issues.push({ level: 'fail', rule: 'legacy.mode-toggle', file: rel, msg: 'ThemeModeToggle should not be rendered in V3-only production.' });
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/translateY\(|translateX\(|scale\(|boxShadow\s*:|box-shadow\s*:/.test(line)) {
      issues.push({ level: 'warn', rule: 'v3.depth-motion', file: rel, line: index + 1, msg: 'Potential V3 depth/motion anti-pattern; use opacity/color/blur only.' });
    }
    if (/data-theme=.*care-indeed-light|ci-ion-dark|care-indeed-light/.test(line)) {
      issues.push({ level: 'warn', rule: 'legacy.theme-reference', file: rel, line: index + 1, msg: 'Legacy theme reference remains; make it inert or migrate to V3.' });
    }
    if (/className=.*\bbg-white\b|background:\s*['"]#fff/i.test(line)) {
      issues.push({ level: 'warn', rule: 'legacy.light-surface', file: rel, line: index + 1, msg: 'Hardcoded light surface remains; verify it is print/document-only or migrate to V3.' });
    }
    if (/aria-selected=\{active\}/.test(line)) {
      issues.push({ level: 'fail', rule: 'a11y.aria-selected-string', file: rel, line: index + 1, msg: 'Use aria-selected={active ? "true" : "false"} for tab state.' });
    }
    if (/aria-modal=\{!inline\}/.test(line)) {
      issues.push({ level: 'fail', rule: 'a11y.aria-modal-inline', file: rel, line: index + 1, msg: 'Inline detail panels must omit aria-modal instead of binding it to a boolean expression.' });
    }
  }
}

const fails = issues.filter(issue => issue.level === 'fail');
const warns = issues.filter(issue => issue.level === 'warn');

console.log('\n=== V3-only UI Design System verifier ===\n');
console.log(`FAIL checks: ${fails.length}`);
for (const fail of fails) {
  console.log(`  x [${fail.rule}] ${fail.file ?? ''}${fail.line ? `:${fail.line}` : ''} - ${fail.msg}`);
}

console.log(`\nWARN checks: ${warns.length}`);
for (const warn of warns.slice(0, 120)) {
  console.log(`  ! [${warn.rule}] ${warn.file ?? ''}${warn.line ? `:${warn.line}` : ''} - ${warn.msg}`);
}
if (warns.length > 120) {
  console.log(`  ... ${warns.length - 120} more warnings`);
}

if (fails.length > 0) process.exit(1);
