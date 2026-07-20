/**
 * Request-scoped authentication mode + locality proof (ADR-0002 Phase 1).
 *
 * The central requireApiAuth boundary is the SOLE decider of cognito / service /
 * local_demo. Locality must be proven from the actual connection (loopback host
 * AND loopback peer) — never from caller-supplied Origin / X-Forwarded-Host.
 * Partial Cognito configuration fails closed. Exercises the real boundary.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Request, Response } from 'express';
import { requireApiAuth, type ApiAuthBoundaryOptions } from './apiAuthBoundary.js';
import { testAuthDeps, testAuthHeaders } from './testAuthHarness.js';
import { authenticationModeForActor, requestIsLocalDemo } from './requestAuthenticationContext.js';
import { ApiError } from '../errors.js';
import type { Actor } from '../identity/session.js';

const PUBLIC_HOST = 'care-indeed-hh-v2-dev-rti5nksmma-uc.a.run.app';
const ENV_KEYS = ['ENABLE_LOCAL_DEMO_AUTH', 'NODE_ENV', 'COGNITO_USER_POOL_ID', 'COGNITO_CLIENT_ID'] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  delete process.env.COGNITO_USER_POOL_ID;
  delete process.env.COGNITO_CLIENT_ID;
  process.env.NODE_ENV = 'test';
  delete process.env.ENABLE_LOCAL_DEMO_AUTH;
});
afterEach(() => {
  for (const k of ENV_KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
});

interface ReqOpts { host: string; remoteAddress?: string; authorization?: string; headers?: Record<string, string> }
function mockReq(o: ReqOpts): Request {
  const { host, remoteAddress = '127.0.0.1', authorization, headers = {} } = o;
  return {
    method: 'GET', path: '/ecign/instances', originalUrl: '/api/ecign/instances', hostname: host,
    socket: { remoteAddress } as unknown,
    header: (name: string) => {
      const n = name.toLowerCase();
      if (n === 'host') return host;
      if (n === 'authorization') return authorization;
      return headers[n];
    },
  } as unknown as Request;
}

interface RunResult { mode?: string; actor?: Actor; error: unknown }
async function run(o: ReqOpts, options: ApiAuthBoundaryOptions = {}): Promise<RunResult> {
  const mw = requireApiAuth(options);
  const req = mockReq(o);
  return new Promise((resolve) => {
    mw(req, {} as Response, (err?: unknown) => resolve({
      mode: (req as unknown as { authenticationContext?: { mode: string } }).authenticationContext?.mode,
      actor: (req as unknown as { actor?: Actor }).actor,
      error: err,
    }));
  });
}
/** Turn on the coarse env preconditions so only the locality/config checks decide. */
function enableFlag() { process.env.NODE_ENV = 'development'; process.env.ENABLE_LOCAL_DEMO_AUTH = 'true'; }

describe('local-demo locality proof — headers cannot fake locality', () => {
  it('public Host + Origin: localhost → not local_demo', async () => {
    enableFlag();
    const r = await run({ host: PUBLIC_HOST, remoteAddress: '34.117.0.1', headers: { origin: 'http://localhost:5173' } });
    expect(r.mode).not.toBe('local_demo');
  });
  it('public Host + X-Forwarded-Host: localhost → not local_demo', async () => {
    enableFlag();
    const r = await run({ host: PUBLIC_HOST, remoteAddress: '34.117.0.1', headers: { 'x-forwarded-host': 'localhost' } });
    expect(r.mode).not.toBe('local_demo');
  });
  it('public Host + both spoofed headers → not local_demo', async () => {
    enableFlag();
    const r = await run({ host: PUBLIC_HOST, remoteAddress: '34.117.0.1', headers: { origin: 'http://localhost', 'x-forwarded-host': 'localhost' } });
    expect(r.mode).not.toBe('local_demo');
  });
  it('localhost Host + non-loopback peer → not local_demo', async () => {
    enableFlag();
    const r = await run({ host: 'localhost', remoteAddress: '10.0.0.5' });
    expect(r.mode).not.toBe('local_demo');
  });
  it('localhost Host + loopback peer + flag + non-prod + no Cognito → local_demo', async () => {
    enableFlag();
    const r = await run({ host: 'localhost', remoteAddress: '127.0.0.1' });
    expect(r.mode).toBe('local_demo');
    expect(r.actor?.user_id).toBe('demo-user-careindeed');
  });
});

describe('local-demo gate — env / config preconditions', () => {
  it('production → never local_demo', async () => {
    enableFlag(); process.env.NODE_ENV = 'production';
    expect((await run({ host: 'localhost' })).mode).not.toBe('local_demo');
  });
  it('missing flag → not local_demo', async () => {
    process.env.NODE_ENV = 'development';
    expect((await run({ host: 'localhost' })).mode).not.toBe('local_demo');
  });
  it('malformed flag → not local_demo', async () => {
    process.env.NODE_ENV = 'development'; process.env.ENABLE_LOCAL_DEMO_AUTH = 'TRUE';
    expect((await run({ host: 'localhost' })).mode).not.toBe('local_demo');
  });
  it('Cognito pool + client present → no demo', async () => {
    enableFlag(); process.env.COGNITO_USER_POOL_ID = 'p'; process.env.COGNITO_CLIENT_ID = 'c';
    expect((await run({ host: 'localhost' })).mode).not.toBe('local_demo');
  });
  it('partial Cognito (pool only) → no demo (fail closed)', async () => {
    enableFlag(); process.env.COGNITO_USER_POOL_ID = 'p';
    expect((await run({ host: 'localhost' })).mode).not.toBe('local_demo');
  });
  it('partial Cognito (client only) → no demo (fail closed)', async () => {
    enableFlag(); process.env.COGNITO_CLIENT_ID = 'c';
    expect((await run({ host: 'localhost' })).mode).not.toBe('local_demo');
  });
  it('injected auth deps → no demo', async () => {
    enableFlag();
    expect((await run({ host: 'localhost' }, { deps: testAuthDeps })).mode).not.toBe('local_demo');
  });
  it('disableLocalDemoFallback → no demo', async () => {
    enableFlag();
    expect((await run({ host: 'localhost' }, { disableLocalDemoFallback: true })).mode).not.toBe('local_demo');
  });
});

describe('verified authentication → mode', () => {
  it('verified Cognito request → mode cognito', async () => {
    const r = await run({ host: 'localhost', authorization: testAuthHeaders().authorization }, { deps: testAuthDeps });
    expect(r.mode).toBe('cognito');
    expect(r.actor?.user_id).toBeTruthy();
    expect(r.error).toBeUndefined();
  });
});

describe('authenticationModeForActor — exhaustive & fail-closed', () => {
  const a = (type: string): Actor => ({ type, user_id: 'u', roles: [], mfa_enrolled: false, identity_assurance: 1 } as unknown as Actor);
  it('user → cognito', () => expect(authenticationModeForActor(a('user'))).toBe('cognito'));
  it('service → service', () => expect(authenticationModeForActor(a('service'))).toBe('service'));
  it('system → throws 401 (never mislabeled cognito)', () => {
    try { authenticationModeForActor(a('system')); throw new Error('expected throw'); }
    catch (e) { expect(e).toBeInstanceOf(ApiError); expect((e as ApiError).status).toBe(401); }
  });
});

describe('requestIsLocalDemo (request-scoped, not env/header)', () => {
  it('true only when boundary marked local_demo', () => {
    expect(requestIsLocalDemo({ authenticationContext: { mode: 'local_demo' } })).toBe(true);
  });
  it('false for cognito / service / missing context — regardless of env', () => {
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'true'; process.env.NODE_ENV = 'development';
    expect(requestIsLocalDemo({ authenticationContext: { mode: 'cognito' } })).toBe(false);
    expect(requestIsLocalDemo({ authenticationContext: { mode: 'service' } })).toBe(false);
    expect(requestIsLocalDemo({})).toBe(false);
  });
});
