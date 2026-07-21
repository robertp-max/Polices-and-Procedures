/**
 * Phase 7 — direct-setup environment gate. Disabled by default; only the exact
 * value `dev_allowlist` enables it; everything else fails closed.
 */
import { describe, it, expect } from 'vitest';
import { resolveDirectSetupMode, isDirectSetupEnabled, assertDirectSetupEnabled } from './directSetupGate.js';
import { ApiError } from '../errors.js';

const env = (v?: string) => ({ ...(v === undefined ? {} : { DIRECT_SETUP_MODE: v }) } as NodeJS.ProcessEnv);

describe('directSetupGate', () => {
  it('missing configuration → disabled', () => {
    expect(resolveDirectSetupMode(env())).toBe('disabled');
    expect(isDirectSetupEnabled(env())).toBe(false);
  });
  it('explicit disabled → disabled', () => {
    expect(isDirectSetupEnabled(env('disabled'))).toBe(false);
  });
  it('approved dev mode → enabled (case/space tolerant)', () => {
    expect(isDirectSetupEnabled(env('dev_allowlist'))).toBe(true);
    expect(isDirectSetupEnabled(env('  DEV_ALLOWLIST '))).toBe(true);
  });
  it('invalid/production-like values → disabled (fail closed)', () => {
    for (const v of ['enabled', 'true', 'production', 'prod', 'dev', 'allow', 'yes', '1', 'dev-allowlist']) {
      expect(isDirectSetupEnabled(env(v))).toBe(false);
    }
  });
  it('assert throws a safe 404 when disabled', () => {
    try { assertDirectSetupEnabled(env()); throw new Error('expected throw'); }
    catch (e) { expect(e).toBeInstanceOf(ApiError); expect((e as ApiError).status).toBe(404); }
  });
  it('assert does not throw when enabled', () => {
    expect(() => assertDirectSetupEnabled(env('dev_allowlist'))).not.toThrow();
  });
});
