import type {
  ComparabilityState,
  KpisSidecarPayload,
  PacketSidecarPayload,
  QapiActionSnapshot,
  QapiFindingSnapshot,
  QapiMetricSnapshot,
  QapiPipSnapshot,
  QapiTrendSnapshot,
  QapiWorkflowSnapshot,
  TrendDirection,
} from '@/policy/packets/contracts';

const trendDirections = [
  'improving',
  'worsening',
  'stable',
  'unknown',
  'not-comparable',
] as const satisfies readonly TrendDirection[];

const cadences = ['monthly', 'quarterly', 'annual'] as const;
const packetStatuses = ['certified', 'published', 'locked'] as const;
const sourceClassifications = ['production', 'synthetic'] as const;
const comparabilityStates = [
  'COMPARABLE',
  'COMPARABLE WITH LIMITATION',
  'NOT COMPARABLE — DEFINITION CHANGED',
  'NOT COMPARABLE — COHORT CHANGED',
  'NOT COMPARABLE — UNIT CHANGED',
  'PRIOR DATA UNAVAILABLE',
  'PRIOR DATA CONFLICTED',
] as const satisfies readonly ComparabilityState[];

export function serializeQapiTrendSnapshot(snapshot: QapiTrendSnapshot): string {
  assertQapiTrendSnapshot(snapshot);
  return `${JSON.stringify(sortJson(snapshot), null, 2)}\n`;
}

export const serializeSnapshot = serializeQapiTrendSnapshot;

export function deserializeQapiTrendSnapshot(serialized: string): QapiTrendSnapshot {
  const parsed = parseJson(serialized);
  assertQapiTrendSnapshot(parsed);
  return parsed;
}

export const deserializeSnapshot = deserializeQapiTrendSnapshot;

export function toKpisSidecarPayload(
  snapshot: QapiTrendSnapshot,
): KpisSidecarPayload {
  assertQapiTrendSnapshot(snapshot);
  return {
    kind: 'kpis',
    packetInstanceId: snapshot.packetInstanceId,
    packetVersion: snapshot.packetVersion,
    packetHash: snapshot.packetHash,
    agencyId: snapshot.agencyId,
    generatedAt: snapshot.generatedAt,
    sourceClassification: snapshot.sourceClassification,
    kpiDefinitionVersion: snapshot.kpiDefinitionVersion,
    metricSchemaVersion: snapshot.metricSchemaVersion,
    cadence: snapshot.cadence,
    reportingPeriodStart: snapshot.reportingPeriodStart,
    reportingPeriodEnd: snapshot.reportingPeriodEnd,
    metrics: snapshot.metrics,
  };
}

export function isKpisSidecarPayload(
  payload: PacketSidecarPayload,
): payload is KpisSidecarPayload {
  return payload.kind === 'kpis';
}

export function serializeKpisSidecarPayload(
  payload: KpisSidecarPayload,
): string {
  assertKpisSidecarPayload(payload);
  return `${JSON.stringify(sortJson(payload), null, 2)}\n`;
}

export function deserializeKpisSidecarPayload(
  serialized: string,
): KpisSidecarPayload {
  const parsed = parseJson(serialized);
  assertKpisSidecarPayload(parsed);
  return parsed;
}

export function assertQapiTrendSnapshot(
  value: unknown,
): asserts value is QapiTrendSnapshot {
  const record = expectRecord(value, 'snapshot');
  expectString(record, 'packetInstanceId', 'snapshot');
  expectNumber(record, 'packetVersion', 'snapshot');
  expectString(record, 'packetHash', 'snapshot');
  expectString(record, 'agencyId', 'snapshot');
  expectString(record, 'eventFamilyId', 'snapshot');
  expectString(record, 'eventInstanceId', 'snapshot');
  expectString(record, 'workflowId', 'snapshot');
  expectString(record, 'workflowInstanceId', 'snapshot');
  expectLiteral(record, 'cadence', cadences, 'snapshot');
  expectString(record, 'reportingPeriodStart', 'snapshot');
  expectString(record, 'reportingPeriodEnd', 'snapshot');
  expectString(record, 'dataThroughDate', 'snapshot');
  expectLiteral(record, 'packetStatus', packetStatuses, 'snapshot');
  expectLiteral(
    record,
    'sourceClassification',
    sourceClassifications,
    'snapshot',
  );
  expectString(record, 'kpiDefinitionVersion', 'snapshot');
  expectString(record, 'metricSchemaVersion', 'snapshot');
  expectArray(record, 'metrics', 'snapshot').forEach((item, index) =>
    assertMetricSnapshot(item, `snapshot.metrics[${index}]`),
  );
  expectArray(record, 'findings', 'snapshot').forEach((item, index) =>
    assertFindingSnapshot(item, `snapshot.findings[${index}]`),
  );
  expectArray(record, 'workflows', 'snapshot').forEach((item, index) =>
    assertWorkflowSnapshot(item, `snapshot.workflows[${index}]`),
  );
  expectArray(record, 'pips', 'snapshot').forEach((item, index) =>
    assertPipSnapshot(item, `snapshot.pips[${index}]`),
  );
  expectArray(record, 'actionItems', 'snapshot').forEach((item, index) =>
    assertActionSnapshot(item, `snapshot.actionItems[${index}]`),
  );
  expectString(record, 'publishedArtifactUrl', 'snapshot');
  expectString(record, 'publishedFolderUrl', 'snapshot');
  expectString(record, 'generatedAt', 'snapshot');
}

function assertKpisSidecarPayload(
  value: unknown,
): asserts value is KpisSidecarPayload {
  const record = expectRecord(value, 'kpis');
  expectLiteral(record, 'kind', ['kpis'], 'kpis');
  expectString(record, 'packetInstanceId', 'kpis');
  expectNumber(record, 'packetVersion', 'kpis');
  expectString(record, 'packetHash', 'kpis');
  expectString(record, 'agencyId', 'kpis');
  expectString(record, 'generatedAt', 'kpis');
  expectLiteral(record, 'sourceClassification', sourceClassifications, 'kpis');
  expectString(record, 'kpiDefinitionVersion', 'kpis');
  expectString(record, 'metricSchemaVersion', 'kpis');
  expectLiteral(record, 'cadence', cadences, 'kpis');
  expectString(record, 'reportingPeriodStart', 'kpis');
  expectString(record, 'reportingPeriodEnd', 'kpis');
  expectArray(record, 'metrics', 'kpis').forEach((item, index) =>
    assertMetricSnapshot(item, `kpis.metrics[${index}]`),
  );
}

function assertMetricSnapshot(
  value: unknown,
  path: string,
): asserts value is QapiMetricSnapshot {
  const record = expectRecord(value, path);
  expectString(record, 'metricId', path);
  expectString(record, 'metricKey', path);
  expectString(record, 'label', path);
  expectString(record, 'definitionVersion', path);
  expectNullableString(record, 'unit', path);
  expectNullableNumber(record, 'numerator', path);
  expectNullableNumber(record, 'denominator', path);
  expectNullableNumber(record, 'rate', path);
  expectNullableNumberString(record, 'absoluteValue', path);
  expectNullableNumberString(record, 'target', path);
  expectNullableNumberString(record, 'priorValue', path);
  expectNullableNumber(record, 'absoluteChange', path);
  expectNullableNumber(record, 'percentagePointChange', path);
  expectLiteral(record, 'direction', trendDirections, path);
  expectComparabilityState(record, 'comparability', path);
  expectNullableString(record, 'comparabilityLimitation', path);
  expectNullableString(record, 'targetStatus', path);
  expectNullableBoolean(record, 'sustainedPerformance', path);
  expectNullableBoolean(record, 'repeatedDeficiency', path);
  expectNullableBoolean(record, 'emergingDecline', path);
  expectNullableBoolean(record, 'improvement', path);
}

function assertFindingSnapshot(
  value: unknown,
  path: string,
): asserts value is QapiFindingSnapshot {
  const record = expectRecord(value, path);
  expectString(record, 'findingId', path);
  expectString(record, 'category', path);
  expectString(record, 'description', path);
  expectNullableString(record, 'severity', path);
  expectNullableString(record, 'materiality', path);
  expectNullableString(record, 'currentState', path);
  expectNullableString(record, 'priorPeriodRelationship', path);
  expectNullableString(record, 'recurrence', path);
  expectNullableString(record, 'riskType', path);
  expectStringArray(record, 'relatedWorkflowIds', path);
  expectStringArray(record, 'relatedMetricIds', path);
  expectNullableBoolean(record, 'reopened', path);
}

function assertWorkflowSnapshot(
  value: unknown,
  path: string,
): asserts value is QapiWorkflowSnapshot {
  const record = expectRecord(value, path);
  expectString(record, 'workflowId', path);
  expectNullableString(record, 'workflowInstanceId', path);
  expectNullableString(record, 'title', path);
  expectString(record, 'decisionState', path);
  expectNullableString(record, 'status', path);
  expectNullableBoolean(record, 'carryForward', path);
  expectNullableString(record, 'dueDate', path);
  expectNullableString(record, 'ownerRole', path);
}

function assertPipSnapshot(
  value: unknown,
  path: string,
): asserts value is QapiPipSnapshot {
  const record = expectRecord(value, path);
  expectString(record, 'pipId', path);
  expectNullableString(record, 'findingId', path);
  expectNullableString(record, 'determination', path);
  expectNullableString(record, 'status', path);
  expectNullableString(record, 'effectiveness', path);
  expectNullableString(record, 'openedAt', path);
  expectNullableString(record, 'closedAt', path);
  expectNullableBoolean(record, 'continuedFromPrior', path);
  expectStringArray(record, 'relatedCapIds', path);
  expectStringArray(record, 'relatedRcaIds', path);
}

function assertActionSnapshot(
  value: unknown,
  path: string,
): asserts value is QapiActionSnapshot {
  const record = expectRecord(value, path);
  expectString(record, 'actionId', path);
  expectString(record, 'description', path);
  expectNullableString(record, 'ownerRole', path);
  expectNullableString(record, 'ownerUserId', path);
  expectNullableString(record, 'dueDate', path);
  expectNullableString(record, 'status', path);
  expectNullableString(record, 'carryForwardStatus', path);
  expectStringArray(record, 'relatedFindingIds', path);
  expectStringArray(record, 'relatedWorkflowIds', path);
}

function parseJson(serialized: string): unknown {
  try {
    return JSON.parse(serialized) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    throw new Error(`Malformed QapiTrendSnapshot JSON: ${message}`);
  }
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortJson(value[key])]),
    );
  }

  return value;
}

function expectRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object.`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function expectString(
  record: Record<string, unknown>,
  key: string,
  path: string,
): string {
  const value = expectKey(record, key, path);
  if (typeof value !== 'string') {
    throw new Error(`${path}.${key} must be a string.`);
  }
  return value;
}

function expectNullableString(
  record: Record<string, unknown>,
  key: string,
  path: string,
): string | null {
  const value = expectKey(record, key, path);
  if (value !== null && typeof value !== 'string') {
    throw new Error(`${path}.${key} must be a string or null.`);
  }
  return value;
}

function expectNumber(
  record: Record<string, unknown>,
  key: string,
  path: string,
): number {
  const value = expectKey(record, key, path);
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${path}.${key} must be a finite number.`);
  }
  return value;
}

function expectNullableNumber(
  record: Record<string, unknown>,
  key: string,
  path: string,
): number | null {
  const value = expectKey(record, key, path);
  if (value !== null && (typeof value !== 'number' || !Number.isFinite(value))) {
    throw new Error(`${path}.${key} must be a finite number or null.`);
  }
  return value;
}

function expectNullableNumberString(
  record: Record<string, unknown>,
  key: string,
  path: string,
): number | string | null {
  const value = expectKey(record, key, path);
  if (
    value !== null &&
    typeof value !== 'string' &&
    (typeof value !== 'number' || !Number.isFinite(value))
  ) {
    throw new Error(`${path}.${key} must be a finite number, string, or null.`);
  }
  return value;
}

function expectNullableBoolean(
  record: Record<string, unknown>,
  key: string,
  path: string,
): boolean | null {
  const value = expectKey(record, key, path);
  if (value !== null && typeof value !== 'boolean') {
    throw new Error(`${path}.${key} must be a boolean or null.`);
  }
  return value;
}

function expectArray(
  record: Record<string, unknown>,
  key: string,
  path: string,
): unknown[] {
  const value = expectKey(record, key, path);
  if (!Array.isArray(value)) {
    throw new Error(`${path}.${key} must be an array.`);
  }
  return value;
}

function expectStringArray(
  record: Record<string, unknown>,
  key: string,
  path: string,
): string[] {
  const value = expectArray(record, key, path);
  if (!value.every((item) => typeof item === 'string')) {
    throw new Error(`${path}.${key} must contain only strings.`);
  }
  return value;
}

function expectLiteral<T extends string>(
  record: Record<string, unknown>,
  key: string,
  allowedValues: readonly T[],
  path: string,
): T {
  const value = expectString(record, key, path);
  if (!allowedValues.includes(value as T)) {
    throw new Error(`${path}.${key} has unsupported value ${value}.`);
  }
  return value as T;
}

function expectComparabilityState(
  record: Record<string, unknown>,
  key: string,
  path: string,
): ComparabilityState {
  const value = expectString(record, key, path);
  if (!comparabilityStates.includes(value as ComparabilityState)) {
    throw new Error(`${path}.${key} has unsupported value ${value}.`);
  }
  return value as ComparabilityState;
}

function expectKey(
  record: Record<string, unknown>,
  key: string,
  path: string,
): unknown {
  if (!Object.prototype.hasOwnProperty.call(record, key)) {
    throw new Error(`${path}.${key} is required.`);
  }
  return record[key];
}
