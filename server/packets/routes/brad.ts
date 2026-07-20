import { createHash } from 'node:crypto';
import { Router, type NextFunction, type Request, type Response } from 'express';
import { ApiError } from '../../errors.js';
import { readHarnessConfig } from '../../ia/harness/config.js';
import {
  BRAD_PACKET_PATCH_OBJECT_TYPE,
  getGeneratedObjectStore,
} from '../../ia/brad/generatedObjects.js';
import type { GeneratedObjectStore } from '../../ia/brad/generatedObjects.js';
import type { BradGeneratedObject } from '../../ia/brad/types.js';
import {
  BradPacketPatchValidationError,
  buildBradPacketPatchProposalContent,
  type BradPacketPatchProposalContent,
} from '../../ia/brad/packetPatches.js';
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
import type { PacketAuditActor } from '@/policy/packets/contracts';

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

export interface PacketBradRouterOptions {
  store?: PacketMetadataStore;
  generatedObjectStore?: GeneratedObjectStore;
}

interface PacketMutationBody {
  expectedRevision?: number;
  revision?: number;
  reason?: string;
  bradProposalId?: string;
  proposalId?: string;
  action?: BradPacketPatchAction;
  modifiedPatch?: PacketInstancePatch;
  editPatch?: PacketInstancePatch;
}

const defaultStore = new FileLocalPacketStore();
const BRAD_PACKET_PATCH_ACTIONS = [
  'accept',
  'accept-related',
  'modify',
  'save-as-note',
] as const;

type BradPacketPatchAction = (typeof BRAD_PACKET_PATCH_ACTIONS)[number];

function asyncH(fn: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw structuredBlockerError('request_body_invalid', 'Request body must be a JSON object.');
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw structuredBlockerError('required_field_missing', `Field "${field}" is required.`, field);
  }
  return value.trim();
}

function paramString(value: string | string[] | undefined, field: string): string {
  return requiredString(Array.isArray(value) ? value[0] : value, field);
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

function actionFromBody(body: PacketMutationBody): BradPacketPatchAction {
  const action = body.action ?? 'accept';
  if (!BRAD_PACKET_PATCH_ACTIONS.includes(action)) {
    throw structuredBlockerError('field_value_invalid', `Unsupported Brad patch action: ${String(action)}`, 'action');
  }
  return action;
}

function packetPatchFromUnknown(value: unknown, path: string): PacketInstancePatch {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw structuredBlockerError('field_type_invalid', `${path} must be a JSON object.`, path);
  }
  return value as PacketInstancePatch;
}

function defaultAcceptedPatch(
  packet: PacketStoreDocument,
  content: BradPacketPatchProposalContent,
): PacketInstancePatch {
  if (content.editPatch) return content.editPatch;
  const marker = `brad-patch-${createHash('sha256')
    .update(`${packet.packetInstanceId}:${content.createdAt}:${content.proposedPatch.requestedChange}`)
    .digest('hex')
    .slice(0, 12)}`;
  return { warningIds: [...new Set([...packet.warningIds, marker])] };
}

function notePatch(packet: PacketStoreDocument, proposalId: string): PacketInstancePatch {
  const marker = `brad-note-${createHash('sha256')
    .update(`${packet.packetInstanceId}:${proposalId}`)
    .digest('hex')
    .slice(0, 12)}`;
  return { warningIds: [...new Set([...packet.warningIds, marker])] };
}

function acceptedPatchForAction(
  action: BradPacketPatchAction,
  packet: PacketStoreDocument,
  content: BradPacketPatchProposalContent,
  proposalId: string,
  body: PacketMutationBody,
): PacketInstancePatch {
  if (action === 'modify') {
    return packetPatchFromUnknown(body.modifiedPatch ?? body.editPatch, 'modifiedPatch');
  }
  if (action === 'save-as-note') {
    return notePatch(packet, proposalId);
  }
  return defaultAcceptedPatch(packet, content);
}

function bradAssistedActor(actor: PacketAuditActor, proposalId: string): PacketAuditActor {
  return {
    ...actor,
    actorRole: actor.actorRole ?? 'packet-editor',
    onBehalfOf: `brad:${proposalId}`,
  };
}

function bradAcceptanceReason(
  proposalId: string,
  immutableHash: string,
  action: BradPacketPatchAction,
  userReason: string | undefined,
): string {
  const parts = [
    'brad_involved=true',
    `proposal=${proposalId}`,
    `action=${action}`,
    `immutable_hash=${immutableHash}`,
  ];
  if (userReason?.trim()) parts.push(`acceptor_reason=${userReason.trim()}`);
  return parts.join('; ');
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

function requirePacketScope(req: Request, packet: PacketStoreDocument): void {
  assertAgencyScope(req, packet.agencyId);
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

async function getScopedPacket(
  store: PacketMetadataStore,
  req: Request,
  packetInstanceId: string,
): Promise<PacketStoreDocument> {
  requireActor(req);
  const packet = await store.getById(packetInstanceId);
  if (!packet) throw new PacketNotFoundError(packetInstanceId);
  requirePacketScope(req, packet);
  return packet;
}

function canonicalize(value: unknown): string {
  return JSON.stringify(value, (_key, node) => {
    if (node && typeof node === 'object' && !Array.isArray(node)) {
      return Object.keys(node as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = (node as Record<string, unknown>)[key];
          return acc;
        }, {});
    }
    return node;
  });
}

function packetProposalSnapshotHash(content: BradPacketPatchProposalContent): string {
  return createHash('sha256')
    .update(canonicalize({
      packetInstanceId: content.packetInstanceId,
      packetRevision: content.packetRevision,
      proposedPatch: content.proposedPatch,
      editPatch: content.editPatch,
    }))
    .digest('hex');
}

function sourcePolicyIds(content: BradPacketPatchProposalContent): string[] {
  return content.proposedPatch.sources
    .map((source) => source.policyId)
    .filter((sourceId): sourceId is string => !!sourceId);
}

function sourceFormIds(content: BradPacketPatchProposalContent): string[] {
  return content.proposedPatch.sources
    .map((source) => source.formId)
    .filter((sourceId): sourceId is string => !!sourceId);
}

function proposalContent(
  object: BradGeneratedObject | null,
  packetInstanceId: string,
): BradPacketPatchProposalContent {
  if (!object || object.metadata.object_type !== BRAD_PACKET_PATCH_OBJECT_TYPE) {
    throw structuredBlockerError('brad_proposal_not_found', 'Brad proposal was not found.', 'proposalId', 404);
  }
  const content = object.content as Partial<BradPacketPatchProposalContent>;
  if (
    content.kind !== 'brad-packet-patch-proposal' ||
    content.packetInstanceId !== packetInstanceId ||
    typeof content.packetRevision !== 'number' ||
    !content.proposedPatch ||
    content.applyEndpoint !== `/api/packets/${packetInstanceId}/edits`
  ) {
    throw structuredBlockerError(
      'brad_proposal_packet_mismatch',
      'Brad proposal does not belong to this packet.',
      'proposalId',
      409,
    );
  }
  return content as BradPacketPatchProposalContent;
}

function assertProposalIntegrity(
  objectStore: GeneratedObjectStore,
  object: BradGeneratedObject,
): void {
  if (!objectStore.verifyIntegrity(object.metadata.object_id)) {
    throw structuredBlockerError(
      'brad_proposal_integrity_failed',
      'Brad proposal integrity verification failed.',
      'proposalId',
      409,
    );
  }
}

function assertEditableApprovedProposal(object: BradGeneratedObject): void {
  const status = object.metadata.write_status;
  if (status !== 'approved') {
    throw structuredBlockerError(
      'brad_proposal_not_accepted',
      'Brad proposal must be accepted before it can be applied through /edits.',
      'proposalId',
      409,
    );
  }
}

async function applyBradProposalEdit(input: {
  store: PacketMetadataStore;
  objectStore: GeneratedObjectStore;
  actor: PacketAuditActor;
  packet: PacketStoreDocument;
  proposalId: string;
  object: BradGeneratedObject;
  content: BradPacketPatchProposalContent;
  body: PacketMutationBody;
}): Promise<{
  action: BradPacketPatchAction;
  packet: PacketStoreDocument;
  proposal: BradGeneratedObject;
}> {
  assertEditableApprovedProposal(input.object);
  const action = actionFromBody(input.body);
  const patch = acceptedPatchForAction(
    action,
    input.packet,
    input.content,
    input.proposalId,
    input.body,
  );
  const updated = await input.store.update(
    input.packet.packetInstanceId,
    expectedRevision(input.body),
    patch,
    {
      actor: bradAssistedActor(input.actor, input.proposalId),
      reason: bradAcceptanceReason(
        input.proposalId,
        input.object.metadata.immutable_audit_hash,
        action,
        input.body.reason,
      ),
    },
  );
  input.objectStore.transition(input.proposalId, 'applied', input.actor.actorId);
  return {
    action,
    packet: updated,
    proposal: input.objectStore.get(input.proposalId)!,
  };
}

function mapPacketBradError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof BradPacketPatchValidationError) {
    return structuredBlockerError(error.code, error.message, error.path);
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
  if (
    error instanceof ForbiddenFieldError ||
    error instanceof ImmutableIdentityError ||
    error instanceof LifecycleOwnedFieldError ||
    error instanceof LockedPacketError
  ) {
    return new ApiError('validation_error', error.message, 409, {
      code: error.code,
      blockers: [
        {
          code: error.code,
          path: 'packet',
          message: error.message,
          remediation: 'Reload the packet, resolve blockers, and retry through the governed edit path.',
        },
      ],
    });
  }
  return error instanceof Error
    ? new ApiError('internal_error', error.message, 500)
    : new ApiError('internal_error', 'Internal error', 500);
}

export function createPacketBradRouter(options: PacketBradRouterOptions = {}): Router {
  const router = Router();
  const store = options.store ?? defaultStore;
  const objectStore = options.generatedObjectStore ?? getGeneratedObjectStore();

  router.post('/:packetInstanceId/brad/propose', asyncH(async (req, res) => {
    const actor = requireActor(req);
    const packetInstanceId = paramString(req.params.packetInstanceId, 'packetInstanceId');
    const packet = await getScopedPacket(store, req, packetInstanceId);
    const body = asRecord(req.body);
    const content = buildBradPacketPatchProposalContent({
      packet,
      requestedByUserId: actor.actorId,
      body,
    });
    const cfg = readHarnessConfig();
    const object = objectStore.create<BradPacketPatchProposalContent>({
      objectType: BRAD_PACKET_PATCH_OBJECT_TYPE,
      requestedByUserId: actor.actorId,
      content,
      runtimeMode: cfg.brad.runtimeMode,
      modelProvider: cfg.brad.provider,
      modelId: cfg.brad.modelId,
      promptVersion: cfg.brad.promptVersion,
      sourceSnapshotHash: packetProposalSnapshotHash(content),
      initialWriteStatus: 'proposed',
      sourceEventId: packet.eventInstanceId,
      sourceWorkflowId: packet.workflowId,
      sourcePolicyIds: sourcePolicyIds(content),
      sourceFormIds: sourceFormIds(content),
    });
    res.status(201).json({
      status: 'ok',
      proposalId: object.metadata.object_id,
      proposal: object,
      object,
      proposedPatch: content.proposedPatch,
      applyEndpoint: content.applyEndpoint,
      packetEffectApplied: false,
      packetMutationApplied: false,
    });
  }));

  router.post('/:packetInstanceId/brad/proposals/:proposalId/accept', asyncH(async (req, res) => {
    const actor = requireActor(req);
    const packetInstanceId = paramString(req.params.packetInstanceId, 'packetInstanceId');
    const proposalId = paramString(req.params.proposalId, 'proposalId');
    const packet = await getScopedPacket(store, req, packetInstanceId);
    const body = asRecord(req.body) as PacketMutationBody;
    const object = objectStore.get(proposalId);
    const content = proposalContent(object, packetInstanceId);
    assertProposalIntegrity(objectStore, object!);
    if (object!.metadata.write_status === 'denied' || object!.metadata.write_status === 'applied') {
      throw structuredBlockerError(
        'brad_proposal_not_acceptable',
        'Brad proposal can no longer be accepted.',
        'proposalId',
        409,
      );
    }
    if (object!.metadata.write_status !== 'approved') {
      objectStore.transition(object!.metadata.object_id, 'approved', actor.actorId);
    }
    const approved = objectStore.get(object!.metadata.object_id)!;
    const applied = await applyBradProposalEdit({
      store,
      objectStore,
      actor,
      packet,
      proposalId,
      object: approved,
      content,
      body,
    });
    res.json({
      status: 'accepted',
      action: applied.action,
      proposalId: object!.metadata.object_id,
      proposal: applied.proposal,
      packet: applied.packet,
      packetInstanceId: content.packetInstanceId,
      applyEndpoint: content.applyEndpoint,
      appliedVia: content.applyEndpoint,
      packetEffectApplied: true,
      packetMutationApplied: true,
      bradInvolvement: {
        proposedBy: 'brad',
        appliedBy: actor.actorId,
        auditEventType: 'packet.edited',
      },
    });
  }));

  router.post('/:packetInstanceId/brad/proposals/:proposalId/reject', asyncH(async (req, res) => {
    const actor = requireActor(req);
    const packetInstanceId = paramString(req.params.packetInstanceId, 'packetInstanceId');
    const proposalId = paramString(req.params.proposalId, 'proposalId');
    await getScopedPacket(store, req, packetInstanceId);
    const object = objectStore.get(proposalId);
    const content = proposalContent(object, packetInstanceId);
    assertProposalIntegrity(objectStore, object!);
    if (object!.metadata.write_status === 'applied') {
      throw structuredBlockerError(
        'brad_proposal_already_applied',
        'Applied Brad proposals cannot be rejected.',
        'proposalId',
        409,
      );
    }
    if (object!.metadata.write_status !== 'denied') {
      objectStore.transition(object!.metadata.object_id, 'denied', actor.actorId);
    }
    const rejected = objectStore.get(object!.metadata.object_id)!;
    res.json({
      status: 'rejected',
      action: 'reject',
      proposalId: object!.metadata.object_id,
      proposal: rejected,
      packetInstanceId: content.packetInstanceId,
      packetEffectApplied: false,
      packetMutationApplied: false,
    });
  }));

  router.post('/:packetInstanceId/edits', asyncH(async (req, res) => {
    const actor = requireActor(req);
    const packetInstanceId = paramString(req.params.packetInstanceId, 'packetInstanceId');
    const packet = await getScopedPacket(store, req, packetInstanceId);
    const body = asRecord(req.body) as PacketMutationBody;
    const proposalId = requiredString(body.bradProposalId ?? body.proposalId, 'bradProposalId');
    const object = objectStore.get(proposalId);
    const content = proposalContent(object, packetInstanceId);
    assertProposalIntegrity(objectStore, object!);
    const applied = await applyBradProposalEdit({
      store,
      objectStore,
      actor,
      packet,
      proposalId,
      object: object!,
      content,
      body,
    });
    res.json({
      status: 'ok',
      packet: applied.packet,
      proposalId,
      proposal: applied.proposal,
      appliedVia: content.applyEndpoint,
      bradInvolvement: {
        proposedBy: 'brad',
        appliedBy: actor.actorId,
        auditEventType: 'packet.edited',
      },
    });
  }));

  router.use((err: unknown, _req: Request, _res: Response, next: NextFunction) => {
    next(mapPacketBradError(err));
  });

  return router;
}

export const packetBradRouter: Router = createPacketBradRouter();
export const createBradPacketRouter = createPacketBradRouter;
export const bradPacketRouter = packetBradRouter;
