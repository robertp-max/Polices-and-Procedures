import type { PacketEnvelope } from "@/policy/packets/contracts";
import type { FormInstanceRow, SignatureRow } from "../../ecign/store";
import { createEnvelopeBinding, withEnvelopeBindingMetadata } from "../../ecign/envelopeBindings";
import { deriveEnvelopeStatus, isEnvelopeFullySigned, normalizeEnvelopeStatus } from "./envelopeStatus";
import {
  buildSignaturePlacementMap,
  type SignaturePlacementDocument,
  type SignaturePlacementField,
  type SignaturePlacementMap,
  type SignaturePlacementSigner,
} from "./signaturePlacement";

export interface PacketEnvelopeServiceDependencies {
  freezeApprovedVersion: (input: FreezeApprovedVersionInput) => Promise<FrozenPacketVersion>;
  createEnvelopeRecord: (envelope: PacketEnvelope) => Promise<PacketEnvelope>;
  updateEnvelopeRecord: (envelope: PacketEnvelope) => Promise<PacketEnvelope>;
  getEnvelopeRecord: (envelopeId: string) => Promise<PacketEnvelope | undefined>;
  createFormInstance: (input: CreateEnvelopeFormInstanceInput) => Promise<FormInstanceRow>;
  listEnvelopeFormInstances: (envelopeId: string) => Promise<readonly FormInstanceRow[]>;
  listEnvelopeSignatures: (envelopeId: string) => Promise<readonly SignatureRow[]>;
  ecign: PacketEnvelopeEcignDelegates;
  bindFormInstanceToEnvelope?: (input: BindEnvelopeFormInstanceInput) => Promise<void>;
  createReplacementVersion?: (input: CreateReplacementVersionInput) => Promise<ReplacementPacketVersion>;
  createSignerTask?: (input: CreateEnvelopeSignerTaskInput) => Promise<void>;
  createEnvelopeId?: () => string;
  now?: () => Date;
}

export interface PacketEnvelopeEcignDelegates {
  send?: (input: EnvelopeMemberActionInput) => Promise<FormInstanceRow | void>;
  remind?: (input: EnvelopeMemberActionInput) => Promise<FormInstanceRow | void>;
  resend?: (input: EnvelopeMemberActionInput) => Promise<FormInstanceRow | void>;
  void?: (input: EnvelopeMemberVoidInput) => Promise<FormInstanceRow | void>;
  cancel?: (input: EnvelopeMemberCancelInput) => Promise<FormInstanceRow | void>;
  replaceSigner?: (input: EnvelopeReplaceSignerInput) => Promise<FormInstanceRow | void>;
  extend?: (input: EnvelopeExtendInput) => Promise<FormInstanceRow | void>;
}

export interface FreezeApprovedVersionInput {
  packetId: string;
  packetVersionId: string;
  requestedBy: string;
}

export interface FrozenPacketVersion {
  id?: string;
  packetId: string;
  packetVersionId?: string;
  versionId?: string;
  status?: string;
  approvalStatus?: string;
  contentHash?: string;
  packetHash?: string;
  hash?: string;
}

export interface PrepareEnvelopeInput {
  packetId: string;
  packetVersionId: string;
  eventId: string;
  workflowId: string;
  requestedBy: string;
  forms: readonly EnvelopeFormPreparation[];
  signers: readonly EnvelopeSignerPreparation[];
  envelopeId?: string;
}

export interface EnvelopeFormPreparation {
  formId: string;
  formTemplateId?: string;
  title?: string;
  pageCount?: number;
  preSignatureArtifactId?: string;
  signatureFields?: readonly SignaturePlacementField[];
  requiredSignerIds?: readonly string[];
}

export interface EnvelopeSignerPreparation extends SignaturePlacementSigner {
  name?: string;
  email?: string;
}

export interface CreateEnvelopeFormInstanceInput {
  envelopeId: string;
  packetId: string;
  packetVersionId: string;
  packetVersionHash: string;
  eventId: string;
  workflowId: string;
  formId: string;
  required_signers: readonly string[];
  requiredSigners: readonly string[];
  envelopeBinding: {
    envelopeId: string;
    packetId: string;
    packetVersionId: string;
    packetVersionHash: string;
    eventId?: string;
    workflowId?: string;
  };
  formTemplateId?: string;
  preSignatureArtifactId?: string;
}

export interface BindEnvelopeFormInstanceInput {
  envelopeId: string;
  formInstanceId: string;
  packetId: string;
  packetVersionId: string;
  packetVersionHash: string;
  eventId: string;
  workflowId: string;
}

export interface CreateEnvelopeSignerTaskInput {
  envelopeId: string;
  formInstanceId: string;
  signerId: string;
  packetId: string;
  packetVersionId: string;
  packetVersionHash: string;
  eventId: string;
  workflowId: string;
}

export interface CreateReplacementVersionInput {
  envelopeId: string;
  packetId: string;
  packetVersionId: string;
  packetVersionHash: string;
  requestedBy: string;
  reason: string;
}

export interface ReplacementPacketVersion {
  packetVersionId: string;
  contentHash?: string;
}

export interface EnvelopeMemberActionInput {
  envelopeId: string;
  formInstanceId: string;
  actorId: string;
}

export interface EnvelopeMemberVoidInput extends EnvelopeMemberActionInput {
  reason: string;
}

export interface EnvelopeMemberCancelInput extends EnvelopeMemberActionInput {
  reason: string;
}

export interface EnvelopeReplaceSignerInput extends EnvelopeMemberActionInput {
  fromSignerId: string;
  toSignerId: string;
  reason: string;
}

export interface EnvelopeExtendInput extends EnvelopeMemberActionInput {
  expiresAt: string;
  reason: string;
}

export interface SendEnvelopeInput {
  envelopeId: string;
  actorId: string;
}

export interface RemindEnvelopeInput extends SendEnvelopeInput {
  signerId?: string;
}

export interface VoidEnvelopeInput extends SendEnvelopeInput {
  reason: string;
}

export interface MaterialEditEnvelopeInput extends SendEnvelopeInput {
  reason: string;
}

export interface ReplaceSignerEnvelopeInput extends SendEnvelopeInput {
  fromSignerId: string;
  toSignerId: string;
  reason: string;
}

export interface ExtendEnvelopeInput extends SendEnvelopeInput {
  expiresAt: string;
  reason: string;
}

export interface PreparedEnvelopeResult {
  envelope: PacketEnvelope;
  memberFormInstances: readonly FormInstanceRow[];
  signaturePlacementMap: SignaturePlacementMap;
  previewModel: EnvelopePreviewModel;
}

export interface EnvelopePreviewModel {
  envelopeId: string;
  packetId: string;
  packetVersionId: string;
  packetVersionHash: string;
  eventId: string;
  workflowId: string;
  documents: readonly SignaturePlacementDocument[];
  signers: readonly EnvelopeSignerPreparation[];
  signaturePlacementMap: SignaturePlacementMap;
}

type EnvelopePatch = Record<string, unknown>;

export function createPacketEnvelopeService(dependencies: PacketEnvelopeServiceDependencies) {
  return {
    prepare: (input: PrepareEnvelopeInput) => prepareEnvelope(dependencies, input),
    send: (input: SendEnvelopeInput) => sendEnvelope(dependencies, input),
    remind: (input: RemindEnvelopeInput) => remindEnvelope(dependencies, input),
    resend: (input: RemindEnvelopeInput) => resendEnvelope(dependencies, input),
    void: (input: VoidEnvelopeInput) => voidEnvelope(dependencies, input),
    cancel: (input: VoidEnvelopeInput) => cancelEnvelope(dependencies, input),
    invalidateForMaterialEdit: (input: MaterialEditEnvelopeInput) => invalidateEnvelopeForMaterialEdit(dependencies, input),
    replaceSigner: (input: ReplaceSignerEnvelopeInput) => replaceSignerEnvelope(dependencies, input),
    extend: (input: ExtendEnvelopeInput) => extendEnvelope(dependencies, input),
    refreshStatus: (envelopeId: string) => refreshEnvelopeStatus(dependencies, envelopeId),
  };
}

export async function prepareEnvelope(
  dependencies: PacketEnvelopeServiceDependencies,
  input: PrepareEnvelopeInput,
): Promise<PreparedEnvelopeResult> {
  assertPrepareInput(input);

  const frozenVersion = await dependencies.freezeApprovedVersion({
    packetId: input.packetId,
    packetVersionId: input.packetVersionId,
    requestedBy: input.requestedBy,
  });
  assertApprovedVersion(frozenVersion);

  const now = currentTimestamp(dependencies);
  const envelopeId = input.envelopeId ?? createEnvelopeId(dependencies);
  const packetVersionId = readPacketVersionId(frozenVersion);
  const packetVersionHash = readPacketVersionHash(frozenVersion);
  const requiredSignerIds = input.signers.map((signer) => signer.id);
  const envelopeBinding = createEnvelopeBinding({
    envelopeId,
    packetId: frozenVersion.packetId,
    packetVersionId,
    packetVersionHash,
    eventId: input.eventId,
    workflowId: input.workflowId,
  });

  const memberFormInstances: FormInstanceRow[] = [];
  const documents: SignaturePlacementDocument[] = [];

  for (const form of input.forms) {
    const formRequiredSignerIds = form.requiredSignerIds ?? requiredSignerIds;
    const createInput = createFormInstanceInput(
      form,
      frozenVersion.packetId,
      packetVersionId,
      packetVersionHash,
      input,
      envelopeBinding,
      formRequiredSignerIds,
    );
    const created = await dependencies.createFormInstance(createInput);
    const bound = withEnvelopeBindingMetadata(created, envelopeBinding);
    const formInstanceId = readRequiredString(
      bound,
      ["id", "instance_id", "formInstanceId", "form_instance_id"],
      "eCIgn form instance",
    );

    memberFormInstances.push(bound);
    documents.push(createSignaturePlacementDocument(form, formInstanceId));

    if (dependencies.bindFormInstanceToEnvelope !== undefined) {
      await dependencies.bindFormInstanceToEnvelope({
        envelopeId,
        formInstanceId,
        packetId: frozenVersion.packetId,
        packetVersionId,
        packetVersionHash,
        eventId: input.eventId,
        workflowId: input.workflowId,
      });
    }
  }

  const signaturePlacementMap = buildSignaturePlacementMap({
    envelopeId,
    contentHash: packetVersionHash,
    createdAt: now,
    documents,
    signers: input.signers,
  });
  const previewModel: EnvelopePreviewModel = {
    envelopeId,
    packetId: frozenVersion.packetId,
    packetVersionId,
    packetVersionHash,
    eventId: input.eventId,
    workflowId: input.workflowId,
    documents,
    signers: input.signers,
    signaturePlacementMap,
  };
  const envelope = makeEnvelopeRecord({
    id: envelopeId,
    packetId: frozenVersion.packetId,
    packetVersionId,
    packetVersionHash,
    eventId: input.eventId,
    workflowId: input.workflowId,
    status: "prepared",
    memberFormInstanceIds: memberFormInstances.map((instance) =>
      readRequiredString(instance, ["id", "instance_id", "formInstanceId", "form_instance_id"], "eCIgn form instance"),
    ),
    requiredSignerIds,
    signaturePlacementMap,
    previewModel,
    createdBy: input.requestedBy,
    createdAt: now,
    updatedAt: now,
  });
  const storedEnvelope = await dependencies.createEnvelopeRecord(envelope);

  if (dependencies.createSignerTask !== undefined) {
    for (const formInstance of memberFormInstances) {
      const formInstanceId = readRequiredString(
        formInstance,
        ["id", "instance_id", "formInstanceId", "form_instance_id"],
        "eCIgn form instance",
      );
      for (const signerId of requiredSignerIds) {
        await dependencies.createSignerTask({
          envelopeId,
          formInstanceId,
          signerId,
          packetId: frozenVersion.packetId,
          packetVersionId,
          packetVersionHash,
          eventId: input.eventId,
          workflowId: input.workflowId,
        });
      }
    }
  }

  return {
    envelope: storedEnvelope,
    memberFormInstances,
    signaturePlacementMap,
    previewModel,
  };
}

export async function sendEnvelope(
  dependencies: PacketEnvelopeServiceDependencies,
  input: SendEnvelopeInput,
): Promise<PacketEnvelope> {
  const envelope = await requireEnvelope(dependencies, input.envelopeId);
  assertEnvelopeStatus(envelope, ["prepared"], "send");
  const delegate = requireDelegate(dependencies.ecign.send, "send");
  const instances = await dependencies.listEnvelopeFormInstances(input.envelopeId);

  for (const instance of instances) {
    await delegate({
      envelopeId: input.envelopeId,
      formInstanceId: readRequiredString(
        instance,
        ["id", "instance_id", "formInstanceId", "form_instance_id"],
        "eCIgn form instance",
      ),
      actorId: input.actorId,
    });
  }

  return dependencies.updateEnvelopeRecord(
    withEnvelopePatch(envelope, {
      status: "sent",
      sentAt: currentTimestamp(dependencies),
      updatedAt: currentTimestamp(dependencies),
    }),
  );
}

export async function remindEnvelope(
  dependencies: PacketEnvelopeServiceDependencies,
  input: RemindEnvelopeInput,
): Promise<PacketEnvelope> {
  const envelope = await requireMutableEnvelope(dependencies, input.envelopeId, "remind");
  const delegate = requireDelegate(dependencies.ecign.remind, "remind");
  const instances = await dependencies.listEnvelopeFormInstances(input.envelopeId);

  for (const instance of filterInstancesForSigner(instances, input.signerId)) {
    await delegate({
      envelopeId: input.envelopeId,
      formInstanceId: readRequiredString(
        instance,
        ["id", "instance_id", "formInstanceId", "form_instance_id"],
        "eCIgn form instance",
      ),
      actorId: input.actorId,
    });
  }

  return refreshEnvelopeStatusFromRows(dependencies, envelope, instances);
}

export async function resendEnvelope(
  dependencies: PacketEnvelopeServiceDependencies,
  input: RemindEnvelopeInput,
): Promise<PacketEnvelope> {
  const envelope = await requireMutableEnvelope(dependencies, input.envelopeId, "resend");
  const delegate = requireDelegate(dependencies.ecign.resend, "resend");
  const instances = await dependencies.listEnvelopeFormInstances(input.envelopeId);

  for (const instance of filterInstancesForSigner(instances, input.signerId)) {
    await delegate({
      envelopeId: input.envelopeId,
      formInstanceId: readRequiredString(
        instance,
        ["id", "instance_id", "formInstanceId", "form_instance_id"],
        "eCIgn form instance",
      ),
      actorId: input.actorId,
    });
  }

  return refreshEnvelopeStatusFromRows(dependencies, envelope, instances);
}

export async function voidEnvelope(
  dependencies: PacketEnvelopeServiceDependencies,
  input: VoidEnvelopeInput,
): Promise<PacketEnvelope> {
  const envelope = await requireMutableEnvelope(dependencies, input.envelopeId, "void");
  const status = readEnvelopeStatus(envelope);
  if (status === "prepared") {
    return cancelEnvelope(dependencies, input);
  }

  const delegate = requireDelegate(dependencies.ecign.void, "void");
  const instances = await dependencies.listEnvelopeFormInstances(input.envelopeId);

  for (const instance of instances) {
    await delegate({
      envelopeId: input.envelopeId,
      formInstanceId: readRequiredString(
        instance,
        ["id", "instance_id", "formInstanceId", "form_instance_id"],
        "eCIgn form instance",
      ),
      actorId: input.actorId,
      reason: input.reason,
    });
  }

  const replacement = await maybeCreateReplacementVersion(dependencies, envelope, input);
  const patch: EnvelopePatch = {
    status: "voided",
    voidedAt: currentTimestamp(dependencies),
    voidedBy: input.actorId,
    voidReason: input.reason,
    updatedAt: currentTimestamp(dependencies),
  };
  if (replacement !== undefined) {
    patch.replacementPacketVersionId = replacement.packetVersionId;
  }

  return dependencies.updateEnvelopeRecord(withEnvelopePatch(envelope, patch));
}

export async function cancelEnvelope(
  dependencies: PacketEnvelopeServiceDependencies,
  input: VoidEnvelopeInput,
): Promise<PacketEnvelope> {
  const envelope = await requireMutableEnvelope(dependencies, input.envelopeId, "cancel");
  assertEnvelopeStatus(envelope, ["prepared"], "cancel");
  const instances = await dependencies.listEnvelopeFormInstances(input.envelopeId);

  if (dependencies.ecign.cancel !== undefined) {
    for (const instance of instances) {
      await dependencies.ecign.cancel({
        envelopeId: input.envelopeId,
        formInstanceId: readRequiredString(
          instance,
          ["id", "instance_id", "formInstanceId", "form_instance_id"],
          "eCIgn form instance",
        ),
        actorId: input.actorId,
        reason: input.reason,
      });
    }
  }

  return dependencies.updateEnvelopeRecord(
    withEnvelopePatch(envelope, {
      status: "canceled",
      canceledAt: currentTimestamp(dependencies),
      canceledBy: input.actorId,
      cancelReason: input.reason,
      updatedAt: currentTimestamp(dependencies),
    }),
  );
}

export async function replaceSignerEnvelope(
  dependencies: PacketEnvelopeServiceDependencies,
  input: ReplaceSignerEnvelopeInput,
): Promise<PacketEnvelope> {
  const envelope = await requireMutableEnvelope(dependencies, input.envelopeId, "replace-signer");
  const delegate = requireDelegate(dependencies.ecign.replaceSigner, "replace-signer");
  const instances = await dependencies.listEnvelopeFormInstances(input.envelopeId);

  for (const instance of instances) {
    await delegate({
      envelopeId: input.envelopeId,
      formInstanceId: readRequiredString(
        instance,
        ["id", "instance_id", "formInstanceId", "form_instance_id"],
        "eCIgn form instance",
      ),
      actorId: input.actorId,
      fromSignerId: input.fromSignerId,
      toSignerId: input.toSignerId,
      reason: input.reason,
    });
  }

  return refreshEnvelopeStatusFromRows(dependencies, envelope, instances);
}

export async function extendEnvelope(
  dependencies: PacketEnvelopeServiceDependencies,
  input: ExtendEnvelopeInput,
): Promise<PacketEnvelope> {
  const envelope = await requireMutableEnvelope(dependencies, input.envelopeId, "extend");
  const delegate = requireDelegate(dependencies.ecign.extend, "extend");
  const instances = await dependencies.listEnvelopeFormInstances(input.envelopeId);

  for (const instance of instances) {
    await delegate({
      envelopeId: input.envelopeId,
      formInstanceId: readRequiredString(
        instance,
        ["id", "instance_id", "formInstanceId", "form_instance_id"],
        "eCIgn form instance",
      ),
      actorId: input.actorId,
      expiresAt: input.expiresAt,
      reason: input.reason,
    });
  }

  return refreshEnvelopeStatusFromRows(dependencies, envelope, instances);
}

export async function refreshEnvelopeStatus(
  dependencies: PacketEnvelopeServiceDependencies,
  envelopeId: string,
): Promise<PacketEnvelope> {
  const envelope = await requireEnvelope(dependencies, envelopeId);
  const instances = await dependencies.listEnvelopeFormInstances(envelopeId);
  return refreshEnvelopeStatusFromRows(dependencies, envelope, instances);
}

export async function invalidateEnvelopeForMaterialEdit(
  dependencies: PacketEnvelopeServiceDependencies,
  input: MaterialEditEnvelopeInput,
): Promise<PacketEnvelope> {
  const envelope = await requireEnvelope(dependencies, input.envelopeId);
  const status = readEnvelopeStatus(envelope);

  if (isEnvelopeFullySigned(status)) {
    throw new Error("Cannot apply a material edit to a fully-signed packet envelope.");
  }
  if (status === "prepared") {
    return cancelEnvelope(dependencies, input);
  }
  if (status === "sent" || status === "delivered" || status === "viewed" || status === "partially-signed") {
    return voidEnvelope(dependencies, input);
  }

  throw new Error(`Cannot apply a material edit to packet envelope from status ${status ?? "unknown"}.`);
}

function assertPrepareInput(input: PrepareEnvelopeInput): void {
  if (input.forms.length === 0) {
    throw new Error("Packet envelope preparation requires at least one form.");
  }
  if (input.signers.length === 0) {
    throw new Error("Packet envelope preparation requires at least one signer.");
  }
}

function createFormInstanceInput(
  form: EnvelopeFormPreparation,
  packetId: string,
  packetVersionId: string,
  packetVersionHash: string,
  input: PrepareEnvelopeInput,
  envelopeBinding: CreateEnvelopeFormInstanceInput["envelopeBinding"],
  requiredSignerIds: readonly string[],
): CreateEnvelopeFormInstanceInput {
  const createInput: CreateEnvelopeFormInstanceInput = {
    envelopeId: envelopeBinding.envelopeId,
    packetId,
    packetVersionId,
    packetVersionHash,
    eventId: input.eventId,
    workflowId: input.workflowId,
    formId: form.formId,
    required_signers: requiredSignerIds,
    requiredSigners: requiredSignerIds,
    envelopeBinding,
  };

  if (form.formTemplateId !== undefined) {
    createInput.formTemplateId = form.formTemplateId;
  }
  if (form.preSignatureArtifactId !== undefined) {
    createInput.preSignatureArtifactId = form.preSignatureArtifactId;
  }

  return createInput;
}

function createSignaturePlacementDocument(
  form: EnvelopeFormPreparation,
  formInstanceId: string,
): SignaturePlacementDocument {
  const document: SignaturePlacementDocument = {
    formId: form.formId,
    formInstanceId,
  };

  if (form.title !== undefined) {
    document.title = form.title;
  }
  if (form.pageCount !== undefined) {
    document.pageCount = form.pageCount;
  }
  if (form.signatureFields !== undefined) {
    document.fields = form.signatureFields;
  }

  return document;
}

function makeEnvelopeRecord(input: {
  id: string;
  packetId: string;
  packetVersionId: string;
  packetVersionHash: string;
  eventId: string;
  workflowId: string;
  status: string;
  memberFormInstanceIds: readonly string[];
  requiredSignerIds: readonly string[];
  signaturePlacementMap: SignaturePlacementMap;
  previewModel: EnvelopePreviewModel;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}): PacketEnvelope {
  return {
    id: input.id,
    packetId: input.packetId,
    packetVersionId: input.packetVersionId,
    versionId: input.packetVersionId,
    packetVersionHash: input.packetVersionHash,
    contentHash: input.packetVersionHash,
    eventId: input.eventId,
    workflowId: input.workflowId,
    status: input.status,
    memberFormInstanceIds: input.memberFormInstanceIds,
    formInstanceIds: input.memberFormInstanceIds,
    requiredSignerIds: input.requiredSignerIds,
    signaturePlacementMap: input.signaturePlacementMap,
    previewModel: input.previewModel,
    preview: input.previewModel,
    createdBy: input.createdBy,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  } as unknown as PacketEnvelope;
}

async function requireEnvelope(
  dependencies: PacketEnvelopeServiceDependencies,
  envelopeId: string,
): Promise<PacketEnvelope> {
  const envelope = await dependencies.getEnvelopeRecord(envelopeId);
  if (envelope === undefined) {
    throw new Error(`Packet envelope ${envelopeId} was not found.`);
  }

  return envelope;
}

async function requireMutableEnvelope(
  dependencies: PacketEnvelopeServiceDependencies,
  envelopeId: string,
  operation: string,
): Promise<PacketEnvelope> {
  const envelope = await requireEnvelope(dependencies, envelopeId);
  const status = readEnvelopeStatus(envelope);
  if (isEnvelopeFullySigned(status)) {
    throw new Error(`Cannot ${operation} a fully-signed packet envelope.`);
  }

  return envelope;
}

function assertEnvelopeStatus(envelope: PacketEnvelope, allowed: readonly string[], operation: string): void {
  const status = readEnvelopeStatus(envelope);
  if (status === undefined || !allowed.includes(status)) {
    throw new Error(`Cannot ${operation} packet envelope from status ${status ?? "unknown"}.`);
  }
}

function assertApprovedVersion(frozenVersion: FrozenPacketVersion): void {
  const approvalStatus = (frozenVersion.approvalStatus ?? frozenVersion.status)?.toLowerCase();
  if (approvalStatus !== "approved") {
    throw new Error("An envelope must NOT be created from an unapproved draft.");
  }
}

function readPacketVersionId(frozenVersion: FrozenPacketVersion): string {
  const packetVersionId = frozenVersion.packetVersionId ?? frozenVersion.versionId ?? frozenVersion.id;
  if (packetVersionId === undefined || packetVersionId.trim() === "") {
    throw new Error("Frozen packet version is missing its version id.");
  }

  return packetVersionId;
}

function readPacketVersionHash(frozenVersion: FrozenPacketVersion): string {
  const hash = frozenVersion.contentHash ?? frozenVersion.packetHash ?? frozenVersion.hash;
  if (hash === undefined || hash.trim() === "") {
    throw new Error("Frozen packet version is missing its content hash.");
  }

  return hash;
}

function requireDelegate<TDelegate>(delegate: TDelegate | undefined, name: string): TDelegate {
  if (delegate === undefined) {
    throw new Error(`eCIgn ${name} delegate is not configured.`);
  }

  return delegate;
}

async function refreshEnvelopeStatusFromRows(
  dependencies: PacketEnvelopeServiceDependencies,
  envelope: PacketEnvelope,
  instances: readonly FormInstanceRow[],
): Promise<PacketEnvelope> {
  const signatures = await dependencies.listEnvelopeSignatures(readRequiredString(envelope, ["id"], "packet envelope"));
  const status = deriveEnvelopeStatus({ instances, signatures });

  return dependencies.updateEnvelopeRecord(
    withEnvelopePatch(envelope, {
      status,
      updatedAt: currentTimestamp(dependencies),
    }),
  );
}

async function maybeCreateReplacementVersion(
  dependencies: PacketEnvelopeServiceDependencies,
  envelope: PacketEnvelope,
  input: VoidEnvelopeInput,
): Promise<ReplacementPacketVersion | undefined> {
  if (dependencies.createReplacementVersion === undefined) {
    return undefined;
  }

  return dependencies.createReplacementVersion({
    envelopeId: input.envelopeId,
    packetId: readRequiredString(envelope, ["packetId"], "packet envelope"),
    packetVersionId: readRequiredString(envelope, ["packetVersionId", "versionId"], "packet envelope"),
    packetVersionHash: readRequiredString(envelope, ["packetVersionHash", "contentHash"], "packet envelope"),
    requestedBy: input.actorId,
    reason: input.reason,
  });
}

function filterInstancesForSigner(
  instances: readonly FormInstanceRow[],
  signerId: string | undefined,
): readonly FormInstanceRow[] {
  if (signerId === undefined) {
    return instances;
  }

  return instances.filter((instance) => {
    const requiredSigners = readArray(instance, ["required_signers", "requiredSigners"]);
    return requiredSigners.some((requiredSigner) => requiredSignerMatches(requiredSigner, signerId));
  });
}

function requiredSignerMatches(requiredSigner: unknown, signerId: string): boolean {
  if (typeof requiredSigner === "string") {
    return requiredSigner === signerId;
  }
  if (requiredSigner === null || typeof requiredSigner !== "object") {
    return false;
  }

  const signerKeys = ["user_id", "userId", "signer_user_id", "signerUserId", "id", "field_id", "fieldId"];
  return readString(requiredSigner, signerKeys) === signerId;
}

function readEnvelopeStatus(envelope: PacketEnvelope): string | undefined {
  return normalizeEnvelopeStatus(readString(envelope, ["status", "state"]));
}

function withEnvelopePatch(envelope: PacketEnvelope, patch: EnvelopePatch): PacketEnvelope {
  return {
    ...envelope,
    ...patch,
  } as PacketEnvelope;
}

function currentTimestamp(dependencies: PacketEnvelopeServiceDependencies): string {
  return (dependencies.now?.() ?? new Date()).toISOString();
}

function createEnvelopeId(dependencies: PacketEnvelopeServiceDependencies): string {
  if (dependencies.createEnvelopeId !== undefined) {
    return dependencies.createEnvelopeId();
  }

  return `penv_${Math.random().toString(36).slice(2, 12)}`;
}

function readRequiredString(record: unknown, keys: readonly string[], label: string): string {
  const value = readString(record, keys);
  if (value === undefined) {
    throw new Error(`${label} is missing ${keys.join("/")}.`);
  }

  return value;
}

function readString(record: unknown, keys: readonly string[]): string | undefined {
  if (record === null || typeof record !== "object") {
    return undefined;
  }

  const values = record as Record<string, unknown>;
  for (const key of keys) {
    const value = values[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return undefined;
}

function readArray(record: unknown, keys: readonly string[]): readonly unknown[] {
  if (record === null || typeof record !== "object") {
    return [];
  }

  const values = record as Record<string, unknown>;
  for (const key of keys) {
    const value = values[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}
