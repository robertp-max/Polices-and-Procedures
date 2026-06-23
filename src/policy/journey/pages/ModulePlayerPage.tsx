import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, Timer } from 'lucide-react';
import { moduleById } from '@/policy/journey/data/modules';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';
import { canStartModule, latestAttempt } from '@/policy/journey/utils/gating';
import { ScormPlayer } from '@/policy/journey/components/ScormPlayer';
import { EvidenceCapture } from '@/policy/journey/components/EvidenceCapture';
import { StatusChip } from '@/policy/journey/components/StatusChip';

const NON_SCORM_METHODS = new Set([
  'ReturnDemo', 'SkillsCheckoff', 'CaseStudy', 'Scenario',
  'RecordReview', 'Tabletop', 'Observation', 'MockSurvey', 'SupervisedVisit',
]);

export function ModulePlayerPage() {
  const { moduleId } = useParams();
  const nav = useNavigate();
  const module = moduleId ? moduleById(moduleId) : undefined;
  const employee = useJourneyStore(s => s.employees.find(e => e.id === s.currentEmployeeId)!);
  const attempts = useJourneyStore(s => s.attempts);
  const start = useJourneyStore(s => s.startAttempt);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [result, setResult] = useState<'passed' | 'failed' | null>(null);

  useEffect(() => {
    if (!module) return;
    const gate = canStartModule(employee, module, attempts);
    if (!gate.unlocked) return;
    const a = start(employee.id, module.id);
    setAttemptId(a.id);
  }, [module?.id, employee.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!module) {
    return <div className="p-10 text-white">Module not found.</div>;
  }
  const gate = canStartModule(employee, module, attempts);

  if (!gate.unlocked) {
    return (
      <div className="p-10">
        <button onClick={() => nav('/journey')} className="glass-interactive flex items-center gap-2 border border-white/10 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white mb-4">
          <ArrowLeft size={14} /> Back to Journey
        </button>
        <div className="max-w-2xl border border-[#DC2626]/40 rounded-2xl p-6 bg-[#DC2626]/5">
          <div className="text-xs font-bold tracking-widest uppercase text-[#DC2626] mb-2">Module Locked</div>
          <h1 className="text-xl font-bold text-white mb-2">{module.id} · {module.title}</h1>
          <div className="text-sm text-white/70 font-light">{gate.reason}</div>
          {gate.blockedBy && (
            <div className="mt-3 text-xs text-white/50">Blocked by: {gate.blockedBy.join(', ')}</div>
          )}
        </div>
      </div>
    );
  }

  const attempt = attemptId ? attempts.find(a => a.id === attemptId) ?? latestAttempt(attempts, employee.id, module.id) : latestAttempt(attempts, employee.id, module.id);

  const useEvidenceCapture =
    NON_SCORM_METHODS.has(module.method) || module.supervisorSignature;

  return (
    <div className="h-full flex flex-col">
      {/* Premium clean header using ui components */}
      <div className="shrink-0 border-b border-[var(--v3-border-subtle)] bg-[color-mix(in_srgb,var(--v3-glass-card)_50%,transparent)] px-6 md:px-8 pt-5 pb-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <button onClick={() => nav('/journey')} className="flex items-center gap-2 rounded-full border border-[var(--v3-border-subtle)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[var(--v3-text-secondary)] hover:text-white">
            <ArrowLeft size={14} /> Back to Journey
          </button>
          {attempt && <StatusChip kind={attempt.status === 'completed' ? 'passed' : attempt.status === 'failed' ? 'failed' : 'in-progress'} />}
        </div>
        <div>
          <div className="font-montserrat text-[10px] tracking-[0.25em] text-[#E07B2C]">{module.id}</div>
          <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">{module.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/60">
            {module.policyRefs.length > 0 && <span className="flex items-center gap-1"><FileText size={13} /> {module.policyRefs.join(' · ')}</span>}
            {module.cmsRefs.length > 0 && <span className="flex items-center gap-1"><Shield size={13} /> {module.cmsRefs.join(' · ')}</span>}
            {module.durationMinutes && <span className="flex items-center gap-1"><Timer size={13} /> {module.durationMinutes} min</span>}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {!attempt ? (
          <div className="p-10 text-sm text-white/60">Preparing attempt…</div>
        ) : result ? (
          <div className="p-10 flex flex-col items-center gap-4 text-center">
            <div className={`text-3xl font-montserrat font-bold ${result === 'passed' ? 'text-[#34D399]' : 'text-[#DC2626]'}`}>
              {result === 'passed' ? 'COMPLETED' : 'FAILED'}
            </div>
            <div className="text-sm text-white/60 font-light max-w-md">
              {result === 'passed'
                ? 'Evidence recorded. Continue to the next module or return to the journey dashboard.'
                : 'A remediation plan (HR-TD-003 Appendix C) will open within 7 days. You may retake this module after remediation.'}
            </div>
            <button onClick={() => nav('/journey')} className="gradient-gold rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-widest">
              Return to Journey
            </button>
          </div>
        ) : useEvidenceCapture ? (
          <EvidenceCapture module={module} employeeId={employee.id} onDone={p => setResult(p ? 'passed' : 'failed')} />
        ) : (
          <ScormPlayer
            module={module}
            employeeId={employee.id}
            attempt={attempt}
            onExit={p => setResult(p ? 'passed' : 'failed')}
          />
        )}
      </div>
    </div>
  );
}
