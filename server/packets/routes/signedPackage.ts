import { Router, type NextFunction, type Request, type Response } from 'express';
import { ApiError } from '../../errors.js';
import type {
  DriveArtifactPointer,
  PacketAuditActor,
  PacketAuditEvent,
  PacketEnvelope,
  PacketModel,
} from '@/policy/packets/contracts';
import { userPacketActor } from '../auditEvents.js';
import {
  FileLocalPacketStore,
  PacketNotFoundError,
  type PacketMetadataStore,
  type PacketStoreDocument,
} from '../store.js';
import {
  SignedPackageBuildError,
  buildCanonicalSignedPackage,
  type BuildCanonicalSignedPackageInput,
  type SignedPackageApprovalRecordInput,
  type SignedPackageBuilderDependencies,
  type SignedPackageCertificationRecordInput,
  type SignedPackageReferenceInput,
} from '../signedPackage.js';

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

export interface SignedPackageRouterOptions extends SignedPackageBuilderDependencies {
  store?: PacketMetadataStore;
  resolveEnvelope?: (
    packet: PacketStoreDocument,
    body: Record<string, unknown>,
  ) => Promise<PacketEnvelope | null>;
  resolvePacketModel?: (
    packet: PacketStoreDocument,
    body: Record<string, unknown>,
  ) => Promise<PacketModel | null>;
  resolveSignerAuditEvents?: (
    packet: PacketStoreDocument,
    envelope: PacketEnvelope,
    body: Record<string, unknown>,
  ) => Promise<readonly PacketAuditEvent[]>;
  resolveEvidencePointers?: (
    packet: PacketStoreDocument,
    body: Record<string, unknown>,
  ) => Promise<readonly DriveArtifactPointer[]>;
}

const defaultStore = new FileLocalPacketStore();
const HASH_FIELDS = new Set(['clientHash', 'trustedHash', 'contentHash', 'packetContentHash']);
const SIGNED_PACKAGE_CREATED_STATUSES = new Set([
  'SIGNED_PACKAGE_BUILDING',
  'CERTIFICATION_REVIEW',
  'DRIVE_PUBLISHING',
  'PUBLISHED',
  'CERTIFIED',
  'LOCKED',
]);

function asyncH(fn: AsyncRoute) {
  return (req: Request<Record<string, string>>, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw structuredBlockerError('request_body_invalid', 'Request body must be a JSON object.');
  }
  return value as Record<string, unknown>;
}

function optionalRecord(body: Record<string, unknown>, field: string): Record<string, unknown> | undefined {
  if (!Object.prototype.hasOwnProperty.call(body, field)) return undefined;
  const value = body[field];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw structuredBlockerError(
      'field_type_invalid',
      `Field "${field}" must be a JSON object.`,
      field,
    );
  }
  return value as Record<string, unknown>;
}

function optionalRecordArray(
  body: Record<string, unknown>,
  field: string,
): readonly Record<string, unknown>[] | undefined {
  if (!Object.prototype.hasOwnProperty.call(body, field)) return undefined;
  const value = body[field];
  if (
    !Array.isArray(value) ||
    !value.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item))
  ) {
    throw structuredBlockerError(
      'field_type_invalid',
      `Field "${field}" must be an array of JSON objects.`,
      field,
    );
  }
  return value as readonly Record<string, unknown>[];
}

function stringField(body: Record<string, unknown>, field: string): string {
  const value = body[field];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw structuredBlockerError('required_field_missing', `Field "${field}" is required.`, field);
  }
  return value.trim();
}

function optionalString(body: Record<string, unknown>, field: string): string | null | undefined {
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

function optionalStringArray(body: Record<string, unknown>, field: string): readonly string[] | undefined {
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

function idempotencyKey(req: Request<Record<string, string>>, body: Record<string, unknown>): string {
  const fromHeader = req.header('idempotency-key') ?? req.header('x-idempotency-key');
  const fromBody = typeof body.idempotencyKey === 'string' ? body.idempotencyKey : '';
  const key = (fromHeader ?? fromBody).trim();
  if (!key) {
    throw structuredBlockerError(
      'idempotency_key_required',
      'Idempotency-Key is required for signed-package creation.',
      'Idempotency-Key',
      428,
    );
  }
  return key;
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
        remediation: 'Correct the request and retry without changing missing values to defaults.',
      },
    ],
  });
}

function mapSignedPackageError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof PacketNotFoundError) {
    return new ApiError('event_not_found', error.message, 404, {
      code: error.code,
      packetInstanceId: error.packetInstanceId,
    });
  }
  if (error instanceof SignedPackageBuildError) {
    return new ApiError('validation_error', error.message, error.status, {
      code: error.code,
      blockers: [
        {
          code: error.code,
          path: error.path,
          message: error.message,
          remediation: 'Complete signatures and provide the required signed-package source records.',
        },
      ],
    });
  }
  return error instanceof Error
    ? new ApiError('internal_error', error.message, 500)
    : new ApiError('internal_error', 'Internal error', 500);
}

function packetInstanceIdFrom(req: Request<Record<string, string>>, body: Record<string, unknown>): string {
  const paramId = req.params.packetInstanceId?.trim();
  if (paramId) return paramId;
  return stringField(body, 'packetInstanceId');
}

function nonEmptyString(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function assertPacketReadyForSignedPackage(packet: PacketStoreDocument): void {
  if (nonEmptyString(packet.finalArtifactUrl) || SIGNED_PACKAGE_CREATED_STATUSES.has(packet.status)) {
    throw structuredBlockerError(
      'signed_package.already_exists',
      `Packet ${packet.packetInstanceId} already has a signed package.`,
      'signedPackage',
      409,
    );
  }
  if (packet.status !== 'FULLY_SIGNED') {
    throw structuredBlockerError(
      'signed_package.packet_not_fully_signed',
      `Packet ${packet.packetInstanceId} is not fully signed.`,
      'packet.status',
      409,
    );
  }
}

function defaultPacketModel(packet: PacketStoreDocument): PacketModel {
  return {
    identity: {
      packetInstanceId: packet.packetInstanceId,
      packetId: packet.packetId,
      packetVersion: packet.packetVersion,
      contentHash: packet.contentHash,
      agencyId: packet.agencyId,
      eventFamilyId: packet.eventFamilyId,
      eventInstanceId: packet.eventInstanceId,
      workflowId: packet.workflowId,
      workflowInstanceId: packet.workflowInstanceId,
      packetTemplateId: packet.packetTemplateId,
      archetypeId: packet.archetypeId,
      subtype: packet.subtype,
      reportingPeriodStart: packet.reportingPeriodStart,
      reportingPeriodEnd: packet.reportingPeriodEnd,
      dataThroughDate: packet.dataThroughDate,
      status: packet.status,
    },
    renderingProfileId: 'care-indeed-letter',
    classification: packet.sourceClassification === 'synthetic' ? 'synthetic-uat' : 'internal',
    handlingNotice: null,
    modules: packet.moduleInstances.map((module) => ({
      moduleInstanceId: module.moduleInstanceId,
      moduleId: module.moduleId,
      title: module.moduleId,
      order: module.order,
      status: module.status,
      payload: payloadRecord(module.payload),
      contentHash: module.contentHash,
    })),
    pagePlan: null,
  };
}

function payloadRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return { value };
}

async function resolveEnvelope(
  options: SignedPackageRouterOptions,
  packet: PacketStoreDocument,
  body: Record<string, unknown>,
): Promise<PacketEnvelope> {
  const resolved = await options.resolveEnvelope?.(packet, body);
  if (resolved) return bindServerResolvedEnvelopeToPacket(resolved, packet);
  const envelope = optionalRecord(body, 'envelope');
  if (!envelope) {
    throw structuredBlockerError(
      'signed_package.envelope_missing',
      'A signed envelope record is required to build a signed package.',
      'envelope',
      409,
    );
  }
  return envelope as unknown as PacketEnvelope;
}

function bindServerResolvedEnvelopeToPacket(
  envelope: PacketEnvelope,
  packet: PacketStoreDocument,
): PacketEnvelope {
  return {
    ...envelope,
    packetInstanceId: packet.packetInstanceId,
    frozenPacketVersion: packet.packetVersion,
  };
}

async function resolvePacketModel(
  options: SignedPackageRouterOptions,
  packet: PacketStoreDocument,
  body: Record<string, unknown>,
): Promise<PacketModel> {
  const resolved = await options.resolvePacketModel?.(packet, body);
  if (resolved) return resolved;
  const packetModel = optionalRecord(body, 'packetModel');
  if (packetModel) return packetModel as unknown as PacketModel;
  return defaultPacketModel(packet);
}

async function resolveSignerAuditEvents(
  options: SignedPackageRouterOptions,
  packet: PacketStoreDocument,
  envelope: PacketEnvelope,
  body: Record<string, unknown>,
): Promise<readonly PacketAuditEvent[]> {
  const resolved = await options.resolveSignerAuditEvents?.(packet, envelope, body);
  if (resolved) return resolved;
  return (optionalRecordArray(body, 'signerAuditEvents') ?? []) as readonly unknown[] as readonly PacketAuditEvent[];
}

async function resolveEvidencePointers(
  options: SignedPackageRouterOptions,
  packet: PacketStoreDocument,
  body: Record<string, unknown>,
): Promise<readonly DriveArtifactPointer[]> {
  const resolved = await options.resolveEvidencePointers?.(packet, body);
  if (resolved) return resolved;
  return (optionalRecordArray(body, 'evidencePointers') ?? []) as readonly unknown[] as readonly DriveArtifactPointer[];
}

function approvalRecordInput(body: Record<string, unknown>): SignedPackageApprovalRecordInput | undefined {
  const raw = optionalRecord(body, 'approvalRecord');
  if (!raw) return undefined;
  return {
    approvalRecordId: optionalString(raw, 'approvalRecordId') ?? undefined,
    approvalIds: optionalStringArray(raw, 'approvalIds'),
    approvedAt: optionalString(raw, 'approvedAt') ?? null,
    approvedBy: optionalString(raw, 'approvedBy') ?? null,
  };
}

function certificationRecordInput(
  body: Record<string, unknown>,
): SignedPackageCertificationRecordInput | undefined {
  const raw = optionalRecord(body, 'certificationRecord');
  if (!raw) return undefined;
  return {
    certificationRecordId: optionalString(raw, 'certificationRecordId') ?? undefined,
    certifiedAt: optionalString(raw, 'certifiedAt') ?? null,
    certifiedBy: optionalString(raw, 'certifiedBy') ?? null,
    verificationHash: optionalString(raw, 'verificationHash') ?? null,
  };
}

function referenceInputs(
  body: Record<string, unknown>,
  field: string,
): readonly SignedPackageReferenceInput[] {
  return (optionalRecordArray(body, field) ?? []).map((raw) => ({
    referenceId: stringField(raw, 'referenceId'),
    referenceType: stringField(raw, 'referenceType'),
    targetKind: stringField(raw, 'targetKind'),
    targetId: stringField(raw, 'targetId'),
    reason: optionalString(raw, 'reason') ?? null,
  }));
}

function ignoredClientHashFields(body: Record<string, unknown>): string[] {
  return [...HASH_FIELDS].filter((field) => Object.prototype.hasOwnProperty.call(body, field));
}

async function signedPackageInput(
  options: SignedPackageRouterOptions,
  req: Request<Record<string, string>>,
  body: Record<string, unknown>,
): Promise<BuildCanonicalSignedPackageInput> {
  const actor = requireActor(req);
  const store = options.store ?? defaultStore;
  const packetInstanceId = packetInstanceIdFrom(req, body);
  const packet = await store.getById(packetInstanceId);
  if (!packet) throw new PacketNotFoundError(packetInstanceId);
  assertAgencyScope(req, packet.agencyId);
  assertPacketReadyForSignedPackage(packet);
  const envelope = await resolveEnvelope(options, packet, body);
  return {
    packet,
    packetModel: await resolvePacketModel(options, packet, body),
    envelope,
    signerAuditEvents: await resolveSignerAuditEvents(options, packet, envelope, body),
    evidencePointers: await resolveEvidencePointers(options, packet, body),
    approvalRecord: approvalRecordInput(body),
    certificationRecord: certificationRecordInput(body),
    confidentialAddendumReferences: referenceInputs(body, 'confidentialAddendumReferences'),
    amendmentSupersessionReferences: referenceInputs(body, 'amendmentSupersessionReferences'),
    assembledAt: optionalString(body, 'assembledAt') ?? undefined,
    assembledBy: actor.actorId,
  };
}

export function createPacketSignedPackageRouter(
  options: SignedPackageRouterOptions = {},
): Router {
  const router = Router();

  const handlePost = asyncH(async (req, res) => {
    const body = asRecord(req.body);
    const key = idempotencyKey(req, body);
    const input = await signedPackageInput(options, req, body);
    const signedPackage = await buildCanonicalSignedPackage(input, {
      renderPacketHtml: options.renderPacketHtml,
      renderPdf: options.renderPdf,
    });
    res.status(201).json({
      status: 'ok',
      idempotencyKey: key,
      signedPackage,
      clientHashTrusted: false,
      ignoredClientFields: ignoredClientHashFields(body),
    });
  });

  router.post('/:packetInstanceId/signed-package', handlePost);
  router.post('/signed-package', handlePost);

  router.use((err: unknown, _req: Request<Record<string, string>>, _res: Response, next: NextFunction) => {
    next(mapSignedPackageError(err));
  });

  return router;
}

export const packetSignedPackageRouter: Router = createPacketSignedPackageRouter();
