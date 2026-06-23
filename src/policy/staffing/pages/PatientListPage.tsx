import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/policy/components/ui/PageHeader';
import { SearchField } from '@/policy/components/ui/SearchField';
import { DataGrid } from '@/policy/components/ui/DataGrid';
import { EmptyState } from '@/policy/components/ui/EmptyState';
import { MetricTile, BorderGlow, ToneBadge, SpotlightCard } from '@/policy/components/ui';
import { Heart } from 'lucide-react';
import { DemoBanner } from '../components/DemoBanner';
import { AcuityBadge } from '../components/AcuityBadge';
import { PatientCard } from '../components/PatientCard';
import { usePatientStore } from '../stores/patientStore';
import { useClinicianStore } from '../stores/clinicianStore';
import type { AcuityLevel } from '../types';

const ALL_ACUITY_LEVELS: AcuityLevel[] = ['a1_routine', 'a2_moderate', 'a3_high', 'a4_critical_complex'];
const ACUITY_LABELS: Record<AcuityLevel, string> = {
  a1_routine: 'A1 — Routine',
  a2_moderate: 'A2 — Moderate',
  a3_high: 'A3 — High',
  a4_critical_complex: 'A4 — Critical / Complex',
};

export function PatientListPage() {
  const navigate = useNavigate();
  const {
    filterAcuity, setFilterAcuity,
    filterAccm, setFilterAccm,
    filterSetting, setFilterSetting,
    searchQuery, setSearchQuery,
    getFilteredPatients,
  } = usePatientStore();

  const { clinicians, connections, getClinicianById } = useClinicianStore();

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768,
  );

  useState(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  });

  const filtered = getFilteredPatients();
  const total = usePatientStore((s) => s.patients.length);

  const accmClinicians = clinicians.filter((c) => c.orgRole === 'accm');

  // Phase 3: derive display metrics only (no data/store/click changes)
  const allPatients = usePatientStore((s) => s.patients);
  const homeCount = allPatients.filter((p) => p.serviceSetting === 'home').length;
  const highAcuityCount = allPatients.filter((p) => p.acuityLevel === 'a4_critical_complex' || p.acuityLevel === 'a3_high').length;
  const assignedPatientConnections = useClinicianStore((s) => s.connections.filter((c) => c.connectionStatus === 'assigned' && c.patientId).length);

  const handleClearFilters = () => {
    setFilterAcuity(null);
    setFilterAccm(null);
    setFilterSetting(null);
    setSearchQuery('');
  };

  const hasFilters = !!(filterAcuity || filterAccm || filterSetting || searchQuery);

  return (
    <div className="flex flex-col h-full">
      <DemoBanner />
      <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-4 flex-1 min-h-0">
        <PageHeader
          eyebrow="Phase 1 · Read-only"
          title={
            <span className="flex items-center gap-2">
              Patient Profiles
              <ToneBadge tone="teal">{filtered.length}/{total}</ToneBadge>
            </span>
          }
          description="Synthetic demonstration data only."
        />

        {/* PHASE 3 ONLY: Apply MetricTile, BorderGlow, ToneBadge, Spotlight variant to profiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <BorderGlow borderRadius={16} glowIntensity={0.7}>
            <MetricTile label="Active Census" value={total} note="Patients" tone="teal" />
          </BorderGlow>
          <MetricTile label="Home Setting" value={homeCount} note="Service at home" tone="success" />
          <MetricTile label="High Acuity" value={highAcuityCount} note="Critical/High" tone="danger" />
          <SpotlightCard variant="border-glow" className="rounded-2xl">
            <MetricTile label="Assignments" value={assignedPatientConnections} note="Clinician links" tone="orange" />
          </SpotlightCard>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchField
            placeholder="Search by name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search patients by name"
          />

          <select
            value={filterAcuity ?? ''}
            onChange={(e) => setFilterAcuity((e.target.value as AcuityLevel) || null)}
            aria-label="Filter by patient acuity level"
            className="h-9 px-3 rounded-md text-sm"
            style={{
              background: 'var(--ci-surface)',
              border: '1px solid var(--ci-border-strong)',
              color: 'var(--ci-text-primary)',
            }}
          >
            <option value="">All Acuity Levels</option>
            {ALL_ACUITY_LEVELS.map((t) => (
              <option key={t} value={t}>{ACUITY_LABELS[t]}</option>
            ))}
          </select>

          <select
            value={filterSetting ?? ''}
            onChange={(e) => setFilterSetting((e.target.value as 'home' | 'facility') || null)}
            aria-label="Filter by service setting"
            className="h-9 px-3 rounded-md text-sm"
            style={{
              background: 'var(--ci-surface)',
              border: '1px solid var(--ci-border-strong)',
              color: 'var(--ci-text-primary)',
            }}
          >
            <option value="">All Settings</option>
            <option value="home">Home</option>
            <option value="facility">Facility</option>
          </select>

          <select
            value={filterAccm ?? ''}
            onChange={(e) => setFilterAccm(e.target.value || null)}
            aria-label="Filter by ACCM"
            className="h-9 px-3 rounded-md text-sm"
            style={{
              background: 'var(--ci-surface)',
              border: '1px solid var(--ci-border-strong)',
              color: 'var(--ci-text-primary)',
            }}
          >
            <option value="">All ACCMs</option>
            {accmClinicians.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs underline"
              style={{ color: 'var(--ci-link)' }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <EmptyState
            icon={<Heart size={32} />}
            title="No patients match your filters"
            description="Try adjusting your search or filter criteria."
            action={
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm underline"
                style={{ color: 'var(--ci-link)' }}
              >
                Clear all filters
              </button>
            }
          />
        )}

        {/* Mobile: card stack (BorderGlow Phase 3) */}
        {filtered.length > 0 && isMobile && (
          <BorderGlow borderRadius={12} glowIntensity={0.6} className="w-full">
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((p) => (
                <PatientCard key={p.id} patient={p} />
              ))}
            </div>
          </BorderGlow>
        )}

        {/* Desktop: table */}
        {filtered.length > 0 && !isMobile && (
          <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--ci-border)' }}>
            <DataGrid aria-label="Patient profiles list">
              <DataGrid.Head>
                <DataGrid.HeaderRow>
                  <DataGrid.HeaderCell>Name</DataGrid.HeaderCell>
                  <DataGrid.HeaderCell>Acuity Level</DataGrid.HeaderCell>
                  <DataGrid.HeaderCell>Setting</DataGrid.HeaderCell>
                  <DataGrid.HeaderCell>Zone</DataGrid.HeaderCell>
                  <DataGrid.HeaderCell>ACCM</DataGrid.HeaderCell>
                  <DataGrid.HeaderCell align="center">Assignments</DataGrid.HeaderCell>
                </DataGrid.HeaderRow>
              </DataGrid.Head>
              <DataGrid.Body>
                {filtered.map((p) => {
                  const assignmentCount = connections.filter(
                    (c) => c.patientId === p.id && c.connectionStatus === 'assigned',
                  ).length;
                  const accmClinician = getClinicianById(p.accmOwnerId);
                  const accmName = accmClinician
                    ? `${accmClinician.firstName} ${accmClinician.lastName}`
                    : p.accmOwnerId;
                  return (
                    <DataGrid.Row
                      key={p.id}
                      className="cursor-pointer hover:bg-[var(--ci-surface-muted)] transition-colors"
                      onClick={() => navigate(`/patients/${p.id}`)}
                    >
                      <DataGrid.Cell>
                        <button
                          type="button"
                          className="font-medium hover:underline text-left"
                          style={{ color: 'var(--ci-link)' }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/patients/${p.id}`); }}
                        >
                          {p.firstName} {p.lastName}
                        </button>
                      </DataGrid.Cell>
                      <DataGrid.Cell>
                        <AcuityBadge level={p.acuityLevel} />
                      </DataGrid.Cell>
                      <DataGrid.Cell>
                        <span className="text-xs capitalize" style={{ color: 'var(--ci-text-muted-2)' }}>
                          {p.serviceSetting}
                        </span>
                      </DataGrid.Cell>
                      <DataGrid.Cell>
                        <span className="text-xs" style={{ color: 'var(--ci-text-muted-2)' }}>
                          {p.serviceZone ?? '—'}
                        </span>
                      </DataGrid.Cell>
                      <DataGrid.Cell>
                        <span className="text-xs" style={{ color: 'var(--ci-text-muted-2)' }}>
                          {accmName}
                        </span>
                      </DataGrid.Cell>
                      <DataGrid.Cell align="center">
                        <span
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold"
                          style={{ background: 'var(--ci-surface-muted)', color: 'var(--ci-text-primary)' }}
                        >
                          {assignmentCount}
                        </span>
                      </DataGrid.Cell>
                    </DataGrid.Row>
                  );
                })}
              </DataGrid.Body>
            </DataGrid>
          </div>
        )}
      </div>
    </div>
  );
}
