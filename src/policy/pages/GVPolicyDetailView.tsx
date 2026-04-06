/**
 * GVPolicyDetailView.tsx
 * Specialized detail views for GV domain policies (GV-GB-002 through GV-EA-005).
 * Same visual framework as GVGBDetailView.tsx.
 * Each policy has full structured content across all tabs.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Printer, FileText, Shield, Search, CheckCircle, BookOpen,
  AlertTriangle, Settings, List, CheckSquare, Archive, Info,
  ChevronRight, ArrowLeft, Paperclip, Bell, HelpCircle,
  ClipboardList, Clock,
} from 'lucide-react';

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/5 border border-white/10 rounded-xl p-6 mb-6 ${className}`}>{children}</div>
);

const SectionTitle = ({ icon: Icon, title, color = 'text-white' }: { icon?: React.ElementType; title: string; color?: string }) => (
  <h2 className={`font-montserrat text-2xl font-bold flex items-center mb-6 ${color}`}>
    {Icon && <Icon className="mr-3" size={28} />}
    {title}
  </h2>
);

const SimpleTable = ({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) => (
  <div className="overflow-hidden rounded-xl border border-white/10 mb-6">
    <table className="w-full table-fixed text-left border-collapse">
      <thead>
        <tr className="bg-white/10">
          {headers.map((h, i) => (
            <th key={i} className="p-4 font-montserrat font-bold text-[11px] text-white/50 tracking-widest uppercase border-b border-white/10">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-white/[0.02] transition-colors even:bg-white/[0.02]">
            {row.map((cell, j) => (
              <td key={j} className="p-4 text-white/70 text-sm align-top leading-relaxed whitespace-pre-line">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// (TabButton not used in this component — inline styling used for tab bar)

const LOGO = 'https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_Gray.png';

// ─── APPENDIX HELPERS ────────────────────────────────────────────────────────
function AppxHeader({ policyId, version, title }: { policyId: string; version: string; title: string }) {
  return (
    <div className="text-center mb-8 pb-6 border-b-2 border-white/10">
      <img src={LOGO} alt="Care Indeed" className="h-14 mx-auto mb-4 opacity-40" />
      <h3 className="font-montserrat text-2xl font-extrabold text-white mb-1">{title}</h3>
      <p className="text-xs text-white/30 italic">Care Indeed Home Health Care, Inc. · Policy {policyId} · Version {version} · 2025-07-10</p>
    </div>
  );
}
function FormField({ label, lines = 1 }: { label: string; lines?: number }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-montserrat font-bold text-white/40 uppercase tracking-widest mb-1">{label}</label>
      {lines === 1
        ? <div className="border-b border-white/20 h-8 rounded-sm" />
        : <div className="border border-white/10 rounded" style={{ height: lines * 30 }} />}
    </div>
  );
}
function AppxSecHead({ title }: { title: string }) {
  return <div className="bg-[#00e59b]/20 text-[#00e59b] border border-[#00e59b]/30 px-4 py-2 rounded-t text-xs font-montserrat font-bold uppercase tracking-widest mt-6 mb-0">{title}</div>;
}
function ChkRow({ label }: { label: string }) {
  return (
    <div className="flex items-start py-2 border-b border-white/10 last:border-0">
      <span className="text-white/30 mr-3 mt-0.5 text-sm shrink-0">☐</span>
      <span className="text-sm text-white/70 font-roboto">{label}</span>
    </div>
  );
}
function SigBlock({ left, right }: { left: string; right: string }) {
  return (
    <div className="grid grid-cols-2 gap-6 mt-4 pt-4 border-t border-white/10">
      <div><div className="border-b border-dashed border-white/20 h-8 mb-1" /><p className="text-xs text-white/40">{left}</p></div>
      <div><div className="border-b border-dashed border-white/20 h-8 mb-1" /><p className="text-xs text-white/40">{right}</p></div>
    </div>
  );
}
function TblHead({ cols }: { cols: string[] }) {
  return (
    <thead className="bg-white/5">
      <tr>{cols.map(c => <th key={c} className="p-2 text-left text-xs font-montserrat font-bold text-white/50 uppercase border-b border-white/10 whitespace-nowrap tracking-wider">{c}</th>)}</tr>
    </thead>
  );
}
function EmptyRows({ count, cols }: { count: number; cols: number }) {
  return (
    <tbody>{Array.from({ length: count }, (_, i) => (
      <tr key={i} className="border-b border-white/10">
        {Array.from({ length: cols }, (_, j) => <td key={j} className="p-2 h-9 border-l first:border-l-0 border-white/10" />)}
      </tr>
    ))}</tbody>
  );
}

// ─── POLICY CONTENT REGISTRY ──────────────────────────────────────────────────

// ─── OPTIONAL SECTION TYPES ─────────────────────────────────────────────────
interface PolicyAlert {
  level: 'critical' | 'warning' | 'info';
  title: string;
  body: string;
  date: string;
  source?: string;
}
interface PolicyFAQ {
  q: string;
  a: string;
}
interface PolicyException {
  date: string;
  requestedBy: string;
  description: string;
  status: 'Approved' | 'Denied' | 'Under Review';
  approvedBy: string;
  expiresOn?: string;
}
interface PolicyAmendment {
  version: string;
  date: string;
  author: string;
  summary: string;
  sections?: string;
}

interface PolicyContent {
  id: string;
  title: string;
  domain: string;
  subdomain: string;
  tier: string;
  version: string;
  effective: string;
  approvedBy: string;
  lastReviewed: string;
  nextReviewDate: string;
  supersedes: string;
  ownerSteward: string;
  purpose: string;
  scopeItems: string[];
  definitions: { term: string; definition: string }[];
  statements: string[];
  procedures: string[][];
  documentationRows: string[][];
  complianceIndicators: string[][];
  commonFailures: string[][];
  surveyorItems: string[];
  federalRefs: string[][];
  crossRefs: string[][];
  trainingItems: string[];
  // ── Optional sections — hidden if absent/empty ────────────────────────────
  alerts?: PolicyAlert[];
  faq?: PolicyFAQ[];
  exceptions?: PolicyException[];
  amendments?: PolicyAmendment[];
}

// ─── CONTENT DATA ─────────────────────────────────────────────────────────────

const GV_GB_002: PolicyContent = {
  id: 'GV-GB-002', title: 'Governing Body Meetings & Documentation',
  domain: 'GV — Governance & Administration', subdomain: 'GB — Governing Body',
  tier: 'REQUIRED', version: '6.0', effective: '2025-07-10',
  approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
  lastReviewed: '2025-07-10', nextReviewDate: '2026-07-10', supersedes: 'N/A (Initial Version)',
  ownerSteward: 'Board Chair',
  purpose: 'This policy establishes requirements for scheduling, conducting, and documenting all Governing Body meetings at Care Indeed Home Health Care, Inc. Proper meeting documentation is a primary surveyor focus and a fundamental requirement of 42 CFR § 484.105. Without adequate meeting records, the agency cannot demonstrate that the Governing Body is actively exercising its oversight responsibilities.',
  scopeItems: [
    'All members of the Governing Body, including voting and non-voting members',
    'The Governing Body Chair responsible for scheduling and presiding',
    'The Designated Secretary responsible for minute preparation',
    'The Administrator responsible for agenda preparation and report delivery',
    'Any contracted management entities performing governance functions',
  ],
  definitions: [
    { term: 'Quorum', definition: 'The minimum number of Governing Body members required to be present to conduct official business, as defined in the agency bylaws or operating agreement.' },
    { term: 'Regular Meeting', definition: 'A scheduled quarterly meeting of the Governing Body held to fulfill ongoing oversight and reporting requirements.' },
    { term: 'Special Meeting', definition: 'An unscheduled meeting convened to address urgent matters that cannot wait until the next regular meeting.' },
    { term: 'Executive Session', definition: 'A portion of a meeting restricted to Governing Body members only, typically addressing personnel, legal, or sensitive compliance matters.' },
    { term: 'Meeting Minutes', definition: 'The official written record of a Governing Body meeting documenting attendance, quorum, motions, votes, and directives.' },
  ],
  statements: [
    '4.1 The Governing Body of Care Indeed Home Health Care, Inc. shall meet no fewer than four (4) times per calendar year (quarterly) to fulfill its oversight responsibilities, as required by 42 CFR § 484.105 and agency policy GV-GB-001.',
    '4.2 Each meeting shall achieve quorum before conducting any official business. The quorum requirement is defined in the agency operating agreement or bylaws.',
    '4.3 Formal written minutes shall be prepared for every Governing Body meeting — regular and special — and shall be approved at the next regular meeting.',
    '4.4 Meeting minutes shall constitute the official record of Governing Body decisions and shall be sufficient to demonstrate active governance oversight to CMS surveyors.',
    '4.5 Meeting schedules, agendas, and minutes shall be retained for a minimum of seven (7) years per agency record retention policy CO-HP-007.',
  ],
  procedures: [
    ['6.1.1', 'Governing Body Chair', 'Establish and distribute the annual meeting schedule to all Governing Body members no later than December 15 of the preceding calendar year. The schedule must include the date, time, and location (or teleconference link) for all four quarterly meetings.', 'By December 15 of each year.'],
    ['6.1.2', 'Administrator', 'Prepare and distribute the meeting agenda to all Governing Body members no fewer than 7 calendar days before each scheduled meeting. Standing agenda items must include: (a) call to order and quorum verification; (b) approval of prior minutes; (c) Administrator report; (d) Compliance Officer report; (e) QAPI report; (f) Financial report; (g) old business; (h) new business; (i) adjournment.', '7 calendar days before each meeting.'],
    ['6.1.3', 'Governing Body Chair', 'Convene special meetings when urgent matters arise. Written notice must be provided to all members at least 48 hours in advance, except for imminent patient safety threats where notice shall be as short as practicable.', '48-hour notice; shorter for patient safety emergencies.'],
    ['6.1.4', 'Designated Secretary', 'Record formal minutes for each meeting. Minutes must document: (a) date, time, and location; (b) members present (by name and role) and absent; (c) quorum verification result; (d) all motions with seconder and vote count; (e) substance of key discussions; (f) all directives with assigned responsible parties and deadlines; (g) executive session topics (without protected details).', 'Draft minutes within 14 calendar days of the meeting.'],
    ['6.1.5', 'Governing Body', 'Review and formally approve minutes from the prior meeting as the first substantive agenda item of each regular meeting. Corrections must be documented and any corrections noted in the current meeting minutes.', 'At the next regular meeting following the meeting recorded.'],
    ['6.2.1', 'Governing Body Chair', 'Ensure that all required standing reports are presented at each quarterly meeting. If a required presenter is unavailable, a qualified designee must present the report with the original reporter available for follow-up questions within 7 calendar days.', 'At each quarterly meeting.'],
    ['6.2.2', 'Designated Secretary', 'Maintain a complete governance file containing all meeting notices, agendas, minutes, and supporting materials. The file must be readily accessible for CMS survey review.', 'Continuously; file maintained at the agency and available within 4 hours of surveyor request.'],
  ],
  documentationRows: [
    ['Annual meeting schedule', 'Written schedule for all quarterly meetings distributed to members by December 15.', 'Governing Body Chair', 'Agency governance file.', 'Annually by December 15.'],
    ['Meeting agendas', 'Agenda distributed a minimum of 7 calendar days before each meeting.', 'Administrator / Designated Secretary', 'Agency governance file.', '7 days before each meeting; retained for 7 years.'],
    ['Meeting minutes — regular', 'Formal signed minutes for each quarterly meeting.', 'Designated Secretary (preparation); Governing Body Chair (signature)', 'Agency governance file.', 'Draft within 14 days; approved at next meeting; retained 7 years.'],
    ['Meeting minutes — special', 'Formal minutes for any special meeting.', 'Designated Secretary', 'Agency governance file.', 'Same standard as regular minutes.'],
    ['Attendance records', 'Sign-in sheets or teleconference participation logs for each meeting.', 'Designated Secretary', 'Agency governance file.', 'Completed at each meeting; retained with minutes.'],
    ['Directive tracking log', 'Log of all directives issued with assigned parties and completion status.', 'Administrator', 'Agency governance file.', 'Updated after each meeting; reviewed at each subsequent meeting.'],
  ],
  complianceIndicators: [
    ['Quarterly meetings are held.', 'Review of meeting minutes with dates.', '4 or more meetings per calendar year.'],
    ['Quorum is achieved and documented.', 'Review of minutes for quorum determination.', 'Quorum documented at every meeting.'],
    ['Agendas distributed 7 days in advance.', 'Review of email distribution logs or documented distribution.', '100% of meetings receive agenda at least 7 days prior.'],
    ['Minutes are complete and timely.', 'Review of minutes for required elements and draft date.', 'Draft minutes completed within 14 calendar days of each meeting.'],
    ['All required reports are presented.', 'Review of minutes for report presentation documentation.', '100% of required standing reports documented per meeting.'],
    ['Directive tracking is maintained.', 'Review of directive log for completeness.', 'All directives assigned and status tracked at each subsequent meeting.'],
  ],
  commonFailures: [
    ['Meetings held but minutes missing or incomplete.', 'Surveyors treat undocumented meetings as not having occurred.', 'Implement the Appendix D minutes template; complete draft within 14 calendar days.'],
    ['Quorum not verified or documented.', 'Meeting actions may be void; surveyor citation likely.', 'Designate quorum verification as the first agenda item; document in minutes.'],
    ['Agendas not distributed in advance.', 'Members arrive unprepared; surveyor may note lack of meeting discipline.', 'Systematize agenda preparation; build 7-day advance distribution into calendar.'],
    ['Directives not tracked or followed up.', 'Surveyors note passive governance when follow-up is absent.', 'Maintain a directive tracker reviewed as a standing agenda item at each meeting.'],
  ],
  surveyorItems: [
    'Surveyors will request all meeting minutes from the look-back period (typically 1-2 years).',
    'Surveyors will verify that quorum was present at each meeting where official business was conducted.',
    'Surveyors will review whether the Governing Body actively discussed and acted on QAPI, compliance, and financial reports, not merely received them.',
    'Surveyors will check that directives issued by the Governing Body were documented with assigned parties and follow-up was recorded.',
    'Surveyors will verify that the Administrator and required reports were presented at each quarterly meeting.',
  ],
  federalRefs: [
    ['42 CFR § 484.105', 'Governing Body requirements', 'Requires governing body with oversight via documented meetings.'],
    ['42 CFR § 484.65', 'QAPI requirements', 'QAPI report must be presented and acted upon at governing body meetings.'],
    ['SOM Appendix B', 'Survey procedures', 'Meeting minutes are a primary surveyor documentation request.'],
  ],
  crossRefs: [
    ['GV-GB-001', 'Governing Body Authority & Responsibilities', 'Parent policy establishing meeting frequency requirements.'],
    ['GV-GB-003', 'Board Committee Structure & Charters', 'Committee meetings follow same documentation standards.'],
    ['CO-HP-007', 'Record Retention & Destruction', 'Retention requirements for meeting records.'],
    ['GV-PM-003', 'Performance Metrics & Balanced Scorecard', 'Performance data presented at meetings.'],
  ],
  trainingItems: [
    'All Governing Body members shall receive orientation to this policy within 14 calendar days of appointment, covering meeting format, quorum rules, minutes documentation standards, and executive session protocols.',
    'The Designated Secretary shall complete training on meeting minutes preparation at the time of designation, with refresher training annually.',
    'Annual review of this policy shall be conducted at the first quarterly meeting of each calendar year.',
  ],
  alerts: [
    { level: 'warning', title: 'CMS Interpretive Guidelines Update — Meeting Documentation', body: 'CMS updated the State Operations Manual (SOM) Appendix B to clarify that meeting minutes must document quorum verification at the opening of each meeting, not just attendance. Review §6.3.4 documentation requirements.', date: '2025-09-12', source: 'CMS SOM Transmittal 238' },
    { level: 'info', title: 'OIG Work Plan — Governing Body Oversight Documentation', body: 'The OIG 2025 Work Plan includes a study on Governing Body meeting documentation practices at Medicare-certified HHAs. Ensure all meeting minutes templates (Appendix A) are complete and consistently used.', date: '2025-01-15', source: 'OIG Work Plan FY2025' },
  ],
  faq: [
    { q: 'What is the minimum quorum requirement for a valid Governing Body meeting?', a: 'Quorum is defined in the agency bylaws or operating agreement. At minimum, a simple majority of voting members must be present. If quorum is not met, the meeting must be rescheduled within 14 calendar days. See §6.3.1 and Appendix A.' },
    { q: 'Can meeting minutes be approved via email between meetings?', a: 'Yes, with conditions. Electronic approval of meeting minutes (email or electronic signature) is permissible if authorized by agency bylaws. All approvals must be documented and attached to the meeting record. See GV-GB-002 §6.3.4.' },
  ],
  amendments: [
    { version: '6.0', date: '2025-07-10', author: 'Compliance Officer', summary: 'Major revision — revised quorum definition to align with updated agency bylaws; added mandatory executive session documentation requirements (§6.3.5); updated Appendix A meeting minutes template to include new quorum verification field.', sections: '§6.1, §6.3, §6.3.5, Appendix A' },
    { version: '5.1', date: '2024-11-15', author: 'Governing Body Chair', summary: 'Added remote participation (video/teleconference) provisions per post-COVID operational standards. Added 7-day advance agenda distribution requirement in §6.2.', sections: '§6.2, §6.4' },
    { version: '5.0', date: '2024-07-01', author: 'Administrator', summary: 'Annual review — no substantive changes. Updated effective and review dates. Confirmed alignment with current CMS State Operations Manual Appendix B.', sections: 'None (dates only)' },
  ],
};

const GV_GB_003: PolicyContent = {
  id: 'GV-GB-003', title: 'Board Committee Structure & Charters',
  domain: 'GV — Governance & Administration', subdomain: 'GB — Governing Body',
  tier: 'REQUIRED', version: '6.0', effective: '2025-07-10',
  approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
  lastReviewed: '2025-07-10', nextReviewDate: '2026-07-10', supersedes: 'N/A (Initial Version)',
  ownerSteward: 'Board Chair',
  purpose: 'This policy defines the standing and ad-hoc committee structure of the Governing Body of Care Indeed Home Health Care, Inc., including committee charters, composition requirements, scope of authority, and reporting obligations. Committees extend the governance capacity of the full Governing Body and must operate within defined authority boundaries to ensure accountability.',
  scopeItems: [
    'All standing committees of the Governing Body',
    'All ad-hoc or special committees formed by Governing Body resolution',
    'All persons serving as committee chairs or members',
    'The Administrator and senior leadership serving as staff liaisons to committees',
  ],
  definitions: [
    { term: 'Standing Committee', definition: 'A permanent committee established by Governing Body charter with an ongoing scope of work and authority.' },
    { term: 'Ad-Hoc Committee', definition: 'A temporary committee formed by Governing Body resolution to address a specific time-limited matter.' },
    { term: 'Committee Charter', definition: 'The formal document defining a committee\'s purpose, scope, composition, authority, and reporting requirements.' },
    { term: 'Committee Quorum', definition: 'The minimum number of committee members required to conduct official committee business, as defined in each committee\'s charter.' },
  ],
  statements: [
    '4.1 The Governing Body may establish standing or ad-hoc committees to conduct specific oversight work on its behalf. All committee authority must derive from and remain subordinate to the full Governing Body.',
    '4.2 Each standing committee shall be governed by a written charter approved by the full Governing Body. Charters shall be reviewed and reaffirmed annually.',
    '4.3 Committees shall not make final governance decisions unless explicitly delegated this authority by a Governing Body resolution for a specific matter. Committees shall submit recommendations to the full Governing Body for action.',
    '4.4 All committee meetings shall maintain attendance records and produce written summaries, which shall be presented to the full Governing Body as part of regular reporting.',
    '4.5 Ad-hoc committees shall dissolve automatically upon completion of their stated mission or the expiration date set in the forming resolution.',
  ],
  procedures: [
    ['6.1.1', 'Governing Body', 'Establish the initial committee structure and approve charters at the annual organizational meeting. Common standing committees for home health governance include: (a) Quality Committee (QAPI oversight); (b) Finance Committee (budget and fiscal oversight); (c) Compliance Committee (regulatory and audit oversight).', 'At the annual organizational meeting and as needed.'],
    ['6.1.2', 'Governing Body Chair', 'Appoint committee chairs and members annually. Appointments must consider competency requirements defined in each charter.', 'Annually at the organizational meeting.'],
    ['6.2.1', 'Committee Chair', 'Convene committee meetings per the frequency specified in the charter. Maintain attendance records and produce written summaries of each meeting.', 'Per charter-specified frequency.'],
    ['6.2.2', 'Committee Chair', 'Present a written summary of committee actions and recommendations to the full Governing Body at each regular quarterly meeting.', 'At each quarterly Governing Body meeting.'],
    ['6.3.1', 'Governing Body', 'Review and reaffirm all committee charters annually. Charters may be amended by Governing Body vote. Outdated or inactive committees shall be formally dissolved.', 'Annually at the first quarterly meeting.'],
  ],
  documentationRows: [
    ['Committee charters', 'Written charter for each standing committee, approved by the Governing Body.', 'Governing Body Chair', 'Agency governance file.', 'Approved initially and reviewed annually.'],
    ['Committee appointment records', 'Documentation of all committee chair and member appointments.', 'Governing Body Chair', 'Agency governance file.', 'Annually and upon any change.'],
    ['Committee meeting summaries', 'Written summaries of each committee meeting with attendance and actions.', 'Committee Chair', 'Agency governance file.', 'Within 14 days of each committee meeting.'],
    ['Governing Body committee reports', 'Formal committee reports presented at each quarterly Governing Body meeting.', 'Committee Chair', 'Meeting minutes (by reference).', 'At each quarterly Governing Body meeting.'],
  ],
  complianceIndicators: [
    ['Standing committees have approved charters.', 'Review of governance file for current charters.', '100% of standing committees have an approved, current charter.'],
    ['Committee meetings are documented.', 'Review of committee meeting summaries.', 'All committee meetings have written summaries.'],
    ['Committee reports are presented to the Governing Body.', 'Review of Governing Body meeting minutes for committee report presentations.', 'Reports documented at every quarterly Governing Body meeting.'],
  ],
  commonFailures: [
    ['Committees operate without charters or with outdated charters.', 'Lack of defined scope creates accountability gaps.', 'Maintain a charter document for each committee and review annually.'],
    ['Committee actions not reported to the full Governing Body.', 'Governing Body loses visibility into committee work.', 'Require committee chairs to present at every quarterly Governing Body meeting.'],
  ],
  surveyorItems: [
    'Surveyors may request committee charters and meeting summaries to assess the depth of governance oversight.',
    'Surveyors will look for evidence that committees report to and operate under the authority of the full Governing Body, not independently.',
  ],
  federalRefs: [
    ['42 CFR § 484.105', 'Governing Body requirements', 'Establishes authority for committee governance structures.'],
  ],
  crossRefs: [
    ['GV-GB-001', 'Governing Body Authority & Responsibilities', 'Establishes non-delegable Governing Body functions.'],
    ['GV-GB-002', 'Governing Body Meetings & Documentation', 'Meeting documentation standards apply to committee meetings.'],
    ['GV-OG-005', 'Delegation of Authority & Approval Limits', 'Authority limits for delegated committee action.'],
  ],
  trainingItems: [
    'All committee chairs and members shall receive orientation to their committee charter within 14 calendar days of appointment.',
    'Committee chairs shall receive training on documentation requirements and reporting standards.',
  ],
};

const GV_GB_004: PolicyContent = {
  id: 'GV-GB-004', title: 'Board Member Orientation & Education',
  domain: 'GV — Governance & Administration', subdomain: 'GB — Governing Body',
  tier: 'REQUIRED', version: '6.0', effective: '2025-07-10',
  approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
  lastReviewed: '2025-07-10', nextReviewDate: '2026-07-10', supersedes: 'N/A (Initial Version)',
  ownerSteward: 'Board Chair',
  purpose: 'This policy mandates comprehensive orientation for newly appointed Governing Body members and establishes ongoing continuing education requirements for all members of the Governing Body of Care Indeed Home Health Care, Inc. Effective governance requires that all members understand their legal responsibilities, the regulatory environment, and the agency\'s operating framework.',
  scopeItems: [
    'All newly appointed Governing Body members',
    'All continuing Governing Body members',
    'The Administrator and Compliance Officer responsible for delivering orientation',
    'Any management contractor providing orientation services',
  ],
  definitions: [
    { term: 'Orientation', definition: 'Structured initial education and review of governance responsibilities conducted immediately following a new member\'s appointment.' },
    { term: 'Continuing Education', definition: 'Annual and ongoing training to refresh and expand Governing Body members\' understanding of governance, compliance, and quality oversight.' },
    { term: 'Competency Area', definition: 'A domain of knowledge or skill relevant to governing body effectiveness, including health care operations, finance, regulatory compliance, and quality management.' },
  ],
  statements: [
    '4.1 All newly appointed Governing Body members shall complete a formal orientation program within 14 calendar days of appointment covering the topics defined in this policy.',
    '4.2 All Governing Body members shall participate in annual continuing education, conducted at minimum at the first quarterly meeting of each calendar year.',
    '4.3 Orientation and continuing education shall cover: (a) legal authority and responsibilities of the Governing Body; (b) CMS Conditions of Participation; (c) meeting and quorum requirements; (d) conflict of interest obligations; (e) QAPI, compliance, and financial oversight responsibilities; (f) CMS survey process and surveyor expectations.',
    '4.4 Completion of orientation and annual education shall be documented and tracked by the Administrator.',
    '4.5 Any Governing Body member who does not complete required orientation within 14 calendar days of appointment shall not participate in votes or official business until orientation is completed.',
  ],
  procedures: [
    ['6.1.1', 'Administrator / Compliance Officer', 'Deliver formal orientation to each newly appointed Governing Body member within 14 calendar days of appointment. Orientation must cover all topics defined in Section 4.3. Attendance and completion must be documented.', 'Within 14 calendar days of appointment.'],
    ['6.1.2', 'New Governing Body Member', 'Receive all governing documents (bylaws, operating agreement, conflict of interest policy, current policy manual index) within 5 calendar days of appointment.', 'Within 5 calendar days of appointment.'],
    ['6.2.1', 'Administrator', 'Conduct annual refresher training for all Governing Body members at the first quarterly meeting of each calendar year. Training shall address: (a) any regulatory changes effective since the last training; (b) survey findings from the prior year if applicable; (c) QAPI program updates; (d) updated policy acknowledgment requirements.', 'Annual; first quarterly meeting of each year.'],
    ['6.2.2', 'Administrator', 'Maintain a training completion log documenting each member\'s name, training date, topics covered, and trainer name. Report log status to the Governing Body Chair upon request and at each annual governance review.', 'Continuously; log available within 24 hours of surveyor request.'],
  ],
  documentationRows: [
    ['Orientation completion records', 'Signed acknowledgment of orientation completion for each new member.', 'Administrator', 'Training log; governance file.', 'Within 14 calendar days of appointment.'],
    ['Annual training completion log', 'Log of all members\' annual training completion dates and topics.', 'Administrator', 'Training log.', 'Updated annually; retained for 7 years.'],
    ['Orientation materials', 'Orientation curriculum, materials distributed, and governing documents provided.', 'Administrator', 'Training file.', 'Maintained and updated annually.'],
  ],
  complianceIndicators: [
    ['All new members receive orientation within 14 days.', 'Review of training log against appointment dates.', '100% completion within 14 calendar days of appointment.'],
    ['Annual education is conducted.', 'Review of meeting minutes for documented annual training.', 'Annual training documented at first quarterly meeting each year.'],
    ['Training records are current and complete.', 'Review of administrator training log.', '100% of current members have documented completion.'],
  ],
  commonFailures: [
    ['New members vote or act before completing orientation.', 'Actions may be challengeable; survey citation risk.', 'Enforce orientation as a condition of participation in official business.'],
    ['Annual education not conducted or not documented.', 'Surveyors may note competency gaps in governance.', 'Build annual training into the Q1 meeting agenda as a standing item.'],
  ],
  surveyorItems: [
    'Surveyors may ask Governing Body members directly about their knowledge of CMS requirements and oversight responsibilities.',
    'Surveyors may request training completion documentation as part of governance record review.',
  ],
  federalRefs: [
    ['42 CFR § 484.105', 'Governing Body requirements', 'Implied requirement for competent governance capacity.'],
    ['42 CFR § 484.60', 'Care quality', 'Governing Body must understand QAPI responsibilities.'],
  ],
  crossRefs: [
    ['GV-GB-001', 'Governing Body Authority & Responsibilities', 'Defines the responsibilities that orientation must cover.'],
    ['GV-GB-005', 'Conflict of Interest & Board Member Independence', 'Conflict of interest training component of orientation.'],
    ['CO-CP-001', 'Corporate Compliance Program', 'Compliance overview component of orientation.'],
  ],
  trainingItems: [
    'Orientation is itself a training event. Completion shall be documented and signed by both the new member and the Administrator.',
    'Annual governance education shall be incorporated as a standing agenda item at the first quarterly meeting of each year.',
  ],
};

const GV_GB_005: PolicyContent = {
  id: 'GV-GB-005', title: 'Conflict of Interest & Board Member Independence',
  domain: 'GV — Governance & Administration', subdomain: 'GB — Governing Body',
  tier: 'REQUIRED', version: '6.0', effective: '2025-07-10',
  approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
  lastReviewed: '2025-07-10', nextReviewDate: '2026-07-10', supersedes: 'N/A (Initial Version)',
  ownerSteward: 'Board Chair',
  purpose: 'This policy establishes conflict of interest disclosure requirements and recusal protocols for Governing Body members of Care Indeed Home Health Care, Inc. Governing Body members must act solely in the best interest of the agency and the patients it serves; undisclosed conflicts of interest undermine governance integrity and can expose the agency to OIG compliance risk.',
  scopeItems: [
    'All Governing Body members (voting and non-voting)',
    'The Compliance Officer responsible for collecting and reviewing disclosures',
    'Any family members or business associates of Governing Body members whose relationships may create a conflict',
  ],
  definitions: [
    { term: 'Conflict of Interest', definition: 'A situation in which a Governing Body member has a personal, financial, or professional interest that could impair, or appear to impair, their ability to act objectively in the best interest of the agency.' },
    { term: 'Disclosure', definition: 'The formal written declaration by a Governing Body member of any actual or potential conflict of interest.' },
    { term: 'Recusal', definition: 'The withdrawal of a Governing Body member from discussion and voting on a matter in which they have a disclosed conflict of interest.' },
    { term: 'Independence', definition: 'The state of being free from personal, financial, or organizational relationships that could compromise impartial decision-making.' },
  ],
  statements: [
    '4.1 All Governing Body members of Care Indeed Home Health Care, Inc. shall complete and submit a written Conflict of Interest Disclosure Form at the time of appointment, annually thereafter, and within 7 calendar days of any material change in circumstances.',
    '4.2 Any Governing Body member with a disclosed conflict of interest in a matter before the Governing Body shall recuse from discussion and voting on that matter. Recusals shall be documented in meeting minutes.',
    '4.3 The Compliance Officer shall review all submitted disclosures within 14 calendar days of receipt and recommend management or recusal actions to the Governing Body.',
    '4.4 Concealment of a material conflict of interest shall constitute a governance integrity violation and shall be addressed per the agency\'s disciplinary procedures and applicable law.',
    '4.5 The agency shall not enter into contractual or financial relationships with Governing Body members, their immediate family members, or entities in which they have a material interest, without explicit Governing Body approval with the interested member recused.',
  ],
  procedures: [
    ['6.1.1', 'Governing Body Member', 'Complete and submit the Conflict of Interest Disclosure Form (Appendix B of GV-GB-001) at the time of appointment to the Governing Body.', 'At appointment.'],
    ['6.1.2', 'All Governing Body Members', 'Complete and submit annual renewal of the Conflict of Interest Disclosure Form. Annual disclosures are due no later than January 31 of each calendar year.', 'Annually by January 31.'],
    ['6.1.3', 'Governing Body Member', 'Submit an updated disclosure form within 7 calendar days of any material change in circumstances that creates or modifies a disclosed conflict.', 'Within 7 calendar days of material change.'],
    ['6.2.1', 'Compliance Officer', 'Review all submitted disclosure forms within 14 calendar days and prepare a summary with recommendations for the Governing Body. High-risk disclosures (financial relationships, referral relationships) shall be flagged for immediate action.', 'Within 14 calendar days of receipt.'],
    ['6.2.2', 'Governing Body', 'Review the Compliance Officer\'s conflict disclosure summary at each quarterly meeting. Act on all recommendations. Any member with a conflict in a matter must leave the room during discussion and voting on that matter.', 'At each quarterly meeting; recusal at the meeting where the matter is addressed.'],
    ['6.3.1', 'Designated Secretary', 'Document all recusals in meeting minutes, including the member\'s name, the matter from which they recused, and the time of departure and return.', 'In minute from the meeting where recusal occurred.'],
  ],
  documentationRows: [
    ['Conflict of Interest Disclosure Forms', 'Completed COI forms for each Governing Body member.', 'Compliance Officer (collection); Member (completion)', 'Compliance file; governance file.', 'At appointment; annually; within 7 days of change. Retain 7 years.'],
    ['COI disclosure summary', 'Compliance Officer summary of all disclosures with recommendations.', 'Compliance Officer', 'Compliance file.', 'Prepared within 14 days of receipt of forms; presented quarterly.'],
    ['Recusal documentation', 'Meeting minutes entries documenting all recusals.', 'Designated Secretary', 'Governance file (meeting minutes).', 'At the meeting where recusal occurred.'],
  ],
  complianceIndicators: [
    ['Disclosure forms are current for all members.', 'Review of compliance file for all member disclosures and dates.', '100% completion; no lapsed disclosures.'],
    ['Annual disclosures submitted by January 31.', 'Review of disclosure dates.', '100% of disclosures renewed by January 31 of each year.'],
    ['Recusals are documented in minutes.', 'Review of meeting minutes for recusal entries.', 'All known conflicts with active agenda items documented as recusals.'],
  ],
  commonFailures: [
    ['No COI disclosures on file.', 'OIG compliance risk; common survey finding.', 'Systematize disclosure collection at appointment and annually.'],
    ['Member participates in vote despite known conflict.', 'Governance integrity violation; potential legal exposure.', 'Chair must enforce recusal before any discussion of conflicted matter.'],
  ],
  surveyorItems: [
    'Surveyors may request COI disclosure forms for all current Governing Body members.',
    'Surveyors will review minutes for evidence that members with conflicts properly recused.',
  ],
  federalRefs: [
    ['OIG Compliance Program Guidance', 'Home health conflicts of interest', 'OIG recommends conflict of interest policies for governing bodies.'],
    ['42 CFR § 484.105', 'Governing Body requirements', 'Governing body must operate in the best interest of the agency.'],
  ],
  crossRefs: [
    ['GV-GB-001', 'Governing Body Authority & Responsibilities', 'Conflict of interest management referenced in parent policy (§6.4).'],
    ['CO-CP-001', 'Corporate Compliance Program', 'Conflicts of interest are a corporate compliance program component.'],
    ['CO-CP-007', 'Compliance Investigation Process', 'Process for investigating undisclosed conflicts.'],
  ],
  trainingItems: [
    'All Governing Body members shall receive orientation on conflict of interest requirements within 14 calendar days of appointment as part of standard governance orientation.',
    'Annual refresher training shall address current COI landscape, any changes in disclosure requirements, and lessons learned from the prior year.',
  ],
};

const GV_OG_001: PolicyContent = {
  id: 'GV-OG-001', title: 'Organizational Structure & Authority Matrix',
  domain: 'GV — Governance & Administration', subdomain: 'OG — Organizational Governance',
  tier: 'REQUIRED', version: '6.0', effective: '2025-07-10',
  approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
  lastReviewed: '2025-07-10', nextReviewDate: '2026-07-10', supersedes: 'N/A (Initial Version)',
  ownerSteward: 'Chief Executive Officer',
  purpose: 'This policy documents the organizational hierarchy, reporting lines, and decision-making authority matrix for all levels of Care Indeed Home Health Care, Inc. A clear authority matrix ensures accountability, prevents gaps in oversight, and demonstrates to CMS surveyors that the agency has a functioning management structure as required by 42 CFR § 484.105.',
  scopeItems: [
    'All organizational positions at Care Indeed Home Health Care, Inc., from the Governing Body through frontline staff',
    'All contracted management entities and staffing agencies providing management-level functions',
    'The Governing Body Chair responsible for approving the organizational structure',
    'The Administrator responsible for implementing the structure and maintaining the org chart',
  ],
  definitions: [
    { term: 'Organizational Chart', definition: 'A visual representation of the agency\'s hierarchical structure, reporting lines, and accountability relationships.' },
    { term: 'Authority Matrix', definition: 'A documented mapping of decision-making authority by position and transaction or action type.' },
    { term: 'Reporting Line', definition: 'The formal accountability relationship between a subordinate position and the supervising position.' },
    { term: 'Direct Report', definition: 'A position that reports directly to a given supervisor with no intervening management layer.' },
  ],
  statements: [
    '4.1 Care Indeed Home Health Care, Inc. shall maintain a current organizational chart approved by the Governing Body documenting all positions, reporting lines, and functional accountability relationships.',
    '4.2 The organizational chart shall reflect the actual organizational structure in operation at all times. It shall be updated within 14 calendar days of any structural change.',
    '4.3 A written authority matrix shall accompany the organizational chart, defining decision-making authority limits for each key leadership position.',
    '4.4 The Governing Body shall approve the organizational structure annually and any material structural changes when proposed.',
    '4.5 The organizational chart shall be accessible to all staff and readily available to CMS surveyors upon request.',
  ],
  procedures: [
    ['6.1.1', 'Governing Body', 'Approve the organizational chart and authority matrix at the annual organizational meeting. Any proposed structural change must be presented to the Governing Body for approval before implementation.', 'Annually; prior to any structural change.'],
    ['6.1.2', 'Administrator', 'Maintain the current organizational chart in the agency\'s governance file and staff intranet. Update within 14 calendar days of any position change, new hire into a leadership role, or structural reorganization.', 'Continuously; updates within 14 calendar days.'],
    ['6.2.1', 'Administrator', 'Conduct an annual review of the authority matrix to ensure it reflects current staffing and decision-making practices. Present updated matrix to the Governing Body for approval.', 'Annually.'],
    ['6.2.2', 'Compliance Officer', 'Verify that all leadership positions shown on the organizational chart are filled or have designated interims. Report any vacancy exceeding 30 days to the Governing Body.', 'Monthly; at each quarterly meeting.'],
  ],
  documentationRows: [
    ['Organizational chart', 'Current approved org chart with all positions and reporting lines.', 'Administrator (maintenance); Governing Body (approval)', 'Governance file; staff intranet.', 'Updated within 14 days of any change; approved annually.'],
    ['Authority matrix', 'Written matrix of decision limits by position and action type.', 'Administrator (preparation); Governing Body (approval)', 'Governance file.', 'Annual review and approval.'],
    ['Position descriptions', 'Current description for each position on the org chart.', 'Administrator / HR Director', 'Personnel file system.', 'Updated when position content changes significantly.'],
  ],
  complianceIndicators: [
    ['Organizational chart is current.', 'Review of chart update date vs. personnel file changes.', 'Chart reflects current structure; no position changes older than 14 days unrecorded.'],
    ['Authority matrix is approved.', 'Review of Governing Body minutes for annual approval.', 'Annual approval documented in Governing Body minutes.'],
    ['All key positions are filled or have interims.', 'Review of chart vs. vacancy tracking.', 'No key position vacant > 30 days without documented interim designation.'],
  ],
  commonFailures: [
    ['Org chart is outdated.', 'Surveyors may cite failure to maintain accurate organizational structure documentation.', 'Assign the Administrator to update the chart within 14 days of any personnel change.'],
    ['Authority matrix absent.', 'Decision-making accountability unclear; governance gap.', 'Create a simple matrix document and include in governance file.'],
  ],
  surveyorItems: [
    'Surveyors will request the organizational chart to verify a functioning management structure exists.',
    'Surveyors will cross-reference the chart against personnel files and observed reporting relationships.',
  ],
  federalRefs: [
    ['42 CFR § 484.105', 'Organization and Administration', 'Requires documented management structure.'],
    ['42 CFR § 484.105(b)', 'Administrator', 'Administrator must have defined authority and reporting to Governing Body.'],
    ['42 CFR § 484.105(c)', 'Clinical Manager', 'Clinical Manager\'s reporting line must be documented.'],
  ],
  crossRefs: [
    ['GV-GB-001', 'Governing Body Authority & Responsibilities', 'Governing Body approval of organizational structure.'],
    ['GV-OG-002', 'Executive Leadership Responsibilities & Competencies', 'Competencies for positions shown on the chart.'],
    ['GV-OG-005', 'Leadership Succession Planning & Development', 'Succession planning for key positions.'],
  ],
  trainingItems: [
    'All staff shall receive orientation to the organizational chart and their reporting relationships as part of new hire orientation.',
    'Updates to the organizational structure shall be communicated to all affected staff within 7 calendar days of the change.',
  ],
};

const GV_OG_002: PolicyContent = {
  id: 'GV-OG-002', title: 'Executive Leadership Responsibilities & Competencies',
  domain: 'GV — Governance & Administration', subdomain: 'OG — Organizational Governance',
  tier: 'REQUIRED', version: '6.0', effective: '2025-07-10',
  approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
  lastReviewed: '2025-07-10', nextReviewDate: '2026-07-10', supersedes: 'N/A (Initial Version)',
  ownerSteward: 'Chief Executive Officer',
  purpose: 'This policy defines the competency requirements, core responsibilities, qualifications, and accountability standards for all executive leadership positions at Care Indeed Home Health Care, Inc., including the Administrator, Clinical Manager (Director of Nursing), and Compliance Officer. These requirements are mandated by 42 CFR § 484.105 and California HCAI licensure standards.',
  scopeItems: [
    'The Administrator of Care Indeed Home Health Care, Inc.',
    'The Clinical Manager (Director of Nursing)',
    'The Compliance Officer',
    'The Governing Body, which is responsible for appointing and evaluating these positions',
    'The HR Director responsible for personnel qualification verification',
  ],
  definitions: [
    { term: 'Qualified Administrator', definition: 'An individual who meets all qualifications specified in 42 CFR § 484.105(b), agency policy, and applicable California state law for administration of a licensed home health agency.' },
    { term: 'Clinical Manager', definition: 'The registered nurse (or qualified individual per California state law) designated to oversee all clinical services, per 42 CFR § 484.105(c).' },
    { term: 'Competency Verification', definition: 'A documented process confirming that an individual possesses the education, licensure, experience, and skills required for a position.' },
  ],
  statements: [
    '4.1 The Administrator shall be appointed by the Governing Body and must meet all qualification requirements of 42 CFR § 484.105(b) and applicable California state law at the time of appointment and on an ongoing basis.',
    '4.2 The Clinical Manager shall be a registered nurse (or other individual meeting applicable California state qualifications) and must meet all requirements of 42 CFR § 484.105(c).',
    '4.3 The Compliance Officer shall be designated by the Governing Body with sufficient authority and independence to operate the corporate compliance program per policy CO-CP-002.',
    '4.4 Qualifications for all three positions shall be verified at the time of appointment and at least annually thereafter by the HR Director.',
    '4.5 Any executive leadership position vacancy shall be filled or interim-designated within 14 calendar days and permanently filled within 90 calendar days, per policy GV-GB-001, Section 6.5.',
  ],
  procedures: [
    ['6.1.1', 'Governing Body', 'Prior to appointing any individual to the Administrator or Clinical Manager role, verify that the individual meets all qualification requirements. Document the qualification verification and appointment in Governing Body minutes.', 'Prior to appointment.'],
    ['6.1.2', 'HR Director', 'Maintain a qualification verification file for the Administrator, Clinical Manager, and Compliance Officer, including copies of all licenses, certifications, and education documentation.', 'Continuously; updated upon any change.'],
    ['6.2.1', 'Administrator', 'Conduct or oversee annual performance reviews for the Clinical Manager and Compliance Officer. Present findings to the Governing Body in executive session.', 'Annually within 60 calendar days of fiscal year end.'],
    ['6.2.2', 'Governing Body', 'Conduct or commission annual performance evaluation of the Administrator. Document results and any corrective directives in executive session minutes.', 'Annually within 60 calendar days of fiscal year end.'],
  ],
  documentationRows: [
    ['Qualification verification files', 'Copies of licenses, credentials, education, and experience documentation for Administrator, Clinical Manager, Compliance Officer.', 'HR Director', 'Personnel file system; governance file.', 'At appointment; updated annually.'],
    ['Governing Body appointment records', 'Minutes documenting Governing Body appointment and qualification review for each position.', 'Designated Secretary', 'Governance file.', 'At time of appointment.'],
    ['Performance evaluation records', 'Annual performance evaluation documentation for all three positions.', 'Administrator (for CM, CO); Governing Body (for Administrator)', 'Executive session minutes; personnel file.', 'Annually.'],
  ],
  complianceIndicators: [
    ['Administrator qualifications are verified and on file.', 'Review of qualification file.', 'Current verification on file; no expired licenses.'],
    ['Clinical Manager meets regulatory qualifications.', 'Review of RN license and any required certifications.', 'Current license on file; no lapse.'],
    ['Annual evaluations are conducted and documented.', 'Review of evaluation records and Governing Body minutes.', 'Annual evaluations documented for all three positions.'],
  ],
  commonFailures: [
    ['Administrator qualifications not verified at appointment.', 'CMS deficiency under 42 CFR § 484.105(b).', 'Systematize qualification verification as part of the appointment process.'],
    ['Clinical Manager license lapses undetected.', 'Surveyor finding; patient safety risk.', 'Build license expiration tracking into monthly HR compliance calendar.'],
  ],
  surveyorItems: [
    'Surveyors will request proof of Administrator qualifications and the Governing Body appointment documentation.',
    'Surveyors will verify that the Clinical Manager holds an active RN license and meets California state requirements.',
  ],
  federalRefs: [
    ['42 CFR § 484.105(b)', 'Administrator', 'Qualification and appointment requirements for the Administrator.'],
    ['42 CFR § 484.105(c)', 'Clinical Manager', 'Qualification requirements for the Clinical Manager.'],
  ],
  crossRefs: [
    ['GV-GB-001', 'Governing Body Authority & Responsibilities', 'Governing Body appointment obligations.'],
    ['GV-OG-005', 'Leadership Succession Planning & Development', 'Succession planning for executive positions.'],
    ['CO-CP-002', 'Compliance Officer Designation & Authority', 'Compliance Officer appointment standards.'],
    ['HR-TA-003', 'OIG/SAM Exclusion Screening', 'Screening requirements for executive leaders.'],
  ],
  trainingItems: [
    'All executive leaders shall complete orientation to their role-specific responsibilities under this policy within 14 calendar days of appointment.',
    'Annual review of competency requirements and regulatory updates affecting qualification standards shall be conducted.',
  ],
};

const GV_OG_003: PolicyContent = {
  id: 'GV-OG-003', title: 'Delegation of Authority & Approval Limits',
  domain: 'GV — Governance & Administration', subdomain: 'OG — Organizational Governance',
  tier: 'ESSENTIAL', version: '6.0', effective: '2025-07-10',
  approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
  lastReviewed: '2025-07-10', nextReviewDate: '2026-07-10', supersedes: 'N/A (Initial Version)',
  ownerSteward: 'Chief Executive Officer',
  purpose: 'This policy establishes financial and operational approval limits by position and transaction type, and defines the framework for lawful delegation of authority at Care Indeed Home Health Care, Inc. Delegation of authority must preserve the Governing Body\'s ultimate accountability while enabling efficient agency operations.',
  scopeItems: [
    'All leadership positions authorized to approve financial or operational decisions',
    'All staff with delegated authority for any type of approval',
    'The Governing Body, which retains ultimate accountability and establishes the delegation framework',
    'The Administrator responsible for operating within and administering the delegation structure',
  ],
  definitions: [
    { term: 'Delegation of Authority', definition: 'The formal grant of authority from a higher organizational level to a lower level to make specified decisions or take specified actions.' },
    { term: 'Approval Limit', definition: 'The maximum financial or operational scope of a delegated action that a position may approve without escalation.' },
    { term: 'Non-Delegable Authority', definition: 'Authority that cannot be delegated by the Governing Body because it is explicitly required by regulation to reside with the Governing Body itself.' },
  ],
  statements: [
    '4.1 The Governing Body shall establish and approve the agency\'s Authority Matrix defining approval limits for all key financial and operational decisions.',
    '4.2 Delegation of authority shall not extend to functions that are non-delegable under 42 CFR § 484.105 or other applicable law, including ultimate governance accountability.',
    '4.3 All delegated authority shall be documented in writing, specifying the delegating authority, the delegate, the scope of authority, and any conditions or limits.',
    '4.4 Delegated authority may be rescinded by the Governing Body or the delegating authority at any time upon written notice.',
    '4.5 Any action taken outside the limits of delegated authority is unauthorized and must be ratified by the appropriate approving authority or reversed.',
  ],
  procedures: [
    ['6.1.1', 'Governing Body', 'Approve the Authority Matrix annually and whenever a new position with significant approval authority is created. The matrix shall define approval limits for: contracts, expenditures, personnel actions, and policy changes by position.', 'Annually; upon structural change.'],
    ['6.2.1', 'Administrator', 'Operate within the authority limits defined in the matrix. Escalate any decision exceeding delegated limits to the appropriate approving authority before action.', 'Continuously.'],
    ['6.2.2', 'Compliance Officer', 'Review the Authority Matrix annually for compliance with regulatory requirements on non-delegable Governing Body functions. Report any gaps to the Governing Body.', 'Annually.'],
  ],
  documentationRows: [
    ['Authority Matrix', 'Approved matrix of approval limits by position and action type.', 'Administrator (preparation); Governing Body (approval)', 'Governance file.', 'Annual review and approval.'],
    ['Delegation records', 'Written records of any specific individual delegations outside standard matrix.', 'Administrator', 'Governance file.', 'At time of delegation.'],
  ],
  complianceIndicators: [
    ['Authority Matrix is current and approved.', 'Review of governance file.', 'Annual Governing Body approval documented.'],
    ['Decisions are made within approved limits.', 'Sample review of financial approvals and contracts.', 'No approvals found exceeding position limits without proper escalation.'],
  ],
  commonFailures: [
    ['No Authority Matrix exists.', 'Decision accountability gaps; audit risk.', 'Create and adopt an Authority Matrix at the next Governing Body meeting.'],
    ['Staff exceed delegated limits.', 'Unauthorized commitments; legal and financial risk.', 'Enforce escalation protocols; conduct quarterly compliance spot-checks.'],
  ],
  surveyorItems: [
    'Surveyors may review contracts and expenditures for evidence of appropriate approval authority.',
  ],
  federalRefs: [
    ['42 CFR § 484.105', 'Governing Body', 'Non-delegable Governing Body responsibilities.'],
  ],
  crossRefs: [
    ['GV-GB-001', 'Governing Body Authority & Responsibilities', 'Non-delegable functions listed in Section 4.7.'],
    ['GV-OG-001', 'Organizational Structure & Authority Matrix', 'Org chart that the authority matrix accompanies.'],
    ['FN-FP-005', 'Annual Budget & Financial Planning', 'Financial approval limits align with budget authority.'],
  ],
  trainingItems: [
    'All managers and supervisors shall be trained on the Authority Matrix and their specific approval limits within 14 calendar days of appointment to a position with delegated authority.',
    'Annual review of the matrix shall be communicated to all affected positions.',
  ],
};

const GV_OG_004: PolicyContent = {
  id: 'GV-OG-004', title: 'Cross-Functional Team Leadership & Collaboration',
  domain: 'GV — Governance & Administration', subdomain: 'OG — Organizational Governance',
  tier: 'ESSENTIAL', version: '6.0', effective: '2025-07-10',
  approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
  lastReviewed: '2025-07-10', nextReviewDate: '2026-07-10', supersedes: 'N/A (Initial Version)',
  ownerSteward: 'Chief Executive Officer',
  purpose: 'This policy establishes the framework for cross-functional team leadership, decision-making, and collaboration at Care Indeed Home Health Care, Inc. Effective cross-functional integration supports care coordination, QAPI implementation, compliance monitoring, and emergency response — all areas of CMS oversight.',
  scopeItems: [
    'All senior and middle leadership with cross-functional coordination responsibilities',
    'All formally established interdisciplinary teams (IDTs), task forces, or project teams',
    'The Administrator responsible for cross-functional governance',
  ],
  definitions: [
    { term: 'Cross-Functional Team', definition: 'A team or task force with members drawn from more than one organizational department or functional area, formed to address an issue requiring multi-disciplinary expertise.' },
    { term: 'IDT', definition: 'Interdisciplinary Team — teams required by CMS regulation for patient care planning, typically including clinical, aide, and other care disciplines.' },
  ],
  statements: [
    '4.1 Cross-functional collaboration shall be the standard approach for QAPI program implementation, care plan development, emergency preparedness planning, and policy review.',
    '4.2 All formally established cross-functional teams shall document their purpose, membership, meeting frequency, decision authority, and reporting obligations.',
    '4.3 Decisions of cross-functional teams shall be communicated to affected departments within 7 calendar days.',
    '4.4 The Administrator shall facilitate cross-functional leadership meetings at least quarterly to align operations, compliance, and clinical priorities.',
  ],
  procedures: [
    ['6.1.1', 'Administrator', 'Establish and maintain a standing interdisciplinary leadership meeting (ILM) with the Clinical Manager, Compliance Officer, and key department heads, at minimum quarterly.', 'Quarterly; more frequently as needed.'],
    ['6.2.1', 'Team/Project Leader', 'For any formal cross-functional team or task force, charter the team in writing, assign a team leader, document meeting minutes, and report outcomes to the Administrator.', 'At formation; meetings documented throughout lifecycle.'],
    ['6.2.2', 'Administrator', 'Ensure cross-functional representation in the QAPI team per policy QA-PG-001 and in the Emergency Preparedness planning team per OP-FM-005.', 'Continuously.'],
  ],
  documentationRows: [
    ['ILM meeting records', 'Minutes or summaries of Interdisciplinary Leadership Meetings.', 'Designated Note-taker', 'Operations file.', 'Within 7 days of each meeting.'],
    ['Team charters', 'Written charter for any formally established cross-functional team.', 'Team Leader', 'Project/operations file.', 'At team formation.'],
  ],
  complianceIndicators: [
    ['ILM is held quarterly.', 'Review of meeting records.', '4 or more ILMs per year with documented attendance.'],
    ['Required cross-functional teams (QAPI, EP) are established.', 'Review of QAPI and EP files for team membership.', 'Cross-functional membership documented for each required team.'],
  ],
  commonFailures: [
    ['Clinical and operational functions operate in silos.', 'QAPI and compliance gaps that become survey findings.', 'Establish and document the ILM as a quarterly standing meeting.'],
  ],
  surveyorItems: [
    'Surveyors may examine whether clinical and administrative functions are coordinated, particularly for QAPI and emergency preparedness.',
  ],
  federalRefs: [
    ['42 CFR § 484.65', 'QAPI requirements', 'Requires an effective organization-wide QAPI program.'],
    ['42 CFR § 484.102', 'Emergency preparedness', 'Requires cross-functional emergency preparedness planning.'],
  ],
  crossRefs: [
    ['QA-PG-001', 'QAPI Program Establishment & Governance', 'Cross-functional QAPI team membership.'],
    ['OP-FM-005', 'Emergency Operations & Business Continuity', 'Cross-functional EP planning team.'],
  ],
  trainingItems: [
    'All team leaders shall receive training on facilitation, decision documentation, and reporting requirements.',
    'Staff appointed to the QAPI or EP cross-functional teams shall receive role-specific orientation.',
  ],
};

const GV_OG_005: PolicyContent = {
  id: 'GV-OG-005', title: 'Leadership Succession Planning & Development',
  domain: 'GV — Governance & Administration', subdomain: 'OG — Organizational Governance',
  tier: 'ESSENTIAL', version: '6.0', effective: '2025-07-10',
  approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
  lastReviewed: '2025-07-10', nextReviewDate: '2026-07-10', supersedes: 'N/A (Initial Version)',
  ownerSteward: 'Chief Executive Officer',
  purpose: 'This policy mandates succession planning for critical leadership positions at Care Indeed Home Health Care, Inc. and establishes a framework for developing high-potential internal candidates. Leadership continuity is required by 42 CFR § 484.105 (per agency GV-GB-001 §6.2.2.5) to prevent operational disruption and maintain CMS compliance during leadership transitions.',
  scopeItems: [
    'The Administrator position',
    'The Clinical Manager (Director of Nursing) position',
    'The Compliance Officer position',
    'All other positions identified by the Governing Body as critical to regulation compliance',
  ],
  definitions: [
    { term: 'Succession Plan', definition: 'A documented strategy identifying who can assume a critical position on an interim and permanent basis in the event of a vacancy.' },
    { term: 'Interim Designee', definition: 'An individual designated to fulfill a critical position\'s responsibilities temporarily while a permanent appointment is made.' },
    { term: 'High-Potential Employee', definition: 'An employee identified as having the capability and commitment to assume a leadership position with appropriate development.' },
  ],
  statements: [
    '4.1 Care Indeed Home Health Care, Inc. shall maintain a written succession plan for the Administrator, Clinical Manager, and Compliance Officer, reviewed and approved by the Governing Body annually.',
    '4.2 The succession plan shall identify, by name or role, the interim designee for each critical position and the criteria for a permanent appointment.',
    '4.3 In the event of a critical leadership vacancy, an interim designee shall be appointed within 14 calendar days and a permanent appointment made within 90 calendar days, per policy GV-GB-001, Section 6.5.',
    '4.4 The Administrator shall maintain a leadership development pipeline with at least one internal candidate evaluated annually for each critical position.',
  ],
  procedures: [
    ['6.1.1', 'Administrator', 'Prepare and present the annual succession plan update to the Governing Body at the second quarterly meeting.', 'Annually at Q2 Governing Body meeting.'],
    ['6.1.2', 'Governing Body', 'Review and approve the succession plan at the second quarterly meeting. Direct any updates needed and confirm interim designees are qualified.', 'Annually at Q2.'],
    ['6.2.1', 'Administrator', 'Upon any critical position vacancy, immediately notify the Governing Body Chair and activate the succession plan. Appoint the designated interim within 14 calendar days.', 'Upon vacancy; interim within 14 days.'],
    ['6.2.2', 'Governing Body', 'Monitor permanent appointment progress and confirm appointment within 90 days. Extend interim only by Governing Body vote if extraordinary circumstances delay permanent appointment.', 'Permanent appointment within 90 days.'],
  ],
  documentationRows: [
    ['Succession plan document', 'Written succession plan identifying interim designees and criteria for all critical positions.', 'Administrator (preparation); Governing Body (approval)', 'Governance file.', 'Annual approval at Q2 Governing Body meeting.'],
    ['Vacancy notifications', 'Written notification to Governing Body Chair upon any critical position vacancy.', 'Administrator', 'Governance file.', 'Immediately upon vacancy.'],
    ['Interim designation records', 'Documented appointment of interim designee including qualifications confirmation.', 'Administrator; Governing Body', 'Governance file; personnel file.', 'Within 14 days of vacancy.'],
  ],
  complianceIndicators: [
    ['Succession plan approved annually.', 'Review of Governing Body Q2 meeting minutes.', 'Annual approval documented.'],
    ['Vacancies filled within required timeframes.', 'Review of vacancy notification and appointment records.', 'Interim within 14 days; permanent within 90 days.'],
  ],
  commonFailures: [
    ['No succession plan exists.', 'Leadership vacuum during vacancy; CMS deficiency risk.', 'Create succession plan at the next Q2 Governing Body meeting.'],
    ['Vacancy exceeds 90 days without Governing Body action.', 'Survey finding for failure to ensure adequate management.', 'Activate escalation protocol per GV-GB-001 §6.5 at day 30.'],
  ],
  surveyorItems: [
    'Surveyors will ask about interim designees when key positions are vacant at the time of survey.',
    'Surveyors will review whether leadership vacancies were handled within CMS-required timeframes.',
  ],
  federalRefs: [
    ['42 CFR § 484.105(b)', 'Administrator', 'Agency must have a qualified administrator — gaps create compliance risk.'],
    ['42 CFR § 484.105(c)', 'Clinical Manager', 'Continuous clinical manager oversight required.'],
  ],
  crossRefs: [
    ['GV-GB-001', 'Governing Body Authority & Responsibilities', 'Escalation protocol for leadership vacancies (§6.5).'],
    ['GV-OG-002', 'Executive Leadership Responsibilities & Competencies', 'Qualification requirements for successors.'],
  ],
  trainingItems: [
    'Designated interim successors shall receive orientation to the responsibilities of the position they may be called upon to fill, annually.',
    'The Administrator shall ensure all interim designees hold current required qualifications annually.',
  ],
};

function makeGenericContent(id: string, title: string, subdomain: string, tier: string, owner: string, purpose: string): PolicyContent {
  return {
    id, title,
    domain: 'GV — Governance & Administration', subdomain,
    tier, version: '6.0', effective: '2025-07-10',
    approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
    lastReviewed: '2025-07-10', nextReviewDate: '2026-07-10', supersedes: 'N/A (Initial Version)',
    ownerSteward: owner,
    purpose,
    scopeItems: [
      'All leadership and staff with responsibilities defined by this policy',
      'The Administrator responsible for implementation and compliance',
      'The Compliance Officer responsible for monitoring adherence',
      'The Governing Body responsible for approval and oversight',
    ],
    definitions: [
      { term: 'Policy', definition: 'A formal statement of an organizational principle, rule, or course of action that governs operations within its stated scope.' },
      { term: 'Procedure', definition: 'A specific operational method for implementing a policy requirement.' },
    ],
    statements: [
      `4.1 Care Indeed Home Health Care, Inc. shall implement and maintain compliant practices as defined in this policy.`,
      `4.2 All applicable staff and leadership shall adhere to the requirements established herein.`,
      `4.3 The Governing Body shall review and approve this policy annually.`,
      `4.4 Non-compliance with this policy shall be addressed through the agency's corrective action process.`,
    ],
    procedures: [
      ['6.1.1', 'Administrator', 'Implement and oversee the requirements of this policy across the organization. Establish internal procedures as needed to operationalize each requirement.', 'Continuously.'],
      ['6.1.2', 'Compliance Officer', 'Monitor compliance with this policy through regular audits and reporting to the Governing Body.', 'Quarterly; reported at each Governing Body meeting.'],
      ['6.2.1', 'Governing Body', 'Review and approve this policy annually and upon any material regulatory change.', 'Annually; upon regulatory change.'],
    ],
    documentationRows: [
      ['Policy document', 'Current approved version of this policy.', 'Administrator (maintenance); Governing Body (approval)', 'Policy manual; agency intranet.', 'Annual review and approval.'],
      ['Compliance audit records', 'Records of periodic audits conducted under this policy.', 'Compliance Officer', 'Compliance file.', 'Quarterly; retained 7 years.'],
    ],
    complianceIndicators: [
      ['Policy is current and approved.', 'Review of policy header for version and approval date.', 'Annual Governing Body approval on file.'],
      ['Audit findings are addressed.', 'Review of audit records for corrective action completion.', '100% of audit findings have documented corrective actions within required timeframes.'],
    ],
    commonFailures: [
      ['Policy not reviewed annually.', 'Outdated practices; regulatory gap.', 'Build annual policy review into the Governing Body calendar.'],
      ['Staff unaware of policy requirements.', 'Non-compliance due to lack of training.', 'Include in orientation and annual training curriculum.'],
    ],
    surveyorItems: [
      'Surveyors may request documentation of compliance with the requirements of this policy.',
      'Surveyors may assess staff knowledge of this policy\'s key requirements.',
    ],
    federalRefs: [
      ['42 CFR § 484.105', 'Organization and Administration', 'Governing Body oversight framework.'],
    ],
    crossRefs: [
      ['GV-GB-001', 'Governing Body Authority & Responsibilities', 'Parent governance policy.'],
      ['EN-TG-001', 'Enterprise Policy Taxonomy & Classification Governance', 'Framework classification.'],
    ],
    trainingItems: [
      'All staff within the scope of this policy shall receive orientation to its requirements within 14 calendar days of appointment.',
      'Annual refresher training shall be incorporated into the agency\'s governance training calendar.',
    ],
  };
}

const POLICY_MAP: Record<string, PolicyContent> = {
  'GV-GB-002': GV_GB_002,
  'GV-GB-003': GV_GB_003,
  'GV-GB-004': GV_GB_004,
  'GV-GB-005': GV_GB_005,
  'GV-OG-001': GV_OG_001,
  'GV-OG-002': GV_OG_002,
  'GV-OG-003': GV_OG_003,
  'GV-OG-004': GV_OG_004,
  'GV-OG-005': GV_OG_005,
  'GV-PM-001': makeGenericContent('GV-PM-001', 'Strategic Planning & Goal Setting', 'PM — Policy & Performance Management', 'REQUIRED', 'Strategic Planning Officer',
    'This policy defines the strategic planning process at Care Indeed Home Health Care, Inc., including mission, vision, values alignment, strategic priorities, and annual goal-setting methodology. Strategic planning is the foundation of effective governance and is prerequisite to budget approval and QAPI program design.'),
  'GV-PM-002': makeGenericContent('GV-PM-002', 'Business Plan Development & Review', 'PM — Policy & Performance Management', 'REQUIRED', 'Strategic Planning Officer',
    'This policy establishes the process for developing, reviewing, and updating annual business plans aligned with the strategic priorities of Care Indeed Home Health Care, Inc. Business plans are reviewed by the Governing Body to ensure fiscal and operational sustainability.'),
  'GV-PM-003': makeGenericContent('GV-PM-003', 'Performance Metrics & Balanced Scorecard', 'PM — Policy & Performance Management', 'REQUIRED', 'Chief Executive Officer',
    'This policy defines the key performance indicators and balanced scorecard approach used by Care Indeed Home Health Care, Inc. to measure organizational performance across financial, quality, operational, and compliance dimensions.'),
  'GV-PM-004': makeGenericContent('GV-PM-004', 'Annual Operating Budget & Financial Planning', 'PM — Policy & Performance Management', 'REQUIRED', 'Chief Financial Officer',
    'This policy establishes the annual budgeting process at Care Indeed Home Health Care, Inc., including forecast methodology, departmental submissions, revenue and expense projections, and Governing Body approval authority.'),
  'GV-PM-005': makeGenericContent('GV-PM-005', 'Progress Monitoring & Strategic Course Correction', 'PM — Policy & Performance Management', 'ESSENTIAL', 'Strategic Planning Officer',
    'This policy defines processes for monitoring progress against strategic plans and taking corrective action when performance deviates materially from approved targets at Care Indeed Home Health Care, Inc.'),
  'GV-EA-001': makeGenericContent('GV-EA-001', 'External Accountability Reporting Framework', 'EA — External Accountability', 'REQUIRED', 'Compliance Officer',
    'This policy defines requirements for Care Indeed Home Health Care, Inc. to report to external stakeholders including CMS, HCAI, accreditors, funders, and the public. Timely and accurate external reporting is foundational to licensure and certification maintenance.'),
  'GV-EA-002': makeGenericContent('GV-EA-002', 'Form 990 & Federal Tax Compliance Reporting', 'EA — External Accountability', 'REQUIRED', 'Chief Financial Officer',
    'This policy establishes procedures for preparing and filing Form 990-N/990-EZ/990 and related federal tax compliance documentation for Care Indeed Home Health Care, Inc., as applicable to the agency\'s tax-exempt or tax-reporting status.'),
  'GV-EA-003': makeGenericContent('GV-EA-003', 'Regulatory Compliance Reporting & Licensing', 'EA — External Accountability', 'REQUIRED', 'Compliance Officer',
    'This policy establishes processes for maintaining all required licenses and permits and submitting regulatory compliance reports at Care Indeed Home Health Care, Inc., including the HCAI home health license and Medicare certification.'),
  'GV-EA-004': makeGenericContent('GV-EA-004', 'Accreditation & Certification Maintenance', 'EA — External Accountability', 'REQUIRED', 'Chief Executive Officer',
    'This policy defines requirements for maintaining all accreditations and certifications applicable to Care Indeed Home Health Care, Inc., including Medicare certification, HCAI licensing, and any voluntary accreditation. The Governing Body receives accreditation status reports quarterly.'),
  'GV-EA-005': makeGenericContent('GV-EA-005', 'Public Accountability & Community Relations Reporting', 'EA — External Accountability', 'RECOMMENDED', 'Chief Executive Officer',
    'This policy establishes proactive communication practices with the community served by Care Indeed Home Health Care, Inc., including annual reports, impact summaries, and transparency initiatives aligned with the agency\'s mission.'),
};

// ─── TABS ─────────────────────────────────────────────────────────────────────

// Core tabs always visible; optional tabs appear only when the policy has that data.
const ALL_TABS = [
  { id: 'overview',       label: 'Overview & Definitions',  Icon: Info,          optional: false },
  { id: 'policy',         label: 'Policy Statements',       Icon: Shield,        optional: false },
  { id: 'procedures',     label: 'Procedures',              Icon: Settings,      optional: false },
  { id: 'documentation',  label: 'Documentation',           Icon: FileText,      optional: false },
  { id: 'compliance',     label: 'Compliance & Audit',      Icon: CheckSquare,   optional: false },
  { id: 'references',     label: 'References & Admin',      Icon: Archive,       optional: false },
  { id: 'appendices',     label: 'Appendices (Forms)',      Icon: Paperclip,     optional: false },
  { id: 'alerts',         label: 'Policy Alerts',           Icon: Bell,          optional: true  },
  { id: 'faq',            label: 'FAQ',                     Icon: HelpCircle,    optional: true  },
  { id: 'exceptions',     label: 'Exception Log',           Icon: ClipboardList, optional: true  },
  { id: 'amendments',     label: 'Amendment Log',           Icon: Clock,         optional: true  },
] as const;

type TabId = typeof ALL_TABS[number]['id'];

// ─── VIEWS ────────────────────────────────────────────────────────────────────

function ViewOverview({ pc }: { pc: PolicyContent }) {
  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionTitle icon={Shield} title="2. Purpose" />
          <p className="text-white/70 leading-relaxed text-[15px]">{pc.purpose}</p>
        </Card>
        <Card>
          <SectionTitle icon={Search} title="3. Scope" />
          <p className="text-white/70 mb-4 font-bold">This policy applies to:</p>
          <ul className="space-y-3">
            {pc.scopeItems.map((item, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle className="text-[#00e59b] mr-3 mt-0.5 flex-shrink-0" size={18} />
                <span className="text-white/70 text-[15px]">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card>
        <SectionTitle icon={BookOpen} title="5. Definitions" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pc.definitions.map((def, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-xl">
              <h4 className="font-montserrat font-extrabold text-[#00e59b] mb-2">{def.term}</h4>
              <p className="text-white/60 text-sm leading-relaxed">{def.definition}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ViewPolicy({ pc }: { pc: PolicyContent }) {
  return (
    <div className="pb-12">
      <Card>
        <SectionTitle icon={List} title="4. Policy Statement" />
        <div className="space-y-4">
          {pc.statements.map((stmt, i) => (
            <div key={i} className="flex items-start bg-white/5 border border-white/10 p-5 rounded-xl">
              <div className="bg-[#00e59b]/20 text-[#00e59b] border border-[#00e59b]/30 rounded-full w-10 h-10 flex items-center justify-center font-bold font-montserrat flex-shrink-0 mr-5 text-sm">
                4.{i + 1}
              </div>
              <p className="text-white/80 leading-relaxed pt-2 text-[15px]">{stmt.substring(4)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ViewProcedures({ pc }: { pc: PolicyContent }) {
  return (
    <div className="pb-12">
      <Card>
        <SectionTitle icon={Settings} title="6. Procedures" />
        <SimpleTable
          headers={['Step', 'Responsible Party', 'Action', 'Timeframe']}
          rows={pc.procedures}
        />
      </Card>
    </div>
  );
}

function ViewDocumentation({ pc }: { pc: PolicyContent }) {
  return (
    <div className="pb-12">
      <Card>
        <SectionTitle icon={FileText} title="7. Documentation Requirements" />
        <SimpleTable
          headers={['Requirement', 'Document / Record', 'Responsible Party', 'Location', 'Timeframe']}
          rows={pc.documentationRows}
        />
      </Card>
    </div>
  );
}

function ViewCompliance({ pc }: { pc: PolicyContent }) {
  return (
    <div className="space-y-6 pb-12">
      <Card>
        <SectionTitle icon={CheckSquare} title="8.1 How Compliance Is Measured" />
        <SimpleTable
          headers={['Compliance Indicator', 'Measurement Method', 'Acceptable Standard']}
          rows={pc.complianceIndicators}
        />
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionTitle icon={Search} title="8.2 Surveyor Expectations" />
          <ul className="space-y-4">
            {pc.surveyorItems.map((item, i) => (
              <li key={i} className="text-[15px] text-white/80 font-roboto flex items-start">
                <ChevronRight className="text-[#00e59b] mt-0.5 mr-2 flex-shrink-0" />
                {i + 1}. {item}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionTitle icon={AlertTriangle} title="8.3 Common Failure Points" color="text-[#C74600]" />
          <div className="space-y-3">
            {pc.commonFailures.map((item, i) => (
              <div key={i} className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                <p className="font-bold text-red-400 text-[15px] mb-2">{item[0]}</p>
                <p className="text-sm text-red-300/80 mb-2"><strong>Risk:</strong> {item[1]}</p>
                <p className="text-sm text-white/60 bg-white/5 p-2 rounded-lg border border-red-500/10"><strong>Mitigation:</strong> {item[2]}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ViewReferences({ pc }: { pc: PolicyContent }) {
  return (
    <div className="space-y-6 pb-12">
      <Card>
        <SectionTitle icon={Archive} title="9. Federal Regulatory References" />
        <SimpleTable
          headers={['Citation', 'Title', 'Relevance to This Policy']}
          rows={pc.federalRefs}
        />
      </Card>
      <Card>
        <SectionTitle icon={Archive} title="10. Cross-Referenced Agency Policies" />
        <SimpleTable
          headers={['Policy ID', 'Title', 'Relationship to This Policy']}
          rows={pc.crossRefs}
        />
      </Card>
      <Card>
        <SectionTitle icon={CheckSquare} title="11. Training & Version Control" />
        <ul className="space-y-4 mb-6">
          {pc.trainingItems.map((item, i) => (
            <li key={i} className="flex items-start bg-white/5 border border-white/10 p-4 rounded-xl">
              <span className="text-[#00e59b] font-bold mr-3 text-sm">10.{i + 1}</span>
              <p className="text-[15px] text-white/70 leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// ─── OPTIONAL SECTION VIEWS ───────────────────────────────────────────────────

function ViewAlerts({ pc }: { pc: PolicyContent }) {
  if (!pc.alerts?.length) return null;
  const cfg = {
    critical: { border: 'border-red-500/40 bg-red-500/5',    dot: 'bg-red-500',    badge: 'bg-red-500/20 text-red-400 border-red-500/30',      label: 'CRITICAL' },
    warning:  { border: 'border-yellow-500/40 bg-yellow-500/5', dot: 'bg-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', label: 'ADVISORY' },
    info:     { border: 'border-blue-500/40 bg-blue-500/5',   dot: 'bg-blue-400',   badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',      label: 'INFO'     },
  };
  return (
    <div className="space-y-5 pb-12">
      <Card>
        <SectionTitle icon={Bell} title="Active Policy Alerts & Notices" />
        <p className="text-white/50 text-sm -mt-3 mb-2">Regulatory updates, advisories, and operational notices tied to this policy. Alerts are cleared when resolved or superseded.</p>
      </Card>
      {pc.alerts.map((a, i) => {
        const c = cfg[a.level];
        return (
          <div key={i} className={`border rounded-xl p-5 ${c.border}`}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                <span className={`text-[9px] font-bold font-montserrat uppercase tracking-widest px-2.5 py-1 rounded-full border ${c.badge}`}>{c.label}</span>
                <h3 className="font-montserrat font-bold text-white text-[14px]">{a.title}</h3>
              </div>
              <span className="text-white/30 text-xs shrink-0">{a.date}</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed pl-5">{a.body}</p>
            {a.source && <p className="text-white/40 text-xs mt-3 pl-5 italic">Source: {a.source}</p>}
          </div>
        );
      })}
    </div>
  );
}

function ViewFAQ({ pc }: { pc: PolicyContent }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!pc.faq?.length) return null;
  return (
    <div className="space-y-6 pb-12">
      <Card>
        <SectionTitle icon={HelpCircle} title="Frequently Asked Questions" />
        <p className="text-white/50 text-sm -mt-3">Common questions and authoritative answers for this policy. Contact the Compliance Officer for situations not addressed here.</p>
      </Card>
      <div className="space-y-3">
        {pc.faq.map((item, i) => (
          <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center gap-4">
                <span className="text-[#00e59b] font-montserrat font-extrabold text-xs uppercase tracking-widest shrink-0 w-8">Q{i + 1}</span>
                <p className="font-montserrat font-bold text-white text-[14px] group-hover:text-white/90">{item.q}</p>
              </div>
              <ChevronRight size={16} className={`text-white/30 shrink-0 transition-transform duration-200 ${open === i ? 'rotate-90' : ''}`} />
            </button>
            {open === i && (
              <div className="border-t border-white/10 bg-white/[0.02] px-5 pb-5 pt-4">
                <div className="flex gap-4">
                  <span className="text-[#e85200] font-montserrat font-extrabold text-xs uppercase tracking-widest shrink-0 w-8 pt-0.5">A</span>
                  <p className="text-white/70 text-sm leading-relaxed">{item.a}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ViewExceptions({ pc }: { pc: PolicyContent }) {
  if (!pc.exceptions?.length) return null;
  const statusBadge: Record<string, string> = {
    'Approved':     'bg-[#00e59b]/10 border-[#00e59b]/30 text-[#00e59b]',
    'Denied':       'bg-red-500/10 border-red-500/30 text-red-400',
    'Under Review': 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
  };
  return (
    <div className="space-y-6 pb-12">
      <Card>
        <SectionTitle icon={ClipboardList} title="Exception Log" />
        <p className="text-white/50 text-sm -mt-3">Approved, denied, and pending exceptions to this policy. All exceptions require Compliance Officer submission and Administrator approval.</p>
      </Card>
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-xs text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              {['Date', 'Requested By', 'Description', 'Status', 'Approved By', 'Expires'].map(h => (
                <th key={h} className="p-3 font-montserrat font-bold text-[10px] text-white/50 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {pc.exceptions.map((ex, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="p-3 text-white/60 whitespace-nowrap">{ex.date}</td>
                <td className="p-3 text-white/70 font-medium">{ex.requestedBy}</td>
                <td className="p-3 text-white/70 leading-relaxed max-w-xs">{ex.description}</td>
                <td className="p-3">
                  <span className={`text-[9px] font-bold font-montserrat uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusBadge[ex.status] ?? ''}`}>{ex.status}</span>
                </td>
                <td className="p-3 text-white/60">{ex.approvedBy}</td>
                <td className="p-3 text-white/50">{ex.expiresOn ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ViewAmendments({ pc }: { pc: PolicyContent }) {
  if (!pc.amendments?.length) return null;
  return (
    <div className="space-y-6 pb-12">
      <Card>
        <SectionTitle icon={Clock} title="Amendment History" />
        <p className="text-white/50 text-sm -mt-3">Version change log for this policy — what changed, when, and by whom. Current version is always listed first.</p>
      </Card>
      <div className="relative pl-6 border-l border-white/10">
        {pc.amendments.map((a, i) => (
          <div key={i} className={`relative mb-8 ${i > 0 ? 'opacity-70' : ''}`}>
            <div className={`absolute -left-[25px] w-4 h-4 rounded-full border-2 flex items-center justify-center ${i === 0 ? 'bg-[#00e59b] border-[#00e59b]' : 'bg-transparent border-white/20'}`}>
              {i === 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#001a14]" />}
            </div>
            <div className={`bg-white/5 border rounded-xl p-5 ${i === 0 ? 'border-[#00e59b]/30' : 'border-white/10'}`}>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className={`font-montserrat font-extrabold text-sm ${i === 0 ? 'text-[#00e59b]' : 'text-white/70'}`}>v{a.version}</span>
                  {i === 0 && <span className="text-[9px] font-bold font-montserrat uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#00e59b]/20 text-[#00e59b] border border-[#00e59b]/30">CURRENT</span>}
                </div>
                <span className="text-white/40 text-xs">{a.date}</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-2">{a.summary}</p>
              {a.sections && <p className="text-white/40 text-[11px] mb-1">Sections affected: <span className="text-white/60">{a.sections}</span></p>}
              <p className="text-white/40 text-[11px]">Author: <span className="text-white/60">{a.author}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GV-GB-002: GOVERNING BODY MEETINGS & DOCUMENTATION ─────────────────────
function GB002_AppxA({ policyId, version }: { policyId: string; version: string }) {
  return (
    <div>
      <AppxHeader policyId={policyId} version={version} title="Governing Body Meeting Agenda Template" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Meeting Date" /><FormField label="Time" />
        <FormField label="Location / Teleconference Link" />
        <FormField label="Meeting Type  (Regular / Special / Executive)" />
        <FormField label="Presiding Chair" /><FormField label="Designated Secretary" />
      </div>
      <AppxSecHead title="Standing Agenda Items" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        {['1.  Call to Order & Roll Call',
          '2.  Quorum Verification — Members Present: ___  Required: ___  Met: ☐ Yes  ☐ No',
          '3.  Approval of Prior Minutes — Meeting Date of Prior Minutes: ___________________',
          '4.  Administrator Report',
          '5.  Compliance Officer Report',
          '6.  QAPI Report',
          '7.  Financial Report',
          '8.  Old Business: _____________________________________________________________',
          '9.  New Business: _____________________________________________________________',
          '10. Adjournment'].map(item => (
          <div key={item} className="py-2 border-b border-white/10 last:border-0 text-sm text-white/70 font-roboto">{item}</div>
        ))}
      </div>
      <AppxSecHead title="Supporting Materials / Attachments Distributed" />
      <div className="border border-t-0 border-white/10 rounded-b p-4 min-h-[70px]">
        <div className="text-xs text-white/40 italic">List all documents included with this agenda</div>
      </div>
      <AppxSecHead title="Certification" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Prepared By (Administrator / Secretary)" />
          <FormField label="Date Distributed" />
        </div>
        <p className="text-xs text-white/40 italic mt-1">Agenda must be distributed to all Governing Body members no fewer than 7 calendar days before the meeting per GV-GB-002 §6.1.2.</p>
      </div>
    </div>
  );
}

function GB002_AppxB({ policyId, version }: { policyId: string; version: string }) {
  return (
    <div>
      <AppxHeader policyId={policyId} version={version} title="Governing Body Meeting Minutes Template" />
      <div className="grid grid-cols-3 gap-4">
        <FormField label="Meeting Date" /><FormField label="Start Time" /><FormField label="End Time" />
        <FormField label="Location / Platform" />
        <FormField label="Meeting Type  (Regular / Special / Executive)" />
        <FormField label="Presiding Chair" />
      </div>
      <AppxSecHead title="Members Present" />
      <table className="w-full text-sm border border-t-0 border-white/10">
        <TblHead cols={['Name', 'Role / Title', 'Method (In-Person / Teleconference)']} />
        <EmptyRows count={8} cols={3} />
      </table>
      <AppxSecHead title="Members Absent" />
      <table className="w-full text-sm border border-t-0 border-white/10">
        <TblHead cols={['Name', 'Role / Title']} />
        <EmptyRows count={3} cols={2} />
      </table>
      <AppxSecHead title="Quorum Verification" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Members Present (Count)" /><FormField label="Quorum Required" /><FormField label="Quorum Met?  (Yes / No)" />
        </div>
      </div>
      <AppxSecHead title="Approval of Prior Minutes" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Meeting Date of Prior Minutes" />
          <FormField label="Result  (Approved / Approved with Corrections / Deferred)" />
        </div>
        <FormField label="Corrections Noted (if any)" lines={2} />
      </div>
      <AppxSecHead title="Reports Received & Discussion" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        {['Administrator Report', 'Compliance Officer Report', 'QAPI Report', 'Financial Report'].map(r => (
          <div key={r} className="mb-3">
            <label className="text-xs font-montserrat font-bold text-white/60 uppercase tracking-wide">{r}</label>
            <div className="border border-white/10 rounded bg-transparent mt-1 p-1 min-h-[40px]" />
          </div>
        ))}
      </div>
      <AppxSecHead title="Motions & Votes" />
      <table className="w-full text-sm border border-t-0 border-white/10">
        <TblHead cols={['Motion', 'Moved By', 'Seconded By', 'Yes', 'No', 'Abstain', 'Result']} />
        <EmptyRows count={5} cols={7} />
      </table>
      <AppxSecHead title="Directives Issued" />
      <table className="w-full text-sm border border-t-0 border-white/10">
        <TblHead cols={['#', 'Directive Description', 'Assigned To', 'Due Date']} />
        <tbody>
          {Array.from({ length: 4 }, (_, i) => (
            <tr key={i} className="border-b border-white/10">
              <td className="p-2 h-9 border-white/10 bg-white/[0.02] text-xs text-white/40 w-8">{i + 1}</td>
              <td className="p-2 h-9 border-l border-white/10 bg-white/[0.02]" />
              <td className="p-2 h-9 border-l border-white/10 bg-white/[0.02]" />
              <td className="p-2 h-9 border-l border-white/10 bg-white/[0.02]" />
            </tr>
          ))}
        </tbody>
      </table>
      <AppxSecHead title="Adjournment & Certification" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        <div className="grid grid-cols-3 gap-4 mb-2">
          <FormField label="Time of Adjournment" /><FormField label="Next Meeting Date" /><FormField label="Draft Minutes Completed By (Date)" />
        </div>
        <p className="text-xs text-white/40 italic mb-3">Draft minutes must be completed within 14 calendar days of the meeting per GV-GB-002 §6.1.4. Minutes approved at the next regular meeting.</p>
        <SigBlock left="Designated Secretary — Signature" right="Governing Body Chair — Signature (upon approval)" />
      </div>
    </div>
  );
}

function GB002_AppxC({ policyId, version }: { policyId: string; version: string }) {
  return (
    <div>
      <AppxHeader policyId={policyId} version={version} title="Attendance & Quorum Verification Sheet" />
      <div className="grid grid-cols-3 gap-4">
        <FormField label="Meeting Date" /><FormField label="Start Time" /><FormField label="Meeting Type" />
      </div>
      <AppxSecHead title="Attendance Register" />
      <table className="w-full text-sm border border-t-0 border-white/10">
        <TblHead cols={['Member Name', 'Role / Title', 'In-Person', 'Teleconference', 'Signature / Initials']} />
        <tbody>
          {Array.from({ length: 10 }, (_, i) => (
            <tr key={i} className="border-b border-white/10">
              <td className="p-2 h-9 bg-white/[0.02]" />
              <td className="p-2 h-9 border-l border-white/10 bg-white/[0.02]" />
              <td className="p-2 h-9 border-l border-white/10 bg-white/[0.02] text-center text-white/30 text-sm">☐</td>
              <td className="p-2 h-9 border-l border-white/10 bg-white/[0.02] text-center text-white/30 text-sm">☐</td>
              <td className="p-2 h-9 border-l border-white/10 bg-white/[0.02]" />
            </tr>
          ))}
        </tbody>
      </table>
      <AppxSecHead title="Quorum Determination" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        <div className="grid grid-cols-4 gap-4">
          <FormField label="Total Members" /><FormField label="Quorum Required" />
          <FormField label="Members Present" /><FormField label="Quorum Met?  (Yes / No)" />
        </div>
        <SigBlock left="Verified By — Designated Secretary Signature" right="Date" />
      </div>
    </div>
  );
}

function GB002_AppxD({ policyId, version }: { policyId: string; version: string }) {
  return (
    <div>
      <AppxHeader policyId={policyId} version={version} title="Governing Body Directive Tracking Log" />
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 font-roboto">
        <strong>Instructions:</strong> Record each directive issued by the Governing Body. Review and update status at each subsequent meeting. Present this log as a standing agenda item per GV-GB-002 §6.2.2.
      </div>
      <table className="w-full text-sm border border-white/10">
        <thead className="bg-[#00e59b]/20 text-white">
          <tr>{['#', 'Date Issued', 'Meeting Ref', 'Directive Description', 'Assigned To', 'Due Date', 'Status', 'Date Completed'].map(h => (
            <th key={h} className="p-2 text-left text-xs font-montserrat font-bold uppercase">{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {Array.from({ length: 12 }, (_, i) => (
            <tr key={i} className={`border-b border-white/10 ${i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}`}>
              <td className="p-2 h-9 text-xs text-white/40 border-r border-white/10">{i + 1}</td>
              {Array.from({ length: 7 }, (_, j) => <td key={j} className="p-2 h-9 border-r border-white/10" />)}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
        <strong>Status Codes:</strong>&nbsp; Pending · In Progress · Completed · Deferred · No Action Required
      </div>
    </div>
  );
}

// ─── GV-GB-003: BOARD COMMITTEE STRUCTURE & CHARTERS ─────────────────────────
function GB003_AppxA({ policyId, version }: { policyId: string; version: string }) {
  return (
    <div>
      <AppxHeader policyId={policyId} version={version} title="Board Committee Charter Template" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Committee Name" />
        <FormField label="Committee Type  (Standing / Ad-Hoc)" />
        <FormField label="Charter Effective Date" />
        <FormField label="Charter Approved By" />
      </div>
      <AppxSecHead title="1. Purpose & Mission" />
      <div className="border border-t-0 border-white/10 rounded-b p-3 min-h-[70px]" />
      <AppxSecHead title="2. Scope of Authority" />
      <div className="border border-t-0 border-white/10 rounded-b p-3 min-h-[70px]">
        <div className="text-xs text-white/40 italic">Define matters within and outside this committee's authority. Note: committees may not make final governance decisions unless explicitly delegated by Governing Body resolution.</div>
      </div>
      <AppxSecHead title="3. Composition" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        <div className="grid grid-cols-3 gap-4 mb-3">
          <FormField label="Minimum Members" /><FormField label="Maximum Members" /><FormField label="Quorum Required" />
        </div>
        <table className="w-full text-sm border border-white/10">
          <TblHead cols={['Position / Role', 'Required / Optional', 'Required Qualifications']} />
          <EmptyRows count={5} cols={3} />
        </table>
      </div>
      <AppxSecHead title="4. Meeting Frequency & Reporting" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Meeting Frequency" />
          <FormField label="Reports to Governing Body at (Frequency)" />
          <FormField label="Reporting Officer / Committee Chair" />
          <FormField label="Chair Appointment Authority" />
        </div>
      </div>
      <AppxSecHead title="5. Governing Body Approval" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        <SigBlock left="Governing Body Chair — Signature" right="Date Charter Approved" />
        <div className="mt-3 text-xs text-white/40 italic">Charter must be reviewed and reaffirmed annually at the first quarterly Governing Body meeting per GV-GB-003 §6.3.1.</div>
      </div>
    </div>
  );
}

function GB003_AppxB({ policyId, version }: { policyId: string; version: string }) {
  return (
    <div>
      <AppxHeader policyId={policyId} version={version} title="Committee Meeting Summary Form" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Committee Name" /><FormField label="Meeting Date" />
        <FormField label="Location / Platform" /><FormField label="Committee Chair / Presiding" />
      </div>
      <AppxSecHead title="Attendance" />
      <table className="w-full text-sm border border-t-0 border-white/10">
        <TblHead cols={['Member Name', 'Role', 'Present', 'Absent']} />
        <tbody>
          {Array.from({ length: 7 }, (_, i) => (
            <tr key={i} className="border-b border-white/10">
              <td className="p-2 h-8 bg-white/[0.02]" />
              <td className="p-2 h-8 border-l border-white/10 bg-white/[0.02]" />
              <td className="p-2 h-8 border-l border-white/10 bg-white/[0.02] text-center text-white/30 text-sm">☐</td>
              <td className="p-2 h-8 border-l border-white/10 bg-white/[0.02] text-center text-white/30 text-sm">☐</td>
            </tr>
          ))}
        </tbody>
      </table>
      <AppxSecHead title="Actions & Recommendations for Governing Body" />
      <table className="w-full text-sm border border-t-0 border-white/10">
        <TblHead cols={['#', 'Action / Recommendation', 'Assigned To', 'Due Date', 'Requires GB Vote?']} />
        <tbody>
          {Array.from({ length: 5 }, (_, i) => (
            <tr key={i} className="border-b border-white/10">
              <td className="p-2 h-9 bg-white/[0.02] text-xs text-white/40 w-8">{i + 1}</td>
              <td className="p-2 h-9 border-l border-white/10 bg-white/[0.02]" />
              <td className="p-2 h-9 border-l border-white/10 bg-white/[0.02]" />
              <td className="p-2 h-9 border-l border-white/10 bg-white/[0.02]" />
              <td className="p-2 h-9 border-l border-white/10 bg-white/[0.02] text-center text-xs text-white/40">☐ Yes  ☐ No</td>
            </tr>
          ))}
        </tbody>
      </table>
      <AppxSecHead title="Next Meeting & Submission" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Next Committee Meeting Date" />
          <FormField label="GB Report Presentation Date" />
        </div>
        <FormField label="Open Items Carried Forward" lines={2} />
        <SigBlock left="Committee Chair — Signature" right="Date of Summary" />
        <p className="text-xs text-white/40 italic mt-2">Summary must be completed within 14 days of the meeting per GV-GB-003 §6.2.1 and presented to the full Governing Body at the next quarterly meeting.</p>
      </div>
    </div>
  );
}

// ─── GV-GB-004: BOARD MEMBER ORIENTATION & EDUCATION ─────────────────────────
function GB004_AppxA({ policyId, version }: { policyId: string; version: string }) {
  return (
    <div>
      <AppxHeader policyId={policyId} version={version} title="Board Member Orientation Acknowledgment Form" />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Member Name" /><FormField label="Date of Appointment" />
        <FormField label="Orientation Date(s)" />
        <FormField label="Orientation Delivered By  (Administrator / Compliance Officer)" />
      </div>
      <AppxSecHead title="Governing Documents Received" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        {['Agency Bylaws / Operating Agreement',
          'Conflict of Interest Policy (GV-GB-005) with Disclosure Form',
          'Current Policy Manual Index',
          'Current Organizational Chart',
          'Authority Matrix',
          'Annual Meeting Calendar',
          'CMS Conditions of Participation Summary (42 CFR §484.105)',
          'Most recent CMS survey findings (if applicable)',
        ].map(item => <ChkRow key={item} label={item} />)}
      </div>
      <AppxSecHead title="Orientation Topics Covered" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        {['Legal authority and non-delegable responsibilities of the Governing Body (GV-GB-001)',
          'CMS Conditions of Participation — 42 CFR §484.105 requirements',
          'Meeting format, quorum rules, Robert\'s Rules basics (GV-GB-002)',
          'Conflict of interest disclosure and recusal obligations (GV-GB-005)',
          'QAPI program overview and Governing Body oversight role (42 CFR §484.65)',
          'Compliance Officer structure and corporate compliance program (CO-CP-001)',
          'Financial oversight responsibilities and budget review process',
          'CMS survey process, surveyor expectations, and documentation requirements',
          'Record retention requirements for governance files (CO-HP-007)',
          'Committee structure and reporting obligations (GV-GB-003)',
        ].map(item => <ChkRow key={item} label={item} />)}
      </div>
      <AppxSecHead title="Member Acknowledgment & Certification" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        <p className="text-sm text-white/60 mb-4 font-roboto leading-relaxed">
          I certify that I have received all governing documents listed above and that all orientation topics listed above were covered
          during my orientation. I understand my responsibilities as a member of the Governing Body of Care Indeed Home Health Care, Inc.
          and my obligations under 42 CFR §484.105 and applicable agency policy. I have not yet participated in any vote or official business
          prior to completing this orientation.
        </p>
        <div className="grid grid-cols-2 gap-6">
          <div><div className="border-b border-gray-400 h-8 mb-1" /><p className="text-xs text-white/50">Governing Body Member — Signature</p></div>
          <div><div className="border-b border-gray-400 h-8 mb-1" /><p className="text-xs text-white/50">Date</p></div>
          <div><div className="border-b border-gray-400 h-8 mb-1" /><p className="text-xs text-white/50">Administrator — Signature</p></div>
          <div><div className="border-b border-gray-400 h-8 mb-1" /><p className="text-xs text-white/50">Date</p></div>
        </div>
      </div>
    </div>
  );
}

function GB004_AppxB({ policyId, version }: { policyId: string; version: string }) {
  return (
    <div>
      <AppxHeader policyId={policyId} version={version} title="Annual Training Completion Log" />
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 font-roboto">
        <strong>Instructions:</strong> Record all orientation and annual continuing education completions for every Governing Body member.
        This log must be available within 24 hours of a CMS surveyor request per GV-GB-004 §6.2.2.
      </div>
      <table className="w-full text-sm border border-white/10">
        <thead className="bg-[#00e59b]/20 text-white">
          <tr>{['Member Name', 'Appointment Date', 'Orientation Date', 'Annual Training\n(Year 1)', 'Annual Training\n(Year 2)', 'Annual Training\n(Year 3)', 'Trainer', 'Status'].map(h => (
            <th key={h} className="p-2 text-left text-xs font-montserrat font-bold uppercase whitespace-pre-line leading-tight">{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {Array.from({ length: 12 }, (_, i) => (
            <tr key={i} className={`border-b border-white/10 ${i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}`}>
              {Array.from({ length: 8 }, (_, j) => <td key={j} className="p-2 h-9 border-r border-white/10 last:border-r-0" />)}
            </tr>
          ))}
        </tbody>
      </table>
      <SigBlock left="Maintained By — Administrator Signature" right="Date Last Updated" />
    </div>
  );
}

// ─── GV-GB-005: CONFLICT OF INTEREST & BOARD MEMBER INDEPENDENCE ──────────────
function GB005_AppxA({ policyId, version }: { policyId: string; version: string }) {
  return (
    <div>
      <AppxHeader policyId={policyId} version={version} title="Conflict of Interest Disclosure Form" />
      <div className="mb-4 p-3 bg-[#C74600]/10 border border-[#C74600]/20 rounded-lg text-sm text-[#C74600] font-roboto">
        <strong>Annual Requirement:</strong> This form must be completed (a) at appointment, (b) by January 31 of each subsequent year,
        and (c) within 7 calendar days of any material change in circumstances. Submit completed form to the Compliance Officer.
      </div>
      <div className="grid grid-cols-2 gap-4 mb-2">
        <FormField label="Member Name" /><FormField label="Submission Date" />
        <FormField label="Form Type  (Initial Appointment / Annual Renewal / Updated Disclosure)" />
        <FormField label="If Updated — Date of Change in Circumstances" />
      </div>

      {[
        { id: 1, title: 'Financial Interests', prompt: 'Do you, or does any member of your immediate family, have a financial interest (ownership, investment, compensation arrangement) in any entity that does business with, competes with, or provides services to Care Indeed Home Health Care, Inc.?' },
        { id: 2, title: 'Business & Employment Relationships', prompt: 'Are you, or is any immediate family member, employed by or serving as director/officer of any entity that does business with or competes with the agency?' },
        { id: 3, title: 'Referral Relationships', prompt: 'Do you have any referral, contractual, or financial relationship with any physician, hospital, facility, or individual who refers patients to or receives referrals from the agency?' },
        { id: 4, title: 'Family Relationships with Agency', prompt: 'Are any immediate family members employed by, contracted with, or serving in any role with the agency that could create a conflict of interest?' },
      ].map(sec => (
        <div key={sec.id}>
          <AppxSecHead title={`Section ${sec.id} — ${sec.title}`} />
          <div className="border border-t-0 border-white/10 rounded-b p-4">
            <p className="text-sm text-white/60 mb-3 font-roboto leading-relaxed">{sec.prompt}</p>
            <div className="flex gap-8 mb-3">
              <label className="flex items-center gap-2 text-sm text-white/70 font-roboto"><span className="text-white/40 text-base">☐</span> Yes (describe below)</label>
              <label className="flex items-center gap-2 text-sm text-white/70 font-roboto"><span className="text-white/40 text-base">☐</span> No</label>
            </div>
            <FormField label="If Yes — Describe the nature, parties, and financial terms of the relationship" lines={3} />
          </div>
        </div>
      ))}

      <AppxSecHead title="Section 5 — Recusal History (Prior 12 Months)" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        <p className="text-sm text-white/60 mb-3 font-roboto">Were there any matters during the prior 12 months from which you recused yourself due to a conflict of interest?</p>
        <div className="flex gap-8 mb-3">
          <label className="flex items-center gap-2 text-sm text-white/70 font-roboto"><span className="text-white/40 text-base">☐</span> Yes (describe below)</label>
          <label className="flex items-center gap-2 text-sm text-white/70 font-roboto"><span className="text-white/40 text-base">☐</span> No</label>
        </div>
        <FormField label="Matter(s) from which recused — include meeting date and agenda item reference" lines={2} />
      </div>

      <AppxSecHead title="Certification & Signature" />
      <div className="border border-t-0 border-white/10 rounded-b p-4">
        <p className="text-sm text-white/60 mb-4 font-roboto leading-relaxed">
          I certify that the information provided in this form is true and complete to the best of my knowledge and belief.
          I understand my ongoing obligation to disclose actual and potential conflicts promptly and to recuse from any matter
          in which I have a conflict of interest. I acknowledge that concealment of a material conflict constitutes a governance
          integrity violation subject to disciplinary action under GV-GB-005.
        </p>
        <div className="grid grid-cols-2 gap-6">
          <div><div className="border-b border-gray-400 h-8 mb-1" /><p className="text-xs text-white/50">Governing Body Member — Signature</p></div>
          <div><div className="border-b border-gray-400 h-8 mb-1" /><p className="text-xs text-white/50">Date</p></div>
          <div><div className="border-b border-gray-400 h-8 mb-1" /><p className="text-xs text-white/50">Received By — Compliance Officer Signature</p></div>
          <div><div className="border-b border-gray-400 h-8 mb-1" /><p className="text-xs text-white/50">Date Received</p></div>
        </div>
      </div>
    </div>
  );
}

// ─── APPENDIX DEFINITIONS BY POLICY ──────────────────────────────────────────
type AppxDef = {
  label: string;
  title: string;
  Component: React.ComponentType<{ policyId: string; version: string }>;
};

const APPENDIX_DEFS_BY_POLICY: Record<string, AppxDef[]> = {
  'GV-GB-002': [
    { label: 'Meeting Agenda',    title: 'Governing Body Meeting Agenda Template',  Component: GB002_AppxA },
    { label: 'Meeting Minutes',   title: 'Governing Body Meeting Minutes Template',  Component: GB002_AppxB },
    { label: 'Attendance Sheet',  title: 'Attendance & Quorum Verification Sheet',   Component: GB002_AppxC },
    { label: 'Directive Tracker', title: 'Governing Body Directive Tracking Log',    Component: GB002_AppxD },
  ],
  'GV-GB-003': [
    { label: 'Committee Charter',  title: 'Board Committee Charter Template',       Component: GB003_AppxA },
    { label: 'Meeting Summary',    title: 'Committee Meeting Summary Form',         Component: GB003_AppxB },
  ],
  'GV-GB-004': [
    { label: 'Orientation Form',  title: 'Board Member Orientation Acknowledgment Form', Component: GB004_AppxA },
    { label: 'Training Log',      title: 'Annual Training Completion Log',          Component: GB004_AppxB },
  ],
  'GV-GB-005': [
    { label: 'COI Disclosure',    title: 'Conflict of Interest Disclosure Form',    Component: GB005_AppxA },
  ],
};

// ─── APPENDICES VIEW ─────────────────────────────────────────────────────────
function ViewAppendices({ pc }: { pc: PolicyContent }) {
  const [activeAppx, setActiveAppx] = useState(0);
  const defs: AppxDef[] = APPENDIX_DEFS_BY_POLICY[pc.id] ?? [];

  if (defs.length === 0) {
    return (
      <div className="pb-12">
        <Card>
          <SectionTitle icon={Paperclip} title="Appendices & Forms" />
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <Paperclip className="mx-auto mb-4 text-white/30" size={48} />
            <p className="text-lg font-montserrat font-bold text-white/50 mb-2">No standalone appendix forms for {pc.id}</p>
            <p className="text-sm text-white/40">Forms and appendices for this policy area are contained in the parent GB policy series (GV-GB-001 through GV-GB-005).</p>
          </div>
        </Card>
      </div>
    );
  }

  const active = defs[Math.min(activeAppx, defs.length - 1)];

  return (
    <div className="pb-12">
      {/* Appendix tab selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {defs.map((d, i) => (
          <button key={i} onClick={() => setActiveAppx(i)}
            className={`px-4 py-2 rounded-lg text-sm font-montserrat font-bold transition-all border shadow-sm ${
              i === activeAppx
                ? 'bg-[#00e59b]/20 text-white border-[#007970] shadow-md'
                : 'bg-white text-white/60 border-white/10 hover:border-[#007970] hover:text-[#00e59b]'
            }`}>
            {d.label}
          </button>
        ))}
      </div>
      <Card>
        <active.Component policyId={pc.id} version={pc.version} />
      </Card>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function GVPolicyDetailView() {
  const { policyId } = useParams<{ policyId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const pc = policyId ? POLICY_MAP[policyId] : undefined;

  if (!pc) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-400 font-roboto">
        Policy content not yet available for this policy ID.
      </div>
    );
  }

  const visibleTabs = ALL_TABS.filter(tab => {
    if (!tab.optional) return true;
    if (tab.id === 'alerts')     return (pc.alerts?.length     ?? 0) > 0;
    if (tab.id === 'faq')        return (pc.faq?.length        ?? 0) > 0;
    if (tab.id === 'exceptions') return (pc.exceptions?.length ?? 0) > 0;
    if (tab.id === 'amendments') return (pc.amendments?.length ?? 0) > 0;
    return false;
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':      return <ViewOverview pc={pc} />;
      case 'policy':        return <ViewPolicy pc={pc} />;
      case 'procedures':    return <ViewProcedures pc={pc} />;
      case 'documentation': return <ViewDocumentation pc={pc} />;
      case 'compliance':    return <ViewCompliance pc={pc} />;
      case 'references':    return <ViewReferences pc={pc} />;
      case 'appendices':    return <ViewAppendices pc={pc} />;
      case 'alerts':        return <ViewAlerts pc={pc} />;
      case 'faq':           return <ViewFAQ pc={pc} />;
      case 'exceptions':    return <ViewExceptions pc={pc} />;
      case 'amendments':    return <ViewAmendments pc={pc} />;
      default:              return <ViewOverview pc={pc} />;
    }
  };

  const tierColor = pc.tier === 'REQUIRED' ? 'bg-red-800' : pc.tier === 'ESSENTIAL' ? 'bg-[#C74600]' : 'bg-[#00e59b]/20';

  return (
    <div className="space-y-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">

      {/* HEADER */}
      <div className="bg-[#00e59b]/20 text-white relative p-8">
        <div className="flex items-start justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-montserrat font-bold text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} /> Back to Library
          </button>
          <button
            onClick={() => window.open(`/print/${pc.id}`, '_blank', 'noopener,noreferrer')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-white/20"
          >
            <Printer size={16} />
            Print / Export PDF
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-montserrat font-bold">{pc.id}</span>
          <span className={`rounded-md ${tierColor} px-2.5 py-1 text-[10px] font-montserrat font-bold uppercase tracking-wider`}>
            {pc.tier === 'REQUIRED' ? 'DRAFT' : 'Draft'}
          </span>
          <span className="rounded-md bg-white/10 border border-white/30 px-2.5 py-1 text-[10px] font-montserrat font-bold uppercase tracking-wider">{pc.tier}</span>
        </div>

        <h2 className="font-montserrat text-3xl font-extrabold leading-tight tracking-tight mb-3">{pc.title}</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3 text-sm mt-4 border-t border-white/20 pt-4">
          {[
            ['Domain', pc.domain],
            ['Tier', pc.tier],
            ['Approved By', pc.approvedBy],
            ['Supersedes', pc.supersedes],
            ['Effective Date', pc.effective],
            ['Last Reviewed', pc.lastReviewed],
            ['Next Review', pc.nextReviewDate],
            ['Version', `v${pc.version}`],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-white/70 block text-xs uppercase tracking-wider font-bold">{label}</span>
              <strong className="text-white text-sm">{value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* TAB BAR */}
      <div className="border-b border-white/10 bg-white/5 overflow-x-auto">
        <div className="flex min-w-max">
          {visibleTabs.map(({ id, label, Icon, optional }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-5 py-3.5 text-xs font-montserrat font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-[#00e59b] text-[#00e59b] bg-white/5'
                  : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={12} /> {label}
              {optional && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#e85200] shrink-0" title="Optional section" />}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 lg:p-8">
        {renderContent()}
      </div>
    </div>
  );
}

export const GV_POLICY_IDS = Object.keys(POLICY_MAP);
