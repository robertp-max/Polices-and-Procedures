import type { PacketInstancePatch, PacketStoreDocument } from '../../packets/store.js';

export const BRAD_PACKET_PROPOSED_PATCH_FIELDS = [
  'requestedChange',
  'existingContent',
  'proposedContent',
  'reason',
  'sources',
  'pagesAffected',
  'kpisAffected',
  'findingsAffected',
  'workflowsAffected',
  'formsAffected',
  'approvalsSignaturesAffected',
  'validationEffect',
  'regenerationRequirement',
] as const;

export const BRAD_PACKET_PATCH_UNKNOWN = 'Unknown — not recovered';
export const BRAD_PACKET_PATCH_HUMAN_REVIEW = 'Provisional — human review required';
export const BRAD_PACKET_PATCH_VALIDATION_REQUIRED = 'Validation required';

export type BradPacketProposedPatchField = (typeof BRAD_PACKET_PROPOSED_PATCH_FIELDS)[number];

export interface BradPacketPatchSource {
  sourceId: string | null;
  title: string;
  page: string | number | null;
  policyId: string | null;
  formId: string | null;
  evidenceId: string | null;
  url: string | null;
}

export type BradPacketProposedPatch = {
  requestedChange: string;
  existingContent: unknown;
  proposedContent: unknown;
  reason: string;
  sources: BradPacketPatchSource[];
  pagesAffected: string[];
  kpisAffected: string[];
  findingsAffected: string[];
  workflowsAffected: string[];
  formsAffected: string[];
  approvalsSignaturesAffected: string[];
  validationEffect: string;
  regenerationRequirement: string;
};

export interface BradPacketPatchProposalContent {
  kind: 'brad-packet-patch-proposal';
  packetInstanceId: string;
  packetRevision: number;
  requestedByUserId: string;
  proposedPatch: BradPacketProposedPatch;
  editPatch: PacketInstancePatch | null;
  applyEndpoint: string;
  createdAt: string;
}

export class BradPacketPatchValidationError extends Error {
  readonly code = 'brad_packet_patch_invalid' as const;
  readonly path: string;

  constructor(path: string, message: string) {
    super(message);
    this.name = 'BradPacketPatchValidationError';
    this.path = path;
  }
}

const EDIT_PATCH_FIELDS = new Set([
  'subtype',
  'eventFamilyId',
  'archetypeId',
  'archetypeVersion',
  'workflowId',
  'reportingPeriodStart',
  'reportingPeriodEnd',
  'dataThroughDate',
  'moduleInstances',
  'attachmentInstances',
  'blockerIds',
  'warningIds',
  'approvalIds',
  'signatureIds',
  'evidenceManifestId',
  'auditChronologyId',
  'driveFolderUrl',
  'finalArtifactUrl',
  'sourceClassification',
]);

function hasOwn(obj: Record<string, unknown>, field: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, field);
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BradPacketPatchValidationError(path, `${path} must be a JSON object.`);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BradPacketPatchValidationError(path, `${path} is required.`);
  }
  return value.trim();
}

function optionalString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return String(value);
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function stringArray(value: unknown, path: string): string[] {
  if (value === undefined || value === null) return [BRAD_PACKET_PATCH_UNKNOWN];
  if (!Array.isArray(value)) {
    throw new BradPacketPatchValidationError(path, `${path} must be an array.`);
  }
  const values = value.map((item) => String(item).trim()).filter(Boolean);
  return values.length > 0 ? values : [BRAD_PACKET_PATCH_UNKNOWN];
}

function normalizeSources(value: unknown): BradPacketPatchSource[] {
  if (value === undefined || value === null) {
    return [{
      sourceId: null,
      title: BRAD_PACKET_PATCH_UNKNOWN,
      page: null,
      policyId: null,
      formId: null,
      evidenceId: null,
      url: null,
    }];
  }
  if (!Array.isArray(value)) {
    throw new BradPacketPatchValidationError('sources', 'sources must be an array.');
  }
  return value.map((item, index) => {
    if (typeof item === 'string') {
      const title = item.trim();
      if (!title) {
        throw new BradPacketPatchValidationError(`sources.${index}`, 'source title is required.');
      }
      return {
        sourceId: null,
        title,
        page: null,
        policyId: null,
        formId: null,
        evidenceId: null,
        url: null,
      };
    }

    const source = asRecord(item, `sources.${index}`);
    const title =
      optionalString(source.title) ??
      optionalString(source.sourceId) ??
      optionalString(source.evidenceId) ??
      `Source ${index + 1}`;
    return {
      sourceId: optionalString(source.sourceId),
      title,
      page: source.page === undefined ? null : (source.page as string | number | null),
      policyId: optionalString(source.policyId),
      formId: optionalString(source.formId),
      evidenceId: optionalString(source.evidenceId),
      url: optionalString(source.url),
    };
  });
}

function packetExistingSummary(packet: PacketStoreDocument): Record<string, unknown> {
  return {
    packetInstanceId: packet.packetInstanceId,
    packetVersion: packet.packetVersion,
    revision: packet.revision,
    status: packet.status,
    blockerIds: packet.blockerIds,
    warningIds: packet.warningIds,
    approvalIds: packet.approvalIds,
    signatureIds: packet.signatureIds,
  };
}

export function extractPacketEditPatch(body: Record<string, unknown>): PacketInstancePatch | null {
  const raw = body.editPatch ?? body.packetPatch;
  if (raw === undefined || raw === null) return null;
  const editPatch = asRecord(raw, 'editPatch');
  const rejected = Object.keys(editPatch).filter((field) => !EDIT_PATCH_FIELDS.has(field));
  if (rejected.length > 0) {
    throw new BradPacketPatchValidationError(
      `editPatch.${rejected[0]}`,
      `Brad packet edits may not write field(s): ${rejected.join(', ')}.`,
    );
  }
  if (Object.keys(editPatch).length === 0) return null;
  return editPatch as PacketInstancePatch;
}

export function buildBradPacketProposedPatch(
  packet: PacketStoreDocument,
  body: Record<string, unknown>,
): BradPacketProposedPatch {
  const requestedChange = requiredString(
    body.requestedChange ?? body.request ?? body.prompt,
    'requestedChange',
  );
  return {
    requestedChange,
    existingContent: hasOwn(body, 'existingContent') ? body.existingContent : packetExistingSummary(packet),
    proposedContent: hasOwn(body, 'proposedContent') ? body.proposedContent : requestedChange,
    reason:
      optionalString(body.reason) ??
      BRAD_PACKET_PATCH_HUMAN_REVIEW,
    sources: normalizeSources(body.sources),
    pagesAffected: stringArray(body.pagesAffected, 'pagesAffected'),
    kpisAffected: stringArray(body.kpisAffected, 'kpisAffected'),
    findingsAffected: stringArray(body.findingsAffected, 'findingsAffected'),
    workflowsAffected: stringArray(body.workflowsAffected, 'workflowsAffected'),
    formsAffected: stringArray(body.formsAffected, 'formsAffected'),
    approvalsSignaturesAffected: stringArray(
      body.approvalsSignaturesAffected,
      'approvalsSignaturesAffected',
    ),
    validationEffect:
      optionalString(body.validationEffect) ??
      BRAD_PACKET_PATCH_HUMAN_REVIEW,
    regenerationRequirement:
      optionalString(body.regenerationRequirement) ??
      BRAD_PACKET_PATCH_VALIDATION_REQUIRED,
  };
}

export function buildBradPacketPatchProposalContent(input: {
  packet: PacketStoreDocument;
  requestedByUserId: string;
  body: Record<string, unknown>;
}): BradPacketPatchProposalContent {
  const proposedPatch = buildBradPacketProposedPatch(input.packet, input.body);
  return {
    kind: 'brad-packet-patch-proposal',
    packetInstanceId: input.packet.packetInstanceId,
    packetRevision: input.packet.revision,
    requestedByUserId: input.requestedByUserId,
    proposedPatch,
    editPatch: extractPacketEditPatch(input.body),
    applyEndpoint: `/api/packets/${input.packet.packetInstanceId}/edits`,
    createdAt: new Date().toISOString(),
  };
}

export function missingBradPacketProposedPatchFields(
  patch: Partial<BradPacketProposedPatch>,
): BradPacketProposedPatchField[] {
  return BRAD_PACKET_PROPOSED_PATCH_FIELDS.filter((field) => !hasOwn(patch, field));
}
