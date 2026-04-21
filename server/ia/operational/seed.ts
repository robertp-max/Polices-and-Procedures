/**
 * Phase 1 Seed Data — Operational & Lifecycle State
 *
 * This is realistic, non-PHI demonstration data for the operational
 * compliance monitoring capability. In production, these records would
 * come from structured live app integrations (Phase 1 live data adapter).
 *
 * Data represents the state of a mid-sized home health agency as of
 * April 2026 — a realistic compliance snapshot with known gaps.
 *
 * PHI minimization: no patient names, DOBs, or chart IDs are included.
 * All clinical references use role/category, not individual identifiers.
 */

import type { OperationalGap, LifecycleAlert } from '../types.js';

/* ─── Overdue / Gap Operational Tasks ──────────────────────────────── */

export const SEED_OPERATIONAL_GAPS: OperationalGap[] = [
  {
    id: 'OG-001',
    type: 'overdue_task',
    title: 'OIG Exclusion Screening — 3 Staff Members Overdue',
    description:
      'Monthly OIG/SAM exclusion screening is overdue for 3 active staff members in clinical operations. Screening cycle requires monthly completion per HR-WM-001.',
    owner: 'HR Director',
    dueDate: '2026-03-31',
    overdueDays: 21,
    linkedPolicyId: 'HR-WM-001',
    linkedFormId: 'HR-FM-014',
    severity: 'critical',
    source: 'operational',
    complianceImpact:
      'Employing an excluded individual can result in False Claims Act liability, exclusion from Medicare/Medicaid billing, and civil monetary penalties per 42 CFR 1001.',
    nextAction:
      'Complete OIG/SAM screening immediately for all 3 flagged staff. Document results in HR-FM-014 and notify Compliance Officer.',
    phase: 1,
  },
  {
    id: 'OG-002',
    type: 'overdue_task',
    title: 'Annual Fire Safety / Emergency Preparedness Training Incomplete',
    description:
      'Annual fire safety and emergency preparedness training completion is below the required 100% threshold. 7 of 23 field staff have not completed the training module as of April 2026.',
    owner: 'Training Coordinator',
    dueDate: '2026-03-15',
    overdueDays: 37,
    linkedPolicyId: 'EN-EP-001',
    linkedFormId: 'HR-FM-023',
    severity: 'high',
    source: 'operational',
    complianceImpact:
      'Incomplete emergency preparedness training creates survey exposure under 42 CFR 484.102 (Emergency Preparedness) and may result in Condition-level deficiency.',
    nextAction:
      'Schedule mandatory make-up training session. Track completion in HR-FM-023 and report status to QA Director by April 30.',
    phase: 1,
  },
  {
    id: 'OG-003',
    type: 'unsigned_form',
    title: 'Plan of Care Authorizations — 4 Unsigned Physician Orders',
    description:
      'Four active patient plans of care have physician authorization signatures pending for more than 14 days. Medicare conditions require physician-signed plan of care prior to billing.',
    owner: 'Clinical Director',
    dueDate: '2026-04-07',
    overdueDays: 14,
    linkedPolicyId: 'CL-CA-001',
    linkedFormId: 'CL-FM-001',
    severity: 'critical',
    source: 'operational',
    complianceImpact:
      'Billing without physician-signed plan of care constitutes a False Claims Act violation and triggers claim denial under 42 CFR 484.60. Per CL-CA-001, no services may be billed until certification is complete.',
    nextAction:
      'Obtain physician signatures immediately. Place claims on billing hold until CL-FM-001 is completed and signed. Notify Compliance.',
    phase: 1,
  },
  {
    id: 'OG-004',
    type: 'incomplete_form',
    title: 'OASIS-E Assessment — 2 Incomplete Submissions',
    description:
      'Two OASIS-E start-of-care assessments have been submitted with incomplete required fields. Missing elements include functional assessment scores and discharge status fields.',
    owner: 'RN Case Manager',
    dueDate: '2026-04-14',
    overdueDays: 7,
    linkedPolicyId: 'CL-CA-001',
    linkedFormId: 'CO-FM-005',
    severity: 'high',
    source: 'operational',
    complianceImpact:
      'Incomplete OASIS submissions affect quality reporting, claims processing accuracy, and can trigger audit findings under Medicare Home Health CoP 42 CFR 484.55.',
    nextAction:
      'RN Case Manager must complete missing OASIS fields and resubmit. QA to review completed assessments before billing cycle.',
    phase: 1,
  },
  {
    id: 'OG-005',
    type: 'missing_artifact',
    title: 'QAPI Meeting Minutes — Q1 2026 Not Documented',
    description:
      'Required Q1 2026 QAPI committee meeting minutes have not been submitted to the Governing Body. Policy GV-GS-002 requires quarterly QAPI reporting with documented minutes.',
    owner: 'Quality Director',
    dueDate: '2026-04-15',
    overdueDays: 6,
    linkedPolicyId: 'QA-QM-001',
    linkedFormId: 'QA-FM-001',
    severity: 'high',
    source: 'operational',
    complianceImpact:
      'Absence of documented QAPI reporting creates Governing Body accountability gap and survey exposure under 42 CFR 484.65 (Quality Assessment and Performance Improvement).',
    nextAction:
      'Quality Director to compile Q1 QAPI meeting minutes in QA-FM-001 and submit to Governing Body within 5 days. Escalate if governing body quorum was not achieved.',
    phase: 1,
  },
  {
    id: 'OG-006',
    type: 'pending_approval',
    title: 'COVID-19 Infection Control Protocol Update — Awaiting Approval',
    description:
      'Revised infection control protocol (EN-IC-003 Rev 2.1) has been in pending approval state for 19 days. Clinical Director review complete; Governing Body approval pending.',
    owner: 'Governing Body Chair',
    dueDate: '2026-04-05',
    overdueDays: 16,
    linkedPolicyId: 'EN-IC-003',
    severity: 'moderate',
    source: 'lifecycle',
    complianceImpact:
      'Operating under an unapproved protocol revision creates documentation inconsistency that may be cited during infection control survey review.',
    nextAction:
      'Schedule emergency Governing Body approval. If full board unavailable, use delegated approval mechanism per GV-GB-001. Update effective date upon approval.',
    phase: 1,
  },
  {
    id: 'OG-007',
    type: 'blocked_workflow',
    title: 'New Employee Onboarding — Background Check Incomplete',
    description:
      '2 new hires in onboarding have pending background check clearances. HR policy HR-WM-002 prohibits patient contact until all background checks and health screenings are cleared.',
    owner: 'HR Manager',
    dueDate: '2026-04-18',
    overdueDays: 3,
    linkedPolicyId: 'HR-WM-002',
    linkedFormId: 'HR-FM-002',
    severity: 'high',
    source: 'operational',
    complianceImpact:
      'Allowing patient contact before background clearance violates Medicare CoP HR requirements and creates liability under negligent hiring standards.',
    nextAction:
      'Do not assign patient visits until HR-FM-002 background check documentation is complete and signed by HR Director. Flag in scheduling system.',
    phase: 1,
  },
  {
    id: 'OG-008',
    type: 'overdue_task',
    title: 'Annual Competency Validation — 5 Staff Past Due',
    description:
      '5 clinical staff members have annual competency validation due dates that have passed. Competency assessments are required under HR-CM-001 on the anniversary hire date.',
    owner: 'Clinical Director',
    dueDate: '2026-03-30',
    overdueDays: 22,
    linkedPolicyId: 'HR-CM-001',
    linkedFormId: 'HR-FM-018',
    severity: 'high',
    source: 'operational',
    complianceImpact:
      'Deploying clinical staff without current competency validation creates survey exposure under 42 CFR 484.115 (Skilled Professional Services) and internal policy HR-CM-001.',
    nextAction:
      'Schedule competency validation sessions for all 5 staff immediately. Remove from patient assignment if competency cannot be validated within 7 days.',
    phase: 1,
  },
  {
    id: 'OG-009',
    type: 'overdue_event',
    title: 'Governing Body Meeting — April 2026 Not Yet Scheduled',
    description:
      'The April 2026 Governing Body meeting has not been scheduled. GV-GB-001 requires monthly meetings with a quorum. Q1 QAPI report and 3 pending policy approvals require Governing Body action.',
    owner: 'Administrator / CEO',
    dueDate: '2026-04-30',
    linkedPolicyId: 'GV-GB-001',
    linkedFormId: 'GV-FM-001',
    severity: 'critical',
    source: 'lifecycle',
    complianceImpact:
      'Failure to convene Governing Body meetings per required schedule is a Condition-level deficiency under 42 CFR 484.105 (Organizational Structure) and may block policy publication and QAPI oversight.',
    nextAction:
      'Schedule April Governing Body meeting immediately. Agenda must include: Q1 QAPI report, 3 pending policy approvals, and infection control protocol update.',
    phase: 1,
  },
  {
    id: 'OG-010',
    type: 'missing_artifact',
    title: 'Employee Health Screening — 4 Annual Screenings Not Documented',
    description:
      '4 clinical staff members are missing annual health screening documentation (TB test, immunization records) required under HR-WM-003. Records should be on file in personnel files.',
    owner: 'HR Director',
    dueDate: '2026-04-01',
    overdueDays: 20,
    linkedPolicyId: 'HR-WM-003',
    linkedFormId: 'HR-FM-005',
    severity: 'moderate',
    source: 'operational',
    complianceImpact:
      'Missing health screening records create survey citation risk under 42 CFR 484.115 and CDC infection control standards. Must be maintained on file per HR-WM-003.',
    nextAction:
      'Obtain and file missing health screening documentation for all 4 staff. HR to verify TB test currency and immunization status. Document in HR-FM-005.',
    phase: 1,
  },
];

/* ─── Policy Lifecycle Alerts ───────────────────────────────────────── */

export const SEED_LIFECYCLE_ALERTS: LifecycleAlert[] = [
  {
    id: 'LA-001',
    policyId: 'GV-GB-001',
    policyTitle: 'Governing Body Structure and Responsibilities',
    state: 'overdue_review',
    owner: 'Compliance Officer',
    approver: 'Governing Body Chair',
    dueDate: '2026-02-28',
    overdueDays: 51,
    severity: 'critical',
    nextAction:
      'Initiate annual review cycle immediately. Assign Clinical Director and Compliance Officer as co-reviewers. Bring revised policy to next Governing Body meeting for approval.',
    blockedBy: 'Governing Body meeting not yet scheduled for April 2026',
  },
  {
    id: 'LA-002',
    policyId: 'CL-CA-001',
    policyTitle: 'Clinical Care Delivery and Plan of Care Standards',
    state: 'pending_approval',
    owner: 'Clinical Director',
    approver: 'Governing Body Chair',
    requestedDate: '2026-03-20',
    dueDate: '2026-04-20',
    overdueDays: 1,
    severity: 'high',
    nextAction:
      'Present revised CL-CA-001 at next Governing Body meeting. Revision includes updated Plan of Care elements and OASIS-E alignment. Approval is time-critical due to effective date.',
    blockedBy: 'Governing Body meeting scheduling',
  },
  {
    id: 'LA-003',
    policyId: 'FN-BC-001',
    policyTitle: 'Billing and Claims Compliance Standards',
    state: 'draft',
    owner: 'Finance Director',
    dueDate: '2026-05-01',
    severity: 'high',
    nextAction:
      'Finance Director to complete draft revision. Route to Compliance Officer for legal review. Policy must be updated to reflect 2026 CMS Home Health Final Rule billing changes.',
  },
  {
    id: 'LA-004',
    policyId: 'IT-DS-001',
    policyTitle: 'Data Security and Cybersecurity Standards',
    state: 'overdue_review',
    owner: 'IT Director',
    approver: 'Administrator / CEO',
    dueDate: '2026-01-31',
    overdueDays: 80,
    severity: 'high',
    nextAction:
      'IT Director to initiate 2026 annual review. Policy must reflect updated HIPAA Security Rule requirements and include updated incident response procedures. Route to CEO for approval.',
  },
  {
    id: 'LA-005',
    policyId: 'HR-WM-001',
    policyTitle: 'Workforce Management and Compliance Screening',
    state: 'awaiting_acknowledgment',
    owner: 'HR Director',
    approver: 'Administrator / CEO',
    requestedDate: '2026-03-01',
    dueDate: '2026-03-31',
    overdueDays: 21,
    severity: 'moderate',
    nextAction:
      'HR Director to ensure all staff have acknowledged the updated HR-WM-001 policy (Rev 3.0). Collect signed acknowledgments using HR-FM-038. Outstanding: 8 of 23 staff.',
  },
  {
    id: 'LA-006',
    policyId: 'QA-QM-001',
    policyTitle: 'Quality Assessment and Performance Improvement Program',
    state: 'approved_unpublished',
    owner: 'Quality Director',
    requestedDate: '2026-04-01',
    dueDate: '2026-04-21',
    severity: 'moderate',
    nextAction:
      'Governing Body approved QA-QM-001 Rev 4.0 on March 28, 2026. Quality Director must publish to policy management system and distribute to all staff. Deadline: today.',
  },
  {
    id: 'LA-007',
    policyId: 'EN-IC-003',
    policyTitle: 'Infection Control: COVID-19 and Respiratory Illness Protocol',
    state: 'pending_approval',
    owner: 'Clinical Director',
    approver: 'Governing Body',
    requestedDate: '2026-04-02',
    dueDate: '2026-04-21',
    severity: 'moderate',
    nextAction:
      'Governing Body must review and approve EN-IC-003 Rev 2.1. Clinical Director to present at next meeting. If meeting cannot be scheduled within 7 days, invoke emergency approval procedure.',
  },
  {
    id: 'LA-008',
    policyId: 'RM-CM-001',
    policyTitle: 'Risk Management and Corrective Action Plan Program',
    state: 'missing_linked_artifact',
    owner: 'Compliance Officer',
    severity: 'moderate',
    nextAction:
      'RM-CM-001 references RM-FM-008 (Corrective Action Plan template) as required. RM-FM-008 form has not been created/linked in the policy management system. Create and link before next audit cycle.',
  },
];
