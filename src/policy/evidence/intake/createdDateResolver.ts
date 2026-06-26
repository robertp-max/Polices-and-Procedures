/**
 * Canonical created-date resolver (Section 6).
 *
 * ONE pure function resolves the source-system *created* date for a record and
 * derives its filing period. Precedence is profile-driven. Occurrence / service
 * / visit / assessment / OASIS / POC dates are NEVER used as a created-date
 * fallback — they are retained separately as metadata.
 *
 * Ambiguous or invalid created dates produce confidence 'unresolved' →
 * status needs_date_review. The resolver never guesses a period.
 */

import { deriveFilingPeriod, type FilingPeriod } from './filingPeriod';
import {
  getSourceProfile,
  normalizeFieldKey,
  type SourceProfile,
  type SourceSystem,
} from './sourceProfiles';
import type { CreatedDateConfidence } from './intakeModel';

/** A flat record of raw field values keyed by their original column/key name. */
export type RawRecordFields = Record<string, unknown>;

export interface CreatedDateInput {
  /** Raw parsed fields (column header / JSON key → value). */
  fields: RawRecordFields;
  /** Source system hint (selects the profile). */
  sourceSystem?: SourceSystem | string | null;
  /** Intake upload timestamp (the final, low-confidence fallback). */
  uploadTimestamp: string;
  /** Optional explicit timezone override (else profile default). */
  timezone?: string;
}

export interface ResolvedEvidenceDate {
  resolvedCreatedAt: string | null;
  createdDateSource: string | null;
  createdDateConfidence: CreatedDateConfidence;
  /** Always retained separately from filing date. */
  occurrenceAt: string | null;
  reportedAt: string | null;
  receivedAt: string | null;
  sourceSystemCreatedAt: string | null;
  filingPeriod: FilingPeriod | null;
  needsDateReview: boolean;
  /** Human notes explaining the resolution / why review is required. */
  notes: string[];
}

/** Parse a value into an ISO instant string, or null if not a usable date. */
export function parseDateValue(value: unknown): { iso: string } | { invalid: true } | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? { invalid: true } : { iso: value.toISOString() };
  }
  const raw = String(value).trim();
  if (!raw) return null;

  // Reject obvious non-dates fast (pure text) before Date.parse heuristics.
  if (!/\d/.test(raw)) return { invalid: true };

  // Normalize a few common source-system formats.
  // - "2026-03-14 09:21:00" (WellSky) → treat the space as a 'T'.
  let candidate = raw;
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(candidate)) {
    candidate = candidate.replace(' ', 'T');
  }

  const ms = Date.parse(candidate);
  if (Number.isNaN(ms)) return { invalid: true };
  return { iso: new Date(ms).toISOString() };
}

function lookupByAliases(
  normalizedFields: Map<string, unknown>,
  aliases: string[],
): { iso: string; key: string } | { invalid: true; key: string } | null {
  for (const alias of aliases) {
    const key = normalizeFieldKey(alias);
    if (!normalizedFields.has(key)) continue;
    const parsed = parseDateValue(normalizedFields.get(key));
    if (parsed === null) continue; // empty value — keep scanning
    if ('invalid' in parsed) return { invalid: true, key };
    return { iso: parsed.iso, key };
  }
  return null;
}

export function resolveEvidenceCreatedDate(
  input: CreatedDateInput,
  profileOverride?: SourceProfile,
): ResolvedEvidenceDate {
  const profile = profileOverride ?? getSourceProfile(input.sourceSystem);
  const tz = input.timezone ?? profile.agencyTimezone;
  const notes: string[] = [];

  // Build a normalized field map once.
  const normalized = new Map<string, unknown>();
  for (const [k, v] of Object.entries(input.fields ?? {})) {
    normalized.set(normalizeFieldKey(k), v);
  }

  // Retain occurrence / reported / received as metadata (never filing).
  const occ = lookupByAliases(normalized, profile.occurrenceAliases);
  const occurrenceAt = occ && !('invalid' in occ) ? occ.iso : null;
  const rep = lookupByAliases(normalized, profile.reportedAliases);
  const reportedAt = rep && !('invalid' in rep) ? rep.iso : null;
  const rec = lookupByAliases(normalized, profile.receivedAliases);
  const receivedAt = rec && !('invalid' in rec) ? rec.iso : null;

  // 1-6: created-date aliases, by precedence.
  let resolvedCreatedAt: string | null = null;
  let createdDateSource: string | null = null;
  let confidence: CreatedDateConfidence = 'unresolved';
  let sourceSystemCreatedAt: string | null = null;

  for (const alias of profile.createdDateAliases) {
    if (!normalized.has(alias.key)) continue;
    const parsed = parseDateValue(normalized.get(alias.key));
    if (parsed === null) continue; // present but empty → keep scanning
    if ('invalid' in parsed) {
      // A created-date field is present but unparseable → do not guess.
      notes.push(`Created-date field "${alias.label}" is present but not a valid date — review required.`);
      return finalize({
        resolvedCreatedAt: null,
        createdDateSource: null,
        confidence: 'unresolved',
        occurrenceAt, reportedAt, receivedAt, sourceSystemCreatedAt: null,
        tz, notes,
      });
    }
    resolvedCreatedAt = parsed.iso;
    createdDateSource = alias.label;
    confidence = alias.confidence;
    if (/source.?system.?created/i.test(alias.label)) sourceSystemCreatedAt = parsed.iso;
    break;
  }

  // 7-8: reported / received fallback (allowed; occurrence is NOT).
  if (!resolvedCreatedAt && reportedAt) {
    resolvedCreatedAt = reportedAt;
    createdDateSource = 'reportedToAgencyAt';
    confidence = 'medium';
    notes.push('No record-created date found; used reported-to-agency date (Section 6, step 7).');
  }
  if (!resolvedCreatedAt && receivedAt) {
    resolvedCreatedAt = receivedAt;
    createdDateSource = 'receivedAt';
    confidence = 'low';
    notes.push('No record-created or reported date found; used received date (Section 6, step 8).');
  }

  // 9: intake upload timestamp — final fallback, low confidence, profile-gated.
  if (!resolvedCreatedAt) {
    if (profile.allowUploadTimestampFallback) {
      const parsedUpload = parseDateValue(input.uploadTimestamp);
      if (parsedUpload && !('invalid' in parsedUpload)) {
        resolvedCreatedAt = parsedUpload.iso;
        createdDateSource = 'intake_upload_timestamp';
        confidence = 'low';
        notes.push('No source-system date found; used intake upload timestamp as final low-confidence fallback (Section 6, step 9).');
      }
    } else {
      notes.push(`No source-system created date found for a ${profile.label}; review required (upload-timestamp fallback is disabled for this source).`);
    }
  }

  if (occurrenceAt && !resolvedCreatedAt) {
    notes.push('An occurrence/service date is present but is NEVER used to derive the filing month.');
  }

  return finalize({
    resolvedCreatedAt,
    createdDateSource,
    confidence: resolvedCreatedAt ? confidence : 'unresolved',
    occurrenceAt, reportedAt, receivedAt, sourceSystemCreatedAt,
    tz, notes,
  });
}

function finalize(args: {
  resolvedCreatedAt: string | null;
  createdDateSource: string | null;
  confidence: CreatedDateConfidence;
  occurrenceAt: string | null;
  reportedAt: string | null;
  receivedAt: string | null;
  sourceSystemCreatedAt: string | null;
  tz: string;
  notes: string[];
}): ResolvedEvidenceDate {
  const filingPeriod = args.confidence === 'unresolved'
    ? null
    : deriveFilingPeriod(args.resolvedCreatedAt, args.tz);
  // A created date that resolves but yields no derivable period is ambiguous.
  const needsDateReview = args.confidence === 'unresolved' || !filingPeriod;
  return {
    resolvedCreatedAt: needsDateReview ? null : args.resolvedCreatedAt,
    createdDateSource: needsDateReview ? null : args.createdDateSource,
    createdDateConfidence: needsDateReview ? 'unresolved' : args.confidence,
    occurrenceAt: args.occurrenceAt,
    reportedAt: args.reportedAt,
    receivedAt: args.receivedAt,
    sourceSystemCreatedAt: args.sourceSystemCreatedAt,
    filingPeriod: needsDateReview ? null : filingPeriod,
    needsDateReview,
    notes: args.notes,
  };
}
