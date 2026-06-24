import { createBrowserRouter, Navigate } from 'react-router-dom';
import { V6Shell } from '../shell/V6Shell';
import { RouteErrorBoundary } from './RouteErrorBoundary';
import { routeToChildPath, V6_ROUTES } from './routeRegistry';
import { RepresentativeScreen } from '../screens';
import { NotFoundScreen } from '../screens/pageviews';

const shellRoutes = V6_ROUTES.filter((route) => route.group !== 'Auth');
const loginRoute = V6_ROUTES.find((route) => route.hashId === 'login-page');

if (!loginRoute) {
  throw new Error('V6 route registry is missing login-page.');
}

export const v6Router = createBrowserRouter([
  {
    path: '/',
    element: <V6Shell />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate replace to="/dashboard" /> },
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
  {
    path: routeToChildPath(loginRoute.path),
    element: <RepresentativeScreen route={loginRoute} />,
    errorElement: <RouteErrorBoundary />,
  },
]);
