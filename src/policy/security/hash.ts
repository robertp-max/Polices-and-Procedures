// Portable canonical JSON + sha256 (Web Crypto / Node 20+ globalThis.crypto.subtle)
// Used by the audit hash chain (Builder/Security-Execution-Audit/04 §4).

export function canonicalJSON(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(v: unknown): unknown {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(canonicalize);
  const obj = v as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(obj).sort()) out[k] = canonicalize(obj[k]);
  return out;
}

export async function sha256Hex(input: string): Promise<string> {
  const subtle =
    (globalThis as unknown as { crypto?: { subtle?: SubtleCrypto } }).crypto?.subtle;
  if (!subtle) {
    // Node fallback: dynamic import of node:crypto without making it a hard dep at type time.
    const mod = await import('node:crypto').catch(() => null);
    if (!mod) throw new Error('No SubtleCrypto and node:crypto unavailable');
    return mod.createHash('sha256').update(input, 'utf8').digest('hex');
  }
  const buf = new TextEncoder().encode(input);
  const digest = await subtle.digest('SHA-256', buf);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export const GENESIS_HASH = '0'.repeat(64);

// UUIDv7-ish (time-ordered) without external deps.
export function uuidv7(): string {
  const ts = Date.now();
  const tsHex = ts.toString(16).padStart(12, '0');
  const rand = crypto.getRandomValues
    ? crypto.getRandomValues(new Uint8Array(10))
    : new Uint8Array(10).map(() => Math.floor(Math.random() * 256));
  const rhex = [...rand].map(b => b.toString(16).padStart(2, '0')).join('');
  // 8-4-4-4-12 layout, version 7 nibble in first nibble of group 3, variant 10 in group 4.
  const p1 = tsHex.slice(0, 8);
  const p2 = tsHex.slice(8, 12);
  const p3 = '7' + rhex.slice(0, 3);
  const p4 = ((parseInt(rhex.slice(3, 4), 16) & 0x3) | 0x8).toString(16) + rhex.slice(4, 7);
  const p5 = rhex.slice(7) + rhex.slice(0, 5); // 12 chars
  return `${p1}-${p2}-${p3}-${p4}-${p5.slice(0, 12)}`;
}
