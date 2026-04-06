import { useState } from 'react';
import {
  ChevronLeft, Printer, Target, CheckCircle, BookOpen, List,
  Settings, FileText, CheckSquare, Archive, LayoutList, Bell,
  HelpCircle, Clock, Search, AlertTriangle, ChevronRight,
  GitBranch, ExternalLink, Landmark, Scale, FileCheck, Lock,
  Shield, ShieldCheck, Gavel
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════
// SHARED POLICY DETAIL VIEW
// Full 10-tab detail view with GV-GB-001 specimen content.
// Used by both DemoPage and LibraryPage.
// ══════════════════════════════════════════════════════════════

export interface SharedPolicy {
  id: string; policyId: string; title: string;
  domain: string; domainCode: string;
  subdomain: string; subdomainCode: string;
  classificationTier: string; status: string;
  version: string; effectiveDate: string; nextReviewDate: string;
  policyOwner: string; approvedBy: string;
  purpose: string; scope: string[]; regulatoryTags: string[];
}

// ── SHARED REGULATORY ITEMS (colour lookups) ──────────────────
const SHARED_REG_ITEMS = [
  { id: 'title22',  shortName: 'Title 22',    color: '#facc15', icon: Landmark },
  { id: '42cfr',   shortName: '42 CFR §484',  color: '#00e59b', icon: Scale },
  { id: 'cms',     shortName: 'CMS State Ops', color: '#ec4899', icon: FileCheck },
  { id: 'hipaa',   shortName: 'HIPAA',        color: '#3b82f6', icon: Lock },
  { id: 'osha',    shortName: 'OSHA',         color: '#f59e0b', icon: Shield },
  { id: 'oig',     shortName: 'OIG',          color: '#8b5cf6', icon: ShieldCheck },
  { id: 'fca',     shortName: 'FCA',          color: '#a855f7', icon: Gavel },
];

// ── GV-GB-001 SPECIMEN DATA ───────────────────────────────────
const GV_PURPOSE = `This policy establishes the authority, composition, functions, and oversight responsibilities of the Governing Body of Care Indeed Home Health Care, Inc. The Governing Body is the ultimate authority accountable for the operation, management, fiscal viability, and regulatory compliance of the home health agency. This policy ensures the agency satisfies the requirements set forth in 42 CFR § 484.105 — Condition of Participation: Organization and Administration of Services, which mandates that a home health agency must have a governing body that assumes full legal authority and responsibility for the agency's overall operation and management.`;

const GV_SCOPE = [
  'All members of the Governing Body of Care Indeed Home Health Care, Inc. (including voting and non-voting members)',
  'The Agency Administrator',
  'The Director of Nursing / Clinical Manager',
  'The Compliance Officer',
  'All senior leadership personnel who report directly to the Governing Body or Administrator',
  'All contracted management entities performing governing body functions on behalf of the agency',
];

const GV_DEFINITIONS = [
  { term: 'Governing Body', definition: 'The individual(s), board of directors, trustees, partnership, corporation, or other legally constituted authority that has ultimate responsibility for the management and operation of Care Indeed Home Health Care, Inc., as defined by 42 CFR § 484.2 and § 484.105.' },
  { term: 'Administrator', definition: "The individual appointed by the Governing Body who is responsible for managing the agency's day-to-day operations and who meets all qualifications specified in agency policy GV-OG-002 and applicable California state law." },
  { term: 'Clinical Manager', definition: 'The registered nurse (or qualified individual per California state law) designated by the Governing Body to oversee clinical services including patient care delivery, clinical staff supervision, and OASIS compliance. Also referred to as Director of Nursing (DON).' },
  { term: 'Fiduciary Duty', definition: 'The legal obligation of Governing Body members to act in good faith, with due diligence, and in the best interest of the agency and the patients it serves.' },
  { term: 'Quorum', definition: "The minimum number of Governing Body members required to be present (physically or via approved teleconference) to conduct official business, as defined in the agency's bylaws or operating agreement." },
  { term: 'QAPI', definition: 'Quality Assessment and Performance Improvement — the structured program required by 42 CFR § 484.65 for ongoing quality monitoring and improvement.' },
];

const GV_STATEMENTS = [
  'Care Indeed Home Health Care, Inc. shall maintain a designated Governing Body that holds full legal authority and responsibility for the overall operation, management, and regulatory compliance of the home health agency, as required by 42 CFR § 484.105(a).',
  'The Governing Body shall be responsible for ensuring that Care Indeed Home Health Care, Inc. operates in compliance with all applicable federal, state, and local laws, regulations, and licensure requirements at all times.',
  "The Governing Body shall appoint a qualified Administrator who is authorized to act on behalf of the Governing Body in the day-to-day management of the agency and who meets the qualifications defined in agency policy GV-OG-002 and applicable California state requirements.",
  'The Governing Body shall ensure the appointment and ongoing oversight of a qualified Clinical Manager (Director of Nursing) responsible for all clinical services, in compliance with 42 CFR § 484.105(c).',
  "The Governing Body shall approve and oversee the agency's:\n• Scope of services (GV-OG-003)\n• Organizational structure and reporting lines (GV-OG-001)\n• Annual strategic plan and operational goals (GV-OG-004)\n• Policy framework and all REQUIRED-tier policies (GV-PM-001, GV-PM-002)\n• QAPI program (QA-PG-001, QA-PG-002)\n• Corporate compliance program (CO-CP-001)\n• Annual operating budget (FN-FP-005)\n• Emergency preparedness plan (OP-FM-005)",
  'The Governing Body shall meet at a frequency sufficient to fulfill its oversight responsibilities, but not less than quarterly, with meetings documented in formal minutes per policy GV-GB-002.',
  'The Governing Body shall not delegate its ultimate accountability for regulatory compliance, patient safety, or fiscal integrity. Delegation of specific authority shall comply with policy GV-OG-005.',
  'All members of the Governing Body shall disclose and manage conflicts of interest in accordance with policy GV-GB-003.',
  'Only the most current approved version of this policy shall be considered valid. Superseded versions must not be used for any operational or compliance purpose. Any revision requires re-acknowledgment by all Governing Body members and senior leadership within 14 calendar days of the revised effective date.',
];

const GV_PROC_61: string[][] = [
  ['6.1.1', 'Agency Owner / Corporate Entity', 'Formally establish the Governing Body through articles of incorporation, operating agreement, partnership agreement, or equivalent legal instrument for Care Indeed Home Health Care, Inc. The establishing document must identify: (a) the legal form of the Governing Body; (b) the minimum and maximum number of members; (c) the quorum requirement; (d) the terms of appointment or election.', 'Prior to initial Medicare certification and maintained continuously thereafter.'],
  ['6.1.2', 'Governing Body Chair', 'Maintain a current roster of all Governing Body members including: full legal name, title/role, date of appointment, term expiration date, voting status, and contact information.', 'Updated within 7 calendar days of any membership change.'],
  ['6.1.3', 'Governing Body', 'Ensure composition includes, at minimum, individuals with competency in: (a) healthcare operations or clinical services; (b) financial management; (c) regulatory compliance. If any competency area is not represented by a current member, the Governing Body shall retain qualified advisory counsel within 30 calendar days of identifying the gap.', 'Ongoing; reviewed annually at the first quarterly meeting of each calendar year.'],
  ['6.1.4', 'Compliance Officer', 'Verify that no Governing Body member appears on the OIG List of Excluded Individuals/Entities (LEIE) or the System for Award Management (SAM) exclusion database at the time of appointment and monthly thereafter, per policy HR-TA-003.', 'At appointment and monthly thereafter.'],
];

const GV_PROC_62: { title: string; rows: string[][] }[] = [
  { title: '6.2.1 — Legal Authority and Agency Operations', rows: [
    ['6.2.1.1', 'Governing Body', 'Assume and maintain full legal authority for the overall operation, management, and fiscal viability of Care Indeed Home Health Care, Inc.', 'Continuous.'],
    ['6.2.1.2', 'Governing Body', 'Ensure the agency maintains current and valid: (a) California home health license — HCAI License No. 406412878; (b) Medicare certification; (c) Medicaid enrollment (if applicable); (d) accreditation (if applicable) — per policy GV-EA-004.', 'Continuous; verified at each quarterly meeting.'],
    ['6.2.1.3', 'Governing Body', "Review and approve the agency's defined scope of services (policy GV-OG-003) at least annually. Ensure the agency does not provide services beyond those for which it is licensed, staffed, and competent to deliver.", 'Annually, within 30 calendar days of the start of the fiscal year.'],
  ]},
  { title: '6.2.2 — Appointment and Oversight of Key Personnel', rows: [
    ['6.2.2.1', 'Governing Body', 'Appoint a qualified Administrator and document the appointment in Governing Body minutes. The Administrator must meet all qualifications defined in policy GV-OG-002 and applicable California state law.', 'Prior to agency operation and within 30 calendar days of any vacancy.'],
    ['6.2.2.2', 'Governing Body', 'Appoint or confirm the appointment of a qualified Clinical Manager (Director of Nursing) responsible for all clinical services, per 42 CFR § 484.105(c).', 'Prior to agency operation and within 30 calendar days of any vacancy.'],
    ['6.2.2.3', 'Governing Body', 'Appoint or confirm the designation of a Compliance Officer with authority and independence to operate the corporate compliance program, per policy CO-CP-002.', 'Prior to agency operation and within 30 calendar days of any vacancy.'],
    ['6.2.2.4', 'Governing Body', 'Conduct or commission an annual performance evaluation of the Administrator. Results and any corrective directives shall be documented in executive session minutes.', 'Annually; completed within 60 calendar days of the end of each fiscal year.'],
    ['6.2.2.5', 'Governing Body', "Review and approve the agency's succession plan for the Administrator, Clinical Manager, and Compliance Officer, per policy GV-GB-004.", 'Annually at the second quarterly meeting; updated within 14 calendar days of any key leadership vacancy.'],
  ]},
  { title: '6.2.3 — Policy and Compliance Oversight', rows: [
    ['6.2.3.1', 'Governing Body', 'Approve all REQUIRED-tier policies prior to implementation and ensure a defined policy review cycle exists per policies GV-PM-001 and GV-PM-002.', 'Prior to implementation of each REQUIRED policy; review cycle approved annually.'],
    ['6.2.3.2', 'Governing Body', 'Receive and review a compliance status report from the Compliance Officer at each quarterly meeting. The report must address: (a) active compliance investigations; (b) audit findings; (c) regulatory changes affecting the agency; (d) training completion rates.', 'Quarterly.'],
    ['6.2.3.3', 'Compliance Officer', 'Prepare and submit the quarterly compliance report to the Governing Body no fewer than 7 calendar days before each scheduled quarterly meeting.', '7 calendar days before each quarterly meeting.'],
    ['6.2.3.4', 'Governing Body', 'Review and act upon any compliance deficiency identified as high-risk within 14 calendar days of receiving the compliance report. Action must be documented in meeting minutes or a special resolution.', 'Within 14 calendar days of report receipt.'],
  ]},
  { title: '6.2.4 — QAPI Oversight', rows: [
    ['6.2.4.1', 'Governing Body', "Approve the agency's QAPI plan, per policy QA-PG-002, and ensure that the plan includes measurable quality indicators, performance improvement projects, and patient safety initiatives.", 'Annually; approved at the first quarterly meeting of each calendar year.'],
    ['6.2.4.2', 'Clinical Manager / QA Designee', 'Present a QAPI performance report to the Governing Body at each quarterly meeting including: (a) quality indicator trends; (b) status of active PIPs; (c) adverse event summary; (d) patient satisfaction data; (e) Star Rating / Home Health Compare trends (policy QA-SM-004).', 'Quarterly.'],
    ['6.2.4.3', 'Governing Body', 'Review, discuss, and document its response to the QAPI report. If any quality indicator falls below the defined threshold for 2 consecutive reporting periods, the Governing Body shall direct corrective action and assign accountability with a defined resolution deadline.', 'At each quarterly meeting; corrective action directive within 14 calendar days if thresholds are breached.'],
  ]},
  { title: '6.2.5 — Financial Oversight', rows: [
    ['6.2.5.1', 'Governing Body', 'Review and approve the annual operating budget per policy FN-FP-005.', 'Annually; approved no later than 30 calendar days before the start of each fiscal year.'],
    ['6.2.5.2', 'Administrator', 'Present a financial performance report to the Governing Body at each quarterly meeting including: (a) revenue vs. budget variance; (b) accounts receivable aging; (c) claims denial rate and trending; (d) cash flow position.', 'Quarterly.'],
    ['6.2.5.3', 'Governing Body', 'Review financial reports and direct corrective action if: (a) actual revenue deviates more than 10% below budget for 2 consecutive months; (b) claims denial rate exceeds 5%; (c) days in accounts receivable exceed 60. Directives must be documented in meeting minutes.', 'At each quarterly meeting.'],
  ]},
  { title: '6.2.6 — Emergency Preparedness', rows: [
    ['6.2.6.1', 'Governing Body', 'Approve the Emergency Operations and Business Continuity Plan per policy OP-FM-005 and 42 CFR § 484.102.', 'Annually; approved at the third quarterly meeting.'],
    ['6.2.6.2', 'Administrator / Governing Body', "Report the results of the most recent emergency preparedness drill or exercise to the Governing Body, including identified gaps and corrective actions; the Governing Body shall review results and direct corrective action as needed per policy OP-FM-005.", 'At the quarterly meeting following each drill (minimum 2 drills per year).'],
  ]},
];

const GV_PROC_63: string[][] = [
  ['6.3.1', 'Governing Body Chair', 'Schedule and convene regular Governing Body meetings no fewer than 4 times per calendar year (quarterly). The meeting schedule for the upcoming year must be established and distributed to all members by December 15 of the preceding year.', 'Quarterly; schedule distributed by December 15.'],
  ['6.3.2', 'Governing Body Chair', 'Convene special meetings when urgent matters arise, including but not limited to: (a) CMS survey findings requiring immediate corrective action; (b) serious adverse events; (c) regulatory enforcement actions; (d) key leadership vacancies. Notice of a special meeting must be provided to all members at least 48 hours in advance unless the matter constitutes an imminent threat to patient safety, in which case notice may be shortened to the minimum practicable.', 'As needed; notice within 48 hours or shorter for imminent patient safety threats.'],
  ['6.3.3', 'Designated Secretary / Administrator', 'Prepare and distribute the meeting agenda to all Governing Body members no fewer than 7 calendar days before each scheduled meeting. The agenda must include standing items: (a) approval of prior minutes; (b) Administrator report; (c) compliance report; (d) QAPI report; (e) financial report; (f) old business; (g) new business.', '7 calendar days before each meeting.'],
  ['6.3.4', 'Designated Secretary', 'Record formal minutes for each meeting per policy GV-GB-002. Minutes must document: (a) date, time, and location; (b) members present and absent; (c) quorum determination; (d) all motions, seconds, and voting outcomes; (e) all directives issued with assigned responsible parties and deadlines; (f) executive session topics (without protected details).', 'Draft minutes completed within 14 calendar days of the meeting; approved at the next regular meeting.'],
  ['6.3.5', 'Governing Body Chair', 'Ensure a quorum is present before conducting any official business. If quorum is not achieved, the meeting shall be rescheduled within 14 calendar days.', 'At the start of each meeting.'],
];

const GV_PROC_64: string[][] = [
  ['6.4.1', 'All Governing Body Members', 'Complete and submit the Conflict of Interest Disclosure Form (Appendix B) at the time of appointment, annually thereafter, and within 7 calendar days of any change in circumstances that could create a new conflict, per policy GV-GB-003.', 'At appointment; annually; within 7 days of change.'],
  ['6.4.2', 'Compliance Officer', 'Review all submitted conflict of interest disclosures within 14 calendar days of receipt and present a summary to the Governing Body with recommendations for management or recusal.', 'Within 14 calendar days of receipt.'],
  ['6.4.3', 'Governing Body', 'Act on conflict of interest recommendations. Any member with a disclosed conflict shall recuse from discussion and voting on the affected matter. Recusals must be documented in meeting minutes.', 'At the meeting where the affected matter is addressed.'],
];

const GV_PROC_65: string[][] = [
  ['Governing Body fails to meet quarterly', 'Administrator notifies all members and the Compliance Officer in writing.', 'Administrator schedules a make-up meeting. If Governing Body does not convene within 30 calendar days, the Compliance Officer documents the deficiency and initiates corrective action per QA-AE-003.', 'Make-up meeting within 30 calendar days of the missed quarter.'],
  ['Quorum not achieved for 2 consecutive scheduled meetings', 'Governing Body Chair escalates to the full membership in writing.', "Chair initiates membership recruitment or replacement per the agency's bylaws. Issue must be resolved before the next scheduled meeting.", 'Within 30 calendar days.'],
  ['Key leadership vacancy (Administrator, Clinical Manager, Compliance Officer) exceeds 30 days unfilled', 'Governing Body Chair', 'Governing Body must appoint an interim designee within 14 calendar days of vacancy and document the appointment. Permanent appointment must occur within 90 calendar days.', 'Interim: 14 days. Permanent: 90 days.'],
  ['CMS survey results in Condition-level deficiency', 'Administrator convenes a special Governing Body meeting.', 'Governing Body directs development of a Plan of Correction within CMS-required timeframes (typically 10 calendar days). Governing Body receives weekly status updates until resolution is confirmed.', 'Special meeting within 48 hours of receipt of findings; Plan of Correction per CMS deadline.'],
  ['Compliance Officer reports fraud, waste, or abuse concern to Governing Body', 'Governing Body Chair', 'Governing Body directs investigation per CO-CP-007 and ensures non-retaliation per CO-CP-005. Governing Body receives investigation status updates at each meeting until resolution.', 'Investigation initiated within 7 calendar days; updates at each meeting.'],
];

const GV_DOCS_REQ: string[][] = [
  ['Governing Body establishment', 'Articles of incorporation, operating agreement, bylaws, or equivalent legal instrument establishing the Governing Body of Care Indeed Home Health Care, Inc.', 'Agency Owner / Corporate Entity', 'Corporate records repository (physical or electronic).', 'Maintained permanently; updated within 14 calendar days of any amendment.'],
  ['Governing Body membership roster', 'Current roster including member name, role, appointment date, term, voting status, and contact information (Appendix A).', 'Governing Body Chair', 'Agency governance file; copy maintained by Administrator.', 'Updated within 7 calendar days of any change.'],
  ['Meeting minutes', 'Formal minutes for all regular and special meetings, per policy GV-GB-002 (Appendix D template).', 'Designated Secretary', 'Agency governance file; copy provided to each member.', 'Draft within 14 calendar days of meeting; approved at next regular meeting. Retained for minimum 7 years.'],
  ['Meeting agendas', 'Agenda for each regular and special meeting.', 'Administrator / Designated Secretary', 'Agency governance file.', 'Distributed 7 calendar days before each meeting; retained for minimum 7 years.'],
  ['Administrator appointment', "Written documentation of the Governing Body's appointment of the Administrator, including qualifications verified.", 'Governing Body Chair', 'Governing Body minutes; Administrator personnel file.', 'At time of appointment.'],
  ['Clinical Manager appointment', 'Written documentation of the appointment or confirmation of the Clinical Manager.', 'Governing Body Chair', 'Governing Body minutes; Clinical Manager personnel file.', 'At time of appointment.'],
  ['Compliance Officer designation', 'Written documentation of the designation and authority granted to the Compliance Officer.', 'Governing Body Chair', 'Governing Body minutes; Compliance Officer personnel file.', 'At time of designation.'],
  ['Conflict of Interest disclosures', 'Completed Conflict of Interest Disclosure Forms (Appendix B) for each Governing Body member.', 'Compliance Officer (collection); each member (completion)', 'Compliance file; copy in governance file.', 'At appointment; annually; within 7 days of change. Retained for minimum 7 years.'],
  ['Quarterly compliance reports', "Compliance Officer's written report to the Governing Body.", 'Compliance Officer', 'Agency governance file; compliance records.', 'Submitted 7 days before each quarterly meeting; retained minimum 7 years.'],
  ['Quarterly QAPI reports', "Clinical Manager / QA Designee's written report to the Governing Body.", 'Clinical Manager / QA Designee', 'Agency governance file; QAPI records.', 'Presented at each quarterly meeting; retained minimum 7 years.'],
  ['Financial reports', 'Quarterly financial performance report presented to the Governing Body.', 'Administrator', 'Agency governance file; financial records.', 'Presented at each quarterly meeting; retained per CO-HP-007.'],
  ['Annual budget approval', 'Documented Governing Body approval of the annual operating budget.', 'Administrator (preparation); Governing Body (approval)', 'Governing Body minutes; financial records.', 'Annually; approved 30 days before fiscal year start.'],
  ['QAPI plan approval', 'Documented Governing Body approval of the annual QAPI plan.', 'Clinical Manager / QA Designee (preparation); Governing Body (approval)', 'Governing Body minutes; QAPI records.', 'Annually at first quarterly meeting.'],
  ['Emergency preparedness plan approval', 'Documented Governing Body approval of the emergency plan.', 'Administrator (preparation); Governing Body (approval)', 'Governing Body minutes; emergency preparedness file.', 'Annually at third quarterly meeting.'],
  ['Exclusion screening results', 'Documentation of OIG/SAM screening for each Governing Body member.', 'Compliance Officer', 'Compliance file.', 'At appointment; monthly thereafter.'],
  ['Policy acknowledgment', 'Signed acknowledgment of this policy by all Governing Body members and senior leadership (Appendix C).', 'Each member / leader (completion); Administrator (collection)', 'Policy acknowledgment file.', 'Within 14 calendar days of policy effective date or revision; within 14 calendar days of new appointment.'],
  ['Annual Governance Self-Assessment', 'Completed self-assessment per policy GV-GB-005 (if adopted).', 'Governing Body Chair', 'Governance file.', 'Annually.'],
];

const GV_COMPLIANCE_81: string[][] = [
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

const GV_COMPLIANCE_82: string[] = [
  'Evidence that a Governing Body exists and is functioning. Surveyors will request establishing documents and a current membership roster. A sole proprietor must demonstrate individual acceptance of governing body responsibilities.',
  'Evidence that the Governing Body has appointed a qualified Administrator. Surveyors will review Governing Body minutes for appointment documentation and verify qualifications per California state requirements.',
  'Evidence of Clinical Manager oversight. Surveyors will look for Governing Body minutes documenting appointment, reporting, and oversight of clinical services leadership.',
  'Evidence that the Governing Body oversees QAPI. Surveyors will examine whether the Governing Body has reviewed, approved, and acted upon quality data. Passive receipt of reports without documented action is a common deficiency.',
  "Evidence of policy oversight. Surveyors will verify that the Governing Body has approved the agency's policies and that a review cycle exists.",
  "Evidence of fiscal oversight. Surveyors will review whether the Governing Body monitors the agency's financial viability and acts on adverse trends.",
  'Meeting frequency and documentation quality. Surveyors will request all meeting minutes for the survey look-back period and assess completeness, including attendance, quorum, and documented decisions.',
];

const GV_COMPLIANCE_83: string[][] = [
  ['No documented evidence that a Governing Body exists or functions.', 'Condition-level deficiency under 42 CFR § 484.105. Potential termination of Medicare certification.', 'Maintain establishing documents, current roster, and quarterly minutes on file and readily accessible.'],
  ['Governing Body meetings are held but not documented.', 'Surveyor will treat undocumented meetings as not having occurred.', 'Use Appendix D template; complete draft minutes within 14 calendar days.'],
  ["Governing Body 'rubber stamps' reports without documented discussion or action.", 'Surveyors will cite passive governance as failure to exercise oversight.', 'Minutes must document specific discussion points, questions, directives, and assigned follow-up.'],
  ['Key leadership vacancies are unfilled for extended periods.', 'Surveyor will cite failure to ensure adequate management.', 'Fill or designate interim within 14 calendar days per Section 6.5.'],
  ['No documented conflict of interest disclosures.', 'OIG compliance program requirement; potential survey finding.', 'Enforce annual disclosure per Appendix B; Compliance Officer tracks compliance.'],
  ['QAPI plan approved but no evidence of Governing Body review of quality data.', 'Surveyor will cite failure of governing body oversight of QAPI (42 CFR § 484.65 cross-reference).', 'Require quarterly QAPI report presentation and document Governing Body response.'],
];

const GV_FEDERAL_REFS: string[][] = [
  ['42 CFR § 484.2', 'Definitions', "Defines 'governing body' and key terms for home health agencies."],
  ['42 CFR § 484.105', 'CoP: Organization and Administration of Services', 'Primary regulatory basis for this policy. Requires a governing body with full legal authority for agency operation and management.'],
  ['42 CFR § 484.105(a)', 'Standard: Governing body', 'Mandates governing body responsibility for agency operations, appointment of administrator, and oversight of services.'],
  ['42 CFR § 484.105(b)', 'Standard: Administrator', 'Requires appointment of a qualified administrator responsible to the governing body.'],
  ['42 CFR § 484.105(c)', 'Standard: Clinical manager', 'Requires designation of a qualified clinical manager for oversight of clinical services.'],
  ['42 CFR § 484.60', 'CoP: Care planning, coordination, and quality of care', 'Governing body accountability for ensuring care planning and quality.'],
  ['42 CFR § 484.65', 'CoP: Quality assessment and performance improvement (QAPI)', 'Governing body must ensure an effective QAPI program.'],
  ['42 CFR § 484.70', 'CoP: Infection prevention and control', 'Governing body oversight of infection prevention.'],
  ['42 CFR § 484.100', 'CoP: Compliance with Federal, State, and local laws', 'Governing body must ensure full legal compliance.'],
  ['42 CFR § 484.102', 'CoP: Emergency preparedness', 'Governing body must approve emergency preparedness plan.'],
  ['42 CFR § 484.110', 'CoP: Clinical records', 'Governing body oversight of clinical records policies.'],
];

const GV_CROSS_REFS: string[][] = [
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

/** Word counts for Sections 1–11 (policy body; excludes appendices) — reconciled to published GV-GB-001 artifact. */
const GV_SECTION_WORD_COUNTS: string[][] = [
  ['1 — Policy Header', '77', 'Metadata and control fields.'],
  ['2 — Purpose', '94', 'Regulatory basis statement.'],
  ['3 — Scope', '93', 'Applicability and exclusion note.'],
  ['4 — Policy Statement', '369', 'Numbered policy statements.'],
  ['5 — Definitions', '202', 'Defined terms.'],
  ['6 — Procedures', '1,931', 'Subsections 6.1–6.5.'],
  ['7 — Documentation Requirements', '552', 'Records and retention.'],
  ['8 — Compliance & Audit', '630', 'Measurement, surveyor expectations, failure points.'],
  ['9 — References', '711', 'Federal, CMS, OIG, and policy cross-walk.'],
  ['10 — Training & Acknowledgment', '204', 'Orientation and attestation.'],
  ['11 — Version Control', '147', 'Lifecycle and revision rules.'],
  ['Total (Sections 1–11)', '5,010', 'Excludes appendices and form templates.'],
];

const GV_CMS_GUIDANCE_ROWS: string[][] = [
  ['CMS State Operations Manual, Appendix B — Guidance to Surveyors: Home Health Agencies', 'Provides interpretive guidelines for survey of 42 CFR § 484.105 compliance; defines surveyor expectations for governing body evidence.'],
  ['CMS OASIS-E2 Guidance Manual (effective April 2026)', "While not directly governing the Governing Body, the Governing Body is accountable for ensuring the agency's OASIS program meets CMS requirements (see CL-OA domain policies)."],
];

const GV_OIG_GUIDANCE_ROWS: string[][] = [
  ['OIG Compliance Program Guidance for Home Health Agencies (1998; supplemented)', 'Establishes expectation that the governing body actively oversees the compliance program and receives regular compliance reports.'],
];

const GV_ALERTS: Array<{ level: 'critical' | 'warning' | 'info'; title: string; body: string; date: string; source?: string }> = [
  { level: 'critical', title: 'CMS Proposed Rule — HHA Governing Body Requirements', body: 'CMS has published a proposed rule (CMS-1802-P) that would expand documentation requirements for HHA Governing Bodies, including mandatory annual composition reviews and competency attestations. Comment period closes 2026-02-15. Review proposed changes against GV-GB-001 §6.1.', date: '2025-12-01', source: 'Federal Register Vol. 90' },
  { level: 'warning', title: 'California AB 2029 — HHA Board Composition', body: 'AB 2029 pending HCAI implementation guidance would require at least one independent clinical professional on the Governing Body of Medicare-certified HHAs in California. Monitor HCAI bulletins for implementation dates.', date: '2025-10-15', source: 'California HCAI Bulletin' },
  { level: 'info', title: 'OIG Work Plan — Governing Body Oversight Practices', body: 'The OIG FY2026 Work Plan includes a review of Governing Body documentation practices at Medicare-certified HHAs. Ensure GV-GB-001 Appendix A (Roster) and Appendix D (Minutes) are complete and current.', date: '2025-11-01', source: 'OIG Work Plan FY2026' },
  { level: 'info', title: 'HCAI / CDPH — Licensure & Multi-Agency Oversight', body: 'California home health licensure (HCAI) and public health oversight (CDPH) operate alongside Medicare certification. When license numbers, service areas, or ownership change, verify GV-EA-004 and Governing Body minutes document review.', date: '2025-09-01', source: 'HCAI / CDPH' },
  { level: 'warning', title: 'CMS Emergency Preparedness (42 CFR § 484.102)', body: 'Surveyors routinely verify Governing Body approval of the emergency plan and evidence of drill critique. Align OP-FM-005 documentation with §6.2.6 and ensure quarterly meeting minutes reflect review when required.', date: '2025-08-15', source: 'CMS SOM Appendix B' },
];

const GV_FAQ: Array<{ q: string; a: string }> = [
  { q: 'Can a single individual serve as both the Administrator and a Governing Body voting member?', a: "Yes — 42 CFR § 484.105(b) permits the Administrator to serve as a Governing Body member. However, the Administrator alone cannot constitute quorum, and any votes on Administrator compensation, performance, or termination must be handled by non-Administrator members. Conflicts of interest must be disclosed per GV-GB-003." },
  { q: 'What is required if we cannot achieve quorum at a scheduled quarterly meeting?', a: 'The meeting cannot conduct official business. It must be rescheduled within 14 calendar days. The failed quorum attempt must be documented. Emergency matters may be handled via unanimous written consent of all voting members, subject to agency bylaws.' },
  { q: 'Does every Governing Body member need OIG/SAM exclusion screening?', a: 'Yes. Per 42 CFR § 484.105 and OIG guidance, all individuals with ownership or managerial authority — including all Governing Body members — must be screened against the OIG Exclusion Database and SAM.gov at least monthly. The Compliance Officer manages this.' },
  { q: 'How many members are required on the Governing Body?', a: 'There is no federal minimum number specified in 42 CFR § 484.105. Agency bylaws define composition and quorum. A practical minimum of 3 voting members is recommended to avoid quorum issues. The Governing Body must include adequate competency to exercise genuine oversight.' },
];

const GV_AMENDMENTS: Array<{ version: string; date: string; author: string; summary: string; sections?: string }> = [
  { version: '6.0', date: '2025-07-10', author: 'Compliance Officer', summary: 'Major comprehensive revision — added §6.2.6 (Emergency Preparedness oversight), expanded §6.4 (Conflict of Interest), restructured all appendices into interactive digital forms (Appendix A–G). Aligned with updated OIG HHA Compliance Program Guidance (Nov 2023) and CMS SOM Appendix B 2024 update.', sections: '§6.1.4, §6.2.6, §6.4, All Appendices A–G' },
  { version: '5.1', date: '2024-11-15', author: 'Governing Body Chair', summary: 'Minor update — clarified quorum requirements in §6.3 to align with revised agency bylaws; added GV-GB-005 cross-reference; updated Section 11 version control table.', sections: '§6.3, §9.4, §11' },
  { version: '5.0', date: '2024-07-01', author: 'Administrator', summary: 'Annual review — no substantive policy changes. Updated effective date, review dates, and regulatory citations to reflect current 42 CFR §484 regulations.' },
  { version: '4.2', date: '2023-10-12', author: 'Compliance Officer', summary: 'Emergency update — added monthly OIG/SAM exclusion screening requirement for all Governing Body members per updated OIG Compliance Program Guidance for HHAs issued October 2023.', sections: '§6.1.4 (new), §7, Appendix A' },
];

// ── GENERIC FALLBACKS ─────────────────────────────────────────
const GENERIC_DEFS = [
  { term: 'Classification Tier', definition: 'The policy priority level within the enterprise taxonomy: REQUIRED, ESSENTIAL, OPERATIONAL, or REFERENCE.' },
  { term: 'Policy Owner', definition: 'The designated individual or role responsible for maintaining, reviewing, and approving this policy artifact.' },
  { term: 'Lifecycle Status', definition: 'The current state of the policy in the governance lifecycle: DRAFT, ACTIVE, UNDER REVIEW, or DEPRECATED.' },
  { term: 'Review Cycle', definition: 'The scheduled frequency (annual or biennial) at which this policy must be formally reviewed for continued relevance and compliance.' },
  { term: 'Access Tier', definition: 'The visibility classification (Tiers 1–4) that determines which roles can view or edit this policy.' },
  { term: 'Regulatory Cross-Reference', definition: 'The specific federal, state, or accreditation standards to which this policy maps for compliance traceability.' },
];

// ── SHARED GLASS TABLE ────────────────────────────────────────
export function SharedGlassTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar mt-4 mb-6 border border-white/10 rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/[0.03] border-b border-white/10">
            {headers.map((h, i) => (
              <th key={i} className="py-3 px-4 font-montserrat font-bold text-[10px] tracking-wider text-white/50 uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-[#c0d6cf]">
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-white/[0.02] transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="py-3 px-4 text-[12px] align-top leading-relaxed whitespace-pre-line break-words">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── TAB: OVERVIEW ─────────────────────────────────────────────
function TabOverview({ policy }: { policy: SharedPolicy }) {
  const isGV = policy.policyId === 'GV-GB-001';
  const purposeText = isGV ? GV_PURPOSE : policy.purpose;
  const scopeItems = isGV ? GV_SCOPE : policy.scope;
  const defs = isGV ? GV_DEFINITIONS : GENERIC_DEFS;

  return (
    <div className="demo-view-enter mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="border-l-[3px] border-[#00e59b] pl-6">
          <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center mb-4 tracking-widest uppercase">
            <Target className="text-[#00e59b] mr-3" size={18} /> 2. Purpose
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">{purposeText}</p>
        </div>
        <div className="border-l-[3px] border-[#e85200] pl-6">
          <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center mb-4 tracking-widest uppercase">
            <Search className="text-[#e85200] mr-3" size={18} /> 3. Scope
          </h2>
          <ul className="space-y-3">
            {scopeItems.map((item, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle className="text-[#e85200] mr-3 mt-0.5 flex-shrink-0" size={14} />
                <span className="text-white/70 text-sm">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 p-4 bg-[#e85200]/10 border border-[#e85200]/20 text-[#e85200] rounded-xl text-xs font-medium leading-relaxed">
            {isGV
              ? 'This policy does not apply to day-to-day clinical or operational staff except to the extent that Governing Body decisions establish requirements, standards, or directives that govern their work.'
              : 'This policy does not apply to day-to-day clinical or operational staff except to the extent that decisions establish requirements, standards, or directives that govern their work.'}
          </div>
        </div>
      </div>
      {/* Definitions */}
      <div className="mt-12 border-l-[3px] border-blue-400 pl-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center mb-5 tracking-widest uppercase">
          <BookOpen className="text-blue-400 mr-3" size={18} /> 5. Definitions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {defs.map((def, i) => (
            <div key={i} className="glass-card p-4 rounded-xl">
              <h4 className="font-montserrat font-bold text-blue-400 text-[12px] mb-2">{def.term}</h4>
              <p className="text-white/60 text-[11px] leading-relaxed">{def.definition}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Regulatory Tags */}
      {policy.regulatoryTags.length > 0 && (
        <div className="mt-10 pt-8 border-t border-white/10">
          <h3 className="font-montserrat text-[12px] font-bold text-white uppercase tracking-[0.2em] mb-4">Regulatory Cross-References</h3>
          <div className="flex flex-wrap gap-2">
            {policy.regulatoryTags.map(tag => {
              const reg = SHARED_REG_ITEMS.find(r => r.id === tag);
              if (!reg) return null;
              const Icon = reg.icon;
              return (
                <span key={tag} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-widest uppercase"
                  style={{ borderColor: `${reg.color}40`, background: `${reg.color}10`, color: reg.color }}>
                  <Icon size={12} /> {reg.shortName}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TAB: STATEMENTS ───────────────────────────────────────────
function TabStatements({ policy }: { policy: SharedPolicy }) {
  const isGV = policy.policyId === 'GV-GB-001';
  const stmts = isGV ? GV_STATEMENTS : [
    `${policy.policyId} establishes the authority, composition, functions, and oversight responsibilities governing this domain within Care Indeed Home Health Care, Inc.`,
    'The organization shall maintain full legal authority and responsibility for overall operation, management, and regulatory compliance as required by applicable federal and state regulations.',
    'All personnel within scope shall comply with this policy. Non-compliance may result in corrective action up to and including termination.',
    'This policy shall be reviewed on the established review cycle and revised as needed to maintain compliance with applicable regulatory changes.',
    'Only the most current approved version of this policy shall be considered valid. Superseded versions must not be used for any operational or compliance purpose.',
  ];
  return (
    <div className="demo-view-enter mt-8">
      <div className="border-l-[3px] border-[#00e59b] pl-6 mb-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
          <List className="text-[#00e59b] mr-3" size={18} /> 4. Policy Statement
        </h2>
      </div>
      <div className="space-y-3 pl-6">
        {stmts.map((stmt, i) => (
          <div key={i} className="flex items-start glass-card p-4 rounded-xl">
            <div className="text-[#00e59b] font-bold font-montserrat flex-shrink-0 mr-4 w-8 text-[12px]">4.{i + 1}</div>
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{stmt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TAB: PROCEDURES ───────────────────────────────────────────
function TabProcedures({ policy }: { policy: SharedPolicy }) {
  const [activeSub, setActiveSub] = useState('6.1');
  const isGV = policy.policyId === 'GV-GB-001';
  const subTabs = [
    { id: '6.1', label: '6.1 Establishment' },
    { id: '6.2', label: '6.2 Core Responsibilities' },
    { id: '6.3', label: '6.3 Meetings' },
    { id: '6.4', label: '6.4 Conflict of Interest' },
    { id: '6.5', label: '6.5 Escalation' },
  ];
  if (!isGV) {
    return (
      <div className="demo-view-enter mt-8">
        <div className="border-l-[3px] border-[#00e59b] pl-6 mb-6">
          <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
            <Settings className="text-[#00e59b] mr-3" size={18} /> 6. Procedures
          </h2>
        </div>
        <div className="pl-6">
          <div className="bg-[#e85200]/10 border border-[#e85200]/20 text-[#e85200] p-4 rounded-xl text-sm flex items-start mb-6">
            <AlertTriangle className="mr-3 flex-shrink-0 mt-0.5" size={16} />
            <p>Responsible parties shall fulfill the following procedures directly and shall <strong className="text-orange-300">not delegate ultimate accountability</strong> for any of these functions.</p>
          </div>
          <SharedGlassTable
            headers={['Step', 'Responsible Party', 'Action', 'Timeframe']}
            rows={[
              ['6.1.1', 'Policy Owner', `Maintain and review ${policy.policyId} per the established review cycle.`, 'As per review cycle.'],
              ['6.1.2', 'Compliance Officer', 'Verify regulatory cross-references are current and accurate.', 'Within 30 days of regulatory change.'],
              ['6.1.3', 'Administrator', 'Ensure all personnel within scope have acknowledged this policy and completed required training.', 'Within 14 calendar days of effective date.'],
              ['6.1.4', 'QA Designee', 'Monitor compliance indicators and report deviations through the QAPI program.', 'Quarterly.'],
              ['6.1.5', 'All Staff in Scope', 'Comply with all requirements of this policy.', 'Continuous.'],
            ]}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="demo-view-enter mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-l-[3px] border-[#00e59b] pl-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
          <Settings className="text-[#00e59b] mr-3" size={18} /> 6. Procedures
        </h2>
        <div className="flex gap-2 flex-wrap mt-3 md:mt-0">
          {subTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveSub(tab.id)}
              className={`px-3 py-1.5 rounded-full font-montserrat font-bold text-[10px] uppercase tracking-wider transition-colors ${activeSub === tab.id ? 'bg-[#00e59b]/20 text-[#00e59b] border border-[#00e59b]/50' : 'text-white/50 border border-transparent hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {activeSub === '6.1' && (
        <div>
          <h3 className="font-montserrat font-bold text-sm text-white mb-4 pl-6">6.1 Establishment and Composition</h3>
          <SharedGlassTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={GV_PROC_61} />
        </div>
      )}
      {activeSub === '6.2' && (
        <div className="space-y-10">
          <div className="bg-[#e85200]/10 border border-[#e85200]/20 text-[#e85200] p-4 rounded-xl text-sm flex items-start">
            <AlertTriangle className="mr-3 flex-shrink-0 mt-0.5" size={16} />
            <p>The Governing Body shall fulfill the following responsibilities directly and shall <strong className="text-orange-300">not delegate ultimate accountability</strong> for any of these functions.</p>
          </div>
          {GV_PROC_62.map((section, idx) => (
            <div key={idx}>
              <h3 className="font-montserrat font-bold text-sm text-[#00e59b] mb-3">{section.title}</h3>
              <SharedGlassTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={section.rows} />
            </div>
          ))}
        </div>
      )}
      {activeSub === '6.3' && (
        <div>
          <h3 className="font-montserrat font-bold text-sm text-white mb-4 pl-6">6.3 Governing Body Meetings</h3>
          <SharedGlassTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={GV_PROC_63} />
        </div>
      )}
      {activeSub === '6.4' && (
        <div>
          <h3 className="font-montserrat font-bold text-sm text-white mb-4 pl-6">6.4 Conflict of Interest Management</h3>
          <SharedGlassTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={GV_PROC_64} />
        </div>
      )}
      {activeSub === '6.5' && (
        <div>
          <h3 className="font-montserrat font-bold text-sm text-[#e85200] mb-4 pl-6 flex items-center">
            <AlertTriangle className="mr-2" size={16} /> 6.5 Escalation and Exception Handling
          </h3>
          <SharedGlassTable headers={['Condition', 'Escalation Path', 'Corrective Action', 'Timeframe']} rows={GV_PROC_65} />
        </div>
      )}
    </div>
  );
}

// ── TAB: DOCUMENTATION ────────────────────────────────────────
function TabDocumentation({ policy }: { policy: SharedPolicy }) {
  const isGV = policy.policyId === 'GV-GB-001';
  return (
    <div className="demo-view-enter mt-8">
      <div className="border-l-[3px] border-[#00e59b] pl-6 mb-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
          <FileText className="text-[#00e59b] mr-3" size={18} /> 7. Documentation Requirements
        </h2>
      </div>
      <SharedGlassTable
        headers={['Requirement', 'Document / Record', 'Responsible Party', 'Location', 'Timeframe']}
        rows={isGV ? GV_DOCS_REQ : [
          ['Policy acknowledgment', 'Signed acknowledgment by all personnel within scope.', 'Administrator (collection)', 'Policy acknowledgment file', 'Within 14 calendar days of effective date.'],
          ['Version control record', 'Version history reflecting all substantive and non-substantive revisions.', 'Policy Owner', 'Policy management system', 'Updated with each revision.'],
          ['Regulatory cross-reference map', 'Current mapping of policy to applicable regulations.', 'Compliance Officer', 'Compliance records', 'Maintained continuously; verified quarterly.'],
          ['Training completion records', 'Documentation of required training for all in-scope personnel.', 'HR / Training Coordinator', 'Personnel files', 'Within 14 calendar days of policy effective date.'],
          ['Compliance audit results', 'Results of internal audits measuring compliance with this policy.', 'QA Designee', 'QAPI records', 'Quarterly; retained for minimum 7 years.'],
        ]}
      />
    </div>
  );
}

// ── TAB: COMPLIANCE ───────────────────────────────────────────
function TabCompliance({ policy }: { policy: SharedPolicy }) {
  const isGV = policy.policyId === 'GV-GB-001';
  return (
    <div className="demo-view-enter mt-8">
      <div className="border-l-[3px] border-[#00e59b] pl-6 mb-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
          <CheckSquare className="text-[#00e59b] mr-3" size={18} /> 8. Compliance & Audit
        </h2>
      </div>
      <h3 className="font-montserrat text-[12px] font-bold text-white mb-4 uppercase tracking-widest">8.1 How Compliance Is Measured</h3>
      <SharedGlassTable
        headers={['Compliance Indicator', 'Measurement Method', 'Acceptable Standard']}
        rows={isGV ? GV_COMPLIANCE_81 : [
          ['Policy is current and approved.', 'Review of version control record and approval documentation.', 'Current version on file at all times.'],
          ['All personnel acknowledged.', 'Review of signed acknowledgment forms.', '100% acknowledgment within 14 calendar days.'],
          ['Regulatory mappings are current.', 'Review of cross-reference documentation.', 'Updated within 30 days of any regulatory change.'],
          ['Compliance monitoring active.', 'Review of QAPI reports and audit logs.', 'Quarterly monitoring with documented results.'],
        ]}
      />
      {isGV && (
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h3 className="font-montserrat text-[12px] font-bold text-white mb-4 uppercase tracking-widest flex items-center">
              <Search className="text-white/50 mr-2" size={14} /> 8.2 Surveyor Expectations
            </h3>
            <p className="text-[11px] text-white/50 mb-4">CMS surveyors conducting a standard survey under SOM Appendix B will specifically verify:</p>
            <ul className="space-y-3">
              {GV_COMPLIANCE_82.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="text-[#00e59b] mt-0.5 shrink-0" size={14} />
                  <span className="text-[12px] text-white/70 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-montserrat text-[12px] font-bold text-[#e85200] mb-4 uppercase tracking-widest flex items-center">
              <AlertTriangle className="mr-2" size={14} /> 8.3 Common Failure Points
            </h3>
            <div className="space-y-3">
              {GV_COMPLIANCE_83.map((item, i) => (
                <div key={i} className="border border-red-500/20 p-4 rounded-xl bg-red-500/5">
                  <p className="font-bold text-red-400 text-[12px] mb-1">{item[0]}</p>
                  <p className="text-[11px] text-red-300/80 mb-1"><strong>Risk:</strong> {item[1]}</p>
                  <p className="text-[11px] text-white/70"><strong>Mitigation:</strong> {item[2]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {!isGV && (
        <>
          <h3 className="font-montserrat text-[12px] font-bold text-[#e85200] mt-10 mb-4 uppercase tracking-widest flex items-center">
            <AlertTriangle className="mr-2" size={16} /> 8.2 Common Failure Points
          </h3>
          <div className="space-y-3">
            {[
              { finding: 'Policy has not been reviewed within required cycle.', risk: 'Surveyor may cite outdated policy as non-compliance.', mitigation: 'Set calendar reminders and track review dates in enterprise system.' },
              { finding: 'Staff acknowledgments are incomplete or missing.', risk: 'Surveyor will cite failure to ensure staff awareness.', mitigation: 'Automated tracking with escalation for non-compliance within 7 days of deadline.' },
              { finding: 'Regulatory cross-references are outdated.', risk: 'Policy may not reflect current regulatory requirements.', mitigation: 'Compliance Officer monitors regulatory changes and updates mappings proactively.' },
            ].map((item, i) => (
              <div key={i} className="border border-red-500/20 p-4 rounded-xl bg-red-500/5">
                <p className="font-bold text-red-400 text-[12px] mb-1">{item.finding}</p>
                <p className="text-[11px] text-red-300/80 mb-1"><strong>Risk:</strong> {item.risk}</p>
                <p className="text-[11px] text-white/70"><strong>Mitigation:</strong> {item.mitigation}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── TAB: REFERENCES ───────────────────────────────────────────
function TabReferences({ policy }: { policy: SharedPolicy }) {
  const isGV = policy.policyId === 'GV-GB-001';
  return (
    <div className="demo-view-enter mt-8">
      <div className="border-l-[3px] border-[#00e59b] pl-6 mb-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
          <Archive className="text-[#00e59b] mr-3" size={18} /> 9. References & Administration
        </h2>
      </div>
      <div className="pl-6">
        <h3 className="font-montserrat text-[12px] font-bold text-white/50 uppercase tracking-widest mb-3">9.1 Federal Regulatory References</h3>
        <SharedGlassTable
          headers={['Citation', 'Title', 'Applicability']}
          rows={isGV ? GV_FEDERAL_REFS : [
            ['42 CFR § 484.105', 'Organization and Administration of Services', 'Primary regulatory basis for governance policies.'],
            ['42 CFR § 484.65', 'QAPI', 'Quality assessment and performance improvement requirements.'],
            ['42 CFR § 484.100', 'Compliance with Laws', 'Federal, state, and local law compliance.'],
            ['42 CFR § 484.102', 'Emergency Preparedness', 'Emergency plan approval and oversight.'],
          ]}
        />
        {isGV && (
          <>
            <h3 className="font-montserrat text-[12px] font-bold text-white/50 mt-10 uppercase tracking-widest mb-3">Section Word Count Summary (Taxonomy Reconciliation)</h3>
            <p className="text-[11px] text-white/50 mb-4 max-w-3xl">
              Approximate word counts for each major section of the policy body (Sections 1–11). Appendix forms and templates are excluded. Totals align with the published GV-GB-001 Word artifact.
            </p>
            <SharedGlassTable headers={['Section', 'Approx. word count', 'Notes']} rows={GV_SECTION_WORD_COUNTS} />
            <h3 className="font-montserrat text-[12px] font-bold text-white/50 mt-10 uppercase tracking-widest mb-3">9.2 CMS Guidance (Regulatory Boards)</h3>
            <SharedGlassTable headers={['Document', 'Relevance']} rows={GV_CMS_GUIDANCE_ROWS} />
            <h3 className="font-montserrat text-[12px] font-bold text-white/50 mt-10 uppercase tracking-widest mb-3">9.3 OIG Guidance</h3>
            <SharedGlassTable headers={['Document', 'Relevance']} rows={GV_OIG_GUIDANCE_ROWS} />
          </>
        )}
        {isGV && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-5 rounded-xl border border-white/10">
              <h3 className="font-montserrat text-[11px] font-bold text-[#00e59b] uppercase tracking-widest mb-3">CMS Survey &amp; Certification Guidance</h3>
              <ul className="space-y-2">
                {['SOM Appendix B — Home Health Agency Survey Protocol', 'CMS Interpretive Guidelines for 42 CFR Part 484', 'State Operations Manual (SOM) Chapter 2 — The Certification Process', 'CMS Quality Assurance & Performance Improvement Framework', 'CMS CoP Interpretive Guidelines — Governing Body Requirements'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="text-[#00e59b] mt-0.5 shrink-0" size={13} />
                    <span className="text-[11px] text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-5 rounded-xl border border-white/10">
              <h3 className="font-montserrat text-[11px] font-bold text-[#00e59b] uppercase tracking-widest mb-3">OIG Compliance Guidance</h3>
              <ul className="space-y-2">
                {['OIG Compliance Program Guidance for Home Health Agencies (1998)', 'OIG Work Plan — Annual Home Health Agency Audit Items', 'False Claims Act (31 U.S.C. §§ 3729–3733)', 'Anti-Kickback Statute (42 U.S.C. § 1320a-7b(b))', 'HHS-OIG Advisory Opinion Framework for HHA Compliance'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="text-[#00e59b] mt-0.5 shrink-0" size={13} />
                    <span className="text-[11px] text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <h3 className="font-montserrat text-[12px] font-bold text-white/50 mt-10 uppercase tracking-widest mb-3">9.4 Cross-Referenced Agency Policies</h3>
        {isGV ? (
          <SharedGlassTable headers={['Policy ID', 'Policy Title', 'Cross-Reference Type']} rows={GV_CROSS_REFS} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'GV-PM-001', title: 'Policy Development & Approval Process' },
              { id: 'GV-PM-002', title: 'Policy Review & Revision Cycle' },
              { id: 'EN-TG-001', title: 'Enterprise Policy Taxonomy & Classification' },
              { id: 'EN-LC-001', title: 'Policy Lifecycle Management & Version Control' },
              { id: 'CO-CP-001', title: 'Corporate Compliance Program' },
              { id: 'QA-PG-001', title: 'QAPI Program Establishment & Governance' },
            ].map((ref, i) => (
              <div key={i} className="glass-card p-3 rounded-xl flex items-center gap-3">
                <span className="text-[#00e59b] font-mono font-bold text-[11px]">{ref.id}</span>
                <span className="text-white/70 text-[11px]">{ref.title}</span>
              </div>
            ))}
          </div>
        )}
        {isGV && (
          <>
            <div className="mt-12 border-l-[3px] border-[#00e59b] pl-6 mb-6">
              <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
                <BookOpen className="text-[#00e59b] mr-3" size={18} /> 10. Training & Education Requirements
              </h2>
            </div>
            <div className="pl-6">
              <SharedGlassTable
                headers={['Role / Audience', 'Training Content', 'Frequency', 'Delivery Method']}
                rows={[
                  ['All Staff', 'Policy awareness: purpose, scope, and obligations', 'Upon hire; annually', 'LMS module + attestation'],
                  ['Governing Body Members', 'Board governance obligations, CMS CoP oversight, liability exposure', 'Upon appointment; triennially', 'In-person session + written brief'],
                  ['Administrators / Executives', 'Governing body structure, delegation of authority, compliance accountability', 'Annually', 'Leadership retreat + competency assessment'],
                  ['Compliance Officer', 'Regulatory updates (42 CFR Part 484), survey preparation, OIG guidance', 'Quarterly (regulatory); annually (full review)', 'External seminars + internal review sessions'],
                  ['Clinical Supervisors', 'Clinical governance, care standard oversight, policy enforcement obligations', 'Annually', 'Interdisciplinary training + competency check'],
                  ['QA/PI Coordinator', 'QAPI governance integration, data reporting to governing body', 'Semi-annually', 'QAPI workshop + peer review'],
                  ['Department Managers', 'Operational policy implementation, staff education responsibilities', 'Annually', 'Supervisory training program + attestation'],
                ]}
              />
            </div>
            <div className="mt-12 border-l-[3px] border-[#00e59b] pl-6 mb-6">
              <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
                <GitBranch className="text-[#00e59b] mr-3" size={18} /> 11. Version Control & Revision History
              </h2>
            </div>
            <div className="pl-6">
              <SharedGlassTable
                headers={['Version', 'Effective Date', 'Approved By', 'Summary of Changes']}
                rows={[
                  ['6.0', '2025-07-10', 'Governing Body Chair', 'Major comprehensive revision — added §6.2.6, expanded §6.4, restructured all appendices. Aligned with OIG HHA Compliance Program Guidance (Nov 2023) and CMS SOM Appendix B 2024 update.'],
                  ['5.1', '2024-11-15', 'Governing Body Chair', 'Minor update — clarified quorum requirements; added GV-GB-005 cross-reference.'],
                  ['5.0', '2024-07-01', 'Administrator', 'Annual review — no substantive policy changes. Updated dates and regulatory citations.'],
                  ['4.2', '2023-10-12', 'Compliance Officer', 'Emergency update — added monthly OIG/SAM exclusion screening requirement per updated OIG Compliance Program Guidance.'],
                  ['4.0', '2023-01-01', 'Board of Directors', 'Full triennial review — incorporated OIG compliance guidance, expanded training section, added digital governance provisions.'],
                  ['1.0', '2018-01-01', 'Board of Directors', 'Initial policy adoption — established governing body structure per 42 CFR § 484.105.'],
                ]}
              />
            </div>
          </>
        )}
        {/* Document Metadata */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <h3 className="font-montserrat text-[12px] font-bold text-white uppercase tracking-[0.2em] mb-4">Document Metadata</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ['Effective Date', policy.effectiveDate],
              ['Next Review', policy.nextReviewDate],
              ['Policy Owner', policy.policyOwner],
              ['Subdomain', policy.subdomain],
              ['Domain Code', policy.domainCode],
              ['Status', policy.status],
            ].map(([label, val]) => (
              <div key={label} className="glass-card rounded-xl p-3">
                <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold block mb-1">{label}</span>
                <span className="text-[12px] text-white/80">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TAB: APPENDICES ───────────────────────────────────────────
function TabAppendices({ policy }: { policy: SharedPolicy }) {
  const isGV = policy.policyId === 'GV-GB-001';
  const [activeApp, setActiveApp] = useState('A');
  const apps = [
    { id: 'A', label: 'Appx A: Roster',      title: 'Governing Body Membership Roster' },
    { id: 'B', label: 'Appx B: Conflicts',   title: 'Conflict of Interest Form' },
    { id: 'C', label: 'Appx C: Acknowledge', title: 'Policy Acknowledgment Form' },
    { id: 'D', label: 'Appx D: Minutes',     title: 'Meeting Minutes Template' },
    { id: 'E', label: 'Appx E: Checklist',   title: 'Quarterly Oversight Checklist' },
    { id: 'F', label: 'Appx F: Calendar',    title: 'Annual Calendar' },
    { id: 'G', label: 'Appx G: Org Chart',   title: 'Agency Organizational Chart' },
  ];
  if (!isGV) {
    return (
      <div className="demo-view-enter mt-8 flex flex-col items-center justify-center py-20">
        <LayoutList className="text-white/20 mb-4" size={48} />
        <p className="text-white/40 text-[13px] font-montserrat uppercase tracking-widest">Appendices Available for Specimen Policy</p>
        <p className="text-white/30 text-[11px] mt-2">Select GV-GB-001 to view Forms &amp; Appendices</p>
      </div>
    );
  }
  const inputCls = 'border-b border-white/20 bg-transparent text-white text-xs focus:outline-none focus:border-[#00e59b] w-full pb-1';
  const selectCls = 'border border-white/20 rounded p-1 w-full bg-transparent text-white text-xs focus:outline-none focus:border-[#00e59b]';
  const dateCls = 'border border-white/10 rounded p-1 w-full bg-transparent text-white text-xs focus:outline-none focus:border-[#00e59b]';
  const thCls = 'p-3 font-montserrat font-bold text-[10px] text-white/50 uppercase tracking-wider border-b border-white/10 text-left';

  return (
    <div className="demo-view-enter mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-l-[3px] border-[#00e59b] pl-6">
        <div>
          <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
            <LayoutList className="text-[#00e59b] mr-3" size={18} /> Appendices (Forms &amp; Templates)
          </h2>
          <p className="text-[11px] text-white/50 mt-1">GV-GB-001 — Governing Body Authority &amp; Responsibilities · Version 6.0 · 2025-07-10</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors border border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
            <ExternalLink size={13} /> Sign on Dropbox
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors border border-white/20 text-white hover:bg-white/10">
            <Printer size={13} /> Print Form
          </button>
        </div>
      </div>
      <div className="flex space-x-2 overflow-x-auto mb-6 pl-6 pb-1 custom-scrollbar">
        {apps.map(app => (
          <button key={app.id} onClick={() => setActiveApp(app.id)}
            className={`px-3 py-1.5 rounded-full font-montserrat font-bold text-[10px] uppercase tracking-wider transition-colors whitespace-nowrap ${activeApp === app.id ? 'bg-[#00e59b]/20 text-[#00e59b] border border-[#00e59b]/50' : 'text-white/50 border border-transparent hover:text-white'}`}>
            {app.label}
          </button>
        ))}
      </div>
      <div className="pl-6">
        <div className="text-center mb-8 pb-6 border-b border-white/10">
          <h3 className="font-montserrat text-2xl font-extrabold text-white mb-2">Appendix {activeApp}</h3>
          <p className="text-[#00e59b] font-montserrat uppercase tracking-widest text-[11px] font-bold">{apps.find(a => a.id === activeApp)!.title}</p>
        </div>
        {activeApp === 'A' && (
          <div className="text-white/80">
            <div className="text-[10px] text-white/30 mb-4 text-center italic tracking-wider">Care Indeed Home Health Care, Inc. · Policy GV-GB-001 · Version 6.0 · 2025-07-10</div>
            <p className="text-[11px] text-white/60 mb-6 border-l-2 border-white/20 pl-4 py-1 leading-relaxed"><strong className="text-white">Instructions:</strong> The Governing Body Chair (or designee) shall update this roster within 7 calendar days of any membership change.</p>
            <div className="overflow-x-auto border border-white/10 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    {['#','Full Legal Name','Title/Role','Voting Status','Appt Date','Term Exp','Competency Area','Email Address','OIG/SAM?'].map(h => <th key={h} className={thCls}>{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[1,2,3,4,5,6,7].map(i => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="p-3 text-white/30 text-center text-xs border-r border-white/10">{i}</td>
                      <td className="p-2 border-r border-white/10"><input className={inputCls} placeholder="Type here..." /></td>
                      <td className="p-2 border-r border-white/10"><input className={inputCls} /></td>
                      <td className="p-2 border-r border-white/10"><select className={selectCls} style={{colorScheme:'dark'}}><option className="bg-[#111]">Voting</option><option className="bg-[#111]">Non-Voting</option><option className="bg-[#111]">Advisory</option></select></td>
                      <td className="p-2 border-r border-white/10"><input type="date" className={dateCls} style={{colorScheme:'dark'}} /></td>
                      <td className="p-2 border-r border-white/10"><input type="date" className={dateCls} style={{colorScheme:'dark'}} /></td>
                      <td className="p-2 border-r border-white/10"><input className={inputCls} /></td>
                      <td className="p-2 border-r border-white/10"><input type="email" className={inputCls} /></td>
                      <td className="p-2 text-center"><input type="checkbox" className="w-4 h-4 accent-[#00e59b]" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeApp === 'B' && (
          <div className="max-w-4xl mx-auto text-white/80">
            <p className="text-[11px] text-[#e85200] mb-8 border-l-2 border-[#e85200] pl-4 py-1 leading-relaxed"><strong>Instructions:</strong> Each Governing Body member shall complete this form at the time of initial appointment; annually; and within 7 calendar days of any change.</p>
            <div className="space-y-6">
              <section>
                <h4 className="font-bold text-[11px] uppercase tracking-widest text-white/50 mb-4">Section 1 — Member Information</h4>
                <div className="grid grid-cols-2 gap-6 border border-white/10 p-6 rounded-xl">
                  {[['Full Legal Name','text'],['Title / Role on Governing Body','text'],['Date of Appointment','date']].map(([label, type]) => (
                    <div key={label}>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 block">{label}</label>
                      <input type={type} className={inputCls} style={type === 'date' ? {colorScheme:'dark'} : {}} />
                    </div>
                  ))}
                  <div className="col-span-2 flex items-center gap-6 mt-3 pt-3 border-t border-white/5 text-[12px]">
                    <span className="font-bold text-white/70">Type of Disclosure:</span>
                    {['Initial','Annual Renewal','Change in Circumstances'].map(t => (
                      <label key={t} className="flex items-center gap-2 text-white/70"><input type="radio" name="discType" className="w-4 h-4 accent-[#e85200]" /> {t}</label>
                    ))}
                  </div>
                </div>
              </section>
              <section>
                <h4 className="font-bold text-[11px] uppercase tracking-widest text-[#00e59b] mb-4">Section 2 — Attestation</h4>
                <p className="text-[11px] text-white/70 mb-8 leading-relaxed">I hereby certify that the information provided is true, complete, and accurate. I understand my ongoing obligation to disclose any new conflict and must recuse from voting on conflicted matters.</p>
                <div className="grid grid-cols-2 gap-8">
                  <div><label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Signature</label><div className="border-b border-dashed border-white/20 h-8 w-full"></div></div>
                  <div><label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Date Signed</label><input type="date" className={inputCls} style={{colorScheme:'dark'}} /></div>
                </div>
              </section>
            </div>
          </div>
        )}
        {activeApp === 'C' && (
          <div className="max-w-2xl mx-auto text-white/80">
            <div className="border border-white/10 p-8 rounded-xl mb-8">
              <p className="text-white font-bold mb-5 text-sm">I, the undersigned, acknowledge that:</p>
              <ol className="list-decimal list-outside space-y-4 text-sm ml-5 text-white/70">
                <li className="leading-relaxed pl-2">I have received and read Policy <strong className="text-white">GV-GB-001 — Governing Body Authority &amp; Responsibilities, Version 6.0</strong>, effective 2025-07-10.</li>
                <li className="leading-relaxed pl-2">I understand the responsibilities, requirements, and expectations described in this policy as they apply to my role.</li>
                <li className="leading-relaxed pl-2">I am accountable for complying with this policy and non-compliance may result in corrective action.</li>
                <li className="leading-relaxed pl-2">I have had the opportunity to ask questions and receive clarification regarding any aspect of this policy.</li>
              </ol>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
              <div><label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Full Name (Printed)</label><input className={inputCls} /></div>
              <div><label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Title / Role</label><input className={inputCls} /></div>
              <div className="col-span-2 mt-2"><label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Signature</label><div className="border-b border-dashed border-white/20 h-12 w-full"></div></div>
              <div className="col-span-2 mt-2"><label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Date Signed</label><input type="date" className={`${inputCls} w-1/2`} style={{colorScheme:'dark'}} /></div>
            </div>
          </div>
        )}
        {(activeApp === 'D' || activeApp === 'E' || activeApp === 'F' || activeApp === 'G') && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-white/40 text-[13px] font-montserrat uppercase tracking-widest">Appendix {activeApp}: {apps.find(a => a.id === activeApp)!.title}</p>
            <p className="text-white/25 text-[11px] mt-3">Available in full Demo specimen view</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── TAB: ALERTS ───────────────────────────────────────────────
function TabAlerts({ policy }: { policy: SharedPolicy }) {
  const alerts = policy.policyId === 'GV-GB-001' ? GV_ALERTS : [];
  const levelConfig = {
    critical: { border: 'border-red-500/40',    bg: 'bg-red-500/10',    badge: 'bg-red-500/20 text-red-300',      dot: 'bg-red-400',    label: 'CRITICAL' },
    warning:  { border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', badge: 'bg-yellow-500/20 text-yellow-300', dot: 'bg-yellow-400', label: 'WARNING' },
    info:     { border: 'border-blue-400/40',   bg: 'bg-blue-400/10',   badge: 'bg-blue-400/20 text-blue-300',     dot: 'bg-blue-400',   label: 'INFO' },
  } as const;
  if (!alerts.length) return (
    <div className="demo-view-enter mt-8 flex flex-col items-center justify-center py-20">
      <Bell className="text-white/20 mb-4" size={40} />
      <p className="text-white/40 text-[13px] font-montserrat uppercase tracking-widest">No Active Alerts</p>
    </div>
  );
  return (
    <div className="demo-view-enter mt-8 space-y-4">
      <h3 className="font-montserrat text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase mb-6">POLICY ALERTS — {alerts.length} ACTIVE</h3>
      {alerts.map((alert, i) => {
        const cfg = levelConfig[alert.level];
        return (
          <div key={i} className={`border rounded-xl p-5 ${cfg.border} ${cfg.bg}`}>
            <div className="flex items-start gap-4">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 animate-pulse ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase ${cfg.badge}`}>{cfg.label}</span>
                  <span className="text-white/30 text-[10px]">{alert.date}</span>
                  {alert.source && <span className="text-white/25 text-[10px] italic">{alert.source}</span>}
                </div>
                <p className="text-white font-montserrat text-[13px] font-semibold mb-2">{alert.title}</p>
                <p className="text-white/65 text-[12px] leading-relaxed">{alert.body}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── TAB: FAQ ──────────────────────────────────────────────────
function TabFAQ({ policy }: { policy: SharedPolicy }) {
  const faqs = policy.policyId === 'GV-GB-001' ? GV_FAQ : [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (!faqs.length) return (
    <div className="demo-view-enter mt-8 flex flex-col items-center justify-center py-20">
      <HelpCircle className="text-white/20 mb-4" size={40} />
      <p className="text-white/40 text-[13px] font-montserrat uppercase tracking-widest">No FAQ Entries</p>
    </div>
  );
  return (
    <div className="demo-view-enter mt-8 space-y-3">
      <h3 className="font-montserrat text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase mb-6">FREQUENTLY ASKED QUESTIONS — {faqs.length} ENTRIES</h3>
      {faqs.map((item, i) => (
        <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
          <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.03] transition-colors">
            <div className="flex items-start gap-3 min-w-0">
              <span className="text-[#00e59b] font-montserrat text-[10px] font-bold tracking-widest shrink-0 mt-0.5">Q{i + 1}</span>
              <span className="text-white/85 text-[13px] leading-snug">{item.q}</span>
            </div>
            <ChevronRight size={14} className={`text-white/30 shrink-0 ml-3 transition-transform ${openIndex === i ? 'rotate-90' : ''}`} />
          </button>
          {openIndex === i && (
            <div className="px-4 pb-4 pt-0 border-t border-white/10 bg-white/[0.02]">
              <div className="flex gap-3 pt-4">
                <span className="text-[#e85200] font-montserrat text-[10px] font-bold tracking-widest shrink-0 mt-0.5">A{i + 1}</span>
                <p className="text-white/70 text-[12px] leading-relaxed">{item.a}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── TAB: AMENDMENTS ───────────────────────────────────────────
function TabAmendments({ policy }: { policy: SharedPolicy }) {
  const amendments = policy.policyId === 'GV-GB-001' ? GV_AMENDMENTS : [];
  if (!amendments.length) return (
    <div className="demo-view-enter mt-8 flex flex-col items-center justify-center py-20">
      <Clock className="text-white/20 mb-4" size={40} />
      <p className="text-white/40 text-[13px] font-montserrat uppercase tracking-widest">No Amendment History</p>
    </div>
  );
  return (
    <div className="demo-view-enter mt-8">
      <h3 className="font-montserrat text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase mb-8">AMENDMENT LOG — {amendments.length} ENTRIES</h3>
      <div className="relative">
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-white/10" />
        <div className="space-y-6">
          {amendments.map((entry, i) => (
            <div key={i} className={`relative pl-8 ${i > 0 ? 'opacity-70 hover:opacity-90 transition-opacity' : ''}`}>
              <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 ${i === 0 ? 'border-[#00e59b] bg-[#00e59b]' : 'border-white/20 bg-white/5'}`} />
              <div className="border border-white/10 rounded-xl p-4 bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-montserrat text-[11px] font-bold text-white/90">v{entry.version}</span>
                  {i === 0 && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest bg-[#00e59b]/15 text-[#00e59b]">CURRENT</span>}
                  <span className="text-white/35 text-[10px]">{entry.date}</span>
                  <span className="text-white/35 text-[10px]">— {entry.author}</span>
                </div>
                <p className="text-white/70 text-[12px] leading-relaxed mb-2">{entry.summary}</p>
                {entry.sections && <p className="text-white/35 text-[10px]"><span className="text-white/50 font-bold">Sections: </span>{entry.sections}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT — SharedPolicyDetailView
// ══════════════════════════════════════════════════════════════

const SHARED_DOMAINS_COLOR: Record<string, string> = {
  GV: '#00c2b4', CL: '#ef4444', QA: '#06b6d4', HR: '#8b5cf6',
  CO: '#3b82f6', FN: '#10b981', OP: '#f97316', IT: '#6366f1',
  RM: '#eab308', EN: '#ec4899',
};

export function SharedPolicyDetailView({ policy, onBack }: { policy: SharedPolicy; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const isGV = policy.policyId === 'GV-GB-001';
  const domainColor = SHARED_DOMAINS_COLOR[policy.domainCode] || '#00e59b';

  const navTabs = [
    { id: 'overview',      label: 'Overview & Definitions',  icon: Target },
    { id: 'statements',    label: 'Policy Statements',       icon: List },
    { id: 'procedures',    label: 'Procedures',              icon: Settings },
    { id: 'documentation', label: 'Documentation',           icon: FileText },
    { id: 'compliance',    label: 'Compliance & Audit',      icon: CheckSquare },
    { id: 'references',    label: 'References & Admin',      icon: Archive },
    { id: 'appendices',    label: 'Appendices (Forms)',      icon: LayoutList },
    ...(isGV ? [
      { id: 'alerts',     label: 'Policy Alerts',  icon: Bell },
      { id: 'faq',        label: 'FAQ',            icon: HelpCircle },
      { id: 'amendments', label: 'Amendment Log',  icon: Clock },
    ] : []),
  ];

  return (
    <div className="demo-view-enter text-white flex flex-col h-full">
      {/* Fixed header area */}
      <div className="shrink-0 p-6 md:p-8 pb-0">
        {/* Top nav */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack}
            className="font-montserrat text-[11px] font-bold tracking-[0.2em] flex items-center gap-2 hover:opacity-80 uppercase transition-opacity"
            style={{ color: domainColor }}>
            <ChevronLeft size={16} /> BACK TO LIBRARY
          </button>
          <button className="border border-white/20 hover:bg-white/5 px-5 py-2.5 rounded-full font-bold text-[10px] tracking-[0.2em] transition-colors flex items-center gap-2 text-white uppercase font-montserrat">
            <Printer size={14} /> EXPORT
          </button>
        </div>

        {/* Policy badges */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <span className="border bg-transparent px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase font-montserrat"
            style={{ borderColor: `${domainColor}60`, color: domainColor }}>{policy.policyId}</span>
          <span className="px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase font-montserrat"
            style={{ backgroundColor: `${domainColor}20`, color: domainColor }}>{policy.status.replace('_', ' ')}</span>
          <span className="border border-white/10 bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-bold text-white/80 tracking-widest uppercase font-montserrat">{policy.classificationTier}</span>
        </div>

        {/* Title */}
        <h1 className="font-montserrat text-3xl md:text-[36px] leading-tight font-light text-white mb-8 tracking-wide">{policy.title}</h1>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 border-b border-white/10 pb-6">
          <div><span className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold font-montserrat block mb-1">Domain</span><span className="text-[12px] text-white/90 font-light">{policy.domain}</span></div>
          <div><span className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold font-montserrat block mb-1">Tier</span><span className="text-[12px] text-white/90 font-light">{policy.classificationTier}</span></div>
          <div><span className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold font-montserrat block mb-1">Approved By</span><span className="text-[12px] text-white/90 font-light">{policy.approvedBy}</span></div>
          <div><span className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold font-montserrat block mb-1">Version</span><span className="text-[12px] text-white/90 font-light">v{policy.version}</span></div>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto custom-scrollbar border-b border-white/10">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-4 font-montserrat text-[10px] font-bold tracking-[0.15em] uppercase whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === tab.id
                    ? 'text-[#00e59b] border-[#00e59b]'
                    : 'text-white/40 hover:text-white/80 border-transparent'
                }`}>
                <Icon size={13} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-6 md:px-8 pb-8">
        {activeTab === 'overview'      && <TabOverview policy={policy} />}
        {activeTab === 'statements'    && <TabStatements policy={policy} />}
        {activeTab === 'procedures'    && <TabProcedures policy={policy} />}
        {activeTab === 'documentation' && <TabDocumentation policy={policy} />}
        {activeTab === 'compliance'    && <TabCompliance policy={policy} />}
        {activeTab === 'references'    && <TabReferences policy={policy} />}
        {activeTab === 'appendices'    && <TabAppendices policy={policy} />}
        {activeTab === 'alerts'        && <TabAlerts policy={policy} />}
        {activeTab === 'faq'           && <TabFAQ policy={policy} />}
        {activeTab === 'amendments'    && <TabAmendments policy={policy} />}
      </div>
    </div>
  );
}
