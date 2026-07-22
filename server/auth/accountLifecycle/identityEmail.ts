/**
 * Canonical identity-email normalization (ADR-0002 Phase 2A).
 *
 * Normalization performs ONLY trim + lowercase. It deliberately does NOT strip
 * plus-tags: `robertp+phase7uat@careindeed.com` is a DISTINCT identity from
 * `robertp@careindeed.com` and must never be collapsed. Email is a mutable
 * address/alias, never the record identity or an idempotency key.
 */
export function normalizeIdentityEmail(raw: string | null | undefined): string {
  return String(raw ?? '').trim().toLowerCase();
}
