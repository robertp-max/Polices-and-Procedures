import { ApiError } from '../errors.js';
import type {
  SourceAuthorityMetadata,
  SourceImpact,
  SourcePosture,
} from './contracts.js';

const IMPACT_RANK: Record<SourceImpact, number> = {
  informational: 0,
  review_required: 1,
  approval_blocked: 2,
  execution_blocked: 3,
  certification_blocked: 4,
};

export interface SourceGateResult {
  posture: SourcePosture;
  impact: SourceImpact;
  blocked: boolean;
  reasons: string[];
  sourceMetadataIds: string[];
}

export function validateSourceMetadata(metadata: SourceAuthorityMetadata): string[] {
  const problems: string[] = [];
  if (!metadata.sourceSystem.trim()) problems.push('source system is missing');
  if (!metadata.sourceRecordId.trim()) problems.push('source record id is missing');
  if (!metadata.sourceVersion) problems.push('source version is missing');
  if (!metadata.ownerId) problems.push('source owner is missing');
  if (!metadata.asOf) problems.push('as-of timestamp is missing');
  if (!metadata.dataThrough) problems.push('data-through timestamp is missing');
  if (!metadata.contentSha256 || !/^[a-f0-9]{64}$/i.test(metadata.contentSha256)) {
    problems.push('verified content SHA-256 is missing');
  }
  if (metadata.approvalStatus !== 'approved') problems.push(`approval status is ${metadata.approvalStatus}`);
  if (metadata.freshness !== 'current') problems.push(`freshness is ${metadata.freshness}`);
  if (metadata.holdReason) problems.push(`hold: ${metadata.holdReason}`);
  if (metadata.conflictRecordIds.length > 0) problems.push('source conflicts remain unresolved');
  if (metadata.supersededById || metadata.posture === 'superseded') problems.push('source is superseded');
  return problems;
}

function highestImpact(records: SourceAuthorityMetadata[]): SourceImpact {
  return records.reduce<SourceImpact>((current, record) =>
    IMPACT_RANK[record.impact] > IMPACT_RANK[current] ? record.impact : current,
  'informational');
}

function aggregatePosture(records: SourceAuthorityMetadata[]): SourcePosture {
  const order: SourcePosture[] = [
    'unavailable',
    'held',
    'conflicted',
    'superseded',
    'synthetic_uat',
    'draft',
    'review_required',
    'live_verified',
  ];
  for (const posture of order) {
    if (records.some((record) => record.posture === posture)) return posture;
  }
  return 'unavailable';
}

export function evaluateSourceGate(
  records: SourceAuthorityMetadata[],
  target: 'review' | 'approval' | 'execution' | 'certification',
): SourceGateResult {
  if (records.length === 0) {
    return {
      posture: 'unavailable',
      impact: 'certification_blocked',
      blocked: true,
      reasons: ['No canonical source authority metadata is connected.'],
      sourceMetadataIds: [],
    };
  }
  const reasons = records.flatMap((record) =>
    validateSourceMetadata(record).map((problem) => `${record.sourceSystem}/${record.sourceRecordId}: ${problem}`),
  );
  const impact = highestImpact(records);
  const threshold: Record<typeof target, number> = {
    review: IMPACT_RANK.execution_blocked,
    approval: IMPACT_RANK.approval_blocked,
    execution: IMPACT_RANK.execution_blocked,
    certification: IMPACT_RANK.certification_blocked,
  };
  return {
    posture: aggregatePosture(records),
    impact,
    blocked: IMPACT_RANK[impact] >= threshold[target] || (target !== 'review' && reasons.length > 0),
    reasons,
    sourceMetadataIds: records.map((record) => record.id),
  };
}
export function requireSourceGate(
  records: SourceAuthorityMetadata[],
  target: 'review' | 'approval' | 'execution' | 'certification',
): SourceGateResult {
  const result = evaluateSourceGate(records, target);
  if (result.blocked) {
    throw new ApiError('validation_error', `Source authority blocks ${target}.`, 409, {
      posture: result.posture,
      impact: result.impact,
      reasons: result.reasons,
    });
  }
  return result;
}

/**
 * Explicit metadata for the attached Q2 packet used by the corrective QA
 * vertical slice. It is intentionally synthetic/review-only and cannot pass an
 * approval, execution, or certification gate.
 */
export function q2SyntheticUatMetadata(input: {
  id: string;
  organizationId: string;
  actorId: string;
  now: string;
  contentSha256: string;
}): SourceAuthorityMetadata {
  return {
    id: input.id,
    organizationId: input.organizationId,
    version: 1,
    schemaVersion: 2,
    createdAt: input.now,
    createdBy: input.actorId,
    updatedAt: input.now,
    updatedBy: input.actorId,
    sourceSystem: 'QAPI Packet Studio reference attachment',
    sourceRecordId: 'QAPI-QUARTERLY-Q2-2026',
    sourceVersion: '1.0 DRAFT - REQUIRES REVIEW',
    effectiveAt: null,
    approvalStatus: 'pending',
    ownerId: null,
    asOf: '2026-06-30T23:59:59-07:00',
    dataThrough: '2026-06-30',
    freshnessEvaluatedAt: input.now,
    freshness: 'unknown',
    posture: 'synthetic_uat',
    holdReason: 'SYNTHETIC UAT DATA — NO REAL PHI — NOT FOR PRODUCTION; packet states NOT LOCKABLE.',
    conflictRecordIds: [],
    supersedesId: null,
    supersededById: null,
    impact: 'certification_blocked',
    contentSha256: input.contentSha256,
    accessClass: 'patient_safety_restricted',
    retentionClass: 'standard',
    legalHold: false,
  };
}
