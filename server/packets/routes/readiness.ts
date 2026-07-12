import { Router, type NextFunction, type Request, type Response } from 'express';
import { ApiError } from '../../errors.js';
import {
  PACKET_LIFECYCLE_TO_APPENDIX_D,
  buildPacketIdentityKey,
  type PacketDriveConnector,
  type PacketLifecycleStatus,
  type PriorPacketLookupResult,
  type PriorPacketQuery,
} from '@/policy/packets/contracts';
import {
  FileLocalPacketStore,
  type PacketMetadataStore,
  type PacketStoreDocument,
} from '../store.js';

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<void>;

type PacketActorRequest = Request & {
  actor?: {
    attributes?: { access_classes?: string[] };
  };
};

export type ExistingPacketDisposition =
  | 'none'
  | 'draft_or_review'
  | 'signature_tracking'
  | 'view_or_amend'
  | 'view_only';

export type ExistingPacketRecommendedAction =
  | 'create-new'
  | 'open-existing'
  | 'track-signatures'
  | 'view/amend'
  | 'view-only';

export type PacketReadinessActionId =
  | 'generate_new_packet'
  | 'open_existing_draft'
  | 'continue_review'
  | 'track_signatures'
  | 'view_signed_packet'
  | 'open_in_google_drive'
  | 'create_amendment'
  | 'create_superseding_version'
  | 'cancel';

export interface PacketReadinessIdentity {
  agencyId: string;
  eventInstanceId: string;
  eventFamilyId: string | null;
  workflowId: string | null;
  workflowInstanceId: string;
  packetTemplateId: string;
  reportingPeriodStart: string | null;
  reportingPeriodEnd: string | null;
  cadence: string | null;
}

export interface PacketReadinessAction {
  id: PacketReadinessActionId;
  label: string;
  enabled: boolean;
  reason: string | null;
}

export interface ExistingPacketReadinessBlock {
  exists: boolean;
  packetInstanceId: string | null;
  packetId: string | null;
  packetVersion: number | null;
  revision: number | null;
  status: PacketLifecycleStatus | 'unknown';
  statusLabel: string;
  recommendedAction: ExistingPacketRecommendedAction;
  duplicateHandling: 'no duplicate' | 'duplicate rejected/idempotent';
  lockedAt: string | null;
  driveFolderUrl: string | null;
  finalArtifactUrl: string | null;
}

export interface OpenDependenciesBlockersBlock {
  blockerCount: number | 'unknown';
  blockerIds: readonly string[] | 'unknown';
  openDependencies: readonly string[] | 'unknown';
}

export interface PacketReadinessSnapshot {
  identity: PacketReadinessIdentity;
  identityKey: string;
  eventWorkflowIdentity: {
    eventFamilyId: string | 'unknown';
    eventInstanceId: string;
    workflowId: string | 'unknown';
    workflowInstanceId: string;
  };
  reportingPeriod: {
    start: string | 'unknown';
    end: string | 'unknown';
  };
  selectedPacketTemplate: {
    packetTemplateId: string;
    compatible: 'unknown';
  };
  existingPacket: ExistingPacketReadinessBlock;
  duplicateGeneration: {
    allowed: boolean;
    behavior: 'create_new_packet' | 'return_existing_packet';
    reason: string;
  };
  requiredFormsEvidence: {
    requiredForms: 'unknown';
    requiredEvidence: 'unknown';
    requiredFormCompletion: 'unknown';
    evidenceCompleteness: 'unknown';
  };
  requiredApprovalsSigners: {
    requiredApprovals: 'unknown';
    requiredSigners: 'unknown';
    approvalStatus: string | 'unknown';
    signatureStatus: string | 'unknown';
  };
  openDependenciesBlockers: OpenDependenciesBlockersBlock;
  priorPeriodPacketStatus: string | 'unknown';
  trendComparisonReadiness: string | 'unknown';
  driveDestination: string | 'unknown';
  actions: readonly PacketReadinessAction[];
}

export interface PacketReadinessResponse {
  status: 'ok';
  readiness: PacketReadinessSnapshot;
}

export interface PacketReadinessRouterOptions {
  store?: PacketMetadataStore;
  driveConnector?: Pick<PacketDriveConnector, 'findPriorPacket'>;
  calendarEvents?: readonly unknown[];
  regulatoryEvents?: readonly unknown[];
}

const defaultStore = new FileLocalPacketStore();

const DRAFT_OR_REVIEW_STATUSES = new Set<PacketLifecycleStatus>([
  'SOURCE_COLLECTION',
  'DRAFT_GENERATED',
  'UNDER_ANALYSIS',
  'READY_FOR_REVIEW',
  'UNDER_REVIEW',
  'EDITING',
  'VALIDATION_REQUIRED',
  'READY_FOR_APPROVAL',
  'APPROVED_FOR_SIGNATURE',
  'SIGNER_CONFIRMATION',
  'BLOCKED',
  'RETURNED_FOR_CORRECTION',
  'SIGNATURE_DECLINED',
  'SIGNATURE_EXPIRED',
]);

const SIGNATURE_TRACKING_STATUSES = new Set<PacketLifecycleStatus>([
  'ECIGN_PREPARING',
  'SENT_FOR_SIGNATURE',
  'PARTIALLY_SIGNED',
]);

const VIEW_OR_AMEND_STATUSES = new Set<PacketLifecycleStatus>([
  'FULLY_SIGNED',
  'SIGNED_PACKAGE_BUILDING',
  'CERTIFICATION_REVIEW',
  'CERTIFIED',
  'DRIVE_PUBLISHING',
  'PUBLISHED',
  'LOCKED',
  'AMENDMENT_REQUIRED',
]);

function asyncH(fn: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

function validationError(code: string, message: string, path = 'query'): ApiError {
  return new ApiError('validation_error', message, 400, {
    blockers: [
      {
        code,
        path,
        message,
        remediation: 'Provide the required packet readiness identity value and retry.',
      },
    ],
  });
}

function singleQueryValue(req: Request, camelName: string, snakeName?: string): string | undefined {
  const raw = req.query[camelName] ?? (snakeName ? req.query[snakeName] : undefined);
  if (raw === undefined) return undefined;
  if (typeof raw === 'string') return raw.trim() || undefined;
  if (Array.isArray(raw)) {
    const first = raw.find((value): value is string => typeof value === 'string');
    return first?.trim() || undefined;
  }
  throw validationError(
    'field_type_invalid',
    `Query field "${camelName}" must be a string.`,
    camelName,
  );
}

function requireQueryValue(req: Request, camelName: string, snakeName?: string): string {
  const value = singleQueryValue(req, camelName, snakeName);
  if (!value) {
    throw validationError(
      'required_field_missing',
      `Query field "${camelName}" is required for packet readiness.`,
      camelName,
    );
  }
  return value;
}

function valueOrUnknown(value: string | null | undefined): string | 'unknown' {
  return value && value.trim().length > 0 ? value.trim() : 'unknown';
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

export function classifyExistingPacket(
  status: PacketLifecycleStatus | null | undefined,
): ExistingPacketDisposition {
  if (!status) return 'none';
  if (DRAFT_OR_REVIEW_STATUSES.has(status)) return 'draft_or_review';
  if (SIGNATURE_TRACKING_STATUSES.has(status)) return 'signature_tracking';
  if (VIEW_OR_AMEND_STATUSES.has(status)) return 'view_or_amend';
  return 'view_only';
}

function recommendedAction(disposition: ExistingPacketDisposition): ExistingPacketRecommendedAction {
  switch (disposition) {
    case 'none':
      return 'create-new';
    case 'draft_or_review':
      return 'open-existing';
    case 'signature_tracking':
      return 'track-signatures';
    case 'view_or_amend':
      return 'view/amend';
    case 'view_only':
      return 'view-only';
  }
}

function statusLabel(status: PacketLifecycleStatus | null): string {
  if (!status) return 'unknown';
  return PACKET_LIFECYCLE_TO_APPENDIX_D[status] ?? status;
}

function signatureStatusFor(packet: PacketStoreDocument | null): string | 'unknown' {
  switch (packet?.status) {
    case 'SENT_FOR_SIGNATURE':
      return 'sent';
    case 'PARTIALLY_SIGNED':
      return 'partially_signed';
    case 'FULLY_SIGNED':
    case 'SIGNED_PACKAGE_BUILDING':
    case 'CERTIFICATION_REVIEW':
    case 'CERTIFIED':
    case 'DRIVE_PUBLISHING':
    case 'PUBLISHED':
    case 'LOCKED':
      return 'complete';
    case 'SIGNATURE_DECLINED':
      return 'declined';
    case 'SIGNATURE_EXPIRED':
      return 'expired';
    default:
      return 'unknown';
  }
}

function approvalStatusFor(packet: PacketStoreDocument | null): string | 'unknown' {
  if (!packet) return 'unknown';
  if (
    packet.status === 'APPROVED_FOR_SIGNATURE' ||
    packet.status === 'SIGNER_CONFIRMATION' ||
    SIGNATURE_TRACKING_STATUSES.has(packet.status) ||
    VIEW_OR_AMEND_STATUSES.has(packet.status)
  ) {
    return 'approved';
  }
  return 'unknown';
}

function existingPacketBlock(packet: PacketStoreDocument | null): ExistingPacketReadinessBlock {
  const disposition = classifyExistingPacket(packet?.status ?? null);
  return {
    exists: packet !== null,
    packetInstanceId: packet?.packetInstanceId ?? null,
    packetId: packet?.packetId ?? null,
    packetVersion: packet?.packetVersion ?? null,
    revision: packet?.revision ?? null,
    status: packet?.status ?? 'unknown',
    statusLabel: statusLabel(packet?.status ?? null),
    recommendedAction: recommendedAction(disposition),
    duplicateHandling: packet ? 'duplicate rejected/idempotent' : 'no duplicate',
    lockedAt: packet?.lockedAt ?? null,
    driveFolderUrl: packet?.driveFolderUrl ?? null,
    finalArtifactUrl: packet?.finalArtifactUrl ?? null,
  };
}

function openDependenciesBlockers(packet: PacketStoreDocument | null): OpenDependenciesBlockersBlock {
  if (!packet) {
    return {
      blockerCount: 'unknown',
      blockerIds: 'unknown',
      openDependencies: 'unknown',
    };
  }
  return {
    blockerCount: packet.blockerIds.length,
    blockerIds: [...packet.blockerIds],
    openDependencies: packet.blockerIds.length > 0 ? [...packet.blockerIds] : [],
  };
}

export function readinessActions(
  disposition: ExistingPacketDisposition,
  packet: PacketStoreDocument | null,
): readonly PacketReadinessAction[] {
  const duplicateReason = packet
    ? 'Existing packet found for the FR-004 identity key; generation must return that packet instead of creating a duplicate.'
    : null;
  const canOpenDraft = disposition === 'draft_or_review';
  const canTrack = disposition === 'signature_tracking';
  const canViewOrAmend = disposition === 'view_or_amend';
  const driveAvailable = Boolean(packet?.driveFolderUrl);
  return [
    {
      id: 'generate_new_packet',
      label: 'Generate new packet',
      enabled: packet === null,
      reason: duplicateReason,
    },
    {
      id: 'open_existing_draft',
      label: 'Open existing draft',
      enabled: canOpenDraft,
      reason: canOpenDraft ? null : 'No draft/review packet exists for this identity key.',
    },
    {
      id: 'continue_review',
      label: 'Continue review',
      enabled: canOpenDraft,
      reason: canOpenDraft ? null : 'No reviewable packet exists for this identity key.',
    },
    {
      id: 'track_signatures',
      label: 'Track signatures',
      enabled: canTrack,
      reason: canTrack ? null : 'Packet is not currently in a signature-tracking state.',
    },
    {
      id: 'view_signed_packet',
      label: 'View signed packet',
      enabled: canViewOrAmend,
      reason: canViewOrAmend ? null : 'No signed, published, or locked packet exists for this identity key.',
    },
    {
      id: 'open_in_google_drive',
      label: 'Open in Google Drive',
      enabled: driveAvailable,
      reason: driveAvailable ? null : 'Drive destination is unknown for this readiness lookup.',
    },
    {
      id: 'create_amendment',
      label: 'Create amendment',
      enabled: canViewOrAmend,
      reason: canViewOrAmend ? null : 'Amendments are only available after signature, publication, or lock.',
    },
    {
      id: 'create_superseding_version',
      label: 'Create superseding version',
      enabled: canViewOrAmend,
      reason: canViewOrAmend ? null : 'Superseding versions are only available after signature, publication, or lock.',
    },
    {
      id: 'cancel',
      label: 'Cancel',
      enabled: true,
      reason: null,
    },
  ];
}

function normalizedCadence(value: string | null): PriorPacketQuery['cadence'] | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'monthly' || normalized === 'quarterly' || normalized === 'annual') {
    return normalized;
  }
  return null;
}

function addMonths(isoDate: string, deltaMonths: number): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1 + deltaMonths, day));
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function priorReportingPeriod(identity: PacketReadinessIdentity): string | null {
  if (!identity.reportingPeriodStart || !identity.reportingPeriodEnd) return null;
  const cadence = normalizedCadence(identity.cadence);
  const delta = cadence === 'monthly' ? -1 : cadence === 'quarterly' ? -3 : cadence === 'annual' ? -12 : null;
  if (delta === null) return null;
  const start = addMonths(identity.reportingPeriodStart, delta);
  const end = addMonths(identity.reportingPeriodEnd, delta);
  return start && end ? `${start}..${end}` : null;
}

async function findPriorPacket(
  connector: Pick<PacketDriveConnector, 'findPriorPacket'> | undefined,
  identity: PacketReadinessIdentity,
): Promise<PriorPacketLookupResult | null> {
  const cadence = normalizedCadence(identity.cadence);
  const priorPeriod = priorReportingPeriod(identity);
  if (!connector || !cadence || !identity.workflowId || !priorPeriod) return null;
  return connector.findPriorPacket({
    agency_id: identity.agencyId,
    packet_archetype_id: 'analytical-report',
    packet_template_family: 'QAPI',
    cadence,
    canonical_workflow_family: identity.workflowId,
    prior_reporting_period: priorPeriod,
    packet_status: 'locked',
    not_superseded: true,
  });
}

function priorPacketStatus(prior: PriorPacketLookupResult | null): string | 'unknown' {
  if (!prior) return 'unknown';
  if (prior.found) return 'found';
  return prior.notFoundBanner ?? 'unknown';
}

function trendReadiness(prior: PriorPacketLookupResult | null): string | 'unknown' {
  if (!prior) return 'unknown';
  return prior.found ? 'ready' : 'prior-data unavailable';
}

export function buildPacketReadinessResponse(
  identity: PacketReadinessIdentity,
  existingPacket: PacketStoreDocument | null,
  priorPacket: PriorPacketLookupResult | null = null,
): PacketReadinessResponse {
  const identityKey = buildPacketIdentityKey({
    agency_id: identity.agencyId,
    event_instance_id: identity.eventInstanceId,
    workflow_instance_id: identity.workflowInstanceId,
    packet_template_id: identity.packetTemplateId,
  });
  const disposition = classifyExistingPacket(existingPacket?.status ?? null);
  return {
    status: 'ok',
    readiness: {
      identity,
      identityKey,
      eventWorkflowIdentity: {
        eventFamilyId: valueOrUnknown(identity.eventFamilyId),
        eventInstanceId: identity.eventInstanceId,
        workflowId: valueOrUnknown(identity.workflowId),
        workflowInstanceId: identity.workflowInstanceId,
      },
      reportingPeriod: {
        start: valueOrUnknown(identity.reportingPeriodStart),
        end: valueOrUnknown(identity.reportingPeriodEnd),
      },
      selectedPacketTemplate: {
        packetTemplateId: identity.packetTemplateId,
        compatible: 'unknown',
      },
      existingPacket: existingPacketBlock(existingPacket),
      duplicateGeneration: {
        allowed: existingPacket === null,
        behavior: existingPacket === null ? 'create_new_packet' : 'return_existing_packet',
        reason: existingPacket
          ? 'A duplicate-generation attempt must return the existing packet for this FR-004 identity key.'
          : 'No existing packet was found for this FR-004 identity key.',
      },
      requiredFormsEvidence: {
        requiredForms: 'unknown',
        requiredEvidence: 'unknown',
        requiredFormCompletion: 'unknown',
        evidenceCompleteness: 'unknown',
      },
      requiredApprovalsSigners: {
        requiredApprovals: 'unknown',
        requiredSigners: 'unknown',
        approvalStatus: approvalStatusFor(existingPacket),
        signatureStatus: signatureStatusFor(existingPacket),
      },
      openDependenciesBlockers: openDependenciesBlockers(existingPacket),
      priorPeriodPacketStatus: priorPacketStatus(priorPacket),
      trendComparisonReadiness: trendReadiness(priorPacket),
      driveDestination: valueOrUnknown(existingPacket?.driveFolderUrl),
      actions: readinessActions(disposition, existingPacket),
    },
  };
}

function identityFromRequest(req: Request): PacketReadinessIdentity {
  const eventInstanceId = req.params.eventInstanceId?.trim()
    || requireQueryValue(req, 'eventInstanceId', 'event_instance_id');
  return {
    agencyId: requireQueryValue(req, 'agencyId', 'agency_id'),
    eventInstanceId,
    eventFamilyId: singleQueryValue(req, 'eventFamilyId', 'event_family_id') ?? null,
    workflowId: singleQueryValue(req, 'workflowId', 'workflow_id') ?? null,
    workflowInstanceId: requireQueryValue(req, 'workflowInstanceId', 'workflow_instance_id'),
    packetTemplateId: requireQueryValue(req, 'packetTemplateId', 'packet_template_id'),
    reportingPeriodStart: singleQueryValue(req, 'reportingPeriodStart', 'reporting_period_start') ?? null,
    reportingPeriodEnd: singleQueryValue(req, 'reportingPeriodEnd', 'reporting_period_end') ?? null,
    cadence: singleQueryValue(req, 'cadence') ?? null,
  };
}

function mapReadinessError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return error instanceof Error
    ? new ApiError('internal_error', error.message, 500)
    : new ApiError('internal_error', 'Internal error', 500);
}

export function createPacketReadinessRouter(
  options: PacketReadinessRouterOptions = {},
): Router {
  const router = Router();
  const store = options.store ?? defaultStore;

  const handleReadiness = asyncH(async (req, res) => {
    const identity = identityFromRequest(req);
    assertAgencyScope(req, identity.agencyId);
    const identityKey = buildPacketIdentityKey({
      agency_id: identity.agencyId,
      event_instance_id: identity.eventInstanceId,
      workflow_instance_id: identity.workflowInstanceId,
      packet_template_id: identity.packetTemplateId,
    });
    const existingPacket = await store.findByIdentityKey(identityKey);
    const priorPacket = await findPriorPacket(options.driveConnector, identity);
    res.json(buildPacketReadinessResponse(identity, existingPacket, priorPacket));
  });

  router.get('/events/:eventInstanceId/packet-readiness', handleReadiness);
  router.get('/:eventInstanceId/packet-readiness', handleReadiness);

  router.use((err: unknown, _req: Request, _res: Response, next: NextFunction) => {
    next(mapReadinessError(err));
  });

  return router;
}

export const packetReadinessRouter: Router = createPacketReadinessRouter();
