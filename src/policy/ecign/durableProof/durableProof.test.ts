import { describe, expect, it } from 'vitest';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  buildPolicyApprovalPacket,
  prepareReadyForRealSignature,
  PolicyApprovalPacketError,
} from './buildPolicyApprovalPacket';
import { LocalDurableDevStore } from './localDurableDevStore';
import { resolveProofLabel } from './storageMode';

const SAMPLE = 'GV-GB-001';

describe('ecign durable proof guardrails', () => {
  it('resolves labels honestly', () => {
    expect(
      resolveProofLabel({
        storageMode: 'local_durable_dev',
        hasBodyHash: true,
        hasSignatureRef: false,
        packetPersisted: false,
      }),
    ).toBe('READY_FOR_REAL_SIGNATURE');

    expect(
      resolveProofLabel({
        storageMode: 'local_durable_dev',
        hasBodyHash: true,
        hasSignatureRef: true,
        packetPersisted: true,
      }),
    ).toBe('LOCAL_DURABLE_DEV_PROOF');

    expect(
      resolveProofLabel({
        storageMode: 'production',
        hasBodyHash: true,
        hasSignatureRef: true,
        packetPersisted: true,
      }),
    ).toBe('PRODUCTION_PASS');

    expect(
      resolveProofLabel({
        storageMode: 'local_durable_dev',
        hasBodyHash: false,
        hasSignatureRef: false,
        packetPersisted: false,
      }),
    ).toBe('PARTIAL');
  });

  it('prepares READY_FOR_REAL_SIGNATURE without inventing signature', () => {
    const ready = prepareReadyForRealSignature(SAMPLE);
    expect(ready.status).toBe('READY_FOR_REAL_SIGNATURE');
    expect(ready.signatureRef).toBeNull();
    expect(ready.bodyHash).toMatch(/^[a-f0-9]{64}$/);
    expect(ready.packetSkeleton.proofLabel).toBe('READY_FOR_REAL_SIGNATURE');
    expect(ready.packetSkeleton.signature.signatureRef).toBeNull();
  });

  it('builds unsigned packet as READY_FOR_REAL_SIGNATURE not PASS', () => {
    const packet = buildPolicyApprovalPacket({
      policyId: SAMPLE,
      title: 'Governing Body Authority & Responsibilities',
      signatureRef: null,
    });
    expect(packet.proofLabel).toBe('READY_FOR_REAL_SIGNATURE');
    expect(packet.proofLabel).not.toBe('PRODUCTION_PASS');
    expect(packet.proofLabel).not.toBe('LOCAL_DURABLE_DEV_PROOF');
    expect(packet.body.bodyHash).toBeTruthy();
  });

  it('refuses LOCAL_DURABLE_DEV packet persist without signatureRef', () => {
    const dir = join(tmpdir(), `ecign-proof-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const store = new LocalDurableDevStore(dir);
    expect(() =>
      store.putPacketOnce({
        policyId: SAMPLE,
        title: 'test',
        signatureRef: null,
      }),
    ).toThrow(PolicyApprovalPacketError);
    rmSync(dir, { recursive: true, force: true });
  });

  it('persists signed packet as LOCAL_DURABLE_DEV_PROOF only with real ref', () => {
    const dir = join(tmpdir(), `ecign-proof-signed-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const store = new LocalDurableDevStore(dir);
    const { packet, path } = store.putPacketOnce({
      policyId: SAMPLE,
      title: 'Governing Body Authority & Responsibilities',
      signatureRef: 'sig_test_real_ref_only_for_unit_test',
      signer: { userId: 'u1', name: 'Unit Tester', role: 'Admin' },
      signedAt: new Date().toISOString(),
    });
    expect(path).toContain(`${SAMPLE}__`);
    expect(packet.proofLabel).toBe('LOCAL_DURABLE_DEV_PROOF');
    expect(packet.proofLabel).not.toBe('PRODUCTION_PASS');
    expect(packet.signature.signatureRef).toBe('sig_test_real_ref_only_for_unit_test');
    expect(packet.storageMode).toBe('local_durable_dev');
    expect(packet.notes.some((n) => n.includes('LOCAL_DURABLE_DEV'))).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });

  it('cannot claim PRODUCTION_PASS in local mode even if persisted flag set', () => {
    const packet = buildPolicyApprovalPacket({
      policyId: SAMPLE,
      title: 'x',
      signatureRef: 'sig_x',
      storageMode: 'local_durable_dev',
      packetPersisted: true,
    });
    expect(packet.proofLabel).toBe('LOCAL_DURABLE_DEV_PROOF');
  });
});
