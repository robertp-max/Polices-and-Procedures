import { getEcignSignerIdentity } from './signerIdentity';

export type DemoBackendState =
  | 'created'
  | 'disclosed'
  | 'verified'
  | 'reviewed'
  | 'attested'
  | 'signed_locked'
  | 'voided'
  | 'expired';

export interface DemoInstanceRecord {
  instance_id: string;
  form_id: string;
  document_version_id: string;
  state: DemoBackendState;
  required_signers: Array<{ role: string; tier: number; user_id?: string; field_id: string }>;
  workflow_instance_id?: string;
  event_id?: string;
  created_at_utc: string;
  review_acknowledged_at?: string;
  attestation_confirmed_at?: string;
  mfa_verified_at?: string;
  consent_id?: string;
  document_hash?: string;
  manifest_hash?: string;
  locked_at_utc?: string;
  certificate_artifact_id?: string;
  signed_package_artifact_id?: string;
}

interface DemoSignatureRecord {
  signature_id: string;
  instance_id: string;
  field_id: string;
  signature_hash: string;
  signed_at_utc: string;
}

interface DemoConsentRecord {
  consent_id: string;
  disclosure_version: string;
  accepted_at_utc: string;
  user_id: string;
}

interface DemoAuditEvent {
  event_id: string;
  occurred_at_utc: string;
  action: string;
  actor: {
    user_id: string;
    name: string;
    role: string;
    email: string;
    auth_method: string;
    mfa_verified_at?: string;
  };
  subject: {
    kind: string;
    id: string;
    document_hash?: string;
  };
  payload?: Record<string, unknown>;
}

interface DemoLocalState {
  instances: Record<string, DemoInstanceRecord>;
  signaturesByInstanceId: Record<string, DemoSignatureRecord[]>;
  consentsByUserId: Record<string, DemoConsentRecord[]>;
  auditByInstanceId: Record<string, DemoAuditEvent[]>;
}

const STORAGE_KEY = 'ci_ecign_demo_local_v1';
const DISCLOSURE_VERSION = 'DEMO-2026.05';
const DISCLOSURE_TEXT = 'I consent to use electronic signatures for this document.';

function nowIso(): string {
  return new Date().toISOString();
}

function randomId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function hashLike(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return `h-${Math.abs(hash).toString(16)}`;
}

function readState(): DemoLocalState {
  if (typeof window === 'undefined') {
    return { instances: {}, signaturesByInstanceId: {}, consentsByUserId: {}, auditByInstanceId: {} };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { instances: {}, signaturesByInstanceId: {}, consentsByUserId: {}, auditByInstanceId: {} };
    const parsed = JSON.parse(raw) as DemoLocalState;
    return {
      instances: parsed.instances ?? {},
      signaturesByInstanceId: parsed.signaturesByInstanceId ?? {},
      consentsByUserId: parsed.consentsByUserId ?? {},
      auditByInstanceId: parsed.auditByInstanceId ?? {},
    };
  } catch {
    return { instances: {}, signaturesByInstanceId: {}, consentsByUserId: {}, auditByInstanceId: {} };
  }
}

function writeState(state: DemoLocalState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function appendAudit(state: DemoLocalState, instanceId: string, action: string, payload?: Record<string, unknown>): void {
  const signer = getEcignSignerIdentity();
  const event: DemoAuditEvent = {
    event_id: randomId('AUD'),
    occurred_at_utc: nowIso(),
    action,
    actor: {
      user_id: signer.id,
      name: signer.name,
      role: signer.role,
      email: signer.email,
      auth_method: 'session',
    },
    subject: { kind: 'form_instance', id: instanceId },
    payload,
  };
  state.auditByInstanceId[instanceId] = [event, ...(state.auditByInstanceId[instanceId] ?? [])];
}

function getRequiredInstance(state: DemoLocalState, instanceId: string): DemoInstanceRecord {
  const row = state.instances[instanceId];
  if (!row) {
    throw new Error('Demo eCIgn instance not found.');
  }
  return row;
}

export const demoLocalEcignApi = {
  getCurrentDisclosure: async () => ({
    disclosure_version: DISCLOSURE_VERSION,
    text: DISCLOSURE_TEXT,
    text_hash: hashLike(DISCLOSURE_TEXT),
  }),

  getNetworkInfo: async () => ({
    ip: '127.0.0.1',
    city: 'Localhost',
    region: 'Localhost',
    country: 'Local',
    postal: '00000',
    org: 'DEMO_LOCAL',
    source: 'demo_local',
    capturedAt: nowIso(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'demo-local',
    lookupStatus: 'private_or_local_ip',
    failureReason: 'demo_local',
  }),

  recordConsent: async (disclosure_version: string) => {
    const signer = getEcignSignerIdentity();
    const state = readState();
    const row: DemoConsentRecord = {
      consent_id: randomId('CNS'),
      disclosure_version,
      accepted_at_utc: nowIso(),
      user_id: signer.id,
    };
    state.consentsByUserId[signer.id] = [row, ...(state.consentsByUserId[signer.id] ?? [])];
    writeState(state);
    return { consent_id: row.consent_id };
  },

  stepUp: async () => ({
    mfa_token: randomId('MFA'),
    expires_at_utc: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  }),

  me: async () => {
    const signer = getEcignSignerIdentity();
    return { user_id: signer.id, name: signer.name, role: signer.role, tier: signer.tier };
  },

  createInstance: async (body: {
    form_id: string;
    document_version_id: string;
    required_signers: Array<{ role: string; tier: number; user_id?: string; field_id: string }>;
    workflow_instance_id?: string;
    event_id?: string;
  }) => {
    const state = readState();
    const row: DemoInstanceRecord = {
      instance_id: randomId('FI'),
      form_id: body.form_id,
      document_version_id: body.document_version_id,
      required_signers: body.required_signers ?? [],
      workflow_instance_id: body.workflow_instance_id,
      event_id: body.event_id,
      state: 'created',
      created_at_utc: nowIso(),
    };
    state.instances[row.instance_id] = row;
    appendAudit(state, row.instance_id, 'SIGNATURE_SESSION_CREATED', {
      form_id: body.form_id,
      document_version_id: body.document_version_id,
    });
    writeState(state);
    const reloaded = readState().instances[row.instance_id];
    if (!reloaded) {
      throw new Error('Demo-local create failed persistence verification.');
    }
    return { instance_id: row.instance_id, state: row.state };
  },

  getInstance: async (instanceId: string) => {
    const row = getRequiredInstance(readState(), instanceId);
    return row;
  },

  patchFields: async (_instanceId: string, _field_values: Record<string, unknown>) => {
    return { ok: true };
  },

  disclose: async (instanceId: string) => {
    const signer = getEcignSignerIdentity();
    const state = readState();
    const row = getRequiredInstance(state, instanceId);
    const consent = (state.consentsByUserId[signer.id] ?? [])[0];
    if (!consent) throw new Error('Consent is required before disclose.');
    row.consent_id = consent.consent_id;
    row.state = 'disclosed';
    appendAudit(state, instanceId, 'CONSENT_ACCEPTED', { consent_id: consent.consent_id });
    writeState(state);
    return row;
  },

  verify: async (instanceId: string) => {
    const state = readState();
    const row = getRequiredInstance(state, instanceId);
    row.state = 'verified';
    row.mfa_verified_at = nowIso();
    appendAudit(state, instanceId, 'IDENTITY_CONFIRMED');
    writeState(state);
    return row;
  },

  reviewAck: async (instanceId: string) => {
    const state = readState();
    const row = getRequiredInstance(state, instanceId);
    row.state = 'reviewed';
    row.review_acknowledged_at = nowIso();
    appendAudit(state, instanceId, 'DOCUMENT_REVIEWED');
    writeState(state);
    return row;
  },

  applySignature: async (instanceId: string, body: {
    field_id: string;
    signature_png_b64: string;
    attestation_text_hash: string;
  }) => {
    const state = readState();
    const row = getRequiredInstance(state, instanceId);
    const sig: DemoSignatureRecord = {
      signature_id: randomId('SIG'),
      instance_id: instanceId,
      field_id: body.field_id,
      signature_hash: hashLike(body.signature_png_b64),
      signed_at_utc: nowIso(),
    };
    state.signaturesByInstanceId[instanceId] = [sig, ...(state.signaturesByInstanceId[instanceId] ?? [])];
    row.state = 'attested';
    row.attestation_confirmed_at = nowIso();
    appendAudit(state, instanceId, 'SIGNATURE_APPLIED', { signature_id: sig.signature_id });
    appendAudit(state, instanceId, 'ATTESTATION_ACCEPTED', { attestation_text_hash: body.attestation_text_hash });
    writeState(state);
    return { signature_id: sig.signature_id, state: row.state };
  },

  lock: async (instanceId: string) => {
    const state = readState();
    const row = getRequiredInstance(state, instanceId);
    const signatures = state.signaturesByInstanceId[instanceId] ?? [];
    if (signatures.length === 0) throw new Error('Cannot finalize without a signature.');
    const signatureHash = signatures[0]?.signature_hash ?? '';
    const document_hash = hashLike(`${instanceId}|${row.document_version_id}|${signatureHash}`);
    const manifest_hash = hashLike(`${document_hash}|${signatures.length}`);
    row.state = 'signed_locked';
    row.document_hash = document_hash;
    row.manifest_hash = manifest_hash;
    row.locked_at_utc = nowIso();
    row.certificate_artifact_id = `CERT-${instanceId}`;
    row.signed_package_artifact_id = `PKG-${instanceId}`;
    appendAudit(state, instanceId, 'SIGNATURE_FINALIZED', {
      document_hash,
      manifest_hash,
      signed_package_artifact_id: row.signed_package_artifact_id,
    });
    appendAudit(state, instanceId, 'CERTIFICATE_CREATED', {
      certificate_artifact_id: row.certificate_artifact_id,
    });
    writeState(state);
    return {
      document_hash,
      manifest_hash,
      locked_at_utc: row.locked_at_utc,
      certificate_artifact_id: row.certificate_artifact_id,
      signed_package_artifact_id: row.signed_package_artifact_id,
    };
  },

  registerArtifacts: async (instanceId: string, body: {
    signed_package_artifact_id?: string;
    certificate_artifact_id?: string;
  }) => {
    const state = readState();
    const row = getRequiredInstance(state, instanceId);
    if (body.signed_package_artifact_id) {
      row.signed_package_artifact_id = body.signed_package_artifact_id;
    }
    if (body.certificate_artifact_id) {
      row.certificate_artifact_id = body.certificate_artifact_id;
    }
    appendAudit(state, instanceId, 'ARTIFACT_REGISTERED', {
      signed_package_artifact_id: row.signed_package_artifact_id,
      certificate_artifact_id: row.certificate_artifact_id,
    });
    writeState(state);
    return row;
  },

  requestSecondSignature: async (_instanceId: string, assigned_to: string) => ({
    task_id: `TASK-${assigned_to}-${Date.now().toString(36)}`,
  }),

  voidInstance: async (instanceId: string) => {
    const state = readState();
    const row = getRequiredInstance(state, instanceId);
    row.state = 'voided';
    writeState(state);
    return row;
  },

  getAuditEvents: async (subject_id?: string) => {
    if (!subject_id) {
      return Object.values(readState().auditByInstanceId).flat();
    }
    return readState().auditByInstanceId[subject_id] ?? [];
  },

  verifyChain: async (subject_id?: string) => ({
    ok: true,
    verified: (subject_id ? (readState().auditByInstanceId[subject_id] ?? []).length : 0),
  }),

  getComplianceObject: async (_kind: string, _id: string) => ({
    state: 'ok',
    history: [],
  }),

  getBlockedCompliance: async () => ({ blocked: [] }),
};

/**
 * Remove all eCIgn instances (and their signatures/audit) whose event_id
 * is in the given set **or** whose event_id is missing (orphaned instances
 * created before the eventId pass-through was added).
 * Also removes ALL `ecign:instance:*` localStorage pointers so the next
 * form visit bootstraps a fresh signing session.
 */
export function clearDemoEcignForEvents(eventIds: Set<string>): void {
  if (typeof window === 'undefined') return;
  const state = readState();
  const instanceIdsToRemove = new Set<string>();
  for (const [id, inst] of Object.entries(state.instances)) {
    const matches = !inst.event_id || eventIds.has(inst.event_id);
    if (matches) {
      instanceIdsToRemove.add(id);
      delete state.instances[id];
    }
  }
  for (const id of instanceIdsToRemove) {
    delete state.signaturesByInstanceId[id];
    delete state.auditByInstanceId[id];
  }
  if (instanceIdsToRemove.size > 0) {
    delete (state as unknown as Record<string, unknown>).consentsByUserId;
    (state as unknown as Record<string, unknown>).consentsByUserId = {};
  }
  writeState(state);

  // Purge ALL `ecign:instance:*` localStorage pointers so the next form
  // visit bootstraps a fresh signing session instead of recovering a
  // stale (now deleted) instance.
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('ecign:instance:')) keysToRemove.push(key);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

/** Nuke the entire eCIgn demo local state. */
export function clearAllDemoEcign(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('ecign:instance:')) keysToRemove.push(key);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}
