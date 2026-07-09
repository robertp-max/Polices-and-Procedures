import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowDown, ArrowUp, BarChart3, CalendarClock, CheckCircle2, FileCheck2, GripVertical, LockKeyhole, Plus, ShieldCheck, Trash2, Users } from 'lucide-react';
import { DataTable, MetricGrid, ProgressMeter, SurfaceCard, ToneTag, toneBarClasses, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { Button, ToneBadge, Input, Textarea } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';
import type { JourneyEscalation } from '@/policy/journey/types/journey';
import { humanEscalation } from '@/policy/journey/utils/escalation';

interface SyllabusRow extends Record<string, string> {
  catalogId: string;
  evidence: string;
  expires: string;
  owner: string;
  policyRef: string;
  status: string;
  title: string;
  trigger: string;
}

interface ReviewQueueRow extends Record<string, string> {
  age: string;
  cohort: string;
  owner: string;
  queueId: string;
  status: string;
  subject: string;
  type: string;
}

interface TrendPoint {
  detail: string;
  label: string;
  tone: Tone;
  value: number;
}

interface GatePanel {
  detail: string;
  label: string;
  status: string;
  tone: Tone;
  value: number;
}

interface GovernanceCard extends SurfaceCardData {
  meta: readonly [string, string][];
}

const journeyAdminMetrics = [
  { label: 'Active cohorts', value: '14', helper: 'RN, LVN, HHA, PT and OT tracks', tone: 'teal' },
  { label: 'On track', value: '82%', helper: 'Cohort completion health', tone: 'green' },
  { label: 'Overrides', value: '5', helper: 'Dual-signature reviews open', tone: 'orange' },
  { label: 'Review queue', value: '9', helper: 'Catalog and evidence checks', tone: 'amber' },
] satisfies readonly MetricTileData[];

const syllabusRows: readonly SyllabusRow[] = [
  {
    catalogId: 'GAO-001',
    evidence: 'Learner attestation',
    expires: 'Annual refresh',
    owner: 'Training Coordinator',
    policyRef: 'HR-TA-005',
    status: 'ready',
    title: 'Agency mission, values, and care model',
    trigger: 'All new hires',
  },
  {
    catalogId: 'HR-APP-F',
    evidence: 'HR Director signature',
    expires: 'At hire',
    owner: 'HR Credentialing',
    policyRef: 'HR-TA-001 Appendix F',
    status: 'locked',
    title: 'Pre-employment hard-stop checklist',
    trigger: 'Pre-Day-1 clearance',
  },
  {
    catalogId: 'GAO-007',
    evidence: 'Quiz certificate',
    expires: 'Annual refresh',
    owner: 'Compliance Officer',
    policyRef: 'CO-HP-001',
    status: 'active',
    title: 'HIPAA privacy and minimum necessary',
    trigger: 'All workforce members',
  },
  {
    catalogId: 'RN-008',
    evidence: 'Skills checkoff',
    expires: '24 months',
    owner: 'Director of Nursing',
    policyRef: 'CL-SD-012',
    status: 'review-required',
    title: 'Medication management and reconciliation',
    trigger: 'RN and LVN field role',
  },
  {
    catalogId: 'RN-SUP',
    evidence: 'Appendix E visit log',
    expires: 'Before independent work',
    owner: 'Preceptor Supervisor',
    policyRef: 'HR-TA-005 App B',
    status: 'awaiting',
    title: 'Supervised patient visits',
    trigger: 'Clinical clearance gate',
  },
  {
    catalogId: 'ANN-001',
    evidence: 'eCIgn attestation',
    expires: 'Annual cycle',
    owner: 'Onboarding Admin',
    policyRef: 'CO-CP-001',
    status: 'pending',
    title: 'Code of conduct and compliance program',
    trigger: 'Annual recertification',
  },
];

const syllabusColumns: readonly DataTableColumn<SyllabusRow>[] = [
  { key: 'catalogId', label: 'Catalog ID' },
  { key: 'title', label: 'Syllabus item' },
  { key: 'trigger', label: 'Trigger' },
  { key: 'owner', label: 'Owner' },
  { key: 'policyRef', label: 'Policy ref' },
  { key: 'evidence', label: 'Evidence' },
  { key: 'expires', label: 'Expires' },
  { key: 'status', label: 'Status', status: true },
];

const completionTrend: readonly TrendPoint[] = [
  { detail: 'Pre-Day-1 clearance', label: 'Week 0', tone: 'green', value: 94 },
  { detail: 'GAO modules', label: 'Week 1', tone: 'teal', value: 86 },
  { detail: 'Role modules', label: 'Week 2', tone: 'teal', value: 78 },
  { detail: 'Supervised visits', label: 'Week 3', tone: 'orange', value: 62 },
  { detail: 'Final clearance', label: 'Week 4', tone: 'amber', value: 58 },
  { detail: 'Annual carry-forward', label: 'Annual', tone: 'teal', value: 81 },
];

const gatePanels = [
  {
    detail: 'Appendix F, background, OIG/SAM, license, and offer-letter checks before orientation access.',
    label: 'Pre-Day-1 hard stop',
    status: 'locked',
    tone: 'slate',
    value: 96,
  },
  {
    detail: 'GAO completion, competency quiz, policy attestations, and evidence hashes for new-hire cohorts.',
    label: 'GAO readiness',
    status: 'ready',
    tone: 'teal',
    value: 84,
  },
  {
    detail: 'Role-specific medication, OASIS, skills checkoff, and field-readiness assignments by discipline.',
    label: 'Role modules',
    status: 'review-required',
    tone: 'orange',
    value: 67,
  },
  {
    detail: 'Preceptor visit logs and dual signatures before independent patient work is released.',
    label: 'Supervisor sign-off',
    status: 'awaiting',
    tone: 'amber',
    value: 52,
  },
] satisfies readonly GatePanel[];

const reviewQueueRows: readonly ReviewQueueRow[] = [
  {
    age: '2 days',
    cohort: 'June RN hires',
    owner: 'Director of Nursing',
    queueId: 'RQ-184',
    status: 'review-required',
    subject: 'Medication skills checkoff rubric',
    type: 'Syllabus change',
  },
  {
    age: 'Today',
    cohort: 'All new hires',
    owner: 'HR Credentialing',
    queueId: 'RQ-187',
    status: 'awaiting',
    subject: 'Appendix F license verification evidence',
    type: 'Evidence hold',
  },
  {
    age: '1 day',
    cohort: 'Annual refresh',
    owner: 'Compliance Officer',
    queueId: 'RQ-192',
    status: 'ready',
    subject: 'HIPAA annual certificate mapping',
    type: 'Regulatory map',
  },
  {
    age: '3 days',
    cohort: 'Clinical clearance',
    owner: 'Preceptor Supervisor',
    queueId: 'RQ-204',
    status: 'pending',
    subject: 'Supervised visit attestation packet',
    type: 'Dual signature',
  },
  {
    age: '4 days',
    cohort: 'HHA bridge',
    owner: 'Onboarding Admin',
    queueId: 'RQ-209',
    status: 'warning',
    subject: 'Catalog expiration rule QA',
    type: 'Governance override',
  },
];

const reviewQueueColumns: readonly DataTableColumn<ReviewQueueRow>[] = [
  { key: 'queueId', label: 'Queue ID' },
  { key: 'subject', label: 'Review subject' },
  { key: 'type', label: 'Type' },
  { key: 'cohort', label: 'Cohort' },
  { key: 'owner', label: 'Owner' },
  { key: 'age', label: 'Age' },
  { key: 'status', label: 'Status', status: true },
];

const governanceCards = [
  {
    body: 'Five active exceptions keep catalog item, learner group, reason code, approver pair, and expiration visible before release.',
    icon: AlertTriangle,
    meta: [
      ['Active exceptions', '5 open, 2 due today'],
      ['Reason codes', 'Evidence hold, role transfer, annual grace'],
      ['Release rule', 'Dual signature plus expiry date'],
    ],
    progress: 62,
    status: 'review-required',
    title: 'Override governance',
    tone: 'orange',
  },
  {
    body: 'Catalog edits require named owner review, effective date, impacted cohorts, and evidence-retention confirmation.',
    icon: LockKeyhole,
    meta: [
      ['Approvers', 'Training Coordinator and Compliance Officer'],
      ['Audit trail', 'Before and after rule snapshot'],
      ['Current lock', 'Clinical clearance rules'],
    ],
    progress: 88,
    status: 'locked',
    title: 'Catalog change control',
    tone: 'slate',
  },
  {
    body: 'Syllabus rows stay mapped to HR, compliance, clinical, and ACHC support references for survey-ready reports.',
    icon: ShieldCheck,
    meta: [
      ['Mapped rows', '47 of 51 required items'],
      ['Evidence target', 'Certificate, attestation, checkoff, visit log'],
      ['Survey export', 'Ready after open queue closure'],
    ],
    progress: 93,
    status: 'validated',
    title: 'Regulatory coverage',
    tone: 'green',
  },
] satisfies readonly GovernanceCard[];

const regulatoryRefs = [
  ['HR-TA-001 Appendix F', 'Pre-employment hard stop and HR Director sign-off', 'locked'],
  ['HR-TA-005 Appendix B', 'Clearance gates and supervisor sign-off', 'ready'],
  ['CO-HP-001 / 45 CFR 164', 'HIPAA privacy and PHI handling', 'validated'],
  ['CL-SD-012 / CL-SD-013', 'Medication management and reconciliation competencies', 'review-required'],
] as const;

const cohortPanels = [
  { icon: Users, label: 'June RN cohort', status: 'active', value: '18 learners' },
  { icon: CalendarClock, label: 'Next expiration sweep', status: 'pending', value: 'Jun 28, 2026' },
  { icon: CheckCircle2, label: 'Ready for clearance', status: 'ready', value: '11 learners' },
  { icon: FileCheck2, label: 'Evidence packets', status: 'uploaded', value: '41 attached' },
] as const;

function escalationSeverityTone(severity: JourneyEscalation['severity']): Tone {
  if (severity === 'CRITICAL') return 'red';
  if (severity === 'WARN') return 'amber';
  return 'teal';
}

function escalationStatusBadge(status: JourneyEscalation['status']): string {
  if (status === 'Open') return 'review-required';
  if (status === 'Acknowledged') return 'active';
  return 'ready';
}

export function JourneyAdminScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  type JourneyAdminTab = 'overview' | 'syllabus' | 'review' | 'governance' | 'builder' | 'escalations';
  const requestedTab = searchParams.get('tab');
  const activeTab: JourneyAdminTab =
    requestedTab === 'syllabus'
    || requestedTab === 'review'
    || requestedTab === 'governance'
    || requestedTab === 'builder'
    || requestedTab === 'escalations'
      ? requestedTab
      : 'overview';
  const setActiveTab = (tab: JourneyAdminTab) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('tab', tab);
      return next;
    });
  };

  // Live escalations from journeyStore (Phase 2D). Demo/local-only until 2F backend.
  const escalations = useJourneyStore((s) => s.escalations);
  const employees = useJourneyStore((s) => s.employees);
  const recomputeEscalations = useJourneyStore((s) => s.recomputeEscalations);
  const acknowledgeEscalation = useJourneyStore((s) => s.acknowledgeEscalation);
  const resolveEscalation = useJourneyStore((s) => s.resolveEscalation);

  useEffect(() => {
    recomputeEscalations();
  }, [recomputeEscalations]);

  const employeeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of employees) map.set(e.id, e.name);
    return map;
  }, [employees]);

  const sortedEscalations = useMemo(() => {
    const severityRank: Record<JourneyEscalation['severity'], number> = {
      CRITICAL: 0,
      WARN: 1,
      INFO: 2,
    };
    const statusRank: Record<JourneyEscalation['status'], number> = {
      Open: 0,
      Acknowledged: 1,
      Resolved: 2,
    };
    return [...escalations].sort((a, b) => {
      const s = statusRank[a.status] - statusRank[b.status];
      if (s !== 0) return s;
      return severityRank[a.severity] - severityRank[b.severity];
    });
  }, [escalations]);

  const openEscalationCount = escalations.filter((e) => e.status === 'Open').length;
  const criticalOpenCount = escalations.filter(
    (e) => e.status === 'Open' && e.severity === 'CRITICAL',
  ).length;
  const [courseTitle, setCourseTitle] = useState('RN General Orientation and supervised clearance');
  const [roleTrack, setRoleTrack] = useState('Registered Nurse - new hire');
  const [targetTimeline, setTargetTimeline] = useState('30 calendar days with 2 supervised visits');
  const [builderNotes, setBuilderNotes] = useState(
    'Uses existing Journey modules, policy references, and eCIgn-ready attestation forms.'
  );

  const [sequence, setSequence] = useState<readonly {
    readonly order: number;
    readonly code: string;
    readonly title: string;
    readonly requirement: 'Required' | 'Optional';
    readonly refs: readonly string[];
  }[]>([
    { order: 1, code: 'GAO-001', title: 'Agency mission and patient rights', requirement: 'Required', refs: ['HR-TA-005', 'EN-FM-001'] },
    { order: 2, code: 'GAO-013', title: 'Infection prevention and PPE', requirement: 'Required', refs: ['CL-SD-016', 'HR-FM-016'] },
    { order: 3, code: 'RN-SUP', title: 'Supervised patient visits', requirement: 'Required', refs: ['HR-TA-005', 'HRTA005_E'] },
    { order: 4, code: 'ANN-001', title: 'Annual refresh bundle', requirement: 'Optional', refs: ['HR-TD-003', 'EN-FM-014'] },
  ]);

  const handleBackToJourney = () => navigate('/journey');

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSeq = [...sequence];
    const temp = newSeq[index];
    newSeq[index] = newSeq[index - 1];
    newSeq[index - 1] = temp;
    setSequence(newSeq.map((item, i) => ({ ...item, order: i + 1 })));
  };

  const moveDown = (index: number) => {
    if (index === sequence.length - 1) return;
    const newSeq = [...sequence];
    const temp = newSeq[index];
    newSeq[index] = newSeq[index + 1];
    newSeq[index + 1] = temp;
    setSequence(newSeq.map((item, i) => ({ ...item, order: i + 1 })));
  };

  const removeModule = (index: number) => {
    const newSeq = sequence.filter((_, i) => i !== index);
    setSequence(newSeq.map((item, i) => ({ ...item, order: i + 1 })));
  };

  const addModule = () => {
    const nextNum = sequence.length + 1;
    const newModule = {
      order: nextNum,
      code: `GAO-0${nextNum + 10}`,
      title: 'New Onboarding Module',
      requirement: 'Required' as const,
      refs: ['HR-TA-005'],
    };
    setSequence([...sequence, newModule]);
  };

  const toggleRequirement = (index: number) => {
    const newSeq = [...sequence];
    newSeq[index] = {
      ...newSeq[index],
      requirement: newSeq[index].requirement === 'Required' ? 'Optional' : 'Required',
    };
    setSequence(newSeq);
  };

  return (
    <section
      className="grid gap-xl"
      data-group="Onboarding"
      data-hash-id="journey-admin"
      data-route="/journey/admin"
      data-template="reports"
    >
      {/* Tab Segment Controls */}
      <div className="flex flex-wrap items-center justify-between gap-lg mb-sm">
        <div className="inline-flex rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-xs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'syllabus', label: 'Syllabus Catalog' },
            { id: 'review', label: 'Review Queues' },
            { id: 'escalations', label: openEscalationCount > 0 ? `Escalations (${openEscalationCount})` : 'Escalations' },
            { id: 'governance', label: 'Governance & Refs' },
            { id: 'builder', label: 'Syllabus Builder' },
          ].map((tab) => (
            <button
              className={cx(
                'min-h-tap rounded-md px-lg text-sm transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                activeTab === tab.id
                  ? 'bg-surface-glass backdrop-blur-md shadow-glass-inset text-brand-teal shadow-rest'
                  : 'text-secondary hover:bg-surface-hover',
              )}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as JourneyAdminTab)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end -mt-sm mb-sm">
        <Button size="sm" variant="tertiary" onClick={handleBackToJourney}>Back to Journey Overview</Button>
      </div>

      {activeTab === 'builder' ? (
        <section className="grid gap-xl desktop:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Left Column: Course details */}
          <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest flex flex-col justify-between">
            <div className="grid gap-md">
              <div className="flex items-center gap-sm">
                <ToneBadge status="active" />
                <h3 className="text-h2 font-medium text-ink">Course path builder</h3>
              </div>
              <p className="text-xs font-light text-muted">
                Define the onboarding path, course details, timeline parameters, and reference notes.
              </p>
              <div className="grid gap-md">
                <div className="grid gap-xs">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-brand-teal">Course title</span>
                  <Input
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                  />
                </div>
                <div className="grid gap-xs">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-brand-teal">Role track</span>
                  <Input
                    value={roleTrack}
                    onChange={(e) => setRoleTrack(e.target.value)}
                  />
                </div>
                <div className="grid gap-xs">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-brand-teal">Target timeline</span>
                  <Input
                    value={targetTimeline}
                    onChange={(e) => setTargetTimeline(e.target.value)}
                  />
                </div>
                <div className="grid gap-xs">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-brand-teal">Builder notes</span>
                  <Textarea
                    className="h-24 resize-none"
                    value={builderNotes}
                    onChange={(e) => setBuilderNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="mt-xl flex flex-wrap gap-sm">
              <Button
                onClick={() => setActiveTab('overview')}
                variant="primary"
                className="border-tone-orange-border bg-tone-orange-bg text-tone-orange-text hover:bg-tone-orange-bg/80"
              >
                Publish syllabus
              </Button>
              <Button onClick={() => setActiveTab('overview')} variant="secondary">
                Save draft
              </Button>
            </div>
          </div>

          {/* Right Column: Module sequence */}
          <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest">
            <div className="flex flex-wrap items-center justify-between gap-md mb-lg">
              <div className="grid gap-xs">
                <h3 className="text-h2 font-medium text-ink">Module sequence</h3>
                <p className="text-xs font-light text-muted">
                  Drag, reorder, or toggle sequence options.
                </p>
              </div>
              <Button
                iconLeft={<Plus className="h-icon-sm w-icon-sm" />}
                size="sm"
                onClick={addModule}
              >
                Add module
              </Button>
            </div>
            <div className="grid gap-md">
              {sequence.map((item, index) => (
                <div
                  key={item.code}
                  className="rounded-md border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-md flex flex-col gap-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-md">
                     <div className="flex items-start gap-sm">
                      <GripVertical className="mt-xs h-icon-sm w-icon-sm text-muted cursor-grab" />
                      <div className="grid gap-xs">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-tone-orange-text">
                          Step {item.order} - {item.code}
                        </span>
                        <h4 className="text-sm font-medium text-ink">{item.title}</h4>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleRequirement(index)}
                      className="focus:outline-none"
                    >
                      <ToneTag tone={item.requirement === 'Required' ? 'orange' : 'teal'}>
                        {item.requirement}
                      </ToneTag>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-xs">
                    {item.refs.map((ref) => (
                      <span
                        key={ref}
                        className="rounded-full border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-brand-teal"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-xs mt-xs pt-sm border-t border-hairline">
                    <Button
                      size="sm"
                      variant="tertiary"
                      iconLeft={<ArrowUp className="h-icon-xs w-icon-xs" />}
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                    >
                      Move up
                    </Button>
                    <Button
                      size="sm"
                      variant="tertiary"
                      iconLeft={<ArrowDown className="h-icon-xs w-icon-xs" />}
                      onClick={() => moveDown(index)}
                      disabled={index === sequence.length - 1}
                    >
                      Move down
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      iconLeft={<Trash2 className="h-icon-xs w-icon-xs" />}
                      onClick={() => removeModule(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="grid gap-xl">
              <MetricGrid metrics={journeyAdminMetrics} />
              <section className="grid gap-xl desktop:grid-cols-1">
                <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest" aria-labelledby="cohort-trend-title">
                  <div className="flex flex-wrap items-start justify-between gap-lg">
                    <div className="grid gap-xs">
                      <h2 className="text-h2 font-medium text-ink" id="cohort-trend-title">
                        Cohort completion trend
                      </h2>
                      <p className="max-w-content text-sm font-light text-muted">
                        Chart-style completion report across onboarding gates, showing where catalog administrators need to tune
                        triggers or review evidence.
                      </p>
                    </div>
                    <ToneBadge size="sm" status="active" />
                  </div>

                  <div className="mt-lg rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg">
                    <div className="flex h-[220px] items-end gap-md" aria-label="Cohort completion percentages">
                      {completionTrend.map((point) => (
                        <div className="flex h-full min-w-tap flex-1 flex-col justify-end gap-sm" key={point.label}>
                          <div
                            aria-label={`${point.label}: ${point.value}% ${point.detail}`}
                            className={`${toneBarClasses[point.tone]} min-h-sm rounded-t-md`}
                            role="img"
                            style={{ height: `${point.value}%` }}
                          />
                          <div className="grid gap-xs text-center">
                            <span className="text-xs font-light text-ink">{point.label}</span>
                            <span className="text-xs font-light tabular-nums text-muted">{point.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="grid gap-md" aria-label="Gate readiness progress">
                  {gatePanels.map((gate) => (
                    <article className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg overflow-hidden shadow-rest" key={gate.label}>
                      <div className="mb-md flex flex-wrap items-start justify-between gap-md">
                        <div className="grid gap-xs">
                          <p className="text-tag font-light uppercase tracking-tag text-muted">{gate.label}</p>
                          <p className="text-sm font-light text-secondary">{gate.detail}</p>
                        </div>
                        <ToneBadge size="sm" status={gate.status} />
                      </div>
                      <ProgressMeter label="Gate readiness" tone={gate.tone} value={gate.value} />
                    </article>
                  ))}
                </section>
              </section>
            </div>
          )}

          {activeTab === 'syllabus' && (
            <section className="grid gap-lg" aria-labelledby="syllabus-report-title">
              <div className="flex flex-wrap items-start justify-between gap-lg">
                <div className="grid gap-xs">
                  <h2 className="text-h2 font-medium text-ink" id="syllabus-report-title">
                    Onboarding syllabus report
                  </h2>
                  <p className="max-w-content text-sm font-light text-muted">
                    Static catalog rows for certifications, triggers, owners, evidence requirements, and expiration logic.
                  </p>
                </div>
                <ToneTag tone="orange">2 items need review</ToneTag>
              </div>
              <DataTable columns={syllabusColumns} label="Journey admin onboarding syllabus report" rows={syllabusRows} />
            </section>
          )}

          {activeTab === 'review' && (
            <section className="grid gap-lg" aria-labelledby="review-queue-title">
              <div className="flex flex-wrap items-start justify-between gap-lg">
                <div className="grid gap-xs">
                  <h2 className="text-h2 font-medium text-ink" id="review-queue-title">
                    Review queues
                  </h2>
                  <p className="max-w-content text-sm font-light text-muted">
                    Catalog changes, evidence holds, expiration QA, and dual-signature items queued for onboarding governance.
                  </p>
                </div>
                <ToneBadge size="sm" status="review-required" />
              </div>
              <DataTable columns={reviewQueueColumns} label="Journey admin review queue" rows={reviewQueueRows} />
            </section>
          )}

          {activeTab === 'escalations' && (
            <section className="grid gap-lg" aria-labelledby="escalations-report-title">
              <div className="flex flex-wrap items-start justify-between gap-lg">
                <div className="grid gap-xs">
                  <h2 className="text-h2 font-medium text-ink" id="escalations-report-title">
                    Escalations &amp; credential deadlines
                  </h2>
                  <p className="max-w-content text-sm font-light text-muted">
                    Live tickets from the journey escalation engine (HR-TD-001 overdue tiers, license
                    expiry, Appendix F, remediation). Demo/local-only — persisted in browser storage
                    until Phase 2F backend. Deadlines honor module <code className="text-xs">annualQuarter</code>{' '}
                    (Q1–Q4) or hire/first-day anniversary for untagged annual modules.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-sm">
                  <ToneTag tone={criticalOpenCount > 0 ? 'red' : openEscalationCount > 0 ? 'amber' : 'green'}>
                    {openEscalationCount} open · {criticalOpenCount} critical
                  </ToneTag>
                  <Button size="sm" variant="secondary" type="button" onClick={() => recomputeEscalations()}>
                    Recompute
                  </Button>
                </div>
              </div>

              {sortedEscalations.length === 0 ? (
                <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl text-center">
                  <CheckCircle2 className="mx-auto mb-md h-icon-lg w-icon-lg text-brand-teal" aria-hidden="true" />
                  <p className="text-sm font-medium text-ink">No escalations on file</p>
                  <p className="mt-xs text-xs font-light text-muted">
                    Recompute after seeding learners or changing attempts to refresh.
                  </p>
                </div>
              ) : (
                <ul className="grid gap-md" aria-label="Escalation tickets">
                  {sortedEscalations.map((esc) => {
                    const empName = employeeNameById.get(esc.employeeId) ?? esc.employeeId;
                    const canAct = esc.status === 'Open' || esc.status === 'Acknowledged';
                    return (
                      <li
                        key={esc.id}
                        className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg overflow-hidden shadow-rest"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-md">
                          <div className="grid gap-xs min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-sm">
                              <ToneTag tone={escalationSeverityTone(esc.severity)}>{esc.severity}</ToneTag>
                              <ToneBadge size="sm" status={escalationStatusBadge(esc.status)} />
                              <span className="text-tag font-medium uppercase tracking-tag text-brand-teal">
                                {esc.type}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-ink">
                              {empName}
                              {esc.moduleId ? (
                                <span className="font-light text-muted"> · {esc.moduleId}</span>
                              ) : null}
                            </p>
                            <p className="text-sm font-light text-secondary">{humanEscalation(esc)}</p>
                            <p className="text-xs font-light text-muted">
                              Policy: {esc.policyRef}
                              {' · '}
                              Triggered: {new Date(esc.triggerAt).toLocaleString()}
                              {esc.resolvedBy ? ` · Resolved by ${esc.resolvedBy}` : ''}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-sm shrink-0">
                            {esc.status === 'Open' ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                type="button"
                                onClick={() => acknowledgeEscalation(esc.id, 'Journey Admin')}
                              >
                                Acknowledge
                              </Button>
                            ) : null}
                            {canAct && esc.status !== 'Resolved' ? (
                              <Button
                                size="sm"
                                variant="primary"
                                type="button"
                                onClick={() => resolveEscalation(esc.id, 'Journey Admin')}
                              >
                                Resolve
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          {activeTab === 'governance' && (
            <section className="grid gap-xl desktop:grid-cols-12">
              <div className="grid content-start gap-lg desktop:col-span-8">
                <section className="grid gap-md tablet-p:grid-cols-2" aria-label="Cohort operating metrics">
                  {cohortPanels.map((panel) => {
                    const Icon = panel.icon;

                    return (
                      <article className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg overflow-hidden shadow-rest" key={panel.label}>
                        <div className="mb-md flex items-start justify-between gap-md">
                          <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-brand-teal">
                            <Icon aria-hidden="true" className="h-icon-md w-icon-md" />
                          </span>
                          <ToneBadge size="sm" status={panel.status} />
                        </div>
                        <p className="text-tag font-light uppercase tracking-tag text-muted">{panel.label}</p>
                        <p className="mt-xs text-h3 font-light text-ink">{panel.value}</p>
                      </article>
                    );
                  })}
                </section>

                <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest mt-lg" aria-labelledby="mapped-regulatory-title">
                  <div className="mb-lg flex items-start gap-md">
                    <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-green-bg text-tone-green-text">
                      <BarChart3 aria-hidden="true" className="h-icon-md w-icon-md" />
                    </span>
                    <div className="grid gap-xs">
                      <h2 className="text-h2 font-medium text-ink" id="mapped-regulatory-title">
                        Mapped regulatory refs
                      </h2>
                      <p className="text-sm font-light text-muted">
                        Right-rail reference summary for the reports template and journey admin catalog.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-sm">
                    {regulatoryRefs.map(([label, detail, status]) => (
                      <div className="grid gap-sm rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md" key={label}>
                        <div className="flex flex-wrap items-start justify-between gap-md">
                          <p className="text-tag font-light uppercase tracking-tag text-brand-teal">{label}</p>
                          <ToneBadge size="sm" status={status} />
                        </div>
                        <p className="text-sm font-light text-secondary">{detail}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Journey admin governance and regulatory references">
                {governanceCards.map((card) => (
                  <SurfaceCard card={card} key={card.title}>
                    <dl className="grid gap-sm border-t border-hairline pt-md">
                      {card.meta.map(([label, value]) => (
                        <div className="grid gap-xs" key={label}>
                          <dt className="text-tag font-light uppercase tracking-tag text-brand-teal">{label}</dt>
                          <dd className="text-sm font-light text-secondary">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </SurfaceCard>
                ))}
              </aside>
            </section>
          )}
        </>
      )}
    </section>
  );
}

export default JourneyAdminScreen;
