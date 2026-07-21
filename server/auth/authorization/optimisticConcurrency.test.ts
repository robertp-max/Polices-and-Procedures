/**
 * ADR-0002 Phase 3D — optimistic-concurrency helper tests.
 */
import { describe, expect, it } from 'vitest';
import { assertVersionMatch, bumpVersion } from './optimisticConcurrency.ts';

describe('bumpVersion', () => {
  it('starts undefined/legacy at 1', () => {
    expect(bumpVersion(undefined)).toBe(1);
    expect(bumpVersion(0)).toBe(1);
  });
  it('increments a real version', () => {
    expect(bumpVersion(4)).toBe(5);
  });
  it('treats negative/garbage as 0', () => {
    expect(bumpVersion(-3)).toBe(1);
  });
});

describe('assertVersionMatch', () => {
  it('passes when versions match (treating undefined current as 0)', () => {
    expect(() => assertVersionMatch(3, 3)).not.toThrow();
    expect(() => assertVersionMatch(0, undefined)).not.toThrow();
  });
  it('throws 409 on mismatch', () => {
    let status: number | undefined;
    try { assertVersionMatch(2, 5); } catch (e) { status = (e as { status?: number }).status; }
    expect(status).toBe(409);
  });
  it('opts out when expected is undefined (legacy callers)', () => {
    expect(() => assertVersionMatch(undefined, 99)).not.toThrow();
  });
});
