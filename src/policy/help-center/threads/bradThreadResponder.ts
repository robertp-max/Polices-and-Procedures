/* ═══════════════════════════════════════════════════════════════════════════
   Brad thread responder (pure).
   ----------------------------------------------------------------------------
   Composes Brad's reply for a thread from VERIFIED sources only. Brad must never
   fabricate a citation: when no source is found it says so plainly and the
   thread is routed for human review. Brad also routes to human review whenever
   the question involves legal/compliance judgment, PHI/patient-specific facts,
   an approval/sign/submit action, or an unresolved app defect.

   Brad never approves, certifies, signs, submits, or alters compliance records —
   those limitations are attached to every reply.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { BradThreadResponseMeta, ThreadSourceReference, ThreadSuggestedAction } from './types';
import { scanForPhi } from './threadPhiGuard';

export const NO_VERIFIED_SOURCE = 'I do not have a verified source for that yet.';

export const BRAD_LIMITATIONS: string[] = [
  'Brad cannot approve, certify, sign, or submit anything.',
  'Brad cannot alter compliance records or bypass workflow, eCIgn, or event gates.',
  'Brad does not give patient-specific clinical advice in a help thread.',
];

export type ThreadAnswerStatus = 'answered' | 'needs_human_review' | 'needs_brad';

export type ThreadAnswerInput = {
  /** Latest user question in the thread. */
  question: string;
  /** Sources Brad located in the app for this question (verified — may be empty). */
  candidateSources: ThreadSourceReference[];
  /** Existing solved threads Brad can point to. */
  relatedThreadActions?: ThreadSuggestedAction[];
  /** Caller-detected signal that the matter needs a human (legal/compliance/defect). */
  forceHumanReview?: boolean;
  modelVersion?: string;
  /** Stable id for the produced response (caller supplies; keeps this pure). */
  responseId: string;
};

export type ThreadAnswerResult = {
  status: ThreadAnswerStatus;
  body: string;
  meta: BradThreadResponseMeta;
};

const HUMAN_REVIEW_PATTERNS =
  /\b(legal|lawsuit|attorney|compliance\s+violation|certif|sign(?:ature|ed|ing)?|approve|approval|submit|attest|sanction|penalt|breach|incident|sentinel|patient\s+safety|deficien|survey\s+citation|defect|broken|crash|data\s+loss)\b/i;

function detectHumanReview(question: string): boolean {
  if (HUMAN_REVIEW_PATTERNS.test(question)) return true;
  // Patient-specific / PHI content must always go to a human + secure workflow.
  if (scanForPhi(question).requiresSecureWorkflow) return true;
  return false;
}

/** Compose Brad's reply + decide the resulting thread status. Deterministic. */
export function composeThreadAnswer(input: ThreadAnswerInput): ThreadAnswerResult {
  const sources = input.candidateSources ?? [];
  const needsHuman = input.forceHumanReview || detectHumanReview(input.question);

  // 1) No verified source → never fabricate.
  if (sources.length === 0) {
    return {
      status: 'needs_human_review',
      body:
        `${NO_VERIFIED_SOURCE} I've flagged this thread for human review so a teammate ` +
        `can confirm the right guidance.`,
      meta: {
        responseId: input.responseId,
        modelVersion: input.modelVersion,
        sourceReferences: [],
        confidence: 'low',
        limitations: BRAD_LIMITATIONS,
        suggestedActions: input.relatedThreadActions,
      },
    };
  }

  // 2) Has sources but the matter needs human judgment → answer with sources,
  //    but mark for human review and say so.
  const confidence: BradThreadResponseMeta['confidence'] = needsHuman
    ? 'medium'
    : sources.length >= 2
      ? 'high'
      : 'medium';

  const sourceList = sources.map(s => `• ${s.title}`).join('\n');
  const lead = needsHuman
    ? 'Here is what the verified sources say. Because this involves judgment a human ' +
      'must confirm, I have flagged the thread for human review:'
    : 'Here is what I found in the verified sources:';

  return {
    status: needsHuman ? 'needs_human_review' : 'answered',
    body: `${lead}\n\n${sourceList}`,
    meta: {
      responseId: input.responseId,
      modelVersion: input.modelVersion,
      sourceReferences: sources,
      confidence,
      limitations: BRAD_LIMITATIONS,
      suggestedActions: input.relatedThreadActions,
    },
  };
}
