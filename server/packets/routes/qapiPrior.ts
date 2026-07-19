import { Router, type NextFunction, type Request, type Response } from 'express';
import { computeTrends } from '@/policy/packets/analysis/trends/computeTrends';
import {
  COMPARABILITY_STATES,
  type PacketDriveConnector,
  type PriorPacketLookupResult,
  type PriorPacketQuery,
  type QapiTrendSnapshot,
  type TrendComparisonOutput,
} from '@/policy/packets/contracts';
import {
  priorPacketQueryForCurrentPeriod,
  readQapiTrendSnapshot,
  type QapiPriorCadence,
  type QapiPriorDriveConnector,
  type QapiPriorPeriodIdentity,
} from '@/policy/packets/qapi/priorPeriodResolution';
import { ApiError } from '../../errors.js';
import { LocalDriveAdapter } from '../drive/localDriveAdapter.js';

const COMPARABILITY_STATE_VALUES = new Set<string>(COMPARABILITY_STATES);
const TREND_SNAPSHOT_PACKET_STATUSES = new Set<string>(['certified', 'published', 'locked']);
const TREND_SNAPSHOT_SOURCE_CLASSIFICATIONS = new Set<string>(['production', 'synthetic']);

type AsyncRoute = (req: Request<Record<string, string>>, res: Response, next: NextFunction) => Promise<void>;

type PacketActorRequest = Request & {
  actor?: {
    attributes?: { access_classes?: string[] };
  };
};

export interface QapiPriorRouterOptions {
  driveConnector?: QapiPriorDriveConnector;
}

export interface QapiPriorPeriodResponse {
  status: 'ok';
  query: PriorPacketQuery;
  priorPeriod: PriorPacketLookupResult;
}

export interface QapiTrendSnapshotResponse {
  status: 'ok';
  trendSnapshot: QapiTrendSnapshot;
}

export interface QapiCompareResponse {
  status: 'ok';
  priorLookup: PriorPacketLookupResult | null;
  comparison: TrendComparisonOutput;
}

let defaultDriveConnector: QapiPriorDriveConnector | null = null;

export function createQapiPriorRouter(options: QapiPriorRouterOptions = {}): Router {
  const router = Router();

  router.get('/prior-period', asyncH(async (req, res) => {
    const driveConnector = driveConnectorFor(options);
    const identity = priorIdentityFromQuery(req);
    assertAgencyScope(req, identity.agencyId);
    const query = queryForIdentity(identity);
    const priorPeriod = await driveConnector.findPriorPacket(query);
    res.json({
      status: 'ok',
      query,
      priorPeriod,
    } satisfies QapiPriorPeriodResponse);
  }));

  router.get('/trend-snapshot/:packetInstanceId', asyncH(async (req, res) => {
    const driveConnector = driveConnectorFor(options);
    const packetInstanceId = requiredParam(req, 'packetInstanceId');
    const trendSnapshot = await readQapiTrendSnapshot(driveConnector, packetInstanceId);
    if (!trendSnapshot) {
      throw new ApiError(
        'not_found',
        `Structured QAPI trend sidecars were not found for packet ${packetInstanceId}.`,
        404,
      );
    }
    res.json({
      status: 'ok',
      trendSnapshot,
    } satisfies QapiTrendSnapshotResponse);
  }));

  router.post('/compare', asyncH(async (req, res) => {
    const driveConnector = driveConnectorFor(options);
    const body = asRecord(req.body, 'body');
    const current = trendSnapshotFromBody(body, 'currentTrendSnapshot');
    assertAgencyScope(req, current.agencyId);
    const prior = await priorSnapshotForCompare(driveConnector, body, current);
    const comparison = computeTrends(current, prior.trendSnapshot);
    res.json({
      status: 'ok',
      priorLookup: prior.lookup,
      comparison,
    } satisfies QapiCompareResponse);
  }));

  return router;
}

export const qapiPriorRouter: Router = createQapiPriorRouter();

function driveConnectorFor(options: QapiPriorRouterOptions): QapiPriorDriveConnector {
  if (options.driveConnector) return options.driveConnector;
  defaultDriveConnector ??= new LocalDriveAdapter();
  return defaultDriveConnector;
}

function queryForIdentity(identity: QapiPriorPeriodIdentity): PriorPacketQuery {
  try {
    return priorPacketQueryForCurrentPeriod(identity);
  } catch (error) {
    throw validationError(
      'field_value_invalid',
      error instanceof Error ? error.message : 'periodStart must be an ISO date.',
      'periodStart',
    );
  }
}

function asyncH(fn: AsyncRoute) {
  return (req: Request<Record<string, string>>, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

function priorIdentityFromQuery(req: Request<Record<string, string>>): QapiPriorPeriodIdentity {
  return {
    agencyId: requiredQueryValue(req, 'agencyId', 'agency_id'),
    cadence: normalizeCadence(requiredQueryValue(req, 'cadence')),
    periodStart: requiredQueryValue(req, 'periodStart', 'period_start'),
    workflowFamily: requiredQueryValue(req, 'workflowFamily', 'workflow_family'),
    packetStatus: normalizePacketStatus(singleQueryValue(req, 'packetStatus', 'packet_status')),
  };
}

async function priorSnapshotForCompare(
  driveConnector: Pick<PacketDriveConnector, 'findPriorPacket' | 'readSidecar'>,
  body: Record<string, unknown>,
  current: QapiTrendSnapshot,
): Promise<{ lookup: PriorPacketLookupResult | null; trendSnapshot: QapiTrendSnapshot | null }> {
  if (body.priorTrendSnapshot !== undefined && body.priorTrendSnapshot !== null) {
    const trendSnapshot = asTrendSnapshot(body.priorTrendSnapshot, 'priorTrendSnapshot');
    assertGovernedPriorSnapshot(current, trendSnapshot, 'priorTrendSnapshot');
    return {
      lookup: null,
      trendSnapshot,
    };
  }

  const priorPacketInstanceId = optionalBodyString(body, 'priorPacketInstanceId');
  if (priorPacketInstanceId) {
    const trendSnapshot = await readQapiTrendSnapshot(driveConnector, priorPacketInstanceId);
    if (trendSnapshot) {
      assertGovernedPriorSnapshot(current, trendSnapshot, 'priorPacketInstanceId');
    }
    return {
      lookup: null,
      trendSnapshot,
    };
  }

  const priorPeriod = body.priorPeriod ?? body.priorLookupIdentity;
  if (priorPeriod !== undefined && priorPeriod !== null) {
    const identity = priorIdentityFromBody(priorPeriod);
    assertPriorIdentityMatchesCurrent(identity, current, 'priorPeriod');
    const query = queryForIdentity(identity);
    const lookup = await driveConnector.findPriorPacket(query);
    const trendSnapshot =
      lookup.found && lookup.packetInstanceId
        ? await readQapiTrendSnapshot(driveConnector, lookup.packetInstanceId)
        : null;
    if (trendSnapshot) {
      assertGovernedPriorSnapshot(current, trendSnapshot, 'priorPeriod');
    }
    return {
      lookup,
      trendSnapshot,
    };
  }

  return {
    lookup: null,
    trendSnapshot: null,
  };
}

function priorIdentityFromBody(value: unknown): QapiPriorPeriodIdentity {
  const body = asRecord(value, 'priorPeriod');
  return {
    agencyId: requiredBodyString(body, 'agencyId', 'priorPeriod.agencyId'),
    cadence: normalizeCadence(requiredBodyString(body, 'cadence', 'priorPeriod.cadence')),
    periodStart: requiredBodyString(body, 'periodStart', 'priorPeriod.periodStart'),
    workflowFamily: requiredBodyString(body, 'workflowFamily', 'priorPeriod.workflowFamily'),
    packetStatus: normalizePacketStatus(optionalBodyString(body, 'packetStatus')),
  };
}

function trendSnapshotFromBody(
  body: Record<string, unknown>,
  field: string,
): QapiTrendSnapshot {
  if (body[field] === undefined) {
    throw validationError('required_field_missing', `Field "${field}" is required.`, field);
  }
  return asTrendSnapshot(body[field], field);
}

function asTrendSnapshot(value: unknown, path: string): QapiTrendSnapshot {
  const snapshot = asRecord(value, path);
  for (const field of [
    'packetInstanceId',
    'packetHash',
    'agencyId',
    'eventFamilyId',
    'eventInstanceId',
    'workflowId',
    'workflowInstanceId',
    'cadence',
    'reportingPeriodStart',
    'reportingPeriodEnd',
    'dataThroughDate',
    'packetStatus',
    'sourceClassification',
    'kpiDefinitionVersion',
    'metricSchemaVersion',
    'publishedArtifactUrl',
    'publishedFolderUrl',
    'generatedAt',
  ]) {
    if (typeof snapshot[field] !== 'string') {
      throw validationError(
        'field_type_invalid',
        `Field "${path}.${field}" must be a string.`,
        `${path}.${field}`,
      );
    }
  }
  if (typeof snapshot.packetVersion !== 'number') {
    throw validationError(
      'field_type_invalid',
      `Field "${path}.packetVersion" must be a number.`,
      `${path}.packetVersion`,
    );
  }
  for (const field of ['metrics', 'findings', 'workflows', 'pips', 'actionItems']) {
    if (!Array.isArray(snapshot[field])) {
      throw validationError(
        'field_type_invalid',
        `Field "${path}.${field}" must be an array.`,
        `${path}.${field}`,
      );
    }
  }
  if (!TREND_SNAPSHOT_PACKET_STATUSES.has(String(snapshot.packetStatus))) {
    throw validationError(
      'field_value_invalid',
      `Field "${path}.packetStatus" must be certified, published, or locked.`,
      `${path}.packetStatus`,
    );
  }
  if (!TREND_SNAPSHOT_SOURCE_CLASSIFICATIONS.has(String(snapshot.sourceClassification))) {
    throw validationError(
      'field_value_invalid',
      `Field "${path}.sourceClassification" must be production or synthetic.`,
      `${path}.sourceClassification`,
    );
  }
  validateMetricComparability(snapshot.metrics, `${path}.metrics`);
  return snapshot as unknown as QapiTrendSnapshot;
}

function validateMetricComparability(metrics: unknown, path: string): void {
  if (!Array.isArray(metrics)) return;
  metrics.forEach((metric, index) => {
    const record = asRecord(metric, `${path}[${index}]`);
    const comparability = record.comparability;
    if (typeof comparability !== 'string' || !COMPARABILITY_STATE_VALUES.has(comparability)) {
      throw validationError(
        'field_value_invalid',
        `Field "${path}[${index}].comparability" must be a PRD 14.6 comparability state.`,
        `${path}[${index}].comparability`,
      );
    }
  });
}

function assertPriorIdentityMatchesCurrent(
  identity: QapiPriorPeriodIdentity,
  current: QapiTrendSnapshot,
  path: string,
): void {
  if (identity.agencyId !== current.agencyId) {
    throw validationError(
      'prior_agency_mismatch',
      `Field "${path}.agencyId" must match currentTrendSnapshot.agencyId.`,
      `${path}.agencyId`,
    );
  }
  if (identity.cadence !== current.cadence) {
    throw validationError(
      'prior_cadence_mismatch',
      `Field "${path}.cadence" must match currentTrendSnapshot.cadence.`,
      `${path}.cadence`,
    );
  }
  if (identity.workflowFamily !== current.workflowId) {
    throw validationError(
      'prior_workflow_mismatch',
      `Field "${path}.workflowFamily" must match currentTrendSnapshot.workflowId.`,
      `${path}.workflowFamily`,
    );
  }
  if (identity.periodStart !== current.reportingPeriodStart) {
    throw validationError(
      'prior_period_start_mismatch',
      `Field "${path}.periodStart" must match currentTrendSnapshot.reportingPeriodStart.`,
      `${path}.periodStart`,
    );
  }
}

function assertGovernedPriorSnapshot(
  current: QapiTrendSnapshot,
  prior: QapiTrendSnapshot,
  path: string,
): void {
  if (prior.agencyId !== current.agencyId) {
    throw validationError(
      'prior_agency_mismatch',
      `Field "${path}.agencyId" must match currentTrendSnapshot.agencyId.`,
      `${path}.agencyId`,
    );
  }
  if (prior.cadence !== current.cadence) {
    throw validationError(
      'prior_cadence_mismatch',
      `Field "${path}.cadence" must match currentTrendSnapshot.cadence.`,
      `${path}.cadence`,
    );
  }
  if (prior.workflowId !== current.workflowId) {
    throw validationError(
      'prior_workflow_mismatch',
      `Field "${path}.workflowId" must match currentTrendSnapshot.workflowId.`,
      `${path}.workflowId`,
    );
  }
  if (prior.sourceClassification !== current.sourceClassification) {
    throw validationError(
      'prior_source_classification_mismatch',
      `Field "${path}.sourceClassification" must match currentTrendSnapshot.sourceClassification.`,
      `${path}.sourceClassification`,
    );
  }
}

function requiredQueryValue(req: Request<Record<string, string>>, camelName: string, snakeName?: string): string {
  const value = singleQueryValue(req, camelName, snakeName);
  if (!value) {
    throw validationError(
      'required_field_missing',
      `Query field "${camelName}" is required for QAPI prior-period lookup.`,
      camelName,
    );
  }
  return value;
}

function singleQueryValue(req: Request<Record<string, string>>, camelName: string, snakeName?: string): string | undefined {
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

function requiredParam(req: Request<Record<string, string>>, paramName: string): string {
  const value = req.params[paramName];
  if (!value || value.trim().length === 0) {
    throw validationError(
      'required_field_missing',
      `Route parameter "${paramName}" is required.`,
      paramName,
    );
  }
  return value.trim();
}

function requiredBodyString(
  body: Record<string, unknown>,
  field: string,
  path: string,
): string {
  const value = optionalBodyString(body, field);
  if (!value) {
    throw validationError('required_field_missing', `Field "${path}" is required.`, path);
  }
  return value;
}

function optionalBodyString(body: Record<string, unknown>, field: string): string | null {
  const value = body[field];
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    throw validationError('field_type_invalid', `Field "${field}" must be a string.`, field);
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function normalizeCadence(value: string): QapiPriorCadence {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'monthly' || normalized === 'quarterly' || normalized === 'annual') {
    return normalized;
  }
  throw validationError(
    'field_value_invalid',
    'cadence must be monthly, quarterly, or annual.',
    'cadence',
  );
}

function normalizePacketStatus(
  value: string | undefined | null,
): PriorPacketQuery['packet_status'] | undefined {
  if (value === undefined || value === null) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'locked' || normalized === 'certified-and-published') {
    return normalized;
  }
  throw validationError(
    'field_value_invalid',
    'packetStatus must be locked or certified-and-published.',
    'packetStatus',
  );
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw validationError('field_type_invalid', `Field "${path}" must be a JSON object.`, path);
  }
  return value as Record<string, unknown>;
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

function validationError(code: string, message: string, path: string): ApiError {
  return new ApiError('validation_error', message, 400, {
    blockers: [
      {
        code,
        path,
        message,
        remediation:
          'Provide the QAPI prior-period identity and structured trend snapshot values, then retry.',
      },
    ],
  });
}
