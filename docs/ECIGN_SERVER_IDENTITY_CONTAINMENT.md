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

## Non-demo signature surface is temporarily unavailable

Stored `required_signers` have no trusted provenance (they may predate
containment or have been client-defined), and no server-owned requirement/
authority resolver exists yet. So in a non-demo runtime the entire signature
surface fails closed — not just new client-defined requirements:

- `POST /instances` with client `required_signers` → `503 SIGNATURE_REQUIREMENTS_UNAVAILABLE`
- `POST /instances/:id/signatures` → `503 SIGNATURE_AUTHORITY_UNAVAILABLE`
- `POST /instances/:id/lock` → `503 SIGNATURE_AUTHORITY_UNAVAILABLE`
- `POST /instances/:id/second-signature` → `503 SIGNATURE_ASSIGNMENT_UNAVAILABLE`
- `GET /instances/:id/bundle` → `503 SIGNED_BUNDLE_UNAVAILABLE`

These checks run before any consent lookup, eligibility evaluation, signature
insertion, document hashing, or state mutation — trust is never inferred from a
non-empty requirement array, role labels, tier values, authority domains,
existing signatures, or instance age. **Signer authority has NOT been
implemented** — these operations are disabled until control-plane Phase 5
provides the canonical server-owned requirement + authority resolver (requirement
source id/version/hash, server-owned signature policy, canonical authority
assignment, eligibility, scope, effective dates, prerequisites, SoD).

Safe disclosure, consent, document review, field preparation, and read
operations remain available. `buildSignedDocumentBundle` additionally enforces
the full signed-lock lifecycle itself (state `signed_locked`, non-empty
requirements, all required signatures present, document + manifest hash + lock
time present) as defense-in-depth, independent of the HTTP route.

## Demo authority is request-scoped (decided by the central boundary)

The **central `requireApiAuth` boundary is the sole authority** for a request's
authentication mode. It attaches `req.authenticationContext = { mode }` where
`mode ∈ 'cognito' | 'service' | 'local_demo'`. `local_demo` is set only when the
boundary's complete local-demo fallback activates: exact `ENABLE_LOCAL_DEMO_AUTH`
opt-in **and** non-production **and** a loopback canonical host **and** a loopback
network peer **and** Cognito unconfigured **and** fallback not disabled **and** no
injected auth deps.

Locality is proven from the **connection**, not caller headers: the boundary
requires BOTH a loopback canonical host (`localhost`/`127.0.0.1`/`::1`) AND a
loopback network peer (`req.socket.remoteAddress`). `Origin`, `X-Forwarded-Host`,
and `Forwarded` are never positive proof of locality (a public request can spoof
them; a trusted-proxy/CIDR path would be a separate explicit design). Partial
Cognito configuration fails closed — pool **or** client present → no demo. The
shared contract lives in `server/auth/requestAuthenticationContext.ts`
(`AuthenticationMode`, `RequestAuthenticationContext`, `authenticationModeForActor`
— exhaustive: `user`→cognito, `service`→service, else 401 — and
`requestIsLocalDemo`).

eCIgn and Calendar consume that decision via `requestIsLocalDemo(req)` — they
**never** re-derive demo authority from environment variables. Consequences:
- a Cognito- or service-authenticated request is never demo, even with
  `NODE_ENV=development` and `ENABLE_LOCAL_DEMO_AUTH=true`;
- a public (Cloud Run / Vercel / non-local) request is never demo even with the
  flag enabled;
- a request that never passed the boundary (e.g. a direct router mount in a test)
  is never demo — demo behavior cannot be self-enabled by setting env vars.

Client `x-user-*` / `x-actor` headers and the mock step-up are honored only for a
boundary-marked `local_demo` request, clearly labeled as demo and never
MFA-verified. `isDemoIdentityRuntime()` remains as a startup-diagnostics helper
only and must not gate request behavior.

## Tests

- `server/auth/requestAuthenticationContext.test.ts` — central boundary via an
  HTTP-style harness: loopback-proof (spoofed `Origin`/`X-Forwarded-Host` and
  localhost-host-from-remote-peer are non-demo; loopback host + peer is demo),
  partial-Cognito fail-closed, verified bearer → `cognito`, and the
  `authenticationModeForActor` (user/service/system-throws) + `requestIsLocalDemo`
  helper units.
- `server/auth/localDemoFallback.test.ts` — the real `requireApiAuth` opt-in
  matrix (flag/host/Cognito/deps/disable conditions).
- `server/routes/ecignContainment.route.test.ts` — eCIgn route contracts:
  verified-actor identity, hostile-header rejection, non-demo 503s for
  signature/lock/second-signer/bundle/instances, empty-requirement guards, and
  that env flags alone cannot self-enable demo.
- `server/ecign/pdfBundleGuard.test.ts` — bundle builder defense-in-depth
  (state/requirements/integrity/mandatory-vs-optional signer completion).
- `server/auth/verifiedSignerIdentity.test.ts` — verified-actor selection,
  least-privilege tier (never `4`), truthful MFA, empty required-signers guard.

## Scope boundary / follow-ups (later control-plane phases)

- Real server-side signer-tier and authority-domain derivation → Phase 5.
- Real MFA step-up integration → Phase 5 (high-impact forms fail closed until then).
- Canonical server-owned signer requirements, signature-authority assignments,
  verified step-up, and safe re-enablement of non-demo signature operations →
  Phase 5.
