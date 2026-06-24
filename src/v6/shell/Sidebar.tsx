import { useEffect } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { cx } from '../utils/classNames';
import { SIDEBAR_NAV } from '../routing/navigationManifest';
import { V6_ROUTES } from '../routing/routeRegistry';

export function Sidebar() {
  const { pathname } = useLocation();

  const findActive = (items: readonly any[], path: string): { parent?: any; child?: any } | null => {
    for (const item of items) {
      // match by explicit to, hashIds (all routes, supports shared hashIds), matchPaths, or prefix
      const baseHashMatch = item.hashIds && item.hashIds.some((h: string) =>
        V6_ROUTES.some(r => r.hashId === h && matchPath({ path: r.path, end: !r.path.endsWith('/*') }, path))
      );
      const baseMatchPath = item.matchPaths && item.matchPaths.some((mp: string) => matchPath({ path: mp, end: false }, path));
      const baseExactOrPrefix = path === item.to || path.startsWith(item.to + '/');
      const matchesParent = baseHashMatch || baseMatchPath || baseExactOrPrefix;
      if (matchesParent) {
        if (item.children) {
          for (const child of item.children) {
            const childHash = child.hashIds && child.hashIds.some((h: string) =>
              V6_ROUTES.some(r => r.hashId === h && matchPath({ path: r.path, end: !r.path.endsWith('/*') }, path))
            );
            const childMatchPath = child.matchPaths && child.matchPaths.some((mp: string) => matchPath({ path: mp, end: false }, path));
            const childPrefix = path === child.to || path.startsWith(child.to + '/');
            if (childHash || childMatchPath || childPrefix) return { parent: item, child };
          }
        }
        return { parent: item };
      }
      if (item.children) {
        const res = findActive(item.children, path);
        if (res) return { parent: item, ...res };
      }
    }
    return null;
  };

  const active = findActive(SIDEBAR_NAV, pathname);

  useEffect(() => {
    const activeLink = document.querySelector<HTMLElement>('[data-sidebar-active="true"]');
    activeLink?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [pathname]);

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
            const isParentActive = active?.parent?.id === item.id;
            const isChildActive = active?.child?.id && item.children?.some(c => c.id === active.child.id);
            return (
              <section
                className={cx(
                  'grid scroll-mt-md gap-sm transition duration-base ease-standard',
                  isParentActive && 'rounded-lg p-sm',
                )}
                data-sidebar-section={item.label}
                key={item.id}
              >
                <Link
                  to={item.to}
                  className={cx(
                    'px-sm text-[10px] font-medium uppercase tracking-[0.2em] text-muted hover:text-brand-teal',
                    isParentActive && 'text-brand-teal-deep'
                  )}
                >
                  {item.label}
                </Link>
                <div className="grid gap-xs">
                  <Link
                    aria-current={isParentActive && !isChildActive ? 'page' : undefined}
                    className={cx(
                      'flex min-h-row items-center gap-md rounded-lg px-md py-sm text-sm font-medium transition duration-fast ease-standard',
                      'focus-visible:outline-none focus-visible:shadow-focus',
                      isParentActive && !isChildActive
                        ? 'bg-brand-teal-deep text-on-brand shadow-rest'
                        : 'text-brand-teal-deep hover:translate-x-1 hover:bg-surface-hover hover:text-brand-teal',
                    )}
                    data-sidebar-active={isParentActive && !isChildActive ? 'true' : undefined}
                    key={item.id}
                    to={item.to}
                  >
                    <span>{item.label}</span>
                  </Link>
                  {item.children?.map((child) => {
                    const isThisChildActive = active?.child?.id === child.id;
                    return (
                      <Link
                        aria-current={isThisChildActive ? 'page' : undefined}
                        className={cx(
                          'ml-md flex min-h-row items-center gap-md rounded-lg px-md py-sm text-sm font-medium transition duration-fast ease-standard',
                          'focus-visible:outline-none focus-visible:shadow-focus',
                          isThisChildActive
                            ? 'bg-brand-teal-deep text-on-brand shadow-rest'
                            : 'text-brand-teal-deep hover:translate-x-1 hover:bg-surface-hover hover:text-brand-teal',
                        )}
                        data-sidebar-active={isThisChildActive ? 'true' : undefined}
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
