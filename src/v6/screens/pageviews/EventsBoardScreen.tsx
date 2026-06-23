import { useState } from 'react';
import { AlertTriangle, FileCheck2, Filter, LockKeyhole, ShieldCheck, Users } from 'lucide-react';
import { BoardLane, MetricGrid, ProgressMeter, SurfaceCard, ToneTag, toneGlassSurfaceClasses, type BoardLaneData, type MetricTileData, type SurfaceCardData } from '../../components';
import { Badge, Button, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';

// Design cross-ref (Agent 13 background): events-board vs V6_DESIGN.html ~508 (eventsBoardColumns) and ~1334 view.
// Exact 4-col titles (Critical & Overdue / At Risk / Needs Attention / On Track), card fields (id/title/owner/domain/due/meta/chips/progress/tone/awaitingType/missing),
// grid desktop:grid-cols-4, BoardLane rendering, sorting by due. Pragmatic counts (design uses 162 illustrative for Critical); full EVT-REV + shared items match design.
// Proposals: dynamic from seeds/snapshot, use illustrative 162+ for demo mode, enhance filters to match design interactions. See also RepresentativeScreens events-board case, BoardLane, V3_CES_SeedData.

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
  { label: 'Critical & Overdue', value: '4', helper: 'Past due or high impact', tone: 'orange' },
  { label: 'At Risk', value: '4', helper: 'Watch items', tone: 'amber' },
  { label: 'Needs Attention', value: '12', helper: 'Active reviews', tone: 'teal' },
  { label: 'On Track', value: '28', helper: 'Within SLA', tone: 'green' },
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
        chips: ['Incident', 'CAPA'],
        due: 'Jun 19',
        id: 'EVT-REV-03',
        owner: 'Compliance Officer',
        domain: 'Compliance / Incident Mgmt',
        progress: 55,
        title: 'Incident / Adverse Event Review',
        tone: 'orange',
        meta: 'Root cause analysis + corrective action evidence',
        awaitingType: 'action',
        missing: 'RCA sign-off',
      },
      {
        chips: ['OIG', 'SAM', 'HR-TA-003'],
        due: 'Jun 25',
        id: 'EVT-MO-OIG',
        owner: 'Compliance Officer',
        progress: 40,
        title: 'Monthly OIG / SAM Exclusion Check',
        tone: 'orange',
      },
      {
        chips: ['Infection', 'Action'],
        due: 'Jun 18',
        id: 'EVT-REV-02',
        owner: 'Clinical Manager',
        domain: 'Clinical',
        progress: 42,
        title: 'Q1 Infection Control Review',
        tone: 'amber',
        meta: 'Surveillance log, hand hygiene trends, PPE compliance',
        awaitingType: 'evidence',
        missing: 'log upload',
      },
      {
        chips: ['Grievance', 'Evidence'],
        due: 'Jun 22',
        id: 'EVT-REV-04',
        owner: 'Risk Manager',
        domain: 'Risk',
        progress: 28,
        title: 'Complaint / Grievance Investigation',
        tone: 'amber',
        meta: 'Investigation notes, resolution evidence, follow-up',
        awaitingType: 'evidence',
        missing: '3 docs',
      },
    ],
    count: 4,
    title: 'Critical & Overdue',
    tone: 'orange',
  },
  {
    cards: [
      {
        chips: ['Audit', 'Documentation'],
        due: 'Jun 23',
        id: 'EVT-DA-01',
        owner: 'QAPI Lead',
        domain: 'QAPI / Documentation',
        progress: 65,
        title: 'Documentation Alignment Audit',
        tone: 'amber',
        meta: 'Cross-policy documentation vs regulatory alignment',
      },
      {
        chips: ['QAPI', 'Evidence'],
        due: 'Jun 21',
        id: 'EVT-REV-01',
        owner: 'QAPI Lead',
        domain: 'QAPI',
        progress: 65,
        title: 'Q2 QAPI Review',
        tone: 'amber',
        meta: 'Quarterly indicators, adverse events summary, CAPA tracker',
        awaitingType: 'evidence',
        missing: '2 artifacts',
      },
      {
        chips: ['Visit', 'CL-VN-010'],
        due: 'Jun 22',
        id: 'EVT-VIS-DOC',
        owner: 'QAPI Nurse',
        progress: 71,
        title: 'Visit Documentation Audit',
        tone: 'teal',
      },
      {
        chips: ['Audit', 'Action'],
        due: 'Jun 20',
        id: 'EVT-REV-05',
        owner: 'QAPI Nurse',
        domain: 'QAPI',
        progress: 71,
        title: 'Medication Reconciliation Audit Review',
        tone: 'amber',
        meta: 'Five chart sample + exception findings',
        awaitingType: 'action',
        missing: 'DON review',
      },
    ],
    count: 4,
    title: 'At Risk',
    tone: 'amber',
  },
  {
    cards: [
      {
        chips: ['POC', 'CL-CA-001'],
        due: 'Jun 21',
        id: 'EVT-POC-AUD',
        owner: 'Clinical Manager',
        progress: 82,
        title: 'Plan of Care Audit',
        tone: 'teal',
      },
      {
        chips: ['OASIS', 'CL-OA-101'],
        due: 'Jun 19',
        id: 'EVT-OAS-ACC',
        owner: 'QA Analyst',
        progress: 55,
        title: 'OASIS Accuracy Audit',
        tone: 'teal',
      },
    ],
    count: 12,
    title: 'Needs Attention',
    tone: 'teal',
  },
  {
    cards: [
      {
        chips: ['Ready', 'Evidence'],
        due: 'May 24',
        id: 'CEU-1241',
        owner: 'Systems',
        progress: 88,
        title: 'Emergency drill after-action report',
        tone: 'green',
      },
      {
        chips: ['Certified'],
        due: 'May 8',
        id: 'CEU-1240',
        owner: 'Accounting',
        progress: 100,
        title: 'Personnel file completeness audit - Q1 new hires',
        tone: 'green',
      },
    ],
    count: 28,
    title: 'On Track',
    tone: 'green',
  },
];

export function EventsBoardScreen() {
  const [activeTab, setActiveTab] = useState<'board' | 'evidence'>('board');

  return (
    <div className="grid gap-lg">
      <MetricGrid metrics={eventMetrics} />

      <section className="grid gap-md">
        {/* Premium Segmented Tab Control */}
        <div className="flex justify-start">
          <div className="flex rounded-lg border border-hairline bg-tone-slate-bg/30 p-xs gap-xs">
            <button
              onClick={() => setActiveTab('board')}
              className={cx(
                'px-lg py-sm text-xs font-heading font-medium uppercase tracking-wider rounded-md transition-all duration-fast',
                activeTab === 'board'
                  ? 'bg-brand-teal text-on-brand shadow-rest'
                  : 'text-brand-teal-deep hover:bg-surface-hover hover:text-brand-teal'
              )}
            >
              Events Board
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={cx(
                'px-lg py-sm text-xs font-heading font-medium uppercase tracking-wider rounded-md transition-all duration-fast',
                activeTab === 'evidence'
                  ? 'bg-brand-teal text-on-brand shadow-rest'
                  : 'text-brand-teal-deep hover:bg-surface-hover hover:text-brand-teal'
              )}
            >
              Evidence & Status Signals
            </button>
          </div>
        </div>

        {activeTab === 'board' && (
          <div className="flex flex-wrap items-center justify-between gap-md rounded-lg border border-card bg-surface p-md shadow-rest">
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
              <ToneTag tone="orange">4 Critical &amp; Overdue</ToneTag>
              <ToneTag tone="amber">4 At Risk</ToneTag>
              <ToneTag tone="teal">12 Needs Attention</ToneTag>
              <ToneTag tone="green">28 On Track</ToneTag>
            </div>
          </div>
        )}
      </section>

      {activeTab === 'board' ? (
        <section className="grid gap-lg large:grid-cols-[minmax(0,1fr)_minmax(270px,320px)]">
          <div aria-label="Events board lanes" className="min-w-0 overflow-x-auto overflow-y-hidden pb-sm" role="region" tabIndex={0}>
            <div className="grid min-w-[920px] gap-sm tablet-l:grid-cols-2 desktop:min-w-0 desktop:grid-cols-4">
              {eventLanes.map((lane) => (
                <div className="min-w-0" key={lane.title}>
                  <BoardLane lane={lane} />
                </div>
              ))}
            </div>
          </div>

          <aside className="grid content-start gap-md">
            {eventHealthCards.map((card) => (
              <SurfaceCard card={card} key={card.title} />
            ))}
          </aside>
        </section>
      ) : (
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
                  <div className={cx('rounded-lg p-md', toneGlassSurfaceClasses[signal.tone])}>
                    <ProgressMeter label="Readiness" tone={signal.tone} value={signal.progress} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default EventsBoardScreen;
