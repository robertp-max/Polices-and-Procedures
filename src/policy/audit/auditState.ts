import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { daysUntil } from '@/policy/data/regulatoryEvents';
import type { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';

/* ═══════════════════════════════════════════════════════════════
   Audit State v2
   ----------------------------------------------------------------
   A finite PRIMARY classification for every workflow instance,
   plus a stackable set of SECONDARY flags. Every consumer of this
   module sees the same contract:

     - dashboard Command Center
     - Audit component
     - Brad
     - audit aggregate / survey export

   Design rules (from the post-simulation hardening brief):

     1. No silent collapse of layered risk. An instance that is
        blocked AND overdue must report both — one as the primary
        state, the other as a flag.
     2. Timing is predictive, not binary. Instances approaching
        SLA emit a warning flag; past-SLA instances that are
        otherwise valid sit in a grace window before hard-fail.
     3. At-Risk is a first-class primary state, not a badge —
        dashboards can route to it, aggregations can count it.
     4. Certification with grace is always recorded as
        "certified-with-exception" in the disposition metadata so
        survey reviewers can audit the exception.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Timing thresholds (days) ────────────────────────────── */
export const SLA_WARNING_DAYS = 5;
export const SLA_URGENT_DAYS  = 2;
export const SLA_GRACE_DAYS   = 3;

export type AuditState =
  | 'audit-ready'              // marked complete + zero blockers + ready to certify
  | 'complete-missing-evidence'// marked complete but forms/minutes gap
  | 'complete-pending-approval'// marked complete but approvals pending
  | 'at-risk'                  // active, on-track by calendar, but signalled to fail
  | 'in-progress'              // actively executing, on-track, no at-risk signals
  | 'blocked'                  // dependency unmet or hard-blocker flag
  | 'overdue'                  // past due date, not complete
  | 'not-certifiable'          // complete but validation regressed (requirement added, etc.)
  | 'certified-locked';        // certified + locked → immutable

export const AUDIT_STATE_LABEL: Record<AuditState, string> = {
  'audit-ready':               'Audit Ready',
  'complete-missing-evidence': 'Missing Evidence',
  'complete-pending-approval': 'Pending Approval',
  'at-risk':                   'At Risk',
  'in-progress':               'In Progress',
  'blocked':                   'Blocked',
  'overdue':                   'Overdue',
  'not-certifiable':           'Not Certifiable',
  'certified-locked':          'Certified & Locked',
};

export const AUDIT_STATE_COLOR: Record<AuditState, string> = {
  'audit-ready':               '#14B8A6', // teal — good, ready to sign
  'complete-missing-evidence': '#F59E0B', // amber
  'complete-pending-approval': '#F59E0B', // amber
  'at-risk':                   '#F97316', // orange — predictive failure
  'in-progress':               '#38BDF8', // sky — actively moving
  'blocked':                   '#EF4444', // red
  'overdue':                   '#EF4444', // red
  'not-certifiable':           '#EF4444', // red — compliance risk
  'certified-locked':          '#A78BFA', // violet — closed record
};

export const AUDIT_STATE_SOFT: Record<AuditState, string> = {
  'audit-ready':               'rgba(20,184,166,0.14)',
  'complete-missing-evidence': 'rgba(245,158,11,0.14)',
  'complete-pending-approval': 'rgba(245,158,11,0.14)',
  'at-risk':                   'rgba(249,115,22,0.16)',
  'in-progress':               'rgba(56,189,248,0.14)',
  'blocked':                   'rgba(239,68,68,0.14)',
  'overdue':                   'rgba(239,68,68,0.14)',
  'not-certifiable':           'rgba(239,68,68,0.18)',
  'certified-locked':          'rgba(167,139,250,0.14)',
};

/* ─── Secondary flags (stackable) ─────────────────────────── */
export type AuditFlag =
  | 'overdue'
  | 'dependency-risk'
  | 'sla-warning'
  | 'sla-urgent'
  | 'grace-window'
  | 'minutes-missing'
  | 'approval-missing'
  | 'evidence-missing'
  | 'billing-critical'
  | 'survey-critical'
  | 'governing-body';

export const AUDIT_FLAG_LABEL: Record<AuditFlag, string> = {
  'overdue':          'Overdue',
  'dependency-risk':  'Dependency Risk',
  'sla-warning':      'SLA Warning',
  'sla-urgent':       'SLA Urgent',
  'grace-window':     'Grace Window',
  'minutes-missing':  'Minutes Missing',
  'approval-missing': 'Approval Missing',
  'evidence-missing': 'Evidence Missing',
  'billing-critical': 'Billing Critical',
  'survey-critical':  'Survey Critical',
  'governing-body':   'Governing Body',
};

/* ─── Certification disposition ──────────────────────────── */
export type CertificationDisposition =
  | 'standard'
  | 'certified-with-exception'
  | 'blocked';

/* ─── Full evaluation result (classifier v2) ─────────────── */
export interface AuditEvaluation {
  primary: AuditState;
  flags: AuditFlag[];
  disposition: CertificationDisposition;
  reasons: string[];
  /** Days until due. Negative = past due. */
  daysUntilDue: number;
  /** Days past due; 0 when still within SLA. */
  slaDaysPastDue: number;
  /** True when this instance is eligible for certification right now. */
  readyForCertification: boolean;
  /** True when certification will be recorded with a grace-window exception. */
  eligibleForGraceCertification: boolean;
}

type ExecStore = ReturnType<typeof useRegulatoryExecutionStore.getState>;

/* ═══════════════════════════════════════════════════════════════
   evaluateAudit — single source of truth
   ----------------------------------------------------------------
   This function drives BOTH the legacy `classifyAuditState` and
   the new v2 surfaces (flags, disposition, readiness). Consumers
   that only want the primary state keep calling the old function;
   consumers that want the full picture call this one.
   ═══════════════════════════════════════════════════════════════ */
export function evaluateAudit(
  event: RegulatoryEvent,
  today: Date,
  store: ExecStore,
): AuditEvaluation {
  const flags: AuditFlag[] = [];
  const reasons: string[] = [];

  /* ── Hard exits ── */
  if (store.isCertified(event.id)) {
    return {
      primary: 'certified-locked',
      flags,
      disposition: 'standard',
      reasons: [],
      daysUntilDue: daysUntil(event.date, today),
      slaDaysPastDue: 0,
      readyForCertification: false,
      eligibleForGraceCertification: false,
    };
  }

  const n = daysUntil(event.date, today);
  const slaDaysPastDue = n < 0 ? Math.abs(n) : 0;
  const complete = store.isEventComplete(event.id);
  const report   = store.validateEvent(event);

  /* ── Blocker fingerprinting ── */
  const hasApprovalBlocker = report.blockers.some(b => b.kind === 'approval');
  const hasEvidenceBlocker = report.blockers.some(b => b.kind === 'form' || b.kind === 'minutes');
  const hasMinutesBlocker  = report.blockers.some(b => b.kind === 'minutes');
  const hasFormsBlocker    = report.blockers.some(b => b.kind === 'form');
  const hasStepsBlocker    = report.blockers.some(b => b.kind === 'step');

  const deps = event.dependencies?.dependsOn ?? [];
  const depsUnmet = deps.filter(id => !store.isEventComplete(id));
  const hasDepBlocker = depsUnmet.length > 0;

  /* ── Secondary flags — record regardless of primary state ── */
  if (hasDepBlocker)        flags.push('dependency-risk');
  if (hasApprovalBlocker)   flags.push('approval-missing');
  if (hasFormsBlocker || report.blockers.some(b => b.kind === 'form')) flags.push('evidence-missing');
  if (hasMinutesBlocker)    flags.push('minutes-missing');

  if (n < 0) {
    flags.push('overdue');
  } else if (n <= SLA_URGENT_DAYS) {
    flags.push('sla-urgent');
  } else if (n <= SLA_WARNING_DAYS) {
    flags.push('sla-warning');
  }

  // Domain/severity flags — cheap to compute, expensive to miss.
  if (event.domain === 'Billing')         flags.push('billing-critical');
  if (event.domain === 'Governing Body')  flags.push('governing-body');
  if (event.complianceFlags?.auditRisk === 'critical' || event.complianceFlags?.auditRisk === 'high') {
    flags.push('survey-critical');
  }

  /* ── Reason list (plain English; consumed by Brad + banners) ── */
  if (hasDepBlocker)        reasons.push(`Upstream dependency incomplete (${depsUnmet.length}).`);
  if (hasApprovalBlocker)   reasons.push('Required approval has not been recorded.');
  if (hasMinutesBlocker)    reasons.push('Meeting minutes are not finalized.');
  if (hasFormsBlocker)      reasons.push('One or more required forms are incomplete.');
  if (hasStepsBlocker)      reasons.push('One or more required steps are still open.');

  /* ── Decide primary state ───────────────────────────────── */

  // 1. Already complete
  if (complete) {
    if (report.canComplete) {
      // Valid AND inside either the SLA window or the grace window.
      if (n >= 0) {
        return {
          primary: 'audit-ready',
          flags,
          disposition: 'standard',
          reasons,
          daysUntilDue: n,
          slaDaysPastDue,
          readyForCertification: true,
          eligibleForGraceCertification: false,
        };
      }
      if (slaDaysPastDue <= SLA_GRACE_DAYS) {
        // Grace window — still audit-ready, but certify as exception.
        flags.push('grace-window');
        reasons.push(
          `Past SLA by ${slaDaysPastDue} day${slaDaysPastDue === 1 ? '' : 's'} — eligible for certified-with-exception within the ${SLA_GRACE_DAYS}-day grace window.`,
        );
        return {
          primary: 'audit-ready',
          flags,
          disposition: 'certified-with-exception',
          reasons,
          daysUntilDue: n,
          slaDaysPastDue,
          readyForCertification: true,
          eligibleForGraceCertification: true,
        };
      }
      // Past the grace window — the operator let a valid instance rot.
      reasons.push(`Past SLA by ${slaDaysPastDue} days — beyond grace window.`);
      return {
        primary: 'not-certifiable',
        flags,
        disposition: 'blocked',
        reasons,
        daysUntilDue: n,
        slaDaysPastDue,
        readyForCertification: false,
        eligibleForGraceCertification: false,
      };
    }

    // Marked complete but validation says otherwise.
    let primary: AuditState = 'not-certifiable';
    if (hasEvidenceBlocker && !hasApprovalBlocker)       primary = 'complete-missing-evidence';
    else if (hasApprovalBlocker && !hasEvidenceBlocker)  primary = 'complete-pending-approval';
    return {
      primary,
      flags,
      disposition: 'blocked',
      reasons,
      daysUntilDue: n,
      slaDaysPastDue,
      readyForCertification: false,
      eligibleForGraceCertification: false,
    };
  }

  // 2. Not yet complete — prioritize block → overdue → at-risk → in-progress
  const urg = store.effectiveUrgency(event);

  if (urg === 'blocked' || hasDepBlocker) {
    return {
      primary: 'blocked',
      flags,
      disposition: 'blocked',
      reasons: reasons.length ? reasons : ['Unresolved blocker prevents completion.'],
      daysUntilDue: n,
      slaDaysPastDue,
      readyForCertification: false,
      eligibleForGraceCertification: false,
    };
  }

  if (urg === 'overdue' || n < 0) {
    return {
      primary: 'overdue',
      flags,
      disposition: 'blocked',
      reasons: reasons.length ? reasons : ['Due date has passed without completion.'],
      daysUntilDue: n,
      slaDaysPastDue,
      readyForCertification: false,
      eligibleForGraceCertification: false,
    };
  }

  // At-Risk: due soon AND has a credible failure signal.
  const hasOpenCriticalSteps = hasStepsBlocker;
  const signalCount =
    (hasDepBlocker ? 1 : 0) +
    (hasApprovalBlocker ? 1 : 0) +
    (hasEvidenceBlocker ? 1 : 0) +
    (hasOpenCriticalSteps ? 1 : 0);

  if (n <= SLA_WARNING_DAYS && signalCount > 0) {
    if (!reasons.length) {
      reasons.push(`Due in ${n} day${n === 1 ? '' : 's'} with ${signalCount} open signal${signalCount === 1 ? '' : 's'}.`);
    }
    return {
      primary: 'at-risk',
      flags,
      disposition: 'blocked',
      reasons,
      daysUntilDue: n,
      slaDaysPastDue: 0,
      readyForCertification: false,
      eligibleForGraceCertification: false,
    };
  }

  // Default — actively moving, on-track.
  return {
    primary: 'in-progress',
    flags,
    disposition: 'blocked',
    reasons,
    daysUntilDue: n,
    slaDaysPastDue: 0,
    readyForCertification: false,
    eligibleForGraceCertification: false,
  };
}

/**
 * Legacy shim — returns only the primary state. New code should
 * prefer `evaluateAudit` and read both `primary` and `flags`.
 */
export function classifyAuditState(
  event: RegulatoryEvent,
  today: Date,
  store: ExecStore,
): AuditState {
  return evaluateAudit(event, today, store).primary;
}

/**
 * True when the instance is eligible for certification **via the grace
 * window**. The caller (certification gate) still runs its own validation
 * — this is a pre-check used by UI + Brad so operators see the distinction
 * before they click certify.
 */
export function canCertifyWithGrace(evaluation: AuditEvaluation): boolean {
  return evaluation.eligibleForGraceCertification;
}

/* ═══════════════════════════════════════════════════════════════
   Counts + derived groupings
   ═══════════════════════════════════════════════════════════════ */

export interface AuditStateCounts {
  'audit-ready': number;
  'complete-missing-evidence': number;
  'complete-pending-approval': number;
  'at-risk': number;
  'in-progress': number;
  'blocked': number;
  'overdue': number;
  'not-certifiable': number;
  'certified-locked': number;
}

export function emptyCounts(): AuditStateCounts {
  return {
    'audit-ready': 0,
    'complete-missing-evidence': 0,
    'complete-pending-approval': 0,
    'at-risk': 0,
    'in-progress': 0,
    'blocked': 0,
    'overdue': 0,
    'not-certifiable': 0,
    'certified-locked': 0,
  };
}

export type AuditFlagCounts = Record<AuditFlag, number>;

export function emptyFlagCounts(): AuditFlagCounts {
  return {
    'overdue': 0,
    'dependency-risk': 0,
    'sla-warning': 0,
    'sla-urgent': 0,
    'grace-window': 0,
    'minutes-missing': 0,
    'approval-missing': 0,
    'evidence-missing': 0,
    'billing-critical': 0,
    'survey-critical': 0,
    'governing-body': 0,
  };
}

/**
 * `At Risk` as a derived calendar signal (keeps the old pre-v2
 * semantics for callers that specifically want "due within 7 days
 * with a blocker"). Prefer `evaluateAudit(...).primary === 'at-risk'`
 * for the new richer signal.
 */
export function isAtRisk(
  event: RegulatoryEvent,
  today: Date,
  store: ExecStore,
): boolean {
  if (store.isEventComplete(event.id) || store.isCertified(event.id)) return false;
  const n = daysUntil(event.date, today);
  if (n < 0 || n > 7) return false;
  const report = store.validateEvent(event);
  return report.blockers.length > 0;
}

export function isReadyToClose(
  event: RegulatoryEvent,
  store: ExecStore,
): boolean {
  if (store.isEventComplete(event.id)) return false;
  const report = store.validateEvent(event);
  return report.canComplete;
}

/* ═══════════════════════════════════════════════════════════════
   Completion Checklist
   ----------------------------------------------------------------
   The Audit View and Certify gate both render the same checklist.
   Each item is a pass/fail statement against the live runtime
   state. An instance is certifiable only when EVERY item passes.
   SLA is now a WARNING row (not a hard fail) — the grace window
   lets valid instances certify up to `SLA_GRACE_DAYS` past due.
   ═══════════════════════════════════════════════════════════════ */

export interface ChecklistItem {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
  /** When present, clicking drills into the offending target. */
  target?: { kind: 'step' | 'form' | 'minutes' | 'approval' | 'evidence'; id?: string };
}

export interface CompletionChecklist {
  items: ChecklistItem[];
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  slaDaysPastDue: number;
}

export function buildCompletionChecklist(
  event: RegulatoryEvent,
  today: Date,
  store: ExecStore,
): CompletionChecklist {
  const report = store.validateEvent(event);
  const evidenceList = (store.evidence[event.id] || []);
  const approvalsForEvent = store.approvals.filter(a => a.eventId === event.id);
  const requiredApprovalRules = (event.approvals ?? []).filter(r => r.required);
  const approvedRequired = requiredApprovalRules.filter(r =>
    approvalsForEvent.some(a =>
      a.targetKind === r.targetKind && a.targetLabel === r.targetLabel && a.status === 'approved',
    ),
  ).length;

  const n = daysUntil(event.date, today);
  const slaDaysPastDue = n < 0 ? Math.abs(n) : 0;

  const items: ChecklistItem[] = [
    {
      id: 'steps',
      label: 'All required steps complete',
      passed: report.progress.stepsTotal > 0 && report.progress.stepsComplete === report.progress.stepsTotal,
      detail: `${report.progress.stepsComplete} of ${report.progress.stepsTotal} steps`,
    },
    {
      id: 'forms',
      label: 'All required forms complete',
      passed: report.progress.formsTotal === 0 || report.progress.formsComplete === report.progress.formsTotal,
      detail: report.progress.formsTotal === 0
        ? 'No forms required'
        : `${report.progress.formsComplete} of ${report.progress.formsTotal} forms`,
    },
    {
      id: 'minutes',
      label: 'Meeting minutes finalized',
      passed: !report.progress.minutesRequired || report.progress.minutesFinalized,
      detail: !report.progress.minutesRequired
        ? 'Not required'
        : report.progress.minutesFinalized ? 'Finalized' : 'Not yet finalized',
    },
    {
      id: 'approvals',
      label: 'All required approvals recorded',
      passed: requiredApprovalRules.length === 0 || approvedRequired === requiredApprovalRules.length,
      detail: requiredApprovalRules.length === 0
        ? 'No approvals required'
        : `${approvedRequired} of ${requiredApprovalRules.length} approvals`,
    },
    {
      id: 'evidence',
      label: 'Evidence artifacts present',
      passed: evidenceList.length > 0 || (event.requiredForms.length === 0 && !event.minutes),
      detail: evidenceList.length === 0
        ? 'No evidence uploaded'
        : `${evidenceList.length} artifact${evidenceList.length === 1 ? '' : 's'}`,
    },
    {
      id: 'sla',
      label: slaDaysPastDue <= SLA_GRACE_DAYS
        ? 'Closure within SLA window (or grace)'
        : 'Closure within SLA window',
      passed: slaDaysPastDue === 0 || slaDaysPastDue <= SLA_GRACE_DAYS,
      detail: slaDaysPastDue === 0
        ? 'On time'
        : slaDaysPastDue <= SLA_GRACE_DAYS
          ? `${slaDaysPastDue}d past due — within ${SLA_GRACE_DAYS}d grace window`
          : `${slaDaysPastDue}d past due`,
    },
    {
      id: 'blockers',
      label: 'No unresolved blockers',
      passed: report.blockers.length === 0,
      detail: report.blockers.length === 0
        ? 'Clear'
        : `${report.blockers.length} open blocker${report.blockers.length === 1 ? '' : 's'}`,
    },
  ];

  const passedCount = items.filter(i => i.passed).length;

  return {
    items,
    allPassed: passedCount === items.length,
    passedCount,
    totalCount: items.length,
    slaDaysPastDue,
  };
}
