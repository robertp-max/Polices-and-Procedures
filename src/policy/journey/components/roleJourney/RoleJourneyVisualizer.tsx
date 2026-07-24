import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Cross,
  Eye,
  FileText,
  GraduationCap,
  Hand,
  Handshake,
  HeartHandshake,
  HeartPulse,
  Lock,
  MessageCircle,
  PersonStanding,
  Repeat,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  ANNUAL_TRAINING,
  COMPLETION_GATES,
  ESCALATION_MATRIX,
  EVIDENCE_MAP,
  GAO_MODULES,
  ONGOING_MONITORING,
  PRE_HIRE_STEPS,
  ROLES,
  SUPERVISION_SCHEDULE,
  type CompetencyKind,
  type RoleDef,
  type RoleModuleRow,
} from '../../data/roleJourneyData';

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// View models
// ---------------------------------------------------------------------------

type ViewMode = 'learner' | 'manager';
type PhaseKey = 'phase0' | 'phase1' | 'phase2' | 'phase3';
type PhaseStatus = 'complete' | 'active' | 'locked';

interface PhaseVM {
  key: PhaseKey;
  eyebrow: string;
  title: string;
  timeframe: string;
  icon: LucideIcon;
  status: PhaseStatus;
  percent: number;
  progressLabel: string;
}

const ROLE_ICONS: Record<string, LucideIcon> = {
  'JD-001': Briefcase,
  'JD-002': Stethoscope,
  'JD-003': HeartPulse,
  'JD-004': Cross,
  'JD-005': Activity,
  'JD-006': PersonStanding,
  'JD-007': Hand,
  'JD-008': Handshake,
  'JD-009': MessageCircle,
  'JD-010': Users,
  'JD-011': HeartHandshake,
};

// Mock learner progress state: Phase 0 complete, Phase 1 in progress,
// Phases 2 and 3 locked behind the GAO completion gate.
const GAO_DONE_COUNT = 18;
const MOCK_LEARNER = { name: 'Jordan Reyes', day: 7 };

const COMPETENCY_CHIP: Record<CompetencyKind, string> = {
  quiz: 'bg-[#FFF0E5] text-[#D1571A] border-[#fbd3b7]',
  'return-demo': 'bg-[#E5F4EE] text-[#008540] border-[#b4e6d3]',
  'skills-checkoff': 'bg-[#E5F4EE] text-[#008540] border-[#b4e6d3]',
  'case-study': 'bg-[#E5FEFF] text-[#007970] border-[#b2f5f7]',
  scenario: 'bg-[#E5FEFF] text-[#007970] border-[#b2f5f7]',
  exercise: 'bg-[#E5FEFF] text-[#007970] border-[#b2f5f7]',
  observation: 'bg-[#E5FEFF] text-[#007970] border-[#b2f5f7]',
  drill: 'bg-[#FFF0E5] text-[#D1571A] border-[#fbd3b7]',
  none: 'bg-[#FAFAF7] text-[#474742] border-[#E5E4E3]',
};

const SEVERITY_CHIP: Record<'critical' | 'escalating' | 'monitor', { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-[#FFF0E5] text-[#D1571A] border-[#fbd3b7]' },
  escalating: { label: 'Escalating', className: 'bg-[#FFF8E9] text-[#B7791F] border-[#F3DFB8]' },
  monitor: { label: 'Monitor', className: 'bg-[#E5FEFF] text-[#007970] border-[#b2f5f7]' },
};

// ---------------------------------------------------------------------------
// Root component
// ---------------------------------------------------------------------------

export function RoleJourneyVisualizer() {
  const [view, setView] = useState<ViewMode>('learner');
  const [activeRoleId, setActiveRoleId] = useState('JD-003'); // default: RN
  const [deepDive, setDeepDive] = useState<PhaseKey | null>(null);
  const evidenceRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Fit the visualizer to the shell viewport so the page never scrolls vertically:
  // measure everything else in the scroll container (tab nav, paddings) and take the rest.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const fit = () => {
      let scroller: HTMLElement | null = el.parentElement;
      while (scroller) {
        const style = window.getComputedStyle(scroller);
        if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && scroller.clientHeight > 0) break;
        scroller = scroller.parentElement;
      }
      const viewport = scroller?.clientHeight ?? window.innerHeight;
      const total = scroller?.scrollHeight ?? document.documentElement.scrollHeight;
      const current = el.getBoundingClientRect().height;
      const overflow = total - viewport;
      if (overflow > 2) el.style.height = `${Math.max(440, current - overflow)}px`;
    };
    fit();
    const settle = window.setTimeout(fit, 350); // re-fit after fonts/entry layout settle
    window.addEventListener('resize', fit);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener('resize', fit);
    };
  }, []);

  const activeRole = useMemo(() => ROLES.find((role) => role.id === activeRoleId) ?? ROLES[0], [activeRoleId]);

  const phases = useMemo<PhaseVM[]>(() => {
    const gaoPct = Math.round((GAO_DONE_COUNT / GAO_MODULES.length) * 100);
    return [
      {
        key: 'phase0',
        eyebrow: 'Phase 0',
        title: 'Universal Pre-Day-1 Clearance',
        timeframe: 'Before start date',
        icon: ShieldCheck,
        status: 'complete',
        percent: 100,
        progressLabel: `${PRE_HIRE_STEPS.length}/${PRE_HIRE_STEPS.length} clearance items`,
      },
      {
        key: 'phase1',
        eyebrow: 'Phase 1',
        title: 'General Agency Orientation',
        timeframe: 'Days 1–5',
        icon: BookOpen,
        status: 'active',
        percent: gaoPct,
        progressLabel: `${GAO_DONE_COUNT}/${GAO_MODULES.length} modules`,
      },
      {
        key: 'phase2',
        eyebrow: 'Phase 2',
        title: `${activeRole.title} Specific Journey`,
        timeframe: 'Days 5–30',
        icon: ROLE_ICONS[activeRole.id] ?? GraduationCap,
        status: 'locked',
        percent: 0,
        progressLabel: activeRole.moduleCountLabel,
      },
      {
        key: 'phase3',
        eyebrow: 'Phase 3',
        title: 'Ongoing Compliance Lifecycle',
        timeframe: 'Annual & monthly',
        icon: Repeat,
        status: 'locked',
        percent: 0,
        progressLabel: `${ANNUAL_TRAINING.length} annual tracks`,
      },
    ];
  }, [activeRole]);

  const overallPercent = useMemo(() => {
    const sum = phases.reduce((total, phase) => total + phase.percent, 0);
    return Math.round(sum / phases.length);
  }, [phases]);

  const quizGateCount = useMemo(
    () => GAO_MODULES.filter((m) => m.hasQuiz).length + activeRole.modules.filter((m) => m.competencyKind === 'quiz').length,
    [activeRole],
  );

  const openEvidenceMap = () => {
    setView('manager');
    // Instant scroll: smooth scrolling is inert on the app shell's scroll container.
    const scrollToEvidence = () => evidenceRef.current?.scrollIntoView({ block: 'start' });
    window.setTimeout(scrollToEvidence, 100);
    window.setTimeout(scrollToEvidence, 700);
  };

  return (
    <div ref={rootRef} className="flex h-[calc(100dvh-160px)] min-h-[440px] w-full flex-col overflow-hidden font-roboto text-[#52404B]">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rjCascade {
          0% { opacity: 0; transform: translateY(26px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes rjModalIn {
          0% { opacity: 0; transform: translateY(18px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rjFadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes rjShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes rjPulseRing {
          0% { box-shadow: 0 0 0 0 rgba(240,105,35,0.35); }
          70% { box-shadow: 0 0 0 12px rgba(240,105,35,0); }
          100% { box-shadow: 0 0 0 0 rgba(240,105,35,0); }
        }
        .rj-cascade { animation: rjCascade 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .rj-modal-in { animation: rjModalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .rj-fade-in { animation: rjFadeIn 0.3s ease both; }
        .rj-carousel { scrollbar-width: none; }
        .rj-carousel::-webkit-scrollbar { display: none; }
        .rj-shimmer {
          background-image: linear-gradient(90deg, #F06923 0%, #F06923 35%, #FFB380 50%, #F06923 65%, #F06923 100%);
          background-size: 200% auto;
          animation: rjShimmer 2.4s linear infinite;
        }
        .rj-pulse-ring { animation: rjPulseRing 2.2s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .rj-cascade, .rj-modal-in, .rj-fade-in, .rj-shimmer, .rj-pulse-ring { animation: none; }
        }
      ` }} />

      {/* HERO — compact single bar */}
      <section className="rj-cascade relative mb-3 shrink-0 overflow-hidden rounded-b-[20px] rounded-tr-[20px] border border-[#E5E4E3] bg-white px-6 py-4 shadow-sm">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <span className="mb-1 block font-montserrat text-[9px] font-bold uppercase tracking-widest text-[#C2410C]">
              42 CFR Part 484 • CMS CoP Aligned • Survey-Ready
            </span>
            <h1 className="truncate font-montserrat text-lg font-bold leading-tight tracking-tight text-[#007970] md:text-2xl">
              Role-Based Onboarding &amp; Competency Journey
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 xl:flex">
              <HeroPill value={`${GAO_MODULES.length} + ${activeRole.modules.length}`} label={`GAO + ${activeRole.short} modules`} />
              <HeroPill value={String(quizGateCount)} label="quiz gates (80%)" />
              <HeroPill value="30 days" label="to independence" />
            </div>
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>
      </section>

      {/* ROLE SELECTOR + LEARNER SUMMARY ROW */}
      <div className="rj-cascade relative z-30 mx-auto mb-3 flex w-full max-w-5xl shrink-0 flex-col gap-3 lg:flex-row lg:items-stretch" style={{ animationDelay: '90ms' }}>
        <RoleDropdown activeRole={activeRole} onSelect={setActiveRoleId} />
        {view === 'learner' ? <PersonaCard role={activeRole} overallPercent={overallPercent} /> : null}
      </div>

      <div className="min-h-0 flex-1">
        {view === 'learner' ? (
          <LearnerJourney
            key={activeRole.id}
            role={activeRole}
            phases={phases}
            onDeepDive={setDeepDive}
            onOpenEvidenceMap={openEvidenceMap}
          />
        ) : (
          <div className="h-full overflow-y-auto pb-4">
            <ManagerView role={activeRole} evidenceRef={evidenceRef} />
          </div>
        )}
      </div>

      {deepDive ? (
        <DeepDivePanel phaseKey={deepDive} role={activeRole} phases={phases} onClose={() => setDeepDive(null)} />
      ) : null}
    </div>
  );
}

export default RoleJourneyVisualizer;

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (view: ViewMode) => void }) {
  return (
    <div className="inline-flex shrink-0 items-center rounded-[16px] border border-[#E5E4E3] bg-[#FAFAF7] p-1.5 shadow-sm" role="tablist" aria-label="Journey view">
      {(
        [
          { id: 'learner', label: 'Learner View', icon: GraduationCap },
          { id: 'manager', label: 'Manager View', icon: Eye },
        ] as const
      ).map((option) => {
        const isActive = view === option.id;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={cx(
              'flex items-center gap-2 rounded-[12px] px-5 py-2.5 font-montserrat text-[11px] font-bold uppercase tracking-wider transition-all duration-300',
              isActive ? 'bg-[#007970] text-white shadow-[0_4px_14px_rgba(0,121,112,0.3)]' : 'text-[#3D3D3A] hover:text-[#007970]',
            )}
          >
            <Icon size={14} aria-hidden />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function RoleDropdown({ activeRole, onSelect }: { activeRole: RoleDef; onSelect: (roleId: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const ActiveIcon = ROLE_ICONS[activeRole.id] ?? GraduationCap;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full max-w-md">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cx(
          'flex w-full items-center justify-between gap-3 rounded-[18px] border bg-white px-5 py-4 shadow-sm transition-all duration-300',
          open ? 'border-[#007970] shadow-[0_12px_32px_rgba(0,121,112,0.12)]' : 'border-[#E5E4E3] hover:border-[#007970]/60 hover:shadow-md',
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E5FEFF]">
            <ActiveIcon size={18} className="text-[#007970]" aria-hidden />
          </span>
          <span className="min-w-0 text-left">
            <span className="block font-montserrat text-[9px] font-bold uppercase tracking-widest text-[#C2410C]">Select role • {activeRole.id}</span>
            <span className="block truncate font-montserrat text-[15px] font-bold text-[#007970]">{activeRole.title}</span>
          </span>
        </span>
        <ChevronDown size={18} className={cx('shrink-0 text-[#3D3D3A] transition-transform duration-300', open && 'rotate-180 text-[#007970]')} aria-hidden />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="CMS-required positions"
          className="rj-modal-in absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-[420px] overflow-y-auto rounded-[20px] border border-[#E5E4E3] bg-white p-2 shadow-[0_24px_64px_rgba(0,65,66,0.18)]"
        >
          {ROLES.map((role) => {
            const Icon = ROLE_ICONS[role.id] ?? GraduationCap;
            const isActive = role.id === activeRole.id;
            return (
              <button
                key={role.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onSelect(role.id);
                  setOpen(false);
                }}
                className={cx(
                  'flex w-full items-center gap-3 rounded-[14px] px-3.5 py-3 text-left transition-colors duration-150',
                  isActive ? 'bg-[#E5FEFF]' : 'hover:bg-[#FAFAF7]',
                )}
              >
                <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', isActive ? 'bg-[#007970]' : 'bg-[#FAFAF7]')}>
                  <Icon size={16} className={isActive ? 'text-white' : 'text-[#3D3D3A]'} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cx('block truncate font-montserrat text-[13px] font-bold', isActive ? 'text-[#007970]' : 'text-[#52404B]')}>{role.title}</span>
                  <span className="block font-montserrat text-[9px] font-bold uppercase tracking-widest text-[#474742]">
                    {role.id} • {role.tag} • {role.moduleCountLabel}
                  </span>
                </span>
                {isActive ? <CheckCircle2 size={16} className="shrink-0 text-[#007970]" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function HeroPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5 rounded-full border border-[#E5E4E3] bg-[#FAFAF7] px-3.5 py-1.5">
      <span className="font-montserrat text-[13px] font-bold text-[#007970]">{value}</span>
      <span className="whitespace-nowrap font-montserrat text-[9px] font-bold uppercase tracking-wider text-[#474742]">{label}</span>
    </div>
  );
}

function PersonaCard({ role, overallPercent }: { role: RoleDef; overallPercent: number }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col justify-center gap-x-6 gap-y-2 rounded-[18px] border border-[#E5E4E3] bg-white px-5 py-3 shadow-sm sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#007970] font-montserrat text-xs font-bold text-white">
          {MOCK_LEARNER.name.split(' ').map((part) => part[0]).join('')}
        </div>
        <div className="min-w-0">
          <div className="truncate font-montserrat text-[13px] font-bold text-[#52404B]">
            {MOCK_LEARNER.name} <span className="font-semibold text-[#474742]">•</span> <span className="text-[#007970]">{role.title}</span>
          </div>
          <div className="mt-0.5 truncate font-montserrat text-[9px] font-bold uppercase tracking-wider text-[#474742]">
            Day {MOCK_LEARNER.day} of onboarding • {role.jdPolicy} • Sample progress state
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1 sm:max-w-xs">
        <div className="mb-1 flex items-center justify-between font-montserrat text-[9px] font-bold uppercase tracking-wider">
          <span className="text-[#3D3D3A]">Journey completion</span>
          <span className="text-[#C2410C]">{overallPercent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#F1F0EE]">
          <div className="rj-shimmer h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${overallPercent}%` }} />
        </div>
      </div>
    </div>
  );
}

function PolicyChip({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-[#E5E4E3] bg-[#FAFAF7] px-2 py-0.5 font-montserrat text-[10px] font-semibold tracking-wide text-[#3D3D3A]">
      {text}
    </span>
  );
}

function CompetencyBadge({ label, kind }: { label: string; kind: CompetencyKind }) {
  if (kind === 'none') return <span className="font-montserrat text-[10px] font-bold text-[#C9C9C6]">—</span>;
  return (
    <span className={cx('inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide', COMPETENCY_CHIP[kind])}>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Learner view — timeline
// ---------------------------------------------------------------------------

function LearnerJourney({
  role,
  phases,
  onDeepDive,
  onOpenEvidenceMap,
}: {
  role: RoleDef;
  phases: PhaseVM[];
  onDeepDive: (phase: PhaseKey) => void;
  onOpenEvidenceMap: () => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * 400, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1240px] flex-col">
      {/* PHASE CAROUSEL — horizontal, edge-faded, fills remaining height */}
      <div className="rj-cascade relative min-h-0 flex-1" style={{ animationDelay: '220ms' }}>
        <div ref={trackRef} className="rj-carousel flex h-full snap-x snap-mandatory items-stretch gap-6 overflow-x-auto scroll-px-10 px-10 pb-3 pt-1">
          {phases.map((phase, index) => (
            <PhaseCard key={phase.key} phase={phase} delay={`${220 + index * 110}ms`} onDeepDive={() => onDeepDive(phase.key)}>
              <PhaseCardBody phaseKey={phase.key} role={role} status={phase.status} onOpenEvidenceMap={onOpenEvidenceMap} />
            </PhaseCard>
          ))}
        </div>

        {/* Edge fades over partially visible cards */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#FAFBF8] to-transparent md:w-24" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#FAFBF8] to-transparent md:w-24" aria-hidden />

        {/* Carousel controls */}
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Previous phase"
          className="absolute left-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E4E3] bg-white text-[#007970] shadow-md transition-all hover:scale-105 hover:border-[#007970]"
        >
          <ChevronLeft size={18} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Next phase"
          className="absolute right-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E4E3] bg-white text-[#007970] shadow-md transition-all hover:scale-105 hover:border-[#007970]"
        >
          <ChevronRight size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}

function PhaseCard({
  phase,
  delay,
  children,
  onDeepDive,
}: {
  phase: PhaseVM;
  delay: string;
  children: ReactNode;
  onDeepDive: () => void;
}) {
  const Icon = phase.icon;
  const locked = phase.status === 'locked';

  return (
    <div className="rj-cascade group h-full w-[320px] shrink-0 snap-center md:w-[368px]" style={{ animationDelay: delay }}>
      <div
        role="button"
        tabIndex={0}
        onClick={onDeepDive}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onDeepDive();
          }
        }}
        aria-label={`Open ${phase.title} deep dive`}
        className={cx(
          'flex h-full cursor-pointer flex-col rounded-[24px] border bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,121,112,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007970]',
          phase.status === 'active' ? 'border-[#F06923]/50 shadow-[0_8px_32px_rgba(240,105,35,0.08)]' : 'border-[#E5E4E3]',
          locked && 'opacity-70 saturate-[0.85] hover:opacity-100',
        )}
      >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className={cx(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
                  phase.status === 'complete' && 'border-[#E5F4EE] bg-[#007970]',
                  phase.status === 'active' && 'rj-pulse-ring border-[#FFF0E5] bg-white',
                  locked && 'border-[#FAFAF7] bg-white shadow-sm',
                )}
                aria-hidden
              >
                {phase.status === 'complete' ? (
                  <CheckCircle2 size={18} className="text-white" />
                ) : phase.status === 'active' ? (
                  <Icon size={16} className="text-[#C2410C]" />
                ) : (
                  <Lock size={15} className="text-[#C9C9C6]" />
                )}
              </span>
              <span className="font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#C2410C]">{phase.eyebrow}</span>
            </div>
            <span className="rounded-md border border-[#E5E4E3] bg-[#FAFAF7] px-2.5 py-1 font-montserrat text-[9px] font-bold uppercase tracking-wider text-[#474742]">
              {phase.timeframe}
            </span>
          </div>
          <h3 className="mb-2 font-montserrat text-xl font-semibold leading-snug text-[#007970]">{phase.title}</h3>

          {/* Phase progress */}
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between font-montserrat text-[10px] font-bold uppercase tracking-wider">
              <span className={phase.status === 'complete' ? 'text-[#008540]' : phase.status === 'active' ? 'text-[#C2410C]' : 'text-[#474742]'}>
                {phase.status === 'complete' ? 'Completed' : phase.status === 'active' ? 'In progress' : 'Locked'}
              </span>
              <span className="text-[#474742]">{phase.progressLabel}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#F1F0EE]">
              <div
                className={cx(
                  'h-full rounded-full transition-[width] duration-700 ease-out',
                  phase.status === 'complete' && 'bg-[#007970]',
                  phase.status === 'active' && 'rj-shimmer',
                )}
                style={{ width: `${phase.percent}%` }}
              />
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            {children}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" aria-hidden />
          </div>

          <div className="mt-5 flex items-center gap-1.5 font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#007970] transition-transform duration-300 group-hover:translate-x-1">
            {locked ? 'Preview requirements' : 'Open deep dive'}
            <ChevronRight size={14} aria-hidden />
          </div>
      </div>
    </div>
  );
}

function PhaseCardBody({
  phaseKey,
  role,
  status,
  onOpenEvidenceMap,
}: {
  phaseKey: PhaseKey;
  role: RoleDef;
  status: PhaseStatus;
  onOpenEvidenceMap: () => void;
}) {
  if (phaseKey === 'phase0') {
    return (
      <>
        <p className="mb-4 font-roboto text-sm leading-relaxed text-[#3D3D3A]">
          HARD STOP: no individual performs ANY work — including orientation — until Appendix F is complete. (HR-TA-001 § 4.3)
        </p>
        <ul className="mb-4 space-y-2">
          {PRE_HIRE_STEPS.slice(0, 4).map((step) => (
            <ListItem key={step.step} text={`${step.action} (${step.policy})`} done />
          ))}
          <li className="pl-4 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#474742]">
            + {PRE_HIRE_STEPS.length - 4} more clearance items
          </li>
        </ul>
        <div className="flex items-center gap-2 rounded-xl border border-[#b4e6d3] bg-[#E5F4EE] px-4 py-3 font-montserrat text-xs font-bold tracking-wide text-[#008540]">
          <CheckCircle2 size={16} aria-hidden /> APPENDIX F SIGNED BY HR DIRECTOR
        </div>
      </>
    );
  }

  if (phaseKey === 'phase1') {
    return (
      <>
        <p className="mb-4 font-roboto text-sm leading-relaxed text-[#3D3D3A]">
          Foundation training required for every role — 28 modules (GAO-001…GAO-EXAM) covering mission, compliance, HIPAA, and safety.
        </p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <MiniBadge text="Corporate Compliance" />
          <MiniBadge text="HIPAA Privacy & Security" />
          <MiniBadge text="Infection Control" />
          <MiniBadge text="Emergency Prep" />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[#fbd3b7] bg-[#FFF0E5] px-4 py-3 font-montserrat text-xs font-bold tracking-wide text-[#D1571A]">
          <ShieldAlert size={16} aria-hidden /> 80% COMPETENCY PASS REQUIRED — RETAKE WITHIN 3 BUSINESS DAYS
        </div>
      </>
    );
  }

  if (phaseKey === 'phase2') {
    const highlights = role.modules.slice(0, 4);
    return (
      <>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-[#b2f5f7] bg-[#E5FEFF] px-2.5 py-1 font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#007970]">
            {role.id}
          </span>
          <span className="font-montserrat text-xs font-bold uppercase tracking-wider text-[#474742]">{role.moduleCountLabel}</span>
        </div>
        <p className="mb-4 font-roboto text-sm font-medium leading-relaxed text-[#52404B]">
          {role.cfr} — {role.description}
        </p>
        <div className="mb-4 space-y-2.5">
          {highlights.map((module) => (
            <div key={module.id} className="flex items-center gap-3 rounded-xl border border-[#E5E4E3] bg-[#FAFAF7] p-3">
              <ArrowRight size={14} className="shrink-0 text-[#C2410C]" aria-hidden />
              <span className="font-montserrat text-[13px] font-semibold text-[#52404B]">
                {module.title} <span className="font-bold text-[#474742]">({module.id})</span>
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[#E5E4E3] bg-[#FAFAF7] px-4 py-3 font-montserrat text-xs font-bold tracking-wide text-[#3D3D3A]">
          <FileText size={16} className="shrink-0 text-[#007970]" aria-hidden />
          <span className="truncate">{status === 'locked' ? 'Unlocks when GAO-EXAM is passed (80% gate)' : role.clearance}</span>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="mb-4 font-roboto text-sm leading-relaxed text-[#3D3D3A]">
        Continuous audit-defensible tracking mapped to HR-TD-001: quarterly annual training, monthly exclusion screening, and
        ongoing competency re-evaluation.
      </p>
      <ul className="mb-5 space-y-2">
        <ListItem text="Monthly OIG/SAM exclusion screening — by the 15th, CO co-sign by the 20th" />
        <ListItem text="Q1 Compliance & HIPAA • Q2 Infection Prevention & EP Drill #1" />
        <ListItem text="Q3 Anti-Harassment, Fall Risk, Med Safety • Q4 OASIS, IT Security, EP Drill #2" />
        <ListItem text="Annual competency evaluation window: Feb 1 – Oct 31 (HR-TD-003)" />
      </ul>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpenEvidenceMap();
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F06923] px-6 py-3.5 font-montserrat text-[11px] font-bold uppercase tracking-widest text-white shadow-[0_4px_12px_rgba(240,105,35,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#D1571A]"
      >
        <ShieldCheck size={16} aria-hidden /> View Audit Evidence Map
      </button>
    </>
  );
}

function ListItem({ text, done }: { text: string; done?: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      {done ? (
        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#008540]" aria-hidden />
      ) : (
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#007970]" aria-hidden />
      )}
      <span className="font-roboto text-[13px] leading-relaxed text-[#52404B]">{text}</span>
    </li>
  );
}

function MiniBadge({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-[#E5E4E3] bg-[#FAFAF7] px-3 py-2 text-center">
      <span className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#3D3D3A]">{text}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Deep-dive slide-over panel
// ---------------------------------------------------------------------------

function DeepDivePanel({
  phaseKey,
  role,
  phases,
  onClose,
}: {
  phaseKey: PhaseKey;
  role: RoleDef;
  phases: PhaseVM[];
  onClose: () => void;
}) {
  const phase = phases.find((entry) => entry.key === phaseKey);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!phase) return null;
  const Icon = phase.icon;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8">
      <button type="button" aria-label="Close deep dive" onClick={onClose} className="rj-fade-in absolute inset-0 cursor-default bg-[#52404B]/30 backdrop-blur-[2px]" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${phase.title} deep dive`}
        className="rj-modal-in relative flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-[#E5E4E3] bg-[#FAFAF7] shadow-[0_32px_80px_rgba(0,65,66,0.28)]"
      >
        {/* Panel header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E4E3] bg-white px-7 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E5FEFF]">
              <Icon size={20} className="text-[#007970]" aria-hidden />
            </div>
            <div>
              <span className="font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#C2410C]">
                {phase.eyebrow} • {phase.timeframe}
              </span>
              <h2 className="mt-1 font-montserrat text-lg font-bold leading-snug text-[#007970]">{phase.title}</h2>
              <span className="mt-1 block font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#474742]">
                {phase.progressLabel}
                {phaseKey === 'phase2' ? ` • ${role.id} / ${role.jdPolicy}` : ''}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E4E3] bg-white text-[#3D3D3A] transition-all hover:border-[#F06923] hover:text-[#C2410C]"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        {/* Panel body */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          {phaseKey === 'phase0' ? <Phase0Detail /> : null}
          {phaseKey === 'phase1' ? <Phase1Detail /> : null}
          {phaseKey === 'phase2' ? <Phase2Detail role={role} /> : null}
          {phaseKey === 'phase3' ? <Phase3Detail /> : null}
        </div>
      </aside>
    </div>,
    document.body,
  );
}

function PanelSectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 mt-6 font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#C2410C] first:mt-0">{children}</h3>;
}

function Phase0Detail() {
  return (
    <>
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#fbd3b7] bg-[#FFF0E5] p-4">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-[#D1571A]" aria-hidden />
        <p className="font-roboto text-[13px] font-medium leading-relaxed text-[#8A4B22]">
          HARD STOP — no individual performs ANY work, including orientation, until every Appendix F item reads PASS or N/A and the
          HR Director has signed. (HR-TA-001 § 4.3; HR-TA-005 § 4.1)
        </p>
      </div>
      <PanelSectionTitle>Clearance checklist (HR-TA-001 §§ 6.4–6.5)</PanelSectionTitle>
      <div className="space-y-2.5">
        {PRE_HIRE_STEPS.map((step) => (
          <div key={step.step} className="rounded-2xl border border-[#E5E4E3] bg-white p-4 transition-all duration-200 hover:border-[#007970]/40 hover:shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#008540]" aria-hidden />
              <div className="min-w-0">
                <div className="font-montserrat text-[13px] font-semibold leading-snug text-[#52404B]">
                  <span className="mr-1.5 text-[#474742]">{step.step}</span>
                  {step.action}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <PolicyChip text={step.policy} />
                  <span className="font-roboto text-[11px] text-[#474742]">→ {step.evidence}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Phase1Detail() {
  return (
    <>
      <PanelSectionTitle>All 28 orientation modules (HR-TA-005 § 6.2)</PanelSectionTitle>
      <div className="space-y-2">
        {GAO_MODULES.map((module, index) => {
          const done = index < GAO_DONE_COUNT;
          const isNext = index === GAO_DONE_COUNT;
          return (
            <div
              key={module.id}
              className={cx(
                'rounded-2xl border p-3.5 transition-all duration-200',
                isNext ? 'border-[#F06923]/60 bg-white shadow-[0_4px_16px_rgba(240,105,35,0.1)]' : 'border-[#E5E4E3] bg-white hover:border-[#007970]/40',
                !done && !isNext && 'opacity-75',
              )}
            >
              <div className="flex items-start gap-3">
                {done ? (
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#008540]" aria-hidden />
                ) : (
                  <span className={cx('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2', isNext ? 'border-[#F06923]' : 'border-[#D9D9D6]')} aria-hidden>
                    {isNext ? <span className="h-1.5 w-1.5 rounded-full bg-[#F06923]" /> : null}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#007970]">{module.id}</span>
                    {isNext ? (
                      <span className="rounded-md bg-[#FFF0E5] px-1.5 py-0.5 font-montserrat text-[9px] font-bold uppercase tracking-wider text-[#D1571A]">Up next</span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 font-montserrat text-[13px] font-semibold leading-snug text-[#52404B]">{module.topic}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {module.policy !== '—' ? <PolicyChip text={module.policy} /> : null}
                    {module.assessment !== '—' ? (
                      <CompetencyBadge label={module.assessment} kind={module.hasQuiz ? 'quiz' : 'return-demo'} />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-[#b4e6d3] bg-[#E5F4EE] p-4 font-roboto text-[12px] leading-relaxed text-[#0B5B34]">
          <strong className="font-montserrat text-[11px] font-bold uppercase tracking-wider">Evidence output:</strong> signed HR-TA-005
          Appendix A (trainer + employee signatures), Appendix D quiz with score, and all policy acknowledgment forms filed in the
          personnel file.
        </div>
        <div className="rounded-2xl border border-[#fbd3b7] bg-[#FFF0E5] p-4 font-roboto text-[12px] leading-relaxed text-[#8A4B22]">
          <strong className="font-montserrat text-[11px] font-bold uppercase tracking-wider">Failure protocol:</strong> score &lt; 80% →
          remedial review + retake within 3 business days.
        </div>
      </div>
    </>
  );
}

function Phase2Detail({ role }: { role: RoleDef }) {
  const grouped = useMemo(() => {
    const groups: Array<{ phase: string; modules: RoleModuleRow[] }> = [];
    for (const module of role.modules) {
      const bucket = groups.find((group) => group.phase === module.phase);
      if (bucket) bucket.modules.push(module);
      else groups.push({ phase: module.phase, modules: [module] });
    }
    return groups;
  }, [role]);

  return (
    <>
      <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <PanelFact label="CMS CoP basis" value={role.cfr} />
        <PanelFact label="Licensure" value={role.licensure} />
        <PanelFact label="Reports to" value={role.reportsTo} />
        <PanelFact label="LMS prefix" value={`${role.lmsPrefix}-000 series`} />
      </div>

      {role.derivedNote ? (
        <div className="mb-5 rounded-2xl border border-[#b2f5f7] bg-[#E5FEFF] p-4 font-roboto text-[12px] leading-relaxed text-[#00565B]">
          {role.derivedNote}
        </div>
      ) : null}

      {grouped.map((group) => (
        <div key={group.phase}>
          <PanelSectionTitle>{group.phase}</PanelSectionTitle>
          <div className="space-y-2">
            {group.modules.map((module) => (
              <div key={module.id} className="rounded-2xl border border-[#E5E4E3] bg-white p-4 transition-all duration-200 hover:border-[#007970]/40 hover:shadow-sm">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#007970]">{module.id}</span>
                  {module.method ? <span className="font-montserrat text-[10px] font-semibold uppercase tracking-wider text-[#474742]">{module.method}</span> : null}
                </div>
                <div className="mt-1 font-montserrat text-[13px] font-semibold leading-snug text-[#52404B]">{module.title}</div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {module.policy !== '—' ? <PolicyChip text={module.policy} /> : null}
                  <CompetencyBadge label={module.competency} kind={module.competencyKind} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {role.supervisedVisits ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#b2f5f7] bg-[#E5FEFF] p-4">
          <UserCheck size={18} className="mt-0.5 shrink-0 text-[#007970]" aria-hidden />
          <div>
            <div className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#007970]">Supervised visits</div>
            <p className="mt-1 font-roboto text-[12px] leading-relaxed text-[#00565B]">{role.supervisedVisits}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex items-start gap-3 rounded-2xl border border-[#b4e6d3] bg-[#E5F4EE] p-4">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#008540]" aria-hidden />
        <div>
          <div className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#008540]">Clearance gate</div>
          <p className="mt-1 font-roboto text-[12px] leading-relaxed text-[#0B5B34]">{role.clearance}</p>
        </div>
      </div>
    </>
  );
}

function PanelFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E4E3] bg-white p-3.5">
      <div className="font-montserrat text-[9px] font-bold uppercase tracking-widest text-[#474742]">{label}</div>
      <div className="mt-1 font-montserrat text-[12px] font-semibold leading-snug text-[#52404B]">{value}</div>
    </div>
  );
}

function Phase3Detail() {
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
  return (
    <>
      <PanelSectionTitle>Annual training calendar (HR-TD-001 § 6.2)</PanelSectionTitle>
      <div className="space-y-4">
        {quarters.map((quarter) => (
          <div key={quarter} className="rounded-2xl border border-[#E5E4E3] bg-white p-4">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#007970] font-montserrat text-[11px] font-bold text-white">{quarter}</span>
              <span className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#474742]">
                {ANNUAL_TRAINING.filter((row) => row.quarter === quarter).length} tracks
              </span>
            </div>
            <div className="space-y-1.5">
              {ANNUAL_TRAINING.filter((row) => row.quarter === quarter).map((row) => (
                <div key={row.lms} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl bg-[#FAFAF7] px-3 py-2">
                  <span className="font-montserrat text-[12px] font-semibold text-[#52404B]">
                    {row.training} <span className="text-[10px] font-bold text-[#474742]">({row.lms} • {row.staff})</span>
                  </span>
                  {row.assessment !== '—' ? <CompetencyBadge label={row.assessment} kind={row.assessment.includes('Quiz') ? 'quiz' : 'exercise'} /> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <PanelSectionTitle>Monthly cadence (HR-TA-003 § 6.2)</PanelSectionTitle>
      <div className="flex items-start gap-3 rounded-2xl border border-[#E5E4E3] bg-white p-4">
        <CalendarCheck size={18} className="mt-0.5 shrink-0 text-[#007970]" aria-hidden />
        <p className="font-roboto text-[13px] leading-relaxed text-[#52404B]">
          OIG LEIE + SAM exclusion screening for all staff by the <strong>15th of each month</strong>; Compliance Officer co-sign by
          the <strong>20th</strong>.
        </p>
      </div>

      <PanelSectionTitle>Ongoing monitoring</PanelSectionTitle>
      <div className="space-y-2">
        {ONGOING_MONITORING.map((row) => (
          <div key={row.activity} className="rounded-2xl border border-[#E5E4E3] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="font-montserrat text-[13px] font-semibold text-[#52404B]">{row.activity}</span>
              <PolicyChip text={row.policy} />
            </div>
            <div className="mt-1 font-roboto text-[12px] text-[#3D3D3A]">
              {row.frequency} <span className="text-[#474742]">→ {row.evidence}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Manager view
// ---------------------------------------------------------------------------

function ManagerView({ role, evidenceRef }: { role: RoleDef; evidenceRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* KPI STRIP */}
      <div className="rj-cascade grid grid-cols-2 gap-4 lg:grid-cols-4" style={{ animationDelay: '120ms' }}>
        <ManagerKpi icon={Users} value="7" label="Staff in onboarding" sub="3 in GAO • 4 role-specific" />
        <ManagerKpi icon={ShieldCheck} value="94%" label="Annual training compliance" sub="2 staff at Day-30 reminder" tone="teal" />
        <ManagerKpi icon={UserCheck} value="3" label="HHA supervisory visits due" sub="14-day cycle — this week" tone="orange" />
        <ManagerKpi icon={CalendarCheck} value="Jul 15" label="Next OIG/SAM sweep" sub="CO co-sign due Jul 20" />
      </div>

      {/* SUPERVISION SCHEDULE */}
      <ManagerSection
        icon={Eye}
        title="Supervision & Sign-Off Schedule"
        subtitle="Every role's supervised-practice requirement, evaluator, and evidence form. The selected role is highlighted."
        delay="180ms"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr>
                {['Role', 'Requirement', 'Evaluator', 'Evidence form'].map((header) => (
                  <th key={header} className="border-b border-[#E5E4E3] pb-3 pr-4 font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#474742]">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUPERVISION_SCHEDULE.map((row) => {
                const isActive = row.roleId === role.id;
                return (
                  <tr key={row.roleId} className={cx('transition-colors', isActive ? 'bg-[#E5FEFF]/60' : 'hover:bg-[#FAFAF7]')}>
                    <td className="border-b border-[#F1F0EE] py-3 pr-4">
                      <span className={cx('font-montserrat text-[12px] font-bold', isActive ? 'text-[#007970]' : 'text-[#52404B]')}>{row.role}</span>
                      {isActive ? (
                        <span className="ml-2 rounded-md bg-[#007970] px-1.5 py-0.5 font-montserrat text-[9px] font-bold uppercase tracking-wider text-white">Selected</span>
                      ) : null}
                    </td>
                    <td className="border-b border-[#F1F0EE] py-3 pr-4 font-roboto text-[12px] leading-relaxed text-[#52404B]">{row.requirement}</td>
                    <td className="border-b border-[#F1F0EE] py-3 pr-4 font-roboto text-[12px] text-[#3D3D3A]">{row.evaluator}</td>
                    <td className="border-b border-[#F1F0EE] py-3">
                      <PolicyChip text={row.form} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ManagerSection>

      {/* HHA 14/60 CYCLE */}
      <ManagerSection
        icon={HeartHandshake}
        title="HHA Supervision Cycle — § 484.80(h)"
        subtitle="The most heavily surveyed schedule in home health: an RN supervisory visit every 14 days for the first 60 days, then every 60 days. Each visit is documented on HR-TD-003 Appendix E."
        delay="240ms"
      >
        <div className="px-2 pb-2 pt-6">
          <div className="relative h-2 rounded-full bg-[#F1F0EE]">
            <div className="absolute inset-y-0 left-0 w-[75%] rounded-full bg-gradient-to-r from-[#007970] to-[#00A99D]" />
            {[0, 14, 28, 42, 56].map((day) => (
              <div key={day} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${(day / 75) * 100}%` }}>
                <div className={cx('h-4 w-4 rounded-full border-[3px] border-white shadow-sm', day === 0 ? 'bg-[#007970]' : 'bg-[#F06923]')} />
                <div className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap font-montserrat text-[9px] font-bold uppercase tracking-wider text-[#3D3D3A]">
                  {day === 0 ? 'Day 1' : `Day ${day}`}
                </div>
                {day !== 0 ? (
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-montserrat text-[8px] font-bold uppercase tracking-wider text-[#C2410C]">
                    RN visit
                  </div>
                ) : null}
              </div>
            ))}
            <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: '80%' }}>
              <div className="h-4 w-4 rounded-full border-[3px] border-white bg-[#008540] shadow-sm" />
              <div className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap font-montserrat text-[9px] font-bold uppercase tracking-wider text-[#008540]">Day 60</div>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-montserrat text-[8px] font-bold uppercase tracking-wider text-[#008540]">Cycle gate</div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
              <Repeat size={16} className="text-[#474742]" aria-hidden />
              <div className="absolute right-0 top-5 whitespace-nowrap font-montserrat text-[9px] font-bold uppercase tracking-wider text-[#474742]">Every 60 days</div>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            <MiniBadge text="12 hrs annual in-service — § 484.80(d)" />
            <MiniBadge text="Annual re-eval: HR-TD-003 Appendix D (all 9 areas)" />
            <MiniBadge text="Visit form: HR-TD-003 Appendix E" />
          </div>
        </div>
      </ManagerSection>

      {/* ESCALATION MATRIX */}
      <ManagerSection
        icon={AlertTriangle}
        title="Escalation & Non-Compliance Matrix"
        subtitle="Automatic triggers, timelines, and required actions — each traceable to its policy section."
        delay="300ms"
      >
        <div className="space-y-2.5">
          {ESCALATION_MATRIX.map((row) => {
            const severity = SEVERITY_CHIP[row.severity];
            return (
              <div key={row.trigger} className="flex flex-col gap-2 rounded-2xl border border-[#E5E4E3] bg-[#FAFAF7] p-4 transition-all duration-200 hover:border-[#F06923]/40 hover:bg-white sm:flex-row sm:items-center sm:gap-4">
                <span className={cx('inline-flex w-fit shrink-0 items-center rounded-md border px-2 py-1 font-montserrat text-[9px] font-bold uppercase tracking-widest', severity.className)}>
                  {severity.label}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-montserrat text-[13px] font-semibold leading-snug text-[#52404B]">{row.trigger}</div>
                  <div className="mt-0.5 font-roboto text-[12px] leading-relaxed text-[#3D3D3A]">
                    <strong className="text-[#C2410C]">{row.timeline}:</strong> {row.action}
                  </div>
                </div>
                <PolicyChip text={row.policy} />
              </div>
            );
          })}
        </div>
      </ManagerSection>

      {/* AUDIT EVIDENCE MAP */}
      <div ref={evidenceRef}>
        <ManagerSection
          icon={FileText}
          title="Audit-Defensible Evidence Map"
          subtitle="What CMS surveyors pull during a survey (HR-TA-001 § 8.2) — and the exact evidence that answers each request."
          delay="360ms"
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {EVIDENCE_MAP.map((row, index) => (
              <div key={row.surveyorAction} className="rounded-2xl border border-[#E5E4E3] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#007970]/40 hover:shadow-md">
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#007970] font-montserrat text-[11px] font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="font-montserrat text-[13px] font-bold leading-snug text-[#007970]">{row.surveyorAction}</span>
                </div>
                <p className="mb-3 font-roboto text-[12px] leading-relaxed text-[#3D3D3A]">
                  <strong className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#474742]">They look for: </strong>
                  {row.lookFor}
                </p>
                <div className="flex items-start gap-2 rounded-xl border border-[#b4e6d3] bg-[#E5F4EE] px-3 py-2.5">
                  <ClipboardCheck size={14} className="mt-0.5 shrink-0 text-[#008540]" aria-hidden />
                  <span className="font-roboto text-[12px] font-medium leading-relaxed text-[#0B5B34]">{row.evidence}</span>
                </div>
              </div>
            ))}
          </div>
        </ManagerSection>
      </div>

      {/* COMPLETION GATES */}
      <ManagerSection
        icon={Lock}
        title="LMS Completion Gates"
        subtitle="Sequencing rules enforced by the LMS (SCORM-tracked): each series unlocks the next."
        delay="420ms"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {COMPLETION_GATES.map((gate, index) => (
            <div key={gate.gate} className="relative rounded-2xl border border-[#E5E4E3] bg-[#FAFAF7] p-5">
              <span className="font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#C2410C]">Gate {index + 1}</span>
              <h4 className="mt-1.5 font-montserrat text-[14px] font-bold leading-snug text-[#007970]">{gate.gate}</h4>
              <p className="mt-2 font-roboto text-[12px] leading-relaxed text-[#3D3D3A]">
                <ArrowRight size={12} className="mr-1 inline text-[#C2410C]" aria-hidden />
                {gate.unlocks}
              </p>
              <div className="mt-3">
                <PolicyChip text={gate.policy} />
              </div>
            </div>
          ))}
        </div>
      </ManagerSection>
    </div>
  );
}

function ManagerKpi({
  icon: Icon,
  value,
  label,
  sub,
  tone,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  sub: string;
  tone?: 'teal' | 'orange';
}) {
  return (
    <div className="rounded-[20px] border border-[#E5E4E3] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <span className={cx('flex h-9 w-9 items-center justify-center rounded-xl', tone === 'orange' ? 'bg-[#FFF0E5]' : 'bg-[#E5FEFF]')}>
          <Icon size={16} className={tone === 'orange' ? 'text-[#C2410C]' : 'text-[#007970]'} aria-hidden />
        </span>
        <span className="font-montserrat text-2xl font-bold text-[#007970]">{value}</span>
      </div>
      <div className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#52404B]">{label}</div>
      <div className="mt-1 font-roboto text-[11px] text-[#474742]">{sub}</div>
    </div>
  );
}

function ManagerSection({
  icon: Icon,
  title,
  subtitle,
  delay,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  delay: string;
  children: ReactNode;
}) {
  return (
    <section className="rj-cascade rounded-[24px] border border-[#E5E4E3] bg-white p-7 shadow-sm md:p-9" style={{ animationDelay: delay }}>
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E5FEFF]">
          <Icon size={18} className="text-[#007970]" aria-hidden />
        </div>
        <div>
          <h2 className="font-montserrat text-lg font-bold tracking-tight text-[#007970]">{title}</h2>
          <p className="mt-1 max-w-3xl font-roboto text-[13px] font-light leading-relaxed text-[#3D3D3A]">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
