# ADR-0002 Admin Control Plane — Review Ledger ("Suspects")

Running list of everything flagged during the autonomous build that deserves a
second look before merge/deploy. Nothing here is a known-broken defect unless
marked 🔴; most are intended fail-closed behavior, deferrals, or verification
gaps to close. Reviewed together once the plan is fully implemented.

Legend: 🔴 likely-defect · 🟠 behavior-diverges/verify · 🟡 deferred-by-design ·
🔵 verification-gap · ⚙️ ops/durability · 🧰 workflow/env note.
Last updated: 2026-07-20, HEAD `1a4c5aa3`.

## A. Correctness / behavior to verify
- 🟠 **Page-access projection is a simplified server model**, not a port of the
  legacy client feature-fallback (`PAGE_TO_FEATURE_FALLBACK` + `canViewFeature`).
  Rule: account-status → override → privileged-default (admin/none-default pages)
  → registry default (read). Visibility may diverge from the current client for
  some pages. Needs a UAT/dual-read comparison. (`server/auth/authorization/pageAccess.ts`)
- 🟠 **Page-access override key lookup** reads `map[userId] ?? map[emailLower]`, but
  the client store writes under multiple alias keys (`aliasKeysForIdentity`). Some
  users' overrides may not be found → they fall to defaults. (`server/routes/userAccess.ts` page-access route)
- 🟠 **Effective-access uses placeholder scope** (`{organizationId:''}`) in the read
  endpoints + capabilities, so `authorizeAction` scope matching is not exercised by
  real routes yet. Scope-scoped permission decisions are untested end-to-end.
- 🟠 **VerifiedSigner.role is single**: a signer with multiple capacities is
  represented by the highest-tier one for per-slot eligibility. A user needing to
  sign a specific slot in a non-highest capacity could mismatch. Per-slot capacity
  selection deferred. (`server/auth/authorization/signerResolution.ts` primaryCapacity)
- 🟠 **Capabilities contract widened** (`resolveCapabilities` now returns
  `effectiveAccess`); 8 test assertions loosened `toEqual`→`toMatchObject`. Verify
  no downstream consumer assumed the exact 2-key shape. (`server/auth/service.ts`)
- 🟡 **Impact-preview**: a suspended user shows `groupsAdded` even though no
  permissions are granted (membership recorded, grants nothing). Correct, but the
  UI must present it clearly so it doesn't read as "granted access."

## B. Fail-closed / deferred by design (need provisioning or a later phase)
- 🟡 **Suspend/reactivate is hard-cut**: returns 503 until a durable lifecycle
  store is provisioned. In dev/UAT the button will 503 by design (no silent
  canonical-only fallback). Provisioning + backfill is a live-infra step.
- 🟡 **No durable SignatureAuthorityAssignment store provisioned**: signing stays
  least-privilege / fail-closed until assignments exist. Correct, but means signing
  can't be exercised end-to-end until data is seeded.
- 🟡 **MFA always `mfaVerified:false`** in the resolver/signer (ADR MFA-honesty).
  Real verified step-up not integrated (Phase 5+). eCIgn high-impact forms will
  refuse until a real step-up signal exists.
- 🟡 **Cross-route resurrection gap (2E-3, NOT fixed)**: `grant-access` / `invite` /
  `reset` / `setup` routes can still reactivate a suspended account. Must be closed
  before any suspension go-live.

## C. Security-sensitive — re-verify before merge
- 🟠 **eCIgn `void` route** (`ecign.ts` ~707): `req.user.tier >= 4` check has no
  `requestIsLocalDemo` gate and no empty-required-signers fail-closed. Safe *today*
  only because verified tier defaults to 1; harden in 5D when real tiers arrive.
- 🟠 **`primeAssignmentCache` module-load side effect**: `signatureAssignmentStore.ts`
  calls `setSignatureAssignmentProvider` at import time (implicit wiring), and the
  sync cache is only refreshed on admin list/mutation — NOT at startup. eCIgn signing
  could see a stale/empty cache until an admin touches signature-authority. Wire a
  startup prime.
- 🟡 **Detail-page suspend/reactivate reason not transmitted**: the confirm dialog
  collects intent but the client `suspendUser/reactivateUser` don't send a reason;
  server defaults it. ADR wants an explicit reason on high-risk mutations.

## D. Verification gaps
- 🔵 **No visual UAT yet**: the entire Phase 6 UI (detail tabs, signature-coverage)
  has NOT been rendered/clicked in a browser — feature branch isn't on the running
  `:5180` preview. Only build + type + lint + unit verification so far.
- 🔵 **No real strict server typecheck**: no project tsconfig includes `server/`;
  the temp-tsconfig approach yields false errors (`erasableSyntaxOnly` + `req.*`
  augmentation). Faithful gate today = vitest + app `tsc -b` + eslint. A dedicated
  server tsconfig would close this.
- 🔵 **New per-user/aggregate endpoints lack route-level tests** (effective-access,
  page-access, impact-preview, signature-authority CRUD, signature-coverage) — the
  pure modules are unit-tested; the Express handlers are not integration-tested.

## E. Ops / durability (ADR §D release blockers)
- ⚙️ **File-local stores are not multi-instance safe**: lifecycle, page-access,
  signature-assignment, and the identity registry all default to `.cache/*.json`.
  Cloud Run may run >1 instance → lost updates / split state. Multi-instance-durable
  adapter required before production (already an ADR §D blocker).
- ⚙️ **Optimistic concurrency (3D) is app-layer, not atomic on file adapter**:
  `AppIdentityRegistry.version` + `assertVersionMatch` now guard role mutations
  (409 on stale write, ETag round-trip). But the file adapter's read-check-write
  is not a true atomic CAS — a genuine multi-instance CAS still needs the durable
  adapter (§D). The signature-assignment + access-review + campaign stores do NOT
  yet have a version guard (only the identity registry does).
- ⚙️ **Full `vitest` server suite crashes on a worker-pool IPC flake**
  (`ERR_IPC_CHANNEL_CLOSED` via the node_modules junction). Had to run targeted
  subsets. CI reliability concern for this worktree setup.

## G. UX / discoverability (found during review)
- 🔴 **New aggregate screens not in the nav menu (omission)**: `signature-coverage`,
  `access-review`, `reconciliation` have routes + render wiring but were NOT added
  to `navigationManifest.ts` `admin:` group → reachable only by direct URL, no
  clickable tab. Fix = 3 manifest entries. (admin-user-detail is intentionally
  not nav-listed — reached via Users row-click.)
- 🟠 **Admin lands on Groups, not Users**: the `V6Shell` admin gear button →
  `/admin/user-groups`, so the create-user UI (`/admin/users` → "Add user" +
  Create-user form + Cognito `AccountProvisioningCard`) is one tab over and not
  obvious. Owner reported "I don't see any UI to create users" — it exists, just
  not on the default admin landing. Consider landing on Users or promoting "Add
  user". (navigationManifest.ts `admin:` group has all 5 tabs incl. Users.)
- 🟠 **Two user-creation paths coexist on /admin/users**: "Add user" writes to the
  **demo localStorage** identity store (`addUser`), while `AccountProvisioningCard`
  does **real Cognito** provisioning. Which is authoritative is unclear to a user;
  reconcile (the control plane should make server provisioning the primary path).

## F. Workflow / environment notes
- 🧰 Commit messages containing the word "clean" trip the anti-wipe guardrail
  (matches `git…clean`). Avoid it in `-m`/heredocs.
- 🧰 Post-commit auto-`gc` occasionally errors trying to prune a protected ref —
  harmless (the commit still lands).
- 🧰 The ChatGPT ADR review loop was re-planning work already built — do not
  re-run it; ADR-0002 + this ledger are the source of truth.
