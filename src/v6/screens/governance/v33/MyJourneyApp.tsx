
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  ExternalLink,
  FileCheck2,
  FileText,
  Fingerprint,
  Gavel,
  GraduationCap,
  Home,
  Landmark,
  Menu,
  PanelLeftClose,
  Scale,
  Search,
  UsersRound,
  X,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { MODULES } from './gb-academy/academyData';
import { getPolicyJourney } from './generated/policyJourney.generated';
import type { PolicyJourneyRequirement } from './generated/policyJourney.types';
import { useCompliance } from './compliance/useCompliance';
import type { ComplianceAssignmentView, UserFacingStatus } from './compliance/complianceTypes';
import type { CourseProgress } from './compliance/complianceSelectors';
import {
  ANNUAL_ATTESTATIONS,
  BRAD_NOLAN_CURRENT_STATE,
  EVIDENCE_PACKAGES,
  POLICY_APPROVAL_DOCKET,
  READINESS_DECISIONS,
  SOURCE_DERIVED_QAPI_DECISIONS,
  WORKFLOW_INSTANCES,
  WORKFLOW_LIBRARY_SUMMARY,
  type EvidencePackage,
  type ReadinessDecision,
  type WorkflowInstance,
} from './executiveReadinessData';
import {
  OVERSIGHT_PROVENANCE_LEGEND,
  OVERSIGHT_QUARTERS,
  type OversightProvenance,
  type OversightValue,
} from './oversightProjection';
import {
  AGENDA_QUEUE_DISCLAIMER,
  addAgendaItem,
  removeAgendaItem,
  useAgendaQueue,
} from './agendaQueue';
import {
  getGbReferenceDoc,
  journeyHandbookPlayerUrl,
  protectedReferenceUrl,
  JOURNEY_HANDBOOK_UNCONFIGURED_REASON,
  type GbReferenceDocId,
} from './references/referenceDocs';
import { useGovernanceRouter } from './navigation/useGovernanceRouter';
import { useTabletopLaunchGate } from './tabletop2026/useTabletopLaunchGate';
import { parseGovernanceRoute } from './navigation/governanceRoute';
import { useLearnerId } from './compliance/complianceIdentity';
import type { ComplianceAssignmentType } from './compliance/complianceTypes';
import { formatPassStandardLabel, scaleForAssignmentType } from './compliance/passStandardFormat';
import {
  createAdHocMeeting,
  listDriveFolder,
  postureLabel,
  probeCalendarHealth,
  probeDriveHealth,
  type CalendarHealth,
  type DriveFileRef,
  type DriveFolderRef,
  type DriveHealth,
} from './integrations/calendarDriveClient';

const GoverningBodyAcademy = lazy(() => import('./gb-academy/Academy'));
const GoverningBodyPolicyPlayer = lazy(() => import('./policies/GoverningBodyPolicyPlayer'));
const CourseAssessmentPlayer = lazy(() => import('./assessments/CourseAssessmentPlayer'));
const TabletopHub = lazy(() => import('./tabletop2026/TabletopHub'));
const TabletopSession = lazy(() => import('./tabletop2026/TabletopSession'));
const FacilitatedGroupSession = lazy(() => import('./tabletop2026/FacilitatedGroupSession'));
const AnnualGovernanceForms = lazy(() => import('./forms/AnnualGovernanceForms'));
const TrueFalseForensicPlayer = lazy(() => import('./assessments/TrueFalseForensicPlayer'));

type ViewKey = 'home' | 'compliance' | 'meetings' | 'decisions' | 'workflows' | 'oversight' | 'evidence';
/** Default tab per view — mirrors navigation/governanceRoute.ts. */
const DEFAULT_SUBVIEW: Record<ViewKey, string | undefined> = {
  home: undefined,
  compliance: 'required',
  meetings: 'lifecycle',
  decisions: undefined,
  workflows: 'due',
  oversight: 'qapi',
  evidence: undefined,
};
type MeetingsTab = 'lifecycle' | 'agenda' | 'schedule';
type OversightTab = 'qapi' | 'domains' | 'data';
type ComplianceTab = 'required' | 'training' | 'policies' | 'tabletop' | 'annual' | 'completed';
type WorkflowTab = WorkflowInstance['tab'];
type Decision = ReadinessDecision;

const NAV_ITEMS: Array<{ id: ViewKey; label: string; icon: typeof Landmark; hint: string; group: string }> = [
  { id: 'home', label: 'Home', icon: Home, hint: 'Current agency status and next actions', group: 'EXECUTIVE WORK' },
  { id: 'meetings', label: 'Meetings', icon: CalendarDays, hint: 'Lifecycle, agenda, scheduling, and close', group: 'EXECUTIVE WORK' },
  { id: 'decisions', label: 'Decisions', icon: Gavel, hint: 'Required readiness decision docket', group: 'EXECUTIVE WORK' },
  { id: 'compliance', label: 'My Compliance', icon: GraduationCap, hint: 'Training, policies, quizzes, tabletop, attestations', group: 'READINESS & OVERSIGHT' },
  { id: 'workflows', label: 'Workflows', icon: ClipboardCheck, hint: 'Due work, blockers, event triggers, and library', group: 'READINESS & OVERSIGHT' },
  { id: 'oversight', label: 'Oversight', icon: Activity, hint: '2026 synthetic QAPI preview and readiness signals', group: 'READINESS & OVERSIGHT' },
  { id: 'evidence', label: 'Evidence / CES', icon: Fingerprint, hint: 'Scoped CES packages and evidence chains', group: 'EVIDENCE' },
];

const DECISIONS: Decision[] = READINESS_DECISIONS;
const ALL_DECISIONS: Decision[] = [...READINESS_DECISIONS, ...SOURCE_DERIVED_QAPI_DECISIONS];

const GB_POLICY_REQUIREMENTS = getPolicyJourney('GB').requirements;
const REQUIREMENT_BY_ID = new Map(GB_POLICY_REQUIREMENTS.map((r) => [r.requirementId, r]));

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

// ---------------------------------------------------------------------------
// Executive action + provenance primitives (blockers 3 and 5)
// ---------------------------------------------------------------------------

/**
 * Blocker 3 rule: every enabled control must perform a real action or navigate
 * to a real destination; otherwise it renders visibly disabled with a precise
 * reason (visible caption, not tooltip-only).
 */
function ExecutiveAction({ label, onAct, disabledReason, confirmation }: { label: string; onAct?: () => void; disabledReason?: string; confirmation?: string }) {
  if (disabledReason) {
    return (
      <span className="executive-action disabled-with-reason">
        <button type="button" disabled title={disabledReason}>{label}</button>
        <small className="action-disabled-reason">{disabledReason}</small>
      </span>
    );
  }
  return (
    <span className="executive-action">
      <button type="button" onClick={onAct}>{label}</button>
      {confirmation && <small className="action-confirmation" role="status"><Check size={12} aria-hidden="true" /> {confirmation}</small>}
    </span>
  );
}

const PROVENANCE_TONE: Record<OversightProvenance, string> = {
  'Source recovered': 'recovered',
  'Calculated from recovered source': 'calculated',
  'Supplemental synthetic UAT': 'synthetic',
  'Management-reported and unresolved': 'unresolved',
  'Not recovered': 'not-recovered',
};

function ProvBadge({ provenance }: { provenance: OversightProvenance }) {
  return <span className={`prov-badge ${PROVENANCE_TONE[provenance]}`}>{provenance}</span>;
}

function OversightValueBlock({ label, value }: { label: string; value: OversightValue }) {
  return <article><span>{label}</span><strong>{value.text}</strong><ProvBadge provenance={value.provenance} /></article>;
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
        {a.passStandard !== null && (
          // Unit-aware: a 1000-point tabletop standard must never render as "950%".
          <span className="compliance-pass-standard">
            {formatPassStandardLabel(a.passStandard, a.passStandardScale ?? scaleForAssignmentType(a.type))}
          </span>
        )}
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
// HOME — executive readiness brief
// ---------------------------------------------------------------------------

function firstNameFromProfile(user: ReturnType<typeof useAuth>['user']): string | null {
  const direct = user?.firstName?.trim();
  if (direct) return direct;
  const fromName = user?.name?.trim().split(/\s+/)[0];
  if (fromName) return fromName;
  return null;
}

function greetingForNow(firstName: string | null): string {
  const hour = new Date().getHours();
  const daypart = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  return firstName ? `Good ${daypart}, ${firstName}.` : `Good ${daypart}.`;
}

function formatBriefTimestamp(): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date());
}

function HomeView({ onGo, handlers }: { onGo: (view: ViewKey, sub?: string) => void; handlers: ComplianceHandlers }) {
  const { user } = useAuth();
  const compliance = useCompliance();
  const { summary, next, requiredNow, evidenceConnected, disconnectedNotice } = compliance;
  const firstName = firstNameFromProfile(user);
  const sourceRecordCount = DECISIONS.length + WORKFLOW_INSTANCES.length + OVERSIGHT_QUARTERS.length + EVIDENCE_PACKAGES.length;
  const readinessBlockers = [
    'Brad/Nolan Vertex transfer is a proposed future governance decision only.',
    'Production evidence service is disconnected from this local exercise path.',
    'Handbook legal/compliance review is urgent and not closed.',
    'The 30-day sustained-compliance streak has not been proven.',
  ];

  return (
    <div className="governance-page home-page executive-readiness-os">
      <Breadcrumb trail={['Governing Body Office', 'Home']} />
      <section className="readiness-hero" aria-labelledby="readiness-home-title">
        <div>
          <span>CARE INDEED GOVERNING BODY EXECUTIVE READINESS OFFICE</span>
          <h1 id="readiness-home-title">{greetingForNow(firstName)}</h1>
          <p>This is the current status of our agency.</p>
        </div>
        <div className="readiness-posture-panel" aria-label="Current readiness posture">
          <strong>Readiness not achieved</strong>
          <small>30-day streak: not started · critical blockers open</small>
          <button className="executive-button" onClick={() => onGo('decisions')}>Open required decisions <ArrowRight size={16} /></button>
        </div>
      </section>

      {!evidenceConnected && <PreviewOnlyBanner notice={disconnectedNotice} />}

      <section className="brad-brief-card" aria-labelledby="brad-brief-title">
        <header>
          <div>
            <span>Verified Governing Body Readiness Brief</span>
            <h2 id="brad-brief-title">Assembled {formatBriefTimestamp()} from {sourceRecordCount} portal records</h2>
          </div>
          <i>DETERMINISTIC · FAIL-CLOSED</i>
        </header>
        <p className="brief-provenance-caption">Deterministically assembled from current portal records. Brad narrative generation is not connected.</p>
        <p className="brad-state">{BRAD_NOLAN_CURRENT_STATE}</p>
        <p>
          Deterministic readiness facts show eight Board decisions due before readiness can be relied on. Decision #1 is the future Brad/Nolan Vertex transfer; it is not implemented and must return with BAA, trust-zone, model, logging, rollback, and validation evidence. Personal compliance remains incomplete until assigned modules, policies, quizzes, tabletop packs, attestations, and official evidence records are complete. QAPI tabletop data is synthetic UAT only. The handbook remains an urgent legal/compliance review item, and the Agency Readiness Date cannot be treated as achieved until every gate sustains compliance for 30 consecutive days.
        </p>
      </section>

      <section className="readiness-command-grid" aria-label="Executive readiness command cards">
        <button onClick={() => onGo('decisions')}>
          <span>Decide</span>
          <strong>{DECISIONS.length}</strong>
          <small>Authoritative readiness decisions, with AI architecture first</small>
        </button>
        <button onClick={() => onGo('compliance', 'required')}>
          <span>Complete</span>
          <strong>{requiredNow.length}</strong>
          <small>Personal requirements needing action now</small>
        </button>
        <button onClick={() => onGo('workflows', 'blockers')}>
          <span>Unblock</span>
          <strong>{WORKFLOW_INSTANCES.filter((item) => item.readinessImpact === 'Blocks readiness').length}</strong>
          <small>Workflow instances blocking readiness</small>
        </button>
        <button onClick={() => onGo('evidence')}>
          <span>Prove</span>
          <strong>{EVIDENCE_PACKAGES.length}</strong>
          <small>CES-scoped evidence packages needing links</small>
        </button>
      </section>

      <section className="readiness-split">
        <div className="compliance-required-now">
          <header>
            <div><span>PERSONAL REQUIRED WORK</span><h2>What you personally must complete</h2></div>
            <button onClick={() => onGo('compliance', 'required')}>Open My Compliance <ArrowRight size={14} /></button>
          </header>
          <div className="compliance-req-list">
            {next && <RequirementRow view={next} handlers={handlers} />}
            {requiredNow.filter((view) => view.assignment.assignmentId !== next?.assignment.assignmentId).slice(0, 3).map((view) => (
              <RequirementRow key={view.assignment.assignmentId} view={view} handlers={handlers} />
            ))}
          </div>
        </div>
        <section className="readiness-blocker-list" aria-labelledby="readiness-blockers-title">
          <header><span>READINESS BLOCKERS</span><h2 id="readiness-blockers-title">What blocks the Agency Readiness Date</h2></header>
          {readinessBlockers.map((blocker) => <p key={blocker}><AlertTriangle size={15} />{blocker}</p>)}
          <div className="readiness-streak">
            <strong>30-day compliance streak</strong>
            <span>0 / 30 days sustained</span>
            <small>Any critical failure resets the streak and creates an auditable event.</small>
          </div>
        </section>
      </section>

      <section className="home-board-context">
        <header><div><span>REQUIRED BOARD ACTION</span><h2>Here is what the Governing Body must decide</h2></div><button onClick={() => onGo('decisions')}>View full docket <ArrowRight size={14} /></button></header>
        <div className="decision-list executive-decision-list">{DECISIONS.slice(0, 4).map((decision) => <button key={decision.id} onClick={() => onGo('decisions')}>
          <StatusMark tone={decision.tone} /><div><span>{decision.id} · {decision.domain}</span><strong>{decision.title}</strong><small>{decision.status} · {decision.due}</small></div><ChevronRight size={16} />
        </button>)}</div>
      </section>

      <section className="readiness-command-grid compact" aria-label="Compliance totals">
        <button onClick={() => onGo('compliance', 'training')}><span>Training</span><strong>{summary.training.completed}<small> / {summary.training.assigned}</small></strong><small>Official completions only</small></button>
        <button onClick={() => onGo('compliance', 'policies')}><span>Policies and quizzes</span><strong>{summary.policies.completed}<small> / {summary.policies.assigned}</small></strong><small>Read, quiz, attest, evidence</small></button>
        <button onClick={() => onGo('compliance', 'tabletop')}><span>Tabletop</span><strong>{summary.tabletop === 'passed' ? 'Passed' : 'Open'}</strong><small>Five 2026 synthetic packs required</small></button>
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
  const tabletopViews = views.filter((v) => v.assignment.type === 'tabletop');
  const completedViews = views.filter((v) => v.officiallyComplete);

  const TABS: Array<{ id: ComplianceTab; label: string; count?: number }> = [
    { id: 'required', label: 'Required Now', count: requiredNow.length },
    { id: 'training', label: 'Training Modules', count: trainingViews.length },
    { id: 'policies', label: 'Policies & Procedures', count: courses.length },
    { id: 'tabletop', label: 'Tabletop Exercises', count: tabletopViews.length },
    { id: 'annual', label: 'Annual Attestations', count: ANNUAL_ATTESTATIONS.length },
    { id: 'completed', label: 'Completed Evidence', count: completedViews.length },
  ];

  return (
    <div className="governance-page compliance-page">
      <Breadcrumb trail={['Governing Body', 'My Compliance', TABS.find((t) => t.id === tab)?.label ?? '']} />
      <PageHeading
        eyebrow="MY COMPLIANCE"
        title="Everything you are required to complete"
        description="These training modules, controlled Policies & Procedures, quizzes, tabletop exercises, and annual attestations are required for Governing Body compliance. Completion requires a passing score, attestation, controlled source version, and official evidence save."
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
        </section>
      )}

      {tab === 'training' && (
        <section className="compliance-req-list">
          {trainingViews.map((v) => <RequirementRow key={v.assignment.assignmentId} view={v} handlers={handlers} />)}
        </section>
      )}

      {tab === 'policies' && (
        <>
          <section className="compliance-course-list">
            {courses.map((course) => (
              <CourseAccordion key={course.courseId} course={course} viewById={viewById} handlers={handlers} />
            ))}
          </section>
          <section className="policy-docket-preview">
            <header><span>BOARD P&P DOCKET</span><h2>Controlled policies requiring Board review</h2></header>
            {POLICY_APPROVAL_DOCKET.slice(0, 6).map((item) => (
              <article key={item.policyId}>
                <div><small>{item.policyId} · {item.owner}</small><strong>{item.title}</strong><p>{item.regulatoryDriver} · {item.trainingImpact}</p></div>
                <span>{item.approvalStatus}</span>
              </article>
            ))}
          </section>
        </>
      )}

      {tab === 'tabletop' && (
        <section className="compliance-req-list">
          <div className="synthetic-banner"><strong>SYNTHETIC MOCK DATA · 2026 UAT PREVIEW</strong><span>NOT PRODUCTION · NO REAL PHI</span></div>
          <p className="compliance-empty strong">Required Governing Body readiness exercise using the 2026 synthetic QAPI record. Official completion is recorded through My Compliance.</p>
          {tabletopViews.map((v) => <RequirementRow key={v.assignment.assignmentId} view={v} handlers={handlers} />)}
        </section>
      )}

      {tab === 'annual' && (
        <section className="annual-attestation-list">
          {ANNUAL_ATTESTATIONS.map((item) => (
            <article key={item.id}>
              <StatusMark tone="hold" />
              <div><small>{item.id} · {item.status}</small><strong>{item.title}</strong><p>{item.evidence}</p></div>
              <span>{item.due}</span>
              <small>{item.readinessImpact}</small>
            </article>
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
// MEETINGS
// ---------------------------------------------------------------------------

function MeetingsView({ tab, onTab, onDecision }: { tab: MeetingsTab; onTab: (t: MeetingsTab) => void; onDecision: (decision: Decision) => void }) {
  const learnerId = useLearnerId();
  const queuedItems = useAgendaQueue(learnerId);
  const TABS: Array<{ id: MeetingsTab; label: string }> = [
    { id: 'lifecycle', label: 'Lifecycle' },
    { id: 'agenda', label: 'Agenda queue' },
    { id: 'schedule', label: 'Ad hoc scheduler' },
  ];
  const lifecycle = [
    ['Notice', 'Distribution record, authority, confidentiality, and packet deadline'],
    ['Agenda', 'Decision ID, presenter, time, required forms, evidence status, conflict posture'],
    ['Board book', 'Controlled package readiness, hash, missing evidence, access posture'],
    ['Attendance', 'Members, role, mode, quorum, COI, recusal'],
    ['Session', 'Motions, seconds, votes, restrictions, owner, deadline'],
    ['Close', 'Minutes, signatures, action register, CES/Drive links, effectiveness'],
  ];
  const requiredClose = ['attendance', 'quorum', 'COI/recusal', 'motions/votes', 'public minutes', 'executive minutes if applicable', 'action register', 'owners/due dates', 'signatures', 'evidence package', 'calendar/Drive/CES links'];

  return <div className="governance-page executive-readiness-os">
    <Breadcrumb trail={['Governing Body Office', 'Meetings', TABS.find((t) => t.id === tab)?.label ?? '']} />
    <PageHeading eyebrow="MEETINGS · SERVER-SIDE CALENDAR/CES" title="Run the meeting workflow, not a decorative calendar." description="Meeting work moves from decision requirement to governed agenda item, server-side calendar event, motion and vote, action, evidence, effectiveness, and closure." action={<div className="meeting-state"><CircleDot size={14} /><span>Preview · no browser-direct Google write</span></div>} />
    <nav className="compliance-tabs" aria-label="Meetings sections">
      {TABS.map((t) => <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => onTab(t.id)} aria-current={tab === t.id ? 'true' : undefined}>{t.label}</button>)}
    </nav>

    {tab === 'lifecycle' && <>
      <section className="meeting-summary-grid">
        <article><span>NEXT MEETING</span><strong>Readiness review</strong><p>Board action is needed for AI architecture, readiness date, 30-day gate, P&Ps, handbook, compliance completion, tabletop, and admission packet controls.</p><small>Agenda package required before scheduling</small></article>
        <CalendarPostureCard />
        <article><span>PACKET EVIDENCE</span><strong>4 of 8 complete</strong><p>Missing: AI architecture dossier, handbook counsel status, official tabletop evidence, admission packet validation.</p><small>Status uses text, not color alone</small></article>
        <article><span>CLOSE GATE</span><strong>Blocked</strong><p>A meeting cannot close from front-end state alone. Required records and signatures must be present.</p><small>CES evidence package required</small></article>
      </section>
      <section className="meeting-lifecycle">
        {lifecycle.map(([title, detail], index) => (
          <article key={title}>
            <b>{String(index + 1).padStart(2, '0')}</b>
            <div><strong>{title}</strong><p>{detail}</p></div>
          </article>
        ))}
      </section>
      <section className="meeting-close-gate">
        <header><span>MEETING CLOSE REQUIREMENTS</span><h2>Do not mark closed until every record exists.</h2></header>
        <div>{requiredClose.map((item) => <span key={item}><CheckCircle2 size={15} />{item}</span>)}</div>
      </section>
    </>}

    {tab === 'agenda' && <>
      <section className="agenda-card executive-agenda draft-agenda-queue">
        <header><div><span>DRAFT AGENDA QUEUE</span><h2>Items you queued from decisions and workflows</h2></div><small>{AGENDA_QUEUE_DISCLAIMER}</small></header>
        {queuedItems.length ? (
          <ol>{queuedItems.map((item, index) => <li key={item.id} className="ready">
            <time>{String(index + 1).padStart(2, '0')}</time>
            <span>{item.decisionId}</span>
            <div><strong>{item.title}</strong><small>Added {new Date(item.addedAt).toLocaleString()} · from {item.source}</small></div>
            <button onClick={() => removeAgendaItem(learnerId, item.id)} aria-label={`Remove ${item.decisionId} from draft agenda`}>Remove <X size={14} /></button>
          </li>)}</ol>
        ) : <p className="compliance-empty">No draft agenda items queued yet. Use "Add to agenda" on a decision dossier or workflow.</p>}
      </section>
      <section className="agenda-card executive-agenda">
        <header><div><span>AUTHORITATIVE READINESS DOCKET</span><h2>Agenda queue</h2></div><small>Decision-to-agenda metadata required</small></header>
        <ol>{DECISIONS.map((decision, index) => <li key={decision.id} className={decision.tone}>
          <time>{String(index + 1).padStart(2, '0')}</time>
          <span>{decision.id}</span>
          <div><strong>{decision.title}</strong><small>{decision.owner} · {decision.readinessImpact}</small></div>
          <button onClick={() => onDecision(decision)}>Open dossier <ChevronRight size={15} /></button>
        </li>)}</ol>
      </section>
    </>}

    {tab === 'schedule' && <AdHocScheduler queuedItems={queuedItems} />}
  </div>;
}

// ---------------------------------------------------------------------------
// AD HOC SCHEDULER — real server request, fail-closed (blocker 3.3)
// ---------------------------------------------------------------------------

const SCHEDULER_ATTENDEE_OPTIONS = [
  'Governing Body Chair',
  'Administrator',
  'Board Secretary',
  'Compliance Officer',
  'QAPI Lead',
  'HR Director',
];

/**
 * Live Calendar/CES posture. "Server-only" is the ARCHITECTURE (the browser never
 * writes to Google directly); reachability is a separate, probed FACT — so the card
 * states both instead of implying the integration is absent.
 */
function CalendarPostureCard() {
  const [health, setHealth] = useState<CalendarHealth | null>(null);
  useEffect(() => {
    const ac = new AbortController();
    void probeCalendarHealth(ac.signal).then(setHealth).catch(() => undefined);
    return () => ac.abort();
  }, []);
  const status = health ? postureLabel(health) : 'Checking…';
  return (
    <article>
      <span>CALENDAR POSTURE</span>
      <strong>Server-only · {status}</strong>
      <p>
        Ad hoc meetings create or upsert through the Calendar/CES adapter; the browser never writes
        directly to Google Calendar.{' '}
        {health && !health.reachable
          ? 'The adapter is wired but Google is not reachable right now, so scheduling will fail closed with the server’s reason.'
          : health?.reachable
            ? 'Google Calendar is reachable, so scheduling creates a real event and returns its Google id.'
            : ''}
      </p>
      <small>/api/calendar/events · probed via /api/calendar/healthz</small>
    </article>
  );
}

type SchedulerState =
  | { phase: 'idle' }
  | { phase: 'submitting' }
  | { phase: 'failed'; message: string }
  | { phase: 'created'; eventId: string; googleEventId: string; action: string; htmlLink?: string };

function AdHocScheduler({ queuedItems }: { queuedItems: ReturnType<typeof useAgendaQueue> }) {
  const [title, setTitle] = useState('Governing Body readiness decision meeting');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [attendees, setAttendees] = useState<string[]>(['Governing Body Chair', 'Board Secretary']);
  const [state, setState] = useState<SchedulerState>({ phase: 'idle' });
  // Real reachability of the Calendar/CES integration, probed — never assumed.
  const [health, setHealth] = useState<CalendarHealth | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    void probeCalendarHealth(ac.signal).then(setHealth).catch(() => undefined);
    return () => ac.abort();
  }, []);

  const toggleAttendee = (name: string) => {
    setAttendees((current) => current.includes(name) ? current.filter((a) => a !== name) : [...current, name]);
  };

  const canSubmit = title.trim().length > 0 && date && time && attendees.length > 0 && state.phase !== 'submitting';

  const submit = async () => {
    if (!canSubmit) return;
    setState({ phase: 'submitting' });
    // Posts the server's real PlannerEventPayload through the deterministic sync
    // engine; the client treats ok:false / action:'failed' / missing google id as
    // a failure and surfaces the SERVER's reason.
    const result = await createAdHocMeeting({
      title,
      date,
      time,
      attendees,
      agenda: queuedItems.map((item) => ({ decisionId: item.decisionId, title: item.title })),
      env: 'SANDBOX',
    });
    if (!result.ok) {
      setState({ phase: 'failed', message: result.reason });
      return;
    }
    setState({
      phase: 'created',
      eventId: result.eventId,
      googleEventId: result.googleEventId,
      action: result.action,
      htmlLink: result.htmlLink,
    });
  };

  return <section className="scheduler-panel">
    <header>
      <div><span>AD HOC EVENT SCHEDULER</span><h2>Schedule through Calendar/CES, not the browser.</h2></div>
      <i>{state.phase === 'created'
        ? `${state.action === 'updated' ? 'Updated' : 'Created'} · Google event ${state.googleEventId}`
        : state.phase === 'failed' ? 'Sync failed — no event created'
        : health ? `Calendar/CES: ${postureLabel(health)}`
        : 'Checking Calendar/CES…'}</i>
    </header>
    <form className="scheduler-form" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      <label>
        <span>Meeting title</span>
        <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <div className="scheduler-datetime">
        <label>
          <span>Date</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        </label>
        <label>
          <span>Start time</span>
          <input type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
        </label>
      </div>
      <fieldset className="scheduler-attendees">
        <legend>Attendees (roles)</legend>
        {SCHEDULER_ATTENDEE_OPTIONS.map((name) => (
          <label key={name}>
            <input type="checkbox" checked={attendees.includes(name)} onChange={() => toggleAttendee(name)} />
            <span>{name}</span>
          </label>
        ))}
      </fieldset>
      <section className="scheduler-proposed-agenda">
        <span>PROPOSED AGENDA · FROM DRAFT AGENDA QUEUE</span>
        <small>{AGENDA_QUEUE_DISCLAIMER}</small>
        {queuedItems.length
          ? <ol>{queuedItems.map((item) => <li key={item.id}><b>{item.decisionId}</b> {item.title}</li>)}</ol>
          : <p className="compliance-empty">The draft agenda queue is empty; the request will carry an empty agenda.</p>}
      </section>
      <div className="scheduler-submit-row">
        <button type="submit" className="executive-button" disabled={!canSubmit}>
          {state.phase === 'submitting' ? 'Submitting to /api/calendar/events…' : 'Create server-side calendar event'}
        </button>
        <ExecutiveAction
          label="Open in Google Calendar"
          // Enabled only with the server-resolved htmlLink — the portal never
          // constructs a Google URL from an id it cannot verify.
          disabledReason={
            state.phase !== 'created'
              ? 'No Google event exists yet — create the event first.'
              : !state.htmlLink
                ? 'Calendar/CES did not return a Google link for this event.'
                : undefined
          }
          onAct={state.phase === 'created' && state.htmlLink ? () => window.open(state.htmlLink, '_blank', 'noopener') : undefined}
        />
      </div>
      {state.phase === 'failed' && (
        <p className="scheduler-failed" role="alert">
          <AlertTriangle size={15} aria-hidden="true" /> {state.message}
        </p>
      )}
      {state.phase === 'created' && (
        <p className="scheduler-created" role="status">
          <CheckCircle2 size={15} aria-hidden="true" /> Calendar/CES {state.action} the event · app id {state.eventId} · Google id {state.googleEventId}.
        </p>
      )}
    </form>
  </section>;
}

// ---------------------------------------------------------------------------
// DECISIONS
// ---------------------------------------------------------------------------

/**
 * Spec §3 — compact, READ-ONLY Board readiness summary.
 *
 * Member training and tabletop completion are individual compliance
 * requirements, not motions, so they no longer sit on the formal docket (see
 * GB_COMPLIANCE_OBLIGATIONS). The Board still needs to see their state, so it
 * appears here as a summary with a single link into member compliance. Nothing
 * here is approvable, votable, or actionable as a decision.
 */
function BoardReadinessSummary({ onGo }: { onGo: (view: ViewKey, sub?: string) => void }) {
  // Official evidence only — a local draft never counts toward Board readiness.
  const { views } = useCompliance();

  const approvalState = (decisionId: string): 'Complete' | 'Incomplete' => {
    const decision = DECISIONS.find((item) => item.id === decisionId);
    if (!decision) return 'Incomplete';
    return /approved|complete/i.test(decision.status) && !/pending|hold|required|urgent/i.test(decision.status)
      ? 'Complete'
      : 'Incomplete';
  };

  const countOf = (type: ComplianceAssignmentType) => {
    const scoped = views.filter((view) => view.assignment.type === type);
    return { done: scoped.filter((view) => view.officiallyComplete).length, total: scoped.length };
  };
  const training = countOf('training_module');
  const tabletop = countOf('tabletop');

  // Official readiness is eligible only when every approval AND every member
  // obligation is officially complete — never from a local draft.
  const approvals: Array<[string, 'Complete' | 'Incomplete']> = [
    ['Policies approved', approvalState('GB-READINESS-004')],
    ['Handbook approved', approvalState('GB-READINESS-005')],
    ['Admission Packet approved', approvalState('GB-READINESS-008')],
  ];
  const eligible = approvals.every(([, state]) => state === 'Complete')
    && training.total > 0 && training.done === training.total
    && tabletop.total > 0 && tabletop.done === tabletop.total;

  return (
    <section className="board-readiness-summary" aria-labelledby="board-readiness-heading">
      <header>
        <h2 id="board-readiness-heading">Board Readiness</h2>
        <span className="board-readiness-note">Read-only summary — member obligations are tracked in My Compliance, not on the docket.</span>
      </header>
      <dl>
        {approvals.map(([label, state]) => (
          <div key={label} className={state === 'Complete' ? 'is-complete' : 'is-incomplete'}>
            <dt>{label}</dt><dd>{state}</dd>
          </div>
        ))}
        <div className={training.done === training.total && training.total > 0 ? 'is-complete' : 'is-incomplete'}>
          <dt>Current member training</dt><dd>{training.done} of {training.total} assignments complete</dd>
        </div>
        <div className={tabletop.done === tabletop.total && tabletop.total > 0 ? 'is-complete' : 'is-incomplete'}>
          <dt>Current member tabletop</dt><dd>{tabletop.done} of {tabletop.total} assignments complete</dd>
        </div>
        <div className={eligible ? 'is-complete' : 'is-incomplete'}>
          <dt>Official readiness</dt><dd>{eligible ? 'Eligible' : 'Not eligible'}</dd>
        </div>
      </dl>
      <button type="button" className="board-readiness-action" onClick={() => onGo('compliance', 'required')}>
        View Member Compliance
      </button>
    </section>
  );
}

function DecisionsView({ onDecision, onGo }: { onDecision: (decision: Decision) => void; onGo: (view: ViewKey, sub?: string) => void }) {
  const [filter, setFilter] = useState<'all' | 'blockers' | 'urgent' | 'synthetic'>('all');
  const filtered = filter === 'synthetic'
    ? SOURCE_DERIVED_QAPI_DECISIONS
    : DECISIONS.filter((decision) => {
      if (filter === 'blockers') return decision.readinessImpact.toLowerCase().includes('block');
      if (filter === 'urgent') return decision.status.toLowerCase().includes('urgent') || decision.tone === 'attention';
      return true;
    });
  return <div className="governance-page executive-readiness-os">
    <Breadcrumb trail={['Governing Body Office', 'Decisions']} />
    <PageHeading eyebrow="DECISION DOCKET" title="The authoritative readiness decisions." description="Placeholder decisions have been removed. The readiness docket starts with the future Brad/Nolan Vertex transfer and keeps synthetic QAPI decisions subordinate to source-derived preview work." />
    <BoardReadinessSummary onGo={onGo} />
    <nav className="decision-filters" aria-label="Decision filters">{([
      ['all', 'Authoritative docket', DECISIONS.length],
      ['blockers', 'Blocks readiness', DECISIONS.filter((decision) => decision.readinessImpact.toLowerCase().includes('block')).length],
      ['urgent', 'Urgent / attention', DECISIONS.filter((decision) => decision.status.toLowerCase().includes('urgent') || decision.tone === 'attention').length],
      ['synthetic', 'Source-derived QAPI', SOURCE_DERIVED_QAPI_DECISIONS.length],
    ] as const).map(([id, label, count]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}<span>{count}</span></button>)}</nav>
    <section className="decision-table executive-decision-table"><header><span>MATTER</span><span>POSTURE</span><span>OWNER / DUE</span><span>RETURN / EFFECTIVENESS</span><span /></header>{filtered.map((decision) => <button key={decision.id} onClick={() => onDecision(decision)}><div className="decision-identity"><StatusMark tone={decision.tone} /><div><small>{decision.id} · {decision.domain}</small><strong>{decision.title}</strong><p>{decision.summary}</p>{decision.currentState && <em>{decision.currentState}</em>}{decision.referenceMaterials?.length ? <em>Board references attached: {decision.referenceMaterials.length}</em> : null}</div></div><span className={`decision-posture ${decision.tone}`}>{decision.status}</span><span>{decision.owner}<br />{decision.due}</span><span>{decision.returnToBoardDate}<br />{decision.effectivenessMeasure}</span><ChevronRight size={17} /></button>)}</section>
    <section className="decision-action-chain">
      <Scale size={22} />
      <div><span>DECISION-TO-AGENDA-TO-EVIDENCE CHAIN</span><strong>Requirement {'->'} Workflow {'->'} Decision {'->'} Agenda {'->'} Meeting {'->'} Motion {'->'} Action {'->'} Evidence {'->'} Effectiveness {'->'} Closure</strong><p>Every readiness decision exposes agenda actions, workflow links, required forms, CES evidence, owner, due date, return date, and effectiveness measure.</p></div>
    </section>
  </div>;
}

// ---------------------------------------------------------------------------
// WORKFLOWS
// ---------------------------------------------------------------------------

/** Fields on a workflow instance that are UAT-seeded, not compiled corpus data (blocker 5.3). */
const SEEDED_WORKFLOW_PROVENANCE: OversightProvenance = 'Supplemental synthetic UAT';

function WorkflowsView({ tab, selectedInstanceId, onTab, onSelect, onDecision, onGo }: { tab: WorkflowTab; selectedInstanceId?: string; onTab: (t: WorkflowTab) => void; onSelect: (item: WorkflowInstance) => void; onDecision: (decision: Decision) => void; onGo: (view: ViewKey, sub?: string) => void }) {
  const learnerId = useLearnerId();
  const [agendaConfirmation, setAgendaConfirmation] = useState<string | null>(null);
  const visible = tab === 'library' ? WORKFLOW_INSTANCES : WORKFLOW_INSTANCES.filter((item) => item.tab === tab);
  const selected = WORKFLOW_INSTANCES.find((item) => item.instanceId === selectedInstanceId) ?? visible[0] ?? WORKFLOW_INSTANCES[0];
  // Resolve the decision actually linked to the SELECTED workflow — never a
  // hard-coded DECISIONS[0] (blocker 3.4).
  const linkedDecision = ALL_DECISIONS.find((decision) => decision.workflowIds.includes(selected.workflowId)) ?? null;
  const selectInstance = (item: WorkflowInstance) => { onSelect(item); setAgendaConfirmation(null); };
  const addSelectedToAgenda = () => {
    if (!linkedDecision) return;
    const result = addAgendaItem(learnerId, { decisionId: linkedDecision.id, title: linkedDecision.title, source: `workflows:${selected.instanceId}` });
    setAgendaConfirmation(result.ok ? 'Added to draft agenda' : 'Already in draft agenda');
  };
  const TABS: Array<{ id: WorkflowTab; label: string }> = [
    { id: 'due', label: 'Due Now' },
    { id: 'blockers', label: 'Readiness Blockers' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'event', label: 'Event-Triggered' },
    { id: 'completed', label: 'Completed' },
    { id: 'library', label: 'Workflow Library' },
  ];
  return <div className="governance-page executive-readiness-os">
    <Breadcrumb trail={['Governing Body Office', 'Workflows', TABS.find((t) => t.id === tab)?.label ?? '']} />
    <PageHeading eyebrow="WORKFLOWS · SOURCE-BACKED" title="Operational work with owners, clocks, forms, and evidence." description={`This page projects active readiness workflow instances from the compiled workflow corpus. Library source: ${WORKFLOW_LIBRARY_SUMMARY.source}.`} action={<div className="meeting-state"><BadgeCheck size={14} /><span>{WORKFLOW_LIBRARY_SUMMARY.total} compiled workflows</span></div>} />
    <nav className="compliance-tabs" aria-label="Workflow sections">
      {TABS.map((t) => <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => onTab(t.id)} aria-current={tab === t.id ? 'true' : undefined}>{t.label}</button>)}
    </nav>
    <section className="workflow-kpis">
      <Metric value={String(WORKFLOW_LIBRARY_SUMMARY.total)} label="Compiled workflows" note="Generated source corpus" />
      <Metric value={String(WORKFLOW_LIBRARY_SUMMARY.requiresGoverningBody)} label="Require Governing Body" note="Compiler-derived approval flag" tone="attention" />
      <Metric value={String(WORKFLOW_LIBRARY_SUMMARY.highRisk)} label="High-risk workflows" note="Compiler-derived risk band" />
    </section>
    <section className="workflow-command-layout">
      <div className="workflow-instance-list">
        {visible.length ? visible.map((item) => (
          <article key={item.instanceId} className={selected.instanceId === item.instanceId ? 'active' : ''}>
            <button onClick={() => selectInstance(item)}>
              <StatusMark tone={item.readinessImpact === 'Blocks readiness' ? 'attention' : item.readinessImpact === 'At risk' ? 'hold' : 'ready'} />
              <div><small>{item.workflowId} · {item.sourcePosture}</small><strong>{item.title}</strong><p>{item.whyTriggered}</p></div>
              <ChevronRight size={16} />
            </button>
            <dl>
              <div><dt>Owner</dt><dd>{item.owner}</dd></div>
              <div><dt>Due</dt><dd>{item.due}</dd></div>
              <div><dt>Evidence</dt><dd>{item.evidenceCompleteness}</dd></div>
            </dl>
          </article>
        )) : <p className="compliance-empty">No workflow instances are currently in this view.</p>}
      </div>
      <section className="workflow-detail" aria-labelledby="workflow-detail-title">
        <span>{selected.workflowId} · {selected.currentStage}</span>
        <h2 id="workflow-detail-title">{selected.title}</h2>
        <p>{selected.processOverview}</p>
        <div className="workflow-detail-grid">
          <article><small>Readiness impact</small><strong>{selected.readinessImpact}</strong><ProvBadge provenance={SEEDED_WORKFLOW_PROVENANCE} /></article>
          <article><small>Next action</small><strong>{selected.nextAction}</strong><ProvBadge provenance={SEEDED_WORKFLOW_PROVENANCE} /></article>
          <article><small>Agenda status</small><strong>{selected.agendaStatus}</strong><ProvBadge provenance={SEEDED_WORKFLOW_PROVENANCE} /></article>
          <article><small>Authority</small><strong>{selected.authority || 'Source authority pending'}</strong><ProvBadge provenance="Source recovered" /></article>
          <article><small>Due</small><strong>{selected.due}</strong><ProvBadge provenance={SEEDED_WORKFLOW_PROVENANCE} /></article>
          <article><small>Evidence status</small><strong>{selected.evidenceCompleteness}</strong><ProvBadge provenance={SEEDED_WORKFLOW_PROVENANCE} /></article>
          <article><small>Trigger</small><strong>{selected.whyTriggered}</strong><ProvBadge provenance={SEEDED_WORKFLOW_PROVENANCE} /></article>
        </div>
        <p className="workflow-provenance-note">Policy/form/authority enrichment is projected from the compiled workflow corpus. Operational state, due date, evidence status, and trigger are seeded for this preview and labeled "{SEEDED_WORKFLOW_PROVENANCE}".</p>
        <section><h3>Required forms</h3><div className="form-chip-row">{selected.requiredForms.length ? selected.requiredForms.map((form) => <span key={form}>{form}</span>) : <span>No forms projected</span>}</div></section>
        <section><h3>Failure and audit requirements</h3><p>{selected.failureConditions}</p><p>{selected.auditRequirements}</p></section>
        <div className="decision-action-row">
          <ExecutiveAction
            label="Open linked board decision"
            onAct={linkedDecision ? () => onDecision(linkedDecision) : undefined}
            disabledReason={linkedDecision ? undefined : 'No board decision references this workflow'}
          />
          <ExecutiveAction
            label="Add to agenda"
            onAct={linkedDecision ? addSelectedToAgenda : undefined}
            disabledReason={linkedDecision ? undefined : 'No board decision references this workflow'}
            confirmation={agendaConfirmation ?? undefined}
          />
          <ExecutiveAction label="Schedule event" onAct={() => onGo('meetings', 'schedule')} />
          <ExecutiveAction
            label="Open required forms"
            disabledReason="Form registry deep-links require the connected CES service — not available in this preview build"
          />
          <ExecutiveAction label="Open evidence view" onAct={() => onGo('evidence')} />
        </div>
      </section>
    </section>
  </div>;
}

// ---------------------------------------------------------------------------
// OVERSIGHT
// ---------------------------------------------------------------------------

function OversightView({ tab, period, onTab, onPeriod, onDecision, onOpenTabletop }: { tab: OversightTab; period?: string; onTab: (t: OversightTab) => void; onPeriod: (period: string) => void; onDecision: (decision: Decision) => void; onOpenTabletop: () => void }) {
  const quarter = OVERSIGHT_QUARTERS.find((item) => item.id === period) ?? OVERSIGHT_QUARTERS[1];
  const TABS: Array<{ id: OversightTab; label: string }> = [
    { id: 'qapi', label: '2026 QAPI Preview' },
    { id: 'domains', label: 'Other Domains' },
    { id: 'data', label: 'Data Integrity' },
  ];
  return <div className="governance-page executive-readiness-os">
    <Breadcrumb trail={['Governing Body Office', 'Oversight', TABS.find((t) => t.id === tab)?.label ?? '']} />
    <PageHeading eyebrow="OVERSIGHT · 2026 UAT PREVIEW" title="Board-ready oversight without pretending mock data is live." description="QAPI preview data is synthetic and useful for readiness rehearsal. Production readiness cannot rely on synthetic or localStorage evidence." action={<button className="executive-button" onClick={() => onDecision(DECISIONS[6])}>Open tabletop decision <ArrowRight size={16} /></button>} />
    <div className="synthetic-banner"><strong>SYNTHETIC MOCK DATA · 2026 UAT PREVIEW</strong><span>NOT PRODUCTION · NO REAL PHI</span></div>
    <nav className="compliance-tabs" aria-label="Oversight sections">
      {TABS.map((t) => <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => onTab(t.id)} aria-current={tab === t.id ? 'true' : undefined}>{t.label}</button>)}
    </nav>

    {tab === 'qapi' && (
      <>
        <nav className="quarter-selector" aria-label="Synthetic QAPI quarter">
          {OVERSIGHT_QUARTERS.map((item) => <button key={item.id} className={quarter.id === item.id ? 'active' : ''} onClick={() => onPeriod(item.id)}>{item.label}</button>)}
        </nav>
        <section className="oversight-provenance-legend" aria-label="Provenance legend">
          <span>PROVENANCE LEGEND — every Oversight value carries one of these labels</span>
          <div>
            {OVERSIGHT_PROVENANCE_LEGEND.map((entry) => (
              <article key={entry.label}><ProvBadge provenance={entry.label} /><p>{entry.description}</p></article>
            ))}
          </div>
        </section>
        <p className="oversight-source-note">Derived from {quarter.source} · normalization: {quarter.normalization}</p>
        <section className="oversight-signal-grid">
          <OversightValueBlock label="What changed" value={quarter.changed} />
          <OversightValueBlock label="Improved" value={quarter.improved} />
          <OversightValueBlock label="Worsened" value={quarter.worsened} />
          <OversightValueBlock label="Requires Board action" value={quarter.boardDecision} />
        </section>
        {quarter.normalization === 'pending' && (
          <p className="oversight-pending-note" role="status">
            <AlertTriangle size={15} aria-hidden="true" /> {quarter.id} 2026 normalization is pending — no KPI or lifecycle value is recovered for this quarter, and none is invented.
          </p>
        )}
        <section className="qapi-kpi-grid">
          {quarter.kpis.map((kpi) => <article key={kpi.name}>
            <header><ProvBadge provenance={kpi.provenance} /><strong>{kpi.name}</strong></header>
            <dl><div><dt>Current</dt><dd>{kpi.value}</dd></div><div><dt>Threshold</dt><dd>{kpi.threshold}</dd></div><div><dt>Numerator / denominator</dt><dd>{kpi.numerator} / {kpi.denominator}</dd></div><div><dt>Prior quarter</dt><dd>{kpi.priorQuarter} <ProvBadge provenance={kpi.priorQuarterProvenance} /></dd></div><div><dt>Subgroup</dt><dd>{kpi.subgroup}</dd></div><div><dt>Source date</dt><dd>{kpi.sourceDate}</dd></div></dl>
            <p>{kpi.trend}</p>
          </article>)}
        </section>
        <section className="qapi-lifecycle">
          <header><span>QAPI LIFECYCLE</span><h2>PIPs, CAPs, RCAs, evidence, and Board return</h2></header>
          {quarter.lifecycle.length
            ? quarter.lifecycle.map((item) => <article key={`${item.type}-${item.title}`}><b>{item.type}</b><div><strong>{item.title}</strong><p>{item.owner} · due {item.due} · evidence: {item.evidence}</p><ProvBadge provenance={item.provenance} /></div><span>{item.boardReturn}</span></article>)
            : <p className="compliance-empty">No lifecycle record recovered for this quarter.</p>}
        </section>
        <section className="oversight-sim-launch">
          <button className="home-sim-launch" onClick={onOpenTabletop}>
            <div className="home-sim-copy">
              <span>GOVERNING BODY BOARDROOM SIMULATION</span>
              <strong>Practice this quarter in the Boardroom Simulation</strong>
              <small>Required Governing Body readiness exercise using the 2026 synthetic QAPI record. Official completion is recorded through My Compliance.</small>
            </div>
            <span className="home-sim-cta">Launch simulation <ArrowRight size={16} /></span>
          </button>
        </section>
      </>
    )}

    {tab === 'domains' && <>
      <section className="risk-overview"><article><span>OTHER OVERSIGHT DOMAINS</span><strong>Board attention map</strong><p>Each domain links back to a decision, workflow, required form, CES evidence package, or readiness gate.</p></article><Metric value="8" label="Domains" note="Adverse events, infection, grievances, workforce, licensure, billing, privacy/security, finance" tone="attention" /><Metric value="4" label="Board decisions" note="AI, P&P, handbook, admission packet" /><Metric value="0" label="Production claims" note="No synthetic item is counted as live evidence" tone="positive" /></section>
      <section className="risk-bottom-grid"><article className="risk-map"><span>DEPENDENCY MAP</span><h2>Every blocker has a governed path.</h2><div><button onClick={() => onDecision(DECISIONS[0])}><Activity size={17} /><strong>AI architecture</strong><small>Future Vertex decision</small></button><i /><button onClick={() => onDecision(DECISIONS[4])}><UsersRound size={17} /><strong>Handbook</strong><small>Urgent review</small></button><i /><button onClick={() => onDecision(DECISIONS[7])}><Scale size={17} /><strong>Admission packet</strong><small>Template + registry</small></button><i /><button onClick={() => onDecision(DECISIONS[3])}><FileCheck2 size={17} /><strong>P&Ps</strong><small>Controlled approvals</small></button></div></article><article className="assurance-opinion"><span>ASSURANCE OPINION</span><h3>Conditional readiness only.</h3><p>The interface can show the chain, but production readiness remains blocked until live sources, official evidence, Board approvals, and sustained compliance are complete.</p><footer><BadgeCheck size={17} /><span>Evidence architecture remains a CES projection, not a duplicate store</span></footer></article></section>
    </>}

    {tab === 'data' && <>
      <section className="data-integrity-list">
        <header><span>UNRESOLVED DATA INTEGRITY</span><h2>Issues that prevent silent reliance</h2></header>
        {quarter.dataIssues.map((issue) => <article key={issue.text}><AlertTriangle size={16} /><strong>{issue.text}</strong><ProvBadge provenance={issue.provenance} /><span>{quarter.label}</span></article>)}
        {OVERSIGHT_QUARTERS.filter((item) => item.id !== quarter.id).flatMap((item) => item.dataIssues.map((issue) => ({ key: `${item.label}: ${issue.text}`, issue, label: item.label }))).slice(0, 8).map(({ key, issue, label }) => <article key={key}><AlertTriangle size={16} /><strong>{label}: {issue.text}</strong><ProvBadge provenance={issue.provenance} /><span>Synthetic preview</span></article>)}
      </section>
    </>}
  </div>;
}

// ---------------------------------------------------------------------------
// EVIDENCE
// ---------------------------------------------------------------------------

/**
 * Google Drive reference documents (Shared Drive, service-account scoped).
 * Lists the real evidence root via /api/calendar/intake/drive-folder so the Board
 * can review — or open in Drive to save against — source material. Every link is
 * the SERVER's webViewLink/folderUrl; the portal never fabricates a Drive URL, and
 * an unreachable or disabled Drive is stated plainly instead of shown as empty.
 */
function DriveReferenceDocuments() {
  const [health, setHealth] = useState<DriveHealth | null>(null);
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const [trail, setTrail] = useState<DriveFolderRef[]>([]);
  const [listing, setListing] = useState<
    { folders: DriveFolderRef[]; files: DriveFileRef[]; folderUrl: string | null } | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    void probeDriveHealth(ac.signal).then(setHealth).catch(() => undefined);
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (!health?.enabled || !health.reachable) return;
    const ac = new AbortController();
    setLoading(true);
    void listDriveFolder(folderId, ac.signal)
      .then((result) => {
        if (result.ok) {
          setListing({ folders: result.folders, files: result.files, folderUrl: result.folderUrl });
          setError(null);
        } else {
          setError(result.reason);
          setListing(null);
        }
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [folderId, health?.enabled, health?.reachable]);

  const openFolder = (folder: DriveFolderRef) => {
    setTrail((t) => [...t, folder]);
    setFolderId(folder.id);
  };
  const upTo = (index: number) => {
    const next = trail.slice(0, index);
    setTrail(next);
    setFolderId(next.length ? next[next.length - 1].id : undefined);
  };

  const unavailable = health && (!health.enabled || !health.reachable);

  return (
    <section className="drive-reference-panel">
      <header>
        <div>
          <span>GOOGLE DRIVE REFERENCE DOCUMENTS</span>
          <h2>Review or save Board reference material from the Shared Drive.</h2>
        </div>
        <small>{health ? `Drive: ${postureLabel(health)}` : 'Checking Drive…'}</small>
      </header>

      {unavailable && (
        <p className="drive-unavailable" role="status">
          <AlertTriangle size={15} aria-hidden="true" />
          {!health?.enabled
            ? 'Drive evidence storage is disabled by configuration, so no reference documents can be listed.'
            : `The Shared Drive is configured${health?.sharedDriveId ? ` (${health.sharedDriveId})` : ''} but not reachable right now${health?.error ? ` (${health.error})` : ''}. Nothing is listed rather than showing an empty folder as if it were empty.`}
        </p>
      )}

      {health?.enabled && health.reachable && (
        <>
          <nav className="drive-breadcrumb" aria-label="Drive folder path">
            <button type="button" onClick={() => upTo(0)} disabled={!trail.length}>Evidence root</button>
            {trail.map((folder, index) => (
              <span key={folder.id}>
                <ChevronRight size={13} aria-hidden="true" />
                <button type="button" onClick={() => upTo(index + 1)} disabled={index === trail.length - 1}>
                  {folder.name}
                </button>
              </span>
            ))}
            {listing?.folderUrl && (
              <a className="drive-open-folder" href={listing.folderUrl} target="_blank" rel="noreferrer">
                Open this folder in Drive
              </a>
            )}
          </nav>

          {loading && <p className="compliance-empty">Loading Drive contents…</p>}
          {error && <p className="drive-unavailable" role="alert"><AlertTriangle size={15} aria-hidden="true" /> {error}</p>}

          {listing && !loading && (
            <ul className="drive-listing">
              {listing.folders.map((folder) => (
                <li key={folder.id}>
                  <button type="button" onClick={() => openFolder(folder)}>
                    <FileText size={15} aria-hidden="true" />
                    <strong>{folder.name}</strong>
                    <em>Folder</em>
                  </button>
                </li>
              ))}
              {listing.files.map((file) => (
                <li key={file.id}>
                  {file.webViewLink ? (
                    <a href={file.webViewLink} target="_blank" rel="noreferrer">
                      <FileText size={15} aria-hidden="true" />
                      <strong>{file.name}</strong>
                      <em>Open in Drive</em>
                    </a>
                  ) : (
                    <button type="button" disabled title="Drive did not return a shareable link for this file">
                      <FileText size={15} aria-hidden="true" />
                      <strong>{file.name}</strong>
                      <em>No Drive link</em>
                    </button>
                  )}
                </li>
              ))}
              {!listing.folders.length && !listing.files.length && (
                <li className="compliance-empty">This Drive folder is empty.</li>
              )}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function EvidenceView({ onOpenForms }: { onOpenForms: () => void }) {
  const [selected, setSelected] = useState<EvidencePackage>(EVIDENCE_PACKAGES[0]);
  const [chainOpen, setChainOpen] = useState(false);
  const chainRef = useRef<HTMLElement>(null);
  const driveUrl = selected.drivePackage.startsWith('http') ? selected.drivePackage : null;
  const viewChain = () => {
    setChainOpen(true);
    // Instant scroll — smooth scrollIntoView silently no-ops on the V6 scroller.
    window.requestAnimationFrame(() => chainRef.current?.scrollIntoView({ block: 'center' }));
  };
  return <div className="governance-page executive-readiness-os">
    <Breadcrumb trail={['Governing Body Office', 'Evidence / CES']} />
    <PageHeading eyebrow="CES-SCOPED EVIDENCE" title="Evidence is a projection, not a duplicate store." description="This destination shows Governing Body packages and deep links by canonical identifiers. It does not mutate CES records or become a second evidence repository." action={<button className="executive-button" onClick={onOpenForms}>Annual governance forms <ArrowRight size={16} /></button>} />
    <section className="record-integrity-hero"><div><Fingerprint size={30} /><div><span>CONTROL DISTINCTION</span><strong>CES and signed packages remain authoritative.</strong><p>The portal indexes event, decision, policy, training, tabletop, and packet evidence using canonical IDs and protected access posture.</p></div></div><div className="integrity-number"><strong>{EVIDENCE_PACKAGES.length}</strong><span>open<br />packages</span></div></section>
    <section className="evidence-register ces-evidence-register"><header><div><span>GOVERNING BODY EVIDENCE PACKAGES</span><h2>Scoped CES projection</h2></div><small>policy_id · workflow_id · event_id · decision_id · form_id · evidence_id</small></header>{EVIDENCE_PACKAGES.map((item) => <article key={item.evidenceId} className={selected.evidenceId === item.evidenceId ? 'active' : ''}><span><FileText size={16} /></span><div><small>{item.evidenceId} · {item.packageType}</small><strong>{item.title}</strong><p>{item.canonicalId}</p></div><div><small>STATUS</small><strong>{item.status}</strong></div><div><small>ACCESS</small><strong>{item.access}</strong></div><button aria-label={`View evidence chain for ${item.title}`} onClick={() => { setSelected(item); viewChain(); }}><ChevronRight size={16} /></button></article>)}</section>
    <section className="evidence-actions">
      <p className="evidence-actions-context">Actions apply to <strong>{selected.evidenceId}</strong> — {selected.title}</p>
      <div className="decision-action-row">
        <ExecutiveAction label="Open in CES" onAct={() => window.location.assign('/evidence')} />
        <ExecutiveAction
          label="Open in Google Drive"
          onAct={driveUrl ? () => window.location.assign(driveUrl) : undefined}
          disabledReason={driveUrl ? undefined : 'No role-controlled Drive link is attached to this package'}
        />
        <ExecutiveAction label="View evidence chain" onAct={viewChain} />
        <ExecutiveAction label="Download approved package" disabledReason="Signed export requires the connected evidence service" />
      </div>
    </section>
    <DriveReferenceDocuments />
    <section className={`record-chain ${chainOpen ? 'open' : ''}`} ref={chainRef}>
      <span>EVIDENCE CHAIN · {selected.evidenceId}</span>
      <ol>{selected.chain.map((item, index) => <li key={item}><b>{String(index + 1).padStart(2, '0')}</b><strong>{item}</strong>{index < selected.chain.length - 1 && <i />}</li>)}</ol>
      <small>Canonical id: {selected.canonicalId} · CES path: {selected.cesPath} · status: {selected.status}</small>
    </section>
  </div>;
}

// ---------------------------------------------------------------------------
// Drawer + command palette
// ---------------------------------------------------------------------------

function DecisionReferenceMaterials({ decision }: { decision: Decision }) {
  // Spec §6: controlled documents are NEVER iframed and never re-rendered by a
  // second in-Governance viewer. A template/packet reference opens the PROTECTED
  // server URL in a new tab; the handbook opens the canonical Journey player.
  // Opening a reference is not review and not approval — approval stays in the
  // decision workflow.
  if (!decision.referenceMaterials?.length) return null;
  const returnTarget = `/governance#decisions/${encodeURIComponent(decision.id)}`;

  const openReference = (docId: GbReferenceDocId) => {
    const doc = getGbReferenceDoc(docId);
    if (doc.openMode === 'journey-player') {
      const target = journeyHandbookPlayerUrl({
        decisionId: decision.id,
        returnTo: returnTarget,
      });
      // Same tab, so browser Back returns to this exact decision drawer.
      if (target) window.location.assign(target);
      return;
    }
    window.open(protectedReferenceUrl(docId), '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="drawer-reference-materials">
      <span>BOARD REFERENCE MATERIALS</span>
      <div>
        {decision.referenceMaterials.map((reference) => {
          const doc = getGbReferenceDoc(reference.docId);
          const unconfigured = doc.openMode === 'journey-player' && journeyHandbookPlayerUrl({ decisionId: decision.id, returnTo: '' }) === null;
          return (
            <button
              key={reference.docId}
              type="button"
              onClick={unconfigured ? undefined : () => openReference(reference.docId)}
              disabled={unconfigured}
              title={unconfigured ? JOURNEY_HANDBOOK_UNCONFIGURED_REASON : undefined}
            >
              <FileText size={16} aria-hidden="true" />
              <div>
                <small>{reference.posture}</small>
                <strong>{reference.label}</strong>
                <p>{reference.detail}</p>
                {unconfigured ? <p className="reference-disabled-reason">{JOURNEY_HANDBOOK_UNCONFIGURED_REASON}</p> : null}
              </div>
              <ExternalLink size={15} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DecisionRevisionContext({ decision }: { decision: Decision }) {
  // Hooks must run unconditionally; the early return happens after them.
  const counselStatusRef = useRef<HTMLElement>(null);
  const [counselStatusHighlighted, setCounselStatusHighlighted] = useState(false);
  if (!decision.revisionContext) return null;

  const context = decision.revisionContext;
  const draftReference = decision.referenceMaterials?.find((reference) => reference.docId === 'handbook-2026-counsel-review-draft');
  const viewCounselStatus = () => {
    setCounselStatusHighlighted(true);
    // Instant scroll — smooth scrollIntoView silently no-ops on the V6 scroller.
    window.requestAnimationFrame(() => counselStatusRef.current?.scrollIntoView({ block: 'center' }));
  };

  return (
    <section className="drawer-revision-context">
      <span>HANDBOOK REVISION CONTEXT</span>
      <h3>{context.heading}</h3>
      <div className="revision-context-summary">
        {context.executiveSummary.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="decision-action-row revision-context-actions">
        <ExecutiveAction
          label="Open 2022 source handbook"
          disabledReason="2022 source handbook is not attached in this build"
        />
        {(() => {
          // Spec §6: the canonical Journey handbook player, SAME TAB, in
          // Governing Body review mode, carrying the decision id + return
          // target so browser Back lands on this exact drawer. No iframe and
          // no second handbook renderer inside Governance.
          const target = journeyHandbookPlayerUrl({
            decisionId: decision.id,
            returnTo: `/governance#decisions/${encodeURIComponent(decision.id)}`,
          });
          return target
            ? <ExecutiveAction label="Open Recommended Handbook" onAct={() => window.location.assign(target)} />
            : <ExecutiveAction label="Open Recommended Handbook" disabledReason={JOURNEY_HANDBOOK_UNCONFIGURED_REASON} />;
        })()}
        <ExecutiveAction label="View counsel-review status" onAct={viewCounselStatus} />
      </div>
      <details className="revision-context-details">
        <summary>View detailed legal and compliance findings</summary>
        <div className="revision-context-summary">
          {context.summary.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="revision-context-sections">
          {context.sections.map((section) => (
            <article key={section.title}>
              <strong>{section.title}</strong>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </details>
      <section
        ref={counselStatusRef}
        id="gb-counsel-review-status"
        className={`counsel-review-status ${counselStatusHighlighted ? 'highlighted' : ''}`}
        aria-label="Counsel-review status"
      >
        <span>COUNSEL-REVIEW STATUS</span>
        <p>
          {draftReference
            ? `${draftReference.posture} — ${draftReference.detail}`
            : 'No counsel-review reference document is attached to this decision.'}
        </p>
      </section>
    </section>
  );
}

function DecisionDrawer({ decision, onClose, onGo }: { decision: Decision; onClose: () => void; onGo: (view: ViewKey, sub?: string) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [agendaState, setAgendaState] = useState<'idle' | 'added' | 'duplicate'>('idle');
  const learnerId = useLearnerId();
  const queuedItems = useAgendaQueue(learnerId);
  const alreadyQueued = queuedItems.some((item) => item.decisionId === decision.id);
  const linkedWorkflowInstance = WORKFLOW_INSTANCES.find((instance) => decision.workflowIds.includes(instance.workflowId)) ?? null;
  const addToAgenda = () => {
    const result = addAgendaItem(learnerId, { decisionId: decision.id, title: decision.title, source: 'decision-drawer' });
    setAgendaState(result.ok ? 'added' : 'duplicate');
  };
  const goFromDrawer = (view: ViewKey, sub?: string) => onGo(view, sub);
  useEffect(() => {
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => { document.body.style.overflow = priorOverflow; };
  }, [onClose]);

  return (
    <div
      className="drawer-backdrop"
      role="presentation"
      onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}
    >
      <div className="decision-drawer executive-decision-drawer" role="dialog" aria-modal="true" aria-labelledby="decision-drawer-title">
        <header>
          <div>
            <span>{decision.id}</span>
            <small>{decision.domain}</small>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Close decision dossier">
            <X size={18} />
          </button>
        </header>
        <div className="drawer-scroll">
          <div className="drawer-posture">
            <StatusMark tone={decision.tone} />
            <span>{decision.status}</span>
            <small>{decision.due}</small>
          </div>
          <h2 id="decision-drawer-title">{decision.title}</h2>
          {decision.currentState && <p className="drawer-current-state">{decision.currentState}</p>}
          <p className="drawer-summary">{decision.summary}</p>
          <section className="drawer-recommendation">
            <span>PURPOSE</span>
            <p>{decision.purpose}</p>
          </section>
          <section className="drawer-motion">
            <span>SUGGESTED MOTION</span>
            <p>{decision.suggestedMotion}</p>
          </section>
          <DecisionReferenceMaterials decision={decision} />
          <DecisionRevisionContext decision={decision} />
          <dl>
            <div><dt>Accountable owner</dt><dd>{decision.owner}</dd></div>
            <div><dt>Authority</dt><dd>{decision.authority}</dd></div>
            <div><dt>Readiness impact</dt><dd>{decision.readinessImpact}</dd></div>
            <div><dt>Return to Board</dt><dd>{decision.returnToBoardDate}</dd></div>
            <div><dt>Effectiveness measure</dt><dd>{decision.effectivenessMeasure}</dd></div>
            <div><dt>Agenda status</dt><dd>{decision.agendaStatus}</dd></div>
          </dl>
          <section className="drawer-evidence">
            <span>REQUIRED DECISION ELEMENTS</span>
            {decision.requiredElements.map((item, index) => (
              <div key={item}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <p>{item}</p>
                <CheckCircle2 size={14} />
              </div>
            ))}
          </section>
          <section className="drawer-evidence">
            <span>EVIDENCE TO INTERROGATE</span>
            {decision.evidence.map((item, index) => (
              <div key={item}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <p>{item}</p>
                <FileCheck2 size={14} />
              </div>
            ))}
          </section>
          <section className="drawer-link-grid">
            <div>
              <span>Workflows</span>
              {decision.workflowIds.map((item) => <code key={item}>{item}</code>)}
            </div>
            <div>
              <span>Required forms</span>
              {decision.formIds.map((item) => <code key={item}>{item}</code>)}
            </div>
          </section>
          <section className="decision-action-row drawer-action-row">
            <ExecutiveAction
              label="Add to agenda"
              onAct={addToAgenda}
              confirmation={agendaState === 'added' ? 'Added to draft agenda' : agendaState === 'duplicate' || alreadyQueued ? 'Already in draft agenda' : undefined}
            />
            <ExecutiveAction label="Schedule ad hoc meeting" onAct={() => goFromDrawer('meetings', 'schedule')} />
            <ExecutiveAction
              label="Open workflow"
              onAct={linkedWorkflowInstance ? () => goFromDrawer('workflows', linkedWorkflowInstance.tab) : undefined}
              disabledReason={linkedWorkflowInstance ? undefined : 'No active workflow instance references this decision'}
            />
            <ExecutiveAction
              label="Open required forms"
              disabledReason="Form registry deep-links require the connected CES service — not available in this preview build"
            />
            <ExecutiveAction label="Open evidence view" onAct={() => goFromDrawer('evidence')} />
            <ExecutiveAction
              label="Open linked Google Drive package"
              disabledReason="No role-controlled Drive link is attached to this decision"
            />
            <ExecutiveAction label="Assign owner" disabledReason="Requires the connected CES service — not available in this preview build" />
            <ExecutiveAction label="Set due date" disabledReason="Requires the connected CES service — not available in this preview build" />
            <ExecutiveAction label="Set return-to-Board date" disabledReason="Requires the connected CES service — not available in this preview build" />
          </section>
        </div>
        <footer>
          <button className="quiet-drawer-button" onClick={onClose}>Return to docket</button>
          {agendaState === 'added' || alreadyQueued ? (
            <span className="drawer-agenda-confirmation" role="status">
              <CheckCircle2 size={15} aria-hidden="true" /> {agendaState === 'added' ? 'Added to draft agenda' : 'Already in draft agenda'}
              <small>{AGENDA_QUEUE_DISCLAIMER}</small>
            </span>
          ) : (
            <button className="executive-button" onClick={addToAgenda}>Add to agenda <Check size={15} /></button>
          )}
        </footer>
      </div>
    </div>
  );
}

function CommandPalette({ onClose, onView, onDecision, onPolicy, onModule }: { onClose: () => void; onView: (view: ViewKey, sub?: string) => void; onDecision: (decision: Decision) => void; onPolicy: (policy: PolicyJourneyRequirement) => void; onModule: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const destinations = NAV_ITEMS.filter((item) => !q || `${item.label} ${item.hint}`.toLowerCase().includes(q)).map((item) => ({ type: 'Workspace', id: item.id, title: item.label, subtitle: item.hint, action: () => onView(item.id) }));
    const decisions = ALL_DECISIONS.filter((item) => q && `${item.id} ${item.title} ${item.domain}`.toLowerCase().includes(q)).map((item) => ({ type: 'Decision', id: item.id, title: item.title, subtitle: item.status, action: () => onDecision(item) }));
    const modules = MODULES.filter((item) => q && `${item.id} ${item.title} ${item.domain}`.toLowerCase().includes(q)).map((item) => ({ type: 'Training', id: item.id, title: item.title, subtitle: item.domain, action: () => onModule(item.id) }));
    const policies = GB_POLICY_REQUIREMENTS.filter((item) => q && `${item.policyId} ${item.policyTitle} ${item.courseTitle}`.toLowerCase().includes(q)).map((item) => ({ type: 'Policy', id: item.requirementId, title: item.policyTitle.replace(' (absent from generated library)', ''), subtitle: `${item.policyId} · ${item.courseId}`, action: () => onPolicy(item) }));
    return [...destinations, ...decisions, ...policies, ...modules].slice(0, 10);
  }, [query, onView, onDecision, onPolicy, onModule]);
  useEffect(() => {
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = priorOverflow; };
  }, [onClose]);
  return <div className="command-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><section className="command-palette" role="dialog" aria-modal="true" aria-label="Search governing body workspace"><label><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a decision, policy, module, or workspace…" /><kbd>ESC</kbd></label><div>{results.length ? results.map((result) => <button key={`${result.type}:${result.id}`} onClick={result.action}><span>{result.type}</span><div><strong>{result.title}</strong><small>{result.subtitle}</small></div><ChevronRight size={15} /></button>) : <p className="command-empty">No governance record matches that search.</p>}</div><footer><span><kbd>↵</kbd> open</span><span><kbd>ESC</kbd> close</span><small>Governing Body workspace only</small></footer></section></div>;
}

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

function AppShell({ view, onView, onSearch, backgroundInert = false, children }: { view: ViewKey; onView: (view: ViewKey) => void; onSearch: () => void; backgroundInert?: boolean; children: React.ReactNode }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(() => {
    try { return localStorage.getItem('gb-v3-rail-collapsed') === 'true'; } catch { return false; }
  });
  const active = NAV_ITEMS.find((item) => item.id === view) ?? NAV_ITEMS[0];
  const groups = Array.from(new Set(NAV_ITEMS.map((item) => item.group)));
  const displayName = user?.name || user?.email || 'Governing Body member';
  const roleLabel = user?.role ? user.role.replaceAll('_', ' ') : 'Governing Body Chair';
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'GB';
  const toggleRail = () => {
    setRailCollapsed((current) => {
      const next = !current;
      try { localStorage.setItem('gb-v3-rail-collapsed', String(next)); } catch { /* ignore */ }
      return next;
    });
  };
  return <div className={`governance-app ${railCollapsed ? 'rail-collapsed' : ''}`} data-view={view} inert={backgroundInert || undefined}>
    <aside className={`governance-rail ${menuOpen ? 'open' : ''} ${railCollapsed ? 'is-collapsed' : ''}`}>
      <button className="rail-brand" onClick={() => onView('home')} aria-label="Care Indeed Governing Body home">
        <BrandCrest />
        <span><b>Care Indeed</b><small>Governing Body Office</small></span>
      </button>
      <div className="rail-profile">
        <div className="chair-avatar" aria-label={displayName}>{initials}</div>
        <div><strong>{displayName}</strong><small>{roleLabel}</small><em>Readiness posture: blocked</em></div>
      </div>
      <nav aria-label="Governing Body sections">
        {groups.map((group) => (
          <section key={group} aria-label={group}>
            <span className="rail-group-label">{group}</span>
            {NAV_ITEMS.filter((item) => item.group === group).map((item) => { const Icon = item.icon; return <button key={item.id} data-label={item.label} className={view === item.id ? 'active' : ''} onClick={() => { onView(item.id); setMenuOpen(false); }} aria-current={view === item.id ? 'page' : undefined}><Icon size={20} aria-hidden="true" /><span className="rail-label">{item.label}</span><small>{item.hint}</small></button>; })}
          </section>
        ))}
      </nav>
      <div className="rail-footer"><button onClick={onSearch} data-label="Search"><Command size={18} aria-hidden="true" /><span className="rail-label">Search</span></button><button className="rail-collapse-button" onClick={toggleRail} aria-pressed={railCollapsed} aria-label={railCollapsed ? 'Expand navigation' : 'Collapse navigation'}>{railCollapsed ? <Menu size={18} /> : <PanelLeftClose size={18} />}<span>{railCollapsed ? 'Expand' : 'Collapse'}</span></button></div>
    </aside>
    {menuOpen && <button className="mobile-rail-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
    <div className="governance-workspace">
      <header className="governance-topbar"><div className="topbar-context"><button className="mobile-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open navigation">{menuOpen ? <PanelLeftClose size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}</button><div><span>CARE INDEED / GOVERNING BODY OFFICE</span><strong>{active.label}</strong></div></div><div className="topbar-actions"><button className="command-trigger" onClick={onSearch} aria-label="Search the record"><Search size={15} aria-hidden="true" /><span>Search the record</span><kbd>Ctrl K</kbd></button><span className="executive-prototype"><CircleDot size={10} /> PREVIEW · DATA POSTURE SHOWN</span><button className="notification-button" disabled title="Notifications require the connected CES service — not available in this preview build" aria-label="Notifications — requires the connected CES service, not available in this preview build"><Bell size={17} /><i /></button><div className="topbar-profile"><span>{initials}</span><div><strong>{displayName}</strong><small>{roleLabel}</small></div></div></div></header>
      <main>{children}</main>
      <footer className="governance-footer"><span>CARE INDEED HOME HEALTH CARE</span><div><span>Governing Body Executive Readiness Office</span><i /> <span>CES projection</span><i /><span>2026 readiness preview</span></div></footer>
    </div>
  </div>;
}

export default function MyJourneyApp() {
  // ONE navigation authority (spec §2). Every view, tab, selected entity,
  // overlay, and player below is DERIVED from this route — there is no
  // competing local navigation state, no pathname parsing, and no direct
  // hash manipulation anywhere in this component.
  const { route, navigate, closeTopmost } = useGovernanceRouter();

  // ONE authoritative launch gate, evaluated unconditionally (hook rules).
  // A deep link or browser-Forward straight into an active scenario must be
  // gated exactly like clicking Start — see the TabletopSession guard below.
  const launchGate = useTabletopLaunchGate();

  const view = route.view as ViewKey;
  const complianceTab = (view === 'compliance' && route.subview && route.subview !== 'remediation'
    ? route.subview
    : 'required') as ComplianceTab;
  const meetingsTab = (view === 'meetings' ? route.subview ?? 'lifecycle' : 'lifecycle') as MeetingsTab;
  const oversightTab = (view === 'oversight' ? route.subview ?? 'qapi' : 'qapi') as OversightTab;
  const workflowTab = (view === 'workflows' ? route.subview ?? 'due' : 'due') as WorkflowTab;

  // Overlays and players, resolved from route ids to real records.
  const decision = route.overlay?.type === 'decision'
    ? DECISIONS.find((item) => item.id === route.overlay?.id) ?? null
    : null;
  const searchOpen = route.overlay?.type === 'search';

  const inCompliance = view === 'compliance';
  const academyModuleId = inCompliance && route.subview === 'training' && route.mode === 'module' ? route.entityId ?? null : null;
  const policyOpen = inCompliance && route.subview === 'policies' && route.mode === 'requirement' && route.entityId
    ? GB_POLICY_REQUIREMENTS.find((item) => item.requirementId === route.entityId) ?? null
    : null;
  const courseAssessmentId = inCompliance && route.subview === 'policies' && route.mode === 'assessment' ? route.entityId ?? null : null;
  const tabletopOpen = inCompliance && route.subview === 'tabletop';
  const tabletopLaunch = tabletopOpen && route.entityId && (route.mode === 'solo' || route.mode === 'group')
    ? { caseId: route.entityId, mode: route.mode as 'solo' | 'group' }
    : null;
  const forensicModuleId = inCompliance && route.subview === 'remediation' ? route.entityId ?? null : null;
  const formsOpen = view === 'evidence' && route.subview === 'forms';

  const go = useCallback((next: ViewKey, sub?: string) => {
    // Fill the view's default tab so every pushed entry is already canonical
    // (`#meetings` → `#meetings/lifecycle`) and Back/Forward land on a real state.
    navigate({ view: next, subview: sub ?? DEFAULT_SUBVIEW[next] });
  }, [navigate]);

  const openDecision = useCallback((next: Decision) => {
    // The dossier layers over wherever the user already is.
    navigate({ ...route, overlay: { type: 'decision', id: next.id } });
  }, [navigate, route]);

  const openModule = useCallback((id: string) => {
    navigate({ view: 'compliance', subview: 'training', mode: 'module', entityId: id });
  }, [navigate]);

  const handlers: ComplianceHandlers = useMemo(() => ({
    onOpenModule: openModule,
    onOpenPolicy: (requirement) => navigate({ view: 'compliance', subview: 'policies', mode: 'requirement', entityId: requirement.requirementId }),
    onOpenCourseAssessment: (courseId) => navigate({ view: 'compliance', subview: 'policies', mode: 'assessment', entityId: courseId }),
    onOpenTabletop: () => navigate({ view: 'compliance', subview: 'tabletop' }),
    onOpenForensic: (moduleId) => navigate({ view: 'compliance', subview: 'remediation', entityId: moduleId }),
  }), [navigate, openModule]);

  // Invalid active-case destinations are recovered in place as a Hub state
  // with a route-owned readiness overlay. This applies to direct deep links
  // and Browser Forward without creating an attempt or a new history entry.
  useEffect(() => {
    if (!tabletopLaunch || launchGate.allowed) return;
    navigate(
      {
        view: 'compliance',
        subview: 'tabletop',
        overlay: { type: 'readiness-gate', id: tabletopLaunch.caseId, mode: tabletopLaunch.mode },
      },
      { replace: true },
    );
  }, [launchGate.allowed, navigate, tabletopLaunch]);

  // Ctrl/Cmd-K opens search as a real history entry; Escape closes the topmost
  // transient layer with exactly the same result as browser Back (spec §2).
  useEffect(() => {
    const onKeyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        navigate({ ...route, overlay: { type: 'search' } });
        return;
      }
      // The readiness modal owns its Escape handler so standalone tests and
      // the route-owned close happen exactly once.
      if (event.key === 'Escape' && route.overlay?.type === 'readiness-gate') return;
      if (event.key === 'Escape' && (route.overlay || route.entityId)) {
        event.preventDefault();
        closeTopmost();
      }
    };
    window.addEventListener('keydown', onKeyboard);
    return () => window.removeEventListener('keydown', onKeyboard);
  }, [navigate, closeTopmost, route]);

  // Full-screen players replace the shell. Each exit uses closeTopmost() so an
  // in-app "exit" and browser Back produce the same navigation result, and the
  // player's own unmount cleanup releases body lock / persists its draft.
  if (academyModuleId) return <Suspense fallback={<div className="academy-loading"><BrandCrest /><strong>Opening the Governance Institute</strong><span>Preparing the executive decision laboratory…</span></div>}><GoverningBodyAcademy initialModuleId={academyModuleId} onExitJourney={closeTopmost} /></Suspense>;
  if (policyOpen) return <Suspense fallback={<div className="academy-loading"><BrandCrest /><strong>Opening the controlled policy</strong><span>Preparing the executive reading room…</span></div>}><GoverningBodyPolicyPlayer key={policyOpen.requirementId} requirement={policyOpen} onExit={closeTopmost} /></Suspense>;
  if (courseAssessmentId) return <Suspense fallback={<div className="academy-loading"><BrandCrest /><strong>Opening the course assessment</strong><span>Preparing the controlled assessment…</span></div>}><CourseAssessmentPlayer key={courseAssessmentId} courseId={courseAssessmentId} onExit={closeTopmost} /></Suspense>;
  if (tabletopOpen) {
    const fallback = <div className="academy-loading"><BrandCrest /><strong>Opening the Boardroom Simulation</strong><span>Assembling the 2026 Governing Body case record…</span></div>;
    // Deep link / Forward restore into an ACTIVE scenario is gated identically
    // to pressing Start: no attempt, timer, draft, score, or evidence is
    // created for an ineligible learner — they land on the Hub with the
    // readiness modal (which is itself a history entry).
    if (tabletopLaunch && !launchGate.allowed) {
      return <Suspense fallback={fallback}><TabletopHub
        onExit={closeTopmost}
        onLaunch={(caseId, mode) => navigate({ view: 'compliance', subview: 'tabletop', entityId: caseId, mode })}
        gateOverlay={{ caseId: tabletopLaunch.caseId, mode: tabletopLaunch.mode }}
        onGoToCompliance={() => navigate({ view: 'compliance', subview: 'required' })}
        onNavigateToBlocker={(destination) => navigate(parseGovernanceRoute(destination).state)}
        onCloseGate={closeTopmost}
      /></Suspense>;
    }
    if (tabletopLaunch?.mode === 'group') {
      return <Suspense fallback={fallback}><FacilitatedGroupSession key={`${tabletopLaunch.caseId}:group`} caseId={tabletopLaunch.caseId} accessMode={launchGate.accessMode} onExit={closeTopmost} /></Suspense>;
    }
    if (tabletopLaunch) return <Suspense fallback={fallback}><TabletopSession key={`${tabletopLaunch.caseId}:solo`} caseId={tabletopLaunch.caseId} mode="solo" accessMode={launchGate.accessMode} onExit={closeTopmost} /></Suspense>;
    return <Suspense fallback={fallback}><TabletopHub
      onExit={closeTopmost}
      onLaunch={(caseId, mode) => navigate({ view: 'compliance', subview: 'tabletop', entityId: caseId, mode })}
      onBlockedLaunch={(caseId, mode) => navigate({ view: 'compliance', subview: 'tabletop', overlay: { type: 'readiness-gate', id: caseId, mode } })}
      gateOverlay={
        route.overlay?.type === 'readiness-gate' && route.overlay.id && (route.overlay.mode === 'solo' || route.overlay.mode === 'group')
          ? { caseId: route.overlay.id, mode: route.overlay.mode }
          : null
      }
      onGoToCompliance={() => navigate({ view: 'compliance', subview: 'required' })}
      onNavigateToBlocker={(destination) => navigate(parseGovernanceRoute(destination).state)}
      onCloseGate={closeTopmost}
    /></Suspense>;
  }
  if (formsOpen) return <Suspense fallback={<div className="academy-loading"><BrandCrest /><strong>Opening annual governance forms</strong><span>Preparing the controlled forms workspace…</span></div>}><AnnualGovernanceForms onExit={closeTopmost} /></Suspense>;
  if (forensicModuleId) return <Suspense fallback={<div className="academy-loading"><BrandCrest /><strong>Opening forensic remediation</strong><span>Preparing the controlled True/False form…</span></div>}><TrueFalseForensicPlayer moduleId={forensicModuleId} onExit={closeTopmost} /></Suspense>;

  const content = (() => {
    if (view === 'compliance') return <MyComplianceView tab={complianceTab} onTab={(t) => navigate({ view: 'compliance', subview: t })} handlers={handlers} />;
    if (view === 'meetings') return <MeetingsView tab={meetingsTab} onTab={(t) => navigate({ view: 'meetings', subview: t })} onDecision={openDecision} />;
    if (view === 'decisions') return <DecisionsView onDecision={openDecision} onGo={go} />;
    if (view === 'workflows') return <WorkflowsView tab={workflowTab} selectedInstanceId={route.entityId} onTab={(t) => navigate({ view: 'workflows', subview: t })} onSelect={(item) => navigate({ view: 'workflows', subview: workflowTab, entityId: item.instanceId })} onDecision={openDecision} onGo={go} />;
    if (view === 'oversight') return <OversightView tab={oversightTab} period={route.mode} onTab={(t) => navigate({ view: 'oversight', subview: t, mode: route.mode })} onPeriod={(period) => navigate({ view: 'oversight', subview: oversightTab, mode: period })} onDecision={openDecision} onOpenTabletop={handlers.onOpenTabletop} />;
    if (view === 'evidence') return <EvidenceView onOpenForms={() => navigate({ view: 'evidence', subview: 'forms' })} />;
    return <HomeView onGo={go} handlers={handlers} />;
  })();

  return <>
    <AppShell view={view} backgroundInert={Boolean(decision || searchOpen)} onView={(v) => go(v)} onSearch={() => navigate({ ...route, overlay: { type: 'search' } })}>{content}</AppShell>
    {decision && <DecisionDrawer decision={decision} onClose={closeTopmost} onGo={go} />}
    {searchOpen && <CommandPalette onClose={closeTopmost} onView={go} onDecision={openDecision} onPolicy={(requirement) => navigate({ view: 'compliance', subview: 'policies', mode: 'requirement', entityId: requirement.requirementId })} onModule={openModule} />}
  </>;
}
