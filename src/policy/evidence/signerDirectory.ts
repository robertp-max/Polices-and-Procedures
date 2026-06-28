/* ════════════════════════════════════════════════════════════════════════════
   Canonical signer directory — the real people who hold each committee/officer
   role, used for BOTH demo and production packet + signature rosters.

   Single source of truth so signer names never drift across the Signature
   Tracker, packet artifacts, and any role-based assignment.

   - Compliance cluster (Compliance, HIPAA, Privacy, Security, Infection Control,
     Quality/QAPI, Risk)         → Dee Bustos
   - Finance cluster (Billing, Accounting, Finance, Payroll) → Adrian Lindain
   ════════════════════════════════════════════════════════════════════════════ */

export const SIGNERS = {
  /** Compliance / HIPAA / Privacy / Security / Infection Control / Quality / Risk. */
  compliance: 'Dee Bustos',
  /** Billing / Accounting / Finance / Payroll. */
  billing: 'Adrian Lindain',
} as const;

const COMPLIANCE_ROLE = /compliance|hipaa|privacy|security|infection|quality|qapi|risk/i;
const FINANCE_ROLE = /billing|account|finance|payroll/i;

/**
 * Resolve the real signer name for a role label. Compliance/security/privacy/
 * infection-control roles resolve to Dee Bustos; billing/finance roles to Adrian
 * Lindain. Anything else returns `fallback` (e.g. the role's existing assignee).
 */
export function resolveSignerName(role: string, fallback = ''): string {
  if (COMPLIANCE_ROLE.test(role)) return SIGNERS.compliance;
  if (FINANCE_ROLE.test(role)) return SIGNERS.billing;
  return fallback;
}
