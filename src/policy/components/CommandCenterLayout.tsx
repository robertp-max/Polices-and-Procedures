import { useState, useEffect, type PropsWithChildren } from 'react';
import ciIonLogo from '@/assets/ci-ion-logo.png';
import ciLogoGray from '@/assets/ci-logo-gray.png';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardCheck, Network, FileEdit,
  CheckSquare, Send, FileBarChart, PlayCircle,
  HelpCircle, Search, ChevronLeft, Menu,
  ShieldCheck, Zap, FingerprintPattern as Fingerprint,
  GraduationCap, ArrowUpCircle,
} from 'lucide-react';
import TravelightBG from '@/components/TravelightBG';
import { useShellStore } from '@/policy/stores/uiStore';

function BradRobotIcon({ size = 24, strokeWidth = 1.5, className }: { size?: number; strokeWidth?: number; className?: string }) {
  const sw = strokeWidth ?? 1.5;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="brad-bg-glow" cx="50%" cy="55%" r="55%">
          <stop offset="0%"   stopColor="#00D9C5" stopOpacity="0.50" />
          <stop offset="50%"  stopColor="#FF8C1A" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#FF6200" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="brad-line-grad" x1="5" y1="4" x2="19" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#00D9C5" />
          <stop offset="100%" stopColor="#FF8C1A" />
        </linearGradient>
      </defs>

      {/* Radial glow bloom */}
      <circle cx="12" cy="13" r="11" fill="url(#brad-bg-glow)" />

      {/* Radiating light spokes */}
      <line x1="12" y1="0.5"  x2="12" y2="2"    stroke="#00D9C5" strokeOpacity="0.55" strokeWidth="1"    strokeLinecap="round" />
      <line x1="12" y1="22"   x2="12" y2="23.5"  stroke="#FF8C1A" strokeOpacity="0.55" strokeWidth="1"    strokeLinecap="round" />
      <line x1="0.5"  y1="13" x2="2"   y2="13"   stroke="#00D9C5" strokeOpacity="0.50" strokeWidth="1"    strokeLinecap="round" />
      <line x1="22"   y1="13" x2="23.5" y2="13"  stroke="#FF8C1A" strokeOpacity="0.50" strokeWidth="1"    strokeLinecap="round" />
      <line x1="2.2"  y1="4.2"  x2="3.3"  y2="5.3"  stroke="#00D9C5" strokeOpacity="0.40" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="21.8" y1="4.2"  x2="20.7" y2="5.3"  stroke="#FF8C1A" strokeOpacity="0.40" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="2.2"  y1="21.8" x2="3.3"  y2="20.7" stroke="#00D9C5" strokeOpacity="0.35" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="21.8" y1="21.8" x2="20.7" y2="20.7" stroke="#FF8C1A" strokeOpacity="0.35" strokeWidth="0.9" strokeLinecap="round" />

      {/* Left ear */}
      <rect x="2.75" y="11.25" width="2.75" height="3.5" rx="1" stroke="url(#brad-line-grad)" strokeWidth={sw * 0.75} />
      {/* Right ear */}
      <rect x="18.5"  y="11.25" width="2.75" height="3.5" rx="1" stroke="url(#brad-line-grad)" strokeWidth={sw * 0.75} />

      {/* Robot head */}
      <rect x="5.5" y="8" width="13" height="10.5" rx="2.25" stroke="url(#brad-line-grad)" strokeWidth={sw} />

      {/* Antenna stem */}
      <line x1="12" y1="8" x2="12" y2="5.25" stroke="url(#brad-line-grad)" strokeWidth={sw} strokeLinecap="round" />
      {/* Antenna tip */}
      <circle cx="12" cy="4" r="1.5" fill="#00D9C5" />

      {/* Left eye — teal */}
      <circle cx="9.5"  cy="12.75" r="1.6" fill="#00D9C5" />
      {/* Right eye — orange */}
      <circle cx="14.5" cy="12.75" r="1.6" fill="#FF8C1A" />

      {/* Mouth smile */}
      <path d="M9.25 16.5 Q12 18.25 14.75 16.5" stroke="url(#brad-line-grad)" strokeWidth={sw * 0.85} strokeLinecap="round" fill="none" />
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
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', to: '/dashboard', label: 'Command Center', subItems: [{ to: '/dashboard', label: 'Overview' }], icon: LayoutDashboard },
  { id: 'iadmin', to: '/iadministrator', label: 'Brad', icon: BradRobotIcon },
  { id: 'compliance', to: '/workflows', label: 'Compliance', subItems: [{ to: '/workflows', label: 'Workflows' }, { to: '/compliance/master-controls', label: 'Master Controls' }, { to: '/calendar', label: 'Execution Timeline' }, { to: '/calendar/minutes', label: 'Minutes' }, { to: '/audit', label: 'Audit Mode' }], icon: ClipboardCheck },
  { id: 'taxonomy', to: '/framework', label: 'Taxonomy', subItems: [{ to: '/framework', label: 'Framework' }, { to: '/library', label: 'Policies' }, { to: '/forms', label: 'Forms' }], icon: Network },
  { id: 'drafts', to: '/drafts', label: 'Drafts', icon: FileEdit },
  { id: 'review', to: '/review', label: 'Review Queue', icon: CheckSquare },
  { id: 'publish', to: '/publish', label: 'Publishing', icon: Send },
  { id: 'reports', to: '/governance', label: 'Master Report', icon: FileBarChart },
  {
    id: 'journey', to: '/journey', label: 'Onboarding',
    subItems: [
      { to: '/journey',            label: 'Journey' },
      { to: '/journey/appendix-f', label: 'Appendix F' },
      { to: '/journey/supervisor', label: 'Supervisor' },
      { to: '/journey/admin',      label: 'Admin / HR' },
      { to: '/journey/guide',      label: 'User Guide' },
    ],
    icon: GraduationCap,
  },
  { id: 'hubstaff', to: '/hubstaff', label: 'Hubstaff', icon: ArrowUpCircle },
  { id: 'demo', to: '/demo', label: 'Demo', icon: PlayCircle },
];

function enterFullscreen() {
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  };
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if (el.msRequestFullscreen) el.msRequestFullscreen();
}

// ── Viewport detection (mobile vs. desktop) ──────────────
const MOBILE_BP = 1024;

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < MOBILE_BP);
  useEffect(() => {
    const update = () => setMobile(window.innerWidth < MOBILE_BP);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return mobile;
}

function resolveActiveNav(pathname: string): NavItem {
  for (const item of NAV_ITEMS) {
    if (item.subItems) {
      for (const sub of item.subItems) {
        if (pathname === sub.to || pathname.startsWith(sub.to + '/')) return item;
      }
    }
    if (pathname === item.to || pathname.startsWith(item.to + '/')) return item;
  }
  return NAV_ITEMS[0];
}

export function CommandCenterLayout({ children }: PropsWithChildren) {
  const [showSplash, setShowSplash] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [splashExit, setSplashExit] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<NavItem | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const detailMode = useShellStore(s => s.detailMode);
  const theme = useShellStore(s => s.theme);
  const toggleTheme = useShellStore(s => s.toggleTheme);
  const isLight = theme === 'care-indeed-light';
  const logo = isLight ? ciLogoGray : ciIonLogo;

  // Route-based detail detection (for detail pages opened via URL).
  const pathIsDetail =
    /^\/library\/.+/.test(location.pathname) ||
    /^\/gv-policy\/.+/.test(location.pathname) ||
    /^\/forms\/.+/.test(location.pathname);
  const hideChrome = detailMode || pathIsDetail;

  const currentNav = resolveActiveNav(location.pathname);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const handleEnter = () => {
    setLaunching(true);
    setSplashExit(true);
    window.setTimeout(() => {
      enterFullscreen();
      setShowSplash(false);
    }, 1100);
  };

  return (
    <>
      {/* ── 1. Premium background (TravelightBG) — fills viewport ── */}
      <TravelightBG isLight={isLight} />

      {/* ── 2. Single premium glass canvas — near-fullscreen ── */}
      <div data-shell-outer="" className={`fixed inset-0 ${isLight ? 'text-slate-800' : 'text-[#E0E0E0]'}`} style={{ zIndex: 1 }}>
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
               Light  : Care Indeed single sheet of glass — exactly
                        bg-white/[0.0777] + backdrop-blur-3xl + the
                        design-system shadow (from CI Design System.pdf).
                        Opens snap to solid paper at 100% for policy/form
                        detail views.
               Dark   : CI-ION maroon glass at 30.44% (7.77% reduction
                        from 33%); full opacity in detail mode. */
            ...(isLight
              ? {
                  // Care Indeed light mode — one-card canvas matching
                  // the Workflow Library aesthetic. Solid white surface,
                  // 1px #E5E4E3 hairline, almost-invisible outer shadow
                  // for subtle elevation against the #FAFBF8 gutter.
                  background: '#FFFFFF',
                  border: '1px solid #E5E4E3',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
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
                  background: isLight
                    ? 'rgba(255,255,255,0.777)'
                    : 'linear-gradient(160deg, rgba(66,8,8,0.777) 0%, rgba(10,2,2,0.777) 100%)',
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
                    background: isLight ? '#FFFFFF' : 'transparent',
                    border: isLight
                      ? '1px solid #E5E4E3'
                      : '1px solid rgba(255,255,255,0.0777)',
                  }}
                >
                  <div className="w-full flex flex-col items-center gap-8 relative z-10">
                    {/* Splash logo → theme toggle (both views) */}
                    <button
                      type="button"
                      onClick={toggleTheme}
                      aria-label={`Switch to ${isLight ? 'CI-ION dark' : 'Care Indeed light'} theme`}
                      title={`Switch to ${isLight ? 'CI-ION dark' : 'Care Indeed light'} theme`}
                      className="group rounded-xl p-1 hover:scale-[1.03] transition-transform cursor-pointer focus-visible:outline-offset-4"
                    >
                      <img
                        src={logo}
                        alt={`Care Indeed — click to switch to ${isLight ? 'CI-ION dark' : 'Care Indeed light'} theme`}
                        className={`h-14 w-auto object-contain ${isLight ? '' : 'drop-shadow-2xl'}`}
                        style={isLight ? { opacity: 1 } : { filter: 'brightness(0) invert(1)', opacity: 0.95 }}
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
                            ? (isLight ? '#C74601' : 'rgba(255,255,255,.3)')
                            : (isLight ? '#D1D1D1' : 'rgba(255,255,255,.1)')
                        }`,
                        background: launching
                          ? (isLight ? '#FFEEE5' : 'rgba(255,255,255,.2)')
                          : (isLight ? '#FFFFFF' : 'rgba(255,255,255,.05)'),
                        color: launching
                          ? (isLight ? '#C74601' : '#fff')
                          : (isLight ? '#52404B' : 'rgba(255,255,255,.75)'),
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
                            background: launching ? (isLight ? '#C74601' : '#fff') : (isLight ? '#007970' : '#FFC107'),
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
                            background: launching ? (isLight ? '#C74601' : '#fff') : (isLight ? '#007970' : '#FFC107'),
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
                          color: isLight ? '#1F1C1B' : '#ffffff',
                        }}
                      >
                        Enterprise Policy
                        <br />
                        <span style={{ fontWeight: 600, color: isLight ? '#C74601' : '#FFC107' }}>
                          Architecture
                        </span>
                      </h1>
                      <p
                        className="font-body uppercase"
                        style={{
                          fontSize: 10,
                          letterSpacing: '.35em',
                          fontWeight: 500,
                          color: isLight ? '#747474' : 'rgba(255,255,255,0.40)',
                        }}
                      >
                        Enterprise Taxonomy v6.0
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
                        color: isLight ? '#52404B' : 'rgba(255,255,255,0.50)',
                      }}
                    >
                      Regulatory compliance foundation &amp; clinical governance framework for Home Health Operations.
                    </p>

                    {/* Primary CTA — brand primary-500 → primary-600 on
                        hover. Solid color (no gradient), no shadow,
                        rounded-lg=12px per CI brand kit. */}
                    <div className="w-full px-2 flex flex-col gap-3">
                      <button
                        onClick={handleEnter}
                        disabled={launching}
                        type="button"
                        aria-label="Enter Care Indeed policy environment"
                        className="relative w-full font-heading"
                        style={{
                          padding: '1rem 1.5rem',
                          borderRadius: '12px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '.18em',
                          fontSize: '.82rem',
                          color: isLight ? '#FFFFFF' : '#0A0202',
                          cursor: launching ? 'wait' : 'pointer',
                          background: isLight
                            ? (launching ? '#421700' : '#C74601')
                            : 'linear-gradient(to bottom,#FFC107,#D9A406)',
                          border: 'none',
                          outline: 'none',
                          overflow: 'hidden',
                          transition: 'background-color .2s ease',
                        }}
                        onMouseEnter={e => {
                          if (!launching && isLight) e.currentTarget.style.background = '#421700';
                        }}
                        onMouseLeave={e => {
                          if (!launching && isLight) e.currentTarget.style.background = '#C74601';
                        }}
                      >
                        {launching ? (
                          <div className="flex items-center justify-center gap-3">
                            <Fingerprint size={18} className="animate-pulse" />
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.1em', fontSize: '.82rem' }}>ENCRYPTING</span>
                          </div>
                        ) : 'Enter Environment'}
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
                          style={{ color: isLight ? '#52404B' : 'rgba(255,255,255,0.35)' }}
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
                        color: isLight ? '#747474' : 'rgba(255,255,255,0.35)',
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
                        background: isLight
                          ? '#FFFFFF'
                          : 'rgba(10,2,2,0.65)',
                        backdropFilter: isLight ? 'none' : 'blur(20px) saturate(130%)',
                        WebkitBackdropFilter: isLight ? 'none' : 'blur(20px) saturate(130%)',
                      }}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setActiveSubMenu(null);
                      }}
                    />
                    <div className="relative z-10 w-full max-w-5xl px-8 flex justify-center items-center pointer-events-none">
                      <div className="pointer-events-auto w-full">
                        {!activeSubMenu ? (
                          <div className="grid grid-cols-3 gap-x-12 gap-y-16 md:gap-y-20 animate-in zoom-in-95 duration-500">
                            {NAV_ITEMS.map((item) => {
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
                                  className="flex flex-col items-center justify-center gap-6 group outline-none"
                                >
                                  <span style={isActive ? { color: isLight ? '#007970' : '#FFC107' } : undefined}>
                                    <item.icon
                                      size={48}
                                      strokeWidth={1}
                                      className={`icon-interactive group-hover:scale-110 ${isActive ? '!opacity-100' : isLight ? 'text-slate-700' : 'text-white'}`}
                                    />
                                  </span>
                                  <span
                                    className={`icon-interactive text-lg font-light uppercase tracking-[0.2em] ${isActive ? '!opacity-100' : isLight ? 'text-slate-700' : 'text-white'}`}
                                    style={isActive ? { color: isLight ? '#007970' : '#FFC107' } : undefined}
                                  >
                                    {item.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center animate-in slide-in-from-right-8 fade-in duration-500">
                            <button
                              onClick={() => setActiveSubMenu(null)}
                              className={`mb-16 flex items-center gap-3 ${isLight ? 'hover:text-slate-900' : 'hover:text-white'} transition-colors uppercase tracking-[0.2em] font-bold text-sm`}
                              style={{ color: isLight ? '#007970' : '#FFC107' }}
                            >
                              <ChevronLeft size={18} /> Back to Main Menu
                            </button>
                            <h3 className={`text-2xl font-light ${isLight ? 'text-slate-700' : 'text-white/40'} uppercase tracking-[0.3em] mb-12 flex items-center gap-4`}>
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
                                  <span className={`icon-interactive uppercase tracking-[0.1em] ${isLight ? 'text-slate-900' : 'text-white'} block group-hover:scale-105`}>
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
                <div className={`flex-1 flex flex-col relative z-10 w-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMenuOpen ? 'blur-[12px] opacity-30 scale-[0.98]' : ''}`}>

                  {!hideChrome && (
                    <header className="w-full px-6 md:px-10 pt-8 md:pt-10 pb-4 flex items-start justify-between shrink-0 relative z-20">
                      {!isMobile && (
                        <button
                          type="button"
                          onClick={toggleTheme}
                          aria-label={`Switch to ${isLight ? 'CI-ION Dark' : 'Care Indeed Light'} theme`}
                          title={`Switch to ${isLight ? 'CI-ION Dark' : 'Care Indeed Light'} theme`}
                          className="absolute left-1/2 top-8 md:top-10 -translate-x-1/2 flex items-center justify-center h-12 cursor-pointer hover:scale-105 transition-transform"
                        >
                          <img
                            src={logo}
                            alt="Care Indeed — theme toggle"
                            className={`h-6 md:h-8 w-auto object-contain ${isLight ? '' : 'drop-shadow-md'}`}
                            style={isLight ? undefined : { filter: 'brightness(0) invert(1)', opacity: 0.95 }}
                          />
                        </button>
                      )}

                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => {
                            setIsMenuOpen(!isMenuOpen);
                            setActiveSubMenu(null);
                          }}
                          className={`glass-interactive flex items-center justify-center w-12 h-12 rounded-full ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/70 hover:text-white'} border border-transparent shadow-sm`}
                        >
                          <Menu size={24} />
                        </button>
                        {isMobile ? (
                          <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className="cursor-pointer"
                          >
                            <img
                              src={logo}
                              alt="Care Indeed"
                              className={`h-7 w-auto object-contain ${isLight ? '' : 'drop-shadow-md'}`}
                              style={isLight ? undefined : { filter: 'brightness(0) invert(1)', opacity: 0.95 }}
                            />
                          </button>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <h1
                              className="text-[10px] md:text-[11px] font-bold tracking-[0.25em] uppercase"
                              style={{ color: isLight ? '#007970' : '#FFC107' }}
                            >
                              Policy Taxonomy
                            </h1>
                            <p className={`${isLight ? 'text-slate-500' : 'text-white/40'} text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase`}>Context: {currentNav.label}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 md:gap-6">
                        <div
                          className={`hidden sm:flex items-center bg-transparent border rounded-full px-5 py-2.5 w-48 md:w-64 transition-all ${
                            isLight
                              ? 'border-slate-300 focus-within:border-[#007970]/60'
                              : 'border-white/10 focus-within:border-[#FFC107]/50'
                          }`}
                        >
                          <Search size={14} className={`${isLight ? 'text-slate-400' : 'text-white/30'} mr-3 shrink-0`} aria-hidden="true" />
                          <label htmlFor="ci-global-search" className="sr-only">
                            Search policies
                          </label>
                          <input
                            id="ci-global-search"
                            type="text"
                            placeholder="Search policies..."
                            className={`bg-transparent border-none outline-none ${isLight ? 'text-slate-900 placeholder-slate-500' : 'text-white placeholder-white/40'} text-xs w-full font-light`}
                          />
                        </div>
                        <button
                          type="button"
                          aria-label="Help"
                          className={`glass-interactive flex items-center justify-center w-10 h-10 rounded-full ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/50 hover:text-white'} transition-colors border border-transparent`}
                        >
                          <HelpCircle size={20} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label="Account: Jane Doe"
                          className="glass-interactive flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm cursor-pointer relative border border-transparent"
                          style={{
                            background: isLight
                              ? '#007970'
                              : 'linear-gradient(135deg, rgba(93,14,14,0.9), rgba(49,7,7,0.9))',
                          }}
                        >
                          JD
                          <span
                            aria-hidden="true"
                            className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full"
                            style={{
                              background: isLight ? '#C74600' : '#FFC107',
                            }}
                          />
                        </button>
                      </div>
                    </header>
                  )}

                  <main data-shell-main="" className="flex-1 w-full h-full relative overflow-hidden">
                    <div data-shell-scroll="" className="absolute inset-0 overflow-y-auto custom-scrollbar">
                      {children}
                    </div>
                  </main>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
