import { Router, type NextFunction, type Request, type Response } from 'express';
import { ApiError } from '../../errors.js';
import { userPacketActor } from '../auditEvents.js';
import {
  beginAmendment,
  certifyPacket,
  createSupersedingPacket,
  lockPacket,
  PacketPublicationError,
  publishPacket,
} from '../publication.js';
import {
  FileLocalPacketStore,
  IllegalTransitionError,
  LockedPacketError,
  PacketNotFoundError,
  StaleWriteError,
  type PacketMetadataStore,
} from '../store.js';
import type {
  KpisSidecarPayload,
  PacketAuditActor,
  PacketDriveConnector,
  QapiActionSnapshot,
  QapiFindingSnapshot,
  QapiMetricSnapshot,
  QapiPipSnapshot,
  QapiWorkflowSnapshot,
} from '@/policy/packets/contracts';

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<void>;

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

export interface PacketPostLockRouterOptions {
  store?: PacketMetadataStore;
  driveConnector?: PacketDriveConnector;
}

interface CommonMutationBody {
  expectedRevision?: number;
  revision?: number;
  reason?: string;
  contentHash?: string;
  authorityVerified?: boolean;
  confidentialityVerified?: boolean;
  requiredAttachmentTypeIds?: unknown;
}

const defaultStore = new FileLocalPacketStore();

function asyncH(fn: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw validationError('request_body_invalid', 'Request body must be a JSON object.', 'body');
  }
  return value as Record<string, unknown>;
}

function stringField(body: Record<string, unknown>, field: string): string {
  const value = body[field];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw validationError('required_field_missing', `Field "${field}" is required.`, field);
  }
  return value.trim();
}

function optionalString(body: Record<string, unknown>, field: string): string | undefined {
  const value = body[field];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw validationError('field_type_invalid', `Field "${field}" must be a string.`, field);
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function expectedRevision(body: CommonMutationBody): number {
  const value = body.expectedRevision ?? body.revision;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw validationError(
      'expected_revision_required',
      'expectedRevision is required for packet post-lock mutation.',
      'expectedRevision',
      428,
    );
  }
  return value;
}

function optionalRevision(body: CommonMutationBody): number | undefined {
  const value = body.expectedRevision ?? body.revision;
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw validationError('field_type_invalid', 'expectedRevision must be a finite number.', 'expectedRevision');
  }
  return value;
}

function booleanField(body: Record<string, unknown>, field: string): boolean | undefined {
  const value = body[field];
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') {
    throw validationError('field_type_invalid', `Field "${field}" must be a boolean.`, field);
  }
  return value;
}

function stringArrayField(body: Record<string, unknown>, field: string): readonly string[] | undefined {
  const value = body[field];
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw validationError('field_type_invalid', `Field "${field}" must be an array of strings.`, field);
  }
  return value.map((item) => item.trim()).filter(Boolean);
}

function typedArrayField<T>(body: Record<string, unknown>, field: string): readonly T[] | undefined {
  const value = body[field];
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw validationError('field_type_invalid', `Field "${field}" must be an array.`, field);
  }
  return value as readonly T[];
}

function cadenceField(body: Record<string, unknown>): KpisSidecarPayload['cadence'] {
  const value = stringField(body, 'cadence').toLowerCase();
  if (value === 'monthly' || value === 'quarterly' || value === 'annual') return value;
  throw validationError('field_value_invalid', 'Field "cadence" must be monthly, quarterly, or annual.', 'cadence');
}

function sourceClassificationField(body: Record<string, unknown>): 'production' | 'synthetic' | undefined {
  const value = optionalString(body, 'sourceClassification');
  if (value === undefined) return undefined;
  if (value === 'production' || value === 'synthetic') return value;
  throw validationError(
    'field_value_invalid',
    'Field "sourceClassification" must be production or synthetic.',
    'sourceClassification',
  );
}

function idempotencyKey(req: Request, body: Record<string, unknown>): string {
  const fromHeader = req.header('idempotency-key') ?? req.header('x-idempotency-key');
  const fromBody = optionalString(body, 'idempotencyKey');
  const key = (fromHeader ?? fromBody ?? '').trim();
  if (!key) {
    throw validationError(
      'idempotency_key_required',
      'Idempotency-Key is required for Google Drive publication.',
      'Idempotency-Key',
      428,
    );
  }
  return key;
}

function requireActor(req: Request): PacketAuditActor {
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

function validationError(code: string, message: string, path: string, status = 400): ApiError {
  return new ApiError('validation_error', message, status, {
    blockers: [
      {
        code,
        path,
        message,
        remediation: 'Correct the request and retry without substituting missing values.',
      },
    ],
  });
}

function mapPostLockError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof PacketPublicationError) {
    return new ApiError('validation_error', error.message, error.status, {
      code: error.code,
      blockers: error.blockers,
    });
  }
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
  if (error instanceof LockedPacketError || error instanceof IllegalTransitionError) {
    return new ApiError('validation_error', error.message, 409, {
      code: error.code,
      blockers: [
        {
          code: error.code,
          path: 'packet',
          message: error.message,
          remediation: 'Use amendment or supersession for locked-packet changes.',
        },
      ],
    });
  }
  return error instanceof Error
    ? new ApiError('internal_error', error.message, 500)
    : new ApiError('internal_error', 'Internal error', 500);
}

export function createPacketPostLockRouter(options: PacketPostLockRouterOptions = {}): Router {
  const router = Router();
  const store = options.store ?? defaultStore;
  const driveConnector = options.driveConnector;

  router.post('/:packetInstanceId/publish/google-drive', asyncH(async (req, res) => {
    const body = asRecord(req.body) as CommonMutationBody & Record<string, unknown>;
    const actor = requireActor(req);
    const result = await publishPacket(
      { store, driveConnector },
      {
        packetInstanceId: req.params.packetInstanceId,
        expectedRevision: optionalRevision(body),
        actor,
        idempotencyKey: idempotencyKey(req, body),
        signedPackageId: stringField(body, 'signedPackageId'),
        canonicalPdfBase64: optionalString(body, 'canonicalPdfBase64'),
        canonicalPdfSha256: optionalString(body, 'canonicalPdfSha256'),
        contentHash: optionalString(body, 'contentHash'),
        signatureCertificateBase64: optionalString(body, 'signatureCertificateBase64'),
        signatureCertificateSha256: optionalString(body, 'signatureCertificateSha256'),
        sourceClassification: sourceClassificationField(body),
        artifactClassification: stringField(body, 'artifactClassification'),
        retentionRule: stringField(body, 'retentionRule'),
        cadence: cadenceField(body),
        kpiDefinitionVersion: stringField(body, 'kpiDefinitionVersion'),
        metricSchemaVersion: stringField(body, 'metricSchemaVersion'),
        metrics: typedArrayField<QapiMetricSnapshot>(body, 'metrics'),
        findings: typedArrayField<QapiFindingSnapshot>(body, 'findings'),
        workflows: typedArrayField<QapiWorkflowSnapshot>(body, 'workflows'),
        pips: typedArrayField<QapiPipSnapshot>(body, 'pips'),
        actionItems: typedArrayField<QapiActionSnapshot>(body, 'actionItems'),
        requiredAttachmentTypeIds: stringArrayField(body, 'requiredAttachmentTypeIds'),
        authorityVerified: booleanField(body, 'authorityVerified'),
        confidentialityVerified: booleanField(body, 'confidentialityVerified'),
      },
    );
    res.status(result.publication.idempotentReplay ? 200 : 201).json({
      status: 'ok',
      packet: result.packet,
      publication: result.publication,
      destination: result.destination,
      kpisSidecar: result.kpisSidecar,
    });
  }));

  router.post('/:packetInstanceId/certify', asyncH(async (req, res) => {
    const recordBody = asRecord(req.body);
    const body = recordBody as CommonMutationBody;
    const result = await certifyPacket(
      { store, driveConnector },
      {
        packetInstanceId: req.params.packetInstanceId,
        expectedRevision: expectedRevision(body),
        actor: requireActor(req),
        reason: optionalString(recordBody, 'reason'),
        contentHash: optionalString(recordBody, 'contentHash'),
        requiredAttachmentTypeIds: stringArrayField(recordBody, 'requiredAttachmentTypeIds'),
        authorityVerified: booleanField(recordBody, 'authorityVerified'),
        confidentialityVerified: booleanField(recordBody, 'confidentialityVerified'),
      },
    );
    res.json({ status: 'ok', packet: result.packet, checklist: result.checklist });
  }));

  router.post('/:packetInstanceId/lock', asyncH(async (req, res) => {
    const recordBody = asRecord(req.body);
    const body = recordBody as CommonMutationBody;
    const result = await lockPacket(
      { store, driveConnector },
      {
        packetInstanceId: req.params.packetInstanceId,
        expectedRevision: expectedRevision(body),
        actor: requireActor(req),
        reason: optionalString(recordBody, 'reason'),
        contentHash: optionalString(recordBody, 'contentHash'),
        requiredAttachmentTypeIds: stringArrayField(recordBody, 'requiredAttachmentTypeIds'),
        authorityVerified: booleanField(recordBody, 'authorityVerified'),
        confidentialityVerified: booleanField(recordBody, 'confidentialityVerified'),
      },
    );
    res.json({
      status: 'ok',
      packet: result.packet,
      checklist: result.checklist,
      postLockEffects: result.postLockEffects,
    });
  }));

  router.post('/:packetInstanceId/amend', asyncH(async (req, res) => {
    const body = asRecord(req.body) as CommonMutationBody;
    const result = await beginAmendment(
      { store, driveConnector },
      {
        packetInstanceId: req.params.packetInstanceId,
        expectedRevision: expectedRevision(body),
        actor: requireActor(req),
        reason: body.reason,
      },
    );
    res.json({
      status: 'ok',
      packet: result.packet,
      priorSignedArtifactUrl: result.priorSignedArtifactUrl,
    });
  }));

  router.post('/:packetInstanceId/supersede', asyncH(async (req, res) => {
    const body = asRecord(req.body) as CommonMutationBody & Record<string, unknown>;
    const actor = requireActor(req);
    const result = await createSupersedingPacket(
      { store, driveConnector },
      {
        packetInstanceId: req.params.packetInstanceId,
        expectedRevision: expectedRevision(body),
        actor,
        createdBy: optionalString(body, 'createdBy') ?? actor.actorId,
        reason: body.reason,
        eventInstanceId: optionalString(body, 'eventInstanceId'),
        workflowInstanceId: optionalString(body, 'workflowInstanceId'),
        packetTemplateId: optionalString(body, 'packetTemplateId'),
        packetId: optionalString(body, 'packetId'),
      },
    );
    res.status(201).json({
      status: 'ok',
      prior: result.prior,
      packet: result.next,
      priorSignedArtifactUrl: result.priorSignedArtifactUrl,
    });
  }));

  router.use((err: unknown, _req: Request, _res: Response, next: NextFunction) => {
    next(mapPostLockError(err));
  });

  return router;
}

export const packetPostLockRouter: Router = createPacketPostLockRouter();
