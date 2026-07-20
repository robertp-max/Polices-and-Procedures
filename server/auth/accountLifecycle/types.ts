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

/** Durable per-user lifecycle record (persisted in Phase 2B; contract defined here). */
export interface AccountLifecycleRecord {
  canonicalUserId: string;
  provider: 'cognito';
  providerUsername: string;
  normalizedEmail: string;
  status: AccountLifecycleStatus;
  version: number;
  currentOperationId?: string;
  lastCompletedOperationId?: string;
  reasonCode?: string;
  updatedAt: string;
  updatedBy: string;
}

export type LifecycleAction = 'suspend' | 'reactivate';

export type LifecycleOperationStatus =
  | 'intent_recorded'
  | 'running'
  | 'reconciliation_required'
  | 'completed'
  | 'failed_without_mutation';

/**
 * Closed step vocabulary for the durable operation journal. A typed union
 * prevents a typo from making reconciliation silently repeat or skip a step.
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
  | 'completion_audited'
  | 'final_state_committed';

/** Durable operation journal record (persisted in Phase 2B; contract defined here). */
export interface LifecycleOperationRecord {
  operationId: string;
  idempotencyKey: string;
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
  desiredStatus: AccountLifecycleStatus;
  completedSteps: LifecycleStep[];
  failedStep?: LifecycleStep;
  failureCode?: string;
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
