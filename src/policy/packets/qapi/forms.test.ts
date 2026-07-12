import { describe, expect, it } from "vitest";
import {
  buildAttachmentManifest,
  qapiPartIIAttachmentManifestSections,
  type GeneratedQapiFormAttachment,
} from "./attachmentManifest";
import {
  createConfidentialAddendumReference,
  type ConfidentialAddendumReferenceInput,
} from "./confidentialAddendumRef";
import {
  injectCanonicalForms,
  mintPacketFormInstance,
  resolveRequiredForms,
  validatePacketFormInstance,
  type FormCompletionEvidence,
  type FormInjectionContext,
  type PacketFormAttachmentReference,
  type PacketFormInstance,
  type ResolvedCanonicalForm,
} from "./formInjection";

const generatedAt = "2026-07-12T10:00:00.000Z";
const contentHash = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const addendumSha256 = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

const attachmentRef: PacketFormAttachmentReference = {
  attachmentId: "att-source-1",
  manifestEntryId: "manifest-entry-source-1",
  contentHash,
};

const formsCatalog = [
  {
    canonicalFormId: "qapi-quarterly-review",
    title: "Quarterly QAPI Review",
    version: "2026.1",
    sourceClassification: "source",
    cadence: "quarterly",
    requiredFields: [
      { fieldId: "committee-review-date", label: "Committee review date", required: true },
    ],
    signerRoles: ["QAPI chair"],
  },
  {
    canonicalFormId: "qapi-pip",
    title: "Performance Improvement Project",
    version: "2026.1",
    sourceClassification: "generated",
    cadence: "quarterly",
    requiredFields: [{ fieldId: "aim-statement", label: "Aim statement", required: true }],
    signerRoles: [],
  },
  {
    canonicalFormId: "qapi-annual-summary",
    title: "Annual QAPI Summary",
    version: "2026.1",
    sourceClassification: "source",
    cadence: "annual",
    requiredFields: [{ fieldId: "annual-period", label: "Annual period", required: true }],
    signerRoles: ["Administrator"],
  },
  {
    canonicalFormId: "qapi-annual-triggered",
    title: "Annual Triggered Review",
    version: "2026.1",
    sourceClassification: "source",
    cadence: "annual",
    conditionalTriggerId: "annual-trigger",
    requiredFields: [{ fieldId: "trigger-rationale", label: "Trigger rationale", required: true }],
    signerRoles: [],
  },
] as const;

const eventPacketMap = [
  {
    eventType: "qapi-quarterly-event",
    packetType: "QAPI Part II",
    requiredForms: [
      { canonicalFormId: "qapi-quarterly-review", sourceClassification: "source" },
      { canonicalFormId: "qapi-pip", sourceClassification: "generated" },
    ],
  },
] as const;

const makeContext = (overrides: Partial<FormInjectionContext> = {}): FormInjectionContext => ({
  packetId: "packet-qapi-1",
  packetType: "QAPI Part II",
  packetCadence: "quarterly",
  eventId: "event-qapi-1",
  eventType: "qapi-quarterly-event",
  workflowId: "workflow-qapi",
  workflowInstanceId: "workflow-instance-qapi-1",
  generatedAt,
  registrySources: {
    eventPacketMap,
    formsCatalog,
    formsLibraryDataset: [],
    templateRegistry: [],
  },
  ...overrides,
});

const expectFirstResolvedForm = (context: FormInjectionContext): ResolvedCanonicalForm => {
  const resolution = resolveRequiredForms(context);
  const resolvedForm = resolution.requiredForms[0];
  if (resolvedForm === undefined) {
    throw new Error("Expected a resolved form for the test fixture.");
  }
  return resolvedForm;
};

const completeSourceEvidence = (): FormCompletionEvidence => ({
  canonicalFormId: "qapi-quarterly-review",
  status: "complete",
  requiredFields: [{ fieldId: "committee-review-date", valuePresent: true, evidenceRefIds: ["ev-field-1"] }],
  signers: [
    {
      role: "QAPI chair",
      signerId: "user-qapi-chair",
      signedAt: generatedAt,
      evidenceRefId: "ev-signature-1",
    },
  ],
  evidenceRefIds: ["ev-source-1"],
  contentHash,
  attachmentRef,
  completedAt: generatedAt,
});

describe("QAPI Part II form injection", () => {
  it("resolves required source and generated forms from the event packet map and catalog", () => {
    const result = injectCanonicalForms(makeContext());

    expect(result.blockers).toStrictEqual([]);
    expect(result.formInstances.map((instance) => instance.canonicalFormId)).toStrictEqual([
      "qapi-quarterly-review",
      "qapi-pip",
    ]);
    expect(result.formInstances.map((instance) => instance.canonicalTitle)).toStrictEqual([
      "Quarterly QAPI Review",
      "Performance Improvement Project",
    ]);
  });

  it("reports a blocker when a required canonical form is missing from the library", () => {
    const result = resolveRequiredForms(
      makeContext({
        requiredForms: [{ canonicalFormId: "qapi-missing-required-form" }],
        registrySources: {
          eventPacketMap: [],
          formsCatalog,
          formsLibraryDataset: [],
          templateRegistry: [],
        },
      }),
    );

    expect(result.requiredForms).toHaveLength(0);
    expect(result.blockers).toContainEqual(
      expect.objectContaining({
        code: "missing-canonical-form",
        canonicalFormId: "qapi-missing-required-form",
      }),
    );
  });

  it("mints deterministic unique form-instance ids for each canonical form", () => {
    const firstRun = injectCanonicalForms(makeContext()).formInstances;
    const secondRun = injectCanonicalForms(makeContext()).formInstances;

    expect(firstRun.map((instance) => instance.formInstanceId)).toStrictEqual(
      secondRun.map((instance) => instance.formInstanceId),
    );
    expect(new Set(firstRun.map((instance) => instance.formInstanceId)).size).toBe(firstRun.length);
    expect(firstRun[0]?.formInstanceId).toMatch(/^form-instance-/u);
  });

  it("flags a complete form with a missing required field", () => {
    const pendingInstance = injectCanonicalForms(makeContext({ requiredForms: [{ canonicalFormId: "qapi-quarterly-review" }] }))
      .formInstances[0];
    if (pendingInstance === undefined) {
      throw new Error("Expected a pending form instance for required-field validation.");
    }

    const invalidComplete: PacketFormInstance = {
      ...pendingInstance,
      status: "complete",
      contentHash,
      attachmentRef,
      signers: [
        {
          role: "QAPI chair",
          status: "signed",
          signerId: "user-qapi-chair",
          signedAt: generatedAt,
          evidenceRefId: "ev-signature-1",
        },
      ],
    };

    expect(validatePacketFormInstance(invalidComplete)).toContainEqual(
      expect.objectContaining({
        code: "missing-required-field",
        fieldId: "committee-review-date",
      }),
    );
  });

  it("keeps confidential addenda as reference-only manifest entries and rejects PHI-shaped fields", () => {
    const reference = createConfidentialAddendumReference({
      id: "conf-addendum-1",
      sha256: addendumSha256,
      custodian: "Compliance custodian",
      reviewer: "QAPI reviewer",
      reviewStatus: "pending review",
      relatedFindingIds: ["finding-1"],
      restrictedWorkflowInstanceIds: ["restricted-workflow-1"],
      createdAt: generatedAt,
    });
    const manifest = buildAttachmentManifest({
      packetId: "packet-qapi-1",
      generatedAt,
      formInstances: [],
      confidentialAddendumReferences: [reference],
    });
    const addendumEntry = manifest.entries[0];
    if (addendumEntry === undefined) {
      throw new Error("Expected a confidential addendum manifest entry.");
    }

    expect(addendumEntry.section).toBe("confidential personnel-review addendum reference");
    expect(addendumEntry.status).toBe("reference-only");
    expect(addendumEntry.contentHash).toBe(addendumSha256);
    expect(addendumEntry.attachmentId).toBeUndefined();
    expect(addendumEntry.pageReferences).toStrictEqual([]);

    const withPhi = {
      id: "conf-addendum-2",
      sha256: addendumSha256,
      custodian: "Compliance custodian",
      reviewer: "QAPI reviewer",
      reviewStatus: "pending review",
      relatedFindingIds: ["finding-2"],
      restrictedWorkflowInstanceIds: ["restricted-workflow-2"],
      createdAt: generatedAt,
      patientName: "Jane Example",
    } as unknown as ConfidentialAddendumReferenceInput;

    expect(() => createConfidentialAddendumReference(withPhi)).toThrow(/reference-only/u);

    const withNestedPhi = {
      id: "conf-addendum-3",
      sha256: addendumSha256,
      custodian: "Compliance custodian",
      reviewer: "QAPI reviewer",
      reviewStatus: "pending review",
      relatedFindingIds: ["finding-3"],
      restrictedWorkflowInstanceIds: ["restricted-workflow-3"],
      createdAt: generatedAt,
      metadata: {
        employeeName: "Jane Example",
        allegations: ["Confidential HR allegation"],
      },
    } as unknown as ConfidentialAddendumReferenceInput;

    expect(() => createConfidentialAddendumReference(withNestedPhi)).toThrow(/metadata\.employeeName/u);
  });

  it("excludes annual forms from quarterly packets unless a validated trigger requires them", () => {
    const result = resolveRequiredForms(
      makeContext({
        requiredForms: [
          { canonicalFormId: "qapi-annual-summary", cadence: "annual" },
          {
            canonicalFormId: "qapi-annual-triggered",
            cadence: "annual",
            conditionalTriggerId: "annual-trigger",
          },
        ],
        triggerValidations: [
          {
            triggerId: "annual-trigger",
            validated: true,
            validatedAt: generatedAt,
            evidenceRefIds: ["ev-trigger-1"],
          },
        ],
      }),
    );

    expect(result.requiredForms.map((form) => form.definition.canonicalFormId)).toStrictEqual([
      "qapi-annual-triggered",
    ]);
    expect(result.requiredForms[0]?.triggerEvidenceRefIds).toStrictEqual(["ev-trigger-1"]);
    expect(result.excludedForms).toContainEqual(
      expect.objectContaining({
        canonicalFormId: "qapi-annual-summary",
        reason: "annual cadence excluded from quarterly packet",
      }),
    );
  });

  it("does not let a requirement cadence override a canonical annual cadence", () => {
    const result = resolveRequiredForms(
      makeContext({
        requiredForms: [{ canonicalFormId: "qapi-annual-summary", cadence: "quarterly" }],
      }),
    );

    expect(result.requiredForms).toStrictEqual([]);
    expect(result.excludedForms).toContainEqual(
      expect.objectContaining({
        canonicalFormId: "qapi-annual-summary",
        reason: "annual cadence excluded from quarterly packet",
        cadence: "annual",
      }),
    );
  });

  it("rejects an empty shell marked complete", () => {
    const context = makeContext({
      requiredForms: [{ canonicalFormId: "qapi-quarterly-review" }],
      completionEvidence: [
        {
          canonicalFormId: "qapi-quarterly-review",
          status: "complete",
        },
      ],
    });
    const resolvedForm = expectFirstResolvedForm(context);

    expect(() => mintPacketFormInstance(context, resolvedForm, 1)).toThrow(/empty shell/u);
  });

  it("resolves manifest page references for completed source forms", () => {
    const formInstances = injectCanonicalForms(
      makeContext({
        requiredForms: [{ canonicalFormId: "qapi-quarterly-review" }],
        completionEvidence: [completeSourceEvidence()],
      }),
    ).formInstances;
    const formInstance = formInstances[0];
    if (formInstance === undefined) {
      throw new Error("Expected a completed source form instance for manifest page resolution.");
    }

    const manifest = buildAttachmentManifest({
      packetId: "packet-qapi-1",
      generatedAt,
      formInstances,
      pageIndex: [
        {
          attachmentId: "att-source-1",
          contentHash,
          formInstanceId: formInstance.formInstanceId,
          canonicalFormId: "qapi-quarterly-review",
          pageRange: { startPage: 4, endPage: 6 },
          sectionId: "source-form",
        },
      ],
    });

    expect(manifest.entries).toHaveLength(1);
    expect(manifest.entries[0]).toMatchObject({
      section: "completed source forms",
      status: "resolved",
      pageReferences: [{ attachmentId: "att-source-1", pageRange: { startPage: 4, endPage: 6 }, sectionId: "source-form" }],
    });
  });

  it("uses governed Part II attachment manifest section labels and order", () => {
    expect(qapiPartIIAttachmentManifestSections).toStrictEqual([
      "attachment manifest",
      "completed source forms",
      "generated PIP/CAP/RCA/corrective-action forms",
      "triggered workflow execution packages",
      "confidential personnel-review addendum reference",
      "source derivation, reconciliation, and evidence provenance",
      "superseded or excluded-source register",
    ]);

    const manifest = buildAttachmentManifest({
      packetId: "packet-qapi-1",
      generatedAt,
      formInstances: [],
      generatedPipCapRcaForms: [
        {
          attachmentId: "att-generated-1",
          title: "Generated corrective action form",
          contentHash,
          formInstanceId: "form-instance-generated-1",
          canonicalFormId: "qapi-pip",
        },
      ],
      excludedForms: [
        {
          canonicalFormId: "qapi-annual-summary",
          reason: "annual cadence excluded from quarterly packet",
        },
      ],
    });

    expect(manifest.entries.map((entry) => entry.section)).toStrictEqual([
      "generated PIP/CAP/RCA/corrective-action forms",
      "superseded or excluded-source register",
    ]);
  });

  it("rejects generated form attachments without canonical form-instance linkage", () => {
    const unlinkedGeneratedForm: GeneratedQapiFormAttachment = {
      attachmentId: "att-generated-unlinked",
      title: "Generated corrective action form",
      contentHash,
      formInstanceId: "",
      canonicalFormId: "qapi-pip",
    };

    expect(() =>
      buildAttachmentManifest({
        packetId: "packet-qapi-1",
        generatedAt,
        formInstances: [],
        generatedPipCapRcaForms: [unlinkedGeneratedForm],
      }),
    ).toThrow(/formInstanceId/u);
  });
});
