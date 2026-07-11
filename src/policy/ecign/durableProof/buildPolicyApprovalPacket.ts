/**
 * Build a policy approval packet with hard guardrails.
 * Does not invent signatures. Does not claim production immutability in dev mode.
 */
import { getPolicyBody, getPolicyContent } from '@/policy/data/policyContentMap';
import { sha256Text } from './hashText';
import {
  assertNotFakeProductionPass,
  ECIGN_PROOF_STORAGE_MODE,
  resolveProofLabel,
  type EcignProofStorageMode,
} from './storageMode';
import type { BuildPacketInput, PolicyApprovalPacket } from './types';

export class PolicyApprovalPacketError extends Error {
  readonly code:
    | 'missing_policy_body'
    | 'missing_body_hash'
    | 'pass_requires_signature'
    | 'production_pass_forbidden';
  constructor(
    code: PolicyApprovalPacketError['code'],
    message: string,
  ) {
    super(message);
    this.code = code;
    this.name = 'PolicyApprovalPacketError';
  }
}

function computeBodyHash(policyId: string): { bodyHash: string; byteLength: number; title: string } {
  const body = getPolicyBody(policyId);
  if (!body || !body.trim()) {
    throw new PolicyApprovalPacketError(
      'missing_policy_body',
      `Cannot export packet: no policy body for ${policyId}`,
    );
  }
  const bodyHash = sha256Text(body);
  const byteLength = new TextEncoder().encode(body).byteLength;
  const content = getPolicyContent(policyId);
  const title = content?.title ?? policyId;
  return { bodyHash, byteLength, title };
}

function packetPayloadForHash(packet: Omit<PolicyApprovalPacket, 'packetHash'>): string {
  // Stable subset for packetHash (exclude packetHash itself)
  return JSON.stringify({
    schemaVersion: packet.schemaVersion,
    storageMode: packet.storageMode,
    proofLabel: packet.proofLabel,
    policyId: packet.policyId,
    version: packet.version,
    body: packet.body,
    approval: packet.approval,
    signature: packet.signature,
    auditTrail: packet.auditTrail,
    printExportPointer: packet.printExportPointer,
    generatedAt: packet.generatedAt,
  });
}

/**
 * Build an in-memory policy approval packet.
 * - Requires real body content (hash derived).
 * - Cannot yield PRODUCTION_PASS outside production mode.
 * - Without signatureRef, max label is READY_FOR_REAL_SIGNATURE.
 */
export function buildPolicyApprovalPacket(input: BuildPacketInput): PolicyApprovalPacket {
  const storageMode: EcignProofStorageMode = input.storageMode ?? ECIGN_PROOF_STORAGE_MODE;
  const { bodyHash, byteLength, title: contentTitle } = computeBodyHash(input.policyId);
  if (!bodyHash) {
    throw new PolicyApprovalPacketError('missing_body_hash', 'body hash required');
  }

  const signatureRef = input.signatureRef?.trim() || null;
  const hasSignatureRef = Boolean(signatureRef);
  const packetPersisted = Boolean(input.packetPersisted);

  const proofLabel = resolveProofLabel({
    storageMode,
    hasBodyHash: true,
    hasSignatureRef,
    packetPersisted,
  });

  assertNotFakeProductionPass(proofLabel, storageMode);

  // Extra guard: never allow PRODUCTION_PASS / LOCAL_DURABLE_DEV_PROOF without signature
  if (
    (proofLabel === 'PRODUCTION_PASS' || proofLabel === 'LOCAL_DURABLE_DEV_PROOF') &&
    !hasSignatureRef
  ) {
    throw new PolicyApprovalPacketError(
      'pass_requires_signature',
      'Cannot mark durable proof without real signatureRef',
    );
  }

  const version = input.version ?? '1.0.0';
  const title = input.title || contentTitle;
  const generatedAt = input.generatedAt ?? new Date().toISOString();

  let approvalState: PolicyApprovalPacket['approval']['approvalState'] = 'unsigned';
  if (hasSignatureRef) approvalState = 'signed';
  else if (input.approvedBy) approvalState = 'approved_unsigned';

  const draft: Omit<PolicyApprovalPacket, 'packetHash'> = {
    schemaVersion: 'policy-approval-packet/v1',
    storageMode,
    proofLabel,
    policyId: input.policyId,
    version,
    title,
    generatedAt,
    body: {
      algorithm: 'sha256',
      bodyHash,
      byteLength,
      source: 'policyContentMap.getPolicyBody',
    },
    approval: {
      policyId: input.policyId,
      title,
      version,
      lifecycleState: input.lifecycleState ?? null,
      approvedBy: input.approvedBy ?? null,
      approvedDate: input.approvedDate ?? null,
      effectiveDate: input.effectiveDate ?? null,
      approvalState,
    },
    signature: {
      signatureRef,
      signerIdentity: input.signer ?? null,
      signedAt: input.signedAt ?? null,
    },
    auditTrail: input.auditTrail ?? [
      {
        at: generatedAt,
        action: 'packet_built',
        detail: hasSignatureRef
          ? 'Packet built with provided signatureRef'
          : 'Packet skeleton built; awaiting real signature',
      },
    ],
    printExportPointer: {
      kind: 'policy_print_route',
      pathHint: `/library?policy=${encodeURIComponent(input.policyId)}#print`,
    },
    notes: [
      storageMode === 'local_durable_dev'
        ? 'LOCAL_DURABLE_DEV — not production immutable storage'
        : storageMode === 'production'
          ? 'production storage mode (requires real infrastructure)'
          : 'demo mode — not durable',
      hasSignatureRef
        ? 'signatureRef supplied by caller — not invented by builder'
        : 'unsigned — READY_FOR_REAL_SIGNATURE only',
    ],
  };

  const packetHash = sha256Text(packetPayloadForHash(draft));
  return { ...draft, packetHash };
}

/** Prepare readiness without any signature (honest READY_FOR_REAL_SIGNATURE). */
export function prepareReadyForRealSignature(policyId: string, title?: string) {
  const packet = buildPolicyApprovalPacket({
    policyId,
    title: title ?? policyId,
    packetPersisted: false,
    signatureRef: null,
  });
  return {
    policyId,
    title: packet.title,
    version: packet.version,
    bodyHash: packet.body.bodyHash,
    bodyByteLength: packet.body.byteLength,
    printExportPointer: packet.printExportPointer.pathHint,
    status: packet.proofLabel,
    preparedAt: packet.generatedAt,
    signatureRef: null as string | null,
    notes: packet.notes,
    packetSkeleton: packet,
  };
}
