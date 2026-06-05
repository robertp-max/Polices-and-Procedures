/**
 * pageAccessStore — Phase A page-view-access matrix.
 *
 * Persists per-user component / page access grants in localStorage as a
 * browser cache and mirrors them to the backend when an authenticated
 * admin is available. Falls back to deterministic seed defaults the
 * first time it loads in a browser.
 *
 * Audit log: every mutation is appended to a small in-memory + local
 * audit list with `action: 'page_access_updated'`. Backend audit
 * persistence is also TODO.
 */

import { create } from 'zustand';
import { AuthApi } from '@/auth/api';
import type { DemoUser as AuthDemoUser } from '@/auth/api';
import { COMPONENT_GROUPS, getPagesForComponent } from './pageRegistry';
import { DEMO_USERS, resolveUserIdFromAuth } from './demoUsers';
import type {
  ComponentAccessGrant,
  ComponentId,
  PageAccessAuditEntry,
  PageAccessLevel,
  PageId,
  UserPageAccess,
} from './pageAccessTypes';

// ─── Storage keys ────────────────────────────────────────────
const STORAGE_KEY = 'ci.pageAccess.v1';
const AUDIT_KEY = 'ci.pageAccess.audit.v1';
const MAX_AUDIT_ENTRIES = 500;

function normalizeIdentityKey(value: string): string {
  return value.trim().toLowerCase();
}

function aliasKeysForIdentity(userId: string, email?: string): string[] {
  const keys = new Set<string>([userId]);
  if (email) keys.add(normalizeIdentityKey(email));
  const seeded = DEMO_USERS.find(user => user.id === userId);
  if (seeded?.email) keys.add(normalizeIdentityKey(seeded.email));
  return [...keys];
}

function writeAliases(
  map: Record<string, UserPageAccess>,
  record: UserPageAccess,
  aliases: string[],
): Record<string, UserPageAccess> {
  const next = { ...map };
  for (const key of aliases) {
    next[key] = record;
  }
  return next;
}

function normalizeAccessMap(input: Record<string, UserPageAccess>): Record<string, UserPageAccess> {
  let next: Record<string, UserPageAccess> = {};
  for (const [key, record] of Object.entries(input)) {
    if (!record || typeof record !== 'object' || typeof record.userId !== 'string') continue;
    next = writeAliases(next, record, aliasKeysForIdentity(record.userId, key.includes('@') ? key : undefined));
  }
  return next;
}

// ─── Seed builders ───────────────────────────────────────────

/** Build a `ComponentAccessGrant` where every page has the given level. */
function fullGrant(componentId: ComponentId, level: PageAccessLevel): ComponentAccessGrant {
  return {
    componentId,
    enabled: true,
    defaultAccess: level,
    pages: getPagesForComponent(componentId).map(p => ({ pageId: p.pageId, access: level })),
  };
}

/**
 * Build the seed access map.
 *
 * Defaults:
 *  - Robert (demo-user-careindeed): full read+write on every component.
 *    Robert is the bootstrap super admin and must never be locked out.
 *  - Marites (usr-marites): full read+write on User Management + System
 *    + Dashboard so she can manage page-view-access without ever losing
 *    access herself. All other components default to `read`.
 *  - Everyone else: no explicit entries — they fall back to existing
 *    role/feature evaluation for read, and `none` for write.
 */
function buildSeedAccess(): Record<string, UserPageAccess> {
  let seed: Record<string, UserPageAccess> = {};

  // Robert — full grants everywhere.
  const robertRecord: UserPageAccess = {
    userId: 'demo-user-careindeed',
    components: COMPONENT_GROUPS.map(c => fullGrant(c.componentId, 'write')),
  };
  seed = writeAliases(seed, robertRecord, aliasKeysForIdentity('demo-user-careindeed', 'robertp@careindeed.com'));

  // Marites — read+write on User Management + read on everything else.
  const maritesRecord: UserPageAccess = {
    userId: 'usr-marites',
    components: COMPONENT_GROUPS.map(c => {
      const level: PageAccessLevel = c.componentId === 'cmp-user-management' ? 'write' : 'read';
      return fullGrant(c.componentId, level);
    }),
  };
  seed = writeAliases(seed, maritesRecord, aliasKeysForIdentity('usr-marites', 'maritesa@careindeed.com'));

  return seed;
}

// ─── localStorage helpers ────────────────────────────────────

function loadFromStorage(): Record<string, UserPageAccess> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, UserPageAccess>;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(map: Record<string, UserPageAccess>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Quota or privacy mode — swallow silently.
  }
}

function loadAuditFromStorage(): PageAccessAuditEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PageAccessAuditEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveAuditToStorage(entries: PageAccessAuditEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = entries.slice(-MAX_AUDIT_ENTRIES);
    window.localStorage.setItem(AUDIT_KEY, JSON.stringify(trimmed));
  } catch {
    // Swallow — audit log is best-effort in demo mode.
  }
}

/**
 * Merge persisted state with seed so newly-added components/pages
 * always appear in the matrix the first time the seed schema grows.
 * For an existing user record, missing components are added with
 * their seed defaults (or `enabled: true, defaultAccess: read` for
 * neutral groups). Pages missing from an existing component grant
 * are appended at the component's `defaultAccess`.
 */
function reconcileWithSeed(
  persisted: Record<string, UserPageAccess> | null,
  seed: Record<string, UserPageAccess>,
): Record<string, UserPageAccess> {
  if (!persisted) return seed;
  const merged: Record<string, UserPageAccess> = { ...persisted };

  // Make sure seed users are present at minimum.
  for (const seedUserId of Object.keys(seed)) {
    if (!merged[seedUserId]) {
      merged[seedUserId] = seed[seedUserId];
    } else {
      // Reconcile components/pages additions.
      merged[seedUserId] = reconcileUserComponents(merged[seedUserId]);
    }
  }

  // Reconcile other persisted users against current registry.
  for (const userId of Object.keys(persisted)) {
    if (!seed[userId]) {
      merged[userId] = reconcileUserComponents(persisted[userId]);
    }
  }

  return merged;
}

function reconcileUserComponents(record: UserPageAccess): UserPageAccess {
  const next: ComponentAccessGrant[] = [];
  for (const cmp of COMPONENT_GROUPS) {
    const existing = record.components.find(c => c.componentId === cmp.componentId);
    if (!existing) {
      // Component newly added to the registry — start with disabled +
      // default access so we don't silently grant anything new.
      next.push({
        componentId: cmp.componentId,
        enabled: false,
        defaultAccess: cmp.defaultAccess,
        pages: getPagesForComponent(cmp.componentId).map(p => ({ pageId: p.pageId, access: 'none' })),
      });
      continue;
    }

    // Make sure every registered page is represented inside this
    // component grant. Missing pages adopt the component default.
    const pages = getPagesForComponent(cmp.componentId).map(p => {
      const found = existing.pages.find(pp => pp.pageId === p.pageId);
      return found ?? { pageId: p.pageId, access: existing.defaultAccess };
    });

    next.push({ ...existing, pages });
  }
  return { userId: record.userId, components: next };
}

// ─── Store shape ─────────────────────────────────────────────

export interface PageAccessState {
  /** userId → explicit page-access record. */
  access: Record<string, UserPageAccess>;
  /** Most-recent audit entries (newest at the end). */
  audit: PageAccessAuditEntry[];

  /** Returns the explicit grant for a user, reconciled with registry. */
  getAccessForUser: (userId: string, email?: string) => UserPageAccess;
  /** Returns the explicit component grant, if any (NOT reconciled to a fallback). */
  getComponentGrant: (userId: string, componentId: ComponentId) => ComponentAccessGrant | undefined;

  /** Enable/disable a whole component for a user. */
  setComponentEnabled: (
    actorEmail: string,
    targetUserId: string,
    targetEmail: string,
    componentId: ComponentId,
    enabled: boolean,
  ) => void;

  /** Bulk-set every child page to the same level. */
  setComponentBulkAccess: (
    actorEmail: string,
    targetUserId: string,
    targetEmail: string,
    componentId: ComponentId,
    level: PageAccessLevel,
  ) => void;

  /** Set access for a single page. `write` implies `read`. */
  setPageAccess: (
    actorEmail: string,
    targetUserId: string,
    targetEmail: string,
    componentId: ComponentId,
    pageId: PageId,
    level: PageAccessLevel,
  ) => void;

  /** Reset a user back to the seed defaults. */
  resetUser: (actorEmail: string, targetUserId: string, targetEmail: string) => void;

  /** Inspect the audit trail (newest last). */
  listAudit: (filterTargetUserId?: string) => PageAccessAuditEntry[];
  /** Replace the entire access map after server hydration. */
  replaceAccess: (access: Record<string, UserPageAccess>) => void;
}

// ─── Helpers ─────────────────────────────────────────────────

function emptyRecordForUser(userId: string): UserPageAccess {
  return {
    userId,
    components: COMPONENT_GROUPS.map(cmp => ({
      componentId: cmp.componentId,
      enabled: false,
      defaultAccess: cmp.defaultAccess,
      pages: getPagesForComponent(cmp.componentId).map(p => ({ pageId: p.pageId, access: 'none' })),
    })),
  };
}

function appendAudit(
  state: PageAccessState,
  entry: Omit<PageAccessAuditEntry, 'timestamp' | 'action'>,
): PageAccessAuditEntry[] {
  const next: PageAccessAuditEntry = {
    timestamp: new Date().toISOString(),
    action: 'page_access_updated',
    ...entry,
  };
  const audit = [...state.audit, next].slice(-MAX_AUDIT_ENTRIES);
  saveAuditToStorage(audit);
  return audit;
}

function updateAccessMap(
  state: PageAccessState,
  userId: string,
  targetEmail: string | undefined,
  updater: (current: UserPageAccess) => UserPageAccess,
): Record<string, UserPageAccess> {
  const identityKeys = aliasKeysForIdentity(userId, targetEmail);
  const current = state.access[userId]
    ?? (targetEmail ? state.access[normalizeIdentityKey(targetEmail)] : undefined)
    ?? reconcileUserComponents(emptyRecordForUser(userId));
  const updated = updater(current);
  const next = writeAliases(state.access, updated, identityKeys);
  saveToStorage(next);
  return next;
}

// ─── Store ───────────────────────────────────────────────────

export const usePageAccessStore = create<PageAccessState>((set, get) => {
  const seed = buildSeedAccess();
  const persisted = loadFromStorage();
  const initial = reconcileWithSeed(persisted, seed);
  // Always normalize seed users so they never get silently downgraded
  // by a stale persisted record from earlier app versions.
  for (const id of Object.keys(seed)) {
    initial[id] = seed[id];
  }
  saveToStorage(initial);

  return {
    access: initial,
    audit: loadAuditFromStorage(),

    getAccessForUser(userId: string, email?: string) {
      const record = get().access[userId] ?? (email ? get().access[normalizeIdentityKey(email)] : undefined);
      if (record) return reconcileUserComponents(record);
      return reconcileUserComponents(emptyRecordForUser(userId));
    },

    getComponentGrant(userId, componentId) {
      const record = get().access[userId];
      if (!record) return undefined;
      return record.components.find(c => c.componentId === componentId);
    },

    setComponentEnabled(actorEmail, targetUserId, targetEmail, componentId, enabled) {
      set(state => {
        const oldGrant = state.access[targetUserId]?.components.find(c => c.componentId === componentId);
        const access = updateAccessMap(state, targetUserId, targetEmail, current => ({
          userId: current.userId,
          components: current.components.map(c =>
            c.componentId === componentId ? { ...c, enabled } : c,
          ),
        }));
        const audit = appendAudit(state, {
          actorEmail,
          targetEmail,
          componentId,
          oldAccess: oldGrant?.enabled ? 'component:enabled' : 'component:disabled',
          newAccess: enabled ? 'component:enabled' : 'component:disabled',
        });
        return { access, audit };
      });
    },

    setComponentBulkAccess(actorEmail, targetUserId, targetEmail, componentId, level) {
      set(state => {
        const oldGrant = state.access[targetUserId]?.components.find(c => c.componentId === componentId);
        const oldLevel = oldGrant?.defaultAccess;
        const access = updateAccessMap(state, targetUserId, targetEmail, current => ({
          userId: current.userId,
          components: current.components.map(c =>
            c.componentId === componentId
              ? {
                  ...c,
                  // Bulk-set forces enable so the change is observable.
                  enabled: level !== 'none' ? true : c.enabled,
                  defaultAccess: level,
                  pages: c.pages.map(p => ({ ...p, access: level })),
                }
              : c,
          ),
        }));
        const audit = appendAudit(state, {
          actorEmail,
          targetEmail,
          componentId,
          oldAccess: oldLevel,
          newAccess: level,
          note: 'Bulk set component pages.',
        });
        return { access, audit };
      });
    },

    setPageAccess(actorEmail, targetUserId, targetEmail, componentId, pageId, level) {
      set(state => {
        const oldGrant = state.access[targetUserId]?.components.find(c => c.componentId === componentId);
        const oldLevel = oldGrant?.pages.find(p => p.pageId === pageId)?.access;
        const access = updateAccessMap(state, targetUserId, targetEmail, current => ({
          userId: current.userId,
          components: current.components.map(c =>
            c.componentId === componentId
              ? {
                  ...c,
                  // Setting any page to a non-none level activates the component.
                  enabled: level !== 'none' ? true : c.enabled,
                  pages: c.pages.map(p =>
                    p.pageId === pageId ? { ...p, access: level } : p,
                  ),
                }
              : c,
          ),
        }));
        const audit = appendAudit(state, {
          actorEmail,
          targetEmail,
          componentId,
          pageId,
          oldAccess: oldLevel,
          newAccess: level,
        });
        return { access, audit };
      });
    },

    resetUser(actorEmail, targetUserId, targetEmail) {
      set(state => {
        const reseed = buildSeedAccess()[targetUserId];
        const next = reseed
          ? writeAliases(state.access, reseed, aliasKeysForIdentity(targetUserId, targetEmail))
          : (() => { const copy = { ...state.access }; delete copy[targetUserId]; return copy; })();
        saveToStorage(next);
        const audit = appendAudit(state, {
          actorEmail,
          targetEmail,
          note: 'Reset to seed defaults.',
        });
        return { access: next, audit };
      });
    },

    listAudit(filterTargetUserId) {
      const all = get().audit;
      if (!filterTargetUserId) return [...all];
      // Filter requires resolving target email per user — UI already
      // has user list, so it can filter by email match externally too.
      return [...all].filter(e =>
        e.targetEmail.toLowerCase() === filterTargetUserId.toLowerCase(),
      );
    },

    replaceAccess(access) {
      const normalized = reconcileWithSeed(normalizeAccessMap(access), buildSeedAccess());
      saveToStorage(normalized);
      set({ access: normalized });
    },
  };
});

// ─── Non-hook readers used by `pageAccess.ts` ─────────────────

/** Live (non-hook) read used by the access helpers + route guards. */
export function getLivePageAccessForUser(userId: string): UserPageAccess {
  return usePageAccessStore.getState().getAccessForUser(userId);
}

/** Live read that falls back from demo user id to authenticated email. */
export function getLivePageAccessForIdentity(userId: string, email?: string): UserPageAccess {
  return usePageAccessStore.getState().getAccessForUser(userId, email);
}

/** Live (non-hook) audit reader. */
export function getLivePageAccessAudit(): PageAccessAuditEntry[] {
  return [...usePageAccessStore.getState().audit];
}

/**
 * Exported for diagnostics + tests. Returns the raw seed map without
 * touching localStorage. Used to verify Robert + Marites bootstrap
 * grants are not silently dropped by future refactors.
 */
export function debugBuildSeed(): Record<string, UserPageAccess> {
  return buildSeedAccess();
}

export async function hydratePageAccessFromServer(
  accessToken: string,
  authUser: AuthDemoUser | null,
  canManageAccess: boolean,
): Promise<void> {
  if (!accessToken) return;

  if (canManageAccess) {
    const response = await AuthApi.getAllPageAccess(accessToken);
    usePageAccessStore.getState().replaceAccess(response.access as Record<string, UserPageAccess>);
    return;
  }

  const response = await AuthApi.getMyPageAccess(accessToken);
  if (!response.record || typeof response.record !== 'object' || !authUser?.email) return;

  const userId = resolveUserIdFromAuth(authUser);
  const merged = writeAliases(
    usePageAccessStore.getState().access,
    response.record as UserPageAccess,
    aliasKeysForIdentity(userId, authUser.email),
  );
  usePageAccessStore.getState().replaceAccess(merged);
}

export async function persistPageAccessToServer(accessToken: string): Promise<void> {
  if (!accessToken) return;
  await AuthApi.saveAllPageAccess(accessToken, usePageAccessStore.getState().access);
}
