/**
 * Account lifecycle contracts (ADR-0002 Phase 2A).
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

/** Statuses in which the account is NOT permitted to authenticate or act. */
export const NON_ACTIVE_LIFECYCLE_STATUSES: ReadonlySet<AccountLifecycleStatus> = new Set([
  'pending', 'activating', 'suspending', 'suspended', 'reactivating', 'disabled', 'reconciliation_required',
]);

export function lifecycleAllowsAccess(status: AccountLifecycleStatus): boolean {
  return status === 'active';
}

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

/** Durable operation journal record (persisted in Phase 2B; contract defined here). */
export interface LifecycleOperationRecord {
  operationId: string;
  idempotencyKey: string;
  action: LifecycleAction;
  targetUserId: string;
  actorUserId: string;
  actorEmail: string;
  reason: string;
  status: LifecycleOperationStatus;
  expectedLifecycleVersion: number;
  beforeStatus: AccountLifecycleStatus;
  desiredStatus: AccountLifecycleStatus;
  completedSteps: string[];
  failedStep?: string;
  failureCode?: string;
  correlationId: string;
  createdAt: string;
  updatedAt: string;
}

/** Read-only reconciliation classification of an account's cross-plane state. */
export type LegacyLifecycleClassification =
  | 'consistent'
  | 'legacy_pending'
  | 'conflict_active_vs_suspended'
  | 'provider_disabled_but_app_active'
  | 'missing_registration'
  | 'missing_canonical'
  | 'missing_provider_binding'
  | 'manual_review_required';

/** Provider (Cognito) enabled state as best known; 'unknown' when unread. */
export type ProviderState = 'enabled' | 'disabled' | 'unknown';

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
  providerState?: ProviderState;
}

/** Safe admin read projection — no raw Cognito subject, token, or credential. */
export interface AccountLifecycleProjection {
  canonicalUserId: string | null;
  displayEmail: string;
  provisioningStatus: ProvisioningStatus | 'unknown';
  lifecycleStatus: AccountLifecycleStatus | 'unknown';
  canonicalStatus: string | null;
  providerState: ProviderState;
  reconciliationClassification: LegacyLifecycleClassification;
  currentOperationStatus: LifecycleOperationStatus | 'none';
}
