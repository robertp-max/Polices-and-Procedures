/// <reference types="node" />
/**
 * eCIgn Path B — Phase 2A: canonical SHA-256 over raw bytes (server-side).
 *
 * §2 requires hashes be recomputed server-side over the canonical bytes (never
 * trusted from client/Drive/Evidence). This uses Node's crypto and is intended
 * for the Node/server context. It performs NO I/O beyond hashing the buffer.
 */
import { createHash } from 'node:crypto';

/** Lowercase hex SHA-256 (64 chars) of the given bytes. */
export function sha256Hex(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}
