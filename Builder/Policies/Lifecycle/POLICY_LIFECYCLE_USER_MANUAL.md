# Policy Lifecycle Workspace — End-User Manual

> A practical guide for everyone who touches a policy: authors, reviewers, the Compliance Officer, the Administrator, the Governing Body Chair, department directors, and staff acknowledging policies.

---

## 1. What this workspace is

The **Policy Lifecycle Workspace** is the one place where every policy moves from idea to enforceable record. It replaces three older screens — Draft Workspace, Review Workspace, and Publish Center — with a single page that switches what it shows based on what you need to do.

You always see the same workspace. Only the **mode** changes:

- **Edit** — author the policy
- **Review** — read and comment on it
- **Approve** — sign it where you have authority
- **Publish** — activate it for the agency
- **View** — read the active version (or any historical one)

You never have to leave the workspace to switch modes. You never have to re-find the policy you were just on.

---

## 2. The shape of the screen

```
┌──── Top bar — policy ID · version · stage · owner · compliance flags · mode toggle ────┐
│                                                                                          │
│  Left panel        Center workspace                            Right panel              │
│  • Stages           • Section navigator                         • Required Approvals    │
│  • Your queues      • Editor / viewer / comment overlay         • eCIgn signatures      │
│  • Filters          • Diff lens                                 • Evidence checklist    │
│                                                                 • Audit trail           │
│                                                                 • Publish readiness     │
│                                                                                          │
│  Optional footer dock — appears only when there are unresolved Required comments        │
│  Optional batch bar  — appears when you select multiple rows in your queue              │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Lifecycle stages, in plain language

| Stage | What it means |
|---|---|
| **Drafting** | An author is writing a new version. |
| **Internal Review** | Stakeholders are reading and commenting. 15-business-day window. |
| **Compliance Review** | Compliance Officer / Legal are checking it. 10-business-day window. |
| **Pending Approval** | Waiting on the right signatures (Governing Body for REQUIRED, Administrator for RECOMMENDED, Department Director for OPTIONAL). |
| **Approved for Publish** | Signed, locked, and waiting for its effective date or for distribution to run. |
| **Published** | Distribution has been sent out. |
| **Active** | The version currently in force across the agency. |
| **Under Revision** | A new draft is being written *while the current Active version stays Active*. |
| **Archived** | Only used when the law or a regulator requires the policy to be retired with no replacement. |

> **There is no "Deprecated" state.** Old versions become **Superseded** the instant a new version becomes Active. Coverage is always continuous.

---

## 4. By role: what you'll do here

### 4.1 Author / Policy Owner

Your default queue is **My drafts & revisions**.

To start a new policy:
1. The Master Index entry must already exist. If it doesn't, ask the Compliance Officer to file `EN-FM-002`.
2. From the queue, click **+ New version**.
3. Fill in every required section in the editor. The system marks empty required sections with an inline warning.
4. Type a **change summary** (what is this version changing or introducing). This is mandatory.
5. Click **Submit for Internal Review**. The clock starts.

To revise an Active policy:
1. Open the policy, click **Open Revision**. A new draft version appears alongside the Active version. The Active version is *not affected*.
2. Make your edits, fill in change summary, submit for review.

### 4.2 Reviewer (Stakeholder, Internal Review)

Your default queue is **Awaiting your review**, sorted by SLA risk.

To comment:
- Highlight any text in the editor and press:
  - `R` for a **Required** comment (blocking; must be resolved before the policy advances)
  - `S` for a **Suggestion** (non-blocking)
  - `C` for a **General** comment

To advance: when all Required comments are resolved by the author, the policy moves to Compliance Review automatically when the author clicks **Send to Compliance Review**.

### 4.3 Compliance Officer

Your default queues are **Compliance review queue** and **Approval-block alerts**.

In Compliance Review mode you:
1. Read the version, file Required comments where needed.
2. Attach the **Legal & Compliance Sign-Off** (`EN-FM-006`) from the right rail's Evidence checklist.
3. Click **Submit for Approval**.

You also sign as one of the approvers. You will see the Sign button in the right-rail Required Approvals card when you are eligible.

### 4.4 Administrator

You see two queues: **Awaiting your approval (RECOMMENDED)** and **Co-sign queue (REQUIRED)**.

To approve:
1. Open a policy from your queue.
2. Mode is automatically set to **Approve**.
3. In the right rail's Required Approvals card, click **Sign**. Type your name, draw your signature, confirm the attestation.
4. The card row turns green. When all rows are green, the version becomes Approved.

You **cannot** approve a policy you authored — that's blocked by the system.

### 4.5 Governing Body Chair

Your default queue is **Quarterly approval agenda**, sorted by the next quarterly meeting date.

For REQUIRED policies you sign during or after the meeting:
1. Attach the meeting minutes reference (`GV-FM-005#YYYY-Qn-minutes`) in the requirement row.
2. Sign in the same row.
3. The policy moves to Approved as soon as the Compliance Officer and Administrator have also signed.

### 4.6 Department Director

You appear as the OPTIONAL-tier approver for policies in your domain. Your queue is **OPTIONAL approvals (your domain)**. The flow is identical to the Administrator's, with the Compliance Officer co-signing.

### 4.7 Staff (acknowledging a policy)

When a new version becomes Active, you receive an assignment in **My Acknowledgments**. You have **14 calendar days**.

1. Open the assignment. Read the policy.
2. Read the attestation.
3. Sign with eCIgn (typed name + drawn signature).
4. Done. Your acknowledgment is recorded permanently.

If you don't acknowledge in time, your supervisor and HR are notified automatically.

### 4.8 Audit / Surveyor (read-only)

Open `/audit` for the per-policy compliance scorecard, or open the workspace in **View** mode with `?asOf=YYYY-MM-DD` to see the policy as it was on a specific date. From there, **Export Evidence Pack** assembles everything an external auditor needs: the active version, the audit log, all signatures, all acknowledgments, all distribution receipts — sealed with a manifest hash.

---

## 5. Doing it faster: shortcuts

| Keys | Action |
|---|---|
| `Cmd/Ctrl + K` | Jump to a policy / person / stage |
| `[` / `]` | Previous / next policy in your current queue |
| `E` / `R` / `A` / `P` | Switch to Edit / Review / Approve / Publish mode |
| `G` then `Q` | Back to your queue |
| `C` / `R` / `S` | (in Review mode) Add a General / Required / Suggestion comment on highlighted text |
| `?` | Show all shortcuts |

---

## 6. The right-rail cards — what each one tells you

| Card | What it shows | When you use it |
|---|---|---|
| **Required Approvals** | Each signature the version needs, with status | When in Approve mode |
| **eCIgn Signatures** | History of every signature on this version | Always |
| **Evidence Checklist** | Forms and minutes that must be attached | All stages |
| **Audit Trail** | Every change, comment, signature, transition | Always; surveyor view |
| **Publish Readiness** | The single checklist gating Activate | When in Publish mode |

---

## 7. Why the system blocks you (the most common reasons)

| You're trying to | …and the system says no when |
|---|---|
| Submit for Internal Review | A required section is empty, or change summary is missing |
| Advance to Compliance Review | At least one Required comment is still Open |
| Submit for Approval | The Compliance/Legal sign-off (`EN-FM-006`) isn't attached |
| Sign the approval | You wrote the version (no self-approval), your COI is missing/expired, or you don't hold the role this requirement asks for |
| Approve | A required signature row is still empty |
| Activate | The effective date is in the past, a distribution channel is unhealthy, or the prior Active version isn't ready to be superseded |
| Edit a version | The version is locked (state is past Drafting) — you need to **Open Revision** instead |
| Archive a policy | The retention floor for that domain hasn't been reached, or another active policy still references it |

Each block tells you **exactly which rule** stopped you and what to do.

---

## 8. The Active-version promise

At every moment, **exactly one version of every policy is Active**. When a new version is activated, the old one becomes Superseded *in the same instant* — there is no gap, no "between policies" state, no enforcement vacuum. If anything goes wrong during activation (a distribution channel fails, a signature is invalid, the audit chain detects tampering), the activation aborts entirely and the previous version stays Active until the issue is resolved.

This is the most important promise the workspace makes.

---

## 9. The Under-Revision promise

When you open a revision on an Active policy:
- The current Active version **keeps being enforced**.
- The new draft runs in parallel, going through Internal Review, Compliance Review, and Approval on its own track.
- Staff continue to acknowledge and follow the current Active version until the new one is fully approved and activated.
- At activation, the swap is atomic. Same instant. No gap.

You do not need to "deactivate" anything. The system handles it.

---

## 10. What's permanent and what isn't

- **Permanent (cannot be edited or deleted):**
  every approved version, every signature, every acknowledgment, every audit event, every distribution record.
- **Editable:**
  drafts in `Drafting` state, comments before they're resolved, your filter selections in the left rail, your queue sort.
- **Retained for years:**
  policies and their evidence are kept for at least 7 years (10 for clinical and billing-related, life of agency for governance and quality). The Archive action is only available after the retention floor is met *and* a legal/regulatory authority is cited.

---

## 11. Getting help

- **? key** — keyboard shortcut overlay.
- **Right-rail overflow → Help & Guidance** — context-aware articles for the current stage.
- **Help Center (`/help`)** — full knowledge base, including step-by-steps for every action in this manual.
- **Compliance Officer** — anything blocked, unclear, or unusual.

---

## 12. Glossary (the words this workspace uses, and what they mean)

| Word | Meaning |
|---|---|
| Active | The single, in-force, enforceable version of a policy |
| Superseded | A prior version that has been replaced atomically by a newer Active version |
| Archived | A policy that has been formally retired with no successor (rare; legal/regulatory only) |
| Draft / Drafting | A version still being written; not enforceable |
| Internal Review | Stakeholder review window (15 business days) |
| Compliance Review | Compliance + Legal review window (10 business days) |
| Pending Approval | Waiting on required signatures by tier |
| Approved for Publish | Signed and locked; waiting on effective date and distribution |
| Under Revision | A new draft is in progress while the Active version remains active |
| Required comment | A blocking review note that must be resolved before the policy advances |
| eCIgn | The agency's electronic-signature system; every signature here uses it |
| ApprovalRequirement | A row that says "this role must sign for this version" |
| PolicyAssignment | An acknowledgment task assigned to a staff member when a version activates |
| Evidence Pack | A self-contained, hash-sealed export for surveyors |
| Audit trail | Append-only, hash-chained record of every change |

There is **no "Deprecated"** in this glossary. The workspace does not use that word. If you see it anywhere, please report it as a bug.
