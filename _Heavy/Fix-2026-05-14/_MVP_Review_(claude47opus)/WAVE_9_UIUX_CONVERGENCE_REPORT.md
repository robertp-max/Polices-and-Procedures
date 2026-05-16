# Wave 9 — UI/UX Convergence + Operational Polish Report

**Date:** 2026-05-16  
**Execution mode:** Locked, bounded convergence pass  
**Scope posture:** No architecture rewrite, no backend rewrite, no Wave 5B reopening

---

## 1) What this wave changed

Wave 9 focused on convergence and operational usability on active UI surfaces with reversible, bounded edits:

- Fixed the **P0 mobile blocker** by making `MyTasksPage` rows actionable (`openTask` + route into calendar execution context).
- Completed high-impact mobile quick wins from Wave 8:
  - larger touch targets in `TaskDetailRightPanel`
  - larger touch targets + sticky action rail + IDB warm-up in `EvidenceCenterPage`
  - `DashboardPage` action header rhythm/touch refinement
  - `AuditModePage` mobile filter/tile usability polish
  - mobile-safe indenting in `CesEvidenceHierarchyPanel`
  - **BottomSheet** behavior for compact/mobile detail panels in `MasterCalendarPage`
- Added a lightweight guided operational layer via new `GuidedUatWidget` (dismissible, non-blocking, route-aware checklist).
- Added dedicated Playwright suite for Wave 9 (`wave-9-uiux-convergence.spec.mjs`) with desktop/mobile, dark/light, guided-UAT, evidence, signer-role, and calendar/task captures.

---

## 2) Runtime files touched

- `src/policy/ces/pages/MyTasksPage.tsx`
- `src/policy/components/pm/TaskDetailRightPanel.tsx`
- `src/policy/pages/EvidenceCenterPage.tsx`
- `src/policy/pages/DashboardPage.tsx`
- `src/policy/pages/AuditModePage.tsx`
- `src/policy/pages/MasterCalendarPage.tsx`
- `src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx`
- `src/policy/components/CommandCenterLayout.tsx`
- `src/policy/components/onboarding/GuidedUatWidget.tsx` (new)

Automation:
- `Builder/_system/uat/wave-9-uiux-convergence.spec.mjs` (new)
- `Builder/_system/reports/wave-9-uiux-convergence.json` (generated)

---

## 3) Operational improvements delivered

1. **My Tasks execution path**
   - rows now open canonical task detail context (no dead-end list behavior on mobile)
   - filter chips now meet 44px touch target minimum

2. **Evidence Center reliability + UX**
   - added IDB prefetch + mem cache version re-render bump (Wave 8 ME-3 recommendation)
   - mode toggle and primary actions upgraded to 44px touch targets
   - filter/action rail made sticky during file-ledger scrolling
   - detail drawer width clamped for mobile (`min(100vw,420px)`)

3. **Calendar compact/mobile detail behavior**
   - compact flow now uses `BottomSheetDrawer` on mobile instead of right-edge drawer
   - preserves desktop right panel behavior

4. **Task drawer accessibility**
   - open-form icon action upgraded to proper touch target + label
   - watch/close controls upgraded to 44px targets

5. **Audit readability + rhythm**
   - quick filter rail is horizontally scrollable on narrow viewports
   - summary strip hidden on small viewports to reduce crowding
   - export/rollup actions and health tiles meet touch target guidance

6. **Guided UAT support**
   - non-intrusive checklist widget in shell with route progress and deep links
   - dismissible and reversible, no workflow mutation

---

## 4) Before/after references

Baseline references:
- Wave 6 screenshots: `Builder/_system/screenshots/wave-6-regression/*`
- Wave 8 baseline notes: `_Heavy/.../WAVE_8_MOBILE_OPERATIONAL_UX_REPORT.md`

Wave 9 captures:
- `Builder/_system/screenshots/wave-9-uiux-convergence/*`

Key comparisons:
- `mobile-_my-tasks.png` (after) vs prior non-actionable list behavior documented in Wave 8 §2.3
- `mobile-_evidence.png` + `evidence-after-upload.png` (after) vs Wave 8 Evidence friction findings
- `mobile-_calendar_view_sprint.png` + `calendar-task-workflow.png` (after) vs Wave 8 right-drawer-on-phone finding
- `guided-uat-step-1.png` / `guided-uat-step-2.png` (new guided operational layer)

---

## 5) Validation results

Static/build:
- `tsc -b --noEmit` ✅
- `npm run build` ✅
- `npm run verify:ui` ✅ (0 FAIL; WARN count informational)
- `npm run verify:alignment` ✅ (100% / 0 findings)
- `npm run verify:task-identity` ✅
- `npm run verify:pm-unified` ⚠️ **22 passed / 2 failed** (known baseline from Wave 4/Wave 8; unchanged)

Playwright:
- `wave-6-regression` ✅ 9/9
- `artifact-retrieval-defect` ✅ 1/1
- `wave-9-uiux-convergence` ✅ 5/5

---

## 6) Protected systems and non-touches

No protected/frozen subsystem rewrites performed. In particular, no edits to:

- `FormSigningWorkspace.tsx`
- `FormViewer.tsx`
- `FormSignatureFlow.tsx`
- `ArtifactViewerPage.tsx`
- `regulatoryExecutionStore.ts`
- `WorkflowExecutionPanel.tsx`
- `cesFormInstanceId.ts`
- `compliance-execution/taskIdentity.ts`
- `server/ecign/*`
- `src/policy/ecign/*`

---

## 7) Unresolved blockers / deferred items

- Architectural dual-task-model convergence (PM `Task[]` vs CES obligations) remains deferred.
- `isEventComplete` vs `validateEvent` semantic merge remains deferred (frozen store).
- Backend-side signer role enforcement parity remains out-of-scope.
- Two `verify:pm-unified` static checks remain stale vs current canonical code shape.

---

## 8) Rollback notes

All runtime edits are bounded UI-layer changes; rollback is straightforward via file-level revert:

- `MyTasksPage.tsx` — remove row click/openTask path
- `EvidenceCenterPage.tsx` — remove prefetch/re-render bump + touch/sticky class updates
- `MasterCalendarPage.tsx` — swap `BottomSheetDrawer` branch back to `RightDrawer` for compact/mobile
- `TaskDetailRightPanel.tsx` — revert touch-target class changes
- `AuditModePage.tsx`, `DashboardPage.tsx`, `CesEvidenceHierarchyPanel.tsx` — class-only rhythm/touch refinements
- `GuidedUatWidget.tsx` + import in `CommandCenterLayout.tsx` — removable without affecting business logic

