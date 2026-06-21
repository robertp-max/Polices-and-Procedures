import {
  AlertTriangle,
  CalendarCheck2,
  ClipboardCheck,
  FileCheck2,
  ListChecks,
  MessageSquareText,
  PenLine,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  DataTable,
  MetricGrid,
  ProgressMeter,
  SurfaceCard,
  ToneTag,
  type DataTableColumn,
  type MetricTileData,
  type SurfaceCardData,
} from '../../components';
import { Badge, Button, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';

interface SupervisorLearnerRow extends Record<string, string> {
  clearanceStatus: string;
  exceptions: string;
  gaoProgress: string;
  learnerId: string;
  name: string;
  nextReview: string;
  role: string;
  roleProgress: string;
  supervisedVisits: string;
}

interface ClearanceGateRow extends Record<string, string> {
  evidence: string;
  gateId: string;
  requirement: string;
  status: string;
}

interface ReadinessQueue {
  count: string;
  detail: string;
  label: string;
  status: string;
  tone: Tone;
}

interface ProfileBar {
  label: string;
  tone: Tone;
  value: number;
}

interface SupervisorCard extends SurfaceCardData {
  meta: readonly [string, string][];
}

const supervisorMetrics = [
  { label: 'Roster', value: '14', helper: 'Learners under supervision', tone: 'teal' },
  { label: 'Escalations', value: '1', helper: 'Exception needing DON review', tone: 'orange' },
  { label: 'Cleared', value: '4', helper: 'Independent-work signoffs', tone: 'green' },
  { label: 'GAO-EXAM', value: '3', helper: 'Pending supervisor signature', tone: 'amber' },
] satisfies readonly MetricTileData[];

const learnerRows: readonly SupervisorLearnerRow[] = [
  {
    clearanceStatus: 'active',
    exceptions: '0',
    gaoProgress: '60%',
    learnerId: 'EMP-1001',
    name: 'Maria Santos, RN',
    nextReview: 'Jun 21, 2026',
    role: 'RN',
    roleProgress: '25%',
    supervisedVisits: '0/2',
  },
  {
    clearanceStatus: 'ready',
    exceptions: '0',
    gaoProgress: '100%',
    learnerId: 'EMP-1002',
    name: 'Dani Lopez, HHA',
    nextReview: 'Jun 21, 2026',
    role: 'HHA',
    roleProgress: '80%',
    supervisedVisits: '2/2',
  },
  {
    clearanceStatus: 'attention',
    exceptions: '1',
    gaoProgress: '83%',
    learnerId: 'EMP-1003',
    name: 'Kevin Huang, LVN',
    nextReview: 'Jun 22, 2026',
    role: 'LVN',
    roleProgress: '50%',
    supervisedVisits: '1/2',
  },
  {
    clearanceStatus: 'signed',
    exceptions: '0',
    gaoProgress: '100%',
    learnerId: 'EMP-1004',
    name: 'Aisha Patel, OT',
    nextReview: 'Jun 19, 2026',
    role: 'OT',
    roleProgress: '100%',
    supervisedVisits: '2/2',
  },
  {
    clearanceStatus: 'review-required',
    exceptions: '0',
    gaoProgress: '100%',
    learnerId: 'EMP-1005',
    name: 'Rowan Chen, DON',
    nextReview: 'Jun 23, 2026',
    role: 'DON',
    roleProgress: '75%',
    supervisedVisits: 'N/A',
  },
];

const learnerColumns: readonly DataTableColumn<SupervisorLearnerRow>[] = [
  { key: 'learnerId', label: 'Learner ID' },
  { key: 'name', label: 'Learner' },
  { key: 'role', label: 'Role' },
  { key: 'gaoProgress', label: 'GAO' },
  { key: 'roleProgress', label: 'Role' },
  { key: 'supervisedVisits', label: 'Visits' },
  { key: 'exceptions', label: 'Exceptions' },
  { key: 'clearanceStatus', label: 'Clearance', status: true },
  { key: 'nextReview', label: 'Next review' },
];

const selectedProfileBars: readonly ProfileBar[] = [
  { label: 'GAO complete', tone: 'teal', value: 60 },
  { label: 'Role modules', tone: 'orange', value: 25 },
  { label: 'Supervised visits', tone: 'orange', value: 0 },
  { label: 'Annual readiness', tone: 'slate', value: 10 },
];

const clearanceGateRows: readonly ClearanceGateRow[] = [
  {
    evidence: 'Signed before orientation release',
    gateId: 'APP-F',
    requirement: 'Appendix F hard-stop cleared',
    status: 'signed',
  },
  {
    evidence: 'GAO-001, 004, 007, 013 complete; GAO-014 in progress',
    gateId: 'GAO-PRQ',
    requirement: 'GAO prerequisites for HR-TA-005 Appendix D',
    status: 'active',
  },
  {
    evidence: 'General Orientation Competency Quiz awaiting DON review',
    gateId: 'GAO-EXAM',
    requirement: 'Supervisor signature required',
    status: 'pending',
  },
  {
    evidence: '0 of 2 supervised patient visits logged',
    gateId: 'HRTA005-E',
    requirement: 'Supervised visit evidence capture',
    status: 'locked',
  },
  {
    evidence: 'Independent work blocked until Appendix B attestation',
    gateId: 'APP-B',
    requirement: 'Clearance for independent field work',
    status: 'locked',
  },
];

const clearanceGateColumns: readonly DataTableColumn<ClearanceGateRow>[] = [
  { key: 'gateId', label: 'Gate' },
  { key: 'requirement', label: 'Requirement' },
  { key: 'evidence', label: 'Evidence' },
  { key: 'status', label: 'Status', status: true },
];

const readinessQueues: readonly ReadinessQueue[] = [
  {
    count: '3',
    detail: 'GAO-EXAM records need supervisor review before Appendix D can close.',
    label: 'Signature queue',
    status: 'pending',
    tone: 'amber',
  },
  {
    count: '7',
    detail: 'Supervised-visit logs are still needed before independent-work clearance.',
    label: 'Visit readiness',
    status: 'review-required',
    tone: 'orange',
  },
  {
    count: '4',
    detail: 'Learners have final approval and signed Appendix B clearance.',
    label: 'Cleared cohort',
    status: 'signed',
    tone: 'green',
  },
  {
    count: '1',
    detail: 'One LVN exception is escalated for DON coaching and remediation.',
    label: 'Exception watch',
    status: 'attention',
    tone: 'orange',
  },
];

const coachingCards = [
  {
    body: 'Maria needs GAO-014 completion, OASIS coding practice, and two supervised RN visits before the clearance packet can move.',
    icon: Stethoscope,
    meta: [
      ['Coach', 'Dr. Elena Navarro, RN DON'],
      ['Next touchpoint', 'Jun 21, 2026'],
      ['Evidence path', 'HRTA005_D and HRTA005_E'],
    ],
    progress: 42,
    status: 'review-required',
    title: 'Maria Santos coaching plan',
    tone: 'orange',
  },
  {
    body: 'Review cards preserve the learner and supervisor labels expected by the evidence capture flow before signature.',
    icon: ClipboardCheck,
    meta: [
      ['Review packet', 'GAO quiz, return demo, visit log'],
      ['Dual labels', 'Supervisor and Learner'],
      ['Policy anchor', 'HR-TA-005 Appendix D/E'],
    ],
    progress: 68,
    status: 'pending',
    title: 'Supervisor review packet',
    tone: 'amber',
  },
  {
    body: 'Appendix B remains locked until prerequisites, visits, evidence, and DON sign-off are all complete.',
    icon: ShieldCheck,
    meta: [
      ['Clearance gate', 'HR-TA-005 Appendix B'],
      ['Current block', 'Supervised visit evidence'],
      ['Independent work', 'No until signed'],
    ],
    progress: 57,
    status: 'locked',
    title: 'Clearance control',
    tone: 'slate',
  },
] satisfies readonly SupervisorCard[];

const supervisorActions = [
  { icon: CalendarCheck2, label: 'Log visit' },
  { icon: FileCheck2, label: 'Review evidence' },
  { icon: PenLine, label: 'Request signature' },
] as const;

export function SupervisorScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="Onboarding"
      data-hash-id="supervisor"
      data-route="/journey/supervisor"
      data-template="journey"
    >
      <section className="flex flex-wrap items-start justify-between gap-lg rounded-lg border border-card bg-surface p-lg shadow-rest">
        <div className="grid gap-sm">
          <div className="flex flex-wrap items-center gap-sm">
            <ToneTag>/journey/supervisor</ToneTag>
            <ToneTag tone="slate">supervisor</ToneTag>
            <ToneTag tone="slate">journey</ToneTag>
            <ToneTag tone="teal">Onboarding</ToneTag>
            <Badge>Reference: 49-supervisor.png</Badge>
          </div>
          <p className="max-w-content text-sm font-light text-secondary">
            DON and preceptor oversight for learner progress, readiness queues, exceptions, supervised-visit evidence,
            and clearance sign-off.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <ToneBadge size="sm" status="active" />
          <Badge variant="count">journey.supervise</Badge>
        </div>
      </section>

      <MetricGrid metrics={supervisorMetrics} />

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(360px,2fr)]">
        <section className="grid gap-lg" aria-labelledby="supervisor-roster-title">
          <div className="flex flex-wrap items-start justify-between gap-lg">
            <div className="grid gap-xs">
              <h2 className="text-h2 font-medium text-ink" id="supervisor-roster-title">
                Learner oversight roster
              </h2>
              <p className="max-w-content text-sm font-light text-muted">
                Cohort rows show GAO, role-track, supervised-visit, exception, and clearance posture for supervisor
                review.
              </p>
            </div>
            <ToneTag tone="orange">1 active exception</ToneTag>
          </div>

          <DataTable columns={learnerColumns} label="Supervisor onboarding learner roster" rows={learnerRows} />

          <section className="grid gap-md tablet-l:grid-cols-2" aria-label="Supervisor readiness queues">
            {readinessQueues.map((queue) => (
              <article className="rounded-lg border border-card bg-surface p-lg shadow-rest" key={queue.label}>
                <div className="mb-md flex flex-wrap items-start justify-between gap-md">
                  <div className="grid gap-xs">
                    <p className="text-tag uppercase tracking-tag text-muted">{queue.label}</p>
                    <ToneTag tone={queue.tone}>{queue.count} learners</ToneTag>
                  </div>
                  <ToneBadge size="sm" status={queue.status} />
                </div>
                <p className="text-sm font-light text-secondary">{queue.detail}</p>
              </article>
            ))}
          </section>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="exception-review-title">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div className="flex items-start gap-md">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-orange-bg text-tone-orange-text">
                  <AlertTriangle aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <div className="grid gap-xs">
                  <h2 className="text-h2 font-medium text-ink" id="exception-review-title">
                    Exceptions and remediation
                  </h2>
                  <p className="text-sm font-light text-muted">
                    Supervisor review keeps remediation attached to the learner record before clearance is considered.
                  </p>
                </div>
              </div>
              <ToneBadge size="sm" status="attention" />
            </div>

            <div className="grid gap-md tablet-l:grid-cols-3">
              {[
                ['Kevin Huang, LVN', 'Medication skills remediation after first supervised visit.', 'review-required'],
                ['Maria Santos, RN', 'GAO-014 quiz score must recover before GAO-EXAM unlock.', 'pending'],
                ['Dani Lopez, HHA', 'HHA skills checkoff ready for final preceptor signature.', 'ready'],
              ].map(([learner, detail, status]) => (
                <article className="rounded-lg border border-hairline bg-tone-slate-bg p-lg" key={learner}>
                  <div className="mb-md flex flex-wrap items-center justify-between gap-sm">
                    <h3 className="text-body font-light text-ink">{learner}</h3>
                    <ToneBadge size="sm" status={status} />
                  </div>
                  <p className="text-sm font-light text-secondary">{detail}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="grid content-start gap-lg" aria-label="Selected learner supervision panel">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="selected-learner-title">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div className="flex items-start gap-md">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
                  <UserCheck aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <div className="grid gap-xs">
                  <p className="text-tag uppercase tracking-tag text-muted">Selected learner</p>
                  <h2 className="text-h2 font-medium text-ink" id="selected-learner-title">
                    Maria Santos, RN
                  </h2>
                  <p className="text-sm font-light text-secondary">EMP-1001 - Start date Apr 20, 2026</p>
                </div>
              </div>
              <ToneBadge size="sm" status="active" />
            </div>

            <div className="grid gap-md">
              {selectedProfileBars.map((bar) => (
                <ProgressMeter key={bar.label} label={bar.label} tone={bar.tone} value={bar.value} />
              ))}
            </div>

            <div className="mt-lg grid gap-sm border-t border-hairline pt-lg">
              <div className="flex flex-wrap items-center justify-between gap-md rounded-md bg-tone-slate-bg p-md">
                <span className="text-sm font-light text-secondary">Supervisor</span>
                <span className="text-sm font-light text-ink">Dr. Elena Navarro, RN DON</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-md rounded-md bg-tone-slate-bg p-md">
                <span className="text-sm font-light text-secondary">Appendix F</span>
                <ToneBadge size="sm" status="signed" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-md rounded-md bg-tone-slate-bg p-md">
                <span className="text-sm font-light text-secondary">Independent work</span>
                <ToneBadge size="sm" status="locked" />
              </div>
            </div>

            <div className="mt-lg flex flex-wrap gap-sm">
              {supervisorActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Button iconLeft={<Icon aria-hidden="true" className="h-icon-sm w-icon-sm" />} key={action.label} size="sm" variant="secondary">
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="clearance-gates-title" className="grid gap-lg">
            <div className="flex items-start gap-md">
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-slate-bg text-tone-slate-text">
                <ListChecks aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink" id="clearance-gates-title">
                  Clearance gates
                </h2>
                <p className="text-sm font-light text-muted">
                  HR-TA-005 Appendix B stays locked until prerequisite, evidence, and signature gates are complete.
                </p>
              </div>
            </div>

            <DataTable columns={clearanceGateColumns} label="Supervisor clearance gate checklist" rows={clearanceGateRows} />
          </section>

          <section className="grid gap-lg" aria-label="Coaching and supervisor review cards">
            {coachingCards.map((card) => (
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
          </section>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="supervisor-review-title">
            <div className="mb-lg flex items-start gap-md">
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
                <Users aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink" id="supervisor-review-title">
                  Review cadence
                </h2>
                <p className="text-sm font-light text-muted">
                  Daily queues keep learner coaching, readiness exceptions, and clearance packets visible to the DON.
                </p>
              </div>
            </div>

            <div className="grid gap-sm">
              {[
                ['Morning roster review', '14 learners checked for gates, signatures, and visit logs', 'complete'],
                ['Preceptor huddle', 'RN and HHA observation notes routed for final review', 'pending'],
                ['Coaching notes', 'Five remediation comments attached to learner profiles', 'review-required'],
              ].map(([label, detail, status]) => (
                <div className="flex flex-wrap items-center justify-between gap-md rounded-md bg-tone-slate-bg p-md" key={label}>
                  <div className="flex min-w-0 items-start gap-sm">
                    <MessageSquareText aria-hidden="true" className="mt-xs h-icon-sm w-icon-sm shrink-0 text-brand-teal" />
                    <div className="min-w-0">
                      <p className="text-sm font-light text-ink">{label}</p>
                      <p className="mt-xs text-xs font-light text-secondary">{detail}</p>
                    </div>
                  </div>
                  <ToneBadge size="sm" status={status} />
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}

export default SupervisorScreen;
