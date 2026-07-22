/**
 * Read-only legacy-state assessment + safe read projection (ADR-0002 Phase 2A).
 *
 * Assesses an account's cross-plane state (DynamoDB registration, canonical
 * registry, Cognito provider) WITHOUT mutating anything — no Cognito calls, no
 * registry writes, no identity merges. It returns EVERY detected issue (not just
 * the first) plus a single UI-summary `primary`, and never overclaims
 * consistency: an unread/unknown plane is a reconciliation condition, not proof.
 */
import type {
  LegacyLifecycleAssessment,
  LegacyLifecycleClassification,
  LegacyLifecycleIssue,
  LegacyStateInput,
  ProviderAccountState,
  ProvisioningStatus,
  AccountLifecycleStatus,
  AccountLifecycleProjection,
  LifecycleOperationStatus,
  SanitizedRegistrationStatus,
} from './types.js';

type RegNorm = 'pending_setup' | 'pending_admin_approval' | 'active' | 'disabled' | 'missing' | 'unknown';
type CanonNorm = 'pending' | 'active' | 'suspended' | 'disabled' | 'missing' | 'unknown';

/** Explicit, fail-closed normalization of the raw registration status. */
function normReg(s?: string | null): RegNorm {
  switch (s) {
    case 'pending_setup': return 'pending_setup';
    case 'pending_admin_approval': return 'pending_admin_approval';
    case 'active': return 'active';
    case 'disabled': return 'disabled';
    case null: case undefined: return 'missing';
    default: return 'unknown';
  }
}

/** Explicit, fail-closed normalization of the raw canonical status. */
function normCanon(s?: string | null): CanonNorm {
  switch (s) {
    case 'pending': return 'pending';
    case 'active': return 'active';
    case 'suspended': return 'suspended';
    case 'disabled': return 'disabled';
    case null: case undefined: return 'missing';
    default: return 'unknown';
  }
}

/**
 * Read-only assessment. Collects all issues, then picks a deterministic primary
 * by precedence. `safeToAutoInitialize` is true ONLY for a fully verified active
 * state across all three planes with no issues.
 */
export function assessLegacyLifecycleState(input: LegacyStateInput): LegacyLifecycleAssessment {
  const providerState: ProviderAccountState = input.providerAccountState ?? 'unknown';
  const reg = normReg(input.registrationStatus);
  const canon = normCanon(input.canonicalStatus);
  const issues: LegacyLifecycleIssue[] = [];
  const add = (i: LegacyLifecycleIssue) => { if (!issues.includes(i)) issues.push(i); };

  // Identity-resolution ambiguity — never auto-resolve.
  if ((input.duplicateEmailCandidates ?? 0) > 1) add('duplicate_email_candidates');
  if (input.providerBindingConflict) add('provider_binding_conflict');
  if (!input.hasProviderBinding) add('missing_provider_binding');
  else if (providerState === 'not_found') add('missing_provider_account');

  // Plane presence / recognizability.
  if (reg === 'missing') add('missing_registration');
  else if (reg === 'unknown') add('unknown_registration_status');
  if (canon === 'missing') add('missing_canonical');
  else if (canon === 'unknown') add('unknown_canonical_status');

  // Onboarding pending on either plane.
  if (reg === 'pending_setup' || reg === 'pending_admin_approval' || canon === 'pending') add('legacy_pending');

  const regActive = reg === 'active';
  const regDenied = reg === 'disabled';
  const canonActive = canon === 'active';
  const canonDenied = canon === 'suspended' || canon === 'disabled';

  // Aligned-active across app planes → provider must be proven enabled.
  if (regActive && canonActive) {
    if (providerState === 'disabled') add('provider_disabled_but_app_active');
    else if (providerState === 'unknown') add('provider_state_unknown');
    // not_found already captured as missing_provider_account above
    else if (providerState === 'not_found') add('provider_disabled_but_app_active');
  }
  // Aligned-denied across app planes → provider must be proven not-enabled.
  if (regDenied && canonDenied) {
    if (providerState === 'enabled') add('provider_enabled_but_app_denied');
    else if (providerState === 'unknown') add('provider_state_unknown');
  }
  // Active on exactly one app plane → cross-plane conflict.
  if ((regActive && canonDenied) || (regDenied && canonActive)) add('conflict_active_vs_suspended');

  // Deterministic primary by precedence (most-blocking first).
  const order: LegacyLifecycleClassification[] = [
    'duplicate_email_candidates', 'provider_binding_conflict',
    'missing_provider_binding', 'missing_provider_account',
    'missing_registration', 'missing_canonical',
    'unknown_registration_status', 'unknown_canonical_status',
    'conflict_active_vs_suspended', 'provider_enabled_but_app_denied',
    'provider_disabled_but_app_active', 'legacy_pending', 'provider_state_unknown',
  ];
  let primary: LegacyLifecycleClassification | undefined =
    order.find((c) => issues.includes(c as LegacyLifecycleIssue));

  const verifiedActive = regActive && canonActive && providerState === 'enabled' && issues.length === 0;
  const verifiedDeny = regDenied && canonDenied && providerState === 'disabled' && issues.length === 0;

  if (!primary) {
    if (verifiedActive) primary = 'consistent';
    else if (verifiedDeny) primary = 'consistent_deny';
    else primary = 'manual_review_required';
  }

  return { primary, issues, safeToAutoInitialize: verifiedActive };
}

function toProvisioningStatus(registrationStatus?: string | null): ProvisioningStatus | 'unknown' {
  switch (registrationStatus) {
    case 'pending_setup': return 'pending_setup';
    case 'pending_admin_approval': return 'pending_admin_approval';
    case 'active': return 'setup_complete';
    case 'disabled': return 'setup_complete'; // disabled is a lifecycle concern, setup was completed
    case null: case undefined: return 'unknown';
    default: return 'unknown'; // unsupported/legacy value never silently becomes setup_complete
  }
}

function toSanitizedRegistrationStatus(registrationStatus?: string | null): SanitizedRegistrationStatus {
  switch (registrationStatus) {
    case 'pending_setup': return 'pending_setup';
    case 'pending_admin_approval': return 'pending_admin_approval';
    case 'active': return 'active';
    case 'disabled': return 'disabled';
    default: return 'unknown';
  }
}

/**
 * Best-effort lifecycle status derived from the canonical plane for the Phase-2A
 * read projection. `lifecycleStatusSource` is `legacy_canonical_derivation`
 * until Phase 2B's durable AccountLifecycleRecord.status becomes authoritative.
 * Unrecognized canonical values never become an active lifecycle state.
 */
function toLifecycleStatus(canonicalStatus?: string | null): AccountLifecycleStatus | 'unknown' {
  switch (canonicalStatus) {
    case 'active': return 'active';
    case 'suspended': return 'suspended';
    case 'pending': return 'pending';
    case 'disabled': return 'disabled';
    default: return 'unknown';
  }
}

export interface ProjectionInput extends LegacyStateInput {
  canonicalUserId: string | null;
  displayEmail: string;
  currentOperationStatus?: LifecycleOperationStatus | 'none';
}

/** Build the safe admin read projection (no raw subject / token / credential). */
export function buildAccountLifecycleProjection(input: ProjectionInput): AccountLifecycleProjection {
  const assessment = assessLegacyLifecycleState(input);
  return {
    canonicalUserId: input.canonicalUserId,
    displayEmail: input.displayEmail,
    provisioningStatus: toProvisioningStatus(input.registrationStatus),
    lifecycleStatus: toLifecycleStatus(input.canonicalStatus),
    lifecycleStatusSource: 'legacy_canonical_derivation',
    canonicalStatus: input.canonicalStatus ?? null,
    registrationStatus: toSanitizedRegistrationStatus(input.registrationStatus),
    providerState: input.providerAccountState ?? 'unknown',
    reconciliationClassification: assessment.primary,
    reconciliationIssues: assessment.issues,
    currentOperationStatus: input.currentOperationStatus ?? 'none',
  };
}
