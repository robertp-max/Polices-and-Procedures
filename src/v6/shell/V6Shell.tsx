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
  Shield,
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
import { MobileNavDrawer } from './MobileNavDrawer';

const NAV_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutGrid,
  ces: ClipboardCheck,
  defensible: Shield,
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
          const order = ['dashboard', 'ces', 'taxonomy', 'onboarding', 'help-center', 'defensible'];
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
      frame = window.requestAnimationFrame(() => {
        setRenderPersonalPanel(true);
        setPersonalPanelVisible(true);
      });
    } else {
      frame = window.requestAnimationFrame(() => setPersonalPanelVisible(false));
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
      frame = window.requestAnimationFrame(() => {
        setRenderFeedbackPanel(true);
        setFeedbackPanelVisible(true);
      });
    } else {
      frame = window.requestAnimationFrame(() => setFeedbackPanelVisible(false));
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
                'hidden tablet-l:grid',
                'fixed left-5 top-5 z-popover h-11 w-11 place-items-center rounded-full bg-transparent text-ink shadow-none transition duration-300 ease-standard hover:-translate-y-0.5 hover:text-brand-teal-deep',
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
            <div className="hidden tablet-l:block">
              <LeftRadialDock
                items={dockItems.filter((item) => item.id !== 'defensible')}
                centerItems={dockItems.filter((item) => item.id === 'defensible')}
              />
            </div>
          )}
          {showDock && (
            <MobileNavDrawer
              items={dockItems}
              bradItem={{
                icon: <AnimatedCareIndeedLogo active={bradActivityActive} className="h-6 w-6" />,
                onClick: () => navigate('/iadministrator')
              }}
            />
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
                  'px-md pb-32 tablet-l:pl-[calc(var(--space-lg)+10px)] tablet-l:pr-lg tablet-p:pl-[calc(var(--space-3xl)+50px)] tablet-p:pr-3xl',
                  'pt-20 tablet-l:pt-6',
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
                    : isPersonalOpsOpen
                      ? { paddingRight: 'min(380px, 92vw)' }
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

type RadialDockItem = {
  id: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  colorStyle?: CSSProperties;
  tourTarget?: string;
};

function DockButton({ item }: { item: RadialDockItem }) {
  return (
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
  );
}

function LeftRadialDock({ items, centerItems = [] }: { items: RadialDockItem[]; centerItems?: RadialDockItem[] }) {
  return (
    <>
      <nav
        aria-label="Primary navigation"
        className="fixed left-5 top-[82px] z-[50] flex flex-col items-center gap-2"
      >
        {items.map((item) => (
          <DockButton key={item.id} item={item} />
        ))}
      </nav>
      {centerItems.length > 0 && (
        <nav
          aria-label="DefenCIble"
          className="fixed left-5 top-1/2 z-[50] flex -translate-y-1/2 flex-col items-center gap-2"
        >
          {centerItems.map((item) => (
            <DockButton key={item.id} item={item} />
          ))}
        </nav>
      )}
    </>
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
  return (
    <>
        <button
          type="button"
          onClick={openFeedback}
          aria-label="Open feedback"
          title="Feedback"
          className={cx(
            'fixed right-6 top-1/2 z-[50] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-500 shadow-lg transition-all duration-300 hover:scale-105 hover:text-brand-teal-deep hover:shadow-xl',
            hidden && 'pointer-events-none opacity-0',
          )}
        >
          <MessageSquare className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
        </button>

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
