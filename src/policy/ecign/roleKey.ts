/* ═══════════════════════════════════════════════════════════════════
   Canonical role-key resolution for eCIgn lock-time authorization.

   The signer role captured at sign-start comes from the auth identity as a
   role KEY (e.g. "super_admin"). The enforcement actor carries a display
   LABEL (e.g. "Administrator"). These are two different namespaces, so a
   naive case-insensitive string compare produces a false "signer role
   changed" lock block AFTER the document is already signed.

   This module normalizes BOTH sides to a single canonical role key before
   comparing, so authorization uses keys (not display labels). It does NOT
   weaken the re-check: a genuinely different authority (e.g. a clinician or
   compliance officer) still canonicalizes to a different key and is blocked.
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Known label↔key synonyms. Only the admin authority family needs explicit
 * aliasing because "Administrator" is the UI label for the `super_admin`
 * (and `admin`) role keys. Every other role canonicalizes to its own slug,
 * so distinct roles stay distinct without enumerating them here.
 */
const ROLE_KEY_ALIASES: Record<string, string> = {
  super_admin: 'super_admin',
  superadmin: 'super_admin',
  super: 'super_admin',
  administrator: 'super_admin',
  admin: 'super_admin',
  sys_admin: 'super_admin',
  system_administrator: 'super_admin',
};

/**
 * Normalizes a role string (display label OR role key) to a canonical key:
 * lowercased, separators collapsed to `_`, non-alphanumerics stripped, and
 * known admin-family synonyms folded together.
 */
export function toCanonicalRoleKey(role: string | null | undefined): string {
  const slug = String(role ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s/\\.-]+/g, '_')
    .replace(/[^a-z0-9_]+/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (!slug) return '';
  return ROLE_KEY_ALIASES[slug] ?? slug;
}

/**
 * Returns true when two roles refer to the same canonical authority for the
 * purpose of the pre-lock signer re-check.
 *
 * If either side cannot be resolved to a canonical key (empty/unknown input),
 * we return `true` — we must NOT block an already-signed document on the basis
 * of a role we cannot even resolve. A genuine role change between two known,
 * different authorities still returns `false` and blocks before lock.
 */
export function rolesMatchForLock(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const ka = toCanonicalRoleKey(a);
  const kb = toCanonicalRoleKey(b);
  if (!ka || !kb) return true;
  return ka === kb;
}
