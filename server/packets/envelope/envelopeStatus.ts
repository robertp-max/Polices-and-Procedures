import type { FormInstanceRow, SignatureRow } from "../../ecign/store";

export const PACKET_ENVELOPE_ROLLUP_STATUSES = [
  "unknown",
  "prepared",
  "sent",
  "delivered",
  "viewed",
  "partially-signed",
  "fully-signed",
  "canceled",
  "voided",
  "expired",
  "declined",
  "failed",
  "mixed",
] as const;

export type PacketEnvelopeRollupStatus = (typeof PACKET_ENVELOPE_ROLLUP_STATUSES)[number];

export interface EnvelopeStatusRollupInput {
  instances: readonly FormInstanceRow[];
  signatures?: readonly SignatureRow[];
}

const canceledStates = new Set(["cancel", "canceled", "cancelled"]);
const declinedStates = new Set(["decline", "declined", "rejected"]);
const expiredStates = new Set(["expire", "expired"]);
const failedStates = new Set(["fail", "failed"]);
const preparedStates = new Set(["draft", "created", "prepared", "ready", "frozen"]);
const sentStates = new Set(["sent", "reminded", "resent"]);
const deliveredStates = new Set(["delivered", "disclosed"]);
const viewedStates = new Set(["viewed", "opened", "verified", "reviewed", "attested"]);
const partiallySignedStates = new Set(["partial", "partially-signed"]);
const signedStates = new Set(["signed", "fully-signed", "completed", "complete", "executed", "signed-locked"]);
const voidedStates = new Set(["void", "voided"]);

export function deriveEnvelopeStatus(input: EnvelopeStatusRollupInput): PacketEnvelopeRollupStatus {
  if (input.instances.length === 0) {
    return "unknown";
  }

  const signatures = input.signatures ?? [];
  const states = input.instances.map((instance) => readInstanceState(instance));
  const allInstancesSigned = input.instances.every((instance) =>
    isInstanceFullySigned(instance, signaturesForInstance(instance, signatures), readInstanceState(instance)),
  );

  if (states.some((state) => state !== undefined && voidedStates.has(state))) {
    return "voided";
  }
  if (states.some((state) => state !== undefined && canceledStates.has(state))) {
    return "canceled";
  }
  if (states.some((state) => state !== undefined && declinedStates.has(state))) {
    return "declined";
  }
  if (states.some((state) => state !== undefined && expiredStates.has(state))) {
    return "expired";
  }
  if (states.some((state) => state !== undefined && failedStates.has(state))) {
    return "failed";
  }
  if (allInstancesSigned) {
    return "fully-signed";
  }
  if (
    input.instances.some((instance) => {
      const state = readInstanceState(instance);
      return (
        (state !== undefined && (partiallySignedStates.has(state) || signedStates.has(state))) ||
        signaturesForInstance(instance, signatures).length > 0
      );
    })
  ) {
    return "partially-signed";
  }
  if (states.some((state) => state !== undefined && viewedStates.has(state))) {
    return "viewed";
  }
  if (states.some((state) => state !== undefined && deliveredStates.has(state))) {
    return "delivered";
  }
  if (states.some((state) => state !== undefined && sentStates.has(state))) {
    return "sent";
  }
  if (states.every((state) => state !== undefined && preparedStates.has(state))) {
    return "prepared";
  }
  if (states.some((state) => state === undefined)) {
    return "unknown";
  }

  return "mixed";
}

export function isEnvelopeTerminal(status: string | undefined): boolean {
  const normalized = normalizeEnvelopeStatus(status);
  return (
    normalized === "fully-signed" ||
    normalized === "completed" ||
    normalized === "complete" ||
    normalized === "signed-locked" ||
    normalized === "voided" ||
    normalized === "canceled" ||
    normalized === "expired" ||
    normalized === "declined" ||
    normalized === "failed"
  );
}

export function isEnvelopeFullySigned(status: string | undefined): boolean {
  const normalized = normalizeEnvelopeStatus(status);
  return (
    normalized === "fully-signed" ||
    normalized === "completed" ||
    normalized === "complete" ||
    normalized === "signed-locked"
  );
}

export function normalizeEnvelopeStatus(status: string | undefined): string | undefined {
  const trimmed = status?.trim();
  if (trimmed === undefined || trimmed === "") {
    return undefined;
  }

  return trimmed.toLowerCase().replace(/[_\s]+/g, "-");
}

function isInstanceFullySigned(
  instance: FormInstanceRow,
  signatures: readonly SignatureRow[],
  state: string | undefined,
): boolean {
  if (state !== undefined && signedStates.has(state)) {
    return true;
  }

  return allRequiredSignaturesPresent(instance, signatures);
}

function readInstanceState(instance: FormInstanceRow): string | undefined {
  return normalizeEnvelopeStatus(readString(instance, ["state", "status", "signatureState", "signature_state"]));
}

function signaturesForInstance(
  instance: FormInstanceRow,
  signatures: readonly SignatureRow[],
): readonly SignatureRow[] {
  const instanceId = readString(instance, ["id", "instance_id", "formInstanceId", "form_instance_id"]);
  if (instanceId === undefined) {
    return signatures;
  }

  const instanceIdKeys = ["instance_id", "formInstanceId", "form_instance_id", "instanceId"];
  const hasScopedSignatures = signatures.some((signature) => readString(signature, instanceIdKeys) !== undefined);
  if (!hasScopedSignatures) {
    return signatures;
  }

  return signatures.filter((signature) => readString(signature, instanceIdKeys) === instanceId);
}

function allRequiredSignaturesPresent(instance: FormInstanceRow, signatures: readonly SignatureRow[]): boolean {
  const requiredSigners = readArray(instance, ["required_signers", "requiredSigners"]);
  if (requiredSigners.length === 0) {
    return false;
  }

  const signedFieldIds = new Set(readSignatureValues(signatures, ["field_id", "fieldId"]));
  const signedSignerIds = new Set(
    readSignatureValues(signatures, ["signer_user_id", "signerUserId", "signerId", "user_id", "userId"]),
  );

  return requiredSigners.every((requiredSigner) =>
    isRequiredSignerSatisfied(requiredSigner, signedFieldIds, signedSignerIds),
  );
}

function isRequiredSignerSatisfied(
  requiredSigner: unknown,
  signedFieldIds: ReadonlySet<string>,
  signedSignerIds: ReadonlySet<string>,
): boolean {
  if (typeof requiredSigner === "string") {
    return signedFieldIds.has(requiredSigner) || signedSignerIds.has(requiredSigner);
  }
  if (requiredSigner === null || typeof requiredSigner !== "object") {
    return false;
  }

  const fieldId = readString(requiredSigner, ["field_id", "fieldId"]);
  if (fieldId !== undefined) {
    return signedFieldIds.has(fieldId);
  }

  const signerId = readString(requiredSigner, ["user_id", "userId", "signer_user_id", "signerUserId", "id"]);
  return signerId !== undefined && signedSignerIds.has(signerId);
}

function readSignatureValues(signatures: readonly SignatureRow[], keys: readonly string[]): string[] {
  return signatures.flatMap((signature) => {
    const value = readString(signature, keys);
    return value === undefined ? [] : [value];
  });
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
