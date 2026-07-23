
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Command,
  FileCheck2,
  FileText,
  Fingerprint,
  Gavel,
  GraduationCap,
  Home,
  Landmark,
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
import QapiBoardView from './qapi/QapiBoardView';
import { getPolicyJourney } from './generated/policyJourney.generated';
import type { PolicyJourneyRequirement } from './generated/policyJourney.types';
import { useCompliance } from './compliance/useCompliance';
import type { ComplianceAssignmentView, UserFacingStatus } from './compliance/complianceTypes';
import type { CourseProgress } from './compliance/complianceSelectors';

const GoverningBodyAcademy = lazy(() => import('./gb-academy/Academy'));
const GoverningBodyPolicyPlayer = lazy(() => import('./policies/GoverningBodyPolicyPlayer'));
const CourseAssessmentPlayer = lazy(() => import('./assessments/CourseAssessmentPlayer'));
const TabletopPlayer = lazy(() => import('./tabletop/TabletopPlayer'));
const TrueFalseForensicPlayer = lazy(() => import('./assessments/TrueFalseForensicPlayer'));

type ViewKey = 'home' | 'compliance' | 'meetings' | 'decisions' | 'oversight' | 'records';
type MeetingsTab = 'overview' | 'book' | 'calendar';
type OversightTab = 'qapi' | 'risk';
type ComplianceTab = 'required' | 'training' | 'policies' | 'completed';

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

const NAV_ITEMS: Array<{ id: ViewKey; label: string; icon: typeof Landmark; hint: string }> = [
  { id: 'home', label: 'Home', icon: Home, hint: 'What must I do now' },
  { id: 'compliance', label: 'My Compliance', icon: GraduationCap, hint: 'Assigned training, policies & assessments' },
  { id: 'meetings', label: 'Meetings', icon: CalendarDays, hint: 'Prepare for the next convening' },
  { id: 'decisions', label: 'Decisions', icon: Gavel, hint: 'Judge matters with conditions' },
  { id: 'oversight', label: 'Oversight', icon: Activity, hint: 'QAPI, risk & policy governance' },
  { id: 'records', label: 'Records', icon: Fingerprint, hint: 'Proof with provenance' },
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
const REQUIREMENT_BY_ID = new Map(GB_POLICY_REQUIREMENTS.map((r) => [r.requirementId, r]));

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

function Breadcrumb({ trail }: { trail: string[] }) {
  return (
    <nav className="governance-breadcrumb" aria-label="Breadcrumb">
      <ol>
        {trail.map((crumb, index) => (
          <li key={crumb} aria-current={index === trail.length - 1 ? 'page' : undefined}>
            {index > 0 && <ChevronRight size={13} aria-hidden="true" />}
            <span>{crumb}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
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

// ---------------------------------------------------------------------------
// Compliance UI helpers
// ---------------------------------------------------------------------------

const STATUS_TONE: Record<UserFacingStatus, string> = {
  required_not_started: 'attention',
  in_progress: 'ready',
  due_soon: 'attention',
  overdue: 'critical',
  additional_validation_pending: 'hold',
  blocked: 'hold',
  remediation_required: 'critical',
  completed: 'positive',
};

const ASSIGNMENT_TYPE_LABEL = {
  training_module: 'Training Module',
  policy_reading: 'Policy Reading',
  course_assessment: 'Course Assessment',
  tabletop: 'Final Tabletop',
} as const;

function StatusPill({ view }: { view: ComplianceAssignmentView }) {
  return <span className={`compliance-status-pill ${STATUS_TONE[view.userFacingStatus]}`}>{view.statusLabel}</span>;
}

function actionLabel(view: ComplianceAssignmentView): string {
  switch (view.userFacingStatus) {
    case 'completed': return 'Review result';
    case 'in_progress': return 'Continue';
    case 'additional_validation_pending': return 'Resume';
    case 'remediation_required': return 'Start remediation';
    case 'blocked': return 'View reason';
    default: return 'Start';
  }
}

interface ComplianceHandlers {
  onOpenModule: (moduleId: string) => void;
  onOpenPolicy: (req: PolicyJourneyRequirement) => void;
  onOpenCourseAssessment: (courseId: string) => void;
  onOpenTabletop: () => void;
  onOpenForensic: (moduleId: string) => void;
}

function openAssignment(view: ComplianceAssignmentView, handlers: ComplianceHandlers) {
  const a = view.assignment;
  if (view.userFacingStatus === 'blocked') return;
  if (a.type === 'training_module') {
    if (view.userFacingStatus === 'remediation_required') handlers.onOpenForensic(a.sourceId);
    else handlers.onOpenModule(a.sourceId);
  }
  else if (a.type === 'policy_reading') {
    const req = REQUIREMENT_BY_ID.get(a.assignmentId.replace('gb:policy:', ''));
    if (req) handlers.onOpenPolicy(req);
  } else if (a.type === 'course_assessment') handlers.onOpenCourseAssessment(a.sourceId);
  else if (a.type === 'tabletop') handlers.onOpenTabletop();
}

function RequirementRow({ view, handlers }: { view: ComplianceAssignmentView; handlers: ComplianceHandlers }) {
  const a = view.assignment;
  const disabled = view.userFacingStatus === 'blocked';
  return (
    <article className={`compliance-req-row ${view.userFacingStatus}`}>
      <div className="compliance-req-lead">
        <StatusMark tone={STATUS_TONE[view.userFacingStatus]} />
        <div>
          <small>{ASSIGNMENT_TYPE_LABEL[a.type]} · {a.sourceId}</small>
          <strong>{a.title}</strong>
          <p className="compliance-req-why">Required for your Governing Body compliance{a.recurrence ? ` · ${a.recurrence}` : ''}</p>
          {disabled && a.blockerReason && <p className="compliance-req-blocker">{a.blockerReason}</p>}
        </div>
      </div>
      <div className="compliance-req-meta">
        <StatusPill view={view} />
        {a.passStandard !== null && <span className="compliance-pass-standard">Pass standard {a.passStandard}%</span>}
      </div>
      <button
        className="compliance-req-action"
        disabled={disabled}
        onClick={() => openAssignment(view, handlers)}
        aria-label={`${actionLabel(view)} — ${a.title}`}
      >
        {actionLabel(view)} <ChevronRight size={15} />
      </button>
    </article>
  );
}

function PreviewOnlyBanner({ notice }: { notice: string }) {
  return (
    <div className="compliance-preview-banner" role="status">
      <AlertTriangle size={17} aria-hidden="true" />
      <p>{notice} Nothing is marked complete and your compliance progress does not advance in this build.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HOME — task-first
// ---------------------------------------------------------------------------

function HomeView({ onGo, handlers }: { onGo: (view: ViewKey, sub?: string) => void; handlers: ComplianceHandlers }) {
  const compliance = useCompliance();
  const { summary, next, requiredNow, evidenceConnected, disconnectedNotice } = compliance;

  const tabletopLabel = summary.tabletop === 'passed' ? 'Passed'
    : summary.tabletop === 'available' ? 'Available'
    : summary.tabletop === 'remediation_required' ? 'Remediation required'
    : 'Locked';

  return (
    <div className="governance-page home-page">
      <Breadcrumb trail={['Governing Body', 'Home']} />
      <PageHeading
        eyebrow="GOVERNING BODY COMPLIANCE"
        title="Your Governing Body Compliance"
        description="Complete the training, controlled policy readings, assessments, and final exercise assigned to your Governing Body role. Your compliance is not complete until every required item is passed, attested, and recorded."
        action={next
          ? <button className="executive-button" onClick={() => openAssignment(next, handlers)}>Continue next requirement <ArrowRight size={16} /></button>
          : <button className="executive-button" onClick={() => onGo('compliance', 'completed')}>Review completed record <ArrowRight size={16} /></button>}
      />

      {!evidenceConnected && <PreviewOnlyBanner notice={disconnectedNotice} />}

      <section className="compliance-summary-row" aria-label="Compliance summary">
        <button className="compliance-summary-card" onClick={() => onGo('compliance', 'training')}>
          <span>Required training</span>
          <strong>{summary.training.completed}<small> / {summary.training.assigned}</small></strong>
          <small>Completed / assigned</small>
        </button>
        <button className="compliance-summary-card" onClick={() => onGo('compliance', 'policies')}>
          <span>Policies &amp; Procedures</span>
          <strong>{summary.policies.completed}<small> / {summary.policies.assigned}</small></strong>
          <small>Completed / assigned</small>
        </button>
        <button className="compliance-summary-card" onClick={() => onGo('compliance', 'required')}>
          <span>Final tabletop exercise</span>
          <strong className="compliance-word">{tabletopLabel}</strong>
          <small>Integrated capstone</small>
        </button>
        <div className={`compliance-summary-card overall ${summary.overall}`}>
          <span>Overall compliance</span>
          <strong className="compliance-word">{summary.overall === 'complete' ? 'Complete' : 'Incomplete'}</strong>
          <small>All items passed, attested &amp; recorded</small>
        </div>
      </section>

      <section className="compliance-required-now">
        <header>
          <div><span>REQUIRED NOW</span><h2>What must I do next?</h2></div>
          <button onClick={() => onGo('compliance', 'required')}>Open My Compliance <ArrowRight size={14} /></button>
        </header>
        <div className="compliance-req-list">
          {requiredNow.length
            ? requiredNow.map((view) => <RequirementRow key={view.assignment.assignmentId} view={view} handlers={handlers} />)
            : <p className="compliance-empty">Every assigned requirement is complete.</p>}
        </div>
      </section>

      <section className="home-board-context">
        <header><div><span>BOARD CONTEXT</span><h2>Where the Board’s judgment matters</h2></div><button onClick={() => onGo('decisions')}>View the docket <ArrowRight size={14} /></button></header>
        <div className="home-context-grid">
          <div className="decision-list">{DECISIONS.slice(0, 3).map((decision) => <button key={decision.id} onClick={() => onGo('decisions')}>
            <StatusMark tone={decision.tone} /><div><span>{decision.id} · {decision.domain}</span><strong>{decision.title}</strong><small>{decision.status} · {decision.due}</small></div><ChevronRight size={16} />
          </button>)}</div>
          <aside className="assurance-column">
            <article className="assurance-card dark">
              <div className="assurance-card-head"><span>ASSURANCE SIGNAL</span><BadgeCheck size={18} /></div>
              <strong>Evidence architecture is intact.</strong>
              <p>Every governance touchpoint resolves to a defined workflow, controlled form, approval record, and retention path.</p>
            </article>
            <button className="home-next-convening" onClick={() => onGo('meetings')}>
              <span>NEXT CONVENING · QUARTERLY</span>
              <strong>Q2 Governing Body Review</strong>
              <small>Enter the meeting workspace <ChevronRight size={14} /></small>
            </button>
          </aside>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MY COMPLIANCE — unified workspace
// ---------------------------------------------------------------------------

function MyComplianceView({ tab, onTab, handlers }: { tab: ComplianceTab; onTab: (t: ComplianceTab) => void; handlers: ComplianceHandlers }) {
  const compliance = useCompliance();
  const { views, viewById, courses, requiredNow, evidenceConnected, disconnectedNotice } = compliance;

  const trainingViews = views.filter((v) => v.assignment.type === 'training_module');
  const tabletopView = views.find((v) => v.assignment.type === 'tabletop');
  const completedViews = views.filter((v) => v.officiallyComplete);

  const TABS: Array<{ id: ComplianceTab; label: string; count?: number }> = [
    { id: 'required', label: 'Required Now', count: requiredNow.length },
    { id: 'training', label: 'Training Modules', count: trainingViews.length },
    { id: 'policies', label: 'Policies & Procedures', count: courses.length },
    { id: 'completed', label: 'Completed', count: completedViews.length },
  ];

  return (
    <div className="governance-page compliance-page">
      <Breadcrumb trail={['Governing Body', 'My Compliance', TABS.find((t) => t.id === tab)?.label ?? '']} />
      <PageHeading
        eyebrow="MY COMPLIANCE"
        title="Everything you are required to complete"
        description="Your assigned training modules, controlled policy readings, course assessments, and the final tabletop — in one workspace. This requirement is not complete until the assessment is passed and the evidence record is saved."
      />
      {!evidenceConnected && <PreviewOnlyBanner notice={disconnectedNotice} />}

      <nav className="compliance-tabs" aria-label="My Compliance sections">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => onTab(t.id)} aria-current={tab === t.id ? 'true' : undefined}>
            {t.label}{typeof t.count === 'number' && <span>{t.count}</span>}
          </button>
        ))}
      </nav>

      {tab === 'required' && (
        <section className="compliance-req-list">
          {requiredNow.length
            ? requiredNow.map((v) => <RequirementRow key={v.assignment.assignmentId} view={v} handlers={handlers} />)
            : <p className="compliance-empty">Nothing outstanding. Every assigned requirement is complete.</p>}
          {tabletopView && <RequirementRow view={tabletopView} handlers={handlers} />}
        </section>
      )}

      {tab === 'training' && (
        <section className="compliance-req-list">
          {trainingViews.map((v) => <RequirementRow key={v.assignment.assignmentId} view={v} handlers={handlers} />)}
        </section>
      )}

      {tab === 'policies' && (
        <section className="compliance-course-list">
          {courses.map((course) => (
            <CourseAccordion key={course.courseId} course={course} viewById={viewById} handlers={handlers} />
          ))}
        </section>
      )}

      {tab === 'completed' && (
        <section className="compliance-req-list">
          {completedViews.length
            ? completedViews.map((v) => <RequirementRow key={v.assignment.assignmentId} view={v} handlers={handlers} />)
            : <p className="compliance-empty">No completed records yet. Completion records your identity, assignment, controlled source version, score, attempt, attestation, and completion time.</p>}
        </section>
      )}
    </div>
  );
}

function CourseAccordion({ course, viewById, handlers }: { course: CourseProgress; viewById: Map<string, ComplianceAssignmentView>; handlers: ComplianceHandlers }) {
  const [open, setOpen] = useState(false);
  const group = useMemo(() => {
    // Reconstruct the ordered policy views for this course from the id map.
    return Array.from(viewById.values()).filter((v) => v.assignment.type === 'policy_reading' && REQUIREMENT_BY_ID.get(v.assignment.assignmentId.replace('gb:policy:', ''))?.courseId === course.courseId);
  }, [viewById, course.courseId]);
  const assessmentView = Array.from(viewById.values()).find((v) => v.assignment.type === 'course_assessment' && v.assignment.sourceId === course.courseId);

  return (
    <article className={`compliance-course ${open ? 'open' : ''}`}>
      <button className="compliance-course-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div>
          <small>{course.courseId}</small>
          <strong>{course.courseTitle}</strong>
          <p>{group.length} assigned {group.length === 1 ? 'policy' : 'policies'} · {course.policiesComplete}/{course.policiesTotal} read &amp; attested · assessment {course.assessmentComplete ? 'passed' : course.assessmentUnlocked ? 'available' : 'locked'}</p>
        </div>
        <div className="compliance-course-progress">
          <span>{course.policiesTotal ? Math.round((course.policiesComplete / course.policiesTotal) * 100) : 0}%</span>
          <ChevronDown size={17} />
        </div>
      </button>
      {open && (
        <div className="compliance-course-body">
          {group.map((v) => <RequirementRow key={v.assignment.assignmentId} view={v} handlers={handlers} />)}
          {assessmentView && (
            <div className="compliance-course-assessment">
              <div className="compliance-course-assessment-head">
                <ClipboardCheck size={16} />
                <div>
                  <strong>Course assessment</strong>
                  <small>{course.assessmentUnlocked ? 'Unlocked — all required policies read & attested.' : 'Unlocks after every required policy in this course is read and attested.'}</small>
                </div>
              </div>
              <button
                className="compliance-req-action"
                disabled={!course.assessmentUnlocked}
                onClick={() => handlers.onOpenCourseAssessment(course.courseId)}
              >
                {course.assessmentComplete ? 'Review result' : 'Start assessment'} <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// MEETINGS (Overview / Board book / Calendar)
// ---------------------------------------------------------------------------

function MeetingsView({ tab, onTab, onDecision }: { tab: MeetingsTab; onTab: (t: MeetingsTab) => void; onDecision: (decision: Decision) => void }) {
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
  const [bookOpen, setBookOpen] = useState('04');
  const [quarter, setQuarter] = useState<'ALL' | GovernanceCalendarItem['quarter']>('ALL');
  const visibleEvents = CES_GOVERNANCE_CALENDAR.filter((item) => quarter === 'ALL' || item.quarter === quarter);
  const TABS: Array<{ id: MeetingsTab; label: string }> = [
    { id: 'overview', label: 'Meeting workspace' },
    { id: 'book', label: 'Board book' },
    { id: 'calendar', label: 'Governance calendar' },
  ];
  return <div className="governance-page">
    <Breadcrumb trail={['Governing Body', 'Meetings', TABS.find((t) => t.id === tab)?.label ?? '']} />
    <PageHeading eyebrow="MEETINGS · GV-WF-01" title="Prepare for the next convening." description="The meeting workspace, the controlled board book, and the full governance calendar — organized around valid authority, useful deliberation, exact decisions, and a defensible record." action={<div className="meeting-state"><CircleDot size={14} /><span>Q2 workspace assembled</span></div>} />
    <nav className="compliance-tabs" aria-label="Meetings sections">
      {TABS.map((t) => <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => onTab(t.id)} aria-current={tab === t.id ? 'true' : undefined}>{t.label}</button>)}
    </nav>

    {tab === 'overview' && <>
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
    </>}

    {tab === 'book' && <section className="board-book-layout">
      <article className="board-book-cover">
        <div className="cover-rule"><span>CARE INDEED</span><i>CONTROLLED</i></div>
        <div className="cover-title"><small>GOVERNING BODY</small><strong>Quarterly<br />Board Book</strong><p>Quality · Risk · Compliance · Finance · Policy</p></div>
        <div className="cover-quarter"><span>Q2</span><div><strong>2026</strong><small>APR 01 — JUN 30</small></div></div>
        <footer><span>GV-WF-01</span><span>CONFIDENTIAL GOVERNANCE RECORD</span></footer>
      </article>
      <div className="board-book-index">
        <header><div><span>CONTENTS</span><h2>Eight sections. One defensible chain.</h2></div><div className="book-status"><CheckCircle2 size={16} /><span>6 of 8 review-ready</span></div></header>
        <div>{BOOK_SECTIONS.map((section) => <article key={section.code} className={bookOpen === section.code ? 'open' : ''}>
          <button onClick={() => setBookOpen(bookOpen === section.code ? '' : section.code)}><span>{section.code}</span><div><strong>{section.title}</strong><small>{section.pages} · {section.status}</small></div><ChevronDown size={16} /></button>
          {bookOpen === section.code && <div className="book-section-detail"><p>{section.detail}</p><div><span><FileCheck2 size={13} /> Source-indexed</span><span><LockKeyhole size={13} /> Controlled record</span></div></div>}
        </article>)}</div>
      </div>
    </section>}

    {tab === 'calendar' && <>
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
      <section className="governance-action-register">
        <header><div><span>COMPLETE GOVERNANCE ACTION REGISTER</span><h2>Every Governing Body workflow on one control surface</h2></div><small>Recurring + event-driven · source-backed</small></header>
        <div className="action-register-head"><span>WORKFLOW</span><span>BOARD ACTION</span><span>TRIGGER</span><span>CONTROL CLOCK</span><span>REQUIRED EVIDENCE</span></div>
        {GOVERNANCE_ACTION_REGISTER.map(([id, title, trigger, clock, evidence]) => <article key={id}><span>{id}</span><strong>{title}</strong><p>{trigger}</p><p>{clock}</p><small>{evidence}</small></article>)}
      </section>
    </>}
  </div>;
}

// ---------------------------------------------------------------------------
// DECISIONS
// ---------------------------------------------------------------------------

function DecisionsView({ onDecision }: { onDecision: (decision: Decision) => void }) {
  const [filter, setFilter] = useState<'all' | Decision['status']>('all');
  const filtered = DECISIONS.filter((decision) => filter === 'all' || decision.status === filter);
  return <div className="governance-page">
    <Breadcrumb trail={['Governing Body', 'Decisions']} />
    <PageHeading eyebrow="DECISIONS" title="Judgment, with conditions attached." description="Each matter joins the recommendation, contrary evidence, authority, conflict posture, motion language, owner, deadline, and effectiveness test." />
    <nav className="decision-filters" aria-label="Decision filters">{(['all', 'Judgment required', 'Ready for consent', 'Evidence hold', 'Executive session'] as const).map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item === 'all' ? 'All matters' : item}<span>{item === 'all' ? DECISIONS.length : DECISIONS.filter((decision) => decision.status === item).length}</span></button>)}</nav>
    <section className="decision-table"><header><span>MATTER</span><span>POSTURE</span><span>ACCOUNTABLE OWNER</span><span>AUTHORITY</span><span /></header>{filtered.map((decision) => <button key={decision.id} onClick={() => onDecision(decision)}><div className="decision-identity"><StatusMark tone={decision.tone} /><div><small>{decision.id} · {decision.domain}</small><strong>{decision.title}</strong><p>{decision.summary}</p></div></div><span className={`decision-posture ${decision.tone}`}>{decision.status}</span><span>{decision.owner}</span><span>{decision.authority}</span><ChevronRight size={17} /></button>)}</section>
    <section className="decision-principle"><Scale size={22} /><div><span>GOVERNANCE STANDARD</span><strong>The narrowest complete decision wins.</strong><p>Do not approve more than the evidence supports. Do not withhold more than the risk requires. State the condition, owner, deadline, return trigger, and proof of effectiveness.</p></div></section>
  </div>;
}

// ---------------------------------------------------------------------------
// OVERSIGHT (QAPI / Risk)
// ---------------------------------------------------------------------------

function OversightView({ tab, onTab, onDecision, enhanced }: { tab: OversightTab; onTab: (t: OversightTab) => void; onDecision: (decision: Decision) => void; enhanced: boolean }) {
  const TABS: Array<{ id: OversightTab; label: string }> = [
    { id: 'qapi', label: 'QAPI oversight' },
    { id: 'risk', label: 'Risk & assurance' },
  ];
  return <div className="governance-page">
    <Breadcrumb trail={['Governing Body', 'Oversight', TABS.find((t) => t.id === tab)?.label ?? '']} />
    <PageHeading eyebrow="OVERSIGHT · 42 CFR 484.65" title="Govern the signal, not the color." description="Board oversight of quality (QAPI), enterprise risk, and policy governance. This is the live oversight record — distinct from your assigned compliance work in My Compliance." action={<button className="executive-button" onClick={() => onDecision(DECISIONS[0])}>Open judgment brief <ArrowRight size={16} /></button>} />
    <nav className="compliance-tabs" aria-label="Oversight sections">
      {TABS.map((t) => <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => onTab(t.id)} aria-current={tab === t.id ? 'true' : undefined}>{t.label}</button>)}
    </nav>

    {tab === 'qapi' && (enhanced ? <QapiBoardView /> : <>
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
    </>)}

    {tab === 'risk' && <>
      <section className="risk-overview"><article><span>RISK POSTURE</span><strong>Focused attention</strong><p>One quality signal requires Board direction; no workflow-to-evidence integrity break is open.</p></article><Metric value="1" label="Critical" note="Immediate governance direction" tone="attention" /><Metric value="2" label="Elevated" note="Active correction or approval hold" /><Metric value="2" label="Controlled" note="Monitored within tolerance" tone="positive" /></section>
      <section className="risk-register"><header><span>PRIORITY</span><span>EXPOSURE</span><span>TREND</span><span>CONTROL & OWNER</span><span>POSTURE</span></header>{RISKS.map((risk) => <article key={risk.rank}><span>{risk.rank}</span><div><small>{risk.domain}</small><strong>{risk.title}</strong></div><span className={`risk-trend ${risk.trend}`}>{risk.trend === 'up' ? <TrendingUp size={15} /> : risk.trend === 'down' ? <TrendingDown size={15} /> : <ArrowRight size={15} />}{risk.trend === 'up' ? 'Rising' : risk.trend === 'down' ? 'Improving' : 'Stable'}</span><div><strong>{risk.control}</strong><small>{risk.owner}</small></div><i className={risk.tone}>{risk.posture}</i></article>)}</section>
      <section className="risk-bottom-grid"><article className="risk-map"><span>DEPENDENCY MAP</span><h2>One decision touches four systems.</h2><div><button onClick={() => onDecision(DECISIONS[0])}><Activity size={17} /><strong>QAPI signal</strong><small>Subgroup + complaints</small></button><i /><button><UsersRound size={17} /><strong>Clinical control</strong><small>After-hours escalation</small></button><i /><button><Scale size={17} /><strong>Resources</strong><small>Analyst + coaching hours</small></button><i /><button><FileCheck2 size={17} /><strong>Official record</strong><small>Criteria + minutes</small></button></div></article><article className="assurance-opinion"><span>ASSURANCE OPINION</span><h3>Reasonable assurance—conditional.</h3><p>The governance architecture is complete and traceable. Assurance remains conditional until the quality judgment, vendor control gaps, and committee-to-board record variance close with evidence.</p><footer><BadgeCheck size={17} /><span>Evidence architecture reviewed across 166 workflows</span></footer></article></section>
    </>}
  </div>;
}

// ---------------------------------------------------------------------------
// RECORDS
// ---------------------------------------------------------------------------

function RecordsView() {
  const evidence = [
    ['GV-FM-005', 'Governing Body Meeting Minutes', '199 workflow touchpoints', 'Primary board decision artifact'],
    ['QA-FM-001', 'QAPI Committee Meeting Minutes', '48 workflow touchpoints', 'Quality deliberation and recommendation'],
    ['CO-FM-024', 'Compliance Committee Minutes', '93 workflow touchpoints', 'Compliance oversight and escalation'],
    ['GV-FM-023', 'Report to Governing Body', 'Quarterly / annual', 'Cross-domain executive reporting'],
    ['EN-FM-034', 'Enterprise KPI Dashboard', 'Quarterly management review', 'Cross-domain performance evidence'],
    ['EN-FM-037', 'Enterprise Management Certification', 'Annual', 'Administrator and CFO certification'],
  ];
  return <div className="governance-page">
    <Breadcrumb trail={['Governing Body', 'Records']} />
    <PageHeading eyebrow="GOVERNANCE EVIDENCE RECORD" title="Proof, with provenance." description="The governing record is organized by decision—not by file folder—so a reviewer can move from authority to source, deliberation, action, and verified follow-through." />
    <section className="record-integrity-hero"><div><Fingerprint size={30} /><div><span>TRACEABILITY POSTURE</span><strong>End-to-end workflow integrity</strong><p>Three consecutive full-system passes found zero broken workflow-to-form references and zero missing required form files.</p></div></div><div className="integrity-number"><strong>0</strong><span>unresolved<br />reference defects</span></div></section>
    <section className="record-stat-row"><Metric value="166" label="Workflows" note="All retain complete 13-section structure" /><Metric value="349" label="Forms" note="Controlled library with mapped purpose" /><Metric value="10" label="Domains" note="Governance through enterprise controls" /><Metric value="3×" label="Clean passes" note="Stop condition reached" tone="positive" /></section>
    <section className="evidence-register"><header><div><span>CORE GOVERNANCE ARTIFACTS</span><h2>The record spine</h2></div><small>Source-backed inventory</small></header>{evidence.map(([id, title, reach, purpose]) => <article key={id}><span><FileText size={16} /></span><div><small>{id}</small><strong>{title}</strong></div><div><small>REACH</small><strong>{reach}</strong></div><div><small>GOVERNANCE PURPOSE</small><strong>{purpose}</strong></div><button aria-label={`Inspect ${id}`}><ChevronRight size={16} /></button></article>)}</section>
    <section className="record-chain"><span>EVIDENCE CHAIN</span><ol>{['Authority', 'Source', 'Deliberation', 'Decision', 'Owner', 'Deadline', 'Effectiveness', 'Archive'].map((item, index) => <li key={item}><b>{String(index + 1).padStart(2, '0')}</b><strong>{item}</strong>{index < 7 && <i />}</li>)}</ol></section>
  </div>;
}

// ---------------------------------------------------------------------------
// Drawer + command palette
// ---------------------------------------------------------------------------

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

function CommandPalette({ onClose, onView, onDecision, onPolicy, onModule }: { onClose: () => void; onView: (view: ViewKey, sub?: string) => void; onDecision: (decision: Decision) => void; onPolicy: (policy: PolicyJourneyRequirement) => void; onModule: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const destinations = NAV_ITEMS.filter((item) => !q || `${item.label} ${item.hint}`.toLowerCase().includes(q)).map((item) => ({ type: 'Workspace', id: item.id, title: item.label, subtitle: item.hint, action: () => onView(item.id) }));
    const decisions = DECISIONS.filter((item) => q && `${item.id} ${item.title} ${item.domain}`.toLowerCase().includes(q)).map((item) => ({ type: 'Decision', id: item.id, title: item.title, subtitle: item.status, action: () => onDecision(item) }));
    const modules = MODULES.filter((item) => q && `${item.id} ${item.title} ${item.domain}`.toLowerCase().includes(q)).map((item) => ({ type: 'Training', id: item.id, title: item.title, subtitle: item.domain, action: () => onModule(item.id) }));
    const policies = GB_POLICY_REQUIREMENTS.filter((item) => q && `${item.policyId} ${item.policyTitle} ${item.courseTitle}`.toLowerCase().includes(q)).map((item) => ({ type: 'Policy', id: item.requirementId, title: item.policyTitle.replace(' (absent from generated library)', ''), subtitle: `${item.policyId} · ${item.courseId}`, action: () => onPolicy(item) }));
    return [...destinations, ...decisions, ...policies, ...modules].slice(0, 10);
  }, [query, onView, onDecision, onPolicy, onModule]);
  useEffect(() => {
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const listener = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', listener);
    return () => { document.body.style.overflow = priorOverflow; window.removeEventListener('keydown', listener); };
  }, [onClose]);
  return <div className="command-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><section className="command-palette" role="dialog" aria-modal="true" aria-label="Search governing body workspace"><label><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a decision, policy, module, or workspace…" /><kbd>ESC</kbd></label><div>{results.length ? results.map((result) => <button key={`${result.type}:${result.id}`} onClick={() => { result.action(); onClose(); }}><span>{result.type}</span><div><strong>{result.title}</strong><small>{result.subtitle}</small></div><ChevronRight size={15} /></button>) : <p className="command-empty">No governance record matches that search.</p>}</div><footer><span><kbd>↵</kbd> open</span><span><kbd>ESC</kbd> close</span><small>Governing Body workspace only</small></footer></section></div>;
}

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

function AppShell({ view, onView, onSearch, children }: { view: ViewKey; onView: (view: ViewKey) => void; onSearch: () => void; children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = NAV_ITEMS.find((item) => item.id === view) ?? NAV_ITEMS[0];
  return <div className="governance-app" data-view={view}>
    <aside className={`governance-rail ${menuOpen ? 'open' : ''}`}>
      <button className="rail-brand" onClick={() => onView('home')} aria-label="Care Indeed Governing Body home"><BrandCrest /><span>GOVERNANCE</span></button>
      <nav aria-label="Governing Body sections">{NAV_ITEMS.map((item) => { const Icon = item.icon; return <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => { onView(item.id); setMenuOpen(false); }} aria-current={view === item.id ? 'page' : undefined}><Icon size={19} aria-hidden="true" /><span className="rail-label">{item.label}</span></button>; })}</nav>
      <div className="rail-footer"><button onClick={onSearch}><Command size={18} aria-hidden="true" /><span className="rail-label">Search</span></button><div className="chair-avatar" aria-label="Governing Body Chair">RP</div></div>
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
  const [view, setView] = useState<ViewKey>('home');
  const [meetingsTab, setMeetingsTab] = useState<MeetingsTab>('overview');
  const [oversightTab, setOversightTab] = useState<OversightTab>('qapi');
  const [complianceTab, setComplianceTab] = useState<ComplianceTab>('required');
  const [decision, setDecision] = useState<Decision | null>(null);
  const [policyOpen, setPolicyOpen] = useState<PolicyJourneyRequirement | null>(null);
  const [academyModuleId, setAcademyModuleId] = useState<string | null>(null);
  const [academyOpen, setAcademyOpen] = useState(false);
  const [courseAssessmentId, setCourseAssessmentId] = useState<string | null>(null);
  const [tabletopOpen, setTabletopOpen] = useState(false);
  const [forensicModuleId, setForensicModuleId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const go = (next: ViewKey, sub?: string) => {
    setView(next);
    if (next === 'meetings' && sub) setMeetingsTab(sub as MeetingsTab);
    if (next === 'oversight' && sub) setOversightTab(sub as OversightTab);
    if (next === 'compliance' && sub) setComplianceTab(sub as ComplianceTab);
    window.history.replaceState(null, '', `#${next}${sub ? `/${sub}` : ''}`);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const applyHash = () => {
      const [rawView] = window.location.hash.replace('#', '').split('/');
      if (NAV_ITEMS.some((item) => item.id === rawView)) setView(rawView as ViewKey);
    };
    const frame = window.requestAnimationFrame(applyHash);
    const onKeyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('hashchange', applyHash);
    window.addEventListener('keydown', onKeyboard);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener('hashchange', applyHash); window.removeEventListener('keydown', onKeyboard); };
  }, []);

  const openModule = (id: string) => { setAcademyModuleId(id); setAcademyOpen(true); window.scrollTo({ top: 0 }); };
  const handlers: ComplianceHandlers = {
    onOpenModule: openModule,
    onOpenPolicy: setPolicyOpen,
    onOpenCourseAssessment: (courseId) => { setCourseAssessmentId(courseId); window.scrollTo({ top: 0 }); },
    onOpenTabletop: () => { setTabletopOpen(true); window.scrollTo({ top: 0 }); },
    onOpenForensic: (moduleId) => { setForensicModuleId(moduleId); window.scrollTo({ top: 0 }); },
  };

  if (academyOpen) return <Suspense fallback={<div className="academy-loading"><BrandCrest /><strong>Opening the Governance Institute</strong><span>Preparing the executive decision laboratory…</span></div>}><GoverningBodyAcademy initialModuleId={academyModuleId} onExitJourney={() => { setAcademyOpen(false); setAcademyModuleId(null); go('compliance', 'training'); }} /></Suspense>;
  if (policyOpen) return <Suspense fallback={<div className="academy-loading"><BrandCrest /><strong>Opening the controlled policy</strong><span>Preparing the executive reading room…</span></div>}><GoverningBodyPolicyPlayer key={policyOpen.requirementId} requirement={policyOpen} onExit={() => { setPolicyOpen(null); go('compliance', 'policies'); }} /></Suspense>;
  if (courseAssessmentId) return <Suspense fallback={<div className="academy-loading"><BrandCrest /><strong>Opening the course assessment</strong><span>Preparing the controlled assessment…</span></div>}><CourseAssessmentPlayer key={courseAssessmentId} courseId={courseAssessmentId} onExit={() => { setCourseAssessmentId(null); go('compliance', 'policies'); }} /></Suspense>;
  if (tabletopOpen) return <Suspense fallback={<div className="academy-loading"><BrandCrest /><strong>Opening the final tabletop</strong><span>Assembling the integrated governance case…</span></div>}><TabletopPlayer onExit={() => { setTabletopOpen(false); go('compliance', 'required'); }} onForensicCapstone={() => { setTabletopOpen(false); setForensicModuleId('GB-001'); }} /></Suspense>;
  if (forensicModuleId) return <Suspense fallback={<div className="academy-loading"><BrandCrest /><strong>Opening forensic remediation</strong><span>Preparing the controlled True/False form…</span></div>}><TrueFalseForensicPlayer moduleId={forensicModuleId} onExit={() => { setForensicModuleId(null); go('compliance', 'required'); }} /></Suspense>;

  const content = (() => {
    if (view === 'compliance') return <MyComplianceView tab={complianceTab} onTab={setComplianceTab} handlers={handlers} />;
    if (view === 'meetings') return <MeetingsView tab={meetingsTab} onTab={setMeetingsTab} onDecision={setDecision} />;
    if (view === 'decisions') return <DecisionsView onDecision={setDecision} />;
    if (view === 'oversight') return <OversightView tab={oversightTab} onTab={setOversightTab} onDecision={setDecision} enhanced={enhanced} />;
    if (view === 'records') return <RecordsView />;
    return <HomeView onGo={go} handlers={handlers} />;
  })();

  return <>
    <AppShell view={view} onView={(v) => go(v)} onSearch={() => setSearchOpen(true)}>{content}</AppShell>
    {decision && <DecisionDrawer decision={decision} onClose={() => setDecision(null)} />}
    {searchOpen && <CommandPalette onClose={() => setSearchOpen(false)} onView={go} onDecision={setDecision} onPolicy={setPolicyOpen} onModule={openModule} />}
  </>;
}
