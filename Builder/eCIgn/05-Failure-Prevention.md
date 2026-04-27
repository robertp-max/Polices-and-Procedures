# 05 · Failure Prevention (Hard Guardrails)

Implements Phase 8. Each guardrail is enforced at the **server boundary**, not
just in the UI. The UI mirrors the rule for usability; the server is the law.

---

## G1 — Signing without consent → BLOCKED

**Rule.** No `signature.applied` event may be appended unless the most recent
`consent.accepted` event for `(user_id, current_disclosure_version)` exists.

**Server check (`POST /ecign/signatures`):**
```
SELECT 1 FROM consents
 WHERE user_id = :user
   AND disclosure_version = :current_version
ORDER BY accepted_at_utc DESC LIMIT 1;
-- if 0 rows → 409 CONSENT_REQUIRED
```

**UI behavior.** Step 1 must be the only enabled step until consent is captured.

---

## G2 — Signing without authentication → BLOCKED

**Rule.** Every signing endpoint requires:
- A valid authenticated session (httpOnly cookie + CSRF token), AND
- For high-impact signatures (POC, physician orders, HR onboarding completion),
  an MFA step-up token with `mfa_verified_at` ≤ 10 minutes old.

**Failure mode.** `401 NOT_AUTHENTICATED` or `403 STEP_UP_REQUIRED`.

---

## G3 — Incomplete required signatures → DOCUMENT NOT COMPLETE

**Rule.** A form instance does not transition to `signed_locked` until every
required signer in the workflow definition has applied a signature.

```
form_instance.required_signers = [
  { role: 'Administrator Designee', tier: 2 },
  { role: 'Compliance Officer',     tier: 3 },
]
```

The instance state is computed as the **min** of upstream signer states.
A POC without a physician signature can never enter `billable`, regardless
of UI presentation.

---

## G4 — Altered document post-signature → BLOCKED + LOGGED

**Rule.** The `signed_locked` state revokes write grants on the form-instance
fields. Any attempted PUT/PATCH returns `409 DOCUMENT_LOCKED` and appends an
`access.denied` audit event with the offending payload diff.

**Integrity verification.** On every read of a signed instance, the server
recomputes the SHA-256 over the canonical bytes and compares to
`documents.versions.hash`. Mismatch → `500 INTEGRITY_VIOLATION` and an
`integrity.mismatch` audit event tagged `severity: critical`.

---

## G5 — Duplicate or conflicting signatures → BLOCKED

**Rule.** A `(form_instance_id, signer_user_id, field_id)` triple is unique.
A second attempt by the same signer on the same field returns `409 DUPLICATE_SIGNATURE`.

**Conflict resolution.** A higher-tier signer (e.g., Administrator) may *void*
a lower-tier signature with reason; the void is itself a signed event and the
form returns to the prior workflow step. The voided signature remains in the
audit trail forever.

---

## G6 — Signing past expiry / retention windows → BLOCKED or FLAGGED

| Window | Behavior |
|---|---|
| Document `valid_until` passed | Sign endpoint returns `410 DOCUMENT_EXPIRED`; user must request re-issue |
| Verbal-order countersign window passed | Sign succeeds but emits `risk: late_signature` flag visible to QA + surveyor |
| Retention `retention_until` passed | Document still readable; export bundles include retention notice |

---

## G7 — Out-of-order workflow → BLOCKED

The state machine in [02-Signature-Workflow.md](02-Signature-Workflow.md)
is enforced server-side. Any attempt to skip a state returns
`409 INVALID_STATE_TRANSITION` with the expected next state in the response.

---

## G8 — Tampered audit chain → DETECTED

`POST /audit/verify-chain` recomputes every hash from genesis and reports the
first event whose `hash ≠ sha256(prev_hash ‖ canonical(payload))`. A scheduled
job runs this verification daily and pages on-call on failure.

---

## Summary table

| ID | Risk | Control | Audit event on violation |
|---|---|---|---|
| G1 | Sign without consent | Server consent check | `access.denied` |
| G2 | Sign without auth | Session + step-up MFA | `access.denied` |
| G3 | Incomplete signatures | State min over signers | `compliance.blocked` |
| G4 | Post-sign alteration | Lock + hash recheck | `integrity.mismatch` |
| G5 | Duplicate signature | Unique triple constraint | `signature.rejected` |
| G6 | Late signature | Window validation | `risk.late_signature` |
| G7 | Out-of-order step | State machine | `access.denied` |
| G8 | Tampered audit chain | Daily chain verification | `integrity.mismatch` |
