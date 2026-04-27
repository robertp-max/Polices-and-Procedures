/**
 * /api/ecign/* — disclosure & consent, identity step-up, instances, signatures,
 * lock, second-signature, void, outputs.
 *
 * All guardrails (G1–G8 in 05-Failure-Prevention.md) are enforced here.
 */
import { Router, type Request, type Response, type NextFunction } from 'express';
import { ApiError } from '../errors.js';
import { store, EcignError, type FormInstanceRow, type SignatureRow,
  type ConsentRow, type RequiredSigner } from '../ecign/store.js';
import { appendAudit, sha256, ulid, assert } from '../ecign/hashChain.js';
import { assertTransition } from '../ecign/stateMachine.js';
import { canonicalBytes } from '../ecign/integrity.js';
import { evaluateOnLock } from '../ecign/compliance.js';
import { buildSignedDocumentBundle } from '../ecign/pdf.js';
import { CURRENT_DISCLOSURE_VERSION, DISCLOSURE_TEXT, DISCLOSURE_TEXT_HASH } from '../ecign/disclosures.js';
import {
  resolveNetworkLocationMetadata,
  resolveRequestNetworkContext,
} from '../ecign/networkMetadata.js';

export const ecignRouter: Router = Router();

// ── Demo session middleware ────────────────────────────────────────────────
// In production replace with real auth. Fail-closed: requires X-User header.
interface SessionUser { user_id: string; name: string; role: string; email: string; tier: number }
declare module 'express-serve-static-core' {
  interface Request { user?: SessionUser; mfaToken?: string }
}

ecignRouter.use((req, _res, next) => {
  const uid = req.header('x-user-id');
  if (!uid) return next(new ApiError('auth_error', 'NOT_AUTHENTICATED', 401));
  req.user = {
    user_id: uid,
    name:    req.header('x-user-name')  ?? uid,
    role:    req.header('x-user-role')  ?? 'unknown',
    email:   req.header('x-user-email') ?? `${uid}@careindeed.com`,
    tier:    Number(req.header('x-user-tier') ?? 4),
  };
  req.mfaToken = req.header('x-mfa-token') ?? undefined;
  next();
});

const HIGH_IMPACT_FORMS = new Set(['EN-FM-485', 'EN-FM-033']); // POC, mandatory events
function requireStepUp(formId: string, mfa?: string) {
  if (HIGH_IMPACT_FORMS.has(formId) && !mfa) {
    throw new EcignError('STEP_UP_REQUIRED', 'MFA step-up required for this form.', 403);
  }
}

function asyncH(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

function networkOf(req: Request) {
  return resolveRequestNetworkContext(req);
}

function toNetworkInfoResponse(networkLocation: {
  ip_address: string;
  city: string;
  state_region: string;
  country: string;
  postal: string;
  org_isp: string;
  source: string;
  captured_at: string;
  user_agent: string;
  lookup_status: string;
  failure_reason?: string;
}) {
  return {
    ip: networkLocation.ip_address,
    city: networkLocation.city,
    region: networkLocation.state_region,
    country: networkLocation.country,
    postal: networkLocation.postal,
    org: networkLocation.org_isp,
    source: networkLocation.source,
    capturedAt: networkLocation.captured_at,
    userAgent: networkLocation.user_agent,
    lookupStatus: networkLocation.lookup_status,
    failureReason: networkLocation.failure_reason || undefined,
  };
}

function actorOf(req: Request, method: 'session'|'otp'|'sso' = 'session') {
  const u = req.user!;
  return { user_id: u.user_id, name: u.name, role: u.role, email: u.email,
    auth_method: method, mfa_verified_at: req.mfaToken ? new Date().toISOString() : undefined };
}

// ── Disclosures & consent ──────────────────────────────────────────────────
ecignRouter.get('/disclosures/current', (_req, res) => {
  res.json({ disclosure_version: CURRENT_DISCLOSURE_VERSION,
    text: DISCLOSURE_TEXT.replace('__DISCLOSURE_VERSION__', CURRENT_DISCLOSURE_VERSION),
    text_hash: DISCLOSURE_TEXT_HASH });
});

ecignRouter.post('/consents', asyncH(async (req, res) => {
  const { disclosure_version } = req.body ?? {};
  assert(disclosure_version === CURRENT_DISCLOSURE_VERSION,
    'DISCLOSURE_VERSION_MISMATCH', 'Disclosure version stale.', 409);
  const net = networkOf(req);
  const row: ConsentRow = {
    consent_id: ulid(), user_id: req.user!.user_id,
    disclosure_version, disclosure_text_hash: DISCLOSURE_TEXT_HASH,
    accepted_at_utc: new Date().toISOString(),
    ip: net.ip, user_agent: net.user_agent,
  };
  await store.insertConsent(row);
  await appendAudit({ actor: actorOf(req), network: net,
    subject: { kind: 'consent', id: row.consent_id },
    action: 'consent.accepted',
    payload: { disclosure_version, disclosure_text_hash: DISCLOSURE_TEXT_HASH } });
  res.json(row);
}));

// ── Identity step-up (mock OTP; production wires SMS/email/SSO) ────────────
ecignRouter.post('/identity/step-up', asyncH(async (req, res) => {
  const token = ulid();
  await appendAudit({ actor: actorOf(req, 'otp'), network: networkOf(req),
    subject: { kind: 'session', id: req.user!.user_id },
    action: 'identity.verified', payload: { method: req.body?.method ?? 'otp', token } });
  res.json({ mfa_token: token, expires_at: new Date(Date.now() + 600_000).toISOString() });
}));

ecignRouter.get('/identity/me', (req, res) => res.json(req.user));

ecignRouter.get('/network-info', async (req, res) => {
  const context = resolveRequestNetworkContext(req);
  try {
    const networkLocation = await resolveNetworkLocationMetadata(req);
    return res.json(toNetworkInfoResponse(networkLocation));
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[ecign.network] endpoint_fallback', {
        ip: context.ip || 'Unavailable',
        source: context.source,
        failure_reason: error instanceof Error ? error.message : 'network_info_endpoint_error',
      });
    }
    return res.json({
      ip: context.ip || 'Unavailable',
      city: 'Unavailable',
      region: 'Unavailable',
      country: 'Unavailable',
      postal: 'Unavailable',
      org: 'Unavailable',
      source: context.source || 'request_context',
      capturedAt: new Date().toISOString(),
      userAgent: context.user_agent || 'Unavailable',
      lookupStatus: 'lookup_failed',
      failureReason: 'network_info_endpoint_error',
    });
  }
});

// ── Form instances ─────────────────────────────────────────────────────────
ecignRouter.post('/instances', asyncH(async (req, res) => {
  const { form_id, document_version_id, required_signers, workflow_instance_id, event_id } = req.body ?? {};
  assert(form_id && document_version_id, 'VALIDATION', 'form_id + document_version_id required', 400);
  const row: FormInstanceRow = {
    instance_id: ulid(),
    form_id, document_version_id,
    state: 'created',
    required_signers: (required_signers as RequiredSigner[]) ?? [],
    field_values: {},
    workflow_instance_id, event_id,
    created_at_utc: new Date().toISOString(),
  };
  await store.insertInstance(row);
  await appendAudit({ actor: actorOf(req), network: networkOf(req),
    subject: { kind: 'form_instance', id: row.instance_id, document_version_id },
    action: 'document.opened', payload: { form_id } });
  res.json(row);
}));

ecignRouter.get('/instances/:id', asyncH(async (req, res) => {
  const i = await store.getInstance(req.params.id);
  if (!i) throw new EcignError('NOT_FOUND', 'Instance not found', 404);
  res.json(i);
}));

ecignRouter.get('/instances', asyncH(async (_req, res) => {
  res.json(await store.listInstances());
}));

ecignRouter.patch('/instances/:id/fields', asyncH(async (req, res) => {
  const cur = await store.getInstance(req.params.id);
  if (!cur) throw new EcignError('NOT_FOUND', 'Instance not found', 404);
  if (cur.state === 'signed_locked') {
    await appendAudit({ actor: actorOf(req), network: networkOf(req),
      subject: { kind: 'form_instance', id: cur.instance_id },
      action: 'access.denied', payload: { reason: 'DOCUMENT_LOCKED', attempted: req.body } });
    throw new EcignError('DOCUMENT_LOCKED', 'Form instance is signed_locked.', 409);
  }
  const updates: Record<string, string> = req.body?.field_values ?? {};
  const merged = { ...cur.field_values, ...updates };
  const next = await store.updateInstance(cur.instance_id, { field_values: merged });
  for (const [k, v] of Object.entries(updates)) {
    await appendAudit({ actor: actorOf(req), network: networkOf(req),
      subject: { kind: 'form_instance', id: cur.instance_id },
      action: 'field.edited',
      payload: { field: k, old: cur.field_values[k] ?? '', new: v } });
  }
  res.json(next);
}));

ecignRouter.post('/instances/:id/disclose', asyncH(async (req, res) => {
  const cur = await store.getInstance(req.params.id);
  if (!cur) throw new EcignError('NOT_FOUND', 'Instance not found', 404);
  // Require an existing consent row for current disclosure version (G1).
  const consents = await store.listConsents(req.user!.user_id);
  const has = consents.some(c => c.disclosure_version === CURRENT_DISCLOSURE_VERSION);
  assert(has, 'CONSENT_REQUIRED', 'Accept current disclosure first.', 409);
  assertTransition(cur.state, 'disclosed');
  const next = await store.updateInstance(cur.instance_id,
    { state: 'disclosed', consent_id: consents[consents.length - 1].consent_id });
  res.json(next);
}));

ecignRouter.post('/instances/:id/verify', asyncH(async (req, res) => {
  const cur = await store.getInstance(req.params.id);
  if (!cur) throw new EcignError('NOT_FOUND', 'Instance not found', 404);
  requireStepUp(cur.form_id, req.mfaToken);
  assertTransition(cur.state, 'verified');
  const next = await store.updateInstance(cur.instance_id,
    { state: 'verified', mfa_verified_at: req.mfaToken ? new Date().toISOString() : undefined });
  res.json(next);
}));

ecignRouter.post('/instances/:id/review-ack', asyncH(async (req, res) => {
  const cur = await store.getInstance(req.params.id);
  if (!cur) throw new EcignError('NOT_FOUND', 'Instance not found', 404);
  assertTransition(cur.state, 'reviewed');
  const ts = new Date().toISOString();
  const next = await store.updateInstance(cur.instance_id,
    { state: 'reviewed', review_acknowledged_at: ts });
  await appendAudit({ actor: actorOf(req), network: networkOf(req),
    subject: { kind: 'form_instance', id: cur.instance_id },
    action: 'document.reviewed', payload: { acknowledged_at: ts } });
  res.json(next);
}));

// ── Signature application ──────────────────────────────────────────────────
ecignRouter.post('/instances/:id/signatures', asyncH(async (req, res) => {
  const cur = await store.getInstance(req.params.id);
  if (!cur) throw new EcignError('NOT_FOUND', 'Instance not found', 404);
  // G1: consent
  const consents = await store.listConsents(req.user!.user_id);
  assert(consents.some(c => c.disclosure_version === CURRENT_DISCLOSURE_VERSION),
    'CONSENT_REQUIRED', 'Consent missing for current disclosure version.', 409);
  // G2: high-impact step-up
  requireStepUp(cur.form_id, req.mfaToken);
  // G7: out-of-order
  assert(cur.state === 'reviewed' || cur.state === 'attested',
    'INVALID_STATE_TRANSITION',
    `Cannot sign in state ${cur.state}. Must be reviewed/attested.`, 409);

  const {
    field_id,
    signature_png_b64,
    attestation_text_hash,
    geo,
    device,
  } = req.body ?? {};
  assert(field_id && signature_png_b64 && attestation_text_hash,
    'VALIDATION', 'field_id, signature_png_b64, attestation_text_hash required', 400);

  const sig: SignatureRow = {
    signature_id: ulid(),
    instance_id: cur.instance_id,
    field_id,
    signer_user_id: req.user!.user_id,
    signer_name: req.user!.name,
    signer_role: req.user!.role,
    signer_email: req.user!.email,
    signed_at_utc: new Date().toISOString(),
    signature_png: signature_png_b64,
    signature_hash: sha256(Buffer.from(signature_png_b64.split(',').pop() ?? '', 'base64')),
    attestation_text_hash,
  };
  const networkLocation = await resolveNetworkLocationMetadata(req);
  sig.network_location = networkLocation;
  await store.insertSignature(sig); // G5: duplicate enforced inside
  const baseNetwork = networkOf(req);
  const enrichedNetwork = {
    ...baseNetwork,
    network_location: networkLocation,
    ...(geo && typeof geo === 'object' ? { geo } : {}),
    ...(device && typeof device === 'object' ? { device } : {}),
  };
  await appendAudit({
    actor: actorOf(req),
    network: enrichedNetwork,
    subject: {
      kind: 'form_instance',
      id: cur.instance_id,
      document_version_id: cur.document_version_id,
    },
    action: 'NETWORK_METADATA_CAPTURED',
    payload: {
      network_location: networkLocation,
      ip: networkLocation.ip_address,
      source: networkLocation.source,
      lookup_status: networkLocation.lookup_status,
      failure_reason: networkLocation.failure_reason,
    },
  });
  await appendAudit({ actor: actorOf(req), network: enrichedNetwork,
    subject: { kind: 'form_instance', id: cur.instance_id,
      document_version_id: cur.document_version_id },
    action: 'signature.applied',
    payload: {
      signature_id: sig.signature_id,
      field_id,
      signature_hash: sig.signature_hash,
      network_location: networkLocation,
      geo,
      device,
    } });
  if (cur.state === 'reviewed') await store.updateInstance(cur.instance_id, { state: 'attested',
    attestation_confirmed_at: new Date().toISOString() });
  res.json(sig);
}));

ecignRouter.post('/instances/:id/lock', asyncH(async (req, res) => {
  const cur = await store.getInstance(req.params.id);
  if (!cur) throw new EcignError('NOT_FOUND', 'Instance not found', 404);
  if (cur.state === 'signed_locked') return res.json(cur);
  assertTransition(cur.state, 'signed_locked');
  // G3: all required signers present
  const sigs = await store.listSignatures(cur.instance_id);
  const signedFields = new Set(sigs.map(s => s.field_id));
  if (cur.required_signers.length && !cur.required_signers.every(r => signedFields.has(r.field_id))) {
    throw new EcignError('SIGNATURES_INCOMPLETE',
      'Required signatures missing.', 409);
  }
  // Compute document hash
  const versions = await store.listVersions();
  const v = versions.find(x => x.version_id === cur.document_version_id);
  if (!v) throw new EcignError('VERSION_NOT_FOUND', 'Document version missing', 500);
  const { hash: docHash } = canonicalBytes(cur, v);
  const audit = await store.listAudit(cur.instance_id);
  const chainHead = audit.length ? audit[audit.length - 1].hash : 'GENESIS';
  const manifestHash = sha256(`${docHash}|${chainHead}`);
  const lockedAt = new Date().toISOString();
  const retention = new Date(Date.now() + 7 * 365 * 24 * 3600_000).toISOString();
  const next = await store.updateInstance(cur.instance_id, {
    state: 'signed_locked', document_hash: docHash,
    manifest_hash: manifestHash, locked_at_utc: lockedAt,
    retention_until_utc: retention,
  });
  await appendAudit({ actor: actorOf(req), network: networkOf(req),
    subject: { kind: 'form_instance', id: cur.instance_id,
      document_version_id: cur.document_version_id, document_hash: docHash },
    action: 'document.locked',
    payload: { document_hash: docHash, manifest_hash: manifestHash,
      locked_at_utc: lockedAt, retention_until_utc: retention } });
  await evaluateOnLock(next);
  res.json(next);
}));

ecignRouter.post('/instances/:id/second-signature', asyncH(async (req, res) => {
  const cur = await store.getInstance(req.params.id);
  if (!cur) throw new EcignError('NOT_FOUND', 'Instance not found', 404);
  const { assigned_to, due_date } = req.body ?? {};
  assert(assigned_to, 'VALIDATION', 'assigned_to required', 400);
  const task = { taskId: ulid(), type: 'signature_request' as const,
    formInstanceId: cur.instance_id, assignedTo: assigned_to,
    assignedBy: req.user!.user_id, status: 'pending' as const,
    createdAt: new Date().toISOString(), dueDate: due_date };
  await appendAudit({ actor: actorOf(req), network: networkOf(req),
    subject: { kind: 'form_instance', id: cur.instance_id },
    action: 'second_signature.requested', payload: task });
  res.json(task);
}));

ecignRouter.post('/instances/:id/void', asyncH(async (req, res) => {
  const cur = await store.getInstance(req.params.id);
  if (!cur) throw new EcignError('NOT_FOUND', 'Instance not found', 404);
  assert(req.user!.tier <= 2, 'PERMISSION_DENIED', 'Tier ≤ 2 required to void.', 403);
  const next = await store.updateInstance(cur.instance_id, { state: 'voided' });
  await appendAudit({ actor: actorOf(req), network: networkOf(req),
    subject: { kind: 'form_instance', id: cur.instance_id },
    action: 'access.denied',
    payload: { reason: 'voided', by_tier: req.user!.tier, note: req.body?.reason } });
  res.json(next);
}));

// ── Outputs ────────────────────────────────────────────────────────────────
ecignRouter.get('/instances/:id/bundle', asyncH(async (req, res) => {
  const certId = `CERT-${req.params.id}`;
  const bundle = await buildSignedDocumentBundle(req.params.id, certId);
  await appendAudit({ actor: actorOf(req), network: networkOf(req),
    subject: { kind: 'form_instance', id: req.params.id },
    action: 'export.generated', payload: { kind: 'signed_bundle', cert_id: certId } });
  res.json(bundle);
}));

// ── Document version registration (admin) ─────────────────────────────────
ecignRouter.post('/versions', asyncH(async (req, res) => {
  const v = req.body;
  assert(v?.version_id && v?.form_id && v?.semver && v?.template_snapshot,
    'VALIDATION', 'missing fields', 400);
  v.canonical_bytes ??= 0;
  v.hash_sha256 ??= sha256(v.template_snapshot);
  v.governing_policies ??= [];
  await store.insertVersion(v);
  res.json(v);
}));

// ── Centralized EcignError → ApiError translation ─────────────────────────
ecignRouter.use((err: Error, _req: Request, _res: Response, next: NextFunction) => {
  if (err instanceof EcignError) {
    return next(new ApiError('validation_error', err.message, err.status, { code: err.code }));
  }
  const e = err as Error & { code?: string; status?: number };
  if (e.code === 'INVALID_STATE_TRANSITION') {
    return next(new ApiError('validation_error', e.message, 409, { code: e.code }));
  }
  next(err);
});
