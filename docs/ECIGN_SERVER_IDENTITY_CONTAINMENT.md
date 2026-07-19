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

1. **Verified-actor identity.** eCIgn signer identity is derived from `req.actor`
   (the verified canonical actor), never `x-user-*` headers, via
   `server/auth/verifiedSignerIdentity.ts` (`signerFromVerifiedActor`).
2. **No privileged default tier.** Signer tier is least-privilege (`1`) — never
   defaulted to a privileged value and never taken from client input. Real
   server-side tier/authority derivation is deferred to control-plane Phase 5;
   until then higher-tier slots fail closed.
3. **Empty required-signers fail closed.** Applying a signature to an instance
   with no required signers is refused (`SIGNER_REQUIREMENTS_MISSING`, 409).
4. **Verified-session actors for evidence/workflow.** `calendar.ts` `resolveActor`
   uses the verified actor; header fallback only in an explicit demo runtime.
5. **Truthful MFA.** `mfa_verified_at` is stamped only when the provider actually
   verified MFA (`actor.mfa_enrolled`). The mock step-up endpoint returns
   `501 STEP_UP_UNAVAILABLE` outside demo runtime and never claims verification.
6. **Route unavailable without a verified actor.** In a non-demo runtime with no
   verified actor, the signing surface returns `401 NOT_AUTHENTICATED` rather
   than accepting client-asserted identity.

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
