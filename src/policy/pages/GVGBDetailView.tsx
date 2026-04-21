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
  LayoutList, ChevronRight, FileLock2, Award, ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { useShellStore } from '@/policy/stores/uiStore';

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

const PROCEDURES: Record<string, any[]> = {
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

const SectionTitle = ({ icon: Icon, title, color = 'text-[#D4AF37]' }: { icon?: React.ElementType; title: string; color?: string }) => (
  <h2 className={`font-montserrat text-2xl font-bold flex items-center mb-6 ${color}`}>
    {Icon && <Icon className="mr-3" size={28} />}
    {title}
  </h2>
);

const SimpleTable = ({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) => (
  <div className="overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm mb-6">
    <table className="w-full table-fixed text-left border-collapse">
      <thead>
        <tr className="bg-[#D4AF37] text-white">
          {headers.map((h, i) => (
            <th key={i} className="p-4 font-montserrat font-bold text-sm tracking-wide border-b border-[#006059]">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50 transition-colors even:bg-gray-50/30">
            {row.map((cell, j) => (
              <td key={j} className="p-4 text-gray-700 text-sm align-top leading-relaxed whitespace-pre-line">{cell}</td>
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
    className={`px-5 py-2.5 rounded-full font-montserrat font-bold text-sm transition-all duration-200 whitespace-nowrap ${
      active
        ? 'bg-[#D4AF37] text-white shadow-md'
        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
    }`}
  >
    {children}
  </button>
);

// ─── TAB VIEWS ────────────────────────────────────────────────────────────────

const ViewOverview = () => (
  <div className="space-y-6 pb-12">
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
              <CheckCircle className="text-[#D4AF37] mr-3 mt-0.5 flex-shrink-0" size={18} />
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
            <h4 className="font-montserrat font-extrabold text-[#D4AF37] mb-2">{def.term}</h4>
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
            <div className="bg-[#D4AF37] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold font-montserrat flex-shrink-0 mr-5 shadow-inner text-sm">
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
  const [activeSub, setActiveSub] = useState('6.2');

  const tabs = [
    { id: '6.1', label: '6.1 Establishment' },
    { id: '6.2', label: '6.2 Core Responsibilities' },
    { id: '6.3', label: '6.3 Meetings' },
    { id: '6.4', label: '6.4 Conflict of Interest' },
    { id: '6.5', label: '6.5 Escalation' },
  ];

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
            {(PROCEDURES['6.2'] as Array<{ title: string; rows: string[][] }>).map((section, idx) => (
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
              <ChevronRight className="text-[#D4AF37] mt-0.5 mr-2 flex-shrink-0" />
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
            <p className="font-bold text-sm text-[#D4AF37]">CMS State Operations Manual, Appx B — Guidance to Surveyors</p>
            <p className="text-sm text-gray-700 mt-1">Provides interpretive guidelines for survey of 42 CFR § 484.105 compliance; defines surveyor expectations for governing body evidence.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="font-bold text-sm text-[#D4AF37]">CMS OASIS-E2 Guidance Manual</p>
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
                  <td className="p-3 text-sm font-bold text-[#D4AF37] whitespace-nowrap">{row[0]}</td>
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
              <div className="bg-[#D4AF37] text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0">{i + 1}</div>
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

// ─── APPENDIX FORMS ───────────────────────────────────────────────────────────

const AppendixHeader = ({ title }: { id: string; title: string }) => (
  <div className="text-center mb-8 pb-6 border-b border-gray-100">
    <img
      src="https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_Gray.png"
      alt="Care Indeed Home Health Care"
      className="h-16 mx-auto mb-4 opacity-70"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
    <h3 className="font-montserrat text-2xl font-extrabold text-gray-900 mb-2">{title}</h3>
    <p className="text-xs text-gray-400 mt-1 italic">Care Indeed Home Health Care, Inc. · Policy GV-GB-001 · Version 6.0 · 2025-07-10</p>
  </div>
);

const AppendixA = () => (
  <div className="max-w-6xl mx-auto">
    <AppendixHeader id="A" title="Governing Body Membership Roster" />
    <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
      <strong>Instructions:</strong> The Governing Body Chair (or designee) shall update this roster within 7 calendar days of any membership change. A copy shall be maintained in the agency governance file and provided to the Administrator. This roster must be readily accessible for CMS survey review.
    </p>
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <table className="w-full text-left text-xs table-fixed border-collapse">
        <colgroup>
          <col className="w-[3%]" />
          <col className="w-[13%]" />
          <col className="w-[11%]" />
          <col className="w-[9%]" />
          <col className="w-[9%]" />
          <col className="w-[9%]" />
          <col className="w-[14%]" />
          <col className="w-[24%]" />
          <col className="w-[8%]" />
        </colgroup>
        <thead className="bg-gray-100 border-b border-gray-300">
          <tr>
            {['#', 'Full Legal Name', 'Title / Role', 'Voting Status', 'Appt Date', 'Term Exp', 'Competency Area', 'Email Address', 'OIG/SAM?'].map((h, i) => (
              <th key={i} className="p-2 font-bold border-r last:border-r-0 break-words leading-snug">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <tr key={i}>
              <td className="p-2 text-gray-400 border-r text-center text-xs">{i}</td>
              <td className="p-2 border-r"><input type="text" className="border-b border-gray-200 bg-transparent w-full focus:outline-none focus:border-[#D4AF37] text-xs" placeholder="Type here..." /></td>
              <td className="p-2 border-r"><input type="text" className="border-b border-gray-200 bg-transparent w-full focus:outline-none focus:border-[#D4AF37] text-xs" /></td>
              <td className="p-2 border-r"><select className="border border-gray-200 rounded p-1 w-full bg-transparent text-xs"><option>Voting</option><option>Non-Voting</option><option>Advisory</option></select></td>
              <td className="p-2 border-r"><input type="date" className="border border-gray-200 rounded p-1 text-xs w-full bg-transparent" /></td>
              <td className="p-2 border-r"><input type="date" className="border border-gray-200 rounded p-1 text-xs w-full bg-transparent" /></td>
              <td className="p-2 border-r"><input type="text" className="border-b border-gray-200 bg-transparent w-full focus:outline-none focus:border-[#D4AF37] text-xs" /></td>
              <td className="p-2 border-r"><input type="email" className="border-b border-gray-200 bg-transparent w-full focus:outline-none focus:border-[#D4AF37] text-xs" /></td>
              <td className="p-2 text-center"><input type="checkbox" className="w-4 h-4 text-[#D4AF37]" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="mt-8 grid grid-cols-2 gap-4 text-sm font-bold text-[#524048]">
      <div className="flex items-center flex-wrap gap-1">Roster Maintained By: <input type="text" className="border-b border-[#524048] bg-transparent focus:outline-none w-44 px-1 text-sm font-normal" aria-label="Roster Maintained By" /> Title: <input type="text" className="border-b border-[#524048] bg-transparent focus:outline-none w-32 ml-1 px-1 text-sm font-normal" aria-label="Title" /></div>
      <div className="flex items-center gap-1">Date Last Updated: <input type="text" className="border-b border-[#524048] bg-transparent focus:outline-none w-36 ml-1 px-1 text-sm font-normal" aria-label="Date Last Updated" /></div>
      <div className="flex items-center flex-wrap gap-1">Quorum Requirement: <input type="text" className="border-b border-[#524048] bg-transparent focus:outline-none w-10 ml-1 text-center text-sm font-normal" aria-label="Quorum number" /> of <input type="text" className="border-b border-[#524048] bg-transparent focus:outline-none w-10 mx-1 text-center text-sm font-normal" aria-label="Total voting members" /> voting members</div>
      <div className="flex items-center flex-wrap gap-1">Total Voting Members: <input type="text" className="border-b border-[#524048] bg-transparent focus:outline-none w-10 ml-1 text-center text-sm font-normal" aria-label="Total voting members count" /> | Total Non-Voting / Advisory Members: <input type="text" className="border-b border-[#524048] bg-transparent focus:outline-none w-10 ml-1 text-center text-sm font-normal" aria-label="Non-voting members count" /></div>
    </div>
  </div>
);

const AppendixB = () => (
  <div className="max-w-4xl mx-auto">
    <AppendixHeader id="B" title="Conflict of Interest Disclosure Form" />
    <p className="text-sm text-gray-600 mb-6 bg-orange-50 p-4 rounded-lg border border-orange-100">
      <strong>Instructions:</strong> Each Governing Body member shall complete this form: (1) at the time of initial appointment; (2) annually, at the first quarterly meeting of each calendar year; and (3) within 7 calendar days of any change in circumstances that could create a new actual or potential conflict. Submit to Compliance Officer.
    </p>
    <div className="space-y-8">
      <section>
        <h4 className="font-bold text-lg bg-gray-100 p-2 rounded mb-4">SECTION 1 — MEMBER INFORMATION</h4>
        <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          {[['Full Legal Name', 'text'], ['Title / Role on Governing Body', 'text'], ['Date of Appointment', 'date']].map(([label, type], i) => (
            <div key={i}>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{label}</label>
              <input type={type} className="border p-2 rounded w-full bg-white" />
            </div>
          ))}
          <div className="col-span-2 flex items-center gap-6 mt-2 pt-4 border-t border-gray-200">
            <span className="font-bold text-gray-700">Type of Disclosure:</span>
            {['Initial', 'Annual Renewal', 'Change in Circumstances'].map(opt => (
              <label key={opt} className="flex items-center"><input type="radio" name="disclosureType" className="mr-2 w-4 h-4" /> {opt}</label>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h4 className="font-bold text-lg bg-gray-100 p-2 rounded mb-4">SECTION 2 — FINANCIAL INTERESTS</h4>
        <p className="text-sm text-gray-600 mb-4 italic">Do you, or any member of your immediate family (spouse, domestic partner, parent, child, sibling), hold any of the following interests?</p>
        <table className="w-full text-sm text-left border border-gray-300">
          <thead className="bg-gray-100"><tr className="border-b border-gray-300"><th className="p-3 border-r">Question</th><th className="p-3 w-16 text-center border-r">Yes</th><th className="p-3 w-16 text-center border-r">No</th><th className="p-3 w-64">If Yes, Describe</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            {[
              '2.1 Ownership interest (equity, stock, partnership) in any entity that does business with, competes with, or provides referrals to Care Indeed Home Health Care, Inc.?',
              '2.2 Employment, consulting, or advisory relationship with any entity that does business with, competes with, or provides referrals to this agency?',
              '2.3 Financial interest in any vendor, supplier, or contractor used by the agency?',
              '2.4 Receipt of compensation, gifts, gratuities, or other benefits (exceeding $50 in aggregate annually) from any entity that does business with or seeks to do business with the agency?',
            ].map((q, i) => (
              <tr key={i}><td className="p-3 border-r font-medium">{q}</td><td className="text-center border-r"><input type="radio" name={`q2${i}`} className="w-4 h-4" /></td><td className="text-center border-r"><input type="radio" name={`q2${i}`} className="w-4 h-4" /></td><td className="p-2"><input type="text" className="w-full border-b bg-transparent" /></td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h4 className="font-bold text-lg bg-gray-100 p-2 rounded mb-4">SECTION 3 — PROFESSIONAL & ORGANIZATIONAL RELATIONSHIPS</h4>
        <table className="w-full text-sm text-left border border-gray-300">
          <thead className="bg-gray-100"><tr className="border-b border-gray-300"><th className="p-3 border-r">Question</th><th className="p-3 w-16 text-center border-r">Yes</th><th className="p-3 w-16 text-center border-r">No</th><th className="p-3 w-64">If Yes, Describe</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            {[
              '3.1 Do you serve on the board of directors, governing body, or advisory board of any other healthcare entity, referral source, or competitor?',
              '3.2 Do you have any professional relationship with any physician, physician group, hospital, skilled nursing facility, or other provider that refers patients to or receives referrals from Care Indeed Home Health Care, Inc.?',
              '3.3 Do you have any other relationship or interest that could reasonably be perceived as creating a conflict of interest with your duties as a Governing Body member?',
            ].map((q, i) => (
              <tr key={i}><td className="p-3 border-r font-medium">{q}</td><td className="text-center w-16 border-r"><input type="radio" name={`q3${i}`} className="w-4 h-4" /></td><td className="text-center w-16 border-r"><input type="radio" name={`q3${i}`} className="w-4 h-4" /></td><td className="p-2"><input type="text" className="w-full border-b bg-transparent" /></td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-[#D4AF37]/5 p-6 rounded-lg border border-[#D4AF37]/20">
        <h4 className="font-bold text-lg text-[#D4AF37] mb-4">SECTION 4 — ATTESTATION</h4>
        <p className="text-sm text-gray-700 mb-6">I hereby certify that the information provided above is true, complete, and accurate to the best of my knowledge. I understand that I have an ongoing obligation to disclose any new conflict within 7 calendar days, I must recuse myself from voting on conflicted matters, and failure to disclose a known conflict may result in removal from the Governing Body.</p>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Signature</label>
            <div className="border-b-2 border-gray-300 border-dashed h-10 w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date Signed</label>
            <input type="date" className="border-b-2 border-gray-300 w-full focus:outline-none focus:border-[#D4AF37] pb-2 text-gray-500 bg-transparent" />
          </div>
        </div>
      </section>
    </div>
  </div>
);

const AppendixC = () => (
  <div className="max-w-2xl mx-auto">
    <AppendixHeader id="C" title="Policy Acknowledgment Form" />
    <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200 shadow-sm">
      <p className="text-gray-800 font-bold mb-4">I, the undersigned, acknowledge that:</p>
      <ol className="list-decimal list-inside space-y-4 text-[15px] text-gray-700 ml-2">
        <li>I have received and read Policy <strong>GV-GB-001 — Governing Body Authority &amp; Responsibilities, Version 6.0</strong>, effective 2025-07-10.</li>
        <li>I understand the responsibilities, requirements, and expectations described in this policy as they apply to my role at Care Indeed Home Health Care, Inc.</li>
        <li>I understand that I am accountable for complying with this policy and that non-compliance may result in corrective action.</li>
        <li>I have had the opportunity to ask questions and receive clarification regarding any aspect of this policy.</li>
      </ol>
    </div>
    <div className="grid grid-cols-2 gap-6 bg-white p-8 border border-gray-300 rounded-xl shadow-sm">
      {[['Full Name (Printed)', 'text'], ['Title / Role', 'text']].map(([label, type], i) => (
        <div key={i}>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{label}</label>
          <input type={type} className="border-b-2 border-gray-300 w-full focus:outline-none focus:border-[#D4AF37] p-1" />
        </div>
      ))}
      <div className="col-span-2 mt-4">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Signature</label>
        <div className="border-b-2 border-gray-300 border-dashed h-16 w-full" />
      </div>
      <div className="col-span-2 mt-4">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date Signed</label>
        <input type="date" className="border-b-2 border-gray-300 w-full md:w-1/2 focus:outline-none focus:border-[#D4AF37] p-1 text-gray-600" />
      </div>
    </div>
  </div>
);

const AppendixD = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <AppendixHeader id="D" title="Governing Body Meeting Minutes Template" />
    <p className="text-sm text-gray-600 bg-gray-100 p-4 rounded-lg border border-gray-200">
      <strong>Instructions:</strong> Use this template for all regular and special Governing Body meetings. Draft minutes shall be completed within 14 calendar days of the meeting and retained for a minimum of 7 years.
    </p>
    <div className="border border-gray-300 p-8 rounded-xl space-y-8 bg-gray-50">
      <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-lg border border-gray-200">
        {[
          { label: 'Meeting Type', type: 'select', options: ['Regular Quarterly', 'Special', 'Annual'] },
          { label: 'Date', type: 'date' },
          { label: 'Time (Start/End)', type: 'text', placeholder: '00:00 - 00:00' },
          { label: 'Location', type: 'text', placeholder: 'In-Person: 890 Santa Cruz Ave, Menlo Park, CA' },
        ].map((field, i) => (
          <div key={i}>
            <span className="font-bold text-sm text-gray-600 uppercase">{field.label}:</span>
            {field.type === 'select' ? (
              <select className="border-b border-gray-300 ml-2 p-1 bg-transparent w-full mt-1">{field.options!.map(o => <option key={o}>{o}</option>)}</select>
            ) : (
              <input type={field.type} placeholder={field.placeholder} className="border-b border-gray-300 ml-2 p-1 bg-transparent w-full mt-1 text-gray-500" />
            )}
          </div>
        ))}
      </div>

      <div>
        <h4 className="font-bold bg-[#D4AF37] text-white p-3 rounded-t-lg uppercase text-sm tracking-wide">ATTENDANCE &amp; QUORUM</h4>
        <table className="w-full text-sm border-l border-r border-b border-gray-300 bg-white rounded-b-lg overflow-hidden">
          <thead><tr className="bg-gray-100 border-b border-gray-300"><th className="p-3 border-r text-left">Member Name</th><th className="p-3 border-r w-24 text-center">Present?</th><th className="p-3 text-left">Attendance Method</th></tr></thead>
          <tbody>
            {[1, 2, 3, 4, 5].map(i => (
              <tr key={i} className="border-b border-gray-200 last:border-0">
                <td className="p-2 border-r"><input type="text" className="w-full bg-transparent focus:outline-none" /></td>
                <td className="p-2 border-r text-center"><input type="checkbox" className="w-4 h-4" /></td>
                <td className="p-2"><input type="text" className="w-full bg-transparent focus:outline-none" placeholder="In-person / Video" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex items-center gap-6 text-sm font-bold text-gray-700">
          <span>Quorum Required: <input type="number" className="w-12 border-b text-center mx-1" /></span>
          <span>Members Present: <input type="number" className="w-12 border-b text-center mx-1" /></span>
          <span>Quorum Achieved? <label className="ml-2 font-normal"><input type="radio" name="quorum" className="mr-1" />Yes</label> <label className="ml-2 font-normal"><input type="radio" name="quorum" className="mr-1" />No</label></span>
        </div>
      </div>

      <div>
        <h4 className="font-bold bg-[#D4AF37] text-white p-3 rounded-t-lg uppercase text-sm tracking-wide">STANDING AGENDA ITEMS (Summary)</h4>
        <div className="space-y-4 bg-white border-l border-r border-b border-gray-300 p-6 rounded-b-lg">
          {['3. Administrator Report', '4. Compliance Report', '5. QAPI Report', '6. Financial Report'].map((item, i) => (
            <div key={i} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
              <strong className="text-gray-800 text-[15px] block mb-2">{item}:</strong>
              <textarea className="w-full border border-gray-300 p-3 h-20 rounded bg-white text-sm resize-none" placeholder="Document summary, discussion, action items, responsible party, and deadline..." />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AppendixE = () => {
  const checklistItems = [
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
  return (
    <div className="max-w-6xl mx-auto">
      <AppendixHeader id="E" title="Quarterly Governance Oversight Checklist" />
      <p className="text-sm text-gray-600 mb-6 bg-[#D4AF37]/10 p-5 rounded-lg border border-[#D4AF37]/20 leading-relaxed">
        <strong>Purpose:</strong> To provide the Governing Body Chair and Administrator with a structured checklist to verify that all required oversight activities are completed each quarter, supporting continuous survey readiness and compliance with 42 CFR § 484.105.
      </p>
      <div className="flex items-center gap-6 mb-6 font-bold text-gray-700 bg-gray-100 p-4 rounded-lg">
        <span>Quarter: {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <label key={q} className="ml-3 font-normal"><input type="radio" name="quarter" className="mr-1" />{q}</label>)}</span>
        <span className="ml-8">Calendar Year: <input type="text" className="w-24 border-b border-gray-400 bg-transparent text-center" /></span>
      </div>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#D4AF37] text-white">
            <tr><th className="p-3 border-r border-[#006059] w-12 text-center">#</th><th className="p-3 border-r border-[#006059]">Oversight Item</th><th className="p-3 border-r border-[#006059] w-28 text-center">Y / N / N-A</th><th className="p-3 w-64">Notes / Corrective Action if "No"</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {checklistItems.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-3 border-r font-bold text-gray-400 text-center">{i + 1}</td>
                <td className="p-3 border-r font-medium text-gray-800">{item}</td>
                <td className="p-3 border-r text-center">
                  <select className="border border-gray-300 rounded p-1 w-full bg-white font-medium text-gray-700">
                    <option value="" /><option value="Y">Y</option><option value="N">N</option><option value="NA">N/A</option>
                  </select>
                </td>
                <td className="p-3"><input type="text" className="w-full bg-transparent border-b border-gray-200 focus:outline-none focus:border-[#D4AF37]" placeholder="Document here..." /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm font-bold text-gray-600 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div>Completed By: <span className="border-b border-gray-400 inline-block w-48 mx-2" /></div>
        <div>Title: <span className="border-b border-gray-400 inline-block w-48 mx-2" /></div>
        <div>Date: <span className="border-b border-gray-400 inline-block w-48 mx-2" /></div>
        <div>Presented to Chair? <label className="ml-2 font-normal"><input type="checkbox" className="mr-1" />Yes</label> — Date: <span className="border-b border-gray-400 inline-block w-24 ml-2" /></div>
      </div>
    </div>
  );
};

const AppendixF = () => (
  <div className="max-w-6xl mx-auto">
    <AppendixHeader id="F" title="Annual Governance Calendar" />
    <p className="text-sm text-gray-600 mb-6 bg-gray-100 p-5 rounded-lg border border-gray-200 leading-relaxed">
      <strong>Purpose:</strong> To provide a consolidated annual calendar of all Governing Body actions required by this policy and cross-referenced policies, ensuring no required action is missed.
    </p>
    <SimpleTable
      headers={['Quarter', 'Required Actions', 'Policy Reference', 'Responsible Party']}
      rows={[
        ['Q1', '• Convene regular quarterly meeting.\n• Review and approve the annual QAPI plan.\n• Conduct annual Governing Body composition review (competency coverage).\n• Collect annual Conflict of Interest disclosures from all members.\n• Conduct annual refresher training on governance responsibilities.\n• Conduct annual Governance Self-Assessment (if adopted).', 'GV-GB-001 §6.3\nGV-GB-001 §6.2.4.1; QA-PG-002\nGV-GB-001 §6.1.3\nGV-GB-001 §6.4.1; GV-GB-003\nGV-GB-001 §10.4\nGV-GB-005', 'Governing Body Chair\nGoverning Body\nGoverning Body Chair\nCompliance Officer\nAdministrator\nGoverning Body Chair'],
        ['Q2', '• Convene regular quarterly meeting.\n• Review and approve succession plan for key leadership.\n• Review scope of services (if fiscal year begins Q3).', 'GV-GB-001 §6.3\nGV-GB-001 §6.2.2.5; GV-GB-004\nGV-GB-001 §6.2.1.3; GV-OG-003', 'Governing Body Chair\nGoverning Body\nGoverning Body'],
        ['Q3', '• Convene regular quarterly meeting.\n• Review and approve Emergency Preparedness Plan.\n• Review emergency drill results.', 'GV-GB-001 §6.3\nGV-GB-001 §6.2.6.1; OP-FM-005\nGV-GB-001 §6.2.6.2', 'Governing Body Chair\nGoverning Body\nAdministrator'],
        ['Q4', '• Convene regular quarterly meeting.\n• Review and approve annual operating budget for upcoming fiscal year.\n• Complete annual Administrator performance evaluation.\n• Establish and distribute next year\'s meeting schedule by December 15.\n• Review and approve scope of services for upcoming year.', 'GV-GB-001 §6.3\nGV-GB-001 §6.2.5.1; FN-FP-005\nGV-GB-001 §6.2.2.4\nGV-GB-001 §6.3.1\nGV-GB-001 §6.2.1.3', 'Governing Body Chair\nGoverning Body\nGoverning Body\nGoverning Body Chair\nGoverning Body'],
        ['Ongoing\n(Every Meeting)', '• Review Administrator report.\n• Review Compliance Officer report.\n• Review QAPI report.\n• Review financial report.\n• Review status of prior meeting directives.\n• Verify OIG/SAM screening currency for all members.', 'GV-GB-001 §6.2.5.2\nGV-GB-001 §6.2.3.2\nGV-GB-001 §6.2.4.2\nGV-GB-001 §6.2.5.2\nGV-GB-001 §6.3.4\nGV-GB-001 §6.1.4; HR-TA-003', 'Administrator\nCompliance Officer\nClinical Manager\nAdministrator\nDesignated Secretary\nCompliance Officer'],
        ['Ongoing\n(Monthly)', '• OIG/SAM exclusion screening of all Governing Body members.', 'GV-GB-001 §6.1.4; HR-TA-003', 'Compliance Officer'],
      ]}
    />
  </div>
);

const AppendixG = () => (
  <div className="max-w-5xl mx-auto pb-12 overflow-x-auto">
    <AppendixHeader id="G" title="Agency Organizational Chart" />
    <p className="text-sm text-gray-600 mb-10 bg-[#D4AF37]/5 p-5 rounded-xl border border-[#D4AF37]/20 text-center leading-relaxed max-w-4xl mx-auto">
      <strong>Agency Organizational Structure:</strong> This chart illustrates the reporting relationships and accountability framework from the Governing Body through the senior administrative and clinical leadership, as required by 42 CFR § 484.105.
    </p>
    <div className="min-w-[900px] flex flex-col items-center w-full pb-10">
      {/* Level 1 */}
      <div className="bg-[#D4AF37] text-white p-5 rounded-2xl w-72 text-center shadow-lg border-2 border-[#004d47] z-10">
        <h4 className="font-bold text-lg uppercase tracking-wider mb-2">Governing Body</h4>
        <p className="text-xs text-[#D4AF37] bg-white px-3 py-1 rounded-full inline-block font-bold shadow-sm">Ultimate Legal Authority</p>
      </div>
      <div className="w-px h-8 bg-gray-300" />
      <div className="w-[464px] border-t-4 border-gray-300" />
      <div className="flex justify-between w-[464px]">
        <div className="w-px h-8 bg-gray-300" /><div className="w-px h-8 bg-gray-300" />
      </div>
      {/* Level 2 */}
      <div className="flex gap-8 justify-center">
        <div className="flex flex-col items-center w-[256px]">
          <div className="bg-gray-800 text-white p-5 rounded-xl w-full text-center shadow-md border-2 border-gray-900">
            <h4 className="font-bold text-sm uppercase tracking-wider mb-3">Compliance Officer</h4>
            <input type="text" placeholder="Enter Name..." className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-center focus:outline-none focus:border-gray-500 placeholder-gray-500 font-medium" />
          </div>
        </div>
        <div className="flex flex-col items-center w-[608px]">
          <div className="bg-[#C74600] text-white p-5 rounded-xl w-72 text-center shadow-md z-10 border-2 border-[#943400]">
            <h4 className="font-bold text-sm uppercase tracking-wider mb-3">Administrator</h4>
            <input type="text" placeholder="Enter Name..." className="w-full bg-[#943400]/50 border border-[#943400] rounded-lg p-2 text-sm text-center focus:outline-none focus:border-[#e85200] placeholder-white/60 font-medium" />
          </div>
          <div className="w-px h-8 bg-gray-300" />
          <div className="w-[416px] border-t-4 border-gray-300" />
          <div className="flex justify-between w-[416px]">
            <div className="w-px h-8 bg-gray-300" /><div className="w-px h-8 bg-gray-300" /><div className="w-px h-8 bg-gray-300" />
          </div>
          {/* Level 3 */}
          <div className="flex justify-between w-full">
            {[
              { label: 'Clinical Manager', color: 'border-[#D4AF37]', textColor: 'text-[#D4AF37]', sub: 'Clinical Staff\n(RN, PT, OT, ST, MSW, CHHA)' },
              { label: 'Medical Director', color: 'border-gray-400', textColor: 'text-gray-700', sub: null },
              { label: 'Business Operations', color: 'border-gray-400', textColor: 'text-gray-700', sub: 'HR, Finance, Intake,\n& Scheduling' },
            ].map((role, i) => (
              <div key={i} className="flex flex-col items-center w-[192px]">
                <div className={`bg-white border-2 ${role.color} p-4 rounded-xl w-full text-center shadow-sm`}>
                  <h4 className={`font-bold text-xs ${role.textColor} uppercase tracking-wider mb-3`}>{role.label}</h4>
                  <input type="text" placeholder="Enter Name..." className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-center focus:outline-none focus:border-[#D4AF37] placeholder-gray-400 text-gray-800 font-medium" />
                </div>
                {role.sub && (
                  <>
                    <div className="w-px h-6 bg-gray-300" />
                    <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg w-[170px] text-center text-xs text-gray-600 font-medium shadow-sm whitespace-pre-line">{role.sub}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── APPENDICES SHELL (with Print Form + Sign on Dropbox) ────────────────────

const APPENDIX_DEFS = [
  { id: 'A', label: 'Membership Roster',        title: 'Governing Body Membership Roster',    Component: AppendixA },
  { id: 'B', label: 'Conflict of Interest',     title: 'Conflict of Interest Form',            Component: AppendixB },
  { id: 'C', label: 'Policy Acknowledgment',    title: 'Policy Acknowledgment Form',           Component: AppendixC },
  { id: 'D', label: 'Meeting Minutes',          title: 'Meeting Minutes Template',             Component: AppendixD },
  { id: 'E', label: 'Oversight Checklist',      title: 'Quarterly Oversight Checklist',        Component: AppendixE },
  { id: 'F', label: 'Governance Calendar',      title: 'Annual Governance Calendar',           Component: AppendixF },
  { id: 'G', label: 'Org Chart',                title: 'Agency Organizational Chart',          Component: AppendixG },
];

const ViewAppendices = () => {
  const [activeApp, setActiveApp] = useState('A');
  const activeAppDef = APPENDIX_DEFS.find(a => a.id === activeApp)!;
  const { Component: ActiveComponent } = activeAppDef;

  return (
    <div className="h-full flex flex-col pb-6 relative">
      {/* Header card with title + buttons — exact HTML design */}
      <Card className="flex-shrink-0 mb-4 border-b-4 border-[#D4AF37]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <SectionTitle icon={LayoutList} title="Appendices (Forms & Templates)" />
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={() => window.open('https://sign.dropbox.com', '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2 bg-[#0061FE]/10 hover:bg-[#0061FE]/20 text-[#0061FE] px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-[#0061FE]/30"
            >
              <ExternalLink size={16} />
              Sign on Dropbox
            </button>
            <button
              onClick={() => window.open(`/print/GV-GB-001/appendix/${activeApp}`, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-gray-300"
            >
              <Printer size={16} />
              Print Form
            </button>
          </div>
        </div>
        {/* Appendix sub-tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {APPENDIX_DEFS.map(app => (
            <TabButton key={app.id} active={activeApp === app.id} onClick={() => setActiveApp(app.id)}>
              {app.label}
            </TabButton>
          ))}
        </div>
      </Card>

      {/* Active appendix form — its own contained area, scrollable */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto p-6 lg:p-10">
        <ActiveComponent />
      </div>
    </div>
  );
};

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

export function GVGBDetailView() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':     return <ViewOverview />;
      case 'policy':       return <ViewPolicyStatements />;
      case 'procedures':   return <ViewProcedures />;
      case 'documentation':return <ViewDocumentation />;
      case 'compliance':   return <ViewCompliance />;
      case 'references':   return <ViewReferencesAdmin />;
      case 'appendices':   return <ViewAppendices />;
      default:             return <ViewOverview />;
    }
  };

  return (
    <div className="space-y-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      {/* ── DOCUMENT HEADER / COVER BLOCK ────────────────────────────────── */}
      <div className="bg-[#D4AF37] text-white relative p-8">
        {/* Back + Print row */}
        <div className="flex items-start justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-montserrat font-bold text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} /> Return to Policy Library
          </button>
          <button
            onClick={() => window.open(`/print/${POLICY_META.id}`, '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-white/20"
          >
            <Printer size={16} />
            Print / Export PDF
          </button>
        </div>

        {/* ID badge */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-montserrat font-bold">{POLICY_META.id}</span>
          <span className="rounded-md bg-[#C74600] px-2.5 py-1 text-[10px] font-montserrat font-bold uppercase tracking-wider border border-[#C74600]">Draft</span>
          <span className="rounded-md bg-white/10 border border-white/30 px-2.5 py-1 text-[10px] font-montserrat font-bold uppercase tracking-wider">{POLICY_META.tier}</span>
        </div>

        {/* Title */}
        <h2 className="font-montserrat text-3xl font-extrabold leading-tight tracking-tight mb-3">
          {POLICY_META.title}
        </h2>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3 text-sm mt-4 border-t border-white/20 pt-4">
          {[
            ['Domain',          POLICY_META.domain],
            ['Tier',            POLICY_META.tier],
            ['Approved By',     POLICY_META.approvedBy],
            ['Supersedes',      POLICY_META.supersedes],
            ['Effective Date',  POLICY_META.effective],
            ['Last Reviewed',   POLICY_META.lastReviewed],
            ['Next Review',     POLICY_META.nextReviewDate],
            ['Version',         `v${POLICY_META.version}`],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-white/70 block text-xs uppercase tracking-wider font-bold">{label}</span>
              <strong className="text-white text-sm">{value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* ── TAB BAR ──────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-gray-50 overflow-x-auto">
        <div className="flex min-w-max">
          {NAV_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-5 py-3.5 text-xs font-montserrat font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-white'
              }`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <div className="p-6 lg:p-8 bg-[#FAFBF8]">
        {renderContent()}
      </div>
    </div>
  );
}
