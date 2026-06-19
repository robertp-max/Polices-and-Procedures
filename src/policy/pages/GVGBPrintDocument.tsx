/**
 * GVGBPrintDocument.tsx
 * Standalone full-document print layout for GV-GB-001.
 * Opens in a new tab and auto-triggers the device print dialog.
 * No sidebar / CommandCenterLayout.
 */
import React, { useEffect, useMemo } from 'react';
import ciLogoGray from '@/assets/ci-logo-gray.png';
import { buildFormContent } from '@/policy/data/formsLibraryContent';
import { FormBody } from '@/policy/components/FormViewer';
import { getFormsForPolicy } from '@/policy/utils/policyFormLinks';

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
  /** Cover metadata — aligned to approved print PDF (GV-GB-001). */
  policyOwner: 'Administrator',
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

// ─── PRIMITIVE HELPERS ───────────────────────────────────────────────────────

/** Care Indeed document accent (approved light print kit — not legacy gold). */
const PRINT_ACCENT = '#007970';
const RUST = '#C74600';
const DARK = '#1F1C1B';
const MID  = '#524048';
const PALE = '#FAFBF8';
const BORDER = '#E5E4E3';
/** Publication-style tables (approved PDF procedures ~pp.20–28): neutral header, teal accent on body first column only. */
const TABLE_HEAD_BG = '#eceef0';
const TABLE_HEAD_BORDER = '#b8bdc4';
const TABLE_CELL_BORDER = '#d8dce1';

/** Standard print table — neutral header band; first column accent (approved PDF). */
const PT = ({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14, fontSize: 10.5 }}>
    <thead>
      <tr>
        {headers.map((h, i) => (
          <th
            key={i}
            style={{
              backgroundColor: TABLE_HEAD_BG,
              color: DARK,
              padding: '5px 7px',
              textAlign: 'left',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: 8,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.07em',
              border: `1px solid ${TABLE_HEAD_BORDER}`,
              borderBottom: `2px solid ${TABLE_HEAD_BORDER}`,
            }}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
          {row.map((cell, j) => (
            <td
              key={j}
              style={{
                border: `1px solid ${TABLE_CELL_BORDER}`,
                padding: '5px 7px',
                verticalAlign: 'top',
                fontSize: 10.5,
                lineHeight: 1.42,
                whiteSpace: 'pre-line',
                color: j === 0 ? PRINT_ACCENT : DARK,
                fontFamily: 'Roboto, sans-serif',
                fontWeight: j === 0 ? 700 : 400,
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
  <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 13, color: DARK, borderBottom: `1px solid ${PRINT_ACCENT}`, paddingBottom: 5, marginTop: 22, marginBottom: 10, letterSpacing: '0.04em' }}>
    {children}
  </h2>
);

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, color: DARK, marginTop: 14, marginBottom: 6 }}>
    {children}
  </h3>
);

const PageBreak = () => <div style={{ pageBreakBefore: 'always' }} />;

const AppPrintHeader = ({ id, title }: { id: string; title: string }) => (
  <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${BORDER}` }}>
    <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: MID, margin: '0 0 4px' }}>
      Appendix {id}
    </p>
    <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 16, color: DARK, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{title}</h2>
    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: MID, margin: 0 }}>
      Care Indeed Home Health Care, Inc. · Policy GV-GB-001 · Version 6.0 · Effective {META.effective}
    </p>
  </div>
);

// ─── PRINT SECTIONS ──────────────────────────────────────────────────────────

const Cover = () => (
  <div
    style={{
      backgroundColor: '#fff',
      color: DARK,
      padding: '32px 48px 28px',
      pageBreakAfter: 'always',
      borderBottom: `3px solid ${PRINT_ACCENT}`,
    }}
  >
    <img
      src={ciLogoGray}
      alt="Care Indeed"
      style={{ height: 40, width: 'auto', display: 'block' }}
    />
    <p
      style={{
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 700,
        fontSize: 9,
        letterSpacing: '0.22em',
        textTransform: 'uppercase' as const,
        color: MID,
        margin: '18px 0 4px',
      }}
    >
      Corporate Policy Document
    </p>
    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: MID, margin: '0 0 18px' }}>
      Care Indeed Home Health Care, Inc.
    </p>
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 18 }}>
      <span
        style={{
          color: PRINT_ACCENT,
          border: `1px solid rgba(0,121,112,0.35)`,
          backgroundColor: '#f0faf9',
          padding: '2px 10px',
          borderRadius: 999,
          fontSize: 9,
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.1em',
        }}
      >
        {META.id}
      </span>
      <span
        style={{
          color: '#0f5132',
          border: '1px solid #badbcc',
          backgroundColor: '#d1e7dd',
          padding: '2px 10px',
          borderRadius: 999,
          fontSize: 9,
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.1em',
        }}
      >
        Active
      </span>
      <span
        style={{
          color: MID,
          border: `1px solid ${BORDER}`,
          backgroundColor: '#fff',
          padding: '2px 10px',
          borderRadius: 999,
          fontSize: 9,
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.1em',
        }}
      >
        {META.tier}
      </span>
    </div>
    <h1
      style={{
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 300,
        fontSize: 26,
        lineHeight: 1.22,
        letterSpacing: '-0.02em',
        margin: '0 0 20px',
        color: DARK,
      }}
    >
      {META.title}
    </h1>
    <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px 28px' }}>
        {[
          ['Version', `v${META.version}`],
          ['Effective', META.effective],
          ['Last Reviewed', META.lastReviewed],
          ['Next Review', META.nextReviewDate],
          ['Policy Owner', META.policyOwner],
          ['Subdomain', META.subdomain],
          ['Domain', META.domain],
          ['Approved By', META.approvedBy],
        ].map(([label, value]) => (
          <div key={label}>
            <span
              style={{
                display: 'block',
                fontSize: 8,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.12em',
                color: MID,
                marginBottom: 3,
              }}
            >
              {label}
            </span>
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10.5, fontWeight: 500, color: DARK }}>{value}</span>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9.5, color: MID, margin: '16px 0 0' }}>
        <span style={{ fontWeight: 600, color: DARK }}>Supersedes:</span> {META.supersedes}
      </p>
    </div>
    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 9.5, color: MID, margin: '20px 0 0' }}>
      Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
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
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            backgroundColor: '#fff',
            border: `1px solid ${TABLE_CELL_BORDER}`,
            borderLeft: `3px solid ${PRINT_ACCENT}`,
            borderRadius: 4,
            padding: '10px 14px',
          }}
        >
          <span
            style={{
              minWidth: 32,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: 10,
              color: PRINT_ACCENT,
              flexShrink: 0,
              paddingTop: 1,
            }}
          >
            4.{i + 1}
          </span>
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
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10.5, color: DARK, marginBottom: 4, borderLeft: `2px solid ${PRINT_ACCENT}`, paddingLeft: 8 }}>{def.term}</div>
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
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10.5, color: DARK, marginBottom: 4, borderLeft: `2px solid ${PRINT_ACCENT}`, paddingLeft: 8 }}>{title}</div>
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
        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, backgroundColor: '#fff', border: `1px solid ${TABLE_CELL_BORDER}`, borderLeft: `3px solid ${PRINT_ACCENT}`, borderRadius: 4, padding: '8px 12px' }}>
          <span style={{ minWidth: 22, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10, color: PRINT_ACCENT, flexShrink: 0, paddingTop: 1 }}>{i + 1}.</span>
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

// --- APPENDIX FORMS (Forms Library; same pathway as PolicyAppendicesPanel / FormPrintView) ---

function appendixLetterFromIndex(index: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let n = index;
  let out = '';
  do {
    out = alphabet[n % 26] + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}


// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function GVGBPrintDocument() {
  const linkedForms = useMemo(() => getFormsForPolicy('GV-GB-001'), []);

  useEffect(() => {
    const prev = document.title;
    document.title = `${META.id} — ${META.title}`;
    const params = new URLSearchParams(window.location.search);
    const shouldAutoPrint = params.get('autoprint') === '1';
    const timer = shouldAutoPrint
      ? window.setTimeout(() => window.print(), 1200)
      : undefined;
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
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
          .gvgb-print-appendix { break-inside: auto; }
          .gvgb-print-form-frame table {
            table-layout: fixed !important;
            width: 100% !important;
            border-collapse: collapse !important;
          }
        }
        body { margin: 0; padding: 0; }
      `}</style>

      {/* No-print header for screen view */}
      <div
        className="no-print"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#f4f5f6',
          color: DARK,
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${BORDER}`,
          boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
        }}
      >
        <a
          href="/library/GV-GB-001"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            fontSize: 12,
            color: '#007970',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          className="no-print"
        >
          ← Back to GV-GB-001
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            backgroundColor: '#fff',
            color: PRINT_ACCENT,
            border: `1px solid rgba(0,121,112,0.35)`,
            borderRadius: 6,
            padding: '6px 16px',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Document content */}
      <div style={{ width: '100%', maxWidth: 'none', margin: 0, padding: 0 }}>
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

        {/* Appendices: Forms Library (same ordering as PolicyAppendicesPanel — getFormsForPolicy + buildFormContent + FormBody / FormPrintView) */}
        <PageBreak />
        {linkedForms.length === 0 ? (
          <div style={{ padding: '32px 48px', fontFamily: 'Roboto, sans-serif', fontSize: 12, color: MID }}>
            No appendix forms are linked to GV-GB-001 in the Forms Library dataset.
          </div>
        ) : (
          linkedForms.map((rec, idx) => {
            const content = buildFormContent(rec);
            const letter = appendixLetterFromIndex(idx);
            return (
              <div
                key={rec.id}
                className="gvgb-print-appendix"
                style={{
                  pageBreakBefore: idx === 0 ? 'auto' : 'always',
                  breakBefore: idx === 0 ? 'auto' : 'page',
                  padding: '32px 48px',
                }}
              >
                <AppPrintHeader id={letter} title={rec.name || rec.id} />
                <div
                  className="gvgb-print-form-frame"
                  style={{
                    border: `1px solid ${TABLE_CELL_BORDER}`,
                    borderTop: `2px solid ${PRINT_ACCENT}`,
                    borderRadius: 6,
                    padding: '20px 24px 28px',
                    backgroundColor: '#fff',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: 9,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase' as const,
                      color: PRINT_ACCENT,
                      margin: '0 0 14px',
                    }}
                  >
                    Form {rec.id}
                  </p>
                  <FormBody content={content} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
