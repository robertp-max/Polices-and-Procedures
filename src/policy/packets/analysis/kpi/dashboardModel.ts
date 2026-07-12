import type {
  AppendixDDataValidationStatus,
  QapiMetricSnapshot,
  TrendDirection,
} from '@/policy/packets/contracts';
import type {
  CalculatedKpi,
  KpiCalculationState,
  KpiInputConfidence,
  KpiThresholdStatus,
} from './calculateKpis';
import { KPI_UNKNOWN } from './calculateKpis';
import type { KpiUnit } from './kpiDefinitions';

export interface KpiDashboardMeasure {
  value: number | null;
  display: string;
}

export interface KpiDashboardCurrentValue extends KpiDashboardMeasure {
  state: KpiCalculationState;
  unit: KpiUnit;
}

export interface KpiDashboardCard {
  cardId: string;
  indicatorId: string;
  title: string;
  currentValue: KpiDashboardCurrentValue;
  numerator: KpiDashboardMeasure;
  denominator: KpiDashboardMeasure;
  target: KpiDashboardMeasure;
  priorValue: KpiDashboardMeasure;
  trendDirection: TrendDirection;
  status: KpiThresholdStatus;
  source: readonly string[];
  sourceQuotes: readonly string[];
  confidence: KpiInputConfidence;
  validationStatus: AppendixDDataValidationStatus;
  definitionVersion: string;
}

export interface KpiChartDatum {
  indicatorId: string;
  title: string;
  unit: KpiUnit;
  valueState: KpiCalculationState;
  currentValue: number | null;
  displayValue: string;
  numerator: number | null;
  denominator: number | null;
  target: string;
  priorValue: number | null;
  priorDisplayValue: string;
  trendDirection: TrendDirection;
  status: KpiThresholdStatus;
  confidence: KpiInputConfidence;
  validationStatus: AppendixDDataValidationStatus;
  source: readonly string[];
}

export interface KpiAccessibleTableRow {
  indicator: string;
  currentValue: string;
  numerator: string;
  denominator: string;
  target: string;
  priorValue: string;
  trendDirection: TrendDirection;
  status: KpiThresholdStatus;
  confidence: KpiInputConfidence;
  validationStatus: AppendixDDataValidationStatus;
  source: string;
}

export interface KpiAccessibleTable {
  caption: string;
  columns: readonly string[];
  sourceData: readonly KpiChartDatum[];
  rows: readonly KpiAccessibleTableRow[];
}

export interface KpiDashboardChart {
  chartId: string;
  title: string;
  unit: KpiUnit;
  sharedData: readonly KpiChartDatum[];
  accessibleTable: KpiAccessibleTable;
}

export interface KpiDashboardModel {
  dashboardId: string;
  title: string;
  cards: readonly KpiDashboardCard[];
  charts: readonly KpiDashboardChart[];
  metricSnapshots: readonly QapiMetricSnapshot[];
}

export interface BuildKpiDashboardModelOptions {
  dashboardId?: string;
  title?: string;
}

const TABLE_COLUMNS = [
  'Indicator',
  'Current value',
  'Numerator',
  'Denominator',
  'Target',
  'Prior value',
  'Trend direction',
  'Status',
  'Confidence',
  'Validation status',
  'Source',
] as const;

export function buildKpiDashboardModel(
  results: readonly CalculatedKpi[],
  options: BuildKpiDashboardModelOptions = {},
): KpiDashboardModel {
  const cards = results.map(toDashboardCard);
  const charts = buildCharts(results);
  return {
    dashboardId: options.dashboardId ?? 'qapi-kpi-dashboard',
    title: options.title ?? 'QAPI KPI dashboard',
    cards,
    charts,
    metricSnapshots: results.map((result) => result.metricSnapshot),
  };
}

function toDashboardCard(result: CalculatedKpi): KpiDashboardCard {
  return {
    cardId: `card:${result.definitionId}`,
    indicatorId: result.indicatorId,
    title: result.title,
    currentValue: {
      state: result.valueState,
      value: result.currentValue,
      display: result.displayValue,
      unit: result.unit,
    },
    numerator: {
      value: result.numerator,
      display: displayNullableNumber(result.numerator),
    },
    denominator: {
      value: result.denominator,
      display: displayNullableNumber(result.denominator),
    },
    target: {
      value: result.target.value,
      display: result.target.display,
    },
    priorValue: {
      value: result.priorValue,
      display: result.priorDisplayValue,
    },
    trendDirection: result.trendDirection,
    status: result.status,
    source: result.sourceRecords,
    sourceQuotes: result.sourceQuotes,
    confidence: result.confidence,
    validationStatus: result.validationStatus,
    definitionVersion: result.definitionVersion,
  };
}

function buildCharts(results: readonly CalculatedKpi[]): KpiDashboardChart[] {
  const byUnit = new Map<KpiUnit, CalculatedKpi[]>();
  for (const result of results) {
    const group = byUnit.get(result.unit);
    if (group) {
      group.push(result);
    } else {
      byUnit.set(result.unit, [result]);
    }
  }
  return [...byUnit.entries()].map(([unit, group]) => {
    const sharedData = group.map(toChartDatum);
    return {
      chartId: `chart:qapi-kpi-current:${unit}`,
      title: `QAPI KPI current values (${unit})`,
      unit,
      sharedData,
      accessibleTable: {
        caption: `QAPI KPI current values (${unit})`,
        columns: TABLE_COLUMNS,
        sourceData: sharedData,
        rows: sharedData.map(toAccessibleTableRow),
      },
    };
  });
}

function toChartDatum(result: CalculatedKpi): KpiChartDatum {
  return {
    indicatorId: result.indicatorId,
    title: result.title,
    unit: result.unit,
    valueState: result.valueState,
    currentValue: result.currentValue,
    displayValue: result.displayValue,
    numerator: result.numerator,
    denominator: result.denominator,
    target: result.target.display,
    priorValue: result.priorValue,
    priorDisplayValue: result.priorDisplayValue,
    trendDirection: result.trendDirection,
    status: result.status,
    confidence: result.confidence,
    validationStatus: result.validationStatus,
    source: result.sourceRecords,
  };
}

function toAccessibleTableRow(datum: KpiChartDatum): KpiAccessibleTableRow {
  return {
    indicator: datum.title,
    currentValue: datum.displayValue,
    numerator: displayNullableNumber(datum.numerator),
    denominator: displayNullableNumber(datum.denominator),
    target: datum.target,
    priorValue: datum.priorDisplayValue,
    trendDirection: datum.trendDirection,
    status: datum.status,
    confidence: datum.confidence,
    validationStatus: datum.validationStatus,
    source: datum.source.join('; '),
  };
}

function displayNullableNumber(value: number | null): string {
  return value == null ? KPI_UNKNOWN : String(value);
}
