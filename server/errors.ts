/* ═══════════════════════════════════════════════════════════════
   Typed API errors. Centralizes error codes so the frontend can
   present them consistently (e.g., "calendar_not_found" banner).
   ═══════════════════════════════════════════════════════════════ */

export type ApiErrorCode =
  | 'validation_error'
  | 'bad_request'
  | 'auth_error'
  | 'permission_denied'
  | 'forbidden'
  | 'protected_account'
  | 'calendar_not_found'
  | 'event_not_found'
  | 'not_found'
  | 'nolan_disabled'
  | 'duplicate'
  | 'rate_limited'
  | 'throttled'
  | 'network_error'
  | 'upstream_error'
  | 'internal_error';

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;
  details?: unknown;

  constructor(code: ApiErrorCode, message: string, status = 400, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/** Convert a googleapis error into a typed ApiError. */
export function fromGoogleError(e: unknown): ApiError {
  const err = e as { code?: number; errors?: unknown; message?: string; response?: { status?: number; data?: unknown } };
  const status = err?.response?.status ?? (typeof err?.code === 'number' ? err.code : undefined);
  const msg = err?.message ?? 'Google API error';

  if (status === 401) return new ApiError('auth_error', `Google auth failed: ${msg}`, 401, err?.response?.data);
  if (status === 403) return new ApiError('permission_denied', `Permission denied: ${msg}`, 403, err?.response?.data);
  if (status === 404) return new ApiError('calendar_not_found', `Calendar or event not found: ${msg}`, 404, err?.response?.data);
  if (status === 409) return new ApiError('duplicate', `Conflict: ${msg}`, 409, err?.response?.data);
  if (status === 429) return new ApiError('rate_limited', `Rate limited: ${msg}`, 429, err?.response?.data);
  if (status && status >= 500) return new ApiError('upstream_error', `Upstream Google error: ${msg}`, 502, err?.response?.data);
  return new ApiError('internal_error', msg, 500, err?.response?.data);
}
