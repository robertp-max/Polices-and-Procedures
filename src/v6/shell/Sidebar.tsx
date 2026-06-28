import { useEffect } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { cx } from '../utils/classNames';
import { primaryNavItems } from '../routing/navigationManifest';
import { V6_ROUTES } from '../routing/routeRegistry';
import { getIdentity, setIdentity, DEV_IDENTITIES } from '../screens/brad/bradApi';

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
    <aside className="sticky top-0 z-command h-screen w-sidebar shrink-0 overflow-hidden border-r border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset text-ink shadow-sidebar backdrop-blur-xl flex flex-col">
      {/* Top spacer clears the fixed hamburger + logo cluster rendered by V6Shell. */}
      <div className="relative z-10 shrink-0 px-lg pt-[64px]" aria-hidden />

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
          {['brad', 'dashboard'].map(id => {
            const item = primaryNavItems.find(i => i.id === id);
            if (!item) return null; // guard: hidden/removed nav items must not crash the sidebar
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
          {['ces', 'taxonomy', 'onboarding'].map(id => {
            const item = primaryNavItems.find(i => i.id === id);
            if (!item) return null; // guard: hidden/removed nav items must not crash the sidebar
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
          {['help-center', 'admin'].map(id => {
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

      {/* Footer: acting-as identity (server independently verifies Super Admin). */}
      <div className="shrink-0 border-t border-hairline px-lg py-md">
        <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
          Acting as
        </label>
        <select
          aria-label="Acting-as identity (server verifies Super Admin)"
          title="Review identity — the server independently verifies Super Admin status"
          defaultValue={getIdentity().userId}
          onChange={(e) => { setIdentity(e.target.value); window.location.reload(); }}
          className="mt-1 w-full rounded-md border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset px-2 py-1.5 text-xs text-ink focus-visible:outline-none focus-visible:shadow-focus"
        >
          {DEV_IDENTITIES.map((d) => (
            <option key={d.userId} value={d.userId}>{d.displayName}</option>
          ))}
        </select>
      </div>
    </aside>
  );
}
