import type {
  EditChangeType,
  EditImpactDimensionKey,
  EditMateriality,
  PacketEditImpactAnalysis,
} from './impactAnalysis';
import type { PacketScopedDiff } from './diffService';

export type BradInvolvement = 'not-involved' | 'consulted' | 'approved' | 'rejected';

export interface PacketVersionEditor {
  readonly id: string;
  readonly name: string;
  readonly role: string;
}

export interface PacketVersionImpactFlags {
  readonly approvalStaled: boolean;
  readonly signatureRequirementsChanged: boolean;
  readonly hashChanged: boolean;
  readonly eCignEnvelopeCancelOrVoidRequired: boolean;
  readonly affectedDimensions: readonly EditImpactDimensionKey[];
}

export interface PacketVersionChangeRecord {
  readonly versionId: string;
  readonly previousVersionId: string;
  readonly packetInstanceId: string;
  readonly editor: PacketVersionEditor;
  readonly timestamp: string;
  readonly changeType: EditChangeType;
  readonly targetPath: string;
  readonly before: unknown;
  readonly after: unknown;
  readonly reason: string;
  readonly sourceIds: readonly string[];
  readonly bradInvolvement: BradInvolvement;
  readonly materiality: EditMateriality;
  readonly impact: PacketVersionImpactFlags;
  readonly diffs: readonly PacketScopedDiff[];
}

export interface CreateVersionHistoryRecordInput {
  readonly versionId: string;
  readonly previousVersionId: string;
  readonly packetInstanceId: string;
  readonly editor: PacketVersionEditor;
  readonly timestamp: string | Date;
  readonly changeType: EditChangeType;
  readonly targetPath: string;
  readonly before: unknown;
  readonly after: unknown;
  readonly reason: string;
  readonly sourceIds?: readonly string[];
  readonly bradInvolvement?: BradInvolvement;
  readonly impactAnalysis: PacketEditImpactAnalysis;
  readonly diffs?: readonly PacketScopedDiff[];
}

function isoTimestamp(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function createVersionHistoryRecord(input: CreateVersionHistoryRecordInput): PacketVersionChangeRecord {
  const affectedDimensions = input.impactAnalysis.envelopeSignal.affectedDimensions;

  return {
    versionId: input.versionId,
    previousVersionId: input.previousVersionId,
    packetInstanceId: input.packetInstanceId,
    editor: input.editor,
    timestamp: isoTimestamp(input.timestamp),
    changeType: input.changeType,
    targetPath: input.targetPath,
    before: input.before,
    after: input.after,
    reason: input.reason,
    sourceIds: input.sourceIds ?? [],
    bradInvolvement: input.bradInvolvement ?? 'not-involved',
    materiality: input.impactAnalysis.materiality,
    impact: {
      approvalStaled: input.impactAnalysis.stalePriorApproval,
      signatureRequirementsChanged: input.impactAnalysis.dimensions.signers.affected,
      hashChanged: input.impactAnalysis.dimensions.hashes.affected,
      eCignEnvelopeCancelOrVoidRequired: input.impactAnalysis.envelopeSignal.cancelOrVoidRequired,
      affectedDimensions,
    },
    diffs: input.diffs ?? [],
  };
}

export function appendVersionHistoryRecord(
  history: readonly PacketVersionChangeRecord[],
  record: PacketVersionChangeRecord,
): readonly PacketVersionChangeRecord[] {
  return [...history, record];
}

export function recordsForPacket(
  history: readonly PacketVersionChangeRecord[],
  packetInstanceId: string,
): readonly PacketVersionChangeRecord[] {
  return history.filter((record) => record.packetInstanceId === packetInstanceId);
}
