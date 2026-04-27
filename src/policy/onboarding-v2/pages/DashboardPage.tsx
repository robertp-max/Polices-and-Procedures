import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertOctagon, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { useOnboardingV2Store } from '../store/onboardingV2Store';
import { KpiTile } from '../components/KpiTile';
import { StatusPill } from '../components/StatusPill';
import { AUDIT_LABEL } from '../engine/audit';
import { PHASE_LABEL } from '../types';
import { batchRoleIds, batchEffective } from './batchHelpers';

type Tab = 'all' | 'inflight' | 'blocked' | 'awaiting' | 'completed';

export function DashboardPage() {
  const snap = useOnboardingV2Store(s => s.snap);
  const [tab, setTab] = useState<Tab>('inflight');

  const kpis = useMemo(() => {
    const open = snap.batches.filter(b => b.status !== 'Completed' && b.status !== 'Withdrawn');
    const blocked = snap.units.filter(u => u.status === 'Blocked');
    const awaitingSig = snap.units.filter(u => u.status === 'AwaitingSignature');
    const awaitingEv = snap.units.filter(u => u.status === 'AwaitingEvidence');
    const overdue = snap.units.filter(u => u.dueAt && new Date(u.dueAt) < new Date() && u.status !== 'Completed');
    return { open: open.length, blocked: blocked.length, awaitingSig: awaitingSig.length, awaitingEv: awaitingEv.length, overdue: overdue.length };
  }, [snap]);

  const filtered = useMemo(() => {
    return snap.batches.filter(b => {
      switch (tab) {
        case 'all':       return true;
        case 'inflight':  return b.status === 'InProgress' || b.status === 'AtRisk';
        case 'blocked':   return b.status === 'Blocked';
        case 'awaiting':  return b.status === 'AwaitingEvidence' || b.status === 'AwaitingSignature';
        case 'completed': return b.status === 'Completed';
      }
    });
  }, [snap.batches, tab]);

  const recentAudit = useMemo(() => snap.audit.slice(-15).reverse(), [snap.audit]);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Onboarding v2</div>
          <h1 className="text-[22px] font-semibold text-[#0B2545]">Compliance Activation Dashboard</h1>
          <p className="text-[12px] text-[#4B5563] mt-1 max-w-2xl">
            Audit-grade view of every active subject, gate, and outstanding evidence requirement. Every state change is hash-chained and surveyor-defensible.
          </p>
        </div>
        <Link
          to="/onboarding-v2/activate"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#E07B2C] text-white font-semibold text-[12px] hover:bg-[#C56B22]"
        >
          <Sparkles size={14} /> Activate subject
        </Link>
      </header>

      {/* KPI strip */}
      <section className="grid grid-cols-5 gap-3">
        <KpiTile label="Open batches"        value={kpis.open}         hint="Active, not completed/withdrawn" />
        <KpiTile label="Blocked units"       value={kpis.blocked}      hint="Pre-conditions or override gating" tone={kpis.blocked ? 'danger' : 'default'} />
        <KpiTile label="Awaiting signature"  value={kpis.awaitingSig}  hint="eCIgn envelopes pending" tone={kpis.awaitingSig ? 'warning' : 'default'} />
        <KpiTile label="Awaiting evidence"   value={kpis.awaitingEv}   hint="Forms / uploads needed" tone={kpis.awaitingEv ? 'warning' : 'default'} />
        <KpiTile label="Overdue units"       value={kpis.overdue}      hint="Past SLA dueAt"          tone={kpis.overdue ? 'danger' : 'default'} />
      </section>

      {/* Two-column body */}
      <section className="grid grid-cols-12 gap-5">
        {/* Batch list */}
        <div className="col-span-8">
          <div className="border border-[#E5E7EB] rounded-[10px] bg-white">
            <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center gap-3">
              <Activity size={16} className="text-[#13355E]" />
              <h2 className="text-[13px] font-semibold text-[#0B2545]">Active batches</h2>
              <div className="ml-auto flex items-center gap-1">
                {(['inflight','blocked','awaiting','completed','all'] as Tab[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition ${
                      tab === t ? 'bg-[#0B2545] text-white' : 'text-[#4B5563] hover:bg-[#F2F4F7]'
                    }`}
                  >{t === 'inflight' ? 'In flight' : t}</button>
                ))}
              </div>
            </div>
            <ul className="divide-y divide-[#E5E7EB]">
              {filtered.length === 0 && (
                <li className="px-4 py-8 text-[12px] text-[#6B7280] italic text-center">No batches in this view.</li>
              )}
              {filtered.map(b => {
                const subject = snap.workforce.find(w => w.id === b.subjectId)
                             ?? snap.vendors.find(v => v.id === b.subjectId);
                const subjectName = (subject as { legalName?: string } | undefined)?.legalName ?? b.subjectId;
                const total = snap.units.filter(u => u.batchId === b.id).length;
                const done = snap.units.filter(u => u.batchId === b.id && u.status === 'Completed').length;
                return (
                  <li key={b.id}>
                    <Link to={`/onboarding-v2/batches/${b.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F7F8FA] transition">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-[13px] font-semibold text-[#0B2545]">{subjectName}</div>
                          <span className="text-[10px] text-[#6B7280] tabular-nums">{b.id}</span>
                        </div>
                        <div className="text-[11px] text-[#4B5563] mt-0.5">
                          {batchRoleIds(b).join(', ') || '—'} · trigger <span className="font-mono">{b.triggerType}</span>
                          {batchEffective(b) && <> · effective {new Date(batchEffective(b) as string).toLocaleDateString()}</>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StatusPill status={b.status} />
                        <div className="text-[10px] tabular-nums text-[#6B7280]">{done}/{total} units</div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Phase distribution */}
          <div className="mt-5 border border-[#E5E7EB] rounded-[10px] bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-[#13355E]" />
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#0B2545]">Open units by phase</h3>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Object.entries(PHASE_LABEL).map(([phase, label]) => {
                const n = snap.units.filter(u => u.phase === phase && u.status !== 'Completed' && u.status !== 'Suppressed').length;
                return (
                  <div key={phase} className="border border-[#E5E7EB] rounded-md p-2.5 bg-[#F7F8FA]">
                    <div className="text-[9px] uppercase tracking-wider text-[#6B7280] truncate" title={label}>{label}</div>
                    <div className="text-[20px] font-semibold text-[#0B2545] tabular-nums">{n}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live audit feed */}
        <aside className="col-span-4">
          <div className="border border-[#E5E7EB] rounded-[10px] bg-white">
            <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center gap-2">
              <Clock size={16} className="text-[#13355E]" />
              <h2 className="text-[13px] font-semibold text-[#0B2545]">Live audit feed</h2>
            </div>
            <ul className="divide-y divide-[#E5E7EB] max-h-[640px] overflow-y-auto">
              {recentAudit.map(ev => (
                <li key={ev.id} className="px-4 py-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-[#6B7280] tabular-nums">
                    #{ev.sequence} · {new Date(ev.createdAt).toLocaleTimeString()}
                  </div>
                  <div className="text-[12px] font-semibold text-[#0B1220]">{AUDIT_LABEL[ev.eventType]}</div>
                  <div className="text-[10px] text-[#4B5563] truncate">subject {ev.subjectId ?? '—'}</div>
                </li>
              ))}
              {recentAudit.length === 0 && (
                <li className="px-4 py-8 text-[12px] text-[#6B7280] italic text-center">
                  <AlertOctagon size={20} className="mx-auto mb-1 text-[#9CA3AF]" />
                  No audit events yet.
                </li>
              )}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
