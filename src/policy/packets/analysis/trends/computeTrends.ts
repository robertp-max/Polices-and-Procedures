import type {
  QapiActionSnapshot,
  QapiMetricSnapshot,
  QapiPipSnapshot,
  QapiTrendSnapshot,
  TrendComparisonOutput,
  TrendDirection,
} from '@/policy/packets/contracts';
import { determineComparability } from './comparability';
import type { ComparabilityDetermination } from './comparability';

const comparableStates = new Set(['COMPARABLE', 'COMPARABLE WITH LIMITATION']);
const priorPeriodPacketNotFoundBanner: Exclude<
  TrendComparisonOutput['missingPriorBanner'],
  null
> = 'PRIOR-PERIOD PACKET NOT FOUND — Trend comparison unavailable.';

export function computeTrends(
  current: QapiTrendSnapshot,
  prior: QapiTrendSnapshot | null | undefined,
): TrendComparisonOutput {
  const overall = determineComparability(current, prior);
  const priorPacketInstanceId = prior?.packetInstanceId ?? null;
  const missingPriorBanner =
    prior == null ? priorPeriodPacketNotFoundBanner : null;

  return {
    currentPacketInstanceId: current.packetInstanceId,
    priorPacketInstanceId,
    overallComparability: overall.state,
    limitationDisclosure: overall.limitationDisclosure,
    missingPriorBanner,
    metrics: current.metrics.map((metric) =>
      computeMetricTrend(metric, current, prior),
    ),
    pipEffectiveness: summarizePipEffectiveness(current.pips),
    capRcaRecurrence: summarizeCapRcaRecurrence(current.pips, prior?.pips ?? []),
    reopenedIssues: current.findings
      .filter((finding) => finding.reopened === true)
      .map((finding) => finding.findingId),
    carryForwardActionStatuses: current.actionItems.filter(hasCarryForwardStatus),
    generatedAt: current.generatedAt,
  };
}

export const computeTrendComparison = computeTrends;

function computeMetricTrend(
  metric: QapiMetricSnapshot,
  current: QapiTrendSnapshot,
  prior: QapiTrendSnapshot | null | undefined,
): QapiMetricSnapshot {
  const metricComparability = determineComparability(current, prior, metric);

  if (
    !comparableStates.has(metricComparability.state) ||
    metricComparability.priorMetric == null
  ) {
    return withoutTrend(metric, metricComparability);
  }

  const priorMetric = metricComparability.priorMetric;
  const currentValue = numericTrendValue(metric);
  const priorValue = numericTrendValue(priorMetric);
  const absoluteChange =
    currentValue == null || priorValue == null ? null : currentValue - priorValue;
  const percentagePointChange =
    metric.rate == null || priorMetric.rate == null
      ? null
      : metric.rate - priorMetric.rate;
  const currentTargetStatus = targetStatus(metric, currentValue);
  const priorTargetStatus = targetStatus(priorMetric, priorValue);
  const currentTargetMet = targetMet(currentTargetStatus);
  const priorTargetMet = targetMet(priorTargetStatus);
  const direction = trendDirection(
    absoluteChange,
    currentTargetMet,
    priorTargetMet,
  );

  return {
    ...metric,
    priorValue: displayTrendValue(priorMetric),
    absoluteChange,
    percentagePointChange,
    direction,
    comparability: metricComparability.state,
    comparabilityLimitation: metricComparability.limitationDisclosure,
    targetStatus: currentTargetStatus,
    sustainedPerformance:
      currentTargetMet == null || priorTargetMet == null
        ? null
        : currentTargetMet && priorTargetMet,
    repeatedDeficiency:
      currentTargetMet == null || priorTargetMet == null
        ? null
        : !currentTargetMet && !priorTargetMet,
    emergingDecline:
      currentTargetMet == null || priorTargetMet == null
        ? direction === 'worsening'
        : !currentTargetMet && priorTargetMet,
    improvement:
      currentTargetMet == null || priorTargetMet == null
        ? direction === 'improving'
        : currentTargetMet && !priorTargetMet,
  };
}

function withoutTrend(
  metric: QapiMetricSnapshot,
  metricComparability: ComparabilityDetermination,
): QapiMetricSnapshot {
  return {
    ...metric,
    priorValue: null,
    absoluteChange: null,
    percentagePointChange: null,
    direction:
      metricComparability.state === 'PRIOR DATA UNAVAILABLE'
        ? 'unknown'
        : 'not-comparable',
    comparability: metricComparability.state,
    comparabilityLimitation: metricComparability.limitationDisclosure,
    sustainedPerformance: null,
    repeatedDeficiency: null,
    emergingDecline: null,
    improvement: null,
  };
}

function displayTrendValue(metric: QapiMetricSnapshot): number | string | null {
  if (metric.rate != null) {
    return metric.rate;
  }
  return metric.absoluteValue;
}

function numericTrendValue(metric: QapiMetricSnapshot): number | null {
  if (metric.rate != null) {
    return metric.rate;
  }
  return typeof metric.absoluteValue === 'number' ? metric.absoluteValue : null;
}

function targetStatus(
  metric: QapiMetricSnapshot,
  currentValue: number | null,
): string | null {
  if (metric.targetStatus != null) {
    return metric.targetStatus;
  }

  if (typeof metric.target !== 'number' || currentValue == null) {
    return null;
  }

  return currentValue >= metric.target ? 'met' : 'not met';
}

function targetMet(status: string | null): boolean | null {
  if (status == null) {
    return null;
  }

  const normalized = status.toLowerCase();
  if (
    normalized.includes('not met') ||
    normalized.includes('unmet') ||
    normalized.includes('below target') ||
    normalized.includes('deficient')
  ) {
    return false;
  }

  if (
    normalized.includes('met') ||
    normalized.includes('compliant') ||
    normalized.includes('on target') ||
    normalized.includes('achieved')
  ) {
    return true;
  }

  return null;
}

function trendDirection(
  absoluteChange: number | null,
  currentTargetMet: boolean | null,
  priorTargetMet: boolean | null,
): TrendDirection {
  if (
    currentTargetMet != null &&
    priorTargetMet != null &&
    currentTargetMet !== priorTargetMet
  ) {
    return currentTargetMet ? 'improving' : 'worsening';
  }

  if (absoluteChange == null) {
    return 'unknown';
  }

  if (absoluteChange === 0) {
    return 'stable';
  }

  return absoluteChange > 0 ? 'improving' : 'worsening';
}

function summarizePipEffectiveness(pips: QapiPipSnapshot[]): string | null {
  const values = uniqueNonEmpty(pips.map((pip) => pip.effectiveness));
  return values.length === 0 ? null : values.join('; ');
}

function summarizeCapRcaRecurrence(
  currentPips: QapiPipSnapshot[],
  priorPips: QapiPipSnapshot[],
): string | null {
  const priorIds = new Set(
    priorPips.flatMap((pip) => [...pip.relatedCapIds, ...pip.relatedRcaIds]),
  );
  const recurringIds = uniqueNonEmpty(
    currentPips.flatMap((pip) =>
      [...pip.relatedCapIds, ...pip.relatedRcaIds].filter((id) =>
        priorIds.has(id),
      ),
    ),
  );

  if (recurringIds.length === 0) {
    return null;
  }

  return `Recurring CAP/RCA references: ${recurringIds.join(', ')}`;
}

function hasCarryForwardStatus(action: QapiActionSnapshot): boolean {
  return action.carryForwardStatus != null;
}

function uniqueNonEmpty(values: Array<string | null>): string[] {
  return [...new Set(values.filter((value): value is string => value != null && value !== ''))];
}
