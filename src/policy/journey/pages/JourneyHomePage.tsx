import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';
import { modulesForRole } from '@/policy/journey/data/modules';
import { computeProgress, canClearForIndependentWork } from '@/policy/journey/utils/gating';
import { openEscalationsCount } from '@/policy/journey/utils/escalation';
import { PhaseRail } from '@/policy/journey/components/PhaseRail';
import { ModuleCard } from '@/policy/journey/components/ModuleCard';
import { GateBanner } from '@/policy/journey/components/GateBanner';
import { EmployeePicker } from '@/policy/journey/components/EmployeePicker';
import { BookOpen, GraduationCap } from 'lucide-react';
import type { JourneyModule } from '@/policy/journey/types/journey';

type PhaseId = 'PRE_DAY_1' | 'GAO' | 'ROLE' | 'SUPERVISED' | 'CLEARED' | 'ANN' | 'DRILL';
type JourneyCategory =
  | 'Core Compliance'
  | 'Clinical Care'
  | 'QAPI and Performance'
  | 'Safety and OSHA'
  | 'Workforce Health'
  | 'Workflow Execution';

const CATEGORY_ORDER: JourneyCategory[] = [
  'Core Compliance',
  'Clinical Care',
  'QAPI and Performance',
  'Safety and OSHA',
  'Workforce Health',
  'Workflow Execution',
];

function classifyJourneyCategory(module: JourneyModule): JourneyCategory {
  const text = `${module.id} ${module.title}`.toLowerCase();

  if (/qapi|root cause|rca|survey|audit|metrics|performance improvement|pip/.test(text)) {
    return 'QAPI and Performance';
  }

  if (/safety|violence|bloodborne|atd|ppe|hazard|ergonomic|heat illness|injury|infection|pathogen/.test(text)) {
    return 'Safety and OSHA';
  }

  if (/tb |occupational health|post-exposure|fit-for-duty|vaccination/.test(text)) {
    return 'Workforce Health';
  }

  if (/workflow|task execution|evidence|logging|policy acknowledgment|event-based|acceptable use|phishing/.test(text)) {
    return 'Workflow Execution';
  }

  if (/hipaa|privacy|security|compliance|fraud|ethics|retaliation|breach|minimum necessary|business associate|vendor|ai /.test(text)) {
    return 'Core Compliance';
  }

  return 'Clinical Care';
}

export function JourneyHomePage() {
  const nav = useNavigate();
  const employee = useJourneyStore(s => s.employees.find(e => e.id === s.currentEmployeeId)!);
  const attempts = useJourneyStore(s => s.attempts);
  const visits = useJourneyStore(s => s.supervisedVisits);
  const escalations = useJourneyStore(s => s.escalations);
  const recompute = useJourneyStore(s => s.recomputeEscalations);
  const [phase, setPhase] = useState<PhaseId>('PRE_DAY_1');

  useEffect(() => { recompute(); }, [recompute]);

  const mods = useMemo(() => modulesForRole(employee.role), [employee.role]);
  const progress = useMemo(() =>
    computeProgress(employee, attempts, visits, openEscalationsCount(escalations, employee.id)),
  [employee, attempts, visits, escalations]);

  useEffect(() => {
    if (!employee.appendixFCleared) { setPhase('PRE_DAY_1'); return; }
    if (progress.gaoCompletePct < 1 || !progress.gaoExamPassed) { setPhase('GAO'); return; }
    if (progress.roleCompletePct < 1) { setPhase('ROLE'); return; }
    if (progress.supervisedVisitsCompleted < progress.supervisedVisitsRequired) { setPhase('SUPERVISED'); return; }
    if (progress.eligibleForClearance && !progress.clearedForIndependentWork) { setPhase('CLEARED'); return; }
    if (!progress.clearedForIndependentWork) { setPhase('ROLE'); return; }
    setPhase('ANN');
  }, [employee.appendixFCleared, progress.gaoCompletePct, progress.gaoExamPassed, progress.roleCompletePct, progress.supervisedVisitsCompleted, progress.supervisedVisitsRequired, progress.clearedForIndependentWork, progress.eligibleForClearance]);

  const phaseModules = useMemo(() => {
    switch (phase) {
      case 'PRE_DAY_1':  return [];
      case 'GAO':        return mods.filter(m => m.group === 'GAO');
      case 'ROLE':       return mods.filter(m => m.group === 'ROLE' && m.phase === 'ROLE');
      case 'SUPERVISED': return mods.filter(m => m.phase === 'SUPERVISED');
      case 'CLEARED':    return [];
      case 'ANN':        return mods.filter(m => m.group === 'ANN');
      case 'DRILL':      return mods.filter(m => m.group === 'DRILL');
      default:           return [];
    }
  }, [mods, phase]);

  const categorizedPhaseModules = useMemo(() => {
    const grouped = new Map<JourneyCategory, JourneyModule[]>();
    for (const category of CATEGORY_ORDER) {
      grouped.set(category, []);
    }

    phaseModules.forEach(module => {
      const category = classifyJourneyCategory(module);
      const bucket = grouped.get(category);
      if (bucket) {
        bucket.push(module);
      }
    });

    return CATEGORY_ORDER
      .map(category => ({ category, modules: grouped.get(category) ?? [] }))
      .filter(section => section.modules.length > 0);
  }, [phaseModules]);

  const clearGate = canClearForIndependentWork(employee, attempts, visits);

  return (
    <div className="h-full w-full flex flex-col p-6 md:p-10 font-sans animate-in fade-in duration-500 overflow-y-auto custom-scrollbar">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.28em] mb-2">Journey Dashboard</div>
          <h1 className="font-outfit font-light text-white leading-tight" style={{ fontSize: 28, letterSpacing: '-0.01em' }}>
            {employee.name}
          </h1>
          <div className="mt-1 text-[12px] text-white/55 font-roboto">
            Role: <span className="text-white/85">{employee.role}</span> ·
            Start Date: <span className="text-white/85">{employee.startDate ?? '—'}</span> ·
            Status: <span className={progress.clearedForIndependentWork ? 'text-[#34D399]' : 'text-[#FFC107]'}>
              {progress.clearedForIndependentWork ? 'CLEARED for independent practice' : 'In Onboarding'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EmployeePicker />
          <button onClick={() => nav('/journey/guide')}
            className="glass-interactive flex items-center gap-2 border border-white/10 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white">
            <BookOpen size={14} /> User Guide
          </button>
        </div>
      </div>

      {/* Hard-stop banner — Appendix F */}
      {!employee.appendixFCleared && (
        <GateBanner
          tone="critical"
          title="Pre-Day-1 screening (Appendix F) is incomplete."
          body="No individual performs ANY work — including orientation — until Appendix F is fully PASS/NA and signed by the HR Director (HR-TA-001 §4.3). Complete the checklist to unlock orientation."
          cta={{ label: 'Open Appendix F', onClick: () => nav('/journey/appendix-f') }}
        />
      )}

      {employee.appendixFCleared && !progress.clearedForIndependentWork && clearGate.gaps.length > 0 && (
        <GateBanner
          tone="warn"
          title={`Clearance pending — ${clearGate.gaps.length} requirement(s) outstanding.`}
          body={clearGate.gaps.join(' ')}
        />
      )}

      {employee.appendixFCleared && !progress.clearedForIndependentWork && clearGate.gaps.length === 0 && (
        <GateBanner
          tone="warn"
          title="All prerequisites met — awaiting DON clearance signature."
          body="HR-TA-005 Appendix B must be signed SATISFACTORY by the DON before this employee can perform independent visits."
          cta={{ label: 'Supervisor Sign-off', onClick: () => nav('/journey/supervisor') }}
        />
      )}

      {progress.clearedForIndependentWork && (
        <GateBanner
          tone="ok"
          title="Cleared for independent practice."
          body="DON has signed HR-TA-005 Appendix B = SATISFACTORY. Continue with annual training cadence and supervised-visit cycles as required by policy."
        />
      )}

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <PhaseRail progress={progress} active={phase} onSelect={setPhase} />
          <div className="space-y-2">
            <div
              className="flex items-center gap-2 text-[10px] font-montserrat font-bold tracking-[0.22em] uppercase text-[#FFC107] pb-2"
              style={{ borderBottom: '1px solid rgba(var(--ci-accent-rgb),0.22)' }}
            >
              <GraduationCap size={14} strokeWidth={1.75} /> Competency snapshot
            </div>
            <MiniStat label="GAO modules"     value={`${Math.round(progress.gaoCompletePct * 100)}%`} />
            <MiniStat label="GAO-EXAM"        value={progress.gaoExamPassed ? 'PASS' : '—'} emph={progress.gaoExamPassed} />
            <MiniStat label="Role modules"    value={`${Math.round(progress.roleCompletePct * 100)}%`} />
            <MiniStat label="Supervised"      value={`${progress.supervisedVisitsCompleted}/${progress.supervisedVisitsRequired}`} />
            <MiniStat label="Annual training" value={`${Math.round(progress.annualCompletePct * 100)}%`} />
            <MiniStat label="Escalations"     value={String(progress.openEscalations)} warn={progress.openEscalations > 0} />
          </div>
        </aside>

        <section className="col-span-12 lg:col-span-9">
          {phase === 'PRE_DAY_1' && (
            <div className="py-14 text-center">
              <div className="text-[13px] text-white/65 font-roboto max-w-xl mx-auto leading-relaxed">
                Pre-Day-1 is enforced via Appendix F — Pre-Employment Screening Checklist.
                All 15 items must be PASS or N/A and signed by the HR Director before any module unlocks.
              </div>
              <button onClick={() => nav('/journey/appendix-f')}
                className="mt-6 gradient-gold rounded-lg px-6 py-2.5 text-[11px] font-montserrat font-bold uppercase tracking-[0.22em]">
                Open Appendix F
              </button>
            </div>
          )}

          {phase === 'CLEARED' && (
            <div className="py-14 text-center">
              <div className="font-outfit font-light text-white mb-3" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>Ready for final clearance review</div>
              <div className="text-[13px] text-white/65 font-roboto max-w-xl mx-auto mb-6 leading-relaxed">
                All modules, the GAO-EXAM, and minimum supervised visits are complete. The DON must sign
                HR-TA-005 Appendix B = SATISFACTORY to release the employee for independent practice.
              </div>
              <button onClick={() => nav('/journey/supervisor')}
                className="gradient-gold rounded-lg px-6 py-2.5 text-[11px] font-montserrat font-bold uppercase tracking-[0.22em]">
                Go to Supervisor Sign-off
              </button>
            </div>
          )}

          {phase !== 'PRE_DAY_1' && phase !== 'CLEARED' && (
            <div className="space-y-8">
              {categorizedPhaseModules.map(section => (
                <div key={section.category}>
                  <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="font-montserrat text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFC107]">
                      {section.category}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                      {section.modules.length} module(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {section.modules.map(module => <ModuleCard key={module.id} module={module} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MiniStat({ label, value, emph, warn }: { label: string; value: string; emph?: boolean; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[11px] py-1.5 border-b border-white/5 last:border-b-0">
      <span className="text-white/50 uppercase tracking-wider font-bold">{label}</span>
      <span className={warn ? 'text-[#DC2626] font-bold' : emph ? 'text-[#34D399] font-bold' : 'text-white'}>{value}</span>
    </div>
  );
}
