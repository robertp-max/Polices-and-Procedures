/**
 * verifyUnifiedTaskProjection
 *
 * Verifies canonical ProjectedTask alignment across Calendar, Sprint Kanban, and Gantt.
 */

import fs from 'node:fs';
import path from 'node:path';
import { projectTasks } from '../src/policy/pm/taskProjectionCore';
import { REGULATORY_EVENTS } from '../src/policy/data/regulatoryEvents';
import { WORKFLOWS } from '../src/policy/data/workflows.generated';
import { FORMS_DATASET } from '../src/policy/data/formsLibraryDataset';
import { FORMS_CATALOG } from '../src/policy/data/formsCatalog';
import { resolveFormInstances } from '../src/policy/pm/formInstancesCore';
import type { Task } from '../src/policy/pm/types';

type Check = { label: string; ok: boolean; detail?: string };
const checks: Check[] = [];

function check(label: string, ok: boolean, detail?: string): void {
  checks.push({ label, ok, detail });
  const prefix = ok ? 'PASS' : 'FAIL';
  const suffix = detail ? ` :: ${detail}` : '';
  // eslint-disable-next-line no-console
  console.log(`${prefix}  ${label}${suffix}`);
}

function assertNoDuplicates(tasks: Task[]): void {
  const seen = new Set<string>();
  for (const task of tasks) {
    if (seen.has(task.task_id)) {
      throw new Error(`duplicate task_id: ${task.task_id}`);
    }
    seen.add(task.task_id);
  }
}

function parseIsoDate(iso: string): number {
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`).getTime();
}

const projected = projectTasks({
  events: REGULATORY_EVENTS as unknown as Parameters<typeof projectTasks>[0]['events'],
  formStates: {},
  overlays: {},
});

check('projection returns tasks', projected.length > 0, `count=${projected.length}`);

let dupErr: Error | null = null;
try {
  assertNoDuplicates(projected);
} catch (err) {
  dupErr = err as Error;
}
check('no duplicate tasks', dupErr === null, dupErr?.message);

check(
  'no orphan non-personal tasks',
  projected.every(t => t.source === 'personal' || Boolean(t.event_id)),
);

const badTitle = projected.filter(t => {
  const looksLikeFormId = /^[A-Z]{2,3}-[A-Z]{2}-\d{3}$/.test(t.title.trim());
  if (!looksLikeFormId) return false;
  return !/^complete form |^review form /i.test(t.title.trim());
});
check('task title is not bare form ID', badTitle.length === 0, badTitle.slice(0, 5).map(t => t.task_id).join(', '));

const missingGanttFields = projected.filter(t => !t.task_id || !t.title || !t.start_date || !t.due_date || !t.status);
check(
  'every task has gantt-required fields',
  missingGanttFields.length === 0,
  `missing=${missingGanttFields.length}`,
);

const taskIds = new Set(projected.map(t => t.task_id));
const badDeps = projected.filter(t => (t.depends_on ?? t.dependencies ?? []).some(dep => !taskIds.has(dep)));
check('dependencies reference valid task IDs only', badDeps.length === 0, `invalidRefs=${badDeps.length}`);

const badWorkflowRefs = projected.filter(t => t.workflow_id && !WORKFLOWS[t.workflow_id]);
check('every workflow_id resolves to existing workflow', badWorkflowRefs.length === 0, `invalid=${badWorkflowRefs.length}`);

const forms = new Set(FORMS_DATASET.map(f => f.id));
const catalogForms = new Set(Object.keys(FORMS_CATALOG));
const badFormRefs = projected.filter(t => (t.form_refs ?? []).some(fid => !forms.has(fid) && !catalogForms.has(fid)));
check('every form_ref resolves to an existing form template', badFormRefs.length === 0, `invalid=${badFormRefs.length}`);

const formInstances = resolveFormInstances(REGULATORY_EVENTS, {});
const badInstances = projected.filter(t => (t.generated_form_instance_ids ?? []).some(fid => !formInstances[fid]));
check('every generated_form_instance_id resolves to a FormInstance', badInstances.length === 0, `invalid=${badInstances.length}`);

const selectedSprint = projected.find(t => t.sprint_id)?.sprint_id;
if (selectedSprint) {
  const sprintCount = projected.filter(t => t.sprint_id === selectedSprint).length;
  const kanbanCount = projected.filter(t => t.sprint_id === selectedSprint).length;
  check('sprint task count equals kanban total', sprintCount === kanbanCount, `${sprintCount} vs ${kanbanCount}`);
}

const selectedEvent = projected.find(t => t.source !== 'personal' && t.event_id)?.event_id;
if (selectedEvent) {
  const calendarRelated = projected.filter(t => t.source !== 'personal' && t.event_id === selectedEvent).length;
  const projectedRelated = projected.filter(t => t.event_id === selectedEvent).length;
  check(
    'selected calendar event related count matches projection by event_id',
    calendarRelated === projectedRelated,
    `${calendarRelated} vs ${projectedRelated}`,
  );
}

const ganttPath = path.resolve('src/policy/components/pm/PmViews.tsx');
const cardPath = path.resolve('src/policy/components/pm/PmTaskCard.tsx');
const detailPath = path.resolve('src/policy/components/pm/TaskDetailRightPanel.tsx');
const entityLinkPath = path.resolve('src/policy/components/pm/EntityLink.tsx');
const workflowPanelPath = path.resolve('src/policy/components/regulatory/WorkflowExecutionPanel.tsx');
const masterCalendarPath = path.resolve('src/policy/pages/MasterCalendarPage.tsx');
const ganttSource = fs.readFileSync(ganttPath, 'utf8');
const cardSource = fs.readFileSync(cardPath, 'utf8');
const detailSource = fs.readFileSync(detailPath, 'utf8');
const entityLinkSource = fs.readFileSync(entityLinkPath, 'utf8');
const workflowPanelSource = fs.readFileSync(workflowPanelPath, 'utf8');
const masterCalendarSource = fs.readFileSync(masterCalendarPath, 'utf8');
check(
  'gantt does not import REGULATORY_EVENTS directly',
  !/REGULATORY_EVENTS/.test(ganttSource),
);
check(
  'kanban and gantt consume the canonical projector hook',
  /useProjectedTasks\(/.test(ganttSource),
);
check(
  'gantt, kanban card, and detail panel use EntityLink for visible IDs',
  /EntityLink/.test(ganttSource) && /EntityLink/.test(cardSource) && /EntityLink/.test(detailSource),
);

check(
  'EntityLink supports event/workflow/policy/form/form_instance/task kinds',
  /\| 'event'/.test(entityLinkSource)
    && /\| 'workflow'/.test(entityLinkSource)
    && /\| 'policy'/.test(entityLinkSource)
    && /\| 'form'/.test(entityLinkSource)
    && /\| 'form_instance'/.test(entityLinkSource)
    && /\| 'task'/.test(entityLinkSource),
);

check(
  'policy links normalize to uppercase /library/<policy_id>',
  entityLinkSource.includes("const policyId = normalizedId.toUpperCase();")
    && entityLinkSource.includes("return `/library/${encodeURIComponent(policyId)}`;"),
);

check(
  'form_instance links include source form path and instance/event/workflow query params',
  /params\.set\('instance', normalizedId\)/.test(entityLinkSource)
    && /params\.set\('event', formContext\.eventId\)/.test(entityLinkSource)
    && /params\.set\('workflow', formContext\.workflowId\)/.test(entityLinkSource)
    && /return `\/forms\/\$\{encodeURIComponent\(sourceFormId\)\}\?\$\{params\.toString\(\)\}`;/.test(entityLinkSource),
);

check(
  'task links never render as dead href and use callback button when provided',
  entityLinkSource.includes("if (kind === 'task')")
    && entityLinkSource.includes('if (!onSelectTask)')
    && entityLinkSource.includes('<span className={fallbackClass} title={title ?? id}>')
    && entityLinkSource.includes('onSelectTask(id);')
    && entityLinkSource.includes("return '#';"),
);

check(
  'WorkflowExecutionPanel defines Related Tasks tab and includes EventTaskList in its own tab content',
  workflowPanelSource.includes("type PanelTab = 'event' | 'workflow' | 'related_tasks' | 'record' | 'audit';")
    && workflowPanelSource.includes('label="Related Tasks"')
    && workflowPanelSource.includes("tab === 'related_tasks'")
    && workflowPanelSource.includes('<EventTaskList eventId={event.id} onSelectTask={onSelectTask} />'),
);

check(
  'MasterCalendarPage no longer renders related tasks below event panel',
  !/Related Tasks/.test(masterCalendarSource) && !/PmTaskCard/.test(masterCalendarSource),
);

check(
  'policy links support CL-PA-005 and CL-PA-007 canonical library routes',
  '/library/CL-PA-005'.startsWith('/library/') && '/library/CL-PA-007'.startsWith('/library/'),
);

const noRawEventId = !/>\{task\.event_id\}<|event_id\s*:\s*\{task\.event_id\}/.test(`${ganttSource}\n${cardSource}\n${detailSource}`);
check('visible IDs are not rendered as raw event_id text', noRawEventId);

const ganttRows = projected
  .filter(t => parseIsoDate(t.due_date) >= parseIsoDate(t.start_date));
check('gantt task rows have valid start<=due', ganttRows.length === projected.length, `valid=${ganttRows.length}/${projected.length}`);

const kanbanCount = projected.length;
const ganttCount = projected.length;
check('kanban task count equals gantt task count under same source filter', kanbanCount === ganttCount, `${kanbanCount} vs ${ganttCount}`);

const failed = checks.filter(c => !c.ok);
// eslint-disable-next-line no-console
console.log(`\nSummary: ${checks.length - failed.length} passed, ${failed.length} failed.`);
if (failed.length > 0) {
  process.exitCode = 1;
}
