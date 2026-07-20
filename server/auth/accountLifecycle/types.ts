/**
 * Account lifecycle contracts (ADR-0002 Phase 2A, hardened).
 *
 * Provisioning and lifecycle are SEPARATE domains and must never be collapsed
 * into one enlarged enum:
 *   - ProvisioningStatus answers "is onboarding/setup complete?"
 *   - AccountLifecycleStatus answers "may this person authenticate and exercise
 *     application authority right now?"
 *
 * The canonical application user id is the durable identity. Email is a
 * normalized, mutable address/alias — never the record identity and never an
 * idempotency key. Records are never created or merged on email alone.
 */

/** Onboarding / provisioning progress (distinct from lifecycle authority). */
export type ProvisioningStatus =
  | 'pending_setup'
  | 'pending_admin_approval'
  | 'setup_complete';

/** Whether the account may authenticate / act. The global-deny authority. */
export type AccountLifecycleStatus =
  | 'pending'
  | 'activating'
  | 'active'
  | 'suspending'
  | 'suspended'
  | 'reactivating'
  | 'disabled'
  | 'reconciliation_required';

export function lifecycleAllowsAccess(status: AccountLifecycleStatus): boolean {
  return status === 'active';
}

/** Provider (Cognito) account state. `not_found` (deleted user) and `unknown`
 *  (not queried) are distinct defects — an unread provider is never proof. */
export type ProviderAccountState = 'enabled' | 'disabled' | 'not_found' | 'unknown';

/** How a durable lifecycle record came to exist. */
export type LifecycleInitializationSource =
  | 'verified_legacy_active'
  | 'manual_reconciliation'
  | 'account_provisioning';

/** Durable per-user lifecycle record. Identity is `canonicalUserId`; email and
 *  providerUsername are mutable projections, never the record identity. */
export interface AccountLifecycleRecord {
  schemaVersion: LifecycleSchemaVersion;
  canonicalUserId: string;
  provider: 'cognito';
  providerUsername: string;
  normalizedEmail: string;
  status: AccountLifecycleStatus;
  version: number;
  currentOperationId?: string;
  lastCompletedOperationId?: string;
  reasonCode?: string;
  initializationSource: LifecycleInitializationSource;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export type LifecycleAction = 'suspend' | 'reactivate';

// `failed_without_mutation` removed (2B closure): a failure before durable
// beginTransition intent is a denied/failed admin attempt for the audit stream,
// not a journal state.
export type LifecycleOperationStatus =
  | 'intent_recorded'
  | 'running'
  | 'reconciliation_required'
  | 'completed';

/** Post-commit audit recovery marker (Phase 2C orchestrates the retry). Phase 2B
 *  only reserves the field; NO cross-store atomicity is claimed. */
export type PostCommitAuditStatus =
  | 'not_required_yet'
  | 'pending'
  | 'completed'
  | 'reconciliation_required';

export type LifecycleSchemaVersion = 1;
export const LIFECYCLE_SCHEMA_VERSION: LifecycleSchemaVersion = 1;

/**
 * Closed step vocabulary for the durable operation journal. `transition_ready_audited`
 * is the PRE-commit evidence step; `final_state_committed` is appended only at
 * completion. (Matches the frozen semantic-core vocabulary.)
 */
export type LifecycleStep =
  | 'intent_recorded'
  | 'global_deny_committed'
  | 'canonical_transition_projected'
  | 'provider_disabled'
  | 'provider_sessions_revoked'
  | 'provider_enabled'
  | 'registration_projected'
  | 'canonical_final_projected'
  | 'transition_ready_audited'
  | 'final_state_committed';

/** Durable idempotency claim (its own record; raw key never stored). */
export interface LifecycleIdempotencyClaim {
  schemaVersion: LifecycleSchemaVersion;
  operationId: string;
  requestFingerprint: string;
}

/** Durable operation journal record. */
export interface LifecycleOperationRecord {
  schemaVersion: LifecycleSchemaVersion;
  operationId: string;
  /** sha256 of the idempotency key. The raw key is never persisted. */
  idempotencyKeyHash: string;
  /** Immutable fingerprint of the intent inputs — detects same-key/different-request. */
  requestFingerprint: string;
  action: LifecycleAction;
  targetUserId: string;
  actorUserId: string;
  /** Audit SNAPSHOT of the actor's email at operation time — NOT actor identity. */
  actorEmailSnapshot: string;
  reason: string;
  status: LifecycleOperationStatus;
  /** Version for compare-and-set on the operation record itself (journal progress). */
  operationVersion: number;
  expectedLifecycleVersion: number;
  beforeStatus: AccountLifecycleStatus;
  /** The transitional lifecycle state this operation reserved (suspending/reactivating). */
  transitionalStatus: AccountLifecycleStatus;
  desiredStatus: AccountLifecycleStatus;
  completedSteps: LifecycleStep[];
  failedStep?: LifecycleStep;
  failureCode?: string;
  /** Reserved for Phase 2C post-commit audit orchestration. */
  postCommitAuditStatus: PostCommitAuditStatus;
  correlationId: string;
  createdAt: string;
  updatedAt: string;
}

/** A single detected cross-plane defect. Multiple can co-exist. */
export type LegacyLifecycleIssue =
  | 'legacy_pending'
  | 'provider_state_unknown'
  | 'provider_disabled_but_app_active'
  | 'provider_enabled_but_app_denied'
  | 'conflict_active_vs_suspended'
  | 'missing_registration'
  | 'missing_canonical'
  | 'missing_provider_binding'
  | 'missing_provider_account'
  | 'provider_binding_conflict'
  | 'duplicate_email_candidates'
  | 'unknown_registration_status'
  | 'unknown_canonical_status';

/** Primary single-label classification for UI summary. */
export type LegacyLifecycleClassification =
  | 'consistent'
  | 'consistent_deny'
  | LegacyLifecycleIssue
  | 'manual_review_required';

/** Full assessment — a UI-summary primary plus every detected issue. */
export interface LegacyLifecycleAssessment {
  primary: LegacyLifecycleClassification;
  issues: LegacyLifecycleIssue[];
  /** True ONLY for a fully verified active-consistent state (safe to init a record). */
  safeToAutoInitialize: boolean;
}

/**
 * Inputs to the read-only legacy classifier. Raw provider subject / tokens are
 * deliberately absent — classification never needs or exposes them.
 */
export interface LegacyStateInput {
  hasProviderBinding: boolean;
  providerBindingConflict?: boolean;
  duplicateEmailCandidates?: number;
  /** Raw DynamoDB RegistrationRecord.status, or null when no registration exists. */
  registrationStatus?: string | null;
  /** Raw AppIdentityUser.status, or null when no canonical user exists. */
  canonicalStatus?: string | null;
  providerAccountState?: ProviderAccountState;
}

/** Sanitized registration access state for the safe projection. */
export type SanitizedRegistrationStatus =
  | 'pending_setup'
  | 'pending_admin_approval'
  | 'active'
  | 'disabled'
  | 'unknown';

/** Safe admin read projection — no raw Cognito subject, token, or credential. */
export interface AccountLifecycleProjection {
  canonicalUserId: string | null;
  displayEmail: string;
  provisioningStatus: ProvisioningStatus | 'unknown';
  lifecycleStatus: AccountLifecycleStatus | 'unknown';
  /** Source of `lifecycleStatus`: legacy derivation until Phase 2B's durable record. */
  lifecycleStatusSource: 'durable_lifecycle' | 'legacy_canonical_derivation';
  canonicalStatus: string | null;
  registrationStatus: SanitizedRegistrationStatus;
  providerState: ProviderAccountState;
  reconciliationClassification: LegacyLifecycleClassification;
  reconciliationIssues: LegacyLifecycleIssue[];
  currentOperationStatus: LifecycleOperationStatus | 'none';
}
