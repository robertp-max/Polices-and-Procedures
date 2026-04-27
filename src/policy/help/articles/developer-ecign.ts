import type { HelpArticle } from './index';

export const DEVELOPER_ECIGN: HelpArticle[] = [
  {
    slug: 'dev-api-overview',
    title: 'eCIgn API Surface',
    category: 'developer',
    subcategory: 'eCIgn',
    purpose: 'All eCIgn-related HTTP endpoints. Every endpoint requires X-User-Id (replace with real auth in production); high-impact forms additionally require X-MFA-Token.',
    whenToUse: 'When integrating with the eCIgn backend from a UI, workflow engine, or external system.',
    systemBehavior: `Disclosure & consent:
  GET  /api/ecign/disclosures/current
  POST /api/ecign/consents { disclosure_version }
Identity:
  POST /api/ecign/identity/step-up { method: 'otp' | 'sso' }
  GET  /api/ecign/identity/me
Form instances:
  POST /api/ecign/instances { form_id, document_version_id, required_signers[], workflow_instance_id?, event_id? }
  GET  /api/ecign/instances
  GET  /api/ecign/instances/:id
  PATCH /api/ecign/instances/:id/fields { field_values }
  POST /api/ecign/instances/:id/disclose
  POST /api/ecign/instances/:id/verify
  POST /api/ecign/instances/:id/review-ack
  POST /api/ecign/instances/:id/signatures { field_id, signature_png_b64, attestation_text_hash }
  POST /api/ecign/instances/:id/lock
  POST /api/ecign/instances/:id/second-signature { assigned_to, due_date? }
  POST /api/ecign/instances/:id/void { reason }
  GET  /api/ecign/instances/:id/bundle           // signed PDF bundle (template + watermark + appended pages)
  POST /api/ecign/versions                        // register a new document_version
Audit:
  GET  /api/audit/events?subject_id=...
  POST /api/audit/verify-chain?subject_id=...
Compliance:
  GET  /api/compliance/objects/:kind/:id
  GET  /api/compliance/blocked
  GET  /api/compliance/transitions?kind=...&id=...`,
    complianceImpact: 'Each endpoint enforces one or more guardrails server-side. UI bypass is impossible.',
    evidence: 'Every state-changing endpoint appends an audit event before responding.',
    related: { components: ['server/routes/ecign.ts', 'server/routes/audit.ts', 'server/routes/compliance.ts'] },
  },
  {
    slug: 'dev-data-models',
    title: 'Data Models',
    category: 'developer',
    subcategory: 'eCIgn',
    purpose: 'Canonical TypeScript shapes for every persisted eCIgn entity.',
    whenToUse: 'When writing client code, integrations, or new server logic that touches eCIgn data.',
    systemBehavior: `Defined in server/ecign/store.ts:
  DocumentVersionRow { version_id, form_id, semver, effective_at_utc, next_review_utc, governing_policies[], canonical_bytes, hash_sha256, template_snapshot }
  ConsentRow         { consent_id, user_id, disclosure_version, disclosure_text_hash, accepted_at_utc, ip, user_agent }
  RequiredSigner     { role, tier, user_id?, field_id }
  FormInstanceRow    { instance_id, form_id, document_version_id, state, required_signers[], field_values, workflow_instance_id?, event_id?, retention_until_utc?, document_hash?, manifest_hash?, locked_at_utc?, consent_id?, mfa_verified_at?, review_acknowledged_at?, attestation_confirmed_at?, created_at_utc }
  SignatureRow       { signature_id, instance_id, field_id, signer_user_id, signer_name, signer_role, signer_email, signed_at_utc, signature_png, signature_hash, attestation_text_hash }
  AuditRow           { event_id, prev_hash, hash, occurred_at_utc, actor, network, subject, action, payload }
  ComplianceRow      { transition_id, object_kind, object_id, state_before, state_after, trigger_signature?, governing, dependencies[], occurred_at_utc }`,
    complianceImpact: 'Field-for-field coverage of the §07 spec. No additional fields may be added without a corresponding audit event update.',
    evidence: 'JSONL files in server/ecign/data/.',
    related: { components: ['server/ecign/store.ts'] },
  },
  {
    slug: 'dev-state-machine',
    title: 'Signature Workflow State Machine',
    category: 'developer',
    subcategory: 'eCIgn',
    purpose: 'The authoritative state machine that gates every signing action.',
    whenToUse: 'When extending workflows, debugging INVALID_STATE_TRANSITION errors, or adding new states.',
    systemBehavior: `Defined in server/ecign/stateMachine.ts:
  created       → disclosed | voided
  disclosed     → verified  | voided
  verified      → reviewed  | voided
  reviewed      → attested  | voided
  attested      → signed_locked | voided
  signed_locked → (terminal)
  voided        → (terminal)
  expired       → (terminal)
assertTransition(from, to) throws { code: 'INVALID_STATE_TRANSITION', status: 409 } on any disallowed move. allRequiredSigned() compares signed field_ids against required_signers.`,
    complianceImpact: 'Out-of-order signing is impossible (G7). The same machine is enforced regardless of which UI initiated the request.',
    evidence: 'Every transition produces an audit event with the resulting state.',
    related: { components: ['server/ecign/stateMachine.ts'] },
  },
  {
    slug: 'dev-audit-chain',
    title: 'Audit Hash-Chain Implementation',
    category: 'developer',
    subcategory: 'eCIgn',
    purpose: 'How append + verify work for the immutable audit log.',
    whenToUse: 'When debugging chain verification failures or implementing external evidence verifiers.',
    systemBehavior: `appendAudit(partial) in server/ecign/hashChain.ts:
  prev_hash = store.lastAuditHash()  // 'GENESIS' for first event
  event_id = ulid()
  occurred_at_utc = now()
  body = canonical({ ...partial, event_id, prev_hash, occurred_at_utc })
  hash = sha256(prev_hash + '|' + body)
  store.appendAudit({ ...partial, event_id, prev_hash, hash, occurred_at_utc })
verifyChain(subject_id?) walks all events, recomputes each hash, and returns { ok, first_break?, verified }. canonical() produces RFC-style sorted JSON for stable hashing.`,
    complianceImpact: 'Tamper detection for HIPAA 164.312(c) integrity controls.',
    evidence: 'Daily verify-chain cron + on-demand check from /audit page.',
    related: { components: ['server/ecign/hashChain.ts'], endpoints: ['POST /api/audit/verify-chain'] },
  },
  {
    slug: 'dev-pdf-watermark',
    title: 'PDF Generation, Watermark & Appended Pages',
    category: 'developer',
    subcategory: 'eCIgn',
    purpose: 'How the signed PDF bundle is assembled without mutating the template.',
    whenToUse: 'When extending output (adding pages, changing watermark layout, building external exporters).',
    systemBehavior: `server/ecign/pdf.ts:
  watermarkHtml(certId, signer, signedAt, hashShort)  // 14px ribbon, opacity .85, fits inside existing footer
  appendedPagesHtml({ instance, signatures, audit, certId })
    1) Certificate page  (system, document, signatures, attestation)
    2) Identity & Device page
    3) Audit Trail timeline (paginated table + chain head)
    4) Document Integrity Manifest (document_hash, chain_head, cert_hash, manifest_hash)
  buildSignedDocumentBundle(instanceId, certId)
    returns { instance, watermark, appended }; client merges with template print and pipes to window.print().
DO NOT modify template structure.`,
    complianceImpact: 'Implements the §06 template-preservation contract. The pre-print template-integrity gate aborts with TEMPLATE_DRIFT on any mismatch.',
    evidence: 'export.generated audit event per bundle request.',
    related: { components: ['server/ecign/pdf.ts', 'server/ecign/integrity.ts'] },
  },
  {
    slug: 'dev-failure-prevention',
    title: 'Failure Prevention Enforcement (G1–G8)',
    category: 'developer',
    subcategory: 'eCIgn',
    purpose: 'Per-guardrail enforcement points in the codebase.',
    whenToUse: 'When triaging a 4xx/5xx response, or when adding a new endpoint that touches signature data.',
    systemBehavior: `G1 CONSENT_REQUIRED — server/routes/ecign.ts (consent check inside POST /signatures and /disclose)
G2 NOT_AUTHENTICATED / STEP_UP_REQUIRED — auth middleware + requireStepUp() for HIGH_IMPACT_FORMS
G3 SIGNATURES_INCOMPLETE — server/routes/ecign.ts /lock handler
G4 DOCUMENT_LOCKED — store.updateInstance() + PATCH /fields explicit guard + DB trigger in 001_ecign_schema.sql
G5 DUPLICATE_SIGNATURE — store.insertSignature() uniqueness check
G6 risk.late_signature — emitted by lock handler when signing_at vs verbal order ts exceeds window (extension hook)
G7 INVALID_STATE_TRANSITION — stateMachine.assertTransition() called by every state-change endpoint
G8 chain verification — POST /api/audit/verify-chain + scheduled job`,
    complianceImpact: 'Each enforcement point maps to one ESIGN/UETA/CMS/HIPAA requirement.',
    evidence: 'access.denied or integrity.mismatch audit event on every violation.',
    related: { components: ['server/routes/ecign.ts', 'server/ecign/store.ts', 'migrations/001_ecign_schema.sql'] },
  },
  {
    slug: 'dev-compliance-rules',
    title: 'Adding a New Compliance Rule',
    category: 'developer',
    subcategory: 'eCIgn',
    purpose: 'Extend evaluateOnLock() to handle a new compliance object kind.',
    whenToUse: 'When introducing a new regulated artifact (e.g., a new policy class).',
    steps: [
      'Open server/ecign/compliance.ts.',
      'Add a new entry to RULES with: matches(form_id), objectKind, derive(ctx), governing(ctx).',
      'Update the policy_id linkage so audit events carry the governing reference.',
      'No further wiring needed — evaluateOnLock() is invoked by /lock automatically.',
    ],
    systemBehavior: 'Each rule contributes its own (state_before → state_after) and dependency check; transitions land in compliance_states with an accompanying compliance.transitioned audit event.',
    complianceImpact: 'Every regulated artifact gets a defensible state-transition record without bespoke wiring.',
    evidence: 'compliance_states row + compliance.transitioned audit event.',
    related: { components: ['server/ecign/compliance.ts'] },
  },
];
