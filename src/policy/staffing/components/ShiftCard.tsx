import { Link } from 'react-router-dom';
import type { Shift } from '../types-calendar';
import { DisciplineBadge } from './DisciplineBadge';
import { AcuityBadge } from './AcuityBadge';
import { ShiftStatusChip } from './ShiftStatusChip';
import { usePatientStore } from '../stores/patientStore';
import { useClinicianStore } from '../stores/clinicianStore';
import type { Discipline } from '../types';

interface ShiftCardProps {
  shift: Shift;
}

function PriorityChip({ priority }: { priority: NonNullable<Shift['priority']> }) {
  if (priority === 'standard') return null;
  const styles: Record<'elevated' | 'urgent', React.CSSProperties> = {
    elevated: { background: 'rgba(234,179,8,0.1)',  color: '#b45309', border: '1px solid rgba(234,179,8,0.25)' },
    urgent:   { background: 'rgba(239,68,68,0.1)',  color: '#b91c1c', border: '1px solid rgba(239,68,68,0.25)' },
  };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
      style={styles[priority]}
    >
      {priority}
    </span>
  );
}

export function ShiftCard({ shift }: ShiftCardProps) {
  const patient = usePatientStore.getState().getPatientById(shift.patientId);
  const clinician = shift.clinicianId
    ? useClinicianStore.getState().getClinicianById(shift.clinicianId)
    : null;

  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-2"
      style={{
        background: 'var(--ci-surface)',
        border: '1px solid var(--ci-border)',
      }}
    >
      {/* Top row: time range, discipline, status, priority */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--ci-text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
          {shift.startTime}–{shift.endTime}
        </span>
        <DisciplineBadge discipline={shift.requiredDiscipline as Discipline} />
        <ShiftStatusChip status={shift.status} />
        {shift.priority && shift.priority !== 'standard' && (
          <PriorityChip priority={shift.priority} />
        )}
        {shift.acuityLevel && (
          <AcuityBadge level={shift.acuityLevel} />
        )}
      </div>

      {/* Patient link */}
      <div className="text-sm" style={{ color: 'var(--ci-text-muted-2)' }}>
        <span className="font-medium" style={{ color: 'var(--ci-text-primary)' }}>Patient: </span>
        {patient ? (
          <Link
            to={`/patients/${shift.patientId}`}
            className="hover:underline"
            style={{ color: 'var(--ci-link)' }}
          >
            {patient.firstName} {patient.lastName}
          </Link>
        ) : (
          <span>Unknown Patient</span>
        )}
      </div>

      {/* Clinician line */}
      <div className="text-sm" style={{ color: 'var(--ci-text-muted-2)' }}>
        <span className="font-medium" style={{ color: 'var(--ci-text-primary)' }}>Clinician: </span>
        {shift.status === 'filled' && clinician ? (
          <Link
            to={`/clinicians/${shift.clinicianId}`}
            className="hover:underline"
            style={{ color: 'var(--ci-link)' }}
          >
            {clinician.firstName} {clinician.lastName}
          </Link>
        ) : (
          <span>Open Shift</span>
        )}
      </div>

      {/* Required competencies */}
      {shift.requiredCompetencies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {shift.requiredCompetencies.map((comp) => (
            <span
              key={comp}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs"
              style={{
                background: 'var(--ci-surface-muted)',
                color: 'var(--ci-text-muted-2)',
                border: '1px solid var(--ci-border)',
              }}
            >
              {comp}
            </span>
          ))}
        </div>
      )}

      {/* Cancellation reason */}
      {shift.status === 'cancelled' && shift.cancellationReason && (
        <p className="text-xs mt-1" style={{ color: 'var(--ci-text-muted-2)' }}>
          <span className="font-medium">Reason: </span>
          {shift.cancellationReason}
        </p>
      )}

      {/* Notes */}
      {shift.notes && (
        <p className="text-xs mt-1 italic" style={{ color: 'var(--ci-text-muted-2)' }}>
          {shift.notes}
        </p>
      )}
    </div>
  );
}
