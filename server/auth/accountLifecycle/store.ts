/**
 * Durable account-lifecycle store — interface, capabilities, idempotency /
 * fingerprint helpers, safe-initialization helper, and the store factory
 * (ADR-0002 Phase 2B).
 *
 * The store is the durable mutation boundary Phase 2C will use to perform
 * suspension/reactivation safely: per-user lifecycle + operation-journal records
 * with versioned compare-and-set, idempotency claims, and one active operation
 * per target. It NEVER writes the whole AppIdentityRegistry blob, never keys
 * identity by email, and never falls back to file-local / JSONL for mutation.
 */
import { createHash } from 'node:crypto';
import { ApiError } from '../../errors.js';
import type {
  AccountLifecycleRecord,
  AccountLifecycleStatus,
  LifecycleAction,
  LifecycleInitializationSource,
  LifecycleOperationRecord,
  LifecycleOperationStatus,
  LifecycleStep,
} from './types.js';
import type { LegacyLifecycleAssessment } from './types.js';

/* ── capabilities ─────────────────────────────────────────────────────────── */

export interface AccountLifecycleStoreCapabilities {
  provider: 'dynamodb_registration' | 'unavailable' | 'in_memory_test';
  multiInstanceShared: boolean;
  compareAndSet: boolean;
  transactionalWrite: boolean;
  durableMutationIntent: boolean;
  idempotentMutations: boolean;
  oneActiveOperationPerTarget: boolean;
  readAfterWriteConsistent: boolean;
  productionEligible: boolean;
}

export const DYNAMO_LIFECYCLE_CAPS: AccountLifecycleStoreCapabilities = {
  provider: 'dynamodb_registration',
  multiInstanceShared: true, compareAndSet: true, transactionalWrite: true,
  durableMutationIntent: true, idempotentMutations: true, oneActiveOperationPerTarget: true,
  readAfterWriteConsistent: true, productionEligible: true,
};

export const UNAVAILABLE_LIFECYCLE_CAPS: AccountLifecycleStoreCapabilities = {
  provider: 'unavailable',
  multiInstanceShared: false, compareAndSet: false, transactionalWrite: false,
  durableMutationIntent: false, idempotentMutations: false, oneActiveOperationPerTarget: false,
  readAfterWriteConsistent: false, productionEligible: false,
};

export const IN_MEMORY_LIFECYCLE_CAPS: AccountLifecycleStoreCapabilities = {
  provider: 'in_memory_test',
  multiInstanceShared: false, compareAndSet: true, transactionalWrite: true,
  durableMutationIntent: true, idempotentMutations: true, oneActiveOperationPerTarget: true,
  readAfterWriteConsistent: true, productionEligible: false, // test-only; never production
};

/* ── typed errors ─────────────────────────────────────────────────────────── */

export function lifecycleError(code: string, message: string, status: number): ApiError {
  return new ApiError(code, message, status);
}
export const ERR = {
  mutationUnavailable: () => lifecycleError('ACCOUNT_LIFECYCLE_MUTATION_UNAVAILABLE', 'Durable account-lifecycle mutation is not available in this runtime.', 503),
  lifecycleNotFound: () => lifecycleError('ACCOUNT_LIFECYCLE_NOT_FOUND', 'Account lifecycle record not found.', 404),
  operationNotFound: () => lifecycleError('LIFECYCLE_OPERATION_NOT_FOUND', 'Lifecycle operation not found.', 404),
  versionConflict: () => lifecycleError('ACCOUNT_LIFECYCLE_VERSION_CONFLICT', 'Account lifecycle version/state conflict.', 409),
  operationInProgress: () => lifecycleError('ACCOUNT_LIFECYCLE_OPERATION_IN_PROGRESS', 'An account lifecycle operation is already in progress.', 409),
  operationVersionConflict: () => lifecycleError('LIFECYCLE_OPERATION_VERSION_CONFLICT', 'Lifecycle operation version conflict.', 409),
  idempotencyConflict: () => lifecycleError('IDEMPOTENCY_KEY_CONFLICT', 'Idempotency key reused with a different request.', 409),
  alreadyExists: () => lifecycleError('ACCOUNT_LIFECYCLE_ALREADY_EXISTS', 'Account lifecycle record already exists.', 409),
  invalidTransition: (m: string) => lifecycleError('validation_error', m, 400),
  recordInvalid: () => lifecycleError('ACCOUNT_LIFECYCLE_RECORD_INVALID', 'Persisted account lifecycle record is malformed.', 503),
  operationRecordInvalid: () => lifecycleError('LIFECYCLE_OPERATION_RECORD_INVALID', 'Persisted lifecycle operation record is malformed.', 503),
  contended: () => lifecycleError('ACCOUNT_LIFECYCLE_CONTENDED', 'Account lifecycle transaction contended; retry.', 409),
  throttled: () => lifecycleError('ACCOUNT_LIFECYCLE_STORE_UNAVAILABLE', 'Account lifecycle store is throttled/unavailable; retry.', 503),
  storeError: () => lifecycleError('ACCOUNT_LIFECYCLE_STORE_ERROR', 'Account lifecycle store failure.', 500),
};

/* ── idempotency + request fingerprint ────────────────────────────────────── */

const IDEMPOTENCY_MAX = 200;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = new RegExp('[\\u0000-\\u001f\\u007f]');

/** Validate an opaque client idempotency key. Never logged verbatim. */
export function validateIdempotencyKey(key: string | undefined | null): string {
  if (typeof key !== 'string' || key.length === 0) throw lifecycleError('validation_error', 'idempotencyKey is required.', 400);
  if (key.length > IDEMPOTENCY_MAX) throw lifecycleError('validation_error', 'idempotencyKey is too long.', 400);
  if (CONTROL_CHARS.test(key)) throw lifecycleError('validation_error', 'idempotencyKey contains control characters.', 400);
  return key;
}

function sha256hex(s: string): string { return createHash('sha256').update(s, 'utf8').digest('hex'); }

/** Deterministic hash for storing an idempotency claim (raw key never stored). */
export function hashIdempotencyKey(key: string): string { return sha256hex(`ci.lifecycle.idem.v1:${key}`); }

/** Validate + normalize an admin-supplied reason (confidential; bounded). */
export function validateReason(reason: string | undefined | null): string {
  const trimmed = String(reason ?? '').trim();
  if (!trimmed) throw lifecycleError('validation_error', 'reason is required.', 400);
  if (trimmed.length > 1000) throw lifecycleError('validation_error', 'reason is too long.', 400);
  if (CONTROL_CHARS.test(trimmed.replace(/[\r\n\t]/g, ''))) throw lifecycleError('validation_error', 'reason contains control characters.', 400);
  return trimmed;
}

export interface FingerprintIntent {
  action: LifecycleAction;
  targetUserId: string;
  actorUserId: string;
  reason: string;
  expectedFromStatus: AccountLifecycleStatus;
  transitionalStatus: AccountLifecycleStatus;
}
/**
 * Immutable request fingerprint over the intent inputs — detects
 * same-idempotency-key/different-request. Excludes actorEmailSnapshot,
 * timestamp, correlationId, operationId, provider email, and AWS metadata.
 */
export function computeRequestFingerprint(intent: FingerprintIntent): string {
  const reasonNorm = intent.reason.trim().replace(/\s+/g, ' ').toLowerCase();
  const canonical = JSON.stringify([
    'v1', intent.action, intent.targetUserId, intent.actorUserId,
    reasonNorm, intent.expectedFromStatus, intent.transitionalStatus,
  ]);
  return sha256hex(`ci.lifecycle.fp.v1:${canonical}`);
}

/* ── transition validation ────────────────────────────────────────────────── */

/** Allowed (from → transitional → final) triples per action. */
export function validateTransitionRequest(input: {
  action: LifecycleAction;
  expectedFromStatus: AccountLifecycleStatus;
  transitionalStatus: AccountLifecycleStatus;
  desiredFinalStatus: AccountLifecycleStatus;
}): void {
  const { action, expectedFromStatus: from, transitionalStatus: mid, desiredFinalStatus: fin } = input;
  if (action === 'suspend') {
    if (from === 'active' && mid === 'suspending' && fin === 'suspended') return;
  } else if (action === 'reactivate') {
    if ((from === 'suspended' || from === 'reconciliation_required') && mid === 'reactivating' && fin === 'active') return;
  }
  throw ERR.invalidTransition(`Unsupported lifecycle transition: ${action} ${from}→${mid}→${fin}.`);
}

/* ── store-owned step vocabulary ──────────────────────────────────────────── */

// The COMPLETE set of steps required to finish each action, in order. The store
// — not the caller — owns these; completion is refused unless all are present.
export const SUSPEND_REQUIRED_STEPS: readonly LifecycleStep[] = [
  'intent_recorded', 'global_deny_committed', 'canonical_transition_projected',
  'provider_disabled', 'provider_sessions_revoked', 'registration_projected',
  'canonical_final_projected', 'transition_ready_audited', 'final_state_committed',
];
export const REACTIVATE_REQUIRED_STEPS: readonly LifecycleStep[] = [
  'intent_recorded', 'global_deny_committed', 'canonical_transition_projected',
  'provider_enabled', 'registration_projected', 'canonical_final_projected',
  'transition_ready_audited', 'final_state_committed',
];
export function requiredStepsForAction(action: LifecycleAction): readonly LifecycleStep[] {
  return action === 'suspend' ? SUSPEND_REQUIRED_STEPS : REACTIVATE_REQUIRED_STEPS;
}

// Steps `advanceOperation` may append: the required set MINUS the store-committed
// boundary steps (intent/global-deny are set by begin; final_state_committed only
// by completeTransition).
const NON_ADVANCEABLE: ReadonlySet<LifecycleStep> = new Set<LifecycleStep>([
  'intent_recorded', 'global_deny_committed', 'final_state_committed',
]);
export function assertAdvanceableStep(action: LifecycleAction, step: LifecycleStep): void {
  if (NON_ADVANCEABLE.has(step)) throw ERR.invalidTransition(`Step '${step}' cannot be advanced manually.`);
  if (!requiredStepsForAction(action).includes(step)) throw ERR.invalidTransition(`Step '${step}' does not belong to action '${action}'.`);
}

/* ── identifier + record validation (fail-closed) ─────────────────────────── */

const ID_MAX = 256;
/** Validate a required key-bearing identifier: nonempty, bounded, no control chars. */
export function validateIdentifier(name: string, value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) throw lifecycleError('validation_error', `${name} is required.`, 400);
  if (value.length > ID_MAX) throw lifecycleError('validation_error', `${name} is too long.`, 400);
  if (CONTROL_CHARS.test(value)) throw lifecycleError('validation_error', `${name} contains control characters.`, 400);
  return value;
}

const LIFECYCLE_STATUSES: ReadonlySet<string> = new Set<AccountLifecycleStatus>([
  'pending', 'activating', 'active', 'suspending', 'suspended', 'reactivating', 'disabled', 'reconciliation_required',
]);
const OP_STATUSES: ReadonlySet<string> = new Set<LifecycleOperationStatus>([
  'intent_recorded', 'running', 'reconciliation_required', 'completed',
]);
const ALL_STEPS: ReadonlySet<string> = new Set<LifecycleStep>([
  'intent_recorded', 'global_deny_committed', 'canonical_transition_projected', 'provider_disabled',
  'provider_sessions_revoked', 'provider_enabled', 'registration_projected', 'canonical_final_projected',
  'transition_ready_audited', 'final_state_committed',
]);
const INIT_SOURCES: ReadonlySet<string> = new Set<LifecycleInitializationSource>([
  'verified_legacy_active', 'manual_reconciliation', 'account_provisioning',
]);
const isPosInt = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n > 0;

/**
 * Parse an untrusted persisted lifecycle record. Malformed data fails CLOSED
 * (503) — it is never returned, and never interpreted as active.
 */
export function parseLifecycleRecord(raw: unknown, expectedId: string): AccountLifecycleRecord {
  const r = raw as Partial<AccountLifecycleRecord> | null | undefined;
  if (!r || typeof r !== 'object') throw ERR.recordInvalid();
  if (r.canonicalUserId !== expectedId) throw ERR.recordInvalid();
  if (r.provider !== 'cognito') throw ERR.recordInvalid();
  if (!LIFECYCLE_STATUSES.has(r.status as string)) throw ERR.recordInvalid();
  if (!isPosInt(r.version)) throw ERR.recordInvalid();
  if (!INIT_SOURCES.has(r.initializationSource as string)) throw ERR.recordInvalid();
  if (typeof r.providerUsername !== 'string' || typeof r.normalizedEmail !== 'string') throw ERR.recordInvalid();
  if (r.currentOperationId !== undefined && typeof r.currentOperationId !== 'string') throw ERR.recordInvalid();
  return r as AccountLifecycleRecord;
}

/**
 * Parse an untrusted persisted operation record. Malformed data fails CLOSED (503).
 */
export function parseOperationRecord(raw: unknown, expectedTargetId: string, expectedOperationId: string): LifecycleOperationRecord {
  const r = raw as Partial<LifecycleOperationRecord> | null | undefined;
  if (!r || typeof r !== 'object') throw ERR.operationRecordInvalid();
  if (r.operationId !== expectedOperationId) throw ERR.operationRecordInvalid();
  if (r.targetUserId !== expectedTargetId) throw ERR.operationRecordInvalid();
  if (r.action !== 'suspend' && r.action !== 'reactivate') throw ERR.operationRecordInvalid();
  if (!OP_STATUSES.has(r.status as string)) throw ERR.operationRecordInvalid();
  if (!isPosInt(r.operationVersion)) throw ERR.operationRecordInvalid();
  if (!Array.isArray(r.completedSteps) || !r.completedSteps.every((s) => ALL_STEPS.has(s as string))) throw ERR.operationRecordInvalid();
  if (!LIFECYCLE_STATUSES.has(r.transitionalStatus as string) || !LIFECYCLE_STATUSES.has(r.desiredStatus as string)) throw ERR.operationRecordInvalid();
  if (typeof r.requestFingerprint !== 'string' || typeof r.idempotencyKeyHash !== 'string') throw ERR.operationRecordInvalid();
  return r as LifecycleOperationRecord;
}

/* ── DynamoDB transaction-cancellation classification ─────────────────────── */

interface CancellationReason { Code?: string }
/**
 * Classify a DynamoDB error into a typed lifecycle error. A conditional check
 * failure on a specific item maps to a precise 409; contention/throttling map to
 * retryable/503; validation/IAM/infra map to 500; unknown fails closed (500).
 * `slots` names each TransactItems index so a ConditionalCheckFailed can be
 * attributed (e.g. ['idempotency','operation','lifecycle']).
 */
export function classifyDynamoError(e: unknown, slots: string[] = []): ApiError {
  const name = (e as { name?: string })?.name ?? '';
  if (name === 'ConditionalCheckFailedException') return ERR.versionConflict();
  if (name === 'ProvisionedThroughputExceededException' || name === 'ThrottlingException' || name === 'RequestLimitExceeded') return ERR.throttled();
  if (name === 'TransactionCanceledException') {
    const reasons = ((e as { CancellationReasons?: CancellationReason[] }).CancellationReasons) ?? [];
    const codes = reasons.map((r) => r?.Code ?? 'None');
    const condIdx = codes.findIndex((c) => c === 'ConditionalCheckFailed');
    if (condIdx >= 0) {
      const slot = slots[condIdx];
      if (slot === 'idempotency') return ERR.idempotencyConflict();
      if (slot === 'operation') return ERR.operationVersionConflict();
      return ERR.versionConflict(); // lifecycle reservation
    }
    if (codes.some((c) => c === 'TransactionConflict')) return ERR.contended();
    if (codes.some((c) => c === 'ProvisionedThroughputExceeded' || c === 'ThrottlingError' || c === 'RequestLimitExceeded')) return ERR.throttled();
    if (codes.some((c) => c === 'ValidationError' || c === 'AccessDenied')) return ERR.storeError();
    return ERR.storeError(); // unknown cancellation → fail closed
  }
  if (name === 'ValidationException' || name === 'AccessDeniedException' || name === 'ResourceNotFoundException') return ERR.storeError();
  return ERR.storeError();
}

/* ── store interface + input types ────────────────────────────────────────── */

export interface InitializeLifecycleInput {
  canonicalUserId: string;
  providerUsername: string;
  normalizedEmail: string;
  initialStatus: AccountLifecycleStatus;
  initializationSource: LifecycleInitializationSource;
  actorUserId: string;
}

export interface BeginLifecycleTransitionInput {
  canonicalUserId: string;
  action: LifecycleAction;
  expectedFromStatus: AccountLifecycleStatus;
  transitionalStatus: AccountLifecycleStatus;
  desiredFinalStatus: AccountLifecycleStatus;
  expectedLifecycleVersion: number;
  idempotencyKey: string;
  operationId: string;
  actorUserId: string;
  actorEmailSnapshot: string;
  reason: string;
  correlationId: string;
}
export interface BeginLifecycleTransitionResult {
  lifecycle: AccountLifecycleRecord;
  operation: LifecycleOperationRecord;
  idempotentReplay: boolean;
}

export interface AdvanceLifecycleOperationInput {
  canonicalUserId: string;
  operationId: string;
  expectedOperationVersion: number;
  /** Reservation check: the lifecycle must still be reserved by this operation. */
  expectedLifecycleVersion: number;
  step: LifecycleStep;
}
export interface MarkReconciliationRequiredInput {
  canonicalUserId: string;
  operationId: string;
  expectedOperationVersion: number;
  expectedLifecycleVersion: number;
  failedStep: LifecycleStep;
  failureCode: string;
}
export interface CompleteLifecycleTransitionInput {
  canonicalUserId: string;
  operationId: string;
  expectedOperationVersion: number;
  expectedLifecycleVersion: number;
  finalStatus: AccountLifecycleStatus;
  // No caller-supplied required steps: the store derives them from operation.action.
}

export interface AccountLifecycleStore {
  capabilities(): AccountLifecycleStoreCapabilities;
  getLifecycle(canonicalUserId: string): Promise<AccountLifecycleRecord | null>;
  getOperation(canonicalUserId: string, operationId: string): Promise<LifecycleOperationRecord | null>;
  initializeLifecycle(input: InitializeLifecycleInput): Promise<AccountLifecycleRecord>;
  beginTransition(input: BeginLifecycleTransitionInput): Promise<BeginLifecycleTransitionResult>;
  advanceOperation(input: AdvanceLifecycleOperationInput): Promise<LifecycleOperationRecord>;
  markReconciliationRequired(input: MarkReconciliationRequiredInput): Promise<{ lifecycle: AccountLifecycleRecord; operation: LifecycleOperationRecord }>;
  completeTransition(input: CompleteLifecycleTransitionInput): Promise<{ lifecycle: AccountLifecycleRecord; operation: LifecycleOperationRecord }>;
}

/** Injectable clock/id seams so tests are deterministic and never hit live AWS. */
export interface LifecycleStoreDeps {
  nowIso: () => string;
}

/* ── capability gate ──────────────────────────────────────────────────────── */

const REQUIRED_MUTATION_CAPS: (keyof AccountLifecycleStoreCapabilities)[] = [
  'multiInstanceShared', 'compareAndSet', 'transactionalWrite', 'durableMutationIntent',
  'idempotentMutations', 'oneActiveOperationPerTarget', 'readAfterWriteConsistent', 'productionEligible',
];

/** Throw 503 ACCOUNT_LIFECYCLE_MUTATION_UNAVAILABLE unless every required capability holds. */
export function assertLifecycleMutationAvailable(store: AccountLifecycleStore): void {
  const caps = store.capabilities();
  if (!REQUIRED_MUTATION_CAPS.every((k) => caps[k] === true)) throw ERR.mutationUnavailable();
}

/* ── safe initialization helper ───────────────────────────────────────────── */

/**
 * Initialize a durable lifecycle record ONLY for a fully verified active legacy
 * state. Any unsafe assessment (provider unknown, consistent_deny, conflicts,
 * missing planes, …) must go through explicit reconciliation instead.
 */
export async function initializeVerifiedActiveLifecycle(
  store: AccountLifecycleStore,
  input: Omit<InitializeLifecycleInput, 'initialStatus' | 'initializationSource'> & { assessment: LegacyLifecycleAssessment },
): Promise<AccountLifecycleRecord> {
  if (!input.assessment.safeToAutoInitialize) {
    throw lifecycleError('ACCOUNT_LIFECYCLE_INIT_NOT_SAFE',
      'Account is not in a fully verified active state; explicit reconciliation is required before initialization.', 409);
  }
  return store.initializeLifecycle({
    canonicalUserId: input.canonicalUserId,
    providerUsername: input.providerUsername,
    normalizedEmail: input.normalizedEmail,
    actorUserId: input.actorUserId,
    initialStatus: 'active',
    initializationSource: 'verified_legacy_active',
  });
}
