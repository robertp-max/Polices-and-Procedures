import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors.js';

/**
 * Server-side environment gate for the allowlist + activation-code direct-setup
 * flow. Direct setup is a controlled dev/UAT capability, so it is DISABLED by
 * default and fails closed for any unknown/invalid configuration. The client may
 * reflect availability for presentation, but this server gate is the only
 * security boundary — it never infers authorization from hostname, browser
 * state, storage, query params, or x-user-* headers.
 */
export type DirectSetupMode = 'disabled' | 'dev_allowlist';

/**
 * Resolve the mode from `DIRECT_SETUP_MODE`. Only the exact, explicit value
 * `dev_allowlist` enables the flow; anything else (missing, empty, `disabled`,
 * a typo, or a production-like value) resolves to `disabled`.
 */
export function resolveDirectSetupMode(env: NodeJS.ProcessEnv = process.env): DirectSetupMode {
  const raw = String(env.DIRECT_SETUP_MODE ?? '').trim().toLowerCase();
  return raw === 'dev_allowlist' ? 'dev_allowlist' : 'disabled';
}

export function isDirectSetupEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return resolveDirectSetupMode(env) === 'dev_allowlist';
}

/**
 * Throw a safe "unavailable" error when direct setup is not explicitly enabled.
 * Returns HTTP 404 with a generic message so a disabled deployment exposes no
 * allowlist detail and performs no account mutation.
 */
export function assertDirectSetupEnabled(env: NodeJS.ProcessEnv = process.env): void {
  if (!isDirectSetupEnabled(env)) {
    throw new ApiError('auth_error', 'Account setup is not available.', 404);
  }
}

/** Express middleware: short-circuit with a safe 404 unless direct setup is enabled. */
export function requireDirectSetupEnabled(_req: Request, _res: Response, next: NextFunction): void {
  try { assertDirectSetupEnabled(process.env); next(); } catch (e) { next(e); }
}
