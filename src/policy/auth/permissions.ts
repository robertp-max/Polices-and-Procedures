/**
 * MVP-P1-PERMS-001 — Trainer permission boundary policy.
 *
 * Single source of truth for which roles are blocked from which route prefixes
 * in the live app. The boundary is intentionally additive on top of the
 * existing route guards:
 *   - ProtectedRoute        → authentication only
 *   - FeatureRouteGuard     → feature-catalog permission checks
 *   - AdminRouteGuard       → /admin/* gate (Super Admin / Admin only)
 *   - RoleGate (NEW)        → role-deny list, primarily Trainer
 *
 * IMPORTANT IDENTITY GAP (documented for follow-on):
 *   `useAuth().user.role` is NOT reliably populated from the allowlist CSV
 *   in production today (`getCurrentUser` only returns Cognito attributes —
 *   email/name/verified, not the CSV `role` column). Until server-side role
 *   hydration ships, this module supports two detection paths:
 *     1. `user.role` if the auth provider populates it (demo mode, future
 *        server-merged path)
 *     2. `localStorage.__demo_user_role` (lowercase string) — DEV/STAGING
 *        ONLY override for testing the Trainer flow without server changes
 *   Production rollout requires server-side role merge into `getCurrentUser`.
 *   That is a follow-on ticket and is OUT OF SCOPE for Wave 4 PERMS-001.
 *
 * Per MVP plan: behind feature flag `trainer_route_blocking` (default ON;
 * flip OFF to instantly revert to pre-Wave-4 unguarded behavior).
 */

/** Canonical role labels handled by the boundary. Add more as the policy grows. */
export type AppRole =
  | 'Trainer'
  | 'Director'
  | 'Manager'
  | 'Caregiver'
  | 'Auditor'
  | 'Admin'
  | 'Super Admin'
  | 'Onboarding'
  | string; // catch-all for forward-compat with allowlist values

/** Tag for "role couldn't be determined". */
export const UNKNOWN_ROLE = '__unknown_role__';

/** Returns the user's effective role label as written on the allowlist, or UNKNOWN_ROLE. */
export function resolveEffectiveRole(authUser: { role?: string | null } | null | undefined): string {
  if (!authUser) return UNKNOWN_ROLE;
  const fromUser = authUser.role?.trim();
  if (fromUser) return fromUser;
  try {
    const override = window.localStorage.getItem('__demo_user_role');
    if (override && override.trim()) return override.trim();
  } catch {
    /* storage unavailable */
  }
  return UNKNOWN_ROLE;
}

/**
 * Returns true when the user is identified as a Trainer.
 * Case-insensitive comparison against effective role.
 */
export function isTrainer(authUser: { role?: string | null } | null | undefined): boolean {
  const role = resolveEffectiveRole(authUser);
  return role.toLowerCase() === 'trainer';
}

/**
 * Trainer route-deny policy.
 *
 * Trainers ARE ALLOWED on these prefixes (LMS / learning / journey):
 *   - /journey
 *   - /modules
 *   - /help
 *   - /me
 *
 * Trainers ARE BLOCKED from everything else by default UNLESS the path
 * matches an explicit allow rule below.
 *
 * The orchestrator will wrap restricted routes via <RoleGate> in App.tsx.
 * This map exists so the policy is auditable in one place.
 */
export interface RoutePolicy {
  /** Path prefix or exact path. Matched against `location.pathname` with `pathname === rule || pathname.startsWith(rule + '/')`. */
  path: string;
  /** Roles ALLOWED on this path. If 'all', everyone (including Trainer) is allowed. */
  allowedRoles: 'all' | readonly AppRole[];
  /** Optional human-readable note for audits. */
  note?: string;
}

export const TRAINER_ALLOWED_PREFIXES: readonly string[] = ['/journey', '/modules', '/help', '/me'] as const;

/**
 * Returns true when the given pathname is allowed for Trainers per the policy.
 * The orchestrator typically does NOT call this directly — RoleGate does.
 */
export function isPathAllowedForTrainer(pathname: string): boolean {
  const normalized = pathname.toLowerCase();
  return TRAINER_ALLOWED_PREFIXES.some((prefix) => {
    const p = prefix.toLowerCase();
    return normalized === p || normalized.startsWith(p + '/');
  });
}
