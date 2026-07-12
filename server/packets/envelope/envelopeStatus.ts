import type { FormInstanceRow, SignatureRow } from "../../ecign/store";
import { allRequiredSigned } from "../../ecign/stateMachine";

export const PACKET_ENVELOPE_ROLLUP_STATUSES = [
  "unknown",
  "prepared",
  "sent",
  "partially-signed",
  "fully-signed",
  "canceled",
  "voided",
  "expired",
  "declined",
  "mixed",
] as const;

export type PacketEnvelopeRollupStatus = (typeof PACKET_ENVELOPE_ROLLUP_STATUSES)[number];

export interface EnvelopeStatusRollupInput {
  instances: readonly FormInstanceRow[];
  signatures?: readonly SignatureRow[];
}

const requiredSigned = allRequiredSigned as unknown as (
  instance: FormInstanceRow,
  signatures: readonly SignatureRow[],
) => boolean;

const canceledStates = new Set(["cancel", "canceled", "cancelled"]);
const declinedStates = new Set(["decline", "declined", "rejected"]);
const expiredStates = new Set(["expire", "expired"]);
const preparedStates = new Set(["draft", "created", "prepared", "ready", "frozen"]);
const sentStates = new Set(["sent", "delivered", "viewed", "opened", "reminded", "resent"]);
const signedStates = new Set(["signed", "fully-signed", "fully_signed", "completed", "complete", "executed"]);
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

  if (allInstancesSigned) {
    return "fully-signed";
  }
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
  if (states.some((state) => state !== undefined && signedStates.has(state))) {
    return "partially-signed";
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
  return (
    status === "fully-signed" ||
    status === "voided" ||
    status === "canceled" ||
    status === "expired" ||
    status === "declined"
  );
}

export function isEnvelopeFullySigned(status: string | undefined): boolean {
  return status === "fully-signed" || status === "fully_signed" || status === "completed" || status === "complete";
}

function isInstanceFullySigned(
  instance: FormInstanceRow,
  signatures: readonly SignatureRow[],
  state: string | undefined,
): boolean {
  if (state !== undefined && signedStates.has(state)) {
    return true;
  }

  try {
    return requiredSigned(instance, signatures);
  } catch {
    return false;
  }
}

function readInstanceState(instance: FormInstanceRow): string | undefined {
  return readString(instance, ["state", "status", "signatureState", "signature_state"])?.toLowerCase();
}

function signaturesForInstance(
  instance: FormInstanceRow,
  signatures: readonly SignatureRow[],
): readonly SignatureRow[] {
  const instanceId = readString(instance, ["id", "formInstanceId", "form_instance_id"]);
  if (instanceId === undefined) {
    return signatures;
  }

  const matching = signatures.filter((signature) => {
    const signatureInstanceId = readString(signature, ["formInstanceId", "form_instance_id", "instanceId"]);
    return signatureInstanceId === undefined || signatureInstanceId === instanceId;
  });

  return matching.length > 0 ? matching : signatures;
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
