import { createBrowserRouter, Navigate } from 'react-router-dom';
import { V6Shell } from '../shell/V6Shell';
import { RouteErrorBoundary } from './RouteErrorBoundary';
import { routeToChildPath, V6_ROUTES } from './routeRegistry';
import { RepresentativeScreen } from '../screens';
import { NotFoundScreen } from '../screens/pageviews';
import { RequireAuth } from '../../auth/RequireAuth';

// Auth-group routes (login, setup, forgot/reset password) render OUTSIDE the
// protected shell; everything else requires an authenticated (or local-demo)
// session via RequireAuth.
const shellRoutes = V6_ROUTES.filter((route) => route.group !== 'Auth');
const authRoutes = V6_ROUTES.filter((route) => route.group === 'Auth');
const loginRoute = authRoutes.find((route) => route.hashId === 'login-page');

if (!loginRoute) {
  throw new Error('V6 route registry is missing login-page.');
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
        element: <RepresentativeScreen route={route} />,
        errorElement: <RouteErrorBoundary />,
      })),
      {
        path: '*',
        element: <NotFoundScreen />,
      },
    ],
  },
  ...authRoutes.map((route) => ({
    path: routeToChildPath(route.path),
    element: <RepresentativeScreen route={route} />,
    errorElement: <RouteErrorBoundary />,
  })),
]);
