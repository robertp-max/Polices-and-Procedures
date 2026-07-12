import { describe, expect, it, vi } from "vitest";
import type { PacketEnvelope } from "@/policy/packets/contracts";
import type { FormInstanceRow, SignatureRow } from "../../ecign/store";
import { createEnvelopeBinding, withEnvelopeBindingMetadata } from "../../ecign/envelopeBindings";
import { createPacketEnvelopeService, type PacketEnvelopeServiceDependencies } from "./envelopeService";

const fixedNow = new Date("2026-07-12T12:00:00.000Z");

describe("packet envelope service", () => {
  it("binds an envelope to the frozen packet version and content hash", async () => {
    const createdInstances: unknown[] = [];
    const signerTasks: unknown[] = [];
    const storedEnvelopes: PacketEnvelope[] = [];
    const dependencies = createDependencies({
      createFormInstance: async (input) => {
        createdInstances.push(input);
        return {
          id: `fi-${createdInstances.length}`,
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
    });
    const service = createPacketEnvelopeService(dependencies);

    const result = await service.prepare({
      envelopeId: "env-1",
      packetId: "packet-1",
      packetVersionId: "version-7",
      eventId: "event-1",
      workflowId: "workflow-1",
      requestedBy: "coordinator-1",
      signers: [{ id: "signer-1", routingOrder: 1 }],
      forms: [{ formId: "form-1", pageCount: 2 }],
    });

    expect(storedEnvelopes).toHaveLength(1);
    expect(read(result.envelope, "packetVersionId")).toBe("version-7");
    expect(read(result.envelope, "contentHash")).toBe("sha256-approved");
    expect(read(result.envelope, "eventId")).toBe("event-1");
    expect(read(result.envelope, "workflowId")).toBe("workflow-1");
    expect(read(createdInstances[0], "packetVersionHash")).toBe("sha256-approved");
    expect(read(createdInstances[0], "required_signers")).toEqual(["signer-1"]);
    expect(result.signaturePlacementMap.contentHash).toBe("sha256-approved");
    expect(result.signaturePlacementMap.placements).toEqual([
      expect.objectContaining({
        formInstanceId: "fi-1",
        signerId: "signer-1",
        page: 2,
      }),
    ]);
    expect(signerTasks).toEqual([
      expect.objectContaining({
        envelopeId: "env-1",
        formInstanceId: "fi-1",
        signerId: "signer-1",
        packetVersionHash: "sha256-approved",
      }),
    ]);
  });

  it("rejects an unapproved draft before creating eCIgn instances", async () => {
    const createFormInstance: PacketEnvelopeServiceDependencies["createFormInstance"] = vi.fn(async () =>
      ({
        id: "unused",
        state: "prepared",
      }) as unknown as FormInstanceRow,
    );
    const service = createPacketEnvelopeService(
      createDependencies({
        freezeApprovedVersion: async () => ({
          packetId: "packet-1",
          packetVersionId: "version-draft",
          status: "draft",
          contentHash: "sha256-draft",
        }),
        createFormInstance,
      }),
    );

    await expect(
      service.prepare({
        envelopeId: "env-draft",
        packetId: "packet-1",
        packetVersionId: "version-draft",
        eventId: "event-1",
        workflowId: "workflow-1",
        requestedBy: "coordinator-1",
        signers: [{ id: "signer-1" }],
        forms: [{ formId: "form-1", pageCount: 1 }],
      }),
    ).rejects.toThrow("An envelope must NOT be created from an unapproved draft.");
    expect(createFormInstance).not.toHaveBeenCalled();
  });

  it("voids sent envelopes without mutating existing eCIgn audit rows", async () => {
    const auditRows = Object.freeze(["prepared:audit", "sent:audit"]);
    const formInstance = {
      id: "fi-1",
      state: "sent",
      auditRows,
      required_signers: ["signer-1"],
    } as unknown as FormInstanceRow;
    const voidDelegate = vi.fn(async () => undefined);
    const updated: PacketEnvelope[] = [];
    const service = createPacketEnvelopeService(
      createDependencies({
        getEnvelopeRecord: async () => envelopeRecord({ status: "sent" }),
        listEnvelopeFormInstances: async () => [formInstance],
        updateEnvelopeRecord: async (envelope) => {
          updated.push(envelope);
          return envelope;
        },
        ecign: { void: voidDelegate },
      }),
    );

    await service.void({
      envelopeId: "env-1",
      actorId: "coordinator-1",
      reason: "Signer information changed",
    });

    expect(voidDelegate).toHaveBeenCalledWith({
      envelopeId: "env-1",
      formInstanceId: "fi-1",
      actorId: "coordinator-1",
      reason: "Signer information changed",
    });
    expect(read(formInstance, "auditRows")).toBe(auditRows);
    expect(read(updated[0], "status")).toBe("voided");
    expect(read(updated[0], "voidReason")).toBe("Signer information changed");
  });

  it("keeps fully-signed envelopes immutable", async () => {
    const voidDelegate = vi.fn(async () => undefined);
    const replaceDelegate = vi.fn(async () => undefined);
    const extendDelegate = vi.fn(async () => undefined);
    const service = createPacketEnvelopeService(
      createDependencies({
        getEnvelopeRecord: async () => envelopeRecord({ status: "fully-signed" }),
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
        actorId: "coordinator-1",
        reason: "late change",
      }),
    ).rejects.toThrow("Cannot void a fully-signed packet envelope.");
    await expect(
      service.replaceSigner({
        envelopeId: "env-1",
        actorId: "coordinator-1",
        fromSignerId: "signer-1",
        toSignerId: "signer-2",
        reason: "coverage",
      }),
    ).rejects.toThrow("Cannot replace-signer a fully-signed packet envelope.");
    await expect(
      service.extend({
        envelopeId: "env-1",
        actorId: "coordinator-1",
        expiresAt: "2026-08-12T00:00:00.000Z",
        reason: "more time",
      }),
    ).rejects.toThrow("Cannot extend a fully-signed packet envelope.");
    expect(voidDelegate).not.toHaveBeenCalled();
    expect(replaceDelegate).not.toHaveBeenCalled();
    expect(extendDelegate).not.toHaveBeenCalled();
  });

  it("keeps eCIgn binding helpers strictly additive", () => {
    const binding = createEnvelopeBinding({
      envelopeId: "env-1",
      packetId: "packet-1",
      packetVersionId: "version-7",
      packetVersionHash: "sha256-approved",
      eventId: "event-1",
      workflowId: "workflow-1",
    });
    const ecignRow = Object.freeze({
      id: "fi-1",
      state: "sent",
      required_signers: ["signer-1"],
      hashChain: ["h1", "h2"],
      integrityCode: "TEMPLATE_DRIFT",
    });

    const withBinding = withEnvelopeBindingMetadata(ecignRow, binding);

    expect(withBinding).not.toBe(ecignRow);
    expect(withBinding).toMatchObject(ecignRow);
    expect(withBinding.envelopeBinding).toEqual(binding);
    expect(ecignRow).not.toHaveProperty("envelopeBinding");
    expect(withBinding.hashChain).toEqual(["h1", "h2"]);
    expect(withBinding.integrityCode).toBe("TEMPLATE_DRIFT");
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
        id: "fi-1",
        state: "prepared",
        required_signers: input.required_signers,
      }) as unknown as FormInstanceRow,
    listEnvelopeFormInstances: async () => [
      {
        id: "fi-1",
        state: "prepared",
        required_signers: ["signer-1"],
      } as unknown as FormInstanceRow,
    ],
    listEnvelopeSignatures: async () => [] as SignatureRow[],
    ecign: {
      send: async () => undefined,
      remind: async () => undefined,
      resend: async () => undefined,
      void: async () => undefined,
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
  if (record === null || typeof record !== "object") {
    return undefined;
  }

  return (record as Record<string, unknown>)[key];
}
