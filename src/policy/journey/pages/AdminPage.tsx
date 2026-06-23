/* ═══════════════════════════════════════════════════════════════
   ADMIN / HR / COMPLIANCE DASHBOARD
   • Survey-ready evidence map
   • All escalations (agency-wide)
   • Monthly OIG/SAM + annual training KPIs
   ═══════════════════════════════════════════════════════════════ */

import { useMemo } from 'react';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';
import { computeProgress } from '@/policy/journey/utils/gating';
import { openEscalationsCount, humanEscalation } from '@/policy/journey/utils/escalation';
import {
  ShieldCheck, AlertTriangle, FileSearch, Users, FileText, Clock, ChevronRight,
} from 'lucide-react';
import { PageHeader, MetricTile, BorderGlow, SurfaceCard, ToneBadge } from '@/policy/components/ui';

export function AdminPage() {
  const employees = useJourneyStore(s => s.employees);
  const attempts = useJourneyStore(s => s.attempts);
  const visits = useJourneyStore(s => s.supervisedVisits);
  const evidence = useJourneyStore(s => s.evidence);
  const escalations = useJourneyStore(s => s.escalations);
  const ack = useJourneyStore(s => s.acknowledgeEscalation);
  const resolve = useJourneyStore(s => s.resolveEscalation);

  const agg = useMemo(() => {
    const totalEmp = employees.length;
    const cleared = employees.filter(e => e.clearedForIndependentWork).length;
    const open = escalations.filter(e => e.status === 'Open').length;
    const critical = escalations.filter(e => e.severity === 'CRITICAL' && e.status !== 'Resolved').length;
    const byEmp = employees.map(e => computeProgress(e, attempts, visits, openEscalationsCount(escalations, e.id), evidence));
    const overdueAnnual = byEmp.filter(p => p.annualCompletePct < 1).length;
    const apxFMissing = employees.filter(e => !e.appendixFCleared).length;
    return { totalEmp, cleared, open, critical, overdueAnnual, apxFMissing };
  }, [employees, attempts, visits, escalations, evidence]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
      <PageHeader
        eyebrow="Admin · HR · Compliance"
        title={
          <span className="flex items-center gap-2">
            Onboarding Command Center
            <ToneBadge tone="teal">{agg.totalEmp} emp</ToneBadge>
          </span>
        }
        description="42 CFR Part 484 · HR-TA-001 §8.2 · HR-TD-001 · HR-TD-003"
      />

      {/* PHASE: adopt MetricTile + BorderGlow to match dashboard style (no data/func changes) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
        <BorderGlow borderRadius={12} glowIntensity={0.5}>
          <MetricTile label="Employees" value={agg.totalEmp} note="Total roster" tone="teal" icon={<Users size={16} />} />
        </BorderGlow>
        <MetricTile label="Cleared" value={agg.cleared} note="Independent" tone="success" icon={<ShieldCheck size={16} />} />
        <MetricTile label="Open Escalations" value={agg.open} note="Active" tone="warning" icon={<AlertTriangle size={16} />} />
        <MetricTile label="CRITICAL" value={agg.critical} note="Urgent" tone="danger" icon={<AlertTriangle size={16} />} />
        <MetricTile label="Apx F Missing" value={agg.apxFMissing} note="Pre-Day1" tone="danger" icon={<FileText size={16} />} />
        <BorderGlow borderRadius={12} glowIntensity={0.5}>
          <MetricTile label="Annual Overdue" value={agg.overdueAnnual} note="Training" tone="warning" icon={<Clock size={16} />} />
        </BorderGlow>
      </div>

      {/* Escalations table — wrapped for new UI */}
      <BorderGlow borderRadius={16} glowIntensity={0.45} className="mb-8">
      <SurfaceCard padding="none" className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[color:var(--ci-border)] flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-bold" style={{ color: 'var(--ci-text-secondary)' }}>
          <AlertTriangle size={14} className="text-[#DC2626]" /> Active escalations
        </div>
        <div className="max-h-[40vh] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] text-white/40 uppercase tracking-[0.18em]">
              <tr>
                {['Severity', 'Employee', 'Type', 'Policy', 'Action required', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-2 text-left font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {escalations.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-white/30">No escalations — all employees in good standing.</td></tr>
              )}
              {escalations.map(e => {
                const emp = employees.find(x => x.id === e.employeeId);
                return (
                  <tr key={e.id} className="border-t border-white/5">
                    <td className="px-4 py-2">
                      <span className={`font-bold ${e.severity === 'CRITICAL' ? 'text-[#DC2626]' : e.severity === 'WARN' ? 'text-[#ff8e52]' : 'text-[#FFC107]'}`}>
                        {e.severity}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-white/80">{emp?.name ?? e.employeeId}</td>
                    <td className="px-4 py-2 text-white/70">{e.type}</td>
                    <td className="px-4 py-2 text-white/50">{e.policyRef}</td>
                    <td className="px-4 py-2 text-white/70">{humanEscalation(e)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        e.status === 'Open' ? 'bg-[#DC2626]/20 text-[#DC2626]' :
                        e.status === 'Acknowledged' ? 'bg-[#FFC107]/20 text-[#FFC107]' :
                        'bg-[#34D399]/20 text-[#34D399]'
                      }`}>{e.status}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {e.status === 'Open' && (
                        <button onClick={() => ack(e.id, 'Admin')} className="mr-1 text-[10px] text-[#FFC107] hover:text-white">Ack</button>
                      )}
                      {e.status !== 'Resolved' && (
                        <button onClick={() => resolve(e.id, 'Admin')} className="text-[10px] text-[#34D399] hover:text-white">Resolve</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
      </BorderGlow>

      {/* Survey Evidence Map — use SurfaceCard + BorderGlow */}
      <BorderGlow borderRadius={16} glowIntensity={0.45}>
      <SurfaceCard padding="lg">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--ci-text-secondary)' }}>
          <FileSearch size={14} className="text-[#FFC107]" /> Audit-defensible evidence map (HR-TA-001 §8.2)
        </div>
        <table className="w-full text-xs">
          <thead className="text-[10px] text-white/40 uppercase tracking-widest">
            <tr>
              {['Surveyor Action', 'What they look for', 'Your evidence', 'Count'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-white/70">
            {EVIDENCE_MAP.map((r, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="px-3 py-2 text-white/80 font-medium">{r.action}</td>
                <td className="px-3 py-2">{r.lookFor}</td>
                <td className="px-3 py-2 text-[#FFC107]">{r.evidence}</td>
                <td className="px-3 py-2 text-right">
                  {evidence.filter(e => r.appendices.includes(e.appendix)).length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-[10px] text-white/35 mt-3 flex items-center gap-1">
          <ChevronRight size={12} /> Each evidence row traces to a signed appendix with timestamps in the audit log.
        </div>
      </SurfaceCard>
      </BorderGlow>
    </div>
  );
}

const EVIDENCE_MAP: { action: string; lookFor: string; evidence: string; appendices: string[] }[] = [
  { action: 'Personnel file pull',      lookFor: 'Pre-employment screening complete before start date', evidence: 'Appendix F (HR-TA-001) signed by HR Director before Day 1', appendices: ['F'] },
  { action: 'Verify OIG/SAM exclusion', lookFor: 'No excluded individuals employed',                     evidence: 'HR-TA-003 Appendix A (pre-hire) + monthly logs',              appendices: ['A'] },
  { action: 'License verification',     lookFor: 'License type matches JD',                              evidence: 'HR-TA-004 Appendix B',                                        appendices: ['B'] },
  { action: 'Orientation completion',   lookFor: 'All orientation topics covered',                      evidence: 'HR-TA-005 Appendix A + Appendix B',                            appendices: ['HRTA005_A','HRTA005_B','HRTA005_D'] },
  { action: 'Competency evaluations',   lookFor: 'Initial + annual competency on file',                  evidence: 'HR-TD-003 Appendix A / Appendix D',                           appendices: ['HRTD003_A','HRTD003_D'] },
  { action: 'HHA deep dive',            lookFor: '§484.80 competencies + 14/60-day supervision',          evidence: 'HR-TD-003 Appendix D + Appendix E per cycle',                 appendices: ['HRTD003_D','HRTD003_E'] },
  { action: 'Annual training compliance', lookFor: 'All required topics per year',                         evidence: 'HR-TD-001 Appendix B dashboard',                              appendices: ['HRTD001_B'] },
  { action: 'Drill participation',      lookFor: '2×/year emergency drill AAR',                           evidence: 'HR-TD-005 Appendix B',                                        appendices: ['HRTD005_B'] },
];
