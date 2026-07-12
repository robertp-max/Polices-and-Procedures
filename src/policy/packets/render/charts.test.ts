// @vitest-environment node
import { describe, expect, it } from 'vitest';

import type {
  KpiAccessibleTable,
  KpiChartDatum,
  KpiDashboardChart,
} from '@/policy/packets/analysis/kpi/dashboardModel';

import {
  KPI_CHART_UNKNOWN_PANEL_TITLE,
  renderKpiAccessibleTable,
  renderKpiPerformanceChart,
} from './charts/kpiDashboardCharts';

describe('FR-009 KPI chart renderers', () => {
  it('renders an inline SVG and accessible table from the same shared KPI data object', () => {
    const sharedData = [validatedDatum()] as const satisfies readonly KpiChartDatum[];
    const table: KpiAccessibleTable = {
      caption: 'Validated hospitalization KPI',
      columns: [
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
      ],
      sourceData: sharedData,
      rows: [{
        indicator: 'STALE indicator row',
        currentValue: '999.0%',
        numerator: '999',
        denominator: '999',
        target: 'STALE target',
        priorValue: '999.0%',
        trendDirection: 'worsening',
        status: 'NOT_MET',
        confidence: 'low',
        validationStatus: 'Conflicted — reconciliation required',
        source: 'stale.source',
      }],
    };
    const chart: KpiDashboardChart = {
      chartId: 'chart:test:hospitalization',
      title: 'QAPI KPI current values (percentage)',
      unit: 'percentage',
      sharedData,
      accessibleTable: table,
    };

    const chartHtml = renderKpiPerformanceChart(chart);
    const tableHtml = renderKpiAccessibleTable(table);

    expect(chart.accessibleTable.sourceData).toBe(chart.sharedData);
    expect(chartHtml).toContain('<svg');
    expect(chartHtml).toContain('Monthly performance vs target');
    expect(chartHtml).toContain('4.0%');
    expect(chartHtml).toContain('Target ≤ 8.0%');
    expect(chartHtml).toContain('<caption>Validated hospitalization KPI</caption>');
    expect(tableHtml).toContain('<td>100</td>');
    expect(tableHtml).toContain('adverseEvents.hospitalizationsTotal');
    expect(tableHtml).not.toContain('STALE indicator row');
    expect(tableHtml).not.toContain('999.0%');
    expect(tableHtml).not.toContain('stale.source');
  });

  it('renders an UNKNOWN panel instead of a chart for an unvalidated malformed KPI', () => {
    const sharedData = [{
      ...validatedDatum(),
      valueState: 'REJECTED',
      currentValue: null,
      displayValue: 'REJECTED',
      numerator: null,
      denominator: null,
      confidence: 'low',
      validationStatus: 'Conflicted — reconciliation required',
      status: 'UNKNOWN',
    }] as const satisfies readonly KpiChartDatum[];
    const table: KpiAccessibleTable = {
      caption: 'Malformed hospitalization KPI',
      columns: [
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
      ],
      sourceData: sharedData,
      rows: [{
        indicator: 'Acute-care hospitalization rate',
        currentValue: 'REJECTED',
        numerator: 'UNKNOWN',
        denominator: 'UNKNOWN',
        target: '≤ 8.0%',
        priorValue: '6.0%',
        trendDirection: 'unknown',
        status: 'UNKNOWN',
        confidence: 'low',
        validationStatus: 'Conflicted — reconciliation required',
        source: 'adverseEvents.hospitalizationsTotal',
      }],
    };
    const chart: KpiDashboardChart = {
      chartId: 'chart:test:malformed',
      title: 'QAPI KPI current values (percentage)',
      unit: 'percentage',
      sharedData,
      accessibleTable: table,
    };

    const html = renderKpiPerformanceChart(chart);

    expect(html).toContain(KPI_CHART_UNKNOWN_PANEL_TITLE);
    expect(html).toContain('value state is REJECTED');
    expect(html).toContain('<caption>Malformed hospitalization KPI</caption>');
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('<rect x="188"');
  });

  it('renders an UNKNOWN panel instead of a chart when a rate KPI has malformed components', () => {
    const sharedData = [{
      ...validatedDatum(),
      denominator: null,
    }] as const satisfies readonly KpiChartDatum[];
    const table: KpiAccessibleTable = {
      caption: 'Malformed hospitalization KPI denominator',
      columns: [
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
      ],
      sourceData: sharedData,
      rows: [{
        indicator: 'Acute-care hospitalization rate',
        currentValue: '4.0%',
        numerator: '4',
        denominator: 'UNKNOWN',
        target: '≤ 8.0%',
        priorValue: '6.0%',
        trendDirection: 'improving',
        status: 'MET',
        confidence: 'high',
        validationStatus: 'Validated',
        source: 'adverseEvents.hospitalizationsTotal; censusPopulation.activeCensus',
      }],
    };
    const chart: KpiDashboardChart = {
      chartId: 'chart:test:malformed-components',
      title: 'QAPI KPI current values (percentage)',
      unit: 'percentage',
      sharedData,
      accessibleTable: table,
    };

    const html = renderKpiPerformanceChart(chart);

    expect(html).toContain(KPI_CHART_UNKNOWN_PANEL_TITLE);
    expect(html).toContain('denominator is malformed or missing');
    expect(html).toContain('<caption>Malformed hospitalization KPI denominator</caption>');
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('<rect x="188"');
  });
});

function validatedDatum(): KpiChartDatum {
  return {
    indicatorId: 'qapi-hospitalization-rate',
    title: 'Acute-care hospitalization rate',
    unit: 'percentage',
    valueState: 'KNOWN',
    currentValue: 4,
    displayValue: '4.0%',
    numerator: 4,
    denominator: 100,
    target: '≤ 8.0%',
    priorValue: 6,
    priorDisplayValue: '6.0%',
    trendDirection: 'improving',
    status: 'MET',
    confidence: 'high',
    validationStatus: 'Validated',
    source: ['adverseEvents.hospitalizationsTotal', 'censusPopulation.activeCensus'],
  };
}
