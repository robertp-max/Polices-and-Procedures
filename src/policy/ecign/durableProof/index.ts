/**
 * eCign policy-approval durable proof plumbing (Batch 4).
 *
 * Prepares READY_FOR_REAL_SIGNATURE packages and allows LOCAL_DURABLE_DEV
 * persistence only with a real signatureRef. Never invents signatures or
 * production PASS claims.
 */
export * from './storageMode';
export * from './types';
export * from './hashText';
export {
  buildPolicyApprovalPacket,
  prepareReadyForRealSignature,
  PolicyApprovalPacketError,
} from './buildPolicyApprovalPacket';
export {
  LocalDurableDevStore,
  defaultLocalDurableDevRoot,
  LOCAL_DURABLE_DEV_LABEL,
} from './localDurableDevStore';
