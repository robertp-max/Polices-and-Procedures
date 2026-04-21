import type { Confidence, RiskLevel } from '../lib/responseTypes';

const RISK_COLORS: Record<RiskLevel, { dark: string; light: string; label: string }> = {
  none:      { dark: '#6EE7B7', light: '#047857', label: 'No known risk' },
  low:       { dark: '#A7F3D0', light: '#047857', label: 'Low risk' },
  moderate:  { dark: '#FCD34D', light: '#B45309', label: 'Moderate risk' },
  high:      { dark: '#FCA5A5', light: '#B91C1C', label: 'High risk' },
  critical:  { dark: '#F87171', light: '#991B1B', label: 'Critical risk' },
};

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: 'HIGH CONFIDENCE',
  medium: 'MEDIUM CONFIDENCE',
  low: 'LOW CONFIDENCE',
};

export function RiskBadge({
  level,
  isLight,
  compact = false,
}: {
  level: RiskLevel;
  isLight: boolean;
  compact?: boolean;
}) {
  const cfg = RISK_COLORS[level];
  const color = isLight ? cfg.light : cfg.dark;
  return (
    <span
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]"
      style={{
        color,
        border: `1px solid ${color}55`,
        background: isLight ? `${color}12` : 'rgba(255,255,255,0.04)',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: color,
          boxShadow: `0 0 10px ${color}66`,
        }}
      />
      {compact ? level.toUpperCase() : cfg.label}
    </span>
  );
}

export function ConfidencePill({ level, isLight }: { level: Confidence; isLight: boolean }) {
  const color = isLight
    ? (level === 'high' ? '#047857' : level === 'medium' ? '#B45309' : '#6B7280')
    : (level === 'high' ? '#6EE7B7' : level === 'medium' ? '#FCD34D' : '#9CA3AF');
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.24em]"
      style={{
        color,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 4,
          height: 4,
          borderRadius: 999,
          background: color,
        }}
      />
      {CONFIDENCE_LABEL[level]}
    </span>
  );
}
