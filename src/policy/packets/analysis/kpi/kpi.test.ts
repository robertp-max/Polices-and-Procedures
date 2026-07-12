import { buildKpiDashboardModel } from './dashboardModel';
import {
  getQapiKpiDefinition,
  MINIMUM_QAPI_KPI_INDICATOR_IDS,
  QAPI_KPI_DEFINITION_VERSION,
  QAPI_KPI_DEFINITIONS,
} from './kpiDefinitions';
import type { KpiDefinition } from './kpiDefinitions';
import { calculateKpi, calculateKpis, qapiMetricInput } from './calculateKpis';

const quarterlyHospitalization = getQapiKpiDefinition(
  'qapi-hospitalization-rate',
  'quarterly',
);
const quarterlyDocumentation = getQapiKpiDefinition(
  'qapi-documentation-defect-rate',
  'quarterly',
);
const quarterlyDocumentationCompliance = getQapiKpiDefinition(
  'qapi-documentation-audit-compliance',
  'quarterly',
);
const quarterlyAttendance = getQapiKpiDefinition(
  'qapi-committee-attendance-rate',
  'quarterly',
);
const quarterlyActionCompletion = getQapiKpiDefinition(
  'qapi-action-completion-rate',
  'quarterly',
);
const quarterlyComplaint = getQapiKpiDefinition('qapi-complaint-rate', 'quarterly');
const quarterlyPipTriggers = getQapiKpiDefinition('qapi-pip-trigger-count', 'quarterly');
const quarterlyActionClosureDays = getQapiKpiDefinition(
  'qapi-action-closure-days',
  'quarterly',
);

const FR009_MINIMUM_INDICATOR_IDS = [
  'qapi-patients-episodes-in-scope',
  'qapi-active-census',
  'qapi-hospitalization-rate',
  'qapi-ed-use-rate',
  'qapi-adverse-event-rate',
  'qapi-infection-rate',
  'qapi-documentation-audit-compliance',
  'qapi-medication-reconciliation-compliance',
  'qapi-missed-visit-compliance',
  'qapi-complaint-rate',
  'qapi-active-pip-count',
  'qapi-open-cap-rca-count',
] as const;

describe('WP-2.2 QAPI KPI definitions', () => {
  it('publishes the exact FR-009 minimum-card set with monthly and quarterly variants', () => {
    const variantsByIndicator = new Map<string, Set<string>>();
    for (const definition of QAPI_KPI_DEFINITIONS) {
      const cadences = variantsByIndicator.get(definition.indicatorId) ?? new Set<string>();
      cadences.add(definition.measurementPeriod.cadence);
      variantsByIndicator.set(definition.indicatorId, cadences);
      expect(definition.definitionVersion).toBe(QAPI_KPI_DEFINITION_VERSION);
      expect(definition.sourceRecords.length).toBeGreaterThan(0);
      expect(definition.formula.length).toBeGreaterThan(0);
    }

    expect(MINIMUM_QAPI_KPI_INDICATOR_IDS).toEqual(FR009_MINIMUM_INDICATOR_IDS);
    for (const indicatorId of FR009_MINIMUM_INDICATOR_IDS) {
      expect(variantsByIndicator.get(indicatorId)).toEqual(new Set(['monthly', 'quarterly']));
    }
  });
});

describe('WP-2.2 KPI calculation engine', () => {
  it('calculates a rate from numeric numerator and denominator fields and preserves num/den', () => {
    const result = calculateKpi(quarterlyHospitalization, {
      hospitalizationsTotal: qapiMetricInput(5),
      activeCensus: qapiMetricInput(100),
    });

    expect(result.valueState).toBe('KNOWN');
    expect(result.currentValue).toBe(5);
    expect(result.displayValue).toBe('5.0%');
    expect(result.numerator).toBe(5);
    expect(result.denominator).toBe(100);
    expect(result.status).toBe('MET');
    expect(result.metricSnapshot.rate).toBe(5);
  });

  it('handles zero denominators explicitly without showing a false zero rate', () => {
    const result = calculateKpi(quarterlyHospitalization, {
      hospitalizationsTotal: qapiMetricInput(5),
      activeCensus: qapiMetricInput(0),
    });

    expect(result.valueState).toBe('ZERO_DENOMINATOR');
    expect(result.currentValue).toBeNull();
    expect(result.displayValue).toBe('ZERO_DENOMINATOR');
    expect(result.numerator).toBe(5);
    expect(result.denominator).toBe(0);
    expect(result.status).toBe('UNKNOWN');
    expect(result.validationStatus).toBe('Validated with limitation');
  });

  it('rejects non-finite ratio results instead of leaking Infinity', () => {
    const result = calculateKpi(quarterlyHospitalization, {
      hospitalizationsTotal: qapiMetricInput(Number.MAX_VALUE),
      activeCensus: qapiMetricInput(Number.MIN_VALUE),
    });

    expect(result.valueState).toBe('REJECTED');
    expect(result.currentValue).toBeNull();
    expect(result.displayValue).toBe('REJECTED');
    expect(result.reason).toContain('non-finite');
    expect(result.metricSnapshot.rate).toBeNull();
  });

  it('propagates a missing numerator as UNKNOWN rather than substituting zero', () => {
    const result = calculateKpi(quarterlyHospitalization, {
      activeCensus: qapiMetricInput(100),
    });

    expect(result.valueState).toBe('UNKNOWN');
    expect(result.currentValue).toBeNull();
    expect(result.numerator).toBeNull();
    expect(result.reason).toContain('Missing numeric field');
    expect(result.validationStatus).toBe('Unknown — not recovered');
  });

  it('rejects malformed glued strings instead of parsing them as numeric inputs', () => {
    const result = calculateKpi(quarterlyHospitalization, {
      hospitalizationsTotal: qapiMetricInput('5 patients120'),
      activeCensus: qapiMetricInput(120),
    });

    expect(result.valueState).toBe('REJECTED');
    expect(result.currentValue).toBeNull();
    expect(result.reason).toContain('Malformed/glued-string');
    expect(result.validationStatus).toBe('Conflicted — reconciliation required');
  });

  it('flags conflicting component totals before calculating a denominator-based rate', () => {
    const result = calculateKpi(quarterlyDocumentation, {
      oasisLateSoc: qapiMetricInput(1),
      pocMissingF2F: qapiMetricInput(2),
      pocUnsignedOrMissingSignature: qapiMetricInput(1),
      medReconciliationMismatch: qapiMetricInput(0),
      documentationDefectsTotal: qapiMetricInput(9),
      chartsAudited: qapiMetricInput(50),
    });

    expect(result.valueState).toBe('CONFLICTED');
    expect(result.currentValue).toBeNull();
    expect(result.reason).toContain('components sum to 4');
    expect(result.status).toBe('UNKNOWN');
  });

  it('calculates documentation compliance as a complement rate with numerator and denominator', () => {
    const result = calculateKpi(quarterlyDocumentationCompliance, {
      oasisLateSoc: qapiMetricInput(1),
      pocMissingF2F: qapiMetricInput(2),
      pocUnsignedOrMissingSignature: qapiMetricInput(1),
      medReconciliationMismatch: qapiMetricInput(0),
      documentationDefectsTotal: qapiMetricInput(4),
      chartsAudited: qapiMetricInput(50),
    });

    expect(result.valueState).toBe('KNOWN');
    expect(result.currentValue).toBe(92);
    expect(result.displayValue).toBe('92.0%');
    expect(result.numerator).toBe(46);
    expect(result.denominator).toBe(50);
    expect(result.status).toBe('NOT_MET');
  });

  it('rejects impossible complement rates where exclusions exceed the denominator', () => {
    const result = calculateKpi(quarterlyDocumentationCompliance, {
      oasisLateSoc: qapiMetricInput(30),
      pocMissingF2F: qapiMetricInput(20),
      pocUnsignedOrMissingSignature: qapiMetricInput(5),
      medReconciliationMismatch: qapiMetricInput(0),
      documentationDefectsTotal: qapiMetricInput(55),
      chartsAudited: qapiMetricInput(50),
    });

    expect(result.valueState).toBe('CONFLICTED');
    expect(result.currentValue).toBeNull();
    expect(result.reason).toContain('negative');
    expect(result.denominator).toBe(50);
    expect(result.status).toBe('UNKNOWN');
  });

  it('evaluates lower, higher, and range threshold directions', () => {
    const lowerResult = calculateKpi(quarterlyHospitalization, {
      hospitalizationsTotal: qapiMetricInput(10),
      activeCensus: qapiMetricInput(100),
    });
    const higherResult = calculateKpi(quarterlyActionCompletion, {
      actionItemsCompleted: qapiMetricInput(8),
      actionItemsDue: qapiMetricInput(10),
    });
    const rangeResult = calculateKpi(quarterlyAttendance, {
      attendeesPresent: qapiMetricInput(9),
      attendeesExpected: qapiMetricInput(10),
    });

    expect(lowerResult.status).toBe('NOT_MET');
    expect(higherResult.status).toBe('NOT_MET');
    expect(rangeResult.status).toBe('MET');
    expect(rangeResult.threshold.direction).toBe('range');
  });

  it('distinguishes count, rate, percentage, days, and currency KPI units', () => {
    const countResult = calculateKpi(quarterlyPipTriggers, {
      pipTriggerCount: qapiMetricInput(3),
    });
    const rateResult = calculateKpi(quarterlyComplaint, {
      complaintsCount: qapiMetricInput(3),
      activeCensus: qapiMetricInput(60),
    });
    const percentageResult = calculateKpi(quarterlyHospitalization, {
      hospitalizationsTotal: qapiMetricInput(3),
      activeCensus: qapiMetricInput(60),
    });
    const daysResult = calculateKpi(quarterlyActionClosureDays, {
      averageActionClosureDays: qapiMetricInput(7.5),
    });
    const currencyDefinition: KpiDefinition = {
      ...quarterlyPipTriggers,
      definitionId: 'qapi-corrective-action-spend:quarterly',
      indicatorId: 'qapi-corrective-action-spend',
      title: 'Corrective-action spend',
      numerator: 'Corrective-action dollars spent',
      unit: 'currency',
      formula: 'correctiveActionSpend',
      target: { value: 1000, display: '<= $1,000.00', operator: '<=' },
      threshold: {
        direction: 'lower-is-better',
        label: '<= $1,000.00',
        operator: '<=',
        value: 1000,
      },
      sourceRecords: ['actionItems.correctiveActionSpend'],
      calculation: {
        kind: 'direct',
        valueField: 'correctiveActionSpend',
      },
    };
    const currencyResult = calculateKpi(currencyDefinition, {
      correctiveActionSpend: qapiMetricInput(123.45),
    });

    expect(countResult.unit).toBe('count');
    expect(countResult.displayValue).toBe('3');
    expect(countResult.denominator).toBeNull();
    expect(countResult.metricSnapshot.rate).toBeNull();
    expect(rateResult.unit).toBe('rate');
    expect(rateResult.displayValue).toBe('5.0 per 100');
    expect(rateResult.numerator).toBe(3);
    expect(rateResult.denominator).toBe(60);
    expect(percentageResult.unit).toBe('percentage');
    expect(percentageResult.displayValue).toBe('5.0%');
    expect(percentageResult.denominator).toBe(60);
    expect(daysResult.unit).toBe('days');
    expect(daysResult.displayValue).toBe('7.5 days');
    expect(currencyResult.unit).toBe('currency');
    expect(currencyResult.displayValue).toBe('$123.45');
  });

  it('propagates low-confidence inputs as UNKNOWN pending validation', () => {
    const result = calculateKpi(quarterlyHospitalization, {
      hospitalizationsTotal: qapiMetricInput(5, 'low'),
      activeCensus: qapiMetricInput(100),
    });

    expect(result.valueState).toBe('UNKNOWN');
    expect(result.confidence).toBe('low');
    expect(result.currentValue).toBeNull();
    expect(result.validationStatus).toBe('Provisional — human review required');
  });

  it('marks prior values not comparable when the definition version changes', () => {
    const revised: KpiDefinition = {
      ...quarterlyHospitalization,
      definitionVersion: 'FR-008-QAPI-KPI-v2',
    };
    const result = calculateKpi(
      revised,
      {
        hospitalizationsTotal: qapiMetricInput(4),
        activeCensus: qapiMetricInput(100),
      },
      {
        prior: {
          value: 6,
          definitionVersion: QAPI_KPI_DEFINITION_VERSION,
          unit: 'percentage',
          numerator: 6,
          denominator: 100,
        },
      },
    );

    expect(result.priorValue).toBe(6);
    expect(result.trendDirection).toBe('not-comparable');
    expect(result.comparability).toBe('NOT COMPARABLE — DEFINITION CHANGED');
    expect(result.metricSnapshot.absoluteChange).toBeNull();
  });

  it('builds FR-009 dashboard cards and shared chart/table data from calculated KPIs', () => {
    const results = calculateKpis(
      [quarterlyHospitalization, quarterlyPipTriggers],
      {
        hospitalizationsTotal: qapiMetricInput(4),
        activeCensus: qapiMetricInput(100),
        pipTriggerCount: qapiMetricInput(2),
      },
      {
        priorByIndicatorId: {
          'qapi-hospitalization-rate': {
            value: 6,
            definitionVersion: QAPI_KPI_DEFINITION_VERSION,
            unit: 'percentage',
          },
          'qapi-pip-trigger-count': {
            value: 1,
            definitionVersion: QAPI_KPI_DEFINITION_VERSION,
            unit: 'count',
          },
        },
        sourceLabel: 'QAPI test fixture',
      },
    );
    const model = buildKpiDashboardModel(results);
    const hospitalizationCard = model.cards.find(
      (card) => card.indicatorId === 'qapi-hospitalization-rate',
    );
    const percentageChart = model.charts.find((chart) => chart.unit === 'percentage');

    expect(hospitalizationCard).toBeDefined();
    expect(hospitalizationCard!.currentValue.display).toBe('4.0%');
    expect(hospitalizationCard!.numerator.value).toBe(4);
    expect(hospitalizationCard!.denominator.value).toBe(100);
    expect(hospitalizationCard!.target.display).toBe('≤ 8.0%');
    expect(hospitalizationCard!.priorValue.display).toBe('6.0%');
    expect(hospitalizationCard!.trendDirection).toBe('improving');
    expect(hospitalizationCard!.status).toBe('MET');
    expect(hospitalizationCard!.source.length).toBeGreaterThan(0);
    expect(hospitalizationCard!.confidence).toBe('high');
    expect(hospitalizationCard!.validationStatus).toBe('Validated');
    expect(percentageChart).toBeDefined();
    expect(percentageChart!.accessibleTable.sourceData).toBe(percentageChart!.sharedData);
    expect(percentageChart!.accessibleTable.rows[0].denominator).toBe('100');
  });
});
