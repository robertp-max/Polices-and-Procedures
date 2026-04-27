/**
 * auditRegulatoryEvents.ts
 * ========================
 * Canonical audit calendar — emitted as `RegulatoryEvent[]` for direct
 * consumption by `MANDATED_EVENTS_EXPANDED → REGULATORY_EVENTS →
 * regulatoryExecutionStore → useComplianceExecution()`.
 *
 * SINGLE SOURCE OF TRUTH:
 *   - There is NO `AuditEventTemplate` type and NO parallel CES audit
 *     store. Every audit on the calendar is a `RegulatoryEvent` record
 *     in this file's exported array.
 *   - Internally we use a small generator helper to avoid hand-keying
 *     12 monthly occurrences per audit; the helper returns
 *     `RegulatoryEvent[]` and is not exported. The file's only public
 *     export is `AUDIT_REGULATORY_EVENTS: RegulatoryEvent[]`.
 *
 * SCHEDULING CONSTRAINTS (enforced here at generation time):
 *   - Sat/Sun = non-working days; events shift FORWARD to the next
 *     business day (never backwards) unless `isWeekendAllowed === true`.
 *   - The shift is applied through `enforceBusinessDay()` from
 *     `regulatoryEvents.ts`, so the same rule is reusable from the
 *     execution store / selectors.
 *   - Shifted occurrences are reported via `AUDIT_WEEKEND_SHIFTS` for
 *     observability.
 *
 * COMPLETION INVARIANT (enforced by the execution store, not here):
 *   An audit closes only when forms complete + signatures complete +
 *   `auditIndexCreated === true`. Each event below carries the inputs
 *   the store needs (`requiredForms`, `processFlow`, `complianceFlags`,
 *   `followUps`) — the closure rule itself lives in the store.
 */

import {
  enforceBusinessDay,
  isWeekend,
  type RegulatoryEvent,
  type EventCadence,
  type EventProcessStep,
  type ComplianceFlags,
  type FollowUpSpec,
  type RegulatoryDomain,
  type MandateType,
} from './regulatoryEvents';

/* ────────────────────────────────────────────────────────────────────
 * Standard 5-phase audit processFlow.
 * Surveyor-aligned phases: preparation → documentation → review →
 * signature → audit close. The `audit` phase is non-skippable and
 * encodes the `auditIndexCreated` requirement.
 * ──────────────────────────────────────────────────────────────────── */
function standardProcessFlow(): EventProcessStep[] {
  return [
    {
      id: 'phase-preparation',
      label: 'Preparation',
      description: 'Pull sample frame, distribute audit pack, confirm scope.',
      instructions:
        'Pull the active population frame from EMR; apply sampling rule from §5 of the workflow; distribute audit pack to assigned reviewer.',
      expectedOutput: 'Sample frame snapshot + audit pack distributed.',
      onCompleteText: 'Audit pack issued; reviewer can begin documentation phase.',
      status: 'pending',
      dueOffsetDays: -3,
    },
    {
      id: 'phase-documentation',
      label: 'Documentation',
      description: 'Score sample against checklist; capture evidence.',
      instructions: 'Score each sampled record against the audit checklist; attach evidence files.',
      expectedOutput: 'Per-record scoring sheets with evidence references.',
      onCompleteText: 'Findings ready for review.',
      status: 'pending',
      dueOffsetDays: 0,
    },
    {
      id: 'phase-review',
      label: 'Review',
      description: 'Aggregate findings; compute defect rate; identify CAPA candidates.',
      instructions:
        'Aggregate per-record findings into a defect register; flag CAPA candidates per workflow §11.',
      expectedOutput: 'Defect register + CAPA candidate list.',
      onCompleteText: 'Findings reviewed; CAPAs queued for opening.',
      status: 'pending',
      dueOffsetDays: 2,
    },
    {
      id: 'phase-signature',
      label: 'Signature',
      description: 'Approver signs the audit report.',
      instructions: 'Route audit report to approver(s) listed in workflow §8; collect signatures.',
      expectedOutput: 'Signed audit report.',
      onCompleteText: 'Report signed and filed.',
      status: 'pending',
      dueOffsetDays: 4,
    },
    {
      id: 'phase-audit',
      label: 'Audit Close',
      description: 'File evidence; create audit index; open CAPA; queue for QAPI.',
      instructions:
        'File complete evidence packet to /audit/<YYYY>/<DOMAIN>/<WF-ID>/; create audit index entry (auditIndexCreated=true); open CAPA per QA-WF-CAPA-001 if findings; queue summary for QA-WF-03 quarterly packet.',
      expectedOutput: 'Audit-closed packet + audit index entry + QAPI feed entry.',
      onCompleteText: 'Audit closed; audit index created; QAPI aggregator notified.',
      status: 'pending',
      dueOffsetDays: 5,
    },
  ];
}

/** Standard CAPA follow-up issued by every audit when findings fail. */
const CAPA_FOLLOWUP: FollowUpSpec = {
  id: 'capa',
  label: 'Open CAPA for any audit findings (QA-WF-CAPA-001)',
  dueOffsetDays: 7,
  ownerRole: 'Compliance Officer',
  closureCriteria:
    'CAPA opened with root cause, corrective action, owner, and verification date. Findings re-tested after action complete.',
  escalationDays: 14,
  escalateToRole: 'Administrator',
};

/* ────────────────────────────────────────────────────────────────────
 * Internal generator — produces RegulatoryEvent[] directly.
 * This is NOT a "template engine" — it is a local helper that emits
 * concrete RegulatoryEvent records. Nothing escapes this file except
 * the resulting `RegulatoryEvent[]`.
 * ──────────────────────────────────────────────────────────────────── */
interface AuditSpec {
  eventSubType: string;
  title: string;
  domain: RegulatoryDomain;
  cadence: EventCadence;
  workflowId: string;
  owner: string;
  ownerRole: string;
  policyRefs: string[];
  mandateType: MandateType;
  complianceFlags: ComplianceFlags;
  /** Quarterly months (default [3,6,9,12]); ignored for monthly/annual. */
  quarterMonths?: number[];
  /** Annual month (default 1); ignored for monthly/quarterly. */
  annualMonth?: number;
  /** Day-of-month anchor (default 7). */
  dayOfMonth?: number;
  summary?: string;
  regulatoryDriver?: string;
  isWeekendAllowed?: boolean;
}

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function isoDate(y: number, m: number, d: number) {
  return `${y}-${pad(m)}-${pad(d)}`;
}
function compactDate(y: number, m: number, d: number) {
  return `${y}${pad(m)}${pad(d)}`;
}
function clampDay(y: number, m: number, d: number) {
  const last = new Date(y, m, 0).getDate();
  return Math.min(Math.max(1, d), last);
}

/** Track every weekend-shifted event so callers can audit the changes. */
export interface AuditWeekendShiftRecord {
  id: string;
  title: string;
  workflowId: string;
  originalDate: string;
  shiftedDate: string;
}
const SHIFTS: AuditWeekendShiftRecord[] = [];

function makeEvent(spec: AuditSpec, year: number, month: number, day: number): RegulatoryEvent {
  const date = isoDate(year, month, day);
  const id = `${spec.eventSubType}-${compactDate(year, month, day)}-01`;

  const base: RegulatoryEvent = {
    id,
    title: spec.title,
    domain: spec.domain,
    date,
    time: '09:00',
    timeEnd: '11:00',
    cadence: spec.cadence,
    urgency: 'scheduled',
    policyRefs: spec.policyRefs,
    owner: spec.owner,
    ownerRole: spec.ownerRole,
    summary: spec.summary,
    processFlow: standardProcessFlow(),
    requiredForms: [],
    regulatoryDriver: spec.regulatoryDriver,
    complianceFlags: spec.complianceFlags,
    followUps: [CAPA_FOLLOWUP],
    sourceOfTruth: 'app',
    timezone: 'America/Los_Angeles',
    mandateType: spec.mandateType,
    eventSubType: spec.eventSubType,
    category: `Audit — ${spec.cadence}`,
    isWeekendAllowed: spec.isWeekendAllowed ?? false,
    /* Hard 1:1 binding: the audit event executes spec.workflowId verbatim.
       `processFlow`/`requiredForms` above are placeholders that get replaced
       by `applyWorkflowAlignment()` (see eventWorkflowAlignment.ts) when the
       canonical REGULATORY_EVENTS array is assembled. */
    workflowId: spec.workflowId,
  };

  // Weekend-blocking: shift forward, record the move.
  if (!base.isWeekendAllowed && isWeekend(base.date)) {
    const shifted = enforceBusinessDay(base);
    SHIFTS.push({
      id: shifted.id,
      title: shifted.title,
      workflowId: spec.workflowId,
      originalDate: base.date,
      shiftedDate: shifted.date,
    });
    return shifted;
  }
  return base;
}

function expand(spec: AuditSpec, year: number): RegulatoryEvent[] {
  const dom = spec.dayOfMonth ?? 7;

  switch (spec.cadence) {
    case 'Monthly':
      return Array.from({ length: 12 }, (_, idx) =>
        makeEvent(spec, year, idx + 1, clampDay(year, idx + 1, dom)),
      );
    case 'Quarterly': {
      const months = spec.quarterMonths ?? [3, 6, 9, 12];
      return months.map((m) => makeEvent(spec, year, m, clampDay(year, m, dom)));
    }
    case 'Annual': {
      const m = spec.annualMonth ?? 1;
      return [makeEvent(spec, year, m, clampDay(year, m, dom))];
    }
    default:
      return [];
  }
}

/* ────────────────────────────────────────────────────────────────────
 * The 19 currently-authored audit specs. Each one materialises into a
 * RegulatoryEvent[] block at module load.
 * ──────────────────────────────────────────────────────────────────── */
const AUDIT_SPECS: AuditSpec[] = [
  // ── Clinical (10 — monthly) ───────────────────────────────────
  {
    eventSubType: 'plan_of_care_audit', title: 'Plan of Care Audit',
    domain: 'Clinical', cadence: 'Monthly', workflowId: 'CL-WF-26',
    owner: 'QA Reviewer (RN)', ownerRole: 'QA Reviewer',
    policyRefs: ['CL-PA-005', 'CL-PA-007'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'high', overdueAfterDays: 7, missingEvidenceIf: ['missing', 'pending'], citation: '42 CFR § 484.60; 42 CFR § 484.55', surveyorNote: 'Monthly stratified-sample POC audit — physician signature timeliness, goal alignment, discipline coverage.' },
    summary: 'Monthly POC audit — signature timeliness, goal alignment, discipline coverage.',
  },
  {
    eventSubType: 'oasis_accuracy_audit', title: 'OASIS Accuracy Audit',
    domain: 'Clinical', cadence: 'Monthly', workflowId: 'CL-WF-27',
    owner: 'QA Reviewer (RN)', ownerRole: 'QA Reviewer',
    policyRefs: ['CL-PA-004'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'high', overdueAfterDays: 7, missingEvidenceIf: ['missing'], citation: '42 CFR § 484.55; CMS OASIS-E Guidance Manual', surveyorNote: 'OASIS accuracy drives HHVBP scoring and case-mix payment integrity.' },
    summary: 'Monthly OASIS-E accuracy audit feeding HHVBP/case-mix integrity.',
  },
  {
    eventSubType: 'visit_documentation_audit', title: 'Visit Documentation Audit',
    domain: 'Clinical', cadence: 'Monthly', workflowId: 'CL-WF-28',
    owner: 'QA Reviewer (RN)', ownerRole: 'QA Reviewer',
    policyRefs: ['CL-PA-008'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'high', overdueAfterDays: 7, citation: '42 CFR § 484.110(a)', surveyorNote: 'Visit notes must support skilled need and substantiate billing.' },
    summary: 'Monthly visit-note audit — completeness, timeliness, skilled-need narrative.',
  },
  {
    eventSubType: 'clinical_record_completeness_audit', title: 'Clinical Record Completeness Audit',
    domain: 'Clinical', cadence: 'Monthly', workflowId: 'CL-WF-29',
    owner: 'Medical Records', ownerRole: 'Medical Records',
    policyRefs: ['CL-PA-010'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'high', overdueAfterDays: 7, citation: '42 CFR § 484.110', surveyorNote: 'Clinical record must be complete, organized, and accessible.' },
    summary: 'Monthly chart-completeness audit (orders, signatures, demographics, consents).',
  },
  {
    eventSubType: 'medical_necessity_audit', title: 'Skilled Need / Medical Necessity Review',
    domain: 'Clinical', cadence: 'Monthly', workflowId: 'CL-WF-30',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-PA-002', 'CL-PA-005'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'critical', overdueAfterDays: 7, citation: '42 CFR § 409.42; 42 CFR § 409.44', surveyorNote: 'Missing skilled-need documentation creates direct False Claims Act exposure.' },
    summary: 'Monthly homebound + skilled-need verification on every active episode.',
  },
  {
    eventSubType: 'medication_management_audit', title: 'Medication Management Audit',
    domain: 'Clinical', cadence: 'Monthly', workflowId: 'CL-WF-31',
    owner: 'QA Reviewer (RN)', ownerRole: 'QA Reviewer',
    policyRefs: ['CL-PA-012'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'high', overdueAfterDays: 7, citation: '42 CFR § 484.60(c); CDC adverse drug event guidance', surveyorNote: 'Drug regimen review and reconciliation are CoP requirements.' },
    summary: 'Monthly med-management audit (DRR, reconciliation, high-risk meds).',
  },
  {
    eventSubType: 'infection_control_audit', title: 'Infection Control Compliance Audit',
    domain: 'Clinical', cadence: 'Monthly', workflowId: 'CL-WF-32',
    owner: 'Infection Preventionist', ownerRole: 'Infection Preventionist',
    policyRefs: ['CL-PA-014'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'high', overdueAfterDays: 7, citation: '42 CFR § 484.70', surveyorNote: 'IC program compliance audit feeds the QAPI quarterly review.' },
    summary: 'Monthly IC audit — hand hygiene, PPE, surveillance, exposure log.',
  },
  {
    eventSubType: 'care_coordination_audit', title: 'Care Coordination Audit',
    domain: 'Clinical', cadence: 'Monthly', workflowId: 'CL-WF-33',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-PA-007'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'medium', overdueAfterDays: 7, citation: '42 CFR § 484.60(d)', surveyorNote: 'Care coordination communication evidence required at survey.' },
    summary: 'Monthly inter-disciplinary case-conference + physician communication audit.',
  },
  {
    eventSubType: 'missed_visit_audit', title: 'Missed Visit / Utilization Audit',
    domain: 'Clinical', cadence: 'Monthly', workflowId: 'CL-WF-36',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-PA-005'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'medium', overdueAfterDays: 7, citation: '42 CFR § 484.60(a)', surveyorNote: 'Missed-visit pattern can indicate under-service or fraud risk.' },
    summary: 'Monthly missed-visit + utilization-variance audit.',
  },
  {
    eventSubType: 'orders_alignment_audit', title: 'Orders & Care Plan Alignment Audit',
    domain: 'Clinical', cadence: 'Monthly', workflowId: 'CL-WF-37',
    owner: 'QA Reviewer (RN)', ownerRole: 'QA Reviewer',
    policyRefs: ['CL-PA-005', 'CL-PA-006'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'high', overdueAfterDays: 7, citation: '42 CFR § 484.60(b)', surveyorNote: 'Verbal/written orders must be reflected in POC and signed timely.' },
    summary: 'Monthly verification of orders ↔ POC alignment + signature cycle.',
  },

  // ── Compliance (5) ───────────────────────────────────────────
  {
    eventSubType: 'internal_compliance_audit', title: 'Internal Compliance Audit Cycle',
    domain: 'Compliance', cadence: 'Quarterly', workflowId: 'CO-WF-04',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-PA-001', 'CO-PA-002'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'critical', overdueAfterDays: 0, citation: 'OIG Compliance Program Guidance for Home Health Agencies', surveyorNote: 'Internal audit cycle is the OIG seventh-element exemplar.' },
    dayOfMonth: 14, summary: 'Quarterly internal compliance audit cycle.',
  },
  {
    eventSubType: 'documentation_alignment_audit', title: 'Documentation Alignment Audit',
    domain: 'Compliance', cadence: 'Quarterly', workflowId: 'CO-WF-14',
    owner: 'Compliance Auditor', ownerRole: 'Compliance Auditor',
    policyRefs: ['CO-PA-005'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'high', overdueAfterDays: 7, citation: '42 CFR § 484.110', surveyorNote: 'Cross-domain alignment between clinical, billing, and compliance documentation.' },
    dayOfMonth: 21, summary: 'Quarterly cross-document alignment audit.',
  },
  {
    eventSubType: 'pre_bill_audit', title: 'Pre-Bill Claims Audit',
    domain: 'Compliance', cadence: 'Monthly', workflowId: 'CO-WF-23',
    owner: 'Billing Auditor', ownerRole: 'Billing Auditor',
    policyRefs: ['FN-PA-002'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'critical', overdueAfterDays: 5, citation: '42 CFR § 424.516; FCA exposure', surveyorNote: 'Pre-bill audit is the front-line FCA prevention control.' },
    summary: 'Monthly pre-bill claims audit gating release.',
  },
  {
    eventSubType: 'post_bill_audit', title: 'Post-Bill Claims Audit',
    domain: 'Compliance', cadence: 'Monthly', workflowId: 'CO-WF-24',
    owner: 'Billing Auditor', ownerRole: 'Billing Auditor',
    policyRefs: ['FN-PA-002'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'high', overdueAfterDays: 7, citation: '60-Day Rule (42 USC § 1320a-7k(d))', surveyorNote: 'Post-bill audit identifies overpayments triggering 60-day refund clock.' },
    dayOfMonth: 14, summary: 'Monthly post-bill audit — overpayment detection & 60-day rule trigger.',
  },
  {
    eventSubType: 'authorization_audit', title: 'Authorization / Eligibility Audit',
    domain: 'Compliance', cadence: 'Monthly', workflowId: 'CO-WF-26',
    owner: 'Intake Coordinator', ownerRole: 'Intake Coordinator',
    policyRefs: ['CO-PA-007'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'medium', overdueAfterDays: 7, citation: 'MA + Medicaid eligibility requirements', surveyorNote: 'Authorization gaps are common denial root causes.' },
    summary: 'Monthly auth/eligibility audit on active episodes.',
  },

  // ── HR (2) ───────────────────────────────────────────────────
  {
    eventSubType: 'license_exclusion_audit', title: 'License & Exclusion Monitoring',
    domain: 'Compliance', cadence: 'Monthly', workflowId: 'HR-WF-20',
    owner: 'HR Director', ownerRole: 'HR Director',
    policyRefs: ['HR-PA-007'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'critical', overdueAfterDays: 0, citation: '42 USC § 1320a-7; OIG LEIE; SAM.gov; State boards', surveyorNote: 'Monthly LEIE/SAM/state-board sweep is mandatory; missed month is itself a finding.' },
    summary: 'Monthly OIG/SAM/state-board sweep on all clinicians and contractors.',
  },
  {
    eventSubType: 'staff_file_audit', title: 'Staff File Audit',
    domain: 'Compliance', cadence: 'Quarterly', workflowId: 'HR-WF-21',
    owner: 'HR Director', ownerRole: 'HR Director',
    policyRefs: ['HR-PA-002'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'high', overdueAfterDays: 14, citation: '42 CFR § 484.80; State HR file requirements', surveyorNote: 'HR personnel file completeness audited every survey.' },
    dayOfMonth: 14, summary: 'Quarterly HR personnel file audit.',
  },

  // ── Risk (2) ─────────────────────────────────────────────────
  {
    eventSubType: 'emergency_preparedness_audit', title: 'Emergency Preparedness Readiness Audit',
    domain: 'Risk', cadence: 'Annual', workflowId: 'RM-WF-19',
    owner: 'EP Coordinator', ownerRole: 'EP Coordinator',
    policyRefs: ['RM-PA-019'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'high', overdueAfterDays: 0, citation: '42 CFR § 484.102; CMS EP Final Rule', surveyorNote: 'Annual EP readiness audit confirms hazard plan + 2 exercises + after-action review.' },
    annualMonth: 9, dayOfMonth: 15,
    summary: 'Annual EP readiness audit (hazard plan + exercises + AAR).',
  },
  {
    eventSubType: 'incident_response_audit', title: 'Incident Response Compliance Audit',
    domain: 'Risk', cadence: 'Quarterly', workflowId: 'RM-WF-20',
    owner: 'Risk Manager', ownerRole: 'Risk Manager',
    policyRefs: ['RM-PA-020'], mandateType: 'federal-required',
    complianceFlags: { auditRisk: 'high', overdueAfterDays: 7, citation: '42 CFR § 484.110(a)(6); state incident reporting laws', surveyorNote: 'Reportable-event timeliness audited quarterly.' },
    dayOfMonth: 21, summary: 'Quarterly incident-response compliance audit.',
  },
];

/* ────────────────────────────────────────────────────────────────────
 * Public exports — RegulatoryEvent[] only.
 * ──────────────────────────────────────────────────────────────────── */

/** Canonical 2026 audit calendar — flat `RegulatoryEvent[]`. */
export const AUDIT_REGULATORY_EVENTS: RegulatoryEvent[] = AUDIT_SPECS.flatMap((spec) =>
  expand(spec, 2026),
);

/**
 * Read-only report of every audit event whose original date fell on a
 * weekend and was shifted forward to the next business day.
 */
export const AUDIT_WEEKEND_SHIFTS: readonly AuditWeekendShiftRecord[] = SHIFTS.slice();
