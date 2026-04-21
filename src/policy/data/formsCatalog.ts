/* ═══════════════════════════════════════════════════════════════
   Forms Catalog — operational metadata for every form surfaced by
   the Regulatory Execution Center. Each event references form IDs
   via requiredForms[].formId; this catalog supplies the content
   that appears in the Event Workspace, Workflow Drawer, and Help
   Center modal (what the form is, who fills it, when, and what
   each status actually means).
   ═══════════════════════════════════════════════════════════════ */

export interface FormMeta {
  id: string;
  title: string;
  purpose: string;
  whenRequired: string;
  whoCompletes: string;
  linkedRelevance: string;
  instructions: string;
  statusMeaning: {
    missing: string;
    pending: string;
    'in-progress': string;
    'requires-review': string;
    complete: string;
  };
}

const STD_STATUS = (subject: string): FormMeta['statusMeaning'] => ({
  missing:           `${subject} is not on file. Survey-ready gap — upload or create before the event is closed.`,
  pending:           `${subject} has not been started. Open the form and begin input when prerequisites are met.`,
  'in-progress':     `${subject} has been opened and is being filled out. Complete all required fields before sign-off.`,
  'requires-review': `${subject} is filled out and awaiting review by an approver before it can be finalized.`,
  complete:          `${subject} is fully documented, signed where required, and stored in the audit-ready location.`,
});

export const FORMS_CATALOG: Record<string, FormMeta> = {

  /* ─── QAPI ─────────────────────────────────────────── */
  'QA-F-010': {
    id: 'QA-F-010',
    title: 'QAPI Meeting Agenda',
    purpose: 'Sets the structure, discussion topics, and decisions scheduled for the monthly QAPI Committee meeting.',
    whenRequired: 'Distributed at least 5 business days before every monthly QAPI Committee meeting.',
    whoCompletes: 'QAPI Coordinator, reviewed by the Administrator prior to distribution.',
    linkedRelevance: 'Drives the QAPI Committee Meeting event and feeds directly into the minutes template (QA-F-012).',
    instructions: 'Open the agenda template. Enter meeting date, attendees, standing items (prior minutes approval, indicator review, action items, new business), and attach the QAPI Data Dashboard for the period.',
    statusMeaning: STD_STATUS('Agenda'),
  },
  'QA-F-011': {
    id: 'QA-F-011',
    title: 'QAPI Attendance Log',
    purpose: 'Captures quorum, member participation, and guests of record for the QAPI Committee meeting.',
    whenRequired: 'Completed during the meeting and retained immediately afterwards.',
    whoCompletes: 'Meeting recorder (typically QAPI Coordinator or designated support staff).',
    linkedRelevance: 'Demonstrates committee participation for survey evidence. Paired with the minutes record.',
    instructions: 'Record every attendee (name, role, present/absent/excused). Confirm quorum per QAPI policy QA-PG-001. Save with the meeting evidence bundle.',
    statusMeaning: STD_STATUS('Attendance log'),
  },
  'QA-F-012': {
    id: 'QA-F-012',
    title: 'QAPI Minutes Template',
    purpose: 'Documents discussion, decisions, corrective actions, and owners for the meeting.',
    whenRequired: 'Draft within 7 calendar days of the meeting; finalize at the next meeting approval.',
    whoCompletes: 'Recorder drafts; Committee Chair finalizes; Administrator signs.',
    linkedRelevance: 'Primary audit artifact. Ties each decision to a policy reference and an action-item owner.',
    instructions: 'Populate each agenda section with discussion and decisions. For every corrective action, record: owner, due date, success criteria, and link to the QAPI Action Item Tracker (QA-F-013).',
    statusMeaning: STD_STATUS('Minutes'),
  },
  'QA-F-013': {
    id: 'QA-F-013',
    title: 'QAPI Action Item Tracker',
    purpose: 'Rolling log of all open quality and performance improvement actions.',
    whenRequired: 'Updated at each QAPI meeting and between meetings as actions progress.',
    whoCompletes: 'QAPI Coordinator; owners provide status updates.',
    linkedRelevance: 'Carries unresolved items forward across meetings; surfaces overdue items to the Governing Body report.',
    instructions: 'Add each new action with owner, due date, linked indicator, and success criteria. Update status (open / in-progress / closed) weekly. Escalate aging items to the Chair.',
    statusMeaning: STD_STATUS('Action tracker'),
  },
  'QA-F-014': {
    id: 'QA-F-014',
    title: 'QAPI Data Dashboard',
    purpose: 'Period performance on quality indicators used to drive QAPI discussion and action.',
    whenRequired: 'Refreshed monthly, attached to the QAPI agenda prior to the meeting.',
    whoCompletes: 'Data analyst / QAPI Coordinator.',
    linkedRelevance: 'Supplies the evidence base for discussion items, indicator trending, and threshold breaches.',
    instructions: 'Pull rolling 3-month and year-to-date values for each agency-defined indicator. Highlight threshold breaches in red. Attach as the first appendix on the agenda.',
    statusMeaning: STD_STATUS('Data dashboard'),
  },
  'QA-F-020': {
    id: 'QA-F-020',
    title: 'Quarterly QAPI Report',
    purpose: 'Consolidated QAPI performance report submitted to the Governing Body each quarter.',
    whenRequired: 'Delivered in the Governing Body packet 7 calendar days before the quarterly meeting.',
    whoCompletes: 'QAPI Coordinator, reviewed by the Administrator.',
    linkedRelevance: 'Required Governing Body packet artifact; drives governance decisions and corrective action approvals.',
    instructions: 'Summarize indicator performance, open/closed action items, corrective actions initiated, and escalations from the prior quarter. Include trend analysis and next-quarter focus.',
    statusMeaning: STD_STATUS('Quarterly QAPI report'),
  },

  /* ─── Governance ───────────────────────────────────── */
  'GV-F-001': {
    id: 'GV-F-001',
    title: 'Governing Body Agenda',
    purpose: 'Master agenda and packet for the quarterly Governing Body meeting.',
    whenRequired: 'Distributed to all members 7 calendar days prior to the meeting.',
    whoCompletes: 'Administrator with the Board Secretary.',
    linkedRelevance: 'Drives the Governing Body Meeting event; anchors all attached quarterly reports.',
    instructions: 'Assemble agenda with standing items (prior minutes approval, QAPI report, Compliance report, Risk report, Financial summary, new business). Distribute via tracked channel.',
    statusMeaning: STD_STATUS('Agenda'),
  },
  'GV-F-002': {
    id: 'GV-F-002',
    title: 'Governing Body Minutes',
    purpose: 'Official record of Governing Body decisions, approvals, and delegated actions.',
    whenRequired: 'Draft within 7 calendar days; approved at the following quarterly meeting.',
    whoCompletes: 'Board Secretary.',
    linkedRelevance: 'Primary survey artifact for governance. Linked to quarterly reports and corrective action approvals.',
    instructions: 'Record attendance, quorum, each decision with vote/approval, and delegated follow-up. Attach prior-meeting approval, QAPI/Compliance/Risk reports, and financial summary.',
    statusMeaning: STD_STATUS('Minutes'),
  },

  /* ─── Compliance ───────────────────────────────────── */
  'CO-F-004': {
    id: 'CO-F-004',
    title: 'Quarterly Compliance Report',
    purpose: 'Documents compliance activity, investigations, disclosures, and corrective actions for the quarter.',
    whenRequired: 'Delivered 7 calendar days before the quarterly Governing Body meeting.',
    whoCompletes: 'Compliance Officer.',
    linkedRelevance: 'Governing Body packet requirement; informs board-level corrective action decisions.',
    instructions: 'Include: open investigations, closed investigations with outcomes, hotline trends, training completion, audit findings, and compliance work-plan progress.',
    statusMeaning: STD_STATUS('Compliance report'),
  },

  /* ─── Risk ─────────────────────────────────────────── */
  'RM-F-010': {
    id: 'RM-F-010',
    title: 'Quarterly Risk Report',
    purpose: 'Enterprise risk posture report including active risks, mitigations, and critical events.',
    whenRequired: 'Delivered 7 calendar days before the quarterly Governing Body meeting.',
    whoCompletes: 'Risk Manager.',
    linkedRelevance: 'Governing Body packet requirement; escalates critical risks for board awareness.',
    instructions: 'Summarize high/medium/low risks by domain, active mitigations, status of prior-quarter actions, and any sentinel / critical events with 72-hour escalations.',
    statusMeaning: STD_STATUS('Risk report'),
  },
  'RM-F-011': {
    id: 'RM-F-011',
    title: 'Risk Mitigation Plan',
    purpose: 'Action plan to reduce or eliminate an identified enterprise risk.',
    whenRequired: 'Created when a risk is identified; reviewed quarterly until closed.',
    whoCompletes: 'Risk owner with Risk Manager.',
    linkedRelevance: 'Attached to the risk register and referenced in the Quarterly Risk Report.',
    instructions: 'For each risk, document: description, likelihood/impact, mitigation actions, owner, target closure date, residual risk.',
    statusMeaning: STD_STATUS('Mitigation plan'),
  },

  /* ─── Finance / Billing ────────────────────────────── */
  'FN-F-001': {
    id: 'FN-F-001',
    title: 'Pre-Billing Verification Checklist',
    purpose: 'Pre-submission gate ensuring signed POC, locked OASIS, and complete episode documentation before a claim is released.',
    whenRequired: 'Every claims batch — completed before submission to the payor.',
    whoCompletes: 'Revenue Cycle Specialist, signed off by the Revenue Cycle Director.',
    linkedRelevance: 'Drives the Claims Submission Cycle. No claim is released without a completed checklist.',
    instructions: 'For each claim in the batch: confirm physician signature on POC, OASIS lock date, visit documentation, coder review, and supporting orders. Flag gaps to the Hold Register (FN-F-002).',
    statusMeaning: STD_STATUS('Pre-billing checklist'),
  },
  'FN-F-002': {
    id: 'FN-F-002',
    title: 'Billing Hold Register',
    purpose: 'Tracks every claim held from submission and the reason for the hold.',
    whenRequired: 'Continuous — updated at each pre-bill review and each release decision.',
    whoCompletes: 'Revenue Cycle Specialist; releases authorized by the Revenue Cycle Director.',
    linkedRelevance: 'Provides evidence that no claim bypassed documentation gates. Feeds aged-hold reports.',
    instructions: 'Record claim ID, episode, reason for hold, owner responsible for resolution, target release date, and evidence reviewed on release.',
    statusMeaning: STD_STATUS('Hold register'),
  },
  'FN-F-003': {
    id: 'FN-F-003',
    title: 'Claims Batch Log',
    purpose: 'Batch-level submission record with acceptance / reject status and timely-filing markers.',
    whenRequired: 'Created per submission batch; updated with post-submit reconciliation.',
    whoCompletes: 'Revenue Cycle Specialist.',
    linkedRelevance: 'Anchors the timely-filing watch and the 90/180/300-day aging view.',
    instructions: 'Record batch number, submission date, claim count, payor, acceptance date, reject detail, and route of rejects within 48 hours.',
    statusMeaning: STD_STATUS('Batch log'),
  },
  'FN-F-004': {
    id: 'FN-F-004',
    title: 'Aged Unsigned POC Report',
    purpose: 'List of episodes with unsigned Plans of Care at the 7 / 14 / 21-day escalation gates.',
    whenRequired: 'Generated weekly; reviewed before each billing cycle.',
    whoCompletes: 'Revenue Cycle Specialist.',
    linkedRelevance: 'Drives physician signature follow-up and prevents claim release on unsigned episodes.',
    instructions: 'Pull all episodes without physician signature. Group by days aged (0–7, 8–14, 15–21, 21+). Escalate 14+ days to Clinical Director.',
    statusMeaning: STD_STATUS('Aged POC report'),
  },

  /* ─── Clinical / POC ───────────────────────────────── */
  'CL-F-001': {
    id: 'CL-F-001',
    title: 'Plan of Care Signature Tracker',
    purpose: 'Per-episode signature status and follow-up activity for physicians.',
    whenRequired: 'Continuous — reviewed weekly during POC follow-up.',
    whoCompletes: 'Clinical Liaison with Revenue Cycle support.',
    linkedRelevance: 'Supplies the denominator for unsigned POC work; feeds billing hold releases.',
    instructions: 'Capture: episode, physician, date sent, last contact, next action, current status. Escalate per clinical signature policy.',
    statusMeaning: STD_STATUS('Signature tracker'),
  },

  /* ─── IT / Security ────────────────────────────────── */
  'IS-F-001': {
    id: 'IS-F-001',
    title: 'System Activity Review Worksheet',
    purpose: 'Monthly review of audit logs, access anomalies, and excess-privilege findings.',
    whenRequired: 'Completed monthly per information security policy IS-SR-002.',
    whoCompletes: 'Information Security Officer.',
    linkedRelevance: 'Evidence for annual risk analysis and quarterly security reporting.',
    instructions: 'Pull EHR + network audit logs for the period. Document anomalies reviewed, access revisions made, and any incident triage initiated.',
    statusMeaning: STD_STATUS('Activity review worksheet'),
  },
  'IS-F-002': {
    id: 'IS-F-002',
    title: 'Remediation Tracker',
    purpose: 'Open security findings and their remediation timelines.',
    whenRequired: 'Updated continuously; reviewed at the monthly activity review.',
    whoCompletes: 'Information Security Officer.',
    linkedRelevance: 'Anchors quarterly security reporting; escalates aging findings.',
    instructions: 'For each finding: record source, severity, owner, target remediation date, verification evidence on close.',
    statusMeaning: STD_STATUS('Remediation tracker'),
  },

  /* ─── Policy Lifecycle ─────────────────────────────── */
  'GV-F-010': {
    id: 'GV-F-010',
    title: 'Policy Review Checklist',
    purpose: 'Structured review ensuring each policy is current, accurate, and aligned with regulation.',
    whenRequired: 'Per policy review cycle (annual default; may be shorter for regulated domains).',
    whoCompletes: 'Policy steward; reviewed by Compliance Officer before approval.',
    linkedRelevance: 'Closes the policy lifecycle — review → revise → approve → distribute.',
    instructions: 'Confirm: regulatory citations current, forms referenced still valid, procedure aligns with practice, training updated. Route for approval and distribution.',
    statusMeaning: STD_STATUS('Policy review checklist'),
  },

  /* ─── Emergency Preparedness ───────────────────────── */
  'OP-F-001': {
    id: 'OP-F-001',
    title: 'Emergency Preparedness Exercise Record',
    purpose: 'Documents the required annual emergency preparedness drill and lessons learned.',
    whenRequired: 'At least annually; more frequently if risk assessment requires.',
    whoCompletes: 'Emergency Preparedness Coordinator.',
    linkedRelevance: 'Survey artifact for CoP emergency preparedness; drives plan updates.',
    instructions: 'Record exercise scenario, participants, communication tree test, identified gaps, and updates made to the emergency plan.',
    statusMeaning: STD_STATUS('EP exercise record'),
  },
};

export function getFormMeta(formId?: string): FormMeta | null {
  if (!formId) return null;
  return FORMS_CATALOG[formId] || null;
}
