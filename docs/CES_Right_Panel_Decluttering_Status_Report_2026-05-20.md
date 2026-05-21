# CES Right Panel Decluttering Status Report

**Agent:** 12 — Documentation & Status Reporter  
**Date:** 2026-05-20  
**Subject:** Progress toward 70% visual density reduction goal via migration of CES Evidence & Tasks right panels to drawers/modals (V3 Veil Glass)

## Executive Summary (Honest Assessment)
The CES Evidence and Tasks right-panel decluttering effort is **primarily in the planning/documentation phase**. The removal and drawer-implementation specifications were authored today (see companion docs: `CES_Evidence_and_Tasks_Right_Panel_V3_Removals.md` and `CES_Evidence_and_Tasks_Right_Panel_V3_Drawers_To_Implement.md`). 

**Estimated progress toward 70% goal: 15–25%.**  
The split-view right-rail pattern and high visual density remain dominant on core CES/PM surfaces. Concrete code changes moving dense panels into full-shell V3 drawers are minimal. Legacy components are still live and referenced.

## Planned Scope (from V3 Docs)
- **Remove:** EvidencePanel.tsx, TaskDetailRightPanel.tsx (core), GlobalTaskDrawer (legacy version), WorkflowDrawer (legacy), SprintTaskPanel.tsx, RightPanelPreview.tsx, all inline usages in MasterCalendarPage, MyTasksPmPage, WorkflowExecutionPanel, EventWorkspace, Ces* pages, etc.
- **Replace with:** V3 veil-glass versions of GlobalTaskDrawer, WorkflowDrawer, RightDrawer, BottomSheetDrawer + new integrated V3 EvidencePanel and V3 TaskDetailRightPanel inside the full CommandCenterLayout shell (no separate legacy rails).

## What Has Been Moved to Drawers / Modals (Actual Code)
- **GlobalTaskDrawer.tsx** (`src/policy/components/pm/GlobalTaskDrawer.tsx`): Exists as app-root overlay. Renders `TaskDetailRightPanel` for pages without inline panels. Uses fixed `w-[min(100vw,420px)]` + `TaskDetailRightPanel`. Avoids showing on `/calendar`, `/pm/my-tasks` etc.
- **WorkflowDrawer.tsx** (`src/policy/ces/components/details/WorkflowDrawer.tsx`): Used by `SprintExecutionBoard.tsx` on unit click. Provides slide-out for execution unit details (meta + NonSkippableTimeline + EvidenceStatusPanel + SignatureRoster). Currently **legacy styling** (solid `CES_TOKENS.white` bg, `w-[560px]`, hardcoded borders).
- **RightDrawer.tsx** (`src/policy/components/ui/RightDrawer.tsx`): Base primitive updated with `ci-glass-panel` class, responsive widths, header/children/footer. Used inside `TaskDetailRightPanel`.
- **TaskDetailRightPanel.tsx** (`src/policy/components/pm/TaskDetailRightPanel.tsx`): Now consumes `RightDrawer` (inline mode in places) and some `ci-*` tokens / glass-panel. Still the content host for task evidence, signatures, forms, history.
- Limited adoption: Some non-PM routes now route through the global drawer instead of always splitting the view.

## Remaining Visual Density & Inline Right Panels (Not Yet Decluttered)
- **MasterCalendarPage.tsx** (`src/policy/pages/MasterCalendarPage.tsx`): Uses `ci-content-grid` + `.ci-right-panel` (30vw-ish) for sprint/kanban views. Renders `SprintTaskPanel` (dense state sections) **or** `TaskDetailRightPanel` inline. Full split persists.
- **MyTasksPmPage.tsx** (`src/policy/components/pm/MyTasksPmPage.tsx`): Hard `w-[420px]` right column containing `TaskDetailRightPanel`. List + dense detail rail side-by-side.
- **SprintExecutionBoard** (CES Board): Board is dense 6-column grid (solid cards, swimlanes); detail moved to `WorkflowDrawer` — partial win, but board itself not decluttered.
- **CesEvidenceHierarchyPanel** (in EvidenceCenterPage.tsx): Still primary dense legacy component (raw hex, high info volume per prior Agent 07 audit).
- **WorkflowDrawer / SprintTaskPanel / EvidencePanel / RightPanelPreview**: All files and references remain. No deprecation or removal executed.
- **Styling debt:** WorkflowDrawer and board cards use `CES_TOKENS` direct styles + solid fills. Not yet converged to V3 veil-glass + full shell (per Agent 06: CES glass adoption ~0–20%).
- **ci-right-panel** grid pattern (index.css): Still powers calendar and PM split views.

**Result:** High remaining visual density — multi-column operational views + persistent side panels create information overload exactly on the compliance-critical surfaces (board, calendar, my-tasks) that the 70% goal targets for calm authority.

## Gap Analysis vs. 70% Target
- **Planning/Docs:** 100% complete (today's V3 removal + drawer specs).
- **Drawer Implementation (V3 style):** ~20%. Global + RightDrawer base have glass elements; WorkflowDrawer and content panels do not.
- **Removals + Full Shell Integration:** ~0%. No legacy right panels deleted; no new V3 EvidencePanel / TaskDetail integrated in CommandCenterLayout per spec.
- **Visual Density Reduction:** Negligible on CES surfaces. Matches Agent 06 (May 17) finding that CES runs a "complete parallel design system" with low fidelity to v2 mocks (glass cards, left-accent urgency, calm navy layers).
- **Primitive/Glass Adoption (related 70% KPI):** CES Vertical rated ~70% only via sanctioned theme exception; actual visual weight / card fidelity ~30–42%. No material change since.

## Honest Verdict
The decluttering is **aspirational at this moment**. The right-panel problem has been correctly diagnosed and fully specified, but the heavy lifting (component rewrites, usage migration, legacy deletion, V3 shell enforcement on CES pages) has not begun in earnest. Until the listed drawers are V3-ized and the inline `ci-right-panel` / split layouts are excised from MasterCalendar, MyTasksPm, and Ces surfaces, the 70% density-reduction goal remains distant.

**Next concrete steps required (per plan):**
1. Land V3 veil-glass updates to WorkflowDrawer + RightDrawer variants.
2. Create integrated V3 EvidencePanel and TaskDetailRightPanel.
3. Refactor MasterCalendarPage + MyTasksPmPage + CesBoard to full-shell + conditional drawer (no more permanent right rails).
4. Delete legacy panel files and update all call sites.
5. Validate against APP_Screenshots.pdf mocks for calm, low-density experience.

Report generated from direct inspection of source (`src/policy/ces/**`, `src/policy/components/pm/**`, `src/policy/pages/MasterCalendarPage.tsx`, `src/policy/components/pm/MyTasksPmPage.tsx`, drawer primitives, and the V3 CES docs). No assumptions — only observed state as of 2026-05-20.

---

**References**  
- `docs/CES_Evidence_and_Tasks_Right_Panel_V3_Drawers_To_Implement.md`  
- `docs/CES_Evidence_and_Tasks_Right_Panel_V3_Removals.md`  
- `docs/UIUX/16_Agent_Reports/Agent_06_CES_Compliance_Execution_Analysis.md` (glass adoption baseline)  
- Live files: `GlobalTaskDrawer.tsx:46`, `WorkflowDrawer.tsx:66-67`, `MasterCalendarPage.tsx:314`, `MyTasksPmPage.tsx:370`, `RightDrawer.tsx:57`, `SprintTaskPanel.tsx`, `CesEvidenceHierarchyPanel.tsx` (via EvidenceCenterPage)