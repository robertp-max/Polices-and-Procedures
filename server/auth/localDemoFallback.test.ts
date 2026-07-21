/**
 * P0-a — the localhost demo actor must be EXPLICITLY opted in.
 *
 * Exercises the real requireApiAuth middleware. The demo actor may attach only
 * when ENABLE_LOCAL_DEMO_AUTH==="true" AND NODE_ENV!=="production" AND the host
 * is localhost AND Cognito is unconfigured AND no auth deps are injected.
 * Every other combination must deny (no demo actor; the request is rejected).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Request, Response } from 'express';
import { requireApiAuth, type ApiAuthBoundaryOptions } from './apiAuthBoundary.js';
import { testAuthDeps } from './testAuthHarness.js';
import type { Actor } from '../identity/session.js';

const ENV_KEYS = ['ENABLE_LOCAL_DEMO_AUTH', 'NODE_ENV', 'COGNITO_USER_POOL_ID', 'COGNITO_CLIENT_ID'] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  // Baseline: Cognito unconfigured, non-production, flag unset.
  delete process.env.COGNITO_USER_POOL_ID;
  delete process.env.COGNITO_CLIENT_ID;
  process.env.NODE_ENV = 'test';
  delete process.env.ENABLE_LOCAL_DEMO_AUTH;
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

function mockReq(host: string, remoteAddress = '127.0.0.1'): Request {
  return {
    method: 'GET',
    path: '/packets',
    originalUrl: '/api/packets',
    hostname: host,
    socket: { remoteAddress } as unknown,
    header: (name: string) => (name.toLowerCase() === 'host' ? host : undefined),
  } as unknown as Request;
}

interface RunResult { actor?: Actor; error: unknown }

async function run(host: string, options: ApiAuthBoundaryOptions = {}): Promise<RunResult> {
  const mw = requireApiAuth(options);
  const req = mockReq(host);
  return new Promise((resolve) => {
    mw(req, {} as Response, (err?: unknown) => resolve({ actor: (req as unknown as { actor?: Actor }).actor, error: err }));
  });
}

const isDemo = (r: RunResult) => r.actor?.user_id === 'demo-user-careindeed' && r.error === undefined;

describe('local demo actor — explicit opt-in only', () => {
  it('flag absent → denied', async () => {
    const r = await run('localhost');
    expect(isDemo(r)).toBe(false);
    expect(r.error).toBeTruthy();
  });

  it('flag false → denied', async () => {
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'false';
    expect(isDemo(await run('localhost'))).toBe(false);
  });

  it.each(['1', 'yes', 'TRUE', 'true ', 'enabled'])('flag malformed (%s) → denied', async (val) => {
    process.env.ENABLE_LOCAL_DEMO_AUTH = val;
    expect(isDemo(await run('localhost'))).toBe(false);
  });

  it('flag true + localhost + no cognito + non-prod → permitted', async () => {
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'true';
    const r = await run('localhost');
    expect(isDemo(r)).toBe(true);
    expect(r.actor?.roles).toContain('grp-super-admin');
  });

  it.each(['127.0.0.1', '::1'])('flag true + loopback host %s → permitted', async (host) => {
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'true';
    expect(isDemo(await run(host))).toBe(true);
  });

  it('flag true + production → denied', async () => {
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'true';
    process.env.NODE_ENV = 'production';
    expect(isDemo(await run('localhost'))).toBe(false);
  });

  it('flag true + remote host → denied', async () => {
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'true';
    expect(isDemo(await run('app.careindeed.com'))).toBe(false);
  });

  it('flag true + Cognito configured → denied (real auth only)', async () => {
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'true';
    process.env.COGNITO_USER_POOL_ID = 'us-west-1_REAL';
    process.env.COGNITO_CLIENT_ID = 'real-client';
    const r = await run('localhost');
    expect(isDemo(r)).toBe(false);
    expect(r.error).toBeTruthy(); // no bearer → real boundary denies
  });

  it('flag true + injected auth deps → denied (deps take over)', async () => {
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'true';
    const r = await run('localhost', { deps: testAuthDeps });
    expect(isDemo(r)).toBe(false);
    expect(r.error).toBeTruthy(); // no bearer → deps-based verification denies
  });

  it('disableLocalDemoFallback option → denied even when otherwise eligible', async () => {
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'true';
    expect(isDemo(await run('localhost', { disableLocalDemoFallback: true }))).toBe(false);
  });
});
