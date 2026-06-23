import { useNavigate } from 'react-router-dom';
import { SurfaceCard } from '@/policy/components/ui/SurfaceCard';
// ClinicianCard etc use SurfaceCard as wrapper (children); app-wide SurfaceCard prototype structure (from 16-dashboard ref + CES) enforced via Dashboard TaskCard + ExecutionUnitCard updates.
import { BorderGlow, ToneBadge } from '@/policy/components/ui';
import { DisciplineBadge } from './DisciplineBadge';
import { StatusBadge } from './StatusBadge';
import type { Clinician } from '../types';
import { useClinicianStore } from '../stores/clinicianStore';

interface ClinicianCardProps {
  clinician: Clinician;
}

export function ClinicianCard({ clinician }: ClinicianCardProps) {
  const navigate = useNavigate();
  const { connections } = useClinicianStore();

  const assignmentCount = connections.filter(
    (c) => c.clinicianId === clinician.id && c.connectionStatus === 'assigned',
  ).length;

  return (
    <BorderGlow borderRadius={12} glowIntensity={0.65}>
    <SurfaceCard
      padding="md"
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/clinicians/${clinician.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigate(`/clinicians/${clinician.id}`);
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate" style={{ color: 'var(--ci-text-primary)' }}>
            {clinician.firstName} {clinician.lastName}
          </div>
          {clinician.preferredName && clinician.preferredName !== clinician.firstName && (
            <div className="text-xs" style={{ color: 'var(--ci-text-subtle)' }}>
              "{clinician.preferredName}"
            </div>
          )}
        </div>
        <StatusBadge status={clinician.status} />
      </div>

      <div className="flex items-center gap-2 flex-wrap mt-1">
        <DisciplineBadge discipline={clinician.primaryDiscipline} />
        <ToneBadge tone="muted">{clinician.employmentType}</ToneBadge>
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs" style={{ color: 'var(--ci-text-muted-2)' }}>
        <span>
          <span className="font-semibold" style={{ color: 'var(--ci-text-primary)' }}>
            {clinician.competencies.length}
          </span>{' '}
          {clinician.competencies.length === 1 ? 'competency' : 'competencies'}
        </span>
        <span>
          <span className="font-semibold" style={{ color: 'var(--ci-text-primary)' }}>
            {assignmentCount}
          </span>{' '}
          {assignmentCount === 1 ? 'assignment' : 'assignments'}
        </span>
      </div>
    </SurfaceCard>
    </BorderGlow>
  );
}
