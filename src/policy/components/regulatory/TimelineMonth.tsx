import { useMemo } from 'react';
import { Lock } from 'lucide-react';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { getEventDisplayModel } from '@/policy/data/eventDisplayModel';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { useShellStore } from '@/policy/stores/uiStore';
import {
  classifyInstance, STATE_COLOR, STATE_SOFT,
  type InstanceState,
} from './timelineState';
import { AUDIT_STATE_COLOR } from '@/policy/audit/auditState';
import {
  CesSpotlightCard,
  getCesEventSpotlightTone,
} from '@/policy/ces/components/calendar/CesEventInteraction';

/* ═══════════════════════════════════════════════════════════════
   TimelineMonth — workflow-instance-only month grid.
   Renders a 5/6-row grid where every chip IS a workflow instance
   and color derives ONLY from execution state:

     red   = overdue / block
     amber = due soon
     teal  = on track / complete

   No domain color, no "read-only" event cards. Clicking a chip
   opens the execution panel (parent handles selection).
   ═══════════════════════════════════════════════════════════════ */

export interface TimelineMonthProps {
  year: number;
  month: number;                 // 0-indexed
  events: RegulatoryEvent[];     // already scoped to the current month
  activeId?: string | null;
  onSelect: (event: RegulatoryEvent) => void;
  today: Date;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function TimelineMonth({
  year, month, events, activeId, onSelect, today,
}: TimelineMonthProps) {
  const store = useRegulatoryExecutionStore();
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');

  const { cells, weeks } = useMemo(() => {
    const first = new Date(year, month, 1);
    const startOffset = first.getDay();
    const gridStart = new Date(year, month, 1 - startOffset);

    const byDate: Record<string, RegulatoryEvent[]> = {};
    events.forEach(e => { (byDate[e.date] = byDate[e.date] || []).push(e); });

    const todayISO = iso(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

    const cells = Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      const dISO = iso(d);
      return {
        dateISO: dISO,
        day: d.getDate(),
        outOfMonth: d.getMonth() !== month,
        isToday: dISO === todayISO,
        events: byDate[dISO] || [],
      };
    });
    const last = cells.slice(35);
    const trimmed = last.every(c => c.outOfMonth && c.events.length === 0) ? cells.slice(0, 35) : cells;
    return { cells: trimmed, weeks: trimmed.length / 7 };
  }, [year, month, events, today]);

  return (
    <div className="flex h-full flex-col min-h-0 flex-1">
      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-px pb-1.5">
        {WEEKDAYS.map(w => (
          <div
            key={w}
            className={`text-center font-montserrat font-bold uppercase tracking-[0.24em] ${isLight ? 'text-slate-500' : 'text-white/40'}`}
            style={{ fontSize: 9 }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div
        className="grid grid-cols-7 gap-px rounded-xl overflow-hidden border border-white/10 flex-1 min-h-0"
        style={{
          background: isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.05)',
          borderColor: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.10)',
          gridTemplateRows: `repeat(${weeks}, minmax(0, 1fr))`,
        }}
      >
        {cells.map(cell => (
          <DayCell
            key={cell.dateISO}
            cell={cell}
            activeId={activeId ?? null}
            onSelect={onSelect}
            today={today}
            store={store}
            isLight={isLight}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Day cell ─────────────────────────────────────────── */
function DayCell({
  cell, activeId, onSelect, today, store,
  isLight,
}: {
  cell: { dateISO: string; day: number; outOfMonth: boolean; isToday: boolean; events: RegulatoryEvent[] };
  activeId: string | null;
  onSelect: (e: RegulatoryEvent) => void;
  today: Date;
  store: ReturnType<typeof useRegulatoryExecutionStore.getState>;
  isLight: boolean;
}) {
  const eventsToShow = cell.events.slice(0, 2);
  const overflow = cell.events.length - eventsToShow.length;

  return (
    <div
      className="relative flex min-h-0 flex-col p-1.5 transition-colors duration-200 hover:bg-white/[0.03]"
      style={{
        background: cell.outOfMonth
          ? 'var(--ci-cell-out, rgba(0,0,0,0.10))'
          : cell.isToday
            ? 'var(--ci-cell-today, rgba(20,184,166,0.08))'
            : 'var(--ci-cell-day, transparent)',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`inline-flex items-center justify-center font-montserrat font-bold transition-colors ${
            cell.isToday
              ? 'rounded-full text-white w-6 h-6'
              : cell.outOfMonth
                ? (isLight ? 'text-slate-300' : 'text-white/25')
                : (isLight ? 'text-slate-700' : 'text-white/75')
          }`}
          style={{
            fontSize: 11,
            background: cell.isToday ? '#14B8A6' : undefined,
          }}
        >
          {cell.day}
        </span>
      </div>
      <div className="flex min-h-0 flex-col gap-1 overflow-y-auto custom-scrollbar">
        {eventsToShow.map(ev => (
          <TimelineChip
            key={ev.id}
            event={ev}
            active={ev.id === activeId}
            today={today}
            store={store}
            isLight={isLight}
            onClick={() => onSelect(ev)}
          />
        ))}
        {overflow > 0 && (
          <button
            className={`self-start font-montserrat font-bold px-1 ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/55 hover:text-white'}`}
            style={{ fontSize: 9 }}
            onClick={() => { if (cell.events[eventsToShow.length]) onSelect(cell.events[eventsToShow.length]); }}
          >
            + {overflow} more
          </button>
        )}
      </div>
    </div>
  );
}



/* ─── Timeline chip (state-colored only) ────────────────── */
function TimelineChip({
  event, active, today, store, onClick,
  isLight,
}: {
  event: RegulatoryEvent;
  active?: boolean;
  today: Date;
  store: ReturnType<typeof useRegulatoryExecutionStore.getState>;
  onClick: () => void;
  isLight: boolean;
}) {
  const state: InstanceState = classifyInstance(event, today, store);
  const certified = store.isCertified(event.id);
  const { canonicalPolicyRefs } = getEventDisplayModel(event);
  const subtitle = canonicalPolicyRefs.length > 0 ? canonicalPolicyRefs.slice(0, 2).join(' / ') : null;
  // Certified instances are visually distinct from active execution —
  // violet rail, lock glyph, and a subtle tinted background so the
  // eye immediately registers "locked record" from across the grid.
  const color = certified ? AUDIT_STATE_COLOR['certified-locked'] : STATE_COLOR[state];
  const bg    = certified ? 'rgba(167,139,250,0.10)' : STATE_SOFT[state];
  const spotlightColor = getCesEventSpotlightTone(state, certified);
  const toneClassName =
    certified || state === 'complete' ? 'ces-card-spotlight-complete'
    : state === 'blocked' || state === 'overdue' ? 'ces-card-spotlight-critical'
    : '';

  return (
    <CesSpotlightCard
      onClick={onClick}
      title={certified ? `${event.title} — Certified & Locked` : event.title}
      ariaLabel={`Open ${event.title}`}
      spotlightColor={spotlightColor}
      toneClassName={toneClassName}
      className="group relative w-full text-left rounded-md transition-colors duration-150 px-1.5 py-1"
      style={{
        background: active ? `${color}18` : bg,
        border: `1px solid ${active ? color : `${color}55`}`,
      }}
    >
      <div className="flex items-start gap-1.5 pr-4">
        <span
          aria-hidden
          className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: color }}
        />
        <div className="min-w-0">
          <p
            className={`font-montserrat font-bold leading-tight truncate ${isLight ? 'text-slate-800' : 'text-white'}`}
            style={{ fontSize: 10 }}
          >
            {event.title}
          </p>
          {subtitle && (
            <p className={`font-roboto truncate leading-snug ${isLight ? 'text-slate-500' : 'text-white/55'}`} style={{ fontSize: 9 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {certified && (
        <span
          aria-label="Certified & Locked"
          className="absolute top-1 right-1 inline-flex items-center justify-center rounded-sm"
          style={{
            width: 12, height: 12,
            background: `${color}33`,
            color,
          }}
        >
          <Lock size={8} />
        </span>
      )}
    </CesSpotlightCard>
  );
}
