import { useMemo } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import {
  chromeOnlyPrimaryNavItemIds,
  primaryNavItems,
  workspaceSubnavItems,
} from '../routing/navigationManifest';
import { cx } from '../utils/classNames';
import { V6_ROUTES } from '../routing/routeRegistry';

const navPath = (to: string) => to.split('?')[0] || to;

function NavLabel({ id, label }: { id: string; label: string }) {
  if (id !== 'defensible-2') return <>{label}</>;
  return (
    <>
      Defen<span className="!text-brand-teal">CI</span>ble
    </>
  );
}

export function TopNav() {
  const { pathname } = useLocation();

  const activePrimaryItem = useMemo(() => {
    for (const item of primaryNavItems) {
      const itemPath = navPath(item.to);
      const hashMatch = item.hashIds?.some((hashId: string) =>
        V6_ROUTES.some((route) =>
          route.hashId === hashId && matchPath({ path: route.path, end: !route.path.endsWith('/*') }, pathname)
        )
      );
      const routeMatch = item.matchPaths?.some((match) => matchPath({ path: match, end: false }, pathname));
      const exactOrPrefix = pathname === itemPath || pathname.startsWith(`${itemPath}/`);
      if (hashMatch || routeMatch || exactOrPrefix) return item;
    }
    return null;
  }, [pathname]);

  const activeGroupId =
    activePrimaryItem && !chromeOnlyPrimaryNavItemIds.has(activePrimaryItem.id)
      ? activePrimaryItem.id
      : null;

  const subnavItems = useMemo(() => {
    if (!activeGroupId) return [];
    if (activeGroupId === 'ces') return workspaceSubnavItems.ces || [];
    if (activeGroupId === 'taxonomy') return workspaceSubnavItems.taxonomy || [];
    if (activeGroupId === 'onboarding') return workspaceSubnavItems.onboarding || [];
    return [];
  }, [activeGroupId]);

  const showSubnav = subnavItems.length > 1;
  const isSubnavItemActive = (item: (typeof subnavItems)[number]) => {
    const itemPath = navPath(item.to);
    const hashMatch = item.hashIds?.some((hashId: string) =>
      V6_ROUTES.some((route) =>
        route.hashId === hashId && matchPath({ path: route.path, end: !route.path.endsWith('/*') }, pathname)
      )
    );
    const routeMatch = item.matchPaths?.some((match) => matchPath({ path: match, end: false }, pathname));
    const exactOrPrefix = pathname === itemPath || (itemPath !== '/' && pathname.startsWith(`${itemPath}/`));
    return Boolean(hashMatch || routeMatch || exactOrPrefix);
  };

  if (!showSubnav) return null;

  return (
    <div className="fixed left-0 right-0 top-6 flex flex-col w-full bg-transparent z-50 shrink-0 pointer-events-none [&_nav]:pointer-events-auto">
      <nav className="w-full flex justify-center mb-6">
        <div className="flex items-center rounded-full bg-white shadow-sm p-1 gap-2">
          {subnavItems.map(item => {
            const isActive = isSubnavItemActive(item);
            return (
              <Link
                key={item.id}
                to={item.to}
                className={cx(
                  'px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase',
                  isActive
                    ? 'bg-brand-teal text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-brand-teal'
                )}
              >
                <NavLabel id={item.id} label={item.label} />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
