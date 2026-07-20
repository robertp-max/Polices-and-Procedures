import type {
  AppendixDDataValidationStatus,
  TrendDirection,
} from '@/policy/packets/contracts';
import type {
  KpiAccessibleTable,
  KpiChartDatum,
  KpiDashboardCard,
  KpiDashboardChart,
  KpiDashboardModel,
} from '@/policy/packets/analysis/kpi/dashboardModel';

import { escapeHtml, renderPanel } from '../chrome';
import { renderDataTable, UNKNOWN_SOURCE_NOT_RECOVERED } from '../pagination';

export const KPI_CHART_UNKNOWN_PANEL_TITLE = 'UNKNOWN — Chart not rendered' as const;

export type KpiSupplementalChartKind =
  | 'adverse-events-by-category'
  | 'infection-trends-classification'
  | 'documentation-deficiencies-by-type'
  | 'pip-cap-status-by-stage'
  | 'complaints-by-category-resolution';

export interface KpiSupplementalChartRow {
  label: string;
  value: number | null;
  detail: string;
  status: string;
  validationStatus: AppendixDDataValidationStatus;
  source: string;
}

export interface KpiSupplementalChartData {
  chartId: string;
  kind: KpiSupplementalChartKind;
  title: string;
  caption: string;
  valueLabel: string;
  sourceData: readonly KpiSupplementalChartRow[];
}

export interface KpiHistoryPoint {
  indicator: string;
  period: string;
  value: number | null;
  target: number | null;
  validationStatus: AppendixDDataValidationStatus;
  source: string;
}

export interface KpiHistoryChartData {
  chartId: string;
  title: string;
  caption: string;
  unit: string;
  sourceData: readonly KpiHistoryPoint[];
}

const VALIDATED = 'Validated' satisfies AppendixDDataValidationStatus;
const CHART_WIDTH = 640;
const LEFT_PAD = 188;
const RIGHT_PAD = 34;
const TOP_PAD = 38;
const ROW_HEIGHT = 38;
const BAR_HEIGHT = 12;

export function renderKpiDashboardStyles(): string {
  return `<style>
    .kpi-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:8px;}
    .kpi-card{border:1px solid #d7dee2;border-radius:6px;padding:10px;background:#fbfcfc;break-inside:avoid;page-break-inside:avoid;}
    .kpi-card h3{font-size:11.5px;line-height:1.25;margin:0 0 7px;color:#111827;}
    .kpi-card-value{font-size:19px;font-weight:800;color:#111827;margin-bottom:7px;}
    .kpi-card-meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;font-size:9.5px;color:#374151;}
    .kpi-card-meta span{display:block;}
    .kpi-card-source{font-size:9px;color:#4b5563;margin-top:7px;border-top:1px solid #e5e7eb;padding-top:6px;}
    .kpi-status-line{font-weight:700;}
    .kpi-chart-panel svg{display:block;width:100%;height:auto;margin:2px 0 8px;}
    .kpi-chart-unknown{border-style:dashed;}
    .kpi-chart-note{font-size:10.5px;color:#374151;margin:0 0 8px;}
  </style>`;
}

export function renderKpiCardGrid(cards: readonly KpiDashboardCard[]): string {
  const body = cards.length > 0
    ? `<div class="kpi-card-grid">${cards.map(renderKpiCard).join('')}</div>`
    : `<p class="p">${escapeHtml(UNKNOWN_SOURCE_NOT_RECOVERED)}</p>`;

  return renderPanel('KPI card grid', body);
}

export function renderKpiDashboardChartSections(args: {
  model: KpiDashboardModel;
  rollingHistory: KpiHistoryChartData;
  supplementalCharts: readonly KpiSupplementalChartData[];
}): string {
  const kpiCharts = args.model.charts
    .flatMap((chart) => [
      renderKpiPerformanceChart(chart),
      renderKpiPriorPeriodChart(chart),
    ])
    .join('');
  const supplemental = args.supplementalCharts.map(renderSupplementalBarChart).join('');
  return `${kpiCharts}${renderKpiRollingHistoryChart(args.rollingHistory)}${supplemental}`;
}

export function renderKpiPerformanceChart(chart: KpiDashboardChart): string {
  const tableHtml = renderKpiAccessibleTable(chart.accessibleTable);
  const sharedGuard = sharedTableGuard(chart);
  if (sharedGuard) {
    return renderUnknownChartPanel('Monthly performance vs target', chart.title, sharedGuard, tableHtml);
  }

  const points = chart.sharedData.map((datum) => ({
    datum,
    target: parseTargetNumber(datum.target),
  }));
  const invalidReason = points
    .map((point) => invalidKpiDatumReason(point.datum, point.target))
    .find((reason) => reason !== null);
  if (invalidReason) {
    return renderUnknownChartPanel('Monthly performance vs target', chart.title, invalidReason, tableHtml);
  }

  const rows = points.map((point) => ({
    label: point.datum.title,
    current: point.datum.currentValue as number,
    target: point.target as number,
    valueLabel: point.datum.displayValue,
    targetLabel: point.datum.target,
    status: point.datum.status,
  }));
  const svg = renderCurrentTargetSvg({
    chartId: chart.chartId,
    title: `Monthly performance vs target: ${chart.title}`,
    unit: chart.unit,
    rows,
  });

  return renderPanel(
    `Monthly performance vs target: ${chart.title}`,
    `${svg}${tableHtml}`,
    'kpi-chart-panel',
  );
}

export function renderKpiPriorPeriodChart(chart: KpiDashboardChart): string {
  const tableHtml = renderKpiAccessibleTable(chart.accessibleTable);
  const sharedGuard = sharedTableGuard(chart);
  if (sharedGuard) {
    return renderUnknownChartPanel('Current vs prior period', chart.title, sharedGuard, tableHtml);
  }

  const invalidReason = chart.sharedData
    .map(invalidPriorDatumReason)
    .find((reason) => reason !== null);
  if (invalidReason) {
    return renderUnknownChartPanel('Current vs prior period', chart.title, invalidReason, tableHtml);
  }

  const rows = chart.sharedData.map((datum) => ({
    label: datum.title,
    current: datum.currentValue as number,
    prior: datum.priorValue as number,
    currentLabel: datum.displayValue,
    priorLabel: datum.priorDisplayValue,
    trend: datum.trendDirection,
  }));
  const svg = renderPriorComparisonSvg({
    chartId: `${chart.chartId}:prior`,
    title: `Current vs prior period: ${chart.title}`,
    unit: chart.unit,
    rows,
  });

  return renderPanel(
    `Current vs prior period: ${chart.title}`,
    `${svg}${tableHtml}`,
    'kpi-chart-panel',
  );
}

export function renderKpiRollingHistoryChart(chart: KpiHistoryChartData): string {
  const tableHtml = renderHistoryAccessibleTable(chart);
  const invalidReason = invalidHistoryReason(chart);
  if (invalidReason) {
    return renderUnknownChartPanel('Up to four prior quarters / rolling monthly history', chart.title, invalidReason, tableHtml);
  }

  const svg = renderHistorySvg(chart);
  return renderPanel(chart.title, `${svg}${tableHtml}`, 'kpi-chart-panel');
}

export function renderSupplementalBarChart(chart: KpiSupplementalChartData): string {
  const tableHtml = renderSupplementalAccessibleTable(chart);
  const invalidReason = invalidSupplementalReason(chart);
  if (invalidReason) {
    return renderUnknownChartPanel(chart.title, chart.caption, invalidReason, tableHtml);
  }

  const svg = renderHorizontalBarSvg({
    chartId: chart.chartId,
    title: chart.title,
    valueLabel: chart.valueLabel,
    rows: chart.sourceData.map((row) => ({
      label: row.label,
      value: row.value as number,
      detail: row.detail,
      status: row.status,
    })),
  });
  return renderPanel(chart.title, `${svg}${tableHtml}`, 'kpi-chart-panel');
}

export function renderKpiAccessibleTable(table: KpiAccessibleTable): string {
  return renderDataTable({
    caption: table.caption,
    headers: table.columns,
    rows: table.sourceData.map((datum) => [
      datum.title,
      datum.displayValue,
      displayNullableNumber(datum.numerator),
      displayNullableNumber(datum.denominator),
      datum.target,
      datum.priorDisplayValue,
      datum.trendDirection,
      datum.status,
      datum.confidence,
      datum.validationStatus,
      datum.source.join('; '),
    ]),
  });
}

export function renderSupplementalAccessibleTable(chart: KpiSupplementalChartData): string {
  return renderDataTable({
    caption: chart.caption,
    headers: ['Category or stage', chart.valueLabel, 'Detail', 'Status', 'Validation status', 'Source'],
    rows: chart.sourceData.map((row) => [
      row.label,
      displayNullableNumber(row.value),
      row.detail,
      row.status,
      row.validationStatus,
      row.source,
    ]),
    emptyText: UNKNOWN_SOURCE_NOT_RECOVERED,
  });
}

export function renderHistoryAccessibleTable(chart: KpiHistoryChartData): string {
  return renderDataTable({
    caption: chart.caption,
    headers: ['Indicator', 'Period', 'Value', 'Target', 'Validation status', 'Source'],
    rows: chart.sourceData.map((point) => [
      point.indicator,
      point.period,
      displayNullableNumber(point.value),
      displayNullableNumber(point.target),
      point.validationStatus,
      point.source,
    ]),
    emptyText: UNKNOWN_SOURCE_NOT_RECOVERED,
  });
}

function renderKpiCard(card: KpiDashboardCard): string {
  const source = card.source.length > 0 ? card.source.join('; ') : UNKNOWN_SOURCE_NOT_RECOVERED;
  return `<article class="kpi-card">
    <h3>${escapeHtml(card.title)}</h3>
    <div class="kpi-card-value">${escapeHtml(card.currentValue.display)}</div>
    <div class="kpi-card-meta">
      <span><b>Numerator</b> ${escapeHtml(card.numerator.display)}</span>
      <span><b>Denominator</b> ${escapeHtml(card.denominator.display)}</span>
      <span><b>Target</b> ${escapeHtml(card.target.display)}</span>
      <span><b>Prior</b> ${escapeHtml(card.priorValue.display)}</span>
      <span><b>Trend</b> ${trendWithIcon(card.trendDirection)}</span>
      <span class="kpi-status-line"><b>Status</b> ${statusWithIcon(card.status)}</span>
      <span><b>Confidence</b> ${escapeHtml(card.confidence)}</span>
      <span><b>Validation</b> ${escapeHtml(card.validationStatus)}</span>
    </div>
    <div class="kpi-card-source"><b>Source</b> ${escapeHtml(source)}</div>
  </article>`;
}

function renderCurrentTargetSvg(args: {
  chartId: string;
  title: string;
  unit: string;
  rows: ReadonlyArray<{
    label: string;
    current: number;
    target: number;
    valueLabel: string;
    targetLabel: string;
    status: string;
  }>;
}): string {
  const maxValue = maxPositive(args.rows.flatMap((row) => [row.current, row.target]));
  const height = TOP_PAD + args.rows.length * ROW_HEIGHT + 34;
  const plotWidth = CHART_WIDTH - LEFT_PAD - RIGHT_PAD;
  const titleId = svgId(args.chartId, 'title');
  const descId = svgId(args.chartId, 'desc');
  const rows = args.rows.map((row, index) => {
    const y = TOP_PAD + index * ROW_HEIGHT;
    const currentWidth = scaleWidth(row.current, maxValue, plotWidth);
    const targetX = LEFT_PAD + scaleWidth(row.target, maxValue, plotWidth);
    return `<g>
      <text x="8" y="${y + 14}" font-size="10" fill="#111827">${escapeSvgText(row.label)}</text>
      <rect x="${LEFT_PAD}" y="${y + 4}" width="${currentWidth}" height="${BAR_HEIGHT}" rx="2" fill="#2563eb"/>
      <line x1="${targetX}" y1="${y}" x2="${targetX}" y2="${y + 24}" stroke="#111827" stroke-width="1.5" stroke-dasharray="3 2"/>
      <text x="${LEFT_PAD + currentWidth + 5}" y="${y + 14}" font-size="9" fill="#111827">${escapeSvgText(row.valueLabel)}</text>
      <text x="${targetX + 4}" y="${y + 27}" font-size="8.5" fill="#374151">Target ${escapeSvgText(row.targetLabel)}</text>
      <text x="${CHART_WIDTH - RIGHT_PAD}" y="${y + 14}" font-size="9" text-anchor="end" fill="#374151">${escapeSvgText(row.status)}</text>
    </g>`;
  }).join('');

  return `<svg role="img" aria-labelledby="${titleId} ${descId}" viewBox="0 0 ${CHART_WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg">
    <title id="${titleId}">${escapeSvgText(args.title)}</title>
    <desc id="${descId}">Current KPI values in ${escapeSvgText(args.unit)} with target markers from the same shared KPI data table.</desc>
    <rect width="${CHART_WIDTH}" height="${height}" fill="#ffffff"/>
    <text x="8" y="18" font-size="12" font-weight="700" fill="#111827">${escapeSvgText(args.title)}</text>
    <text x="${LEFT_PAD}" y="18" font-size="9" fill="#374151">Current bar</text>
    <text x="${LEFT_PAD + 96}" y="18" font-size="9" fill="#374151">Dashed target marker</text>
    ${rows}
  </svg>`;
}

function renderPriorComparisonSvg(args: {
  chartId: string;
  title: string;
  unit: string;
  rows: ReadonlyArray<{
    label: string;
    current: number;
    prior: number;
    currentLabel: string;
    priorLabel: string;
    trend: TrendDirection;
  }>;
}): string {
  const maxValue = maxPositive(args.rows.flatMap((row) => [row.current, row.prior]));
  const height = TOP_PAD + args.rows.length * ROW_HEIGHT + 34;
  const plotWidth = CHART_WIDTH - LEFT_PAD - RIGHT_PAD;
  const titleId = svgId(args.chartId, 'title');
  const descId = svgId(args.chartId, 'desc');
  const rows = args.rows.map((row, index) => {
    const y = TOP_PAD + index * ROW_HEIGHT;
    const priorWidth = scaleWidth(row.prior, maxValue, plotWidth);
    const currentWidth = scaleWidth(row.current, maxValue, plotWidth);
    return `<g>
      <text x="8" y="${y + 18}" font-size="10" fill="#111827">${escapeSvgText(row.label)}</text>
      <rect x="${LEFT_PAD}" y="${y + 1}" width="${priorWidth}" height="${BAR_HEIGHT}" rx="2" fill="#9ca3af"/>
      <rect x="${LEFT_PAD}" y="${y + 17}" width="${currentWidth}" height="${BAR_HEIGHT}" rx="2" fill="#2563eb"/>
      <text x="${LEFT_PAD + priorWidth + 5}" y="${y + 11}" font-size="8.5" fill="#374151">Prior ${escapeSvgText(row.priorLabel)}</text>
      <text x="${LEFT_PAD + currentWidth + 5}" y="${y + 27}" font-size="8.5" fill="#111827">Current ${escapeSvgText(row.currentLabel)}</text>
      <text x="${CHART_WIDTH - RIGHT_PAD}" y="${y + 18}" font-size="9" text-anchor="end" fill="#374151">${escapeSvgText(row.trend)}</text>
    </g>`;
  }).join('');

  return `<svg role="img" aria-labelledby="${titleId} ${descId}" viewBox="0 0 ${CHART_WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg">
    <title id="${titleId}">${escapeSvgText(args.title)}</title>
    <desc id="${descId}">Current and prior KPI values in ${escapeSvgText(args.unit)} from the same shared KPI data table.</desc>
    <rect width="${CHART_WIDTH}" height="${height}" fill="#ffffff"/>
    <text x="8" y="18" font-size="12" font-weight="700" fill="#111827">${escapeSvgText(args.title)}</text>
    <text x="${LEFT_PAD}" y="18" font-size="9" fill="#374151">Prior gray, current blue</text>
    ${rows}
  </svg>`;
}

function renderHistorySvg(chart: KpiHistoryChartData): string {
  const rows = chart.sourceData;
  const maxValue = maxPositive(rows.flatMap((row) => [row.value ?? 0, row.target ?? 0]));
  const height = 220;
  const plotLeft = 68;
  const plotTop = 42;
  const plotWidth = CHART_WIDTH - 118;
  const plotHeight = 118;
  const titleId = svgId(chart.chartId, 'title');
  const descId = svgId(chart.chartId, 'desc');
  const points = rows.map((row, index) => {
    const x = plotLeft + (rows.length === 1 ? 0 : (plotWidth * index) / (rows.length - 1));
    const y = plotTop + plotHeight - ((row.value as number) / maxValue) * plotHeight;
    return { row, x, y };
  });
  const polyline = points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  const markers = points.map((point) => `<g>
    <circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="3.5" fill="#2563eb"/>
    <text x="${point.x.toFixed(1)}" y="${point.y - 8}" font-size="8.5" text-anchor="middle" fill="#111827">${escapeSvgText(displayNullableNumber(point.row.value))}</text>
    <text x="${point.x.toFixed(1)}" y="${plotTop + plotHeight + 18}" font-size="8.5" text-anchor="middle" fill="#374151">${escapeSvgText(point.row.period)}</text>
  </g>`).join('');

  return `<svg role="img" aria-labelledby="${titleId} ${descId}" viewBox="0 0 ${CHART_WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg">
    <title id="${titleId}">${escapeSvgText(chart.title)}</title>
    <desc id="${descId}">Rolling history for ${escapeSvgText(chart.unit)} KPI values from validated source points.</desc>
    <rect width="${CHART_WIDTH}" height="${height}" fill="#ffffff"/>
    <text x="8" y="18" font-size="12" font-weight="700" fill="#111827">${escapeSvgText(chart.title)}</text>
    <line x1="${plotLeft}" y1="${plotTop + plotHeight}" x2="${plotLeft + plotWidth}" y2="${plotTop + plotHeight}" stroke="#d1d5db"/>
    <line x1="${plotLeft}" y1="${plotTop}" x2="${plotLeft}" y2="${plotTop + plotHeight}" stroke="#d1d5db"/>
    <polyline points="${polyline}" fill="none" stroke="#2563eb" stroke-width="2"/>
    ${markers}
  </svg>`;
}

function renderHorizontalBarSvg(args: {
  chartId: string;
  title: string;
  valueLabel: string;
  rows: ReadonlyArray<{
    label: string;
    value: number;
    detail: string;
    status: string;
  }>;
}): string {
  const maxValue = maxPositive(args.rows.map((row) => row.value));
  const height = TOP_PAD + args.rows.length * ROW_HEIGHT + 32;
  const plotWidth = CHART_WIDTH - LEFT_PAD - RIGHT_PAD;
  const titleId = svgId(args.chartId, 'title');
  const descId = svgId(args.chartId, 'desc');
  const rows = args.rows.map((row, index) => {
    const y = TOP_PAD + index * ROW_HEIGHT;
    const width = scaleWidth(row.value, maxValue, plotWidth);
    return `<g>
      <text x="8" y="${y + 15}" font-size="10" fill="#111827">${escapeSvgText(row.label)}</text>
      <rect x="${LEFT_PAD}" y="${y + 4}" width="${width}" height="${BAR_HEIGHT}" rx="2" fill="#2563eb"/>
      <text x="${LEFT_PAD + width + 5}" y="${y + 14}" font-size="9" fill="#111827">${escapeSvgText(displayNullableNumber(row.value))}</text>
      <text x="${CHART_WIDTH - RIGHT_PAD}" y="${y + 14}" font-size="8.5" text-anchor="end" fill="#374151">${escapeSvgText(row.status)}</text>
      <text x="${LEFT_PAD}" y="${y + 29}" font-size="8.5" fill="#4b5563">${escapeSvgText(row.detail)}</text>
    </g>`;
  }).join('');

  return `<svg role="img" aria-labelledby="${titleId} ${descId}" viewBox="0 0 ${CHART_WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg">
    <title id="${titleId}">${escapeSvgText(args.title)}</title>
    <desc id="${descId}">${escapeSvgText(args.valueLabel)} by validated category or stage.</desc>
    <rect width="${CHART_WIDTH}" height="${height}" fill="#ffffff"/>
    <text x="8" y="18" font-size="12" font-weight="700" fill="#111827">${escapeSvgText(args.title)}</text>
    ${rows}
  </svg>`;
}

function renderUnknownChartPanel(
  chartFamily: string,
  title: string,
  reason: string,
  tableHtml: string,
): string {
  return renderPanel(
    `${KPI_CHART_UNKNOWN_PANEL_TITLE}: ${chartFamily}`,
    `<p class="kpi-chart-note"><b>UNKNOWN</b> ${escapeHtml(title)} cannot be rendered as a chart: ${escapeHtml(reason)}</p>${tableHtml}`,
    'kpi-chart-unknown',
  );
}

function sharedTableGuard(chart: KpiDashboardChart): string | null {
  return chart.accessibleTable.sourceData === chart.sharedData
    ? null
    : 'Accessible table sourceData is not the same shared data object used by the chart.';
}

function invalidKpiDatumReason(datum: KpiChartDatum, target: number | null): string | null {
  if (datum.valueState !== 'KNOWN') return `${datum.title} value state is ${datum.valueState}.`;
  if (datum.validationStatus !== VALIDATED) return `${datum.title} validation status is ${datum.validationStatus}.`;
  if (datum.confidence !== 'high') return `${datum.title} confidence is ${datum.confidence}.`;
  if (!isFiniteNumber(datum.currentValue)) return `${datum.title} current value is malformed or missing.`;
  if (datum.unit === 'percentage' || datum.unit === 'rate') {
    if (!isFiniteNumber(datum.numerator)) return `${datum.title} numerator is malformed or missing.`;
    if (!isFiniteNumber(datum.denominator)) return `${datum.title} denominator is malformed or missing.`;
  }
  if (!isFiniteNumber(target)) return `${datum.title} target is malformed or missing.`;
  return null;
}

function invalidPriorDatumReason(datum: KpiChartDatum): string | null {
  const currentReason = invalidKpiDatumReason(datum, 1);
  if (currentReason) return currentReason;
  if (!isFiniteNumber(datum.priorValue)) return `${datum.title} prior value is missing or malformed.`;
  if (datum.trendDirection === 'unknown' || datum.trendDirection === 'not-comparable') {
    return `${datum.title} trend direction is ${datum.trendDirection}.`;
  }
  return null;
}

function invalidHistoryReason(chart: KpiHistoryChartData): string | null {
  if (chart.sourceData.length < 2) return 'Fewer than two validated history points were recovered.';
  const invalid = chart.sourceData.find((point) =>
    point.validationStatus !== VALIDATED
    || !isFiniteNumber(point.value)
    || !isFiniteNumber(point.target)
  );
  if (!invalid) return null;
  return `${invalid.indicator} ${invalid.period} is ${invalid.validationStatus} or malformed.`;
}

function invalidSupplementalReason(chart: KpiSupplementalChartData): string | null {
  if (chart.sourceData.length === 0) return 'No validated source rows were recovered.';
  const invalid = chart.sourceData.find((row) =>
    row.validationStatus !== VALIDATED || !isFiniteNumber(row.value)
  );
  if (!invalid) return null;
  return `${invalid.label} is ${invalid.validationStatus} or malformed.`;
}

function parseTargetNumber(target: string): number | null {
  const match = /-?\d+(?:,\d{3})*(?:\.\d+)?/.exec(target);
  if (!match) return null;
  const value = Number(match[0].replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
}

function displayNullableNumber(value: number | null): string {
  return isFiniteNumber(value) ? String(value) : UNKNOWN_SOURCE_NOT_RECOVERED;
}

function isFiniteNumber(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function maxPositive(values: readonly number[]): number {
  const max = Math.max(...values.filter(Number.isFinite), 0);
  return max > 0 ? max : 1;
}

function scaleWidth(value: number, maxValue: number, plotWidth: number): number {
  if (value <= 0) return 0;
  return Math.max(1, Math.min(plotWidth, (value / maxValue) * plotWidth));
}

function statusWithIcon(status: KpiDashboardCard['status']): string {
  if (status === 'MET') return '<span aria-hidden="true">&#10003;</span> MET';
  if (status === 'NOT_MET') return '<span aria-hidden="true">&#9888;</span> NOT_MET';
  return '<span aria-hidden="true">?</span> UNKNOWN';
}

function trendWithIcon(direction: TrendDirection): string {
  if (direction === 'improving') return '<span aria-hidden="true">&#8593;</span> improving';
  if (direction === 'worsening') return '<span aria-hidden="true">&#8595;</span> worsening';
  if (direction === 'stable') return '<span aria-hidden="true">&#8596;</span> stable';
  if (direction === 'not-comparable') return '<span aria-hidden="true">&#8709;</span> not-comparable';
  return '<span aria-hidden="true">?</span> unknown';
}

function svgId(chartId: string, suffix: string): string {
  return `kpi-${chartId}-${suffix}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function escapeSvgText(value: unknown): string {
  return escapeHtml(value);
}
