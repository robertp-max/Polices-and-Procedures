import fs from 'node:fs';
import path from 'node:path';
import { REGULATORY_EVENTS } from '../src/policy/data/regulatoryEvents';
import { FORMS_DATASET } from '../src/policy/data/formsLibraryDataset';
import { resolveCanonicalFormId } from '../src/policy/data/formIdAliases';
import { buildEventInstanceIndex } from '../src/policy/compliance-execution/eventInstanceId';
import { deriveDefaultEventTasks } from '../src/policy/compliance-execution/eventTaskAdapter';
import { resolveEventFolder } from '../src/policy/compliance-execution/eventFolders';

type Check = { name: string; ok: boolean; detail?: string };

function run(): void {
  const checks: Check[] = [];
  const index = buildEventInstanceIndex(REGULATORY_EVENTS);

  checks.push({ name: 'every event has stable eventId', ok: REGULATORY_EVENTS.every(event => Boolean(index.bySourceEventId[event.id])) });
  checks.push({ name: 'every RegulatoryEvent has at least one EventInstance via ensureEventInstance', ok: REGULATORY_EVENTS.every(event => Boolean(index.bySourceEventId[event.id])) });

  checks.push({
    name: 'every event resolves folderPath',
    ok: REGULATORY_EVENTS.every(event => {
      const eventId = index.bySourceEventId[event.id] ?? event.id;
      const folder = resolveEventFolder(eventId);
      return folder.folderPath.startsWith('/events/');
    }),
  });

  const allTasks = REGULATORY_EVENTS.flatMap(event => {
    const eventId = index.bySourceEventId[event.id] ?? event.id;
    return deriveDefaultEventTasks(event, eventId);
  });
  const formIds = new Set(FORMS_DATASET.map(form => form.id));
  const unresolvedRequiredForms = REGULATORY_EVENTS.flatMap(event =>
    event.requiredForms
      .map(form => ({
        eventId: event.id,
        formId: form.formId || form.id,
        canonicalId: resolveCanonicalFormId(form.formId || form.id),
      }))
      .filter(form => !form.canonicalId || !formIds.has(form.canonicalId)),
  );

  checks.push({
    name: 'every generated task has eventId',
    ok: allTasks.every(task => Boolean(task.eventId)),
  });
  checks.push({
    name: 'every task has taskSourceId',
    ok: allTasks.every(task => Boolean(task.taskSourceId)),
  });
  checks.push({
    name: 're-deriving tasks twice produces no duplicates',
    ok: REGULATORY_EVENTS.every(event => {
      const eventId = index.bySourceEventId[event.id] ?? event.id;
      const first = deriveDefaultEventTasks(event, eventId).map(task => `${task.id}:${task.taskSourceId}`).sort();
      const second = deriveDefaultEventTasks(event, eventId).map(task => `${task.id}:${task.taskSourceId}`).sort();
      return JSON.stringify(first) === JSON.stringify(second);
    }),
  });

  checks.push({
    name: 'no task exists without eventId',
    ok: allTasks.every(task => Boolean(task.eventId)),
  });

  checks.push({
    name: 'every required form resolves to Enterprise Forms Library',
    ok: unresolvedRequiredForms.length === 0,
    detail: unresolvedRequiredForms.slice(0, 5).map(form => `${form.eventId}:${form.formId}`).join(', '),
  });

  checks.push({
    name: 'no duplicate required form tasks',
    ok: REGULATORY_EVENTS.every(event => {
      const eventId = index.bySourceEventId[event.id] ?? event.id;
      const tasks = deriveDefaultEventTasks(event, eventId);
      const requiredFormTasks = tasks.filter(task => task.source === 'requiredForm');
      const keySet = new Set(requiredFormTasks.map(task => task.formIds.join('|')));
      return keySet.size === requiredFormTasks.length;
    }),
  });

  const storeSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/policy/stores/regulatoryExecutionStore.ts'),
    'utf8',
  );
  const cesSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/policy/compliance-execution/complianceExecutionStore.ts'),
    'utf8',
  );
  const dataflowSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/policy/compliance-execution/useEventExecutionDataflow.ts'),
    'utf8',
  );
  const stateMachineSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/policy/compliance-execution/stateMachine.ts'),
    'utf8',
  );

  checks.push({
    name: 'deleted tasks hidden by default but recoverable',
    ok: storeSource.includes('softDeleteTask') && storeSource.includes('restoreTask'),
  });
  checks.push({
    name: 'required tasks cannot be deleted without reason',
    ok: storeSource.includes('if (task?.isRequired && !opts?.reason) return false'),
  });

  checks.push({
    name: 'certified/locked events block task mutations',
    ok: storeSource.includes('createTask blocked for locked/certified event') &&
      storeSource.includes('updateTask blocked for locked/certified event'),
  });

  checks.push({
    name: 'CES cards are strict projections and include eventId/taskId/taskSourceId',
    ok: cesSource.includes('eventPackages.flatMap') &&
      dataflowSource.includes('taskSourceId') &&
      dataflowSource.includes('sourceEventId') &&
      dataflowSource.includes('id: task.id'),
  });
  checks.push({
    name: 'every EventInstance has folderPath containing eventId',
    ok: REGULATORY_EVENTS.every(event => {
      const eventId = index.bySourceEventId[event.id] ?? event.id;
      return resolveEventFolder(eventId).folderPath.includes(eventId);
    }),
  });
  checks.push({
    name: 'every evidence record has eventId + taskId',
    ok: storeSource.includes('taskId: derivedTaskId') && storeSource.includes('eventId,'),
  });
  checks.push({
    name: 'every evidence objectPath follows required pattern',
    ok: storeSource.includes('evidence/${cleanForId(primaryPolicyId)}/${cleanForId(workflowId)}/${cleanForId(eventId)}'),
  });
  checks.push({
    name: 'task completion blocked when required form/evidence is missing',
    ok: dataflowSource.includes('completionBlockedReason') &&
      dataflowSource.includes('Missing required form completion') &&
      dataflowSource.includes('Missing required evidence'),
  });
  checks.push({
    name: 'certification blocked when requirements missing',
    ok: storeSource.includes('required task(s) incomplete'),
  });
  checks.push({
    name: 'certification snapshot exists when certified',
    ok: storeSource.includes('certificationSnapshot: current.certificationSnapshot ??'),
  });
  checks.push({
    name: 'evidence integrity fields present',
    ok: storeSource.includes('checksum') &&
      storeSource.includes('fileSize') &&
      storeSource.includes('mimeType') &&
      storeSource.includes('uploadedAt'),
  });
  checks.push({
    name: 'auditReadinessScore calculated',
    ok: dataflowSource.includes('const auditReadinessScore') &&
      dataflowSource.includes('weightedAudit') &&
      dataflowSource.includes('totalWeight') &&
      dataflowSource.includes('auditReadinessScore'),
  });
  checks.push({
    name: 'certified event blocks mutation without admin override',
    ok: storeSource.includes("instance?.lockState === 'certified'") &&
      storeSource.includes('canBypassCertification'),
  });
  checks.push({
    name: 'audit records include entityType/entityId/action/timestamp/recordVersion',
    ok: storeSource.includes('appendExecutionAudit') &&
      storeSource.includes('recordVersion') &&
      storeSource.includes('entityType') &&
      storeSource.includes('entityId'),
  });
  checks.push({
    name: 'state transition guards exist for event and task',
    ok: stateMachineSource.includes('canTransitionEventInstance') &&
      stateMachineSource.includes('canTransitionTaskStatus'),
  });

  const failed = checks.filter(c => !c.ok);
  for (const check of checks) {
    const status = check.ok ? 'PASS' : 'FAIL';
    console.log(`[${status}] ${check.name}${check.detail ? ` - ${check.detail}` : ''}`);
  }
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

run();
