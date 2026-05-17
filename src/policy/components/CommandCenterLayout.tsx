import { useState, useEffect, useRef, useMemo, type PropsWithChildren } from 'react';
import ciIonLogo from '@/assets/ci-ion-logo.png';
import ciLogoGray from '@/assets/ci-logo-gray.png';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardCheck, Network, FileEdit,
  PlayCircle,
  CalendarDays,
  HelpCircle, Search, ChevronLeft, Menu,
  ShieldCheck, Zap,
  ArrowUpCircle, FolderOpen, UserCheck, Sparkles,
  ListChecks, LogOut, Compass, Trash2,
  Users, Heart,
} from 'lucide-react';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import TravelightBG from '@/components/TravelightBG';
import { useShellStore } from '@/policy/stores/uiStore';
import { useCiModeStore } from '@/policy/stores/ciModeStore';
import { useAuth } from '@/auth/AuthProvider';
import { evaluateAdminAccess } from '@/policy/security/identity';
import { canViewNavItem as canViewNavItemFn } from '@/policy/security/features/featureAccess';
import { useUserAssignmentsStore } from '@/policy/security/identity/userAssignmentsStore';
import { RolloutPhaseBadge } from '@/policy/security/features/RolloutPhaseBadge';
import { PermissionGate } from '@/policy/security/features/PermissionGate';
import { ThemeModeToggle } from '@/policy/components/ui/ThemeModeToggle';
import { 
  ShellFrame, 
  ShellTopbar, 
  ShellNavRail, 
  ShellContentFrame, 
  ShellCommandGroup 
} from '@/policy/components/ui';
import { ContextualKnowledgeBulb } from '@/policy/components/help/ContextualKnowledgeBulb';
import { useNavStore } from '@/policy/stores/navStore';
import { GlobalTaskDrawer } from '@/policy/components/pm/GlobalTaskDrawer';
import { GuidedTourGate, restartGuidedTour } from '@/policy/components/onboarding/GuidedTourGate';
import { GuidedUatWidget } from '@/policy/components/onboarding/GuidedUatWidget';
import { CesRoleReviewSwitcher } from '@/policy/ces/components/review/CesRoleReviewSwitcher';

function BradRobotIcon({ size = 24, strokeWidth = 1.5, className }: { size?: number; strokeWidth?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="4.5" y="7" width="15" height="11" rx="2.25" stroke="currentColor" strokeWidth={strokeWidth} />
      <line x1="12" y1="7" x2="12" y2="4.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx="12" cy="3.25" r="1.25" fill="currentColor" />
      <circle cx="9" cy="12" r="1.25" fill="currentColor" />
      <circle cx="15" cy="12" r="1.25" fill="currentColor" />
      <path d="M9 15.5C10 16.4 11 16.9 12 16.9C13 16.9 14 16.4 15 15.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CANONICAL SHELL — CI-ION premium one-glass design
   TravelightBG backdrop + a SINGLE deep-maroon translucent glass
   canvas that fills the viewport. All page content lives on this
   one glass — no stacked sub-cards.
   ═══════════════════════════════════════════════════════════════ */

interface NavSubItem {
  to: string;
  label: string;
}
interface NavItem {
  id: string;
  to: string;
  label: string;
  subItems?: NavSubItem[];
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  /**
   * Maps this nav item to a feature catalog id. When set, the item is
   * hidden from users whose role/group does not pass canViewNavItem.
   * Items without a featureId are visible to all authenticated users.
   */
  featureId?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', to: '/dashboard', label: 'Command Center', subItems: [{ to: '/dashboard', label: 'Overview' }], icon: LayoutDashboard, featureId: 'dashboard.view' },
  { id: 'clinician-profiles', to: '/clinicians', label: 'Clinician Profiles', icon: Users, featureId: 'clinicians.view' },
  { id: 'patient-profiles', to: '/patients', label: 'Patient Profiles', icon: Heart, featureId: 'patients.view' },
  { id: 'staffing-calendar', to: '/staffing-calendar', label: 'Calendar', icon: CalendarDays, featureId: 'staffing.calendar.view' },
  { id: 'iadmin', to: '/iadministrator', label: 'Brad', icon: BradRobotIcon, featureId: 'brad.view' },
  {
    id: 'ces', to: '/ces/dashboard', label: 'Compliance Execution (CES)',
    subItems: [
      { to: '/ces/dashboard',         label: 'Dashboard' },
      { to: '/calendar?view=sprint',  label: 'Calendar (Calendar/Sprint)' },
      { to: '/ces/board',             label: 'Sprint Board' },
      { to: '/workflows',             label: 'Workflows' },
      { to: '/compliance/master-controls', label: 'Master Controls' },
      { to: '/audit',                 label: 'Audit Mode' },
      { to: '/evidence',              label: 'Evidence Center' },
      { to: '/ces/reports',           label: 'Reports' },
    ],
    icon: ClipboardCheck,
    featureId: 'ces.view',
  },
  { id: 'taxonomy', to: '/framework', label: 'Taxonomy', subItems: [{ to: '/framework', label: 'Framework' }, { to: '/library', label: 'Policies' }, { to: '/forms', label: 'Forms' }], icon: Network, featureId: 'frameworkTaxonomy.view' },
  {
    id: 'onboarding', to: '/journey', label: 'Onboarding',
    subItems: [
      { to: '/journey',             label: 'Overview' },
      { to: '/journey/v1-journey',  label: 'Journey v1' },
      { to: '/journey/appendix-f',  label: 'Appendix F' },
      { to: '/journey/supervisor',  label: 'Supervisor View' },
      { to: '/journey/admin',       label: 'Admin' },
      { to: '/journey/guide',       label: 'User Guide' },
    ],
    icon: UserCheck,
    featureId: 'journey.view',
  },
  {
    id: 'onboarding-v2', to: '/onboarding-v2/dashboard', label: 'Onboarding v2',
    subItems: [
      { to: '/onboarding-v2/dashboard',  label: 'Dashboard' },
      { to: '/onboarding-v2/activate',   label: 'Activate Subject' },
      { to: '/onboarding-v2/batches',    label: 'Batches' },
      { to: '/onboarding-v2/audit',      label: 'Audit Readiness' },
      { to: '/onboarding-v2/governance', label: 'Governance' },
    ],
    icon: Sparkles,
    featureId: 'onboardingV2.view',
  },
  { id: 'lifecycle', to: '/policy-lifecycle', label: 'Policy Lifecycle', icon: FileEdit, featureId: 'policyLifecycle.view' },
  { id: 'evidence', to: '/evidence', label: 'Evidence', icon: FolderOpen, featureId: 'evidence.view' },
  { id: 'hubstaff', to: '/hubstaff', label: 'Hubstaff', icon: ArrowUpCircle, featureId: 'hubstaff.view' },
  {
    id: 'system-documentation',
    to: '/system-documentation',
    label: 'System Documentation',
    subItems: [
      { to: '/system-documentation/executive-overview', label: 'Executive Overview' },
      { to: '/system-documentation/system-architecture', label: 'System Architecture' },
      { to: '/system-documentation/identity-access', label: 'Identity & Access' },
      { to: '/system-documentation/workflow-enforcement', label: 'Workflow & Enforcement' },
      { to: '/system-documentation/training-system', label: 'Training System' },
      { to: '/system-documentation/audit-evidence', label: 'Audit & Evidence' },
      { to: '/system-documentation/aws-infrastructure', label: 'AWS Infrastructure' },
      { to: '/system-documentation/hipaa-gap-analysis', label: 'HIPAA Gap Analysis' },
      { to: '/system-documentation/production-roadmap', label: 'Production Roadmap' },
    ],
    icon: FolderOpen,
    featureId: 'systemDocumentation.view',
  },
  { id: 'help', to: '/help', label: 'Help Center', icon: HelpCircle, featureId: 'helpCenter.view' },
  { id: 'demo', to: '/demo', label: 'Demo', icon: PlayCircle, featureId: 'demo.view' },
];

/**
 * Mobile primary tab bar (5 slots).
 *
 * Wave 2 — MVP plan §1 mobile nav slot update:
 *   Workflows → Evidence
 * Rationale: Field operators rely on Evidence Center for daily incident /
 * evidence capture; Workflows surface is desktop-led. The Evidence slot
 * keeps the 5-slot grid intact (parity with prior layout) and the route
 * (`/evidence`) is feature-flag gated by `evidence.view` in App.tsx, so
 * users without permission silently lose the tab — no broken nav target.
 *
 * Workflows remains reachable from desktop nav and from /more menu (deep link).
 */
const MOBILE_PRIMARY_TABS: Array<{ id: string; to: string; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }> }> = [
  { id: 'dashboard', to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'tasks', to: '/my-tasks', label: 'Tasks', icon: ListChecks },
  { id: 'evidence', to: '/evidence', label: 'Evidence', icon: FolderOpen },
  { id: 'more', to: '/help', label: 'More', icon: UserCheck },
];

// ── Viewport detection (mobile vs. desktop) ──────────────
const MOBILE_BP = 1024;
const LOCAL_DEMO_AUTH_BYPASS = import.meta.env.VITE_LOCAL_DEMO_AUTH_BYPASS === 'true';

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < MOBILE_BP);
  useEffect(() => {
    const update = () => setMobile(window.innerWidth < MOBILE_BP);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return mobile;
}

function resolveActiveNav(pathname: string, navItems: NavItem[]): NavItem {
  for (const item of navItems) {
    if (item.subItems) {
      for (const sub of item.subItems) {
        const subPath = sub.to.split('?')[0].split('#')[0];
        if (pathname === subPath || pathname.startsWith(subPath + '/')) return item;
      }
    }
     const itemPath = item.to.split('?')[0].split('#')[0];
     if (pathname === itemPath || pathname.startsWith(itemPath + '/')) return item;
  }
  return navItems[0];
}

export function CommandCenterLayout({ children }: PropsWithChildren) {
  const [launching] = useState(false);
  const [splashExit] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<NavItem | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, isAuthenticated, logout } = useAuth();
  const showSplash = !LOCAL_DEMO_AUTH_BYPASS && !isAuthenticated && location.pathname === '/';

  const adminAccess = useMemo(() => evaluateAdminAccess(user), [user]);
  const adminNavItem: NavItem | null = adminAccess.allowed
    ? {
        id: 'admin',
        to: '/admin/user-groups',
        label: 'Admin',
        subItems: [
          { to: '/admin/user-groups', label: 'User Groups' },
          { to: '/admin/roles', label: 'Roles' },
          { to: '/admin/permissions', label: 'Permissions' },
          { to: '/admin/users', label: 'User Assignments' },
        ],
        icon: ShieldCheck,
        featureId: 'admin.permissions.view',
      }
    : null;
  // Subscribe to assignment changes so nav re-renders when admins
  // add / remove role assignments from the User Groups page.
  const _assignmentsRev = useUserAssignmentsStore(s => s.assignments);
  const _usersRev = useUserAssignmentsStore(s => s.users);
  const fullNavItems = adminNavItem ? [...NAV_ITEMS, adminNavItem] : NAV_ITEMS;
  const allNavItems = useMemo(
    () => fullNavItems.filter(item => !item.featureId || canViewNavItemFn(user, item.featureId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, _assignmentsRev, _usersRev, adminAccess.allowed],
  );

  const detailMode = useShellStore(s => s.detailMode);
  const theme = useShellStore(s => s.theme);
  const toggleTheme = useShellStore(s => s.toggleTheme);
  const isCareIndeed = theme === 'care-indeed-light';
  const isLight = isCareIndeed;
  const ciMode = useCiModeStore(s => s.mode);
  // When brand is Care Indeed, ALWAYS render the flat light backdrop —
  // never the maroon TravelightBG. The orthogonal `ciMode` only affects
  // typography/glass tinting, never the global page background. This
  // prevents the white→maroon→white flash during login/route transitions
  // when a stale `ci-care-indeed-mode=dark` is in localStorage.
  const isCareIndeedDark = isCareIndeed && ciMode === 'dark';
  const isVisualLight = isCareIndeed;
  const logo = isCareIndeed ? ciLogoGray : ciIonLogo;
  const accountDisplayName = useMemo(() => {
    const firstName = user?.firstName?.trim();
    const lastName = user?.lastName?.trim();
    if (firstName || lastName) {
      return [firstName, lastName].filter(Boolean).join(' ');
    }

    const fullName = user?.name?.trim();
    if (fullName) {
      return fullName;
    }

    // Derive display name from email when no name attributes are set
    // e.g. dee.bustos@careindeed.com → 'Dee Bustos'
    const emailLocal = user?.email?.split('@')[0];
    if (emailLocal) {
      const parts = emailLocal.split(/[._-]+/).filter(Boolean);
      if (parts.length >= 2) {
        return parts.slice(0, 2).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
      }
      if (parts.length === 1 && parts[0].length > 0) {
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
      }
    }

    return 'Account';
  }, [user?.firstName, user?.lastName, user?.name, user?.email]);
  const accountInitials = useMemo(() => {
    const nameParts = accountDisplayName
      .split(/\s+/)
      .map(part => part.trim())
      .filter(Boolean);
    const initials = nameParts.slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('');

    return initials || 'AC';
  }, [accountDisplayName]);
  const accountRole = useMemo(() => {
    const raw = user?.role?.trim();
    if (!raw) return 'User';

    return raw
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, c => c.toUpperCase());
  }, [user?.role]);

  // Route-based detail detection (for detail pages opened via URL).
  const pathIsDetail =
    /^\/library\/.+/.test(location.pathname) ||
    /^\/gv-policy\/.+/.test(location.pathname) ||
    /^\/forms\/.+/.test(location.pathname);
  const hideChrome = detailMode || pathIsDetail;
  const hideGlobalSearch = /^\/(library|help|iadministrator)(?:\/|$)/.test(location.pathname);

  const currentNav = resolveActiveNav(location.pathname, allNavItems);
  const isMobileTabActive = (to: string) => {
    const tabPath = to.split('?')[0].split('#')[0];
    return location.pathname === tabPath || location.pathname.startsWith(`${tabPath}/`);
  };

  // ── Nav icons click-to-expand sub-navigation ───────────────────────────────
  const [expandedNavId, setExpandedNavId] = useState<string | null>(null);

  const VISIBLE_NAV = allNavItems.filter(item => item.id !== 'onboarding-v2' && item.id !== 'dashboard');
  const activeDropdownNavId = useMemo(() => {
    if (!expandedNavId) return null;
    const expandedItem = VISIBLE_NAV.find(item => item.id === expandedNavId);
    return expandedItem?.subItems?.length ? expandedItem.id : null;
  }, [expandedNavId, VISIBLE_NAV]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // ── Care Indeed Light/Dark mode (orthogonal to brand toggle) ──────────────
  useEffect(() => {
    document.documentElement.dataset.ciMode = ciMode;
  }, [ciMode]);

  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAccountMenuOpen]);

  const handleMyTasksClick = () => {
    setIsAccountMenuOpen(false);
    navigate('/my-tasks');
  };

  const handleLogoutClick = async () => {
    setIsAccountMenuOpen(false);
    await logout();
    navigate('/login');
  };

  // ── Route tracker — feed every pathname change into the nav store ─────────
  const prevPathRef = useRef<string | null>(null);
  useEffect(() => {
    const path = location.pathname;
    if (path !== prevPathRef.current) {
      prevPathRef.current = path;
      useNavStore.getState().push(path);
    }
  }, [location.pathname]);

  // Global keyboard ArrowLeft/ArrowRight + touch-swipe navigation removed
  // (Stabilization N-01/N-02; MVP plan §6 / L840–L841). Browser back/forward
  // buttons remain the canonical navigation primitive. Per-surface arrow-key
  // navigation (e.g. LMS module player) is owned locally by those surfaces,
  // not by the global shell. `useNavStore` is still used by the route tracker
  // above for the shell breadcrumb history.

  return (
    <ShellFrame>
      {/* ── 1. Premium background (TravelightBG) — fills viewport ── */}
      <TravelightBG isLight={isVisualLight} />

      {/* ── 2. Single premium glass canvas — near-fullscreen ── */}
      <div data-shell-outer="" className={`fixed inset-0 ${isVisualLight ? 'text-slate-800' : 'text-[#E0E0E0]'}`} style={{ zIndex: 1 }}>
        <div
          data-shell-card=""
          className={`absolute overflow-hidden ${isMobile ? 'inset-0 rounded-none' : 'rounded-3xl md:rounded-[2rem]'}`}
          style={{
            ...(isMobile
              ? {}
              : {
                  top:    'clamp(16px, 1.6vw, 28px)',
                  bottom: 'clamp(16px, 1.6vw, 28px)',
                  left:   'clamp(16px, 1.6vw, 28px)',
                  right:  'clamp(16px, 1.6vw, 28px)',
                }),

            /* ── Glass surface ──
               Light  : Care Indeed single sheet of paper. Solid white
                        surface, 1px #E5E4E3 hairline, almost-invisible
                        outer shadow. (No glass/blur on the light Layer 1;
                        per Lead 1 light-mode rule + Lead 16 C1 glass-stack
                        budget — Layer 1 must not stack blur on top of
                        Layer 0.)
               Dark   : CI-ION maroon glass at 30.44% (7.77% reduction
                        from 33%); full opacity in detail mode. */
            ...(isVisualLight
              ? {
                  // Care Indeed light mode — one-card canvas matching
                  // the Workflow Library aesthetic. Solid white surface,
                  // 1px #E5E4E3 hairline, almost-invisible outer shadow
                  // for subtle elevation against the #FAFBF8 gutter.
                  background: '#FFFFFF',
                  border: '1px solid #E5E4E3',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }
              : isCareIndeedDark
                ? {
                    background: 'linear-gradient(160deg, rgba(27,49,51,0.78) 0%, rgba(14,27,28,0.78) 100%)',
                    backdropFilter: 'blur(20px) saturate(120%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(120%)',
                    border: '1px solid rgba(122,222,223,0.18)',
                    boxShadow: '0 22px 48px -16px rgba(0,0,0,0.65), inset 0 1px 0 rgba(122,222,223,0.06)',
                  }
              : {
                  background: hideChrome
                    ? 'linear-gradient(160deg, rgba(66,8,8,1) 0%, rgba(10,2,2,1) 100%)'
                    : 'linear-gradient(160deg, rgba(66,8,8,0.3044) 0%, rgba(10,2,2,0.3044) 100%)',
                  backdropFilter: 'blur(22px) saturate(145%)',
                  WebkitBackdropFilter: 'blur(22px) saturate(145%)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  boxShadow:
                    '0 40px 120px -30px rgba(0,0,0,0.85), 0 18px 48px -18px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07), inset 0 0 0 1px rgba(255,255,255,0.015)',
                }),
          }}
        >

          {/* ── 3. Content wrapper ── */}
          <div className="flex w-full h-full relative">

            {showSplash ? (
              /* ══════════════════════════════════════════
                 4. SPLASH VIEW — CI-ION Premium
                 ══════════════════════════════════════════ */
              <div
                className="absolute inset-0 z-[60] flex items-center justify-center animate-in fade-in duration-700 p-8 md:p-20"
                style={{
                  transition: 'opacity 700ms cubic-bezier(.22,1,.36,1)',
                  opacity: splashExit ? 0 : 1,
                  pointerEvents: splashExit ? ('none' as const) : ('auto' as const),
                  background: '#FFFFFF',
                }}
              >
                {/* Splash inner card — brand-aligned enterprise panel.
                    Light: clean surface with a 1px neutral-200 border
                    on top of the solid-white shell. Dark: hairline on
                    the CI-ION maroon glass. Never uses blur / glass in
                    light mode. */}
                <div
                  className="relative flex flex-col items-center justify-between"
                  style={{
                    width: 'min(440px, calc(100vw - 64px))',
                    minHeight: 580,
                    padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.5rem, 3vw, 2.5rem)',
                    borderRadius: '24px',
                    background: '#FFFFFF',
                    border: '1px solid #E5E4E3',
                  }}
                >
                  <div className="w-full flex flex-col items-center gap-8 relative z-10">
                    {/* Splash logo → theme toggle (both views) */}
                    <button
                      type="button"
                      onClick={toggleTheme}
                      aria-label={`Switch to ${isCareIndeed ? 'CI-ION dark' : 'Care Indeed light'} theme`}
                      title={`Switch to ${isCareIndeed ? 'CI-ION dark' : 'Care Indeed light'} theme`}
                      className="group rounded-xl p-1 hover:scale-[1.03] transition-transform cursor-pointer focus-visible:outline-offset-4"
                    >
                      <img
                        src={logo}
                        alt={`Care Indeed — click to switch to ${isCareIndeed ? 'CI-ION dark' : 'Care Indeed light'} theme`}
                        className={`h-14 w-auto object-contain ${isCareIndeed ? '' : 'drop-shadow-2xl'}`}
                        style={isCareIndeed ? { opacity: 1 } : { opacity: 0.95 }}
                      />
                    </button>

                    {/* Status pill — brand-aligned. Light: white surface,
                        neutral-300 border, neutral-500 body text
                        (WCAG AA on #FFF), teal dot. */}
                    <div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                      role="status"
                      aria-live="polite"
                      style={{
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                        letterSpacing: '.25em',
                        border: `1px solid ${
                          launching
                            ? '#C74601'
                            : '#D1D1D1'
                        }`,
                        background: launching
                          ? '#FFEEE5'
                          : '#FFFFFF',
                        color: launching
                          ? '#C74601'
                          : '#52404B',
                        transition: 'all .3s ease',
                      }}
                    >
                      <span style={{ position: 'relative', display: 'flex', height: 6, width: 6 }}>
                        <span
                          style={{
                            position: 'absolute',
                            display: 'inline-flex',
                            height: '100%',
                            width: '100%',
                            borderRadius: '50%',
                            opacity: 0.75,
                            background: launching ? '#C74601' : '#007970',
                            animation: 'splashPing 1s cubic-bezier(0,0,.2,1) infinite',
                          }}
                        />
                        <span
                          style={{
                            position: 'relative',
                            display: 'inline-flex',
                            borderRadius: '50%',
                            height: 6,
                            width: 6,
                            background: launching ? '#C74601' : '#007970',
                          }}
                        />
                      </span>
                      {launching ? 'AUTHENTICATING' : 'SYSTEM READY'}
                    </div>

                    {/* Title — solid brand tokens only. No gradient clip.
                        Fixes the "text disappears after theme switch" bug. */}
                    <div className="text-center w-full">
                      <h1
                        className="font-heading mb-3"
                        style={{
                          fontSize: '1.75rem',
                          fontWeight: 500,
                          lineHeight: 1.15,
                          letterSpacing: '-0.01em',
                          color: '#1F1C1B',
                        }}
                      >
                        Enterprise Policy
                        <br />
                        <span style={{ fontWeight: 600, color: '#C74601' }}>
                          Architecture
                        </span>
                      </h1>
                      <p
                        className="font-body uppercase"
                        style={{
                          fontSize: 10,
                          letterSpacing: '.35em',
                          fontWeight: 500,
                          color: '#747474',
                        }}
                      >
                        Policy Command Workspace
                      </p>
                    </div>
                  </div>

                  <div className="w-full flex flex-col items-center gap-6 relative z-10 mt-8">
                    <p
                      className="text-center font-body"
                      style={{
                        fontSize: 13,
                        lineHeight: 1.55,
                        fontWeight: 400,
                        color: '#52404B',
                      }}
                    >
                      Launch the Care Indeed policy environment and access your compliance workspace.
                    </p>

                    {/* Auth CTAs on the classic splash layout. */}
                    <div className="w-full px-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate('/login')}
                        disabled={launching}
                        type="button"
                        aria-label="Login to Care Indeed policy environment"
                        className="relative w-full font-heading"
                        style={{
                          padding: '1rem 1.5rem',
                          borderRadius: '12px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '.18em',
                          fontSize: '.82rem',
                          color: '#FFFFFF',
                          cursor: launching ? 'wait' : 'pointer',
                          background: launching ? '#421700' : '#C74601',
                          border: 'none',
                          outline: 'none',
                          overflow: 'hidden',
                          transition: 'background-color .2s ease',
                        }}
                        onMouseEnter={e => {
                          if (!launching) e.currentTarget.style.background = '#421700';
                        }}
                        onMouseLeave={e => {
                          if (!launching) e.currentTarget.style.background = '#C74601';
                        }}
                      >
                        Login
                      </button>

                      <button
                        onClick={() => navigate('/register')}
                        type="button"
                        aria-label="Register for Care Indeed policy environment"
                        className="relative w-full font-heading"
                        style={{
                          padding: '1rem 1.5rem',
                          borderRadius: '12px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '.18em',
                          fontSize: '.82rem',
                          color: '#C74601',
                          cursor: 'pointer',
                          background: 'transparent',
                          border: '1px solid rgba(199,70,1,0.45)',
                          outline: 'none',
                        }}
                      >
                        Register
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full pt-2">
                      {[
                        { icon: ShieldCheck, label: 'Compliance' },
                        { icon: Network, label: 'Framework' },
                        { icon: Zap, label: 'Authoring' },
                      ].map(({ icon: Icon, label }) => (
                        <div
                          key={label}
                          className="flex flex-col items-center gap-1.5 font-heading"
                          style={{ color: '#52404B' }}
                        >
                          <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
                          <span className="font-semibold uppercase" style={{ fontSize: 9, letterSpacing: '.18em' }}>{label}</span>
                        </div>
                      ))}
                    </div>

                    <div
                      className="text-center font-body"
                      style={{
                        fontSize: 10,
                        letterSpacing: '.1em',
                        fontWeight: 400,
                        color: isVisualLight ? '#747474' : 'rgba(255,255,255,0.55)',
                      }}
                    >
                      © 2026 CareIndeed · Policy Command Center
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* ══════════════════════════════════════════
                    FULL-SCREEN MODAL MENU
                   ══════════════════════════════════════════ */}
                {isMenuOpen && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center animate-in fade-in duration-500">
                    <div
                      className="absolute inset-0 cursor-pointer"
                      style={{
                        // Stabilization U-13 / MVP §C1 (Lead 16 C1) — full-screen
                        // menu scrim sits over the already-blurred shell. Stacking
                        // a second backdrop-filter on this overlay would push the
                        // file past the max-3 glass-layer budget; the 0.65 dark
                        // opacity (and solid white on light) dims sufficiently
                        // on its own.
                        background: isVisualLight
                          ? '#FFFFFF'
                          : 'rgba(10,2,2,0.65)',
                      }}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setActiveSubMenu(null);
                      }}
                    />
                    <div className="relative z-10 w-full max-w-5xl px-4 sm:px-8 flex justify-center items-center pointer-events-none">
                      <div className="pointer-events-auto w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
                        {!activeSubMenu ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 sm:gap-x-12 gap-y-10 sm:gap-y-16 md:gap-y-20 animate-in zoom-in-95 duration-500">
                            {VISIBLE_NAV.map((item) => {
                              const isActive = currentNav.id === item.id;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => {
                                    if (item.subItems) {
                                      setActiveSubMenu(item);
                                    } else {
                                      navigate(item.to);
                                      setIsMenuOpen(false);
                                    }
                                  }}
                                  className="flex flex-col items-center justify-center gap-3 sm:gap-6 group outline-none min-h-[44px]"
                                >
                                  <span style={isActive ? { color: isCareIndeed ? '#007970' : '#FFC107' } : undefined}>
                                    <item.icon
                                      size={36}
                                      strokeWidth={1}
                                      className={`icon-interactive group-hover:scale-110 sm:[&]:!w-12 sm:[&]:!h-12 ${isActive ? '!opacity-100' : isVisualLight ? 'text-slate-700' : 'text-white'}`}
                                    />
                                  </span>
                                  <span
                                    className={`icon-interactive text-xs sm:text-lg font-light uppercase tracking-[0.18em] sm:tracking-[0.2em] text-center inline-flex items-center justify-center ${isActive ? '!opacity-100' : isVisualLight ? 'text-slate-700' : 'text-white'}`}
                                    style={isActive ? { color: isCareIndeed ? '#007970' : '#FFC107' } : undefined}
                                  >
                                    {item.label}
                                    {item.featureId && <RolloutPhaseBadge featureId={item.featureId} />}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center animate-in slide-in-from-right-8 fade-in duration-500">
                            <button
                              onClick={() => setActiveSubMenu(null)}
                              className={`mb-16 flex items-center gap-3 ${isVisualLight ? 'hover:text-slate-900' : 'hover:text-white'} transition-colors uppercase tracking-[0.2em] font-bold text-sm`}
                              style={{ color: isCareIndeed ? '#007970' : '#FFC107' }}
                            >
                              <ChevronLeft size={18} /> Back to Main Menu
                            </button>
                            <h3 className={`text-2xl font-light ${isVisualLight ? 'text-slate-700' : 'text-white/40'} uppercase tracking-[0.3em] mb-12 flex items-center gap-4`}>
                              <activeSubMenu.icon size={28} strokeWidth={1} />
                              {activeSubMenu.label}
                            </h3>
                            <div className="flex flex-col gap-8 items-center">
                              {activeSubMenu.subItems!.map((sub, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    navigate(sub.to);
                                    setIsMenuOpen(false);
                                    setActiveSubMenu(null);
                                  }}
                                  className="group text-5xl md:text-6xl font-light outline-none"
                                >
                                  <span className={`icon-interactive uppercase tracking-[0.1em] ${isVisualLight ? 'text-slate-900' : 'text-white'} block group-hover:scale-105`}>
                                    {sub.label}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════
                    MAIN APP CONTENT
                   ══════════════════════════════════════════ */}
                <div className={`flex-1 flex flex-col relative z-10 w-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMenuOpen ? 'blur-[12px] opacity-30 scale-[0.98]' : ''} ${isMobile ? 'pb-16' : ''}`}>

                  {!hideChrome && (
                    <header className="w-full px-2 sm:px-4 md:px-6 lg:px-8 pt-2 sm:pt-4 md:pt-5 pb-1 shrink-0 relative z-20 ci-shell-topbar">
                      {/* ── Main nav row: Logo · Nav icons · Right controls ── */}
                      <div className="ci-toolbar-wrap justify-between">
                        {/* Left: Logo + horizontal nav icons */}
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Logo — theme toggle, +33% larger */}
                          <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${isCareIndeed ? 'CI-ION Dark' : 'Care Indeed Light'} theme`}
                            className="cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
                          >
                            <img
                              src={logo}
                              alt="Care Indeed — theme toggle"
                              className={`h-8 md:h-11 w-auto object-contain ${isCareIndeed ? '' : 'drop-shadow-md'}`}
                              style={isCareIndeed ? undefined : { filter: 'brightness(0) invert(1)', opacity: 0.95 }}
                            />
                          </button>

                          {/* Horizontal nav icons — desktop (item-20 gradient pill expand) */}
                          {!isMobile && (
                            <nav className="flex items-center gap-1 ml-2 ci-shell-command-group p-1" aria-label="Main navigation">
                              {VISIBLE_NAV.map(item => {
                                const isActive = currentNav.id === item.id;
                                const isExpanded = expandedNavId === item.id;
                                return (
                                  <div
                                    key={item.id}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setExpandedNavId(item.subItems?.length ? item.id : null);
                                        navigate(item.to);
                                      }}
                                      aria-label={item.label}
                                      title={item.label}
                                      aria-current={isActive ? 'page' : undefined}
                                      className="flex items-center justify-center ci-shell-nav-icon-btn ci-subtle-hover"
                                      style={{
                                        width: 38,
                                        height: 38,
                                        padding: 0,
                                        borderRadius: 19,
                                        transition: 'background-color 0.08s ease, color 0.08s ease, box-shadow 0.08s ease',
                                        background: isExpanded || isActive
                                          ? isVisualLight
                                            ? 'linear-gradient(135deg,#007970,#00b4aa)'
                                            : 'linear-gradient(135deg,#b8860b,#FFC107)'
                                          : 'transparent',
                                        border: isActive
                                          ? `1px solid ${isCareIndeed ? 'rgba(0,121,112,0.35)' : 'rgba(255,193,7,0.3)'}`
                                          : '1px solid transparent',
                                        color: isExpanded || isActive
                                          ? isVisualLight ? '#fff' : '#0a0202'
                                          : isVisualLight ? '#374151' : 'rgba(255,255,255,0.65)',
                                        boxShadow: isExpanded
                                          ? isCareIndeed
                                            ? '0 4px 14px rgba(0,121,112,0.3)'
                                            : '0 4px 14px rgba(255,193,7,0.22)'
                                          : 'none',
                                      }}
                                    >
                                      <item.icon size={17} strokeWidth={1.5} />
                                    </button>
                                  </div>
                                );
                              })}
                            </nav>
                          )}

                          {/* Hamburger — mobile only */}
                          {isMobile && (
                            <button
                              onClick={() => { setIsMenuOpen(!isMenuOpen); setActiveSubMenu(null); }}
                              aria-label="Open navigation menu"
                              className={`glass-interactive ci-subtle-hover flex items-center justify-center w-11 h-11 rounded-full ${isVisualLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/70 hover:text-white'} border border-transparent`}
                            >
                              <Menu size={22} />
                            </button>
                          )}
                        </div>

                        {/* Right: Search + Help + Account */}
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 ml-auto">
                          {!hideGlobalSearch && (
                            <div
                              className={`hidden lg:flex items-center bg-transparent border rounded-full px-4 py-2 w-[clamp(180px,18vw,300px)] transition-all ci-shell-command-group ${
                                isVisualLight
                                  ? 'border-slate-300 focus-within:border-[#007970]/60'
                                  : 'border-white/10 focus-within:border-[#FFC107]/50'
                              }`}
                            >
                              <Search size={14} className={`${isVisualLight ? 'text-slate-400' : 'text-white/30'} mr-3 shrink-0`} aria-hidden="true" />
                              <label htmlFor="ci-global-search" className="sr-only">
                                Search policies
                              </label>
                              <input
                                id="ci-global-search"
                                type="text"
                                placeholder="Search policies..."
                                className={`bg-transparent border-none outline-none ${isVisualLight ? 'text-slate-900 placeholder-slate-500' : 'text-white placeholder-white/40'} text-xs w-full font-light`}
                              />
                            </div>
                          )}
                          {/* Care Indeed Light/Dark mode toggle.
                              SEPARATE from the logo brand toggle.
                              Only renders when brand = Care Indeed. */}
                          {isLight && <ThemeModeToggle />}
                            <ContextualKnowledgeBulb />
                          <div className="relative shrink-0" ref={accountMenuRef}>
                            <button
                              type="button"
                              aria-label={`Account: ${accountDisplayName}`}
                              aria-haspopup="menu"
                              onClick={() => setIsAccountMenuOpen(v => !v)}
                              className="glass-interactive ci-subtle-hover flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-full text-white font-bold text-sm cursor-pointer relative border border-transparent"
                              style={{
                                background: isVisualLight
                                  ? '#007970'
                                  : isCareIndeedDark
                                    ? '#1B4549'
                                  : 'linear-gradient(135deg, rgba(93,14,14,0.9), rgba(49,7,7,0.9))',
                              }}
                            >
                              {accountInitials}
                              <span
                                aria-hidden="true"
                                className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full"
                                style={{
                                  background: isCareIndeed ? '#C74600' : '#FFC107',
                                }}
                              />
                            </button>

                            {isAccountMenuOpen && (
                              <div
                                role="menu"
                                aria-label="Account menu"
                                className="absolute right-0 mt-2 w-[220px] rounded-xl overflow-hidden ci-shell-command-group"
                                style={{
                                  background: isVisualLight ? '#FFFFFF' : 'rgba(23,19,19,0.96)',
                                  border: isVisualLight ? '1px solid #E5E4E3' : '1px solid rgba(255,255,255,0.12)',
                                  boxShadow: isVisualLight
                                    ? '0 12px 28px rgba(0,0,0,0.12)'
                                    : '0 16px 36px rgba(0,0,0,0.45)',
                                }}
                              >
                                <div
                                  className="px-3.5 py-3 border-b"
                                  style={{ borderColor: isVisualLight ? '#E5E4E3' : 'rgba(255,255,255,0.11)' }}
                                >
                                  <p className={`text-[13px] font-semibold ${isVisualLight ? 'text-slate-900' : 'text-white'}`}>
                                    {accountDisplayName}
                                  </p>
                                  <p className={`text-[11px] mt-0.5 ${isVisualLight ? 'text-slate-500' : 'text-white/65'}`}>
                                    {accountRole}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={handleMyTasksClick}
                                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] transition-colors ${
                                    isVisualLight
                                      ? 'text-slate-700 hover:bg-slate-100'
                                      : 'text-white/85 hover:bg-white/10'
                                  }`}
                                >
                                  <ListChecks size={16} />
                                  My Tasks
                                </button>

                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => { setIsAccountMenuOpen(false); restartGuidedTour(); }}
                                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] transition-colors ${
                                    isVisualLight
                                      ? 'text-slate-700 hover:bg-slate-100'
                                      : 'text-white/85 hover:bg-white/10'
                                  }`}
                                >
                                  <Compass size={16} />
                                  Restart Guided Tour
                                </button>

                                {/* Robert-only CES review role switcher — renders null for all other users */}
                                <CesRoleReviewSwitcher
                                  userEmail={user?.email}
                                  userId={user?.id}
                                  isLight={isVisualLight}
                                />

                                {/* Nuclear reset — gated by system.replay permission
                                    AND by the protected TJ Padilla user id (defense in depth) */}
                                {user?.id === 'demo-user-careindeed' && (
                                  <PermissionGate permissionId="system.replay">
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        if (window.confirm('RESET ALL?\n\nThis deletes every signed form, uploaded evidence, task completion, form instance, approval, and certification.\n\nCannot be undone.')) {
                                          useRegulatoryExecutionStore.getState().resetAll();
                                          window.location.reload();
                                        }
                                      }}
                                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
                                        isVisualLight
                                          ? 'text-red-700 hover:bg-red-50'
                                          : 'text-red-400 hover:bg-red-500/15'
                                      }`}
                                    >
                                      <Trash2 size={16} />
                                      Reset All Data
                                    </button>
                                  </PermissionGate>
                                )}

                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => { void handleLogoutClick(); }}
                                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] transition-colors ${
                                    isVisualLight
                                      ? 'text-[#C74600] hover:bg-orange-50'
                                      : 'text-[#FFC107] hover:bg-white/10'
                                  }`}
                                >
                                  <LogOut size={16} />
                                  Logout
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dropdown sub-items — one horizontal row below the clicked nav icon */}
                      {!isMobile && activeDropdownNavId && (() => {
                        const hi = VISIBLE_NAV.find(i => i.id === activeDropdownNavId);
                        if (!hi?.subItems?.length) return null;
                        return (
                          <nav
                            aria-label={`${hi.label} sub-navigation`}
                            className="ci-shell-subnav custom-scrollbar-x justify-start"
                          >
                            {hi.subItems.map(sub => {
                              const subPath = sub.to.split('?')[0];
                              const isSubActive = location.pathname === subPath || location.pathname.startsWith(subPath + '/');
                              return (
                                <button
                                  key={sub.to}
                                  type="button"
                                  onClick={() => navigate(sub.to)}
                                  className="font-heading ci-shell-subnav-chip"
                                  style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    padding: '4px 10px',
                                    borderRadius: 10,
                                    whiteSpace: 'nowrap',
                                    background: isSubActive
                                      ? (isCareIndeed ? 'rgba(0,121,112,0.13)' : 'rgba(255,193,7,0.14)')
                                      : (isVisualLight ? 'rgba(0,0,0,0.035)' : 'rgba(255,255,255,0.055)'),
                                    color: isSubActive
                                      ? (isCareIndeed ? '#007970' : '#FFC107')
                                      : (isVisualLight ? '#52404B' : 'rgba(255,255,255,0.6)'),
                                    border: `1px solid ${isSubActive
                                      ? (isCareIndeed ? 'rgba(0,121,112,0.28)' : 'rgba(255,193,7,0.28)')
                                      : 'transparent'}`,
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  {sub.label}
                                </button>
                              );
                            })}
                          </nav>
                        );
                      })()}
                    </header>
                  )}

                  <main data-shell-main="" className="flex-1 w-full h-full relative overflow-hidden">
                    <div data-shell-scroll="" className="absolute inset-0 overflow-y-auto custom-scrollbar">
                      <div className={`${isMobile ? 'pb-[calc(96px+env(safe-area-inset-bottom))]' : 'pb-4'}`}>
                        {children}
                      </div>
                    </div>
                    <GlobalTaskDrawer />
                  </main>
                  {!hideChrome && isMobile && (
                    <nav
                      aria-label="Primary mobile navigation"
                      className="absolute inset-x-0 bottom-0 z-30 border-t ci-shell-command-group"
                      style={{
                        // Stabilization U-13 / MVP §C1 — removed redundant
                        // `backdrop-blur-md`: the bar background is already
                        // 0.95 / 0.92 opaque, so frosting adds zero perceptible
                        // contrast and stacks on the shell glass.
                        borderColor: isVisualLight ? 'rgba(31,28,27,0.12)' : 'rgba(255,255,255,0.12)',
                        background: isVisualLight ? 'rgba(255,255,255,0.95)' : 'rgba(10,2,2,0.92)',
                        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
                      }}
                    >
                      <div className="grid grid-cols-5 gap-0 px-1 pt-1">
                        {MOBILE_PRIMARY_TABS.map(item => {
                          const active = isMobileTabActive(item.to);
                          const activeColor = isCareIndeed ? '#007970' : '#FFC107';
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => navigate(item.to)}
                              className="ci-touch-target ci-subtle-hover flex flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[9px] font-montserrat font-bold uppercase tracking-[0.08em]"
                              style={{
                                color: active
                                  ? activeColor
                                  : isVisualLight ? '#52404B' : 'rgba(255,255,255,0.65)',
                                background: active
                                  ? (isCareIndeed ? 'rgba(0,121,112,0.14)' : 'rgba(255,193,7,0.14)')
                                  : 'transparent',
                              }}
                            >
                              <item.icon size={16} strokeWidth={1.8} />
                              <span className="leading-none">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </nav>
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
      <GuidedUatWidget />
      <GuidedTourGate />
    </ShellFrame>
  );
}
