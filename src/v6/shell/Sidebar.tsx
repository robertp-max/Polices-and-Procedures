import { Link, matchPath, useLocation } from 'react-router-dom';
import { cx } from '../utils/classNames';
import { getRouteChrome, SIDEBAR_SECTIONS } from '../routing/routePresentation';
import { routeToPreviewPath, V6_ROUTES } from '../routing/routeRegistry';

const shellRoutes = V6_ROUTES.filter((route) => route.group !== 'Auth');

export function Sidebar() {
  const location = useLocation();
  const currentRoute = shellRoutes.find((route) => Boolean(matchPath({ path: route.path, end: !route.path.endsWith('/*') }, location.pathname)));
  const activeSection = SIDEBAR_SECTIONS.find((section) => currentRoute ? section.hashIds.some((hashId) => hashId === currentRoute.hashId) : false);
  const activeHashId = currentRoute?.hashId;

  return (
    <aside className="sticky top-0 hidden h-screen w-sidebar shrink-0 overflow-hidden border-r border-hairline bg-white/70 text-ink shadow-[10px_0_28px_rgba(0,65,66,0.06)] backdrop-blur-xl laptop:block">
      <div className="relative z-10 grid gap-lg px-lg pb-lg pt-2xl">
        <div className="flex items-start gap-md">
          <div className="flex items-center gap-sm px-sm" aria-label="Care Indeed">
            <img
              src="/ci-logo-gray.png"
              alt="Care Indeed"
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>
      </div>

      <nav
        aria-label="V6 routes"
        className="h-[calc(100vh-128px)] overflow-y-auto px-lg pb-2xl pt-md"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0, black 34px, black calc(100% - 32px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, black 34px, black calc(100% - 32px), transparent 100%)',
        }}
      >
        <div className="grid gap-xl">
          {SIDEBAR_SECTIONS.map((section) => {
            const sectionRoutes = section.hashIds
              .map((hashId) => shellRoutes.find((route) => route.hashId === hashId))
              .filter((route): route is (typeof shellRoutes)[number] => Boolean(route));
            const isActiveSection = activeSection?.label === section.label;

            return (
              <section
                className={cx(
                  'grid scroll-mt-md gap-sm transition duration-base ease-standard',
                  isActiveSection && 'rounded-lg p-sm',
                )}
                data-sidebar-section={section.label}
                key={section.label}
              >
                <h2 className="px-sm text-[10px] font-medium uppercase tracking-[0.2em] text-muted">{section.label}</h2>
                <div className="grid gap-xs">
                  {sectionRoutes.map((route) => {
                    const chrome = getRouteChrome(route);
                    const Icon = chrome.icon;
                    const isCurrent = route.hashId === activeHashId;

                    return (
                      <Link
                        aria-current={isCurrent ? 'page' : undefined}
                        className={cx(
                          'flex min-h-row items-center gap-md rounded-lg px-md py-sm text-sm font-medium transition duration-fast ease-standard',
                          'focus-visible:outline-none focus-visible:shadow-focus',
                          isCurrent
                            ? 'bg-brand-teal-deep text-on-brand shadow-rest'
                            : 'text-brand-teal-deep hover:translate-x-1 hover:bg-surface-hover hover:text-brand-teal',
                        )}
                        key={route.hashId}
                        to={routeToPreviewPath(route.path)}
                      >
                        {Icon ? <Icon aria-hidden="true" className="h-icon-sm w-icon-sm shrink-0" /> : null}
                        <span>{chrome.navLabel}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
