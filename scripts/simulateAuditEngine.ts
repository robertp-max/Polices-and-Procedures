/* ═══════════════════════════════════════════════════════════════════
   Workflow Execution + Audit Engine Simulation
   --------------------------------------------------------------------
   This is a stress-test, NOT a demo. It:

     1. Generates 40 realistic workflow instances starting July 1, 2026,
        distributed across the six required domains.
     2. Assigns each instance to one of 7 execution conditions with the
        exact distribution mandated by the test brief.
     3. Applies deterministic, realistic failure modes.
     4. Runs an audit validator that mirrors `classifyAuditState` and
        `buildCompletionChecklist` from the production codebase.
     5. Attempts certification for every instance.
     6. Emits a structured JSON report covering:
        - Summary metrics
        - Domain breakdown
        - Failure breakdown
        - Sample instances
        - Critical findings
        - System gaps

   Why the logic is replicated instead of imported:
     The production audit functions live in the React/Zustand side of
     the app and depend on the browser store. This script is a pure
     Node simulator — every audit rule is re-implemented here so the
     test runs in isolation and the results reflect the rules we
     intend to ship, not the runtime happening to be loaded.
   ═══════════════════════════════════════════════════════════════════ */

// ─── Domain model (mirrors production shapes, simplified) ──────────

type Domain =
  | 'QAPI'
  | 'Governing Body'
  | 'Compliance Reporting'
  | 'Clinical Review'
  | 'Infection Control'
  | 'Billing';

type StepStatus     = 'pending' | 'in-progress' | 'complete';
type FormStatus     = 'pending' | 'in-progress' | 'complete';
type ApprovalStatus = 'missing' | 'pending' | 'approved' | 'rejected';
type MinutesStatus  = 'none' | 'draft' | 'final';

type Condition =
  | 'fully-compliant'
  | 'missing-evidence'
  | 'pending-approval'
  | 'overdue'
  | 'blocked'
  | 'dependency-failure'
  | 'ready-to-certify'
  | 'at-risk';

type AuditState =
  | 'audit-ready'
  | 'complete-missing-evidence'
  | 'complete-pending-approval'
  | 'at-risk'
  | 'in-progress'
  | 'blocked'
  | 'overdue'
  | 'not-certifiable'
  | 'certified-locked';

type AuditFlag =
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

type CertificationDisposition = 'standard' | 'certified-with-exception' | 'blocked';

const SLA_WARNING_DAYS = 5;
const SLA_URGENT_DAYS  = 2;
const SLA_GRACE_DAYS   = 3;

interface RequiredApproval {
  label: string;
  required: boolean;
  status: ApprovalStatus;
}

interface Step        { id: string; label: string; status: StepStatus; }
interface Form        { id: string; label: string; status: FormStatus; hasUpload: boolean; }

interface WorkflowInstance {
  workflowId: string;
  instanceId: string;
  domain: Domain;
  title: string;
  /** ISO date this workflow is due by. */
  dueDate: string;
  /** SLA window in days after dueDate before the instance is "stale". */
  slaDays: number;
  steps: Step[];
  forms: Form[];
  approvals: RequiredApproval[];
  minutesRequired: boolean;
  minutes: MinutesStatus;
  evidenceCount: number;
  /** Upstream instance IDs that must be complete before this one certifies. */
  dependsOn: string[];
  /** True when the operator has marked the instance "complete" (checkbox click). */
  markedComplete: boolean;
  /** Certification flips to true only after a successful certify attempt. */
  certified: boolean;

  /* ── test-only metadata ── */
  condition: Condition;
}

interface ValidationBlocker {
  kind: 'step' | 'form' | 'minutes' | 'approval' | 'evidence' | 'sla' | 'dependency';
  detail: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

interface AuditReport {
  auditState: AuditState;
  flags: AuditFlag[];
  reasons: string[];
  disposition: CertificationDisposition;
  blockers: ValidationBlocker[];
  checklist: ChecklistItem[];
  slaDaysPastDue: number;
  daysUntilDue: number;
  readyForCertification: boolean;
  eligibleForGraceCertification: boolean;
}

interface CertificationResult {
  workflowId: string;
  instanceId: string;
  certified: boolean;
  reason: string;
  disposition: CertificationDisposition;
  blockers: ValidationBlocker[];
}

interface DomainRow {
  domain: string;
  total: number;
  compliant: number;
  certified: number;
  certifiedWithException: number;
  auditReady: number;
  atRisk: number;
  missingEvidence: number;
  pendingApproval: number;
  overdue: number;
  blocked: number;
  notCertifiable: number;
}

interface SampleInstance {
  workflowId: string;
  instanceId: string;
  domain: string;
  title: string;
  condition: string;
  auditState: string;
  flags: unknown[];
  disposition: string;
  dueDate: string;
  daysUntilDue: number;
  slaDaysPastDue: number;
  missing: string[];
  reasons: string[];
  certification: { certified: boolean; reason: string; disposition: string };
}

// ─── Deterministic RNG for reproducibility ─────────────────────────

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const rng = makeRng(20260701);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00Z').getTime();
  const db = new Date(b + 'T00:00:00Z').getTime();
  return Math.round((da - db) / 86_400_000);
}

// ─── Phase 1: generate instances ───────────────────────────────────

const TODAY = '2026-07-22'; // mid-July, post-readiness date

const WORKFLOW_TEMPLATES: Array<{
  domain: Domain;
  titles: string[];
  requiresMinutes: boolean;
  /** Template-level approval requirements (labels only). */
  approvals: string[];
  formCount: [number, number];
  stepCount: [number, number];
  slaDays: number;
}> = [
  {
    domain: 'QAPI',
    titles: ['Quarterly QAPI Review', 'QAPI Project Close-Out', 'QAPI Indicator Report'],
    requiresMinutes: true,
    approvals: ['QAPI Chair', 'Administrator'],
    formCount: [2, 4],
    stepCount: [4, 6],
    slaDays: 30,
  },
  {
    domain: 'Governing Body',
    titles: ['Governing Body Quarterly Meeting', 'Annual GB Program Evaluation', 'GB Policy Ratification'],
    requiresMinutes: true,
    approvals: ['Board Chair', 'Administrator'],
    formCount: [2, 3],
    stepCount: [5, 7],
    slaDays: 30,
  },
  {
    domain: 'Compliance Reporting',
    titles: ['OASIS Submission Audit', 'CAHPS HHCAHPS Vendor Report', 'Medicare Cost Report Filing'],
    requiresMinutes: false,
    approvals: ['Compliance Officer'],
    formCount: [3, 5],
    stepCount: [4, 6],
    slaDays: 14,
  },
  {
    domain: 'Clinical Review',
    titles: ['Monthly Clinical Record Review', 'Plan-of-Care Audit Batch', 'Clinician Competency Attestation'],
    requiresMinutes: false,
    approvals: ['Clinical Director'],
    formCount: [2, 4],
    stepCount: [3, 5],
    slaDays: 21,
  },
  {
    domain: 'Infection Control',
    titles: ['IC Surveillance Summary', 'Hand-Hygiene Audit', 'Infection Outbreak Log Review'],
    requiresMinutes: false,
    approvals: ['Infection Preventionist', 'Clinical Director'],
    formCount: [2, 3],
    stepCount: [3, 5],
    slaDays: 30,
  },
  {
    domain: 'Billing',
    titles: ['Pre-Billing Claims Audit', 'Coding Compliance Review', 'Denied-Claims Root Cause Analysis'],
    requiresMinutes: false,
    approvals: ['Billing Manager', 'Compliance Officer'],
    formCount: [3, 5],
    stepCount: [4, 6],
    slaDays: 14,
  },
];

function buildInstance(idx: number, condition: Condition): WorkflowInstance {
  const tpl = pick(WORKFLOW_TEMPLATES);
  const title = pick(tpl.titles);
  const workflowId = `WF-${tpl.domain.slice(0, 2).toUpperCase().replace(/\s/g, '')}-${String(idx).padStart(3, '0')}`;
  const instanceId = `INST-${workflowId}-${202607}`;

  // Dates are anchored around July–August 2026; overdue ones get pushed
  // back so they're clearly past due relative to TODAY.
  let dueDate = addDays('2026-07-01', Math.floor(rng() * 45));
  if (condition === 'overdue' || condition === 'blocked' || condition === 'dependency-failure') {
    dueDate = addDays(TODAY, -Math.ceil(rng() * 14) - 1);
  }
  if (condition === 'at-risk') {
    // Due within SLA_WARNING_DAYS so the predictive timing classifier
    // surfaces this instance as At Risk.
    dueDate = addDays(TODAY, 1 + Math.floor(rng() * 5));
  }

  const stepCount = tpl.stepCount[0] + Math.floor(rng() * (tpl.stepCount[1] - tpl.stepCount[0] + 1));
  const formCount = tpl.formCount[0] + Math.floor(rng() * (tpl.formCount[1] - tpl.formCount[0] + 1));

  const steps: Step[] = Array.from({ length: stepCount }, (_, i) => ({
    id: `s-${i + 1}`,
    label: `Step ${i + 1}`,
    status: 'complete',
  }));
  const forms: Form[] = Array.from({ length: formCount }, (_, i) => ({
    id: `f-${i + 1}`,
    label: `Form ${i + 1}`,
    status: 'complete',
    hasUpload: true,
  }));
  const approvals: RequiredApproval[] = tpl.approvals.map(label => ({
    label,
    required: true,
    status: 'approved',
  }));

  const inst: WorkflowInstance = {
    workflowId,
    instanceId,
    domain: tpl.domain,
    title,
    dueDate,
    slaDays: tpl.slaDays,
    steps,
    forms,
    approvals,
    minutesRequired: tpl.requiresMinutes,
    minutes: tpl.requiresMinutes ? 'final' : 'none',
    evidenceCount: formCount + (tpl.requiresMinutes ? 1 : 0),
    dependsOn: [],
    markedComplete: true,
    certified: false,
    condition,
  };

  return applyCondition(inst, condition);
}

// ─── Phase 2 & 3: apply conditions + realistic failures ────────────

function applyCondition(inst: WorkflowInstance, condition: Condition): WorkflowInstance {
  switch (condition) {
    case 'fully-compliant':
      // Complete + valid. Not yet certified — ready-to-certify counts
      // capture the "ready to be signed" bucket; fully-compliant still
      // passes validation but is left for certification in phase 5.
      inst.certified = true;
      return inst;

    case 'ready-to-certify':
      // Same as fully-compliant, but we intentionally leave certified
      // false so phase-5 drives success count from this bucket.
      return inst;

    case 'missing-evidence': {
      const mode = Math.floor(rng() * 3);
      if (mode === 0 && inst.forms.length > 0) {
        // missing form
        const victim = inst.forms[Math.floor(rng() * inst.forms.length)];
        victim.status = 'pending';
        victim.hasUpload = false;
        inst.evidenceCount = Math.max(0, inst.evidenceCount - 1);
      } else if (mode === 1 && inst.minutesRequired) {
        // missing minutes
        inst.minutes = 'draft';
      } else {
        // missing evidence artifacts (no uploads at all)
        inst.evidenceCount = 0;
        inst.forms.forEach(f => { f.hasUpload = false; });
      }
      return inst;
    }

    case 'pending-approval': {
      const mode = Math.floor(rng() * 2);
      if (mode === 0) {
        // approval never submitted
        inst.approvals[0].status = 'missing';
      } else {
        // approval submitted but delayed
        inst.approvals[0].status = 'pending';
      }
      return inst;
    }

    case 'overdue': {
      // incomplete past SLA
      inst.markedComplete = false;
      const killStep = inst.steps[inst.steps.length - 1];
      if (killStep) killStep.status = 'in-progress';
      return inst;
    }

    case 'blocked': {
      // hard blocker — simulate via incomplete plus a step that can't
      // progress (represented as an unmet dependency on a synthetic
      // upstream instance that will not be resolved).
      inst.markedComplete = false;
      inst.dependsOn = ['INST-MISSING-UPSTREAM'];
      inst.steps.forEach(s => { s.status = 'pending'; });
      return inst;
    }

    case 'dependency-failure': {
      // Instance-side is complete & valid, but the upstream dep is
      // incomplete → certification MUST be blocked even though the
      // instance's own checklist passes.
      inst.dependsOn = ['INST-WF-QA-UPSTREAM'];
      return inst;
    }

    case 'at-risk': {
      // In-progress near SLA boundary with at least one open signal:
      // forces the classifier into the at-risk primary state.
      inst.markedComplete = false;
      const openStep = inst.steps[inst.steps.length - 1];
      if (openStep) openStep.status = 'in-progress';
      // Randomly add one more open signal to reflect layered risk.
      const mode = Math.floor(rng() * 3);
      if (mode === 0 && inst.approvals.length > 0) {
        inst.approvals[0].status = 'pending';
      } else if (mode === 1 && inst.forms.length > 0) {
        inst.forms[0].status = 'in-progress';
      } else if (inst.minutesRequired) {
        inst.minutes = 'draft';
      }
      return inst;
    }
  }
  return inst;
}

// ─── Phase 4: audit validation ─────────────────────────────────────

/**
 * Mirrors `classifyAuditState` + `buildCompletionChecklist`.
 * Certification short-circuits — certified instances ARE locked.
 */
function runAudit(inst: WorkflowInstance, allInstances: WorkflowInstance[], today: string): AuditReport {
  const blockers: ValidationBlocker[] = [];
  const checklist: ChecklistItem[] = [];

  // 1. Steps
  const stepsComplete = inst.steps.every(s => s.status === 'complete');
  checklist.push({
    id: 'steps',
    label: 'All required steps complete',
    passed: stepsComplete,
    detail: `${inst.steps.filter(s => s.status === 'complete').length} of ${inst.steps.length} steps`,
  });
  if (!stepsComplete) blockers.push({ kind: 'step', detail: 'Open steps remain' });

  // 2. Forms
  const formsComplete = inst.forms.every(f => f.status === 'complete');
  checklist.push({
    id: 'forms',
    label: 'All required forms complete',
    passed: formsComplete,
    detail: `${inst.forms.filter(f => f.status === 'complete').length} of ${inst.forms.length} forms`,
  });
  if (!formsComplete) blockers.push({ kind: 'form', detail: 'Incomplete form' });

  // 3. Minutes
  const minutesOk = !inst.minutesRequired || inst.minutes === 'final';
  checklist.push({
    id: 'minutes',
    label: 'Meeting minutes finalized',
    passed: minutesOk,
    detail: inst.minutesRequired ? `Minutes: ${inst.minutes}` : 'Not required',
  });
  if (!minutesOk) blockers.push({ kind: 'minutes', detail: 'Minutes not finalized' });

  // 4. Approvals
  const requiredAppr = inst.approvals.filter(a => a.required);
  const approvedAppr = requiredAppr.filter(a => a.status === 'approved');
  const apprOk = approvedAppr.length === requiredAppr.length;
  checklist.push({
    id: 'approvals',
    label: 'All required approvals recorded',
    passed: apprOk,
    detail: `${approvedAppr.length} of ${requiredAppr.length} approvals`,
  });
  if (!apprOk) blockers.push({ kind: 'approval', detail: 'Approval not recorded' });

  // 5. Evidence
  const hasEvidence = inst.evidenceCount > 0 || (inst.forms.length === 0 && !inst.minutesRequired);
  checklist.push({
    id: 'evidence',
    label: 'Evidence artifacts present',
    passed: hasEvidence,
    detail: `${inst.evidenceCount} artifact(s)`,
  });
  if (!hasEvidence) blockers.push({ kind: 'evidence', detail: 'No evidence uploaded' });

  // 6. SLA
  const daysPast = daysBetween(today, inst.dueDate);
  const daysUntilDue = -daysPast; // positive = days remaining; negative = past due
  const slaDaysPastDue = daysPast > 0 ? daysPast : 0;
  const slaOk = slaDaysPastDue === 0 || slaDaysPastDue <= SLA_GRACE_DAYS;
  checklist.push({
    id: 'sla',
    label: slaDaysPastDue <= SLA_GRACE_DAYS ? 'Closure within SLA (or grace)' : 'Closure within SLA window',
    passed: slaOk,
    detail: slaDaysPastDue === 0
      ? 'On time'
      : slaDaysPastDue <= SLA_GRACE_DAYS
        ? `${slaDaysPastDue}d past — within grace`
        : `${slaDaysPastDue}d past due`,
  });
  // SLA is no longer a hard blocker inside the grace window; only count
  // as a blocker past the grace window.
  if (slaDaysPastDue > SLA_GRACE_DAYS) {
    blockers.push({ kind: 'sla', detail: `${slaDaysPastDue} days past due (beyond grace)` });
  }

  // 7. Dependencies
  const upstreamOk = inst.dependsOn.every(id => {
    const u = allInstances.find(x => x.instanceId === id);
    return u ? u.markedComplete && u.certified : false;
  });
  const depsOk = inst.dependsOn.length === 0 || upstreamOk;
  checklist.push({
    id: 'dependency',
    label: 'Upstream dependencies satisfied',
    passed: depsOk,
    detail: inst.dependsOn.length === 0 ? 'No dependencies' : upstreamOk ? 'All upstream complete' : 'Upstream incomplete',
  });
  if (!depsOk) blockers.push({ kind: 'dependency', detail: `Upstream incomplete: ${inst.dependsOn.join(', ')}` });

  // ── Secondary flags (stackable) ─────────────────────────────────
  const flags: AuditFlag[] = [];
  const reasons: string[] = [];

  const hasApprovalBlocker = blockers.some(b => b.kind === 'approval');
  const hasFormsBlocker    = !formsComplete;
  const hasMinutesBlocker  = !minutesOk;
  const hasEvidenceBlocker = hasFormsBlocker || hasMinutesBlocker || !hasEvidence;
  const hasDepBlocker      = !depsOk;
  const hasStepsBlocker    = !stepsComplete;

  if (hasDepBlocker)      { flags.push('dependency-risk');  reasons.push(`Upstream dependency incomplete (${inst.dependsOn.join(', ')}).`); }
  if (hasApprovalBlocker) { flags.push('approval-missing'); reasons.push('Required approval has not been recorded.'); }
  if (hasFormsBlocker)    { flags.push('evidence-missing'); reasons.push('One or more required forms are incomplete.'); }
  if (hasMinutesBlocker)  { flags.push('minutes-missing');  reasons.push('Meeting minutes are not finalized.'); }

  if (daysUntilDue < 0)                       flags.push('overdue');
  else if (daysUntilDue <= SLA_URGENT_DAYS)   flags.push('sla-urgent');
  else if (daysUntilDue <= SLA_WARNING_DAYS)  flags.push('sla-warning');

  if (inst.domain === 'Billing')        flags.push('billing-critical');
  if (inst.domain === 'Governing Body') flags.push('governing-body');

  // ── State classification (mirrors production evaluateAudit) ─────
  let auditState: AuditState;
  let disposition: CertificationDisposition = 'blocked';
  let eligibleForGraceCertification = false;

  const allChecksPassed =
    stepsComplete && formsComplete && minutesOk && apprOk && hasEvidence && depsOk;

  if (inst.certified) {
    auditState = 'certified-locked';
    disposition = 'standard';
  } else if (inst.markedComplete && allChecksPassed) {
    if (daysUntilDue >= 0) {
      auditState = 'audit-ready';
      disposition = 'standard';
    } else if (slaDaysPastDue <= SLA_GRACE_DAYS) {
      auditState = 'audit-ready';
      disposition = 'certified-with-exception';
      flags.push('grace-window');
      eligibleForGraceCertification = true;
      reasons.push(`Past SLA by ${slaDaysPastDue}d — eligible for certified-with-exception.`);
    } else {
      auditState = 'not-certifiable';
      reasons.push(`Past SLA by ${slaDaysPastDue}d — beyond grace window.`);
    }
  } else if (inst.markedComplete) {
    // Marked complete but blockers remain.
    if (hasDepBlocker) {
      auditState = 'not-certifiable';
    } else if (hasEvidenceBlocker && !hasApprovalBlocker) {
      auditState = 'complete-missing-evidence';
    } else if (hasApprovalBlocker && !hasEvidenceBlocker) {
      auditState = 'complete-pending-approval';
    } else {
      auditState = 'not-certifiable';
    }
  } else {
    // Not complete
    if (hasDepBlocker) {
      auditState = 'blocked';
    } else if (daysUntilDue < 0) {
      auditState = 'overdue';
    } else {
      // At-Risk: due in <= SLA_WARNING_DAYS AND at least one signal
      const signalCount =
        (hasApprovalBlocker ? 1 : 0) +
        (hasEvidenceBlocker ? 1 : 0) +
        (hasStepsBlocker ? 1 : 0);
      if (daysUntilDue <= SLA_WARNING_DAYS && signalCount > 0) {
        auditState = 'at-risk';
        reasons.push(`Due in ${daysUntilDue}d with ${signalCount} open signal(s).`);
      } else {
        auditState = 'in-progress';
      }
    }
  }

  const readyForCertification =
    allChecksPassed && inst.markedComplete && !inst.certified &&
    (daysUntilDue >= 0 || slaDaysPastDue <= SLA_GRACE_DAYS);

  return {
    auditState,
    flags,
    reasons,
    disposition,
    blockers,
    checklist,
    slaDaysPastDue,
    daysUntilDue,
    readyForCertification,
    eligibleForGraceCertification,
  };
}

// ─── Phase 5: certification attempts ───────────────────────────────

function attemptCertify(
  inst: WorkflowInstance,
  report: AuditReport,
): CertificationResult {
  if (inst.certified) {
    return {
      workflowId: inst.workflowId,
      instanceId: inst.instanceId,
      certified: true,
      reason: 'already-certified',
      disposition: 'standard',
      blockers: [],
    };
  }
  if (!inst.markedComplete) {
    return {
      workflowId: inst.workflowId,
      instanceId: inst.instanceId,
      certified: false,
      reason: 'not-marked-complete',
      disposition: 'blocked',
      blockers: report.blockers,
    };
  }
  if (report.blockers.length > 0) {
    return {
      workflowId: inst.workflowId,
      instanceId: inst.instanceId,
      certified: false,
      reason: report.blockers[0].kind,
      disposition: 'blocked',
      blockers: report.blockers,
    };
  }
  inst.certified = true;
  const disposition: CertificationDisposition =
    report.disposition === 'certified-with-exception'
      ? 'certified-with-exception'
      : 'standard';
  return {
    workflowId: inst.workflowId,
    instanceId: inst.instanceId,
    certified: true,
    reason: disposition === 'certified-with-exception' ? 'passed-with-exception' : 'passed',
    disposition,
    blockers: [],
  };
}

// ─── Phase 6: structured output ────────────────────────────────────

function percentDist(total: number): Record<Condition, number> {
  return {
    'fully-compliant':     Math.round(total * 0.18),
    'missing-evidence':    Math.round(total * 0.18),
    'pending-approval':    Math.round(total * 0.13),
    'overdue':             Math.round(total * 0.13),
    'blocked':             Math.round(total * 0.10),
    'dependency-failure':  Math.round(total * 0.10),
    'ready-to-certify':    Math.round(total * 0.08),
    'at-risk':             Math.round(total * 0.10),
  };
}

function main() {
  const TOTAL = 40;
  const dist = percentDist(TOTAL);
  const conditions: Condition[] = [];
  (Object.keys(dist) as Condition[]).forEach(c => {
    for (let i = 0; i < dist[c]; i++) conditions.push(c);
  });
  while (conditions.length < TOTAL) conditions.push('fully-compliant');

  const instances: WorkflowInstance[] = conditions.map((c, i) => buildInstance(i + 1, c));

  // Run audit + certification
  const reports = new Map<string, AuditReport>();
  for (const inst of instances) reports.set(inst.instanceId, runAudit(inst, instances, TODAY));
  const certResults: CertificationResult[] = instances.map(inst =>
    attemptCertify(inst, reports.get(inst.instanceId)!),
  );
  // Rerun audit for instances that just certified so state reflects it
  for (const inst of instances) reports.set(inst.instanceId, runAudit(inst, instances, TODAY));

  // ── Summary metrics ────────────────────────────────────────────
  const bucket: Record<AuditState, number> = {
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
  const flagCounts: Record<AuditFlag, number> = {
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
  for (const inst of instances) {
    const r = reports.get(inst.instanceId)!;
    bucket[r.auditState]++;
    for (const f of r.flags) flagCounts[f]++;
  }

  const certSuccess = certResults.filter(r => r.certified && r.reason === 'passed').length;
  const certWithException = certResults.filter(r => r.certified && r.reason === 'passed-with-exception').length;
  const certFailure = certResults.filter(r => !r.certified).length;
  const alreadyCert = certResults.filter(r => r.certified && r.reason === 'already-certified').length;
  const readyToCert = instances.filter(i =>
    !i.certified && reports.get(i.instanceId)!.readyForCertification,
  ).length;
  const atRisk = bucket['at-risk'];
  const graceWindow = flagCounts['grace-window'];

  // Top failure drivers (sorted flags)
  const topFailureDrivers = (Object.entries(flagCounts) as Array<[AuditFlag, number]>)
    .filter(([_, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([flag, count]) => ({ flag, count }));

  // Agency readiness
  const readinessReasons: string[] = [];
  if (bucket['blocked'] > 0)                     readinessReasons.push(`${bucket['blocked']} instance(s) blocked`);
  if (bucket['overdue'] > 0)                     readinessReasons.push(`${bucket['overdue']} instance(s) overdue`);
  if (bucket['not-certifiable'] > 0)             readinessReasons.push(`${bucket['not-certifiable']} instance(s) not certifiable`);
  if (bucket['complete-missing-evidence'] > 0)   readinessReasons.push(`${bucket['complete-missing-evidence']} missing evidence`);
  if (bucket['complete-pending-approval'] > 0)   readinessReasons.push(`${bucket['complete-pending-approval']} pending approval`);
  if (atRisk > 0)                                readinessReasons.push(`${atRisk} at-risk within 5 days`);
  const agencyReady = readinessReasons.length === 0;
  const readinessScore = Math.round(
    ((bucket['certified-locked'] + bucket['audit-ready']) / Math.max(1, TOTAL)) * 100,
  );

  // ── Failure breakdown ──────────────────────────────────────────
  const failureCounts: Record<string, number> = {};
  for (const r of certResults) {
    if (r.certified) continue;
    for (const b of r.blockers) {
      const key = `${b.kind}`;
      failureCounts[key] = (failureCounts[key] || 0) + 1;
    }
  }

  // ── Domain breakdown ───────────────────────────────────────────
  const domainRows: Record<string, DomainRow> = {};
  for (const inst of instances) {
    const r = reports.get(inst.instanceId)!;
    const row = domainRows[inst.domain] ?? {
      domain: inst.domain,
      total: 0,
      compliant: 0,
      certified: 0,
      certifiedWithException: 0,
      auditReady: 0,
      atRisk: 0,
      missingEvidence: 0,
      pendingApproval: 0,
      overdue: 0,
      blocked: 0,
      notCertifiable: 0,
    };
    row.total++;
    if (r.auditState === 'certified-locked')         { row.certified++; row.compliant++; }
    if (r.auditState === 'audit-ready')              { row.auditReady++; }
    if (r.auditState === 'at-risk')                  { row.atRisk++; }
    if (r.auditState === 'complete-missing-evidence'){ row.missingEvidence++; }
    if (r.auditState === 'complete-pending-approval'){ row.pendingApproval++; }
    if (r.auditState === 'overdue')                  { row.overdue++; }
    if (r.auditState === 'blocked')                  { row.blocked++; }
    if (r.auditState === 'not-certifiable')          { row.notCertifiable++; }
    const cert = certResults.find(c => c.instanceId === inst.instanceId);
    if (cert?.disposition === 'certified-with-exception') row.certifiedWithException++;
    domainRows[inst.domain] = row;
  }

  // ── Sample instances ───────────────────────────────────────────
  const sampleConditions: Condition[] = [
    'fully-compliant', 'missing-evidence', 'pending-approval',
    'overdue', 'blocked', 'dependency-failure', 'ready-to-certify',
    'at-risk', 'missing-evidence', 'pending-approval', 'overdue', 'at-risk',
  ];
  const usedInstanceIds = new Set<string>();
  const samples: SampleInstance[] = [];
  for (const cond of sampleConditions) {
    const pickInst =
      instances.find(i => i.condition === cond && !usedInstanceIds.has(i.instanceId))
      ?? instances.find(i => i.condition === cond);
    if (!pickInst) continue;
    usedInstanceIds.add(pickInst.instanceId);
    const r = reports.get(pickInst.instanceId)!;
    const c = certResults.find(cr => cr.instanceId === pickInst.instanceId)!;
    samples.push({
      workflowId: pickInst.workflowId,
      instanceId: pickInst.instanceId,
      domain: pickInst.domain,
      title: pickInst.title,
      condition: pickInst.condition,
      auditState: r.auditState,
      flags: r.flags,
      disposition: r.disposition,
      dueDate: pickInst.dueDate,
      daysUntilDue: r.daysUntilDue,
      slaDaysPastDue: r.slaDaysPastDue,
      missing: r.blockers.map(b => `${b.kind}: ${b.detail}`),
      reasons: r.reasons,
      certification: {
        certified: c.certified,
        reason: c.reason,
        disposition: c.disposition,
      },
    });
  }

  // ── Critical findings ──────────────────────────────────────────
  const mostCommonFailure = Object.entries(failureCounts).sort((a, b) => b[1] - a[1])[0];
  const domainRisk = Object.values(domainRows).map((r: DomainRow) => ({
    domain: r.domain,
    notCertifiableRate: (r.notCertifiable + r.missingEvidence + r.pendingApproval + r.blocked + r.overdue) / r.total,
  })).sort((a, b) => b.notCertifiableRate - a.notCertifiableRate);

  const bottleneck = failureCounts.approval >= failureCounts.form && failureCounts.approval >= failureCounts.evidence
    ? 'approvals'
    : failureCounts.evidence >= failureCounts.form
      ? 'evidence'
      : 'forms';

  // ── System gaps (observations from running the engine) ─────────
  const systemGaps: string[] = [];
  // Gap 1: cert gate must block on dependency even when instance is clean
  const depOnlyBlocks = instances.filter(i => {
    const r = reports.get(i.instanceId)!;
    return i.condition === 'dependency-failure' && r.auditState === 'not-certifiable';
  }).length;
  if (depOnlyBlocks === 0) {
    systemGaps.push('DEPENDENCY GATE: no instance was classified not-certifiable purely due to upstream — dependency enforcement may be weaker than required.');
  } else {
    systemGaps.push(`DEPENDENCY GATE OK: ${depOnlyBlocks} instance(s) blocked solely by upstream dependency.`);
  }

  // Gap 2: are overdue-but-complete instances silently certifiable?
  const overdueComplete = instances.filter(i => i.markedComplete && daysBetween(TODAY, i.dueDate) > 0);
  const overdueSilentlyCertified = overdueComplete.filter(i => {
    const cr = certResults.find(c => c.instanceId === i.instanceId)!;
    return cr.certified && cr.reason === 'passed';
  }).length;
  if (overdueSilentlyCertified > 0) {
    systemGaps.push(`SLA GAP: ${overdueSilentlyCertified} instance(s) certified despite being past SLA. The cert gate does not currently include SLA as a hard blocker — this is a UX + audit integrity issue.`);
  } else {
    systemGaps.push('SLA GAP OK: no past-SLA instance certified.');
  }

  // Gap 3: missing-evidence + pending-approval states never certify
  const softCompleteCertifiedWithBlockers = certResults.filter(c => c.certified && c.blockers.length > 0).length;
  if (softCompleteCertifiedWithBlockers > 0) {
    systemGaps.push(`CERT GATE GAP: ${softCompleteCertifiedWithBlockers} instance(s) certified despite open blockers.`);
  } else {
    systemGaps.push('CERT GATE OK: no instance certified with outstanding blockers.');
  }

  // Gap 4: UI misleading — audit state 'complete-pending-approval' still shows as "completable"?
  // (The runtime rule would need validateEvent to set canComplete=false; we simulate that here.)
  const complianceDomain = domainRows['Compliance Reporting'];
  if (complianceDomain && complianceDomain.overdue > 0 && complianceDomain.auditReady === 0) {
    systemGaps.push('UI GAP: Compliance Reporting has overdue instances but zero audit-ready — the Command Center "ready to close" bucket may be empty while backlog grows. Consider a dedicated overdue counter in the hero metrics row.');
  }

  // Gap 5: blocked instances that miss the "blocked" state due to late SLA
  const blockedMisclassified = instances.filter(i => {
    const r = reports.get(i.instanceId)!;
    return i.condition === 'blocked' && r.auditState !== 'blocked';
  }).length;
  if (blockedMisclassified > 0) {
    systemGaps.push(`BLOCKED→OVERDUE OVERLAP: ${blockedMisclassified} "blocked" instance(s) reclassified as overdue because SLA ran out first. The classifier privileges "blocked" only when the instance is still in its SLA window; consider tracking BOTH signals on the card.`);
  }

  // ── Emit the report ───────────────────────────────────────────
  const report = {
    generatedAt: TODAY,
    anchor: 'July 2026 readiness simulation',
    seed: 20260701,
    summary: {
      totalInstances: TOTAL,
      auditReady:          bucket['audit-ready'],
      readyToCertify:      readyToCert,
      certifiedLocked:     bucket['certified-locked'],
      certifiedWithException: certWithException,
      atRisk:              atRisk,
      graceWindow:         graceWindow,
      notCertifiable:      bucket['not-certifiable'],
      missingEvidence:     bucket['complete-missing-evidence'],
      pendingApproval:     bucket['complete-pending-approval'],
      overdue:             bucket['overdue'],
      blocked:             bucket['blocked'],
      inProgress:          bucket['in-progress'],
      certAttempts: {
        success:          certSuccess + certWithException + alreadyCert,
        failure:          certFailure,
        successThisRun:   certSuccess,
        successWithException: certWithException,
        alreadyCertified: alreadyCert,
      },
    },
    agencyReadiness: {
      ready: agencyReady,
      score: readinessScore,
      reasons: readinessReasons,
      signals: {
        atRisk,
        graceWindow,
        certifiedWithException: certWithException,
        blocked: bucket['blocked'],
        overdue: bucket['overdue'],
        notCertifiable: bucket['not-certifiable'],
        missingEvidence: bucket['complete-missing-evidence'],
        pendingApproval: bucket['complete-pending-approval'],
      },
    },
    flagCounts,
    topFailureDrivers,
    domainBreakdown: Object.values(domainRows),
    failureBreakdown: Object.entries(failureCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([kind, count]) => ({ kind, count })),
    sampleInstances: samples,
    criticalFindings: {
      mostCommonFailure: mostCommonFailure ? { kind: mostCommonFailure[0], count: mostCommonFailure[1] } : null,
      highestRiskDomain: domainRisk[0],
      domainRiskRanking: domainRisk,
      bottleneck,
    },
    systemGaps,
  };

  console.log(JSON.stringify(report, null, 2));
}

main();
