/**
 * GVGBDetailView.tsx
 * Specialized detail view for policy GV-GB-001.
 * Layout and structure matches GV-GB-001.html exactly.
 * All real content embedded — no placeholders.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Printer, FileText, Shield, Search, CheckCircle, BookOpen,
  AlertTriangle, Settings, List, CheckSquare, Archive, Info,
  LayoutList, ChevronRight, FileLock2, Award,
  ArrowLeft, ExternalLink,
} from 'lucide-react';
import { useShellStore } from '@/policy/stores/uiStore';
import { FormViewer } from '@/policy/components/FormViewer';
import { VeilModal } from '@/policy/components/ui/VeilModal';
import { openPolicyPrintRoute } from '@/policy/utils/openPolicyPrintRoute';
import { getFormsForPolicy } from '@/policy/utils/policyFormLinks';

// ─── DATA ────────────────────────────────────────────────────────────────────

const POLICY_META = {
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
  { term: 'Administrator', definition: 'The individual appointed by the Governing Body who is responsible for managing the agency\'s day-to-day operations and who meets all qualifications specified in agency policy GV-OG-002 and applicable California state law.' },
  { term: 'Clinical Manager', definition: 'The registered nurse (or qualified individual per California state law) designated by the Governing Body to oversee clinical services including patient care delivery, clinical staff supervision, and OASIS compliance. Also referred to as Director of Nursing (DON).' },
  { term: 'Fiduciary Duty', definition: 'The legal obligation of Governing Body members to act in good faith, with due diligence, and in the best interest of the agency and the patients it serves.' },
  { term: 'Quorum', definition: 'The minimum number of Governing Body members required to be present (physically or via approved teleconference) to conduct official business, as defined in the agency\'s bylaws or operating agreement.' },
  { term: 'QAPI', definition: 'Quality Assessment and Performance Improvement — the structured program required by 42 CFR § 484.65 for ongoing quality monitoring and improvement.' },
];

type ProcedureRow = [string, string, string, string];
type ProcedureSection = { title: string; rows: ProcedureRow[] };
type ProcedureMap = {
  '6.1': ProcedureRow[];
  '6.2': ProcedureSection[];
  '6.3': ProcedureRow[];
  '6.4': ProcedureRow[];
  '6.5': ProcedureRow[];
};

const PROCEDURES: ProcedureMap = {
  '6.1': [
    ['6.1.1', 'Agency Owner / Corporate Entity', 'Formally establish the Governing Body through articles of incorporation, operating agreement, partnership agreement, or equivalent legal instrument for Care Indeed Home Health Care, Inc. The establishing document must identify: (a) the legal form of the Governing Body; (b) the minimum and maximum number of members; (c) the quorum requirement; (d) the terms of appointment or election.', 'Prior to initial Medicare certification and maintained continuously thereafter.'],
    ['6.1.2', 'Governing Body Chair', 'Maintain a current roster of all Governing Body members including: full legal name, title/role, date of appointment, term expiration date, voting status, and contact information.', 'Updated within 7 calendar days of any membership change.'],
    ['6.1.3', 'Governing Body', 'Ensure composition includes, at minimum, individuals with competency in: (a) healthcare operations or clinical services; (b) financial management; (c) regulatory compliance. If any competency area is not represented by a current member, the Governing Body shall retain qualified advisory counsel within 30 calendar days of identifying the gap.', 'Ongoing; reviewed annually at the first quarterly meeting of each calendar year.'],
    ['6.1.4', 'Compliance Officer', 'Verify that no Governing Body member appears on the OIG List of Excluded Individuals/Entities (LEIE) or the System for Award Management (SAM) exclusion database at the time of appointment and monthly thereafter, per policy HR-TA-003.', 'At appointment and monthly thereafter.'],
  ],
  '6.2': [
    {
      title: '6.2.1 — Legal Authority and Agency Operations',
      rows: [
        ['6.2.1.1', 'Governing Body', 'Assume and maintain full legal authority for the overall operation, management, and fiscal viability of Care Indeed Home Health Care, Inc.', 'Continuous.'],
        ['6.2.1.2', 'Governing Body', 'Ensure the agency maintains current and valid: (a) California home health license — HCAI License No. 406412878; (b) Medicare certification; (c) Medicaid enrollment (if applicable); (d) accreditation (if applicable) — per policy GV-EA-004.', 'Continuous; verified at each quarterly meeting.'],
        ['6.2.1.3', 'Governing Body', 'Review and approve the agency\'s defined scope of services (policy GV-OG-003) at least annually. Ensure the agency does not provide services beyond those for which it is licensed, staffed, and competent to deliver.', 'Annually, within 30 calendar days of the start of the fiscal year.'],
      ],
    },
    {
      title: '6.2.2 — Appointment and Oversight of Key Personnel',
      rows: [
        ['6.2.2.1', 'Governing Body', 'Appoint a qualified Administrator and document the appointment in Governing Body minutes. The Administrator must meet all qualifications defined in policy GV-OG-002 and applicable California state law.', 'Prior to agency operation and within 30 calendar days of any vacancy.'],
        ['6.2.2.2', 'Governing Body', 'Appoint or confirm the appointment of a qualified Clinical Manager (Director of Nursing) responsible for all clinical services, per 42 CFR § 484.105(c).', 'Prior to agency operation and within 30 calendar days of any vacancy.'],
        ['6.2.2.3', 'Governing Body', 'Appoint or confirm the designation of a Compliance Officer with authority and independence to operate the corporate compliance program, per policy CO-CP-002.', 'Prior to agency operation and within 30 calendar days of any vacancy.'],
        ['6.2.2.4', 'Governing Body', 'Conduct or commission an annual performance evaluation of the Administrator. Results and any corrective directives shall be documented in executive session minutes.', 'Annually; completed within 60 calendar days of the end of each fiscal year.'],
        ['6.2.2.5', 'Governing Body', 'Review and approve the agency\'s succession plan for the Administrator, Clinical Manager, and Compliance Officer, per policy GV-GB-004.', 'Annually at the second quarterly meeting; updated within 14 calendar days of any key leadership vacancy.'],
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
        ['6.2.4.1', 'Governing Body', 'Approve the agency\'s QAPI plan, per policy QA-PG-002, and ensure that the plan includes measurable quality indicators, performance improvement projects, and patient safety initiatives.', 'Annually; approved at the first quarterly meeting of each calendar year.'],
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
        ['6.2.6.1', 'Governing Body', 'Approve the agency\'s Emergency Operations and Business Continuity Plan per policy OP-FM-005 and 42 CFR § 484.102.', 'Annually; approved at the third quarterly meeting.'],
        ['6.2.6.2', 'Administrator', 'Report the results of the most recent emergency preparedness drill or exercise to the Governing Body, including identified gaps and corrective actions.', 'At the quarterly meeting following each drill (minimum 2 drills per year).'],
      ],
    },
  ],
  '6.3': [
    ['6.3.1', 'Governing Body Chair', 'Schedule and convene regular Governing Body meetings no fewer than 4 times per calendar year (quarterly). The meeting schedule for the upcoming year must be established and distributed to all members by December 15 of the preceding year.', 'Quarterly; schedule distributed by December 15.'],
    ['6.3.2', 'Governing Body Chair', 'Convene special meetings when urgent matters arise, including but not limited to: (a) CMS survey findings requiring immediate corrective action; (b) serious adverse events; (c) regulatory enforcement actions; (d) key leadership vacancies. Notice of a special meeting must be provided to all members at least 48 hours in advance unless the matter constitutes an imminent threat to patient safety, in which case notice may be shortened to the minimum practicable.', 'As needed; notice within 48 hours or shorter for imminent patient safety threats.'],
    ['6.3.3', 'Designated Secretary / Administrator', 'Prepare and distribute the meeting agenda to all Governing Body members no fewer than 7 calendar days before each scheduled meeting. The agenda must include standing items: (a) approval of prior minutes; (b) Administrator report; (c) compliance report; (d) QAPI report; (e) financial report; (f) old business; (g) new business.', '7 calendar days before each meeting.'],
    ['6.3.4', 'Designated Secretary', 'Record formal minutes for each meeting per policy GV-GB-002. Minutes must document: (a) date, time, and location; (b) members present and absent; (c) quorum determination; (d) all motions, seconds, and voting outcomes; (e) all directives issued with assigned responsible parties and deadlines; (f) executive session topics (without protected details).', 'Draft minutes completed within 14 calendar days of the meeting; approved at the next regular meeting.'],
    ['6.3.5', 'Governing Body Chair', 'Ensure a quorum is present before conducting any official business. If quorum is not achieved, the meeting shall be rescheduled within 14 calendar days.', 'At the start of each meeting.'],
  ],
  '6.4': [
    ['6.4.1', 'All Governing Body Members', 'Complete and submit the Conflict of Interest Disclosure Form (Appendix B) at the time of appointment, annually thereafter, and within 7 calendar days of any change in circumstances that could create a new conflict, per policy GV-GB-003.', 'At appointment; annually; within 7 days of change.'],
    ['6.4.2', 'Compliance Officer', 'Review all submitted conflict of interest disclosures within 14 calendar days of receipt and present a summary to the Governing Body with recommendations for management or recusal.', 'Within 14 calendar days of receipt.'],
    ['6.4.3', 'Governing Body', 'Act on conflict of interest recommendations. Any member with a disclosed conflict shall recuse from discussion and voting on the affected matter. Recusals must be documented in meeting minutes.', 'At the meeting where the affected matter is addressed.'],
  ],
  '6.5': [
    ['Governing Body fails to meet quarterly', 'Administrator notifies all members and the Compliance Officer in writing.', 'Administrator schedules a make-up meeting. If Governing Body does not convene within 30 calendar days, the Compliance Officer documents the deficiency and initiates corrective action per QA-AE-003.', 'Make-up meeting within 30 calendar days of the missed quarter.'],
    ['Quorum not achieved for 2 consecutive scheduled meetings', 'Governing Body Chair escalates to the full membership in writing.', 'Chair initiates membership recruitment or replacement per the agency\'s bylaws. Issue must be resolved before the next scheduled meeting.', 'Within 30 calendar days.'],
    ['Key leadership vacancy (Administrator, Clinical Manager, Compliance Officer) exceeds 30 days unfilled', 'Governing Body Chair', 'Governing Body must appoint an interim designee within 14 calendar days of vacancy and document the appointment. Permanent appointment must occur within 90 calendar days.', 'Interim: 14 days. Permanent: 90 days.'],
    ['CMS survey results in Condition-level deficiency', 'Administrator convenes a special Governing Body meeting.', 'Governing Body directs development of a Plan of Correction within CMS-required timeframes (typically 10 calendar days). Governing Body receives weekly status updates until resolution is confirmed.', 'Special meeting within 48 hours of receipt of findings; Plan of Correction per CMS deadline.'],
    ['Compliance Officer reports fraud, waste, or abuse concern to Governing Body', 'Governing Body Chair', 'Governing Body directs investigation per CO-CP-007 and ensures non-retaliation per CO-CP-005. Governing Body receives investigation status updates at each meeting until resolution.', 'Investigation initiated within 7 calendar days; updates at each meeting.'],
  ],
};

const DOCS_REQ = [
  ['Governing Body establishment', 'Articles of incorporation, operating agreement, bylaws, or equivalent legal instrument establishing the Governing Body of Care Indeed Home Health Care, Inc.', 'Agency Owner / Corporate Entity', 'Corporate records repository (physical or electronic).', 'Maintained permanently; updated within 14 calendar days of any amendment.'],
  ['Governing Body membership roster', 'Current roster including member name, role, appointment date, term, voting status, and contact information (Appendix A).', 'Governing Body Chair', 'Agency governance file; copy maintained by Administrator.', 'Updated within 7 calendar days of any change.'],
  ['Meeting minutes', 'Formal minutes for all regular and special meetings, per policy GV-GB-002 (Appendix D template).', 'Designated Secretary', 'Agency governance file; copy provided to each member.', 'Draft within 14 calendar days of meeting; approved at next regular meeting. Retained for minimum 7 years.'],
  ['Meeting agendas', 'Agenda for each regular and special meeting.', 'Administrator / Designated Secretary', 'Agency governance file.', 'Distributed 7 calendar days before each meeting; retained for minimum 7 years.'],
  ['Administrator appointment', 'Written documentation of the Governing Body\'s appointment of the Administrator, including qualifications verified.', 'Governing Body Chair', 'Governing Body minutes; Administrator personnel file.', 'At time of appointment.'],
  ['Clinical Manager appointment', 'Written documentation of the appointment or confirmation of the Clinical Manager.', 'Governing Body Chair', 'Governing Body minutes; Clinical Manager personnel file.', 'At time of appointment.'],
  ['Compliance Officer designation', 'Written documentation of the designation and authority granted to the Compliance Officer.', 'Governing Body Chair', 'Governing Body minutes; Compliance Officer personnel file.', 'At time of designation.'],
  ['Conflict of Interest disclosures', 'Completed Conflict of Interest Disclosure Forms (Appendix B) for each Governing Body member.', 'Compliance Officer (collection); each member (completion)', 'Compliance file; copy in governance file.', 'At appointment; annually; within 7 days of change. Retained for minimum 7 years.'],
  ['Quarterly compliance reports', 'Compliance Officer\'s written report to the Governing Body.', 'Compliance Officer', 'Agency governance file; compliance records.', 'Submitted 7 days before each quarterly meeting; retained for minimum 7 years.'],
  ['Quarterly QAPI reports', 'Clinical Manager / QA Designee\'s written report to the Governing Body.', 'Clinical Manager / QA Designee', 'Agency governance file; QAPI records.', 'Presented at each quarterly meeting; retained for minimum 7 years.'],
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

const REFERENCES_FEDERAL = [
  ['42 CFR § 484.2', 'Definitions', 'Defines \'governing body\' and key terms for home health agencies.'],
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

const REFERENCES_CROSS = [
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

const POLICY_STATEMENTS = [
  '4.1 Care Indeed Home Health Care, Inc. shall maintain a designated Governing Body that holds full legal authority and responsibility for the overall operation, management, and regulatory compliance of the home health agency, as required by 42 CFR § 484.105(a).',
  '4.2 The Governing Body shall be responsible for ensuring that Care Indeed Home Health Care, Inc. operates in compliance with all applicable federal, state, and local laws, regulations, and licensure requirements at all times.',
  '4.3 The Governing Body shall appoint a qualified Administrator who is authorized to act on behalf of the Governing Body in the day-to-day management of the agency and who meets the qualifications defined in agency policy GV-OG-002 and applicable California state requirements.',
  '4.4 The Governing Body shall ensure the appointment and ongoing oversight of a qualified Clinical Manager (Director of Nursing) responsible for all clinical services, in compliance with 42 CFR § 484.105(c).',
  '4.5 The Governing Body shall approve and oversee the agency\'s:\n• Scope of services (GV-OG-003)\n• Organizational structure and reporting lines (GV-OG-001)\n• Annual strategic plan and operational goals (GV-OG-004)\n• Policy framework and all REQUIRED-tier policies (GV-PM-001, GV-PM-002)\n• QAPI program (QA-PG-001, QA-PG-002)\n• Corporate compliance program (CO-CP-001)\n• Annual operating budget (FN-FP-005)\n• Emergency preparedness plan (OP-FM-005)',
  '4.6 The Governing Body shall meet at a frequency sufficient to fulfill its oversight responsibilities, but not less than quarterly, with meetings documented in formal minutes per policy GV-GB-002.',
  '4.7 The Governing Body shall not delegate its ultimate accountability for regulatory compliance, patient safety, or fiscal integrity. Delegation of specific authority shall comply with policy GV-OG-005.',
  '4.8 All members of the Governing Body shall disclose and manage conflicts of interest in accordance with policy GV-GB-003.',
  '4.9 Only the most current approved version of this policy shall be considered valid. Superseded versions must not be used for any operational or compliance purpose. Any revision to this policy requires re-acknowledgment by all Governing Body members and senior leadership within 14 calendar days of the revised effective date.',
];

// ─── SHARED UI PRIMITIVES ─────────────────────────────────────────────────────

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white shadow-sm rounded-xl p-6 mb-6 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, color = 'text-[#1F1C1B]' }: { icon?: React.ElementType; title: string; color?: string }) => (
  <h2 className={`font-montserrat font-semibold text-[13px] tracking-[0.22em] uppercase mb-8 flex items-center gap-4 w-full ${color}`}>
    {Icon && <Icon className="shrink-0 text-[#007970]" size={20} />}
    <span className="shrink-0">{title}</span>
    <span className="flex-grow h-px bg-[#007970]"></span>
  </h2>
);

const SimpleTable = ({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) => (
  <div className="w-full overflow-x-auto overflow-y-hidden mb-10 border-y border-[#E5E4E3]">
    <table className="w-full text-left border-collapse min-w-max">
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
              <td key={j} className={`py-4 px-3 text-[#1F1C1B] font-roboto text-[14px] align-top leading-relaxed whitespace-pre-line break-words ${j === 0 ? 'font-medium text-[#007970]' : ''}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-5 py-3 font-montserrat font-semibold text-[13px] transition-all duration-200 whitespace-nowrap border-b-[3px] ${
      active
        ? 'text-[#C74601] border-[#C74601]'
        : 'text-[#524048] border-transparent hover:text-[#1F1C1B] hover:border-[#E5E4E3]'
    }`}
  >
    {children}
  </button>
);

// ─── TAB VIEWS ────────────────────────────────────────────────────────────────

const ViewOverview = () => (
  <div className="space-y-6 pb-12">

    {/* Policy identity — title + metadata, lives here now that header is gone */}
    <div className="bg-white rounded-xl border border-[#E5E4E3] px-6 py-5">
      <h1 className="font-montserrat font-semibold text-[22px] leading-tight text-[#1F1C1B] mb-1">
        {POLICY_META.title}
      </h1>
      <p className="font-montserrat font-medium text-[10px] text-[#007970] tracking-[0.22em] uppercase mb-4">
        Policy ID: {POLICY_META.id}
      </p>
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
        {([
          ['Domain',         POLICY_META.domain],
          ['Tier',           POLICY_META.tier],
          ['Approved By',    POLICY_META.approvedBy],
          ['Supersedes',     POLICY_META.supersedes],
          ['Effective Date', POLICY_META.effective],
          ['Last Reviewed',  POLICY_META.lastReviewed],
          ['Next Review',    POLICY_META.nextReviewDate],
          ['Version',        `v${POLICY_META.version}`],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label} className="flex flex-col">
            <dt className="font-montserrat font-semibold text-[10px] text-[#524048] tracking-[0.14em] uppercase mb-0.5">{label}</dt>
            <dd className="font-roboto text-[13px] text-[#1F1C1B]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <SectionTitle icon={Shield} title="2. Purpose" />
        <p className="text-gray-700 leading-relaxed text-[15px]">
          This policy establishes the authority, composition, functions, and oversight responsibilities of the Governing Body of Care Indeed Home Health Care, Inc. The Governing Body is the ultimate authority accountable for the operation, management, fiscal viability, and regulatory compliance of the home health agency. This policy ensures the agency satisfies the requirements set forth in{' '}
          <strong>42 CFR § 484.105</strong> — Condition of Participation: Organization and Administration of Services, which mandates that a home health agency must have a governing body that assumes full legal authority and responsibility for the agency's overall operation and management.
        </p>
      </Card>

      <Card>
        <SectionTitle icon={Search} title="3. Scope" />
        <p className="text-gray-700 mb-4 font-bold">This policy applies to:</p>
        <ul className="space-y-3">
          {[
            'All members of the Governing Body of Care Indeed Home Health Care, Inc. (including voting and non-voting members)',
            'The Agency Administrator',
            'The Director of Nursing / Clinical Manager',
            'The Compliance Officer',
            'All senior leadership personnel who report directly to the Governing Body or Administrator',
            'All contracted management entities performing governing body functions on behalf of the agency',
          ].map((item, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle className="text-[#007970] mr-3 mt-0.5 flex-shrink-0" size={18} />
              <span className="text-gray-700 text-[15px]">{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 p-4 bg-[#C74600]/10 border border-[#C74600]/20 text-[#C74600] rounded-lg text-sm font-medium leading-relaxed">
          This policy does not apply to day-to-day clinical or operational staff except to the extent that Governing Body decisions establish requirements, standards, or directives that govern their work.
        </div>
      </Card>
    </div>

    <Card>
      <SectionTitle icon={BookOpen} title="5. Definitions" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DEFINITIONS.map((def, i) => (
          <div key={i} className="bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-montserrat font-extrabold text-[#007970] mb-2">{def.term}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{def.definition}</p>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const ViewPolicyStatements = () => (
  <div className="pb-12">
    <Card>
      <SectionTitle icon={List} title="4. Policy Statement" />
      <div className="space-y-4">
        {POLICY_STATEMENTS.map((stmt, i) => (
          <div key={i} className="flex items-start bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-sm">
            <div className="bg-[#007970] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold font-montserrat flex-shrink-0 mr-5 shadow-inner text-sm">
              4.{i + 1}
            </div>
            <p className="text-gray-800 leading-relaxed pt-2 text-[15px] whitespace-pre-line">{stmt.substring(4)}</p>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const ViewProcedures = () => {
  const [activeSub, setActiveSub] = useState('6.1');

  const tabs = PROCEDURE_SUBTABS;

  return (
    <div className="h-full flex flex-col pb-6">
      <Card className="flex-shrink-0">
        <SectionTitle icon={Settings} title="6. Procedures" />
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <TabButton key={tab.id} active={activeSub === tab.id} onClick={() => setActiveSub(tab.id)}>
              {tab.label}
            </TabButton>
          ))}
        </div>
      </Card>

      <div className="flex-1 overflow-y-auto pb-12 pr-2">
        {activeSub === '6.1' && (
          <Card>
            <h3 className="font-montserrat font-bold text-xl text-gray-800 mb-4">6.1 Establishment and Composition</h3>
            <SimpleTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={PROCEDURES['6.1']} />
          </Card>
        )}

        {activeSub === '6.2' && (
          <div className="space-y-6">
            <div className="bg-[#C74600]/10 border border-[#C74600]/20 text-[#C74600] p-5 rounded-xl text-[15px] font-medium flex items-start shadow-sm">
              <AlertTriangle className="mr-3 flex-shrink-0" size={24} />
              <p>The Governing Body of Care Indeed Home Health Care, Inc. shall fulfill the following responsibilities directly and shall <strong>not delegate ultimate accountability</strong> for any of these functions.</p>
            </div>
            {PROCEDURES['6.2'].map((section, idx) => (
              <Card key={idx}>
                <h3 className="font-montserrat font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-200">{section.title}</h3>
                <SimpleTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={section.rows} />
              </Card>
            ))}
          </div>
        )}

        {activeSub === '6.3' && (
          <Card>
            <h3 className="font-montserrat font-bold text-xl text-gray-800 mb-4">6.3 Governing Body Meetings</h3>
            <SimpleTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={PROCEDURES['6.3']} />
          </Card>
        )}

        {activeSub === '6.4' && (
          <Card>
            <h3 className="font-montserrat font-bold text-xl text-gray-800 mb-4">6.4 Conflict of Interest Management</h3>
            <SimpleTable headers={['Step', 'Responsible Party', 'Action', 'Timeframe']} rows={PROCEDURES['6.4']} />
          </Card>
        )}

        {activeSub === '6.5' && (
          <Card>
            <h3 className="font-montserrat font-bold text-xl text-[#C74600] mb-4 flex items-center">
              <AlertTriangle className="mr-2" size={24} /> 6.5 Escalation and Exception Handling
            </h3>
            <SimpleTable headers={['Condition', 'Escalation Path', 'Corrective Action', 'Timeframe']} rows={PROCEDURES['6.5']} />
          </Card>
        )}
      </div>
    </div>
  );
};

const ViewDocumentation = () => (
  <div className="pb-12">
    <Card>
      <SectionTitle icon={FileText} title="7. Documentation Requirements" />
      <SimpleTable
        headers={['Requirement', 'Document / Record', 'Responsible Party', 'Location', 'Timeframe']}
        rows={DOCS_REQ}
      />
    </Card>
  </div>
);

const ViewCompliance = () => (
  <div className="space-y-6 pb-12">
    <Card>
      <SectionTitle icon={CheckSquare} title="8.1 How Compliance Is Measured" />
      <SimpleTable
        headers={['Compliance Indicator', 'Measurement Method', 'Acceptable Standard']}
        rows={COMPLIANCE_81}
      />
    </Card>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <SectionTitle icon={Search} title="8.2 Surveyor Expectations" />
        <p className="text-sm text-[#524048] mb-4 font-roboto">CMS surveyors conducting a standard survey under SOM Appendix B will specifically verify:</p>
        <ul className="space-y-4">
          {[
            'Evidence that a Governing Body exists and is functioning. Surveyors will request establishing documents and a current membership roster. A sole proprietor must demonstrate individual acceptance of governing body responsibilities.',
            'Evidence that the Governing Body has appointed a qualified Administrator. Surveyors will review Governing Body minutes for appointment documentation and verify qualifications per California state requirements.',
            'Evidence of Clinical Manager oversight. Surveyors will look for Governing Body minutes documenting appointment, reporting, and oversight of clinical services leadership.',
            'Evidence that the Governing Body oversees QAPI. Surveyors will examine whether the Governing Body has reviewed, approved, and acted upon quality data. Passive receipt of reports without documented action is a common deficiency.',
            'Evidence of policy oversight. Surveyors will verify that the Governing Body has approved the agency\'s policies and that a review cycle exists.',
            'Evidence of fiscal oversight. Surveyors will review whether the Governing Body monitors the agency\'s financial viability and acts on adverse trends.',
            'Meeting frequency and documentation quality. Surveyors will request all meeting minutes for the survey look-back period and assess completeness, including attendance, quorum, and documented decisions.',
          ].map((item, i) => (
            <li key={i} className="text-[15px] text-[#1F1C1B] font-roboto flex items-start">
              <ChevronRight className="text-[#007970] mt-0.5 mr-2 flex-shrink-0" />
              {i + 1}. {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle icon={AlertTriangle} title="8.3 Common Failure Points" color="text-[#C74600]" />
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
          {COMPLIANCE_83.map((item, i) => (
            <div key={i} className="bg-red-50 border border-red-100 p-4 rounded-xl shadow-sm">
              <p className="font-bold text-red-900 text-[15px] mb-2">{item[0]}</p>
              <p className="text-sm text-red-700 mb-2"><strong>Risk:</strong> {item[1]}</p>
              <p className="text-sm text-gray-800 bg-white p-2 rounded-lg border border-red-100 shadow-inner"><strong>Mitigation:</strong> {item[2]}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const ViewReferencesAdmin = () => (
  <div className="space-y-6 pb-12">
    <Card>
      <SectionTitle icon={Archive} title="9. References" />
      <div className="mb-8">
        <h3 className="font-montserrat font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-200">9.1 Federal Regulations (42 CFR Part 484)</h3>
        <SimpleTable headers={['Citation', 'Title', 'Relevance']} rows={REFERENCES_FEDERAL} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="font-montserrat font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-200">9.2 CMS Guidance</h3>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-3">
            <p className="font-bold text-sm text-[#007970]">CMS State Operations Manual, Appx B — Guidance to Surveyors</p>
            <p className="text-sm text-gray-700 mt-1">Provides interpretive guidelines for survey of 42 CFR § 484.105 compliance; defines surveyor expectations for governing body evidence.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="font-bold text-sm text-[#007970]">CMS OASIS-E2 Guidance Manual</p>
            <p className="text-sm text-gray-700 mt-1">While not directly governing the Governing Body, the Governing Body is accountable for ensuring the agency's OASIS program meets CMS requirements.</p>
          </div>
        </div>
        <div>
          <h3 className="font-montserrat font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-200">9.3 OIG Guidance</h3>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 h-full">
            <p className="font-bold text-sm text-blue-800">OIG Compliance Program Guidance for Home Health Agencies</p>
            <p className="text-sm text-blue-900 mt-1">Establishes expectation that the governing body actively oversees the compliance program and receives regular compliance reports.</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-montserrat font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-200">9.4 Cross-Referenced Agency Policies (Enterprise Framework)</h3>
        <p className="text-sm text-gray-500 mb-3 italic">Note: All policy IDs below reflect the updated v6.0 framework codes.</p>
        <div className="h-96 overflow-y-auto border border-gray-200 rounded-xl shadow-inner">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-100 shadow-sm">
              <tr>
                <th className="p-3 font-montserrat font-bold text-sm text-gray-700">Policy ID</th>
                <th className="p-3 font-montserrat font-bold text-sm text-gray-700">Policy Title</th>
                <th className="p-3 font-montserrat font-bold text-sm text-gray-700">Relationship</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {REFERENCES_CROSS.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 text-sm font-bold text-[#007970] whitespace-nowrap">{row[0]}</td>
                  <td className="p-3 text-sm text-gray-800 font-medium">{row[1]}</td>
                  <td className="p-3 text-sm text-gray-600">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <SectionTitle icon={Award} title="10. Training Requirements" />
        <ul className="space-y-4">
          {[
            'All Governing Body members of Care Indeed Home Health Care, Inc. shall receive orientation to this policy within 14 calendar days of appointment. Orientation shall be conducted by the Administrator or Compliance Officer and must cover: (a) the legal authority and responsibilities of the Governing Body; (b) meeting and quorum requirements; (c) conflict of interest obligations; (d) QAPI, compliance, and financial oversight expectations; (e) CMS survey process and surveyor expectations for governance documentation.',
            'All Governing Body members and senior leadership personnel within scope of this policy (Section 3) shall sign the Policy Acknowledgment Form (Appendix C) within 14 calendar days of the policy effective date, any revision, or new appointment.',
            'The Administrator shall maintain a tracking log of all policy acknowledgments and report any non-compliance to the Governing Body Chair within 7 calendar days of the acknowledgment deadline. Failure to acknowledge within the required timeframe shall result in written notification from the Governing Body Chair with a mandatory completion deadline of 7 additional calendar days.',
            'Annual refresher training on governing body responsibilities shall be conducted at the first quarterly meeting of each calendar year. Attendance shall be documented in meeting minutes.',
          ].map((item, i) => (
            <li key={i} className="flex items-start bg-gray-50 p-4 rounded-lg">
              <div className="bg-[#007970] text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0">{i + 1}</div>
              <p className="text-[15px] leading-relaxed text-gray-800">{item}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle icon={FileLock2} title="11. Version Control" />
        <ul className="space-y-4">
          {[
            'This policy is maintained under the agency\'s enterprise policy lifecycle management system per policy EN-LC-001.',
            'Only the most current approved version of this policy, as reflected in the policy header, is valid for any operational, compliance, or regulatory purpose. All superseded versions must be archived and clearly marked as "SUPERSEDED — NOT FOR USE."',
            'Any substantive revision to this policy requires: (a) review and approval by the Governing Body, documented in meeting minutes; (b) re-acknowledgment by all personnel within scope, within 14 calendar days of the revised effective date; (c) update to the enterprise policy index per EN-TG-001.',
            'Non-substantive revisions (formatting, typographical corrections, updated cross-references) may be approved by the Administrator with notification to the Governing Body at the next regular meeting. Non-substantive revisions do not require re-acknowledgment.',
          ].map((item, i) => (
            <li key={i} className="flex items-start bg-gray-50 p-4 rounded-lg">
              <div className="bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0">{i + 1}</div>
              <p className="text-[15px] leading-relaxed text-gray-800">{item}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  </div>
);
// --- APPENDICES (Forms Library: same linkage as PolicyAppendicesPanel) ---

const GV_GB_LINKED_FORMS = getFormsForPolicy('GV-GB-001');

function appendixCode(index: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let n = index;
  let out = '';
  do {
    out = alphabet[n % 26] + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

const ViewAppendices = () => {
  const forms = GV_GB_LINKED_FORMS;
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const active = forms.find(f => f.id === activeFormId) ?? null;

  if (forms.length === 0) {
    return (
      <div className="p-8 text-center text-[#524048] font-roboto text-sm">
        No forms are linked to GV-GB-001 in the Forms Library.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pb-6 relative">
      <Card className="flex-shrink-0 mb-4 border-b-2 border-[#007970]">
        <div className="flex flex-col gap-3 mb-6">
          <SectionTitle icon={LayoutList} title="Appendices (Attached Forms)" />
          <p className="font-roboto text-sm text-gray-600 max-w-3xl">
            Attached appendix records open in a centered viewer modal using the live Enterprise Forms Library renderer.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {forms.map((f, idx) => {
            const label = `Appendix ${appendixCode(idx)}`;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFormId(f.id)}
                className="text-left rounded-xl border border-[#E5E4E3] bg-white p-4 shadow-sm hover:border-[#007970]/50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#007970]/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#007970] mb-2">
                      {label} · {f.id}
                    </div>
                    <h3 className="font-montserrat text-sm font-bold text-[#1F1C1B] leading-snug">{f.name || f.id}</h3>
                    <p className="mt-2 font-roboto text-[11px] uppercase tracking-[0.14em] text-[#747470]">
                      {f.type} · {f.frequency}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#007970]/30 bg-[#007970]/10 px-2 py-1 font-mono text-[10px] text-[#007970]">
                    Attached
                  </span>
                </div>
                <span className="mt-4 inline-flex items-center gap-2 font-roboto text-xs font-semibold text-[#007970]">
                  Open attached form <ExternalLink size={12} aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <VeilModal
        open={Boolean(active)}
        onClose={() => setActiveFormId(null)}
        size="xl"
        eyebrow={active?.id}
        title={active?.name || 'Attached appendix form'}
        headerActions={active && (
          <button
            type="button"
            onClick={() => openPolicyPrintRoute(`/print/GV-GB-001/appendix/${encodeURIComponent(active.id)}`)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 hover:border-[#007970]/60 hover:bg-[#007970]/15 transition-colors"
          >
            <Printer size={14} /> Print Form
          </button>
        )}
      >
        {active && (
          <div className="max-h-[72vh] overflow-y-auto rounded-xl bg-white p-4">
            <FormViewer formId={active.id} enableEmbeddedSigning formSource="policy_viewer" />
          </div>
        )}
      </VeilModal>
    </div>
  );
};

// ─── CONFIG (centralised) — edit here to update all transitions & section order ─

/** Transition animation timing — one place to change everything. */
const ANIMATION_CONFIG = {
  duration: 220,     // ms — keep subtle; increase for slower feel
  easing: 'ease-out',
  slideDistance: 26, // px — lateral travel distance on enter
} as const;

/** Procedure sub-tab definitions — order here controls tab order in Section 6. */
const PROCEDURE_SUBTABS = [
  { id: '6.1', label: '6.1 Establishment' },
  { id: '6.2', label: '6.2 Core Responsibilities' },
  { id: '6.3', label: '6.3 Meetings' },
  { id: '6.4', label: '6.4 Conflict of Interest' },
  { id: '6.5', label: '6.5 Escalation' },
] as const;

// ─── MAIN TABS SHELL ─────────────────────────────────────────────────────────

const NAV_TABS = [
  { id: 'overview',     label: 'Overview & Definitions',  Icon: Info },
  { id: 'policy',       label: 'Policy Statements',        Icon: Shield },
  { id: 'procedures',   label: 'Procedures',               Icon: Settings },
  { id: 'documentation',label: 'Documentation',            Icon: FileText },
  { id: 'compliance',   label: 'Compliance & Audit',       Icon: CheckSquare },
  { id: 'references',   label: 'References & Admin',       Icon: Archive },
  { id: 'appendices',   label: 'Appendices (Forms)',       Icon: LayoutList },
] as const;

type TabId = typeof NAV_TABS[number]['id'];

type GVGBDetailViewProps = {
  onBackToLibrary?: () => void;
};

export function GVGBDetailView({ onBackToLibrary }: GVGBDetailViewProps = {}) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [contentKey, setContentKey] = useState(0);
  const navigate = useNavigate();
  const setDetailMode = useShellStore(s => s.setDetailMode);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Care Indeed Home Health Care, Inc. - Policies and Procedures';
    setDetailMode(true);
    return () => {
      document.title = prev;
      setDetailMode(false);
    };
  }, [setDetailMode]);

  /** Navigate to a tab with directional animation. */
  const navigateToTab = (tabId: TabId) => {
    if (tabId === activeTab) return;
    const curr = NAV_TABS.findIndex(t => t.id === activeTab);
    const next = NAV_TABS.findIndex(t => t.id === tabId);
    setDirection(next > curr ? 1 : -1);
    setContentKey(k => k + 1);
    setActiveTab(tabId);
  };

  // ← / → keyboard navigation between tabs
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable) return;
      const curr = NAV_TABS.findIndex(t => t.id === activeTab);
      if (e.key === 'ArrowRight' && curr < NAV_TABS.length - 1) {
        e.preventDefault();
        setDirection(1);
        setContentKey(k => k + 1);
        setActiveTab(NAV_TABS[curr + 1].id);
      } else if (e.key === 'ArrowLeft' && curr > 0) {
        e.preventDefault();
        setDirection(-1);
        setContentKey(k => k + 1);
        setActiveTab(NAV_TABS[curr - 1].id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':      return <ViewOverview />;
      case 'policy':        return <ViewPolicyStatements />;
      case 'procedures':    return <ViewProcedures />;
      case 'documentation': return <ViewDocumentation />;
      case 'compliance':    return <ViewCompliance />;
      case 'references':    return <ViewReferencesAdmin />;
      case 'appendices':    return <ViewAppendices />;
      default:              return <ViewOverview />;
    }
  };

  // No animation on initial load (contentKey === 0)
  const animClass = contentKey > 0
    ? (direction === 1 ? 'gvgb-enter-right' : 'gvgb-enter-left')
    : '';

  return (
    <>
      {/* Keyframe definitions — scoped names prevent collision */}
      <style>{`
        @keyframes gvgb-from-right {
          from { opacity: 0; transform: translateX(${ANIMATION_CONFIG.slideDistance}px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes gvgb-from-left {
          from { opacity: 0; transform: translateX(-${ANIMATION_CONFIG.slideDistance}px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .gvgb-enter-right { animation: gvgb-from-right ${ANIMATION_CONFIG.duration}ms ${ANIMATION_CONFIG.easing} both; }
        .gvgb-enter-left  { animation: gvgb-from-left  ${ANIMATION_CONFIG.duration}ms ${ANIMATION_CONFIG.easing} both; }
      `}</style>

      {/*
        contain:paint clips overflow to the border-box for visual correctness
        (preserves rounded-xl corner clipping) without creating a scroll container,
        so sticky positioning inside still works relative to the page scroll.
      */}
      <div
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
        style={{ contain: 'paint' } as React.CSSProperties}
      >

        {/* ── SINGLE STICKY NAV ROW: [← Library · ID] [tabs…] [Print] ──────── */}
        <div className="sticky top-0 z-20 bg-white border-b border-[#E5E4E3] flex items-stretch">

          {/* Left anchor — back + policy ID */}
          <div className="flex items-center gap-2 px-4 shrink-0 border-r border-[#E5E4E3]">
            <button
              onClick={() => {
                if (onBackToLibrary) {
                  onBackToLibrary();
                  return;
                }
                navigate(-1);
              }}
              className="flex items-center gap-1 text-xs font-montserrat font-semibold text-[#524048] hover:text-[#1F1C1B] transition-colors whitespace-nowrap"
            >
              <ArrowLeft size={12} /> Library
            </button>
            <span className="font-montserrat font-medium text-[10px] text-[#007970] tracking-[0.14em] uppercase hidden md:block whitespace-nowrap">
              {POLICY_META.id}
            </span>
          </div>

          {/* Tabs — scrollable, fill remaining space */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex min-w-max h-full">
              {NAV_TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => navigateToTab(id)}
                  className={`flex items-center gap-2 px-5 py-3.5 font-montserrat font-semibold text-[13px] whitespace-nowrap border-b-[3px] transition-colors ${
                    activeTab === id
                      ? 'text-[#C74601] border-[#C74601]'
                      : 'text-[#524048] border-transparent hover:text-[#1F1C1B] hover:border-[#E5E4E3]'
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Right anchor — print */}
          <div className="flex items-center px-3 shrink-0 border-l border-[#E5E4E3]">
            <button
              onClick={() => openPolicyPrintRoute(`/print/${POLICY_META.id}`)}
              className="flex items-center gap-1.5 bg-[#FAFBF8] hover:bg-[#E5E4E3] text-[#1F1C1B] px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-colors border border-[#E5E4E3] whitespace-nowrap"
            >
              <Printer size={12} /> Print
            </button>
          </div>
        </div>

        {/* ── CONTENT — directionally animated on tab change ───────────────── */}
        <div
          key={contentKey}
          className={`p-5 lg:p-7 bg-[#FAFBF8] ${animClass}`}
        >
          {renderContent()}
        </div>
      </div>
    </>
  );
}
