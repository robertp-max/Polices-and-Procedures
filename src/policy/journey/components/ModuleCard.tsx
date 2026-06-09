import { useNavigate } from 'react-router-dom';
import { Shield, FileText, ClipboardCheck, Fingerprint } from 'lucide-react';
import { StatusChip } from './StatusChip';
import type { ChipKind } from './StatusChip';
import type { JourneyModule, ModuleAttempt } from '@/policy/journey/types/journey';
import { canStartModule, isModulePassed, latestAttempt } from '@/policy/journey/utils/gating';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';
import {
  ACHC_MINIMUM_PASSING_PERCENT,
  CARE_INDEED_PASSING_STANDARD_PERCENT,
  calculateAchcModuleStatus,
  isAchcModuleId,
} from '@/policy/journey/utils/achcTrainingCalculations';

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
  const evidence = useJourneyStore(s => s.evidence);
  const attempt = latestAttempt(attempts, employee.id, module.id);
  const gate = canStartModule(employee, module, attempts);
  const achcStatus = isAchcModuleId(module.id)
    ? calculateAchcModuleStatus({ employee, module, attempts, evidence })
    : null;
  const kind = achcStatus
    ? !gate.unlocked ? 'locked'
      : achcStatus.compliant ? 'passed'
      : achcStatus.pass_fail_status === 'failed' ? 'failed'
      : achcStatus.pass_fail_status === 'passed' ? 'warn'
      : achcStatus.attempt_count > 0 || achcStatus.lesson_progress_percent > 0 ? 'in-progress'
      : 'available'
    : chipFor(module, attempt, gate.unlocked);
  const chipLabel = achcStatus && kind === 'warn' ? 'Evidence Missing' : undefined;

  return (
    <button
      type="button"
      onClick={() => gate.unlocked && nav(`/journey/module/${module.id}`)}
      disabled={!gate.unlocked}
      className={`glass-interactive w-full text-left border border-white/10 rounded-2xl p-5 relative overflow-hidden group transition-all ${
        gate.unlocked ? 'hover:border-ci-gold/30 cursor-pointer' : 'opacity-55 cursor-not-allowed'
      } ${kind === 'passed' ? 'ci-module-edge-done' : kind === 'failed' ? 'ci-module-edge-fail' : 'ci-module-edge-todo'}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="ci-text-eyebrow-strong font-montserrat font-bold ci-text-gold-soft mb-1">{module.id}</div>
          <div className="font-montserrat font-semibold text-white text-sm leading-snug">{module.title}</div>
        </div>
        <StatusChip kind={kind} label={chipLabel} />
      </div>

      {!compact && (
        <div className="space-y-2 ci-text-body-xs ci-text-on-rail-soft">
          <div className="flex items-center gap-1.5">
            <ClipboardCheck size={12} className="opacity-60" aria-hidden="true" />
            <span>{METHOD_LABEL[module.method] ?? module.method}</span>
            {module.passThreshold === 1 && <span className="ci-text-danger font-bold">· 100% required</span>}
          </div>
          {module.policyRefs.length > 0 && (
            <div className="flex items-start gap-1.5">
              <FileText size={12} className="opacity-60 mt-0.5" aria-hidden="true" />
              <span className="truncate">{module.policyRefs.slice(0, 3).join(' · ')}</span>
            </div>
          )}
          {module.cmsRefs.length > 0 && (
            <div className="flex items-start gap-1.5">
              <Shield size={12} className="opacity-60 mt-0.5" aria-hidden="true" />
              <span>{module.cmsRefs.join(' · ')}</span>
            </div>
          )}
          {module.supervisorSignature && (
            <div className="flex items-center gap-1.5 ci-text-gold">
              <Fingerprint size={12} aria-hidden="true" />
              <span>Supervisor signature required</span>
            </div>
          )}
          {achcStatus && (
            <div className="space-y-1 border-t ci-border-overlay pt-2">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <span>ACHC minimum: {ACHC_MINIMUM_PASSING_PERCENT}%</span>
                <span>Care Indeed passing standard: {CARE_INDEED_PASSING_STANDARD_PERCENT}%</span>
              </div>
              <div>
                Lessons {achcStatus.lesson_progress_percent}% · Attempts {achcStatus.attempt_count} · Best score {achcStatus.best_attempt_score ?? '—'}%
              </div>
              <div className={achcStatus.compliant ? 'ci-text-success' : 'ci-text-gold'}>
                {achcStatus.compliant ? 'Certificate and post-test evidence attached' : 'Completion requires passed post-test, certificate, post-test artifact, personnel-file evidence, and next annual due date.'}
              </div>
            </div>
          )}
        </div>
      )}

      {attempt && attempt.scoreRaw != null && (
        <div className="mt-3 ci-text-body-xs ci-text-on-rail-mute">
          Attempt #{attempt.attemptNumber} · Score {attempt.scoreRaw}
        </div>
      )}

      {!gate.unlocked && (
        <div className="mt-3 ci-text-body-xs ci-text-on-rail-soft italic border-t border-white/5 pt-2">{gate.reason}</div>
      )}
    </button>
  );
}
