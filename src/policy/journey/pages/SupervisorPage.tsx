/* ═══════════════════════════════════════════════════════════════
   SUPERVISOR / DON DASHBOARD
   • Roster view with completion %, escalation badges
   • Approve / Reject clearance (HR-TA-005 Appendix B)
   • Log supervised visit (HR-TA-005 Appendix E, HR-TD-003 Appendix E)
   • Open remediation plan (HR-TD-003 Appendix C)
   ═══════════════════════════════════════════════════════════════ */

import { useMemo, useState } from 'react';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';
import { computeProgress, canClearForIndependentWork } from '@/policy/journey/utils/gating';
import { openEscalationsCount, humanEscalation } from '@/policy/journey/utils/escalation';
import { SignaturePad } from '@/policy/journey/components/SignaturePad';
import { ShieldCheck, AlertTriangle, UserPlus, ClipboardCheck, Lock, Users } from 'lucide-react';
import { PageHeader, ToneBadge, BorderGlow, MetricTile, SurfaceCard, SpotlightCard } from '@/policy/components/ui';

export function SupervisorPage() {
  const employees = useJourneyStore(s => s.employees);
  const attempts = useJourneyStore(s => s.attempts);
  const visits = useJourneyStore(s => s.supervisedVisits);
  const evidence = useJourneyStore(s => s.evidence);
  const escalations = useJourneyStore(s => s.escalations);
  const clearFn = useJourneyStore(s => s.clearForIndependentWork);
  const addVisit = useJourneyStore(s => s.addSupervisedVisit);
  const openRem = useJourneyStore(s => s.openRemediation);

  const [selectedId, setSelectedId] = useState(employees[0]?.id ?? '');
  const selected = employees.find(e => e.id === selectedId);
  const [flash, setFlash] = useState<string | null>(null);

  const rows = useMemo(() => employees.map(e => ({
    e,
    p: computeProgress(e, attempts, visits, openEscalationsCount(escalations, e.id), evidence),
  })), [employees, attempts, visits, escalations, evidence]);

  if (!selected) return <div className="p-10 text-white">No employees.</div>;
  const selectedProgress = computeProgress(selected, attempts, visits, openEscalationsCount(escalations, selected.id), evidence);
  const clearGate = canClearForIndependentWork(selected, attempts, visits);
  const selectedEscalations = escalations.filter(e => e.employeeId === selected.id && e.status !== 'Resolved');

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
      <PageHeader
        eyebrow="Supervisor / DON View"
        title={
          <span className="flex items-center gap-2">
            Team Onboarding &amp; Competency
            <ToneBadge tone="teal">{employees.length} staff</ToneBadge>
          </span>
        }
        description="HR-TA-005 §6.1 · HR-TD-003 · HR-TD-001 §4.6"
      />

      {flash && (
        <div className="mb-4 border border-[#34D399]/40 rounded-xl p-3 text-xs text-[#34D399] bg-[#34D399]/5">{flash}</div>
      )}

      {/* Adopt primitives for metrics row (dashboard match) — full MetricTile + glow per new UI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <BorderGlow borderRadius={12} glowIntensity={0.5}>
          <MetricTile label="Team Size" value={employees.length} note="Roster" tone="teal" icon={<Users size={16} />} />
        </BorderGlow>
        <MetricTile label="Cleared" value={rows.filter(r => r.p.clearedForIndependentWork).length} note="Independent" tone="success" />
        <MetricTile label="Open Escalations" value={escalations.filter(e => e.status !== 'Resolved').length} note="Agency wide" tone="warning" />
        <SpotlightCard variant="border-glow" className="rounded-2xl">
          <MetricTile label="Need Supervised" value={rows.filter(r => (r.p.supervisedVisitsRequired || 0) > (r.p.supervisedVisitsCompleted || 0)).length} note="Gaps" tone="orange" />
        </SpotlightCard>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Roster */}
        <BorderGlow borderRadius={14} glowIntensity={0.45} className="col-span-12 lg:col-span-5">
        <SurfaceCard padding="none" className="overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest" style={{ borderColor: 'var(--ci-border)', color: 'var(--ci-text-secondary)' }}>
            <Users size={14} className="text-[#FFC107]" /> Roster ({employees.length})
          </div>
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            {rows.map(({ e, p }) => {
              const active = e.id === selectedId;
              const totalPct = Math.round(
                (p.gaoCompletePct * 0.3 + p.roleCompletePct * 0.45 +
                  (p.supervisedVisitsRequired ? p.supervisedVisitsCompleted / p.supervisedVisitsRequired : 1) * 0.15 +
                  (p.clearedForIndependentWork ? 1 : 0) * 0.1) * 100,
              );
              return (
                <button key={e.id} onClick={() => setSelectedId(e.id)}
                  className={`w-full text-left px-4 py-3 border-b border-white/5 transition-all ${active ? 'bg-[#FFC107]/5' : 'hover:bg-white/3'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm text-white font-semibold truncate">{e.name}</div>
                      <div className="text-[10px] text-white/45 uppercase tracking-widest">{e.role} · Hired {e.hireDate}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.clearedForIndependentWork && <ShieldCheck size={14} className="text-[#34D399]" />}
                      {p.openEscalations > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#DC2626]">
                          <AlertTriangle size={11} /> {p.openEscalations}
                        </span>
                      )}
                      {!e.appendixFCleared && <Lock size={14} className="text-[#ff8e52]" />}
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                         style={{ width: `${totalPct}%`, background: p.clearedForIndependentWork ? '#34D399' : 'var(--ci-gold)' }} />
                  </div>
                </button>
              );
            })}
          </div>
        </SurfaceCard>
        </BorderGlow>

        {/* Detail panel */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <BorderGlow borderRadius={16} glowIntensity={0.45}>
            <SurfaceCard padding="lg">
              <div className="text-[10px] uppercase tracking-widest font-bold text-[#FFC107] mb-1">{selected.role} · {selected.id}</div>
              <div className="text-lg font-montserrat font-bold text-white">{selected.name}</div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-white/70">
                <StatBox label="GAO" value={`${Math.round(selectedProgress.gaoCompletePct * 100)}%`} />
                <StatBox label="Role" value={`${Math.round(selectedProgress.roleCompletePct * 100)}%`} />
                <StatBox label="Supervised" value={`${selectedProgress.supervisedVisitsCompleted}/${selectedProgress.supervisedVisitsRequired}`} />
                <StatBox label="Annual" value={`${Math.round(selectedProgress.annualCompletePct * 100)}%`} />
                <StatBox label="GAO-EXAM" value={selectedProgress.gaoExamPassed ? 'PASS' : '—'} />
                <StatBox label="Escalations" value={String(selectedProgress.openEscalations)} warn={selectedProgress.openEscalations > 0} />
              </div>
            </SurfaceCard>
          </BorderGlow>

          {/* Clearance panel */}
          <BorderGlow borderRadius={16} glowIntensity={0.45}>
            <SurfaceCard padding="lg">
              <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-widest font-bold text-white/60">
                <ClipboardCheck size={14} className="text-[#FFC107]" /> HR-TA-005 Appendix B — Clearance for independent practice
              </div>
              {selected.clearedForIndependentWork ? (
                <div className="text-sm text-[#34D399] flex items-center gap-2">
                  <ShieldCheck size={16} /> This employee is cleared for independent practice.
                </div>
              ) : (
                <>
                  {clearGate.ok ? (
                    <>
                      <div className="text-xs text-white/65 mb-3">All prerequisites met. Sign below to release the employee for independent work.</div>
                      <SignaturePad label="DON signature" onSign={(png, name) => {
                        const res = clearFn(selected.id, {
                          role: 'DON', name, pngDataUrl: png, signedAt: new Date().toISOString(),
                        });
                        setFlash(res.message);
                      }} />
                    </>
                  ) : (
                    <div className="text-xs text-white/65 space-y-1">
                      <div>Cannot sign — gaps remain:</div>
                      {clearGate.gaps.map((g, i) => <div key={i} className="ml-4 text-[#ff8e52]">• {g}</div>)}
                    </div>
                  )}
                </>
              )}
            </SurfaceCard>
          </BorderGlow>

          {/* Escalations */}
          {selectedEscalations.length > 0 && (
            <BorderGlow borderRadius={16} glowIntensity={0.55}>
              <SurfaceCard padding="lg" className="border-[#DC2626]/30">
                <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-widest font-bold text-[#DC2626]">
                  <AlertTriangle size={14} /> Open escalations ({selectedEscalations.length})
                </div>
                <div className="space-y-2">
                  {selectedEscalations.map(e => (
                    <div key={e.id} className="border border-white/5 rounded-lg px-3 py-2 text-xs">
                      <div className="font-bold text-white">
                        <span className={`mr-2 ${e.severity === 'CRITICAL' ? 'text-[#DC2626]' : e.severity === 'WARN' ? 'text-[#ff8e52]' : 'text-[#FFC107]'}`}>{e.severity}</span>
                        {e.type}
                      </div>
                      <div className="text-white/65 mt-0.5">{humanEscalation(e)}</div>
                      <div className="text-white/40 text-[10px] mt-0.5">Policy: {e.policyRef}</div>
                    </div>
                  ))}
                </div>
              </SurfaceCard>
            </BorderGlow>
          )}

          <QuickActions
            employeeId={selected.id}
            onVisit={(v) => { addVisit(v); setFlash('Supervised visit logged.'); }}
            onRemediation={(modId, reason, acts) => { openRem(selected.id, modId, reason, acts); setFlash('Remediation plan opened.'); }}
          />
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="border border-white/10 rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">{label}</div>
      <div className={`text-base font-montserrat ${warn ? 'text-[#DC2626]' : 'text-white'}`}>{value}</div>
    </div>
  );
}

function QuickActions({ employeeId, onVisit, onRemediation }: {
  employeeId: string;
  onVisit: (v: { employeeId: string; supervisorId: string; visitDate: string; visitType: 'INITIAL' | 'HHA_14_DAY' | 'HHA_60_DAY' | 'COMPETENCY_VALIDATION'; rating: 'SATISFACTORY' | 'NEEDS_IMPROVEMENT' | 'UNSATISFACTORY'; comments: string; signatures: [] }) => void;
  onRemediation: (moduleId: string, reason: string, actions: string[]) => void;
}) {
  const [visitType, setVisitType] = useState<'INITIAL' | 'HHA_14_DAY' | 'HHA_60_DAY' | 'COMPETENCY_VALIDATION'>('INITIAL');
  const [rating, setRating] = useState<'SATISFACTORY' | 'NEEDS_IMPROVEMENT' | 'UNSATISFACTORY'>('SATISFACTORY');
  const [comments, setComments] = useState('');
  const [remMod, setRemMod] = useState('');
  const [remReason, setRemReason] = useState('');

  return (
    <BorderGlow borderRadius={16} glowIntensity={0.45}>
      <SurfaceCard padding="lg" className="space-y-4">
        <div className="text-xs uppercase tracking-widest font-bold text-white/60 flex items-center gap-2">
          <UserPlus size={14} className="text-[#FFC107]" /> Quick actions
        </div>

      {/* Supervised Visit */}
      <div className="border border-white/5 rounded-lg p-3">
        <div className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">Log Supervised Visit (HR-TA-005 App. E / HR-TD-003 App. E)</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <select title="Supervised visit type" value={visitType} onChange={e => setVisitType(e.target.value as typeof visitType)} className="bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white">
            <option value="INITIAL">Initial supervised visit</option>
            <option value="HHA_14_DAY">HHA 14-day cycle</option>
            <option value="HHA_60_DAY">HHA 60-day cycle</option>
            <option value="COMPETENCY_VALIDATION">Competency validation</option>
          </select>
          <select title="Supervised visit rating" value={rating} onChange={e => setRating(e.target.value as typeof rating)} className="bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white">
            <option value="SATISFACTORY">Satisfactory</option>
            <option value="NEEDS_IMPROVEMENT">Needs Improvement</option>
            <option value="UNSATISFACTORY">Unsatisfactory</option>
          </select>
        </div>
        <textarea value={comments} onChange={e => setComments(e.target.value)} placeholder="Comments" rows={2}
          className="w-full bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none" />
        <button
          className="mt-2 gradient-gold rounded-lg px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
          onClick={() => onVisit({
            employeeId,
            supervisorId: 'EMP-2001',
            visitDate: new Date().toISOString().slice(0, 10),
            visitType,
            rating,
            comments,
            signatures: [],
          })}
        >Log Visit</button>
      </div>

      {/* Remediation */}
      <div className="border border-white/5 rounded-lg p-3">
        <div className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-2">Open Remediation Plan (HR-TD-003 App. C)</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input value={remMod} onChange={e => setRemMod(e.target.value)} placeholder="Module ID (e.g. RN-002)"
            className="bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none" />
          <input value={remReason} onChange={e => setRemReason(e.target.value)} placeholder="Reason"
            className="bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none" />
        </div>
        <button
          disabled={!remMod || !remReason}
          onClick={() => onRemediation(remMod, remReason, ['1:1 preceptor review', 'Policy re-read', 'Module retake'])}
          className="gradient-gold rounded-lg px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest disabled:opacity-40"
        >Open Plan (60-day)</button>
      </div>
      </SurfaceCard>
    </BorderGlow>
  );
}
