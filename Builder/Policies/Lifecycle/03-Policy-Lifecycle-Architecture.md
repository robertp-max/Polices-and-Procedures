# 03 — Target Architecture

> One unified **Policy Lifecycle Workspace** replacing Draft Workspace, Review Workspace, and Publish Center. This document defines the lifecycle state machine, the version-level "Superseded" model, and the hard invariants that hold at every transition.

---

## 1. Lifecycle States (Policy-Level)

The policy itself moves through exactly these states. **No "Deprecated" state exists.**

```
                     ┌──────────────┐
                     │   Drafting   │  initial state for a brand-new policy
                     └──────┬───────┘
                            │ submit for stakeholder review
                            ▼
                     ┌──────────────┐
                     │  Internal    │  ≤ 15 business days
                     │  Review      │  (EN-FM-005 comment log)
                     └──────┬───────┘
                            │ all Required comments Resolved
                            ▼
                     ┌──────────────┐
                     │  Compliance  │  ≤ 10 business days
                     │  Review      │  (EN-FM-006 sign-off)
                     └──────┬───────┘
                            │ Compliance Officer + Legal sign-off attached
                            ▼
                     ┌──────────────┐
                     │  Governing   │  REQUIRED tier only
                     │  Body        │  (GV-FM-005 minutes attached)
                     │  Approval    │  RECOMMENDED → Administrator
                     │              │  OPTIONAL    → Department Director
                     └──────┬───────┘
                            │ all required signatures captured
                            ▼
                     ┌──────────────┐
                     │  Approved    │  publish-ready; awaits effective date
                     │  for Publish │
                     └──────┬───────┘
                            │ effective date reached + distribution executed
                            ▼
                     ┌──────────────┐
                     │  Published   │  distribution channels confirmed
                     └──────┬───────┘
                            │ first acknowledgment recorded
                            ▼
                     ┌──────────────┐
                     │   Active     │  enforceable; staff acknowledging
                     └──────┬───────┘
                            │ scheduled review OR triggered revision
                            ▼
                     ┌──────────────┐
                     │ Under        │  parallel new draft;
                     │ Revision     │  current Active version REMAINS active
                     └──────┬───────┘
                            │ new draft completes lifecycle and reaches Active
                            ▼
                  (atomic swap: prior version → Superseded)
```

**Terminal states**

- **Active** — the in-force, enforceable state.
- **Under Revision** — overlay state on Active (see §3 below).
- **Archived** — only when explicitly required by law/regulation; documented in the Archive Justification record.

There are **no other terminal states**. There is no "Deprecated", no "Retired without replacement", no "Inactive".

---

## 2. Version States (Per-Version)

A `Policy` is a logical record. Each `PolicyVersion` snapshot moves through these *version-level* states:

| Version state | Meaning | Editable? |
|---|---|---|
| `draft_open` | The version is being authored or revised | Yes (sections, metadata) |
| `in_review` | Locked from author edits; reviewers may comment | No content changes; comments only |
| `approved_locked` | Approved; immutable; awaiting effective date | No |
| `active` | The single in-force version for this policy ID | No |
| `superseded` | A newer version became `active`; this one is historical | No |
| `archived` | Retained per legal/regulatory retention; not in distribution | No |

> **The word "Deprecated" appears nowhere in this taxonomy.** Old versions become `superseded`. The policy itself is never deprecated.

---

## 3. Under Revision: The Parallel-Draft Model

```
Policy ID: CL-OA-006
┌──────────────────────────────────────────────────────────────┐
│  Active version  6.0    state = active     (enforceable)     │
│  Under-revision  6.1    state = draft_open (parallel draft)  │
└──────────────────────────────────────────────────────────────┘
```

- **The Active version remains Active for the full duration of the revision.** Staff continue to acknowledge and comply with `6.0`.
- The new draft (`6.1`) progresses through Internal Review → Compliance Review → Approval in its own lane.
- At the moment `6.1` is approved AND its `effectiveDate` is reached AND distribution succeeds, an **atomic swap** occurs in a single database transaction:
  - `6.0.state := superseded`, `6.0.supersededAt := now()`
  - `6.1.state := active`, `6.1.activatedAt := now()`
- If the swap transaction fails (distribution failure, missing signature, hash-chain break), **nothing changes**: `6.0` remains Active, `6.1` returns to `approved_locked` with an incident logged.

> **Hard invariant:** at any moment `t`, `count(versions where state='active' and policyId=P) === 1` for every policy `P` that is not in `archived` lifecycle state.

---

## 4. State Machine — Transition Rules

Every transition is the result of an explicit, named action. No state may change except through one of these.

| # | From | To | Action | Guards |
|---|---|---|---|---|
| T1 | `draft_open` | `in_review` (Internal Review) | `submitForInternalReview` | All required template sections present; change summary ≥ 10 chars; `EN-FM-002` row exists |
| T2 | `in_review` | `draft_open` | `requestRevision` | At least one Required comment exists or reviewer files revision rationale |
| T3 | `in_review` | `in_review` (Compliance Review stage) | `advanceToComplianceReview` | All Required comments Resolved/Dismissed; stakeholder SLA met or override justified |
| T4 | `in_review` (Compliance) | `draft_open` | `requestRevision` (Compliance) | Compliance Officer files Required comment |
| T5 | `in_review` (Compliance) | `pending_approval` | `submitForApproval` | `EN-FM-006` legal/compliance sign-off attached |
| T6 | `pending_approval` | `approved_locked` | `recordApproval` | Required signatures by tier captured (see §5); committee minutes attached if REQUIRED; no self-approval; COI clean |
| T7 | `pending_approval` | `draft_open` | `rejectAndReturn` | Approver files written rationale |
| T8 | `approved_locked` | `active` | `activate` | `effectiveDate ≤ today`; distribution channels configured; acknowledgment assignments generated; **atomic swap with prior `active` → `superseded`** |
| T9 | `active` | `active` + new `draft_open` | `openRevision` | Triggered by scheduled review, regulatory event, or authorized request; creates new version row, prior remains active |
| T10 | `active` | `archived` | `archive` | Requires Archive Justification record citing legal/regulatory authority; Compliance Officer + Administrator dual signature; **only allowed if no superseding active version exists, i.e. the policy is being legally retired** |
| T11 | `superseded` | `archived` | `archive` | Retention floor reached AND legal/regulatory authority cited |

**Forbidden transitions (explicitly enumerated to prevent accidental implementation):**

- `active → draft_open` (revision must use T9, not edit-in-place)
- `superseded → active` (rollback is achieved by issuing a new version, not by reactivating an old one)
- Any direct `draft_open → active` path
- Any deletion of a row in any state

---

## 5. Approval Requirements by Tier

`ApprovalRequirement` rows are materialized when a version enters `pending_approval`. Each row has `role`, `signatureRequired: boolean`, `met: boolean`, `signatureId: string|null`, `meetingMinutesRef: string|null`.

| Tier | Required signatures | Required attachments |
|---|---|---|
| REQUIRED | Governing Body Chair, Compliance Officer, Administrator | `GV-FM-005` minutes, `EN-FM-006` sign-off, `EN-FM-002` index entry |
| RECOMMENDED | Administrator, Compliance Officer | `EN-FM-006`, `EN-FM-002` |
| OPTIONAL | Department Director (owning domain), Compliance Officer | `EN-FM-006`, `EN-FM-002` |

Guards that run on every signature attempt:

1. Signer's role matches an unmet `ApprovalRequirement` row.
2. Signer is **not** the version `createdBy` (no self-approval).
3. Signer has a current Conflict-of-Interest disclosure on file (GV-GB-001 Appendix C).
4. eCIgn signature successfully captured + hashed.
5. Audit event appended with hash chained to prior event.

T6 (`recordApproval`) only fires when **every** `ApprovalRequirement.met === true`.

---

## 6. Hard Invariants (Enforced at the State Machine Layer)

| ID | Invariant |
|---|---|
| INV-1 | Exactly one version per policy ID has `state = 'active'` at all times unless lifecycle is `archived` |
| INV-2 | `effectiveDate ≥ approvedDate` for every approved version |
| INV-3 | `supersedes` of an `active` version points to the prior `active` version (or null for first version) |
| INV-4 | Approved versions are immutable (`isLocked = true`, no further section edits accepted) |
| INV-5 | Audit events form a continuous hash chain per policy ID; any break is a P0 incident |
| INV-6 | Required comments must all be `Resolved` or `Dismissed-with-rationale` before T5 |
| INV-7 | Acknowledgment assignments exist for every Active version's role audience and start the 14-day timer |
| INV-8 | No author may approve their own version |
| INV-9 | A version cannot be archived while another version of the same policy is active and depends on it |
| INV-10 | Retention floor (max of HIPAA, CA H&S, FCA, CMS) is honored before any archive purge |

The state machine refuses any transition that would violate an invariant and emits an `audit_event` of type `transition_rejected` with the failed guard.

---

## 7. Architecture Layers

```
┌────────────────────────────────────────────────────────────────┐
│                  Policy Lifecycle Workspace UI                 │
│   one route: /policy-lifecycle  (with deep-link variants)      │
└──────────────────────────────┬─────────────────────────────────┘
                               │ React hooks
┌──────────────────────────────▼─────────────────────────────────┐
│              usePolicyLifecycleStore  (single source)          │
│   selectors:  byPolicy, byStage, byOwner, byOverdueSLA         │
│   actions:    only thin wrappers around state-machine actions  │
└──────────────────────────────┬─────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────┐
│            policyLifecycleStateMachine  (pure module)          │
│   transition(intent) → { ok, nextState, events[] } | { error } │
│   guards:  approvalEligibility, COI, requiredComments,         │
│            atomicSwap, retentionFloor, slaWindow               │
└──────────────────────────────┬─────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────┐
│                  policyLifecycleApi (server bridge)            │
│   persists versions, events, signatures, assignments           │
│   writes hash-chained ecign.audit_events                        │
└──────────────────────────────┬─────────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────────┐
│      Existing systems (read/write):                            │
│      • ecign.* schema (signatures, audit_events)               │
│      • CES execution unit emitter                              │
│      • Compliance Calendar                                     │
│      • Forms Library (assignment creation)                     │
│      • Audit Mode (read evidence)                              │
└────────────────────────────────────────────────────────────────┘
```

Key principle: **the state machine is a pure function**. UI calls intents; the machine validates against current state and invariants; only on success does the API layer persist.

---

## 8. Mapping Old Routes → Unified Workspace

| Old route | New route | Mode |
|---|---|---|
| `/drafts` | `/policy-lifecycle?stage=drafting` | List filtered by stage |
| `/drafts/:id` | `/policy-lifecycle/:id?mode=edit` | Edit panel active |
| `/review` | `/policy-lifecycle?stage=internal-review,compliance-review` | Review queue |
| `/review` (open one) | `/policy-lifecycle/:id?mode=review` | Review panel active |
| `/publish` | `/policy-lifecycle?stage=approved-for-publish,published` | Publish queue |
| `/publish` (queue job) | `/policy-lifecycle/:id?mode=publish` | Publish actions panel active |
| `/library/:id` | `/policy-lifecycle/:id?mode=view` (with `?asOf=` for historical views) | Read-only |

Old routes redirect (301-equivalent client redirect) to the new route + mode for one release cycle, then are removed.

---

## 9. What This Architecture Buys

- **One workspace, many lenses.** Same data, mode-switched panels — no context loss between drafting, reviewing, approving, publishing.
- **Provable compliance.** Every state change is guarded and audited; surveyors can replay the lifecycle from `ecign.audit_events`.
- **No enforcement gaps.** No version transition is reachable except through guarded actions.
- **Continuous coverage.** The "exactly one Active version" invariant guarantees there is never a moment without an enforceable policy.
- **No "Deprecated" anywhere.** The model uses `superseded` (version-level) and `archived` (lifecycle-level, only when legally required) and refuses any code path or label that would re-introduce "deprecated".

The efficiency layout that exploits this architecture is in [04-Efficiency-Workflow-Design.md](04-Efficiency-Workflow-Design.md).
