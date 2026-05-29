/* ═══════════════════════════════════════════════════════════════════
   Versioned eCIgn enrollment agreement source.

   The agreement is captured ONCE during first-time enrollment. When the
   version changes, consent must be re-accepted. The text hash is recorded on
   the consent profile and on every signature record / certificate so that the
   exact agreement a signer accepted can always be proven.
   ═══════════════════════════════════════════════════════════════════ */

export const ECIGN_AGREEMENT_VERSION = '2026-05-28-v1';

export const ECIGN_AGREEMENT_TEXT = `
By enrolling in eCIgn, I agree that my electronic signature, initials, approval, attestation, or acknowledgment applied through this system is intended to be my legally binding electronic signature for the selected document, form, record, certificate, or evidence package.

I understand that when I click an eCIgn signature icon or signature field, the system will apply my electronic signature to that specific document or form instance and create an audit record showing my identity, role, permission, timestamp, document context, and agreement version.

I agree that my electronic signature has the same meaning as my handwritten signature for internal agency compliance, workflow execution, audit, and evidence purposes where electronic signature is permitted.

I understand that each eCIgn action is recorded with the applicable event, workflow, task, form, form instance, signature requirement, and evidence package context.

I understand that I must not share my login credentials or allow another person to sign using my account.

I agree to notify the agency immediately if my account, device, or signing authority is compromised.

I understand that my signing authority depends on my assigned role and eCIgn permission role.
`;

/**
 * Deterministic, synchronous string hash (FNV-1a, 64-bit, hex).
 *
 * Used for consent-text and signature-profile hashes. It is synchronous so it
 * works identically inside React stores, validators, and Node scripts without
 * the async ceremony of `crypto.subtle`. It is a content fingerprint for
 * tamper-evidence/audit linkage, not a cryptographic password digest.
 */
export function ecignContentHash(input: string): string {
  let hi = 0xcbf29ce4 >>> 0;
  let lo = 0x84222325 >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    lo ^= code & 0xff;
    // multiply by FNV prime (1099511628211) using 32-bit halves
    const loXprime = lo * 0x01000193;
    const hiXprime = hi * 0x01000193 + ((lo * 0x00000100) >>> 0);
    lo = loXprime >>> 0;
    hi = (hiXprime + (loXprime >= 0x100000000 ? Math.floor(loXprime / 0x100000000) : 0)) >>> 0;
  }
  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return `fnv1a64:${toHex(hi)}${toHex(lo)}`;
}

let CACHED_AGREEMENT_HASH: string | null = null;

/** Hash of the current agreement text + version (stable per build). */
export function getCurrentConsentTextHash(): string {
  if (CACHED_AGREEMENT_HASH) return CACHED_AGREEMENT_HASH;
  CACHED_AGREEMENT_HASH = ecignContentHash(`${ECIGN_AGREEMENT_VERSION}\n${ECIGN_AGREEMENT_TEXT}`);
  return CACHED_AGREEMENT_HASH;
}
