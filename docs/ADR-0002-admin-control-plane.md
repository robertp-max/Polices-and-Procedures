# ADR-0002 — Admin Identity, Access, Permissions, Page Access, Account Lifecycle & Signature Authority Control Plane

- **Status:** ACCEPTED (approved 2026-07-19)
- **Applies to branch:** `feat/admin-access-signature-authority` (baseline `6d20c5e4`, re-verified from `origin/User_Access_and_Cloud_Architecture` at implementation start)
- **Relationship to [ADR-0001](ADR-0001-target-architecture.md):** ADR-0001 sets the binding *platform* target (Cognito + Cloud Run/Express + Firestore + Drive). ADR-0002 governs the *control-plane* built on that platform. Where ADR-0001 fixes the runtime substrate, ADR-0002 fixes how identity, account lifecycle, authorization, page access, and signature authority are modeled and enforced. ADR-0002 does **not** activate Firestore; JSONL remains the development default per §2.9/§4.
- **Delivery:** one primary implementation agent, sequential, gated. This ADR is a documentation-only artifact and the first commit on the branch. No implementation is included in this commit.

**Evidence legend** (applied to every finding): `[CODE]` code-proven · `[TEST]` test-proven · `[RUN]` runtime-proven · `[DOC]` documentation-derived · `[HIST]` historical · `[INF]` inferred · `[NEEDS]` needs-confirmation.

---

## 1. Context (evidence-classified findings)

Verified on baseline `6d20c5e4` by a five-agent read-only inventory (server enforcement, person models, frontend authority stores, signature systems, documentation authority).

1. **Two disconnected account-status planes.** Registration status (DynamoDB `RegistrationRecord`) gates login/refresh/`/me`; canonical registry status (`AppIdentityRegistry`) gates business routes + user-access. `suspendUser` flips canonical **only** — it never calls Cognito `AdminDisableUser` and never updates the registration record. `login()` never consults the canonical plane. `[CODE]` + `[RUN]` (operator confirmed: a canonically-suspended user can still log in).
2. **Browser localStorage is the de-facto authority** for RBAC (`ci.identityRegistry.v1` → `authorize()`/`featureAccess`/nav), page access (`ci.pageAccess.v1`), role injection (`__demo_user_role` → RoleGate), and evidence/workflow actor attribution (`hhc_actor_id`/`hhc_actor_role`). Only two decisions are truly server-enforced today: `/api/auth/capabilities` (Admin Users render gate) and `/api/admin/user-access` (suspend/reactivate). Token handling is correct (access token in `sessionStorage`, refresh token in memory, no tokens in `localStorage`). `[CODE]`
3. **eCIgn signing enforcement runs on client-asserted identity.** The eCIgn server enforces real gates (slot order, eligibility, self-approval block, duplicate block, all-required-signers gate, hash chain, lock manifest, void tier ≥ 4) but keys them off client `x-user-*` headers; signer **tier defaults to 4** when absent; MFA step-up mints a ULID and treats presence of any `x-mfa-token` as verification; an instance with an **empty `required_signers` set bypasses all eligibility checks**. `[CODE]`
4. **Nine person models; durable join = email only.** Cognito `DemoUser`, `RegistrationRecord`, server `AppIdentityUser`, client `User`, session `Actor` (identities) + `JourneyEmployee`, `UserSetupAssignment`, `WorkforceMember`, approved-users CSV row (profiles). The client↔server identity-registry sync API methods are defined but have **zero call sites**; the admin UI edits localStorage, never the server registry. `AppIdentityUser` id flips between `auth:<provider>:<sub>` and `email:<email>` by creation path (duplicate hazard). `[CODE]`
5. **Four role vocabularies across three unconnected signing engines** (client one-click E1, server per-document E2, journey/Appendix-F E3). The forms-library `signers[]` catalog is display-only and is **never wired** into enforced `required_signers`. Alias table is lossy (`witness/administrator → Administrator`, `chair → QAPI Lead`, `medical director → Clinical Reviewer`); `roleKey.ts` folds `admin`/`super_admin` together at lock time. `[CODE]`
6. **Cloud narratives conflict; targets are not built.** AWS/DynamoDB/S3/EventBridge/Lambda/WORM/object-lock/OPA/global-PDP and Firebase-Auth appear only as design/history; the tactical runtime is Cognito on GCP Cloud Run. Firestore is an opt-in, inactive audit adapter (JSONL is default). Only 2 of ~15 referenced docs exist in-tree; the `Builder/` corpus was deleted in `e93ff0bb` and survives only in history. `[HIST]` / `[DOC]`
7. **Access-review cadence — corrected.** `CO-DG-101 §4.2` in the supplied policy corpus mandates **annual review of role-based PHI access profiles.** Current GitHub policy authority and generated-source currency must be verified at implementation start. No reviewed source establishes a universal **quarterly** cadence for all security roles, page visibility, signature authority, privileged access, or delegation. `[DOC — AUTHORITY REQUIRES CONFIRMATION]` — relabel `[CODE/DOC — CURRENT POLICY]` if CO-DG-101 §4.2 is present and active in the current GitHub policy source at implementation start; otherwise keep as-is. Do not claim that no document contains a cadence.

---

## 2. Decision

### 2.1 AccountLifecycleService (orchestrator), not registry-as-authority

`AppIdentityRegistry` is the **canonical application-identity projection** — it does not independently own Cognito, registration, and audit. A logical `AccountLifecycleService` **orchestrates the lifecycle decision**; each subsystem remains authoritative for its own state (Cognito ← enable/disable; DynamoDB ← registration status; canonical registry ← application status; audit ← intent/completion; reconciliation ← partial-failure recovery).

States: `pending · activating · active · suspending · suspended · reactivating · disabled · reconciliation_required`.

The system makes **no distributed-transaction / atomicity claim** across Cognito, DynamoDB, the JSONL audit ledger, and the canonical registry. Every transition is idempotent, versioned, and reconcilable.

### 2.2 Lifecycle decision table (exact semantics)

**Error semantics (normative):**
- Missing / malformed / expired / invalid-signature / wrong-issuer / wrong-audience token → **`401`**.
- Valid provider identity whose application account is not authorized for the requested action → **`403`** with a stable, non-sensitive application `reasonCode`.
- Error bodies must not disclose provider internals, Cognito subject, token details, or whether an unrelated email exists.

| State | Login / token issuance | Refresh | `/api/auth/me` | Capabilities | Explicit self-service | Business APIs | Page visibility | Sign / approve | Admin mutation |
|---|---|---|---|---|---|---|---|---|---|
| `pending` | Allow only after verified provider auth **and** completed account setup | Allow while provider + registration valid | `200` limited canonical identity, `accountStatus=pending` | No business/admin capabilities | Only an explicit server allowlist: onboarding, profile-completion, logout, approved self-service | `403 ACCOUNT_PENDING` | Only self-service/onboarding routes | Deny | Deny |
| `activating` | Deny normal login until activation transaction completes | Deny | No ordinary `/me`; activation-status only via the activation workflow | None | Activation workflow only | Deny | None | Deny | Reconciliation operators only |
| `active` | Allow | Allow | `200` full safe identity projection | Server evaluated | Allow per permissions | Server evaluated | Server projected | Server evaluated | Server evaluated |
| `suspending` | Deny new login / token issuance | Deny | `403 ACCOUNT_SUSPENDING` for a still-valid token | None | Logout + authorized reconciliation diagnostics | Deny | None | Deny | Reconciliation operators only |
| `suspended` | Deny | Deny | `403 ACCOUNT_SUSPENDED` for a still-valid token | None | Logout only | Deny | None | Deny | **See suspended-row clarification below** |
| `reactivating` | Deny until Cognito, registration, canonical state, and required audit evidence all agree | Deny | `403 ACCOUNT_REACTIVATING` or a narrowly scoped operational status response | None | Logout only | Deny | None | Deny | Reconciliation operators only |
| `disabled` | Deny | Deny | `403 ACCOUNT_DISABLED` for a still-valid token | None | Logout only | Deny | None | Deny | Deny |
| `reconciliation_required` | **Deny globally** | **Deny** | `403 ACCOUNT_RECONCILIATION_REQUIRED` or a safe operational status response | None | Logout only | Deny | None | Deny | Reconciliation operations only |

**Suspended-row Admin Mutation clarification (mandatory, recorded verbatim):**

> Denied for the suspended principal. A separate active lifecycle administrator with server-authoritative permission may manage the suspended user as the target.

A suspended or disabled administrator must never retain authority merely because they previously held a role, group, capability, or approved-email designation.

**Additional normative rules:**
- The `pending` self-service allowlist is **enumerated in server code**; it may never be inferred from route names.
- `pending` never grants ordinary business access merely because authentication succeeded.
- Reactivation does not become `active` until every required subsystem **and** the completion audit agree.
- `reconciliation_required` is a **global, fail-closed** state — not a degraded-active state.
- A browser-visible route must never override this table.
- Existing access tokens need not disappear from the browser, but **every protected server request enforces current lifecycle state.**

### 2.3 Transition protocol

Every lifecycle mutation documents: preconditions · first durable record written · provider operation · registration operation · canonical-projection operation · completion event · retry behavior · idempotency key · version check · reconciliation owner · operator-visible status. Suspension (representative):

```
Validate actor + target
→ write suspension INTENT (durable, idempotency key, version)
→ mark canonical 'suspending'
→ Cognito AdminDisableUser
→ revoke provider sessions where supported
→ update registration status
→ update canonical projection
→ write COMPLETION event
→ mark 'suspended'
```

A partial failure **never returns ordinary success**. It returns a typed `reconciliation_required` result with a correlation ID and is owned by the reconciliation queue. This is **not** a distributed transaction.

### 2.4 Canonical identity + reconciliation contract

Immutable `CanonicalUser.userId` (ULID, assigned once). Email is **normalized, policy-unique, mutable — an address/alias, never the primary key.** Join via provider binding.

```ts
CanonicalUser.userId          // immutable application id (ULID)
IdentityProviderBinding       // (provider, subject) → userId   [replaces email-join]
OrganizationalProfile.userId; JourneyEmployee.userId
WorkforceMember.userId; AuditActor.userId; SignatureAuthority.userId

type IdentityReconciliationStatus =
  | 'verified' | 'candidate_match' | 'conflicting' | 'duplicate'
  | 'orphan_provider_binding' | 'orphan_domain_profile'
  | 'manual_review_required' | 'resolved';
```

Reconciliation record carries: candidate canonical userIds · provider binding · legacy ids (`usr-*`/`EMP-*`/`WM-*`) · normalized-email evidence · employee ids · source systems · confidence · conflict reason · adjudicating actor · resolution · timestamp/version.

**Hard rules:** never merge on email alone; never automatically reuse a prior employee's canonical identity when the email is reassigned; preserve plus-tagged addresses distinctly unless an approved identity policy says otherwise; enforce unique `(provider, subject)`; one provider identity may not bind to multiple canonical users. Email matches enter the reconciliation queue for adjudication — they do not auto-merge.

### 2.5 Authorization decision contract + precedence

Precedence (fixed order):

```
account-status / global deny
  → policy / separation-of-duties deny
    → scoped security-permission allow
      → optional page-visibility projection
```

```ts
interface AuthorizationDecision {
  allowed: boolean; decisionId: string; principalUserId: string;
  action: string; resource: { type: string; id?: string };
  scope?: { organizationId?: string; branchId?: string };
  reasonCode: 'ACCOUNT_NOT_ACTIVE' | 'POLICY_DENY' | 'SEPARATION_OF_DUTIES'
    | 'MISSING_PERMISSION' | 'SCOPE_MISMATCH' | 'ASSIGNMENT_EXPIRED'
    | 'ALLOWED_BY_GROUP' | 'ALLOWED_BY_DIRECT_GRANT';
  sources: AuthorizationSource[]; evaluatedAt: string; policyVersion: string;
}
```

The UI may **explain** a decision but must never independently reconstruct it. Three concepts remain distinct: **permissions** (business operations), **capabilities** (admin/product functions), **page visibility** (nav projection).

### 2.6 Page access is a projection (never a plane)

Server permissions authorize operations; the page-access projection only describes which UI pages make sense for the user. Every API authorizes independently. Hiding a page is not security; showing a page grants no mutation authority. Explicit overrides may **restrict/hide**, must **never manufacture** a permission that does not exist, and must never bypass a policy deny or account suspension.

### 2.7 Signature model

Four separated objects; the actual signature record references all three predecessors:

1. **Signature-role definition** (canonical catalog).
2. **SignatureAuthorityAssignment** (canonical user, capacity, basis, scope, effective dates, prerequisites, delegation, revocation).
3. **SignatureRequirement** — *snapshotted at workflow/form-instance creation* so later catalog edits cannot retroactively change who was required to sign an existing record.
4. **Signature record** — bound to the verified actor.

```ts
interface SignatureRequirement {
  requirementId: string; workflowInstanceId: string; stageId: string;
  workflowRole: WorkflowParticipationRole; signatureCapacityId: string;
  assignmentMode: 'named_user' | 'authority_pool' | 'supervisor_relationship'
    | 'organizational_office' | 'delegated_authority';
  scope: SignatureScope; prerequisites: SignaturePrerequisite[];
  separationOfDuties: string[];
  requirementSource: { type: 'form' | 'workflow' | 'policy' | 'governance_action'; id: string; version: string };
  createdAt: string;
}
```

Two axes reconciled and kept separate: **workflow participation role** (Assignee / Required Signer / Approver / Reviewer / Watcher / Administrator / Auditor) vs **business/legal signature capacity** (DON, Administrator, Compliance Officer, Governing Body Chair, Supervisor, clinician disciplines, employee-acknowledgment signer, witness). A person may hold both simultaneously (e.g., `workflowRole = Required Signer`, `signatureCapacity = Director of Nursing`). The server derives and validates both; the browser asserts neither.

- **Catalog source:** derived from actual forms, workflows, policies, and current eCIgn definitions — **never** from job title, discipline label, profile role, localStorage role, or a form's free-text signer label. Unknown aliases **fail closed**. The QAPI signer set (DON / Administrator / Compliance Officer / Governing Body Chair) is a concrete **acceptance scenario only**, not the universal catalog.
- **E1 one-click signing is deprecated** as an authoritative signature path; low-risk use is permitted only as a clearly-labeled acknowledgment / confirmation / workflow response. Anything represented as a legal or operational signature routes through the server-authoritative engine.
- **MFA honesty:** integrate a real verified step-up signal, or record `authenticationMethod: 'password' | 'session'` and `mfaVerified: false`. Never represent a generated identifier as verified MFA.

### 2.8 Enterprise audit envelope

One enterprise audit **contract** (not an immediate physical-ledger merger). The eCIgn hash chain remains a specialized domain ledger, referenced via `domainEvidenceRef`.

```ts
interface EnterpriseAuditEvent {
  eventId: string; eventType: string; occurredAt: string;
  actorUserId?: string; targetType?: string; targetId?: string;
  action: string; result: 'success' | 'denied' | 'partial' | 'failed';
  reasonCode?: string; correlationId: string; idempotencyKey?: string;
  objectVersion?: number; beforeHash?: string; afterHash?: string;
  domainEvidenceRef?: string;
}
```

Durable audit is required for: successful privileged mutations; partial lifecycle transitions; signature creation and voiding; role/page/signature-authority changes; delegation; suspension/reactivation. Security **denials** flow through the established security-event path with rate controls so an attacker cannot flood the primary audit ledger.

### 2.9 Persistence capability contract + runtime guard

```ts
interface PersistenceCapabilities {
  singleInstanceDurable: boolean; crossProcessSafe: boolean; multiInstanceShared: boolean;
  compareAndSet: boolean; idempotentMutations: boolean; durableMutationIntent: boolean;
  appendOnlyAudit: boolean; productionAuditEligible: boolean;
}
```

High-risk mutations **verify required capabilities before executing.** This matters even in development because Cloud Run may run more than one instance. Until an adapter is multi-instance safe, the runtime must choose exactly one of: force a single mutation-capable instance for controlled UAT · disable high-risk mutations · use a shared durable adapter already present in the repository. The UI must not offer role, suspension, page-access, delegation, or signature-authority mutations on an adapter/topology that cannot safely coordinate them. **JSONL remains the development default** but does not become multi-instance-safe merely because production release is deferred. Firestore stays inactive; no new backend is introduced in this lane.

### 2.10 Impact preview

Before any high-risk access or signature-authority change is saved, the server provides a mutation-free, server-derived preview: current vs proposed effective access · permissions gained/lost · pages changed · signature capacities changed · open signing tasks affected · separation-of-duties conflicts · final-admin risk · scope impact. Endpoint: `POST /api/admin/access-control/changes/preview` (performs no mutation).

### 2.11 Access-review cadence (configurable, policy-owned)

- **PHI minimum-necessary access profiles: at least annually** when CO-DG-101 §4.2 is current authority (§1, finding 7).
- Review may occur more frequently based on risk or policy.
- Privileged access, signature authority, and delegation cadence remain policy-owned unless another current policy establishes a specific interval.
- **Event-triggered review is required** after: hire/activation, transfer, role/discipline change, branch/department change, supervisor change, leave, suspension, reactivation, termination, license/competency lapse, delegation creation/expiration, security incident, audit finding.

```ts
interface AccessReviewCampaign {
  campaignId: string; scope: string;
  reviewType: 'phi_access_profile' | 'security_access' | 'page_access'
    | 'signature_authority' | 'delegation' | 'privileged_access';
  startsAt: string; dueAt: string; requiredReviewers: string[];
  policyBasis: string;                 // REQUIRED — no campaign may be scheduled without it
  trigger: 'scheduled' | 'role_change' | 'supervisor_change' | 'organizational_change'
    | 'license_or_competency_change' | 'suspension_or_reactivation' | 'termination'
    | 'incident' | 'audit_finding';
}
```

The system may not schedule a review campaign without a named `policyBasis`. Quarterly review is not hard-coded as a software preference.

### 2.12 Data classification & safe projections

Fields are classified `public-workforce · internal · confidential-HR · security-sensitive · PHI-adjacent · credential/provider-internal`. Raw Cognito subject and provider-internal fields are never exposed in normal UI responses or persisted to localStorage; admin projections expose display identity + canonical userId only.

---

## 3. Approved decisions (locked)

1. **Suspension = full lifecycle orchestration** — Cognito (`AdminDisableUser`) + registration + canonical + capabilities + protected routes + page access + signing + delegation + workflow approvals + audit/reconciliation. Canonical-only is not suspension.
2. **E1 one-click signing deprecated** as authoritative; low-risk use only as labeled acknowledgment.
3. **Client `ci.identityRegistry.v1` → read-through presentation cache**, then gradual removal: server projection → client shadow → local decisions disabled → sensitive fields removed → cache/logout cleanup → eventual removal. Remove raw Cognito subject from localStorage as early as safely possible.
4. **Reuse existing persistence abstractions; no new backend this lane** — subject to the §4 release blocker.
5. **Signature catalog derived from forms/workflows/policies/eCIgn** — never job titles; QAPI set = acceptance case only.
6. **MFA honesty** per §2.7.

---

## 4. Release blocker

No production-readiness claim until account lifecycle, assignments, page access, and required audit evidence run on a persistence adapter proven to provide **multi-instance-shared-durable** consistency (idempotency + compare-and-set/versioning + duplicate-event detection demonstrated). JSONL and host-local `.cache` files are development-eligible only. This does not require activating Firestore in this lane.

---

## 5. Architecture diagrams

**Current state (as-is):**

```
SERVER-AUTHORITATIVE (works today):
  Cognito token → getCurrentUser → Plane A (DynamoDB registration)  [login/refresh/me]
                → evaluateUserStatusAuthority ← Plane B (canonical)  [capabilities + user-access; deny-first]
                → resolveServerActor (business routes: Plane B must be ACTIVE)

BROWSER-AUTHORITATIVE (defect):
  ci.identityRegistry.v1 → authorize()/featureAccess/nav      (RBAC)
  ci.pageAccess.v1       → canViewPage/canWritePage           (page)
  __demo_user_role       → RoleGate                           (role injection)
  hhc_actor_id/role      → evidence & workflow writes         (actor)
  ci_ecign_signer_v1 → x-user-* headers → eCIgn server gates  (E2; tier defaults 4)
  ci-journey-v1          → Appendix-F signatures (free-text)  (E3)
```

**Target (to-be):**

```
[Cognito / IdP]
   → [Authentication & Session Boundary]   (verified token only; x-user-* ignored)
   → [AccountLifecycleService]             (§2.1–2.3 state machine + reconciliation)
        ├─ [Organizational Profile]
        └─ [Authorization Control Plane]
              ├─ [Security Groups] [Scoped Permissions] [Page Access (projection)]
              └─ [Effective Access Evaluator] → AuthorizationDecision (§2.5)
                    ├─ [Admin Capabilities]
                    └─ [Signature Authority]  (catalog · assignments · requirement snapshot · delegation)
                          → [eCIgn Signing Enforcement (verified actor)]
                                → [Enterprise Audit envelope] ←→ [eCIgn hash-chain ledger]
```

---

## 6. Source-of-truth matrix (target)

| Concern | Current source | Current enforcement | Target source |
|---|---|---|---|
| Authentication identity | Cognito (verified token) | `resolveVerifiedIdentity`; `x-user-*` ignored on `/api` | Verified token everywhere incl. eCIgn |
| Registration/account status | DynamoDB `RegistrationRecord` | login/refresh/`/me` | Folded into AccountLifecycleService |
| Canonical identity | `AppIdentityRegistry` | business routes, capabilities, user-access | Canonical projection; sole app-status authority via lifecycle service |
| Organizational profile | `UserSetupAssignment` (client) | none | Server org-profile on canonical user |
| Security groups | client `ci.identityRegistry.v1`; partial server `AppRoleAssignment` | client `authorize()` | Server scoped assignments + evaluator |
| Permissions | `permissionCatalog` via client groups | client-only | Server effective-permission evaluator (explained) |
| Page access | `ci.pageAccess.v1` + hardcoded emails | client; server persists blob | Server projection w/ deny reasons |
| Admin capabilities | `manageUsers`/`manageUserStatus` | server (shared evaluator) | Granular server capability set |
| Workflow participation roles | eCIgn perm roles + SoD pairs + PM watchers | E1 client / E2 client-headers | Canonical workflow-role enum, server-derived |
| Signature capacities | `SignerRole` (29) + aliases + journey enum + free-text | E2 tier gates on client identity; E3 HRDirector-only | Canonical catalog + per-form requirement derivation |
| Signature assignments | none (role-string ⇒ authority) | none | `SignatureAuthorityAssignment` records |
| Supervisor relationship | 3 disjoint graphs (`usr-*`/`EMP-*`/`WM-*`) | none | Single relationship on canonical user |
| Delegation | none | none | Bounded, scoped, expiring, audited records |
| Onboarding/competency | setup + journey + onboarding-v2 (client) | client | Domain profiles keyed to canonical user |
| Audit/change history | JSONL + eCIgn chain + 2 demo localStorage audits | partial; several privileged mutations unaudited | One enterprise envelope + eCIgn chain |

---

## 7. Person-model reconciliation (summary)

**Identities:** Cognito `DemoUser` (auth principal), `RegistrationRecord` (state → merge into lifecycle), server `AppIdentityUser` (canonical — keep, stabilize id to ULID), client `User` (demote to cache), session `Actor` (projection). **Domain profiles:** `JourneyEmployee`, `UserSetupAssignment`, `WorkforceMember`, approved-users CSV row. Durable cross-key today = email only. Target: one canonical user ← provider binding `(provider, subject)`; registration status folds into lifecycle; domain profiles key by canonical id; client registry becomes a read-through cache. **No fourth identity is created.**

---

## 8. Implementation phases (seven, sequential, gated)

The ADR is the pre-implementation gate. One accountable owner; re-fetch GitHub before each phase; stop if the target moved; reviewable commits; defined acceptance criteria + rollback; stop at each exit gate; no new runtime backend without separate approval; JSONL default; Firestore inactive; Drive/Calendar unchanged; no live-user mutation during development; no production deployment; fail closed on unknown role/alias/status; feature-flag incomplete surfaces.

| # | Phase | Internal subgates | Exit gate |
|---|---|---|---|
| **1** | **Security containment** (independently reviewable + deployable; see §8.1) | — | unsafe header-identity, default-privileged tier, empty-signer bypass, browser-actor stamping, and mock-MFA all contained; unsafe route unavailable when a verified actor cannot be derived |
| **2** | Account lifecycle (§2.1–2.3) + full suspension orchestration + reconciliation | — | suspended user denied at every layer; layers agree; no browser enforcement |
| **3** | Authorization / effective access | 3A group+permission contracts · 3B evaluator+explanations · 3C granular capabilities+mutation boundaries · 3D versioning/concurrency + final-admin/self-elevation guards | server explains every decision; client cannot elevate |
| **4** | Page-access projections + control-plane read APIs | — | every page decision server-derived, explainable, non-authorizing |
| **5** | Signature authority + eCIgn enforcement | 5A catalog+alias (read-only, fail-closed) · 5B assignments+coverage · 5C verified-actor enforcement (replaces Phase-1 shim) · 5D prerequisites+delegation+SoD · 5E legacy migration + unsafe-route retirement | label-only cannot sign; wrong stage/scope/suspended/expired denied |
| **6** | Admin UI (§9) + reconciliation workflow + impact preview (§2.10) | — | concepts separated; all mutations server-authorized + audited |
| **7** | Migration / hardening / release readiness | — | `READY — ADMIN CONTROL PLANE RELEASE REVIEW` |

### 8.1 Phase 1 — security-containment hotfix sequencing

Executed by the same single implementation agent, sequentially:

- **A — Persist the ADR first (this commit).** Create `feat/admin-access-signature-authority` from the current remote target HEAD in a separate worktree; commit only this ADR + diagrams: `docs(architecture): record admin control-plane ADR`. Do not begin broad implementation on that branch yet.
- **B — Execute containment separately.** Create `fix/ecign-server-identity-containment` from the current remote target. Limited to: reject client-asserted signer identity + tier in non-demo runtime; remove privileged default signer tier; fail closed when signatures are required but the required-signer definition is absent/empty; derive evidence + workflow actors from the verified session; record truthful authentication + MFA metadata; make the signing route unavailable when a verified actor cannot be derived; targeted tests + focused docs. **Excludes** the full signature catalog, authority-assignment UI, account-lifecycle redesign, page-access migration, Admin Users redesign, delegation architecture, and broad persistence migration. Independently reviewable, testable, mergeable, deployable, reversible. Recommended commit: `fix(ecign): enforce verified signer identity`. Stop for containment review; do not deploy automatically.
- **C — Reconcile the feature branch.** After the containment hotfix is reviewed and merged into the target: fetch updated target; merge updated target into `feat/admin-access-signature-authority`; do not rebase or force-push published history; resolve conflicts visibly; re-run the architecture consistency check; continue with Account Lifecycle (Phase 2) only after the containment exit gate passes.

---

## 9. Admin UI information architecture

`/admin/users/:userId` → **Overview · Account & Organization · Access** *(groups / effective permissions / page visibility / admin capabilities)* **· Signature Authority** *(capacities / scope / delegation)* **· Onboarding & Competency · Audit History**.

Global aggregate pages → `/admin/access-review · /admin/signature-coverage · /admin/reconciliation`.

The signature-coverage matrix and orphaned-identity / excessive-privilege reconciliation are enterprise views, not individual-user tabs.

---

## 10. Non-goals (this lane)

- No new runtime persistence backend (no AWS/DynamoDB/S3/EventBridge/Lambda/WORM/object-lock/OPA/global-PDP); no Firestore activation.
- No Drive/Calendar changes.
- No production deployment; no live-user mutation during development.
- No rewrite of policy content; access-review cadence remains policy-owned.
- No merger of the four audit ledgers into one physical store on day one (common envelope only).

---

## 11. Governance & process constraints

- One primary implementation agent; sequential phases; each phase re-verifies the remote baseline before starting and stops at its exit gate.
- Merge, deployment, and production remain **not authorized** beyond the explicit per-phase gates.
- eCIgn containment implementation is authorized **after** this ADR commit is pushed.
- Broad account-lifecycle / control-plane implementation is **not** authorized beyond the phase gates.

---

## 12. Approval record

- `READY — CONTROL-PLANE ARCHITECTURE REVIEW REQUIRED` — Phase-A review (five-agent inventory).
- `READY — FINAL CONTROL-PLANE APPROVAL REQUIRED` — after the three text corrections (policy cadence, lifecycle semantics, containment hotfix lane).
- **`APPROVED — CONTROL-PLANE ARCHITECTURE`** — governing approval, with the mandatory suspended-row wording clarification recorded in §2.2.
