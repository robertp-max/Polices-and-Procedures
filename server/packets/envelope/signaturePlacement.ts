export const SIGNATURE_PLACEMENT_FIELD_KINDS = ["signature", "initial", "date", "name"] as const;

export type SignaturePlacementFieldKind = (typeof SIGNATURE_PLACEMENT_FIELD_KINDS)[number];

export interface SignaturePlacementSigner {
  id: string;
  role?: string;
  routingOrder?: number;
}

export interface SignaturePlacementField {
  id?: string;
  signerId?: string;
  role?: string;
  kind?: SignaturePlacementFieldKind;
  page?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  required?: boolean;
  label?: string;
}

export interface SignaturePlacementDocument {
  formId: string;
  formInstanceId?: string;
  title?: string;
  pageCount?: number;
  fields?: readonly SignaturePlacementField[];
}

export interface SignaturePlacementEntry {
  id: string;
  formId: string;
  formInstanceId: string;
  signerId: string;
  kind: SignaturePlacementFieldKind;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
  label: string;
}

export interface SignaturePlacementMap {
  envelopeId: string;
  contentHash: string;
  createdAt: string;
  placements: readonly SignaturePlacementEntry[];
}

export interface BuildSignaturePlacementMapInput {
  envelopeId: string;
  contentHash: string;
  createdAt: string;
  documents: readonly SignaturePlacementDocument[];
  signers: readonly SignaturePlacementSigner[];
}

const defaultFieldWidth = 180;
const defaultFieldHeight = 32;
const defaultLeft = 72;
const defaultTop = 96;
const defaultGap = 48;

export function buildSignaturePlacementMap(input: BuildSignaturePlacementMapInput): SignaturePlacementMap {
  if (input.envelopeId.trim() === "") {
    throw new Error("Signature placement requires an envelope id.");
  }
  if (input.contentHash.trim() === "") {
    throw new Error("Signature placement requires a content hash.");
  }
  if (input.documents.length === 0) {
    throw new Error("Signature placement requires at least one document.");
  }
  if (input.signers.length === 0) {
    throw new Error("Signature placement requires at least one signer.");
  }

  const placements = input.documents.flatMap((document) => placementsForDocument(document, input.signers));

  return {
    envelopeId: input.envelopeId,
    contentHash: input.contentHash,
    createdAt: input.createdAt,
    placements,
  };
}

function placementsForDocument(
  document: SignaturePlacementDocument,
  signers: readonly SignaturePlacementSigner[],
): readonly SignaturePlacementEntry[] {
  const formInstanceId = document.formInstanceId ?? document.formId;
  const pageCount = readPositiveInteger(document.pageCount, `Document ${document.formId} requires a page count.`);
  const sortedSigners = [...signers].sort(compareSigners);

  return sortedSigners.flatMap((signer, signerIndex) => {
    const explicitFields = (document.fields ?? []).filter((field) => fieldBelongsToSigner(field, signer));
    const fields = explicitFields.length > 0 ? explicitFields : [defaultSignatureField(pageCount, signerIndex)];

    return fields.map((field, fieldIndex) =>
      normalizeField(document.formId, formInstanceId, pageCount, signer, field, fieldIndex),
    );
  });
}

function defaultSignatureField(pageCount: number, signerIndex: number): SignaturePlacementField {
  return {
    kind: "signature",
    page: pageCount,
    x: defaultLeft,
    y: defaultTop + signerIndex * defaultGap,
    width: defaultFieldWidth,
    height: defaultFieldHeight,
    required: true,
    label: "Signature",
  };
}

function normalizeField(
  formId: string,
  formInstanceId: string,
  pageCount: number,
  signer: SignaturePlacementSigner,
  field: SignaturePlacementField,
  fieldIndex: number,
): SignaturePlacementEntry {
  const page = readPositiveInteger(field.page, `Signature field ${field.id ?? fieldIndex} requires a page.`);
  if (page > pageCount) {
    throw new Error(`Signature field ${field.id ?? fieldIndex} points outside document ${formId}.`);
  }

  const kind = field.kind ?? "signature";
  return {
    id: `${formInstanceId}:${signer.id}:${field.id ?? kind}:${fieldIndex}`,
    formId,
    formInstanceId,
    signerId: signer.id,
    kind,
    page,
    x: readFiniteNumber(field.x, `Signature field ${field.id ?? fieldIndex} requires an x coordinate.`),
    y: readFiniteNumber(field.y, `Signature field ${field.id ?? fieldIndex} requires a y coordinate.`),
    width: readFiniteNumber(field.width, `Signature field ${field.id ?? fieldIndex} requires a width.`),
    height: readFiniteNumber(field.height, `Signature field ${field.id ?? fieldIndex} requires a height.`),
    required: field.required ?? true,
    label: field.label ?? defaultLabel(kind),
  };
}

function fieldBelongsToSigner(field: SignaturePlacementField, signer: SignaturePlacementSigner): boolean {
  if (field.signerId !== undefined) {
    return field.signerId === signer.id;
  }
  if (field.role !== undefined) {
    return field.role === signer.role;
  }

  return true;
}

function compareSigners(left: SignaturePlacementSigner, right: SignaturePlacementSigner): number {
  const leftOrder = left.routingOrder ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.routingOrder ?? Number.MAX_SAFE_INTEGER;
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return left.id.localeCompare(right.id);
}

function readPositiveInteger(value: number | undefined, message: string): number {
  if (value === undefined || !Number.isInteger(value) || value <= 0) {
    throw new Error(message);
  }

  return value;
}

function readFiniteNumber(value: number | undefined, message: string): number {
  if (value === undefined || !Number.isFinite(value)) {
    throw new Error(message);
  }

  return value;
}

function defaultLabel(kind: SignaturePlacementFieldKind): string {
  if (kind === "initial") {
    return "Initial";
  }
  if (kind === "date") {
    return "Date";
  }
  if (kind === "name") {
    return "Name";
  }

  return "Signature";
}
