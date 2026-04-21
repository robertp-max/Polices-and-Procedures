/* ═══════════════════════════════════════════════════════════════
   Help Center — structured articles
   Full operational references powering the Help tab + modal in the
   Event Workspace. Each event links to an article by helpArticle.id.
   Tone is internal enterprise / healthcare-operational.
   ═══════════════════════════════════════════════════════════════ */

export interface HelpArticle {
  id: string;
  title: string;
  subtitle?: string;
  overview?: string;
  purpose: string;
  whenRequired: string;
  responsible: string;
  steps: { label: string; detail: string }[];
  formsRequired: { formId: string; label: string; note?: string }[];
  outputs: string[];
  commonMistakes: string[];
  auditTips: string[];
  relatedPolicies: { id: string; label: string }[];
  relatedEventIds: string[];
  estimatedMinutes: number;
  updatedAt: string;
}

export const HELP_ARTICLES: Record<string, HelpArticle> = {

  /* ═════════════════════════════════ QAPI ═══════════════════════════════ */
  'KB-QAPI-001': {
    id: 'KB-QAPI-001',
    title: 'QAPI Committee Meeting — Operating Guide',
    subtitle: 'Monthly committee: preparation, execution, documentation, follow-through',
    overview:
      'The QAPI Committee is the agency\'s performance improvement engine. Monthly meetings must review quality indicators, close prior actions, open new corrective actions where thresholds are breached, and escalate to the Governing Body where warranted.',
    purpose:
      'Operate the monthly QAPI Committee meeting consistently so the agency satisfies Medicare CoPs and its internal QAPI program policy (QA-PG-001), producing auditable evidence of quality oversight.',
    whenRequired:
      'At least once per calendar month. Agenda distributed 5 business days prior. Minutes drafted within 7 calendar days of the meeting. Quarterly summary rolled up to the Governing Body report.',
    responsible:
      'QAPI Coordinator owns preparation and documentation. Committee Chair facilitates. Administrator approves the quarterly roll-up.',
    steps: [
      { label: 'Pre-Meeting Preparation (T-5 business days)',
        detail: 'Refresh the QAPI Data Dashboard (QA-F-014). Confirm standing agenda items, open action items, and any escalations from the prior month. Distribute the agenda (QA-F-010) with the dashboard attached.' },
      { label: 'Meeting Execution (T-0)',
        detail: 'Approve prior minutes, walk through indicator performance, review open action items, identify thresholds breached, and open new corrective actions with explicit owners and due dates.' },
      { label: 'Action Assignment (T-0)',
        detail: 'Record each new action in the QAPI Action Item Tracker (QA-F-013) with owner, due date, linked indicator, and success criteria. Do not close the meeting without assigned owners.' },
      { label: 'Minutes Drafting (T+7 days)',
        detail: 'Draft minutes (QA-F-012) capturing discussion, decisions, votes, and corrective actions. Route to the Committee Chair for finalization.' },
      { label: 'Follow-Through (Continuous)',
        detail: 'Update the action tracker weekly until each item closes. Escalate aging items into the quarterly QAPI report (QA-F-020) and onto the Governing Body packet.' },
    ],
    formsRequired: [
      { formId: 'QA-F-010', label: 'QAPI Meeting Agenda',      note: 'Distribute 5 business days prior.' },
      { formId: 'QA-F-011', label: 'QAPI Attendance Log',      note: 'Quorum evidence.' },
      { formId: 'QA-F-012', label: 'QAPI Minutes Template',    note: 'Draft within 7 days.' },
      { formId: 'QA-F-013', label: 'QAPI Action Item Tracker', note: 'Rolling; carry open items forward.' },
      { formId: 'QA-F-014', label: 'QAPI Data Dashboard',      note: 'Attach to every agenda.' },
    ],
    outputs: [
      'Finalized QAPI minutes filed in audit-ready location.',
      'Updated action item tracker with closure evidence on closed items.',
      'Refreshed indicator dashboard attached to the meeting record.',
      'Quarterly rollup feeding the Governing Body QAPI report.',
    ],
    commonMistakes: [
      'Meeting skipped during a low-volume month — creates a clear CoP gap.',
      'Agenda not distributed within the 5-business-day rule.',
      'Minutes not finalized within 7 calendar days of the meeting.',
      'Corrective actions created without owners, due dates, or success criteria.',
      'Indicators discussed without reference to threshold or trend.',
    ],
    auditTips: [
      'Keep 12 months of signed minutes with attendance logs in the audit-ready folder.',
      'Carry the action item tracker forward so every open item has visible history.',
      'Show the full chain: indicator → threshold breach → action → closure evidence.',
      'Demonstrate escalation to the Governing Body for material items.',
    ],
    relatedPolicies: [
      { id: 'QA-PG-001', label: 'QAPI Program Overview' },
      { id: 'QA-PG-002', label: 'QAPI Data Governance' },
      { id: 'GV-GB-001', label: 'Governing Body Charter' },
    ],
    relatedEventIds: ['EVT-QAPI-MAY-001', 'EVT-QAPI-JUN-001', 'EVT-GB-MAY-001'],
    estimatedMinutes: 12,
    updatedAt: '2026-04-15',
  },

  /* ═════════════════════════════ Governing Body ═════════════════════════ */
  'KB-GV-001': {
    id: 'KB-GV-001',
    title: 'Governing Body Meeting — Preparation & Execution',
    subtitle: 'Quarterly board meeting, packet discipline, required reports, minutes',
    overview:
      'The Governing Body is the agency\'s accountable authority. Each quarterly meeting must receive a timely packet with QAPI, Compliance, and Risk reports, conduct the meeting of record, and produce minutes that anchor corrective action and delegated authority.',
    purpose:
      'Execute every quarterly Governing Body meeting to the governance standard: full packet 7 days prior, required reports delivered, decisions minuted, and survey-ready evidence retained.',
    whenRequired:
      'At least quarterly. Packet + agenda distributed 7 calendar days prior. Quarterly Compliance, QAPI, and Risk reports delivered 7 calendar days prior. Minutes finalized within 7 calendar days after.',
    responsible:
      'Administrator owns preparation. Board Secretary records minutes. Compliance Officer, QAPI Coordinator, and Risk Manager deliver their quarterly reports.',
    steps: [
      { label: 'Packet Assembly (T-10 days)',
        detail: 'Collect prior-meeting minutes, quarterly QAPI / Compliance / Risk reports, financial summary, and any escalations. Confirm each report is signed by its owner.' },
      { label: 'Distribution (T-7 days)',
        detail: 'Release packet via an audit-tracked channel. Capture distribution evidence (send timestamps, read receipts where supported).' },
      { label: 'Pre-Meeting Confirmation (T-2 days)',
        detail: 'Confirm quorum, walk-through any escalated items with the Chair, and pre-stage voting items.' },
      { label: 'Meeting Execution (T-0)',
        detail: 'Approve prior minutes, receive reports, discuss and vote on approvals / delegated actions, acknowledge escalations.' },
      { label: 'Minutes & Retention (T+7 days)',
        detail: 'Draft minutes (GV-F-002). Route for Chair and Secretary signatures at the next meeting. Bind minutes + packet + approvals as the quarter\'s evidence set.' },
    ],
    formsRequired: [
      { formId: 'GV-F-001', label: 'Governing Body Agenda' },
      { formId: 'CO-F-004', label: 'Quarterly Compliance Report' },
      { formId: 'QA-F-020', label: 'Quarterly QAPI Report' },
      { formId: 'RM-F-010', label: 'Quarterly Risk Report' },
      { formId: 'GV-F-002', label: 'Governing Body Minutes' },
    ],
    outputs: [
      'Signed minutes bound with the quarterly packet.',
      'Recorded approvals / delegations with reference to policy.',
      'Escalations acknowledged by the board with follow-up owners.',
      'Distribution evidence retained alongside the packet.',
    ],
    commonMistakes: [
      'Packet distributed late — directly violates the 7-day rule.',
      'Compliance or QAPI report missing from the packet.',
      'Prior-meeting minutes not approved at the next meeting.',
      'Voting items not clearly captured in the minutes.',
      'Attendance log not retained with the evidence set.',
    ],
    auditTips: [
      'Retain packet distribution evidence (email timestamps, delivery receipts).',
      'Bind each quarter as a single audit-ready evidence bundle.',
      'Make prior-minutes approval an explicit agenda item every meeting.',
      'Cross-reference each Governing Body decision to the policy it enforces.',
    ],
    relatedPolicies: [
      { id: 'GV-GB-001', label: 'Governing Body Charter' },
      { id: 'GV-GB-002', label: 'Governance Lifecycle' },
      { id: 'CO-CR-001', label: 'Compliance Reporting Program' },
    ],
    relatedEventIds: ['EVT-GB-MAY-001', 'EVT-CO-MAY-001'],
    estimatedMinutes: 15,
    updatedAt: '2026-03-28',
  },

  /* ═══════════════════════════ Compliance Review ════════════════════════ */
  'KB-CO-001': {
    id: 'KB-CO-001',
    title: 'Compliance Report Review — Quarterly Preparation',
    subtitle: 'Quarterly deliverable: investigations, hotline trends, audit findings, work-plan',
    overview:
      'The quarterly compliance report is the Compliance Officer\'s formal submission to the Governing Body. It documents active and closed investigations, hotline activity, audit findings, training completion, and progress on the annual compliance work-plan.',
    purpose:
      'Prepare a complete, accurate quarterly compliance report and deliver it to the Governing Body packet on time (7 calendar days before the meeting).',
    whenRequired:
      'Each calendar quarter. Delivered 7 calendar days before the quarterly Governing Body meeting. Investigations must be initiated within 7 calendar days of report receipt on a rolling basis.',
    responsible:
      'Compliance Officer prepares the report. Administrator reviews before it enters the Governing Body packet.',
    steps: [
      { label: 'Investigation Close-Out Review',
        detail: 'Summarize investigations closed in the quarter: source, allegation, findings, disposition, and remediation evidence.' },
      { label: 'Active Investigations Status',
        detail: 'List all open investigations with age, assigned investigator, and next milestone. Flag any at-risk of the 7-day initiation rule.' },
      { label: 'Hotline / Reporting Trends',
        detail: 'Report volume, category mix, and any emerging themes. Identify training or policy gaps the pattern reveals.' },
      { label: 'Audit Findings & Remediation',
        detail: 'Summarize internal/external audit findings and their remediation status. Highlight anything unresolved beyond plan.' },
      { label: 'Work-Plan Progress',
        detail: 'Update progress against the annual compliance work-plan. Call out off-track items and proposed corrective action.' },
      { label: 'Delivery',
        detail: 'Submit the finalized report (CO-F-004) into the Governing Body packet no later than 7 calendar days before the meeting.' },
    ],
    formsRequired: [
      { formId: 'CO-F-004', label: 'Quarterly Compliance Report', note: 'Packet deliverable.' },
    ],
    outputs: [
      'Signed quarterly compliance report filed in the audit-ready repository.',
      'Board-approved corrective actions entered into the compliance tracker.',
      'Work-plan updates carried forward into next-quarter priorities.',
    ],
    commonMistakes: [
      'Report delivered inside the 7-day window — creates a timing gap on the packet.',
      'Investigations listed without age or next milestone.',
      'Hotline section missing — or reported without category trend.',
      'Work-plan progress not quantified (no percent or milestone).',
    ],
    auditTips: [
      'Retain every quarterly report with a signed distribution record.',
      'Link investigations referenced in the report back to case files.',
      'Demonstrate that each finding is either remediated or on an approved corrective action plan.',
    ],
    relatedPolicies: [
      { id: 'CO-CR-001', label: 'Compliance Reporting Program' },
      { id: 'CO-IV-001', label: 'Investigations & Disclosures' },
      { id: 'GV-GB-001', label: 'Governing Body Charter' },
    ],
    relatedEventIds: ['EVT-CO-MAY-001', 'EVT-GB-MAY-001'],
    estimatedMinutes: 14,
    updatedAt: '2026-04-02',
  },

  /* ═══════════════════════════ Risk Management ══════════════════════════ */
  'KB-RM-001': {
    id: 'KB-RM-001',
    title: 'Risk Management Committee Review',
    subtitle: 'Quarterly risk posture, mitigation plans, critical-event escalation',
    overview:
      'The Risk Management Committee reviews the enterprise risk register each quarter, approves mitigation plans, and escalates critical and sentinel events. Severe items must be escalated immediately or within 72 hours per severity.',
    purpose:
      'Maintain a current enterprise risk posture, validate mitigation plans, and ensure timely escalation of severe risks to the Governing Body.',
    whenRequired:
      'At least quarterly. Agenda 5 calendar days prior. Minutes within 7 calendar days. Immediate / 72-hour escalation for critical events.',
    responsible:
      'Risk Manager facilitates. Risk owners report status. Administrator reviews the quarterly submission to the Governing Body.',
    steps: [
      { label: 'Risk Register Refresh',
        detail: 'Update the enterprise risk register with any new risks, status changes, or closed risks since last quarter.' },
      { label: 'Mitigation Plan Review',
        detail: 'Walk through each active mitigation plan (RM-F-011). Owners report progress, blockers, and revised closure dates.' },
      { label: 'Critical Event Log',
        detail: 'Review sentinel / critical events from the quarter. Confirm 72-hour escalations occurred where required and follow-up is complete.' },
      { label: 'Quarterly Report Preparation',
        detail: 'Produce the Quarterly Risk Report (RM-F-010) with high/medium/low risks, mitigations, and sentinel events. Submit to the Governing Body packet.' },
      { label: 'Escalation & Delegation',
        detail: 'Escalate any risk requiring Governing Body acknowledgment or cross-domain action. Delegate follow-up owners and deadlines.' },
    ],
    formsRequired: [
      { formId: 'RM-F-010', label: 'Quarterly Risk Report' },
      { formId: 'RM-F-011', label: 'Risk Mitigation Plan',   note: 'One per active risk.' },
    ],
    outputs: [
      'Refreshed enterprise risk register.',
      'Updated mitigation plans with closure evidence where applicable.',
      'Signed quarterly risk report delivered to the Governing Body packet.',
      'Documented 72-hour escalations for critical events.',
    ],
    commonMistakes: [
      'Risk register not reviewed for multiple quarters — stale posture.',
      'Mitigation plans without named owners or closure criteria.',
      'Critical-event escalations filed late or not at all.',
      'Quarterly report missing severity breakdown.',
    ],
    auditTips: [
      'Show evidence of every 72-hour critical escalation with timestamp.',
      'Cross-reference risks to their mitigation plans and closure evidence.',
      'Keep a rolling risk register accessible to surveyors.',
    ],
    relatedPolicies: [
      { id: 'RM-EM-001', label: 'Enterprise Risk Management' },
      { id: 'RM-SE-001', label: 'Sentinel Event Escalation' },
      { id: 'GV-GB-001', label: 'Governing Body Charter' },
    ],
    relatedEventIds: ['EVT-RM-MAY-001', 'EVT-GB-MAY-001'],
    estimatedMinutes: 14,
    updatedAt: '2026-03-30',
  },

  /* ═══════════════════════════ Billing / Finance ════════════════════════ */
  'KB-FN-001': {
    id: 'KB-FN-001',
    title: 'Pre-Billing & Timely Filing Workflow',
    subtitle: 'Biweekly claims cycle: verification, hold management, timely-filing watch',
    overview:
      'Every claims batch runs through a verification gate that blocks release on missing POC signatures, OASIS locks, or episode documentation. Released claims are tracked against timely filing windows (90 / 180 / 300 days) with escalations for aging.',
    purpose:
      'Prevent documentation-deficient claims from reaching the payor, keep filed claims inside timely-filing windows, and maintain a defensible billing record.',
    whenRequired:
      'Each billing cycle (biweekly). Continuous monitoring of unsigned POC episodes (7 / 14 / 21 day gates) and aged claims (90 / 180 / 300 day windows).',
    responsible:
      'Revenue Cycle Specialist executes. Revenue Cycle Director approves releases and authorizes escalations.',
    steps: [
      { label: 'Pre-Bill Verification',
        detail: 'Complete the Pre-Billing Verification Checklist (FN-F-001) for every claim: signed POC, OASIS lock, visit documentation, coder review.' },
      { label: 'Hold Decisions',
        detail: 'Claims that fail verification go on the Hold Register (FN-F-002) with reason and resolution owner. Route physician-signature holds to clinical follow-up.' },
      { label: 'Batch Submission',
        detail: 'Submit verified claims. Record in the Batch Log (FN-F-003) with batch number, submission date, and payor.' },
      { label: 'Post-Submit Reconciliation',
        detail: 'Within 48 hours, route rejected claims back to clinical / coding. Update the Batch Log with acceptance / reject detail.' },
      { label: 'Timely Filing Watch',
        detail: 'Weekly, review the aged claims report. Escalate any claim approaching 300 days; verify resolution of 180-day items; surface 90-day items.' },
      { label: 'Aged Unsigned POC Review',
        detail: 'Each cycle, pull the Aged Unsigned POC Report (FN-F-004). Escalate 14+ day items to the Clinical Director.' },
    ],
    formsRequired: [
      { formId: 'FN-F-001', label: 'Pre-Billing Verification Checklist' },
      { formId: 'FN-F-002', label: 'Billing Hold Register' },
      { formId: 'FN-F-003', label: 'Claims Batch Log' },
      { formId: 'FN-F-004', label: 'Aged Unsigned POC Report' },
    ],
    outputs: [
      'Evidence that no undocumented claim was released.',
      'Aged-hold report with release decisions and evidence on file.',
      'Timely-filing record for every payor.',
      'Audit-ready batch log covering every submission.',
    ],
    commonMistakes: [
      'Releasing claims before POC signatures land on the episode.',
      'Not tracking unsigned POCs past the 21-day gate.',
      'Missing the 300-day filing window — direct revenue loss.',
      'Batch log missing reject reasons or re-route evidence.',
    ],
    auditTips: [
      'Retain pre-bill checklists per claim batch.',
      'Document each hold release with evidence reviewed and approver.',
      'Maintain an aged unsigned-POC report for survey readiness.',
      'Show the full chain from OASIS lock → signed POC → claim release.',
    ],
    relatedPolicies: [
      { id: 'FN-BC-001', label: 'Billing & Claims Policy' },
      { id: 'FN-BC-003', label: 'Billing Hold & Release' },
      { id: 'CL-POC-007', label: 'Plan of Care Signatures' },
    ],
    relatedEventIds: ['EVT-FN-MAY-001', 'EVT-FN-MAY-002', 'EVT-OP-MAY-004'],
    estimatedMinutes: 12,
    updatedAt: '2026-04-02',
  },

  /* ═══════════════════════════ Billing Hold Review ══════════════════════ */
  'KB-FN-002': {
    id: 'KB-FN-002',
    title: 'Billing Hold Review',
    subtitle: 'Held claims, reason analysis, targeted release decisions',
    overview:
      'Held claims represent revenue blocked on documentation gaps. A disciplined weekly hold review surfaces the true cause, assigns resolution owners, and releases claims only when evidence is in place.',
    purpose:
      'Ensure no claim remains held longer than needed while preventing release of claims that lack required documentation.',
    whenRequired:
      'Weekly hold review. Escalations at 14 and 21 days in hold.',
    responsible:
      'Revenue Cycle Specialist compiles. Revenue Cycle Director authorizes releases.',
    steps: [
      { label: 'Compile Hold Register',
        detail: 'Pull the full Hold Register (FN-F-002). Group by reason (missing POC, missing OASIS, coding, clinical).' },
      { label: 'Owner Confirmation',
        detail: 'For each hold, confirm the resolution owner and target release date. Re-assign stale ownership.' },
      { label: 'Escalation',
        detail: 'Any claim held 14+ days escalates to the owning domain lead. 21+ days escalates to the Administrator.' },
      { label: 'Release Decisions',
        detail: 'For each release, verify the evidence is filed on the episode. Record release decision and approver on the Hold Register.' },
    ],
    formsRequired: [
      { formId: 'FN-F-002', label: 'Billing Hold Register' },
    ],
    outputs: [
      'Updated Hold Register with owner, target release, and decisions.',
      'Release approvals captured with evidence.',
      'Escalation evidence for aged holds.',
    ],
    commonMistakes: [
      'Releasing a claim without evidence of the missing artifact.',
      'Leaving holds with the original owner after role change.',
      'Skipping the 14/21-day escalations.',
    ],
    auditTips: [
      'Every release should be traceable to a named approver and a specific piece of evidence.',
      'Aged holds should show escalation evidence in sequence.',
    ],
    relatedPolicies: [
      { id: 'FN-BC-003', label: 'Billing Hold & Release' },
      { id: 'FN-BC-001', label: 'Billing & Claims Policy' },
    ],
    relatedEventIds: ['EVT-FN-MAY-002'],
    estimatedMinutes: 8,
    updatedAt: '2026-04-02',
  },

  /* ═══════════════════════════ Physician Signatures ═════════════════════ */
  'KB-CL-001': {
    id: 'KB-CL-001',
    title: 'Physician Signature Follow-Up',
    subtitle: 'Unsigned POC management across 7 / 14 / 21 day escalation gates',
    overview:
      'Every home health episode requires a signed physician Plan of Care before a claim can be released. Disciplined follow-up at the 7, 14, and 21 day gates prevents billing holds and revenue loss.',
    purpose:
      'Close physician signatures on time, on every episode, using standardized follow-up and escalation.',
    whenRequired:
      'Continuous — with structured review weekly and at each billing cycle.',
    responsible:
      'Clinical Liaison performs outreach. Revenue Cycle Specialist tracks. Clinical Director escalates at 14+ days.',
    steps: [
      { label: 'Outreach (Day 0 – 7)',
        detail: 'Send POC to the physician on episode start. Standard follow-up contact at Day 5. Track each contact on the Signature Tracker (CL-F-001).' },
      { label: 'First Escalation (Day 7 – 14)',
        detail: 'Second outreach attempt. Escalate to office manager if no response. Log contact method and outcome.' },
      { label: 'Second Escalation (Day 14 – 21)',
        detail: 'Escalate to Clinical Director. Consider alternate signature channel per clinical policy. Add to the Aged Unsigned POC Report (FN-F-004).' },
      { label: 'Critical Escalation (Day 21+)',
        detail: 'Administrator-level escalation. Claim remains on billing hold until signed. Document every contact attempt.' },
    ],
    formsRequired: [
      { formId: 'CL-F-001', label: 'Plan of Care Signature Tracker' },
      { formId: 'FN-F-004', label: 'Aged Unsigned POC Report' },
    ],
    outputs: [
      'Signed POC filed on the episode.',
      'Signature tracker with complete contact history.',
      'Aged unsigned POC report with zero items over 21 days (target).',
    ],
    commonMistakes: [
      'Relying on informal follow-up without tracking.',
      'Allowing episodes to age past 21 days without Clinical Director escalation.',
      'Not documenting contact attempts — surveyor-visible gap.',
    ],
    auditTips: [
      'Retain the Signature Tracker and Aged Unsigned POC Report together.',
      'Show a named escalation chain for every aged episode.',
    ],
    relatedPolicies: [
      { id: 'CL-POC-007', label: 'Plan of Care Signatures' },
      { id: 'FN-BC-003', label: 'Billing Hold & Release' },
    ],
    relatedEventIds: ['EVT-CL-MAY-001', 'EVT-FN-MAY-001'],
    estimatedMinutes: 9,
    updatedAt: '2026-04-05',
  },

  /* ═════════════════════════════ Policy Lifecycle ═══════════════════════ */
  'KB-GV-002': {
    id: 'KB-GV-002',
    title: 'Policy Review Cycle',
    subtitle: 'Periodic review, revision, approval, and distribution of policy artifacts',
    overview:
      'Every policy has a review cycle. The steward confirms regulatory alignment, revises where needed, routes for approval, and ensures the revised policy is distributed and acknowledged.',
    purpose:
      'Keep the policy library current, accurate, and aligned with regulation — with documented approval and distribution.',
    whenRequired:
      'Per policy review cycle (annual default; shorter for highly regulated domains).',
    responsible:
      'Policy steward drives. Compliance Officer reviews. Administrator approves material changes.',
    steps: [
      { label: 'Review Against Regulation',
        detail: 'Confirm the policy still cites current regulation and reflects current practice. Note any gaps.' },
      { label: 'Revise & Redline',
        detail: 'Apply changes. Keep a redline copy for evidence of the review pass.' },
      { label: 'Compliance Review',
        detail: 'Compliance Officer reviews material changes. Escalate to legal as needed.' },
      { label: 'Approval',
        detail: 'Administrator approves material revisions. Record approval in the policy system.' },
      { label: 'Distribution & Acknowledgment',
        detail: 'Publish. Require acknowledgment from impacted staff. Track training updates.' },
    ],
    formsRequired: [
      { formId: 'GV-F-010', label: 'Policy Review Checklist' },
    ],
    outputs: [
      'Approved, dated revision of the policy in the library.',
      'Redline evidence of the review pass.',
      'Acknowledgment records from impacted staff.',
    ],
    commonMistakes: [
      'Reviewing without updating citations.',
      'Revisions not distributed — staff operating on a prior version.',
      'No redline trail when a policy was materially changed.',
    ],
    auditTips: [
      'Keep a review log per policy with date, reviewer, decision.',
      'Retain every version so change history is visible.',
    ],
    relatedPolicies: [
      { id: 'GV-PL-001', label: 'Policy Lifecycle Management' },
      { id: 'GV-GB-002', label: 'Governance Lifecycle' },
    ],
    relatedEventIds: ['EVT-PL-MAY-001'],
    estimatedMinutes: 10,
    updatedAt: '2026-03-20',
  },

  /* ═══════════════════════════ Information Security ═════════════════════ */
  'KB-IS-001': {
    id: 'KB-IS-001',
    title: 'Information Security Review',
    subtitle: 'Monthly system activity review, quarterly reporting, annual risk analysis',
    overview:
      'Information security requires continuous attention: monthly system activity review, quarterly security reporting, and an annual risk analysis. Findings are tracked to closure on a remediation log.',
    purpose:
      'Maintain an operational information security posture and produce the evidence required by policy and regulation.',
    whenRequired:
      'Monthly activity review; quarterly security report; annual risk analysis.',
    responsible:
      'Information Security Officer executes. Administrator receives the quarterly report.',
    steps: [
      { label: 'Log Extraction',
        detail: 'Pull EHR + network audit logs for the period. Export to the worksheet (IS-F-001).' },
      { label: 'Anomaly Review',
        detail: 'Identify access anomalies, excess privileges, failed authentication spikes. Triage each finding.' },
      { label: 'Remediation Planning',
        detail: 'For each finding, add to the Remediation Tracker (IS-F-002) with owner and target date.' },
      { label: 'Quarterly Reporting',
        detail: 'Aggregate the quarter into the security report. Deliver to the Administrator.' },
      { label: 'Annual Risk Analysis',
        detail: 'Once per year, refresh the enterprise information security risk analysis and align the control set.' },
    ],
    formsRequired: [
      { formId: 'IS-F-001', label: 'System Activity Review Worksheet' },
      { formId: 'IS-F-002', label: 'Remediation Tracker' },
    ],
    outputs: [
      'Signed monthly activity review worksheets.',
      'Updated remediation tracker with owners and target dates.',
      'Quarterly security report delivered on time.',
    ],
    commonMistakes: [
      'Monthly review skipped during staffing transitions.',
      'Findings closed without verification evidence.',
      'Annual risk analysis not refreshed — compliance gap.',
    ],
    auditTips: [
      'Retain a full year of monthly activity reviews.',
      'Link every remediation closure to specific verification evidence.',
    ],
    relatedPolicies: [
      { id: 'IS-SR-002', label: 'System Activity Review' },
      { id: 'IS-RA-001', label: 'Information Security Risk Analysis' },
    ],
    relatedEventIds: ['EVT-SYS-MAY-001', 'EVT-IS-Q2-2026'],
    estimatedMinutes: 11,
    updatedAt: '2026-04-10',
  },

  /* ════════════════════════ Emergency Preparedness ══════════════════════ */
  'KB-OP-001': {
    id: 'KB-OP-001',
    title: 'Emergency Preparedness Review',
    subtitle: 'Annual exercise, communication tree, plan updates',
    overview:
      'The CMS emergency preparedness rule requires home health agencies to conduct emergency preparedness exercises and update their plan accordingly. Exercises must include communication tree tests.',
    purpose:
      'Execute the required emergency preparedness drill, identify gaps, and update the plan to close them.',
    whenRequired:
      'At least annually, more often if risk assessment requires.',
    responsible:
      'Emergency Preparedness Coordinator leads. Administrator approves plan updates.',
    steps: [
      { label: 'Scenario Selection',
        detail: 'Choose a scenario that stresses the most recent risk analysis findings.' },
      { label: 'Communication Tree Test',
        detail: 'Execute the communication tree end-to-end. Record confirmations and timing.' },
      { label: 'Exercise Execution',
        detail: 'Run the drill. Observe response, identify gaps, record lessons learned.' },
      { label: 'Plan Update',
        detail: 'Incorporate lessons learned into the emergency plan. Distribute revised plan to staff.' },
      { label: 'Documentation',
        detail: 'Complete the Exercise Record (OP-F-001) and retain with the emergency plan.' },
    ],
    formsRequired: [
      { formId: 'OP-F-001', label: 'Emergency Preparedness Exercise Record' },
    ],
    outputs: [
      'Signed Exercise Record with scenario, participants, and gaps.',
      'Revised emergency plan distributed to staff.',
      'Updated communication tree with verified contacts.',
    ],
    commonMistakes: [
      'Scenario chosen without reference to the risk analysis.',
      'Communication tree not actually tested end-to-end.',
      'Plan not updated despite identified gaps.',
    ],
    auditTips: [
      'Retain multi-year exercise records to show continuous readiness.',
      'Cross-reference every plan revision to a specific exercise.',
    ],
    relatedPolicies: [
      { id: 'OP-EP-001', label: 'Emergency Preparedness Plan' },
      { id: 'OP-EP-002', label: 'Emergency Communication Protocol' },
    ],
    relatedEventIds: ['EVT-OP-MAY-001'],
    estimatedMinutes: 10,
    updatedAt: '2026-03-18',
  },

  /* ═══════════════ GOOGLE CALENDAR INTEGRATION ═══════════════ */
  'KB-GCAL-001': {
    id: 'KB-GCAL-001',
    title: 'Google Calendar Integration — Operating Guide',
    subtitle: 'How Regulatory Planner events sync to the agency Google Calendar',
    overview:
      'The Regulatory Planner is the primary system of record for every recurring and trigger-based compliance event. Google Calendar is a mirror surface — it lets owners see what is coming and receive notifications through the same channel they use for every other meeting. All Google traffic is mediated server-side so the service-account credential never ships to the browser.',
    purpose:
      'Keep every mandated event (Governing Body, QAPI, Compliance, Claims, Risk, Clinical, HR, IT) visible on the agency Google Calendar while preserving the Planner as the audit record of workflow, evidence, approvals, and minutes.',
    whenRequired:
      'Continuously. The planner attempts a backend health check on load. Operators can push all in-scope events to Google at any time from the Master Calendar header ("Sync to Google"). Individual events sync automatically on create / update / cancel when the backend is reachable.',
    responsible:
      'IT / Information Security owns the Google Cloud project and the service-account key. The Administrator owns the calendar-sharing arrangement. The Compliance Officer owns the event catalog and evidence record.',
    steps: [
      { label: '1 · Preconditions',
        detail: 'Google Calendar API enabled on the project. Service account created. Service-account JSON key downloaded. Target calendar shared with the service account with "Make changes to events" permission. (All preconditions already completed in this environment.)' },
      { label: '2 · Install the credential',
        detail: 'Place the service-account JSON at server/credentials/service-account.json. This path is gitignored. In production, move it out-of-repo and point GOOGLE_APPLICATION_CREDENTIALS to the absolute path with 0400 permissions.' },
      { label: '3 · Configure .env',
        detail: 'Copy .env.example to .env at the repo root. Confirm GOOGLE_CALENDAR_ID, DEFAULT_TIMEZONE (America/Los_Angeles), PORT (8787), and ALLOWED_ORIGIN.' },
      { label: '4 · Start services',
        detail: 'Run `npm install` once, then `npm run dev`. That boots the Vite web app on :5173 and the Express API on :8787 concurrently. Vite proxies /api to the Express backend.' },
      { label: '5 · Verify reachability',
        detail: 'Open the Master Calendar. The header shows a status chip: green "Google Calendar · Linked" means the backend reached the shared calendar with the service account. Red means an auth or permission issue — check the backend console.' },
      { label: '6 · Push the current catalog',
        detail: 'Click "Sync to Google". Every non-context event is sent to Google. The backend enforces idempotency by the internal App event ID stored in each Google event\'s extendedProperties.private.appEventId — subsequent syncs update rather than duplicate.' },
      { label: '7 · Normal operations',
        detail: 'Create / update / cancel events in the Planner; the sync store mirrors each change to Google. Deleting an event calls DELETE (or uses the cancel-only path to mark [CANCELLED] and preserve the audit trail).' },
      { label: '8 · Production deploy',
        detail: 'Run `npm run server` behind your reverse proxy on the same origin as the web app so /api resolves without CORS. Set ALLOWED_ORIGIN to the web origin and API_SHARED_SECRET to a strong value; the frontend reads VITE_API_SHARED_SECRET at build time.' },
    ],
    formsRequired: [],
    outputs: [
      'Every mandated event present on the shared agency Google Calendar.',
      'Google event IDs persisted in the sync store (App event ID → Google event ID).',
      'Sync log retained in the Calendar Sync Store (last sync time, ok / failed counts, per-event codes).',
      'No credential material present in any shipped frontend bundle.',
    ],
    commonMistakes: [
      'Dropping the service-account JSON into src/ or public/ (would expose it in the built web bundle).',
      'Sharing the calendar with the wrong service-account address — check the exact address in GCP IAM.',
      'Forgetting to enable the Google Calendar API on the project (symptom: 403 permission_denied even though sharing is set).',
      'Starting only the web app — /api/* will 502 until the backend is running.',
      'Editing the calendar manually and expecting those edits to appear in the Planner without running a pull sync.',
    ],
    auditTips: [
      'Treat the Planner as the source of truth for every event. Google is presentation; the Planner holds the audit bundle.',
      'Retain the sync log — it shows which events were synced, when, and with what outcome. Useful for surveyor timelines.',
      'Rotate the service-account key at least annually and on role changes. Revoke old keys the moment rotation completes.',
      'In the App event\'s Google description, the "— Regulatory Planner —" block prints the policy refs, owner, and driver so a quick look at a calendar invite shows the regulatory context without opening the app.',
    ],
    relatedPolicies: [
      { id: 'IS-SR-002', label: 'Information Security · System Access Review' },
      { id: 'IS-RA-001', label: 'HIPAA Security Risk Analysis' },
      { id: 'CO-CP-001', label: 'Corporate Compliance Program' },
    ],
    relatedEventIds: [],
    estimatedMinutes: 15,
    updatedAt: '2026-04-21',
  },

  'KB-GCAL-002': {
    id: 'KB-GCAL-002',
    title: 'Calendar Sync — Troubleshooting',
    subtitle: 'Error codes surfaced by the backend and what to do about them',
    overview:
      'Every /api/calendar/* response returns a typed error code when things go wrong. Use this article to translate those codes into an action.',
    purpose:
      'Give operators and IT a fast lookup when the Master Calendar header flips to a red status or a sync log shows failed rows.',
    whenRequired: 'On demand — whenever sync reports an error.',
    responsible: 'IT / Information Security for infrastructure issues. Compliance for data issues.',
    steps: [
      { label: 'auth_error',
        detail: 'The backend could not authenticate with Google. Verify GOOGLE_APPLICATION_CREDENTIALS points to a valid JSON key file and that the key has not been revoked in the Google Cloud console.' },
      { label: 'permission_denied',
        detail: 'The service account authenticated but does not have permission to act on the calendar. Re-share the calendar with the service-account email and grant "Make changes to events".' },
      { label: 'calendar_not_found',
        detail: 'GOOGLE_CALENDAR_ID is wrong, or the calendar was deleted, or the calendar has not been shared with the service account (Google returns 404 in this case). Copy the calendar ID again from Google Calendar Settings → Integrate calendar.' },
      { label: 'validation_error',
        detail: 'The request payload failed backend validation. Typical cases: missing appEventId, malformed date (expected YYYY-MM-DD), allDay flag combined with explicit times. Check the network tab for the error.details payload.' },
      { label: 'duplicate',
        detail: 'Google reported a 409 conflict. The backend normally dedupes by appEventId; if this fires, inspect the Google calendar directly for a pre-existing event with a colliding ID.' },
      { label: 'rate_limited',
        detail: 'Too many requests. Back off and retry. Bulk sync ("Sync to Google") respects pagination but very large catalogs may need throttling.' },
      { label: 'upstream_error',
        detail: 'Google returned 5xx. Retry with exponential back-off. If persistent, check Google Workspace Status.' },
      { label: 'network_error',
        detail: 'Frontend could not reach the backend. Confirm the Express server is running (`npm run dev:api`) and that Vite\'s proxy for /api is intact.' },
    ],
    formsRequired: [],
    outputs: ['Red-light event back to green; sync log free of failures.'],
    commonMistakes: [
      'Retrying on auth_error without rotating or replacing the credential.',
      'Treating permission_denied as a Google outage — it is almost always a sharing or scope mistake.',
    ],
    auditTips: [
      'Sync failures do not break the audit record. The Planner remains the authoritative system; Google is a convenience mirror.',
      'Capture error-code screenshots in the sync log evidence bundle.',
    ],
    relatedPolicies: [{ id: 'IS-IR-001', label: 'Security Incident Response' }],
    relatedEventIds: [],
    estimatedMinutes: 5,
    updatedAt: '2026-04-21',
  },

  /* ═════════════════ Regulatory Execution Engine ═════════════════ */
  'KB-EXEC-001': {
    id: 'KB-EXEC-001',
    title: 'Enforcement Layer — Completion Gates & Locks',
    subtitle: 'Why some events refuse to close, how locks work, and who can override them.',
    overview:
      'The enforcement layer is the authoritative gate for event closure. It blends workflow completeness, forms/evidence, required approval rules, timeline health, and upstream dependencies into a single deterministic decision. Every mutation is audit-logged; every approved-and-closed event is locked for immutability.',
    purpose: 'Prevent out-of-order or incomplete event closure. Guarantee every closed event is survey-defensible.',
    whenRequired: 'Active on every regulatory event in the planner. Triggered on every mutation and on the Mark Complete action.',
    responsible: 'Administrator / Compliance Officer for unlocks; Event owners for blocker remediation.',
    steps: [
      { label: 'Inspect the BlockerPanel',
        detail: 'Open the event. The right column shows risk band, blockers grouped by kind, approval gaps, and timeline issues. Each entry includes a remediation hint.' },
      { label: 'Clear blockers in order of severity',
        detail: 'Critical blockers (missing required approvals, dependency gaps) must close first. High-severity items follow. Medium / warnings can be accepted with annotation.' },
      { label: 'Finalize minutes if required',
        detail: 'Meeting events cannot close without finalized minutes that contain every required section and every required sign-off role.' },
      { label: 'Mark Event Complete',
        detail: 'The completion button becomes active only when the enforcement report reports canComplete=true. Clicking it records the completion and — if all required approvals are captured — auto-locks the event.' },
      { label: 'Request an unlock if correction is needed',
        detail: 'Locked events can only be reopened by the role declared in the event approval rule (defaults to Administrator). The unlock action is audit-logged.' },
    ],
    formsRequired: [],
    outputs: [
      'An immutable, survey-ready event record.',
      'A complete audit trail of who did what, when, and what changed.',
      'Escalation entries for any approval missed its window.',
    ],
    commonMistakes: [
      'Closing an event by "marking forms complete" without uploading the actual form — the BlockerPanel will flag this as a warning.',
      'Assuming an unlocked completion is permanent. Reopening rewinds the lock but is always audit-logged.',
      'Ignoring dependency gaps. QAPI cannot close until its clinical record audit is closed; Governing Body cannot close until QAPI feeds it.',
    ],
    auditTips: [
      'When a surveyor asks "how do you prevent out-of-order close?" — show them the BlockerPanel and the audit trail on a locked event.',
      'The audit bundle export (Audit Mode) includes the full enforcement + audit-log snapshot per event.',
    ],
    relatedPolicies: [{ id: 'CO-CP-001', label: 'Corporate Compliance Program' }],
    relatedEventIds: [],
    estimatedMinutes: 8,
    updatedAt: '2026-04-21',
  },

  'KB-EXEC-002': {
    id: 'KB-EXEC-002',
    title: 'Auto-Generation — Annual Regulatory Calendar',
    subtitle: 'Generate the entire required event set for a year from the Template Registry.',
    overview:
      'The Auto-Generation engine produces deterministic, dependency-aware events for every recurring regulatory requirement — monthly, quarterly, annual — with conflict resolution and dependency chaining built in. Use it to bootstrap a new agency, rebuild after a reset, or roll forward to the next year.',
    purpose: 'Produce the full regulatory event calendar for a year without manual scheduling.',
    whenRequired: 'At the start of a new compliance year, after a reset, or when onboarding a new agency.',
    responsible: 'Compliance Officer / Administrator.',
    steps: [
      { label: 'Open the Master Calendar',
        detail: 'The Generate Year button lives in the page header.' },
      { label: 'Click Generate Year',
        detail: 'The engine enumerates every template, emits instances, resolves conflicts (±3 days by default), and rewires dependencies so upstream events precede downstream ones.' },
      { label: 'Review the toast summary',
        detail: 'The toast reports emitted / skipped / shifted counts. Skipped entries are de-duplicated against the existing catalog.' },
      { label: 'Triggered events',
        detail: 'Incident, sentinel, complaint, and survey-notice events are materialized by the trigger engine when the corresponding signal is raised elsewhere in the system.' },
      { label: 'Clear generated if needed',
        detail: 'The Clear Generated button removes only auto-generated instances; the base catalog and triggered events are untouched.' },
    ],
    formsRequired: [],
    outputs: [
      'A canonical year-long regulatory calendar.',
      'Dependency-chained events so upstream closes precede downstream closes.',
      'Conflict-free scheduling within the agency owner-role constraints.',
    ],
    commonMistakes: [
      'Regenerating after partial closures — the engine de-duplicates, but running repeatedly can bloat audit-log noise. Clear first if you are rebuilding.',
      'Expecting templates to override existing event content. Generation is additive.',
    ],
    auditTips: [
      'Every generation run is audit-logged with emitted/skipped/conflict counts and the date range.',
      'Templates carry regulatory citations; generated events inherit them so surveyors see the traceable chain.',
    ],
    relatedPolicies: [],
    relatedEventIds: [],
    estimatedMinutes: 6,
    updatedAt: '2026-04-21',
  },

  'KB-EXEC-003': {
    id: 'KB-EXEC-003',
    title: 'Audit Mode — Surveyor View',
    subtitle: 'Present the agency to a surveyor in a single read-only surface with export.',
    overview:
      'Audit Mode is a read-only dashboard designed for CMS / state surveyors and internal compliance officers. It summarizes agency risk, lets you drill into any event\'s enforcement report + audit trail + evidence, and exports a Markdown or JSON audit packet.',
    purpose: 'Present the full regulatory posture of the agency on a single read-only surface for a surveyor.',
    whenRequired: 'Any time a CMS / state surveyor is on-site, or for scheduled internal compliance reviews.',
    responsible: 'Compliance Officer; read-only access appropriate for surveyors and internal auditors.',
    steps: [
      { label: 'Open Audit Mode',
        detail: 'Compliance → Audit Mode (also available at /audit).' },
      { label: 'Read the agency header',
        detail: 'Agency risk band + weighted score, counts by severity, and the top risk drivers roll up the entire event set.' },
      { label: 'Filter by surveyor concern',
        detail: 'Use the filters — Immediate Jeopardy, High, Overdue, Missing Evidence, Approval Gap, Locked — to narrow the event list.' },
      { label: 'Drill into a single event',
        detail: 'Click any event to see its risk breakdown with per-driver weights, the full BlockerPanel, workflow and form statuses, and the chronological audit trail.' },
      { label: 'Export the packet',
        detail: 'Export Packet produces a printable Markdown document. Export JSON produces a machine-readable bundle that includes the full enforcement report, risk breakdown, and audit log per event.' },
    ],
    formsRequired: [],
    outputs: [
      'A surveyor-ready packet that demonstrates each CoP § is watched, worked, and evidence-backed.',
      'A JSON bundle that can be retained as point-in-time compliance evidence.',
    ],
    commonMistakes: [
      'Editing events from Audit Mode — the page is intentionally read-only. Return to the Master Calendar to act on findings.',
      'Exporting without first running an enforcement sweep. The app runs a sweep on startup and after autogen, but if the data looks stale, re-open the Master Calendar to trigger a refresh.',
    ],
    auditTips: [
      'Surveyors often ask for "everything from the last 12 months." The export packet answers that directly.',
      'Immediate Jeopardy is reserved for declared-critical events with overdue + missing items. It is deliberately scoped so the flag is trustworthy.',
    ],
    relatedPolicies: [{ id: 'CO-CP-001', label: 'Corporate Compliance Program' }],
    relatedEventIds: [],
    estimatedMinutes: 7,
    updatedAt: '2026-04-21',
  },

};

/* Fallback article when an event references a KB id we don't ship with content. */
export function fallbackHelpArticle(eventTitle: string, domain: string): HelpArticle {
  return {
    id: 'KB-GENERIC',
    title: `Operating Guide: ${eventTitle}`,
    subtitle: `${domain} domain · Standard operating reference`,
    overview: `Reference for executing ${eventTitle} consistently within the ${domain} domain.`,
    purpose: `Execute ${eventTitle} with required documentation and audit evidence.`,
    whenRequired: 'As scheduled. Review the linked policy for timing requirements.',
    responsible: 'Event owner noted in the Event Workspace.',
    steps: [
      { label: 'Pre-Event Preparation', detail: 'Collect required data and forms ahead of execution.' },
      { label: 'Execution',             detail: 'Conduct the event per the assigned owner and policy requirements.' },
      { label: 'Documentation',         detail: 'Record outcomes, decisions, and action items.' },
      { label: 'Follow-Up',             detail: 'Close action items. Retain evidence for audit.' },
    ],
    formsRequired: [],
    outputs: ['Completed event record.', 'Filed evidence in the audit-ready repository.'],
    commonMistakes: ['Missing agenda / evidence distribution.', 'Delayed documentation finalization.'],
    auditTips: ['Retain evidence with the originating event and policy reference.'],
    relatedPolicies: [],
    relatedEventIds: [],
    estimatedMinutes: 8,
    updatedAt: '2026-04-15',
  };
}
