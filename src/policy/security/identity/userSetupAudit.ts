/**
 * User-setup audit trail (Phase 2E) — **Demo audit trail — not tamper-evident**.
 *
 * Client-side only (localStorage). Editable via devtools; no hash chain, no
 * server append-only store. Do not present this as a production security
 * control. Real IdP-bound audit is Phase 2F.
 *
 * Field naming: use `createdAt` (ISO). Never `at` — that mismatch is a known
 * onboarding-v2 consumer bug.
 */

export const USER_SETUP_AUDIT_STORAGE_KEY = 'ci.identitySetupAudit.v1';
export const MAX_USER_SETUP_AUDIT_ENTRIES = 200;

/** Explicit UI / docs label for this demo log. */
export const USER_SETUP_AUDIT_DEMO_LABEL = 'Demo audit trail — not tamper-evident';

export type UserSetupAuditAction =
  | 'addUser'
  | 'editUser'
  | 'deleteUser'
  | 'setSetupAssignment'
  | 'acknowledgeEscalation'
  | 'resolveEscalation'
  | 'supervisedVisitSave'
  | 'appendixFSign';

export interface UserSetupAuditEntry {
  id: string;
  actorUserId: string;
  action: UserSetupAuditAction;
  targetUserId?: string;
  detail?: string;
  /** ISO-8601 timestamp. Prefer this name over `at`. */
  createdAt: string;
}

export type UserSetupAuditInput = Omit<UserSetupAuditEntry, 'id' | 'createdAt'> & {
  createdAt?: string;
};

function auditId(): string {
  return `usa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createUserSetupAuditEntry(input: UserSetupAuditInput): UserSetupAuditEntry {
  return {
    id: auditId(),
    actorUserId: input.actorUserId,
    action: input.action,
    targetUserId: input.targetUserId,
    detail: input.detail,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function loadUserSetupAuditFromStorage(): UserSetupAuditEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(USER_SETUP_AUDIT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e): e is UserSetupAuditEntry => !!e && typeof e === 'object' && typeof (e as UserSetupAuditEntry).createdAt === 'string')
      .map(e => ({
        id: typeof e.id === 'string' ? e.id : auditId(),
        actorUserId: typeof e.actorUserId === 'string' ? e.actorUserId : 'unknown',
        action: e.action,
        targetUserId: e.targetUserId,
        detail: e.detail,
        createdAt: e.createdAt,
      }))
      .slice(-MAX_USER_SETUP_AUDIT_ENTRIES);
  } catch {
    return [];
  }
}

export function saveUserSetupAuditToStorage(entries: UserSetupAuditEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = entries.slice(-MAX_USER_SETUP_AUDIT_ENTRIES);
    window.localStorage.setItem(USER_SETUP_AUDIT_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* best-effort demo cache */
  }
}

/** Append one entry; returns the capped list (newest last). */
export function appendToUserSetupAudit(
  existing: UserSetupAuditEntry[],
  input: UserSetupAuditInput,
): UserSetupAuditEntry[] {
  const next = [...existing, createUserSetupAuditEntry(input)].slice(-MAX_USER_SETUP_AUDIT_ENTRIES);
  saveUserSetupAuditToStorage(next);
  return next;
}
