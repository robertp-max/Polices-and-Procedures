# Wave 8 — Canonical Source-of-Truth Map

**Date:** 2026-05-16
**Mode:** READ-ONLY audit + documentation. No deletions performed. No protected/frozen files modified.
**Sources:** Code-level reads (Glob/Grep across `src/`), plus the prior reports `CANONICAL_POLICY_VIEW_CONSOLIDATION_REPORT.md` (2026-05-14) and `UIUX_CANONICAL_COMPONENTS_MAP.md` (2026-05-15). Where the prior docs and current code disagree, this report defers to **current code truth**.

---

## 1. Corrections to prior maps (code truth as of Wave 8)

| Prior claim | Current code truth | Evidence |
|-------------|---------------------|----------|
| `GVPolicyDetailView.tsx`, `CLPolicyDetailView.tsx`, `PolicyDetailModal.tsx` exist as drift | **Already deleted** from `src/` (only `_Heavy/` docs still mention them) | Repo-wide Glob: none present |
| UIUX map says "PolicyDetailPage + SharedPolicyDetailView for most policies" | Current `PolicyDetailPage.tsx` branches: **GV-GB-001 → `GVGBDetailView`**; otherwise **`PolicyLibraryDocumentView` → `SharedPolicyDetailView`** | `PolicyDetailPage.tsx:7–38` |

---

## 2. Authoritative canonical owner table

| Domain | Canonical owner file | Status | Notes |
|--------|----------------------|--------|-------|
| Policy detail (GV-GB-001 specimen) | `src/policy/pages/GVGBDetailView.tsx` (export `GVGBDetailView` :677) | **Canonical** | Routed from `PolicyDetailPage.tsx:28–29` |
| Policy detail (corpus / shared doc) | `src/policy/components/SharedPolicyDetailView.tsx` (export `SharedPolicyDetailView` :1475) via `PolicyLibraryDocumentView.tsx:102/119` | **Canonical** + specialized | Wave 7 T3 light-pin intent comment locks document body styling |
| Policy routing | `src/policy/pages/PolicyDetailPage.tsx:7–38` | **Canonical** | Single switch |
| Form render | `src/policy/components/FormViewer.tsx` (export `FormViewer` :1038) | **Canonical (FROZEN)** | Embeds `eCIgnWorkspace` :1543–1564 |
| eCign / signed packet HTML | `src/policy/components/FormSigningWorkspace.tsx` (`eCIgnWorkspace` :824, `buildPrintablePacketHtml` :481, wired :1408) | **Canonical (FROZEN)** | Byte-stable Wave 3 invariant; do not touch |
| Form print route | `src/policy/pages/FormPrintView.tsx` (export :31) + `src/policy/utils/printForm.ts` (`printForm` :12) | **Specialized** | Two entry patterns (route vs iframe) |
| Policy print | `src/policy/pages/PrintPage.tsx` (export :140) + `src/policy/pages/GVGBPrintDocument.tsx` (export :692) | **Drift vs each other** | `PrintFrame.tsx:16–17` flags future unification |
| Demo evidence bytes (memory + LS + IDB) | `src/policy/evidence/demoEvidenceRuntimeCache.ts` (`resolveEvidenceDataUrl` :145, `prefetchDemoEvidenceFromIdb` :198, `stashDemoEvidenceDataUrl` :51) + `src/policy/evidence/storage/indexedDbEvidenceBlobStore.ts` | **Canonical stack** | IDB is implementation detail; do not hand-build URLs |
| Evidence API (AWS path) | `src/policy/pages/EvidenceCenterPage.tsx` (`isDemoMode` branch :252) + `src/policy/services/complianceExecutionApi.ts` (`getEvidenceDownloadUrl` :210) | **Canonical for live path** | Parallel to demo cache by design |
| Artifact deep-link UI | `src/policy/pages/ArtifactViewerPage.tsx` (imports cache helpers :9; prefetch :194–225) | **Canonical (FROZEN)** | Wave 5A `memCacheVersion` fix is the IDB hydration seam |
| Evidence hierarchy UI | `src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx` (export :44) | **Specialized** | Pure view over injected props |
| Event evidence CRUD list | `src/policy/components/regulatory/EvidencePanel.tsx` (export :22) | **Specialized** | Uses `useEventEvidence` |
| PM task list projection | `src/policy/pm/taskProjection.ts` (`useProjectedTasks` :41) + `taskProjectionCore.ts` (`projectTasks` :94–101) | **Canonical for PM `Task[]`** | Declared SOT in header :34–39 |
| CES obligations | `src/policy/ces/obligations/useObligations.ts` (header :2–5 "no duplicate stores") | **Canonical for CES layer** | Coexists with PM projection — see §5 risk |
| Task identity helpers | `src/policy/compliance-execution/taskIdentity.ts` (FROZEN) | **Canonical** | Note: there is NO `src/policy/pm/taskIdentity.ts` |
| Task detail panel | `src/policy/components/pm/TaskDetailRightPanel.tsx` (export :83) | **Canonical** | `GlobalTaskDrawer.tsx` is host only |
| Workflow state / mutations | `src/policy/stores/regulatoryExecutionStore.ts` (FROZEN; `setStepStatus` :754, `validateEvent` :2729, `certifyEventComplete` :2476) | **Canonical (FROZEN)** | Single mutator |
| Workflow UX (operator) | `src/policy/components/regulatory/WorkflowDrawer.tsx` (export :42) | **Specialized** | Step completion UX |
| Workflow UX (audit rail) | `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` (FROZEN; export :120; certifies :3154) | **Specialized (FROZEN)** | Mounted from `MasterCalendarPage.tsx:297, :400` |
| Workflow UX (sprint CES) | `src/policy/ces/components/details/SprintTaskPanel.tsx` (export :48) | **Parallel paradigm** | Obligations + `FormViewer` |
| Cross-cutting status math | `src/policy/pm/ecignStatusMap.ts` (header :4–7 declared SOT; `deriveEcignPacketStatus` :19, `derivePmTaskStatus` :84) | **Declared SOT** | Must match projector + badges |
| Form_instance ID (CES canonical) | `src/policy/ces/cesFormInstanceId.ts` (FROZEN; canonical shape `{eventId}-{formId}-{seq}` :8–10) | **Canonical (FROZEN)** | Legacy alias `eventId--formId` :13–21 |
| Artifact route builder | `src/policy/artifacts/artifactRoute.ts` (`buildArtifactRoute` :10–23) | **Canonical** | Single URL builder |

---

## 3. Duplicate / parallel implementations (6 categories)

### 3.1 Renderers

| Concept | Canonical | Parallel implementations (file:line) | Risk |
|---------|-----------|--------------------------------------|------|
| Policy detail GV | `GVGBDetailView.tsx:677` | `GVGBPrintDocument.tsx:692` (print stack — specialized) | Low — different concerns |
| Policy detail general | `SharedPolicyDetailView.tsx:1475` | Embedded by `PolicyLibraryDocumentView.tsx:102/119`, `AchcSurveyAlignmentPage.tsx:932`, `PolicyLifecyclePage.tsx:698`, `SurveyorPolicyViewerPage.tsx:25` | Low — adapter wrappers, single body source |
| Form: read vs sign | `FormViewer.tsx:1038` (read) + `FormSigningWorkspace.tsx:824` (sign) | `FormPrintView.tsx:31` (print specialization) | Medium — three render paths for the same form HTML |
| Evidence viewer | `ArtifactViewerPage.tsx` (full-page deep link) | `CesEvidenceHierarchyPanel.tsx:44` (hierarchy explorer), `regulatory/EvidencePanel.tsx:22` (event CRUD), `onboarding-v2/components/EvidencePanel.tsx` (separate product surface) | Medium — three "evidence" entry points; audit narrative split |
| Task detail | `TaskDetailRightPanel.tsx:83` | `GlobalTaskDrawer.tsx:28` (host), `ces/components/details/SprintTaskPanel.tsx:48` (CES obligation model) | **High** — SprintTaskPanel uses a different data shape (see §3.4) |

### 3.2 Print logic

| Concept | Canonical | Parallel implementations | Risk |
|---------|-----------|--------------------------|------|
| Policy print (generic) | `PrintPage.tsx:140` (autoprint :167–168) | — | — |
| Policy print (GV-GB-001) | `GVGBPrintDocument.tsx:692` (autoprint :699–701) | Same conceptual route family as `PrintPage` | Medium — chrome drift |
| GVGB appendix → form print | `GVGBAppendixPrint.tsx:42` (delegates to form print) | — | Low |
| Form route print | `FormPrintView.tsx:31` (`window.print` :100) | — | — |
| Form print via iframe | `printForm.ts:12` (loads `/forms/{formId}/print` :28, prints :39–42) | Called from `FormViewer` :~1631–1636 region | Medium — two entry patterns for the same output |
| Signed packet HTML | `buildPrintablePacketHtml` in `FormSigningWorkspace.tsx:481` (wired :1408) | Overlaps with `FormViewer.getPrintableFormHtml` :1418 callback | **High** — packet HTML is hash-protected; Wave 5B deferred |
| Print CSS abstraction | `components/ui/print/printStyles.ts` (Wave 5A SOT) + `PrintFrame.tsx` | Inline `@media print` in `GVGBPrintDocument:714`, `PrintPage:206`, `FormSigningWorkspace:536+`, `audit/surveyPacket.ts:839` | Medium — visual inconsistency, hard regressions |
| Policy print navigation | `openPolicyPrintRoute.ts:7` | Used in `SharedPolicyDetailView:1963–1970`, `GVGBDetailView:621/808` | Low — single entry; behavior delegated |
| Ad-hoc `window.print` | — | `DemoPage:1357`, `StagingM01Page:595`, `OnboardingV1JourneyPage:2216`, `RightPanelPreview:61`, iAdmin `FormRenderer:149/163` | Low (demo/training scope) |

### 3.3 Evidence loaders

| Concept | Canonical | Parallel implementations | Risk |
|---------|-----------|--------------------------|------|
| Demo bytes (mem → LS → IDB) | `demoEvidenceRuntimeCache.ts:145/198/51` | Low-level: `storage/indexedDbEvidenceBlobStore.ts:38/128`; writes from store: `regulatoryExecutionStore.ts:888/979` (via `stashDemoEvidenceDataUrl`) | Low — single canonical stack; do NOT bypass |
| Adapter wrapper | `storage/localDemoAdapter.ts:25` (uses `peekDemoEvidenceDataUrl` :63, `stashDemoEvidenceDataUrl` :80) | — | Low |
| Artifact viewer hydration | `ArtifactViewerPage.tsx` imports cache helpers :9; uses resolver :143/483/501/564–565/919; iframe-safe layer :47–60 | — | — |
| Evidence Center (mode-aware) | `EvidenceCenterPage.tsx` :268 (demo) vs :355/465–468/575+ (REST) | Both modes documented in file header :1–11; switch on `isDemoMode` :252 | Medium — operator must understand which mode they're in |
| Workflow execution panel | `WorkflowExecutionPanel.tsx` :43 imports resolver; uses :963–989 + :2432–2443 | — | — |
| **Bypass watch** | All direct `localStorage.getItem('ces_ev_data_' + …)` should be inside `demoEvidenceRuntimeCache` only | `FormSigningWorkspace.tsx:1577–1580` writes `ces_ev_data_*` directly beside `stashDemoEvidenceDataUrl` (FROZEN — flag only) | Medium — duplicate cache seam |

### 3.4 Task derivation

| Concept | Canonical | Parallel implementations | Risk |
|---------|-----------|--------------------------|------|
| PM `Task[]` projection | `taskProjection.ts:41` (`useProjectedTasks`) + `taskProjectionCore.ts:94–101` (`projectTasks`) | Header declares SOT :34–39 | — |
| PM consumers | Same | `PmViews.tsx:170/288/507`, `SprintReviewPage:38`, `EvidenceCenterPage:254`, `TaskDetailRightPanel` via projector, `MyTasksPmPage`, `ApprovalsQueuePage`, `MobileIncidentExecutionPage` | Low — all canonical |
| `useProjectedTaskById` scope bug | `taskProjection.ts:147` uses `useProjectedTasks('sprint')` :158 regardless of caller's scope | — | Medium — task opened from a non-sprint context may appear "missing" |
| **CES obligation graph** | `ces/obligations/useObligations.ts` (claims "no duplicate stores" :2–5) | **`MyTasksPage.tsx:33–40`** `applyTaskFilter` on `MergedExecutionUnit[]`; **`SprintTaskPanel.tsx:111–117`** groups by `ComplianceState` | **HIGH** — calendar/sprint/MyTasks may show different counts/statuses for same `task_id` |
| Bridge / filter helpers | `ces/services/canonicalEventTaskFilter.ts:43+` | — | Low — explicit adapter |
| **`ownerOf` predicate copy-paste** | Should be one helper | `SprintReviewPage:22–25`, `SprintPlanPage:32–35`, `sprintAllocator.ts:71–74` | Low — drift risk if one copy changes |

### 3.5 Workflow execution paths

| Concept | Canonical | Parallel implementations | Risk |
|---------|-----------|--------------------------|------|
| Mutation / state machine | `regulatoryExecutionStore.ts:754` `setStepStatus`, :2729 `validateEvent`, :2476 `certifyEventComplete` (FROZEN) | Read paths: `effectiveStepStatus` :2677, `effectiveFormStatus` :2686 | — |
| `advanceStep` API | Defined :778 | **No call sites in `src/`** | Low — dead API or pending wire-up |
| Operator workflow UX | `WorkflowDrawer.tsx:42` (`setStepStatus` :222, completion shortcut :283) | — | Low |
| Event workspace | `EventWorkspace.tsx:57` (`setStepStatus` :517, `validateEvent` :314) | — | — |
| Mobile execution | `MobileIncidentExecutionPage:279` `setStepStatus('complete')` | — | Low |
| Heavy audit rail | `WorkflowExecutionPanel.tsx:120` (FROZEN; certifies :3154, validates :3334) | Mounted from `MasterCalendarPage:297/400` | Medium — certification path only tested in one component |
| Sprint-mode CES rail | `SprintTaskPanel.tsx:48` (uses `useObligations` + `FormViewer`, NOT WorkflowDrawer) | — | Medium — two execution rails (operator learns both) |
| Audit certification | `AuditModePage.tsx:890` `certifyEventComplete` | Same store API as `WorkflowExecutionPanel:3154` | Low — same guards |

### 3.6 Status calculations

| Concept | Canonical | Parallel implementations | Risk |
|---------|-----------|--------------------------|------|
| eCign packet / PM mapping (declared SOT) | `pm/ecignStatusMap.ts` (`deriveEcignPacketStatus` :19, `derivePmTaskStatus` :84) | — | — |
| CES task projection status | `taskProjectionCore.ts` uses `derivePmTaskStatus` :12–15 + snapshots :146–157 | — | — |
| Form / step effective status | `regulatoryExecutionStore:2686` (`effectiveFormStatus`), :2677 (`effectiveStepStatus`) | Template step `status` fields in `taskProjectionCore.ts:41–48` | Low — store overrides win at runtime |
| **`isEventComplete` vs `validateEvent`** | `regulatoryExecutionStore:2726` `isEventComplete` (`completions[...] === 'complete'`) vs :2729–2767 `validateEvent` (aggregates steps/forms/minutes/approvals) | Both used across codebase | **HIGH** — two different meanings of "complete"; UIs mixing them appear buggy |
| Locked / immutable | `evidenceModel.isEvidenceImmutable` (used `EvidencePanel:13`, `ArtifactViewerPage:16`) | Store mutation guards (e.g. `setStepStatus:754–761` `mutation.blocked`) | Low — dual layer by design |
| Overdue (Brad / scheduling) | `workflowSchedule.ts:68` (`n < 0 && !isEventComplete(ev.id)`) | `workflowRuntime.ts:81` (same) | Medium — overdue logic in 2 places |
| Blocked | `derivePmTaskStatus` returns `blocked` (`ecignStatusMap.ts:85/99`) | Store `updateTask` blocked transition :1668; CES `applyTaskFilter` `blocked` :38 | Medium — PM `blocked` vs CES `complianceState` semantic mismatch |

---

## 4. Form_instance_id schemas — coexisting (not consolidated)

Per Subagent A:
- **CES canonical** — `{eventId}-{formId}-{paddedSeq}` (`cesFormInstanceId.ts:8–10`) — FROZEN canonical
- **Legacy alias** — `eventId--formId` (`cesFormInstanceId.ts:13–21`) — FROZEN, still resolved
- **Bootstrap** — `fi_${nanoid}` (`FormViewer.tsx:1088–1089`) — replaced on store registration (:1088–1113)
- **Synthetic FI-...** — `FI-${Date.now()}…` (`WorkflowDrawer.tsx:413`) — used as a synthetic instance id in the workflow drawer
- **Signing workspace "canonical" check** — only validates `${eventId}-${formId}-` prefix (`FormSigningWorkspace.tsx:84–86`)

**There is NOT one schema in use.** Bootstrap + synthetic IDs are intentional non-canonical placeholders that get replaced on persistence. The audit recommends documenting this lifecycle clearly rather than collapsing schemas (which would require FROZEN-file changes).

---

## 5. Deprecation / consolidation candidates (DO NOT delete — document only)

| Drift item | Currently used by | Migration target | Safe to delete? | Effort |
|------------|--------------------|-------------------|------------------|--------|
| `PrintPage.tsx` vs `GVGBPrintDocument.tsx` styling split | `App.tsx:173–179` | Shared `PrintFrame` + `printStyles.ts` | **No** (deferred Wave 5B) | M (CSS + QA) |
| `FormSigningWorkspace` inline print CSS | Packet export | Single print CSS builder | **No** (FROZEN — hash-protected) | L |
| `useProjectedTaskById` sprint vs full mismatch | `TaskDetailRightPanel.tsx:22` | Pass scope or unified task index | **No** — needs targeted change set | S–M |
| **Dual task models (PM `Task[]` vs CES obligations)** | PM surfaces vs `SprintTaskPanel` / `MyTasksPage` | Architecture decision required | **No** — XL effort | **XL** |
| `advanceStep` store API | None in `src/` | Remove (dead) OR wire to UI | Needs validation | S |
| `isEventComplete` vs `validateEvent` semantic split | Many files (`EvidencePanel:26`, `EventWorkspace:314`, `workflowSchedule:68`, etc.) | Single documented semantics | **No** — behavioral | M |
| Ad-hoc `window.print` pages (Demo/Journey/iAdmin) | Demo + training surfaces | Enterprise print routes | Product decision | S–M |
| Already-deleted orphans (`GVPolicyDetailView`, etc.) | None | — | **Already removed** | — |

---

## 6. Top architectural risks (audit verdict)

1. **Two "task truths" coexist** — PM `Task[]` (canonical for Kanban/Gantt/Sprint board) AND CES `MergedExecutionUnit`/obligations (canonical for `SprintTaskPanel` + `MyTasksPage`). Both are documented as canonical. **Largest Wave 8 architectural risk.**
2. **`isEventComplete` ≠ `validateEvent`** — Two different functions answer different questions. UIs mixing them present as bugs to operators.
3. **Multiple print pipelines** — policy routes, form route, iframe `printForm`, packet HTML, survey packet. Visual drift visible to surveyors.
4. **Evidence layered correctly** for demo cache vs REST, **but `EvidenceCenterPage` must stay mode-aware** (`:252, :336+`) to avoid security/regression mistakes.
5. **Form_instance_id has 4 coexisting schemas** — managed by lifecycle (bootstrap → canonical), but documentation gap risks misuse.

---

## 7. Files touched in this audit

**None** in `src/`. This document is read-only output.

## 8. Protected files confirmed not modified

`FormSigningWorkspace.tsx`, `FormViewer.tsx`, `FormSignatureFlow.tsx`, `regulatoryExecutionStore.ts`, `ArtifactViewerPage.tsx`, `FormPrintView.tsx`, `LibraryPage.tsx`, `GVGBDetailView.tsx`, `PolicyDetailPage.tsx`, `PrintPage.tsx`, `GVGBPrintDocument.tsx`, `WorkflowExecutionPanel.tsx`, `taskIdentity.ts`, `cesFormInstanceId.ts`, `stateMachine.ts`, `localDemoAdapter.ts`, `cesEvidenceHierarchy.ts`, `vercel.json`, `AuthProvider.tsx`, `server/ecign/*`, `src/policy/ecign/*` — all read-only inspections.

## 9. Unresolved blockers

- Whether to formally retire `advanceStep` (dead API) or wire it.
- Whether to consolidate `isEventComplete`/`validateEvent` semantics (requires FROZEN-file changes).
- Whether to declare PM `Task[]` OR CES `MergedExecutionUnit` as the singular task source of truth (architectural decision).
- Whether the `FormSigningWorkspace:1577–1580` direct `localStorage` write is a redundant safety net or unintended duplicate (requires FROZEN-file inspection by orchestrator).
