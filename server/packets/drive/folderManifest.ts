import fs from 'node:fs';
import path from 'node:path';
import {
  PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER,
  type DriveArtifactPointer,
  type PriorPacketExclusion,
  type PriorPacketLookupResult,
  type PriorPacketQuery,
  type SidecarPayloadHeader,
} from '@/policy/packets/contracts';

export const FOLDER_MANIFEST_FILE_NAME = 'folder-manifest.json' as const;
export const FOLDER_MANIFEST_SCHEMA_VERSION = 1 as const;

export type FolderManifestPacketStatus =
  | PriorPacketQuery['packet_status']
  | 'draft'
  | 'rejected'
  | 'voided'
  | 'superseded';

export interface FolderManifestArtifact {
  artifactType: DriveArtifactPointer['artifactType'];
  fileName: string;
  localRelativePath: string;
  pointer: DriveArtifactPointer;
}

export interface FolderManifestEntry {
  packetInstanceId: string;
  packetVersion: number;
  contentHash: string;
  idempotencyKey: string;
  artifactSetFingerprint: string;
  agency_id: string;
  packet_archetype_id: PriorPacketQuery['packet_archetype_id'];
  packet_template_family: PriorPacketQuery['packet_template_family'];
  cadence: PriorPacketQuery['cadence'];
  canonical_workflow_family: string;
  reporting_period: string;
  packet_status: FolderManifestPacketStatus;
  sourceClassification: SidecarPayloadHeader['sourceClassification'];
  supersededByPacketInstanceId: string | null;
  kpiDefinitionVersion: string | null;
  kpiDefinitionsCompatible: boolean | null;
  limitationDisclosure: string | null;
  driveFolderId: string;
  driveFolderUrl: string;
  drivePdfFileId: string | null;
  drivePdfUrl: string | null;
  pathSegments: string[];
  publishedAt: string;
  publishedBy: string;
  artifacts: FolderManifestArtifact[];
  pointers: DriveArtifactPointer[];
}

export interface FolderManifestDocument {
  schemaVersion: typeof FOLDER_MANIFEST_SCHEMA_VERSION;
  updatedAt: string | null;
  entries: FolderManifestEntry[];
}

export interface FolderManifestArtifactLookup {
  entry: FolderManifestEntry;
  artifact: FolderManifestArtifact;
}

export class FolderManifestIndex {
  private readonly manifestFile: string;
  private readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
    this.manifestFile = path.join(this.root, FOLDER_MANIFEST_FILE_NAME);
  }

  read(): FolderManifestDocument {
    if (!fs.existsSync(this.manifestFile)) {
      return emptyManifest();
    }
    const parsed = JSON.parse(fs.readFileSync(this.manifestFile, 'utf8')) as FolderManifestDocument;
    if (parsed.schemaVersion !== FOLDER_MANIFEST_SCHEMA_VERSION || !Array.isArray(parsed.entries)) {
      throw new Error('Invalid packet Drive folder manifest index.');
    }
    return parsed;
  }

  upsert(entry: FolderManifestEntry): FolderManifestDocument {
    const doc = this.read();
    const entries = doc.entries.filter(
      (existing) =>
        existing.packetInstanceId !== entry.packetInstanceId ||
        existing.packetVersion !== entry.packetVersion,
    );
    entries.push(entry);
    entries.sort((a, b) => {
      if (a.packetInstanceId !== b.packetInstanceId) {
        return a.packetInstanceId.localeCompare(b.packetInstanceId);
      }
      return a.packetVersion - b.packetVersion;
    });
    const next: FolderManifestDocument = {
      schemaVersion: FOLDER_MANIFEST_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      entries,
    };
    writeJsonAtomic(this.manifestFile, next);
    return next;
  }

  findPacket(packetInstanceId: string, packetVersion: number | null = null): FolderManifestEntry | null {
    const matches = this.read().entries.filter((entry) => {
      if (entry.packetInstanceId !== packetInstanceId) return false;
      return packetVersion === null || entry.packetVersion === packetVersion;
    });
    if (matches.length === 0) return null;
    matches.sort((a, b) => b.packetVersion - a.packetVersion);
    return matches[0] ?? null;
  }

  findArtifactByFileId(driveFileId: string): FolderManifestArtifactLookup | null {
    for (const entry of this.read().entries) {
      const artifact = entry.artifacts.find(
        (candidate) => candidate.pointer.driveFileId === driveFileId,
      );
      if (artifact) {
        return { entry, artifact };
      }
    }
    return null;
  }

  findArtifactByPacketAndType(
    packetInstanceId: string,
    artifactType: DriveArtifactPointer['artifactType'],
  ): FolderManifestArtifactLookup | null {
    const entry = this.findPacket(packetInstanceId);
    if (!entry) return null;
    const artifact = entry.artifacts.find((candidate) => candidate.artifactType === artifactType);
    return artifact ? { entry, artifact } : null;
  }

  findPriorPacket(query: PriorPacketQuery): PriorPacketLookupResult {
    return findPriorPacketInManifest(this.read().entries, query);
  }
}

export function findPriorPacketInManifest(
  entries: readonly FolderManifestEntry[],
  query: PriorPacketQuery,
): PriorPacketLookupResult {
  const exclusions = buildExclusions(entries, query);
  const valid = entries.filter((entry) => isValidPriorCandidate(entry, entries, query));
  valid.sort((a, b) => {
    if (a.packetVersion !== b.packetVersion) return b.packetVersion - a.packetVersion;
    return b.publishedAt.localeCompare(a.publishedAt);
  });
  const selected = valid[0] ?? null;
  if (!selected) {
    return {
      found: false,
      packetInstanceId: null,
      driveFolderUrl: null,
      drivePdfUrl: null,
      contentHash: null,
      packetVersion: null,
      exclusions,
      notFoundBanner: PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER,
    };
  }
  return {
    found: true,
    packetInstanceId: selected.packetInstanceId,
    driveFolderUrl: selected.driveFolderUrl,
    drivePdfUrl: selected.drivePdfUrl,
    contentHash: selected.contentHash,
    packetVersion: selected.packetVersion,
    exclusions,
    notFoundBanner: null,
  };
}

export function emptyManifest(): FolderManifestDocument {
  return {
    schemaVersion: FOLDER_MANIFEST_SCHEMA_VERSION,
    updatedAt: null,
    entries: [],
  };
}

function writeJsonAtomic(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

function isValidPriorCandidate(
  entry: FolderManifestEntry,
  entries: readonly FolderManifestEntry[],
  query: PriorPacketQuery,
): boolean {
  return (
    isBaseValidPriorCandidate(entry, query) &&
    !isSupersededByNewerValid(entry, entries, query)
  );
}

function buildExclusions(
  entries: readonly FolderManifestEntry[],
  query: PriorPacketQuery,
): PriorPacketExclusion[] {
  const exclusions: PriorPacketExclusion[] = [];
  for (const entry of entries) {
    if (isValidPriorCandidate(entry, entries, query)) continue;
    const reason = exclusionReason(entry, entries, query);
    if (!reason) continue;
    exclusions.push({
      reason,
      detail: exclusionDetail(entry, reason),
      excludedPacketInstanceId: entry.packetInstanceId,
    });
  }
  return exclusions;
}

function exclusionReason(
  entry: FolderManifestEntry,
  entries: readonly FolderManifestEntry[],
  query: PriorPacketQuery,
): PriorPacketExclusion['reason'] | null {
  if (entry.agency_id !== query.agency_id && matchesPriorIdentity(entry, query, ['agency_id'])) return 'another_agency';
  if (entry.cadence !== query.cadence && matchesPriorIdentity(entry, query, ['cadence'])) return 'another_cadence';
  if (!matchesPriorIdentity(entry, query, [])) return null;
  if (entry.packet_status === 'draft' || entry.packet_status === 'rejected' || entry.packet_status === 'voided') {
    return 'draft_rejected_or_voided';
  }
  if (isSupersededByNewerValid(entry, entries, query)) return 'superseded_by_newer_valid';
  if (isSuperseded(entry)) return 'superseded_by_newer_valid';
  if (entry.sourceClassification !== 'production') return 'synthetic_versus_production';
  if (entry.kpiDefinitionsCompatible === false) {
    return 'incompatible_kpi_definitions_without_limitation_disclosure';
  }
  return null;
}

function matchesPriorIdentity(
  entry: FolderManifestEntry,
  query: PriorPacketQuery,
  ignored: readonly string[],
): boolean {
  return (
    (ignored.includes('agency_id') || entry.agency_id === query.agency_id) &&
    entry.packet_archetype_id === query.packet_archetype_id &&
    entry.packet_template_family === query.packet_template_family &&
    (ignored.includes('cadence') || entry.cadence === query.cadence) &&
    entry.canonical_workflow_family === query.canonical_workflow_family &&
    entry.reporting_period === query.prior_reporting_period
  );
}

function isBaseValidPriorCandidate(entry: FolderManifestEntry, query: PriorPacketQuery): boolean {
  return (
    matchesPriorIdentity(entry, query, []) &&
    statusMatchesPriorQuery(entry.packet_status, query.packet_status) &&
    entry.sourceClassification === 'production' &&
    !isSuperseded(entry) &&
    entry.kpiDefinitionsCompatible !== false
  );
}

function isValidSuccessorCandidate(
  entry: FolderManifestEntry,
  query: PriorPacketQuery,
): boolean {
  return (
    matchesPriorIdentity(entry, query, []) &&
    statusMatchesPriorQuery(entry.packet_status, query.packet_status) &&
    entry.sourceClassification === 'production' &&
    !isSuperseded(entry) &&
    entry.kpiDefinitionsCompatible !== false
  );
}

function isSupersededByNewerValid(
  entry: FolderManifestEntry,
  entries: readonly FolderManifestEntry[],
  query: PriorPacketQuery,
): boolean {
  if (!isSuperseded(entry)) return false;
  return entries.some(
    (candidate) =>
      candidate.packetVersion > entry.packetVersion &&
      (entry.supersededByPacketInstanceId === null ||
        candidate.packetInstanceId === entry.supersededByPacketInstanceId) &&
      isValidSuccessorCandidate(candidate, query),
  );
}

function isSuperseded(entry: FolderManifestEntry): boolean {
  return entry.packet_status === 'superseded' || entry.supersededByPacketInstanceId !== null;
}

function statusMatchesPriorQuery(
  entryStatus: FolderManifestPacketStatus,
  queryStatus: PriorPacketQuery['packet_status'],
): boolean {
  if (isLockedOrCertified(queryStatus)) {
    return isLockedOrCertified(entryStatus);
  }
  return entryStatus === queryStatus;
}

function isLockedOrCertified(status: FolderManifestPacketStatus): boolean {
  return status === 'locked' || status === 'certified-and-published';
}

function exclusionDetail(
  entry: FolderManifestEntry,
  reason: PriorPacketExclusion['reason'],
): string {
  switch (reason) {
    case 'another_agency':
      return `Excluded ${entry.packetInstanceId}: agency_id ${entry.agency_id} does not match the query agency.`;
    case 'another_cadence':
      return `Excluded ${entry.packetInstanceId}: cadence ${entry.cadence} does not match the query cadence.`;
    case 'draft_rejected_or_voided':
      return `Excluded ${entry.packetInstanceId}: packet_status is ${entry.packet_status}.`;
    case 'superseded_by_newer_valid':
      return `Excluded ${entry.packetInstanceId}: supersededByPacketInstanceId is ${entry.supersededByPacketInstanceId ?? 'recorded as superseded'}.`;
    case 'synthetic_versus_production':
      return `Excluded ${entry.packetInstanceId}: sourceClassification is ${entry.sourceClassification}.`;
    case 'incompatible_kpi_definitions_without_limitation_disclosure':
      return `Excluded ${entry.packetInstanceId}: KPI definitions are marked incompatible.`;
  }
}
