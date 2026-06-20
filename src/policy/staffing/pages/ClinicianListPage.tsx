import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/policy/components/ui/PageHeader';
import { SearchField } from '@/policy/components/ui/SearchField';
import { DataGrid } from '@/policy/components/ui/DataGrid';
import { EmptyState } from '@/policy/components/ui/EmptyState';
import { MetricTile, BorderGlow, ToneBadge, SpotlightCard } from '@/policy/components/ui';
import { Users } from 'lucide-react';
import { DemoBanner } from '../components/DemoBanner';
import { DisciplineBadge } from '../components/DisciplineBadge';
import { StatusBadge } from '../components/StatusBadge';
import { ClinicianCard } from '../components/ClinicianCard';
import { useClinicianStore } from '../stores/clinicianStore';
import type { Discipline, ClinicianStatus } from '../types';

const ALL_DISCIPLINES: Discipline[] = [
  'RN', 'LVN', 'LPN', 'PT', 'PTA', 'OT', 'COTA', 'ST', 'SLP', 'MSW', 'HHA', 'CNA', 'Caregiver',
];

const ALL_STATUSES: ClinicianStatus[] = [
  'active', 'inactive', 'on_leave', 'pending', 'suspended', 'terminated',
];

export function ClinicianListPage() {
  const navigate = useNavigate();
  const {
    connections,
    filterDiscipline, setFilterDiscipline,
    filterStatus, setFilterStatus,
    searchQuery, setSearchQuery,
    getFilteredClinicians,
  } = useClinicianStore();

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768,
  );

  // Responsive detection
  useState(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  });

  const filtered = getFilteredClinicians();
  const total = useClinicianStore((s) => s.clinicians.length);

  // Phase 3: derive display metrics only from store (no data, store, or click changes)
  const allClinicians = useClinicianStore((s) => s.clinicians);
  const activeCount = allClinicians.filter((c) => c.status === 'active').length;
  const assignedConnections = useClinicianStore((s) => s.connections.filter((c) => c.connectionStatus === 'assigned').length);
  const uniqueDisciplines = new Set(allClinicians.map((c) => c.primaryDiscipline)).size;

  const handleClearFilters = () => {
    setFilterDiscipline(null);
    setFilterStatus(null);
    setSearchQuery('');
  };

  const hasFilters = !!(filterDiscipline || filterStatus || searchQuery);

  return (
    <div className="flex flex-col h-full">
      <DemoBanner />
      <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-4 flex-1 min-h-0">
        <PageHeader
          eyebrow="Phase 1 · Read-only"
          title={
            <span className="flex items-center gap-2">
              Clinician Profiles
              <ToneBadge tone="teal">{filtered.length}/{total}</ToneBadge>
            </span>
          }
          description="Synthetic demonstration data only."
        />

        {/* PHASE 3 ONLY: Apply SurfaceCard/MetricTile/BorderGlow/ToneBadge/Spotlight variant (no data/click/store mods) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <BorderGlow borderRadius={16} glowIntensity={0.7}>
            <MetricTile label="Active Clinicians" value={activeCount} note="of total roster" tone="teal" />
          </BorderGlow>
          <MetricTile label="Active Assignments" value={assignedConnections} note="Current caseloads" tone="orange" />
          <MetricTile label="Disciplines" value={uniqueDisciplines} note="Coverage breadth" tone="success" />
          <SpotlightCard variant="border-glow" className="rounded-2xl">
            <MetricTile label="Visible" value={filtered.length} note="after filters" tone="muted" />
          </SpotlightCard>
        </div>

        {/* Search & Filters — clean premium corporate per V5 ref */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchField
            placeholder="Search by name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search clinicians by name"
          />
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setFilterDiscipline(null)} className={`text-xs px-3 py-1 rounded-full border transition ${!filterDiscipline ? 'bg-[var(--v3-teal)] text-white border-transparent' : 'border-[var(--v3-border-subtle)] text-[var(--v3-text-secondary)] hover:bg-white/5'}`}>All</button>
            {ALL_DISCIPLINES.slice(0,6).map((d) => (
              <button key={d} onClick={() => setFilterDiscipline(d)} className={`text-xs px-3 py-1 rounded-full border transition ${filterDiscipline === d ? 'bg-[var(--v3-teal)] text-white border-transparent' : 'border-[var(--v3-border-subtle)] text-[var(--v3-text-secondary)] hover:bg-white/5'}`}>{d}</button>
            ))}
          </div>
          <select
            value={filterStatus ?? ''}
            onChange={(e) => setFilterStatus((e.target.value as ClinicianStatus) || null)}
            aria-label="Filter by status"
            className="h-9 px-3 rounded-md text-sm border"
            style={{ background: 'var(--ci-surface)', border: '1px solid var(--ci-border-strong)', color: 'var(--ci-text-primary)' }}
          >
            <option value="">All Status</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={filterStatus ?? ''}
            onChange={(e) => setFilterStatus((e.target.value as ClinicianStatus) || null)}
            aria-label="Filter by status"
            className="h-9 px-3 rounded-md text-sm border"
            style={{
              background: 'var(--ci-surface)',
              border: '1px solid var(--ci-border-strong)',
              color: 'var(--ci-text-primary)',
            }}
          >
            <option value="">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
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
            icon={<Users size={32} />}
            title="No clinicians match your filters"
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

        {/* Mobile: card stack (wrapped BorderGlow for Phase 3 premium cards) */}
        {filtered.length > 0 && isMobile && (
          <BorderGlow borderRadius={12} glowIntensity={0.6} className="w-full">
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((c) => (
                <ClinicianCard key={c.id} clinician={c} />
              ))}
            </div>
          </BorderGlow>
        )}

        {/* Desktop: table */}
        {filtered.length > 0 && !isMobile && (
          <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--ci-border)' }}>
            <DataGrid aria-label="Clinician profiles list">
              <DataGrid.Head>
                <DataGrid.HeaderRow>
                  <DataGrid.HeaderCell>Name</DataGrid.HeaderCell>
                  <DataGrid.HeaderCell>Discipline</DataGrid.HeaderCell>
                  <DataGrid.HeaderCell>Status</DataGrid.HeaderCell>
                  <DataGrid.HeaderCell>Employment</DataGrid.HeaderCell>
                  <DataGrid.HeaderCell align="center">Competencies</DataGrid.HeaderCell>
                  <DataGrid.HeaderCell align="center">Assignments</DataGrid.HeaderCell>
                </DataGrid.HeaderRow>
              </DataGrid.Head>
              <DataGrid.Body>
                {filtered.map((c) => {
                  const assignmentCount = connections.filter(
                    (conn) => conn.clinicianId === c.id && conn.connectionStatus === 'assigned',
                  ).length;
                  return (
                    <DataGrid.Row
                      key={c.id}
                      className="cursor-pointer hover:bg-[var(--ci-surface-muted)] transition-colors"
                      onClick={() => navigate(`/clinicians/${c.id}`)}
                    >
                      <DataGrid.Cell>
                        <button
                          type="button"
                          className="font-medium hover:underline text-left"
                          style={{ color: 'var(--ci-link)' }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/clinicians/${c.id}`); }}
                        >
                          {c.firstName} {c.lastName}
                        </button>
                      </DataGrid.Cell>
                      <DataGrid.Cell>
                        <DisciplineBadge discipline={c.primaryDiscipline} />
                      </DataGrid.Cell>
                      <DataGrid.Cell>
                        <StatusBadge status={c.status} />
                      </DataGrid.Cell>
                      <DataGrid.Cell>
                        <span className="text-xs" style={{ color: 'var(--ci-text-muted-2)' }}>
                          {c.employmentType}
                        </span>
                      </DataGrid.Cell>
                      <DataGrid.Cell align="center">
                        <span
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold"
                          style={{ background: 'var(--ci-surface-muted)', color: 'var(--ci-text-primary)' }}
                        >
                          {c.competencies.length}
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
