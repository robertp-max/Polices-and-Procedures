import { Router, type NextFunction, type Request, type Response } from 'express';
import {
  type SupplementalClassification,
  type SupplementalDestination,
  type SupplementalLifecycleStatus,
  type SupplementalValidationStatus,
} from '@/policy/packets/contracts';
import { ApiError } from '../../errors.js';
import {
  FileLocalPacketStore,
  PacketNotFoundError,
  type PacketMetadataStore,
  type PacketStoreDocument,
} from '../store.js';
import {
  FileLocalSupplementalInformationStore,
  IllegalSupplementalTransitionError,
  SupplementalNotFoundError,
  SupplementalStaleWriteError,
  SupplementalValidationError,
  isSupplementalClassification,
  isSupplementalDestination,
  isSupplementalLifecycleStatus,
  isSupplementalValidationStatus,
  type SupplementalInformationStore,
} from '../supplementalStore.js';

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<void>;

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

interface ActorIdentity {
  actorId: string;
  actorRole: string | null;
}

export interface PacketSupplementalRouterOptions {
  packetStore?: PacketMetadataStore;
  supplementalStore?: SupplementalInformationStore;
}

const defaultPacketStore = new FileLocalPacketStore();
const defaultSupplementalStore = new FileLocalSupplementalInformationStore();
const TERMINAL_PACKET_STATUSES = new Set(['LOCKED', 'SUPERSEDED', 'CANCELLED']);

function asyncH(fn: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw structuredBlockerError('request_body_invalid', 'Request body must be a JSON object.');
  }
  return value as Record<string, unknown>;
}

function optionalString(body: Record<string, unknown>, field: string): string | null {
  const value = body[field];
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') {
    throw structuredBlockerError(
      'field_type_invalid',
      `Field "${field}" must be a string or null.`,
      field,
    );
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function expectedRevision(body: Record<string, unknown>): number {
  const value = body.expectedRevision ?? body.revision;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw structuredBlockerError(
      'expected_revision_required',
      'expectedRevision is required for supplemental information mutation.',
      'expectedRevision',
      428,
    );
  }
  return value;
}

function optionalStringArray(
  body: Record<string, unknown>,
  field: string,
): string[] | undefined {
  const value = body[field];
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw structuredBlockerError(
      'field_type_invalid',
      `Field "${field}" must be an array of strings.`,
      field,
    );
  }
  return value.map((item) => item.trim()).filter((item) => item.length > 0);
}

function requiredClassification(body: Record<string, unknown>): SupplementalClassification {
  const value = body.classification;
  if (!isSupplementalClassification(value)) {
    throw structuredBlockerError(
      'supplemental_classification_invalid',
      'classification must be one of the 15 governed FR-019 options.',
      'classification',
    );
  }
  return value;
}

function optionalClassification(
  body: Record<string, unknown>,
): SupplementalClassification | undefined {
  if (body.classification === undefined) return undefined;
  return requiredClassification(body);
}

function requiredDestination(body: Record<string, unknown>): SupplementalDestination {
  const value = body.destination;
  if (!isSupplementalDestination(value)) {
    throw structuredBlockerError(
      'supplemental_destination_invalid',
      'destination must be one of the 12 governed FR-019 options.',
      'destination',
    );
  }
  return value;
}

function optionalDestination(body: Record<string, unknown>): SupplementalDestination | undefined {
  if (body.destination === undefined) return undefined;
  return requiredDestination(body);
}

function requiredLifecycleStatus(body: Record<string, unknown>): SupplementalLifecycleStatus {
  const value = body.lifecycleStatus ?? body.toStatus;
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : value;
  if (!isSupplementalLifecycleStatus(normalized)) {
    throw structuredBlockerError(
      'supplemental_lifecycle_status_invalid',
      'lifecycleStatus must be a governed FR-019 supplemental state.',
      'lifecycleStatus',
    );
  }
  return normalized;
}

function optionalValidationStatus(
  body: Record<string, unknown>,
): SupplementalValidationStatus | undefined {
  if (body.validationStatus === undefined) return undefined;
  if (!isSupplementalValidationStatus(body.validationStatus)) {
    throw structuredBlockerError(
      'supplemental_validation_status_invalid',
      'validationStatus is not governed.',
      'validationStatus',
    );
  }
  return body.validationStatus;
}

function requireActor(req: Request): ActorIdentity {
  const packetReq = req as PacketActorRequest;
  const actor = packetReq.actor;
  if (!packetReq.session?.authenticated || !actor) {
    throw new ApiError('auth_error', 'Authenticated user required.', 401);
  }
  if (actor.type === 'user' && actor.user_id) {
    return {
      actorId: actor.user_id,
      actorRole: actor.roles?.[0] ?? null,
    };
  }
  if (actor.type === 'service' && actor.service_id) {
    return {
      actorId: actor.service_id,
      actorRole: actor.roles?.[0] ?? null,
    };
  }
  throw new ApiError('auth_error', 'Authenticated user or service identity required.', 401);
}

function assertAgencyScope(req: Request, agencyId: string): void {
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

function assertPacketCanAcceptSupplemental(packet: PacketStoreDocument): void {
  if (TERMINAL_PACKET_STATUSES.has(packet.status)) {
    throw structuredBlockerError(
      'packet_not_editable',
      `Packet ${packet.packetInstanceId} is ${packet.status} and cannot accept supplemental information.`,
      'packet.status',
      409,
    );
  }
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
        remediation: 'Submit governed supplemental information without skipping FR-019 states.',
      },
    ],
  });
}

async function loadScopedPacket(
  req: Request,
  packetStore: PacketMetadataStore,
): Promise<PacketStoreDocument> {
  const packetInstanceId = req.params.packetInstanceId;
  const packet = await packetStore.getById(packetInstanceId);
  if (!packet) throw new PacketNotFoundError(packetInstanceId);
  assertAgencyScope(req, packet.agencyId);
  assertPacketCanAcceptSupplemental(packet);
  return packet;
}

function mapSupplementalError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof PacketNotFoundError) {
    return new ApiError('event_not_found', error.message, 404, {
      code: error.code,
      packetInstanceId: error.packetInstanceId,
    });
  }
  if (error instanceof SupplementalNotFoundError) {
    return new ApiError('event_not_found', error.message, 404, {
      code: error.code,
      packetInstanceId: error.packetInstanceId,
      intakeId: error.intakeId,
    });
  }
  if (error instanceof SupplementalStaleWriteError) {
    return new ApiError('validation_error', 'Supplemental information revision is stale.', 409, {
      code: error.code,
      packetInstanceId: error.packetInstanceId,
      intakeId: error.intakeId,
      expectedRevision: error.expectedRevision,
      actualRevision: error.actualRevision,
    });
  }
  if (error instanceof IllegalSupplementalTransitionError) {
    return new ApiError('validation_error', error.message, 409, {
      code: error.code,
      blockers: [
        {
          code: error.code,
          path: 'lifecycleStatus',
          message: error.message,
          remediation: 'Use RECEIVED -> CLASSIFIED -> MAPPED -> VALIDATED -> ACCEPTED/REJECTED -> APPLIED.',
        },
      ],
    });
  }
  if (error instanceof SupplementalValidationError) {
    return structuredBlockerError(error.code, error.message, error.field, error.status);
  }
  return error instanceof Error
    ? new ApiError('internal_error', error.message, 500)
    : new ApiError('internal_error', 'Internal error', 500);
}

export function createPacketSupplementalRouter(
  options: PacketSupplementalRouterOptions = {},
): Router {
  const router = Router();
  const packetStore = options.packetStore ?? defaultPacketStore;
  const supplementalStore = options.supplementalStore ?? defaultSupplementalStore;

  router.get('/:packetInstanceId/supplemental-information', asyncH(async (req, res) => {
    requireActor(req);
    const packet = await loadScopedPacket(req, packetStore);
    const items = await supplementalStore.list(packet.packetInstanceId);
    res.json({
      status: 'ok',
      items,
      count: items.length,
    });
  }));

  router.post('/:packetInstanceId/supplemental-information', asyncH(async (req, res) => {
    const body = asRecord(req.body);
    const actor = requireActor(req);
    const packet = await loadScopedPacket(req, packetStore);
    const item = await supplementalStore.create({
      packetInstanceId: packet.packetInstanceId,
      originalContent: optionalString(body, 'originalContent'),
      originalFilename: optionalString(body, 'originalFilename'),
      submittedBy: optionalString(body, 'submittedBy') ?? actor.actorId,
      classification: requiredClassification(body),
      destination: requiredDestination(body),
      evidenceHash: optionalString(body, 'evidenceHash'),
      confidentialityLevel: optionalString(body, 'confidentialityLevel'),
      relatedFindingIds: optionalStringArray(body, 'relatedFindingIds'),
      relatedWorkflowIds: optionalStringArray(body, 'relatedWorkflowIds'),
      relatedFormIds: optionalStringArray(body, 'relatedFormIds'),
    });

    res.status(201).json({
      status: 'ok',
      item,
      destinationPreview: item.destinationPreview,
    });
  }));

  router.patch('/:packetInstanceId/supplemental-information/:intakeId', asyncH(async (req, res) => {
    const body = asRecord(req.body);
    const actor = requireActor(req);
    const packet = await loadScopedPacket(req, packetStore);
    const toStatus = requiredLifecycleStatus(body);
    const reviewerId =
      optionalString(body, 'reviewerId') ??
      (toStatus === 'ACCEPTED' || toStatus === 'REJECTED' ? actor.actorId : undefined);

    const item = await supplementalStore.transition({
      packetInstanceId: packet.packetInstanceId,
      intakeId: req.params.intakeId,
      expectedRevision: expectedRevision(body),
      toStatus,
      classification: optionalClassification(body),
      destination: optionalDestination(body),
      validationStatus: optionalValidationStatus(body),
      reviewerId,
      appliedChangeIds: optionalStringArray(body, 'appliedChangeIds'),
      relatedFindingIds: optionalStringArray(body, 'relatedFindingIds'),
      relatedWorkflowIds: optionalStringArray(body, 'relatedWorkflowIds'),
      relatedFormIds: optionalStringArray(body, 'relatedFormIds'),
    });

    res.json({
      status: 'ok',
      item,
      destinationPreview: item.destinationPreview,
    });
  }));

  router.use((err: unknown, _req: Request, _res: Response, next: NextFunction) => {
    next(mapSupplementalError(err));
  });

  return router;
}

export const packetSupplementalRouter: Router = createPacketSupplementalRouter();

