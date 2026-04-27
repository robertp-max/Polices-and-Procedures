# 08 — Monthly Retrospective

## 1. When It Runs

The retrospective runs **in the last sprint of each calendar month**, on **Day 13** (Saturday) of that sprint.

If a calendar month contains two sprints, only the second is the "last sprint of the month." If a sprint spans two calendar months (rare; only when a sprint starts in the last week of a month), the retrospective for the first month runs at the **end of that first month** inside the active sprint.

The retrospective is **not** Agile-style team feedback. It is a **compliance-performance review** with mandated outputs and assigned corrective actions.

---

## 2. Retrospective Inputs

| Input | Source |
|---|---|
| All sprint snapshots for the month | Each sprint close snapshot (PHASE 5) |
| Audit chain verification reports (R4) | Recurring units (PHASE 6) |
| Open blocked items | Board state at retrospective time |
| Compliance metrics for the month | `11-Metrics-and-Reporting.md` rollup |
| Surveyor / regulator interactions in-month | Compliance Officer log |
| Findings from Audit (any internal/external) | Internal Audit log; external review log |
| OIG / regulatory updates published in-month | OIG Work Plan delta, CMS transmittals |

---

## 3. Mandatory Agenda

| # | Topic | Required Inputs | Output |
|---|---|---|---|
| 1 | **Compliance performance review** | Monthly metrics rollup | Confirmed metric values + variance commentary |
| 2 | **Missed deadline analysis** | Items closed `overdue` or carried with deadline breach | Per-miss table with cause taxonomy |
| 3 | **Audit findings review** | Audit chain verification + any internal/external audit items | Findings list with severity rating |
| 4 | **Root cause analysis** | Items from agenda 2 + 3 | RCA summary per material item using 5-Whys or equivalent |
| 5 | **Corrective action assignments** | RCA outputs | Named owner + due date per CAPA item |
| 6 | **Workflow adjustment proposals** | RCA outputs that point to workflow defects | Proposed changes to `workflows.generated.ts` source via `EN-LC-001` Policy Lifecycle |
| 7 | **Sprint cadence health** | Snapshots, capacity overruns, backup-activation rate | Sprint cadence health note |

The agenda is **not optional**. Skipping any topic requires written Administrator approval and is itself flagged in the next sprint as a risk.

---

## 4. Required Outputs

Each monthly retrospective produces:

1. **Monthly Compliance Retrospective Report** — file under `/audit/<YYYY>/Compliance/Retrospectives/<YYYY-MM>/`.
2. **Findings Log** — every miss, blocked carry-over, and audit finding with: severity, root cause, owner, due date.
3. **CAPA list** — corrective actions with owners and due dates that load into the **next sprint's Upcoming column** as their own execution units.
4. **Workflow change proposals** (if any) — submitted to `EN-LC-001` for approval and downstream regeneration of `workflows.generated.ts`.
5. **Signed retrospective minutes** — signed by Compliance Officer and Administrator.

---

## 5. Severity & Escalation

| Severity | Definition | Escalation |
|---|---|---|
| **Critical** | Missed federal-required deadline, missing required signature on a closed event, missed OIG/SAM monthly screen, missed annual PIP closure | Same-day notification to Administrator + Board Chair |
| **High** | Missed policy-driven deadline with regulatory adjacency, blocked critical event > 1 sprint | Notification to Administrator at retrospective |
| **Medium** | Carry-over of non-critical item > 1 sprint, capacity overruns | Tracked in retrospective only |
| **Low** | Process drift, documentation cleanup | Tracked in retrospective only |

Critical findings load into the next sprint as execution units **without** requiring a calendar event — they inherit the originating event reference.

---

## 6. Workflow Adjustment Discipline

If a workflow defect is identified:

1. The retrospective **does not** modify `workflows.generated.ts` directly.
2. A change proposal is opened against the source markdown in `Builder/Policies/Workflows/<DOMAIN>-WORKFLOWS.md`.
3. The change is reviewed and approved per `EN-LC-001` Policy Lifecycle.
4. `workflows.generated.ts` is regenerated via `npm run compile:workflows`.
5. The change takes effect for the **next** sprint after regeneration.

Bypassing this discipline is forbidden — it produces drift between sprint behavior and policy of record.

---

## 7. Retrospective Closure Gate

The monthly retrospective is **closed** only when:

| Condition | Verification |
|---|---|
| Report filed in audit repository | Path exists with index entry |
| All CAPA items have named owners and due dates | CAPA table complete |
| All Critical and High findings have escalation evidence | Escalation log shows acknowledgment |
| Workflow change proposals (if any) are submitted for `EN-LC-001` review | Proposal IDs recorded |
| Minutes signed by Compliance Officer and Administrator | eCIgn signatures captured |

If any condition is unmet, the retrospective remains open and **the next sprint does not enter its Closure gate** until it is closed (PHASE 10).

---

## 8. Forbidden Patterns

| Pattern | Why Forbidden |
|---|---|
| Treating retrospective as a feedback session without mandated outputs | Loses compliance value; produces no defensible artifact. |
| Carrying CAPA items repeatedly without escalation | CAPA aging is itself a finding. |
| Modifying workflows or events at the retrospective without going through `EN-LC-001` | Creates undocumented program drift. |
| Skipping the retrospective in months with no Critical findings | The act of running and documenting it **is** the operating-control evidence. |
