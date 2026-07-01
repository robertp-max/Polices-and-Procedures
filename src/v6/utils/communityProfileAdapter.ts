/**
 * Community Profile visibility and basic user projection adapter.
 *
 * Phase 1 extension: adds visibility control without rich profile data.
 * Uses localStorage for demo persistence (clear TODO for real backend).
 *
 * Thread posts are ALWAYS public to authenticated internal users regardless of visibility.
 * This adapter ONLY controls the profile page shell.
 */

import { isAdminRole } from './adminRoleHelper';

export type ProfileVisibility = 'private' | 'public';

export interface BasicUserProfile {
  userId: string;
  displayName: string;
  jobTitle?: string;
  department?: string;
  accessLevel?: string;
  role?: string;
  avatarUrl?: string;
  initials: string;
  isCurrentUser: boolean;
  visibility: ProfileVisibility;
}

const VISIBILITY_STORAGE_KEY = 'community-profile-visibility-v1';

// Seed a few demo users from existing admin mock patterns (limited fields only).
// No bio, no creds, no stats, no availability.
const DEMO_USERS: Record<string, Omit<BasicUserProfile, 'visibility' | 'isCurrentUser'>> = {
  'demo-user': {
    userId: 'demo-user',
    displayName: 'Demo User',
    jobTitle: 'Administrator',
    department: undefined,
    accessLevel: 'Administrator',
    role: 'Administrator',
    initials: 'DU',
  },
  'u-admin-brad': {
    userId: 'u-admin-brad',
    displayName: 'Brad Administrator',
    jobTitle: 'Platform Owner',
    department: undefined,
    accessLevel: 'Platform Owner',
    role: 'Platform Owner',
    initials: 'BA',
  },
  'u-compliance-tp': {
    userId: 'u-compliance-tp',
    displayName: 'Tina Patel',
    jobTitle: 'Compliance Officer',
    department: undefined,
    accessLevel: 'Compliance Officer',
    role: 'Compliance Officer',
    initials: 'TP',
  },
  'u-don-01': {
    userId: 'u-don-01',
    displayName: 'Maria Gonzalez',
    jobTitle: 'DON',
    department: undefined,
    accessLevel: 'DON',
    role: 'DON',
    initials: 'MG',
  },
  'u-onboarding-jr': {
    userId: 'u-onboarding-jr',
    displayName: 'Jon Rivera',
    jobTitle: 'Credentialing Coordinator',
    department: undefined,
    accessLevel: 'Onboarding',
    role: 'Credentialing Coordinator',
    initials: 'JR',
  },
};

function loadVisibilityMap(): Record<string, ProfileVisibility> {
  try {
    const raw = localStorage.getItem(VISIBILITY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveVisibilityMap(map: Record<string, ProfileVisibility>) {
  try {
    localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

/** Get visibility for a user. Defaults to 'private' per requirements. */
export function getProfileVisibility(userId: string): ProfileVisibility {
  const map = loadVisibilityMap();
  return map[userId] ?? 'private';
}

/** Set visibility (owner or admin flow). */
export function setProfileVisibility(userId: string, visibility: ProfileVisibility) {
  const map = loadVisibilityMap();
  map[userId] = visibility;
  saveVisibilityMap(map);
}

/** Simple permission check.
 * - Owner always can view own.
 * - Admin (by role) can view for admin purposes.
 * - Public: any authenticated internal user.
 * - Private: only owner + admin (no connections model yet → no other viewers).
 */
export function canViewCommunityProfile(
  viewer: { userId: string; role?: string } | null,
  ownerUserId: string,
  visibility: ProfileVisibility
): boolean {
  if (!viewer) return false;
  if (viewer.userId === ownerUserId) return true;

  if (isAdminRole(viewer.role)) return true;
  if (visibility === 'public') return true;

  // Private + no connections implemented → only owner/admin
  return false;
}

/** Get basic profile (extended with visibility). Falls back to demo seed. */
export function getBasicUserProfile(userId: string, currentUserId?: string): BasicUserProfile {
  const base = DEMO_USERS[userId] ?? {
    userId,
    displayName: 'User',
    jobTitle: undefined,
    department: undefined,
    accessLevel: undefined,
    role: undefined,
    initials: userId.slice(0, 2).toUpperCase() || 'U',
  };

  const visibility = getProfileVisibility(userId);
  const isCurrent = currentUserId ? userId === currentUserId : userId === 'demo-user';

  return {
    ...base,
    visibility,
    isCurrentUser: isCurrent,
  };
}

/** List all known demo community users (for Admin → Community Profiles). */
export function listCommunityUsers(): BasicUserProfile[] {
  return Object.keys(DEMO_USERS).map((id) => getBasicUserProfile(id, 'demo-user'));
}

// Clear TODO: Replace localStorage with real user service / backend when available.
// Visibility should be stored per-user in the identity/user registry.
export const COMMUNITY_PROFILE_TODO = 'TODO: Persist profile visibility in backend identity registry instead of localStorage.';
