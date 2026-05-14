import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tabs } from '@/policy/components/ui/Tabs';
import { SurfaceCard } from '@/policy/components/ui/SurfaceCard';
import { SectionHeader } from '@/policy/components/ui/SectionHeader';
import { EmptyState } from '@/policy/components/ui/EmptyState';
import { Heart } from 'lucide-react';
import { DemoBanner } from '../components/DemoBanner';
import { AcuityBadge } from '../components/AcuityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { DisciplineBadge } from '../components/DisciplineBadge';
import { ShiftNeedCard } from '../components/ShiftNeedCard';
import { usePatientStore } from '../stores/patientStore';
import { useClinicianStore } from '../stores/clinicianStore';

type TabId = 'overview' | 'care_needs' | 'assignments' | 'preferences' | 'history';

const TAB_ITEMS: Array<{ id: TabId; label: string; disabled?: boolean }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'care_needs', label: 'Care Needs' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'preferences', label: 'Preferences', disabled: true },
  { id: 'history', label: 'History', disabled: true },
];

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const { getPatientById, getShiftNeedsForPatient } = usePatientStore();
  const { connections, getClinicianById } = useClinicianStore();

  const patient = getPatientById(patientId ?? '');
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  if (!patient) {
    return (
      <div className="flex flex-col h-full">
        <DemoBanner />
        <div className="p-4 md:p-6 lg:p-8">
          <EmptyState
            icon={<Heart size={32} />}
            title="Patient not found"
            description={`No patient record found for ID "${patientId ?? ''}".`}
            action={
              <Link
                to="/patients"
                className="text-sm font-medium underline"
                style={{ color: 'var(--ci-link)' }}
              >
                Return to Patient Profiles
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const shiftNeeds = getShiftNeedsForPatient(patient.id);
  const patientConnections = connections.filter((c) => c.patientId === patient.id);

  const accmClinician = getClinicianById(patient.accmOwnerId);
  const ccmClinician = patient.ccmId ? getClinicianById(patient.ccmId) : undefined;

  return (
    <div className="flex flex-col h-full">
      <DemoBanner />
      <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-4">
        {/* Breadcrumb */}
        <nav className="text-sm flex items-center gap-1" style={{ color: 'var(--ci-text-muted-2)' }}>
          <Link to="/patients" className="hover:underline" style={{ color: 'var(--ci-link)' }}>
            Patient Profiles
          </Link>
          <span>›</span>
          <span style={{ color: 'var(--ci-text-primary)' }}>
            {patient.firstName} {patient.lastName}
          </span>
        </nav>

        {/* Name header */}
        <div className="flex items-start gap-3 flex-wrap">
          <div>
            <h1 className="font-montserrat text-2xl font-bold" style={{ color: 'var(--ci-text-primary)' }}>
              {patient.firstName} {patient.lastName}
            </h1>
            {patient.preferredName && patient.preferredName !== patient.firstName && (
              <div className="text-sm mt-0.5" style={{ color: 'var(--ci-text-subtle)' }}>
                Preferred: "{patient.preferredName}"
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <AcuityBadge level={patient.acuityLevel} />
            <StatusBadge status={patient.status} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          items={TAB_ITEMS.map((t) => ({
            id: t.id,
            label: t.disabled ? `${t.label} (Phase 2)` : t.label,
            disabled: t.disabled,
          }))}
          value={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
          variant="underline"
          ariaLabel="Patient detail tabs"
        />

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SurfaceCard>
              <SectionHeader title="Patient Information" />
              <dl className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <dt className="font-medium w-40 shrink-0" style={{ color: 'var(--ci-text-muted-2)' }}>Setting</dt>
                  <dd className="capitalize" style={{ color: 'var(--ci-text-primary)' }}>{patient.serviceSetting}</dd>
                </div>
                {patient.facilityName && (
                  <div className="flex gap-2">
                    <dt className="font-medium w-40 shrink-0" style={{ color: 'var(--ci-text-muted-2)' }}>Facility</dt>
                    <dd style={{ color: 'var(--ci-text-primary)' }}>{patient.facilityName}</dd>
                  </div>
                )}
                <div className="flex gap-2">
                  <dt className="font-medium w-40 shrink-0" style={{ color: 'var(--ci-text-muted-2)' }}>Zone</dt>
                  <dd style={{ color: 'var(--ci-text-primary)' }}>{patient.serviceZone ?? '—'}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium w-40 shrink-0" style={{ color: 'var(--ci-text-muted-2)' }}>Admission</dt>
                  <dd style={{ color: 'var(--ci-text-primary)' }}>{patient.admissionDate ?? '—'}</dd>
                </div>
                {patient.dischargeDate && (
                  <div className="flex gap-2">
                    <dt className="font-medium w-40 shrink-0" style={{ color: 'var(--ci-text-muted-2)' }}>Discharge</dt>
                    <dd style={{ color: 'var(--ci-text-primary)' }}>{patient.dischargeDate}</dd>
                  </div>
                )}
                <div className="flex gap-2">
                  <dt className="font-medium w-40 shrink-0" style={{ color: 'var(--ci-text-muted-2)' }}>Caseload Points</dt>
                  <dd style={{ color: 'var(--ci-text-primary)' }}>{patient.weightedCaseloadPoints}</dd>
                </div>
              </dl>
            </SurfaceCard>

            <SurfaceCard>
              <SectionHeader title="Care Team" />
              <dl className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <dt className="font-medium w-16 shrink-0" style={{ color: 'var(--ci-text-muted-2)' }}>ACCM</dt>
                  <dd>
                    {accmClinician ? (
                      <Link
                        to={`/clinicians/${patient.accmOwnerId}`}
                        className="hover:underline font-medium"
                        style={{ color: 'var(--ci-link)' }}
                      >
                        {accmClinician.firstName} {accmClinician.lastName}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--ci-text-primary)' }}>{patient.accmOwnerId}</span>
                    )}
                  </dd>
                </div>
                {ccmClinician && (
                  <div className="flex gap-2">
                    <dt className="font-medium w-16 shrink-0" style={{ color: 'var(--ci-text-muted-2)' }}>CCM</dt>
                    <dd style={{ color: 'var(--ci-text-primary)' }}>
                      {ccmClinician.firstName} {ccmClinician.lastName}
                    </dd>
                  </div>
                )}
              </dl>
            </SurfaceCard>
          </div>
        )}

        {/* Tab: Care Needs */}
        {activeTab === 'care_needs' && (
          <div className="flex flex-col gap-4">
            <SurfaceCard>
              <SectionHeader title="Required Disciplines" />
              <div className="flex flex-wrap gap-2">
                {patient.requiredDisciplines.map((d) => (
                  <DisciplineBadge key={d} discipline={d} />
                ))}
              </div>

              {patient.requiredCompetencies && patient.requiredCompetencies.length > 0 && (
                <>
                  <div className="mt-4 mb-2 text-xs font-semibold" style={{ color: 'var(--ci-text-muted-2)', letterSpacing: '0.1em' }}>
                    REQUIRED COMPETENCIES
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {patient.requiredCompetencies.map((comp) => (
                      <span
                        key={comp}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs"
                        style={{ background: 'var(--ci-surface-muted)', border: '1px solid var(--ci-border)', color: 'var(--ci-text-primary)' }}
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {patient.continuityPriority && (
                <div className="mt-4 text-sm">
                  <span className="font-medium" style={{ color: 'var(--ci-text-muted-2)' }}>Continuity Priority: </span>
                  <span className="capitalize font-semibold" style={{ color: 'var(--ci-text-primary)' }}>
                    {patient.continuityPriority}
                  </span>
                </div>
              )}
            </SurfaceCard>

            <div>
              <SectionHeader title="Shift Needs" className="mb-3" />
              {shiftNeeds.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--ci-text-muted-2)' }}>No shift needs on record.</p>
              ) : (
                <div className="space-y-3">
                  {shiftNeeds.map((sn) => (
                    <ShiftNeedCard key={sn.id} shiftNeed={sn} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Assignments */}
        {activeTab === 'assignments' && (
          <SurfaceCard>
            <SectionHeader title="Assignments" />
            {patientConnections.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--ci-text-muted-2)' }}>No assignments on record.</p>
            ) : (
              <div className="space-y-2">
                {patientConnections.map((conn) => {
                  const clin = getClinicianById(conn.clinicianId);
                  return (
                    <div
                      key={conn.id}
                      className="p-3 rounded flex flex-col gap-1"
                      style={{ background: 'var(--ci-surface-muted)', border: '1px solid var(--ci-border)' }}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/clinicians/${conn.clinicianId}`}
                          className="text-sm font-medium hover:underline"
                          style={{ color: 'var(--ci-link)' }}
                        >
                          {clin ? `${clin.firstName} ${clin.lastName}` : conn.clinicianId}
                        </Link>
                        <DisciplineBadge discipline={conn.discipline} />
                        <StatusBadge status={conn.connectionStatus} />
                        <span className="text-xs" style={{ color: 'var(--ci-text-muted-2)' }}>
                          {conn.assignmentRole} · {conn.source.replace(/_/g, ' ')} · From {conn.startDate}
                        </span>
                      </div>
                      {conn.approvalRationale && (
                        <div className="text-xs mt-1 pl-2" style={{ borderLeft: '2px solid var(--ci-border)', color: 'var(--ci-text-muted-2)' }}>
                          Rationale: {conn.approvalRationale}
                        </div>
                      )}
                      {conn.overrideReason && (
                        <div
                          className="text-xs mt-1 pl-2 py-1 rounded-r"
                          style={{ borderLeft: '3px solid #d97706', background: 'rgba(251,191,36,0.08)', color: '#92400e' }}
                        >
                          ⚠ Override: {conn.overrideReason}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
