import type { AcuityLevel } from '../types';

interface AcuityBadgeProps {
  level: AcuityLevel;
  shorthand?: boolean;
  className?: string;
}

const ACUITY_CONFIG: Record<
  AcuityLevel,
  { label: string; short: string; style: React.CSSProperties }
> = {
  a1_routine: {
    label: 'Acuity Level 1 \u2014 Routine',
    short: 'A1',
    style: {
      background: 'rgba(34,197,94,0.12)',
      color: '#15803d',
      border: 'none',
    },
  },
  a2_moderate: {
    label: 'Acuity Level 2 \u2014 Moderate',
    short: 'A2',
    style: {
      background: 'rgba(245,158,11,0.12)',
      color: '#b45309',
      border: 'none',
    },
  },
  a3_high: {
    label: 'Acuity Level 3 \u2014 High',
    short: 'A3',
    style: {
      background: 'rgba(249,115,22,0.12)',
      color: '#c2410c',
      border: 'none',
    },
  },
  a4_critical_complex: {
    label: 'Acuity Level 4 \u2014 Critical / Complex',
    short: 'A4',
    style: {
      background: 'rgba(239,68,68,0.12)',
      color: '#b91c1c',
      border: 'none',
    },
  },
};

export function AcuityBadge({ level, shorthand, className }: AcuityBadgeProps) {
  const config = ACUITY_CONFIG[level];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${className ?? ''}`}
      style={config.style}
      aria-label={config.label}
    >
      {shorthand ? config.short : config.label}
    </span>
  );
}
