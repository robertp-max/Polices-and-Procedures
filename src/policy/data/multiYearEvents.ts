/**
 * multiYearEvents.ts
 * ==================
 * Multi-year cadence regulatory / governance events:
 *
 *   • BIENNIAL  (every 2 years) — start Jul 2026, next 2028
 *   • TRIENNIAL (every 3 years) — start Jul 2026, next 2029
 *   • OIG ANNUAL Work Plan Review (replaces fixed-cadence "OIG-required" events)
 *
 * Each event is policy-backed, workflow-mapped, and form-evidenced.
 * No speculative cadences — every event traces to an existing policy
 * and an existing workflow in workflows.generated.ts.
 *
 * Sources used (verified):
 *   Policies      — RM-ER-001, EN-LC-001, CO-CP-001, GV-GB-001,
 *                   QA-PG-001, HR-TA-003, EN-CM-001
 *   Workflows     — RM-WF-15 (Annual Enterprise Risk Reassessment),
 *                   EN-WF-02 (Annual Policy Review – Full Framework),
 *                   CL-WF-25 (Clinician Competency Validation),
 *                   HR-WF-05 (HHA Training & Competency),
 *                   QA-WF-11 (Policy Effectiveness Monitoring),
 *                   CO-WF-15 (OIG/SAM Exclusion Screening),
 *                   CO-WF-16 (OIG Self-Disclosure Protocol),
 *                   CO-WF-08 (FWA Training & Monitoring)
 *   Forms         — RM-FM-008 (Enterprise Risk Register),
 *                   EN-FM-007/008/010, EN-FM-022, EN-FM-033,
 *                   HR-FM-005, HR-FM-008, HR-FM-015, CO-FM-010..012
 */

import type { RegulatoryEvent } from './regulatoryEvents';
import { applyEventAlignmentPolicy } from './eventAlignmentPolicy';

/* ════════════════════════════════════════════════════════════════
   Internal helper — produce paired 2026 + 2028 occurrences for a
   biennial event, or 2026 + 2029 for a triennial event.
   ════════════════════════════════════════════════════════════════ */

type Cadence = 'biennial' | 'triennial';
function nextOccurrenceDate(start: string, cadence: Cadence): string {
  const [y, m, d] = start.split('-').map(Number);
  const yearStep = cadence === 'biennial' ? 2 : 3;
  return `${y + yearStep}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/* ════════════════════════════════════════════════════════════════
   1. ENTERPRISE RISK ASSESSMENT (BIENNIAL)
   Workflow: RM-WF-15 ANNUAL ENTERPRISE RISK REASSESSMENT
            (deep biennial reassessment overlays the annual cycle)
   ════════════════════════════════════════════════════════════════ */

export const ENTERPRISE_RISK_BIENNIAL_2026: RegulatoryEvent = {
  id: 'enterprise_risk_assessment-20260708-01',
  eventSubType: 'enterprise_risk_assessment',
  title: 'Enterprise Risk Assessment (Biennial Deep Reassessment)',
  domain: 'Risk',
  date: '2026-07-08',
  time: '09:00',
  timeEnd: '16:00',
  cadence: 'Biennial',
  mandateType: 'policy-driven',
  urgency: 'scheduled',
  policyRefs: ['RM-ER-001', 'CO-CP-001', 'GV-GB-001'],
  owner: 'Compliance Officer',
  ownerRole: 'Risk & Compliance Officer',
  location: 'Main Office / Executive Conference Room',
  summary:
    'Biennial deep reassessment of the enterprise risk universe: refresh risk taxonomy, re-score all register entries (likelihood × impact), reconfirm ownership, retire stale risks, and recalibrate appetite/tolerance with Governing Body. Drives RM-WF-15 inputs for the next 24 months.',
  regulatoryDriver:
    'OIG Compliance Program Guidance — Element 1 (written standards & risk assessment). 42 CFR § 484.105(c) governing-body oversight of risk. Aligned to RM-ER-001 Enterprise Risk Management policy.',
  category: 'multi-year-governance',
  processFlow: [
    {
      id: 'erb-pre-register',
      label: 'Pull current Enterprise Risk Register and 2-year trend',
      description: 'Compile the live register and the prior 8 quarterly review snapshots.',
      instructions:
        '1. Export RM-FM-008 Enterprise Risk Register current state\n2. Pull last 8 quarterly RM-WF-01 review snapshots\n3. Build trend view: which risks rose, fell, were retired, were added\n4. Flag any risk with no owner or stale (>180 days) review',
      expectedOutput: 'Risk Register Trend Pack (2-year) attached to event packet',
      requiredFormIds: ['RM-FM-008'],
      onCompleteText: 'Trend pack ready for executive workshop.',
      status: 'pending',
      dueOffsetDays: -14,
    },
    {
      id: 'erb-pre-taxonomy',
      label: 'Refresh risk taxonomy and scoring rubric',
      description: 'Confirm taxonomy still aligns to operating model; update scoring rubric if appetite changed.',
      instructions:
        '1. Review categories (Clinical, Compliance, Financial, Operational, Cyber, Reputational, Strategic, Workforce)\n2. Add/retire categories as needed; document rationale\n3. Recalibrate likelihood/impact rubric anchors',
      expectedOutput: 'Updated taxonomy + rubric appended to RM-ER-001 evidence file',
      status: 'pending',
      dueOffsetDays: -10,
    },
    {
      id: 'erb-during',
      label: 'Conduct biennial enterprise risk reassessment workshop',
      description: 'Full-day cross-functional workshop. Reassessment of every register entry plus emerging-risk scan.',
      instructions:
        '1. Confirm quorum of executive risk committee\n2. Walk every active register entry — re-score, reconfirm owner, reconfirm controls\n3. Conduct emerging-risk scan (regulatory, market, technology, workforce)\n4. Draft Top-10 risk list for next 24 months\n5. Capture decisions in workshop minutes\n6. Vote to ratify updated register',
      expectedOutput: 'Ratified updated Enterprise Risk Register (RM-FM-008) + workshop minutes',
      requiredFormIds: ['RM-FM-008'],
      onCompleteText: 'Updated register ratified by Risk Committee.',
      status: 'pending',
      dueOffsetDays: 0,
    },
    {
      id: 'erb-post-gb',
      label: 'Submit biennial risk reassessment to Governing Body',
      description: 'Formal GB review and acknowledgment of refreshed risk posture and appetite.',
      instructions:
        '1. Compile executive summary + Top-10 + appetite recommendation\n2. Present at next GB meeting\n3. Obtain Board Chair signature acknowledging refreshed risk posture\n4. File with GV-GB-001 governance archive',
      expectedOutput: 'GB-acknowledged biennial risk reassessment package',
      status: 'pending',
      dueOffsetDays: 30,
    },
  ],
  requiredForms: [
    { id: 'erb-f1', label: 'Enterprise Risk Register (refreshed)', formId: 'RM-FM-008', status: 'pending', dueOffsetDays: 0 },
    { id: 'erb-f2', label: 'Workshop Minutes & Top-10 Risk List', status: 'pending', dueOffsetDays: 7 },
    { id: 'erb-f3', label: 'GB Acknowledgment of Biennial Risk Posture', status: 'pending', dueOffsetDays: 30 },
  ],
  minutes: {
    status: 'missing',
    dueOffsetDays: 7,
    assignee: 'Compliance Officer',
    requiredSections: [
      'Attendance & quorum',
      '2-year register trend review',
      'Taxonomy & rubric updates',
      'Per-risk reassessment outcomes',
      'Emerging risk scan results',
      'Top-10 risk list ratification',
      'Risk appetite & tolerance recalibration',
      'GB submission plan',
      'Adjournment',
    ],
    signOffRoles: ['Administrator', 'Compliance Officer', 'Clinical Manager'],
  },
  approvals: [
    { id: 'erb-ap-min', targetKind: 'minutes', targetLabel: 'Biennial Risk Reassessment Minutes', approverRole: 'Administrator', required: true, escalationDays: 7 },
    { id: 'erb-ap-reg', targetKind: 'form', targetLabel: 'Updated Enterprise Risk Register', approverRole: 'Administrator', required: true, escalationDays: 7 },
    { id: 'erb-ap-gb', targetKind: 'report', targetLabel: 'GB Acknowledgment — Biennial Risk Posture', approverRole: 'Board Chair', required: true, escalationDays: 30 },
  ],
  complianceFlags: {
    auditRisk: 'high',
    overdueAfterDays: 30,
    citation: 'OIG CPG Element 1; 42 CFR § 484.105(c); RM-ER-001',
    surveyorNote:
      'Biennial deep reassessment is the formal recalibration of the risk program. Absence of a documented multi-year reassessment is a recurring OIG finding even when annual cycles run.',
    missingEvidenceIf: ['missing', 'pending'],
  },
  followUps: [
    { id: 'erb-fu1', label: 'Realign quarterly RM-WF-01 reviews to new Top-10', ownerRole: 'Compliance Officer', dueOffsetDays: 60, closureCriteria: 'Next quarterly risk review agenda reflects updated Top-10 with assigned owners.' },
  ],
  dependencies: { feeds: ['EVT-RM-2028-ENTRISK-BIENNIAL'] },
  sourceOfTruth: 'app',
  timezone: 'America/Los_Angeles',
};

export const ENTERPRISE_RISK_BIENNIAL_2028: RegulatoryEvent = {
  ...ENTERPRISE_RISK_BIENNIAL_2026,
  id: 'EVT-RM-2028-ENTRISK-BIENNIAL',
  title: 'Enterprise Risk Assessment (Biennial Deep Reassessment) — 2028',
  date: nextOccurrenceDate(ENTERPRISE_RISK_BIENNIAL_2026.date, 'biennial'),
  urgency: 'scheduled',
  dependencies: { dependsOn: ['enterprise_risk_assessment-20260708-01'] },
};

/* ════════════════════════════════════════════════════════════════
   2. FULL POLICY FRAMEWORK REVIEW (BIENNIAL)
   Workflow: EN-WF-02 ANNUAL POLICY REVIEW (FULL FRAMEWORK)
            biennial = full enterprise re-baselining beyond annual.
   ════════════════════════════════════════════════════════════════ */

export const POLICY_FRAMEWORK_BIENNIAL_2026: RegulatoryEvent = {
  id: 'policy_framework_review-20260715-01',
  eventSubType: 'policy_framework_review',
  title: 'Full Policy Framework Review (Biennial Re-Baseline)',
  domain: 'Compliance',
  date: '2026-07-15',
  time: '09:00',
  timeEnd: '17:00',
  cadence: 'Biennial',
  mandateType: 'policy-driven',
  urgency: 'scheduled',
  policyRefs: ['EN-LC-001', 'EN-CM-001', 'CO-CP-001', 'GV-GB-001'],
  owner: 'Compliance Officer',
  ownerRole: 'Compliance Officer',
  summary:
    'Biennial enterprise re-baselining of the entire policy framework: taxonomy audit, owner reconfirmation, regulatory crosswalk refresh, retirement of obsolete policies, and Governing Body re-approval of the framework structure. Drives EN-WF-02 inputs for the next 24-month cycle.',
  regulatoryDriver:
    '42 CFR § 484.105(i)(1)-(2) Governing Body policy approval; OIG CPG Element 1 (written standards). Policy framework re-baselining defined in EN-LC-001 Policy Lifecycle.',
  category: 'multi-year-governance',
  processFlow: [
    {
      id: 'pfb-pre-inv',
      label: 'Generate full policy framework inventory + 2-year change log',
      description: 'Snapshot every policy, owner, version, last-review date, and 24-month change history.',
      instructions:
        '1. Export full policy index (every domain)\n2. Pull EN-FM-009 Version Control Change Log for last 24 months\n3. Flag policies last reviewed >24 months\n4. Flag policies with no current owner\n5. Flag policies whose regulatory anchors have changed since last baseline',
      expectedOutput: '24-month framework inventory + flagged-policy list',
      requiredFormIds: ['EN-FM-007', 'EN-FM-010'],
      status: 'pending',
      dueOffsetDays: -21,
    },
    {
      id: 'pfb-pre-crosswalk',
      label: 'Refresh regulatory crosswalk',
      description: 'Reconfirm every policy maps to a current CFR / state / CoP citation.',
      instructions:
        '1. Validate each policyRef against current 42 CFR Part 484 text\n2. Update citations where regulations have been amended\n3. Identify policies covering retired regulations — propose retirement',
      expectedOutput: 'Updated regulatory crosswalk attached to EN-LC-001 evidence',
      status: 'pending',
      dueOffsetDays: -10,
    },
    {
      id: 'pfb-during',
      label: 'Biennial framework review session — domain leads + Compliance',
      description: 'Re-baseline the framework structure, taxonomy, and ownership map.',
      instructions:
        '1. Each domain lead presents 24-month change summary\n2. Vote on retirements and consolidations\n3. Reconfirm owner for every active policy\n4. Approve updated taxonomy (if changed)\n5. Build GB submission package',
      expectedOutput: 'Ratified framework re-baseline package',
      requiredFormIds: ['EN-FM-008'],
      status: 'pending',
      dueOffsetDays: 0,
    },
    {
      id: 'pfb-post-gb',
      label: 'Governing Body re-approval of framework',
      description: 'GB formally re-approves the policy framework structure for the next 2-year cycle.',
      instructions:
        '1. Submit re-baseline package to GB at next board meeting\n2. Board Chair signs approval per § 484.105(i)\n3. Communicate updated framework to all staff with acknowledgment',
      expectedOutput: 'Board-approved framework re-baseline (CO-FM-PP-004 equivalent)',
      requiredFormIds: ['CO-FM-PP-004'],
      status: 'pending',
      dueOffsetDays: 30,
    },
  ],
  requiredForms: [
    { id: 'pfb-f1', label: 'Policy Framework Inventory (24-month)', formId: 'EN-FM-010', status: 'pending', dueOffsetDays: -21 },
    { id: 'pfb-f2', label: 'Policy Approval Routing — Re-Baseline', formId: 'EN-FM-008', status: 'pending', dueOffsetDays: 0 },
    { id: 'pfb-f3', label: 'GB Framework Approval', formId: 'CO-FM-PP-004', status: 'pending', dueOffsetDays: 30 },
  ],
  minutes: {
    status: 'missing',
    dueOffsetDays: 7,
    assignee: 'Compliance Officer',
    requiredSections: [
      'Attendance & quorum (all domain leads)',
      '24-month change log review',
      'Regulatory crosswalk refresh outcomes',
      'Retirements & consolidations approved',
      'Owner reconfirmation map',
      'GB submission plan',
      'Adjournment',
    ],
    signOffRoles: ['Administrator', 'Compliance Officer', 'All Domain Leads'],
  },
  approvals: [
    { id: 'pfb-ap-admin', targetKind: 'report', targetLabel: 'Re-Baselined Framework Package', approverRole: 'Administrator', required: true, escalationDays: 7 },
    { id: 'pfb-ap-gb', targetKind: 'report', targetLabel: 'GB Framework Re-Approval', approverRole: 'Board Chair', required: true, escalationDays: 30 },
  ],
  complianceFlags: {
    auditRisk: 'high',
    overdueAfterDays: 30,
    citation: '42 CFR § 484.105(i)(1)-(2); OIG CPG Element 1; EN-LC-001',
    surveyorNote:
      'Annual policy review confirms currency; biennial re-baseline confirms structural integrity of the framework. Both are needed for a defensible governance posture.',
    missingEvidenceIf: ['missing', 'pending'],
  },
  followUps: [
    { id: 'pfb-fu1', label: 'Update annual EN-WF-02 cycle plan to reflect re-baseline', ownerRole: 'Compliance Officer', dueOffsetDays: 45, closureCriteria: 'Next annual cycle plan reflects retired/consolidated policies and new ownership map.' },
  ],
  dependencies: { feeds: ['EVT-EN-2028-PFRAMEWORK-BIENNIAL'] },
  sourceOfTruth: 'app',
  timezone: 'America/Los_Angeles',
};

export const POLICY_FRAMEWORK_BIENNIAL_2028: RegulatoryEvent = {
  ...POLICY_FRAMEWORK_BIENNIAL_2026,
  id: 'EVT-EN-2028-PFRAMEWORK-BIENNIAL',
  title: 'Full Policy Framework Review (Biennial Re-Baseline) — 2028',
  date: nextOccurrenceDate(POLICY_FRAMEWORK_BIENNIAL_2026.date, 'biennial'),
  urgency: 'scheduled',
  dependencies: { dependsOn: ['policy_framework_review-20260715-01'] },
};

/* ════════════════════════════════════════════════════════════════
   3. WORKFORCE COMPETENCY VALIDATION (BIENNIAL)
   Workflows: CL-WF-25 (Clinician Competency), HR-WF-05 (HHA Training)
   ════════════════════════════════════════════════════════════════ */

export const WORKFORCE_COMPETENCY_BIENNIAL_2026: RegulatoryEvent = {
  id: 'competency_validation_biennial-20260722-01',
  eventSubType: 'competency_validation_biennial',
  title: 'Workforce Competency Validation (Biennial Enterprise Cycle)',
  domain: 'Operations',
  date: '2026-07-22',
  time: '09:00',
  timeEnd: '15:00',
  cadence: 'Biennial',
  mandateType: 'policy-driven',
  urgency: 'scheduled',
  policyRefs: ['HR-TA-003', 'CO-CP-001', 'QA-PG-001'],
  owner: 'Clinical Manager',
  ownerRole: 'Clinical Manager',
  summary:
    'Biennial enterprise validation that every active workforce role has current competency evidence on file. Cross-checks CL-WF-25 (clinician), HR-WF-05 (HHA), HR-WF-07 (mandatory training), and OIG/SAM screening (HR-FM-005). Identifies gaps and assigns remediation before the next 24-month window opens.',
  regulatoryDriver:
    '42 CFR § 484.80 (HHA training & competency); § 484.75 (skilled professional services); HR-TA-003 OIG/SAM screening; OIG CPG Element 6 (training & education).',
  category: 'multi-year-governance',
  processFlow: [
    {
      id: 'wcb-pre-roster',
      label: 'Generate active workforce roster with role-based competency map',
      description: 'Pull every active employee/contractor with role, hire/cred dates, and required competency set.',
      instructions:
        '1. Export active roster\n2. For each role, list required competencies (clinical, HHA, mandatory training, OIG/SAM, license)\n3. Cross-reference HR-FM-006 (license PSV), HR-FM-008 (annual eval), HR-FM-015 (personnel file audit)\n4. Cross-reference HR-FM-005 (24 months of OIG/SAM screening)',
      expectedOutput: 'Roster + role-competency matrix + 24-month evidence map',
      requiredFormIds: ['HR-FM-005', 'HR-FM-006', 'HR-FM-008', 'HR-FM-015'],
      status: 'pending',
      dueOffsetDays: -14,
    },
    {
      id: 'wcb-pre-gap',
      label: 'Identify and triage competency gaps',
      description: 'Flag every role with missing or stale competency evidence; assign remediation owner.',
      instructions:
        '1. Flag missing license PSV, expired competencies, missed annual training\n2. Categorize: critical (patient-facing), high (compliance), medium (admin)\n3. Assign remediation owner and due date per gap',
      expectedOutput: 'Competency Gap Triage Log',
      status: 'pending',
      dueOffsetDays: -7,
    },
    {
      id: 'wcb-during',
      label: 'Biennial competency validation review session',
      description: 'Joint Clinical / HR / Compliance review of validation results and remediation plan.',
      instructions:
        '1. Present roster, evidence map, and gap triage\n2. Confirm CL-WF-25 and HR-WF-05 cycles are current\n3. Approve remediation plan with owners and dates\n4. Set the 24-month forward validation schedule',
      expectedOutput: 'Approved Biennial Competency Validation Report + remediation plan',
      requiredFormIds: ['HR-FM-015'],
      status: 'pending',
      dueOffsetDays: 0,
    },
    {
      id: 'wcb-post-close',
      label: 'Close all critical-tier gaps within 60 days',
      description: 'Critical (patient-facing) gaps must be closed within 60 days or staff member is restricted from patient care.',
      instructions:
        '1. Track each critical gap to closure\n2. If unresolved at 60 days: restrict from patient care via Administrator action\n3. Document closure evidence in personnel file',
      expectedOutput: 'All critical gaps closed with evidence; high/medium gaps on tracked plan',
      status: 'pending',
      dueOffsetDays: 60,
    },
  ],
  requiredForms: [
    { id: 'wcb-f1', label: 'Active Workforce Roster + Role-Competency Matrix', status: 'pending', dueOffsetDays: -14 },
    { id: 'wcb-f2', label: 'OIG/SAM 24-Month Evidence Pack', formId: 'HR-FM-005', status: 'pending', dueOffsetDays: -14 },
    { id: 'wcb-f3', label: 'License PSV Evidence Pack', formId: 'HR-FM-006', status: 'pending', dueOffsetDays: -14 },
    { id: 'wcb-f4', label: 'Annual Performance Evaluation Pack', formId: 'HR-FM-008', status: 'pending', dueOffsetDays: -14 },
    { id: 'wcb-f5', label: 'Personnel File Content Audit', formId: 'HR-FM-015', status: 'pending', dueOffsetDays: 0 },
  ],
  minutes: {
    status: 'missing',
    dueOffsetDays: 7,
    assignee: 'Clinical Manager',
    requiredSections: [
      'Roster & evidence map review',
      'Gap triage results by tier',
      'CL-WF-25 / HR-WF-05 currency confirmation',
      'Remediation plan approval',
      'Forward 24-month validation schedule',
      'Adjournment',
    ],
    signOffRoles: ['Administrator', 'Clinical Manager', 'HR Lead', 'Compliance Officer'],
  },
  approvals: [
    { id: 'wcb-ap-rep', targetKind: 'report', targetLabel: 'Biennial Competency Validation Report', approverRole: 'Administrator', required: true, escalationDays: 7 },
    { id: 'wcb-ap-rem', targetKind: 'report', targetLabel: 'Remediation Plan Approval', approverRole: 'Compliance Officer', required: true, escalationDays: 7 },
  ],
  complianceFlags: {
    auditRisk: 'critical',
    overdueAfterDays: 14,
    citation: '42 CFR § 484.80; § 484.75; HR-TA-003; OIG CPG Element 6',
    surveyorNote:
      'Surveyors directly verify license PSV, OIG/SAM screening, and competency on a per-employee basis. Any patient-facing employee without current evidence is an immediate finding.',
    missingEvidenceIf: ['missing', 'pending'],
  },
  followUps: [
    { id: 'wcb-fu1', label: 'Realign HR-WF-07 mandatory training schedule to validation results', ownerRole: 'HR Lead', dueOffsetDays: 30, closureCriteria: 'Updated training calendar reflects validated baseline.' },
  ],
  dependencies: { feeds: ['EVT-HR-2028-COMPETENCY-BIENNIAL'] },
  sourceOfTruth: 'app',
  timezone: 'America/Los_Angeles',
};

export const WORKFORCE_COMPETENCY_BIENNIAL_2028: RegulatoryEvent = {
  ...WORKFORCE_COMPETENCY_BIENNIAL_2026,
  id: 'EVT-HR-2028-COMPETENCY-BIENNIAL',
  title: 'Workforce Competency Validation (Biennial Enterprise Cycle) — 2028',
  date: nextOccurrenceDate(WORKFORCE_COMPETENCY_BIENNIAL_2026.date, 'biennial'),
  urgency: 'scheduled',
  dependencies: { dependsOn: ['competency_validation_biennial-20260722-01'] },
};

/* ════════════════════════════════════════════════════════════════
   4. COMPLIANCE PROGRAM EFFECTIVENESS REVIEW (BIENNIAL)
   Workflow: QA-WF-11 POLICY EFFECTIVENESS MONITORING
            (biennial deep effectiveness audit overlays the annual)
   ════════════════════════════════════════════════════════════════ */

export const COMPLIANCE_EFFECTIVENESS_BIENNIAL_2026: RegulatoryEvent = {
  id: 'compliance_effectiveness_biennial-20260729-01',
  eventSubType: 'compliance_effectiveness_biennial',
  title: 'Compliance Program Effectiveness Review (Biennial Deep Audit)',
  domain: 'Compliance',
  date: '2026-07-29',
  time: '09:00',
  timeEnd: '15:00',
  cadence: 'Biennial',
  mandateType: 'policy-driven',
  urgency: 'scheduled',
  policyRefs: ['CO-CP-001', 'EN-CM-001', 'GV-GB-001'],
  owner: 'Compliance Officer',
  ownerRole: 'Compliance Officer',
  summary:
    'Biennial deep effectiveness audit of the corporate compliance program. Goes beyond the annual self-assessment: evidence-based testing of all 7 OIG elements with sampled controls, hotline trend analysis (24 months), training-impact measurement, and Board-level effectiveness rating.',
  regulatoryDriver: 'OIG Compliance Program Guidance for Home Health Agencies — periodic program effectiveness audit (in addition to annual self-assessment).',
  category: 'multi-year-governance',
  processFlow: [
    {
      id: 'cebr-pre-evidence',
      label: 'Compile 24-month compliance evidence pack',
      description: 'Aggregate 2 years of monthly compliance reports, training rosters, hotline records, audit findings, and OIG screens.',
      instructions:
        '1. Pull 24 months of EN-FM-033 mandatory event completion reports\n2. Pull 24 months of CO-FM-010..012 annual records\n3. Pull EN-FM-022 quarterly compliance scorecards\n4. Aggregate hotline reports and dispositions\n5. Aggregate OIG/SAM screening logs (HR-FM-005)',
      expectedOutput: 'Two-year compliance evidence pack',
      requiredFormIds: ['CO-FM-010', 'CO-FM-011', 'CO-FM-012', 'EN-FM-022', 'EN-FM-033'],
      status: 'pending',
      dueOffsetDays: -21,
    },
    {
      id: 'cebr-pre-test',
      label: 'Sampled control testing across 7 OIG elements',
      description: 'For each OIG element, select sample controls and test for evidence of effectiveness.',
      instructions:
        '1. For each of the 7 elements, select ≥3 controls\n2. Test each control: design adequate? operating? evidence retained?\n3. Score each element: Effective / Partially Effective / Ineffective\n4. Document deficiencies for each Partial/Ineffective control',
      expectedOutput: 'Element-level effectiveness scorecard with control-test workpapers',
      status: 'pending',
      dueOffsetDays: -7,
    },
    {
      id: 'cebr-during',
      label: 'Biennial effectiveness review session',
      description: 'Compliance Committee reviews evidence pack, control-test results, and approves rating.',
      instructions:
        '1. Walk through 7-element scorecard\n2. Review hotline 24-month trend\n3. Review training-impact metrics\n4. Approve overall program rating: Effective / Partially Effective / Needs Material Improvement\n5. Identify top 5 remediation initiatives for next 24 months',
      expectedOutput: 'Ratified Biennial Effectiveness Rating + 24-month remediation plan',
      requiredFormIds: ['CO-FM-010'],
      status: 'pending',
      dueOffsetDays: 0,
    },
    {
      id: 'cebr-post-gb',
      label: 'Submit Biennial Effectiveness Report to Governing Body',
      description: 'GB receives, reviews, and signs the biennial program effectiveness report.',
      instructions:
        '1. Compile executive summary + scorecard + remediation plan\n2. Submit to GB\n3. Board Chair signature on effectiveness rating',
      expectedOutput: 'Signed Biennial Compliance Effectiveness Report (CO-FM-012 with biennial extension)',
      requiredFormIds: ['CO-FM-012'],
      status: 'pending',
      dueOffsetDays: 30,
    },
  ],
  requiredForms: [
    { id: 'cebr-f1', label: '24-Month Compliance Evidence Pack', status: 'pending', dueOffsetDays: -21 },
    { id: 'cebr-f2', label: 'Element Effectiveness Scorecard + Workpapers', status: 'pending', dueOffsetDays: 0 },
    { id: 'cebr-f3', label: 'Biennial Effectiveness Report', formId: 'CO-FM-012', status: 'pending', dueOffsetDays: 30 },
  ],
  minutes: {
    status: 'missing',
    dueOffsetDays: 7,
    assignee: 'Compliance Officer',
    requiredSections: [
      '7-Element scorecard review',
      '24-month hotline trend',
      'Training-impact metrics',
      'Control test deficiencies',
      'Program rating vote',
      '24-month remediation plan approval',
      'Adjournment',
    ],
    signOffRoles: ['Administrator', 'Compliance Officer', 'QAPI Committee Chair'],
  },
  approvals: [
    { id: 'cebr-ap-rate', targetKind: 'report', targetLabel: 'Biennial Effectiveness Rating', approverRole: 'Administrator', required: true, escalationDays: 7 },
    { id: 'cebr-ap-gb', targetKind: 'report', targetLabel: 'GB Acknowledgment — Biennial Effectiveness', approverRole: 'Board Chair', required: true, escalationDays: 30 },
  ],
  complianceFlags: {
    auditRisk: 'high',
    overdueAfterDays: 30,
    citation: 'OIG CPG for HHAs — periodic effectiveness audit beyond annual self-assessment',
    surveyorNote:
      'Annual self-assessment alone is insufficient for a mature program; OIG expects periodic evidence-based effectiveness testing. Missing biennial evidence weakens the defense of the program.',
    missingEvidenceIf: ['missing', 'pending'],
  },
  followUps: [
    { id: 'cebr-fu1', label: 'Embed top-5 remediation items into next two annual work plans', ownerRole: 'Compliance Officer', dueOffsetDays: 60, closureCriteria: 'Next two CO-FM-011 work plans include the biennial remediation initiatives.' },
  ],
  dependencies: { feeds: ['EVT-CO-2028-EFFECTIVENESS-BIENNIAL'] },
  sourceOfTruth: 'app',
  timezone: 'America/Los_Angeles',
};

export const COMPLIANCE_EFFECTIVENESS_BIENNIAL_2028: RegulatoryEvent = {
  ...COMPLIANCE_EFFECTIVENESS_BIENNIAL_2026,
  id: 'EVT-CO-2028-EFFECTIVENESS-BIENNIAL',
  title: 'Compliance Program Effectiveness Review (Biennial Deep Audit) — 2028',
  date: nextOccurrenceDate(COMPLIANCE_EFFECTIVENESS_BIENNIAL_2026.date, 'biennial'),
  urgency: 'scheduled',
  dependencies: { dependsOn: ['compliance_effectiveness_biennial-20260729-01'] },
};

/* ════════════════════════════════════════════════════════════════
   5. OIG WORK PLAN REVIEW (ANNUAL — replaces fixed-cadence "OIG-required")
   Workflows: CO-WF-15 (OIG/SAM Screening), CO-WF-16 (Self-Disclosure),
              CO-WF-08 (FWA Training & Monitoring)
   ════════════════════════════════════════════════════════════════ */

export const OIG_WORK_PLAN_REVIEW_2026: RegulatoryEvent = {
  id: 'oig_workplan_review-20260730-01',
  eventSubType: 'oig_workplan_review',
  title: 'Annual OIG Work Plan Review',
  domain: 'Compliance',
  date: '2026-07-30',
  time: '13:00',
  timeEnd: '15:30',
  cadence: 'Annual',
  mandateType: 'policy-driven',
  urgency: 'scheduled',
  policyRefs: ['CO-CP-001'],
  owner: 'Compliance Officer',
  ownerRole: 'Compliance Officer',
  summary:
    'Annual review of the current OIG Work Plan: identify items relevant to home health, assess agency risk exposure against each, and adjust internal audit / monitoring focus for the next 12 months. NOTE: this replaces any fixed-cadence "OIG-required" event labeling — OIG itself does not impose a cadence; this is the mechanism by which OIG priorities flow into the agency program.',
  regulatoryDriver:
    'OIG Compliance Program Guidance — Element 4 (effective lines of communication) and Element 5 (auditing & monitoring). OIG Work Plan is the primary signal of federal enforcement focus.',
  category: 'multi-year-governance',
  processFlow: [
    {
      id: 'oig-pre-pull',
      label: 'Pull current OIG Work Plan and active items',
      description: 'Download the current OIG Work Plan; filter to items relevant to home health.',
      instructions:
        '1. Download OIG Work Plan from oig.hhs.gov\n2. Filter for: home health agencies, hospice, Medicare Part A claims, billing integrity\n3. Tag each item: Active / Anticipated / Closed\n4. Identify items added since last annual review',
      expectedOutput: 'Filtered OIG Work Plan extract relevant to the agency',
      status: 'pending',
      dueOffsetDays: -14,
    },
    {
      id: 'oig-pre-expose',
      label: 'Assess agency exposure per Work Plan item',
      description: 'For each relevant item, score agency exposure (high/medium/low) based on services, billing patterns, prior findings.',
      instructions:
        '1. For each item, document: relevance, exposure rating, current controls, gaps\n2. Cross-reference internal audit history\n3. Cross-reference billing/claims patterns\n4. Identify controls needing strengthening',
      expectedOutput: 'OIG Exposure Matrix with control gaps',
      status: 'pending',
      dueOffsetDays: -7,
    },
    {
      id: 'oig-during',
      label: 'Annual OIG Work Plan review session',
      description: 'Compliance Committee reviews exposure matrix and approves audit-focus adjustments.',
      instructions:
        '1. Walk through OIG Work Plan extract\n2. Review exposure matrix\n3. Approve adjustments to internal audit and monitoring focus\n4. Confirm OIG/SAM screening (CO-WF-15) and self-disclosure (CO-WF-16) protocols are operating\n5. Confirm FWA training (CO-WF-08) reflects current OIG enforcement themes',
      expectedOutput: 'Approved OIG Alignment Plan for next 12 months',
      requiredFormIds: ['CO-FM-011'],
      status: 'pending',
      dueOffsetDays: 0,
    },
    {
      id: 'oig-post-comm',
      label: 'Communicate adjusted audit focus and update training',
      description: 'Distribute alignment plan; update FWA training content to reflect new OIG enforcement themes.',
      instructions:
        '1. Distribute alignment plan to Internal Audit, Billing, Clinical leadership\n2. Update CO-WF-08 FWA training content\n3. Confirm next-year work plan (CO-FM-011) reflects OIG focus',
      expectedOutput: 'Updated CO-FM-011 work plan + refreshed FWA training content',
      requiredFormIds: ['CO-FM-011'],
      status: 'pending',
      dueOffsetDays: 30,
    },
  ],
  requiredForms: [
    { id: 'oig-f1', label: 'OIG Work Plan Extract (filtered)', formId: 'CO-F-010', status: 'pending', dueOffsetDays: -14 },
    { id: 'oig-f2', label: 'OIG Exposure Matrix', formId: 'CO-FM-030', status: 'pending', dueOffsetDays: 0 },
    { id: 'oig-f3', label: 'Updated Compliance Work Plan', formId: 'CO-FM-011', status: 'pending', dueOffsetDays: 30 },
  ],
  minutes: {
    status: 'missing',
    dueOffsetDays: 7,
    assignee: 'Compliance Officer',
    requiredSections: [
      'OIG Work Plan items reviewed',
      'Exposure matrix outcomes',
      'Audit-focus adjustments approved',
      'CO-WF-15 / CO-WF-16 / CO-WF-08 currency confirmed',
      'Adjournment',
    ],
    signOffRoles: ['Administrator', 'Compliance Officer'],
  },
  approvals: [
    { id: 'oig-ap-plan', targetKind: 'report', targetLabel: 'Updated OIG Alignment Plan', approverRole: 'Administrator', required: true, escalationDays: 7 },
  ],
  complianceFlags: {
    auditRisk: 'high',
    overdueAfterDays: 30,
    citation: 'OIG CPG Elements 4 & 5; agency Corporate Compliance Program (CO-CP-001)',
    surveyorNote:
      'Surveyors and auditors look for documented evidence that the agency tracks and responds to OIG enforcement priorities. Absence of an annual Work Plan Review weakens the compliance program defense.',
    missingEvidenceIf: ['missing', 'pending'],
  },
  followUps: [
    { id: 'oig-fu1', label: 'Verify OIG focus is reflected in quarterly compliance scorecard', ownerRole: 'Compliance Officer', dueOffsetDays: 90, closureCriteria: 'EN-FM-022 next quarterly scorecard includes OIG-focus metrics.' },
  ],
  sourceOfTruth: 'app',
  timezone: 'America/Los_Angeles',
};

/* ════════════════════════════════════════════════════════════════
   6. COMPREHENSIVE COMPLIANCE PROGRAM EVALUATION (TRIENNIAL)
   Workflow: QA-WF-11 POLICY EFFECTIVENESS MONITORING (triennial enterprise sweep)
   ════════════════════════════════════════════════════════════════ */

export const COMPREHENSIVE_COMPLIANCE_TRIENNIAL_2026: RegulatoryEvent = {
  id: 'compliance_comprehensive_review-20260730-01',
  eventSubType: 'compliance_comprehensive_review',
  title: 'Comprehensive Compliance Program Evaluation (Triennial)',
  domain: 'Compliance',
  date: '2026-07-30',
  time: '09:00',
  timeEnd: '17:00',
  cadence: 'Triennial',
  mandateType: 'policy-driven',
  urgency: 'scheduled',
  policyRefs: ['CO-CP-001', 'EN-CM-001', 'GV-GB-001'],
  owner: 'Compliance Officer',
  ownerRole: 'Compliance Officer',
  summary:
    'Triennial enterprise-wide comprehensive evaluation of the compliance program against current OIG guidance, DOJ Evaluation of Corporate Compliance Programs criteria, and home-health enforcement trends. Includes maturity scoring, benchmarking, and 36-month strategic plan refresh.',
  regulatoryDriver:
    'OIG Compliance Program Guidance + DOJ Evaluation of Corporate Compliance Programs; periodic comprehensive evaluation is the established standard for sustained program credibility.',
  category: 'triennial-governance',
  processFlow: [
    {
      id: 'ccp-pre-3yr',
      label: 'Compile 36-month compliance program evidence library',
      description: 'Aggregate 3 years of compliance program operating evidence.',
      instructions:
        '1. Pull 36 months of monthly + quarterly + annual compliance records\n2. Pull all biennial effectiveness reports\n3. Pull all enforcement, settlement, and corrective-action records\n4. Pull all OIG Work Plan Review outputs',
      expectedOutput: '36-month compliance evidence library',
      status: 'pending',
      dueOffsetDays: -30,
    },
    {
      id: 'ccp-pre-maturity',
      label: 'Run program maturity assessment',
      description: 'Score program maturity per the 7 OIG elements + DOJ ECCP criteria on a defined maturity scale.',
      instructions:
        '1. Use defined 1-5 maturity scale (Initial → Repeatable → Defined → Managed → Optimized)\n2. Score each element with documented justification\n3. Compare to prior triennial baseline (or annual baseline if first cycle)\n4. Identify priority maturity-lift initiatives',
      expectedOutput: 'Program Maturity Scorecard + lift-initiative list',
      status: 'pending',
      dueOffsetDays: -14,
    },
    {
      id: 'ccp-during',
      label: 'Comprehensive evaluation review — full executive committee',
      description: 'Full-day executive committee review of evidence, maturity scoring, benchmarking, and strategic plan.',
      instructions:
        '1. Present 36-month evidence summary\n2. Present maturity scorecard with prior-period comparison\n3. Present external benchmarking (industry / peer)\n4. Approve 36-month strategic compliance roadmap\n5. Identify any immediate corrective actions',
      expectedOutput: 'Approved Triennial Comprehensive Evaluation + 36-month strategic roadmap',
      status: 'pending',
      dueOffsetDays: 0,
    },
    {
      id: 'ccp-post-gb',
      label: 'Governing Body adoption of triennial evaluation and strategic roadmap',
      description: 'GB formally adopts the triennial evaluation and the 36-month strategic roadmap.',
      instructions:
        '1. Submit comprehensive evaluation package to GB\n2. Present executive summary at board meeting\n3. Board Chair signature on adoption resolution\n4. File in governance archive',
      expectedOutput: 'Board-adopted triennial comprehensive evaluation + roadmap',
      status: 'pending',
      dueOffsetDays: 45,
    },
  ],
  requiredForms: [
    { id: 'ccp-f1', label: '36-Month Compliance Evidence Library', status: 'pending', dueOffsetDays: -30 },
    { id: 'ccp-f2', label: 'Program Maturity Scorecard', status: 'pending', dueOffsetDays: -14 },
    { id: 'ccp-f3', label: 'Triennial Comprehensive Evaluation Report', formId: 'CO-FM-012', status: 'pending', dueOffsetDays: 30 },
    { id: 'ccp-f4', label: 'GB Adoption Resolution', status: 'pending', dueOffsetDays: 45 },
  ],
  minutes: {
    status: 'missing',
    dueOffsetDays: 7,
    assignee: 'Compliance Officer',
    requiredSections: [
      '36-month evidence summary',
      'Maturity scorecard review',
      'Benchmarking outcomes',
      '36-month roadmap approval',
      'Immediate corrective actions',
      'GB submission plan',
      'Adjournment',
    ],
    signOffRoles: ['Administrator', 'Compliance Officer', 'QAPI Committee Chair'],
  },
  approvals: [
    { id: 'ccp-ap-eval', targetKind: 'report', targetLabel: 'Triennial Comprehensive Evaluation', approverRole: 'Administrator', required: true, escalationDays: 14 },
    { id: 'ccp-ap-gb', targetKind: 'report', targetLabel: 'GB Adoption — Triennial Evaluation', approverRole: 'Board Chair', required: true, escalationDays: 45 },
  ],
  complianceFlags: {
    auditRisk: 'high',
    overdueAfterDays: 45,
    citation: 'OIG CPG + DOJ ECCP; CO-CP-001',
    surveyorNote:
      'For mature programs, surveyors and federal investigators look for periodic comprehensive evaluation distinct from annual self-assessment. Triennial evaluation evidences sustained program governance.',
    missingEvidenceIf: ['missing', 'pending'],
  },
  followUps: [
    { id: 'ccp-fu1', label: 'Cascade triennial roadmap into next 3 annual work plans', ownerRole: 'Compliance Officer', dueOffsetDays: 90, closureCriteria: 'Next 3 CO-FM-011 plans reflect roadmap initiatives.' },
  ],
  dependencies: { feeds: ['EVT-CO-2029-COMPREHENSIVE-TRIENNIAL'] },
  sourceOfTruth: 'app',
  timezone: 'America/Los_Angeles',
};

export const COMPREHENSIVE_COMPLIANCE_TRIENNIAL_2029: RegulatoryEvent = {
  ...COMPREHENSIVE_COMPLIANCE_TRIENNIAL_2026,
  id: 'EVT-CO-2029-COMPREHENSIVE-TRIENNIAL',
  title: 'Comprehensive Compliance Program Evaluation (Triennial) — 2029',
  date: nextOccurrenceDate(COMPREHENSIVE_COMPLIANCE_TRIENNIAL_2026.date, 'triennial'),
  urgency: 'scheduled',
  dependencies: { dependsOn: ['compliance_comprehensive_review-20260730-01'] },
};

/* ════════════════════════════════════════════════════════════════
   7. EXTERNAL / INDEPENDENT COMPLIANCE REVIEW (TRIENNIAL)
   Workflow: QA-WF-11 (independent reviewer engagement; output ratified
            via CO-CP-001 governance pathway)
   ════════════════════════════════════════════════════════════════ */

export const EXTERNAL_COMPLIANCE_REVIEW_TRIENNIAL_2026: RegulatoryEvent = {
  id: 'external_compliance_review-20260731-01',
  eventSubType: 'external_compliance_review',
  title: 'External / Independent Compliance Review (Triennial)',
  domain: 'Compliance',
  date: '2026-07-31',
  time: '09:00',
  timeEnd: '17:00',
  cadence: 'Triennial',
  mandateType: 'policy-driven',
  urgency: 'scheduled',
  policyRefs: ['CO-CP-001', 'GV-GB-001'],
  owner: 'Compliance Officer',
  ownerRole: 'Compliance Officer',
  summary:
    'Triennial independent compliance review conducted by an external qualified reviewer (outside counsel, accounting firm compliance practice, or specialty consultancy). Independent attestation of program design, operating effectiveness, and remediation status.',
  regulatoryDriver:
    'OIG CPG — independent review is a recognized hallmark of an effective compliance program; CIA precedent uses similar third-party review cadence.',
  category: 'triennial-governance',
  processFlow: [
    {
      id: 'ext-pre-engage',
      label: 'Engage external independent reviewer',
      description: 'Issue scope of work and engagement letter to qualified independent reviewer.',
      instructions:
        '1. Define scope: design effectiveness, operating effectiveness, remediation, benchmarking\n2. Confirm reviewer independence (no conflicts)\n3. Execute engagement letter\n4. Provide evidence library access',
      expectedOutput: 'Executed engagement letter + scope of work',
      status: 'pending',
      dueOffsetDays: -45,
    },
    {
      id: 'ext-pre-fieldwork',
      label: 'Independent reviewer fieldwork',
      description: 'External reviewer conducts interviews, sampling, and control testing.',
      instructions:
        '1. Coordinate reviewer access to staff and records\n2. Track all requests in Reviewer Request Log\n3. Provide management responses to preliminary observations',
      expectedOutput: 'Completed fieldwork; preliminary observation log',
      status: 'pending',
      dueOffsetDays: -14,
    },
    {
      id: 'ext-during',
      label: 'Receive and review independent reviewer report',
      description: 'Compliance Committee reviews the independent report and management responses.',
      instructions:
        '1. Walk through reviewer findings and observations\n2. Approve management responses for each finding\n3. Approve remediation plan with owners and dates\n4. Plan GB presentation',
      expectedOutput: 'Final independent review report + management response + remediation plan',
      status: 'pending',
      dueOffsetDays: 0,
    },
    {
      id: 'ext-post-gb',
      label: 'Present independent review to Governing Body',
      description: 'GB receives the independent report and the management remediation plan.',
      instructions:
        '1. Present at board meeting (independent reviewer may attend)\n2. Board Chair signs acknowledgment\n3. File in governance archive\n4. Confirm remediation tracking begins',
      expectedOutput: 'Board-acknowledged independent review + tracked remediation',
      status: 'pending',
      dueOffsetDays: 30,
    },
  ],
  requiredForms: [
    { id: 'ext-f1', label: 'Independent Reviewer Engagement Letter', status: 'pending', dueOffsetDays: -45 },
    { id: 'ext-f2', label: 'Reviewer Request Log', status: 'pending', dueOffsetDays: -14 },
    { id: 'ext-f3', label: 'Independent Review Report + Management Response', status: 'pending', dueOffsetDays: 0 },
    { id: 'ext-f4', label: 'GB Acknowledgment + Remediation Plan', status: 'pending', dueOffsetDays: 30 },
  ],
  minutes: {
    status: 'missing',
    dueOffsetDays: 7,
    assignee: 'Compliance Officer',
    requiredSections: [
      'Reviewer scope and independence',
      'Findings and observations',
      'Management response approval',
      'Remediation plan approval',
      'GB submission plan',
      'Adjournment',
    ],
    signOffRoles: ['Administrator', 'Compliance Officer'],
  },
  approvals: [
    { id: 'ext-ap-resp', targetKind: 'report', targetLabel: 'Management Response to Independent Review', approverRole: 'Administrator', required: true, escalationDays: 14 },
    { id: 'ext-ap-gb', targetKind: 'report', targetLabel: 'GB Acknowledgment — Independent Review', approverRole: 'Board Chair', required: true, escalationDays: 30 },
  ],
  complianceFlags: {
    auditRisk: 'high',
    overdueAfterDays: 45,
    citation: 'OIG CPG — independent review hallmark of effective program',
    surveyorNote:
      'Independent third-party review is a strong defensibility marker. Programs lacking periodic independent attestation are easier to challenge as self-serving.',
    missingEvidenceIf: ['missing', 'pending'],
  },
  followUps: [
    { id: 'ext-fu1', label: 'Track all independent-review remediation items to closure', ownerRole: 'Compliance Officer', dueOffsetDays: 180, closureCriteria: 'Every item closed with evidence; status reported in quarterly EN-FM-022.' },
  ],
  dependencies: { feeds: ['EVT-CO-2029-EXTREVIEW-TRIENNIAL'] },
  sourceOfTruth: 'app',
  timezone: 'America/Los_Angeles',
};

export const EXTERNAL_COMPLIANCE_REVIEW_TRIENNIAL_2029: RegulatoryEvent = {
  ...EXTERNAL_COMPLIANCE_REVIEW_TRIENNIAL_2026,
  id: 'EVT-CO-2029-EXTREVIEW-TRIENNIAL',
  title: 'External / Independent Compliance Review (Triennial) — 2029',
  date: nextOccurrenceDate(EXTERNAL_COMPLIANCE_REVIEW_TRIENNIAL_2026.date, 'triennial'),
  urgency: 'scheduled',
  dependencies: { dependsOn: ['external_compliance_review-20260731-01'] },
};

/* ════════════════════════════════════════════════════════════════
   8. STRATEGIC PROGRAM EFFECTIVENESS ASSESSMENT (TRIENNIAL)
   Workflow: GV-WF-* governance program; QA-WF-11 effectiveness inputs
   ════════════════════════════════════════════════════════════════ */

export const STRATEGIC_EFFECTIVENESS_TRIENNIAL_2026: RegulatoryEvent = {
  id: 'strategic_assessment-20260731-01',
  eventSubType: 'strategic_assessment',
  title: 'Strategic Program Effectiveness Assessment (Triennial)',
  domain: 'Governance',
  date: '2026-07-31',
  time: '13:00',
  timeEnd: '17:00',
  cadence: 'Triennial',
  mandateType: 'policy-driven',
  urgency: 'scheduled',
  policyRefs: ['GV-GB-001', 'CO-CP-001', 'EN-CM-001'],
  owner: 'Administrator',
  ownerRole: 'Administrator',
  summary:
    'Triennial strategic-level assessment of overall program effectiveness across governance, compliance, QAPI, risk, and operations. Output drives the agency 36-month strategic plan and Board-level priorities.',
  regulatoryDriver:
    'GV-GB-001 Governing Body Charter — periodic strategic effectiveness review; OIG CPG + DOJ ECCP alignment with strategic governance.',
  category: 'triennial-governance',
  processFlow: [
    {
      id: 'spe-pre-data',
      label: 'Aggregate 36-month enterprise performance data',
      description: 'Pull 3 years of QAPI, compliance, risk, financial, clinical performance data into a single executive view.',
      instructions:
        '1. Pull 3 years of QAPI annual evaluations\n2. Pull 3 years of compliance annual + biennial reports\n3. Pull risk register trend\n4. Pull financial / operational KPIs\n5. Pull survey + complaint history',
      expectedOutput: '36-month enterprise performance dataset',
      requiredFormIds: ['EN-FM-034'],
      status: 'pending',
      dueOffsetDays: -30,
    },
    {
      id: 'spe-pre-strategy',
      label: 'Draft 36-month strategic effectiveness assessment',
      description: 'Prepare strategic-level evaluation: are we operating an effective regulated agency?',
      instructions:
        '1. Score against strategic dimensions: regulatory posture, clinical outcomes, compliance maturity, risk posture, workforce stability, financial sustainability\n2. Identify strengths, gaps, opportunities, threats\n3. Draft 36-month strategic priorities for Board review',
      expectedOutput: 'Draft Strategic Effectiveness Assessment + draft 36-month priorities',
      status: 'pending',
      dueOffsetDays: -14,
    },
    {
      id: 'spe-during',
      label: 'Strategic effectiveness assessment session — full Board',
      description: 'Board-led session: review the assessment, ratify priorities, set 36-month direction.',
      instructions:
        '1. Administrator presents assessment\n2. Board reviews and challenges\n3. Board ratifies 36-month strategic priorities\n4. Confirm delegation of execution to leadership\n5. Confirm reporting cadence to Board on priorities',
      expectedOutput: 'Board-ratified Strategic Effectiveness Assessment + 36-month priorities',
      status: 'pending',
      dueOffsetDays: 0,
    },
    {
      id: 'spe-post-cascade',
      label: 'Cascade strategic priorities into operating plans',
      description: 'Convert Board-ratified priorities into operating plans for compliance, QAPI, risk, clinical, finance.',
      instructions:
        '1. Each domain lead translates priorities into operating plan\n2. Compliance Officer integrates into next CO-FM-011 work plan\n3. QAPI Lead integrates into next annual evaluation cycle\n4. Confirm Board reporting calendar for priorities',
      expectedOutput: 'Cascaded operating plans for each domain',
      status: 'pending',
      dueOffsetDays: 60,
    },
  ],
  requiredForms: [
    { id: 'spe-f1', label: '36-Month Enterprise Performance Dataset', formId: 'EN-FM-034', status: 'pending', dueOffsetDays: -30 },
    { id: 'spe-f2', label: 'Strategic Effectiveness Assessment Report', formId: 'GV-FM-023', status: 'pending', dueOffsetDays: 0 },
    { id: 'spe-f3', label: 'Board-Ratified 36-Month Priorities', formId: 'GV-FM-009', status: 'pending', dueOffsetDays: 7 },
    { id: 'spe-f4', label: 'Cascaded Operating Plans (per domain)', formId: 'EN-FM-022', status: 'pending', dueOffsetDays: 60 },
  ],
  minutes: {
    status: 'missing',
    dueOffsetDays: 7,
    assignee: 'Administrator',
    requiredSections: [
      'Strategic dimensions reviewed',
      '36-month performance summary',
      'Strengths / gaps / opportunities / threats',
      'Board-ratified priorities',
      'Reporting cadence agreed',
      'Adjournment',
    ],
    signOffRoles: ['Administrator', 'Board Chair'],
  },
  approvals: [
    { id: 'spe-ap-board', targetKind: 'report', targetLabel: 'Board-Ratified 36-Month Priorities', approverRole: 'Board Chair', required: true, escalationDays: 14 },
  ],
  complianceFlags: {
    auditRisk: 'medium',
    overdueAfterDays: 45,
    citation: 'GV-GB-001; OIG CPG + DOJ ECCP strategic-governance alignment',
    surveyorNote:
      'Strategic-level periodic effectiveness assessment evidences active Board oversight of the agency program — a hallmark of mature governance.',
    missingEvidenceIf: ['missing', 'pending'],
  },
  followUps: [
    { id: 'spe-fu1', label: 'Quarterly Board update on strategic priorities', ownerRole: 'Administrator', dueOffsetDays: 90, closureCriteria: 'First quarterly update delivered to Board on each ratified priority.' },
  ],
  dependencies: { feeds: ['EVT-GV-2029-STRATEGIC-TRIENNIAL'] },
  sourceOfTruth: 'app',
  timezone: 'America/Los_Angeles',
};

export const STRATEGIC_EFFECTIVENESS_TRIENNIAL_2029: RegulatoryEvent = {
  ...STRATEGIC_EFFECTIVENESS_TRIENNIAL_2026,
  id: 'EVT-GV-2029-STRATEGIC-TRIENNIAL',
  title: 'Strategic Program Effectiveness Assessment (Triennial) — 2029',
  date: nextOccurrenceDate(STRATEGIC_EFFECTIVENESS_TRIENNIAL_2026.date, 'triennial'),
  urgency: 'scheduled',
  dependencies: { dependsOn: ['strategic_assessment-20260731-01'] },
};

/* ════════════════════════════════════════════════════════════════
   FLAT EXPORT — used by mandatedEventsExpanded.ts to extend the
   MANDATED_EVENTS_EXPANDED array.
   ════════════════════════════════════════════════════════════════ */

export const MULTI_YEAR_EVENTS: RegulatoryEvent[] = [
  // Biennial — start Jul 2026, next Jul 2028
  ENTERPRISE_RISK_BIENNIAL_2026,
  ENTERPRISE_RISK_BIENNIAL_2028,
  POLICY_FRAMEWORK_BIENNIAL_2026,
  POLICY_FRAMEWORK_BIENNIAL_2028,
  WORKFORCE_COMPETENCY_BIENNIAL_2026,
  WORKFORCE_COMPETENCY_BIENNIAL_2028,
  COMPLIANCE_EFFECTIVENESS_BIENNIAL_2026,
  COMPLIANCE_EFFECTIVENESS_BIENNIAL_2028,
  // Annual OIG Work Plan Review (replaces fixed-cadence "OIG-required")
  OIG_WORK_PLAN_REVIEW_2026,
  // Triennial — start Jul 2026, next Jul 2029
  COMPREHENSIVE_COMPLIANCE_TRIENNIAL_2026,
  COMPREHENSIVE_COMPLIANCE_TRIENNIAL_2029,
  EXTERNAL_COMPLIANCE_REVIEW_TRIENNIAL_2026,
  EXTERNAL_COMPLIANCE_REVIEW_TRIENNIAL_2029,
  STRATEGIC_EFFECTIVENESS_TRIENNIAL_2026,
  STRATEGIC_EFFECTIVENESS_TRIENNIAL_2029,
].map((event) => applyEventAlignmentPolicy(event));
