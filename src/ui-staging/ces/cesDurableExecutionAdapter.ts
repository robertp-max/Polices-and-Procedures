import { useMemo } from 'react';
import type { ExecutionUnit } from '@/policy/ces/types';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import type { EventTask } from '@/policy/compliance-execution/types';

export type CesDurablePersistenceMode = 'local-store' | 'in-memory' | 'backend' | 'not-wired';
export type CesDurableAuditMode = 'local-preview' | 'app-store' | 'backend' | 'not-wired';

export interface CesDurableCompletionGate {
  ready: boolean;
  message: string;
  blockers: Array<{ code: string; label: string }>;
}

export interface CesDurableAdapterStatus {
  canWrite: boolean;
  persistenceMode: CesDurablePersistenceMode;
  auditMode: CesDurableAuditMode;
  storeName: string;
  adapterEventId?: string;
  adapterTaskId?: string;
  persistedTaskStatus?: EventTask['status'];
  persistedEvidenceCount: number;
  persistedApprovalCount: number;
  auditEventCount: number;
  durableLabel: string;
  backendLabel: string;
}

const ACTOR = 'V3 Phase 4C-A durable app-store adapter';
const STORE_NAME = 'reg-execution-v2';
const BACKEND_BLOCKER = 'AWS/backend persistence remains Phase 4C-B.';
const SIGNATURE_BLOCKER = 'BLOCKED_PENDING_PHASE_4C_B — Durable signature/approval persistence is not wired.';
const EVIDENCE_BACKEND_BLOCKER = 'BLOCKED_PENDING_PHASE_4C_B — Backend evidence upload/validation/promote is not wired.';

const taskSourceIdForUnit = (unit: ExecutionUnit) => `manual:v3-ces:${unit.id}`;

const getUnitFormIds = (unit: ExecutionUnit) => {
  const ids = new Set<string>([...(unit.sourceFormIds ?? []), ...unit.evidenceStatus.missingFormIds]);
  return Array.from(ids);
};

const getUnitPolicyIds = (unit: ExecutionUnit) => Array.from(new Set(unit.sourcePolicyIds ?? []));

const findTaskForUnit = (tasks: EventTask[] | undefined, unit: ExecutionUnit) => {
  const sourceId = taskSourceIdForUnit(unit);
  return (tasks ?? []).find(task => !task.isDeleted && task.taskSourceId === sourceId);
};

const toBlockers = (labels: string[]) => labels.map(label => ({
  code: label
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 72) || 'BLOCKED',
  label,
}));

export function useCesDurableExecutionAdapter(unit: ExecutionUnit) {
  const eventInstanceIdsBySourceEventId = useRegulatoryExecutionStore(state => state.eventInstanceIdsBySourceEventId);
  const taskOverridesByEventId = useRegulatoryExecutionStore(state => state.taskOverridesByEventId);
  const evidenceByEventId = useRegulatoryExecutionStore(state => state.evidence);
  const approvals = useRegulatoryExecutionStore(state => state.approvals);
  const taskAuditByEventId = useRegulatoryExecutionStore(state => state.taskAuditByEventId);
  const updateTask = useRegulatoryExecutionStore(state => state.updateTask);
  const addNote = useRegulatoryExecutionStore(state => state.addNote);
  const uploadEvidence = useRegulatoryExecutionStore(state => state.uploadEvidence);
  const requestApproval = useRegulatoryExecutionStore(state => state.requestApproval);
  const appendTaskAuditEvent = useRegulatoryExecutionStore(state => state.appendTaskAuditEvent);
  const evaluateTaskCertificationGate = useRegulatoryExecutionStore(state => state.evaluateTaskCertificationGate);
  const attemptCompleteTask = useRegulatoryExecutionStore(state => state.attemptCompleteTask);

  const adapterEventId = eventInstanceIdsBySourceEventId[unit.parentEventId]?.[0];
  const persistedTask = adapterEventId ? findTaskForUnit(taskOverridesByEventId[adapterEventId], unit) : undefined;
  const persistedEvidence = adapterEventId && persistedTask
    ? (evidenceByEventId[adapterEventId] ?? []).filter(doc => doc.taskId === persistedTask.id || doc.taskId === persistedTask.legacyId)
    : [];
  const persistedApprovals = adapterEventId && persistedTask
    ? approvals.filter(item => item.eventId === adapterEventId && item.targetId === persistedTask.id)
    : [];
  const auditEvents = adapterEventId && persistedTask
    ? (taskAuditByEventId[adapterEventId] ?? []).filter(row => row.entityId === persistedTask.id || row.entityId === persistedTask.legacyId)
    : [];

  const ensureAdapterEvent = () => {
    const state = useRegulatoryExecutionStore.getState();
    const existingId = state.eventInstanceIdsBySourceEventId[unit.parentEventId]?.[0];
    if (existingId) return existingId;
    return state.createManualEventInstance({
      sourceEventId: unit.parentEventId,
      scheduledDate: unit.dueDate,
      generatedFrom: 'manual',
      createdBy: ACTOR,
    }).eventId;
  };

  const ensureTask = (initialStatus: EventTask['status'] = 'not_started') => {
    const eventId = ensureAdapterEvent();
    const state = useRegulatoryExecutionStore.getState();
    const existing = findTaskForUnit(state.taskOverridesByEventId[eventId], unit);
    if (existing) return { eventId, taskId: existing.id, task: existing };

    const formIds = getUnitFormIds(unit);
    const taskId = state.createTask(eventId, {
      taskSourceId: taskSourceIdForUnit(unit),
      taskSourceType: 'manual',
      source: 'manual',
      title: unit.title,
      description: `V3 CES durable app-store adapter row for ${unit.id}. Backend persistence not implemented.`,
      status: initialStatus,
      isRequired: true,
      requirementSource: 'workflow',
      workflowId: unit.workflowId,
      policyIds: getUnitPolicyIds(unit),
      formIds,
      dueDate: unit.dueDate,
      ownerRole: unit.assignedRole ?? unit.owner.role,
      blockedReason: initialStatus === 'blocked' ? 'Phase 4C-A persisted blocker' : undefined,
    }, { reason: 'V3_PHASE_4C_A_ADAPTER_TASK_MATERIALIZED' });
    const task = findTaskForUnit(useRegulatoryExecutionStore.getState().taskOverridesByEventId[eventId], unit);
    return { eventId, taskId, task };
  };

  const completionGate: CesDurableCompletionGate = useMemo(() => {
    const blockers: string[] = [];
    if (!persistedTask || !adapterEventId) {
      blockers.push('Durable app-store adapter task has not been materialized.');
    }
    if (unit.blockedReason) blockers.push(`Seeded blocker unresolved: ${unit.blockedReason.label}`);
    if (persistedTask?.blockedReason) blockers.push(`Persisted blocker unresolved: ${persistedTask.blockedReason}`);
    if (unit.evidenceStatus.requiredFormsComplete < unit.evidenceStatus.requiredFormsTotal || unit.evidenceStatus.missingFormIds.length > 0) {
      blockers.push(`Required forms/evidence missing in source task: ${unit.evidenceStatus.missingFormIds.join(', ') || 'seed totals incomplete'}`);
    }
    if (persistedEvidence.length === 0) blockers.push('No persisted app-store evidence placeholder/reference for this task.');
    if (unit.evidenceStatus.signaturesComplete < unit.evidenceStatus.signaturesRequired) {
      blockers.push('Required signatures are not satisfied in durable verified state.');
    }
    if (persistedApprovals.filter(item => item.status === 'approved').length === 0) {
      blockers.push('Approval is not satisfied in durable app-store state.');
    }
    if ((auditEvents.length === 0) && persistedTask) {
      blockers.push('No app-store audit/history event recorded for this adapter task.');
    }
    return {
      ready: blockers.length === 0,
      message: blockers.length === 0
        ? 'Ready for durable app-state completion. Backend persistence not implemented; not level 5.'
        : 'Durable completion is blocked by deterministic adapter gates.',
      blockers: toBlockers(blockers),
    };
  }, [adapterEventId, auditEvents.length, persistedApprovals, persistedEvidence.length, persistedTask, unit]);

  const status: CesDurableAdapterStatus = {
    canWrite: true,
    persistenceMode: 'local-store',
    auditMode: auditEvents.length || persistedTask ? 'app-store' : 'local-preview',
    storeName: STORE_NAME,
    adapterEventId,
    adapterTaskId: persistedTask?.id,
    persistedTaskStatus: persistedTask?.status,
    persistedEvidenceCount: persistedEvidence.length,
    persistedApprovalCount: persistedApprovals.length,
    auditEventCount: auditEvents.length,
    durableLabel: 'durable app-store adapter using local persisted store',
    backendLabel: `${BACKEND_BLOCKER} Backend persistence not implemented.`,
  };

  return {
    status,
    completionGate,
    persistedTask,
    persistedEvidence,
    persistedApprovals,
    auditEvents,
    blockers: {
      evidenceBackend: EVIDENCE_BACKEND_BLOCKER,
      signatureApproval: SIGNATURE_BLOCKER,
    },
    actions: {
      persistViewed: () => {
        const { eventId, taskId } = ensureTask();
        appendTaskAuditEvent(eventId, 'task', taskId, 'V3_DURABLE_ADAPTER_VIEWED', {
          after: { sourceUnitId: unit.id, persistenceMode: 'local-store' },
          reason: 'PHASE_4C_A_VIEWED',
        });
      },
      persistStarted: () => {
        const { eventId, taskId, task } = ensureTask('in_progress');
        if (task?.status === 'not_started') {
          updateTask(eventId, taskId, { status: 'in_progress' }, { reason: 'PHASE_4C_A_STARTED' });
        } else {
          appendTaskAuditEvent(eventId, 'task', taskId, 'V3_DURABLE_ADAPTER_STARTED_ACK', {
            after: { status: task?.status ?? 'in_progress' },
            reason: 'PHASE_4C_A_STARTED_ALREADY_MATERIALIZED',
          });
        }
      },
      persistNote: (body: string) => {
        const { eventId, taskId } = ensureTask();
        const note = body.trim() || 'Phase 4C-A durable adapter note.';
        addNote(eventId, `[${unit.id}] ${note}`, ACTOR, 'V3_STAGING');
        appendTaskAuditEvent(eventId, 'task', taskId, 'V3_DURABLE_ADAPTER_NOTE_ADDED', {
          after: { note },
          reason: 'PHASE_4C_A_NOTE',
        });
      },
      persistBlocker: (reason: string) => {
        const { eventId, taskId, task } = ensureTask('blocked');
        const blocker = reason.trim() || 'Phase 4C-A persisted blocker';
        if (task && task.status === 'not_started') {
          updateTask(eventId, taskId, { status: 'in_progress' }, { reason: 'PHASE_4C_A_BLOCKER_PREREQ_START' });
        }
        updateTask(eventId, taskId, { status: 'blocked', blockedReason: blocker }, { reason: 'PHASE_4C_A_BLOCKER_ADDED' });
      },
      clearPersistedBlocker: () => {
        const { eventId, taskId, task } = ensureTask();
        if (task?.status === 'blocked') {
          updateTask(eventId, taskId, { status: 'in_progress', blockedReason: undefined }, { reason: 'PHASE_4C_A_BLOCKER_CLEARED' });
        } else {
          appendTaskAuditEvent(eventId, 'task', taskId, 'V3_DURABLE_ADAPTER_BLOCKER_CLEAR_ACK', {
            after: { status: task?.status ?? 'not_started' },
            reason: 'PHASE_4C_A_NO_PERSISTED_BLOCKER_TO_CLEAR',
          });
        }
      },
      persistEvidencePlaceholder: () => {
        const { eventId, taskId } = ensureTask();
        const policyIds = getUnitPolicyIds(unit);
        const formIds = getUnitFormIds(unit);
        const evidenceId = uploadEvidence(eventId, {
          taskId,
          policyIds: policyIds.length ? policyIds : ['V3-CES-ADAPTER'],
          workflowId: unit.workflowId,
          formIds,
          linkedFormId: formIds[0],
          name: `phase4c-a-app-state-evidence-placeholder-${unit.id}.json`,
          kind: 'other',
          sizeLabel: '1',
          note: 'Phase 4C-A local persisted store metadata placeholder only. Backend evidence upload/validation/promote is not wired.',
        }, ACTOR);
        if (!evidenceId) {
          appendTaskAuditEvent(eventId, 'task', taskId, 'V3_DURABLE_ADAPTER_EVIDENCE_PLACEHOLDER_BLOCKED', {
            reason: EVIDENCE_BACKEND_BLOCKER,
          });
        }
      },
      requestApprovalInStore: () => {
        const { eventId, taskId } = ensureTask();
        requestApproval(
          eventId,
          'event',
          `Phase 4C-A approval request for ${unit.title}`,
          taskId,
          'Local persisted store approval request only. Backend/legal approval remains Phase 4C-B.',
        );
      },
      attemptDurableCompletion: () => {
        const { eventId, taskId } = ensureTask();
        const gate = evaluateTaskCertificationGate(eventId, taskId);
        if (!gate.canComplete) {
          appendTaskAuditEvent(eventId, 'task', taskId, 'V3_DURABLE_ADAPTER_COMPLETION_BLOCKED', {
            reason: gate.blockers.join(' | ') || gate.message,
            after: { blockers: gate.blockers },
          });
          return gate;
        }
        return attemptCompleteTask(eventId, taskId);
      },
    },
  };
}
