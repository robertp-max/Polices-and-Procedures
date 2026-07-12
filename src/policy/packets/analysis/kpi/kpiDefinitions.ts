import type {
  AppendixDDataValidationStatus,
  KpisSidecarPayload,
  ThresholdOperator,
} from '@/policy/packets/contracts';

export const QAPI_KPI_DEFINITION_VERSION = 'FR-008-QAPI-KPI-v1' as const;

export const QAPI_KPI_MEASUREMENT_CADENCES = ['monthly', 'quarterly'] as const;

export type QapiKpiMeasurementCadence = Extract<
  KpisSidecarPayload['cadence'],
  (typeof QAPI_KPI_MEASUREMENT_CADENCES)[number]
>;

export type KpiUnit = 'count' | 'percentage' | 'rate' | 'days' | 'currency';

export type KpiThresholdDirection =
  | 'higher-is-better'
  | 'lower-is-better'
  | 'range';

export type KpiCalculationKind = 'count' | 'direct' | 'ratio';

export interface KpiTarget {
  value: number;
  display: string;
  operator: ThresholdOperator | null;
}

export interface KpiThreshold {
  direction: KpiThresholdDirection;
  label: string;
  operator: ThresholdOperator | null;
  value?: number;
  min?: number;
  max?: number;
}

export interface KpiCalculationSpec {
  kind: KpiCalculationKind;
  valueField?: string;
  numeratorField?: string;
  numeratorFields?: readonly string[];
  denominatorField?: string;
  reportedTotalField?: string;
  scale?: number;
}

export interface KpiMeasurementPeriod {
  cadence: QapiKpiMeasurementCadence;
  label: string;
}

export interface KpiDefinition {
  definitionId: string;
  indicatorId: string;
  title: string;
  cohort: string;
  numerator: string;
  denominator: string | null;
  exclusions: readonly string[];
  measurementPeriod: KpiMeasurementPeriod;
  unit: KpiUnit;
  formula: string;
  target: KpiTarget;
  threshold: KpiThreshold;
  benchmark: string;
  sourceRecords: readonly string[];
  definitionVersion: string;
  validationStatus: AppendixDDataValidationStatus;
  calculation: KpiCalculationSpec;
}

type BaseKpiDefinition = Omit<KpiDefinition, 'definitionId' | 'measurementPeriod'>;

const VALIDATED = 'Validated' satisfies AppendixDDataValidationStatus;

const BASE_QAPI_KPI_DEFINITIONS = [
  {
    indicatorId: 'qapi-hospitalization-rate',
    title: 'Acute-care hospitalization rate',
    cohort: 'All active home health patients during the measurement period',
    numerator: 'Unplanned acute-care hospitalizations',
    denominator: 'Active census at period close',
    exclusions: [
      'Planned or elective admissions documented before start of care',
      'Patients outside the reporting period',
    ],
    unit: 'percentage',
    formula: '(hospitalizationsTotal / activeCensus) * 100',
    target: { value: 8, display: '≤ 8.0%', operator: '<=' },
    threshold: {
      direction: 'lower-is-better',
      label: '≤ 8.0%',
      operator: '<=',
      value: 8,
    },
    benchmark:
      'Agency QAPI threshold; compare to prior period and CMS Home Health Compare when available',
    sourceRecords: [
      'adverseEvents.hospitalizationsTotal',
      'censusPopulation.activeCensus',
    ],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'ratio',
      numeratorField: 'hospitalizationsTotal',
      denominatorField: 'activeCensus',
      scale: 100,
    },
  },
  {
    indicatorId: 'qapi-infection-rate',
    title: 'Infection event rate',
    cohort: 'All active home health patients during the measurement period',
    numerator: 'Confirmed infection events',
    denominator: 'Active census at period close',
    exclusions: [
      'Community events ruled unrelated after infection-control review',
      'Duplicate infection records for the same episode',
    ],
    unit: 'percentage',
    formula: '(infectionsTotal / activeCensus) * 100',
    target: { value: 2, display: '≤ 2.0%', operator: '<=' },
    threshold: {
      direction: 'lower-is-better',
      label: '≤ 2.0%',
      operator: '<=',
      value: 2,
    },
    benchmark: 'Agency infection-control threshold',
    sourceRecords: [
      'adverseEvents.infectionsTotal',
      'censusPopulation.activeCensus',
    ],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'ratio',
      numeratorField: 'infectionsTotal',
      denominatorField: 'activeCensus',
      scale: 100,
    },
  },
  {
    indicatorId: 'qapi-documentation-defect-rate',
    title: 'Documentation defect rate',
    cohort: 'Charts included in the period chart-audit sample',
    numerator:
      'Late SOC OASIS, late or missing F2F, missing signature, and medication-reconciliation mismatch defects',
    denominator: 'Charts audited',
    exclusions: [
      'Charts excluded from the approved audit sample',
      'Duplicate defects already counted under the same chart and defect type',
    ],
    unit: 'percentage',
    formula:
      '((oasisLateSoc + pocMissingF2F + pocUnsignedOrMissingSignature + medReconciliationMismatch) / chartsAudited) * 100',
    target: { value: 5, display: '≤ 5.0%', operator: '<=' },
    threshold: {
      direction: 'lower-is-better',
      label: '≤ 5.0%',
      operator: '<=',
      value: 5,
    },
    benchmark: 'Agency chart-audit threshold',
    sourceRecords: [
      'chartAuditDocumentationIntegrity.oasisLateSoc',
      'chartAuditDocumentationIntegrity.pocMissingF2F',
      'chartAuditDocumentationIntegrity.pocUnsignedOrMissingSignature',
      'chartAuditDocumentationIntegrity.medReconciliationMismatch',
      'chartAuditDocumentationIntegrity.documentationDefectsTotal',
      'chartAuditDocumentationIntegrity.chartsAudited',
    ],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'ratio',
      numeratorFields: [
        'oasisLateSoc',
        'pocMissingF2F',
        'pocUnsignedOrMissingSignature',
        'medReconciliationMismatch',
      ],
      denominatorField: 'chartsAudited',
      reportedTotalField: 'documentationDefectsTotal',
      scale: 100,
    },
  },
  {
    indicatorId: 'qapi-complaint-rate',
    title: 'Complaint rate per 100 active patients',
    cohort: 'All active home health patients during the measurement period',
    numerator: 'Complaints and grievances opened during the measurement period',
    denominator: 'Active census at period close',
    exclusions: [
      'Duplicate complaints for the same event',
      'Complaints opened outside the reporting period',
    ],
    unit: 'rate',
    formula: '(complaintsCount / activeCensus) * 100',
    target: { value: 3, display: '≤ 3 per 100 patients', operator: '<=' },
    threshold: {
      direction: 'lower-is-better',
      label: '≤ 3 per 100 patients',
      operator: '<=',
      value: 3,
    },
    benchmark: 'Agency complaint-trend threshold',
    sourceRecords: [
      'complaints.complaintsCount',
      'censusPopulation.activeCensus',
    ],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'ratio',
      numeratorField: 'complaintsCount',
      denominatorField: 'activeCensus',
      scale: 100,
    },
  },
  {
    indicatorId: 'qapi-committee-attendance-rate',
    title: 'QAPI committee attendance rate',
    cohort: 'Required QAPI committee attendees for the measurement-period meeting',
    numerator: 'Required attendees present',
    denominator: 'Required attendees expected',
    exclusions: [
      'Excused non-voting observers',
      'Invitees not designated as required committee members',
    ],
    unit: 'percentage',
    formula: '(attendeesPresent / attendeesExpected) * 100',
    target: { value: 90, display: '90% to 100%', operator: null },
    threshold: {
      direction: 'range',
      label: '90% to 100%',
      operator: null,
      min: 90,
      max: 100,
    },
    benchmark: 'Agency quorum and committee-participation standard',
    sourceRecords: [
      'meetingDetails.attendeesPresent',
      'meetingDetails.attendeesExpected',
    ],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'ratio',
      numeratorField: 'attendeesPresent',
      denominatorField: 'attendeesExpected',
      scale: 100,
    },
  },
  {
    indicatorId: 'qapi-action-completion-rate',
    title: 'QAPI action completion rate',
    cohort: 'QAPI action items due by the end of the measurement period',
    numerator: 'Due action items completed',
    denominator: 'Action items due',
    exclusions: [
      'Actions not yet due',
      'Actions voided by committee decision before due date',
    ],
    unit: 'percentage',
    formula: '(actionItemsCompleted / actionItemsDue) * 100',
    target: { value: 90, display: '≥ 90.0%', operator: '>=' },
    threshold: {
      direction: 'higher-is-better',
      label: '≥ 90.0%',
      operator: '>=',
      value: 90,
    },
    benchmark: 'Agency QAPI action-accountability threshold',
    sourceRecords: [
      'actionItems.actionItemsCompleted',
      'actionItems.actionItemsDue',
    ],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'ratio',
      numeratorField: 'actionItemsCompleted',
      denominatorField: 'actionItemsDue',
      scale: 100,
    },
  },
  {
    indicatorId: 'qapi-pip-trigger-count',
    title: 'PIP trigger count',
    cohort: 'PIP trigger candidates identified during the measurement period',
    numerator: 'PIP trigger candidates requiring QAPI review',
    denominator: null,
    exclusions: [
      'Duplicate trigger rows for the same source issue',
      'Triggers rescinded before committee review with documented rationale',
    ],
    unit: 'count',
    formula: 'pipTriggerCount',
    target: { value: 0, display: '≤ 0 triggers', operator: '<=' },
    threshold: {
      direction: 'lower-is-better',
      label: '≤ 0 triggers',
      operator: '<=',
      value: 0,
    },
    benchmark: 'No untriaged PIP triggers at packet lock',
    sourceRecords: ['pipCorrectiveAction.pipTriggerCount'],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'count',
      valueField: 'pipTriggerCount',
    },
  },
  {
    indicatorId: 'qapi-action-closure-days',
    title: 'Average QAPI action closure time',
    cohort: 'QAPI corrective actions closed during the measurement period',
    numerator: 'Average calendar days from action assignment to closure',
    denominator: null,
    exclusions: [
      'Actions still open at period close',
      'Actions voided by committee decision before work started',
    ],
    unit: 'days',
    formula: 'averageActionClosureDays',
    target: { value: 14, display: '≤ 14 days', operator: '<=' },
    threshold: {
      direction: 'lower-is-better',
      label: '≤ 14 days',
      operator: '<=',
      value: 14,
    },
    benchmark: 'Agency corrective-action timeliness threshold',
    sourceRecords: ['actionItems.averageActionClosureDays'],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'direct',
      valueField: 'averageActionClosureDays',
    },
  },
] as const satisfies readonly BaseKpiDefinition[];

const toMeasurementPeriod = (
  cadence: QapiKpiMeasurementCadence,
): KpiMeasurementPeriod => ({
  cadence,
  label: cadence === 'monthly' ? 'Monthly reporting period' : 'Quarterly reporting period',
});

const withCadence = (
  definition: BaseKpiDefinition,
  cadence: QapiKpiMeasurementCadence,
): KpiDefinition => ({
  ...definition,
  definitionId: `${definition.indicatorId}:${cadence}`,
  measurementPeriod: toMeasurementPeriod(cadence),
});

export const QAPI_KPI_DEFINITIONS = BASE_QAPI_KPI_DEFINITIONS.flatMap((definition) =>
  QAPI_KPI_MEASUREMENT_CADENCES.map((cadence) => withCadence(definition, cadence)),
) satisfies readonly KpiDefinition[];

export const MINIMUM_QAPI_KPI_INDICATOR_IDS = BASE_QAPI_KPI_DEFINITIONS.map(
  (definition) => definition.indicatorId,
);

export function getQapiKpiDefinition(
  indicatorId: string,
  cadence: QapiKpiMeasurementCadence,
): KpiDefinition {
  const definition = QAPI_KPI_DEFINITIONS.find(
    (candidate) =>
      candidate.indicatorId === indicatorId &&
      candidate.measurementPeriod.cadence === cadence,
  );
  if (!definition) {
    throw new Error(`Unknown QAPI KPI definition: ${indicatorId} (${cadence})`);
  }
  return definition;
}
