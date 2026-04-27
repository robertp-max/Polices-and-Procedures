/** Deterministic, non-cryptographic content hash placeholder.
 *  In production this is SHA-256 of canonical bytes; here it is stable across sessions
 *  and seeded inputs so audit chain replay tests pass deterministically. */
export function fauxHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return 'sha256:' + h.toString(16).padStart(8, '0') + '00000000';
}

let _seq = 0;
export function nextUlid(prefix = 'OBV2'): string {
  _seq += 1;
  return `${prefix}-${_seq.toString(36).padStart(8, '0').toUpperCase()}`;
}
