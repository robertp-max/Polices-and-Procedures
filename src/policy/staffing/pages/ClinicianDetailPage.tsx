import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tabs } from '@/policy/components/ui/Tabs';
import { SurfaceCard } from '@/policy/components/ui/SurfaceCard';
import { SectionHeader } from '@/policy/components/ui/SectionHeader';
import { EmptyState } from '@/policy/components/ui/EmptyState';
import { UserX } from 'lucide-react';
import { DemoBanner } from '../components/DemoBanner';
import { DisciplineBadge } from '../components/DisciplineBadge';
import { StatusBadge } from '../components/StatusBadge';
import { CredentialBadge } from '../components/CredentialBadge';
import { useClinicianStore } from '../stores/clinicianStore';
import { usePatientStore } from '../stores/patientStore';

type TabId = 'overview' | 'credentials' | 'assignments' | 'availability' | 'history';

const TAB_ITEMS: Array<{ id: TabId; label: string; disabled?: boolean; tooltip?: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'credentials', label: 'Credentials & Competencies' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'availability', label: 'Availability', disabled: true },
  { id: 'history', label: 'History', disabled: true },
];

export function ClinicianDetailPage() {
  const { clinicianId } = useParams<{ clinicianId: string }>();
  const { getClinicianById, getConnectionsForClinician } = useClinicianStore();

  const { getPatientById } = usePatientStore();
  const clinician = getClinicianById(clinicianId ?? '');
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  if (!clinician) {
    return (
      <div className="flex flex-col h-full">
        <DemoBanner />
        <div className="p-4 md:p-6 lg:p-8">
          <EmptyState
            icon={<UserX size={32} />}
            title="Clinician not found"
            description={`No clinician record found for ID "${clinicianId ?? ''}".`}
            action={
              <Link
                to="/clinicians"
                className="text-sm font-medium underline"
                style={{ color: 'var(--ci-link)' }}
              >
                Return to Clinician Profiles
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const connections = getConnectionsForClinician(clinician.id);
  const visibleConnections = connections.filter((c) =>
    ['assigned', 'eligible', 'preferred'].includes(c.connectionStatus),
  );

  const hasAccommodations =
    (clinician.religiousRestrictions && clinician.religiousRestrictions.length > 0) ||
    (clinician.adaAccommodations && clinician.adaAccommodations.length > 0) ||
    clinician.pregnancyAccommodation?.active ||
    clinician.fmlaLeave?.active;

  return (
    <div className="flex flex-col h-full">
      <DemoBanner />
      <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-4">
        {/* Breadcrumb */}
        <nav className="text-sm flex items-center gap-1" style={{ color: 'var(--ci-text-muted-2)' }}>
          <Link to="/clinicians" className="hover:underline" style={{ color: 'var(--ci-link)' }}>
            Clinician Profiles
          </Link>
          <span>›</span>
          <span style={{ color: 'var(--ci-text-primary)' }}>
            {clinician.firstName} {clinician.lastName}
          </span>
        </nav>

        {/* Name header */}
        <div className="flex items-start gap-3 flex-wrap">
          <div>
            <h1 className="font-montserrat text-2xl font-bold" style={{ color: 'var(--ci-text-primary)' }}>
              {clinician.firstName} {clinician.lastName}
            </h1>
            {clinician.preferredName && clinician.preferredName !== clinician.firstName && (
              <div className="text-sm mt-0.5" style={{ color: 'var(--ci-text-subtle)' }}>
                Preferred: "{clinician.preferredName}"
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <DisciplineBadge discipline={clinician.primaryDiscipline} />
            <StatusBadge status={clinician.status} />
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
          ariaLabel="Clinician detail tabs"
        />

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SurfaceCard>
              <SectionHeader title="Personal Information" />
              <dl className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <dt className="font-medium w-36 shrink-0" style={{ color: 'var(--ci-text-muted-2)' }}>Email</dt>
                  <dd style={{ color: 'var(--ci-text-primary)' }}>{clinician.email ?? '—'}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium w-36 shrink-0" style={{ color: 'var(--ci-text-muted-2)' }}>Phone</dt>
                  <dd style={{ color: 'var(--ci-text-primary)' }}>{clinician.phone ?? '—'}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium w-36 shrink-0" style={{ color: 'var(--ci-text-muted-2)' }}>Employment</dt>
                  <dd style={{ color: 'var(--ci-text-primary)' }}>{clinician.employmentType}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium w-36 shrink-0" style={{ color: 'var(--ci-text-muted-2)' }}>Hire Date</dt>
                  <dd style={{ color: 'var(--ci-text-primary)' }}>{clinician.hireDate ?? '—'}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium w-36 shrink-0" style={{ color: 'var(--ci-text-muted-2)' }}>Role</dt>
                  <dd style={{ color: 'var(--ci-text-primary)' }}>
                    {clinician.orgRole?.replace(/_/g, ' ') ?? '—'}
                  </dd>
                </div>
                {clinician.maxHoursPerWeek && (
                  <div className="flex gap-2">
                    <dt className="font-medium w-36 shrink-0" style={{ color: 'var(--ci-text-muted-2)' }}>Max hrs/wk</dt>
                    <dd style={{ color: 'var(--ci-text-primary)' }}>{clinician.maxHoursPerWeek}</dd>
                  </div>
                )}
              </dl>
            </SurfaceCard>

            <SurfaceCard>
              <SectionHeader title="Disciplines & Areas" />
              <div className="flex flex-wrap gap-2 mb-3">
                <DisciplineBadge discipline={clinician.primaryDiscipline} />
                {clinician.secondaryDisciplines?.map((d) => (
                  <DisciplineBadge key={d} discipline={d} />
                ))}
              </div>
              {clinician.serviceAreas && clinician.serviceAreas.length > 0 && (
                <>
                  <div className="text-xs font-medium mb-1" style={{ color: 'var(--ci-text-muted-2)' }}>
                    SERVICE AREAS
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {clinician.serviceAreas.map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                        style={{ background: 'var(--ci-surface-muted)', color: 'var(--ci-text-primary)', border: '1px solid var(--ci-border)' }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </SurfaceCard>

            {hasAccommodations && (
              <SurfaceCard className="md:col-span-2">
                <SectionHeader
                  eyebrow="FEHA Compliance"
                  title="FEHA Compliance — Accommodation Data"
                />
                <div className="space-y-3">
                  {clinician.religiousRestrictions?.map((r, i) => (
                    <div key={i} className="p-3 rounded" style={{ background: 'var(--ci-info-bg)', border: '1px solid var(--ci-border)' }}>
                      <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--ci-text-muted-2)' }}>
                        Religious Restriction
                      </div>
                      <div className="text-sm font-medium" style={{ color: 'var(--ci-text-primary)' }}>
                        {r.day}{r.timeRange ? ` (${r.timeRange})` : ''}
                      </div>
                      {r.description && (
                        <div className="text-xs mt-0.5" style={{ color: 'var(--ci-text-muted-2)' }}>
                          {r.description}
                        </div>
                      )}
                      {r.recurring && (
                        <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--ci-surface-muted)', color: 'var(--ci-text-subtle)' }}>
                          Recurring
                        </span>
                      )}
                    </div>
                  ))}
                  {clinician.adaAccommodations?.map((a, i) => (
                    <div key={i} className="p-3 rounded" style={{ background: 'var(--ci-info-bg)', border: '1px solid var(--ci-border)' }}>
                      <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--ci-text-muted-2)' }}>
                        ADA Accommodation — {a.type}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--ci-text-primary)' }}>{a.description}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--ci-text-muted-2)' }}>
                        Effective: {a.effectiveDate}{a.reviewDate ? ` · Review: ${a.reviewDate}` : ''}
                      </div>
                    </div>
                  ))}
                  {clinician.fmlaLeave?.active && (
                    <div className="p-3 rounded" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(234,179,8,0.35)' }}>
                      <div className="text-xs font-semibold mb-0.5" style={{ color: '#a16207' }}>
                        FMLA Leave — Active
                      </div>
                      <div className="text-sm" style={{ color: 'var(--ci-text-primary)' }}>
                        {clinician.fmlaLeave.leaveType ?? 'FMLA'}
                        {clinician.fmlaLeave.intermittent ? ' (Intermittent)' : ''}
                      </div>
                      {(clinician.fmlaLeave.startDate || clinician.fmlaLeave.endDate) && (
                        <div className="text-xs mt-0.5" style={{ color: 'var(--ci-text-muted-2)' }}>
                          {clinician.fmlaLeave.startDate} – {clinician.fmlaLeave.endDate ?? 'TBD'}
                        </div>
                      )}
                    </div>
                  )}
                  {clinician.pregnancyAccommodation?.active && (
                    <div className="p-3 rounded" style={{ background: 'var(--ci-info-bg)', border: '1px solid var(--ci-border)' }}>
                      <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--ci-text-muted-2)' }}>
                        Pregnancy Accommodation — Active
                      </div>
                      {clinician.pregnancyAccommodation.details && (
                        <div className="text-sm" style={{ color: 'var(--ci-text-primary)' }}>
                          {clinician.pregnancyAccommodation.details}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </SurfaceCard>
            )}
          </div>
        )}

        {/* Tab: Credentials & Competencies */}
        {activeTab === 'credentials' && (
          <div className="flex flex-col gap-4">
            <SurfaceCard>
              <SectionHeader title="Credentials" />
              {clinician.credentials.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--ci-text-muted-2)' }}>No credentials on record.</p>
              ) : (
                <div className="space-y-3">
                  {clinician.credentials.map((cred, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-4 p-3 rounded"
                      style={{ background: 'var(--ci-surface-muted)', border: '1px solid var(--ci-border)' }}
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-sm" style={{ color: 'var(--ci-text-primary)' }}>
                          {cred.credentialName}
                        </div>
                        <div className="text-xs mt-0.5 space-x-2" style={{ color: 'var(--ci-text-muted-2)' }}>
                          <span>{cred.type}</span>
                          {cred.issuingBody && <span>· {cred.issuingBody}</span>}
                          {cred.licenseNumber && <span>· #{cred.licenseNumber}</span>}
                          {cred.state && <span>· {cred.state}</span>}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--ci-text-muted-2)' }}>
                          Issued: {cred.issuedAt}
                          {cred.expiresAt && ` · Expires: ${cred.expiresAt}`}
                          {cred.daysUntilExpiry !== undefined && (
                            <span className="ml-1">
                              ({cred.daysUntilExpiry < 0
                                ? `${Math.abs(cred.daysUntilExpiry)}d overdue`
                                : `${cred.daysUntilExpiry}d remaining`})
                            </span>
                          )}
                        </div>
                      </div>
                      <CredentialBadge status={cred.status} />
                    </div>
                  ))}
                </div>
              )}
            </SurfaceCard>

            <SurfaceCard>
              <SectionHeader title="Competencies" />
              {clinician.competencies.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--ci-text-muted-2)' }}>No competencies on record.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {clinician.competencies.map((comp, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                      style={{ background: 'var(--ci-surface-muted)', border: '1px solid var(--ci-border)', color: 'var(--ci-text-primary)' }}
                    >
                      <span>{comp.name}</span>
                      {comp.level && (
                        <span
                          className="px-1.5 py-0.5 rounded text-xs font-semibold"
                          style={{
                            background: comp.level === 'advanced' ? 'rgba(79,70,229,0.12)' : comp.level === 'intermediate' ? 'rgba(37,99,235,0.12)' : 'var(--ci-surface-muted)',
                            color: comp.level === 'advanced' ? '#4338ca' : comp.level === 'intermediate' ? '#1d4ed8' : 'var(--ci-text-muted-2)',
                          }}
                        >
                          {comp.level}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SurfaceCard>
          </div>
        )}

        {/* Tab: Assignments */}
        {activeTab === 'assignments' && (
          <SurfaceCard>
            <SectionHeader title="Assignments" />
            {visibleConnections.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--ci-text-muted-2)' }}>No active assignments.</p>
            ) : (
              <div className="space-y-2">
                {visibleConnections.map((conn) => (
                  <div
                    key={conn.id}
                    className="p-3 rounded flex flex-col gap-1"
                    style={{ background: 'var(--ci-surface-muted)', border: '1px solid var(--ci-border)' }}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/patients/${conn.patientId}`}
                        className="text-sm font-medium hover:underline"
                        style={{ color: 'var(--ci-link)' }}
                      >
                        {(() => {
                          const pat = getPatientById(conn.patientId);
                          return pat ? `${pat.firstName} ${pat.lastName}` : `Patient #${conn.patientId}`;
                        })()}
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
                ))}
              </div>
            )}
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
