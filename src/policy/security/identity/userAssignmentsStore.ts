import { create } from 'zustand';
import type { DemoUser as AuthDemoUser } from '@/auth/api';
import type { User, RoleAssignment } from './types';
import { DEMO_USERS } from './demoUsers';
import { ROLE_ASSIGNMENTS } from './roleAssignments';
import { USER_GROUPS } from './userGroups';
import {
  DEFAULT_AUTHENTICATED_GROUP_ID,
  DEFAULT_ORGANIZATION_ID,
  getAuthProvider,
  getAuthSubject,
  getEmailFallbackUserId,
  getUserStableKey,
  isIdentityRoleUpdateExempt,
  normalizeUserEmail,
  toAppUser,
} from './identityNormalization';
import {
  type UserSetupAssignment,
  type UserSetupFieldsPayload,
  buildSeedSetupAssignments,
  createDefaultSetupAssignment,
  mergeSetupAssignment,
  normalizeSetupAssignment,
} from './userSetupAssignments';

/**
 * Persist key remains `ci.identityRegistry.v1` (same localStorage key as before).
 * Internal payload `version` is bumped 1 → 2 to include `setupAssignments`.
 * v1 blobs without setupAssignments are migrated on load (seed map filled, then
 * any persisted setupAssignments overlaid). Demo/local-only — no backend.
 */
const STORAGE_KEY = 'ci.identityRegistry.v1';
const REGISTRY_VERSION = 2 as const;
const PROTECTED_USER_IDS = new Set(['demo-user-careindeed']);
const SUPER_ADMIN_GROUP_ID = 'grp-super-admin';
const PRIVILEGED_GROUP_IDS = new Set(['grp-super-admin', 'grp-admin', 'grp-system', 'grp-user-access-admin']);

export interface AddUserPayload {
  name: string;
  email: string;
  groupId: string;
  status: 'active' | 'pending' | 'suspended';
  sendInvite?: boolean;
  /** Optional journey/setup fields (role, supervisor, firstDay, onboarding, …). */
  setup?: UserSetupFieldsPayload;
}

export interface EditUserPayload {
  name?: string;
  email?: string;
  groupId?: string;
  status?: 'active' | 'pending' | 'suspended';
  /** Optional journey/setup fields (role, supervisor, firstDay, onboarding, …). */
  setup?: UserSetupFieldsPayload;
}

export interface CrudResult {
  ok: boolean;
  error?: string;
}

export interface IdentityRegistrySnapshot {
  users: User[];
  assignments: RoleAssignment[];
  /** Phase 2A: journey-shaped setup assignments keyed by identity userId. */
  setupAssignments: Record<string, UserSetupAssignment>;
}

interface StoredIdentityRegistry {
  version: 1 | 2;
  updatedAt: string;
  users: User[];
  assignments: RoleAssignment[];
  setupAssignments?: Record<string, UserSetupAssignment>;
}

export interface UserAssignmentsState {
  users: User[];
  assignments: RoleAssignment[];
  setupAssignments: Record<string, UserSetupAssignment>;

  getUserById: (userId: string) => User | undefined;
  getActiveAssignmentsForUser: (userId: string, atIso?: string) => RoleAssignment[];
  getRegistrySnapshot: () => IdentityRegistrySnapshot;

  getSetupAssignment: (userId: string) => UserSetupAssignment | undefined;
  getAllSetupAssignments: () => UserSetupAssignment[];
  setSetupAssignment: (userId: string, patch: UserSetupFieldsPayload) => CrudResult;

  hydrateRegistry: (snapshot: IdentityRegistrySnapshot) => void;
  upsertAuthenticatedUser: (authUser: AuthDemoUser | null, nowIso?: string) => User | null;
  addUser: (payload: AddUserPayload) => CrudResult;
  editUser: (userId: string, currentUserId: string, payload: EditUserPayload) => CrudResult;
  deleteUser: (userId: string, currentUserId: string) => CrudResult;
}

function uid(): string {
  return 'usr-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function aid(): string {
  return 'asn-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function normalizeUser(user: User): User {
  return {
    ...user,
    email: normalizeUserEmail(user.email),
    name: user.name.trim() || normalizeUserEmail(user.email) || user.id,
    provider: user.provider?.trim().toLowerCase() || undefined,
    authSubject: user.authSubject?.trim() || undefined,
  };
}

function authSubjectKey(user: Pick<User, 'authSubject' | 'provider'>): string {
  if (!user.authSubject) return '';
  return `${(user.provider || 'cognito').toLowerCase()}:${user.authSubject.trim().toLowerCase()}`;
}

function activeAssignmentFor(assignments: RoleAssignment[], userId: string): RoleAssignment | undefined {
  return assignments.find(a => a.userId === userId && !a.revokedAt);
}

function downgradeInheritedPrivilegedAssignments(
  assignments: RoleAssignment[],
  userId: string,
  nowIso: string,
): RoleAssignment[] {
  return assignments.map(assignment =>
    assignment.userId === userId
      && !assignment.revokedAt
      && PRIVILEGED_GROUP_IDS.has(assignment.groupId)
      ? {
          ...assignment,
          groupId: DEFAULT_AUTHENTICATED_GROUP_ID,
          scope: { organizationId: DEFAULT_ORGANIZATION_ID },
          effectiveFrom: nowIso,
        }
      : assignment,
  );
}

function validateEmail(email: string): string | null {
  const normalized = normalizeUserEmail(email);
  if (!normalized) return 'Email is required.';
  if (!normalized.endsWith('@careindeed.com')) {
    return 'Email must be a @careindeed.com address.';
  }
  const local = normalized.split('@')[0];
  if (!local) return 'Invalid email format.';
  return null;
}

function cloneSetupMap(
  map: Record<string, UserSetupAssignment> | undefined | null,
): Record<string, UserSetupAssignment> {
  const out: Record<string, UserSetupAssignment> = {};
  if (!map || typeof map !== 'object') return out;
  for (const [userId, raw] of Object.entries(map)) {
    if (!raw || typeof raw !== 'object') continue;
    const normalized = normalizeSetupAssignment({ ...raw, userId: raw.userId || userId });
    if (!normalized.userId) continue;
    out[normalized.userId] = normalized;
  }
  return out;
}

function loadStoredRegistry(): IdentityRegistrySnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredIdentityRegistry>;
    if (!Array.isArray(parsed.users) || !Array.isArray(parsed.assignments)) return null;
    // v1 → v2: setupAssignments may be missing; mergeRegistry fills seed defaults.
    return {
      users: parsed.users.filter(Boolean).map(user => normalizeUser(user as User)),
      assignments: parsed.assignments.filter(Boolean).map(a => ({ ...(a as RoleAssignment) })),
      setupAssignments: cloneSetupMap(parsed.setupAssignments),
    };
  } catch {
    return null;
  }
}

function saveRegistry(snapshot: IdentityRegistrySnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredIdentityRegistry = {
      version: REGISTRY_VERSION,
      updatedAt: new Date().toISOString(),
      users: snapshot.users.map(user => ({ ...user })),
      assignments: snapshot.assignments.map(assignment => ({ ...assignment })),
      setupAssignments: cloneSetupMap(snapshot.setupAssignments),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* local cache is best-effort */
  }
}

function mergeRegistry(persisted: IdentityRegistrySnapshot | null): IdentityRegistrySnapshot {
  const usersById = new Map<string, User>();
  const idRemap = new Map<string, string>();

  function indexUser(input: User, preferExistingId: boolean): string {
    const user = normalizeUser(input);
    const email = normalizeUserEmail(user.email);
    const subject = authSubjectKey(user);

    let targetId = preferExistingId && usersById.has(user.id) ? user.id : '';
    if (!targetId && subject) {
      for (const existing of usersById.values()) {
        if (authSubjectKey(existing) === subject) {
          targetId = existing.id;
          break;
        }
      }
    }
    if (!targetId && email) {
      for (const existing of usersById.values()) {
        if (normalizeUserEmail(existing.email) === email) {
          targetId = existing.id;
          break;
        }
      }
    }
    if (!targetId) targetId = user.id;

    const existing = usersById.get(targetId);
    const next: User = existing
      ? {
          ...existing,
          ...user,
          id: targetId,
          email: email || existing.email,
          name: user.name || existing.name,
          createdAt: existing.createdAt ?? user.createdAt,
          lastLoginAt: user.lastLoginAt ?? existing.lastLoginAt,
          source: existing.source === 'seed' && user.source !== 'manual-provisioned'
            ? 'seed'
            : user.source ?? existing.source,
        }
      : { ...user, id: targetId, email };

    usersById.set(targetId, next);
    idRemap.set(user.id, targetId);
    if (email) idRemap.set(getEmailFallbackUserId(email), targetId);
    return targetId;
  }

  for (const seed of DEMO_USERS) {
    indexUser({ ...seed, email: normalizeUserEmail(seed.email), source: seed.source ?? 'seed' }, true);
  }

  for (const user of persisted?.users ?? []) {
    const normalized = normalizeUser(user);
    const stableId = normalized.authSubject
      ? `auth:${(normalized.provider || 'cognito').toLowerCase()}:${encodeURIComponent(normalized.authSubject.toLowerCase())}`
      : normalized.id;
    const existingSeed = DEMO_USERS.find(seed => normalizeUserEmail(seed.email) === normalized.email);
    const targetId = indexUser({ ...normalized, id: existingSeed?.id ?? stableId }, false);
    idRemap.set(normalized.id, targetId);
    idRemap.set(stableId, targetId);
  }

  const assignmentsById = new Map<string, RoleAssignment>();
  function addAssignment(assignment: RoleAssignment): void {
    const remappedUserId = idRemap.get(assignment.userId) ?? assignment.userId;
    assignmentsById.set(assignment.id, { ...assignment, userId: remappedUserId });
  }

  for (const assignment of ROLE_ASSIGNMENTS) addAssignment({ ...assignment });
  for (const assignment of persisted?.assignments ?? []) addAssignment({ ...assignment });

  // Setup assignments: seed from DEMO_USERS, then overlay persisted (persisted wins).
  // Remap userIds when identity merge collapsed ids.
  const setupByUserId: Record<string, UserSetupAssignment> = {};
  const seedSetup = buildSeedSetupAssignments();
  for (const [userId, setup] of Object.entries(seedSetup)) {
    const remapped = idRemap.get(userId) ?? userId;
    setupByUserId[remapped] = normalizeSetupAssignment({ ...setup, userId: remapped });
  }
  for (const [userId, setup] of Object.entries(persisted?.setupAssignments ?? {})) {
    const setupUserId = setup.userId || userId;
    const remappedUserId = idRemap.get(setupUserId) ?? setupUserId;
    const remappedSupervisor = setup.supervisorId
      ? (idRemap.get(setup.supervisorId) ?? setup.supervisorId)
      : null;
    setupByUserId[remappedUserId] = normalizeSetupAssignment({
      ...setup,
      userId: remappedUserId,
      supervisorId: remappedSupervisor,
    });
  }
  // Ensure every known user has a setup record (additive default).
  for (const user of usersById.values()) {
    if (!setupByUserId[user.id]) {
      setupByUserId[user.id] = createDefaultSetupAssignment(user.id, {
        active: user.status !== 'suspended',
      }, user.createdAt ?? new Date().toISOString());
    }
  }

  const users = [...usersById.values()];
  return {
    users,
    assignments: [...assignmentsById.values()],
    setupAssignments: setupByUserId,
  };
}

function initialRegistry(): IdentityRegistrySnapshot {
  return mergeRegistry(loadStoredRegistry());
}

function setAndPersist(
  set: (partial: Pick<UserAssignmentsState, 'users' | 'assignments' | 'setupAssignments'>) => void,
  snapshot: IdentityRegistrySnapshot,
): void {
  saveRegistry(snapshot);
  set(snapshot);
}

export const useUserAssignmentsStore = create<UserAssignmentsState>((set, get) => {
  const initial = initialRegistry();
  saveRegistry(initial);

  return {
    users: initial.users,
    assignments: initial.assignments,
    setupAssignments: initial.setupAssignments,

    getUserById(userId) {
      const normalized = normalizeUserEmail(userId);
      return get().users.find(u => u.id === userId || normalizeUserEmail(u.email) === normalized);
    },

    getActiveAssignmentsForUser(userId, atIso = new Date().toISOString()) {
      const at = Date.parse(atIso);
      return get().assignments.filter(a => {
        if (a.userId !== userId) return false;
        if (a.revokedAt) return false;
        const from = Date.parse(a.effectiveFrom);
        if (Number.isNaN(from) || from > at) return false;
        if (!a.effectiveTo) return true;
        const to = Date.parse(a.effectiveTo);
        return !Number.isNaN(to) && at <= to;
      });
    },

    getRegistrySnapshot() {
      const { users, assignments, setupAssignments } = get();
      return {
        users: users.map(user => ({ ...user })),
        assignments: assignments.map(assignment => ({ ...assignment })),
        setupAssignments: cloneSetupMap(setupAssignments),
      };
    },

    getSetupAssignment(userId) {
      return get().setupAssignments[userId];
    },

    getAllSetupAssignments() {
      return Object.values(get().setupAssignments).map(a => normalizeSetupAssignment(a));
    },

    setSetupAssignment(userId, patch) {
      const { users, assignments, setupAssignments } = get();
      if (!users.some(u => u.id === userId)) {
        return { ok: false, error: 'User not found.' };
      }
      const now = new Date().toISOString();
      const nextSetup = {
        ...setupAssignments,
        [userId]: mergeSetupAssignment(setupAssignments[userId], userId, patch, now),
      };
      setAndPersist(set, {
        users,
        assignments,
        setupAssignments: nextSetup,
      });
      return { ok: true };
    },

    hydrateRegistry(snapshot) {
      const current = get().getRegistrySnapshot();
      setAndPersist(set, mergeRegistry({
        users: [...current.users, ...snapshot.users],
        assignments: [...current.assignments, ...snapshot.assignments],
        setupAssignments: {
          ...current.setupAssignments,
          ...cloneSetupMap(snapshot.setupAssignments),
        },
      }));
    },

    upsertAuthenticatedUser(authUser, nowIso = new Date().toISOString()) {
      if (!authUser) return null;

      const appUser = toAppUser(authUser, nowIso);
      if (!appUser) return null;

      const { users, assignments, setupAssignments } = get();
      const email = normalizeUserEmail(appUser.email);
      const authSubject = getAuthSubject(authUser);
      const provider = getAuthProvider(authUser);
      const stableId = getUserStableKey(authUser) || getEmailFallbackUserId(email);

      const existing = users.find(user => {
        if (user.id === stableId) return true;
        if (normalizeUserEmail(user.email) === email) return true;
        return !!authSubject && user.authSubject === authSubject && (user.provider ?? provider) === provider;
      });

      const targetId = existing?.source === 'seed' ? existing.id : stableId;
      const oldIds = new Set<string>([targetId, stableId, getEmailFallbackUserId(email)]);
      if (existing) oldIds.add(existing.id);

      const nextUser: User = {
        ...(existing ?? appUser),
        ...appUser,
        id: targetId,
        email,
        status: existing?.status ?? appUser.status,
        source: existing?.source === 'seed' ? 'seed' : 'authenticated',
        createdAt: existing?.createdAt ?? appUser.createdAt ?? nowIso,
        lastLoginAt: nowIso,
      };

      const nextUsers = users
        .filter(user => !oldIds.has(user.id) && normalizeUserEmail(user.email) !== email)
        .concat(nextUser);

      let nextAssignments = assignments.map(assignment =>
        oldIds.has(assignment.userId) ? { ...assignment, userId: targetId } : assignment,
      );

      if (!isIdentityRoleUpdateExempt(nextUser)) {
        nextAssignments = downgradeInheritedPrivilegedAssignments(nextAssignments, targetId, nowIso);
      }

      if (!activeAssignmentFor(nextAssignments, targetId)) {
        nextAssignments = [
          ...nextAssignments,
          {
            id: aid(),
            userId: targetId,
            groupId: DEFAULT_AUTHENTICATED_GROUP_ID,
            scope: { organizationId: DEFAULT_ORGANIZATION_ID },
            effectiveFrom: nowIso,
          },
        ];
      }

      // Remap setup assignment userIds that collapsed into targetId.
      const nextSetup: Record<string, UserSetupAssignment> = {};
      for (const [key, setup] of Object.entries(setupAssignments)) {
        const remappedId = oldIds.has(setup.userId) || oldIds.has(key) ? targetId : setup.userId;
        const remappedSupervisor = setup.supervisorId && oldIds.has(setup.supervisorId)
          ? targetId
          : setup.supervisorId;
        nextSetup[remappedId] = normalizeSetupAssignment({
          ...setup,
          userId: remappedId,
          supervisorId: remappedSupervisor,
        });
      }
      if (!nextSetup[targetId]) {
        nextSetup[targetId] = createDefaultSetupAssignment(targetId, {
          active: nextUser.status !== 'suspended',
        }, nowIso);
      }

      setAndPersist(set, mergeRegistry({
        users: nextUsers,
        assignments: nextAssignments,
        setupAssignments: nextSetup,
      }));
      return nextUser;
    },

    addUser(payload) {
      const { users, assignments, setupAssignments } = get();

      if (!payload.name.trim()) return { ok: false, error: 'Full name is required.' };

      const emailErr = validateEmail(payload.email);
      if (emailErr) return { ok: false, error: emailErr };

      if (!USER_GROUPS.find(g => g.id === payload.groupId)) {
        return { ok: false, error: 'Invalid user group selected.' };
      }

      const email = normalizeUserEmail(payload.email);
      if (users.some(u => normalizeUserEmail(u.email) === email)) {
        return { ok: false, error: 'A user with this email already exists.' };
      }

      const userId = uid();
      const now = new Date().toISOString();
      const newUser: User = {
        id: userId,
        email,
        name: payload.name.trim(),
        status: payload.status ?? 'pending',
        source: 'manual-provisioned',
        createdAt: now,
      };

      const newAssignment: RoleAssignment = {
        id: aid(),
        userId,
        groupId: payload.groupId,
        scope: { organizationId: DEFAULT_ORGANIZATION_ID },
        effectiveFrom: now,
      };

      const newSetup = createDefaultSetupAssignment(
        userId,
        {
          active: (payload.status ?? 'pending') !== 'suspended',
          ...payload.setup,
        },
        now,
      );

      setAndPersist(set, mergeRegistry({
        users: [...users, newUser],
        assignments: [...assignments, newAssignment],
        setupAssignments: { ...setupAssignments, [userId]: newSetup },
      }));
      return { ok: true };
    },

    editUser(userId, _currentUserId, payload) {
      const { users, assignments, setupAssignments } = get();

      const user = users.find(u => u.id === userId);
      if (!user) return { ok: false, error: 'User not found.' };

      if (PROTECTED_USER_IDS.has(userId)) {
        return { ok: false, error: 'This user record is protected and cannot be edited here.' };
      }

      if (payload.name !== undefined && !payload.name.trim()) {
        return { ok: false, error: 'Full name is required.' };
      }

      let nextEmail = user.email;
      if (payload.email !== undefined) {
        const emailErr = validateEmail(payload.email);
        if (emailErr) return { ok: false, error: emailErr };
        nextEmail = normalizeUserEmail(payload.email);
        if (users.some(u => u.id !== userId && normalizeUserEmail(u.email) === nextEmail)) {
          return { ok: false, error: 'A user with this email already exists.' };
        }
      }

      if (payload.groupId !== undefined && !USER_GROUPS.find(g => g.id === payload.groupId)) {
        return { ok: false, error: 'Invalid user group selected.' };
      }

      const now = new Date().toISOString();

      const updatedUser: User = {
        ...user,
        ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
        ...(payload.email !== undefined ? { email: nextEmail } : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
        source: user.source === 'authenticated' ? 'authenticated' : 'manual-provisioned',
      };

      let updatedAssignments = assignments;
      if (payload.groupId !== undefined) {
        const current = activeAssignmentFor(assignments, userId);
        updatedAssignments = current
          ? assignments.map(a => (a.id === current.id ? { ...a, groupId: payload.groupId! } : a))
          : [
              ...assignments,
              {
                id: aid(),
                userId,
                groupId: payload.groupId,
                scope: { organizationId: DEFAULT_ORGANIZATION_ID },
                effectiveFrom: now,
              },
            ];
      }

      let nextSetup = setupAssignments;
      if (payload.setup !== undefined || payload.status !== undefined) {
        const setupPatch: UserSetupFieldsPayload = { ...payload.setup };
        if (payload.status === 'suspended') {
          setupPatch.active = false;
        } else if (
          (payload.status === 'active' || payload.status === 'pending')
          && payload.setup?.active === undefined
        ) {
          setupPatch.active = true;
        }
        nextSetup = {
          ...setupAssignments,
          [userId]: mergeSetupAssignment(setupAssignments[userId], userId, setupPatch, now),
        };
      }

      setAndPersist(set, mergeRegistry({
        users: users.map(u => (u.id === userId ? updatedUser : u)),
        assignments: updatedAssignments,
        setupAssignments: nextSetup,
      }));
      return { ok: true };
    },

    deleteUser(userId, currentUserId) {
      const { users, assignments, setupAssignments } = get();

      if (PROTECTED_USER_IDS.has(userId)) {
        return { ok: false, error: 'This user is protected and cannot be removed.' };
      }

      if (userId === currentUserId) {
        return { ok: false, error: 'You cannot remove your own account.' };
      }

      const superAdminUserIds = assignments
        .filter(a => a.groupId === SUPER_ADMIN_GROUP_ID && !a.revokedAt)
        .map(a => a.userId);
      if (superAdminUserIds.length <= 1 && superAdminUserIds.includes(userId)) {
        return { ok: false, error: 'Cannot remove the last Super Admin.' };
      }

      const now = new Date().toISOString();
      const updatedUsers = users.map(user =>
        user.id === userId ? { ...user, status: 'suspended' as const } : user,
      );
      const updatedAssignments = assignments.map(assignment =>
        assignment.userId === userId && !assignment.revokedAt
          ? { ...assignment, revokedAt: now, effectiveTo: now }
          : assignment,
      );
      const nextSetup = {
        ...setupAssignments,
        [userId]: mergeSetupAssignment(
          setupAssignments[userId],
          userId,
          { active: false },
          now,
        ),
      };

      setAndPersist(set, mergeRegistry({
        users: updatedUsers,
        assignments: updatedAssignments,
        setupAssignments: nextSetup,
      }));
      return { ok: true };
    },
  };
});

export function getLiveUserById(userId: string): User | undefined {
  return useUserAssignmentsStore.getState().getUserById(userId);
}

export function getLiveActiveAssignments(userId: string, atIso?: string): RoleAssignment[] {
  return useUserAssignmentsStore.getState().getActiveAssignmentsForUser(userId, atIso);
}

export function getIdentityRegistrySnapshot(): IdentityRegistrySnapshot {
  return useUserAssignmentsStore.getState().getRegistrySnapshot();
}

export function hydrateIdentityRegistry(snapshot: IdentityRegistrySnapshot): void {
  useUserAssignmentsStore.getState().hydrateRegistry(snapshot);
}

export function upsertAuthenticatedAppUser(authUser: AuthDemoUser | null): User | null {
  return useUserAssignmentsStore.getState().upsertAuthenticatedUser(authUser);
}

export function getLiveSetupAssignment(userId: string): UserSetupAssignment | undefined {
  return useUserAssignmentsStore.getState().getSetupAssignment(userId);
}

export function getLiveAllSetupAssignments(): UserSetupAssignment[] {
  return useUserAssignmentsStore.getState().getAllSetupAssignments();
}

export function setLiveSetupAssignment(userId: string, patch: UserSetupFieldsPayload): CrudResult {
  return useUserAssignmentsStore.getState().setSetupAssignment(userId, patch);
}

/**
 * Demo/local-only: re-seed the in-memory store from DEMO_USERS + current localStorage.
 * Used by unit tests (and never as a production API). Clears nothing from disk unless
 * the caller cleared localStorage first.
 */
export function rehydrateIdentityRegistryFromStorage(): void {
  const snap = initialRegistry();
  useUserAssignmentsStore.setState({
    users: snap.users,
    assignments: snap.assignments,
    setupAssignments: snap.setupAssignments,
  });
  saveRegistry(snap);
}

export { STORAGE_KEY as IDENTITY_REGISTRY_STORAGE_KEY, REGISTRY_VERSION as IDENTITY_REGISTRY_VERSION };
