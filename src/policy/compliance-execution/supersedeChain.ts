/**
 * MVP-P0-ECIGN-001 — Form-instance supersede chain helpers.
 *
 * Pure functions for walking the supersede chain. The chain is encoded on
 * each EventFormInstance via three optional fields written by the
 * `supersedeFormInstance` store action (see regulatoryExecutionStore.ts):
 *
 *   - supersedes      : id of the row this instance replaces
 *   - supersededBy    : id of the row that replaces this one (back-pointer)
 *   - supersededAt    : ISO timestamp when this row was superseded
 *
 * Invariants (enforced by the store action, validated here):
 *   - A canonical (head-of-chain) instance has status !== 'SUPERSEDED'
 *     and supersededBy === undefined.
 *   - A superseded instance has status === 'SUPERSEDED' and supersededBy
 *     SHOULD point to the row that replaced it; if missing (legacy rows
 *     from before this feature), traversal falls back to find a row whose
 *     supersedes matches this row's id.
 *   - The chain MUST be acyclic. A safety cap (`MAX_CHAIN_DEPTH`) prevents
 *     runaway traversal in case of malformed data.
 *
 * Per MVP plan L1208 ("ECIGN-001 — legacy artifact fallback resolver
 * retained one release"): callers should prefer canonical-successor
 * resolution but tolerate legacy rows missing chain metadata.
 */

/** Structural shape the helpers operate on. Compatible with EventFormInstance
 *  before AND after the type is extended with chain fields. */
export interface SupersedableInstance {
  id: string;
  status: string; // FormInstanceStatus union; loosened for structural typing
  supersedes?: string;
  supersededBy?: string;
  supersededAt?: string;
  sequence?: number;
}

/** Safety cap to prevent runaway traversal on cyclic / corrupted data. */
export const MAX_CHAIN_DEPTH = 32;

/**
 * True when the instance is the head of its chain (canonical successor).
 * Equivalent to: status !== 'SUPERSEDED' && !supersededBy.
 *
 * @example
 *   if (isCanonicalInstance(row)) {
 *     // row is the live canonical form instance
 *   }
 */
export function isCanonicalInstance(instance: SupersedableInstance): boolean {
  return instance.status !== 'SUPERSEDED' && !instance.supersededBy;
}

/**
 * Walk forward from any instance to its canonical (head-of-chain) successor.
 * Returns the input unchanged if it's already canonical or if its
 * supersededBy pointer can't be resolved.
 *
 * @example
 *   const canonical = resolveCanonicalSuccessor(currentRow, allInstances);
 *   // canonical.id is the live row to render / link to
 */
export function resolveCanonicalSuccessor<T extends SupersedableInstance>(
  start: T,
  pool: readonly T[],
): T {
  if (isCanonicalInstance(start)) {
    return start;
  }

  const visited = new Set<string>();
  let current: T = start;
  let depth = 0;

  while (depth < MAX_CHAIN_DEPTH) {
    visited.add(current.id);

    if (isCanonicalInstance(current)) {
      return current;
    }

    let next: T | undefined;
    if (current.supersededBy) {
      next = pool.find((p) => p.id === current.supersededBy);
    }

    if (!next) {
      // Legacy fallback: scan pool for a row that supersedes current
      next = pool.find((p) => p.supersedes === current.id);
    }

    if (!next || visited.has(next.id)) {
      // Broken pointer or cycle: return original input unchanged
      return start;
    }

    current = next;
    depth++;
  }

  // Depth cap reached
  return start;
}

/**
 * Walk forward from an instance id. Returns undefined if id not found.
 *
 * @example
 *   const canonical = resolveCanonicalSuccessorById('evt-001-form-042', allInstances);
 */
export function resolveCanonicalSuccessorById<T extends SupersedableInstance>(
  startId: string,
  pool: readonly T[],
): T | undefined {
  const start = pool.find((p) => p.id === startId);
  if (!start) return undefined;
  return resolveCanonicalSuccessor(start, pool);
}

/**
 * Build the complete chain in chronological order (oldest first).
 * Includes the head canonical row. Returns at most MAX_CHAIN_DEPTH rows.
 *
 * @example
 *   const chain = buildSupersedeChain(anyRow, allInstances);
 *   // chain[0] is oldest superseded row; chain[chain.length-1] is canonical live row
 */
export function buildSupersedeChain<T extends SupersedableInstance>(
  anyMember: T,
  pool: readonly T[],
): T[] {
  const visited = new Set<string>();
  const chain: T[] = [];

  // Walk backward to find oldest (using supersedes)
  let current: T | undefined = anyMember;
  let depth = 0;

  while (current && depth < MAX_CHAIN_DEPTH) {
    if (visited.has(current.id)) break;
    visited.add(current.id);
    chain.unshift(current); // prepend to keep oldest first

    if (current.supersedes) {
      const prev = pool.find((p) => p.id === current!.supersedes);
      if (prev && !visited.has(prev.id)) {
        current = prev;
      } else {
        current = undefined;
      }
    } else {
      current = undefined;
    }
    depth++;
  }

  // Now walk forward from the oldest (first in chain) to append any missed successors
  // (handles cases where we started mid-chain)
  let forward = chain[chain.length - 1];
  depth = 0;
  while (forward && !isCanonicalInstance(forward) && depth < MAX_CHAIN_DEPTH) {
    if (visited.has(forward.id)) break;
    visited.add(forward.id);

    let next: T | undefined;
    if (forward.supersededBy) {
      next = pool.find((p) => p.id === forward.supersededBy);
    }
    if (!next) {
      next = pool.find((p) => p.supersedes === forward.id);
    }
    if (!next || visited.has(next.id)) break;

    chain.push(next);
    forward = next;
    depth++;
  }

  return chain.slice(0, MAX_CHAIN_DEPTH);
}

/**
 * Aliases that should all resolve to the canonical successor of an instance.
 * Useful for backward-compat deep links: returns [instance.id, ...all
 * superseded predecessor ids in the chain].
 *
 * Pair with Wave 2 `artifactToFormInstance.ts` resolver layers — the
 * orchestrator will add a thin wrapper that:
 *   1. Resolves the matched instance via existing layers
 *   2. If matched row is SUPERSEDED, walks forward to canonical
 *   3. Returns canonical
 *
 * @example
 *   const aliases = chainAliases(supersededRow, allInstances);
 *   // old deep-link ids in aliases now map to the live canonical row
 */
export function chainAliases<T extends SupersedableInstance>(
  anyMember: T,
  pool: readonly T[],
): string[] {
  const chain = buildSupersedeChain(anyMember, pool);
  // Return current id first, then predecessor ids (oldest last) so legacy ids resolve forward
  const ids = chain.map((c) => c.id);
  return [anyMember.id, ...ids.filter((id) => id !== anyMember.id)];
}
