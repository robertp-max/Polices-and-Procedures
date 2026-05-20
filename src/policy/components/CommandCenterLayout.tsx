import { useState, useEffect, useRef, useMemo, type PropsWithChildren } from 'react';
import ciIonLogo from '@/assets/ci-logo-white.png';
import ciLogoGray from '@/assets/ci-logo-gray.png';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardCheck, Network, FileEdit,
  PlayCircle,
  CalendarDays,
  HelpCircle,
  ShieldCheck, Zap,
  ArrowUpCircle, FolderOpen, UserCheck, Sparkles,
  ListChecks, LogOut, Compass, Trash2,
  Users, Heart,
} from 'lucide-react';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { useShellStore } from '@/policy/stores/uiStore';
import { useCiModeStore } from '@/policy/stores/ciModeStore';
import { useAuth } from '@/auth/AuthProvider';
import { evaluateAdminAccess } from '@/policy/security/identity';
import { canViewNavItem as canViewNavItemFn } from '@/policy/security/features/featureAccess';
import { useUserAssignmentsStore } from '@/policy/security/identity/userAssignmentsStore';
import { PermissionGate } from '@/policy/security/features/PermissionGate';
import { ShellFrame, ShellNavRail, ShellTopbar, ShellContentFrame, ShellMobileDrawer } from '@/policy/components/ui';
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
  { id: 'dashboard', to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, featureId: 'dashboard.view' },
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

export function CommandCenterLayout({ children }: PropsWithChildren) {
  const [launching] = useState(false);
  const [splashExit] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
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

  const isMobileTabActive = (to: string) => {
    const tabPath = to.split('?')[0].split('#')[0];
    return location.pathname === tabPath || location.pathname.startsWith(`${tabPath}/`);
  };

  // ── Nav icons click-to-expand sub-navigation ───────────────────────────────
  const [expandedNavId, setExpandedNavId] = useState<string | null>(null);

  // Phase 3 — Dashboard restored to nav (was previously hidden on the
  // assumption that the brand logo + '/' redirect made it implicitly
  // reachable; this surface is now the reference Phase 3 surface and
  // must be a first-class, keyboard-reachable nav target).
  const VISIBLE_NAV = allNavItems.filter(item => item.id !== 'onboarding-v2');
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
      {/* ═══════════════════════════════════════════════════════════
          Phase 2 Canonical Shell
          ShellFrame (backdrop + 4-sided inset)
            └─ ShellContentFrame (glass canvas, in-flow)
                 ├─ ShellTopbar  (top bar)
                 └─ Body
                      ├─ ShellNavRail  (desktop left rail, ShellCommandGroup inside)
                      └─ Main content region
         ═══════════════════════════════════════════════════════════ */}
      <ShellContentFrame
        scrollable={false}
        detail={hideChrome}
        className={`flex flex-col ${isMobile ? 'rounded-none' : ''} ${isVisualLight ? 'text-slate-800' : 'text-[var(--ci-text)]'}`}
      >
        {/* Inner flex column: topbar stacked above body */}
        <div className="flex h-full w-full flex-col min-h-0">

          {/* ── Phase 2: ShellTopbar ──────────────────────────────── */}
          {!hideChrome && !showSplash && (
            <ShellTopbar
              onMenuClick={() => { setIsMenuOpen(!isMenuOpen); }}
              showMobileMenu={isMobile}
              logo={
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
              }
            >
              <ContextualKnowledgeBulb />
              {/* Account menu */}
              <div className="relative shrink-0 z-40" ref={accountMenuRef}>
                <button
                  type="button"
                  aria-label={`Account: ${accountDisplayName}`}
                  aria-haspopup="menu"
                  data-on-brand=""
                  onClick={() => setIsAccountMenuOpen(v => !v)}
                  className="glass-interactive ci-subtle-hover flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-full text-white font-bold text-sm cursor-pointer relative border border-transparent"
                  style={{
                    background: isVisualLight
                      ? 'var(--ci-secondary-500)'
                      : isCareIndeedDark
                        ? 'var(--ci-shell-account-avatar-bg-ci-light-dark)'
                        : 'var(--ci-color-shell-account-avatar-bg)',
                  }}
                >
                  {accountInitials}
                  <span
                    aria-hidden="true"
                    className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full"
                    style={{ background: 'var(--ci-accent)' }}
                  />
                </button>

                {isAccountMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Account menu"
                    className="absolute right-0 mt-2 z-50 w-[220px] rounded-xl overflow-hidden ci-shell-command-group"
                    style={{
                      background: isVisualLight
                        ? 'var(--ci-shell-account-menu-bg-light)'
                        : 'var(--ci-shell-account-menu-bg-dark)',
                      border: isVisualLight ? '1px solid var(--ci-neutral-200)' : '1px solid var(--ci-overlay-border-strong)',
                      boxShadow: 'var(--ci-color-shell-overlay-shadow)',
                    }}
                  >
                    <div
                      className="px-3.5 py-3 border-b"
                      style={{ borderColor: isVisualLight ? 'var(--ci-neutral-200)' : 'var(--ci-overlay-border-strong)' }}
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

                    {/* Robert-only CES review role switcher */}
                    <CesRoleReviewSwitcher
                      userEmail={user?.email}
                      userId={user?.id}
                      isLight={isVisualLight}
                    />

                    {/* Nuclear reset — gated by system.replay permission */}
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
                          ? 'text-[var(--ci-primary-500)] hover:bg-orange-50'
                          : 'text-[var(--ci-gold)] hover:bg-white/10'
                      }`}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </ShellTopbar>
          )}

          {/* ── Phase 2 Body: ShellNavRail + content ─────────────── */}
          <div className="flex flex-1 min-h-0 overflow-hidden relative">

            {/* Desktop: Phase 2 ShellNavRail with ShellCommandGroup grouping */}
            {!isMobile && !hideChrome && !showSplash && (
              <ShellNavRail
                items={VISIBLE_NAV}
                onItemClick={(item) => {
                  setExpandedNavId(item.subItems?.length ? item.id : null);
                  navigate(item.to);
                }}
              />
            )}

            {/* ── Main content region ────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">

            {showSplash ? (
              /* ══════════════════════════════════════════
                 SPLASH VIEW — CI-ION Premium
                 ══════════════════════════════════════════ */
              <div
                className="absolute inset-0 z-[60] flex items-center justify-center animate-in fade-in duration-700 p-8 md:p-20"
                style={{
                  transition: 'opacity 700ms cubic-bezier(.22,1,.36,1)',
                  opacity: splashExit ? 0 : 1,
                  pointerEvents: splashExit ? ('none' as const) : ('auto' as const),
                  background: 'var(--ci-bg, #FFFFFF)',
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
                    background: 'var(--ci-bg, #FFFFFF)',
                    border: '1px solid var(--ci-neutral-200)',
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
                            ? 'var(--ci-primary-500)'
                            : 'var(--ci-neutral-300)'
                        }`,
                        background: launching
                          ? 'var(--ci-primary-200)'
                          : 'var(--ci-bg, #FFFFFF)',
                        color: launching
                          ? 'var(--ci-primary-500)'
                          : 'var(--ci-neutral-500)',
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
                            background: launching ? 'var(--ci-primary-500)' : 'var(--ci-secondary-500)',
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
                            background: launching ? 'var(--ci-primary-500)' : 'var(--ci-secondary-500)',
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
                          color: 'var(--ci-neutral-600)',
                        }}
                      >
                        Enterprise Policy
                        <br />
                        <span style={{ fontWeight: 600, color: 'var(--ci-primary-500)' }}>
                          Architecture
                        </span>
                      </h1>
                      <p
                        className="font-body uppercase"
                        style={{
                          fontSize: 10,
                          letterSpacing: '.35em',
                          fontWeight: 500,
                          color: 'var(--ci-neutral-400)',
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
                        color: 'var(--ci-neutral-500)',
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
                          color: 'var(--ci-color-on-primary)',
                          cursor: launching ? 'wait' : 'pointer',
                          background: launching ? 'var(--ci-primary-600)' : 'var(--ci-primary-500)',
                          border: 'none',
                          outline: 'none',
                          overflow: 'hidden',
                          transition: 'background-color .2s ease',
                        }}
                        onMouseEnter={e => {
                          if (!launching) e.currentTarget.style.background = 'var(--ci-primary-600)';
                        }}
                        onMouseLeave={e => {
                          if (!launching) e.currentTarget.style.background = 'var(--ci-primary-500)';
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
                          color: 'var(--ci-primary-500)',
                          cursor: 'pointer',
                          background: 'transparent',
                          border: '1px solid var(--ci-color-cta-primary-border-soft)',
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
                          style={{ color: 'var(--ci-neutral-500)' }}
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
                        color: isVisualLight ? 'var(--ci-neutral-400)' : 'var(--ci-text-on-surface-muted)',
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
                    MOBILE NAVIGATION DRAWER
                    Phase 2 §6 — canonical primitive replaces the
                    legacy full-screen modal. ShellMobileDrawer wraps
                    BottomSheetDrawer which provides role="dialog",
                    aria-modal, Escape-to-close, scrim-tap close, and
                    swipe-down dismiss. Items with subItems render as
                    a flat grouped sublist for narrow viewports.
                   ══════════════════════════════════════════ */}
                <ShellMobileDrawer
                  open={isMenuOpen}
                  onClose={() => setIsMenuOpen(false)}
                  items={VISIBLE_NAV}
                  currentPath={location.pathname}
                  onItemClick={(item) => {
                    navigate(item.to);
                    setIsMenuOpen(false);
                  }}
                  eyebrow={isCareIndeed ? 'Care Indeed' : 'CI-ION'}
                  title="Navigate"
                />

                {/* ══════════════════════════════════════════
                    MAIN APP CONTENT
                   ══════════════════════════════════════════ */}
                <div className={`flex-1 flex flex-col relative z-10 w-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMenuOpen ? 'blur-[12px] opacity-30 scale-[0.98]' : ''} ${isMobile ? 'pb-16' : ''}`}>

                  {/* Sub-nav strip — canonical desktop-only sub-item row */}
                  {!hideChrome && !isMobile && activeDropdownNavId && (() => {
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
                                  ? 'rgba(var(--ci-accent-rgb), 0.13)'
                                  : 'var(--ci-overlay-faint)',
                                color: isSubActive
                                  ? 'var(--ci-accent)'
                                  : (isVisualLight ? 'var(--ci-neutral-500)' : 'var(--ci-text-on-surface-muted)'),
                                border: `1px solid ${isSubActive
                                  ? 'rgba(var(--ci-accent-rgb), 0.28)'
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
                        borderColor: 'var(--ci-overlay-border-strong)',
                        background: 'var(--ci-color-shell-mobile-tabbar-bg)',
                        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
                      }}
                    >
                      <div className="grid grid-cols-5 gap-0 px-1 pt-1">
                        {MOBILE_PRIMARY_TABS.map(item => {
                          const active = isMobileTabActive(item.to);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => navigate(item.to)}
                              className="ci-touch-target ci-subtle-hover flex flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[9px] font-montserrat font-bold uppercase tracking-[0.08em]"
                              style={{
                                color: active
                                  ? isVisualLight ? 'var(--ci-secondary-600)' : 'var(--ci-accent)'
                                  : isVisualLight ? 'var(--ci-neutral-500)' : 'var(--ci-text-on-surface-soft)',
                                background: active
                                  ? 'rgba(var(--ci-accent-rgb), 0.14)'
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
      </ShellContentFrame>
      <GuidedUatWidget />
      <GuidedTourGate />
    </ShellFrame>
  );
}
