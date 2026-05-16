# Wave 7 — T2 Report (Loading / Empty Primitive Adoption)

**Date:** 2026-05-16
**Scope:** Loading + empty-state cohesion on active surfaces — primitive adoption sweep.
**Status:** ✅ Complete

---

## 1. Scope (as executed)

T2 replaced ad-hoc loading and empty-state markup on three active, demo-visible surfaces with the canonical `LoadingState` and `EmptyState` primitives. The intent was visual + a11y cohesion (consistent label, padding, color tokens, `role="status"` + `aria-live` semantics) — not behavior change.

### Files touched (3)

| File | Edit | Primitive |
| ---- | ---- | --------- |
| `src/policy/pages/EvidenceCenterPage.tsx` | Replace inline "Loading evidence…" text block + rewrite `EvidenceCenterEmptyState` to delegate to `EmptyState` (FolderOpen icon + dynamic event-id description + Upload CTA preserved). | `LoadingState` + `EmptyState` |
| `src/policy/components/regulatory/EvidencePanel.tsx` | Rewrite local `EvidenceEmpty()` helper to use `EmptyState` (Paperclip icon + title + description); preserved the dashed-border tile wrapper that anchors it inside the panel. | `EmptyState` |
| `src/policy/components/pm/SprintReviewPage.tsx` | Replace bare `<p>No tasks pinned to this sprint.</p>` with `EmptyState` (compact `!py-4` override to fit the dense sprint-stats section). | `EmptyState` |

### Surfaces NOT touched in T2 (intentional)

- **`AuditModePage.tsx` line 1373** — micro empty ("No evidence files uploaded.") sits inside a 10.5px-font dense audit table. Full `EmptyState` primitive (16px title + 32px padding) would visually overweight the cell. Density wins; revisit only if a dense-variant primitive is introduced.
- **`MasterCalendarPage.tsx`** — already uses the canonical `<RightDrawer width="lg">` API; the visible `animate-pulse` is on a sync-button icon, not a page-level loader, so no `LoadingState` substitution applies.
- **`TaskDetailRightPanel.tsx`** — already on canonical `<RightDrawer inline>` (width ignored by primitive).
- **`MobileIncidentExecutionPage.tsx`** — empty-state renders as `<li>` inside `<ul>`; `EmptyState`'s `<div>` shape would break the list semantics. Defer.
- **`PolicyAppendicesPanel.tsx`** + **`LandingView.tsx`** + **`AchcSurveyAlignmentPage.tsx`** — out of T2's bounded sweep (these are T3/T4 candidates for the broader token + typography pass).

### RightDrawer consumer audit

The original T2 plan mentioned "2–3 RightDrawer consumers currently inlining width." Inspection shows all real production consumers already use the canonical API:

- `MasterCalendarPage.tsx`: `<RightDrawer ... width="lg">` ✓
- `TaskDetailRightPanel.tsx`: `<RightDrawer inline ...>` (width N/A by design) ✓
- `BottomSheetDrawer.tsx`: sibling primitive that *mirrors* RightDrawer's API, not a consumer.
- `iAdministrator/.../RightPanelPreview.tsx`: non-production reference page (Lead 16 C10 design surface).

No drawer migrations needed.

---

## 2. Validation

All static gates + browser regression suites pass; primitive adoption is byte-cosmetic with no behavior change.

| Gate | Result |
| ---- | ------ |
| `tsc -b --noEmit` | ✅ PASS |
| `npm run build` | ✅ PASS (3.65s, ✓ built) |
| `verify:ui` | ✅ 0 FAIL · 3195 WARN (unchanged vs T1 — tokens-for-tokens substitution, no net change to hex/rgb counts; primitives already use `var(--ci-*)`) |
| `verify:task-identity` | ✅ PASS |
| `verify:alignment` | ✅ 100% alignment |
| `verify:pm-unified` | ✅ 22 passed / 2 failed (unchanged baseline) |
| `wave-6-regression` Playwright | ✅ **9/9** (all MVP browser tests still green) |
| `artifact-retrieval-defect` Playwright | ✅ 1/1 (Wave 5A fix still holds: s8a IDB-intact = `amber:false, iframe:1`; s8b LS+IDB wiped = `amber:true, iframe:0`, as expected) |
| ESLint on changed files | ✅ 0 errors |

---

## 3. Visual evidence

- **Before baselines:** `Builder/_system/screenshots/wave-7-baselines/{desktop,mobile}/*.png` (captured at T1 kickoff)
- **After T2:** `Builder/_system/screenshots/wave-7-after/T2/{desktop,mobile}/*.png` — 4 surfaces × 2 viewports = 8 PNGs:
  - `evidence.png` — shows new `EmptyState` rendering when no event has files
  - `pm-sprint-review.png` — shows compact `EmptyState` on the per-assignee delivery card
  - `calendar.png` — sanity surface (EvidencePanel renders inside selected event detail)
  - `dashboard.png` — sanity surface (shell unchanged)

Expected diff: empties + loaders shift from per-page slate/white-on-dark text to the canonical `var(--ci-text-*)` token palette with consistent padding (`32`) and label semantics (`role="status"`, `aria-live`). Page chrome, navigation, data-row rendering: unchanged.

---

## 4. Protected systems — confirmation

No files in the Lead 16 §14 frozen list were touched. Specifically:

- `FormSigningWorkspace.tsx`, `FormViewer.tsx`, `FormSignatureFlow.tsx` — untouched
- `regulatoryExecutionStore.ts` — untouched (T2 only edited `EvidencePanel.tsx`, a *consumer* of the store's selectors)
- `ArtifactViewerPage.tsx`, `FormPrintView.tsx` — untouched
- `LibraryPage.tsx`, `GVGBDetailView.tsx`, `PolicyDetailPage.tsx`, `PrintPage.tsx`, `GVGBPrintDocument.tsx` — untouched
- `WorkflowExecutionPanel.tsx` — untouched
- `taskIdentity.ts`, `cesFormInstanceId.ts`, `stateMachine.ts` — untouched
- `localDemoAdapter.ts`, `cesEvidenceHierarchy.ts` — untouched
- `vercel.json`, `AuthProvider.tsx` — untouched
- `server/ecign/*`, `src/policy/ecign/*` — untouched

No backend, no eCign packet generation, no business-logic changes.

---

## 5. Summary

Three surfaces now render loading and empty states through the same primitives, with shared a11y semantics and color tokens. All MVP browser regression and static gates are green. Wave 5A artifact-retrieval fix continues to hold.

T2 is bounded, surgical, and reversible by reverting the three file edits.
