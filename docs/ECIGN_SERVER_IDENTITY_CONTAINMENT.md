# eCIgn Server Identity Containment (ADR-0002 Phase 1)

Narrowly-scoped, independently deployable security hotfix. Governed by
[ADR-0002](ADR-0002-admin-control-plane.md) Phase 1. Contains **no** control-plane
redesign (no full signature catalog, authority-assignment UI, account-lifecycle
redesign, page-access migration, Admin Users redesign, delegation, or persistence
migration).

## Problem (baseline `6d20c5e4`)

The eCIgn server derived signer identity, role, tier, and authority domains from
client-supplied `x-user-*` headers (`server/routes/ecign.ts`), with signer **tier
defaulting to `4`** when absent. MFA was represented as verified whenever any
`x-mfa-token` header was present, and a mock step-up endpoint minted a ULID. A
form instance with an **empty `required_signers` set skipped all eligibility,
order, and self-approval checks**. Calendar/evidence actor attribution
(`server/routes/calendar.ts` `resolveActor`) trusted `x-actor` / `x-user-id`
headers. All of these run **behind** the `requireApiAuth` boundary, so a
server-verified canonical actor (`req.actor`) was already available and unused.

## Change

Strict fail-closed containment. The verified actor supplies **identity only**;
signer **authority** (capacity/tier/domain/requirements) is never taken from the
client and, because no server-owned resolver exists yet, signature *mutations*
are refused outside an explicit demo runtime rather than approximated.

1. **Verified-actor identity, identity only.** eCIgn signer identity is derived
   from `req.actor` via `signerFromVerifiedActor` — `role='unknown'`,
   `authorityDomains=[]`, `tier=1`. A verified identity implies no business/legal
   signature capacity, no authority domain, and no privileged tier.
2. **No privileged default tier.** Tier is least-privilege (`1`), never from
   client input, never `4`.
3. **Client signer requirements refused.** `POST /instances` with a non-empty
   `required_signers` → `503 SIGNATURE_REQUIREMENTS_UNAVAILABLE` outside demo
   (authority-bearing requirements must come from a server-owned snapshot).
4. **Empty required-signers fail closed across the lifecycle.** Refused for
   signature application, second-signature assignment, and lock
   (`SIGNER_REQUIREMENTS_MISSING`, 409) — so an instance with no requirements can
   never become `signed_locked` or produce a final package. A genuinely unsigned
   form needs an explicit server-owned signature policy (deferred to Phase 5).
5. **Second-signer authority refused.** `POST /second-signature` →
   `503 SIGNATURE_ASSIGNMENT_UNAVAILABLE` outside demo; client
   `assigned_user.role/tier/authorityDomains` are never trusted.
6. **Verified-session actors for evidence/workflow.** `calendar.ts` `resolveActor`
   uses the verified user or a verified service principal (`service_id`); a
   user-originated mutation with no verified actor returns `401` — no synthetic
   `service-account` fallback. Header fallback only in demo runtime.
7. **Truthful MFA.** `mfaVerified` is always `false` (enrollment is not
   current-session verification and no step-up signal exists); `mfa_verified_at`
   is never stamped. High-impact forms keep failing `STEP_UP_REQUIRED`. The mock
   step-up returns `501` outside demo, and its demo audit records an opaque
   event id + `mfa_verified: false` — never the token, never an `otp` auth method.
8. **Route unavailable without a verified actor.** Non-demo runtime with no
   verified actor → `401` rather than accepting client-asserted identity.

## Demo runtime

Client `x-user-*` / `x-actor` headers are honored **only** when
`ENABLE_LOCAL_DEMO_AUTH === 'true'` **and** `NODE_ENV !== 'production'`
(`isDemoIdentityRuntime()`), clearly labeled as demo and never MFA-verified. In
any other runtime the verified actor is the sole identity source.

## Tests

`server/auth/verifiedSignerIdentity.test.ts` covers: demo-runtime gating
(fail-closed; production never demo; malformed flag), verified-actor selection,
least-privilege tier (never `4`), truthful MFA mapping, and the empty
required-signers guard.

## Scope boundary / follow-ups (later control-plane phases)

- Real server-side signer-tier and authority-domain derivation → Phase 5.
- Real MFA step-up integration → Phase 5 (high-impact forms fail closed until then).
- Lock/final-package hardening for empty required-signers and broader
  evidence/workflow actor paths → later phases.
