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
  type InitializeLifecycleInput, type BeginLifecycleTransitionInput,
  type AdvanceLifecycleOperationInput, type MarkReconciliationRequiredInput,
  type CompleteLifecycleTransitionInput,
} from './store.js';
import type { AccountLifecycleRecord, LifecycleOperationRecord } from './types.js';

export class UnavailableAccountLifecycleStore implements AccountLifecycleStore {
  capabilities(): AccountLifecycleStoreCapabilities { return UNAVAILABLE_LIFECYCLE_CAPS; }
  async getLifecycle(_canonicalUserId: string): Promise<AccountLifecycleRecord | null> { return null; }
  async getOperation(_canonicalUserId: string, _operationId: string): Promise<LifecycleOperationRecord | null> { return null; }
  async initializeLifecycle(_input: InitializeLifecycleInput): Promise<never> { throw ERR.mutationUnavailable(); }
  async beginTransition(_input: BeginLifecycleTransitionInput): Promise<never> { throw ERR.mutationUnavailable(); }
  async advanceOperation(_input: AdvanceLifecycleOperationInput): Promise<never> { throw ERR.mutationUnavailable(); }
  async markReconciliationRequired(_input: MarkReconciliationRequiredInput): Promise<never> { throw ERR.mutationUnavailable(); }
  async completeTransition(_input: CompleteLifecycleTransitionInput): Promise<never> { throw ERR.mutationUnavailable(); }
}
