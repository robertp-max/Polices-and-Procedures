import { Outlet, matchPath, useLocation } from 'react-router-dom';
import { PageHeader } from './PageHeader';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DRAWER_SYSTEM_CHROME, getRouteChrome } from '../routing/routePresentation';
import { V6_ROUTES } from '../routing/routeRegistry';

function resolveCurrentRoute(pathname: string) {
  return V6_ROUTES.find((route) => {
    if (route.group === 'Auth') return false;
    return matchPath({ path: route.path, end: !route.path.endsWith('/*') }, pathname);
  });
}

export function V6Shell() {
  const location = useLocation();
  const route = resolveCurrentRoute(location.pathname);
  const searchParams = new URLSearchParams(location.search);
  const chrome = searchParams.get('v6-overlay') === 'drawer-system' ? DRAWER_SYSTEM_CHROME : getRouteChrome(route);

  return (
    <div className="flex min-h-screen bg-canvas font-light text-ink">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <Topbar />
        <PageHeader
          badge={
            <span className="inline-flex items-center gap-xs rounded-sm border border-tone-teal-border bg-tone-teal-bg px-sm py-xs text-tag uppercase tracking-tag text-brand-teal">
              <span className="h-xs w-xs rounded-sm bg-brand-teal" />
              {chrome.eyebrow}
            </span>
          }
          description={chrome.description}
          title={chrome.title}
        />
        <main className="flex-1 px-3xl pb-3xl pt-xl" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
