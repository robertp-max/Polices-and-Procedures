import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  LockKeyhole,
  NotebookText,
  PlayCircle,
  ShieldCheck,
  Signature,
  type LucideIcon,
} from 'lucide-react';
import {
  DataTable,
  MetricGrid,
  ProgressMeter,
  SurfaceCard,
  ToneTag,
  toneSurfaceClasses,
  type DataTableColumn,
  type MetricTileData,
  type SurfaceCardData,
} from '../../components';
import { Badge, Button, Checkbox, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';

interface LessonStep {
  detail: string;
  icon: LucideIcon;
  label: string;
  progress: number;
  status: string;
  tone: Tone;
}

interface EvidenceGate {
  helper: string;
  icon: LucideIcon;
  label: string;
  status: string;
  tone: Tone;
  value: string;
}

interface ResourceLink {
  label: string;
  meta: string;
  status: string;
  tone: Tone;
}

interface CheckoffRow extends Record<string, string> {
  criterion: string;
  evidence: string;
  owner: string;
  status: string;
}

const routeMarker = {
  group: 'Onboarding',
  hashId: 'module-player',
  path: '/journey/module/:moduleId',
  template: 'module-player',
} as const;

const moduleRecord = {
  assessor: 'Dr. Elena Navarro, RN DON',
  id: 'RN-008',
  learner: 'Maria Santos, RN',
  method: 'SkillsCheckoff',
  policyRefs: 'CL-SD-012, CL-SD-013, HR-TA-005 App D',
  score: '88%',
  status: 'review-required',
  title: 'Medication management and reconciliation',
} as const;

const moduleMetrics: readonly MetricTileData[] = [
  { label: 'Method', value: 'Skills', helper: 'Checklist plus short assessment', tone: 'teal' },
  { label: 'Lesson progress', value: '72%', helper: '4 of 6 steps complete', tone: 'orange' },
  { label: 'Evidence', value: 'Ready', helper: 'Preceptor notes staged', tone: 'green' },
  { label: 'Score', value: moduleRecord.score, helper: 'Passing threshold 80%', tone: 'teal' },
];

const lessonSteps: readonly LessonStep[] = [
  {
    detail: 'Role-specific medication safety overview and reconciliation objectives acknowledged.',
    icon: CheckCircle2,
    label: 'Orientation brief',
    progress: 100,
    status: 'complete',
    tone: 'green',
  },
  {
    detail: 'Learner reviewed policy anchors and home visit documentation expectations.',
    icon: BookOpen,
    label: 'Policy review',
    progress: 100,
    status: 'validated',
    tone: 'green',
  },
  {
    detail: 'Return-demo steps recorded for med list comparison, discrepancy escalation, and patient teaching.',
    icon: ClipboardCheck,
    label: 'Skills practice',
    progress: 84,
    status: 'ready',
    tone: 'teal',
  },
  {
    detail: 'Scenario questions are answered; one rationale needs assessor review before final completion.',
    icon: NotebookText,
    label: 'Knowledge check',
    progress: 64,
    status: 'review-required',
    tone: 'orange',
  },
  {
    detail: 'Evidence package is staged for supervisor confirmation and learner acknowledgement.',
    icon: Signature,
    label: 'Dual attestation',
    progress: 48,
    status: 'awaiting',
    tone: 'amber',
  },
  {
    detail: 'Independent-work clearance stays locked until the assessor signs the module record.',
    icon: LockKeyhole,
    label: 'Clearance gate',
    progress: 0,
    status: 'locked',
    tone: 'slate',
  },
];

const checkoffColumns: readonly DataTableColumn<CheckoffRow>[] = [
  { key: 'criterion', label: 'Checkoff item' },
  { key: 'evidence', label: 'Evidence' },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status', status: true },
];

const checkoffRows: readonly CheckoffRow[] = [
  {
    criterion: 'Medication profile reconciled against discharge list',
    evidence: 'Demo note plus screenshot',
    owner: 'Preceptor',
    status: 'validated',
  },
  {
    criterion: 'High-risk medication flagged with escalation path',
    evidence: 'Scenario response',
    owner: 'Learner',
    status: 'ready',
  },
  {
    criterion: 'Patient teaching documented in visit note',
    evidence: 'Teach-back checklist',
    owner: 'Learner',
    status: 'complete',
  },
  {
    criterion: 'Supervisor rating and signature recorded',
    evidence: 'Dual attestation',
    owner: 'Supervisor',
    status: 'awaiting',
  },
];

const evidenceGates: readonly EvidenceGate[] = [
  {
    helper: 'All required policy references are linked to the learner record.',
    icon: ShieldCheck,
    label: 'Policy anchors',
    status: 'validated',
    tone: 'green',
    value: '3 linked',
  },
  {
    helper: 'Assessment rationale is retained for supervisor review and retry if needed.',
    icon: AlertTriangle,
    label: 'Assessment review',
    status: 'review-required',
    tone: 'orange',
    value: '1 item open',
  },
  {
    helper: 'Evidence appendices are ready to archive after the final signature.',
    icon: FileCheck2,
    label: 'Evidence packet',
    status: 'ready',
    tone: 'teal',
    value: 'Ready',
  },
];

const resources: readonly ResourceLink[] = [
  {
    label: 'CL-SD-012 Medication Management',
    meta: 'Medication reconciliation policy anchor',
    status: 'validated',
    tone: 'teal',
  },
  {
    label: 'CL-SD-013 Medication Profile Review',
    meta: 'Clinical documentation and escalation rules',
    status: 'ready',
    tone: 'green',
  },
  {
    label: 'HR-TA-005 Appendix D',
    meta: 'Competency assessment evidence appendix',
    status: 'awaiting',
    tone: 'amber',
  },
  {
    label: 'Supervisor signoff guide',
    meta: 'Preceptor scoring and learner acknowledgement',
    status: 'upcoming',
    tone: 'slate',
  },
];

const readinessCard = {
  body: 'The learner has completed the lesson content and skills demo. Final completion waits on one assessor review note and the dual attestation.',
  icon: ClipboardList,
  progress: 72,
  status: 'review-required',
  title: 'Module readiness',
  tone: 'orange',
} satisfies SurfaceCardData;

const evidenceCard = {
  body: 'Evidence artifacts are staged for HR-TA-005 Appendix D and will move to the learner record after supervisor signature.',
  icon: FileCheck2,
  progress: 86,
  status: 'ready',
  title: 'Evidence readiness',
  tone: 'teal',
} satisfies SurfaceCardData;

const attestationRows = [
  ['Supervisor rating', 'Satisfactory with one rationale note'],
  ['Learner acknowledgement', 'Ready after review note closes'],
  ['Evidence appendix', 'HR-TA-005 Appendix D'],
  ['Completion gate', 'journey.complete permission required'],
] as const;

export function ModulePlayerScreen() {
  return (
    <section
      aria-labelledby="module-player-title"
      className="grid gap-xl"
      data-hash-id={routeMarker.hashId}
      data-route={routeMarker.path}
      data-template={routeMarker.template}
    >
      <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
        <div className="flex flex-wrap items-start justify-between gap-lg">
          <div className="grid gap-md">
            <div className="flex flex-wrap gap-sm">
              <ToneTag tone="teal">{routeMarker.path}</ToneTag>
              <ToneTag tone="slate">{routeMarker.hashId}</ToneTag>
              <ToneTag tone="slate">{routeMarker.template}</ToneTag>
              <ToneTag tone="orange">{routeMarker.group}</ToneTag>
              <ToneBadge size="sm" status={moduleRecord.status} />
            </div>
            <div>
              <p className="text-tag uppercase tracking-tag text-muted">{moduleRecord.id} - {moduleRecord.method}</p>
              <h2 className="mt-xs text-h2 font-medium text-ink" id="module-player-title">
                {moduleRecord.title}
              </h2>
              <p className="mt-xs max-w-content text-sm text-secondary">
                Focused onboarding module player for skills checkoff, lesson progress, assessment readiness, evidence capture,
                and right-side policy resources.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-sm">
            <Button
              iconLeft={<BookOpen aria-hidden="true" className="h-icon-sm w-icon-sm" />}
              size="sm"
              variant="secondary"
            >
              Previous step
            </Button>
            <Button iconLeft={<Signature aria-hidden="true" className="h-icon-sm w-icon-sm" />} size="sm">
              Submit review
            </Button>
          </div>
        </div>
      </section>

      <MetricGrid metrics={moduleMetrics} />

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-xl">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="player-stage-title">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
              <div>
                <ToneTag tone="teal">Current lesson</ToneTag>
                <h2 className="mt-md text-h2 font-medium text-ink" id="player-stage-title">
                  Medication reconciliation scenario
                </h2>
                <p className="mt-xs max-w-content text-sm text-muted">
                  Static player frame for the active module. The route param would select the module content at integration time.
                </p>
              </div>
              <Badge variant="count">Step 4 of 6</Badge>
            </div>

            <div className="grid gap-lg tablet-l:grid-cols-[minmax(0,1fr)_minmax(240px,320px)]">
              <div className="grid min-h-[320px] place-items-center rounded-lg border border-card bg-tone-slate-bg p-xl text-center">
                <div className="max-w-content">
                  <span className="mx-auto grid h-[72px] w-[72px] place-items-center rounded-lg border border-tone-teal-border bg-tone-teal-bg text-tone-teal-text">
                    <PlayCircle aria-hidden="true" className="h-icon-xl w-icon-xl" />
                  </span>
                  <h3 className="mt-lg text-h3 font-light text-ink">Scenario player paused</h3>
                  <p className="mt-sm text-sm text-secondary">
                    Review the discrepancy, choose the escalation path, and attach the teaching note before final attestation.
                  </p>
                  <div className="mt-lg flex flex-wrap justify-center gap-sm">
                    <Button iconLeft={<PlayCircle aria-hidden="true" className="h-icon-sm w-icon-sm" />} size="sm">
                      Resume lesson
                    </Button>
                    <Button size="sm" variant="secondary">
                      Save progress
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid content-start gap-md">
                <section className="rounded-lg border border-card bg-surface p-lg">
                  <div className="mb-md flex flex-wrap items-start justify-between gap-md">
                    <div>
                      <p className="text-tag uppercase tracking-tag text-muted">Learner</p>
                      <h3 className="mt-xs text-h3 font-light text-ink">{moduleRecord.learner}</h3>
                    </div>
                    <ToneBadge size="sm" status="ready" />
                  </div>
                  <ProgressMeter label="Lesson progress" tone="orange" value={72} />
                </section>

                <section className="rounded-lg border border-card bg-surface p-lg">
                  <div className="mb-md flex flex-wrap items-start justify-between gap-md">
                    <div>
                      <p className="text-tag uppercase tracking-tag text-muted">Assessor</p>
                      <h3 className="mt-xs text-h3 font-light text-ink">{moduleRecord.assessor}</h3>
                    </div>
                    <ToneBadge size="sm" status="awaiting" />
                  </div>
                  <ProgressMeter label="Assessment readiness" tone="teal" value={86} />
                </section>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="lesson-progress-title">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
              <div>
                <h2 className="text-h2 font-medium text-ink" id="lesson-progress-title">
                  Lesson progress
                </h2>
                <p className="mt-xs max-w-content text-sm text-muted">
                  Gated steps keep the player mobile-first while retaining the onboarding phase sequence.
                </p>
              </div>
              <ToneTag tone="orange">4 active checkpoints</ToneTag>
            </div>
            <div className="grid gap-md tablet-l:grid-cols-2">
              {lessonSteps.map((step) => (
                <LessonStepCard key={step.label} step={step} />
              ))}
            </div>
          </section>

          <section className="grid gap-xl laptop:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
            <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="checkoff-title">
              <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
                <div>
                  <h2 className="text-h2 font-medium text-ink" id="checkoff-title">
                    Skills checkoff matrix
                  </h2>
                  <p className="mt-xs max-w-content text-sm text-muted">
                    Static checklist rows model the skills checkoff frame specified for the module-player template.
                  </p>
                </div>
                <ToneBadge size="sm" status="review-required" />
              </div>
              <DataTable columns={checkoffColumns} label="Module skills checkoff matrix" rows={checkoffRows} />
            </section>

            <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="attestation-title">
              <div className="mb-lg flex items-start gap-md">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-amber-bg text-tone-amber-text">
                  <Signature aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <div>
                  <h2 className="text-h2 font-medium text-ink" id="attestation-title">
                    Evidence capture
                  </h2>
                  <p className="mt-xs text-sm text-muted">Supervisor and learner signoff state.</p>
                </div>
              </div>

              <div className="grid gap-md">
                <label className="flex items-start gap-md rounded-lg border border-card bg-tone-slate-bg p-md text-sm text-secondary">
                  <Checkbox checked readOnly aria-label="Supervisor satisfactory rating selected" />
                  <span>Supervisor rating marked satisfactory for observed medication reconciliation steps.</span>
                </label>
                <label className="flex items-start gap-md rounded-lg border border-card bg-tone-slate-bg p-md text-sm text-secondary">
                  <Checkbox readOnly aria-label="Learner acknowledgement waiting" />
                  <span>Learner acknowledgement is waiting for the final assessor note.</span>
                </label>
                <dl className="grid gap-sm">
                  {attestationRows.map(([label, value]) => (
                    <div className="rounded-md border border-hairline bg-tone-slate-bg p-md" key={label}>
                      <dt className="text-tag uppercase tracking-tag text-muted">{label}</dt>
                      <dd className="mt-xs text-sm text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          </section>
        </div>

        <aside className="grid content-start gap-lg" aria-label="Module resources and readiness">
          <SurfaceCard card={readinessCard}>
            <div className="grid gap-md">
              {evidenceGates.map((gate) => (
                <EvidenceGateCard gate={gate} key={gate.label} />
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard card={evidenceCard}>
            <ProgressMeter label="Packet readiness" tone="teal" value={86} />
          </SurfaceCard>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="resource-title">
            <div className="mb-lg flex items-start gap-md">
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
                <BookOpen aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div>
                <h2 className="text-h2 font-medium text-ink" id="resource-title">
                  Resources
                </h2>
                <p className="mt-xs text-sm text-muted">Right-side references for the module and evidence packet.</p>
              </div>
            </div>
            <div className="grid gap-md">
              {resources.map((resource) => (
                <ResourceCard resource={resource} key={resource.label} />
              ))}
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}

function LessonStepCard({ step }: { step: LessonStep }) {
  const Icon = step.icon;

  return (
    <article className={cx('rounded-lg border p-lg', toneSurfaceClasses[step.tone])}>
      <div className="mb-md flex items-start justify-between gap-md">
        <span className="grid h-tap w-tap place-items-center rounded-md bg-surface">
          <Icon aria-hidden="true" className="h-icon-sm w-icon-sm" />
        </span>
        <ToneBadge size="sm" status={step.status} />
      </div>
      <h3 className="text-body font-light text-ink">{step.label}</h3>
      <p className="mt-xs text-sm text-secondary">{step.detail}</p>
      <ProgressMeter className="mt-md" label={step.label} tone={step.tone} value={step.progress} />
    </article>
  );
}

function EvidenceGateCard({ gate }: { gate: EvidenceGate }) {
  const Icon = gate.icon;

  return (
    <article className={cx('rounded-lg border p-md', toneSurfaceClasses[gate.tone])}>
      <div className="flex items-start gap-md">
        <span className="grid h-tap w-tap flex-none place-items-center rounded-md bg-surface">
          <Icon aria-hidden="true" className="h-icon-sm w-icon-sm" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-xs flex flex-wrap items-center justify-between gap-sm">
            <h3 className="text-sm font-light text-ink">{gate.label}</h3>
            <ToneBadge size="sm" status={gate.status} />
          </div>
          <p className="text-xs text-muted">{gate.helper}</p>
          <p className="mt-sm text-tag uppercase tracking-tag text-secondary">{gate.value}</p>
        </div>
      </div>
    </article>
  );
}

function ResourceCard({ resource }: { resource: ResourceLink }) {
  return (
    <article className={cx('rounded-lg border p-md', toneSurfaceClasses[resource.tone])}>
      <div className="mb-sm flex flex-wrap items-start justify-between gap-sm">
        <h3 className="text-sm font-light text-ink">{resource.label}</h3>
        <ToneBadge size="sm" status={resource.status} />
      </div>
      <p className="text-xs text-secondary">{resource.meta}</p>
    </article>
  );
}

export default ModulePlayerScreen;
