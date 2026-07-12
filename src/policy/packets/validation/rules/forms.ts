import type { PacketValidationFinding, ValidationSeverity } from '@/policy/packets/contracts';

import type { RuleContext } from '../validatePacket';

export function validateForms(context: RuleContext): PacketValidationFinding[] {
  const findings: PacketValidationFinding[] = [];
  const report = context.sourceUtilization;

  if (report !== null) {
    report.expectedButMissing.forEach((missing, index) => {
      findings.push(finding({
        id: `form-source-missing-${slug(missing.formId)}-${index + 1}`,
        severity: 'blocker',
        code: 'missing-required-source-form',
        path: `sourceUtilization.expectedButMissing.${index}`,
        message: `Missing required source form "${missing.formId}" for source "${missing.sourceId}" (${missing.purpose}).`,
        remediation: 'Attach the required source form or document the disclosed exception before approval or lock.',
        relatedFormId: missing.formId,
      }));
    });

    report.conflicts.forEach((conflict, index) => {
      findings.push(finding({
        id: `form-source-conflict-${slug(conflict.conflictId)}-${index + 1}`,
        severity: 'blocker',
        code: 'material-source-conflict',
        path: `sourceUtilization.conflicts.${index}`,
        message: `Material source conflict "${conflict.conflictId}": ${conflict.reason}`,
        remediation: 'Reconcile the conflicting source forms before approval or lock.',
        relatedFormId: conflict.formIds[0] ?? null,
      }));
    });

    report.sourcesAndFormsUsed.forEach((sourceForm, index) => {
      if (sourceForm.validationStatus === 'Conflicted — reconciliation required') {
        findings.push(finding({
          id: `form-source-validation-conflicted-${slug(sourceForm.formId)}-${index + 1}`,
          severity: 'blocker',
          code: 'material-source-conflict',
          path: `sourceUtilization.sourcesAndFormsUsed.${index}.validationStatus`,
          message: `Material source conflict: form "${sourceForm.formId}" is marked "Conflicted — reconciliation required".`,
          remediation: 'Complete source reconciliation before the form can support packet lock.',
          relatedFormId: sourceForm.formId,
        }));
      }

      if (isUnknownNotRecovered(sourceForm.validationStatus)) {
        findings.push(finding({
          id: `form-source-validation-unknown-${slug(sourceForm.formId)}-${index + 1}`,
          severity: 'warning',
          code: 'source-form-not-recovered',
          path: `sourceUtilization.sourcesAndFormsUsed.${index}.validationStatus`,
          message: `Source form "${sourceForm.formId}" is not recovered and must remain disclosed as "${sourceForm.validationStatus}".`,
          remediation: 'Acknowledge the unrecovered source limitation or recover the source form before lock.',
          relatedFormId: sourceForm.formId,
        }));
      }

      if (sourceForm.attachment === null) {
        findings.push(finding({
          id: `form-source-attachment-missing-${slug(sourceForm.formId)}-${index + 1}`,
          severity: 'warning',
          code: 'source-form-attachment-missing',
          path: `sourceUtilization.sourcesAndFormsUsed.${index}.attachment`,
          message: `Source form "${sourceForm.formId}" is used in analysis but has no attached artifact pointer.`,
          remediation: 'Attach the source form artifact or acknowledge the attachment limitation before lock.',
          relatedFormId: sourceForm.formId,
        }));
      }
    });
  }

  const availableFormIds = collectAvailableFormIds(context);
  context.requiredFormIds.forEach((requiredFormId, index) => {
    if (!availableFormIds.has(requiredFormId)) {
      findings.push(finding({
        id: `form-required-missing-${slug(requiredFormId)}-${index + 1}`,
        severity: 'blocker',
        code: 'missing-required-source-form',
        path: `requiredFormIds.${index}`,
        message: `Missing required source form "${requiredFormId}".`,
        remediation: 'Attach, generate, or disclose an exception for the required source form before lock.',
        relatedFormId: requiredFormId,
      }));
    }
  });

  context.workflowEvaluations.forEach((evaluation, evaluationIndex) => {
    evaluation.requiredFormIds.forEach((requiredFormId) => {
      if (!availableFormIds.has(requiredFormId) && !evaluation.sourceFormIds.includes(requiredFormId)) {
        findings.push(finding({
          id: `form-workflow-required-missing-${slug(evaluation.evaluationId)}-${slug(requiredFormId)}`,
          severity: 'blocker',
          code: 'missing-required-source-form',
          path: `workflowEvaluations.${evaluationIndex}.requiredFormIds`,
          message: `Missing required source form "${requiredFormId}" for workflow evaluation "${evaluation.evaluationId}".`,
          remediation: 'Attach the workflow-required form or block the workflow with a disclosed exception.',
          relatedFormId: requiredFormId,
        }));
      }
    });
  });

  return findings;
}

function collectAvailableFormIds(context: RuleContext): Set<string> {
  const formIds = new Set<string>();
  context.sourceUtilization?.sourcesAndFormsUsed.forEach((sourceForm) => formIds.add(sourceForm.formId));
  context.instance?.attachmentInstances.forEach((attachment) => {
    if (attachment.formInstanceId !== null) formIds.add(attachment.formInstanceId);
    formIds.add(attachment.attachmentTypeId);
  });
  context.workflowEvaluations.forEach((evaluation) => {
    evaluation.sourceFormIds.forEach((formId) => formIds.add(formId));
  });
  return formIds;
}

function finding(args: {
  id: string;
  severity: ValidationSeverity;
  code: string;
  path: string;
  message: string;
  remediation: string;
  relatedFormId: string | null;
}): PacketValidationFinding {
  return {
    findingId: args.id,
    severity: args.severity,
    code: args.code,
    path: args.path,
    message: args.message,
    remediation: args.remediation,
    requiresAcknowledgment: args.severity === 'warning',
    acknowledgedAt: null,
    acknowledgedBy: null,
    relatedModuleId: null,
    relatedFormId: args.relatedFormId,
    relatedWorkflowId: null,
  };
}

function isUnknownNotRecovered(status: string): boolean {
  return status === 'Unknown — not recovered' || status === 'UNKNOWN — NOT RECOVERED';
}

function slug(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return normalized.length > 0 ? normalized : 'unknown';
}
