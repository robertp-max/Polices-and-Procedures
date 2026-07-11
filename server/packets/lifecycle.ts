/**
 * Packet lifecycle transition API — §17.1.
 *
 * `transitionPacket` is the ONLY general status-transition path and **always
 * rejects LOCKED / SUPERSEDED / CANCELLED**. Terminal-state mutation is
 * possible only via `beginAmendment` / `createSupersedingInstance`, which live
 * in `store.ts` alongside the non-exported privileged writer (no privileged
 * handle crosses a module boundary).
 */
import {
  isAllowedPacketTransition,
  type PacketAuditActor,
  type PacketAuditEventType,
  type PacketLifecycleStatus,
} from '@/policy/packets/contracts';
import {
  type PacketMetadataStore,
  type PacketStoreDocument,
  IllegalTransitionError,
  LockedPacketError,
  PacketNotFoundError,
} from './store.js';

// Re-export intentional amendment/supersession entry points so consumers can
// import from either module. The privileged allowTerminal writer is NOT re-exported
// (it is a non-exported function inside store.ts).
export {
  beginAmendment,
  createSupersedingInstance,
  type CreateSupersedingInstanceInput,
} from './store.js';
export { IllegalTransitionError } from './store.js';

function auditTypeForTransition(toStatus: PacketLifecycleStatus): PacketAuditEventType {
  switch (toStatus) {
    case 'LOCKED':
      return 'packet.locked';
    case 'CERTIFIED':
      return 'packet.certified';
    case 'PUBLISHED':
      return 'packet.published';
    case 'APPROVED_FOR_SIGNATURE':
      return 'packet.approved';
    case 'AMENDMENT_REQUIRED':
      return 'packet.amended';
    case 'SUPERSEDED':
      return 'packet.superseded';
    default:
      return 'packet.edited';
  }
}

/**
 * Enforce §17.1 ALLOWED_TRANSITIONS and persist the new status.
 * LOCKED / terminal statuses are rejected outright — use beginAmendment or
 * createSupersedingInstance (store module) for post-lock work.
 */
export async function transitionPacket(
  store: PacketMetadataStore,
  id: string,
  expectedRevision: number,
  toStatus: PacketLifecycleStatus,
  actor: PacketAuditActor,
  reason?: string,
): Promise<PacketStoreDocument> {
  if (!id || id.trim().length === 0) {
    throw new Error('packetInstanceId is required');
  }
  if (!toStatus) {
    throw new Error('toStatus is required');
  }
  if (!actor?.actorId?.trim()) {
    throw new Error('actor.actorId is required');
  }

  const current = await store.getById(id);
  if (!current) {
    throw new PacketNotFoundError(id);
  }

  if (current.status === 'LOCKED') {
    throw new LockedPacketError(id, current.status);
  }
  if (current.status === 'SUPERSEDED' || current.status === 'CANCELLED') {
    throw new LockedPacketError(id, current.status);
  }

  if (!isAllowedPacketTransition(current.status, toStatus)) {
    throw new IllegalTransitionError(id, current.status, toStatus);
  }

  const auditEventType = auditTypeForTransition(toStatus);
  const patch: Parameters<PacketMetadataStore['update']>[2] = {
    status: toStatus,
  };
  if (toStatus === 'LOCKED') {
    patch.lockedAt = new Date().toISOString();
  }
  if (toStatus === 'CERTIFIED') {
    patch.certifiedAt = new Date().toISOString();
  }

  return store.update(id, expectedRevision, patch, {
    actor,
    reason: reason ?? null,
    auditEventType,
  });
}
