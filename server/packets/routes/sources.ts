import { createHash } from 'node:crypto';
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
  type PacketMetadataStore,
  type PacketStoreDocument,
} from '../store.js';
import type {
  PacketAttachmentInstance,
  PacketAuditActor,
} from '@/policy/packets/contracts';

type AsyncRoute = (req: Request<Record<string, string>>, res: Response, next: NextFunction) => Promise<void>;

type PacketActorRequest = Request & {
  session?: { authenticated?: boolean };
  actor?: {
    type: 'user' | 'service' | 'system';
    user_id?: string;
    service_id?: string;
    roles?: string[];
    attributes?: { access_classes?: string[] };
  };
};

export interface PacketSourcesRouterOptions {
  store?: PacketMetadataStore;
}

interface AddPacketSourceBody {
  expectedRevision?: number;
  revision?: number;
  sourceId?: string;
  sourceType?: string;
  title?: string;
  mimeType?: string | null;
  evidenceId?: string | null;
  formInstanceId?: string | null;
  driveUrl?: string | null;
  confidentialityLevel?: string;
  attachmentTypeId?: string;
  clientHash?: string;
  contentHash?: string;
  hash?: string;
  reason?: string;
  sourceText?: string;
  rawBytes?: string;
  base64?: string;
}

const defaultStore = new FileLocalPacketStore();
const SOURCE_BODY_FIELDS = ['sourceText', 'rawBytes', 'base64'] as const;

function asyncH(fn: AsyncRoute) {
  return (req: Request<Record<string, string>>, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw structuredBlockerError('request_body_invalid', 'Request body must be a JSON object.');
  }
  return value as Record<string, unknown>;
}

function requiredString(body: AddPacketSourceBody, field: 'title' | 'sourceType'): string {
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

function optionalString(body: AddPacketSourceBody, field: keyof AddPacketSourceBody): string | null {
  const value = body[field];
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') {
    throw structuredBlockerError(
      'field_type_invalid',
      `Field "${field}" must be a string or null.`,
      String(field),
    );
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function expectedRevision(body: AddPacketSourceBody): number {
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
        remediation: 'Provide source metadata or an authorized evidence reference; do not send raw file bodies.',
      },
    ],
  });
}

function rejectInlineSourceBodies(body: AddPacketSourceBody): void {
  for (const field of SOURCE_BODY_FIELDS) {
    const value = body[field];
    if (typeof value === 'string' && value.trim().length > 0) {
      throw structuredBlockerError(
        'source_body_not_accepted_here',
        `Field "${field}" is not accepted by this metadata route.`,
        field,
        413,
      );
    }
  }
}

function canonical(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`)
    .join(',')}}`;
}

function serverSourceHash(input: Record<string, unknown>): string {
  const hash = createHash('sha256').update(canonical(input), 'utf8').digest('hex');
  return `sha256:${hash}`;
}

function buildAttachment(packet: PacketStoreDocument, body: AddPacketSourceBody): PacketAttachmentInstance {
  const sourceType = requiredString(body, 'sourceType');
  const title = requiredString(body, 'title');
  const sourceId = optionalString(body, 'sourceId') ?? `${sourceType}:${Date.now().toString(36)}`;
  const evidenceId = optionalString(body, 'evidenceId') ?? sourceId;
  const formInstanceId = optionalString(body, 'formInstanceId');
  const driveUrl = optionalString(body, 'driveUrl');
  const mimeType = optionalString(body, 'mimeType');
  const attachmentTypeId = optionalString(body, 'attachmentTypeId') ?? sourceType;
  const confidentialityLevel = optionalString(body, 'confidentialityLevel') ?? 'agency-confidential';
  const createdAt = new Date().toISOString();
  const serverHashInput = {
    packetInstanceId: packet.packetInstanceId,
    packetVersion: packet.packetVersion,
    sourceId,
    sourceType,
    title,
    evidenceId,
    formInstanceId,
    driveUrl,
    mimeType,
    attachmentTypeId,
    confidentialityLevel,
  };

  return {
    attachmentInstanceId: `src_${createHash('sha256').update(canonical(serverHashInput)).digest('hex').slice(0, 24)}`,
    attachmentTypeId,
    formInstanceId,
    evidenceId,
    title,
    mimeType,
    pageStart: null,
    pageEnd: null,
    confidentialityLevel,
    driveUrl,
    contentHash: serverSourceHash(serverHashInput),
    status: 'attached',
    createdAt,
    updatedAt: createdAt,
  };
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
        {
          code: error.code,
          path: 'packet',
          message: error.message,
          remediation: 'Reload the packet and retry the source mutation only on an editable packet.',
        },
      ],
    });
  }
  return error instanceof Error
    ? new ApiError('internal_error', error.message, 500)
    : new ApiError('internal_error', 'Internal error', 500);
}

export function createPacketSourcesRouter(options: PacketSourcesRouterOptions = {}): Router {
  const router = Router();
  const store = options.store ?? defaultStore;

  router.post('/:packetInstanceId/sources', asyncH(async (req, res) => {
    const body = asRecord(req.body) as AddPacketSourceBody;
    const actor = requireActor(req);
    rejectInlineSourceBodies(body);
    const packet = await store.getById(req.params.packetInstanceId);
    if (!packet) throw new PacketNotFoundError(req.params.packetInstanceId);
    assertAgencyScope(req, packet.agencyId);

    const attachment = buildAttachment(packet, body);
    const updated = await store.update(
      packet.packetInstanceId,
      expectedRevision(body),
      {
        attachmentInstances: [...packet.attachmentInstances, attachment],
      },
      {
        actor,
        reason: typeof body.reason === 'string' ? body.reason : null,
        auditEventType: 'packet.source_uploaded',
      },
    );

    res.status(201).json({
      status: 'ok',
      packet: updated,
      source: attachment,
      clientHashTrusted: false,
      ignoredClientFields: ['clientHash', 'contentHash', 'hash'].filter(
        (field) => body[field as 'clientHash' | 'contentHash' | 'hash'] !== undefined,
      ),
    });
  }));

  router.use((err: unknown, _req: Request<Record<string, string>>, _res: Response, next: NextFunction) => {
    next(mapPacketError(err));
  });

  return router;
}

export const packetSourcesRouter: Router = createPacketSourcesRouter();
