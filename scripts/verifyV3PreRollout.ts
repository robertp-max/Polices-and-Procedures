import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures: string[] = [];

function read(rel: string): string {
  return readFileSync(path.resolve(root, rel), 'utf8');
}

function requireFile(rel: string): void {
  if (!existsSync(path.resolve(root, rel))) failures.push(`Missing required V3 rollout file: ${rel}`);
}

requireFile('src/policy/components/pm/V3TaskDetailPanel.tsx');
requireFile('Builder/_system/uat/v3-visual-smoke.spec.ts');

const board = read('src/policy/ces/components/board/SprintExecutionBoard.tsx');
if (board.includes("from '../details/WorkflowDrawer'") || board.includes('<WorkflowDrawer')) {
  failures.push('SprintExecutionBoard still uses the bespoke CES WorkflowDrawer path.');
}
if (!board.includes('useSelectedTaskStore') || !board.includes('useProjectedTasks')) {
  failures.push('SprintExecutionBoard must open canonical projected PM task IDs through selectedTaskStore.');
}

const globalDrawer = read('src/policy/components/pm/GlobalTaskDrawer.tsx');
if (!globalDrawer.includes('V3StackedDrawerHost') || !globalDrawer.includes('V3TaskDetailPanel')) {
  failures.push('GlobalTaskDrawer must use V3StackedDrawerHost with V3TaskDetailPanel.');
}

const indexCss = read('src/index.css');
if (!indexCss.includes('@media (forced-colors: active)')) {
  failures.push('Missing forced-colors support for V3 glass surfaces.');
}
if (!indexCss.includes('@media (prefers-contrast: more)')) {
  failures.push('Missing prefers-contrast support for V3 glass surfaces.');
}

const rightDrawer = read('src/policy/components/ui/RightDrawer.tsx');
const veilModal = read('src/policy/components/ui/VeilModal.tsx');
if (!rightDrawer.includes("e.key !== 'Tab'") || !rightDrawer.includes('panelRef')) {
  failures.push('RightDrawer is missing the focus trap guard.');
}
if (!veilModal.includes("e.key !== 'Tab'") || !veilModal.includes('openerRef')) {
  failures.push('VeilModal is missing focus trap / focus return support.');
}

if (failures.length) {
  console.error('[verify:v3-pre-rollout] FAIL');
  failures.forEach(failure => console.error(`  - ${failure}`));
  process.exitCode = 1;
} else {
  console.log('[verify:v3-pre-rollout] PASS');
}

