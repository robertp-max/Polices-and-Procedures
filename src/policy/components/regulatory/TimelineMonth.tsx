import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { useShellStore } from '@/policy/stores/uiStore';
import {
  classifyInstance,
  type InstanceState,
} from './timelineState';
import {
  CesEventOverviewCard,
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
  onOpenSwimlane: (event: RegulatoryEvent) => void;
  today: Date;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function getReferenceCalendarTone(state: InstanceState, certified: boolean) {
  if (certified || state === 'complete' || state === 'on-track') {
    return {
      fill: '#0F766E',
      text: '#ECFEFF',
      border: '#115E59',
    };
  }
  if (state === 'due-soon') {
    return {
      fill: '#854D0E',
      text: '#FEF3C7',
      border: '#A16207',
    };
  }
  return {
    fill: '#FFE4E6',
    text: '#BE123C',
    border: '#FDA4AF',
  };
}

function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function TimelineMonth({
  year, month, events, activeId, onSelect, onOpenSwimlane, today,
}: TimelineMonthProps) {
  const store = useRegulatoryExecutionStore();
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  const [hoveredEvent, setHoveredEvent] = useState<RegulatoryEvent | null>(null);
  const [hoverAnchor, setHoverAnchor] = useState<DOMRect | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearPendingClose = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const closeHover = () => {
    clearPendingClose();
    setHoveredEvent(null);
    setHoverAnchor(null);
  };

  const scheduleClose = () => {
    clearPendingClose();
    closeTimerRef.current = window.setTimeout(() => {
      setHoveredEvent(null);
      setHoverAnchor(null);
      closeTimerRef.current = null;
    }, 140);
  };

  const openHover = (event: RegulatoryEvent, target: HTMLElement) => {
    clearPendingClose();
    setHoveredEvent(event);
    setHoverAnchor(target.getBoundingClientRect());
  };

  useEffect(() => {
    if (!hoveredEvent) return undefined;
    const closeOnViewportChange = () => closeHover();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeHover();
    };
    window.addEventListener('resize', closeOnViewportChange);
    window.addEventListener('scroll', closeOnViewportChange, true);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('resize', closeOnViewportChange);
      window.removeEventListener('scroll', closeOnViewportChange, true);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [hoveredEvent]);

  useEffect(() => () => clearPendingClose(), []);

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
    <div className="flex h-full min-h-0 flex-1 flex-col bg-[#0B0F15]">
      {/* Weekday header */}
      <div
        className="grid grid-cols-7 border-b border-l"
        style={{ borderColor: '#1C2433', background: '#0B0F15' }}
      >
        {WEEKDAYS.map(w => (
          <div
            key={w}
            className={`border-r px-2 py-3 text-center font-montserrat font-bold uppercase tracking-[0.24em] last:border-r-0 ${isLight ? 'text-slate-500' : 'text-white/40'}`}
            style={{ fontSize: 9, borderColor: '#1C2433' }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div
        className="grid min-h-0 flex-1 grid-cols-7 border-l"
        style={{
          borderColor: '#1C2433',
          gridTemplateRows: `repeat(${weeks}, minmax(138px, 1fr))`,
        }}
      >
        {cells.map(cell => (
          <DayCell
            key={cell.dateISO}
            cell={cell}
            activeId={activeId ?? null}
            onSelect={onSelect}
            onOpenSwimlane={onOpenSwimlane}
            onOpenHover={openHover}
            onCloseHover={scheduleClose}
            today={today}
            store={store}
            isLight={isLight}
          />
        ))}
      </div>
      {hoveredEvent && hoverAnchor ? (
        <TimelineHoverCard
          event={hoveredEvent}
          anchorRect={hoverAnchor}
          today={today}
          onOpenSwimlane={() => onOpenSwimlane(hoveredEvent)}
          onMouseEnter={clearPendingClose}
          onMouseLeave={scheduleClose}
          onClose={closeHover}
        />
      ) : null}
    </div>
  );
}

/* ─── Day cell ─────────────────────────────────────────── */
function DayCell({
  cell, activeId, onSelect, today, store,
  onOpenSwimlane,
  onOpenHover,
  onCloseHover,
  isLight,
}: {
  cell: { dateISO: string; day: number; outOfMonth: boolean; isToday: boolean; events: RegulatoryEvent[] };
  activeId: string | null;
  onSelect: (e: RegulatoryEvent) => void;
  onOpenSwimlane: (event: RegulatoryEvent) => void;
  onOpenHover: (event: RegulatoryEvent, target: HTMLElement) => void;
  onCloseHover: () => void;
  today: Date;
  store: ReturnType<typeof useRegulatoryExecutionStore.getState>;
  isLight: boolean;
}) {
  const eventsToShow = cell.events.slice(0, 2);
  const overflow = cell.events.length - eventsToShow.length;

  return (
    <div
      className="relative flex min-h-0 flex-col border-r border-b px-2 py-2 transition-colors duration-200"
      style={{
        borderColor: '#1C2433',
        background: cell.outOfMonth
          ? '#0B0F15'
          : cell.isToday
            ? '#101722'
            : '#0B0F15',
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        {cell.outOfMonth ? (
          <span aria-hidden className="h-6 w-6" />
        ) : (
          <span
            className={`inline-flex items-center justify-center font-montserrat font-bold transition-colors ${
              cell.isToday
                ? 'h-6 w-6 rounded-full text-white'
                : isLight
                  ? 'text-slate-700'
                  : 'text-white/60'
            }`}
            style={{
              fontSize: 11,
              background: cell.isToday ? '#007970' : undefined,
            }}
          >
            {cell.day}
          </span>
        )}
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
            onOpenSwimlane={() => onOpenSwimlane(ev)}
            onOpenHover={onOpenHover}
            onCloseHover={onCloseHover}
          />
        ))}
        {overflow > 0 && (
          <button
            className={`self-start px-1 font-montserrat font-bold ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/50 hover:text-white'}`}
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
  onOpenSwimlane,
  onOpenHover,
  onCloseHover,
  isLight,
}: {
  event: RegulatoryEvent;
  active?: boolean;
  today: Date;
  store: ReturnType<typeof useRegulatoryExecutionStore.getState>;
  onClick: () => void;
  onOpenSwimlane: () => void;
  onOpenHover: (event: RegulatoryEvent, target: HTMLElement) => void;
  onCloseHover: () => void;
  isLight: boolean;
}) {
  const state: InstanceState = classifyInstance(event, today, store);
  const certified = store.isCertified(event.id);
  const tone = getReferenceCalendarTone(state, certified);
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
      className="group relative w-full rounded-md px-2 py-1 text-left transition-colors duration-150"
      onMouseEnter={eventTarget => onOpenHover(event, eventTarget.currentTarget)}
      onMouseLeave={onCloseHover}
      onFocus={eventTarget => onOpenHover(event, eventTarget.currentTarget)}
      onBlur={onCloseHover}
      onKeyDown={keyboardEvent => {
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          keyboardEvent.preventDefault();
          onOpenSwimlane();
        }
        if (keyboardEvent.key === 'Escape') {
          keyboardEvent.preventDefault();
          onCloseHover();
        }
      }}
      style={{
        background: tone.fill,
        border: `1px solid ${active ? tone.text : tone.border}`,
      }}
    >
      <div className="flex items-start gap-1 pr-2">
        <span
          aria-hidden
          className="mt-[4px] h-1 w-1 shrink-0 rounded-full"
          style={{ background: tone.text, opacity: 0.8 }}
        />
        <div className="min-w-0">
          <p
            className={`font-montserrat font-bold leading-tight ${isLight ? 'text-slate-800' : ''}`}
            style={{
              fontSize: 10,
              color: tone.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {event.title}
          </p>
        </div>
      </div>
    </CesSpotlightCard>
  );
}

function TimelineHoverCard({
  event,
  anchorRect,
  today,
  onOpenSwimlane,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: {
  event: RegulatoryEvent;
  anchorRect: DOMRect;
  today: Date;
  onOpenSwimlane: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}) {
  const width = 460;
  const viewportPadding = 16;
  const preferredLeft = anchorRect.right + 12;
  const left = preferredLeft + width <= window.innerWidth - viewportPadding
    ? preferredLeft
    : Math.max(viewportPadding, Math.min(window.innerWidth - width - viewportPadding, anchorRect.left - width - 12));
  const maxTop = Math.max(viewportPadding, window.innerHeight - 560);
  const top = Math.max(viewportPadding, Math.min(anchorRect.top, maxTop));

  return createPortal(
    <div
      className="fixed z-[80] hidden md:block"
      style={{ top, left, width }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocusCapture={onMouseEnter}
      onBlurCapture={onMouseLeave}
      onKeyDown={eventKey => {
        if (eventKey.key === 'Escape') {
          eventKey.preventDefault();
          onClose();
        }
      }}
    >
      <CesEventOverviewCard event={event} today={today} onOpenSwimlane={onOpenSwimlane} />
    </div>,
    document.body,
  );
}
