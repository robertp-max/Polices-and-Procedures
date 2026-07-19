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
import {
  canGenerateFinalPackage,
  normalizeAuthorityDomain,
  normalizeSignerProfile,
  validateSignerEligibility,
  type AuthorityDomain,
  type CanonicalSignerRequirement,
  type ProductionSignerTier,
  type SignatureCompletion,
} from '../../src/policy/ecign/signerAuthority.ts';
import {
  isDemoIdentityRuntime,
  verifiedActor,
  signerFromVerifiedActor,
  requiredSignersMissing,
} from '../auth/verifiedSignerIdentity.js';

export const ecignRouter: Router = Router();

// ── Signer identity middleware (security containment, ADR-0002 Phase 1) ──────
// Identity is the SERVER-VERIFIED canonical actor (req.actor, populated by the
// requireApiAuth boundary this router is mounted behind) — never client-supplied
// x-user-* headers. Signer tier is least-privilege (never defaulted to a
// privileged value); MFA is recorded truthfully. Client identity headers are
// honored ONLY in an explicitly opted-in local demo runtime. If a verified actor
// cannot be derived in a non-demo runtime, the signing surface is unavailable.
interface SessionUser { user_id: string; name: string; role: string; email: string; tier: number; authorityDomains: AuthorityDomain[] }
declare module 'express-serve-static-core' {
  interface Request { user?: SessionUser; mfaVerified?: boolean }
}

ecignRouter.use((req, _res, next) => {
  const actor = verifiedActor(req);
  if (actor) {
    const signer = signerFromVerifiedActor(actor);
    req.user = {
      user_id: signer.user_id,
      name: signer.name,
      role: signer.role,
      email: signer.email,
      tier: signer.tier,
      authorityDomains: signer.authorityDomains
        .map((value) => normalizeAuthorityDomain(value))
        .filter((value): value is AuthorityDomain => Boolean(value)),
    };
    req.mfaVerified = signer.mfaVerified;
    return next();
  }
  // No verified actor. Only an explicit local demo runtime may fall back to the
  // legacy client-supplied identity headers (clearly demo, never production).
  if (isDemoIdentityRuntime()) {
    const uid = req.header('x-user-id');
    if (!uid) return next(new ApiError('auth_error', 'NOT_AUTHENTICATED', 401));
    req.user = {
      user_id: uid,
      name:    req.header('x-user-name')  ?? uid,
      role:    req.header('x-user-role')  ?? 'unknown',
      email:   req.header('x-user-email') ?? `${uid}@careindeed.com`,
      tier:    Number(req.header('x-user-tier') ?? 1), // demo: no privileged default
      authorityDomains: parseAuthorityDomains(req.header('x-user-authority-domains')),
    };
    req.mfaVerified = false; // demo header identity is never treated as MFA-verified
    return next();
  }
  // Non-demo runtime with no verified actor: signing identity cannot be derived.
  return next(new ApiError('auth_error', 'NOT_AUTHENTICATED', 401));
});

const HIGH_IMPACT_FORMS = new Set(['EN-FM-485', 'EN-FM-033']); // POC, mandatory events
function requireStepUp(formId: string, mfaVerified?: boolean) {
  if (HIGH_IMPACT_FORMS.has(formId) && !mfaVerified) {
    throw new EcignError('STEP_UP_REQUIRED', 'Verified MFA step-up required for this form.', 403);
  }
}

function parseAuthorityDomains(header: string | undefined): AuthorityDomain[] {
  const parsed = String(header ?? '')
    .split(',')
    .map(value => normalizeAuthorityDomain(value))
    .filter((value): value is AuthorityDomain => Boolean(value));
  return parsed.length ? parsed : ['operations'];
}

function tier(value: number | undefined): ProductionSignerTier {
  if (!value || value <= 1) return 1;
  if (value === 2) return 2;
  if (value === 3) return 3;
  if (value === 4) return 4;
  return 5;
}

function requirementFromRequiredSigner(cur: FormInstanceRow, signer: RequiredSigner, index: number): CanonicalSignerRequirement {
  const requiredDomain = normalizeAuthorityDomain(signer.required_domain) ?? 'operations';
  const slotOrder = signer.slot_order ?? index + 1;
  return {
    signatureRequirementId: [
      'SIGREQ',
      cur.event_id ?? 'NOEVENT',
      cur.workflow_instance_id ?? 'NOWF',
      cur.form_id,
      String(slotOrder).padStart(2, '0'),
      signer.field_id,
    ].join('-'),
    formId: cur.form_id,
    workflowId: cur.workflow_instance_id,
    eventId: cur.event_id,
    slotOrder,
    slotFieldId: signer.field_id,
    slotPurpose: signer.slot_purpose ?? signer.role,
    requiredDomain,
    allowedRoles: signer.allowed_roles?.length ? signer.allowed_roles : [signer.role],
    minTier: tier(signer.min_tier ?? signer.tier),
    maxTier: signer.max_tier ? tier(signer.max_tier) : undefined,
    required: signer.required !== false,
    mode: signer.sequential === false ? 'parallel' : 'sequential',
    canDelegate: signer.can_delegate === true,
    requiresSameDomain: signer.requires_same_domain !== false,
    blocksSelfApproval: signer.blocks_self_approval === true,
    requiredForFinalPackage: signer.required_for_final_package !== false,
  };
}

function requirementsForInstance(cur: FormInstanceRow): CanonicalSignerRequirement[] {
  return cur.required_signers
    .map((signer, index) => requirementFromRequiredSigner(cur, signer, index))
    .sort((a, b) => a.slotOrder - b.slotOrder);
}

function signatureCompletionFromRow(sig: SignatureRow, requirement: CanonicalSignerRequirement): SignatureCompletion {
  return {
    slotOrder: sig.signature_slot_order ?? requirement.slotOrder,
    fieldId: sig.field_id,
    signerUserId: sig.signer_user_id,
    signerRole: sig.signer_role,
    signerTier: tier(sig.signer_tier ?? requirement.minTier),
    signerDomains: (sig.signer_domains ?? [requirement.requiredDomain])
      .map(domain => normalizeAuthorityDomain(domain))
      .filter((domain): domain is AuthorityDomain => Boolean(domain)),
    signedAt: sig.signed_at_utc,
  };
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
  // Truthful MFA: only stamp mfa_verified_at when the identity was actually
  // MFA-verified by the provider — never from a client-supplied token header.
  return { user_id: u.user_id, name: u.name, role: u.role, email: u.email,
    auth_method: method, mfa_verified_at: req.mfaVerified ? new Date().toISOString() : undefined };
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

// ── Identity step-up ────────────────────────────────────────────────────────
// Real MFA step-up is not wired. Do NOT mint a token that downstream would treat
// as verified MFA. Available only in an explicit local demo runtime, where it is
// labeled as unverified; otherwise fail closed.
ecignRouter.post('/identity/step-up', asyncH(async (req, res) => {
  if (!isDemoIdentityRuntime()) {
    throw new EcignError('STEP_UP_UNAVAILABLE', 'Identity step-up (MFA) is not available in this runtime.', 501);
  }
  // Demo only, and never verified. Do NOT record the token in the audit payload,
  // and do NOT label the auth method as a verified OTP — no MFA was verified.
  const token = ulid();
  const eventId = ulid();
  await appendAudit({ actor: actorOf(req, 'session'), network: networkOf(req),
    subject: { kind: 'session', id: req.user!.user_id },
    action: 'identity.step_up_issued_demo',
    payload: { event_id: eventId, method: req.body?.method ?? 'otp', mfa_verified: false, result: 'issued_demo' } });
  res.json({ mfa_token: token, mfa_verified: false, expires_at: new Date(Date.now() + 600_000).toISOString() });
}));

ecignRouter.get('/identity/me', (req, res) => res.json(req.user));

ecignRouter.get('/network-info', async (req, res) => {
  const context = resolveRequestNetworkContext(req);
  try {
    const networkLocation = await resolveNetworkLocationMetadata(req);
    return res.json(toNetworkInfoResponse(networkLocation));
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
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
  const { form_id, document_version_id, required_signers, form_instance_id, workflow_instance_id, event_id } = req.body ?? {};
  assert(form_id && document_version_id, 'VALIDATION', 'form_id + document_version_id required', 400);
  // Containment (ADR-0002 Phase 1): required_signers are authority-bearing
  // (role/tier/domain/order/self-approval/delegation). They must come from a
  // server-owned form/workflow snapshot, never the request body. No server-owned
  // resolver exists yet, so refuse client-defined signer requirements outside an
  // explicit demo runtime (fail-closed) rather than persist client authority.
  if (Array.isArray(required_signers) && required_signers.length > 0 && !isDemoIdentityRuntime()) {
    throw new EcignError('SIGNATURE_REQUIREMENTS_UNAVAILABLE',
      'Server-owned signer requirements are not yet available; client-defined required signers are refused (fail-closed).', 503);
  }
  if (form_instance_id) {
    const existing = await store.getInstance(String(form_instance_id));
    if (existing) return res.json(existing);
  }
  const row: FormInstanceRow = {
    instance_id: form_instance_id ? String(form_instance_id) : ulid(),
    form_instance_id: form_instance_id ? String(form_instance_id) : undefined,
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

ecignRouter.get('/instances/:id/signatures', asyncH(async (req, res) => {
  const i = await store.getInstance(req.params.id);
  if (!i) throw new EcignError('NOT_FOUND', 'Instance not found', 404);
  res.json(await store.listSignatures(req.params.id));
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
  requireStepUp(cur.form_id, req.mfaVerified);
  assertTransition(cur.state, 'verified');
  const next = await store.updateInstance(cur.instance_id,
    { state: 'verified', mfa_verified_at: req.mfaVerified ? new Date().toISOString() : undefined });
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
  requireStepUp(cur.form_id, req.mfaVerified);
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

  const requirements = requirementsForInstance(cur);
  // Fail-closed (ADR-0002 Phase 1): a signature is being applied but the instance
  // defines no required signers. An empty required-signer set must NOT silently
  // skip eligibility/order/self-approval checks — refuse the signature.
  if (requiredSignersMissing(requirements.length)) {
    await appendAudit({ actor: actorOf(req), network: networkOf(req),
      subject: { kind: 'form_instance', id: cur.instance_id },
      action: 'access.denied',
      payload: { reason: 'SIGNER_REQUIREMENTS_MISSING', field_id } });
    throw new EcignError('SIGNER_REQUIREMENTS_MISSING',
      'This form instance defines no required signers; signing is refused (fail-closed).', 409);
  }
  const matchingRequirement = requirements.find(requirement => requirement.slotFieldId === field_id);
  if (requirements.length > 0) {
    if (!matchingRequirement) {
      await appendAudit({ actor: actorOf(req), network: networkOf(req),
        subject: { kind: 'form_instance', id: cur.instance_id },
        action: 'access.denied',
        payload: { reason: 'SIGNER_SLOT_NOT_REQUIRED', field_id } });
      throw new EcignError('SIGNER_SLOT_NOT_REQUIRED', 'Signature field is not an active required signer slot for this form instance.', 403);
    }
    const sigs = await store.listSignatures(cur.instance_id);
    const signedFields = new Set(sigs.map(s => s.field_id));
    const previousRequiredMissing = requirements
      .filter(requirement => requirement.required && requirement.slotOrder < matchingRequirement.slotOrder)
      .filter(requirement => !signedFields.has(requirement.slotFieldId));
    if (previousRequiredMissing.length > 0) {
      await appendAudit({ actor: actorOf(req), network: networkOf(req),
        subject: { kind: 'form_instance', id: cur.instance_id },
        action: 'access.denied',
        payload: {
          reason: 'SIGNER_SLOT_OUT_OF_ORDER',
          field_id,
          missing_prior_slots: previousRequiredMissing.map(requirement => requirement.slotFieldId),
        } });
      throw new EcignError('SIGNER_SLOT_OUT_OF_ORDER', 'Required prior signer slots must be completed before this signature.', 409);
    }
    const profile = normalizeSignerProfile({
      userId: req.user!.user_id,
      name: req.user!.name,
      role: req.user!.role,
      tier: req.user!.tier,
      authorityDomains: req.user!.authorityDomains,
    });
    const previousSignatures = sigs
      .map(sig => {
        const requirement = requirements.find(item => item.slotFieldId === sig.field_id);
        return requirement ? signatureCompletionFromRow(sig, requirement) : null;
      })
      .filter((value): value is SignatureCompletion => Boolean(value))
      .filter(completion => completion.slotOrder < matchingRequirement.slotOrder);
    const eligibility = validateSignerEligibility(profile, matchingRequirement, {
      previousSignatures,
      preparerUserId: previousSignatures.find(completion => completion.slotOrder === 1)?.signerUserId,
      currentActorUserId: matchingRequirement.blocksSelfApproval ? previousSignatures.at(-1)?.signerUserId : undefined,
    });
    if (!eligibility.eligible) {
      await appendAudit({ actor: actorOf(req), network: networkOf(req),
        subject: { kind: 'form_instance', id: cur.instance_id },
        action: 'access.denied',
        payload: {
          reason: 'SIGNER_NOT_ELIGIBLE',
          field_id,
          signer_role: req.user!.role,
          signer_tier: req.user!.tier,
          signer_domains: req.user!.authorityDomains,
          requirement: {
            slot_order: matchingRequirement.slotOrder,
            slot_purpose: matchingRequirement.slotPurpose,
            required_domain: matchingRequirement.requiredDomain,
            allowed_roles: matchingRequirement.allowedRoles,
            min_tier: matchingRequirement.minTier,
          },
          reasons: eligibility.reasons,
        } });
      throw new EcignError('SIGNER_NOT_ELIGIBLE', eligibility.reasons.join(' '), 403);
    }
  }

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
    signer_tier: req.user!.tier,
    signer_domains: req.user!.authorityDomains,
    signature_slot_order: matchingRequirement?.slotOrder,
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
  // Containment (ADR-0002 Phase 1): an unexplained empty required-signer set must
  // NOT be lockable — that would produce a signed_locked document with no
  // signatures. A genuinely unsigned form needs an explicit server-owned
  // signature policy (deferred to Phase 5); until then, fail closed.
  if (requiredSignersMissing(cur.required_signers.length)) {
    await appendAudit({ actor: actorOf(req), network: networkOf(req),
      subject: { kind: 'form_instance', id: cur.instance_id },
      action: 'access.denied', payload: { reason: 'SIGNER_REQUIREMENTS_MISSING', op: 'lock' } });
    throw new EcignError('SIGNER_REQUIREMENTS_MISSING',
      'Cannot lock: this instance defines no required signers (fail-closed).', 409);
  }
  assertTransition(cur.state, 'signed_locked');
  // G3: all required signers present
  const sigs = await store.listSignatures(cur.instance_id);
  const signedFields = new Set(sigs.map(s => s.field_id));
  if (cur.required_signers.length && !cur.required_signers.every(r => signedFields.has(r.field_id))) {
    throw new EcignError('SIGNATURES_INCOMPLETE',
      'Required signatures missing.', 409);
  }
  const requirements = requirementsForInstance(cur);
  if (requirements.length > 0) {
    const completions = sigs
      .map(sig => {
        const requirement = requirements.find(item => item.slotFieldId === sig.field_id);
        return requirement ? signatureCompletionFromRow(sig, requirement) : null;
      })
      .filter((value): value is SignatureCompletion => Boolean(value));
    if (!canGenerateFinalPackage(requirements, completions)) {
      throw new EcignError('SIGNATURES_INCOMPLETE',
        'Final package cannot be locked until all required signer slots are complete.', 409);
    }
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
  // Containment (ADR-0002 Phase 1): second-signer eligibility must be resolved
  // from server-owned canonical identity + signature authority — never from a
  // client-supplied assigned_user.role/tier/authorityDomains. No server-owned
  // resolver exists yet, so refuse signer-assignment outside an explicit demo
  // runtime (fail-closed) rather than trust a browser-supplied signer profile.
  if (!isDemoIdentityRuntime()) {
    throw new EcignError('SIGNATURE_ASSIGNMENT_UNAVAILABLE',
      'Server-owned signer-authority resolution is not yet available; client-supplied assignee authority is refused (fail-closed).', 503);
  }
  const cur = await store.getInstance(req.params.id);
  if (!cur) throw new EcignError('NOT_FOUND', 'Instance not found', 404);
  const { assigned_to, due_date, assigned_user } = req.body ?? {};
  assert(assigned_to, 'VALIDATION', 'assigned_to required', 400);
  // Empty required-signer set must not route a downstream signer (fail-closed).
  if (requiredSignersMissing(cur.required_signers.length)) {
    throw new EcignError('SIGNER_REQUIREMENTS_MISSING',
      'Cannot assign a second signer: this instance defines no required signers (fail-closed).', 409);
  }
  const requirements = requirementsForInstance(cur);
  if (requirements.length > 0) {
    const sigs = await store.listSignatures(cur.instance_id);
    const completions = sigs
      .map(sig => {
        const requirement = requirements.find(item => item.slotFieldId === sig.field_id);
        return requirement ? signatureCompletionFromRow(sig, requirement) : null;
      })
      .filter((value): value is SignatureCompletion => Boolean(value));
    const nextRequirement = requirements
      .filter(requirement => requirement.required)
      .filter(requirement => !completions.some(completion => completion.slotOrder === requirement.slotOrder))
      .sort((a, b) => a.slotOrder - b.slotOrder)[0];
    assert(nextRequirement, 'SIGNATURES_COMPLETE', 'No downstream signer slot is pending.', 409);
    const assigned = assigned_user && typeof assigned_user === 'object'
      ? assigned_user as { role?: string; tier?: number; authorityDomains?: string[] }
      : null;
    assert(assigned?.role && assigned?.tier, 'VALIDATION', 'assigned_user role and tier are required for signer assignment validation.', 400);
    const profile = normalizeSignerProfile({
      userId: String(assigned_to),
      role: assigned.role,
      tier: assigned.tier,
      authorityDomains: assigned.authorityDomains ?? [],
    });
    const eligibility = validateSignerEligibility(profile, nextRequirement, {
      previousSignatures: completions.filter(completion => completion.slotOrder < nextRequirement.slotOrder),
      preparerUserId: completions.find(completion => completion.slotOrder === 1)?.signerUserId,
      currentActorUserId: req.user!.user_id,
    });
    if (!eligibility.eligible) {
      await appendAudit({ actor: actorOf(req), network: networkOf(req),
        subject: { kind: 'form_instance', id: cur.instance_id },
        action: 'access.denied',
        payload: {
          reason: 'SECOND_SIGNER_NOT_ELIGIBLE',
          assigned_to,
          requirement: {
            slot_order: nextRequirement.slotOrder,
            required_domain: nextRequirement.requiredDomain,
            allowed_roles: nextRequirement.allowedRoles,
            min_tier: nextRequirement.minTier,
          },
          reasons: eligibility.reasons,
        } });
      throw new EcignError('SECOND_SIGNER_NOT_ELIGIBLE', eligibility.reasons.join(' '), 403);
    }
  }
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
  assert(req.user!.tier >= 4, 'PERMISSION_DENIED', 'Tier 4 or higher required to void.', 403);
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
