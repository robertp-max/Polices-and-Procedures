import { useNavigate } from 'react-router-dom';
import { SurfaceCard } from '@/policy/components/ui/SurfaceCard';
import { AcuityBadge } from './AcuityBadge';
import { StatusBadge } from './StatusBadge';
import type { Patient } from '../types';
import { useClinicianStore } from '../stores/clinicianStore';

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  const navigate = useNavigate();
  const { connections, getClinicianById } = useClinicianStore();

  const assignmentCount = connections.filter(
    (c) => c.patientId === patient.id && c.connectionStatus === 'assigned',
  ).length;

  const accmClinician = getClinicianById(patient.accmOwnerId);
  const accmName = accmClinician
    ? `${accmClinician.firstName} ${accmClinician.lastName}`
    : patient.accmOwnerId;

  return (
    <SurfaceCard
      padding="md"
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/patients/${patient.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigate(`/patients/${patient.id}`);
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate" style={{ color: 'var(--ci-text-primary)' }}>
            {patient.firstName} {patient.lastName}
          </div>
        </div>
        <StatusBadge status={patient.status} />
      </div>

      <div className="flex items-center gap-2 flex-wrap mt-1">
        <AcuityBadge level={patient.acuityLevel} />
        <span className="text-xs capitalize" style={{ color: 'var(--ci-text-muted-2)' }}>
          {patient.serviceSetting}
        </span>
        {patient.serviceZone && (
          <span className="text-xs" style={{ color: 'var(--ci-text-muted-2)' }}>
            · {patient.serviceZone}
          </span>
        )}
      </div>

      <div className="mt-2 text-xs" style={{ color: 'var(--ci-text-muted-2)' }}>
        ACCM: <span style={{ color: 'var(--ci-text-primary)' }}>{accmName}</span>
      </div>

      <div className="mt-1 text-xs" style={{ color: 'var(--ci-text-muted-2)' }}>
        <span className="font-semibold" style={{ color: 'var(--ci-text-primary)' }}>
          {assignmentCount}
        </span>{' '}
        {assignmentCount === 1 ? 'assignment' : 'assignments'}
      </div>
    </SurfaceCard>
  );
}
