// Local, NON-AUTHORITATIVE draft/resume store + official-evidence cache.
//
// localStorage here holds only unfinished attempt drafts so a learner can
// resume exactly where they left off. It is explicitly NOT the compliance
// record: a draft (even a "submitted" one) never counts as completion.
// The authoritative record comes from the evidence service (see
// complianceEvidenceAdapter.ts) and is mirrored into an in-memory snapshot.

import {
  getComplianceEvidenceService,
  type EvidenceSaveInput,
  type EvidenceSaveResult,
} from './complianceEvidenceAdapter';
import { isLocalDemoLearnerId } from './complianceIdentity';
import {
  PRIVILEGED_EVIDENCE_REJECTION,
  isPrivilegedAccessMode,
  type TabletopAccessMode,
} from './accessMode';
import type { ComplianceEvidenceRecord } from './complianceTypes';

// Draft keys are LEARNER-SCOPED:
//   care-indeed:gb:compliance:draft:{learnerId}:{assignmentId}
// On a shared browser this keeps user B from inheriting user A's resume state.
// The historical unscoped key (prefix + assignmentId) is NEVER adopted into a
// learner's namespace — it can only be ignored or purged (see
// `purgeLegacyUnscopedDrafts`). Silently migrating it would hand one person's
// in-progress attempt to whoever logs in next.
const DRAFT_PREFIX = 'care-indeed:gb:compliance:draft:';

export function draftKey(learnerId: string, assignmentId: string): string {
  return `${DRAFT_PREFIX}${learnerId}:${assignmentId}`;
}

/** Unfinished, resumable attempt state. Not authoritative. */
export interface ComplianceDraft {
  assignmentId: string;
  /** Opaque per-assignment resume payload (stage index, answers-in-progress, etc). */
  resume: Record<string, unknown>;
  /** Local attempt bookkeeping so the UI can show "attempt N in progress". */
  attemptNumber: number;
  progressPercent: number;
  /** A locally-submitted attempt awaiting official evidence save. NOT completion. */
  submittedLocally: boolean;
  updatedAt: string;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Read learner A's draft. Never falls back to an unscoped/legacy blob. */
export function readDraft(learnerId: string, assignmentId: string): ComplianceDraft | null {
  if (typeof window === 'undefined') return null;
  if (!learnerId) return null;
  const draft = safeParse<ComplianceDraft>(window.localStorage.getItem(draftKey(learnerId, assignmentId)));
  if (!draft || draft.assignmentId !== assignmentId) return null;
  return draft;
}

export function writeDraft(learnerId: string, draft: ComplianceDraft): boolean {
  if (typeof window === 'undefined') return false;
  if (!learnerId) return false;
  try {
    window.localStorage.setItem(draftKey(learnerId, draft.assignmentId), JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(learnerId: string, assignmentId: string): void {
  if (typeof window === 'undefined') return;
  if (!learnerId) return;
  try {
    window.localStorage.removeItem(draftKey(learnerId, assignmentId));
  } catch {
    /* ignore */
  }
}

export function hasLocalDraft(learnerId: string, assignmentId: string): boolean {
  return readDraft(learnerId, assignmentId) !== null;
}

/**
 * Remove pre-scoping, unscoped draft keys. Purge only — a legacy blob is never
 * adopted as any learner's draft.
 */
export function purgeLegacyUnscopedDrafts(assignmentIds: readonly string[]): void {
  if (typeof window === 'undefined') return;
  for (const assignmentId of assignmentIds) {
    try {
      window.localStorage.removeItem(DRAFT_PREFIX + assignmentId);
    } catch {
      /* ignore */
    }
  }
}

// ---- Official evidence snapshot -------------------------------------------

let officialSnapshot: ComplianceEvidenceRecord[] = [];
const listeners = new Set<() => void>();

/** Synchronous snapshot of official records for render-time reads. */
export function getOfficialEvidence(): readonly ComplianceEvidenceRecord[] {
  return officialSnapshot;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(): void {
  listeners.forEach((l) => l());
}

/** Refresh the official-evidence snapshot from the (possibly disconnected) service. */
export async function refreshOfficialEvidence(learnerId: string): Promise<void> {
  const records = await getComplianceEvidenceService().list(learnerId);
  officialSnapshot = records;
  emit();
}

export interface CommitEvidenceContext {
  /**
   * The AUTHENTICATED session subject performing this save (from useAuth, not
   * from the payload). The write is rejected unless the submitted learnerId is
   * this subject (or, for facilitated group sessions, is namespaced under it as
   * `${subject}:${participantId}`). A connected evidence service MUST re-verify
   * this server-side from the session token — a caller-supplied identity is
   * never trusted merely because the client passed it through correctly.
   */
  authenticatedSubjectId: string;
  /**
   * The access tier the attempt was produced under. A PRIVILEGED tier
   * (`superadmin` / `uat_reviewer`) is preview access: the write is refused as
   * official completion. Omitted/`official` behaves exactly as before, so this
   * only ever adds a rejection — it never widens an existing allowance.
   */
  accessMode?: TabletopAccessMode;
}

/**
 * Attempt an official completion save. Only a successful save (from a connected
 * service) yields an authoritative record; the local draft is cleared on success.
 * On failure the draft is preserved and nothing is marked complete.
 */
export async function commitEvidence(
  assignmentId: string,
  input: EvidenceSaveInput,
  ctx: CommitEvidenceContext,
): Promise<EvidenceSaveResult> {
  // Identity guards (client side; the connected service re-verifies from the
  // session token server-side):
  // 1. The local-demo preview identity can never mint an official record.
  if (isLocalDemoLearnerId(input.learnerId) || isLocalDemoLearnerId(ctx.authenticatedSubjectId)) {
    return {
      ok: false,
      reason: 'rejected',
      message:
        'Official evidence requires an authenticated user. The local-demo preview identity cannot record official completion.',
    };
  }
  // 2. A privileged preview tier (Super Admin / UAT Reviewer) can never mint
  //    official completion, whether the tier arrives on the session context or
  //    is stamped on the record itself.
  if (isPrivilegedAccessMode(ctx.accessMode) || isPrivilegedAccessMode(input.privilegedAccessMode)) {
    return { ok: false, reason: 'rejected', message: PRIVILEGED_EVIDENCE_REJECTION };
  }
  // 3. The submitted learner must BE the authenticated subject (or a group
  //    participant namespaced under it).
  const boundToSubject =
    input.learnerId === ctx.authenticatedSubjectId ||
    input.learnerId.startsWith(`${ctx.authenticatedSubjectId}:`);
  if (!boundToSubject) {
    return {
      ok: false,
      reason: 'rejected',
      message: 'Official evidence must be submitted under the authenticated user’s own identity.',
    };
  }
  const result = await getComplianceEvidenceService().save(input);
  if (result.ok) {
    officialSnapshot = [...officialSnapshot.filter((r) => r.evidenceId !== result.record.evidenceId), result.record];
    clearDraft(input.learnerId, assignmentId);
    emit();
  }
  return result;
}
