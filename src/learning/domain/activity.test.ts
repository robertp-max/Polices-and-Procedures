import { describe, it, expect } from 'vitest';
import { evaluateHeartbeat, meetsActiveTimeMinimum, ACTIVE_TIME, type HeartbeatInput } from './activity';

const ok = (over: Partial<HeartbeatInput> = {}): HeartbeatInput => ({
  sessionId: 'sess-1',
  sequence: 2,
  lastAcceptedSequence: 1,
  claimedIncrementSec: 30,
  pageVisible: true,
  windowFocused: true,
  secondsSinceLastEvent: 30,
  serverClockSkewSec: 1,
  maxClockSkewSec: 10,
  alreadySeenIdempotencyKey: false,
  ...over,
});

describe('active-time heartbeat validation (§7.2)', () => {
  it('accepts a foreground, in-order, non-idle beat and counts the increment', () => {
    const d = evaluateHeartbeat(ok());
    expect(d.accepted).toBe(true);
    expect(d.acceptedIncrementSec).toBe(30);
  });

  it('caps the accepted increment at the max regardless of the client claim', () => {
    const d = evaluateHeartbeat(ok({ claimedIncrementSec: 100000 }));
    expect(d.acceptedIncrementSec).toBe(ACTIVE_TIME.maxAcceptedIncrementSec);
  });

  it('rejects duplicate heartbeats idempotently', () => {
    expect(evaluateHeartbeat(ok({ alreadySeenIdempotencyKey: true })).accepted).toBe(false);
  });

  it('rejects out-of-order / non-monotonic sequence', () => {
    expect(evaluateHeartbeat(ok({ sequence: 1, lastAcceptedSequence: 1 })).reasonCodes).toContain('NON_MONOTONIC_SEQUENCE');
  });

  it('does not count background-tab or unfocused time', () => {
    expect(evaluateHeartbeat(ok({ pageVisible: false })).accepted).toBe(false);
    expect(evaluateHeartbeat(ok({ windowFocused: false })).accepted).toBe(false);
  });

  it('rejects idle-exceeded and excessive clock skew', () => {
    expect(evaluateHeartbeat(ok({ secondsSinceLastEvent: 999 })).reasonCodes).toContain('IDLE_EXCEEDED');
    expect(evaluateHeartbeat(ok({ serverClockSkewSec: 999 })).reasonCodes).toContain('CLOCK_SKEW');
  });
});

describe('active-time minimum', () => {
  it('is met when no minimum is defined', () => {
    expect(meetsActiveTimeMinimum(0, undefined)).toBe(true);
  });
  it('requires the accumulated accepted time to reach the minimum (last page alone is not enough)', () => {
    expect(meetsActiveTimeMinimum(120, 600)).toBe(false);
    expect(meetsActiveTimeMinimum(600, 600)).toBe(true);
  });
});
