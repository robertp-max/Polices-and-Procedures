/**
 * ADR-0002 Phase 3D — optimistic-concurrency helpers for registry mutations.
 *
 * The admin UI reads a registry version (ETag), sends it back with a mutation,
 * and the server rejects the write with 409 if the version moved — so two admins
 * editing the same registry can't silently clobber each other. Absent/undefined
 * version is treated as 0 (legacy data). NOTE: on the file adapter this is a
 * read-check-write guard, not a truly atomic CAS; genuine multi-instance CAS is
 * the durable-adapter release blocker (ADR §D). Callers opt in by passing an
 * expectedVersion; omitting it preserves legacy behavior.
 */
import { ApiError } from '../../errors.js';

/** Next version after a mutation. Undefined/negative → treated as 0. */
export function bumpVersion(current: number | undefined): number {
  return (typeof current === 'number' && current >= 0 ? current : 0) + 1;
}

/** Throw 409 when the caller's expected version doesn't match the live one.
 *  A missing expectedVersion means the caller opted out of the check. */
export function assertVersionMatch(expected: number | undefined, current: number | undefined): void {
  if (expected === undefined || expected === null) return;
  const cur = typeof current === 'number' ? current : 0;
  if (expected !== cur) {
    throw new ApiError('version_conflict', `Registry version conflict: expected ${expected}, current ${cur}. Reload and retry.`, 409);
  }
}
