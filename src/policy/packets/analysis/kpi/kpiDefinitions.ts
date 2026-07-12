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

export type KpiCalculationKind = 'count' | 'direct' | 'ratio' | 'complementRatio';

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
    indicatorId: 'qapi-patients-episodes-in-scope',
    title: 'Patients or episodes in scope',
    cohort: 'Patients or episodes accepted into the measurement-period QAPI review scope',
    numerator: 'Patients or episodes in measurement scope',
    denominator: null,
    exclusions: [
      'Patients or episodes outside the accepted reporting period',
      'Duplicate source rows for the same patient or episode',
    ],
    unit: 'count',
    formula: 'patientsOrEpisodesInScope',
    target: { value: 1, display: '>= 1 in scope', operator: '>=' },
    threshold: {
      direction: 'higher-is-better',
      label: '>= 1 in scope',
      operator: '>=',
      value: 1,
    },
    benchmark: 'QAPI packet completeness threshold',
    sourceRecords: ['censusPopulation.patientsOrEpisodesInScope'],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'count',
      valueField: 'patientsOrEpisodesInScope',
    },
  },
  {
    indicatorId: 'qapi-active-census',
    title: 'Active census',
    cohort: 'All active home health patients at period close',
    numerator: 'Active patients at period close',
    denominator: null,
    exclusions: [
      'Discharged patients before period close',
      'Patients outside the accepted reporting period',
    ],
    unit: 'count',
    formula: 'activeCensus',
    target: { value: 1, display: '>= 1 active patient', operator: '>=' },
    threshold: {
      direction: 'higher-is-better',
      label: '>= 1 active patient',
      operator: '>=',
      value: 1,
    },
    benchmark: 'QAPI packet completeness threshold',
    sourceRecords: ['censusPopulation.activeCensus'],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'count',
      valueField: 'activeCensus',
    },
  },
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
    indicatorId: 'qapi-ed-use-rate',
    title: 'ED use rate per 100 active patients',
    cohort: 'All active home health patients during the measurement period',
    numerator: 'Emergency-department visits during the measurement period',
    denominator: 'Active census at period close',
    exclusions: [
      'Scheduled outpatient visits not classified as ED use',
      'Duplicate ED records for the same encounter',
    ],
    unit: 'rate',
    formula: '(edUseTotal / activeCensus) * 100',
    target: { value: 5, display: '<= 5 per 100 patients', operator: '<=' },
    threshold: {
      direction: 'lower-is-better',
      label: '<= 5 per 100 patients',
      operator: '<=',
      value: 5,
    },
    benchmark: 'Agency ED-utilization threshold',
    sourceRecords: [
      'adverseEvents.edUseTotal',
      'censusPopulation.activeCensus',
    ],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'ratio',
      numeratorField: 'edUseTotal',
      denominatorField: 'activeCensus',
      scale: 100,
    },
  },
  {
    indicatorId: 'qapi-adverse-event-rate',
    title: 'Adverse event rate per 100 active patients',
    cohort: 'All active home health patients during the measurement period',
    numerator: 'Adverse events opened during the measurement period',
    denominator: 'Active census at period close',
    exclusions: [
      'Duplicate adverse-event rows for the same event',
      'Events outside the accepted reporting period',
    ],
    unit: 'rate',
    formula: '(adverseEventsTotal / activeCensus) * 100',
    target: { value: 5, display: '<= 5 per 100 patients', operator: '<=' },
    threshold: {
      direction: 'lower-is-better',
      label: '<= 5 per 100 patients',
      operator: '<=',
      value: 5,
    },
    benchmark: 'Agency adverse-event trend threshold',
    sourceRecords: [
      'adverseEvents.adverseEventsTotal',
      'censusPopulation.activeCensus',
    ],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'ratio',
      numeratorField: 'adverseEventsTotal',
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
    indicatorId: 'qapi-documentation-audit-compliance',
    title: 'Documentation-audit compliance',
    cohort: 'Charts included in the period chart-audit sample',
    numerator: 'Audited charts without documentation defects',
    denominator: 'Charts audited',
    exclusions: [
      'Charts excluded from the approved audit sample',
      'Duplicate defects already counted under the same chart and defect type',
    ],
    unit: 'percentage',
    formula:
      '((chartsAudited - (oasisLateSoc + pocMissingF2F + pocUnsignedOrMissingSignature + medReconciliationMismatch)) / chartsAudited) * 100',
    target: { value: 95, display: '>= 95.0%', operator: '>=' },
    threshold: {
      direction: 'higher-is-better',
      label: '>= 95.0%',
      operator: '>=',
      value: 95,
    },
    benchmark: 'Agency chart-audit compliance threshold',
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
      kind: 'complementRatio',
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
    indicatorId: 'qapi-medication-reconciliation-compliance',
    title: 'Medication-reconciliation compliance',
    cohort: 'Charts included in the period chart-audit sample',
    numerator: 'Audited charts without medication-reconciliation mismatch defects',
    denominator: 'Charts audited',
    exclusions: [
      'Charts excluded from the approved audit sample',
      'Medication discrepancies verified as duplicate rows',
    ],
    unit: 'percentage',
    formula: '((chartsAudited - medReconciliationMismatch) / chartsAudited) * 100',
    target: { value: 95, display: '>= 95.0%', operator: '>=' },
    threshold: {
      direction: 'higher-is-better',
      label: '>= 95.0%',
      operator: '>=',
      value: 95,
    },
    benchmark: 'Agency medication-reconciliation compliance threshold',
    sourceRecords: [
      'chartAuditDocumentationIntegrity.medReconciliationMismatch',
      'chartAuditDocumentationIntegrity.chartsAudited',
    ],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'complementRatio',
      numeratorFields: ['medReconciliationMismatch'],
      denominatorField: 'chartsAudited',
      scale: 100,
    },
  },
  {
    indicatorId: 'qapi-missed-visit-compliance',
    title: 'Missed-visit compliance',
    cohort: 'Scheduled home health visits during the measurement period',
    numerator: 'Scheduled visits completed or otherwise not missed',
    denominator: 'Scheduled visits',
    exclusions: [
      'Visits canceled by documented patient request',
      'Visits outside the accepted reporting period',
    ],
    unit: 'percentage',
    formula: '((scheduledVisits - missedVisits) / scheduledVisits) * 100',
    target: { value: 95, display: '>= 95.0%', operator: '>=' },
    threshold: {
      direction: 'higher-is-better',
      label: '>= 95.0%',
      operator: '>=',
      value: 95,
    },
    benchmark: 'Agency missed-visit compliance threshold',
    sourceRecords: [
      'visitUtilization.missedVisits',
      'visitUtilization.scheduledVisits',
    ],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'complementRatio',
      numeratorFields: ['missedVisits'],
      denominatorField: 'scheduledVisits',
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
    indicatorId: 'qapi-active-pip-count',
    title: 'Active PIPs',
    cohort: 'Performance-improvement projects active during the measurement period',
    numerator: 'Active performance-improvement projects',
    denominator: null,
    exclusions: [
      'Closed PIPs with documented governing-body acceptance before period start',
      'Draft PIP ideas not opened for QAPI tracking',
    ],
    unit: 'count',
    formula: 'activePipCount',
    target: { value: 0, display: '<= 0 overdue/untriaged active PIPs', operator: '<=' },
    threshold: {
      direction: 'lower-is-better',
      label: '<= 0 overdue/untriaged active PIPs',
      operator: '<=',
      value: 0,
    },
    benchmark: 'No overdue or untriaged active PIPs at packet lock',
    sourceRecords: ['pipCorrectiveAction.activePipCount'],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'count',
      valueField: 'activePipCount',
    },
  },
  {
    indicatorId: 'qapi-open-cap-rca-count',
    title: 'Open CAPs or RCAs',
    cohort: 'Corrective-action plans and root-cause analyses open at packet lock',
    numerator: 'Open CAP or RCA items',
    denominator: null,
    exclusions: [
      'CAPs or RCAs closed with documented effectiveness review before packet lock',
      'Duplicate CAP/RCA rows tied to the same source issue',
    ],
    unit: 'count',
    formula: 'openCapRcaCount',
    target: { value: 0, display: '<= 0 overdue open CAPs/RCAs', operator: '<=' },
    threshold: {
      direction: 'lower-is-better',
      label: '<= 0 overdue open CAPs/RCAs',
      operator: '<=',
      value: 0,
    },
    benchmark: 'No overdue open CAPs or RCAs at packet lock',
    sourceRecords: ['pipCorrectiveAction.openCapRcaCount'],
    definitionVersion: QAPI_KPI_DEFINITION_VERSION,
    validationStatus: VALIDATED,
    calculation: {
      kind: 'count',
      valueField: 'openCapRcaCount',
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

export const MINIMUM_QAPI_KPI_INDICATOR_IDS = [
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
