/**
 * COG-2 — server-side Cognito access-token claim validation (pure).
 *
 * This module NEVER trusts client-supplied identity headers. It validates the
 * claims of a Cognito **access** token. Authenticity (signature + liveness +
 * revocation) is proven separately by a Cognito `GetUser` call in the auth
 * service; this pure layer rejects the cheap, deterministic failure classes
 * first (wrong token_use, wrong issuer, wrong client, expired, malformed) so
 * they can be unit-tested without any network.
 */
import { ApiError } from '../errors.js';

export interface CognitoTokenConfig {
  /** Expected issuer: https://cognito-idp.<region>.amazonaws.com/<userPoolId> */
  issuer: string;
  /** Expected app client id (access-token `client_id` claim). */
  clientId: string;
}

export interface VerifiedTokenClaims {
  sub: string;
  clientId: string;
  tokenUse: 'access';
  exp: number;
  username?: string;
}

/** Build the canonical Cognito issuer URL for a pool. */
export function expectedIssuer(region: string, userPoolId: string): string {
  return `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
}

/**
 * Decode a JWT payload WITHOUT verifying the signature. Safe here only because
 * a downstream Cognito `GetUser` call proves authenticity; this decode exists
 * purely to read claims for the fail-fast checks below. Throws 401 on anything
 * that is not a well-formed 3-part JWT with a JSON payload.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  if (!token || typeof token !== 'string') {
    throw new ApiError('auth_error', 'Missing bearer token.', 401);
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new ApiError('auth_error', 'Malformed bearer token.', 401);
  }
  try {
    const json = Buffer.from(parts[1], 'base64url').toString('utf8');
    const payload = JSON.parse(json) as Record<string, unknown>;
    if (!payload || typeof payload !== 'object') {
      throw new ApiError('auth_error', 'Malformed token payload.', 401);
    }
    return payload;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError('auth_error', 'Malformed token payload.', 401);
  }
}

/**
 * Validate access-token claims against the configured pool/client. Fail-closed:
 * any mismatch throws 401. Does NOT prove authenticity (see module note).
 */
export function validateAccessTokenClaims(
  payload: Record<string, unknown>,
  cfg: CognitoTokenConfig,
  nowSeconds: number,
): VerifiedTokenClaims {
  const tokenUse = payload.token_use;
  if (tokenUse !== 'access') {
    // Reject id tokens and any non-access token type outright.
    throw new ApiError('auth_error', 'Wrong token type.', 401);
  }
  if (typeof payload.iss !== 'string' || payload.iss !== cfg.issuer) {
    throw new ApiError('auth_error', 'Token issuer not recognized.', 401);
  }
  if (typeof payload.client_id !== 'string' || payload.client_id !== cfg.clientId) {
    throw new ApiError('auth_error', 'Token audience/client not recognized.', 401);
  }
  const exp = typeof payload.exp === 'number' ? payload.exp : NaN;
  if (!Number.isFinite(exp) || exp <= nowSeconds) {
    throw new ApiError('auth_error', 'Token expired.', 401);
  }
  const sub = payload.sub;
  if (typeof sub !== 'string' || !sub) {
    throw new ApiError('auth_error', 'Token missing subject.', 401);
  }
  return {
    sub,
    clientId: payload.client_id,
    tokenUse: 'access',
    exp,
    username: typeof payload.username === 'string' ? payload.username : undefined,
  };
}
