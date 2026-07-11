/**
 * Packet instance contracts — §16.3, §17.1, Appendix D packet-status vocabulary.
 * Pure types only. Zero runtime side effects.
 */

import type { PacketModuleId } from './archetype';

/**
 * Packet lifecycle status — §17.1 main path + alternate states.
 * SCREAMING_SNAKE vocabulary is the machine identity.
 */
export type PacketLifecycleStatus =
  /* Main path (§17.1) */
  | 'SOURCE_COLLECTION'
  | 'DRAFT_GENERATED'
  | 'UNDER_ANALYSIS'
  | 'READY_FOR_REVIEW'
  | 'UNDER_REVIEW'
  | 'EDITING'
  | 'VALIDATION_REQUIRED'
  | 'READY_FOR_APPROVAL'
  | 'APPROVED_FOR_SIGNATURE'
  | 'SIGNER_CONFIRMATION'
  | 'ECIGN_PREPARING'
  | 'SENT_FOR_SIGNATURE'
  | 'PARTIALLY_SIGNED'
  | 'FULLY_SIGNED'
  | 'SIGNED_PACKAGE_BUILDING'
  | 'CERTIFICATION_REVIEW'
  | 'CERTIFIED'
  | 'DRIVE_PUBLISHING'
  | 'PUBLISHED'
  | 'LOCKED'
  /* Alternate states (§17.1) */
  | 'BLOCKED'
  | 'RETURNED_FOR_CORRECTION'
  | 'SIGNATURE_DECLINED'
  | 'SIGNATURE_EXPIRED'
  | 'CANCELLED'
  | 'SUPERSEDED'
  | 'AMENDMENT_REQUIRED';

/**
 * Appendix D — Packet status vocabulary (display strings, EXACT PRD text).
 * Mapped 1:1 to §17.1 machine states where they exist; Appendix D omits
 * Signature declined / Signature expired (those remain machine-only alternates).
 */
export const APPENDIX_D_PACKET_STATUS_VOCABULARY = [
  'Source collection',
  'Draft generated',
  'Under analysis',
  'Ready for review',
  'Under review',
  'Editing',
  'Validation required',
  'Blocked',
  'Ready for approval',
  'Approved for signature',
  'Signer confirmation',
  'eCIgn preparing',
  'Sent for signature',
  'Partially signed',
  'Fully signed',
  'Signed package building',
  'Certification review',
  'Certified',
  'Drive publishing',
  'Published',
  'Locked',
  'Returned for correction',
  'Cancelled',
  'Superseded',
  'Amendment required',
] as const;

export type AppendixDPacketStatus = (typeof APPENDIX_D_PACKET_STATUS_VOCABULARY)[number];

/** Display mapping from §17.1 machine status → Appendix D label (where defined). */
export const PACKET_LIFECYCLE_TO_APPENDIX_D: Readonly<
  Partial<Record<PacketLifecycleStatus, AppendixDPacketStatus>>
> = {
  SOURCE_COLLECTION: 'Source collection',
  DRAFT_GENERATED: 'Draft generated',
  UNDER_ANALYSIS: 'Under analysis',
  READY_FOR_REVIEW: 'Ready for review',
  UNDER_REVIEW: 'Under review',
  EDITING: 'Editing',
  VALIDATION_REQUIRED: 'Validation required',
  BLOCKED: 'Blocked',
  READY_FOR_APPROVAL: 'Ready for approval',
  APPROVED_FOR_SIGNATURE: 'Approved for signature',
  SIGNER_CONFIRMATION: 'Signer confirmation',
  ECIGN_PREPARING: 'eCIgn preparing',
  SENT_FOR_SIGNATURE: 'Sent for signature',
  PARTIALLY_SIGNED: 'Partially signed',
  FULLY_SIGNED: 'Fully signed',
  SIGNED_PACKAGE_BUILDING: 'Signed package building',
  CERTIFICATION_REVIEW: 'Certification review',
  CERTIFIED: 'Certified',
  DRIVE_PUBLISHING: 'Drive publishing',
  PUBLISHED: 'Published',
  LOCKED: 'Locked',
  RETURNED_FOR_CORRECTION: 'Returned for correction',
  CANCELLED: 'Cancelled',
  SUPERSEDED: 'Superseded',
  AMENDMENT_REQUIRED: 'Amendment required',
};

/** Runtime status of a single module instance within a packet. */
export type PacketModuleInstanceStatus =
  | 'not_started'
  | 'in_progress'
  | 'complete'
  | 'not_applicable'
  | 'blocked'
  | 'stale';

/**
 * One module instance within a packet (§16.3 moduleInstances).
 * Payload typing is refined by PacketModel module instances.
 */
export interface PacketModuleInstance {
  moduleInstanceId: string;
  moduleId: PacketModuleId;
  status: PacketModuleInstanceStatus;
  /** Opaque payload for the operational instance; typed further in PacketModel. */
  payload: unknown;
  contentHash: string | null;
  order: number;
  updatedAt: string;
  updatedBy: string | null;
}

/** Runtime status of an attachment instance. */
export type PacketAttachmentInstanceStatus =
  | 'pending'
  | 'attached'
  | 'validated'
  | 'excluded'
  | 'superseded';

/** One attachment instance within a packet (§16.3 attachmentInstances). */
export interface PacketAttachmentInstance {
  attachmentInstanceId: string;
  attachmentTypeId: string;
  formInstanceId: string | null;
  evidenceId: string | null;
  title: string;
  mimeType: string | null;
  pageStart: number | null;
  pageEnd: number | null;
  confidentialityLevel: string;
  driveUrl: string | null;
  contentHash: string | null;
  status: PacketAttachmentInstanceStatus;
  createdAt: string;
  updatedAt: string;
}

/** §16.3 Packet instance — implement EXACTLY as specified, with implied extensions. */
export interface PacketInstance {
  packetInstanceId: string;
  packetId: string;
  packetVersion: number;
  agencyId: string;
  eventFamilyId: string;
  eventInstanceId: string;
  archetypeId: string;
  archetypeVersion: string;
  packetTemplateId: string;
  subtype: string | null;
  workflowId: string;
  workflowInstanceId: string;
  reportingPeriodStart: string | null;
  reportingPeriodEnd: string | null;
  dataThroughDate: string | null;
  status: PacketLifecycleStatus;
  moduleInstances: PacketModuleInstance[];
  attachmentInstances: PacketAttachmentInstance[];
  blockerIds: string[];
  warningIds: string[];
  approvalIds: string[];
  signatureIds: string[];
  evidenceManifestId: string;
  auditChronologyId: string;
  driveFolderUrl: string | null;
  finalArtifactUrl: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  certifiedAt: string | null;
  lockedAt: string | null;
  contentHash: string | null;
  supersedesPacketInstanceId: string | null;
  /** Implied by FR-005 / FR-023 — successor after amendment or supersession. */
  supersededByPacketInstanceId: string | null;
  /** Implied by FR-014 / source classification. */
  sourceClassification: 'production' | 'synthetic' | null;
}
