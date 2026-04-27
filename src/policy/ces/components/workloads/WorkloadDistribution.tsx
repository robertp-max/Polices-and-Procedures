/* ═══════════════════════════════════════════════════════════════
   WorkloadDistribution — owner-by-owner accountability table.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo } from 'react';
import { Users } from 'lucide-react';
import { CES_TOKENS } from '../../theme';
import { useComplianceExecution } from '@/policy/compliance-execution';
import type { OwnerAssignment } from '../../types';
import { CesCard, DomainRiskDot, UserAvatar } from '../primitives';

const RISK_LABEL = { green: 'Healthy', yellow: 'Watch', red: 'Overloaded' } as const;

export function WorkloadDistribution() {
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
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold" style={{ color: CES_TOKENS.navy }}>
          Workload Distribution
        </h1>
        <p className="text-[13px] mt-1" style={{ color: CES_TOKENS.muted }}>
          Owner-level accountability. Capacity risk reflects load, overdue items, and pending signatures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryStat
          label="Total Owners"
          value={enriched.length}
          icon={<Users size={14} />}
        />
        <SummaryStat
          label="Owners Overloaded"
          value={enriched.filter(e => e.capacityRisk === 'red').length}
          tone="red"
        />
        <SummaryStat
          label="Owners On Watch"
          value={enriched.filter(e => e.capacityRisk === 'yellow').length}
          tone="amber"
        />
      </div>

      <CesCard title="Owner Assignments" padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr style={{ background: CES_TOKENS.canvas, borderBottom: `1px solid ${CES_TOKENS.border}` }}>
                <Th>Owner</Th>
                <Th>Role</Th>
                <Th align="right">Allocated</Th>
                <Th align="right">In Flight</Th>
                <Th align="right">Awaiting Signature</Th>
                <Th align="right">Blocked</Th>
                <Th align="right">Overdue</Th>
                <Th>Capacity Risk</Th>
              </tr>
            </thead>
            <tbody>
              {enriched
                .sort((a, b) => riskRank(b.capacityRisk) - riskRank(a.capacityRisk))
                .map(row => (
                  <tr
                    key={row.owner.userId}
                    style={{ borderBottom: `1px solid ${CES_TOKENS.border}` }}
                  >
                    <Td>
                      <div className="flex items-center gap-2">
                        <UserAvatar initials={row.owner.initials} size={26} />
                        <span className="font-semibold" style={{ color: CES_TOKENS.ink }}>{row.owner.name}</span>
                      </div>
                    </Td>
                    <Td><span style={{ color: CES_TOKENS.muted }}>{row.owner.role}</span></Td>
                    <Td align="right">
                      <CapacityBar value={row.allocatedUnitCount} max={Math.max(...enriched.map(e => e.allocatedUnitCount), 1)} />
                    </Td>
                    <Td align="right" mono>{row.inFlight}</Td>
                    <Td align="right" mono>{row.pendingSignatureCount}</Td>
                    <Td align="right" mono>
                      <span style={{ color: row.blocked > 0 ? CES_TOKENS.red : CES_TOKENS.ink }}>{row.blocked}</span>
                    </Td>
                    <Td align="right" mono>
                      <span style={{ color: row.overdueUnitCount > 0 ? CES_TOKENS.red : CES_TOKENS.ink }}>{row.overdueUnitCount}</span>
                    </Td>
                    <Td>
                      <CapacityRiskCell row={row} />
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </CesCard>
    </div>
  );
}

function riskRank(r: OwnerAssignment['capacityRisk']) { return r === 'red' ? 2 : r === 'yellow' ? 1 : 0; }

function Th({ children, align }: { children: React.ReactNode; align?: 'right' | 'left' }) {
  return (
    <th
      className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em]"
      style={{ color: CES_TOKENS.muted, textAlign: align ?? 'left' }}
    >
      {children}
    </th>
  );
}

function Td({ children, align, mono }: { children: React.ReactNode; align?: 'right' | 'left'; mono?: boolean }) {
  return (
    <td
      className="px-4 py-3"
      style={{ textAlign: align ?? 'left', fontFamily: mono ? 'ui-monospace, monospace' : undefined }}
    >
      {children}
    </td>
  );
}

function CapacityBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="w-24 h-1.5 rounded-full" style={{ background: CES_TOKENS.canvas }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CES_TOKENS.navy }} />
      </div>
      <span className="font-mono w-6 text-right" style={{ color: CES_TOKENS.ink }}>{value}</span>
    </div>
  );
}

function CapacityRiskCell({ row }: { row: OwnerAssignment }) {
  const fg =
    row.capacityRisk === 'red'    ? CES_TOKENS.red :
    row.capacityRisk === 'yellow' ? CES_TOKENS.amber : CES_TOKENS.green;
  const bg =
    row.capacityRisk === 'red'    ? CES_TOKENS.redSoft :
    row.capacityRisk === 'yellow' ? CES_TOKENS.amberSoft : CES_TOKENS.greenSoft;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10.5px] font-bold uppercase tracking-[0.12em]"
      style={{ background: bg, color: fg }}
    >
      <DomainRiskDot level={row.capacityRisk} size={8} />
      {RISK_LABEL[row.capacityRisk]}
    </span>
  );
}

function SummaryStat({ label, value, icon, tone }: {
  label: string; value: number; icon?: React.ReactNode; tone?: 'red' | 'amber';
}) {
  const accent =
    tone === 'red'   ? CES_TOKENS.red :
    tone === 'amber' ? CES_TOKENS.amber : CES_TOKENS.navy;
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: CES_TOKENS.white, border: `1px solid ${CES_TOKENS.border}` }}
    >
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: CES_TOKENS.muted }}>
        {icon && <span style={{ color: accent }}>{icon}</span>}
        {label}
      </div>
      <div className="mt-2 text-[26px] font-bold leading-none" style={{ color: accent }}>{value}</div>
    </div>
  );
}
