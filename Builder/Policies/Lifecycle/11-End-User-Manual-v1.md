# Policy Lifecycle Workspace — End-User Manual (Implementation v1)

> Practical, screen-by-screen guide aligned to what is actually shipping in CI-App today.
> For the long-form architectural target see [POLICY_LIFECYCLE_USER_MANUAL.md](POLICY_LIFECYCLE_USER_MANUAL.md).
> For the developer reference see [10-Developer-Documentation.md](10-Developer-Documentation.md).

---

## Current v1 Implementation Status

**You can do today**
- Open the unified workspace at `/policy-lifecycle`
- Browse the full **278-policy** corpus (same policies visible in `/library`) — all start in **DRAFT**, created by TJ Padilla · AI Researcher · `robertp@careindeed.com`
- See the **Source** provenance strip at the top confirming "Real Policy Corpus · N policies" (not placeholder/stub data)
- Filter the queue by state with the chips in the top bar
- Search the left rail by policy ID, title, owner, domain/subdomain code, or creator
- Select a policy to see its header card, mode chips, and lifecycle history with chain hashes
- Move a policy through every legal transition with rationale and message feedback
- Watch the "v2 preview" placeholder panels — they describe what the right-rail and center workspace will surface next

**Not yet wired (read-only placeholders only)**
- Required Approvals matrix
- eCIgn Signatures ceremony
- Evidence Checklist attachment
- Audit Trail evidence pack export
- Publish Readiness distribution checks (Drive, SCORM, intranet)
- Acknowledgment SLA tracker (the 14-day clock)

**What changed in v1.0.2**
- The lifecycle workspace no longer loads from `frameworkSeed.generated.ts`. That file contained 243 placeholder/stub policy records (`sourceType = "placeholder"`) which were only intended as framework scaffolding. Those records **no longer appear** in the lifecycle workspace.
- The lifecycle workspace now uses the same authoritative 278-policy corpus as `/library`. If you see a policy in the library, it appears in the lifecycle workspace in **DRAFT**.
- A **Source** strip below the header bar shows the provenance label so you can always verify which corpus is loaded.

---

## 1. What it is

The **Policy Lifecycle Workspace** at `/policy-lifecycle` is the single place where every Care Indeed policy moves through five clearly named states:

```
DRAFT  →  REVIEW  →  APPROVED  →  PUBLISHED  →  ARCHIVED
```

There is no "Deprecated" status. Old work is either replaced by a new active version or archived for legal retention.

This screen replaces the legacy **Drafts**, **Review Queue**, and **Publishing** screens. Old links continue to work but redirect here.

---

## 2. Opening the workspace

1. Click **Policy Lifecycle** in the left navigation rail.
2. The page opens with the queue empty on the right and all policies grouped on the left.
3. Click any state filter chip at the top right (DRAFT · REVIEW · APPROVED · PUBLISHED · ARCHIVED) to focus on a single state. Click the chip again or "clear" to see all states.

---

## 3. Reading a policy

Pick any policy from the left rail. Three things load:

- **Header card** (center, color-coded by state) — title, ID, owner, current state, and **"Created by"** attribution.
- **Lifecycle History** timeline (center) — every transition the policy has undergone, newest first, each with a chain hash that proves the entry has not been tampered with.
- **Actions panel** (right rail) — only the actions that are legal from the current state are shown.

> Every policy seeded in CI-App is currently in **DRAFT**, created by **TJ Padilla** (`robertp@careindeed.com`, AI Researcher).

---

## 4. The five states — what each one means

| State      | Meaning                                                                 | Who works on it           |
|------------|-------------------------------------------------------------------------|---------------------------|
| DRAFT      | Being authored. Sections are editable. Auto-saves while you type.       | Author                    |
| REVIEW     | Locked from author edits. Reviewers comment; required comments must be resolved before approval. | Reviewers                 |
| APPROVED   | All required signatures captured. Immutable. Awaiting publication.       | Approvers / Publishers    |
| PUBLISHED  | Live and enforceable. Distributed to its audience. Acknowledgments accruing. | Everyone in the audience  |
| ARCHIVED   | Terminal. Reached only when the policy is being legally retired with documented justification. | Compliance / Administrator |

---

## 5. Moving a policy through the lifecycle

You move a policy by selecting it, then clicking an action button in the right rail.

### From DRAFT

- **Submit for Review** → REVIEW. Use when the draft is complete enough for stakeholder review.
- **Archive** → ARCHIVED. Requires a rationale of at least 8 characters. Use only when the draft will never be published.

### From REVIEW

- **Approve** → APPROVED. **Cannot be performed by the author.** A different reviewer must click this. The system blocks self-approval automatically.
- **Request Revision** → DRAFT. Requires rationale. Use when the policy needs author rework.
- **Reject** → DRAFT. Requires rationale. Use for fundamental rejection.
- **Archive** → ARCHIVED. Requires rationale.

### From APPROVED

- **Publish** → PUBLISHED. Use when the effective date has arrived and distribution channels are ready.
- **Request Revision** → DRAFT. Requires rationale. Use if a defect is discovered before publication.
- **Archive** → ARCHIVED. Requires rationale.

### From PUBLISHED

- **Reopen for Revision** → DRAFT. Requires rationale. The published copy stays enforceable until a new version is republished.
- **Archive** → ARCHIVED. Requires rationale. Use when a policy is being retired.

### From ARCHIVED

- No actions are available. Archived is terminal.

---

## 6. The rationale field

A small textarea sits in the right rail above the action buttons. The four "regression" actions — **Request Revision, Reject, Archive, Reopen for Revision** — require at least 8 characters of rationale. The system rejects the click with a red message strip if the rationale is missing or too short.

The rationale is preserved verbatim in the lifecycle history and shown to anyone who views the policy later.

---

## 7. Mode chips

Below the header card you'll see five mode chips: **edit · review · approve · publish · view**.

Only modes valid for the current state are clickable; others are dimmed:

| Current state | Enabled modes              |
|---------------|----------------------------|
| DRAFT         | edit, view                 |
| REVIEW        | review, view               |
| APPROVED      | approve, publish, view     |
| PUBLISHED     | publish, view              |
| ARCHIVED      | view                       |

Switching modes does not change the policy's state — it changes which workspace tools are shown in the center pane.

---

## 8. The History timeline

Every action you take appends one immutable entry to the policy's history. Each entry shows:

- The action (e.g. `submitForReview`)
- The state transition (e.g. `DRAFT → REVIEW`)
- Who performed it (name, role)
- When (local time)
- The rationale (if one was provided)
- A 16-character chain hash

If two consecutive entries' chain hashes do not link properly, that is a tampering signal and is reported as a P0 incident.

---

## 9. Auditor Mode

If **Auditor Mode** is on, a yellow banner appears across the top and **every action is blocked**. Toggle Auditor Mode off (top bar control) to make changes again.

---

## 10. Common scenarios

### Promote a brand-new policy

1. Open Policy Lifecycle, filter to DRAFT, pick the policy.
2. Click **Submit for Review** in the right rail. State becomes REVIEW.
3. Switch user (or have the reviewer log in). Click **Approve**. State becomes APPROVED.
4. Click **Publish**. State becomes PUBLISHED.

### Send a policy back for rework

1. Pick the policy in REVIEW.
2. Type a rationale (≥ 8 chars) explaining what needs to change.
3. Click **Request Revision**. State returns to DRAFT and the rationale is logged.

### Republish after a fix

1. From PUBLISHED, click **Reopen for Revision** (rationale required). State becomes DRAFT; the published copy is unaffected until republished.
2. Edit, **Submit for Review**, **Approve** (different user), **Publish**.

### Retire a policy

1. From any non-archived state, type a rationale.
2. Click **Archive**. State becomes ARCHIVED, terminal.

---

## 11. Quick troubleshooting

| Message                        | Meaning                                                                 | Fix                                              |
|--------------------------------|-------------------------------------------------------------------------|--------------------------------------------------|
| `INVALID_TRANSITION`           | The action isn't allowed from the current state                         | Use the action buttons shown — others are hidden |
| `MISSING_RATIONALE`            | Rationale is empty or under 8 characters                                | Add a meaningful explanation                     |
| `SELF_APPROVAL_FORBIDDEN`      | The author tried to approve their own policy                            | Have a different reviewer click Approve          |
| `AUDITOR_MODE_BLOCK`           | Auditor Mode is on                                                      | Toggle Auditor Mode off                          |
| `ALREADY_TERMINAL`             | The policy is ARCHIVED                                                  | Archived policies cannot move; create a new one  |
| `NOT_FOUND`                    | The policy id has no lifecycle envelope                                 | Open the Library and re-seed if needed           |

---

## 12. Where to learn more

- **Help Center** → "Policy Lifecycle" category — six articles covering overview, states, transitions, attribution, the hash chain, and the developer reference.
- **Developer Documentation** → [10-Developer-Documentation.md](10-Developer-Documentation.md)
- **Architecture** → [03-Policy-Lifecycle-Architecture.md](03-Policy-Lifecycle-Architecture.md)
