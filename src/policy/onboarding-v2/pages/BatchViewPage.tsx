import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { useOnboardingV2Store } from '../store/onboardingV2Store';
import { StatusPill } from '../components/StatusPill';
import { GateTile } from '../components/GateTile';
import { UnitDrawer } from '../components/UnitDrawer';
import { AuditTimeline } from '../components/AuditTimeline';
import { PHASE_ORDER, PHASE_LABEL, type Phase, type OnboardingExecutionUnit } from '../types';
import { batchRoleIds, batchEffective } from './batchHelpers';
import { PageHeader } from '@/policy/components/ui/PageHeader';

export function BatchViewPage() {
  const { batchId = '' } = useParams<{ batchId: string }>();
  const snap = useOnboardingV2Store(s => s.snap);
  const evaluateAll = useOnboardingV2Store(s => s.evaluateAllGates);
  const batch = snap.batches.find(b => b.id === batchId);
  const units = snap.units.filter(u => u.batchId === batchId);
  const [openPhases, setOpenPhases] = useState<Set<Phase>>(new Set(PHASE_ORDER));
  const [openUnitId, setOpenUnitId] = useState<string | null>(null);

  const subject = batch ? (snap.workforce.find(w => w.id === batch.subjectId) ?? snap.vendors.find(v => v.id === batch.subjectId)) : null;
  const subjectName = (subject as { legalName?: string } | undefined)?.legalName ?? batch?.subjectId ?? '';
  const audit = useMemo(() => snap.audit.filter(a => a.batchId === batchId).slice().reverse(), [snap.audit, batchId]);
  const gates = useMemo(() => batch ? evaluateAll(batch.subjectId) : [], [batch, evaluateAll]);

  if (!batch) {
    return (
      <div className="p-6">
        <Link to="/onboarding-v2/batches" className="text-[12px] text-[#13355E] hover:underline">← Back to batches</Link>
        <div className="mt-6 text-[#B42318]">Batch not found: {batchId}</div>
      </div>
    );
  }

  const openUnit = openUnitId ? units.find(u => u.id === openUnitId) : null;

  function togglePhase(p: Phase) {
    setOpenPhases(prev => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      return next;
    });
  }

  return (
    <div className="grid grid-cols-12 h-full">
      {/* Main */}
      <div className="col-span-9 overflow-y-auto p-5 md:p-6 space-y-5">
        <div>
          <Link to="/onboarding-v2/batches" className="inline-flex items-center gap-1 text-[11px] text-[var(--brand-primary,#00797D)] hover:underline">
            <ArrowLeft size={12} /> Back to batches
          </Link>
        </div>
        <PageHeader
          eyebrow={batch.id}
          title={subjectName}
          description={`Trigger ${batch.triggerType} · Roles ${batchRoleIds(batch).join(', ') || '—'} · Effective ${batchEffective(batch) ? new Date(batchEffective(batch) as string).toLocaleDateString() : '—'}`}
          actions={<StatusPill status={batch.status} size="md" />}
        />

        {/* Gate strip */}
        <section>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Gates</div>
          <div className="grid grid-cols-5 gap-3">
            {gates.map(g => {
              const last = snap.gateEvaluations.filter(e => e.subjectId === batch.subjectId && e.gateId === g.gateId).slice(-1)[0];
              return <GateTile key={g.gateId} result={g} lastEvalAt={last?.evaluatedAt} />;
            })}
          </div>
        </section>

        {/* Phase accordions */}
        <section>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Requirements by phase</div>
          <div className="space-y-2">
            {PHASE_ORDER.map(p => {
              const inPhase = units.filter(u => u.phase === p);
              if (inPhase.length === 0) return null;
              const open = openPhases.has(p);
              const done = inPhase.filter(u => u.status === 'Completed').length;
              return (
                <div key={p} className="border border-[#E5E7EB] rounded-[10px] bg-white overflow-hidden">
                  <button
                    onClick={() => togglePhase(p)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F7F8FA] transition"
                  >
                    {open ? <ChevronDown size={14} className="text-[#4B5563]" /> : <ChevronRight size={14} className="text-[#4B5563]" />}
                    <div className="flex-1 text-left">
                      <div className="text-[13px] font-semibold text-[#0B2545]">{PHASE_LABEL[p]}</div>
                      <div className="text-[11px] text-[#6B7280] tabular-nums">{done}/{inPhase.length} complete</div>
                    </div>
                  </button>
                  {open && (
                    <ul className="divide-y divide-[#E5E7EB] border-t border-[#E5E7EB]">
                      {inPhase.map(u => (
                        <UnitRow key={u.id} unit={u} onOpen={() => setOpenUnitId(u.id)} />
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Audit side */}
      <aside className="col-span-3 border-l border-[#E5E7EB] bg-[#FAFAFB] overflow-y-auto p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-3">Batch audit</div>
        <AuditTimeline events={audit} />
      </aside>

      {openUnit && <UnitDrawer unit={openUnit} onClose={() => setOpenUnitId(null)} />}
    </div>
  );
}

function UnitRow({ unit, onOpen }: { unit: OnboardingExecutionUnit; onOpen: () => void }) {
  const requirement = useOnboardingV2Store(s => s.snap.requirements.find(r => r.id === unit.requirementId));
  if (!requirement) return null;
  return (
    <li>
      <button onClick={onOpen} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F7F8FA] transition text-left">
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-[#0B1220] truncate">{requirement.name}</div>
          <div className="text-[10px] text-[#6B7280] truncate">
            {unit.id} · {requirement.gateContributions.map(g => g.gateId).join(', ') || 'no gate'}
            {unit.dueAt && <> · due {new Date(unit.dueAt).toLocaleDateString()}</>}
          </div>
        </div>
        <StatusPill status={unit.status} />
      </button>
    </li>
  );
}
