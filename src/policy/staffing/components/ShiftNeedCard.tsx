import { SurfaceCard } from '@/policy/components/ui/SurfaceCard';
import { DisciplineBadge } from './DisciplineBadge';
import type { ShiftNeed } from '../types';
import { useClinicianStore } from '../stores/clinicianStore';

interface ShiftNeedCardProps {
  shiftNeed: ShiftNeed;
}

const PRIORITY_STYLE: Record<string, React.CSSProperties> = {
  critical: { background: 'rgba(220,38,38,0.12)', color: '#b91c1c', border: '1px solid rgba(220,38,38,0.25)' },
  high: { background: 'rgba(234,88,12,0.12)', color: '#c2410c', border: '1px solid rgba(234,88,12,0.25)' },
  medium: { background: 'rgba(234,179,8,0.12)', color: '#a16207', border: '1px solid rgba(234,179,8,0.25)' },
  low: { background: 'var(--ci-surface-muted)', color: 'var(--ci-text-muted-2)', border: '1px solid var(--ci-border)' },
};

const STATUS_BORDER: Record<string, string> = {
  open: 'border-l-4 border-l-red-400',
  filled: 'border-l-4 border-l-green-500',
  cancelled: 'border-l-4 border-l-slate-400',
};

export function ShiftNeedCard({ shiftNeed }: ShiftNeedCardProps) {
  const { connections, getClinicianById } = useClinicianStore();

  let assignedClinicianName: string | null = null;
  if (shiftNeed.status === 'filled' && shiftNeed.assignedConnectionId) {
    const conn = connections.find((c) => c.id === shiftNeed.assignedConnectionId);
    if (conn) {
      const clin = getClinicianById(conn.clinicianId);
      if (clin) assignedClinicianName = `${clin.firstName} ${clin.lastName}`;
    }
  }

  return (
    <SurfaceCard padding="md" className={`${STATUS_BORDER[shiftNeed.status] ?? ''}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <DisciplineBadge discipline={shiftNeed.requiredDiscipline} />
          {shiftNeed.priority && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
              style={PRIORITY_STYLE[shiftNeed.priority] ?? PRIORITY_STYLE.low}
            >
              {shiftNeed.priority.charAt(0).toUpperCase() + shiftNeed.priority.slice(1)}
            </span>
          )}
        </div>
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
          style={
            shiftNeed.status === 'filled'
              ? { background: 'rgba(22,163,74,0.12)', color: '#15803d', border: '1px solid rgba(22,163,74,0.25)' }
              : shiftNeed.status === 'open'
              ? { background: 'rgba(220,38,38,0.12)', color: '#b91c1c', border: '1px solid rgba(220,38,38,0.25)' }
              : { background: 'var(--ci-surface-muted)', color: 'var(--ci-text-muted-2)', border: '1px solid var(--ci-border)' }
          }
        >
          {shiftNeed.status.charAt(0).toUpperCase() + shiftNeed.status.slice(1)}
        </span>
      </div>

      <div className="mt-2 text-sm" style={{ color: 'var(--ci-text-primary)' }}>
        <span className="font-medium">Visit date:</span>{' '}
        <span style={{ color: 'var(--ci-text-muted-2)' }}>{shiftNeed.visitDate}</span>
        {shiftNeed.visitWindow && (
          <span style={{ color: 'var(--ci-text-subtle)' }}>
            {' '}({shiftNeed.visitWindow.startTime} – {shiftNeed.visitWindow.endTime})
          </span>
        )}
      </div>

      {shiftNeed.shiftType && (
        <div className="mt-1 text-xs" style={{ color: 'var(--ci-text-muted-2)' }}>
          Type: <span className="font-medium">{shiftNeed.shiftType}</span>
          {shiftNeed.durationHours && ` · ${shiftNeed.durationHours}h`}
        </div>
      )}

      {assignedClinicianName && (
        <div className="mt-2 text-xs font-medium" style={{ color: '#15803d' }}>
          Assigned: {assignedClinicianName}
        </div>
      )}

      {shiftNeed.status === 'open' && shiftNeed.blockers && shiftNeed.blockers.length > 0 && (
        <div className="mt-2 space-y-1">
          {shiftNeed.blockers.map((blocker, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 px-3 py-2 rounded text-xs"
              style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(234,179,8,0.35)', color: '#92400e' }}
            >
              <span className="font-semibold shrink-0">⚠ {blocker.type.replace(/_/g, ' ')}:</span>
              <span>{blocker.description}</span>
            </div>
          ))}
        </div>
      )}
    </SurfaceCard>
  );
}
