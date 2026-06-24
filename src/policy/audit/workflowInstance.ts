import { useMemo } from 'react';
import {
  REGULATORY_EVENTS,
  type RegulatoryEvent,
  TODAY_ANCHOR,
} from '@/policy/data/regulatoryEvents';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import {
  useRegulatoryExecutionStore,
  useEventEvidence,
  useEventApprovals,
  useEventNotes,
  useEventCertification,
  type ApprovalRequest,
  type ApprovalStatus,
  type ApprovalTargetKind,
  type CertificationRecord,
  type EvidenceDoc,
  type FormStatus,
  type InstanceNote,
  type StepStatus,
} from '@/policy/stores/regulatoryExecutionStore';
import { useEnforcementStore } from '@/policy/stores/enforcementStore';
import type { AuditEntry } from '@/policy/enforcement/types';
import {
  evaluateAudit,
  buildCompletionChecklist,
  type AuditState,
  type AuditFlag,
  type CertificationDisposition,
  type CompletionChecklist,
} from './auditState';
import { checkDependencies, type DependencyCheck } from './dependencyCheck';

/* ═══════════════════════════════════════════════════════════════
   WorkflowInstance — the storage-container projection.

   A workflow instance IS a folder. Every document, form, approval,
   note, state change, checklist item, and certification record
   belongs to exactly ONE instance and is addressed by that
   instance's id. This module is the single place that assembles
   those slots into one live, read-only view so callers — the
   Execution Timeline panel, the Audit Mode drill-down, Brad, and
   survey export — all see the same shape.

   Inputs are the regulatoryExecutionStore + the enforcement audit
   log. No new mutable state is introduced here.
   ═══════════════════════════════════════════════════════════════ */

/** One step slot on the instance. */
export interface InstanceStepSlot {
  id: string;
  label: string;
  status: StepStatus;
}

/** One required-form slot on the instance, with its linked uploads. */
export interface InstanceFormSlot {
  id: string;
  label: string;
  /** Forms Library form id (e.g. "HR-JD-001") when declared. */
  formRef?: string;
  status: FormStatus;
  /** Documents uploaded against this slot's formRef. */
  documents: EvidenceDoc[];
}

/**
 * One approval slot. `ruleId` is set when derived from a declared
 * ApprovalRule on the event; absent for ad-hoc runtime requests.
 * `status: 'missing'` means a required rule exists with no request.
 */
export interface InstanceApprovalSlot {
  ruleId?: string;
  targetKind: ApprovalTargetKind;
  targetLabel: string;
  approverRole?: string;
  required: boolean;
  status: 'missing' | ApprovalStatus;
  requestId?: string;
  decidedAt?: string;
  approver?: string;
}

/**
 * The unified storage-container projection of a workflow instance.
 * Consumed by the Audit View, Event Record tab, and survey export.
 */
export interface WorkflowInstance {
  /** 1:1 with event.id in the current model — the workflow definition id. */
  workflowId: string;
  /** Same id — the runtime instance key used by every store keyed by eventId. */
  instanceId: string;
  event: RegulatoryEvent;

  /* ── Storage slots ── */
  documents:     EvidenceDoc[];
  forms:         InstanceFormSlot[];
  steps:         InstanceStepSlot[];
  approvals:     InstanceApprovalSlot[];
  notes:         InstanceNote[];
  auditTrail:    AuditEntry[];
  completionChecklist: CompletionChecklist;
  certificationRecord: CertificationRecord | null;
  /**
   * Cross-workflow dependency posture for this instance — upstream
   * required events, downstream impact surface, and the certification
   * gate's dep verdict. Always present; empty lists when the event
   * declares no dependencies.
   */
  dependencies: DependencyCheck;

  /* ── Derived posture ── */
  auditState:            AuditState;
  /** Stackable secondary signals (overdue, sla-warning, grace-window, …). */
  auditFlags:            AuditFlag[];
  /** Plain-English reasons for the current audit state — fed to Brad + banners. */
  auditReasons:          string[];
  /**
   * Disposition the certification gate will assign when this instance
   * is signed off right now. `'certified-with-exception'` means the
   * instance is in the SLA grace window; `'blocked'` means the gate
   * will refuse.
   */
  certificationDisposition: CertificationDisposition;
  /** Signed days until due; negative = past due. */
  daysUntilDue:          number;
  readyForCertification: boolean;
  isCertified:           boolean;
  isComplete:            boolean;
  slaDaysPastDue:        number;
}

/* ─── Pure assembler (no hooks) ─────────────────────────────
   Exposed so non-React callers (Brad runtime, export, tests) can
   build the same projection from a store snapshot.
   ────────────────────────────────────────────────────────── */
export function buildWorkflowInstance(args: {
  event:           RegulatoryEvent;
  today:           Date;
  store:           ReturnType<typeof useRegulatoryExecutionStore.getState>;
  /** Full catalog used for cross-workflow dependency resolution. */
  allEvents:       RegulatoryEvent[];
  documents:       EvidenceDoc[];
  approvalReqs:    ApprovalRequest[];
  notes:           InstanceNote[];
  auditTrail:      AuditEntry[];
  certificationRecord: CertificationRecord | null;
}): WorkflowInstance {
  const {
    event, today, store, allEvents,
    documents, approvalReqs, notes, auditTrail, certificationRecord,
  } = args;

  const steps: InstanceStepSlot[] = event.processFlow.map(s => ({
    id:     s.id,
    label:  s.label,
    status: store.effectiveStepStatus(event, s.id),
  }));

  const forms: InstanceFormSlot[] = event.requiredForms.map(f => ({
    id:        f.id,
    label:     f.label,
    formRef:   f.formId,
    status:    store.effectiveFormStatus(event, f.id),
    documents: f.formId
      ? documents.filter(d => d.linkedFormId === f.formId)
      : [],
  }));

  /* Approval slots — merge declared ApprovalRules with any runtime
     ApprovalRequests. Rules come first (they define the audit
     requirement); unlinked runtime requests get appended. */
  const approvals: InstanceApprovalSlot[] = [];
  const matchedRequestIds = new Set<string>();

  for (const rule of event.approvals ?? []) {
    const match = approvalReqs.find(a =>
      a.targetKind  === rule.targetKind &&
      a.targetLabel === rule.targetLabel,
    );
    if (match) matchedRequestIds.add(match.id);
    approvals.push({
      ruleId:       rule.id,
      targetKind:   rule.targetKind,
      targetLabel:  rule.targetLabel,
      approverRole: rule.approverRole,
      required:     rule.required,
      status:       match ? match.status : 'missing',
      requestId:    match?.id,
      decidedAt:    match?.decidedAt,
      approver:     match?.approver,
    });
  }
  for (const req of approvalReqs) {
    if (matchedRequestIds.has(req.id)) continue;
    approvals.push({
      targetKind:   req.targetKind,
      targetLabel:  req.targetLabel,
      required:     false,
      status:       req.status,
      requestId:    req.id,
      decidedAt:    req.decidedAt,
      approver:     req.approver,
    });
  }

  const completionChecklist = buildCompletionChecklist(event, today, store);
  const evaluation          = evaluateAudit(event, today, store);
  const isComplete          = store.isEventComplete(event.id);
  const isCertified         = store.isCertified(event.id);
  const dependencies        = checkDependencies(event, allEvents, today, store);

  // Certification gate must also respect cross-workflow dependencies —
  // even if every in-instance checklist item passes, a hard upstream
  // block defers certification.
  const readyForCertification =
    evaluation.readyForCertification && dependencies.posture !== 'hard-block';

  return {
    workflowId:            event.id,
    instanceId:            event.id,
    event,
    documents,
    forms,
    steps,
    approvals,
    notes,
    auditTrail,
    completionChecklist,
    certificationRecord,
    dependencies,
    auditState:               evaluation.primary,
    auditFlags:               evaluation.flags,
    auditReasons:             evaluation.reasons,
    certificationDisposition: evaluation.disposition,
    daysUntilDue:             evaluation.daysUntilDue,
    readyForCertification,
    isCertified,
    isComplete,
    slaDaysPastDue:           evaluation.slaDaysPastDue,
  };
}

/* ─── React hook ───────────────────────────────────────────
   Subscribes to the per-event slices with stable selectors so we
   don't re-render on unrelated store churn. Returns `null` when no
   event is supplied so callers can render an empty state cleanly.
   ────────────────────────────────────────────────────────── */
export function useWorkflowInstance(
  event: RegulatoryEvent | null,
  today: Date = TODAY_ANCHOR,
): WorkflowInstance | null {
  const store               = useRegulatoryExecutionStore();
  const evId                = event?.id ?? '';
  const documents           = useEventEvidence(evId);
  const approvalReqs        = useEventApprovals(evId);
  const notes               = useEventNotes(evId);
  const certificationRecord = useEventCertification(evId) ?? null;
  const auditLog            = useEnforcementStore(s => s.auditLog);
  const taskAuditByEventId  = useRegulatoryExecutionStore(s => s.taskAuditByEventId);
  const generatedEvents     = useAutogenStore(s => s.generatedEvents);
  const triggeredEvents     = useAutogenStore(s => s.triggeredEvents);

  // Full catalog used to resolve cross-workflow dependencies.
  const allEvents = useMemo(
    () => [...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents],
    [generatedEvents, triggeredEvents],
  );

  return useMemo<WorkflowInstance | null>(() => {
    if (!event) return null;
    const eventAliases = Array.from(new Set([event.id, ...(store.eventInstanceIdsBySourceEventId[event.id] ?? [])]));
    const enforcementTrail = auditLog.filter(l => eventAliases.includes(l.eventId));
    const executionTrail: AuditEntry[] = eventAliases
      .flatMap(alias => taskAuditByEventId[alias] ?? [])
      .map(row => ({
        id: `exec-${row.auditId}`,
        // honest timestamp from store entry (fixes missing/broken ts)
        ts: row.timestamp || new Date().toISOString(),
        // actor resolution: prefer id (from exec) or role; enforcement trails carry display names
        actor: row.actorId ?? row.actorRole ?? 'system',
        actorRole: row.actorRole,
        action: row.action as AuditEntry['action'],
        // tie to the actual record (alias/instance) for correct event/form/evidence/workflow refs
        eventId: row.eventId || event.id,
        targetKind: row.targetKind ?? row.entityType,
        targetId: row.targetId ?? row.entityId,
        before: row.before,
        after: row.after,
        reason: row.reason,
      }));
    const auditTrail = [...enforcementTrail, ...executionTrail]
      .sort((a, b) => {
        const ta = Date.parse(a.ts) || 0;
        const tb = Date.parse(b.ts) || 0;
        return ta - tb;
      });
    return buildWorkflowInstance({
      event,
      today,
      store,
      allEvents,
      documents,
      approvalReqs,
      notes,
      auditTrail,
      certificationRecord,
    });
    // `store` is the full slice object — Zustand's snapshot contract
    // keeps nested records stable between unrelated mutations, so we
    // include the specific slices the assembler reads rather than
    // the store reference itself (which changes every render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    event, today, allEvents,
    documents, approvalReqs, notes, certificationRecord, auditLog, taskAuditByEventId,
    store.stepStates, store.formStates, store.minutesStates,
    store.completions, store.certifications, store.eventInstanceIdsBySourceEventId,
  ]);
}

/* ─── Small helpers shared by the Audit View ──────────────── */

export function isFormComplete(slot: InstanceFormSlot): boolean {
  return slot.status === 'complete';
}

export function isApprovalSatisfied(slot: InstanceApprovalSlot): boolean {
  if (!slot.required) return slot.status !== 'rejected';
  return slot.status === 'approved';
}

export function isStepComplete(slot: InstanceStepSlot): boolean {
  return slot.status === 'complete';
}
