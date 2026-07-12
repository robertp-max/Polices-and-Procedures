import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import {
  resolveDriveDestination,
  type DriveDestinationBindings,
} from '@/policy/packets/registries/driveDestinations';
import type {
  DriveArtifactPointer,
  DriveDestination,
  DriveDestinationRequest,
  PacketDriveConnector,
  PacketSidecarPayload,
  PriorPacketLookupResult,
  PriorPacketQuery,
  PublishArtifactsRequest,
  PublishArtifactsResult,
  ReadSidecarRequest,
  SidecarArtifactKind,
  VerifyArtifactHashRequest,
  VerifyArtifactHashResult,
} from '@/policy/packets/contracts';
import { looksLikePhiName, sanitizeFileName, sanitizeName } from '../../googleEvidence.js';
import {
  FolderManifestIndex,
  type FolderManifestArtifact,
  type FolderManifestEntry,
  type FolderManifestPacketStatus,
} from './folderManifest.js';

export const LOCAL_DRIVE_ROOT_LOCK = {
  storageProvider: 'file_local',
  lockFileName: '.packet-drive-local.lock.json',
  defaultRelativeRoot: '.cache/drive-local',
  schemaVersion: 1,
} as const;

const REQUIRED_LOCAL_ARTIFACT_TYPES = [
  'pdf',
  'analysis',
  'kpis',
  'workflows',
  'manifest',
  'audit',
] as const satisfies readonly DriveArtifactPointer['artifactType'][];

const SIDECAR_KINDS = ['analysis', 'kpis', 'workflows', 'manifest', 'audit'] as const;

interface LocalDriveRootLockFile {
  schemaVersion: typeof LOCAL_DRIVE_ROOT_LOCK.schemaVersion;
  storageProvider: typeof LOCAL_DRIVE_ROOT_LOCK.storageProvider;
  root: string;
}

interface DecodedArtifact {
  artifactType: DriveArtifactPointer['artifactType'];
  fileName: string;
  mimeType: string;
  bytes: Buffer;
  sha256: string;
  classification: string;
  retentionRule: string;
}

type SidecarMap = Partial<Record<SidecarArtifactKind, PacketSidecarPayload>>;
type JsonObject = Record<string, unknown>;

export class LocalDriveAdapter implements PacketDriveConnector {
  private readonly cacheRoot: string;
  private readonly manifest: FolderManifestIndex;

  constructor(cacheRoot: string = defaultLocalDriveCacheRoot()) {
    this.cacheRoot = resolveLocalDriveRoot(cacheRoot);
    assertSafeLocalDriveRoot(this.cacheRoot);
    ensureRootLock(this.cacheRoot);
    this.manifest = new FolderManifestIndex(this.cacheRoot);
  }

  async resolveDestination(request: DriveDestinationRequest): Promise<DriveDestination> {
    assertRootLock(this.cacheRoot);
    const resolved = resolveDriveDestination(
      request.destinationTemplate,
      buildDestinationBindings(request),
    );
    const pathSegments = resolved.split('/').map((segment) => safePathSegment(segment));
    const driveFolderId = buildLocalDriveId('folder', pathSegments.join('/'));
    return {
      driveFolderId,
      driveFolderUrl: localFolderUrl(driveFolderId),
      pathSegments,
    };
  }

  async publishArtifacts(request: PublishArtifactsRequest): Promise<PublishArtifactsResult> {
    assertRootLock(this.cacheRoot);
    const decoded = decodeArtifacts(request);
    assertRequiredArtifactSet(decoded);
    assertUniqueLocalPaths(request.destination.pathSegments, decoded);
    const sidecars = parseSidecars(decoded);
    validateSidecarHeaders(sidecars, request);
    const fingerprint = artifactSetFingerprint(request);
    const existing = this.manifest.findPacket(request.packetInstanceId, request.packetVersion);
    if (existing && existing.artifactSetFingerprint !== fingerprint) {
      throw new Error(
        `Idempotency conflict for packet ${request.packetInstanceId} v${request.packetVersion}: artifact set differs from the manifest index.`,
      );
    }

    const publishedAt = existing?.publishedAt ?? new Date().toISOString();
    const folderPath = localFolderPath(this.cacheRoot, request.destination.pathSegments);
    fs.mkdirSync(folderPath, { recursive: true });
    const pointers = decoded.map((artifact) =>
      buildPointer(request, artifact, publishedAt),
    );
    const manifestArtifacts = decoded.map((artifact, index) =>
      buildManifestArtifact(request.destination.pathSegments, artifact, pointers[index]!),
    );

    for (const artifact of decoded) {
      const file = localArtifactPath(this.cacheRoot, request.destination.pathSegments, artifact.fileName);
      writeFileAtomic(file, artifact.bytes);
      const actualSha256 = sha256Hex(artifact.bytes);
      if (actualSha256 !== artifact.sha256) {
        throw new Error(`Hash verification failed after writing ${artifact.fileName}.`);
      }
    }

    const entry = buildFolderManifestEntry(
      request,
      sidecars,
      manifestArtifacts,
      pointers,
      fingerprint,
      publishedAt,
    );
    this.manifest.upsert(entry);

    return {
      idempotentReplay: existing !== null,
      pointers,
      publishedAt,
    };
  }

  async findPriorPacket(query: PriorPacketQuery): Promise<PriorPacketLookupResult> {
    assertRootLock(this.cacheRoot);
    return this.manifest.findPriorPacket(query);
  }

  async readSidecar(request: ReadSidecarRequest): Promise<PacketSidecarPayload | null> {
    assertRootLock(this.cacheRoot);
    const lookup = request.driveFileId
      ? this.manifest.findArtifactByFileId(request.driveFileId)
      : this.manifest.findArtifactByPacketAndType(request.packetInstanceId, request.sidecarKind);
    if (!lookup || !isSidecarKind(lookup.artifact.artifactType)) return null;
    if (lookup.artifact.artifactType !== request.sidecarKind) return null;
    const file = localRelativePath(this.cacheRoot, lookup.artifact.localRelativePath);
    if (!fs.existsSync(file)) return null;
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as PacketSidecarPayload;
    return parsed.kind === request.sidecarKind ? parsed : null;
  }

  async verifyArtifactHash(
    request: VerifyArtifactHashRequest,
  ): Promise<VerifyArtifactHashResult> {
    assertRootLock(this.cacheRoot);
    const lookup = this.manifest.findArtifactByFileId(request.driveFileId);
    if (!lookup) {
      return unknownHashResult(request);
    }
    const file = localRelativePath(this.cacheRoot, lookup.artifact.localRelativePath);
    if (!fs.existsSync(file)) {
      return unknownHashResult(request);
    }
    const actualSha256 = sha256Hex(fs.readFileSync(file));
    const match = actualSha256 === request.expectedSha256;
    return {
      driveFileId: request.driveFileId,
      expectedSha256: request.expectedSha256,
      actualSha256,
      match,
      status: match ? 'matched' : 'mismatched',
    };
  }
}

export function defaultLocalDriveCacheRoot(): string {
  return path.resolve(process.cwd(), LOCAL_DRIVE_ROOT_LOCK.defaultRelativeRoot);
}

export function buildLocalDriveId(kind: 'folder' | 'file', stableKey: string): string {
  return `local-${kind}-${sha256Hex(Buffer.from(stableKey, 'utf8')).slice(0, 32)}`;
}

function resolveLocalDriveRoot(root: string): string {
  return path.resolve(root);
}

function assertSafeLocalDriveRoot(root: string): void {
  if (!path.isAbsolute(root)) {
    throw new Error('Local Drive root must resolve to an absolute path.');
  }
  if (root === path.parse(root).root) {
    throw new Error('Local Drive root lock refuses to use a filesystem root.');
  }
}

function ensureRootLock(root: string): void {
  fs.mkdirSync(root, { recursive: true });
  const lockFile = path.join(root, LOCAL_DRIVE_ROOT_LOCK.lockFileName);
  const expected = expectedRootLock(root);
  if (!fs.existsSync(lockFile)) {
    writeJsonAtomic(lockFile, expected);
    return;
  }
  assertLockFileMatches(lockFile, expected);
}

function assertRootLock(root: string): void {
  const lockFile = path.join(root, LOCAL_DRIVE_ROOT_LOCK.lockFileName);
  if (!fs.existsSync(lockFile)) {
    throw new Error('Local Drive root lock missing; refusing packet Drive operation.');
  }
  assertLockFileMatches(lockFile, expectedRootLock(root));
}

function expectedRootLock(root: string): LocalDriveRootLockFile {
  return {
    schemaVersion: LOCAL_DRIVE_ROOT_LOCK.schemaVersion,
    storageProvider: LOCAL_DRIVE_ROOT_LOCK.storageProvider,
    root,
  };
}

function assertLockFileMatches(file: string, expected: LocalDriveRootLockFile): void {
  const actual = JSON.parse(fs.readFileSync(file, 'utf8')) as Partial<LocalDriveRootLockFile>;
  if (
    actual.schemaVersion !== expected.schemaVersion ||
    actual.storageProvider !== expected.storageProvider ||
    actual.root !== expected.root
  ) {
    throw new Error('Local Drive root lock mismatch; refusing packet Drive operation.');
  }
}

function buildDestinationBindings(request: DriveDestinationRequest): DriveDestinationBindings {
  const runtime = request as DriveDestinationRequest & JsonObject;
  const periodStart = request.reportingPeriodStart;
  const periodEnd = request.reportingPeriodEnd;
  return {
    agency_id: request.agencyId,
    agencyId: request.agencyId,
    archetype_id: request.archetypeId,
    archetypeId: request.archetypeId,
    packet_template_id: request.packetTemplateId,
    packetTemplateId: request.packetTemplateId,
    workflow_instance_id: request.workflowInstanceId,
    workflowInstanceId: request.workflowInstanceId,
    event_instance_id: request.eventInstanceId,
    eventInstanceId: request.eventInstanceId,
    reporting_period_start: periodStart,
    reportingPeriodStart: periodStart,
    reporting_period_end: periodEnd,
    reportingPeriodEnd: periodEnd,
    year: stringHint([runtime], ['year']) ?? yearFromReportingPeriod(periodStart, periodEnd),
    domain: stringHint([runtime], ['domain']) ?? deriveDomain(request.packetTemplateId),
    event_family_id:
      stringHint([runtime], ['event_family_id', 'eventFamilyId']) ?? request.workflowInstanceId,
    reporting_period:
      stringHint([runtime], ['reporting_period', 'reportingPeriod']) ??
      reportingPeriodLabel(periodStart, periodEnd, null),
    packet_instance_id: stringHint([runtime], ['packet_instance_id', 'packetInstanceId']),
    packet_version: numberOrStringHint([runtime], ['packet_version', 'packetVersion']),
  };
}

function yearFromReportingPeriod(start: string | null, end: string | null): string | undefined {
  const source = start ?? end;
  return source && /^\d{4}-\d{2}-\d{2}/.test(source) ? source.slice(0, 4) : undefined;
}

function deriveDomain(packetTemplateId: string): string | undefined {
  return /\bQAPI\b/i.test(packetTemplateId) ? 'QAPI' : undefined;
}

function reportingPeriodLabel(
  start: string | null,
  end: string | null,
  cadence: PriorPacketQuery['cadence'] | null,
): string | undefined {
  if (!start || !end) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}/.test(start) || !/^\d{4}-\d{2}-\d{2}/.test(end)) {
    return undefined;
  }
  const year = start.slice(0, 4);
  const month = Number(start.slice(5, 7));
  if (cadence === 'monthly' || (cadence === null && start.slice(0, 7) === end.slice(0, 7))) {
    return start.slice(0, 7);
  }
  const quarter = Math.floor((month - 1) / 3) + 1;
  if (cadence === 'quarterly' || cadence === null) {
    return `${year}-Q${quarter}`;
  }
  if (cadence === 'annual') {
    return year;
  }
  return `${start}_${end}`;
}

function safePathSegment(segment: string): string {
  if (looksLikePhiName(segment)) {
    throw new Error(`Drive path segment failed PHI guard: ${segment}`);
  }
  return sanitizeName(segment);
}

function decodeArtifacts(request: PublishArtifactsRequest): DecodedArtifact[] {
  return request.artifacts.map((artifact) => {
    const fileName = sanitizeFileName(artifact.fileName);
    if (looksLikePhiName(artifact.fileName) || looksLikePhiName(fileName)) {
      throw new Error(`Drive file name failed PHI guard: ${artifact.fileName}`);
    }
    if (artifact.bytesBase64 === null) {
      throw new Error(`Local Drive adapter requires bytesBase64 for ${artifact.fileName}.`);
    }
    const bytes = Buffer.from(artifact.bytesBase64, 'base64');
    const actualSha256 = sha256Hex(bytes);
    if (actualSha256 !== artifact.sha256) {
      throw new Error(`Hash mismatch for ${artifact.fileName}: declared sha256 does not match bytes.`);
    }
    return {
      artifactType: artifact.artifactType,
      fileName,
      mimeType: artifact.mimeType,
      bytes,
      sha256: artifact.sha256,
      classification: artifact.classification,
      retentionRule: artifact.retentionRule,
    };
  });
}

function assertRequiredArtifactSet(decoded: readonly DecodedArtifact[]): void {
  const seen = new Set<DriveArtifactPointer['artifactType']>();
  for (const artifact of decoded) {
    if (seen.has(artifact.artifactType)) {
      throw new Error(`Duplicate Drive artifact type: ${artifact.artifactType}.`);
    }
    seen.add(artifact.artifactType);
  }
  for (const required of REQUIRED_LOCAL_ARTIFACT_TYPES) {
    if (!seen.has(required)) {
      throw new Error(`Missing required packet Drive artifact: ${required}.`);
    }
  }
}

function assertUniqueLocalPaths(
  pathSegments: readonly string[],
  decoded: readonly DecodedArtifact[],
): void {
  const paths = new Set<string>();
  for (const artifact of decoded) {
    const relativePath = posixRelativePath(pathSegments, artifact.fileName);
    if (paths.has(relativePath)) {
      throw new Error(`Duplicate local Drive artifact path: ${relativePath}.`);
    }
    paths.add(relativePath);
  }
}

function parseSidecars(decoded: readonly DecodedArtifact[]): SidecarMap {
  const sidecars: SidecarMap = {};
  for (const artifact of decoded) {
    if (!isSidecarKind(artifact.artifactType)) continue;
    const parsed = JSON.parse(artifact.bytes.toString('utf8')) as unknown;
    if (!isJsonObject(parsed) || parsed.kind !== artifact.artifactType) {
      throw new Error(`Invalid ${artifact.artifactType} sidecar payload.`);
    }
    sidecars[artifact.artifactType] = parsed as unknown as PacketSidecarPayload;
  }
  return sidecars;
}

function validateSidecarHeaders(sidecars: SidecarMap, request: PublishArtifactsRequest): void {
  for (const required of SIDECAR_KINDS) {
    if (!sidecars[required]) {
      throw new Error(`Missing required packet sidecar payload: ${required}.`);
    }
  }
  const payloads = Object.values(sidecars);
  const first = payloads[0];
  if (!first) {
    throw new Error('No packet sidecar payloads were provided.');
  }
  for (const payload of payloads) {
    if (payload.packetInstanceId !== request.packetInstanceId) {
      throw new Error(`Sidecar packetInstanceId mismatch for ${payload.kind}.`);
    }
    if (payload.packetVersion !== request.packetVersion) {
      throw new Error(`Sidecar packetVersion mismatch for ${payload.kind}.`);
    }
    if (payload.packetHash !== request.contentHash) {
      throw new Error(`Sidecar packetHash mismatch for ${payload.kind}.`);
    }
    if (payload.agencyId !== first.agencyId) {
      throw new Error(`Sidecar agencyId mismatch for ${payload.kind}.`);
    }
    if (payload.sourceClassification !== first.sourceClassification) {
      throw new Error(`Sidecar sourceClassification mismatch for ${payload.kind}.`);
    }
  }
}

function buildPointer(
  request: PublishArtifactsRequest,
  artifact: DecodedArtifact,
  publishedAt: string,
): DriveArtifactPointer {
  const driveFileId = buildLocalDriveId(
    'file',
    `${request.destination.driveFolderId}/${artifact.fileName}`,
  );
  return {
    evidenceId: `${request.packetInstanceId}:${artifact.artifactType}`,
    packetInstanceId: request.packetInstanceId,
    artifactType: artifact.artifactType,
    driveFileId,
    driveFileUrl: localFileUrl(driveFileId),
    driveFolderId: request.destination.driveFolderId,
    driveFolderUrl: request.destination.driveFolderUrl,
    sha256: artifact.sha256,
    mimeType: artifact.mimeType,
    sizeBytes: artifact.bytes.byteLength,
    classification: artifact.classification,
    retentionRule: artifact.retentionRule,
    publishedAt,
    publishedBy: 'local-drive-adapter',
  };
}

function buildManifestArtifact(
  pathSegments: readonly string[],
  artifact: DecodedArtifact,
  pointer: DriveArtifactPointer,
): FolderManifestArtifact {
  return {
    artifactType: artifact.artifactType,
    fileName: artifact.fileName,
    localRelativePath: posixRelativePath(pathSegments, artifact.fileName),
    pointer,
  };
}

function buildFolderManifestEntry(
  request: PublishArtifactsRequest,
  sidecars: SidecarMap,
  artifacts: FolderManifestArtifact[],
  pointers: DriveArtifactPointer[],
  artifactSetFingerprintValue: string,
  publishedAt: string,
): FolderManifestEntry {
  const header = requireSidecar(sidecars, 'analysis');
  const kpis = requireSidecar(sidecars, 'kpis');
  const workflows = requireSidecar(sidecars, 'workflows');
  const audit = requireSidecar(sidecars, 'audit');
  const hintSources = (Object.values(sidecars) as unknown[]).filter(isJsonObject);
  const packetStatus = derivePacketStatus(hintSources, audit);
  const workflowFamily =
    stringHint(hintSources, ['canonical_workflow_family', 'canonicalWorkflowFamily']) ??
    workflows.workflows[0]?.workflowId;
  const reportingPeriod =
    stringHint(hintSources, ['reporting_period', 'reportingPeriod']) ??
    reportingPeriodLabel(kpis.reportingPeriodStart, kpis.reportingPeriodEnd, kpis.cadence);
  if (!packetStatus) {
    throw new Error('Folder manifest cannot derive packet_status; prior lookup refuses unknown status.');
  }
  if (!workflowFamily) {
    throw new Error('Folder manifest cannot derive canonical_workflow_family.');
  }
  if (!reportingPeriod) {
    throw new Error('Folder manifest cannot derive reporting_period.');
  }
  const pdf = artifacts.find((artifact) => artifact.artifactType === 'pdf') ?? null;
  return {
    packetInstanceId: request.packetInstanceId,
    packetVersion: request.packetVersion,
    contentHash: request.contentHash,
    idempotencyKey: request.idempotencyKey,
    artifactSetFingerprint: artifactSetFingerprintValue,
    agency_id: header.agencyId,
    packet_archetype_id: 'analytical-report',
    packet_template_family: 'QAPI',
    cadence: kpis.cadence,
    canonical_workflow_family: workflowFamily,
    reporting_period: reportingPeriod,
    packet_status: packetStatus,
    sourceClassification: header.sourceClassification,
    supersededByPacketInstanceId: nullableStringHint(hintSources, [
      'superseded_by_packet_instance_id',
      'supersededByPacketInstanceId',
    ]),
    kpiDefinitionVersion: kpis.kpiDefinitionVersion,
    kpiDefinitionsCompatible: booleanHint(hintSources, [
      'kpi_definitions_compatible',
      'kpiDefinitionsCompatible',
    ]),
    limitationDisclosure: stringHint(hintSources, [
      'limitation_disclosure',
      'limitationDisclosure',
      'comparabilityNotes',
    ]),
    driveFolderId: request.destination.driveFolderId,
    driveFolderUrl: request.destination.driveFolderUrl,
    drivePdfFileId: pdf?.pointer.driveFileId ?? null,
    drivePdfUrl: pdf?.pointer.driveFileUrl ?? null,
    pathSegments: [...request.destination.pathSegments],
    publishedAt,
    publishedBy: publishedBy(hintSources, audit),
    artifacts,
    pointers,
  };
}

function requireSidecar<K extends SidecarArtifactKind>(
  sidecars: SidecarMap,
  kind: K,
): Extract<PacketSidecarPayload, { kind: K }> {
  const payload = sidecars[kind];
  if (!payload || payload.kind !== kind) {
    throw new Error(`Missing ${kind} sidecar.`);
  }
  return payload as Extract<PacketSidecarPayload, { kind: K }>;
}

function derivePacketStatus(
  hintSources: readonly JsonObject[],
  audit: Extract<PacketSidecarPayload, { kind: 'audit' }>,
): FolderManifestPacketStatus | null {
  const hinted = stringHint(hintSources, ['packet_status', 'packetStatus']);
  const normalized = normalizePacketStatus(hinted);
  if (normalized) return normalized;
  const eventTypes = audit.events.map((event) => event.eventType.toLowerCase());
  if (eventTypes.some((eventType) => eventType.includes('superseded'))) return 'superseded';
  if (eventTypes.some((eventType) => eventType.includes('rejected'))) return 'rejected';
  if (eventTypes.some((eventType) => eventType.includes('voided'))) return 'voided';
  if (eventTypes.some((eventType) => eventType.includes('draft'))) return 'draft';
  if (eventTypes.some((eventType) => eventType.includes('certified-and-published'))) {
    return 'certified-and-published';
  }
  if (eventTypes.some((eventType) => eventType.includes('locked'))) return 'locked';
  return null;
}

function normalizePacketStatus(value: string | null): FolderManifestPacketStatus | null {
  if (value === null) return null;
  if (
    value === 'locked' ||
    value === 'certified-and-published' ||
    value === 'draft' ||
    value === 'rejected' ||
    value === 'voided' ||
    value === 'superseded'
  ) {
    return value;
  }
  return null;
}

function publishedBy(
  hintSources: readonly JsonObject[],
  audit: Extract<PacketSidecarPayload, { kind: 'audit' }>,
): string {
  return (
    stringHint(hintSources, ['published_by', 'publishedBy']) ??
    audit.events.find((event) => event.actorId !== null)?.actorId ??
    'local-drive-adapter'
  );
}

function artifactSetFingerprint(request: PublishArtifactsRequest): string {
  const rows = request.artifacts
    .map((artifact) => ({
      artifactType: artifact.artifactType,
      fileName: sanitizeFileName(artifact.fileName),
      mimeType: artifact.mimeType,
      sha256: artifact.sha256,
      classification: artifact.classification,
      retentionRule: artifact.retentionRule,
    }))
    .sort((a, b) => `${a.artifactType}:${a.fileName}`.localeCompare(`${b.artifactType}:${b.fileName}`));
  return sha256Hex(Buffer.from(JSON.stringify(rows), 'utf8'));
}

function localFolderPath(root: string, pathSegments: readonly string[]): string {
  return assertWithinRoot(root, path.join(root, ...pathSegments));
}

function localArtifactPath(root: string, pathSegments: readonly string[], fileName: string): string {
  return assertWithinRoot(root, path.join(root, ...pathSegments, fileName));
}

function localRelativePath(root: string, relativePath: string): string {
  return assertWithinRoot(root, path.join(root, ...relativePath.split('/')));
}

function assertWithinRoot(root: string, target: string): string {
  const resolved = path.resolve(target);
  const relative = path.relative(root, resolved);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Local Drive path escaped the locked cache root.');
  }
  return resolved;
}

function posixRelativePath(pathSegments: readonly string[], fileName: string): string {
  return [...pathSegments, fileName].join('/');
}

function writeFileAtomic(file: string, bytes: Buffer): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${randomUUID()}.tmp`;
  fs.writeFileSync(tmp, bytes);
  fs.renameSync(tmp, file);
}

function writeJsonAtomic(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

function sha256Hex(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function localFolderUrl(folderId: string): string {
  return `local-drive://folder/${folderId}`;
}

function localFileUrl(fileId: string): string {
  return `local-drive://file/${fileId}`;
}

function unknownHashResult(request: VerifyArtifactHashRequest): VerifyArtifactHashResult {
  return {
    driveFileId: request.driveFileId,
    expectedSha256: request.expectedSha256,
    actualSha256: null,
    match: false,
    status: 'unknown-not-recovered',
  };
}

function isSidecarKind(value: DriveArtifactPointer['artifactType']): value is SidecarArtifactKind {
  return (SIDECAR_KINDS as readonly string[]).includes(value);
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringHint(sources: readonly JsonObject[], keys: readonly string[]): string | null {
  for (const source of sources) {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
  }
  return null;
}

function nullableStringHint(sources: readonly JsonObject[], keys: readonly string[]): string | null {
  for (const source of sources) {
    for (const key of keys) {
      const value = source[key];
      if (value === null) return null;
      if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
  }
  return null;
}

function booleanHint(sources: readonly JsonObject[], keys: readonly string[]): boolean | null {
  for (const source of sources) {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'boolean') return value;
    }
  }
  return null;
}

function numberOrStringHint(
  sources: readonly JsonObject[],
  keys: readonly string[],
): string | number | undefined {
  for (const source of sources) {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string' && value.trim().length > 0) return value.trim();
    }
  }
  return undefined;
}
