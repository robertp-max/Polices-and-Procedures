// Builds one TabletopDiagnostic per required DecisionNode — for EVERY node,
// whether the learner got it right or wrong, so the results screen always has
// the full "why" (evidence used/missed/misused, authority + workflow
// explanation, why alternatives fail, remediation). Pure over its inputs.

import type {
  AttemptSelections,
  CasePack,
  DecisionNode,
  DecisionOption,
  Exhibit,
  NodeSelection,
  TabletopDiagnostic,
} from './caseTypes';
import { buildTargetedRemediation } from '../data/remediationBank';

type Result = TabletopDiagnostic['result'];

function optionsById(node: DecisionNode): Map<string, DecisionOption> {
  return new Map((node.options ?? []).map((o) => [o.id, o]));
}

/** Structural equality good enough for grading structured/free-form actions (dates, counts, motion objects). */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== 'object') return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

/** Fraction of modelAction's own keys that the user's action matches (partial credit for structured kinds). */
function structuralOverlap(action: unknown, modelAction: unknown): number {
  if (deepEqual(action, modelAction)) return 1;
  if (
    action && modelAction &&
    typeof action === 'object' && typeof modelAction === 'object' &&
    !Array.isArray(action) && !Array.isArray(modelAction)
  ) {
    const modelObj = modelAction as Record<string, unknown>;
    const actionObj = action as Record<string, unknown>;
    const keys = Object.keys(modelObj);
    if (keys.length === 0) return 0;
    const matched = keys.filter((k) => deepEqual(actionObj[k], modelObj[k])).length;
    return matched / keys.length;
  }
  return 0;
}

interface GradeResult {
  result: Result;
  pointsEarned: number;
  chosenOptionIds: string[];
}

function gradeOptionBased(node: DecisionNode, selection: NodeSelection | undefined): GradeResult {
  const chosenIds = selection?.selectedOptionIds ?? [];
  const byId = optionsById(node);
  const chosen = chosenIds.map((id) => byId.get(id)).filter((o): o is DecisionOption => Boolean(o));

  if (chosenIds.length === 0) {
    return { result: 'incorrect', pointsEarned: 0, chosenOptionIds: [] };
  }
  if (chosen.some((o) => o.criticalFailure)) {
    return { result: 'critical_failure', pointsEarned: 0, chosenOptionIds: chosenIds };
  }
  if (chosen.some((o) => o.overreach)) {
    return { result: 'partial', pointsEarned: Math.round(node.pointsAvailable * 0.25), chosenOptionIds: chosenIds };
  }

  const correctIds = new Set((node.options ?? []).filter((o) => o.correct).map((o) => o.id));
  if (correctIds.size === 0) {
    return { result: 'incorrect', pointsEarned: 0, chosenOptionIds: chosenIds };
  }
  const chosenSet = new Set(chosenIds);
  const exactMatch = chosenSet.size === correctIds.size && [...correctIds].every((id) => chosenSet.has(id));
  if (exactMatch) {
    return { result: 'correct', pointsEarned: node.pointsAvailable, chosenOptionIds: chosenIds };
  }
  const overlap = [...correctIds].filter((id) => chosenSet.has(id)).length;
  if (overlap > 0) {
    return { result: 'partial', pointsEarned: Math.round(node.pointsAvailable * (overlap / correctIds.size)), chosenOptionIds: chosenIds };
  }
  return { result: 'incorrect', pointsEarned: 0, chosenOptionIds: chosenIds };
}

function gradeStructured(node: DecisionNode, selection: NodeSelection | undefined): GradeResult {
  if (selection?.action === undefined) {
    return { result: 'incorrect', pointsEarned: 0, chosenOptionIds: [] };
  }
  const overlap = structuralOverlap(selection.action, node.modelAction);
  if (overlap >= 1) return { result: 'correct', pointsEarned: node.pointsAvailable, chosenOptionIds: [] };
  if (overlap > 0) return { result: 'partial', pointsEarned: Math.round(node.pointsAvailable * overlap), chosenOptionIds: [] };
  return { result: 'incorrect', pointsEarned: 0, chosenOptionIds: [] };
}

function describeWorkflows(node: DecisionNode): string {
  if (node.workflowIds.length === 0) return 'This decision does not activate a tracked governance workflow.';
  return `This decision is authoritative for: ${node.workflowIds.join(', ')}.`;
}

function describeOutcome(result: Result, node: DecisionNode): string {
  switch (result) {
    case 'correct':
      return `The action matches the Board's authorized response: ${node.rationale}`;
    case 'partial':
      return `The action was directionally right but incomplete or overreaching — see the required action below. ${node.rationale}`;
    case 'incorrect':
      return `The action does not satisfy the authorized response for this matter. ${node.rationale}`;
    case 'critical_failure':
      return `The action selected is a critical governance failure — it would not withstand survey or legal review. ${node.rationale}`;
    default:
      return node.rationale;
  }
}

function immediateRemediationText(result: Result): string {
  switch (result) {
    case 'correct':
      return 'No remediation required.';
    case 'partial':
      return 'Review the full required action — evidence, authority, and forms must all align, not just the direction of the decision.';
    case 'incorrect':
      return 'Review the controlling policy and required evidence for this matter before re-attempting.';
    case 'critical_failure':
      return 'Stop and review immediately: this action would expose the agency to a survey citation, legal risk, or a patient-safety failure.';
    default:
      return '';
  }
}

/** Every DecisionNode in the pack produces a diagnostic, whether answered or not. */
export function buildDiagnostics(casePack: CasePack, selections: AttemptSelections): TabletopDiagnostic[] {
  const exhibitById = new Map<string, Exhibit>(casePack.exhibits.map((e) => [e.id, e]));

  return casePack.decisionNodes.map((node) => {
    const selection = selections.nodeSelections[node.id];
    const cited = selection?.evidenceCited ?? [];
    const required = node.requiredEvidenceIds;
    const evidenceMissed = required.filter((id) => !cited.includes(id));
    const evidenceMisused = cited.filter((id) => exhibitById.get(id)?.relevance === 'decoy');

    const graded = node.options ? gradeOptionBased(node, selection) : gradeStructured(node, selection);
    let { result, pointsEarned } = graded;

    // Missing required evidence caps an otherwise-correct answer at partial credit —
    // a right conclusion reached without citing the controlling record is not full credit.
    if (result === 'correct' && evidenceMissed.length > 0) {
      result = 'partial';
      const ratio = required.length > 0 ? (required.length - evidenceMissed.length) / required.length : 1;
      pointsEarned = Math.round(pointsEarned * Math.max(ratio, 0.25));
    }

    const userAction = node.options ? graded.chosenOptionIds : selection?.action ?? null;
    const missedCompetencyIds = result === 'correct' ? [] : node.competencyIds;
    const remediation = missedCompetencyIds.length > 0 ? buildTargetedRemediation(missedCompetencyIds) : { microLessonId: null, trueFalseItemIds: [] };

    const diagnostic: TabletopDiagnostic = {
      nodeId: node.id,
      period: casePack.quarter,
      competencyIds: node.competencyIds,
      workflowIds: node.workflowIds,
      userAction,
      modelAction: node.modelAction,
      result,
      pointsAvailable: node.pointsAvailable,
      pointsEarned,
      evidenceUsed: cited,
      evidenceRequired: required,
      evidenceMissed,
      evidenceMisused,
      authorityExplanation: node.rationale,
      workflowExplanation: describeWorkflows(node),
      formsRequired: node.formsRequired,
      deadlineExplanation: node.deadlineExplanation,
      whyUserActionSucceededOrFailed: describeOutcome(result, node),
      whyAlternativesFail: node.alternativesWhyFail,
      consequences: node.consequences,
      remediation: {
        immediate: immediateRemediationText(result),
        microLessonId: remediation.microLessonId,
        trueFalseItemIds: remediation.trueFalseItemIds,
        changedFactsPrompt: null,
      },
    };
    return diagnostic;
  });
}
