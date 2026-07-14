/**
 * RequireAuth — Phase COG-1 route guard.
 *
 * Wraps the protected V6 shell. While the session is still resolving it
 * renders a neutral loading state (protected pages never flash), then either
 * renders children (authenticated, or local demo-bypass hosts) or redirects
 * to /login with a safe returnTo.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center bg-tone-teal-bg text-secondary" role="status" aria-live="polite">
        <div className="flex items-center gap-sm text-sm font-light">
          <span className="h-3 w-3 animate-pulse rounded-full bg-brand-teal" aria-hidden="true" />
          Checking your session…
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    const returnTo = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate replace to={`/login?returnTo=${returnTo}`} />;
  }

  // 'authenticated' or 'demo' (local development bypass only — see bypass.ts).
  return <>{children}</>;
};
