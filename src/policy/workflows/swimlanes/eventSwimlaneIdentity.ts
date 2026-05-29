function normalizeSegment(value: string | number | undefined | null): string {
  const text = String(value ?? '')
    .trim()
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toUpperCase();

  return text || 'UNSPECIFIED';
}

function padStepOrder(stepOrder?: number) {
  return stepOrder != null ? `STEP-${String(stepOrder).padStart(2, '0')}` : 'STEP-UNSPECIFIED';
}

export function buildCanonicalEventSwimlaneTaskId(input: {
  eventId: string;
  workflowId?: string;
  sourceStepId?: string;
  stepOrder?: number;
  taskPurpose?: string;
}) {
  const workflowKey = normalizeSegment(input.workflowId ?? 'EVENT');
  const sourceKey = input.sourceStepId
    ? normalizeSegment(input.sourceStepId)
    : input.taskPurpose
      ? normalizeSegment(input.taskPurpose)
      : padStepOrder(input.stepOrder);

  return `TASK-${normalizeSegment(input.eventId)}-${workflowKey}-${sourceKey}`;
}

export function buildCanonicalEventSwimlaneNodeId(input: {
  eventId?: string;
  workflowId?: string;
  sourceStepId?: string;
  stepOrder?: number;
  taskPurpose?: string;
}) {
  const scopeKey = normalizeSegment(input.eventId ?? input.workflowId ?? 'SWIMLANE');
  const workflowKey = normalizeSegment(input.workflowId ?? 'GENERAL');
  const sourceKey = input.sourceStepId
    ? normalizeSegment(input.sourceStepId)
    : input.taskPurpose
      ? normalizeSegment(input.taskPurpose)
      : padStepOrder(input.stepOrder);

  return `NODE-${scopeKey}-${workflowKey}-${sourceKey}`;
}

export function buildSwimlaneSupportTaskId(parentTaskId: string, evidenceRequirementSlugOrIndex: string | number) {
  return `${parentTaskId}-DOC-${normalizeSegment(evidenceRequirementSlugOrIndex)}`;
}
