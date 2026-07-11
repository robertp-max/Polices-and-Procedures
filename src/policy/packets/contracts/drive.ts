/**
 * Drive artifact pointer + connector contracts — §14.2, §14.3, §16.7, FR-031.
 * Pure types only. Connector is an interface contract (no runtime impl here).
 */

import type { PacketSidecarPayload, SidecarArtifactKind } from './trends';

/** §16.7 Evidence / Drive artifact pointer — implement EXACTLY as specified. */
export interface DriveArtifactPointer {
  evidenceId: string;
  packetInstanceId: string;
  artifactType:
    | 'pdf'
    | 'analysis'
    | 'kpis'
    | 'workflows'
    | 'manifest'
    | 'audit'
    | 'signature-certificate';
  driveFileId: string;
  driveFileUrl: string;
  driveFolderId: string;
  driveFolderUrl: string;
  sha256: string;
  mimeType: string;
  sizeBytes: number;
  classification: string;
  retentionRule: string;
  publishedAt: string;
  publishedBy: string;
}

/**
 * §14.2 Prior-packet lookup identity.
 * Field names mirror the PRD lookup key.
 */
export interface PriorPacketQuery {
  agency_id: string;
  packet_archetype_id: 'analytical-report';
  packet_template_family: 'QAPI';
  cadence: 'monthly' | 'quarterly' | 'annual';
  canonical_workflow_family: string;
  prior_reporting_period: string;
  /** locked or certified-and-published only. */
  packet_status: 'locked' | 'certified-and-published';
  /** Always true for valid prior lookup — superseded packets excluded. */
  not_superseded: true;
}

/**
 * §14.3 Exclusion reasons — do not compare against these.
 */
export type PriorPacketExclusionReason =
  | 'another_cadence'
  | 'another_agency'
  | 'draft_rejected_or_voided'
  | 'superseded_by_newer_valid'
  | 'synthetic_versus_production'
  | 'incompatible_kpi_definitions_without_limitation_disclosure';

export interface PriorPacketExclusion {
  reason: PriorPacketExclusionReason;
  detail: string;
  excludedPacketInstanceId: string | null;
}

/** Result of findPriorPacket (§14.2 / §14.4). */
export interface PriorPacketLookupResult {
  found: boolean;
  packetInstanceId: string | null;
  driveFolderUrl: string | null;
  drivePdfUrl: string | null;
  contentHash: string | null;
  packetVersion: number | null;
  exclusions: PriorPacketExclusion[];
  /** Set when not found — never fabricate prior metrics. */
  notFoundBanner: string | null;
}

/** Deterministic Drive destination resolution input. */
export interface DriveDestinationRequest {
  agencyId: string;
  archetypeId: string;
  packetTemplateId: string;
  eventInstanceId: string;
  workflowInstanceId: string;
  reportingPeriodStart: string | null;
  reportingPeriodEnd: string | null;
  destinationTemplate: string;
}

export interface DriveDestination {
  driveFolderId: string;
  driveFolderUrl: string;
  pathSegments: string[];
}

/** Artifact publish request — must be idempotent (FR-031 / §18.9). */
export interface PublishArtifactsRequest {
  packetInstanceId: string;
  packetVersion: number;
  contentHash: string;
  idempotencyKey: string;
  destination: DriveDestination;
  artifacts: Array<{
    artifactType: DriveArtifactPointer['artifactType'];
    fileName: string;
    mimeType: string;
    bytesBase64: string | null;
    sha256: string;
    classification: string;
    retentionRule: string;
  }>;
}

export interface PublishArtifactsResult {
  idempotentReplay: boolean;
  pointers: DriveArtifactPointer[];
  publishedAt: string;
}

export interface ReadSidecarRequest {
  packetInstanceId: string;
  sidecarKind: SidecarArtifactKind;
  driveFileId: string | null;
}

export interface VerifyArtifactHashRequest {
  driveFileId: string;
  expectedSha256: string;
}

export interface VerifyArtifactHashResult {
  driveFileId: string;
  expectedSha256: string;
  actualSha256: string | null;
  match: boolean;
  /** When hash cannot be recovered, report unknown — never invent a match. */
  status: 'matched' | 'mismatched' | 'unknown-not-recovered';
}

/**
 * Packet Drive connector interface.
 * Implementations live outside this contracts package; this is the stable surface.
 */
export interface PacketDriveConnector {
  resolveDestination(request: DriveDestinationRequest): Promise<DriveDestination>;

  /** Idempotent publish — retries must not create duplicate Drive artifacts. */
  publishArtifacts(request: PublishArtifactsRequest): Promise<PublishArtifactsResult>;

  /** Prior-packet lookup per §14.2 query + §14.3 exclusions. */
  findPriorPacket(query: PriorPacketQuery): Promise<PriorPacketLookupResult>;

  readSidecar(request: ReadSidecarRequest): Promise<PacketSidecarPayload | null>;

  verifyArtifactHash(request: VerifyArtifactHashRequest): Promise<VerifyArtifactHashResult>;
}
