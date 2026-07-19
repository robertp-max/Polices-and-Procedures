import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors.js';

/**
 * Narrowly-scoped, in-memory rate limiter for the public direct-setup endpoints.
 *
 * Two independent fixed windows per request — one keyed by source IP, one by the
 * NORMALIZED target email — so neither dimension can be exhausted by the other
 * (IP/identity isolation). The activation code and password are NEVER used as
 * keys or logged. Windows reset automatically (no permanent lockout). This is a
 * single-instance guard; distributed abuse is out of scope (documented). It never
 * grants or alters authority.
 */
export interface RateLimitConfig { windowMs: number; max: number; }

/** Verification is looser than final setup (which performs the mutation). */
export const VERIFY_LIMIT: RateLimitConfig = { windowMs: 60_000, max: 12 };
export const SETUP_LIMIT: RateLimitConfig = { windowMs: 60_000, max: 6 };

interface Window { count: number; resetAt: number; }
export type RateStore = Map<string, Window>;

export interface RateDecision { allowed: boolean; retryAfterSec: number }

/** Pure, testable core: increment the window for `key` and decide. */
export function hitWindow(store: RateStore, key: string, cfg: RateLimitConfig, now: number): RateDecision {
  const w = store.get(key);
  if (!w || now >= w.resetAt) {
    store.set(key, { count: 1, resetAt: now + cfg.windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (w.count >= cfg.max) {
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((w.resetAt - now) / 1000)) };
  }
  w.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

/** Check both the IP window and the identity window; blocked if EITHER is over. */
export function checkDirectSetupRate(
  store: RateStore, scope: string, ip: string, identityNormalized: string, cfg: RateLimitConfig, now: number,
): RateDecision {
  const ipDec = hitWindow(store, `${scope}|ip|${ip || 'unknown'}`, cfg, now);
  // Only consume the identity window when an identity is present.
  const idDec = identityNormalized
    ? hitWindow(store, `${scope}|id|${identityNormalized}`, cfg, now)
    : { allowed: true, retryAfterSec: 0 };
  if (ipDec.allowed && idDec.allowed) return { allowed: true, retryAfterSec: 0 };
  return { allowed: false, retryAfterSec: Math.max(ipDec.retryAfterSec, idDec.retryAfterSec) };
}

const globalStore: RateStore = new Map();

/** Express middleware factory for a given scope + limit. */
export function directSetupRateLimit(scope: string, cfg: RateLimitConfig, store: RateStore = globalStore) {
  return function rateLimit(req: Request, res: Response, next: NextFunction): void {
    const ip = String(req.ip || req.socket?.remoteAddress || 'unknown');
    const identity = String((req.body as { email?: unknown })?.email ?? '').trim().toLowerCase();
    const dec = checkDirectSetupRate(store, scope, ip, identity, cfg, Date.now());
    if (dec.allowed) { next(); return; }
    res.setHeader('Retry-After', String(dec.retryAfterSec));
    // Safe, non-enumerating message; carries no activation code / password / listing state.
    next(new ApiError('throttled', `Too many attempts. Please wait ${dec.retryAfterSec} seconds and try again.`, 429));
  };
}
