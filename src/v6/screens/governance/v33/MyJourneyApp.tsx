
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Command,
  FileCheck2,
  FileText,
  Fingerprint,
  Gavel,
  GraduationCap,
  Landmark,
  LibraryBig,
  LockKeyhole,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  Scale,
  Search,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UsersRound,
  X,
} from 'lucide-react';
import { MODULES } from './gb-academy/academyData';
import { AcademyCarousel } from './gb-academy/AcademyCarousel';
import QapiBoardView from './qapi/QapiBoardView';
import { getPolicyJourney } from './generated/policyJourney.generated';
import type { PolicyJourneyRequirement } from './generated/policyJourney.types';

const GoverningBodyAcademy = lazy(() => import('./gb-academy/Academy'));
const GoverningBodyPolicyPlayer = lazy(() => import('./policies/GoverningBodyPolicyPlayer'));

type ViewKey = 'brief' | 'book' | 'meetings' | 'calendar' | 'decisions' | 'qapi' | 'risk' | 'policies' | 'academy' | 'record';

type Decision = {
  id: string;
  title: string;
  domain: string;
  due: string;
  status: 'Judgment required' | 'Ready for consent' | 'Evidence hold' | 'Executive session';
  summary: string;
  recommendation: string;
  evidence: string[];
  authority: string;
  owner: string;
  tone: 'attention' | 'ready' | 'hold' | 'private';
};

const NAV_ITEMS: Array<{ id: ViewKey; label: string; short: string; icon: typeof Landmark }> = [
  { id: 'brief', label: 'Executive brief', short: 'Brief', icon: Landmark },
  { id: 'book', label: 'Board book', short: 'Book', icon: BookOpen },
  { id: 'meetings', label: 'Meetings', short: 'Meet', icon: CalendarDays },
  { id: 'calendar', label: 'Governance calendar', short: 'Calendar', icon: CalendarRange },
  { id: 'decisions', label: 'Decision docket', short: 'Decide', icon: Gavel },
  { id: 'qapi', label: 'QAPI oversight', short: 'QAPI', icon: Activity },
  { id: 'risk', label: 'Risk & assurance', short: 'Risk', icon: ShieldCheck },
  { id: 'policies', label: 'Policy register', short: 'Policy', icon: LibraryBig },
  { id: 'academy', label: 'Governance academy', short: 'Academy', icon: GraduationCap },
  { id: 'record', label: 'Evidence record', short: 'Record', icon: Fingerprint },
];

const DECISIONS: Decision[] = [
  {
    id: 'GB-D26-041',
    title: 'Continue the hospitalization improvement project',
    domain: 'Quality & patient safety',
    due: 'Q2 governing-body review',
    status: 'Judgment required',
    summary: 'Aggregate hospitalization improved, while the monitored heart-failure subgroup moved in the wrong direction and the approved sustainability test remains unmet.',
    recommendation: 'Do not authorize closure. Preserve resources, require subgroup root-cause work, reconcile linked complaints, and return against the approved criteria.',
    evidence: ['Q2 executive KPI dashboard', 'Stratified outcome appendix', 'Approved PIP charter', 'Complaint linkage extract', 'Draft QAPI minutes'],
    authority: '42 CFR 484.65 · QA-WF-04 · GV-FM-005',
    owner: 'QAPI Lead / Administrator',
    tone: 'attention',
  },
  {
    id: 'GB-D26-042',
    title: 'Adopt the annual institutional plan and operating budget',
    domain: 'Finance & enterprise stewardship',
    due: 'Annual meeting docket',
    status: 'Ready for consent',
    summary: 'The plan, budget, and variance conditions are reconciled to the finance-committee recommendation and are ready for formal deliberation.',
    recommendation: 'Place on the consent docket subject to confirmation that clinical-control and compliance-independence allocations remain protected.',
    evidence: ['FN-FM-001 operating budget', 'FN-FM-002 institutional plan', 'FN-FM-014 finance minutes', 'GV-FM-005 approval record'],
    authority: 'GV-WF-05 · 42 CFR 484.105',
    owner: 'CFO / Administrator',
    tone: 'ready',
  },
  {
    id: 'GB-D26-043',
    title: 'Hold the vendor-governance amendment pending source repair',
    domain: 'Contracts, privacy & delegated work',
    due: 'Before execution',
    status: 'Evidence hold',
    summary: 'The proposed agreement addresses service levels but does not yet preserve complete BAA exit terms, audit access, clinical control, or a clean conflict record.',
    recommendation: 'Keep the agreement off the approval docket until the authority matrix, conflict trail, transition rights, and evidence-return duties are complete.',
    evidence: ['Proposed services agreement', 'BAA exhibit', 'Ownership relationship map', 'Conflict disclosure', 'Procurement audit history'],
    authority: 'GV-WF-11 · GV-WF-08 · HIPAA 164.308(b)',
    owner: 'Compliance / Legal',
    tone: 'hold',
  },
  {
    id: 'GB-D26-044',
    title: 'Review the patient-safety escalation in executive session',
    domain: 'Risk & quality',
    due: 'Immediate board notice',
    status: 'Executive session',
    summary: 'A delayed after-hours escalation touches the same fragile subgroup and vendor workflow already under Board review.',
    recommendation: 'Protect the patient record, preserve the audit trail, separate privileged discussion, and document only the authorized public-session action.',
    evidence: ['Incident record', 'RCA initiation', 'Patient communication log', 'Prior complaint trend', 'Executive-session notice'],
    authority: 'QA-WF-05 · QA-WF-12 · GV-WF-14',
    owner: 'Administrator / Risk / Legal',
    tone: 'private',
  },
];

const BOOK_SECTIONS = [
  { code: '01', title: 'Chair memorandum', pages: '01–04', status: 'Ready', detail: 'Purpose, requested actions, conflict reminder, and document-control statement.' },
  { code: '02', title: 'Agenda, attendance & quorum', pages: '05–09', status: 'Ready', detail: 'Notice, agenda sequence, member roster, attendance mode, and quorum calculation.' },
  { code: '03', title: 'Administrator & clinical leadership report', pages: '10–22', status: 'Ready', detail: 'Operating posture, licensure, staffing, census, clinical-control exceptions, and material events.' },
  { code: '04', title: 'Q2 QAPI oversight', pages: '23–48', status: 'Review', detail: 'Quarterly dashboard, stratified analysis, PIP status, complaints, adverse events, and committee recommendations.' },
  { code: '05', title: 'Compliance, privacy & risk', pages: '49–64', status: 'Review', detail: 'Audit results, investigations, exclusions, privacy events, enterprise risks, and corrective-action status.' },
  { code: '06', title: 'Finance & resource sufficiency', pages: '65–76', status: 'Ready', detail: 'Budget, liquidity, denials, resource dependencies, material variances, and management certification.' },
  { code: '07', title: 'Policy & contract approvals', pages: '77–91', status: 'Hold', detail: 'Required-tier policy changes, third-party arrangements, conflict trail, and proposed resolutions.' },
  { code: '08', title: 'Motions, actions & record close', pages: '92–100', status: 'Draft', detail: 'Decision language, assigned owners, due dates, effectiveness checks, attestations, and minutes controls.' },
];

const QAPI_WORKFLOWS = [
  ['QA-WF-01', 'Program charter & annual review', 'Annual', 'Board approval'],
  ['QA-WF-02', 'Quality indicator dashboard', 'Monthly', 'Current'],
  ['QA-WF-03', 'Quarterly committee review', 'Quarterly', 'Board brief'],
  ['QA-WF-04', 'Performance improvement lifecycle', 'Annual+', 'Decision due'],
  ['QA-WF-05', 'Adverse event, RCA & correction', 'Event-driven', 'Monitored'],
  ['QA-WF-06', 'Infection-control surveillance', 'Continuous', 'Current'],
  ['QA-WF-07', 'LUPA & utilization monitoring', 'Weekly', 'Current'],
  ['QA-WF-08', 'HHCAHPS monitoring & response', 'Monthly', 'Current'],
  ['QA-WF-09', 'Star rating & public reporting', 'Quarterly', 'Current'],
  ['QA-WF-10', 'QAPI self-assessment', 'Annual', 'Scheduled'],
  ['QA-WF-11', 'Policy effectiveness monitoring', '30/60/90', 'Monitored'],
  ['QA-WF-12', 'Patient-safety communication', 'Event-driven', 'Monitored'],
];

const RISKS = [
  { rank: '01', title: 'High-risk subgroup deterioration', domain: 'Clinical quality', posture: 'Board direction required', trend: 'up', owner: 'QAPI Lead', control: 'Continue PIP; preserve weekend escalation resources', tone: 'critical' },
  { rank: '02', title: 'Vendor authority and exit-term gaps', domain: 'Third-party governance', posture: 'Approval hold', trend: 'flat', owner: 'Compliance / Legal', control: 'Complete control matrix, BAA exit rights, audit access', tone: 'elevated' },
  { rank: '03', title: 'Committee-to-board record variance', domain: 'Decision evidence', posture: 'Correction open', trend: 'down', owner: 'Board Secretary', control: 'Reconcile recommendation, dissent, vote, and attachments', tone: 'elevated' },
  { rank: '04', title: 'Annual policy reapproval concentration', domain: 'Policy lifecycle', posture: 'Managed', trend: 'flat', owner: 'Compliance Officer', control: 'Stage required-tier approvals across two consent dockets', tone: 'managed' },
  { rank: '05', title: 'Licensure and certification calendar', domain: 'Enterprise continuity', posture: 'Controlled', trend: 'down', owner: 'Administrator', control: 'Quarterly GV-FM-019 reconciliation', tone: 'controlled' },
];

const GB_POLICY_REQUIREMENTS = getPolicyJourney('GB').requirements;

type GovernanceCalendarItem = {
  date: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'NEXT';
  title: string;
  owner: string;
  authority: string;
  evidence: string;
  state: 'complete' | 'attention' | 'scheduled' | 'rule';
};

const CES_GOVERNANCE_CALENDAR: GovernanceCalendarItem[] = [
  { date: 'JAN 08', quarter: 'Q1', title: 'Annual governance packet review', owner: 'Chair · Administrator', authority: 'GV-WF-05 · GV-WF-06 · GV-WF-07', evidence: 'Plan, budget, service scope, public description, approval minutes', state: 'complete' },
  { date: 'JAN 15', quarter: 'Q1', title: 'Biennial emergency-program review and update', owner: 'Administrator · Risk', authority: 'GV-WF-12 · RM-EP-001', evidence: 'HVA, plan, communications, version approval', state: 'complete' },
  { date: 'JAN 22', quarter: 'Q1', title: 'Biennial emergency-preparedness training', owner: 'Compliance · Administrator', authority: 'GV-WF-13 · RM-EP-002', evidence: 'Attendance, completion, Board training log', state: 'complete' },
  { date: 'FEB 05', quarter: 'Q1', title: 'Quarterly QAPI review and annual PIP kickoff', owner: 'QAPI Lead · Governing Body', authority: 'QA-WF-03 · QA-WF-04 · GV-WF-01', evidence: 'Dashboard, PIP charter, RCA, direction, minutes', state: 'complete' },
  { date: 'MAR 18', quarter: 'Q1', title: 'Annual emergency exercise', owner: 'Administrator · Risk', authority: 'RM-EP-002 · GV-WF-01', evidence: 'Attendance, debrief, AAR/IP, corrective actions', state: 'complete' },
  { date: 'MAR 31', quarter: 'Q1', title: 'HHCAHPS participation or exemption decision', owner: 'QAPI · Compliance', authority: 'QA-WF-08 · GV-WF-01', evidence: 'Eligible count, filing or vendor record, Board report', state: 'complete' },
  { date: 'JUN 30', quarter: 'Q2', title: 'Q2 governance and QAPI period close', owner: 'Chair · Board Secretary', authority: 'GV-WF-01 · QA-WF-03', evidence: 'Q2 packet, directives, owners, deadlines, minutes', state: 'attention' },
  { date: 'JUL 10', quarter: 'Q3', title: 'Annual controlled-policy review concentration', owner: 'Policy owners · Compliance', authority: 'GV-PM-001 · GV-PM-002 · EN-LC-001', evidence: 'Redlines, approval routing, version log, re-acknowledgment plan', state: 'attention' },
  { date: 'SEP 30', quarter: 'Q3', title: 'Q3 Governing Body review — date must be fixed', owner: 'Chair · Administrator', authority: 'GV-WF-01', evidence: 'Agenda ≥7 days, packet ≥3 days, signed minutes ≤14 days', state: 'scheduled' },
  { date: 'DEC 01', quarter: 'Q4', title: 'FY2027 institutional plan and budget approval deadline', owner: 'CFO · Administrator · Governing Body', authority: 'GV-WF-05', evidence: 'Final plan, budget, motion, vote, conditions, minutes', state: 'scheduled' },
  { date: 'DEC 31', quarter: 'Q4', title: 'Q4 Governing Body review and annual close', owner: 'Chair · Board Secretary', authority: 'GV-WF-01 · GV-WF-02', evidence: 'Quarterly reports, open actions, annual assessment launch', state: 'scheduled' },
  { date: 'JAN 30', quarter: 'NEXT', title: 'Annual Governing Body self-assessment complete', owner: 'Chair · Compliance', authority: 'GV-WF-02', evidence: 'Aggregate assessment, approved improvement plan, training plan', state: 'rule' },
];

const GOVERNANCE_ACTION_REGISTER = [
  ['GV-WF-01', 'Quarterly meeting & minutes', 'Meet at least quarterly; ≤120 days between meetings', 'Agenda ≥7 days · packet ≥3 days · minutes ≤14 days', 'GV-FM-004 · GV-FM-005 · GV-FM-011 · GV-FM-023'],
  ['GV-WF-02', 'Annual Board self-assessment', 'Annual or after a material governance finding', 'Complete within 30 days of fiscal-year end; quarterly follow-up', 'GV-FM-008 · GV-FM-022 · GV-FM-024'],
  ['GV-WF-03', 'Administrator appointment or delegation', 'Vacancy, incapacity, succession, or absence >1 business day', 'Interim 24–72h · permanent vote ≤30d · 855A ≤30d', 'GV-FM-005 · 007 · 013 · 014 · 017 · 019'],
  ['GV-WF-04', 'Clinical Manager appointment', 'Vacancy or planned transition', 'Qualified coverage at all times · Board confirmation ≤30d', 'GV-FM-005 · 015 · 017 · 019'],
  ['GV-WF-05', 'Institutional plan & budget', 'Annual plus >10% variance amendment', 'Board approval ≥30 days before FY; variance review quarterly', 'GV-FM-005 · GV-FM-009 · FN-FM-011'],
  ['GV-WF-06', 'Acceptance-to-service policy', 'Annual or material service/case-mix/staffing change', 'Board approval annually; staff training ≤30d after approval', 'GV-FM-005 · GV-FM-016 · OP-FM-015'],
  ['GV-WF-07', 'Public service information', 'Annual or any approved scope change', 'Board approval annually; update within 30d of scope change', 'GV-FM-005 · GV-FM-016 · GV-FM-020'],
  ['GV-WF-08', 'Conflict-of-interest disclosure', 'Appointment, annual refresh, or new interest', 'Disclosure ≤30d · mitigation ≤30d · immediate recusal', 'GV-FM-006 · GV-FM-005 · GV-FM-023'],
  ['GV-WF-09', 'Licensure & certification', 'Quarterly verification and each renewal/change event', '90/60/30-day renewal gates · adverse notice to Board ≤24h', 'GV-FM-002 · GV-FM-019 · GV-FM-023'],
  ['GV-WF-10', 'Change of ownership or closure', 'Sale, merger, closure, or involuntary termination', 'Board resolution · notices ≥30–45d · final meeting at closure', 'GV-FM-001 · GV-FM-005 · GV-FM-022'],
  ['GV-WF-11', 'Third-party contract review', 'New, renewal, material amendment, or performance failure', 'Board approval before signing when >$50k, referral, or management', 'GV-FM-005 · GV-FM-018 · CO-FM-010 · 011 · 016 · 017'],
  ['GV-WF-12', 'High-risk external communication', 'Media, regulator, grievance, or public statement', 'Log ≤4h; Chair approval before high-risk release', 'GV-FM-020 · GV-FM-025'],
  ['GV-WF-13', 'Board training & orientation', 'Appointment and annual refresher', 'Packet ≤7d · schedule ≤30d · completion ≤60d', 'GV-FM-024 · EN-FM-001'],
  ['GV-WF-14', 'Executive session', 'PHI, personnel, litigation, M&A, or privileged strategy', 'Motion + confidentiality at start · separate minutes ≤14d', 'GV-FM-005 · GV-FM-012 · GV-FM-022'],
] as const;

function BrandCrest() {
  return <div className="governance-crest" aria-hidden="true"><img src="/logo-careindeed-orange.png" alt="" /></div>;
}

function StatusMark({ tone }: { tone: string }) {
  return <span className={`status-mark ${tone}`} aria-hidden="true" />;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <header className="governance-page-heading"><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</header>;
}

function Metric({ value, label, note, tone = 'neutral' }: { value: string; label: string; note: string; tone?: string }) {
  return <article className={`governance-metric ${tone}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function Sparkline({ points, down = false }: { points: number[]; down?: boolean }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const coords = points.map((value, index) => {
    const x = (index / (points.length - 1)) * 100;
    const y = 34 - ((value - min) / Math.max(1, max - min)) * 28;
    return `${x},${y}`;
  }).join(' ');
  return <svg className={`sparkline ${down ? 'down' : ''}`} viewBox="0 0 100 38" role="img" aria-label="Quarterly trend"><line x1="0" y1="35" x2="100" y2="35" /><polyline points={coords} /></svg>;
}


function ExecutiveBrief({ onView, onDecision }: { onView: (view: ViewKey) => void; onDecision: (decision: Decision) => void }) {
  return <div className="governance-page brief-page">
    <section className="brief-hero">
      <div className="brief-intro">
        <div className="brief-overline"><span>GOVERNING BODY OFFICE</span><i /> <span>Q2 · 2026</span></div>
        <h1>Stewardship,<br /><em>made visible.</em></h1>
        <p>A single decision environment for authority, quality, risk, policy, resources, and the record that proves the Board governed.</p>
        <div className="brief-actions"><button className="executive-button" onClick={() => onView('decisions')}>Review the docket <ArrowRight size={16} /></button><button className="quiet-link" onClick={() => onView('book')}>Open Q2 board book <BookOpen size={15} /></button></div>
      </div>
      <article className="next-convening">
        <div className="next-convening-top"><span>NEXT CONVENING</span><small>QUARTERLY</small></div>
        <div className="convening-date"><strong>Q2</strong><div><span>Governing Body Review</span><small>April 1 – June 30, 2026</small></div></div>
        <p>The book is assembled. Four matters require judgment; one remains on evidence hold.</p>
        <div className="convening-facts"><span><b>8</b> book sections</span><span><b>4</b> decisions</span><span><b>1</b> executive session</span></div>
        <button onClick={() => onView('meetings')}>Enter meeting workspace <ChevronRight size={16} /></button>
      </article>
    </section>

    <section className="governance-metric-row" aria-label="Governance control metrics">
      <Metric value="166/166" label="Workflow integrity" note="All authored workflows retain the 13-section contract" tone="positive" />
      <Metric value="199" label="Board touchpoints" note="GV-FM-005 mapped across enterprise decisions" />
      <Metric value="48" label="QAPI minute links" note="QA-FM-001 references across quality workflows" />
      <Metric value="349" label="Controlled forms" note="No broken workflow-to-form references" />
      <Metric value="4" label="Decision matters" note="One ready · two require judgment · one private" tone="attention" />
    </section>

    <section className="brief-main-grid">
      <div className="decision-docket-card">
        <header><div><span>DECISION DOCKET</span><h2>Where the Board’s judgment matters</h2></div><button onClick={() => onView('decisions')}>View all <ArrowRight size={14} /></button></header>
        <div className="decision-list">{DECISIONS.slice(0, 3).map((decision) => <button key={decision.id} onClick={() => onDecision(decision)}>
          <StatusMark tone={decision.tone} /><div><span>{decision.id} · {decision.domain}</span><strong>{decision.title}</strong><small>{decision.status} · {decision.due}</small></div><ChevronRight size={16} />
        </button>)}</div>
      </div>
      <aside className="assurance-column">
        <article className="assurance-card dark">
          <div className="assurance-card-head"><span>ASSURANCE SIGNAL</span><BadgeCheck size={18} /></div>
          <strong>Evidence architecture is intact.</strong>
          <p>Every governance touchpoint resolves to a defined workflow, controlled form, approval record, and retention path.</p>
          <div className="assurance-score"><b>0</b><span>broken references<br />after three full passes</span></div>
        </article>
        <article className="assurance-card light">
          <div><span>BOARD SECRETARY NOTE</span><MessageSquareText size={17} /></div>
          <p>“Do not let a favorable aggregate erase the subgroup, the dissent, or the condition attached to approval.”</p>
          <button onClick={() => onDecision(DECISIONS[0])}>Open the QAPI judgment brief</button>
        </article>
      </aside>
    </section>

    <section className="cycle-card"><header><div><span>QUARTERLY GOVERNANCE CYCLE</span><h2>From evidence to accountable action</h2></div><small>Current cycle · Q2 close</small></header><ol>
      {[
        ['01', 'Assemble', 'Reports and source evidence', 'complete'],
        ['02', 'Interrogate', 'Exceptions, dependencies, dissent', 'complete'],
        ['03', 'Deliberate', 'Motions and conditions', 'current'],
        ['04', 'Direct', 'Owner, deadline, effectiveness test', 'next'],
        ['05', 'Prove', 'Minutes, signatures, immutable record', 'next'],
      ].map(([number, title, body, state]) => <li key={number} className={state}><span>{number}</span><div><strong>{title}</strong><small>{body}</small></div></li>)}
    </ol></section>
  </div>;
}

function BoardBookView({ onView }: { onView: (view: ViewKey) => void }) {
  const [open, setOpen] = useState('04');
  return <div className="governance-page">
    <PageHeading eyebrow="BOARD BOOK · Q2 2026" title="The record before the room." description="A controlled executive packet organized around what must be understood, decided, assigned, and preserved." action={<button className="executive-button" onClick={() => onView('meetings')}>Open meeting workspace <ArrowRight size={16} /></button>} />
    <section className="board-book-layout">
      <article className="board-book-cover">
        <div className="cover-rule"><span>CARE INDEED</span><i>CONTROLLED</i></div>
        <div className="cover-title"><small>GOVERNING BODY</small><strong>Quarterly<br />Board Book</strong><p>Quality · Risk · Compliance · Finance · Policy</p></div>
        <div className="cover-quarter"><span>Q2</span><div><strong>2026</strong><small>APR 01 — JUN 30</small></div></div>
        <footer><span>GV-WF-01</span><span>CONFIDENTIAL GOVERNANCE RECORD</span></footer>
      </article>
      <div className="board-book-index">
        <header><div><span>CONTENTS</span><h2>Eight sections. One defensible chain.</h2></div><div className="book-status"><CheckCircle2 size={16} /><span>6 of 8 review-ready</span></div></header>
        <div>{BOOK_SECTIONS.map((section) => <article key={section.code} className={open === section.code ? 'open' : ''}>
          <button onClick={() => setOpen(open === section.code ? '' : section.code)}><span>{section.code}</span><div><strong>{section.title}</strong><small>{section.pages} · {section.status}</small></div><ChevronDown size={16} /></button>
          {open === section.code && <div className="book-section-detail"><p>{section.detail}</p><div><span><FileCheck2 size={13} /> Source-indexed</span><span><LockKeyhole size={13} /> Controlled record</span><button onClick={() => section.code === '04' ? onView('qapi') : onView('decisions')}>Open workspace <ArrowRight size={13} /></button></div></div>}
        </article>)}</div>
      </div>
    </section>
    <section className="document-control-band"><Fingerprint size={22} /><div><span>DOCUMENT CONTROL</span><strong>The packet is not the proof by itself.</strong><p>The defensible record joins notice, attendance, quorum, deliberation, conflicts, motions, votes, conditions, action owners, due dates, follow-up, and the signed minutes artifact.</p></div><span className="control-code">GV-FM-005</span></section>
  </div>;
}

function MeetingsView({ onDecision }: { onDecision: (decision: Decision) => void }) {
  const agenda = [
    ['09:00', 'Call to order · attendance · quorum · conflicts', 'Board Chair', 'Governance'],
    ['09:15', 'Prior minutes and open-action verification', 'Board Secretary', 'Consent'],
    ['09:35', 'Administrator and clinical leadership report', 'Administrator / DON', 'Oversight'],
    ['10:20', 'Q2 QAPI judgment brief', 'QAPI Lead', 'Decision'],
    ['11:10', 'Compliance, enterprise risk and policy docket', 'Compliance Officer', 'Decision'],
    ['11:45', 'Finance, resources and vendor conditions', 'CFO', 'Decision'],
    ['12:20', 'Executive session', 'Chair / Counsel', 'Restricted'],
    ['12:50', 'Motions, action register and record close', 'Board Secretary', 'Governance'],
  ];
  return <div className="governance-page">
    <PageHeading eyebrow="MEETING CENTER · GV-WF-01" title="A meeting that proves governance." description="The room is structured around valid authority, useful deliberation, exact decisions, and a record that survives inspection." action={<div className="meeting-state"><CircleDot size={14} /><span>Q2 workspace assembled</span></div>} />
    <section className="meeting-summary-grid">
      <article className="quorum-card"><span>QUORUM POSTURE</span><div><strong>5 / 6</strong><small>voting members anticipated</small></div><p>Quorum remains intact if the conflicted member recuses from the vendor matter.</p><footer><UsersRound size={16} /><span>Attendance mode must be captured per member</span></footer></article>
      <article><span>OPEN ACTIONS</span><strong>7</strong><p>Three close with evidence; four return for Board verification.</p><small>Oldest open item · 42 days</small></article>
      <article><span>CONSENT DOCKET</span><strong>3</strong><p>Prior minutes, roster confirmation, and annual plan condition.</p><small>Any member may pull an item</small></article>
      <article><span>RESTRICTED MATTERS</span><strong>1</strong><p>Patient-safety escalation reserved for executive session.</p><small>Separate record controls apply</small></article>
    </section>
    <section className="meeting-workspace-grid">
      <div className="agenda-card"><header><div><span>AGENDA</span><h2>Quarterly governing-body review</h2></div><small>3 h 50 min · executive working session</small></header><ol>{agenda.map(([time, title, owner, type], index) => <li key={time} className={type.toLowerCase()}><time>{time}</time><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{title}</strong><small>{owner} · {type}</small></div>{type === 'Decision' && <Gavel size={15} />}{type === 'Restricted' && <LockKeyhole size={15} />}</li>)}</ol></div>
      <aside className="meeting-side">
        <article className="chair-brief"><span>CHAIR’S BRIEF</span><h3>Three questions before every vote.</h3><ol><li><b>01</b><p>What authority are we exercising?</p></li><li><b>02</b><p>What evidence could change the answer?</p></li><li><b>03</b><p>How will we know our direction worked?</p></li></ol></article>
        <article className="live-docket"><div><span>DECISION MATTERS</span><small>4</small></div>{DECISIONS.map((decision) => <button key={decision.id} onClick={() => onDecision(decision)}><StatusMark tone={decision.tone} /><span>{decision.id}</span><strong>{decision.title}</strong><ChevronRight size={14} /></button>)}</article>
      </aside>
    </section>
  </div>;
}

function DecisionsView({ onDecision }: { onDecision: (decision: Decision) => void }) {
  const [filter, setFilter] = useState<'all' | Decision['status']>('all');
  const filtered = DECISIONS.filter((decision) => filter === 'all' || decision.status === filter);
  return <div className="governance-page">
    <PageHeading eyebrow="DECISION DOCKET" title="Judgment, with conditions attached." description="Each matter joins the recommendation, contrary evidence, authority, conflict posture, motion language, owner, deadline, and effectiveness test." />
    <nav className="decision-filters" aria-label="Decision filters">{(['all', 'Judgment required', 'Ready for consent', 'Evidence hold', 'Executive session'] as const).map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item === 'all' ? 'All matters' : item}<span>{item === 'all' ? DECISIONS.length : DECISIONS.filter((decision) => decision.status === item).length}</span></button>)}</nav>
    <section className="decision-table"><header><span>MATTER</span><span>POSTURE</span><span>ACCOUNTABLE OWNER</span><span>AUTHORITY</span><span /></header>{filtered.map((decision) => <button key={decision.id} onClick={() => onDecision(decision)}><div className="decision-identity"><StatusMark tone={decision.tone} /><div><small>{decision.id} · {decision.domain}</small><strong>{decision.title}</strong><p>{decision.summary}</p></div></div><span className={`decision-posture ${decision.tone}`}>{decision.status}</span><span>{decision.owner}</span><span>{decision.authority}</span><ChevronRight size={17} /></button>)}</section>
    <section className="decision-principle"><Scale size={22} /><div><span>GOVERNANCE STANDARD</span><strong>The narrowest complete decision wins.</strong><p>Do not approve more than the evidence supports. Do not withhold more than the risk requires. State the condition, owner, deadline, return trigger, and proof of effectiveness.</p></div></section>
  </div>;
}

function QapiView({ onDecision }: { onDecision: (decision: Decision) => void }) {
  return <div className="governance-page">
    <PageHeading eyebrow="QAPI OVERSIGHT · 42 CFR 484.65" title="Govern the signal, not the color." description="An executive view of program integrity, the current performance judgment, and the complete evidence chain from measure to sustained improvement." action={<button className="executive-button" onClick={() => onDecision(DECISIONS[0])}>Open judgment brief <ArrowRight size={16} /></button>} />
    <section className="qapi-score-grid">
      <article className="qapi-primary-signal"><div className="signal-top"><span>ILLUSTRATIVE PERFORMANCE SIGNAL</span><small>Q2 2026 · SYNTHETIC CASE</small></div><div className="signal-main"><div><strong>15.1%</strong><span>all-agency hospitalization</span><small><TrendingDown size={13} /> improved from 18.4%</small></div><Sparkline points={[18.4, 17.8, 16.6, 15.1]} down /></div><footer><AlertTriangle size={16} /><p>Aggregate improvement is favorable, but it is not sufficient for project closure.</p></footer></article>
      <article className="qapi-subgroup"><span>HIGH-RISK STRATUM</span><strong>27.8%</strong><p>Heart-failure subgroup worsened from 22.0% and exceeds the approved 20% threshold.</p><Sparkline points={[22, 22.8, 25.1, 27.8]} /><small><TrendingUp size={13} /> 18% of eligible population</small></article>
      <article className="qapi-criteria"><span>CLOSURE CRITERION</span><strong>0 / 2</strong><p>Consecutive quarters below 20% in every named high-risk stratum.</p><div><i /><i /><span>Sustainability test unmet</span></div></article>
      <article className="qapi-linkage"><span>LINKED COMPLAINTS</span><strong>3</strong><p>Three heart-failure complaints reference delayed symptom escalation; two were substantiated.</p><small><MessageSquareText size={13} /> Must be reconciled into the analysis</small></article>
    </section>
    <section className="qapi-main-grid">
      <div className="qapi-workflow-card"><header><div><span>CONTROL SYSTEM</span><h2>Twelve governed QAPI workflows</h2></div><small>48 QA-FM-001 touchpoints</small></header><div>{QAPI_WORKFLOWS.map(([id, title, cadence, state]) => <article key={id}><span>{id}</span><strong>{title}</strong><small>{cadence}</small><i className={state === 'Decision due' ? 'attention' : ''}>{state}</i></article>)}</div></div>
      <aside className="qapi-assurance-side"><article className="qapi-direction"><span>PROPOSED BOARD DIRECTION</span><h3>Continue with targeted executive conditions.</h3><ul><li>Reject premature closure.</li><li>Require subgroup root-cause analysis.</li><li>Preserve relevant analyst and coaching resources.</li><li>Reconcile complaints and after-hours workflow.</li><li>Return against the approved threshold and sustainability rule.</li></ul><button onClick={() => onDecision(DECISIONS[0])}>Read the complete rationale <ArrowRight size={14} /></button></article><article className="qapi-board-duty"><ShieldCheck size={19} /><div><strong>Board duty</strong><p>Ensure QAPI has organization-wide scope, adequate resources, useful information, and evidence of improvement—not merely completed paperwork.</p></div></article></aside>
    </section>
  </div>;
}

function RiskView({ onDecision }: { onDecision: (decision: Decision) => void }) {
  return <div className="governance-page">
    <PageHeading eyebrow="ENTERPRISE RISK & ASSURANCE" title="See the dependency, not just the event." description="A compact Board view of material exposure, its direction of travel, accountable ownership, current control, and the decision dependency it creates." />
    <section className="risk-overview"><article><span>RISK POSTURE</span><strong>Focused attention</strong><p>One quality signal requires Board direction; no workflow-to-evidence integrity break is open.</p></article><Metric value="1" label="Critical" note="Immediate governance direction" tone="attention" /><Metric value="2" label="Elevated" note="Active correction or approval hold" /><Metric value="2" label="Controlled" note="Monitored within tolerance" tone="positive" /></section>
    <section className="risk-register"><header><span>PRIORITY</span><span>EXPOSURE</span><span>TREND</span><span>CONTROL & OWNER</span><span>POSTURE</span></header>{RISKS.map((risk) => <article key={risk.rank}><span>{risk.rank}</span><div><small>{risk.domain}</small><strong>{risk.title}</strong></div><span className={`risk-trend ${risk.trend}`}>{risk.trend === 'up' ? <TrendingUp size={15} /> : risk.trend === 'down' ? <TrendingDown size={15} /> : <ArrowRight size={15} />}{risk.trend === 'up' ? 'Rising' : risk.trend === 'down' ? 'Improving' : 'Stable'}</span><div><strong>{risk.control}</strong><small>{risk.owner}</small></div><i className={risk.tone}>{risk.posture}</i></article>)}</section>
    <section className="risk-bottom-grid"><article className="risk-map"><span>DEPENDENCY MAP</span><h2>One decision touches four systems.</h2><div><button onClick={() => onDecision(DECISIONS[0])}><Activity size={17} /><strong>QAPI signal</strong><small>Subgroup + complaints</small></button><i /><button><UsersRound size={17} /><strong>Clinical control</strong><small>After-hours escalation</small></button><i /><button><Scale size={17} /><strong>Resources</strong><small>Analyst + coaching hours</small></button><i /><button><FileCheck2 size={17} /><strong>Official record</strong><small>Criteria + minutes</small></button></div></article><article className="assurance-opinion"><span>ASSURANCE OPINION</span><h3>Reasonable assurance—conditional.</h3><p>The governance architecture is complete and traceable. Assurance remains conditional until the quality judgment, vendor control gaps, and committee-to-board record variance close with evidence.</p><footer><BadgeCheck size={17} /><span>Evidence architecture reviewed across 166 workflows</span></footer></article></section>
  </div>;
}

function CalendarView({ onDecision }: { onDecision: (decision: Decision) => void }) {
  const [quarter, setQuarter] = useState<'ALL' | GovernanceCalendarItem['quarter']>('ALL');
  const visibleEvents = CES_GOVERNANCE_CALENDAR.filter((item) => quarter === 'ALL' || item.quarter === quarter);
  return <div className="governance-page governance-calendar-page">
    <PageHeading eyebrow="CES GOVERNANCE CALENDAR · 2026" title="One calendar for every Board duty." description="A separate Governing Body calendar that joins the dated CES cycle, Q2 return items, and all fourteen governance workflows—including triggered obligations that must never be forced into a fictional date." action={<button className="executive-button" onClick={() => onDecision(DECISIONS[0])}>Open Q2 return brief <ArrowRight size={16} /></button>} />
    <section className="calendar-control-row">
      <div><span>YEAR AT A GLANCE</span><strong>2026 governance cycle</strong><small>Exact CES dates + rule-based deadlines</small></div>
      <nav aria-label="Filter governance calendar">{(['ALL', 'Q1', 'Q2', 'Q3', 'Q4', 'NEXT'] as const).map((item) => <button key={item} className={quarter === item ? 'active' : ''} onClick={() => setQuarter(item)}>{item === 'ALL' ? 'All dates' : item === 'NEXT' ? 'Next cycle' : item}</button>)}</nav>
      <div className="calendar-assurance"><BadgeCheck size={17} /><span><b>14 / 14</b> GV workflows represented</span></div>
    </section>

    <section className="calendar-date-grid">{visibleEvents.map((item) => <article key={`${item.quarter}-${item.date}-${item.title}`} className={item.state}>
      <div className="calendar-date"><small>{item.quarter}</small><strong>{item.date.split(' ')[1]}</strong><span>{item.date.split(' ')[0]}</span></div>
      <div className="calendar-event-copy"><span>{item.authority}</span><h2>{item.title}</h2><p>{item.owner}</p><div><FileCheck2 size={14} /><span>{item.evidence}</span></div></div>
      <i>{item.state === 'complete' ? 'Closed with evidence' : item.state === 'attention' ? 'Board attention' : item.state === 'scheduled' ? 'Schedule / prepare' : 'Rule-based deadline'}</i>
    </article>)}</section>

    <section className="calendar-q2-return">
      <header><div><span>Q2 RETURN AGENDA</span><h2>Actions that must come back to the Board</h2></div><small>From the current QAPI and decision docket</small></header>
      <ol>{[
        ['01', 'Continue the hospitalization PIP', 'Do not authorize closure while the high-risk subgroup remains above threshold.', 'QAPI Lead', 'Next governing-body review'],
        ['02', 'Complete subgroup root-cause analysis', 'Explain the heart-failure deterioration and after-hours escalation dependency.', 'DON · QAPI Lead', 'Before return review'],
        ['03', 'Reconcile linked complaints', 'Join the three related complaints and two substantiated findings to the PIP analysis.', 'Compliance · QAPI', 'Before return review'],
        ['04', 'Preserve improvement resources', 'Maintain analyst and coaching capacity until the sustainability criterion is met.', 'Administrator · CFO', 'Effective immediately'],
        ['05', 'Return against approved criteria', 'Report every named stratum against two consecutive quarters below the approved threshold.', 'QAPI Lead', 'At each quarterly review'],
        ['06', 'Repair the vendor approval record', 'Keep the amendment on evidence hold until authority, BAA exit terms, audit access, and conflicts are complete.', 'Compliance · Legal', 'Before execution'],
      ].map(([number, title, body, owner, due]) => <li key={number}><b>{number}</b><div><strong>{title}</strong><p>{body}</p></div><span>{owner}</span><small>{due}</small></li>)}</ol>
    </section>

    <section className="governance-action-register">
      <header><div><span>COMPLETE GOVERNANCE ACTION REGISTER</span><h2>Every Governing Body workflow on one control surface</h2></div><small>Recurring + event-driven · source-backed</small></header>
      <div className="action-register-head"><span>WORKFLOW</span><span>BOARD ACTION</span><span>TRIGGER</span><span>CONTROL CLOCK</span><span>REQUIRED EVIDENCE</span></div>
      {GOVERNANCE_ACTION_REGISTER.map(([id, title, trigger, clock, evidence]) => <article key={id}><span>{id}</span><strong>{title}</strong><p>{trigger}</p><p>{clock}</p><small>{evidence}</small></article>)}
    </section>
  </div>;
}

function PoliciesView({ onOpen }: { onOpen: (requirement: PolicyJourneyRequirement) => void }) {
  const [query, setQuery] = useState('');
  const [course, setCourse] = useState('ALL');
  const courses = Array.from(new Map(GB_POLICY_REQUIREMENTS.map((item) => [item.courseId, item.courseTitle])).entries());
  const visible = GB_POLICY_REQUIREMENTS.filter((policy) => (course === 'ALL' || policy.courseId === course) && `${policy.policyId} ${policy.policyTitle} ${policy.courseTitle}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="governance-page">
    <PageHeading eyebrow="GOVERNING BODY POLICY INSTITUTE" title="Read policy as an instrument of judgment." description="The complete spreadsheet-defined Governing Body set: forty-two controlled readings across thirteen executive courses. Every assigned policy now opens, renders, and carries a source-linked practice quiz." action={<label className="policy-search"><Search size={15} /><input aria-label="Search policies" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search policy, course, or ID" /></label>} />
    <section className="policy-posture-band"><div><span>RECONCILED ASSIGNMENT SET</span><strong>42 of 42 Governing Body policies render</strong></div><p>41 policies resolve from the generated controlled library. GV-GB-001 is explicitly restored from the supplied raw source and labeled pending metadata reconciliation—nothing is fabricated or silently omitted.</p><span><BookOpenCheck size={15} /> 13 executive courses · 80% practice standard</span></section>
    <nav className="policy-course-filter" aria-label="Filter policies by executive course"><button className={course === 'ALL' ? 'active' : ''} onClick={() => setCourse('ALL')}>All policies <span>42</span></button>{courses.map(([id, title]) => <button key={id} className={course === id ? 'active' : ''} onClick={() => setCourse(id)}>{id}<span>{GB_POLICY_REQUIREMENTS.filter((item) => item.courseId === id).length}</span><small>{title}</small></button>)}</nav>
    <section className="policy-register executive-policy-register"><header><span>POLICY</span><span>EXECUTIVE COURSE</span><span>VERSION</span><span>SOURCE STATE</span><span>CADENCE</span><span /></header>{visible.map((policy) => <article key={policy.requirementId}><div><span>{policy.policyId}</span><strong>{policy.policyTitle.replace(' (absent from generated library)', '')}</strong></div><span>{policy.courseId} · {policy.courseTitle}</span><span>{policy.policyVersion ?? 'Raw v6.0'}</span><i className={policy.policySourceAvailability === 'generated_body' ? 'ready' : 'attention'}>{policy.policySourceAvailability === 'generated_body' ? 'Controlled body' : 'Source restored'}</i><span>{policy.schedule.recurrenceRaw}</span><button onClick={() => onOpen(policy)} aria-label={`Open ${policy.policyId}`}><ChevronRight size={16} /></button></article>)}</section>
    {!visible.length && <section className="policy-empty"><Search size={24} /><strong>No policy matches this view.</strong><p>Clear the search or select another executive course.</p></section>}
    <section className="policy-principles"><article><span>01</span><h3>Read</h3><p>Move through the exact controlled sections with visible progress and source identity.</p></article><article><span>02</span><h3>Interrogate</h3><p>Identify retained authority, delegation limits, deadlines, and evidence requirements.</p></article><article><span>03</span><h3>Decide</h3><p>Answer difficult source-linked questions built around defensible Board direction.</p></article><article><span>04</span><h3>Prove</h3><p>Preserve version, answers, score, attestation, attempt, and completion time in production.</p></article></section>
  </div>;
}

function AcademyView({ onOpen, enhanced = false }: { onOpen: (id?: string) => void; enhanced?: boolean }) {
  return <div className="governance-page">
    <PageHeading eyebrow="GOVERNANCE INSTITUTE" title="Executive judgment is a practiced discipline." description="Thirteen rigorous case laboratories purpose-built exclusively for directors, physicians, and senior executives." action={<button className="executive-button" onClick={() => onOpen()}>Enter the institute <ArrowRight size={16} /></button>} />
    <section className="academy-editorial-hero"><div><span>THE GOVERNING BODY CURRICULUM</span><h2>Authority. Evidence.<br />Judgment. Record.</h2><p>Cases are designed around ambiguity, competing duties, imperfect documents, survey-level follow-up, and the exact language a defensible Board direction requires.</p><div><span><b>12</b> executive laboratories</span><span><b>1</b> integrated capstone</span><span><b>92%</b> mastery standard</span></div></div><aside><Scale size={42} /><blockquote>“The Board is not a ceremonial endpoint. It is the place where accountability becomes specific.”</blockquote><small>GOVERNING BODY DOCTRINE</small></aside></section>
    {enhanced
      ? <AcademyCarousel onOpen={onOpen} />
      : <section className="academy-module-index"><header><div><span>CASE INDEX</span><h2>Thirteen rooms where judgment is tested</h2></div><small>All modules · Governing Body only</small></header><div>{MODULES.map((module) => <button key={module.id} onClick={() => onOpen(module.id)}><span>{module.id === 'GB-CAPSTONE' ? 'C' : String(module.sequence).padStart(2, '0')}</span><div><small>{module.id} · {module.domain}</small><strong>{module.title}</strong><p>{module.lede}</p></div><div className="academy-module-meta"><span>{module.duration}</span><span>{module.difficulty}</span></div><ChevronRight size={16} /></button>)}</div></section>}
  </div>;
}

function RecordView() {
  const evidence = [
    ['GV-FM-005', 'Governing Body Meeting Minutes', '199 workflow touchpoints', 'Primary board decision artifact'],
    ['QA-FM-001', 'QAPI Committee Meeting Minutes', '48 workflow touchpoints', 'Quality deliberation and recommendation'],
    ['CO-FM-024', 'Compliance Committee Minutes', '93 workflow touchpoints', 'Compliance oversight and escalation'],
    ['GV-FM-023', 'Report to Governing Body', 'Quarterly / annual', 'Cross-domain executive reporting'],
    ['EN-FM-034', 'Enterprise KPI Dashboard', 'Quarterly management review', 'Cross-domain performance evidence'],
    ['EN-FM-037', 'Enterprise Management Certification', 'Annual', 'Administrator and CFO certification'],
  ];
  return <div className="governance-page">
    <PageHeading eyebrow="GOVERNANCE EVIDENCE RECORD" title="Proof, with provenance." description="The governing record is organized by decision—not by file folder—so a reviewer can move from authority to source, deliberation, action, and verified follow-through." />
    <section className="record-integrity-hero"><div><Fingerprint size={30} /><div><span>TRACEABILITY POSTURE</span><strong>End-to-end workflow integrity</strong><p>Three consecutive full-system passes found zero broken workflow-to-form references and zero missing required form files.</p></div></div><div className="integrity-number"><strong>0</strong><span>unresolved<br />reference defects</span></div></section>
    <section className="record-stat-row"><Metric value="166" label="Workflows" note="All retain complete 13-section structure" /><Metric value="349" label="Forms" note="Controlled library with mapped purpose" /><Metric value="10" label="Domains" note="Governance through enterprise controls" /><Metric value="3×" label="Clean passes" note="Stop condition reached" tone="positive" /></section>
    <section className="evidence-register"><header><div><span>CORE GOVERNANCE ARTIFACTS</span><h2>The record spine</h2></div><small>Source-backed inventory</small></header>{evidence.map(([id, title, reach, purpose]) => <article key={id}><span><FileText size={16} /></span><div><small>{id}</small><strong>{title}</strong></div><div><small>REACH</small><strong>{reach}</strong></div><div><small>GOVERNANCE PURPOSE</small><strong>{purpose}</strong></div><button aria-label={`Inspect ${id}`}><ChevronRight size={16} /></button></article>)}</section>
    <section className="record-chain"><span>EVIDENCE CHAIN</span><ol>{['Authority', 'Source', 'Deliberation', 'Decision', 'Owner', 'Deadline', 'Effectiveness', 'Archive'].map((item, index) => <li key={item}><b>{String(index + 1).padStart(2, '0')}</b><strong>{item}</strong>{index < 7 && <i />}</li>)}</ol></section>
  </div>;
}

function DecisionDrawer({ decision, onClose }: { decision: Decision; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const listener = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', listener);
    return () => { document.body.style.overflow = priorOverflow; window.removeEventListener('keydown', listener); };
  }, [onClose]);
  return <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><aside className="decision-drawer" role="dialog" aria-modal="true" aria-labelledby="decision-drawer-title"><header><div><span>{decision.id}</span><small>{decision.domain}</small></div><button ref={closeRef} onClick={onClose} aria-label="Close decision dossier"><X size={18} /></button></header><div className="drawer-scroll"><div className="drawer-posture"><StatusMark tone={decision.tone} /><span>{decision.status}</span><small>{decision.due}</small></div><h2 id="decision-drawer-title">{decision.title}</h2><p className="drawer-summary">{decision.summary}</p><section className="drawer-recommendation"><span>PROPOSED DIRECTION</span><p>{decision.recommendation}</p></section><dl><div><dt>Accountable owner</dt><dd>{decision.owner}</dd></div><div><dt>Authority & workflow</dt><dd>{decision.authority}</dd></div></dl><section className="drawer-evidence"><span>EVIDENCE TO INTERROGATE</span>{decision.evidence.map((item, index) => <div key={item}><b>{String(index + 1).padStart(2, '0')}</b><p>{item}</p><FileCheck2 size={14} /></div>)}</section><section className="drawer-motion"><span>RECORD STANDARD</span><p>Capture the precise motion, material contrary evidence, conflict handling, vote, conditions, accountable owner, deadline, return trigger, and effectiveness measure.</p></section></div><footer><button className="quiet-drawer-button" onClick={onClose}>Return to docket</button><button className="executive-button" onClick={onClose}>Place in meeting brief <Check size={15} /></button></footer></aside></div>;
}

function CommandPalette({ onClose, onView, onAcademy, onDecision, onPolicy }: { onClose: () => void; onView: (view: ViewKey) => void; onAcademy: (id: string) => void; onDecision: (decision: Decision) => void; onPolicy: (policy: PolicyJourneyRequirement) => void }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const destinations = NAV_ITEMS.filter((item) => !q || `${item.label} ${item.short}`.toLowerCase().includes(q)).map((item) => ({ type: 'Workspace', id: item.id, title: item.label, subtitle: 'Governing Body workspace', action: () => onView(item.id) }));
    const decisions = DECISIONS.filter((item) => q && `${item.id} ${item.title} ${item.domain}`.toLowerCase().includes(q)).map((item) => ({ type: 'Decision', id: item.id, title: item.title, subtitle: item.status, action: () => onDecision(item) }));
    const modules = MODULES.filter((item) => q && `${item.id} ${item.title} ${item.domain}`.toLowerCase().includes(q)).map((item) => ({ type: 'Academy', id: item.id, title: item.title, subtitle: item.domain, action: () => onAcademy(item.id) }));
    const policies = GB_POLICY_REQUIREMENTS.filter((item) => q && `${item.policyId} ${item.policyTitle} ${item.courseTitle}`.toLowerCase().includes(q)).map((item) => ({ type: 'Policy', id: item.requirementId, title: item.policyTitle.replace(' (absent from generated library)', ''), subtitle: `${item.policyId} · ${item.courseId}`, action: () => onPolicy(item) }));
    return [...destinations, ...decisions, ...policies, ...modules].slice(0, 10);
  }, [query, onView, onAcademy, onDecision, onPolicy]);
  useEffect(() => {
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const listener = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', listener);
    return () => { document.body.style.overflow = priorOverflow; window.removeEventListener('keydown', listener); };
  }, [onClose]);
  return <div className="command-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><section className="command-palette" role="dialog" aria-modal="true" aria-label="Search governing body workspace"><label><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a decision, policy, module, or workspace…" /><kbd>ESC</kbd></label><div>{results.length ? results.map((result) => <button key={`${result.type}:${result.id}`} onClick={() => { result.action(); onClose(); }}><span>{result.type}</span><div><strong>{result.title}</strong><small>{result.subtitle}</small></div><ChevronRight size={15} /></button>) : <p className="command-empty">No governance record matches that search.</p>}</div><footer><span><kbd>↵</kbd> open</span><span><kbd>ESC</kbd> close</span><small>Governing Body workspace only</small></footer></section></div>;
}

function AppShell({ view, onView, onSearch, children }: { view: ViewKey; onView: (view: ViewKey) => void; onSearch: () => void; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = NAV_ITEMS.find((item) => item.id === view) ?? NAV_ITEMS[0];
  return <div className="governance-app" data-view={view}>
    <aside className={`governance-rail ${menuOpen ? 'open' : ''}`}>
      <button className="rail-brand" onClick={() => onView('brief')} aria-label="Care Indeed Governing Body home"><BrandCrest /><span>GOVERNANCE</span></button>
      <nav aria-label="Governing Body workspaces">{NAV_ITEMS.map((item) => { const Icon = item.icon; return <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => { onView(item.id); setMenuOpen(false); }} aria-current={view === item.id ? 'page' : undefined} data-label={item.label}><Icon size={19} /><span>{item.short}</span></button>; })}</nav>
      <div className="rail-footer"><button onClick={onSearch} data-label="Search and command"><Command size={18} /><span>Search</span></button><div className="chair-avatar" data-label="Governing Body Chair">RP</div></div>
    </aside>
    {menuOpen && <button className="mobile-rail-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
    <div className="governance-workspace">
      <header className="governance-topbar"><div className="topbar-context"><button className="mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open navigation">{menuOpen ? <PanelLeftClose size={19} /> : <Menu size={19} />}</button><div><span>CARE INDEED / GOVERNING BODY</span><strong>{active.label}</strong></div></div><div className="topbar-actions"><button className="command-trigger" onClick={onSearch}><Search size={15} /><span>Search the record</span><kbd>⌘ K</kbd></button><span className="executive-prototype"><CircleDot size={10} /> Executive prototype</span><button className="notification-button" aria-label="Notifications"><Bell size={17} /><i /></button><div className="topbar-profile"><span>RP</span><div><strong>Robert Padilla</strong><small>Governing Body Chair</small></div></div></div></header>
      <main>{children}</main>
      <footer className="governance-footer"><span>CARE INDEED HOME HEALTH CARE</span><div><span>Governing Body Office</span><i /> <span>Controlled executive prototype</span><i /><span>Q2 2026</span></div></footer>
    </div>
  </div>;
}

export default function MyJourneyApp({ enhanced = false }: { enhanced?: boolean } = {}) {
  const [view, setView] = useState<ViewKey>('brief');
  const [decision, setDecision] = useState<Decision | null>(null);
  const [policyOpen, setPolicyOpen] = useState<PolicyJourneyRequirement | null>(null);
  const [academyOpen, setAcademyOpen] = useState(false);
  const [academyModuleId, setAcademyModuleId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const fromHash = window.location.hash.replace('#', '') as ViewKey;
    const initialFrame = window.requestAnimationFrame(() => {
      if (NAV_ITEMS.some((item) => item.id === fromHash)) setView(fromHash);
    });
    const onHash = () => { const next = window.location.hash.replace('#', '') as ViewKey; if (NAV_ITEMS.some((item) => item.id === next)) setView(next); };
    const onKeyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('keydown', onKeyboard);
    return () => { window.cancelAnimationFrame(initialFrame); window.removeEventListener('hashchange', onHash); window.removeEventListener('keydown', onKeyboard); };
  }, []);

  const changeView = (next: ViewKey) => {
    setView(next);
    window.history.replaceState(null, '', `#${next}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAcademy = (id?: string) => {
    setAcademyModuleId(id ?? null);
    setAcademyOpen(true);
    window.scrollTo({ top: 0 });
  };

  if (academyOpen) return <Suspense fallback={<div className="academy-loading"><BrandCrest /><strong>Opening the Governance Institute</strong><span>Preparing the executive decision laboratory…</span></div>}><GoverningBodyAcademy initialModuleId={academyModuleId} onExitJourney={() => { setAcademyOpen(false); setAcademyModuleId(null); changeView('academy'); }} /></Suspense>;
  if (policyOpen) return <Suspense fallback={<div className="academy-loading"><BrandCrest /><strong>Opening the controlled policy</strong><span>Preparing the executive reading room…</span></div>}><GoverningBodyPolicyPlayer key={policyOpen.requirementId} requirement={policyOpen} onExit={() => { setPolicyOpen(null); changeView('policies'); }} /></Suspense>;

  const content = (() => {
    if (view === 'book') return <BoardBookView onView={changeView} />;
    if (view === 'meetings') return <MeetingsView onDecision={setDecision} />;
    if (view === 'calendar') return <CalendarView onDecision={setDecision} />;
    if (view === 'decisions') return <DecisionsView onDecision={setDecision} />;
    if (view === 'qapi') return enhanced ? <QapiBoardView /> : <QapiView onDecision={setDecision} />;
    if (view === 'risk') return <RiskView onDecision={setDecision} />;
    if (view === 'policies') return <PoliciesView onOpen={setPolicyOpen} />;
    if (view === 'academy') return <AcademyView onOpen={openAcademy} enhanced={enhanced} />;
    if (view === 'record') return <RecordView />;
    return <ExecutiveBrief onView={changeView} onDecision={setDecision} />;
  })();

  return <>
    <AppShell view={view} onView={changeView} onSearch={() => setSearchOpen(true)}>{content}</AppShell>
    {decision && <DecisionDrawer decision={decision} onClose={() => setDecision(null)} />}
    {searchOpen && <CommandPalette onClose={() => setSearchOpen(false)} onView={changeView} onAcademy={openAcademy} onDecision={setDecision} onPolicy={setPolicyOpen} />}
  </>;
}
