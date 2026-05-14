import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';

/* ═══════════════════════════════════════════════════════════════
   Enforcement Layer — Types
   ----------------------------------------------------------------
   The enforcement layer is the single source of truth for
   "can this event be completed?", "can this event be mutated?",
   and "what risk does this event carry right now?".
   ═══════════════════════════════════════════════════════════════ */

export type BlockerKind =
  | 'step'         // workflow step not complete
  | 'form'         // required form not complete
  | 'minutes'      // meeting minutes not finalized
  | 'minutes-section' // a required minutes section missing
  | 'approval'     // required approval pending
  | 'evidence'     // required evidence document missing
  | 'timeline'     // deadline-related (too early, too late)
  | 'dependency'   // an upstream event hasn't been closed
  | 'lock';        // event is locked

export type BlockerSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Blocker {
  id: string;
  kind: BlockerKind;
  severity: BlockerSeverity;
  label: string;
  /** Optional id of the offending artifact (step/form/approval). */
  targetId?: string;
  /** User-facing remediation hint. */
  remediation: string;
  /** Stable CoP / policy citation shown to surveyors. */
  citation?: string;
}

export interface Warning {
  id: string;
  label: string;
  remediation: string;
}

export type TimelineIssueKind =
  | 'overdue'
  | 'approaching-deadline'
  | 'premature-completion'
  | 'minutes-past-due'
  | 'escalation-triggered';

export interface TimelineIssue {
  id: string;
  kind: TimelineIssueKind;
  label: string;
  daysPastOrUntil: number;
  severity: BlockerSeverity;
}

export interface ApprovalGap {
  id: string;
  ruleId: string;
  targetKind: 'event' | 'minutes' | 'report' | 'form';
  targetLabel: string;
  approverRole: string;
  escalateToRole?: string;
  escalationDueDays?: number;
  status: 'missing' | 'pending' | 'escalated';
}

export type EnforcementRiskLevel = 'low' | 'medium' | 'high' | 'immediate-jeopardy';

export interface EnforcementReport {
  eventId: string;
  canComplete: boolean;
  isLocked: boolean;
  riskLevel: EnforcementRiskLevel;
  blockers: Blocker[];
  warnings: Warning[];
  timelineIssues: TimelineIssue[];
  approvalGaps: ApprovalGap[];
  progress: {
    stepsComplete: number;
    stepsTotal: number;
    formsComplete: number;
    formsTotal: number;
    evidenceCount: number;
    minutesRequired: boolean;
    minutesFinalized: boolean;
  };
  /** Short, human-readable summary for toasts / banners. */
  summary: string;
  computedAt: string; // ISO
}

/* ─── Audit trail ──────────────────────────────────────── */

export type AuditAction =
  | 'step.status.changed'
  | 'form.status.changed'
  | 'minutes.status.changed'
  | 'evidence.uploaded'
  | 'evidence.removed'
  | 'approval.requested'
  | 'approval.decided'
  | 'event.completed'
  | 'event.reopened'
  | 'event.locked'
  | 'event.unlocked'
  | 'escalation.raised'
  | 'escalation.resolved'
  | 'mutation.blocked'
  | 'signer_task.created';

export interface AuditEntry {
  id: string;
  ts: string;           // ISO
  actor: string;
  actorRole?: string;
  action: AuditAction;
  eventId: string;
  targetKind?: string;
  targetId?: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  /** Correlated enforcement snapshot at the time of the action, if any. */
  riskLevel?: EnforcementRiskLevel;
}

/* ─── Locks ───────────────────────────────────────────── */

export interface LockState {
  eventId: string;
  locked: boolean;
  lockedAt?: string;
  lockedBy?: string;
  reason?: string;
  /** Role that is allowed to unlock — defaults to 'Administrator'. */
  unlockRole?: string;
}

/* ─── Escalations ─────────────────────────────────────── */

export type EscalationKind = 'approval' | 'follow-up' | 'overdue-event' | 'missing-evidence';

export interface Escalation {
  id: string;
  eventId: string;
  kind: EscalationKind;
  raisedAt: string;       // ISO
  fromRole: string;
  toRole: string;
  reason: string;
  /** Optional link back to the offending artifact id. */
  targetId?: string;
  status: 'open' | 'acknowledged' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
}

/* ─── Enforcement context (what mutations need) ───────── */

export interface ActorContext {
  userId: string;
  displayName: string;
  role: string;
}

/* Helper: extract an event's declared unlock role, defaulting. */
export function eventUnlockRole(event: RegulatoryEvent): string {
  return event.approvals?.find(a => a.targetKind === 'event')?.approverRole ?? 'Administrator';
}
