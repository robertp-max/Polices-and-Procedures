import { useEffect } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { cx } from '../utils/classNames';
import { primaryNavItems } from '../routing/navigationManifest';
import { V6_ROUTES } from '../routing/routeRegistry';

export function Sidebar() {
  const { pathname } = useLocation();

  const findActive = (items: readonly any[], path: string): { parent?: any; child?: any } | null => {
    for (const item of items) {
      const baseHashMatch = item.hashIds && item.hashIds.some((h: string) =>
        V6_ROUTES.some(r => r.hashId === h && matchPath({ path: r.path, end: !r.path.endsWith('/*') }, path))
      );
      const baseMatchPath = item.matchPaths && item.matchPaths.some((mp: string) => matchPath({ path: mp, end: false }, path));
      const baseExactOrPrefix = path === item.to || path.startsWith(item.to + '/');
      const matchesParent = baseHashMatch || baseMatchPath || baseExactOrPrefix;
      if (matchesParent) {
        return { parent: item };
      }
    }
    return null;
  };

  const active = findActive(primaryNavItems, pathname);

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
          {/* PRIMARY OPERATIONS */}
          <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted px-sm">PRIMARY OPERATIONS</div>
          {['brad', 'dashboard', 'clinicians', 'patients', 'calendar'].map(id => {
            const item = primaryNavItems.find(i => i.id === id)!;
            const isActive = active?.parent?.id === item.id;
            return (
              <Link
                key={item.id}
                to={item.to}
                aria-current={isActive ? 'page' : undefined}
                className={cx(
                  'flex min-h-row items-center gap-md rounded-lg px-md py-sm text-sm font-medium transition duration-fast ease-standard',
                  'focus-visible:outline-none focus-visible:shadow-focus',
                  isActive
                    ? 'bg-brand-teal-deep text-on-brand shadow-rest'
                    : 'text-brand-teal-deep hover:translate-x-1 hover:bg-surface-hover hover:text-brand-teal',
                )}
                data-sidebar-active={isActive ? 'true' : undefined}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* COMPLIANCE EXECUTION */}
          <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted px-sm mt-sm">COMPLIANCE EXECUTION</div>
          {['ces', 'taxonomy', 'onboarding', 'policy-lifecycle', 'evidence'].map(id => {
            const item = primaryNavItems.find(i => i.id === id)!;
            const isActive = active?.parent?.id === item.id;
            return (
              <Link
                key={item.id}
                to={item.to}
                aria-current={isActive ? 'page' : undefined}
                className={cx(
                  'flex min-h-row items-center gap-md rounded-lg px-md py-sm text-sm font-medium transition duration-fast ease-standard',
                  'focus-visible:outline-none focus-visible:shadow-focus',
                  isActive
                    ? 'bg-brand-teal-deep text-on-brand shadow-rest'
                    : 'text-brand-teal-deep hover:translate-x-1 hover:bg-surface-hover hover:text-brand-teal',
                )}
                data-sidebar-active={isActive ? 'true' : undefined}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* ADMINISTRATION / KNOWLEDGE */}
          <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted px-sm mt-sm">ADMINISTRATION / KNOWLEDGE</div>
          {['hubstaff', 'help-center', 'admin'].map(id => {
            const item = primaryNavItems.find(i => i.id === id);
            if (!item) return null; // guard: nav items can be removed without crashing the sidebar
            const isActive = active?.parent?.id === item.id;
            return (
              <Link
                key={item.id}
                to={item.to}
                aria-current={isActive ? 'page' : undefined}
                className={cx(
                  'flex min-h-row items-center gap-md rounded-lg px-md py-sm text-sm font-medium transition duration-fast ease-standard',
                  'focus-visible:outline-none focus-visible:shadow-focus',
                  isActive
                    ? 'bg-brand-teal-deep text-on-brand shadow-rest'
                    : 'text-brand-teal-deep hover:translate-x-1 hover:bg-surface-hover hover:text-brand-teal',
                )}
                data-sidebar-active={isActive ? 'true' : undefined}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
