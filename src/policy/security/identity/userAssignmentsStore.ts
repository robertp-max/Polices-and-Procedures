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

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUserAssignmentsStore = create<UserAssignmentsState>((set, get) => ({
  // Seed from static arrays — deep copies so mutations don't touch the originals
  users: DEMO_USERS.map(u => ({ ...u })),
  assignments: ROLE_ASSIGNMENTS.map(a => ({ ...a })),

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

    set({ users: [...users, newUser], assignments: [...assignments, newAssignment] });
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

    set({
      users: users.map(u => (u.id === userId ? updatedUser : u)),
      assignments: updatedAssignments,
    });
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

    set({
      users: users.filter(u => u.id !== userId),
      assignments: assignments.filter(a => a.userId !== userId),
    });
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
