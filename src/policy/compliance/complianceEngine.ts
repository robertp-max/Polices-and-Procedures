/**
 * Compliance Engine
 * =================
 * Converts any RegulatoryEvent + runtime state into a structured
 * ComplianceObject that captures EVALUATABLE compliance state —
 * not display metadata.
 *
 * Rules:
 *  - isOverdue   : current date > dueDate AND not complete
 *  - isAtRisk    : due within 7 days AND not complete
 *  - missingItems: incomplete forms, steps, minutes, approvals, blocked deps
 *  - complianceImpact: mapped from domain + overdue + missing evidence
 *  - surveyReadinessScore: 0–100, derived from completed vs total required checks
 *
 * This module is PURE — no I/O, no storage, no side effects.
 * Callers supply runtime state via ComplianceInput.
 */

import type { RegulatoryEvent, EventCadence, MandateType } from '@/policy/data/regulatoryEvents';
import type {
  FormStatus,
  StepStatus,
  MinutesStatus,
  EvidenceDoc,
  ApprovalRequest,
  CompletionState,
} from '@/policy/stores/regulatoryExecutionStore';
import { TODAY_ANCHOR } from '@/policy/data/regulatoryEvents';

/* ── Output types ──────────────────────────────────────────── */

export type CompletionStatusKind =
  | 'complete'
  | 'in-progress'
  | 'not-started'
  | 'overdue'
  | 'blocked';

/**
 * Maps to the compliance-impact taxonomy surveyors use:
 *   HIGH_RISK         → overdue obligation; deficiency finding likely
 *   SURVEY_RISK       → missing required documentation
 *   PATIENT_SAFETY_RISK → incomplete clinical review or observation
 *   BILLING_RISK      → claims or revenue-cycle item incomplete
 *   OPERATIONAL_RISK  → non-clinical item that is incomplete but not yet overdue
 *   NONE              → fully compliant
 */
export type ComplianceImpactKind =
  | 'HIGH_RISK'
  | 'SURVEY_RISK'
  | 'PATIENT_SAFETY_RISK'
  | 'BILLING_RISK'
  | 'OPERATIONAL_RISK'
  | 'NONE';

export interface MissingItem {
  id: string;
  kind: 'form' | 'step' | 'minutes' | 'approval' | 'evidence' | 'dependency';
  label: string;
  /** Cross-reference to the Forms Library */
  formId?: string;
  /** Policy / regulation this requirement derives from */
  policyRef?: string;
  /** Concrete, actionable explanation — the answer to "what is wrong and why does it matter?" */
  complianceNote: string;
}

export interface PolicyViolation {
  policyRef: string;
  /** CoP citation, e.g. "42 CFR §484.65" */
  citation?: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
}

export interface ComplianceObject {
  id: string;
  title: string;
  /** First policy reference — primary classification key */
  policyId: string;
  owner: string;
  /** ISO date string, YYYY-MM-DD */
  dueDate: string;
  frequency: EventCadence;
  mandateType?: MandateType;
  domain: string;

  /** Flat list of every artifact the event requires to be survey-ready */
  requiredArtifacts: string[];
  /** Form-level detail with runtime status from the store */
  requiredForms: {
    id: string;
    label: string;
    formId?: string;
    status: FormStatus;
  }[];

  completionStatus: CompletionStatusKind;
  isOverdue: boolean;
  daysOverdue: number;
  isAtRisk: boolean;
  daysUntilDue: number;

  /** Every incomplete/missing item with a concrete compliance explanation */
  missingItems: MissingItem[];
  complianceImpact: ComplianceImpactKind;
  /** Human-readable explanation of the impact rating */
  complianceImpactReason: string;
  /** Structural policy violations (overdue, missing approvals) */
  policyViolations: PolicyViolation[];
  /** 0–100 percentage; how close this event is to being survey-ready */
  surveyReadinessScore: number;
  /** ISO timestamp of when this object was computed */
  computedAt: string;
}

/* ── Input contract ────────────────────────────────────────── */

export interface ComplianceInput {
  now?: Date;
  stepStatus:    (stepId: string) => StepStatus;
  formStatus:    (formId: string) => FormStatus;
  minutesStatus: () => MinutesStatus | null;
  evidence:      EvidenceDoc[];
  approvals:     ApprovalRequest[];
  completion?:   CompletionState;
  allEvents?:    RegulatoryEvent[];
  isComplete?:   (eventId: string) => boolean;
}

/* ── Core computation ──────────────────────────────────────── */

export function computeCompliance(
  event: RegulatoryEvent,
  input: ComplianceInput,
): ComplianceObject {
  const now = input.now ?? TODAY_ANCHOR;
  const evDate = new Date(event.date + 'T00:00:00');
  const msPerDay = 86_400_000;
  const daysUntilDue = Math.round((evDate.getTime() - now.getTime()) / msPerDay);
  const daysOverdue = daysUntilDue < 0 ? Math.abs(daysUntilDue) : 0;

  const isComplete = input.completion?.status === 'complete';
  const isOverdue = !isComplete && daysUntilDue < 0;
  const isAtRisk = !isComplete && daysUntilDue >= 0 && daysUntilDue <= 7;

  const missingItems: MissingItem[] = [];
  const policyViolations: PolicyViolation[] = [];

  /* ── 1. Workflow steps ── */
  for (const step of event.processFlow) {
    const status = input.stepStatus(step.id);
    if (status === 'complete') continue;
    missingItems.push({
      id: `missing-step-${step.id}`,
      kind: 'step',
      label: step.label,
      policyRef: event.policyRefs[0],
      complianceNote: step.instructions
        ? `Step "${step.label}" is ${status}. Required action: ${step.instructions.split('\n')[0]}`
        : `Workflow step "${step.label}" is ${status} — must be completed before this event can close.`,
    });
  }

  /* ── 2. Required forms ── */
  const requiredForms = event.requiredForms.map(f => ({
    id:     f.id,
    label:  f.label,
    formId: f.formId,
    status: input.formStatus(f.id),
  }));

  for (const f of requiredForms) {
    if (f.status === 'complete') continue;
    missingItems.push({
      id: `missing-form-${f.id}`,
      kind: 'form',
      label: f.label,
      formId: f.formId,
      policyRef: event.policyRefs[0],
      complianceNote: f.status === 'missing'
        ? `Required form "${f.label}"${f.formId ? ` (${f.formId})` : ''} is missing. This form is required under ${event.policyRefs[0] ?? 'agency policy'} and must be present in the survey evidence bundle.`
        : `Required form "${f.label}" has status "${f.status}" — must be finalized before completion is allowed.`,
    });
  }

  /* ── 3. Meeting minutes ── */
  if (event.minutes) {
    const minutesStatus = input.minutesStatus();
    if (!minutesStatus || minutesStatus !== 'finalized') {
      missingItems.push({
        id: 'missing-minutes',
        kind: 'minutes',
        label: 'Meeting minutes',
        policyRef: event.policyRefs[0],
        complianceNote: `Meeting minutes are not finalized (current status: ${minutesStatus ?? 'missing'}). Minutes must be drafted, reviewed, and signed off by ${(event.minutes.signOffRoles ?? ['authorized personnel']).join(', ')}.`,
      });
      for (const section of event.minutes.requiredSections ?? []) {
        missingItems.push({
          id: `missing-minutes-section-${section.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`,
          kind: 'minutes',
          label: `Minutes section: ${section}`,
          complianceNote: `Required minutes section "${section}" must be populated to satisfy CMS documentation standards for ${event.domain} events.`,
        });
      }
    }
  }

  /* ── 4. Pending approval requests (runtime) ── */
  const pendingApprovals = input.approvals.filter(
    a => a.eventId === event.id && a.status === 'pending',
  );
  for (const a of pendingApprovals) {
    missingItems.push({
      id: `missing-approval-${a.id}`,
      kind: 'approval',
      label: `Pending approval: ${a.targetLabel}`,
      complianceNote: `Approval for "${a.targetLabel}" is pending. This event cannot close until all approvals are resolved.`,
    });
  }

  /* ── 5. Structural approval rules declared on the event ── */
  const missingApprovalRules = (event.approvals ?? []).filter(r =>
    r.required &&
    !input.approvals.some(
      a => a.targetKind === r.targetKind && a.targetLabel === r.targetLabel && a.status === 'approved',
    ),
  );
  for (const rule of missingApprovalRules) {
    missingItems.push({
      id: `missing-approval-rule-${rule.id}`,
      kind: 'approval',
      label: `Required approval: ${rule.targetLabel} by ${rule.approverRole}`,
      policyRef: event.policyRefs[0],
      complianceNote: `Approval from ${rule.approverRole} is structurally required for "${rule.targetLabel}" and has not been obtained. This is a compliance gap under ${event.policyRefs[0] ?? 'agency policy'}${event.complianceFlags?.citation ? ` (${event.complianceFlags.citation})` : ''}.`,
    });
    policyViolations.push({
      policyRef: event.policyRefs[0] ?? 'POLICY',
      citation: event.complianceFlags?.citation,
      description: `Required approval from ${rule.approverRole} not obtained for "${rule.targetLabel}"`,
      severity: 'critical',
    });
  }

  /* ── 6. Dependency blocks ── */
  if (event.dependencies?.dependsOn?.length && input.isComplete) {
    const catalog = input.allEvents ?? [];
    for (const depId of event.dependencies.dependsOn) {
      if (!input.isComplete(depId)) {
        const dep = catalog.find(e => e.id === depId);
        missingItems.push({
          id: `missing-dep-${depId}`,
          kind: 'dependency',
          label: `Upstream dependency: ${dep?.title ?? depId}`,
          policyRef: dep?.policyRefs[0],
          complianceNote: `This event depends on "${dep?.title ?? depId}" being completed first. That event is not yet closed — this creates a workflow sequencing gap.`,
        });
      }
    }
  }

  /* ── 7. Policy violations from overdue state ── */
  if (isOverdue) {
    policyViolations.push({
      policyRef: event.policyRefs[0] ?? 'POLICY',
      citation: event.complianceFlags?.citation,
      description: `Event is ${daysOverdue} day(s) past its due date. Non-completion of a ${event.cadence.toLowerCase()} regulatory obligation may constitute a Condition of Participation deficiency.`,
      severity: daysOverdue >= 14 ? 'critical' : daysOverdue >= 7 ? 'high' : 'medium',
    });
  }

  /* ── 8. Evidence sufficiency ── */
  const uploadedFormIds = new Set(
    input.evidence.map(d => d.linkedFormId).filter(Boolean) as string[],
  );
  for (const f of event.requiredForms) {
    if (f.formId && !uploadedFormIds.has(f.formId) && input.formStatus(f.id) !== 'complete') {
      missingItems.push({
        id: `missing-evidence-${f.id}`,
        kind: 'evidence',
        label: `No uploaded evidence for ${f.formId}`,
        formId: f.formId,
        policyRef: event.policyRefs[0],
        complianceNote: `No uploaded document is linked to form "${f.formId}". The audit bundle requires a physical copy or generated artifact to be survey-defensible.`,
      });
    }
  }

  /* ── 9. Completion status ── */
  const hasBlockedDep =
    event.dependencies?.dependsOn?.length &&
    input.isComplete &&
    event.dependencies.dependsOn.some(id => !input.isComplete!(id));

  let completionStatus: CompletionStatusKind;
  if (isComplete) {
    completionStatus = 'complete';
  } else if (hasBlockedDep) {
    completionStatus = 'blocked';
  } else if (isOverdue) {
    completionStatus = 'overdue';
  } else if (
    event.processFlow.some(s => {
      const st = input.stepStatus(s.id);
      return st === 'in-progress' || st === 'complete';
    })
  ) {
    completionStatus = 'in-progress';
  } else {
    completionStatus = 'not-started';
  }

  /* ── 10. Compliance impact ── */
  const { impactKind, impactReason } = deriveImpact(event, isOverdue, missingItems, daysOverdue);

  /* ── 11. Survey readiness score ── */
  const surveyReadinessScore = computeSurveyReadiness(
    event, missingItems, isOverdue, isComplete, input,
  );

  /* ── 12. Required artifacts list ── */
  const requiredArtifacts = [
    ...event.requiredForms.map(f => f.label),
    ...(event.minutes ? ['Meeting minutes'] : []),
    ...(event.agenda ? ['Agenda packet'] : []),
    ...(event.approvals?.filter(a => a.required).map(a => `Approval: ${a.targetLabel}`) ?? []),
  ];

  return {
    id: event.id,
    title: event.title,
    policyId: event.policyRefs[0] ?? 'UNCLASSIFIED',
    owner: event.owner,
    dueDate: event.date,
    frequency: event.cadence,
    mandateType: event.mandateType,
    domain: event.domain,
    requiredArtifacts,
    requiredForms,
    completionStatus,
    isOverdue,
    daysOverdue,
    isAtRisk,
    daysUntilDue,
    missingItems,
    complianceImpact: impactKind,
    complianceImpactReason: impactReason,
    policyViolations,
    surveyReadinessScore,
    computedAt: now.toISOString(),
  };
}

/* ── Impact derivation ─────────────────────────────────────── */

function deriveImpact(
  event: RegulatoryEvent,
  isOverdue: boolean,
  missingItems: MissingItem[],
  daysOverdue: number,
): { impactKind: ComplianceImpactKind; impactReason: string } {
  if (isOverdue) {
    return {
      impactKind: 'HIGH_RISK',
      impactReason: `This ${event.cadence.toLowerCase()} event is ${daysOverdue} day(s) overdue. CMS surveyors look for timely execution of ${event.domain} obligations — a gap here is a direct deficiency finding risk under ${event.complianceFlags?.citation ?? event.policyRefs[0] ?? 'applicable CoPs'}.`,
    };
  }

  const docMissing = missingItems.filter(m => m.kind === 'form' || m.kind === 'evidence');
  if (docMissing.length > 0) {
    return {
      impactKind: 'SURVEY_RISK',
      impactReason: `${docMissing.length} required documentation item(s) are missing. Without a complete evidence bundle, this event cannot be considered survey-ready and would likely result in a documentation deficiency finding.`,
    };
  }

  if (event.domain === 'Clinical' && missingItems.length > 0) {
    return {
      impactKind: 'PATIENT_SAFETY_RISK',
      impactReason: `Incomplete clinical workflow may indicate a gap in patient care oversight. Missing: ${missingItems.map(m => m.label).join(', ')}.`,
    };
  }

  if (event.domain === 'Finance' && missingItems.length > 0) {
    return {
      impactKind: 'BILLING_RISK',
      impactReason: `Incomplete billing/finance workflow item(s) may result in claim denials or audit findings. Missing: ${missingItems.map(m => m.label).join(', ')}.`,
    };
  }

  if (missingItems.length > 0) {
    return {
      impactKind: 'OPERATIONAL_RISK',
      impactReason: `${missingItems.length} workflow item(s) are incomplete. While not yet overdue, unresolved items become compliance liabilities as the due date approaches.`,
    };
  }

  return {
    impactKind: 'NONE',
    impactReason: 'All required items are complete. This event is survey-ready.',
  };
}

/* ── Survey readiness score ────────────────────────────────── */

function computeSurveyReadiness(
  event: RegulatoryEvent,
  _missingItems: MissingItem[],
  isOverdue: boolean,
  isComplete: boolean,
  input: ComplianceInput,
): number {
  if (isComplete) return 100;

  const stepsTotal    = event.processFlow.length;
  const formsTotal    = event.requiredForms.length;
  const minutesMax    = event.minutes ? 1 : 0;
  const approvalsMax  = event.approvals?.filter(a => a.required).length ?? 0;
  const maxChecks = stepsTotal + formsTotal + minutesMax + approvalsMax;
  if (maxChecks === 0) return isOverdue ? 0 : 50;

  const completedSteps  = event.processFlow.filter(s => input.stepStatus(s.id) === 'complete').length;
  const completedForms  = event.requiredForms.filter(f => input.formStatus(f.id) === 'complete').length;
  const minutesOk       = event.minutes ? (input.minutesStatus() === 'finalized' ? 1 : 0) : 0;
  const approvalsOk     = (event.approvals?.filter(r => r.required) ?? []).filter(r =>
    input.approvals.some(
      a => a.targetKind === r.targetKind && a.targetLabel === r.targetLabel && a.status === 'approved',
    ),
  ).length;

  const completedChecks = completedSteps + completedForms + minutesOk + approvalsOk;
  let score = Math.round((completedChecks / maxChecks) * 100);

  // Overdue cap: being past the deadline lowers survey readiness regardless of internal progress
  if (isOverdue) score = Math.min(score, 40);

  return Math.max(0, Math.min(100, score));
}

/* ── Batch computation ─────────────────────────────────────── */

export interface ComplianceBatch {
  objects: ComplianceObject[];
  byId: Record<string, ComplianceObject>;
  kpis: ComplianceKpis;
}

export interface ComplianceKpis {
  total: number;
  overdue: number;
  dueThisWeek: number;
  blocked: number;
  missingEvidence: number;
  surveyReadinessPct: number;
  immediateJeopardy: number;
  complete: number;
}

export function computeComplianceBatch(
  events: RegulatoryEvent[],
  inputFn: (event: RegulatoryEvent) => ComplianceInput,
): ComplianceBatch {
  const actionable = events.filter(e => !e.isContext);
  const objects = actionable.map(e => computeCompliance(e, inputFn(e)));
  const byId: Record<string, ComplianceObject> = {};
  for (const obj of objects) byId[obj.id] = obj;

  const overdue = objects.filter(o => o.isOverdue).length;
  const dueThisWeek = objects.filter(o => o.completionStatus !== 'complete' && o.daysUntilDue >= 0 && o.daysUntilDue <= 7).length;
  const blocked = objects.filter(o => o.completionStatus === 'blocked').length;
  const missingEvidence = objects.filter(o =>
    o.missingItems.some(m => m.kind === 'form' || m.kind === 'evidence'),
  ).length;
  const complete = objects.filter(o => o.completionStatus === 'complete').length;
  const surveyReadinessPct = objects.length > 0
    ? Math.round(objects.reduce((sum, o) => sum + o.surveyReadinessScore, 0) / objects.length)
    : 100;
  const immediateJeopardy = objects.filter(
    o => o.isOverdue && (o.complianceImpact === 'HIGH_RISK' || o.complianceImpact === 'PATIENT_SAFETY_RISK'),
  ).length;

  return {
    objects,
    byId,
    kpis: {
      total: actionable.length,
      overdue,
      dueThisWeek,
      blocked,
      missingEvidence,
      surveyReadinessPct,
      immediateJeopardy,
      complete,
    },
  };
}
