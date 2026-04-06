import { useState, useEffect, type PropsWithChildren } from 'react';
import logo from '@/assets/ci-logo-white.png';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardCheck, Network, FileEdit,
  CheckSquare, Send, FileBarChart, PlayCircle,
  HelpCircle, Search, ChevronRight, ChevronLeft, Menu,
  ShieldCheck, Zap,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   CANONICAL SHELL — ported from Builder/Main/main.html
   Single source of truth for layout, animation, and navigation.
   ═══════════════════════════════════════════════════════════════ */

// ── Navigation structure with expanded SubItems ──
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
  { id: 'compliance', to: '/calendar', label: 'Compliance', subItems: [{ to: '/calendar', label: 'Calendar' }, { to: '/calendar/minutes', label: 'Minutes' }], icon: ClipboardCheck },
  { id: 'taxonomy', to: '/framework', label: 'Taxonomy', subItems: [{ to: '/framework', label: 'Framework' }, { to: '/library', label: 'Policies' }, { to: '/forms', label: 'Forms' }], icon: Network },
  { id: 'drafts', to: '/drafts', label: 'Drafts', icon: FileEdit },
  { id: 'review', to: '/review', label: 'Review Queue', icon: CheckSquare },
  { id: 'publish', to: '/publish', label: 'Publishing', icon: Send },
  { id: 'reports', to: '/governance', label: 'Master Report', icon: FileBarChart },
  { id: 'demo', to: '/demo', label: 'Demo', icon: PlayCircle },
];

// ── Fullscreen API helper ──
function enterFullscreen() {
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  };
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if (el.msRequestFullscreen) el.msRequestFullscreen();
}

// ── Viewport-aware scale: design canvas 1920×1080, 5% enlargement bias ──
const DESIGN_W = 1920;
const DESIGN_H = 1080;
const SCALE_BIAS = 1.155; // 1.05 base × 1.10 to absorb the 110% browser-zoom sweet-spot at 4K/200% OS scale
const VIEWPORT_FILL = 0.75; // glass card occupies ~75% of viewport on desktop
const SCALE_MIN = 0.3;      // never shrink below 30% — keeps desktop usable on small windows
const MOBILE_BP = 1024;     // below this width → full-screen mode (tablet/phone)

function useShellScale(): { scale: number; isMobile: boolean } {
  const compute = () => {
    const mobile = window.innerWidth < MOBILE_BP;
    const scale = mobile
      ? 1
      : Math.max(
          Math.min(
            window.innerWidth * VIEWPORT_FILL / DESIGN_W,
            window.innerHeight * VIEWPORT_FILL / DESIGN_H
          ) * SCALE_BIAS,
          SCALE_MIN
        );
    return { scale, isMobile: mobile };
  };
  const [state, setState] = useState(compute);
  useEffect(() => {
    const update = () => setState(compute());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return state;
}

// ── Resolve active nav from current path ──
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<NavItem | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { scale, isMobile } = useShellScale();

  const currentNav = resolveActiveNav(location.pathname);

  return (
    <>
      {/* ── 1. Background Root ── */}
      <div className="fixed inset-0 bg-[#020406] flex items-center justify-center overflow-hidden text-white">

        {/* ── 2. Animated Gradient Layer ── */}
        <div className="absolute inset-0 vibrant-bg" />

        {/* ── 3. Cinematic 16:9 Design Canvas — viewport-scaled to 1920×1080 ── */}
        <div
          className={`relative z-10 bg-transparent backdrop-blur-[3.55px] backdrop-brightness-[0.67] backdrop-saturate-[1.33] border border-white/20 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden ${isMobile ? 'w-full h-full rounded-none' : 'rounded-3xl md:rounded-[40px]'}`}
          style={isMobile
            ? { width: '100%', height: '100%' }
            : { width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale})`, transformOrigin: 'center center' }
          }
        >

          {/* ── 4. Content Wrapper ── */}
          <div className="flex w-full h-full relative">

            {/* ══════════════════════════════════════════
                5. SPLASH VIEW
               ══════════════════════════════════════════ */}
            {showSplash ? (
              <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center animate-in fade-in duration-1000 p-20">
                <div className="flex flex-col items-center max-w-2xl text-center">
                  {/* Logo Group */}
                  <img
                    src={logo}
                    alt="Care Indeed"
                    className="h-20 w-auto opacity-100 object-contain drop-shadow-2xl mb-12"
                  />

                  {/* Title & Version */}
                  <div className="space-y-4 mb-12">
                    <h1 className="text-6xl font-light tracking-[0.15em] uppercase text-white leading-tight">
                      Enterprise Policy <br />
                      <span className="font-bold text-[#00c2b4]">Architecture</span>
                    </h1>
                    <div className="flex items-center justify-center gap-6">
                      <span className="h-px w-12 bg-white/20" />
                      <p className="text-xl font-bold tracking-[0.4em] text-white/40 uppercase">Version 6.0</p>
                      <span className="h-px w-12 bg-white/20" />
                    </div>
                  </div>

                  {/* Subtext */}
                  <p className="text-white/40 text-lg font-light leading-relaxed mb-16 tracking-wide max-w-lg">
                    Regulatory Compliance foundation and Clinical Governance Framework for Home Health Operations.
                  </p>

                  {/* ── 6. Entry Button ── */}
                  <button
                    onClick={() => {
                      enterFullscreen();
                      setShowSplash(false);
                    }}
                    className="glass-interactive group relative flex items-center gap-6 px-12 py-6 rounded-2xl border border-white/10 hover:border-[#00c2b4]/40 transition-all duration-300"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-bold tracking-[0.3em] text-[#00c2b4] uppercase mb-1">Initialize System</span>
                      <span className="text-2xl font-light tracking-widest text-white uppercase">Enter Environment</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#00c2b4]/20 transition-colors">
                      <ChevronRight className="text-[#00c2b4]" size={28} />
                    </div>
                  </button>
                </div>

                {/* ── 7. System Badges Footer ── */}
                <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-12 text-white/20">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={18} strokeWidth={1} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Validated Compliance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Network size={18} strokeWidth={1} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">IBM Framework Alignment</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap size={18} strokeWidth={1} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Real-time Authoring</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* ══════════════════════════════════════════
                    8 & 9. FULL-SCREEN MODAL MENU
                   ══════════════════════════════════════════ */}
                {isMenuOpen && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center animate-in fade-in duration-500">
                    {/* 9. Modal Background Overlay — 33% #00292e tint */}
                    <div
                      className="absolute inset-0 bg-[#00292e] cursor-pointer"
                      style={{ opacity: 0.33 }}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setActiveSubMenu(null);
                      }}
                    />

                    {/* Modal Content Container */}
                    <div className="relative z-10 w-full max-w-5xl px-8 flex justify-center items-center pointer-events-none">
                      <div className="pointer-events-auto w-full">
                        {!activeSubMenu ? (
                          /* ── 10. Main 3×3 Navigation Grid ── */
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
                                  <item.icon
                                    size={48}
                                    strokeWidth={1}
                                    className={`icon-interactive group-hover:scale-110 ${isActive ? 'text-[#00c2b4] !opacity-100' : 'text-white'}`}
                                  />
                                  <span className={`icon-interactive text-lg font-light uppercase tracking-[0.2em] ${isActive ? 'text-[#00c2b4] !opacity-100' : 'text-white'}`}>
                                    {item.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          /* ── 11. Submenu View ── */
                          <div className="flex flex-col items-center animate-in slide-in-from-right-8 fade-in duration-500">
                            <button
                              onClick={() => setActiveSubMenu(null)}
                              className="mb-16 flex items-center gap-3 text-[#00c2b4] hover:text-white transition-colors uppercase tracking-[0.2em] font-bold text-sm"
                            >
                              <ChevronLeft size={18} /> Back to Main Menu
                            </button>
                            <h3 className="text-2xl font-light text-white/40 uppercase tracking-[0.3em] mb-12 flex items-center gap-4">
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
                                  <span className="icon-interactive uppercase tracking-[0.1em] text-white block group-hover:scale-105">
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
                    12. MAIN APP CONTENT AREA
                   ══════════════════════════════════════════ */}
                <div className={`flex-1 flex flex-col relative z-10 w-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMenuOpen ? 'blur-[12px] opacity-30 scale-[0.98]' : ''}`}>

                  {/* ── 13. Header ── */}
                  <header className="w-full px-6 md:px-10 pt-8 md:pt-10 pb-4 flex items-start justify-between shrink-0 relative z-20">
                    {/* ── 14. Centered Logo Zone — desktop only ── */}
                    {!isMobile && (
                      <div className="absolute left-1/2 top-8 md:top-10 -translate-x-1/2 flex items-center justify-center h-12 pointer-events-none">
                        <img
                          src={logo}
                          alt="Care Indeed"
                          className="h-6 md:h-8 w-auto opacity-100 object-contain drop-shadow-md"
                        />
                      </div>
                    )}

                    {/* ── 15. Left Control Cluster ── */}
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => {
                          setIsMenuOpen(!isMenuOpen);
                          setActiveSubMenu(null);
                        }}
                        className="glass-interactive flex items-center justify-center w-12 h-12 rounded-full text-white/70 hover:text-white border border-transparent shadow-sm"
                      >
                        <Menu size={24} />
                      </button>
                      {isMobile ? (
                        <img
                          src={logo}
                          alt="Care Indeed"
                          className="h-7 w-auto opacity-100 object-contain drop-shadow-md"
                        />
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <h1 className="text-[#00c2b4] text-[10px] md:text-[11px] font-bold tracking-[0.25em] uppercase">Policy Taxonomy</h1>
                          <p className="text-white/40 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase">Context: {currentNav.label}</p>
                        </div>
                      )}
                    </div>

                    {/* ── 16 & 17. Right Utility Cluster ── */}
                    <div className="flex items-center gap-4 md:gap-6">
                      {/* 16. Search Field */}
                      <div className="hidden sm:flex items-center bg-transparent border border-white/10 rounded-full px-5 py-2.5 w-48 md:w-64 focus-within:border-[#00c2b4]/50 transition-all">
                        <Search size={14} className="text-white/30 mr-3 shrink-0" />
                        <input
                          type="text"
                          placeholder="Search policies..."
                          className="bg-transparent border-none outline-none text-white text-xs w-full placeholder-white/30 font-light"
                        />
                      </div>
                      {/* 17. Help Button */}
                      <button className="glass-interactive flex items-center justify-center w-10 h-10 rounded-full text-white/50 hover:text-white transition-colors border border-transparent">
                        <HelpCircle size={20} />
                      </button>
                      {/* 17. User Avatar */}
                      <div className="glass-interactive flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#007970] to-[#004a45] text-white font-bold text-sm shadow-md cursor-pointer relative border border-transparent">
                        JD
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00c2b4] shadow-[0_0_8px_rgba(0,194,180,0.8)]" />
                      </div>
                    </div>
                  </header>

                  {/* ── 12. Main Content Injection Area ── */}
                  <main className="flex-1 w-full h-full relative overflow-hidden">
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
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
