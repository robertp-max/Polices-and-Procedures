/**
 * Drive-first evidence architecture — server-side review commands.
 *
 * Acceptance/rejection is a server command with role checks and no
 * self-review. Accepted evidence is read-only through the application:
 * corrections create a NEW evidence version referencing
 * supersedesEvidenceId; the prior record is preserved.
 */
import type { Actor, DriveFirstEvidenceRecord } from './contracts';
import { REVIEWER_ROLES } from './contracts';
import type { EvidenceMetadataStore } from './metadataStore';
import type { AuditLedger } from './auditLedger';
import type { FinalizeDeps, FinalizeEvidenceInput, FinalizeEvidenceResult } from './finalizeEvidence';
import { finalizeEvidence } from './finalizeEvidence';

export class ReviewError extends Error {
  readonly code:
    | 'unauthorized'
    | 'self_review_forbidden'
    | 'invalid_state'
    | 'not_found';
  constructor(code: ReviewError['code'], message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'ReviewError';
  }
}

export interface ReviewDeps {
  metadata: EvidenceMetadataStore;
  audit: AuditLedger;
  now: () => string;
}

export interface ReviewEvidenceInput {
  commandId: string;
  actor: Actor;
  evidenceId: string;
  decision: 'accepted' | 'rejected';
  rejectionReason?: string;
}

function assertReviewer(actor: Actor): void {
  if (!REVIEWER_ROLES.includes(actor.role)) {
    throw new ReviewError('unauthorized', `role "${actor.role}" cannot accept or reject evidence.`);
  }
}

/** Accept or reject submitted evidence. Reviewer role required; no self-review. */
export async function reviewEvidence(
  deps: ReviewDeps,
  input: ReviewEvidenceInput,
): Promise<DriveFirstEvidenceRecord> {
  assertReviewer(input.actor);
  const record = await deps.metadata.get(input.evidenceId);
  if (!record) throw new ReviewError('not_found', `evidence ${input.evidenceId} not found.`);
  if (record.submittedBy === input.actor.userId || record.createdBy === input.actor.userId) {
    throw new ReviewError('self_review_forbidden', 'a user cannot approve, certify, or clear their own evidence.');
  }
  if (record.status !== 'submitted') {
    throw new ReviewError('invalid_state', `only submitted evidence can be reviewed (status: ${record.status}).`);
  }
  if (input.decision === 'rejected' && !input.rejectionReason) {
    throw new ReviewError('invalid_state', 'rejection requires a rejectionReason.');
  }
  const now = deps.now();
  const updated = await deps.metadata.update(input.evidenceId, {
    status: input.decision,
    reviewedBy: input.actor.userId,
    reviewedAt: now,
    decision: input.decision,
    rejectionReason: input.decision === 'rejected' ? input.rejectionReason : undefined,
    lockedAt: input.decision === 'accepted' ? now : undefined,
    updatedAt: now,
  });
  deps.audit.append({
    actorUserId: input.actor.userId,
    actorRole: input.actor.role,
    action: input.decision === 'accepted' ? 'evidenceAccept' : 'evidenceReject',
    entityType: 'evidence',
    entityId: input.evidenceId,
    evidenceId: input.evidenceId,
    eventId: record.eventId,
    beforeHash: record.sha256,
    afterHash: record.sha256,
    commandId: input.commandId,
    result: 'ok',
  });
  return updated;
}

export interface SupersedeEvidenceInput {
  commandId: string;
  actor: Actor;
  /** The accepted evidence being corrected. */
  supersedesEvidenceId: string;
  /** The corrected artifact, staged in temporary storage. */
  replacement: Omit<FinalizeEvidenceInput, 'commandId' | 'actor' | 'supersedesEvidenceId'>;
}

export interface SupersedeResult {
  newEvidence: FinalizeEvidenceResult;
  supersededRecord: DriveFirstEvidenceRecord;
}

/**
 * Correct accepted evidence by creating a NEW evidence version. The prior
 * record and its Drive file are preserved; only its status becomes
 * "superseded". Never edits the accepted artifact in place.
 */
export async function supersedeEvidence(
  deps: FinalizeDeps & ReviewDeps,
  input: SupersedeEvidenceInput,
): Promise<SupersedeResult> {
  assertReviewer(input.actor);
  const prior = await deps.metadata.get(input.supersedesEvidenceId);
  if (!prior) throw new ReviewError('not_found', `evidence ${input.supersedesEvidenceId} not found.`);
  if (prior.status !== 'accepted') {
    throw new ReviewError('invalid_state', 'only accepted evidence is superseded; resubmit rejected evidence instead.');
  }

  const newEvidence = await finalizeEvidence(deps, {
    ...input.replacement,
    commandId: input.commandId,
    actor: input.actor,
    supersedesEvidenceId: input.supersedesEvidenceId,
  });
  const supersededRecord = await deps.metadata.update(input.supersedesEvidenceId, {
    status: 'superseded',
    updatedAt: deps.now(),
  });
  deps.audit.append({
    actorUserId: input.actor.userId,
    actorRole: input.actor.role,
    action: 'evidenceSupersede',
    entityType: 'evidence',
    entityId: input.supersedesEvidenceId,
    evidenceId: newEvidence.evidenceId,
    eventId: prior.eventId,
    beforeHash: prior.sha256,
    afterHash: newEvidence.sha256,
    commandId: input.commandId,
    result: 'ok',
  });
  return { newEvidence, supersededRecord };
}
