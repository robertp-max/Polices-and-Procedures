import crypto from 'node:crypto';

/* ═══════════════════════════════════════════════════════════════════════════
   Deterministic, server-side OTP service (NOT model-generated).
   ----------------------------------------------------------------------------
   • Cryptographically secure (CSPRNG).
   • Expiring + one-time use, scoped to a specific user + purpose.
   • Stored only as a salted SHA-256 hash — never plaintext.
   • The plaintext value is returned EXACTLY ONCE (at creation) and is never
     logged, never re-derivable, and never persisted.
   ═══════════════════════════════════════════════════════════════════════════ */

interface OtpRecord {
  otpId: string;
  hash: string;          // sha256(salt + otp) — plaintext never stored
  salt: string;
  targetUserId: string;
  purpose: string;
  createdByUserId: string;
  createdAt: string;
  expiresAt: number;     // epoch ms
  used: boolean;
}

const store = new Map<string, OtpRecord>();

// CSPRNG alphabet excluding ambiguous chars (0/O, 1/I/l).
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const DEFAULT_LENGTH = 10;
const MIN_TTL_MS = 60_000;            // 1 minute
const MAX_TTL_MS = 24 * 60 * 60_000;  // 24 hours

function randomToken(length: number): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[crypto.randomInt(0, ALPHABET.length)];
  }
  return out;
}

export interface GenerateOtpInput {
  targetUserId: string;
  purpose: string;
  ttlMs?: number;
  createdByUserId: string;
}

export interface GenerateOtpResult {
  otpId: string;
  /** The plaintext OTP — returned ONCE, never stored or logged. */
  otp: string;
  expiresAt: string; // ISO
  targetUserId: string;
  purpose: string;
}

export function generateOtp(input: GenerateOtpInput): GenerateOtpResult {
  const target = String(input.targetUserId ?? '').trim();
  const purpose = String(input.purpose ?? '').trim();
  if (!target) throw new Error('targetUserId is required');
  if (!purpose) throw new Error('purpose is required');

  const ttl = Math.min(MAX_TTL_MS, Math.max(MIN_TTL_MS, input.ttlMs ?? 15 * 60_000));
  const otp = randomToken(DEFAULT_LENGTH);
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(salt + otp).digest('hex');
  const otpId = `otp-${crypto.randomUUID()}`;
  const now = Date.now();

  store.set(otpId, {
    otpId, hash, salt,
    targetUserId: target,
    purpose,
    createdByUserId: input.createdByUserId,
    createdAt: new Date(now).toISOString(),
    expiresAt: now + ttl,
    used: false,
  });

  return { otpId, otp, expiresAt: new Date(now + ttl).toISOString(), targetUserId: target, purpose };
}

export interface VerifyOtpResult {
  ok: boolean;
  reason?: string;
}

/** One-time verification: consumes the OTP on success; fail-closed otherwise. */
export function verifyOtp(otpId: string, otp: string, targetUserId?: string): VerifyOtpResult {
  const rec = store.get(otpId);
  if (!rec) return { ok: false, reason: 'unknown or expired OTP' };
  if (rec.used) return { ok: false, reason: 'OTP already used' };
  if (Date.now() > rec.expiresAt) { store.delete(otpId); return { ok: false, reason: 'OTP expired' }; }
  if (targetUserId && targetUserId !== rec.targetUserId) return { ok: false, reason: 'OTP not scoped to this user' };

  const candidate = crypto.createHash('sha256').update(rec.salt + String(otp ?? '')).digest('hex');
  const a = Buffer.from(candidate, 'hex');
  const b = Buffer.from(rec.hash, 'hex');
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!match) return { ok: false, reason: 'OTP mismatch' };

  rec.used = true; // one-time
  return { ok: true };
}

/** Non-sensitive metadata for audit / review surfaces (never the value/hash). */
export function describeOtp(otpId: string): { otpId: string; targetUserId: string; purpose: string; expiresAt: string; used: boolean } | null {
  const rec = store.get(otpId);
  if (!rec) return null;
  return {
    otpId: rec.otpId,
    targetUserId: rec.targetUserId,
    purpose: rec.purpose,
    expiresAt: new Date(rec.expiresAt).toISOString(),
    used: rec.used,
  };
}

/** Test-only reset. */
export function __resetOtpStore(): void {
  store.clear();
}
