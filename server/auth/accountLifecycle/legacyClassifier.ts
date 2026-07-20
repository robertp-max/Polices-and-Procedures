/**
 * Read-only legacy-state classifier + safe read projection (ADR-0002 Phase 2A).
 *
 * Classifies an account's cross-plane state (DynamoDB registration, canonical
 * registry, Cognito provider) WITHOUT mutating anything — no Cognito calls, no
 * registry writes, no identity merges. It exists to surface conflicts (e.g. the
 * known "registration active + canonical suspended" defect) for adjudication
 * before Phase 2B enables durable mutation.
 */
import type {
  LegacyLifecycleClassification,
  LegacyStateInput,
  ProviderState,
  ProvisioningStatus,
  AccountLifecycleStatus,
  AccountLifecycleProjection,
  LifecycleOperationStatus,
} from './types.js';

const REG_ACTIVE = 'active';
const REG_DISABLED = 'disabled';
const REG_PENDING = new Set(['pending_setup', 'pending_admin_approval']);

const CANON_ACTIVE = 'active';
const CANON_PENDING = 'pending';
const CANON_DENIED = new Set(['suspended', 'disabled']);

function regActive(s?: string | null): boolean { return s === REG_ACTIVE; }
function regPending(s?: string | null): boolean { return !!s && REG_PENDING.has(s); }
function regDenied(s?: string | null): boolean { return s === REG_DISABLED; }
function canonActive(s?: string | null): boolean { return s === CANON_ACTIVE; }
function canonPending(s?: string | null): boolean { return s === CANON_PENDING; }
function canonDenied(s?: string | null): boolean { return !!s && CANON_DENIED.has(s); }

/**
 * Deterministic, first-match-wins classification. Ambiguous or unexpected
 * combinations fail safe to `manual_review_required` — never to a silent OK.
 */
export function classifyLegacyLifecycleState(input: LegacyStateInput): LegacyLifecycleClassification {
  const { registrationStatus = null, canonicalStatus = null } = input;
  const providerState: ProviderState = input.providerState ?? 'unknown';

  // Ambiguous identity resolution → never auto-resolve.
  if ((input.duplicateEmailCandidates ?? 0) > 1) return 'manual_review_required';
  if (input.providerBindingConflict) return 'manual_review_required';
  if (!input.hasProviderBinding) return 'missing_provider_binding';

  // Missing planes.
  if (registrationStatus == null) return 'missing_registration';
  if (canonicalStatus == null) return 'missing_canonical';

  // Pending onboarding on either plane.
  if (regPending(registrationStatus) || canonPending(canonicalStatus)) return 'legacy_pending';

  // Both planes aligned as active.
  if (regActive(registrationStatus) && canonActive(canonicalStatus)) {
    return providerState === 'disabled' ? 'provider_disabled_but_app_active' : 'consistent';
  }

  // Both planes aligned as denied (different vocabularies, same intent).
  if (regDenied(registrationStatus) && canonDenied(canonicalStatus)) return 'consistent';

  // Provider disabled while the app still considers the user active.
  if (canonActive(canonicalStatus) && providerState === 'disabled') return 'provider_disabled_but_app_active';

  // Active on exactly one plane → the known cross-plane conflict.
  if (regActive(registrationStatus) !== canonActive(canonicalStatus)) return 'conflict_active_vs_suspended';

  return 'manual_review_required';
}

function toProvisioningStatus(registrationStatus?: string | null): ProvisioningStatus | 'unknown' {
  if (registrationStatus == null) return 'unknown';
  if (regPending(registrationStatus)) {
    return registrationStatus === 'pending_admin_approval' ? 'pending_admin_approval' : 'pending_setup';
  }
  // active / disabled both mean onboarding completed; disabled is a lifecycle concern.
  return 'setup_complete';
}

/**
 * Best-effort lifecycle status derived from the canonical plane for the Phase-2A
 * read projection. In Phase 2B the durable AccountLifecycleRecord.status becomes
 * authoritative and supersedes this derivation.
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
  return {
    canonicalUserId: input.canonicalUserId,
    displayEmail: input.displayEmail,
    provisioningStatus: toProvisioningStatus(input.registrationStatus),
    lifecycleStatus: toLifecycleStatus(input.canonicalStatus),
    canonicalStatus: input.canonicalStatus ?? null,
    providerState: input.providerState ?? 'unknown',
    reconciliationClassification: classifyLegacyLifecycleState(input),
    currentOperationStatus: input.currentOperationStatus ?? 'none',
  };
}
