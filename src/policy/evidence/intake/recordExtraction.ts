/**
 * Record-level extraction (Section 4 + 5).
 *
 * Turns a parsed file into EvidenceSourceRecords, each carrying:
 *   - source lineage (file id/name, sourcePointer: row/sheet:row/$.path/page/heading)
 *   - resolved created date + filing period (created-date invariant)
 *   - classification + confidence
 *   - content hash (for dedup/idempotency)
 *
 * Pure: no store, no network. The intake service consumes these records.
 */

import { classifyEvidence } from './classification';
import { resolveEvidenceCreatedDate } from './createdDateResolver';
import { contentHashOf } from './hash';
import type { ParsedFile, ParsedRecordCell } from './fileParsing';
import { intakeId, type EvidenceSourceRecord } from './intakeModel';
import type { SourceSystem } from './sourceProfiles';

export interface ExtractContext {
  batchId: string;
  sourceFileId: string;
  sourceFileName: string;
  sourceSystem?: SourceSystem | string | null;
  /** Intake upload timestamp — the final created-date fallback. */
  uploadedAt: string;
  /** Optional explicit source object / table name (classification signal). */
  sourceObject?: string;
  timezone?: string;
}

/** Pull a likely source record id from common id fields. */
function extractSourceRecordId(fields: Record<string, unknown>): string | null {
  const idKeys = ['id', 'recordid', 'record_id', 'sfid', 'salesforceid', 'caseid', 'case_number', 'casenumber', 'externalid', 'wellskyid'];
  for (const key of Object.keys(fields)) {
    const norm = key.trim().toLowerCase().replace(/\s+/g, '');
    if (idKeys.includes(norm)) {
      const v = fields[key];
      if (v !== null && v !== undefined && String(v).trim()) return String(v).trim();
    }
  }
  return null;
}

export function extractRecordFromCell(cell: ParsedRecordCell, ctx: ExtractContext): EvidenceSourceRecord {
  const resolved = resolveEvidenceCreatedDate({
    fields: cell.fields,
    sourceSystem: ctx.sourceSystem,
    uploadTimestamp: ctx.uploadedAt,
    timezone: ctx.timezone,
  });

  const classification = classifyEvidence({
    fileName: ctx.sourceFileName,
    sourcePointer: cell.pointer,
    jsonPath: cell.pointer.startsWith('$') ? cell.pointer : undefined,
    sourceObject: ctx.sourceObject,
    columnHeaders: Object.keys(cell.fields),
    text: cell.text,
  });

  const contentHash = contentHashOf({ fields: cell.fields, pointer: cell.pointer, file: ctx.sourceFileName });
  const sourceRecordId = extractSourceRecordId(cell.fields);

  let status: EvidenceSourceRecord['status'] = 'ready';
  if (resolved.needsDateReview) status = 'needs_date_review';
  else if (classification.classification === 'unknown_needs_review' || classification.confidence < 0.6) status = 'needs_classification_review';

  return {
    sourceRecordKey: intakeId('SRC', `${ctx.sourceFileId}-${cell.pointer}`),
    batchId: ctx.batchId,
    sourceFileId: ctx.sourceFileId,
    sourceFileName: ctx.sourceFileName,
    sourcePointer: cell.pointer,
    sourceSystem: (ctx.sourceSystem as string) ?? null,
    sourceRecordId,
    sourceSystemCreatedAt: resolved.sourceSystemCreatedAt,
    occurrenceAt: resolved.occurrenceAt,
    reportedAt: resolved.reportedAt,
    receivedAt: resolved.receivedAt,
    uploadedAt: ctx.uploadedAt,
    resolvedCreatedAt: resolved.resolvedCreatedAt,
    createdDateSource: resolved.createdDateSource,
    createdDateConfidence: resolved.createdDateConfidence,
    filingPeriodKey: resolved.filingPeriod?.filingPeriodKey ?? null,
    filingQuarterKey: resolved.filingPeriod?.filingQuarterKey ?? null,
    classification: classification.classification,
    classificationConfidence: classification.confidence,
    classificationRationale: classification.rationale,
    contentHash,
    status,
  };
}

export interface ExtractionResult {
  records: EvidenceSourceRecord[];
  parsedCount: number;
  failedCount: number;
  unresolvedCount: number;
}

/** Extract all source records from a parsed file. */
export function extractRecords(parsed: ParsedFile, ctx: ExtractContext): ExtractionResult {
  if (parsed.parseStatus !== 'parsed') {
    // The file could not be parsed into records (failed / needs_extraction / empty).
    // It still counts as a failed/unreadable source for honest coverage accounting.
    return { records: [], parsedCount: 0, failedCount: 1, unresolvedCount: 0 };
  }
  const records = parsed.records.map((cell) => extractRecordFromCell(cell, ctx));
  const unresolvedCount = records.filter((r) => r.status === 'needs_date_review').length;
  return {
    records,
    parsedCount: records.length,
    failedCount: 0,
    unresolvedCount,
  };
}
