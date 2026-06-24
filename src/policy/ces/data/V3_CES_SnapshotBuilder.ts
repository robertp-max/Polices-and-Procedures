
/* ═══════════════════════════════════════════════════════════════
   V3 CES Snapshot Builder
   --------------------------------------------------------------
   Converts the V3 seed data into a full ComplianceExecutionSnapshot
   that can be injected into useComplianceExecution via SeededMode.

   This bridges the gap between V3_CES_SeedData (ExecutionUnit[] +
   sprint context) and the shape that production components actually
   consume. Called by the SeededModeProvider's buildSnapshot prop.

   V3_SYNTHETIC_FALLBACK: the adapted snapshot is preview-only. It bypasses
   canonical live stores and is not workflow-action parity.
   ═══════════════════════════════════════════════════════════════

   Design cross-ref (Agent 05 / Agent 19 background): Bridges V3_CES_SeedData (ExecutionUnits, regulatory events) to ComplianceExecutionSnapshot for CES views.
   Aligns with V6_DESIGN.html data models (board columns ~409 with awaiting, calendar ~397, my-tasks ~273, etc.).
   Agent 19 proposals: richer derivation of awaiting/evidence states and meta fields from seeds; support generating boardLanes / eventsBoard data directly from snapshot for one-pass dynamic parity. See V3_CES_SeedData.ts.
 */

import type { ComplianceExecutionSnapshot } from '@/policy/compliance-execution/complianceExecutionStore';
import type { MergedComplianceEvent, MergedExecutionUnit } from '@/policy/compliance-execution/complianceExecutionTypes';
import type { Sprint, SprintMetrics, SprintTrendPoint, DomainRisk, Workflow, OwnerAssignment, ComplianceDomain, DomainRiskLevel } from '@/policy/ces/types';
import type { AuditEvaluation } from '@/policy/audit/auditState';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import {
  V3_ExecutionUnitsSeed,
  V3_SprintContextSeed,
} from './V3_CES_SeedData';

/* ═══════════════════════════════════════════════════════════════
   Seeded Regulatory Events
   These correspond to the parentEventId values in V3_ExecutionUnitsSeed.
   ═══════════════════════════════════════════════════════════════ */

export const V3_REGULATORY_EVENTS: RegulatoryEvent[] = [
  {
    id: 'evt-gb-q2-2026',
    title: 'Q2 Governing Body Meeting',
    domain: 'Governance',
    date: '2026-05-22',
    cadence: 'Quarterly',
    urgency: 'due-soon',
    policyRefs: ['GV-GB-001'],
    owner: 'Patricia Hale',
    ownerRole: 'Governing Body',
    summary: 'Quarterly board oversight: financial review, QA report, strategic updates',
    processFlow: [
      { id: 'gb-s1', label: 'Prepare pre-read packet', description: 'Compile financial statements, QA summary, and strategic items', status: 'complete', dueOffsetDays: -7 },
      { id: 'gb-s2', label: 'Distribute materials', description: 'Send to all board members', status: 'complete', dueOffsetDays: -5 },
      { id: 'gb-s3', label: 'Conduct meeting', description: 'Execute agenda per template', status: 'pending', dueOffsetDays: 0 },
      { id: 'gb-s4', label: 'Finalize minutes', description: 'Document decisions and action items', status: 'pending', dueOffsetDays: 3 },
    ],
    requiredForms: [
      { id: 'FRM-GB-001', label: 'Board Meeting Minutes Template', status: 'in-progress' },
      { id: 'FRM-GB-002', label: 'Financial Oversight Attestation', status: 'pending' },
    ],
    mandateType: 'policy-driven',
    eventSubType: 'governing_body_meeting',
  },
  {
    id: 'evt-qapi-q2-2026',
    title: 'QAPI Committee — Q2 Data Review',
    domain: 'QAPI',
    date: '2026-05-20',
    cadence: 'Quarterly',
    urgency: 'critical',
    policyRefs: ['QA-PG-001', 'QA-PI-001'],
    owner: 'Maria Gonzalez, RN',
    ownerRole: 'DON',
    summary: 'Quarterly quality data compilation, indicator analysis, PIP progress',
    processFlow: [
      { id: 'qapi-s1', label: 'Compile indicator data', description: 'Pull OASIS, HHCAHPS, claims-based measures', status: 'complete', dueOffsetDays: -10 },
      { id: 'qapi-s2', label: 'Run trend analysis', description: 'Compare against prior quarters', status: 'complete', dueOffsetDays: -7 },
      { id: 'qapi-s3', label: 'Draft aggregate report', description: 'DON summary with actionable findings', status: 'in-progress', dueOffsetDays: -3 },
      { id: 'qapi-s4', label: 'DON sign-off', description: 'Final signature on data summary', status: 'pending', dueOffsetDays: -1 },
    ],
    requiredForms: [
      { id: 'QA-FM-020', label: 'QAPI Data Aggregate Summary', status: 'missing' },
      { id: 'FRM-QAPI-020', label: 'PIP Progress Tracker', status: 'complete' },
      { id: 'FRM-QAPI-021', label: 'Indicator Dashboard Export', status: 'complete' },
    ],
    mandateType: 'federal-required',
    eventSubType: 'qapi_meeting',
    complianceFlags: {
      auditRisk: 'high',
      overdueAfterDays: 3,
      missingEvidenceIf: ['missing', 'pending'],
      citation: '42 CFR 484.65(a) — QAPI Program',
    },
  },
  {
    id: 'evt-ipc-tb-2026',
    title: 'Infection Prevention — TB Screening Compliance',
    domain: 'Clinical',
    date: '2026-05-17',
    cadence: 'Annual',
    urgency: 'overdue',
    policyRefs: ['CL-SD-016', 'CL-SD-017'],
    owner: 'James Torres',
    ownerRole: 'Admin Designee',
    summary: 'Annual TB screening documentation for all contract clinical staff',
    processFlow: [
      { id: 'ipc-s1', label: 'Identify contract staff roster', description: 'Pull active contract clinicians', status: 'complete', dueOffsetDays: -14 },
      { id: 'ipc-s2', label: 'Verify screening records', description: 'Cross-reference HR files with TB documentation', status: 'in-progress', dueOffsetDays: -7 },
      { id: 'ipc-s3', label: 'Remediate gaps', description: 'Schedule screenings for non-compliant staff', status: 'pending', dueOffsetDays: -3 },
      { id: 'ipc-s4', label: 'DON attestation', description: 'Sign off on compliance status', status: 'pending', dueOffsetDays: 0 },
    ],
    requiredForms: [
      { id: 'FRM-IPC-003', label: 'Contract Staff TB Log', status: 'missing' },
      { id: 'FRM-IPC-004', label: 'Screening Gap Remediation Plan', status: 'missing' },
      { id: 'FRM-IPC-005', label: 'DON Attestation — Infection Control', status: 'pending' },
    ],
    mandateType: 'federal-required',
    eventSubType: 'ipc_tb_screening',
    complianceFlags: {
      auditRisk: 'critical',
      overdueAfterDays: 0,
      missingEvidenceIf: ['missing'],
      surveyorNote: 'TB screening logs for contract staff incomplete for March–April.',
      citation: '42 CFR 484.70(a) — Infection prevention and control',
    },
  },
  {
    id: 'evt-ep-drill-2026',
    title: 'Emergency Preparedness — Annual Drill After-Action',
    domain: 'Compliance',
    date: '2026-05-24',
    cadence: 'Annual',
    urgency: 'on-track',
    policyRefs: ['RM-EP-001', 'RM-EP-003'],
    owner: 'Elena Vargas',
    ownerRole: 'Systems',
    summary: 'Finalize after-action report for 2026 annual emergency communication drill',
    processFlow: [
      { id: 'ep-s1', label: 'Conduct drill', description: 'Execute emergency communication drill', status: 'complete', dueOffsetDays: -14 },
      { id: 'ep-s2', label: 'Gather feedback', description: 'Collect participant surveys and observer notes', status: 'complete', dueOffsetDays: -7 },
      { id: 'ep-s3', label: 'Draft after-action report', description: 'Compile findings, gaps, recommendations', status: 'complete', dueOffsetDays: -3 },
      { id: 'ep-s4', label: 'Administrator sign-off', description: 'Final approval on after-action report', status: 'pending', dueOffsetDays: 0 },
    ],
    requiredForms: [
      { id: 'FRM-EP-001', label: 'After-Action Report Template', status: 'complete' },
      { id: 'FRM-EP-002', label: 'Drill Participant Log', status: 'complete' },
    ],
    mandateType: 'federal-required',
    eventSubType: 'ep_exercise',
    complianceFlags: {
      auditRisk: 'medium',
      overdueAfterDays: 5,
      citation: '42 CFR 484.102 — Emergency preparedness',
    },
  },
  {
    id: 'evt-hr-files-2026-q1',
    title: 'Personnel File Completeness Audit — Q1 New Hires',
    domain: 'Operations',
    date: '2026-05-08',
    cadence: 'Quarterly',
    urgency: 'complete',
    policyRefs: ['HR-WM-005'],
    owner: 'David Kim, CPA',
    ownerRole: 'Accounting',
    summary: 'Quarterly personnel file review for new hires — licensure, competency, background',
    processFlow: [
      { id: 'hr-s1', label: 'Pull new hire list', description: 'Q1 hires from HRIS', status: 'complete', dueOffsetDays: -10 },
      { id: 'hr-s2', label: 'Audit each file', description: 'Check licensure, competency, background', status: 'complete', dueOffsetDays: -5 },
      { id: 'hr-s3', label: 'Remediate gaps', description: 'Follow up on missing items', status: 'complete', dueOffsetDays: -2 },
      { id: 'hr-s4', label: 'DON & Admin sign-off', description: 'Both sign attestation', status: 'complete', dueOffsetDays: 0 },
    ],
    requiredForms: [
      { id: 'FRM-HR-001', label: 'Personnel File Audit Checklist', status: 'complete' },
      { id: 'FRM-HR-002', label: 'Licensure Verification Log', status: 'complete' },
    ],
    mandateType: 'policy-driven',
    eventSubType: 'personnel_file_audit',
  },
  {
    id: 'evt-hipaa-training-2026',
    title: 'HIPAA Annual Workforce Training — 2026 Cycle',
    domain: 'IT/Security',
    date: '2026-05-30',
    cadence: 'Annual',
    urgency: 'due-soon',
    policyRefs: ['CO-HP-001', 'CO-HP-002', 'HR-TD-001'],
    owner: 'Elena Vargas',
    ownerRole: 'Systems',
    summary: 'Annual HIPAA privacy and security awareness training for all workforce members including contractors',
    processFlow: [
      { id: 'hipaa-s1', label: 'Update training content', description: 'Revise modules for 2026 regulatory changes and breach scenarios', status: 'complete', dueOffsetDays: -21 },
      { id: 'hipaa-s2', label: 'Distribute training assignments', description: 'Push assignments to all active workforce via LMS', status: 'complete', dueOffsetDays: -14 },
      { id: 'hipaa-s3', label: 'Monitor completion rates', description: 'Track progress and send reminders to non-completers', status: 'in-progress', dueOffsetDays: -3 },
      { id: 'hipaa-s4', label: 'Generate compliance attestation', description: 'Document completion rates and remediation plan for non-completers', status: 'pending', dueOffsetDays: 0 },
    ],
    requiredForms: [
      { id: 'FRM-HIPAA-001', label: 'HIPAA Training Completion Roster', status: 'in-progress' },
      { id: 'FRM-HIPAA-002', label: 'Annual HIPAA Attestation — Workforce', status: 'pending' },
      { id: 'FRM-HIPAA-003', label: 'Non-Completer Remediation Plan', status: 'pending' },
    ],
    mandateType: 'federal-required',
    eventSubType: 'hipaa_training',
    complianceFlags: {
      auditRisk: 'high',
      overdueAfterDays: 5,
      missingEvidenceIf: ['missing', 'pending'],
      citation: '45 CFR 164.530(b) — HIPAA Privacy Rule Training',
    },
  },
  {
    id: 'evt-safety-drill-q2',
    title: 'Q2 Fire/Safety Drill & Documentation',
    domain: 'Operations',
    date: '2026-05-15',
    cadence: 'Quarterly',
    urgency: 'missing-evidence',
    policyRefs: ['RM-EP-002', 'RM-EP-001', 'RM-SS-001'],
    owner: 'James Torres',
    ownerRole: 'Admin Designee',
    summary: 'Quarterly fire safety drill for office and field staff with documentation of participation and corrective actions',
    processFlow: [
      { id: 'safety-s1', label: 'Schedule drill', description: 'Coordinate date with building management and field supervisors', status: 'complete', dueOffsetDays: -14 },
      { id: 'safety-s2', label: 'Conduct drill', description: 'Execute fire evacuation drill for office staff; virtual scenario for field staff', status: 'complete', dueOffsetDays: -7 },
      { id: 'safety-s3', label: 'Collect participation logs', description: 'Gather sign-in sheets and field acknowledgments', status: 'in-progress', dueOffsetDays: -3 },
      { id: 'safety-s4', label: 'File documentation', description: 'Upload completed forms and after-action notes to compliance folder', status: 'pending', dueOffsetDays: 0 },
    ],
    requiredForms: [
      { id: 'FRM-SAFETY-001', label: 'Fire Drill Participation Log', status: 'missing' },
      { id: 'FRM-SAFETY-002', label: 'Drill After-Action Summary', status: 'missing' },
      { id: 'FRM-SAFETY-003', label: 'Corrective Action Tracker', status: 'pending' },
    ],
    mandateType: 'federal-required',
    eventSubType: 'safety_drill',
    complianceFlags: {
      auditRisk: 'high',
      overdueAfterDays: 0,
      missingEvidenceIf: ['missing'],
      surveyorNote: 'Q2 drill participation logs not located in compliance folder.',
      citation: '42 CFR 484.102(d) — Emergency preparedness training and testing',
    },
  },
  {
    id: 'evt-policy-annual-review',
    title: 'Annual Policy & Procedure Review Cycle',
    domain: 'Governance',
    date: '2026-05-28',
    cadence: 'Annual',
    urgency: 'on-track',
    policyRefs: ['GV-PM-001', 'GV-PM-002', 'GV-GB-003'],
    owner: 'Patricia Hale',
    ownerRole: 'Governing Body',
    summary: 'Annual review and re-approval of all agency policies and procedures by governing body',
    processFlow: [
      { id: 'polrev-s1', label: 'Inventory current policies', description: 'Generate master list of all active policies with last-reviewed dates', status: 'complete', dueOffsetDays: -30 },
      { id: 'polrev-s2', label: 'Department review', description: 'Route policies to department heads for updates and red-line edits', status: 'complete', dueOffsetDays: -14 },
      { id: 'polrev-s3', label: 'Legal/compliance review', description: 'Verify alignment with current regulations and accreditation standards', status: 'in-progress', dueOffsetDays: -5 },
      { id: 'polrev-s4', label: 'Governing body approval', description: 'Present updated policies for formal adoption at board meeting', status: 'pending', dueOffsetDays: 0 },
      { id: 'polrev-s5', label: 'Distribute updated policies', description: 'Publish approved versions and archive superseded documents', status: 'pending', dueOffsetDays: 5 },
    ],
    requiredForms: [
      { id: 'FRM-POL-001', label: 'Policy Review Tracking Matrix', status: 'in-progress' },
      { id: 'FRM-POL-002', label: 'Governing Body Approval Resolution', status: 'pending' },
      { id: 'FRM-POL-003', label: 'Policy Change Summary Log', status: 'in-progress' },
    ],
    mandateType: 'policy-driven',
    eventSubType: 'policy_annual_review',
    complianceFlags: {
      auditRisk: 'medium',
      overdueAfterDays: 10,
      citation: '42 CFR 484.105(b) — Governing body responsibilities',
    },
  },
  {
    id: 'evt-infection-surveillance',
    title: 'Monthly Infection Surveillance Reporting — May',
    domain: 'Clinical',
    date: '2026-05-25',
    cadence: 'Monthly',
    urgency: 'scheduled',
    policyRefs: ['CL-SD-016', 'CL-SD-017', 'QA-PI-001'],
    owner: 'Maria Gonzalez, RN',
    ownerRole: 'DON',
    summary: 'Monthly aggregation and reporting of infection surveillance data including CLABSI, CAUTI, and wound infections',
    processFlow: [
      { id: 'infsurv-s1', label: 'Collect field reports', description: 'Gather clinician-reported infection indicators from visit notes', status: 'complete', dueOffsetDays: -7 },
      { id: 'infsurv-s2', label: 'Aggregate data', description: 'Compile monthly totals by infection type and patient population', status: 'in-progress', dueOffsetDays: -3 },
      { id: 'infsurv-s3', label: 'Identify trends', description: 'Flag any rates exceeding baseline thresholds for escalation', status: 'pending', dueOffsetDays: -1 },
      { id: 'infsurv-s4', label: 'Submit to QAPI', description: 'Forward summary to QAPI committee for quarterly integration', status: 'pending', dueOffsetDays: 0 },
    ],
    requiredForms: [
      { id: 'FRM-IPC-010', label: 'Monthly Infection Surveillance Log', status: 'in-progress' },
      { id: 'FRM-IPC-011', label: 'Threshold Exceedance Alert Form', status: 'pending' },
    ],
    mandateType: 'federal-required',
    eventSubType: 'infection_surveillance',
    complianceFlags: {
      auditRisk: 'medium',
      overdueAfterDays: 3,
      missingEvidenceIf: ['missing'],
      citation: '42 CFR 484.70(a) — Infection prevention and control',
    },
  },
  {
    id: 'evt-staff-competency-q2',
    title: 'Q2 Staff Competency Evaluations',
    domain: 'Clinical',
    date: '2026-05-19',
    cadence: 'Quarterly',
    urgency: 'overdue',
    policyRefs: ['CO-CP-001', 'CL-CD-002', 'HR-WM-005'],
    owner: 'Maria Gonzalez, RN',
    ownerRole: 'DON',
    summary: 'Quarterly competency evaluations for clinical staff including skills validation and supervisory assessments',
    processFlow: [
      { id: 'comp-s1', label: 'Generate evaluation roster', description: 'Identify staff due for Q2 competency assessment', status: 'complete', dueOffsetDays: -14 },
      { id: 'comp-s2', label: 'Conduct direct observations', description: 'Supervisors perform ride-along or simulated skill checks', status: 'complete', dueOffsetDays: -7 },
      { id: 'comp-s3', label: 'Complete evaluation forms', description: 'Document findings and scores on standardized competency tools', status: 'in-progress', dueOffsetDays: -3 },
      { id: 'comp-s4', label: 'Remediation plans', description: 'Create improvement plans for staff below threshold', status: 'pending', dueOffsetDays: 0 },
      { id: 'comp-s5', label: 'DON review and sign-off', description: 'Final review of all evaluations and remediation plans', status: 'pending', dueOffsetDays: 3 },
    ],
    requiredForms: [
      { id: 'FRM-COMP-001', label: 'Clinical Competency Evaluation Tool', status: 'in-progress' },
      { id: 'FRM-COMP-002', label: 'Supervisory Observation Checklist', status: 'missing' },
      { id: 'FRM-COMP-003', label: 'Competency Remediation Plan Template', status: 'pending' },
    ],
    mandateType: 'federal-required',
    eventSubType: 'staff_competency',
    complianceFlags: {
      auditRisk: 'critical',
      overdueAfterDays: 0,
      missingEvidenceIf: ['missing', 'pending'],
      surveyorNote: 'Several Q2 supervisory observation forms not completed by due date.',
      citation: '42 CFR 484.80(d) — Personnel qualifications and competency',
    },
  },
  {
    id: 'evt-financial-oversight-q2',
    title: 'Q2 Financial Oversight Committee Review',
    domain: 'Finance',
    date: '2026-05-23',
    cadence: 'Quarterly',
    urgency: 'blocked',
    policyRefs: ['FN-FP-001', 'GV-GB-002', 'FN-BC-002'],
    owner: 'David Kim, CPA',
    ownerRole: 'Accounting',
    summary: 'Quarterly financial oversight review including revenue cycle analysis, accounts receivable aging, and budget variance reporting',
    processFlow: [
      { id: 'finov-s1', label: 'Compile financial reports', description: 'Generate P&L, balance sheet, AR aging, and budget variance reports', status: 'complete', dueOffsetDays: -10 },
      { id: 'finov-s2', label: 'Analyze revenue cycle', description: 'Review claims denial rates, days in AR, and collection efficiency', status: 'complete', dueOffsetDays: -7 },
      { id: 'finov-s3', label: 'Prepare committee packet', description: 'Consolidate findings into board-ready presentation format', status: 'in-progress', dueOffsetDays: -3 },
      { id: 'finov-s4', label: 'Committee review meeting', description: 'Present findings to financial oversight committee for discussion', status: 'pending', dueOffsetDays: 0 },
      { id: 'finov-s5', label: 'Document decisions', description: 'Record committee decisions and corrective action directives', status: 'pending', dueOffsetDays: 3 },
    ],
    requiredForms: [
      { id: 'FRM-FIN-001', label: 'Quarterly Financial Summary Report', status: 'in-progress' },
      { id: 'FRM-FIN-002', label: 'AR Aging Analysis Worksheet', status: 'complete' },
      { id: 'FRM-FIN-003', label: 'Budget Variance Explanation Form', status: 'missing' },
      { id: 'FRM-FIN-004', label: 'Financial Oversight Committee Minutes', status: 'pending' },
    ],
    mandateType: 'policy-driven',
    eventSubType: 'financial_oversight',
    complianceFlags: {
      auditRisk: 'high',
      overdueAfterDays: 5,
      missingEvidenceIf: ['missing'],
      surveyorNote: 'Budget variance explanation not available — committee meeting blocked pending missing report.',
      citation: '42 CFR 484.105(b) — Governing body financial oversight',
    },
  },
  // April 2026 events (past — mostly complete/on-track)
  {
    id: 'evt-infection-surveillance-apr',
    title: 'Monthly Infection Surveillance Reporting — April',
    domain: 'Clinical',
    date: '2026-04-25',
    cadence: 'Monthly',
    urgency: 'complete',
    policyRefs: ['CL-SD-016', 'CL-SD-017', 'QA-PI-001'],
    owner: 'Maria Gonzalez, RN',
    ownerRole: 'DON',
    summary: 'Monthly aggregation and reporting of infection surveillance data including CLABSI, CAUTI, and wound infections',
    processFlow: [
      { id: 'infsurv-apr-s1', label: 'Collect field reports', description: 'Gather clinician-reported infection indicators from visit notes', status: 'complete', dueOffsetDays: -7 },
      { id: 'infsurv-apr-s2', label: 'Aggregate data', description: 'Compile monthly totals by infection type and patient population', status: 'complete', dueOffsetDays: -3 },
      { id: 'infsurv-apr-s3', label: 'Identify trends', description: 'Flag any rates exceeding baseline thresholds for escalation', status: 'complete', dueOffsetDays: -1 },
      { id: 'infsurv-apr-s4', label: 'Submit to QAPI', description: 'Forward summary to QAPI committee for quarterly integration', status: 'complete', dueOffsetDays: 0 },
    ],
    requiredForms: [
      { id: 'FRM-IPC-010', label: 'Monthly Infection Surveillance Log', status: 'complete' },
      { id: 'FRM-IPC-011', label: 'Threshold Exceedance Alert Form', status: 'complete' },
    ],
    mandateType: 'federal-required',
    eventSubType: 'infection_surveillance',
  },
  {
    id: 'evt-personnel-file-q1-audit',
    title: 'Personnel File Completeness Audit — Q1 New Hires',
    domain: 'Operations',
    date: '2026-04-10',
    cadence: 'Quarterly',
    urgency: 'complete',
    policyRefs: ['HR-WM-005'],
    owner: 'David Kim, CPA',
    ownerRole: 'Accounting',
    summary: 'Quarterly personnel file review for new hires — licensure, competency, background',
    processFlow: [
      { id: 'hr-q1-s1', label: 'Pull new hire list', description: 'Q1 hires from HRIS', status: 'complete', dueOffsetDays: -10 },
      { id: 'hr-q1-s2', label: 'Audit each file', description: 'Check licensure, competency, background', status: 'complete', dueOffsetDays: -5 },
      { id: 'hr-q1-s3', label: 'Remediate gaps', description: 'Follow up on missing items', status: 'complete', dueOffsetDays: -2 },
      { id: 'hr-q1-s4', label: 'DON & Admin sign-off', description: 'Both sign attestation', status: 'complete', dueOffsetDays: 0 },
    ],
    requiredForms: [
      { id: 'FRM-HR-001', label: 'Personnel File Audit Checklist', status: 'complete' },
      { id: 'FRM-HR-002', label: 'Licensure Verification Log', status: 'complete' },
    ],
    mandateType: 'policy-driven',
    eventSubType: 'personnel_file_audit',
  },
  {
    id: 'evt-oasis-accuracy-apr',
    title: 'OASIS Accuracy Audit — April Sample Review',
    domain: 'Clinical',
    date: '2026-04-18',
    cadence: 'Monthly',
    urgency: 'on-track',
    policyRefs: ['CL-OA-001', 'QA-PI-002'],
    owner: 'Maria Gonzalez, RN',
    ownerRole: 'DON',
    summary: 'Monthly OASIS data accuracy review on random sample of start-of-care and resumption assessments',
    processFlow: [
      { id: 'oas-apr-s1', label: 'Select audit sample', description: 'Random 10% of April SOC and ROC assessments', status: 'complete', dueOffsetDays: -5 },
      { id: 'oas-apr-s2', label: 'Compare to documentation', description: 'Cross-reference OASIS responses with visit notes and clinician narratives', status: 'complete', dueOffsetDays: -2 },
      { id: 'oas-apr-s3', label: 'Document discrepancies', description: 'Log coding errors and training opportunities', status: 'in-progress', dueOffsetDays: 0 },
      { id: 'oas-apr-s4', label: 'Educate clinicians', description: 'Provide targeted feedback and re-training', status: 'pending', dueOffsetDays: 5 },
    ],
    requiredForms: [
      { id: 'FRM-OAS-001', label: 'OASIS Audit Worksheet', status: 'in-progress' },
      { id: 'FRM-OAS-002', label: 'Coding Discrepancy Log', status: 'pending' },
    ],
    mandateType: 'federal-required',
    eventSubType: 'oasis_accuracy_audit',
  },
  // June 2026 events (scheduled/on-track/due-soon)
  {
    id: 'evt-infection-surveillance-jun',
    title: 'Monthly Infection Surveillance Reporting — June',
    domain: 'Clinical',
    date: '2026-06-25',
    cadence: 'Monthly',
    urgency: 'scheduled',
    policyRefs: ['CL-SD-016', 'CL-SD-017', 'QA-PI-001'],
    owner: 'Maria Gonzalez, RN',
    ownerRole: 'DON',
    summary: 'Monthly aggregation and reporting of infection surveillance data including CLABSI, CAUTI, and wound infections',
    processFlow: [
      { id: 'infsurv-jun-s1', label: 'Collect field reports', description: 'Gather clinician-reported infection indicators from visit notes', status: 'pending', dueOffsetDays: -7 },
      { id: 'infsurv-jun-s2', label: 'Aggregate data', description: 'Compile monthly totals by infection type and patient population', status: 'pending', dueOffsetDays: -3 },
      { id: 'infsurv-jun-s3', label: 'Identify trends', description: 'Flag any rates exceeding baseline thresholds for escalation', status: 'pending', dueOffsetDays: -1 },
      { id: 'infsurv-jun-s4', label: 'Submit to QAPI', description: 'Forward summary to QAPI committee for quarterly integration', status: 'pending', dueOffsetDays: 0 },
    ],
    requiredForms: [
      { id: 'FRM-IPC-010', label: 'Monthly Infection Surveillance Log', status: 'pending' },
      { id: 'FRM-IPC-011', label: 'Threshold Exceedance Alert Form', status: 'pending' },
    ],
    mandateType: 'federal-required',
    eventSubType: 'infection_surveillance',
  },
  {
    id: 'evt-hhcahps-q2-survey',
    title: 'HHCAHPS Patient Satisfaction Survey — Q2 Administration',
    domain: 'QAPI',
    date: '2026-06-15',
    cadence: 'Quarterly',
    urgency: 'on-track',
    policyRefs: ['QA-SM-003', 'QA-PI-003'],
    owner: 'Patricia Hale',
    ownerRole: 'Governing Body',
    summary: 'Quarterly Home Health CAHPS survey administration and results review for patient experience metrics',
    processFlow: [
      { id: 'hhcahps-s1', label: 'Generate eligible patient list', description: 'Identify patients discharged in prior 6 months per CMS sampling', status: 'complete', dueOffsetDays: -14 },
      { id: 'hhcahps-s2', label: 'Administer survey', description: 'Mail or telephone survey to sampled patients', status: 'in-progress', dueOffsetDays: -7 },
      { id: 'hhcahps-s3', label: 'Collect responses', description: 'Aggregate completed surveys and calculate domain scores', status: 'pending', dueOffsetDays: 0 },
      { id: 'hhcahps-s4', label: 'Present to QAPI', description: 'Review results and identify improvement opportunities', status: 'pending', dueOffsetDays: 7 },
    ],
    requiredForms: [
      { id: 'FRM-HHCAHPS-001', label: 'HHCAHPS Sampling Frame', status: 'complete' },
      { id: 'FRM-HHCAHPS-002', label: 'Survey Administration Log', status: 'in-progress' },
      { id: 'FRM-HHCAHPS-003', label: 'Domain Score Summary', status: 'pending' },
    ],
    mandateType: 'federal-required',
    eventSubType: 'hhcahps_survey',
  },
  {
    id: 'evt-claims-denial-jun',
    title: 'Claims Denial Root Cause Analysis — June Cycle',
    domain: 'Finance',
    date: '2026-06-08',
    cadence: 'Monthly',
    urgency: 'due-soon',
    policyRefs: ['FN-BC-001', 'FN-BC-002'],
    owner: 'David Kim, CPA',
    ownerRole: 'Accounting',
    summary: 'Monthly review of denied claims to identify patterns in coding, documentation, or authorization issues',
    processFlow: [
      { id: 'den-s1', label: 'Pull denial report', description: 'Export all June denials from billing system', status: 'complete', dueOffsetDays: -5 },
      { id: 'den-s2', label: 'Categorize root causes', description: 'Group by reason code and payer', status: 'in-progress', dueOffsetDays: -2 },
      { id: 'den-s3', label: 'Recommend process fixes', description: 'Draft corrective actions for top denial drivers', status: 'pending', dueOffsetDays: 0 },
      { id: 'den-s4', label: 'Track recovery rate', description: 'Monitor appeal success and net revenue impact', status: 'pending', dueOffsetDays: 10 },
    ],
    requiredForms: [
      { id: 'FRM-DEN-001', label: 'Denial Root Cause Tracker', status: 'in-progress' },
      { id: 'FRM-DEN-002', label: 'Appeal Success Log', status: 'pending' },
    ],
    mandateType: 'policy-driven',
    eventSubType: 'claims_denial_audit',
  },
  // July 2026 events (scheduled)
  {
    id: 'evt-gb-q3-meeting',
    title: 'Q3 Governing Body Meeting',
    domain: 'Governance',
    date: '2026-07-22',
    cadence: 'Quarterly',
    urgency: 'scheduled',
    policyRefs: ['GV-GB-001'],
    owner: 'Patricia Hale',
    ownerRole: 'Governing Body',
    summary: 'Quarterly board oversight: financial review, QA report, strategic updates',
    processFlow: [
      { id: 'gb-q3-s1', label: 'Prepare pre-read packet', description: 'Compile financial statements, QA summary, and strategic items', status: 'pending', dueOffsetDays: -7 },
      { id: 'gb-q3-s2', label: 'Distribute materials', description: 'Send to all board members', status: 'pending', dueOffsetDays: -5 },
      { id: 'gb-q3-s3', label: 'Conduct meeting', description: 'Execute agenda per template', status: 'pending', dueOffsetDays: 0 },
      { id: 'gb-q3-s4', label: 'Finalize minutes', description: 'Document decisions and action items', status: 'pending', dueOffsetDays: 3 },
    ],
    requiredForms: [
      { id: 'FRM-GB-001', label: 'Board Meeting Minutes Template', status: 'pending' },
      { id: 'FRM-GB-002', label: 'Financial Oversight Attestation', status: 'pending' },
    ],
    mandateType: 'policy-driven',
    eventSubType: 'governing_body_meeting',
  },
  {
    id: 'evt-qapi-q3-review',
    title: 'QAPI Committee — Q3 Data Review',
    domain: 'QAPI',
    date: '2026-07-18',
    cadence: 'Quarterly',
    urgency: 'scheduled',
    policyRefs: ['QA-PG-001', 'QA-PI-001'],
    owner: 'Maria Gonzalez, RN',
    ownerRole: 'DON',
    summary: 'Quarterly quality data compilation, indicator analysis, PIP progress',
    processFlow: [
      { id: 'qapi-q3-s1', label: 'Compile indicator data', description: 'Pull OASIS, HHCAHPS, claims-based measures', status: 'pending', dueOffsetDays: -10 },
      { id: 'qapi-q3-s2', label: 'Run trend analysis', description: 'Compare against prior quarters', status: 'pending', dueOffsetDays: -7 },
      { id: 'qapi-q3-s3', label: 'Draft aggregate report', description: 'DON summary with actionable findings', status: 'pending', dueOffsetDays: -3 },
      { id: 'qapi-q3-s4', label: 'DON sign-off', description: 'Final signature on data summary', status: 'pending', dueOffsetDays: -1 },
    ],
    requiredForms: [
      { id: 'QA-FM-020', label: 'QAPI Data Aggregate Summary', status: 'pending' },
      { id: 'FRM-QAPI-020', label: 'PIP Progress Tracker', status: 'pending' },
      { id: 'FRM-QAPI-021', label: 'Indicator Dashboard Export', status: 'pending' },
    ],
    mandateType: 'federal-required',
    eventSubType: 'qapi_meeting',
  },
  {
    id: 'evt-medrec-review-jul',
    title: 'Medication Reconciliation Compliance Review — July',
    domain: 'Clinical',
    date: '2026-07-05',
    cadence: 'Monthly',
    urgency: 'scheduled',
    policyRefs: ['CL-SD-012', 'CL-SD-016'],
    owner: 'James Torres',
    ownerRole: 'Admin Designee',
    summary: 'Monthly audit of medication reconciliation completion at admission, transfer, and discharge',
    processFlow: [
      { id: 'med-jul-s1', label: 'Pull admission/discharge list', description: 'Identify all July admissions, transfers, and discharges', status: 'pending', dueOffsetDays: -3 },
      { id: 'med-jul-s2', label: 'Verify reconciliation forms', description: 'Check for completed med lists and physician orders', status: 'pending', dueOffsetDays: 0 },
      { id: 'med-jul-s3', label: 'Flag discrepancies', description: 'Document any missed medications or incomplete reviews', status: 'pending', dueOffsetDays: 2 },
      { id: 'med-jul-s4', label: 'Educate and correct', description: 'Provide feedback and ensure follow-up documentation', status: 'pending', dueOffsetDays: 5 },
    ],
    requiredForms: [
      { id: 'FRM-MED-001', label: 'Medication Reconciliation Audit Log', status: 'pending' },
      { id: 'FRM-MED-002', label: 'Discrepancy Correction Form', status: 'pending' },
    ],
    mandateType: 'federal-required',
    eventSubType: 'medication_reconciliation',
  },
  // August 2026 events (scheduled)
  {
    id: 'evt-infection-surveillance-aug',
    title: 'Monthly Infection Surveillance Reporting — August',
    domain: 'Clinical',
    date: '2026-08-25',
    cadence: 'Monthly',
    urgency: 'scheduled',
    policyRefs: ['CL-SD-016', 'CL-SD-017', 'QA-PI-001'],
    owner: 'Maria Gonzalez, RN',
    ownerRole: 'DON',
    summary: 'Monthly aggregation and reporting of infection surveillance data including CLABSI, CAUTI, and wound infections',
    processFlow: [
      { id: 'infsurv-aug-s1', label: 'Collect field reports', description: 'Gather clinician-reported infection indicators from visit notes', status: 'pending', dueOffsetDays: -7 },
      { id: 'infsurv-aug-s2', label: 'Aggregate data', description: 'Compile monthly totals by infection type and patient population', status: 'pending', dueOffsetDays: -3 },
      { id: 'infsurv-aug-s3', label: 'Identify trends', description: 'Flag any rates exceeding baseline thresholds for escalation', status: 'pending', dueOffsetDays: -1 },
      { id: 'infsurv-aug-s4', label: 'Submit to QAPI', description: 'Forward summary to QAPI committee for quarterly integration', status: 'pending', dueOffsetDays: 0 },
    ],
    requiredForms: [
      { id: 'FRM-IPC-010', label: 'Monthly Infection Surveillance Log', status: 'pending' },
      { id: 'FRM-IPC-011', label: 'Threshold Exceedance Alert Form', status: 'pending' },
    ],
    mandateType: 'federal-required',
    eventSubType: 'infection_surveillance',
  },
  {
    id: 'evt-ep-tabletop-aug',
    title: 'Emergency Preparedness Tabletop Exercise — Annual',
    domain: 'Compliance',
    date: '2026-08-12',
    cadence: 'Annual',
    urgency: 'scheduled',
    policyRefs: ['RM-EP-001', 'RM-EP-002'],
    owner: 'Elena Vargas',
    ownerRole: 'Systems',
    summary: 'Annual tabletop exercise testing emergency communication and continuity of operations plan',
    processFlow: [
      { id: 'ep-aug-s1', label: 'Design scenario', description: 'Develop realistic emergency scenario involving communication failure', status: 'pending', dueOffsetDays: -14 },
      { id: 'ep-aug-s2', label: 'Conduct tabletop', description: 'Facilitate discussion-based exercise with leadership team', status: 'pending', dueOffsetDays: -7 },
      { id: 'ep-aug-s3', label: 'Document findings', description: 'Record gaps and improvement actions from exercise', status: 'pending', dueOffsetDays: 0 },
      { id: 'ep-aug-s4', label: 'Update COOP', description: 'Revise continuity of operations plan based on lessons learned', status: 'pending', dueOffsetDays: 14 },
    ],
    requiredForms: [
      { id: 'FRM-EP-003', label: 'Tabletop Exercise After-Action Report', status: 'pending' },
      { id: 'FRM-EP-004', label: 'Continuity of Operations Update Log', status: 'pending' },
    ],
    mandateType: 'federal-required',
    eventSubType: 'ep_tabletop_exercise',
  },
  {
    id: 'evt-accred-readiness-aug',
    title: 'Accreditation Survey Readiness Assessment',
    domain: 'Operations',
    date: '2026-08-20',
    cadence: 'Annual',
    urgency: 'scheduled',
    policyRefs: ['CO-RA-003', 'GV-PM-001'],
    owner: 'Robert Chen',
    ownerRole: 'Administrator',
    summary: 'Comprehensive readiness review in preparation for upcoming accreditation survey',
    processFlow: [
      { id: 'acc-s1', label: 'Self-assessment checklist', description: 'Complete full accreditation standards checklist', status: 'pending', dueOffsetDays: -10 },
      { id: 'acc-s2', label: 'Mock tracer activity', description: 'Simulate surveyor review of clinical records and policies', status: 'pending', dueOffsetDays: -5 },
      { id: 'acc-s3', label: 'Remediate findings', description: 'Address any identified gaps in documentation or process', status: 'pending', dueOffsetDays: 0 },
      { id: 'acc-s4', label: 'Final leadership briefing', description: 'Present readiness status and open items to admin team', status: 'pending', dueOffsetDays: 7 },
    ],
    requiredForms: [
      { id: 'FRM-ACCR-001', label: 'Accreditation Readiness Checklist', status: 'pending' },
      { id: 'FRM-ACCR-002', label: 'Tracer Findings Log', status: 'pending' },
      { id: 'FRM-ACCR-003', label: 'Corrective Action Plan', status: 'pending' },
    ],
    mandateType: 'policy-driven',
    eventSubType: 'accreditation_readiness',
  },
  // Added to match all parentEventId refs in V3_ExecutionUnitsSeed (fix records that would not appear / link)
  {
    id: 'evt-gb-q2-apr',
    title: 'Q2 Governing Body Meeting — April',
    domain: 'Governance',
    date: '2026-04-22',
    cadence: 'Quarterly',
    urgency: 'complete',
    policyRefs: ['GV-GB-001'],
    owner: 'Patricia Hale',
    ownerRole: 'Governing Body',
    summary: 'April quarterly board oversight closeout',
    processFlow: [
      { id: 'gb-apr-s1', label: 'Prepare pre-read', description: '', status: 'complete', dueOffsetDays: -7 },
      { id: 'gb-apr-s4', label: 'Finalize minutes', description: '', status: 'complete', dueOffsetDays: 3 },
    ],
    requiredForms: [{ id: 'FRM-GB-001', label: 'Board Minutes', status: 'complete' }],
    mandateType: 'policy-driven',
    eventSubType: 'governing_body_meeting',
  },
  {
    id: 'evt-qapi-q2-apr',
    title: 'QAPI Committee — Q2 Data Review April',
    domain: 'QAPI',
    date: '2026-04-18',
    cadence: 'Quarterly',
    urgency: 'complete',
    policyRefs: ['QA-PG-001'],
    owner: 'Maria Gonzalez, RN',
    ownerRole: 'DON',
    summary: 'April QAPI data review',
    processFlow: [{ id: 'qapi-apr-s4', label: 'DON sign-off', description: '', status: 'complete', dueOffsetDays: 0 }],
    requiredForms: [{ id: 'QA-FM-020', label: 'QAPI Summary', status: 'complete' }],
    mandateType: 'federal-required',
    eventSubType: 'qapi_meeting',
  },
  {
    id: 'evt-ipc-tb-jun',
    title: 'Infection Prevention — TB Screening June',
    domain: 'Clinical',
    date: '2026-06-17',
    cadence: 'Annual',
    urgency: 'due-soon',
    policyRefs: ['CL-SD-016'],
    owner: 'James Torres',
    ownerRole: 'Admin Designee',
    summary: 'June TB screening compliance',
    processFlow: [{ id: 'ipc-jun-s3', label: 'Remediate gaps', status: 'pending', dueOffsetDays: -3, description: 'Remediate compliance gaps' }],
    requiredForms: [{ id: 'FRM-IPC-003', label: 'TB Log', status: 'pending' }],
    mandateType: 'federal-required',
    eventSubType: 'ipc_tb_screening',
  },
  {
    id: 'evt-ep-drill-jun',
    title: 'Emergency Preparedness — June Drill',
    domain: 'Compliance',
    date: '2026-06-24',
    cadence: 'Annual',
    urgency: 'on-track',
    policyRefs: ['RM-EP-001'],
    owner: 'Elena Vargas',
    ownerRole: 'Systems',
    summary: 'June drill after-action',
    processFlow: [{ id: 'ep-jun-s4', label: 'Sign-off', status: 'pending', dueOffsetDays: 0, description: 'Final sign-off' }],
    requiredForms: [{ id: 'FRM-EP-001', label: 'After-Action', status: 'pending' }],
    mandateType: 'federal-required',
    eventSubType: 'ep_exercise',
  },
  {
    id: 'evt-hr-files-jun',
    title: 'Personnel File Completeness Audit — June',
    domain: 'Operations',
    date: '2026-06-08',
    cadence: 'Quarterly',
    urgency: 'on-track',
    policyRefs: ['HR-WM-005'],
    owner: 'David Kim, CPA',
    ownerRole: 'Accounting',
    summary: 'June personnel file audit',
    processFlow: [{ id: 'hr-jun-s4', label: 'Sign-off', status: 'pending', dueOffsetDays: 0, description: 'Personnel file sign-off' }],
    requiredForms: [{ id: 'FRM-HR-001', label: 'Checklist', status: 'pending' }],
    mandateType: 'policy-driven',
    eventSubType: 'personnel_file_audit',
  },
  {
    id: 'evt-hipaa-training-jun',
    title: 'HIPAA Annual Workforce Training — June Cycle',
    domain: 'IT/Security',
    date: '2026-06-30',
    cadence: 'Annual',
    urgency: 'due-soon',
    policyRefs: ['CO-HP-001'],
    owner: 'Elena Vargas',
    ownerRole: 'Systems',
    summary: 'June HIPAA training cycle',
    processFlow: [{ id: 'hipaa-jun-s3', label: 'Monitor', status: 'in-progress', dueOffsetDays: -3, description: 'Monitor training completion' }],
    requiredForms: [{ id: 'FRM-HIPAA-001', label: 'Roster', status: 'in-progress' }],
    mandateType: 'federal-required',
    eventSubType: 'hipaa_training',
  },
  {
    id: 'evt-policy-annual-review-jun',
    title: 'Annual Policy & Procedure Review — June',
    domain: 'Governance',
    date: '2026-06-28',
    cadence: 'Annual',
    urgency: 'on-track',
    policyRefs: ['GV-PM-001'],
    owner: 'Patricia Hale',
    ownerRole: 'Governing Body',
    summary: 'June policy review cycle',
    processFlow: [{ id: 'pol-jun-s4', label: 'Approval', status: 'pending', dueOffsetDays: 0, description: 'Policy approval step' }],
    requiredForms: [{ id: 'FRM-POL-001', label: 'Matrix', status: 'pending' }],
    mandateType: 'policy-driven',
    eventSubType: 'policy_annual_review',
  },
  {
    id: 'evt-safety-drill-jun',
    title: 'Q2 Fire/Safety Drill — June',
    domain: 'Operations',
    date: '2026-06-15',
    cadence: 'Quarterly',
    urgency: 'missing-evidence',
    policyRefs: ['RM-EP-002'],
    owner: 'James Torres',
    ownerRole: 'Admin Designee',
    summary: 'June safety drill',
    processFlow: [{ id: 'safety-jun-s3', label: 'Collect logs', status: 'in-progress', dueOffsetDays: -3, description: 'Collect drill logs' }],
    requiredForms: [{ id: 'FRM-SAFETY-001', label: 'Participation Log', status: 'missing' }],
    mandateType: 'federal-required',
    eventSubType: 'safety_drill',
  },
  {
    id: 'evt-comp-val-jun',
    title: 'Compliance validation checklist — mid-June',
    domain: 'Compliance',
    date: '2026-06-15',
    cadence: 'Monthly',
    urgency: 'scheduled',
    policyRefs: ['CO-CP-001'],
    owner: 'Angela Martinez',
    ownerRole: 'Administrator',
    summary: 'Mid June compliance validation',
    processFlow: [{ id: 'comp-jun-s1', label: 'Checklist', status: 'pending', dueOffsetDays: 0, description: 'Complete validation checklist' }],
    requiredForms: [{ id: 'FRM-COMP-001', label: 'Checklist', status: 'pending' }],
    mandateType: 'policy-driven',
    eventSubType: 'compliance_validation',
  },
];

/* ═══════════════════════════════════════════════════════════════
   Snapshot Builder
   ═══════════════════════════════════════════════════════════════ */

function buildSeededSprint(sw: typeof V3_SprintContextSeed.activeSprint): Sprint {
  return {
    id: sw.id,
    number: sw.number,
    startDate: sw.startDate,
    endDate: sw.endDate,
    label: `Sprint ${sw.number}`,
  };
}

function toCesDomain(domain: string): ComplianceDomain {
  const key = domain.toLowerCase();
  if (key === 'clinical' || key === 'compliance' || key === 'hr' || key === 'governance') {
    return key as ComplianceDomain;
  }
  if (key === 'finance') return 'governance';
  if (key === 'operations' || key === 'qapi' || key === 'it/security') return 'compliance';
  return 'compliance';
}

export function buildV3SeededSnapshot(): ComplianceExecutionSnapshot {
  const { activeSprint: sw, availableSprints } = V3_SprintContextSeed;
  const units = V3_ExecutionUnitsSeed;

  const activeSprint = buildSeededSprint(sw);
  const sprintHistory: Sprint[] = availableSprints
    .filter(s => s.number <= sw.number)
    .map(buildSeededSprint);

  const today = new Date('2026-05-21T12:00:00Z');

  const events: MergedComplianceEvent[] = V3_REGULATORY_EVENTS.map(re => ({
    id: re.id,
    title: re.title,
    category: re.cadence === 'Quarterly' ? 'recurring' as const : 'one-time' as const,
    domain: toCesDomain(re.domain),
    anchorDate: re.date,
    source: 'ces-seed' as const,
    regulatoryRef: re,
  }));

  const executionUnits: MergedExecutionUnit[] = units.map(u => ({
    ...u,
    source: 'ces-seed' as const,
    regulatoryRef: V3_REGULATORY_EVENTS.find(e => e.id === u.parentEventId),
    sourceEventId: u.parentEventId,
  }));

  const completed = units.filter(u => u.complianceState === 'completed').length;
  const blocked = units.filter(u => u.complianceState === 'blocked').length;
  const ready = units.filter(u => u.auditReadiness === 'ready').length;
  const total = units.length || 1;

  const sigMissed = units.filter(u =>
    u.complianceState === 'awaiting_signature' && (u.escalationTimer ?? 0) < 0,
  ).length;
  const upcoming48 = units.filter(u => {
    if (u.complianceState === 'completed') return false;
    const h = u.escalationTimer ?? 9999;
    return h >= 0 && h <= 48;
  }).length;

  const sprintMetrics: SprintMetrics = {
    completionRatePct: Math.round((completed / total) * 100),
    auditReadinessScore: Math.round((ready / total) * 100),
    activeBlockerCount: blocked,
    signatureSlasMissed: sigMissed,
    upcomingDeadlines48hCount: upcoming48,
  };

  const domains: ComplianceDomain[] = ['clinical', 'compliance', 'hr', 'governance'];
  const domainRisks: DomainRisk[] = domains.map(domain => {
    const inDomain = units.filter(u => u.domain === domain);
    const open = inDomain.filter(u => u.complianceState !== 'completed').length;
    const bl = inDomain.filter(u => u.complianceState === 'blocked').length;
    const t = inDomain.length || 1;
    const pct = bl / t;
    const level: DomainRiskLevel = pct >= 0.25 ? 'red' : pct >= 0.10 ? 'yellow' : 'green';
    return { domain, level, openUnits: open, blockedCount: bl, reason: `${open} open, ${bl} blocked` };
  });

  const ownerMap = new Map<string, OwnerAssignment>();
  for (const u of units) {
    const key = u.owner.userId;
    let a = ownerMap.get(key);
    if (!a) {
      a = { owner: u.owner, allocatedUnitCount: 0, overdueUnitCount: 0, pendingSignatureCount: 0, capacityRisk: 'green' };
      ownerMap.set(key, a);
    }
    a.allocatedUnitCount += 1;
    if (u.complianceState === 'blocked' && (u.escalationTimer ?? 0) < 0) a.overdueUnitCount += 1;
    if (u.complianceState === 'awaiting_signature') a.pendingSignatureCount += 1;
  }
  for (const a of ownerMap.values()) {
    const ratio = (a.overdueUnitCount + a.pendingSignatureCount) / Math.max(1, a.allocatedUnitCount);
    a.capacityRisk = ratio >= 0.4 ? 'red' : ratio >= 0.2 ? 'yellow' : 'green';
  }

  const workflows: Workflow[] = Array.from(
    new Map(units.map(u => [u.workflowId, {
      id: u.workflowId,
      eventId: u.parentEventId,
      title: u.workflowId.replace(/^wf-/, '').replace(/-/g, ' '),
      requiredFormIds: [] as string[],
    }])).values(),
  );

  const sprintTrends: SprintTrendPoint[] = sprintHistory.map(s => ({
    sprintNumber: s.number,
    completionRatePct: sprintMetrics.completionRatePct,
    onTimeRatePct: Math.max(0, 100 - sprintMetrics.signatureSlasMissed * 5),
    blockedResolutionHours: sprintMetrics.activeBlockerCount * 8,
    auditReadinessScore: sprintMetrics.auditReadinessScore,
    signatureSlaPct: Math.max(0, 100 - sprintMetrics.signatureSlasMissed * 10),
    carryOverCount: sprintMetrics.activeBlockerCount,
  }));

  const auditEvaluations: Map<string, AuditEvaluation> = new Map();

  return {
    activeSprint,
    sprintHistory,
    today,
    events,
    executionUnits,
    workflows,
    auditEvaluations,
    sprintMetrics,
    sprintTrends,
    domainRisks,
    ownerAssignments: Array.from(ownerMap.values()),
    onboardingBatches: [],
    gateEvaluations: [],
  };
}
