/**
 * Route-contract tests for the eCIgn identity-containment boundary
 * (ADR-0002 Phase 1). These exercise the actual Express router — not just the
 * helper — and prove hostile headers/bodies cannot influence signer identity or
 * signer authority in a non-demo runtime.
 *
 * The eCIgn store is monkeypatched so no test writes to the on-disk JSONL.
 */
import http, { type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import express, { type ErrorRequestHandler, type Request } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ecignRouter } from './ecign.js';
import { store } from '../ecign/store.js';
import { CURRENT_DISCLOSURE_VERSION } from '../ecign/disclosures.js';
import type { Actor } from '../identity/session.js';

const ENV = { ...process.env };
let currentActor: Actor | null = null;
let server: Server;
let baseUrl = '';
const storeOriginal: Record<string, unknown> = {};

// Mirrors the app error handler. The eCIgn router translates EcignError into
// ApiError('validation_error', …, status, { code: originalCode }), so the
// specific eCIgn code is carried in error.details.code with the status preserved.
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  void _next;
  const status = (err as { status?: number }).status ?? 500;
  const code = (err as { code?: string }).code ?? 'internal_error';
  const details = (err as { details?: unknown }).details;
  res.status(status).json({ error: { code, message: (err as Error).message, details } });
};

/** The specific eCIgn code (details.code), falling back to the outer code. */
function codeOf(body: unknown): string | undefined {
  const e = (body as { error?: { code?: string; details?: { code?: string } } })?.error;
  return e?.details?.code ?? e?.code;
}

beforeEach(async () => {
  currentActor = null;
  // Neutral non-demo baseline; individual tests override.
  delete process.env.ENABLE_LOCAL_DEMO_AUTH;
  process.env.NODE_ENV = 'test';
  for (const m of ['appendAudit', 'listAudit', 'getInstance', 'listSignatures', 'listConsents', 'insertSignature', 'updateInstance']) {
    storeOriginal[m] = (store as Record<string, unknown>)[m];
  }
  (store as Record<string, unknown>).appendAudit = async () => undefined;
  (store as Record<string, unknown>).listAudit = async () => [];

  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { if (currentActor) (req as Request).actor = currentActor; next(); });
  app.use('/api/ecign', ecignRouter);
  app.use(errorHandler);
  server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  process.env = { ...ENV };
  for (const [m, fn] of Object.entries(storeOriginal)) (store as Record<string, unknown>)[m] = fn;
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

const verified = (over: Partial<Actor> = {}): Actor => ({
  type: 'user', user_id: 'usr-1', display_name: 'Nora', email: 'nurse@careindeed.com',
  roles: ['grp-admin', 'grp-super-admin'], mfa_enrolled: true, identity_assurance: 1, ...over,
} as Actor);

async function call(method: string, path: string, opts: { headers?: Record<string, string>; body?: unknown } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(opts.headers ?? {}) },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let body: unknown = undefined;
  try { body = text ? JSON.parse(text) : undefined; } catch { body = text; }
  return { status: res.status, body };
}

describe('eCIgn containment — signer identity', () => {
  it('non-demo: hostile x-user-* headers cannot change the signer', async () => {
    currentActor = verified();
    const r = await call('GET', '/api/ecign/identity/me', {
      headers: { 'x-user-id': 'forged-admin', 'x-user-role': 'super_admin', 'x-user-tier': '5', 'x-user-email': 'evil@x.com' },
    });
    expect(r.status).toBe(200);
    const u = r.body as { user_id: string; role: string; tier: number; email: string };
    expect(u.user_id).toBe('usr-1');       // from verified actor, not the header
    expect(u.role).toBe('unknown');        // security group is not a signature capacity
    expect(u.tier).toBe(1);                // never the client-asserted 5
    expect(u.email).toBe('nurse@careindeed.com');
  });

  it('non-demo: missing verified actor → 401', async () => {
    currentActor = null;
    const r = await call('GET', '/api/ecign/identity/me', { headers: { 'x-user-id': 'demo-1' } });
    expect(r.status).toBe(401);
  });

  it('production ignores demo headers even when ENABLE_LOCAL_DEMO_AUTH=true → 401', async () => {
    process.env.NODE_ENV = 'production';
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'true';
    currentActor = null;
    const r = await call('GET', '/api/ecign/identity/me', { headers: { 'x-user-id': 'demo-1' } });
    expect(r.status).toBe(401);
  });

  it('explicit demo runtime: header identity is honored (isolated to non-production)', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'true';
    currentActor = null;
    const r = await call('GET', '/api/ecign/identity/me', { headers: { 'x-user-id': 'demo-1' } });
    expect(r.status).toBe(200);
    const u = r.body as { user_id: string; tier: number };
    expect(u.user_id).toBe('demo-1');
    expect(u.tier).toBe(1);                // demo also has no privileged default
  });
});

describe('eCIgn containment — signer authority is server-owned', () => {
  it('non-demo: client-supplied required_signers are refused → 503', async () => {
    currentActor = verified();
    const r = await call('POST', '/api/ecign/instances', {
      body: { form_id: 'F', document_version_id: 'v1', required_signers: [{ field_id: 'f1', role: 'Administrator', min_tier: 5 }] },
    });
    expect(r.status).toBe(503);
    expect(codeOf(r.body)).toBe('SIGNATURE_REQUIREMENTS_UNAVAILABLE');
  });

  it('non-demo: second-signature assignment is refused → 503 (before any instance lookup)', async () => {
    currentActor = verified();
    const r = await call('POST', '/api/ecign/instances/i1/second-signature', {
      body: { assigned_to: 'usr-2', assigned_user: { role: 'Administrator', tier: 5, authorityDomains: ['governance'] } },
    });
    expect(r.status).toBe(503);
    expect(codeOf(r.body)).toBe('SIGNATURE_ASSIGNMENT_UNAVAILABLE');
  });

  it('non-demo: mock step-up is unavailable → 501', async () => {
    currentActor = verified();
    const r = await call('POST', '/api/ecign/identity/step-up', { body: { method: 'otp' } });
    expect(r.status).toBe(501);
  });
});

describe('eCIgn containment — empty requirements fail closed', () => {
  it('demo: cannot lock an instance with no required signers → 409', async () => {
    // In non-demo the lock route 503s before this guard; the empty-requirement
    // fail-closed guard is exercised in the demo path.
    process.env.NODE_ENV = 'development';
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'true';
    currentActor = verified();
    (store as Record<string, unknown>).getInstance = async () => ({
      instance_id: 'i1', form_id: 'F', document_version_id: 'v1', state: 'reviewed',
      required_signers: [], field_values: {},
    });
    (store as Record<string, unknown>).listSignatures = async () => [];
    const r = await call('POST', '/api/ecign/instances/i1/lock', { body: {} });
    expect(r.status).toBe(409);
    expect(codeOf(r.body)).toBe('SIGNER_REQUIREMENTS_MISSING');
  });

  it('non-demo: signature is unavailable even with a permissive stored requirement (no insert)', async () => {
    currentActor = verified();
    const insertSpy = vi.fn();
    (store as Record<string, unknown>).insertSignature = insertSpy;
    (store as Record<string, unknown>).getInstance = async () => ({
      instance_id: 'i1', form_id: 'F', document_version_id: 'v1', state: 'reviewed',
      required_signers: [{ field_id: 'f1', role: 'unknown', min_tier: 1 }], field_values: {},
    });
    (store as Record<string, unknown>).listConsents = async () => [{ disclosure_version: CURRENT_DISCLOSURE_VERSION }];
    (store as Record<string, unknown>).listSignatures = async () => [];
    const r = await call('POST', '/api/ecign/instances/i1/signatures', {
      body: { field_id: 'f1', signature_png_b64: 'AAAA', attestation_text_hash: 'h' },
    });
    expect(r.status).toBe(503);
    expect(codeOf(r.body)).toBe('SIGNATURE_AUTHORITY_UNAVAILABLE');
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it('non-demo: lock is unavailable even with non-empty requirements + matching signatures (no state write)', async () => {
    currentActor = verified();
    const updateSpy = vi.fn();
    (store as Record<string, unknown>).updateInstance = updateSpy;
    (store as Record<string, unknown>).getInstance = async () => ({
      instance_id: 'i1', form_id: 'F', document_version_id: 'v1', state: 'attested',
      required_signers: [{ field_id: 'f1', role: 'unknown', min_tier: 1 }], field_values: {},
      document_hash: 'd', manifest_hash: 'm',
    });
    (store as Record<string, unknown>).listSignatures = async () => [{ field_id: 'f1' }];
    const r = await call('POST', '/api/ecign/instances/i1/lock', { body: {} });
    expect(r.status).toBe(503);
    expect(codeOf(r.body)).toBe('SIGNATURE_AUTHORITY_UNAVAILABLE');
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('non-demo: signed-bundle generation is unavailable → 503', async () => {
    currentActor = verified();
    const r = await call('GET', '/api/ecign/instances/i1/bundle');
    expect(r.status).toBe(503);
    expect(codeOf(r.body)).toBe('SIGNED_BUNDLE_UNAVAILABLE');
  });

  it('cannot apply a signature when no required signers are defined → 409', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'true';       // reach the guard via demo identity
    currentActor = null;
    (store as Record<string, unknown>).getInstance = async () => ({
      instance_id: 'i1', form_id: 'EN-FM-TEST', document_version_id: 'v1', state: 'reviewed',
      required_signers: [], field_values: {},
    });
    (store as Record<string, unknown>).listConsents = async () => [{ disclosure_version: CURRENT_DISCLOSURE_VERSION }];
    (store as Record<string, unknown>).listSignatures = async () => [];
    const r = await call('POST', '/api/ecign/instances/i1/signatures', {
      headers: { 'x-user-id': 'demo-1' },
      body: { field_id: 'f1', signature_png_b64: 'AAAA', attestation_text_hash: 'h' },
    });
    expect(r.status).toBe(409);
    expect(codeOf(r.body)).toBe('SIGNER_REQUIREMENTS_MISSING');
  });
});
