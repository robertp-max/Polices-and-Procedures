# 07 — System Integration

> How the unified Policy Lifecycle Workspace integrates with the rest of the platform: CES, Compliance Calendar, Command Center, Audit Mode, eCIgn, Forms Library, Help Center. Every integration is event-driven so the workspace is the *source of truth* for policy state and the consumers react.

---

## 1. Integration Overview

```
                ┌─────────────────────────────────────┐
                │  Policy Lifecycle Workspace         │
                │  (state machine + audit log)        │
                └──────────────────┬──────────────────┘
                                   │  emits
                                   ▼
        ┌───────────── policy.lifecycle.* event bus ─────────────┐
        │                                                          │
   ┌────▼────┐   ┌──────────┐  ┌──────────┐  ┌────────┐  ┌────────┐
   │   CES   │   │ Calendar │  │ Command  │  │ Audit  │  │ Forms  │
   │  units  │   │  events  │  │  Center  │  │  Mode  │  │ assign │
   └─────────┘   └──────────┘  └──────────┘  └────────┘  └────────┘
        │             │              │            │           │
        └─────────────┴──────────────┴────────────┴───────────┘
                              ▼
                ┌─────────────────────────────┐
                │  ecign.audit_events (sink)  │
                └─────────────────────────────┘
```

The workspace publishes a small set of events. Each downstream system subscribes to the events it cares about. eCIgn signatures and the audit log are written inline with the state-machine transition.

---

## 2. Event Catalog

All events use a stable, namespaced key; payloads are JSON-serializable; every event carries `policyId`, `versionId`, `actor`, `timestamp`, `prevHash`, `hash`.

| Event | Emitted on transition | Payload (key fields) |
|---|---|---|
| `policy.lifecycle.draft_opened` | T1 (initial) or T9 (revision) | `version`, `revisionRound`, `triggeredBy` |
| `policy.lifecycle.review_started` | T1 / T3 | `stage` (`internal` \| `compliance`), `slaDueAt` |
| `policy.lifecycle.comment_added` | comment write | `commentId`, `commentType`, `sectionId`, `charRange` |
| `policy.lifecycle.comment_resolved` | resolution | `commentId`, `resolution` |
| `policy.lifecycle.revision_requested` | T2 / T4 | `reason`, `nextRevisionRound` |
| `policy.lifecycle.approval_requirement_met` | per signature | `role`, `signatureId`, `signerId` |
| `policy.lifecycle.approved` | T6 | `approverIds[]`, `meetingMinutesRef` |
| `policy.lifecycle.activated` | T8 | `effectiveDate`, `supersededVersionId`, `assignmentCount` |
| `policy.lifecycle.superseded` | T8 (for prior version) | `supersededBy` |
| `policy.lifecycle.acknowledgment_recorded` | per acknowledgment | `assignmentId`, `userId`, `signatureId` |
| `policy.lifecycle.acknowledgment_overdue` | T+14 background job | `assignmentId`, `daysOverdue` |
| `policy.lifecycle.distribution_dispatched` | per channel | `channel`, `target`, `success`, `error?` |
| `policy.lifecycle.archived` | T10 / T11 | `legalAuthority`, `archivedBy[]` |
| `policy.lifecycle.transition_rejected` | guard failure | `intent`, `ruleCode`, `reason` |

The bus uses the existing `complianceExecutionEvents` infrastructure (`emitCompliance` / `subscribeCompliance`) — no new bus is introduced.

---

## 3. CES Execution Units

Where it integrates: [src/policy/compliance-execution/](../../../src/policy/compliance-execution/).

**Behavior**

- On `policy.lifecycle.draft_opened` for a REQUIRED policy → CES creates an execution unit `policy_authoring` with phase `draft`, owner = policy steward, due = SLA window end.
- On `policy.lifecycle.review_started` → CES advances the unit to phase `review`; emits `compliance:open-execution-unit` so the Sprint Board surfaces it.
- On `policy.lifecycle.approval_requirement_met` → CES updates `audit_readiness` count.
- On `policy.lifecycle.activated` → CES marks the unit `completed`, captures `effectiveDate` as evidence, and spawns a follow-up unit `policy_acknowledgment_window` with due = effective + 14 days.
- On `policy.lifecycle.acknowledgment_overdue` → CES opens a remediation unit assigned to the supervisor.

**Wiring**

- CES exposes `subscribePolicyLifecycle` in `complianceExecutionEvents`; the workspace's emitter calls it directly. No new pub/sub.

---

## 4. Compliance Calendar

Where it integrates: `/calendar`, [server/googleCalendar.ts](../../../server/googleCalendar.ts).

**Behavior**

- For every `Active` REQUIRED or RECOMMENDED policy, the workspace materializes a calendar series:
  - `Annual Review` — recurring per `reviewCycle`
  - `Quarterly Compliance Report` — recurring quarterly for compliance-domain policies
  - `Acknowledgment Window Close` — single event at effective + 14 days
- On `policy.lifecycle.activated` → calendar items are created/updated via `googleCalendar.upsert`.
- On `policy.lifecycle.archived` → series is closed (no deletion of past events; future events are cancelled with reason).
- On `policy.lifecycle.acknowledgment_overdue` → calendar event status flips to `at_risk` and the audit-log mirror records the change.

**Audit log**

- All calendar mutations continue to flow through the existing `auditLog.ts` JSONL sink, with cross-references back to `policyId`/`versionId`.

---

## 5. Command Center Dashboard

Where it integrates: `/dashboard`.

**Behavior**

- New tile **"Policy Lifecycle Health"** showing:
  - Versions in flight (counts per stage)
  - SLA breaches in last 30 days
  - Acknowledgment reach % for last 5 activated policies
  - Hash-chain integrity status
  - Overdue annual reviews
- Tile data is computed by selectors over the lifecycle store; no separate API.
- Click any number opens the lifecycle workspace pre-filtered to that cohort.

---

## 6. Audit Mode

Where it integrates: `/audit`, [src/policy/pages/AuditModePage.tsx](../../../src/policy/pages/AuditModePage.tsx).

**Behavior**

- The Audit Mode store reads the same lifecycle events to produce surveyor-ready evidence packs.
- For each policy, Audit Mode renders the scorecard from [06 §4](06-Compliance-Enforcement-Model.md#4-audit-mode-surfacing).
- One-click "Export Evidence Pack" assembles: current Active version PDF, full audit-event log for the policy ID, all signatures, all acknowledgments, distribution receipts. The pack is signed with a manifest hash so external auditors can verify integrity.
- Audit Mode is strictly read-only; it never mutates policy state, but it CAN open a CES remediation unit if a deficiency is observed.

---

## 7. eCIgn Signatures

Where it integrates: [src/policy/components/FormSignatureFlow.tsx](../../../src/policy/components/FormSignatureFlow.tsx), [migrations/001_ecign_schema.sql](../../../migrations/001_ecign_schema.sql), [server/ecign/](../../../server/ecign/).

**Behavior**

- Every approval signature, every acknowledgment signature, and every special-session override uses the existing eCIgn pipeline. No parallel signature path is created.
- The lifecycle state machine calls `ecign.requestSignature(form_instance_id, signer)` and waits on `ecign.signatures` insertion before flipping the requirement to `met`.
- `ecign.audit_events` is the canonical audit sink for all policy lifecycle transitions; the in-memory `policyStore.auditTrail` becomes a UI cache only.
- Multi-signature forms use the `disclosed → verified → reviewed → attested → signed_locked` state machine that already exists in `ecign.form_instances`.

---

## 8. Forms Library

Where it integrates: `/forms`, [src/policy/data/formsCatalog.ts](../../../src/policy/data/formsCatalog.ts).

**Behavior**

- On `policy.lifecycle.activated` for a policy that has `requiredForms[]`, the workspace creates `PolicyAssignment` rows referencing the forms.
- Each assignment links to the form in the Forms Library (`/forms/:formId`) so the assignee can complete it inline.
- Form completion writes back to `PolicyAssignment.acknowledgedAt` and emits `policy.lifecycle.acknowledgment_recorded`.

---

## 9. Help Center

Where it integrates: `/help`.

**Behavior**

- Help articles related to the current policy or current lifecycle stage appear in a "Help & Guidance" section in the right rail's overflow menu.
- New articles authored alongside this workspace:
  - "Submitting a policy for internal review"
  - "Resolving Required comments"
  - "Requesting a special-session approval"
  - "Activating a new version: what to verify"
  - "What happens at acknowledgment T+14"
  - "How the Active-version invariant works"
- Every help article links back to the lifecycle workspace via deep links (`/policy-lifecycle?guide=submitting-for-review`).

---

## 10. Routing & Old-Surface Decommission

Per [03 §8](03-Policy-Lifecycle-Architecture.md#8-mapping-old-routes--unified-workspace) the old `/drafts`, `/review`, `/publish` routes redirect to the unified surface for one release cycle and are then removed. Anything that imported those page components must be migrated to the unified workspace's mode-aware deep links. A search across the codebase for `DraftsPage`, `ReviewPage`, `PublishPage` will confirm only redirect shims remain post-migration.

---

## 11. Backwards-Compatible Contracts

| Existing module | Contract preserved | How |
|---|---|---|
| `usePolicyStore.policies` | Read API unchanged | Lifecycle store re-exports `policies` selector pointing at the new normalized store |
| `usePolicyStore.publishJobs` | Replaced | New emitter publishes jobs through the distribution channel layer; old field still resolves to the same shape via a deprecation-free adapter |
| `complianceExecutionEvents` event names | Preserved | New events added under `policy.lifecycle.*` namespace; existing `compliance:*` keys untouched |
| `FormSignatureFlow` props | Preserved | Lifecycle workspace consumes the component as-is |
| `auditLog.ts` JSONL writer | Preserved | Lifecycle now emits JSONL too, alongside `ecign.audit_events` writes |

No existing consumer of the policy module is broken by this change; all changes are additive or routed through adapters.

The data model that supports all of the above is in [08-Policy-Lifecycle-Data-Model.md](08-Policy-Lifecycle-Data-Model.md).
