import { useMemo } from 'react';
import { EventChip } from './EventChip';
import { daysUntil, TODAY_ANCHOR, type RegulatoryEvent } from '@/policy/data/regulatoryEvents';

/* ═══════════════════════════════════════════════════════════════
   MonthGrid — the Regulatory Planner month view.
   Emphasizes today, renders event chips with domain + urgency.
   ═══════════════════════════════════════════════════════════════ */

export interface MonthGridProps {
  year: number;
  month: number;             // 0-indexed
  events: RegulatoryEvent[];
  activeEventId?: string;
  onEventClick?: (e: RegulatoryEvent) => void;
  onDayClick?: (dateISO: string) => void;
  today?: Date;
}

interface Cell {
  dateISO: string;
  day: number;
  outOfMonth: boolean;
  isToday: boolean;
  events: RegulatoryEvent[];
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function MonthGrid({
  year, month, events, activeEventId, onEventClick, onDayClick,
  today = TODAY_ANCHOR,
}: MonthGridProps) {

  const { cells, weeks } = useMemo(() => {
    const first = new Date(year, month, 1);
    const startOffset = first.getDay();
    const gridStart = new Date(year, month, 1 - startOffset);

    const byDate: Record<string, RegulatoryEvent[]> = {};
    events.forEach(e => {
      (byDate[e.date] = byDate[e.date] || []).push(e);
    });

    const todayISO = iso(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

    const cells: Cell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      const dISO = iso(d);
      cells.push({
        dateISO: dISO,
        day: d.getDate(),
        outOfMonth: d.getMonth() !== month,
        isToday: dISO === todayISO,
        events: byDate[dISO] || [],
      });
    }
    // Trim to 5 weeks if possible (collapse empty trailing week)
    const lastWeek = cells.slice(35);
    const trimmed = lastWeek.every(c => c.outOfMonth && c.events.length === 0) ? cells.slice(0, 35) : cells;
    return { cells: trimmed, weeks: trimmed.length / 7 };
  }, [year, month, events, today]);

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-px pb-2">
        {WEEKDAYS.map(w => (
          <div
            key={w}
            className="text-center font-montserrat font-bold text-white/40 uppercase tracking-[0.24em]"
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
          background: 'rgba(255,255,255,0.06)',
          gridTemplateRows: `repeat(${weeks}, minmax(0, 1fr))`,
        }}
      >
        {cells.map(cell => {
          const eventsToShow = cell.events.slice(0, 2);
          const overflow = cell.events.length - eventsToShow.length;
          const n = daysUntil(cell.dateISO, today);
          const isPast = n < 0;
          return (
            <div
              key={cell.dateISO}
              onClick={() => onDayClick?.(cell.dateISO)}
              className="relative flex flex-col p-1.5 cursor-pointer transition-colors duration-200 hover:bg-white/[0.03]"
              style={{
                background: cell.outOfMonth
                  ? 'var(--ci-cell-out)'
                  : cell.isToday
                    ? 'var(--ci-cell-today)'
                    : 'var(--ci-cell-day)',
              }}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-flex items-center justify-center font-montserrat font-bold transition-colors ${
                    cell.isToday
                      ? 'rounded-full bg-[#FFC107] text-[#420808] w-6 h-6'
                      : cell.outOfMonth
                        ? 'text-white/25'
                        : isPast
                          ? 'text-white/45'
                          : 'text-white/80'
                  }`}
                  style={{ fontSize: cell.isToday ? 11 : 11 }}
                >
                  {cell.day}
                </span>
              </div>

              {/* Events */}
              <div className="flex flex-col gap-1 overflow-hidden">
                {eventsToShow.map(ev => (
                  <EventChip
                    key={ev.id}
                    event={ev}
                    onClick={e => { onEventClick?.(e); }}
                    active={ev.id === activeEventId}
                    dense
                  />
                ))}
                {overflow > 0 && (
                  <span
                    className="self-start font-montserrat font-bold text-white/55 hover:text-[#FFC107] cursor-pointer px-1"
                    style={{ fontSize: 9 }}
                    onClick={e => {
                      e.stopPropagation();
                      onDayClick?.(cell.dateISO);
                    }}
                  >
                    + {overflow} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
