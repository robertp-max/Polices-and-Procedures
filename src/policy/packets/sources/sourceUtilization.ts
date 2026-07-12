import type {
  DriveArtifactPointer,
  PacketAttachmentInstance,
  PacketFinding,
} from '@/policy/packets/contracts';
import { SOURCE_VALIDATION_STATUS } from './sourceValidation';
import type { SourceDataValidationStatus } from './sourceValidation';

export const SOURCE_UTILIZATION_BUCKETS = [
  'expected-but-missing',
  'supplied-but-unused',
  'generated-by-trigger',
  'carried-forward',
  'conflict',
  'excluded-with-reason',
] as const;

export type SourceUtilizationBucket = (typeof SOURCE_UTILIZATION_BUCKETS)[number];

export interface SourceFormUtilization {
  formId: string;
  formName: string | null;
  sourceId: string;
  sourceName: string | null;
  purpose: string;
  recordsReviewed: number | null;
  findings: PacketFinding[];
  validationStatus: SourceDataValidationStatus;
  attachment: PacketAttachmentInstance | DriveArtifactPointer | null;
}

export interface ExpectedButMissingSource {
  bucket: 'expected-but-missing';
  requirementId: string;
  formId: string;
  sourceId: string;
  purpose: string;
  expectedAgency: string | null;
  expectedPeriod: string | null;
  recordsExpected: number | null;
  validationStatus: typeof SOURCE_VALIDATION_STATUS.unknownNotRecovered;
}

export interface SuppliedButUnusedSource {
  bucket: 'supplied-but-unused';
  sourceId: string;
  sourceName: string | null;
  reason: string;
  validationStatus: typeof SOURCE_VALIDATION_STATUS.excluded;
}

export interface GeneratedByTriggerSource {
  bucket: 'generated-by-trigger';
  triggerId: string;
  sourceId: string;
  sourceName: string | null;
  purpose: string;
  validationStatus: SourceDataValidationStatus;
}

export interface CarriedForwardSource {
  bucket: 'carried-forward';
  sourceId: string;
  sourceName: string | null;
  priorPacketInstanceId: string;
  carryForwardReason: string;
  validationStatus: SourceDataValidationStatus;
}

export interface SourceConflict {
  bucket: 'conflict';
  conflictId: string;
  sourceIds: string[];
  formIds: string[];
  reason: string;
  validationStatus: typeof SOURCE_VALIDATION_STATUS.conflictedReconciliationRequired;
}

export interface ExcludedSourceWithReason {
  bucket: 'excluded-with-reason';
  sourceId: string;
  sourceName: string | null;
  reason: string;
  validationStatus: typeof SOURCE_VALIDATION_STATUS.excluded;
}

export interface SourceFormUtilizationReport {
  sourcesAndFormsUsed: SourceFormUtilization[];
  expectedButMissing: ExpectedButMissingSource[];
  suppliedButUnused: SuppliedButUnusedSource[];
  generatedByTrigger: GeneratedByTriggerSource[];
  carriedForward: CarriedForwardSource[];
  conflicts: SourceConflict[];
  excludedWithReason: ExcludedSourceWithReason[];
}

export function createSourceFormUtilizationReport(input: {
  sourcesAndFormsUsed?: SourceFormUtilization[];
  expectedButMissing?: Omit<ExpectedButMissingSource, 'bucket' | 'validationStatus'>[];
  suppliedButUnused?: Omit<SuppliedButUnusedSource, 'bucket' | 'validationStatus'>[];
  generatedByTrigger?: Omit<GeneratedByTriggerSource, 'bucket'>[];
  carriedForward?: Omit<CarriedForwardSource, 'bucket'>[];
  conflicts?: Omit<SourceConflict, 'bucket' | 'validationStatus'>[];
  excludedWithReason?: Omit<ExcludedSourceWithReason, 'bucket' | 'validationStatus'>[];
}): SourceFormUtilizationReport {
  return {
    sourcesAndFormsUsed: input.sourcesAndFormsUsed ?? [],
    expectedButMissing: (input.expectedButMissing ?? []).map((item) => ({
      ...item,
      bucket: 'expected-but-missing' as const,
      validationStatus: SOURCE_VALIDATION_STATUS.unknownNotRecovered,
    })),
    suppliedButUnused: (input.suppliedButUnused ?? []).map((item) => ({
      ...item,
      bucket: 'supplied-but-unused' as const,
      validationStatus: SOURCE_VALIDATION_STATUS.excluded,
    })),
    generatedByTrigger: (input.generatedByTrigger ?? []).map((item) => ({
      ...item,
      bucket: 'generated-by-trigger' as const,
    })),
    carriedForward: (input.carriedForward ?? []).map((item) => ({
      ...item,
      bucket: 'carried-forward' as const,
    })),
    conflicts: (input.conflicts ?? []).map((item) => ({
      ...item,
      bucket: 'conflict' as const,
      validationStatus: SOURCE_VALIDATION_STATUS.conflictedReconciliationRequired,
    })),
    excludedWithReason: (input.excludedWithReason ?? []).map((item) => ({
      ...item,
      bucket: 'excluded-with-reason' as const,
      validationStatus: SOURCE_VALIDATION_STATUS.excluded,
    })),
  };
}

export function countReviewedRecords(report: SourceFormUtilizationReport): number | null {
  if (report.sourcesAndFormsUsed.length === 0) return null;

  const recoveredCounts = report.sourcesAndFormsUsed
    .map((item) => item.recordsReviewed)
    .filter((value): value is number => value !== null);

  if (recoveredCounts.length !== report.sourcesAndFormsUsed.length) return null;
  return recoveredCounts.reduce((sum, value) => sum + value, 0);
}
