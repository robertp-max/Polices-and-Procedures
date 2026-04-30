/**
 * Typed client for /api/ecign/*, /api/audit/*, /api/compliance/*.
 * Single source of truth for fetch calls and auth headers from the
 * frontend. All state-changing calls run through here so audit trail
 * is created on EVERY action.
 */
import { buildEcignAuthHeaders } from './signerIdentity';

const BASE = '/api';

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
  const headers = authHeaders(mfaToken ? { 'X-MFA-Token': mfaToken } : undefined);
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...headers, ...(init?.headers ?? {}) } });
  const text = await res.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
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
    required_signers: Array<{ role: string; tier: number; user_id?: string; field_id: string }>;
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
  verify:     (id: string) => call(`/ecign/instances/${id}/verify`,      { method: 'POST' }),
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

  requestSecondSignature: (id: string, assigned_to: string, due_date?: string) =>
    call<{ task_id: string }>(`/ecign/instances/${id}/second-signature`, {
      method: 'POST',
      body: JSON.stringify({ assigned_to, due_date }),
    }),

  voidInstance: (id: string, reason: string) =>
    call(`/ecign/instances/${id}/void`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
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
