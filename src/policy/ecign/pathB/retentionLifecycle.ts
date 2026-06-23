/**
 * eCIgn Path B — retention & lifecycle contract (approved rule, 2026-06-22).
 *
 * - COMPLETE signatures (chain reached `locked`) are retained indefinitely (per policy).
 * - INCOMPLETE signatures are "as good as not signed": NOT valid evidence; they
 *   EXPIRE after an inactivity window (default 90 days, approved & configurable),
 *   then are ARCHIVED (inert / audit-only; disposition deferred to policy).
 * - The append-only AUDIT of partial signatures is retained even after archive.
 *
 * Pure contracts + side-effect-free helpers/validators only (no I/O, no Date.now;
 * "now" is always passed in so functions stay deterministic/testable).
 */
import type { ArtifactId, IsoTimestamp, RetentionPolicyId } from './ids';
import type { ArtifactState } from './stateMachine';

/** Approved default inactivity window for incomplete chains. Policy may override. */
export const DEFAULT_INCOMPLETE_EXPIRY_DAYS = 90;
const MS_PER_DAY = 86_400_000;

export type RetentionClass = 'complete_retained' | 'incomplete_expiring';
export type IncompleteLifecycleState = 'active' | 'expired' | 'archived';

export interface RetentionPolicy {
  readonly retentionPolicyId: RetentionPolicyId;
  readonly policySnapshotRef: string;
  /** Inactivity days before an incomplete chain expires (default 90, approved). */
  readonly incompleteExpiryDays: number;
  /** Complete (locked) artifacts retained indefinitely per policy. */
  readonly completeRetentionIsIndefinite: boolean;
  /** Archive is inert/audit-only; no auto-disposition without an approved workflow. */
  readonly archiveIsInertAuditOnly: boolean;
}

export interface RetentionLifecycle {
  readonly artifactId: ArtifactId;
  readonly retentionClass: RetentionClass;
  // complete (locked):
  readonly lockedAt?: IsoTimestamp;
  readonly retainedIndefinitely?: boolean;
  // incomplete:
  readonly incompleteState?: IncompleteLifecycleState;
  /** Clock anchor — resets on each valid signature (inactivity-based). */
  readonly lastActivityAt?: IsoTimestamp;
  readonly expiresAt?: IsoTimestamp;
  readonly archivedAt?: IsoTimestamp;
}

export type RetentionIssueCode =
  | 'not_an_object'
  | 'indefinite_retention_requires_lock'
  | 'incomplete_missing_expiry'
  | 'complete_must_not_expire'
  | 'expiry_clock_mismatch'
  | 'archived_as_valid_evidence'
  | 'invalid_expiry_days';

export interface RetentionValidation {
  readonly ok: boolean;
  readonly issues: readonly RetentionIssueCode[];
}
function toResult(issues: RetentionIssueCode[]): RetentionValidation {
  return issues.length === 0 ? { ok: true, issues: [] } : { ok: false, issues };
}

/** Only a fully `locked` chain is complete → retained; everything else expires. */
export function classifyRetention(state: ArtifactState): RetentionClass {
  return state === 'locked' ? 'complete_retained' : 'incomplete_expiring';
}

/** ONLY a complete (locked) artifact is valid evidence. Incomplete = "not signed". */
export function isValidEvidence(state: ArtifactState): boolean {
  return state === 'locked';
}

/** Expiry instant = last activity + N days (inactivity-based). Pure. */
export function expiryFromActivity(lastActivityAt: string, incompleteExpiryDays: number): IsoTimestamp {
  const anchor = Date.parse(lastActivityAt);
  return new Date(anchor + incompleteExpiryDays * MS_PER_DAY).toISOString() as IsoTimestamp;
}

/** Is an incomplete chain past its expiry as of `nowIso`? Pure (now is injected). */
export function isIncompleteExpired(expiresAt: string, nowIso: string): boolean {
  return Date.parse(nowIso) >= Date.parse(expiresAt);
}

/** Record a new valid signature — resets the inactivity clock (recomputes expiry). */
export function recordActivity(
  lifecycle: RetentionLifecycle,
  atIso: IsoTimestamp,
  policy: RetentionPolicy,
): RetentionLifecycle {
  if (lifecycle.retentionClass !== 'incomplete_expiring') return lifecycle;
  return {
    ...lifecycle,
    lastActivityAt: atIso,
    expiresAt: expiryFromActivity(atIso, policy.incompleteExpiryDays),
    incompleteState: 'active',
  };
}

export function validateExpiryDays(policy: RetentionPolicy): RetentionValidation {
  return Number.isFinite(policy.incompleteExpiryDays) && policy.incompleteExpiryDays > 0
    ? { ok: true, issues: [] }
    : { ok: false, issues: ['invalid_expiry_days'] };
}

/**
 * Eligibility gate: `locked` → indefinite retention, no expiry; non-`locked` →
 * must carry an expiry and must NOT be marked indefinitely retained; an
 * archived/expired incomplete chain must never be flagged valid evidence.
 */
export function validateRetentionEligibility(
  state: ArtifactState,
  lifecycle: RetentionLifecycle,
  policy: RetentionPolicy,
): RetentionValidation {
  const issues: RetentionIssueCode[] = [];
  const expiryDays = validateExpiryDays(policy);
  if (!expiryDays.ok) issues.push('invalid_expiry_days');

  if (state === 'locked') {
    if (lifecycle.retentionClass !== 'complete_retained' || lifecycle.retainedIndefinitely !== true) {
      issues.push('indefinite_retention_requires_lock');
    }
    if (lifecycle.expiresAt !== undefined || lifecycle.incompleteState !== undefined) {
      issues.push('complete_must_not_expire');
    }
  } else {
    if (lifecycle.retainedIndefinitely === true || lifecycle.retentionClass === 'complete_retained') {
      issues.push('indefinite_retention_requires_lock');
    }
    if (lifecycle.expiresAt === undefined) issues.push('incomplete_missing_expiry');
    else if (
      lifecycle.lastActivityAt !== undefined &&
      expiryDays.ok &&
      lifecycle.expiresAt !== expiryFromActivity(lifecycle.lastActivityAt, policy.incompleteExpiryDays)
    ) {
      issues.push('expiry_clock_mismatch');
    }
  }
  return toResult(issues);
}

/** Archived/expired incomplete artifacts must not be treated as valid evidence. */
export function validateNotFalseEvidence(
  state: ArtifactState,
  lifecycle: RetentionLifecycle,
): RetentionValidation {
  const archivedOrExpired =
    lifecycle.incompleteState === 'archived' || lifecycle.incompleteState === 'expired';
  if (archivedOrExpired && isValidEvidence(state)) {
    return { ok: false, issues: ['archived_as_valid_evidence'] };
  }
  return { ok: true, issues: [] };
}
