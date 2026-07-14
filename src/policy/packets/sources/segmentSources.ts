import {
  deriveQapiBundle,
  segmentQapiSourceByQuarter,
} from '@/policy/brad/intake/adapters/qapiIntakeAdapter';
import type {
  QapiDerivedBundle,
  QapiSourceSegment,
} from '@/policy/brad/intake/adapters/qapiIntakeAdapter';
import { parseSourceFile } from '@/policy/evidence/intake/fileParsing';
import type { ParseInput, ParsedFile } from '@/policy/evidence/intake/fileParsing';
import {
  decideSourceValidationStatus,
  SOURCE_VALIDATION_STATUS,
  UNKNOWN_NOT_RECOVERED_TEXT,
} from './sourceValidation';
import type { SourceDataValidationStatus } from './sourceValidation';

export const SOURCE_SEGMENT_EXCLUSION_REASONS = {
  datasetMismatch: 'Dataset hard stop — segment does not match the requested dataset',
  agencyMismatch: 'Agency hard stop — segment belongs to a different agency',
  periodMismatch: 'Period hard stop — segment belongs to a different reporting period',
  eventDateMismatch: 'Event-date hard stop — segment does not match the requested event date',
  nextPeriodOperationalRecord: 'Period hard stop — next-period operational record',
  ambiguousSource: 'Ambiguous source — fail closed',
  notSelected: 'Not selected — another segment matched the packet boundary',
  unknownNotRecovered: UNKNOWN_NOT_RECOVERED_TEXT,
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
  validationStatus: SourceDataValidationStatus;
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
const OPERATIONAL_DATE_RE =
  /\b(?:visit|service|record|incident|complaint|infection|admission|discharge|occurrence|onset|operational)\s+date:\s*(20\d{2}-\d{2}-\d{2})/gi;

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

  const selection = selectSegment({
    input,
    segments,
  });

  if (!selection.segmentId) {
    return failedResult({
      input,
      sourceId,
      segments,
      parsed: input.parsed,
      reason: selection.reason,
      validationStatus: SOURCE_VALIDATION_STATUS.unknownNotRecovered,
    });
  }

  const selected = segments.find((segment) => segment.segmentId === selection.segmentId) ?? null;
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

  const selectedParsed = parsedForSelectedSegment(input.parsed, selected, segments);

  return {
    status: 'selected',
    validationStatus: decideSourceValidationStatus({
      recovered: true,
      limited: excludedSegments.length > 0,
    }),
    selectedSegment: selected,
    allSegments: segments,
    excludedSegments,
    parsed: selectedParsed,
    reason: excludedSegments.length > 0
      ? `Selected ${selected.segmentId}; excluded ${excludedSegments.length} non-matching segment(s).`
      : `Selected ${selected.segmentId}.`,
  };
}

function selectSegment(input: {
  input: SegmentSourcesInput;
  segments: NormalizedSourceSegment[];
}): { segmentId: string | null; reason: string } {
  const candidates = input.segments.filter((segment) => segmentMatchesBoundary(segment, input.input));
  if (candidates.length === 1) {
    return {
      segmentId: candidates[0].segmentId,
      reason: `Matched requested source boundary: ${candidates[0].segmentId}.`,
    };
  }

  if (candidates.length > 1) {
    return {
      segmentId: null,
      reason: `${SOURCE_SEGMENT_EXCLUSION_REASONS.ambiguousSource}: ${candidates
        .map((segment) => segment.segmentId)
        .join(', ')} all matched the requested boundary.`,
    };
  }

  return {
    segmentId: null,
    reason: selectionFailureReason(input.segments, input.input),
  };
}

function failedResult(input: {
  input: SegmentSourcesInput;
  sourceId: string;
  segments: NormalizedSourceSegment[];
  parsed: ParsedFile;
  reason: string;
  validationStatus: SourceDataValidationStatus;
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
    && segment.dateRole === 'governance'
    && segment.eventDate
    && segment.eventDate !== input.eventDateISO
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
  const operationalDate = inferOperationalDate(text, period);
  const eventDate = meetingDate ?? operationalDate ?? ISO_DATE_RE.exec(text)?.[0] ?? null;
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
    dateRole: meetingDate ? 'governance' : operationalDate ? 'operational' : 'unknown',
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

function selectionFailureReason(
  segments: NormalizedSourceSegment[],
  input: SegmentSourcesInput,
): string {
  if (input.targetPeriod && !segments.some((segment) => segment.period === input.targetPeriod)) {
    const found = segments.map((segment) => segment.period ?? '?').join(', ');
    return `requested quarter ${input.targetPeriod} not present (found ${found})`;
  }

  const reasons = Array.from(
    new Set(
      segments
        .map((segment) => exclusionReasonForBoundary(segment, input))
        .filter((reason) => reason !== SOURCE_SEGMENT_EXCLUSION_REASONS.notSelected),
    ),
  );
  if (reasons.length > 0) {
    return `No segment matched the requested source boundary: ${reasons.join('; ')}.`;
  }
  return 'No segment matched the requested source boundary.';
}

function parsedForSelectedSegment(
  parsed: ParsedFile,
  selected: NormalizedSourceSegment,
  segments: NormalizedSourceSegment[],
): ParsedFile {
  if (segments.length <= 1) return parsed;
  return {
    ...parsed,
    records: [{
      pointer: `segment:${selected.segmentId}`,
      fields: { text: selected.text.slice(0, 8000) },
      text: selected.text,
    }],
    columnHeaders: parsed.columnHeaders.includes('text')
      ? parsed.columnHeaders
      : [...parsed.columnHeaders, 'text'],
    note: `Segmented to ${selected.periodLabel ?? selected.period ?? selected.segmentId} (${selected.segmentId}) from a ${segments.length}-segment source. ${parsed.note ?? ''}`.trim(),
  };
}

function inferOperationalDate(text: string, period: string | null): string | null {
  const dates = [...text.matchAll(OPERATIONAL_DATE_RE)].map((match) => match[1]);
  if (dates.length === 0) return null;
  if (period) {
    return dates.find((date) => !dateWithinPeriod(date, period)) ?? dates[0];
  }
  return dates[0];
}
