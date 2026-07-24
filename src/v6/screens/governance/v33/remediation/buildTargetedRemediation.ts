// Pure selection logic for guided True/False remediation (§6).
//
// Given the concept ids a learner missed on their primary attempt, build a
// deterministic 8–12 item guided set targeted at those concepts (topped up
// with other governance concepts only if the miss set is too narrow to reach
// the floor), plus the single final changed-facts transfer prompt drawn from
// among the assigned items. Deterministic per seedKey so a given learner +
// assignment + attempt sees a reproducible, auditable set — same contract as
// assessmentUtils.deterministicShuffle/pickForm used elsewhere in this engine.

import { deterministicShuffle, pickForm } from '../assessments/assessmentUtils';
import {
  GUIDED_ITEMS,
  TRANSFER_PROMPTS,
  type GuidedTrueFalseItem,
  type RemediationConceptId,
  type TransferPrompt,
} from './guidedRemediationBank';

const MIN_ITEMS = 8;
const MAX_ITEMS = 12;

export interface TargetedRemediationSet {
  /** 8–12 items, deterministically ordered, targeted at the missed concepts. */
  items: GuidedTrueFalseItem[];
  /** The one changed-facts transfer check, drawn from an assigned item. */
  transferPrompt: TransferPrompt;
}

function isKnownConcept(id: string): id is RemediationConceptId {
  return GUIDED_ITEMS.some((item) => item.conceptId === id);
}

/**
 * Pure: no randomness beyond the deterministic seed, no I/O, no React.
 * `missedConceptIds` may contain unknown/legacy ids — those are ignored so a
 * caller can pass whatever concept tags the primary engine used without this
 * module needing to validate them first.
 */
export function buildTargetedRemediation(
  missedConceptIds: readonly string[],
  seedKey: string,
): TargetedRemediationSet {
  const knownMissed = [...new Set(missedConceptIds)].filter(isKnownConcept);
  const allConcepts = [...new Set(GUIDED_ITEMS.map((item) => item.conceptId))];
  const conceptPool = knownMissed.length > 0 ? knownMissed : allConcepts;

  const targeted = GUIDED_ITEMS.filter((item) => conceptPool.includes(item.conceptId));
  const filler = GUIDED_ITEMS.filter((item) => !conceptPool.includes(item.conceptId));

  const shuffledTargeted = deterministicShuffle(targeted, `${seedKey}:targeted`);
  const shuffledFiller = deterministicShuffle(filler, `${seedKey}:filler`);

  let items = shuffledTargeted.slice(0, MAX_ITEMS);
  if (items.length < MIN_ITEMS) {
    items = [...items, ...shuffledFiller].slice(0, Math.max(MIN_ITEMS, items.length));
  }
  // Final safety floor/ceiling in case the bank itself is smaller than MIN_ITEMS.
  items = items.slice(0, MAX_ITEMS);

  const transferSource = items[pickForm(items.length, `${seedKey}:transfer`)];
  const transferPrompt =
    TRANSFER_PROMPTS.find((prompt) => prompt.id === transferSource?.transferPromptRef) ?? TRANSFER_PROMPTS[0];

  return { items, transferPrompt };
}
