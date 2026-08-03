/// <reference types="node" />
/**
 * eCIgn Path B — retention & lifecycle tests (REQUIRED GREEN).
 * Complete=indefinite (locked only); incomplete=expire @ default 90d (configurable,
 * inactivity-based, resets on signature) → archived (inert/audit-only); incomplete
 * is never valid evidence. Pure; "now" injected. Run via tsx --test.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'vitest';

import type { ArtifactId, IsoTimestamp, RetentionPolicyId } from './ids';
import {
  DEFAULT_INCOMPLETE_EXPIRY_DAYS,
  classifyRetention,
  expiryFromActivity,
  isIncompleteExpired,
  isValidEvidence,
  recordActivity,
  validateExpiryDays,
  validateNotFalseEvidence,
  validateRetentionEligibility,
  type RetentionLifecycle,
  type RetentionPolicy,
} from './retentionLifecycle';

const aid = 'ART-1' as ArtifactId;
const policy = (over?: Partial<RetentionPolicy>): RetentionPolicy => ({
  retentionPolicyId: 'RP-1' as RetentionPolicyId,
  policySnapshotRef: 'policy-snapshot://train/v1',
  incompleteExpiryDays: DEFAULT_INCOMPLETE_EXPIRY_DAYS,
  completeRetentionIsIndefinite: true,
  archiveIsInertAuditOnly: true,
  ...over,
});

const T0 = '2026-06-22T00:00:00.000Z';

describe('Path B retention — classification & evidence validity', () => {
  it('only a locked chain is complete/retained; everything else expires', () => {
    assert.equal(classifyRetention('locked'), 'complete_retained');
    for (const s of ['draft', 'prepared_for_signature', 'signed_by_tier_1', 'final_validated_by_tier_5'] as const) {
      assert.equal(classifyRetention(s), 'incomplete_expiring');
    }
  });

  it('only a locked chain is valid evidence ("incomplete = as good as not signed")', () => {
    assert.equal(isValidEvidence('locked'), true);
    assert.equal(isValidEvidence('signed_by_tier_1'), false);
    assert.equal(isValidEvidence('final_validated_by_tier_5'), false);
  });
});

describe('Path B retention — 90-day inactivity clock (default + configurable)', () => {
  it('default expiry is 90 days from last activity', () => {
    const exp = expiryFromActivity(T0, DEFAULT_INCOMPLETE_EXPIRY_DAYS);
    assert.equal(exp, '2026-09-20T00:00:00.000Z'); // T0 + 90d
    assert.equal(DEFAULT_INCOMPLETE_EXPIRY_DAYS, 90);
  });

  it('expiry window is configurable per policy', () => {
    assert.equal(expiryFromActivity(T0, 30), '2026-07-22T00:00:00.000Z');
    assert.equal(validateExpiryDays(policy({ incompleteExpiryDays: 0 })).ok, false);
  });

  it('is expired only at/after the expiry instant (now is injected)', () => {
    const exp = expiryFromActivity(T0, 90);
    assert.equal(isIncompleteExpired(exp, '2026-09-19T00:00:00.000Z'), false);
    assert.equal(isIncompleteExpired(exp, '2026-09-20T00:00:00.000Z'), true);
  });

  it('a new signature resets the inactivity clock', () => {
    const lc: RetentionLifecycle = {
      artifactId: aid,
      retentionClass: 'incomplete_expiring',
      incompleteState: 'active',
      lastActivityAt: T0 as IsoTimestamp,
      expiresAt: expiryFromActivity(T0, 90),
    };
    const t1 = '2026-07-01T00:00:00.000Z' as IsoTimestamp;
    const reset = recordActivity(lc, t1, policy());
    assert.equal(reset.lastActivityAt, t1);
    assert.equal(reset.expiresAt, expiryFromActivity(t1, 90)); // pushed forward
  });
});

describe('Path B retention — eligibility gate', () => {
  it('locked → indefinite retention, no expiry', () => {
    const lc: RetentionLifecycle = { artifactId: aid, retentionClass: 'complete_retained', lockedAt: T0 as IsoTimestamp, retainedIndefinitely: true };
    assert.equal(validateRetentionEligibility('locked', lc, policy()).ok, true);
  });

  it('locked must not carry an expiry/incomplete state', () => {
    const lc: RetentionLifecycle = { artifactId: aid, retentionClass: 'complete_retained', retainedIndefinitely: true, expiresAt: expiryFromActivity(T0, 90) };
    assert.ok(validateRetentionEligibility('locked', lc, policy()).issues.includes('complete_must_not_expire'));
  });

  it('non-locked cannot be marked indefinitely retained', () => {
    const lc: RetentionLifecycle = { artifactId: aid, retentionClass: 'complete_retained', retainedIndefinitely: true };
    assert.ok(validateRetentionEligibility('signed_by_tier_1', lc, policy()).issues.includes('indefinite_retention_requires_lock'));
  });

  it('non-locked must carry an expiry, consistent with the clock', () => {
    const missing: RetentionLifecycle = { artifactId: aid, retentionClass: 'incomplete_expiring', incompleteState: 'active', lastActivityAt: T0 as IsoTimestamp };
    assert.ok(validateRetentionEligibility('signed_by_tier_1', missing, policy()).issues.includes('incomplete_missing_expiry'));
    const wrong: RetentionLifecycle = { artifactId: aid, retentionClass: 'incomplete_expiring', incompleteState: 'active', lastActivityAt: T0 as IsoTimestamp, expiresAt: '2099-01-01T00:00:00.000Z' as IsoTimestamp };
    assert.ok(validateRetentionEligibility('signed_by_tier_1', wrong, policy()).issues.includes('expiry_clock_mismatch'));
  });
});

describe('Path B retention — archive is not valid evidence', () => {
  it('an archived/expired incomplete chain can never be flagged valid evidence', () => {
    const archived: RetentionLifecycle = { artifactId: aid, retentionClass: 'incomplete_expiring', incompleteState: 'archived', archivedAt: T0 as IsoTimestamp };
    // by definition incomplete states are not 'locked', so isValidEvidence is false;
    // the guard catches any attempt to pair an archived lifecycle with a locked state.
    assert.equal(validateNotFalseEvidence('signed_by_tier_1', archived).ok, true);
    assert.ok(validateNotFalseEvidence('locked', archived).issues.includes('archived_as_valid_evidence'));
  });
});
