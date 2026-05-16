# Wave 9 — Mobile Operational Report

**Date:** 2026-05-16  
**Goal:** Resolve Wave 8 mobile findings while preserving desktop behavior and canonical flows.

---

## 1) Wave 8 mobile findings addressed in Wave 9

| Wave 8 finding | Wave 9 action | Status |
|---|---|---|
| MyTasks rows were non-interactive (P0) | Added actionable row button: `openTask(t.id, 'sprint')` + navigation to `/calendar?view=sprint` | ✅ Resolved |
| Task drawer open-form icon was too small | Upgraded to 44x44 button with explicit aria-label | ✅ Resolved |
| Evidence mode toggles and primary actions were sub-44px | Increased toggles/actions to minimum 44px height | ✅ Resolved |
| Evidence file-ledger action friction on scroll | Added sticky filter/action rail for quicker repeated operations | ✅ Resolved |
| Calendar compact mode used right-side drawer on mobile | Switched compact/mobile detail to `BottomSheetDrawer` | ✅ Resolved |
| CES hierarchy deep indent clipping on phone | Reduced mobile indent depth (`pl-3 md:pl-5`) and tighter page padding | ✅ Mitigated |
| Dashboard action header density | Added wrap rhythm + touch-size parity for toolbar buttons | ✅ Resolved |
| Audit mode chips/tiles crowded on narrow widths | Horizontal chip rail + 2-col health strip on mobile + touch-size updates | ✅ Resolved |

---

## 2) Files changed (mobile-relevant)

- `src/policy/ces/pages/MyTasksPage.tsx`
- `src/policy/components/pm/TaskDetailRightPanel.tsx`
- `src/policy/pages/EvidenceCenterPage.tsx`
- `src/policy/pages/MasterCalendarPage.tsx`
- `src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx`
- `src/policy/pages/AuditModePage.tsx`
- `src/policy/pages/DashboardPage.tsx`

---

## 3) Mobile UX outcomes

1. **Execution continuity**
   - A clinician/DON can now start from `My Tasks` and immediately open task detail context.
2. **Touch ergonomics**
   - Core high-frequency actions use 44px targets.
3. **Drawer behavior**
   - Mobile compact detail interactions now match expected bottom-sheet behavior.
4. **Operational readability**
   - Audit and evidence controls are easier to scan and operate without zooming.
5. **Desktop parity preserved**
   - Desktop right-rail layout, hierarchy density, and PM surfaces remain intact.

---

## 4) Screenshot references

Wave 9 mobile captures:
- `Builder/_system/screenshots/wave-9-uiux-convergence/mobile-_dashboard.png`
- `Builder/_system/screenshots/wave-9-uiux-convergence/mobile-_my-tasks.png`
- `Builder/_system/screenshots/wave-9-uiux-convergence/mobile-_evidence.png`
- `Builder/_system/screenshots/wave-9-uiux-convergence/mobile-_calendar_view_sprint.png`
- `Builder/_system/screenshots/wave-9-uiux-convergence/mobile-_forms.png`
- `Builder/_system/screenshots/wave-9-uiux-convergence/mobile-_audit.png`
- `Builder/_system/screenshots/wave-9-uiux-convergence/calendar-task-workflow.png`

---

## 5) Validation

- `wave-9-uiux-convergence` Playwright suite (mobile viewport included) ✅
- `wave-6-regression` ✅ 9/9
- `artifact-retrieval-defect` ✅ 1/1
- Static gates unchanged from baseline except known `verify:pm-unified` 2 fails.

---

## 6) Remaining mobile debt

- No changes were made to backend role enforcement (out of scope).
- Phone-specific keyboard overlap behavior is improved indirectly via bottom-sheet adoption, but not fully audited on all form entry surfaces.
- Workflow execution deep interactions still rely on desktop-authored panel internals in some routes.

---

## 7) Rollback safety

All mobile edits are class/interaction layer only (no schema/state-model changes).  
Revert by file-level rollback of the seven files listed in §2.

