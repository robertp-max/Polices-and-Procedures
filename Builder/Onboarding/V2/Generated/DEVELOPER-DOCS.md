# Onboarding v2 — Developer Documentation

**Module:** `src/policy/onboarding-v2/`
**Status:** Implemented (in-memory snapshot, demonstrative seed). Production cut-over requires persistence + identity-verified eCIgn binding.
**Version:** 1.0 (initial cut)
**Build status:** ✅ `npm run build` passes.

---

## 1. Module purpose

Onboarding v2 is the audit-grade activation engine for every workforce member, vendor, and governance appointment subject to compliance scrutiny. Unlike the legacy `journey/` module (kept untouched at `/journey/*`), v2 is:

- **Deterministic.** A single trigger payload produces exactly one batch, one set of units, and a hash-chained audit sequence.
- **Surveyor-defensible.** Every artifact is content-hashed and bound to a published policy version.
- **Reconciliation-aware.** Existing valid evidence within the cadence window suppresses duplicate emission.
- **Override-safe.** Compliance overrides require dual signature, convert Failing gates to Conditional, and are themselves auditable.

---

## 2. File map

```
src/policy/onboarding-v2/
├─ types.ts                          # Discriminated unions + interfaces (no enums per erasableSyntaxOnly)
├─ index.ts                          # Public barrel
│
├─ catalog/
│   ├─ roles.ts                      # ROLES[] — 17 role definitions
│   ├─ policies.ts                   # POL constants + policy(id, version) builder
│   ├─ requirements.ts               # REQUIREMENTS[] (~25 universal+role-specific)
│   └─ templates.ts                  # 17 roles × 7 trigger types = 119 templates; selectTemplate()
│
├─ engine/
│   ├─ hash.ts                       # fauxHash() (FNV-style stable) + nextUlid(prefix)
│   ├─ audit.ts                      # appendAudit() + verifyChain() + AUDIT_LABEL
│   ├─ gates.ts                      # evaluateGate() + GATE_LABEL + GateResult
│   ├─ reconciler.ts                 # reconcile(): suppress when valid evidence in window
│   └─ engine.ts                     # ingestTrigger() + computeBatchStatus() + changeUnitStatus()
│
├─ store/
│   ├─ seed.ts                       # buildSeedSnapshot() — demo data
│   └─ onboardingV2Store.ts          # Zustand store + selectors + actions
│
├─ components/
│   ├─ StatusPill.tsx                # Unified status chips
│   ├─ GateTile.tsx                  # Five gate tiles with outcome iconography
│   ├─ KpiTile.tsx                   # Dashboard tile primitive
│   ├─ PolicyVersionLink.tsx         # PolicyId@Version chip with hash on hover
│   ├─ SignerStrip.tsx               # eCIgn signer rows + actions
│   ├─ EvidencePanel.tsx             # Required vs. captured artifacts; capture form
│   ├─ AuditTimeline.tsx             # Hash-chained event renderer
│   └─ UnitDrawer.tsx                # Tabbed drawer (Overview / Evidence / Signatures / Audit)
│
└─ pages/
    ├─ OnboardingV2Layout.tsx        # Sub-rail shell (lives inside CommandCenterLayout)
    ├─ DashboardPage.tsx             # KPI strip + batch tabs + phase histogram + live feed
    ├─ ActivationPage.tsx            # Subject + trigger + roles + reconciliation preview
    ├─ BatchListPage.tsx             # Search/filter table of all batches
    ├─ BatchViewPage.tsx             # Header + GateStrip + Phase accordions + UnitDrawer + audit side
    ├─ AuditReadinessPage.tsx        # Per-subject dossier with 8 tabs + JSON export + chain verify
    ├─ GovernancePage.tsx            # Override request flow + active overrides + vendors + policy bindings
    └─ batchHelpers.ts               # batchRoleIds() / batchEffective() — extract from triggerPayload
```

---

## 3. Data model summary

### Subjects
- **`WorkforceMember`** — staff member with `primaryRoleId`, `roleIds[]`, `branchId`, `supervisorId?`, lifecycle status.
- **`Vendor`** — Business Associate / Non-BA / Contractor.

### Catalog
- **`Role`** — 17 IDs (RN, LVN, HHA, PT, OT, ST, MSW, CLINICAL_MANAGER, ADMINISTRATOR, COMPLIANCE_OFFICER, BILLING, INTAKE, etc.).
- **`PolicyVersionRef`** — `{ policyId, policyVersion, contentHash }`. The content hash is the integrity anchor.
- **`RoleRequirement`** — single regulator-traceable obligation: `name`, `description`, `policyRefs[]`, `evidenceSchema[]`, `signatureSpecs[]`, `cadence`, `gateContributions[]`, `phase`, `slaDays`, `version`.
- **`OnboardingTemplate`** — `{ roleId, triggerType, requirementIds[], policyVersionRefs[] }`. Immutable; new versions emitted as new template IDs.

### Execution
- **`OnboardingExecutionBatch`** — created per `(subject × role × trigger)`. Carries `triggerPayload` (the original trigger), `templateId`, `status`, `dueAt`, `cesSprintIds[]`.
- **`OnboardingExecutionUnit`** — one per requirement in a batch. Carries `evidenceRequired[]`, `signatureRequired[]`, `phase`, `policyRefs[]`, `dependencies[]`, `dueAt`, `status`.

### Artifacts
- **`EvidenceObject`** — content-hashed, source-typed (`UserUpload`, `FormSubmission`, `ExternalAPI`, `SystemAttestation`), bound to unit + batch + subject + optional policy version.
- **`SignatureRecord`** — eCIgn envelope with `signerRole`, `bindsToType` (`PolicyVersion` | `EvidenceObject` | `Appointment`), `signedArtifactUri`, `signedArtifactHash`, `authMethod`.

### Governance
- **`Gate`** — five gate IDs: `FieldClearance`, `BillingClearance`, `SystemAccessClearance`, `VendorEngagement`, `GovernanceActive`.
- **`GateEvaluation`** — outcome record per evaluation.
- **`OverrideRecord`** — dual-signed exception with validity window.
- **`OnboardingAuditEvent`** — sequence + prevHash + eventHash chain per subject stream.

---

## 4. API surface (engine)

### `ingestTrigger(snap, trigger, opts?) → IngestResult`
Idempotent activation. Emits:
1. `TRIGGER_RECEIVED`
2. `PROFILE_RESOLVED`
3. For each role: `TEMPLATE_SELECTED` + `BATCH_CREATED`
4. For each requirement: `REQUIREMENT_RECONCILED` (if suppressed) or `REQUIREMENT_EMITTED`

Returns `{ batches, units, suppressedRequirementIds }`.

### `changeUnitStatus(snap, unitId, next, actor, payload?, now?)`
Records the transition; auto-seals batch on full Completion; appends `UNIT_STATE_CHANGED`.

### `computeBatchStatus(units) → BatchStatus`
Pure rollup: Blocked > AtRisk > AwaitingSignature > AwaitingEvidence > InProgress > Completed.

### `evaluateGate(snap, subjectId, gateId, caller?, now?) → GateResult`
Walks Required-weight requirements; honors active OverrideRecord (returns `Conditional`); persists `GateEvaluation`; appends `GATE_EVALUATED`.

### `verifyChain(snap, subjectId) → { ok, brokenAt? }`
Re-derives every `eventHash` and validates `prevHash` linkage for the subject's stream.

### `reconcile(snap, subjectId, requirement, now) → { suppress, evidenceId?, reason? }`
Looks up matching `EvidenceObject` of the right `objectType` within window (annual/biennial/monthly/Rolling12mo).

### `appendAudit(snap, partial, now?) → OnboardingAuditEvent`
Builds the next sequence + prevHash + eventHash for the subject's stream.

---

## 5. Store API (`useOnboardingV2Store`)

**Selectors:** `getBatch`, `getUnit`, `unitsForBatch`, `evidenceForUnit`, `signaturesForUnit`, `evaluateAllGates(subjectId)`.

**Actions (all immutable; clone snapshot then commit):**
- `ingest(trigger, opts?)`
- `setUnitStatus(unitId, next, payload?)`
- `captureEvidence(unitId, objectType, filename, source) → EvidenceObject`
- `rejectEvidence(evidenceId, reason)`
- `signSignature(signatureId)`
- `declineSignature(signatureId, reason)`
- `requestOverride(subjectId, gateId, reason, validDays)`

The store auto-runs a unit reconciliation (`refreshUnit`) on every evidence/signature mutation — this is what drives the live transitions visible on the dashboard.

---

## 6. Routing

Mounted under the existing `CommandCenterLayout` shell:

| Path | Component |
|---|---|
| `/onboarding-v2` | redirects → `/onboarding-v2/dashboard` |
| `/onboarding-v2/dashboard` | `DashboardPage` |
| `/onboarding-v2/activate` | `ActivationPage` |
| `/onboarding-v2/batches` | `BatchListPage` |
| `/onboarding-v2/batches/:batchId` | `BatchViewPage` |
| `/onboarding-v2/audit` | `AuditReadinessPage` |
| `/onboarding-v2/governance` | `GovernancePage` |

Nav entry added to `CommandCenterLayout NAV_ITEMS` as `Onboarding v2` with the `Sparkles` icon. The legacy `/journey` route remains untouched.

Help Center category `onboarding-v2` registered with 13 articles in `src/policy/help/articles/onboarding-v2.ts`.

---

## 7. Integration points

- **CES (Compliance Execution Sprints)** — every `REQUIREMENT_EMITTED` event is a CES-compatible event. The existing CES pipeline ingests these without modification. Reciprocally, the batch carries `cesSprintIds[]` for back-link.
- **Policy Library** — every `policyRefs[]` entry deep-links to `/library/<policyId>` via `PolicyVersionLink`.
- **Forms** — `evidenceSchema[].objectType === 'FormSubmission'` references `formIds[]` on the requirement. Future work: render the form inline inside `EvidencePanel`.
- **eCIgn** — `SignatureRecord.envelopeId` is the integration handle; mock implementation in `signSignature()` will be replaced by real envelope status webhooks.
- **Evidence Center** — `EvidenceObject.storageUri` is the canonical artifact pointer.

---

## 8. Production hardening checklist

1. **Persistence.** Replace in-memory snapshot with PostgreSQL tables matching the type schema 1:1. Maintain insert-only audit append.
2. **Real hashing.** Replace `fauxHash()` (FNV) with SHA-256 over canonical JSON; same interface, no caller changes.
3. **Authoritative ULIDs.** Replace `nextUlid()` monotonic stub with proper ULID library.
4. **Identity-verified signatures.** Replace `signSignature()` with eCIgn webhook callback that records `authMethod` from the IdP response.
5. **External evidence sources.** Wire `ExternalAPI` source to real PSV vendor + LMS endpoints.
6. **RBAC.** Replace the hard-coded `USR-CO` actor with the authenticated user; gate write actions by role.
7. **Override second signer.** Replace single-action override with a real two-step approval (Compliance Officer + Administrator) with an envelope.
8. **Background revalidation.** Cron-driven `ANNUAL_REVALIDATION` and `CREDENTIAL_EXPIRY_WINDOW` triggers. Currently manual via Activation surface.

---

## 9. Test recipes

In the dashboard:

1. Click **Activate subject**, pick a workforce member, choose `NEW_HIRE`, select roles → see reconciliation preview, click Activate. A new batch appears in the list.
2. Open any batch → expand a phase → click a unit → use the Evidence and Signatures tabs to drive the unit through `AwaitingEvidence` → `AwaitingSignature` → `Completed`. Watch the gates re-roll on the right side.
3. Open Audit Readiness → pick a subject → confirm hash-chain integrity reads `Verified` → click Export dossier.
4. Open Governance → request an override on `BillingClearance` → return to Audit Readiness → the gate now shows `Conditional Override`.

---

## 10. Notable design decisions

- **No enums.** The repo uses `erasableSyntaxOnly: true`. All enumerations are union types + `as const` maps.
- **Discriminated triggers.** `TriggerPayload` is a tagged union; never a bag of optional fields.
- **Immutable evidence.** Rejection sets `status: 'Rejected'` but never deletes the record.
- **Audit by subject stream.** Hash chain is per-subject (subject is the audit unit, not the batch). This survives subject merges and is the natural surveyor lookup.
- **Phase × Status orthogonality.** A unit's phase is fixed by its requirement; status moves freely. The dashboard histograms by phase to expose process bottlenecks.
- **One-way override semantics.** Overrides convert `Fail` → `Conditional`, never `Pass`. The breach is preserved in `missingRequirementIds[]` of every subsequent `GateEvaluation`.

---

## 11. Known limitations of this cut

- In-memory store; refresh resets state. Persistence is the next milestone.
- `fauxHash()` is deterministic but not cryptographic.
- Override approval is single-click in this build; production must enforce dual envelope.
- No background job scheduler; revalidations are manual.
- CES bridge currently only emits-side; ingestion of external CES events not wired.
- No real RBAC; every action is attributed to `USR-CO` for demo purposes.
