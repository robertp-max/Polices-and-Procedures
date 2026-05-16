# Wave 8 — Mobile Operational UX Report

**Date:** 2026-05-16
**Mode:** AUDIT + 3 surgical className-only fixes applied (no logic, no behavior, no protected files).
**Sources:** Code-level reads of 10 high-traffic operational surfaces + cross-cutting shells.
**Personas:** DON, DON Assistant, Clinician, Admin, Accounting, Systems.

---

## 1. Surgical fixes applied this wave

| # | File | Change | LOC | Effect | Reversibility |
|---|------|--------|-----|--------|---------------|
| 1 | `src/policy/components/pm/GlobalTaskDrawer.tsx` | `w-[420px]` → `w-[min(100vw,420px)]` (drawer width clamp) | +5 / -1 (includes comment) | On a 390 px viewport the drawer now becomes a full-bleed sheet rather than overflowing horizontally. Desktop unchanged at 420 px. | Single `className` swap; revert in one StrReplace. |
| 2 | `src/policy/pages/FormsPage.tsx` | Header padding `px-10` → `px-4 sm:px-6 md:px-10` (responsive) | +3 / -1 (includes comment) | Header no longer overflows on phones (`px-10` = 80 px combined > 390 px viewport budget after icon/title). Tablet/desktop unchanged at `md:` breakpoint. | Single `className` swap. |
| 3 | `src/policy/components/pm/PmDashboardPage.tsx` | Sprint prev/next buttons gained `min-h-[44px] min-w-[44px] inline-flex items-center justify-center` + `aria-label` | +6 / -2 | WCAG AA-compliant 44×44 touch targets (was ~24×24); a11y labels added. Desktop visual: button grows to 44 px tall (was ~24 px); accepted for accessibility. | className-only revert; visual change is intentional. |

**Validation after fixes:**
- `tsc -b --noEmit` ✅
- `npm run build` ✅ (3.80s)
- `verify:ui` ✅ 0 FAIL, WARN count unchanged at 3185
- `verify:task-identity` ✅ PASS
- `verify:alignment` ✅ 100% — 0 findings
- `verify:pm-unified` ⚠️ 22 passed / 2 failed (baseline since Wave 4 — unrelated to fixes)
- `wave-6-regression` Playwright ✅ 9/9
- `artifact-retrieval-defect` Playwright ✅ 1/1

---

## 2. Mobile audit — 10 surfaces

### 2.1 Dashboard (`src/policy/pages/DashboardPage.tsx`)
**Header bar** `flex` is row-only — wraps on phones but density is desktop-first (`gap-6`, `text-xl`).
**Mobile risk:** P2.
**Recommended (deferred):** add `flex-wrap gap-y-3` on the header row; widen tap surface for the role chips.

### 2.2 Command Center shell (`src/policy/CommandCenterLayout.tsx`)
Side rail and right rail logic uses `lg:` breakpoint (`1024px`). Anything between **640–1024 px** (tablet portrait / phablet) collapses both rails but keeps desktop-density chrome.
**Mobile risk:** P2.
**Recommended (deferred):** introduce an `md:` adaptive tier for tablet portrait; preserves existing desktop behavior.

### 2.3 My Tasks (`src/policy/pages/MyTasksPage.tsx`)
**Each task row renders as text — no click handler / no `useNavigate` import.** A DON or Clinician opening this from the mobile primary tab cannot navigate to the task drawer.
**Mobile risk:** **P0** (operational blocker for the primary clinician/DON mobile destination).
**Recommended (deferred — requires product decision on canonical deep link):** wire row to `useSelectedTaskStore.openTask(task_id)` OR `navigate(buildTaskRoute(...))`. ~15 LOC. Not applied in this wave because the canonical click target (drawer vs route) requires explicit approval.

### 2.4 Evidence Center (`src/policy/pages/EvidenceCenterPage.tsx`)
Filter bar uses dense desktop chips; mode toggle row has `py-1` (≈24 px tall); panes are 2-col on `lg:`.
**Mobile risk:** P1 (filter discoverability + small tap target).
**Recommended (deferred):** `py-2 min-h-[44px]` on the mode toggle row; collapse filters into a sheet on `<sm`.

### 2.5 CES Evidence Hierarchy (`src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx`)
Tree disclosure rows render fine on phone but expand levels are `pl-[N]px` — at depth 5 (Year>Quarter>Month>Event>Task) the right edge clips on 390 px.
**Mobile risk:** P2.
**Recommended (deferred):** clamp left padding via `pl-[clamp(...)]` or switch to a phone-specific sheet.

### 2.6 Calendar (`src/policy/pages/MasterCalendarPage.tsx`)
Mounts `WorkflowExecutionPanel` / `SprintTaskPanel` as **right side drawers** (`RightDrawer`) on phone — these were authored for desktop wide rails.
**Mobile risk:** P1 (modal depth, swipe-from-right gesture conflict with iOS back-swipe).
**Recommended (deferred):** route phone viewports through `BottomSheetDrawer` for these two panels. ~10 LOC conditional render. **Not applied** in this wave — conditional rendering for a protected-adjacent panel needs orchestrator sign-off.

### 2.7 PM Dashboard (`src/policy/components/pm/PmDashboardPage.tsx`)
Sprint prev/next nav: **FIXED THIS WAVE** (Fix #3).

### 2.8 Forms Page (`src/policy/pages/FormsPage.tsx`)
Header padding: **FIXED THIS WAVE** (Fix #2). Grid (`forms-grid-7`) collapses correctly to 1 column at `≤550px`.

### 2.9 Audit Mode (`src/policy/pages/AuditModePage.tsx`)
Heavy multi-tab page; widely desktop-density. Read-only context, so risk is **discoverability**, not blocked actions.
**Mobile risk:** P2.
**Recommended (deferred):** collapse subnav to a `select` on `<sm`.

### 2.10 Task Detail panel + Global drawer
- `TaskDetailRightPanel` "Open Form" affordance is an `ExternalLink` icon — ~16×16 px tap target.
- `GlobalTaskDrawer` width: **FIXED THIS WAVE** (Fix #1).
**Mobile risk on Open Form:** P1.
**Recommended (deferred):** wrap the icon in a `<button>` with `p-2 min-h-[44px] min-w-[44px]`. ~5 LOC.

### 2.11 Mobile Incident Execution (`src/policy/pages/MobileIncidentExecutionPage.tsx`)
Already authored mobile-first (bottom nav, step indicator, sticky action bar). No identified issues.
**Mobile risk:** none observed.

---

## 3. Cross-cutting patterns

| Pattern | Frequency | Severity | Surfaces |
|---------|-----------|----------|----------|
| Sub-44 px touch targets | High | P1–P2 | PM Dashboard (fixed), Task drawer "Open Form", Evidence Center toggles |
| Desktop-first horizontal padding (`px-10`, `gap-6`) | Medium | P2 | Forms (fixed), Dashboard, Audit Mode subnav |
| Right-side drawer used on phone | Medium | P1 | Calendar mounts of `WorkflowExecutionPanel` / `SprintTaskPanel` |
| Hover-only affordances | Medium | P2 | Kanban card actions; Sprint board context menus (touch users miss them) |
| Filter bars dense at phone widths | Medium | P2 | Evidence Center, Audit Mode |
| Modal depth on small viewports | Low | P2 | Drawer-inside-drawer when opening a task from Calendar |

---

## 4. Quick-win backlog (NOT applied — all class-only)

| # | Surface | Change | LOC | Risk |
|---|---------|--------|-----|------|
| QW-1 | `TaskDetailRightPanel.tsx` open-form button | Wrap `<ExternalLink>` icon in `<button class="p-2 min-h-[44px] min-w-[44px]">` | ~5 | Low |
| QW-2 | `EvidenceCenterPage.tsx` mode toggle row | `py-1` → `py-2 min-h-[44px]` | ~2 | Low |
| QW-3 | `DashboardPage.tsx` header | add `flex-wrap gap-y-3` | ~2 | Low |
| QW-4 | `AuditModePage.tsx` subnav | add `overflow-x-auto` + `min-h-[44px]` on tabs | ~3 | Low |
| QW-5 | `CommandCenterLayout.tsx` shell | introduce `md:` adaptive tier | ~10 | Medium (visual change across phablet) |

---

## 5. Medium-effort backlog (requires sign-off)

| # | Surface | Change | LOC | Risk |
|---|---------|--------|-----|------|
| ME-1 | `MyTasksPage.tsx` | Wire each row to canonical task open behavior (`useSelectedTaskStore.openTask` or `navigate(buildTaskRoute)`) | ~15 | Medium — P0 mobile blocker fix but needs canonical deep-link decision |
| ME-2 | `MasterCalendarPage.tsx` | On phone viewports route `WorkflowExecutionPanel` + `SprintTaskPanel` through `BottomSheetDrawer` | ~10 | Medium — touches a protected-adjacent panel host |
| ME-3 | `EvidenceCenterPage.tsx` | Adopt Wave 5A `prefetchDemoEvidenceFromIdb` + `memCacheVersion` to fix cold IDB-only blobs on file rows | ~15 | Low — pattern proven |
| ME-4 | `CesEvidenceHierarchyPanel.tsx` | Phone-only tree presentation (sheet or collapsed paths) | ~20 | Medium |

---

## 6. Persona impact summary

| Persona | Mobile reality today |
|---------|---------------------|
| **Clinician** | My Tasks (primary mobile destination) **rows are non-interactive** (P0). Mobile Incident Execution is well-designed. Form completion works but uses desktop chrome. |
| **DON** | Sprint nav (fixed), but Calendar right-drawer is awkward on phone (P1). |
| **DON Assistant** | Form signing flow has good role enforcement; mobile signature capture needs spot-check. |
| **Admin** | Audit Mode is desktop-first; survey prep on tablet is workable, on phone is friction-heavy. |
| **Accounting** | Reports / approvals queue mobile audit not in scope of this report (no high-traffic mobile surface identified). |
| **Systems** | Validators (`validateEvent`) surface in `EventWorkspace` work on mobile but density is desktop-tuned. |

---

## 7. Branding / typography preservation

**Not touched.** No font, color token, brand mark, or typography rule modified. Wave 7 T3 token migrations remain intact. All three applied fixes are layout/responsive className changes only.

---

## 8. Protected files confirmed not modified

`FormSigningWorkspace.tsx`, `FormViewer.tsx`, `FormSignatureFlow.tsx`, `regulatoryExecutionStore.ts`, `ArtifactViewerPage.tsx`, `FormPrintView.tsx`, `LibraryPage.tsx`, `GVGBDetailView.tsx`, `PolicyDetailPage.tsx`, `WorkflowExecutionPanel.tsx`, `taskIdentity.ts`, `cesFormInstanceId.ts`, `stateMachine.ts`, `localDemoAdapter.ts`, `cesEvidenceHierarchy.ts`, `vercel.json`, `AuthProvider.tsx`, `server/ecign/*`, `src/policy/ecign/*` — all confirmed unchanged.

## 9. Unresolved blockers

- **ME-1 (MyTasks P0)** requires explicit decision on canonical task open behavior (drawer vs route) before wiring rows.
- **ME-2 (Calendar phone drawers)** touches calendar's panel host wiring; safer to scope to a follow-up wave with explicit sign-off.
- No mobile-viewport Playwright spec exists in `Builder/_system/uat/`; cross-persona mobile regression cannot be automated until one is authored.
