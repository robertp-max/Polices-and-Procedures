/**
 * Care Indeed LMS — Wave 2: activity session + active-time validation.
 *
 * Pure server-side validation of learner activity (architecture §5.4, §7.2).
 * Opening the last page never satisfies active-time; background-tab time is
 * rejected; heartbeats are capped and must be monotonic and idempotent.
 */

export const ACTIVE_TIME = {
  heartbeatIntervalSec: 30,
  maxAcceptedIncrementSec: 45, // per heartbeat
  idleThresholdSec: 120,
} as const;

export interface HeartbeatInput {
  sessionId: string;
  sequence: number; // monotonic per session
  lastAcceptedSequence: number;
  claimedIncrementSec: number;
  pageVisible: boolean;
  windowFocused: boolean;
  secondsSinceLastEvent: number;
  serverClockSkewSec: number; // |server - client|
  maxClockSkewSec: number;
  alreadySeenIdempotencyKey: boolean;
}

export interface HeartbeatDecision {
  accepted: boolean;
  acceptedIncrementSec: number;
  reasonCodes: string[];
}

/**
 * Validates a heartbeat and returns the active-time increment the server will
 * accept (0 when rejected). Never trusts the client's claimed increment beyond the
 * cap, and only counts foreground, non-idle, in-order, non-duplicate beats.
 */
export function evaluateHeartbeat(input: HeartbeatInput): HeartbeatDecision {
  const reasons: string[] = [];

  if (input.alreadySeenIdempotencyKey) {
    return { accepted: false, acceptedIncrementSec: 0, reasonCodes: ['DUPLICATE_HEARTBEAT'] };
  }
  if (input.sequence <= input.lastAcceptedSequence) {
    return { accepted: false, acceptedIncrementSec: 0, reasonCodes: ['NON_MONOTONIC_SEQUENCE'] };
  }
  if (!input.pageVisible) reasons.push('PAGE_NOT_VISIBLE');
  if (!input.windowFocused) reasons.push('WINDOW_NOT_FOCUSED');
  if (input.secondsSinceLastEvent > ACTIVE_TIME.idleThresholdSec) reasons.push('IDLE_EXCEEDED');
  if (input.serverClockSkewSec > input.maxClockSkewSec) reasons.push('CLOCK_SKEW');

  if (reasons.length > 0) {
    return { accepted: false, acceptedIncrementSec: 0, reasonCodes: reasons };
  }

  const increment = Math.max(
    0,
    Math.min(input.claimedIncrementSec, ACTIVE_TIME.maxAcceptedIncrementSec),
  );
  return { accepted: true, acceptedIncrementSec: increment, reasonCodes: [] };
}

/** Whether the accumulated accepted active time meets a published minimum. */
export function meetsActiveTimeMinimum(acceptedActiveSeconds: number, minSeconds?: number): boolean {
  if (minSeconds === undefined) return true;
  return acceptedActiveSeconds >= minSeconds;
}
