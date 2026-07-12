import type { PacketFinding } from '@/policy/packets/contracts';

export interface FindingModelIssue {
  field: keyof PacketFinding;
  reason: string;
}

export interface FindingModelValidation {
  valid: boolean;
  issues: FindingModelIssue[];
}

const REQUIRED_TEXT_FIELDS = [
  'findingId',
  'category',
  'description',
] as const satisfies readonly (keyof PacketFinding)[];

const REQUIRED_ARRAY_FIELDS = [
  'evidence',
  'sourceRecordIds',
  'sourceFormIds',
  'relatedWorkflowTriggerEvaluationIds',
  'attachmentReferences',
] as const satisfies readonly (keyof PacketFinding)[];

function isNonEmptyText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function copyTextArray(value: string[]): string[] {
  return value.map((item) => item);
}

export function validatePacketFinding(finding: PacketFinding): FindingModelValidation {
  const issues: FindingModelIssue[] = [];

  for (const field of REQUIRED_TEXT_FIELDS) {
    if (!isNonEmptyText(finding[field])) {
      issues.push({ field, reason: 'Required finding text is missing or empty.' });
    }
  }

  for (const field of REQUIRED_ARRAY_FIELDS) {
    if (!Array.isArray(finding[field])) {
      issues.push({ field, reason: 'Required finding collection is missing.' });
    }
  }

  if (finding.evidence.length === 0) {
    issues.push({ field: 'evidence', reason: 'Finding evidence is required.' });
  }

  if (finding.sourceRecordIds.length === 0 && finding.sourceFormIds.length === 0) {
    issues.push({
      field: 'sourceRecordIds',
      reason: 'At least one source record or source form must be referenced.',
    });
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function createPacketFinding(input: PacketFinding): PacketFinding {
  const validation = validatePacketFinding(input);
  if (!validation.valid) {
    const summary = validation.issues
      .map((issue) => `${String(issue.field)}: ${issue.reason}`)
      .join('; ');
    throw new Error(`Invalid FR-011 finding model: ${summary}`);
  }

  return {
    findingId: input.findingId.trim(),
    category: input.category.trim(),
    description: input.description.trim(),
    evidence: copyTextArray(input.evidence),
    sourceRecordIds: copyTextArray(input.sourceRecordIds),
    sourceFormIds: copyTextArray(input.sourceFormIds),
    materiality: input.materiality,
    severity: input.severity,
    scope: input.scope,
    recurrence: input.recurrence,
    currentState: input.currentState,
    priorPeriodRelationship: input.priorPeriodRelationship,
    riskType: input.riskType,
    recommendedDecision: input.recommendedDecision,
    requiredHumanReviewer: input.requiredHumanReviewer,
    relatedWorkflowTriggerEvaluationIds: copyTextArray(
      input.relatedWorkflowTriggerEvaluationIds,
    ),
    attachmentReferences: copyTextArray(input.attachmentReferences),
  };
}
