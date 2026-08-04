import { Router } from 'express';
import { createHash } from 'node:crypto';
import type { Actor } from '../identity/session.js';

const DEE_UAT_REVIEWER_SUBJECT_IDS = new Set(['usr-deeb-admin']);
const DEE_UAT_REVIEWER_EMAILS = new Set(['deeb@careindeed.com']);

export interface GovernanceEvidenceWrite {
  learnerId?: unknown;
  privilegedAccessMode?: unknown;
}

export type GovernanceEvidenceBoundaryVerdict =
  | { allowed: true; actorSubjectId: string }
  | { allowed: false; status: 401 | 403; code: string; message: string };

function normalized(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

export function isDeeUatReviewerActor(actor: Actor | null | undefined): boolean {
  if (!actor || actor.type !== 'user') return false;
  const subjectId = String(actor.user_id ?? '').trim();
  if (DEE_UAT_REVIEWER_SUBJECT_IDS.has(subjectId)) return true;
  return DEE_UAT_REVIEWER_EMAILS.has(normalized(actor.email));
}

/**
 * Server-side official-evidence boundary. Identity comes only from the
 * authenticated actor attached by requireApiAuth(); payload role/mode strings
 * can make a request less privileged, never more privileged.
 */
export function validateGovernanceEvidenceWrite(
  actor: Actor | null | undefined,
  input: GovernanceEvidenceWrite,
): GovernanceEvidenceBoundaryVerdict {
  if (!actor || actor.type !== 'user' || !actor.user_id) {
    return {
      allowed: false,
      status: 401,
      code: 'AUTHENTICATED_USER_REQUIRED',
      message: 'Official Governing Body evidence requires an authenticated user.',
    };
  }

  if (
    isDeeUatReviewerActor(actor) ||
    input.privilegedAccessMode === 'uat_reviewer' ||
    input.privilegedAccessMode === 'superadmin'
  ) {
    return {
      allowed: false,
      status: 403,
      code: 'PRIVILEGED_REVIEW_EVIDENCE_REJECTED',
      message:
        'UAT reviewer and privileged preview attempts cannot create official Governing Body completion evidence.',
    };
  }

  const learnerId = String(input.learnerId ?? '').trim();
  const actorSubjectId = actor.user_id.trim();
  if (
    learnerId !== actorSubjectId &&
    !learnerId.startsWith(`${actorSubjectId}:`)
  ) {
    return {
      allowed: false,
      status: 403,
      code: 'CROSS_USER_EVIDENCE_REJECTED',
      message: 'Official evidence must be bound to the authenticated learner.',
    };
  }

  return { allowed: true, actorSubjectId };
}

export const governanceComplianceEvidenceRouter = Router();

type LocalGovernanceEvidenceRecord = Record<string, unknown> & {
  evidenceId: string;
  assignmentId: string;
  learnerId: string;
  integrityHash: string;
};

const localEvidenceRecordsByLearner = new Map<string, LocalGovernanceEvidenceRecord[]>();

function evidenceDigest(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

governanceComplianceEvidenceRouter.get('/', (req, res) => {
  const actorSubjectId = req.actor?.type === 'user' ? String(req.actor.user_id ?? '').trim() : '';
  const requestedLearnerId = String(req.query.learnerId ?? actorSubjectId).trim();
  const learnerId = requestedLearnerId || actorSubjectId;
  if (!actorSubjectId || (learnerId !== actorSubjectId && !learnerId.startsWith(`${actorSubjectId}:`))) {
    res.status(403).json({
      error: {
        code: 'CROSS_USER_EVIDENCE_REJECTED',
        message: 'Official evidence must be bound to the authenticated learner.',
      },
    });
    return;
  }
  res.json({
    connected: true,
    records: localEvidenceRecordsByLearner.get(learnerId) ?? [],
    notice:
      'LMS-backed Governing Body completion evidence is connected for this authenticated session.',
  });
});

governanceComplianceEvidenceRouter.post('/:assignmentId', (req, res) => {
  const verdict = validateGovernanceEvidenceWrite(req.actor, req.body ?? {});
  if (!verdict.allowed) {
    res.status(verdict.status).json({
      error: { code: verdict.code, message: verdict.message },
    });
    return;
  }

  const assignmentId = String(req.params.assignmentId ?? '').trim();
  const learnerId = String(req.body?.learnerId ?? '').trim();
  const completedAt = String(req.body?.completedAt ?? new Date().toISOString());
  const baseRecord = {
    ...(req.body ?? {}),
    schemaVersion: Number(req.body?.schemaVersion ?? 2),
    assignmentId,
    learnerId,
    completedAt,
  };
  const record: LocalGovernanceEvidenceRecord = {
    ...baseRecord,
    evidenceId: String(req.body?.evidenceId ?? `gb-ev:${assignmentId}:${learnerId}:${Date.now()}`),
    integrityHash: String(req.body?.integrityHash ?? evidenceDigest(baseRecord)),
  };
  const existing = localEvidenceRecordsByLearner.get(learnerId) ?? [];
  localEvidenceRecordsByLearner.set(learnerId, [
    ...existing.filter((candidate) => candidate.assignmentId !== assignmentId),
    record,
  ]);
  res.status(201).json({ record });
});
