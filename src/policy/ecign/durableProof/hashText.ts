/**
 * Portable SHA-256 hex for UTF-8 text (Node crypto).
 * Used for policy body hashing in durable proof packets.
 */
import { createHash } from 'node:crypto';

export function sha256Text(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}
