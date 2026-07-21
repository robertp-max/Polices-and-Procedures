/**
 * Regression guard for the Cloud Run entry's authentication wiring.
 *
 * The live Brad-401 / Nolan-404 incident traced to server/cloudrun.ts mounting
 * the assistant routers WITHOUT the canonical requireApiAuth() boundary (unlike
 * server/index.ts). This test pins the security order and fail-closed posture at
 * the source level so the divergence cannot silently return.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const SRC = readFileSync(path.resolve(__dirname, 'cloudrun.ts'), 'utf8');

const idx = (needle: string) => SRC.indexOf(needle);

describe('cloudrun.ts authentication wiring', () => {
  it('imports and mounts the canonical requireApiAuth boundary', () => {
    expect(SRC).toContain("from './auth/apiAuthBoundary.js'");
    expect(SRC).toContain("app.use('/api', requireApiAuth())");
  });

  it('mounts the boundary AFTER /api/auth and BEFORE Brad and Nolan', () => {
    const auth = idx("app.use('/api/auth'");
    const boundary = idx("app.use('/api', requireApiAuth())");
    const brad = idx("app.use('/api/brad'");
    const nolan = idx("app.use('/api/nolan'");
    expect(auth).toBeGreaterThanOrEqual(0);
    expect(boundary).toBeGreaterThan(auth);
    expect(brad).toBeGreaterThan(boundary);
    expect(nolan).toBeGreaterThan(boundary);
  });

  it('exposes a readiness endpoint and fails closed when a required mount fails', () => {
    expect(SRC).toContain("'/api/_readiness'");
    expect(SRC).toContain('process.exit(1)');
    expect(SRC).toContain('required_mounts_failed');
  });

  it('still returns JSON 404 for unknown /api routes (never SPA HTML)', () => {
    // The catch-all JSON 404 must sit before the SPA history fallback.
    const json404 = idx("code: 'not_found'");
    const spaFallback = idx('res.sendFile(INDEX)');
    expect(json404).toBeGreaterThanOrEqual(0);
    expect(spaFallback).toBeGreaterThan(json404);
  });
});
