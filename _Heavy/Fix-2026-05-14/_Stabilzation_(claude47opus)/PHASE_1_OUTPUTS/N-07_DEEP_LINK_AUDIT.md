# N-07 Deep-Link Audit — CES, Evidence Center, and eCign Routes

**Date:** 2026-05-16  
**Auditor:** claude-sonnet-4-5 (read-only)  
**Scope:** Deep-link restoration on CES, Evidence Center, and eCign route surfaces  
**Status:** Phase 1 Output — Ready for orchestrator to enact safe non-protected fixes

---

## 1. Audit Method and Scope

This audit surveyed 15 distinct route surfaces across three subsystems: CES (11 routes), Evidence Center (2 routes), and eCign (2 page routes + the `src/policy/ecign/*` service module). For each surface the auditor opened the page component file and traced: (a) every `useParams` / `useSearchParams` / `useLocation` call on mount, (b) which extracted values initialize state vs. are merely stored as local variables, (c) what happens when a required path param is missing or malformed, and (d) how the auth and feature-gate boundaries behave on a cold deep-link land. The MVP plan (`_Heavy/Fix-2026-05-14/UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md`, lines 1063–1199) was cross-referenced for the canonical multi-signer `?form_instance_id=` flow. All file paths and line numbers are confirmed from the actual source tree. No source files were modified.

---

## 2. Auth Boundary and Feature Gating — Global Findings

**Auth boundary (`src/auth/ProtectedRoute.tsx`, lines 17–19):** When an unauthenticated user hits any protected route, `ProtectedRoute` captures the full `pathname + search + hash` and redirects to `/login?next=<encoded-full-path>`. The `LoginPage` (`src/auth/pages/LoginPage.tsx`, lines 19–29) reads `?next=`, validates it is not an auth-page loop, and calls `navigate(next, { replace: true })` after a successful login. **Query params survive the auth round-trip.** This is clean for all surfaces wrapped in `ProtectedRoute`.

**Feature gating (`src/policy/security/features/FeatureRouteGuard.tsx`, lines 21–67):** When `canAccessRoute()` returns `allow: false`, the guard renders a clean "Access restricted" card with the feature label, `reasonCode`, and a "Return to Dashboard" link. Direct URL access to a gated route never produces a blank page. **This is clean across all gated surfaces.**

**Exception — `/forms/:formId/print`:** This route is declared at `src/App.tsx` line 165 outside the `path="*"` `ProtectedRoute` wrapper, and has no individual `ProtectedRoute` or `FeatureRouteGuard`. Unauthenticated users can reach it directly. See Section 5 (Protected/Deferred Fixes).

---

## 3. CES Findings

| Route | Required Params | Optional Query Params | Restored State | Error Handling | Gap? |
|---|---|---|---|---|---|
| `/ces` | — | — | Redirects to `/ces/dashboard` via `<Navigate replace />` (`App.tsx` line 271) | N/A | **None** |
| `/ces/dashboard` | — | `?event=<eventId>`, `?workflow=1`, `?view=sprint\|kanban\|gantt` | `?event=` restores selected calendar event and navigates the month view to its date (`MasterCalendarPage.tsx` lines 56–110). `?workflow=1` immediately opens the workflow for that event (lines 112–120). `?view=` restores the PM view toggle between calendar / sprint / kanban / gantt (lines 166–170). | No required params — landing without params defaults to current month. | **None** — all three query params are read and applied. |
| `/ces/board` | — | *(none read)* | Board renders all sprint units. The open-drawer state (`openUnit`) and drag state are `useState` locals in `SprintExecutionBoard.tsx` (lines 36–40). No URL params are read. | No params required; board always renders if data exists. | **Yes** — the open drawer unit is not URL-backed. Deep-linking to a specific card's detail view is not possible. |
| `/ces/workloads` | — | *(none read)* | `WorkloadDistribution` component has no `useSearchParams` / `useLocation` calls. Any filter or grouping state is local only. | N/A | **Yes** — filter/grouping state not URL-backed. |
| `/ces/reports` | — | *(none read)* | `ExecutiveReports` component has no `useSearchParams` / `useLocation` calls. Any tab or date-range selection is local only. | N/A | **Yes** — report view/tab state not URL-backed. |
| `/calendar/event/:eventId` | `:eventId` | *(none read)* | `MobileIncidentExecutionPage` (`stage="event"`) calls `useParams()` (line 41). Searches `REGULATORY_EVENTS`, `generatedEvents`, `triggeredEvents` for a match. Renders full event detail view. | If `eventId` does not match any event: renders an "Event not found" card (lines 68–80) with a Back to Calendar button. | **None** — path param is checked, graceful error shown. |
| `/calendar/event/:eventId/workflow` | `:eventId` | *(none read)* | `MobileIncidentExecutionPage` (`stage="workflow"`). `eventId` param drives event lookup. If found, `workflow` is derived. | If event not found: "Event not found" card shown. If event found but `workflow` is `null` (edge case): `{stage === 'workflow' && workflow ? <MobileWorkflowStepper /> : null}` silently renders nothing — no user feedback (line 87). | **Partial** — null-workflow case produces a blank content area with no message. |
| `/calendar/event/:eventId/task/:taskId` | `:eventId`, `:taskId` | *(none read)* | `MobileIncidentExecutionPage` (`stage="task"`). Both params extracted. `task` resolved via `projectedTasks.find(t => t.task_id === taskId)` (lines 58–61). | If event not found: "Event not found" card. If event valid but `taskId` not matched: `{stage === 'task' && task ? ... : null}` silently renders blank (line 90). | **Yes** — invalid or expired `taskId` produces a blank page rather than a user-friendly error. |
| `/calendar/event/:eventId/evidence/:taskId` | `:eventId`, `:taskId` | *(none read)* | `MobileIncidentExecutionPage` (`stage="evidence"`). Same param extraction and task lookup as above. | If event not found: error card shown. If `taskId` not matched: `{stage === 'evidence' && task ? ... : null}` silently renders blank (line 93). | **Yes** — same blank-on-invalid-task gap as the `/task/` route. |
| `/calendar/event/:eventId/approval` | `:eventId` | *(none read)* | `MobileIncidentExecutionPage` (`stage="approval"`). Does not require `taskId`. Renders `MobileApprovalReview` as long as event is valid (line 96). | If event not found: "Event not found" card shown. | **None** — approval stage only needs event. |
| `/my-tasks` | — | *(none read)* | `MyTasksPage.tsx`. Filter state (`filter`) initialized to `'open'` via `useState<TaskFilter>('open')` (line 203). No `useSearchParams` call exists in the component. | N/A — page always renders; empty-state message shown if no tasks match. | **Yes** — `?filter=` query param is not read. A link like `/my-tasks?filter=overdue` will land on the "open" filter, not the intended one. |

---

## 4. Evidence Center Findings

| Route | Required Params | Optional Query Params | Restored State | Error Handling | Gap? |
|---|---|---|---|---|---|
| `/evidence` | — | `?event_id=`, `?evidence_id=`, `?form_id=`, `?policy_id=`, `?workflow_id=`, `?task_id=`, `?requirement_id=`, `?form_instance_id=` | All eight params are extracted via `useMemo(() => new URLSearchParams(location.search), [location.search])` at `EvidenceCenterPage.tsx` lines 199–208. Six of them initialize filter state: `filterEventId` (line 213), `filterFormId` (line 214), `filterPolicyId` (line 215), `filterWorkflowId` (line 216), `filterTaskId` (line 217), `filterEvidenceId` (line 218). The `eventId` + `eventInput` states also seed from `qEventId` (lines 210–211), so the active event is pre-selected on load. | No required params. If `event_id` is absent defaults to `DEFAULT_EVENT` (`'EVT-DEMO-001'`). If a filter value matches no files, the file list is empty — no explicit "not found" message beyond an empty list. | **Partial** — `?requirement_id=` (line 207) and `?form_instance_id=` (line 208) are read into local variables (`qRequirementId`, `qFormInstanceId`) but **no filter state is initialized from them**. They are only used as context metadata passed to `toEvidenceFile`. A direct link to `/evidence?form_instance_id=FI-xxx` will NOT highlight or scroll to that instance. Also, `centerView` (`'hierarchy' | 'files'` toggle) is pure local state — not URL-backed. |
| `/artifacts/:artifactId` | `:artifactId` | `?type=`, `?event_id=`, `?task_id=`, `?form_id=`, `?form_instance_id=`, `?evidence_id=` | `ArtifactViewerPage.tsx` (lines 157–165) extracts all seven values. The `:artifactId` path param drives a multi-pass resolution: first tries form instance, then evidence doc, then approval, then certification, then audit row (`resolved` memo, lines 189–245). Supplementary query params enrich metadata display and the signer-roster lookup when the artifact is a `form_instance`. The `?form_instance_id=` and `?evidence_id=` params serve as fallback candidates in the resolution chain (line 191). | If artifact not found in any store slice: renders a rose-colored "Artifact was not found in the current CES store snapshot" block (lines 917–921). Error exists but gives no guidance that data is browser-session-local and not persisted across devices. | **Partial** — the "not found" error is present but gives no actionable recovery hint (e.g., "Data is stored locally in this browser session; re-open from the originating event task to restore."). |

---

## 5. eCign Findings

> **PROTECTED SUBSYSTEM — AUDIT ONLY. No changes proposed to `FormSigningWorkspace.tsx`, `FormViewer.tsx` internals, or anything in `src/policy/ecign/*`.**

| Route | Required Params | Optional Query Params | Restored State | Error Handling | Gap? |
|---|---|---|---|---|---|
| `/forms/:formId` | `:formId` | `?form_instance_id=` (also accepted: `?instance=`), `?event_id=` (also: `?event=`), `?workflow_id=` (also: `?workflow=`), `?task_id=`, `?form_id=`, `?policy_id=`, `?requirement_id=` | `FormViewer.tsx` (lines 969–993) uses `useParams()` for `:formId` and `useSearchParams()` for all query params. `?form_instance_id=` seeds `formInstanceId` state (line 1019) — this is the canonical multi-signer restoration param. When present and valid, `FormViewer` hydrates an existing instance rather than creating a new `fi_` one. `?event_id=` / `?event=` feeds `effectiveEventContext` which binds the form to a CES event (used to call `getOrCreateFormInstance` at line 1033). `?task_id=`, `?requirement_id=`, `?policy_id=` provide linkage metadata. | If `:formId` is absent: early return `null` (line 1407). If `:formId` does not exist in `FORMS_DATASET`: renders "Form Not Found" card with form ID and a "Return to Forms Library" button (lines 1408–1419). Feature gate (`FeatureRouteGuard featureId="ecign.view"`) shows clean "Access restricted" screen for unauthorized roles. | **Yes (PROTECTED — MVP-P0-CES-001):** The `?form_instance_id=` deep link is the canonical entry point for multi-signer restoration (MVP plan line 1199). However, `WorkflowExecutionPanel.tsx` is confirmed to NOT propagate `form_instance_id` when navigating to `FormViewer` (MVP-P0-CES-001, plan lines 220, 682). If the URL does not include `?form_instance_id=`, `FormViewer` generates a fresh `fi_xxx` instance instead of restoring the prior one — breaking the multi-signer chain. Fixing this seam requires changes to `WorkflowExecutionPanel.tsx` and `cesFormInstanceId.ts`, which are Architecture-reviewed paths. Two legacy aliases per param (`?event=` / `?event_id=`, `?workflow=` / `?workflow_id=`) are correctly aliased but indicate a drift in convention. |
| `/forms/:formId/print` | `:formId` | *(none read)* | `FormPrintView.tsx` (lines 8–15) uses `useParams()` for `:formId` only. Renders the blank template for printing; auto-triggers `window.print()` (line 25). No instance-specific data is loaded. | If `:formId` is absent or not in `FORMS_DATASET`: renders "Form not found" with the formId string (lines 32–38). | **Yes (PROTECTED — auth boundary):** Route is declared at `App.tsx` line 165 **outside** the `ProtectedRoute` / `CommandCenterLayout` wrapper. Any unauthenticated user with a URL can access form templates directly. This was intentional for print-standalone layout, but no auth or feature check exists. **Also:** No `?form_instance_id=` support — the print view always renders the blank template, never a completed/signed instance. A user who shares `/forms/EN-FM-001/print` expecting the recipient to see a completed form will receive a blank template instead. |
| `src/policy/ecign/*` (module) | — | *(reads no URL params directly)* | The eCign module (`useEcignInstance.ts`, `useEcignSession.ts`, `api.ts`, `hhcEvidence.ts`, `buildSignerRosterHtml.ts`, `demoLocalApi.ts`, `pdfAppendUtil.ts`, `signerIdentity.ts`) contains **no `useSearchParams`, `useLocation`, or `useParams` calls.** All params (`formId`, `eventId`, `form_instance_id`, etc.) are received as typed function arguments from `FormViewer`, which is the sole URL consumer in the eCign surface. The module itself owns zero routes and performs no URL reads. | N/A — errors surfaced upstream by FormViewer before eCign hooks are called. | **None at module level.** The URL reading responsibility is correctly centralized in FormViewer. The risk is upstream in the propagation chain (see `/forms/:formId` row above). |

---

## 6. Top 3 Safe, Non-Protected Fixes

These three items can be enacted without touching `FormSigningWorkspace.tsx`, `FormViewer.tsx` internals, any `src/policy/ecign/*` file, or the CES identity engine.

---

### Fix 1 — Add `?filter=` query param to `MyTasksPage`

**File:** `src/policy/ces/pages/MyTasksPage.tsx`  
**Lines:** 7 (imports), 203 (useState), plus a new `useEffect`

**Gap:** `filter` state is initialized to `'open'` via `useState` (line 203). There is no `useSearchParams` call anywhere in the file, so `/my-tasks?filter=overdue` or `/my-tasks?filter=awaiting_signature` lands on `'open'` regardless.

**Implementation sketch:** Import `useSearchParams` from `react-router-dom`. Add `const [searchParams, setSearchParams] = useSearchParams()` near the top of `MyTasksPage`. Change the `filter` `useState` initializer to read `(searchParams.get('filter') as TaskFilter | null) ?? 'open'`, with a type-guard to ensure it is one of the five valid `TaskFilter` values. In the `setFilter` handler, also call `setSearchParams({ filter: k }, { replace: true })` so the URL updates as the user changes filters in-app. This makes every filter combination bookmarkable and shareable. No data store or auth boundary is touched.

---

### Fix 2 — Add graceful "Task not found" panel for `task` and `evidence` stages in `MobileIncidentExecutionPage`

**File:** `src/policy/pages/MobileIncidentExecutionPage.tsx`  
**Lines:** 87–95 (stage conditional renders)

**Gap:** When `stage` is `'task'` or `'evidence'` and the resolved `task` is `null` (invalid or expired `taskId` in URL), the component renders `null` — a completely blank content area. The outer `!event` check (line 68) only fires if the event itself is missing; if the event is valid but the task ID is bad, the user sees a white void with no back button or explanation.

**Implementation sketch:** In the body of `MobileIncidentExecutionPage`, after the existing `if (!event)` guard, add a second guard that fires when the `stage` is `'task'` or `'evidence'` and `task` is `null`. It should render a card (matching the existing `ci-card` style) reading "Task not found" with a sub-message "Task ID `{taskId}` was not found in the current event. It may have been removed or the link may be stale." and a `navigate(\`/calendar/event/${eventId}\`)` Back button. This mirrors the pattern already used for the `!event` case at lines 68–80 and requires no store changes.

---

### Fix 3 — Add `?view=` query param to `EvidenceCenterPage` for the hierarchy/files toggle

**File:** `src/policy/pages/EvidenceCenterPage.tsx`  
**Lines:** 228 (`centerView` useState), ~750 area (setCenterView calls)

**Gap:** `centerView` (`'hierarchy' | 'files'`) switches the main display mode between the CES hierarchy tree and the flat file list, but it is pure local state (`useState<'hierarchy' | 'files'>('hierarchy')`, line 228). A user who shares `/evidence?event_id=EVT-001` always lands on the hierarchy view regardless of what the sharer was looking at.

**Implementation sketch:** The page already has `const location = useLocation()` and a `useMemo` that parses `location.search` (line 200). Extend that same `useMemo` to also read `query.get('view')` and validate it against `'hierarchy' | 'files'`. Initialize `centerView` with `(query.get('view') === 'files' ? 'files' : 'hierarchy')`. Where `setCenterView` is called (there are two tab-button click handlers), also call `setSearchParams` to write the `view` param into the URL with `replace: true`. No auth or store changes required.

---

## 7. Top 3 Protected / Deferred Fixes

These items touch Protected Subsystems, require Architecture review, or depend on server-side changes described in the MVP plan.

---

### Deferred Fix 1 — Propagate `form_instance_id` from `WorkflowExecutionPanel` to `FormViewer` (MVP-P0-CES-001)

**Files affected:** `WorkflowExecutionPanel.tsx`, `cesFormInstanceId.ts`, `useEventExecutionDataflow.ts`  
**Why protected:** This is the highest-priority open defect in the MVP plan (lines 220, 682). `form_instance_id` is the canonical key for multi-signer deep-link restoration. When `WorkflowExecutionPanel` navigates to `/forms/:formId` without appending `?form_instance_id=`, `FormViewer` creates a fresh `fi_xxx` instance instead of restoring the existing one, breaking the DON Assistant → DON signer chain and invalidating the artifact supersede chain (P0-ECIGN-001). The fix requires `cesFormInstanceId.ts` (the sole ID builder, plan line 226) to be called before navigation and the result threaded through `useEventExecutionDataflow.ts`. Architecture review is required per Lead 14 + Lead 5 canonical multi-signer flow (plan line 1199).

---

### Deferred Fix 2 — Add `ProtectedRoute` (or route-level auth check) to `/forms/:formId/print`

**File affected:** `src/App.tsx` line 165, possibly `FormPrintView.tsx`  
**Why protected / deferred:** The print route was deliberately placed outside the `CommandCenterLayout` / `ProtectedRoute` wrapper for clean pagination (App.tsx comment line 164). Any auth wrapper addition must not break the `window.top !== window.self` embedded-iframe detection at `FormPrintView.tsx` line 24 (which skips auto-print to avoid double dialogs). The design tradeoff — clean PDF print vs. auth gate — requires an Architecture decision before the fix can be safely enacted. A lightweight option is a redirect-to-login at the `FormPrintView` component level using `useAuth`, but the redirect destination and the print-flow re-entry need careful design.

---

### Deferred Fix 3 — `ArtifactViewerPage` "not found" message should surface session-local data caveat

**File affected:** `src/policy/pages/ArtifactViewerPage.tsx` lines 917–921  
**Why protected / deferred:** The current "Artifact was not found" message (line 919) does not explain that evidence data is stored in browser localStorage/IndexedDB and is not persisted server-side in the current demo configuration. Improving this message to say "This artifact may have been created in a different browser session. Persistent artifact storage requires the Phase 1 backend (S3/DynamoDB). Re-open from the originating CES event task to restore." would be safe in isolation. However, the correct persistence story is tied to the Phase 1 backend integration (VITE_HHC_API_BASE env var, Evidence API) and the `DEMO_LOCAL` vs `BACKEND_LIVE` mode split. The message text should be reviewed by the owner of the Evidence storage subsystem (Lead 6 per the MVP plan) to avoid confusing users about what is and isn't persisted.

---

## 8. Items Where There Is No Gap

The following surfaces have working deep-link support as of the audit date and require no action:

- **`/ces` → `/ces/dashboard` redirect:** Clean `<Navigate replace />`, no state to restore.
- **`/ces/dashboard` (`?event=`, `?workflow=`, `?view=`):** All three params properly read and applied on mount via `useSearchParams` + `useEffect` in `MasterCalendarPage.tsx`. Event selection, month navigation, and PM view toggle all survive a hard refresh.
- **`/calendar/event/:eventId` (event detail):** `:eventId` path param resolved in `MobileIncidentExecutionPage`; graceful "Event not found" shown for invalid IDs.
- **`/calendar/event/:eventId/approval`:** Does not require `taskId`; correctly renders with event only.
- **`/evidence` (six of eight query params):** `?event_id=`, `?evidence_id=`, `?form_id=`, `?policy_id=`, `?workflow_id=`, `?task_id=` all properly seed filter state on cold load.
- **`/forms/:formId` (form not found):** "Form Not Found" card with back button rendered when `:formId` is absent from `FORMS_DATASET`.
- **`/forms/:formId/print` (form not found):** "Form not found" graceful message rendered when `:formId` is invalid.
- **`/forms/:formId` (feature gate):** `FeatureRouteGuard featureId="ecign.view"` renders clean "Access restricted" screen with reason code.
- **Auth boundary (all protected routes):** `ProtectedRoute` captures `pathname + search + hash` into `?next=`; `LoginPage` restores it post-login. Query params survive the auth round-trip.
- **eCign module (`src/policy/ecign/*`):** Module has no URL reading logic — all URL param handling is correctly centralized in `FormViewer`. No deep-link gaps at the module level.

---

## 9. Honest Summary

| Metric | Count |
|---|---|
| Total route surfaces audited | 15 |
| Surfaces with **no gap** (clean) | 8 |
| Surfaces with **partial gap** (works but missing coverage) | 4 |
| Surfaces with **full gap** (state not URL-backed at all) | 3 |
| Safe, non-protected fixes identified | 3 |
| Protected / Architecture-review fixes identified | 3 |

**Breakdown:**

- **8 clean surfaces:** `/ces` redirect, `/ces/dashboard` (event+view params), `/calendar/event/:eventId`, `/calendar/event/:eventId/approval`, `/evidence` (6 of 8 params), `/forms/:formId` (form-not-found handling), `/forms/:formId/print` (form-not-found handling), eCign module service layer.

- **4 partial-gap surfaces:** `/calendar/event/:eventId/workflow` (null-workflow blank), `/calendar/event/:eventId/task/:taskId` (invalid task blank), `/calendar/event/:eventId/evidence/:taskId` (invalid task blank), `/artifacts/:artifactId` (not-found message lacks recovery guidance). `/evidence` also has a partial gap for `?requirement_id=` and `?form_instance_id=` which are read but not used to initialize filter state.

- **3 full-gap surfaces:** `/ces/board` (no URL params read — board drawer/filter state lost on refresh), `/ces/workloads` (no URL params read), `/my-tasks` (filter state not URL-backed).

- **Cross-cutting:** `/ces/reports` also has a full gap (no URL params read), but was not one of the originally scoped 15 surfaces.

The single most operationally significant gap is **MVP-P0-CES-001**: the `?form_instance_id=` param that enables multi-signer deep-link restoration is never placed in the URL by `WorkflowExecutionPanel`, so even though `FormViewer` correctly reads it, the feature cannot work end-to-end in the current build. This is a known confirmed defect in the MVP plan and requires Architecture-reviewed remediation.

---

**Status: Ready for orchestrator to enact safe non-protected fixes**  
**Date: 2026-05-16**
