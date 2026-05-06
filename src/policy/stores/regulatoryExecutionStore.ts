import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { REGULATORY_EVENTS, type RegulatoryEvent, type UrgencyLevel } from '@/policy/data/regulatoryEvents';
import { useEnforcementStore } from '@/policy/stores/enforcementStore';
import { computeEnforcement } from '@/policy/enforcement/enforcementEngine';
import { resolveEventFolder } from '@/policy/compliance-execution/eventFolders';
import type { EventTask, EventExecutionAuditEvent, EventFormInstance, EventInstance, FormInstanceStatus } from '@/policy/compliance-execution/types';
import { buildEventInstanceIndex, composeEventInstanceId, seedFromRegulatoryEvent } from '@/policy/compliance-execution/eventInstanceId';
import { canTransitionEventInstance, canTransitionTaskStatus } from '@/policy/compliance-execution/stateMachine';
import { evaluateEventState } from '@/policy/compliance-execution/eventStateEvaluator';
import { deriveDefaultEventTasks } from '@/policy/compliance-execution/eventTaskAdapter';
import {
  type EvidenceAuditEvent,
  type EvidenceStatus,
  isEvidenceImmutable,
  isEvidenceUsable,
  validateEvidenceUploadInput,
} from '@/policy/evidence/evidenceModel';

/* ═══════════════════════════════════════════════════════════════
   Regulatory Execution Store
   --------------------------------------------------------------
   Layers operational state ON TOP of the seed event dataset:
     - step progress
     - form statuses (with completion metadata)
     - minutes states
     - evidence documents (uploads / generated reports)
     - approval requests + decisions
     - event completion

   Persisted to localStorage so workflow progress survives reload.
   ═══════════════════════════════════════════════════════════════ */

export type FormStatus = 'missing' | 'pending' | 'in-progress' | 'requires-review' | 'complete';
export type StepStatus = 'pending' | 'in-progress' | 'complete';
export type MinutesStatus = 'missing' | 'draft' | 'finalized';

export interface FormState {
  status: FormStatus;
  completedAt?: string;
  completedBy?: string;
  reviewer?: string;
  note?: string;
}

export interface StepState {
  status: StepStatus;
  completedAt?: string;
  completedBy?: string;
}

export interface MinutesState {
  status: MinutesStatus;
  finalizedAt?: string;
  finalizedBy?: string;
}

export type EvidenceKind = 'minutes' | 'report' | 'form' | 'attachment' | 'other';

export interface EvidenceDoc {
  id: string;
  version: number;
  policyId: string;
  eventId: string;
  taskId: string;
  policyIds: string[];
  workflowId: string;
  formIds: string[];
  folderPath: string;
  objectPath: string;
  createdAt: string;
  createdBy: string;
  status: EvidenceStatus;
  checksum: string;
  fileSize: number;
  mimeType: string;
  name: string;
  kind: EvidenceKind;
  uploadedAt: string;
  uploadedBy: string;
  sizeLabel: string;      // e.g. "1.2 MB"
  linkedFormId?: string;
  linkedFormInstanceId?: string;
  note?: string;
  lockedAt?: string;
  supersededAt?: string;
  supersededById?: string;
  supersedesEvidenceId?: string;
  localDataUrl?: string;
}

export type ApprovalTargetKind = 'event' | 'form' | 'report' | 'minutes';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  id: string;
  eventId: string;
  targetKind: ApprovalTargetKind;
  targetId?: string;       // formId or evidenceId when applicable
  targetLabel: string;
  status: ApprovalStatus;
  requestedBy: string;
  requestedAt: string;
  approver?: string;
  decidedAt?: string;
  note?: string;
  decisionNote?: string;
}

export interface CompletionState {
  status: 'in-progress' | 'complete';
  completedAt?: string;
  completedBy?: string;
}

/* ─── Notes ───────────────────────────────────────────────
   Free-form, author-attributed notes attached to a workflow
   instance. Used by operators to record context during execution
   and by audit reviewers to explain deviations.
   ──────────────────────────────────────────────────────── */
export interface InstanceNote {
  id: string;
  eventId: string;
  author: string;
  authorRole?: string;
  body: string;
  createdAt: string;
}

/* ─── Certification Record ────────────────────────────────
   Formal, immutable audit receipt produced when an operator
   invokes CERTIFY EVENT COMPLETE. Captures a snapshot of the
   runtime state that passed validation, so survey reviewers can
   see exactly what was in evidence at the moment of closure.
   ──────────────────────────────────────────────────────── */
export interface CertificationSnapshot {
  stepsComplete: number;
  stepsTotal: number;
  formsComplete: number;
  formsTotal: number;
  minutesRequired: boolean;
  minutesFinalized: boolean;
  approvalsRequired: number;
  approvalsApproved: number;
  evidenceCount: number;
  notesCount: number;
  slaDaysPastDue: number;
}

export type CertificationDisposition =
  | 'standard'
  | 'certified-with-exception';

export interface CertificationRecord {
  eventId: string;
  certifiedAt: string;
  certifiedBy: string;
  certifierRole?: string;
  certifierNote?: string;
  snapshot: CertificationSnapshot;
  auditPacketRef?: string;
  /**
   * How this certification was recorded:
   *   'standard'                 — certified within SLA, no exceptions
   *   'certified-with-exception' — certified past SLA within the grace window
   */
  disposition?: CertificationDisposition;
  /**
   * Reason the exception was granted (always set when
   * disposition === 'certified-with-exception'). Surfaces in the
   * audit export + governance review packet.
   */
  exceptionReason?: string;
}

export interface ValidationReport {
  canComplete: boolean;
  blockers: {
    kind: 'step' | 'form' | 'minutes' | 'approval';
    label: string;
    targetId?: string;
  }[];
  progress: {
    stepsComplete: number;
    stepsTotal: number;
    formsComplete: number;
    formsTotal: number;
    minutesRequired: boolean;
    minutesFinalized: boolean;
  };
}

export interface TaskCertificationGateReport {
  canComplete: boolean;
  message: string;
  blockers: string[];
}

const CURRENT_USER = 'Current User';

/* ─── Keyers ───────────────────────────────────────────── */
const fKey = (eventId: string, formId: string) => `${eventId}::${formId}`;
const sKey = (eventId: string, stepId: string) => `${eventId}::${stepId}`;

interface RegulatoryExecutionState {
  formStates:       Record<string, FormState>;
  stepStates:       Record<string, StepState>;
  minutesStates:    Record<string, MinutesState>;
  evidence:         Record<string, EvidenceDoc[]>;
  approvals:        ApprovalRequest[];
  completions:      Record<string, CompletionState>;
  notes:            Record<string, InstanceNote[]>;
  certifications:   Record<string, CertificationRecord>;
  eventInstancesById: Record<string, EventInstance>;
  eventInstanceIdsBySourceEventId: Record<string, string[]>;
  taskOverridesByEventId: Record<string, EventTask[]>;
  taskAuditByEventId: Record<string, EventExecutionAuditEvent[]>;
  generatedFormInstancesByEventId: Record<string, EventFormInstance[]>;
  activeWorkflowEventId: string | null;

  /* ── workflow drawer ── */
  openWorkflow:  (eventId: string) => void;
  closeWorkflow: () => void;

  /* ── step / form / minutes transitions ── */
  setStepStatus:    (eventId: string, stepId: string, status: StepStatus, actor?: string) => void;
  advanceStep:      (eventId: string, stepId: string) => void;
  setFormStatus:    (eventId: string, formId: string, status: FormStatus, actor?: string, note?: string) => void;
  setMinutesStatus: (eventId: string, status: MinutesStatus, actor?: string) => void;

  /* ── evidence ── */
  uploadEvidence:    (eventId: string, doc: {
    taskId?: string;
    policyIds?: string[];
    workflowId?: string;
    formIds?: string[];
    name: string;
    kind: EvidenceKind;
    sizeLabel: string;
    linkedFormId?: string;
    linkedFormInstanceId?: string;
    note?: string;
    localDataUrl?: string;
  }, actor?: string) => string;
  generateReport:    (eventId: string, title: string, taskId?: string, actor?: string) => string;
  removeEvidence:    (eventId: string, docId: string) => void;
  supersedeEvidence: (eventId: string, docId: string, replacement: {
    name: string;
    kind: EvidenceKind;
    sizeLabel: string;
    linkedFormId?: string;
    linkedFormInstanceId?: string;
    note?: string;
    localDataUrl?: string;
  }, actor?: string) => string;
  evidenceErrorsByEventId: Record<string, string>;

  /* ── approvals ── */
  requestApproval: (eventId: string, targetKind: ApprovalTargetKind, targetLabel: string, targetId?: string, note?: string) => string;
  decideApproval:  (approvalId: string, decision: ApprovalStatus, decisionNote?: string, approver?: string) => void;

  /* ── notes ── */
  addNote:    (eventId: string, body: string, author?: string, authorRole?: string) => string;
  removeNote: (eventId: string, noteId: string) => void;

  /* ── event instances ── */
  ensureEventInstance: (sourceEvent: RegulatoryEvent) => EventInstance;
  createManualEventInstance: (input: {
    sourceEventId: string;
    scheduledDate: string;
    generatedFrom?: EventInstance['generatedFrom'];
    createdBy?: string;
  }) => EventInstance;
  updateEventInstance: (eventId: string, patch: Partial<EventInstance>) => EventInstance | null;
  cancelEventInstance: (eventId: string, reason: string) => EventInstance | null;
  certifyEventInstance: (eventId: string, certificationInput: { certifiedBy?: string; certificationId?: string; reason?: string }) => EventInstance | null;

  /* ── event tasks + form instances ── */
  createTask: (eventId: string, task: Partial<EventTask>, opts?: { adminOverride?: boolean; reason?: string }) => string;
  updateTask: (eventId: string, taskId: string, patch: Partial<EventTask>, opts?: { adminOverride?: boolean; reason?: string }) => boolean;
  softDeleteTask: (eventId: string, taskId: string, opts?: { adminOverride?: boolean; reason?: string }) => boolean;
  restoreTask: (eventId: string, taskId: string, opts?: { adminOverride?: boolean; reason?: string }) => boolean;
  generateTaskFromForm: (eventId: string, formId: string, opts?: { adminOverride?: boolean; reason?: string }) => string;
  generateTaskFromWorkflowStep: (eventId: string, stepId: string, opts?: { adminOverride?: boolean; reason?: string }) => string;
  generateFormInstance: (eventId: string, formId: string, policyIds: string[], workflowId?: string) => EventFormInstance | null;
  getOrCreateFormInstance: (params: {
    eventId: string;
    formId: string;
    taskId?: string;
    requirementId?: string;
    policyIds: string[];
    workflowId?: string;
  }) => EventFormInstance | null;
  setFormInstanceStatus: (eventId: string, instanceId: string, status: FormInstanceStatus) => void;
  appendTaskAuditEvent: (
    eventId: string,
    entityType: EventExecutionAuditEvent['entityType'],
    entityId: string,
    action: string,
    opts?: { before?: unknown; after?: unknown; reason?: string },
  ) => void;
  evaluateTaskCertificationGate: (eventId: string, taskId: string) => TaskCertificationGateReport;
  attemptCompleteTask: (eventId: string, taskId: string) => TaskCertificationGateReport;

  /* ── completion + certification ── */
  validateEvent:        (event: RegulatoryEvent) => ValidationReport;
  markEventComplete:    (event: RegulatoryEvent) => { ok: boolean; message: string };
  certifyEventComplete: (event: RegulatoryEvent, certifier?: string, certifierRole?: string, note?: string) => { ok: boolean; message: string; record?: CertificationRecord };
  revokeCertification:  (eventId: string, reason: string, actor?: string) => { ok: boolean; message: string };
  reopenEvent:          (eventId: string) => void;

  /* ── selectors (return effective status blending seed + store) ── */
  effectiveStepStatus:    (event: RegulatoryEvent, stepId: string) => StepStatus;
  effectiveFormStatus:    (event: RegulatoryEvent, formId: string) => FormStatus;
  effectiveMinutesStatus: (event: RegulatoryEvent) => MinutesStatus | null;
  effectiveUrgency:       (event: RegulatoryEvent) => UrgencyLevel;
  isEventComplete:        (eventId: string) => boolean;
  isCertified:            (eventId: string) => boolean;
  getCertification:       (eventId: string) => CertificationRecord | undefined;

  resetAll: () => void;
}

const nowISO = () => new Date().toISOString();
const cleanForId = (value: string) => value.replace(/[^A-Za-z0-9-]/g, '-');
const stableTaskId = (eventId: string, taskSourceId: string) => {
  const sourceSlug = cleanForId(taskSourceId).toUpperCase().slice(0, 64);
  return `TASK-${cleanForId(eventId)}-${sourceSlug}`;
};
const nextAuditId = () => `AUD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const EVENT_INSTANCE_INDEX = buildEventInstanceIndex(REGULATORY_EVENTS);
const SOURCE_EVENT_BY_INSTANCE_ID = Object.fromEntries(
  Object.entries(EVENT_INSTANCE_INDEX.bySourceEventId).map(([sourceId, instanceId]) => [instanceId, sourceId]),
);
const SOURCE_EVENT_BY_ID = Object.fromEntries(REGULATORY_EVENTS.map(event => [event.id, event]));
const resolveCanonicalEventId = (eventId: string) => SOURCE_EVENT_BY_INSTANCE_ID[eventId] ?? eventId;
const migrateLegacyEvidenceStatus = (status: string | undefined): EvidenceStatus => {
  if (status === 'active') return 'EVIDENCE_LOCKED';
  if (status === 'superseded') return 'SUPERSEDED';
  if (status === 'deleted') return 'RETAINED';
  if (!status) return 'EVIDENCE_LOCKED';
  if ((['PENDING_UPLOAD', 'UPLOADED', 'VALIDATING', 'VALIDATED', 'REJECTED', 'PROMOTED', 'EVIDENCE_LOCKED', 'SUPERSEDED', 'EXPORTED', 'RETAINED'] as string[]).includes(status)) {
    return status as EvidenceStatus;
  }
  return 'EVIDENCE_LOCKED';
};

function migrateEvidenceRecords(raw: unknown): Record<string, EvidenceDoc[]> {
  const candidate = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return Object.fromEntries(Object.entries(candidate).map(([eventId, docs]) => {
    const normalizedDocs = Array.isArray(docs) ? docs.map((doc, index) => {
      const row = (doc && typeof doc === 'object' ? doc : {}) as Partial<EvidenceDoc> & { status?: string };
      const policyId = row.policyId ?? row.policyIds?.[0] ?? '';
      return {
        ...row,
        id: row.id ?? `EV-MIGRATED-${eventId}-${index}`,
        version: row.version ?? 1,
        policyId,
        policyIds: row.policyIds?.length ? row.policyIds : (policyId ? [policyId] : []),
        status: migrateLegacyEvidenceStatus(row.status),
      } as EvidenceDoc;
    }) : [];
    return [eventId, normalizedDocs];
  }));
}

const readApprovalNoteValue = (note: string | undefined, key: string): string | undefined => {
  if (!note) return undefined;
  const pattern = new RegExp(`${key}=([^;]+)`, 'i');
  const match = note.match(pattern);
  return match?.[1]?.trim();
};

const canBypassCertification = (adminOverride?: boolean) => {
  if (!adminOverride) return false;
  const actor = useEnforcementStore.getState().actor;
  return actor.role === 'Administrator';
};
const isEventInstanceCertified = (state: RegulatoryExecutionState, eventId: string) => {
  if (state.eventInstancesById[eventId]?.lockState === 'certified') return true;
  const instanceId = EVENT_INSTANCE_INDEX.bySourceEventId[eventId];
  if (instanceId && state.eventInstancesById[instanceId]?.lockState === 'certified') return true;
  return false;
};

const computeAuditHash = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return `h:${Math.abs(hash).toString(16)}`;
};

function appendExecutionAudit(
  existing: EventExecutionAuditEvent[],
  input: Omit<EventExecutionAuditEvent, 'recordVersion' | 'prevHash' | 'currentHash'>,
): EventExecutionAuditEvent[] {
  const latest = existing[0];
  const recordVersion = (latest?.recordVersion ?? 0) + 1;
  const prevHash = latest?.currentHash;
  const currentHash = computeAuditHash(JSON.stringify({
    prevHash,
    recordVersion,
    eventId: input.eventId,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    timestamp: input.timestamp,
    before: input.before,
    after: input.after,
    reason: input.reason,
  }));
  return [{ ...input, recordVersion, prevHash, currentHash }, ...existing];
}

function evaluateAndApplyEventState(
  state: RegulatoryExecutionState,
  eventId: string,
): EventInstance | null {
  const sourceEventId = resolveCanonicalEventId(eventId);
  const sourceEvent = SOURCE_EVENT_BY_ID[sourceEventId];
  const instance = state.eventInstancesById[eventId] ?? state.eventInstancesById[EVENT_INSTANCE_INDEX.bySourceEventId[sourceEventId] ?? ''];
  if (!sourceEvent || !instance) return null;
  const tasks = state.taskOverridesByEventId[eventId] ?? [];
  const requiredFormsComplete = sourceEvent.requiredForms.every(form => {
    const status = state.formStates[`${sourceEvent.id}::${form.id}`]?.status ?? form.status;
    return status === 'complete';
  });
  const requiredApprovalRules = (sourceEvent.approvals ?? []).filter(rule => rule.required);
  const hasApprovals = requiredApprovalRules.every(rule =>
    state.approvals.some(ap =>
      ap.eventId === sourceEvent.id &&
      ap.targetKind === rule.targetKind &&
      ap.targetLabel === rule.targetLabel &&
      ap.status === 'approved',
    ),
  );
  const evaluation = evaluateEventState({
    eventId,
    eventInstance: instance,
    tasks,
    requiredFormsComplete,
    hasApprovals,
  });
  if (evaluation.nextStatus !== instance.status && canTransitionEventInstance(instance.status, evaluation.nextStatus)) {
    return {
      ...instance,
      status: evaluation.nextStatus,
      updatedAt: nowISO(),
      lockState: evaluation.nextStatus === 'certified' ? 'certified' : instance.lockState,
    };
  }
  return instance;
}

export const useRegulatoryExecutionStore = create<RegulatoryExecutionState>()(
  persist(
    (set, get) => ({
      formStates:    {},
      stepStates:    {},
      minutesStates: {},
      evidence:      {},
      approvals:     [],
      completions:   {},
      notes:         {},
      certifications:{},
      eventInstancesById: {},
      eventInstanceIdsBySourceEventId: {},
      taskOverridesByEventId: {},
      taskAuditByEventId: {},
      generatedFormInstancesByEventId: {},
      activeWorkflowEventId: null,
      evidenceErrorsByEventId: {},

      /* ── workflow drawer ── */
      openWorkflow: eventId => set({ activeWorkflowEventId: eventId }),
      closeWorkflow: () => set({ activeWorkflowEventId: null }),

      /* ── step / form / minutes transitions ── */
      setStepStatus: (eventId, stepId, status, actor = CURRENT_USER) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId) || isEventInstanceCertified(get(), eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'step', targetId: stepId, reason: `Attempt to set step status to ${status} on a locked event.` });
          return;
        }
        const before = get().stepStates[sKey(eventId, stepId)]?.status ?? 'pending';
        set(state => ({
          stepStates: {
            ...state.stepStates,
            [sKey(eventId, stepId)]: {
              status,
              completedAt: status === 'complete' ? nowISO() : undefined,
              completedBy: status === 'complete' ? actor : undefined,
            },
          },
        }));
        enf.log({ action: 'step.status.changed', eventId, targetKind: 'step', targetId: stepId, before, after: status });
      },

      advanceStep: (eventId, stepId) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId) || isEventInstanceCertified(get(), eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'step', targetId: stepId, reason: 'advanceStep on a locked event' });
          return;
        }
        const key = sKey(eventId, stepId);
        const before = get().stepStates[key]?.status ?? 'pending';
        set(state => ({
          stepStates: {
            ...state.stepStates,
            [key]: { status: 'complete', completedAt: nowISO(), completedBy: CURRENT_USER },
          },
        }));
        enf.log({ action: 'step.status.changed', eventId, targetKind: 'step', targetId: stepId, before, after: 'complete' });
      },

      setFormStatus: (eventId, formId, status, actor = CURRENT_USER, note) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId) || isEventInstanceCertified(get(), eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'form', targetId: formId, reason: `Attempt to set form status to ${status} on a locked event.` });
          return;
        }
        const before = get().formStates[fKey(eventId, formId)]?.status ?? 'pending';
        set(state => ({
          formStates: {
            ...state.formStates,
            [fKey(eventId, formId)]: {
              status,
              completedAt: status === 'complete' ? nowISO() : state.formStates[fKey(eventId, formId)]?.completedAt,
              completedBy: status === 'complete' ? actor : state.formStates[fKey(eventId, formId)]?.completedBy,
              reviewer:    status === 'requires-review' ? actor : state.formStates[fKey(eventId, formId)]?.reviewer,
              note: note ?? state.formStates[fKey(eventId, formId)]?.note,
            },
          },
        }));
        const instanceId = EVENT_INSTANCE_INDEX.bySourceEventId[eventId] ?? eventId;
        const evaluated = evaluateAndApplyEventState(get(), instanceId);
        if (evaluated) {
          set(state => ({
            eventInstancesById: { ...state.eventInstancesById, [evaluated.eventId]: evaluated },
          }));
        }
        enf.log({ action: 'form.status.changed', eventId, targetKind: 'form', targetId: formId, before, after: status, reason: note });
      },

      setMinutesStatus: (eventId, status, actor = CURRENT_USER) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId) || isEventInstanceCertified(get(), eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'minutes', reason: `Attempt to set minutes status to ${status} on a locked event.` });
          return;
        }
        const before = get().minutesStates[eventId]?.status;
        set(state => ({
          minutesStates: {
            ...state.minutesStates,
            [eventId]: {
              status,
              finalizedAt: status === 'finalized' ? nowISO() : undefined,
              finalizedBy: status === 'finalized' ? actor : undefined,
            },
          },
        }));
        enf.log({ action: 'minutes.status.changed', eventId, targetKind: 'minutes', before, after: status });
      },

      /* ── evidence ── */
      uploadEvidence: (eventId, doc, actor = CURRENT_USER) => {
        const enf = useEnforcementStore.getState();
        const state = get();
        const canonicalEventId = resolveCanonicalEventId(eventId);
        const instance = state.eventInstancesById[eventId];
        if (enf.isLocked(eventId) || enf.isLocked(canonicalEventId) || instance?.lockState === 'certified' || isEventInstanceCertified(state, eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'evidence', reason: 'uploadEvidence on a locked event' });
          return '';
        }
        const derivedTaskId = doc.taskId
          || (doc.linkedFormId ? get().generateTaskFromForm(eventId, doc.linkedFormId) : '');
        const sourceEvent = SOURCE_EVENT_BY_ID[canonicalEventId];
        const validation = validateEvidenceUploadInput({
          policyId: doc.policyIds?.[0] ?? '',
          workflowId: doc.workflowId ?? '',
          eventId,
          eventExists: Boolean(sourceEvent || instance || SOURCE_EVENT_BY_ID[eventId]),
          requiredFormBinding: Boolean(doc.linkedFormId),
          formId: doc.linkedFormId,
          requiredTaskBinding: true,
          taskId: derivedTaskId,
        });
        if (!validation.ok) {
          const failureReason = validation.message ?? 'Evidence validation failed.';
          set(current => ({
            evidenceErrorsByEventId: { ...current.evidenceErrorsByEventId, [eventId]: failureReason },
            taskAuditByEventId: {
              ...current.taskAuditByEventId,
              [eventId]: appendExecutionAudit(current.taskAuditByEventId[eventId] ?? [], {
                auditId: nextAuditId(),
                eventId,
                entityType: 'evidence',
                entityId: `VALIDATION-${Date.now().toString(36)}`,
                action: 'VALIDATION_FAILED',
                actorId: enf.actor.userId,
                actorRole: enf.actor.role,
                timestamp: nowISO(),
                reason: failureReason,
              }),
            },
          }));
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'evidence', reason: failureReason });
          return '';
        }
        const id = `EV-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const primaryPolicyId = doc.policyIds?.[0] ?? '';
        const workflowId = doc.workflowId ?? '';
        const folderPath = resolveEventFolder(eventId).paths.evidenceDir;
        const objectPath = `evidence/${cleanForId(primaryPolicyId)}/${cleanForId(workflowId)}/${cleanForId(eventId)}/${cleanForId(id)}/${cleanForId(doc.name)}`;
        const checksum = computeAuditHash(`${doc.name}|${doc.sizeLabel}|${actor}|${nowISO()}`);
        const existingForKey = (state.evidence[eventId] ?? []).find(candidate =>
          candidate.status === 'EVIDENCE_LOCKED'
          && candidate.name === doc.name
          && candidate.policyId === primaryPolicyId
          && candidate.workflowId === workflowId
          && candidate.linkedFormId === doc.linkedFormId
          && candidate.taskId === derivedTaskId,
        );
        const version = (existingForKey?.version ?? 0) + 1;
        const newDoc: EvidenceDoc = {
          ...doc,
          id,
          version,
          policyId: primaryPolicyId,
          eventId,
          taskId: derivedTaskId,
          policyIds: doc.policyIds ?? [primaryPolicyId],
          workflowId,
          formIds: doc.formIds ?? (doc.linkedFormId ? [doc.linkedFormId] : []),
          folderPath,
          objectPath,
          createdAt: nowISO(),
          createdBy: actor,
          status: 'EVIDENCE_LOCKED',
          checksum,
          fileSize: Number.parseInt(doc.sizeLabel, 10) || 0,
          mimeType: doc.name.endsWith('.json') ? 'application/json' : 'application/octet-stream',
          uploadedAt: nowISO(),
          uploadedBy: actor,
          lockedAt: nowISO(),
          supersedesEvidenceId: existingForKey?.id,
        };
        const evidenceAuditRows: Array<{ action: EvidenceAuditEvent; before?: unknown; after?: unknown; reason?: string; entityId?: string }> = [
          { action: 'UPLOAD_INITIATED', after: { name: doc.name, taskId: derivedTaskId, linkedFormId: doc.linkedFormId } },
          { action: 'FILE_UPLOADED', after: { status: 'UPLOADED' } },
          { action: 'FILE_VALIDATED', after: { status: 'VALIDATED' } },
          { action: 'EVIDENCE_PROMOTED', after: { status: 'PROMOTED' } },
          { action: 'EVIDENCE_LOCKED', after: { status: 'EVIDENCE_LOCKED', evidenceId: id } },
        ];
        if (existingForKey) {
          evidenceAuditRows.push({
            action: 'EVIDENCE_SUPERSEDED',
            before: { previousEvidenceId: existingForKey.id, previousVersion: existingForKey.version },
            after: { evidenceId: id, version },
            reason: 'Duplicate triplet upload superseded prior locked evidence.',
            entityId: existingForKey.id,
          });
        }
        set(state => ({
          evidence: {
            ...state.evidence,
            [eventId]: [
              newDoc,
              ...((state.evidence[eventId] || []).map(candidate => {
                if (!existingForKey || candidate.id !== existingForKey.id) return candidate;
                return {
                  ...candidate,
                  status: 'SUPERSEDED',
                  supersededAt: nowISO(),
                  supersededById: id,
                };
              })),
            ],
          },
          evidenceErrorsByEventId: { ...state.evidenceErrorsByEventId, [eventId]: '' },
          taskAuditByEventId: {
            ...state.taskAuditByEventId,
            [eventId]: evidenceAuditRows.reduce((acc, row) => appendExecutionAudit(acc, {
              auditId: nextAuditId(),
              eventId,
              entityType: 'evidence',
              entityId: row.entityId ?? id,
              action: row.action,
              actorId: enf.actor.userId,
              actorRole: enf.actor.role,
              timestamp: newDoc.createdAt,
              before: row.before,
              after: row.after,
              reason: row.reason,
            }), state.taskAuditByEventId[eventId] ?? []),
          },
        }));
        if (derivedTaskId) {
          get().appendTaskAuditEvent(eventId, 'task', derivedTaskId, 'SUPPORTING_EVIDENCE_UPLOADED', {
            after: { evidenceId: id, name: doc.name, linkedFormId: doc.linkedFormId },
          });
        }
        enf.log({ action: 'evidence.uploaded', eventId, targetKind: 'evidence', targetId: id, after: { name: doc.name, kind: doc.kind, linkedFormId: doc.linkedFormId } });
        if (doc.linkedFormId) {
          get().setFormStatus(eventId, doc.linkedFormId, 'complete', actor);
        }
        const evaluated = evaluateAndApplyEventState(get(), eventId);
        if (evaluated) {
          set(state => ({
            eventInstancesById: { ...state.eventInstancesById, [evaluated.eventId]: evaluated },
          }));
        }
        return id;
      },

      generateReport: (eventId, title, taskId, actor = CURRENT_USER) => {
        return get().uploadEvidence(eventId, {
          taskId: taskId || '',
          policyIds: [SOURCE_EVENT_BY_ID[resolveCanonicalEventId(eventId)]?.policyRefs?.[0] ?? ''],
          formIds: [],
          workflowId: SOURCE_EVENT_BY_ID[resolveCanonicalEventId(eventId)]?.workflowId ?? '',
          name: title,
          kind: 'report',
          sizeLabel: '—',
        }, actor);
      },

      removeEvidence: (eventId, docId) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId) || isEventInstanceCertified(get(), eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'evidence', targetId: docId, reason: 'removeEvidence on a locked event' });
          return;
        }
        const prev = (get().evidence[eventId] || []).find(d => d.id === docId);
        if (!prev) return;
        if (isEvidenceImmutable(prev.status)) {
          set(state => ({
            taskAuditByEventId: {
              ...state.taskAuditByEventId,
              [eventId]: appendExecutionAudit(state.taskAuditByEventId[eventId] ?? [], {
                auditId: nextAuditId(),
                eventId,
                entityType: 'evidence',
                entityId: docId,
                action: 'ACCESS_DENIED',
                actorId: enf.actor.userId,
                actorRole: enf.actor.role,
                timestamp: nowISO(),
                reason: `Evidence ${docId} is locked and cannot be deleted.`,
                before: prev,
              }),
            },
          }));
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'evidence', targetId: docId, reason: 'Locked evidence cannot be deleted.' });
          return;
        }
        set(state => ({
          evidence: {
            ...state.evidence,
            [eventId]: (state.evidence[eventId] || []).map(d => (d.id === docId
              ? {
                  ...d,
                  status: 'RETAINED',
                }
              : d)),
          },
          taskAuditByEventId: {
            ...state.taskAuditByEventId,
            [eventId]: appendExecutionAudit(state.taskAuditByEventId[eventId] ?? [], {
              auditId: nextAuditId(),
              eventId,
              entityType: 'evidence',
              entityId: docId,
              action: 'FILE_REJECTED',
              actorId: enf.actor.userId,
              actorRole: enf.actor.role,
              timestamp: nowISO(),
              before: prev,
              after: { status: 'RETAINED' },
            }),
          },
        }));
        enf.log({ action: 'evidence.removed', eventId, targetKind: 'evidence', targetId: docId, before: prev });
      },

      supersedeEvidence: (eventId, docId, replacement, actor = CURRENT_USER) => {
        const enf = useEnforcementStore.getState();
        const current = (get().evidence[eventId] ?? []).find(item => item.id === docId);
        if (!current || !isEvidenceImmutable(current.status)) {
          return '';
        }
        const newId = get().uploadEvidence(eventId, {
          taskId: current.taskId,
          policyIds: current.policyIds,
          workflowId: current.workflowId,
          formIds: current.formIds,
          name: replacement.name,
          kind: replacement.kind,
          sizeLabel: replacement.sizeLabel,
          linkedFormId: replacement.linkedFormId ?? current.linkedFormId,
          note: replacement.note,
          localDataUrl: replacement.localDataUrl,
        }, actor);
        if (newId) {
          set(state => ({
            evidence: {
              ...state.evidence,
              [eventId]: (state.evidence[eventId] ?? []).map(item => {
                if (item.id === docId) {
                  return { ...item, status: 'SUPERSEDED', supersededAt: nowISO(), supersededById: newId };
                }
                if (item.id === newId) {
                  return { ...item, version: current.version + 1, supersedesEvidenceId: docId };
                }
                return item;
              }),
            },
            taskAuditByEventId: {
              ...state.taskAuditByEventId,
              [eventId]: appendExecutionAudit(state.taskAuditByEventId[eventId] ?? [], {
                auditId: nextAuditId(),
                eventId,
                entityType: 'evidence',
                entityId: docId,
                action: 'EVIDENCE_SUPERSEDED',
                actorId: enf.actor.userId,
                actorRole: enf.actor.role,
                timestamp: nowISO(),
                before: { evidenceId: docId, status: current.status },
                after: { evidenceId: newId, status: 'SUPERSEDED' },
              }),
            },
          }));
        }
        return newId;
      },

      /* ── approvals ── */
      requestApproval: (eventId, targetKind, targetLabel, targetId, note) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'approval', reason: 'requestApproval on a locked event' });
          return '';
        }
        const id = `AP-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const req: ApprovalRequest = {
          id,
          eventId,
          targetKind,
          targetId,
          targetLabel,
          status: 'pending',
          requestedBy: CURRENT_USER,
          requestedAt: nowISO(),
          note,
        };
        set(state => ({ approvals: [req, ...state.approvals] }));
        get().appendTaskAuditEvent(eventId, 'approval', id, 'SIGNATURE_REQUESTED', {
          after: { targetKind, targetId, targetLabel },
        });
        enf.log({ action: 'approval.requested', eventId, targetKind: 'approval', targetId: id, after: { targetKind, targetLabel, targetId } });
        return id;
      },

      decideApproval: (approvalId, decision, decisionNote, approver = CURRENT_USER) => {
        const enf = useEnforcementStore.getState();
        const prev = get().approvals.find(a => a.id === approvalId);
        if (!prev) return;
        if (enf.isLocked(prev.eventId)) {
          enf.log({ action: 'mutation.blocked', eventId: prev.eventId, targetKind: 'approval', targetId: approvalId, reason: 'decideApproval on a locked event' });
          return;
        }
        set(state => ({
          approvals: state.approvals.map(a =>
            a.id === approvalId
              ? { ...a, status: decision, decisionNote, approver, decidedAt: nowISO() }
              : a,
          ),
        }));
        enf.log({
          action: 'approval.decided',
          eventId: prev.eventId,
          targetKind: 'approval',
          targetId: approvalId,
          before: { status: prev.status },
          after: { status: decision, approver, decisionNote },
        });
        if (decision === 'approved') {
          get().appendTaskAuditEvent(prev.eventId, 'approval', approvalId, 'SIGNATURE_COMPLETED', {
            after: { status: decision, approver, decisionNote },
          });
        }

        // eSign completion path for forms:
        // once approved, create a receipt and mark the linked step complete
        // when all forms for that step are complete.
        if (decision === 'approved' && prev.targetKind === 'form' && prev.targetId) {
          const eventDef = REGULATORY_EVENTS.find(e => e.id === prev.eventId);
          const formTaskId = get().generateTaskFromForm(prev.eventId, prev.targetId, { adminOverride: true });
          get().uploadEvidence(prev.eventId, {
            taskId: formTaskId,
            policyIds: eventDef?.policyRefs ?? ['UNASSIGNED-POLICY'],
            workflowId: eventDef?.workflowId ?? 'UNASSIGNED-WORKFLOW',
            formIds: [prev.targetId],
            name: `${prev.targetId}_eSign_${approvalId}.json`,
            kind: 'form',
            sizeLabel: 'eSign',
            linkedFormId: prev.targetId,
            note: `approval_id=${approvalId}; target_id=${prev.targetId}; approver=${approver}; decided_at=${nowISO()}; source=eSign`,
          }, approver);

          const mappedStepIds = new Set<string>();

          if (eventDef) {
            const approvedFormId = prev.targetId;
            const approvedFormRef = eventDef.requiredForms.find(f => f.id === approvedFormId)?.formId;

            eventDef.processFlow.forEach(step => {
              const refs = step.requiredFormIds || [];
              if (refs.includes(approvedFormId) || (approvedFormRef ? refs.includes(approvedFormRef) : false)) {
                mappedStepIds.add(step.id);
              }
            });

            mappedStepIds.forEach(stepId => {
              const step = eventDef.processFlow.find(s => s.id === stepId);
              if (!step) return;
              const allFormsComplete = (step.requiredFormIds || []).every(ref => {
                const mappedForm = eventDef.requiredForms.find(f => f.formId === ref || f.id === ref);
                const checkFormId = mappedForm?.id || ref;
                return get().effectiveFormStatus(eventDef, checkFormId) === 'complete';
              });
              if (allFormsComplete) {
                get().setStepStatus(prev.eventId, stepId, 'complete', approver);
              }
            });
          }

          const executionUnitId = readApprovalNoteValue(prev.note, 'execution_unit_id');
          if (executionUnitId && eventDef?.processFlow.some(step => step.id === executionUnitId)) {
            get().setStepStatus(prev.eventId, executionUnitId, 'complete', approver);
          }
        }
      },

      /* ── notes ── */
      addNote: (eventId, body, author = CURRENT_USER, authorRole) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'evidence', reason: 'addNote on a locked event' });
          return '';
        }
        const trimmed = body.trim();
        if (!trimmed) return '';
        const id = `NT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const note: InstanceNote = {
          id,
          eventId,
          author,
          authorRole,
          body: trimmed,
          createdAt: nowISO(),
        };
        set(state => ({
          notes: { ...state.notes, [eventId]: [note, ...(state.notes[eventId] || [])] },
        }));
        enf.log({ action: 'evidence.uploaded', eventId, targetKind: 'evidence', targetId: id, after: { kind: 'note', body: trimmed.slice(0, 80) } });
        return id;
      },

      removeNote: (eventId, noteId) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'evidence', targetId: noteId, reason: 'removeNote on a locked event' });
          return;
        }
        const prev = (get().notes[eventId] || []).find(n => n.id === noteId);
        set(state => ({
          notes: { ...state.notes, [eventId]: (state.notes[eventId] || []).filter(n => n.id !== noteId) },
        }));
        enf.log({ action: 'evidence.removed', eventId, targetKind: 'evidence', targetId: noteId, before: prev });
      },

      ensureEventInstance: (sourceEvent) => {
        const state = get();
        const existingIds = state.eventInstanceIdsBySourceEventId[sourceEvent.id] ?? [];
        if (existingIds.length > 0) {
          const existing = state.eventInstancesById[existingIds[0]];
          if (existing) return existing;
        }
        const seededId = EVENT_INSTANCE_INDEX.bySourceEventId[sourceEvent.id]
          ?? composeEventInstanceId(seedFromRegulatoryEvent(sourceEvent), 1);
        const createdAt = nowISO();
        const instance: EventInstance = {
          eventId: seededId,
          sourceEventId: sourceEvent.id,
          scheduledDate: sourceEvent.date,
          generatedFrom: 'mandated',
          status: 'scheduled',
          lockState: 'unlocked',
          folderPath: resolveEventFolder(seededId).folderPath,
          createdAt,
          updatedAt: createdAt,
          createdBy: useEnforcementStore.getState().actor.displayName,
        };
        set(prev => ({
          eventInstancesById: { ...prev.eventInstancesById, [instance.eventId]: instance },
          eventInstanceIdsBySourceEventId: {
            ...prev.eventInstanceIdsBySourceEventId,
            [sourceEvent.id]: [...(prev.eventInstanceIdsBySourceEventId[sourceEvent.id] ?? []), instance.eventId],
          },
          taskAuditByEventId: {
            ...prev.taskAuditByEventId,
            [instance.eventId]: appendExecutionAudit(
              prev.taskAuditByEventId[instance.eventId] ?? [],
              {
                auditId: nextAuditId(),
                eventId: instance.eventId,
                entityType: 'eventInstance',
                entityId: instance.eventId,
                action: 'event_instance.ensure',
                actorId: useEnforcementStore.getState().actor.userId,
                actorRole: useEnforcementStore.getState().actor.role,
                timestamp: createdAt,
                after: instance,
              },
            ),
          },
        }));
        return instance;
      },

      createManualEventInstance: ({ sourceEventId, scheduledDate, generatedFrom = 'manual', createdBy }) => {
        const sourceEvent = SOURCE_EVENT_BY_ID[sourceEventId];
        const seed = sourceEvent
          ? seedFromRegulatoryEvent({ ...sourceEvent, date: scheduledDate })
          : { sourceEventId, domain: 'Compliance', category: 'manual', date: scheduledDate };
        const sequence = EVENT_INSTANCE_INDEX.nextSequenceFor(seed.domain, seed.category, seed.date);
        const eventId = composeEventInstanceId(seed, sequence);
        const createdAt = nowISO();
        const instance: EventInstance = {
          eventId,
          sourceEventId,
          scheduledDate,
          generatedFrom,
          status: 'scheduled',
          lockState: 'unlocked',
          folderPath: resolveEventFolder(eventId).folderPath,
          createdAt,
          updatedAt: createdAt,
          createdBy: createdBy ?? useEnforcementStore.getState().actor.displayName,
        };
        set(prev => ({
          eventInstancesById: { ...prev.eventInstancesById, [eventId]: instance },
          eventInstanceIdsBySourceEventId: {
            ...prev.eventInstanceIdsBySourceEventId,
            [sourceEventId]: [...(prev.eventInstanceIdsBySourceEventId[sourceEventId] ?? []), eventId],
          },
          taskAuditByEventId: {
            ...prev.taskAuditByEventId,
            [eventId]: appendExecutionAudit(prev.taskAuditByEventId[eventId] ?? [], {
              auditId: nextAuditId(),
              eventId,
              entityType: 'eventInstance',
              entityId: eventId,
              action: 'event_instance.create_manual',
              actorId: useEnforcementStore.getState().actor.userId,
              actorRole: useEnforcementStore.getState().actor.role,
              timestamp: createdAt,
              after: instance,
            }),
          },
        }));
        get().appendTaskAuditEvent(eventId, 'formInstance', instance.id, 'FORM_INSTANCE_CREATED', {
          after: { formId, workflowId, policyIds },
        });
        return instance;
      },

      updateEventInstance: (eventId, patch) => {
        const current = get().eventInstancesById[eventId];
        if (!current) return null;
        if (patch.status && patch.status !== current.status && !canTransitionEventInstance(current.status, patch.status)) {
          return null;
        }
        const updated: EventInstance = { ...current, ...patch, updatedAt: nowISO() };
        set(prev => ({
          eventInstancesById: { ...prev.eventInstancesById, [eventId]: updated },
          taskAuditByEventId: {
            ...prev.taskAuditByEventId,
            [eventId]: appendExecutionAudit(prev.taskAuditByEventId[eventId] ?? [], {
              auditId: nextAuditId(),
              eventId,
              entityType: 'eventInstance',
              entityId: eventId,
              action: 'event_instance.update',
              actorId: useEnforcementStore.getState().actor.userId,
              actorRole: useEnforcementStore.getState().actor.role,
              timestamp: updated.updatedAt,
              before: current,
              after: updated,
            }),
          },
        }));
        return updated;
      },

      cancelEventInstance: (eventId, reason) => {
        const current = get().eventInstancesById[eventId];
        if (!current) return null;
        if (!canTransitionEventInstance(current.status, 'cancelled')) return null;
        const updated = get().updateEventInstance(eventId, {
          status: 'cancelled',
          lockState: 'locked',
          certificationState: current.certificationState,
        });
        if (!updated) return null;
        set(prev => ({
          taskAuditByEventId: {
            ...prev.taskAuditByEventId,
            [eventId]: appendExecutionAudit(prev.taskAuditByEventId[eventId] ?? [], {
              auditId: nextAuditId(),
              eventId,
              entityType: 'eventInstance',
              entityId: eventId,
              action: 'event_instance.cancel',
              actorId: useEnforcementStore.getState().actor.userId,
              actorRole: useEnforcementStore.getState().actor.role,
              timestamp: nowISO(),
              before: current,
              after: updated,
              reason,
            }),
          },
        }));
        return updated;
      },

      certifyEventInstance: (eventId, certificationInput) => {
        const current = get().eventInstancesById[eventId];
        if (!current) return null;
        if (!canTransitionEventInstance(current.status, 'certified')) return null;
        const sourceEventId = resolveCanonicalEventId(eventId);
        const sourceEvent = SOURCE_EVENT_BY_ID[sourceEventId];
        const tasks = (get().taskOverridesByEventId[eventId] ?? []).map(task => ({ ...task }));
        const forms = sourceEvent
          ? sourceEvent.requiredForms.map(form => ({
              formId: form.formId ?? form.id,
              status: get().effectiveFormStatus(sourceEvent, form.id),
            }))
          : [];
        const evidence = (get().evidence[eventId] ?? []).map(item => ({
          evidenceId: item.id,
          taskId: item.taskId,
          objectPath: item.objectPath,
          checksum: item.checksum,
        }));
        const snapshotTimestamp = nowISO();
        const updated: EventInstance = {
          ...current,
          status: 'certified',
          lockState: 'certified',
          certificationState: {
            certifiedAt: nowISO(),
            certifiedBy: certificationInput.certifiedBy ?? useEnforcementStore.getState().actor.displayName,
            certificationId: certificationInput.certificationId ?? `CERT-${eventId}-${Date.now().toString(36)}`,
          },
          certificationSnapshot: current.certificationSnapshot ?? {
            tasks,
            forms,
            evidence,
            timestamp: snapshotTimestamp,
          },
          updatedAt: nowISO(),
        };
        set(prev => ({
          eventInstancesById: { ...prev.eventInstancesById, [eventId]: updated },
          taskAuditByEventId: {
            ...prev.taskAuditByEventId,
            [eventId]: appendExecutionAudit(prev.taskAuditByEventId[eventId] ?? [], {
              auditId: nextAuditId(),
              eventId,
              entityType: 'eventInstance',
              entityId: eventId,
              action: 'event_instance.certify',
              actorId: useEnforcementStore.getState().actor.userId,
              actorRole: useEnforcementStore.getState().actor.role,
              timestamp: updated.updatedAt,
              before: current,
              after: updated,
              reason: certificationInput.reason,
            }),
          },
        }));
        return updated;
      },

      createTask: (eventId, task, opts) => {
        const enf = useEnforcementStore.getState();
        const state = get();
        const canonicalEventId = resolveCanonicalEventId(eventId);
        const instance = state.eventInstancesById[eventId];
        const isCertified = !!state.certifications[eventId] || !!state.certifications[canonicalEventId] || instance?.lockState === 'certified';
        if ((enf.isLocked(eventId) || enf.isLocked(canonicalEventId) || isCertified) && !canBypassCertification(opts?.adminOverride)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'task', reason: 'createTask blocked for locked/certified event.' });
          return '';
        }
        const existing = state.taskOverridesByEventId[eventId] ?? [];
        const folder = resolveEventFolder(eventId);
        const createdAt = nowISO();
        const taskSourceType = task.taskSourceType ?? task.source ?? 'manual';
        const taskSourceId = task.taskSourceId
          ?? (taskSourceType === 'manual' ? `manual:${Date.now().toString(36)}` : `generated:${Date.now().toString(36)}`);
        const id = task.id?.trim() || stableTaskId(eventId, taskSourceId);
        const sourceMatch = existing.find(candidate => candidate.taskSourceId === taskSourceId || candidate.id === id);
        if (sourceMatch) {
          return sourceMatch.id;
        }
        const nextTask: EventTask = {
          id,
          eventId,
          taskSourceId,
          taskSourceType,
          isRequired: task.isRequired ?? false,
          requirementSource: task.requirementSource ?? 'system',
          workflowId: task.workflowId,
          policyIds: task.policyIds ?? [],
          formIds: task.formIds ?? [],
          title: task.title?.trim() || 'Manual Task',
          description: task.description,
          source: task.source ?? 'manual',
          status: task.status ?? 'not_started',
          ownerRole: task.ownerRole,
          ownerUserId: task.ownerUserId,
          dueDate: task.dueDate,
          folderPath: task.folderPath ?? folder.paths.tasksDir,
          createdAt,
          updatedAt: createdAt,
          deletedAt: undefined,
          isDeleted: false,
          blockedReason: task.blockedReason,
        };
        set(prev => ({
          taskOverridesByEventId: {
            ...prev.taskOverridesByEventId,
            [eventId]: [...existing, nextTask],
          },
          taskAuditByEventId: {
            ...prev.taskAuditByEventId,
            [eventId]: appendExecutionAudit(prev.taskAuditByEventId[eventId] ?? [], {
              auditId: nextAuditId(),
              eventId,
              entityType: 'task',
              entityId: id,
              action: 'task.create',
              actorId: enf.actor.userId,
              actorRole: enf.actor.role,
              timestamp: createdAt,
              after: nextTask,
              reason: opts?.reason,
            }),
          },
        }));
        enf.log({ action: 'step.status.changed', eventId, targetKind: 'task', targetId: id, after: nextTask });
        return id;
      },

      updateTask: (eventId, taskId, patch, opts) => {
        const enf = useEnforcementStore.getState();
        const state = get();
        const canonicalEventId = resolveCanonicalEventId(eventId);
        const instance = state.eventInstancesById[eventId];
        const isCertified = !!state.certifications[eventId] || !!state.certifications[canonicalEventId] || instance?.lockState === 'certified';
        if ((enf.isLocked(eventId) || enf.isLocked(canonicalEventId) || isCertified) && !canBypassCertification(opts?.adminOverride)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'task', targetId: taskId, reason: 'updateTask blocked for locked/certified event.' });
          return false;
        }
        const existing = state.taskOverridesByEventId[eventId] ?? [];
        const before = existing.find(t => t.id === taskId);
        if (!before) return false;
        const nextStatus = patch.status ?? before.status;
        if (nextStatus !== before.status && !canTransitionTaskStatus(before.status, nextStatus)) {
          return false;
        }
        if (before.status === 'completed' && nextStatus === 'completed' && !opts?.reason) {
          return false;
        }
        if (before.isRequired && nextStatus === 'cancelled' && !opts?.reason) {
          return false;
        }
        if (nextStatus === 'blocked' && !patch.blockedReason && !before.blockedReason) {
          return false;
        }
        if (nextStatus === 'completed' && !opts?.reason) {
          const sourceEventId = resolveCanonicalEventId(eventId);
          const sourceEvent = SOURCE_EVENT_BY_ID[sourceEventId];
          const requiredFormsSatisfied = before.formIds.length === 0 || before.formIds.every(formId => {
            const requiredForm = sourceEvent?.requiredForms.find(form => form.id === formId || form.formId === formId);
            if (!sourceEvent || !requiredForm) return false;
            return get().effectiveFormStatus(sourceEvent, requiredForm.id) === 'complete';
          });
          const evidenceForTask = (state.evidence[eventId] ?? []).filter(evidence => evidence.taskId === taskId && isEvidenceUsable(evidence.status));
          const evidenceRequired = before.source === 'approval' || before.taskSourceType === 'minutes';
          const requiredEvidenceSatisfied = !evidenceRequired || evidenceForTask.length > 0;
          if (!requiredFormsSatisfied || !requiredEvidenceSatisfied) {
            return false;
          }
        }
        const updated: EventTask = { ...before, ...patch, id: before.id, eventId, updatedAt: nowISO() };
        set(prev => ({
          taskOverridesByEventId: {
            ...prev.taskOverridesByEventId,
            [eventId]: (prev.taskOverridesByEventId[eventId] ?? []).map(t =>
              (t.taskSourceId === before.taskSourceId || t.id === taskId ? updated : t),
            ),
          },
          taskAuditByEventId: {
            ...prev.taskAuditByEventId,
            [eventId]: appendExecutionAudit(prev.taskAuditByEventId[eventId] ?? [], {
              auditId: nextAuditId(),
              eventId,
              entityType: 'task',
              entityId: taskId,
              action: 'task.update',
              actorId: enf.actor.userId,
              actorRole: enf.actor.role,
              timestamp: updated.updatedAt,
              before,
              after: updated,
              reason: opts?.reason,
            }),
          },
        }));
        const evaluated = evaluateAndApplyEventState(get(), eventId);
        if (evaluated) {
          set(current => ({
            eventInstancesById: { ...current.eventInstancesById, [evaluated.eventId]: evaluated },
          }));
        }
        enf.log({ action: 'step.status.changed', eventId, targetKind: 'task', targetId: taskId, before, after: updated });
        return true;
      },

      softDeleteTask: (eventId, taskId, opts) => {
        const task = (get().taskOverridesByEventId[eventId] ?? []).find(entry => entry.id === taskId);
        if (task?.isRequired && !opts?.reason) return false;
        return get().updateTask(eventId, taskId, { isDeleted: true, deletedAt: nowISO(), status: 'cancelled' }, opts);
      },

      restoreTask: (eventId, taskId, opts) => {
        return get().updateTask(eventId, taskId, { isDeleted: false, deletedAt: undefined, status: 'not_started' }, opts);
      },

      generateTaskFromForm: (eventId, formId, opts) => {
        const id = get().createTask(eventId, {
          title: `Complete form ${formId}`,
          formIds: [formId],
          source: 'generated',
          taskSourceType: 'requiredForm',
          taskSourceId: `form:${formId}`,
          status: 'not_started',
        }, opts);
        if (!id) return '';
        const enf = useEnforcementStore.getState();
        set(prev => ({
          taskAuditByEventId: {
            ...prev.taskAuditByEventId,
            [eventId]: appendExecutionAudit(prev.taskAuditByEventId[eventId] ?? [], {
              auditId: nextAuditId(),
              eventId,
              entityType: 'task',
              entityId: id,
              action: 'task.generate_from_form',
              actorId: enf.actor.userId,
              actorRole: enf.actor.role,
              timestamp: nowISO(),
              after: { formId, taskId: id },
            }),
          },
        }));
        return id;
      },

      generateTaskFromWorkflowStep: (eventId, stepId, opts) => {
        const id = get().createTask(eventId, {
          title: `Workflow step ${stepId}`,
          source: 'generated',
          taskSourceType: 'processFlow',
          taskSourceId: `processFlow:${stepId}`,
          status: 'not_started',
        }, opts);
        if (!id) return '';
        const enf = useEnforcementStore.getState();
        set(prev => ({
          taskAuditByEventId: {
            ...prev.taskAuditByEventId,
            [eventId]: appendExecutionAudit(prev.taskAuditByEventId[eventId] ?? [], {
              auditId: nextAuditId(),
              eventId,
              entityType: 'task',
              entityId: id,
              action: 'task.generate_from_workflow_step',
              actorId: enf.actor.userId,
              actorRole: enf.actor.role,
              timestamp: nowISO(),
              after: { stepId, taskId: id },
            }),
          },
        }));
        return id;
      },

      generateFormInstance: (eventId, formId, policyIds, workflowId) => {
        const enf = useEnforcementStore.getState();
        const state = get();
        const canonicalEventId = resolveCanonicalEventId(eventId);
        if ((enf.isLocked(eventId) || enf.isLocked(canonicalEventId) || !!state.certifications[eventId] || !!state.certifications[canonicalEventId]) && !canBypassCertification(false)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'form', targetId: formId, reason: 'generateFormInstance blocked for locked/certified event.' });
          return null;
        }
        const folder = resolveEventFolder(eventId);
        const existing = (state.generatedFormInstancesByEventId[eventId] ?? [])
          .filter(i => i.formId === formId && i.status !== 'SUPERSEDED');
        const sequence = existing.length + 1;
        const instance: EventFormInstance = {
          id: `FI-${eventId}-${formId}-${String(sequence).padStart(3, '0')}`,
          eventId,
          formId,
          policyIds,
          workflowId,
          folderPath: folder.paths.formsCompletedDir,
          status: 'IN_PROGRESS',
          sequence,
          createdAt: nowISO(),
        };
        set(prev => ({
          generatedFormInstancesByEventId: {
            ...prev.generatedFormInstancesByEventId,
            [eventId]: [instance, ...(prev.generatedFormInstancesByEventId[eventId] ?? [])],
          },
          taskAuditByEventId: {
            ...prev.taskAuditByEventId,
            [eventId]: appendExecutionAudit(prev.taskAuditByEventId[eventId] ?? [], {
              auditId: nextAuditId(),
              eventId,
              entityType: 'formInstance',
              entityId: instance.id,
              action: 'FORM_INSTANCE_CREATED',
              actorId: enf.actor.userId,
              actorRole: enf.actor.role,
              timestamp: instance.createdAt,
              after: instance,
            }),
          },
        }));
        return instance;
      },

      getOrCreateFormInstance: ({ eventId, formId, taskId, requirementId, policyIds, workflowId }) => {
        const enf = useEnforcementStore.getState();
        const state = get();
        const canonicalEventId = resolveCanonicalEventId(eventId);
        if ((enf.isLocked(eventId) || enf.isLocked(canonicalEventId) || !!state.certifications[eventId] || !!state.certifications[canonicalEventId]) && !canBypassCertification(false)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'form', targetId: formId, reason: 'getOrCreateFormInstance blocked for locked/certified event.' });
          return null;
        }
        const existing = (state.generatedFormInstancesByEventId[eventId] ?? []).find(i => {
          if (i.formId !== formId) return false;
          if (i.status === 'SUPERSEDED') return false;
          if (taskId && i.taskId && i.taskId !== taskId) return false;
          if (requirementId && i.requirementId && i.requirementId !== requirementId) return false;
          return true;
        });
        if (existing) return existing;

        const folder = resolveEventFolder(eventId);
        const allForForm = (state.generatedFormInstancesByEventId[eventId] ?? []).filter(i => i.formId === formId);
        const sequence = allForForm.length + 1;
        const instance: EventFormInstance = {
          id: `FI-${eventId}-${formId}-${String(sequence).padStart(3, '0')}`,
          eventId,
          formId,
          taskId,
          requirementId,
          policyIds,
          workflowId,
          folderPath: folder.paths.formsCompletedDir,
          status: 'IN_PROGRESS',
          sequence,
          createdAt: nowISO(),
        };
        set(prev => ({
          generatedFormInstancesByEventId: {
            ...prev.generatedFormInstancesByEventId,
            [eventId]: [instance, ...(prev.generatedFormInstancesByEventId[eventId] ?? [])],
          },
          taskAuditByEventId: {
            ...prev.taskAuditByEventId,
            [eventId]: appendExecutionAudit(prev.taskAuditByEventId[eventId] ?? [], {
              auditId: nextAuditId(),
              eventId,
              entityType: 'formInstance',
              entityId: instance.id,
              action: 'FORM_INSTANCE_CREATED',
              actorId: enf.actor.userId,
              actorRole: enf.actor.role,
              timestamp: instance.createdAt,
              after: { ...instance, taskId, requirementId },
            }),
          },
        }));
        return instance;
      },

      setFormInstanceStatus: (eventId, instanceId, status) => {
        const now = nowISO();
        const enf = useEnforcementStore.getState();
        set(prev => {
          const instances = prev.generatedFormInstancesByEventId[eventId] ?? [];
          const updated = instances.map(i =>
            i.id === instanceId ? { ...i, status, updatedAt: now } : i
          );
          const instance = updated.find(i => i.id === instanceId);
          const auditAction = status === 'COMPLETED' ? 'FORM_COMPLETED'
            : status === 'LOCKED' ? 'FORM_LOCKED'
            : status === 'SIGNED' ? 'FORM_SIGNED'
            : status === 'SUPERSEDED' ? 'FORM_SUPERSEDED'
            : 'FORM_STATUS_CHANGED';
          return {
            generatedFormInstancesByEventId: {
              ...prev.generatedFormInstancesByEventId,
              [eventId]: updated,
            },
            taskAuditByEventId: {
              ...prev.taskAuditByEventId,
              [eventId]: appendExecutionAudit(prev.taskAuditByEventId[eventId] ?? [], {
                auditId: nextAuditId(),
                eventId,
                entityType: 'formInstance',
                entityId: instanceId,
                action: auditAction,
                actorId: enf.actor.userId,
                actorRole: enf.actor.role,
                timestamp: now,
                after: instance ? { instanceId, status, formId: instance.formId, taskId: instance.taskId, requirementId: instance.requirementId } : { instanceId, status },
              }),
            },
          };
        });
      },

      appendTaskAuditEvent: (eventId, entityType, entityId, action, opts) => {
        const enf = useEnforcementStore.getState();
        set(prev => ({
          taskAuditByEventId: {
            ...prev.taskAuditByEventId,
            [eventId]: appendExecutionAudit(prev.taskAuditByEventId[eventId] ?? [], {
              auditId: nextAuditId(),
              eventId,
              entityType,
              entityId,
              action,
              actorId: enf.actor.userId,
              actorRole: enf.actor.role,
              timestamp: nowISO(),
              before: opts?.before,
              after: opts?.after,
              reason: opts?.reason,
            }),
          },
        }));
      },

      evaluateTaskCertificationGate: (eventId, taskId) => {
        const state = get();
        const task = (state.taskOverridesByEventId[eventId] ?? []).find(item => item.id === taskId && !item.isDeleted);
        if (!task) {
          return {
            canComplete: false,
            message: 'Task not found in the current event execution context.',
            blockers: ['Task not found'],
          };
        }
        const sourceEvent = SOURCE_EVENT_BY_ID[resolveCanonicalEventId(eventId)];
        const missingForms = task.formIds.filter(formId => {
          const requiredForm = sourceEvent?.requiredForms.find(form => form.id === formId || form.formId === formId);
          if (!sourceEvent || !requiredForm) return true;
          return get().effectiveFormStatus(sourceEvent, requiredForm.id) !== 'complete';
        });
        const usableEvidence = (state.evidence[eventId] ?? []).filter(item => item.taskId === taskId && isEvidenceUsable(item.status));
        const hasSupportingEvidence = usableEvidence.length > 0;
        const signatureRequests = state.approvals.filter(item =>
          item.eventId === eventId
          && item.targetKind === 'form'
          && item.targetId
          && task.formIds.includes(item.targetId),
        );
        const approvedSignatures = signatureRequests.filter(item => item.status === 'approved').length;
        const requiredSignatureTarget = task.formIds.length > 0 ? 1 : 0;
        const signaturesSatisfied = requiredSignatureTarget === 0 || approvedSignatures >= requiredSignatureTarget;
        const packageReady = usableEvidence.some(item => item.status === 'EVIDENCE_LOCKED') || usableEvidence.length > 0;
        const blockers: string[] = [];
        if (missingForms.length > 0) blockers.push(`Missing required form completion: ${missingForms.join(', ')}`);
        if (!hasSupportingEvidence) blockers.push('Missing required supporting evidence upload');
        if (!signaturesSatisfied) blockers.push('Required signature is still pending');
        if (!packageReady) blockers.push('Evidence package is not certified or locked');
        return {
          canComplete: blockers.length === 0,
          message: blockers.length === 0
            ? 'Task requirements satisfied.'
            : 'Cannot complete this task yet. Complete the required form, supporting evidence, and signature requirements first.',
          blockers,
        };
      },

      attemptCompleteTask: (eventId, taskId) => {
        const gate = get().evaluateTaskCertificationGate(eventId, taskId);
        if (!gate.canComplete) {
          get().appendTaskAuditEvent(eventId, 'task', taskId, 'TASK_COMPLETION_BLOCKED', {
            reason: gate.blockers.join(' | ') || gate.message,
            after: { blockers: gate.blockers },
          });
          return gate;
        }
        const existing = (get().taskOverridesByEventId[eventId] ?? []).find(item => item.id === taskId);
        let updated = true;
        if (existing && existing.status === 'not_started') {
          updated = get().updateTask(eventId, taskId, { status: 'in_progress' }, {
            reason: 'REQUIREMENT_COMPLETED',
          });
        }
        if (updated) {
          updated = get().updateTask(eventId, taskId, { status: 'completed' }, {
            reason: 'REQUIREMENT_COMPLETED',
          });
        }
        if (!updated) {
          return {
            canComplete: false,
            message: 'Task completion failed due to a concurrent lock or transition rule.',
            blockers: ['Task status update was rejected by transition guards'],
          };
        }
        get().appendTaskAuditEvent(eventId, 'task', taskId, 'TASK_CERTIFIED', {
          after: { status: 'completed' },
        });
        return {
          canComplete: true,
          message: 'Task completion and certification recorded.',
          blockers: [],
        };
      },

      /* ── certification ──
         Builds on markEventComplete but enforces the stricter
         closure gate: every required approval must be recorded,
         minutes (if required) must be finalized, and validation
         must report zero blockers. Writes an immutable receipt
         and hard-locks the instance. */
      certifyEventComplete: (event, certifier = CURRENT_USER, certifierRole, note) => {
        const enf = useEnforcementStore.getState();
        const s = get();
        const instance = s.ensureEventInstance(event);
        const derivedTasks = deriveDefaultEventTasks(event, instance.eventId, {
          stepStatusById: Object.fromEntries(event.processFlow.map(step => [step.id, s.effectiveStepStatus(event, step.id)])),
          formStatusById: Object.fromEntries(event.requiredForms.map(form => [form.id, s.effectiveFormStatus(event, form.id)])),
          approvalsById: Object.fromEntries(s.approvals.filter(ap => ap.eventId === event.id).map(ap => [ap.id, ap.status])),
        });
        const overrides = s.taskOverridesByEventId[instance.eventId] ?? [];
        const requiredTasks = [...derivedTasks, ...overrides]
          .filter(task => task.isRequired && !task.isDeleted)
          .filter((task, idx, arr) => arr.findIndex(other => other.taskSourceId === task.taskSourceId) === idx);
        const incompleteRequiredTasks = requiredTasks.filter(task => task.status !== 'completed');
        if (incompleteRequiredTasks.length > 0) {
          return {
            ok: false,
            message: `Cannot certify: ${incompleteRequiredTasks.length} required task(s) incomplete.`,
          };
        }

        if (s.certifications[event.id]) {
          return { ok: false, message: 'Event is already certified. Revoke the prior certification to re-run.' };
        }

        const report = s.validateEvent(event);
        if (!report.canComplete) {
          enf.log({
            action: 'mutation.blocked',
            eventId: event.id,
            reason: `Certification refused — ${report.blockers.length} blocker(s): ${report.blockers.slice(0, 3).map(b => `${b.kind}:${b.label}`).join(', ')}`,
          });
          return {
            ok: false,
            message: `Cannot certify: ${report.blockers.length} outstanding item${report.blockers.length === 1 ? '' : 's'}.`,
          };
        }

        // Every required approval rule must be satisfied before certification.
        const requiredRules = (event.approvals ?? []).filter(r => r.required);
        const allRulesApproved = requiredRules.every(r =>
          s.approvals.some(a =>
            a.eventId === event.id &&
            a.targetKind === r.targetKind &&
            a.targetLabel === r.targetLabel &&
            a.status === 'approved',
          ),
        );
        if (!allRulesApproved) {
          return {
            ok: false,
            message: 'Cannot certify: one or more required approvals are missing or not yet approved.',
          };
        }

        // If not yet marked complete, mark complete first (uses the full enforcement gate).
        if (!s.isEventComplete(event.id)) {
          const markRes = s.markEventComplete(event);
          if (!markRes.ok) return { ok: false, message: markRes.message };
        }

        // SLA grace gate: a validation-clean instance can certify up to
        // `SLA_GRACE_DAYS` past due (recorded as an exception below). Beyond
        // that window, certification is refused — the operator must either
        // escalate/document the delay or revoke + recreate the workflow.
        {
          const eventDateMs = new Date(event.date).getTime();
          const nowMs = Date.now();
          const daysPast = Math.floor((nowMs - eventDateMs) / (24 * 60 * 60 * 1000));
          const SLA_GRACE_DAYS = 3;
          if (daysPast > SLA_GRACE_DAYS) {
            enf.log({
              action: 'mutation.blocked',
              eventId: event.id,
              reason: `Certification refused — ${daysPast} days past SLA, beyond ${SLA_GRACE_DAYS}-day grace window.`,
            });
            return {
              ok: false,
              message: `Cannot certify: ${daysPast} days past SLA (beyond the ${SLA_GRACE_DAYS}-day grace window). Revoke and reopen the workflow or escalate for an exception override.`,
            };
          }
        }

        // Build snapshot from the validation that just passed.
        const evidenceCount = (get().evidence[event.id] || []).length;
        const notesCount    = (get().notes[event.id] || []).length;
        const approvalsForEvent = get().approvals.filter(a => a.eventId === event.id);
        const approvalsApproved = approvalsForEvent.filter(a => a.status === 'approved').length;

        const eventDate = new Date(event.date);
        const today = new Date();
        const slaDaysPastDue = Math.max(
          0,
          Math.floor((today.getTime() - eventDate.getTime()) / (24 * 60 * 60 * 1000)),
        );

        const snapshot: CertificationSnapshot = {
          stepsComplete: report.progress.stepsComplete,
          stepsTotal: report.progress.stepsTotal,
          formsComplete: report.progress.formsComplete,
          formsTotal: report.progress.formsTotal,
          minutesRequired: report.progress.minutesRequired,
          minutesFinalized: report.progress.minutesFinalized,
          approvalsRequired: requiredRules.length,
          approvalsApproved,
          evidenceCount,
          notesCount,
          slaDaysPastDue,
        };

        // Certifying past SLA (but validation-clean) = grace-window exception.
        // The gate still allowed certification, but we annotate the record so
        // surveyors can see the exception when reviewing the audit export.
        const SLA_GRACE_DAYS = 3; // kept local to avoid a cross-layer import
        const disposition: CertificationDisposition =
          slaDaysPastDue > 0 && slaDaysPastDue <= SLA_GRACE_DAYS
            ? 'certified-with-exception'
            : 'standard';
        const exceptionReason = disposition === 'certified-with-exception'
          ? `Certified ${slaDaysPastDue} day${slaDaysPastDue === 1 ? '' : 's'} past SLA within the ${SLA_GRACE_DAYS}-day grace window. All required checks passed.`
          : undefined;

        const record: CertificationRecord = {
          eventId: event.id,
          certifiedAt: nowISO(),
          certifiedBy: certifier,
          certifierRole,
          certifierNote: note?.trim() || undefined,
          snapshot,
          auditPacketRef: `AP-${event.id}-${Date.now().toString(36)}`,
          disposition,
          exceptionReason,
        };

        set(state => ({
          certifications: { ...state.certifications, [event.id]: record },
        }));
        s.certifyEventInstance(instance.eventId, {
          certifiedBy: certifier,
          certificationId: record.auditPacketRef,
          reason: note,
        });

        // Hard-lock the instance. Role defaults to the event-level approver if defined.
        const unlockRole = event.approvals?.find(a => a.targetKind === 'event')?.approverRole ?? certifierRole ?? 'Administrator';
        if (!enf.isLocked(event.id)) {
          enf.lock(event.id, `Certified complete by ${certifier}${certifierRole ? ` (${certifierRole})` : ''}.`, unlockRole);
        }

        enf.log({
          action: 'event.completed',
          eventId: event.id,
          targetKind: 'event',
          actorOverride: certifier,
          reason: `Event certified complete and locked${certifierRole ? ` by ${certifierRole}` : ''}.`,
          after: { certifiedAt: record.certifiedAt, auditPacketRef: record.auditPacketRef, snapshot },
        });

        return { ok: true, message: 'Event certified complete.', record };
      },

      revokeCertification: (eventId, reason, actor = CURRENT_USER) => {
        const prev = get().certifications[eventId];
        if (!prev) return { ok: false, message: 'No certification to revoke.' };
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          const unlock = enf.unlock(eventId, `Certification revoked: ${reason}`);
          if (!unlock.ok) {
            return { ok: false, message: unlock.message ?? 'Unable to unlock for revocation.' };
          }
        }
        set(state => {
          const next = { ...state.certifications };
          delete next[eventId];
          return { certifications: next };
        });
        const instanceId = EVENT_INSTANCE_INDEX.bySourceEventId[eventId] ?? eventId;
        const instance = get().eventInstancesById[instanceId];
        if (instance && instance.status === 'certified') {
          get().updateEventInstance(instanceId, { status: 'completed', lockState: 'locked', certificationState: undefined });
        }
        enf.log({
          action: 'event.reopened',
          eventId,
          targetKind: 'event',
          actorOverride: actor,
          reason: `Certification revoked: ${reason}`,
          before: prev,
        });
        return { ok: true, message: 'Certification revoked. Instance is reopened.' };
      },

      isCertified: eventId => !!get().certifications[eventId],
      getCertification: eventId => get().certifications[eventId],

      /* ── selectors ── */
      effectiveStepStatus: (event, stepId) => {
        const override = get().stepStates[sKey(event.id, stepId)];
        if (override) return override.status;
        const seed = event.processFlow.find(s => s.id === stepId);
        return (seed?.status as StepStatus) || 'pending';
      },

      effectiveFormStatus: (event, formId) => {
        const approvals = get().approvals;
        const approvedViaESign = approvals.some(a =>
          a.eventId === event.id &&
          a.targetKind === 'form' &&
          a.targetId === formId &&
          a.status === 'approved',
        );
        if (approvedViaESign) return 'complete';

        const override = get().formStates[fKey(event.id, formId)];
        if (override) return override.status;

        const pendingESign = approvals.some(a =>
          a.eventId === event.id &&
          a.targetKind === 'form' &&
          a.targetId === formId &&
          a.status === 'pending',
        );
        if (pendingESign) return 'in-progress';

        const seed = event.requiredForms.find(f => f.id === formId);
        return (seed?.status as FormStatus) || 'pending';
      },

      effectiveMinutesStatus: event => {
        if (!event.minutes) return null;
        return (get().minutesStates[event.id]?.status) || event.minutes.status;
      },

      effectiveUrgency: event => {
        const completion = get().completions[event.id];
        if (completion?.status === 'complete') return 'complete';
        return event.urgency;
      },

      isEventComplete: eventId => get().completions[eventId]?.status === 'complete',

      /* ── completion validation ── */
      validateEvent: event => {
        const s = get();
        const stepsTotal = event.processFlow.length;
        const stepsComplete = event.processFlow.filter(st => s.effectiveStepStatus(event, st.id) === 'complete').length;

        const formsTotal = event.requiredForms.length;
        const formsComplete = event.requiredForms.filter(f => s.effectiveFormStatus(event, f.id) === 'complete').length;

        const minutesRequired = !!event.minutes;
        const minutesEffective = s.effectiveMinutesStatus(event);
        const minutesFinalized = minutesRequired ? minutesEffective === 'finalized' : true;

        const blockers: ValidationReport['blockers'] = [];

        event.processFlow.forEach(st => {
          if (s.effectiveStepStatus(event, st.id) !== 'complete') {
            blockers.push({ kind: 'step', label: st.label, targetId: st.id });
          }
        });
        event.requiredForms.forEach(f => {
          if (s.effectiveFormStatus(event, f.id) !== 'complete') {
            blockers.push({ kind: 'form', label: f.label, targetId: f.id });
          }
        });
        if (minutesRequired && !minutesFinalized) {
          blockers.push({ kind: 'minutes', label: 'Meeting minutes finalization' });
        }
        const pendingApprovals = s.approvals.filter(a => a.eventId === event.id && a.status === 'pending');
        pendingApprovals.forEach(a => blockers.push({ kind: 'approval', label: a.targetLabel, targetId: a.id }));

        return {
          canComplete: blockers.length === 0 && stepsTotal > 0,
          blockers,
          progress: { stepsComplete, stepsTotal, formsComplete, formsTotal, minutesRequired, minutesFinalized },
        };
      },

      markEventComplete: event => {
        const enf = useEnforcementStore.getState();
        const instance = get().ensureEventInstance(event);
        if (instance.status === 'scheduled') {
          get().updateEventInstance(instance.eventId, { status: 'in_progress' });
        }
        if (enf.isLocked(event.id)) {
          return { ok: false, message: `Event is locked. Unlock (role: ${enf.getLock(event.id)?.unlockRole ?? 'Administrator'}) before completion.` };
        }
        // Delegate to the enforcement engine for the authoritative gate.
        const s = get();
        const report = computeEnforcement({
          event,
          stepStatus: id => s.effectiveStepStatus(event, id),
          formStatus: id => s.effectiveFormStatus(event, id),
          minutesStatus: () => s.effectiveMinutesStatus(event),
          evidence: s.evidence[event.id] ?? [],
          approvals: s.approvals.filter(a => a.eventId === event.id),
          completion: s.completions[event.id],
          lock: enf.getLock(event.id),
          isComplete: id => s.completions[id]?.status === 'complete',
        });
        if (!report.canComplete) {
          enf.log({
            action: 'mutation.blocked',
            eventId: event.id,
            reason: `markEventComplete refused — ${report.summary}`,
            riskLevel: report.riskLevel,
          });
          return { ok: false, message: `Cannot mark complete: ${report.summary}` };
        }
        set(state => ({
          completions: {
            ...state.completions,
            [event.id]: { status: 'complete', completedAt: nowISO(), completedBy: CURRENT_USER },
          },
          activeWorkflowEventId: null,
        }));
        get().updateEventInstance(instance.eventId, { status: 'completed' });
        enf.log({
          action: 'event.completed',
          eventId: event.id,
          after: { completedAt: nowISO(), by: CURRENT_USER },
          riskLevel: report.riskLevel,
        });

        // Auto-lock once completion is recorded AND every required approval rule is satisfied.
        const allRulesApproved = (event.approvals ?? [])
          .filter(r => r.required)
          .every(r => get().approvals.some(a =>
            a.targetKind === r.targetKind && a.targetLabel === r.targetLabel && a.status === 'approved',
          ));
        if (allRulesApproved) {
          const unlockRole = event.approvals?.find(a => a.targetKind === 'event')?.approverRole ?? 'Administrator';
          enf.lock(event.id, 'Auto-locked: completion + all required approvals captured.', unlockRole);
        }

        return { ok: true, message: 'Event marked complete.' };
      },

      reopenEvent: eventId => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          const lock = enf.getLock(eventId);
          const unlock = enf.unlock(eventId, 'Event reopened for correction.');
          if (!unlock.ok) return;
          void lock;
        }
        const prev = get().completions[eventId];
        set(state => {
          const next = { ...state.completions };
          delete next[eventId];
          return { completions: next };
        });
        const instanceId = EVENT_INSTANCE_INDEX.bySourceEventId[eventId] ?? eventId;
        const instance = get().eventInstancesById[instanceId];
        if (instance?.status === 'completed') {
          get().updateEventInstance(instanceId, { status: 'in_progress', lockState: 'unlocked' });
        }
        enf.log({ action: 'event.reopened', eventId, before: prev });
      },

      resetAll: () => set({
        formStates: {}, stepStates: {}, minutesStates: {},
        evidence: {}, approvals: [], completions: {},
        notes: {}, certifications: {},
        eventInstancesById: {},
        eventInstanceIdsBySourceEventId: {},
        taskOverridesByEventId: {},
        taskAuditByEventId: {},
        generatedFormInstancesByEventId: {},
        evidenceErrorsByEventId: {},
        activeWorkflowEventId: null,
      }),
    }),
    {
      name: 'reg-execution-v2',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== 'object') return persistedState as RegulatoryExecutionState;
        if (version >= 2) return persistedState as RegulatoryExecutionState;
        const legacy = persistedState as Partial<RegulatoryExecutionState> & { evidence?: unknown };
        return {
          ...legacy,
          evidence: migrateEvidenceRecords(legacy.evidence),
          evidenceErrorsByEventId: legacy.evidenceErrorsByEventId ?? {},
        } as RegulatoryExecutionState;
      },
      partialize: state => ({
        formStates: state.formStates,
        stepStates: state.stepStates,
        minutesStates: state.minutesStates,
        evidence: state.evidence,
        approvals: state.approvals,
        completions: state.completions,
        notes: state.notes,
        certifications: state.certifications,
        eventInstancesById: state.eventInstancesById,
        eventInstanceIdsBySourceEventId: state.eventInstanceIdsBySourceEventId,
        taskOverridesByEventId: state.taskOverridesByEventId,
        taskAuditByEventId: state.taskAuditByEventId,
        generatedFormInstancesByEventId: state.generatedFormInstancesByEventId,
        evidenceErrorsByEventId: state.evidenceErrorsByEventId,
      }),
    },
  ),
);

/* ─── Hook helpers ───────────────────────────────────────
   IMPORTANT: Selectors must return stable references.
   We select the root record/array from the store (stable between
   unrelated updates) and then derive per-event slices with useMemo,
   avoiding the "getSnapshot should be cached" infinite-loop pattern.
   ────────────────────────────────────────────────────── */

const EMPTY_EVIDENCE: EvidenceDoc[] = [];

export function useEventEvidence(eventId: string): EvidenceDoc[] {
  const byEvent = useRegulatoryExecutionStore(state => state.evidence);
  return useMemo(() => byEvent[eventId] || EMPTY_EVIDENCE, [byEvent, eventId]);
}

export function useEventApprovals(eventId: string): ApprovalRequest[] {
  const all = useRegulatoryExecutionStore(state => state.approvals);
  return useMemo(() => all.filter(a => a.eventId === eventId), [all, eventId]);
}

export function useAllPendingApprovalsCount(): number {
  const all = useRegulatoryExecutionStore(state => state.approvals);
  return useMemo(() => all.filter(a => a.status === 'pending').length, [all]);
}

const EMPTY_NOTES: InstanceNote[] = [];

export function useEventNotes(eventId: string): InstanceNote[] {
  const byEvent = useRegulatoryExecutionStore(state => state.notes);
  return useMemo(() => byEvent[eventId] || EMPTY_NOTES, [byEvent, eventId]);
}

export function useEventCertification(eventId: string): CertificationRecord | undefined {
  const byEvent = useRegulatoryExecutionStore(state => state.certifications);
  return useMemo(() => byEvent[eventId], [byEvent, eventId]);
}

export function useCertifiedCount(): number {
  const certs = useRegulatoryExecutionStore(state => state.certifications);
  return useMemo(() => Object.keys(certs).length, [certs]);
}
