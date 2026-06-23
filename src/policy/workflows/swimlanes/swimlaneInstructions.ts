type TaskPurpose =
  | 'regulatory_trigger'
  | 'document_review'
  | 'approval'
  | 'evidence_lock'
  | 'supporting_evidence'
  | 'general';

function splitInstructionText(text?: string) {
  if (!text?.trim()) return [];
  return text
    .split(/\r?\n+/)
    .map(line => line.replace(/^\s*\d+[).\s-]+/, '').trim())
    .filter(Boolean);
}

function uniqueLines(lines: Array<string | undefined | null>) {
  const seen = new Set<string>();
  const values: string[] = [];
  for (const line of lines) {
    const trimmed = line?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    values.push(trimmed);
  }
  return values;
}

export function inferSwimlaneTaskPurpose(title: string, description?: string): TaskPurpose {
  const text = `${title} ${description ?? ''}`.toLowerCase();
  if (/lock|archive|package/.test(text)) return 'evidence_lock';
  if (/approve|approval|attest|sign/.test(text)) return 'approval';
  if (/review|validate|audit|check/.test(text)) return 'document_review';
  if (/evidence|artifact|upload|attach|support/.test(text)) return 'supporting_evidence';
  if (/open|trigger|assign|prepare|confirm|owner/.test(text)) return 'regulatory_trigger';
  return 'general';
}

function fallbackInstructions(taskPurpose: TaskPurpose) {
  if (taskPurpose === 'regulatory_trigger') {
    return [
      'Review the regulatory requirement, confirm the assigned owner, and verify whether required forms, evidence, or signatures are needed for this event task.',
    ];
  }
  if (taskPurpose === 'document_review') {
    return [
      'Review the required documentation for this event task. Confirm that all required forms are completed and any required supporting evidence is linked before moving to review.',
    ];
  }
  if (taskPurpose === 'approval') {
    return [
      'Review the completed form/evidence package and confirm whether approval, signature, or escalation is required.',
    ];
  }
  if (taskPurpose === 'evidence_lock') {
    return [
      'Confirm all required forms, signatures, supporting documentation, and artifact links are complete before locking the evidence package.',
    ];
  }
  if (taskPurpose === 'supporting_evidence') {
    return [
      'Review the required evidence for this task, confirm every required artifact resolves, and document any missing items honestly before proceeding.',
    ];
  }
  return [
    'Review this task, confirm the owner and dependencies, and verify whether required forms, evidence, signatures, or approvals are complete before moving it forward.',
  ];
}

export function buildSwimlaneInstructions(input: {
  title: string;
  description?: string;
  explicitInstructions?: string;
  formInstructions?: string[];
  evidenceDescriptions?: string[];
  auditPurpose?: string;
  regulatoryDriver?: string;
  taskPurpose?: TaskPurpose;
  finalEvidenceLock?: boolean;
}) {
  if (input.finalEvidenceLock) {
    return [
      'Verify all required form instances exist.',
      'Verify required forms are completed.',
      'Verify required signatures and reviewer paths are complete.',
      'Verify required supporting documentation subtasks are uploaded or validated.',
      'Verify artifact links resolve.',
      'Lock the package only when all required items are complete.',
      'If blocked, list the missing items before closing this task.',
    ];
  }

  const taskPurpose = input.taskPurpose ?? inferSwimlaneTaskPurpose(input.title, input.description);
  const explicit = splitInstructionText(input.explicitInstructions);
  if (explicit.length > 0) return explicit;

  const lines = uniqueLines([
    input.description,
    ...(input.formInstructions ?? []),
    ...(input.evidenceDescriptions?.length
      ? [`Required evidence to verify: ${input.evidenceDescriptions.join('; ')}.`]
      : []),
    input.regulatoryDriver ? `Regulatory driver: ${input.regulatoryDriver}` : undefined,
    input.auditPurpose ? `Audit purpose: ${input.auditPurpose}` : undefined,
  ]);

  return lines.length > 0 ? lines : fallbackInstructions(taskPurpose);
}
