/**
 * Typed client for /api/ecign/*, /api/audit/*, /api/compliance/*.
 * Single source of truth for fetch calls and auth headers from the
 * frontend. All state-changing calls run through here so audit trail
 * is created on EVERY action.
 */
import { buildEcignAuthHeaders } from './signerIdentity';
import type { RequiredSignerPayload } from './signerAuthority';

const BASE = '/api';
type EcignMode = 'DEMO_LOCAL' | 'BACKEND_LIVE'; // DEMO_LOCAL never used at runtime for CES evidence finalization (forced BACKEND_LIVE)

const ENV = (import.meta as unknown as { env?: Record<string, string | boolean> }).env ?? {};
// Production CES/eCign/evidence: DEMO_LOCAL disabled. BACKEND_LIVE (real Drive persistence) is required.
const REQUESTED_MODE: EcignMode = 'BACKEND_LIVE';
const ALLOW_LIVE_FALLBACK = false; // hard disabled — no silent local fallback for signed evidence finalization

const resolvedMode: EcignMode = REQUESTED_MODE;

function isDev(): boolean {
  return Boolean(ENV.DEV);
}



function errorDev(message: string, details?: unknown): void {
  if (!isDev()) return;
  console.error(`[ecign] ${message}`, details ?? '');
}

function isRouteMissing(status: number, body: unknown): boolean {
  if (status !== 404) return false;
  if (!body || typeof body !== 'object') return false;
  const error = (body as { error?: { message?: string } }).error;
  return typeof error?.message === 'string' && error.message.includes('Unknown route');
}

function normalizeUnavailableError(path: string, status?: number): EcignApiError {
  return new EcignApiError(
    status ?? 503,
    'ECIGN_BACKEND_UNAVAILABLE',
    `eCIgn backend is unavailable. Real backend/Drive persistence is required for evidence finalization.`,
    { path, mode: resolvedMode },
  );
}

export function getEcignClientMode(): { requested: EcignMode; resolved: EcignMode; fallbackEnabled: boolean } {
  return { requested: REQUESTED_MODE, resolved: resolvedMode, fallbackEnabled: ALLOW_LIVE_FALLBACK };
}

function authHeaders(extra?: Record<string, string>): HeadersInit {
  return buildEcignAuthHeaders(extra);
}

export class EcignApiError extends Error {
  status: number;
  code:   string;
  body:   unknown;
  constructor(status: number, code: string, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.code   = code;
    this.body   = body;
  }
}

async function call<T>(path: string, init?: RequestInit, mfaToken?: string): Promise<T> {
  // Strict: DEMO_LOCAL disabled for CES/eCign/evidence finalization. No fallback allowed.
  if (resolvedMode !== 'BACKEND_LIVE') {
    throw normalizeUnavailableError(path);
  }
  const headers = authHeaders(mfaToken ? { 'X-MFA-Token': mfaToken } : undefined);
  const res: Response = await fetch(`${BASE}${path}`, { ...init, headers: { ...headers, ...(init?.headers ?? {}) } })
    .catch((_error) => { throw normalizeUnavailableError(path); });
  const text = await res.text();
  const body: unknown = (() => { try { return text ? JSON.parse(text) : null; } catch { return text; } })();
  if (res.status >= 500) {
    throw normalizeUnavailableError(path, res.status);
  }
  if (isRouteMissing(res.status, body)) {
    errorDev(`Route missing for eCIgn API client: ${init?.method ?? 'GET'} ${path}`, body);
    throw new EcignApiError(
      404,
      'ECIGN_ROUTE_MISSING',
      `eCIgn route is missing: ${init?.method ?? 'GET'} ${path}.`,
      body,
    );
  }
  if (!res.ok) {
    const b = body as { error?: { code?: string; message?: string } } | string | null;
    const code = typeof b === 'object' && b && 'error' in b ? (b.error?.code ?? 'UNKNOWN') : 'UNKNOWN';
    const msg  = typeof b === 'object' && b && 'error' in b ? (b.error?.message ?? `HTTP ${res.status}`) : `HTTP ${res.status}`;
    throw new EcignApiError(res.status, code, msg, body);
  }
  return body as T;
}

/* ── Disclosure & consent ──────────────────────────────────────── */
export interface DisclosureCurrent { disclosure_version: string; text: string; text_hash: string; }
export interface NetworkInfoResponse {
  ip: string;
  city: string;
  region: string;
  country: string;
  postal: string;
  org: string;
  source: string;
  capturedAt: string;
  userAgent: string;
  lookupStatus: 'resolved' | 'lookup_failed' | 'private_or_local_ip' | string;
  failureReason?: string;
}
export interface NetworkGeoEvidence {
  city?: string;
  region?: string;
  country?: string;
  postal?: string;
  org?: string;
}

export interface DeviceEvidence {
  name?: string;
  manufacturer?: string;
  model?: string;
  processor?: string;
  os?: string;
  os_version?: string;
  platform?: string;
}

export const ecignApi = {
  getCurrentDisclosure: () => call<DisclosureCurrent>('/ecign/disclosures/current'),
  getNetworkInfo: () => call<NetworkInfoResponse>('/ecign/network-info'),

  recordConsent: (disclosure_version: string) =>
    call<{ consent_id: string }>('/ecign/consents', {
      method: 'POST',
      body: JSON.stringify({ disclosure_version }),
    }),

  /* ── Identity ─────────────────────────────────────────────────── */
  stepUp: (method: 'otp' | 'sso' = 'otp') =>
    call<{ mfa_token: string; expires_at_utc: string }>('/ecign/identity/step-up', {
      method: 'POST',
      body: JSON.stringify({ method }),
    }),

  me: () => call<{ user_id: string; name: string; role: string; tier: number }>('/ecign/identity/me'),

  /* ── Form instances ──────────────────────────────────────────── */
  createInstance: (body: {
    form_id: string;
    document_version_id: string;
    required_signers: RequiredSignerPayload[];
    form_instance_id?: string;
    workflow_instance_id?: string;
    event_id?: string;
  }, mfaToken?: string) =>
    call<{ instance_id: string; state: string }>('/ecign/instances', {
      method: 'POST',
      body: JSON.stringify(body),
    }, mfaToken),

  getInstance: (id: string) => call<Record<string, unknown>>(`/ecign/instances/${id}`),

  patchFields: (id: string, field_values: Record<string, unknown>) =>
    call(`/ecign/instances/${id}/fields`, {
      method: 'PATCH',
      body: JSON.stringify({ field_values }),
    }),

  disclose:   (id: string) => call(`/ecign/instances/${id}/disclose`,    { method: 'POST' }),
  verify:     (id: string, mfaToken?: string) => call(`/ecign/instances/${id}/verify`, { method: 'POST' }, mfaToken),
  reviewAck:  (id: string) => call(`/ecign/instances/${id}/review-ack`,  { method: 'POST' }),

  applySignature: (id: string, body: {
    field_id: string;
    signature_png_b64: string;
    attestation_text_hash: string;
    geo?: NetworkGeoEvidence;
    device?: DeviceEvidence;
  }, mfaToken?: string) =>
    call<{ signature_id: string; state: string }>(`/ecign/instances/${id}/signatures`, {
      method: 'POST',
      body: JSON.stringify(body),
    }, mfaToken),

  lock: (id: string, mfaToken?: string) =>
    call<{ document_hash: string; manifest_hash: string; locked_at_utc: string }>(`/ecign/instances/${id}/lock`, {
      method: 'POST',
    }, mfaToken),

  registerArtifacts: (id: string, body: {
    signed_package_artifact_id?: string;
    certificate_artifact_id?: string;
  }) =>
    call<Record<string, unknown>>(`/ecign/instances/${id}/artifacts`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  requestSecondSignature: (id: string, assigned_to: string, due_date?: string, assignedUser?: {
    role: string;
    tier: number;
    authorityDomains: string[];
  }) =>
    call<{ task_id: string }>(`/ecign/instances/${id}/second-signature`, {
      method: 'POST',
      body: JSON.stringify({ assigned_to, due_date, assigned_user: assignedUser }),
    }),

  voidInstance: (id: string, reason: string) =>
    call(`/ecign/instances/${id}/void`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  registerVersion: (body: {
    version_id: string;
    form_id: string;
    semver: string;
    template_snapshot: string;
    effective_at_utc: string;
  }) =>
    call('/ecign/versions', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /* ── Audit & compliance ──────────────────────────────────────── */
  getAuditEvents: (subject_id?: string) =>
    call<Array<Record<string, unknown>>>(
      `/audit/events${subject_id ? `?subject_id=${encodeURIComponent(subject_id)}` : ''}`,
    ),

  verifyChain: (subject_id?: string) =>
    call<{ ok: boolean; first_break?: string; verified: number }>(
      `/audit/verify-chain${subject_id ? `?subject_id=${encodeURIComponent(subject_id)}` : ''}`,
      { method: 'POST' },
    ),

  getComplianceObject: (kind: string, id: string) =>
    call<{ state: string; history: Array<Record<string, unknown>> }>(
      `/compliance/objects/${kind}/${id}`,
    ),

  getBlockedCompliance: () => call<{ blocked: Array<Record<string, unknown>> }>('/compliance/blocked'),
};

/* ── Standard attestation text used everywhere ─────────────────── */
export const ATTESTATION_TEXT =
  'I agree to use an electronic signature, I have reviewed this document in full, and I intend to sign it.';

/** SHA-256 in browser → hex string. */
export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Forms whose signature requires MFA step-up. */
export const HIGH_IMPACT_FORMS = new Set(['EN-FM-485', 'EN-FM-033']);
