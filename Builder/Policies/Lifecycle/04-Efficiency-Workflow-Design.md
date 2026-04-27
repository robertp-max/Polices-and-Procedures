# 04 — Efficiency-First Workflow Design

> Goal: every routine policy-lifecycle action completes inside one workspace, in the smallest number of clicks, with zero re-orientation. This document defines the optimized workflows on top of the architecture in [03-Policy-Lifecycle-Architecture.md](03-Policy-Lifecycle-Architecture.md).

---

## 1. Design Principles

1. **One workspace, mode-switched.** No route changes when the user pivots from drafting to reviewing to publishing — only the right-rail and primary-action bar change.
2. **Inline everything.** Editing, commenting, approval, signature capture, and publish actions all happen in-place against the selected version. No modal-stacking past depth 1.
3. **Role-aware queues, not folders.** What a user sees first is *what they have to do today*, sorted by SLA risk — not a static "Drafts" folder.
4. **Click budget.** Every routine workflow has a published click budget; UI must meet it.
5. **No silent state.** Every state change shows a toast + persists an audit event + updates the right-rail readiness panel without re-fetching the page.
6. **Batch by default.** Any action that operates on one policy must support batch on selection — review, sign, publish, schedule.
7. **Escalation is automatic, not heroic.** SLA breach triggers escalation events without user intervention.

---

## 2. Click-Budget Targets

| Workflow | Today | Target | Notes |
|---|---|---|---|
| Open policy and start editing | 3 clicks + 1 route | 1 click | Single click on a queue row opens edit panel |
| Add a Required comment to selected text | 4 clicks | 2 clicks | Highlight → keyboard `R` |
| Resolve a Required comment | 3 clicks | 1 click | Resolve button in inline thread |
| Submit for Internal Review | 3 clicks + 1 route | 1 click | Primary action button |
| Approve REQUIRED policy (3 sigs) | n/a (impossible) | 3 clicks per signer × 3 signers + 1 commit | eCIgn embedded |
| Publish + auto-create assignments | 4 clicks + 2 routes | 1 click | Single "Activate" action runs atomic swap |
| Open prior version side-by-side | impossible | 1 click | Version diff lens |
| Acknowledge a published policy (staff) | 5 clicks | 2 clicks | One-tap from "My Acknowledgments" |

---

## 3. Role-Based Queues (Default Landing)

Each role lands on a queue tailored to their lifecycle responsibility.

| Role | Default queue | Sort | Empty state |
|---|---|---|---|
| Policy Owner / Author | "My drafts & revisions" | Last edited desc | "No active drafts. Open a Master Index entry to start." |
| Stakeholder Reviewer | "Awaiting your review" | SLA risk desc | "All caught up. Nothing in your review window." |
| Compliance Officer | "Compliance review queue" + "Approval-block alerts" | SLA risk, then tier | (none) |
| Administrator | "Awaiting your approval (RECOMMENDED)" + "Co-sign queue (REQUIRED)" | Approval window | (none) |
| Governing Body Chair | "Quarterly approval agenda" | Next quarterly meeting date | "Next quarterly meeting on [date]. No items queued." |
| Department Director | "OPTIONAL approvals (your domain)" | SLA | (none) |
| Audit / Surveyor (read-only) | "Active policies + acknowledgment health" | Acknowledgment % asc | (none) |

Queues are computed from `usePolicyLifecycleStore` selectors (no separate API call). Each queue row exposes:

- Policy ID + tier badge
- Lifecycle stage chip
- Owner avatar
- SLA chip (`Due in 3 days` / `Overdue 2 days` in red)
- Quick-action button: "Open" (primary) + overflow (Reassign, Snooze, Escalate)

---

## 4. Inline Drafting

The edit panel is a left/center two-pane layout *inside the same workspace*:

- **Center: section-level rich editor** with the EN-FM-004 template skeleton enforced — Purpose, Scope, Definitions, Procedures, References, Training, Appendices. Sections cannot be reordered; missing sections show a "Required section empty" inline warning.
- **Left rail: section navigator + change-summary input** (the change summary is mandatory before the Submit-for-Review action enables).
- **Right rail (collapsible):** approvals, signatures, evidence, audit trail, publish readiness — see UI/UX spec.

Inline behaviors:

- **Autosave every 5 s** to local IndexedDB cache, every 30 s to server. Visible "Saved at HH:MM:SS" indicator.
- **Conflict detection.** If a co-author edited the same section, the editor offers a 3-way merge view inline (no modal).
- **Reference autocomplete.** Typing `EN-FM-` or `42 CFR §` opens an inline picker pulling from the Forms Catalog and a regulatory dictionary.
- **Cross-policy link check on save.** Broken references warn inline; cannot Submit for Review with broken refs.

---

## 5. Inline Review

Reviewers operate on the same center pane, but the editor is read-only and a **comment layer** overlays the text.

- **Highlight-to-comment.** Select text → keyboard `C` (general), `R` (required), `S` (suggestion). Comment binds to a `sectionId + charRange` so it survives edits.
- **Threaded resolution.** Each comment is a thread; the Author can respond inline; the Reviewer marks Resolved or Dismissed-with-rationale.
- **Required-comment dock.** A persistent strip at the bottom of the workspace shows `n Required comments unresolved` and disables Submit-to-Compliance until n=0.
- **Stage chip.** Top of pane shows `Internal Review · Day 4 of 15` or `Compliance Review · Day 2 of 10` — counting business days. Hover shows SLA breakdown.
- **Bulk dismiss / resolve.** Multi-select comments in the right panel and resolve in batch when an editor response addresses several.

---

## 6. Inline Approval

The right rail in approval mode shows a **Required Approvals** card with one row per `ApprovalRequirement`:

```
┌────────────────────────────────────────────────┐
│  Required Approvals — REQUIRED tier            │
│  ──────────────────────────────────────────    │
│  ✓  Compliance Officer       J. Doe   Apr 22   │
│  ✓  Administrator            R. Patel Apr 23   │
│  ◯  Governing Body Chair     —        Pending  │
│      Bind to: GV-FM-005 minutes [Attach]       │
│      [Sign now]                                │
└────────────────────────────────────────────────┘
```

- Each row is one inline eCIgn capture (typed name + drawn signature) using the existing `FormSignatureFlow` component.
- The Sign button is **disabled** if any guard fails (self-approval, missing COI, wrong role) and shows the failed guard inline.
- When the last row turns green, T6 fires automatically: version → `approved_locked`. No separate "Submit Approval" click.

---

## 7. Inline Publish Readiness

The right rail in publish mode shows a **Publish Readiness** checklist driven by the readiness engine. **Activate** is disabled until every check is green.

```
Publish Readiness — version 6.1
───────────────────────────────────────
✓ Approved by all required signatories (3 of 3)
✓ Effective date set (2026-05-01) and is today or future
✓ Distribution channels configured (Portal, Drive, SCORM)
✓ Acknowledgment audience resolved (RN: 42, LVN: 18, Admin: 6)
✓ Prior active version (6.0) ready for atomic supersede
✓ Hash-chain validated for this policy ID
[ Activate version 6.1 ]
```

- A single click on **Activate** runs the atomic swap, generates assignments, fires distribution jobs, emits the audit event, and updates the queue row to `Active`. No further navigation.

---

## 8. Batch Policy Review

Compliance Officers running annual review must be able to clear multiple policies in one session.

- Selecting `n` policies in the queue exposes a **Batch bar** at the bottom: `2 selected — Run Annual Review · Mark No-Change · Bulk Approve · Bulk Reassign`.
- **Run Annual Review** opens a side-by-side stacked view: previous version vs current version diff, with one-click "No change required" attestation per policy. Each attestation is an eCIgn signature row, captured once and applied to each policy in the batch.
- **Bulk Approve** is only available when every selected version is in `pending_approval` and the user satisfies the approval guard for all of them. Otherwise the action is disabled with the failing rows listed.

---

## 9. Exception Handling

| Exception | System response |
|---|---|
| SLA day reached | Queue badge flips amber at 80% of window, red at 100% |
| Author goes inactive (no save in 7 days while in Drafting) | Auto-reassign offered to owning role; Compliance Officer notified |
| Required comment stale > 5 business days | Auto-prompt to author: "Address or request reviewer override" |
| Approval signature fails (eCIgn error) | Row stays unmet; user shown reason; no partial state recorded |
| Distribution channel fails on Activate | Atomic swap aborts; `approved_locked` retained; incident logged; "Retry distribution" CTA exposed |
| Hash-chain mismatch detected | All transitions blocked for that policy ID; Compliance Officer paged; manual reconciliation required |
| Acknowledgment overdue (> 14 days) | Staff member's queue shows red blocker; supervisor notified via CES execution unit |

All exceptions write `audit_event` rows with the exception reason and any recovery action.

---

## 10. Escalation Model

Escalations are derived, not configured per-policy:

| Trigger | Level 1 (T+0) | Level 2 (T+24h) | Level 3 (T+72h) |
|---|---|---|---|
| Stakeholder review SLA breach | Reviewer notified | Owner + Compliance Officer notified | Administrator notified; CES execution unit opened |
| Compliance review SLA breach | Compliance Officer notified | Administrator notified | Governing Body agenda flagged |
| Approval pending past quarterly meeting | Compliance Officer notified | Governing Body Chair + Administrator notified | Special session recommended; CES escalation unit |
| Acknowledgment overdue | Staff member notified | Direct supervisor notified | HR escalation; access flag in Audit Mode |
| Active version ungoverned (no approver in role) | Compliance Officer notified | Administrator notified | Governing Body emergency item |

Escalations open or update a CES execution unit with the policy ID, current state, and the failed SLA — making them visible in `/calendar` and `/ces/board` automatically (see [07-System-Integration.md](07-System-Integration.md)).

---

## 11. Reduced-Click Navigation Inside the Workspace

- **Cmd/Ctrl-K** opens a global jump: type a policy ID, a tier, a stage, or a person's name. Hits open in the same workspace.
- **`[` and `]`** move to previous / next policy in the current queue without leaving the right-rail context.
- **`E` / `R` / `A` / `P`** keyboard-shortcut the four modes (Edit / Review / Approval / Publish) for the current policy.
- **`G` then `Q`** jumps back to the queue.
- **`?`** opens the keyboard-shortcut help overlay.

---

## 12. What This Workflow Buys

- A Compliance Officer's full daily run — open queue, address 4 reviews, approve 2 policies, activate 1 — completes in **one tab, no route changes, ~22 deliberate clicks** (today: ~70 clicks across 12 routes).
- Authors see exactly what's blocking their next move.
- Approvers have a single dock with all pending signatures across all policies.
- Surveyors observing Audit Mode can reconstruct any version's path without leaving the workspace.

The visual realization of these workflows is specified in [05-Policy-Lifecycle-UIUX.md](05-Policy-Lifecycle-UIUX.md).
