import type {
  AppendixDDataValidationStatus,
  PacketValidationFinding,
} from '@/policy/packets/contracts';
import type { QapiDerivedMetric } from '@/policy/brad/intake/adapters/qapiIntakeAdapter';

export const UNKNOWN_NOT_RECOVERED_TEXT = 'UNKNOWN — NOT RECOVERED' as const;

export type SourceDataValidationStatus =
  | Exclude<AppendixDDataValidationStatus, 'Unknown — not recovered'>
  | typeof UNKNOWN_NOT_RECOVERED_TEXT;

export const SOURCE_VALIDATION_STATUS = {
  validated: 'Validated',
  validatedWithLimitation: 'Validated with limitation',
  provisionalHumanReviewRequired: 'Provisional — human review required',
  conflictedReconciliationRequired: 'Conflicted — reconciliation required',
  unknownNotRecovered: UNKNOWN_NOT_RECOVERED_TEXT,
  excluded: 'Excluded',
} as const satisfies Record<string, SourceDataValidationStatus>;

export const SOURCE_VALIDATION_OUTCOMES = [
  SOURCE_VALIDATION_STATUS.validated,
  SOURCE_VALIDATION_STATUS.validatedWithLimitation,
  SOURCE_VALIDATION_STATUS.provisionalHumanReviewRequired,
  SOURCE_VALIDATION_STATUS.conflictedReconciliationRequired,
  SOURCE_VALIDATION_STATUS.unknownNotRecovered,
  SOURCE_VALIDATION_STATUS.excluded,
] as const;

export interface SourceValidationDecisionInput {
  recovered: boolean;
  excluded?: boolean;
  conflicted?: boolean;
  limited?: boolean;
  needsHumanReview?: boolean;
}

export interface SourceValidationSummary {
  status: SourceDataValidationStatus;
  findings: PacketValidationFinding[];
  note: string | null;
}

export function isSourceValidationStatus(value: string): value is SourceDataValidationStatus {
  return (SOURCE_VALIDATION_OUTCOMES as readonly string[]).includes(value);
}

export function decideSourceValidationStatus(
  input: SourceValidationDecisionInput,
): SourceDataValidationStatus {
  if (input.excluded) return SOURCE_VALIDATION_STATUS.excluded;
  if (input.conflicted) return SOURCE_VALIDATION_STATUS.conflictedReconciliationRequired;
  if (!input.recovered) return SOURCE_VALIDATION_STATUS.unknownNotRecovered;
  if (input.needsHumanReview) return SOURCE_VALIDATION_STATUS.provisionalHumanReviewRequired;
  if (input.limited) return SOURCE_VALIDATION_STATUS.validatedWithLimitation;
  return SOURCE_VALIDATION_STATUS.validated;
}

export function validationStatusForQapiMetric(
  metric: QapiDerivedMetric,
): SourceDataValidationStatus {
  if (metric.value === null || metric.confidence === 'none') {
    return SOURCE_VALIDATION_STATUS.unknownNotRecovered;
  }
  if (metric.needsReview) return SOURCE_VALIDATION_STATUS.provisionalHumanReviewRequired;
  if (metric.confidence === 'low') return SOURCE_VALIDATION_STATUS.validatedWithLimitation;
  return SOURCE_VALIDATION_STATUS.validated;
}

export function summarizeSourceValidation(input: {
  recovered: boolean;
  findings?: PacketValidationFinding[];
  note?: string | null;
  excluded?: boolean;
  conflicted?: boolean;
  limited?: boolean;
  needsHumanReview?: boolean;
}): SourceValidationSummary {
  return {
    status: decideSourceValidationStatus(input),
    findings: input.findings ?? [],
    note: input.note ?? null,
  };
}

export function renderRecoveredSourceValue(
  value: QapiDerivedMetric['value'] | number | boolean | null | undefined,
): QapiDerivedMetric['value'] | number | boolean | typeof UNKNOWN_NOT_RECOVERED_TEXT {
  if (value === null || value === undefined || value === '') {
    return UNKNOWN_NOT_RECOVERED_TEXT;
  }
  return value;
}
