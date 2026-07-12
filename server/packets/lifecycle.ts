/**
 * Packet lifecycle transition API — §17.1.
 *
 * The implementation lives in store.ts alongside the non-exported privileged
 * writer so public update() cannot accept lifecycle-owned fields.
 */
export {
  beginAmendment,
  createSupersedingInstance,
  IllegalTransitionError,
  transitionPacket,
  type CreateSupersedingInstanceInput,
} from './store.js';
