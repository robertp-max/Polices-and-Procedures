import { describe, expect, it } from 'vitest';
import type {
  PacketInstance,
  PacketSignerTask,
  PacketValidationFinding,
  PacketValidationResult,
} from '@/policy/packets/contracts';
import {
  ADMINISTRATOR_DON_DUAL_CAPACITY_RULE,
  DEFAULT_SIGNATURE_POLICY,
  QAPI_QUARTERLY_SIGNATURE_POLICY,
  type DualCapacityAttestationRecord,
  type SignaturePolicy,
} from '@/policy/packets/registries/signaturePolicies';
import { deriveApprovalReadinessModel } from './ApprovalReadiness';
import { deriveSignerConfirmationModel } from './SignerConfirmation';

function packet(overrides: Partial<PacketInstance> = {}): PacketInstance {
  return {
    packetInstanceId: 'packet-instance-1',
    packetId: 'QAPI-2026-Q2',
    packetVersion: 3,
    agencyId: 'agency-1',
    eventFamilyId: 'QAPI-quarterly',
    eventInstanceId: 'event-qapi-q2',
    archetypeId: 'qapi-quarterly',
    archetypeVersion: '1.0.0',
    packetTemplateId: 'qapi-template',
    subtype: null,
    workflowId: 'qapi-workflow',
    workflowInstanceId: 'workflow-q2',
    reportingPeriodStart: '2026-04-01',
    reportingPeriodEnd: '2026-06-30',
    dataThroughDate: '2026-06-30',
    status: 'READY_FOR_APPROVAL',
    moduleInstances: [],
    attachmentInstances: [],
    blockerIds: [],
    warningIds: [],
    approvalIds: [],
    signatureIds: [],
    evidenceManifestId: 'evidence-manifest',
    auditChronologyId: 'audit-chronology',
    driveFolderUrl: 'drive://qapi-q2',
    finalArtifactUrl: null,
    createdAt: '2026-07-01T00:00:00.000Z',
    createdBy: 'author-1',
    updatedAt: '2026-07-02T00:00:00.000Z',
    certifiedAt: null,
    lockedAt: null,
    contentHash: 'sha256-content',
    supersedesPacketInstanceId: null,
    supersededByPacketInstanceId: null,
    sourceClassification: 'production',
    ...overrides,
  };
}

function finding(overrides: Partial<PacketValidationFinding> = {}): PacketValidationFinding {
  return {
    findingId: 'finding-1',
    severity: 'blocker',
    code: 'missing-required-form',
    path: 'forms.qapi-attestation',
    message: 'Required attestation is missing.',
    remediation: 'Attach the completed attestation before approval.',
    requiresAcknowledgment: false,
    acknowledgedAt: null,
    acknowledgedBy: null,
    relatedModuleId: null,
    relatedFormId: 'qapi-attestation',
    relatedWorkflowId: null,
    ...overrides,
  };
}

function validation(overrides: Partial<PacketValidationResult> = {}): PacketValidationResult {
  const blocker = finding();
  return {
    packetInstanceId: 'packet-instance-1',
    packetVersion: 3,
    validatedAt: '2026-07-03T00:00:00.000Z',
    findings: [blocker],
    counts: { blocker: 1, warning: 0, advisory: 0 },
    lockEligible: false,
    approvalEligible: false,
    unacknowledgedWarningIds: [],
    unresolvedBlockerIds: [blocker.findingId],
    ...overrides,
  };
}

function signerTask(overrides: Partial<PacketSignerTask> = {}): PacketSignerTask {
  return {
    signerTaskId: 'signer-task-1',
    envelopeId: 'envelope-1',
    requiredCapacity: 'Administrator',
    signerUserId: 'user-admin-don',
    signerName: 'Alex Admin',
    signerEmail: 'alex.admin@example.test',
    signerRole: 'Administrator / Clinical Manager',
    authorityVerified: true,
    order: 1,
    required: true,
    dualCapacityRuleId: null,
    dualCapacities: null,
    status: 'PREPARED',
    dueDate: '2026-07-20',
    expiresAt: '2026-08-01',
    signedAt: null,
    declinedAt: null,
    declineReason: null,
    reminderCount: 0,
    attachmentAccessGranted: true,
    confidentialityAcknowledged: true,
    ...overrides,
  };
}

const matchingDualRecord: DualCapacityAttestationRecord = {
  dualCapacities: ['Administrator', 'Clinical Manager'],
  attestationEvidencePresent: true,
  dualCapacityRuleId: ADMINISTRATOR_DON_DUAL_CAPACITY_RULE.ruleId,
};

const approvedDualCapacityPolicy: SignaturePolicy = {
  ...QAPI_QUARTERLY_SIGNATURE_POLICY,
  allowedDualCapacitySignatures: QAPI_QUARTERLY_SIGNATURE_POLICY.allowedDualCapacitySignatures.map((rule) => ({
    ...rule,
    approvalStatus: 'approved' as const,
  })),
};

describe('Approval readiness review', () => {
  it('blocks approval actions when a validation blocker is present', () => {
    const model = deriveApprovalReadinessModel({
      packet: packet(),
      validation: validation(),
      approvalPolicy: null,
      signaturePolicy: null,
    });

    expect(model.approvalState).toBe('blocked');
    expect(model.blockers).toEqual(['missing-required-form: Required attestation is missing.']);
    expect(model.actions.find((action) => action.id === 'approve')?.enabled).toBe(false);
    expect(
      model.actions.find((action) => action.id === 'approve-with-documented-exception')?.enabled,
    ).toBe(false);
  });
});

describe('Signer confirmation dual-capacity enforcement', () => {
  it('blocks signer confirmation when reminder confirmation is not recorded', () => {
    const model = deriveSignerConfirmationModel({
      signaturePolicy: DEFAULT_SIGNATURE_POLICY,
      signerTasks: [
        signerTask({
          signerTaskId: 'signer-task-authorized-approver',
          requiredCapacity: 'Authorized Approver',
          signerRole: 'Authorized Approver',
          reminderCount: Number.NaN,
        }),
      ],
    });

    expect(model.confirmationReady).toBe(false);
    expect(model.rows[0]?.reminders).toBe('unknown');
    expect(model.blockers).toContain('Confirm reminders for Authorized Approver.');
  });

  it('allows one signer for two capacities only when the registry rule permits and both capacities are recorded', () => {
    const dualTask = signerTask({
      signerTaskId: 'signer-task-admin-don',
      requiredCapacity: 'Administrator',
      dualCapacityRuleId: ADMINISTRATOR_DON_DUAL_CAPACITY_RULE.ruleId,
      dualCapacities: ['Administrator', 'Clinical Manager'],
    });
    const chairTask = signerTask({
      signerTaskId: 'signer-task-chair',
      requiredCapacity: 'QAPI Chair',
      signerUserId: 'user-chair',
      signerName: 'Quinn Chair',
      signerEmail: 'quinn.chair@example.test',
      signerRole: 'QAPI Chair',
      order: 3,
    });

    const deniedByRegistry = deriveSignerConfirmationModel({
      signaturePolicy: QAPI_QUARTERLY_SIGNATURE_POLICY,
      signerTasks: [dualTask, chairTask],
      dualCapacityRecords: { [dualTask.signerTaskId]: matchingDualRecord },
    });
    expect(deniedByRegistry.confirmationReady).toBe(false);
    expect(deniedByRegistry.rows.find((row) => row.requiredCapacity === 'Clinical Manager')?.dualCapacityDecision).toBe('deny');
    expect(deniedByRegistry.blockers.join(' ')).toContain('explicit approved dual-capacity rule');

    const missingRecordedCapacity = deriveSignerConfirmationModel({
      signaturePolicy: approvedDualCapacityPolicy,
      signerTasks: [dualTask, chairTask],
      dualCapacityRecords: {
        [dualTask.signerTaskId]: {
          ...matchingDualRecord,
          dualCapacities: ['Administrator', 'QAPI Chair'],
        },
      },
    });
    expect(missingRecordedCapacity.confirmationReady).toBe(false);
    expect(missingRecordedCapacity.rows.find((row) => row.requiredCapacity === 'Administrator')?.dualCapacityDecision).toBe('deny');

    const allowed = deriveSignerConfirmationModel({
      signaturePolicy: approvedDualCapacityPolicy,
      signerTasks: [dualTask, chairTask],
      dualCapacityRecords: { [dualTask.signerTaskId]: matchingDualRecord },
    });
    expect(allowed.confirmationReady).toBe(true);
    expect(allowed.rows.find((row) => row.requiredCapacity === 'Administrator')?.dualCapacityDecision).toBe('allow');
    expect(allowed.rows.find((row) => row.requiredCapacity === 'Clinical Manager')?.signer).toBe('Alex Admin');
  });
});
