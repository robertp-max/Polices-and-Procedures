/* ═══════════════════════════════════════════════════════════════
   lifecycleSeed.ts — Policy Lifecycle Seed Source
   Single import point for the lifecycle store to resolve its
   starting corpus. Uses POLICY_CORPUS from policyCorpus.ts, which
   mirrors the /library page dataset (278+ policies).

   OLD behaviour (removed):
     buildSeedEnvelopes() called loadFrameworkSeed() →
     frameworkSeed.generated.ts → 253 records of which 243 were
     sourceType="placeholder" stub entries.

   NEW behaviour:
     loadLifecycleSeed() → POLICY_CORPUS → 278 real policies,
     placeholder/demo/test indicators screened out.
   ═══════════════════════════════════════════════════════════════ */

import {
  POLICY_CORPUS,
  CORPUS_PROVENANCE,
  CORPUS_EMPTY_MESSAGE,
  type CorpusPolicy,
} from '@/policy/data/policyCorpus';

export type { CorpusPolicy };
export { CORPUS_PROVENANCE, CORPUS_EMPTY_MESSAGE };

export interface LifecycleSeedResult {
  /** Policies eligible for lifecycle enrollment. */
  policies: ReadonlyArray<CorpusPolicy>;
  /** Human-readable label for the UI provenance strip. */
  provenance: string;
  /** True when no policies passed validation — show empty state. */
  isEmpty: boolean;
}

/**
 * Load the canonical policy corpus for the lifecycle workspace.
 * Returns a stable LifecycleSeedResult — safe to call multiple times
 * (always references the module-level POLICY_CORPUS constant).
 */
export function loadLifecycleSeed(): LifecycleSeedResult {
  const policies = POLICY_CORPUS;
  const isEmpty = policies.length === 0;
  return {
    policies,
    provenance: isEmpty ? CORPUS_EMPTY_MESSAGE : CORPUS_PROVENANCE,
    isEmpty,
  };
}
