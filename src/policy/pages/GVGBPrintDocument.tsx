/**
 * GVGBPrintDocument.tsx
 * Standalone full-document print layout for GV-GB-001.
 * Opens in a new tab and auto-triggers the device print dialog.
 * No sidebar / CommandCenterLayout.
 */
import React, { useEffect } from 'react';

// ─── DATA (100% QA Audited — matches GV-GB-001_Final.md exactly) ─────────────

const META = {
  id: 'GV-GB-001',
  title: 'Governing Body Authority & Responsibilities',
  domain: 'GV — Governance & Administration',
  subdomain: 'GB — Governing Body',
  tier: 'REQUIRED',
  version: '6.0',
  effective: '2025-07-10',
  approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
  lastReviewed: '2025-07-10',
  nextReviewDate: '2026-07-10',
  supersedes: 'N/A (Initial Version)',
};

const DEFINITIONS = [
  { term: 'Governing Body', definition: 'The individual(s), board of directors, trustees, partnership, corporation, or other legally constituted authority that has ultimate responsibility for the management and operation of Care Indeed Home Health Care, Inc., as defined by 42 CFR § 484.2 and § 484.105.' },
  { term: 'Administrator', definition: "The individual appointed by the Governing Body who is responsible for managing the agency's day-to-day operations and who meets all qualifications specified in agency policy GV-OG-002 and applicable California state law." },
  { term: 'Clinical Manager', definition: 'The registered nurse (or qualified individual per California state law) designated by the Governing Body to oversee clinical services including patient care delivery, clinical staff supervision, and OASIS compliance. Also referred to as Director of Nursing (DON).' },
  { term: 'Fiduciary Duty', definition: 'The legal obligation of Governing Body members to act in good faith, with due diligence, and in the best interest of the agency and the patients it serves.' },
  { term: 'Quorum', definition: "The minimum number of Governing Body members required to be present (physically or via approved teleconference) to conduct official business, as defined in the agency's bylaws or operating agreement." },
  { term: 'QAPI', definition: 'Quality Assessment and Performance Improvement — the structured program required by 42 CFR § 484.65 for ongoing quality monitoring and improvement.' },
];

const STATEMENTS = [
  '4.1 Care Indeed Home Health Care, Inc. shall maintain a designated Governing Body that holds full legal authority and responsibility for the overall operation, management, and regulatory compliance of the home health agency, as required by 42 CFR § 484.105(a).',
  '4.2 The Governing Body shall be responsible for ensuring that Care Indeed Home Health Care, Inc. operates in compliance with all applicable federal, state, and local laws, regulations, and licensure requirements at all times.',
  '4.3 The Governing Body shall appoint a qualified Administrator who is authorized to act on behalf of the Governing Body in the day-to-day management of the agency and who meets the qualifications defined in agency policy GV-OG-002 and applicable California state requirements.',
  '4.4 The Governing Body shall ensure the appointment and ongoing oversight of a qualified Clinical Manager (Director of Nursing) responsible for all clinical services, in compliance with 42 CFR § 484.105(c).',
  "4.5 The Governing Body shall approve and oversee the agency's:\n• Scope of services (GV-OG-003)\n• Organizational structure and reporting lines (GV-OG-001)\n• Annual strategic plan and operational goals (GV-OG-004)\n• Policy framework and all REQUIRED-tier policies (GV-PM-001, GV-PM-002)\n• QAPI program (QA-PG-001, QA-PG-002)\n• Corporate compliance program (CO-CP-001)\n• Annual operating budget (FN-FP-005)\n• Emergency preparedness plan (OP-FM-005)",
  '4.6 The Governing Body shall meet at a frequency sufficient to fulfill its oversight responsibilities, but not less than quarterly, with meetings documented in formal minutes per policy GV-GB-002.',
  '4.7 The Governing Body shall not delegate its ultimate accountability for regulatory compliance, patient safety, or fiscal integrity. Delegation of specific authority shall comply with policy GV-OG-005.',
  '4.8 All members of the Governing Body shall disclose and manage conflicts of interest in accordance with policy GV-GB-003.',
  '4.9 Only the most current approved version of this policy shall be considered valid. Superseded versions must not be used for any operational or compliance purpose. Any revision to this policy requires re-acknowledgment by all Governing Body members and senior leadership within 14 calendar days of the revised effective date.',
];

const PROC_61 = [
  ['6.1.1', 'Agency Owner / Corporate Entity', 'Formally establish the Governing Body through articles of incorporation, operating agreement, partnership agreement, or equivalent legal instrument for Care Indeed Home Health Care, Inc. The establishing document must identify: (a) the legal form of the Governing Body; (b) the minimum and maximum number of members; (c) the quorum requirement; (d) the terms of appointment or election.', 'Prior to initial Medicare certification and maintained continuously thereafter.'],
  ['6.1.2', 'Governing Body Chair', 'Maintain a current roster of all Governing Body members including: full legal name, title/role, date of appointment, term expiration date, voting status, and contact information.', 'Updated within 7 calendar days of any membership change.'],
  ['6.1.3', 'Governing Body', 'Ensure composition includes, at minimum, individuals with competency in: (a) healthcare operations or clinical services; (b) financial management; (c) regulatory compliance. If any competency area is not represented by a current member, the Governing Body shall retain qualified advisory counsel within 30 calendar days of identifying the gap.', 'Ongoing; reviewed annually at the first quarterly meeting of each calendar year.'],
  ['6.1.4', 'Compliance Officer', 'Verify that no Governing Body member appears on the OIG List of Excluded Individuals/Entities (LEIE) or the System for Award Management (SAM) exclusion database at the time of appointment and monthly thereafter, per policy HR-TA-003.', 'At appointment and monthly thereafter.'],
];

const PROC_62 = [
  {
    title: '6.2.1 — Legal Authority and Agency Operations',
    rows: [
      ['6.2.1.1', 'Governing Body', 'Assume and maintain full legal authority for the overall operation, management, and fiscal viability of Care Indeed Home Health Care, Inc.', 'Continuous.'],
      ['6.2.1.2', 'Governing Body', 'Ensure the agency maintains current and valid: (a) California home health license — HCAI License No. 406412878; (b) Medicare certification; (c) Medicaid enrollment (if applicable); (d) accreditation (if applicable) — per policy GV-EA-004.', 'Continuous; verified at each quarterly meeting.'],
      ['6.2.1.3', 'Governing Body', "Review and approve the agency's defined scope of services (policy GV-OG-003) at least annually. Ensure the agency does not provide services beyond those for which it is licensed, staffed, and competent to deliver.", 'Annually, within 30 calendar days of the start of the fiscal year.'],
    ],
  },
  {
    title: '6.2.2 — Appointment and Oversight of Key Personnel',
    rows: [
      ['6.2.2.1', 'Governing Body', 'Appoint a qualified Administrator and document the appointment in Governing Body minutes. The Administrator must meet all qualifications defined in policy GV-OG-002 and applicable California state law.', 'Prior to agency operation and within 30 calendar days of any vacancy.'],
      ['6.2.2.2', 'Governing Body', 'Appoint or confirm the appointment of a qualified Clinical Manager (Director of Nursing) responsible for all clinical services, per 42 CFR § 484.105(c).', 'Prior to agency operation and within 30 calendar days of any vacancy.'],
      ['6.2.2.3', 'Governing Body', 'Appoint or confirm the designation of a Compliance Officer with authority and independence to operate the corporate compliance program, per policy CO-CP-002.', 'Prior to agency operation and within 30 calendar days of any vacancy.'],
      ['6.2.2.4', 'Governing Body', 'Conduct or commission an annual performance evaluation of the Administrator. Results and any corrective directives shall be documented in executive session minutes.', 'Annually; completed within 60 calendar days of the end of each fiscal year.'],
      ['6.2.2.5', 'Governing Body', "Review and approve the agency's succession plan for the Administrator, Clinical Manager, and Compliance Officer, per policy GV-GB-004.", 'Annually at the second quarterly meeting; updated within 14 calendar days of any key leadership vacancy.'],
    ],
  },
  {
    title: '6.2.3 — Policy and Compliance Oversight',
    rows: [
      ['6.2.3.1', 'Governing Body', 'Approve all REQUIRED-tier policies prior to implementation and ensure a defined policy review cycle exists per policies GV-PM-001 and GV-PM-002.', 'Prior to implementation of each REQUIRED policy; review cycle approved annually.'],
      ['6.2.3.2', 'Governing Body', 'Receive and review a compliance status report from the Compliance Officer at each quarterly meeting. The report must address: (a) active compliance investigations; (b) audit findings; (c) regulatory changes affecting the agency; (d) training completion rates.', 'Quarterly.'],
      ['6.2.3.3', 'Compliance Officer', 'Prepare and submit the quarterly compliance report to the Governing Body no fewer than 7 calendar days before each scheduled quarterly meeting.', '7 calendar days before each quarterly meeting.'],
      ['6.2.3.4', 'Governing Body', 'Review and act upon any compliance deficiency identified as high-risk within 14 calendar days of receiving the compliance report. Action must be documented in meeting minutes or a special resolution.', 'Within 14 calendar days of report receipt.'],
    ],
  },
  {
    title: '6.2.4 — Quality Assessment and Performance Improvement (QAPI) Oversight',
    rows: [
      ['6.2.4.1', 'Governing Body', "Approve the agency's QAPI plan, per policy QA-PG-002, and ensure that the plan includes measurable quality indicators, performance improvement projects, and patient safety initiatives.", 'Annually; approved at the first quarterly meeting of each calendar year.'],
      ['6.2.4.2', 'Clinical Manager / QA Designee', 'Present a QAPI performance report to the Governing Body at each quarterly meeting including: (a) quality indicator trends; (b) status of active PIPs; (c) adverse event summary; (d) patient satisfaction data; (e) Star Rating / Home Health Compare trends (policy QA-SM-004).', 'Quarterly.'],
      ['6.2.4.3', 'Governing Body', 'Review, discuss, and document its response to the QAPI report. If any quality indicator falls below the defined threshold for 2 consecutive reporting periods, the Governing Body shall direct corrective action and assign accountability with a defined resolution deadline.', 'At each quarterly meeting; corrective action directive within 14 calendar days if thresholds are breached.'],
    ],
  },
  {
    title: '6.2.5 — Financial Oversight',
    rows: [
      ['6.2.5.1', 'Governing Body', 'Review and approve the annual operating budget per policy FN-FP-005.', 'Annually; approved no later than 30 calendar days before the start of each fiscal year.'],
      ['6.2.5.2', 'Administrator', 'Present a financial performance report to the Governing Body at each quarterly meeting including: (a) revenue vs. budget variance; (b) accounts receivable aging; (c) claims denial rate and trending; (d) cash flow position.', 'Quarterly.'],
      ['6.2.5.3', 'Governing Body', 'Review financial reports and direct corrective action if: (a) actual revenue deviates more than 10% below budget for 2 consecutive months; (b) claims denial rate exceeds 5%; (c) days in accounts receivable exceed 60. Directives must be documented in meeting minutes.', 'At each quarterly meeting.'],
    ],
  },
  {
    title: '6.2.6 — Emergency Preparedness',
    rows: [
      ['6.2.6.1', 'Governing Body', "Approve the agency's Emergency Operations and Business Continuity Plan per policy OP-FM-005 and 42 CFR § 484.102.", 'Annually; approved at the third quarterly meeting.'],
      ['6.2.6.2', 'Administrator', 'Report the results of the most recent emergency preparedness drill or exercise to the Governing Body, including identified gaps and corrective actions.', 'At the quarterly meeting following each drill (minimum 2 drills per year).'],
    ],
  },
];

const PROC_63 = [
  ['6.3.1', 'Governing Body Chair', 'Schedule and convene regular Governing Body meetings no fewer than 4 times per calendar year (quarterly). The meeting schedule for the upcoming year must be established and distributed to all members by December 15 of the preceding year.', 'Quarterly; schedule distributed by December 15.'],
  ['6.3.2', 'Governing Body Chair', 'Convene special meetings when urgent matters arise, including but not limited to: (a) CMS survey findings requiring immediate corrective action; (b) serious adverse events; (c) regulatory enforcement actions; (d) key leadership vacancies. Notice of a special meeting must be provided to all members at least 48 hours in advance unless the matter constitutes an imminent threat to patient safety, in which case notice may be shortened to the minimum practicable.', 'As needed; notice within 48 hours or shorter for imminent patient safety threats.'],
  ['6.3.3', 'Designated Secretary / Administrator', 'Prepare and distribute the meeting agenda to all Governing Body members no fewer than 7 calendar days before each scheduled meeting. The agenda must include standing items: (a) approval of prior minutes; (b) Administrator report; (c) compliance report; (d) QAPI report; (e) financial report; (f) old business; (g) new business.', '7 calendar days before each meeting.'],
  ['6.3.4', 'Designated Secretary', 'Record formal minutes for each meeting per policy GV-GB-002. Minutes must document: (a) date, time, and location; (b) members present and absent; (c) quorum determination; (d) all motions, seconds, and voting outcomes; (e) all directives issued with assigned responsible parties and deadlines; (f) executive session topics (without protected details).', 'Draft minutes completed within 14 calendar days of the meeting; approved at the next regular meeting.'],
  ['6.3.5', 'Governing Body Chair', 'Ensure a quorum is present before conducting any official business. If quorum is not achieved, the meeting shall be rescheduled within 14 calendar days.', 'At the start of each meeting.'],
];

const PROC_64 = [
  ['6.4.1', 'All Governing Body Members', 'Complete and submit the Conflict of Interest Disclosure Form (Appendix B) at the time of appointment, annually thereafter, and within 7 calendar days of any change in circumstances that could create a new conflict, per policy GV-GB-003.', 'At appointment; annually; within 7 days of change.'],
  ['6.4.2', 'Compliance Officer', 'Review all submitted conflict of interest disclosures within 14 calendar days of receipt and present a summary to the Governing Body with recommendations for management or recusal.', 'Within 14 calendar days of receipt.'],
  ['6.4.3', 'Governing Body', 'Act on conflict of interest recommendations. Any member with a disclosed conflict shall recuse from discussion and voting on the affected matter. Recusals must be documented in meeting minutes.', 'At the meeting where the affected matter is addressed.'],
];

const PROC_65 = [
  ['Governing Body fails to meet quarterly', 'Administrator notifies all members and the Compliance Officer in writing.', 'Administrator schedules a make-up meeting. If Governing Body does not convene within 30 calendar days, the Compliance Officer documents the deficiency and initiates corrective action per QA-AE-003.', 'Make-up meeting within 30 calendar days of the missed quarter.'],
  ['Quorum not achieved for 2 consecutive scheduled meetings', 'Governing Body Chair escalates to the full membership in writing.', "Chair initiates membership recruitment or replacement per the agency's bylaws. Issue must be resolved before the next scheduled meeting.", 'Within 30 calendar days.'],
  ['Key leadership vacancy (Administrator, Clinical Manager, Compliance Officer) exceeds 30 days unfilled', 'Governing Body Chair', 'Governing Body must appoint an interim designee within 14 calendar days of vacancy and document the appointment. Permanent appointment must occur within 90 calendar days.', 'Interim: 14 days. Permanent: 90 days.'],
  ['CMS survey results in Condition-level deficiency', 'Administrator convenes a special Governing Body meeting.', 'Governing Body directs development of a Plan of Correction within CMS-required timeframes (typically 10 calendar days). Governing Body receives weekly status updates until resolution is confirmed.', 'Special meeting within 48 hours of receipt of findings; Plan of Correction per CMS deadline.'],
  ['Compliance Officer reports fraud, waste, or abuse concern to Governing Body', 'Governing Body Chair', 'Governing Body directs investigation per CO-CP-007 and ensures non-retaliation per CO-CP-005. Governing Body receives investigation status updates at each meeting until resolution.', 'Investigation initiated within 7 calendar days; updates at each meeting.'],
];

const DOCS_REQ = [
  ['Governing Body establishment', 'Articles of incorporation, operating agreement, bylaws, or equivalent legal instrument establishing the Governing Body of Care Indeed Home Health Care, Inc.', 'Agency Owner / Corporate Entity', 'Corporate records repository (physical or electronic).', 'Maintained permanently; updated within 14 calendar days of any amendment.'],
  ['Governing Body membership roster', 'Current roster including member name, role, appointment date, term, voting status, and contact information (Appendix A).', 'Governing Body Chair', 'Agency governance file; copy maintained by Administrator.', 'Updated within 7 calendar days of any change.'],
  ['Meeting minutes', 'Formal minutes for all regular and special meetings, per policy GV-GB-002 (Appendix D template).', 'Designated Secretary', 'Agency governance file; copy provided to each member.', 'Draft within 14 calendar days of meeting; approved at next regular meeting. Retained for minimum 7 years.'],
  ['Meeting agendas', 'Agenda for each regular and special meeting.', 'Administrator / Designated Secretary', 'Agency governance file.', 'Distributed 7 calendar days before each meeting; retained for minimum 7 years.'],
  ['Administrator appointment', "Written documentation of the Governing Body's appointment of the Administrator, including qualifications verified.", 'Governing Body Chair', 'Governing Body minutes; Administrator personnel file.', 'At time of appointment.'],
  ['Clinical Manager appointment', 'Written documentation of the appointment or confirmation of the Clinical Manager.', 'Governing Body Chair', 'Governing Body minutes; Clinical Manager personnel file.', 'At time of appointment.'],
  ['Compliance Officer designation', 'Written documentation of the designation and authority granted to the Compliance Officer.', 'Governing Body Chair', 'Governing Body minutes; Compliance Officer personnel file.', 'At time of designation.'],
  ['Conflict of Interest disclosures', 'Completed Conflict of Interest Disclosure Forms (Appendix B) for each Governing Body member.', 'Compliance Officer (collection); each member (completion)', 'Compliance file; copy in governance file.', 'At appointment; annually; within 7 days of change. Retained for minimum 7 years.'],
  ['Quarterly compliance reports', "Compliance Officer's written report to the Governing Body.", 'Compliance Officer', 'Agency governance file; compliance records.', 'Submitted 7 days before each quarterly meeting; retained for minimum 7 years.'],
  ['Quarterly QAPI reports', "Clinical Manager / QA Designee's written report to the Governing Body.", 'Clinical Manager / QA Designee', 'Agency governance file; QAPI records.', 'Presented at each quarterly meeting; retained for minimum 7 years.'],
  ['Financial reports', 'Quarterly financial performance report presented to the Governing Body.', 'Administrator', 'Agency governance file; financial records.', 'Presented at each quarterly meeting; retained per CO-HP-007.'],
  ['Annual budget approval', 'Documented Governing Body approval of the annual operating budget.', 'Administrator (preparation); Governing Body (approval)', 'Governing Body minutes; financial records.', 'Annually; approved 30 days before fiscal year start.'],
  ['QAPI plan approval', 'Documented Governing Body approval of the annual QAPI plan.', 'Clinical Manager / QA Designee (preparation); Governing Body (approval)', 'Governing Body minutes; QAPI records.', 'Annually at first quarterly meeting.'],
  ['Emergency preparedness plan approval', 'Documented Governing Body approval of the emergency plan.', 'Administrator (preparation); Governing Body (approval)', 'Governing Body minutes; emergency preparedness file.', 'Annually at third quarterly meeting.'],
  ['Exclusion screening results', 'Documentation of OIG/SAM screening for each Governing Body member.', 'Compliance Officer', 'Compliance file.', 'At appointment; monthly thereafter.'],
  ['Policy acknowledgment', 'Signed acknowledgment of this policy by all Governing Body members and senior leadership (Appendix C).', 'Each member / leader (completion); Administrator (collection)', 'Policy acknowledgment file.', 'Within 14 calendar days of policy effective date or revision; within 14 calendar days of new appointment.'],
  ['Annual Governance Self-Assessment', 'Completed self-assessment per policy GV-GB-005 (if adopted).', 'Governing Body Chair', 'Governance file.', 'Annually.'],
];

const COMPLIANCE_81 = [
  ['Governing Body is legally established and documented.', 'Review of establishing documents (articles, bylaws, operating agreement).', 'Current, complete, and on file at all times.'],
  ['Governing Body meets at least quarterly.', 'Review of meeting minutes with dates and attendance.', '4 or more meetings per calendar year with quorum present at each.'],
  ['Key personnel (Administrator, Clinical Manager, Compliance Officer) are appointed and documented.', 'Review of Governing Body minutes; personnel files; appointment letters.', 'Current appointments documented; no vacancy exceeds 30 days without interim designee.'],
  ['QAPI plan is reviewed and approved annually.', 'Review of Governing Body minutes for documented approval.', 'Annual approval documented at first quarterly meeting.'],
  ['Compliance reports are presented quarterly.', 'Review of Governing Body agendas and minutes; compliance report files.', 'Reports submitted 7 days before each meeting; discussion documented in minutes.'],
  ['Conflict of Interest disclosures are current.', 'Review of Appendix B forms for each member; annual renewal dates.', '100% completion rate; no lapsed disclosures.'],
  ['Budget is approved annually.', 'Review of Governing Body minutes; budget document.', 'Approved no later than 30 days before fiscal year start.'],
  ['Governing Body members are screened for exclusion.', 'Review of OIG/SAM screening logs.', 'Initial screening at appointment; monthly screening documented.'],
  ['Policy acknowledgments are current.', 'Review of signed Appendix C forms.', '100% acknowledgment within 14 calendar days of effective date or new appointment.'],
];

const COMPLIANCE_83 = [
  ['No documented evidence that a Governing Body exists or functions.', 'Condition-level deficiency under 42 CFR § 484.105. Potential termination of Medicare certification.', 'Maintain establishing documents, current roster, and quarterly minutes on file and readily accessible.'],
  ['Governing Body meetings are held but not documented.', 'Surveyor will treat undocumented meetings as not having occurred.', 'Use Appendix D template; complete draft minutes within 14 calendar days.'],
  ['Governing Body "rubber stamps" reports without documented discussion or action.', 'Surveyors will cite passive governance as failure to exercise oversight.', 'Minutes must document specific discussion points, questions, directives, and assigned follow-up.'],
  ['Key leadership vacancies are unfilled for extended periods.', 'Surveyor will cite failure to ensure adequate management.', 'Fill or designate interim within 14 calendar days per Section 6.5.'],
  ['No documented conflict of interest disclosures.', 'OIG compliance program requirement; potential survey finding.', 'Enforce annual disclosure per Appendix B; Compliance Officer tracks compliance.'],
  ['QAPI plan approved but no evidence of Governing Body review of quality data.', 'Surveyor will cite failure of governing body oversight of QAPI (42 CFR § 484.65 cross-reference).', 'Require quarterly QAPI report presentation and document Governing Body response.'],
];

const SURVEYOR_ITEMS = [
  'Evidence that a Governing Body exists and is functioning. Surveyors will request establishing documents and a current membership roster. A sole proprietor must demonstrate individual acceptance of governing body responsibilities.',
  'Evidence that the Governing Body has appointed a qualified Administrator. Surveyors will review Governing Body minutes for appointment documentation and verify qualifications per California state requirements.',
  'Evidence of Clinical Manager oversight. Surveyors will look for Governing Body minutes documenting appointment, reporting, and oversight of clinical services leadership.',
  'Evidence that the Governing Body oversees QAPI. Surveyors will examine whether the Governing Body has reviewed, approved, and acted upon quality data. Passive receipt of reports without documented action is a common deficiency.',
  "Evidence of policy oversight. Surveyors will verify that the Governing Body has approved the agency's policies and that a review cycle exists.",
  "Evidence of fiscal oversight. Surveyors will review whether the Governing Body monitors the agency's financial viability and acts on adverse trends.",
  'Meeting frequency and documentation quality. Surveyors will request all meeting minutes for the survey look-back period and assess completeness, including attendance, quorum, and documented decisions.',
];

const REF_FEDERAL = [
  ['42 CFR § 484.2', 'Definitions', "Defines 'governing body' and key terms for home health agencies."],
  ['42 CFR § 484.105', 'Condition of Participation: Organization and Administration of Services', 'Primary regulatory basis for this policy. Requires a governing body with full legal authority for agency operation and management.'],
  ['42 CFR § 484.105(a)', 'Standard: Governing body', 'Mandates governing body responsibility for agency operations, appointment of administrator, and oversight of services.'],
  ['42 CFR § 484.105(b)', 'Standard: Administrator', 'Requires appointment of a qualified administrator responsible to the governing body.'],
  ['42 CFR § 484.105(c)', 'Standard: Clinical manager', 'Requires designation of a qualified clinical manager for oversight of clinical services.'],
  ['42 CFR § 484.60', 'Condition of Participation: Care planning, coordination, and quality of care', 'Governing body accountability for ensuring care planning and quality.'],
  ['42 CFR § 484.65', 'Condition of Participation: Quality assessment and performance improvement (QAPI)', 'Governing body must ensure an effective QAPI program.'],
  ['42 CFR § 484.70', 'Condition of Participation: Infection prevention and control', 'Governing body oversight of infection prevention.'],
  ['42 CFR § 484.100', 'Condition of Participation: Compliance with Federal, State, and local laws', 'Governing body must ensure full legal compliance.'],
  ['42 CFR § 484.102', 'Condition of Participation: Emergency preparedness', 'Governing body must approve emergency preparedness plan.'],
  ['42 CFR § 484.110', 'Condition of Participation: Clinical records', 'Governing body oversight of clinical records policies.'],
];

const REF_CROSS = [
  ['GV-OG-001', 'Organizational Structure & Reporting', 'Governing Body approves organizational structure.'],
  ['GV-OG-002', 'Administrator Qualifications & Responsibilities', 'Governing Body appoints and evaluates Administrator.'],
  ['GV-OG-003', 'Scope of Services Definition', 'Governing Body approves scope of services.'],
  ['GV-OG-004', 'Strategic Planning & Annual Goals', 'Governing Body approves strategic plan.'],
  ['GV-OG-005', 'Delegation of Authority', 'Governs limits of Governing Body delegation.'],
  ['GV-PM-001', 'Policy Development & Approval Process', 'Governing Body approves REQUIRED-tier policies.'],
  ['GV-PM-002', 'Policy Review & Revision Cycle', 'Governing Body ensures policy review cycle.'],
  ['GV-PM-003', 'Policy Acknowledgment & Staff Attestation', 'Staff acknowledgment of this and all policies.'],
  ['GV-GB-002', 'Board Meeting & Minutes Requirements', 'Details meeting documentation standards.'],
  ['GV-GB-003', 'Conflict of Interest Disclosure', 'Governs member conflict disclosures.'],
  ['GV-GB-004', 'Succession Planning for Key Leadership', 'Governing Body reviews succession plan.'],
  ['GV-GB-005', 'Annual Governance Self-Assessment', 'Governing Body self-assessment tool.'],
  ['GV-EA-004', 'Agency Licensure & Certification Maintenance', 'Governing Body ensures licensure/certification currency.'],
  ['GV-EA-005', 'Agency Closure or Change of Ownership', 'Governing Body directs CHOW process.'],
  ['QA-PG-001', 'QAPI Program Establishment & Governance', 'Governing Body oversees QAPI program.'],
  ['QA-PG-002', 'QAPI Plan Development & Annual Review', 'Governing Body approves QAPI plan.'],
  ['QA-AE-003', 'Corrective Action Plan Development & Tracking', 'Escalation path for governance deficiencies.'],
  ['QA-SM-004', 'Home Health Compare & Star Rating Monitoring', 'Data reported to Governing Body quarterly.'],
  ['CO-CP-001', 'Corporate Compliance Program', 'Governing Body oversees compliance program.'],
  ['CO-CP-002', 'Compliance Officer Designation & Authority', 'Governing Body appoints Compliance Officer.'],
  ['CO-CP-005', 'Whistleblower Protection & Non-Retaliation', 'Governing Body ensures non-retaliation.'],
  ['CO-CP-007', 'Compliance Investigation Process', 'Governing Body directs investigations.'],
  ['CO-HP-007', 'Record Retention & Destruction', 'Retention standards for governance records.'],
  ['FN-FP-005', 'Annual Budget & Financial Planning', 'Governing Body approves budget.'],
  ['HR-TA-003', 'OIG/SAM Exclusion Screening', 'Screening of Governing Body members.'],
  ['OP-FM-005', 'Emergency Operations & Business Continuity', 'Governing Body approves emergency plan.'],
  ['EN-TG-001', 'Enterprise Policy Taxonomy & Classification Governance', 'Framework under which this policy is classified.'],
];

const TRAINING_ITEMS = [
  'All Governing Body members of Care Indeed Home Health Care, Inc. shall receive orientation to this policy within 14 calendar days of appointment. Orientation shall be conducted by the Administrator or Compliance Officer and must cover: (a) the legal authority and responsibilities of the Governing Body; (b) meeting and quorum requirements; (c) conflict of interest obligations; (d) QAPI, compliance, and financial oversight expectations; (e) CMS survey process and surveyor expectations for governance documentation.',
  'All Governing Body members and senior leadership personnel within scope of this policy (Section 3) shall sign the Policy Acknowledgment Form (Appendix C) within 14 calendar days of the policy effective date, any revision, or new appointment.',
  'The Administrator shall maintain a tracking log of all policy acknowledgments and report any non-compliance to the Governing Body Chair within 7 calendar days of the acknowledgment deadline. Failure to acknowledge within the required timeframe shall result in written notification from the Governing Body Chair with a mandatory completion deadline of 7 additional calendar days.',
  'Annual refresher training on governing body responsibilities shall be conducted at the first quarterly meeting of each calendar year. Attendance shall be documented in meeting minutes.',
];

const VERSION_ITEMS = [
  "This policy is maintained under the agency's enterprise policy lifecycle management system per policy EN-LC-001.",
  'Only the most current approved version of this policy, as reflected in the policy header, is valid for any operational, compliance, or regulatory purpose. All superseded versions must be archived and clearly marked as "SUPERSEDED — NOT FOR USE."',
  'Any substantive revision to this policy requires: (a) review and approval by the Governing Body, documented in meeting minutes; (b) re-acknowledgment by all personnel within scope, within 14 calendar days of the revised effective date; (c) update to the enterprise policy index per EN-TG-001.',
  'Non-substantive revisions (formatting, typographical corrections, updated cross-references) may be approved by the Administrator with notification to the Governing Body at the next regular meeting. Non-substantive revisions do not require re-acknowledgment.',
];

const CHECKLIST_ITEMS = [
  'Governing Body meeting convened this quarter with quorum?',
  'Meeting agenda distributed at least 7 days prior?',
  'Prior meeting minutes approved?',
  'Administrator report presented?',
  'Compliance Officer report presented?',
  'QAPI report presented?',
  'Financial report presented?',
  'All Governing Body member OIG/SAM screenings current (monthly)?',
  'All Conflict of Interest disclosures current?',
  'All key leadership positions filled (Administrator, Clinical Manager, Compliance Officer)?',
  'Governing Body membership roster current?',
  'Policy acknowledgments current for all members/leaders in scope?',
  'Q1 Only: Annual QAPI plan reviewed and approved?',
  'Q1 Only: Annual refresher training on governance responsibilities conducted?',
  'Q1 Only: Governing Body composition reviewed for competency coverage?',
  'Q2 Only: Succession plan reviewed and approved?',
  'Q3 Only: Emergency preparedness plan reviewed and approved?',
  'Pre-Fiscal Year: Annual operating budget reviewed and approved?',
  'All directives from prior meeting assigned, tracked, and status reported?',
  'Any Condition-level survey findings requiring Governing Body action?',
];

// ─── PRIMITIVE HELPERS ───────────────────────────────────────────────────────

const TEAL = '#D4AF37';
const RUST = '#C74600';
const DARK = '#1F1C1B';
const MID  = '#524048';
const PALE = '#FAFBF8';
const BORDER = '#E5E4E3';

/** Underline line field (for print fill-in) */
const LineField = ({ w = 120, label = '' }: { w?: number; label?: string }) => (
  <input
    type="text"
    aria-label={label}
    style={{
      border: 'none',
      borderBottom: `1px solid ${DARK}`,
      background: 'transparent',
      outline: 'none',
      width: w,
      fontSize: 11,
      fontFamily: 'Roboto, sans-serif',
      padding: '0 2px',
      verticalAlign: 'bottom',
      marginLeft: 4,
      marginRight: 2,
    }}
  />
);

/** Standard print table */
const PT = ({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontSize: 11 }}>
    <thead>
      <tr>
        {headers.map((h, i) => (
          <th
            key={i}
            style={{
              backgroundColor: TEAL,
              color: '#fff',
              padding: '6px 8px',
              textAlign: 'left',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: 10,
              border: `1px solid #004d47`,
            }}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : PALE }}>
          {row.map((cell, j) => (
            <td
              key={j}
              style={{
                border: `1px solid ${BORDER}`,
                padding: '5px 8px',
                verticalAlign: 'top',
                fontSize: 11,
                lineHeight: 1.45,
                whiteSpace: 'pre-line',
                color: DARK,
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const H1 = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 14, color: DARK, borderBottom: `2px solid ${TEAL}`, paddingBottom: 4, marginTop: 28, marginBottom: 10 }}>
    {children}
  </h2>
);

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 12, color: TEAL, marginTop: 16, marginBottom: 6 }}>
    {children}
  </h3>
);

const PageBreak = () => <div style={{ pageBreakBefore: 'always' }} />;

const AppPrintHeader = ({ id, title }: { id: string; title: string }) => (
  <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: `2px solid ${TEAL}` }}>
    <div style={{ display: 'inline-block', width: 50, height: 50, borderRadius: '50%', backgroundColor: `${TEAL}20`, border: `2px solid ${TEAL}40`, lineHeight: '46px', textAlign: 'center', marginBottom: 8 }}>
      <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 18, color: TEAL }}>{id}</span>
    </div>
    <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 20, color: DARK }}>Appendix {id}</div>
    <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: MID, marginTop: 4 }}>{title}</div>
    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#999', fontStyle: 'italic', marginTop: 6 }}>
      Care Indeed Home Health Care, Inc. · Policy GV-GB-001 · Version 6.0 · 2025-07-10
    </div>
  </div>
);

// ─── PRINT SECTIONS ──────────────────────────────────────────────────────────

const Cover = () => (
  <div style={{ backgroundColor: TEAL, color: '#fff', padding: '40px 48px', pageBreakAfter: 'always' }}>
    <img
      src="https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_White.png"
      alt="Care Indeed Home Health Care"
      style={{ height: 48, marginBottom: 24 }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
    <div style={{ marginBottom: 12 }}>
      <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: 999, fontSize: 11, fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
        {META.id}
      </span>
      <span style={{ backgroundColor: '#C74600', padding: '3px 10px', borderRadius: 4, fontSize: 9, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginLeft: 8 }}>
        Draft
      </span>
      <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', padding: '3px 10px', borderRadius: 4, fontSize: 9, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginLeft: 8 }}>
        {META.tier}
      </span>
    </div>
    <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 24, lineHeight: 1.25, marginBottom: 12 }}>{META.title}</h1>
    <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 20 }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, fontSize: 12 }}>
      {[
        ['Domain', META.domain],
        ['Tier', META.tier],
        ['Approved By', META.approvedBy],
        ['Supersedes', META.supersedes],
        ['Effective Date', META.effective],
        ['Last Reviewed', META.lastReviewed],
        ['Next Review', META.nextReviewDate],
        ['Version', `v${META.version}`],
      ].map(([label, value]) => (
        <div key={label}>
          <span style={{ display: 'block', fontSize: 9, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>{label}</span>
          <strong style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11 }}>{value}</strong>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 32, fontSize: 10, color: 'rgba(255,255,255,0.6)', fontFamily: 'Roboto, sans-serif' }}>
      Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </div>
  </div>
);

const Sec2Purpose = () => (
  <div>
    <H1>2. Purpose</H1>
    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, lineHeight: 1.7, color: DARK }}>
      This policy establishes the authority, composition, functions, and oversight responsibilities of the Governing Body of Care Indeed Home Health Care, Inc. The Governing Body is the ultimate authority accountable for the operation, management, fiscal viability, and regulatory compliance of the home health agency. This policy ensures the agency satisfies the requirements set forth in <strong>42 CFR § 484.105</strong> — Condition of Participation: Organization and Administration of Services, which mandates that a home health agency must have a governing body that assumes full legal authority and responsibility for the agency's overall operation and management.
    </p>
  </div>
);

const Sec3Scope = () => (
  <div>
    <H1>3. Scope</H1>
    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 700, marginBottom: 8, color: DARK }}>This policy applies to:</p>
    <ul style={{ paddingLeft: 20, margin: 0 }}>
      {[
        'All members of the Governing Body of Care Indeed Home Health Care, Inc. (including voting and non-voting members)',
        'The Agency Administrator',
        'The Director of Nursing / Clinical Manager',
        'The Compliance Officer',
        'All senior leadership personnel who report directly to the Governing Body or Administrator',
        'All contracted management entities performing governing body functions on behalf of the agency',
      ].map((item, i) => (
        <li key={i} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, lineHeight: 1.65, color: DARK, marginBottom: 4 }}>{item}</li>
      ))}
    </ul>
    <div style={{ marginTop: 12, padding: '10px 14px', backgroundColor: `${RUST}0D`, border: `1px solid ${RUST}33`, color: RUST, borderRadius: 6, fontSize: 11, fontFamily: 'Roboto, sans-serif', lineHeight: 1.5 }}>
      <strong>Note:</strong> This policy does not apply to day-to-day clinical or operational staff except to the extent that Governing Body decisions establish requirements, standards, or directives that govern their work.
    </div>
  </div>
);

const Sec4Statements = () => (
  <div>
    <H1>4. Policy Statement</H1>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {STATEMENTS.map((stmt, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ minWidth: 28, height: 28, borderRadius: '50%', backgroundColor: TEAL, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>
            4.{i + 1}
          </div>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, lineHeight: 1.6, color: DARK, margin: 0, whiteSpace: 'pre-line' }}>{stmt.substring(4)}</p>
        </div>
      ))}
    </div>
  </div>
);

const Sec5Definitions = () => (
  <div>
    <H1>5. Definitions</H1>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
      {DEFINITIONS.map((def, i) => (
        <div key={i} style={{ backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 11, color: TEAL, marginBottom: 4 }}>{def.term}</div>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, lineHeight: 1.5, color: MID, margin: 0 }}>{def.definition}</p>
        </div>
      ))}
    </div>
  </div>
);

const Sec6Procedures = () => (
  <div>
    <H1>6. Procedures</H1>
    <H2>6.1 Establishment and Composition</H2>
    <PT headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={PROC_61} />

    <H2>6.2 Core Governing Body Responsibilities</H2>
    <div style={{ marginBottom: 12, padding: '10px 14px', backgroundColor: `${RUST}0D`, border: `1px solid ${RUST}33`, color: RUST, borderRadius: 6, fontSize: 11, fontFamily: 'Roboto, sans-serif' }}>
      The Governing Body of Care Indeed Home Health Care, Inc. shall fulfill the following responsibilities directly and shall <strong>not delegate ultimate accountability</strong> for any of these functions.
    </div>
    {PROC_62.map((section, idx) => (
      <div key={idx} style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, color: DARK, borderBottom: `1px solid ${BORDER}`, paddingBottom: 4, marginBottom: 8 }}>{section.title}</div>
        <PT headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={section.rows} />
      </div>
    ))}

    <H2>6.3 Governing Body Meetings</H2>
    <PT headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={PROC_63} />

    <H2>6.4 Conflict of Interest Management</H2>
    <PT headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={PROC_64} />

    <H2>6.5 Escalation and Exception Handling</H2>
    <PT headers={['Condition', 'Escalation Path', 'Corrective Action', 'Timeframe']} rows={PROC_65} />
  </div>
);

const Sec7Documentation = () => (
  <div>
    <H1>7. Documentation Requirements</H1>
    <PT headers={['Requirement', 'Document / Record', 'Responsible Party', 'Location', 'Timeframe']} rows={DOCS_REQ} />
  </div>
);

const Sec8Compliance = () => (
  <div>
    <H1>8. Compliance &amp; Audit</H1>
    <H2>8.1 How Compliance Is Measured</H2>
    <PT headers={['Compliance Indicator', 'Measurement Method', 'Acceptable Standard']} rows={COMPLIANCE_81} />

    <H2>8.2 Surveyor Expectations</H2>
    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: MID, marginBottom: 8 }}>CMS surveyors conducting a standard survey under SOM Appendix B will specifically verify:</p>
    <ol style={{ paddingLeft: 20, margin: 0 }}>
      {SURVEYOR_ITEMS.map((item, i) => (
        <li key={i} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, lineHeight: 1.6, color: DARK, marginBottom: 6 }}>{item}</li>
      ))}
    </ol>

    <H2>8.3 Common Failure Points</H2>
    {COMPLIANCE_83.map((item, i) => (
      <div key={i} style={{ backgroundColor: '#FFF5F5', border: '1px solid #FDD', borderRadius: 6, padding: '8px 12px', marginBottom: 8 }}>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 700, color: '#D70101', marginBottom: 3 }}>{item[0]}</div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#B00', marginBottom: 3 }}><strong>Risk:</strong> {item[1]}</div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: DARK }}><strong>Mitigation:</strong> {item[2]}</div>
      </div>
    ))}
  </div>
);

const Sec9References = () => (
  <div>
    <H1>9. References</H1>
    <H2>9.1 Federal Regulations (42 CFR Part 484)</H2>
    <PT headers={['Citation', 'Title', 'Relevance']} rows={REF_FEDERAL} />

    <H2>9.2 CMS Guidance</H2>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      {[
        ['CMS State Operations Manual, Appx B — Guidance to Surveyors', 'Provides interpretive guidelines for survey of 42 CFR § 484.105 compliance; defines surveyor expectations for governing body evidence.'],
        ['CMS OASIS-E2 Guidance Manual', "While not directly governing the Governing Body, the Governing Body is accountable for ensuring the agency's OASIS program meets CMS requirements."],
      ].map(([title, body], i) => (
        <div key={i} style={{ backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, color: TEAL, marginBottom: 4 }}>{title}</div>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: MID, margin: 0 }}>{body}</p>
        </div>
      ))}
    </div>

    <H2>9.3 OIG Guidance</H2>
    <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
      <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, color: '#1E40AF', marginBottom: 4 }}>OIG Compliance Program Guidance for Home Health Agencies</div>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#1E3A8A', margin: 0 }}>Establishes expectation that the governing body actively oversees the compliance program and receives regular compliance reports.</p>
    </div>

    <H2>9.4 Cross-Referenced Agency Policies (Enterprise Framework)</H2>
    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: MID, fontStyle: 'italic', marginBottom: 6 }}>Note: All policy IDs below reflect the updated v6.0 framework codes.</p>
    <PT headers={['Policy ID', 'Policy Title', 'Relationship']} rows={REF_CROSS} />
  </div>
);

const Sec10Training = () => (
  <div>
    <H1>10. Training Requirements</H1>
    <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {TRAINING_ITEMS.map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 12px' }}>
          <div style={{ minWidth: 22, height: 22, borderRadius: '50%', backgroundColor: TEAL, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>{i + 1}</div>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, lineHeight: 1.6, color: DARK, margin: 0 }}>{item}</p>
        </li>
      ))}
    </ul>
  </div>
);

const Sec11Version = () => (
  <div>
    <H1>11. Version Control</H1>
    <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {VERSION_ITEMS.map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 12px' }}>
          <div style={{ minWidth: 22, height: 22, borderRadius: '50%', backgroundColor: DARK, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>{i + 1}</div>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, lineHeight: 1.6, color: DARK, margin: 0 }}>{item}</p>
        </li>
      ))}
    </ul>
  </div>
);

// ─── APPENDICES ───────────────────────────────────────────────────────────────

const AppA = () => (
  <div>
    <AppPrintHeader id="A" title="Governing Body Membership Roster" />
    <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 6, padding: '10px 14px', marginBottom: 14, fontSize: 11, fontFamily: 'Roboto, sans-serif', lineHeight: 1.5 }}>
      <strong>Instructions:</strong> The Governing Body Chair (or designee) shall update this roster within 7 calendar days of any membership change. A copy shall be maintained in the agency governance file and provided to the Administrator. This roster must be readily accessible for CMS survey review.
    </div>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, whiteSpace: 'nowrap' }}>
        <thead>
          <tr style={{ backgroundColor: '#F8F9FA', borderBottom: `2px solid ${BORDER}` }}>
            {['#', 'Full Legal Name', 'Title/Role', 'Voting Status', 'Appt Date', 'Term Exp', 'Competency Area', 'Email Address', 'OIG/SAM\nCurrent?'].map((h, i) => (
              <th key={i} style={{ padding: '8px 6px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textAlign: 'left', border: `1px solid ${BORDER}`, whiteSpace: 'pre-line' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6, 7].map(n => (
            <tr key={n} style={{ borderBottom: `1px solid ${BORDER}` }}>
              <td style={{ padding: '6px', border: `1px solid ${BORDER}`, textAlign: 'center', color: MID, fontFamily: 'Roboto, sans-serif', fontSize: 10 }}>{n}</td>
              {[100, 90, 80, 80, 80, 80, 80, 100].map((w, j) => (
                <td key={j} style={{ padding: '4px 6px', border: `1px solid ${BORDER}` }}>
                  <input type="text" style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: w, fontSize: 10, fontFamily: 'Roboto, sans-serif' }} />
                </td>
              ))}
              <td style={{ padding: '6px', border: `1px solid ${BORDER}`, textAlign: 'center' }}>
                <input type="checkbox" style={{ width: 14, height: 14 }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 11, fontFamily: 'Roboto, sans-serif', fontWeight: 700, color: MID }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
        Roster Maintained By: <LineField w={140} label="Roster Maintained By" /> Title: <LineField w={100} label="Title" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        Date Last Updated: <LineField w={120} label="Date Last Updated" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
        Quorum Requirement: <LineField w={36} label="Quorum number" /> of <LineField w={36} label="Total members" /> voting members
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
        Total Voting Members: <LineField w={36} label="Voting members" /> | Total Non-Voting / Advisory Members: <LineField w={36} label="Non-voting members" />
      </div>
    </div>
  </div>
);

const AppB = () => (
  <div>
    <AppPrintHeader id="B" title="Conflict of Interest Disclosure Form" />
    <div style={{ backgroundColor: '#FFF7ED', border: `1px solid ${RUST}33`, borderRadius: 6, padding: '10px 14px', marginBottom: 20, fontSize: 11, fontFamily: 'Roboto, sans-serif', lineHeight: 1.5 }}>
      <strong>Instructions:</strong> Each Governing Body member shall complete this form: (1) at the time of initial appointment; (2) annually, at the first quarterly meeting of each calendar year; and (3) within 7 calendar days of any change in circumstances that could create a new actual or potential conflict. Submit to Compliance Officer.
    </div>

    {/* Section 1 */}
    <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, backgroundColor: '#F3F4F6', padding: '6px 10px', borderRadius: 4, marginBottom: 12 }}>SECTION 1 — MEMBER INFORMATION</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 16, marginBottom: 20 }}>
      {['Full Legal Name', 'Title / Role on Governing Body', 'Date of Appointment'].map((label, i) => (
        <div key={i}>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: MID, marginBottom: 4 }}>{label}</div>
          <input type={label.includes('Date') ? 'text' : 'text'} placeholder={label.includes('Date') ? 'mm/dd/yyyy' : ''} style={{ border: 'none', borderBottom: `1px solid ${DARK}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 11, fontFamily: 'Roboto, sans-serif', padding: '2px 0' }} />
        </div>
      ))}
      <div style={{ gridColumn: '1 / -1', borderTop: `1px solid ${BORDER}`, paddingTop: 12, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' as const }}>
        <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 700, color: DARK }}>Type of Disclosure:</span>
        {['Initial', 'Annual Renewal', 'Change in Circumstances'].map(opt => (
          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 400, color: DARK }}>
            <input type="radio" name="disclosureType" style={{ width: 14, height: 14 }} /> {opt}
          </label>
        ))}
      </div>
    </div>

    {/* Section 2 */}
    <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, backgroundColor: '#F3F4F6', padding: '6px 10px', borderRadius: 4, marginBottom: 8 }}>SECTION 2 — FINANCIAL INTERESTS</div>
    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, fontStyle: 'italic', color: MID, marginBottom: 8 }}>Do you, or any member of your immediate family (spouse, domestic partner, parent, child, sibling), hold any of the following interests?</p>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, marginBottom: 20 }}>
      <thead>
        <tr style={{ backgroundColor: PALE, borderBottom: `1px solid ${BORDER}` }}>
          <th style={{ padding: '6px 8px', textAlign: 'left', border: `1px solid ${BORDER}`, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9 }}>Question</th>
          {['Yes', 'No', 'If Yes, Describe'].map(h => <th key={h} style={{ padding: '6px 8px', textAlign: 'center', border: `1px solid ${BORDER}`, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9 }}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {[
          '2.1 Ownership interest (equity, stock, partnership) in any entity that does business with, competes with, or provides referrals to Care Indeed Home Health Care, Inc.?',
          '2.2 Employment, consulting, or advisory relationship with any entity that does business with, competes with, or provides referrals to this agency?',
          '2.3 Financial interest in any vendor, supplier, or contractor used by the agency?',
          '2.4 Receipt of compensation, gifts, gratuities, or other benefits (exceeding $50 in aggregate annually) from any entity that does business with or seeks to do business with the agency?',
        ].map((q, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
            <td style={{ padding: '6px 8px', border: `1px solid ${BORDER}`, fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 500 }}>{q}</td>
            <td style={{ padding: 6, border: `1px solid ${BORDER}`, textAlign: 'center' }}><input type="radio" name={`q2${i}`} style={{ width: 14, height: 14 }} /></td>
            <td style={{ padding: 6, border: `1px solid ${BORDER}`, textAlign: 'center' }}><input type="radio" name={`q2${i}`} style={{ width: 14, height: 14 }} /></td>
            <td style={{ padding: 4, border: `1px solid ${BORDER}` }}><input type="text" style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 10 }} /></td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Section 3 */}
    <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, backgroundColor: '#F3F4F6', padding: '6px 10px', borderRadius: 4, marginBottom: 8 }}>SECTION 3 — PROFESSIONAL &amp; ORGANIZATIONAL RELATIONSHIPS</div>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, marginBottom: 20 }}>
      <thead>
        <tr style={{ backgroundColor: PALE, borderBottom: `1px solid ${BORDER}` }}>
          <th style={{ padding: '6px 8px', textAlign: 'left', border: `1px solid ${BORDER}`, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9 }}>Question</th>
          {['Yes', 'No', 'If Yes, Describe'].map(h => <th key={h} style={{ padding: '6px 8px', textAlign: 'center', border: `1px solid ${BORDER}`, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9 }}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {[
          '3.1 Do you serve on the board of directors, governing body, or advisory board of any other healthcare entity, referral source, or competitor?',
          '3.2 Do you have any professional relationship with any physician, physician group, hospital, skilled nursing facility, or other provider that refers patients to or receives referrals from Care Indeed Home Health Care, Inc.?',
          '3.3 Do you have any other relationship or interest that could reasonably be perceived as creating a conflict of interest with your duties as a Governing Body member?',
        ].map((q, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
            <td style={{ padding: '6px 8px', border: `1px solid ${BORDER}`, fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 500 }}>{q}</td>
            <td style={{ padding: 6, border: `1px solid ${BORDER}`, textAlign: 'center' }}><input type="radio" name={`q3${i}`} style={{ width: 14, height: 14 }} /></td>
            <td style={{ padding: 6, border: `1px solid ${BORDER}`, textAlign: 'center' }}><input type="radio" name={`q3${i}`} style={{ width: 14, height: 14 }} /></td>
            <td style={{ padding: 4, border: `1px solid ${BORDER}` }}><input type="text" style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 10 }} /></td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Section 4 */}
    <div style={{ backgroundColor: `${TEAL}0D`, border: `1px solid ${TEAL}33`, borderRadius: 8, padding: 16 }}>
      <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 12, color: TEAL, marginBottom: 10 }}>SECTION 4 — ATTESTATION</div>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, lineHeight: 1.6, color: DARK, marginBottom: 16 }}>
        I hereby certify that the information provided above is true, complete, and accurate to the best of my knowledge. I understand that I have an ongoing obligation to disclose any new conflict within 7 calendar days, I must recuse myself from voting on conflicted matters, and failure to disclose a known conflict may result in removal from the Governing Body of Care Indeed Home Health Care, Inc.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: MID, marginBottom: 6 }}>Signature</div>
          <div style={{ borderBottom: `2px dashed #999`, height: 36 }} />
        </div>
        <div>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: MID, marginBottom: 6 }}>Date Signed</div>
          <input type="text" placeholder="mm/dd/yyyy" style={{ border: 'none', borderBottom: `2px solid #999`, background: 'transparent', outline: 'none', width: '100%', fontSize: 11, fontFamily: 'Roboto, sans-serif', paddingBottom: 4 }} />
        </div>
      </div>
    </div>
  </div>
);

const AppC = () => (
  <div>
    <AppPrintHeader id="C" title="Policy Acknowledgment Form" />
    <div style={{ backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 12, color: DARK, marginBottom: 12 }}>I, the undersigned, acknowledge that:</p>
      <ol style={{ paddingLeft: 20, margin: 0 }}>
        {[
          'I have received and read Policy GV-GB-001 — Governing Body Authority & Responsibilities, Version 6.0, effective 2025-07-10.',
          'I understand the responsibilities, requirements, and expectations described in this policy as they apply to my role at Care Indeed Home Health Care, Inc.',
          'I understand that I am accountable for complying with this policy and that non-compliance may result in corrective action.',
          'I have had the opportunity to ask questions and receive clarification regarding any aspect of this policy.',
        ].map((item, i) => (
          <li key={i} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, lineHeight: 1.6, color: DARK, marginBottom: 6 }}>{item}</li>
        ))}
      </ol>
    </div>
    <div style={{ backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {['Full Name (Printed)', 'Title / Role'].map((label, i) => (
        <div key={i}>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: MID, marginBottom: 6 }}>{label}</div>
          <input type="text" style={{ border: 'none', borderBottom: `2px solid #999`, background: 'transparent', outline: 'none', width: '100%', fontSize: 12, fontFamily: 'Roboto, sans-serif', paddingBottom: 4 }} />
        </div>
      ))}
      <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: MID, marginBottom: 6 }}>Signature</div>
        <div style={{ borderBottom: '2px dashed #999', height: 48 }} />
      </div>
      <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: MID, marginBottom: 6 }}>Date Signed</div>
        <input type="text" placeholder="mm/dd/yyyy" style={{ border: 'none', borderBottom: `2px solid #999`, background: 'transparent', outline: 'none', width: 240, fontSize: 12, fontFamily: 'Roboto, sans-serif', paddingBottom: 4 }} />
      </div>
    </div>
  </div>
);

const AppD = () => (
  <div>
    <AppPrintHeader id="D" title="Governing Body Meeting Minutes Template" />
    <div style={{ backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 11, fontFamily: 'Roboto, sans-serif' }}>
      <strong>Instructions:</strong> Use this template for all regular and special Governing Body meetings to satisfy CMS surveyor expectations. Draft minutes shall be completed within 14 calendar days of the meeting and retained for a minimum of 7 years.
    </div>

    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24, backgroundColor: PALE }}>
      {/* Meeting header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, padding: 16, marginBottom: 20 }}>
        {[
          { label: 'Meeting Type', hint: 'Regular Quarterly / Special / Annual' },
          { label: 'Date', hint: 'mm/dd/yyyy' },
          { label: 'Time (Start/End)', hint: '00:00 – 00:00' },
          { label: 'Location', hint: 'In-Person / Remote' },
        ].map(({ label, hint }, i) => (
          <div key={i}>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: MID }}>{label}:</div>
            <input type="text" placeholder={hint} style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 11, fontFamily: 'Roboto, sans-serif', marginTop: 4, paddingBottom: 2 }} />
          </div>
        ))}
      </div>

      {/* Attendance */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ backgroundColor: TEAL, color: '#fff', padding: '8px 12px', borderRadius: '8px 8px 0 0', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ATTENDANCE &amp; QUORUM</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderTop: 'none' }}>
          <thead>
            <tr style={{ backgroundColor: PALE, borderBottom: `1px solid ${BORDER}` }}>
              <th style={{ padding: '6px 8px', textAlign: 'left', border: `1px solid ${BORDER}`, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9 }}>Member Name</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', border: `1px solid ${BORDER}`, width: 70, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9 }}>Present?</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', border: `1px solid ${BORDER}`, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9 }}>Attendance Method</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map(n => (
              <tr key={n} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: '6px 8px', border: `1px solid ${BORDER}` }}><input type="text" style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 10 }} /></td>
                <td style={{ padding: 6, border: `1px solid ${BORDER}`, textAlign: 'center' }}><input type="checkbox" style={{ width: 14, height: 14 }} /></td>
                <td style={{ padding: '6px 8px', border: `1px solid ${BORDER}` }}><input type="text" placeholder="In-person / Video" style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 10 }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 20, fontSize: 11, fontFamily: 'Roboto, sans-serif', fontWeight: 700, color: DARK }}>
          <span>Quorum Required: <LineField w={40} /></span>
          <span>Members Present: <LineField w={40} /></span>
          <span>Quorum Achieved? <label style={{ fontWeight: 400, marginLeft: 8 }}><input type="radio" name="quorumD" style={{ marginRight: 4 }} />Yes</label> <label style={{ fontWeight: 400, marginLeft: 8 }}><input type="radio" name="quorumD" style={{ marginRight: 4 }} />No</label></span>
        </div>
      </div>

      {/* Standing items */}
      <div>
        <div style={{ backgroundColor: TEAL, color: '#fff', padding: '8px 12px', borderRadius: '8px 8px 0 0', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>STANDING AGENDA ITEMS (Summary)</div>
        <div style={{ border: `1px solid ${BORDER}`, borderTop: 'none', borderRadius: '0 0 8px 8px', backgroundColor: '#fff', padding: 16 }}>
          {['3. Administrator Report', '4. Compliance Report', '5. QAPI Report', '6. Financial Report'].map((item, i) => (
            <div key={i} style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '10px 12px', backgroundColor: PALE, marginBottom: 10 }}>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 700, color: DARK, marginBottom: 6 }}>{item}:</div>
              <textarea style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 4, padding: 8, minHeight: 60, fontSize: 10, fontFamily: 'Roboto, sans-serif', resize: 'vertical', backgroundColor: '#fff' }} placeholder="Document Summary of Report, Discussion/Questions, Action Required, Responsible Party, and Deadline..." />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AppE = () => (
  <div>
    <AppPrintHeader id="E" title="Quarterly Governance Oversight Checklist" />
    <div style={{ backgroundColor: `${TEAL}0D`, border: `1px solid ${TEAL}33`, borderRadius: 6, padding: '10px 14px', marginBottom: 14, fontSize: 11, fontFamily: 'Roboto, sans-serif', lineHeight: 1.5 }}>
      <strong>Purpose:</strong> To provide the Governing Body Chair and Administrator with a structured checklist to verify that all required oversight activities are completed each quarter, supporting continuous survey readiness and compliance with 42 CFR § 484.105. Administrator must complete prior to each quarterly meeting.
    </div>
    <div style={{ backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' as const, fontSize: 11, fontFamily: 'Roboto, sans-serif', fontWeight: 700, color: DARK }}>
      <span>Quarter: {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <label key={q} style={{ fontWeight: 400, marginLeft: 10 }}><input type="radio" name="quarter" style={{ marginRight: 4 }} />{q}</label>)}</span>
      <span style={{ marginLeft: 20 }}>Calendar Year: <LineField w={80} /></span>
    </div>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
      <thead>
        <tr>
          <th style={{ backgroundColor: TEAL, color: '#fff', padding: '6px 8px', border: `1px solid #004d47`, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, width: 28, textAlign: 'center' }}>#</th>
          <th style={{ backgroundColor: TEAL, color: '#fff', padding: '6px 8px', border: `1px solid #004d47`, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9 }}>Oversight Item</th>
          <th style={{ backgroundColor: TEAL, color: '#fff', padding: '6px 8px', border: `1px solid #004d47`, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, width: 80, textAlign: 'center' }}>Y / N / N-A</th>
          <th style={{ backgroundColor: TEAL, color: '#fff', padding: '6px 8px', border: `1px solid #004d47`, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, width: 180 }}>Notes / Corrective Action if "No"</th>
        </tr>
      </thead>
      <tbody>
        {CHECKLIST_ITEMS.map((item, i) => (
          <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : PALE }}>
            <td style={{ padding: '5px 6px', border: `1px solid ${BORDER}`, textAlign: 'center', fontFamily: 'Roboto, sans-serif', fontSize: 9, color: MID, fontWeight: 700 }}>{i + 1}</td>
            <td style={{ padding: '5px 8px', border: `1px solid ${BORDER}`, fontFamily: 'Roboto, sans-serif', fontSize: 10, fontWeight: 500, color: DARK }}>{item}</td>
            <td style={{ padding: 4, border: `1px solid ${BORDER}`, textAlign: 'center' }}>
              <select style={{ border: `1px solid ${BORDER}`, borderRadius: 4, padding: '2px 4px', width: '100%', fontSize: 10, backgroundColor: '#fff' }}>
                <option value="" />
                <option value="Y">Y</option>
                <option value="N">N</option>
                <option value="NA">N/A</option>
              </select>
            </td>
            <td style={{ padding: 4, border: `1px solid ${BORDER}` }}><input type="text" style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 9 }} /></td>
          </tr>
        ))}
      </tbody>
    </table>
    <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 11, fontFamily: 'Roboto, sans-serif', fontWeight: 700, color: MID, backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Completed By: <LineField w={160} /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Title: <LineField w={160} /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Date: <LineField w={120} /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Presented to Chair? <label style={{ fontWeight: 400, marginLeft: 8 }}><input type="checkbox" style={{ marginRight: 4 }} />Yes</label> — Date: <LineField w={80} /></div>
    </div>
  </div>
);

const AppF = () => (
  <div>
    <AppPrintHeader id="F" title="Annual Governance Calendar" />
    <div style={{ backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '10px 14px', marginBottom: 14, fontSize: 11, fontFamily: 'Roboto, sans-serif', lineHeight: 1.5 }}>
      <strong>Purpose:</strong> To provide a consolidated annual calendar of all Governing Body actions required by this policy and cross-referenced policies, ensuring no required action is missed.
    </div>
    <PT
      headers={['Quarter', 'Required Actions', 'Policy Reference', 'Responsible Party']}
      rows={[
        ['Q1', '• Convene regular quarterly meeting.\n• Review and approve the annual QAPI plan.\n• Conduct annual Governing Body composition review (competency coverage).\n• Collect annual Conflict of Interest disclosures from all members.\n• Conduct annual refresher training on governance responsibilities.\n• Conduct annual Governance Self-Assessment (if adopted).', 'GV-GB-001 §6.3\nGV-GB-001 §6.2.4.1; QA-PG-002\nGV-GB-001 §6.1.3\nGV-GB-001 §6.4.1; GV-GB-003\nGV-GB-001 §10.4\nGV-GB-005', 'Governing Body Chair\nGoverning Body\nGoverning Body Chair\nCompliance Officer\nAdministrator\nGoverning Body Chair'],
        ['Q2', '• Convene regular quarterly meeting.\n• Review and approve succession plan for key leadership.\n• Review scope of services (if fiscal year begins Q3).', 'GV-GB-001 §6.3\nGV-GB-001 §6.2.2.5; GV-GB-004\nGV-GB-001 §6.2.1.3; GV-OG-003', 'Governing Body Chair\nGoverning Body\nGoverning Body'],
        ['Q3', '• Convene regular quarterly meeting.\n• Review and approve Emergency Preparedness Plan.\n• Review emergency drill results.', 'GV-GB-001 §6.3\nGV-GB-001 §6.2.6.1; OP-FM-005\nGV-GB-001 §6.2.6.2', 'Governing Body Chair\nGoverning Body\nAdministrator'],
        ['Q4', "• Convene regular quarterly meeting.\n• Review and approve annual operating budget for upcoming fiscal year.\n• Complete annual Administrator performance evaluation.\n• Establish and distribute next year's meeting schedule by December 15.\n• Review and approve scope of services for upcoming year.", 'GV-GB-001 §6.3\nGV-GB-001 §6.2.5.1; FN-FP-005\nGV-GB-001 §6.2.2.4\nGV-GB-001 §6.3.1\nGV-GB-001 §6.2.1.3', 'Governing Body Chair\nGoverning Body\nGoverning Body\nGoverning Body Chair\nGoverning Body'],
        ['Ongoing\n(Every Meeting)', '• Review Administrator report.\n• Review Compliance Officer report.\n• Review QAPI report.\n• Review financial report.\n• Review status of prior meeting directives.\n• Verify OIG/SAM screening currency for all members.', 'GV-GB-001 §6.2.5.2\nGV-GB-001 §6.2.3.2\nGV-GB-001 §6.2.4.2\nGV-GB-001 §6.2.5.2\nGV-GB-001 §6.3.4\nGV-GB-001 §6.1.4; HR-TA-003', 'Administrator\nCompliance Officer\nClinical Manager\nAdministrator\nDesignated Secretary\nCompliance Officer'],
        ['Ongoing\n(Monthly)', '• OIG/SAM exclusion screening of all Governing Body members.', 'GV-GB-001 §6.1.4; HR-TA-003', 'Compliance Officer'],
      ]}
    />
  </div>
);

const AppG = () => {
  const box = (label: string, bg: string, borderColor: string, textColor: string, w = 220) => (
    <div style={{ backgroundColor: bg, border: `2px solid ${borderColor}`, borderRadius: 12, padding: '14px 16px', width: w, textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
      <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: textColor, marginBottom: 8 }}>{label}</div>
      <div style={{ borderBottom: `1px solid ${borderColor}`, marginBottom: 4, paddingBottom: 2, fontSize: 10, fontFamily: 'Roboto, sans-serif', color: textColor === '#fff' ? 'rgba(255,255,255,0.7)' : '#888' }}>Enter Name…</div>
    </div>
  );

  return (
    <div>
      <AppPrintHeader id="G" title="Agency Organizational Chart" />
      <div style={{ backgroundColor: `${TEAL}0A`, border: `1px solid ${TEAL}20`, borderRadius: 8, padding: '10px 16px', marginBottom: 24, textAlign: 'center', fontSize: 11, fontFamily: 'Roboto, sans-serif', lineHeight: 1.5 }}>
        <strong>Agency Organizational Structure:</strong> This chart illustrates the reporting relationships and accountability framework from the Governing Body through the senior administrative and clinical leadership, as required by 42 CFR § 484.105.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 860 }}>
        {/* Level 1 — Governing Body */}
        <div style={{ backgroundColor: TEAL, border: `2px solid #004d47`, borderRadius: 14, padding: '16px 24px', width: 260, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,119,112,0.3)', zIndex: 1 }}>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#fff', marginBottom: 8 }}>Governing Body</div>
          <span style={{ backgroundColor: '#fff', color: TEAL, padding: '3px 12px', borderRadius: 999, fontSize: 10, fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>Ultimate Legal Authority</span>
        </div>

        {/* Connector down */}
        <div style={{ width: 2, height: 32, backgroundColor: '#CCC' }} />
        {/* Horizontal line spanning to L2 positions */}
        <div style={{ width: 460, height: 2, backgroundColor: '#CCC', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: -1, width: 2, height: 32, backgroundColor: '#CCC', transform: 'translateY(-100%)' }} />
          <div style={{ position: 'absolute', right: 0, top: -1, width: 2, height: 32, backgroundColor: '#CCC', transform: 'translateY(-100%)' }} />
        </div>
        <div style={{ display: 'flex', gap: 0, width: 460, justifyContent: 'space-between', marginBottom: 0 }}>
          <div style={{ width: 2, height: 32, backgroundColor: '#CCC', marginLeft: 0 }} />
          <div style={{ width: 2, height: 32, backgroundColor: '#CCC', marginRight: 0 }} />
        </div>

        {/* Level 2 — Compliance Officer & Administrator */}
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', width: '100%', marginBottom: 0 }}>
          {box('Compliance Officer', '#1F1C1B', '#333', '#fff', 200)}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {box('Administrator', RUST, '#943400', '#fff', 220)}
            {/* Connector down from Administrator */}
            <div style={{ width: 2, height: 28, backgroundColor: '#CCC' }} />
            {/* Horizontal line for L3 */}
            <div style={{ width: 440, height: 2, backgroundColor: '#CCC' }} />
            <div style={{ display: 'flex', gap: 0, width: 440, justifyContent: 'space-between' }}>
              <div style={{ width: 2, height: 28, backgroundColor: '#CCC' }} />
              <div style={{ width: 2, height: 28, backgroundColor: '#CCC' }} />
              <div style={{ width: 2, height: 28, backgroundColor: '#CCC' }} />
            </div>
          </div>
        </div>

        {/* Level 3 */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 0 }}>
          {/* Clinical Manager */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#fff', border: `2px solid ${TEAL}`, borderRadius: 12, padding: '12px 14px', width: 180, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', color: TEAL, marginBottom: 6 }}>Clinical Manager</div>
              <div style={{ borderBottom: `1px solid ${TEAL}44`, paddingBottom: 2, fontSize: 10, fontFamily: 'Roboto, sans-serif', color: '#888', marginBottom: 4 }}>Enter Name (DON)…</div>
            </div>
            <div style={{ width: 2, height: 20, backgroundColor: '#CCC' }} />
            <div style={{ backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px', width: 160, textAlign: 'center', fontSize: 10, fontFamily: 'Roboto, sans-serif', color: MID }}>
              Clinical Staff<br />(RN, PT, OT, ST, MSW, CHHA)
            </div>
          </div>

          {/* Medical Director */}
          <div style={{ backgroundColor: '#fff', border: `2px solid #CCC`, borderRadius: 12, padding: '12px 14px', width: 180, textAlign: 'center', alignSelf: 'flex-start' }}>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>Medical Director</div>
            <div style={{ borderBottom: `1px solid #DDD`, paddingBottom: 2, fontSize: 10, fontFamily: 'Roboto, sans-serif', color: '#888' }}>Enter Name…</div>
          </div>

          {/* Business Operations */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#fff', border: `2px solid #CCC`, borderRadius: 12, padding: '12px 14px', width: 180, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>Business Operations</div>
              <div style={{ borderBottom: `1px solid #DDD`, paddingBottom: 2, fontSize: 10, fontFamily: 'Roboto, sans-serif', color: '#888', marginBottom: 4 }}>Enter Lead Name…</div>
            </div>
            <div style={{ width: 2, height: 20, backgroundColor: '#CCC' }} />
            <div style={{ backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px', width: 160, textAlign: 'center', fontSize: 10, fontFamily: 'Roboto, sans-serif', color: MID }}>
              HR, Finance, Intake,<br />&amp; Scheduling
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function GVGBPrintDocument() {
  useEffect(() => {
    const prev = document.title;
    document.title = `${META.id} — ${META.title}`;
    const timer = setTimeout(() => window.print(), 1200);
    return () => {
      clearTimeout(timer);
      document.title = prev;
    };
  }, []);

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: DARK, background: '#fff', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Roboto:wght@300;400;500;700&display=swap');
        @page { size: letter; margin: 0.5in; }
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          input, select, textarea { border-color: #999 !important; }
          table {
            table-layout: fixed !important;
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
          }
          table th, table td {
            word-break: break-word !important;
            overflow-wrap: anywhere !important;
            white-space: normal !important;
          }
          thead { display: table-header-group !important; }
          tr { page-break-inside: avoid !important; break-inside: avoid !important; }
        }
        body { margin: 0; padding: 0; }
      `}</style>

      {/* No-print header for screen view */}
      <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: TEAL, color: '#fff', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '8px solid #ffffff' }}>
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 13 }}>GV-GB-001 — Print Preview</span>
        <button
          onClick={() => window.print()}
          style={{ backgroundColor: '#fff', color: TEAL, border: 'none', borderRadius: 6, padding: '6px 16px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
        >
          🖨 Print / Save PDF
        </button>
      </div>

      {/* Document content */}
      <div style={{ maxWidth: 850, margin: '0 auto', padding: '0' }}>
        <Cover />

        {/* Main policy body */}
        <div style={{ padding: '32px 48px' }}>
          <Sec2Purpose />
          <Sec3Scope />
          <Sec4Statements />
          <Sec5Definitions />
          <Sec6Procedures />
          <Sec7Documentation />
          <Sec8Compliance />
          <Sec9References />
          <Sec10Training />
          <Sec11Version />
        </div>

        {/* Appendices */}
        <PageBreak />
        <div style={{ padding: '32px 48px' }}><AppA /></div>

        <PageBreak />
        <div style={{ padding: '32px 48px' }}><AppB /></div>

        <PageBreak />
        <div style={{ padding: '32px 48px' }}><AppC /></div>

        <PageBreak />
        <div style={{ padding: '32px 48px' }}><AppD /></div>

        <PageBreak />
        <div style={{ padding: '32px 48px' }}><AppE /></div>

        <PageBreak />
        <div style={{ padding: '32px 48px' }}><AppF /></div>

        <PageBreak />
        <div style={{ padding: '32px 48px' }}><AppG /></div>
      </div>
    </div>
  );
}
