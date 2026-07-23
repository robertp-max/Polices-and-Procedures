import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  academyAnswerSchema,
  academyHeartbeatSchema,
  academySubmitSchema,
  castVoteSchema,
  createMeetingSchema,
  recordDeliverySchema,
} from './schemas.js';
import { evaluateSourceGate, q2SyntheticUatMetadata, validateSourceMetadata } from './sourcePosture.js';
import { TEST_LIVE_SOURCE, TEST_NOW, TEST_ORGANIZATION_ID } from './testFixtures.js';

describe('Source authority posture', () => {
  it('allows a complete, current, approved live source through certification', () => {
    expect(validateSourceMetadata(TEST_LIVE_SOURCE)).toEqual([]);
    expect(evaluateSourceGate([TEST_LIVE_SOURCE], 'certification')).toMatchObject({
      posture: 'live_verified', impact: 'informational', blocked: false,
    });
  });

  it('keeps the supplied Q2 draft/synthetic packet blocked from approval, execution, and certification', () => {
    const source = q2SyntheticUatMetadata({
      id: 'source-q2-synthetic',
      organizationId: TEST_ORGANIZATION_ID,
      actorId: 'review-fixture',
      now: TEST_NOW,
      contentSha256: createHash('sha256').update('q2-pdf').digest('hex'),
    });
    expect(source.posture).toBe('synthetic_uat');
    expect(source.holdReason).toMatch(/NOT LOCKABLE/i);
    for (const gate of ['approval', 'execution', 'certification'] as const) {
      expect(evaluateSourceGate([source], gate).blocked).toBe(true);
    }
  });

  it('fails closed when source authority metadata is absent', () => {
    expect(evaluateSourceGate([], 'review')).toMatchObject({
      posture: 'unavailable', impact: 'certification_blocked', blocked: true,
    });
  });
});

describe('Strict governance request schemas', () => {
  it('rejects client-supplied Academy score, pass, critical-error, and active-time fields', () => {
    const attemptedCheats = [
      { schemaVersion: 2, attemptId: 'attempt-123', expectedVersion: 1, score: 100 },
      { schemaVersion: 2, attemptId: 'attempt-123', expectedVersion: 1, passed: true },
      { schemaVersion: 2, attemptId: 'attempt-123', expectedVersion: 1, criticalError: false },
      { schemaVersion: 2, attemptId: 'attempt-123', expectedVersion: 1, activeSeconds: 99_999 },
    ];
    for (const value of attemptedCheats) expect(academySubmitSchema.safeParse(value).success).toBe(false);
    expect(academyHeartbeatSchema.safeParse({
      schemaVersion: 2, attemptId: 'attempt-123', expectedVersion: 1,
      occurredAt: TEST_NOW, visible: true, focused: true, recentActivity: true, activeSeconds: 3_600,
    }).success).toBe(false);
    expect(academyAnswerSchema.safeParse({
      schemaVersion: 2, attemptId: 'attempt-123', expectedVersion: 1,
      stageId: 'orientation', questionId: 'question-123', answerId: 'answer-123', occurredAt: TEST_NOW,
      correct: true,
    }).success).toBe(false);
  });

  it('rejects unbounded text, unsupported timezones, and extra mutation fields', () => {
    expect(createMeetingSchema.safeParse({
      schemaVersion: 2, meetingType: 'regular', title: 'x'.repeat(241),
      authorityProfileVersionId: 'profile-123', scheduledStart: TEST_NOW, timezone: 'US/Pacific',
    }).success).toBe(false);
    expect(castVoteSchema.safeParse({
      schemaVersion: 2, motionId: 'motion-123', expectedMotionVersion: 1, value: 'approve', outcome: 'approved',
    }).success).toBe(false);
  });

  it('does not permit arbitrary record types or delivery actions', () => {
    expect(recordDeliverySchema.safeParse({ recordType: 'identity', recordId: 'record-123', delivery: 'view' }).success).toBe(false);
    expect(recordDeliverySchema.safeParse({ recordType: 'meeting', recordId: 'record-123', delivery: 'delete' }).success).toBe(false);
  });
});
