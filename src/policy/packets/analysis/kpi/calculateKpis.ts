import {
  APPENDIX_D_DATA_VALIDATION_STATUS_VOCABULARY,
  COMPARABILITY_STATES,
} from '@/policy/packets/contracts';
import type {
  AppendixDDataValidationStatus,
  ComparabilityState,
  QapiMetricSnapshot,
  TrendDirection,
} from '@/policy/packets/contracts';
import type { QapiDerivedMetric } from '@/policy/brad/intake/adapters/qapiIntakeAdapter';
import type {
  KpiCalculationSpec,
  KpiDefinition,
  KpiThreshold,
  KpiUnit,
} from './kpiDefinitions';

export const KPI_UNKNOWN = 'UNKNOWN' as const;

export type KpiInputConfidence = QapiDerivedMetric['confidence'];

export type KpiCalculationState =
  | 'KNOWN'
  | typeof KPI_UNKNOWN
  | 'ZERO_DENOMINATOR'
  | 'REJECTED'
  | 'CONFLICTED';

export type KpiThresholdStatus = 'MET' | 'NOT_MET' | typeof KPI_UNKNOWN;

export interface KpiInputMetric {
  value: QapiDerivedMetric['value'];
  confidence: KpiInputConfidence;
  sourceQuotes?: readonly string[];
  needsReview?: boolean;
  note?: string;
}

export type KpiInputRecord = Readonly<Record<string, KpiInputMetric | undefined>>;

export interface PriorKpiSnapshot {
  value: number | null;
  definitionVersion: string;
  unit: KpiUnit;
  numerator?: number | null;
  denominator?: number | null;
}

export interface CalculateKpiOptions {
  prior?: PriorKpiSnapshot;
  sourceLabel?: string;
}

export interface CalculateKpisOptions {
  priorByDefinitionId?: Readonly<Record<string, PriorKpiSnapshot | undefined>>;
  priorByIndicatorId?: Readonly<Record<string, PriorKpiSnapshot | undefined>>;
  sourceLabel?: string;
}

export interface CalculatedKpi {
  definitionId: string;
  indicatorId: string;
  title: string;
  definitionVersion: string;
  measurementPeriod: KpiDefinition['measurementPeriod'];
  unit: KpiUnit;
  valueState: KpiCalculationState;
  currentValue: number | null;
  displayValue: string;
  numerator: number | null;
  denominator: number | null;
  target: KpiDefinition['target'];
  threshold: KpiThreshold;
  priorValue: number | null;
  priorDisplayValue: string;
  trendDirection: TrendDirection;
  status: KpiThresholdStatus;
  sourceRecords: readonly string[];
  sourceQuotes: readonly string[];
  sourceLabel: string | null;
  confidence: KpiInputConfidence;
  validationStatus: AppendixDDataValidationStatus;
  comparability: ComparabilityState;
  reason: string | null;
  metricSnapshot: QapiMetricSnapshot;
}

type NumericRead =
  | {
      kind: 'known';
      value: number;
      confidence: 'high';
      sourceQuotes: readonly string[];
    }
  | {
      kind: 'unknown';
      confidence: KpiInputConfidence;
      reason: string;
      validationStatus: AppendixDDataValidationStatus;
      sourceQuotes: readonly string[];
    }
  | {
      kind: 'rejected';
      reason: string;
      sourceQuotes: readonly string[];
    }
  | {
      kind: 'conflicted';
      reason: string;
      sourceQuotes: readonly string[];
    };

type CalculationOutput =
  | {
      state: 'KNOWN';
      value: number;
      numerator: number | null;
      denominator: number | null;
      confidence: 'high';
      validationStatus: AppendixDDataValidationStatus;
      reason: null;
      sourceQuotes: readonly string[];
    }
  | {
      state: Exclude<KpiCalculationState, 'KNOWN'>;
      value: null;
      numerator: number | null;
      denominator: number | null;
      confidence: KpiInputConfidence;
      validationStatus: AppendixDDataValidationStatus;
      reason: string;
      sourceQuotes: readonly string[];
    };

type CalculatedKpiCore = Omit<CalculatedKpi, 'metricSnapshot'>;

const VALIDATED = APPENDIX_D_DATA_VALIDATION_STATUS_VOCABULARY[0];
const VALIDATED_WITH_LIMITATION = APPENDIX_D_DATA_VALIDATION_STATUS_VOCABULARY[1];
const PROVISIONAL_REVIEW_REQUIRED = APPENDIX_D_DATA_VALIDATION_STATUS_VOCABULARY[2];
const CONFLICTED_RECONCILIATION_REQUIRED = APPENDIX_D_DATA_VALIDATION_STATUS_VOCABULARY[3];
const UNKNOWN_NOT_RECOVERED = APPENDIX_D_DATA_VALIDATION_STATUS_VOCABULARY[4];

const COMPARABLE = COMPARABILITY_STATES[0];
const NOT_COMPARABLE_DEFINITION_CHANGED = COMPARABILITY_STATES[2];
const NOT_COMPARABLE_UNIT_CHANGED = COMPARABILITY_STATES[4];
const PRIOR_DATA_UNAVAILABLE = COMPARABILITY_STATES[5];

export function qapiMetricInput(
  value: QapiDerivedMetric['value'],
  confidence: KpiInputConfidence = 'high',
  sourceQuotes: readonly string[] = [],
): KpiInputMetric {
  return { value, confidence, sourceQuotes, needsReview: confidence !== 'high' };
}

export function calculateKpis(
  definitions: readonly KpiDefinition[],
  inputs: KpiInputRecord,
  options: CalculateKpisOptions = {},
): CalculatedKpi[] {
  return definitions.map((definition) =>
    calculateKpi(definition, inputs, {
      prior:
        options.priorByDefinitionId?.[definition.definitionId] ??
        options.priorByIndicatorId?.[definition.indicatorId],
      sourceLabel: options.sourceLabel,
    }),
  );
}

export function calculateKpi(
  definition: KpiDefinition,
  inputs: KpiInputRecord,
  options: CalculateKpiOptions = {},
): CalculatedKpi {
  const output = runCalculation(definition.calculation, definition, inputs);
  const prior = options.prior;
  const comparability = resolveComparability(definition, prior);
  const trendDirection = resolveTrendDirection(definition, output, prior, comparability);
  const priorValue = prior?.value ?? null;
  const status = output.state === 'KNOWN' ? evaluateThreshold(output.value, definition.threshold) : KPI_UNKNOWN;
  const displayValue =
    output.state === 'KNOWN'
      ? formatKpiValue(output.value, definition.unit)
      : output.state;
  const core: CalculatedKpiCore = {
    definitionId: definition.definitionId,
    indicatorId: definition.indicatorId,
    title: definition.title,
    definitionVersion: definition.definitionVersion,
    measurementPeriod: definition.measurementPeriod,
    unit: definition.unit,
    valueState: output.state,
    currentValue: output.value,
    displayValue,
    numerator: output.numerator,
    denominator: output.denominator,
    target: definition.target,
    threshold: definition.threshold,
    priorValue,
    priorDisplayValue:
      priorValue == null ? KPI_UNKNOWN : formatKpiValue(priorValue, definition.unit),
    trendDirection,
    status,
    sourceRecords: definition.sourceRecords,
    sourceQuotes: output.sourceQuotes,
    sourceLabel: options.sourceLabel ?? null,
    confidence: output.confidence,
    validationStatus: output.validationStatus,
    comparability,
    reason: output.reason,
  };
  return { ...core, metricSnapshot: toQapiMetricSnapshot(core) };
}

export function evaluateThreshold(value: number, threshold: KpiThreshold): KpiThresholdStatus {
  if (threshold.direction === 'range') {
    if (threshold.min == null || threshold.max == null) return KPI_UNKNOWN;
    return value >= threshold.min && value <= threshold.max ? 'MET' : 'NOT_MET';
  }
  if (threshold.value == null || threshold.operator == null) return KPI_UNKNOWN;
  return compareWithOperator(value, threshold.operator, threshold.value) ? 'MET' : 'NOT_MET';
}

export function formatKpiValue(value: number, unit: KpiUnit): string {
  if (unit === 'count') return Number.isInteger(value) ? String(value) : value.toFixed(1);
  if (unit === 'percentage') return `${value.toFixed(1)}%`;
  if (unit === 'rate') return `${value.toFixed(1)} per 100`;
  if (unit === 'days') return `${value.toFixed(1)} days`;
  return `$${value.toFixed(2)}`;
}

function runCalculation(
  calculation: KpiCalculationSpec,
  definition: KpiDefinition,
  inputs: KpiInputRecord,
): CalculationOutput {
  if (calculation.kind === 'ratio') {
    return calculateRatio(calculation, inputs);
  }
  if (calculation.kind === 'count') {
    const field = calculation.valueField ?? calculation.numeratorField;
    if (!field) {
      return nonKnown('REJECTED', 'Count KPI definition is missing a value field.', null, null, 'low', []);
    }
    const read = readNumericField(inputs, field);
    return outputFromDirectRead(read, definition.unit);
  }
  const field = calculation.valueField;
  if (!field) {
    return nonKnown('REJECTED', 'Direct KPI definition is missing a value field.', null, null, 'low', []);
  }
  const read = readNumericField(inputs, field);
  return outputFromDirectRead(read, definition.unit);
}

function calculateRatio(
  calculation: KpiCalculationSpec,
  inputs: KpiInputRecord,
): CalculationOutput {
  const numerator = readNumerator(calculation, inputs);
  if (numerator.kind !== 'known') {
    return outputFromFailedRead(numerator, null, null);
  }
  if (!calculation.denominatorField) {
    return nonKnown(
      'REJECTED',
      'Rate KPI definition is missing a denominator field.',
      numerator.value,
      null,
      'low',
      numerator.sourceQuotes,
    );
  }
  const denominator = readNumericField(inputs, calculation.denominatorField);
  if (denominator.kind !== 'known') {
    return outputFromFailedRead(denominator, numerator.value, null);
  }
  const sourceQuotes = [...numerator.sourceQuotes, ...denominator.sourceQuotes];
  if (denominator.value === 0) {
    return {
      state: 'ZERO_DENOMINATOR',
      value: null,
      numerator: numerator.value,
      denominator: 0,
      confidence: 'high',
      validationStatus: VALIDATED_WITH_LIMITATION,
      reason: 'Denominator is zero; rate is not calculable and must not be shown as 0.',
      sourceQuotes,
    };
  }
  return {
    state: 'KNOWN',
    value: (numerator.value / denominator.value) * (calculation.scale ?? 1),
    numerator: numerator.value,
    denominator: denominator.value,
    confidence: 'high',
    validationStatus: VALIDATED,
    reason: null,
    sourceQuotes,
  };
}

function readNumerator(
  calculation: KpiCalculationSpec,
  inputs: KpiInputRecord,
): NumericRead {
  if (calculation.numeratorFields?.length) {
    const sum = sumNumericFields(inputs, calculation.numeratorFields);
    if (sum.kind !== 'known') return sum;
    if (calculation.reportedTotalField) {
      const reported = readNumericField(inputs, calculation.reportedTotalField);
      if (reported.kind === 'known' && !numbersEqual(sum.value, reported.value)) {
        return {
          kind: 'conflicted',
          reason: `Conflicting total for ${calculation.reportedTotalField}: components sum to ${sum.value} but reported total is ${reported.value}.`,
          sourceQuotes: [...sum.sourceQuotes, ...reported.sourceQuotes],
        };
      }
      if (reported.kind === 'rejected' || reported.kind === 'conflicted') return reported;
    }
    return sum;
  }
  if (!calculation.numeratorField) {
    return {
      kind: 'rejected',
      reason: 'Rate KPI definition is missing a numerator field.',
      sourceQuotes: [],
    };
  }
  return readNumericField(inputs, calculation.numeratorField);
}

function sumNumericFields(inputs: KpiInputRecord, fields: readonly string[]): NumericRead {
  let total = 0;
  const sourceQuotes: string[] = [];
  for (const field of fields) {
    const read = readNumericField(inputs, field);
    if (read.kind !== 'known') return read;
    total += read.value;
    sourceQuotes.push(...read.sourceQuotes);
  }
  return { kind: 'known', value: total, confidence: 'high', sourceQuotes };
}

function readNumericField(inputs: KpiInputRecord, field: string): NumericRead {
  const metric = inputs[field];
  if (!metric) {
    return {
      kind: 'unknown',
      confidence: 'none',
      reason: `Missing numeric field: ${field}.`,
      validationStatus: UNKNOWN_NOT_RECOVERED,
      sourceQuotes: [],
    };
  }
  const sourceQuotes = metric.sourceQuotes ?? [];
  if (metric.confidence !== 'high') {
    return {
      kind: 'unknown',
      confidence: metric.confidence,
      reason: `Low-confidence input for ${field}; KPI remains UNKNOWN pending validation.`,
      validationStatus:
        metric.confidence === 'none' ? UNKNOWN_NOT_RECOVERED : PROVISIONAL_REVIEW_REQUIRED,
      sourceQuotes,
    };
  }
  if (metric.value == null) {
    return {
      kind: 'unknown',
      confidence: 'none',
      reason: `Missing numeric value for ${field}.`,
      validationStatus: UNKNOWN_NOT_RECOVERED,
      sourceQuotes,
    };
  }
  if (typeof metric.value === 'number' && Number.isFinite(metric.value)) {
    return { kind: 'known', value: metric.value, confidence: 'high', sourceQuotes };
  }
  return {
    kind: 'rejected',
    reason: `Malformed/glued-string numeric input for ${field}: expected a finite numeric field.`,
    sourceQuotes,
  };
}

function outputFromDirectRead(read: NumericRead, unit: KpiUnit): CalculationOutput {
  if (read.kind !== 'known') return outputFromFailedRead(read, null, null);
  return {
    state: 'KNOWN',
    value: read.value,
    numerator: unit === 'count' ? read.value : null,
    denominator: null,
    confidence: 'high',
    validationStatus: VALIDATED,
    reason: null,
    sourceQuotes: read.sourceQuotes,
  };
}

function outputFromFailedRead(
  read: Exclude<NumericRead, { kind: 'known' }>,
  numerator: number | null,
  denominator: number | null,
): CalculationOutput {
  if (read.kind === 'unknown') {
    return nonKnown(
      KPI_UNKNOWN,
      read.reason,
      numerator,
      denominator,
      read.confidence,
      read.sourceQuotes,
      read.validationStatus,
    );
  }
  if (read.kind === 'conflicted') {
    return nonKnown(
      'CONFLICTED',
      read.reason,
      numerator,
      denominator,
      'low',
      read.sourceQuotes,
      CONFLICTED_RECONCILIATION_REQUIRED,
    );
  }
  return nonKnown(
    'REJECTED',
    read.reason,
    numerator,
    denominator,
    'low',
    read.sourceQuotes,
    CONFLICTED_RECONCILIATION_REQUIRED,
  );
}

function nonKnown(
  state: Exclude<KpiCalculationState, 'KNOWN'>,
  reason: string,
  numerator: number | null,
  denominator: number | null,
  confidence: KpiInputConfidence,
  sourceQuotes: readonly string[],
  validationStatus: AppendixDDataValidationStatus = CONFLICTED_RECONCILIATION_REQUIRED,
): CalculationOutput {
  return {
    state,
    value: null,
    numerator,
    denominator,
    confidence,
    validationStatus,
    reason,
    sourceQuotes,
  };
}

function resolveComparability(
  definition: KpiDefinition,
  prior: PriorKpiSnapshot | undefined,
): ComparabilityState {
  if (!prior || prior.value == null) return PRIOR_DATA_UNAVAILABLE;
  if (prior.definitionVersion !== definition.definitionVersion) {
    return NOT_COMPARABLE_DEFINITION_CHANGED;
  }
  if (prior.unit !== definition.unit) return NOT_COMPARABLE_UNIT_CHANGED;
  return COMPARABLE;
}

function resolveTrendDirection(
  definition: KpiDefinition,
  output: CalculationOutput,
  prior: PriorKpiSnapshot | undefined,
  comparability: ComparabilityState,
): TrendDirection {
  if (comparability !== COMPARABLE) {
    return comparability === PRIOR_DATA_UNAVAILABLE ? 'unknown' : 'not-comparable';
  }
  if (output.state !== 'KNOWN' || !prior || prior.value == null) return 'unknown';
  if (numbersEqual(output.value, prior.value)) return 'stable';
  if (definition.threshold.direction === 'lower-is-better') {
    return output.value < prior.value ? 'improving' : 'worsening';
  }
  if (definition.threshold.direction === 'higher-is-better') {
    return output.value > prior.value ? 'improving' : 'worsening';
  }
  return resolveRangeTrend(output.value, prior.value, definition.threshold);
}

function resolveRangeTrend(
  current: number,
  prior: number,
  threshold: KpiThreshold,
): TrendDirection {
  if (threshold.min == null || threshold.max == null) return 'unknown';
  const midpoint = (threshold.min + threshold.max) / 2;
  const currentDistance = Math.abs(current - midpoint);
  const priorDistance = Math.abs(prior - midpoint);
  if (numbersEqual(currentDistance, priorDistance)) return 'stable';
  return currentDistance < priorDistance ? 'improving' : 'worsening';
}

function compareWithOperator(left: number, operator: KpiThreshold['operator'], right: number): boolean {
  if (operator === '>=') return left >= right;
  if (operator === '>') return left > right;
  if (operator === '<=') return left <= right;
  if (operator === '<') return left < right;
  if (operator === '=') return numbersEqual(left, right);
  return false;
}

function toQapiMetricSnapshot(result: CalculatedKpiCore): QapiMetricSnapshot {
  const comparable = result.comparability === COMPARABLE;
  const absoluteChange =
    comparable && result.currentValue != null && result.priorValue != null
      ? result.currentValue - result.priorValue
      : null;
  const rate =
    result.currentValue != null && (result.unit === 'percentage' || result.unit === 'rate')
      ? result.currentValue
      : null;
  return {
    metricId: result.indicatorId,
    metricKey: result.definitionId,
    label: result.title,
    definitionVersion: result.definitionVersion,
    unit: result.unit,
    numerator: result.numerator,
    denominator: result.denominator,
    rate,
    absoluteValue: rate == null ? result.currentValue : null,
    target: result.target.value,
    priorValue: result.priorValue,
    absoluteChange,
    percentagePointChange: rate == null ? null : absoluteChange,
    direction: result.trendDirection,
    comparability: result.comparability,
    comparabilityLimitation:
      result.comparability === COMPARABLE ? null : result.comparability,
    targetStatus: result.status === KPI_UNKNOWN ? null : result.status,
    sustainedPerformance: null,
    repeatedDeficiency: null,
    emergingDecline: null,
    improvement: result.trendDirection === 'improving',
  };
}

function numbersEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < 0.000001;
}
