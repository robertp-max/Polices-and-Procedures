/**
 * eCIgn Path B — Phase 1 contract: append-only audit envelope (allowlist-shaped,
 * no PHI) and the idempotency contract for write operations. CONTRACT ONLY.
 */
import type { SignerRole } from '../types';
import type {
  ArtifactId,
  ArtifactVersionId,
  AuditChainId,
  IdempotencyKey,
  IsoTimestamp,
  SignerId,
} from './ids';
import type { StateFailureReason } from './stateMachine';

export type AuditAction =
  | 'presented'
  | 'signed'
  | 'final_validated'
  | 'locked'
  | 'drive_publish'
  | 'evidence_attach'
  | 'metadata_attach'
  | 'audit_append'
  | 'state_transition'
  | 'disposition'
  | 'recovery';

export type AuditResult = 'ok' | 'failed' | 'blocked';

/**
 * Audit envelope — an EXPLICIT ALLOWLIST of fields, never `Record<string, unknown>`.
 * It indexes the artifact/version and the action; it MUST NOT carry form contents,
 * signature images, or any PHI. Append-only by contract (monotonic `sequence` +
 * previous/current audit hash chain).
 */
export interface AuditEnvelope {
  readonly auditChainId: AuditChainId;
  /** 1-based, append-only sequence within the chain. */
  readonly sequence: number;
  readonly action: AuditAction;
  readonly actorId: SignerId;
  readonly actorRole: SignerRole;
  readonly timestamp: IsoTimestamp;
  readonly result: AuditResult;
  /** Structured reason code only (no free text). */
  readonly reasonCode?: StateFailureReason;
  readonly artifactId: ArtifactId;
  readonly artifactVersionId?: ArtifactVersionId;
  readonly previousAuditHash: string | null;
  readonly currentAuditHash: string;
}

/** The exact set of keys an audit envelope may contain — enforced at runtime. */
export const AUDIT_ENVELOPE_ALLOWED_KEYS: readonly string[] = [
  'auditChainId',
  'sequence',
  'action',
  'actorId',
  'actorRole',
  'timestamp',
  'result',
  'reasonCode',
  'artifactId',
  'artifactVersionId',
  'previousAuditHash',
  'currentAuditHash',
];

/** Keys that signal form content / signature bytes / PHI and must never appear. */
export const AUDIT_FORBIDDEN_KEY_PATTERNS: readonly RegExp[] = [
  /patient/i,
  /diagnos/i,
  /\bmrn\b/i,
  /medical[_\s-]?record/i,
  /\bssn\b/i,
  /\bdob\b/i,
  /address/i,
  /email/i,
  /phone/i,
  /signature_png|signatureimage|signature_image/i,
  /form[_\s-]?data|formcontents|form_contents/i,
  /\bbytes\b|payload|freetext|free_text|notes|content/i,
];

/** Write operations that must each be idempotent (keyed, replay-safe). */
export type IdempotentOperation =
  | 'presentation_capture'
  | 'canonical_persist'
  | 'signature_append'
  | 'drive_publish'
  | 'evidence_attach'
  | 'metadata_attach'
  | 'audit_append'
  | 'state_transition';

export interface IdempotencyEnvelope {
  readonly operation: IdempotentOperation;
  readonly idempotencyKey: IdempotencyKey;
  /** The version the operation targets — preserved unchanged across retries. */
  readonly artifactVersionId: ArtifactVersionId;
}
