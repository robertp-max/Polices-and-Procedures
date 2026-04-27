# 03 — Workflow-Based Execution

## 1. The Decomposition Rule

All work in a sprint is decomposed exactly as:

```
Event  →  Workflow  →  Execution Unit
```

| Term | Definition |
|---|---|
| **Event** | A `RegulatoryEvent` from the calendar (e.g., `EVT-QAPI-2026-Q3`). |
| **Workflow** | A `Workflow` from `workflows.generated.ts` (e.g., `QA-WF-01` Quarterly QAPI Review). One event maps to **one or more** workflows. |
| **Execution Unit** | One invocable, signable, auditable unit of work derived from a workflow step. Equivalent to one row in the workflow's "Step-by-Step Execution" table, materialized for this sprint. |

A sprint board never shows "tasks." It shows **execution units**, each carrying its parent **workflow** and originating **event**.

---

## 2. Workflow Phase Mandate

Every execution unit belongs to one of the five canonical workflow phases:

| Phase | Defined Activities | Compliance State |
|---|---|---|
| **Preparation** | Pull data, compile inputs, distribute pre-read, schedule | `pending` |
| **Documentation** | Conduct meeting, produce minutes, complete form, draft report | `in-progress` |
| **Review** | Domain lead review, compliance review, redline, finalize | `in-progress` |
| **Signature** | eCIgn routing, capture signatures of required roles | `awaiting-signature` |
| **Audit** | File in audit repository, index, link to event evidence pack | `complete` |

A workflow that does not cleanly decompose into these phases is mis-modeled and must be fixed in `workflows.generated.ts` source markdown — not in the sprint.

---

## 3. Required Per-Workflow Metadata

Every workflow surfaced in a sprint must carry:

| Field | Source | Required |
|---|---|---|
| Workflow ID | `workflows.generated.ts` `id` | Yes |
| Defined steps | `workflows.generated.ts` `steps[]` | Yes |
| Required forms | `event.requiredForms` ∪ `workflow.steps[].formIds` | Yes |
| Required signatures | `event.approvals[]` filtered to `targetKind: 'minutes' | 'form' | 'report'` | Yes (when applicable) |
| Dependencies | `event.dependencies.dependsOn` | When applicable |

If any required field is missing, the execution unit is auto-flagged **blocked** at sprint open (see `10-Enforcement-and-Rules.md`).

---

## 4. One Event → Multiple Workflows

Many events drive **more than one** workflow. Example: `EVT-CO-2026-PP-ANNUAL` (Annual P&P Enterprise Review) drives:

- `EN-WF-02` Annual Policy Review (Full Framework) — primary
- `EN-WF-01` Policy Lifecycle (per-policy revisions identified during review)
- `GV-WF-*` Governing Body approval workflow (final P&P sign-off)

The sprint board groups all execution units **under their originating event**, then **under their workflow** within that event:

```
EVT-CO-2026-PP-ANNUAL
├── EN-WF-02 (Annual Policy Review – Full Framework)
│   ├── Prep: P&P inventory             [Compliance Officer]
│   ├── Doc:  Domain attestations        [Domain Leads]
│   ├── Rev:  Cross-domain review        [Compliance Officer]
│   ├── Sig:  Domain lead signatures     [eCIgn routing]
│   └── Aud:  File in P&P archive        [Compliance Officer]
├── EN-WF-01 (Policy Lifecycle — per flagged policy)
│   └── (instantiated only for flagged policies)
└── GV-WF-* (Governing Body Approval)
    ├── Doc:  Submit GB packet           [Administrator]
    ├── Sig:  Board Chair signature      [eCIgn]
    └── Aud:  File in GB archive         [Administrator]
```

---

## 5. Multi-Year Event Decomposition

Multi-year events (Biennial, Triennial — see `MULTI_YEAR_EVENTS` in `multiYearEvents.ts`) follow the same model. They are **not exempt** from workflow decomposition.

| Event | Primary Workflow |
|---|---|
| `EVT-RM-2026-ENTRISK-BIENNIAL` | `RM-WF-15` Annual Enterprise Risk Reassessment (biennial deep variant) |
| `EVT-EN-2026-PFRAMEWORK-BIENNIAL` | `EN-WF-02` Annual Policy Review (biennial re-baseline variant) |
| `EVT-HR-2026-COMPETENCY-BIENNIAL` | `CL-WF-25` + `HR-WF-05` (joint validation) |
| `EVT-CO-2026-EFFECTIVENESS-BIENNIAL` | `QA-WF-11` Policy Effectiveness Monitoring (biennial deep variant) |
| `EVT-CO-2026-OIG-WORKPLAN` | `CO-WF-15` + `CO-WF-16` + `CO-WF-08` |
| `EVT-CO-2026-COMPREHENSIVE-TRIENNIAL` | `QA-WF-11` (triennial enterprise sweep) |
| `EVT-CO-2026-EXTREVIEW-TRIENNIAL` | `QA-WF-11` + external-reviewer engagement |
| `EVT-GV-2026-STRATEGIC-TRIENNIAL` | Governance program workflow (Board-led) |

The biennial / triennial cadence does **not** lower the workflow mandate. Each cycle goes through all 5 phases.

---

## 6. Forbidden Patterns

| Pattern | Why Forbidden |
|---|---|
| "Generic checklist" not tied to a workflow ID | Breaks audit traceability. |
| "Quick task" with no event reference | Violates calendar-driven model. |
| Workflow shown without all 5 phases | Hides skipped phases. |
| Combining two workflows into one execution unit | Breaks ownership and signature tracking. |
| Renaming workflow phases per team preference | Breaks compliance-state mapping. |

---

## 7. Authoritative Source

The authoritative workflow definitions live in:

- `Builder/Policies/Workflows/*-WORKFLOWS.md` (markdown source)
- `src/policy/data/workflows.generated.ts` (compiled runtime source)

All sprint instantiation reads from the compiled runtime. Edits flow source → compile → sprint instantiation. The sprint never edits a workflow definition.
