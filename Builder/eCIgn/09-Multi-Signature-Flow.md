# 09 · Multi-Signature Flow

Binding specification for forms that require **two or more** signatures (e.g.
`EN-FM-011 Policy Exception / Waiver Request`, `GV-FM-003 Org Chart`,
`EN-FM-004 Domain Owner Roster`, `QA-FM-024 PI Project Charter`).

Implements Phase 3 (Signature Workflow) and Phase 9 (Outputs) for the
multi-party case. All single-signer rules from
[02-Signature-Workflow.md](02-Signature-Workflow.md) still apply per signer;
this document layers the orchestration rules on top.

---

## 1. Signer roster contract

Every form template declares its signer roster in
`formsLibraryDataset.ts → form.signers[]`. Each entry is canonical and
versioned with the form template:

```ts
export interface FormSignerSlot {
  field_id:        string;     // e.g. 'sig_requester' | 'sig_domain_owner'
  role:            string;     // human label e.g. 'Domain Owner'
  tier:            number;     // org-tier rank (lower = more senior)
  required:        true;       // optional signers are not supported in v1
  resolver:        SignerResolver;
  sequence_group:  number;     // 1..N — see §2
}
```

`SignerResolver` is one of:

| Resolver | Resolution rule |
|---|---|
| `'self'` | The current authenticated user (the requester) |
| `{ role_id: string }` | Whoever currently holds the named role (e.g. `compliance_officer`) |
| `{ tier_above: number }` | Any user with `tier ≤ requester.tier - n` |
| `{ user_id: string }` | A specific named user (rare; e.g. external auditor) |

Roster is part of `document_versions.template_snapshot` — it cannot drift
mid-instance.

---

## 2. Sequencing

Two execution modes, selected per template:

### 2.1 Parallel (`sequence_group` all equal)

All signers can sign in any order. Used for advisory acknowledgments
(e.g. `EN-FM-022` quarterly compliance attestations).

### 2.2 Sequential (`sequence_group` strictly ascending)

Lower group must complete before higher group is invitable. Used for
governance forms requiring legal/clinical chain-of-custody:

| Form | Group 1 | Group 2 | Group 3 |
|---|---|---|---|
| EN-FM-011 Policy Exception | Requester | Domain Owner | Compliance Officer + Administrator (parallel within group) |
| GV-FM-003 Org Chart | Preparer | Administrator | Governing Body Chair |
| QA-FM-024 PI Project Charter | Project Lead | QAPI Director | Administrator |

Mixed-group instances (most real forms) combine both: within a
`sequence_group`, signers act in parallel; groups themselves are strictly
sequential.

---

## 3. Lifecycle (per instance)

```
                                ┌────────────────────────────────────────────┐
                                │  per-signer flow = the 6-step lifecycle    │
                                │  defined in 02-Signature-Workflow.md       │
                                └────────────────────────────────────────────┘
                                              ▲
       ┌────────────┐  resolve   ┌────────────┴───────────┐  invite
start: │ created    │ ─────────► │  awaiting_signer(g=1)  │ ─────────►  email + dashboard task
       └────────────┘            └────────────┬───────────┘
                                              │ all g=1 signed
                                              ▼
                                 ┌────────────┴───────────┐  invite
                                 │  awaiting_signer(g=2)  │ ─────────►  email + dashboard task
                                 └────────────┬───────────┘
                                              │ all signed
                                              ▼
                                 ┌────────────────────────┐
                                 │     signed_locked      │  ← terminal, immutable
                                 └────────────────────────┘
```

State transitions are append-only rows in `ecign.compliance_states` with
`object_kind = 'form_instance'`.

---

## 4. Per-signer task lifecycle

Each invited signer receives a `SecondSigTask`-shaped row (in v1 we keep
the legacy name; in v2 it generalises to `SignatureTask`):

| Field | Source |
|---|---|
| `task_id` | Server ULID |
| `form_instance_id` | Parent instance |
| `assigned_to_user_id` | Resolved per `SignerResolver` |
| `assigned_by_user_id` | Previous-group last signer, or `system` |
| `slot_field_id` | Matches `FormSignerSlot.field_id` |
| `status` | `pending → opened → signed` &#124; `pending → declined` |
| `due_at_utc` | Default = `created_at + 5 business days`, override per template |
| `escalation_at_utc` | Default = `due_at - 1 business day` |

Each transition writes an `audit_event`:
- `task_created`
- `task_opened`        (signer first loads the workspace)
- `task_signed`        (after `signature_applied`)
- `task_declined`      (signer chose Decline; reason captured)
- `task_reassigned`    (compliance officer reassigned to another user)
- `task_expired`       (passed `due_at`; system regenerates with override)

---

## 5. UI surfaces

| Surface | File | Purpose |
|---|---|---|
| Pending-signature dashboard tab | `src/policy/pages/FormsPage.tsx` | Shows every task assigned to current user, ordered by `due_at` |
| Signer roster banner | `src/policy/components/FormSignatureFlow.tsx` | On the form itself: avatars of all required signers + per-signer status pill (`✅ Signed` / `⏳ Pending` / `⚠️ Overdue` / `🚫 Declined`) |
| Send-for-next modal | `FormSignatureFlow.tsx` `<SecondSignatureModal>` | Lets the just-completed signer (or compliance officer) pick the resolved approver |
| Signing workspace | `FormSigningWorkspace.tsx` | Same 6-step flow as single-sig; the right rail now shows "Signer 2 of 3 — Domain Owner" context |
| Final packet page N+4 | `FormSigningWorkspace.tsx` `buildCertHtml()` | Multi-signer roster page (see [06-Outputs](06-Outputs-Templates-Watermarks.md) §C.4) |

### 5.1 Roster banner spec

Sits below the Section header on the form, sticky on scroll:

```
┌────────────────────────────────────────────────────────────────────┐
│  REQUIRED SIGNERS (3)                                              │
│  ●─JD Vance · Requester ✅ Apr 24 8:21 PM                          │
│  ●─Maria Lim · Domain Owner ⏳ Pending  · Due Apr 26               │
│  ●─Compliance Officer (unassigned) 🚫 Awaiting Group 2 completion  │
└────────────────────────────────────────────────────────────────────┘
```

States:
- `✅ Signed`        — green dot, datetime
- `⏳ Pending`       — orange dot, due date
- `⚠️ Overdue`       — red dot, "Escalates today / Overdue by N day(s)"
- `🚫 Locked`        — gray dot, "Awaiting Group K completion"
- `🛑 Declined`      — crimson dot, "Declined: <reason>"

---

## 6. Resolver execution

Resolution happens at three moments:

1. **At `created`** — every `'self'` and `{ user_id: x }` slot is bound.
   Roster banner immediately shows real names for these.
2. **At each group transition** — `{ role_id }` and `{ tier_above }`
   slots are resolved against the current Org Chart (`GV-FM-003 v current`).
   If the role is vacant, the system raises a `compliance_event = signer_unresolved`
   and pages the Compliance Officer; the instance does not auto-fail.
3. **On reassignment** — Compliance Officer can manually override the
   resolution; an `audit_event = task_reassigned` records original ↔ new.

---

## 7. Decline & dispute

Any signer may **Decline** with a required reason. Effects:

- Task status → `declined`; instance state → `awaiting_dispute_review`.
- Compliance Officer is paged.
- The CO can either (a) reassign to a different qualified user, or
  (b) `void & re-issue` the entire instance. Both paths preserve the
  originally captured signatures and append a reversing event; no row
  is mutated.

Declines are reproduced on packet page N+3 (Audit Trail) and on
page N+4 (Roster — declined block with dashed border + crimson tag).

---

## 8. Watermark, output & certificate impact

Reference: [06-Outputs-Templates-Watermarks.md](06-Outputs-Templates-Watermarks.md).

- The footer watermark stamps the **last applied signer** by default and
  is regenerated on every print so that, prior to lock, it accurately
  reflects current state. After `signed_locked` it freezes and shows the
  final signer.
- The cert packet page N+1 always names the **final signer** as the
  attestor of record, but **all** signers appear on page N+4 (Roster)
  with their individual signature image, role, timestamp, IP, and field id.
- Hash chain: each `signatures` row is hashed independently; the
  document `manifest_hash` is `sha256(document_hash ‖ ordered list of
  signature_hash values ‖ chain_head)`. This means changing the order
  or adding a signer would yield a different manifest hash — making
  multi-sig integrity verifiable at a glance.

---

## 9. Failure-prevention guarantees

The server (not the UI) enforces:

| Guarantee | Mechanism |
|---|---|
| No signer may sign before their group is reachable | `applySignature` rejects with `GROUP_NOT_OPEN` |
| No two signers may share a slot | `signatures` table `UNIQUE (instance_id, field_id)` |
| A signer cannot self-approve in a higher tier | Resolver pre-check + tier comparison at signature time |
| The instance cannot lock until every required slot is filled | `lockDocument` rejects with `ROSTER_INCOMPLETE` |
| Roster cannot drift after `created` | Snapshotted in `template_snapshot`; resolver only fills bindings |

All five rejections emit a `compliance_event` so the Sprint Board reflects
the blocker (`Blocked Reason: Missing signature — Domain Owner`).

---

## 10. Worked example — EN-FM-011 Policy Exception

Roster (declared in template):

| # | field_id | role | resolver | seq |
|---|---|---|---|---|
| 1 | `sig_requester` | Requester | `'self'` | 1 |
| 2 | `sig_domain_owner` | Domain Owner | `{ role_id: 'domain_owner_for(policy)' }` | 2 |
| 3 | `sig_compliance_officer` | Compliance Officer | `{ role_id: 'compliance_officer' }` | 3 |
| 4 | `sig_administrator` | Administrator | `{ role_id: 'administrator' }` | 3 |

Walk-through:

1. JD Vance creates the instance and signs `sig_requester` → group 1 closes.
2. System resolves Domain Owner from the policy's domain assignment
   (cross-reference `EN-FM-004`), sends task to Maria Lim. Banner
   updates: `2 of 4 — Domain Owner pending`.
3. Maria opens the form, completes her own 6-step lifecycle, signs
   `sig_domain_owner` → group 2 closes.
4. System opens group 3 in **parallel** to both Compliance Officer
   and Administrator. Either may sign first; both must sign before lock.
5. Final signer triggers `lockDocument` → `signed_locked`, hash manifest
   computed across all four signatures, watermark frozen, packet
   regenerated to show all four roster entries on page N+4.

---

## Cross-references

- [02-Signature-Workflow.md](02-Signature-Workflow.md) — per-signer 6-step lifecycle
- [03-Audit-and-Compliance-Model.md](03-Audit-and-Compliance-Model.md) — hash-chain & event model
- [05-Failure-Prevention.md](05-Failure-Prevention.md) — server-side rejection codes
- [06-Outputs-Templates-Watermarks.md](06-Outputs-Templates-Watermarks.md) — packet page N+4 spec
- [07-Data-Models-and-API.md](07-Data-Models-and-API.md) — `SignatureTask`, `SignerResolver` types
