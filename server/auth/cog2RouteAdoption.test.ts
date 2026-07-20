/**
 * COG-2 — route-adoption integration tests.
 *
 * Exercises the REAL Express mount chain (identity middleware → auth boundary →
 * routers), not just helper functions, over an ephemeral server + fetch. The
 * auth boundary's verification deps are injected so no live Cognito/DynamoDB is
 * required. Also asserts the route access matrix covers every mounted router.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import express, { type Express, type ErrorRequestHandler } from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { identityMiddleware } from '../identity/middleware.js';
import { requireApiAuth, requireRole } from './apiAuthBoundary.js';
import { ApiError } from '../errors.js';
import type { RequireAuthDeps } from './requireCognitoAuth.js';

/** Minimal error handler mirroring server/index.ts: ApiError → its status. */
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err instanceof ApiError ? err.status : 500;
  res.status(status).json({ error: { code: err?.code ?? 'internal_error', message: err?.message ?? 'error' } });
};
import type { AppIdentityRegistry } from './appIdentityPersistence.js';
import type { DemoUser } from './types.js';
import {
  ADMIN_ROLE_GROUPS, ROUTE_ACCESS_MATRIX,
} from './routeAccessMatrix.js';

const ISSUER = 'https://cognito-idp.us-west-1.amazonaws.com/us-west-1_TEST';
const CLIENT = 'test-client';
const NOW_S = 1_800_000_000;

function makeToken(payload: Record<string, unknown>): string {
  const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${enc({ alg: 'RS256' })}.${enc(payload)}.sig`;
}
const accessPayload = (over: Record<string, unknown> = {}) =>
  ({ token_use: 'access', iss: ISSUER, client_id: CLIENT, exp: NOW_S + 3600, sub: 'sub-nurse', ...over });

function registry(): AppIdentityRegistry {
  return {
    users: [
      { id: 'usr-nurse', email: 'nurse@careindeed.com', name: 'Nurse', status: 'active', authSubject: 'sub-nurse' },
      { id: 'usr-admin', email: 'admin@careindeed.com', name: 'Admin', status: 'active', authSubject: 'sub-admin' },
      { id: 'usr-susp', email: 'susp@careindeed.com', name: 'Susp', status: 'suspended', authSubject: 'sub-susp' },
    ],
    assignments: [
      { id: 'a1', userId: 'usr-nurse', groupId: 'grp-rn', scope: { organizationId: 'o' }, effectiveFrom: '2020-01-01T00:00:00Z' },
      { id: 'a2', userId: 'usr-admin', groupId: 'grp-super-admin', scope: { organizationId: 'o' }, effectiveFrom: '2020-01-01T00:00:00Z' },
    ],
  };
}

/** Verification deps that read the token's `sub`, mock authenticity/registry. */
function testDeps(reg = registry()): Partial<RequireAuthDeps> {
  return {
    getCurrentUser: async (token: string): Promise<DemoUser> => {
      // Mimic Cognito GetUser: decode our test token to learn the subject.
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as Record<string, unknown>;
      const sub = String(payload.sub);
      const user = reg.users.find((u) => u.authSubject === sub);
      // Cognito would reject a token whose sub it cannot mint; emulate for unknown.
      return { id: sub, authSubject: sub, email: user?.email ?? `${sub}@unknown.test`, emailVerified: true, provider: 'cognito' };
    },
    loadRegistry: async () => reg,
    issuer: ISSUER,
    clientId: CLIENT,
    nowSeconds: () => NOW_S,
    nowIso: () => '2027-01-01T00:00:00.000Z',
  };
}

let server: Server;
let base: string;

beforeAll(async () => {
  const app: Express = express();
  app.use(express.json());
  app.use('/api', identityMiddleware);

  // Public/self-guarded surface mounted BEFORE the boundary.
  app.get('/api/auth/allowlist-status', (_req, res) => res.json({ available: true, public: true }));

  // The boundary (with injected verification), then representative routers.
  app.use('/api', requireApiAuth({ deps: testDeps() }));

  // Public health endpoints (declared in the matrix) must pass the boundary.
  app.get('/api/ces/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/ia/health', (_req, res) => res.json({ ok: true }));

  // AUTHENTICATED business route: echoes the server-resolved actor.
  app.get('/api/ces/board', (req, res) => res.json({ actor: req.actor }));
  // ADMIN business route (role-gated).
  app.get('/api/audit/events', requireRole(ADMIN_ROLE_GROUPS), (_req, res) => res.json({ events: [] }));

  app.use(errorHandler);

  server = app.listen(0);
  await new Promise<void>((r) => server.once('listening', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => { server?.close(); });

function get(path_: string, headers: Record<string, string> = {}) {
  return fetch(`${base}${path_}`, { headers });
}
const bearer = (p: Record<string, unknown> = {}) => ({ authorization: `Bearer ${makeToken(accessPayload(p))}` });

describe('COG-2 mounted-route authentication', () => {
  it('PUBLIC: allowlist-status is reachable without a token', async () => {
    const r = await get('/api/auth/allowlist-status');
    expect(r.status).toBe(200);
  });

  it('PUBLIC: health endpoints pass the boundary without a token', async () => {
    expect((await get('/api/ces/health')).status).toBe(200);
    expect((await get('/api/ia/health')).status).toBe(200);
  });

  it('AUTHENTICATED: business route rejects a missing token (401)', async () => {
    const r = await get('/api/ces/board');
    expect(r.status).toBe(401);
  });

  it('AUTHENTICATED: rejects a malformed / wrong-issuer / expired token (401)', async () => {
    expect((await get('/api/ces/board', { authorization: 'Bearer not-a-jwt' })).status).toBe(401);
    expect((await get('/api/ces/board', bearer({ iss: 'https://evil/x' }))).status).toBe(401);
    expect((await get('/api/ces/board', bearer({ exp: NOW_S - 10 }))).status).toBe(401);
    expect((await get('/api/ces/board', bearer({ token_use: 'id' }))).status).toBe(401);
  });

  it('AUTHENTICATED: a valid active user reaches the route with a server actor', async () => {
    const r = await get('/api/ces/board', bearer({ sub: 'sub-nurse' }));
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.actor.user_id).toBe('usr-nurse');
    expect(body.actor.roles).toEqual(['grp-rn']);
  });

  it('AUTHENTICATED: a suspended user is denied (403)', async () => {
    const r = await get('/api/ces/board', bearer({ sub: 'sub-susp' }));
    expect(r.status).toBe(403);
  });

  it('forged x-user-* headers cannot authenticate (still 401 without a real token)', async () => {
    const r = await get('/api/ces/board', {
      'x-user-id': 'usr-admin', 'x-user-roles': 'grp-super-admin', 'x-user-mfa': 'true',
    });
    expect(r.status).toBe(401);
  });

  it('forged headers alongside a nurse token cannot elevate — server roles win', async () => {
    const r = await get('/api/ces/board', { ...bearer({ sub: 'sub-nurse' }), 'x-user-roles': 'grp-super-admin' });
    const body = await r.json();
    expect(body.actor.roles).toEqual(['grp-rn']); // not the forged super-admin
  });
});

describe('COG-2 role enforcement at mounted routes', () => {
  it('a standard user cannot call an admin route (403)', async () => {
    const r = await get('/api/audit/events', bearer({ sub: 'sub-nurse' }));
    expect(r.status).toBe(403);
  });

  it('an authorized admin can call the admin route (200)', async () => {
    const r = await get('/api/audit/events', bearer({ sub: 'sub-admin' }));
    expect(r.status).toBe(200);
  });

  it('role removal applies on the next request', async () => {
    const reg = registry();
    // Fresh app whose registry we can mutate between requests.
    const app = express();
    app.use('/api', identityMiddleware);
    app.use('/api', requireApiAuth({ deps: testDeps(reg) }));
    app.get('/api/audit/events', requireRole(ADMIN_ROLE_GROUPS), (_req, res) => res.json({ ok: true }));
    app.use(errorHandler);
    const s = app.listen(0);
    await new Promise<void>((r) => s.once('listening', r));
    const b = `http://127.0.0.1:${(s.address() as AddressInfo).port}`;
    try {
      const tok = { authorization: `Bearer ${makeToken(accessPayload({ sub: 'sub-admin' }))}` };
      expect((await fetch(`${b}/api/audit/events`, { headers: tok })).status).toBe(200);
      // Revoke the admin's super-admin role.
      const asg = reg.assignments.find((a) => a.userId === 'usr-admin')!;
      asg.revokedAt = '2026-01-01T00:00:00Z';
      expect((await fetch(`${b}/api/audit/events`, { headers: tok })).status).toBe(403);
    } finally {
      s.close();
    }
  });
});

describe('route access matrix completeness', () => {
  it('every mounted /api business router appears in the matrix', () => {
    const indexSrc = readFileSync(path.resolve(__dirname, '../index.ts'), 'utf8');
    // Router mounts only: `app.use('/api/<mount>', <router>)`. Exclude body-parser
    // middleware lines (express.json) and the bare `/api` boundary/log mounts.
    const mounted = indexSrc.split('\n')
      .filter((line) => /app\.use\('\/api\//.test(line) && !line.includes('express.json'))
      .map((line) => line.match(/app\.use\('\/api\/([^']+)'/)?.[1])
      .filter((m): m is string => !!m)
      // A router mount ends the path at the router; drop deeper body-parser sub-paths.
      .filter((m) => !m.includes('/intake/'));
    const known = new Set(ROUTE_ACCESS_MATRIX.map((e) => e.mount));
    const missing = mounted.filter((m) => !known.has(m));
    expect(missing).toEqual([]);
  });

  it('no matrix entry other than login/health is left as anonymous/PUBLIC', () => {
    const bad = ROUTE_ACCESS_MATRIX.filter((e) => e.access === 'PUBLIC');
    expect(bad).toEqual([]); // whole-router PUBLIC is not allowed; only exact publicPaths
  });
});
