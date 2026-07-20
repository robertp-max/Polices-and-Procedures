/**
 * Unavailable account-lifecycle store (ADR-0002 2B).
 *
 * Selected when no durable, mutation-capable substrate is configured
 * (REGISTRATION_TABLE_NAME absent). Reads return null (no durable record yet, so
 * callers fall back to the Phase-2A legacy projection); every MUTATION fails
 * closed with 503 ACCOUNT_LIFECYCLE_MUTATION_UNAVAILABLE. There is deliberately
 * no file-local mutation fallback.
 */
import {
  ERR, UNAVAILABLE_LIFECYCLE_CAPS,
  type AccountLifecycleStore, type AccountLifecycleStoreCapabilities,
} from './store.js';
import type { AccountLifecycleRecord, LifecycleOperationRecord } from './types.js';

export class UnavailableAccountLifecycleStore implements AccountLifecycleStore {
  capabilities(): AccountLifecycleStoreCapabilities { return UNAVAILABLE_LIFECYCLE_CAPS; }
  async getLifecycle(): Promise<AccountLifecycleRecord | null> { return null; }
  async getOperation(): Promise<LifecycleOperationRecord | null> { return null; }
  async initializeLifecycle(): Promise<never> { throw ERR.mutationUnavailable(); }
  async beginTransition(): Promise<never> { throw ERR.mutationUnavailable(); }
  async advanceOperation(): Promise<never> { throw ERR.mutationUnavailable(); }
  async markReconciliationRequired(): Promise<never> { throw ERR.mutationUnavailable(); }
  async completeTransition(): Promise<never> { throw ERR.mutationUnavailable(); }
}
