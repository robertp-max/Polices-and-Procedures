# 09 — Implementation Roadmap

> Phased plan to deliver the unified Policy Lifecycle Workspace. Each phase is sequenced by dependency, has explicit deliverables, exit criteria, and integration touchpoints. No time estimates by request.

---

## Phase Sequencing (dependency order)

```
1. Data Model
2. Lifecycle State Machine
3. Unified Workspace Shell
4. Review / Commenting System
5. Approval & eCIgn Wiring
6. Publish Readiness Engine
7. CES Integration
8. Audit Mode Integration
9. Help Center Integration
10. QA / Testing
```

---

## Phase 1 — Data Model

**Deliverables**

- New tables per [08](08-Policy-Lifecycle-Data-Model.md): `Policy` (logical), `PolicyVersion`, `PolicyLifecycleInstance`, `ApprovalRequirement`, `SignatureRequirement`, `ReviewComment` (extended), `DistributionRecord`, `PolicyAssignment` (extended), `AcknowledgmentRecord`, `PolicyAuditEvent`, `ArchiveJustification`, `PolicyCrossReference`.
- Database migration `migrations/00X_policy_lifecycle_schema.sql` with the partial unique index enforcing INV-1.
- Seed migration that converts the current Zustand seed (via `frameworkSeedAdapter`) into the new tables. All existing policies land as `Policy.lifecycleState='ACTIVE'` with one `PolicyVersion.state='active'` per policy.
- TypeScript types in `src/policy/types/lifecycle.ts` mirroring the schema; legacy types kept and aliased.

**Exit criteria**

- All existing policies present in new tables.
- Partial unique index passes seed without conflict.
- Compatibility selectors return the same shape the current UI expects.

---

## Phase 2 — Lifecycle State Machine

**Deliverables**

- `src/policy/lifecycle/stateMachine.ts` — pure module with `transition(intent, context) → result | rejection`.
- All 11 documented transitions (T1–T11) implemented with named guards (R1–R20).
- Hash-chain helper writing both `PolicyAuditEvent` and `ecign.audit_events` in one transaction.
- Unit tests: golden cases per transition + every guard's failure path.
- Property tests asserting INV-1…INV-10 over generated valid sequences.

**Exit criteria**

- 100% branch coverage on guard functions.
- Property tests run for ≥ 10,000 generated sequences without invariant violation.
- No code path mutates state outside the state machine.

---

## Phase 3 — Unified Workspace Shell

**Deliverables**

- New route `/policy-lifecycle` and `/policy-lifecycle/:policyId` mounted in [src/App.tsx](../../../src/App.tsx).
- Three-pane layout per [05](05-Policy-Lifecycle-UIUX.md) — top bar, left rail, center, right rail, optional footer dock — using existing tokens; new tokens added to `tailwind.config.js`.
- Mode toggle (`Edit · Review · Approve · Publish · View`) with mode-aware right-rail card swapping.
- Left-panel queues bound to selectors over `usePolicyLifecycleStore`; role-aware default queue; filter chips persistence.
- Redirect shims at `/drafts`, `/drafts/:id`, `/review`, `/publish` → new route + mode.

**Exit criteria**

- Workspace renders for every policy in the seed without runtime errors.
- All five modes navigable via keyboard shortcuts.
- Old routes redirect with deep-link parameter preservation.

---

## Phase 4 — Review / Commenting System

**Deliverables**

- Comment overlay editor in the center pane: highlight-to-comment with `C/R/S` keyboard.
- Threaded comment UI bound to `sectionId + charRange`.
- Required-comment dock (footer strip) wired to live count.
- Comment-resolution actions write through the state machine (no direct store writes).
- Two-stage review (Internal then Compliance) with `reviewStage` chip in the top bar and SLA day counter.

**Exit criteria**

- Cannot advance T3 / T5 with open Required comments (R4 verified end-to-end).
- Comments survive editor saves and version diffs (anchored to section ids).

---

## Phase 5 — Approval & eCIgn Wiring

**Deliverables**

- `ApprovalRequirement` materializer fired on entry to `pending_approval`.
- Right-rail Required Approvals card with inline eCIgn signing using `FormSignatureFlow`.
- Guards R8 (no self-approval), R9 (COI clearance), R11 (tier-correct body) wired to the state machine.
- Special-session pathway (R11 override) implemented with extra GB-Chair signature and `override_special_session` audit event.
- Committee-minutes attachment UI (`GV-FM-005`, `CO-FM-024`, `QA-FM-001`).

**Exit criteria**

- A REQUIRED policy reaches `approved_locked` only when all three signatures and the GB minutes reference are captured.
- Self-approval and COI-missing attempts are blocked and audited.

---

## Phase 6 — Publish Readiness Engine

**Deliverables**

- Readiness checklist in the right rail driven by selectors (one selector per checklist row).
- Distribution channel pre-flight checks per R14.
- Atomic Activate transaction implementing T8: state swap, assignment generation, distribution dispatch, audit append. Rollback on any sub-failure.
- Background job for `acknowledgment_overdue` (R5) marking assignments and emitting events.

**Exit criteria**

- T8 either fully succeeds or rolls back with no partial state visible to selectors.
- Generated `PolicyAssignment` count matches the audience-profile resolver.
- Acknowledgment overdue job runs and surfaces in queues.

---

## Phase 7 — CES Integration

**Deliverables**

- Subscriptions in `complianceExecutionEvents` for the events from [07 §2](07-System-Integration.md#2-event-catalog).
- CES execution unit creators for `policy_authoring`, `policy_review`, `policy_acknowledgment_window`, `policy_acknowledgment_remediation`.
- Sprint Board renders policy units alongside existing units; click-through opens the lifecycle workspace.

**Exit criteria**

- Activating a policy in the workspace creates the matching CES units within one event-bus tick.
- CES unit completion writes back to `PolicyAuditEvent`.

---

## Phase 8 — Audit Mode Integration

**Deliverables**

- Per-policy compliance scorecard in `/audit` (R1, R5, R12, R13, R14, R15, R17 metrics).
- Evidence Pack export: PDF of Active version + audit-event log + signatures + acknowledgments + distribution receipts + manifest hash.
- Read-only deep links from Audit Mode rows to the lifecycle workspace `?asOf=` for historical-state inspection.

**Exit criteria**

- Audit Mode can replay any version's full lifecycle from `ecign.audit_events` and render the scorecard without contacting the lifecycle store.
- Evidence Pack manifest hash verifies externally.

---

## Phase 9 — Help Center Integration

**Deliverables**

- Help articles listed in [07 §9](07-System-Integration.md#9-help-center).
- Right-rail overflow → "Help & Guidance" panel showing context-aware articles.
- Deep links from articles back to the workspace.

**Exit criteria**

- Every primary action button has at least one linked help article reachable in two clicks.

---

## Phase 10 — QA / Testing

**Deliverables**

- Unit tests: state machine, selectors, guards (carried over from Phase 2 & 5).
- Component tests: editor + comment overlay, approvals card, readiness checklist, queue rendering.
- End-to-end tests covering the four canonical journeys:
  1. New REQUIRED policy from Drafting through Activation, including 1 revision loop.
  2. Active policy entering Under Revision and the resulting Active↔Superseded swap.
  3. Acknowledgment overdue path and HR escalation.
  4. Special-session override.
- Audit-replay test verifying state reconstruction from `ecign.audit_events`.
- Accessibility audit (WCAG 2.1 AA) on every primary surface.
- Performance baseline: queue render for 500 policies < 100 ms; transition round-trip < 250 ms.

**Exit criteria**

- All tests green in CI; coverage thresholds met (lines ≥ 90% in `src/policy/lifecycle/`).
- Accessibility audit clean on workspace shell and all mode panels.
- No invariant violation in 50,000 generated property-test sequences.

---

## Cross-Phase Concerns

| Concern | Plan |
|---|---|
| Migration safety | Each schema migration is forward-only and ships with a verification script that asserts INV-1 before declaring success. |
| Backwards compatibility | Old route shims and `usePolicyStore` adapter retained for one release cycle, then removed. |
| Telemetry | Every state transition emits a structured log line with rule code; failed transitions log at `warn`; invariant violations at `error`. |
| Security | No secrets in client; eCIgn flow uses existing server endpoints; signature images stored encrypted at rest per existing eCIgn schema. |
| Documentation | Each phase ships with an update to the [end-user manual](POLICY_LIFECYCLE_USER_MANUAL.md). |

---

## Definition of Done (system-level)

- The four canonical journeys complete without manual intervention.
- All hard rules R1–R20 are enforced and tested.
- INV-1 holds across the entire seeded corpus before, during, and after at least one full revision cycle.
- Audit Mode can replay any policy's full history.
- The words "Deprecated" / "Deprecate" / "Deprecation" do not appear in lifecycle code, UI, schema, or documentation.

When all of the above is true, the unified Policy Lifecycle Workspace replaces the legacy Draft / Review / Publish surfaces and the legacy routes are removed.
