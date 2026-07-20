import * as eventPacketMapModule from "@/policy/packets/registries/eventPacketMap";
import * as templateRegistryModule from "@/policy/packets/registries/templateRegistry";
import * as formsCatalogModule from "@/policy/data/formsCatalog";
import type { EventFormInstance } from "@/policy/compliance-execution/types";
import type {} from "@/policy/packets/contracts";

export type PacketContractModule = typeof import("@/policy/packets/contracts");
export type PacketContractExportName = keyof PacketContractModule;
export type ComplianceEventFormInstance = EventFormInstance;

export const packetFormSourceClassifications = ["source", "generated"] as const;
export type PacketFormSourceClassification = (typeof packetFormSourceClassifications)[number];

export const packetFormStatuses = ["pending", "in_progress", "complete", "blocked"] as const;
export type PacketFormStatus = (typeof packetFormStatuses)[number];

export const packetCadences = ["quarterly", "annual", "event-driven"] as const;
export type PacketCadence = (typeof packetCadences)[number];

export const formInjectionBlockerCodes = [
  "missing-canonical-form",
  "incomplete-canonical-form",
  "missing-required-field",
  "missing-required-signer",
  "missing-content-hash",
  "missing-attachment-ref",
  "no-empty-shell-complete",
] as const;
export type FormInjectionBlockerCode = (typeof formInjectionBlockerCodes)[number];

export interface FormRegistrySources {
  readonly eventPacketMap?: unknown;
  readonly templateRegistry?: unknown;
  readonly formsCatalog?: unknown;
  readonly formsLibraryDataset?: unknown;
}

export interface FormTriggerValidation {
  readonly triggerId: string;
  readonly validated: boolean;
  readonly validatedAt?: string;
  readonly evidenceRefIds?: readonly string[];
}

export interface CanonicalFormRequirement {
  readonly canonicalFormId: string;
  readonly sourceClassification?: PacketFormSourceClassification;
  readonly cadence?: PacketCadence;
  readonly requiredForCadences?: readonly PacketCadence[];
  readonly conditionalTriggerId?: string;
  readonly generatedWorkflowId?: string;
}

export interface CanonicalFormField {
  readonly fieldId: string;
  readonly label: string;
  readonly required: boolean;
}

export interface CanonicalFormDefinition {
  readonly canonicalFormId: string;
  readonly title: string;
  readonly version: string;
  readonly sourceClassification: PacketFormSourceClassification;
  readonly cadence?: PacketCadence;
  readonly conditionalTriggerId?: string;
  readonly requiredFields: readonly CanonicalFormField[];
  readonly signerRoles: readonly string[];
}

export interface ResolvedCanonicalForm {
  readonly requirement: CanonicalFormRequirement;
  readonly definition: CanonicalFormDefinition;
  readonly triggerEvidenceRefIds: readonly string[];
}

export interface ExcludedFormReference {
  readonly canonicalFormId: string;
  readonly reason: string;
  readonly conditionalTriggerId?: string;
  readonly cadence?: PacketCadence;
}

export interface FormInjectionBlocker {
  readonly code: FormInjectionBlockerCode;
  readonly canonicalFormId?: string;
  readonly formInstanceId?: string;
  readonly fieldId?: string;
  readonly signerRole?: string;
  readonly message: string;
}

export interface FormInjectionResolution {
  readonly requiredForms: readonly ResolvedCanonicalForm[];
  readonly excludedForms: readonly ExcludedFormReference[];
  readonly blockers: readonly FormInjectionBlocker[];
}

export interface PacketFormAttachmentReference {
  readonly attachmentId: string;
  readonly manifestEntryId: string;
  readonly contentHash: string;
}

export interface PacketFormRequiredField {
  readonly fieldId: string;
  readonly label: string;
  readonly required: boolean;
  readonly valueStatus: "missing" | "present" | "not_applicable";
  readonly evidenceRefIds: readonly string[];
}

export interface PacketFormSigner {
  readonly role: string;
  readonly status: "required" | "signed" | "not_required";
  readonly signerId?: string;
  readonly signedAt?: string;
  readonly evidenceRefId?: string;
}

export interface PacketFormInstance {
  readonly canonicalFormId: string;
  readonly canonicalTitle: string;
  readonly canonicalVersion: string;
  readonly formInstanceId: string;
  readonly eventId: string;
  readonly eventType: string;
  readonly workflowId: string;
  readonly workflowInstanceId: string;
  readonly sourceClassification: PacketFormSourceClassification;
  readonly status: PacketFormStatus;
  readonly requiredFields: readonly PacketFormRequiredField[];
  readonly signers: readonly PacketFormSigner[];
  readonly evidenceRefIds: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly contentHash?: string;
  readonly attachmentRef?: PacketFormAttachmentReference;
  readonly completedAt?: string;
  readonly triggerEvidenceRefIds?: readonly string[];
}

export type PacketFormInstanceWithCompliance = PacketFormInstance & Partial<EventFormInstance>;

export interface FormFieldCompletion {
  readonly fieldId: string;
  readonly valuePresent?: boolean;
  readonly notApplicable?: boolean;
  readonly evidenceRefIds?: readonly string[];
}

export interface FormSignerCompletion {
  readonly role: string;
  readonly signerId?: string;
  readonly signedAt?: string;
  readonly evidenceRefId?: string;
}

export interface FormCompletionEvidence {
  readonly canonicalFormId: string;
  readonly status?: PacketFormStatus;
  readonly requiredFields?: readonly FormFieldCompletion[];
  readonly signers?: readonly FormSignerCompletion[];
  readonly evidenceRefIds?: readonly string[];
  readonly contentHash?: string;
  readonly attachmentRef?: PacketFormAttachmentReference;
  readonly completedAt?: string;
  readonly updatedAt?: string;
}

export interface FormInjectionContext {
  readonly packetId: string;
  readonly packetType: string;
  readonly packetCadence: PacketCadence;
  readonly eventId: string;
  readonly eventType: string;
  readonly workflowId: string;
  readonly workflowInstanceId: string;
  readonly generatedAt: string;
  readonly registrySources?: FormRegistrySources;
  readonly requiredForms?: readonly CanonicalFormRequirement[];
  readonly triggerValidations?: readonly FormTriggerValidation[];
  readonly completionEvidence?: readonly FormCompletionEvidence[];
}

export interface FormInjectionResult extends FormInjectionResolution {
  readonly formInstances: readonly PacketFormInstance[];
}

type UnknownRecord = Readonly<Record<string, unknown>>;

const eventMapRequirementKeys = [
  "requiredForms",
  "requiredFormIds",
  "forms",
  "formIds",
  "partIIForms",
  "qapiPartIIForms",
  "templates",
] as const;

const catalogCollectionKeys = [
  "formsCatalog",
  "formsLibraryDataset",
  "canonicalForms",
  "forms",
  "items",
  "templates",
] as const;

const idKeys = [
  "canonicalFormId",
  "canonicalId",
  "formId",
  "id",
  "templateId",
  "canonical_form_id",
] as const;

const titleKeys = ["title", "canonicalTitle", "formTitle", "name", "displayName"] as const;
const versionKeys = ["version", "canonicalVersion", "formVersion", "revision", "versionId"] as const;
const cadenceKeys = ["cadence", "formCadence", "requiredCadence"] as const;
const classificationKeys = ["sourceClassification", "classification", "sourceType", "kind"] as const;
const conditionalTriggerKeys = ["conditionalTriggerId", "triggerId", "requiresTriggerId"] as const;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readProperty = (source: unknown, key: string): unknown =>
  isRecord(source) ? source[key] : undefined;

const readString = (source: unknown, keys: readonly string[]): string | undefined => {
  if (!isRecord(source)) {
    return undefined;
  }

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
};

const readBoolean = (source: unknown, key: string): boolean | undefined => {
  const value = readProperty(source, key);
  return typeof value === "boolean" ? value : undefined;
};

const asPacketCadence = (value: unknown): PacketCadence | undefined => {
  if (value === "quarterly" || value === "annual" || value === "event-driven") {
    return value;
  }
  return undefined;
};

const asSourceClassification = (value: unknown): PacketFormSourceClassification | undefined => {
  if (value === "source" || value === "generated") {
    return value;
  }
  return undefined;
};

const uniqueStrings = (values: readonly (string | undefined)[]): readonly string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (value !== undefined && value.length > 0 && !seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }

  return result;
};

const stringsFromUnknown = (value: unknown): readonly string[] => {
  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => stringsFromUnknown(item));
  }

  if (isRecord(value)) {
    const id = readString(value, ["id", "fieldId", "role", "evidenceRefId", "refId"]);
    return id === undefined ? [] : [id];
  }

  return [];
};

const collectCollections = (source: unknown, keys: readonly string[]): readonly unknown[] => {
  if (Array.isArray(source)) {
    return source;
  }

  if (!isRecord(source)) {
    return [];
  }

  for (const key of keys) {
    const value = source[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  const nestedArrays = Object.values(source)
    .filter((value) => Array.isArray(value))
    .flatMap((value) => value as readonly unknown[]);

  if (nestedArrays.length > 0) {
    return nestedArrays;
  }

  return [];
};

const extractRequirementList = (source: unknown): readonly unknown[] => {
  if (Array.isArray(source)) {
    return source;
  }

  if (!isRecord(source)) {
    return [];
  }

  for (const key of eventMapRequirementKeys) {
    const value = source[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
};

const matchesContext = (entry: unknown, context: FormInjectionContext): boolean => {
  if (!isRecord(entry)) {
    return false;
  }

  const eventValue = readString(entry, ["eventType", "eventCode", "eventId", "event"]);
  const packetValue = readString(entry, ["packetType", "packet", "packetId"]);
  const partValue = readString(entry, ["part", "packetPart", "section"]);

  const eventMatches =
    eventValue === undefined || eventValue === context.eventType || eventValue === context.eventId;
  const packetMatches =
    packetValue === undefined || packetValue === context.packetType || packetValue === context.packetId;
  const partMatches =
    partValue === undefined ||
    partValue === "QAPI Part II" ||
    partValue === "Part II" ||
    partValue === context.packetType;

  return eventMatches && packetMatches && partMatches;
};

const keyedMapValue = (source: unknown, context: FormInjectionContext): unknown => {
  if (!isRecord(source)) {
    return undefined;
  }

  return (
    source[context.eventType] ??
    source[context.eventId] ??
    source[context.packetType] ??
    source[context.packetId]
  );
};

const requirementsFromEventMap = (
  source: unknown,
  context: FormInjectionContext,
): readonly CanonicalFormRequirement[] => {
  const keyed = keyedMapValue(source, context);
  const keyedRequirements = extractRequirementList(keyed).flatMap((raw) => normalizeRequirement(raw));
  if (keyedRequirements.length > 0) {
    return keyedRequirements;
  }

  const entries = collectCollections(source, ["default", "eventPacketMap", "mappings", "items"]);
  return entries
    .filter((entry) => matchesContext(entry, context))
    .flatMap((entry) => extractRequirementList(entry))
    .flatMap((raw) => normalizeRequirement(raw));
};

const normalizeRequirement = (raw: unknown): readonly CanonicalFormRequirement[] => {
  if (typeof raw === "string" && raw.trim().length > 0) {
    return [{ canonicalFormId: raw.trim(), sourceClassification: "source" }];
  }

  if (!isRecord(raw)) {
    return [];
  }

  const canonicalFormId = readString(raw, idKeys);
  if (canonicalFormId === undefined) {
    return [];
  }

  const sourceClassification =
    asSourceClassification(readString(raw, classificationKeys)) ??
    (readBoolean(raw, "generated") === true ? "generated" : "source");
  const cadence = asPacketCadence(readString(raw, cadenceKeys));
  const requiredForCadences = stringsFromUnknown(readProperty(raw, "requiredForCadences"))
    .map((value) => asPacketCadence(value))
    .filter((value): value is PacketCadence => value !== undefined);
  const conditionalTriggerId = readString(raw, conditionalTriggerKeys);
  const generatedWorkflowId = readString(raw, ["generatedWorkflowId", "workflowId", "workflow"]);

  return [
    {
      canonicalFormId,
      sourceClassification,
      ...(cadence === undefined ? {} : { cadence }),
      ...(requiredForCadences.length === 0 ? {} : { requiredForCadences }),
      ...(conditionalTriggerId === undefined ? {} : { conditionalTriggerId }),
      ...(generatedWorkflowId === undefined ? {} : { generatedWorkflowId }),
    },
  ];
};

const normalizeField = (raw: unknown): CanonicalFormField | undefined => {
  if (typeof raw === "string" && raw.trim().length > 0) {
    return { fieldId: raw.trim(), label: raw.trim(), required: true };
  }

  if (!isRecord(raw)) {
    return undefined;
  }

  const fieldId = readString(raw, ["fieldId", "id", "key", "name"]);
  if (fieldId === undefined) {
    return undefined;
  }

  const label = readString(raw, ["label", "title", "name"]) ?? fieldId;
  const required = readBoolean(raw, "required") ?? true;
  return { fieldId, label, required };
};

const normalizeSignerRoles = (raw: unknown): readonly string[] => {
  if (Array.isArray(raw)) {
    return uniqueStrings(
      raw.flatMap((item) => {
        if (typeof item === "string") {
          return [item.trim()];
        }
        if (isRecord(item)) {
          return [readString(item, ["role", "signerRole", "title", "name"])];
        }
        return [];
      }),
    );
  }

  return [];
};

const normalizeCatalogDefinition = (
  raw: unknown,
  expectedCanonicalFormId?: string,
): CanonicalFormDefinition | undefined => {
  if (!isRecord(raw)) {
    return undefined;
  }

  const canonicalFormId = readString(raw, idKeys);
  if (canonicalFormId === undefined) {
    return undefined;
  }

  if (expectedCanonicalFormId !== undefined && canonicalFormId !== expectedCanonicalFormId) {
    return undefined;
  }

  const title = readString(raw, titleKeys);
  const version = readString(raw, versionKeys);
  if (title === undefined || version === undefined) {
    return undefined;
  }

  const sourceClassification =
    asSourceClassification(readString(raw, classificationKeys)) ??
    (readBoolean(raw, "generated") === true ? "generated" : "source");
  const cadence = asPacketCadence(readString(raw, cadenceKeys));
  const conditionalTriggerId = readString(raw, conditionalTriggerKeys);
  const rawRequiredFields =
    readProperty(raw, "requiredFields") ??
    readProperty(raw, "fields") ??
    readProperty(raw, "requiredFieldIds") ??
    [];
  const requiredFields = Array.isArray(rawRequiredFields)
    ? rawRequiredFields
        .map((field) => normalizeField(field))
        .filter((field): field is CanonicalFormField => field !== undefined)
    : [];
  const signerRoles = normalizeSignerRoles(
    readProperty(raw, "signerRoles") ?? readProperty(raw, "signers") ?? readProperty(raw, "requiredSigners"),
  );

  return {
    canonicalFormId,
    title,
    version,
    sourceClassification,
    ...(cadence === undefined ? {} : { cadence }),
    ...(conditionalTriggerId === undefined ? {} : { conditionalTriggerId }),
    requiredFields,
    signerRoles,
  };
};

const catalogCandidates = (sources: FormRegistrySources): readonly unknown[] => [
  ...collectCollections(sources.formsCatalog, catalogCollectionKeys),
  ...collectCollections(sources.formsLibraryDataset, catalogCollectionKeys),
  ...collectCollections(sources.templateRegistry, catalogCollectionKeys),
];

const findCatalogDefinition = (
  canonicalFormId: string,
  sources: FormRegistrySources,
): CanonicalFormDefinition | undefined => {
  for (const candidate of catalogCandidates(sources)) {
    const definition = normalizeCatalogDefinition(candidate, canonicalFormId);
    if (definition !== undefined) {
      return definition;
    }
  }

  return undefined;
};

const mergeRequirementDefinition = (
  requirement: CanonicalFormRequirement,
  definition: CanonicalFormDefinition,
): CanonicalFormDefinition => {
  const cadence = definition.cadence ?? requirement.cadence;

  return {
    ...definition,
    sourceClassification: requirement.sourceClassification ?? definition.sourceClassification,
    ...(cadence === undefined ? {} : { cadence }),
    ...(requirement.conditionalTriggerId === undefined
      ? {}
      : { conditionalTriggerId: requirement.conditionalTriggerId }),
  };
};

const triggerValidationFor = (
  triggerId: string | undefined,
  validations: readonly FormTriggerValidation[],
): FormTriggerValidation | undefined => {
  if (triggerId === undefined) {
    return undefined;
  }
  return validations.find((validation) => validation.triggerId === triggerId && validation.validated);
};

const cadenceAllowsPacket = (
  requirement: CanonicalFormRequirement,
  definition: CanonicalFormDefinition,
  context: FormInjectionContext,
): boolean => {
  if (definition.cadence !== "annual" || context.packetCadence !== "quarterly") {
    return true;
  }

  if (requirement.requiredForCadences?.includes("quarterly") === true) {
    return true;
  }

  const triggerId = requirement.conditionalTriggerId ?? definition.conditionalTriggerId;
  return triggerValidationFor(triggerId, context.triggerValidations ?? []) !== undefined;
};

const shouldIncludeForm = (
  requirement: CanonicalFormRequirement,
  definition: CanonicalFormDefinition,
  context: FormInjectionContext,
): { readonly include: true; readonly triggerEvidenceRefIds: readonly string[] } | { readonly include: false; readonly reason: string } => {
  const triggerId = requirement.conditionalTriggerId ?? definition.conditionalTriggerId;
  const triggerValidation = triggerValidationFor(triggerId, context.triggerValidations ?? []);

  if (triggerId !== undefined && triggerValidation === undefined) {
    return { include: false, reason: "conditional trigger not validated" };
  }

  if (!cadenceAllowsPacket(requirement, definition, context)) {
    return { include: false, reason: "annual cadence excluded from quarterly packet" };
  }

  return { include: true, triggerEvidenceRefIds: triggerValidation?.evidenceRefIds ?? [] };
};

const dedupeRequirements = (
  requirements: readonly CanonicalFormRequirement[],
): readonly CanonicalFormRequirement[] => {
  const seen = new Set<string>();
  const deduped: CanonicalFormRequirement[] = [];

  for (const requirement of requirements) {
    if (!seen.has(requirement.canonicalFormId)) {
      seen.add(requirement.canonicalFormId);
      deduped.push(requirement);
    }
  }

  return deduped;
};

const defaultRegistrySources = (): FormRegistrySources => ({
  eventPacketMap: eventPacketMapModule,
  templateRegistry: templateRegistryModule,
  formsCatalog: formsCatalogModule,
  formsLibraryDataset: readProperty(formsCatalogModule, "formsLibraryDataset"),
});

export const resolveRequiredForms = (context: FormInjectionContext): FormInjectionResolution => {
  const registrySources = { ...defaultRegistrySources(), ...context.registrySources };
  const explicitRequirements = context.requiredForms ?? [];
  const mappedRequirements =
    explicitRequirements.length > 0
      ? explicitRequirements
      : requirementsFromEventMap(registrySources.eventPacketMap, context);
  const blockers: FormInjectionBlocker[] = [];
  const excludedForms: ExcludedFormReference[] = [];
  const requiredForms: ResolvedCanonicalForm[] = [];

  for (const requirement of dedupeRequirements(mappedRequirements)) {
    const catalogDefinition = findCatalogDefinition(requirement.canonicalFormId, registrySources);
    if (catalogDefinition === undefined) {
      blockers.push({
        code: "missing-canonical-form",
        canonicalFormId: requirement.canonicalFormId,
        message: `Required canonical form ${requirement.canonicalFormId} is not present in the canonical library.`,
      });
      continue;
    }

    const definition = mergeRequirementDefinition(requirement, catalogDefinition);
    const inclusion = shouldIncludeForm(requirement, definition, context);
    if (!inclusion.include) {
      excludedForms.push({
        canonicalFormId: requirement.canonicalFormId,
        reason: inclusion.reason,
        ...(definition.conditionalTriggerId === undefined ? {} : { conditionalTriggerId: definition.conditionalTriggerId }),
        ...(definition.cadence === undefined ? {} : { cadence: definition.cadence }),
      });
      continue;
    }

    requiredForms.push({
      requirement,
      definition,
      triggerEvidenceRefIds: inclusion.triggerEvidenceRefIds,
    });
  }

  return { requiredForms, excludedForms, blockers };
};

const hashText = (text: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

export const mintPacketFormInstanceId = (
  context: Pick<FormInjectionContext, "packetId" | "eventId" | "workflowInstanceId">,
  canonicalFormId: string,
  ordinal: number,
): string => {
  const basis = `${context.packetId}|${context.eventId}|${context.workflowInstanceId}|${canonicalFormId}|${ordinal}`;
  return `form-instance-${hashText(basis)}`;
};

const fieldCompletionFor = (
  completion: FormCompletionEvidence | undefined,
  fieldId: string,
): FormFieldCompletion | undefined =>
  completion?.requiredFields?.find((fieldCompletion) => fieldCompletion.fieldId === fieldId);

const signerCompletionFor = (
  completion: FormCompletionEvidence | undefined,
  role: string,
): FormSignerCompletion | undefined =>
  completion?.signers?.find((signerCompletion) => signerCompletion.role === role);

const makeRequiredFieldInstance = (
  field: CanonicalFormField,
  completion: FormCompletionEvidence | undefined,
): PacketFormRequiredField => {
  const fieldCompletion = fieldCompletionFor(completion, field.fieldId);
  const valueStatus =
    fieldCompletion?.notApplicable === true
      ? "not_applicable"
      : fieldCompletion?.valuePresent === true
        ? "present"
        : "missing";

  return {
    fieldId: field.fieldId,
    label: field.label,
    required: field.required,
    valueStatus,
    evidenceRefIds: fieldCompletion?.evidenceRefIds ?? [],
  };
};

const makeSignerInstance = (
  role: string,
  completion: FormCompletionEvidence | undefined,
): PacketFormSigner => {
  const signerCompletion = signerCompletionFor(completion, role);
  const status = signerCompletion?.signedAt === undefined ? "required" : "signed";

  return {
    role,
    status,
    ...(signerCompletion?.signerId === undefined ? {} : { signerId: signerCompletion.signerId }),
    ...(signerCompletion?.signedAt === undefined ? {} : { signedAt: signerCompletion.signedAt }),
    ...(signerCompletion?.evidenceRefId === undefined ? {} : { evidenceRefId: signerCompletion.evidenceRefId }),
  };
};

const evidenceRefsFor = (
  completion: FormCompletionEvidence | undefined,
  fields: readonly PacketFormRequiredField[],
  signers: readonly PacketFormSigner[],
  triggerEvidenceRefIds: readonly string[],
): readonly string[] =>
  uniqueStrings([
    ...(completion?.evidenceRefIds ?? []),
    ...fields.flatMap((field) => field.evidenceRefIds),
    ...signers.map((signer) => signer.evidenceRefId),
    ...triggerEvidenceRefIds,
  ]);

export const validatePacketFormInstance = (
  instance: PacketFormInstance,
): readonly FormInjectionBlocker[] => {
  const blockers: FormInjectionBlocker[] = [];

  if (instance.status !== "complete") {
    return blockers;
  }

  if (instance.contentHash === undefined || instance.contentHash.trim().length === 0) {
    blockers.push({
      code: "missing-content-hash",
      canonicalFormId: instance.canonicalFormId,
      formInstanceId: instance.formInstanceId,
      message: `Completed form ${instance.formInstanceId} is missing a content hash.`,
    });
  }

  if (instance.attachmentRef === undefined) {
    blockers.push({
      code: "missing-attachment-ref",
      canonicalFormId: instance.canonicalFormId,
      formInstanceId: instance.formInstanceId,
      message: `Completed form ${instance.formInstanceId} is missing an attachment reference.`,
    });
  }

  for (const field of instance.requiredFields) {
    if (field.required && field.valueStatus === "missing") {
      blockers.push({
        code: "missing-required-field",
        canonicalFormId: instance.canonicalFormId,
        formInstanceId: instance.formInstanceId,
        fieldId: field.fieldId,
        message: `Completed form ${instance.formInstanceId} is missing required field ${field.fieldId}.`,
      });
    }
  }

  for (const signer of instance.signers) {
    if (signer.status === "required") {
      blockers.push({
        code: "missing-required-signer",
        canonicalFormId: instance.canonicalFormId,
        formInstanceId: instance.formInstanceId,
        signerRole: signer.role,
        message: `Completed form ${instance.formInstanceId} is missing required signer ${signer.role}.`,
      });
    }
  }

  if (blockers.length > 0) {
    blockers.push({
      code: "no-empty-shell-complete",
      canonicalFormId: instance.canonicalFormId,
      formInstanceId: instance.formInstanceId,
      message: `Completed form ${instance.formInstanceId} cannot be an empty shell.`,
    });
  }

  return blockers;
};

export const assertNoEmptyShellComplete = (instance: PacketFormInstance): void => {
  const blockers = validatePacketFormInstance(instance);
  if (blockers.length > 0) {
    throw new Error(blockers.map((blocker) => blocker.message).join(" "));
  }
};

export const mintPacketFormInstance = (
  context: FormInjectionContext,
  resolvedForm: ResolvedCanonicalForm,
  ordinal: number,
): PacketFormInstance => {
  const completion = context.completionEvidence?.find(
    (candidate) => candidate.canonicalFormId === resolvedForm.definition.canonicalFormId,
  );
  const status = completion?.status ?? "pending";
  const requiredFields = resolvedForm.definition.requiredFields.map((field) =>
    makeRequiredFieldInstance(field, completion),
  );
  const signers = resolvedForm.definition.signerRoles.map((role) => makeSignerInstance(role, completion));
  const evidenceRefIds = evidenceRefsFor(
    completion,
    requiredFields,
    signers,
    resolvedForm.triggerEvidenceRefIds,
  );
  const formInstanceId = mintPacketFormInstanceId(context, resolvedForm.definition.canonicalFormId, ordinal);

  const instance: PacketFormInstance = {
    canonicalFormId: resolvedForm.definition.canonicalFormId,
    canonicalTitle: resolvedForm.definition.title,
    canonicalVersion: resolvedForm.definition.version,
    formInstanceId,
    eventId: context.eventId,
    eventType: context.eventType,
    workflowId: resolvedForm.requirement.generatedWorkflowId ?? context.workflowId,
    workflowInstanceId: context.workflowInstanceId,
    sourceClassification: resolvedForm.definition.sourceClassification,
    status,
    requiredFields,
    signers,
    evidenceRefIds,
    createdAt: context.generatedAt,
    updatedAt: completion?.updatedAt ?? context.generatedAt,
    ...(completion?.contentHash === undefined ? {} : { contentHash: completion.contentHash }),
    ...(completion?.attachmentRef === undefined ? {} : { attachmentRef: completion.attachmentRef }),
    ...(status === "complete" && completion?.completedAt !== undefined ? { completedAt: completion.completedAt } : {}),
    ...(resolvedForm.triggerEvidenceRefIds.length === 0
      ? {}
      : { triggerEvidenceRefIds: resolvedForm.triggerEvidenceRefIds }),
  };

  assertNoEmptyShellComplete(instance);
  return instance;
};

export const injectCanonicalForms = (context: FormInjectionContext): FormInjectionResult => {
  const resolution = resolveRequiredForms(context);
  const formInstances: PacketFormInstance[] = [];
  const blockers = [...resolution.blockers];

  resolution.requiredForms.forEach((resolvedForm, index) => {
    try {
      formInstances.push(mintPacketFormInstance(context, resolvedForm, index + 1));
    } catch (error) {
      blockers.push({
        code: "no-empty-shell-complete",
        canonicalFormId: resolvedForm.definition.canonicalFormId,
        message: error instanceof Error ? error.message : "Completed form cannot be an empty shell.",
      });
    }
  });

  return {
    requiredForms: resolution.requiredForms,
    excludedForms: resolution.excludedForms,
    blockers,
    formInstances,
  };
};
