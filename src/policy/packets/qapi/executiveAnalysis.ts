import { UNKNOWN_NOT_RECOVERED_TEXT } from '@/policy/packets/sources/sourceValidation';

export const FR010_EXECUTIVE_ANALYSIS_ELEMENTS = [
  'Sources uploaded',
  'Accepted reporting period',
  'Included and excluded records',
  'Forms/logs used',
  'Missing expected forms',
  'Unvalidated data',
  'Major trends',
  'Measures above and below threshold',
  'Adverse events, infections, complaints, audit deficiencies, and compliance issues',
  'Immediate actions',
  'Continued monitoring',
  'Governing Body decisions',
  'Prior-period action status',
  'Triggered workflows',
  'PIP/CAPA/RCA/personnel-review determinations',
] as const;

export type Fr010ExecutiveAnalysisElement =
  (typeof FR010_EXECUTIVE_ANALYSIS_ELEMENTS)[number];

export interface ExecutiveAnalysisElementSummary {
  element: Fr010ExecutiveAnalysisElement;
  text: string;
  status: 'known' | 'unknown';
}

export interface ExecutiveAnalysisModel {
  elements: readonly ExecutiveAnalysisElementSummary[];
  prose: string;
  unknownElementCount: number;
}

export interface ExecutiveAnalysisInput {
  sourcesUploaded?: readonly string[];
  acceptedReportingPeriod?: string | null;
  includedAndExcludedRecords?: string | null;
  formsLogsUsed?: readonly string[];
  missingExpectedForms?: readonly string[];
  unvalidatedData?: readonly string[];
  majorTrends?: readonly string[];
  measuresAboveAndBelowThreshold?: readonly string[];
  qualityIssues?: readonly string[];
  immediateActions?: readonly string[];
  continuedMonitoring?: readonly string[];
  governingBodyDecisions?: readonly string[];
  priorPeriodActionStatus?: readonly string[];
  triggeredWorkflows?: readonly string[];
  determinations?: readonly string[];
}

type AnalysisValue = readonly string[] | string | null | undefined;

export function composeExecutiveAnalysis(input: ExecutiveAnalysisInput): ExecutiveAnalysisModel {
  const values: Record<Fr010ExecutiveAnalysisElement, AnalysisValue> = {
    'Sources uploaded': input.sourcesUploaded,
    'Accepted reporting period': input.acceptedReportingPeriod,
    'Included and excluded records': input.includedAndExcludedRecords,
    'Forms/logs used': input.formsLogsUsed,
    'Missing expected forms': input.missingExpectedForms,
    'Unvalidated data': input.unvalidatedData,
    'Major trends': input.majorTrends,
    'Measures above and below threshold': input.measuresAboveAndBelowThreshold,
    'Adverse events, infections, complaints, audit deficiencies, and compliance issues':
      input.qualityIssues,
    'Immediate actions': input.immediateActions,
    'Continued monitoring': input.continuedMonitoring,
    'Governing Body decisions': input.governingBodyDecisions,
    'Prior-period action status': input.priorPeriodActionStatus,
    'Triggered workflows': input.triggeredWorkflows,
    'PIP/CAPA/RCA/personnel-review determinations': input.determinations,
  };

  const elements = FR010_EXECUTIVE_ANALYSIS_ELEMENTS.map((element) =>
    summarizeElement(element, values[element]),
  );

  return {
    elements,
    prose: elements.map((element) => `${element.element}: ${element.text}`).join('\n\n'),
    unknownElementCount: elements.filter((element) => element.status === 'unknown').length,
  };
}

function summarizeElement(
  element: Fr010ExecutiveAnalysisElement,
  value: AnalysisValue,
): ExecutiveAnalysisElementSummary {
  const text = formatAnalysisValue(value);
  return {
    element,
    text,
    status: text === UNKNOWN_NOT_RECOVERED_TEXT ? 'unknown' : 'known',
  };
}

function formatAnalysisValue(value: AnalysisValue): string {
  if (Array.isArray(value)) {
    const cleaned = value.map((item) => item.trim()).filter((item) => item.length > 0);
    return cleaned.length > 0 ? cleaned.join('; ') : UNKNOWN_NOT_RECOVERED_TEXT;
  }

  if (typeof value === 'string') {
    const cleaned = value.trim();
    return cleaned.length > 0 ? cleaned : UNKNOWN_NOT_RECOVERED_TEXT;
  }

  return UNKNOWN_NOT_RECOVERED_TEXT;
}
