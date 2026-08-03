import { useCallback, useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Home,
  Landmark,
  Lock,
  Search,
  ShieldCheck,
  Stethoscope,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { cx } from '../../utils/classNames';

type ReceptionWorkspaceId =
  | 'compliance'
  | 'journey'
  | 'governing-body'
  | 'find-home-care'
  | 'ehr-prototype';

type WorkspaceAccent = 'teal' | 'orange' | 'executive' | 'navy' | 'clinical';
type WorkspaceStatus = 'available' | 'restricted' | 'prototype';

interface ReceptionWorkspace {
  id: ReceptionWorkspaceId;
  name: string;
  description: string;
  route: string;
  external?: boolean;
  status: WorkspaceStatus;
  requiredRoles: readonly string[];
  capabilities: readonly string[];
  accent: WorkspaceAccent;
  icon: LucideIcon;
  cta: string;
}

const LAST_ROUTE_STORAGE_KEY = 'ci.reception.lastRoutes.v1';

const WORKSPACES: readonly ReceptionWorkspace[] = [
  {
    id: 'compliance',
    name: 'Compliance',
    description: 'Policies, forms, workflows, evidence, eCIgn, QAPI, audit readiness, and Brad.',
    route: '/compliance',
    status: 'available',
    requiredRoles: ['Administrator', 'Compliance', 'Supervisor', 'DON', 'QAPI'],
    capabilities: ['Policy library', 'Evidence center', 'Audit mode', 'Brad'],
    accent: 'teal',
    icon: ClipboardCheck,
    cta: 'Open Compliance',
  },
  {
    id: 'journey',
    name: 'Journey',
    description: 'Onboarding, training, role paths, certificates, policy attestation, and employee evidence.',
    route: '/journey?tab=home',
    status: 'available',
    requiredRoles: ['Administrator', 'Employee', 'Clinician', 'Supervisor', 'RN', 'LVN', 'PT', 'OT', 'HHA'],
    capabilities: ['Training path', 'Modules', 'Assessments', 'Certificates'],
    accent: 'orange',
    icon: GraduationCap,
    cta: 'Open Journey',
  },
  {
    id: 'governing-body',
    name: 'Governing Body',
    description: 'Executive oversight, decision docket, readiness work, QAPI review, tabletop exercises, and signatures.',
    route: '/governance',
    status: 'restricted',
    requiredRoles: ['Administrator', 'Governing Body', 'Executive', 'Owner'],
    capabilities: ['Docket', 'Decisions', 'QAPI review', 'Signatures'],
    accent: 'executive',
    icon: Landmark,
    cta: 'Enter Governance',
  },
  {
    id: 'find-home-care',
    name: 'Find Home Care',
    description: 'A separate consumer-facing service finder concept for care needs, location, and intake routing.',
    route: '/find-home-care',
    status: 'prototype',
    requiredRoles: ['Administrator', 'Product', 'Intake', 'Sales'],
    capabilities: ['Care matching', 'Service area', 'Intake lead', 'Family view'],
    accent: 'navy',
    icon: Home,
    cta: 'Open Finder',
  },
  {
    id: 'ehr-prototype',
    name: 'EHR Prototype',
    description: 'A standalone clinical record concept for chart navigation, documentation, scheduling, and secure tasks.',
    route: 'http://127.0.0.1:5191',
    external: true,
    status: 'prototype',
    requiredRoles: ['Administrator', 'Product', 'Clinician', 'RN', 'LVN', 'PT', 'OT'],
    capabilities: ['Charts', 'Visits', 'Orders', 'Messages'],
    accent: 'clinical',
    icon: Activity,
    cta: 'Open EHR',
  },
] as const;

const accentStyles: Record<WorkspaceAccent, {
  action: string;
  badge: string;
  panel: string;
  text: string;
}> = {
  teal: {
    action: 'bg-[#007970] text-white',
    badge: 'bg-[#E5FEFF] text-[#007970]',
    panel: 'bg-[#F7FEFF]',
    text: 'text-[#007970]',
  },
  orange: {
    action: 'bg-[#C74600] text-white',
    badge: 'bg-[#FFF2EA] text-[#C74600]',
    panel: 'bg-[#FFFAF7]',
    text: 'text-[#C74600]',
  },
  executive: {
    action: 'bg-[#073F3C] text-white',
    badge: 'bg-[#F8F0D8] text-[#604600]',
    panel: 'bg-[#F7FBFA]',
    text: 'text-[#073F3C]',
  },
  navy: {
    action: 'bg-[#101F38] text-white',
    badge: 'bg-[#FFF5D7] text-[#6A4C00]',
    panel: 'bg-[#F6F8FC]',
    text: 'text-[#101F38]',
  },
  clinical: {
    action: 'bg-[#1A4E8A] text-white',
    badge: 'bg-[#EAF2FB] text-[#1A4E8A]',
    panel: 'bg-[#F5FAFF]',
    text: 'text-[#1A4E8A]',
  },
};

function normalizeRole(role: string | null | undefined) {
  return (role ?? '').toLowerCase();
}

function isWorkspaceAuthorized(workspace: ReceptionWorkspace, role: string | null | undefined, isDemo: boolean) {
  if (isDemo) return true;
  if (workspace.status !== 'restricted') return true;
  const normalizedRole = normalizeRole(role);
  return workspace.requiredRoles.some((requiredRole) => normalizedRole.includes(requiredRole.toLowerCase()));
}

function readRecentRoutes(): Partial<Record<ReceptionWorkspaceId, string>> {
  if (typeof window === 'undefined') return {};
  try {
    const value = window.localStorage.getItem(LAST_ROUTE_STORAGE_KEY);
    if (!value) return {};
    return JSON.parse(value) as Partial<Record<ReceptionWorkspaceId, string>>;
  } catch {
    return {};
  }
}

function writeRecentRoute(workspaceId: ReceptionWorkspaceId, route: string) {
  if (typeof window === 'undefined') return;
  const next = { ...readRecentRoutes(), [workspaceId]: route };
  window.localStorage.setItem(LAST_ROUTE_STORAGE_KEY, JSON.stringify(next));
}

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function statusLabel(status: WorkspaceStatus, enabled: boolean) {
  if (!enabled) return 'Restricted';
  if (status === 'prototype') return 'Prototype';
  if (status === 'restricted') return 'Authorized';
  return 'Available';
}

function ReceptionShell({ children }: { children: ReactNode }) {
  return (
    <main
      className="min-h-screen w-full overflow-x-hidden bg-[#F3F2EE] px-4 py-4 font-roboto text-[#14211F] selection:bg-[#E5FEFF] tablet-p:px-6"
      data-hash-id="reception"
      data-route="/reception"
      data-template="reception"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(7, 63, 60, 0.028) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(7, 63, 60, 0.028) 1px, transparent 1px)',
            'radial-gradient(circle at 9% 5%, rgba(199, 70, 0, 0.14), transparent 24%)',
            'radial-gradient(circle at 94% 14%, rgba(0, 121, 112, 0.16), transparent 28%)',
          ].join(', '),
          backgroundSize: '34px 34px, 34px 34px, auto, auto',
        }}
      />
      <div className="relative mx-auto grid min-h-[calc(100vh-32px)] w-full max-w-[1520px] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[28px] bg-white/75 shadow-[0_28px_80px_rgba(4,43,40,0.18)]">
        {children}
      </div>
    </main>
  );
}

function ReceptionHeader({
  onCommandOpen,
  userLabel,
}: {
  onCommandOpen: () => void;
  userLabel: string;
}) {
  return (
    <header className="grid min-h-[82px] items-center gap-4 bg-white/80 px-5 py-4 tablet-l:grid-cols-[minmax(230px,auto)_minmax(260px,590px)_minmax(240px,auto)]">
      <div className="flex min-w-0 items-center gap-4">
        <img className="h-11 w-auto shrink-0 object-contain" src="/assets/navigation/logo-careindeed-orange.png" alt="Care Indeed" />
        <div className="min-w-0 border-l border-[#073F3C]/15 pl-4">
          <strong className="block truncate font-montserrat text-sm font-semibold text-[#073F3C]">Reception</strong>
          <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[#66736F]">Secure workspace entry</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onCommandOpen}
        className="flex min-h-12 w-full items-center justify-between rounded-lg bg-[#F3F2EE] px-4 text-left text-sm text-[#66736F] shadow-inner transition hover:bg-[#EAF2EF] focus-visible:shadow-[0_0_0_4px_rgba(0,121,112,0.18)]"
      >
        <span className="flex min-w-0 items-center gap-3">
          <Search className="h-5 w-5 shrink-0 text-[#C74600]" aria-hidden />
          <span className="min-w-0 truncate">
            <strong className="font-medium text-[#14211F]">Search everything or ask Brad</strong>
            <span className="hidden text-[#66736F] tablet-p:inline"> - workspace, policy, task, module, or decision</span>
          </span>
        </span>
        <span className="ml-3 shrink-0 rounded bg-white px-2 py-1 text-[11px] font-semibold text-[#073F3C] shadow-sm">Ctrl K</span>
      </button>

      <div className="flex items-center justify-start gap-2 tablet-l:justify-end">
        <Link className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#66736F] shadow-sm hover:text-[#073F3C]" to="/help" aria-label="Open help">
          <HelpCircle className="h-5 w-5" aria-hidden />
        </Link>
        <button className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#66736F] shadow-sm hover:text-[#073F3C]" type="button" aria-label="Notifications">
          <Bell className="h-5 w-5" aria-hidden />
        </button>
        <Link className="flex min-h-11 max-w-[210px] items-center gap-3 rounded-lg bg-white px-3 py-2 text-left shadow-sm" to="/personal/profile">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#E5FEFF] text-[#007970]">
            <User className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-[#14211F]">{userLabel}</span>
            <span className="block truncate text-xs text-[#66736F]">Signed in</span>
          </span>
        </Link>
      </div>
    </header>
  );
}

function WelcomeRail({
  greeting,
  role,
  resumeRoute,
}: {
  greeting: string;
  role: string;
  resumeRoute: string;
}) {
  return (
    <aside className="grid content-start gap-4 rounded-lg bg-white/70 p-5 shadow-[0_15px_36px_rgba(4,43,40,0.12)]">
      <div>
        <p className="font-montserrat text-[11px] font-semibold uppercase tracking-[0.08em] text-[#C74600]">Welcome</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#073F3C]">{greeting}</h1>
        <p className="mt-2 text-sm text-[#66736F]">{role}</p>
      </div>

      <Link
        to={resumeRoute}
        onClick={() => writeRecentRoute('compliance', resumeRoute)}
        className="group grid gap-4 rounded-lg bg-[#073F3C] p-5 text-white shadow-[0_18px_44px_rgba(0,47,48,0.18)] transition hover:-translate-y-1 focus-visible:shadow-[0_0_0_4px_rgba(0,121,112,0.22)]"
      >
        <span className="flex items-center justify-between gap-3 text-sm font-medium">
          Continue where you left off
          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" aria-hidden />
        </span>
        <span className="text-sm text-white/78">{resumeRoute}</span>
      </Link>

      <div className="grid gap-2" aria-label="Quick access">
        <Link className="flex min-h-11 items-center gap-3 rounded-lg bg-[#F7FEFF] px-4 py-3 text-sm font-medium text-[#007970] hover:bg-[#E5FEFF]" to="/iadministrator">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          Ask Brad
        </Link>
        <Link className="flex min-h-11 items-center gap-3 rounded-lg bg-[#FFFAF7] px-4 py-3 text-sm font-medium text-[#C74600] hover:bg-[#FFF2EA]" to="/my-tasks">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          My work
        </Link>
      </div>

      <div className="rounded-lg bg-[#F3F2EE] p-4 text-sm leading-relaxed text-[#524D4B]">
        <div className="mb-2 flex items-center gap-2 font-medium text-[#073F3C]">
          <Lock className="h-4 w-4" aria-hidden />
          Authorization boundary
        </div>
        Sensitive records and executive details load only after destination authorization.
      </div>
    </aside>
  );
}

function WorkspaceLauncherCard({
  enabled,
  lastRoute,
  workspace,
}: {
  enabled: boolean;
  lastRoute: string;
  workspace: ReceptionWorkspace;
}) {
  const styles = accentStyles[workspace.accent];
  const Icon = workspace.icon;
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-lg', styles.panel, styles.text)}>
          <Icon className="h-6 w-6" aria-hidden />
        </span>
        <span className={cx('rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]', styles.badge)}>
          {statusLabel(workspace.status, enabled)}
        </span>
      </div>
      <div className="mt-5">
        <h2 className="text-xl font-semibold text-[#073F3C]">{workspace.name}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#66736F]">{workspace.description}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {workspace.capabilities.map((capability) => (
          <span key={capability} className="rounded bg-[#F3F2EE] px-2.5 py-1 text-xs font-medium text-[#524D4B]">
            {capability}
          </span>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="min-w-0 truncate text-xs text-[#66736F]">{enabled ? lastRoute : 'Ask an administrator for access'}</span>
        <span className={cx('inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold', enabled ? styles.action : 'bg-[#E5E4E3] text-[#66736F]')}>
          {workspace.cta}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </>
  );

  if (!enabled) {
    return (
      <article
        className="min-h-[260px] rounded-lg bg-white p-5 opacity-80 shadow-[0_18px_44px_rgba(0,47,48,0.08)]"
        aria-disabled="true"
      >
        {content}
      </article>
    );
  }

  if (workspace.external) {
    return (
      <a
        href={lastRoute}
        onClick={() => writeRecentRoute(workspace.id, lastRoute)}
        className="group min-h-[260px] rounded-lg bg-white p-5 shadow-[0_18px_44px_rgba(0,47,48,0.10)] transition hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(0,47,48,0.14)] focus-visible:shadow-[0_0_0_4px_rgba(0,121,112,0.18),0_18px_44px_rgba(0,47,48,0.10)]"
        rel="noreferrer"
        target="_blank"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={lastRoute}
      onClick={() => writeRecentRoute(workspace.id, lastRoute)}
      className="group min-h-[260px] rounded-lg bg-white p-5 shadow-[0_18px_44px_rgba(0,47,48,0.10)] transition hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(0,47,48,0.14)] focus-visible:shadow-[0_0_0_4px_rgba(0,121,112,0.18),0_18px_44px_rgba(0,47,48,0.10)]"
    >
      {content}
    </Link>
  );
}

function CommandPalette({
  onClose,
  workspaces,
}: {
  onClose: () => void;
  workspaces: readonly (ReceptionWorkspace & { enabled: boolean; lastRoute: string })[];
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return workspaces.filter((workspace) => {
      if (!normalized) return true;
      return [
        workspace.name,
        workspace.description,
        workspace.status,
        ...workspace.capabilities,
      ].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [query, workspaces]);

  function openWorkspace(workspace: ReceptionWorkspace & { enabled: boolean; lastRoute: string }) {
    if (!workspace.enabled) return;
    writeRecentRoute(workspace.id, workspace.lastRoute);
    onClose();
    if (workspace.external) {
      window.open(workspace.lastRoute, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(workspace.lastRoute);
  }

  function handleResultKeyDown(event: KeyboardEvent<HTMLButtonElement>, workspace: ReceptionWorkspace & { enabled: boolean; lastRoute: string }) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openWorkspace(workspace);
    }
  }

  return (
    <div className="fixed inset-0 z-command grid place-items-start bg-[#073F3C]/35 px-4 py-16" role="presentation" onMouseDown={onClose}>
      <section
        className="mx-auto grid w-full max-w-[720px] gap-3 rounded-lg bg-white p-4 shadow-[0_28px_88px_rgba(4,43,40,0.28)]"
        role="dialog"
        aria-modal="true"
        aria-label="Reception command palette"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <label className="flex min-h-12 items-center gap-3 rounded-lg bg-[#F3F2EE] px-4">
          <Search className="h-5 w-5 shrink-0 text-[#C74600]" aria-hidden />
          <span className="sr-only">Search workspaces</span>
          <input
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-sm text-[#14211F] placeholder:text-[#66736F] focus:outline-none"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') onClose();
            }}
            placeholder="Search workspace, task, policy, module, or prototype"
            value={query}
          />
        </label>
        <div className="grid max-h-[60vh] gap-2 overflow-auto" role="listbox" aria-label="Reception command results">
          {results.map((workspace) => {
            const styles = accentStyles[workspace.accent];
            const Icon = workspace.icon;
            return (
              <button
                key={workspace.id}
                type="button"
                className={cx(
                  'grid min-h-16 grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg px-3 py-2 text-left transition',
                  workspace.enabled ? 'hover:bg-[#F3F2EE]' : 'cursor-not-allowed opacity-60',
                )}
                disabled={!workspace.enabled}
                onClick={() => openWorkspace(workspace)}
                onKeyDown={(event) => handleResultKeyDown(event, workspace)}
                role="option"
              >
                <span className={cx('grid h-10 w-10 place-items-center rounded-lg', styles.panel, styles.text)}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[#073F3C]">{workspace.name}</span>
                  <span className="block truncate text-xs text-[#66736F]">{workspace.lastRoute}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-[#66736F]" aria-hidden />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function ReceptionScreen() {
  const { isDemo, user } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);
  const [recentRoutes, setRecentRoutes] = useState<Partial<Record<ReceptionWorkspaceId, string>>>(() => readRecentRoutes());
  const role = user?.role ?? user?.appRole ?? 'Authenticated user';
  const userLabel = user?.displayName ?? user?.name ?? 'Care Indeed user';
  const greeting = greetingForHour(new Date().getHours());
  const openCommandPalette = useCallback(() => {
    setRecentRoutes(readRecentRoutes());
    setCommandOpen(true);
  }, []);

  useEffect(() => {
    const handler = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openCommandPalette();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openCommandPalette]);

  const enrichedWorkspaces = useMemo(() => {
    const normalizedRole = normalizeRole(role);
    const roleOrdered = [...WORKSPACES].sort((a, b) => {
      const aScore =
        normalizedRole.includes('governing') || normalizedRole.includes('executive') ? (a.id === 'governing-body' ? -2 : 0) :
        normalizedRole.includes('clinician') || normalizedRole.includes('rn') || normalizedRole.includes('lvn') ? (a.id === 'journey' ? -2 : 0) :
        normalizedRole.includes('product') ? (a.id === 'find-home-care' || a.id === 'ehr-prototype' ? -1 : 0) :
        a.id === 'compliance' ? -1 : 0;
      const bScore =
        normalizedRole.includes('governing') || normalizedRole.includes('executive') ? (b.id === 'governing-body' ? -2 : 0) :
        normalizedRole.includes('clinician') || normalizedRole.includes('rn') || normalizedRole.includes('lvn') ? (b.id === 'journey' ? -2 : 0) :
        normalizedRole.includes('product') ? (b.id === 'find-home-care' || b.id === 'ehr-prototype' ? -1 : 0) :
        b.id === 'compliance' ? -1 : 0;
      return aScore - bScore;
    });

    return roleOrdered.map((workspace) => ({
      ...workspace,
      enabled: isWorkspaceAuthorized(workspace, role, isDemo),
      lastRoute: recentRoutes[workspace.id] ?? workspace.route,
    }));
  }, [isDemo, recentRoutes, role]);

  const resumeRoute = recentRoutes.compliance ?? '/compliance';

  return (
    <ReceptionShell>
      <ReceptionHeader onCommandOpen={openCommandPalette} userLabel={userLabel} />
      <div className="grid min-h-0 gap-5 overflow-auto p-5 laptop:grid-cols-[340px_minmax(0,1fr)] laptop:p-6">
        <WelcomeRail greeting={greeting} resumeRoute={resumeRoute} role={role} />
        <section className="grid content-start gap-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-montserrat text-[11px] font-semibold uppercase tracking-[0.08em] text-[#C74600]">Workspace launcher</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#073F3C]">Choose where you are working today</h2>
            </div>
            <p className="max-w-[520px] text-sm leading-relaxed text-[#66736F]">
              Reception keeps orientation light. Counts, patient information, policy content, personnel records, and executive material stay inside authorized products.
            </p>
          </div>
          <div className="grid gap-4 tablet-p:grid-cols-2 xl:grid-cols-3">
            {enrichedWorkspaces.map((workspace) => (
              <WorkspaceLauncherCard
                enabled={workspace.enabled}
                key={workspace.id}
                lastRoute={workspace.lastRoute}
                workspace={workspace}
              />
            ))}
          </div>
        </section>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 bg-white/74 px-5 py-4 text-xs text-[#66736F]">
        <span className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#007970]" aria-hidden />
          Systems nominal
        </span>
        <span className="flex flex-wrap items-center gap-3">
          <Link className="font-medium text-[#073F3C] hover:text-[#007970]" to="/admin/user-groups">Request access</Link>
          <Link className="font-medium text-[#073F3C] hover:text-[#007970]" to="/help">Support</Link>
          <Link className="font-medium text-[#073F3C] hover:text-[#007970]" to="/iadministrator">Brad</Link>
        </span>
      </footer>
      {commandOpen ? (
        <CommandPalette onClose={() => setCommandOpen(false)} workspaces={enrichedWorkspaces} />
      ) : null}
    </ReceptionShell>
  );
}

export function FindHomeCareScreen() {
  return (
    <PrototypeWorkspaceShell
      accent="navy"
      cta="Save intake lead"
      description="Find Home Care is separate from the EHR prototype. This concept focuses on service discovery, care matching, and non-clinical intake routing."
      eyebrow="Find Home Care"
      icon={Home}
      route="/find-home-care"
      title="Care matching prototype"
    >
      <div className="grid gap-4 tablet-p:grid-cols-3">
        {['Care need', 'Location', 'Start window'].map((label, index) => (
          <label className="grid gap-2 rounded-lg bg-white p-4 shadow-[0_18px_44px_rgba(0,47,48,0.08)]" key={label}>
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6A4C00]">{label}</span>
            <input
              className="min-h-11 rounded-lg bg-[#F6F8FC] px-3 text-sm text-[#101F38] focus:outline-none"
              defaultValue={index === 0 ? 'Skilled nursing and personal care' : index === 1 ? 'San Jose, CA' : 'This week'}
            />
          </label>
        ))}
      </div>
      <section className="grid gap-4 tablet-p:grid-cols-2">
        <PrototypePanel title="Recommended pathway" items={['Home health eligibility screen', 'Family intake call', 'Service area confirmation', 'Care coordinator handoff']} />
        <PrototypePanel title="Brand boundary" items={['Consumer-facing experience', 'No chart access', 'No clinical documentation', 'Separate from EHR Prototype']} />
      </section>
    </PrototypeWorkspaceShell>
  );
}

export function EhrPrototypeScreen() {
  return (
    <PrototypeWorkspaceShell
      accent="clinical"
      cta="Open demo chart"
      description="EHR Prototype is a standalone clinical record concept. It is intentionally split from Find Home Care so chart workflows and consumer discovery do not share one product surface."
      eyebrow="EHR Prototype"
      icon={Stethoscope}
      route="/ehr-prototype"
      title="Clinical workspace prototype"
    >
      <div className="grid gap-4 tablet-p:grid-cols-4">
        {[
          ['Charts', '12 demo records'],
          ['Visits', '6 today'],
          ['Orders', '4 pending'],
          ['Messages', '3 secure'],
        ].map(([label, value]) => (
          <div className="rounded-lg bg-white p-4 shadow-[0_18px_44px_rgba(0,47,48,0.08)]" key={label}>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#1A4E8A]">{label}</p>
            <p className="mt-2 text-xl font-semibold text-[#073F3C]">{value}</p>
          </div>
        ))}
      </div>
      <section className="grid gap-4 tablet-p:grid-cols-2">
        <PrototypePanel title="Clinical modules" items={['Patient chart navigation', 'Visit documentation', 'Physician orders', 'Secure messaging']} />
        <PrototypePanel title="Prototype safeguards" items={['Demo records only', 'No PHI preload at Reception', 'Destination auth still required', 'Separated from Find Home Care']} />
      </section>
    </PrototypeWorkspaceShell>
  );
}

function PrototypeWorkspaceShell({
  accent,
  children,
  cta,
  description,
  eyebrow,
  icon: Icon,
  route,
  title,
}: {
  accent: WorkspaceAccent;
  children: ReactNode;
  cta: string;
  description: string;
  eyebrow: string;
  icon: LucideIcon;
  route: string;
  title: string;
}) {
  const styles = accentStyles[accent];

  return (
    <main className="min-h-screen bg-[#F3F2EE] px-5 py-6 text-[#14211F]" data-hash-id={route.replace('/', '')} data-route={route} data-template="prototype">
      <div className="mx-auto grid max-w-[1180px] gap-5">
        <nav className="flex items-center justify-between gap-4" aria-label="Prototype navigation">
          <Link className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-3 text-sm font-medium text-[#073F3C] shadow-sm hover:text-[#007970]" to="/reception">
            <ArrowRight className="h-4 w-4 rotate-180" aria-hidden />
            Reception
          </Link>
          <span className={cx('rounded px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em]', styles.badge)}>Prototype</span>
        </nav>
        <section className="grid gap-5 rounded-lg bg-white p-6 shadow-[0_24px_58px_rgba(0,47,48,0.12)]">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex max-w-[760px] gap-4">
              <span className={cx('grid h-14 w-14 shrink-0 place-items-center rounded-lg', styles.panel, styles.text)}>
                <Icon className="h-7 w-7" aria-hidden />
              </span>
              <div>
                <p className="font-montserrat text-[11px] font-semibold uppercase tracking-[0.08em] text-[#C74600]">{eyebrow}</p>
                <h1 className="mt-2 text-3xl font-semibold text-[#073F3C]">{title}</h1>
                <p className="mt-3 text-sm leading-relaxed text-[#66736F]">{description}</p>
              </div>
            </div>
            <button className={cx('inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold', styles.action)} type="button">
              {cta}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </section>
        {children}
      </div>
    </main>
  );
}

function PrototypePanel({ items, title }: { items: readonly string[]; title: string }) {
  return (
    <article className="rounded-lg bg-white p-5 shadow-[0_18px_44px_rgba(0,47,48,0.08)]">
      <h2 className="text-lg font-semibold text-[#073F3C]">{title}</h2>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li className="flex items-center gap-3 text-sm text-[#524D4B]" key={item}>
            <BookOpen className="h-4 w-4 shrink-0 text-[#C74600]" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
