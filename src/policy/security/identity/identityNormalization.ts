import type { DemoUser as AuthDemoUser } from '@/auth/api';
import type { User } from './types';

export const DEFAULT_AUTHENTICATED_GROUP_ID = 'grp-pending-user';
export const DEFAULT_ORGANIZATION_ID = 'careindeed-demo';
export const ONBOARDING_GROUP_ID = 'grp-onboarding';

export const IDENTITY_ROLE_UPDATE_EXEMPT_USER_IDS = new Set([
  'demo-user-careindeed',
  'usr-marites',
  'usr-deeb-admin',
]);

export const IDENTITY_ROLE_UPDATE_EXEMPT_EMAILS = new Set([
  'robertp@careindeed.com',
  'maritesa@careindeed.com',
  'deeb@careindeed.com',
]);

export function normalizeUserEmail(email: string | null | undefined): string {
  return String(email ?? '').trim().toLowerCase();
}

export function isIdentityRoleUpdateExempt(identity: Pick<User, 'id' | 'email'> | null | undefined): boolean {
  if (!identity) return false;
  return IDENTITY_ROLE_UPDATE_EXEMPT_USER_IDS.has(identity.id)
    || IDENTITY_ROLE_UPDATE_EXEMPT_EMAILS.has(normalizeUserEmail(identity.email));
}

function normalizeIdentitySegment(value: string | null | undefined): string {
  return encodeURIComponent(String(value ?? '').trim().toLowerCase());
}

export function getAuthProvider(authUser: AuthDemoUser | null | undefined): string {
  const provider = String(authUser?.provider ?? '').trim().toLowerCase();
  return provider || 'cognito';
}

export function getAuthSubject(authUser: AuthDemoUser | null | undefined): string {
  return String(authUser?.authSubject ?? authUser?.id ?? '').trim();
}

export function getUserStableKey(authUser: AuthDemoUser | null | undefined): string {
  const subject = getAuthSubject(authUser);
  if (subject) {
    return `auth:${getAuthProvider(authUser)}:${normalizeIdentitySegment(subject)}`;
  }

  const email = normalizeUserEmail(authUser?.email);
  return email ? getEmailFallbackUserId(email) : '';
}

export function getEmailFallbackUserId(email: string): string {
  return `email:${normalizeUserEmail(email)}`;
}

export function getDisplayNameFromAuth(authUser: AuthDemoUser): string {
  const explicitName = authUser.name?.trim();
  if (explicitName) return explicitName;

  const firstName = authUser.firstName?.trim();
  const lastName = authUser.lastName?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;

  const local = normalizeUserEmail(authUser.email).split('@')[0] ?? '';
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length > 0) {
    return parts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  return normalizeUserEmail(authUser.email) || 'Authenticated User';
}

export function toAppUser(authUser: AuthDemoUser, nowIso = new Date().toISOString()): User | null {
  const email = normalizeUserEmail(authUser.email);
  if (!email) return null;

  const stableId = getUserStableKey(authUser) || getEmailFallbackUserId(email);
  const authSubject = getAuthSubject(authUser);

  return {
    id: stableId,
    email,
    name: getDisplayNameFromAuth(authUser),
    status: 'pending',
    source: 'authenticated',
    authSubject: authSubject || undefined,
    provider: getAuthProvider(authUser),
    createdAt: nowIso,
    lastLoginAt: nowIso,
  };
}
