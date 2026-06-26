/**
 * Source-profile configuration (Section 6).
 *
 * A SourceProfile describes how to find the source-system *created* date for a
 * record from a given source system, the field aliases that count as a created
 * date, and whether the intake-upload timestamp may be used as a low-confidence
 * final fallback.
 *
 * This is configuration, not hardcoded UI logic — the created-date resolver is
 * driven entirely by these profiles so new source systems / column names can be
 * supported without touching resolver code.
 */

export type SourceSystem = 'salesforce' | 'wellsky' | 'care_indeed' | 'manual' | 'unknown';

export interface DateAlias {
  /** Lower-cased field name / column header / JSON key to match. */
  key: string;
  /** Confidence to assign when this alias supplies the created date. */
  confidence: 'high' | 'medium' | 'low';
  /** Human label for the createdDateSource provenance string. */
  label: string;
}

export interface SourceProfile {
  sourceSystem: SourceSystem;
  label: string;
  /** Ordered created-date field aliases (highest precedence first). */
  createdDateAliases: DateAlias[];
  /** Occurrence/service/visit aliases — retained as metadata, NEVER used for filing. */
  occurrenceAliases: string[];
  reportedAliases: string[];
  receivedAliases: string[];
  /** When true, intake upload timestamp is an accepted low-confidence final fallback. */
  allowUploadTimestampFallback: boolean;
  agencyTimezone: string;
}

const AGENCY_TZ = 'America/Los_Angeles';

/** Shared "generic" created-date aliases (Section 6, step 6). */
const GENERIC_CREATED_ALIASES: DateAlias[] = [
  { key: 'created date', confidence: 'medium', label: 'Created Date' },
  { key: 'date created', confidence: 'medium', label: 'Date Created' },
  { key: 'record created', confidence: 'medium', label: 'Record Created' },
  { key: 'record creation date', confidence: 'medium', label: 'Record Creation Date' },
  { key: 'date entered', confidence: 'medium', label: 'Date Entered' },
  { key: 'entered on', confidence: 'medium', label: 'Entered On' },
  { key: 'createdat', confidence: 'high', label: 'createdAt' },
  { key: 'created_at', confidence: 'high', label: 'created_at' },
  { key: 'recordcreatedat', confidence: 'high', label: 'recordCreatedAt' },
];

/** Canonical highest-precedence created-date aliases (steps 1-3). */
const CANONICAL_CREATED_ALIASES: DateAlias[] = [
  { key: 'sourcesystemcreatedat', confidence: 'high', label: 'sourceSystemCreatedAt' },
  { key: 'source_system_created_at', confidence: 'high', label: 'source_system_created_at' },
];

export const SOURCE_PROFILES: Record<SourceSystem, SourceProfile> = {
  salesforce: {
    sourceSystem: 'salesforce',
    label: 'Salesforce export',
    createdDateAliases: [
      ...CANONICAL_CREATED_ALIASES,
      { key: 'createddate', confidence: 'high', label: 'Salesforce CreatedDate' },
      ...GENERIC_CREATED_ALIASES,
    ],
    occurrenceAliases: ['occurrencedate', 'occurrence_date', 'incidentdate', 'incident_date', 'eventdate', 'abusedate', 'servicedate', 'visitdate', 'assessmentdate', 'oasisdate', 'pocdate'],
    reportedAliases: ['reportedtoagencyat', 'reported_to_agency_at', 'reporteddate', 'reported_date', 'datereported'],
    receivedAliases: ['receivedat', 'received_at', 'datereceived'],
    allowUploadTimestampFallback: false,
    agencyTimezone: AGENCY_TZ,
  },
  wellsky: {
    sourceSystem: 'wellsky',
    label: 'WellSky export',
    createdDateAliases: [
      ...CANONICAL_CREATED_ALIASES,
      { key: 'recordcreateddate', confidence: 'high', label: 'WellSky Record Created Date' },
      { key: 'record created date', confidence: 'high', label: 'WellSky Record Created Date' },
      { key: 'entrydate', confidence: 'high', label: 'WellSky Entry Date' },
      ...GENERIC_CREATED_ALIASES,
    ],
    occurrenceAliases: ['occurrencedate', 'occurrence_date', 'incidentdate', 'visitdate', 'servicedate', 'assessmentdate', 'oasisdate', 'socdate', 'pocdate', 'm0090', 'assessmentcompleteddate'],
    reportedAliases: ['reportedtoagencyat', 'reporteddate', 'datereported'],
    receivedAliases: ['receivedat', 'datereceived'],
    allowUploadTimestampFallback: false,
    agencyTimezone: AGENCY_TZ,
  },
  care_indeed: {
    sourceSystem: 'care_indeed',
    label: 'Care Indeed operational system',
    createdDateAliases: [
      ...CANONICAL_CREATED_ALIASES,
      { key: 'createdat', confidence: 'high', label: 'Care Indeed createdAt' },
      { key: 'recordcreatedat', confidence: 'high', label: 'recordCreatedAt' },
      ...GENERIC_CREATED_ALIASES,
    ],
    occurrenceAliases: ['occurrencedate', 'incidentdate', 'visitdate', 'servicedate', 'assessmentdate', 'oasisdate', 'pocdate'],
    reportedAliases: ['reportedtoagencyat', 'reporteddate', 'datereported'],
    receivedAliases: ['receivedat', 'datereceived'],
    allowUploadTimestampFallback: false,
    agencyTimezone: AGENCY_TZ,
  },
  manual: {
    sourceSystem: 'manual',
    label: 'Manual upload',
    createdDateAliases: [
      ...CANONICAL_CREATED_ALIASES,
      ...GENERIC_CREATED_ALIASES,
    ],
    occurrenceAliases: ['occurrencedate', 'incidentdate', 'visitdate', 'servicedate', 'assessmentdate', 'oasisdate', 'pocdate'],
    reportedAliases: ['reportedtoagencyat', 'reporteddate', 'datereported'],
    receivedAliases: ['receivedat', 'datereceived'],
    // A manually-uploaded document with no embedded created date is dated at
    // ingest time (matches existing server/ia/brad/uploads.ts semantics).
    allowUploadTimestampFallback: true,
    agencyTimezone: AGENCY_TZ,
  },
  unknown: {
    sourceSystem: 'unknown',
    label: 'Unknown source',
    createdDateAliases: [
      ...CANONICAL_CREATED_ALIASES,
      { key: 'createddate', confidence: 'high', label: 'CreatedDate' },
      { key: 'recordcreateddate', confidence: 'high', label: 'Record Created Date' },
      ...GENERIC_CREATED_ALIASES,
    ],
    occurrenceAliases: ['occurrencedate', 'incidentdate', 'visitdate', 'servicedate', 'assessmentdate', 'oasisdate', 'pocdate'],
    reportedAliases: ['reportedtoagencyat', 'reporteddate', 'datereported'],
    receivedAliases: ['receivedat', 'datereceived'],
    allowUploadTimestampFallback: false,
    agencyTimezone: AGENCY_TZ,
  },
};

export function getSourceProfile(sourceSystem: SourceSystem | string | null | undefined): SourceProfile {
  const key = String(sourceSystem ?? 'unknown').toLowerCase() as SourceSystem;
  return SOURCE_PROFILES[key] ?? SOURCE_PROFILES.unknown;
}

/** Normalize a field name / column header for alias matching. */
export function normalizeFieldKey(name: string): string {
  return String(name ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}
