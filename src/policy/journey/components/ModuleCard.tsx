import { useNavigate } from 'react-router-dom';
import { Shield, FileText, ClipboardCheck, Fingerprint } from 'lucide-react';
import { StatusChip } from './StatusChip';
import type { ChipKind } from './StatusChip';
import type { JourneyModule, ModuleAttempt } from '@/policy/journey/types/journey';
import { canStartModule, isModulePassed, latestAttempt } from '@/policy/journey/utils/gating';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';

interface Props {
  module: JourneyModule;
  compact?: boolean;
}

function chipFor(module: JourneyModule, attempt: ModuleAttempt | undefined, unlocked: boolean): ChipKind {
  if (!unlocked) return 'locked';
  if (!attempt) return 'available';
  if (attempt.status === 'completed' || isModulePassed(module, attempt)) return 'passed';
  if (attempt.status === 'failed') return 'failed';
  if (attempt.status === 'in-progress') return 'in-progress';
  return 'available';
}

const METHOD_LABEL: Record<string, string> = {
  Quiz: 'Quiz · 80% pass',
  CodingExercise: 'Coding Exercise · 80%',
  CaseStudy: 'Case Study',
  Scenario: 'Scenario',
  ReturnDemo: 'Return Demonstration',
  SkillsCheckoff: 'Skills Check-off',
  RecordReview: 'Record Review',
  Tabletop: 'Tabletop Drill',
  PhishingSim: 'Phishing Simulation',
  Observation: 'Observation',
  MockSurvey: 'Mock Survey',
  SupervisedVisit: 'Supervised Visit',
  None: 'Acknowledge & Attest',
};

export function ModuleCard({ module, compact }: Props) {
  const nav = useNavigate();
  const employee = useJourneyStore(s => s.employees.find(e => e.id === s.currentEmployeeId)!);
  const attempts = useJourneyStore(s => s.attempts);
  const attempt = latestAttempt(attempts, employee.id, module.id);
  const gate = canStartModule(employee, module, attempts);
  const kind = chipFor(module, attempt, gate.unlocked);

  return (
    <button
      onClick={() => gate.unlocked && nav(`/journey/module/${module.id}`)}
      disabled={!gate.unlocked}
      className={`glass-interactive w-full text-left border border-white/10 rounded-2xl p-5 relative overflow-hidden group transition-all ${
        gate.unlocked ? 'hover:border-[#FFC107]/30 cursor-pointer' : 'opacity-55 cursor-not-allowed'
      }`}
      style={{ borderLeftWidth: 3, borderLeftColor: kind === 'passed' ? '#34D399' : kind === 'failed' ? '#DC2626' : '#FFC10755' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[10px] font-montserrat font-bold tracking-[0.25em] text-[#FFC107]/90 mb-1">{module.id}</div>
          <div className="font-montserrat font-semibold text-white text-sm leading-snug">{module.title}</div>
        </div>
        <StatusChip kind={kind} />
      </div>

      {!compact && (
        <div className="space-y-2 text-[11px] text-white/55">
          <div className="flex items-center gap-1.5">
            <ClipboardCheck size={12} className="opacity-60" />
            <span>{METHOD_LABEL[module.method] ?? module.method}</span>
            {module.passThreshold === 1 && <span className="text-[#DC2626] font-bold">· 100% required</span>}
          </div>
          {module.policyRefs.length > 0 && (
            <div className="flex items-start gap-1.5">
              <FileText size={12} className="opacity-60 mt-0.5" />
              <span className="truncate">{module.policyRefs.slice(0, 3).join(' · ')}</span>
            </div>
          )}
          {module.cmsRefs.length > 0 && (
            <div className="flex items-start gap-1.5">
              <Shield size={12} className="opacity-60 mt-0.5" />
              <span>{module.cmsRefs.join(' · ')}</span>
            </div>
          )}
          {module.supervisorSignature && (
            <div className="flex items-center gap-1.5 text-[#FFC107]">
              <Fingerprint size={12} />
              <span>Supervisor signature required</span>
            </div>
          )}
        </div>
      )}

      {attempt && attempt.scoreRaw != null && (
        <div className="mt-3 text-[10px] text-white/40">
          Attempt #{attempt.attemptNumber} · Score {attempt.scoreRaw}
        </div>
      )}

      {!gate.unlocked && (
        <div className="mt-3 text-[10px] text-white/50 italic border-t border-white/5 pt-2">{gate.reason}</div>
      )}
    </button>
  );
}
