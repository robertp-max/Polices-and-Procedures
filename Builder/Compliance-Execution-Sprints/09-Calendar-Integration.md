# 09 — Calendar Integration

## 1. Calendar Primacy

> **The calendar drives the sprint. The sprint never drives the calendar.**

This is the single most important rule of the CES system. Regulatory deadlines exist independently of agency capacity. The CES system exists to **fit** the agency around immutable dates — not to negotiate them.

---

## 2. Authoritative Calendar Sources

| Source | Role | Maintenance |
|---|---|---|
| `src/policy/data/regulatoryEvents.ts` | Base regulatory + governance events | Compliance Officer |
| `src/policy/data/mandatedEventsExpanded.ts` | Expanded mandated events (QAPI quarterly, IC quarterly, annual evaluations, P&P, training, incident, complaint, survey) | Compliance Officer |
| `src/policy/data/multiYearEvents.ts` | Biennial / Triennial / OIG Work Plan Review | Compliance Officer |
| External holiday calendar (informational) | Holiday markers | n/a — informational only, not a deadline source |

The flat array `MANDATED_EVENTS_EXPANDED` (in `mandatedEventsExpanded.ts`) is the single load point for sprint instantiation; it spreads `MULTI_YEAR_EVENTS` into the same array.

---

## 3. Sprint-Loading Algorithm

At Day 1, 00:00 of each sprint, the loader runs:

```text
For each event E in (REGULATORY_EVENTS ∪ MANDATED_EVENTS_EXPANDED):
    If E.date is within sprint window:                               # main event
        load E into sprint
    For each step S in E.processFlow:
        If E.date + S.dueOffsetDays is within sprint window:         # prep work
            load (E, S) as execution unit
    For each form F in E.requiredForms:
        If E.date + F.dueOffsetDays is within sprint window:         # form preparation
            load (E, F) as execution unit
    For each followUp U in E.followUps:
        If E.date + U.dueOffsetDays is within sprint window:         # closure work
            load (E, U) as execution unit
```

This is fully deterministic. There is no human selection step.

---

## 4. Deadline Immutability

| Deadline Source | Immutable? | Rationale |
|---|---|---|
| `event.date` (federal-required, conditional-federal) | **Yes** | CFR / federal statute |
| `event.date` (state-required) | **Yes** | State regulation |
| `event.date` (policy-driven) | **Yes** | Agency policy of record (only changeable through `EN-LC-001`) |
| `dueOffsetDays` on process steps | **Yes** | Anchored to event date |
| `escalationDays` on approvals/follow-ups | **Yes** | Defensibility chain |

If a deadline appears unworkable, the answer is **never** to slide the deadline; the answer is to expand sprint capacity, escalate, or formally amend the underlying policy.

---

## 5. Holiday and Weekend Handling

| Scenario | Handling |
|---|---|
| Event `date` falls on a weekend | The event still owns that date. Workload distribution within the sprint shifts so signatures and meetings happen on adjacent business days. |
| Event `date` falls on an agency holiday | Same as weekend. |
| Sprint Day 14 closure on a holiday | Closure gate still executes; system actions complete automatically. Manual sign-offs default to next business day but do not extend the sprint. |
| Federal deadline (e.g., POC submission) on a non-business day | Per CMS rules, deadline rolls to next business day **only** when the regulator explicitly allows it. Otherwise the date holds. |

---

## 6. Multi-Year Event Calendar Handling

Multi-year events (`MULTI_YEAR_EVENTS`) carry **both** the current occurrence and the next occurrence as separate events:

| Event | Current | Next |
|---|---|---|
| Enterprise Risk Assessment (Biennial) | `EVT-RM-2026-ENTRISK-BIENNIAL` (2026-07-08) | `EVT-RM-2028-ENTRISK-BIENNIAL` (2028-07-08) |
| Full Policy Framework Review (Biennial) | `EVT-EN-2026-PFRAMEWORK-BIENNIAL` (2026-07-15) | `EVT-EN-2028-PFRAMEWORK-BIENNIAL` (2028-07-15) |
| Workforce Competency Validation (Biennial) | `EVT-HR-2026-COMPETENCY-BIENNIAL` (2026-07-22) | `EVT-HR-2028-COMPETENCY-BIENNIAL` (2028-07-22) |
| Compliance Effectiveness Review (Biennial) | `EVT-CO-2026-EFFECTIVENESS-BIENNIAL` (2026-07-29) | `EVT-CO-2028-EFFECTIVENESS-BIENNIAL` (2028-07-29) |
| Comprehensive Compliance Evaluation (Triennial) | `EVT-CO-2026-COMPREHENSIVE-TRIENNIAL` (2026-07-30) | `EVT-CO-2029-COMPREHENSIVE-TRIENNIAL` (2029-07-30) |
| External Independent Review (Triennial) | `EVT-CO-2026-EXTREVIEW-TRIENNIAL` (2026-07-31) | `EVT-CO-2029-EXTREVIEW-TRIENNIAL` (2029-07-31) |
| Strategic Effectiveness Assessment (Triennial) | `EVT-GV-2026-STRATEGIC-TRIENNIAL` (2026-07-31) | `EVT-GV-2029-STRATEGIC-TRIENNIAL` (2029-07-31) |
| OIG Work Plan Review (Annual) | `EVT-CO-2026-OIG-WORKPLAN` (2026-07-30) | (annual; future occurrences generated each year) |

The "next occurrence" event is dependency-linked (`dependsOn`) to the current. The 2028 / 2029 events sit in the calendar today and will load into their sprint window when that date arrives — they are not speculative; they are scheduled.

---

## 7. Calendar Change Discipline

| Change Type | Required Path |
|---|---|
| Add a new regulatory event | Add to the appropriate data file with full schema, run typecheck, then it auto-loads on next sprint open. |
| Change an event date | Only allowed if the **regulatory anchor changed** (cite CFR / state amendment). Documented in `EN-LC-001` change log. |
| Retire an event | Mark `urgency: 'complete'` only after the regulatory basis is confirmed retired; otherwise document the policy decision under `EN-LC-001`. |
| Change cadence (e.g., Quarterly → Annual) | Requires Governing Body approval. The change is reflected in policy of record first, then in the data layer. |

The data layer is **downstream** of policy. The sprint is **downstream** of the data layer. Changes never start in the sprint.

---

## 8. Forbidden Patterns

| Pattern | Why Forbidden |
|---|---|
| "Pulling in" an event early to balance a sprint | Breaks calendar primacy. |
| "Pushing out" an event because the sprint is full | Breaks calendar primacy. |
| Manually editing sprint contents at sprint open | Sprint contents are deterministic; manual edits create drift. |
| Treating multi-year events as "lighter" because they are infrequent | The audit weight is **higher**, not lower, because evidence is sparse and visible. |
