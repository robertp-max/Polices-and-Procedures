import {
  deriveQapiBundle,
  resolveQapiSource,
  segmentQapiSourceByQuarter,
  selectQuarterSegment,
} from '@/policy/brad/intake/adapters/qapiIntakeAdapter';
import type {
  QapiDerivedBundle,
  QapiSourceSegment,
} from '@/policy/brad/intake/adapters/qapiIntakeAdapter';
import { parseSourceFile } from '@/policy/evidence/intake/fileParsing';
import type { ParseInput, ParsedFile } from '@/policy/evidence/intake/fileParsing';
import type { AppendixDDataValidationStatus } from '@/policy/packets/contracts';
import {
  decideSourceValidationStatus,
  SOURCE_VALIDATION_STATUS,
} from './sourceValidation';

export const SOURCE_SEGMENT_EXCLUSION_REASONS = {
  datasetMismatch: 'Dataset hard stop — segment does not match the requested dataset',
  agencyMismatch: 'Agency hard stop — segment belongs to a different agency',
  periodMismatch: 'Period hard stop — segment belongs to a different reporting period',
  eventDateMismatch: 'Event-date hard stop — segment does not match the requested event date',
  nextPeriodOperationalRecord: 'Period hard stop — next-period operational record',
  ambiguousSource: 'Ambiguous source — fail closed',
  notSelected: 'Not selected — another segment matched the packet boundary',
  unknownNotRecovered: 'Unknown — not recovered',
} as const;

export type SourceSegmentExclusionReason =
  (typeof SOURCE_SEGMENT_EXCLUSION_REASONS)[keyof typeof SOURCE_SEGMENT_EXCLUSION_REASONS];

export type SegmentationStatus = 'selected' | 'failed-closed';
export type SourceClassification = 'production' | 'synthetic';
export type SourceDateRole = 'governance' | 'operational' | 'unknown';

export interface NormalizedSourceSegment {
  segmentId: string;
  sourceId: string;
  datasetId: string | null;
  agency: string | null;
  period: string | null;
  periodLabel: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  eventDate: string | null;
  dateRole: SourceDateRole;
  sourceClassification: SourceClassification;
  text: string;
}

export interface ExcludedSourceSegment {
  segmentId: string;
  datasetId: string | null;
  agency: string | null;
  period: string | null;
  eventDate: string | null;
  reason: SourceSegmentExclusionReason;
  detail: string;
}

export interface SegmentSourcesInput {
  parsed: ParsedFile;
  eventDateISO?: string;
  targetDatasetId?: string;
  targetAgency?: string;
  targetPeriod?: string;
  sourceId?: string;
}

export interface SegmentSourceFileInput extends ParseInput {
  eventDateISO?: string;
  targetDatasetId?: string;
  targetAgency?: string;
  targetPeriod?: string;
  sourceId?: string;
}

export interface SegmentationResult {
  status: SegmentationStatus;
  validationStatus: AppendixDDataValidationStatus;
  selectedSegment: NormalizedSourceSegment | null;
  allSegments: NormalizedSourceSegment[];
  excludedSegments: ExcludedSourceSegment[];
  parsed: ParsedFile;
  reason: string;
}

export interface SegmentedQapiBundleResult {
  segmentation: SegmentationResult;
  bundle: QapiDerivedBundle | null;
}

const QAPI_DATASET_RE = /Dataset ID:\s*(QAPI-Q([1-4])-DS-[A-Za-z0-9-]+)/;
const QAPI_QUARTER_RE = /Quarter:\s*Q([1-4])\s*(20\d{2})/;
const ISO_DATE_RE = /20\d{2}-\d{2}-\d{2}/;

export function segmentSourceFile(input: SegmentSourceFileInput): SegmentationResult {
  const parsed = parseSourceFile(input);
  return segmentParsedSource({
    parsed,
    eventDateISO: input.eventDateISO,
    targetDatasetId: input.targetDatasetId,
    targetAgency: input.targetAgency,
    targetPeriod: input.targetPeriod,
    sourceId: input.sourceId ?? input.fileName,
  });
}

export function deriveSegmentedQapiBundle(input: SegmentSourcesInput): SegmentedQapiBundleResult {
  const segmentation = segmentParsedSource(input);
  if (segmentation.status !== 'selected') return { segmentation, bundle: null };
  return {
    segmentation,
    bundle: deriveQapiBundle(segmentation.parsed, input.eventDateISO ?? '', input.targetPeriod),
  };
}

export function segmentParsedSource(input: SegmentSourcesInput): SegmentationResult {
  const sourceId = input.sourceId ?? 'source';
  const fullText = textFromParsedFile(input.parsed);
  if (!fullText.trim()) {
    return failedResult({
      input,
      sourceId,
      segments: [],
      parsed: input.parsed,
      reason: 'No parseable source text was recovered.',
      validationStatus: SOURCE_VALIDATION_STATUS.unknownNotRecovered,
    });
  }

  const qapiSegments = segmentQapiSourceByQuarter(fullText);
  const segments = qapiSegments.length > 0
    ? qapiSegments.map((segment, index) => normalizeQapiSegment(segment, sourceId, index))
    : [inferSingleSegment(fullText, sourceId)];

  const selectedId = selectSegmentId({
    input,
    qapiSegments,
    segments,
  });

  if (!selectedId) {
    const detail = qapiSegments.length > 0
      ? selectQuarterSegment(qapiSegments, {
          eventDateISO: input.eventDateISO,
          targetQuarter: input.targetPeriod,
        }).reason
      : 'No segment matched the requested source boundary.';
    return failedResult({
      input,
      sourceId,
      segments,
      parsed: input.parsed,
      reason: detail,
      validationStatus: SOURCE_VALIDATION_STATUS.unknownNotRecovered,
    });
  }

  const selected = segments.find((segment) => segment.segmentId === selectedId) ?? null;
  if (!selected) {
    return failedResult({
      input,
      sourceId,
      segments,
      parsed: input.parsed,
      reason: 'Selected segment id was not recoverable.',
      validationStatus: SOURCE_VALIDATION_STATUS.conflictedReconciliationRequired,
    });
  }

  const selectedHardStop = selectedSegmentHardStop(selected, input);
  if (selectedHardStop) {
    return failedResult({
      input,
      sourceId,
      segments,
      parsed: input.parsed,
      reason: selectedHardStop.detail,
      validationStatus: SOURCE_VALIDATION_STATUS.conflictedReconciliationRequired,
    });
  }

  const excludedSegments = segments
    .filter((segment) => segment.segmentId !== selected.segmentId)
    .map((segment) => exclusionForSegment(segment, selected, input));

  const resolved = input.eventDateISO && qapiSegments.length > 0
    ? resolveQapiSource(input.parsed, input.eventDateISO, input.targetPeriod)
    : null;

  return {
    status: 'selected',
    validationStatus: decideSourceValidationStatus({
      recovered: true,
      limited: excludedSegments.length > 0,
    }),
    selectedSegment: selected,
    allSegments: segments,
    excludedSegments,
    parsed: resolved && !resolved.conflict ? resolved.parsed : input.parsed,
    reason: excludedSegments.length > 0
      ? `Selected ${selected.segmentId}; excluded ${excludedSegments.length} non-matching segment(s).`
      : `Selected ${selected.segmentId}.`,
  };
}

function selectSegmentId(input: {
  input: SegmentSourcesInput;
  qapiSegments: QapiSourceSegment[];
  segments: NormalizedSourceSegment[];
}): string | null {
  if (input.input.targetDatasetId) {
    const byDataset = input.segments.filter((segment) => segment.datasetId === input.input.targetDatasetId);
    return oneOrNull(byDataset)?.segmentId ?? null;
  }

  if (input.qapiSegments.length > 0) {
    const selection = selectQuarterSegment(input.qapiSegments, {
      eventDateISO: input.input.eventDateISO,
      targetQuarter: input.input.targetPeriod,
    });
    if (selection.conflict || !selection.segment) return null;
    return input.segments.find((segment) => segment.datasetId === selection.segment?.datasetId)?.segmentId ?? null;
  }

  const candidates = input.segments.filter((segment) => segmentMatchesBoundary(segment, input.input));
  return oneOrNull(candidates)?.segmentId ?? null;
}

function failedResult(input: {
  input: SegmentSourcesInput;
  sourceId: string;
  segments: NormalizedSourceSegment[];
  parsed: ParsedFile;
  reason: string;
  validationStatus: AppendixDDataValidationStatus;
}): SegmentationResult {
  return {
    status: 'failed-closed',
    validationStatus: input.validationStatus,
    selectedSegment: null,
    allSegments: input.segments,
    excludedSegments: input.segments.map((segment) => ({
      segmentId: segment.segmentId,
      datasetId: segment.datasetId,
      agency: segment.agency,
      period: segment.period,
      eventDate: segment.eventDate,
      reason: exclusionReasonForBoundary(segment, input.input),
      detail: input.reason,
    })),
    parsed: input.parsed,
    reason: input.reason,
  };
}

function selectedSegmentHardStop(
  selected: NormalizedSourceSegment,
  input: SegmentSourcesInput,
): ExcludedSourceSegment | null {
  const reason = exclusionReasonForBoundary(selected, input);
  if (reason !== SOURCE_SEGMENT_EXCLUSION_REASONS.notSelected) {
    return {
      segmentId: selected.segmentId,
      datasetId: selected.datasetId,
      agency: selected.agency,
      period: selected.period,
      eventDate: selected.eventDate,
      reason,
      detail: `${reason}: ${selected.segmentId}`,
    };
  }
  return null;
}

function exclusionForSegment(
  segment: NormalizedSourceSegment,
  selected: NormalizedSourceSegment,
  input: SegmentSourcesInput,
): ExcludedSourceSegment {
  const reason = exclusionReasonForBoundary(segment, input);
  const effectiveReason = reason === SOURCE_SEGMENT_EXCLUSION_REASONS.notSelected
    ? SOURCE_SEGMENT_EXCLUSION_REASONS.notSelected
    : reason;
  return {
    segmentId: segment.segmentId,
    datasetId: segment.datasetId,
    agency: segment.agency,
    period: segment.period,
    eventDate: segment.eventDate,
    reason: effectiveReason,
    detail: `${effectiveReason}: ${segment.segmentId} excluded while ${selected.segmentId} was selected.`,
  };
}

function exclusionReasonForBoundary(
  segment: NormalizedSourceSegment,
  input: SegmentSourcesInput,
): SourceSegmentExclusionReason {
  if (input.targetDatasetId && segment.datasetId !== input.targetDatasetId) {
    return SOURCE_SEGMENT_EXCLUSION_REASONS.datasetMismatch;
  }
  if (input.targetAgency && !sameText(segment.agency, input.targetAgency)) {
    return SOURCE_SEGMENT_EXCLUSION_REASONS.agencyMismatch;
  }
  if (input.targetPeriod && segment.period && segment.period !== input.targetPeriod) {
    return SOURCE_SEGMENT_EXCLUSION_REASONS.periodMismatch;
  }
  if (
    input.targetPeriod
    && segment.dateRole === 'operational'
    && segment.eventDate
    && !dateWithinPeriod(segment.eventDate, input.targetPeriod)
  ) {
    return SOURCE_SEGMENT_EXCLUSION_REASONS.nextPeriodOperationalRecord;
  }
  if (
    input.eventDateISO
    && segment.eventDate
    && segment.eventDate !== input.eventDateISO
    && !governanceDateAllowedAfterPeriod(segment, input)
  ) {
    return SOURCE_SEGMENT_EXCLUSION_REASONS.eventDateMismatch;
  }
  return SOURCE_SEGMENT_EXCLUSION_REASONS.notSelected;
}

function segmentMatchesBoundary(segment: NormalizedSourceSegment, input: SegmentSourcesInput): boolean {
  return exclusionReasonForBoundary(segment, input) === SOURCE_SEGMENT_EXCLUSION_REASONS.notSelected;
}

function normalizeQapiSegment(
  segment: QapiSourceSegment,
  sourceId: string,
  index: number,
): NormalizedSourceSegment {
  const segmentId = segment.datasetId ?? `${sourceId}:qapi-segment:${index + 1}`;
  const period = segment.quarter;
  const bounds = period ? quarterBounds(period) : null;
  return {
    segmentId,
    sourceId,
    datasetId: segment.datasetId,
    agency: segment.agency,
    period,
    periodLabel: segment.quarterLabel,
    periodStart: bounds?.start ?? null,
    periodEnd: bounds?.end ?? null,
    eventDate: segment.meetingDate,
    dateRole: 'governance',
    sourceClassification: segment.synthetic ? 'synthetic' : 'production',
    text: segment.text,
  };
}

function inferSingleSegment(text: string, sourceId: string): NormalizedSourceSegment {
  const datasetMatch = QAPI_DATASET_RE.exec(text);
  const quarterMatch = QAPI_QUARTER_RE.exec(text);
  const period = quarterMatch ? `${quarterMatch[2]}-Q${quarterMatch[1]}` : null;
  const bounds = period ? quarterBounds(period) : null;
  const meetingDate = /QAPI Meeting Date:\s*(20\d{2}-\d{2}-\d{2})/.exec(text)?.[1] ?? null;
  const eventDate = meetingDate ?? ISO_DATE_RE.exec(text)?.[0] ?? null;
  return {
    segmentId: datasetMatch?.[1] ?? `${sourceId}:single-source`,
    sourceId,
    datasetId: datasetMatch?.[1] ?? null,
    agency: /Agency:\s*([^\n|]+)/.exec(text)?.[1]?.trim() ?? null,
    period,
    periodLabel: quarterMatch ? `Q${quarterMatch[1]} ${quarterMatch[2]}` : null,
    periodStart: bounds?.start ?? null,
    periodEnd: bounds?.end ?? null,
    eventDate,
    dateRole: meetingDate ? 'governance' : 'unknown',
    sourceClassification: /\bsynthetic\b|\bmock\b|not for production|no real phi/i.test(text)
      ? 'synthetic'
      : 'production',
    text,
  };
}

function textFromParsedFile(parsed: ParsedFile): string {
  return parsed.records
    .map((record) => record.text ?? String(record.fields.text ?? ''))
    .join('\n');
}

function oneOrNull<T>(items: T[]): T | null {
  return items.length === 1 ? items[0] : null;
}

function sameText(left: string | null, right: string | null | undefined): boolean {
  if (!left || !right) return false;
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function quarterBounds(period: string): { start: string; end: string } | null {
  const match = /^(20\d{2})-Q([1-4])$/.exec(period);
  if (!match) return null;
  const year = match[1];
  const quarter = match[2];
  if (quarter === '1') return { start: `${year}-01-01`, end: `${year}-03-31` };
  if (quarter === '2') return { start: `${year}-04-01`, end: `${year}-06-30` };
  if (quarter === '3') return { start: `${year}-07-01`, end: `${year}-09-30` };
  return { start: `${year}-10-01`, end: `${year}-12-31` };
}

function dateWithinPeriod(dateISO: string, period: string): boolean {
  const bounds = quarterBounds(period);
  if (!bounds) return false;
  return dateISO >= bounds.start && dateISO <= bounds.end;
}

function governanceDateAllowedAfterPeriod(
  segment: NormalizedSourceSegment,
  input: SegmentSourcesInput,
): boolean {
  if (!input.targetPeriod || segment.period !== input.targetPeriod) return false;
  if (segment.dateRole !== 'governance') return false;
  const bounds = quarterBounds(input.targetPeriod);
  return Boolean(bounds && segment.eventDate && segment.eventDate > bounds.end);
}
