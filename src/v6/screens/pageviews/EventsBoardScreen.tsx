import {
  AlertTriangle,
  CalendarClock,
  FileCheck2,
  Filter,
  LockKeyhole,
  ShieldCheck,
  Upload,
  Users,
} from 'lucide-react';
import {
  BoardLane,
  MetricGrid,
  ProgressMeter,
  SurfaceCard,
  ToneTag,
  toneSurfaceClasses,
  type BoardLaneData,
  type MetricTileData,
  type SurfaceCardData,
} from '../../components';
import { Badge, Button, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';

interface EvidenceSignal {
  artifacts: string;
  due: string;
  id: string;
  owner: string;
  progress: number;
  status: string;
  title: string;
  tone: Tone;
}

interface EventFilter {
  icon: typeof Filter;
  label: string;
  selected?: boolean;
  tone: Tone;
}

const eventMetrics: readonly MetricTileData[] = [
  { label: 'Critical events', value: '4', helper: 'Overdue or same-day risk', tone: 'orange' },
  { label: 'At risk', value: '7', helper: 'Owner or readiness gaps', tone: 'amber' },
  { label: 'Evidence ready', value: '12', helper: 'Artifacts attached', tone: 'teal' },
  { label: 'Lock ready', value: '6', helper: 'Signature path clear', tone: 'green' },
];

const eventFilters: readonly EventFilter[] = [
  { icon: Filter, label: 'All events', selected: true, tone: 'teal' },
  { icon: AlertTriangle, label: 'Critical', tone: 'orange' },
  { icon: FileCheck2, label: 'Missing evidence', tone: 'orange' },
  { icon: Users, label: 'Owner gaps', tone: 'amber' },
  { icon: LockKeyhole, label: 'Ready to lock', tone: 'green' },
];

const eventHealthCards: readonly SurfaceCardData[] = [
  {
    body: 'Thirty event artifacts are expected for the June survey-readiness window; eight still need owner confirmation.',
    icon: FileCheck2,
    progress: 73,
    status: 'missing-evidence',
    title: 'Evidence posture',
    tone: 'orange',
  },
  {
    body: 'Seven events carry operational readiness risk because owner, attendee, or packet inputs are not fully reconciled.',
    icon: AlertTriangle,
    progress: 58,
    status: 'review-required',
    title: 'Risk posture',
    tone: 'amber',
  },
  {
    body: 'Final-lock candidates have signed approvals, uploaded packet sources, and no open blocker cards.',
    icon: ShieldCheck,
    progress: 92,
    status: 'ready',
    title: 'Lock readiness',
    tone: 'green',
  },
];

const evidenceSignals: readonly EvidenceSignal[] = [
  {
    artifacts: '4 / 7 artifacts',
    due: 'Jun 20, 2026',
    id: 'EVT-2406',
    owner: 'QAPI Lead',
    progress: 52,
    status: 'missing-evidence',
    title: 'QAPI governing body packet',
    tone: 'orange',
  },
  {
    artifacts: '5 / 6 artifacts',
    due: 'Jun 21, 2026',
    id: 'EVT-2411',
    owner: 'Clinical Manager',
    progress: 68,
    status: 'pending',
    title: 'High-risk patient recertification review',
    tone: 'amber',
  },
  {
    artifacts: '8 / 8 artifacts',
    due: 'Jun 24, 2026',
    id: 'EVT-2420',
    owner: 'Administrator',
    progress: 88,
    status: 'validated',
    title: 'Emergency drill after-action review',
    tone: 'teal',
  },
  {
    artifacts: '6 / 6 artifacts',
    due: 'Jun 25, 2026',
    id: 'EVT-2434',
    owner: 'Governing Body',
    progress: 96,
    status: 'signed',
    title: 'Final policy packet lock',
    tone: 'green',
  },
];

const eventLanes: readonly BoardLaneData[] = [
  {
    cards: [
      {
        chips: ['Missing evidence', '4 / 7 artifacts'],
        due: 'Jun 20',
        id: 'EVT-2406',
        owner: 'QAPI Lead',
        progress: 52,
        title: 'QAPI governing body packet needs source minutes',
        tone: 'orange',
      },
      {
        chips: ['Signature gap', 'Administrator'],
        due: 'Jun 20',
        id: 'EVT-2408',
        owner: 'Administrator',
        progress: 46,
        title: 'Incident trend review missing final approver',
        tone: 'orange',
      },
      {
        chips: ['Owner gap', 'Policy council'],
        due: 'Jun 21',
        id: 'EVT-2410',
        owner: 'Compliance Officer',
        progress: 39,
        title: 'Surveyor-request evidence binder escalation',
        tone: 'orange',
      },
    ],
    count: 4,
    title: 'Critical overdue',
    tone: 'orange',
  },
  {
    cards: [
      {
        chips: ['Pending review', '5 / 6 artifacts'],
        due: 'Jun 21',
        id: 'EVT-2411',
        owner: 'Clinical Manager',
        progress: 68,
        title: 'High-risk patient recertification review',
        tone: 'amber',
      },
      {
        chips: ['Attendees', 'DON'],
        due: 'Jun 22',
        id: 'EVT-2416',
        owner: 'Director of Nursing',
        progress: 61,
        title: 'Clinical record audit readout needs attendee lock',
        tone: 'amber',
      },
      {
        chips: ['Training', 'Roster delta'],
        due: 'Jun 22',
        id: 'EVT-2418',
        owner: 'HR Coordinator',
        progress: 72,
        title: 'Annual competency roster reconciliation',
        tone: 'amber',
      },
    ],
    count: 7,
    title: 'At risk',
    tone: 'amber',
  },
  {
    cards: [
      {
        chips: ['Validated', '8 / 8 artifacts'],
        due: 'Jun 24',
        id: 'EVT-2420',
        owner: 'Administrator',
        progress: 88,
        title: 'Emergency drill after-action review',
        tone: 'teal',
      },
      {
        chips: ['Uploaded', 'Clinical'],
        due: 'Jun 24',
        id: 'EVT-2424',
        owner: 'Clinical Manager',
        progress: 84,
        title: 'Medication reconciliation audit packet',
        tone: 'teal',
      },
      {
        chips: ['Ready', 'Policy refs'],
        due: 'Jun 25',
        id: 'EVT-2427',
        owner: 'Policy Admin',
        progress: 79,
        title: 'Patient-rights annual attestation review',
        tone: 'teal',
      },
    ],
    count: 12,
    title: 'Evidence ready',
    tone: 'teal',
  },
  {
    cards: [
      {
        chips: ['Signed', '6 / 6 artifacts'],
        due: 'Jun 25',
        id: 'EVT-2434',
        owner: 'Governing Body',
        progress: 96,
        title: 'Final policy packet lock',
        tone: 'green',
      },
      {
        chips: ['Certified', 'Hash chain'],
        due: 'Jun 26',
        id: 'EVT-2438',
        owner: 'Compliance Officer',
        progress: 100,
        title: 'Personnel file completeness evidence set',
        tone: 'green',
      },
      {
        chips: ['Locked', 'Survey export'],
        due: 'Jun 26',
        id: 'EVT-2441',
        owner: 'Systems',
        progress: 94,
        title: 'Survey packet export verification',
        tone: 'green',
      },
    ],
    count: 6,
    title: 'Lock ready',
    tone: 'green',
  },
];

export function EventsBoardScreen() {
  return (
    <div className="grid gap-xl">
      <MetricGrid metrics={eventMetrics} />

      <section className="grid gap-lg">
        <div className="flex flex-wrap items-start justify-between gap-lg rounded-lg border border-card bg-surface p-lg shadow-rest">
          <div className="grid gap-md">
            <div className="flex flex-wrap gap-sm">
              <ToneTag tone="teal">/ces/events</ToneTag>
              <ToneTag tone="slate">events-board</ToneTag>
              <ToneTag tone="slate">board</ToneTag>
              <ToneBadge size="sm" status="review-required" />
            </div>
            <div>
              <h2 className="text-h2 font-medium text-ink">CES events board</h2>
              <p className="mt-xs max-w-content text-sm text-secondary">
                Operational compliance events grouped by risk, evidence readiness, and final-lock posture.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-sm">
            <Button
              iconLeft={<CalendarClock aria-hidden="true" className="h-icon-sm w-icon-sm" />}
              size="sm"
              variant="secondary"
            >
              June window
            </Button>
            <Button
              className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange"
              iconLeft={<Upload aria-hidden="true" className="h-icon-sm w-icon-sm" />}
              size="sm"
            >
              Packet queue
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-lg rounded-lg border border-card bg-surface p-lg shadow-rest">
          <div aria-label="Event status filters" className="flex flex-wrap gap-sm">
            {eventFilters.map((filter) => {
              const Icon = filter.icon;

              return (
                <Button
                  iconLeft={<Icon aria-hidden="true" className="h-icon-sm w-icon-sm" />}
                  key={filter.label}
                  selected={filter.selected}
                  size="sm"
                  variant={filter.selected ? 'primary' : 'secondary'}
                >
                  {filter.label}
                </Button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-sm">
            <ToneTag tone="orange">4 critical</ToneTag>
            <ToneTag tone="amber">7 at risk</ToneTag>
            <ToneTag tone="green">6 lock ready</ToneTag>
          </div>
        </div>
      </section>

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(320px,1fr)]">
        <div aria-label="Events board lanes" className="overflow-x-auto pb-sm" role="region" tabIndex={0}>
          <div className="grid gap-lg laptop:flex laptop:min-w-[960px] laptop:items-stretch">
            {eventLanes.map((lane) => (
              <div className="laptop:w-[240px] laptop:flex-none" key={lane.title}>
                <BoardLane lane={lane} />
              </div>
            ))}
          </div>
        </div>

        <aside className="grid gap-lg">
          {eventHealthCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
        </aside>
      </section>

      <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
        <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
          <div>
            <h2 className="text-h2 font-medium text-ink">Evidence and status signals</h2>
            <p className="mt-xs max-w-content text-sm text-muted">
              Event-level evidence chips, owner state, and progress mirror the active board cards.
            </p>
          </div>
          <Badge variant="count">30 expected artifacts</Badge>
        </div>
        <div className="grid gap-md">
          {evidenceSignals.map((signal) => (
            <div className="border-t border-card pt-md first:border-t-0 first:pt-0" key={signal.id}>
              <div className="grid gap-md tablet-l:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] tablet-l:items-center">
                <div className="min-w-0">
                  <div className="mb-sm flex flex-wrap items-center gap-sm">
                    <ToneTag tone={signal.tone}>{signal.id}</ToneTag>
                    <ToneBadge size="sm" status={signal.status} />
                    <Badge size="sm">{signal.artifacts}</Badge>
                  </div>
                  <h3 className="text-body font-light text-ink">{signal.title}</h3>
                  <p className="mt-xs text-xs text-muted">
                    {signal.owner} - {signal.due}
                  </p>
                </div>
                <div className={cx('rounded-lg border p-md', toneSurfaceClasses[signal.tone])}>
                  <ProgressMeter label="Readiness" tone={signal.tone} value={signal.progress} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default EventsBoardScreen;
