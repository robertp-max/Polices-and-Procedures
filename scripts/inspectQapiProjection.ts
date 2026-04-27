/**
 * inspectQapiProjection — debug report for the user's HARD CORRECTION.
 *
 * Prints the full projected task list for every QAPI event in
 * REGULATORY_EVENTS, showing task_id, title, due_date, status, and
 * attached form_ids.
 *
 * Run:   npx tsx scripts/inspectQapiProjection.ts
 */

import { projectTasks } from '../src/policy/pm/taskProjectionCore';
import { REGULATORY_EVENTS } from '../src/policy/data/regulatoryEvents';

const qapi = REGULATORY_EVENTS.filter(e => e.eventSubType === 'qapi_meeting');

console.log(`\nQAPI events found: ${qapi.length}`);
for (const e of qapi) {
  console.log(`  - ${e.id}  steps=${e.processFlow.length}  forms=${e.requiredForms.length}`);
}

const projection = projectTasks({
  events: qapi as unknown as Parameters<typeof projectTasks>[0]['events'],
  formStates: {},
  overlays: {},
});

const eventIds = new Set(REGULATORY_EVENTS.map(e => e.id));
const dueSet = new Set(projection.map(t => t.due_date).filter(Boolean));
const dupCheck = new Set<string>();
const dupes: string[] = [];
for (const t of projection) {
  if (dupCheck.has(t.task_id)) dupes.push(t.task_id);
  dupCheck.add(t.task_id);
}

console.log(`\nTotal projected QAPI tasks: ${projection.length}`);
console.log(`Distinct due dates:          ${dueSet.size}`);
console.log(`Duplicate task_ids:          ${dupes.length === 0 ? 'NONE' : dupes.join(', ')}`);
console.log(`task_ids equal to event.id:  ${projection.filter(t => eventIds.has(t.task_id)).length}`);

const weekend = projection
  .map(t => t.due_date)
  .filter((d): d is string => Boolean(d))
  .filter(d => {
    const dow = new Date(`${d}T00:00:00Z`).getUTCDay();
    return dow === 0 || dow === 6;
  });
console.log(`Weekend due dates:           ${weekend.length === 0 ? 'NONE' : weekend.join(', ')}`);

console.log('\n--- Per-event breakdown ---');
for (const e of qapi) {
  const tasks = projection.filter(t => 'event_id' in t && (t as { event_id: string }).event_id === e.id);
  console.log(`\n[${e.id}]  ${tasks.length} tasks`);
  for (const t of tasks) {
    const formIds = 'form_ids' in t ? (t as { form_ids?: string[] }).form_ids : undefined;
    const stepId = 'step_id' in t ? (t as { step_id?: string }).step_id : undefined;
    console.log(
      `  ${t.task_id.padEnd(34)} due=${(t.due_date ?? '—').padEnd(11)} ` +
      `status=${t.status.padEnd(11)} step=${(stepId ?? '—').padEnd(22)} ` +
      `forms=[${(formIds ?? []).join(',')}]  title="${t.title}"`,
    );
  }
}
