/**
 * ADR-0002 §9 / Phase 6 — reconciliation findings (enterprise view).
 *
 * Pure detection over the canonical identity registry: orphan identities,
 * duplicate emails, orphan role assignments, and excessive-privilege holders.
 * These are the "manual review required" items the reconciliation queue surfaces.
 * Computed from existing registry data (no lifecycle-store scan required).
 */
import type { AppIdentityRegistry, AppIdentityUser, AppRoleAssignment } from '../appIdentityPersistence.js';
import { PRIVILEGED_GROUP_IDS } from './catalog.js';
import { normalizeIdentityEmail } from '../accountLifecycle/identityEmail.js';

export interface ReconciliationFindings {
  duplicateEmails: Array<{ normalizedEmail: string; userIds: string[] }>;
  orphanAssignments: Array<{ assignmentId: string; userId: string; groupId: string }>;
  usersWithoutActiveGroup: Array<{ userId: string; email: string }>;
  excessivePrivilege: Array<{ userId: string; email: string; privilegedGroups: string[] }>;
  summary: {
    duplicateEmailGroups: number;
    orphanAssignments: number;
    usersWithoutActiveGroup: number;
    excessivePrivilege: number;
    totalFindings: number;
  };
  evaluatedAt: string;
}

function activeAssignmentsByUser(assignments: readonly AppRoleAssignment[], nowIso: string): Map<string, AppRoleAssignment[]> {
  const map = new Map<string, AppRoleAssignment[]>();
  for (const a of assignments) {
    if (a.revokedAt) continue;
    if (a.effectiveFrom && nowIso < a.effectiveFrom) continue;
    if (a.effectiveTo && nowIso >= a.effectiveTo) continue;
    const list = map.get(a.userId) ?? [];
    list.push(a);
    map.set(a.userId, list);
  }
  return map;
}

export function computeReconciliationFindings(registry: AppIdentityRegistry, nowIso: string): ReconciliationFindings {
  const users: AppIdentityUser[] = registry.users ?? [];
  const assignments: AppRoleAssignment[] = registry.assignments ?? [];
  const userIds = new Set(users.map((u) => u.id));
  const activeByUser = activeAssignmentsByUser(assignments, nowIso);

  // duplicate emails (normalized) → multiple canonical users
  const byEmail = new Map<string, string[]>();
  for (const u of users) {
    const key = normalizeIdentityEmail(u.email ?? '');
    if (!key) continue;
    const ids = byEmail.get(key) ?? [];
    ids.push(u.id);
    byEmail.set(key, ids);
  }
  const duplicateEmails = [...byEmail.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([normalizedEmail, userIds]) => ({ normalizedEmail, userIds }));

  // assignments pointing at a non-existent user
  const orphanAssignments = assignments
    .filter((a) => !a.revokedAt && !userIds.has(a.userId))
    .map((a) => ({ assignmentId: a.id, userId: a.userId, groupId: a.groupId }));

  // active users with no active group assignment
  const usersWithoutActiveGroup = users
    .filter((u) => u.status === 'active' && (activeByUser.get(u.id)?.length ?? 0) === 0)
    .map((u) => ({ userId: u.id, email: u.email }));

  // users holding more than one privileged group (review candidate)
  const excessivePrivilege = users
    .map((u) => {
      const privileged = (activeByUser.get(u.id) ?? []).map((a) => a.groupId).filter((g) => PRIVILEGED_GROUP_IDS.has(g));
      return { userId: u.id, email: u.email, privilegedGroups: [...new Set(privileged)] };
    })
    .filter((r) => r.privilegedGroups.length > 1);

  return {
    duplicateEmails,
    orphanAssignments,
    usersWithoutActiveGroup,
    excessivePrivilege,
    summary: {
      duplicateEmailGroups: duplicateEmails.length,
      orphanAssignments: orphanAssignments.length,
      usersWithoutActiveGroup: usersWithoutActiveGroup.length,
      excessivePrivilege: excessivePrivilege.length,
      totalFindings: duplicateEmails.length + orphanAssignments.length + usersWithoutActiveGroup.length + excessivePrivilege.length,
    },
    evaluatedAt: nowIso,
  };
}
