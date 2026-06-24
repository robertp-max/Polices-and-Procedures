import { useEffect } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { cx } from '../utils/classNames';
import { SIDEBAR_NAV } from '../routing/navigationManifest';
import { V6_ROUTES } from '../routing/routeRegistry';
import { SIDEBAR_SECTIONS } from '../routing/routePresentation';

const shellRoutes = V6_ROUTES.filter((route) => route.group !== 'Auth');

export function Sidebar() {
  const { pathname } = useLocation();
  const currentRoute = shellRoutes.find((route) => Boolean(matchPath({ path: route.path, end: !route.path.endsWith('/*') }, pathname)));
  const activeSection = SIDEBAR_SECTIONS.find((section) => currentRoute ? section.hashIds.some((hashId) => hashId === currentRoute.hashId) : false);
  const activeHashId = currentRoute?.hashId;

  useEffect(() => {
    const activeLink = document.querySelector<HTMLElement>('[data-sidebar-active="true"]');
    activeLink?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeHashId]);

  return (
    <aside className="sticky top-0 z-command h-screen w-sidebar shrink-0 overflow-hidden border-r border-hairline bg-white/70 text-ink shadow-sidebar backdrop-blur-xl flex flex-col">
      <div className="relative z-10 shrink-0 grid gap-lg px-lg pb-lg pt-2xl">
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
        className="flex-1 overflow-y-auto px-lg pb-2xl pt-md"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0, black 34px, black calc(100% - 32px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, black 34px, black calc(100% - 32px), transparent 100%)',
        }}
      >
        <div className="grid gap-xl">
          {SIDEBAR_NAV.map((item) => {
            const isCurrent = currentRoute?.hashId === item.hashIds[0] || item.children?.some(c => currentRoute?.hashId === c.hashIds[0]);
            return (
              <section
                className={cx(
                  'grid scroll-mt-md gap-sm transition duration-base ease-standard',
                  isCurrent && 'rounded-lg p-sm',
                )}
                data-sidebar-section={item.label}
                key={item.id}
              >
                <Link
                  to={item.to}
                  className={cx(
                    'px-sm text-[10px] font-medium uppercase tracking-[0.2em] text-muted hover:text-brand-teal',
                    isCurrent && 'text-brand-teal-deep'
                  )}
                >
                  {item.label}
                </Link>
                <div className="grid gap-xs">
                  <Link
                    aria-current={isCurrent ? 'page' : undefined}
                    className={cx(
                      'flex min-h-row items-center gap-md rounded-lg px-md py-sm text-sm font-medium transition duration-fast ease-standard',
                      'focus-visible:outline-none focus-visible:shadow-focus',
                      isCurrent
                        ? 'bg-brand-teal-deep text-on-brand shadow-rest'
                        : 'text-brand-teal-deep hover:translate-x-1 hover:bg-surface-hover hover:text-brand-teal',
                    )}
                    data-sidebar-active={isCurrent ? 'true' : undefined}
                    key={item.id}
                    to={item.to}
                  >
                    <span>{item.label}</span>
                  </Link>
                  {item.children?.map((child) => {
                    const isChildCurrent = currentRoute?.hashId === child.hashIds[0];
                    return (
                      <Link
                        aria-current={isChildCurrent ? 'page' : undefined}
                        className={cx(
                          'ml-md flex min-h-row items-center gap-md rounded-lg px-md py-sm text-sm font-medium transition duration-fast ease-standard',
                          'focus-visible:outline-none focus-visible:shadow-focus',
                          isChildCurrent
                            ? 'bg-brand-teal-deep text-on-brand shadow-rest'
                            : 'text-brand-teal-deep hover:translate-x-1 hover:bg-surface-hover hover:text-brand-teal',
                        )}
                        data-sidebar-active={isChildCurrent ? 'true' : undefined}
                        key={child.id}
                        to={child.to}
                      >
                        <span>{child.label}</span>
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
