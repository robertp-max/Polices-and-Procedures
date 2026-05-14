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
import { BookOpen, GraduationCap, FlaskConical, Play, Clock, ChevronRight } from 'lucide-react';
import type { JourneyModule } from '@/policy/journey/types/journey';

/* ─── Staging module catalogue ─────────────────────────────────────────── */
const STAGING_MODULES = [
  {
    id: 'STAGING-M01',
    title: "Marites' Journey",
    subtitle: 'Cultural Awareness & CLAS Standards',
    tag: 'ACHC-ART-M01',
    duration: '35–40 min',
    path: '/journey/staging/m01',
    description:
      'A cinematic, scenario-based module following Marites — a newly immigrated Filipina nurse — as she navigates cultural awareness, language access, implicit bias, and ACHC CLAS Standards in home health care.',
    acts: ['Act 1 · Philippines origins & arrival', 'Act 2 · Conflict & operational consequences', 'Act 3 · Adaptation & professional success'],
    structure: ['Pre-Assessment Hook (3Q)', '17 narrative content slides', '6 story challenges + debriefs', 'Final Assessment (5Q)', 'Summary & Certificate'],
  },
];

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

      {/* ── STAGING CATEGORY ──────────────────────────────────────────────── */}
      <section className="mb-8 rounded-2xl overflow-hidden border border-amber-500/15 bg-gradient-to-br from-amber-950/30 via-black/0 to-transparent">
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-500/15 border border-amber-500/30">
              <FlaskConical size={15} className="text-amber-400" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-montserrat text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">Staging</h3>
              <p className="text-[10px] text-white/40 font-roboto">Prototype cinematic modules — in active development</p>
            </div>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Preview
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
          {STAGING_MODULES.map(m => (
            <div key={m.id} className="group relative flex flex-col gap-4 p-6 rounded-xl bg-white/[0.03] border border-white/8 hover:border-amber-500/30 hover:bg-amber-950/20 transition-all duration-300">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.25em] px-2 py-0.5 rounded-full bg-[#C74601]/15 text-[#C74601] border border-[#C74601]/25">
                      {m.tag}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-white/30 font-bold uppercase tracking-widest">
                      <Clock size={9} /> {m.duration}
                    </span>
                  </div>
                  <h4 className="font-outfit font-light text-white text-xl leading-tight" style={{ letterSpacing: '-0.01em' }}>
                    {m.title}
                  </h4>
                  <p className="text-[11px] text-[#C74601] font-medium mt-0.5">{m.subtitle}</p>
                </div>
                <button
                  onClick={() => nav(m.path)}
                  className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold text-[11px] uppercase tracking-widest transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{ background: '#C74601', boxShadow: '0 0 20px rgba(199,70,1,0.35)' }}
                >
                  <Play size={12} fill="currentColor" /> Launch
                </button>
              </div>

              {/* Description */}
              <p className="text-[11px] text-white/50 font-roboto leading-relaxed">{m.description}</p>

              {/* Story acts */}
              <div className="flex flex-col gap-1">
                {m.acts.map((act, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-white/35">
                    <div className="w-1 h-1 rounded-full bg-[#C74601]/50 flex-shrink-0" />
                    {act}
                  </div>
                ))}
              </div>

              {/* Structure pills */}
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
                {m.structure.map((item, i) => (
                  <span key={i} className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-white/[0.04] text-white/30 border border-white/6">
                    {item}
                  </span>
                ))}
              </div>

              <button
                onClick={() => nav(m.path)}
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                aria-label={`Launch ${m.title}`}
              >
                <ChevronRight size={32} className="text-white/10" />
              </button>
            </div>
          ))}
        </div>
      </section>

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
