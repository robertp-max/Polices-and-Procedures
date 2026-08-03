// Deterministic per-attempt variation of a CasePack.
//
// SCOPE NOTE (read before extending): this module performs the structural
// variation an *engine* can safely do without corrupting authored
// correctness (grading is defined by DecisionNode.options/modelAction, which
// this module never rewrites): it reorders exhibits, deterministically
// drops a seeded subset of decoy exhibits (varying the decoy mix), shifts
// the exhibit timeline and its cutoff anchors by a uniform day offset, and reorders the
// independent injects / surveyor / transfer arrays. It intentionally does
// NOT invent new denominators, motion clauses, or option text — those are
// content decisions that belong to case authors. Authors who need literal
// alternate-form content (different numbers, different clause wording)
// should author multiple forms and select between them with `pickForm`
// from ../../assessments/assessmentUtils, using `attemptSeedKey` below as
// the seed so the choice is deterministic per learner+assignment+attempt.

import { deterministicShuffle, hashString, seededRandom } from '../../assessments/assessmentUtils';
import type { CasePack, Exhibit, Inject, SurveyorQuestion, TransferQuestion } from './caseTypes';

/** Stable seed key shared by every variation primitive for one attempt. */
export function attemptSeedKey(casePackId: string, learnerId: string, assignmentId: string, attemptNumber: number): string {
  return `${casePackId}:${learnerId}:${assignmentId}:attempt-${attemptNumber}`;
}

function shiftIsoDate(iso: string, dayOffset: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso; // not a parseable date — leave narrative text untouched
  d.setUTCDate(d.getUTCDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

function variantExhibits(
  exhibits: readonly Exhibit[],
  seedKey: string,
  dayOffset: number,
): Exhibit[] {
  const nonDecoy = exhibits.filter((e) => e.relevance !== 'decoy');
  const decoys = exhibits.filter((e) => e.relevance === 'decoy');

  // Deterministically keep between half and all of the decoys — varies the decoy mix per attempt
  // without ever touching decision-relevant/conflicting evidence.
  const shuffledDecoys = deterministicShuffle(decoys, `${seedKey}:decoys`);
  const keepCount = decoys.length === 0 ? 0 : Math.max(1, Math.ceil(decoys.length * (0.5 + seededRandom(hashString(`${seedKey}:decoy-count`))() * 0.5)));
  const keptDecoys = shuffledDecoys.slice(0, keepCount);

  const combined = deterministicShuffle([...nonDecoy, ...keptDecoys], `${seedKey}:order`);
  return combined.map((e) => ({ ...e, asOfDate: shiftIsoDate(e.asOfDate, dayOffset) }));
}

function variantInjects(injects: readonly Inject[], seedKey: string): Inject[] {
  // Only reorder injects that have no release dependency — chained injects must keep their gate.
  const independent = injects.filter((i) => !i.releaseAfterNodeId);
  const dependent = injects.filter((i) => i.releaseAfterNodeId);
  const shuffledIndependent = deterministicShuffle(independent, `${seedKey}:injects`);
  return [...shuffledIndependent, ...dependent];
}

function variantSurveyor(items: readonly SurveyorQuestion[], seedKey: string): SurveyorQuestion[] {
  return deterministicShuffle(items, `${seedKey}:surveyor`);
}

function variantTransfers(items: readonly TransferQuestion[], seedKey: string): TransferQuestion[] {
  return deterministicShuffle(items, `${seedKey}:transfers`);
}

/**
 * Produce a deterministic per-attempt variant of a CasePack. Never mutates
 * the input; always returns a new CasePack object. Calling this twice with
 * the same arguments yields byte-identical output (pure function of the seed).
 */
export function variant(casePack: CasePack, learnerId: string, assignmentId: string, attemptNumber: number): CasePack {
  const seedKey = attemptSeedKey(casePack.id, learnerId, assignmentId, attemptNumber);
  const dayOffset = Math.floor(
    seededRandom(hashString(`${seedKey}:timeline`))() * 6,
  );
  return {
    ...casePack,
    sourceCutoff: shiftIsoDate(casePack.sourceCutoff, dayOffset),
    packetConflictGroups: casePack.packetConflictGroups.map((group) => ({
      ...group,
      sourceCutoff: shiftIsoDate(group.sourceCutoff, dayOffset),
    })),
    exhibits: variantExhibits(casePack.exhibits, seedKey, dayOffset),
    injects: variantInjects(casePack.injects, seedKey),
    surveyor: variantSurveyor(casePack.surveyor, seedKey),
    transfers: variantTransfers(casePack.transfers, seedKey),
    // decisionNodes intentionally left in authored order/content — round sequencing is narrative, not random.
  };
}
