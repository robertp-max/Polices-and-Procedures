/* ═══════════════════════════════════════════════════════════════
   Role hierarchy — drives escalation routing & unlock authority.

   Higher precedence = more authority. When an approver misses
   their window, escalation targets the next higher role (or the
   role explicitly named in the approval rule, whichever is higher).
   ═══════════════════════════════════════════════════════════════ */

export const ROLE_PRECEDENCE: Record<string, number> = {
  'Board Chair':             100,
  'Governing Body':           95,
  'Administrator':            90,
  'Compliance Officer':       80,
  'Medical Director':         78,
  'Director of Nursing':      75,
  'QAPI Committee Chair':     72,
  'QAPI Coordinator':         70,
  'Revenue Cycle Director':   65,
  'Risk Manager':             65,
  'Information Security Officer': 65,
  'Clinical Director':        60,
  'HR Training Coordinator':  55,
  'Board Secretary':          50,
  'RC Specialist':            40,
  'Current User':             10,
};

/** Returns the canonical escalation target given a from-role and an explicit override. */
export function resolveEscalationTarget(fromRole: string, explicit?: string): string {
  if (explicit) {
    const explicitRank = ROLE_PRECEDENCE[explicit] ?? 0;
    const fromRank     = ROLE_PRECEDENCE[fromRole] ?? 0;
    // Only use explicit when it is actually higher, otherwise fall through.
    if (explicitRank > fromRank) return explicit;
  }
  const from = ROLE_PRECEDENCE[fromRole] ?? 0;
  const candidates = Object.entries(ROLE_PRECEDENCE)
    .filter(([, rank]) => rank > from)
    .sort(([, a], [, b]) => a - b);
  return candidates[0]?.[0] ?? 'Administrator';
}

export function hasAuthority(role: string, requiredRole: string): boolean {
  return (ROLE_PRECEDENCE[role] ?? 0) >= (ROLE_PRECEDENCE[requiredRole] ?? 0);
}

export function canUnlock(role: string, unlockRole = 'Administrator'): boolean {
  return hasAuthority(role, unlockRole);
}
