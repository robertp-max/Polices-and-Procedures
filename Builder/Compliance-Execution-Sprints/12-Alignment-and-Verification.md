# 12 — Alignment & Verification

> **Authoritative guarantee:** every recurring/mandated obligation in CES
> resolves to the canonical chain
>
> ```
> policy_id  →  workflow_id  →  event_id  →  artifact_ids[]
> ```
>
> and **no recurring event is scheduled on a Saturday or Sunday** unless
> the event explicitly opts in via `isWeekendAllowed: true`.
>
> The contract is enforced in code by `scripts/verifyAlignment.ts` and
> runnable as `npm run verify:alignment`. The script exits non-zero on
> any violation; CI / pre-commit may rely on it.

---

## 1. Why this exists

Earlier system reviews flagged that policies, workflows, and calendar
events were structurally complete in isolation but not deterministically
wired together. Without this layer, generated tasks would detach from
the audit chain, evidence would lose traceability, and weekend-anchored
recurring events would silently violate the operational SLA.

This document is the single source of truth for the alignment rules.
All other CES docs (01–11) reference it.

---

## 2. The five rules (enforced)

| # | Rule | Failure mode in CES |
|---|------|---------------------|
| 1 | **No recurring event on a weekend.** Cadence ∈ {Weekly, Biweekly, Monthly, Quarterly, Semiannual, Annual, Biennial, Triennial} ⇒ `date` must be Mon–Fri. Override only via `event.isWeekendAllowed === true`. | Calendar drift; staff cannot execute on non-working days. |
| 2 | **Every event resolves to ≥1 policy.** `event.policyRefs[]` non-empty (excluding `isContext` markers like holidays). | Audit packet cannot prove the regulatory driver. |
| 3 | **Every workflow declares a `workflowType`.** One of `audit`, `operational`, `enforcement`, `intake`, `aggregate`. | QAPI overload (everything labelled audit) or untracked enforcement loops. |
| 4 | **Every workflow references ≥1 policy.** `workflow.policyRefs[]` non-empty. | Workflow runs without a regulatory hook → unrecognized in survey. |
| 5 | **Every workflow lists ≥1 required form** (excluding `aggregate`, which consumes evidence). | Evidence vacuum: workflow completes but produces no audit artifact. |

---

## 3. Workflow type taxonomy

| Type | Purpose | Feeds | Example |
|------|---------|-------|---------|
| `audit` | Evaluates compliance, produces findings. | QAPI + CAP loops | `CL-WF-26` Plan of Care Audit |
| `operational` | Performs the work; produces evidence consumed by audits. | Audit workflows | `CL-WF-04` SOC Comprehensive Assessment |
| `enforcement` | Reacts to failure (CAP, escalation, discipline, termination). | Owner queues | `HR-WF-09` Disciplinary Action |
| `intake` | Captures incoming reports/requests (incident, FWA, grievance). | Triage workflows | `CL-WF-23` Patient Complaint / Grievance |
| `aggregate` | Consumes audit outputs (QAPI, governing body review). | Governance | `QA-WF-03` QAPI Quarterly Review |

**Source convention:** the compiler infers `workflowType` from the
authored markdown filename:

| Filename pattern | Inferred type |
|------------------|---------------|
| `*-WORKFLOWS-AUDIT.md` | `audit` |
| `*-WORKFLOWS-ENFORCEMENT.md` | `enforcement` |
| `*-WORKFLOWS-INTAKE.md` | `intake` |
| `*-WORKFLOWS-AGGREGATE.md` | `aggregate` |
| `*-WORKFLOWS.md` (no suffix) | `operational` (default) |

Title-keyword overrides apply when the filename is generic (e.g. a title
containing `AUDIT` or `QAPI` is reclassified accordingly). The verifier
fails if any workflow ends up `undefined`.

---

## 4. Weekend guard

Implemented as `enforceBusinessDay()` in
[src/policy/data/regulatoryEvents.ts](../../src/policy/data/regulatoryEvents.ts):

- Sat/Sun anchors are shifted **forward** to the next Mon–Fri (never
  backwards) so deadlines are preserved.
- The shift restamps the event ID when the ID embeds the original
  YYYYMMDD segment (so audit traceability is intact).
- `event.isWeekendAllowed === true` skips the shift — reserved for true
  24/7 obligations (on-call drills, holiday-period surveys).
- The exported `REGULATORY_EVENTS` array passes every entry through this
  guard, including the inline definitions in `regulatoryEvents.ts`,
  `MANDATED_EVENTS_EXPANDED`, and `auditRegulatoryEvents`.

Sprint windows themselves (see `complianceExecutionStore.ts`) are also
Mon–Fri-bound: `SPRINT_WORK_DAYS = 12` calendar days, anchored to a
Monday and ending on the Friday of week 2.

---

## 5. Running the verifier

```powershell
npm run verify:alignment
```

Output:

```
═══════════════════════════════════════════════════════
 CES ALIGNMENT VERIFIER
═══════════════════════════════════════════════════════
 Events  scanned: 254
 Workflows scanned: 206
 Findings: 0
───────────────────────────────────────────────────────
 ✓ 100% alignment — no findings.
```

Any non-zero finding count blocks the build. Findings are grouped by
rule code so the responsible team can fix the source data:

| Code | Fix in |
|------|--------|
| `WEEKEND_ON_RECURRING` | Shift the event date or set `isWeekendAllowed: true` if genuinely 24/7. |
| `EVENT_MISSING_POLICY_REF` | Add the controlling policy IDs to `event.policyRefs[]`. |
| `WORKFLOW_MISSING_TYPE` | Rename the source markdown with an `-AUDIT/-ENFORCEMENT/-INTAKE/-AGGREGATE` suffix, or re-run the compiler if the title now triggers a heuristic. |
| `WORKFLOW_MISSING_POLICY_REF` | Populate §1 POLICY REFERENCES in the workflow markdown. |
| `WORKFLOW_MISSING_EVIDENCE` | Populate §7 REQUIRED FORMS & DOCUMENTS in the workflow markdown. |

---

## 6. CI integration (recommended)

```jsonc
// package.json
"scripts": {
  "compile:workflows":  "tsx scripts/compileWorkflows.ts",
  "verify:alignment":   "tsx scripts/verifyAlignment.ts",
  "ci":                 "npm run compile:workflows && npm run verify:alignment && npm run lint && npm run build"
}
```

The compiler runs first so freshly generated workflow data is what the
verifier inspects.

---

## 7. Cross-references

- 01-Execution-Model.md — calendar-driven model
- 07-Recurring-Execution.md — mandatory per-sprint recurring units
- 09-Calendar-Integration.md — calendar primacy
- 10-Enforcement-and-Rules.md — blocking and closure gates
- System/05-Audit-and-Evidence-Generation.md — evidence emission
- System/07-Shared-Data-Contracts.md — type contracts
