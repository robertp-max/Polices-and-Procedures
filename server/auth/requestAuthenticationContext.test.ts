/**
 * Request-scoped authentication mode (ADR-0002 Phase 1).
 *
 * The central requireApiAuth boundary is the SOLE decider of whether a request
 * is cognito / service / local_demo. Environment variables alone never make a
 * request demo — the boundary's full host / Cognito-config / injected-deps
 * checks still apply. Exercises the real boundary middleware.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Request, Response } from 'express';
import { requireApiAuth, type ApiAuthBoundaryOptions } from './apiAuthBoundary.js';
import { testAuthDeps, testAuthHeaders } from './testAuthHarness.js';
import type { Actor } from '../identity/session.js';

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

function mockReq(host: string, authorization?: string): Request {
  return {
    method: 'GET', path: '/ecign/instances', originalUrl: '/api/ecign/instances', hostname: host,
    header: (name: string) => {
      const n = name.toLowerCase();
      if (n === 'host') return host;
      if (n === 'authorization') return authorization;
      return undefined;
    },
  } as unknown as Request;
}

interface RunResult { mode?: string; actor?: Actor; error: unknown }
async function run(host: string, options: ApiAuthBoundaryOptions = {}, authorization?: string): Promise<RunResult> {
  const mw = requireApiAuth(options);
  const req = mockReq(host, authorization);
  return new Promise((resolve) => {
    mw(req, {} as Response, (err?: unknown) => resolve({
      mode: (req as unknown as { authenticationContext?: { mode: string } }).authenticationContext?.mode,
      actor: (req as unknown as { actor?: Actor }).actor,
      error: err,
    }));
  });
}

describe('requireApiAuth — request authentication mode', () => {
  it('production + demo flag → not local_demo', async () => {
    process.env.NODE_ENV = 'production'; process.env.ENABLE_LOCAL_DEMO_AUTH = 'true';
    const r = await run('localhost');
    expect(r.mode).not.toBe('local_demo');
    expect(r.error).toBeTruthy();
  });

  it('development + demo flag + Cognito configured → not local_demo', async () => {
    process.env.NODE_ENV = 'development'; process.env.ENABLE_LOCAL_DEMO_AUTH = 'true';
    process.env.COGNITO_USER_POOL_ID = 'us-west-1_REAL'; process.env.COGNITO_CLIENT_ID = 'real';
    const r = await run('localhost');
    expect(r.mode).not.toBe('local_demo');
    expect(r.error).toBeTruthy(); // no bearer → real verification denies
  });

  it('development + demo flag + public/non-local host → not local_demo', async () => {
    process.env.NODE_ENV = 'development'; process.env.ENABLE_LOCAL_DEMO_AUTH = 'true';
    const r = await run('app.careindeed.com');
    expect(r.mode).not.toBe('local_demo');
  });

  it('development + demo flag + localhost + Cognito absent → local_demo', async () => {
    process.env.NODE_ENV = 'development'; process.env.ENABLE_LOCAL_DEMO_AUTH = 'true';
    const r = await run('localhost');
    expect(r.mode).toBe('local_demo');
    expect(r.actor?.user_id).toBe('demo-user-careindeed');
    expect(r.error).toBeUndefined();
  });

  it('missing demo flag → not local_demo', async () => {
    const r = await run('localhost');
    expect(r.mode).not.toBe('local_demo');
  });

  it('malformed demo flag → not local_demo', async () => {
    process.env.NODE_ENV = 'development'; process.env.ENABLE_LOCAL_DEMO_AUTH = 'TRUE';
    const r = await run('localhost');
    expect(r.mode).not.toBe('local_demo');
  });

  it('verified Cognito request → mode cognito', async () => {
    const r = await run('localhost', { deps: testAuthDeps }, testAuthHeaders().authorization);
    expect(r.mode).toBe('cognito');
    expect(r.actor?.user_id).toBeTruthy();
    expect(r.error).toBeUndefined();
  });
});
