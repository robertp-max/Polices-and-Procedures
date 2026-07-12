import { computeTrends } from '@/policy/packets/analysis/trends/computeTrends';
import type { PriorKpiSnapshot } from '@/policy/packets/analysis/kpi/calculateKpis';
import type { KpiUnit } from '@/policy/packets/analysis/kpi/kpiDefinitions';
import {
  PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER,
  type AuditSidecarPayload,
  type AnalysisSidecarPayload,
  type KpisSidecarPayload,
  type ManifestSidecarPayload,
  type PacketDriveConnector,
  type PacketModel,
  type PacketSidecarPayload,
  type PriorPacketLookupResult,
  type PriorPacketQuery,
  type QapiMetricSnapshot,
  type QapiTrendSnapshot,
  type SidecarPayloadHeader,
  type TrendComparisonOutput,
  type WorkflowsSidecarPayload,
} from '@/policy/packets/contracts';

import {
  buildQapiPacketModel,
  type BuildQapiPacketModelInput,
} from './buildQapiPacketModel';

export type QapiPriorCadence = PriorPacketQuery['cadence'];

export type QapiPriorDriveConnector = Pick<
  PacketDriveConnector,
  'findPriorPacket' | 'readSidecar'
>;

export interface QapiPriorPeriodIdentity {
  agencyId: string;
  cadence: QapiPriorCadence;
  periodStart: string;
  workflowFamily: string;
  packetStatus?: PriorPacketQuery['packet_status'];
}

export interface PriorKpiMaps {
  priorKpisByDefinitionId: Readonly<Record<string, PriorKpiSnapshot | undefined>>;
  priorKpisByIndicatorId: Readonly<Record<string, PriorKpiSnapshot | undefined>>;
}

export interface PriorPeriodTrendInputs extends PriorKpiMaps {
  query: PriorPacketQuery;
  priorLookup: PriorPacketLookupResult;
  priorTrendSnapshot: QapiTrendSnapshot | null;
  trendComparison: TrendComparisonOutput | null;
  missingPriorBanner: typeof PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER | null;
}

export interface BuildQapiPacketModelWithPriorPeriodInput {
  modelInput: BuildQapiPacketModelInput;
  priorIdentity: QapiPriorPeriodIdentity;
  driveConnector: QapiPriorDriveConnector;
}

export interface BuildQapiPacketModelWithPriorPeriodResult {
  model: PacketModel;
  priorPeriod: PriorPeriodTrendInputs;
}

type SidecarHintSource =
  | AnalysisSidecarPayload
  | KpisSidecarPayload
  | WorkflowsSidecarPayload
  | ManifestSidecarPayload
  | AuditSidecarPayload;

type SidecarHintRecord = SidecarHintSource & Record<string, unknown>;

const KPI_UNITS = ['count', 'percentage', 'rate', 'days', 'currency'] as const satisfies readonly KpiUnit[];

export function priorPacketQueryForCurrentPeriod(
  identity: QapiPriorPeriodIdentity,
): PriorPacketQuery {
  return {
    agency_id: identity.agencyId,
    packet_archetype_id: 'analytical-report',
    packet_template_family: 'QAPI',
    cadence: identity.cadence,
    canonical_workflow_family: identity.workflowFamily,
    prior_reporting_period: priorReportingPeriod(identity.cadence, identity.periodStart),
    packet_status: identity.packetStatus ?? 'locked',
    not_superseded: true,
  };
}

export async function resolvePriorPeriodTrendInputs(
  driveConnector: QapiPriorDriveConnector,
  identity: QapiPriorPeriodIdentity,
  currentTrendSnapshot?: QapiTrendSnapshot,
): Promise<PriorPeriodTrendInputs> {
  const query = priorPacketQueryForCurrentPeriod(identity);
  const priorLookup = await driveConnector.findPriorPacket(query);
  const priorTrendSnapshot =
    priorLookup.found && priorLookup.packetInstanceId
      ? await readQapiTrendSnapshot(driveConnector, priorLookup.packetInstanceId)
      : null;
  const priorKpis = priorTrendSnapshot
    ? priorKpiMapsFromTrendSnapshot(priorTrendSnapshot)
    : emptyPriorKpiMaps();
  const trendComparison = currentTrendSnapshot
    ? computeTrends(currentTrendSnapshot, priorTrendSnapshot)
    : null;

  return {
    query,
    priorLookup,
    priorTrendSnapshot,
    trendComparison,
    missingPriorBanner: priorTrendSnapshot ? null : PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER,
    ...priorKpis,
  };
}

export function applyPriorPeriodTrendInputs(
  input: BuildQapiPacketModelInput,
  priorPeriod: Pick<
    PriorPeriodTrendInputs,
    'priorTrendSnapshot' | 'priorKpisByDefinitionId' | 'priorKpisByIndicatorId'
  >,
): BuildQapiPacketModelInput {
  return {
    ...input,
    priorTrendSnapshot: priorPeriod.priorTrendSnapshot,
    priorKpisByDefinitionId: priorPeriod.priorKpisByDefinitionId,
    priorKpisByIndicatorId: priorPeriod.priorKpisByIndicatorId,
  };
}

export async function buildQapiPacketModelWithPriorPeriod(
  input: BuildQapiPacketModelWithPriorPeriodInput,
): Promise<BuildQapiPacketModelWithPriorPeriodResult> {
  const priorPeriod = await resolvePriorPeriodTrendInputs(
    input.driveConnector,
    input.priorIdentity,
  );
  return {
    model: buildQapiPacketModel(applyPriorPeriodTrendInputs(input.modelInput, priorPeriod)),
    priorPeriod,
  };
}

export async function readQapiTrendSnapshot(
  driveConnector: Pick<PacketDriveConnector, 'readSidecar'>,
  packetInstanceId: string,
): Promise<QapiTrendSnapshot | null> {
  const [analysis, kpis, workflows, manifest, audit] = await Promise.all([
    driveConnector.readSidecar({ packetInstanceId, sidecarKind: 'analysis', driveFileId: null }),
    driveConnector.readSidecar({ packetInstanceId, sidecarKind: 'kpis', driveFileId: null }),
    driveConnector.readSidecar({ packetInstanceId, sidecarKind: 'workflows', driveFileId: null }),
    driveConnector.readSidecar({ packetInstanceId, sidecarKind: 'manifest', driveFileId: null }),
    driveConnector.readSidecar({ packetInstanceId, sidecarKind: 'audit', driveFileId: null }),
  ]);

  if (
    !isSidecar(analysis, 'analysis') ||
    !isSidecar(kpis, 'kpis') ||
    !isSidecar(workflows, 'workflows') ||
    !isSidecar(manifest, 'manifest') ||
    !isSidecar(audit, 'audit') ||
    !sidecarHeadersAreConsistent([analysis, kpis, workflows, manifest, audit])
  ) {
    return null;
  }

  try {
    return qapiTrendSnapshotFromSidecars({
      analysis,
      kpis,
      workflows,
      manifest,
      audit,
    });
  } catch {
    return null;
  }
}

export function qapiTrendSnapshotFromSidecars(input: {
  analysis: AnalysisSidecarPayload;
  kpis: KpisSidecarPayload;
  workflows: WorkflowsSidecarPayload;
  manifest: ManifestSidecarPayload;
  audit: AuditSidecarPayload;
}): QapiTrendSnapshot {
  const hintSources = [
    input.analysis,
    input.kpis,
    input.workflows,
    input.manifest,
    input.audit,
  ].filter(
    isSidecarHintRecord,
  );
  const packetStatus = packetStatusFromHints(hintSources, input.audit);
  if (packetStatus === null) {
    throw new Error('QAPI trend snapshot sidecars do not describe a locked or certified packet.');
  }
  const primaryWorkflow = input.workflows.workflows[0] ?? null;
  const workflowId = stringHint(hintSources, [
    'canonical_workflow_family',
    'canonicalWorkflowFamily',
    'workflowId',
  ]) ?? primaryWorkflow?.workflowId ?? 'UNKNOWN — NOT RECOVERED';

  return {
    packetInstanceId: input.kpis.packetInstanceId,
    packetVersion: input.kpis.packetVersion,
    packetHash: input.kpis.packetHash,
    agencyId: input.kpis.agencyId,
    eventFamilyId: stringHint(hintSources, ['event_family_id', 'eventFamilyId']) ?? 'qapi_meeting',
    eventInstanceId:
      stringHint(hintSources, ['event_instance_id', 'eventInstanceId']) ??
      input.kpis.packetInstanceId,
    workflowId,
    workflowInstanceId:
      primaryWorkflow?.workflowInstanceId ??
      stringHint(hintSources, ['workflow_instance_id', 'workflowInstanceId']) ??
      workflowId,
    cadence: input.kpis.cadence,
    reportingPeriodStart: input.kpis.reportingPeriodStart,
    reportingPeriodEnd: input.kpis.reportingPeriodEnd,
    dataThroughDate:
      stringHint(hintSources, ['data_through_date', 'dataThroughDate']) ??
      input.kpis.reportingPeriodEnd,
    packetStatus,
    sourceClassification: input.kpis.sourceClassification,
    kpiDefinitionVersion: input.kpis.kpiDefinitionVersion,
    metricSchemaVersion: input.kpis.metricSchemaVersion,
    metrics: [...input.kpis.metrics],
    findings: [...input.analysis.findings],
    workflows: [...input.workflows.workflows],
    pips: [...input.workflows.pips],
    actionItems: [...input.workflows.actionItems],
    publishedArtifactUrl:
      input.manifest?.artifacts.find((artifact) => artifact.artifactType === 'pdf')?.driveFileUrl ??
      '',
    publishedFolderUrl: input.manifest?.driveFolderUrl ?? '',
    generatedAt: input.kpis.generatedAt,
  };
}

export function priorKpiMapsFromTrendSnapshot(snapshot: QapiTrendSnapshot): PriorKpiMaps {
  const priorKpisByDefinitionId: Record<string, PriorKpiSnapshot | undefined> = {};
  const priorKpisByIndicatorId: Record<string, PriorKpiSnapshot | undefined> = {};

  for (const metric of snapshot.metrics) {
    const prior = priorKpiFromMetric(metric);
    if (!prior) continue;
    priorKpisByDefinitionId[metric.metricKey] = prior;
    priorKpisByIndicatorId[metric.metricId] = prior;
  }

  return {
    priorKpisByDefinitionId,
    priorKpisByIndicatorId,
  };
}

function emptyPriorKpiMaps(): PriorKpiMaps {
  return {
    priorKpisByDefinitionId: {},
    priorKpisByIndicatorId: {},
  };
}

function priorKpiFromMetric(metric: QapiMetricSnapshot): PriorKpiSnapshot | null {
  if (!isKpiUnit(metric.unit)) return null;
  return {
    value: numericMetricValue(metric),
    definitionVersion: metric.definitionVersion,
    unit: metric.unit,
    numerator: metric.numerator,
    denominator: metric.denominator,
  };
}

function numericMetricValue(metric: QapiMetricSnapshot): number | null {
  if (metric.rate != null) return metric.rate;
  return typeof metric.absoluteValue === 'number' ? metric.absoluteValue : null;
}

function isKpiUnit(value: string | null): value is KpiUnit {
  return value !== null && KPI_UNITS.includes(value as KpiUnit);
}

function isSidecar<K extends PacketSidecarPayload['kind']>(
  payload: PacketSidecarPayload | null,
  kind: K,
): payload is Extract<PacketSidecarPayload, { kind: K }> {
  return payload?.kind === kind;
}

function isSidecarHintRecord(value: SidecarHintSource | null): value is SidecarHintRecord {
  return isRecord(value);
}

function sidecarHeadersAreConsistent(sidecars: readonly SidecarPayloadHeader[]): boolean {
  const [first, ...rest] = sidecars;
  if (!first) return false;
  return rest.every((sidecar) =>
    sidecar.packetInstanceId === first.packetInstanceId &&
    sidecar.packetVersion === first.packetVersion &&
    sidecar.packetHash === first.packetHash &&
    sidecar.agencyId === first.agencyId &&
    sidecar.generatedAt === first.generatedAt &&
    sidecar.sourceClassification === first.sourceClassification,
  );
}

function packetStatusFromHints(
  hintSources: readonly Record<string, unknown>[],
  audit: AuditSidecarPayload,
): QapiTrendSnapshot['packetStatus'] | null {
  const status = stringHint(hintSources, ['packet_status', 'packetStatus']);
  if (status !== null) {
    return normalizeTrendPacketStatus(status);
  }
  return packetStatusFromAudit(audit);
}

function packetStatusFromAudit(audit: AuditSidecarPayload): QapiTrendSnapshot['packetStatus'] | null {
  let latest: QapiTrendSnapshot['packetStatus'] | null = null;
  for (const event of audit.events) {
    const status = packetStatusFromAuditEvent(event.eventType);
    if (status === 'invalid') {
      latest = null;
    } else if (status !== null) {
      latest = status;
    }
  }
  return latest;
}

function packetStatusFromAuditEvent(
  value: string,
): QapiTrendSnapshot['packetStatus'] | 'invalid' | null {
  const eventType = value.toLowerCase();
  if (
    eventType.includes('draft') ||
    eventType.includes('rejected') ||
    eventType.includes('voided') ||
    eventType.includes('superseded')
  ) {
    return 'invalid';
  }
  if (eventType.includes('certified-and-published')) return 'published';
  if (eventType.includes('published')) return 'published';
  if (eventType.includes('certified')) return 'certified';
  if (eventType.includes('locked')) return 'locked';
  return null;
}

function normalizeTrendPacketStatus(value: string): QapiTrendSnapshot['packetStatus'] | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'locked') return 'locked';
  if (normalized === 'certified') return 'certified';
  if (normalized === 'published' || normalized === 'certified-and-published') return 'published';
  return null;
}

function priorReportingPeriod(cadence: QapiPriorCadence, periodStart: string): string {
  const parts = parseIsoDate(periodStart);
  if (cadence === 'monthly') {
    const priorMonth = parts.month === 1 ? 12 : parts.month - 1;
    const priorYear = parts.month === 1 ? parts.year - 1 : parts.year;
    return `${String(priorYear).padStart(4, '0')}-${String(priorMonth).padStart(2, '0')}`;
  }
  if (cadence === 'annual') {
    return String(parts.year - 1);
  }
  const currentQuarter = Math.floor((parts.month - 1) / 3) + 1;
  const priorQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
  const priorYear = currentQuarter === 1 ? parts.year - 1 : parts.year;
  return `${String(priorYear).padStart(4, '0')}-Q${String(priorQuarter)}`;
}

function parseIsoDate(value: string): { year: number; month: number; day: number } {
  const match = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/.exec(value);
  const groups = match?.groups;
  if (!groups) {
    throw new Error(`periodStart must be an ISO date, received "${value}".`);
  }
  const year = Number(groups.year);
  const month = Number(groups.month);
  const day = Number(groups.day);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    throw new Error(`periodStart must be an ISO date, received "${value}".`);
  }
  return { year, month, day };
}

function stringHint(
  sources: readonly Record<string, unknown>[],
  keys: readonly string[],
): string | null {
  for (const source of sources) {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
