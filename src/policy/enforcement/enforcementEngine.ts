import {
  REGULATORY_EVENTS,
  TODAY_ANCHOR,
  type RegulatoryEvent,
} from '@/policy/data/regulatoryEvents';
import type {
  ApprovalRequest, EvidenceDoc, FormStatus, MinutesStatus, StepStatus,
  CompletionState,
} from '@/policy/stores/regulatoryExecutionStore';
import type {
  Blocker, Warning, TimelineIssue, ApprovalGap,
  EnforcementReport, EnforcementRiskLevel, LockState,
} from './types';
import { resolveEscalationTarget } from './roleHierarchy';

/* ═══════════════════════════════════════════════════════════════
   Enforcement Engine — pure, deterministic validation.

   Inputs (all immutable): the event definition + the current
   runtime state. No I/O, no storage — so callers can use it inside
   store selectors, tests, and the Audit Mode report generator.
   ═══════════════════════════════════════════════════════════════ */

export interface EnforcementInput {
  event: RegulatoryEvent;
  now?: Date;
  stepStatus:    (stepId: string) => StepStatus;
  formStatus:    (formId: string) => FormStatus;
  minutesStatus: () => MinutesStatus | null;
  evidence:      EvidenceDoc[];
  approvals:     ApprovalRequest[];
  completion?:   CompletionState;
  lock?:         LockState;
  /** Other events in the catalog — needed to validate `dependsOn`. */
  allEvents?:    RegulatoryEvent[];
  /** Completion state lookup for dependency resolution. */
  isComplete?:   (eventId: string) => boolean;
}

/* ─── Helpers ─────────────────────────────────────────── */

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/* ─── Main validator ──────────────────────────────────── */

export function computeEnforcement(input: EnforcementInput): EnforcementReport {
  const { event } = input;
  const now = input.now ?? TODAY_ANCHOR;
  const isoNow = now.toISOString();

  const blockers: Blocker[] = [];
  const warnings: Warning[] = [];
  const timelineIssues: TimelineIssue[] = [];
  const approvalGaps: ApprovalGap[] = [];

  /* ── 1. Lock gate ── */
  const locked = !!input.lock?.locked;
  if (locked) {
    blockers.push({
      id: 'blk-lock',
      kind: 'lock',
      severity: 'critical',
      label: 'Event is locked after completion & approval',
      remediation: `Contact ${input.lock?.unlockRole ?? 'Administrator'} to unlock. Unlocks are audit-logged.`,
    });
  }

  /* ── 2. Workflow steps ── */
  let stepsComplete = 0;
  for (const step of event.processFlow) {
    if (input.stepStatus(step.id) === 'complete') {
      stepsComplete++;
    } else {
      blockers.push({
        id: `blk-step-${step.id}`,
        kind: 'step',
        severity: 'high',
        label: `Workflow step not complete: ${step.label}`,
        targetId: step.id,
        remediation: step.onCompleteText
          ? `Close this step to proceed — ${step.onCompleteText}`
          : 'Open the workflow drawer and mark this step complete with evidence.',
      });
    }
  }

  /* ── 3. Required forms ── */
  let formsComplete = 0;
  for (const f of event.requiredForms) {
    const s = input.formStatus(f.id);
    if (s === 'complete') {
      formsComplete++;
    } else if (s === 'missing') {
      blockers.push({
        id: `blk-form-${f.id}`,
        kind: 'form',
        severity: 'high',
        label: `Required form missing: ${f.label}`,
        targetId: f.id,
        remediation: f.formId
          ? `Upload or generate ${f.formId} on this event's Forms tab.`
          : 'Attach the required artifact before completion.',
      });
    } else {
      blockers.push({
        id: `blk-form-${f.id}`,
        kind: 'form',
        severity: 'medium',
        label: `Form not complete: ${f.label}`,
        targetId: f.id,
        remediation: 'Finalize and mark the form complete on the Forms tab.',
      });
    }
  }

  /* ── 4. Evidence sufficiency (at least one uploaded doc per required form that declares a formId) ── */
  const uploadedFormIds = new Set(input.evidence.map(d => d.linkedFormId).filter(Boolean) as string[]);
  for (const f of event.requiredForms) {
    if (f.formId && !uploadedFormIds.has(f.formId) && input.formStatus(f.id) !== 'complete') {
      warnings.push({
        id: `wrn-evidence-${f.id}`,
        label: `No uploaded evidence linked to ${f.formId}`,
        remediation: 'Upload a completed copy of the form so the audit bundle is self-contained.',
      });
    }
  }

  /* ── 5. Minutes ── */
  const minutesRequired = !!event.minutes;
  const minutesStatus = input.minutesStatus();
  const minutesFinalized = minutesRequired ? minutesStatus === 'finalized' : true;
  if (minutesRequired && !minutesFinalized) {
    blockers.push({
      id: 'blk-minutes',
      kind: 'minutes',
      severity: 'high',
      label: 'Meeting minutes not finalized',
      remediation: 'Draft → review → finalize minutes. Required sections must be present.',
    });
    // Enumerate required sections as sub-blockers so operators can see what's missing.
    for (const section of event.minutes?.requiredSections ?? []) {
      blockers.push({
        id: `blk-min-section-${slug(section)}`,
        kind: 'minutes-section',
        severity: 'medium',
        label: `Minutes section required: ${section}`,
        remediation: 'Populate this section in the minutes template.',
      });
    }
  }

  /* ── 6. Approvals ── */
  // Approval requests explicitly raised at runtime.
  const pendingRequests = input.approvals.filter(a => a.status === 'pending');
  pendingRequests.forEach(a => {
    blockers.push({
      id: `blk-approval-${a.id}`,
      kind: 'approval',
      severity: 'high',
      label: `Pending approval: ${a.targetLabel}`,
      targetId: a.id,
      remediation: 'Route to the assigned approver. Escalate if the window has lapsed.',
    });
    approvalGaps.push({
      id: `gap-${a.id}`,
      ruleId: a.id,
      targetKind: a.targetKind,
      targetLabel: a.targetLabel,
      approverRole: 'Current Approver',
      status: 'pending',
    });
  });

  // Approval *rules* declared on the event — these represent structural requirements.
  const rules = event.approvals ?? [];
  for (const rule of rules.filter(r => r.required)) {
    const matched = input.approvals.find(a =>
      a.targetKind === rule.targetKind &&
      a.targetLabel === rule.targetLabel &&
      a.status === 'approved',
    );
    if (!matched) {
      blockers.push({
        id: `blk-rule-${rule.id}`,
        kind: 'approval',
        severity: 'critical',
        label: `Required approval missing: ${rule.targetLabel} (${rule.approverRole})`,
        targetId: rule.id,
        remediation: `Request approval from ${rule.approverRole}. Escalation target: ${resolveEscalationTarget(rule.approverRole, rule.escalateToRole)}.`,
        citation: event.complianceFlags?.citation,
      });
      approvalGaps.push({
        id: `gap-rule-${rule.id}`,
        ruleId: rule.id,
        targetKind: rule.targetKind,
        targetLabel: rule.targetLabel,
        approverRole: rule.approverRole,
        escalateToRole: resolveEscalationTarget(rule.approverRole, rule.escalateToRole),
        escalationDueDays: rule.escalationDays,
        status: 'missing',
      });
    }
  }

  /* ── 7. Timeline checks ── */
  const evDate = new Date(event.date + 'T00:00:00');
  const dayDelta = daysBetween(evDate, now); // positive → past the event date
  const overdueCutoff = event.complianceFlags?.overdueAfterDays ?? 0;

  if (!input.completion || input.completion.status !== 'complete') {
    if (dayDelta > overdueCutoff) {
      timelineIssues.push({
        id: 'tl-overdue',
        kind: 'overdue',
        label: `Event is ${dayDelta - overdueCutoff} day(s) overdue`,
        daysPastOrUntil: dayDelta - overdueCutoff,
        severity: dayDelta - overdueCutoff >= 7 ? 'critical' : 'high',
      });
    } else if (dayDelta >= -3 && dayDelta <= 0) {
      timelineIssues.push({
        id: 'tl-approaching',
        kind: 'approaching-deadline',
        label: `${Math.abs(dayDelta)} day(s) until due`,
        daysPastOrUntil: dayDelta,
        severity: 'medium',
      });
    }
  }
  // Premature completion: closing with a blocker OR before required pre-event prep window
  if (input.completion?.status === 'complete' && blockers.length > 0) {
    timelineIssues.push({
      id: 'tl-premature',
      kind: 'premature-completion',
      label: 'Event was marked complete while blockers exist — investigate.',
      daysPastOrUntil: 0,
      severity: 'critical',
    });
  }
  // Minutes past their declared finalization window
  if (minutesRequired && !minutesFinalized && event.minutes?.dueOffsetDays != null) {
    const minutesDue = new Date(evDate.getTime() + event.minutes.dueOffsetDays * 86_400_000);
    const pastDue = daysBetween(minutesDue, now);
    if (pastDue > 0) {
      timelineIssues.push({
        id: 'tl-minutes-past',
        kind: 'minutes-past-due',
        label: `Minutes are ${pastDue} day(s) past their finalize-by date`,
        daysPastOrUntil: pastDue,
        severity: pastDue >= 7 ? 'high' : 'medium',
      });
    }
  }

  /* ── 8. Dependency check ── */
  if (event.dependencies?.dependsOn?.length && input.isComplete) {
    const catalog = input.allEvents ?? REGULATORY_EVENTS;
    for (const depId of event.dependencies.dependsOn) {
      if (!input.isComplete(depId)) {
        const dep = catalog.find(e => e.id === depId);
        blockers.push({
          id: `blk-dep-${depId}`,
          kind: 'dependency',
          severity: 'high',
          label: `Upstream event not complete: ${dep?.title ?? depId}`,
          targetId: depId,
          remediation: `Close ${dep?.title ?? depId} first. This event cannot be completed while its upstream is open.`,
        });
      }
    }
  }

  /* ── 9. Risk level ── */
  const riskLevel = computeRiskLevel(event, blockers, timelineIssues);

  /* ── 10. canComplete ── */
  // Allowed to complete only if: zero blockers, at least one step, minutes finalized if required,
  // and no critical timeline issues.
  const hasCriticalTimeline = timelineIssues.some(t => t.severity === 'critical' && t.kind !== 'approaching-deadline');
  const canComplete =
    !locked &&
    blockers.length === 0 &&
    event.processFlow.length > 0 &&
    (!minutesRequired || minutesFinalized) &&
    !hasCriticalTimeline;

  /* ── 11. Summary ── */
  const summary = canComplete
    ? 'Ready to close. All required evidence, approvals, and minutes in order.'
    : locked
      ? 'Locked — further changes require an authorized unlock.'
      : `${blockers.length} blocker${blockers.length === 1 ? '' : 's'}${approvalGaps.length ? ` · ${approvalGaps.length} approval gap${approvalGaps.length === 1 ? '' : 's'}` : ''}${timelineIssues.length ? ` · ${timelineIssues.length} timeline issue${timelineIssues.length === 1 ? '' : 's'}` : ''}`;

  return {
    eventId: event.id,
    canComplete,
    isLocked: locked,
    riskLevel,
    blockers,
    warnings,
    timelineIssues,
    approvalGaps,
    progress: {
      stepsComplete,
      stepsTotal: event.processFlow.length,
      formsComplete,
      formsTotal: event.requiredForms.length,
      evidenceCount: input.evidence.length,
      minutesRequired,
      minutesFinalized,
    },
    summary,
    computedAt: isoNow,
  };
}

function computeRiskLevel(
  event: RegulatoryEvent,
  blockers: Blocker[],
  timeline: TimelineIssue[],
): EnforcementRiskLevel {
  const declared = event.complianceFlags?.auditRisk;
  const criticalBlockers = blockers.filter(b => b.severity === 'critical').length;
  const criticalTimeline = timeline.filter(t => t.severity === 'critical').length;

  // Immediate jeopardy: declared-critical event with overdue + missing approval/evidence.
  if (declared === 'critical' && (criticalBlockers > 0 || criticalTimeline > 0)) {
    return 'immediate-jeopardy';
  }
  if (criticalBlockers > 0 || criticalTimeline > 0) return 'high';
  if (blockers.length > 3 || timeline.length > 1) return 'high';
  if (blockers.length > 0 || timeline.length > 0) return 'medium';
  return declared === 'critical' || declared === 'high' ? 'low' : 'low';
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

/* ─── Convenience: evaluate a batch of events (for Audit Mode) ── */

export interface BatchReport {
  reports: EnforcementReport[];
  byEventId: Record<string, EnforcementReport>;
  kpi: {
    total: number;
    canComplete: number;
    locked: number;
    overdue: number;
    immediateJeopardy: number;
    high: number;
    approvalGaps: number;
    missingEvidence: number;
  };
}

export function computeBatch(
  inputs: EnforcementInput[],
): BatchReport {
  const reports = inputs.map(computeEnforcement);
  const byEventId: Record<string, EnforcementReport> = {};
  let canComplete = 0, locked = 0, overdue = 0, immediate = 0, high = 0, gaps = 0, missing = 0;
  for (const r of reports) {
    byEventId[r.eventId] = r;
    if (r.canComplete)             canComplete++;
    if (r.isLocked)                locked++;
    if (r.timelineIssues.some(t => t.kind === 'overdue')) overdue++;
    if (r.riskLevel === 'immediate-jeopardy') immediate++;
    if (r.riskLevel === 'high')    high++;
    gaps += r.approvalGaps.length;
    missing += r.blockers.filter(b => b.kind === 'form' || b.kind === 'evidence').length;
  }
  return {
    reports,
    byEventId,
    kpi: {
      total: reports.length,
      canComplete,
      locked,
      overdue,
      immediateJeopardy: immediate,
      high,
      approvalGaps: gaps,
      missingEvidence: missing,
    },
  };
}
