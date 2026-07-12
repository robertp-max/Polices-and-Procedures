import type { ParsedFile } from '@/policy/evidence/intake/fileParsing';
import {
  deriveQapiBundle,
  extractEscalationItems,
  extractQapiTextAggregates,
  extractRecordSegments,
} from '@/policy/brad/intake/adapters/qapiIntakeAdapter';
import type {
  QapiDerivedBundle,
  QapiDerivedMetric,
  QapiTextAggregates,
  RecordSegment,
} from '@/policy/brad/intake/adapters/qapiIntakeAdapter';
import type {
  PacketClassification,
  PacketFinding,
  PacketModel,
  PacketModelModuleInstance,
  QapiActionSnapshot,
  QapiFindingSnapshot,
  QapiPipSnapshot,
  QapiTrendSnapshot,
  QapiWorkflowSnapshot,
  TrendComparisonOutput,
  WorkflowTriggerEvaluation,
} from '@/policy/packets/contracts';
import type { QapiPacketOptions, QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';
import type { QapiRollup } from '@/policy/qapi/qapiExtraction';
import type { AddendumReference } from '@/policy/qapi/personnelActionAddendum';
import { SYNTHETIC_UAT_WATERMARK } from '@/policy/packets/render/chrome';
import {
  assertAnalysisBeforeForms,
  getModule,
  QAPI_FULL_MODULE_ORDER,
} from '@/policy/packets/registries/moduleRegistry';
import {
  calculateKpis,
  qapiMetricInput,
} from '@/policy/packets/analysis/kpi/calculateKpis';
import type {
  KpiInputMetric,
  KpiInputRecord,
  PriorKpiSnapshot,
} from '@/policy/packets/analysis/kpi/calculateKpis';
import {
  QAPI_KPI_DEFINITION_VERSION,
  QAPI_KPI_DEFINITIONS,
} from '@/policy/packets/analysis/kpi/kpiDefinitions';
import type {
  KpiDefinition,
  QapiKpiMeasurementCadence,
} from '@/policy/packets/analysis/kpi/kpiDefinitions';
import { buildKpiDashboardModel } from '@/policy/packets/analysis/kpi/dashboardModel';
import type { KpiDashboardModel } from '@/policy/packets/analysis/kpi/dashboardModel';
import { createPacketFinding } from '@/policy/packets/analysis/triggers/findingModel';
import { evaluateWorkflowTrigger } from '@/policy/packets/analysis/triggers/evaluateTriggers';
import type {
  TriggerActivationPreconditions,
  WorkflowTriggerInput,
} from '@/policy/packets/analysis/triggers/evaluateTriggers';
import {
  buildTriggerRegisterRows,
} from '@/policy/packets/analysis/triggers/triggerRegister';
import type { TriggerRegisterRow } from '@/policy/packets/analysis/triggers/triggerRegister';
import { computeTrends } from '@/policy/packets/analysis/trends/computeTrends';
import {
  createSourceFormUtilizationReport,
} from '@/policy/packets/sources/sourceUtilization';
import type { SourceFormUtilizationReport } from '@/policy/packets/sources/sourceUtilization';
import { segmentParsedSource } from '@/policy/packets/sources/segmentSources';
import type { SegmentationResult } from '@/policy/packets/sources/segmentSources';
import {
  SOURCE_VALIDATION_STATUS,
  UNKNOWN_NOT_RECOVERED_TEXT,
  validationStatusForQapiMetric,
} from '@/policy/packets/sources/sourceValidation';
import type { SourceDataValidationStatus } from '@/policy/packets/sources/sourceValidation';

import {
  composeExecutiveAnalysis,
} from './executiveAnalysis';
import type { ExecutiveAnalysisModel } from './executiveAnalysis';
import { buildPersonnelAggregation } from './personnelAggregation';
import type { PersonnelAggregationModel } from './personnelAggregation';

export interface BuildQapiPacketModelInput {
  parsed: ParsedFile;
  eventDateISO: string;
  targetDatasetId?: string;
  targetAgency?: string;
  targetPeriod?: string;
  sourceId?: string;
  cadence?: QapiKpiMeasurementCadence;
  priorTrendSnapshot?: QapiTrendSnapshot | null;
  priorKpisByDefinitionId?: Readonly<Record<string, PriorKpiSnapshot | undefined>>;
  priorKpisByIndicatorId?: Readonly<Record<string, PriorKpiSnapshot | undefined>>;
  packetVersion?: number;
  packetHash?: string;
  generatedAt?: string;
  options?: QapiPacketOptions;
}

export interface QapiRecoveredValue<T extends number | string = number | string> {
  value: T | null;
  display: T | typeof UNKNOWN_NOT_RECOVERED_TEXT;
  validationStatus: SourceDataValidationStatus;
  source: string;
}

export interface QapiPacketSourceCounts {
  activeCensus: QapiRecoveredValue<number>;
  episodesTotal: QapiRecoveredValue<number>;
  hospitalizations: QapiRecoveredValue<number>;
  edVisitsWithoutHospitalization: QapiRecoveredValue<number>;
  committeeAttendancePresent: QapiRecoveredValue<number>;
  committeeAttendanceTotal: QapiRecoveredValue<number>;
  governingBodyEscalationItems: QapiRecoveredValue<number>;
  pipTriggerScenarios: QapiRecoveredValue<number>;
  personnelReviewTriggers: QapiRecoveredValue<number>;
}

export interface QapiPacketModelPayload {
  cadence: QapiKpiMeasurementCadence;
  segmentation: SegmentationResult;
  bundle: QapiDerivedBundle;
  sourceCounts: QapiPacketSourceCounts;
  sourceUtilization: SourceFormUtilizationReport;
  kpiDefinitions: readonly KpiDefinition[];
  kpiDashboard: KpiDashboardModel;
  findings: readonly PacketFinding[];
  workflowEvaluations: readonly WorkflowTriggerEvaluation[];
  triggerRegister: readonly TriggerRegisterRow[];
  trendSnapshot: QapiTrendSnapshot;
  trendComparison: TrendComparisonOutput;
  executiveAnalysis: ExecutiveAnalysisModel;
  personnelAggregation: PersonnelAggregationModel;
  selectedSource: {
    datasetId: string | null;
    agency: string | null;
    period: string | null;
    periodStart: string | null;
    periodEnd: string | null;
    eventDate: string | null;
    sourceClassification: 'production' | 'synthetic' | null;
  };
  excludedSources: ReadonlyArray<{
    segmentId: string;
    datasetId: string | null;
    reason: string;
    detail: string;
  }>;
}

interface UnknownPathCollector {
  paths: string[];
}

interface ResolvedQapiPeriod {
  periodKey: string;
  label: string;
  start: string;
  end: string;
  eventDate: string;
  dataThroughDate: string;
}

interface PipTriggerRow {
  id: string;
  topic: string;
  numerator: number | null;
  denominator: number | null;
  observedValue: number | null;
  threshold: number | null;
  thresholdOperator: '>=' | '<=' | '>' | '<' | '=' | null;
}

const DEFAULT_POLICY_IDS = ['QA-PP-001'] as const;
const DEFAULT_ATTENDEES = [
  'Director of Nursing (Chair)',
  'Clinical Manager',
  'Compliance Officer',
  'Medical Director',
  'Administrator',
  'QA Coordinator',
] as const;
const METRIC_SCHEMA_VERSION = 'QAPI-PACKET-METRICS-v1' as const;

export function buildQapiPacketModel(input: BuildQapiPacketModelInput): PacketModel {
  const cadence = input.cadence ?? 'quarterly';
  const segmentation = segmentParsedSource({
    parsed: input.parsed,
    eventDateISO: input.eventDateISO,
    targetDatasetId: input.targetDatasetId,
    targetAgency: input.targetAgency,
    targetPeriod: input.targetPeriod,
    sourceId: input.sourceId,
  });
  const selectedText = selectedSourceText(segmentation);
  const bundle = deriveQapiBundle(segmentation.parsed, input.eventDateISO, input.targetPeriod);
  const aggregates = extractQapiTextAggregates(selectedText);
  const period = resolvePeriod(input, segmentation, aggregates);
  const sourceCounts = buildSourceCounts(bundle, aggregates, selectedText);
  const sourceClassification = segmentation.selectedSegment?.sourceClassification
    ?? (selectedTextIsSynthetic(selectedText) ? 'synthetic' : 'production');
  const syntheticWatermark = input.options?.syntheticWatermark
    ?? (sourceClassification === 'synthetic' ? SYNTHETIC_UAT_WATERMARK : null);
  const packetId = `QAPI-${cadence.toUpperCase()}-${period.label.replace(/\s+/g, '-')}`;
  const sourceUtilization = buildSourceUtilization(segmentation, bundle, sourceCounts, packetId);
  const kpiDefinitions = QAPI_KPI_DEFINITIONS.filter(
    (definition) => definition.measurementPeriod.cadence === cadence,
  );
  const kpiInputs = buildKpiInputs(bundle, aggregates, sourceCounts);
  const calculatedKpis = calculateKpis(kpiDefinitions, kpiInputs, {
    priorByDefinitionId: input.priorKpisByDefinitionId,
    priorByIndicatorId: input.priorKpisByIndicatorId,
    sourceLabel: segmentation.selectedSegment?.datasetId ?? input.sourceId ?? undefined,
  });
  const kpiDashboard = buildKpiDashboardModel(calculatedKpis, {
    dashboardId: `qapi-${cadence}-kpi-dashboard`,
    title: `${period.label} QAPI KPI dashboard`,
  });
  const pipRows = extractPipTriggerRows(selectedText);
  const personnelSegments = extractRecordSegments(selectedText, 'DT');
  const findings = buildFindings(packetId, pipRows, personnelSegments, sourceCounts);
  const workflowEvaluations = buildWorkflowEvaluations(packetId, period.periodKey, pipRows);
  const triggerRegister = buildTriggerRegisterRows(findings, workflowEvaluations, []);
  const personnelAggregation = buildPersonnelAggregation({
    period: period.periodKey,
    findings,
    evaluations: [],
    recordSegments: personnelSegments,
  });
  const actions = buildActionSnapshots(selectedText, findings);
  const trendSnapshot = buildTrendSnapshot({
    input,
    packetId,
    period,
    sourceClassification,
    metrics: [...kpiDashboard.metricSnapshots],
    findings,
    workflowEvaluations,
    actions,
  });
  const trendComparison = computeTrends(trendSnapshot, input.priorTrendSnapshot);
  const executiveAnalysis = composeExecutiveAnalysis({
    sourcesUploaded: [
      segmentation.selectedSegment?.datasetId
        ?? input.sourceId
        ?? 'Uploaded QAPI source',
    ],
    acceptedReportingPeriod: `${period.start} through ${period.end} (${period.label})`,
    includedAndExcludedRecords:
      `Included dataset ${segmentation.selectedSegment?.datasetId ?? UNKNOWN_NOT_RECOVERED_TEXT}; excluded ${String(segmentation.excludedSegments.length)} non-matching segment(s).`,
    formsLogsUsed: sourceUtilization.sourcesAndFormsUsed.map((item) => item.formName ?? item.formId),
    missingExpectedForms: sourceUtilization.expectedButMissing.map((item) => item.formId),
    unvalidatedData: calculatedKpis
      .filter((kpi) => kpi.validationStatus !== 'Validated')
      .map((kpi) => `${kpi.title}: ${kpi.validationStatus}`),
    majorTrends: trendComparison.missingPriorBanner
      ? [trendComparison.missingPriorBanner]
      : trendComparison.metrics.map((metric) => `${metric.label}: ${metric.direction}`),
    measuresAboveAndBelowThreshold: calculatedKpis.map((kpi) =>
      `${kpi.title}: ${kpi.status} (${kpi.displayValue})`,
    ),
    qualityIssues: findings.map((finding) => `${finding.category}: ${finding.description}`),
    immediateActions: actions.map((action) => action.description),
    continuedMonitoring: trendComparison.carryForwardActionStatuses.map((action) => action.description),
    governingBodyDecisions: extractEscalationItems(selectedText).map((item) => item.text),
    priorPeriodActionStatus: trendComparison.missingPriorBanner
      ? [trendComparison.missingPriorBanner]
      : trendComparison.carryForwardActionStatuses.map((action) => action.status ?? UNKNOWN_NOT_RECOVERED_TEXT),
    triggeredWorkflows: triggerRegister.map((row) => `${row.finding}: ${row.decisionState}`),
    determinations: [
      `${String(pipRows.length)} PIP trigger scenario(s) evaluated; no automatic PIP creation asserted.`,
      `${String(personnelAggregation.summary.thresholdMetCount)} personnel-review trigger(s) aggregated for restricted addendum reference.`,
    ],
  });
  const unknownCollector: UnknownPathCollector = { paths: [] };
  const roll = buildLegacyRollup(period, sourceCounts, bundle, aggregates, unknownCollector);
  const addendumReference = toLegacyAddendumReference(personnelAggregation);
  const payload = buildPayload({
    input,
    packetId,
    roll,
    addendumReference,
    syntheticWatermark,
    sourceAgency: segmentation.selectedSegment?.agency ?? input.targetAgency ?? null,
    datasetId: segmentation.selectedSegment?.datasetId ?? input.targetDatasetId ?? null,
    unknownPaths: unknownCollector.paths,
    analytical: {
      cadence,
      segmentation,
      bundle,
      sourceCounts,
      sourceUtilization,
      kpiDefinitions,
      kpiDashboard,
      findings,
      workflowEvaluations,
      triggerRegister,
      trendSnapshot,
      trendComparison,
      executiveAnalysis,
      personnelAggregation,
      selectedSource: {
        datasetId: segmentation.selectedSegment?.datasetId ?? null,
        agency: segmentation.selectedSegment?.agency ?? null,
        period: segmentation.selectedSegment?.period ?? null,
        periodStart: segmentation.selectedSegment?.periodStart ?? null,
        periodEnd: segmentation.selectedSegment?.periodEnd ?? null,
        eventDate: segmentation.selectedSegment?.eventDate ?? null,
        sourceClassification,
      },
      excludedSources: segmentation.excludedSegments.map((segment) => ({
        segmentId: segment.segmentId,
        datasetId: segment.datasetId,
        reason: segment.reason,
        detail: segment.detail,
      })),
    },
  });
  const classification: PacketClassification = syntheticWatermark ? 'synthetic-uat' : 'internal';
  const modules = buildQapiModules(packetId, payload);
  assertAnalysisBeforeForms(modules.map((module) => module.moduleId));

  return {
    identity: {
      packetInstanceId: packetId,
      packetId,
      packetVersion: input.packetVersion ?? 1,
      contentHash: input.packetHash ?? null,
      agencyId: segmentation.selectedSegment?.agency ?? input.targetAgency ?? 'UNKNOWN — NOT RECOVERED',
      eventFamilyId: 'qapi_meeting',
      eventInstanceId: input.options?.eventId ?? `${packetId}:event`,
      workflowId: input.options?.workflowId ?? 'QA-WF-03',
      workflowInstanceId: `${packetId}:workflow`,
      packetTemplateId: cadence === 'monthly' ? 'qapi-monthly' : 'qapi-quarterly',
      archetypeId: 'analytical-report',
      subtype: cadence,
      reportingPeriodStart: period.start,
      reportingPeriodEnd: period.end,
      dataThroughDate: period.dataThroughDate,
      status: 'DRAFT_GENERATED',
    },
    renderingProfileId: 'qapi-analytical',
    classification,
    handlingNotice: syntheticWatermark ? SYNTHETIC_UAT_WATERMARK : null,
    modules,
    pagePlan: null,
  };
}

function selectedSourceText(segmentation: SegmentationResult): string {
  return segmentation.selectedSegment?.text
    ?? segmentation.parsed.records.map((record) => record.text ?? '').join('\n');
}

function selectedTextIsSynthetic(text: string): boolean {
  return /\bsynthetic\b|\bmock\b|not for production|no real phi/i.test(text);
}

function resolvePeriod(
  input: BuildQapiPacketModelInput,
  segmentation: SegmentationResult,
  aggregates: QapiTextAggregates,
): ResolvedQapiPeriod {
  const periodKey = segmentation.selectedSegment?.period
    ?? input.targetPeriod
    ?? aggregates.reviewQuarter
    ?? 'UNKNOWN';
  const bounds = quarterBounds(periodKey);
  const label = segmentation.selectedSegment?.periodLabel ?? periodLabel(periodKey);
  return {
    periodKey,
    label,
    start: segmentation.selectedSegment?.periodStart ?? bounds.start,
    end: segmentation.selectedSegment?.periodEnd ?? bounds.end,
    eventDate: segmentation.selectedSegment?.eventDate ?? input.eventDateISO,
    dataThroughDate: segmentation.selectedSegment?.periodEnd ?? bounds.end,
  };
}

function quarterBounds(periodKey: string): { start: string; end: string } {
  const match = /^(20\d{2})-Q([1-4])$/.exec(periodKey);
  if (!match) return { start: 'UNKNOWN — NOT RECOVERED', end: 'UNKNOWN — NOT RECOVERED' };
  const year = match[1]!;
  const quarter = match[2]!;
  if (quarter === '1') return { start: `${year}-01-01`, end: `${year}-03-31` };
  if (quarter === '2') return { start: `${year}-04-01`, end: `${year}-06-30` };
  if (quarter === '3') return { start: `${year}-07-01`, end: `${year}-09-30` };
  return { start: `${year}-10-01`, end: `${year}-12-31` };
}

function periodLabel(periodKey: string): string {
  const match = /^(20\d{2})-Q([1-4])$/.exec(periodKey);
  return match ? `Q${match[2]} ${match[1]}` : periodKey;
}

function buildSourceCounts(
  bundle: QapiDerivedBundle,
  aggregates: QapiTextAggregates,
  text: string,
): QapiPacketSourceCounts {
  const quorumTotal = aggregates.quorum?.total ?? null;
  const edWithoutHospitalization = countEdWithoutHospitalization(text);
  const governingBodyEscalations = positiveCountOrNull(extractEscalationItems(text).length);
  const pipTriggerRows = positiveCountOrNull(extractPipTriggerRows(text).length);
  const personnelReviewSegments = positiveCountOrNull(extractRecordSegments(text, 'DT').length);
  return {
    activeCensus: recoveredNumber(
      numberFromMetric(bundle.censusPopulation.activeCensus) ?? aggregates.activeCensus?.value ?? null,
      validationStatusForQapiMetric(bundle.censusPopulation.activeCensus),
      'censusPopulation.activeCensus',
    ),
    episodesTotal: recoveredNumber(
      aggregates.episodesTotal?.value ?? numberFromMetric(bundle.censusPopulation.activeCensus),
      aggregates.episodesTotal ? SOURCE_VALIDATION_STATUS.validated : SOURCE_VALIDATION_STATUS.unknownNotRecovered,
      'textAggregate.episodesTotal',
    ),
    hospitalizations: recoveredNumber(
      numberFromMetric(bundle.adverseEvents.hospitalizationsTotal) ?? aggregates.hospitalizations?.value ?? null,
      validationStatusForQapiMetric(bundle.adverseEvents.hospitalizationsTotal),
      'adverseEvents.hospitalizationsTotal',
    ),
    edVisitsWithoutHospitalization: recoveredNumber(
      edWithoutHospitalization,
      edWithoutHospitalization === null
        ? SOURCE_VALIDATION_STATUS.unknownNotRecovered
        : SOURCE_VALIDATION_STATUS.validated,
      'AE rows marked ED without hospitalization',
    ),
    committeeAttendancePresent: recoveredNumber(
      aggregates.quorum?.present ?? aggregates.attendeePresentCount?.value ?? null,
      aggregates.quorum ? SOURCE_VALIDATION_STATUS.validated : SOURCE_VALIDATION_STATUS.unknownNotRecovered,
      'meetingDetails.quorum',
    ),
    committeeAttendanceTotal: recoveredNumber(
      quorumTotal,
      aggregates.quorum ? SOURCE_VALIDATION_STATUS.validated : SOURCE_VALIDATION_STATUS.unknownNotRecovered,
      'meetingDetails.quorum',
    ),
    governingBodyEscalationItems: recoveredNumber(
      governingBodyEscalations,
      governingBodyEscalations === null
        ? SOURCE_VALIDATION_STATUS.unknownNotRecovered
        : SOURCE_VALIDATION_STATUS.validated,
      'GBE rows',
    ),
    pipTriggerScenarios: recoveredNumber(
      aggregates.pipTriggerCount?.value ?? pipTriggerRows,
      aggregates.pipTriggerCount ? SOURCE_VALIDATION_STATUS.validated : SOURCE_VALIDATION_STATUS.validatedWithLimitation,
      'PIP-T rows',
    ),
    personnelReviewTriggers: recoveredNumber(
      numberFromMetric(bundle.highRiskRollup.clinicianDisciplinaryActionCount)
        ?? aggregates.disciplinaryCount?.value
        ?? personnelReviewSegments,
      validationStatusForQapiMetric(bundle.highRiskRollup.clinicianDisciplinaryActionCount),
      'DT rows',
    ),
  };
}

function recoveredNumber(
  value: number | null,
  validationStatus: SourceDataValidationStatus,
  source: string,
): QapiRecoveredValue<number> {
  return {
    value,
    display: value ?? UNKNOWN_NOT_RECOVERED_TEXT,
    validationStatus,
    source,
  };
}

const ED_WITHOUT_HOSPITALIZATION_MARKER =
  /\b(?:ed-visit-no-hospitalization|ed[_\s-]?visit[_\s-]?no[_\s-]?hospitalization|ed[_\s-]?without[_\s-]?hospitalization|ed visits? without hospitalization)\b/i;
const AE_RECORD_ID = /\bAE-Q[1-4]-\d{3,5}\b/i;
const ED_RECORD_ID = /(?<![A-Z0-9])ED(-Q[1-4])?-(\d{2,5})(?!\d)/g;

function countEdWithoutHospitalization(text: string): number | null {
  const ids = new Set<string>();
  for (const segment of extractRecordSegments(text, 'AE')) {
    if (ED_WITHOUT_HOSPITALIZATION_MARKER.test(segment.text)) {
      ids.add(segment.id);
    }
  }
  for (const line of text.split(/\r?\n/)) {
    if (!ED_WITHOUT_HOSPITALIZATION_MARKER.test(line)) continue;
    const recordId = AE_RECORD_ID.exec(line)?.[0];
    if (recordId) ids.add(recordId.toUpperCase());
  }
  for (const match of text.matchAll(ED_RECORD_ID)) {
    const numericId = match[2];
    if (numericId) ids.add(`ED${match[1] ?? ''}-${numericId}`);
  }
  return positiveCountOrNull(ids.size);
}

function positiveCountOrNull(count: number): number | null {
  return count > 0 ? count : null;
}

function buildSourceUtilization(
  segmentation: SegmentationResult,
  bundle: QapiDerivedBundle,
  sourceCounts: QapiPacketSourceCounts,
  packetId: string,
): SourceFormUtilizationReport {
  const sourceId = segmentation.selectedSegment?.datasetId ?? packetId;
  return createSourceFormUtilizationReport({
    sourcesAndFormsUsed: [
      {
        formId: 'QA-FM-020',
        formName: 'QAPI Data Dashboard',
        sourceId,
        sourceName: segmentation.selectedSegment?.periodLabel ?? null,
        purpose: 'KPI dashboard and QAPI source reconciliation',
        recordsReviewed: sourceCounts.episodesTotal.value,
        findings: [],
        validationStatus: segmentation.validationStatus,
        attachment: null,
      },
      {
        formId: 'QA-FM-026',
        formName: 'Incident / Adverse-Event Summary',
        sourceId,
        sourceName: segmentation.selectedSegment?.periodLabel ?? null,
        purpose: 'Hospitalization and adverse-event analysis',
        recordsReviewed: sourceCounts.hospitalizations.value,
        findings: [],
        validationStatus: validationStatusForQapiMetric(bundle.adverseEvents.hospitalizationsTotal),
        attachment: null,
      },
      {
        formId: 'QA-FM-025',
        formName: 'Chart Audit & Documentation Integrity',
        sourceId,
        sourceName: segmentation.selectedSegment?.periodLabel ?? null,
        purpose: 'Documentation audit findings',
        recordsReviewed: null,
        findings: [],
        validationStatus: SOURCE_VALIDATION_STATUS.provisionalHumanReviewRequired,
        attachment: null,
      },
    ],
    expectedButMissing: sourceCounts.edVisitsWithoutHospitalization.value === null
      ? [{
          requirementId: 'ed-without-hospitalization-aggregate',
          formId: 'QA-FM-026',
          sourceId,
          purpose: 'ED visits without hospitalization aggregate',
          expectedAgency: segmentation.selectedSegment?.agency ?? null,
          expectedPeriod: segmentation.selectedSegment?.period ?? null,
          recordsExpected: null,
        }]
      : [],
  });
}

function buildKpiInputs(
  bundle: QapiDerivedBundle,
  aggregates: QapiTextAggregates,
  sourceCounts: QapiPacketSourceCounts,
): KpiInputRecord {
  const inputs: Record<string, KpiInputMetric | undefined> = {};
  setNumberInput(inputs, 'patientsOrEpisodesInScope', sourceCounts.episodesTotal);
  setNumberInput(inputs, 'activeCensus', sourceCounts.activeCensus);
  setMetricInput(inputs, 'hospitalizationsTotal', bundle.adverseEvents.hospitalizationsTotal);
  setNumberInput(inputs, 'edUseTotal', sourceCounts.edVisitsWithoutHospitalization);
  setNumber(inputs, 'adverseEventsTotal', aggregates.adverseEventsCount?.value ?? null, 'textAggregate.adverseEventsCount');
  setMetricInput(inputs, 'infectionsTotal', bundle.adverseEvents.infectionsTotal);
  setMetricInput(inputs, 'oasisLateSoc', bundle.chartAuditDocumentationIntegrity.oasisLateSoc);
  setMetricInput(inputs, 'pocMissingF2F', bundle.chartAuditDocumentationIntegrity.pocMissingF2F);
  setMetricInput(inputs, 'pocUnsignedOrMissingSignature', bundle.chartAuditDocumentationIntegrity.pocUnsignedOrMissingSignature);
  setMetricInput(inputs, 'medReconciliationMismatch', bundle.chartAuditDocumentationIntegrity.medReconciliationMismatch);
  setNumber(inputs, 'documentationDefectsTotal', documentationDefectsTotal(bundle), 'chartAuditDocumentationIntegrity');
  setNumber(inputs, 'chartsAudited', sourceCounts.activeCensus.value, 'censusPopulation.activeCensus');
  setNumber(inputs, 'missedVisits', aggregates.missedVisits?.value ?? null, 'textAggregate.missedVisits');
  setNumber(inputs, 'complaintsCount', aggregates.complaintsCount?.value ?? null, 'textAggregate.complaintsCount');
  setNumber(inputs, 'activePipCount', aggregates.pipNames.length || null, 'textAggregate.pipNames');
  setNumber(inputs, 'openCapRcaCount', aggregates.capCount?.value ?? null, 'textAggregate.capCount');
  setNumberInput(inputs, 'attendeesPresent', sourceCounts.committeeAttendancePresent);
  setNumberInput(inputs, 'attendeesExpected', sourceCounts.committeeAttendanceTotal);
  setNumberInput(inputs, 'pipTriggerCount', sourceCounts.pipTriggerScenarios);
  return inputs;
}

function setMetricInput(
  inputs: Record<string, KpiInputMetric | undefined>,
  key: string,
  metric: QapiDerivedMetric,
): void {
  if (metric.value === null) return;
  inputs[key] = qapiMetricInput(metric.value, metric.confidence, metric.sourceQuotes);
}

function setNumberInput(
  inputs: Record<string, KpiInputMetric | undefined>,
  key: string,
  value: QapiRecoveredValue<number>,
): void {
  setNumber(inputs, key, value.value, value.source);
}

function setNumber(
  inputs: Record<string, KpiInputMetric | undefined>,
  key: string,
  value: number | null,
  source: string,
): void {
  if (value === null) return;
  inputs[key] = qapiMetricInput(value, 'high', [source]);
}

function documentationDefectsTotal(bundle: QapiDerivedBundle): number | null {
  const values = [
    numberFromMetric(bundle.chartAuditDocumentationIntegrity.oasisLateSoc),
    numberFromMetric(bundle.chartAuditDocumentationIntegrity.pocMissingF2F),
    numberFromMetric(bundle.chartAuditDocumentationIntegrity.pocUnsignedOrMissingSignature),
    numberFromMetric(bundle.chartAuditDocumentationIntegrity.medReconciliationMismatch),
  ];
  const recoveredValues = values.filter((value): value is number => value !== null);
  return recoveredValues.length === values.length
    ? recoveredValues.reduce<number>((sum, value) => sum + value, 0)
    : null;
}

function numberFromMetric(metric: QapiDerivedMetric): number | null {
  return typeof metric.value === 'number' && Number.isFinite(metric.value) ? metric.value : null;
}

function extractPipTriggerRows(text: string): PipTriggerRow[] {
  return text
    .split(/\r?\n/)
    .filter((line) => /PIP-T-[A-Za-z0-9-]+/.test(line))
    .map(parsePipTriggerRow);
}

function parsePipTriggerRow(line: string): PipTriggerRow {
  const id = /PIP-T-[A-Za-z0-9-]+/.exec(line)?.[0] ?? `PIP-T-${line.length}`;
  const parts = line.split('|').map((part) => part.trim());
  const measureMatch = /num\s+(\d+(?:\.\d+)?)\s*\/\s*den\s+(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)%/i.exec(line);
  const thresholdMatch = /threshold\s*([≥<=]+)\s*(\d+(?:\.\d+)?)/i.exec(line);
  return {
    id,
    topic: parts[1] ?? 'PIP trigger scenario',
    numerator: numberFromMatch(measureMatch?.[1]),
    denominator: numberFromMatch(measureMatch?.[2]),
    observedValue: numberFromMatch(measureMatch?.[3]),
    threshold: numberFromMatch(thresholdMatch?.[2]),
    thresholdOperator: normalizeOperator(thresholdMatch?.[1] ?? null),
  };
}

function numberFromMatch(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeOperator(value: string | null): PipTriggerRow['thresholdOperator'] {
  if (value === '≥' || value === '>=') return '>=';
  if (value === '≤' || value === '<=') return '<=';
  if (value === '>') return '>';
  if (value === '<') return '<';
  if (value === '=') return '=';
  return null;
}

function buildFindings(
  packetId: string,
  pipRows: readonly PipTriggerRow[],
  personnelSegments: readonly RecordSegment[],
  sourceCounts: QapiPacketSourceCounts,
): PacketFinding[] {
  const findings = pipRows.map((row) =>
    createPacketFinding({
      findingId: row.id,
      category: 'PIP trigger scenario',
      description: `${row.topic} breached the source threshold and requires authorized QAPI review.`,
      evidence: [`${row.numerator ?? UNKNOWN_NOT_RECOVERED_TEXT}/${row.denominator ?? UNKNOWN_NOT_RECOVERED_TEXT} observed against threshold ${row.threshold ?? UNKNOWN_NOT_RECOVERED_TEXT}`],
      sourceRecordIds: [row.id],
      sourceFormIds: ['QA-FM-020'],
      materiality: 'Threshold breach',
      severity: 'Requires committee review',
      scope: 'QAPI measurement period',
      recurrence: null,
      currentState: 'Evaluation open',
      priorPeriodRelationship: null,
      riskType: 'Performance improvement',
      recommendedDecision: null,
      requiredHumanReviewer: 'QAPI Committee',
      relatedWorkflowTriggerEvaluationIds: [`${packetId}:${row.id}:workflow-evaluation`],
      attachmentReferences: [],
    }),
  );

  if (personnelSegments.length > 0) {
    findings.push(createPacketFinding({
      findingId: `${packetId}:personnel-review-aggregate`,
      category: 'Personnel-review aggregate',
      description: `${String(sourceCounts.personnelReviewTriggers.value ?? personnelSegments.length)} personnel-review trigger(s) require restricted addendum reference.`,
      evidence: ['Aggregate DT trigger count only; details remain restricted.'],
      sourceRecordIds: [],
      sourceFormIds: ['QA-FM-020'],
      materiality: 'Restricted personnel handling required',
      severity: 'Confidential',
      scope: 'Aggregate count only',
      recurrence: null,
      currentState: 'Open — personnel review pending',
      priorPeriodRelationship: null,
      riskType: 'Personnel confidentiality',
      recommendedDecision: null,
      requiredHumanReviewer: 'HR/Compliance reviewer',
      relatedWorkflowTriggerEvaluationIds: [],
      attachmentReferences: ['Confidential personnel-review addendum reference'],
    }));
  }

  return findings;
}

function buildWorkflowEvaluations(
  packetId: string,
  reportingPeriod: string,
  pipRows: readonly PipTriggerRow[],
): WorkflowTriggerEvaluation[] {
  return pipRows.map((row) =>
    evaluateWorkflowTrigger({
      evaluationId: `${packetId}:${row.id}:workflow-evaluation`,
      packetId,
      parentEventId: `${packetId}:event`,
      reportingPeriod,
      findingId: row.id,
      sourceRecordIds: [row.id],
      sourceFormIds: ['QA-FM-020'],
      sourceWorkflowIds: ['QA-WF-03'],
      triggerRuleId: 'qapi-pip-threshold-breach',
      triggerType: 'conditional',
      observedValue: row.observedValue,
      numerator: row.numerator,
      denominator: row.denominator,
      threshold: row.threshold,
      thresholdOperator: row.thresholdOperator,
      recurrenceWindow: reportingPeriod,
      canonicalWorkflowId: 'QA-WF-03',
      candidateWorkflowId: 'QA-WF-03',
      candidateConfidence: 'high',
      triggerMet: true,
      preconditions: pendingReviewPreconditions(),
      ownerRole: 'QAPI Coordinator',
      assignedUserId: null,
      approverRoles: ['QAPI Committee'],
      dueDate: null,
      requiredFormIds: ['QA-FM-005'],
      dependencyWorkflowIds: [],
      blockerIds: [],
      existingWorkflowInstanceId: null,
      carryForwardWorkflowInstanceId: null,
      newWorkflowInstanceId: null,
      reviewedBy: null,
      reviewedAt: null,
      overrideReason: null,
      determination: null,
      pipEvaluationFactors: null,
    } satisfies WorkflowTriggerInput),
  );
}

function pendingReviewPreconditions(): TriggerActivationPreconditions {
  return {
    agencyValidated: true,
    periodValidated: true,
    evidenceSupportsFinding: true,
    requiredValuesAvailable: true,
    recurrenceConditionsAvailable: true,
    recurrenceSatisfied: true,
    sourceConflictsInvalidateTrigger: false,
    requiredHumanConfirmationExists: false,
    activatingUserHasAuthority: false,
  };
}

function buildActionSnapshots(
  text: string,
  findings: readonly PacketFinding[],
): QapiActionSnapshot[] {
  return extractEscalationItems(text).map((item) => ({
    actionId: item.id,
    description: item.text,
    ownerRole: 'Governing Body',
    ownerUserId: null,
    dueDate: null,
    status: 'Requested',
    carryForwardStatus: null,
    relatedFindingIds: findings.map((finding) => finding.findingId),
    relatedWorkflowIds: ['QA-WF-03'],
  }));
}

function buildTrendSnapshot(input: {
  input: BuildQapiPacketModelInput;
  packetId: string;
  period: ResolvedQapiPeriod;
  sourceClassification: 'production' | 'synthetic';
  metrics: QapiTrendSnapshot['metrics'];
  findings: readonly PacketFinding[];
  workflowEvaluations: readonly WorkflowTriggerEvaluation[];
  actions: readonly QapiActionSnapshot[];
}): QapiTrendSnapshot {
  return {
    packetInstanceId: input.packetId,
    packetVersion: input.input.packetVersion ?? 1,
    packetHash: input.input.packetHash ?? 'unsealed-draft',
    agencyId: input.input.targetAgency ?? 'UNKNOWN — NOT RECOVERED',
    eventFamilyId: 'qapi_meeting',
    eventInstanceId: input.input.options?.eventId ?? `${input.packetId}:event`,
    workflowId: input.input.options?.workflowId ?? 'QA-WF-03',
    workflowInstanceId: `${input.packetId}:workflow`,
    cadence: input.input.cadence ?? 'quarterly',
    reportingPeriodStart: input.period.start,
    reportingPeriodEnd: input.period.end,
    dataThroughDate: input.period.dataThroughDate,
    packetStatus: 'certified',
    sourceClassification: input.sourceClassification,
    kpiDefinitionVersion: QAPI_KPI_DEFINITION_VERSION,
    metricSchemaVersion: METRIC_SCHEMA_VERSION,
    metrics: [...input.metrics],
    findings: input.findings.map(toFindingSnapshot),
    workflows: input.workflowEvaluations.map(toWorkflowSnapshot),
    pips: [] satisfies QapiPipSnapshot[],
    actionItems: [...input.actions],
    publishedArtifactUrl: '',
    publishedFolderUrl: '',
    generatedAt: input.input.generatedAt ?? new Date(0).toISOString(),
  };
}

function toFindingSnapshot(finding: PacketFinding): QapiFindingSnapshot {
  return {
    findingId: finding.findingId,
    category: finding.category,
    description: finding.description,
    severity: finding.severity,
    materiality: finding.materiality,
    currentState: finding.currentState,
    priorPeriodRelationship: finding.priorPeriodRelationship,
    recurrence: finding.recurrence,
    riskType: finding.riskType,
    relatedWorkflowIds: finding.relatedWorkflowTriggerEvaluationIds,
    relatedMetricIds: [],
    reopened: null,
  };
}

function toWorkflowSnapshot(evaluation: WorkflowTriggerEvaluation): QapiWorkflowSnapshot {
  return {
    workflowId: evaluation.canonicalWorkflowId ?? evaluation.evaluationId,
    workflowInstanceId: evaluation.newWorkflowInstanceId ?? evaluation.existingWorkflowInstanceId,
    title: evaluation.canonicalWorkflowTitle,
    decisionState: evaluation.decisionState,
    status: evaluation.lifecycleStatus,
    carryForward: evaluation.decisionState === 'CONTINUED FROM PRIOR PERIOD',
    dueDate: evaluation.dueDate,
    ownerRole: evaluation.ownerRole,
  };
}

function buildLegacyRollup(
  period: ResolvedQapiPeriod,
  sourceCounts: QapiPacketSourceCounts,
  bundle: QapiDerivedBundle,
  aggregates: QapiTextAggregates,
  unknownCollector: UnknownPathCollector,
): QapiRollup {
  const activeCensus = legacyNumber(sourceCounts.activeCensus, 'census.activeCensus', unknownCollector);
  const episodes = legacyNumber(sourceCounts.episodesTotal, 'census.patientsInScope', unknownCollector);
  const hospitalizations = legacyNumber(sourceCounts.hospitalizations, 'incidents.total', unknownCollector);
  const infectionTotal = legacyMetricNumber(bundle.adverseEvents.infectionsTotal, 'infections.total', unknownCollector);
  const criticalUnreported = legacyMetricNumber(bundle.adverseEvents.criticalLabEventsUnreported, 'labs.criticalUnreported', unknownCollector);
  const immediateActionCases = legacyMetricNumber(bundle.highRiskRollup.immediateActionCases, 'highRisk.immediateActionCases', unknownCollector);
  const qapiRequiredCases = legacyMetricNumber(bundle.censusPopulation.qapiRequiredCount, 'highRisk.qapiRequiredCases', unknownCollector);

  return {
    window: {
      eventDate: period.eventDate,
      quarterStart: period.start,
      quarterEnd: period.end,
      dataThroughDate: period.dataThroughDate,
      packetType: 'final',
      title: `${period.label} QAPI Review (Final)`,
      quarterLabel: period.label,
    },
    census: {
      patientsInScope: episodes,
      activeCensus,
      discharged: legacyMetricNumber(bundle.censusPopulation.dischargedCount, 'census.discharged', unknownCollector),
      recertDue: legacyMetricNumber(bundle.censusPopulation.recertificationCount, 'census.recertDue', unknownCollector),
      highAcuity: legacyMetricNumber(bundle.censusPopulation.highAcuityCount, 'census.highAcuity', unknownCollector),
      uniquePatients: activeCensus,
      duplicateClientIds: [],
    },
    highRisk: {
      immediateActionCases,
      qapiRequiredCases,
      topFlags: parseTopFlags(bundle.highRiskRollup.topFlags),
      systemicThemes: [],
    },
    incidents: {
      total: aggregates.adverseEventsCount?.value ?? hospitalizations,
      byCategory: {
        hospitalization: hospitalizations,
        ed_without_hospitalization: sourceCounts.edVisitsWithoutHospitalization.value ?? 0,
      },
      openRca: aggregates.capCount?.value ?? 0,
      unreported: 0,
      excludedFutureDated: 0,
    },
    infections: {
      total: infectionTotal,
      healthcareAssociated: legacyMetricNumber(bundle.infectionControl.healthcareAssociated, 'infections.healthcareAssociated', unknownCollector),
      communityAcquired: legacyMetricNumber(bundle.infectionControl.communityAcquired, 'infections.communityAcquired', unknownCollector),
      unreportedToState: legacyMetricNumber(bundle.infectionControl.unreportedToState, 'infections.unreportedToState', unknownCollector),
      excludedFutureDated: 0,
    },
    labs: {
      criticalTotal: criticalUnreported,
      criticalUnreported,
    },
    documentation: {
      oasisLateSoc: legacyMetricNumber(bundle.chartAuditDocumentationIntegrity.oasisLateSoc, 'documentation.oasisLateSoc', unknownCollector),
      pocMissingF2F: legacyMetricNumber(bundle.chartAuditDocumentationIntegrity.pocMissingF2F, 'documentation.pocMissingF2F', unknownCollector),
      pocUnsignedOrMissingSignature: legacyMetricNumber(bundle.chartAuditDocumentationIntegrity.pocUnsignedOrMissingSignature, 'documentation.pocUnsignedOrMissingSignature', unknownCollector),
      homeboundNotJustified: 0,
      medReconMismatch: legacyMetricNumber(bundle.chartAuditDocumentationIntegrity.medReconciliationMismatch, 'documentation.medReconMismatch', unknownCollector),
      pressureInjuryNoWoundOrders: 0,
      therapyNeedNoOrder: 0,
    },
    exceptions: bundle.sourceMode === 'none'
      ? [{
          pass: false,
          severity: 'high',
          path: 'source',
          reason: bundle.overallNote,
          remediation: 'Resolve source conflict before lock.',
        }]
      : [],
  };
}

function legacyMetricNumber(
  metric: QapiDerivedMetric,
  path: string,
  unknownCollector: UnknownPathCollector,
): number {
  const value = numberFromMetric(metric);
  if (value === null) {
    unknownCollector.paths.push(path);
    return 0;
  }
  return value;
}

function legacyNumber(
  value: QapiRecoveredValue<number>,
  path: string,
  unknownCollector: UnknownPathCollector,
): number {
  if (value.value === null) {
    unknownCollector.paths.push(path);
    return 0;
  }
  return value.value;
}

function parseTopFlags(metric: QapiDerivedMetric): Array<{ flag: string; count: number }> {
  const values = Array.isArray(metric.value) ? metric.value : [];
  return values.flatMap((entry) => {
    const match = /^(.+?)\s*\((\d+)\)$/.exec(String(entry));
    if (!match) return [];
    return [{ flag: match[1]!, count: Number(match[2]) }];
  });
}

function toLegacyAddendumReference(
  personnelAggregation: PersonnelAggregationModel,
): AddendumReference {
  const countByCategory = Object.fromEntries(
    personnelAggregation.rows.map((row) => [row.triggerCategory, row.count]),
  );
  return {
    addendumId: personnelAggregation.addendumReference.id,
    hash: personnelAggregation.addendumReference.sha,
    personnelActionReviewsOpened: personnelAggregation.summary.thresholdMetCount,
    countByCategory,
    statusSummary: personnelAggregation.summary.thresholdMetCount > 0
      ? `${String(personnelAggregation.summary.thresholdMetCount)} personnel-action review(s) opened across ${String(personnelAggregation.rows.length)} categories; details sealed.`
      : 'No personnel-action reviews this period.',
    confidentialityStatement: 'Confidential personnel details retained in restricted HR/Compliance addendum.',
  };
}

function buildPayload(input: {
  input: BuildQapiPacketModelInput;
  packetId: string;
  roll: QapiRollup;
  addendumReference: AddendumReference;
  syntheticWatermark: string | null;
  sourceAgency: string | null;
  datasetId: string | null;
  unknownPaths: readonly string[];
  analytical: QapiPacketModelPayload;
}): QapiPacketRenderPayload {
  const expected = input.input.options?.attendeesExpected ?? [...DEFAULT_ATTENDEES];
  const present = input.input.options?.attendeesPresent ?? expected;
  return {
    roll: input.roll,
    ref: input.addendumReference,
    packetId: input.packetId,
    eventId: input.input.options?.eventId ?? `${input.packetId}:event`,
    workflowId: input.input.options?.workflowId ?? 'QA-WF-03',
    preparedBy: input.input.options?.preparedBy ?? 'UNKNOWN — NOT RECOVERED',
    reviewer: input.input.options?.reviewer ?? 'UNKNOWN — NOT RECOVERED',
    chair: input.input.options?.chair ?? 'UNKNOWN — NOT RECOVERED',
    recorder: input.input.options?.recorder ?? 'UNKNOWN — NOT RECOVERED',
    policyIds: input.input.options?.policyIds ?? [...DEFAULT_POLICY_IDS],
    approvers: input.input.options?.approvers ?? [],
    quorumOverride: input.input.options?.quorumOverride ?? null,
    attendanceNote: input.input.options?.attendanceNote ?? null,
    derivedNotice: input.input.options?.derivedNotice ?? input.analytical.bundle.overallNote,
    unknownPaths: [...new Set(input.unknownPaths)],
    syntheticWatermark: input.syntheticWatermark,
    sourceAgency: input.sourceAgency,
    datasetId: input.datasetId,
    addendumRequired: input.addendumReference.personnelActionReviewsOpened > 0,
    attendeesExpected: expected,
    attendeesPresent: present,
    lock: {
      pass: false,
      statusText: 'NOT LOCKABLE — draft packet-model build pending serialized orchestration gates',
      findings: [],
    },
    qapiModel: input.analytical,
  };
}

function buildQapiModules(
  packetId: string,
  payload: QapiPacketRenderPayload,
): PacketModelModuleInstance[] {
  return QAPI_FULL_MODULE_ORDER.map((moduleId, index) => {
    const descriptor = getModule(moduleId);
    return {
      moduleInstanceId: `${packetId}:${moduleId}`,
      moduleId,
      title: descriptor.title,
      order: index + 1,
      status: 'complete',
      payload,
      contentHash: null,
    };
  });
}
