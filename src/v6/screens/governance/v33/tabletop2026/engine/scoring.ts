// Pure scorer: turns a set of per-node diagnostics (+ the surveyor/transfer
// mini-assessment) into the 1000-point AttemptScore. No I/O, no randomness.
//
// Dimension attribution is derived from InteractionKind so CasePack authors
// never have to hand-tag a node with a scoring dimension — the mapping below
// is the single source of truth and is exhaustive over InteractionKind.

import type {
  AttemptScore,
  AttemptSelections,
  CasePack,
  InteractionKind,
  ScoreDimensionKey,
  TabletopDiagnostic,
} from './caseTypes';
import { SCORE_DIMENSION_WEIGHTS, passScoreForQuarter } from './caseTypes';

/** Every InteractionKind maps to exactly one scoring dimension. */
export function dimensionForKind(kind: InteractionKind): ScoreDimensionKey {
  switch (kind) {
    case 'classify_evidence':
    case 'evidence_chain':
    case 'reconcile_conflict':
      return 'evidence_integrity';
    case 'quorum_calc':
    case 'session_classification':
    case 'board_vs_management':
      return 'meeting_legality';
    case 'denominator':
    case 'eligibility':
    case 'proceed_decision':
    case 'disposition':
    case 'risk_rank':
      return 'qapi_judgment';
    case 'workflow_select':
    case 'forms_select':
      return 'workflow_authority';
    case 'motion_builder':
    case 'owner_assign':
    case 'due_date':
    case 'effectiveness':
    case 'return_date':
      return 'decision_proportionality';
    case 'public_minutes':
    case 'confidential_minutes':
      return 'records_forms';
    case 'surveyor':
    case 'transfer':
    case 'multiple_choice':
      return 'surveyor_transfer';
    default: {
      // Exhaustiveness guard — a new InteractionKind must be mapped above.
      const neverKind: never = kind;
      throw new Error(`dimensionForKind: unmapped InteractionKind ${String(neverKind)}`);
    }
  }
}

function zeroDimensions(): Record<ScoreDimensionKey, number> {
  return {
    evidence_integrity: 0,
    meeting_legality: 0,
    qapi_judgment: 0,
    workflow_authority: 0,
    decision_proportionality: 0,
    records_forms: 0,
    surveyor_transfer: 0,
  };
}

function scoreSurveyorTransfer(casePack: CasePack, selections: AttemptSelections): number {
  const items = casePack.surveyor.length + casePack.transfers.length;
  if (items === 0) return 0;
  const perItem = SCORE_DIMENSION_WEIGHTS.surveyor_transfer / items;
  let earned = 0;
  for (const q of casePack.surveyor) {
    if (selections.surveyorSelections[q.id] === q.correctId) earned += perItem;
  }
  for (const t of casePack.transfers) {
    if (selections.transferSelections[t.id] === t.correctId) earned += perItem;
  }
  return earned;
}

/**
 * Aggregate diagnostics (one per required DecisionNode, see engine/diagnostics.ts)
 * plus the separate surveyor/transfer mini-assessment into the final AttemptScore.
 * A single critical_failure result fails the attempt outright regardless of total.
 */
export function scoreAttempt(
  casePack: CasePack,
  selections: AttemptSelections,
  diagnostics: readonly TabletopDiagnostic[],
): AttemptScore {
  const nodesById = new Map(casePack.decisionNodes.map((n) => [n.id, n]));
  const byDimension = zeroDimensions();
  const criticalErrors: string[] = [];

  for (const diag of diagnostics) {
    const node = nodesById.get(diag.nodeId);
    if (!node) continue; // diagnostic for a node not in this pack — ignore defensively
    const dimension = dimensionForKind(node.kind);
    byDimension[dimension] += diag.pointsEarned;
    if (diag.result === 'critical_failure') {
      criticalErrors.push(`${diag.nodeId}: ${node.title} — critical failure`);
    }
  }

  byDimension.surveyor_transfer += scoreSurveyorTransfer(casePack, selections);

  // Clamp each dimension to its weight so imbalanced case content (more
  // authored points than the dimension budget) never inflates the total.
  (Object.keys(byDimension) as ScoreDimensionKey[]).forEach((k) => {
    byDimension[k] = Math.min(byDimension[k], SCORE_DIMENSION_WEIGHTS[k]);
  });

  const total = Math.round((Object.keys(byDimension) as ScoreDimensionKey[]).reduce((sum, k) => sum + byDimension[k], 0));
  const passed = criticalErrors.length === 0 && total >= passScoreForQuarter(casePack.quarter);

  return { total, byDimension, criticalErrors, passed };
}
