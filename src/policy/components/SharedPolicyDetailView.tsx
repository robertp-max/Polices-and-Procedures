import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import {
  ChevronLeft, Printer, Download, Target, CheckCircle, BookOpen, List,
  Settings, FileText, CheckSquare, Archive, LayoutList, Bell,
  HelpCircle, Clock, Search, AlertTriangle, ChevronRight,
  ExternalLink, Landmark, Scale, FileCheck, Lock,
  Shield, ShieldCheck, Gavel, FileLock2, Award,
} from 'lucide-react';
import ciLogoGray from '@/assets/ci-logo-gray.png';
import { useShellStore } from '@/policy/stores/uiStore';
import { FormViewer } from '@/policy/components/FormViewer';
import { PolicyAppendicesPanel } from '@/policy/components/PolicyAppendicesPanel';
import { printForm } from '@/policy/utils/printForm';
import type { PolicyContentSection } from '@/policy/types';

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
  /** Full markdown body sections from allPoliciesContent.generated.ts.
   *  When present (and policyId !== 'GV-GB-001'), the detail view
   *  routes the content area through the generic generated-content
   *  renderer instead of the GV-GB-001 specimen fallbacks. */
  generatedSections?: PolicyContentSection[];
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
  ['42 CFR § 484.2', 'Definitions', "Defines 'governing body' and key terms for home health agencies.", 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484/subpart-A/section-484.2'],
  ['42 CFR § 484.105', 'CoP: Organization and Administration of Services', 'Primary regulatory basis for this policy. Requires a governing body with full legal authority for agency operation and management.', 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484/subpart-C/section-484.105'],
  ['42 CFR § 484.105(a)', 'Standard: Governing body', 'Mandates governing body responsibility for agency operations, appointment of administrator, and oversight of services.', 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484/subpart-C/section-484.105#p-484.105(a)'],
  ['42 CFR § 484.105(b)', 'Standard: Administrator', 'Requires appointment of a qualified administrator responsible to the governing body.', 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484/subpart-C/section-484.105#p-484.105(b)'],
  ['42 CFR § 484.105(c)', 'Standard: Clinical manager', 'Requires designation of a qualified clinical manager for oversight of clinical services.', 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484/subpart-C/section-484.105#p-484.105(c)'],
  ['42 CFR § 484.60', 'CoP: Care planning, coordination, and quality of care', 'Governing body accountability for ensuring care planning and quality.', 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484/subpart-B/section-484.60'],
  ['42 CFR § 484.65', 'CoP: Quality assessment and performance improvement (QAPI)', 'Governing body must ensure an effective QAPI program.', 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484/subpart-B/section-484.65'],
  ['42 CFR § 484.70', 'CoP: Infection prevention and control', 'Governing body oversight of infection prevention.', 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484/subpart-B/section-484.70'],
  ['42 CFR § 484.100', 'CoP: Compliance with Federal, State, and local laws', 'Governing body must ensure full legal compliance.', 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484/subpart-C/section-484.100'],
  ['42 CFR § 484.102', 'CoP: Emergency preparedness', 'Governing body must approve emergency preparedness plan.', 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484/subpart-C/section-484.102'],
  ['42 CFR § 484.110', 'CoP: Clinical records', 'Governing body oversight of clinical records policies.', 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484/subpart-C/section-484.110'],
];

const GV_CROSS_REFS: string[][] = [
  ['GV-OG-001', 'Organizational Structure & Reporting', 'Governing Body approves organizational structure.', 'https://example.com/policies/gv-og-001'],
  ['GV-OG-002', 'Administrator Qualifications & Responsibilities', 'Governing Body appoints and evaluates Administrator.', 'https://example.com/policies/gv-og-002'],
  ['GV-OG-003', 'Scope of Services Definition', 'Governing Body approves scope of services.', 'https://example.com/policies/gv-og-003'],
  ['GV-OG-004', 'Strategic Planning & Annual Goals', 'Governing Body approves strategic plan.', 'https://example.com/policies/gv-og-004'],
  ['GV-OG-005', 'Delegation of Authority', 'Governs limits of Governing Body delegation.', 'https://example.com/policies/gv-og-005'],
  ['GV-PM-001', 'Policy Development & Approval Process', 'Governing Body approves REQUIRED-tier policies.', 'https://example.com/policies/gv-pm-001'],
  ['GV-PM-002', 'Policy Review & Revision Cycle', 'Governing Body ensures policy review cycle.', 'https://example.com/policies/gv-pm-002'],
  ['GV-PM-003', 'Policy Acknowledgment & Staff Attestation', 'Staff acknowledgment of this and all policies.', 'https://example.com/policies/gv-pm-003'],
  ['GV-GB-002', 'Board Meeting & Minutes Requirements', 'Details meeting documentation standards.', 'https://example.com/policies/gv-gb-002'],
  ['GV-GB-003', 'Conflict of Interest Disclosure', 'Governs member conflict disclosures.', 'https://example.com/policies/gv-gb-003'],
  ['GV-GB-004', 'Succession Planning for Key Leadership', 'Governing Body reviews succession plan.', 'https://example.com/policies/gv-gb-004'],
  ['GV-GB-005', 'Annual Governance Self-Assessment', 'Governing Body self-assessment tool.', 'https://example.com/policies/gv-gb-005'],
  ['GV-EA-004', 'Agency Licensure & Certification Maintenance', 'Governing Body ensures licensure/certification currency.', 'https://example.com/policies/gv-ea-004'],
  ['GV-EA-005', 'Agency Closure or Change of Ownership', 'Governing Body directs CHOW process.', 'https://example.com/policies/gv-ea-005'],
  ['QA-PG-001', 'QAPI Program Establishment & Governance', 'Governing Body oversees QAPI program.', 'https://example.com/policies/qa-pg-001'],
  ['QA-PG-002', 'QAPI Plan Development & Annual Review', 'Governing Body approves QAPI plan.', 'https://example.com/policies/qa-pg-002'],
  ['QA-AE-003', 'Corrective Action Plan Development & Tracking', 'Escalation path for governance deficiencies.', 'https://example.com/policies/qa-ae-003'],
  ['QA-SM-004', 'Home Health Compare & Star Rating Monitoring', 'Data reported to Governing Body quarterly.', 'https://example.com/policies/qa-sm-004'],
  ['CO-CP-001', 'Corporate Compliance Program', 'Governing Body oversees compliance program.', 'https://example.com/policies/co-cp-001'],
  ['CO-CP-002', 'Compliance Officer Designation & Authority', 'Governing Body appoints Compliance Officer.', 'https://example.com/policies/co-cp-002'],
  ['CO-CP-005', 'Whistleblower Protection & Non-Retaliation', 'Governing Body ensures non-retaliation.', 'https://example.com/policies/co-cp-005'],
  ['CO-CP-007', 'Compliance Investigation Process', 'Governing Body directs investigations.', 'https://example.com/policies/co-cp-007'],
  ['CO-HP-007', 'Record Retention & Destruction', 'Retention standards for governance records.', 'https://example.com/policies/co-hp-007'],
  ['FN-FP-005', 'Annual Budget & Financial Planning', 'Governing Body approves budget.', 'https://example.com/policies/fn-fp-005'],
  ['HR-TA-003', 'OIG/SAM Exclusion Screening', 'Screening of Governing Body members.', 'https://example.com/policies/hr-ta-003'],
  ['OP-FM-005', 'Emergency Operations & Business Continuity', 'Governing Body approves emergency plan.', 'https://example.com/policies/op-fm-005'],
  ['EN-TG-001', 'Enterprise Policy Taxonomy & Classification Governance', 'Framework under which this policy is classified.', 'https://example.com/policies/en-tg-001'],
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
  { term: 'Lifecycle Status', definition: 'The current state of the policy in the governance lifecycle: DRAFT, REVIEW, APPROVED, PUBLISHED, or ARCHIVED.' },
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

// ── DESIGN SYSTEM HELPERS (matching PolicyViewerDesignLight.html) ─────────────

function DSectionTitle({ icon: Icon, title, color = 'text-[#1F1C1B]' }: { icon?: React.ElementType; title: string; color?: string }) {
  return (
    <h2 className={`font-montserrat font-semibold text-[13px] tracking-[0.22em] uppercase mb-8 flex items-center gap-4 w-full ${color}`}>
      {Icon && <Icon className="shrink-0 text-[#007970]" size={20} />}
      <span className="shrink-0">{title}</span>
      <span className="flex-grow h-px bg-[#007970]" />
    </h2>
  );
}

function DSimpleTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="w-full mb-6 break-inside-avoid shadow-sm rounded-lg overflow-hidden border border-[#E5E4E3]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="py-4 px-3 font-montserrat font-semibold text-[11px] tracking-[0.12em] uppercase text-[#524048] border-b border-[#E5E4E3]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E4E3]">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-[#FAFBF8] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`py-4 px-3 text-[#1F1C1B] font-roboto text-[14px] align-top leading-relaxed break-words whitespace-normal ${j === 0 ? 'font-medium' : ''}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── GENERIC GENERATED-CONTENT RENDERING ───────────────────────
// For non-GV-GB-001 policies, content is sourced from the
// extracted_full markdown corpus (allPoliciesContent.generated.ts).
// These helpers render markdown-bodied sections using the same
// brand-aligned chrome as the GV-GB-001 specimen tabs.

/** Map a raw section.order (from the generated content) to one of the
 *  seven shell tabs. Mirrors the mapping used in PolicyDetailPage. */
function mapOrderToTab(order: number): string {
  if (order === 1) return '__skip__';
  if (order >= 2 && order <= 6) return 'overview';
  if (order >= 7 && order <= 18) return 'procedures';
  if (order === 19) return 'documentation';
  if (order >= 20 && order <= 23) return 'compliance';
  if (order >= 24 && order <= 28) return 'references';
  if (order >= 29 && order <= 30) return 'references';
  return 'appendices';
}

function cleanGenericTitle(raw: string): string {
  return raw.replace(/\\\./g, '.').replace(/\\/g, '').trim();
}

function GenericGfmTable({ text }: { text: string }) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines[0]?.startsWith('|')) return null;
  const parseRow = (line: string) =>
    line.split('|').map(c => c.trim().replace(/\\_/g, '_')).filter((_, i, a) => i > 0 && i < a.length - 1);
  const headers = parseRow(lines[0]);
  const dataLines = lines.slice(2);
  return (
    <div className="w-full mb-6 break-inside-avoid shadow-sm rounded-lg overflow-hidden border border-[#E5E4E3] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="py-4 px-3 font-montserrat font-semibold text-[11px] tracking-[0.12em] uppercase text-[#524048] border-b border-[#E5E4E3] bg-[#FAFBF8]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E4E3]">
            {dataLines.map((row, i) => (
              <tr key={i} className="hover:bg-[#FAFBF8] transition-colors">
                {parseRow(row).map((cell, j) => (
                  <td key={j} className={`py-4 px-3 text-[#1F1C1B] font-roboto text-[14px] align-top leading-relaxed break-words whitespace-normal ${j === 0 ? 'font-medium' : ''}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GenericMarkdownBody({ text }: { text: string }) {
  if (!text || text.trim() === '---') return null;
  return (
    <div className="space-y-3">
      {text.split(/\n\n+/).map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed || trimmed === '---') return null;
        if (trimmed.startsWith('|') && trimmed.includes('\n')) return <GenericGfmTable key={i} text={trimmed} />;
        if (/^#{3,6}\s/.test(trimmed)) {
          const heading = trimmed.replace(/^#+\s+/, '').replace(/\\\./g, '.').replace(/\\/g, '');
          return <h4 key={i} className="font-montserrat font-semibold text-[14px] text-[#1F1C1B] mt-6 mb-3">{heading}</h4>;
        }
        if (/^[*\-] /m.test(trimmed)) {
          const items = trimmed.split('\n').map(l => l.replace(/^[*\-]\s+/, '').trim()).filter(Boolean);
          return (
            <ul key={i} className="list-disc pl-6 space-y-2">
              {items.map((item, j) => <li key={j} className="font-roboto text-[15px] text-[#1F1C1B] leading-relaxed">{item}</li>)}
            </ul>
          );
        }
        return <p key={i} className="font-roboto text-[15px] leading-relaxed text-[#1F1C1B]">{trimmed}</p>;
      })}
    </div>
  );
}

/** Renders a single generated-content section inside the carousel. */
function GenericSectionPanel({ section }: { section: import('@/policy/types').PolicyContentSection }) {
  const cleanTitle = cleanGenericTitle(section.title);
  const isEmpty = !section.body || section.body.trim() === '' || section.body.trim() === '---';

  return (
    <section className="break-inside-avoid bg-white rounded-2xl border border-[#E5E4E3] shadow-sm p-6 md:p-8">
      <DSectionTitle title={cleanTitle} />
      {isEmpty
        ? <p className="font-roboto text-[13px] italic text-[#9E9D9A]">No additional detail in this section.</p>
        : <GenericMarkdownBody text={section.body} />}
    </section>
  );
}

// ── SECTION CARD WRAPPER ──────────────────────────────────────
// Fully transparent container — no background, no border.
// Shown one at a time via sectionIdx-based rendering.
function SCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[1000px] break-inside-avoid">
      {children}
    </div>
  );
}

// ── TAB: OVERVIEW — one section at a time (sectionIdx 0-3) ────
function TabOverview({ policy, sectionIdx = 0 }: { policy: SharedPolicy; sectionIdx?: number }) {
  const isGV = policy.policyId === 'GV-GB-001';
  const purposeText = isGV ? GV_PURPOSE : policy.purpose;
  const scopeItems  = isGV ? GV_SCOPE    : policy.scope;
  const defs        = isGV ? GV_DEFINITIONS : GENERIC_DEFS;
  // ── SECTION 0: Policy header + metadata ──
  if (sectionIdx === 0) return (
    <SCard>
      <h1 className="font-montserrat font-semibold text-[28px] md:text-[32px] leading-tight text-[#1F1C1B] mb-1">
        {policy.title}
      </h1>
      <p className="font-montserrat font-medium text-[11px] text-[#007970] tracking-[0.22em] uppercase mb-8">
        Policy ID: {policy.policyId}
      </p>
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-7">
        {([
          ['Domain',              policy.domain],
          ['Subdomain',           policy.subdomain],
          ['Classification Tier', policy.classificationTier],
          ['Status',              policy.status.replace('_', ' ')],
          ['Policy Owner',        policy.policyOwner],
          ['Version',             `v${policy.version}`],
          ['Effective Date',      policy.effectiveDate],
          ['Approved By',         policy.approvedBy],
          ['Last Reviewed',       policy.effectiveDate],
          ['Next Review Date',    policy.nextReviewDate],
        ] as [string, string][]).map(([k, v]) => (
          <div key={k} className="flex flex-col">
            <dt className="font-montserrat font-semibold text-[10px] text-[#52404B] tracking-[0.16em] uppercase mb-1">{k}</dt>
            <dd className="font-roboto text-[14px] text-[#1F1C1B]">{v}</dd>
          </div>
        ))}
      </dl>
    </SCard>
  );

  // ── SECTION 1: Purpose ──
  if (sectionIdx === 1) return (
    <SCard>
      <DSectionTitle icon={Target} title="2. Purpose" />
      <p className="text-[#1F1C1B] font-roboto leading-relaxed text-[15px]">{purposeText}</p>
    </SCard>
  );

  // ── SECTION 2: Scope ──
  if (sectionIdx === 2) return (
    <SCard>
      <DSectionTitle icon={Search} title="3. Scope" />
      <p className="text-[#1F1C1B] font-roboto font-bold mb-4 text-[15px]">This policy applies to:</p>
      <ul className="space-y-4 mb-8">
        {scopeItems.map((item, i) => (
          <li key={i} className="flex items-start">
            <CheckCircle className="text-[#007970] mr-3 mt-0.5 flex-shrink-0" size={18} />
            <span className="text-[#1F1C1B] font-roboto text-[15px] leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
      <div className="border-l-[3px] border-[#C74601] pl-5 py-2">
        <p className="font-roboto text-[#C74601] text-[14px] font-medium leading-relaxed">
          {isGV
            ? 'This policy does not apply to day-to-day clinical or operational staff except to the extent that Governing Body decisions establish requirements, standards, or directives that govern their work.'
            : 'This policy does not apply to day-to-day clinical or operational staff except to the extent that decisions establish requirements, standards, or directives that govern their work.'}
        </p>
      </div>
    </SCard>
  );

  // ── SECTION 3: Definitions ──
  return (
    <SCard>
      <DSectionTitle icon={BookOpen} title="5. Definitions" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 pt-2">
        {defs.map((def, i) => (
          <div key={i} className="flex flex-col">
            <h4 className="font-montserrat font-semibold text-[#1F1C1B] mb-3 text-[13px] tracking-[0.12em] uppercase">
              {def.term}
            </h4>
            <p className="text-[#524048] font-roboto text-[14px] leading-relaxed">{def.definition}</p>
          </div>
        ))}
      </div>
    </SCard>
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
    <SCard>
      <DSectionTitle icon={List} title="4. Policy Statement" />
      <div className="flex flex-col space-y-6">
        {stmts.map((stmt, i) => (
          <div key={i} className="flex items-start">
            <div className="text-[#007970] font-semibold font-montserrat w-16 flex-shrink-0 text-[14px] pt-[2px]">4.{i + 1}</div>
            <p className="text-[#1F1C1B] font-roboto leading-relaxed text-[15px] whitespace-pre-line">{stmt}</p>
          </div>
        ))}
      </div>
    </SCard>
  );
}

// ── TAB: PROCEDURES — one sub-section per card ────────────────
// GV-GB-001: sIdx 0=6.1 · 1=6.2+6.2.1 · 2-6=6.2.2-6.2.6 · 7=6.3 · 8=6.4 · 9=6.5
// Non-GV:    sIdx 0=6.1 only
function TabProcedures({ policy, sectionIdx = 0 }: { policy: SharedPolicy; sectionIdx?: number }) {
  const isGV = policy.policyId === 'GV-GB-001';

  // ── 6.1 Establishment and Composition ──
  if (sectionIdx === 0) return (
    <SCard>
      <DSectionTitle icon={Settings} title="6.1 Establishment and Composition" />
      <DSimpleTable
        headers={['Step', 'Responsible Party', 'Action', 'Timeframe']}
        rows={isGV ? GV_PROC_61 : [
          ['6.1.1', 'Policy Owner', `Maintain and review ${policy.policyId} per the established review cycle.`, 'As per review cycle.'],
          ['6.1.2', 'Compliance Officer', 'Verify regulatory cross-references are current and accurate.', 'Within 30 days of regulatory change.'],
          ['6.1.3', 'Administrator', 'Ensure all personnel within scope have acknowledged this policy and completed required training.', 'Within 14 calendar days of effective date.'],
          ['6.1.4', 'QA Designee', 'Monitor compliance indicators and report deviations through the QAPI program.', 'Quarterly.'],
          ['6.1.5', 'All Staff in Scope', 'Comply with all requirements of this policy.', 'Continuous.'],
        ]}
      />
    </SCard>
  );

  // ── 6.2 intro card — main header + callout + 6.2.1 first sub-section ──
  if (sectionIdx === 1) return (
    <SCard>
      <DSectionTitle icon={Settings} title="6.2 Core Responsibilities" />
      <div className="border-l-[3px] border-[#C74601] pl-5 py-2 mb-10">
        <p className="font-roboto text-[#C74601] text-[14px] font-medium leading-relaxed">
          The Governing Body of Care Indeed Home Health Care, Inc. shall fulfill the following responsibilities directly and shall <strong className="font-bold text-[#1F1C1B]">not delegate ultimate accountability</strong> for any of these functions.
        </p>
      </div>
      {isGV && GV_PROC_62[0] && (
        <>
          <h3 className="font-montserrat font-semibold text-[15px] text-[#1F1C1B] mb-6">{GV_PROC_62[0].title}</h3>
          <DSimpleTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={GV_PROC_62[0].rows} />
        </>
      )}
    </SCard>
  );

  // ── 6.2.2 – 6.2.6 individual sub-section cards (sIdx 2–6 → GV_PROC_62[1–5]) ──
  if (sectionIdx >= 2 && sectionIdx <= 6) {
    const sub = isGV ? GV_PROC_62[sectionIdx - 1] : null;
    if (!sub) return null;
    return (
      <SCard>
        <h3 className="font-montserrat font-semibold text-[15px] text-[#1F1C1B] mb-6">{sub.title}</h3>
        <DSimpleTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={sub.rows} />
      </SCard>
    );
  }

  // ── 6.3 Governing Body Meetings ──
  if (sectionIdx === 7) return (
    <SCard>
      <DSectionTitle icon={Settings} title="6.3 Governing Body Meetings" />
      <DSimpleTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={isGV ? GV_PROC_63 : []} />
    </SCard>
  );

  // ── 6.4 Conflict of Interest Management ──
  if (sectionIdx === 8) return (
    <SCard>
      <DSectionTitle icon={Settings} title="6.4 Conflict of Interest Management" />
      <DSimpleTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={isGV ? GV_PROC_64 : []} />
    </SCard>
  );

  // ── 6.5 Escalation and Exception Handling ──
  return (
    <SCard>
      <h3 className="font-montserrat font-semibold text-[15px] text-[#C74601] mb-6 flex items-center gap-3">
        <AlertTriangle size={20} /> 6.5 Escalation and Exception Handling
      </h3>
      <DSimpleTable headers={['Condition', 'Escalation Path', 'Corrective Action', 'Timeframe']} rows={isGV ? GV_PROC_65 : []} />
    </SCard>
  );
}

// ── TAB: DOCUMENTATION ────────────────────────────────────────
function TabDocumentation({ policy }: { policy: SharedPolicy }) {
  const isGV = policy.policyId === 'GV-GB-001';
  return (
    <SCard>
      <DSectionTitle icon={FileText} title="7. Documentation Requirements" />
      <DSimpleTable
        headers={['Requirement', 'Document / Record', 'Responsible Party', 'Location', 'Timeframe']}
        rows={isGV ? GV_DOCS_REQ : [
          ['Policy acknowledgment', 'Signed acknowledgment by all personnel within scope.', 'Administrator (collection)', 'Policy acknowledgment file', 'Within 14 calendar days of effective date.'],
          ['Version control record', 'Version history reflecting all substantive and non-substantive revisions.', 'Policy Owner', 'Policy management system', 'Updated with each revision.'],
          ['Regulatory cross-reference map', 'Current mapping of policy to applicable regulations.', 'Compliance Officer', 'Compliance records', 'Maintained continuously; verified quarterly.'],
          ['Training completion records', 'Documentation of required training for all in-scope personnel.', 'HR / Training Coordinator', 'Personnel files', 'Within 14 calendar days of policy effective date.'],
          ['Compliance audit results', 'Results of internal audits measuring compliance with this policy.', 'QA Designee', 'QAPI records', 'Quarterly; retained for minimum 7 years.'],
        ]}
      />
    </SCard>
  );
}

// ── TAB: COMPLIANCE — one section at a time (sectionIdx 0-2) ──
function TabCompliance({ policy, sectionIdx = 0 }: { policy: SharedPolicy; sectionIdx?: number }) {
  const isGV = policy.policyId === 'GV-GB-001';

  if (sectionIdx === 0) return (
    <SCard>
      <DSectionTitle icon={CheckSquare} title="8. Compliance & Audit" />
      <h3 className="font-montserrat font-semibold text-[15px] text-[#1F1C1B] mb-6">8.1 How Compliance Is Measured</h3>
      <DSimpleTable
        headers={['Compliance Indicator', 'Measurement Method', 'Acceptable Standard']}
        rows={isGV ? GV_COMPLIANCE_81 : [
          ['Policy is current and approved.', 'Review of version control record and approval documentation.', 'Current version on file at all times.'],
          ['All personnel acknowledged.', 'Review of signed acknowledgment forms.', '100% acknowledgment within 14 calendar days.'],
          ['Regulatory mappings are current.', 'Review of cross-reference documentation.', 'Updated within 30 days of any regulatory change.'],
          ['Compliance monitoring active.', 'Review of QAPI reports and audit logs.', 'Quarterly monitoring with documented results.'],
        ]}
      />
    </SCard>
  );

  if (sectionIdx === 1) return (
    <SCard>
      <DSectionTitle icon={Search} title="8.2 Surveyor Expectations" />
      <p className="text-[15px] text-[#1F1C1B] mb-8 font-roboto leading-relaxed">
        CMS surveyors conducting a standard survey under SOM Appendix B will specifically verify:
      </p>
      <div className="flex flex-col space-y-6 pt-2">
        {(isGV ? GV_COMPLIANCE_82 : [
          'Policy is current and approved per the established review cycle.',
          'All in-scope personnel have acknowledged the policy within required timeframes.',
          'Regulatory cross-references are accurate and current.',
          'Compliance monitoring is active and documented quarterly.',
        ]).map((text, i) => (
          <div key={i} className="flex items-start">
            <div className="text-[#007970] font-semibold font-montserrat w-10 flex-shrink-0 text-[14px] pt-[2px]">{i + 1}.</div>
            <p className="text-[#1F1C1B] font-roboto leading-relaxed text-[15px]">{text}</p>
          </div>
        ))}
      </div>
    </SCard>
  );

  return (
    <SCard>
      <DSectionTitle icon={AlertTriangle} title="8.3 Common Failure Points" color="text-[#C74601]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {(isGV ? GV_COMPLIANCE_83 : [
          ['Policy not reviewed within cycle.', 'Surveyor may cite outdated policy as non-compliance.', 'Set calendar reminders and track review dates in enterprise system.'],
          ['Staff acknowledgments incomplete.', 'Surveyor will cite failure to ensure staff awareness.', 'Automated tracking with escalation for non-compliance within 7 days.'],
          ['Regulatory cross-references outdated.', 'Policy may not reflect current requirements.', 'Compliance Officer monitors regulatory changes and updates mappings proactively.'],
        ]).map((item, i) => (
          <div key={i} className="border-l-[3px] border-[#C74601] pl-5 py-2">
            <p className="font-semibold font-montserrat text-[#1F1C1B] text-[13px] uppercase tracking-[0.1em] mb-2">{item[0]}</p>
            <p className="text-[14px] font-roboto text-[#524048] mb-2"><strong>Risk:</strong> {item[1]}</p>
            <p className="text-[14px] font-roboto text-[#007970]"><strong>Mitigation:</strong> {item[2]}</p>
          </div>
        ))}
      </div>
    </SCard>
  );
}

// ── TAB: REFERENCES — one section at a time (sectionIdx 0-3) ──
function TabReferences({ policy, sectionIdx = 0 }: { policy: SharedPolicy; sectionIdx?: number }) {
  const isGV = policy.policyId === 'GV-GB-001';

  if (sectionIdx === 0) return (
    <SCard>
      <DSectionTitle icon={Archive} title="9. References & Administration" />
      <h3 className="font-montserrat font-semibold text-[15px] text-[#1F1C1B] mb-6">9.1 Federal Regulations (42 CFR Part 484)</h3>
      <DSimpleTable
        headers={['Citation', 'Title', 'Relevance']}
        rows={(isGV ? GV_FEDERAL_REFS : [
          ['42 CFR § 484.105', 'Organization and Administration of Services', 'Primary regulatory basis for governance policies.', 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484/subpart-C/section-484.105'],
          ['42 CFR § 484.65', 'CoP: Quality assessment and performance improvement (QAPI)', 'Quality assessment and performance improvement requirements.', 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484/subpart-B/section-484.65'],
          ['42 CFR § 484.100', 'CoP: Compliance with Federal, State, and local laws', 'Federal, state, and local law compliance.', 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484/subpart-C/section-484.100'],
          ['42 CFR § 484.102', 'CoP: Emergency preparedness', 'Emergency plan approval and oversight.', 'https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-484/subpart-C/section-484.102'],
        ]).map(row => [
          <a href={row[3]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#007970] font-semibold font-montserrat hover:underline whitespace-nowrap">
            {row[0]} <ExternalLink size={13} className="flex-shrink-0" />
          </a>,
          row[1],
          row[2],
        ])}
      />
    </SCard>
  );

  if (sectionIdx === 1) return (
    <SCard>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <div>
          <DSectionTitle icon={Archive} title="9.2 CMS Guidance" />
          {GV_CMS_GUIDANCE_ROWS.map(([doc, relevance], i) => (
            <div key={i} className="mb-8 last:mb-0">
              <p className="font-semibold font-montserrat text-[13px] text-[#1F1C1B] uppercase tracking-[0.1em]">{doc}</p>
              <p className="text-[14px] font-roboto text-[#524048] mt-2 leading-relaxed">{relevance}</p>
            </div>
          ))}
        </div>
        <div>
          <DSectionTitle icon={Archive} title="9.3 OIG Guidance" />
          {GV_OIG_GUIDANCE_ROWS.map(([doc, relevance], i) => (
            <div key={i} className="mb-8 last:mb-0">
              <p className="font-semibold font-montserrat text-[13px] text-[#1F1C1B] uppercase tracking-[0.1em]">{doc}</p>
              <p className="text-[14px] font-roboto text-[#524048] mt-2 leading-relaxed">{relevance}</p>
            </div>
          ))}
        </div>
      </div>
    </SCard>
  );

  if (sectionIdx === 2) return (
    <SCard>
      <DSectionTitle icon={Archive} title="9.4 Cross-Referenced Agency Policies" />
      <DSimpleTable
        headers={['Policy ID', 'Policy Title', 'Relationship']}
        rows={(isGV ? GV_CROSS_REFS : [
          ['GV-PM-001', 'Policy Development & Approval Process', 'Governing Body approves REQUIRED-tier policies.', 'https://example.com/policies/gv-pm-001'],
          ['GV-PM-002', 'Policy Review & Revision Cycle', 'Governing Body ensures policy review cycle.', 'https://example.com/policies/gv-pm-002'],
          ['EN-TG-001', 'Enterprise Policy Taxonomy & Classification', 'Framework under which this policy is classified.', 'https://example.com/policies/en-tg-001'],
          ['EN-LC-001', 'Policy Lifecycle Management & Version Control', 'Policy lifecycle governance.', 'https://example.com/policies/en-lc-001'],
          ['CO-CP-001', 'Corporate Compliance Program', 'Governing Body oversees compliance program.', 'https://example.com/policies/co-cp-001'],
          ['QA-PG-001', 'QAPI Program Establishment & Governance', 'Governing Body oversees QAPI program.', 'https://example.com/policies/qa-pg-001'],
        ]).map(row => [
          <a href={row[3]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#007970] font-semibold font-montserrat hover:underline whitespace-nowrap">
            {row[0]} <ExternalLink size={13} className="flex-shrink-0" />
          </a>,
          row[1],
          row[2],
        ])}
      />
    </SCard>
  );

  // sectionIdx === 3: Training + Version Control
  return (
    <SCard>
      <div className="space-y-16">
        <div>
          <DSectionTitle icon={Award} title="10. Training Requirements" />
        <div className="flex flex-col space-y-6 pt-2">
          {[
            'All Governing Body members of Care Indeed Home Health Care, Inc. shall receive orientation to this policy within 14 calendar days of appointment. Orientation shall be conducted by the Administrator or Compliance Officer and must cover: (a) the legal authority and responsibilities of the Governing Body; (b) meeting and quorum requirements; (c) conflict of interest obligations; (d) QAPI, compliance, and financial oversight expectations; (e) CMS survey process and surveyor expectations for governance documentation.',
            'All Governing Body members and senior leadership personnel within scope of this policy (Section 3) shall sign the Policy Acknowledgment Form (Appendix C) within 14 calendar days of the policy effective date, any revision, or new appointment.',
            'The Administrator shall maintain a tracking log of all policy acknowledgments and report any non-compliance to the Governing Body Chair within 7 calendar days of the acknowledgment deadline. Failure to acknowledge within the required timeframe shall result in written notification from the Governing Body Chair with a mandatory completion deadline of 7 additional calendar days.',
            'Annual refresher training on governing body responsibilities shall be conducted at the first quarterly meeting of each calendar year. Attendance shall be documented in meeting minutes.',
          ].map((text, i) => (
            <div key={i} className="flex items-start">
              <div className="text-[#007970] font-semibold font-montserrat w-12 flex-shrink-0 text-[14px] pt-[2px]">{i + 1}.</div>
              <p className="text-[#1F1C1B] font-roboto leading-relaxed text-[15px]">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 11. Version Control ── */}
      <div>
        <DSectionTitle icon={FileLock2} title="11. Version Control" />
        <div className="flex flex-col space-y-6 pt-2">
          {[
            "This policy is maintained under the agency's enterprise policy lifecycle management system per policy EN-LC-001.",
            'Only the most current approved version of this policy, as reflected in the policy header, is valid for any operational, compliance, or regulatory purpose. All superseded versions must be archived and clearly marked as "SUPERSEDED — NOT FOR USE."',
            'Any substantive revision to this policy requires: (a) review and approval by the Governing Body, documented in meeting minutes; (b) re-acknowledgment by all personnel within scope, within 14 calendar days of the revised effective date; (c) update to the enterprise policy index per EN-TG-001.',
            'Non-substantive revisions (formatting, typographical corrections, updated cross-references) may be approved by the Administrator with notification to the Governing Body at the next regular meeting. Non-substantive revisions do not require re-acknowledgment.',
          ].map((text, i) => (
            <div key={i} className="flex items-start">
              <div className="text-[#007970] font-semibold font-montserrat w-12 flex-shrink-0 text-[14px] pt-[2px]">{i + 1}.</div>
              <p className="text-[#1F1C1B] font-roboto leading-relaxed text-[15px]">{text}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </SCard>
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
      <div className="demo-view-enter mt-8">
        <PolicyAppendicesPanel policyId={policy.policyId} />
      </div>
    );
  }
  const APPENDIX_FORM_MAP: Record<string, string> = {
    A: 'GV-FM-011', B: 'GV-FM-006', C: 'GV-FM-024',
    D: 'GV-FM-005', E: 'GV-FM-008', F: 'GV-FM-004', G: 'GV-FM-003',
  };

  return (
    <section className="flex flex-col md:flex-row gap-12 animate-fadeIn relative pb-12 max-w-[1200px]">

      {/* LEFT SIDEBAR MENU */}
      <div className="w-full md:w-64 flex-shrink-0 no-print">
        <div className="sticky top-6">
          <h2 className="font-montserrat font-semibold text-[13px] tracking-[0.22em] uppercase text-[#1F1C1B] mb-6 flex items-center w-full">
            <LayoutList className="mr-3 shrink-0 text-[#007970]" size={20} />
            <span className="shrink-0">Appendices</span>
            <span className="flex-grow h-px bg-[#007970] ml-4" />
          </h2>
          <div className="flex flex-col">
            {apps.map(app => (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id)}
                className={`text-left px-4 py-3 font-montserrat font-semibold text-[13px] transition-all duration-200 border-l-[3px] ${
                  activeApp === app.id
                    ? 'text-[#C74601] border-[#C74601] bg-white'
                    : 'bg-white text-[#524048] border-transparent hover:text-[#1F1C1B] hover:border-[#E5E4E3]'
                }`}
              >
                {app.label}
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => window.open('https://sign.dropbox.com', '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2 text-blue-600 font-montserrat font-semibold text-[12px] hover:underline transition-all"
            >
              <ExternalLink size={14} /> Sign on Dropbox
            </button>
            <button onClick={() => printForm(APPENDIX_FORM_MAP[activeApp])} className="flex items-center gap-2 text-[#524048] font-montserrat font-semibold text-[12px] hover:text-[#1F1C1B] transition-colors">
              <Printer size={14} /> Print Form
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — FormViewer, no card border, scroll with fade */}
      <div className="appendices-panel flex-1 relative min-h-[600px] max-h-[80vh] overflow-hidden rounded-[8px]">
        {/* Fade in from top */}
        <div className="pointer-events-none absolute top-0 inset-x-0 h-20 z-10 no-print"
          style={{ background: 'linear-gradient(to bottom, white 0%, transparent 100%)' }} />
        {/* Scrollable form content */}
        <div className="appendices-scroll w-full h-full overflow-y-auto">
          <FormViewer formId={APPENDIX_FORM_MAP[activeApp]} enableEmbeddedSigning />
        </div>
        {/* Fade out at bottom */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-20 z-10 no-print"
          style={{ background: 'linear-gradient(to top, white 0%, transparent 100%)' }} />
      </div>

    </section>
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

function PrintMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[9.5px] uppercase tracking-[0.14em] text-[#524048] font-montserrat font-bold mb-0.5">{label}</span>
      <strong className="text-[13px] font-roboto font-medium text-[#1F1C1B]">{value}</strong>
    </div>
  );
}

function PolicyPrintDocument({ policy, isGV }: { policy: SharedPolicy; isGV: boolean }) {
  const procedureSections = isGV ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [0];
  const appendixForms = isGV
    ? [
        { id: 'A', title: 'Appendix A — Governing Body Membership Roster', formId: 'GV-FM-011' },
        { id: 'B', title: 'Appendix B — Conflict of Interest Form', formId: 'GV-FM-006' },
        { id: 'C', title: 'Appendix C — Policy Acknowledgment Form', formId: 'GV-FM-024' },
        { id: 'D', title: 'Appendix D — Meeting Minutes Template', formId: 'GV-FM-005' },
        { id: 'E', title: 'Appendix E — Quarterly Oversight Checklist', formId: 'GV-FM-008' },
        { id: 'F', title: 'Appendix F — Annual Calendar', formId: 'GV-FM-004' },
        { id: 'G', title: 'Appendix G — Agency Organizational Chart', formId: 'GV-FM-003' },
      ]
    : [];

  return (
    <div className="policy-print-only">
      <div className="pt-24 pb-12 flex justify-center w-full print:pt-0 print:pb-0">
        <div className="print-document bg-white w-full max-w-[850px] shadow-lg px-12 py-16 text-[#1F1C1B]">
          <div className="border-b-2 border-[#007970] pb-8 mb-10 break-after-avoid">
            <div className="flex items-start justify-between mb-6">
              <img
                src={ciLogoGray}
                alt="Care Indeed — The Heart of Home Health"
                className="h-10 w-auto select-none"
                draggable={false}
              />
              <div className="text-right">
                <p className="font-montserrat font-bold text-[10px] uppercase tracking-[0.18em] text-[#524048] mb-1">Corporate Policy Document</p>
                <p className="font-montserrat text-[11px] text-[#524048]">Care Indeed Home Health Care, Inc.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-[#007970] border border-[#007970]/30 bg-[#E5FEFF] px-2.5 py-0.5 rounded-full text-[10px] font-montserrat font-bold uppercase tracking-[0.12em]">{policy.policyId}</span>
              <span className="text-white bg-[#007970] px-2.5 py-0.5 rounded-full text-[10px] font-montserrat font-bold uppercase tracking-[0.12em]">{policy.status.replace('_', ' ')}</span>
              <span className="text-[#524048] border border-[#E5E4E3] bg-white px-2.5 py-0.5 rounded-full text-[10px] font-montserrat font-bold uppercase tracking-[0.12em]">{policy.classificationTier}</span>
            </div>

            <h1 className="font-montserrat font-light text-[32px] leading-tight text-[#1F1C1B] mb-6 tracking-tight">{policy.title}</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 border-t border-[#E5E4E3] pt-5">
              <PrintMeta label="Version" value={`v${policy.version}`} />
              <PrintMeta label="Effective" value={policy.effectiveDate} />
              <PrintMeta label="Last Reviewed" value={policy.effectiveDate} />
              <PrintMeta label="Next Review" value={policy.nextReviewDate} />
              <PrintMeta label="Policy Owner" value={policy.policyOwner} />
              <PrintMeta label="Subdomain" value={policy.subdomain} />
              <div className="col-span-2"><PrintMeta label="Domain" value={policy.domain} /></div>
              <div className="col-span-2"><PrintMeta label="Approved By" value={policy.approvedBy} /></div>
            </div>
          </div>

          <div className="mb-8 break-inside-avoid"><TabOverview policy={policy} sectionIdx={1} /></div>
          <div className="mb-8 break-inside-avoid"><TabOverview policy={policy} sectionIdx={2} /></div>
          <div className="mb-8"><TabStatements policy={policy} /></div>
          <div className="mb-8"><TabOverview policy={policy} sectionIdx={3} /></div>
          <div className="mb-8"><TabProcedures policy={policy} sectionIdx={procedureSections[0]} /></div>
          {procedureSections.slice(1).map((idx) => (
            <div key={idx} className="mb-8"><TabProcedures policy={policy} sectionIdx={idx} /></div>
          ))}
          <div className="mb-8"><TabDocumentation policy={policy} /></div>

          <div className="mb-8 page-break">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="mb-8"><TabCompliance policy={policy} sectionIdx={idx} /></div>
            ))}
          </div>

          <div className="mb-8 page-break">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="mb-8"><TabReferences policy={policy} sectionIdx={idx} /></div>
            ))}
          </div>

          <div className="mb-8 page-break">
            <DSectionTitle icon={LayoutList} title="Appendices" />
            {!isGV && (
              <p className="text-sm font-roboto text-[#524048]">
                No appendices are mapped to this policy.
              </p>
            )}
          </div>

          {appendixForms.map((appx) => (
            <section key={appx.id} className="appendix">
              <h3 className="font-montserrat font-bold text-sm text-[#524048] uppercase mb-4 break-after-avoid">{appx.title}</h3>
              <div className="break-inside-avoid border border-[#E5E4E3] rounded-lg p-5">
                <FormViewer formId={appx.formId} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT — SharedPolicyDetailView
// ══════════════════════════════════════════════════════════════

export function SharedPolicyDetailView({ policy, onBack, embedded = false }: { policy: SharedPolicy; onBack?: () => void; embedded?: boolean }) {
  // ── CORE STATE ────────────────────────────────────────────────
  const isGV = policy.policyId === 'GV-GB-001';
  useShellStore(s => s.theme);
  const setDetailMode = useShellStore(s => s.setDetailMode);

  // ── NAV TABS ──────────────────────────────────────────────────
  let navTabs = [
    { id: 'overview',      label: 'Overview & Definitions', icon: Target },
    { id: 'statements',    label: 'Policy Statements',      icon: List },
    { id: 'procedures',    label: 'Procedures',             icon: Settings },
    { id: 'documentation', label: 'Documentation',          icon: FileText },
    { id: 'compliance',    label: 'Compliance & Audit',     icon: CheckSquare },
    { id: 'references',    label: 'References & Admin',     icon: Archive },
    { id: 'appendices',    label: 'Appendices (Forms)',     icon: LayoutList },
    ...(isGV ? [
      { id: 'alerts',     label: 'Policy Alerts', icon: Bell },
      { id: 'faq',        label: 'FAQ',           icon: HelpCircle },
      { id: 'amendments', label: 'Amendment Log', icon: Clock },
    ] : []),
  ];

  // ── FLAT SECTION LIST — drives all navigation ─────────────────
  // Each entry: { tabId, sIdx (within-tab index), label }
  // Sections navigate one-at-a-time; cross into next tab at boundary.
  // Document order: 1-Header · 2-Purpose · 3-Scope · 4-PolicyStatement · 5-Definitions · 6+
  // Procedures sIdx 1-4 (6.2–6.5) only exist for GV-GB-001; non-GV policies show 6.1 only.
  let FULL_SECTIONS = [
    { tabId: 'overview',      sIdx: 0, label: 'Overview' },
    { tabId: 'overview',      sIdx: 1, label: '2. Purpose' },
    { tabId: 'overview',      sIdx: 2, label: '3. Scope' },
    { tabId: 'statements',    sIdx: 0, label: '4. Policy Statements' },
    { tabId: 'overview',      sIdx: 3, label: '5. Definitions' },
    { tabId: 'procedures',    sIdx: 0, label: '6.1 Establishment' },
    ...(isGV ? [
      { tabId: 'procedures',  sIdx: 1, label: '6.2 Core Responsibilities' },
      { tabId: 'procedures',  sIdx: 2, label: '6.2.2 Key Personnel' },
      { tabId: 'procedures',  sIdx: 3, label: '6.2.3 Policy & Compliance' },
      { tabId: 'procedures',  sIdx: 4, label: '6.2.4 QAPI Oversight' },
      { tabId: 'procedures',  sIdx: 5, label: '6.2.5 Financial Oversight' },
      { tabId: 'procedures',  sIdx: 6, label: '6.2.6 Emergency Preparedness' },
      { tabId: 'procedures',  sIdx: 7, label: '6.3 Meetings' },
      { tabId: 'procedures',  sIdx: 8, label: '6.4 Conflict of Interest' },
      { tabId: 'procedures',  sIdx: 9, label: '6.5 Escalation' },
    ] : []),
    { tabId: 'documentation', sIdx: 0, label: '7. Documentation' },
    { tabId: 'compliance',    sIdx: 0, label: '8. Compliance & Audit' },
    { tabId: 'compliance',    sIdx: 1, label: '8.2 Surveyor Expectations' },
    { tabId: 'compliance',    sIdx: 2, label: '8.3 Common Failure Points' },
    { tabId: 'references',    sIdx: 0, label: '9. References' },
    { tabId: 'references',    sIdx: 1, label: '9.2/9.3 CMS & OIG Guidance' },
    { tabId: 'references',    sIdx: 2, label: '9.4 Cross-References' },
    { tabId: 'references',    sIdx: 3, label: '10. Training & Version Control' },
    { tabId: 'appendices',    sIdx: 0, label: 'Appendices' },
    ...(isGV ? [
      { tabId: 'alerts',      sIdx: 0, label: 'Policy Alerts' },
      { tabId: 'faq',         sIdx: 0, label: 'FAQ' },
      { tabId: 'amendments',  sIdx: 0, label: 'Amendment Log' },
    ] : []),
  ];

  // ── GENERIC CONTENT MODE ──────────────────────────────────────
  // For non-GV-GB-001 policies, replace the GV-specific section list
  // with one entry per real generated section (grouped by tab via
  // mapOrderToTab). This drives the carousel through the actual
  // policy content from extracted_full markdown.
  const useGenericContent = !isGV && Array.isArray(policy.generatedSections) && policy.generatedSections.length > 0;
  const genericSectionsByTab: Record<string, import('@/policy/types').PolicyContentSection[]> = {};
  if (useGenericContent) {
    // Helper: a section is "empty" if its body is whitespace-only or just markdown rule "---".
    const isEmptyBody = (b: string) => {
      const t = (b ?? '').trim();
      return t === '' || t === '---';
    };
    // Pre-pass: drop synthetic parent headings that have no body but are
    // immediately followed by deeper-level subsections (e.g. "6. Procedures"
    // with empty body followed by 6.1, 6.2, …). The subsections carry the
    // real content so the empty parent just creates a blank carousel page.
    const all = policy.generatedSections!;
    const keep = new Set<number>();
    for (let i = 0; i < all.length; i++) {
      const s = all[i];
      if (mapOrderToTab(s.order) === '__skip__') continue;
      if (isEmptyBody(s.body)) {
        // Look ahead for a subsection with deeper level inside same tab.
        const next = all[i + 1];
        const sameTabDeeper = next
          && mapOrderToTab(next.order) === mapOrderToTab(s.order)
          && next.level > s.level;
        if (sameTabDeeper) continue; // drop empty parent
      }
      keep.add(i);
    }
    for (let i = 0; i < all.length; i++) {
      if (!keep.has(i)) continue;
      const s = all[i];
      const tabId = mapOrderToTab(s.order);
      (genericSectionsByTab[tabId] ||= []).push(s);
    }
    // Build flat carousel list — each generated section becomes one carousel page.
    // Preserve nav tab order so prev/next moves logically through the document.
    const tabOrder = ['overview', 'statements', 'procedures', 'documentation', 'compliance', 'references', 'appendices'];
    const flat: { tabId: string; sIdx: number; label: string }[] = [];
    for (const tabId of tabOrder) {
      const list = genericSectionsByTab[tabId] ?? [];
      list.forEach((s, idx) => {
        flat.push({ tabId, sIdx: idx, label: cleanGenericTitle(s.title) });
      });
    }
    // If no overview sections exist, still show a synthetic header card so the
    // carousel never starts empty (rare; almost all policies have a Policy Header section).
    if (flat.length === 0) {
      flat.push({ tabId: 'overview', sIdx: 0, label: 'Overview' });
    }
    FULL_SECTIONS = flat;
    // Hide tabs with no content (always keep Appendices since forms render separately).
    navTabs = navTabs.filter(t => t.id === 'appendices' || (genericSectionsByTab[t.id]?.length ?? 0) > 0);
  }

  // ── SECTION NAVIGATION STATE ──────────────────────────────────
  // Single integer tracks position across ALL sections (global index).
  const [activeSectionGlobalIdx, setActiveSectionGlobalIdx] = useState(0);
  const activeSection    = FULL_SECTIONS[activeSectionGlobalIdx] ?? FULL_SECTIONS[0];
  const activeTab        = activeSection.tabId;
  const activeSectionInTab = activeSection.sIdx;

  // ── ANIMATION STATE MACHINE ───────────────────────────────────
  const [slidePhase, setSlidePhase] = useState<'idle' | 'exit' | 'enter'>('idle');
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const pendingIdxRef  = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  // ── HELP MODAL ────────────────────────────────────────────────
  const [helpOpen, setHelpOpen] = useState(false);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);
  const helpCloseRef = useRef<HTMLButtonElement>(null);

  // ── TOUCH / SWIPE REFS ────────────────────────────────────────
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // ── HELP AUTO-SHOW ────────────────────────────────────────────
  const HELP_DISMISSED_KEY = 'ci-pp-nav-help-dismissed';
  const HELP_TS_KEY        = 'ci-pp-nav-help-ts';
  const MAX_AUTO_SHOWS     = 2;
  const WINDOW_MS          = 10 * 60 * 1000;

  useLayoutEffect(() => {
    const dismissed = localStorage.getItem(HELP_DISMISSED_KEY) === 'true';
    if (dismissed) return;
    const stored = localStorage.getItem(HELP_TS_KEY);
    const timestamps: number[] = stored ? JSON.parse(stored) : [];
    const now  = Date.now();
    const recent = timestamps.filter(t => now - t < WINDOW_MS);
    if (recent.length < MAX_AUTO_SHOWS) {
      localStorage.setItem(HELP_TS_KEY, JSON.stringify([...recent, now]));
      // Wait until the policy content is fully rendered before showing the modal
      const t = setTimeout(() => setHelpOpen(true), 2500);
      return () => clearTimeout(t);
    }
  }, []); // once on mount

  // Focus the close button when the modal opens
  useEffect(() => {
    if (helpOpen) setTimeout(() => helpCloseRef.current?.focus(), 50);
  }, [helpOpen]);

  // ── DOCUMENT TITLE + DETAIL MODE ─────────────────────────────
  useEffect(() => {
    const prev = document.title;
    document.title = `${policy.policyId} — ${policy.title}`;
    setDetailMode(true);
    return () => { document.title = prev; setDetailMode(false); };
  }, [policy.policyId, policy.title, setDetailMode]);

  // ── CORE NAVIGATE FUNCTION — operates on global section index ─
  function navigateToSection(targetIdx: number, dir: 1 | -1) {
    if (isAnimatingRef.current) return;
    if (targetIdx < 0 || targetIdx >= FULL_SECTIONS.length) return;
    if (targetIdx === activeSectionGlobalIdx) return;
    isAnimatingRef.current = true;
    pendingIdxRef.current  = targetIdx;
    setSlideDir(dir);
    setSlidePhase('exit');
  }

  // ── ANIMATION SEQUENCE ────────────────────────────────────────
  useEffect(() => {
    if (slidePhase === 'exit') {
      const t = setTimeout(() => {
        if (pendingIdxRef.current !== null) {
          setActiveSectionGlobalIdx(pendingIdxRef.current);
          pendingIdxRef.current = null;
        }
        setSlidePhase('enter');
      }, 500);
      return () => clearTimeout(t);
    }
    if (slidePhase === 'enter') {
      const t = setTimeout(() => {
        setSlidePhase('idle');
        isAnimatingRef.current = false;
      }, 500);
      return () => clearTimeout(t);
    }
  }, [slidePhase]);

  // ── NAVIGATION HELPERS ────────────────────────────────────────
  function navigateForward() {
    navigateToSection(activeSectionGlobalIdx + 1, 1);
  }
  function navigateBackward() {
    navigateToSection(activeSectionGlobalIdx - 1, -1);
  }
  function handleTabClick(tabId: string) {
    const targetFirstIdx = FULL_SECTIONS.findIndex(s => s.tabId === tabId);
    if (targetFirstIdx < 0) return;
    const dir: 1 | -1 = targetFirstIdx > activeSectionGlobalIdx ? 1 : -1;
    navigateToSection(targetFirstIdx, dir);
  }

  // ── KEYBOARD NAVIGATION ───────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); navigateForward(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); navigateBackward(); }
      if (e.key === 'Escape') setHelpOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeSectionGlobalIdx]); // fresh closure on section change

  // ── SWIPE + EDGE-TAP HANDLERS ────────────────────────────────
  // touch-action: pan-y on the container lets the browser scroll
  // vertically while we intercept clear horizontal swipes.
  // Edge taps: tap within the left or right 18% of the viewport
  // (excluding interactive elements) to step prev/next.
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // EDGE TAP: virtually no movement, not on an interactive element
    if (dist < 12) {
      const target = e.target as HTMLElement;
      if (!target.closest('button, a, input, select, textarea, [role="button"], [role="tab"]')) {
        const tapX = e.changedTouches[0].clientX;
        const w    = window.innerWidth;
        if (tapX < w * 0.18) { navigateBackward(); return; }
        if (tapX > w * 0.82) { navigateForward();  return; }
      }
      return;
    }

    // SWIPE: horizontal dominance + minimum 40px distance
    if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 40) {
      if (dx < 0) navigateForward();  // swipe left = next
      else navigateBackward();        // swipe right = prev
    }
  };

  // ── PRINT / DOWNLOAD ──────────────────────────────────────────
  const handlePrint    = () => window.print();
  const handleDownload = () => {
    const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${policy.policyId}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── CLOSE HELP MODAL ──────────────────────────────────────────
  function closeHelp() {
    if (doNotShowAgain) localStorage.setItem(HELP_DISMISSED_KEY, 'true');
    setHelpOpen(false);
    setDoNotShowAgain(false);
  }

  // ── DERIVED VALUES ────────────────────────────────────────────
  const canGoBack        = activeSectionGlobalIdx > 0;
  const canGoForward     = activeSectionGlobalIdx < FULL_SECTIONS.length - 1;
  const currentSectionLabel = activeSection.label;
  const slideClass       =
    slidePhase === 'exit'  ? (slideDir === 1 ? 'policy-slide-exit-fwd'  : 'policy-slide-exit-bwd')
    : slidePhase === 'enter' ? (slideDir === 1 ? 'policy-slide-enter-fwd' : 'policy-slide-enter-bwd')
    : '';

  const navBtnBase =
    'flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-montserrat font-semibold text-[11px] uppercase tracking-wider transition-all duration-200 select-none';
  const navBtnActive  = 'border-[#D8D4D0] text-[#524048] hover:border-[#007970] hover:text-[#007970] cursor-pointer';
  const navBtnDisabled = 'border-[#EDECEB] text-[#C8C4C0] cursor-not-allowed pointer-events-none';

  // Persistent regulatory tags — shown at bottom-right across all sections/tabs
  const persistentTags: string[] = policy.policyId === 'GV-GB-001'
    ? ['42cfr', 'title22', 'cms', 'hipaa', 'oig', 'fca']
    : (policy.regulatoryTags ?? []);

  return (
    <div
      className="demo-view-enter relative h-full w-full bg-white text-[#1F1C1B] policy-page"
      data-theme="light"
    >
      <div className="policy-carousel-screen relative h-full w-full bg-white flex flex-col overflow-hidden">

      {/* ══ ACTION BAR ══════════════════════════════════════════ */}
      <div className="no-print flex items-center justify-between px-5 py-3 bg-white border-b border-[#E5E4E3] shrink-0 z-20 gap-3">

        {/* Left — back (hidden when embedded inside another shell) */}
        {!embedded && onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#007970] font-montserrat font-semibold text-[12px] uppercase tracking-wider hover:underline transition-all shrink-0"
          >
            <ChevronLeft size={16} /> Return to Library
          </button>
        ) : (
          <span className="shrink-0" />
        )}

        {/* Centre — Prev / current section label / Next */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
          <button
            onClick={navigateBackward}
            disabled={!canGoBack || slidePhase !== 'idle'}
            aria-label="Previous section"
            className={`${navBtnBase} ${canGoBack && slidePhase === 'idle' ? navBtnActive : navBtnDisabled}`}
          >
            <ChevronLeft size={13} /> Prev
          </button>

          <span
            className="font-montserrat font-semibold text-[11px] tracking-[0.12em] uppercase text-[#524048] truncate max-w-[200px] hidden sm:block select-none"
            aria-live="polite"
            aria-atomic="true"
          >
            {currentSectionLabel}
          </span>

          <button
            onClick={navigateForward}
            disabled={!canGoForward || slidePhase !== 'idle'}
            aria-label="Next section"
            className={`${navBtnBase} ${canGoForward && slidePhase === 'idle' ? navBtnActive : navBtnDisabled}`}
          >
            Next <ChevronRight size={13} />
          </button>
        </div>

        {/* Right — help + print + download */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setHelpOpen(true)}
            aria-label="How to navigate this document"
            title="Navigation help"
            className="w-8 h-8 rounded-full border-2 border-[#007970] flex items-center justify-center text-[#007970] hover:bg-[#007970] hover:text-white transition-all duration-200 shrink-0"
          >
            <HelpCircle size={15} strokeWidth={2.2} />
          </button>
          <button
            type="button" onClick={handlePrint}
            className="flex items-center gap-1.5 text-[#1F1C1B] font-montserrat font-semibold text-[11px] uppercase tracking-wider hover:opacity-70 transition-opacity no-print"
          >
            <Printer size={15} /> Print
          </button>
          <button
            type="button" onClick={handleDownload}
            className="flex items-center gap-1.5 text-[#007970] font-montserrat font-semibold text-[11px] uppercase tracking-wider hover:opacity-70 transition-opacity no-print"
          >
            <Download size={15} /> Download
          </button>
        </div>
      </div>

      {/* ══ TAB BAR ════════════════════════════════════════════ */}
      <nav
        className="no-print bg-white border-b border-[#E5E4E3] shrink-0 overflow-x-auto custom-scrollbar"
        role="tablist"
        aria-label="Policy sections"
      >
        <div className="flex items-center px-5 min-w-max">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-4 py-[14px] font-semibold group border-b-[3px] transition-all duration-200 ${
                  active
                    ? 'text-[#C74601] border-[#C74601]'
                    : 'text-[#524048] border-transparent hover:text-[#1F1C1B] hover:border-[#E5E4E3]'
                }`}
              >
                <Icon
                  size={17}
                  className={active ? 'text-[#C74601]' : 'text-[#007970] opacity-70 group-hover:opacity-100'}
                />
                <span className="font-montserrat text-[11px] tracking-[0.1em] whitespace-nowrap uppercase">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ══ MAIN CONTENT — section-by-section carousel ══════════ */}
      <main
        className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar bg-white policy-content flex flex-col"
        role="tabpanel"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Content starts near the top — pt-10 gives breathing room */}
        <div className="flex flex-col">
          <div
            key={`section-${activeSectionGlobalIdx}-${slidePhase === 'enter' ? 'in' : 'out'}`}
            className={`max-w-[1200px] w-full px-6 pt-10 pb-16 md:px-10 lg:px-12 ${slideClass}`}
          >
            {useGenericContent ? (
              activeTab === 'appendices'
                ? <TabAppendices policy={policy} />
                : (() => {
                    const list = genericSectionsByTab[activeTab] ?? [];
                    const sec = list[activeSectionInTab];
                    if (!sec) {
                      return (
                        <p className="font-roboto text-[14px] italic text-[#9E9D9A]">
                          No content available for this section.
                        </p>
                      );
                    }
                    return <GenericSectionPanel section={sec} />;
                  })()
            ) : (
              <>
                {activeTab === 'overview'      && <TabOverview      policy={policy} sectionIdx={activeSectionInTab} />}
                {activeTab === 'statements'    && <TabStatements    policy={policy} />}
                {activeTab === 'procedures'    && <TabProcedures    policy={policy} sectionIdx={activeSectionInTab} />}
                {activeTab === 'documentation' && <TabDocumentation policy={policy} />}
                {activeTab === 'compliance'    && <TabCompliance    policy={policy} sectionIdx={activeSectionInTab} />}
                {activeTab === 'references'    && <TabReferences    policy={policy} sectionIdx={activeSectionInTab} />}
                {activeTab === 'appendices'    && <TabAppendices    policy={policy} />}
                {activeTab === 'alerts'        && <TabAlerts        policy={policy} />}
                {activeTab === 'faq'           && <TabFAQ           policy={policy} />}
                {activeTab === 'amendments'    && <TabAmendments    policy={policy} />}
              </>
            )}
          </div>
        </div>
      </main>

      {/* ══ NAVIGATION HELP MODAL ══════════════════════════════ */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-modal-title"
          onClick={e => { if (e.target === e.currentTarget) closeHelp(); }}
        >
          {/* Scrim — subtle blur + 33% darken so content is still visible behind the modal */}
          <div
            className="absolute inset-0 bg-black/[0.33]"
            style={{ backdropFilter: 'blur(7.7px)', WebkitBackdropFilter: 'blur(7.7px)' }}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="policy-help-modal-panel relative bg-white rounded-[18px] shadow-2xl border border-[#E5E4E3] max-w-[520px] w-full overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-[#E5E4E3]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E5FEFF] flex items-center justify-center shrink-0">
                  <HelpCircle size={19} className="text-[#007970]" />
                </div>
                <h2 id="help-modal-title" className="font-montserrat font-semibold text-[15px] text-[#1F1C1B]">
                  How to Navigate This Document
                </h2>
              </div>
              <button
                ref={helpCloseRef}
                onClick={closeHelp}
                aria-label="Close navigation help"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#747470] hover:bg-[#F2F2F0] hover:text-[#1F1C1B] transition-all focus-visible:ring-2 focus-visible:ring-[#007970]"
              >
                <span className="text-[22px] leading-none select-none" aria-hidden="true">×</span>
              </button>
            </div>

            {/* Body */}
            <div className="px-7 py-6 space-y-5">
              <p className="text-[14px] text-[#524048] font-roboto leading-relaxed">
                This document is presented as a{' '}
                <strong className="text-[#1F1C1B] font-semibold">guided carousel</strong> — each section
                is shown one at a time for focused, uncluttered review. Navigate forward and backward
                using any of the methods below.
              </p>

              <div className="space-y-4">
                {([
                  {
                    symbol: '‹ ›',
                    label:  'Prev / Next buttons',
                    desc:   'Use the Prev and Next buttons in the top bar to step through each section in sequence.',
                  },
                  {
                    symbol: '← →',
                    label:  'Arrow keys',
                    desc:   'Press the left or right arrow key on your keyboard. Navigation is disabled while typing in a field.',
                  },
                  {
                    symbol: '👆',
                    label:  'Swipe or tap edges',
                    desc:   'On touch devices, swipe left/right to navigate. Or tap the left edge of the screen to go back, tap the right edge to go forward.',
                  },
                  {
                    symbol: '⊞',
                    label:  'Tab bar',
                    desc:   'Click any tab in the navigation bar to jump directly to that section — the transition animation still plays.',
                  },
                  {
                    symbol: '↪',
                    label:  'Auto-progression',
                    desc:   'Reaching the end of a section automatically advances to the next tab — the document reads as one continuous guided journey.',
                  },
                ] as const).map(item => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-[10px] bg-[#F2F8F7] border border-[#E5FEFF] flex items-center justify-center shrink-0 font-montserrat font-bold text-[#007970] text-[14px] select-none"
                      aria-hidden="true"
                    >
                      {item.symbol}
                    </div>
                    <div className="min-w-0 pt-1">
                      <p className="font-montserrat font-semibold text-[13px] text-[#1F1C1B] mb-0.5 leading-snug">
                        {item.label}
                      </p>
                      <p className="font-roboto text-[13px] text-[#524048] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-7 py-4 border-t border-[#E5E4E3] bg-[#FAFBF8]">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={doNotShowAgain}
                  onChange={e => setDoNotShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D1D1D1] accent-[#007970] cursor-pointer"
                />
                <span className="text-[12px] text-[#747470] font-roboto">Do not show again</span>
              </label>
              <button
                onClick={closeHelp}
                className="px-5 py-2 bg-[#007970] text-white font-montserrat font-semibold text-[12px] uppercase tracking-wider rounded-full hover:bg-[#005E57] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#007970]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ PERSISTENT REGULATORY TAGS — bottom-right, outside carousel ══ */}
      {persistentTags.length > 0 && (
        <div className="no-print absolute bottom-6 right-6 flex flex-col items-end gap-2 pointer-events-none z-10">
          <p className="font-montserrat font-semibold text-[9px] tracking-[0.18em] uppercase text-[#7A6A72]">
            Regulatory References
          </p>
          <div className="flex flex-wrap gap-2 justify-end max-w-[420px]">
            {persistentTags.map(tagId => {
              const reg = SHARED_REG_ITEMS.find(r => r.id === tagId);
              const Icon = reg?.icon;
              const color = reg?.color ?? '#007970';
              return (
                <span
                  key={tagId}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-montserrat font-semibold text-[11px] tracking-wide"
                  style={{ borderColor: color, color, backgroundColor: `${color}18` }}
                >
                  {Icon && <Icon size={11} strokeWidth={2.2} />}
                  {reg?.shortName ?? tagId}
                </span>
              );
            })}
          </div>
        </div>
      )}

      </div>
      <PolicyPrintDocument policy={policy} isGV={isGV} />

    </div>
  );
}
