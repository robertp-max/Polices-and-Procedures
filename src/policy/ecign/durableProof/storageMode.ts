/**
 * eCign policy-approval durable proof — storage mode guardrails.
 *
 * LOCAL_DURABLE_DEV writes write-once JSON under a deterministic repo folder.
 * It is NOT production WORM / object-lock immutability.
 */

export type EcignProofStorageMode = 'demo' | 'local_durable_dev' | 'production';

export type PacketProofLabel =
  | 'PARTIAL'
  | 'READY_FOR_REAL_SIGNATURE'
  | 'READY_FOR_EXPORT'
  | 'LOCAL_DURABLE_DEV_PROOF'
  | 'PRODUCTION_PASS';

const RAW = (typeof process !== 'undefined' && process.env?.ECIGN_PROOF_STORAGE_MODE) || 'local_durable_dev';

const VALID: ReadonlySet<EcignProofStorageMode> = new Set([
  'demo',
  'local_durable_dev',
  'production',
]);

/** Active mode for proof plumbing. Default: local_durable_dev. */
export const ECIGN_PROOF_STORAGE_MODE: EcignProofStorageMode = VALID.has(
  RAW as EcignProofStorageMode,
)
  ? (RAW as EcignProofStorageMode)
  : 'local_durable_dev';

export function isProductionProofMode(mode: EcignProofStorageMode = ECIGN_PROOF_STORAGE_MODE): boolean {
  return mode === 'production';
}

export function isLocalDurableDevMode(mode: EcignProofStorageMode = ECIGN_PROOF_STORAGE_MODE): boolean {
  return mode === 'local_durable_dev';
}

/**
 * Highest proof label allowed for a packet given mode + signature presence.
 * Never upgrades to PRODUCTION_PASS outside production mode.
 * Never returns PRODUCTION_PASS or LOCAL_DURABLE_DEV_PROOF without signatureRef.
 */
export function resolveProofLabel(input: {
  storageMode: EcignProofStorageMode;
  hasBodyHash: boolean;
  hasSignatureRef: boolean;
  packetPersisted: boolean;
}): PacketProofLabel {
  if (!input.hasBodyHash) return 'PARTIAL';
  if (!input.hasSignatureRef) return 'READY_FOR_REAL_SIGNATURE';
  // Has signatureRef + body hash
  if (!input.packetPersisted) return 'READY_FOR_EXPORT';
  if (input.storageMode === 'production') return 'PRODUCTION_PASS';
  if (input.storageMode === 'local_durable_dev') return 'LOCAL_DURABLE_DEV_PROOF';
  // demo mode with signature still not production
  return 'READY_FOR_EXPORT';
}

export function assertNotFakeProductionPass(label: PacketProofLabel, mode: EcignProofStorageMode): void {
  if (label === 'PRODUCTION_PASS' && mode !== 'production') {
    throw new Error(
      `[ecign-durable-proof] Cannot mark PRODUCTION_PASS when storageMode=${mode}`,
    );
  }
}
