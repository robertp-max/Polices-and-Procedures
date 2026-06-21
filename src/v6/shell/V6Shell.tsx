import { Outlet, matchPath, useLocation } from 'react-router-dom';
import { PageHeader } from './PageHeader';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Badge } from '../primitives';
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

  return (
    <div className="flex min-h-screen bg-canvas font-light text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <PageHeader
          badge={
            <span className="flex flex-wrap items-center gap-sm">
              <Badge>{route?.group ?? 'System'}</Badge>
              <Badge>{route?.hashId ?? 'unregistered'}</Badge>
            </span>
          }
          description={route?.description ?? 'Route placeholder outside the canonical V6 table.'}
          title={route?.title ?? 'Route Not Found'}
        />
        <main className="flex-1 px-2xl py-lg" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
