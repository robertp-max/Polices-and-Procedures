/**
 * Typed client for /api/ecign/*, /api/audit/*, /api/compliance/*.
 * Single source of truth for fetch calls and auth headers from the
 * frontend. All state-changing calls run through here so audit trail
 * is created on EVERY action.
 */
import { buildEcignAuthHeaders } from './signerIdentity';
import { demoLocalEcignApi } from './demoLocalApi';

const BASE = '/api';
type EcignMode = 'DEMO_LOCAL' | 'BACKEND_LIVE';

const ENV = (import.meta as unknown as { env?: Record<string, string | boolean> }).env ?? {};
const REQUESTED_MODE: EcignMode = String(ENV.VITE_ECIGN_MODE ?? 'DEMO_LOCAL').toUpperCase() === 'BACKEND_LIVE'
  ? 'BACKEND_LIVE'
  : 'DEMO_LOCAL';
const ALLOW_LIVE_FALLBACK = String(ENV.VITE_ECIGN_ALLOW_LIVE_FALLBACK ?? '').toLowerCase() === 'true';

let resolvedMode: EcignMode = REQUESTED_MODE;

function isDev(): boolean {
  return Boolean(ENV.DEV);
}

function warnDev(message: string, details?: unknown): void {
  if (!isDev()) return;
  // eslint-disable-next-line no-console
  console.warn(`[ecign] ${message}`, details ?? '');
}

function errorDev(message: string, details?: unknown): void {
  if (!isDev()) return;
  // eslint-disable-next-line no-console
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
    `eCIgn backend is unavailable in BACKEND_LIVE mode for ${path}.`,
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
  if (resolvedMode === 'DEMO_LOCAL') {
    return callDemoLocal<T>(path, init);
  }
  const headers = authHeaders(mfaToken ? { 'X-MFA-Token': mfaToken } : undefined);
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers: { ...headers, ...(init?.headers ?? {}) } });
  } catch (error) {
    if (REQUESTED_MODE === 'BACKEND_LIVE' && ALLOW_LIVE_FALLBACK) {
      warnDev(`BACKEND_LIVE unavailable; falling back to DEMO_LOCAL for ${path}.`, error);
      resolvedMode = 'DEMO_LOCAL';
      return callDemoLocal<T>(path, init);
    }
    throw normalizeUnavailableError(path);
  }
  const text = await res.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (res.status >= 500) {
    if (REQUESTED_MODE === 'BACKEND_LIVE' && ALLOW_LIVE_FALLBACK) {
      warnDev(`BACKEND_LIVE returned ${res.status}; falling back to DEMO_LOCAL for ${path}.`, body);
      resolvedMode = 'DEMO_LOCAL';
      return callDemoLocal<T>(path, init);
    }
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

function parseBody(init?: RequestInit): Record<string, unknown> {
  if (!init?.body) return {};
  if (typeof init.body === 'string') {
    try { return JSON.parse(init.body) as Record<string, unknown>; } catch { return {}; }
  }
  return {};
}

function assertShape(ok: boolean, label: string, body: unknown): void {
  if (!ok) {
    warnDev(`API contract validation failed for ${label}.`, body);
    throw new EcignApiError(422, 'ECIGN_CONTRACT_INVALID', `Invalid ${label} contract.`, body);
  }
}

async function callDemoLocal<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const body = parseBody(init);
  if (path === '/ecign/disclosures/current' && method === 'GET') {
    return await demoLocalEcignApi.getCurrentDisclosure() as T;
  }
  if (path === '/ecign/network-info' && method === 'GET') {
    return await demoLocalEcignApi.getNetworkInfo() as T;
  }
  if (path === '/ecign/consents' && method === 'POST') {
    assertShape(typeof body.disclosure_version === 'string', 'consent request', body);
    return await demoLocalEcignApi.recordConsent(body.disclosure_version as string) as T;
  }
  if (path === '/ecign/identity/step-up' && method === 'POST') {
    return await demoLocalEcignApi.stepUp() as T;
  }
  if (path === '/ecign/identity/me' && method === 'GET') {
    return await demoLocalEcignApi.me() as T;
  }
  if (path === '/ecign/instances' && method === 'POST') {
    assertShape(
      typeof body.form_id === 'string'
      && typeof body.document_version_id === 'string'
      && Array.isArray(body.required_signers),
      'create session request',
      body,
    );
    const created = await demoLocalEcignApi.createInstance({
      form_id: body.form_id as string,
      document_version_id: body.document_version_id as string,
      required_signers: body.required_signers as Array<{ role: string; tier: number; user_id?: string; field_id: string }>,
      workflow_instance_id: typeof body.workflow_instance_id === 'string' ? body.workflow_instance_id : undefined,
      event_id: typeof body.event_id === 'string' ? body.event_id : undefined,
    });
    assertShape(typeof created.instance_id === 'string' && typeof created.state === 'string', 'create session response', created);
    return created as T;
  }
  if (path === '/ecign/instances' && method === 'GET') {
    return [] as T;
  }
  const matchId = path.match(/^\/ecign\/instances\/([^/]+)$/);
  if (matchId && method === 'GET') {
    const instance = await demoLocalEcignApi.getInstance(matchId[1]);
    assertShape(typeof instance.instance_id === 'string' && typeof instance.state === 'string', 'load session response', instance);
    return instance as T;
  }
  const matchPatch = path.match(/^\/ecign\/instances\/([^/]+)\/fields$/);
  if (matchPatch && method === 'PATCH') {
    return await demoLocalEcignApi.patchFields(matchPatch[1], (body.field_values ?? {}) as Record<string, unknown>) as T;
  }
  const matchDisclose = path.match(/^\/ecign\/instances\/([^/]+)\/disclose$/);
  if (matchDisclose && method === 'POST') return await demoLocalEcignApi.disclose(matchDisclose[1]) as T;
  const matchVerify = path.match(/^\/ecign\/instances\/([^/]+)\/verify$/);
  if (matchVerify && method === 'POST') return await demoLocalEcignApi.verify(matchVerify[1]) as T;
  const matchReview = path.match(/^\/ecign\/instances\/([^/]+)\/review-ack$/);
  if (matchReview && method === 'POST') return await demoLocalEcignApi.reviewAck(matchReview[1]) as T;
  const matchSign = path.match(/^\/ecign\/instances\/([^/]+)\/signatures$/);
  if (matchSign && method === 'POST') {
    assertShape(
      typeof body.field_id === 'string'
      && typeof body.signature_png_b64 === 'string'
      && typeof body.attestation_text_hash === 'string',
      'apply signature request',
      body,
    );
    return await demoLocalEcignApi.applySignature(matchSign[1], {
      field_id: body.field_id as string,
      signature_png_b64: body.signature_png_b64 as string,
      attestation_text_hash: body.attestation_text_hash as string,
    }) as T;
  }
  const matchLock = path.match(/^\/ecign\/instances\/([^/]+)\/lock$/);
  if (matchLock && method === 'POST') {
    const lock = await demoLocalEcignApi.lock(matchLock[1]);
    assertShape(
      typeof lock.document_hash === 'string'
      && typeof lock.manifest_hash === 'string'
      && typeof lock.locked_at_utc === 'string',
      'finalize session response',
      lock,
    );
    return lock as T;
  }
  const matchArtifacts = path.match(/^\/ecign\/instances\/([^/]+)\/artifacts$/);
  if (matchArtifacts && method === 'PATCH') {
    return await demoLocalEcignApi.registerArtifacts(matchArtifacts[1], {
      signed_package_artifact_id: typeof body.signed_package_artifact_id === 'string' ? body.signed_package_artifact_id : undefined,
      certificate_artifact_id: typeof body.certificate_artifact_id === 'string' ? body.certificate_artifact_id : undefined,
    }) as T;
  }
  const matchSecond = path.match(/^\/ecign\/instances\/([^/]+)\/second-signature$/);
  if (matchSecond && method === 'POST') {
    assertShape(typeof body.assigned_to === 'string', 'second signature request', body);
    return await demoLocalEcignApi.requestSecondSignature(matchSecond[1], body.assigned_to as string) as T;
  }
  const matchVoid = path.match(/^\/ecign\/instances\/([^/]+)\/void$/);
  if (matchVoid && method === 'POST') return await demoLocalEcignApi.voidInstance(matchVoid[1]) as T;
  if (path.startsWith('/audit/events') && method === 'GET') {
    const subject = path.includes('?subject_id=') ? decodeURIComponent(path.split('?subject_id=')[1] ?? '') : undefined;
    return await demoLocalEcignApi.getAuditEvents(subject) as T;
  }
  if (path.startsWith('/audit/verify-chain') && method === 'POST') {
    const subject = path.includes('?subject_id=') ? decodeURIComponent(path.split('?subject_id=')[1] ?? '') : undefined;
    return await demoLocalEcignApi.verifyChain(subject) as T;
  }
  const matchCompliance = path.match(/^\/compliance\/objects\/([^/]+)\/([^/]+)$/);
  if (matchCompliance && method === 'GET') {
    return await demoLocalEcignApi.getComplianceObject(matchCompliance[1], matchCompliance[2]) as T;
  }
  if (path === '/compliance/blocked' && method === 'GET') {
    return await demoLocalEcignApi.getBlockedCompliance() as T;
  }
  if (path === '/ecign/versions' && method === 'POST') {
    return body as T;
  }
  throw new EcignApiError(404, 'ECIGN_ROUTE_MISSING', `No DEMO_LOCAL handler for ${method} ${path}.`, { path, method });
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
