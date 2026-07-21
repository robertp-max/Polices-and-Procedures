import { Router, type NextFunction, type Request, type Response } from 'express';
import { validatePacket } from '@/policy/packets/validation/validatePacket';
import type {
  PacketAuditActor,
  PacketLifecycleStatus,
  PacketModel,
  PacketSignerTask,
  PacketValidationFinding,
  PacketValidationResult,
} from '@/policy/packets/contracts';
import {
  DEFAULT_APPROVAL_POLICY,
  canApproveWithDocumentedException,
  getApprovalPolicy,
  type ApprovalPolicy,
  type ApprovalReadinessAction,
} from '@/policy/packets/registries/approvalPolicies';
import {
  DEFAULT_SIGNATURE_POLICY,
  getSignaturePolicy,
  resolveDualCapacityDecision,
  type DualCapacityAttestationRecord,
  type SignaturePolicy,
} from '@/policy/packets/registries/signaturePolicies';
import { normalizeEnvelopeStatus } from '../envelope/envelopeStatus.js';
import { ApiError } from '../../errors.js';
import { identityMiddleware } from '../../identity/middleware.js';
import { transitionPacket } from '../lifecycle.js';
import { userPacketActor } from '../auditEvents.js';
import {
  FileLocalPacketStore,
  ForbiddenFieldError,
  IllegalTransitionError,
  ImmutableIdentityError,
  LifecycleOwnedFieldError,
  LockedPacketError,
  PacketNotFoundError,
  StaleWriteError,
  type PacketMetadataStore,
  type PacketStoreDocument,
} from '../store.js';

type AsyncRoute = (req: Request<Record<string, string>>, res: Response, next: NextFunction) => Promise<void>;

type PacketActorRequest = Request & {
  session?: { authenticated?: boolean; correlation_id?: string };
  actor?: {
    type: 'user' | 'service' | 'system';
    user_id?: string;
    service_id?: string;
    display_name?: string;
    roles?: string[];
    attributes?: { access_classes?: string[] };
  };
};

export type PacketApprovalActionId =
  | 'return-for-correction'
  | 'approve'
  | 'approve-with-documented-exception'
  | 'reject'
  | 'proceed-to-signer-confirmation';

export interface PacketApprovalRouterOptions {
  store?: PacketMetadataStore;
}

interface PacketApprovalActionBody {
  expectedRevision?: number;
  revision?: number;
  reason?: string;
  exceptionReason?: string;
  documentedException?: string;
  approvalPolicyId?: string;
  signaturePolicyId?: string;
  packetModel?: unknown;
  validation?: unknown;
  signerTasks?: unknown;
  dualCapacityRecords?: unknown;
  envelopeStatus?: string;
}

interface StructuredBlocker {
  code: string;
  path: string;
  message: string;
  remediation: string;
}

interface SignerPolicyCheck {
  status: 'not provided' | 'validated' | 'blocked';
  policyId: string;
  blockers: readonly StructuredBlocker[];
}

interface SignerTaskMatch {
  task: PacketSignerTask;
  index: number;
  coveredByDualTask: boolean;
}

const ACTION_LABELS = {
  'return-for-correction': 'Return for correction',
  approve: 'Approve content',
  'approve-with-documented-exception': 'Approve with documented exception',
  reject: 'Reject',
  'proceed-to-signer-confirmation': 'Proceed to signer confirmation',
} as const satisfies Record<PacketApprovalActionId, ApprovalReadinessAction>;

const defaultStore = new FileLocalPacketStore();

function asyncH(fn: AsyncRoute) {
  return (req: Request<Record<string, string>>, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw structuredBlockerError('request_body_invalid', 'Request body must be a JSON object.');
  }
  return value as Record<string, unknown>;
}

function optionalTrimmedString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function expectedRevision(body: PacketApprovalActionBody): number {
  const value = body.expectedRevision ?? body.revision;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw structuredBlockerError(
      'expected_revision_required',
      'expectedRevision is required for packet approval actions.',
      'expectedRevision',
      428,
    );
  }
  return value;
}

function structuredBlockerError(
  code: string,
  message: string,
  path = 'body',
  status = 400,
): ApiError {
  return new ApiError('validation_error', message, status, {
    blockers: [{
      code,
      path,
      message,
      remediation: 'Correct the request and retry without changing missing values to defaults.',
    }],
  });
}

function requireActor(req: Request<Record<string, string>>): PacketAuditActor {
  const packetReq = req as PacketActorRequest;
  const actor = packetReq.actor;
  if (!packetReq.session?.authenticated || !actor) {
    throw new ApiError('auth_error', 'Authenticated user required.', 401);
  }
  if (actor.type === 'user' && actor.user_id) {
    return userPacketActor(actor.user_id, actor.roles?.[0] ?? null);
  }
  if (actor.type === 'service' && actor.service_id) {
    return {
      kind: 'integration',
      actorId: actor.service_id,
      actorRole: actor.roles?.[0] ?? null,
      onBehalfOf: null,
    };
  }
  throw new ApiError('auth_error', 'Authenticated user or service identity required.', 401);
}

function assertAgencyScope(req: Request<Record<string, string>>, agencyId: string): void {
  const packetReq = req as PacketActorRequest;
  const scopes = packetReq.actor?.attributes?.access_classes ?? [];
  if (scopes.length === 0) return;
  if (
    scopes.includes('packets:*') ||
    scopes.includes('agency:*') ||
    scopes.includes(`agency:${agencyId}`)
  ) {
    return;
  }
  throw new ApiError('permission_denied', 'Packet access is not scoped to this agency.', 403, {
    agencyId,
  });
}

async function getScopedPacket(
  store: PacketMetadataStore,
  req: Request<Record<string, string>>,
  packetInstanceId: string,
): Promise<PacketStoreDocument> {
  requireActor(req);
  const packet = await store.getById(packetInstanceId);
  if (!packet) throw new PacketNotFoundError(packetInstanceId);
  assertAgencyScope(req, packet.agencyId);
  return packet;
}

function validationFinding(input: {
  findingId: string;
  severity: 'blocker' | 'warning' | 'advisory';
  code: string;
  path: string;
  message: string;
  remediation: string;
}): PacketValidationFinding {
  return {
    findingId: input.findingId,
    severity: input.severity,
    code: input.code,
    path: input.path,
    message: input.message,
    remediation: input.remediation,
    requiresAcknowledgment: input.severity === 'warning',
    acknowledgedAt: null,
    acknowledgedBy: null,
    relatedModuleId: null,
    relatedFormId: null,
    relatedWorkflowId: null,
  };
}

function buildStoredValidation(packet: PacketStoreDocument): PacketValidationResult {
  const blockers = packet.blockerIds.map((blockerId, index) =>
    validationFinding({
      findingId: `blocker:${blockerId}`,
      severity: 'blocker',
      code: 'packet.blocker_unresolved',
      path: `blockerIds.${index}`,
      message: `Packet blocker remains unresolved: ${blockerId}.`,
      remediation: 'Resolve or formally disclose the blocker before approval.',
    }),
  );
  const warnings = packet.warningIds.map((warningId, index) =>
    validationFinding({
      findingId: `warning:${warningId}`,
      severity: 'warning',
      code: 'packet.warning_unacknowledged',
      path: `warningIds.${index}`,
      message: `Packet warning requires acknowledgment: ${warningId}.`,
      remediation: 'Acknowledge the warning or include it in the documented exception record.',
    }),
  );
  return {
    packetInstanceId: packet.packetInstanceId,
    packetVersion: packet.packetVersion,
    validatedAt: new Date().toISOString(),
    findings: [...blockers, ...warnings],
    counts: {
      blocker: blockers.length,
      warning: warnings.length,
      advisory: 0,
    },
    approvalEligible: blockers.length === 0,
    lockEligible: blockers.length === 0 && warnings.length === 0,
    unresolvedBlockerIds: blockers.map((finding) => finding.findingId),
    unacknowledgedWarningIds: warnings.map((finding) => finding.findingId),
  };
}

function isPacketValidationResult(value: unknown): value is PacketValidationResult {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.packetInstanceId === 'string' &&
    typeof record.packetVersion === 'number' &&
    typeof record.validatedAt === 'string' &&
    Array.isArray(record.findings) &&
    typeof record.counts === 'object' &&
    record.counts !== null &&
    typeof record.approvalEligible === 'boolean' &&
    typeof record.lockEligible === 'boolean' &&
    Array.isArray(record.unresolvedBlockerIds) &&
    Array.isArray(record.unacknowledgedWarningIds)
  );
}

function approvalValidation(
  packet: PacketStoreDocument,
  body: PacketApprovalActionBody,
): PacketValidationResult {
  if (body.validation !== undefined) {
    if (!isPacketValidationResult(body.validation)) {
      throw structuredBlockerError(
        'validation_result_invalid',
        'Field "validation" must be a PacketValidationResult.',
        'validation',
      );
    }
    return body.validation;
  }
  if (body.packetModel !== undefined) {
    if (!body.packetModel || typeof body.packetModel !== 'object' || Array.isArray(body.packetModel)) {
      throw structuredBlockerError(
        'packet_model_invalid',
        'Field "packetModel" must be a PacketModel object.',
        'packetModel',
      );
    }
    return validatePacket({
      model: body.packetModel as PacketModel,
      instance: packet,
    });
  }
  return buildStoredValidation(packet);
}

function validationBlockersError(validation: PacketValidationResult): ApiError {
  return new ApiError('validation_error', 'Packet has unresolved validation blockers.', 409, {
    blockers: validation.findings.filter((finding) => finding.severity === 'blocker'),
    validation,
  });
}

function approvalPolicy(body: PacketApprovalActionBody): ApprovalPolicy {
  const policyId = optionalTrimmedString(body.approvalPolicyId);
  if (policyId === undefined) return DEFAULT_APPROVAL_POLICY;
  const policy = getApprovalPolicy(policyId);
  if (!policy) {
    throw structuredBlockerError(
      'approval_policy_unknown',
      `Approval policy not found: ${policyId}.`,
      'approvalPolicyId',
    );
  }
  return policy;
}

function signaturePolicy(body: PacketApprovalActionBody): SignaturePolicy {
  const policyId = optionalTrimmedString(body.signaturePolicyId);
  if (policyId === undefined) return DEFAULT_SIGNATURE_POLICY;
  const policy = getSignaturePolicy(policyId);
  if (!policy) {
    throw structuredBlockerError(
      'signature_policy_unknown',
      `Signature policy not found: ${policyId}.`,
      'signaturePolicyId',
    );
  }
  return policy;
}

function readSignerTasks(value: unknown): readonly PacketSignerTask[] | null {
  if (value === undefined) return null;
  if (!Array.isArray(value)) {
    throw structuredBlockerError(
      'signer_tasks_invalid',
      'Field "signerTasks" must be an array of PacketSignerTask records.',
      'signerTasks',
    );
  }
  return value as PacketSignerTask[];
}

function dualCapacityRecordFromTask(task: PacketSignerTask): DualCapacityAttestationRecord | null {
  if (task.dualCapacities === null) return null;
  return {
    dualCapacities: task.dualCapacities,
    attestationEvidencePresent: task.dualCapacityRuleId !== null,
    dualCapacityRuleId: task.dualCapacityRuleId,
  };
}

function dualCapacityRecordFromUnknown(value: unknown): DualCapacityAttestationRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const capacities = record.dualCapacities;
  if (
    !Array.isArray(capacities) ||
    capacities.length !== 2 ||
    typeof capacities[0] !== 'string' ||
    typeof capacities[1] !== 'string' ||
    typeof record.attestationEvidencePresent !== 'boolean'
  ) {
    return null;
  }
  const ruleId = record.dualCapacityRuleId;
  return {
    dualCapacities: [capacities[0], capacities[1]],
    attestationEvidencePresent: record.attestationEvidencePresent,
    dualCapacityRuleId: typeof ruleId === 'string' ? ruleId : null,
  };
}

function readDualCapacityRecords(value: unknown): Readonly<Record<string, DualCapacityAttestationRecord>> {
  if (value === undefined) return {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw structuredBlockerError(
      'dual_capacity_records_invalid',
      'Field "dualCapacityRecords" must be an object keyed by signerTaskId.',
      'dualCapacityRecords',
    );
  }
  const out: Record<string, DualCapacityAttestationRecord> = {};
  for (const [key, raw] of Object.entries(value)) {
    const record = dualCapacityRecordFromUnknown(raw);
    if (record === null) {
      throw structuredBlockerError(
        'dual_capacity_record_invalid',
        `Dual-capacity record is invalid for signer task ${key}.`,
        `dualCapacityRecords.${key}`,
      );
    }
    out[key] = record;
  }
  return out;
}

function signerKey(task: PacketSignerTask): string | null {
  const userId = optionalTrimmedString(task.signerUserId);
  if (userId !== undefined) return `user:${userId}`;
  const email = optionalTrimmedString(task.signerEmail);
  if (email !== undefined) return `email:${email.toLowerCase()}`;
  const name = optionalTrimmedString(task.signerName);
  return name === undefined ? null : `name:${name.toLowerCase()}`;
}

function signerTaskForCapacity(
  tasks: readonly PacketSignerTask[],
  capacity: string,
): SignerTaskMatch | null {
  const directIndex = tasks.findIndex((task) => task.requiredCapacity === capacity);
  if (directIndex >= 0) {
    const task = tasks[directIndex];
    return task ? { task, index: directIndex, coveredByDualTask: false } : null;
  }

  const dualIndex = tasks.findIndex((task) => task.dualCapacities?.includes(capacity) ?? false);
  if (dualIndex >= 0) {
    const task = tasks[dualIndex];
    return task ? { task, index: dualIndex, coveredByDualTask: true } : null;
  }

  return null;
}

function pushSignerPolicyBlocker(
  blockers: StructuredBlocker[],
  code: string,
  path: string,
  message: string,
  remediation = 'Confirm every required signer capacity before proceeding to signer confirmation.',
): void {
  blockers.push({ code, path, message, remediation });
}

function addSignerTaskConfirmationBlockers(
  requirement: SignaturePolicy['requiredCapacities'][number],
  match: SignerTaskMatch,
  blockers: StructuredBlocker[],
): void {
  const { task, index, coveredByDualTask } = match;
  const basePath = `signerTasks.${index}`;
  if (
    optionalTrimmedString(task.signerName) === undefined &&
    optionalTrimmedString(task.signerUserId) === undefined
  ) {
    pushSignerPolicyBlocker(
      blockers,
      'signer_identity_unconfirmed',
      `${basePath}.signerName`,
      `Confirm identity for required capacity "${requirement.capacity}".`,
    );
  }
  if (optionalTrimmedString(task.signerEmail) === undefined) {
    pushSignerPolicyBlocker(
      blockers,
      'signer_email_unconfirmed',
      `${basePath}.signerEmail`,
      `Confirm email for required capacity "${requirement.capacity}".`,
    );
  }
  if (optionalTrimmedString(task.signerRole) === undefined) {
    pushSignerPolicyBlocker(
      blockers,
      'signer_role_unconfirmed',
      `${basePath}.signerRole`,
      `Confirm role for required capacity "${requirement.capacity}".`,
    );
  }
  if (task.authorityVerified !== true) {
    pushSignerPolicyBlocker(
      blockers,
      'signer_authority_unconfirmed',
      `${basePath}.authorityVerified`,
      `Confirm authority for required capacity "${requirement.capacity}".`,
    );
  }
  if (task.order !== requirement.order && !coveredByDualTask) {
    pushSignerPolicyBlocker(
      blockers,
      'signer_sequence_unconfirmed',
      `${basePath}.order`,
      `Confirm signing sequence for required capacity "${requirement.capacity}".`,
    );
  }
  if (requirement.required && task.required !== true) {
    pushSignerPolicyBlocker(
      blockers,
      'signer_required_capacity_unconfirmed',
      `${basePath}.required`,
      `Capacity "${requirement.capacity}" must be marked required.`,
    );
  }
  if (task.attachmentAccessGranted !== true) {
    pushSignerPolicyBlocker(
      blockers,
      'signer_attachment_access_unconfirmed',
      `${basePath}.attachmentAccessGranted`,
      `Grant attachment access for required capacity "${requirement.capacity}".`,
    );
  }
  if (optionalTrimmedString(task.dueDate) === undefined) {
    pushSignerPolicyBlocker(
      blockers,
      'signer_due_date_unconfirmed',
      `${basePath}.dueDate`,
      `Set due date for required capacity "${requirement.capacity}".`,
    );
  }
  if (optionalTrimmedString(task.expiresAt) === undefined) {
    pushSignerPolicyBlocker(
      blockers,
      'signer_expiration_unconfirmed',
      `${basePath}.expiresAt`,
      `Set expiration for required capacity "${requirement.capacity}".`,
    );
  }
  if (
    typeof task.reminderCount !== 'number' ||
    !Number.isFinite(task.reminderCount) ||
    task.reminderCount < 0
  ) {
    pushSignerPolicyBlocker(
      blockers,
      'signer_reminders_unconfirmed',
      `${basePath}.reminderCount`,
      `Confirm reminders for required capacity "${requirement.capacity}".`,
    );
  }
  if (task.confidentialityAcknowledged !== true) {
    pushSignerPolicyBlocker(
      blockers,
      'signer_confidentiality_unconfirmed',
      `${basePath}.confidentialityAcknowledged`,
      `Confirm confidentiality for required capacity "${requirement.capacity}".`,
    );
  }
}

function recordForPair(
  first: PacketSignerTask,
  second: PacketSignerTask,
  records: Readonly<Record<string, DualCapacityAttestationRecord>>,
): DualCapacityAttestationRecord | null {
  return records[first.signerTaskId] ??
    records[second.signerTaskId] ??
    dualCapacityRecordFromTask(first) ??
    dualCapacityRecordFromTask(second);
}

function checkSignerPolicy(body: PacketApprovalActionBody): SignerPolicyCheck {
  const tasks = readSignerTasks(body.signerTasks);
  const policy = signaturePolicy(body);
  if (tasks === null) {
    return { status: 'not provided', policyId: policy.policyId, blockers: [] };
  }
  const records = readDualCapacityRecords(body.dualCapacityRecords);
  const blockers: StructuredBlocker[] = [];
  for (const requirement of policy.requiredCapacities) {
    const match = signerTaskForCapacity(tasks, requirement.capacity);
    if (match === null) {
      pushSignerPolicyBlocker(
        blockers,
        'required_signer_capacity_missing',
        'signerTasks',
        `Missing signer task for required capacity "${requirement.capacity}".`,
      );
    } else {
      addSignerTaskConfirmationBlockers(requirement, match, blockers);
    }
  }
  for (let i = 0; i < policy.requiredCapacities.length; i += 1) {
    const firstCapacity = policy.requiredCapacities[i]?.capacity;
    if (!firstCapacity) continue;
    const firstMatch = signerTaskForCapacity(tasks, firstCapacity);
    if (firstMatch === null) continue;
    const firstTask = firstMatch.task;
    for (let j = i + 1; j < policy.requiredCapacities.length; j += 1) {
      const secondCapacity = policy.requiredCapacities[j]?.capacity;
      if (!secondCapacity) continue;
      const secondMatch = signerTaskForCapacity(tasks, secondCapacity);
      if (secondMatch === null) continue;
      const secondTask = secondMatch.task;
      const firstSigner = signerKey(firstTask);
      const secondSigner = signerKey(secondTask);
      if (firstSigner === null || firstSigner !== secondSigner) continue;
      const record = recordForPair(firstTask, secondTask, records);
      const decision = resolveDualCapacityDecision(policy, firstCapacity, secondCapacity, record);
      if (decision !== 'allow') {
        blockers.push({
          code: 'dual_capacity_not_permitted',
          path: 'signerTasks',
          message:
            `One signer cannot satisfy "${firstCapacity}" and "${secondCapacity}" unless an explicit approved dual-capacity rule permits it and the record shows both capacities.`,
          remediation: 'Assign separate signers or attach an approved dual-capacity attestation record.',
        });
      }
    }
  }
  return {
    status: blockers.length > 0 ? 'blocked' : 'validated',
    policyId: policy.policyId,
    blockers,
  };
}

function assertApprovalEligible(validation: PacketValidationResult): void {
  if (!validation.approvalEligible) {
    throw validationBlockersError(validation);
  }
}

function requireDocumentedException(body: PacketApprovalActionBody): string {
  const documentedException =
    optionalTrimmedString(body.exceptionReason) ??
    optionalTrimmedString(body.documentedException) ??
    optionalTrimmedString(body.reason);
  if (documentedException === undefined) {
    throw structuredBlockerError(
      'documented_exception_required',
      'Approve with documented exception requires exceptionReason or documentedException.',
      'exceptionReason',
    );
  }
  return documentedException;
}

function assertSignerPolicyReady(check: SignerPolicyCheck): void {
  if (check.status !== 'blocked') return;
  throw new ApiError('validation_error', 'Signer confirmation has unresolved blockers.', 409, {
    blockers: check.blockers,
    signaturePolicyId: check.policyId,
  });
}

function mapPacketError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof StaleWriteError) {
    return new ApiError('validation_error', 'Packet revision is stale.', 409, {
      code: error.code,
      packetInstanceId: error.packetInstanceId,
      expectedRevision: error.expectedRevision,
      actualRevision: error.actualRevision,
    });
  }
  if (error instanceof PacketNotFoundError) {
    return new ApiError('event_not_found', error.message, 404, {
      code: error.code,
      packetInstanceId: error.packetInstanceId,
    });
  }
  if (
    error instanceof IllegalTransitionError ||
    error instanceof LockedPacketError ||
    error instanceof ImmutableIdentityError ||
    error instanceof LifecycleOwnedFieldError ||
    error instanceof ForbiddenFieldError
  ) {
    return new ApiError('validation_error', error.message, 409, {
      code: error.code,
      blockers: [{
        code: error.code,
        path: 'packet',
        message: error.message,
        remediation: 'Reload the packet, resolve blockers, and retry the allowed approval action.',
      }],
    });
  }
  return error instanceof Error
    ? new ApiError('internal_error', error.message, 500)
    : new ApiError('internal_error', 'Internal error', 500);
}

async function transitionApprovalAction(input: {
  store: PacketMetadataStore;
  body: PacketApprovalActionBody;
  current: PacketStoreDocument;
  targetStatus: PacketLifecycleStatus;
  actor: PacketAuditActor;
  reason?: string;
}): Promise<PacketStoreDocument> {
  return transitionPacket(
    input.store,
    input.current.packetInstanceId,
    expectedRevision(input.body),
    input.targetStatus,
    input.actor,
    input.reason,
  );
}

export function createPacketApprovalRouter(
  options: PacketApprovalRouterOptions = {},
): Router {
  const router = Router();
  const store = options.store ?? defaultStore;

  router.use(identityMiddleware);

  router.post('/:packetInstanceId/return-for-correction', asyncH(async (req, res) => {
    const body = asRecord(req.body) as PacketApprovalActionBody;
    const actor = requireActor(req);
    const current = await getScopedPacket(store, req, req.params.packetInstanceId);
    const packet = await transitionApprovalAction({
      store,
      body,
      current,
      targetStatus: 'RETURNED_FOR_CORRECTION',
      actor,
      reason: optionalTrimmedString(body.reason),
    });
    res.json({ status: 'ok', action: 'return-for-correction', actionLabel: ACTION_LABELS['return-for-correction'], packet });
  }));

  router.post('/:packetInstanceId/approve', asyncH(async (req, res) => {
    const body = asRecord(req.body) as PacketApprovalActionBody;
    const actor = requireActor(req);
    const current = await getScopedPacket(store, req, req.params.packetInstanceId);
    const validation = approvalValidation(current, body);
    assertApprovalEligible(validation);
    const packet = await transitionApprovalAction({
      store,
      body,
      current,
      targetStatus: 'APPROVED_FOR_SIGNATURE',
      actor,
      reason: optionalTrimmedString(body.reason),
    });
    res.json({ status: 'ok', action: 'approve', actionLabel: ACTION_LABELS.approve, packet, validation });
  }));

  const approveWithDocumentedException = asyncH(async (req, res) => {
    const body = asRecord(req.body) as PacketApprovalActionBody;
    const actor = requireActor(req);
    const current = await getScopedPacket(store, req, req.params.packetInstanceId);
    const policy = approvalPolicy(body);
    if (!canApproveWithDocumentedException(policy)) {
      throw structuredBlockerError(
        'documented_exception_not_supported',
        `Approval policy "${policy.policyId}" does not permit "Approve with documented exception".`,
        'approvalPolicyId',
      );
    }
    const documentedException = requireDocumentedException(body);
    const validation = approvalValidation(current, body);
    assertApprovalEligible(validation);
    const packet = await transitionApprovalAction({
      store,
      body,
      current,
      targetStatus: 'APPROVED_FOR_SIGNATURE',
      actor,
      reason: documentedException,
    });
    res.json({
      status: 'ok',
      action: 'approve-with-documented-exception',
      actionLabel: ACTION_LABELS['approve-with-documented-exception'],
      packet,
      validation,
      documentedException,
      approvalPolicyId: policy.policyId,
    });
  });

  router.post('/:packetInstanceId/approve-with-documented-exception', approveWithDocumentedException);
  router.post('/:packetInstanceId/approve-with-exception', approveWithDocumentedException);

  router.post('/:packetInstanceId/reject', asyncH(async (req, res) => {
    const body = asRecord(req.body) as PacketApprovalActionBody;
    const actor = requireActor(req);
    const current = await getScopedPacket(store, req, req.params.packetInstanceId);
    const packet = await transitionApprovalAction({
      store,
      body,
      current,
      targetStatus: 'RETURNED_FOR_CORRECTION',
      actor,
      reason: optionalTrimmedString(body.reason),
    });
    res.json({ status: 'ok', action: 'reject', actionLabel: ACTION_LABELS.reject, packet });
  }));

  router.post('/:packetInstanceId/proceed-to-signer-confirmation', asyncH(async (req, res) => {
    const body = asRecord(req.body) as PacketApprovalActionBody;
    const actor = requireActor(req);
    const current = await getScopedPacket(store, req, req.params.packetInstanceId);
    const validation = approvalValidation(current, body);
    assertApprovalEligible(validation);
    const signerPolicyCheck = checkSignerPolicy(body);
    assertSignerPolicyReady(signerPolicyCheck);
    const envelopeStatus = normalizeEnvelopeStatus(body.envelopeStatus);
    const packet = await transitionApprovalAction({
      store,
      body,
      current,
      targetStatus: 'SIGNER_CONFIRMATION',
      actor,
      reason: optionalTrimmedString(body.reason),
    });
    res.json({
      status: 'ok',
      action: 'proceed-to-signer-confirmation',
      actionLabel: ACTION_LABELS['proceed-to-signer-confirmation'],
      packet,
      validation,
      signerPolicyCheck,
      envelopeStatus: envelopeStatus ?? 'unknown',
    });
  }));

  router.use((err: unknown, _req: Request<Record<string, string>>, _res: Response, next: NextFunction) => {
    next(mapPacketError(err));
  });

  return router;
}

export const packetApprovalRouter: Router = createPacketApprovalRouter();
