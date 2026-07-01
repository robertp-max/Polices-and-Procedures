import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { Link, Outlet, matchPath, useLocation, useNavigate } from 'react-router-dom';
import { Bot, Bookmark, ClipboardCheck, FileText, GitFork, GraduationCap, Heart, HelpCircle, Info, LayoutDashboard, Menu, MessageCircle, Settings, Share2, UserRound, Users, X } from 'lucide-react';
import { PersonalOpsPanel } from './PersonalOpsPanel';
import Dock from './Dock';
import { usePersonalOpsStore } from '../../policy/stores/personalOpsStore';
import { useUiStore } from '../../policy/stores/uiStore';
import { primaryNavItems, workspaceSubnavItems, type NavItem } from '../routing/navigationManifest';
import { V6_ROUTES } from '../routing/routeRegistry';
import { cx } from '../utils/classNames';
import { AnimatedCareIndeedLogo } from './AnimatedCareIndeedLogo';
import { GuidedTourRunner } from '../guided/GuidedTourRunner';
import { useGuidedTourStore } from '../guided/guidedTourStore';
import { ThreadComposer, ThreadDetailPage, ThreadsPage } from '../../policy/help-center/threads';

export function V6Shell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isPersonalOpsOpen, togglePersonalOps } = usePersonalOpsStore();
  const bradLanding = useUiStore((s) => s.bradLanding);
  const bradActivityActive = useUiStore((s) => s.bradActivityActive);
  const tourActive = useGuidedTourStore((s) => s.active);
  const mainRef = useRef<HTMLElement | null>(null);
  const [hasScrolledMain, setHasScrolledMain] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
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
  const isChromeFreeRoute = isLessonPlayerRoute || isDocumentPrintRoute || isPersonalProfileRoute;
  // Keep the dock visible during a guided tour so its nav targets stay anchorable.
  const showDock = !isChromeFreeRoute && (!pathname.startsWith('/iadministrator') || bradLanding || tourActive);
  const shellSubnavItems = useMemo(() => getShellSubnavItems(pathname), [pathname]);
  const showShellSubnav = !isChromeFreeRoute && shellSubnavItems.length > 0;
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

  const navIcons: Record<string, ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
    brad: Bot,
    dashboard: LayoutDashboard,
    ces: ClipboardCheck,
    taxonomy: GitFork,
    onboarding: GraduationCap,
    'policy-lifecycle': FileText,
    'help-center': HelpCircle,
    community: Users,
    admin: Settings,
  };

  const dockItems = useMemo(
    () =>
      primaryNavItems
        .filter((item) => item.id !== 'brad' && item.id !== 'help-center' && item.id !== 'community' && item.id !== 'admin')
        .map((item) => {
          const Icon = navIcons[item.id] ?? HelpCircle;
          return {
            icon: item.id === 'brad' ? <AnimatedCareIndeedLogo active={bradActivityActive} className="h-9 w-9" /> : <Icon className="h-5 w-5" aria-hidden />,
            label: item.label,
            onClick: () => navigate(item.to),
            isActive: activeNavItem === item.id,
            // Stable guided-tour anchors for nav targets.
            tourTarget: item.id === 'ces' ? 'nav.compliance' : item.id === 'help-center' ? 'nav.help' : undefined,
          };
        }),
    [activeNavItem, bradActivityActive, navigate],
  );

  // Close the nav drawer whenever the route changes.
  useEffect(() => { setNavOpen(false); }, [pathname]);

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
    <div className={cx('flex h-screen overflow-hidden font-light text-ink', isLessonPlayerRoute ? 'bg-surface-glass backdrop-blur-md shadow-glass-inset' : 'bg-canvas')}>
      {!isChromeFreeRoute && (
        <>
          {showDock && (
            <button
              type="button"
              onClick={() => navigate('/iadministrator')}
              aria-label="Open Brad"
              className={cx(
                'fixed left-5 top-5 z-popover hidden h-11 w-11 place-items-center rounded-full border border-transparent bg-white/65 text-ink shadow-rest backdrop-blur-[33px] transition duration-300 ease-standard hover:-translate-y-0.5 hover:bg-white/85 hover:text-brand-teal-deep hover:shadow-hover laptop:grid',
                activeNavItem === 'brad' && 'text-brand-teal',
              )}
            >
              <AnimatedCareIndeedLogo active={bradActivityActive} className="h-9 w-9" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={navOpen}
            className="fixed left-5 top-5 z-popover grid h-11 w-11 place-items-center rounded-full border border-hairline bg-white/65 text-ink shadow-rest backdrop-blur-[33px] transition duration-300 ease-standard hover:-translate-y-0.5 hover:bg-white/85 hover:text-brand-teal-deep hover:shadow-hover laptop:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            data-tour-target="nav.profile"
            onClick={togglePersonalOps}
            aria-label="Open personal operations"
            className={cx(
              'group fixed right-5 top-5 z-popover grid h-11 w-11 place-items-center rounded-full border border-transparent bg-white/65 text-ink shadow-rest backdrop-blur-[33px] transition duration-300 ease-standard hover:-translate-y-0.5 hover:bg-white/85 hover:text-brand-teal-deep hover:shadow-hover',
              isPersonalOpsOpen && 'text-brand-teal',
            )}
          >
            <UserRound className="absolute h-5 w-5 transition duration-500 ease-standard group-hover:scale-75 group-hover:opacity-0" aria-hidden />
            <span className="absolute text-sm font-medium opacity-0 transition duration-500 ease-standard group-hover:scale-100 group-hover:opacity-100">
              me :)
            </span>
          </button>
          {showDock && (
            <Dock
              items={dockItems}
              className="fixed left-5 top-[140px] z-sticky hidden laptop:flex flex-col gap-[76px]"
            />
          )}
          {showShellSubnav && (
            <ShellSubnav items={shellSubnavItems} currentPath={pathname} />
          )}
        </>
      )}

      {/* Off-canvas nav drawer support is intentionally retained for existing state but has no visible hamburger trigger in the top bar. */}
      {!isChromeFreeRoute && navOpen && (
        <div
          className="fixed inset-0 z-command bg-ink/20 backdrop-blur-sm"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}
      {!isChromeFreeRoute && navOpen && (
        <aside className="fixed left-0 top-0 z-command flex h-screen w-[min(320px,86vw)] flex-col bg-surface px-4 py-4 shadow-hover">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-medium text-brand-teal-deep">Navigation</span>
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              aria-label="Close navigation"
              className="grid h-10 w-10 place-items-center rounded-xl border border-transparent bg-transparent text-ink transition duration-500 ease-standard hover:bg-black/5 hover:text-brand-teal"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto" aria-label="Primary navigation">
            {primaryNavItems.map((item) => {
              const Icon = navIcons[item.id] ?? HelpCircle;
              const isActive = activeNavItem === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={cx(
                    'flex min-h-tap items-center gap-3 rounded-lg px-3 py-2 text-sm transition duration-500 ease-standard hover:bg-surface-hover hover:text-brand-teal-deep',
                    isActive ? 'bg-surface-hover font-medium text-brand-teal-deep' : 'text-ink',
                  )}
                >
                  {item.id === 'brad' ? <AnimatedCareIndeedLogo active={bradActivityActive} className="h-6 w-6" /> : <Icon className="h-5 w-5" aria-hidden />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-row">
          <main
            className={cx(
              'min-h-0 flex-1 overflow-y-auto overflow-x-hidden transition-[padding-right] duration-500 ease-standard',
              !isChromeFreeRoute && 'v6-main-scrollmask',
              isChromeFreeRoute || pathname.startsWith('/iadministrator') ? 'p-0' : 'pl-[calc(var(--space-lg)+10px)] pr-lg pb-32 pt-20 tablet-p:pl-[calc(var(--space-3xl)+50px)] tablet-p:pr-3xl',
              !isChromeFreeRoute && hasScrolledMain && 'v6-main-scrollmask--scrolled',
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
            <Outlet />
          </main>
        </div>
      </div>
      {!isChromeFreeRoute && renderPersonalPanel && (
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

      {!isChromeFreeRoute && (
        <FloatingActionRail
          renderFeedbackPanel={renderFeedbackPanel}
          feedbackPanelVisible={feedbackPanelVisible}
          hidden={isPersonalOpsOpen || feedbackOpen}
          onFeedbackOpen={() => setFeedbackOpen(true)}
          onFeedbackClose={() => setFeedbackOpen(false)}
        />
      )}

      {!isChromeFreeRoute && (
        <button
          type="button"
          onClick={() => navigate('/admin/user-groups')}
          aria-label="Open admin settings"
          className={cx(
            'fixed bottom-5 right-5 z-popover grid h-11 w-11 place-items-center rounded-full border border-hairline bg-white/65 text-ink shadow-rest backdrop-blur-[33px] transition duration-300 ease-standard hover:-translate-y-0.5 hover:bg-white/85 hover:text-brand-teal-deep hover:shadow-hover',
            activeNavItem === 'admin' && 'text-brand-teal'
          )}
        >
          <Settings className="h-5 w-5" aria-hidden />
        </button>
      )}

      {/* Brad Guided Assistance - global, route-spanning gated tour overlay. */}
      <GuidedTourRunner />
    </div>
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
      <div
        aria-label="Right panel dock"
        className={cx(
          'fixed right-5 top-1/2 z-popover grid -translate-y-1/2 gap-3 transition duration-300 ease-standard',
          hidden && 'pointer-events-none translate-x-8 opacity-0',
        )}
        aria-hidden={hidden ? 'true' : undefined}
      >
        <button
          type="button"
          onClick={openFeedback}
          aria-label="Open feedback"
          title="Feedback"
          className="grid h-11 w-11 place-items-center rounded-full border border-hairline bg-white/65 text-ink shadow-rest backdrop-blur-[33px] transition duration-300 ease-standard hover:-translate-y-0.5 hover:bg-white/85 hover:text-brand-teal-deep hover:shadow-hover"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => navigate('/help')}
          aria-label="Open help center"
          title="Help"
          className="grid h-11 w-11 place-items-center rounded-full border border-hairline bg-white/65 text-ink shadow-rest backdrop-blur-[33px] transition duration-300 ease-standard hover:-translate-y-0.5 hover:bg-white/85 hover:text-brand-teal-deep hover:shadow-hover"
        >
          <HelpCircle className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Share"
          title="Share"
          className="grid h-11 w-11 place-items-center rounded-full border border-hairline bg-white/65 text-ink shadow-rest backdrop-blur-[33px] transition duration-300 ease-standard hover:-translate-y-0.5 hover:bg-white/85 hover:text-brand-teal-deep hover:shadow-hover"
        >
          <Share2 className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Information"
          title="Info"
          className="grid h-11 w-11 place-items-center rounded-full border border-hairline bg-white/65 text-ink shadow-rest backdrop-blur-[33px] transition duration-300 ease-standard hover:-translate-y-0.5 hover:bg-white/85 hover:text-brand-teal-deep hover:shadow-hover"
        >
          <Info className="h-5 w-5" aria-hidden />
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

type ShellSubnavItem = NavItem & { brand?: boolean };

function getShellSubnavItems(pathname: string): ShellSubnavItem[] {
  const p = (pathname || '').split(/[?#]/)[0];
  const isCESGroup =
    p.startsWith('/ces/') ||
    p.startsWith('/events/') ||
    p === '/audit' ||
    p === '/evidence' ||
    p.startsWith('/evidence/') ||
    p.startsWith('/compliance/');
  const isTaxonomyGroup =
    p.startsWith('/framework') ||
    p.startsWith('/library') ||
    p.startsWith('/forms') ||
    p.startsWith('/taxonomy') ||
    p.startsWith('/achc') ||
    p.startsWith('/workflows') ||
    p.startsWith('/policy-lifecycle') ||
    p === '/policy-approvals' ||
    p === '/pm/approvals';

  if (isCESGroup) {
    const cesItemsById = new Map(workspaceSubnavItems.ces.map((item) => [item.id, item]));
    const orderedItems = [
      cesItemsById.get('defensible-2') ? { ...cesItemsById.get('defensible-2')!, label: 'DefenCIble', brand: true } : undefined,
      cesItemsById.get('ces-calendar'),
      cesItemsById.get('master-controls'),
      cesItemsById.get('audit-mode'),
      cesItemsById.get('ai-compliance-review'),
      cesItemsById.get('ces-reports'),
    ];
    return orderedItems.filter((item): item is ShellSubnavItem => Boolean(item));
  }

  if (isTaxonomyGroup) return workspaceSubnavItems.taxonomy;
  return [];
}

function ShellSubnav({ items, currentPath }: { items: ShellSubnavItem[]; currentPath: string }) {
  const p = (currentPath || '').split(/[?#]/)[0];
  const safeItems = items.filter((item): item is ShellSubnavItem => Boolean(item?.to));
  const activeTo = safeItems.reduce((best, item) => {
    const to = item.to;
    const matches = item.matchPaths
      ? item.matchPaths.some((match) => matchPath({ path: match, end: false }, p))
      : p === to || p.startsWith(`${to}/`);
    if (!matches) return best;
    return !best || to.length > best.length ? to : best;
  }, null as string | null);

  return (
    <nav
      aria-label="Workspace subnav"
      className="fixed left-[104px] right-0 top-5 z-[9999] overflow-x-auto border-b border-[#E2E8F0] bg-transparent [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="inline-flex min-w-max items-end gap-8">
        {safeItems.map((item) => {
          const isActive = activeTo === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              data-tour-target={item.id === 'defensible-2' ? 'nav.evidence' : undefined}
              aria-current={isActive ? 'page' : undefined}
              className={cx(
                'shrink-0 border-b-4 px-0 pb-4 pt-1 text-[22px] font-semibold uppercase leading-none tracking-[0.1em] text-[#66748C] transition-all duration-base ease-standard hover:border-brand-teal hover:text-brand-teal-deep',
                isActive ? 'border-brand-teal text-brand-teal-deep' : 'border-transparent',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
