# 02 — Current System Gap Analysis

> Scope: the existing fragmented Policy lifecycle surface in this codebase — `DraftsPage`, `ReviewPage`, and `PublishPage` — measured against the truth extracted in [01-Policy-Lifecycle-Truth.md](01-Policy-Lifecycle-Truth.md).

## 0. Scope Under Review

| Screen | File | Route |
|---|---|---|
| Draft Workspace | [src/policy/pages/DraftsPage.tsx](../../../src/policy/pages/DraftsPage.tsx) + [DraftPolicyPage.tsx](../../../src/policy/pages/DraftPolicyPage.tsx) | `/drafts`, `/drafts/:policyId` |
| Review Workspace | [src/policy/pages/ReviewPage.tsx](../../../src/policy/pages/ReviewPage.tsx) | `/review` |
| Publish Center | [src/policy/pages/PublishPage.tsx](../../../src/policy/pages/PublishPage.tsx) | `/publish` |
| Read-only detail | [src/policy/pages/PolicyDetailPage.tsx](../../../src/policy/pages/PolicyDetailPage.tsx) | `/library/:policyId` |

Stores: [policyStore](../../../src/policy/stores/policyStore.ts), [draftStore](../../../src/policy/stores/draftStore.ts), [reviewStore](../../../src/policy/stores/reviewStore.ts).

---

## 1. Duplicated Work

| # | Duplication | Where | Cost |
|---|---|---|---|
| D1 | Policy list rendering (ID, status badge, tier, owner, domain) | DraftsPage, ReviewPage, PublishPage | Three implementations to maintain; visual drift; inconsistent sort/filter behavior |
| D2 | Status-badge rendering of `lifecycleStatus` | All three workspaces | Color/label drift; one screen showed wrong colors after a recent edit |
| D3 | Lifecycle transition buttons (Approve / Request Revision / Reject) | DraftPolicyPage + ReviewPage both mutate `policyStore.setLifecycleStatus` | Two paths to the same write; no central guard |
| D4 | Re-fetching the same Policy + version + comments on each tab | Every screen re-derives a "current version" from `policies[]` | Duplicate selector logic; wasted re-renders |
| D5 | Approval evidence editor (notes, decision) | Reproduced inline in ReviewPage and partially in DraftPolicyPage | Inconsistent field validation |
| D6 | "Print / download / share" actions | PolicyDetailPage and PublishPage independently call `printForm` | Different print headers; PII redaction varies |

---

## 2. Unnecessary Navigation (Click & Context-Switch Audit)

A representative real workflow — Compliance Officer reviewing a Revision-Requested policy through to publish — currently requires:

1. `/drafts` → click policy → `/drafts/:id` (edit context) — **2 clicks, 1 route**
2. Save → manually navigate to `/review` to comment — **1 click, 1 route**
3. From `/review`, switch back to `/drafts/:id` to address comments — **1 click, 1 route**
4. Re-route back to `/review` to mark resolved + Approve — **1 click, 1 route**
5. Navigate to `/publish` to queue distribution — **1 click, 1 route**
6. Navigate to `/library/:id` to verify final published version — **1 click, 1 route**

**Total: 7 deliberate route switches and ≥12 clicks for a single policy through one revision loop.** Each route switch tears down + re-mounts the stores' selectors and forces the user to re-orient.

**Auxiliary navigation tax**

- No persistent "current policy" focus: opening `/review` does not remember the policy you were just editing in `/drafts`.
- No deep-link from a comment to the section/line it references (`selectedTextRef` is never populated — see Gap G3 below).
- No way to compare versions side-by-side without leaving the workspace and using browser tabs.

---

## 3. Audit Gaps

| # | Gap | Evidence | Compliance impact |
|---|---|---|---|
| A1 | Audit trail is in-memory only (`policyStore.auditTrail`) and resets on refresh | [policyStore.ts](../../../src/policy/stores/policyStore.ts) — no persistence layer | Hash-chain integrity required by eCIgn schema is not preserved client-side; surveyor cannot reconstruct timeline |
| A2 | `PublishJob` lifecycle is not written to the audit log | PublishPage queues jobs without emitting an audit event | Distribution evidence (EN-FM-007) cannot be reconstructed |
| A3 | Comment resolution events are not audited | ReviewPage marks comments Resolved without writing to `auditTrail` | Cannot prove a Required comment was addressed |
| A4 | No actor identity verification | All actions stamp `actor = "Demo User"` | Approval signatures cannot be tied to a real person; violates GV-GB-001 §6.3 |
| A5 | Hash chain (`prev_hash` / `hash`) defined in schema but not produced by client | [migrations/001_ecign_schema.sql](../../../migrations/001_ecign_schema.sql) defines columns; client never sets them | Tamper-evidence absent |
| A6 | Acknowledgments not tracked post-publish | `PolicyAssignment` has no `acknowledgedAt`, no escalation timer | EN-WF-03 14-day rule unenforceable |

---

## 4. Missing Enforcement

The system today **renders** the rules but does not **enforce** them. Specifically:

- **E1. Approval authority is not validated.** The Approve button on `/review` is enabled for any user. There is no check that a REQUIRED-tier policy is being approved by the Governing Body, or that the Administrator approved a RECOMMENDED policy.
- **E2. Self-approval is permitted.** Author can approve their own policy.
- **E3. Required-comment gate is partial.** ReviewPage warns but does not strictly block when an unresolved Required comment exists if the user selects Approve quickly.
- **E4. Conflict-of-interest pre-check missing.** Approver eligibility per GV-GB-001 Appendix C is not consulted.
- **E5. Two-stage review is not staged.** Stakeholder review and Legal/Compliance review are collapsed into one undifferentiated comment thread; the system cannot tell who is in which stage or whether `EN-FM-006` sign-off has been attached.
- **E6. Committee minutes attachment is not required.** A REQUIRED policy can be approved without `GV-FM-005` minutes attached.
- **E7. Effective date validation is absent.** A version can be marked Approved with `effectiveDate` earlier than `approvedDate`.
- **E8. Retention policy not applied.** Versions can be deleted from in-memory store at will; no retention floor enforcement.
- **E9. Publish allowed before distribution channels are configured.** PublishPage queues a SCORM job even if the SCORM endpoint isn't reachable; no readiness check.
- **E10. No "exactly one Active version" invariant.** Two versions of the same policy can both be set to Published in the store with no guard.

---

## 5. Weak Approval Tracking

- The `ApprovalDecision` record captures only `decision`, `notes`, `reviewer`, `timestamp`. It does **not** capture:
  - which version was approved (relies on caller to set correctly)
  - the approver's role and tier
  - the approval body (Governing Body session, Compliance Committee meeting, etc.)
  - the meeting-minutes reference (`GV-FM-005`, `CO-FM-024`)
  - the signature artifact (`signature_hash` from eCIgn)
- There is no concept of **multi-approver requirements** (REQUIRED policies need GB chair + Compliance Officer + Administrator co-signatures per the source corpus). The current model collapses this into one decision.
- No visualization of "approvals needed vs received" anywhere in the UI.
- No SLA tracker: the 15- and 10-business-day windows from EN-WF-01 are nowhere visible to users.

---

## 6. Inefficient Handoffs

| Handoff | Today | Failure mode |
|---|---|---|
| Author → Reviewer | Author saves draft, then must verbally tell reviewer; no in-app notification or assignment | Reviewer never sees it; SLA clock starts silently |
| Reviewer → Author (revision request) | Status flips to "Revision Requested"; no in-app notification, no comment-bundle delivered | Author must re-discover what to change |
| Reviewer → Compliance Officer | No distinction between stages; CO may approve before Legal review is complete | Premature approval |
| Compliance Officer → Governing Body | No queue, no agenda binding to the next quarterly meeting | Approval slips a quarter |
| Approver → Distribution | Status flips to "Approved"; PublishPage doesn't auto-queue — distribution may never run | Policy approved but never distributed; staff cannot acknowledge what doesn't exist |
| Distribution → Acknowledgment | No assignments auto-created on publish | Staff acknowledgment list is empty |
| Acknowledgment → Audit | Acknowledgments never aggregate back into the policy's compliance health metric | Surveyor sees binary "published" but no proof of actual reach |

---

## 7. Quantified Pain Summary

| Metric | Today | Target after consolidation |
|---|---|---|
| Routes traversed for one full lifecycle | ≥ 7 | 1 (single workspace, lifecycle-aware tabs) |
| Click count for "Approve and publish" | ~12 | ≤ 4 |
| Re-renders of full policy list per workflow | 3+ | 1 |
| Independent stores touching same policy state | 3 (`policy`, `draft`, `review`) + ad-hoc local state | 1 lifecycle store + slices |
| Audit events persisted | 0 (in-memory) | 100% (server-persisted, hash-chained) |
| Approval-eligibility gates | 0 | All transitions guarded |
| Required-comment gate | Soft warning | Hard block |
| Active-version invariant | Not enforced | Enforced atomically |

---

## 8. Top-10 Gaps to Close in the New Workspace

1. **Unify the three pages into one route** with mode-aware panels (no more route switching to change verbs).
2. **Persist the lifecycle store** to the server; eliminate refresh data loss.
3. **Replace the free `setLifecycleStatus` writes** with an explicit state-machine transition function that runs guard checks.
4. **Materialize `ApprovalRequirement` rows** per tier so the UI can show "needs 3 of 3 signatures" with progress.
5. **Wire approval signatures through the existing eCIgn pipeline** instead of a free-form note field.
6. **Bind comments to section + character range** so resolution requires returning to the exact text.
7. **Auto-create `PolicyAssignment` rows on publish** based on role mapping; start the 14-day acknowledgment timer.
8. **Atomic Active↔Superseded swap** at publish time, with a rollback path if distribution fails.
9. **Hash-chain audit writes** for every transition; mirror to `ecign.audit_events` server-side.
10. **Surface SLA timers** (15-day stakeholder, 10-day legal, 14-day acknowledgment) in the UI and the Compliance Calendar.

These gaps drive the architecture in [03-Policy-Lifecycle-Architecture.md](03-Policy-Lifecycle-Architecture.md).
