import {
  WORKFLOW_UNRESOLVED_BANNER,
  type PacketFinding,
  type WorkflowDecisionState,
  type WorkflowTriggerEvaluation,
} from '@/policy/packets/contracts';

export interface MaterialNonTriggerDecision {
  findingId: string;
  triggerRuleId: string;
  rationale: string;
  attachmentReferences: string[];
}

export interface TriggerRegisterRow {
  finding: string;
  triggerRule: string;
  workflowIdTitle: string;
  decisionState: WorkflowDecisionState;
  existingNew: 'Existing' | 'New' | 'Carry-forward' | 'None' | 'Unresolved';
  owner: string | null;
  approver: string[];
  dueDate: string | null;
  requiredForms: string[];
  dependenciesBlockers: string[];
  rationale: string;
  attachment: string[];
}

function workflowLabel(evaluation: WorkflowTriggerEvaluation): string {
  if (evaluation.canonicalWorkflowId === null || evaluation.canonicalWorkflowTitle === null) {
    return WORKFLOW_UNRESOLVED_BANNER;
  }
  return `${evaluation.canonicalWorkflowId} / ${evaluation.canonicalWorkflowTitle}`;
}

function existingNew(evaluation: WorkflowTriggerEvaluation): TriggerRegisterRow['existingNew'] {
  if (evaluation.decisionState === 'WORKFLOW UNRESOLVED') {
    return 'Unresolved';
  }
  if (evaluation.decisionState === 'CONTINUED FROM PRIOR PERIOD') {
    return 'Carry-forward';
  }
  if (evaluation.existingWorkflowInstanceId !== null) {
    return 'Existing';
  }
  if (evaluation.newWorkflowInstanceId !== null) {
    return 'New';
  }
  return 'None';
}

function findingLabel(finding: PacketFinding): string {
  return `${finding.findingId}: ${finding.category}`;
}

function isMaterialFinding(finding: PacketFinding): boolean {
  return (
    (finding.materiality !== null && finding.materiality.trim().length > 0) ||
    (finding.severity !== null && finding.severity.trim().length > 0) ||
    finding.recommendedDecision === 'Open CAP' ||
    finding.recommendedDecision === 'Initiate RCA' ||
    finding.recommendedDecision === 'New PIP' ||
    finding.recommendedDecision === 'Escalate to Governing Body'
  );
}

export function buildTriggerRegisterRows(
  findings: PacketFinding[],
  evaluations: WorkflowTriggerEvaluation[],
  materialNonTriggerDecisions: MaterialNonTriggerDecision[],
): TriggerRegisterRow[] {
  const findingsById = new Map(findings.map((finding) => [finding.findingId, finding]));
  const rows = evaluations.map((evaluation): TriggerRegisterRow => {
    const finding = findingsById.get(evaluation.findingId);
    return {
      finding: finding === undefined ? evaluation.findingId : findingLabel(finding),
      triggerRule: evaluation.triggerRuleId ?? 'Unspecified trigger rule',
      workflowIdTitle: workflowLabel(evaluation),
      decisionState: evaluation.decisionState,
      existingNew: existingNew(evaluation),
      owner: evaluation.ownerRole,
      approver: [...evaluation.approverRoles],
      dueDate: evaluation.dueDate,
      requiredForms: [...evaluation.requiredFormIds],
      dependenciesBlockers: [
        ...evaluation.dependencyWorkflowIds,
        ...evaluation.blockerIds,
      ],
      rationale: evaluation.decisionRationale,
      attachment: finding === undefined ? [] : [...finding.attachmentReferences],
    };
  });

  for (const decision of materialNonTriggerDecisions) {
    const finding = findingsById.get(decision.findingId);
    if (finding !== undefined && isMaterialFinding(finding)) {
      rows.push({
        finding: findingLabel(finding),
        triggerRule: decision.triggerRuleId,
        workflowIdTitle: 'No workflow activated',
        decisionState: 'NOT TRIGGERED',
        existingNew: 'None',
        owner: finding.requiredHumanReviewer,
        approver: [],
        dueDate: null,
        requiredForms: [],
        dependenciesBlockers: [],
        rationale: decision.rationale,
        attachment: [...decision.attachmentReferences],
      });
    }
  }

  return rows;
}
