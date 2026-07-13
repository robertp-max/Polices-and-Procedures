# Universal Mandated-Event Packet Platform — Implementation Report

**Scope:** PRD Phase 0 + Phase 1 (universal framework + Quarterly QAPI end-to-end; Monthly QAPI via the
same analytical-report archetype). Branch `packet-platform`. This report satisfies PRD §29 #20.

**Status at time of writing:** Waves 0–4 complete and pushed to `origin/packet-platform` @ `53c9b5dd`.
Wave 5 (hardening + this documentation) in progress.

---

## 1. Build orchestration

Multi-model fleet: **Fable 5** orchestrated (dependency DAG, isolated git worktrees, merges, gates,
final acceptance); **GPT-5.5 (codex)** was the implementation worker and fix-on-spot QA; **Grok 4.5**
was available but contended and not used for packets. Every work package built in its own worktree on a
`wp/<id>` branch, gated (scoped `tsc` + `vitest` + lint + file-ownership audit), independently QA'd,
then merged one at a time into `packet-platform`, which was frozen and full-checkpointed per wave and
pushed.

Waves: **0** universal contracts → **1** registries/store/fixture/calendar/architecture-test →
**2** engines (segmentation, KPI, triggers, trends, Drive adapter, eCIgn envelope, renderer, /api/packets)
→ **3** QAPI model + Studio UI + editing + Add-Info + Brad + trigger endpoints → **4** approval/signing/
signed-package/publish/certify/lock + prior-QAPI + charts + §24 e2e → **5** hardening + docs.

## 2. Source-of-truth decisions (per PRD §8, §28)

- Packet metadata persists server-side (`server/packets/store.ts`, file_local seam mirroring
  `cesMetadataStore`), never browser-only. PHI/bytes stay out of the metadata store (forbidden-field guard).
- CES remains authoritative for event/workflow execution state; the packet platform **links** to CES
  workflow instances and never mutates CES state (§8.2). CES reconciliation is an unresolved §28 item.
- Google Drive publication implemented against a **governed local adapter** behind the
  `PacketDriveConnector` contract (real Drive is a drop-in later). Deterministic §19.4 hierarchy + five
  sidecars + sha256 + idempotent publish + §14 prior-period lookup.
- eCIgn: a packet-level `PacketEnvelope` orchestrates the **existing** eCIgn subsystem; eCIgn internals
  (state machine, hash chain, integrity) were extended only additively.
- Rendering unified on the Patient Admission Packet design tokens via a rendering-profile registry;
  `renderQapiPacketHtmlFromRollup` preserved as a model-building shim (no bespoke renderer).

## 3. APIs added (`/api/packets`, `/api/packet-templates`, `/api/qapi/*`)

Templates + calendar readiness; packet lifecycle (create-idempotent/get/patch-optimistic-concurrency/
validate/return/approve/reject); sources + supplemental (FR-019 lifecycle) + edits + diff; Brad
propose/accept/reject; workflow-trigger confirm/reject/activate/link-existing; approval readiness;
eCIgn prepare/send/remind/void/status; signed-package; publish/certify/lock/amend/supersede; prior-QAPI
period/snapshot/compare. All mutations emit hash-chained audit events; stale-version writes rejected;
client-supplied hashes never trusted.

## 4. Trigger rules & workflow resolution (FR-012/013/014/015)

Canonical resolution against `WORKFLOWS`/`WORKFLOW_GRAPH`; 12 decision states (exact PRD strings);
keyword similarity yields a *candidate* only, never auto-activation; `WORKFLOW UNRESOLVED — HUMAN
CONFIGURATION REQUIRED` fail-closed. FR-014 activation idempotency key
(`agency + reporting_period + finding + trigger_rule + canonical_workflow`); dedup against existing
active workflows (no new PIP per quarter for the same root). Personnel review states
`Personnel-review threshold met` only — never asserts discipline. **Validation correctness fix (Wave 4):**
missing-feeder / missing-form is a packet-approval blocker only for `ACTIVATED` /
`LINKED TO EXISTING ACTIVE WORKFLOW` / `CONTINUED FROM PRIOR PERIOD` evaluations; candidate/pending/etc.
are recorded in the register (FR-013) without blocking approval; `BLOCKED` / `WORKFLOW UNRESOLVED` retain
their own dedicated blockers.

## 5. Forms generated (FR-016)

Canonical form instances resolved from the forms library; no empty-shell-marked-complete; conditional
forms only when a trigger validates; annual cadence not injected into quarterly packets; confidential
personnel content confined to a restricted addendum reference (id/sha256/classification/custodian/
reviewer/status/related-finding-ids only) per §13.4/§20.2.

## 6. Tests & results (against frozen `53c9b5dd`)

- packets typecheck: **0 errors**; `tsc -b` + production build: **PASS**.
- Frontend packet suites (contracts, registries, sources, KPI, triggers, trends, render, qapi, validation,
  editing, testing, event-selector, workspace, template selector): **259 passed**.
- Server packet suites (store, lifecycle, drive, envelope, routes, approval, ecign, signedPackage,
  publication, qapiPrior, signing, supplemental, brad, workflowTriggers, readiness): **95 passed**.
- **§24 Q1-2026 end-to-end acceptance: 2/2 PASS** — full lifecycle (segment→KPIs→triggers→trends→model→
  forms→validate→approve→envelope→signed package→local publish→certify→lock→amendment→regenerate) with
  every §24 count asserted, plus a Q2-contamination guard that fails closed if any Q2 segment enters the
  Q1 model.
- Architecture (§25.6, no-bespoke-renderer / domain-purity): **25 passed**.
- Coverage report: **70 event families mapped, 0 unmapped, 14 gap** (P0/P1/P2 families intentionally
  registry-only this release).
- Packet-namespace lint: **0 errors**; `/evidence` guard intact (Defensible2Studio wiring preserved).

## 7. Remaining blockers / carry-forwards

- **codex workspace-write outage (environment, not code):** Windows error 1312 (logon-session teardown)
  disables the GPT-5.5 *edit* fleet; needs a Windows relogin/reboot. Read-only QA unaffected.
- **Deferred UI (WP-4.9 back half):** the approval→signing→publish/lock Studio *UI steps* in
  `PacketStudioScreen` are not built; deferred to a GPT-5.5 UI lane. Required for the Appendix B browser
  demo, not for platform logic (proven by the §24 e2e via services).
- **Wave 5 remaining:** WP-5.1 §25 coverage-traceability audit + gap-filling tests; WP-5.2 architecture-
  test finalization (recurring-occurrence-overwrite, workflow-instance-linkage, open-gates rules).

## 8. Unresolved §28 decisions (surfaced, NOT guessed)

1. Google Workspace/Drive tenancy, BAA, folder ownership, PHI classification (local adapter used meanwhile).
2. Canonical signed-byte storage (object store vs Drive vs both).
3. Administrator/DON **dual-capacity** signer policy (registry carries a deny-by-default rule flagged
   `needs-product-approval`).
4. Retention periods by archetype (lock-policy placeholders flagged `needs-product-approval`).
5. Which warnings may be accepted at final approval; which missing-prior conditions are blockers vs limitations.
6. CES ↔ packet workflow-instance reconciliation path.

## 9. Deliverables index (PRD §29)

Registries (#1,4,5,6–10) `src/policy/packets/registries/*`; template/event-map/coverage (#2,3,11,12)
+ `COVERAGE_REPORT.md`; module/rendering framework (#13 → `ARCHITECTURE.md`); migration plan (#14 →
`MIGRATION_PLAN.md`); P0/P1/P2 backlog (#15 → `BACKLOG_P0_P1_P2.md`); architecture test (#16)
`src/policy/packets/architecture/*`; Quarterly QAPI e2e (#17) + Q1 fixture (#18)
`src/policy/packets/testing/*` + `fixtures/packets/qapi/*`; visual evidence (#19)
`scripts/packetVisualEvidence.ts`; this report (#20).
