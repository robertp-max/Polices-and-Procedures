export interface DemoUser {
  id?: string;
  authSubject?: string;
  provider?: string;
  email: string;
  name?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
}

export interface AuthSession {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RegisterRequestResponse {
  requiresApproval: boolean;
  autoActivated?: boolean;
  message: string;
  debug?: {
    setupLink?: string;
    emailDelivery?: {
      ok?: boolean;
      errCode?: string;
      errMessage?: string;
    };
  };
}

export interface VerifyRegistrationResponse {
  verified: true;
  approvedUser: {
    fullName: string;
    role: string;
    department: string;
  };
}

/** Server-computed effective-access projection (ADR-0002 Phase 3C). The UI
 *  renders this; it never reconstructs the permission decision locally. */
export interface EffectiveAccessProjection {
  principalUserId: string;
  accountActive: boolean;
  accountStatus: string;
  groupIds: string[];
  privileged: boolean;
  permissions: string[];
  policyVersion: string;
  evaluatedAt: string;
}

export interface CapabilitiesResponse {
  authenticated: boolean;
  authorization: {
    capabilities: {
      manageUsers: boolean;
      manageUserStatus?: boolean;
      effectiveAccess?: EffectiveAccessProjection;
    };
  };
}

export interface UserAccessMutationResponse {
  ok: true;
  targetUserId: string;
  after: { status: 'active' | 'pending' | 'suspended' };
}

export interface UserAccessStateRow {
  userId: string;
  email: string;
  name: string;
  status: 'active' | 'pending' | 'suspended';
  authSubject?: string;
  provider?: string;
  roles: string[];
  privileged: boolean;
}

export interface UserAccessListResponse {
  users: UserAccessStateRow[];
}

export type AdminInviteStatus =
  | 'invited_and_delivered'
  | 'created_delivery_pending'
  | 'already_pending'
  | 'already_active';

export interface AdminInviteResponse {
  status: AdminInviteStatus;
  email: string;
  emailDelivered: boolean;
  provisioned: boolean;
  message: string;
}

interface LoginResponse {
  session: AuthSession;
  user: DemoUser;
}

export interface LoginChallengeResponse {
  challenge: 'NEW_PASSWORD_REQUIRED';
  challengeName?: 'NEW_PASSWORD_REQUIRED';
  session: string;
  email: string;
}

interface RefreshResponse {
  session: AuthSession;
}

interface MeResponse {
  user: DemoUser;
}

type PageAccessApiMap = Record<string, unknown>;

export interface IdentityRegistryApiUser {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'pending' | 'suspended';
  source?: 'manual-provisioned' | 'seed' | 'authenticated';
  authSubject?: string;
  provider?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

interface IdentityRegistryApiScope {
  organizationId: string;
  branchId?: string;
  programId?: string;
  patientId?: string;
}

export interface IdentityRegistryApiAssignment {
  id: string;
  userId: string;
  groupId: string;
  scope: IdentityRegistryApiScope;
  effectiveFrom: string;
  effectiveTo?: string;
  revokedAt?: string;
}

export type IdentityRegistryApiMap = {
  users: IdentityRegistryApiUser[];
  assignments: IdentityRegistryApiAssignment[];
  syncedCount?: number;
};

interface ApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
  };
}

export class AuthApiError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.code = code;
  }
}

const BASE = (import.meta.env.VITE_AUTH_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '/api/auth';
// The COG-2 user-access admin router lives beside the auth router under /api,
// not under /api/auth. Derive its base from the auth base so an env override
// (VITE_AUTH_API_BASE_URL) points both at the same origin.
const USER_ACCESS_BASE = `${BASE.replace(/\/auth$/, '')}/admin/user-access`;

async function callAt<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let payload: ApiErrorPayload | T = {};
  try {
    payload = text ? (JSON.parse(text) as ApiErrorPayload | T) : ({} as T);
  } catch {
    payload = {};
  }

  if (!res.ok) {
    const maybe = payload as ApiErrorPayload;
    const message = maybe.error?.message || 'Request failed. Please try again.';
    throw new AuthApiError(message, res.status, maybe.error?.code);
  }

  return payload as T;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let payload: ApiErrorPayload | T = {};
  try {
    payload = text ? (JSON.parse(text) as ApiErrorPayload | T) : ({} as T);
  } catch {
    payload = {};
  }

  if (!res.ok) {
    const maybe = payload as ApiErrorPayload;
    const message = maybe.error?.message || 'Request failed. Please try again.';
    throw new AuthApiError(message, res.status, maybe.error?.code);
  }

  return payload as T;
}

export const AuthApi = {
  getAllowlistStatus(): Promise<{ available: boolean }> {
    return call('/allowlist-status', { method: 'GET' });
  },

  verifyRegistration(email: string, sfOrgId: string): Promise<VerifyRegistrationResponse> {
    return call('/verify-registration', {
      method: 'POST',
      body: JSON.stringify({ email, sfOrgId }),
    });
  },

  setupAccountDirect(email: string, sfOrgId: string, firstName: string, lastName: string, password: string): Promise<{ success: true }> {
    return call('/setup-account-direct', {
      method: 'POST',
      body: JSON.stringify({ email, sfOrgId, firstName, lastName, password }),
    });
  },

  registerRequest(email: string): Promise<RegisterRequestResponse> {
    return call('/register-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  setupAccount(token: string, firstName: string, lastName: string, password: string): Promise<{ success: true }> {
    return call('/setup-account', {
      method: 'POST',
      body: JSON.stringify({ token, firstName, lastName, password }),
    });
  },

  resendSetupLink(email: string): Promise<{ message: string }> {
    return call('/resend-setup-link', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  login(email: string, password: string): Promise<LoginResponse | LoginChallengeResponse> {
    return call('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  respondChallenge(email: string, session: string, newPassword: string): Promise<LoginResponse> {
    return call('/respond-challenge', {
      method: 'POST',
      body: JSON.stringify({ email, session, newPassword }),
    });
  },

  refresh(refreshToken: string): Promise<RefreshResponse> {
    return call('/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  logout(accessToken: string): Promise<void> {
    return call('/logout', {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  },

  getCurrentUser(accessToken: string): Promise<MeResponse> {
    return call('/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  /** Server-authoritative capability contract for the authenticated actor. */
  getCapabilities(accessToken: string): Promise<CapabilitiesResponse> {
    return call('/capabilities', {
      method: 'GET',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  },

  /** Administrator-only user invitation. Requires an admin access token. */
  adminInviteUser(accessToken: string, email: string): Promise<AdminInviteResponse> {
    return call('/admin/users/invite', {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: JSON.stringify({ email }),
    });
  },

  forgotPassword(email: string): Promise<{ message: string }> {
    return call('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    return call('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    });
  },

  adminManualPasswordReset(accessToken: string, email: string, newPassword: string): Promise<{ message: string }> {
    return call('/admin/manual-password-reset', {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: JSON.stringify({ email, newPassword }),
    });
  },

  adminGrantAccess(accessToken: string, email: string, newPassword: string): Promise<{ message: string }> {
    return call('/admin/grant-access', {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: JSON.stringify({ email, newPassword }),
    });
  },

  getMyPageAccess(accessToken: string): Promise<{ actorEmail: string; record: unknown | null }> {
    return call('/page-access/me', {
      method: 'GET',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  },

  getAllPageAccess(accessToken: string): Promise<{ access: PageAccessApiMap }> {
    return call('/admin/page-access', {
      method: 'GET',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  },

  saveAllPageAccess(accessToken: string, access: PageAccessApiMap): Promise<{ access: PageAccessApiMap }> {
    return call('/admin/page-access', {
      method: 'PUT',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: JSON.stringify({ access }),
    });
  },

  syncCurrentIdentity(accessToken: string): Promise<IdentityRegistryApiMap> {
    return call('/identity-sync/me', {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  },

  getIdentityRegistry(accessToken: string): Promise<IdentityRegistryApiMap> {
    return call('/admin/identity-registry', {
      method: 'GET',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  },

  saveIdentityRegistry(accessToken: string, registry: IdentityRegistryApiMap): Promise<IdentityRegistryApiMap> {
    return call('/admin/identity-registry', {
      method: 'PUT',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: JSON.stringify(registry),
    });
  },

  syncAuthenticatedUsers(accessToken: string): Promise<IdentityRegistryApiMap> {
    return call('/admin/identity-registry/sync-authenticated-users', {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  },

  /** Server-authoritative access-state projection (canonical registry users). */
  listUserAccess(accessToken: string): Promise<UserAccessListResponse> {
    return callAt(USER_ACCESS_BASE, '/', {
      method: 'GET',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  },

  /** Server-computed effective access for a target user (ADR-0002 Phase 3/4). */
  getUserEffectiveAccess(accessToken: string, userId: string): Promise<{ effectiveAccess: EffectiveAccessProjection }> {
    return callAt(USER_ACCESS_BASE, `/${encodeURIComponent(userId)}/effective-access`, {
      method: 'GET',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  },

  /**
   * Server-authoritative suspend. Hits the COG-2 user-access router, which
   * verifies the Cognito actor, enforces the unified user-status authority,
   * mutates the canonical registry, and audits. No client identity is trusted.
   */
  suspendUser(accessToken: string, userId: string): Promise<UserAccessMutationResponse> {
    return callAt(USER_ACCESS_BASE, '/suspend', {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: JSON.stringify({ userId }),
    });
  },

  /** Server-authoritative reactivate; same authority + audit path as suspendUser. */
  reactivateUser(accessToken: string, userId: string): Promise<UserAccessMutationResponse> {
    return callAt(USER_ACCESS_BASE, '/reactivate', {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: JSON.stringify({ userId }),
    });
  },
};
