# V3 Governing Body — Before / After Information Architecture

Scope: `src/v6/screens/governance/v33/` only. No content borrowed from V1/V2 or the
older `Governance*.tsx` files outside `v33/`.

## Before (current) — 10 destinations, brand-first

| # | Destination (nav)      | Role today                              |
|---|------------------------|-----------------------------------------|
| 1 | Executive brief        | Brand/editorial hero; enterprise metrics first |
| 2 | Board book             | Q2 packet sections                      |
| 3 | Meetings               | Agenda + quorum workspace               |
| 4 | Governance calendar    | Dated CES cycle + action register       |
| 5 | Decision docket        | Decision matters                        |
| 6 | QAPI oversight         | Quality signal + tabletop (rehearsal)   |
| 7 | Risk & assurance       | Enterprise risk register                |
| 8 | Policy register        | 42 flat policy rows + 13 course filters |
| 9 | Governance academy     | 12+1 case labs; completion = `submitted`|
| 10| Evidence record        | Governance artifact inventory           |

Problems: over-segmented; first viewport is marketing, not the user's required work;
assigned training/policies split across #6/#8/#9 and labelled "practice / no LMS credit /
certification locked"; completion inferred from a `submitted` flag in localStorage.

## After (target) — 6 destinations, task-first

| # | Destination   | Absorbs (before)                              | Primary job |
|---|---------------|-----------------------------------------------|-------------|
| 1 | **Home**      | Executive brief                               | "What must I do now?" — resume next requirement |
| 2 | **My Compliance** | Governance academy + learner half of Policy register | All assigned training, policy readings, course assessments, final tabletop |
| 3 | **Meetings**  | Meetings + Board book + Governance calendar (sub-tabs) | Prepare for the next convening |
| 4 | **Decisions** | Decision docket                               | Judge matters with conditions |
| 5 | **Oversight** | QAPI oversight + Risk & assurance + policy-governance | Board oversight (live QAPI record stays here) |
| 6 | **Records**   | Evidence record                               | Proof with provenance |

### My Compliance tabs
`Required Now` · `Training Modules` · `Policies & Procedures` (course-first accordion) · `Completed`
Plus the **Final Governing Body Tabletop** capstone (assessment-grade), unlocked only after
every other required item is officially complete.

### Navigation rules applied
- Left rail retained, persistent **readable labels** (≥13–14px); icons reinforce, never sole label.
- Breadcrumb + page title on every screen.
- Global search retained (⌘K) but not a substitute for discoverable nav.
- One primary action per screen; ≤2 secondary above the fold.

## Completion model change (the core fix)
`submitted === true` is **abandoned** as a completion signal. Completion now requires a
passing, attested, zero-critical-error **official evidence record** from a *connected*
evidence service. In a dev build the service is honestly **disconnected** → items show
"Preview only", never Completed, and compliance progress never increments.

Contract lives in `v33/compliance/`:
- `complianceTypes.ts` — `ComplianceAssignment`, `ComplianceEvidenceRecord`, user-facing status model.
- `complianceCatalog.ts` — derives GB assignments from academy modules + policy-journey requirements (no learner state).
- `complianceEvidenceAdapter.ts` — evidence service interface + default DISCONNECTED dev adapter.
- `complianceStore.ts` — localStorage draft/resume only (non-authoritative) + official-evidence snapshot.
- `complianceSelectors.ts` — next-requirement ordering, summary cards, module/course completion predicates.
