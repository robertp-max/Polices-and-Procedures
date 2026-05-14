/**
 * verifyTaskIdentity — validates CES event task identity invariants (merge, ids, dedupe).
 */

import { REGULATORY_EVENTS } from '../src/policy/data/regulatoryEvents';
import { buildEventInstanceIndex } from '../src/policy/compliance-execution/eventInstanceId';
import { buildDeterministicTaskId, deriveDefaultEventTasks } from '../src/policy/compliance-execution/eventTaskAdapter';
import {
  canonicalizeTaskSourceId,
  dedupeEventTasksByCanonicalId,
  mergeDerivedEventTasksWithOverrides,
  normalizeEventTaskIdentity,
  taskIdHasDeterministicHashSuffix,
} from '../src/policy/compliance-execution/taskIdentity';
import type { EventTask } from '../src/policy/compliance-execution/types';

const EVENT_INSTANCE_INDEX = buildEventInstanceIndex(REGULATORY_EVENTS);

type Check = { label: string; ok: boolean; detail?: string };
const checks: Check[] = [];

function check(label: string, ok: boolean, detail?: string): void {
  checks.push({ label, ok, detail });
  const prefix = ok ? 'PASS' : 'FAIL';
  const suffix = detail ? ` :: ${detail}` : '';
  // eslint-disable-next-line no-console
  console.log(`${prefix}  ${label}${suffix}`);
}

function assertNoDuplicateIds(tasks: EventTask[], label: string): void {
  const seen = new Set<string>();
  for (const t of tasks) {
    if (seen.has(t.id)) throw new Error(`${label}: duplicate id ${t.id}`);
    seen.add(t.id);
  }
}

const event = REGULATORY_EVENTS.find(e => e.processFlow.length > 0) ?? REGULATORY_EVENTS[0];
const eventId = EVENT_INSTANCE_INDEX.bySourceEventId[event.id] ?? event.id;
const derived = deriveDefaultEventTasks(event, eventId, {});

check('derived tasks have hash suffix when taskSourceId exists', derived.every(t =>
  t.taskSourceId ? taskIdHasDeterministicHashSuffix(t.id) : true,
));

const legacyOverride: EventTask = {
  ...derived[0],
  id: 'TASK-EVT-LEGACY-TRUNC-PROCESSFLOW-XYZ',
  eventId,
  taskSourceId: derived[0].taskSourceId,
};
const merged = mergeDerivedEventTasksWithOverrides(eventId, derived, [legacyOverride]);
check('override merge preserves canonical id', merged.some(t => t.id === derived[0].id && t.taskSourceId === derived[0].taskSourceId));
check('legacy id preserved on merged row', merged.some(t => t.legacyId === legacyOverride.id || t.id === derived[0].id));

let dupErr: Error | null = null;
try {
  assertNoDuplicateIds(merged, 'merged');
} catch (e) {
  dupErr = e as Error;
}
check('merged list has no duplicate task ids', dupErr === null, dupErr?.message);

const overrideOnly: EventTask = {
  id: 'TASK-ORPHAN-OLD',
  eventId,
  taskSourceId: 'manual:verify-script-only',
  taskSourceType: 'manual',
  isRequired: false,
  requirementSource: 'system',
  policyIds: [],
  formIds: [],
  title: 'Script-only manual',
  source: 'manual',
  status: 'not_started',
  folderPath: '/tasks',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDeleted: false,
};
const merged2 = mergeDerivedEventTasksWithOverrides(eventId, derived, [overrideOnly]);
check('override-only manual task gets canonical hash id', merged2.some(t =>
  t.taskSourceId === overrideOnly.taskSourceId && taskIdHasDeterministicHashSuffix(t.id),
));

const normalized = normalizeEventTaskIdentity(eventId, { ...derived[0], id: 'garbage-id' });
check('normalize overwrites non-canonical persisted id', normalized.id === derived[0].id);

const duped = dedupeEventTasksByCanonicalId([derived[0], { ...derived[0], title: 'second' }], 'script');
check('dedupe collapses identical canonical ids', duped.length === 1);

const pf = derived.find(t => t.taskSourceType === 'processFlow');
if (pf) {
  const inner = pf.taskSourceId.replace(/^processFlow:/, '');
  const mergedCase = mergeDerivedEventTasksWithOverrides(eventId, derived, [{
    ...pf,
    id: 'TASK-LEGACY-CASE-TEST',
    taskSourceId: `processflow:${inner}`,
  }]);
  check(
    'processflow: override casing merges to single canonical row',
    mergedCase.filter(t => t.taskSourceId === pf.taskSourceId).length === 1,
  );
}

const longA = `processFlow:${'a'.repeat(80)}-suffix-one`;
const longB = `processFlow:${'a'.repeat(80)}-suffix-two`;
check(
  'long processFlow source ids with same slug prefix produce different ids',
  buildDeterministicTaskId(eventId, longA) !== buildDeterministicTaskId(eventId, longB),
);

check('canonicalizeTaskSourceId normalizes processFlow prefix', canonicalizeTaskSourceId('processflow:step-1') === 'processFlow:step-1');

const failed = checks.filter(c => !c.ok);
// eslint-disable-next-line no-console
console.log(failed.length === 0 ? '\nverify:task-identity OK' : `\nverify:task-identity FAILED (${failed.length})`);
process.exit(failed.length === 0 ? 0 : 1);
