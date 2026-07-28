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
import type { ComplianceEvidenceRecord } from './complianceTypes';

const DRAFT_PREFIX = 'care-indeed:gb:compliance:draft:';

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

export function readDraft(assignmentId: string): ComplianceDraft | null {
  if (typeof window === 'undefined') return null;
  return safeParse<ComplianceDraft>(window.localStorage.getItem(DRAFT_PREFIX + assignmentId));
}

export function writeDraft(draft: ComplianceDraft): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(DRAFT_PREFIX + draft.assignmentId, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(assignmentId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(DRAFT_PREFIX + assignmentId);
  } catch {
    /* ignore */
  }
}

export function hasLocalDraft(assignmentId: string): boolean {
  return readDraft(assignmentId) !== null;
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

/**
 * Attempt an official completion save. Only a successful save (from a connected
 * service) yields an authoritative record; the local draft is cleared on success.
 * On failure the draft is preserved and nothing is marked complete.
 */
export async function commitEvidence(
  assignmentId: string,
  input: EvidenceSaveInput,
): Promise<EvidenceSaveResult> {
  // Identity guard: the local-demo preview identity can never mint an official
  // record, regardless of which evidence service is connected.
  if (isLocalDemoLearnerId(input.learnerId)) {
    return {
      ok: false,
      reason: 'rejected',
      message:
        'Official evidence requires an authenticated user. The local-demo preview identity cannot record official completion.',
    };
  }
  const result = await getComplianceEvidenceService().save(input);
  if (result.ok) {
    officialSnapshot = [...officialSnapshot.filter((r) => r.evidenceId !== result.record.evidenceId), result.record];
    clearDraft(assignmentId);
    emit();
  }
  return result;
}
