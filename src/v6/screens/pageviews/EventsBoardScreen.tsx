import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, FileCheck2, Filter, LockKeyhole, ShieldCheck, Users } from 'lucide-react';
import { BoardLane, MetricGrid, ProgressMeter, SurfaceCard, ToneTag, toneGlassSurfaceClasses, type BoardLaneData, type MetricTileData, type SurfaceCardData } from '../../components';
import { Badge, Button, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';
import { buildEventLanes, FALLBACK_EVENT_LANES, getBucketFromParams } from '@/policy/ces/cesViewProjections';
import { V3_ExecutionUnitsSeed } from '@/policy/ces/data/V3_CES_SeedData';
import type { ExecutionUnit } from '@/policy/ces/types';

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

// Values overridden at runtime by eventMetricsDerived using real lane.count from buildEventLanes (seed .length)
const eventMetrics: readonly MetricTileData[] = [
  { label: 'Critical & Overdue', value: '0', helper: 'Past due or high impact', tone: 'orange' },
  { label: 'At Risk', value: '0', helper: 'Watch items', tone: 'amber' },
  { label: 'Needs Attention', value: '0', helper: 'Active reviews', tone: 'teal' },
  { label: 'On Track', value: '0', helper: 'Within SLA', tone: 'green' },
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

// Derived from the real V3 execution-unit seed (src/policy/ces/data/V3_CES_SeedData.ts).
// Each unit maps to the same EvidenceSignal row shape consumed by the Evidence tab.
const EVIDENCE_STATE_STATUS: Record<ExecutionUnit['complianceState'], string> = {
  upcoming: 'draft',
  ready: 'validated',
  in_progress: 'review',
  awaiting_signature: 'pending',
  blocked: 'missing-evidence',
  completed: 'signed',
};

const EVIDENCE_STATE_TONE: Record<ExecutionUnit['complianceState'], Tone> = {
  upcoming: 'slate',
  ready: 'green',
  in_progress: 'teal',
  awaiting_signature: 'amber',
  blocked: 'orange',
  completed: 'green',
};

function unitToEvidenceSignal(u: ExecutionUnit): EvidenceSignal {
  const total = u.evidenceStatus.requiredFormsTotal;
  const complete = u.evidenceStatus.requiredFormsComplete;
  const progress = total > 0 ? Math.round((complete / total) * 100) : 0;
  return {
    artifacts: `${complete} / ${total} artifacts`,
    due: u.dueDate,
    id: u.id,
    owner: u.owner.name || u.owner.role || '—',
    progress,
    status: EVIDENCE_STATE_STATUS[u.complianceState],
    title: u.title,
    tone: EVIDENCE_STATE_TONE[u.complianceState],
  };
}

const evidenceSignals: readonly EvidenceSignal[] = V3_ExecutionUnitsSeed.map(unitToEvidenceSignal);

const eventLanes: readonly BoardLaneData[] = buildEventLanes() || FALLBACK_EVENT_LANES; // 1.4 wired to projection

// Metric tiles derived from the real event-lane counts (same labels/tones/helpers as before).
const eventMetricsDerived: readonly MetricTileData[] = eventMetrics.map((tile) => {
  const lane = eventLanes.find((l) => l.title === tile.label);
  return lane ? { ...tile, value: String(lane.count) } : tile;
});
// filteredLanes computation moved inside EventsBoardScreen function

// old eventLanes body fully cleaned

export function EventsBoardScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: 'board' | 'evidence' = searchParams.get('tab') === 'evidence' ? 'evidence' : 'board';
  const setActiveTab = (tab: 'board' | 'evidence') => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('tab', tab);
      return next;
    });
  };
  const [activeFilter, setActiveFilter] = useState(() => {
    const b = getBucketFromParams(searchParams);
    // visible pre-filter if bucket param matches a known filter label
    const known = ['All events', 'Critical', 'Missing evidence', 'Owner gaps', 'Ready to lock'];
    return b && known.includes(b) ? b : 'All events';
  });

  const filteredLanes = eventLanes.filter(lane => {
    if (activeFilter === 'All events') return true;
    if (activeFilter === 'Critical') return lane.title.includes('Critical');
    if (activeFilter === 'Missing evidence') return lane.cards.some((c: any) => c.awaitingType === 'evidence' || c.missing);
    if (activeFilter === 'Owner gaps') return lane.cards.some((c: any) => !c.owner || c.owner.includes('?'));
    if (activeFilter === 'Ready to lock') return lane.title.includes('On Track') || lane.title.includes('Certified');
    return true;
  });

  return (
    <div className="grid gap-lg">
      <MetricGrid metrics={eventMetricsDerived} />

      <section className="grid gap-md">
        {/* Premium Segmented Tab Control */}
        <div className="flex justify-start">
          <div className="flex rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset/30 p-xs gap-xs">
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
          <div className="flex flex-wrap items-center justify-between gap-md rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-md overflow-hidden shadow-rest">
            <div aria-label="Event status filters" className="flex flex-wrap gap-sm">
              {eventFilters.map((filter) => {
                const Icon = filter.icon;
                const isSelected = filter.label === activeFilter;
                return (
                  <Button
                    iconLeft={<Icon aria-hidden="true" className="h-icon-sm w-icon-sm" />}
                    key={filter.label}
                    selected={isSelected}
                    size="sm"
                    variant={isSelected ? 'primary' : 'secondary'}
                    onClick={() => setActiveFilter(filter.label)}
                  >
                    {filter.label}
                  </Button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-sm">
              <ToneTag tone="orange">{eventMetricsDerived.find(m => m.label.includes('Critical'))?.value ?? '0'} Critical &amp; Overdue</ToneTag>
              <ToneTag tone="amber">{eventMetricsDerived.find(m => m.label.includes('At Risk'))?.value ?? '0'} At Risk</ToneTag>
              <ToneTag tone="teal">{eventMetricsDerived.find(m => m.label.includes('Needs'))?.value ?? '0'} Needs Attention</ToneTag>
              <ToneTag tone="green">{eventMetricsDerived.find(m => m.label.includes('On Track'))?.value ?? '0'} On Track</ToneTag>
            </div>
          </div>
        )}
      </section>

      {activeTab === 'board' ? (
        <section className="grid gap-lg grid-cols-1">
          <div aria-label="Events board lanes" className="min-w-0 overflow-x-auto overflow-y-hidden pb-sm [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" role="region" tabIndex={0}>
            <div className="flex gap-sm min-w-full w-max">
              {filteredLanes.map((lane) => (
                <div className="w-[280px] sm:w-[320px] shrink-0 desktop:flex-1" key={lane.title}>
                  <BoardLane lane={lane} onCardClick={(card) => navigate(`/evidence?control=${encodeURIComponent(card?.id || '')}`)} />
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
        <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest">
          <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
            <div>
              <h2 className="text-h2 font-medium text-ink">Evidence and status signals</h2>
              <p className="mt-xs max-w-content text-sm text-muted">
                Event-level evidence chips, owner state, and progress mirror the active board cards.
              </p>
            </div>
            <Badge variant="count">{V3_ExecutionUnitsSeed.reduce((s, u) => s + ((u.evidenceStatus?.requiredFormsTotal) || 0), 0)} expected artifacts</Badge>
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
