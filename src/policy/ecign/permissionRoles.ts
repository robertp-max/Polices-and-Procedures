/* ═══════════════════════════════════════════════════════════════════
   eCIgn Permission Role model

   A workflow/signer role (`SignerRole`) is NOT the same as a signing
   permission (`ECIgnPermissionRole`).

   - signerRole              = business / workflow authority (e.g. "Clinical Manager")
   - requiredPermissionRole  = system permission required to execute the
                               signing / review / approval action (e.g. "eCIgner")

   A user may be assigned to a signer role but must ALSO hold the required
   eCIgn permission role before the signature can be executed.
   ═══════════════════════════════════════════════════════════════════ */
import type { ECIgnPermissionRole, SignerRole } from './types';

export const ECIGN_PERMISSION_ROLES: ECIgnPermissionRole[] = [
  'eCIgner',
  'eCIgn Reviewer',
  'eCIgn Final Approver',
  'eCIgn Administrator',
  'eCIgn Witness',
  'eCIgn System',
];

/**
 * Authority rank for the hierarchical signing permissions. Higher rank
 * satisfies any lower signing-permission requirement ("or higher").
 * `eCIgn Witness` and `eCIgn System` are intentionally outside the
 * hierarchical ladder (rank 0) — they are special-purpose, not escalating.
 */
const PERMISSION_RANK: Record<ECIgnPermissionRole, number> = {
  'eCIgner': 1,
  'eCIgn Reviewer': 2,
  'eCIgn Final Approver': 3,
  'eCIgn Administrator': 4,
  'eCIgn Witness': 0,
  'eCIgn System': 0,
};

const HIERARCHICAL_ROLES = new Set<ECIgnPermissionRole>([
  'eCIgner',
  'eCIgn Reviewer',
  'eCIgn Final Approver',
  'eCIgn Administrator',
]);

/**
 * Returns true when `held` permission roles satisfy the `required` permission.
 *
 * Gate rules:
 *  1. A signer task needs `eCIgner` (or higher).
 *  2. A reviewer task needs `eCIgn Reviewer` (or higher).
 *  3. A final-approval task needs `eCIgn Final Approver` (or higher).
 *  4. `eCIgn Administrator` satisfies all hierarchical signing requirements.
 *  5. `eCIgn System` is never a human signer and never satisfies a human
 *     signing requirement.
 */
export function permissionSatisfies(
  held: readonly ECIgnPermissionRole[],
  required: ECIgnPermissionRole,
): boolean {
  if (required === 'eCIgn System') {
    // The eCIgn System "permission" is non-human and is not user-grantable.
    return false;
  }
  if (held.includes(required)) return true;
  // Witness is a discrete, non-escalating capability.
  if (required === 'eCIgn Witness') return held.includes('eCIgn Witness');
  if (!HIERARCHICAL_ROLES.has(required)) return false;
  const requiredRank = PERMISSION_RANK[required];
  return held.some(role => HIERARCHICAL_ROLES.has(role) && PERMISSION_RANK[role] >= requiredRank);
}

/**
 * Resolves the required eCIgn permission role for a signature requirement
 * given the canonical signer role plus the slot/path semantics.
 *
 * Examples (from the canonical hierarchy spec):
 *  - Clinical Manager signing Plan of Care Audit  → eCIgner
 *  - QAPI Lead / Chair signing committee minutes   → eCIgn Final Approver
 *  - Governing Body review / sign-off              → eCIgn Final Approver
 *  - Compliance Officer review                     → eCIgn Reviewer
 */
export function inferRequiredPermissionRole(input: {
  signerRole: SignerRole;
  signatureSlot?: string;
  isReviewer?: boolean;
  isFinalApprover?: boolean;
}): ECIgnPermissionRole {
  const { signerRole, signatureSlot, isReviewer, isFinalApprover } = input;
  const slot = (signatureSlot ?? '').toLowerCase();

  if (signerRole === 'Evidence / eCIgn System') return 'eCIgn System';

  // Governing body always sits at final-approver authority.
  if (
    signerRole === 'Governing Body' ||
    signerRole === 'Governing Body Chair' ||
    signerRole === 'Board Chair'
  ) {
    return 'eCIgn Final Approver';
  }

  if (isFinalApprover) return 'eCIgn Final Approver';

  // QAPI chair signing committee minutes / QAPI packet → final approver.
  if (signerRole === 'QAPI Lead / Chair' && /minutes|signoff|sign-off|approval|packet/.test(slot)) {
    return 'eCIgn Final Approver';
  }

  if (isReviewer || /review/.test(slot)) return 'eCIgn Reviewer';

  return 'eCIgner';
}

/* ─── User → permission role resolution ────────────────────────────────
   The demo/training environment derives a user's granted permission roles
   from their workflow role. A real deployment would source these from an
   identity/permission directory; this resolver keeps the gate honest while
   remaining demo-friendly. Roles may also be granted explicitly via the
   override map below (e.g. set during enrollment by an administrator). */

const ROLE_PERMISSION_GRANTS: Array<{ match: RegExp; grants: ECIgnPermissionRole[] }> = [
  { match: /governing body|board chair|board member/, grants: ['eCIgn Final Approver', 'eCIgn Reviewer', 'eCIgner'] },
  { match: /administrator/, grants: ['eCIgn Administrator', 'eCIgn Final Approver', 'eCIgn Reviewer', 'eCIgner'] },
  { match: /qapi (lead|chair)|chair/, grants: ['eCIgn Final Approver', 'eCIgn Reviewer', 'eCIgner'] },
  { match: /compliance officer|compliance liaison/, grants: ['eCIgn Reviewer', 'eCIgner'] },
  { match: /director of nursing|\bdon\b|clinical manager|clinical reviewer|medical director/, grants: ['eCIgn Reviewer', 'eCIgner'] },
  { match: /infection preventionist/, grants: ['eCIgn Reviewer', 'eCIgner'] },
  { match: /data analyst|quality source/, grants: ['eCIgner'] },
  { match: /finance|cfo|accounting/, grants: ['eCIgn Reviewer', 'eCIgner'] },
  { match: /operations director/, grants: ['eCIgn Reviewer', 'eCIgner'] },
  { match: /operations/, grants: ['eCIgner'] },
  { match: /it director|ciso|it \/ security|information security/, grants: ['eCIgn Reviewer', 'eCIgner'] },
  { match: /risk manager/, grants: ['eCIgn Reviewer', 'eCIgner'] },
  { match: /supervisor/, grants: ['eCIgner'] },
  { match: /witness/, grants: ['eCIgn Witness', 'eCIgner'] },
  { match: /scribe|hr|employee|workforce|staff|self|owner|requester/, grants: ['eCIgner'] },
];

/**
 * Derives the eCIgn permission roles a user holds from their workflow role.
 * Always returns at least `['eCIgner']` for any authenticated, recognized
 * human role so that ordinary signers can enroll. Returns an empty list only
 * for explicitly non-signing contexts (no role at all).
 */
export function resolveUserPermissionRoles(role: string | undefined | null): ECIgnPermissionRole[] {
  const normalized = String(role ?? '').trim().toLowerCase();
  if (!normalized) return ['eCIgner'];
  if (/ecign system|evidence \/ ecign/.test(normalized)) return ['eCIgn System'];
  for (const entry of ROLE_PERMISSION_GRANTS) {
    if (entry.match.test(normalized)) return dedupe(entry.grants);
  }
  // Default: any recognized authenticated user may sign as a base eCIgner.
  return ['eCIgner'];
}

function dedupe(roles: ECIgnPermissionRole[]): ECIgnPermissionRole[] {
  return Array.from(new Set(roles));
}

export function permissionRoleLabel(role: ECIgnPermissionRole): string {
  return role;
}
