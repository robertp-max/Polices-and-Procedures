/* ═══════════════════════════════════════════════════════════════
   CES Role System — Authorized role set for all CES task assignment.
   ---------------------------------------------------------------
   LOCKED set. Do NOT add roles outside this list.
   Default owner for any unclear/ambiguous task: DON.
   ═══════════════════════════════════════════════════════════════ */

export const CES_ROLES = [
  'Governing Body',
  'Administrator',
  'Admin Designee',
  'DON',
  'DON Assistant',
  'Accounting',
  'Systems',
] as const;

export type CesRole = typeof CES_ROLES[number];

/** Roles that may sign, approve, certify, or lock evidence. DON Assistant is excluded. */
export const CES_SIGNER_ROLES: readonly CesRole[] = [
  'Governing Body',
  'Administrator',
  'Admin Designee',
  'DON',
  'Accounting',
  'Systems',
] as const;

/** Returns true when the role is authorized to sign/approve/certify. */
export function canRoleSign(role: CesRole): boolean {
  return (CES_SIGNER_ROLES as readonly string[]).includes(role);
}

/** Returns true when the role may fill forms and save drafts but never sign/approve/certify/lock. */
export function isDonAssistant(role: CesRole | string): boolean {
  return role === 'DON Assistant';
}

/** Full role assignment record required on every CES task. No field may be null/undefined. */
export interface CesTaskRoleAssignment {
  /** Primary executor — who performs the work. */
  assignedRole:     CesRole;
  /** Ultimately accountable owner (often same as assignedRole for atomic tasks). */
  accountableRole:  CesRole;
  /** Who reviews for quality/completeness. */
  reviewerRole:     CesRole;
  /** Who can approve / certify completion. */
  approverRole:     CesRole;
  /** Roles allowed to mark task complete. */
  canCompleteRoles: readonly CesRole[];
  /** Roles allowed to review task. */
  canReviewRoles:   readonly CesRole[];
  /** Roles allowed to approve/certify. */
  canApproveRoles:  readonly CesRole[];
  /** Role that receives escalation when task is overdue. */
  escalationRole:   CesRole;
}

/* ─── Role assignment rules ───────────────────────────────────
   Source of truth for how domains / task types map to roles.
   DON is the explicit default for any unresolved assignment.    */

export type CesTaskContext = {
  domain?:        string;   // 'clinical' | 'compliance' | 'hr' | 'governance'
  taskSourceType?: string;  // 'processFlow' | 'requiredForm' | 'approval' | 'minutes' | 'generated'
  ownerRole?:     string;   // raw ownerRole from the regulatory event
  title?:         string;
  workflowId?:    string;
};

/**
 * Resolves the CES canonical role from a raw role string.
 * Falls back to DON for unrecognized or missing values.
 */
export function resolveCesRole(raw: string | undefined | null): CesRole {
  if (!raw) return 'DON';
  const normalized = raw.trim().toLowerCase();

  if (normalized === 'don assistant')                                            return 'DON Assistant';
  if (normalized.includes('governing') || normalized.includes('board'))          return 'Governing Body';
  if (normalized.includes('administrator') && !normalized.includes('designee'))  return 'Administrator';
  if (normalized.includes('admin designee') || normalized.includes('designee'))  return 'Admin Designee';
  if (normalized.includes('don') || normalized.includes('director of nursing') ||
      normalized.includes('clinical') || normalized.includes('nurse'))           return 'DON';
  if (normalized.includes('account') || normalized.includes('billing') ||
      normalized.includes('finance') || normalized.includes('payroll') ||
      normalized.includes('revenue'))                                            return 'Accounting';
  if (normalized.includes('system') || normalized.includes('it') ||
      normalized.includes('tech') || normalized.includes('ecign') ||
      normalized.includes('support') || normalized.includes('config'))           return 'Systems';

  return 'DON'; // Default for all ambiguous
}

/**
 * Derives the primary assigned CES role from task context.
 * Governance domain → Governing Body; hr → Administrator; clinical default → DON.
 */
function deriveAssignedRole(ctx: CesTaskContext): CesRole {
  // Explicit ownerRole takes first priority if it maps cleanly
  if (ctx.ownerRole) {
    const resolved = resolveCesRole(ctx.ownerRole);
    if (resolved !== 'DON' || ctx.ownerRole.toLowerCase().includes('don')) return resolved;
  }

  const domain = ctx.domain?.toLowerCase() ?? '';
  const type   = ctx.taskSourceType ?? '';
  const title  = ctx.title?.toLowerCase() ?? '';

  // Governance domain → Governing Body
  if (domain === 'governance') return 'Governing Body';

  // Approval tasks → Administrator unless clinical
  if (type === 'approval') {
    if (domain === 'clinical') return 'DON';
    return 'Administrator';
  }

  // Minutes → Admin Designee
  if (type === 'minutes') return 'Admin Designee';

  // Clinical domain → DON
  if (domain === 'clinical') return 'DON';

  // HR domain → Administrator (agency-wide accountability)
  if (domain === 'hr') return 'Administrator';

  // Compliance domain — check title for billing/finance signals
  if (domain === 'compliance') {
    if (title.includes('bill') || title.includes('claim') || title.includes('financ') ||
        title.includes('payroll') || title.includes('revenue'))                  return 'Accounting';
    if (title.includes('system') || title.includes('config') || title.includes('access') ||
        title.includes('ecign') || title.includes('it '))                        return 'Systems';
    return 'Administrator';
  }

  // Default: DON
  return 'DON';
}

function deriveAccountableRole(assigned: CesRole, domain: string | undefined): CesRole {
  if (assigned === 'Admin Designee') return 'Administrator';
  if (assigned === 'Governing Body')  return 'Governing Body';
  if (domain === 'governance')        return 'Governing Body';
  return 'Administrator';
}

function deriveReviewerRole(assigned: CesRole): CesRole {
  if (assigned === 'Accounting')     return 'Administrator';
  if (assigned === 'Systems')        return 'Administrator';
  if (assigned === 'Admin Designee') return 'Administrator';
  if (assigned === 'DON')            return 'Administrator';
  return 'Administrator';
}

function deriveApproverRole(assigned: CesRole, domain: string | undefined): CesRole {
  if (domain === 'governance') return 'Governing Body';
  if (assigned === 'Governing Body') return 'Governing Body';
  return 'Administrator';
}

/**
 * Builds a complete `CesTaskRoleAssignment` for any CES task context.
 * Never returns null/undefined for any field.
 */
export function buildCesRoleAssignment(ctx: CesTaskContext): CesTaskRoleAssignment {
  const assigned    = deriveAssignedRole(ctx);
  const accountable = deriveAccountableRole(assigned, ctx.domain);
  const reviewer    = deriveReviewerRole(assigned);
  const approver    = deriveApproverRole(assigned, ctx.domain);

  const canComplete: CesRole[] = [assigned];
  if (assigned !== 'Administrator') canComplete.push('Administrator');
  if (assigned === 'DON') canComplete.push('DON Assistant');

  const canReview: CesRole[]  = [reviewer, 'Administrator'];
  const canApprove: CesRole[] = [approver, 'Governing Body'];
  if (!canApprove.includes('Administrator')) canApprove.push('Administrator');
  // DON Assistant may never appear in canApprove or canReview

  const escalation: CesRole = accountable === 'Administrator' ? 'Administrator' : 'DON';

  return {
    assignedRole:     assigned,
    accountableRole:  accountable,
    reviewerRole:     reviewer,
    approverRole:     approver,
    canCompleteRoles: [...new Set(canComplete)],
    canReviewRoles:   [...new Set(canReview)],
    canApproveRoles:  [...new Set(canApprove)],
    escalationRole:   escalation,
  };
}
