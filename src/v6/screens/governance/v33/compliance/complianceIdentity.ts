// Compliance learner identity.
//
// Official evidence must be bound to the AUTHENTICATED user. The historical
// local preview id (`gb-chair-local`) survives only as an explicit local-demo
// fallback for unauthenticated preview rendering — it is NEVER accepted on an
// official evidence write (enforced in complianceStore.commitEvidence).

import { useMemo } from 'react';
import { useAuth } from '@/auth/AuthProvider';

/** Preview-only identity. Rejected by every official evidence write. */
export const LOCAL_DEMO_LEARNER_ID = 'gb-chair-local';

/**
 * Explicit local-demo flag. The demo identity may be used for on-screen preview
 * ONLY when no authenticated user exists (e.g. a logged-out dev build). It is
 * not a write authorization: commitEvidence rejects it regardless of this flag.
 */
export const LOCAL_DEMO_PREVIEW_ALLOWED = true;

export function isLocalDemoLearnerId(learnerId: string | null | undefined): boolean {
  return learnerId === LOCAL_DEMO_LEARNER_ID;
}

/**
 * Resolves the compliance learner id from the authenticated user. Falls back to
 * the local-demo id only when preview fallback is allowed and no user exists.
 */
export function resolveLearnerId(authUserId: string | null | undefined): string {
  const trimmed = authUserId?.trim();
  if (trimmed) return trimmed;
  if (LOCAL_DEMO_PREVIEW_ALLOWED) return LOCAL_DEMO_LEARNER_ID;
  return LOCAL_DEMO_LEARNER_ID; // still demo — and still write-rejected downstream
}

/**
 * The one hook every compliance surface and player uses for identity.
 * Authenticated user id when present; local-demo preview id otherwise.
 */
export function useLearnerId(): string {
  const { user } = useAuth();
  // Canonical CIHHC userId first; legacy alias second (see AuthProvider.AuthUser).
  const authId = user?.userId ?? user?.id;
  return useMemo(() => resolveLearnerId(authId), [authId]);
}
