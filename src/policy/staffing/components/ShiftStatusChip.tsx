import type { Shift } from '../types-calendar';

const STATUS_STYLES: Record<Shift['status'], React.CSSProperties> = {
  open:             { background: 'rgba(234,179,8,0.12)',   color: '#a16207', border: '1px solid rgba(234,179,8,0.3)' },
  filled:           { background: 'rgba(34,197,94,0.12)',   color: '#15803d', border: '1px solid rgba(34,197,94,0.3)' },
  pending_coverage: { background: 'rgba(249,115,22,0.12)',  color: '#c2410c', border: '1px solid rgba(249,115,22,0.3)' },
  cancelled:        { background: 'rgba(107,114,128,0.12)', color: '#4b5563', border: '1px solid rgba(107,114,128,0.3)' },
};

const STATUS_LABELS: Record<Shift['status'], string> = {
  open:             'Open',
  filled:           'Filled',
  pending_coverage: 'Pending Coverage',
  cancelled:        'Cancelled',
};

interface ShiftStatusChipProps {
  status: Shift['status'];
}

export function ShiftStatusChip({ status }: ShiftStatusChipProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={STATUS_STYLES[status]}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
