import { Router, type NextFunction, type Request, type Response } from 'express';
import { ApiError } from '../../errors.js';
import { userPacketActor } from '../auditEvents.js';
import {
  FileLocalPacketStore,
  ForbiddenFieldError,
  ImmutableIdentityError,
  LifecycleOwnedFieldError,
  LockedPacketError,
  PacketNotFoundError,
  StaleWriteError,
  type PacketInstancePatch,
  type PacketMetadataStore,
  type PacketStoreDocument,
} from '../store.js';
import {
  buildTriggerRegisterRows,
  type MaterialNonTriggerDecision,
  type TriggerRegisterRow,
} from '@/policy/packets/analysis/triggers/triggerRegister';
import type { TriggerActivationPreconditions } from '@/policy/packets/analysis/triggers/evaluateTriggers';
import {
  buildWorkflowActivationKey,
  type PacketAuditActor,
  type PacketFinding,
  type PacketModuleInstance,
  type WorkflowDecisionState,
  type WorkflowTriggerEvaluation,
} from '@/policy/packets/contracts';

type AsyncRoute = (req: Request<Record<string, string>>, res: Response, next: NextFunction) => Promise<void>;

type PacketActorRequest = Request & {
  session?: { authenticated?: boolean; correlation_id?: string };
  actor?: {
    type: 'user' | 'service' | 'system';
    user_id?: string;
    service_id?: string;
    roles?: string[];
    attributes?: { access_classes?: string[] };
  };
};

type TriggerDecisionAction = 'confirm' | 'reject' | 'activate' | 'link-existing';

export interface PacketWorkflowTriggersRouterOptions {
  store?: PacketMetadataStore;
}

export interface WorkflowTriggerDecisionRecord {
  decisionId: string;
  evaluationId: string;
  action: TriggerDecisionAction;
  decisionState: WorkflowDecisionState;
  rationale: string;
  decidedBy: string;
  decidedAt: string;
  activationKey: string | null;
  existingWorkflowInstanceId: string | null;
  newWorkflowInstanceId: string | null;
  cesWorkflowInstanceId: string | null;
  triggerRuleId: string | null;
  canonicalWorkflowId: string | null;
  findingId: string;
  reportingPeriod: string;
}

export interface WorkflowTriggerCesLinkRecord {
  linkId: string;
  evaluationId: string;
  activationKey: string | null;
  canonicalWorkflowId: string | null;
  existingWorkflowInstanceId: string | null;
  newWorkflowInstanceId: string | null;
  cesWorkflowInstanceId: string | null;
  linkReason: string;
  linkedBy: string;
  linkedAt: string;
  cesMutation: 'not_performed';
}

export interface WorkflowTriggerRegisterPayload {
  evaluations: WorkflowTriggerEvaluation[];
  findings: PacketFinding[];
  materialNonTriggerDecisions: MaterialNonTriggerDecision[];
  decisions: WorkflowTriggerDecisionRecord[];
  cesLinks: WorkflowTriggerCesLinkRecord[];
}

interface TriggerMutationBody {
  expectedRevision?: number;
  revision?: number;
  rationale?: string;
  reason?: string;
  evaluation?: unknown;
  existingWorkflowInstanceId?: string;
  cesWorkflowInstanceId?: string | null;
  rootIssueKey?: string | null;
  activationPreconditions?: Partial<
    TriggerActivationPreconditions & {
      canonicalTriggerResolved: boolean;
      requiredValuesAndRecurrenceAvailable: boolean;
      noExistingActiveWorkflow: boolean;
    }
  >;
}

interface StructuredBlocker {
  code: string;
  path: string;
  message: string;
  remediation: string;
}

const defaultStore = new FileLocalPacketStore();
const REGISTER_MODULE_ID = 'qapi-triggered-workflow-and-dependency-register' as const;
const AUTHORITY_ROLES = [
  'administrator',
  'compliance_officer',
  'qapi_chair',
  'qapi_committee',
  'quality_director',
  'super_admin',
] as const;

function asyncH(fn: AsyncRoute) {
  return (req: Request<Record<string, string>>, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw structuredBlockerError('request_body_invalid', 'Request body must be a JSON object.');
  }
  return value;
}

function requiredString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw structuredBlockerError(
      'required_field_missing',
      `Field "${path}" is required.`,
      path,
    );
  }
  return value.trim();
}

function optionalString(value: unknown, path: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') {
    throw structuredBlockerError(
      'field_type_invalid',
      `Field "${path}" must be a string or null.`,
      path,
    );
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function expectedRevision(body: TriggerMutationBody): number {
  const value = body.expectedRevision ?? body.revision;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw structuredBlockerError(
      'expected_revision_required',
      'expectedRevision is required for workflow-trigger mutation.',
      'expectedRevision',
      428,
    );
  }
  return value;
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

function actorRoles(req: Request<Record<string, string>>): string[] {
  return (req as PacketActorRequest).actor?.roles ?? [];
}

function hasTriggerAuthority(req: Request<Record<string, string>>, evaluation: WorkflowTriggerEvaluation): boolean {
  const roles = actorRoles(req);
  const scopedRoles = new Set([
    ...evaluation.approverRoles,
    ...(evaluation.ownerRole === null ? [] : [evaluation.ownerRole]),
    ...AUTHORITY_ROLES,
  ]);
  return roles.some((role) => scopedRoles.has(role));
}

function requireTriggerAuthority(req: Request<Record<string, string>>, evaluation: WorkflowTriggerEvaluation): void {
  if (hasTriggerAuthority(req, evaluation)) return;
  throw new ApiError(
    'permission_denied',
    'User is not authorized to decide this workflow trigger.',
    403,
    {
      evaluationId: evaluation.evaluationId,
      approverRoles: evaluation.approverRoles,
      ownerRole: evaluation.ownerRole,
    },
  );
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

function structuredBlocker(
  code: string,
  message: string,
  path = 'body',
  remediation = 'Correct the request and retry without changing missing values to defaults.',
): StructuredBlocker {
  return { code, path, message, remediation };
}

function structuredBlockerError(
  code: string,
  message: string,
  path = 'body',
  status = 400,
): ApiError {
  return new ApiError('validation_error', message, status, {
    blockers: [structuredBlocker(code, message, path)],
  });
}

function blockersError(message: string, blockers: StructuredBlocker[], status = 409): ApiError {
  return new ApiError('validation_error', message, status, { blockers });
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function assertEvaluationShape(value: unknown, path = 'evaluation'): WorkflowTriggerEvaluation {
  if (!isRecord(value)) {
    throw structuredBlockerError(
      'workflow_trigger_evaluation_invalid',
      'Workflow trigger evaluation must be a JSON object.',
      path,
    );
  }
  const record = value as Partial<WorkflowTriggerEvaluation>;
  const requiredTextFields = [
    'evaluationId',
    'packetId',
    'parentEventId',
    'reportingPeriod',
    'findingId',
    'triggerType',
    'decisionState',
    'decisionRationale',
    'validationStatus',
    'lifecycleStatus',
  ] as const;
  for (const field of requiredTextFields) {
    if (typeof record[field] !== 'string' || record[field].trim().length === 0) {
      throw structuredBlockerError(
        'workflow_trigger_evaluation_invalid',
        `Workflow trigger evaluation field "${field}" is required.`,
        `${path}.${field}`,
      );
    }
  }
  const requiredArrayFields = [
    'sourceRecordIds',
    'sourceFormIds',
    'sourceWorkflowIds',
    'approverRoles',
    'requiredFormIds',
    'dependencyWorkflowIds',
    'blockerIds',
  ] as const;
  for (const field of requiredArrayFields) {
    if (!isStringArray(record[field])) {
      throw structuredBlockerError(
        'workflow_trigger_evaluation_invalid',
        `Workflow trigger evaluation field "${field}" must be an array of strings.`,
        `${path}.${field}`,
      );
    }
  }
  return {
    ...(record as WorkflowTriggerEvaluation),
    sourceRecordIds: [...(record.sourceRecordIds ?? [])],
    sourceFormIds: [...(record.sourceFormIds ?? [])],
    sourceWorkflowIds: [...(record.sourceWorkflowIds ?? [])],
    approverRoles: [...(record.approverRoles ?? [])],
    requiredFormIds: [...(record.requiredFormIds ?? [])],
    dependencyWorkflowIds: [...(record.dependencyWorkflowIds ?? [])],
    blockerIds: [...(record.blockerIds ?? [])],
  };
}

function cloneEvaluation(evaluation: WorkflowTriggerEvaluation): WorkflowTriggerEvaluation {
  return {
    ...evaluation,
    sourceRecordIds: [...evaluation.sourceRecordIds],
    sourceFormIds: [...evaluation.sourceFormIds],
    sourceWorkflowIds: [...evaluation.sourceWorkflowIds],
    approverRoles: [...evaluation.approverRoles],
    requiredFormIds: [...evaluation.requiredFormIds],
    dependencyWorkflowIds: [...evaluation.dependencyWorkflowIds],
    blockerIds: [...evaluation.blockerIds],
    pipEvaluationFactors: evaluation.pipEvaluationFactors === null
      ? null
      : { ...evaluation.pipEvaluationFactors },
  };
}

function emptyPayload(): WorkflowTriggerRegisterPayload {
  return {
    evaluations: [],
    findings: [],
    materialNonTriggerDecisions: [],
    decisions: [],
    cesLinks: [],
  };
}

function readRegisterPayload(packet: PacketStoreDocument): WorkflowTriggerRegisterPayload {
  const module = packet.moduleInstances.find((item) => item.moduleId === REGISTER_MODULE_ID);
  if (!module || !isRecord(module.payload)) return emptyPayload();
  const payload = module.payload as Partial<WorkflowTriggerRegisterPayload>;
  return {
    evaluations: Array.isArray(payload.evaluations)
      ? payload.evaluations.map((item, index) => assertEvaluationShape(item, `payload.evaluations.${index}`))
      : [],
    findings: Array.isArray(payload.findings) ? (payload.findings as PacketFinding[]) : [],
    materialNonTriggerDecisions: Array.isArray(payload.materialNonTriggerDecisions)
      ? (payload.materialNonTriggerDecisions as MaterialNonTriggerDecision[])
      : [],
    decisions: Array.isArray(payload.decisions)
      ? (payload.decisions as WorkflowTriggerDecisionRecord[])
      : [],
    cesLinks: Array.isArray(payload.cesLinks)
      ? (payload.cesLinks as WorkflowTriggerCesLinkRecord[])
      : [],
  };
}

function upsertEvaluation(
  payload: WorkflowTriggerRegisterPayload,
  evaluation: WorkflowTriggerEvaluation,
): WorkflowTriggerRegisterPayload {
  const nextEvaluations = payload.evaluations.filter(
    (item) => item.evaluationId !== evaluation.evaluationId,
  );
  nextEvaluations.push(cloneEvaluation(evaluation));
  return { ...payload, evaluations: nextEvaluations };
}

function findEvaluation(
  payload: WorkflowTriggerRegisterPayload,
  body: TriggerMutationBody,
  evaluationId: string,
): WorkflowTriggerEvaluation {
  if (body.evaluation !== undefined) {
    const evaluation = assertEvaluationShape(body.evaluation);
    if (evaluation.evaluationId !== evaluationId) {
      throw structuredBlockerError(
        'workflow_trigger_evaluation_mismatch',
        'Workflow trigger evaluation does not match the requested evaluation id.',
        'evaluation.evaluationId',
      );
    }
    return evaluation;
  }
  const existing = payload.evaluations.find((item) => item.evaluationId === evaluationId);
  if (!existing) {
    throw structuredBlockerError(
      'workflow_trigger_evaluation_missing',
      'Workflow trigger evaluation is not registered on this packet.',
      'evaluationId',
      404,
    );
  }
  return cloneEvaluation(existing);
}

function buildRows(payload: WorkflowTriggerRegisterPayload): TriggerRegisterRow[] {
  return buildTriggerRegisterRows(
    payload.findings,
    payload.evaluations,
    payload.materialNonTriggerDecisions,
  );
}

function updateRegisterModule(
  packet: PacketStoreDocument,
  payload: WorkflowTriggerRegisterPayload,
  actor: PacketAuditActor,
): PacketModuleInstance[] {
  const now = new Date().toISOString();
  const module: PacketModuleInstance = {
    moduleInstanceId: REGISTER_MODULE_ID,
    moduleId: REGISTER_MODULE_ID,
    status: 'in_progress',
    payload,
    contentHash: null,
    order: packet.moduleInstances.length + 1,
    updatedAt: now,
    updatedBy: actor.actorId,
  };
  let replaced = false;
  const modules = packet.moduleInstances.map((item) => {
    if (item.moduleId !== REGISTER_MODULE_ID) return item;
    replaced = true;
    return {
      ...item,
      status: 'in_progress' as const,
      payload,
      contentHash: null,
      updatedAt: now,
      updatedBy: actor.actorId,
    };
  });
  return replaced ? modules : [...modules, module];
}

async function writeRegisterPayload(
  store: PacketMetadataStore,
  packet: PacketStoreDocument,
  expected: number,
  payload: WorkflowTriggerRegisterPayload,
  actor: PacketAuditActor,
  reason: string | null,
  auditEventType: 'packet.trigger_evaluated' | 'packet.workflow_activated',
): Promise<PacketStoreDocument> {
  const patch: PacketInstancePatch = {
    moduleInstances: updateRegisterModule(packet, payload, actor),
  };
  return store.update(packet.packetInstanceId, expected, patch, {
    actor,
    reason,
    auditEventType,
  });
}

function rationaleFromBody(body: TriggerMutationBody, fallback: string): string {
  const rationale = optionalString(body.rationale, 'rationale') ?? optionalString(body.reason, 'reason');
  return rationale ?? fallback;
}

function rationaleRequired(body: TriggerMutationBody): string {
  return requiredString(body.rationale ?? body.reason, 'rationale');
}

function activationKey(
  packet: PacketStoreDocument,
  evaluation: WorkflowTriggerEvaluation,
): string {
  if (evaluation.triggerRuleId === null) {
    throw structuredBlockerError(
      'trigger_rule_unresolved',
      'Trigger rule is required for workflow activation.',
      'evaluation.triggerRuleId',
      409,
    );
  }
  if (evaluation.canonicalWorkflowId === null) {
    throw structuredBlockerError(
      'canonical_workflow_unresolved',
      'Canonical workflow is required for workflow activation.',
      'evaluation.canonicalWorkflowId',
      409,
    );
  }
  return buildWorkflowActivationKey({
    agency_id: packet.agencyId,
    reporting_period: evaluation.reportingPeriod,
    finding_id: evaluation.findingId,
    trigger_rule_id: evaluation.triggerRuleId,
    canonical_workflow_id: evaluation.canonicalWorkflowId,
  });
}

function activationDecision(
  payload: WorkflowTriggerRegisterPayload,
  key: string,
): WorkflowTriggerDecisionRecord | null {
  return payload.decisions.find(
    (decision) => decision.action === 'activate' && decision.activationKey === key,
  ) ?? null;
}

function linkFor(
  payload: WorkflowTriggerRegisterPayload,
  evaluationId: string,
  existingWorkflowInstanceId: string,
): WorkflowTriggerCesLinkRecord | null {
  return payload.cesLinks.find(
    (link) =>
      link.evaluationId === evaluationId &&
      link.existingWorkflowInstanceId === existingWorkflowInstanceId,
  ) ?? null;
}

function existingActiveWorkflowLink(
  payload: WorkflowTriggerRegisterPayload,
  evaluation: WorkflowTriggerEvaluation,
  rootIssueKey: string | null,
): WorkflowTriggerCesLinkRecord | null {
  return payload.cesLinks.find((link) => {
    if (link.existingWorkflowInstanceId === null) return false;
    if (link.canonicalWorkflowId !== evaluation.canonicalWorkflowId) return false;
    if (link.evaluationId === evaluation.evaluationId) return true;
    if (rootIssueKey === null) return false;
    const linkedDecision = payload.decisions.find(
      (decision) =>
        decision.action === 'link-existing' &&
        decision.evaluationId === link.evaluationId &&
        decision.existingWorkflowInstanceId === link.existingWorkflowInstanceId,
    );
    return linkedDecision?.findingId === rootIssueKey;
  }) ?? null;
}

function decisionId(action: TriggerDecisionAction, evaluationId: string, key: string | null): string {
  return [action, evaluationId, key ?? 'no-key'].join(':');
}

function linkId(evaluationId: string, workflowInstanceId: string): string {
  return ['ces-link', evaluationId, workflowInstanceId].join(':');
}

function activationLinkId(evaluationId: string, key: string): string {
  return ['ces-activation-link', evaluationId, key].join(':');
}

function withDecision(
  payload: WorkflowTriggerRegisterPayload,
  decision: WorkflowTriggerDecisionRecord,
): WorkflowTriggerRegisterPayload {
  return {
    ...payload,
    decisions: [
      ...payload.decisions.filter((item) => item.decisionId !== decision.decisionId),
      decision,
    ],
  };
}

function withCesLink(
  payload: WorkflowTriggerRegisterPayload,
  link: WorkflowTriggerCesLinkRecord,
): WorkflowTriggerRegisterPayload {
  return {
    ...payload,
    cesLinks: [
      ...payload.cesLinks.filter((item) => item.linkId !== link.linkId),
      link,
    ],
  };
}

function confirmationEvaluation(
  evaluation: WorkflowTriggerEvaluation,
  actor: PacketAuditActor,
  rationale: string,
  now: string,
): WorkflowTriggerEvaluation {
  return {
    ...cloneEvaluation(evaluation),
    decisionState: 'CONFIRMED — NOT YET ACTIVATED',
    decisionRationale: rationale,
    validationStatus: 'validated',
    reviewedBy: actor.actorId,
    reviewedAt: now,
    lifecycleStatus: 'VALIDATED',
    overrideReason: rationale,
    existingWorkflowInstanceId: null,
    newWorkflowInstanceId: null,
  };
}

function rejectedEvaluation(
  evaluation: WorkflowTriggerEvaluation,
  actor: PacketAuditActor,
  rationale: string,
  now: string,
): WorkflowTriggerEvaluation {
  return {
    ...cloneEvaluation(evaluation),
    decisionState: 'NOT TRIGGERED',
    decisionRationale: rationale,
    validationStatus: 'validated',
    reviewedBy: actor.actorId,
    reviewedAt: now,
    lifecycleStatus: 'CANDIDATE',
    overrideReason: rationale,
    existingWorkflowInstanceId: null,
    newWorkflowInstanceId: null,
  };
}

function activatedEvaluation(
  evaluation: WorkflowTriggerEvaluation,
  actor: PacketAuditActor,
  rationale: string,
  now: string,
  key: string,
): WorkflowTriggerEvaluation {
  return {
    ...cloneEvaluation(evaluation),
    decisionState: 'ACTIVATED',
    decisionRationale: rationale,
    validationStatus: 'validated',
    reviewedBy: actor.actorId,
    reviewedAt: now,
    lifecycleStatus: 'ACTIVATED',
    overrideReason: rationale,
    existingWorkflowInstanceId: null,
    newWorkflowInstanceId: key,
  };
}

function linkedEvaluation(
  evaluation: WorkflowTriggerEvaluation,
  actor: PacketAuditActor,
  rationale: string,
  now: string,
  existingWorkflowInstanceId: string,
): WorkflowTriggerEvaluation {
  return {
    ...cloneEvaluation(evaluation),
    decisionState: 'LINKED TO EXISTING ACTIVE WORKFLOW',
    decisionRationale: rationale,
    validationStatus: 'validated',
    reviewedBy: actor.actorId,
    reviewedAt: now,
    lifecycleStatus: 'IN_PROGRESS',
    overrideReason: rationale,
    existingWorkflowInstanceId,
    newWorkflowInstanceId: null,
  };
}

function addMaterialNonTriggerDecision(
  payload: WorkflowTriggerRegisterPayload,
  evaluation: WorkflowTriggerEvaluation,
  rationale: string,
): WorkflowTriggerRegisterPayload {
  if (evaluation.triggerRuleId === null) return payload;
  const decision: MaterialNonTriggerDecision = {
    findingId: evaluation.findingId,
    triggerRuleId: evaluation.triggerRuleId,
    rationale,
    attachmentReferences: [],
  };
  return {
    ...payload,
    materialNonTriggerDecisions: [
      ...payload.materialNonTriggerDecisions.filter(
        (item) =>
          item.findingId !== decision.findingId ||
          item.triggerRuleId !== decision.triggerRuleId,
      ),
      decision,
    ],
  };
}

function activationPreconditionBlockers(
  packet: PacketStoreDocument,
  evaluation: WorkflowTriggerEvaluation,
  body: TriggerMutationBody,
): StructuredBlocker[] {
  const blockers: StructuredBlocker[] = [];
  if (packet.agencyId.trim().length === 0) {
    blockers.push(structuredBlocker(
      'agency_not_validated',
      'Agency is required before workflow activation.',
      'packet.agencyId',
    ));
  }
  if (evaluation.reportingPeriod.trim().length === 0) {
    blockers.push(structuredBlocker(
      'period_not_validated',
      'Reporting period is required before workflow activation.',
      'evaluation.reportingPeriod',
    ));
  }
  if (evaluation.decisionState !== 'CONFIRMED — NOT YET ACTIVATED') {
    blockers.push(structuredBlocker(
      'trigger_not_confirmed_for_activation',
      'Workflow trigger must be confirmed before activation.',
      'evaluation.decisionState',
    ));
  }
  if (evaluation.validationStatus !== 'validated') {
    blockers.push(structuredBlocker(
      'trigger_validation_incomplete',
      'Workflow trigger validation must be validated before activation.',
      'evaluation.validationStatus',
    ));
  }
  if (evaluation.triggerRuleId === null) {
    blockers.push(structuredBlocker(
      'trigger_rule_unresolved',
      'Trigger rule is required before workflow activation.',
      'evaluation.triggerRuleId',
    ));
  }
  if (evaluation.canonicalWorkflowId === null) {
    blockers.push(structuredBlocker(
      'canonical_workflow_unresolved',
      'Canonical workflow is required before workflow activation.',
      'evaluation.canonicalWorkflowId',
    ));
  }
  if (evaluation.blockerIds.length > 0) {
    blockers.push(structuredBlocker(
      'workflow_trigger_blockers_present',
      'Workflow trigger blockers must be resolved before activation.',
      'evaluation.blockerIds',
    ));
  }

  const preconditions = body.activationPreconditions;
  if (preconditions) {
    const booleanBlockers: Array<[keyof NonNullable<TriggerMutationBody['activationPreconditions']>, boolean, string]> = [
      ['agencyValidated', true, 'Agency is not validated.'],
      ['periodValidated', true, 'Reporting period is not validated.'],
      ['evidenceSupportsFinding', true, 'Evidence does not support the finding.'],
      ['canonicalTriggerResolved', true, 'Canonical trigger is unresolved.'],
      ['requiredValuesAvailable', true, 'Required values are unavailable.'],
      ['recurrenceConditionsAvailable', true, 'Recurrence conditions are unavailable.'],
      ['requiredValuesAndRecurrenceAvailable', true, 'Required values or recurrence conditions are unavailable.'],
      ['sourceConflictsInvalidateTrigger', false, 'Source conflicts invalidate the trigger.'],
      ['noExistingActiveWorkflow', true, 'An active workflow already covers the issue.'],
      ['requiredHumanConfirmationExists', true, 'Required human confirmation is missing.'],
      ['activatingUserHasAuthority', true, 'Activating user lacks authority.'],
    ];
    for (const [field, allowedValue, message] of booleanBlockers) {
      const value = preconditions[field];
      if (value !== undefined && value !== allowedValue) {
        blockers.push(structuredBlocker(
          `activation_precondition_${String(field)}`,
          message,
          `activationPreconditions.${String(field)}`,
        ));
      }
    }
    if (preconditions.recurrenceSatisfied === false) {
      blockers.push(structuredBlocker(
        'activation_precondition_recurrenceSatisfied',
        'Recurrence conditions are not satisfied.',
        'activationPreconditions.recurrenceSatisfied',
      ));
    }
  }

  return blockers;
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
    error instanceof LockedPacketError ||
    error instanceof ImmutableIdentityError ||
    error instanceof LifecycleOwnedFieldError ||
    error instanceof ForbiddenFieldError
  ) {
    return new ApiError('validation_error', error.message, 409, {
      code: error.code,
      blockers: [
        structuredBlocker(error.code, error.message, 'packet'),
      ],
    });
  }
  return error instanceof Error
    ? new ApiError('internal_error', error.message, 500)
    : new ApiError('internal_error', 'Internal error', 500);
}

function registerResponse(packet: PacketStoreDocument, payload: WorkflowTriggerRegisterPayload) {
  return {
    status: 'ok',
    packet,
    workflowTriggers: {
      evaluations: payload.evaluations,
      decisions: payload.decisions,
      cesLinks: payload.cesLinks,
      materialNonTriggerDecisions: payload.materialNonTriggerDecisions,
      rows: buildRows(payload),
    },
  };
}

async function reloadForActivationKey(
  store: PacketMetadataStore,
  packetInstanceId: string,
  key: string,
): Promise<{ packet: PacketStoreDocument; payload: WorkflowTriggerRegisterPayload; decision: WorkflowTriggerDecisionRecord } | null> {
  const reloaded = await store.getById(packetInstanceId);
  if (!reloaded) return null;
  const payload = readRegisterPayload(reloaded);
  const decision = activationDecision(payload, key);
  return decision === null ? null : { packet: reloaded, payload, decision };
}

async function reloadForLink(
  store: PacketMetadataStore,
  packetInstanceId: string,
  evaluationId: string,
  existingWorkflowInstanceId: string,
): Promise<{ packet: PacketStoreDocument; payload: WorkflowTriggerRegisterPayload; link: WorkflowTriggerCesLinkRecord } | null> {
  const reloaded = await store.getById(packetInstanceId);
  if (!reloaded) return null;
  const payload = readRegisterPayload(reloaded);
  const link = linkFor(payload, evaluationId, existingWorkflowInstanceId);
  return link === null ? null : { packet: reloaded, payload, link };
}

async function handleConfirm(
  store: PacketMetadataStore,
  req: Request<Record<string, string>>,
  res: Response,
): Promise<void> {
  const body = asRecord(req.body) as TriggerMutationBody;
  const actor = requireActor(req);
  const packet = await getScopedPacket(store, req, req.params.packetInstanceId);
  const payload = readRegisterPayload(packet);
  const evaluation = findEvaluation(payload, body, req.params.evaluationId);
  requireTriggerAuthority(req, evaluation);
  const now = new Date().toISOString();
  const rationale = rationaleFromBody(body, evaluation.decisionRationale);
  const confirmed = confirmationEvaluation(evaluation, actor, rationale, now);
  const decision: WorkflowTriggerDecisionRecord = {
    decisionId: decisionId('confirm', confirmed.evaluationId, null),
    evaluationId: confirmed.evaluationId,
    action: 'confirm',
    decisionState: confirmed.decisionState,
    rationale,
    decidedBy: actor.actorId,
    decidedAt: now,
    activationKey: null,
    existingWorkflowInstanceId: null,
    newWorkflowInstanceId: null,
    cesWorkflowInstanceId: null,
    triggerRuleId: confirmed.triggerRuleId,
    canonicalWorkflowId: confirmed.canonicalWorkflowId,
    findingId: confirmed.findingId,
    reportingPeriod: confirmed.reportingPeriod,
  };
  const nextPayload = withDecision(upsertEvaluation(payload, confirmed), decision);
  const updated = await writeRegisterPayload(
    store,
    packet,
    expectedRevision(body),
    nextPayload,
    actor,
    rationale,
    'packet.trigger_evaluated',
  );
  res.json({ ...registerResponse(updated, nextPayload), action: 'confirm', evaluation: confirmed });
}

async function handleReject(
  store: PacketMetadataStore,
  req: Request<Record<string, string>>,
  res: Response,
): Promise<void> {
  const body = asRecord(req.body) as TriggerMutationBody;
  const actor = requireActor(req);
  const packet = await getScopedPacket(store, req, req.params.packetInstanceId);
  const payload = readRegisterPayload(packet);
  const evaluation = findEvaluation(payload, body, req.params.evaluationId);
  requireTriggerAuthority(req, evaluation);
  const now = new Date().toISOString();
  const rationale = rationaleRequired(body);
  const rejected = rejectedEvaluation(evaluation, actor, rationale, now);
  const decision: WorkflowTriggerDecisionRecord = {
    decisionId: decisionId('reject', rejected.evaluationId, null),
    evaluationId: rejected.evaluationId,
    action: 'reject',
    decisionState: rejected.decisionState,
    rationale,
    decidedBy: actor.actorId,
    decidedAt: now,
    activationKey: null,
    existingWorkflowInstanceId: null,
    newWorkflowInstanceId: null,
    cesWorkflowInstanceId: null,
    triggerRuleId: rejected.triggerRuleId,
    canonicalWorkflowId: rejected.canonicalWorkflowId,
    findingId: rejected.findingId,
    reportingPeriod: rejected.reportingPeriod,
  };
  const nextPayload = addMaterialNonTriggerDecision(
    withDecision(upsertEvaluation(payload, rejected), decision),
    rejected,
    rationale,
  );
  const updated = await writeRegisterPayload(
    store,
    packet,
    expectedRevision(body),
    nextPayload,
    actor,
    rationale,
    'packet.trigger_evaluated',
  );
  res.json({ ...registerResponse(updated, nextPayload), action: 'reject', evaluation: rejected });
}

async function handleActivate(
  store: PacketMetadataStore,
  req: Request<Record<string, string>>,
  res: Response,
): Promise<void> {
  const body = asRecord(req.body) as TriggerMutationBody;
  const actor = requireActor(req);
  const packet = await getScopedPacket(store, req, req.params.packetInstanceId);
  const payload = readRegisterPayload(packet);
  const evaluation = findEvaluation(payload, body, req.params.evaluationId);
  requireTriggerAuthority(req, evaluation);
  const key = activationKey(packet, evaluation);
  const prior = activationDecision(payload, key);
  if (prior !== null) {
    res.json({
      ...registerResponse(packet, payload),
      action: 'activate',
      activated: false,
      idempotent: true,
      idempotencyKey: key,
      decision: prior,
      cesMutation: 'not_performed',
    });
    return;
  }

  const declaredExistingWorkflowInstanceId =
    optionalString(body.existingWorkflowInstanceId, 'existingWorkflowInstanceId') ??
    optionalString(evaluation.existingWorkflowInstanceId, 'evaluation.existingWorkflowInstanceId');
  if (declaredExistingWorkflowInstanceId !== null) {
    const linkBody: TriggerMutationBody = {
      ...body,
      existingWorkflowInstanceId: declaredExistingWorkflowInstanceId,
      rationale: rationaleFromBody(
        body,
        'Existing active workflow covers this issue; no new workflow activation is recorded.',
      ),
    };
    req.body = linkBody;
    await handleLinkExisting(store, req, res);
    return;
  }

  const rootIssueKey = optionalString(body.rootIssueKey, 'rootIssueKey');
  const existingLink = existingActiveWorkflowLink(payload, evaluation, rootIssueKey);
  if (existingLink !== null && existingLink.existingWorkflowInstanceId !== null) {
    const linkBody: TriggerMutationBody = {
      ...body,
      existingWorkflowInstanceId: existingLink.existingWorkflowInstanceId,
      rationale: 'Existing active workflow covers this issue; no new workflow activation is recorded.',
    };
    req.body = linkBody;
    await handleLinkExisting(store, req, res);
    return;
  }

  const blockers = activationPreconditionBlockers(packet, evaluation, body);
  if (!hasTriggerAuthority(req, evaluation)) {
    blockers.push(structuredBlocker(
      'activation_precondition_activatingUserHasAuthority',
      'Activating user lacks authority.',
      'actor.roles',
    ));
  }
  if (blockers.length > 0) {
    throw blockersError('Workflow trigger activation is blocked.', blockers);
  }

  const now = new Date().toISOString();
  const rationale = rationaleFromBody(
    body,
    'Authorized activation recorded in the packet register; CES execution state was not mutated.',
  );
  const activated = activatedEvaluation(evaluation, actor, rationale, now, key);
  const cesWorkflowInstanceId = optionalString(
    body.cesWorkflowInstanceId,
    'cesWorkflowInstanceId',
  );
  const decision: WorkflowTriggerDecisionRecord = {
    decisionId: decisionId('activate', activated.evaluationId, key),
    evaluationId: activated.evaluationId,
    action: 'activate',
    decisionState: activated.decisionState,
    rationale,
    decidedBy: actor.actorId,
    decidedAt: now,
    activationKey: key,
    existingWorkflowInstanceId: null,
    newWorkflowInstanceId: activated.newWorkflowInstanceId,
    cesWorkflowInstanceId,
    triggerRuleId: activated.triggerRuleId,
    canonicalWorkflowId: activated.canonicalWorkflowId,
    findingId: activated.findingId,
    reportingPeriod: activated.reportingPeriod,
  };
  const link: WorkflowTriggerCesLinkRecord = {
    linkId: activationLinkId(activated.evaluationId, key),
    evaluationId: activated.evaluationId,
    activationKey: key,
    canonicalWorkflowId: activated.canonicalWorkflowId,
    existingWorkflowInstanceId: null,
    newWorkflowInstanceId: activated.newWorkflowInstanceId,
    cesWorkflowInstanceId,
    linkReason: rationale,
    linkedBy: actor.actorId,
    linkedAt: now,
    cesMutation: 'not_performed',
  };
  const nextPayload = withCesLink(withDecision(upsertEvaluation(payload, activated), decision), link);
  try {
    const updated = await writeRegisterPayload(
      store,
      packet,
      expectedRevision(body),
      nextPayload,
      actor,
      rationale,
      'packet.workflow_activated',
    );
    res.json({
      ...registerResponse(updated, nextPayload),
      action: 'activate',
      activated: true,
      idempotent: false,
      idempotencyKey: key,
      decision,
      cesMutation: 'not_performed',
    });
  } catch (error) {
    if (error instanceof StaleWriteError) {
      const reloaded = await reloadForActivationKey(store, packet.packetInstanceId, key);
      if (reloaded !== null) {
        res.json({
          ...registerResponse(reloaded.packet, reloaded.payload),
          action: 'activate',
          activated: false,
          idempotent: true,
          idempotencyKey: key,
          decision: reloaded.decision,
          cesMutation: 'not_performed',
        });
        return;
      }
    }
    throw error;
  }
}

async function handleLinkExisting(
  store: PacketMetadataStore,
  req: Request<Record<string, string>>,
  res: Response,
): Promise<void> {
  const body = asRecord(req.body) as TriggerMutationBody;
  const actor = requireActor(req);
  const packet = await getScopedPacket(store, req, req.params.packetInstanceId);
  const payload = readRegisterPayload(packet);
  const evaluation = findEvaluation(payload, body, req.params.evaluationId);
  requireTriggerAuthority(req, evaluation);
  const existingWorkflowInstanceId = requiredString(
    body.existingWorkflowInstanceId,
    'existingWorkflowInstanceId',
  );
  const prior = linkFor(payload, evaluation.evaluationId, existingWorkflowInstanceId);
  if (prior !== null) {
    res.json({
      ...registerResponse(packet, payload),
      action: 'link-existing',
      linked: false,
      idempotent: true,
      link: prior,
      cesMutation: 'not_performed',
    });
    return;
  }

  const now = new Date().toISOString();
  const rationale = rationaleFromBody(
    body,
    'Existing active workflow covers the same issue; no new workflow activation is recorded.',
  );
  const linked = linkedEvaluation(
    evaluation,
    actor,
    rationale,
    now,
    existingWorkflowInstanceId,
  );
  const cesWorkflowInstanceId = optionalString(
    body.cesWorkflowInstanceId,
    'cesWorkflowInstanceId',
  ) ?? existingWorkflowInstanceId;
  const decision: WorkflowTriggerDecisionRecord = {
    decisionId: decisionId('link-existing', linked.evaluationId, existingWorkflowInstanceId),
    evaluationId: linked.evaluationId,
    action: 'link-existing',
    decisionState: linked.decisionState,
    rationale,
    decidedBy: actor.actorId,
    decidedAt: now,
    activationKey: null,
    existingWorkflowInstanceId,
    newWorkflowInstanceId: null,
    cesWorkflowInstanceId,
    triggerRuleId: linked.triggerRuleId,
    canonicalWorkflowId: linked.canonicalWorkflowId,
    findingId: linked.findingId,
    reportingPeriod: linked.reportingPeriod,
  };
  const link: WorkflowTriggerCesLinkRecord = {
    linkId: linkId(linked.evaluationId, existingWorkflowInstanceId),
    evaluationId: linked.evaluationId,
    activationKey: null,
    canonicalWorkflowId: linked.canonicalWorkflowId,
    existingWorkflowInstanceId,
    newWorkflowInstanceId: null,
    cesWorkflowInstanceId,
    linkReason: rationale,
    linkedBy: actor.actorId,
    linkedAt: now,
    cesMutation: 'not_performed',
  };
  const nextPayload = withCesLink(withDecision(upsertEvaluation(payload, linked), decision), link);
  try {
    const updated = await writeRegisterPayload(
      store,
      packet,
      expectedRevision(body),
      nextPayload,
      actor,
      rationale,
      'packet.trigger_evaluated',
    );
    res.json({
      ...registerResponse(updated, nextPayload),
      action: 'link-existing',
      linked: true,
      idempotent: false,
      link,
      cesMutation: 'not_performed',
    });
  } catch (error) {
    if (error instanceof StaleWriteError) {
      const reloaded = await reloadForLink(
        store,
        packet.packetInstanceId,
        linked.evaluationId,
        existingWorkflowInstanceId,
      );
      if (reloaded !== null) {
        res.json({
          ...registerResponse(reloaded.packet, reloaded.payload),
          action: 'link-existing',
          linked: false,
          idempotent: true,
          link: reloaded.link,
          cesMutation: 'not_performed',
        });
        return;
      }
    }
    throw error;
  }
}

export function createWorkflowTriggersRouter(
  options: PacketWorkflowTriggersRouterOptions = {},
): Router {
  const router = Router();
  const store = options.store ?? defaultStore;

  router.get('/:packetInstanceId/workflow-triggers', asyncH(async (req, res) => {
    const packet = await getScopedPacket(store, req, req.params.packetInstanceId);
    const payload = readRegisterPayload(packet);
    res.json(registerResponse(packet, payload));
  }));

  router.post('/:packetInstanceId/workflow-triggers/:evaluationId/confirm', asyncH(async (req, res) => {
    await handleConfirm(store, req, res);
  }));

  router.post('/:packetInstanceId/workflow-triggers/:evaluationId/reject', asyncH(async (req, res) => {
    await handleReject(store, req, res);
  }));

  router.post('/:packetInstanceId/workflow-triggers/:evaluationId/activate', asyncH(async (req, res) => {
    await handleActivate(store, req, res);
  }));

  router.post('/:packetInstanceId/workflow-triggers/:evaluationId/link-existing', asyncH(async (req, res) => {
    await handleLinkExisting(store, req, res);
  }));

  router.use((err: unknown, _req: Request<Record<string, string>>, _res: Response, next: NextFunction) => {
    next(mapPacketError(err));
  });

  return router;
}

export const workflowTriggersRouter: Router = createWorkflowTriggersRouter();
