/**
 * Care Indeed LMS — Wave 2: role/duty requirement resolution + assignment building.
 *
 * Pure functions (architecture §5.3, §6.4, §9). No self-selected roles; every
 * assignment pins exact versions + hashes; status is derived from content
 * availability + prerequisites, never a client claim.
 */
import type {
  ContentRevision,
  LearningAssignment,
  RequirementDefinition,
  RoleAssignment,
  AssignmentStatus,
} from './types';

/* ------------------------------------------------------------------ *
 * Role/duty → applicable requirement resolution (§5.3).
 * ------------------------------------------------------------------ */

export interface SubjectResolutionContext {
  subjectId: string;
  roleAssignments: RoleAssignment[]; // authoritative, from identity — not learner-chosen
}

/**
 * A published requirement applies to a subject when at least one of the subject's
 * (effective) roles is in applicableRoleCodes AND — when the requirement specifies
 * dutyFlags — the subject carries every required duty flag for that role.
 */
export function resolveApplicableRequirements(
  ctx: SubjectResolutionContext,
  published: RequirementDefinition[],
  now: Date,
): RequirementDefinition[] {
  const activeRoles = ctx.roleAssignments.filter(
    (r) => !r.effectiveTo || new Date(r.effectiveTo).getTime() > now.getTime(),
  );
  const roleCodes = new Set(activeRoles.map((r) => r.roleCode));
  const subjectDutyFlags = new Set(activeRoles.flatMap((r) => r.dutyFlags));

  return published.filter((req) => {
    if (req.status !== 'PUBLISHED') return false;
    if (new Date(req.effectiveFrom).getTime() > now.getTime()) return false;
    if (req.effectiveTo && new Date(req.effectiveTo).getTime() <= now.getTime()) return false;
    const roleMatch = req.applicableRoleCodes.some((rc) => roleCodes.has(rc));
    if (!roleMatch) return false;
    if (req.dutyFlags && req.dutyFlags.length > 0) {
      return req.dutyFlags.every((f) => subjectDutyFlags.has(f));
    }
    return true;
  });
}

/* ------------------------------------------------------------------ *
 * Assignment building — pins versions + hashes; derives initial status (§6.4, §9).
 * ------------------------------------------------------------------ */

export interface BuildAssignmentInput {
  subjectId: string;
  roleAssignmentIds: string[];
  requirement: RequirementDefinition;
  /** Resolved content revision for the requirement's contentRef, if any. */
  content: ContentRevision | null;
  /** requirement ids already satisfied by this subject (for prerequisite gating). */
  satisfiedRequirementIds: Set<string>;
  assignedAt: string;
  availableAt: string;
  dueAt?: string;
  idFactory: () => string; // opaque id (ULID/UUID) supplied by caller
}

/**
 * Derives the initial assignment status:
 * - LOCKED_PREREQUISITE if any prerequisite requirement is unsatisfied
 * - PENDING_CONTENT / BLOCKED_CONTENT if the requirement needs content that cannot resolve
 * - READY otherwise
 * Never returns COMPLETED — completion is a separate derived decision.
 */
export function deriveInitialStatus(input: BuildAssignmentInput): {
  status: AssignmentStatus;
  reasonCodes: string[];
} {
  const reasons: string[] = [];

  const unmetPrereqs = input.requirement.prerequisiteRequirementRefs.filter(
    (p) => !input.satisfiedRequirementIds.has(p.id),
  );
  if (unmetPrereqs.length > 0) {
    return {
      status: 'LOCKED_PREREQUISITE',
      reasonCodes: unmetPrereqs.map((p) => `PREREQ_UNMET:${p.id}`),
    };
  }

  if (input.requirement.contentRef) {
    if (!input.content) {
      return { status: 'PENDING_CONTENT', reasonCodes: ['CONTENT_UNRESOLVED'] };
    }
    const hashMatch = input.content.sha256 === input.requirement.contentRef.sha256;
    if (!input.content.available || !hashMatch) {
      reasons.push(input.content.available ? 'CONTENT_HASH_MISMATCH' : 'CONTENT_UNAVAILABLE');
      return { status: 'BLOCKED_CONTENT', reasonCodes: reasons };
    }
  }

  return { status: 'READY', reasonCodes: [] };
}

export function buildAssignment(input: BuildAssignmentInput): LearningAssignment {
  const { status, reasonCodes } = deriveInitialStatus(input);
  return {
    id: input.idFactory(),
    subjectId: input.subjectId,
    roleAssignmentIds: input.roleAssignmentIds,
    requirementRef: { id: input.requirement.id, version: input.requirement.version },
    pinnedContentRef: input.requirement.contentRef
      ? {
          id: input.requirement.contentRef.id,
          version: input.requirement.contentRef.version,
          sha256: input.requirement.contentRef.sha256,
        }
      : undefined,
    assignedAt: input.assignedAt,
    availableAt: input.availableAt,
    dueAt: input.dueAt,
    status,
    statusReasonCodes: reasonCodes,
    version: 1,
  };
}
