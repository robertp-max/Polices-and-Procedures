import type { AppendixDDataValidationStatus } from '@/policy/packets/contracts';
import type {
  KpiDashboardModel,
} from '@/policy/packets/analysis/kpi/dashboardModel';
import { buildKpiDashboardModel } from '@/policy/packets/analysis/kpi/dashboardModel';
import type {
  KpiInputMetric,
  KpiInputRecord,
} from '@/policy/packets/analysis/kpi/calculateKpis';
import { calculateKpis, qapiMetricInput } from '@/policy/packets/analysis/kpi/calculateKpis';
import { QAPI_KPI_DEFINITIONS } from '@/policy/packets/analysis/kpi/kpiDefinitions';
import type { QapiPacketModelPayload } from '@/policy/packets/qapi/buildQapiPacketModel';
import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import {
  renderKpiCardGrid,
  renderKpiDashboardChartSections,
  renderKpiDashboardStyles,
  type KpiHistoryChartData,
  type KpiHistoryPoint,
  type KpiSupplementalChartData,
  type KpiSupplementalChartRow,
} from '../charts/kpiDashboardCharts';
import type { ModuleRenderer } from '../moduleRendererRegistry';
import { escapeHtml, renderModulePage, renderPanel } from '../chrome';
import { hasUnknownPath, UNKNOWN_SOURCE_NOT_RECOVERED } from '../pagination';

const VALIDATED = 'Validated' satisfies AppendixDDataValidationStatus;
const UNKNOWN_NOT_RECOVERED = 'Unknown — not recovered' satisfies AppendixDDataValidationStatus;

export const renderKpiDashboardModule: ModuleRenderer = (context) => {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const qapiModel = getQapiModelPayload(payload);
  const kpiDashboard = qapiModel?.kpiDashboard ?? buildLegacyDashboardModel(payload);
  const bodyHtml = `
    ${renderKpiDashboardStyles()}
    ${renderKpiCardGrid(kpiDashboard.cards)}
    ${renderKpiDashboardChartSections({
      model: kpiDashboard,
      rollingHistory: buildRollingHistoryChart(kpiDashboard, payload.roll.window.quarterLabel),
      supplementalCharts: buildSupplementalCharts(payload, qapiModel),
    })}
    ${payload.roll.window.packetType === 'interim'
      ? renderPanel('Interim date-window exclusions', `<p class="muted">Excluded as post-${escapeHtml(payload.roll.window.dataThroughDate)}: ${payload.roll.incidents.excludedFutureDated} incident(s), ${payload.roll.infections.excludedFutureDated} infection(s).</p>`)
      : ''}
  `;

  return renderModulePage({
    model: context.model,
    module: context.module,
    profile: context.profile,
    pageNumber: context.pageNumber,
    totalPages: context.totalPages,
    banner: payload.packetId,
    title: 'QAPI Data Dashboard (QA-FM-020)',
    bodyHtml,
    contentBlocks: [{ kind: 'heading', level: 2, text: 'Rich KPI dashboard' }],
    lockStatusText: payload.lock.statusText,
    lockPassed: payload.lock.pass,
    syntheticDetail: payload.syntheticWatermark,
  });
};

function getQapiModelPayload(payload: QapiPacketRenderPayload): QapiPacketModelPayload | null {
  const candidate = payload.qapiModel;
  if (!isRecord(candidate)) return null;
  return isRecord(candidate.kpiDashboard) ? candidate as unknown as QapiPacketModelPayload : null;
}

function buildLegacyDashboardModel(payload: QapiPacketRenderPayload): KpiDashboardModel {
  const definitions = QAPI_KPI_DEFINITIONS.filter(
    (definition) => definition.measurementPeriod.cadence === 'quarterly',
  );
  const results = calculateKpis(definitions, buildLegacyKpiInputs(payload), {
    sourceLabel: payload.datasetId ?? payload.sourceAgency ?? payload.packetId,
  });
  return buildKpiDashboardModel(results, {
    dashboardId: 'qapi-legacy-rollup-kpi-dashboard',
    title: `${payload.roll.window.quarterLabel} QAPI KPI dashboard`,
  });
}

function buildLegacyKpiInputs(payload: QapiPacketRenderPayload): KpiInputRecord {
  const unknownPaths = new Set(payload.unknownPaths);
  const documentationDefectPaths = [
    'documentation.oasisLateSoc',
    'documentation.pocMissingF2F',
    'documentation.pocUnsignedOrMissingSignature',
    'documentation.medReconMismatch',
  ] as const;
  const documentationDefectsTotal = documentationDefectPaths.some((path) => hasUnknownPath(unknownPaths, path))
    ? unknownMetric()
    : qapiMetricInput(
      payload.roll.documentation.oasisLateSoc
      + payload.roll.documentation.pocMissingF2F
      + payload.roll.documentation.pocUnsignedOrMissingSignature
      + payload.roll.documentation.medReconMismatch,
    );
  const chartsAudited = hasUnknownPath(unknownPaths, 'census.activeCensus')
    || hasUnknownPath(unknownPaths, 'census.recertDue')
    ? unknownMetric()
    : qapiMetricInput(payload.roll.census.activeCensus + payload.roll.census.recertDue);

  return {
    patientsOrEpisodesInScope: recoveredMetric(payload.roll.census.patientsInScope, 'census.patientsInScope', unknownPaths),
    activeCensus: recoveredMetric(payload.roll.census.activeCensus, 'census.activeCensus', unknownPaths),
    hospitalizationsTotal: recoveredMetric(payload.roll.incidents.total, 'incidents.total', unknownPaths),
    edUseTotal: unknownMetric(),
    adverseEventsTotal: recoveredMetric(payload.roll.incidents.total, 'incidents.total', unknownPaths),
    infectionsTotal: recoveredMetric(payload.roll.infections.total, 'infections.total', unknownPaths),
    oasisLateSoc: recoveredMetric(payload.roll.documentation.oasisLateSoc, 'documentation.oasisLateSoc', unknownPaths),
    pocMissingF2F: recoveredMetric(payload.roll.documentation.pocMissingF2F, 'documentation.pocMissingF2F', unknownPaths),
    pocUnsignedOrMissingSignature: recoveredMetric(
      payload.roll.documentation.pocUnsignedOrMissingSignature,
      'documentation.pocUnsignedOrMissingSignature',
      unknownPaths,
      ['documentation.pocUnsigned'],
    ),
    medReconciliationMismatch: recoveredMetric(payload.roll.documentation.medReconMismatch, 'documentation.medReconMismatch', unknownPaths),
    documentationDefectsTotal,
    chartsAudited,
    missedVisits: unknownMetric(),
    scheduledVisits: unknownMetric(),
    complaintsCount: unknownMetric(),
    activePipCount: recoveredMetric(payload.roll.highRisk.qapiRequiredCases, 'highRisk.qapiRequiredCases', unknownPaths),
    openCapRcaCount: recoveredMetric(payload.roll.incidents.openRca, 'incidents.openRca', unknownPaths),
    attendeesPresent: qapiMetricInput(payload.attendeesPresent.length),
    attendeesExpected: qapiMetricInput(payload.attendeesExpected.length),
    actionItemsCompleted: unknownMetric(),
    actionItemsDue: unknownMetric(),
    pipTriggerCount: recoveredMetric(payload.roll.highRisk.qapiRequiredCases, 'highRisk.qapiRequiredCases', unknownPaths),
    averageActionClosureDays: unknownMetric(),
  };
}

function buildSupplementalCharts(
  payload: QapiPacketRenderPayload,
  qapiModel: QapiPacketModelPayload | null,
): KpiSupplementalChartData[] {
  const unknownPaths = new Set(payload.unknownPaths);
  return [
    buildAdverseEventChart(payload, unknownPaths),
    buildInfectionChart(payload, unknownPaths),
    buildDocumentationChart(payload, unknownPaths),
    buildPipCapChart(payload, qapiModel, unknownPaths),
    buildComplaintsChart(),
  ];
}

function buildAdverseEventChart(
  payload: QapiPacketRenderPayload,
  unknownPaths: ReadonlySet<string>,
): KpiSupplementalChartData {
  const totalUnknown = hasUnknownPath(unknownPaths, 'incidents.total');
  const sourceData = Object.entries(payload.roll.incidents.byCategory).map(([category, count]) => ({
    label: labelFromKey(category),
    value: totalUnknown ? null : count,
    detail: 'Adverse event category',
    status: payload.roll.incidents.openRca > 0 ? `${String(payload.roll.incidents.openRca)} open RCA` : 'No open RCA recovered',
    validationStatus: totalUnknown ? UNKNOWN_NOT_RECOVERED : VALIDATED,
    source: 'QA-FM-026',
  } satisfies KpiSupplementalChartRow));

  return {
    chartId: 'qapi-adverse-events-by-category',
    kind: 'adverse-events-by-category',
    title: 'Adverse events by category',
    caption: 'Adverse events by category from the shared QAPI rollup object.',
    valueLabel: 'Events',
    sourceData: sourceData.length > 0 ? sourceData : [{
      label: 'Adverse event category',
      value: totalUnknown ? null : payload.roll.incidents.total,
      detail: totalUnknown ? UNKNOWN_SOURCE_NOT_RECOVERED : 'No category breakdown recovered',
      status: totalUnknown ? UNKNOWN_SOURCE_NOT_RECOVERED : 'Validated total only',
      validationStatus: totalUnknown ? UNKNOWN_NOT_RECOVERED : VALIDATED,
      source: 'QA-FM-026',
    }],
  };
}

function buildInfectionChart(
  payload: QapiPacketRenderPayload,
  unknownPaths: ReadonlySet<string>,
): KpiSupplementalChartData {
  return {
    chartId: 'qapi-infection-trends-classification',
    kind: 'infection-trends-classification',
    title: 'Infection trends + classification',
    caption: 'Infection trend classification from the shared QAPI rollup object.',
    valueLabel: 'Infections',
    sourceData: [
      supplementalRow('Healthcare-associated', payload.roll.infections.healthcareAssociated, 'infections.healthcareAssociated', unknownPaths, 'Infection classification', 'Healthcare-associated', 'QA-FM-027'),
      supplementalRow('Community-acquired', payload.roll.infections.communityAcquired, 'infections.communityAcquired', unknownPaths, 'Infection classification', 'Community-acquired', 'QA-FM-027'),
      supplementalRow('Unreported to state', payload.roll.infections.unreportedToState, 'infections.unreportedToState', unknownPaths, 'Reporting classification', 'Requires reporting review', 'QA-FM-027'),
    ],
  };
}

function buildDocumentationChart(
  payload: QapiPacketRenderPayload,
  unknownPaths: ReadonlySet<string>,
): KpiSupplementalChartData {
  return {
    chartId: 'qapi-documentation-deficiencies-by-type',
    kind: 'documentation-deficiencies-by-type',
    title: 'Documentation deficiencies by type',
    caption: 'Documentation deficiency counts from the shared QAPI rollup object.',
    valueLabel: 'Deficiencies',
    sourceData: [
      supplementalRow('OASIS SOC not completed ≤5 days', payload.roll.documentation.oasisLateSoc, 'documentation.oasisLateSoc', unknownPaths, 'Chart audit deficiency', 'Open for documentation review', 'QA-FM-025'),
      supplementalRow('POC missing face-to-face encounter', payload.roll.documentation.pocMissingF2F, 'documentation.pocMissingF2F', unknownPaths, 'Chart audit deficiency', 'Open for documentation review', 'QA-FM-025'),
      supplementalRow('POC unsigned / pending physician signature', payload.roll.documentation.pocUnsignedOrMissingSignature, 'documentation.pocUnsignedOrMissingSignature', unknownPaths, 'Chart audit deficiency', 'Open for documentation review', 'QA-FM-025', ['documentation.pocUnsigned']),
      supplementalRow('Homebound not justified', payload.roll.documentation.homeboundNotJustified, 'documentation.homeboundNotJustified', unknownPaths, 'Chart audit deficiency', 'Open for documentation review', 'QA-FM-025'),
      supplementalRow('Med-reconciliation count mismatch (OASIS↔POC)', payload.roll.documentation.medReconMismatch, 'documentation.medReconMismatch', unknownPaths, 'Chart audit deficiency', 'Open for documentation review', 'QA-FM-025'),
      supplementalRow('Pressure injury present, no wound orders', payload.roll.documentation.pressureInjuryNoWoundOrders, 'documentation.pressureInjuryNoWoundOrders', unknownPaths, 'Chart audit deficiency', 'Open for documentation review', 'QA-FM-025', ['documentation.pressureInjury']),
      supplementalRow('OASIS high mobility need, no therapy ordered', payload.roll.documentation.therapyNeedNoOrder, 'documentation.therapyNeedNoOrder', unknownPaths, 'Chart audit deficiency', 'Open for documentation review', 'QA-FM-025', ['documentation.therapyNeed']),
    ],
  };
}

function buildPipCapChart(
  payload: QapiPacketRenderPayload,
  qapiModel: QapiPacketModelPayload | null,
  unknownPaths: ReadonlySet<string>,
): KpiSupplementalChartData {
  const triggerRows = qapiModel?.triggerRegister ?? [];
  const sourceData: KpiSupplementalChartRow[] = triggerRows.length > 0
    ? [...countBy(triggerRows.map((row) => row.decisionState)).entries()].map(([stage, count]) => ({
      label: stage,
      value: count,
      detail: 'FR-012 workflow decision state',
      status: stage,
      validationStatus: VALIDATED,
      source: 'Trigger register',
    } satisfies KpiSupplementalChartRow))
    : [
      supplementalRow('PIP trigger candidates requiring QAPI review', payload.roll.highRisk.qapiRequiredCases, 'highRisk.qapiRequiredCases', unknownPaths, 'PIP/CAP stage', 'PENDING AUTHORIZED REVIEW', 'QA-FM-020'),
      supplementalRow('Immediate-action cases', payload.roll.highRisk.immediateActionCases, 'highRisk.immediateActionCases', unknownPaths, 'PIP/CAP stage', 'ESCALATED', 'QA-FM-020'),
      supplementalRow('Open CAP/RCA items', payload.roll.incidents.openRca, 'incidents.openRca', unknownPaths, 'PIP/CAP stage', 'ACTIVATED', 'QA-FM-026'),
      {
        label: 'Confidential personnel-review addendum',
        value: payload.ref.personnelActionReviewsOpened,
        detail: 'Restricted addendum reference count only',
        status: payload.addendumRequired ? 'PENDING AUTHORIZED REVIEW' : 'NOT TRIGGERED',
        validationStatus: VALIDATED,
        source: 'Restricted addendum reference',
      },
    ];

  return {
    chartId: 'qapi-pip-cap-status-by-stage',
    kind: 'pip-cap-status-by-stage',
    title: 'PIP/CAP status by stage',
    caption: 'PIP, CAP, RCA, and related workflow status by stage.',
    valueLabel: 'Items',
    sourceData,
  };
}

function buildComplaintsChart(): KpiSupplementalChartData {
  return {
    chartId: 'qapi-complaints-category-resolution',
    kind: 'complaints-by-category-resolution',
    title: 'Complaints by category + resolution',
    caption: 'Complaint category and resolution counts from the shared QAPI data object.',
    valueLabel: 'Complaints',
    sourceData: [{
      label: 'Complaint category',
      value: null,
      detail: UNKNOWN_SOURCE_NOT_RECOVERED,
      status: 'Resolution status UNKNOWN',
      validationStatus: UNKNOWN_NOT_RECOVERED,
      source: 'complaints.complaintsCount',
    }],
  };
}

function buildRollingHistoryChart(
  dashboard: KpiDashboardModel,
  currentPeriodLabel: string,
): KpiHistoryChartData {
  const chartWithPrior = dashboard.charts.find((chart) =>
    chart.sharedData.some((datum) => datum.priorValue !== null),
  ) ?? dashboard.charts[0];
  const sourceData = chartWithPrior
    ? chartWithPrior.sharedData.slice(0, 4).flatMap((datum): KpiHistoryPoint[] => {
      const target = parseTargetNumber(datum.target);
      return [
        {
          indicator: datum.title,
          period: 'Prior period',
          value: datum.priorValue,
          target,
          validationStatus: datum.priorValue === null ? UNKNOWN_NOT_RECOVERED : datum.validationStatus,
          source: datum.source.join('; '),
        },
        {
          indicator: datum.title,
          period: currentPeriodLabel,
          value: datum.currentValue,
          target,
          validationStatus: datum.validationStatus,
          source: datum.source.join('; '),
        },
      ];
    })
    : [];

  return {
    chartId: 'qapi-rolling-kpi-history',
    title: chartWithPrior
      ? `Up to four prior quarters / rolling monthly history (${chartWithPrior.unit})`
      : 'Up to four prior quarters / rolling monthly history',
    caption: 'Rolling KPI history from prior and current shared KPI data points.',
    unit: chartWithPrior?.unit ?? UNKNOWN_SOURCE_NOT_RECOVERED,
    sourceData,
  };
}

function supplementalRow(
  label: string,
  value: number,
  path: string,
  unknownPaths: ReadonlySet<string>,
  detail: string,
  status: string,
  source: string,
  aliases: readonly string[] = [],
): KpiSupplementalChartRow {
  const unknown = hasUnknownPath(unknownPaths, path, aliases);
  return {
    label,
    value: unknown || !Number.isFinite(value) ? null : value,
    detail,
    status: unknown ? UNKNOWN_SOURCE_NOT_RECOVERED : status,
    validationStatus: unknown || !Number.isFinite(value) ? UNKNOWN_NOT_RECOVERED : VALIDATED,
    source,
  };
}

function recoveredMetric(
  value: number,
  path: string,
  unknownPaths: ReadonlySet<string>,
  aliases: readonly string[] = [],
): KpiInputMetric {
  if (hasUnknownPath(unknownPaths, path, aliases) || !Number.isFinite(value)) {
    return unknownMetric();
  }
  return qapiMetricInput(value);
}

function unknownMetric(): KpiInputMetric {
  return qapiMetricInput(null, 'none');
}

function parseTargetNumber(target: string): number | null {
  const match = /-?\d+(?:,\d{3})*(?:\.\d+)?/.exec(target);
  if (!match) return null;
  const value = Number(match[0].replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
}

function countBy(values: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

function labelFromKey(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
