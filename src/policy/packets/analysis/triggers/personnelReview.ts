import type {
  PacketFinding,
  WorkflowTriggerEvaluation,
} from '@/policy/packets/contracts';

export const PERSONNEL_REVIEW_THRESHOLD_MET = 'Personnel-review threshold met' as const;
export const RESTRICTED_PERSONNEL_REVIEW_CONFIDENTIALITY =
  'restricted-personnel' as const;

export interface PersonnelReviewSignal {
  signalId: string;
  findingId: string;
  staffMemberId: string | null;
  category: string;
  policyReference: string | null;
  thresholdMet: boolean;
  rationale: string;
  restricted: boolean;
}

export interface PersonnelReviewAggregationInput {
  findings: PacketFinding[];
  evaluations: WorkflowTriggerEvaluation[];
  signals: PersonnelReviewSignal[];
}

export interface PersonnelReviewSummary {
  statement: typeof PERSONNEL_REVIEW_THRESHOLD_MET | null;
  thresholdMetCount: number;
  findingIds: string[];
  workflowEvaluationIds: string[];
  confidentiality: typeof RESTRICTED_PERSONNEL_REVIEW_CONFIDENTIALITY | null;
  rationale: string;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function isPersonnelEvaluation(evaluation: WorkflowTriggerEvaluation): boolean {
  return (
    evaluation.canonicalWorkflowId !== null &&
    evaluation.canonicalWorkflowId.startsWith('HR-WF-') &&
    evaluation.decisionState !== 'NOT TRIGGERED' &&
    evaluation.decisionState !== 'WORKFLOW UNRESOLVED'
  );
}

export function aggregatePersonnelReviewThresholds(
  input: PersonnelReviewAggregationInput,
): PersonnelReviewSummary {
  const thresholdSignals = input.signals.filter((signal) => signal.thresholdMet);
  const personnelEvaluations = input.evaluations.filter(isPersonnelEvaluation);
  const findingIds = unique([
    ...thresholdSignals.map((signal) => signal.findingId),
    ...personnelEvaluations.map((evaluation) => evaluation.findingId),
  ]);
  const restricted =
    thresholdSignals.some((signal) => signal.restricted) || personnelEvaluations.length > 0;
  const thresholdMetCount = thresholdSignals.length + personnelEvaluations.length;
  const knownFindingCount = input.findings.filter((finding) =>
    findingIds.includes(finding.findingId),
  ).length;

  return {
    statement: thresholdMetCount > 0 ? PERSONNEL_REVIEW_THRESHOLD_MET : null,
    thresholdMetCount,
    findingIds,
    workflowEvaluationIds: personnelEvaluations.map((evaluation) => evaluation.evaluationId),
    confidentiality: restricted ? RESTRICTED_PERSONNEL_REVIEW_CONFIDENTIALITY : null,
    rationale:
      thresholdMetCount > 0
        ? `Personnel-review threshold met for ${String(knownFindingCount)} finding(s); restricted personnel handling required.`
        : 'No personnel-review threshold met.',
  };
}

export function containsDisciplineImposedLanguage(text: string): boolean {
  return /\bDiscipline imposed\b/.test(text);
}
