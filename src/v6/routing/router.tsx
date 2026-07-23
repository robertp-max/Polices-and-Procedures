import { createBrowserRouter, Navigate } from 'react-router-dom';
import { V6Shell } from '../shell/V6Shell';
import { RouteErrorBoundary } from './RouteErrorBoundary';
import { routeToChildPath, type V6RouteDefinition, V6_ROUTES } from './routeRegistry';
import { RepresentativeScreen } from '../screens';
import { GovernanceScreen, NotFoundScreen } from '../screens/pageviews';
import { RequireAuth } from '../../auth/RequireAuth';

// Auth-group routes (login, setup, forgot/reset password) render OUTSIDE the
// protected shell; everything else requires an authenticated (or local-demo)
// session via RequireAuth.
// Governing Body Portal renders STANDALONE (full-screen, its own executive rail) —
// NOT inside the V6 app shell, so the app's floating dock/chrome never appears over it.
const isGovernanceRoute = (path: string) => path === '/governance' || path.startsWith('/governance/');
const shellRoutes = V6_ROUTES.filter((route) => route.group !== 'Auth' && !isGovernanceRoute(route.path));
const governanceRoutes = V6_ROUTES.filter((route) => route.group !== 'Auth' && isGovernanceRoute(route.path));
const authRoutes = V6_ROUTES.filter((route) => route.group === 'Auth');
const loginRoute = authRoutes.find((route) => route.hashId === 'login-page');

if (!loginRoute) {
  throw new Error('V6 route registry is missing login-page.');
}

function routeElement(route: V6RouteDefinition) {
  if (route.path === '/packet-studio') {
    return <Navigate replace to="/evidence/packet-studio" />;
  }

  return <RepresentativeScreen route={route} />;
}

export const v6Router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <V6Shell />
      </RequireAuth>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate replace to="/compliance" /> },
      ...shellRoutes.map((route) => ({
        path: routeToChildPath(route.path),
        element: routeElement(route),
        errorElement: <RouteErrorBoundary />,
      })),
      {
        path: '*',
        element: <NotFoundScreen />,
      },
    ],
  },
  // Governing Body Portal — authenticated but OUTSIDE the app shell (full-screen standalone).
  // Registered routes first (they expose :params like :moduleId / :meetingId that the portal
  // reads via useParams)...
  ...governanceRoutes.map((route) => ({
    path: routeToChildPath(route.path),
    element: <RequireAuth><GovernanceScreen /></RequireAuth>,
    errorElement: <RouteErrorBoundary />,
  })),
  // ...then a catch-all so ANY other /governance/* path (e.g. links inside the portal like
  // /governance/policies) still renders the portal and NEVER falls back to the app shell.
  {
    path: 'governance/*',
    element: <RequireAuth><GovernanceScreen /></RequireAuth>,
    errorElement: <RouteErrorBoundary />,
  },
  ...authRoutes.map((route) => ({
    path: routeToChildPath(route.path),
    element: routeElement(route),
    errorElement: <RouteErrorBoundary />,
  })),
]);
