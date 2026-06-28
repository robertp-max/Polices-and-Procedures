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
import { buildDeterministicTaskId, deriveDefaultEventTasks } from '@/policy/compliance-execution/eventTaskAdapter';
import { formatCesFormInstanceId } from '@/policy/compliance-execution/cesFormInstanceId';
import {
  buildTaskIdRemapForEventInstance,
  dedupeEventTasksByCanonicalId,
  evidenceTaskIdMatchesTask,
  legacyStableAlternateTaskId,
  mergeDerivedEventTasksWithOverrides,
  normalizeEventTaskIdentity,
} from '@/policy/compliance-execution/taskIdentity';
import {
  stashDemoEvidenceDataUrl,
  clearDemoEvidenceDataUrl,
  clearFormFieldsForIds,
} from '@/policy/evidence/demoEvidenceRuntimeCache';
import {
  clearDemoEcignForEvents,
} from '@/policy/ecign/demoLocalApi';
export interface SignerTask {
  taskId: string;
  formInstanceId: string;
  slotFieldId: string;
  signerIndex: number;
  parentTaskId?: string;
  eventId: string;
  linkedPolicyIds: string[];
  formId: string;
  slotPurpose?: string;
  assignedToRole?: string;
  assignedToName?: string;
  assignedTo?: string;
  status: 'pending' | 'opened' | 'signed' | 'declined' | 'expired';
  declineReason?: string;
  sequenceGroup: number;
  [key: string]: any;
}
import {
  type EvidenceAuditEvent,
  type EvidenceStatus,
  isEvidenceImmutable,
  isEvidenceUsable,
  validateEvidenceUploadInput,
} from '@/policy/evidence/evidenceModel';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { resolveCanonicalFormId } from '@/policy/data/formIdAliases';
import {
  isCesFutureLockedDate,
  isCesSandboxDate,
  FUTURE_LOCKED_GUARD_MSG,
} from '@/policy/ces/cesExecutionMode';

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

export type EvidenceKind =
  | 'minutes'
  | 'report'
  | 'form'
  | 'attachment'
  | 'other'
  | 'signed_certificate'
  | 'signed_package'
  | 'signed_form_instance';

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
  artifactType?: 'evidence' | 'signed_certificate' | 'signed_package' | 'signed_form_instance';
  artifactVersion?: string;
  ecignSessionId?: string;
  signatureSessionId?: string;
  finalizedAt?: string;
  signerName?: string;
  signerRole?: string;
  signerEmail?: string;
  attestationText?: string;
  documentHash?: string | null;
  manifestHash?: string | null;
  signatureHash?: string | null;
  artifactId?: string;
  driveFileId?: string;
  driveFolderId?: string;
  webViewLink?: string;
  driveMimeType?: string;
  driveFilename?: string;
  driveUploadedAt?: string;
  driveUploadStatus?: 'uploaded' | 'failed' | 'pending';
  pdfVersion?: number;
  completedSignerSlotOrder?: number;
  signerUserId?: string;
  signerTier?: number;
  signerDomain?: string;
  priorDocumentHash?: string;
  finalDocumentHash?: string;
  /** SHA-256 over the decoded stored snapshot bytes (used to verify post-refresh fidelity). */
  snapshotSha256?: string;
  auditEventRefs?: string[];
  note?: string;
  lockedAt?: string;
  supersededAt?: string;
  supersededById?: string;
  supersedesEvidenceId?: string;
  localDataUrl?: string;
  /** When true, this row must not be superseded or semantically replaced (set at certification / audit lock). */
  auditFrozen?: boolean;
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
  signerTasksByFormInstanceId: Record<string, SignerTask[]>;

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
    artifactType?: EvidenceDoc['artifactType'];
    artifactVersion?: string;
    ecignSessionId?: string;
    signatureSessionId?: string;
    finalizedAt?: string;
    signerName?: string;
    signerRole?: string;
    signerEmail?: string;
    attestationText?: string;
    documentHash?: string | null;
    manifestHash?: string | null;
    signatureHash?: string | null;
    artifactId?: string;
    driveFileId?: string;
    driveFolderId?: string;
    webViewLink?: string;
    driveMimeType?: string;
    driveFilename?: string;
    driveUploadedAt?: string;
    driveUploadStatus?: 'uploaded' | 'failed' | 'pending';
    pdfVersion?: number;
    completedSignerSlotOrder?: number;
    signerUserId?: string;
    signerTier?: number;
    signerDomain?: string;
    priorDocumentHash?: string;
    finalDocumentHash?: string;
    snapshotSha256?: string;
    auditEventRefs?: string[];
    supersedesEvidenceId?: string;
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
  attachDriveMetadata: (eventId: string, evidenceId: string, meta: { driveFileId?: string; driveFolderId?: string; webViewLink?: string; driveMimeType?: string; driveFilename?: string; driveUploadedAt?: string; driveUploadStatus?: 'uploaded' | 'failed' | 'pending' }) => void;
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
  /**
   * MVP-P0-ECIGN-001 — supersede an existing form instance.
   *
   * Marks the old instance `status='SUPERSEDED'` with `supersededAt` and
   * `supersededBy`, creates a NEW canonical instance with `supersedes`
   * back-pointer and `sequence = oldSeq + 1`, emits TWO audit rows for chain
   * reconstruction, and returns the new instance id (or empty string on
   * failure / locked event / unknown instance).
   *
   * Old row is NEVER deleted (audit defensibility).
   *
   * Use `src/policy/compliance-execution/supersedeChain.ts` helpers to
   * traverse the chain in consumers (artifactToFormInstance, etc.).
   */
  supersedeFormInstance: (
    eventId: string,
    instanceId: string,
    opts?: { reason?: string },
  ) => string;
  appendTaskAuditEvent: (
    eventId: string,
    entityType: EventExecutionAuditEvent['entityType'],
    entityId: string,
    action: string,
    opts?: { before?: unknown; after?: unknown; reason?: string },
  ) => void;
  evaluateTaskCertificationGate: (eventId: string, taskId: string) => TaskCertificationGateReport;
  attemptCompleteTask: (eventId: string, taskId: string) => TaskCertificationGateReport;

  /* ── signer tasks (multi-signer eCIgn) ── */
  createSignerTask: (task: SignerTask) => void;
  updateSignerTaskStatus: (formInstanceId: string, taskId: string, status: SignerTask['status'], extra?: { declineReason?: string }) => void;
  getSignerTasksForInstance: (formInstanceId: string) => SignerTask[];
  getNextPendingSignerTask: (formInstanceId: string) => SignerTask | undefined;

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

  resetEvent: (eventId: string) => void;
  clearAllEvidence: () => void;
  resetAll: () => void;

  /* ── Sandbox reset (Q1/Q2 2026 playground) ── */
  /**
   * Resets a single task's execution state inside a sandbox event.
   * Clears task status, task-linked evidence, form instances, and task audit entries.
   * No-op when the event is not in the Q1/Q2 2026 sandbox period.
   */
  resetSandboxTask: (eventId: string, taskId: string) => void;
  /**
   * Resets all CES events whose date falls in the Q1/Q2 2026 sandbox window
   * (Jan 1 – Jun 30, 2026).  Preserves source templates, workflows, and forms.
   */
  resetAllSandboxQ1Q2: () => void;
  /** Alias for `resetAllSandboxQ1Q2`. */
  resetAllCesSandbox: () => void;
}

const nowISO = () => new Date().toISOString();
const cleanForId = (value: string) => value.replace(/[^A-Za-z0-9-]/g, '-');
const nextAuditId = () => `AUD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const EVENT_INSTANCE_INDEX = buildEventInstanceIndex(REGULATORY_EVENTS);
const SOURCE_EVENT_BY_INSTANCE_ID = Object.fromEntries(
  Object.entries(EVENT_INSTANCE_INDEX.bySourceEventId).map(([sourceId, instanceId]) => [instanceId, sourceId]),
);
const SOURCE_EVENT_BY_ID = Object.fromEntries(REGULATORY_EVENTS.map(event => [event.id, event]));
const resolveCanonicalEventId = (eventId: string) => SOURCE_EVENT_BY_INSTANCE_ID[eventId] ?? eventId;
const FORM_TEMPLATE_IDS = new Set(FORMS_DATASET.map(form => form.id));
const getFormCanon = (id: string | undefined) => (id ? resolveCanonicalFormId(id) ?? id : id);
const EVENT_INSTANCE_ID_BY_SOURCE = EVENT_INSTANCE_INDEX.bySourceEventId;
const getEventAliases = (eventId: string): string[] => {
  const canonical = resolveCanonicalEventId(eventId);
  const instance = EVENT_INSTANCE_ID_BY_SOURCE[canonical];
  return Array.from(new Set([eventId, canonical, instance].filter((value): value is string => Boolean(value))));
};

/**
 * Resolves the canonical ISO date string for any event ID (source or instance).
 * Returns undefined when the event cannot be found in the seed dataset.
 */
function resolveEventDate(eventId: string): string | undefined {
  const sourceId = resolveCanonicalEventId(eventId);
  return SOURCE_EVENT_BY_ID[sourceId]?.date;
}

/**
 * Returns true when the event falls in the locked-future period (Jul 1 2026+).
 * Used as a mutation guard across all write actions.
 */
function isEventFutureLocked(eventId: string): boolean {
  const date = resolveEventDate(eventId);
  return date != null ? isCesFutureLockedDate(date) : false;
}
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

function stripEvidenceLargePayloads(doc: EvidenceDoc): EvidenceDoc {
  // Strip localDataUrl from the persisted store to prevent localStorage quota overflow.
  // For Drive-backed finalized signed packages, the bytes for render are in ces_ev_data_* (via runtime cache).
  // The canonical record requires driveFileId / webViewLink etc. on the EVIDENCE_LOCKED entry.
  if (!doc.localDataUrl) return doc;
  const { localDataUrl: _drop, ...rest } = doc;
  return rest as EvidenceDoc;
}

function compactPersistAuditValue(value: unknown): unknown {
  if (value == null) return value;
  try {
    const s = typeof value === 'string' ? value : JSON.stringify(value);
    if (s.length <= 2400) return value;
    return { _persistTruncated: true, approxLen: s.length };
  } catch {
    return { _persistTruncated: true };
  }
}

function sanitizeTaskAuditForPersist(rows: EventExecutionAuditEvent[] | undefined): EventExecutionAuditEvent[] {
  if (!rows?.length) return [];
  const capped = rows.slice(0, 500);
  return capped.map(row => ({
    ...row,
    before: compactPersistAuditValue(row.before) as EventExecutionAuditEvent['before'],
    after: compactPersistAuditValue(row.after) as EventExecutionAuditEvent['after'],
  }));
}

function migrateRegExecutionV3Shape(state: RegulatoryExecutionState): RegulatoryExecutionState {
  const base = state ?? ({} as RegulatoryExecutionState);
  const next: RegulatoryExecutionState = {
    ...base,
    taskOverridesByEventId: { ...(base.taskOverridesByEventId ?? {}) },
    evidence: { ...(base.evidence ?? {}) },
    generatedFormInstancesByEventId: { ...(base.generatedFormInstancesByEventId ?? {}) },
    eventInstancesById: { ...(base.eventInstancesById ?? {}) },
    taskAuditByEventId: { ...(base.taskAuditByEventId ?? {}) },
  };

  const taskRemaps = new Map<string, Map<string, string>>();

  for (const eventId of Object.keys(next.taskOverridesByEventId)) {
    const canon = resolveCanonicalEventId(eventId);
    const sourceEvent = SOURCE_EVENT_BY_ID[canon];
    const oldRows = next.taskOverridesByEventId[eventId] ?? [];
    const remap = buildTaskIdRemapForEventInstance(eventId, sourceEvent, oldRows);
    taskRemaps.set(eventId, remap);
    const normalizedRows = dedupeEventTasksByCanonicalId(
      oldRows.map(row => normalizeEventTaskIdentity(eventId, { ...row, eventId })),
      `migrateV3:overrides:${eventId}`,
    );
    next.taskOverridesByEventId[eventId] = normalizedRows;
  }

  const remapEvidenceTaskId = (eventId: string, taskId: string): string => {
    const m = taskRemaps.get(eventId);
    if (!m) return taskId;
    return m.get(taskId) ?? taskId;
  };

  next.evidence = Object.fromEntries(
    Object.entries(next.evidence).map(([eventId, docs]) => [
      eventId,
      docs.map(doc => {
        const stripped = stripEvidenceLargePayloads(doc);
        return {
          ...stripped,
          taskId: remapEvidenceTaskId(eventId, stripped.taskId),
        };
      }),
    ]),
  );

  next.generatedFormInstancesByEventId = Object.fromEntries(
    Object.entries(next.generatedFormInstancesByEventId).map(([eventId, rows]) => [
      eventId,
      rows.map(inst => {
        if (!inst.taskId) return inst;
        return { ...inst, taskId: remapEvidenceTaskId(eventId, inst.taskId) };
      }),
    ]),
  );

  next.eventInstancesById = Object.fromEntries(
    Object.entries(next.eventInstancesById).map(([eid, inst]) => {
      if (!inst.certificationSnapshot?.tasks?.length) return [eid, inst];
      const remap = taskRemaps.get(eid) ?? new Map<string, string>();
      const tasks = inst.certificationSnapshot.tasks.map(t => {
        const tid = remap.get(t.id) ?? t.id;
        return normalizeEventTaskIdentity(eid, { ...t, id: tid, eventId: t.eventId ?? eid });
      });
      return [
        eid,
        {
          ...inst,
          certificationSnapshot: {
            ...inst.certificationSnapshot,
            tasks,
          },
        },
      ];
    }),
  );

  next.taskAuditByEventId = Object.fromEntries(
    Object.entries(next.taskAuditByEventId).map(([eventId, rows]) => [
      eventId,
      rows.map(row => {
        if (row.entityType !== 'task') return row;
        const mapped = remapEvidenceTaskId(eventId, row.entityId);
        return mapped === row.entityId ? row : { ...row, entityId: mapped };
      }),
    ]),
  );

  return next;
}

function collectByEventAliases<T>(
  byEvent: Record<string, T[]>,
  eventId: string,
  dedupeKey: (item: T) => string,
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const key of getEventAliases(eventId)) {
    for (const item of (byEvent[key] ?? [])) {
      const marker = dedupeKey(item);
      if (seen.has(marker)) continue;
      seen.add(marker);
      out.push(item);
    }
  }
  return out;
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

/**
 * When true, ensureEventInstance skips writing audit trail entries.
 * Set by reset functions BEFORE calling set() so the post-reset
 * re-renders don't immediately re-populate the audit trail.
 * Stays true for the remainder of the current page lifecycle —
 * the subsequent window.location.reload() starts fresh with false.
 */
let _suppressEnsureAudit = false;

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
      signerTasksByFormInstanceId: {},

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
        if (isEventFutureLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'step', targetId: stepId, reason: FUTURE_LOCKED_GUARD_MSG });
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
        if (isEventFutureLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'step', targetId: stepId, reason: FUTURE_LOCKED_GUARD_MSG });
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
        if (isEventFutureLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'form', targetId: formId, reason: FUTURE_LOCKED_GUARD_MSG });
          return;
        }
        const aliases = getEventAliases(eventId);
        const before = aliases
          .map(alias => get().formStates[fKey(alias, formId)]?.status)
          .find(Boolean) ?? 'pending';
        set(state => ({
          formStates: {
            ...state.formStates,
            ...Object.fromEntries(aliases.map(alias => {
              const key = fKey(alias, formId);
              const previous = state.formStates[key];
              return [key, {
                status,
                completedAt: status === 'complete' ? nowISO() : previous?.completedAt,
                completedBy: status === 'complete' ? actor : previous?.completedBy,
                reviewer: status === 'requires-review' ? actor : previous?.reviewer,
                note: note ?? previous?.note,
              }];
            })),
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
        if (isEventFutureLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'minutes', reason: FUTURE_LOCKED_GUARD_MSG });
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
        if (isEventFutureLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'evidence', reason: FUTURE_LOCKED_GUARD_MSG });
          return '';
        }
        if (doc.linkedFormInstanceId && doc.artifactType) {
          const sessionKey = doc.ecignSessionId ?? doc.signatureSessionId ?? '';
          const dup = (state.evidence[eventId] ?? []).find(candidate =>
            candidate.linkedFormInstanceId === doc.linkedFormInstanceId
            && candidate.artifactType === doc.artifactType
            && (candidate.ecignSessionId ?? candidate.signatureSessionId ?? '') === sessionKey
            && isEvidenceUsable(candidate.status),
          );
          if (dup) {
            // Always stash the raw data URL — blob URLs are ephemeral and die on reload.
            // useIframeSafeSrc converts to blob URL at display time.
            if (doc.localDataUrl) stashDemoEvidenceDataUrl(dup.id, doc.localDataUrl);
            // Merge drive metadata if newly provided on re-finalize (idempotent attach without dup artifact)
            if (doc.driveFileId || doc.driveFolderId || doc.webViewLink || doc.driveUploadStatus) {
              get().attachDriveMetadata(eventId, dup.id, {
                driveFileId: doc.driveFileId,
                driveFolderId: doc.driveFolderId,
                webViewLink: doc.webViewLink,
                driveMimeType: (doc as any).driveMimeType,
                driveFilename: (doc as any).driveFilename,
                driveUploadedAt: (doc as any).driveUploadedAt,
                driveUploadStatus: (doc as any).driveUploadStatus,
              });
            }
            return dup.id;
          }
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
        const inferredMimeType = doc.localDataUrl?.startsWith('data:')
          ? doc.localDataUrl.slice(5, doc.localDataUrl.indexOf(';'))
          : doc.name.endsWith('.json')
            ? 'application/json'
            : doc.name.endsWith('.html')
              ? 'text/html'
              : doc.name.endsWith('.pdf')
                ? 'application/pdf'
                : 'application/octet-stream';
        const rawDataUrl = doc.localDataUrl;
        // Always stash the raw data URL. Blob URLs are ephemeral (tab-scoped) and
        // break after a reload. useIframeSafeSrc converts to blob URL at display time.
        const previewForStash = rawDataUrl ?? undefined;
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
          mimeType: inferredMimeType,
          uploadedAt: nowISO(),
          uploadedBy: actor,
          lockedAt: nowISO(),
          supersedesEvidenceId: doc.supersedesEvidenceId ?? existingForKey?.id,
          auditFrozen: isEventInstanceCertified(state, eventId),
        };
        if (previewForStash) stashDemoEvidenceDataUrl(id, previewForStash);
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
                  status: 'SUPERSEDED' as const,
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

      attachDriveMetadata: (eventId, evidenceId, meta) => {
        const enf = useEnforcementStore.getState();
        set(state => {
          const list = state.evidence[eventId] ?? [];
          const idx = list.findIndex(d => d.id === evidenceId);
          if (idx < 0) return state;
          const prev = list[idx];
          const updated: EvidenceDoc = {
            ...prev,
            driveFileId: meta.driveFileId ?? prev.driveFileId,
            driveFolderId: meta.driveFolderId ?? prev.driveFolderId,
            webViewLink: meta.webViewLink ?? prev.webViewLink,
            driveMimeType: meta.driveMimeType ?? prev.driveMimeType,
            driveFilename: meta.driveFilename ?? prev.driveFilename,
            driveUploadedAt: meta.driveUploadedAt ?? prev.driveUploadedAt,
            driveUploadStatus: meta.driveUploadStatus ?? prev.driveUploadStatus,
          };
          const nextList = [...list];
          nextList[idx] = updated;
          return {
            evidence: { ...state.evidence, [eventId]: nextList },
            taskAuditByEventId: {
              ...state.taskAuditByEventId,
              [eventId]: appendExecutionAudit(state.taskAuditByEventId[eventId] ?? [], {
                auditId: nextAuditId(),
                eventId,
                entityType: 'evidence',
                entityId: evidenceId,
                action: 'DRIVE_METADATA_ATTACHED',
                actorId: enf.actor.userId,
                actorRole: enf.actor.role,
                timestamp: nowISO(),
                after: { driveFileId: meta.driveFileId, driveUploadStatus: meta.driveUploadStatus },
              }),
            },
          };
        });
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
        if (current.auditFrozen) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'evidence', targetId: docId, reason: 'supersedeEvidence blocked: audit-frozen evidence row.' });
          return '';
        }
        if (enf.isLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'evidence', targetId: docId, reason: 'supersedeEvidence blocked: event enforcement lock.' });
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
        if (isEventFutureLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'approval', reason: FUTURE_LOCKED_GUARD_MSG });
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
        set(prev => {
          const base = {
            eventInstancesById: { ...prev.eventInstancesById, [instance.eventId]: instance },
            eventInstanceIdsBySourceEventId: {
              ...prev.eventInstanceIdsBySourceEventId,
              [sourceEvent.id]: [...(prev.eventInstanceIdsBySourceEventId[sourceEvent.id] ?? []), instance.eventId],
            },
          };
          // After a reset, _suppressEnsureAudit is true until the page reloads.
          // This prevents the audit trail from being re-populated by the
          // post-reset render cycle calling ensureEventInstance on every event.
          if (_suppressEnsureAudit) return base;
          return {
            ...base,
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
          };
        });
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
        set(prev => {
          const evRows = prev.evidence[eventId] ?? [];
          const frozenEvidence = evRows.map(d =>
            (isEvidenceImmutable(d.status) ? { ...d, auditFrozen: true } : d),
          );
          return {
            eventInstancesById: { ...prev.eventInstancesById, [eventId]: updated },
            evidence: { ...prev.evidence, [eventId]: frozenEvidence },
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
          };
        });
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
        if (isEventFutureLocked(eventId) && !canBypassCertification(opts?.adminOverride)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'task', reason: FUTURE_LOCKED_GUARD_MSG });
          return '';
        }
        const existing = state.taskOverridesByEventId[eventId] ?? [];
        const folder = resolveEventFolder(eventId);
        const createdAt = nowISO();
        const taskSourceType = task.taskSourceType ?? task.source ?? 'manual';
        const taskSourceId = task.taskSourceId
          ?? (taskSourceType === 'manual' ? `manual:${Date.now().toString(36)}` : `generated:${Date.now().toString(36)}`);
        const canonicalId = buildDeterministicTaskId(eventId, taskSourceId);
        const legacyAlt = legacyStableAlternateTaskId(eventId, taskSourceId);
        const sourceMatch = existing.find(candidate =>
          candidate.taskSourceId === taskSourceId
          || candidate.id === canonicalId
          || candidate.id === legacyAlt
          || candidate.legacyId === legacyAlt,
        );
        if (sourceMatch) {
          return normalizeEventTaskIdentity(eventId, { ...sourceMatch, eventId }).id;
        }
        const id = canonicalId;
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
          assignedRole: task.assignedRole,
          accountableRole: task.accountableRole,
          reviewerRole: task.reviewerRole,
          approverRole: task.approverRole,
          canCompleteRoles: task.canCompleteRoles,
          canReviewRoles: task.canReviewRoles,
          canApproveRoles: task.canApproveRoles,
          escalationRole: task.escalationRole,
          isSignerTask: task.isSignerTask,
          signerRole: task.signerRole,
          parentFormTaskId: task.parentFormTaskId,
          blocksOnSignerTasks: task.blocksOnSignerTasks,
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
        if (isEventFutureLocked(eventId) && !canBypassCertification(opts?.adminOverride)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'task', targetId: taskId, reason: FUTURE_LOCKED_GUARD_MSG });
          return false;
        }
        const existing = state.taskOverridesByEventId[eventId] ?? [];
        const before = existing.find(t =>
          t.id === taskId
          || t.legacyId === taskId
          || (t.taskSourceId && legacyStableAlternateTaskId(eventId, t.taskSourceId) === taskId),
        );
        if (!before) return false;
        const canonicalTaskId = normalizeEventTaskIdentity(eventId, before).id;
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
          const evidenceForTask = (state.evidence[eventId] ?? []).filter(evidence =>
            (evidence.taskId === taskId || evidence.taskId === canonicalTaskId) && isEvidenceUsable(evidence.status),
          );
          const evidenceRequired = before.source === 'approval' || before.taskSourceType === 'minutes';
          const requiredEvidenceSatisfied = !evidenceRequired || evidenceForTask.length > 0;
          if (!requiredFormsSatisfied || !requiredEvidenceSatisfied) {
            return false;
          }
        }
        const {
          id: _pid,
          eventId: _pe,
          taskSourceId: _pts,
          taskSourceType: _ptst,
          legacyId: _pl,
          ...patchWithoutIdentity
        } = patch;
        const updated: EventTask = {
          ...before,
          ...patchWithoutIdentity,
          id: canonicalTaskId,
          eventId,
          taskSourceId: before.taskSourceId,
          taskSourceType: before.taskSourceType,
          updatedAt: nowISO(),
        };
        set(prev => ({
          taskOverridesByEventId: {
            ...prev.taskOverridesByEventId,
            [eventId]: (prev.taskOverridesByEventId[eventId] ?? []).map(t =>
              (t.taskSourceId === before.taskSourceId || t.id === taskId || t.id === before.id || t.legacyId === taskId ? updated : t),
            ),
          },
          taskAuditByEventId: {
            ...prev.taskAuditByEventId,
            [eventId]: appendExecutionAudit(prev.taskAuditByEventId[eventId] ?? [], {
              auditId: nextAuditId(),
              eventId,
              entityType: 'task',
              entityId: canonicalTaskId,
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
        const task = (get().taskOverridesByEventId[eventId] ?? []).find(entry =>
          entry.id === taskId
          || entry.legacyId === taskId
          || (entry.taskSourceId && legacyStableAlternateTaskId(eventId, entry.taskSourceId) === taskId),
        );
        if (task?.isRequired && !opts?.reason) return false;
        const resolved = task ? normalizeEventTaskIdentity(eventId, task).id : taskId;
        return get().updateTask(eventId, resolved, { isDeleted: true, deletedAt: nowISO(), status: 'cancelled' }, opts);
      },

      restoreTask: (eventId, taskId, opts) => {
        const row = (get().taskOverridesByEventId[eventId] ?? []).find(entry =>
          entry.id === taskId
          || entry.legacyId === taskId
          || (entry.taskSourceId && legacyStableAlternateTaskId(eventId, entry.taskSourceId) === taskId),
        );
        const resolved = row ? normalizeEventTaskIdentity(eventId, row).id : taskId;
        return get().updateTask(eventId, resolved, { isDeleted: false, deletedAt: undefined, status: 'not_started' }, opts);
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
        /* MVP-P0-ECIGN-001 (Wave 3) — sequence allocation must include ALL
         * rows for the form (including SUPERSEDED), matching the rule used
         * by `getOrCreateFormInstance` below (line ~1888 — `allForForm`).
         *
         * Pre-Wave-3 this filter dropped SUPERSEDED rows, which would have
         * caused DUPLICATE canonical ids the moment ECIGN-001 ships its
         * first supersede: old row had sequence N, supersede creates a new
         * row at sequence N+1, then the next `generateFormInstance` call
         * would also compute sequence N+1 from a count of {N+1 active row}
         * and collide.
         *
         * Counting every row (`.filter(i => i.formId === formId)`) makes the
         * two code paths converge and prevents the collision.
         */
        const allForForm = collectByEventAliases(state.generatedFormInstancesByEventId, eventId, item => item.id)
          .filter(i => i.formId === formId);
        const sequence = allForForm.length + 1;
        const instance: EventFormInstance = {
          id: `${eventId}-${formId}-${String(sequence).padStart(3, '0')}`,
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
        /* ─────────────────────────────────────────────────────────────
         * Idempotency by (eventId, formId, taskId) ONLY.
         *
         * Previously the lookup ALSO required `requirementId` equality,
         * which caused duplicate form instances every time two different
         * call sites passed different requirement-id shapes:
         *
         *   - WorkflowExecutionPanel passes  `${taskId}::form`
         *   - FormSigningWorkspace    passes `${taskId}::FORM_COMPLETION::${formId}`
         *
         * Both refer to the SAME canonical form requirement. We now
         * match on (eventId, formId, taskId) and treat requirementId as
         * metadata only.  This is the single source of truth fix the
         * user has asked for repeatedly.
         * ───────────────────────────────────────────────────────────── */
        const existing = collectByEventAliases(state.generatedFormInstancesByEventId, eventId, item => item.id).find(i => {
          if (i.formId !== formId) return false;
          if (i.status === 'SUPERSEDED') return false;
          if (taskId && i.taskId && i.taskId !== taskId) return false;
          return true;
        });
        if (existing) {
          // Backfill taskId/requirementId if the prior instance was created
          // before either was known (e.g. from a Forms Library opening).
          if (!existing.taskId && taskId) {
            existing.taskId = taskId;
          }
          if (!existing.requirementId && requirementId) {
            existing.requirementId = requirementId;
          }
          return existing;
        }

        const folder = resolveEventFolder(eventId);
        const allForForm = collectByEventAliases(state.generatedFormInstancesByEventId, eventId, item => item.id).filter(i => i.formId === formId);
        const sequence = allForForm.length + 1;
        const instance: EventFormInstance = {
          id: formatCesFormInstanceId(eventId, formId, sequence),
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

          // When a form instance is signed or locked, also mark the form status
          // as 'complete' in formStates so effectiveFormStatus returns 'complete'
          // everywhere it is checked (dashboard, validation, task gate, etc.)
          const isCompletion = (status === 'SIGNED' || status === 'LOCKED' || status === 'COMPLETED') && instance?.formId;
          const formStatesPatch = isCompletion
            ? { ...prev.formStates, [fKey(eventId, instance!.formId)]: { status: 'complete' as FormStatus, actor: enf.actor.userId, timestamp: now } }
            : prev.formStates;

          return {
            formStates: formStatesPatch,
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

      /* ─── MVP-P0-ECIGN-001 — supersede a form instance (Wave 3) ──────────
       *
       * Atomic mutation: marks the old row SUPERSEDED + writes back-pointer,
       * creates a new canonical successor with `supersedes` forward-pointer
       * and `sequence = oldSeq + 1`, and emits TWO audit rows (one keyed on
       * old id, one on new id) so the chain is reconstructible from audits
       * alone.
       *
       * Old row is preserved (audit defensibility).
       *
       * Returns the new instance id on success, empty string on failure
       * (event locked, certified, instance not found, instance already
       * superseded).
       *
       * Pattern mirrors `supersedeEvidence` above (line ~1099) for
       * consistency. New id allocation follows `getOrCreateFormInstance`'s
       * rule (`allForForm.length + 1`) — also matched by the Wave 3 fix to
       * `generateFormInstance` so the two paths can never collide.
       *
       * Hash chain in `appendExecutionAudit` is unchanged (canonicalization
       * blob excludes the new top-level targetKind/targetId from Wave 2
       * AUDIT-001).
       */
      supersedeFormInstance: (eventId, instanceId, opts) => {
        const enf = useEnforcementStore.getState();
        const canonicalEventId = resolveCanonicalEventId(eventId);
        const state = get();

        if ((enf.isLocked(eventId) || enf.isLocked(canonicalEventId) || !!state.certifications[eventId] || !!state.certifications[canonicalEventId]) && !canBypassCertification(false)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'form', targetId: instanceId, reason: 'supersedeFormInstance blocked for locked/certified event.' });
          return '';
        }

        const allInstances = collectByEventAliases(state.generatedFormInstancesByEventId, eventId, item => item.id);
        const current = allInstances.find(i => i.id === instanceId);
        if (!current) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'form', targetId: instanceId, reason: 'supersedeFormInstance: instance not found.' });
          return '';
        }
        if (current.status === 'SUPERSEDED') {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'form', targetId: instanceId, reason: 'supersedeFormInstance: instance already superseded.' });
          return '';
        }

        const folder = resolveEventFolder(eventId);
        const allForForm = allInstances.filter(i => i.formId === current.formId);
        const newSequence = allForForm.length + 1;
        const newId = formatCesFormInstanceId(eventId, current.formId, newSequence);
        const now = nowISO();
        const reason = opts?.reason;

        const newInstance: EventFormInstance = {
          id: newId,
          eventId,
          formId: current.formId,
          taskId: current.taskId,
          requirementId: current.requirementId,
          policyIds: current.policyIds,
          workflowId: current.workflowId,
          folderPath: folder.paths.formsCompletedDir,
          status: 'IN_PROGRESS',
          sequence: newSequence,
          createdAt: now,
          supersedes: current.id,
        };

        set(prev => {
          const instances = prev.generatedFormInstancesByEventId[eventId] ?? [];
          const updatedExisting = instances.map(i =>
            i.id === instanceId
              ? { ...i, status: 'SUPERSEDED' as FormInstanceStatus, supersededAt: now, supersededBy: newId, updatedAt: now }
              : i,
          );
          // Insert new instance at the head (same convention as generate/getOrCreate).
          const withNew = [newInstance, ...updatedExisting];

          const auditChainAfterOld = appendExecutionAudit(prev.taskAuditByEventId[eventId] ?? [], {
            auditId: nextAuditId(),
            eventId,
            entityType: 'formInstance',
            entityId: instanceId,
            action: 'FORM_INSTANCE_SUPERSEDED',
            actorId: enf.actor.userId,
            actorRole: enf.actor.role,
            timestamp: now,
            before: { instanceId, status: current.status, sequence: current.sequence },
            after: { instanceId, status: 'SUPERSEDED' as FormInstanceStatus, supersededBy: newId, supersededAt: now },
            reason,
          });
          const auditChainAfterNew = appendExecutionAudit(auditChainAfterOld, {
            auditId: nextAuditId(),
            eventId,
            entityType: 'formInstance',
            entityId: newId,
            action: 'FORM_INSTANCE_CREATED_AS_SUPERSEDE',
            actorId: enf.actor.userId,
            actorRole: enf.actor.role,
            timestamp: now,
            after: { ...newInstance, supersedes: instanceId },
            reason,
          });

          return {
            generatedFormInstancesByEventId: {
              ...prev.generatedFormInstancesByEventId,
              [eventId]: withNew,
            },
            taskAuditByEventId: {
              ...prev.taskAuditByEventId,
              [eventId]: auditChainAfterNew,
            },
          };
        });

        enf.log({
          action: 'form.status.changed',
          eventId,
          targetKind: 'formInstance',
          targetId: instanceId,
          before: { instanceId, status: current.status },
          after: { instanceId, status: 'SUPERSEDED', supersededBy: newId, newInstanceId: newId, sequence: newSequence, reason: 'supersedeFormInstance' },
        });

        return newId;
      },

      appendTaskAuditEvent: (eventId, entityType, entityId, action, opts) => {
        const enf = useEnforcementStore.getState();
        /* ─── MVP-P1-AUDIT-001 — derive top-level targetKind/targetId ─────
         * Dual-write strategy (one release per MVP plan L1208): prefer values
         * already present in opts.after (e.g. SIGNATURE_REQUESTED nests
         * `after.targetKind` / `after.targetId`), otherwise default to the
         * row-level `entityType` / `entityId`. Existing `after.*` writes are
         * preserved verbatim; consumers can read either location during the
         * dual-write window. The hash chain canonicalization in
         * `appendExecutionAudit` intentionally does NOT include these new
         * fields so existing chains remain verifiable. */
        let derivedTargetKind: string | undefined;
        let derivedTargetId: string | undefined;
        if (opts?.after && typeof opts.after === 'object' && opts.after !== null) {
          const afterObj = opts.after as { targetKind?: unknown; targetId?: unknown };
          if (typeof afterObj.targetKind === 'string') derivedTargetKind = afterObj.targetKind;
          if (typeof afterObj.targetId === 'string') derivedTargetId = afterObj.targetId;
        }
        const topLevelTargetKind = derivedTargetKind ?? entityType;
        const topLevelTargetId = derivedTargetId ?? entityId;

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
              targetKind: topLevelTargetKind,
              targetId: topLevelTargetId,
            }),
          },
        }));
      },

      evaluateTaskCertificationGate: (eventId, taskId) => {
        const state = get();
        const raw = (state.taskOverridesByEventId[eventId] ?? []).find(item =>
          !item.isDeleted
          && (item.id === taskId
            || item.legacyId === taskId
            || (item.taskSourceId && legacyStableAlternateTaskId(eventId, item.taskSourceId) === taskId)),
        );
        let task = raw ? normalizeEventTaskIdentity(eventId, raw) : null;

        // If not found in overrides, search derived tasks (signer tasks live there)
        if (!task) {
          const sourceEvent = SOURCE_EVENT_BY_ID[resolveCanonicalEventId(eventId)];
          if (sourceEvent) {
            const derived = deriveDefaultEventTasks(sourceEvent, eventId);
            const derivedMatch = derived.find(t => t.id === taskId || t.legacyId === taskId);
            if (derivedMatch) task = derivedMatch;
          }
        }

        if (!task) {
          return {
            canComplete: false,
            message: 'Task not found in the current event execution context.',
            blockers: ['Task not found'],
          };
        }
        const sourceEvent = SOURCE_EVENT_BY_ID[resolveCanonicalEventId(eventId)];
        const aliases = getEventAliases(eventId);

        // Collect all form instances for this task across all event aliases
        const allFormInstances = aliases.flatMap(alias =>
          state.generatedFormInstancesByEventId[alias] ?? [],
        );
        const taskFormInstances = allFormInstances.filter(i =>
          task.formIds.includes(i.formId)
          && (!i.taskId || i.taskId === taskId || i.taskId === task.id || i.taskId === task.legacyId),
        );
        const signedStatuses: FormInstanceStatus[] = ['SIGNED', 'LOCKED', 'COMPLETED'];
        const signedFormIds = new Set(
          taskFormInstances.filter(i => signedStatuses.includes(i.status)).map(i => i.formId),
        );

        // Collect all evidence across aliases
        const allEvidence = aliases.flatMap(alias => state.evidence[alias] ?? []);
        const usableEvidence = allEvidence.filter(item =>
          evidenceTaskIdMatchesTask(task, item.taskId) && isEvidenceUsable(item.status),
        );

        // Locked signed evidence (signed_package or signed_form_instance) proves form completion + signature
        // For production (non-demo) require real Drive metadata on signed artifacts.
        const hasRealDriveMetadata = (item: any) => !!(item.driveFileId || item.driveUploadStatus === 'uploaded' || item.webViewLink);
        const lockedSignedEvidence = usableEvidence.filter(
          item => item.status === 'EVIDENCE_LOCKED'
            && (item.artifactType === 'signed_package'
              || item.artifactType === 'signed_form_instance'
              || item.artifactType === 'signed_certificate')
            && hasRealDriveMetadata(item),
        );
        const lockedSignedFormIds = new Set(
          lockedSignedEvidence
            .filter(item => item.linkedFormId || (item.formIds && item.formIds.length > 0))
            .flatMap(item => item.linkedFormId ? [item.linkedFormId] : (item.formIds ?? [])),
        );

        const missingForms = task.formIds.filter(formId => {
          // A SIGNED/LOCKED form instance proves completion
          if (signedFormIds.has(formId)) return false;
          // Locked signed evidence for this form proves completion
          if (lockedSignedFormIds.has(formId)) return false;
          // Fall back to effectiveFormStatus
          const requiredForm = sourceEvent?.requiredForms.find(form => form.id === formId || form.formId === formId);
          if (!sourceEvent || !requiredForm) return false; // unknown form — don't block
          return get().effectiveFormStatus(sourceEvent, requiredForm.id) !== 'complete';
        });

        const hasSupportingEvidence = usableEvidence.length > 0;

        // Signature satisfied if: approved form approval exists, OR locked signed evidence exists for task forms, OR form instances are SIGNED/LOCKED
        const approvedSignatures = state.approvals.filter(item =>
          aliases.includes(item.eventId)
          && item.targetKind === 'form'
          && item.targetId
          && task.formIds.includes(item.targetId)
          && item.status === 'approved',
        ).length;
        const hasLockedSignedEvidenceForForm = task.formIds.length === 0
          || lockedSignedEvidence.length > 0
          || signedFormIds.size > 0;
        const requiredSignatureTarget = task.formIds.length > 0 ? 1 : 0;
        const signaturesSatisfied = requiredSignatureTarget === 0
          || approvedSignatures >= requiredSignatureTarget
          || hasLockedSignedEvidenceForForm;

        // For signed artifacts, only count as ready if they have real Drive metadata (production requirement).
        const hasRealLockedSigned = lockedSignedEvidence.length > 0;
        const hasOtherLocked = usableEvidence.some(item => item.status === 'EVIDENCE_LOCKED'
          && !(item.artifactType === 'signed_package' || item.artifactType === 'signed_form_instance' || item.artifactType === 'signed_certificate'));
        // packageReady requires real Drive metadata for signed_package artifacts; other evidence may support but cannot satisfy signed CES alone.
        const packageReady = hasRealLockedSigned || hasOtherLocked;

        // ── Signer task gating ──
        // If this task blocksOnSignerTasks, check that all child SIGN- tasks are completed.
        // Check both derived tasks and overrides (overrides may mark them completed).
        let pendingSignerTasks: string[] = [];
        if (task.blocksOnSignerTasks && sourceEvent) {
          const derived = deriveDefaultEventTasks(sourceEvent, eventId);
          const allOverrides = state.taskOverridesByEventId[eventId] ?? [];
          const derivedSignerTasks = derived.filter(dt => dt.isSignerTask && dt.parentFormTaskId === task.id);
          pendingSignerTasks = derivedSignerTasks
            .filter(dt => {
              // Check if an override marks it completed
              const override = allOverrides.find(ov => ov.id === dt.id);
              if (override) return !override.isDeleted && override.status !== 'completed';
              return dt.status !== 'completed';
            })
            .map(dt => `${dt.signerRole ?? dt.id} (awaiting_signature)`);
        }
        // If THIS is a signer task, only check if it has been signed (no form/evidence requirements)
        if (task.isSignerTask) {
          // Signer tasks are completed by signing — check if the form has a locked signature for this role
          const signerFormIds = task.formIds ?? [];
          const hasSigned = signerFormIds.length > 0 && signerFormIds.some(fid =>
            signedFormIds.has(fid) || lockedSignedFormIds.has(fid),
          );
          if (hasSigned) {
            return { canComplete: true, message: 'Signature verified.', blockers: [] };
          }
          return {
            canComplete: false,
            message: `Awaiting eCIgn signature from ${task.signerRole ?? task.assignedRole ?? 'assigned signer'}.`,
            blockers: [`Signature required from ${task.signerRole ?? task.assignedRole ?? 'assigned signer'}`],
          };
        }

        const blockers: string[] = [];
        if (missingForms.length > 0) blockers.push(`Missing required form completion: ${missingForms.join(', ')}`);
        if (!hasSupportingEvidence) blockers.push('Missing required supporting evidence upload');
        if (!signaturesSatisfied) blockers.push('Required signature is still pending');
        if (!packageReady) blockers.push('Evidence package is not certified or locked');
        if (pendingSignerTasks.length > 0) blockers.push(`Pending signer tasks: ${pendingSignerTasks.join(', ')}`);
        return {
          canComplete: blockers.length === 0,
          message: blockers.length === 0
            ? 'Task requirements satisfied.'
            : 'Cannot complete this task yet. Complete the required form, supporting evidence, and signature requirements first.',
          blockers,
        };
      },

      attemptCompleteTask: (eventId, taskId) => {
        if (isEventFutureLocked(eventId)) {
          return {
            canComplete: false,
            message: FUTURE_LOCKED_GUARD_MSG,
            blockers: ['Locked — Future Period'],
          };
        }
        const gate = get().evaluateTaskCertificationGate(eventId, taskId);
        if (!gate.canComplete) {
          get().appendTaskAuditEvent(eventId, 'task', taskId, 'TASK_COMPLETION_BLOCKED', {
            reason: gate.blockers.join(' | ') || gate.message,
            after: { blockers: gate.blockers },
          });
          return gate;
        }
        let existing = (get().taskOverridesByEventId[eventId] ?? []).find(item =>
          item.id === taskId
          || item.legacyId === taskId
          || (item.taskSourceId && legacyStableAlternateTaskId(eventId, item.taskSourceId) === taskId),
        );

        // If not in overrides, check if it's a derived task (e.g., signer task) and create an override
        if (!existing) {
          const sourceEvent = SOURCE_EVENT_BY_ID[resolveCanonicalEventId(eventId)];
          if (sourceEvent) {
            const derived = deriveDefaultEventTasks(sourceEvent, eventId);
            const derivedMatch = derived.find(t => t.id === taskId);
            if (derivedMatch) {
              get().createTask(eventId, derivedMatch, { reason: 'SIGNER_TASK_MATERIALIZED' });
              existing = (get().taskOverridesByEventId[eventId] ?? []).find(t => t.id === taskId);
            }
          }
        }

        const resolvedTaskId = existing ? normalizeEventTaskIdentity(eventId, existing).id : taskId;
        let updated = true;
        if (existing && existing.status === 'not_started') {
          updated = get().updateTask(eventId, resolvedTaskId, { status: 'in_progress' }, {
            reason: 'REQUIREMENT_COMPLETED',
          });
        }
        if (updated) {
          updated = get().updateTask(eventId, resolvedTaskId, { status: 'completed' }, {
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
        get().appendTaskAuditEvent(eventId, 'task', resolvedTaskId, 'TASK_CERTIFIED', {
          after: { status: 'completed' },
        });
        return {
          canComplete: true,
          message: 'Task completion and certification recorded.',
          blockers: [],
        };
      },

      /* ── signer tasks (multi-signer eCIgn) ── */
      createSignerTask: (task) => {
        const existingTasks = get().signerTasksByFormInstanceId[task.formInstanceId] ?? [];
        const existing = existingTasks.find(candidate =>
          candidate.taskId === task.taskId
          || (candidate.slotFieldId === task.slotFieldId && candidate.signerIndex === task.signerIndex),
        );
        if (existing) return;
        set(state => ({
          signerTasksByFormInstanceId: {
            ...state.signerTasksByFormInstanceId,
            [task.formInstanceId]: [
              ...(state.signerTasksByFormInstanceId[task.formInstanceId] ?? []),
              task,
            ],
          },
        }));
        if (task.parentTaskId) {
          get().createTask(task.eventId, {
            taskSourceId: `signer:${task.formInstanceId}:${task.signerIndex}:${task.slotFieldId}`,
            taskSourceType: 'generated',
            isRequired: true,
            requirementSource: 'workflow',
            workflowId: SOURCE_EVENT_BY_ID[resolveCanonicalEventId(task.eventId)]?.workflowId,
            policyIds: task.linkedPolicyIds,
            formIds: task.formId ? [task.formId] : [],
            title: `eCIgn signature: ${task.slotPurpose ?? task.assignedToRole ?? task.slotFieldId}`,
            description: `Awaiting signature from ${task.assignedToName ?? task.assignedTo}.`,
            source: 'generated',
            status: 'awaiting_signature',
            ownerRole: task.assignedToRole,
            ownerUserId: task.assignedTo,
            isSignerTask: true,
            signerRole: task.assignedToRole,
            parentFormTaskId: task.parentTaskId,
            blocksOnSignerTasks: false,
          }, { reason: 'SIGNER_TASK_AUTO_CREATED' });
        }
        const enf = useEnforcementStore.getState();
        enf.log({ action: 'signer_task.created', eventId: task.eventId, targetKind: 'task', targetId: task.taskId,
          after: { formInstanceId: task.formInstanceId, slotFieldId: task.slotFieldId, assignedTo: task.assignedTo, sequenceGroup: task.sequenceGroup, signerIndex: task.signerIndex } });
      },

      updateSignerTaskStatus: (formInstanceId, taskId, status, extra) => {
        let updatedTask: SignerTask | undefined;
        set(state => {
          const tasks = state.signerTasksByFormInstanceId[formInstanceId];
          if (!tasks) return state;
          updatedTask = tasks.find(task => task.taskId === taskId);
          return {
            signerTasksByFormInstanceId: {
              ...state.signerTasksByFormInstanceId,
              [formInstanceId]: tasks.map(t =>
                t.taskId === taskId ? { ...t, status, ...(extra?.declineReason ? { declineReason: extra.declineReason } : {}) } : t,
              ),
            },
          };
        });
        if (updatedTask?.parentTaskId) {
          const taskSourceId = `signer:${updatedTask.formInstanceId}:${updatedTask.signerIndex}:${updatedTask.slotFieldId}`;
          const materializedId = buildDeterministicTaskId(updatedTask.eventId, taskSourceId);
          const nextStatus = status === 'signed'
            ? 'completed'
            : status === 'opened'
              ? 'in_progress'
              : status === 'declined' || status === 'expired'
                ? 'blocked'
                : 'awaiting_signature';
          get().updateTask(updatedTask.eventId, materializedId, { status: nextStatus }, {
            reason: `SIGNER_TASK_${String(status ?? '').toUpperCase()}`,
          });
        }
      },

      getSignerTasksForInstance: (formInstanceId) => {
        return get().signerTasksByFormInstanceId[formInstanceId] ?? [];
      },

      getNextPendingSignerTask: (formInstanceId) => {
        const tasks = get().signerTasksByFormInstanceId[formInstanceId] ?? [];
        return tasks
          .filter(t => t.status === 'pending')
          .sort((a, b) => a.sequenceGroup - b.sequenceGroup || a.signerIndex - b.signerIndex)[0];
      },

      /* ── certification ──
         Builds on markEventComplete but enforces the stricter
         closure gate: every required approval must be recorded,
         minutes (if required) must be finalized, and validation
         must report zero blockers. Writes an immutable receipt
         and hard-locks the instance. */
      certifyEventComplete: (event, certifier = CURRENT_USER, certifierRole, note) => {
        if (isCesFutureLockedDate(event.date)) {
          return { ok: false, message: FUTURE_LOCKED_GUARD_MSG };
        }
        const enf = useEnforcementStore.getState();
        const s = get();
        const instance = s.ensureEventInstance(event);
        const derivedTasks = deriveDefaultEventTasks(event, instance.eventId, {
          stepStatusById: Object.fromEntries(event.processFlow.map(step => [step.id, s.effectiveStepStatus(event, step.id)])),
          formStatusById: Object.fromEntries(event.requiredForms.map(form => [form.id, s.effectiveFormStatus(event, form.id)])),
          approvalsById: Object.fromEntries(s.approvals.filter(ap => ap.eventId === event.id).map(ap => [ap.id, ap.status])),
        });
        const overrides = s.taskOverridesByEventId[instance.eventId] ?? [];
        const requiredTasks = mergeDerivedEventTasksWithOverrides(instance.eventId, derivedTasks, overrides)
          .filter(task => task.isRequired && !task.isDeleted);
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

      isCertified: eventId => getEventAliases(eventId).some(key => !!get().certifications[key]),
      getCertification: eventId => {
        const certs = get().certifications;
        return getEventAliases(eventId).map(key => certs[key]).find(Boolean);
      },

      /* ── selectors ── */
      effectiveStepStatus: (event, stepId) => {
        const override = get().stepStates[sKey(event.id, stepId)];
        if (override) return override.status;
        // No store override — return 'pending' so that after a reset
        // (which clears stepStates) all steps read as not-started.
        // The source processFlow status is just a template hint.
        return 'pending';
      },

      effectiveFormStatus: (event, formId) => {
        const approvals = get().approvals;
        const aliases = getEventAliases(event.id);
        const approvedViaESign = approvals.some(a =>
          aliases.includes(a.eventId) &&
          a.targetKind === 'form' &&
          a.targetId === formId &&
          a.status === 'approved',
        );
        if (approvedViaESign) return 'complete';

        const override = getEventAliases(event.id)
          .map(alias => get().formStates[fKey(alias, formId)])
          .find(Boolean);
        if (override) return override.status;

        const pendingESign = approvals.some(a =>
          aliases.includes(a.eventId) &&
          a.targetKind === 'form' &&
          a.targetId === formId &&
          a.status === 'pending',
        );
        if (pendingESign) return 'in-progress';

        return 'pending';
      },

      effectiveMinutesStatus: event => {
        if (!event.minutes) return null;
        return (get().minutesStates[event.id]?.status) || 'missing';
      },

      effectiveUrgency: event => {
        const completion = getEventAliases(event.id)
          .map(alias => get().completions[alias])
          .find(Boolean);
        if (completion?.status === 'complete') return 'complete';
        return event.urgency;
      },

      isEventComplete: eventId => getEventAliases(eventId).some(key => get().completions[key]?.status === 'complete'),

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
          const templateId = getFormCanon(f.formId ?? f.id);
          if (!templateId || !FORM_TEMPLATE_IDS.has(templateId)) {
            blockers.push({
              kind: 'form',
              label: `${f.label} (${templateId}) — Form template missing from Forms Library`,
              targetId: f.id,
            });
            return;
          }
          if (s.effectiveFormStatus(event, f.id) !== 'complete') {
            blockers.push({ kind: 'form', label: f.label, targetId: f.id });
          }
        });
        if (minutesRequired && !minutesFinalized) {
          blockers.push({ kind: 'minutes', label: 'Meeting minutes finalization' });
        }
        const pendingApprovals = s.approvals.filter(a => getEventAliases(event.id).includes(a.eventId) && a.status === 'pending');
        pendingApprovals.forEach(a => blockers.push({ kind: 'approval', label: a.targetLabel, targetId: a.id }));

        return {
          canComplete: blockers.length === 0 && stepsTotal > 0,
          blockers,
          progress: { stepsComplete, stepsTotal, formsComplete, formsTotal, minutesRequired, minutesFinalized },
        };
      },

      markEventComplete: event => {
        if (isCesFutureLockedDate(event.date)) {
          return { ok: false, message: FUTURE_LOCKED_GUARD_MSG };
        }
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

      resetEvent: (eventId: string) => {
        _suppressEnsureAudit = true;
        // Collect ALL aliases (source event ID + instance event ID) so we clear
        // every key variant the store may have used.
        const aliases = getEventAliases(eventId);
        const aliasSet = new Set(aliases);

        const state = get();
        // Clear evidence data URLs from BOTH the in-memory cache and localStorage.
        // Using clearDemoEvidenceDataUrl (not raw localStorage.removeItem) ensures
        // the memCache is also purged so stale blobs don't survive in the same session.
        const formInstanceIds: string[] = [];
        aliases.forEach(alias => {
          (state.evidence[alias] ?? []).forEach(doc => {
            clearDemoEvidenceDataUrl(doc.id);
          });
          (state.generatedFormInstancesByEventId[alias] ?? []).forEach(fi => {
            formInstanceIds.push(fi.id);
          });
        });
        // Clear persisted form-field values for every form instance in this event.
        clearFormFieldsForIds(formInstanceIds);
        // Clear eCIgn demo backend sessions for this event
        clearDemoEcignForEvents(aliasSet);

        set(prev => {
          // Clear evidence, task overrides, audit, form instances for all aliases
          const evidence = { ...prev.evidence };
          const taskOverridesByEventId = { ...prev.taskOverridesByEventId };
          const taskAuditByEventId = { ...prev.taskAuditByEventId };
          const generatedFormInstancesByEventId = { ...prev.generatedFormInstancesByEventId };
          const evidenceErrorsByEventId = { ...prev.evidenceErrorsByEventId };
          const completions = { ...prev.completions };
          const notes = { ...prev.notes };
          const eventInstanceIdsBySourceEventId = { ...prev.eventInstanceIdsBySourceEventId };

          aliases.forEach(alias => {
            evidence[alias] = [];
            taskOverridesByEventId[alias] = [];
            taskAuditByEventId[alias] = [];
            generatedFormInstancesByEventId[alias] = [];
            delete evidenceErrorsByEventId[alias];
            delete completions[alias];
            delete notes[alias];
            eventInstanceIdsBySourceEventId[alias] = [];
          });

          return {
            evidence,
            approvals: prev.approvals.filter(a => !aliasSet.has(a.eventId)),
            completions,
            notes,
            certifications: Object.fromEntries(
              Object.entries(prev.certifications ?? {}).filter(([k]) => !aliasSet.has(k))
            ),
            taskOverridesByEventId,
            taskAuditByEventId,
            generatedFormInstancesByEventId,
            evidenceErrorsByEventId,
            // Clear formStates and stepStates for any key prefixed with any alias
            formStates: Object.fromEntries(
              Object.entries(prev.formStates).filter(([k]) => !aliases.some(a => k.startsWith(a)))
            ),
            stepStates: Object.fromEntries(
              Object.entries(prev.stepStates).filter(([k]) => !aliases.some(a => k.startsWith(a)))
            ),
            minutesStates: Object.fromEntries(
              Object.entries(prev.minutesStates ?? {}).filter(([k]) => !aliasSet.has(k))
            ),
            // Remove event instances that belong to this event
            eventInstancesById: Object.fromEntries(
              Object.entries(prev.eventInstancesById).filter(
                ([, v]) => !aliasSet.has(v.sourceEventId) && !aliasSet.has(v.eventId)
              )
            ),
            eventInstanceIdsBySourceEventId,
          };
        });
      },

      clearAllEvidence: () => {
        // Scoped to Q1/Q2 sandbox events only.
        get().resetAllSandboxQ1Q2();
      },

      resetAll: () => {
        // Scoped to Q1/Q2 sandbox events only.
        get().resetAllSandboxQ1Q2();
      },

      /* ── Sandbox reset actions ─────────────────────────────── */

      resetSandboxTask: (eventId, taskId) => {
        const date = resolveEventDate(eventId);
        if (!date || !isCesSandboxDate(date)) return;
        const aliases = getEventAliases(eventId);
        // Wipe per-doc localStorage data URL entries for this task's evidence
        const formInstanceIds: string[] = [];
        aliases.forEach(alias => {
          (get().evidence[alias] ?? []).forEach(doc => {
            if (doc.taskId === taskId) {
              // Clear from both memCache and localStorage (not just localStorage).
              clearDemoEvidenceDataUrl(doc.id);
            }
          });
          (get().generatedFormInstancesByEventId[alias] ?? []).forEach(fi => {
            if (fi.taskId === taskId) formInstanceIds.push(fi.id);
          });
        });
        clearFormFieldsForIds(formInstanceIds);
        clearDemoEcignForEvents(new Set(aliases));
        set(prev => {
          const evidence = { ...prev.evidence };
          const taskOverridesByEventId = { ...prev.taskOverridesByEventId };
          const generatedFormInstancesByEventId = { ...prev.generatedFormInstancesByEventId };
          const taskAuditByEventId = { ...prev.taskAuditByEventId };
          aliases.forEach(alias => {
            // Remove evidence linked to this task
            evidence[alias] = (prev.evidence[alias] ?? []).filter(doc => doc.taskId !== taskId);
            // Reset task status back to not_started (preserve the task definition itself)
            taskOverridesByEventId[alias] = (prev.taskOverridesByEventId[alias] ?? []).map(task =>
              (task.id === taskId || task.legacyId === taskId)
                ? {
                    ...task,
                    status: 'not_started',
                    completionBlockedReason: undefined,
                    blockedReason: undefined,
                    updatedAt: nowISO(),
                  }
                : task,
            );
            // Remove form instances linked to this task
            generatedFormInstancesByEventId[alias] = (
              prev.generatedFormInstancesByEventId[alias] ?? []
            ).filter(fi => !fi.taskId || fi.taskId !== taskId);
            // Clear task audit log entries for this task
            taskAuditByEventId[alias] = (prev.taskAuditByEventId[alias] ?? []).filter(
              a => a.entityId !== taskId,
            );
          });
          return {
            evidence,
            taskOverridesByEventId,
            generatedFormInstancesByEventId,
            taskAuditByEventId,
          };
        });
      },

      resetAllSandboxQ1Q2: () => {
        // Suppress audit trail writes from ensureEventInstance for the rest
        // of this page lifecycle. The subsequent reload() starts fresh.
        _suppressEnsureAudit = true;
        const state = get();
        // Collect every event ID (source + instance alias) in the sandbox window.
        const sandboxSourceEvents = REGULATORY_EVENTS.filter(e => isCesSandboxDate(e.date));
        const sandboxIds = new Set<string>();
        for (const e of sandboxSourceEvents) {
          sandboxIds.add(e.id);
          const canonical = resolveCanonicalEventId(e.id);
          sandboxIds.add(canonical);
          const instanceId = EVENT_INSTANCE_ID_BY_SOURCE[canonical];
          if (instanceId) sandboxIds.add(instanceId);
          for (const id of (state.eventInstanceIdsBySourceEventId[e.id] ?? [])) {
            sandboxIds.add(id);
          }
        }
        // Also check all keys in evidence/taskOverrides/etc for sandbox-dated IDs
        for (const key of Object.keys(state.evidence)) {
          if (sandboxIds.has(key)) continue;
          const src = resolveCanonicalEventId(key);
          const srcEvent = SOURCE_EVENT_BY_ID[src];
          if (srcEvent && isCesSandboxDate(srcEvent.date)) sandboxIds.add(key);
        }

        // 1. Clear evidence blobs from localStorage + memCache for all sandbox docs
        for (const id of sandboxIds) {
          for (const doc of (state.evidence[id] ?? [])) {
            clearDemoEvidenceDataUrl(doc.id);
          }
          for (const fi of (state.generatedFormInstancesByEventId[id] ?? [])) {
            try { localStorage.removeItem('ci_form_fields_' + fi.id); } catch { /* noop */ }
          }
        }

        // 1b. Clear eCIgn demo backend sessions for sandbox events
        clearDemoEcignForEvents(sandboxIds);

        // 2. Build the new state: remove sandbox keys, keep everything else
        const evidence = { ...state.evidence };
        const taskOverridesByEventId = { ...state.taskOverridesByEventId };
        const taskAuditByEventId = { ...state.taskAuditByEventId };
        const generatedFormInstancesByEventId = { ...state.generatedFormInstancesByEventId };
        const evidenceErrorsByEventId = { ...state.evidenceErrorsByEventId };
        const completions = { ...state.completions };
        const notes = { ...state.notes };
        const certifications = { ...state.certifications };
        const formStates = { ...state.formStates };
        const stepStates = { ...state.stepStates };
        const minutesStates = { ...state.minutesStates };
        const eventInstancesById = { ...state.eventInstancesById };
        const eventInstanceIdsBySourceEventId = { ...state.eventInstanceIdsBySourceEventId };

        for (const id of sandboxIds) {
          delete evidence[id];
          delete taskOverridesByEventId[id];
          delete taskAuditByEventId[id];
          delete generatedFormInstancesByEventId[id];
          delete evidenceErrorsByEventId[id];
          delete completions[id];
          delete notes[id];
          delete certifications[id];
          delete eventInstanceIdsBySourceEventId[id];
          // Remove event instances
          for (const [instId, inst] of Object.entries(eventInstancesById)) {
            if (sandboxIds.has(inst.sourceEventId) || sandboxIds.has(inst.eventId)) {
              delete eventInstancesById[instId];
            }
          }
        }
        // Remove formStates/stepStates/minutesStates keyed with sandbox event ID prefix
        const sandboxArr = Array.from(sandboxIds);
        for (const key of Object.keys(formStates)) {
          if (sandboxArr.some(id => key.startsWith(id))) delete formStates[key];
        }
        for (const key of Object.keys(stepStates)) {
          if (sandboxArr.some(id => key.startsWith(id))) delete stepStates[key];
        }
        for (const key of Object.keys(minutesStates)) {
          if (sandboxArr.some(id => key.startsWith(id))) delete minutesStates[key];
        }

        // Filter approvals to remove sandbox events
        const approvals = state.approvals.filter(a => !sandboxIds.has(a.eventId));

        // 3. Also clear sandbox escalations from enforcement store
        try {
          const enf = useEnforcementStore.getState();
          enf.resetAll();
        } catch { /* noop */ }

        // 4. Write clean state back to zustand (persist middleware writes to localStorage)
        set({
          evidence,
          taskOverridesByEventId,
          taskAuditByEventId,
          generatedFormInstancesByEventId,
          evidenceErrorsByEventId,
          completions,
          notes,
          certifications,
          formStates,
          stepStates,
          minutesStates,
          eventInstancesById,
          eventInstanceIdsBySourceEventId,
          approvals,
          activeWorkflowEventId: null,
          signerTasksByFormInstanceId: {},
        });
      },

      resetAllCesSandbox: () => {
        get().resetAllSandboxQ1Q2();
      },
    }),
    {
      name: 'reg-execution-v2',
      version: 4,
      storage: createJSONStorage(() => ({
        getItem: name => localStorage.getItem(name),
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, value);
          } catch (err) {
            const isQuota = err instanceof DOMException && (err.code === 22 || err.name === 'QuotaExceededError');
            if (import.meta.env.DEV) {
              console.warn('[reg-execution] persist skipped (storage). Metadata remains in memory.', isQuota ? 'QuotaExceededError' : err);
            }
          }
        },
        removeItem: name => localStorage.removeItem(name),
      })),
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== 'object') return persistedState as RegulatoryExecutionState;
        let merged = persistedState as RegulatoryExecutionState;
        if (version < 2) {
          const legacy = persistedState as Partial<RegulatoryExecutionState> & { evidence?: unknown };
          merged = {
            ...legacy,
            evidence: migrateEvidenceRecords(legacy.evidence),
            evidenceErrorsByEventId: legacy.evidenceErrorsByEventId ?? {},
          } as RegulatoryExecutionState;
        }
        if (version < 3) {
          merged = migrateRegExecutionV3Shape(merged);
        }
        if (version < 4) {
          merged = migrateRegExecutionV3Shape(merged);
        }
        return merged;
      },
      partialize: state => ({
        formStates: state.formStates,
        stepStates: state.stepStates,
        minutesStates: state.minutesStates,
        evidence: Object.fromEntries(
          Object.entries(state.evidence ?? {}).map(([eventId, docs]) => [
            eventId,
            (docs ?? []).map(doc => stripEvidenceLargePayloads(doc)),
          ]),
        ),
        approvals: state.approvals,
        completions: state.completions,
        notes: state.notes,
        certifications: state.certifications,
        eventInstancesById: state.eventInstancesById,
        eventInstanceIdsBySourceEventId: state.eventInstanceIdsBySourceEventId,
        taskOverridesByEventId: state.taskOverridesByEventId,
        signerTasksByFormInstanceId: state.signerTasksByFormInstanceId,
        taskAuditByEventId: Object.fromEntries(
          Object.entries(state.taskAuditByEventId ?? {}).map(([eventId, rows]) => [
            eventId,
            sanitizeTaskAuditForPersist(rows),
          ]),
        ),
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
  return useMemo(
    () => {
      const merged = collectByEventAliases(byEvent, eventId, item => item.id);
      return merged.length ? merged : EMPTY_EVIDENCE;
    },
    [byEvent, eventId],
  );
}

export function useEventApprovals(eventId: string): ApprovalRequest[] {
  const all = useRegulatoryExecutionStore(state => state.approvals);
  return useMemo(() => {
    const aliases = getEventAliases(eventId);
    return all.filter(a => aliases.includes(a.eventId));
  }, [all, eventId]);
}

export function useAllPendingApprovalsCount(): number {
  const all = useRegulatoryExecutionStore(state => state.approvals);
  return useMemo(() => all.filter(a => a.status === 'pending').length, [all]);
}

const EMPTY_NOTES: InstanceNote[] = [];

export function useEventNotes(eventId: string): InstanceNote[] {
  const byEvent = useRegulatoryExecutionStore(state => state.notes);
  return useMemo(() => {
    const merged = collectByEventAliases(byEvent, eventId, item => item.id);
    return merged.length ? merged : EMPTY_NOTES;
  }, [byEvent, eventId]);
}

export function useEventCertification(eventId: string): CertificationRecord | undefined {
  const byEvent = useRegulatoryExecutionStore(state => state.certifications);
  return useMemo(
    () => getEventAliases(eventId).map(alias => byEvent[alias]).find(Boolean),
    [byEvent, eventId],
  );
}

export function useCertifiedCount(): number {
  const certs = useRegulatoryExecutionStore(state => state.certifications);
  return useMemo(() => Object.keys(certs).length, [certs]);
}
