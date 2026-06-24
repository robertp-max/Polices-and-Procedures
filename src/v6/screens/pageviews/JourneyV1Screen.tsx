import { BookOpenCheck, CheckCircle2, ClipboardCheck, FileCheck2, LockKeyhole, Map, PlayCircle, Route, ShieldCheck, UserCheck, type LucideIcon } from 'lucide-react';
import { achcAnnualTests } from '@/policy/journey/data/achcAnnualTests.data';
import { useNavigate } from 'react-router-dom';
import { MetricGrid, ProgressMeter, SurfaceCard, ToneTag, toneSoftTileClasses, toneGlassSurfaceClasses, type MetricTileData, type SurfaceCardData } from '../../components';
import { Badge, Button, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';

interface LegacyPhase {
  completion: number;
  detail: string;
  icon: LucideIcon;
  label: string;
  legacyLabel: string;
  status: string;
  tone: Tone;
  v6Label: string;
}

interface LessonModule {
  id: string;
  method: string;
  policy: string;
  readiness: string;
  score?: string;
  status: string;
  title: string;
  tone: Tone;
  track: string;
}

interface ReadinessCard extends SurfaceCardData {
  facts: readonly [string, string][];
}

const journeyMetrics: readonly MetricTileData[] = [
  { label: 'GAO complete', value: '60%', helper: '4 of 6 legacy lessons accepted', tone: 'teal' },
  { label: 'Role modules', value: '25%', helper: 'RN sequence opened after core', tone: 'orange' },
  { label: 'Appendix F', value: 'Signed', helper: 'Pre-Day-1 hard stop cleared', tone: 'green' },
  { label: 'Cleared', value: 'No', helper: 'Exam and supervised visits remain', tone: 'amber' },
];

const legacyPhases: readonly LegacyPhase[] = [
  {
    completion: 100,
    detail: 'HR intake, screening, and Appendix F signoff are already accepted for Maria Santos.',
    icon: FileCheck2,
    label: 'Pre-Day-1',
    legacyLabel: 'Paper packet',
    status: 'signed',
    tone: 'green',
    v6Label: 'Appendix F gate',
  },
  {
    completion: 60,
    detail: 'General agency orientation lessons map into the core journey before the competency quiz unlocks.',
    icon: Route,
    label: 'Core Journey',
    legacyLabel: 'Onboarding track',
    status: 'active',
    tone: 'teal',
    v6Label: 'GAO competency',
  },
  {
    completion: 25,
    detail: 'Role-specific RN modules begin after required GAO evidence is present.',
    icon: UserCheck,
    label: 'Clinical Role',
    legacyLabel: 'RN lesson path',
    status: 'review-required',
    tone: 'orange',
    v6Label: 'Role readiness',
  },
  {
    completion: 0,
    detail: 'Supervised visit evidence stays locked until exam and role prerequisites are complete.',
    icon: LockKeyhole,
    label: 'Supervised',
    legacyLabel: 'Preceptor signoff',
    status: 'locked',
    tone: 'slate',
    v6Label: 'Visit validation',
  },
];

const lessonModules: readonly LessonModule[] = [
  // Core onboarding from data
  {
    id: 'GAO-001',
    method: 'Read and attest',
    policy: 'EN-CM-001',
    readiness: 'Legacy topic accepted into V6 evidence chain.',
    score: '100%',
    status: 'complete',
    title: 'Agency mission, vision, values',
    tone: 'green',
    track: 'Onboarding',
  },
  {
    id: 'GAO-004',
    method: 'Quiz',
    policy: 'CO-CP-001, CO-CP-004',
    readiness: 'Score imported and supervisor review not required.',
    score: '85%',
    status: 'complete',
    title: 'Corporate compliance program',
    tone: 'green',
    track: 'Onboarding',
  },
  {
    id: 'GAO-007',
    method: 'Quiz',
    policy: '45 CFR 164',
    readiness: 'PHI handling lesson is complete with passing score.',
    score: '92%',
    status: 'complete',
    title: 'HIPAA privacy and minimum necessary',
    tone: 'teal',
    track: 'Onboarding',
  },
  {
    id: 'GAO-013',
    method: 'Return demo',
    policy: 'CL-SD-016',
    readiness: 'PPE and hand hygiene demo is attached as signed evidence.',
    score: '100%',
    status: 'validated',
    title: 'Infection prevention: PPE and hand hygiene',
    tone: 'teal',
    track: 'Onboarding',
  },
  {
    id: 'GAO-014',
    method: 'Quiz',
    policy: 'RM-OS-001',
    readiness: 'Learner is mid-attempt; score must reach passing before final GAO quiz.',
    score: '65%',
    status: 'active',
    title: 'Bloodborne pathogen exposure control',
    tone: 'orange',
    track: 'Onboarding',
  },
  {
    id: 'GAO-EXAM',
    method: 'Competency quiz',
    policy: 'HR-TA-005 Appendix D',
    readiness: 'Locked until all GAO prerequisites and supervisor signature are ready.',
    status: 'locked',
    title: 'General Orientation Competency Quiz',
    tone: 'slate',
    track: 'Onboarding',
  },
  {
    id: 'RN-001',
    method: 'Return demo',
    policy: 'CL-CD-001, IT-UP-001',
    readiness: 'Role module is complete and can seed the RN readiness path.',
    score: '100%',
    status: 'complete',
    title: 'EHR navigation and documentation',
    tone: 'green',
    track: 'Onboarding',
  },
  // All 12 ACHC Annual training
  ...achcAnnualTests.map((test, idx) => ({
    id: test.topic_id,
    method: 'Quiz',
    policy: 'ACHC annual requirement',
    readiness: idx < 3 ? 'Annual ACHC item staged.' : 'Part of 12 ACHC annual training set.',
    score: '—',
    status: idx === 0 ? 'active' : 'ready',
    title: test.topic_id.replace('ACHC-ART-', 'ACHC Annual: '),
    tone: idx === 0 ? 'orange' : 'amber',
    track: 'Annual ACHC',
  })),
] as readonly LessonModule[];

const readinessCards: readonly ReadinessCard[] = [
  {
    body: 'Legacy lessons are translated into the V6 phase gates so clearance decisions can use the same onboarding language as the newer activation engine.',
    facts: [
      ['Learner', 'Maria Santos, RN'],
      ['Supervisor', 'Dr. Elena Navarro, RN DON'],
      ['Start date', '2026-04-20'],
    ],
    icon: Map,
    progress: 60,
    status: 'active',
    title: 'Legacy-to-V6 bridge',
    tone: 'teal',
  },
  {
    body: 'Appendix F is signed, but the GAO exam, RN medication checkoff, and supervised visits still control independent-work clearance.',
    facts: [
      ['Open gate', 'GAO-EXAM'],
      ['Visit minimum', '2 supervised visits'],
      ['Clearance', 'Not yet independent'],
    ],
    icon: ShieldCheck,
    progress: 52,
    status: 'awaiting',
    title: 'Completion readiness',
    tone: 'orange',
  },
  {
    body: 'Evidence-bearing modules show the method and policy anchor expected by the journey template before the module player opens.',
    facts: [
      ['Evidence appendix', 'HRTA005_D / HRTA005_E'],
      ['Policy anchor', 'HR-TA-005'],
      ['Module state', '8 lessons shown'],
    ],
    icon: ClipboardCheck,
    progress: 74,
    status: 'review',
    title: 'Evidence posture',
    tone: 'amber',
  },
];

const selectedModule = lessonModules[4];

export function JourneyV1Screen() {
  const navigate = useNavigate();

  const handleOpenModule = (moduleId: string) => {
    navigate(`/journey/module/${encodeURIComponent(moduleId)}`);
  };

  return (
    <section className="grid gap-xl" data-hash-id="journey-v1" data-route="/journey/v1-journey" data-template="journey">

      <MetricGrid metrics={journeyMetrics} />

      <section className="grid gap-xl desktop:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.7fr)_minmax(320px,1fr)]">
        <aside className="grid content-start gap-lg" aria-label="Legacy onboarding phase path">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div className="grid gap-xs">
                <ToneTag tone="teal">Maria Santos, RN</ToneTag>
                <h2 className="text-h2 font-medium text-ink">Phase path</h2>
                <p className="text-sm text-muted">Legacy labels mapped to V6 journey gates.</p>
              </div>
              <ToneBadge size="sm" status="active" />
            </div>
            <div className="grid gap-md">
              {legacyPhases.map((phase) => (
                <PhaseCard key={phase.label} phase={phase} />
              ))}
            </div>
          </section>

          <SurfaceCard
            card={{
              body: 'The signed pre-employment checklist allows GAO participation, but independent work stays gated until competency and supervised visit evidence are complete.',
              icon: CheckCircle2,
              progress: 100,
              status: 'signed',
              title: 'Appendix F clearance',
              tone: 'green',
            }}
          >
            <div className="grid gap-sm border-t border-hairline pt-md">
              <FactRow label="Hard stop" value="Cleared before Day 1" />
              <FactRow label="Policy" value="HR-TA-001 / HR-TA-005" />
              <FactRow label="Clearance" value="Independent work pending" />
            </div>
          </SurfaceCard>
        </aside>

        <main className="grid content-start gap-lg" aria-label="Journey v1 lesson modules">
          <div className="mb-lg flex items-center gap-md">
            <h1 className="text-h1 font-medium text-ink">My Learning</h1>
            <ToneTag tone="teal">Maria Santos, RN</ToneTag>
          </div>
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink">Module sequence</h2>
                <p className="max-w-content text-sm text-muted">
                  Lesson cards keep familiar module IDs while surfacing method, policy, status, and readiness.
                </p>
              </div>
              <div className="flex flex-wrap gap-sm" aria-label="Journey v1 track filters">
                <ToneTag tone="teal">Onboarding</ToneTag>
                <ToneTag tone="amber">Annual ACHC</ToneTag>
              </div>
            </div>

            <div className="grid gap-md tablet-l:grid-cols-2 desktop:grid-cols-3">
              {lessonModules.map((module) => (
                <LessonCard
                  key={module.id}
                  module={module}
                  selected={module.id === selectedModule.id}
                  onClick={() => handleOpenModule(module.id)}
                />
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="selected-module-title">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
              <div className="grid gap-sm">
                <ToneTag tone={selectedModule.tone}>{selectedModule.id}</ToneTag>
                <div className="grid gap-xs">
                  <h2 className="text-h2 font-medium text-ink" id="selected-module-title">
                    {selectedModule.title}
                  </h2>
                  <p className="max-w-content text-sm text-muted">
                    Selected legacy lesson detail shows why the current onboarding track is active rather than cleared.
                  </p>
                </div>
              </div>
              <ToneBadge size="sm" status={selectedModule.status} />
            </div>

            <div className="grid gap-lg tablet-l:grid-cols-[minmax(0,1fr)_minmax(220px,320px)]">
              <div className="grid gap-md">
                <div className={cx('rounded-lg p-lg', toneGlassSurfaceClasses[selectedModule.tone])}>
                  <h3 className="text-body font-light text-ink">Readiness note</h3>
                  <p className="mt-xs text-sm text-secondary">{selectedModule.readiness}</p>
                </div>
                <div className="grid gap-md tablet-l:grid-cols-3">
                  <FactTile label="Method" value={selectedModule.method} />
                  <FactTile label="Policy" value={selectedModule.policy} />
                  <FactTile label="Score" value={selectedModule.score ?? 'Pending'} />
                </div>
              </div>
              <div className="grid content-start gap-md rounded-lg border border-card bg-tone-slate-bg p-lg">
                <ProgressMeter label="Lesson score" tone={selectedModule.tone} value={65} />
                <ProgressMeter label="GAO phase" tone="teal" value={60} />
                <Button
                  iconLeft={<PlayCircle aria-hidden="true" className="h-icon-sm w-icon-sm" />}
                  variant="secondary"
                  onClick={() => handleOpenModule(selectedModule.id)}
                >
                  Open module player
                </Button>
              </div>
            </div>
          </section>
        </main>

        <aside className="grid content-start gap-lg" aria-label="Completion and readiness cards">
          {readinessCards.map((card) => (
            <SurfaceCard card={card} key={card.title}>
              <dl className="grid gap-sm border-t border-hairline pt-md">
                {card.facts.map(([label, value]) => (
                  <FactRow key={label} label={label} value={value} />
                ))}
              </dl>
            </SurfaceCard>
          ))}
        </aside>
      </section>
    </section>
  );
}

function PhaseCard({ phase }: { phase: LegacyPhase }) {
  const Icon = phase.icon;

  return (
    <article className={cx('rounded-lg p-lg', toneGlassSurfaceClasses[phase.tone])}>
      <div className="mb-md flex items-start justify-between gap-md">
        <span className="grid h-tap w-tap flex-none place-items-center rounded-md bg-surface">
          <Icon aria-hidden="true" className="h-icon-md w-icon-md" />
        </span>
        <ToneBadge size="sm" status={phase.status} />
      </div>
      <div className="grid gap-xs">
        <h3 className="text-body font-light text-ink">{phase.label}</h3>
        <p className="text-xs text-secondary">
          {phase.legacyLabel} to {phase.v6Label}
        </p>
        <p className="text-sm text-muted">{phase.detail}</p>
      </div>
      <ProgressMeter className="mt-md" label={phase.label} tone={phase.tone} value={phase.completion} />
    </article>
  );
}

function LessonCard({ module, selected, onClick }: { module: LessonModule; selected?: boolean; onClick?: () => void }) {
  return (
    <article
      className={cx(
        'grid min-h-[200px] content-between gap-md rounded-lg border p-lg transition duration-fast ease-standard',
        selected ? 'border-brand-teal bg-tone-teal-bg shadow-hover' : 'border-card bg-tone-slate-bg shadow-rest hover:bg-surface-hover',
        onClick && 'cursor-pointer focus-visible:outline-none focus-visible:shadow-focus',
      )}
      onClick={onClick}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="grid gap-md">
        <div className="flex flex-wrap items-start justify-between gap-md">
          <ToneTag tone={module.tone}>{module.id}</ToneTag>
          <ToneBadge size="sm" status={module.status} />
        </div>
        <div className="grid gap-xs">
          <h3 className="text-body font-light text-ink">{module.title}</h3>
          <p className="text-xs text-muted">{module.readiness}</p>
        </div>
      </div>

      <div className="grid gap-sm border-t border-hairline pt-md">
        <div className="flex flex-wrap items-center gap-sm">
          <span className={cx('grid h-icon-lg w-icon-lg place-items-center rounded-sm', toneSoftTileClasses[module.tone])}>
            <BookOpenCheck aria-hidden="true" className="h-icon-xs w-icon-xs" />
          </span>
          <p className="text-xs text-secondary">{module.method}</p>
        </div>
        <p className="break-words text-xs text-muted">{module.policy}</p>
        <div className="flex flex-wrap gap-sm">
          <Badge size="sm">{module.track}</Badge>
          {module.score ? <Badge size="sm" variant="count">{module.score}</Badge> : null}
        </div>
      </div>
    </article>
  );
}

function FactTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-hairline bg-tone-slate-bg p-md">
      <dt className="text-tag uppercase tracking-tag text-muted">{label}</dt>
      <dd className="mt-xs text-sm text-ink">{value}</dd>
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-hairline bg-tone-slate-bg p-md">
      <dt className="text-tag uppercase tracking-tag text-muted">{label}</dt>
      <dd className="mt-xs text-sm text-ink">{value}</dd>
    </div>
  );
}

export default JourneyV1Screen;
