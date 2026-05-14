import type { CalendarFilterState, ShiftDiscipline, ShiftStatus } from '../types-calendar';

const ALL_STATUSES: ShiftStatus[] = ['open', 'filled', 'pending_coverage', 'cancelled'];
const ALL_DISCIPLINES: ShiftDiscipline[] = ['RN', 'LVN', 'PT', 'OT', 'MSW', 'HHA', 'CNA'];

const SELECT_STYLE: React.CSSProperties = {
  background: 'var(--ci-surface)',
  border: '1px solid var(--ci-border-strong)',
  color: 'var(--ci-text-primary)',
};

function statusLabel(s: ShiftStatus): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface CalendarFiltersProps {
  value: CalendarFilterState;
  onChange: (next: CalendarFilterState) => void;
}

export function CalendarFilters({ value, onChange }: CalendarFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status filter */}
      <select
        value={value.status}
        onChange={(e) => onChange({ ...value, status: e.target.value as CalendarFilterState['status'] })}
        aria-label="Filter by shift status"
        className="h-9 px-3 rounded-md text-sm border"
        style={SELECT_STYLE}
      >
        <option value="all">All Statuses</option>
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>{statusLabel(s)}</option>
        ))}
      </select>

      {/* Discipline filter */}
      <select
        value={value.discipline}
        onChange={(e) => onChange({ ...value, discipline: e.target.value as CalendarFilterState['discipline'] })}
        aria-label="Filter by discipline"
        className="h-9 px-3 rounded-md text-sm border"
        style={SELECT_STYLE}
      >
        <option value="all">All Disciplines</option>
        {ALL_DISCIPLINES.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Date from */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs" style={{ color: 'var(--ci-text-muted-2)' }}>From</label>
        <input
          type="date"
          value={value.dateFrom ?? ''}
          onChange={(e) => onChange({ ...value, dateFrom: e.target.value || null })}
          aria-label="Filter shifts from date"
          className="h-9 px-2 rounded-md text-sm border"
          style={SELECT_STYLE}
        />
      </div>

      {/* Date to */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs" style={{ color: 'var(--ci-text-muted-2)' }}>To</label>
        <input
          type="date"
          value={value.dateTo ?? ''}
          onChange={(e) => onChange({ ...value, dateTo: e.target.value || null })}
          aria-label="Filter shifts to date"
          className="h-9 px-2 rounded-md text-sm border"
          style={SELECT_STYLE}
        />
      </div>
    </div>
  );
}
