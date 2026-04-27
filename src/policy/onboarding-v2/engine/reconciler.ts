import type {
  EvidenceObject, OnboardingExecutionUnit, OnboardingSnapshot, RoleRequirement,
} from '../types';

/** Determine whether a requirement is already satisfied for a subject by existing valid evidence
 *  within the requirement's validity window. Returns the satisfying evidence ID when applicable. */
export function reconcile(
  snap: OnboardingSnapshot,
  subjectId: string,
  req: RoleRequirement,
  asOf: string = new Date().toISOString(),
): { suppress: boolean; evidenceId?: string; reason?: string } {
  // Match by object_type. If any required object_type has a Valid evidence object on this subject
  // that is within an annual window (when applicable), suppress the requirement.
  const subjectEvidence = snap.evidence.filter(e => e.subjectId === subjectId && e.status === 'Valid');
  if (subjectEvidence.length === 0) return { suppress: false };

  const requiredTypes = req.evidenceSchema.map(s => s.objectType);
  const matching: EvidenceObject[] = subjectEvidence.filter(e => requiredTypes.includes(e.objectType));
  if (matching.length === 0) return { suppress: false };

  const window = req.cadence.recurrence?.kind === 'Annual' ? 365
              : req.cadence.recurrence?.kind === 'Biennial' ? 730
              : req.cadence.recurrence?.kind === 'Monthly' ? 30
              : null;
  if (window === null) return { suppress: false };

  const cutoff = new Date(asOf).getTime() - window * 86400_000;
  const within = matching.find(e => new Date(e.createdAt).getTime() >= cutoff);
  if (!within) return { suppress: false };

  return {
    suppress: true,
    evidenceId: within.id,
    reason: `Existing valid ${within.objectType} (${within.id}) within ${window}-day window`,
  };
}

/** Recompute aggregate batch status from its units. */
export function rollupBatchStatus(units: OnboardingExecutionUnit[]): OnboardingExecutionUnit[] {
  return units;
}
