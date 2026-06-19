import type { Shift } from '../types-calendar';
import { useIsLight } from '@/policy/stores/uiStore';

// ── pure-JS date helpers ──────────────────────────────────────────────────────
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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

const DOW_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// color-coded status dots — teal/orange per design #4 for staffing calendar
const STATUS_DOT_COLORS: Record<Shift['status'], string> = {
  open:             'var(--ci-warning-fg, #E07B2C)',
  filled:           'var(--ci-success-fg, #007970)',
  pending_coverage: 'var(--v3-orange, #E07B2C)',
  cancelled:        'var(--ci-text-subtle, #9ca3af)',
};

function statusCounts(dayShifts: Shift[]) {
  const counts: Partial<Record<Shift['status'], number>> = {};
  for (const s of dayShifts) {
    counts[s.status] = (counts[s.status] ?? 0) + 1;
  }
  return counts;
}

// ── main component ────────────────────────────────────────────────────────────
export interface MonthCalendarViewProps {
  shifts: Shift[];
  anchorDate: Date;
  selectedDay: string | null;
  onSelectDay: (iso: string | null) => void;
}

export function MonthCalendarView({ shifts, anchorDate, selectedDay, onSelectDay }: MonthCalendarViewProps) {
  const isLight = useIsLight();
  const todayISO = toISODate(new Date());
  const currentMonth = anchorDate.getMonth();
  const currentYear = anchorDate.getFullYear();

  // Build 42-cell grid (6 rows × 7 cols) starting from Monday before the 1st
  const firstOfMonth = new Date(currentYear, currentMonth, 1);
  const gridStart = startOfWeekMonday(firstOfMonth);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  // Group shifts by ISO date
  const byDate = new Map<string, Shift[]>();
  for (const shift of shifts) {
    const list = byDate.get(shift.date) ?? [];
    list.push(shift);
    byDate.set(shift.date, list);
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-7 mb-1">
        {DOW_HEADERS.map((h) => (
          <div
            key={h}
            className="text-center text-[10px] sm:text-xs font-semibold py-1"
            style={{ color: 'var(--ci-text-muted-2)', letterSpacing: '0.05em' }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* 6-row grid — no borders / full clean per coordinator polish */}
      <div
        className="grid grid-cols-7 gap-px w-full max-w-full"
        style={{ background: 'transparent' }}
      >
        {cells.map((cell) => {
          const iso = toISODate(cell);
          const inCurrentMonth = cell.getMonth() === currentMonth;
          const isToday = iso === todayISO;
          const isSelected = iso === selectedDay;
          const dayShifts = byDate.get(iso) ?? [];
          const total = dayShifts.length;
          const counts = total > 0 ? statusCounts(dayShifts) : null;
          const chips = dayShifts.slice(0, 2);
          const overflow = total > 2 ? total - 2 : 0;

          let bg = isLight ? 'var(--ci-bg, #FAFBF8)' : 'var(--ci-bg)';
          if (!inCurrentMonth) bg = isLight ? 'var(--ci-surface-muted, #F4F4F2)' : 'var(--ci-surface-muted)';
          if (isSelected) bg = isLight ? 'rgba(0,121,112,0.08)' : 'rgba(0,121,112,0.10)'; // teal per design #4, no indigo bleed

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDay(isSelected ? null : iso)}
              className="text-left p-1 sm:p-1.5 flex flex-col gap-0.5 transition-colors min-h-[64px] sm:min-h-[88px] max-h-[120px] overflow-hidden"
              style={{
                background: bg,
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                opacity: inCurrentMonth ? 1 : 0.45,
              }}
              aria-pressed={isSelected}
              aria-label={`${iso}${total ? `, ${total} shifts` : ''}`}
            >
              {/* date number + shift count */}
              <div className="flex items-start justify-between">
                <span
                  className="text-[10px] sm:text-xs font-semibold leading-none"
                  style={{
                    color: isToday ? (isLight ? '#fff' : 'var(--v3-text-primary, #fff)') : 'var(--ci-text-primary)',
                    background: isToday ? 'var(--v3-teal, #007970)' : 'transparent',
                    borderRadius: isToday ? '50%' : undefined,
                    width: isToday ? '1.25rem' : undefined,
                    height: isToday ? '1.25rem' : undefined,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cell.getDate()}
                </span>
                {total > 0 && (
                  <span
                    className="text-[10px] sm:text-xs font-bold leading-none"
                    style={{ color: isLight ? 'var(--ci-text-muted-2, #52404B)' : 'var(--ci-text-muted-2)', fontSize: '0.6rem' }}
                  >
                    {total}
                  </span>
                )}
              </div>

              {/* status-count dots */}
              {counts && (
                <div className="flex items-center gap-0.5 flex-wrap">
                  {(Object.entries(counts) as [Shift['status'], number][]).map(([status, count]) => (
                    <span key={status} className="flex items-center gap-0.5">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: STATUS_DOT_COLORS[status] }}
                        aria-label={`${status}: ${count}`}
                      />
                      <span style={{ fontSize: '0.6rem', color: STATUS_DOT_COLORS[status], fontWeight: 600 }}>{count}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* up to 2 shift chips */}
              {chips.map((s) => (
                <div
                  key={s.id}
                  className="rounded px-1 py-0.5 truncate"
                  style={{
                    background: 'var(--ci-surface)',
                    border: 'none',
                    fontSize: '0.55rem',
                    color: 'var(--ci-text-muted-2)',
                    lineHeight: 1.1,
                  }}
                >
                  {s.startTime} {s.requiredDiscipline}
                </div>
              ))}

              {/* overflow indicator */}
              {overflow > 0 && (
                <span style={{ fontSize: '0.55rem', color: 'var(--ci-link)', fontWeight: 600 }}>
                  +{overflow} more
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
