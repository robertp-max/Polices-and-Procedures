import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOnboardingV2Store } from '../store/onboardingV2Store';
import { PageHeader } from '@/policy/components/ui/PageHeader';
import { SurfaceCard } from '@/policy/components/ui/SurfaceCard';
import { SearchField } from '@/policy/components/ui/SearchField';
import { StatusPill } from '../components/StatusPill';
import type { BatchStatus } from '../types';
import { batchRoleIds, batchEffective } from './batchHelpers';

export function BatchListPage() {
  const snap = useOnboardingV2Store(s => s.snap);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BatchStatus | 'All'>('All');

  const filtered = useMemo(() => {
    return snap.batches.filter(b => {
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      const subject = snap.workforce.find(w => w.id === b.subjectId)
                  ?? snap.vendors.find(v => v.id === b.subjectId);
      const name = (subject as { legalName?: string } | undefined)?.legalName ?? '';
      return b.id.toLowerCase().includes(q)
          || b.subjectId.toLowerCase().includes(q)
          || name.toLowerCase().includes(q)
          || batchRoleIds(b).join(',').toLowerCase().includes(q);
    });
  }, [snap, query, statusFilter]);

  const STATUSES: (BatchStatus | 'All')[] = ['All', 'PendingActivation', 'InProgress', 'AtRisk', 'AwaitingEvidence', 'AwaitingSignature', 'Blocked', 'Completed', 'Withdrawn', 'RevalidationDue'];

  return (
    <div className="p-5 md:p-6 space-y-5 overflow-y-auto h-full">
      <PageHeader
        eyebrow="ONBOARDING V2"
        title="Onboarding Batches"
        description="All execution batches across the organization, hash-chained and traceable to a single trigger."
      />

      <div className="flex items-center gap-3">
        <SearchField
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search subject, batch id, role…"
          className="flex-1 max-w-md"
        />
        <select
          title="Filter batches by status"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as BatchStatus | 'All')}
          className="text-[12px] border border-[#E5E7EB] rounded-md px-3 py-2 bg-white"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <SurfaceCard padding="none" className="overflow-hidden border border-[var(--v3-border-subtle)]">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[var(--v3-border-subtle)] text-[10px] uppercase tracking-wider text-[var(--v3-text-tertiary)]">
              <th className="text-left px-4 py-2.5">Batch</th>
              <th className="text-left px-4 py-2.5">Subject</th>
              <th className="text-left px-4 py-2.5">Trigger</th>
              <th className="text-left px-4 py-2.5">Roles</th>
              <th className="text-left px-4 py-2.5">Effective</th>
              <th className="text-right px-4 py-2.5">Units</th>
              <th className="text-right px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--v3-border-subtle)]">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-[var(--v3-text-tertiary)] italic">No batches match.</td></tr>
            )}
            {filtered.map(b => {
              const subject = snap.workforce.find(w => w.id === b.subjectId)
                           ?? snap.vendors.find(v => v.id === b.subjectId);
              const subjectName = (subject as { legalName?: string } | undefined)?.legalName ?? b.subjectId;
              const total = snap.units.filter(u => u.batchId === b.id).length;
              const done  = snap.units.filter(u => u.batchId === b.id && u.status === 'Completed').length;
              return (
                <tr key={b.id} className="hover:bg-[var(--v3-surface-elevated)]">
                  <td className="px-4 py-2.5 font-mono tabular-nums text-[11px] text-[var(--brand-primary,#00797D)]">
                    <Link to={`/onboarding-v2/batches/${b.id}`} className="hover:underline">{b.id}</Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-[var(--v3-text-primary)]">{subjectName}</div>
                    <div className="text-[10px] text-[var(--v3-text-secondary)]">{b.subjectId}</div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-[#4B5563]">{b.triggerType}</td>
                  <td className="px-4 py-2.5 text-[#4B5563]">{batchRoleIds(b).join(', ') || '—'}</td>
                  <td className="px-4 py-2.5 text-[#4B5563]">{batchEffective(b) ? new Date(batchEffective(b) as string).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[var(--v3-text-primary)]">{done}/{total}</td>
                  <td className="px-4 py-2.5 text-right"><StatusPill status={b.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SurfaceCard>
    </div>
  );
}
