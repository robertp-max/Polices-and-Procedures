// Given a learner's (or group's) selections, determines which of the 14
// Governing Body workflows were properly activated, which were triggered
// without sound authority (unsupported), and which required workflows were
// never touched. Pure — no knowledge of scoring, only of workflow activation.

import type { AttemptSelections, CasePack, DecisionNode, GvWorkflowId } from './caseTypes';
import { ALL_GV_WORKFLOW_IDS } from './caseTypes';

export interface WorkflowActivationResult {
  /** Workflows engaged by a sound (non-critical, non-overreach, evidence-eligible) decision. */
  activated: GvWorkflowId[];
  /** Workflows engaged by an unsound decision — the workflow fired without proper authority. */
  unsupportedTriggered: GvWorkflowId[];
  /** Required workflows (casePack.requiredWorkflows) that were never activated at all. */
  missingRequired: GvWorkflowId[];
  /** Full 14-workflow coverage map for this attempt (true = activated soundly somewhere in the attempt). */
  coverage: Record<GvWorkflowId, boolean>;
}

function isAnswered(node: DecisionNode, selection: AttemptSelections['nodeSelections'][string] | undefined): boolean {
  if (!selection) return false;
  if (node.options) return Boolean(selection.selectedOptionIds && selection.selectedOptionIds.length > 0);
  return selection.action !== undefined;
}

function isSound(node: DecisionNode, selection: AttemptSelections['nodeSelections'][string] | undefined): boolean {
  if (!node.options) return true; // structured kinds: correctness is scored elsewhere, not gating activation soundness
  const chosenIds = new Set(selection?.selectedOptionIds ?? []);
  const chosen = node.options.filter((o) => chosenIds.has(o.id));
  if (chosen.some((o) => o.criticalFailure || o.overreach)) return false;
  return chosen.some((o) => o.correct);
}

export function computeWorkflowActivation(casePack: CasePack, selections: AttemptSelections): WorkflowActivationResult {
  const activatedSet = new Set<GvWorkflowId>();
  const unsupportedSet = new Set<GvWorkflowId>();

  for (const node of casePack.decisionNodes) {
    const selection = selections.nodeSelections[node.id];
    if (!isAnswered(node, selection)) continue;
    const target = isSound(node, selection) ? activatedSet : unsupportedSet;
    node.workflowIds.forEach((w) => target.add(w));
  }

  const missingRequired = casePack.requiredWorkflows.filter((w) => !activatedSet.has(w));
  const coverage = Object.fromEntries(
    ALL_GV_WORKFLOW_IDS.map((w) => [w, activatedSet.has(w)]),
  ) as Record<GvWorkflowId, boolean>;

  return {
    activated: [...activatedSet],
    unsupportedTriggered: [...unsupportedSet],
    missingRequired,
    coverage,
  };
}
