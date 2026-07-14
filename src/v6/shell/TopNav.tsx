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
    <div className="fixed left-0 right-0 top-16 tablet-l:top-6 flex flex-col w-full bg-transparent z-50 shrink-0 pointer-events-none [&_nav]:pointer-events-auto">
      <nav className="w-full flex justify-center mb-6 px-4 tablet-l:px-0">
        <div className="flex items-center rounded-full bg-white shadow-sm p-1 gap-1 tablet-l:gap-2 w-full max-w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {subnavItems.map(item => {
            const isActive = isSubnavItemActive(item);
            return (
              <Link
                key={item.id}
                to={item.to}
                className={cx(
                  'px-4 tablet-l:px-6 py-2 rounded-full text-[10px] tablet-l:text-xs font-semibold tracking-wider uppercase transition-all duration-300 whitespace-nowrap',
                  isActive
                    ? 'bg-brand-teal text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-brand-teal'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
