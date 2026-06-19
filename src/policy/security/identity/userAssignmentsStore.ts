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

const STORAGE_KEY = 'ci.identityRegistry.v1';
const PROTECTED_USER_IDS = new Set(['demo-user-careindeed']);
const SUPER_ADMIN_GROUP_ID = 'grp-super-admin';
const PRIVILEGED_GROUP_IDS = new Set(['grp-super-admin', 'grp-admin', 'grp-system', 'grp-user-access-admin']);

export interface AddUserPayload {
  name: string;
  email: string;
  groupId: string;
  status: 'active' | 'pending' | 'suspended';
  sendInvite?: boolean;
}

export interface EditUserPayload {
  name?: string;
  email?: string;
  groupId?: string;
  status?: 'active' | 'pending' | 'suspended';
}

export interface CrudResult {
  ok: boolean;
  error?: string;
}

export interface IdentityRegistrySnapshot {
  users: User[];
  assignments: RoleAssignment[];
}

interface StoredIdentityRegistry extends IdentityRegistrySnapshot {
  version: 1;
  updatedAt: string;
}

export interface UserAssignmentsState {
  users: User[];
  assignments: RoleAssignment[];

  getUserById: (userId: string) => User | undefined;
  getActiveAssignmentsForUser: (userId: string, atIso?: string) => RoleAssignment[];
  getRegistrySnapshot: () => IdentityRegistrySnapshot;

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

function loadStoredRegistry(): IdentityRegistrySnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredIdentityRegistry>;
    if (!Array.isArray(parsed.users) || !Array.isArray(parsed.assignments)) return null;
    return {
      users: parsed.users.filter(Boolean).map(user => normalizeUser(user as User)),
      assignments: parsed.assignments.filter(Boolean).map(a => ({ ...(a as RoleAssignment) })),
    };
  } catch {
    return null;
  }
}

function saveRegistry(snapshot: IdentityRegistrySnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredIdentityRegistry = {
      version: 1,
      updatedAt: new Date().toISOString(),
      users: snapshot.users.map(user => ({ ...user })),
      assignments: snapshot.assignments.map(assignment => ({ ...assignment })),
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

  const users = [...usersById.values()];
  return {
    users,
    assignments: [...assignmentsById.values()],
  };
}

function initialRegistry(): IdentityRegistrySnapshot {
  return mergeRegistry(loadStoredRegistry());
}

function setAndPersist(
  set: (partial: Pick<UserAssignmentsState, 'users' | 'assignments'>) => void,
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
      const { users, assignments } = get();
      return {
        users: users.map(user => ({ ...user })),
        assignments: assignments.map(assignment => ({ ...assignment })),
      };
    },

    hydrateRegistry(snapshot) {
      const current = get().getRegistrySnapshot();
      setAndPersist(set, mergeRegistry({
        users: [...current.users, ...snapshot.users],
        assignments: [...current.assignments, ...snapshot.assignments],
      }));
    },

    upsertAuthenticatedUser(authUser, nowIso = new Date().toISOString()) {
      if (!authUser) return null;

      const appUser = toAppUser(authUser, nowIso);
      if (!appUser) return null;

      const { users, assignments } = get();
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

      setAndPersist(set, mergeRegistry({ users: nextUsers, assignments: nextAssignments }));
      return nextUser;
    },

    addUser(payload) {
      const { users, assignments } = get();

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

      setAndPersist(set, mergeRegistry({ users: [...users, newUser], assignments: [...assignments, newAssignment] }));
      return { ok: true };
    },

    editUser(userId, _currentUserId, payload) {
      const { users, assignments } = get();

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
                effectiveFrom: new Date().toISOString(),
              },
            ];
      }

      setAndPersist(set, mergeRegistry({
        users: users.map(u => (u.id === userId ? updatedUser : u)),
        assignments: updatedAssignments,
      }));
      return { ok: true };
    },

    deleteUser(userId, currentUserId) {
      const { users, assignments } = get();

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

      setAndPersist(set, mergeRegistry({ users: updatedUsers, assignments: updatedAssignments }));
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
