import { useState, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/policy/components/ui/PageHeader';
import { EmptyState } from '@/policy/components/ui/EmptyState';
import { DemoBanner } from '../components/DemoBanner';
import { ShiftCard } from '../components/ShiftCard';
import { CalendarFilters } from '../components/CalendarFilters';
import { CalendarViewToggle } from '../components/CalendarViewToggle';
import { WeekCalendarView } from '../components/WeekCalendarView';
import { MonthCalendarView } from '../components/MonthCalendarView';
import { useShiftStore } from '../stores/shiftStore';
import { useIsLight } from '@/policy/stores/uiStore';
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
  // Mobile-first: default to list (agenda) per design reference (RESPONSIVE_BEHAVIOR_MATRIX + CALENDAR_VISUAL_PATTERNS).
  // Desktop defaults to month.
  const [_viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window === 'undefined' ? 1024 : window.innerWidth
  );

  const [view, setView] = useState<CalendarView>(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 'list' : 'month'));
  const [anchor, setAnchor] = useState<Date>(initialAnchor());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filters, setFilters] = useState<CalendarFilterState>(DEFAULT_FILTERS);
  const isLight = useIsLight();
  // Light mode: use isLight for hover states on nav buttons (avoid white/5 bleed/low hit area in light); calendar pages/hovers use isLight for glass clean.

  // Keep view in sync on resize for mobile preference. Enforce agenda (list) primary on small screens to match designs, prevent grid bleed.
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setViewportWidth(w);
      if (w < 640 && view !== 'list') {
        setView('list');
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [view]);

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
      <div className="v3-calendar-surface flex flex-col flex-1 min-h-0 w-full max-w-full overflow-x-hidden" style={{ padding: 0 }}> {/* full bleed per designs (Agent 13): main calendar occupies entire screen area, no padding/borders; agenda primary no bleed on small */}
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
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-between">
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

        {/* Navigation row — Week and Month views only — matches design #4 (TODAY, June 2026, clean) */}
        {(view === 'week' || view === 'month') && (
          <div className="flex items-center gap-0.5 rounded-md border px-0.5 py-0.5 text-xs" style={{ borderColor: 'var(--v3-border-subtle)', background: 'transparent' }}>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous"
              className={`px-1 py-0.5 rounded ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'}`}
              style={{ color: 'var(--v3-text-secondary)' }}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className={`px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] uppercase rounded ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'} whitespace-nowrap`}
              style={{ color: 'var(--v3-text-primary)' }}
            >
              TODAY, {periodLabel}
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next"
              className={`px-1 py-0.5 rounded ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'}`}
              style={{ color: 'var(--v3-text-secondary)' }}
            >
              <ChevronRight size={15} />
            </button>
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
              <div className="flex flex-col gap-4 sm:gap-6 overflow-y-auto w-full max-w-full overflow-x-hidden">
                {sortedDates.map((date) => (
                  <section key={date}>
                    <h2
                      className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 pb-1"
                      style={{
                        color: 'var(--ci-text-muted-2)',
                        borderBottom: 'none',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                      }}
                    >
                      {formatDateHeading(date)}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
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
                  <div className="mt-1">
                    <h2
                      className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 pb-1"
                      style={{
                        color: 'var(--ci-text-muted-2)',
                        borderBottom: 'none',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                      }}
                    >
                      {formatDateHeading(selectedDay)}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
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
