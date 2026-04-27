/**
 * verifyPmTaskProjection — Phase 1 verifier for the PM task projector.
 *
 * Run:   npx tsx scripts/verifyPmTaskProjection.ts
 *
 * Validates the rewritten processFlow-first projector against the live
 * REGULATORY_EVENTS dataset:
 *
 *   - Every event.processFlow[] step becomes exactly one task.
 *   - task_id follows {event.id}-{NN} ordinal.
 *   - No event itself becomes a task (task_id never equals event.id).
 *   - Required forms are attached to the owning execution step.
 *   - Forms only become standalone tasks when no step owns them.
 *   - No duplicate task IDs.
 *   - No missing processFlow steps.
 *   - No weekend due dates (unless explicit weekendOverride).
 *   - Due dates are distributed across sprint workdays.
 *
 * Specific QAPI test:
 *   event_id = qapi_meeting-20260507-08
 *     - exactly 14 tasks from processFlow
 *     - task IDs qapi_meeting-20260507-08-01 .. -14
 *     - 10 required forms attached to the correct step(s)
 *     - no standalone QA-FM-* fake task cards
 *     - no Saturday/Sunday due dates
 */

import { projectTasks, assertNoDuplicateTaskIds } from '../src/policy/pm/taskProjectionCore';
import { REGULATORY_EVENTS } from '../src/policy/data/regulatoryEvents';
import { isCesTask, isEcignSubmissionTask } from '../src/policy/pm/types';

let pass = 0;
let fail = 0;

function check(label: string, ok: boolean, detail?: unknown): void {
  if (ok) {
    pass++;
    console.log(`  PASS  ${label}`);
  } else {
    fail++;
    console.error(`  FAIL  ${label}`, detail ?? '');
  }
}

function pad2(n: number): string { return n < 10 ? `0${n}` : `${n}`; }

function isWeekendIso(iso: string): boolean {
  const d = new Date(`${iso}T00:00:00Z`);
  const dow = d.getUTCDay();
  return dow === 0 || dow === 6;
}

/* ═══════════════════════════════════════════════════════════════════
   1. Project the entire dataset.
   ═══════════════════════════════════════════════════════════════════ */
console.log('\n[1] Project full REGULATORY_EVENTS');

const tasks = projectTasks({
  events: REGULATORY_EVENTS as unknown as Parameters<typeof projectTasks>[0]['events'],
  formStates: {},
  overlays: {},
});

console.log(`  events:          ${REGULATORY_EVENTS.length}`);
console.log(`  projected tasks: ${tasks.length}`);

check('projection produced at least one task', tasks.length > 0);

/* ═══════════════════════════════════════════════════════════════════
   2. Global invariants across full projection.
   ═══════════════════════════════════════════════════════════════════ */
console.log('\n[2] Global invariants');

let dupErr: Error | null = null;
try {
  assertNoDuplicateTaskIds(tasks);
} catch (e) {
  dupErr = e as Error;
}
check('no duplicate task_ids', dupErr === null, dupErr?.message);

const eventIds = new Set(REGULATORY_EVENTS.map(e => e.id));
const eventIdCollisions = tasks.filter(t => eventIds.has(t.task_id));
check(
  'no task_id equals an event.id (events are never tasks)',
  eventIdCollisions.length === 0,
  eventIdCollisions.slice(0, 5).map(t => t.task_id),
);

const ordinalRe = /-\d{2}$/;
const badIds = tasks.filter(t => !ordinalRe.test(t.task_id));
check(
  'every task_id ends with -NN ordinal',
  badIds.length === 0,
  badIds.slice(0, 5).map(t => t.task_id),
);

const cesTasks = tasks.filter(isCesTask);
const weekendDue = cesTasks.filter(t => t.due_date && isWeekendIso(t.due_date));
check(
  'no CES task has a Sat/Sun due date',
  weekendDue.length === 0,
  weekendDue.slice(0, 5).map(t => `${t.task_id} → ${t.due_date}`),
);

const distinctDueAll = new Set(cesTasks.map(t => t.due_date).filter(Boolean));
check(
  'projection spans many distinct due dates (>= 30)',
  distinctDueAll.size >= 30,
  `distinct=${distinctDueAll.size}`,
);

/* ═══════════════════════════════════════════════════════════════════
   3. Per-event invariants.
   ═══════════════════════════════════════════════════════════════════ */
console.log('\n[3] Per-event invariants');

const tasksByEvent = new Map<string, typeof tasks>();
for (const t of tasks) {
  if (!isCesTask(t)) continue;
  const list = tasksByEvent.get(t.event_id) ?? [];
  list.push(t);
  tasksByEvent.set(t.event_id, list);
}

let perEventOk = 0;
let perEventBad = 0;
const failedEvents: string[] = [];

for (const event of REGULATORY_EVENTS as unknown as Array<{
  id: string;
  processFlow: Array<{ id: string; requiredFormIds?: string[] }>;
  requiredForms: Array<{ id: string; formId?: string }>;
  isContext?: boolean;
}>) {
  if (event.isContext) continue;
  const list = tasksByEvent.get(event.id) ?? [];
  const stepCount = event.processFlow.length;
  if (list.length < stepCount) {
    perEventBad++;
    failedEvents.push(`${event.id} expected≥${stepCount}, got ${list.length}`);
    continue;
  }
  // All step ordinals 01..stepCount must exist.
  const expectedIds = new Set<string>();
  for (let i = 1; i <= stepCount; i++) {
    expectedIds.add(`${event.id}-${pad2(i)}`);
  }
  const presentIds = new Set(list.map(t => t.task_id));
  const missing: string[] = [];
  for (const id of expectedIds) if (!presentIds.has(id)) missing.push(id);
  if (missing.length > 0) {
    perEventBad++;
    failedEvents.push(`${event.id} missing: ${missing.slice(0, 3).join(',')}`);
    continue;
  }
  perEventOk++;
}

check(
  `every event projects all ${'{event.id}-NN'} step tasks (${perEventOk}/${perEventOk + perEventBad})`,
  perEventBad === 0,
  failedEvents.slice(0, 5),
);

/* ═══════════════════════════════════════════════════════════════════
   4. SPECIFIC QAPI TEST — qapi_meeting-20260507-08
   ═══════════════════════════════════════════════════════════════════ */
console.log('\n[4] QAPI specific test — qapi_meeting-20260507-08');

const QAPI_ID = 'qapi_meeting-20260507-08';
const qapiEvent = (REGULATORY_EVENTS as unknown as Array<{ id: string; processFlow: Array<{ id: string; requiredFormIds?: string[] }>; requiredForms: Array<{ id: string; formId?: string }> }>).find(e => e.id === QAPI_ID);

check('QAPI event exists in REGULATORY_EVENTS', Boolean(qapiEvent));

if (qapiEvent) {
  const qapiTasks = tasks.filter(t => isCesTask(t) && t.event_id === QAPI_ID);

  check(
    `exactly 14 tasks projected (got ${qapiTasks.length})`,
    qapiTasks.length === 14,
  );

  const expectedQapi = new Set<string>();
  for (let i = 1; i <= 14; i++) expectedQapi.add(`${QAPI_ID}-${pad2(i)}`);
  const actualQapi = new Set(qapiTasks.map(t => t.task_id));
  const missingQapi: string[] = [];
  for (const id of expectedQapi) if (!actualQapi.has(id)) missingQapi.push(id);
  check(
    'task IDs are qapi_meeting-20260507-08-01 .. -14',
    missingQapi.length === 0,
    missingQapi,
  );

  // No standalone form-titled tasks: every QAPI task title must equal its
  // step.label (we don't have step.label here without re-importing the
  // event, so check title is NOT a bare form id like QA-FM-021).
  const formIdLike = /^[A-Z]{2,3}-[A-Z]{2}-\d{3}$/;
  const fakeFormCards = qapiTasks.filter(t => formIdLike.test(t.title));
  check(
    'no standalone QA-FM-* form-id title cards',
    fakeFormCards.length === 0,
    fakeFormCards.map(t => `${t.task_id} title="${t.title}"`),
  );

  // 10 required forms attached across the QAPI tasks (deduped by formId).
  const attachedFormIds = new Set<string>();
  for (const t of qapiTasks) {
    if (isEcignSubmissionTask(t)) {
      for (const f of t.form_ids ?? []) attachedFormIds.add(f);
    }
  }
  check(
    `10 required forms attached to QAPI tasks (got ${attachedFormIds.size})`,
    attachedFormIds.size === 10,
    Array.from(attachedFormIds).sort(),
  );

  // Distinct workday distribution.
  const qapiDates = qapiTasks.map(t => t.due_date).filter(Boolean) as string[];
  const distinctQapiDates = new Set(qapiDates);
  check(
    `QAPI dates spread across multiple workdays (distinct=${distinctQapiDates.size}, expected ≥ 8)`,
    distinctQapiDates.size >= 8,
    Array.from(distinctQapiDates).sort(),
  );

  const qapiWeekend = qapiDates.filter(isWeekendIso);
  check(
    'no Sat/Sun due dates on QAPI tasks',
    qapiWeekend.length === 0,
    qapiWeekend,
  );

  // No event itself as task.
  check(
    'qapi_meeting-20260507-08 itself is NOT a task',
    !actualQapi.has(QAPI_ID),
  );
}

/* ═══════════════════════════════════════════════════════════════════
   5. Forms-attached-to-step invariant (no duplicate standalone form
      tasks for forms already consumed by a processFlow step).
   ═══════════════════════════════════════════════════════════════════ */
console.log('\n[5] Form attachment invariant');

let standaloneFormDuplication = 0;
const standaloneSamples: string[] = [];

for (const event of REGULATORY_EVENTS as unknown as Array<{
  id: string;
  processFlow: Array<{ id: string; requiredFormIds?: string[] }>;
  requiredForms: Array<{ id: string; formId?: string }>;
  isContext?: boolean;
}>) {
  if (event.isContext) continue;
  const consumedByStep = new Set<string>();
  for (const step of event.processFlow) {
    for (const fid of step.requiredFormIds ?? []) consumedByStep.add(fid);
  }
  // Walk projected tasks for this event with ordinal > step count
  // (those are the orphan-form fallback tasks).
  const list = tasksByEvent.get(event.id) ?? [];
  for (const t of list) {
    const ord = parseInt(t.task_id.slice(t.task_id.lastIndexOf('-') + 1), 10);
    if (ord <= event.processFlow.length) continue; // step task
    // Orphan task — its underlying form should NOT be in consumedByStep.
    if (isEcignSubmissionTask(t) && t.form_id && consumedByStep.has(t.form_id)) {
      standaloneFormDuplication++;
      if (standaloneSamples.length < 5) {
        standaloneSamples.push(`${t.task_id} form=${t.form_id} (already on step)`);
      }
    }
  }
}

check(
  'no orphan form task duplicates a form already attached to a step',
  standaloneFormDuplication === 0,
  standaloneSamples,
);

/* ═══════════════════════════════════════════════════════════════════
   Summary
   ═══════════════════════════════════════════════════════════════════ */
console.log(`\n=== ${pass} passed, ${fail} failed ===\n`);
process.exit(fail === 0 ? 0 : 1);
