/**
 * Regression tests for the shared authenticated API client helpers.
 * Guards the Brad/Nolan production fixes: real bearer attached, correct API
 * origin, and no reliance on localStorage tokens.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiRoot, bearerAuthHeader } from './apiClient';
import { saveSession, clearSession } from './session';

beforeEach(() => {
  clearSession();
  vi.unstubAllEnvs();
});
afterEach(() => {
  clearSession();
  vi.unstubAllEnvs();
});

describe('apiRoot()', () => {
  it('defaults to same-origin /api when no auth base is set', () => {
    vi.stubEnv('VITE_AUTH_API_BASE_URL', '');
    expect(apiRoot()).toBe('/api');
  });

  it('derives /api from a relative auth base', () => {
    vi.stubEnv('VITE_AUTH_API_BASE_URL', '/api/auth');
    expect(apiRoot()).toBe('/api');
  });

  it('derives the API root from an absolute auth base (split topology)', () => {
    vi.stubEnv('VITE_AUTH_API_BASE_URL', 'https://api.example.com/api/auth/');
    expect(apiRoot()).toBe('https://api.example.com/api');
  });
});

describe('bearerAuthHeader()', () => {
  it('is empty when there is no session (server fallbacks handle anon)', () => {
    expect(bearerAuthHeader()).toEqual({});
  });

  it('attaches the current access token as a Bearer header', () => {
    saveSession({ accessToken: 'tok-123', idToken: 'id', refreshToken: 'r', expiresIn: 3600, tokenType: 'Bearer' });
    expect(bearerAuthHeader()).toEqual({ Authorization: 'Bearer tok-123' });
  });

  it('is empty for an expired session (does not send a stale token)', () => {
    // expiresIn is floored at 60s, but isSessionExpired applies a 30s skew and
    // the stored envelope is mutated to the past to simulate expiry.
    saveSession({ accessToken: 'old', idToken: 'id', refreshToken: 'r', expiresIn: 60, tokenType: 'Bearer' });
    const raw = JSON.parse(window.sessionStorage.getItem('ci.authSession.v1') as string);
    raw.expiresAt = Date.now() - 1000;
    window.sessionStorage.setItem('ci.authSession.v1', JSON.stringify(raw));
    expect(bearerAuthHeader()).toEqual({});
  });

  it('never reads a token from localStorage', () => {
    window.localStorage.setItem('ci.authSession.v1', JSON.stringify({ accessToken: 'ls-tok', expiresAt: Date.now() + 1e6, issuedAt: Date.now() }));
    expect(bearerAuthHeader()).toEqual({});
    window.localStorage.removeItem('ci.authSession.v1');
  });
});
