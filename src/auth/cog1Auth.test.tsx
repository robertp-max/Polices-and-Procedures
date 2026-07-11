/**
 * Phase COG-1 — Cognito login acceptance tests (mocked network; no live
 * Cognito, Drive, or Calendar calls). Proves the provider/session/guard gates.
 */
import React, { useEffect } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, waitFor, act, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

/* Controllable demo-bypass mock (production-shaped = disabled). */
const bypassState = vi.hoisted(() => ({ enabled: false }));
vi.mock('./bypass', () => ({
  isDemoAuthBypassEnabled: () => bypassState.enabled,
  isVercelHosted: () => false,
}));

import { AuthProvider, useAuth } from './AuthProvider';
import { RequireAuth } from './RequireAuth';
import { clearSession, loadSession, localStorageHasNoTokens, redactForLog, saveSession } from './session';
import { useUserAssignmentsStore } from '@/policy/security/identity/userAssignmentsStore';

/* ─── fetch mock ─────────────────────────────────────────────────────────── */
type Handler = (path: string, init?: RequestInit) => { status: number; body?: unknown } | undefined;
let handlers: Handler[] = [];
const fetchCalls: Array<{ path: string; init?: RequestInit }> = [];

function jsonResponse(status: number, body: unknown = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as Response;
}

beforeEach(() => {
  handlers = [];
  fetchCalls.length = 0;
  bypassState.enabled = false;
  clearSession();
  window.localStorage.clear();
  window.sessionStorage.clear();
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    const path = String(url).replace(/^.*\/api\/auth/, '');
    fetchCalls.push({ path, init });
    for (const handler of handlers) {
      const result = handler(path, init);
      if (result) return jsonResponse(result.status, result.body);
    }
    return jsonResponse(404, { error: { message: 'not handled' } });
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const SESSION = {
  accessToken: 'access-token-abc', idToken: 'id-token-abc', refreshToken: 'refresh-token-abc',
  expiresIn: 3600, tokenType: 'Bearer',
};
const ME = {
  id: 'sub-1234', authSubject: 'sub-1234', provider: 'cognito', email: 'nurse@careindeed.com',
  name: 'Norah Nurse', firstName: 'Norah', lastName: 'Nurse', emailVerified: true, role: 'Supervisor',
};

function onLogin(result: { status: number; body?: unknown }): void {
  handlers.push((p) => (p === '/login' ? result : undefined));
}
function onMe(result: { status: number; body?: unknown }): void {
  handlers.push((p) => (p === '/me' ? result : undefined));
}

/* Capture the context imperatively. */
type Ctx = ReturnType<typeof useAuth>;
function Capture({ onCtx }: { onCtx: (ctx: Ctx) => void }) {
  const ctx = useAuth();
  useEffect(() => { onCtx(ctx); });
  return <span data-testid="status">{ctx.status}</span>;
}

function renderAuth() {
  const ref: { current: Ctx | null } = { current: null };
  render(
    <AuthProvider>
      <Capture onCtx={(ctx) => { ref.current = ctx; }} />
    </AuthProvider>,
  );
  return ref;
}

/* ─── Provider gates ─────────────────────────────────────────────────────── */
describe('AuthProvider — production-shaped (no demo fallback)', () => {
  it('never returns demo-user: settles unauthenticated with no session', async () => {
    const ref = renderAuth();
    await waitFor(() => expect(ref.current?.status).toBe('unauthenticated'));
    expect(ref.current?.user).toBeNull();
    expect(JSON.stringify(ref.current?.user ?? {})).not.toContain('demo-user');
  });

  it('stays loading until session resolution completes (no early flash)', async () => {
    // Seed a stored session so restoration performs a real async /me call.
    saveSession(SESSION);
    let resolveMe: (v: { status: number; body: unknown }) => void = () => {};
    handlers.push((p) => (p === '/me' ? { status: 0, body: undefined } : undefined));
    // Replace fetch for /me with a deferred promise.
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const path = String(url).replace(/^.*\/api\/auth/, '');
      if (path === '/me') {
        const result = await new Promise<{ status: number; body: unknown }>((resolve) => { resolveMe = resolve; });
        return jsonResponse(result.status, result.body);
      }
      return jsonResponse(404, {});
    }));
    const ref = renderAuth();
    expect(ref.current?.status).toBe('loading');
    expect(ref.current?.loading).toBe(true);
    await act(async () => { resolveMe({ status: 200, body: { user: ME } }); });
    await waitFor(() => expect(ref.current?.status).toBe('authenticated'));
  });

  it('valid credentials establish an authenticated session with server-authoritative role', async () => {
    onLogin({ status: 200, body: { session: SESSION, user: ME } });
    // Tampered local role must not win — server /me payload is the source.
    window.localStorage.setItem('tampered-role', 'Administrator');
    const ref = renderAuth();
    await waitFor(() => expect(ref.current?.status).toBe('unauthenticated'));
    await act(async () => { await ref.current!.login('nurse@careindeed.com', 'correct horse'); });
    expect(ref.current?.status).toBe('authenticated');
    expect(ref.current?.user?.appRole).toBe('Supervisor');
    expect(ref.current?.user?.role).toBe('Supervisor');
    expect(ref.current?.user?.cognitoSub).toBe('sub-1234');
    expect(ref.current?.user?.email).toBe('nurse@careindeed.com');
  });

  it('login sends only credentials — the client cannot submit its own role', async () => {
    onLogin({ status: 200, body: { session: SESSION, user: ME } });
    const ref = renderAuth();
    await waitFor(() => expect(ref.current?.status).toBe('unauthenticated'));
    await act(async () => { await ref.current!.login('nurse@careindeed.com', 'pw-123456'); });
    const loginCall = fetchCalls.find((c) => c.path === '/login')!;
    const body = JSON.parse(String(loginCall.init?.body));
    expect(Object.keys(body).sort()).toEqual(['email', 'password']);
  });

  it('invalid credentials produce a generic safe error (no enumeration)', async () => {
    onLogin({ status: 401, body: { error: { code: 'auth_error', message: 'User not found in pool xyz' } } });
    const ref = renderAuth();
    await waitFor(() => expect(ref.current?.status).toBe('unauthenticated'));
    let thrown: unknown = null;
    await act(async () => {
      try { await ref.current!.login('who@nowhere.com', 'bad'); } catch (e) { thrown = e; }
    });
    expect(thrown).toBeTruthy();
    await waitFor(() => expect(ref.current?.error).toBe('Incorrect email or password.'));
    expect(ref.current?.error).not.toContain('not found');
    expect(ref.current?.status).toBe('unauthenticated');
  });

  it('handles NEW_PASSWORD_REQUIRED via the typed challenge model', async () => {
    onLogin({ status: 200, body: { challenge: 'NEW_PASSWORD_REQUIRED', session: 'cognito-session-blob', email: 'new@careindeed.com' } });
    handlers.push((p) => (p === '/respond-challenge' ? { status: 200, body: { session: SESSION, user: { ...ME, email: 'new@careindeed.com' } } } : undefined));
    const ref = renderAuth();
    await waitFor(() => expect(ref.current?.status).toBe('unauthenticated'));
    let outcome: string | undefined;
    await act(async () => { outcome = await ref.current!.login('new@careindeed.com', 'temp-pw'); });
    expect(outcome).toBe('challenge');
    expect(ref.current?.challenge).toEqual({ type: 'NEW_PASSWORD_REQUIRED', email: 'new@careindeed.com' });
    await act(async () => { await ref.current!.completeNewPassword('New-Password-1!'); });
    expect(ref.current?.status).toBe('authenticated');
    expect(ref.current?.challenge).toBeNull();
    // The raw Cognito session blob stayed inside the provider.
    const respond = fetchCalls.find((c) => c.path === '/respond-challenge')!;
    expect(JSON.parse(String(respond.init?.body)).session).toBe('cognito-session-blob');
  });

  it('restores the session after a browser refresh (stored envelope → /me)', async () => {
    saveSession(SESSION);
    onMe({ status: 200, body: { user: ME } });
    const ref = renderAuth();
    await waitFor(() => expect(ref.current?.status).toBe('authenticated'));
    expect(ref.current?.user?.displayName).toBe('Norah Nurse');
    expect(ref.current?.user?.sessionExpiresAt).toBeTruthy();
  });

  it('expired stored session without a refresh token signs out (fail closed)', async () => {
    saveSession({ ...SESSION, expiresIn: -3600, refreshToken: '' });
    const ref = renderAuth();
    await waitFor(() => expect(ref.current?.status).toBe('unauthenticated'));
    expect(loadSession()).toBeNull();
  });

  it('a revoked/disabled user is denied on the next server check', async () => {
    saveSession(SESSION);
    let revoked = false;
    handlers.push((p) => {
      if (p === '/me') return revoked ? { status: 401, body: { error: { message: 'Disabled.' } } } : { status: 200, body: { user: ME } };
      if (p === '/refresh') return { status: 401, body: { error: { message: 'Disabled.' } } };
      return undefined;
    });
    const ref = renderAuth();
    await waitFor(() => expect(ref.current?.status).toBe('authenticated'));
    revoked = true;
    await act(async () => { await ref.current!.refreshUser(); });
    expect(ref.current?.status).toBe('unauthenticated');
    expect(ref.current?.user).toBeNull();
  });

  it('logout removes effective access and clears the stored session', async () => {
    saveSession(SESSION);
    onMe({ status: 200, body: { user: ME } });
    handlers.push((p) => (p === '/logout' ? { status: 204 } : undefined));
    const ref = renderAuth();
    await waitFor(() => expect(ref.current?.status).toBe('authenticated'));
    await act(async () => { await ref.current!.logout(); });
    expect(ref.current?.status).toBe('unauthenticated');
    expect(loadSession()).toBeNull();
    expect(ref.current?.getAccessToken()).toBeNull();
  });

  it('binds the Cognito sub to the existing canonical CIHHC userId', async () => {
    const store = useUserAssignmentsStore.getState();
    const existing = store.users.find((u) => u.email.toLowerCase() === 'nurse@careindeed.com')
      ?? (() => { store.addUser({ name: 'Norah Nurse', email: 'nurse@careindeed.com', groupId: 'grp-rn' } as never); return useUserAssignmentsStore.getState().users.find((u) => u.email.toLowerCase() === 'nurse@careindeed.com')!; })();
    onLogin({ status: 200, body: { session: SESSION, user: ME } });
    const ref = renderAuth();
    await waitFor(() => expect(ref.current?.status).toBe('unauthenticated'));
    await act(async () => { await ref.current!.login('nurse@careindeed.com', 'pw-123456'); });
    // Canonical id (not the raw Cognito sub) is the app-facing userId.
    expect(ref.current?.user?.userId).toBe(existing.id);
    expect(ref.current?.user?.cognitoSub).toBe('sub-1234');
    const bound = useUserAssignmentsStore.getState().users.find((u) => u.id === existing.id)!;
    expect(bound.authSubject).toBe('sub-1234');
  });
});

/* ─── Demo bypass stays local-only ───────────────────────────────────────── */
describe('AuthProvider — local demo bypass', () => {
  it('yields a labeled demo session only where the bypass policy allows it', async () => {
    bypassState.enabled = true;
    const ref = renderAuth();
    await waitFor(() => expect(ref.current?.status).toBe('demo'));
    expect(ref.current?.user?.isDemo).toBe(true);
    expect(ref.current?.isDemo).toBe(true);
  });
});

/* ─── Session storage rules ──────────────────────────────────────────────── */
describe('session containment', () => {
  it('never stores any token in localStorage; refresh token never persisted at all', () => {
    saveSession(SESSION);
    expect(localStorageHasNoTokens()).toBe(true);
    const rawEnvelope = window.sessionStorage.getItem('ci.authSession.v1') ?? '';
    expect(rawEnvelope).not.toContain('refresh-token-abc');
    expect(rawEnvelope).toContain('access-token-abc'); // documented, contained exposure
    expect(window.localStorage.getItem('ci.authSession.v1')).toBeNull();
  });

  it('redactForLog masks tokens, passwords, setup tokens, and reset codes', () => {
    const leaky = JSON.stringify({
      accessToken: 'secret-a', refreshToken: 'secret-r', idToken: 'secret-i',
      password: 'hunter22!', code: '123456',
    }) + ' Authorization: Bearer abc.def.ghi token=xyz123';
    const redacted = redactForLog(leaky);
    for (const secret of ['secret-a', 'secret-r', 'secret-i', 'hunter22!', '123456', 'abc.def.ghi', 'xyz123']) {
      expect(redacted).not.toContain(secret);
    }
  });
});

/* ─── Route guard ────────────────────────────────────────────────────────── */
describe('RequireAuth guard', () => {
  function renderGuarded() {
    return render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={<RequireAuth><div data-testid="secret">SECRET</div></RequireAuth>}
            />
            <Route path="/login" element={<div data-testid="login">LOGIN</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
  }

  it('redirects unauthenticated users to /login and never flashes content', async () => {
    renderGuarded();
    await waitFor(() => expect(screen.getByTestId('login')).toBeTruthy());
    expect(screen.queryByTestId('secret')).toBeNull();
  });

  it('renders protected content for an authenticated session', async () => {
    saveSession(SESSION);
    onMe({ status: 200, body: { user: ME } });
    renderGuarded();
    await waitFor(() => expect(screen.getByTestId('secret')).toBeTruthy());
    expect(screen.queryByTestId('login')).toBeNull();
  });
});
