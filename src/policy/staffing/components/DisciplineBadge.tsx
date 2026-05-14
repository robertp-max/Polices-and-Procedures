import type { Discipline } from '../types';

interface DisciplineBadgeProps {
  discipline: Discipline;
  className?: string;
}

const LICENSED_PROFESSIONALS = new Set<Discipline>([
  'RN', 'LVN', 'LPN', 'PT', 'PTA', 'OT', 'COTA', 'ST', 'SLP', 'MSW',
]);
const CERTIFIED_AIDES = new Set<Discipline>(['HHA', 'CNA']);

function getDisciplineStyle(discipline: Discipline): React.CSSProperties {
  if (LICENSED_PROFESSIONALS.has(discipline)) {
    return { background: 'rgba(79,70,229,0.12)', color: '#4338ca', border: '1px solid rgba(79,70,229,0.25)' };
  }
  if (CERTIFIED_AIDES.has(discipline)) {
    return { background: 'rgba(13,148,136,0.12)', color: '#0f766e', border: '1px solid rgba(13,148,136,0.25)' };
  }
  // Non-licensed (Caregiver)
  return { background: 'var(--ci-surface-muted)', color: 'var(--ci-text-muted-2)', border: '1px solid var(--ci-border)' };
}

export function DisciplineBadge({ discipline, className }: DisciplineBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${className ?? ''}`}
      style={getDisciplineStyle(discipline)}
    >
      {discipline}
    </span>
  );
}
