import { useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, BarChart3, CalendarClock, CheckCircle2, FileCheck2, GripVertical, LockKeyhole, Plus, ShieldCheck, Trash2, Users } from 'lucide-react';
import { DataTable, MetricGrid, ProgressMeter, SurfaceCard, ToneTag, toneBarClasses, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { Button, ToneBadge, Input, Textarea } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';
import { ALL_MODULES } from '@/policy/journey/data/modules';
import { SEED_EMPLOYEES } from '@/policy/journey/data/employees';
import type { JourneyModule } from '@/policy/journey/types/journey';

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

const roleLabel = (roles: JourneyModule['roles']): string =>
  roles === 'ALL' ? 'All roles' : roles.join(', ');

const groupTrigger = (m: JourneyModule): string => {
  switch (m.group) {
    case 'GAO':
      return 'All new hires';
    case 'ROLE':
      return m.phase === 'SUPERVISED' ? 'Clinical clearance gate' : `Role onboarding — ${roleLabel(m.roles)}`;
    case 'ANN':
      return 'Annual recertification';
    case 'DRILL':
      return 'Emergency preparedness drill';
    case 'COMP':
      return 'Competency re-evaluation';
    default:
      return roleLabel(m.roles);
  }
};

const groupExpires = (m: JourneyModule): string => {
  switch (m.group) {
    case 'ANN':
      return m.annualQuarter ? `Annual cycle (${m.annualQuarter})` : 'Annual cycle';
    case 'COMP':
      return 'Annual re-eval';
    case 'GAO':
      return 'At hire';
    case 'ROLE':
      return m.week ? `Week ${m.week}` : 'Days 1-30';
    default:
      return '—';
  }
};

const evidenceLabel = (m: JourneyModule): string => {
  if (m.evidenceAppendix && m.evidenceAppendix !== 'NONE') return `Appendix ${m.evidenceAppendix}`;
  switch (m.method) {
    case 'None':
      return 'Attestation';
    case 'Quiz':
    case 'CodingExercise':
      return 'Quiz certificate';
    case 'SkillsCheckoff':
    case 'ReturnDemo':
      return 'Skills checkoff';
    case 'SupervisedVisit':
      return 'Visit log';
    case 'Tabletop':
      return 'Drill AAR';
    case 'PhishingSim':
      return 'Simulation result';
    default:
      return `${m.method} record`;
  }
};

const moduleStatus = (m: JourneyModule): string => {
  if (m.supervisorSignature) return 'locked';
  if (m.phase === 'SUPERVISED') return 'awaiting';
  if (m.method === 'None') return 'active';
  return 'ready';
};

const syllabusRows: readonly SyllabusRow[] = ALL_MODULES.map((m) => ({
  catalogId: m.id,
  evidence: evidenceLabel(m),
  expires: groupExpires(m),
  owner: '—',
  policyRef: m.policyRefs.length > 0 ? m.policyRefs.join(', ') : '—',
  status: moduleStatus(m),
  title: m.title,
  trigger: groupTrigger(m),
}));

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

const reviewType = (m: JourneyModule): string => {
  if (m.method === 'SupervisedVisit') return 'Dual signature';
  if (m.supervisorSignature) return 'Evidence hold';
  return 'Competency review';
};

const reviewQueueRows: readonly ReviewQueueRow[] = ALL_MODULES
  .filter((m) => m.supervisorSignature || m.method === 'SupervisedVisit')
  .map((m) => ({
    age: '—',
    cohort: roleLabel(m.roles),
    owner: '—',
    queueId: m.id,
    status: moduleStatus(m),
    subject: m.title,
    type: reviewType(m),
  }));

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
  { icon: Users, label: 'June RN cohort', status: 'active', value: `${SEED_EMPLOYEES.length} learners` },
  {
    icon: CalendarClock,
    label: 'Next expiration sweep',
    status: 'pending',
    value:
      SEED_EMPLOYEES.map((e) => e.licenseExpiry).filter((d): d is string => Boolean(d)).sort()[0] ?? '—',
  },
  {
    icon: CheckCircle2,
    label: 'Ready for clearance',
    status: 'ready',
    value: `${SEED_EMPLOYEES.filter((e) => e.clearedForIndependentWork).length} learners`,
  },
  {
    icon: FileCheck2,
    label: 'Evidence packets',
    status: 'uploaded',
    value: `${SEED_EMPLOYEES.filter((e) => e.appendixFCleared).length} attached`,
  },
] as const;

export function JourneyAdminScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'review' | 'governance' | 'builder'>('overview');
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
        <div className="inline-flex rounded-lg bg-tone-slate-bg p-xs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'syllabus', label: 'Syllabus Catalog' },
            { id: 'review', label: 'Review Queues' },
            { id: 'governance', label: 'Governance & Refs' },
            { id: 'builder', label: 'Syllabus Builder' },
          ].map((tab) => (
            <button
              className={cx(
                'min-h-tap rounded-md px-lg text-sm transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                activeTab === tab.id
                  ? 'bg-surface text-brand-teal shadow-rest'
                  : 'text-secondary hover:bg-surface-hover',
              )}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'syllabus' | 'review' | 'governance' | 'builder')}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'builder' ? (
        <section className="grid gap-xl desktop:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Left Column: Course details */}
          <div className="rounded-lg border border-card bg-surface p-xl shadow-rest flex flex-col justify-between">
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
          <div className="rounded-lg border border-card bg-surface p-xl shadow-rest">
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
                  className="rounded-md border border-card bg-tone-slate-bg p-md flex flex-col gap-sm"
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
                        className="rounded-full border border-card bg-surface px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-brand-teal"
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
              <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
                <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="cohort-trend-title">
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

                  <div className="mt-lg rounded-lg bg-tone-slate-bg p-lg">
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
                    <article className="rounded-lg border border-card bg-surface p-lg shadow-rest" key={gate.label}>
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

          {activeTab === 'governance' && (
            <section className="grid gap-xl desktop:grid-cols-12">
              <div className="grid content-start gap-lg desktop:col-span-8">
                <section className="grid gap-md tablet-p:grid-cols-2" aria-label="Cohort operating metrics">
                  {cohortPanels.map((panel) => {
                    const Icon = panel.icon;

                    return (
                      <article className="rounded-lg border border-card bg-surface p-lg shadow-rest" key={panel.label}>
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

                <section className="rounded-lg border border-card bg-surface p-xl shadow-rest mt-lg" aria-labelledby="mapped-regulatory-title">
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
                      <div className="grid gap-sm rounded-md bg-tone-slate-bg p-md" key={label}>
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
