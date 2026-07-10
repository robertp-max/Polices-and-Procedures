import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Outlet, matchPath, useLocation, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Heart,
  HelpCircle,
  Info,
  LayoutGrid,
  MessageSquare,
  Settings,
  Share2,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { PersonalOpsPanel } from './PersonalOpsPanel';
import { usePersonalOpsStore } from '../../policy/stores/personalOpsStore';
import { useUiStore } from '../../policy/stores/uiStore';
import {
  primaryNavBarItems,
  primaryNavItems,
} from '../routing/navigationManifest';
import { V6_ROUTES } from '../routing/routeRegistry';
import { cx } from '../utils/classNames';
import { AnimatedCareIndeedLogo } from './AnimatedCareIndeedLogo';
import { GuidedTourRunner } from '../guided/GuidedTourRunner';
import { useGuidedTourStore } from '../guided/guidedTourStore';
import { ThreadComposer, ThreadDetailPage, ThreadsPage } from '../../policy/help-center/threads';

const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutGrid,
  ces: ClipboardCheck,
  taxonomy: FileText,
  onboarding: GraduationCap,
  'help-center': HelpCircle,
};

export function V6Shell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isPersonalOpsOpen, togglePersonalOps } = usePersonalOpsStore();
  const bradLanding = useUiStore((s) => s.bradLanding);
  const bradActivityActive = useUiStore((s) => s.bradActivityActive);
  const tourActive = useGuidedTourStore((s) => s.active);
  const mainRef = useRef<HTMLElement | null>(null);
  const [hasScrolledMain, setHasScrolledMain] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [renderFeedbackPanel, setRenderFeedbackPanel] = useState(feedbackOpen);
  const [feedbackPanelVisible, setFeedbackPanelVisible] = useState(feedbackOpen);
  const [renderPersonalPanel, setRenderPersonalPanel] = useState(isPersonalOpsOpen);
  const [personalPanelVisible, setPersonalPanelVisible] = useState(isPersonalOpsOpen);
  const isLessonPlayerRoute = /^\/journey\/module\/[^/]+\/lesson\/[^/]+\/?$/.test(pathname);
  const isDocumentPrintRoute =
    /^\/print\/[^/]+\/?$/.test(pathname) ||
    /^\/library\/[^/]+\/print\/?$/.test(pathname) ||
    /^\/forms\/[^/]+\/print\/?$/.test(pathname);
  const isPersonalProfileRoute = pathname === '/personal/profile' || pathname.startsWith('/personal/profile/') || pathname.startsWith('/community/users');
  const isDashboardRoute = /(^|\/)dashboard(\/|$)/.test(pathname);
  // ?embed=1 renders the route content with no shell chrome — used when a
  // screen embeds another route in an iframe (e.g. policy appendices modal
  // showing an actual form workspace).
  const isEmbedRequest = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
  const isPolicyDetailRoute =
    pathname.startsWith('/library/') &&
    pathname !== '/library' &&
    pathname !== '/library/policies' &&
    !pathname.includes('/print');
  const isChromeFreeRoute = isLessonPlayerRoute || isDocumentPrintRoute || isPersonalProfileRoute || isEmbedRequest || isPolicyDetailRoute;
  // Keep the dock visible during a guided tour so its nav targets stay anchorable.
  const showDock = !isChromeFreeRoute && (!pathname.startsWith('/iadministrator') || bradLanding || tourActive);
  const showRouteChrome = !isChromeFreeRoute;
  // Policy detail gets zero shell padding (for clean header flush to top) but keeps scroll.
  const suppressShellPadding = isDashboardRoute || isLessonPlayerRoute || isDocumentPrintRoute || isPersonalProfileRoute || isEmbedRequest || pathname.startsWith('/iadministrator') || isPolicyDetailRoute;
  const constrainRouteWidth = showRouteChrome && !suppressShellPadding;
  const panelTop = '0px';
  const panelHeight = '100vh';

  const activeNavItem = useMemo(() => {
    for (const item of primaryNavItems) {
      const hashMatch = item.hashIds?.some((hashId: string) =>
        V6_ROUTES.some((route) =>
          route.hashId === hashId && matchPath({ path: route.path, end: !route.path.endsWith('/*') }, pathname)
        )
      );
      const routeMatch = item.matchPaths?.some((match) => matchPath({ path: match, end: false }, pathname));
      const exactOrPrefix = pathname === item.to || pathname.startsWith(`${item.to}/`);
      if (hashMatch || routeMatch || exactOrPrefix) return item.id;
    }
    return null;
  }, [pathname]);

  const dockItems = useMemo(
    () => {
      return [...primaryNavBarItems]
        .sort((a, b) => {
          const order = ['dashboard', 'ces', 'taxonomy', 'onboarding', 'help-center'];
          return order.indexOf(a.id) - order.indexOf(b.id);
        })
        .map((item) => {
          const Icon = NAV_ICONS[item.id] ?? HelpCircle;
          return {
            id: item.id,
            icon: <Icon className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />,
            label: item.label,
            onClick: () => navigate(item.to),
            isActive: activeNavItem === item.id,
            tourTarget: item.id === 'ces' ? 'nav.compliance' : undefined,
          };
        });
    },
    [activeNavItem, navigate],
  );

  useEffect(() => {
    let timer: number | undefined;
    let frame: number | undefined;

    if (isPersonalOpsOpen) {
      setRenderPersonalPanel(true);
      frame = window.requestAnimationFrame(() => setPersonalPanelVisible(true));
    } else {
      setPersonalPanelVisible(false);
      timer = window.setTimeout(() => setRenderPersonalPanel(false), 500);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [isPersonalOpsOpen]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    main.scrollTo({ top: 0, left: 0 });
    // Dispatch to the scroll listener so it updates hasScrolledMain (setState must not be called directly from effect body).
    main.dispatchEvent(new Event('scroll'));
  }, [pathname]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return undefined;

    const handleScroll = () => {
      setHasScrolledMain(main.scrollTop > 16);
    };

    handleScroll();
    main.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      main.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    let frame: number | undefined;

    if (feedbackOpen) {
      setRenderFeedbackPanel(true);
      frame = window.requestAnimationFrame(() => setFeedbackPanelVisible(true));
    } else {
      setFeedbackPanelVisible(false);
      timer = window.setTimeout(() => setRenderFeedbackPanel(false), 500);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [feedbackOpen]);

  return (
    <div className={cx('theme-ci-light-orange flex h-screen overflow-hidden font-light text-ink p-0 m-0 border-0 bg-canvas', isLessonPlayerRoute ? 'bg-surface-glass backdrop-blur-md shadow-glass-inset' : '')}>
      {showRouteChrome && (
        <>
          {showDock && (
            <button
              type="button"
              onClick={() => navigate('/iadministrator')}
              aria-label="Open Brad"
              className={cx(
                'fixed left-5 top-5 z-popover grid h-11 w-11 place-items-center rounded-full bg-transparent text-ink shadow-none transition duration-300 ease-standard hover:-translate-y-0.5 hover:text-brand-teal-deep',
                activeNavItem === 'brad' && 'text-brand-teal',
              )}
            >
              <AnimatedCareIndeedLogo active={bradActivityActive} className="h-8 w-8" />
            </button>
          )}
          <button
            type="button"
            data-tour-target="nav.profile"
            onClick={togglePersonalOps}
            aria-label="Open personal operations"
            className={cx(
              'group fixed right-5 top-5 z-popover grid h-11 w-11 place-items-center rounded-full bg-transparent text-slate-400 shadow-none transition duration-300 ease-standard hover:-translate-y-0.5 hover:text-brand-teal-deep',
              isPersonalOpsOpen && 'text-brand-teal',
            )}
          >
            <User className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
            <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap font-montserrat text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-teal-deep opacity-0 translate-x-2 transition-all duration-300 ease-standard group-hover:translate-x-0 group-hover:opacity-100">
              Profile
            </span>
          </button>
          {showDock && (
            <LeftRadialDock items={dockItems} />
          )}
        </>
      )}

      <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-row">
          <main
            className={cx(
              'min-h-0 flex-1 overflow-y-auto overflow-x-hidden',
              'transition-[padding-right] duration-500 ease-standard',
              !isChromeFreeRoute && !isDashboardRoute && 'v6-main-scrollmask',
              suppressShellPadding
                ? 'p-0'
                : cx(
                  'pl-[calc(var(--space-lg)+10px)] pr-lg pb-32 tablet-p:pl-[calc(var(--space-3xl)+50px)] tablet-p:pr-3xl',
                  'pt-6',
                ),
              !isChromeFreeRoute && !isDashboardRoute && hasScrolledMain && 'v6-main-scrollmask--scrolled',
            )}
            id="main-content"
            ref={mainRef}
            // Push/resize main content left while a guided tour panel is docked on the right.
            style={
              tourActive
                ? { paddingRight: 'min(480px, 92vw)' }
                : feedbackOpen
                  ? { paddingRight: 'min(760px, 92vw)' }
                  : undefined
            }
          >
            {constrainRouteWidth ? (
              <div className="mx-auto w-full max-w-[1400px]">
                <Outlet />
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
      {showRouteChrome && renderPersonalPanel && (
        <div
          className={cx(
            'fixed right-0 z-modal w-full max-w-[380px] overflow-visible transition-all duration-500 ease-standard',
            personalPanelVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
          )}
          style={{ top: panelTop, height: panelHeight }}
        >
          <PersonalOpsPanel
            onClose={() => {
              if (isPersonalOpsOpen) togglePersonalOps();
            }}
          />
        </div>
      )}

      {showRouteChrome && (
        <FloatingActionRail
          renderFeedbackPanel={renderFeedbackPanel}
          feedbackPanelVisible={feedbackPanelVisible}
          hidden={isPersonalOpsOpen || feedbackOpen}
          onFeedbackOpen={() => setFeedbackOpen(true)}
          onFeedbackClose={() => setFeedbackOpen(false)}
        />
      )}

      {showRouteChrome && (
        <button
          type="button"
          onClick={() => navigate('/admin/user-groups')}
          aria-label="Open admin settings"
          className={cx(
            'group fixed bottom-5 left-5 z-popover grid h-11 w-11 place-items-center rounded-full bg-transparent text-slate-400 shadow-none transition duration-300 ease-standard hover:-translate-y-0.5 hover:text-brand-teal-deep',
            activeNavItem === 'admin' && 'text-brand-teal'
          )}
        >
          <Settings className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
          <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap font-montserrat text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-teal-deep opacity-0 -translate-x-2 transition-all duration-300 ease-standard group-hover:translate-x-0 group-hover:opacity-100">
            Admin
          </span>
        </button>
      )}

      {/* Brad Guided Assistance - global, route-spanning gated tour overlay. */}
      <GuidedTourRunner />
    </div>
  );
}

function ColoredKebabIcon() {
  return (
    <span className="flex h-5 w-5 flex-col items-center justify-center gap-[2px]" aria-hidden="true">
      <span className="block h-[5px] w-[5px] rounded-full bg-[#f97316]" />
      <span className="block h-[5px] w-[5px] rounded-full bg-[#facc15]" />
      <span className="block h-[5px] w-[5px] rounded-full bg-[#2563eb]" />
    </span>
  );
}

type RadialDockItem = {
  id: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  colorStyle?: CSSProperties;
  tourTarget?: string;
};

function LeftRadialDock({ items }: { items: RadialDockItem[] }) {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed left-5 top-[82px] z-[50] flex flex-col items-center gap-2"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          data-tour-target={item.tourTarget}
          onClick={item.onClick}
          aria-label={item.label}
          aria-current={item.isActive ? 'page' : undefined}
          className={cx(
            'group relative flex h-10 w-10 items-center justify-center bg-transparent shadow-none transition duration-300 ease-standard hover:text-brand-teal-deep',
            'focus-visible:outline-none focus-visible:shadow-focus',
            item.isActive ? 'text-brand-teal' : 'text-slate-400',
          )}
          style={{
            ...item.colorStyle,
          }}
        >
          {item.icon}
          <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap font-montserrat text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-teal-deep opacity-0 -translate-x-2 transition-all duration-300 ease-standard group-hover:translate-x-0 group-hover:opacity-100">
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}

function FloatingActionRail({
  renderFeedbackPanel,
  feedbackPanelVisible,
  hidden,
  onFeedbackOpen,
  onFeedbackClose,
}: {
  renderFeedbackPanel: boolean;
  feedbackPanelVisible: boolean;
  hidden: boolean;
  onFeedbackOpen: () => void;
  onFeedbackClose: () => void;
}) {
  type PageElementContext = {
    label: string;
    kind: string;
    detail: string;
  };

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [threadMode, setThreadMode] = useState<'list' | 'new' | 'detail'>('list');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [pageElements, setPageElements] = useState<PageElementContext[]>([]);
  const [selectedElement, setSelectedElement] = useState<PageElementContext | null>(null);
  const [radialOpen, setRadialOpen] = useState(false);

  const scanCurrentPageElements = (): PageElementContext[] => {
    const main = document.getElementById('main-content');
    if (!main) return [];
    const nodes = Array.from(
      main.querySelectorAll<HTMLElement>(
        'h1,h2,h3,[data-route],[data-hash-id],button,a,input,textarea,select,[role="button"],[aria-label]',
      ),
    );
    const seen = new Set<string>();
    return nodes
      .map((node) => {
        const text = (node.innerText || node.getAttribute('aria-label') || node.getAttribute('placeholder') || node.getAttribute('data-route') || '').trim();
        if (!text || text.length < 2) return null;
        const label = text.replace(/\s+/g, ' ').slice(0, 88);
        const kind =
          node.tagName.toLowerCase().match(/^h[1-3]$/) ? 'section' :
          node.tagName.toLowerCase() === 'a' ? 'link' :
          ['button', 'select', 'input', 'textarea'].includes(node.tagName.toLowerCase()) || node.getAttribute('role') === 'button' ? 'control' :
          'page';
        const detail = [
          node.getAttribute('data-route') ? `route ${node.getAttribute('data-route')}` : '',
          node.getAttribute('data-hash-id') ? `view ${node.getAttribute('data-hash-id')}` : '',
          node.id ? `#${node.id}` : '',
        ].filter(Boolean).join(' · ') || pathname;
        const key = `${kind}:${label}:${detail}`;
        if (seen.has(key)) return null;
        seen.add(key);
        return { label, kind, detail };
      })
      .filter((item): item is PageElementContext => Boolean(item))
      .slice(0, 18);
  };

  const openFeedback = () => {
    const elements = scanCurrentPageElements();
    setPageElements(elements);
    setSelectedElement(elements[0] ?? null);
    setThreadMode('list');
    setSelectedThreadId(null);
    onFeedbackOpen();
  };

  useEffect(() => {
    window.addEventListener('v6:open-feedback', openFeedback);
    return () => window.removeEventListener('v6:open-feedback', openFeedback);
  });

  const openThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    setThreadMode('detail');
  };

  const openThreadRoute = (route: string) => {
    onFeedbackClose();
    navigate(route);
  };
  const rightActionStyle: CSSProperties = { backgroundColor: '#F1F5F9', color: '#94A3B8' };
  const rightActions = [
    { label: 'Open feedback', title: 'Feedback', icon: <MessageSquare className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />, onClick: openFeedback, colorStyle: rightActionStyle },
    { label: 'Open help center', title: 'Help', icon: <HelpCircle className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />, onClick: () => navigate('/help'), colorStyle: rightActionStyle },
    { label: 'Share', title: 'Share', icon: <Share2 className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />, colorStyle: rightActionStyle },
    { label: 'Information', title: 'Info', icon: <Info className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />, colorStyle: rightActionStyle },
  ];
  const rightTotalAngle = 140;
  const rightStartAngle = 180 - (rightTotalAngle / 2);
  const rightAngleStep = rightActions.length > 1 ? rightTotalAngle / (rightActions.length - 1) : 0;
  const radialTransitionClass = 'transition-all duration-300 ease-out';

  const handleRadialMouseEnter = () => {
    if (radialOpen) return;
    setRadialOpen(true);
  };

  const handleRadialMouseLeave = () => {
    if (!radialOpen) return;
    setRadialOpen(false);
  };

  return (
    <>
      <div
        className={cx('fixed inset-0 z-[40] transition-all duration-500', radialOpen ? 'bg-slate-900/[0.33] backdrop-blur-sm opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
        onClick={handleRadialMouseLeave}
        aria-hidden="true"
      />
      <div
        aria-label="Right panel dock"
        className={cx(
          'fixed right-6 top-1/2 z-[50] flex h-11 w-11 -translate-y-1/2 items-center justify-center',
          hidden && 'pointer-events-none opacity-0',
        )}
        onMouseEnter={handleRadialMouseEnter}
        aria-hidden={hidden ? 'true' : undefined}
      >
        <div className={cx('absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500', radialOpen ? 'h-[360px] w-[360px]' : 'h-11 w-11')} aria-hidden="true" />
        <div className={cx('pointer-events-none absolute inset-0 flex items-center justify-center')}>
          {rightActions.map((action, index) => {
            const angle = rightStartAngle + index * rightAngleStep;
            const targetX = Math.cos(angle * Math.PI / 180) * 110;
            const targetY = Math.sin(angle * Math.PI / 180) * 110;
            const delay = index * 50;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  action.onClick?.();
                  handleRadialMouseLeave();
                }}
                aria-label={action.label}
                title={action.title}
                className={cx('absolute flex h-11 w-11 items-center justify-center rounded-full shadow-lg hover:scale-110', radialTransitionClass)}
                style={{
                  transform: radialOpen ? `translate(${targetX}px, ${targetY}px)` : `translate(0px, 0px) scale(0)`,
                  opacity: radialOpen ? 1 : 0,
                  pointerEvents: radialOpen ? 'auto' : 'none',
                  transitionDelay: `${delay}ms`,
                  ...action.colorStyle,
                }}
              >
                {action.icon}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => radialOpen ? handleRadialMouseLeave() : handleRadialMouseEnter()}
          aria-label="Open page actions"
          aria-expanded={radialOpen}
          title="Page actions"
          className={cx(
            'relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl',
            radialOpen && 'pointer-events-none scale-0 opacity-0',
          )}
        >
          <span className="absolute transition-all duration-300" style={{ opacity: radialOpen ? 0 : 1, transform: radialOpen ? 'rotate(-90deg) scale(0.5)' : 'rotate(0deg) scale(1)' }}>
            <ColoredKebabIcon />
          </span>
          <X className="absolute h-5 w-5 text-slate-800 transition-all duration-300" style={{ opacity: radialOpen ? 1 : 0, transform: radialOpen ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)' }} aria-hidden />
        </button>
      </div>

      {renderFeedbackPanel && (
        <aside
          className={cx(
            'fixed right-0 top-0 z-command flex h-full w-[min(760px,92vw)] flex-col overflow-hidden border-l-[10px] border-hairline bg-white/82 shadow-hover backdrop-blur-[33px] transition-transform duration-500 ease-standard',
            feedbackPanelVisible ? 'translate-x-0' : 'translate-x-full',
          )}
          aria-label="Feedback"
        >
          <div className="flex min-h-24 items-center gap-7 border-b border-hairline px-8">
            <button
              type="button"
              onClick={onFeedbackClose}
              aria-label="Close feedback"
              className="grid h-12 w-12 place-items-center rounded-full border border-hairline bg-white/70 text-muted shadow-rest transition duration-300 ease-standard hover:text-brand-teal-deep"
            >
              <X className="h-6 w-6" aria-hidden />
            </button>
            <div className="flex flex-1 items-center gap-5">
              <button type="button" aria-label="Favorite" className="grid h-14 w-14 place-items-center rounded-full border border-hairline bg-white/70 text-ink shadow-rest">
                <Heart className="h-6 w-6" aria-hidden />
              </button>
              <button type="button" aria-label="Bookmark" className="grid h-14 w-14 place-items-center rounded-full border border-hairline bg-white/70 text-ink shadow-rest">
                <Bookmark className="h-6 w-6" aria-hidden />
              </button>
              <button type="button" aria-label="Share" className="grid h-14 w-14 place-items-center rounded-full border border-hairline bg-white/70 text-ink shadow-rest">
                <Share2 className="h-6 w-6" aria-hidden />
              </button>
            </div>
            <button type="button" aria-label="Information" className="grid h-14 w-14 place-items-center rounded-full border border-hairline bg-white/70 text-ink shadow-rest">
              <Info className="h-6 w-6" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-8 py-10 tablet-p:px-14">
            <h2 className="mb-6 text-[32px] font-medium leading-tight text-ink">Feedback</h2>
            <div className="mb-6 rounded-lg border border-card bg-white/45 p-5 shadow-rest backdrop-blur-[33px]">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">Current page context</p>
                  <p className="text-xs text-muted">{pathname}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const elements = scanCurrentPageElements();
                    setPageElements(elements);
                    setSelectedElement(elements[0] ?? null);
                  }}
                  className="rounded-md border border-hairline bg-white/60 px-3 py-1.5 text-xs text-secondary transition duration-300 hover:bg-white"
                >
                  Refresh elements
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {pageElements.length === 0 ? (
                  <span className="rounded-full bg-white/60 px-3 py-1.5 text-xs text-muted">No page elements detected</span>
                ) : pageElements.map((element) => (
                  <button
                    key={`${element.kind}-${element.label}-${element.detail}`}
                    type="button"
                    onClick={() => {
                      setSelectedElement(element);
                      setThreadMode('new');
                    }}
                    className={cx(
                      'shrink-0 rounded-full border px-3 py-1.5 text-xs transition duration-300',
                      selectedElement?.label === element.label && selectedElement.detail === element.detail
                        ? 'border-brand-teal bg-brand-teal text-on-brand'
                        : 'border-hairline bg-white/60 text-secondary hover:bg-white',
                    )}
                  >
                    {element.kind}: {element.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-card bg-white/45 p-5 shadow-rest backdrop-blur-[33px] [&_input]:relative [&_input]:z-base [&_textarea]:relative [&_textarea]:z-base">
              {threadMode === 'new' ? (
                <ThreadComposer
                  source={{ kind: 'general' }}
                  defaultType="general_question"
                  defaultCategory="other"
                  initialTitle={selectedElement ? `Feedback on ${selectedElement.label}` : `Feedback on ${pathname}`}
                  initialBody={[
                    `Page: ${pathname}`,
                    selectedElement ? `Element: ${selectedElement.kind} - ${selectedElement.label}` : '',
                    selectedElement?.detail ? `Element detail: ${selectedElement.detail}` : '',
                  ].filter(Boolean).join('\n')}
                  onDone={openThread}
                  onCancel={() => setThreadMode('list')}
                />
              ) : threadMode === 'detail' && selectedThreadId ? (
                <ThreadDetailPage
                  threadId={selectedThreadId}
                  onBack={() => setThreadMode('list')}
                  onOpenThread={openThread}
                  onOpenRoute={openThreadRoute}
                />
              ) : (
                <ThreadsPage
                  onOpenThread={openThread}
                  onStartThread={() => setThreadMode('new')}
                />
              )}
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
