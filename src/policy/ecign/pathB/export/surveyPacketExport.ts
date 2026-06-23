/**
 * eCIgn Path B — Phase 2 (runtime reference): survey packet export.
 *
 * Assembles a survey-ready manifest from the REAL signed artifacts (canonical
 * sha/locator pulled from the store) plus the append-only audit chain. Pure data
 * assembly — no file/network I/O. Only a COMPLETE (locked / valid-evidence) packet
 * exports artifacts; an incomplete packet exports `complete: false` with none
 * ("incomplete = as good as not signed").
 */
import type { ArtifactId, ArtifactVersionId, AuditChainId, IsoTimestamp } from '../ids';
import type { SignedArtifactVersion, CanonicalStorageLocator } from '../artifactContracts';
import type { AuditEnvelope } from '../auditContracts';
import type { ArtifactState } from '../stateMachine';
import type { CanonicalArtifactStore } from '../storage/canonicalArtifactStore';
import { isValidEvidence } from '../retentionLifecycle';

export interface SurveyPacketVersionEntry {
  readonly artifactVersionId: ArtifactVersionId;
  readonly sha256: string;
  readonly byteLength: number;
  readonly locator: CanonicalStorageLocator;
  readonly signatureSequence: number;
}

export interface SurveyPacketExport {
  readonly artifactId: ArtifactId;
  readonly complete: boolean;
  readonly versions: readonly SurveyPacketVersionEntry[];
  readonly auditChainId: AuditChainId | null;
  readonly auditSequence: readonly number[];
  readonly generatedAt: IsoTimestamp;
}

export interface BuildSurveyPacketInput {
  readonly artifactId: ArtifactId;
  readonly state: ArtifactState;
  readonly signedChain: readonly SignedArtifactVersion[];
  readonly store: CanonicalArtifactStore;
  readonly auditEnvelopes: readonly AuditEnvelope[];
  readonly generatedAt: IsoTimestamp;
}

export function buildSurveyPacketExport(input: BuildSurveyPacketInput): SurveyPacketExport {
  const auditChainId = input.auditEnvelopes[0]?.auditChainId ?? null;
  const auditSequence = input.auditEnvelopes.map((a) => a.sequence);

  // Incomplete packets are not valid evidence — export nothing but the fact.
  if (!isValidEvidence(input.state)) {
    return {
      artifactId: input.artifactId,
      complete: false,
      versions: [],
      auditChainId,
      auditSequence,
      generatedAt: input.generatedAt,
    };
  }

  // Complete: pull the REAL canonical meta for each signed version from the store.
  const versions: SurveyPacketVersionEntry[] = input.signedChain.map((v) => {
    const meta = input.store.getMeta(v.artifactVersionId);
    return {
      artifactVersionId: v.artifactVersionId,
      sha256: meta.sha256,
      byteLength: meta.byteLength,
      locator: meta.locator,
      signatureSequence: v.signatureSequence,
    };
  });

  return {
    artifactId: input.artifactId,
    complete: true,
    versions,
    auditChainId,
    auditSequence,
    generatedAt: input.generatedAt,
  };
}
