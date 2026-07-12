export interface EnvelopeBindingRecord {
  envelopeId: string;
  packetId: string;
  packetVersionId: string;
  packetVersionHash: string;
  eventId?: string;
  workflowId?: string;
}

export interface CreateEnvelopeBindingInput {
  envelopeId: string;
  packetId: string;
  packetVersionId: string;
  packetVersionHash: string;
  eventId?: string;
  workflowId?: string;
}

export function createEnvelopeBinding(input: CreateEnvelopeBindingInput): EnvelopeBindingRecord {
  if (input.envelopeId.trim() === "") {
    throw new Error("Envelope binding requires an envelope id.");
  }
  if (input.packetId.trim() === "") {
    throw new Error("Envelope binding requires a packet id.");
  }
  if (input.packetVersionId.trim() === "") {
    throw new Error("Envelope binding requires a packet version id.");
  }
  if (input.packetVersionHash.trim() === "") {
    throw new Error("Envelope binding requires a packet version hash.");
  }

  const binding: EnvelopeBindingRecord = {
    envelopeId: input.envelopeId,
    packetId: input.packetId,
    packetVersionId: input.packetVersionId,
    packetVersionHash: input.packetVersionHash,
  };

  if (input.eventId !== undefined) {
    binding.eventId = input.eventId;
  }
  if (input.workflowId !== undefined) {
    binding.workflowId = input.workflowId;
  }

  return binding;
}

export function withEnvelopeBindingMetadata<TRecord extends object>(
  row: TRecord,
  binding: EnvelopeBindingRecord,
): TRecord & { envelopeBinding: EnvelopeBindingRecord } {
  return {
    ...row,
    envelopeBinding: binding,
  };
}

export function hasEnvelopeBinding(
  row: object,
  binding: Pick<EnvelopeBindingRecord, "envelopeId" | "packetVersionId" | "packetVersionHash">,
): boolean {
  const candidate = row as {
    envelopeBinding?: Partial<EnvelopeBindingRecord>;
    envelopeId?: unknown;
    packetVersionId?: unknown;
    packetVersionHash?: unknown;
  };
  const envelopeBinding = candidate.envelopeBinding;

  if (envelopeBinding !== undefined) {
    return (
      envelopeBinding.envelopeId === binding.envelopeId &&
      envelopeBinding.packetVersionId === binding.packetVersionId &&
      envelopeBinding.packetVersionHash === binding.packetVersionHash
    );
  }

  return (
    candidate.envelopeId === binding.envelopeId &&
    candidate.packetVersionId === binding.packetVersionId &&
    candidate.packetVersionHash === binding.packetVersionHash
  );
}
