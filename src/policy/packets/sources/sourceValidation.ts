import type {
  AppendixDDataValidationStatus,
  PacketValidationFinding,
} from '@/policy/packets/contracts';
import { APPENDIX_D_DATA_VALIDATION_STATUS_VOCABULARY } from '@/policy/packets/contracts';
import type { QapiDerivedMetric } from '@/policy/brad/intake/adapters/qapiIntakeAdapter';

export const SOURCE_VALIDATION_STATUS = {
  validated: 'Validated',
  validatedWithLimitation: 'Validated with limitation',
  provisionalHumanReviewRequired: 'Provisional — human review required',
  conflictedReconciliationRequired: 'Conflicted — reconciliation required',
  unknownNotRecovered: 'Unknown — not recovered',
  excluded: 'Excluded',
} as const satisfies Record<string, AppendixDDataValidationStatus>;

export const SOURCE_VALIDATION_OUTCOMES = APPENDIX_D_DATA_VALIDATION_STATUS_VOCABULARY;

export interface SourceValidationDecisionInput {
  recovered: boolean;
  excluded?: boolean;
  conflicted?: boolean;
  limited?: boolean;
  needsHumanReview?: boolean;
}

export interface SourceValidationSummary {
  status: AppendixDDataValidationStatus;
  findings: PacketValidationFinding[];
  note: string | null;
}

export function isSourceValidationStatus(value: string): value is AppendixDDataValidationStatus {
  return (APPENDIX_D_DATA_VALIDATION_STATUS_VOCABULARY as readonly string[]).includes(value);
}

export function decideSourceValidationStatus(
  input: SourceValidationDecisionInput,
): AppendixDDataValidationStatus {
  if (input.excluded) return SOURCE_VALIDATION_STATUS.excluded;
  if (input.conflicted) return SOURCE_VALIDATION_STATUS.conflictedReconciliationRequired;
  if (!input.recovered) return SOURCE_VALIDATION_STATUS.unknownNotRecovered;
  if (input.needsHumanReview) return SOURCE_VALIDATION_STATUS.provisionalHumanReviewRequired;
  if (input.limited) return SOURCE_VALIDATION_STATUS.validatedWithLimitation;
  return SOURCE_VALIDATION_STATUS.validated;
}

export function validationStatusForQapiMetric(
  metric: QapiDerivedMetric,
): AppendixDDataValidationStatus {
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
