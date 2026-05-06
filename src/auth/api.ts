export interface DemoUser {
  id?: string;
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

interface LoginResponse {
  session: AuthSession;
  user: DemoUser;
}

export interface LoginChallengeResponse {
  challenge: 'NEW_PASSWORD_REQUIRED';
  session: string;
  email: string;
}

interface RefreshResponse {
  session: AuthSession;
}

interface MeResponse {
  user: DemoUser;
}

interface ApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
  };
}

const BASE = (import.meta.env.VITE_AUTH_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '/api/auth';

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
    throw new Error(message);
  }

  return payload as T;
}

export const AuthApi = {
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
};
