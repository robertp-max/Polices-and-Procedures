import type { CalendarView } from '../types-calendar';

const OPTIONS: { value: CalendarView; label: string }[] = [
  { value: 'list',  label: 'List'  },
  { value: 'week',  label: 'Week'  },
  { value: 'month', label: 'Month' },
];

interface CalendarViewToggleProps {
  value: CalendarView;
  onChange: (next: CalendarView) => void;
}

export function CalendarViewToggle({ value, onChange }: CalendarViewToggleProps) {
  return (
    <div
      className="inline-flex items-center rounded-md overflow-hidden"
      style={{ border: 'none', background: 'transparent' }}
      role="group"
      aria-label="Calendar view"
    >
      {OPTIONS.map((opt, _idx) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className="h-9 px-4 text-sm font-medium transition-colors"
            style={{
              background: active ? 'var(--v3-teal, #007970)' : 'var(--ci-surface)',
              color: active ? '#fff' : 'var(--ci-text-muted-2)',
              borderRight: 'none',
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
