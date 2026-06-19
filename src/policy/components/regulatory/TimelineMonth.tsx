import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { useIsLight } from '@/policy/stores/uiStore';
import {
  classifyInstance,
  type InstanceState,
} from './timelineState';
import {
  CesEventOverviewCard,
  CesSpotlightCard,
  getCesEventSpotlightTone,
  getCesHoverCardPosition,
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

function getReferenceCalendarTone(state: InstanceState, certified: boolean, isLight?: boolean) {
  // Match design #4 (CES clean light grid, subtle tints like #ccfbf1 teal / #ffedd5 orange for pills, no dark bleed).
  // Light uses clean tints + colored text. Dark keeps high-contrast solid fills.
  const teal = '#007970';
  const tealLight = '#00D1C1';
  const orange = '#E07B2C';
  const orangeLight = '#FFA059';
  const red = '#D70101';
  if (certified || state === 'complete' || state === 'on-track') {
    if (isLight) {
      return {
        fill: '#CCFBF1',
        text: teal,
        border: 'rgba(0,121,112,0.35)',
      };
    }
    return {
      fill: '#0F766E',
      text: tealLight,
      border: '#115E59',
    };
  }
  if (state === 'due-soon') {
    if (isLight) {
      return {
        fill: '#FFEDD5',
        text: orange,
        border: 'rgba(224,123,44,0.40)',
      };
    }
    return {
      fill: '#854D0E',
      text: orangeLight,
      border: '#A16207',
    };
  }
  // overdue / blocked
  if (isLight) {
    return {
      fill: '#FEE2E2',
      text: red,
      border: 'rgba(215,1,1,0.35)',
    };
  }
  return {
    fill: '#3F1F29',
    text: '#FCA5A5',
    border: '#7F1D1D',
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
  const isLight = useIsLight(); // from audited useShellStore (isLight/isLightMode)
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
    <div className="ces-calendar-grid flex h-full min-h-0 flex-1 flex-col w-full overflow-hidden" style={{ background: isLight ? 'var(--ces-canvas)' : 'var(--v3-base-bg)', border: 'none' }}>
      {/* Month label — clean corporate exact to #4 CES design, no borders, uses live year/month */}
      <div
        className="px-2 pt-1 pb-0.5 text-[12px] font-semibold tracking-[0.06em] text-[var(--v3-text-primary)]"
        style={{ border: 'none', background: 'inherit' }}
      >
        {new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </div>
      {/* Weekday header — clean corporate, no hairline bleed per Image #4 */}
      <div
        className="grid grid-cols-7 w-full overflow-hidden"
        style={{ border: 'none', background: isLight ? 'var(--ces-canvas)' : 'var(--v3-base-bg)' }}
      >
        {WEEKDAYS.map(w => (
          <div
            key={w}
            className={`px-2 py-2.5 text-center font-montserrat font-bold uppercase tracking-[0.2em] ${isLight ? 'text-slate-500' : 'text-white/40'} overflow-hidden`}
            style={{ fontSize: 9, border: 'none' }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Month grid — clean full-area corporate, no borders/grid-lines, full bleed per Image #4 */}
      <div
        className="grid min-h-0 flex-1 grid-cols-7 w-full h-full max-w-full overflow-x-hidden overflow-hidden"
        style={{
          border: 'none',
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
      className="calendar-day-cell relative flex min-h-0 flex-col px-2 py-2 transition-colors duration-200 w-full h-full overflow-hidden"
      style={{
        border: 'none',
        background: cell.outOfMonth
          ? (isLight ? 'var(--ces-canvas)' : 'rgba(255,255,255,0.02)')
          : cell.isToday
            ? 'rgba(0, 121, 112, 0.08)'
            : (isLight ? 'var(--ces-canvas)' : 'rgba(255,255,255,0.015)'),
      }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        {cell.outOfMonth ? (
          <span aria-hidden className="h-6 w-6" />
        ) : (
          <span
            className={`inline-flex items-center justify-center font-montserrat font-bold transition-colors ${
              cell.isToday
                ? 'h-5 w-5 rounded-full text-white'
                : 'text-[var(--ci-text-muted-2,#52404B)]'
            }`}
            style={{
              fontSize: 10,
              background: cell.isToday ? 'var(--v3-teal, #007970)' : undefined,
            }}
          >
            {cell.day}
          </span>
        )}
      </div>
      <div className="flex min-h-0 flex-col gap-1 overflow-y-auto custom-scrollbar overflow-hidden">
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
            className={`self-start px-1 font-montserrat font-bold text-[var(--ci-text-muted-2,#52404B)] hover:text-[var(--ci-text-primary,#1F1C1B)]`}
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
  event, active: _active, today, store, onClick,
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
  const tone = getReferenceCalendarTone(state, certified, isLight);
  const spotlightColor = getCesEventSpotlightTone(state, certified);
  const toneClassName =
    certified || state === 'complete' ? 'ces-card-spotlight-complete'
    : state === 'blocked' || state === 'overdue' ? 'ces-card-spotlight-critical'
    : '';

  return (
    <CesSpotlightCard
      onClick={onClick}
      ariaLabel={`Open ${event.title}`}
      spotlightColor={spotlightColor}
      toneClassName={toneClassName}
      className="ces-event-pill group relative w-full overflow-hidden px-2 py-[3px] text-left transition-colors duration-150"
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
        border: 'none', // clean corporate no border on event pills per Image #4
        borderRadius: '999px', // pills use radius 999px
        boxShadow: 'none', // eliminate spotlight bleed/overlap on event pill
      }}
    >
      <div className="flex items-center gap-1.5 pr-1 overflow-hidden" style={{ minHeight: '16px' }}>
        <span
          aria-hidden
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: tone.text, opacity: 0.85 }}
        />
        <p
          className={`font-montserrat font-semibold leading-none truncate tracking-[0.08em]`}
          style={{
            fontSize: 9.5,
            color: tone.text,
          }}
        >
          {event.title}
        </p>
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
  // BEFORE (old local logic): duplicated viewport calc with 520px hardcoded estH, no reuse
  // AFTER (improved): delegates to getCesHoverCardPosition (left flip + top adjust + maxH overflow)
  // Ensures consistent positioning across hover cards; prevents viewport clipping + bleed.
  const pos = getCesHoverCardPosition(anchorRect);
  // also apply bleed containment inline for robustness in dark/light
  const hoverStyle: React.CSSProperties = {
    top: pos.top,
    left: pos.left,
    width: pos.width,
    maxHeight: pos.maxHeight,
    overflow: 'auto',
    contain: 'layout paint style',
    isolation: 'isolate',
  };

  return createPortal(
    <div
      className="fixed z-[122] hidden md:block ces-hover-card"
      style={hoverStyle}
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
