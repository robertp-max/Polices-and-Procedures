import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Award,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Heart,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Share2,
} from 'lucide-react';
import { ALL_MODULES, moduleById, modulesForRole } from '@/policy/journey/data/modules';
import {
  ROLES,
  ROLE_ONBOARDING_PATHS,
  type RoleDef,
  type RoleModuleRow,
  type RoleOnboardingPathDef,
} from '@/policy/journey/data/roleJourneyData';
import { RoleJourneyVisualizer } from '@/policy/journey/components/roleJourney/RoleJourneyVisualizer';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';
import { canStartModule, isModulePassed, latestAttempt } from '@/policy/journey/utils/gating';
import type { JourneyModule, JourneyRole, ModuleAttempt } from '@/policy/journey/types/journey';
import { cx } from '../../utils/classNames';
import {
  workspaceCompactTabClass,
  workspaceTabActiveClass,
  workspaceTabInactiveClass,
  workspaceTabNavClass,
} from './workspaceTabChrome';
import { StaticCardWatermark } from './StaticCardWatermark';
import { NolanTutorPanel } from '../journey/NolanTutorPanel';
import { getAssignedModuleIdsForEmployee } from '../../utils/journeyProfileAdapter';

type AcademyTabId = 'home' | 'onboarding' | 'roleJourney' | 'appendixF' | 'achc' | 'advanced' | 'certificates';
type OnboardingPathId = string;

interface AcademyTab {
  id: AcademyTabId;
  label: string;
}

interface AcademyCard {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  status: string;
  to: string;
}

interface RolePathSummary {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  status: string;
  to: string;
  moduleCount: number;
  completedCount: number;
}

interface ResolvedRolePathModule {
  row: RoleModuleRow;
  module: JourneyModule;
  role: RoleDef;
}

const rolePathLookup = new Map(ROLE_ONBOARDING_PATHS.map((path) => [path.id, path]));

const academyTabs: AcademyTab[] = [
  {
    id: 'home',
    label: 'Home',
  },
  {
    id: 'onboarding',
    label: 'Onboarding',
  },
  {
    id: 'roleJourney',
    label: 'Role Journey',
  },
  {
    id: 'appendixF',
    label: 'Appendix F',
  },
  {
    id: 'achc',
    label: 'ACHC',
  },
  {
    id: 'advanced',
    label: 'Advanced',
  },
  {
    id: 'certificates',
    label: 'Certs',
  },
];

function toAcademyTabId(value: string | null): AcademyTabId | null {
  switch (value) {
    case 'home':
    case 'onboarding':
    case 'roleJourney':
    case 'appendixF':
    case 'achc':
    case 'advanced':
    case 'certificates':
      return value;
    default:
      return null;
  }
}

function completionForModule(moduleId: string, attempts: ModuleAttempt[]) {
  const moduleAttempts = attempts.filter((attempt) => attempt.moduleId === moduleId);
  const latest = moduleAttempts[moduleAttempts.length - 1];
  if (!latest) return null;
  return latest.lessonStatus === 'passed' || latest.status === 'completed' ? '100%' : 'In Progress';
}

function isJourneyRole(value: string): value is JourneyRole {
  return ROLES.some((role) => role.short === value);
}

function roleDefsForPath(path: RoleOnboardingPathDef): RoleDef[] {
  return path.roleShorts
    .filter(isJourneyRole)
    .map((short) => ROLES.find((role) => role.short === short))
    .filter((role): role is RoleDef => Boolean(role));
}

function resolveRolePathModules(path: RoleOnboardingPathDef): ResolvedRolePathModule[] {
  const seen = new Set<string>();
  return roleDefsForPath(path).flatMap((role) =>
    role.modules.flatMap((row) => {
      if (seen.has(row.id)) return [];
      const module = moduleById(row.id);
      if (!module) return [];
      seen.add(row.id);
      return [{ row, module, role }];
    }),
  );
}

function completedModuleIdSet(attempts: ModuleAttempt[], employeeId: string) {
  const completed = new Set<string>();
  ALL_MODULES.forEach((module) => {
    const attempt = latestAttempt(attempts, employeeId, module.id);
    if (isModulePassed(module, attempt)) completed.add(module.id);
  });
  return completed;
}

function actionForProgress(completed: number, total: number) {
  if (completed <= 0) return 'Start Path';
  if (completed >= total) return 'View Path';
  return 'Continue Path';
}

function refsLine(module: JourneyModule, row?: RoleModuleRow) {
  const refs = [
    row?.policy,
    module.policyRefs.length ? module.policyRefs.join(', ') : null,
    module.cmsRefs.length ? module.cmsRefs.join(', ') : null,
  ].filter(Boolean);
  return refs.length ? refs.join(' - ') : 'Role competency record';
}

function AcademyTabs({
  activeTab,
  onChange,
}: {
  activeTab: AcademyTabId;
  onChange: (tab: AcademyTabId) => void;
}) {
  return (
    <nav aria-label="Training academy sections" className={workspaceTabNavClass}>
      {academyTabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cx(
              workspaceCompactTabClass,
              'flex items-center justify-center whitespace-nowrap',
              isActive ? workspaceTabActiveClass : workspaceTabInactiveClass,
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8 flex w-full flex-col justify-between gap-8 rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:px-12 md:py-10 xl:flex-row xl:items-start">
      <div className="max-w-2xl">
        <h1 className="mb-2 font-montserrat text-2xl font-semibold leading-tight tracking-tight text-[#007970] md:text-3xl">
          {title}
        </h1>
        <p className="font-roboto text-sm text-[#747470] md:text-base">{subtitle}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const done = status === '100%' || status === 'Done';
  return (
    <span
      className={cx(
        'rounded-md px-3 py-1 font-montserrat text-[11px] font-bold uppercase tracking-wider',
        done ? 'bg-[#E5F4EE] text-[#008540]' : 'bg-[#FFF0E5] text-[#F06923]',
      )}
    >
      {status}
    </span>
  );
}

function ModuleCard({
  card,
  status,
  onClick,
}: {
  card: AcademyCard;
  status?: string | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full min-h-[236px] flex-col justify-between rounded-[24px] border border-[#E5E4E3] bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#007970] hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
    >
      <span>
        <span className="mb-5 flex items-center justify-between gap-4">
          <span className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#F06923]">{card.eyebrow}</span>
          <StatusBadge status={status ?? card.status} />
        </span>
        <span className="mb-4 block font-montserrat text-xl font-semibold leading-snug text-[#007970] transition-colors group-hover:text-[#F06923]">
          {card.title}
        </span>
      </span>
      <span className="font-roboto text-[15px] leading-relaxed text-[#747470]">{card.body}</span>
    </button>
  );
}

function RolePathCard({
  card,
  onClick,
}: {
  card: RolePathSummary;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full min-h-[260px] flex-col justify-between rounded-[24px] border border-[#E5E4E3] bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#007970] hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
    >
      <span>
        <span className="mb-5 flex items-center justify-between gap-4">
          <span className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#F06923]">{card.eyebrow}</span>
          <StatusBadge status={card.status} />
        </span>
        <span className="mb-4 block font-montserrat text-xl font-semibold leading-snug text-[#007970] transition-colors group-hover:text-[#F06923]">
          {card.title}
        </span>
        <span className="mb-5 block font-roboto text-[15px] leading-relaxed text-[#747470]">{card.body}</span>
      </span>
      <span className="flex items-end justify-between gap-4 border-t border-[#E5E4E3] pt-5">
        <span className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#007970]">
          {card.moduleCount} modules
        </span>
        <span className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#F06923]">
          {actionForProgress(card.completedCount, card.moduleCount)}
        </span>
      </span>
    </button>
  );
}

function RoleModuleCard({
  item,
  index,
  status,
  lockedReason,
  onClick,
}: {
  item: ResolvedRolePathModule;
  index: number;
  status: string;
  lockedReason?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full min-h-[252px] flex-col justify-between rounded-[24px] border border-[#E5E4E3] bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#007970] hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
    >
      <span>
        <span className="mb-5 flex items-center justify-between gap-4">
          <span className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#F06923]">
            {String(index + 1).padStart(2, '0')} - {item.module.id}
          </span>
          <StatusBadge status={status} />
        </span>
        <span className="mb-3 block font-montserrat text-xl font-semibold leading-snug text-[#007970] transition-colors group-hover:text-[#F06923]">
          {item.module.title}
        </span>
        <span className="mb-4 block font-roboto text-[15px] leading-relaxed text-[#747470]">{refsLine(item.module, item.row)}.</span>
        {lockedReason ? (
          <span className="block rounded-[12px] bg-[#FFF8ED] px-4 py-3 font-roboto text-xs leading-relaxed text-[#9A5B20]">
            {lockedReason}
          </span>
        ) : null}
      </span>
      <span className="mt-6 flex items-center justify-between gap-4 border-t border-[#E5E4E3] pt-5">
        <span className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#007970]">{item.row.phase}</span>
        <span className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#F06923]">Open Module</span>
      </span>
    </button>
  );
}

function SectionContainer({
  title,
  footer,
  action,
  onAction,
  children,
}: {
  title: string;
  footer: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="w-full rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:p-12">
      <h2 className="mb-8 font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#007970]">{title}</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">{children}</div>
      <div className="mt-12 flex flex-col gap-8 border-t border-[#E5E4E3] pt-10 lg:flex-row lg:items-center lg:justify-between">
        <p className="font-roboto text-[15px] text-[#52404B]">{footer}</p>
        {action && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#F06923] px-8 py-3.5 text-center font-montserrat text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_25px_6px_rgba(240,105,35,0.38)] sm:w-auto"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {action}
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function JourneyAcademyScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const attempts = useJourneyStore((state) => state.attempts);
  const evidence = useJourneyStore((state) => state.evidence);
  const currentEmployeeId = useJourneyStore((state) => state.currentEmployeeId);
  const employees = useJourneyStore((state) => state.employees);
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId) || employees[0];
  const requestedTab = toAcademyTabId(searchParams.get('tab'));
  const requestedPath = searchParams.get('path');
  const onboardingPath =
    requestedPath === 'gao' || (requestedPath && rolePathLookup.has(requestedPath)) ? requestedPath : null;
  const selectedRolePath = onboardingPath && onboardingPath !== 'gao' ? rolePathLookup.get(onboardingPath) ?? null : null;
  const [activeTab, setActiveTab] = useState<AcademyTabId>(() => requestedTab ?? 'home');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const nextTab = requestedTab ?? 'home';
    setActiveTab((current) => (current === nextTab ? current : nextTab));
  }, [requestedTab]);

  // Phase 2C: completions / evidence scoped to demo-impersonated learner (not global aggregate)
  const learnerAttempts = useMemo(
    () => attempts.filter((a) => a.employeeId === currentEmployeeId),
    [attempts, currentEmployeeId],
  );
  const learnerEvidence = useMemo(
    () => evidence.filter((e) => e.employeeId === currentEmployeeId),
    [evidence, currentEmployeeId],
  );

  /**
   * Prefer Phase 2A setup onboarding.moduleIds for the impersonated learner;
   * else modulesForRole(role). Catalog resolution still uses ALL_MODULES / moduleById.
   */
  const assignedModuleIds = useMemo(() => {
    if (!currentEmployee) return [] as string[];
    return getAssignedModuleIdsForEmployee(currentEmployee.id, currentEmployee.role);
  }, [currentEmployee]);

  const assignedModules = useMemo(() => {
    if (assignedModuleIds.length > 0) {
      return assignedModuleIds
        .map((id) => moduleById(id))
        .filter((m): m is NonNullable<typeof m> => !!m);
    }
    return currentEmployee ? modulesForRole(currentEmployee.role) : ALL_MODULES;
  }, [assignedModuleIds, currentEmployee]);

  const completedModuleIds = useMemo(
    () => completedModuleIdSet(learnerAttempts, currentEmployeeId),
    [learnerAttempts, currentEmployeeId],
  );

  const roleOnboardingCards = useMemo<RolePathSummary[]>(() => {
    const gaoSource =
      assignedModules.filter((module) => module.group === 'GAO').length > 0
        ? assignedModules.filter((module) => module.group === 'GAO')
        : ALL_MODULES.filter((module) => module.group === 'GAO');
    const gaoCompleted = gaoSource.filter((module) => completedModuleIds.has(module.id)).length;
    return [
      {
        id: 'GAO',
        eyebrow: 'Path 01 - GAO',
        title: 'General Agency Orientation',
        body: 'Foundation sequence for every role: mission, compliance, HIPAA, patient rights, safety, and survey readiness.',
        status: `${gaoCompleted}/${gaoSource.length}`,
        to: '/journey?tab=onboarding&path=gao',
        moduleCount: gaoSource.length,
        completedCount: gaoCompleted,
      },
      ...ROLE_ONBOARDING_PATHS.map((path, index) => {
        const modules = resolveRolePathModules(path);
        const completedCount = modules.filter((item) => completedModuleIds.has(item.module.id)).length;
        return {
          id: path.id,
          eyebrow: `Path ${String(index + 2).padStart(2, '0')} - ${path.label}`,
          title: path.title,
          body: path.description,
          status: `${completedCount}/${modules.length}`,
          to: `/journey?tab=onboarding&path=${path.id}`,
          moduleCount: modules.length,
          completedCount,
        };
      }),
    ];
  }, [assignedModules, completedModuleIds]);

  const selectedRolePathModules = useMemo(
    () => (selectedRolePath ? resolveRolePathModules(selectedRolePath) : []),
    [selectedRolePath],
  );

  const selectedRolePathCompletedCount = useMemo(
    () => selectedRolePathModules.filter((item) => completedModuleIds.has(item.module.id)).length,
    [completedModuleIds, selectedRolePathModules],
  );

  const achcCards = useMemo<AcademyCard[]>(
    () =>
      assignedModules
        .filter((module) => module.id.startsWith('ACHC-ART-'))
        .slice(0, 12)
        .map((module, index) => ({
          id: module.id,
          eyebrow: `Module ${index + 1}`,
          title: module.title,
          body: `${module.durationMinutes ?? 60} min - ${module.cmsRefs.join(', ') || 'ACHC annual requirement'} - 80% pass threshold.`,
          status: index === 0 ? 'Start' : 'Play',
          to: `/journey/module/${module.id}`,
        })),
    [assignedModules],
  );

  // If assignment has no ACHC slice, fall back to catalog ACHC so the tab is not empty for roles that include ALL modules
  const achcCardsResolved = useMemo(() => {
    if (achcCards.length > 0) return achcCards;
    // modulesForRole / setup usually includes ACHC via roles:'ALL'; if still empty show catalog slice
    return ALL_MODULES
      .filter((module) => module.id.startsWith('ACHC-ART-'))
      .slice(0, 12)
      .map((module, index) => ({
        id: module.id,
        eyebrow: `Module ${index + 1}`,
        title: module.title,
        body: `${module.durationMinutes ?? 60} min - ${module.cmsRefs.join(', ') || 'ACHC annual requirement'} - 80% pass threshold.`,
        status: index === 0 ? 'Start' : 'Play',
        to: `/journey/module/${module.id}`,
      }));
  }, [achcCards]);

  const gaoCards = useMemo<AcademyCard[]>(
    () => {
      const gaoSource =
        assignedModules.filter((module) => module.group === 'GAO').length > 0
          ? assignedModules.filter((module) => module.group === 'GAO')
          : ALL_MODULES.filter((module) => module.group === 'GAO');
      return gaoSource.map((module, index) => ({
        id: module.id,
        eyebrow: module.id === 'GAO-EXAM' ? 'Final Gate' : `GAO ${String(index + 1).padStart(2, '0')}`,
        title: module.title,
        body: `${module.method} - ${module.policyRefs.join(', ') || 'agency orientation'}${module.cmsRefs.length ? ` - ${module.cmsRefs.join(', ')}` : ''}.`,
        status: module.id === 'GAO-001' ? 'Start' : 'Play',
        to: `/journey/module/${module.id}`,
      }));
    },
    [assignedModules],
  );

  const advancedCards = useMemo<AcademyCard[]>(
    () => {
      const advSource = ALL_MODULES.filter((module) => module.group === 'ADV');
      return advSource.map((module, index) => ({
        id: module.id,
        eyebrow: `RN-ADV-${String(index + 1).padStart(2, '0')}`,
        title: module.title,
        body: `${module.durationMinutes ?? 120} min - ${module.method} - ${module.policyRefs.join(', ') || 'clinical governance'}.`,
        status: 'Play',
        to: `/journey/module/${module.id}`,
      }));
    },
    [],
  );

  const completedModuleCount = useMemo(
    () =>
      new Set(
        learnerAttempts
          .filter((attempt) => attempt.lessonStatus === 'passed' || attempt.status === 'completed')
          .map((attempt) => attempt.moduleId),
      ).size,
    [learnerAttempts],
  );
  const certificateCards = [
    {
      id: 'GAO-001',
      eyebrow: 'Cert - GAO-001',
      title: 'General Agency Orientation',
      body: 'Issued when GAO-001 assessment and acknowledgement evidence are complete.',
      status: completionForModule('GAO-001', learnerAttempts) ?? 'In Progress',
      to: '/journey/module/GAO-001',
    },
    {
      id: 'ACHC-ART-M01',
      eyebrow: 'Cert - ACHC',
      title: 'ACHC Cultural Awareness',
      body: 'Annual field-worker training certificate with quiz evidence and completion timestamp.',
      status: completionForModule('ACHC-ART-M01', learnerAttempts) ?? 'In Progress',
      to: '/journey/module/ACHC-ART-M01',
    },
    {
      id: 'cms-485',
      eyebrow: 'Cert - Advanced',
      title: 'CMS-485 Plan of Care Mastery',
      body: 'Advanced plan-of-care training certificate with scenario completion and review evidence.',
      status: completionForModule('cms-485', learnerAttempts) ?? 'In Progress',
      to: '/journey/module/cms-485',
    },
  ];

  const openOnboardingPath = (path: OnboardingPathId) => {
    setActiveTab('onboarding');
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'onboarding');
    next.set('path', path);
    setSearchParams(next, { replace: false });
  };
  const closeOnboardingPath = () => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'onboarding');
    next.delete('path');
    setSearchParams(next, { replace: false });
  };
  const openModule = (card: AcademyCard) => {
    if (card.id === 'GAO') {
      openOnboardingPath('gao');
      return;
    }
    navigate(card.to);
  };
  const changeTab = (tab: AcademyTabId) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    if (tab !== 'onboarding') next.delete('path');
    setSearchParams(next, { replace: true });
  };
  const copyComplianceLog = () => {
    const summary = `Care Indeed Journey log (${currentEmployeeId}): ${completedModuleCount} completed modules, ${learnerEvidence.length} evidence records.`;
    void navigator.clipboard?.writeText(summary);
    setNotice('Compliance log summary copied.');
    window.setTimeout(() => setNotice(null), 2600);
  };

  return (
    <div
      className={cx(
        '-m-xl overflow-x-hidden bg-[#FAFBF8] px-6 pt-4 font-roboto text-[#52404B] selection:bg-[#E5FEFF] md:px-12',
        activeTab === 'roleJourney' ? 'pb-2' : 'min-h-screen pb-16',
      )}
    >
      {notice ? (
        <div className="fixed bottom-6 right-6 z-[70] rounded-xl border border-[#C4F4F5] bg-[#E5FEFF] px-4 py-3 text-sm font-semibold text-[#007970] shadow-lg">
          {notice}
        </div>
      ) : null}

      <main className="mx-auto flex w-full max-w-[1400px] flex-col">
        <div className="relative z-20 flex justify-start">
          <AcademyTabs activeTab={activeTab} onChange={changeTab} />
        </div>

        {activeTab === 'home' ? (
          <div className="space-y-10 pb-12">
            <section className="ci-page-hero relative overflow-hidden rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-10 shadow-sm md:p-14">
              <StaticCardWatermark />
              <div className="relative z-10 flex flex-col items-start justify-between gap-12 xl:flex-row">
                <div className="max-w-3xl">
                  <h2 className="mb-6 font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#F06923]">Academy Overview</h2>
                  <h1 className="mb-6 font-montserrat text-4xl font-bold leading-none tracking-tight text-[#007970] md:text-5xl lg:text-6xl">
                    Care Indeed <br />
                    Training Academy
                  </h1>
                  <p className="mb-10 max-w-2xl font-roboto text-lg font-light leading-relaxed text-[#52404B] md:text-xl">
                    Compliance-driven learning for onboarding, annual ACHC readiness, role competency, and advanced clinical documentation.
                  </p>
                  <div className="flex flex-col gap-4 font-montserrat sm:flex-row">
                    <button
                      type="button"
                      onClick={() => changeTab('onboarding')}
                      className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F06923] px-8 py-4 text-center text-[12px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_25px_6px_rgba(240,105,35,0.38)]"
                    >
                      <GraduationCap className="h-4 w-4" aria-hidden />
                      Start Training Journey
                    </button>
                    <button
                      type="button"
                      onClick={() => changeTab('achc')}
                      className="inline-flex items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-[#007970] bg-white px-8 py-4 text-center text-[12px] font-bold uppercase tracking-widest text-[#007970] transition-all hover:bg-[#F7FEFF]"
                    >
                      <ShieldCheck className="h-4 w-4" aria-hidden />
                      View Annual Compliance
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid w-full grid-cols-2 gap-6 md:grid-cols-4">
              {[
                { value: '42 CFR', label: 'Part 484 aligned', icon: ShieldCheck },
                { value: String(roleOnboardingCards.length), label: 'Role pathways', icon: LayoutGrid },
                { value: String(achcCardsResolved.length), label: 'ACHC modules', icon: BookOpen },
                { value: String(completedModuleCount), label: 'Completed modules', icon: Award },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="group flex min-h-[164px] flex-col items-center justify-center rounded-[24px] border border-[#E5E4E3] bg-white p-8 text-center shadow-sm transition-colors hover:border-[#007970]">
                    <Icon className="mb-4 h-6 w-6 text-[#007970]" aria-hidden />
                    <span className="mb-3 font-montserrat text-3xl font-bold text-[#F06923] transition-transform duration-300 group-hover:scale-110 md:text-4xl">{stat.value}</span>
                    <span className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#747470]">{stat.label}</span>
                  </div>
                );
              })}
            </div>

            <SectionContainer
              title="Academy Highlights"
              footer="Built for home health staff who need fast, defensible, survey-ready training."
              action="Explore Advanced Training"
              onAction={() => changeTab('advanced')}
            >
              <ModuleCard
                card={{
                  id: 'scenario',
                  eyebrow: 'Methodology',
                  title: 'Interactive Scenarios',
                  body: 'Branching case work, documentation choices, and competency gates replace passive click-through training.',
                  status: 'Active',
                  to: '/journey/module/GAO-001',
                }}
                onClick={() => changeTab('onboarding')}
              />
              <ModuleCard
                card={{
                  id: 'survey',
                  eyebrow: 'Compliance',
                  title: 'Survey-Ready Training',
                  body: 'Modules map to CMS Conditions of Participation, ACHC standards, policy evidence, and personnel-file records.',
                  status: 'Active',
                  to: '/journey/admin',
                }}
                onClick={() => navigate('/journey/admin')}
              />
              <ModuleCard
                card={{
                  id: 'pathways',
                  eyebrow: 'Curriculum',
                  title: 'Role-Specific Pathways',
                  body: 'RNs, LVNs, therapists, aides, administrators, and DONs each see the requirements that matter to their role.',
                  status: 'Active',
                  to: '/journey/new-hire',
                }}
                onClick={() => navigate('/journey/new-hire')}
              />
              <ModuleCard
                card={{
                  id: 'certificates',
                  eyebrow: 'Certificates',
                  title: 'Completion Certificates',
                  body: 'View issued training certificates, completion evidence, timestamps, and survey-ready learner records.',
                  status: `${certificateCards.length} records`,
                  to: '/journey?tab=certificates',
                }}
                onClick={() => changeTab('certificates')}
              />
            </SectionContainer>
          </div>
        ) : null}

        {activeTab === 'onboarding' ? (
          <div className="space-y-8 pb-12">
            {onboardingPath === 'gao' ? (
              <>
                <button
                  type="button"
                  onClick={closeOnboardingPath}
                  className="inline-flex w-fit items-center gap-2 rounded-[12px] border border-[#D9E9E7] bg-white px-4 py-2 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#007970] shadow-sm transition hover:bg-[#F7FEFF]"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back to Onboarding Paths
                </button>
                <PageHeader title="General Agency Orientation" subtitle="Complete the full GAO sequence before moving into role-specific onboarding and competency gates." />
                <SectionContainer title="GAO Module Sequence" footer="Open any GAO module below. The full orientation path remains available here instead of jumping straight into GAO-001.">
                  {gaoCards.map((card) => (
                    <ModuleCard key={card.id} card={card} status={completionForModule(card.id, learnerAttempts)} onClick={() => openModule(card)} />
                  ))}
                </SectionContainer>
              </>
            ) : selectedRolePath ? (
              <>
                <button
                  type="button"
                  onClick={closeOnboardingPath}
                  className="inline-flex w-fit items-center gap-2 rounded-[12px] border border-[#D9E9E7] bg-white px-4 py-2 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#007970] shadow-sm transition hover:bg-[#F7FEFF]"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Back to Onboarding Paths
                </button>
                <PageHeader
                  title={selectedRolePath.title}
                  subtitle={`${selectedRolePath.description} ${selectedRolePathCompletedCount}/${selectedRolePathModules.length} modules complete for ${currentEmployee?.name || 'the current learner'}.`}
                />
                <SectionContainer
                  title={`${selectedRolePath.label} Module Sequence`}
                  footer="Modules are ordered from the canonical role assignment source and open in the existing module player."
                >
                  {selectedRolePathModules.map((item, index) => {
                    const passed = completedModuleIds.has(item.module.id);
                    const attempt = latestAttempt(learnerAttempts, currentEmployeeId, item.module.id);
                    const gate = currentEmployee ? canStartModule(currentEmployee, item.module, attempts) : null;
                    const status = passed ? 'Done' : attempt ? 'Continue' : gate?.unlocked === false ? 'Locked' : 'Start';
                    return (
                      <RoleModuleCard
                        key={`${item.role.short}-${item.module.id}`}
                        item={item}
                        index={index}
                        status={status}
                        lockedReason={gate?.unlocked === false ? gate.reason : undefined}
                        onClick={() => navigate(`/journey/module/${item.module.id}`)}
                      />
                    );
                  })}
                </SectionContainer>
              </>
            ) : (
              <>
                <PageHeader
                  title="Role-Based Onboarding & Competency Journey"
                  subtitle={`CMS CoP alignment for ${currentEmployee?.name || 'learner'} (${currentEmployee?.role || 'role'}). Supervisor sign-off gates and personnel-file evidence.`}
                />
                <SectionContainer title="Role-Based Onboarding Paths" footer="Begin with General Agency Orientation, then open the pathway for your assigned role." action="Open New Hire Portal" onAction={() => navigate('/journey/new-hire')}>
                  {roleOnboardingCards.map((card) => (
                    <RolePathCard
                      key={card.id}
                      card={card}
                      onClick={() => (card.id === 'GAO' ? openOnboardingPath('gao') : openOnboardingPath(card.id))}
                    />
                  ))}
                </SectionContainer>
              </>
            )}
          </div>
        ) : null}

        {activeTab === 'roleJourney' ? (
          <div className="pb-2">
            <RoleJourneyVisualizer />
          </div>
        ) : null}

        {activeTab === 'achc' ? (
          <div className="space-y-8 pb-12">
            <PageHeader title="ACHC Required - Field Worker Edition" subtitle="Annual modules with scenario challenges, quiz gates, and evidence capture for survey readiness." />
            <SectionContainer title="Annual Mandatory Training" footer="Completion gate: all annual modules by Dec 31 with remediation tracking for missed thresholds." action="Start First Module" onAction={() => navigate('/journey/module/ACHC-ART-M01')}>
              {achcCardsResolved.map((card) => (
                <ModuleCard key={card.id} card={card} status={completionForModule(card.id, learnerAttempts)} onClick={() => openModule(card)} />
              ))}
            </SectionContainer>
          </div>
        ) : null}

        {activeTab === 'appendixF' ? (
          <div className="space-y-8 pb-12">
            <PageHeader title="Appendix F Onboarding Clearance" subtitle="Required pre-Day-1 clearance, HR review, signature control, and personnel-file evidence before work begins." />
            <SectionContainer
              title="Appendix F Packet"
              footer="Appendix F remains the required onboarding gate before orientation, field work, or independent patient care."
              action="Open Appendix F"
              onAction={() => navigate('/journey/appendix-f')}
            >
              <ModuleCard
                card={{
                  id: 'appendix-f-required',
                  eyebrow: 'Required Gate',
                  title: 'Pre-Employment Screening Checklist',
                  body: 'Open the live Appendix F checklist to review PASS/NA items, capture notes, and complete HR Director sign-off.',
                  status: 'Open',
                  to: '/journey/appendix-f',
                }}
                onClick={() => navigate('/journey/appendix-f')}
              />
              <ModuleCard
                card={{
                  id: 'appendix-f-evidence',
                  eyebrow: 'Personnel File',
                  title: 'Clearance Evidence Record',
                  body: 'Use Appendix F to document background checks, exclusion screening, license review, health readiness, and final clearance state.',
                  status: 'Active',
                  to: '/journey/appendix-f',
                }}
                onClick={() => navigate('/journey/appendix-f')}
              />
              <ModuleCard
                card={{
                  id: 'appendix-f-unlocks',
                  eyebrow: 'Training Access',
                  title: 'Unlock Onboarding Journey',
                  body: 'Once Appendix F is signed, learners can continue into GAO, role-specific onboarding, certificates, and supervisor gates.',
                  status: 'Gate',
                  to: '/journey?tab=onboarding',
                }}
                onClick={() => changeTab('onboarding')}
              />
            </SectionContainer>
          </div>
        ) : null}

        {activeTab === 'advanced' ? (
          <div className="space-y-8 pb-12">
            <PageHeader title="Advanced Training - Plan of Care & Compliance" subtitle="Deep clinical modules for CMS-485, QAPI, OASIS-E2, and documentation defensibility." />
            <SectionContainer title="Advanced Clinical Training" footer="Specialized completion evidence supports competency reviews and remediation plans." action="Open Supervisor View" onAction={() => navigate('/journey/supervisor')}>
              {advancedCards.map((card) => (
                <ModuleCard key={card.id} card={card} status={completionForModule(card.id, learnerAttempts)} onClick={() => openModule(card)} />
              ))}
            </SectionContainer>
          </div>
        ) : null}

        {activeTab === 'certificates' ? (
          <div className="space-y-10 pb-12">
            <PageHeader title="My Certificates" subtitle="Archived certificates and completion records. Full color means complete; muted records are still in progress." />
            <section className="rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-montserrat text-2xl font-semibold tracking-tight text-[#007970]">Badge Rewards</h2>
                  <p className="mt-2 font-roboto text-sm font-light text-[#747470]">
                    Completed modules: <strong className="font-semibold">{completedModuleCount}</strong>. Evidence records: <strong className="font-semibold">{learnerEvidence.length}</strong>.
                  </p>
                </div>
                <span className="font-montserrat text-xs font-bold uppercase tracking-wider text-[#747470]">{Math.min(completedModuleCount, 6)}/6 Unlocked</span>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[
                  { title: 'Orientation Spark', req: '1 complete', icon: Sparkles },
                  { title: 'Consistency Core', req: '5 complete', icon: CheckCircle2 },
                  { title: 'Compliance Climber', req: '10 complete', icon: ShieldCheck },
                  { title: 'Policy Pathfinder', req: '20 complete', icon: FileText },
                  { title: 'Clinical Heart', req: '35 complete', icon: Heart },
                  { title: 'Mastery Architect', req: '50 complete', icon: Stethoscope },
                ].map((badge, index) => {
                  const unlocked = completedModuleCount >= index + 1;
                  const Icon = badge.icon;
                  return (
                    <div key={badge.title} className={cx('flex min-h-48 flex-col justify-between rounded-[20px] border p-6 transition-all duration-300', unlocked ? 'border-[#007970] bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md' : 'border-gray-200 bg-[#FAFBF8]/60 opacity-55')}>
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#F06923]">{unlocked ? 'Unlocked' : 'Locked'}</span>
                          <Icon className="h-4 w-4 text-[#007970]" aria-hidden />
                        </div>
                        <h3 className="mb-1 font-montserrat text-base font-bold leading-snug text-[#007970]">{badge.title}</h3>
                        <span className="block font-montserrat text-xs font-medium text-[#007970]/80">{badge.req}</span>
                      </div>
                      <p className="font-roboto text-xs leading-relaxed text-[#747470]">Cosmetic recognition for Journey completion milestones.</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <SectionContainer title="Completed Certificates" footer="Certificates remain tied to Journey attempts and evidence records." action="Download All as PDF" onAction={() => window.print()}>
              {certificateCards.map((card) => (
                <ModuleCard key={card.id} card={card} onClick={() => openModule(card)} />
              ))}
            </SectionContainer>

            <div className="flex flex-col items-center justify-end gap-4 rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm sm:flex-row">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#F06923] px-8 py-3.5 font-montserrat text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_25px_6px_rgba(240,105,35,0.38)] sm:w-auto"
              >
                <Download className="h-4 w-4" aria-hidden />
                Download All as PDF
              </button>
              <button
                type="button"
                onClick={copyComplianceLog}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-[#007970] bg-white px-8 py-3.5 font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#007970] transition-all hover:bg-[#F7FEFF] sm:w-auto"
              >
                <Share2 className="h-4 w-4" aria-hidden />
                Share Compliance Log
              </button>
            </div>
          </div>
        ) : null}
      </main>
      {/* Nolan — training tutor, available on every Academy tab. */}
      <NolanTutorPanel />
    </div>
  );
}

export default JourneyAcademyScreen;
