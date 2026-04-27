# 10 — Implementation Roadmap

## Purpose

Sequence the build so that compliance enforcement is real from day one. No surface ships ahead of its enforcement.

---

## Sequencing Principle

> Build the engine before the UI. Build the gates before the batches. Build evidence before signatures. Ship enforcement before convenience.

---

## Phase 1 — Data Model

Deliverables:
- Schema for all objects in doc 08
- Migrations
- Seed catalog: Roles, Domains, Cadences, Gates
- Hash-chained audit event store
- Storage for evidence + signed artifacts (immutable, content-addressed)

Exit criteria:
- All objects writable via internal API
- Audit chain verified by replay test
- Evidence/signature stores reject mutation

---

## Phase 2 — Role Requirement Mapping

Deliverables:
- RoleRequirement catalog populated from doc 02 + doc 05
- PolicyVersionRefs hashed and pinned
- Workflow / Form / Competency references linked
- SignatureSpecs defined per requirement
- Coverage audit script (doc 05 §12) green in CI

Exit criteria:
- Every role from doc 02 has a complete RoleRequirement set
- Coverage script blocks deploys on gaps

---

## Phase 3 — Workflow / Form / Policy Mapping

Deliverables:
- Workflows authored in Workflows library for every WF-* in doc 05
- Forms authored in Forms library for every FRM-* in doc 05
- Policies pinned at versions for every PolicyVersionRef
- Lifecycle event contract between workflows and the engine implemented

Exit criteria:
- Every requirement is end-to-end runnable in a test environment
- No requirement satisfied by checkbox-only

---

## Phase 4 — Execution Batch Generator (Engine)

Deliverables:
- Trigger intake API
- Profile resolution
- Template selection
- Reconciliation
- Batch + Unit emission
- Recurring rule generation
- Replay capability

Exit criteria:
- A trigger produces a deterministic batch
- Replay of a historical trigger produces logically equivalent output (modulo policy version)
- Reconciliation always emits an audit event

---

## Phase 5 — CES Integration

Deliverables:
- Units injected into Sprint Board as bundles
- Calendar entries written to Compliance Calendar
- Assignment Model resolves owners (CES doc 04)
- Escalation policy wired (CES doc 10)
- Recurring execution wired (CES doc 07)

Exit criteria:
- Onboarding bundles visible and operable on Sprint Board
- Calendar shows onboarding deadlines with escalation tiers
- Blocked / At Risk states behave per spec

---

## Phase 6 — Enforcement Gates

Deliverables:
- `field_clearance(subject, date)`
- `billing_clearance(subject)`
- `system_access_clearance(subject)`
- `vendor_engagement_clearance(vendor)`
- `governance_active(role)`
- Each gate produces a signed `GateEvaluation` audit event
- Override flow (dual eCIgn, time-bounded) implemented

Exit criteria:
- Scheduling, billing, IAM, vendor systems consume gate APIs and refuse on Fail
- Overrides require multi-signature, are bounded, and auto-expire

---

## Phase 7 — UI Implementation

Deliverables (per doc 07 + doc 12):
- Onboarding Dashboard
- Role-Based Activation Screen
- Execution Batch View
- Evidence & Forms Panel
- Competency Validation View
- Signature / Acknowledgment View (eCIgn embed)
- Audit Readiness View (per-subject dossier)
- Cross-surface deep links

Exit criteria:
- All surfaces functional against engine + CES
- Permissions enforced per CES role model
- No UI path bypasses enforcement

---

## Phase 8 — eCIgn Integration

Deliverables:
- Signature envelopes per SignatureSpec
- Multi-signer flows (per eCIgn doc 09)
- Signed artifact storage with watermark + hash
- Callbacks updating units
- Re-acknowledgment flow on policy republish

Exit criteria:
- Every signature emitted by onboarding rides through eCIgn
- No paper or generic e-sign accepted

---

## Phase 9 — Audit Mode Integration

Deliverables:
- Onboarding lens in Audit Mode
- Per-subject dossier query and export (signed PDF)
- Policy acknowledgment ledger
- Vendor compliance ledger
- Governance ledger
- Overrides report
- Readiness score contribution

Exit criteria:
- Surveyor questions in doc 09 §3.13 answerable in ≤ 1 click each
- Dossier export passes integrity verification (hash chain)

---

## Phase 10 — Help Center Integration

Deliverables:
- Help Center categories + articles per doc 09
- In-app contextual help on every onboarding surface
- Compiled versioned User Manual
- Feedback routing into CES backlog

Exit criteria:
- Every onboarding surface has contextual help
- User Manual is published and watermarked

---

## Phase 11 — QA / Testing

Deliverables:
- Unit tests on engine determinism + replay
- Integration tests on each gate (positive + negative)
- E2E tests for each role's full onboarding flow
- Audit chain integrity test (tamper detection)
- Performance tests on dossier export and gate evaluation
- Compliance acceptance test signed by Compliance Officer

Exit criteria:
- 100% of HARD GATEs covered with negative tests
- 100% of role flows green in E2E
- Compliance Officer sign-off captured (eCIgn) before release

---

## Cross-Phase Guardrails

- No phase ships without its enforcement piece in place.
- Every phase emits audit events from day one.
- Every phase respects the immutability rules in doc 08 §9.
- Every phase honors the "no checkbox completion" rule.

---

## Out-of-Scope (this roadmap)

- Migration of historical paper records (separate project; ingested as evidence images under override workflow)
- HRIS bidirectional sync (initial: one-way HRIS → engine; bidirectional later)
- Surveyor-facing portal (later phase)
