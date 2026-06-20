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
import { BookOpen, GraduationCap, FlaskConical, Play, Clock } from 'lucide-react';
import type { JourneyModule } from '@/policy/journey/types/journey';
import { PageHeader, SurfaceCard, MetricTile, BorderGlow, SpotlightCard } from '@/policy/components/ui';

/* ─── Staging module catalogue ─────────────────────────────────────────── */

/**
 * U-15 — StagingM01 gating (Wave 2).
 *
 * Must mirror the env-gate in `src/App.tsx`. When the env flag is OFF the
 * staging card is filtered out of the catalog so operators never see a
 * link that lands on a 404 (the route is also removed at build time).
 *
 * VITE_STAGING_M01=true → catalog includes STAGING-M01.
 */
const STAGING_M01_ENABLED = import.meta.env.VITE_STAGING_M01 === 'true';

const STAGING_MODULES_ALL = [
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

const STAGING_MODULES = STAGING_MODULES_ALL.filter(m => {
  if (m.id === 'STAGING-M01') return STAGING_M01_ENABLED;
  return true;
});

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
  const evidence = useJourneyStore(s => s.evidence);
  const visits = useJourneyStore(s => s.supervisedVisits);
  const escalations = useJourneyStore(s => s.escalations);
  const recompute = useJourneyStore(s => s.recomputeEscalations);
  const [phase, setPhase] = useState<PhaseId>('PRE_DAY_1');
  const [searchQuery, _setSearchQuery] = useState('');
  const [activeCategory, _setActiveCategory] = useState<'All' | JourneyCategory>('All');

  useEffect(() => { recompute(); }, [recompute]);

  const mods = useMemo(() => modulesForRole(employee.role), [employee.role]);
  const progress = useMemo(() =>
    computeProgress(employee, attempts, visits, openEscalationsCount(escalations, employee.id), evidence),
  [employee, attempts, visits, escalations, evidence]);

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

    let sections = CATEGORY_ORDER
      .map(category => ({ category, modules: grouped.get(category) ?? [] }))
      .filter(section => section.modules.length > 0);

    // Apply search + category filter (premium clean filters from design ref)
    if (searchQuery || activeCategory !== 'All') {
      const q = searchQuery.toLowerCase().trim();
      sections = sections
        .map(sec => ({
          category: sec.category,
          modules: sec.modules.filter(m => {
            const matchesSearch = !q || 
              m.id.toLowerCase().includes(q) || 
              m.title.toLowerCase().includes(q) ||
              m.policyRefs.some(r => r.toLowerCase().includes(q));
            const matchesCategory = activeCategory === 'All' || sec.category === activeCategory;
            return matchesSearch && matchesCategory;
          })
        }))
        .filter(sec => sec.modules.length > 0);
    }

    return sections;
  }, [phaseModules, searchQuery, activeCategory]);

  const clearGate = canClearForIndependentWork(employee, attempts, visits);

  return (
    <div className="h-full w-full flex flex-col p-4 md:p-6 lg:p-8 font-sans animate-in fade-in duration-500 overflow-y-auto custom-scrollbar">
      {/* Premium clean header using ui/ PageHeader for corporate hierarchy */}
      <PageHeader
        eyebrow="ONBOARDING & COMPETENCY · JOURNEY"
        title={
          <span className="flex items-center gap-3">
            {employee.name}
            <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold tracking-widest" 
                  style={{ background: 'rgba(0, 209, 193, 0.12)', color: 'var(--v3-teal-light)', fontSize: '11px' }}>
              {employee.role}
            </span>
          </span>
        }
        description={
          <>
            Start: {employee.startDate ?? '—'} ·{' '}
            <span className={progress.clearedForIndependentWork ? 'text-[#34D399]' : 'text-[#E07B2C]'}>
              {progress.clearedForIndependentWork ? 'CLEARED for independent practice' : 'In Onboarding'}
            </span>
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <EmployeePicker />
            <button 
              onClick={() => nav('/journey/guide')}
              className="flex items-center gap-2 rounded-full border border-[var(--v3-border-subtle)] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--v3-text-secondary)] hover:text-[var(--v3-text-primary)] hover:bg-white/5 transition"
            >
              <BookOpen size={15} /> User Guide
            </button>
          </div>
        }
      />

      {/* Adopt dashboard style: MetricTiles + BorderGlow for key journey progress (no logic/func/data changes) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
        <BorderGlow borderRadius={14} glowIntensity={0.55}>
          <MetricTile label="GAO Progress" value={`${Math.round(progress.gaoCompletePct * 100)}%`} note="Core orientation" tone="teal" />
        </BorderGlow>
        <MetricTile label="Role Progress" value={`${Math.round(progress.roleCompletePct * 100)}%`} note="Discipline specific" tone="orange" />
        <MetricTile label="Appendix F" value={employee.appendixFCleared ? 'CLEARED' : 'PENDING'} note="Pre-Day-1 gate" tone={employee.appendixFCleared ? 'success' : 'danger'} />
        <SpotlightCard variant="border-glow" className="rounded-2xl">
          <MetricTile label="Cleared Status" value={progress.clearedForIndependentWork ? 'YES' : 'NO'} note="Independent work" tone={progress.clearedForIndependentWork ? 'success' : 'warning'} />
        </SpotlightCard>
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

      {/* Staging - clean premium card from reference design visual language */}
      {STAGING_MODULES.length > 0 && (
        <SurfaceCard padding="lg" className="mb-6 border border-amber-500/20 bg-[rgba(12,8,3,0.6)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30">
                <FlaskConical size={16} className="text-amber-400" />
              </div>
              <div>
                <div className="font-montserrat text-[10px] font-bold uppercase tracking-[0.24em] text-amber-400">STAGING PREVIEW</div>
                <div className="text-sm text-white/90">Cinematic prototype modules — active development</div>
              </div>
            </div>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-400">Preview</span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {STAGING_MODULES.map(m => (
              <div key={m.id} onClick={() => nav(m.path)} className="group cursor-pointer rounded-xl border border-white/10 bg-black/20 p-5 transition hover:border-amber-500/40">
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="rounded bg-[#C74601]/15 px-2 py-px font-bold text-[#C74601] tracking-[0.2em]">{m.tag}</span>
                      <span className="text-white/40"><Clock size={10} /> {m.duration}</span>
                    </div>
                    <div className="mt-1.5 text-lg font-semibold leading-tight text-white">{m.title}</div>
                    <div className="text-xs text-[#E07B2C]">{m.subtitle}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); nav(m.path); }} className="mt-1 flex h-9 items-center gap-1.5 rounded-full bg-[#C74601] px-5 text-xs font-bold uppercase tracking-widest text-white hover:brightness-110">
                    <Play size={13} fill="currentColor" /> LAUNCH
                  </button>
                </div>
                <p className="mt-3 line-clamp-2 text-xs text-white/60">{m.description}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      )}

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <PhaseRail progress={progress} active={phase} onSelect={setPhase} />
          <BorderGlow borderRadius={14} glowIntensity={0.4}>
            <SurfaceCard padding="md">
              <div className="space-y-2">
                <div
                  className="flex items-center gap-2 text-[10px] font-montserrat font-bold tracking-[0.22em] uppercase pb-2"
                  style={{ color: '#FFC107', borderBottom: '1px solid rgba(var(--ci-accent-rgb),0.22)' }}
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
            </SurfaceCard>
          </BorderGlow>
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

                  <BorderGlow borderRadius={12} glowIntensity={0.4}>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {section.modules.map(module => <ModuleCard key={module.id} module={module} />)}
                    </div>
                  </BorderGlow>
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
