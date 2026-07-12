import type { ConfidentialAddendumReference } from "./confidentialAddendumRef";
import type {
  ExcludedFormReference,
  PacketFormInstance,
  PacketFormSourceClassification,
} from "./formInjection";

export const qapiPartIIAttachmentManifestSections = [
  "attachment manifest",
  "completed source forms",
  "generated PIP/CAP/RCA/corrective-action forms",
  "triggered workflow execution packages",
  "confidential personnel-review addendum reference",
  "source derivation, reconciliation, and evidence provenance",
  "superseded or excluded-source register",
] as const;
export type QapiPartIIAttachmentManifestSection = (typeof qapiPartIIAttachmentManifestSections)[number];

export const attachmentManifestEntryStatuses = [
  "resolved",
  "unresolved",
  "reference-only",
  "excluded",
] as const;
export type AttachmentManifestEntryStatus = (typeof attachmentManifestEntryStatuses)[number];

export interface AttachmentPageRange {
  readonly startPage: number;
  readonly endPage: number;
}

export interface AttachmentPageIndexEntry {
  readonly attachmentId: string;
  readonly contentHash?: string;
  readonly formInstanceId?: string;
  readonly canonicalFormId?: string;
  readonly pageRange: AttachmentPageRange;
  readonly sectionId?: string;
  readonly anchorText?: string;
}

export interface AttachmentPageReference {
  readonly attachmentId: string;
  readonly pageRange: AttachmentPageRange;
  readonly sectionId?: string;
  readonly anchorText?: string;
}

export interface AttachmentPageReferenceResolution {
  readonly status: "resolved" | "unresolved";
  readonly pageReferences: readonly AttachmentPageReference[];
  readonly unresolvedReason?: string;
}

export interface GeneratedQapiFormAttachment {
  readonly attachmentId: string;
  readonly title: string;
  readonly contentHash: string;
  readonly formInstanceId: string;
  readonly canonicalFormId: string;
  readonly sourceClassification?: PacketFormSourceClassification;
  readonly evidenceRefIds?: readonly string[];
  readonly createdAt?: string;
}

export interface AttachmentManifestEntry {
  readonly entryId: string;
  readonly section: QapiPartIIAttachmentManifestSection;
  readonly status: AttachmentManifestEntryStatus;
  readonly title: string;
  readonly attachmentId?: string;
  readonly contentHash?: string;
  readonly formInstanceId?: string;
  readonly canonicalFormId?: string;
  readonly sourceClassification?: PacketFormSourceClassification;
  readonly evidenceRefIds: readonly string[];
  readonly pageReferences: readonly AttachmentPageReference[];
  readonly unresolvedReason?: string;
  readonly confidentialAddendumReferenceId?: string;
  readonly excludedReason?: string;
  readonly generatedAt: string;
}

export interface AttachmentManifest {
  readonly packetId: string;
  readonly part: "QAPI Part II";
  readonly generatedAt: string;
  readonly entries: readonly AttachmentManifestEntry[];
}

export interface AttachmentManifestInput {
  readonly packetId: string;
  readonly generatedAt: string;
  readonly formInstances: readonly PacketFormInstance[];
  readonly pageIndex?: readonly AttachmentPageIndexEntry[];
  readonly generatedPipCapRcaForms?: readonly GeneratedQapiFormAttachment[];
  readonly confidentialAddendumReferences?: readonly ConfidentialAddendumReference[];
  readonly excludedForms?: readonly ExcludedFormReference[];
}

const hashText = (text: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

const entryIdFor = (packetId: string, section: QapiPartIIAttachmentManifestSection, basis: string): string =>
  `manifest-entry-${hashText(`${packetId}|${section}|${basis}`)}`;

const hasUsablePageRange = (pageRange: AttachmentPageRange): boolean =>
  Number.isInteger(pageRange.startPage) &&
  Number.isInteger(pageRange.endPage) &&
  pageRange.startPage > 0 &&
  pageRange.endPage >= pageRange.startPage;

const pageReferenceFromIndexEntry = (entry: AttachmentPageIndexEntry): AttachmentPageReference => ({
  attachmentId: entry.attachmentId,
  pageRange: entry.pageRange,
  ...(entry.sectionId === undefined ? {} : { sectionId: entry.sectionId }),
  ...(entry.anchorText === undefined ? {} : { anchorText: entry.anchorText }),
});

const normalizeGeneratedFormLink = (value: string | undefined, label: string): string => {
  if (typeof value !== "string") {
    throw new Error(`Generated QAPI form attachment ${label} is required for canonical form-instance linkage.`);
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(`Generated QAPI form attachment ${label} is required for canonical form-instance linkage.`);
  }
  return normalized;
};

export const resolveAttachmentPageReferences = (
  request: {
    readonly attachmentId?: string;
    readonly contentHash?: string;
    readonly formInstanceId?: string;
    readonly canonicalFormId?: string;
  },
  pageIndex: readonly AttachmentPageIndexEntry[] = [],
): AttachmentPageReferenceResolution => {
  const matches = pageIndex.filter((entry) => {
    const attachmentMatches = request.attachmentId !== undefined && entry.attachmentId === request.attachmentId;
    const hashMatches = request.contentHash !== undefined && entry.contentHash === request.contentHash;
    const instanceMatches =
      request.formInstanceId !== undefined && entry.formInstanceId === request.formInstanceId;
    const canonicalMatches =
      request.canonicalFormId !== undefined && entry.canonicalFormId === request.canonicalFormId;
    return attachmentMatches || hashMatches || instanceMatches || canonicalMatches;
  });

  const pageReferences = matches
    .filter((entry) => hasUsablePageRange(entry.pageRange))
    .map((entry) => pageReferenceFromIndexEntry(entry));

  if (pageReferences.length === 0) {
    return {
      status: "unresolved",
      pageReferences: [],
      unresolvedReason: "attachment page reference not found",
    };
  }

  return { status: "resolved", pageReferences };
};

const entryFromFormInstance = (
  packetId: string,
  generatedAt: string,
  formInstance: PacketFormInstance,
  section: "completed source forms" | "generated PIP/CAP/RCA/corrective-action forms",
  pageIndex: readonly AttachmentPageIndexEntry[],
): AttachmentManifestEntry => {
  const pageResolution = resolveAttachmentPageReferences(
    {
      attachmentId: formInstance.attachmentRef?.attachmentId,
      contentHash: formInstance.contentHash,
      formInstanceId: formInstance.formInstanceId,
      canonicalFormId: formInstance.canonicalFormId,
    },
    pageIndex,
  );
  const attachmentId = formInstance.attachmentRef?.attachmentId;

  return {
    entryId: entryIdFor(packetId, section, formInstance.formInstanceId),
    section,
    status: pageResolution.status,
    title: formInstance.canonicalTitle,
    ...(attachmentId === undefined ? {} : { attachmentId }),
    ...(formInstance.contentHash === undefined ? {} : { contentHash: formInstance.contentHash }),
    formInstanceId: formInstance.formInstanceId,
    canonicalFormId: formInstance.canonicalFormId,
    sourceClassification: formInstance.sourceClassification,
    evidenceRefIds: formInstance.evidenceRefIds,
    pageReferences: pageResolution.pageReferences,
    ...(pageResolution.unresolvedReason === undefined
      ? {}
      : { unresolvedReason: pageResolution.unresolvedReason }),
    generatedAt,
  };
};

const entryFromGeneratedAttachment = (
  packetId: string,
  generatedAt: string,
  attachment: GeneratedQapiFormAttachment,
  pageIndex: readonly AttachmentPageIndexEntry[],
): AttachmentManifestEntry => {
  const pageResolution = resolveAttachmentPageReferences(
    {
      attachmentId: attachment.attachmentId,
      contentHash: attachment.contentHash,
      formInstanceId: attachment.formInstanceId,
      canonicalFormId: attachment.canonicalFormId,
    },
    pageIndex,
  );
  const formInstanceId = normalizeGeneratedFormLink(attachment.formInstanceId, "formInstanceId");
  const canonicalFormId = normalizeGeneratedFormLink(attachment.canonicalFormId, "canonicalFormId");

  return {
    entryId: entryIdFor(
      packetId,
      "generated PIP/CAP/RCA/corrective-action forms",
      attachment.attachmentId,
    ),
    section: "generated PIP/CAP/RCA/corrective-action forms",
    status: pageResolution.status,
    title: attachment.title,
    attachmentId: attachment.attachmentId,
    contentHash: attachment.contentHash,
    formInstanceId,
    canonicalFormId,
    sourceClassification: attachment.sourceClassification ?? "generated",
    evidenceRefIds: attachment.evidenceRefIds ?? [],
    pageReferences: pageResolution.pageReferences,
    ...(pageResolution.unresolvedReason === undefined
      ? {}
      : { unresolvedReason: pageResolution.unresolvedReason }),
    generatedAt: attachment.createdAt ?? generatedAt,
  };
};

const entryFromConfidentialReference = (
  packetId: string,
  generatedAt: string,
  reference: ConfidentialAddendumReference,
): AttachmentManifestEntry => ({
  entryId: entryIdFor(packetId, "confidential personnel-review addendum reference", reference.id),
  section: "confidential personnel-review addendum reference",
  status: "reference-only",
  title: "confidential personnel-review addendum reference",
  contentHash: reference.sha256,
  confidentialAddendumReferenceId: reference.id,
  evidenceRefIds: [...reference.relatedFindingIds, ...reference.restrictedWorkflowInstanceIds],
  pageReferences: [],
  generatedAt,
});

const entryFromExcludedForm = (
  packetId: string,
  generatedAt: string,
  excludedForm: ExcludedFormReference,
): AttachmentManifestEntry => ({
  entryId: entryIdFor(packetId, "superseded or excluded-source register", excludedForm.canonicalFormId),
  section: "superseded or excluded-source register",
  status: "excluded",
  title: excludedForm.canonicalFormId,
  canonicalFormId: excludedForm.canonicalFormId,
  evidenceRefIds: [],
  pageReferences: [],
  excludedReason: excludedForm.reason,
  generatedAt,
});

export const buildAttachmentManifest = (input: AttachmentManifestInput): AttachmentManifest => {
  const pageIndex = input.pageIndex ?? [];
  const completedSourceEntries = input.formInstances
    .filter((formInstance) => formInstance.sourceClassification === "source" && formInstance.status === "complete")
    .map((formInstance) =>
      entryFromFormInstance(input.packetId, input.generatedAt, formInstance, "completed source forms", pageIndex),
    );
  const generatedEntriesFromInstances = input.formInstances
    .filter(
      (formInstance) => formInstance.sourceClassification === "generated" && formInstance.status === "complete",
    )
    .map((formInstance) =>
      entryFromFormInstance(
        input.packetId,
        input.generatedAt,
        formInstance,
        "generated PIP/CAP/RCA/corrective-action forms",
        pageIndex,
      ),
    );
  const generatedEntries = (input.generatedPipCapRcaForms ?? []).map((attachment) =>
    entryFromGeneratedAttachment(input.packetId, input.generatedAt, attachment, pageIndex),
  );
  const confidentialEntries = (input.confidentialAddendumReferences ?? []).map((reference) =>
    entryFromConfidentialReference(input.packetId, input.generatedAt, reference),
  );
  const excludedEntries = (input.excludedForms ?? []).map((excludedForm) =>
    entryFromExcludedForm(input.packetId, input.generatedAt, excludedForm),
  );

  return {
    packetId: input.packetId,
    part: "QAPI Part II",
    generatedAt: input.generatedAt,
    entries: [
      ...completedSourceEntries,
      ...generatedEntriesFromInstances,
      ...generatedEntries,
      ...confidentialEntries,
      ...excludedEntries,
    ],
  };
};
