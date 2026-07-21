/**
 * ADR-0002 Phase 5D — separation-of-duties for signing (pure, fail-closed).
 *
 * Independent of the eCIgn tier/domain/self-approval checks (which handle "the
 * same user can't approve their own single action"). SoD is stronger: it enforces
 * that DISTINCT required slots are filled by DISTINCT actors — e.g. the drafter
 * may not also be the approver, a reviewer may not also be the final approver.
 *
 * A rule declares, for a target slot, the slots whose signer must be a different
 * person. If a prior signature on any conflicting slot shares the signer's user
 * id, signing is refused. Unknown/garbage rules are ignored (they can only
 * add constraints, never remove them — fail-closed by construction).
 */
export interface PriorSignature {
  userId: string;
  slotId: string;
}

export interface SoDRule {
  /** The slot being signed. */
  slotId: string;
  /** Slots whose signer must be a DIFFERENT person than this slot's signer. */
  mustDifferFrom: string[];
}

export interface SoDCheckResult {
  ok: boolean;
  /** The conflicting slot + the shared user, when ok === false. */
  violation?: { conflictingSlotId: string; sharedUserId: string };
}

/**
 * Check whether `signerUserId` may sign `targetSlotId` given the instance's prior
 * signatures and its SoD rules. Pure; no I/O.
 */
export function checkSigningSoD(
  signerUserId: string,
  targetSlotId: string,
  priorSignatures: readonly PriorSignature[],
  rules: readonly SoDRule[],
): SoDCheckResult {
  const rule = rules.find((r) => r.slotId === targetSlotId);
  if (!rule || rule.mustDifferFrom.length === 0) return { ok: true };
  const conflictSlots = new Set(rule.mustDifferFrom);
  for (const sig of priorSignatures) {
    if (conflictSlots.has(sig.slotId) && sig.userId === signerUserId) {
      return { ok: false, violation: { conflictingSlotId: sig.slotId, sharedUserId: signerUserId } };
    }
  }
  return { ok: true };
}

/** Convenience guard: throw-style boolean for call sites that reject on false. */
export function signingSoDSatisfied(
  signerUserId: string,
  targetSlotId: string,
  priorSignatures: readonly PriorSignature[],
  rules: readonly SoDRule[],
): boolean {
  return checkSigningSoD(signerUserId, targetSlotId, priorSignatures, rules).ok;
}
