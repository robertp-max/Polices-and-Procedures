import type { PacketSignerTask, PacketValidationFinding, ValidationSeverity } from '@/policy/packets/contracts';

import type { RuleContext } from '../validatePacket';

type UnknownRecord = Record<string, unknown>;

export function validateSigners(context: RuleContext): PacketValidationFinding[] {
  const findings: PacketValidationFinding[] = [];
  const signerTasks = context.envelopes.flatMap((envelope) => envelope.signerTasks);

  signerTasks.forEach((task, index) => {
    if (!task.required) return;
    if (missingSignerIdentity(task)) {
      findings.push(finding({
        id: `signer-missing-${slug(task.signerTaskId)}-${index + 1}`,
        severity: 'blocker',
        code: 'missing-signer-or-authority',
        path: `envelopes.signerTasks.${index}`,
        message: `Missing signer for required capacity "${task.requiredCapacity}".`,
        remediation: 'Assign and confirm the signer before approval can proceed to eCIgn.',
      }));
    }

    if (!task.authorityVerified) {
      findings.push(finding({
        id: `signer-authority-missing-${slug(task.signerTaskId)}-${index + 1}`,
        severity: 'blocker',
        code: 'missing-signer-or-authority',
        path: `envelopes.signerTasks.${index}.authorityVerified`,
        message: `Missing signer authority for required capacity "${task.requiredCapacity}".`,
        remediation: 'Verify signer authority for the required capacity before packet approval or lock.',
      }));
    }

    if (task.status === 'DECLINED' || task.status === 'EXPIRED' || task.status === 'FAILED') {
      findings.push(finding({
        id: `signer-task-not-usable-${slug(task.signerTaskId)}-${index + 1}`,
        severity: 'blocker',
        code: 'missing-signer-or-authority',
        path: `envelopes.signerTasks.${index}.status`,
        message: `Required signer task "${task.signerTaskId}" is "${task.status}" and cannot support lock.`,
        remediation: 'Void, replace, or resend the signer task with a valid signer record.',
      }));
    }
  });

  const representedCapacities = new Set(signerTasks.map((task) => normalize(task.requiredCapacity)));
  const payloadApproverRoles = context.qapiLockPacket === null ? collectPayloadApproverRoles(context) : new Set<string>();
  context.requiredSignerCapacities.forEach((capacity, index) => {
    const normalizedCapacity = normalize(capacity);
    if (!representedCapacities.has(normalizedCapacity) && !payloadApproverRoles.has(normalizedCapacity)) {
      findings.push(finding({
        id: `signer-required-capacity-missing-${slug(capacity)}-${index + 1}`,
        severity: 'blocker',
        code: 'missing-signer-or-authority',
        path: `requiredSignerCapacities.${index}`,
        message: `Missing signer or authority for required capacity "${capacity}".`,
        remediation: 'Add a signer task or confirmed approver record for the required capacity.',
      }));
    }
  });

  context.model.pagePlan?.forEach((page) => {
    page.contentBlocks.forEach((block, blockIndex) => {
      if (block.kind !== 'signature-block') return;
      if (!context.requiredSignerCapacities.some((capacity) => normalize(capacity) === normalize(block.capacity))) {
        return;
      }
      if (isMissing(block.signerName)) {
        findings.push(finding({
          id: `signature-block-missing-signer-${slug(page.pageId)}-${blockIndex + 1}`,
          severity: 'blocker',
          code: 'missing-signer-or-authority',
          path: `pagePlan.${page.pageNumber}.contentBlocks.${blockIndex}`,
          message: `Rendered signature block for required capacity "${block.capacity}" has no signer.`,
          remediation: 'Confirm the signer or remove the signature block until it is ready for eCIgn.',
        }));
      }
    });
  });

  if (context.qapiLockPacket === null) {
    validatePayloadApprovers(context).forEach((payloadFinding) => findings.push(payloadFinding));
  }

  return findings;
}

function validatePayloadApprovers(context: RuleContext): PacketValidationFinding[] {
  const findings: PacketValidationFinding[] = [];
  context.model.modules.forEach((module, moduleIndex) => {
    const payload = module.payload;
    if (!isRecord(payload) || !Array.isArray(payload.approvers)) return;
    payload.approvers.filter(isRecord).forEach((approver, approverIndex) => {
      const role = stringValue(approver.role) ?? 'unknown role';
      if (isMissing(stringValue(approver.name))) {
        findings.push(finding({
          id: `payload-approver-name-missing-${moduleIndex + 1}-${approverIndex + 1}`,
          severity: 'blocker',
          code: 'missing-signer-or-authority',
          path: `modules.${moduleIndex}.payload.approvers.${approverIndex}.name`,
          message: `Approver name is missing for role "${role}".`,
          remediation: 'Enter the actual approver name before approval readiness review.',
        }));
      }
      if (approver.authorityConfirmed !== true) {
        findings.push(finding({
          id: `payload-approver-authority-missing-${moduleIndex + 1}-${approverIndex + 1}`,
          severity: 'blocker',
          code: 'missing-signer-or-authority',
          path: `modules.${moduleIndex}.payload.approvers.${approverIndex}.authorityConfirmed`,
          message: `Signer authority is missing for role "${role}".`,
          remediation: 'Confirm signer authority before packet approval or lock.',
        }));
      }
    });
  });
  return findings;
}

function collectPayloadApproverRoles(context: RuleContext): Set<string> {
  const roles = new Set<string>();
  context.model.modules.forEach((module) => {
    const payload = module.payload;
    if (!isRecord(payload) || !Array.isArray(payload.approvers)) return;
    payload.approvers.filter(isRecord).forEach((approver) => {
      const role = stringValue(approver.role);
      if (role !== null) roles.add(normalize(role));
    });
  });
  return roles;
}

function missingSignerIdentity(task: PacketSignerTask): boolean {
  return isMissing(task.signerUserId) ||
    isMissing(task.signerName) ||
    isMissing(task.signerEmail) ||
    isMissing(task.signerRole);
}

function finding(args: {
  id: string;
  severity: ValidationSeverity;
  code: string;
  path: string;
  message: string;
  remediation: string;
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
    relatedFormId: null,
    relatedWorkflowId: null,
  };
}

function isMissing(value: string | null): boolean {
  const trimmed = (value ?? '').trim();
  return trimmed.length === 0 || trimmed === '—' || /^tbd$/i.test(trimmed);
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function slug(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return normalized.length > 0 ? normalized : 'unknown';
}
