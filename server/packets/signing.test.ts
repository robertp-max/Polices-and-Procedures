import { describe, expect, it, vi } from "vitest";
import type { PacketEnvelope } from "@/policy/packets/contracts";
import type { FormInstanceRow, SignatureRow } from "../ecign/store";
import {
  createPacketEnvelopeService,
  type PacketEnvelopeServiceDependencies,
} from "./envelope/envelopeService";
import {
  buildSignatureStatusSteps,
  normalizeSignatureStatus,
  signatureStatusLabel,
} from "@/v6/screens/packets/signing/SignatureTracking";

const fixedNow = new Date("2026-07-12T12:00:00.000Z");

describe("packet signing lifecycle", () => {
  it("binds the envelope to the approved packet version and content hash", async () => {
    const createdInstances: unknown[] = [];
    const signerTasks: unknown[] = [];
    const storedEnvelopes: PacketEnvelope[] = [];
    const service = createPacketEnvelopeService(
      createDependencies({
        createFormInstance: async (input) => {
          createdInstances.push(input);
          return {
            instance_id: `fi-${createdInstances.length}`,
            state: "prepared",
            required_signers: input.required_signers,
          } as unknown as FormInstanceRow;
        },
        createEnvelopeRecord: async (envelope) => {
          storedEnvelopes.push(envelope);
          return envelope;
        },
        createSignerTask: async (input) => {
          signerTasks.push(input);
        },
      }),
    );

    const result = await service.prepare({
      envelopeId: "env-approved",
      packetId: "packet-q2",
      packetVersionId: "version-7",
      eventId: "qapi-q2-event",
      workflowId: "QA-WF-03",
      requestedBy: "quality-coordinator",
      signers: [{ id: "administrator", role: "Administrator", routingOrder: 1 }],
      forms: [{ formId: "qapi-approval", pageCount: 3 }],
    });

    expect(storedEnvelopes).toHaveLength(1);
    expect(read(result.envelope, "packetVersionId")).toBe("version-7");
    expect(read(result.envelope, "contentHash")).toBe("sha256-approved");
    expect(read(result.envelope, "eventId")).toBe("qapi-q2-event");
    expect(read(result.envelope, "workflowId")).toBe("QA-WF-03");
    expect(read(createdInstances[0], "packetVersionHash")).toBe("sha256-approved");
    expect(result.signaturePlacementMap.contentHash).toBe("sha256-approved");
    expect(result.signaturePlacementMap.placements).toEqual([
      expect.objectContaining({
        formInstanceId: "fi-1",
        signerId: "administrator",
        page: 3,
      }),
    ]);
    expect(signerTasks).toEqual([
      expect.objectContaining({
        envelopeId: "env-approved",
        formInstanceId: "fi-1",
        signerId: "administrator",
        packetVersionId: "version-7",
        packetVersionHash: "sha256-approved",
      }),
    ]);
  });

  it("routes a material edit after prepare to cancel and preserves the prepared audit path", async () => {
    const cancelDelegate = vi.fn(async () => undefined);
    const replacementVersion = vi.fn(async () => ({
      packetVersionId: "version-unused",
      contentHash: "sha256-unused",
    }));
    const updates: PacketEnvelope[] = [];
    const service = createPacketEnvelopeService(
      createDependencies({
        getEnvelopeRecord: async () => envelopeRecord({ status: "prepared" }),
        listEnvelopeFormInstances: async () => [
          {
            instance_id: "fi-1",
            state: "prepared",
            required_signers: ["administrator"],
          } as unknown as FormInstanceRow,
        ],
        updateEnvelopeRecord: async (envelope) => {
          updates.push(envelope);
          return envelope;
        },
        createReplacementVersion: replacementVersion,
        ecign: { cancel: cancelDelegate },
      }),
    );

    await service.invalidateForMaterialEdit({
      envelopeId: "env-1",
      actorId: "quality-coordinator",
      reason: "material content changed before send",
    });

    expect(cancelDelegate).toHaveBeenCalledWith({
      envelopeId: "env-1",
      formInstanceId: "fi-1",
      actorId: "quality-coordinator",
      reason: "material content changed before send",
    });
    expect(replacementVersion).not.toHaveBeenCalled();
    expect(read(updates[0], "status")).toBe("canceled");
    expect(read(updates[0], "cancelReason")).toBe("material content changed before send");
  });

  it("routes a material edit after send to void and create a replacement packet version", async () => {
    const voidDelegate = vi.fn(async () => undefined);
    const replacementVersion = vi.fn(async () => ({
      packetVersionId: "version-8",
      contentHash: "sha256-replacement",
    }));
    const updates: PacketEnvelope[] = [];
    const service = createPacketEnvelopeService(
      createDependencies({
        getEnvelopeRecord: async () => envelopeRecord({ status: "sent" }),
        listEnvelopeFormInstances: async () => [
          {
            instance_id: "fi-1",
            state: "sent",
            required_signers: ["administrator"],
          } as unknown as FormInstanceRow,
        ],
        updateEnvelopeRecord: async (envelope) => {
          updates.push(envelope);
          return envelope;
        },
        createReplacementVersion: replacementVersion,
        ecign: { void: voidDelegate },
      }),
    );

    await service.invalidateForMaterialEdit({
      envelopeId: "env-1",
      actorId: "quality-coordinator",
      reason: "material content changed after send",
    });

    expect(voidDelegate).toHaveBeenCalledWith({
      envelopeId: "env-1",
      formInstanceId: "fi-1",
      actorId: "quality-coordinator",
      reason: "material content changed after send",
    });
    expect(replacementVersion).toHaveBeenCalledWith({
      envelopeId: "env-1",
      packetId: "packet-1",
      packetVersionId: "version-7",
      packetVersionHash: "sha256-approved",
      requestedBy: "quality-coordinator",
      reason: "material content changed after send",
    });
    expect(read(updates[0], "status")).toBe("voided");
    expect(read(updates[0], "replacementPacketVersionId")).toBe("version-8");
  });

  it("keeps a fully signed envelope immutable across void, signer replacement, extension, and material edit", async () => {
    const voidDelegate = vi.fn(async () => undefined);
    const replaceDelegate = vi.fn(async () => undefined);
    const extendDelegate = vi.fn(async () => undefined);
    const updateEnvelopeRecord = vi.fn(async (envelope: PacketEnvelope) => envelope);
    const service = createPacketEnvelopeService(
      createDependencies({
        getEnvelopeRecord: async () => envelopeRecord({ status: "COMPLETED" }),
        updateEnvelopeRecord,
        ecign: {
          void: voidDelegate,
          replaceSigner: replaceDelegate,
          extend: extendDelegate,
        },
      }),
    );

    await expect(
      service.void({
        envelopeId: "env-1",
        actorId: "quality-coordinator",
        reason: "late correction",
      }),
    ).rejects.toThrow("Cannot void a fully-signed packet envelope.");
    await expect(
      service.replaceSigner({
        envelopeId: "env-1",
        actorId: "quality-coordinator",
        fromSignerId: "administrator",
        toSignerId: "director-of-nursing",
        reason: "coverage change",
      }),
    ).rejects.toThrow("Cannot replace-signer a fully-signed packet envelope.");
    await expect(
      service.extend({
        envelopeId: "env-1",
        actorId: "quality-coordinator",
        expiresAt: "2026-08-12T00:00:00.000Z",
        reason: "more time",
      }),
    ).rejects.toThrow("Cannot extend a fully-signed packet envelope.");
    await expect(
      service.invalidateForMaterialEdit({
        envelopeId: "env-1",
        actorId: "quality-coordinator",
        reason: "material edit",
      }),
    ).rejects.toThrow("Cannot apply a material edit to a fully-signed packet envelope.");

    expect(voidDelegate).not.toHaveBeenCalled();
    expect(replaceDelegate).not.toHaveBeenCalled();
    expect(extendDelegate).not.toHaveBeenCalled();
    expect(updateEnvelopeRecord).not.toHaveBeenCalled();
  });

  it("labels every FR-028 tracking state without turning unknown status into prepared", () => {
    expect(normalizeSignatureStatus("partially-signed")).toBe("PARTIALLY_SIGNED");
    expect(normalizeSignatureStatus("fully-signed")).toBe("COMPLETED");
    expect(normalizeSignatureStatus(undefined)).toBe("unknown");
    expect(signatureStatusLabel("PARTIALLY_SIGNED")).toBe("partially signed");
    expect(signatureStatusLabel("unknown")).toBe("unknown");

    const labels = buildSignatureStatusSteps("VIEWED").map((step) => `${step.label}:${step.state}`);

    expect(labels).toContain("prepared:completed");
    expect(labels).toContain("sent:completed");
    expect(labels).toContain("delivered:completed");
    expect(labels).toContain("viewed:current");
    expect(labels).toContain("partially signed:pending");
    expect(labels).toContain("completed:pending");
    expect(labels).toContain("declined:pending");
    expect(labels).toContain("expired:pending");
    expect(labels).toContain("voided:pending");
    expect(labels).toContain("failed:pending");
  });
});

function createDependencies(
  overrides: Partial<PacketEnvelopeServiceDependencies> = {},
): PacketEnvelopeServiceDependencies {
  const defaults: PacketEnvelopeServiceDependencies = {
    now: () => fixedNow,
    createEnvelopeId: () => "env-1",
    freezeApprovedVersion: async () => ({
      packetId: "packet-1",
      packetVersionId: "version-7",
      status: "approved",
      contentHash: "sha256-approved",
    }),
    createEnvelopeRecord: async (envelope) => envelope,
    updateEnvelopeRecord: async (envelope) => envelope,
    getEnvelopeRecord: async () => envelopeRecord({ status: "prepared" }),
    createFormInstance: async (input) =>
      ({
        instance_id: "fi-1",
        state: "prepared",
        required_signers: input.required_signers,
      }) as unknown as FormInstanceRow,
    listEnvelopeFormInstances: async () => [
      {
        instance_id: "fi-1",
        state: "prepared",
        required_signers: ["administrator"],
      } as unknown as FormInstanceRow,
    ],
    listEnvelopeSignatures: async () => [] as SignatureRow[],
    ecign: {
      send: async () => undefined,
      remind: async () => undefined,
      resend: async () => undefined,
      void: async () => undefined,
      cancel: async () => undefined,
      replaceSigner: async () => undefined,
      extend: async () => undefined,
    },
  };

  return {
    ...defaults,
    ...overrides,
    ecign: {
      ...defaults.ecign,
      ...(overrides.ecign ?? {}),
    },
  };
}

function envelopeRecord(overrides: Record<string, unknown>): PacketEnvelope {
  return {
    id: "env-1",
    packetId: "packet-1",
    packetVersionId: "version-7",
    packetVersionHash: "sha256-approved",
    contentHash: "sha256-approved",
    status: "prepared",
    ...overrides,
  } as unknown as PacketEnvelope;
}

function read(record: unknown, key: string): unknown {
  if (record === null || typeof record !== "object") return undefined;
  return (record as Record<string, unknown>)[key];
}
