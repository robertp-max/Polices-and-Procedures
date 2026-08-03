import { createHash } from 'node:crypto';
import { env } from '../env.js';
import { store as ecignStore } from '../ecign/store.js';
import { FileLocalPacketStore, type PacketMetadataStore } from '../packets/store.js';
import type { AccessClass, GovernanceMinutes, SourceAuthorityMetadata } from './contracts.js';

export interface ArtifactVerificationRequest {
  artifactId: string;
  organizationId: string;
  meetingId: string;
  actorId: string;
  requiredAccessClass: AccessClass;
  sourceMetadata: SourceAuthorityMetadata;
}

export interface VerifiedArtifact {
  artifactId: string;
  artifactVersion: string;
  contentSha256: string;
  organizationId: string;
  meetingId: string;
  sourceOwnerId: string;
  sourceCertified: boolean;
  sourcePosture: SourceAuthorityMetadata['posture'];
  asOf: string;
  dataThrough: string;
  retentionClass: SourceAuthorityMetadata['retentionClass'];
  legalHold: boolean;
  superseded: boolean;
  accessClass: AccessClass;
  adapter: string;
}

export interface ArtifactResolver {
  readonly name: string;
  verify(request: ArtifactVerificationRequest): Promise<VerifiedArtifact>;
}

export interface EcignVerification {
  instanceId: string;
  state: 'signed_locked';
  finalContentSha256: string;
  manifestSha256: string;
  signedAt: string;
  retentionUntil: string;
  signerUserIds: string[];
}

export interface EcignAdapter {
  readonly name: string;
  verifyFinalMinutes(minutes: GovernanceMinutes): Promise<EcignVerification | null>;
  verifySignatureArtifact(instanceId: string, signerMemberId: string): Promise<{ contentSha256: string; lockedAt: string } | null>;
}

const ACCESS_RANK: Record<AccessClass, number> = {
  public_published: 0,
  board_general: 1,
  committee_restricted: 2,
  patient_safety_restricted: 3,
  financial_confidential: 3,
  executive_session: 4,
  personnel_confidential: 5,
  compliance_investigation: 5,
  attorney_client_privileged: 6,
  attorney_work_product: 6,
};

function accessCompatible(required: AccessClass, actual: AccessClass): boolean {
  return ACCESS_RANK[actual] >= ACCESS_RANK[required];
}

/**
 * Packet Studio / DefenCIble metadata adapter. It fails closed when an artifact
 * cannot be resolved to an authoritative packet record with a content hash.
 */
export class CareIndeedPacketArtifactResolver implements ArtifactResolver {
  readonly name = 'care-indeed-packet-store-v1';

  constructor(private readonly packets: PacketMetadataStore = new FileLocalPacketStore(env.packetStoreCacheRoot)) {}

  async verify(request: ArtifactVerificationRequest): Promise<VerifiedArtifact> {
    const packet = await this.packets.getById(request.artifactId);
    if (!packet) throw new Error('Artifact does not exist in Packet Studio.');
    if (packet.agencyId !== request.organizationId) throw new Error('Artifact organization does not match the Board record.');
    if (packet.eventInstanceId !== request.meetingId && packet.workflowInstanceId !== request.meetingId) {
      throw new Error('Artifact is not related to the meeting.');
    }
    if (!packet.contentHash || !/^[a-f0-9]{64}$/i.test(packet.contentHash)) {
      throw new Error('Artifact has no verified content SHA-256.');
    }
    if (packet.sourceClassification !== 'production') {
      throw new Error(`Artifact classification is ${packet.sourceClassification ?? 'unknown'}, not production.`);
    }
    if (packet.status === 'SUPERSEDED' || packet.supersededByPacketInstanceId) {
      throw new Error('Artifact has been superseded.');
    }
    if (!request.sourceMetadata.ownerId || !request.sourceMetadata.asOf || !request.sourceMetadata.dataThrough) {
      throw new Error('Source owner, as-of, and data-through metadata are required.');
    }
    if (!accessCompatible(request.requiredAccessClass, request.sourceMetadata.accessClass)) {
      throw new Error('Artifact access classification is incompatible with the Board-book section.');
    }
    return {
      artifactId: packet.packetInstanceId,
      artifactVersion: String(packet.packetVersion),
      contentSha256: packet.contentHash,
      organizationId: packet.agencyId,
      meetingId: request.meetingId,
      sourceOwnerId: request.sourceMetadata.ownerId,
      sourceCertified: request.sourceMetadata.approvalStatus === 'approved',
      sourcePosture: request.sourceMetadata.posture,
      asOf: request.sourceMetadata.asOf,
      dataThrough: request.sourceMetadata.dataThrough,
      retentionClass: request.sourceMetadata.retentionClass,
      legalHold: request.sourceMetadata.legalHold,
      superseded: false,
      accessClass: request.sourceMetadata.accessClass,
      adapter: this.name,
    };
  }
}

export class CareIndeedEcignAdapter implements EcignAdapter {
  readonly name = 'care-indeed-ecign-v1';

  async verifyFinalMinutes(minutes: GovernanceMinutes): Promise<EcignVerification | null> {
    if (!minutes.ecignInstanceId || !minutes.approvedContentSha256) return null;
    const instance = await ecignStore.getInstance(minutes.ecignInstanceId);
    if (!instance || instance.state !== 'signed_locked') return null;
    if (!instance.document_hash || !instance.manifest_hash || !instance.locked_at_utc || !instance.retention_until_utc) return null;
    if (instance.document_hash !== minutes.approvedContentSha256) return null;
    const signatures = await ecignStore.listSignatures(instance.instance_id);
    const signerUserIds = [...new Set(signatures.map((signature) => signature.signer_user_id))].sort();
    if (!minutes.requiredSignerMemberIds.every((memberId) => signerUserIds.includes(memberId))) return null;
    return {
      instanceId: instance.instance_id,
      state: 'signed_locked',
      finalContentSha256: instance.document_hash,
      manifestSha256: instance.manifest_hash,
      signedAt: instance.locked_at_utc,
      retentionUntil: instance.retention_until_utc,
      signerUserIds,
    };
  }

  async verifySignatureArtifact(instanceId: string, signerMemberId: string): Promise<{ contentSha256: string; lockedAt: string } | null> {
    const instance = await ecignStore.getInstance(instanceId);
    if (!instance || instance.state !== 'signed_locked' || !instance.document_hash || !instance.locked_at_utc) return null;
    const signatures = await ecignStore.listSignatures(instance.instance_id);
    if (!signatures.some((signature) => signature.signer_user_id === signerMemberId)) return null;
    return { contentSha256: instance.document_hash, lockedAt: instance.locked_at_utc };
  }
}

export function manifestSha256(value: unknown): string {
  const canonical = (item: unknown): string => {
    if (item === null || typeof item !== 'object') return JSON.stringify(item);
    if (Array.isArray(item)) return `[${item.map(canonical).join(',')}]`;
    const object = item as Record<string, unknown>;
    return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${canonical(object[key])}`).join(',')}}`;
  };
  return createHash('sha256').update(canonical(value)).digest('hex');
}
