/**
 * mandatedEventsExpanded.ts
 * =========================
 * Gold-standard compliance execution nodes for the full 2026 mandated
 * event calendar. Every event is fully structured per the COMPLIANCE
 * EXECUTION NODE specification:
 *
 *   agenda       → structured discussion topics, required inputs, time
 *   processFlow  → atomic pre / during / post tasks with instructions
 *   requiredForms→ explicit form IDs, due offsets, status
 *   minutes      → required sections and sign-off roles
 *   approvals    → structural approval rules with escalation
 *   complianceFlags → surveyor citations, risk level
 *   followUps    → post-event closure criteria
 *
 * Template level: matches or exceeds EVT-QAPI-MAY-001 (the gold standard).
 */

import type { RegulatoryEvent } from './regulatoryEvents';
import { enforceBusinessDay } from './regulatoryEvents';
import { applyEventAlignmentPolicy } from './eventAlignmentPolicy';
import { MULTI_YEAR_EVENTS } from './multiYearEvents';
import { AUDIT_REGULATORY_EVENTS } from './auditRegulatoryEvents';

/* ══════════════════════════════════════════════════════════════
   QUARTERLY QAPI REVIEWS — Q2, Q3, Q4 2026
   Q1 is EVT-QAPI-2026-0205-QGOV in regulatoryEvents.ts (upgraded below)
   ══════════════════════════════════════════════════════════════ */

export const QAPI_Q2: RegulatoryEvent = {
  id: 'qapi_meeting-20260507-08',
  workflowId: 'QA-WF-03',
  eventSubType: 'qapi_meeting',
  title: 'Q2 QAPI Review',
  domain: 'QAPI',
  date: '2026-05-01', // first Friday per alignment
  time: '13:00',
  timeEnd: '15:00',
  cadence: 'Quarterly',
  mandateType: 'policy-driven',
  urgency: 'due-soon',
  policyRefs: ['QA-PG-001', 'QA-PIP-001', 'QA-PI-001'],
  owner: 'Clinical Manager',
  ownerRole: 'QAPI Lead',
  location: 'Main Office / Conference Room A',
  summary: 'Q2 policy-driven QAPI governance review: PIP Q2 remeasurement, dashboard review, incident & adverse event analysis, infection control integration, action plan update, and Governing Body report preparation.',
  regulatoryDriver: '42 CFR §484.65 — QAPI CoP: ongoing data-driven quality program. Agency policy requires quarterly review cadence. Annual PIP remeasurement required at Q2.',
  category: 'qapi-quarterly-governance',
  processFlow: [
    {
      id: 'q2-pre-dashboard',
      label: 'Compile Q2 QAPI data dashboard',
      description: 'Pull all Q2 quality indicators: OASIS outcomes, hospitalization rates, wound care, medication reconciliation, infection events, complaint trends.',
      instructions: '1. Pull OASIS quality metrics from EMR (hospitalization, re-hospitalization, wound outcomes, medication reconciliation)\n2. Pull infection event log from IC coordinator (QA-FM-027)\n3. Pull complaint/grievance log from compliance office\n4. Pull HHCAHPS interim results if available\n5. Compare all indicators to Q1 baseline and annual thresholds\n6. Highlight any indicator outside threshold in red on dashboard\n7. Attach completed dashboard to QA-FM-020',
      expectedOutput: 'Completed Q2 Data Dashboard (QA-FM-020) with all indicators, Q1 vs Q2 trends, and threshold flags',
      requiredFormIds: ['QA-FM-020'],
      onCompleteText: 'Dashboard compiled and distributed. Ready for meeting review.',
      status: 'pending',
      dueOffsetDays: -7,
    },
    {
      id: 'q2-pre-chart-audit',
      label: 'Complete Q2 chart audits',
      description: 'Conduct stratified sample chart audits across clinical domains before the meeting.',
      instructions: '1. Select minimum 10% sample of active patient records (minimum 5)\n2. Audit for: OASIS completeness, POC currency and physician signatures, medication reconciliation documentation, visit note timeliness (within 24h), advance directive documentation\n3. Complete Audit Summary Form (QA-FM-025) for each domain audited\n4. Aggregate findings into a one-page summary\n5. Flag any systemic documentation gaps for QAPI discussion',
      expectedOutput: 'Completed Q2 Chart Audit Summary (QA-FM-025) with aggregate findings by domain',
      requiredFormIds: ['QA-FM-025'],
      onCompleteText: 'Chart audits complete. Systemic findings flagged for agenda item 3.',
      status: 'pending',
      dueOffsetDays: -5,
    },
    {
      id: 'q2-pre-incident-summary',
      label: 'Prepare Q2 incident and adverse event summary report',
      description: 'Compile all Q2 incidents by type and identify systemic patterns.',
      instructions: '1. Pull all incident reports filed in Q2 from incident management log\n2. Categorize by type: falls, medication errors, complaints, hospitalizations, abuse/neglect allegations, near misses\n3. Calculate rate per 100 patient episodes for each category\n4. Identify any repeat incidents involving the same aide, patient, or process\n5. Flag any incident that warrants Root Cause Analysis\n6. Complete Incident Log Summary (QA-FM-026) with counts and pattern notes',
      expectedOutput: 'Q2 Incident Summary (QA-FM-026) with categorization, rate calculation, and pattern analysis',
      requiredFormIds: ['QA-FM-026'],
      onCompleteText: 'Incident summary ready. Systemic issues flagged for agenda item 4 discussion.',
      status: 'pending',
      dueOffsetDays: -5,
    },
    {
      id: 'q2-pre-infection-log',
      label: 'Prepare Q2 infection control log for QAPI integration',
      description: 'IC coordinator prepares Q2 infection surveillance report for QAPI integration.',
      instructions: '1. Pull infection event log: UTIs, wound infections, respiratory infections, SARS-CoV-2, influenza\n2. Calculate infection rates per 100 patient episodes and compare to Q1 baseline\n3. Document PPE compliance audit results (% compliant across observed visits)\n4. Identify any exposure incidents and their resolution status\n5. Complete Infection Control Log (QA-FM-027) with Q2 data and trend analysis',
      expectedOutput: 'Q2 Infection Control Log (QA-FM-027) ready for QAPI integration',
      requiredFormIds: ['QA-FM-027'],
      onCompleteText: 'Infection control data compiled and integrated into Q2 QAPI package.',
      status: 'pending',
      dueOffsetDays: -3,
    },
    {
      id: 'q2-pre-pip-remeasure',
      label: 'Q2 PIP remeasurement — compare to Q1 baseline and annual target',
      description: 'Pull Q2 data for the active annual PIP indicator and document remeasurement results.',
      instructions: '1. Retrieve Q2 data for the annual PIP indicator (established Q1)\n2. Calculate Q2 rate and compare: Q2 actual vs. Q1 baseline vs. annual target\n3. Document whether intervention is producing improvement\n4. If Q2 result < Q1: review intervention fidelity, identify barriers, revise plan\n5. If Q2 result ≥ target: begin sustainment documentation\n6. Update PIP Form (QA-FM-021) with Q2 remeasurement data, interpretation, and next steps',
      expectedOutput: 'PIP Form (QA-FM-021) updated with Q2 remeasurement results, trend chart, and decision note',
      requiredFormIds: ['QA-FM-021'],
      onCompleteText: 'PIP Q2 remeasurement documented. Results ready for committee review at agenda item 7.',
      status: 'pending',
      dueOffsetDays: -3,
    },
    {
      id: 'q2-pre-action-review',
      label: 'Review status of all Q1 action plan items',
      description: 'Document current status of every Q1 corrective action before the Q2 meeting.',
      instructions: '1. Open Action Item Tracker (QA-FM-022)\n2. For each Q1 action item: mark COMPLETED (with evidence note) or OVERDUE (with barrier explanation)\n3. Escalate any action more than 30 days overdue to Administrator before the meeting\n4. Prepare 2-minute verbal summary for agenda item 2',
      expectedOutput: 'Updated Q1 action items in QA-FM-022 with current status on every row',
      requiredFormIds: ['QA-FM-022'],
      onCompleteText: 'Q1 action plan review complete. Overdue items escalated as needed.',
      status: 'pending',
      dueOffsetDays: -2,
    },
    {
      id: 'q2-during-meeting',
      label: 'Conduct Q2 QAPI review session per structured agenda',
      description: 'Run full Q2 QAPI review. Confirm quorum, walk through all 10 agenda topics, record decisions.',
      instructions: '1. Confirm quorum: Administrator, DON, Clinical Manager(s), QA/Compliance, IC Lead present\n2. Confirm prior meeting minutes approved — call motion and vote\n3. Review Q1 action plan status (agenda item 2)\n4. Walk through Q2 dashboard — discuss each indicator, identify threshold breaches (agenda item 3)\n5. Review Q2 incident summary by category — conduct group RCA for systemic issues (agenda item 4)\n6. IC lead presents Q2 infection data — committee identifies QAPI-actionable trends (agenda item 5)\n7. Review CMS regulatory updates — assign policy update owners (agenda item 6)\n8. Review PIP Q2 remeasurement — committee decides continue/revise/new PIP (agenda item 7)\n9. Assign all new corrective actions: owner, due date, success criteria, evidence required (agenda item 8)\n10. Identify Governing Body escalation items (agenda item 9)\n11. Attestation and sign-off by all present (agenda item 10)',
      expectedOutput: 'Meeting conducted on record. All 10 agenda items addressed. Attendance log and draft minutes initiated.',
      requiredFormIds: ['QA-FM-024', 'QA-FM-022'],
      onCompleteText: 'Q2 QAPI review complete. All decisions recorded. Minutes draft in progress.',
      status: 'pending',
      dueOffsetDays: 0,
    },
    {
      id: 'q2-post-minutes',
      label: 'Finalize Q2 QAPI meeting minutes within 7 days',
      description: 'Draft, review, obtain signatures, and file meeting minutes within 7 calendar days.',
      instructions: '1. Complete QAPI Minutes Form (QA-FM-024) with all discussion points, decisions, and vote records\n2. Include full attendance record with quorum confirmation\n3. Cross-reference each new action item to the tracker row in QA-FM-022\n4. Route to QAPI Committee Chair for review within 3 days\n5. Obtain required signatures: Administrator, Clinical Manager, QAPI Committee Chair\n6. File in audit repository with all supporting evidence attached',
      expectedOutput: 'Finalized, signed Q2 QAPI Meeting Minutes (QA-FM-024) stored in audit-ready location',
      requiredFormIds: ['QA-FM-024'],
      onCompleteText: 'Minutes finalized and filed. Q2 event is audit-ready.',
      status: 'pending',
      dueOffsetDays: 7,
    },
    {
      id: 'q2-post-action-publish',
      label: 'Publish Q2 action plan and distribute to all owners',
      description: 'Finalize action plan, distribute to owners, and activate tracking for all Q2 assignments.',
      instructions: '1. Finalize QA-FM-022 Action Plan with all Q2 assignments\n2. Export action list with owner names, due dates, and success criteria\n3. Distribute via tracked channel to each action owner — retain distribution record\n4. Set calendar reminders for each action due date',
      expectedOutput: 'Published Q2 Action Plan distributed to all owners with tracking active',
      requiredFormIds: ['QA-FM-022'],
      onCompleteText: 'Action plan published. All owners notified with tracked distribution evidence.',
      status: 'pending',
      dueOffsetDays: 3,
    },
    {
      id: 'q2-post-gb-report',
      label: 'Submit Quarterly QAPI Report to Governing Body (T+7 days)',
      description: 'Compile and submit the Q2 QAPI governance report to the Governing Body at least 7 days before the Q2 board meeting.',
      instructions: '1. Complete Quarterly QAPI Report (QA-FM-023) with Q2 summary data\n2. Include: indicator dashboard, PIP Q2 remeasurement, incident trends, IC data, open action log, GB escalation items\n3. Administrator signs off before submission\n4. Submit to Governing Body via tracked channel 7 days before quarterly board meeting\n5. Retain submission confirmation as evidence',
      expectedOutput: 'Signed Q2 Quarterly QAPI Report (QA-FM-023) delivered to Governing Body with submission record',
      requiredFormIds: ['QA-FM-023'],
      onCompleteText: 'QAPI report submitted to Governing Body. Evidence loop closed for Q2.',
      status: 'pending',
      dueOffsetDays: 7,
    },
  ],
  requiredForms: [
    { id: 'q2-f-dashboard', label: 'Q2 QAPI Data Dashboard',              formId: 'QA-FM-020', status: 'pending', dueOffsetDays: -7 },
    { id: 'q2-f-pip',       label: 'Annual PIP Form — Q2 Remeasurement',  formId: 'QA-FM-021', status: 'pending', dueOffsetDays: -3 },
    { id: 'q2-f-action',    label: 'QAPI Action Item Log / Action Plan',  formId: 'QA-FM-022', status: 'pending', dueOffsetDays:  3 },
    { id: 'q2-f-report',    label: 'Quarterly QAPI Governance Report',    formId: 'QA-FM-023', status: 'pending', dueOffsetDays:  7 },
    { id: 'q2-f-minutes',   label: 'QAPI Meeting Minutes',                formId: 'QA-FM-024', status: 'pending', dueOffsetDays:  7 },
    { id: 'q2-f-audit',     label: 'Chart Audit Summary',                 formId: 'QA-FM-025', status: 'pending', dueOffsetDays: -5 },
    { id: 'q2-f-incident',  label: 'Incident Report Log Q2',              formId: 'QA-FM-026', status: 'pending', dueOffsetDays: -5 },
    { id: 'q2-f-infection', label: 'Infection Control Log Q2',            formId: 'QA-FM-027', status: 'pending', dueOffsetDays: -3 },
  ],
  minutes: {
    status: 'missing',
    dueOffsetDays: 7,
    assignee: 'Clinical Manager',
    requiredSections: [
      'Attendance & quorum confirmation (required roles listed)',
      'Approval of prior meeting minutes — motion and vote recorded',
      'Q1 action plan status — completed, overdue, escalated items',
      'Q2 data dashboard review — all indicators with threshold comparison',
      'Q2 incident & adverse event analysis — categorization and RCA findings',
      'Q2 infection control review — rates, trends, PPE compliance',
      'PIP Q2 remeasurement — result, interpretation, decision',
      'Policy & regulatory alignment — updates identified and owners assigned',
      'New corrective actions — owner, due date, success criteria for each',
      'Governing Body escalation items identified',
      'Attestation of participation by all present',
      'Adjournment & next meeting date confirmed',
    ],
    signOffRoles: ['Administrator', 'Clinical Manager', 'QAPI Committee Chair'],
  },
  agenda: {
    distributeBusinessDaysBefore: 5,
    standingTopics: [
      {
        id: 'q2-t1', title: 'Opening & Compliance Validation',
        discussionPoints: [
          'Confirm quorum — required: Administrator, DON, Clinical Manager(s), QA/Compliance, IC Lead',
          'Confirm prior meeting minutes are approved on record',
          'Disclose any conflicts of interest',
        ],
        durationMin: 10,
      },
      {
        id: 'q2-t2', title: 'Prior Quarter Action Plan Review',
        discussionPoints: [
          'Review all Q1 PIP corrective action items — completed vs. overdue',
          'Document barriers and root causes for any overdue item',
          'Close completed actions with evidence reference on record',
          'Escalate any action >30 days overdue to Administrator',
        ],
        requiredInputs: ['QA-FM-022 Action Item Tracker — Q1 status column'],
        owner: 'QAPI Lead', durationMin: 20,
      },
      {
        id: 'q2-t3', title: 'Q2 Data Dashboard Review',
        discussionPoints: [
          'Clinical Quality: hospitalization rate vs. threshold; re-hospitalization; wound outcomes; medication reconciliation %',
          'Clinical Quality: infection rates per 100 episodes vs. Q1 and annual target',
          'Operational: timeliness of documentation; OASIS submission compliance %; visit utilization variance',
          'Compliance: incident rates by type; complaint/grievance trends; chart audit findings',
          'Flag any indicator outside threshold — determine if corrective action or PIP required',
        ],
        requiredInputs: ['QA-FM-020 Q2 Data Dashboard', 'QA-FM-025 Chart Audit Summary', 'QA-FM-027 IC Log'],
        owner: 'QAPI Lead', durationMin: 30,
      },
      {
        id: 'q2-t4', title: 'Incident & Adverse Event Analysis',
        discussionPoints: [
          'All Q2 incidents by category: falls, medication errors, complaints, hospitalizations, abuse allegations, near misses',
          'Root cause analysis for any incident with systemic or repeat characteristics',
          'Identify systemic issues — does any pattern require a PIP or policy change?',
          'Confirm all incidents were reported through proper channels and investigated',
        ],
        requiredInputs: ['QA-FM-026 Q2 Incident Report Log'],
        owner: 'Clinical Manager', durationMin: 20,
      },
      {
        id: 'q2-t5', title: 'Infection Control Review',
        discussionPoints: [
          'Q2 infection event counts by type: UTI, wound, respiratory, SARS-CoV-2',
          'Infection rate trend Q1 → Q2, comparison to annual target',
          'PPE compliance audit results — % compliant across observed visits',
          'Any exposure incidents and their investigation/resolution status',
          'IC data findings that should drive QAPI corrective actions',
        ],
        requiredInputs: ['QA-FM-027 Infection Control Log Q2'],
        owner: 'Infection Control Lead', durationMin: 15,
      },
      {
        id: 'q2-t6', title: 'Policy & Regulatory Alignment',
        discussionPoints: [
          'Any CMS regulatory updates issued in Q2 2026 that affect this agency',
          'Which current policies are impacted — assign update owner and due date',
          'Confirm P&P library version is current and accessible to all staff',
        ],
        owner: 'Compliance Officer', durationMin: 15,
      },
      {
        id: 'q2-t7', title: 'PIP Q2 Remeasurement & New PIP Determination',
        discussionPoints: [
          'Q2 remeasurement result vs. Q1 baseline and annual target',
          'If target met: begin sustainment documentation — next remeasurement in Q3',
          'If target not met: revise intervention plan — new owner, revised due date',
          'Any new performance gap identified from dashboard requiring a new PIP?',
          'For any new PIP: define objective, baseline, target, timeline, measurement frequency, owner',
        ],
        requiredInputs: ['QA-FM-021 PIP Form with Q2 remeasurement data'],
        owner: 'QAPI Lead', durationMin: 20,
      },
      {
        id: 'q2-t8', title: 'Action Plan Creation & Assignment',
        discussionPoints: [
          'Assign all corrective actions identified during agenda items 3–7',
          'Each action must have: named owner, due date, measurable success criteria, evidence required',
          'Record every action in QA-FM-022 Action Item Tracker before adjourning',
          'Set review checkpoints for actions due before Q3 QAPI review',
        ],
        owner: 'QAPI Lead', durationMin: 20,
      },
      {
        id: 'q2-t9', title: 'Governing Body Escalation',
        discussionPoints: [
          'Identify items requiring Governing Body awareness or formal approval',
          'Prepare these items for the Q2 QAPI Report to GB (QA-FM-023)',
          'Confirm Q2 Governing Body meeting date and packet submission deadline (T-7 days)',
        ],
        owner: 'Administrator', durationMin: 10,
      },
      {
        id: 'q2-t10', title: 'Closing & Attestation',
        discussionPoints: [
          'Final review: confirm all agenda items addressed and all actions have owners',
          'All participants attest to attendance and accuracy of discussion on record',
          'Confirm minutes will be drafted within 7 calendar days',
          'Confirm Q3 QAPI Review date',
        ],
        durationMin: 10,
      },
    ],
    dataInputs: [
      { label: 'Q2 QAPI Data Dashboard',         formId: 'QA-FM-020', owner: 'QAPI Lead' },
      { label: 'Q2 Chart Audit Summary',          formId: 'QA-FM-025', owner: 'Clinical Manager' },
      { label: 'Q2 Incident Report Log',          formId: 'QA-FM-026', owner: 'Clinical Manager' },
      { label: 'Q2 Infection Control Log',        formId: 'QA-FM-027', owner: 'IC Lead' },
      { label: 'PIP Form — Q2 Remeasurement',     formId: 'QA-FM-021', owner: 'QAPI Lead' },
      { label: 'Q1 Action Item Tracker (status)', formId: 'QA-FM-022', owner: 'QAPI Lead' },
    ],
  },
  approvals: [
    { id: 'q2-ap-min',    targetKind: 'minutes', targetLabel: 'Q2 QAPI Meeting Minutes',           approverRole: 'QAPI Committee Chair', required: true, escalationDays: 7, escalateToRole: 'Administrator' },
    { id: 'q2-ap-pip',    targetKind: 'form',    targetLabel: 'PIP Form Q2 Remeasurement',         approverRole: 'Clinical Manager',     required: true, escalationDays: 5 },
    { id: 'q2-ap-action', targetKind: 'report',  targetLabel: 'Q2 Action Plan',                   approverRole: 'Administrator',        required: true, escalationDays: 5 },
    { id: 'q2-ap-report', targetKind: 'report',  targetLabel: 'Quarterly QAPI Report to Gov Body', approverRole: 'Administrator',        required: true, escalationDays: 3, escalateToRole: 'Board Chair' },
  ],
  complianceFlags: {
    auditRisk: 'critical',
    overdueAfterDays: 0,
    citation: '42 CFR §484.65 — QAPI Condition of Participation',
    surveyorNote: 'Surveyors cite four instant findings: (1) no evidence of QAPI program effectiveness, (2) lack of data-driven decision making, (3) no documented corrective actions, (4) no follow-up on performance issues. All four materialize if minutes/action plans are missing or unsigned.',
    missingEvidenceIf: ['missing', 'pending'],
  },
  followUps: [
    { id: 'q2-fu-min',     label: 'File signed minutes + attendance + dashboard bundle',      ownerRole: 'QAPI Lead',       dueOffsetDays: 7,  closureCriteria: 'Signed QA-FM-024 filed with full Q2 evidence bundle in audit repository.', escalationDays: 7, escalateToRole: 'Administrator' },
    { id: 'q2-fu-pip',     label: 'Continue PIP remeasurement — Q3 data collection',         ownerRole: 'QAPI Lead',       dueOffsetDays: 60, closureCriteria: 'Q3 remeasurement data collected and QA-FM-021 updated.', escalationDays: 14, escalateToRole: 'Administrator' },
    { id: 'q2-fu-actions', label: 'Weekly action item follow-through until Q3 meeting',      ownerRole: 'QAPI Lead',       dueOffsetDays: 14, closureCriteria: 'Each open action has an updated status note within 7 days.', escalationDays: 14, escalateToRole: 'Administrator' },
    { id: 'q2-fu-gb',      label: 'Submit Q2 QAPI report to Governing Body (T+7)',           ownerRole: 'QAPI Lead',       dueOffsetDays: 7,  closureCriteria: 'QA-FM-023 submitted to GB with receipt confirmation.', escalationDays: 3, escalateToRole: 'Administrator' },
  ],
  dependencies: { feeds: ['EVT-GV-Q2-2026'], dependsOn: ['qapi_meeting-20260205-04'] },
  sourceOfTruth: 'app',
  timezone: 'America/Los_Angeles',
  helpArticle: {
    id: 'KB-QAPI-002', title: 'Q2 QAPI Review — Execution Guide',
    topics: ['Pre-meeting data preparation', 'Dashboard review and threshold analysis', 'PIP remeasurement methodology', 'Incident categorization and RCA', 'Action plan assignment', 'Governing Body escalation requirements', 'Evidence bundle filing'],
  },
};

/* ── Q3 QAPI Review ─────────────────────────────────────────── */
export const QAPI_Q3: RegulatoryEvent = {
  id: 'qapi_meeting-20260806-12',
  workflowId: 'QA-WF-03',
  eventSubType: 'qapi_meeting',
  title: 'Q3 QAPI Review',
  domain: 'QAPI',
  date: '2026-08-06',
  time: '13:00',
  timeEnd: '15:00',
  cadence: 'Quarterly',
  mandateType: 'policy-driven',
  urgency: 'scheduled',
  policyRefs: ['QA-PG-001', 'QA-PIP-001'],
  owner: 'Clinical Manager',
  ownerRole: 'QAPI Lead',
  location: 'Main Office / Conference Room A',
  summary: 'Q3 QAPI governance review: PIP Q3 remeasurement, mid-year performance analysis, adverse event trending, infection surveillance, corrective action tracking, and sustainment planning.',
  regulatoryDriver: '42 CFR §484.65 — QAPI CoP ongoing program. Q3 is the critical sustainment checkpoint for the annual PIP.',
  category: 'qapi-quarterly-governance',
  processFlow: [
    { id: 'q3-pre-dashboard', label: 'Compile Q3 QAPI data dashboard',     description: 'Pull all Q3 quality indicators with Q1–Q3 trend analysis.', instructions: '1. Pull Q3 OASIS outcomes, hospitalization, wound, medication reconciliation data\n2. Pull IC log from coordinator\n3. Pull complaint/grievance log\n4. Build YTD trend chart (Q1-Q2-Q3) for every indicator\n5. Highlight indicators outside threshold for committee attention', expectedOutput: 'Q3 Data Dashboard (QA-FM-020) with Q1-Q3 trend analysis', requiredFormIds: ['QA-FM-020'], onCompleteText: 'Q3 dashboard compiled with YTD trends.', status: 'pending', dueOffsetDays: -7 },
    { id: 'q3-pre-chart-audit', label: 'Complete Q3 chart audits', description: 'Minimum 10% stratified sample chart audit.', instructions: '1. Select minimum 10% sample of active records\n2. Audit: OASIS completeness, POC currency, physician signatures, timeliness, medication reconciliation\n3. Compare findings to Q2 audit results — is documentation improving or declining?', expectedOutput: 'Q3 Chart Audit Summary (QA-FM-025)', requiredFormIds: ['QA-FM-025'], onCompleteText: 'Q3 chart audits complete.', status: 'pending', dueOffsetDays: -5 },
    { id: 'q3-pre-incident', label: 'Prepare Q3 incident summary', description: 'Compile Q3 incidents with YTD trend comparison.', instructions: '1. Pull Q3 incident reports by category\n2. Compare Q3 rates to Q1 and Q2 — identify worsening trends\n3. Flag any sentinel events for RCA at meeting', expectedOutput: 'Q3 Incident Summary (QA-FM-026) with YTD trends', requiredFormIds: ['QA-FM-026'], onCompleteText: 'Q3 incident summary ready.', status: 'pending', dueOffsetDays: -5 },
    { id: 'q3-pre-pip', label: 'Q3 PIP remeasurement — sustainment or continuation decision', description: 'Third remeasurement of annual PIP. This is the sustainment decision point.', instructions: '1. Calculate Q3 rate for PIP indicator\n2. Compare Q1 baseline → Q2 → Q3 — is trend sustained?\n3. If Q3 ≥ target for second consecutive quarter: prepare sustainment plan\n4. If Q3 < target: escalate — consider whether PIP needs escalation to GB\n5. Update QA-FM-021 with Q3 data and committee recommendation', expectedOutput: 'PIP Form (QA-FM-021) updated with Q3 data and sustainment/continuation recommendation', requiredFormIds: ['QA-FM-021'], onCompleteText: 'Q3 PIP remeasurement complete. Sustainment or escalation decision documented.', status: 'pending', dueOffsetDays: -3 },
    { id: 'q3-during', label: 'Conduct Q3 QAPI review session', description: 'Full Q3 review per structured agenda.', instructions: '1. Confirm quorum\n2. Walk through Q3 dashboard with YTD trends\n3. Q3 incident analysis — any new systemic patterns?\n4. IC Q3 data — are infection control QAPI actions working?\n5. PIP Q3 sustainment/continuation decision\n6. Review all Q2 action items\n7. Assign Q3 corrective actions with owners\n8. Prepare GB escalation list\n9. Attestation', expectedOutput: 'Q3 QAPI review completed with all agenda items on record.', requiredFormIds: ['QA-FM-024', 'QA-FM-022'], onCompleteText: 'Q3 QAPI review complete.', status: 'pending', dueOffsetDays: 0 },
    { id: 'q3-post-minutes', label: 'Finalize Q3 minutes', description: 'Draft, sign, and file within 7 days.', instructions: '1. Complete QA-FM-024 with Q3 discussion\n2. Include full attendance and quorum confirmation\n3. Obtain signatures: Administrator, Clinical Manager, QAPI Committee Chair', expectedOutput: 'Signed Q3 QAPI Minutes (QA-FM-024) filed in audit repository', requiredFormIds: ['QA-FM-024'], onCompleteText: 'Q3 minutes filed. Event audit-ready.', status: 'pending', dueOffsetDays: 7 },
    { id: 'q3-post-gb-report', label: 'Submit Q3 QAPI Report to Governing Body', description: 'Compile and deliver Q3 QAPI governance report 7 days before Q3 board meeting.', instructions: '1. Complete QA-FM-023 Q3 report\n2. Administrator sign-off\n3. Submit to GB 7 days before board meeting', expectedOutput: 'Signed Q3 QAPI Report to Governing Body with submission record', requiredFormIds: ['QA-FM-023'], onCompleteText: 'Q3 QAPI report delivered to Governing Body.', status: 'pending', dueOffsetDays: 7 },
  ],
  requiredForms: [
    { id: 'q3-f-dashboard', label: 'Q3 QAPI Data Dashboard (YTD)',         formId: 'QA-FM-020', status: 'pending', dueOffsetDays: -7 },
    { id: 'q3-f-pip',       label: 'PIP Form — Q3 Remeasurement',          formId: 'QA-FM-021', status: 'pending', dueOffsetDays: -3 },
    { id: 'q3-f-action',    label: 'Action Item Log / Plan Q3',            formId: 'QA-FM-022', status: 'pending', dueOffsetDays:  3 },
    { id: 'q3-f-report',    label: 'Quarterly QAPI Governance Report Q3',  formId: 'QA-FM-023', status: 'pending', dueOffsetDays:  7 },
    { id: 'q3-f-minutes',   label: 'QAPI Meeting Minutes Q3',              formId: 'QA-FM-024', status: 'pending', dueOffsetDays:  7 },
    { id: 'q3-f-audit',     label: 'Chart Audit Summary Q3',               formId: 'QA-FM-025', status: 'pending', dueOffsetDays: -5 },
    { id: 'q3-f-incident',  label: 'Incident Log Q3 with YTD trends',      formId: 'QA-FM-026', status: 'pending', dueOffsetDays: -5 },
    { id: 'q3-f-infection', label: 'Infection Control Log Q3',             formId: 'QA-FM-027', status: 'pending', dueOffsetDays: -3 },
  ],
  minutes: {
    status: 'missing', dueOffsetDays: 7, assignee: 'Clinical Manager',
    requiredSections: ['Attendance & quorum', 'Prior minutes approval', 'Q3 dashboard review with YTD trends', 'Q3 incident analysis', 'Q3 IC review', 'PIP Q3 sustainment decision', 'Q2 action plan status', 'New Q3 corrective actions', 'GB escalations', 'Attestation', 'Adjournment'],
    signOffRoles: ['Administrator', 'Clinical Manager', 'QAPI Committee Chair'],
  },
  agenda: {
    distributeBusinessDaysBefore: 5,
    standingTopics: [
      { id: 'q3-t1', title: 'Opening & Compliance Validation', discussionPoints: ['Confirm quorum', 'Approve prior minutes', 'Disclose COI'], durationMin: 10 },
      { id: 'q3-t2', title: 'Q2 Action Plan Review', discussionPoints: ['Status of all Q2 corrective actions', 'Close completed with evidence', 'Escalate overdue items'], requiredInputs: ['QA-FM-022'], owner: 'QAPI Lead', durationMin: 20 },
      { id: 'q3-t3', title: 'Q3 Dashboard — YTD Performance Analysis', discussionPoints: ['Q1-Q2-Q3 trend for all indicators', 'Mid-year trajectory vs. annual targets', 'Identify indicators needing intervention before year-end'], requiredInputs: ['QA-FM-020', 'QA-FM-025'], owner: 'QAPI Lead', durationMin: 30 },
      { id: 'q3-t4', title: 'Q3 Incident & Adverse Event Analysis', discussionPoints: ['Q3 incidents by category', 'YTD trend — worsening or improving?', 'Systemic RCA for repeat patterns'], requiredInputs: ['QA-FM-026'], owner: 'Clinical Manager', durationMin: 20 },
      { id: 'q3-t5', title: 'Q3 Infection Control Review', discussionPoints: ['Q3 infection rates vs. Q1-Q2', 'IC action effectiveness', 'Any exposure incidents'], requiredInputs: ['QA-FM-027'], owner: 'IC Lead', durationMin: 15 },
      { id: 'q3-t6', title: 'PIP Sustainment Decision', discussionPoints: ['Q3 remeasurement vs. baseline and target', 'Two-consecutive-quarter sustainment test', 'Escalation decision if target still not met', 'Any new PIP required for year-end?'], requiredInputs: ['QA-FM-021'], owner: 'QAPI Lead', durationMin: 20 },
      { id: 'q3-t7', title: 'Q3 Action Plan & GB Escalation', discussionPoints: ['Assign all new corrective actions with owners and due dates', 'Identify GB escalation items for Q3 report'], owner: 'QAPI Lead', durationMin: 25 },
      { id: 'q3-t8', title: 'Closing & Attestation', discussionPoints: ['Confirm all actions assigned', 'Attestation by all present', 'Confirm Q4 QAPI Review date'], durationMin: 10 },
    ],
    dataInputs: [
      { label: 'Q3 QAPI Data Dashboard (YTD)', formId: 'QA-FM-020', owner: 'QAPI Lead' },
      { label: 'Q3 Chart Audit Summary', formId: 'QA-FM-025', owner: 'Clinical Manager' },
      { label: 'Q3 Incident Log', formId: 'QA-FM-026', owner: 'Clinical Manager' },
      { label: 'Q3 Infection Control Log', formId: 'QA-FM-027', owner: 'IC Lead' },
      { label: 'PIP Form Q3 Remeasurement', formId: 'QA-FM-021', owner: 'QAPI Lead' },
    ],
  },
  approvals: [
    { id: 'q3-ap-min',    targetKind: 'minutes', targetLabel: 'Q3 QAPI Meeting Minutes',           approverRole: 'QAPI Committee Chair', required: true, escalationDays: 7, escalateToRole: 'Administrator' },
    { id: 'q3-ap-pip',    targetKind: 'form',    targetLabel: 'PIP Form Q3 Sustainment Decision',  approverRole: 'Clinical Manager',     required: true, escalationDays: 5 },
    { id: 'q3-ap-action', targetKind: 'report',  targetLabel: 'Q3 Action Plan',                   approverRole: 'Administrator',        required: true, escalationDays: 5 },
    { id: 'q3-ap-report', targetKind: 'report',  targetLabel: 'Q3 QAPI Report to Governing Body', approverRole: 'Administrator',        required: true, escalationDays: 3, escalateToRole: 'Board Chair' },
  ],
  complianceFlags: { auditRisk: 'critical', overdueAfterDays: 0, citation: '42 CFR §484.65 — QAPI CoP', surveyorNote: 'Q3 is the PIP sustainment decision point. If no sustainment evidence exists, surveyors will find a gap in the required annual PIP cycle.', missingEvidenceIf: ['missing', 'pending'] },
  followUps: [
    { id: 'q3-fu-min',  label: 'File Q3 minutes + evidence bundle',            ownerRole: 'QAPI Lead', dueOffsetDays: 7,  closureCriteria: 'Signed QA-FM-024 filed with Q3 evidence.', escalationDays: 7, escalateToRole: 'Administrator' },
    { id: 'q3-fu-pip',  label: 'PIP sustainment monitoring — Q4 data prep',    ownerRole: 'QAPI Lead', dueOffsetDays: 60, closureCriteria: 'Q4 data collected and QA-FM-021 updated for Q4 close.', escalationDays: 14, escalateToRole: 'Administrator' },
    { id: 'q3-fu-gb',   label: 'Submit Q3 QAPI report to Governing Body',       ownerRole: 'QAPI Lead', dueOffsetDays: 7,  closureCriteria: 'QA-FM-023 delivered to GB with receipt.', escalationDays: 3, escalateToRole: 'Administrator' },
  ],
  dependencies: { feeds: ['EVT-GV-Q3-2026'], dependsOn: ['qapi_meeting-20260507-08'] },
  sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
};

/* ── Q4 QAPI Review + Annual PIP Close ─────────────────────── */
export const QAPI_Q4: RegulatoryEvent = {
  id: 'qapi_meeting-20261105-16',
  workflowId: 'QA-WF-03',
  eventSubType: 'qapi_meeting',
  title: 'Q4 QAPI Review + Annual PIP Close',
  domain: 'QAPI',
  date: '2026-11-05',
  time: '13:00',
  timeEnd: '15:00',
  cadence: 'Quarterly',
  mandateType: 'policy-driven',
  urgency: 'scheduled',
  policyRefs: ['QA-PG-001', 'QA-PIP-001'],
  owner: 'Clinical Manager',
  ownerRole: 'QAPI Lead',
  summary: 'Q4 QAPI governance review with mandatory annual PIP closure. Includes Q4 remeasurement, sustainment plan documentation, annual QAPI program evaluation kickoff, and Governing Body annual report preparation.',
  regulatoryDriver: '42 CFR §484.65(d) — At least one PIP per calendar year must be documented with baseline, target, interventions, remeasurement, and sustainment. Q4 is the annual close and compliance verification point.',
  category: 'qapi-quarterly-governance',
  processFlow: [
    { id: 'q4-pre-dashboard', label: 'Compile Q4 and annual QAPI data dashboard', description: 'Full-year data dashboard: all four quarters with annual trend analysis.', instructions: '1. Pull Q4 indicators\n2. Build full-year (Q1-Q4) trend charts for all indicators\n3. Calculate annual rates vs. annual targets\n4. Identify any indicator that failed to meet annual target\n5. Document these in dashboard for annual program evaluation', expectedOutput: 'Q4 / Annual QAPI Data Dashboard (QA-FM-020) with full-year analysis', requiredFormIds: ['QA-FM-020'], onCompleteText: 'Annual dashboard compiled. Ready for Q4 review and PIP close.', status: 'pending', dueOffsetDays: -7 },
    { id: 'q4-pre-pip-close', label: 'Annual PIP final remeasurement and close documentation', description: 'Complete Q4 (final) remeasurement and prepare PIP closure package.', instructions: '1. Calculate Q4 indicator rate\n2. Compare full Q1→Q4 trend vs. baseline and annual target\n3. If target met: document sustainment plan — who monitors, how often, for how long\n4. If target not met: document why, what was learned, what carries forward to FY27\n5. Complete PIP Closure section of QA-FM-021\n6. Attach to annual QAPI evaluation packet', expectedOutput: 'PIP Form (QA-FM-021) completed with Q4 final result and formal closure / continuation decision', requiredFormIds: ['QA-FM-021'], onCompleteText: 'Annual PIP formally closed or carried forward with documentation.', status: 'pending', dueOffsetDays: -5 },
    { id: 'q4-pre-annual-eval', label: 'Prepare annual QAPI program self-evaluation framework', description: 'Start the annual QAPI program evaluation that will be completed post-Q4 meeting.', instructions: '1. Review all four quarterly minutes and action logs\n2. Calculate: how many actions opened, how many closed, closure rate\n3. Evaluate PIP cycle completion and evidence quality\n4. Draft the annual evaluation summary template (QA-FM-028)', expectedOutput: 'Draft Annual QAPI Evaluation (QA-FM-028) with pre-populated data', requiredFormIds: ['QA-FM-028'], onCompleteText: 'Annual evaluation framework ready for committee completion.', status: 'pending', dueOffsetDays: -5 },
    { id: 'q4-during', label: 'Conduct Q4 QAPI review and annual PIP closure session', description: 'Full Q4 review with mandatory annual PIP closure agenda items.', instructions: '1. Confirm quorum\n2. Review Q3 action plan status\n3. Present full-year dashboard — annual performance vs. targets\n4. Q4 incident and IC analysis\n5. Annual PIP formal close: committee votes on sustainment or continuation\n6. Identify FY27 PIP topic based on full-year data\n7. Assign Q4 corrective actions\n8. GB escalation prep — prepare annual QAPI report\n9. Attestation', expectedOutput: 'Q4 QAPI review complete with annual PIP formally closed on record.', requiredFormIds: ['QA-FM-024', 'QA-FM-021'], onCompleteText: 'Q4 QAPI review and annual PIP closure complete.', status: 'pending', dueOffsetDays: 0 },
    { id: 'q4-post-minutes', label: 'Finalize Q4 minutes within 7 days', description: 'Draft, sign, and file. Must document annual PIP formal closure vote.', instructions: '1. Complete QA-FM-024\n2. Include annual PIP closure vote outcome\n3. Signatures: Administrator, Clinical Manager, QAPI Committee Chair', expectedOutput: 'Signed Q4 QAPI Minutes (QA-FM-024) filed in audit repository', requiredFormIds: ['QA-FM-024'], onCompleteText: 'Q4 minutes filed. Annual PIP closure is on record.', status: 'pending', dueOffsetDays: 7 },
    { id: 'q4-post-annual-report', label: 'Complete and submit Annual QAPI Report to Governing Body', description: 'Full-year QAPI performance report for annual Governing Body review.', instructions: '1. Complete annual QAPI report (QA-FM-029)\n2. Include: all four quarterly summaries, annual indicator performance, PIP closure evidence, IC integration results, corrective action closure rate\n3. Governing Body Chair signature required\n4. Submit for annual GB review at Q4/year-end board meeting', expectedOutput: 'Signed Annual QAPI Report (QA-FM-029) submitted to Governing Body for annual review', requiredFormIds: ['QA-FM-029'], onCompleteText: 'Annual QAPI report submitted. CY2026 QAPI cycle is audit-ready.', status: 'pending', dueOffsetDays: 14 },
  ],
  requiredForms: [
    { id: 'q4-f-dashboard',   label: 'Q4 / Annual QAPI Data Dashboard',      formId: 'QA-FM-020', status: 'pending', dueOffsetDays: -7 },
    { id: 'q4-f-pip',         label: 'Annual PIP Form — Final Close',         formId: 'QA-FM-021', status: 'pending', dueOffsetDays: -5 },
    { id: 'q4-f-action',      label: 'Action Item Log / Plan Q4',             formId: 'QA-FM-022', status: 'pending', dueOffsetDays:  3 },
    { id: 'q4-f-annrpt',      label: 'Annual QAPI Governance Report',         formId: 'QA-FM-023', status: 'pending', dueOffsetDays: 14 },
    { id: 'q4-f-minutes',     label: 'QAPI Meeting Minutes Q4',               formId: 'QA-FM-024', status: 'pending', dueOffsetDays:  7 },
    { id: 'q4-f-audit',       label: 'Chart Audit Summary Q4',                formId: 'QA-FM-025', status: 'pending', dueOffsetDays: -5 },
    { id: 'q4-f-incident',    label: 'Incident Log Q4 + Annual Summary',      formId: 'QA-FM-026', status: 'pending', dueOffsetDays: -5 },
    { id: 'q4-f-infection',   label: 'Infection Control Log Q4',              formId: 'QA-FM-027', status: 'pending', dueOffsetDays: -3 },
    { id: 'q4-f-anneval',     label: 'Annual QAPI Program Evaluation',        formId: 'QA-FM-028', status: 'pending', dueOffsetDays: 14 },
    { id: 'q4-f-annrpt2',     label: 'Annual QAPI Full-Year Report to GB',    formId: 'QA-FM-029', status: 'pending', dueOffsetDays: 14 },
  ],
  minutes: {
    status: 'missing', dueOffsetDays: 7, assignee: 'Clinical Manager',
    requiredSections: ['Attendance & quorum', 'Q3 action plan status', 'Q4 + full-year dashboard analysis', 'Q4 incident and IC analysis', 'Annual PIP formal closure vote and outcome', 'FY27 PIP topic selection', 'Q4 corrective action assignments', 'GB escalation items and annual report prep', 'Attestation', 'Adjournment'],
    signOffRoles: ['Administrator', 'Clinical Manager', 'QAPI Committee Chair'],
  },
  agenda: {
    distributeBusinessDaysBefore: 5,
    standingTopics: [
      { id: 'q4-t1', title: 'Opening & Compliance Validation', discussionPoints: ['Confirm quorum', 'Approve prior minutes', 'Disclose COI'], durationMin: 10 },
      { id: 'q4-t2', title: 'Q3 Action Plan Review', discussionPoints: ['Close completed actions with evidence', 'Escalate overdue actions'], requiredInputs: ['QA-FM-022'], owner: 'QAPI Lead', durationMin: 20 },
      { id: 'q4-t3', title: 'Q4 + Annual Dashboard Analysis', discussionPoints: ['Q4 indicators vs. threshold', 'Full-year Q1-Q4 trend for every measure', 'Annual performance vs. targets — which indicators met, which missed?', 'Implications for FY27 PIP selection'], requiredInputs: ['QA-FM-020', 'QA-FM-025'], owner: 'QAPI Lead', durationMin: 30 },
      { id: 'q4-t4', title: 'Annual PIP Formal Closure', discussionPoints: ['Q4 final remeasurement result', 'Full PIP trajectory — baseline → Q4', 'VOTE: Sustained → close with sustainment plan | Not sustained → carry forward with FY27 plan', 'Sustainment plan documentation requirements', 'FY27 PIP topic identification and preliminary scoping'], requiredInputs: ['QA-FM-021 PIP Form final'], owner: 'QAPI Lead', durationMin: 25 },
      { id: 'q4-t5', title: 'Q4 Incident & IC Analysis', discussionPoints: ['Q4 incident review', 'Annual incident trend — which categories improved or worsened?', 'IC Q4 annual summary'], requiredInputs: ['QA-FM-026', 'QA-FM-027'], owner: 'Clinical Manager', durationMin: 20 },
      { id: 'q4-t6', title: 'Annual Report & GB Escalation', discussionPoints: ['Items for annual QAPI GB report', 'Confirm year-end board meeting date', 'FY27 QAPI program priorities'], owner: 'Administrator', durationMin: 15 },
      { id: 'q4-t7', title: 'Closing & Attestation', discussionPoints: ['Q4 corrective action assignments', 'All present attest', 'Q1 2027 QAPI review date confirmed'], durationMin: 10 },
    ],
    dataInputs: [
      { label: 'Q4 / Annual Dashboard', formId: 'QA-FM-020', owner: 'QAPI Lead' },
      { label: 'PIP Final Remeasurement', formId: 'QA-FM-021', owner: 'QAPI Lead' },
      { label: 'Q4 Incident Log + Annual Summary', formId: 'QA-FM-026', owner: 'Clinical Manager' },
      { label: 'Q4 IC Log', formId: 'QA-FM-027', owner: 'IC Lead' },
    ],
  },
  approvals: [
    { id: 'q4-ap-min',    targetKind: 'minutes', targetLabel: 'Q4 QAPI Meeting Minutes',           approverRole: 'QAPI Committee Chair', required: true, escalationDays: 7, escalateToRole: 'Administrator' },
    { id: 'q4-ap-pip',    targetKind: 'form',    targetLabel: 'Annual PIP Formal Closure',         approverRole: 'Administrator',        required: true, escalationDays: 5 },
    { id: 'q4-ap-annrpt', targetKind: 'report',  targetLabel: 'Annual QAPI Report to Gov Body',    approverRole: 'Administrator',        required: true, escalationDays: 3, escalateToRole: 'Board Chair' },
  ],
  complianceFlags: { auditRisk: 'critical', overdueAfterDays: 0, citation: '42 CFR §484.65(d) — Annual PIP requirement', surveyorNote: 'The annual PIP must be formally closed with: final remeasurement, sustainment plan or carry-forward documentation, and Governing Body acknowledgment. Missing closure is a direct §484.65 deficiency.', missingEvidenceIf: ['missing', 'pending'] },
  followUps: [
    { id: 'q4-fu-pip-sustain', label: 'File annual PIP closure packet with GB acknowledgment', ownerRole: 'QAPI Lead', dueOffsetDays: 21, closureCriteria: 'QA-FM-021 closed with sustainment plan or FY27 continuation plan; GB signature obtained.', escalationDays: 7, escalateToRole: 'Administrator' },
    { id: 'q4-fu-annrpt', label: 'Submit Annual QAPI Report to Governing Body', ownerRole: 'QAPI Lead', dueOffsetDays: 14, closureCriteria: 'QA-FM-029 submitted with GB receipt confirmation.', escalationDays: 3, escalateToRole: 'Administrator' },
  ],
  dependencies: { feeds: ['EVT-GV-Q4-2026'], dependsOn: ['qapi_meeting-20260806-12'] },
  sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
};

/* ══════════════════════════════════════════════════════════════
   INFECTION CONTROL REVIEWS — Q1–Q4 2026
   ══════════════════════════════════════════════════════════════ */

function makeICReview(
  id: string, title: string, date: string, quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4',
  urgency: RegulatoryEvent['urgency'],
  dependsOnId?: string,
): RegulatoryEvent {
  const q = quarter;
  return {
    id, title, eventSubType: 'infection_control_review_quarterly', domain: 'Clinical', date, time: '10:00', timeEnd: '11:30',
    cadence: 'Quarterly', mandateType: 'federal-required',
    urgency, policyRefs: ['CL-IC-001', 'QA-PG-001'],
    owner: 'Clinical Manager', ownerRole: 'Infection Control Nurse',
    summary: `${q} infection surveillance review: infection event counts, HAI trends, PPE compliance audit, aide visit IC observations, exposure incidents, and QAPI feed preparation.`,
    regulatoryDriver: '42 CFR §484.70 — Infection prevention and control; integrated with QAPI per §484.65',
    category: 'infection-control',
    processFlow: [
      { id: `ic-${q.toLowerCase()}-pull`, label: `Pull ${q} infection event log`, description: `Compile all infection events reported in ${q} from all sources.`, instructions: `1. Pull incident reports categorized as infection events\n2. Include: UTIs, wound infections, respiratory, SARS-CoV-2, influenza, MRSA, VRE\n3. Calculate rate per 100 patient episodes\n4. Compare to prior quarter and annual target threshold`, expectedOutput: `${q} infection event log with rates and threshold comparison`, requiredFormIds: ['CL-FM-IC-001'], onCompleteText: `${q} infection log compiled.`, status: 'pending', dueOffsetDays: -5 },
      { id: `ic-${q.toLowerCase()}-ppe`, label: 'Conduct PPE compliance audit', description: 'Observe and document PPE usage compliance during patient visits.', instructions: `1. Observe minimum 5 patient visits for PPE compliance\n2. Score each observation: correct PPE selection, donning, doffing, hand hygiene\n3. Calculate % compliant\n4. Identify staff requiring re-education\n5. Document on PPE Compliance Audit Form (CL-FM-IC-002)`, expectedOutput: 'PPE Compliance Audit Form (CL-FM-IC-002) with % compliant and staff education needs', requiredFormIds: ['CL-FM-IC-002'], onCompleteText: 'PPE compliance audit complete.', status: 'pending', dueOffsetDays: -3 },
      { id: `ic-${q.toLowerCase()}-meeting`, label: `Conduct ${q} IC review meeting`, description: 'Review all IC data with team. Identify QAPI-actionable trends.', instructions: `1. Present ${q} infection event counts and rates\n2. Review PPE compliance audit results\n3. Discuss any exposure incidents and investigation outcomes\n4. Identify trends to feed into QAPI dashboard\n5. Assign corrective actions for any compliance gaps\n6. Document meeting minutes on CL-FM-IC-003`, expectedOutput: `${q} IC Review Meeting Notes (CL-FM-IC-003) with decisions and actions`, requiredFormIds: ['CL-FM-IC-003'], onCompleteText: `${q} IC review meeting documented.`, status: 'pending', dueOffsetDays: 0 },
      { id: `ic-${q.toLowerCase()}-qapi`, label: 'Prepare IC data feed for QAPI dashboard', description: `Compile ${q} IC summary for integration into QAPI quarterly review.`, instructions: `1. Summarize ${q} IC data: rates, PPE compliance %, exposure incidents\n2. Identify any trend that should generate a QAPI corrective action\n3. Attach IC Log (QA-FM-027) to QAPI quarterly package`, expectedOutput: 'IC Log (QA-FM-027) completed and shared with QAPI Lead', requiredFormIds: ['QA-FM-027'], onCompleteText: 'IC data feed delivered to QAPI team.', status: 'pending', dueOffsetDays: 2 },
    ],
    requiredForms: [
      { id: `ic-${q.toLowerCase()}-f1`, label: `${q} Infection Event Log`,      formId: 'CL-FM-IC-001', status: 'pending', dueOffsetDays: -5 },
      { id: `ic-${q.toLowerCase()}-f2`, label: 'PPE Compliance Audit Form',      formId: 'CL-FM-IC-002', status: 'pending', dueOffsetDays: -3 },
      { id: `ic-${q.toLowerCase()}-f3`, label: `${q} IC Review Meeting Notes`,   formId: 'CL-FM-IC-003', status: 'pending', dueOffsetDays:  2 },
      { id: `ic-${q.toLowerCase()}-f4`, label: 'IC Log for QAPI Integration',   formId: 'QA-FM-027',    status: 'pending', dueOffsetDays:  2 },
    ],
    minutes: {
      status: 'missing', dueOffsetDays: 3, assignee: 'Infection Control Nurse',
      requiredSections: [`${q} infection event counts and rates`, 'Threshold comparison to prior quarter', 'PPE compliance audit findings', 'Exposure incidents and resolution', 'QAPI-actionable trends identified', 'Corrective actions assigned', 'Adjournment'],
      signOffRoles: ['Clinical Manager', 'Infection Control Nurse'],
    },
    agenda: {
      distributeBusinessDaysBefore: 2,
      standingTopics: [
        { id: `ic-${q.toLowerCase()}-t1`, title: `${q} Infection Event Review`, discussionPoints: [`${q} counts by infection type vs. prior quarter`, 'Rate per 100 episodes vs. threshold', 'Any high-risk or unusual infection patterns?'], requiredInputs: ['CL-FM-IC-001'], owner: 'IC Nurse', durationMin: 25 },
        { id: `ic-${q.toLowerCase()}-t2`, title: 'PPE Compliance Results', discussionPoints: ['% compliant by staff and visit type', 'Staff requiring re-education', 'Corrective plan for non-compliant observations'], requiredInputs: ['CL-FM-IC-002'], durationMin: 15 },
        { id: `ic-${q.toLowerCase()}-t3`, title: 'Exposure Incidents & QAPI Feed', discussionPoints: ['Any exposure incidents — investigation complete?', 'IC trends to escalate to QAPI'], durationMin: 20 },
        { id: `ic-${q.toLowerCase()}-t4`, title: 'Action Assignments & Close', discussionPoints: ['Assign corrective actions with owners', 'Confirm QAPI data feed delivery date'], durationMin: 10 },
      ],
      dataInputs: [
        { label: `${q} Infection Event Log`, formId: 'CL-FM-IC-001', owner: 'IC Nurse' },
        { label: 'PPE Compliance Audit', formId: 'CL-FM-IC-002', owner: 'IC Nurse' },
      ],
    },
    approvals: [
      { id: `ic-${q.toLowerCase()}-ap1`, targetKind: 'minutes', targetLabel: `${q} IC Review Minutes`, approverRole: 'Clinical Manager', required: true, escalationDays: 5 },
      { id: `ic-${q.toLowerCase()}-ap2`, targetKind: 'report',  targetLabel: 'IC Data Feed to QAPI',  approverRole: 'Clinical Manager', required: true, escalationDays: 3 },
    ],
    complianceFlags: { auditRisk: 'high', overdueAfterDays: 0, citation: '42 CFR §484.70 — Infection prevention and control', surveyorNote: 'IC must integrate with QAPI. Missing infection logs or lack of QAPI integration are common survey findings.', missingEvidenceIf: ['missing', 'pending'] },
    followUps: [
      { id: `ic-${q.toLowerCase()}-fu1`, label: 'File IC review minutes and logs', ownerRole: 'IC Nurse', dueOffsetDays: 3, closureCriteria: 'CL-FM-IC-003 signed and filed with IC event log and PPE audit attached.' },
      { id: `ic-${q.toLowerCase()}-fu2`, label: 'Deliver IC log to QAPI team', ownerRole: 'IC Nurse', dueOffsetDays: 2, closureCriteria: 'QA-FM-027 received by QAPI Lead with confirmation.' },
    ],
    dependencies: {
      feeds: [dependsOnId ? `EVT-QAPI-2026-${quarter === 'Q1' ? '0205-QGOV' : quarter}` : undefined].filter(Boolean) as string[],
    },
    sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
  };
}

export const IC_Q1 = makeICReview('infection_control_review_quarterly-20260325-01', 'Q1 Infection Control Review', '2026-03-25', 'Q1', 'scheduled');
export const IC_Q2 = makeICReview('infection_control_review_quarterly-20260624-02', 'Q2 Infection Control Review', '2026-06-24', 'Q2', 'scheduled');
export const IC_Q3 = makeICReview('infection_control_review_quarterly-20260924-03', 'Q3 Infection Control Review', '2026-09-24', 'Q3', 'scheduled');
export const IC_Q4 = makeICReview('infection_control_review_quarterly-20261217-04', 'Q4 Infection Control Review', '2026-12-17', 'Q4', 'scheduled');

/* ══════════════════════════════════════════════════════════════
   ANNUAL EVALUATIONS
   ══════════════════════════════════════════════════════════════ */

export const QAPI_ANNUAL_EVAL: RegulatoryEvent = {
  id: 'qapi_annual_eval-20261210-01',
  eventSubType: 'qapi_annual_eval',
  title: 'Annual QAPI Program Evaluation',
  domain: 'QAPI',
  date: '2026-12-10',
  time: '09:00', timeEnd: '12:00',
  cadence: 'Annual', mandateType: 'federal-required', urgency: 'scheduled',
  policyRefs: ['QA-PG-001', 'QA-PIP-001'],
  owner: 'Clinical Manager', ownerRole: 'QAPI Lead',
  summary: 'Annual evaluation of the entire QAPI program: review all four quarterly cycles, assess PIP completion and effectiveness, evaluate corrective action closure rates, identify FY27 priorities, and prepare annual QAPI evaluation report for Governing Body.',
  regulatoryDriver: '42 CFR §484.65(b)-(d) — QAPI CoP requires ongoing, HHA-wide, data-driven quality program with at least one PIP per year and systematic evaluation of program effectiveness.',
  category: 'annual-evaluation',
  processFlow: [
    { id: 'ann-qapi-compile', label: 'Compile full-year QAPI data and metrics', description: 'Aggregate all four quarterly dashboards, all PIP data, and all corrective action records.', instructions: '1. Pull all four quarterly QAPI Data Dashboards (QA-FM-020)\n2. Pull full PIP record from initiation to Q4 close (QA-FM-021)\n3. Pull complete Action Item Tracker — all actions opened and closed in CY2026\n4. Calculate: total actions opened, total closed, closure rate %, average days to close\n5. Build annual indicator trend chart: Q1-Q4 for every tracked indicator', expectedOutput: 'Annual QAPI data compilation package with full-year indicator trends and action metrics', requiredFormIds: ['QA-FM-020', 'QA-FM-021', 'QA-FM-022'], onCompleteText: 'Annual QAPI compilation complete.', status: 'pending', dueOffsetDays: -14 },
    { id: 'ann-qapi-eval', label: 'Conduct annual QAPI program effectiveness evaluation', description: 'Systematically evaluate whether the QAPI program operated as required and produced measurable improvement.', instructions: '1. Complete Annual QAPI Program Evaluation Form (QA-FM-028)\n2. Evaluate: data-driven decision making, PIP methodology quality, corrective action follow-through, IC integration, staff engagement\n3. Identify program strengths and gaps\n4. Document at least 3 FY27 improvement priorities with preliminary rationale', expectedOutput: 'Completed Annual QAPI Program Evaluation (QA-FM-028)', requiredFormIds: ['QA-FM-028'], onCompleteText: 'Annual QAPI effectiveness evaluation complete.', status: 'pending', dueOffsetDays: -7 },
    { id: 'ann-qapi-meeting', label: 'Annual QAPI evaluation meeting — full committee', description: 'Present and ratify the annual QAPI program evaluation findings with the full committee.', instructions: '1. Present CY2026 indicator performance summary\n2. Present PIP closure outcome and FY27 plan\n3. Present corrective action closure rate\n4. Committee reviews and ratifies the annual evaluation findings\n5. Committee selects FY27 PIP topic\n6. Record decisions in annual meeting minutes', expectedOutput: 'Annual QAPI evaluation meeting minutes with committee ratification recorded', requiredFormIds: ['QA-FM-028', 'QA-FM-024'], onCompleteText: 'Annual QAPI evaluation ratified by committee.', status: 'pending', dueOffsetDays: 0 },
    { id: 'ann-qapi-gb-report', label: 'Submit Annual QAPI Report to Governing Body', description: 'Complete and deliver the Annual QAPI Report to Governing Body for review and formal acknowledgment.', instructions: '1. Complete Annual QAPI Full-Year Report (QA-FM-029)\n2. Administrator signs off\n3. Submit to Governing Body at year-end board meeting\n4. GB formally acknowledges receipt and reviews the report\n5. Record GB acknowledgment in board minutes', expectedOutput: 'Signed Annual QAPI Report submitted to and acknowledged by Governing Body', requiredFormIds: ['QA-FM-029'], onCompleteText: 'Annual QAPI cycle complete. CY2026 QAPI program is fully documented and survey-ready.', status: 'pending', dueOffsetDays: 14 },
  ],
  requiredForms: [
    { id: 'ae-f-q1dash', label: 'All Four Quarterly QAPI Dashboards (Q1-Q4)', formId: 'QA-FM-020', status: 'pending', dueOffsetDays: -14 },
    { id: 'ae-f-pip',    label: 'Annual PIP Form — Complete Record',           formId: 'QA-FM-021', status: 'pending', dueOffsetDays: -14 },
    { id: 'ae-f-action', label: 'Annual Action Item Tracker — Full Year',      formId: 'QA-FM-022', status: 'pending', dueOffsetDays: -14 },
    { id: 'ae-f-eval',   label: 'Annual QAPI Program Evaluation Form',         formId: 'QA-FM-028', status: 'pending', dueOffsetDays:  -7 },
    { id: 'ae-f-annrpt', label: 'Annual QAPI Full-Year Report to Gov Body',    formId: 'QA-FM-029', status: 'pending', dueOffsetDays:  14 },
  ],
  minutes: {
    status: 'missing', dueOffsetDays: 7, assignee: 'Clinical Manager',
    requiredSections: ['CY2026 QAPI performance summary', 'Annual PIP closure outcome', 'Corrective action closure rate', 'Annual program effectiveness evaluation findings', 'FY27 PIP topic selection', 'Committee ratification vote', 'Governing Body report preparation', 'Adjournment'],
    signOffRoles: ['Administrator', 'Clinical Manager', 'QAPI Committee Chair', 'Governing Body Chair (for annual review)'],
  },
  agenda: {
    distributeBusinessDaysBefore: 7,
    standingTopics: [
      { id: 'ae-t1', title: 'CY2026 Annual Indicator Performance', discussionPoints: ['Full-year Q1-Q4 trends for all tracked indicators', 'Indicators that met annual targets vs. missed', 'Implications for FY27 priorities'], requiredInputs: ['QA-FM-020 Annual Dashboard'], owner: 'QAPI Lead', durationMin: 30 },
      { id: 'ae-t2', title: 'Annual PIP Closure Review', discussionPoints: ['PIP trajectory: baseline → Q1 → Q2 → Q3 → Q4 final', 'Target met/not met — formal closure or carry-forward rationale', 'Sustainment monitoring plan for FY27'], requiredInputs: ['QA-FM-021'], owner: 'QAPI Lead', durationMin: 20 },
      { id: 'ae-t3', title: 'Corrective Action Program Effectiveness', discussionPoints: ['Total actions opened vs. closed in CY2026', 'Closure rate % and average days to close', 'Chronic bottleneck areas requiring process improvement'], requiredInputs: ['QA-FM-022'], durationMin: 15 },
      { id: 'ae-t4', title: 'FY27 QAPI Program Priorities & New PIP Selection', discussionPoints: ['Top indicators needing improvement in FY27', 'FY27 PIP topic — committee votes', 'Preliminary baseline measurement plan'], durationMin: 20 },
      { id: 'ae-t5', title: 'Committee Ratification & GB Report', discussionPoints: ['Committee votes to ratify annual QAPI evaluation findings', 'GB report content review', 'Year-end filing requirements'], durationMin: 15 },
    ],
    dataInputs: [
      { label: 'All CY2026 Quarterly Dashboards', formId: 'QA-FM-020', owner: 'QAPI Lead' },
      { label: 'Annual PIP Record', formId: 'QA-FM-021', owner: 'QAPI Lead' },
      { label: 'Annual Action Tracker', formId: 'QA-FM-022', owner: 'QAPI Lead' },
    ],
  },
  approvals: [
    { id: 'ae-ap-eval',   targetKind: 'report',  targetLabel: 'Annual QAPI Program Evaluation',   approverRole: 'QAPI Committee Chair', required: true, escalationDays: 7, escalateToRole: 'Administrator' },
    { id: 'ae-ap-annrpt', targetKind: 'report',  targetLabel: 'Annual QAPI Report to Gov Body',   approverRole: 'Administrator',        required: true, escalationDays: 5 },
    { id: 'ae-ap-gb',     targetKind: 'report',  targetLabel: 'GB Acknowledgment of Annual QAPI', approverRole: 'Board Chair',          required: true, escalationDays: 14 },
  ],
  complianceFlags: { auditRisk: 'critical', overdueAfterDays: 14, citation: '42 CFR §484.65 — Annual PIP + ongoing QAPI program requirement', surveyorNote: 'CMS surveyors expect to see: (1) at least one PIP with full documentation cycle, (2) evidence the QAPI program operates year-round, (3) Governing Body oversight of QAPI findings. Missing annual evaluation is a direct §484.65 deficiency.', missingEvidenceIf: ['missing', 'pending'] },
  followUps: [
    { id: 'ae-fu1', label: 'File all CY2026 QAPI records in annual audit archive', ownerRole: 'QAPI Lead', dueOffsetDays: 30, closureCriteria: 'All four quarterly packages + annual evaluation + PIP record filed in audit-ready location with index.', escalationDays: 14, escalateToRole: 'Administrator' },
    { id: 'ae-fu2', label: 'Initiate FY27 PIP charter', ownerRole: 'QAPI Lead', dueOffsetDays: 45, closureCriteria: 'FY27 PIP charter (QA-FM-021) started with baseline data and target defined.', escalationDays: 14, escalateToRole: 'Administrator' },
  ],
  dependencies: { dependsOn: ['qapi_meeting-20261105-16'] },
  sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
};

/* ── Annual Compliance Program Effectiveness Review ─────────── */
export const COMPLIANCE_ANNUAL_REVIEW: RegulatoryEvent = {
  id: 'compliance_effectiveness_review-20261119-02',
  eventSubType: 'compliance_effectiveness_review',
  title: 'Annual Compliance Program Effectiveness Review',
  domain: 'Compliance',
  date: '2026-11-19',
  time: '09:00', timeEnd: '12:00',
  cadence: 'Annual', mandateType: 'policy-driven', urgency: 'scheduled',
  policyRefs: ['CO-CP-001'],
  owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
  summary: 'Annual evaluation of the compliance program effectiveness: hotline usage, training completion rates, audit findings, investigation outcomes, and regulatory update response. Required for robust Corporate Compliance Program per OIG guidelines.',
  regulatoryDriver: 'OIG Compliance Program Guidance for Home Health Agencies; CO-CP-001 Corporate Compliance Program',
  category: 'annual-evaluation',
  processFlow: [
    { id: 'co-ann-compile', label: 'Compile annual compliance metrics', description: 'Aggregate all compliance activity for the calendar year.', instructions: '1. Pull all 12 monthly compliance reports\n2. Compile: OIG exclusion screening results, training completion rates (HIPAA, OSHA, Abuse, Billing), hotline reports count and disposition, investigation outcomes, audit findings, regulatory survey results\n3. Calculate compliance training completion rate by role', expectedOutput: 'Annual Compliance Metrics Summary with year-over-year comparison', requiredFormIds: ['CO-FM-010'], onCompleteText: 'Annual compliance metrics compiled.', status: 'pending', dueOffsetDays: -14 },
    { id: 'co-ann-review', label: 'Conduct annual program effectiveness review meeting', description: 'Evaluate compliance program against OIG guidelines.', instructions: '1. Review all 7 elements of an effective compliance program\n2. Score each element: fully implemented, partially implemented, gap\n3. Identify top 3 program gaps requiring FY27 attention\n4. Review any government enforcement actions in the home health sector\n5. Update corporate compliance work plan for FY27', expectedOutput: 'Completed Annual Compliance Effectiveness Assessment (CO-FM-010) with FY27 work plan', requiredFormIds: ['CO-FM-010', 'CO-FM-011'], onCompleteText: 'Annual compliance program review complete.', status: 'pending', dueOffsetDays: 0 },
    { id: 'co-ann-gb-report', label: 'Submit Annual Compliance Report to Governing Body', description: 'Annual compliance report to Governing Body.', instructions: '1. Complete Annual Compliance Report (CO-FM-012)\n2. Governing Body reviews and acknowledges\n3. Board Chair signs acknowledgment', expectedOutput: 'Signed Annual Compliance Report acknowledged by Governing Body', requiredFormIds: ['CO-FM-012'], onCompleteText: 'Annual compliance cycle complete.', status: 'pending', dueOffsetDays: 14 },
  ],
  requiredForms: [
    { id: 'co-ann-f1', label: 'Annual Compliance Effectiveness Assessment', formId: 'CO-FM-010', status: 'pending', dueOffsetDays:  0 },
    { id: 'co-ann-f2', label: 'FY27 Compliance Work Plan',                  formId: 'CO-FM-011', status: 'pending', dueOffsetDays:  0 },
    { id: 'co-ann-f3', label: 'Annual Compliance Report to Gov Body',        formId: 'CO-FM-012', status: 'pending', dueOffsetDays: 14 },
  ],
  minutes: { status: 'missing', dueOffsetDays: 7, assignee: 'Compliance Officer', requiredSections: ['CY2026 compliance metrics summary', 'Program effectiveness assessment by OIG element', 'Top gaps and remediation priorities', 'FY27 work plan approval', 'GB report content review', 'Adjournment'], signOffRoles: ['Administrator', 'Compliance Officer'] },
  agenda: {
    distributeBusinessDaysBefore: 5,
    standingTopics: [
      { id: 'co-t1', title: 'CY2026 Compliance Metrics Review', discussionPoints: ['OIG screening: 0 exclusions confirmed?', 'Training completion rates by role', 'Hotline reports: count, categories, dispositions', 'Audit findings: critical issues resolved?', 'Investigation outcomes'], requiredInputs: ['All 12 Monthly Reports', 'CO-FM-010'], durationMin: 30 },
      { id: 'co-t2', title: 'Program Effectiveness Assessment', discussionPoints: ['Score each of the 7 OIG compliance program elements', 'Identify gaps vs. prior year', 'Regulatory enforcement trends in home health sector'], durationMin: 30 },
      { id: 'co-t3', title: 'FY27 Work Plan & GB Report', discussionPoints: ['Top 3 FY27 compliance priorities', 'GB report content and delivery date'], durationMin: 20 },
    ],
    dataInputs: [{ label: 'Annual Compliance Metrics Summary', formId: 'CO-FM-010', owner: 'Compliance Officer' }],
  },
  approvals: [
    { id: 'co-ap-assess', targetKind: 'report', targetLabel: 'Annual Compliance Effectiveness Assessment', approverRole: 'Administrator', required: true, escalationDays: 7 },
    { id: 'co-ap-gb',     targetKind: 'report', targetLabel: 'Annual Compliance Report to Gov Body',       approverRole: 'Board Chair',   required: true, escalationDays: 14 },
  ],
  complianceFlags: { auditRisk: 'high', overdueAfterDays: 30, citation: 'OIG Compliance Program Guidance for HHAs; CO-CP-001', surveyorNote: 'Lack of annual compliance program evaluation is a significant gap. OIG expects documented annual assessment against all 7 program elements.', missingEvidenceIf: ['missing', 'pending'] },
  followUps: [{ id: 'co-fu1', label: 'File all CY2026 compliance records in annual archive', ownerRole: 'Compliance Officer', dueOffsetDays: 30, closureCriteria: 'All monthly reports + annual assessment filed with annual index.' }],
  dependencies: { feeds: ['EVT-GV-Q4-2026'] },
  sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
};

/* ── Annual P&P Full Enterprise Review ───────────────────────── */
export const PP_ANNUAL_REVIEW: RegulatoryEvent = {
  id: 'policy_review_annual-20261015-02',
  eventSubType: 'policy_review_annual',
  title: 'Annual Policy & Procedure Enterprise Review',
  domain: 'Compliance',
  date: '2026-10-15',
  time: '09:00', timeEnd: '17:00',
  cadence: 'Annual', mandateType: 'policy-driven', urgency: 'scheduled',
  policyRefs: ['CO-CP-001', 'GV-GB-001'],
  owner: 'Administrator', ownerRole: 'Administrator',
  summary: 'Annual review of the complete enterprise P&P library across all domains: Governance, Clinical, QAPI, IC, Aide Services, Emergency Preparedness, HR, IT/Security, Billing. Each domain lead attests currency. Governing Body approves final P&P library version.',
  regulatoryDriver: '42 CFR §484.105(i)(1)-(2) — Governing Body must review and approve all policies. Individual CoPs require domain-specific policy updates when regulations change.',
  category: 'annual-evaluation',
  processFlow: [
    { id: 'pp-inventory', label: 'Generate P&P library inventory with version dates', description: 'Confirm every policy in the library, its version, and last review date.', instructions: '1. Pull complete P&P library list by domain\n2. Note version number and last review/approval date for each policy\n3. Flag any policy last reviewed >12 months ago — these are mandatory review items\n4. Flag any policy impacted by 2026 CMS regulatory updates\n5. Assign each flagged policy to domain lead for review', expectedOutput: 'P&P Library Inventory with version dates and flagged items', requiredFormIds: ['CO-FM-PP-001'], onCompleteText: 'P&P inventory complete. Flagged policies assigned to domain leads.', status: 'pending', dueOffsetDays: -30 },
    { id: 'pp-domain-review', label: 'Domain leads complete P&P reviews', description: 'Each domain lead reviews and updates their policies before the annual review meeting.', instructions: '1. Each domain lead (Clinical, QAPI, IC, Aide, EP, HR, IT, Billing) reviews all policies in their domain\n2. For each policy: confirm still accurate, update if needed, note any regulatory basis changes\n3. Assign updated version number and date\n4. Domain lead signs attestation that all domain policies are reviewed and current', expectedOutput: 'Signed P&P review attestation from each domain lead (CO-FM-PP-002)', requiredFormIds: ['CO-FM-PP-002'], onCompleteText: 'All domain P&P reviews complete.', status: 'pending', dueOffsetDays: -7 },
    { id: 'pp-review-meeting', label: 'Annual P&P review meeting — all domain leads', description: 'Conduct enterprise P&P review meeting. Review regulatory changes and confirm P&P alignment.', instructions: '1. Each domain lead presents: number of policies reviewed, changes made, any regulatory basis updates\n2. Administrator confirms all policies reflect current CFR citations\n3. Discuss any 2026 CMS updates not yet reflected in policies\n4. Assign any remaining policy updates with due dates', expectedOutput: 'Annual P&P Review Meeting Minutes with all domain attestations confirmed', requiredFormIds: ['CO-FM-PP-003'], onCompleteText: 'Annual P&P review meeting complete. All domains attested.', status: 'pending', dueOffsetDays: 0 },
    { id: 'pp-gb-approval', label: 'Governing Body approves updated P&P library', description: 'Submit entire updated P&P library to Governing Body for formal approval.', instructions: '1. Compile updated P&P library with version log\n2. Submit to Governing Body at the next board meeting\n3. Board formally votes to approve the updated library\n4. Board Chair signature on P&P approval form\n5. Effective date set and communicated to all staff', expectedOutput: 'Governing Body approval of CY2026 P&P library with Board Chair signature', requiredFormIds: ['CO-FM-PP-004'], onCompleteText: 'P&P library approved. New effective date set. Staff notified.', status: 'pending', dueOffsetDays: 21 },
  ],
  requiredForms: [
    { id: 'pp-f1', label: 'P&P Library Inventory with Version Dates', formId: 'CO-FM-PP-001', status: 'pending', dueOffsetDays: -30 },
    { id: 'pp-f2', label: 'Domain Lead P&P Attestation Forms',         formId: 'CO-FM-PP-002', status: 'pending', dueOffsetDays:  -7 },
    { id: 'pp-f3', label: 'Annual P&P Review Meeting Minutes',          formId: 'CO-FM-PP-003', status: 'pending', dueOffsetDays:   2 },
    { id: 'pp-f4', label: 'Governing Body P&P Approval Form',           formId: 'CO-FM-PP-004', status: 'pending', dueOffsetDays:  21 },
  ],
  minutes: { status: 'missing', dueOffsetDays: 2, assignee: 'Compliance Officer', requiredSections: ['All domain leads present', 'Number of policies reviewed per domain', 'Changes made and regulatory basis updates', 'Regulatory alignment confirmed', 'Remaining updates assigned', 'GB submission date confirmed'], signOffRoles: ['Administrator', 'All Domain Leads'] },
  agenda: {
    distributeBusinessDaysBefore: 5,
    standingTopics: [
      { id: 'pp-t1', title: 'Domain P&P Status Reports (all domains)', discussionPoints: ['Clinical: policies reviewed, changes, regulatory basis updates', 'QAPI: policies reviewed and aligned to §484.65', 'IC: policies updated per CDC/CMS guidance', 'Aide Services: §484.80 alignment confirmed', 'EP: §484.102 alignment confirmed', 'HR, IT, Billing, Governance: confirm currency'], durationMin: 60 },
      { id: 'pp-t2', title: '2026 Regulatory Update Integration', discussionPoints: ['CMS updates issued in 2026 affecting home health', 'Policies impacted — are all updated?', 'Any pending updates with due dates'], durationMin: 30 },
      { id: 'pp-t3', title: 'GB Submission Plan', discussionPoints: ['Confirm all policies ready for GB approval', 'Set GB submission date', 'Effective date for updated library'], durationMin: 20 },
    ],
    dataInputs: [{ label: 'P&P Library Inventory', formId: 'CO-FM-PP-001', owner: 'Compliance Officer' }],
  },
  approvals: [
    { id: 'pp-ap-admin', targetKind: 'report', targetLabel: 'Updated P&P Library',            approverRole: 'Administrator', required: true, escalationDays: 7 },
    { id: 'pp-ap-gb',    targetKind: 'report', targetLabel: 'GB P&P Library Approval',        approverRole: 'Board Chair',   required: true, escalationDays: 14 },
  ],
  complianceFlags: { auditRisk: 'critical', overdueAfterDays: 30, citation: '42 CFR §484.105(i)(1)-(2) — Governing Body policy approval requirement', surveyorNote: 'Surveyors review P&P library for currency, CFR alignment, and Governing Body approval signature. Policies without current approval dates or without regulatory citations are common findings.', missingEvidenceIf: ['missing', 'pending'] },
  followUps: [{ id: 'pp-fu1', label: 'Distribute updated P&P to all staff with acknowledgment', ownerRole: 'Administrator', dueOffsetDays: 7, closureCriteria: 'All staff have acknowledged receipt of updated P&P library per CO-FM-PP-005.' }],
  dependencies: { feeds: ['EVT-GV-Q4-2026'] },
  sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
};

/* ── Annual Staff Training (HIPAA, OSHA, Abuse, etc.) ────────── */
export const ANNUAL_STAFF_TRAINING: RegulatoryEvent = {
  id: 'employee_compliance_training-20260901-01',
  eventSubType: 'employee_compliance_training',
  title: 'Annual Employee Compliance Training (HIPAA, OSHA, Abuse Prevention)',
  domain: 'Compliance',
  date: '2026-09-01', endDate: '2026-09-30',
  allDay: true,
  cadence: 'Annual', mandateType: 'federal-required', urgency: 'scheduled',
  policyRefs: ['HR-OIG-001', 'CO-CP-001'],
  owner: 'HR Director', ownerRole: 'Staff Development RN',
  summary: 'Annual training campaign: all employees must complete mandatory training modules — HIPAA Privacy & Security, OSHA Bloodborne Pathogens, Abuse/Neglect/Exploitation Prevention, Corporate Compliance, and Infection Control. 100% completion required before survey.',
  regulatoryDriver: 'HIPAA 45 CFR §164.530(b) — workforce training; OSHA 29 CFR §1910.1030 — annual bloodborne pathogens; 42 CFR §484.80 and §484.105 — aide and staff training requirements; OIG Compliance Program Guidance',
  category: 'annual-training',
  processFlow: [
    { id: 'tr-assign', label: 'Assign all required training modules to all staff', description: 'Generate training assignments for every employee, contractor, and aide.', instructions: '1. Pull current employee roster from HR\n2. Assign modules: HIPAA Privacy, HIPAA Security, OSHA BBP, Abuse/Neglect Prevention, Corporate Compliance, Infection Control\n3. For clinical staff: add Clinical Competency modules\n4. For aides: confirm 12-hour annual in-service requirement is tracked separately\n5. Set completion deadline of September 30', expectedOutput: 'Training assignment list with all employees, modules, and deadlines', requiredFormIds: ['HR-FM-TR-001'], onCompleteText: 'All training assignments distributed.', status: 'pending', dueOffsetDays: 0 },
    { id: 'tr-monitor', label: 'Weekly completion monitoring during campaign', description: 'Monitor completion weekly. Escalate non-compliant staff.', instructions: '1. Pull completion report weekly\n2. Identify staff with <50% complete at 2 weeks, <75% at 3 weeks, <100% at 4 weeks\n3. Send escalation notice to their supervisor for each threshold missed\n4. Document all escalations', expectedOutput: 'Weekly training completion tracking report with escalation documentation', requiredFormIds: ['HR-FM-TR-002'], onCompleteText: 'Weekly monitoring active.', status: 'pending', dueOffsetDays: 7 },
    { id: 'tr-complete', label: 'Verify 100% completion and document final rosters', description: 'Confirm all employees completed all assigned modules. Document for survey.', instructions: '1. Pull final completion report on deadline date\n2. For any incomplete: issue corrective action notice and set 5-day final deadline\n3. Document final completion rate and names of any exceptions\n4. Generate completion certificates/records for each employee\n5. File training rosters in personnel files', expectedOutput: 'Final Training Completion Report with 100% roster or documented exceptions', requiredFormIds: ['HR-FM-TR-003'], onCompleteText: 'Annual training campaign closed. All completion records filed.', status: 'pending', dueOffsetDays: 30 },
  ],
  requiredForms: [
    { id: 'tr-f1', label: 'Training Assignment List',         formId: 'HR-FM-TR-001', status: 'pending', dueOffsetDays:  0 },
    { id: 'tr-f2', label: 'Weekly Completion Tracking Report', formId: 'HR-FM-TR-002', status: 'pending', dueOffsetDays:  7 },
    { id: 'tr-f3', label: 'Final Training Completion Roster', formId: 'HR-FM-TR-003', status: 'pending', dueOffsetDays: 30 },
  ],
  minutes: undefined,
  agenda: {
    distributeBusinessDaysBefore: 5,
    standingTopics: [
      { id: 'tr-t1', title: 'Training Modules Required for All Staff', discussionPoints: ['HIPAA Privacy & Security', 'OSHA Bloodborne Pathogens', 'Abuse/Neglect/Exploitation Prevention', 'Corporate Compliance Program', 'Infection Control'] },
      { id: 'tr-t2', title: 'Completion Tracking & Escalation', discussionPoints: ['Weekly monitoring checkpoints', 'Supervisor escalation thresholds', 'Corrective action for non-completion'] },
    ],
  },
  approvals: [
    { id: 'tr-ap-final', targetKind: 'report', targetLabel: 'Final Training Completion Roster', approverRole: 'HR Director', required: true, escalationDays: 7 },
  ],
  complianceFlags: { auditRisk: 'critical', overdueAfterDays: 30, citation: 'HIPAA 45 CFR §164.530(b); OSHA 29 CFR §1910.1030; 42 CFR §484.105', surveyorNote: 'Training rosters must show 100% completion. Any staff member without documented training is a direct deficiency. Surveyors often request random personnel file review.', missingEvidenceIf: ['missing', 'pending'] },
  followUps: [{ id: 'tr-fu1', label: 'File all training records in personnel files', ownerRole: 'HR Director', dueOffsetDays: 7, closureCriteria: 'All completion certificates filed in each employee\'s personnel file.', escalationDays: 14, escalateToRole: 'Administrator' }],
  sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
};

/* ══════════════════════════════════════════════════════════════
   EVENT-DRIVEN COMPLIANCE EVENTS
   These activate on trigger, not on calendar date.
   ══════════════════════════════════════════════════════════════ */

export const INCIDENT_ADVERSE_EVENT_REVIEW: RegulatoryEvent = {
  id: 'incident_report-20260101-01',
  eventSubType: 'incident_report',
  title: 'Incident / Adverse Event Review',
  domain: 'QAPI',
  date: '2026-01-01',
  cadence: 'Trigger-based', mandateType: 'policy-driven', urgency: 'critical',
  policyRefs: ['QA-PG-001', 'RM-RP-001'],
  owner: 'Clinical Manager', ownerRole: 'QAPI Lead',
  summary: 'Triggered by any reportable incident, adverse event, near miss, or sentinel event. Requires immediate RCA, corrective action plan, and QAPI integration within defined timeframes.',
  regulatoryDriver: '42 CFR §484.65(b)(3) — QAPI must track adverse patient events and analyze causes; RM-RP-001 Risk Management Program',
  category: 'event-driven',
  processFlow: [
    { id: 'inc-report', label: 'Complete and submit incident report within 24 hours', description: 'Immediate documentation required for all incidents.', instructions: '1. Document incident: date, time, location, patient ID, staff involved, description\n2. Categorize: fall, medication error, complaint, hospitalization, abuse allegation, near miss, sentinel\n3. Assign severity: low / medium / high / sentinel\n4. Submit to supervisor and compliance officer within 24 hours\n5. For sentinel events: notify Administrator immediately', expectedOutput: 'Completed Incident Report Form (QA-FM-030) within 24 hours', requiredFormIds: ['QA-FM-030'], onCompleteText: 'Incident documented and submitted.', status: 'pending', dueOffsetDays: 0 },
    { id: 'inc-rca', label: 'Conduct Root Cause Analysis within 72 hours (sentinel: immediately)', description: 'Determine why the incident occurred and whether it reflects systemic issues.', instructions: '1. Gather all relevant facts: patient record, care notes, staff accounts\n2. Use 5-Why or Fishbone methodology\n3. Identify contributing factors: staff, process, environment, equipment\n4. Determine if this is an isolated event or systemic pattern\n5. Complete RCA Form (QA-FM-031)', expectedOutput: 'Completed Root Cause Analysis Form (QA-FM-031) with contributing factors identified', requiredFormIds: ['QA-FM-031'], onCompleteText: 'RCA complete. Contributing factors identified.', status: 'pending', dueOffsetDays: 0 },
    { id: 'inc-corrective', label: 'Develop and assign corrective action plan', description: 'Create specific, measurable corrective actions with owners and due dates.', instructions: '1. For each contributing factor: define a corrective action\n2. Assign owner, due date, and success criteria for each action\n3. Determine if a policy change is required\n4. Determine if staff re-education is required\n5. Add all actions to QAPI Action Tracker (QA-FM-022)', expectedOutput: 'Corrective Action Plan (QA-FM-032) with all actions assigned', requiredFormIds: ['QA-FM-032', 'QA-FM-022'], onCompleteText: 'Corrective action plan assigned. All owners notified.', status: 'pending', dueOffsetDays: 1 },
    { id: 'inc-qapi-feed', label: 'Feed incident data into QAPI dashboard', description: 'Add incident to QAPI incident log for trending and quarterly review.', instructions: '1. Add incident to QAPI incident log (QA-FM-026)\n2. Update incident rate calculation for current quarter\n3. Flag if this incident represents a pattern (3+ similar incidents in quarter)\n4. Note in QAPI Action Tracker for quarterly review', expectedOutput: 'Incident recorded in QAPI log (QA-FM-026)', requiredFormIds: ['QA-FM-026'], onCompleteText: 'Incident integrated into QAPI tracking system.', status: 'pending', dueOffsetDays: 2 },
    { id: 'inc-follow', label: 'Track corrective action closure', description: 'Monitor completion of all corrective actions assigned.', instructions: '1. At each milestone date: check action status\n2. Document completion with evidence\n3. Escalate to Administrator if any action more than 14 days overdue\n4. Close corrective action only with evidence of effectiveness', expectedOutput: 'All corrective actions closed with evidence documented in QA-FM-022', requiredFormIds: ['QA-FM-022'], onCompleteText: 'All corrective actions closed. Incident fully resolved.', status: 'pending', dueOffsetDays: 30 },
  ],
  requiredForms: [
    { id: 'inc-f1', label: 'Incident Report Form',        formId: 'QA-FM-030', status: 'missing', dueOffsetDays:  0 },
    { id: 'inc-f2', label: 'Root Cause Analysis Form',    formId: 'QA-FM-031', status: 'missing', dueOffsetDays:  0 },
    { id: 'inc-f3', label: 'Corrective Action Plan',      formId: 'QA-FM-032', status: 'missing', dueOffsetDays:  1 },
    { id: 'inc-f4', label: 'QAPI Incident Log (updated)', formId: 'QA-FM-026', status: 'missing', dueOffsetDays:  2 },
  ],
  minutes: undefined,
  agenda: {
    distributeBusinessDaysBefore: 0,
    standingTopics: [
      { id: 'inc-t1', title: 'Incident Facts & Severity', discussionPoints: ['What happened? Who was involved?', 'Severity: low / medium / high / sentinel', 'Immediate safety actions taken?'] },
      { id: 'inc-t2', title: 'Root Cause Analysis', discussionPoints: ['5-Why or Fishbone analysis', 'Contributing factors: staff / process / environment / equipment', 'Systemic or isolated event?'] },
      { id: 'inc-t3', title: 'Corrective Action Plan', discussionPoints: ['Action for each contributing factor', 'Owner, due date, success criteria', 'Policy change required?', 'Re-education required?'] },
      { id: 'inc-t4', title: 'QAPI Integration', discussionPoints: ['Add to incident log', 'Update quarterly incident rate', 'Flag as pattern if ≥3 similar in quarter'] },
    ],
  },
  approvals: [
    { id: 'inc-ap1', targetKind: 'report', targetLabel: 'Incident Report',       approverRole: 'Clinical Manager',  required: true, escalationDays: 1 },
    { id: 'inc-ap2', targetKind: 'report', targetLabel: 'Corrective Action Plan', approverRole: 'Administrator',    required: true, escalationDays: 3 },
  ],
  complianceFlags: { auditRisk: 'critical', overdueAfterDays: 1, citation: '42 CFR §484.65(b)(3) — QAPI adverse event tracking', surveyorNote: 'Every incident must have: timely documentation, RCA, corrective action plan with owners, and QAPI integration. A single undocumented incident can trigger a condition-level finding.', missingEvidenceIf: ['missing'] },
  followUps: [
    { id: 'inc-fu1', label: 'Close all corrective actions with evidence', ownerRole: 'QAPI Lead', dueOffsetDays: 30, closureCriteria: 'All actions in QA-FM-032 closed with documented evidence of effectiveness.', escalationDays: 7, escalateToRole: 'Administrator' },
  ],
  isContext: false,
  sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
};

export const COMPLAINT_INVESTIGATION: RegulatoryEvent = {
  id: 'complaint_investigation-20260101-01',
  eventSubType: 'complaint_investigation',
  title: 'Complaint / Grievance Investigation',
  domain: 'Compliance',
  date: '2026-01-01',
  cadence: 'Trigger-based', mandateType: 'federal-required', urgency: 'critical',
  policyRefs: ['CO-CP-001', 'CL-POC-001'],
  owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
  summary: 'Triggered by any patient, family, or staff complaint or grievance. Federal CoP requires written acknowledgment within 5 days and written resolution within 30 days. All complaints must be investigated and documented.',
  regulatoryDriver: '42 CFR §484.50 — Patient Rights; §484.110 — Clinical records; CO-CP-001 Corporate Compliance Program',
  category: 'event-driven',
  processFlow: [
    { id: 'comp-receive', label: 'Acknowledge complaint within 5 business days (written)', description: 'Federal requirement: written acknowledgment within 5 days.', instructions: '1. Document complaint: date received, who reported, nature of complaint, patient/resident ID\n2. Assign complaint ID number\n3. Send written acknowledgment to complainant within 5 business days\n4. Retain copy of acknowledgment', expectedOutput: 'Written acknowledgment letter sent within 5 days (CO-FM-COMP-001)', requiredFormIds: ['CO-FM-COMP-001'], onCompleteText: '5-day acknowledgment sent. Investigation timer started.', status: 'pending', dueOffsetDays: 0 },
    { id: 'comp-investigate', label: 'Investigate complaint thoroughly', description: 'Full investigation within 30 days of receipt.', instructions: '1. Review patient record, care notes, staff accounts\n2. Interview staff involved\n3. Interview patient/family if appropriate\n4. Review relevant policies\n5. Determine if complaint is substantiated\n6. If substantiated: identify contributing factors', expectedOutput: 'Complaint Investigation Report (CO-FM-COMP-002) with findings', requiredFormIds: ['CO-FM-COMP-002'], onCompleteText: 'Investigation complete. Findings documented.', status: 'pending', dueOffsetDays: 14 },
    { id: 'comp-resolve', label: 'Resolve complaint and send written resolution within 30 days', description: 'Written resolution required within 30 days per 42 CFR §484.50.', instructions: '1. Determine resolution: substantiated with corrective action, unsubstantiated with explanation, or referred\n2. Prepare written resolution letter to complainant\n3. Include: investigation summary, findings, actions taken or planned\n4. Send within 30 days of receipt\n5. Retain all documentation', expectedOutput: 'Written resolution letter sent within 30 days (CO-FM-COMP-003)', requiredFormIds: ['CO-FM-COMP-003'], onCompleteText: '30-day written resolution sent. Complaint closed.', status: 'pending', dueOffsetDays: 30 },
    { id: 'comp-qapi', label: 'Feed complaint data into QAPI and compliance tracking', description: 'Add to monthly compliance report and QAPI trending.', instructions: '1. Add to monthly complaint log\n2. Update complaint rate calculation\n3. Add to QAPI incident log if complaint reflects care quality issue\n4. If 3+ similar complaints in quarter: escalate as QAPI corrective action', expectedOutput: 'Complaint added to monthly log and QAPI trending system', requiredFormIds: ['CO-FM-COMP-004'], onCompleteText: 'Complaint integrated into compliance and QAPI tracking.', status: 'pending', dueOffsetDays: 30 },
  ],
  requiredForms: [
    { id: 'comp-f1', label: 'Written Acknowledgment Letter',    formId: 'CO-FM-COMP-001', status: 'missing', dueOffsetDays:  5 },
    { id: 'comp-f2', label: 'Complaint Investigation Report',   formId: 'CO-FM-COMP-002', status: 'missing', dueOffsetDays: 14 },
    { id: 'comp-f3', label: 'Written Resolution Letter',        formId: 'CO-FM-COMP-003', status: 'missing', dueOffsetDays: 30 },
    { id: 'comp-f4', label: 'Complaint Log Entry',              formId: 'CO-FM-COMP-004', status: 'missing', dueOffsetDays: 30 },
  ],
  minutes: undefined,
  agenda: {
    distributeBusinessDaysBefore: 0,
    standingTopics: [
      { id: 'comp-t1', title: 'Complaint Receipt & Triage', discussionPoints: ['Nature of complaint', 'Assign ID and acknowledgment due date (Day 5)', 'Assign investigator'] },
      { id: 'comp-t2', title: 'Investigation Findings', discussionPoints: ['Substantiated or unsubstantiated?', 'Contributing factors if substantiated', 'Policy gaps identified?'] },
      { id: 'comp-t3', title: 'Resolution & Corrective Actions', discussionPoints: ['Resolution determination', '30-day letter prepared?', 'Corrective actions assigned?', 'QAPI integration needed?'] },
    ],
  },
  approvals: [
    { id: 'comp-ap1', targetKind: 'report', targetLabel: 'Complaint Investigation Report',   approverRole: 'Compliance Officer', required: true, escalationDays: 3 },
    { id: 'comp-ap2', targetKind: 'report', targetLabel: 'Written Resolution Letter',        approverRole: 'Administrator',      required: true, escalationDays: 5 },
  ],
  complianceFlags: { auditRisk: 'critical', overdueAfterDays: 5, citation: '42 CFR §484.50 — Patient Rights; written resolution within 30 days', surveyorNote: 'Surveyors review complaint files. Missing 5-day acknowledgment or 30-day resolution is a direct patient rights deficiency.', missingEvidenceIf: ['missing'] },
  followUps: [{ id: 'comp-fu1', label: 'Confirm corrective actions from substantiated complaints are closed', ownerRole: 'Compliance Officer', dueOffsetDays: 60, closureCriteria: 'All corrective actions from complaint closed with evidence.', escalationDays: 14, escalateToRole: 'Administrator' }],
  isContext: false,
  sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
};

export const SURVEY_READINESS_ACTIVATION: RegulatoryEvent = {
  id: 'survey_activation-20260713-01',
  eventSubType: 'survey_activation',
  title: 'Survey Readiness Activation',
  domain: 'Compliance',
  date: '2026-07-13',
  cadence: 'Trigger-based', mandateType: 'federal-required', urgency: 'critical',
  policyRefs: ['CO-CP-001', 'GV-GB-001'],
  owner: 'Administrator', ownerRole: 'Administrator',
  summary: 'Activated when survey notification is received or survey period begins. Full agency mobilization: evidence staging, staff briefing, record retrieval protocol, and designee assignments.',
  regulatoryDriver: '42 CFR Part 484 — All Conditions of Participation. CMS SOM Appendix B survey procedures.',
  category: 'event-driven',
  processFlow: [
    { id: 'srv-notify', label: 'Notify all staff of survey activation within 1 hour', description: 'Immediate all-staff notification upon survey notification.', instructions: '1. Notify all clinical and admin staff via primary communication channel\n2. Assign roles: surveyor liaison, record retrieval coordinator, patient escort coordinator\n3. Confirm administrator and DON availability\n4. Brief all staff on professional surveyor interaction protocols\n5. Activate survey response protocol document', expectedOutput: 'All-staff notification sent with role assignments', requiredFormIds: ['CO-FM-SRV-001'], onCompleteText: 'All staff notified. Roles assigned.', status: 'pending', dueOffsetDays: 0 },
    { id: 'srv-stage', label: 'Stage all evidence binders and documentation systems', description: 'Physical and electronic records staged for surveyor access.', instructions: '1. Confirm all quarterly QAPI evidence binders are accessible\n2. Confirm P&P library is current and organized by domain\n3. Pull personnel files — licenses, training records, OIG screens\n4. Stage patient records for selected sample (surveyor will request)\n5. Confirm EP plan, IC program documentation, GB minutes are accessible', expectedOutput: 'Evidence staging checklist complete (CO-FM-SRV-002)', requiredFormIds: ['CO-FM-SRV-002'], onCompleteText: 'All evidence staged and accessible.', status: 'pending', dueOffsetDays: 0 },
    { id: 'srv-open', label: 'Conduct opening conference with surveyors', description: 'Professional opening conference with surveyor team.', instructions: '1. Welcome surveyor team professionally\n2. Provide agency overview: CCN, service area, census, staff count\n3. Introduce key personnel\n4. Provide conference room and system access\n5. Assign surveyor escort if requested\n6. Document all surveyor requests in log', expectedOutput: 'Opening conference completed; surveyor request log initiated (CO-FM-SRV-003)', requiredFormIds: ['CO-FM-SRV-003'], onCompleteText: 'Opening conference complete. Surveyor requests being tracked.', status: 'pending', dueOffsetDays: 0 },
    { id: 'srv-monitor', label: 'Monitor surveyor requests and provide records within 4 hours', description: 'Track and fulfill all surveyor record requests.', instructions: '1. Log every surveyor request: date/time, record requested, delivered by/time\n2. Provide requested records within 4 business hours (CoP requirement)\n3. Coordinate with clinical staff for patient contact requests\n4. Escalate any unexpected finding to Administrator immediately\n5. Document all interactions', expectedOutput: 'Surveyor Request Log (CO-FM-SRV-003) current and complete', requiredFormIds: ['CO-FM-SRV-003'], onCompleteText: 'All surveyor requests fulfilled within required timeframes.', status: 'pending', dueOffsetDays: 1 },
    { id: 'srv-exit', label: 'Conduct exit conference and document preliminary findings', description: 'Professional exit conference. Document all preliminary findings immediately.', instructions: '1. Attend exit conference with Administrator, DON, and Compliance Officer\n2. Document every preliminary finding verbatim\n3. Request citation reference for every finding\n4. Do not dispute findings at exit — reserve for POC process\n5. Begin Plan of Correction preparation immediately if findings present', expectedOutput: 'Exit conference notes with all preliminary findings documented', requiredFormIds: ['CO-FM-SRV-004'], onCompleteText: 'Exit conference documented. POC process initiated if needed.', status: 'pending', dueOffsetDays: 2 },
  ],
  requiredForms: [
    { id: 'srv-f1', label: 'Survey Notification & Staff Role Assignments',   formId: 'CO-FM-SRV-001', status: 'missing', dueOffsetDays: 0 },
    { id: 'srv-f2', label: 'Evidence Staging Checklist',                      formId: 'CO-FM-SRV-002', status: 'missing', dueOffsetDays: 0 },
    { id: 'srv-f3', label: 'Surveyor Request Log',                             formId: 'CO-FM-SRV-003', status: 'missing', dueOffsetDays: 0 },
    { id: 'srv-f4', label: 'Exit Conference Documentation',                    formId: 'CO-FM-SRV-004', status: 'missing', dueOffsetDays: 2 },
  ],
  minutes: undefined,
  agenda: {
    distributeBusinessDaysBefore: 0,
    standingTopics: [
      { id: 'srv-t1', title: 'Immediate Activation (Hour 1)', discussionPoints: ['All-staff notification', 'Role assignments', 'Evidence staging verification', 'Staff surveyor-interaction briefing'] },
      { id: 'srv-t2', title: 'Opening Conference', discussionPoints: ['Agency overview', 'Key personnel introductions', 'Conference room setup', 'Request log activation'] },
      { id: 'srv-t3', title: 'Survey Monitoring Protocol', discussionPoints: ['4-hour record production rule', 'Request log maintenance', 'Finding escalation protocol'] },
      { id: 'srv-t4', title: 'Exit Conference & POC Initiation', discussionPoints: ['Document all findings verbatim', 'Cite CFR reference for each finding', 'POC due date (10 days or as specified)', 'POC lead assignment'] },
    ],
  },
  approvals: [
    { id: 'srv-ap1', targetKind: 'report', targetLabel: 'Survey Response Activation', approverRole: 'Administrator', required: true, escalationDays: 1 },
  ],
  complianceFlags: { auditRisk: 'critical', overdueAfterDays: 0, citation: '42 CFR Part 484 — Medicare certification CoPs; CMS SOM Appendix B', surveyorNote: 'Survey response professionalism and timeliness directly influence survey outcomes. Failure to produce records within 4 hours is itself a potential deficiency finding.', missingEvidenceIf: ['missing'] },
  followUps: [
    { id: 'srv-fu1', label: 'Submit Plan of Correction within required timeframe', ownerRole: 'Administrator', dueOffsetDays: 10, closureCriteria: 'POC submitted to State Survey Agency within 10 calendar days of survey close or as directed.', escalationDays: 3, escalateToRole: 'Board Chair' },
  ],
  isContext: false,
  sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
};

/* ── Export all expanded events as a flat array ─────────────── */
export const MANDATED_EVENTS_EXPANDED: RegulatoryEvent[] = [
  QAPI_Q2,
  QAPI_Q3,
  QAPI_Q4,
  IC_Q1,
  IC_Q2,
  IC_Q3,
  IC_Q4,
  QAPI_ANNUAL_EVAL,
  COMPLIANCE_ANNUAL_REVIEW,
  PP_ANNUAL_REVIEW,
  ANNUAL_STAFF_TRAINING,
  INCIDENT_ADVERSE_EVENT_REVIEW,
  COMPLAINT_INVESTIGATION,
  SURVEY_READINESS_ACTIVATION,
  // Biennial / Triennial / Annual OIG Work Plan Review
  ...MULTI_YEAR_EVENTS,
  // Canonical 2026 audit calendar (RegulatoryEvent[] — single source of truth).
  ...AUDIT_REGULATORY_EVENTS,
]
  .map((event) => enforceBusinessDay(event))
  .map((event) => applyEventAlignmentPolicy(event));

/* Re-export multi-year events for direct consumers (sprints, dashboards). */
export {
  MULTI_YEAR_EVENTS,
  ENTERPRISE_RISK_BIENNIAL_2026,
  ENTERPRISE_RISK_BIENNIAL_2028,
  POLICY_FRAMEWORK_BIENNIAL_2026,
  POLICY_FRAMEWORK_BIENNIAL_2028,
  WORKFORCE_COMPETENCY_BIENNIAL_2026,
  WORKFORCE_COMPETENCY_BIENNIAL_2028,
  COMPLIANCE_EFFECTIVENESS_BIENNIAL_2026,
  COMPLIANCE_EFFECTIVENESS_BIENNIAL_2028,
  OIG_WORK_PLAN_REVIEW_2026,
  COMPREHENSIVE_COMPLIANCE_TRIENNIAL_2026,
  COMPREHENSIVE_COMPLIANCE_TRIENNIAL_2029,
  EXTERNAL_COMPLIANCE_REVIEW_TRIENNIAL_2026,
  EXTERNAL_COMPLIANCE_REVIEW_TRIENNIAL_2029,
  STRATEGIC_EFFECTIVENESS_TRIENNIAL_2026,
  STRATEGIC_EFFECTIVENESS_TRIENNIAL_2029,
} from './multiYearEvents';

