import { Router, type NextFunction, type Request, type Response } from 'express';
import { ApiError } from '../../errors.js';
import type { PacketEnvelope } from '@/policy/packets/contracts';
import type {
  EnvelopeFormPreparation,
  EnvelopeSignerPreparation,
  ExtendEnvelopeInput,
  MaterialEditEnvelopeInput,
  PreparedEnvelopeResult,
  PrepareEnvelopeInput,
  RemindEnvelopeInput,
  ReplaceSignerEnvelopeInput,
  SendEnvelopeInput,
  VoidEnvelopeInput,
} from '../envelope/envelopeService.js';

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<void>;
type JsonRecord = Record<string, unknown>;

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

export interface ScheduleSendEnvelopeInput extends SendEnvelopeInput {
  sendAt: string;
}

export interface SavePreparedEnvelopeInput extends PrepareEnvelopeInput {
  saveMode: 'save-prepared';
}

export interface EcignEnvelopeStatusResult {
  packetInstanceId: string;
  envelope: PacketEnvelope | null;
}

export interface PacketEcignEnvelopeService {
  prepare: (input: PrepareEnvelopeInput) => Promise<PreparedEnvelopeResult>;
  send: (input: SendEnvelopeInput) => Promise<PacketEnvelope>;
  remind: (input: RemindEnvelopeInput) => Promise<PacketEnvelope>;
  resend: (input: RemindEnvelopeInput) => Promise<PacketEnvelope>;
  void: (input: VoidEnvelopeInput) => Promise<PacketEnvelope>;
  cancel: (input: VoidEnvelopeInput) => Promise<PacketEnvelope>;
  invalidateForMaterialEdit: (input: MaterialEditEnvelopeInput) => Promise<PacketEnvelope>;
  replaceSigner: (input: ReplaceSignerEnvelopeInput) => Promise<PacketEnvelope>;
  extend: (input: ExtendEnvelopeInput) => Promise<PacketEnvelope>;
  refreshStatus: (envelopeId: string) => Promise<PacketEnvelope>;
  scheduleSend?: (input: ScheduleSendEnvelopeInput) => Promise<PacketEnvelope>;
  savePrepared?: (input: SavePreparedEnvelopeInput) => Promise<PreparedEnvelopeResult | PacketEnvelope>;
  returnForCorrection?: (input: MaterialEditEnvelopeInput) => Promise<PacketEnvelope>;
  statusForPacket?: (packetInstanceId: string) => Promise<EcignEnvelopeStatusResult>;
}

export interface PacketEcignRouterOptions {
  envelopeService?: PacketEcignEnvelopeService;
}

const SERVICE_LOCALS = [
  'packetEnvelopeService',
  'packetsEnvelopeService',
  'ecignEnvelopeService',
  'envelopeService',
] as const;

function asyncH(fn: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction) => {
    void fn(req, res, next).catch(next);
  };
}

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asRecord(value: unknown): JsonRecord {
  if (!isRecord(value)) {
    throw structuredBlockerError('request_body_invalid', 'Request body must be a JSON object.');
  }
  return value;
}

function bodyRecord(req: Request): JsonRecord {
  return asRecord(req.body);
}

function optionalBodyRecord(req: Request): JsonRecord | undefined {
  if (req.body === undefined) return undefined;
  return isRecord(req.body) ? req.body : undefined;
}

function stringField(record: JsonRecord, field: string): string {
  const value = record[field];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw structuredBlockerError('required_field_missing', `Field "${field}" is required.`, field);
  }
  return value.trim();
}

function optionalStringField(record: JsonRecord, field: string): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(record, field)) return undefined;
  const value = record[field];
  if (value === null || value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw structuredBlockerError('field_type_invalid', `Field "${field}" must be a string.`, field);
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function optionalNumberField(record: JsonRecord, field: string): number | undefined {
  if (!Object.prototype.hasOwnProperty.call(record, field)) return undefined;
  const value = record[field];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw structuredBlockerError('field_type_invalid', `Field "${field}" must be a finite number.`, field);
  }
  return value;
}

function optionalBooleanField(record: JsonRecord, field: string): boolean | undefined {
  if (!Object.prototype.hasOwnProperty.call(record, field)) return undefined;
  const value = record[field];
  if (typeof value !== 'boolean') {
    throw structuredBlockerError('field_type_invalid', `Field "${field}" must be a boolean.`, field);
  }
  return value;
}

function optionalStringArray(record: JsonRecord, field: string): string[] | undefined {
  if (!Object.prototype.hasOwnProperty.call(record, field)) return undefined;
  const value = record[field];
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw structuredBlockerError('field_type_invalid', `Field "${field}" must be an array of strings.`, field);
  }
  return value.map((item) => item.trim()).filter(Boolean);
}

function recordArray(record: JsonRecord, field: string): JsonRecord[] {
  const value = record[field];
  if (!Array.isArray(value) || !value.every(isRecord)) {
    throw structuredBlockerError('field_type_invalid', `Field "${field}" must be an array of objects.`, field);
  }
  return value;
}

function optionalRecordArray(record: JsonRecord, field: string): JsonRecord[] | undefined {
  if (!Object.prototype.hasOwnProperty.call(record, field)) return undefined;
  return recordArray(record, field);
}

function packetInstanceId(req: Request): string {
  const value = req.params['packetInstanceId'];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw structuredBlockerError('required_field_missing', 'packetInstanceId path parameter is required.', 'packetInstanceId');
  }
  return value.trim();
}

function singleQueryString(value: unknown): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function envelopeId(req: Request): string {
  const body = optionalBodyRecord(req);
  const fromBody = body ? optionalStringField(body, 'envelopeId') : undefined;
  const fromQuery = singleQueryString(req.query['envelopeId']);
  const value = fromBody ?? fromQuery;
  if (!value) {
    throw structuredBlockerError(
      'required_field_missing',
      'Field "envelopeId" is required for this eCIgn envelope action.',
      'envelopeId',
    );
  }
  return value;
}

function requireIdempotencyKey(req: Request): string {
  const value = req.header('idempotency-key') ?? req.header('x-idempotency-key');
  const key = value?.trim();
  if (!key) {
    throw structuredBlockerError(
      'idempotency_key_required',
      'Idempotency-Key is required for eCIgn envelope operations.',
      'Idempotency-Key',
      428,
    );
  }
  return key;
}

function requireActorId(req: Request): string {
  const packetReq = req as PacketActorRequest;
  const actor = packetReq.actor;
  if (!packetReq.session?.authenticated || !actor) {
    throw new ApiError('auth_error', 'Authenticated user required.', 401);
  }
  if (actor.type === 'user' && actor.user_id) return actor.user_id;
  if (actor.type === 'service' && actor.service_id) return actor.service_id;
  if (actor.type === 'system' && actor.service_id) return actor.service_id;
  throw new ApiError('auth_error', 'Authenticated user or service identity required.', 401);
}

function prepareInput(req: Request): PrepareEnvelopeInput {
  const body = bodyRecord(req);
  const actorId = requireActorId(req);
  const input: PrepareEnvelopeInput = {
    packetId: packetInstanceId(req),
    packetVersionId: stringField(body, 'packetVersionId'),
    eventId: stringField(body, 'eventId'),
    workflowId: stringField(body, 'workflowId'),
    requestedBy: optionalStringField(body, 'requestedBy') ?? actorId,
    forms: parseForms(body),
    signers: parseSigners(body),
  };
  const requestedEnvelopeId = optionalStringField(body, 'envelopeId');
  if (requestedEnvelopeId !== undefined) {
    input.envelopeId = requestedEnvelopeId;
  }
  return input;
}

function parseForms(body: JsonRecord): EnvelopeFormPreparation[] {
  return recordArray(body, 'forms').map((record) => {
    const form: EnvelopeFormPreparation = {
      formId: stringField(record, 'formId'),
    };
    const formTemplateId = optionalStringField(record, 'formTemplateId');
    const title = optionalStringField(record, 'title');
    const pageCount = optionalNumberField(record, 'pageCount');
    const preSignatureArtifactId = optionalStringField(record, 'preSignatureArtifactId');
    const requiredSignerIds = optionalStringArray(record, 'requiredSignerIds');
    const fields = optionalRecordArray(record, 'signatureFields')?.map(parseSignatureField);

    if (formTemplateId !== undefined) form.formTemplateId = formTemplateId;
    if (title !== undefined) form.title = title;
    if (pageCount !== undefined) form.pageCount = pageCount;
    if (preSignatureArtifactId !== undefined) form.preSignatureArtifactId = preSignatureArtifactId;
    if (requiredSignerIds !== undefined) form.requiredSignerIds = requiredSignerIds;
    if (fields !== undefined) form.signatureFields = fields;
    return form;
  });
}

function parseSignatureField(
  record: JsonRecord,
): NonNullable<EnvelopeFormPreparation['signatureFields']>[number] {
  const field: NonNullable<EnvelopeFormPreparation['signatureFields']>[number] = {};
  const id = optionalStringField(record, 'id');
  const signerId = optionalStringField(record, 'signerId');
  const role = optionalStringField(record, 'role');
  const kind = optionalStringField(record, 'kind');
  const page = optionalNumberField(record, 'page');
  const x = optionalNumberField(record, 'x');
  const y = optionalNumberField(record, 'y');
  const width = optionalNumberField(record, 'width');
  const height = optionalNumberField(record, 'height');
  const required = optionalBooleanField(record, 'required');
  const label = optionalStringField(record, 'label');

  if (id !== undefined) field.id = id;
  if (signerId !== undefined) field.signerId = signerId;
  if (role !== undefined) field.role = role;
  if (kind !== undefined) field.kind = parseSignatureFieldKind(kind);
  if (page !== undefined) field.page = page;
  if (x !== undefined) field.x = x;
  if (y !== undefined) field.y = y;
  if (width !== undefined) field.width = width;
  if (height !== undefined) field.height = height;
  if (required !== undefined) field.required = required;
  if (label !== undefined) field.label = label;
  return field;
}

function parseSignatureFieldKind(
  value: string,
): NonNullable<EnvelopeFormPreparation['signatureFields']>[number]['kind'] {
  if (value === 'signature' || value === 'initial' || value === 'date' || value === 'name') {
    return value;
  }
  throw structuredBlockerError(
    'field_value_invalid',
    'Field "kind" must be signature, initial, date, or name.',
    'signatureFields.kind',
  );
}

function parseSigners(body: JsonRecord): EnvelopeSignerPreparation[] {
  return recordArray(body, 'signers').map((record) => {
    const signer: EnvelopeSignerPreparation = {
      id: stringField(record, 'id'),
    };
    const role = optionalStringField(record, 'role');
    const routingOrder = optionalNumberField(record, 'routingOrder');
    const name = optionalStringField(record, 'name');
    const email = optionalStringField(record, 'email');

    if (role !== undefined) signer.role = role;
    if (routingOrder !== undefined) signer.routingOrder = routingOrder;
    if (name !== undefined) signer.name = name;
    if (email !== undefined) signer.email = email;
    return signer;
  });
}

function actionInput(req: Request): SendEnvelopeInput {
  return {
    envelopeId: envelopeId(req),
    actorId: requireActorId(req),
  };
}

function remindInput(req: Request): RemindEnvelopeInput {
  const body = bodyRecord(req);
  const input: RemindEnvelopeInput = actionInput(req);
  const signerId = optionalStringField(body, 'signerId');
  if (signerId !== undefined) input.signerId = signerId;
  return input;
}

function voidInput(req: Request): VoidEnvelopeInput {
  const body = bodyRecord(req);
  return {
    ...actionInput(req),
    reason: stringField(body, 'reason'),
  };
}

function replaceSignerInput(req: Request): ReplaceSignerEnvelopeInput {
  const body = bodyRecord(req);
  return {
    ...actionInput(req),
    fromSignerId: stringField(body, 'fromSignerId'),
    toSignerId: stringField(body, 'toSignerId'),
    reason: stringField(body, 'reason'),
  };
}

function extendInput(req: Request): ExtendEnvelopeInput {
  const body = bodyRecord(req);
  return {
    ...actionInput(req),
    expiresAt: stringField(body, 'expiresAt'),
    reason: stringField(body, 'reason'),
  };
}

function scheduleSendInput(req: Request): ScheduleSendEnvelopeInput {
  const body = bodyRecord(req);
  return {
    ...actionInput(req),
    sendAt: stringField(body, 'sendAt'),
  };
}

function savePreparedInput(req: Request): SavePreparedEnvelopeInput {
  return {
    ...prepareInput(req),
    saveMode: 'save-prepared',
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
        remediation: 'Correct the request and retry without substituting unknown values.',
      },
    ],
  });
}

function notConfigured(operation: string): ApiError {
  return new ApiError('internal_error', `eCIgn ${operation} delegate is not configured.`, 501, {
    reason: 'ecign_envelope_service_missing',
  });
}

function resolveEnvelopeService(
  req: Request,
  configured: PacketEcignEnvelopeService | undefined,
): PacketEcignEnvelopeService {
  if (configured !== undefined) return configured;

  const locals = req.app.locals as JsonRecord;
  for (const key of SERVICE_LOCALS) {
    const candidate = locals[key];
    if (isEnvelopeService(candidate)) return candidate;
  }

  throw notConfigured('service');
}

function isEnvelopeService(candidate: unknown): candidate is PacketEcignEnvelopeService {
  if (!isRecord(candidate)) return false;
  return (
    typeof candidate['prepare'] === 'function' &&
    typeof candidate['send'] === 'function' &&
    typeof candidate['remind'] === 'function' &&
    typeof candidate['resend'] === 'function' &&
    typeof candidate['void'] === 'function' &&
    typeof candidate['cancel'] === 'function' &&
    typeof candidate['invalidateForMaterialEdit'] === 'function' &&
    typeof candidate['replaceSigner'] === 'function' &&
    typeof candidate['extend'] === 'function' &&
    typeof candidate['refreshStatus'] === 'function'
  );
}

function mapEcignError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!(error instanceof Error)) return new ApiError('internal_error', 'Internal error', 500);

  const message = error.message;
  const lower = message.toLowerCase();
  if (lower.includes('not configured')) {
    return new ApiError('internal_error', message, 501, { reason: 'ecign_delegate_missing' });
  }

  const status = lower.includes('missing') || lower.includes('requires') ? 400 : 409;
  return new ApiError('validation_error', message, status, {
    blockers: [
      {
        code: 'ecign_envelope_action_blocked',
        path: 'ecign',
        message,
        remediation: 'Reload the envelope status, resolve blockers, and retry the allowed eCIgn action.',
      },
    ],
  });
}

function preparedResponse(
  packetId: string,
  idempotencyKey: string,
  result: PreparedEnvelopeResult,
) {
  return {
    status: 'ok',
    packetInstanceId: packetId,
    idempotencyKey,
    envelope: result.envelope,
    memberFormInstances: result.memberFormInstances,
    signaturePlacementMap: result.signaturePlacementMap,
    previewModel: result.previewModel,
  };
}

function envelopeResponse(packetId: string, idempotencyKey: string, envelope: PacketEnvelope) {
  return {
    status: 'ok',
    packetInstanceId: packetId,
    idempotencyKey,
    envelope,
  };
}

function isPreparedEnvelopeResult(value: unknown): value is PreparedEnvelopeResult {
  return isRecord(value) && isRecord(value['envelope']) && Array.isArray(value['memberFormInstances']);
}

export function createPacketEcignRouter(options: PacketEcignRouterOptions = {}): Router {
  const router = Router();

  router.post('/:packetInstanceId/ecign/prepare', asyncH(async (req, res) => {
    const key = requireIdempotencyKey(req);
    const packetId = packetInstanceId(req);
    const result = await resolveEnvelopeService(req, options.envelopeService).prepare(prepareInput(req));
    res.status(201).json(preparedResponse(packetId, key, result));
  }));

  router.post('/:packetInstanceId/ecign/save-prepared', asyncH(async (req, res) => {
    const key = requireIdempotencyKey(req);
    const packetId = packetInstanceId(req);
    const service = resolveEnvelopeService(req, options.envelopeService);
    const result = service.savePrepared !== undefined
      ? await service.savePrepared(savePreparedInput(req))
      : await service.prepare(savePreparedInput(req));
    if (isPreparedEnvelopeResult(result)) {
      res.status(201).json(preparedResponse(packetId, key, result));
      return;
    }
    res.json(envelopeResponse(packetId, key, result));
  }));

  router.post('/:packetInstanceId/ecign/send', asyncH(async (req, res) => {
    const key = requireIdempotencyKey(req);
    const packetId = packetInstanceId(req);
    const envelope = await resolveEnvelopeService(req, options.envelopeService).send(actionInput(req));
    res.json(envelopeResponse(packetId, key, envelope));
  }));

  router.post('/:packetInstanceId/ecign/schedule-send', asyncH(async (req, res) => {
    const key = requireIdempotencyKey(req);
    const packetId = packetInstanceId(req);
    const service = resolveEnvelopeService(req, options.envelopeService);
    if (service.scheduleSend === undefined) throw notConfigured('schedule-send');
    const envelope = await service.scheduleSend(scheduleSendInput(req));
    res.json(envelopeResponse(packetId, key, envelope));
  }));

  router.post('/:packetInstanceId/ecign/remind', asyncH(async (req, res) => {
    const key = requireIdempotencyKey(req);
    const packetId = packetInstanceId(req);
    const envelope = await resolveEnvelopeService(req, options.envelopeService).remind(remindInput(req));
    res.json(envelopeResponse(packetId, key, envelope));
  }));

  router.post('/:packetInstanceId/ecign/resend', asyncH(async (req, res) => {
    const key = requireIdempotencyKey(req);
    const packetId = packetInstanceId(req);
    const envelope = await resolveEnvelopeService(req, options.envelopeService).resend(remindInput(req));
    res.json(envelopeResponse(packetId, key, envelope));
  }));

  router.post('/:packetInstanceId/ecign/cancel-before-send', asyncH(async (req, res) => {
    const key = requireIdempotencyKey(req);
    const packetId = packetInstanceId(req);
    const envelope = await resolveEnvelopeService(req, options.envelopeService).cancel(voidInput(req));
    res.json(envelopeResponse(packetId, key, envelope));
  }));

  router.post('/:packetInstanceId/ecign/void', asyncH(async (req, res) => {
    const key = requireIdempotencyKey(req);
    const packetId = packetInstanceId(req);
    const envelope = await resolveEnvelopeService(req, options.envelopeService).void(voidInput(req));
    res.json(envelopeResponse(packetId, key, envelope));
  }));

  router.post('/:packetInstanceId/ecign/replace-signer', asyncH(async (req, res) => {
    const key = requireIdempotencyKey(req);
    const packetId = packetInstanceId(req);
    const envelope = await resolveEnvelopeService(req, options.envelopeService).replaceSigner(replaceSignerInput(req));
    res.json(envelopeResponse(packetId, key, envelope));
  }));

  router.post('/:packetInstanceId/ecign/extend', asyncH(async (req, res) => {
    const key = requireIdempotencyKey(req);
    const packetId = packetInstanceId(req);
    const envelope = await resolveEnvelopeService(req, options.envelopeService).extend(extendInput(req));
    res.json(envelopeResponse(packetId, key, envelope));
  }));

  router.post('/:packetInstanceId/ecign/return-for-correction', asyncH(async (req, res) => {
    const key = requireIdempotencyKey(req);
    const packetId = packetInstanceId(req);
    const service = resolveEnvelopeService(req, options.envelopeService);
    const input = voidInput(req);
    const envelope = service.returnForCorrection !== undefined
      ? await service.returnForCorrection(input)
      : await service.invalidateForMaterialEdit(input);
    res.json(envelopeResponse(packetId, key, envelope));
  }));

  router.post('/:packetInstanceId/ecign/material-edit', asyncH(async (req, res) => {
    const key = requireIdempotencyKey(req);
    const packetId = packetInstanceId(req);
    const envelope = await resolveEnvelopeService(req, options.envelopeService).invalidateForMaterialEdit(voidInput(req));
    res.json(envelopeResponse(packetId, key, envelope));
  }));

  router.get('/:packetInstanceId/ecign/status', asyncH(async (req, res) => {
    const packetId = packetInstanceId(req);
    requireActorId(req);
    const service = resolveEnvelopeService(req, options.envelopeService);
    const queriedEnvelopeId = singleQueryString(req.query['envelopeId']);
    if (queriedEnvelopeId !== undefined) {
      const envelope = await service.refreshStatus(queriedEnvelopeId);
      res.json({ status: 'ok', packetInstanceId: packetId, envelope });
      return;
    }
    if (service.statusForPacket !== undefined) {
      const result = await service.statusForPacket(packetId);
      res.json({ status: 'ok', ...result });
      return;
    }
    throw structuredBlockerError(
      'required_field_missing',
      'Query parameter "envelopeId" is required for eCIgn status until packet envelope lookup is configured.',
      'envelopeId',
    );
  }));

  router.use((err: unknown, _req: Request, _res: Response, next: NextFunction) => {
    next(mapEcignError(err));
  });

  return router;
}

export const packetEcignRouter: Router = createPacketEcignRouter();

export default packetEcignRouter;
