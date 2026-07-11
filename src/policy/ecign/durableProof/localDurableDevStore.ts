/**
 * LOCAL_DURABLE_DEV write-once JSON store for policy approval packets.
 *
 * Writes under a deterministic folder. NOT production WORM.
 * Overwrite of the same policyId+version is forbidden (write-once).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { PolicyApprovalPacket } from './types';
import { PolicyApprovalPacketError, buildPolicyApprovalPacket } from './buildPolicyApprovalPacket';
import type { BuildPacketInput } from './types';

export const LOCAL_DURABLE_DEV_LABEL = 'LOCAL_DURABLE_DEV' as const;

export function defaultLocalDurableDevRoot(repoRoot?: string): string {
  const root = repoRoot ?? process.cwd();
  return resolve(root, 'UAT_Reports', 'ecign_local_durable_dev');
}

export class LocalDurableDevStore {
  readonly rootDir: string;
  readonly label = LOCAL_DURABLE_DEV_LABEL;

  constructor(rootDir?: string) {
    this.rootDir = rootDir ?? defaultLocalDurableDevRoot();
    mkdirSync(this.rootDir, { recursive: true });
    const readme = join(this.rootDir, 'README.md');
    if (!existsSync(readme)) {
      writeFileSync(
        readme,
        `# eCign LOCAL_DURABLE_DEV store

Write-once JSON policy approval packets for development proof plumbing.

- **NOT** production immutable / WORM / object-lock storage.
- Packets with proofLabel LOCAL_DURABLE_DEV_PROOF require a **real** signatureRef supplied by a signer — never invented.
- Unsigned readiness artifacts use suffix \`.readiness.json\` and stay READY_FOR_REAL_SIGNATURE.
`,
        'utf8',
      );
    }
  }

  private readinessPath(policyId: string, version: string): string {
    return join(this.rootDir, `${policyId}__${version}.readiness.json`);
  }

  private packetPath(policyId: string, version: string): string {
    return join(this.rootDir, `${policyId}__${version}.packet.json`);
  }

  existsPacket(policyId: string, version: string): boolean {
    return existsSync(this.packetPath(policyId, version));
  }

  existsReadiness(policyId: string, version: string): boolean {
    return existsSync(this.readinessPath(policyId, version));
  }

  /** Write readiness skeleton (unsigned). Write-once per policyId+version. */
  putReadinessOnce(packet: PolicyApprovalPacket): string {
    if (packet.signature.signatureRef) {
      throw new Error('Use putPacketOnce for signed packets');
    }
    if (packet.proofLabel !== 'READY_FOR_REAL_SIGNATURE' && packet.proofLabel !== 'PARTIAL') {
      throw new Error(`Unexpected readiness label ${packet.proofLabel}`);
    }
    const path = this.readinessPath(packet.policyId, packet.version);
    if (existsSync(path)) {
      throw new Error(`overwrite_forbidden: readiness already exists at ${path}`);
    }
    mkdirSync(dirname(path), { recursive: true });
    const envelope = {
      label: LOCAL_DURABLE_DEV_LABEL,
      notProductionImmutable: true,
      kind: 'readiness',
      writtenAt: new Date().toISOString(),
      packet,
    };
    writeFileSync(path, JSON.stringify(envelope, null, 2), 'utf8');
    return path;
  }

  /**
   * Persist a signed packet. Requires real signatureRef.
   * proofLabel becomes LOCAL_DURABLE_DEV_PROOF (never PRODUCTION_PASS here).
   */
  putPacketOnce(input: BuildPacketInput): { path: string; packet: PolicyApprovalPacket } {
    if (!input.signatureRef?.trim()) {
      throw new PolicyApprovalPacketError(
        'pass_requires_signature',
        'Cannot persist LOCAL_DURABLE_DEV_PROOF packet without real signatureRef',
      );
    }
    const packet = buildPolicyApprovalPacket({
      ...input,
      storageMode: 'local_durable_dev',
      packetPersisted: true,
    });
    if (packet.proofLabel !== 'LOCAL_DURABLE_DEV_PROOF') {
      throw new Error(`Expected LOCAL_DURABLE_DEV_PROOF, got ${packet.proofLabel}`);
    }
    const path = this.packetPath(packet.policyId, packet.version);
    if (existsSync(path)) {
      throw new Error(`overwrite_forbidden: packet already exists at ${path}`);
    }
    mkdirSync(dirname(path), { recursive: true });
    const envelope = {
      label: LOCAL_DURABLE_DEV_LABEL,
      notProductionImmutable: true,
      kind: 'signed_packet',
      writtenAt: new Date().toISOString(),
      packet,
    };
    writeFileSync(path, JSON.stringify(envelope, null, 2), 'utf8');
    return { path, packet };
  }

  readPacket(policyId: string, version: string): PolicyApprovalPacket | null {
    const path = this.packetPath(policyId, version);
    if (!existsSync(path)) return null;
    const raw = JSON.parse(readFileSync(path, 'utf8')) as { packet: PolicyApprovalPacket };
    return raw.packet;
  }

  readReadiness(policyId: string, version: string): PolicyApprovalPacket | null {
    const path = this.readinessPath(policyId, version);
    if (!existsSync(path)) return null;
    const raw = JSON.parse(readFileSync(path, 'utf8')) as { packet: PolicyApprovalPacket };
    return raw.packet;
  }
}
