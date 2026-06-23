/**
 * eCIgn Path B — Phase 1 PURE invariant validators.
 *
 * Every function here is side-effect-free: NO file reads, NO fetch, NO storage,
 * NO state mutation, NO signature application, NO PDF generation, NO JSONL.
 * Validators accept loosely-typed input and return structured issue CODES (never
 * free text / PHI) so they can guard contracts at runtime in later phases.
 */
import type { ECIgnPermissionRole } from '../types';
import { permissionSatisfies } from '../permissionRoles';
import {
  CANONICAL_ARTIFACT_MIME,
  isCanonicalMimeType,
  isNonEmptyString,
  isValidSha256,
} from './ids';
import { CANONICAL_ARTIFACT_KIND } from './artifactContracts';
import { AUDIT_ENVELOPE_ALLOWED_KEYS, AUDIT_FORBIDDEN_KEY_PATTERNS } from './auditContracts';

export type PathBIssueCode =
  | 'not_an_object'
  | 'missing_field'
  | 'non_canonical_artifact_kind'
  | 'non_canonical_mime'
  | 'invalid_sha256'
  | 'non_positive_byte_length'
  | 'presented_has_signed_only_field'
  | 'signed_missing_signer'
  | 'signed_missing_sequence'
  | 'signed_missing_immutable_at'
  | 'presented_signed_id_collision'
  | 'signed_missing_presented_link'
  | 'presented_link_mismatch'
  | 'chain_tip_mismatch'
  | 'first_version_missing_presentation_link'
  | 'self_referential_previous'
  | 'sequence_not_one_based'
  | 'sequence_not_strictly_increasing'
  | 'sequence_duplicate'
  | 'sequence_gap'
  | 'form_instance_changed'
  | 'tier_skipped'
  | 'permission_insufficient'
  | 'self_approval_forbidden'
  | 'lock_missing_canonical_persist'
  | 'lock_missing_drive_parity'
  | 'lock_missing_evidence_parity'
  | 'lock_missing_metadata_attach'
  | 'lock_missing_audit_append'
  | 'parity_link_without_sha'
  | 'parity_sha_mismatch'
  | 'canonical_locator_public_url'
  | 'canonical_locator_invalid'
  | 'audit_unknown_key'
  | 'audit_forbidden_key'
  | 'retention_policy_missing'
  | 'retention_hardcoded_duration'
  | 'idempotency_key_missing'
  | 'retry_version_changed'
  | 'hierarchy_snapshot_invalid';

export interface ValidationResult {
  readonly ok: boolean;
  readonly issues: readonly PathBIssueCode[];
}

const OK: ValidationResult = { ok: true, issues: [] };
function toResult(issues: PathBIssueCode[]): ValidationResult {
  return issues.length === 0 ? OK : { ok: false, issues };
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

const SIGNED_ONLY_KEYS = [
  'signedAt',
  'immutableAt',
  'signerId',
  'signerRole',
  'signatureSequence',
  'previousSignedArtifactVersionId',
  'artifactVersionId',
] as const;

const PUBLIC_URL_RE = /^(https?:)?\/\/|drive\.google\.com|googleusercontent\.com|\.googleapis\.com/i;
const HARDCODED_DURATION_RE = /\b\d+[\s_-]*(?:y|yr|yrs|year|years|mo|month|months|d|day|days)\b/i;

/** §2: the canonical signable artifact is the actual Care Indeed form PDF. */
export function validateArtifactIdentity(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, issues: ['not_an_object'] };
  const issues: PathBIssueCode[] = [];
  if (input.artifactKind !== CANONICAL_ARTIFACT_KIND) issues.push('non_canonical_artifact_kind');
  if (!isCanonicalMimeType(input.mimeType)) issues.push('non_canonical_mime');
  for (const k of ['artifactId', 'formId', 'formInstanceId', 'eventId', 'policyId']) {
    if (!isNonEmptyString(input[k])) issues.push('missing_field');
  }
  return toResult(issues);
}

export function validateCanonicalMimeType(mime: unknown): ValidationResult {
  return mime === CANONICAL_ARTIFACT_MIME ? OK : { ok: false, issues: ['non_canonical_mime'] };
}

export function validatePresentedArtifactVersion(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, issues: ['not_an_object'] };
  const issues: PathBIssueCode[] = [];
  if (input.kind !== 'presented') issues.push('missing_field');
  for (const k of SIGNED_ONLY_KEYS) {
    if (k in input && input[k] !== undefined) issues.push('presented_has_signed_only_field');
  }
  if (!isNonEmptyString(input.presentationArtifactVersionId)) issues.push('missing_field');
  if (!isValidSha256(input.sha256)) issues.push('invalid_sha256');
  if (typeof input.byteLength !== 'number' || input.byteLength <= 0) issues.push('non_positive_byte_length');
  if (!isCanonicalMimeType(input.mimeType)) issues.push('non_canonical_mime');
  return toResult(issues);
}

export function validateSignedArtifactVersion(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, issues: ['not_an_object'] };
  const issues: PathBIssueCode[] = [];
  if (input.kind !== 'signed') issues.push('missing_field');
  if (!isNonEmptyString(input.signerId) || !isNonEmptyString(input.signerRole)) issues.push('signed_missing_signer');
  if (typeof input.signatureSequence !== 'number') issues.push('signed_missing_sequence');
  if (!isNonEmptyString(input.immutableAt)) issues.push('signed_missing_immutable_at');
  if (!isNonEmptyString(input.artifactVersionId)) issues.push('missing_field');
  if (!isNonEmptyString(input.presentedArtifactVersionId)) issues.push('signed_missing_presented_link');
  if (!isValidSha256(input.sha256)) issues.push('invalid_sha256');
  if (typeof input.byteLength !== 'number' || input.byteLength <= 0) issues.push('non_positive_byte_length');
  if (!isCanonicalMimeType(input.mimeType)) issues.push('non_canonical_mime');
  return toResult(issues);
}

/** Presented input bytes and signed output bytes must be distinct, linked versions. */
export function validatePresentedSignedPair(presented: unknown, signed: unknown): ValidationResult {
  if (!isRecord(presented) || !isRecord(signed)) return { ok: false, issues: ['not_an_object'] };
  const issues: PathBIssueCode[] = [];
  const presentationId = presented.presentationArtifactVersionId;
  const signedId = signed.artifactVersionId;
  const link = signed.presentedArtifactVersionId;
  if (!isNonEmptyString(link)) issues.push('signed_missing_presented_link');
  else if (link !== presentationId) issues.push('presented_link_mismatch');
  if (isNonEmptyString(presentationId) && presentationId === signedId) issues.push('presented_signed_id_collision');
  return toResult(issues);
}

/** Whole signed chain: linkage, self-ref, instance stability, presentation link. */
export function validateVersionLinkage(chain: readonly unknown[]): ValidationResult {
  const issues: PathBIssueCode[] = [];
  let firstInstance: unknown;
  for (let i = 0; i < chain.length; i += 1) {
    const v = chain[i];
    if (!isRecord(v)) return { ok: false, issues: ['not_an_object'] };
    const prev = v.previousSignedArtifactVersionId;
    if (i === 0) {
      firstInstance = v.formInstanceId;
      if (!isNonEmptyString(v.presentedArtifactVersionId)) issues.push('first_version_missing_presentation_link');
    } else {
      const prior = chain[i - 1];
      const priorId = isRecord(prior) ? prior.artifactVersionId : undefined;
      if (prev !== priorId) issues.push('chain_tip_mismatch');
      if (v.formInstanceId !== firstInstance) issues.push('form_instance_changed');
    }
    if (isNonEmptyString(prev) && prev === v.artifactVersionId) issues.push('self_referential_previous');
  }
  return toResult(issues);
}

/** 1-based, strictly increasing, gap-free, unique sequence across the chain. */
export function validateSignatureSequence(chain: readonly unknown[]): ValidationResult {
  const issues: PathBIssueCode[] = [];
  const seen = new Set<number>();
  let expected = 1;
  for (let i = 0; i < chain.length; i += 1) {
    const v = chain[i];
    const seq = isRecord(v) ? v.signatureSequence : undefined;
    if (typeof seq !== 'number') {
      issues.push('signed_missing_sequence');
      continue;
    }
    if (seen.has(seq)) issues.push('sequence_duplicate');
    seen.add(seq);
    if (i === 0 && seq !== 1) issues.push('sequence_not_one_based');
    if (seq < expected) issues.push('sequence_not_strictly_increasing');
    else if (seq > expected) issues.push('sequence_gap');
    expected = seq + 1;
  }
  return toResult(issues);
}

/** A required signer tier may not be skipped (checked against the snapshot order). */
export function validateTierProgression(
  orderedRequiredTiers: readonly number[],
  signedTiersInOrder: readonly number[],
): ValidationResult {
  const issues: PathBIssueCode[] = [];
  let pointer = 0;
  for (const tier of signedTiersInOrder) {
    if (tier !== orderedRequiredTiers[pointer]) {
      issues.push('tier_skipped');
      break;
    }
    pointer += 1;
  }
  return toResult(issues);
}

/** A lower permission tier cannot satisfy a higher required permission ("or higher"). */
export function validatePermissionSatisfiesTier(
  held: readonly ECIgnPermissionRole[],
  required: ECIgnPermissionRole,
): ValidationResult {
  return permissionSatisfies(held, required) ? OK : { ok: false, issues: ['permission_insufficient'] };
}

/** No single signer identity may satisfy two tiers when the snapshot forbids it. */
export function validateNoSelfApproval(
  blocksSelfApproval: boolean,
  assignments: readonly { signerTier: number; signerId: string }[],
): ValidationResult {
  if (!blocksSelfApproval) return OK;
  const seen = new Set<string>();
  for (const a of assignments) {
    if (seen.has(a.signerId)) return { ok: false, issues: ['self_approval_forbidden'] };
    seen.add(a.signerId);
  }
  return OK;
}

/** Lock eligibility: canonical persistence + both parities + metadata + audit. */
export function validateLockEligibilityMetadata(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, issues: ['not_an_object'] };
  const issues: PathBIssueCode[] = [];
  if (input.canonicalPersistVerified !== true) issues.push('lock_missing_canonical_persist');
  const drive = input.driveParity;
  const evidence = input.evidenceParity;
  if (!isRecord(drive) || drive.status !== 'verified') issues.push('lock_missing_drive_parity');
  if (!isRecord(evidence) || evidence.status !== 'verified') issues.push('lock_missing_evidence_parity');
  if (input.metadataAttachComplete !== true) issues.push('lock_missing_metadata_attach');
  if (input.auditAppendComplete !== true) issues.push('lock_missing_audit_append');
  return toResult(issues);
}

/** A link/id alone never means parity: verified requires recomputed sha equality. */
export function validateReplicaParityRecord(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, issues: ['not_an_object'] };
  const issues: PathBIssueCode[] = [];
  const canonical = input.canonicalSha256;
  const replica = input.replicaSha256;
  if (input.status === 'verified') {
    if (!isNonEmptyString(replica)) issues.push('parity_link_without_sha');
    else if (replica !== canonical) issues.push('parity_sha_mismatch');
  }
  if (isNonEmptyString(replica) && isNonEmptyString(canonical) && replica !== canonical) {
    issues.push('parity_sha_mismatch');
  }
  return toResult(issues);
}

/** True when a parity record indicates a mismatch requiring recovery. */
export function parityRequiresRecovery(input: unknown): boolean {
  if (!isRecord(input)) return false;
  if (input.status === 'mismatch' || input.status === 'failed') return true;
  const c = input.canonicalSha256;
  const r = input.replicaSha256;
  return isNonEmptyString(c) && isNonEmptyString(r) && c !== r;
}

/** Canonical locator must be opaque and never a public Drive/HTTP URL. */
export function validateCanonicalLocator(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, issues: ['not_an_object'] };
  const issues: PathBIssueCode[] = [];
  if (input.store !== 'canonical' || !isNonEmptyString(input.ref)) issues.push('canonical_locator_invalid');
  if (isNonEmptyString(input.ref) && PUBLIC_URL_RE.test(input.ref)) issues.push('canonical_locator_public_url');
  return toResult(issues);
}

/** Audit envelope: allowlist-only keys, never free text / PHI / signature bytes. */
export function validateAuditEnvelope(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, issues: ['not_an_object'] };
  const issues: PathBIssueCode[] = [];
  for (const key of Object.keys(input)) {
    if (!AUDIT_ENVELOPE_ALLOWED_KEYS.includes(key)) issues.push('audit_unknown_key');
    if (AUDIT_FORBIDDEN_KEY_PATTERNS.some((re) => re.test(key))) issues.push('audit_forbidden_key');
  }
  return toResult(issues);
}

/** Retention is required and must not be a hardcoded-duration substitute. */
export function validateRetentionContract(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, issues: ['not_an_object'] };
  const issues: PathBIssueCode[] = [];
  const id = input.retentionPolicyId;
  if (!isNonEmptyString(id)) issues.push('retention_policy_missing');
  const snapshot = input.policySnapshotRef;
  if (
    (isNonEmptyString(id) && HARDCODED_DURATION_RE.test(id)) ||
    (isNonEmptyString(snapshot) && HARDCODED_DURATION_RE.test(snapshot))
  ) {
    issues.push('retention_hardcoded_duration');
  }
  return toResult(issues);
}

/** Each write operation must carry an idempotency key. */
export function validateIdempotency(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, issues: ['not_an_object'] };
  return isNonEmptyString(input.idempotencyKey) && isNonEmptyString(input.operation)
    ? OK
    : { ok: false, issues: ['idempotency_key_missing'] };
}

/** A retry must target the SAME artifact version (canonical bytes never overwritten). */
export function validateRetryPreservesVersion(previous: unknown, retry: unknown): ValidationResult {
  if (!isRecord(previous) || !isRecord(retry)) return { ok: false, issues: ['not_an_object'] };
  return previous.artifactVersionId === retry.artifactVersionId
    ? OK
    : { ok: false, issues: ['retry_version_changed'] };
}

/** Snapshot must have a stable id and an ascending, unique required-tier order. */
export function validateHierarchySnapshot(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, issues: ['not_an_object'] };
  const issues: PathBIssueCode[] = [];
  if (!isNonEmptyString(input.snapshotId)) issues.push('hierarchy_snapshot_invalid');
  const tiers = input.orderedRequiredTiers;
  if (!Array.isArray(tiers) || tiers.length === 0) {
    issues.push('hierarchy_snapshot_invalid');
  } else {
    for (let i = 1; i < tiers.length; i += 1) {
      if (typeof tiers[i] !== 'number' || tiers[i] <= tiers[i - 1]) {
        issues.push('hierarchy_snapshot_invalid');
        break;
      }
    }
  }
  return toResult(issues);
}
