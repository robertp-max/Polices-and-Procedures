import { Award, BookOpenCheck, FileSignature, LockKeyhole, Route, ShieldCheck, Stethoscope, UserCheck, type LucideIcon } from 'lucide-react';
import { MetricGrid, ProgressMeter, SurfaceCard, ToneTag, toneSoftTileClasses, type MetricTileData, type SurfaceCardData } from '../../components';
import { ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';
import { SEED_EMPLOYEES } from '@/policy/journey/data/employees';
import { modulesForRole } from '@/policy/journey/data/modules';
import type { CompetencyMethod, JourneyModule as SeedJourneyModule, JourneyPhase as SeedJourneyPhase, ModuleGroup } from '@/policy/journey/types/journey';

interface JourneyPhase {
  detail: string;
  label: string;
  status: string;
  tone: Tone;
  value: number;
}

interface JourneyModule {
  description: string;
  group: string;
  icon: LucideIcon;
  id: string;
  method: string;
  phase: string;
  policyRefs: readonly string[];
  prerequisites?: string;
  score?: number;
  status: string;
  supervisorSignature?: boolean;
  title: string;
  tone: Tone;
}

interface ReadinessCheck {
  detail: string;
  label: string;
  status: string;
  tone: Tone;
}

const journeyMetrics = [
  { label: 'GAO complete', value: '60%', helper: '4 of 6 core modules complete', tone: 'teal' },
  { label: 'Role modules', value: '25%', helper: 'RN track week 1 in motion', tone: 'orange' },
  { label: 'Appendix F', value: 'Signed', helper: 'HR-TA-001 hard-stop cleared', tone: 'green' },
  { label: 'Cleared', value: 'No', helper: 'GAO exam and visits pending', tone: 'amber' },
] satisfies readonly MetricTileData[];

const journeyPhases = [
  {
    detail: 'Screening and HR Director signoff complete before orientation work.',
    label: 'Pre-Day-1',
    status: 'complete',
    tone: 'green',
    value: 100,
  },
  {
    detail: 'General agency orientation is active with one core prerequisite open.',
    label: 'Core Journey',
    status: 'active',
    tone: 'teal',
    value: 60,
  },
  {
    detail: 'RN role modules have started and the OASIS exercise is underway.',
    label: 'Clinical Role',
    status: 'review-required',
    tone: 'orange',
    value: 25,
  },
  {
    detail: 'Two supervised patient visits unlock after GAO exam readiness.',
    label: 'Supervised',
    status: 'locked',
    tone: 'slate',
    value: 0,
  },
  {
    detail: 'Independent work remains blocked until supervisor clearance.',
    label: 'Cleared',
    status: 'locked',
    tone: 'slate',
    value: 0,
  },
  {
    detail: 'Annual compliance path is visible for later recurrence.',
    label: 'Annual',
    status: 'upcoming',
    tone: 'amber',
    value: 10,
  },
  {
    detail: 'Drill assignments remain queued behind role clearance.',
    label: 'Drills',
    status: 'upcoming',
    tone: 'slate',
    value: 0,
  },
] satisfies readonly JourneyPhase[];

// Real seed learner shown in the phase rail (Maria Santos, RN — EMP-1001).
const journeyLearner = SEED_EMPLOYEES.find((employee) => employee.id === 'EMP-1001') ?? SEED_EMPLOYEES[0];
const journeySupervisor = SEED_EMPLOYEES.find((employee) => employee.id === journeyLearner.supervisorId);

// Deterministic, presentation-only icon by module group (no fabricated data value).
const GROUP_ICON: Record<ModuleGroup, LucideIcon> = {
  ANN: Award,
  COMP: LockKeyhole,
  DRILL: ShieldCheck,
  GAO: BookOpenCheck,
  ROLE: Stethoscope,
};

// Seed phase enum -> existing display label used by the phase rail / cards.
const PHASE_LABEL: Record<SeedJourneyPhase, string> = {
  ANN: 'Annual',
  CLEARED: 'Cleared',
  DRILL: 'Drills',
  GAO: 'Core Journey',
  PRE_DAY_1: 'Pre-Day-1',
  ROLE: 'Clinical Role',
  SUPERVISED: 'Supervised',
};

// Seed competency-method enum -> human-readable method label (derived from real field).
const METHOD_LABEL: Record<CompetencyMethod, string> = {
  CaseStudy: 'Case study',
  CodingExercise: 'Coding exercise',
  MockSurvey: 'Mock survey',
  None: 'Read and attest',
  Observation: 'Observation',
  PhishingSim: 'Phishing simulation',
  Quiz: 'Quiz',
  RecordReview: 'Record review',
  ReturnDemo: 'Return demo',
  Scenario: 'Scenario',
  SkillsCheckoff: 'Skills checkoff',
  SupervisedVisit: 'Supervised visit',
  Tabletop: 'Tabletop',
};

// Description derived only from real seed fields (method label + regulatory refs).
function describeModule(seed: SeedJourneyModule): string {
  const refs = seed.cmsRefs.length > 0 ? seed.cmsRefs.join(', ') : seed.policyRefs.join(', ');
  return refs ? `${METHOD_LABEL[seed.method]} competency aligned to ${refs}.` : `${METHOD_LABEL[seed.method]} competency.`;
}

function toJourneyModule(seed: SeedJourneyModule): JourneyModule {
  return {
    description: describeModule(seed),
    group: seed.group,
    icon: GROUP_ICON[seed.group],
    id: seed.id,
    method: METHOD_LABEL[seed.method],
    phase: PHASE_LABEL[seed.phase],
    policyRefs: seed.policyRefs,
    // Real prerequisite ids from the seed; no per-learner status is seeded.
    prerequisites: seed.prerequisites && seed.prerequisites.length > 0 ? `Requires ${seed.prerequisites.join(', ')}.` : undefined,
    // No per-learner attempt/score is seeded — use the honest SCORM default + neutral tone.
    status: 'not attempted',
    supervisorSignature: seed.supervisorSignature,
    title: seed.title,
    tone: 'slate',
  };
}

const journeyModules = modulesForRole(journeyLearner.role).map(toJourneyModule) satisfies readonly JourneyModule[];

const supervisorReadiness = [
  {
    detail: 'GAO-014 score must clear before the final orientation competency quiz opens.',
    label: 'GAO exam gate',
    status: 'pending',
    tone: 'amber',
  },
  {
    detail: 'Appendix D needs DON review and dual signoff after the exam is complete.',
    label: 'Competency signoff',
    status: 'review-required',
    tone: 'orange',
  },
  {
    detail: 'Appendix E visit evidence unlocks after role modules and GAO exam pass.',
    label: 'Supervised visits',
    status: 'locked',
    tone: 'slate',
  },
] satisfies readonly ReadinessCheck[];

const guidanceCards = [
  {
    body: 'The learner is inside the GAO phase with Pre-Day-1 complete, Clinical Role started, and later clearance gates locked.',
    icon: Route,
    progress: 60,
    status: 'active',
    title: 'Phase rail',
    tone: 'teal',
  },
  {
    body: 'Appendix F is signed. GAO-EXAM remains locked until core prerequisites and supervisor review are complete.',
    icon: LockKeyhole,
    progress: 45,
    status: 'review-required',
    title: 'Gates and prereqs',
    tone: 'orange',
  },
  {
    body: 'Return demos, skills checkoffs, and supervised visits require evidence attachments plus supervisor and learner signatures.',
    icon: FileSignature,
    progress: 52,
    status: 'pending',
    title: 'Evidence and signatures',
    tone: 'amber',
  },
] satisfies readonly SurfaceCardData[];

export function JourneyOverviewScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="Onboarding"
      data-hash-id="journey-overview"
      data-route="/journey"
      data-template="journey"
    >
      <MetricGrid metrics={journeyMetrics} />

      <section className="grid gap-xl desktop:grid-cols-12">
        <aside className="grid content-start gap-lg desktop:col-span-3" aria-label="Learner phase rail">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg grid gap-md">
              <div className="flex items-start justify-between gap-md">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
                  <UserCheck aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <ToneBadge size="sm" status="signed" />
              </div>
              <div className="grid gap-xs">
                <p className="text-tag uppercase tracking-tag text-muted">Learner</p>
                <h2 className="text-h2 font-medium text-ink">{journeyLearner.name}</h2>
                <p className="text-sm text-secondary">Start date {journeyLearner.startDate ?? '—'}</p>
              </div>
            </div>

            <div className="grid gap-sm border-t border-hairline pt-lg">
              <LearnerFact label="Supervisor" value={journeySupervisor?.name ?? '—'} />
              <LearnerFact label="License" value={journeyLearner.licenseNumber ?? '—'} />
              <LearnerFact label="Appendix F" value={journeyLearner.appendixFCleared ? 'Cleared and signed' : 'Not cleared'} />
              <LearnerFact label="Independent work" value={journeyLearner.clearedForIndependentWork ? 'Cleared' : 'Not cleared'} />
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div>
                <h2 className="text-h2 font-medium text-ink">Phase rail</h2>
                <p className="mt-xs text-sm text-muted">Gated onboarding state by phase.</p>
              </div>
              <ToneTag tone="teal">60% GAO</ToneTag>
            </div>
            <div className="grid gap-md">
              {journeyPhases.map((phase) => (
                <article className="rounded-lg border border-card bg-tone-slate-bg p-md" key={phase.label}>
                  <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
                    <div>
                      <h3 className="text-body font-medium text-ink">{phase.label}</h3>
                      <p className="mt-xs text-xs text-muted">{phase.detail}</p>
                    </div>
                    <ToneBadge size="sm" status={phase.status} />
                  </div>
                  <ProgressMeter label={phase.label} tone={phase.tone} value={phase.value} />
                </article>
              ))}
            </div>
          </section>
        </aside>

        <section className="grid content-start gap-lg desktop:col-span-6" aria-labelledby="journey-modules-title">
          <div className="flex flex-wrap items-end justify-between gap-md">
            <div className="grid gap-xs">
              <h2 className="text-h2 font-medium text-ink" id="journey-modules-title">
                Module cards and steps
              </h2>
              <p className="max-w-content text-sm text-muted">
                Journey modules track GAO, role, supervised-visit, and annual readiness steps for active learners.
              </p>
            </div>
            <ToneTag tone="orange">GAO-EXAM locked</ToneTag>
          </div>

          <div className="grid gap-md tablet-l:grid-cols-2" role="list">
            {journeyModules.map((module, index) => (
              <JourneyModuleCard index={index + 1} key={module.id} module={module} />
            ))}
          </div>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="supervisor-readiness-title">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
              <div className="flex items-start gap-md">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-orange-bg text-tone-orange-text">
                  <UserCheck aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <div>
                  <h2 className="text-h2 font-medium text-ink" id="supervisor-readiness-title">
                    Supervisor readiness
                  </h2>
                  <p className="mt-xs max-w-content text-sm text-muted">
                    DON clearance view for exam readiness, competency signoff, and supervised-visit evidence.
                  </p>
                </div>
              </div>
              <ToneBadge size="sm" status="review-required" />
            </div>

            <div className="mb-lg grid gap-md tablet-l:grid-cols-3">
              <ReadinessStat label="Core prereqs" tone="teal" value="4 / 5" />
              <ReadinessStat label="Role evidence" tone="orange" value="1 / 3" />
              <ReadinessStat label="Visits logged" tone="slate" value="0 / 2" />
            </div>

            <div className="grid gap-sm">
              {supervisorReadiness.map((check) => (
                <div className="flex flex-wrap items-start justify-between gap-md rounded-md border border-hairline bg-tone-slate-bg p-md" key={check.label}>
                  <div className="grid gap-xs">
                    <h3 className="text-sm font-medium text-ink">{check.label}</h3>
                    <p className="text-sm text-muted">{check.detail}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-xs">
                    <ToneTag tone={check.tone}>DON</ToneTag>
                    <ToneBadge size="sm" status={check.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>

        <aside className="grid content-start gap-lg desktop:col-span-3" aria-label="Journey guidance cards">
          {guidanceCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex items-start justify-between gap-md">
              <div className="grid gap-sm">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
                  <ShieldCheck aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <div>
                  <h2 className="text-h2 font-medium text-ink">Clearance path</h2>
                  <p className="mt-xs text-sm text-muted">Right-side operating guidance for the next unlocks.</p>
                </div>
              </div>
              <ToneBadge size="sm" status="pending" />
            </div>

            <div className="grid gap-sm">
              {[
                ['Next learner action', 'Finish GAO-014 and retake until the threshold is met.', 'pending'],
                ['Next supervisor action', 'Review Appendix D readiness before unlocking GAO-EXAM.', 'review-required'],
                ['Hard stop preserved', 'Independent work stays blocked until visits and signatures are complete.', 'locked'],
              ].map(([label, detail, status]) => (
                <div className="rounded-md bg-tone-slate-bg p-md" key={label}>
                  <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
                    <p className="text-tag uppercase tracking-tag text-muted">{label}</p>
                    <ToneBadge size="sm" status={status} />
                  </div>
                  <p className="text-sm text-secondary">{detail}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}

function LearnerFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-md rounded-md bg-tone-slate-bg p-md">
      <span className="text-tag uppercase tracking-tag text-muted">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

function JourneyModuleCard({ index, module }: { index: number; module: JourneyModule }) {
  const Icon = module.icon;

  return (
    <article
      className="grid min-h-[240px] content-between gap-md rounded-lg border border-card bg-surface p-lg shadow-rest transition duration-fast ease-standard hover:shadow-hover"
      role="listitem"
    >
      <div className="grid gap-md">
        <div className="flex items-start justify-between gap-md">
          <span className={cx('grid h-tap w-tap place-items-center rounded-md', toneSoftTileClasses[module.tone])}>
            <Icon aria-hidden="true" className="h-icon-md w-icon-md" />
          </span>
          <div className="flex flex-wrap justify-end gap-xs">
            <ToneTag tone={module.tone}>{module.group}</ToneTag>
            <ToneBadge size="sm" status={module.status} />
          </div>
        </div>

        <div className="grid gap-xs">
          <p className="font-mono text-xs text-brand-orange">Step {index.toString().padStart(2, '0')} / {module.id}</p>
          <h3 className="text-h3 font-medium text-ink">{module.title}</h3>
          <p className="text-sm text-muted">{module.description}</p>
        </div>
      </div>

      <div className="grid gap-md">
        <div className="grid gap-sm text-sm text-secondary">
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <span className="text-tag uppercase tracking-tag text-muted">Phase</span>
            <span>{module.phase}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <span className="text-tag uppercase tracking-tag text-muted">Method</span>
            <span>{module.method}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-xs" aria-label={`${module.id} policy references`}>
          {module.policyRefs.map((policyRef) => (
            <ToneTag key={policyRef} tone="slate">
              {policyRef}
            </ToneTag>
          ))}
        </div>

        {typeof module.score === 'number' ? <ProgressMeter label="Score" tone={module.tone} value={module.score} /> : null}

        {module.prerequisites ? (
          <p className="rounded-md bg-tone-slate-bg p-md text-xs text-muted">{module.prerequisites}</p>
        ) : null}

        {module.supervisorSignature ? (
          <div className="flex flex-wrap items-center justify-between gap-sm rounded-md bg-tone-amber-bg p-md">
            <span className="text-sm text-tone-amber-text">Supervisor signature required</span>
            <FileSignature aria-hidden="true" className="h-icon-sm w-icon-sm text-tone-amber-text" />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ReadinessStat({ label, tone, value }: { label: string; tone: Tone; value: string }) {
  return (
    <div className="rounded-md border border-card bg-tone-slate-bg p-md">
      <p className="text-tag uppercase tracking-tag text-muted">{label}</p>
      <p className={cx('mt-xs text-h2 font-medium', toneTextClasses[tone])}>{value}</p>
    </div>
  );
}

const toneTextClasses: Record<Tone, string> = {
  amber: 'text-tone-amber-text',
  blue: 'text-tone-blue-text',
  green: 'text-tone-green-text',
  orange: 'text-tone-orange-text',
  red: 'text-tone-red-text',
  slate: 'text-tone-slate-text',
  teal: 'text-tone-teal-text',
  violet: 'text-tone-violet-text',
};

export default JourneyOverviewScreen;
