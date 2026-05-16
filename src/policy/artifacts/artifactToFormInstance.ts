/**
 * MVP-P1-ARTIFACT-001 — Deterministic artifact → form_instance_id reverse lookup.
 *
 * Layered resolution (returns the first non-undefined match):
 *   1. EXPLICIT URL: `?form_instance_id=...` query param if present and matches a real EventFormInstance row.
 *   2. EVIDENCE BINDING: when the primary artifact id matches an EvidenceDoc, read doc.linkedFormInstanceId
 *      and resolve that EventFormInstance row deterministically.
 *   3. DIRECT INSTANCE: when primary artifact id IS itself a canonical EventFormInstance.id.
 *   4. FALLBACK: existing heuristic `resolveFormInstanceFromArtifactCandidates` (legacy double-dash).
 *      Per MVP plan L1208, the heuristic is RETAINED AS FALLBACK FOR ONE RELEASE.
 *
 * Wave 3 / MVP-P0-ECIGN-001 addition:
 *   After any layer resolves to a SUPERSEDED row, the result is forwarded
 *   to the canonical successor via `supersedeChain.resolveCanonicalSuccessor`.
 *   This keeps old bookmarks and audit deep links working after a form is
 *   corrected: they STILL render the most up-to-date row instead of a
 *   stale superseded copy. The original `layer` is preserved on the result
 *   so callers can audit which deterministic path fired (the forward walk
 *   is a post-processing step, not a separate layer).
 *
 * Returns the resolved EventFormInstance (or undefined).
 */

import { resolveFormInstanceFromArtifactCandidates } from '@/policy/compliance-execution/cesFormInstanceId';
import { resolveCanonicalSuccessor, type SupersedableInstance } from '@/policy/compliance-execution/supersedeChain';
import type { EventFormInstance } from '@/policy/compliance-execution/types';
import type { EvidenceDoc } from '@/policy/stores/regulatoryExecutionStore';

export type ArtifactResolutionLayer = 'url-query' | 'evidence-binding' | 'direct-instance' | 'heuristic-fallback' | 'none';

export interface ResolveFormInstanceFromArtifactInput {
  /** Decoded primary artifact id from /artifacts/:artifactId path. */
  primaryArtifactId: string;
  /** Optional ?form_instance_id= query param. */
  queryFormInstanceId?: string | undefined;
  /** Loaded form instances for the active event(s). */
  formInstances: readonly EventFormInstance[];
  /** Loaded evidence docs (used for evidence-binding layer). */
  evidence: readonly EvidenceDoc[];
}

export interface ResolveFormInstanceFromArtifactResult {
  formInstance: EventFormInstance | undefined;
  layer: ArtifactResolutionLayer;
  /**
   * MVP-P0-ECIGN-001: true when a SUPERSEDED match was walked forward to the
   * canonical successor. Callers MAY surface a UI affordance ("Showing
   * current version; you requested a superseded snapshot") when this is true.
   */
  forwardedFromSuperseded?: boolean;
}

/** Internal: walk a resolved instance forward if it's SUPERSEDED. */
function maybeForwardToCanonical(
  match: EventFormInstance | undefined,
  pool: readonly EventFormInstance[],
): { instance: EventFormInstance | undefined; forwarded: boolean } {
  if (!match) return { instance: match, forwarded: false };
  if (match.status !== 'SUPERSEDED') return { instance: match, forwarded: false };
  const canonical = resolveCanonicalSuccessor(
    match as SupersedableInstance,
    pool as readonly SupersedableInstance[],
  ) as EventFormInstance;
  // resolveCanonicalSuccessor returns the input unchanged if no successor
  // could be resolved (legacy rows missing chain metadata); treat unchanged
  // returns as "not forwarded".
  const forwarded = canonical.id !== match.id;
  return { instance: canonical, forwarded };
}

export function resolveFormInstanceFromArtifact(
  input: ResolveFormInstanceFromArtifactInput,
): ResolveFormInstanceFromArtifactResult {
  const { primaryArtifactId, queryFormInstanceId, formInstances, evidence } = input;

  // Layer 1 — URL query
  if (queryFormInstanceId) {
    const byUrl = formInstances.find(i => i.id === queryFormInstanceId);
    if (byUrl) {
      const { instance, forwarded } = maybeForwardToCanonical(byUrl, formInstances);
      return { formInstance: instance, layer: 'url-query', forwardedFromSuperseded: forwarded };
    }
  }

  // Layer 2 — evidence binding
  const evidenceMatch = evidence.find(doc => doc.id === primaryArtifactId);
  if (evidenceMatch?.linkedFormInstanceId) {
    const byBinding = formInstances.find(i => i.id === evidenceMatch.linkedFormInstanceId);
    if (byBinding) {
      const { instance, forwarded } = maybeForwardToCanonical(byBinding, formInstances);
      return { formInstance: instance, layer: 'evidence-binding', forwardedFromSuperseded: forwarded };
    }
  }

  // Layer 3 — direct id
  const direct = formInstances.find(i => i.id === primaryArtifactId);
  if (direct) {
    const { instance, forwarded } = maybeForwardToCanonical(direct, formInstances);
    return { formInstance: instance, layer: 'direct-instance', forwardedFromSuperseded: forwarded };
  }

  // Layer 4 — heuristic fallback (retained one release per MVP plan L1208)
  const heuristic = resolveFormInstanceFromArtifactCandidates(primaryArtifactId, [...formInstances]);
  if (heuristic) {
    const { instance, forwarded } = maybeForwardToCanonical(heuristic, formInstances);
    return { formInstance: instance, layer: 'heuristic-fallback', forwardedFromSuperseded: forwarded };
  }

  return { formInstance: undefined, layer: 'none' };
}
