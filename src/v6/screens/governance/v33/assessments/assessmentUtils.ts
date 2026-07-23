// Shared, dependency-free helpers for the controlled assessment engines.
// Deterministic shuffling (per learner + attempt + form) so a given attempt is
// reproducible and auditable, plus active-time tracking and a lightweight
// integrity hash for the evidence record.

/** Deterministic 32-bit string hash (FNV-1a). */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Mulberry32 seeded PRNG — small, fast, deterministic. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic Fisher–Yates shuffle keyed by an arbitrary seed string. */
export function deterministicShuffle<T>(items: readonly T[], seedKey: string): T[] {
  const rand = seededRandom(hashString(seedKey));
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Pick one of N alternate forms deterministically for a learner+attempt. */
export function pickForm(formCount: number, seedKey: string): number {
  if (formCount <= 1) return 0;
  return hashString(seedKey) % formCount;
}

/** A non-cryptographic integrity fingerprint for an evidence payload. */
export function integrityHash(payload: unknown): string {
  return hashString(JSON.stringify(payload)).toString(16).padStart(8, '0');
}
