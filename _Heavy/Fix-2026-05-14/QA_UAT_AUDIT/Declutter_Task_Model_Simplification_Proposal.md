# Declutter & Task Model Simplification Proposal

**Date:** 2026-05-14  
**Context:** Part of the ongoing QA/UAT audit — addressing "too many objects all over the place and messy" + task bloat per event.

---

## Executive Summary

The current task generation model in the CES layer produces high cardinality that manifests as visual and cognitive clutter across PM views, My Tasks, Calendar, Evidence Center, and WorkflowExecutionPanel.

The root cause is the **additive layering** of multiple task types without sufficient aggregation at the projector and UI levels:

- ProcessFlow-derived tasks
- RequiredForm tasks (with only partial deduplication)
- Per-signer `SIGN-` tasks (one per required role per form)
- Approval tasks
- Minutes tasks

This design creates real operational friction and amplifies the "messy / too many objects" feeling, especially when combined with the current Evidence and Audit surfaces that also surface many small artifacts.

---

## Root Cause Analysis (Task Generation)

From `eventTaskAdapter.ts:deriveDefaultEventTasks` + `signerTaskFactory.ts`:

1. Every processFlow step generates a task.
2. Every requiredForm not already covered by processFlow generates an additional "Complete Form" task.
3. For each form that requires signatures, `signerTaskFactory` generates one deterministic `SIGN-{eventId}::{formId}::SIGNER::{ROLE}` task **per required signer role** (commonly 2 per form: DON + Administrator or similar).
4. These signer tasks are linked to the parent via `parentFormTaskId` and block completion of the parent (`blocksOnSignerTasks: true`).

**Example volume on a realistic regulatory event:**
- 7 processFlow steps → 7 tasks
- 5 required forms (2 already covered by processFlow) → 3 additional form tasks
- 4 forms requiring 2 signers each → 8 signer tasks
- 1 minutes task + 2 approval tasks → 3 tasks

**Total visible tasks for one event: ~21+** (often higher with overrides and manual tasks).

The normalization and deduplication logic (`taskIdentity.ts`) works correctly for identity, but it cannot reduce the fundamental volume created by the generation strategy.

---

## Proposed Simplification

### Core Idea: Introduce Composite "Form + Signers" Requirements in the UI & Projectors

**Backend (keep as-is for enforcement & audit):**
- Retain all fine-grained deterministic tasks (form completion task + individual SIGN- tasks per role).
- This preserves the `blocksOnSignerTasks` logic, audit events, and role-based assignment.

**Projectors & UI Layer (simplify aggressively):**

1. In `taskProjection*.ts` and the main PM / CES task lists, collapse each "Form + its required Signers" into a **single composite requirement card** by default.
   - Show primary status as "Form Complete + X/Y Signatures".
   - Allow expansion to see individual signer tasks when needed (progressive disclosure).

2. In My Tasks, Sprint, Kanban, and Gantt views:
   - Treat composite form+signer groups as first-class items.
   - Reduce the total number of top-level cards a user sees for a typical event from ~20+ to roughly 8–12 (processFlow steps + composite forms + minutes + approvals).

3. In Evidence Center and WorkflowExecutionPanel requirement lists:
   - Group evidence and signature requirements under their parent form.
   - Show "Form + Evidence + Signatures" as a unified requirement group instead of scattering many small rows.

**Estimated Impact on Task Count (example event above):**

| View                  | Current Visible Items | After Simplification | Reduction |
|-----------------------|-----------------------|----------------------|---------|
| My Tasks (per event)  | ~21+                  | ~10–12               | ~45-50% |
| Sprint / Kanban       | High noise            | Much cleaner groups  | Significant |
| Evidence Hierarchy    | Many small rows       | Grouped by form      | High    |
| WorkflowExecutionPanel| Scattered requirements| Consolidated groups  | High    |

---

## Additional Declutter Recommendations

**Beyond the core task model:**

- **Consolidate "Work to Do" Surfaces**: Reduce the number of places showing overlapping task/requirement information (WorkflowExecutionPanel, CES My Tasks, PM My Tasks, Evidence requirements, Audit Mode). Aim for one authoritative "Requirements & Progress" view per event with good filtering.

- **Stronger Progressive Disclosure Everywhere**:
  - Evidence Center: Summary cards first, deep details on demand.
  - Audit Mode: Group related events; show full detail only when expanded.
  - Right-side panels in drawers: Default to the most relevant context instead of dumping everything.

- **Leverage the Design System More Aggressively**:
  - Fix the known `pm.slate-pin` warning in `PmViews.tsx`.
  - Use consistent `<GlassPanel>`, token-based surfaces, and spacing to reduce visual noise in dense cards and lists.

- **Form + Evidence + Signature Grouping**:
  - In the Evidence hierarchy and WorkflowExecutionPanel, treat "Complete Form + Upload Supporting Evidence + Required Signatures" as a single logical requirement group for most users, while preserving fine-grained backend objects.

- **Signer Task Presentation**:
  - In most PM and list views, show signer tasks as sub-items or status badges under the parent form rather than as peer tasks (unless the user is specifically in a "My Signatures" filtered view).

---

## Benefits

- Significantly reduced visual and cognitive load ("less messy", fewer objects on screen).
- Better accessibility (fewer items to navigate, clearer grouping, easier to apply proper ARIA tree/grid patterns on grouped requirements).
- Easier maintenance and lower risk of users missing critical items in bloated lists.
- Preserves all backend enforcement, audit, and role assignment power (no loss of control).

---

## Recommended Implementation Order (Surgical)

1. Update the main task projectors (`taskProjectionCore.ts` + related) to support composite "Form + Signers" grouping.
2. Apply the grouping in the highest-traffic views first: My Tasks (CES + PM), Sprint/Kanban, and the WorkflowExecutionPanel requirement list.
3. Apply similar grouping in EvidenceCenterPage and CesEvidenceHierarchyPanel.
4. Fix the design token warning in PM views as a quick win for both declutter and accessibility.
5. Add progressive disclosure patterns and better ARIA structure to the grouped surfaces (this directly helps both declutter and accessibility).

---

**Status:** This proposal is ready to be turned into a more detailed technical spec or JIRA/epic breakdown. It directly addresses the "too many objects / messy" feedback while staying compatible with the existing fine-grained CES enforcement model.

I will integrate this into the main QA/UAT Findings and Recommendations documents next. 

Continuing the audit — accessibility deep dive on the two surfaces + this declutter proposal are now both in progress. Let me know if you want me to expand any section (e.g., specific before/after screenshots descriptions, more granular task count examples from real events, or deeper ARIA recommendations for the hierarchy panel). 

Autopilot remains active.