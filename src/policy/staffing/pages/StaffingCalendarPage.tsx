import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { PageHeader } from '@/policy/components/ui/PageHeader';
import { EmptyState } from '@/policy/components/ui/EmptyState';
import { DemoBanner } from '../components/DemoBanner';
import { ShiftCard } from '../components/ShiftCard';
import { CalendarFilters } from '../components/CalendarFilters';
import { CalendarViewToggle } from '../components/CalendarViewToggle';
import { WeekCalendarView } from '../components/WeekCalendarView';
import { MonthCalendarView } from '../components/MonthCalendarView';
import { useShiftStore } from '../stores/shiftStore';
import type { CalendarFilterState, CalendarView } from '../types-calendar';

// ── date anchor helpers (pure JS, no external deps) ──────────────────────────
// Mock data spans 2026-05-15 to 2026-05-28.
// If real "today" is outside that range we fall back to 2026-05-18 (Mon) so
// the page always shows content on first load.
const FALLBACK_ANCHOR = new Date('2026-05-18T00:00:00');
const FIRST_DATA      = new Date('2026-05-15T00:00:00');
const LAST_DATA       = new Date('2026-05-28T00:00:00');

function initialAnchor(): Date {
  const today = new Date();
  // Zero out time for a clean date comparison
  today.setHours(0, 0, 0, 0);
  if (today < FIRST_DATA || today > LAST_DATA) return FALLBACK_ANCHOR;
  return today;
}

// ── pure-JS date helpers shared with nav handlers ────────────────────────────
function startOfWeekMonday(d: Date): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = out.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  out.setDate(out.getDate() + diff);
  return out;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  out.setDate(out.getDate() + n);
  return out;
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

// ── period label helpers ──────────────────────────────────────────────────────
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function monthLabel(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function weekLabel(anchor: Date): string {
  const mon = startOfWeekMonday(anchor);
  const sun = addDays(mon, 6);
  const sameMonth = mon.getMonth() === sun.getMonth();
  if (sameMonth) {
    return `${MONTH_NAMES[mon.getMonth()]} ${mon.getDate()}–${sun.getDate()}, ${mon.getFullYear()}`;
  }
  return `${MONTH_NAMES[mon.getMonth()]} ${mon.getDate()} – ${MONTH_NAMES[sun.getMonth()]} ${sun.getDate()}, ${sun.getFullYear()}`;
}

// ── misc helpers ──────────────────────────────────────────────────────────────
const DEFAULT_FILTERS: CalendarFilterState = {
  status: 'all',
  discipline: 'all',
  dateFrom: null,
  dateTo: null,
};

function hasActiveFilters(f: CalendarFilterState): boolean {
  return f.status !== 'all' || f.discipline !== 'all' || f.dateFrom !== null || f.dateTo !== null;
}

function formatDateHeading(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ── page component ────────────────────────────────────────────────────────────
export function StaffingCalendarPage() {
  // Default view is Month per design spec
  const [view, setView] = useState<CalendarView>('month');
  const [anchor, setAnchor] = useState<Date>(initialAnchor());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filters, setFilters] = useState<CalendarFilterState>(DEFAULT_FILTERS);

  const { filterShifts, shifts } = useShiftStore();
  const filtered = filterShifts(filters);
  const total = shifts.length;

  // Navigation handlers
  function handlePrev() {
    if (view === 'week') setAnchor((a) => addDays(a, -7));
    else if (view === 'month') setAnchor((a) => addMonths(a, -1));
    setSelectedDay(null);
  }
  function handleToday() {
    setAnchor(initialAnchor());
    setSelectedDay(null);
  }
  function handleNext() {
    if (view === 'week') setAnchor((a) => addDays(a, 7));
    else if (view === 'month') setAnchor((a) => addMonths(a, 1));
    setSelectedDay(null);
  }

  // Period label (only shown in week + month views)
  const periodLabel = view === 'month' ? monthLabel(anchor) : view === 'week' ? weekLabel(anchor) : null;

  // Grouped-by-date data for List view
  const byDate = filtered.reduce<Record<string, typeof filtered>>((acc, shift) => {
    (acc[shift.date] ??= []).push(shift);
    return acc;
  }, {});
  const sortedDates = Object.keys(byDate).sort();

  // Shifts for selected day panel in Month view
  const selectedDayShifts = selectedDay
    ? filtered.filter((s) => s.date === selectedDay)
    : [];

  return (
    <div className="flex flex-col h-full">
      <DemoBanner />
      <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-4 flex-1 min-h-0">
        <PageHeader
          eyebrow="Step 2 · Read-only"
          title={
            <span className="flex items-center gap-2">
              Calendar
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-normal"
                style={{ background: 'var(--ci-surface-muted)', color: 'var(--ci-text-muted-2)', fontSize: 14 }}
              >
                {filtered.length}/{total}
              </span>
            </span>
          }
          description="iStaffing operational view: open shifts, filled shifts, pending coverage, cancelled"
        />

        {/* Filters + view toggle row */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <CalendarFilters value={filters} onChange={setFilters} />
          <CalendarViewToggle value={view} onChange={setView} />
        </div>

        {/* Clear filters link */}
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="self-start text-xs underline"
            style={{ color: 'var(--ci-link)' }}
          >
            Clear filters
          </button>
        )}

        {/* Navigation row — Week and Month views only */}
        {(view === 'week' || view === 'month') && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="h-8 px-3 rounded-md text-sm border transition-colors"
              style={{
                background: 'var(--ci-surface)',
                border: '1px solid var(--ci-border-strong)',
                color: 'var(--ci-text-primary)',
              }}
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="h-8 px-3 rounded-md text-sm border transition-colors"
              style={{
                background: 'var(--ci-surface)',
                border: '1px solid var(--ci-border-strong)',
                color: 'var(--ci-text-primary)',
              }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="h-8 px-3 rounded-md text-sm border transition-colors"
              style={{
                background: 'var(--ci-surface)',
                border: '1px solid var(--ci-border-strong)',
                color: 'var(--ci-text-primary)',
              }}
            >
              Next →
            </button>
            <span
              className="text-sm font-semibold ml-2"
              style={{ color: 'var(--ci-text-primary)' }}
            >
              {periodLabel}
            </span>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <EmptyState
            icon={<CalendarDays size={32} />}
            title="No shifts match your filters"
            description="Try adjusting the status, discipline, or date range."
            action={
              hasActiveFilters(filters) ? (
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-sm underline"
                  style={{ color: 'var(--ci-link)' }}
                >
                  Clear all filters
                </button>
              ) : undefined
            }
          />
        )}

        {/* View body */}
        {filtered.length > 0 && (
          <>
            {view === 'list' && (
              <div className="flex flex-col gap-6 overflow-y-auto">
                {sortedDates.map((date) => (
                  <section key={date}>
                    <h2
                      className="text-sm font-semibold mb-3 pb-1"
                      style={{
                        color: 'var(--ci-text-muted-2)',
                        borderBottom: '1px solid var(--ci-border)',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                      }}
                    >
                      {formatDateHeading(date)}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {byDate[date].map((shift) => (
                        <ShiftCard key={shift.id} shift={shift} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            {view === 'week' && (
              <div className="overflow-y-auto flex-1 min-h-0">
                <WeekCalendarView shifts={filtered} anchorDate={anchor} />
              </div>
            )}

            {view === 'month' && (
              <div className="flex flex-col gap-4 overflow-y-auto flex-1 min-h-0">
                <MonthCalendarView
                  shifts={filtered}
                  anchorDate={anchor}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                />

                {/* Selected-day detail panel */}
                {selectedDay !== null && selectedDayShifts.length > 0 && (
                  <div>
                    <h2
                      className="text-sm font-semibold mb-3 pb-1"
                      style={{
                        color: 'var(--ci-text-muted-2)',
                        borderBottom: '1px solid var(--ci-border)',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                      }}
                    >
                      {formatDateHeading(selectedDay)}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {selectedDayShifts.map((shift) => (
                        <ShiftCard key={shift.id} shift={shift} />
                      ))}
                    </div>
                  </div>
                )}

                {selectedDay !== null && selectedDayShifts.length === 0 && (
                  <p className="text-xs italic" style={{ color: 'var(--ci-text-muted-2)' }}>
                    No shifts match current filters for {selectedDay}.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
