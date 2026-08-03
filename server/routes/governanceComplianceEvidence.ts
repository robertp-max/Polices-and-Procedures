import { Router } from 'express';
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

governanceComplianceEvidenceRouter.get('/', (_req, res) => {
  res.json({
    connected: false,
    records: [],
    notice:
      'Preview only - the official Governing Body compliance evidence repository is not connected.',
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

  // The boundary is live, but this repository has no connected immutable
  // evidence store. Fail closed instead of minting a local "official" record.
  res.status(503).json({
    error: {
      code: 'OFFICIAL_EVIDENCE_REPOSITORY_DISCONNECTED',
      message:
        'Preview only - official completion cannot be recorded because the immutable evidence repository is not connected.',
    },
  });
});
