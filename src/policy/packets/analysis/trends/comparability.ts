import type {
  ComparabilityState,
  QapiMetricSnapshot,
  QapiTrendSnapshot,
} from '@/policy/packets/contracts';

export interface ComparabilityDetermination {
  state: ComparabilityState;
  limitationDisclosure: string | null;
  priorMetric: QapiMetricSnapshot | null;
}

const comparable = 'COMPARABLE' satisfies ComparabilityState;
const comparableWithLimitation =
  'COMPARABLE WITH LIMITATION' satisfies ComparabilityState;
const definitionChanged =
  'NOT COMPARABLE — DEFINITION CHANGED' satisfies ComparabilityState;
const cohortChanged =
  'NOT COMPARABLE — COHORT CHANGED' satisfies ComparabilityState;
const unitChanged = 'NOT COMPARABLE — UNIT CHANGED' satisfies ComparabilityState;
const priorUnavailable = 'PRIOR DATA UNAVAILABLE' satisfies ComparabilityState;
const priorConflicted = 'PRIOR DATA CONFLICTED' satisfies ComparabilityState;

interface PriorMetricResolution {
  metric: QapiMetricSnapshot | null;
  conflicted: boolean;
  reason: string | null;
}

export function determineComparability(
  current: QapiTrendSnapshot,
  prior: QapiTrendSnapshot | null | undefined,
  currentMetric?: QapiMetricSnapshot,
): ComparabilityDetermination {
  if (prior == null) {
    return determination(
      priorUnavailable,
      'Prior-period packet is unavailable.',
      null,
    );
  }

  if (
    hasMetricIdentityConflict(current.metrics) ||
    hasMetricIdentityConflict(prior.metrics)
  ) {
    return determination(
      priorConflicted,
      'Metric identities are duplicated within a trend snapshot.',
      null,
    );
  }

  const cohortDisclosure = firstChangedField(current, prior, [
    ['agencyId', 'Agency changed between packet periods.'],
    ['eventFamilyId', 'Event family changed between packet periods.'],
    ['workflowId', 'Workflow changed between packet periods.'],
  ]);
  if (cohortDisclosure != null) {
    return determination(cohortChanged, cohortDisclosure, null);
  }

  const definitionDisclosure = firstChangedField(current, prior, [
    [
      'kpiDefinitionVersion',
      'KPI definition version changed between packet periods.',
    ],
    ['metricSchemaVersion', 'Metric schema version changed between periods.'],
  ]);
  if (definitionDisclosure != null) {
    return determination(definitionChanged, definitionDisclosure, null);
  }

  if (currentMetric !== undefined) {
    const resolved = resolvePriorMetric(currentMetric, prior.metrics);
    if (resolved.conflicted) {
      return determination(priorConflicted, resolved.reason, null);
    }

    if (resolved.metric == null) {
      return determination(
        priorUnavailable,
        `Prior metric data unavailable for ${currentMetric.metricKey}.`,
        null,
      );
    }

    const metricState = compareMetricDefinitions(currentMetric, resolved.metric);
    if (metricState != null) {
      return determination(
        metricState.state,
        metricState.limitationDisclosure,
        resolved.metric,
      );
    }

    return withSnapshotLimitations(current, prior, resolved.metric);
  }

  const metricState = compareMetricCollections(current.metrics, prior.metrics);
  if (metricState != null) {
    return determination(metricState.state, metricState.limitationDisclosure, null);
  }

  return withSnapshotLimitations(current, prior, null);
}

export function findPriorMetric(
  currentMetric: QapiMetricSnapshot,
  prior: QapiTrendSnapshot,
): QapiMetricSnapshot | null {
  const resolved = resolvePriorMetric(currentMetric, prior.metrics);
  return resolved.conflicted ? null : resolved.metric;
}

function determination(
  state: ComparabilityState,
  limitationDisclosure: string | null,
  priorMetric: QapiMetricSnapshot | null,
): ComparabilityDetermination {
  return {
    state,
    limitationDisclosure,
    priorMetric,
  };
}

function compareMetricCollections(
  currentMetrics: QapiMetricSnapshot[],
  priorMetrics: QapiMetricSnapshot[],
): Pick<ComparabilityDetermination, 'state' | 'limitationDisclosure'> | null {
  for (const currentMetric of currentMetrics) {
    const resolved = resolvePriorMetric(currentMetric, priorMetrics);
    if (resolved.conflicted) {
      return {
        state: priorConflicted,
        limitationDisclosure: resolved.reason,
      };
    }

    if (resolved.metric == null) {
      return {
        state: priorUnavailable,
        limitationDisclosure: `Prior metric data unavailable for ${currentMetric.metricKey}.`,
      };
    }

    const metricState = compareMetricDefinitions(currentMetric, resolved.metric);
    if (metricState != null) {
      return metricState;
    }
  }

  return null;
}

function compareMetricDefinitions(
  currentMetric: QapiMetricSnapshot,
  priorMetric: QapiMetricSnapshot,
): Pick<ComparabilityDetermination, 'state' | 'limitationDisclosure'> | null {
  if (currentMetric.definitionVersion !== priorMetric.definitionVersion) {
    return {
      state: definitionChanged,
      limitationDisclosure: `Definition version changed for ${currentMetric.metricKey}.`,
    };
  }

  if (currentMetric.unit !== priorMetric.unit) {
    return {
      state: unitChanged,
      limitationDisclosure: `Unit changed for ${currentMetric.metricKey}.`,
    };
  }

  return null;
}

function withSnapshotLimitations(
  current: QapiTrendSnapshot,
  prior: QapiTrendSnapshot,
  priorMetric: QapiMetricSnapshot | null,
): ComparabilityDetermination {
  const limitations: string[] = [];

  if (current.cadence !== prior.cadence) {
    limitations.push('Cadence changed between packet periods.');
  }

  if (current.sourceClassification !== prior.sourceClassification) {
    limitations.push('Source classification changed between packet periods.');
  } else if (current.sourceClassification === 'synthetic') {
    limitations.push('Synthetic source classification limits trend use.');
  }

  if (limitations.length > 0) {
    return determination(
      comparableWithLimitation,
      limitations.join(' '),
      priorMetric,
    );
  }

  return determination(comparable, null, priorMetric);
}

function resolvePriorMetric(
  currentMetric: QapiMetricSnapshot,
  priorMetrics: QapiMetricSnapshot[],
): PriorMetricResolution {
  const idMatches = priorMetrics.filter(
    (priorMetric) => priorMetric.metricId === currentMetric.metricId,
  );
  const keyMatches = priorMetrics.filter(
    (priorMetric) => priorMetric.metricKey === currentMetric.metricKey,
  );
  const matches = new Set([...idMatches, ...keyMatches]);

  if (matches.size > 1 || idMatches.length > 1 || keyMatches.length > 1) {
    return {
      metric: null,
      conflicted: true,
      reason: `Prior metric data conflicted for ${currentMetric.metricKey}.`,
    };
  }

  return {
    metric: matches.values().next().value ?? null,
    conflicted: false,
    reason: null,
  };
}

function hasMetricIdentityConflict(metrics: QapiMetricSnapshot[]): boolean {
  return hasDuplicate(metrics.map((metric) => metric.metricId))
    || hasDuplicate(metrics.map((metric) => metric.metricKey));
}

function hasDuplicate(values: string[]): boolean {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      return true;
    }
    seen.add(value);
  }
  return false;
}

function firstChangedField(
  current: QapiTrendSnapshot,
  prior: QapiTrendSnapshot,
  checks: Array<[keyof QapiTrendSnapshot, string]>,
): string | null {
  for (const [field, disclosure] of checks) {
    if (current[field] !== prior[field]) {
      return disclosure;
    }
  }
  return null;
}
