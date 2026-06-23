/* ═══════════════════════════════════════════════════════════════
   WorkloadDistribution — owner-by-owner accountability table.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { useComplianceExecution } from '@/policy/compliance-execution';
import type { OwnerAssignment } from '../../types';
import { PageHeader, SurfaceCard, DataGrid } from '@/policy/components/ui';
import { DomainRiskDot, UserAvatar } from '../primitives';

const RISK_LABEL = { green: 'Healthy', yellow: 'Watch', red: 'Overloaded' } as const;

export function WorkloadDistribution() {
  // SurfaceCard usages here are stat containers / table wrapper (children mode); core CES board cards now adhere to exact ref prototype via SurfaceCard props (h-10 w-10, ToneBadge, h3, h-2).
  const snap = useComplianceExecution();
  const OWNER_ASSIGNMENTS = snap.ownerAssignments;
  const EXECUTION_UNITS = snap.executionUnits;

  const enriched = useMemo(() => {
    return OWNER_ASSIGNMENTS.map(a => {
      const blocked = EXECUTION_UNITS.filter(u =>
        u.owner.userId === a.owner.userId && u.complianceState === 'blocked',
      ).length;
      const inFlight = EXECUTION_UNITS.filter(u =>
        u.owner.userId === a.owner.userId &&
        (u.complianceState === 'in_progress' || u.complianceState === 'awaiting_signature'),
      ).length;
      return { ...a, blocked, inFlight };
    });
  }, [OWNER_ASSIGNMENTS, EXECUTION_UNITS]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CES WORKLOADS"
        title="Workload Distribution"
        description="Owner-level accountability. Capacity risk reflects load, overdue items, and pending signatures. Data from live compliance execution units."
        actions={<div className="text-[11px] uppercase tracking-[0.2em] text-[var(--v3-text-tertiary)]">{enriched.length} owners</div>}
      />

      {/* Clean stat pills / cards per corporate designs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SurfaceCard padding="md" className="flex items-center gap-3">
          <div className="text-[var(--v3-teal-light)]"><Users size={18} /></div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--v3-text-tertiary)]">Total Owners</div>
            <div className="text-2xl font-semibold tabular-nums">{enriched.length}</div>
          </div>
        </SurfaceCard>
        <SurfaceCard padding="md" className="flex items-center gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--v3-text-tertiary)]">Owners Overloaded</div>
            <div className="text-2xl font-semibold tabular-nums text-[var(--v3-orange)]">{enriched.filter(e => e.capacityRisk === 'red').length}</div>
          </div>
        </SurfaceCard>
        <SurfaceCard padding="md" className="flex items-center gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--v3-text-tertiary)]">Owners On Watch</div>
            <div className="text-2xl font-semibold tabular-nums text-[#F4C95D]">{enriched.filter(e => e.capacityRisk === 'yellow').length}</div>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard padding="none">
        <div className="overflow-x-auto">
          <DataGrid>
            <DataGrid.Head>
              <DataGrid.HeaderRow>
                <DataGrid.HeaderCell>Owner</DataGrid.HeaderCell>
                <DataGrid.HeaderCell>Role</DataGrid.HeaderCell>
                <DataGrid.HeaderCell align="right">Allocated</DataGrid.HeaderCell>
                <DataGrid.HeaderCell align="right">In Flight</DataGrid.HeaderCell>
                <DataGrid.HeaderCell align="right">Awaiting Sig</DataGrid.HeaderCell>
                <DataGrid.HeaderCell align="right">Blocked</DataGrid.HeaderCell>
                <DataGrid.HeaderCell align="right">Overdue</DataGrid.HeaderCell>
                <DataGrid.HeaderCell>Capacity Risk</DataGrid.HeaderCell>
              </DataGrid.HeaderRow>
            </DataGrid.Head>
            <DataGrid.Body>
              {enriched
                .sort((a, b) => riskRank(b.capacityRisk) - riskRank(a.capacityRisk))
                .map(row => (
                  <DataGrid.Row key={row.owner.userId}>
                    <DataGrid.Cell>
                      <div className="flex items-center gap-2.5">
                        <UserAvatar initials={row.owner.initials} size={22} />
                        <span className="font-semibold">{row.owner.name}</span>
                      </div>
                    </DataGrid.Cell>
                    <DataGrid.Cell>
                      <span className="text-[var(--v3-text-secondary)] text-sm">{row.owner.role}</span>
                    </DataGrid.Cell>
                    <DataGrid.Cell align="right">
                      <CapacityBar value={row.allocatedUnitCount} max={Math.max(1, ...enriched.map(e => e.allocatedUnitCount))} />
                    </DataGrid.Cell>
                    <DataGrid.Cell align="right" className="font-mono tabular-nums text-sm">{row.inFlight}</DataGrid.Cell>
                    <DataGrid.Cell align="right" className="font-mono tabular-nums text-sm">{row.pendingSignatureCount}</DataGrid.Cell>
                    <DataGrid.Cell align="right" className="font-mono tabular-nums text-sm" style={{ color: row.blocked > 0 ? 'var(--v3-orange)' : undefined }}>{row.blocked}</DataGrid.Cell>
                    <DataGrid.Cell align="right" className="font-mono tabular-nums text-sm" style={{ color: row.overdueUnitCount > 0 ? 'var(--v3-orange)' : undefined }}>{row.overdueUnitCount}</DataGrid.Cell>
                    <DataGrid.Cell>
                      <CapacityRiskCell row={row} />
                    </DataGrid.Cell>
                  </DataGrid.Row>
                ))}
            </DataGrid.Body>
          </DataGrid>
        </div>
      </SurfaceCard>
    </div>
  );
}

function riskRank(r: OwnerAssignment['capacityRisk']) { return r === 'red' ? 2 : r === 'yellow' ? 1 : 0; }

function CapacityBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="w-24 h-1.5 rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--v3-teal)' }} />
      </div>
      <span className="font-mono w-6 text-right text-sm tabular-nums">{value}</span>
    </div>
  );
}

function CapacityRiskCell({ row }: { row: OwnerAssignment }) {
  const risk = row.capacityRisk;
  const toneClass = risk === 'red' ? 'text-[var(--v3-orange)]' : risk === 'yellow' ? 'text-[#F4C95D]' : 'text-[var(--v3-teal-light)]';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.12em] ${toneClass}`} style={{ background: risk === 'red' ? 'rgba(224,123,44,0.12)' : risk === 'yellow' ? 'rgba(244,201,93,0.12)' : 'rgba(0,209,193,0.1)' }}>
      <DomainRiskDot level={risk} size={8} />
      {RISK_LABEL[risk]}
    </span>
  );
}
