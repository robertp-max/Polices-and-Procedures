import { useLocation } from 'react-router-dom';
import React, { type ReactNode } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { getFlag } from '@/policy/pm/featureFlags';
import { isTrainer, isPathAllowedForTrainer } from './permissions';
import { AccessDenied } from './AccessDenied';

/**
 * MVP-P1-PERMS-001 — Role-based route gate.
 *
 * Wraps children. When the current user is in a deny-listed role for the
 * current pathname (per `permissions.ts`), renders <AccessDenied/>. Otherwise
 * renders children.
 *
 * Feature-flag gated: when `trainer_route_blocking` is OFF, the gate is a
 * passthrough (just renders children). This is the rollback handle.
 *
 * Usage in App.tsx (orchestrator-owned):
 *
 *   <Route path="/admin" element={<RoleGate denyTrainer><AdminLayout /></RoleGate>}>
 *
 * Or wrap a group via Outlet:
 *
 *   <Route element={<RoleGate denyTrainer><Outlet/></RoleGate>}>
 *     <Route path="/calendar" element={<MasterCalendarPage/>} />
 *     ...
 *   </Route>
 */

export interface RoleGateProps {
  /** Block Trainers on this route. Default true (since Trainer is the only role currently policy-managed). */
  denyTrainer?: boolean;
  /**
   * Optional allow-list of explicit roles. When provided, ONLY users in
   * this list pass. Trainers are still subject to the denyTrainer flag.
   */
  allowedRoles?: readonly string[];
  /**
   * Rendered when the user is denied. Defaults to <AccessDenied/>.
   */
  fallback?: ReactNode;
  children: ReactNode;
}

export function RoleGate({
  denyTrainer = true,
  allowedRoles,
  fallback,
  children,
}: RoleGateProps): React.ReactElement {
  const { user } = useAuth();
  const location = useLocation();

  if (!getFlag('trainer_route_blocking')) {
    return <>{children}</>;
  }

  const trainer = isTrainer(user);
  const pathname = location.pathname;

  // If explicit allowedRoles provided, enforce it (Trainers still blocked if denyTrainer)
  if (allowedRoles && allowedRoles.length > 0) {
    const effectiveRole = user?.role ?? '';
    if (!allowedRoles.some((r) => r.toLowerCase() === effectiveRole.toLowerCase())) {
      return <>{fallback ?? <AccessDenied role={effectiveRole || 'unknown'} />}</>;
    }
  }

  if (denyTrainer && trainer && !isPathAllowedForTrainer(pathname)) {
    return <>{fallback ?? <AccessDenied role="Trainer" />}</>;
  }

  return <>{children}</>;
}
