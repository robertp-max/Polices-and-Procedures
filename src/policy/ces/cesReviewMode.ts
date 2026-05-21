/* ═══════════════════════════════════════════════════════════════
   CES Review Mode — Robert-only role simulation layer.
   ---------------------------------------------------------------
   AUTHORIZED USER: robertp@careindeed.com ONLY.

   Purpose:
     Allows Robert to simulate CES workflows from any role perspective
     without altering real permissions, production state, or audit trail.

   Rules:
   - Hidden entirely from all other users.
   - Does NOT mutate real user roles.
   - Does NOT create fake production audit entries (unless marked
     ROBERT_REVIEW_MODE).
   - Persists selected review role in localStorage for Robert only.
   - All code is isolated in this file + CesRoleReviewSwitcher.
     (RobertCesReviewLayer debug overlay was removed as dead code.)
     Delete this file + CesRoleReviewSwitcher to remove the feature entirely.
   ═══════════════════════════════════════════════════════════════ */

import { useState, useEffect, useCallback } from 'react';
import type { CesRole } from './cesRoles';
import { CES_ROLES } from './cesRoles';

/* ─── Authorized user ────────────────────────────────────── */

const ROBERT_EMAIL = 'robertp@careindeed.com';
const ROBERT_USER_ID = 'demo-user-careindeed';

/** Returns true only for the authorized review user. */
export function isRobertUser(email?: string | null, userId?: string | null): boolean {
  if (email && email.toLowerCase().trim() === ROBERT_EMAIL) return true;
  if (userId && userId === ROBERT_USER_ID)                  return true;
  return false;
}

/* ─── Persistence key ────────────────────────────────────── */

const REVIEW_ROLE_KEY = 'ces_robert_review_role';

function safeGet(): CesRole | null {
  try {
    const stored = localStorage.getItem(REVIEW_ROLE_KEY);
    if (stored && (CES_ROLES as readonly string[]).includes(stored)) {
      return stored as CesRole;
    }
  } catch {
    // localStorage unavailable (SSR / security restriction)
  }
  return null;
}

function safeSet(role: CesRole | null): void {
  try {
    if (role === null) {
      localStorage.removeItem(REVIEW_ROLE_KEY);
    } else {
      localStorage.setItem(REVIEW_ROLE_KEY, role);
    }
  } catch {
    // ignore
  }
}

/* ─── Public API ─────────────────────────────────────────── */

/**
 * Returns the currently persisted CES review role for Robert.
 * Returns null when no role is selected or user is not Robert.
 */
export function getCesReviewRole(email?: string | null, userId?: string | null): CesRole | null {
  if (!isRobertUser(email, userId)) return null;
  return safeGet();
}

/**
 * Persists the selected CES review role for Robert.
 * No-op for all other users.
 */
export function setCesReviewRole(
  role:   CesRole | null,
  email?: string | null,
  userId?: string | null,
): void {
  if (!isRobertUser(email, userId)) return;
  safeSet(role);
}

/* ─── React hook ─────────────────────────────────────────── */

export interface CesReviewModeState {
  /** True only when robertp@careindeed.com is the current user. */
  isEnabled:       boolean;
  /** Currently selected review role, or null (= real permissions). */
  reviewRole:      CesRole | null;
  /** All roles Robert can switch between. */
  availableRoles:  readonly CesRole[];
  setReviewRole:   (role: CesRole | null) => void;
  clearReviewRole: () => void;
}

/**
 * Robert-only CES role review mode hook.
 *
 * Usage:
 *   const { isEnabled, reviewRole, setReviewRole } = useCesReviewMode(user?.email);
 *
 * When isEnabled === false, nothing is rendered — the hook is a no-op for all
 * other users.
 */
export function useCesReviewMode(
  email?:  string | null,
  userId?: string | null,
): CesReviewModeState {
  const enabled = isRobertUser(email, userId);
  const [reviewRole, setReviewRoleState] = useState<CesRole | null>(
    () => (enabled ? safeGet() : null),
  );

  // Keep state in sync when localStorage changes from another tab/window
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: StorageEvent) => {
      if (e.key === REVIEW_ROLE_KEY) {
        setReviewRoleState(safeGet());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [enabled]);

  const setReviewRole = useCallback((role: CesRole | null) => {
    if (!enabled) return;
    safeSet(role);
    setReviewRoleState(role);
  }, [enabled]);

  const clearReviewRole = useCallback(() => {
    if (!enabled) return;
    safeSet(null);
    setReviewRoleState(null);
  }, [enabled]);

  return {
    isEnabled:      enabled,
    reviewRole:     enabled ? reviewRole : null,
    availableRoles: CES_ROLES,
    setReviewRole,
    clearReviewRole,
  };
}

