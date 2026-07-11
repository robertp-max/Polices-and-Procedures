import type { EcignProofStorageMode, PacketProofLabel } from './storageMode';

export interface PolicyApprovalActor {
  userId: string;
  name: string;
  email?: string;
  role: string;
}

export interface PolicyApprovalMetadata {
  policyId: string;
  title: string;
  version: string;
  lifecycleState: string | null;
  approvedBy: string | null;
  approvedDate: string | null;
  effectiveDate: string | null;
  approvalState: 'unsigned' | 'approved_unsigned' | 'signed';
}

export interface PolicyBodyHashMeta {
  algorithm: 'sha256';
  bodyHash: string;
  byteLength: number;
  source: 'policyContentMap.getPolicyBody';
}

export interface SignatureMetadata {
  /** Real signature reference only — never invent. null if unsigned. */
  signatureRef: string | null;
  signerIdentity: PolicyApprovalActor | null;
  signedAt: string | null;
}

export interface AuditTrailEntry {
  at: string;
  action: string;
  actor?: string;
  detail?: string;
}

export interface PolicyApprovalPacket {
  /** Schema version for the packet contract */
  schemaVersion: 'policy-approval-packet/v1';
  /** Always explicit — never silent production */
  storageMode: EcignProofStorageMode;
  proofLabel: PacketProofLabel;
  policyId: string;
  version: string;
  title: string;
  generatedAt: string;
  body: PolicyBodyHashMeta;
  approval: PolicyApprovalMetadata;
  signature: SignatureMetadata;
  auditTrail: AuditTrailEntry[];
  printExportPointer: {
    kind: 'policy_print_route' | 'none';
    pathHint: string;
  };
  packetHash: string;
  notes: string[];
}

export interface BuildPacketInput {
  policyId: string;
  title: string;
  version?: string;
  lifecycleState?: string | null;
  approvedBy?: string | null;
  approvedDate?: string | null;
  effectiveDate?: string | null;
  /** Must be a real ref from eCign when claiming signed states — do not invent */
  signatureRef?: string | null;
  signer?: PolicyApprovalActor | null;
  signedAt?: string | null;
  auditTrail?: AuditTrailEntry[];
  storageMode?: EcignProofStorageMode;
  /** If true, treat as persisted (only after store write) */
  packetPersisted?: boolean;
  generatedAt?: string;
}

export interface ReadinessRecord {
  policyId: string;
  title: string;
  version: string;
  bodyHash: string;
  bodyByteLength: number;
  printExportPointer: string;
  status: PacketProofLabel;
  preparedAt: string;
  signatureRef: string | null;
  notes: string[];
}
