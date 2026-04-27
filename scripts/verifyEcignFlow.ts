/**
 * verifyEcignFlow — manual verification (no test runner installed).
 *
 * Run:   npx tsx scripts/verifyEcignFlow.ts
 *
 * Verifies (per Builder/eCIgn-Centered-Submission/15):
 *   1. Status mapper produces expected UX label table.
 *   2. Weekend rule throws on Sat/Sun for compliance tasks without override.
 *   3. Projector emits stable, unique task_ids and is deterministic.
 *   4. PM overlay edits append PmAuditEntry without mutating CES.
 */

import {
  deriveCesFormStatus,
  deriveEcignPacketStatus,
  derivePmTaskStatus,
} from '../src/policy/pm/ecignStatusMap';
import {
  WeekendNotAllowedError,
  assertSchedulable,
  isWeekend,
  requiresOverrideReason,
} from '../src/policy/pm/weekendRule';
import type { PacketSnapshot } from '../src/policy/pm/types';

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

function snap(partial: Partial<PacketSnapshot>): PacketSnapshot {
  return {
    internal: 'none',
    requiredSignersCount: 1,
    signedCount: 0,
    approvalRequired: false,
    hasValidatedEvidence: false,
    ...partial,
  };
}

/* ─── 1. Status mapper ──────────────────────────────────────────────── */
console.log('\n[1] Status mapper');
check(
  'internal=none -> not_started / missing / todo',
  deriveEcignPacketStatus(snap({})) === 'not_started' &&
    deriveCesFormStatus(snap({})) === 'missing' &&
    derivePmTaskStatus(snap({})) === 'todo',
);
check(
  'internal=created -> draft / pending',
  deriveEcignPacketStatus(snap({ internal: 'created' })) === 'draft' &&
    deriveCesFormStatus(snap({ internal: 'created' })) === 'pending',
);
check(
  'internal=disclosed -> submitted / in-progress / in_progress',
  deriveEcignPacketStatus(snap({ internal: 'disclosed' })) === 'submitted' &&
    deriveCesFormStatus(snap({ internal: 'disclosed' })) === 'in-progress' &&
    derivePmTaskStatus(snap({ internal: 'disclosed' })) === 'in_progress',
);
check(
  'attested + missing signer -> awaiting_signature',
  deriveEcignPacketStatus(
    snap({ internal: 'attested', requiredSignersCount: 2, signedCount: 1 }),
  ) === 'awaiting_signature',
);
check(
  'signed_locked + approval pending -> awaiting_approval / requires-review / in_review',
  deriveEcignPacketStatus(
    snap({ internal: 'signed_locked', approvalRequired: true }),
  ) === 'awaiting_approval' &&
    deriveCesFormStatus(
      snap({ internal: 'signed_locked', approvalRequired: true }),
    ) === 'requires-review' &&
    derivePmTaskStatus(
      snap({ internal: 'signed_locked', approvalRequired: true }),
    ) === 'in_review',
);
check(
  'signed_locked + approved + validated evidence -> completed / complete / done',
  deriveEcignPacketStatus(
    snap({
      internal: 'signed_locked',
      approvalRequired: true,
      approvalDecision: 'approved',
      hasValidatedEvidence: true,
    }),
  ) === 'completed' &&
    deriveCesFormStatus(
      snap({
        internal: 'signed_locked',
        approvalRequired: true,
        approvalDecision: 'approved',
        hasValidatedEvidence: true,
      }),
    ) === 'complete' &&
    derivePmTaskStatus(
      snap({
        internal: 'signed_locked',
        approvalRequired: true,
        approvalDecision: 'approved',
        hasValidatedEvidence: true,
      }),
    ) === 'done',
);
check(
  'signed_locked + returned -> returned_for_correction',
  deriveEcignPacketStatus(
    snap({
      internal: 'signed_locked',
      approvalRequired: true,
      approvalDecision: 'returned',
    }),
  ) === 'returned_for_correction',
);
check(
  'signed_locked + rejected -> rejected',
  deriveEcignPacketStatus(
    snap({
      internal: 'signed_locked',
      approvalRequired: true,
      approvalDecision: 'rejected',
    }),
  ) === 'rejected',
);
check(
  'blockedExternal flag -> blocked',
  derivePmTaskStatus(snap({ internal: 'created' }), true) === 'blocked',
);

/* ─── 2. Weekend rule ───────────────────────────────────────────────── */
console.log('\n[2] Weekend rule');
const sat = '2026-01-03'; // Saturday
const sun = '2026-01-04'; // Sunday
const mon = '2026-01-05'; // Monday
check('isWeekend(Sat)', isWeekend(sat));
check('isWeekend(Sun)', isWeekend(sun));
check('isWeekend(Mon) === false', !isWeekend(mon));
check('requiresOverrideReason(Sat, ces) === true', requiresOverrideReason(sat, 'ces'));
check(
  'requiresOverrideReason(Sat, personal) === false',
  !requiresOverrideReason(sat, 'personal'),
);

let threw = false;
try {
  assertSchedulable(sat, { source: 'ces' });
} catch (e) {
  threw = e instanceof WeekendNotAllowedError;
}
check('Sat ces (no override) throws WeekendNotAllowedError', threw);

threw = false;
try {
  assertSchedulable(sat, { source: 'ces', weekendOverride: true });
} catch {
  threw = true;
}
check('Sat ces (override) does NOT throw', !threw);

threw = false;
try {
  assertSchedulable(mon, { source: 'ces' });
} catch {
  threw = true;
}
check('Mon ces does NOT throw', !threw);

threw = false;
try {
  assertSchedulable(sat, { source: 'personal' });
} catch (e) {
  threw = e instanceof WeekendNotAllowedError;
}
check('Sat personal (no opt-in) throws', threw);

threw = false;
try {
  assertSchedulable(sat, { source: 'personal', isWeekendOk: true });
} catch {
  threw = true;
}
check('Sat personal (opt-in) does NOT throw', !threw);

/* ─── 3. Projector + 4. Overlay ─────────────────────────────────────── */
// Mock localStorage so zustand/persist works in Node.
const memStorage = new Map<string, string>();
(globalThis as unknown as { window: { localStorage: Storage } }).window = {
  localStorage: {
    getItem: (k: string) => memStorage.get(k) ?? null,
    setItem: (k: string, v: string) => void memStorage.set(k, v),
    removeItem: (k: string) => void memStorage.delete(k),
    clear: () => memStorage.clear(),
    key: (i: number) => Array.from(memStorage.keys())[i] ?? null,
    get length() {
      return memStorage.size;
    },
  } as Storage,
};

const { projectTasks, assertNoDuplicateTaskIds } = await import(
  '../src/policy/pm/taskProjectionCore'
);
const { usePmOverlayStore } = await import('../src/policy/pm/pmOverlayStore');

console.log('\n[3] Projector');

const fixtureEvents = [
  {
    id: 'qapi_meeting-20260507',
    title: 'QAPI meeting',
    domain: 'qa-pi',
    date: '2026-05-07',
    cadence: 'quarterly',
    urgency: 'normal',
    policyRefs: ['QA-PG-001'],
    owner: 'Compliance Lead',
    ownerRole: 'qapi-chair',
    workflowId: 'QA-WF-03',
    requiredForms: [
      { id: 'agenda', label: 'QAPI agenda', formId: 'QA-FRM-AGENDA', status: 'pending' },
      { id: 'minutes', label: 'QAPI minutes', formId: 'QA-FRM-MIN', status: 'pending' },
    ],
    processFlow: [
      {
        id: 'distribute-packet',
        label: 'Distribute packet',
        description: 'Send agenda + dashboards 5 days before.',
        status: 'pending',
        dueOffsetDays: -5,
      },
      {
        id: 'finalize-minutes',
        label: 'Finalize minutes',
        description: 'Sign and store finalized minutes.',
        requiredFormIds: ['minutes'],
        status: 'pending',
        dueOffsetDays: 7,
      },
    ],
  },
] as unknown as Parameters<typeof projectTasks>[0]['events'];

const a = projectTasks({ events: fixtureEvents, formStates: {}, overlays: {} });
const b = projectTasks({ events: fixtureEvents, formStates: {}, overlays: {} });

check('projector emits >0 tasks', a.length > 0);
check('projector emits 3 tasks for fixture (2 forms + 1 step-only)', a.length === 3);
check(
  'projector deterministic',
  a.length === b.length && a.every((t, i) => t.task_id === b[i].task_id),
);
let dupOk = true;
try {
  assertNoDuplicateTaskIds(a);
} catch {
  dupOk = false;
}
check('assertNoDuplicateTaskIds passes', dupOk);
check(
  'all task_ids match `${eventId}-NN`',
  a.every(t => /-\d{2}$/.test(t.task_id)),
);
check(
  'duplicate IDs detected by guard',
  (() => {
    try {
      assertNoDuplicateTaskIds([a[0], a[0]]);
      return false;
    } catch {
      return true;
    }
  })(),
);

console.log('\n[4] Overlay store isolation + audit');
const sample = a[0];
usePmOverlayStore.getState().assign(sample.task_id, 'user-123', 'tester');
usePmOverlayStore.getState().pinToSprint(sample.task_id, '2026-03', 'tester');

const overlay = usePmOverlayStore.getState().getOverlay(sample.task_id);
const audit = usePmOverlayStore
  .getState()
  .audit.filter(x => x.task_id === sample.task_id);
check('overlay assigns user', overlay?.assigned_user_id === 'user-123');
check('overlay pins sprint', overlay?.sprint_id === '2026-03');
check('audit recorded >= 2 entries', audit.length >= 2);
check(
  'audit entries reference task_id',
  audit.every(x => x.task_id === sample.task_id),
);

const projected = projectTasks({
  events: fixtureEvents,
  formStates: {},
  overlays: usePmOverlayStore.getState().overlays,
}).find(t => t.task_id === sample.task_id);
check(
  'projection picks up overlay assignment',
  (projected as { assigned_user_id?: string } | undefined)?.assigned_user_id ===
    'user-123',
);
check(
  'projection picks up overlay sprint pin',
  (projected as { sprint_id?: string } | undefined)?.sprint_id === '2026-03',
);

let wkThrew = false;
try {
  usePmOverlayStore
    .getState()
    .setDueDate(sample.task_id, sat, 'ces', { actor: 'tester' });
} catch (e) {
  wkThrew = e instanceof WeekendNotAllowedError;
}
check('setDueDate Sat ces (no override) throws', wkThrew);

let okThrew = false;
try {
  usePmOverlayStore.getState().setDueDate(sample.task_id, sat, 'ces', {
    weekendOverride: true,
    reason: 'CMS holiday backlog',
    actor: 'tester',
  });
} catch {
  okThrew = true;
}
check('setDueDate Sat ces (override) succeeds', !okThrew);

/* ─── 5. Projection contract (CES execution units, not events/forms) ── */
console.log('\n[5] Projection contract');

const contractFixture = [
  {
    id: 'qapi_meeting-test',
    workflowId: 'QA-WF-X',
    policyRefs: ['QA-PG-001'],
    date: '2026-05-12', // Tuesday
    requiredForms: [
      { id: 'ev1', label: 'QAPI Agenda',          formId: 'QA-F-010' },
      { id: 'ev2', label: 'QAPI Attendance Log',  formId: 'QA-F-011' },
      { id: 'ev3', label: 'QAPI Minutes',         formId: 'QA-F-012' },
      { id: 'ev4', label: 'QAPI Action Tracker',  formId: 'QA-F-013' },
      { id: 'ev5', label: 'QAPI Dashboard',       formId: 'QA-F-014' },
    ],
    processFlow: [
      { id: 's1', label: 'Prepare agenda + dashboard',
        status: 'pending', dueOffsetDays: -7,
        requiredFormIds: ['QA-F-010', 'QA-F-014'] },
      { id: 's2', label: 'Run committee meeting',
        status: 'pending', dueOffsetDays: 0,
        requiredFormIds: ['QA-F-011'] },
      { id: 's3', label: 'Record decisions',
        status: 'pending', dueOffsetDays: 1,
        requiredFormIds: ['QA-F-013'] },
      { id: 's4', label: 'Finalize minutes',
        status: 'pending', dueOffsetDays: 7,
        requiredFormIds: ['QA-F-012'] },
    ],
  },
] as unknown as Parameters<typeof projectTasks>[0]['events'];

const projection = projectTasks({
  events: contractFixture,
  formStates: {},
  overlays: {},
});

const stepCount = contractFixture[0].processFlow.length;
const consumedSet = new Set(
  contractFixture[0].processFlow.flatMap(s => s.requiredFormIds ?? []),
);
const orphanCount = contractFixture[0].requiredForms.filter(
  f => !consumedSet.has(f.formId!) && !consumedSet.has(f.id),
).length;
const expectedTotal = stepCount + orphanCount;

check(
  `task count = stepCount(${stepCount}) + orphanForms(${orphanCount}) = ${expectedTotal}`,
  projection.length === expectedTotal,
  { actual: projection.length },
);

check(
  'no task_id equals the event.id (events are NOT tasks)',
  projection.every(t => t.task_id !== 'qapi_meeting-test'),
);

check(
  'all task_ids follow `${event.id}-NN` format',
  projection.every(t => /^qapi_meeting-test-\d{2}$/.test(t.task_id)),
);

check(
  'task_ids are 01..NN with no gaps',
  projection.every((t, i) => t.task_id === `qapi_meeting-test-${String(i + 1).padStart(2, '0')}`),
);

check(
  'step task titles equal step.label (NOT a form id or form.label)',
  projection.slice(0, stepCount).every((t, i) => t.title === contractFixture[0].processFlow[i].label),
  { titles: projection.slice(0, stepCount).map(t => t.title) },
);

check(
  'no step task uses a form id as title',
  projection.slice(0, stepCount).every(
    t => !/^[A-Z]{2}-F[A-Z]?-\d{3}$/.test(t.title),
  ),
);

const dueDates = projection.map(t => t.due_date).filter((d): d is string => Boolean(d));
const distinctDueDates = new Set(dueDates);
check(
  `due dates are NOT all the same (distinct = ${distinctDueDates.size})`,
  distinctDueDates.size > 1,
  { dueDates },
);

check(
  'no due date lands on Saturday or Sunday',
  dueDates.every(d => {
    const dow = new Date(`${d}T00:00:00Z`).getUTCDay();
    return dow !== 0 && dow !== 6;
  }),
  { dueDates },
);

check(
  'every step task carries step_id',
  projection
    .slice(0, stepCount)
    .every((t, i) => 'step_id' in t && (t as { step_id?: string }).step_id === contractFixture[0].processFlow[i].id),
);

check(
  'attached forms appear via packets[] (not as standalone tasks)',
  (() => {
    // s1 has 2 forms attached → packets length 2
    const t1 = projection[0] as { packets?: unknown[] };
    return Array.isArray(t1.packets) && t1.packets.length === 2;
  })(),
);

check(
  'no duplicate task_ids in projection',
  (() => {
    try {
      assertNoDuplicateTaskIds(projection);
      return true;
    } catch {
      return false;
    }
  })(),
);

/* ─── 6. Real-data smoke test against REGULATORY_EVENTS ──────────────── */
console.log('\n[6] Real-data smoke test (regulatoryEvents)');
const { REGULATORY_EVENTS } = await import(
  '../src/policy/data/regulatoryEvents'
);
const realProjection = projectTasks({
  events: REGULATORY_EVENTS as unknown as Parameters<typeof projectTasks>[0]['events'],
  formStates: {},
  overlays: {},
});

check(
  'real projection: no task_id matches any event.id',
  (() => {
    const eventIds = new Set(REGULATORY_EVENTS.map(e => e.id));
    return realProjection.every(t => !eventIds.has(t.task_id));
  })(),
);

check(
  'real projection: every task_id matches `<eventId>-NN`',
  realProjection.every(t => /-\d{2}$/.test(t.task_id)),
);

check(
  'real projection: due dates are NOT all the same',
  new Set(realProjection.map(t => t.due_date).filter(Boolean)).size > 1,
);

check(
  'real projection: zero weekend due dates',
  realProjection
    .map(t => t.due_date)
    .filter((d): d is string => Boolean(d))
    .every(d => {
      const dow = new Date(`${d}T00:00:00Z`).getUTCDay();
      return dow !== 0 && dow !== 6;
    }),
);

check(
  'real projection: no duplicate task_ids',
  (() => {
    try {
      assertNoDuplicateTaskIds(realProjection);
      return true;
    } catch {
      return false;
    }
  })(),
);

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail > 0) {
  process.exit(1);
}
