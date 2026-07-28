/**
 * Care Indeed LMS — canonical serialization + real SHA-256 fingerprints.
 *
 * Every field named *Sha256 in the domain MUST hold an actual SHA-256 digest of a
 * canonical serialization — never a truncated or non-cryptographic hash. Server-side
 * only (node:crypto); the domain is not bundled into the browser.
 */
import { createHash } from 'node:crypto';

/** Deterministic JSON: object keys sorted recursively so semantically equal values hash equal. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = sortValue((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

export function sha256Hex(input: string | Uint8Array): string {
  return createHash('sha256').update(input).digest('hex');
}

/** SHA-256 of the canonical JSON of a value. */
export function sha256OfJson(value: unknown): string {
  return sha256Hex(canonicalJson(value));
}
