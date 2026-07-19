import { Router, type NextFunction, type Request, type Response } from 'express';
import { ApiError } from '../../errors.js';
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
  type CreatePacketInstanceInput,
  type PacketInstancePatch,
  type PacketMetadataStore,
  type PacketStoreDocument,
} from '../store.js';
import type {
  PacketAuditActor,
  PacketValidationFinding,
  PacketValidationResult,
} from '@/policy/packets/contracts';

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

export interface PacketLifecycleRouterOptions {
  store?: PacketMetadataStore;
}

interface CreatePacketBody extends Partial<CreatePacketInstanceInput> {
  idempotencyKey?: string;
  clientHash?: string;
  trustedHash?: string;
}

interface PacketMutationBody {
  expectedRevision?: number;
  revision?: number;
  reason?: string;
}

interface PatchPacketBody extends PacketMutationBody {
  patch?: Record<string, unknown>;
  clientHash?: string;
  trustedHash?: string;
}

const HASH_FIELDS = new Set(['contentHash', 'clientHash', 'trustedHash', 'hash']);
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

function stringField(body: Record<string, unknown>, field: string): string {
  const value = body[field];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw structuredBlockerError(
      'required_field_missing',
      `Field "${field}" is required.`,
      field,
    );
  }
  return value.trim();
}

function optionalStringField(body: Record<string, unknown>, field: string): string | null | undefined {
  if (!Object.prototype.hasOwnProperty.call(body, field)) return undefined;
  const value = body[field];
  if (value === null) return null;
  if (typeof value !== 'string') {
    throw structuredBlockerError(
      'field_type_invalid',
      `Field "${field}" must be a string or null.`,
      field,
    );
  }
  return value.trim().length === 0 ? null : value.trim();
}

function optionalStringArray(body: Record<string, unknown>, field: string): string[] | undefined {
  if (!Object.prototype.hasOwnProperty.call(body, field)) return undefined;
  const value = body[field];
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw structuredBlockerError(
      'field_type_invalid',
      `Field "${field}" must be an array of strings.`,
      field,
    );
  }
  return value.map((item) => item.trim()).filter(Boolean);
}

function optionalNumberField(body: Record<string, unknown>, field: string): number | undefined {
  if (!Object.prototype.hasOwnProperty.call(body, field)) return undefined;
  const value = body[field];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw structuredBlockerError(
      'field_type_invalid',
      `Field "${field}" must be a finite number.`,
      field,
    );
  }
  if (field === 'packetVersion' && value < 1) {
    throw structuredBlockerError(
      'field_value_invalid',
      'Field "packetVersion" must be a positive number.',
      field,
    );
  }
  return value;
}

function idempotencyKey(req: Request<Record<string, string>>, body: CreatePacketBody): string {
  const fromHeader = req.header('idempotency-key') ?? req.header('x-idempotency-key');
  const fromBody = typeof body.idempotencyKey === 'string' ? body.idempotencyKey : '';
  const key = (fromHeader ?? fromBody).trim();
  if (!key) {
    throw structuredBlockerError(
      'idempotency_key_required',
      'Idempotency-Key is required for packet creation.',
      'Idempotency-Key',
      428,
    );
  }
  return key;
}

function expectedRevision(body: PacketMutationBody): number {
  const value = body.expectedRevision ?? body.revision;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw structuredBlockerError(
      'expected_revision_required',
      'expectedRevision is required for packet mutation.',
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

function requirePacketScope(req: Request<Record<string, string>>, packet: PacketStoreDocument): void {
  assertAgencyScope(req, packet.agencyId);
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

function buildValidationResult(packet: PacketStoreDocument): PacketValidationResult {
  const blockerFindings = packet.blockerIds.map((blockerId, index) =>
    validationFinding({
      findingId: `blocker:${blockerId}`,
      severity: 'blocker',
      code: 'packet.blocker_unresolved',
      path: `blockerIds.${index}`,
      message: `Packet blocker remains unresolved: ${blockerId}.`,
      remediation: 'Resolve or formally disclose the blocker before approval.',
    }),
  );
  const warningFindings = packet.warningIds.map((warningId, index) =>
    validationFinding({
      findingId: `warning:${warningId}`,
      severity: 'warning',
      code: 'packet.warning_unacknowledged',
      path: `warningIds.${index}`,
      message: `Packet warning requires acknowledgment: ${warningId}.`,
      remediation: 'Acknowledge the warning or update the packet evidence before lock.',
    }),
  );
  const findings = [...blockerFindings, ...warningFindings];
  const unacknowledgedWarningIds = warningFindings.map((finding) => finding.findingId);
  const unresolvedBlockerIds = blockerFindings.map((finding) => finding.findingId);

  return {
    packetInstanceId: packet.packetInstanceId,
    packetVersion: packet.packetVersion,
    validatedAt: new Date().toISOString(),
    findings,
    counts: {
      blocker: blockerFindings.length,
      warning: warningFindings.length,
      advisory: 0,
    },
    lockEligible: unresolvedBlockerIds.length === 0 && unacknowledgedWarningIds.length === 0,
    approvalEligible: unresolvedBlockerIds.length === 0,
    unacknowledgedWarningIds,
    unresolvedBlockerIds,
  };
}

function structuredBlockerError(
  code: string,
  message: string,
  path = 'body',
  status = 400,
): ApiError {
  return new ApiError('validation_error', message, status, {
    blockers: [
      {
        code,
        path,
        message,
        remediation: 'Correct the request and retry without changing missing values to defaults.',
      },
    ],
  });
}

function validationBlockersError(validation: PacketValidationResult): ApiError {
  return new ApiError('validation_error', 'Packet has unresolved validation blockers.', 409, {
    blockers: validation.findings.filter((finding) => finding.severity === 'blocker'),
    validation,
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
      blockers: [
        {
          code: error.code,
          path: 'packet',
          message: error.message,
          remediation: 'Reload the packet, resolve blockers, and retry the allowed lifecycle action.',
        },
      ],
    });
  }
  return error instanceof Error
    ? new ApiError('internal_error', error.message, 500)
    : new ApiError('internal_error', 'Internal error', 500);
}

function toCreateInput(req: Request<Record<string, string>>, body: Record<string, unknown>): CreatePacketInstanceInput {
  const actor = requireActor(req);
  const packetTemplateId = stringField(body, 'packetTemplateId');
  const archetypeId = stringField(body, 'archetypeId');
  const input: CreatePacketInstanceInput = {
    agencyId: stringField(body, 'agencyId'),
    eventFamilyId: stringField(body, 'eventFamilyId'),
    eventInstanceId: stringField(body, 'eventInstanceId'),
    archetypeId,
    archetypeVersion: stringField(body, 'archetypeVersion'),
    packetTemplateId,
    workflowId: stringField(body, 'workflowId'),
    workflowInstanceId: stringField(body, 'workflowInstanceId'),
    createdBy: actor.actorId,
    packetId: optionalStringField(body, 'packetId') ?? undefined,
    subtype: optionalStringField(body, 'subtype') ?? undefined,
    reportingPeriodStart: optionalStringField(body, 'reportingPeriodStart') ?? undefined,
    reportingPeriodEnd: optionalStringField(body, 'reportingPeriodEnd') ?? undefined,
    dataThroughDate: optionalStringField(body, 'dataThroughDate') ?? undefined,
    blockerIds: optionalStringArray(body, 'blockerIds'),
    warningIds: optionalStringArray(body, 'warningIds'),
    approvalIds: optionalStringArray(body, 'approvalIds'),
    signatureIds: optionalStringArray(body, 'signatureIds'),
    packetVersion: optionalNumberField(body, 'packetVersion'),
    actor,
    reason: optionalStringField(body, 'reason') ?? null,
  };
  return input;
}

function sanitizedPatch(req: Request<Record<string, string>>): {
  patch: PacketInstancePatch;
  ignoredClientFields: string[];
} {
  const body = asRecord(req.body);
  const hasPatchWrapper = Object.prototype.hasOwnProperty.call(body, 'patch');
  if (
    hasPatchWrapper &&
    (!body.patch || typeof body.patch !== 'object' || Array.isArray(body.patch))
  ) {
    throw structuredBlockerError(
      'patch_type_invalid',
      'Field "patch" must be a JSON object when provided.',
      'patch',
    );
  }
  const rawPatch = hasPatchWrapper
    ? (body.patch as Record<string, unknown>)
    : body;
  const patchRecord: Record<string, unknown> = {};
  const ignoredClientFields: string[] = [];

  for (const [key, value] of Object.entries(rawPatch)) {
    if (key === 'expectedRevision' || key === 'revision' || key === 'reason') continue;
    if (HASH_FIELDS.has(key)) {
      ignoredClientFields.push(key);
      continue;
    }
    patchRecord[key] = value;
  }

  if (Object.keys(patchRecord).length === 0) {
    throw structuredBlockerError(
      'patch_contains_no_server_accepted_fields',
      'Patch contains no server-accepted fields.',
      'patch',
    );
  }

  return { patch: patchRecord as PacketInstancePatch, ignoredClientFields };
}

async function getScopedPacket(
  store: PacketMetadataStore,
  req: Request<Record<string, string>>,
  packetInstanceId: string,
): Promise<PacketStoreDocument> {
  requireActor(req);
  const packet = await store.getById(packetInstanceId);
  if (!packet) throw new PacketNotFoundError(packetInstanceId);
  requirePacketScope(req, packet);
  return packet;
}

export function createPacketLifecycleRouter(
  options: PacketLifecycleRouterOptions = {},
): Router {
  const router = Router();
  const store = options.store ?? defaultStore;

  router.post('/', asyncH(async (req, res) => {
    // asRecord() yields a Record; the intersection keeps both the typed
    // CreatePacketBody view (idempotencyKey) and the Record view (field extractors).
    const body = asRecord(req.body) as CreatePacketBody & Record<string, unknown>;
    const key = idempotencyKey(req, body);
    const input = toCreateInput(req, body);
    assertAgencyScope(req, input.agencyId);
    const result = await store.createPacketInstance(input);
    res.status(result.created ? 201 : 200).json({
      status: 'ok',
      created: result.created,
      idempotencyKey: key,
      packet: result.instance,
      clientHashTrusted: false,
      ignoredClientFields: ['clientHash', 'trustedHash'].filter((field) =>
        Object.prototype.hasOwnProperty.call(body, field),
      ),
    });
  }));

  router.get('/:packetInstanceId', asyncH(async (req, res) => {
    const packet = await getScopedPacket(store, req, req.params.packetInstanceId);
    res.json({ status: 'ok', packet });
  }));

  router.patch('/:packetInstanceId', asyncH(async (req, res) => {
    const body = asRecord(req.body) as PatchPacketBody;
    const actor = requireActor(req);
    const current = await getScopedPacket(store, req, req.params.packetInstanceId);
    const { patch, ignoredClientFields } = sanitizedPatch(req);
    const updated = await store.update(
      current.packetInstanceId,
      expectedRevision(body),
      patch,
      {
        actor,
        reason: typeof body.reason === 'string' ? body.reason : null,
        auditEventType: 'packet.edited',
      },
    );
    res.json({
      status: 'ok',
      packet: updated,
      ignoredClientFields,
      clientHashTrusted: false,
    });
  }));

  router.post('/:packetInstanceId/validate', asyncH(async (req, res) => {
    const body = asRecord(req.body) as PacketMutationBody;
    const actor = requireActor(req);
    const current = await getScopedPacket(store, req, req.params.packetInstanceId);
    const validation = buildValidationResult(current);
    const updated = await store.update(
      current.packetInstanceId,
      expectedRevision(body),
      {
        blockerIds: current.blockerIds,
        warningIds: current.warningIds,
      },
      {
        actor,
        reason: typeof body.reason === 'string' ? body.reason : null,
        auditEventType: 'packet.validated',
      },
    );
    res.json({
      status: validation.approvalEligible ? 'ok' : 'blocked',
      packet: updated,
      validation,
      blockers: validation.findings.filter((finding) => finding.severity === 'blocker'),
    });
  }));

  router.post('/:packetInstanceId/return-for-correction', asyncH(async (req, res) => {
    const body = asRecord(req.body) as PacketMutationBody;
    const actor = requireActor(req);
    const current = await getScopedPacket(store, req, req.params.packetInstanceId);
    const packet = await transitionPacket(
      store,
      current.packetInstanceId,
      expectedRevision(body),
      'RETURNED_FOR_CORRECTION',
      actor,
      typeof body.reason === 'string' ? body.reason : undefined,
    );
    res.json({ status: 'ok', packet });
  }));

  router.post('/:packetInstanceId/approve', asyncH(async (req, res) => {
    const body = asRecord(req.body) as PacketMutationBody;
    const actor = requireActor(req);
    const current = await getScopedPacket(store, req, req.params.packetInstanceId);
    const validation = buildValidationResult(current);
    if (!validation.approvalEligible) {
      throw validationBlockersError(validation);
    }
    const packet = await transitionPacket(
      store,
      current.packetInstanceId,
      expectedRevision(body),
      'APPROVED_FOR_SIGNATURE',
      actor,
      typeof body.reason === 'string' ? body.reason : undefined,
    );
    res.json({ status: 'ok', packet, validation });
  }));

  router.post('/:packetInstanceId/reject', asyncH(async (req, res) => {
    const body = asRecord(req.body) as PacketMutationBody;
    const actor = requireActor(req);
    const current = await getScopedPacket(store, req, req.params.packetInstanceId);
    const packet = await transitionPacket(
      store,
      current.packetInstanceId,
      expectedRevision(body),
      'RETURNED_FOR_CORRECTION',
      actor,
      typeof body.reason === 'string' ? body.reason : undefined,
    );
    res.json({ status: 'ok', packet });
  }));

  router.use((err: unknown, _req: Request<Record<string, string>>, _res: Response, next: NextFunction) => {
    next(mapPacketError(err));
  });

  return router;
}

export const packetLifecycleRouter: Router = createPacketLifecycleRouter();
