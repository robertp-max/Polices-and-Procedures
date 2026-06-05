/**
 * userAssignmentsStore — mutable Phase A user + assignment management.
 *
 * Initialises from the static seed arrays in demoUsers.ts and
 * roleAssignments.ts, then exposes CRUD operations used by the
 * User Assignments admin page.
 *
 * authorize.ts reads live user/assignment state from this store so
 * permissions update immediately after edits/deletes.
 */

import { create } from 'zustand';
import type { User, RoleAssignment } from './types';
import { DEMO_USERS } from './demoUsers';
import { ROLE_ASSIGNMENTS } from './roleAssignments';
import { USER_GROUPS } from './userGroups';

// ─── Constants ────────────────────────────────────────────────────────────────

/** IDs that can never be removed — Robert Padilla / bootstrap Super Admin */
const PROTECTED_USER_IDS = new Set(['demo-user-careindeed']);
const SUPER_ADMIN_GROUP_ID = 'grp-super-admin';

// ─── Payload types ────────────────────────────────────────────────────────────

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

// ─── Store shape ──────────────────────────────────────────────────────────────

export interface UserAssignmentsState {
  users: User[];
  assignments: RoleAssignment[];

  getUserById: (userId: string) => User | undefined;
  getActiveAssignmentsForUser: (userId: string, atIso?: string) => RoleAssignment[];

  addUser: (payload: AddUserPayload) => CrudResult;
  editUser: (userId: string, currentUserId: string, payload: EditUserPayload) => CrudResult;
  deleteUser: (userId: string, currentUserId: string) => CrudResult;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return 'usr-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function aid(): string {
  return 'asn-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required.';
  if (!email.toLowerCase().endsWith('@careindeed.com')) {
    return 'Email must be a @careindeed.com address.';
  }
  const local = email.split('@')[0];
  if (!local || local.length < 1) return 'Invalid email format.';
  return null;
}

// ─── Browser persistence ────────────────────────────────────────────────────
//
// The Phase A identity-admin list is a browser-side store, mirroring its
// sibling `pageAccessStore` (which already persists the same class of data in
// localStorage). Without this, the store was rebuilt from the static seed on
// every page (re)load, so any admin-added/edited user vanished on refresh.
//
// This persists ONLY non-sensitive user/assignment metadata (id, email, name,
// status, group). It never stores passwords, OTPs, tokens, or secrets — those
// live exclusively in the backend auth source of truth (Cognito + DynamoDB
// registration) and are unaffected by this cache.

const STORAGE_KEY = 'ci.userAssignments.v1';

interface PersistedAssignments {
  users: User[];
  assignments: RoleAssignment[];
}

function loadFromStorage(): PersistedAssignments | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedAssignments>;
    if (!parsed || !Array.isArray(parsed.users) || !Array.isArray(parsed.assignments)) {
      return null;
    }
    // Light shape validation — drop anything that isn't a recognizable record
    // rather than throwing, so a stale/partial blob can't blank the admin list.
    const users = parsed.users.filter(
      (u): u is User => !!u && typeof u.id === 'string' && typeof u.email === 'string',
    );
    const assignments = parsed.assignments.filter(
      (a): a is RoleAssignment => !!a && typeof a.id === 'string' && typeof a.userId === 'string',
    );
    return { users, assignments };
  } catch {
    return null;
  }
}

function saveToStorage(state: PersistedAssignments): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota or privacy mode — swallow silently; the store still works in-memory.
  }
}

/**
 * Build the initial store state.
 *
 * First load (no persisted blob): seed from the static arrays and persist.
 * Subsequent loads: trust the persisted blob as the source of truth (so adds,
 * edits, and deletes survive refresh) but always guarantee the protected
 * bootstrap Super Admin and an active super-admin assignment exist, so the
 * admin can never be locked out by a stale cache. Persisted data is never
 * deleted or overwritten here.
 */
function buildInitialState(): PersistedAssignments {
  const seedUsers = DEMO_USERS.map(u => ({ ...u }));
  const seedAssignments = ROLE_ASSIGNMENTS.map(a => ({ ...a }));

  const persisted = loadFromStorage();
  if (!persisted) {
    const initial = { users: seedUsers, assignments: seedAssignments };
    saveToStorage(initial);
    return initial;
  }

  const users = [...persisted.users];
  const assignments = [...persisted.assignments];

  for (const protectedId of PROTECTED_USER_IDS) {
    if (!users.some(u => u.id === protectedId)) {
      const seedUser = seedUsers.find(u => u.id === protectedId);
      if (seedUser) users.push(seedUser);
    }
    const hasActiveSuperAdmin = assignments.some(
      a => a.userId === protectedId && a.groupId === SUPER_ADMIN_GROUP_ID && !a.revokedAt,
    );
    if (!hasActiveSuperAdmin) {
      const seedAsn = seedAssignments.find(
        a => a.userId === protectedId && a.groupId === SUPER_ADMIN_GROUP_ID,
      );
      if (seedAsn) assignments.push(seedAsn);
    }
  }

  const reconciled = { users, assignments };
  saveToStorage(reconciled);
  return reconciled;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const INITIAL_STATE = buildInitialState();

export const useUserAssignmentsStore = create<UserAssignmentsState>((set, get) => ({
  // Hydrated from localStorage (reconciled with the static seed). Mutations
  // below persist back so changes survive refresh, reload, and OTP generation.
  users: INITIAL_STATE.users,
  assignments: INITIAL_STATE.assignments,

  getUserById(userId) {
    return get().users.find(u => u.id === userId);
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

  addUser(payload) {
    const { users, assignments } = get();

    if (!payload.name.trim()) return { ok: false, error: 'Full name is required.' };

    const emailErr = validateEmail(payload.email);
    if (emailErr) return { ok: false, error: emailErr };

    if (!USER_GROUPS.find(g => g.id === payload.groupId)) {
      return { ok: false, error: 'Invalid user group selected.' };
    }

    if (users.some(u => u.email.toLowerCase() === payload.email.trim().toLowerCase())) {
      return { ok: false, error: 'A user with this email already exists.' };
    }

    const userId = uid();
    const now = new Date().toISOString();

    const newUser: User = {
      id: userId,
      email: payload.email.trim().toLowerCase(),
      name: payload.name.trim(),
      status: payload.status ?? 'active',
      source: 'manual-provisioned',
    };

    const newAssignment: RoleAssignment = {
      id: aid(),
      userId,
      groupId: payload.groupId,
      scope: { organizationId: 'careindeed-demo' },
      effectiveFrom: now,
    };

    const nextUsers = [...users, newUser];
    const nextAssignments = [...assignments, newAssignment];
    set({ users: nextUsers, assignments: nextAssignments });
    saveToStorage({ users: nextUsers, assignments: nextAssignments });
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

    if (payload.email !== undefined) {
      const emailErr = validateEmail(payload.email);
      if (emailErr) return { ok: false, error: emailErr };
      if (users.some(u => u.id !== userId && u.email.toLowerCase() === payload.email!.trim().toLowerCase())) {
        return { ok: false, error: 'A user with this email already exists.' };
      }
    }

    if (payload.groupId !== undefined && !USER_GROUPS.find(g => g.id === payload.groupId)) {
      return { ok: false, error: 'Invalid user group selected.' };
    }

    const updatedUser: User = {
      ...user,
      ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
      ...(payload.email !== undefined ? { email: payload.email.trim().toLowerCase() } : {}),
      ...(payload.status !== undefined ? { status: payload.status } : {}),
      source: 'manual-provisioned',
    };

    let updatedAssignments = assignments;
    if (payload.groupId !== undefined) {
      updatedAssignments = assignments.map(a =>
        a.userId === userId && !a.revokedAt
          ? { ...a, groupId: payload.groupId! }
          : a,
      );
    }

    const nextUsers = users.map(u => (u.id === userId ? updatedUser : u));
    set({ users: nextUsers, assignments: updatedAssignments });
    saveToStorage({ users: nextUsers, assignments: updatedAssignments });
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

    // Guard: never remove the last Super Admin
    const superAdminUserIds = assignments
      .filter(a => a.groupId === SUPER_ADMIN_GROUP_ID && !a.revokedAt)
      .map(a => a.userId);
    if (superAdminUserIds.length <= 1 && superAdminUserIds.includes(userId)) {
      return { ok: false, error: 'Cannot remove the last Super Admin.' };
    }

    const nextUsers = users.filter(u => u.id !== userId);
    const nextAssignments = assignments.filter(a => a.userId !== userId);
    set({ users: nextUsers, assignments: nextAssignments });
    saveToStorage({ users: nextUsers, assignments: nextAssignments });
    return { ok: true };
  },
}));

// ─── Non-hook accessors for authorize.ts ──────────────────────────────────────

/** Read live user state outside React components */
export function getLiveUserById(userId: string): User | undefined {
  return useUserAssignmentsStore.getState().getUserById(userId);
}

/** Read live active assignments outside React components */
export function getLiveActiveAssignments(userId: string, atIso?: string): RoleAssignment[] {
  return useUserAssignmentsStore.getState().getActiveAssignmentsForUser(userId, atIso);
}
