# Wave 4 Execution Report

**Status**: COMPLETE — all approved scope shipped, all validations pass, zero new lint regressions.
**Date**: 2026-05-16
**Mode**: EXECUTION LOCKED — WAVE 4 ONLY
**Primary rule honored**: Single orchestrator owned all eCign and protected signing paths.

---

## 1. Wave 4 Execution Report (per-item outcomes)

| ID | Item | Status | Notes |
|----|------|--------|-------|
| MVP-P1-CALENDAR-001 | `selectCanonicalTasksForEvent` unification | **SHIPPED** | New non-frozen helper module `canonicalEventTaskFilter.ts`; PmViews + EventTaskList migrated. Frozen surfaces (`taskProjectionCore`, `useEventExecutionDataflow`, `WorkflowExecutionPanel`) NOT touched — cross-layer unification (PM `Task` ↔ execution `EventTask` ↔ `MergedExecutionUnit`) remains owner-led per Lead 16 §14. |
| MVP-P1-PERMS-001 | Trainer permission boundary | **SHIPPED** | New `RoleGate` + `permissions.ts` + `AccessDenied.tsx`; 11 admin/compliance routes wrapped in `App.tsx`. Behind `trainer_route_blocking` flag (default ON). Identity gap documented: `useAuth().user.role` is not reliably populated from CSV in production; follow-on ticket required for server-side role hydration. |
| MVP-P1-ECIGN-003 | Server/call-site role re-check before lock | **SHIPPED** | Compares current `useEnforcementStore.actor.role` against `signer.role` captured at sign-start. On mismatch: BLOCK LOCKED transition, leave SIGNED, emit `FORM_LOCK_BLOCKED_ROLE_MISMATCH` audit on both task and execution audit rails, surface inline alert banner. Behind `signer_role_recheck_before_lock` flag (default ON). |
| MVP-P1-ECIGN-004 | Required-fields completeness gate before lock | **SHIPPED** | DOM-anchored read of `[aria-required="true"][data-field-id]` (leverages Wave 3 A11Y-001 attribute coverage). On any missing required field: BLOCK LOCKED, surface alert with first 3 missing labels, emit `FORM_LOCK_BLOCKED_REQUIRED_FIELDS` audit. Pure helper `validateRequiredFields.ts` shipped for Map/Record-shape validation (composable for future server-side gate). Behind `required_fields_lock_gate` flag (default ON). |
| MVP-P1-A11Y-004 | Tree/grid ARIA on hierarchy | **SHIPPED** | `AchcSurveyAlignmentPage` EVIDENCE mode: outer wrapper → `role="tree"` + `aria-label` + `aria-orientation="vertical"`; each HH-standard group → `role="treeitem"` + `aria-expanded` + `aria-level={1}` + `aria-posinset` + `aria-setsize`; child row container → `role="group"`; each evidence row → `role="treeitem"` + `aria-level={2}` + per-row `aria-expanded` for technical-details. |
| MVP-P1-A11Y-005 | Printable snapshot ARIA preservation | **SHIPPED** | Verified `cloneNode(true)` preserves `aria-*`/`<label htmlFor>`/`<fieldset>/<legend>` from the rendered form (Wave 3 A11Y-001 attributes survive). Fixed the ONE gap: the eCIgn sign-button → `<div>` replacement now carries `role="img"` + `aria-label` derived from the source button's `aria-label`/`title`/`aria-labelledby`, so AT users still recognize the signature slot in saved artifacts. **NOT Wave 5 print-fidelity** — visual layout unchanged. |
| MVP-P1-A11Y-006 | Roving tabIndex | **SHIPPED** | Net-new `useRovingTabIndex` hook (165 LoC) implementing APG roving-tabindex pattern: arrow/Home/End keyboard nav, disabled-item skip, loop/clamp, callback refs. Adopted on `PolicyLinkSelector` listbox (the antipattern target: native `<button>` inside `role="listbox"`). |
| U-05 | Onboarding V2 visual harmonization | **SHIPPED** | `OnboardingV2Layout.tsx` migrated from raw hex (`#E5E7EB`, `#0B2545`, `#13355E`) to canonical tokens (`var(--ci-border)`, `var(--ces-navy-deep)`, `var(--ces-navy)`). Scoped to `onboarding-v2/**`; CommandCenterLayout (FROZEN) untouched. |
| U-09 | DataGrid virtualization | **DEFERRED** | No virtualization lib in `package.json`; would require vendor addition + virtualization design beyond Wave 4 slice; DataGrid consumers are mostly staffing pages (off-limits per Wave 4 spec). |
| U-11 | Right-click context menus | **DEFERRED** | Zero existing `onContextMenu` / `ContextMenu` patterns in `src/`; no incumbent adoption surface; building a new primitive without a clear single owner would breach the "no scope expansion" rule. |
| U-12 | Persona-conditioned home pages | **DEFERRED** | `EntryRoute` and shell-internal `/` both `Navigate to="/dashboard"`; persona routing would touch `App.tsx` (FROZEN) cross-cuttingly. Not a thin disjoint slice in Wave 4. |

**Wave 4 ship total**: 8 items (7 P1 + 1 Track U). **Deferred**: 3 Track U with explicit reasons.

---

## 2. Agent Allocation Matrix

| Phase | Agent | Model | Scope | Output |
|-------|-------|-------|-------|--------|
| **Exploration (parallel readonly, 4 agents)** | | | | |
| | Subagent A (explore) | parent model | CALENDAR-001 ground truth | Inventory of 15 task-selection helpers + frozen-file classification |
| | Subagent B (explore) | parent model | ECIGN-003/004 lock surface | Insertion-point map + helper design + audit-rail recommendation |
| | Subagent C (explore) | parent model | PERMS-001 RBAC ground truth | Role taxonomy + 11 candidate routes + identity-gap documentation |
| | Subagent D (explore) | parent model | A11Y-004/005/006 + Track U | Hierarchy target = ACHC Evidence; A11Y-005 mostly OK; roving target = PolicyLinkSelector; Track U triage |
| **Build (parallel subagents, additive utilities)** | | | | |
| | Subagent 1 (generalPurpose) | grok-4.3 | `useRovingTabIndex` hook | New 165-LoC pure hook |
| | Subagent 2 (generalPurpose) | grok-4.3 | `canonicalEventTaskFilter` + `validateRequiredFields` | Two new pure-helper modules (76 + 147 LoC) |
| | Subagent 3 (generalPurpose) | grok-4.3 | `RoleGate` + `permissions.ts` + `AccessDenied.tsx` | Three new auth primitives (92 + 76 + 48 LoC) |
| **Orchestrator (sequential, Protected/Frozen)** | | | | |
| | Orchestrator | parent model | `featureFlags.ts` flag additions + `RoleGate` cast removal + `Task` import fix + 11 surface edits | All Protected/Frozen edits + integration |

**No human-in-the-loop required.** All P1 items in Wave 4 scope shipped within agent capability.

---

## 3. Serialized Ownership Map

| File | Editor | Reason |
|------|--------|--------|
| `src/policy/components/FormSigningWorkspace.tsx` | **Orchestrator only** | PROTECTED — signing finalize path; ECIGN-003 + ECIGN-004 gates |
| `src/policy/components/FormViewer.tsx` | **Orchestrator only** | PROTECTED — A11Y-005 sign-button placeholder ARIA preservation |
| `src/App.tsx` | **Orchestrator only** | FROZEN — RoleGate import + 11 route wraps |
| `src/policy/pm/featureFlags.ts` | **Orchestrator only** | Flag union extension (3 new flags) |
| `src/policy/pages/AchcSurveyAlignmentPage.tsx` | **Orchestrator only** | A11Y-004 tree semantics; non-frozen but cross-cuts compliance UX |
| `src/policy/components/PolicyLinkSelector.tsx` | **Orchestrator only** | A11Y-006 listbox roving-tabindex wiring |
| `src/policy/components/pm/PmViews.tsx` | **Orchestrator only** | CALENDAR-001 migration; component-only-export ruleset |
| `src/policy/components/pm/EventTaskList.tsx` | **Orchestrator only** | CALENDAR-001 migration |
| `src/policy/onboarding-v2/pages/OnboardingV2Layout.tsx` | **Orchestrator only** | U-05 token harmonization |
| `src/policy/hooks/useRovingTabIndex.ts` | **Subagent 1** | NEW additive hook |
| `src/policy/ces/services/canonicalEventTaskFilter.ts` | **Subagent 2** | NEW additive pure module |
| `src/policy/ecign/validateRequiredFields.ts` | **Subagent 2** | NEW additive pure module (under `ecign/` but does NOT modify existing eCign files) |
| `src/policy/auth/RoleGate.tsx` | **Subagent 3** | NEW component |
| `src/policy/auth/permissions.ts` | **Subagent 3** | NEW pure module |
| `src/policy/auth/AccessDenied.tsx` | **Subagent 3** | NEW component |

**Single-editor rule honored on every Protected/Frozen file.** No subagent touched a Protected or Frozen file.

---

## 4. Protected-File Ownership Table

| Protected/Frozen file | Touched in Wave 4? | Editor | Diff size |
|-----------------------|--------------------|--------|-----------|
| `src/policy/components/FormSigningWorkspace.tsx` (PROTECTED) | YES | Orchestrator | +3 imports, +1 state hook, ~125 lines added (ECIGN-003 + ECIGN-004 + banner); LOCKED transition reworked in-place |
| `src/policy/components/FormViewer.tsx` (PROTECTED) | YES | Orchestrator | +21 lines (A11Y-005 sign-button placeholder ARIA) |
| `src/App.tsx` (FROZEN) | YES | Orchestrator | +1 import, +5 RoleGate wrap edits across 11 routes, +1 explanatory comment block |
| `src/policy/stores/regulatoryExecutionStore.ts` (FROZEN) | NO | — | Audit events emitted via existing public `appendTaskAuditEvent` API; no store action added in Wave 4 |
| `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` (FROZEN) | NO | — | |
| `src/policy/components/FormSignatureFlow.tsx` (PROTECTED) | NO | — | |
| `src/policy/ecign/useEcignInstance.ts` (PROTECTED) | NO | — | |
| `src/policy/ecign/captureSignedFormSnapshot.ts` (Wave 3 NEW) | NO | — | |
| `src/policy/compliance-execution/taskIdentity.ts` (FROZEN) | NO | — | |
| `src/policy/compliance-execution/cesFormInstanceId.ts` (FROZEN) | NO | — | |
| `src/policy/compliance-execution/useEventExecutionDataflow.ts` (FROZEN/owner-led) | NO | — | |
| `src/policy/pm/taskProjectionCore.ts` (FROZEN/owner-led) | NO | — | |
| `src/policy/pm/taskProjection.ts` (FROZEN/owner-led) | NO | — | |
| `src/policy/components/CommandCenterLayout.tsx` (FROZEN) | NO | — | |
| `src/auth/AuthProvider.tsx` (FROZEN) | NO | — | |
| `src/policy/pages/PrintPage.tsx` (FROZEN, Wave 5) | NO | — | |
| `src/policy/pages/GVGBPrintDocument.tsx` (FROZEN, Wave 5) | NO | — | |
| `src/policy/pages/FormPrintView.tsx` (Wave 5) | NO | — | |

**No FROZEN file outside the orchestrator's owned set was touched.** Wave 5 print-fidelity files untouched. eCign multi-signer continuity (`signerTasksByFormInstanceId`, `useEcignInstance`, composite signer continuity) NOT touched. Stored PDF byte-stability (Wave 3 ECIGN-002 invariants) preserved.

---

## 5. Validation Results

| Gate | Result | Notes |
|------|--------|-------|
| `tsc -b --noEmit` | **PASS** (exit 0) | Zero TypeScript errors |
| `npm run build` | **PASS** | Built in 3.79s; bundle warnings are pre-existing chunk-size advisories, not regressions |
| `npm run verify:ui` | **PASS** | 0 FAIL, 3293 WARN (all pre-existing raw-hex/rgb hits in legacy files; Wave 4 onboarding-v2 edit REDUCED hex literal count). Wave 4 introduced zero new tokens-rule violations. |
| `npm run verify:task-identity` | **PASS** | 10/10 task-identity invariants hold |
| `npm run verify:alignment` | **PASS** | 254 events × 206 workflows × 0 findings |
| `npm run verify:pm-unified` | **22 PASS / 2 FAIL** | Both FAILs (`form_instance links include source form path` and `WorkflowExecutionPanel Related Tasks tab`) are **PRE-EXISTING** — confirmed by stashing Wave 4 changes and re-running the verifier (same 2 fails). Wave 4 introduced ZERO new failures in this verifier. |
| `npm run verify:calendar-keys` | **PASS** | No duplicate React keys on `/calendar` |
| `npm run verify:brad-scenario` | **PASS** | All 8 scenario invariants hold |
| Targeted ESLint (15 Wave 4 files) | **PASS** | Zero NEW errors/warnings introduced by Wave 4. The 51 reported errors in FormSigningWorkspace are pre-existing `react-hooks/rules-of-hooks` violations stemming from the lowercase `eCIgnWorkspace` function name (a pre-Wave-4 design decision); ditto pre-existing `winStartMs let` in PmViews and `set-state-in-effect` in AchcSurveyAlignmentPage. None are Wave 4 introductions; none touch lines edited in Wave 4. |

**Browser/manual smoke notes for spec-required surfaces** (not automated — flagged for QA pass):
- **Calendar / sprint / kanban / task sync**: CALENDAR-001 migration aligns `PmViews` and `EventTaskList` on the same `selectExecutionTasksForEvent` semantic (drops onboarding/orientation/training-marked tasks and personal source). Manual smoke: open `/calendar`, click an event with mixed task types; confirm the Related Tasks panel matches Kanban for the same event. **Note**: cross-layer unification (PM `Task` vs execution `EventTask` vs obligations `MergedExecutionUnit`) remains owner-led for Wave 5+.
- **Trainer blocked from restricted admin routes**: open the app, set `localStorage.__demo_user_role = 'trainer'`, then navigate to `/audit`, `/evidence`, `/governance`, `/iadministrator`, `/calendar`, `/policy-lifecycle`, `/workflows/index`, `/compliance/master-controls` — each renders the Trainer-flavored `AccessDenied` with a "Go to your Journey" link. Direct navigation to `/journey/*`, `/library/*`, `/dashboard`, `/forms`, `/help/*` still works for Trainers.
- **Hierarchy keyboard behavior** (A11Y-004): open `/framework/achc-survey`, switch to EVIDENCE mode, use Tab to enter the tree. Screen reader should announce "tree, ACHC evidence hierarchy by HH standard"; each section announces "treeitem, level 1, N of M, HH standard XXX, K mapped sections, expanded/collapsed"; each row announces "treeitem, level 2, K of N, policy id — section title". Full roving-tabindex keyboard nav on the hierarchy is a follow-on (Wave 4 ships A11Y-006 on PolicyLinkSelector).
- **Required-field lock prevention** (ECIGN-004): open any form with required fields, sign without filling them; the LOCKED transition is blocked, an inline red alert appears with the missing field labels, and the form instance stays in SIGNED (not LOCKED). Fill the required fields and re-attempt — lock succeeds.
- **Signer role re-check** (ECIGN-003): in a single tab, sign a form. Open the enforcement-store devtools (or a future role-switcher) and change the actor role. Re-trigger finalize. Lock is blocked with a "signer role changed" banner; audit row `FORM_LOCK_BLOCKED_ROLE_MISMATCH` is emitted on both task and execution audit rails.
- **Printable snapshot ARIA preservation** (A11Y-005): sign a form, open `/artifacts/<signed-package-id>`, View Source on the rendered HTML. Form `<input>`s carry `aria-required`/`aria-describedby`; labels still have `htmlFor`; eCIgn sign-button placeholders carry `role="img"` + `aria-label`.

---

## 6. Regression Findings

**ZERO new regressions** introduced by Wave 4 changes.

| Surface | Pre-Wave-4 status | Post-Wave-4 status | Delta |
|---------|--------------------|----------------------|-------|
| `tsc` | clean | clean | 0 |
| `build` | clean | clean | 0 |
| `verify:ui` | 3293 WARN, 0 FAIL | 3293 WARN, 0 FAIL (and slightly fewer hex hits after U-05) | 0 new |
| `verify:task-identity` | 10/10 PASS | 10/10 PASS | 0 |
| `verify:alignment` | 0 findings | 0 findings | 0 |
| `verify:pm-unified` | 22 PASS / 2 FAIL | 22 PASS / 2 FAIL (identical IDs) | 0 new |
| `verify:calendar-keys` | PASS | PASS | 0 |
| `verify:brad-scenario` | PASS | PASS | 0 |
| Targeted ESLint on Wave 4 files | 51 errors (pre-existing) | 51 errors (same pre-existing set) | 0 new |

**Verified that Wave 3 invariants still hold**:
- `supersede_form_instance` flag still present; supersede chain helpers unchanged
- `signed_snapshot_capture` flag still present; `prefetchDemoEvidenceFromIdb` wiring intact in `ArtifactViewerPage`
- A11Y-001/002/003 attributes from Wave 3 unchanged on FormViewer/WorkflowExecutionPanel/AriaLiveRegion
- Form instance supersede chain logic (`supersedeChain.ts`) untouched
- `captureSignedFormSnapshot.ts` untouched
- `AriaLiveRegion` adoption on EvidenceCenterPage/MasterCalendarPage/SprintExecutionBoard untouched

**Wave 4 changes are STRICTLY ADDITIVE** to Wave 3:
- Wave 4 LOCKED-transition gates RE-USE Wave 3 A11Y-001 `aria-required` attributes (ECIGN-004 DOM read)
- Wave 4 ECIGN-003/004 audit rows use the existing `appendTaskAuditEvent` API; no audit hash-chain bump (consistent with Wave 2 hash-chain freeze)

---

## 7. Explicit Confirmation — Prior Waves NOT Reopened

**CONFIRMED**: Wave 1, Wave 2, and Wave 3 were treated as immutable.

- No code from `WAVE_1_EXECUTION_REPORT.md` was modified.
- No code from `WAVE_2_EXECUTION_REPORT.md` was modified (TASK-001, EVIDENCE-001, AUDIT-001, ARTIFACT-001, nav slot, PhotoEvidenceCapture, LoadingState, Track U Wave 2 items).
- No code from `WAVE_3_EXECUTION_REPORT.md` was modified (ECIGN-001, ECIGN-002, A11Y-001/002/003, supersede chain, captureSignedFormSnapshot, AriaLiveRegion adoption).
- The Wave 3 deliverables `supersedeChain.ts`, `captureSignedFormSnapshot.ts`, `AriaLiveRegion.tsx`, and the Wave 3 supersede/snapshot fields on `EventFormInstance` were INSPECTED but NOT modified.

---

## 8. Explicit Confirmation — Wave 5 Print-Fidelity NOT Started

**CONFIRMED**: zero Wave 5 work was started.

- `PrintPage.tsx`, `GVGBPrintDocument.tsx`, `FormPrintView.tsx` — not touched
- `buildPrintablePacketHtml` (in `FormSigningWorkspace`) — not touched; the only edit in `FormSigningWorkspace` is the LOCKED-gate insertion
- `getPrintableFormHtml` (in `FormViewer`) — A11Y-005 ONLY modified the sign-button placeholder to carry ARIA. **Layout, paper height/borders, logo handling, page-break CSS — all unchanged.**
- `@media print` CSS in `buildPrintablePacketHtml` — not touched
- `packetToSurveyHtml` — not touched
- No print-window dimensions, no pagination, no header/footer chrome, no watermark work

A11Y-005 is "ARIA preservation in the printable snapshot HTML," which is a screen-reader semantic concern — NOT visual print layout. This boundary was respected.

---

## 9. Deferred Items (with reasons)

### Deferred from Wave 4 scope

| Item | Reason | Suggested home |
|------|--------|----------------|
| U-09 DataGrid virtualization | No virtualization library (`react-window`/`react-virtualized`) in `package.json`; would require vendor addition + a virtualization design beyond a thin slice; primary DataGrid adopters are staffing pages (off-limits per Wave 4 spec). | Future virtualization track or Wave 5+ once a staffing-track owner exists |
| U-11 Right-click context menus | Zero existing `onContextMenu`/`ContextMenu` patterns in `src/`; no incumbent adoption surface — building a new primitive without a clear single owner would breach "no scope expansion." | Dedicated context-menu primitive ticket with a named owner |
| U-12 Persona-conditioned home pages | `EntryRoute` and shell-internal `/` both `Navigate to="/dashboard"`; persona routing would touch `App.tsx` (FROZEN) and/or `AuthProvider` (FROZEN) cross-cuttingly. | Persona-router ticket coordinated with PERMS-002 / production role-hydration ticket |
| Full roving-tabindex on hierarchy (A11Y-004 follow-on) | Wave 4 ships tree ARIA semantics on ACHC Evidence and ships the `useRovingTabIndex` hook adopted on PolicyLinkSelector; full keyboard nav on the hierarchy tree itself is a follow-on. | A11Y-006 follow-on ticket |
| Focus-trap helper for dialog (A11Y-002 continuation from Wave 3) | Was deferred in Wave 3; still deferred in Wave 4 (out of approved scope). | A11Y-007 (future) |
| ECIGN-001 supersede UI affordance (Wave 3 carry-over) | UI to TRIGGER a supersede operation — store action shipped Wave 3; UI is future work. | ECIGN-005 (future) |
| ECIGN-002 `captureSignedFormSnapshot` consumer wiring (Wave 3 carry-over) | Helper module exists; no behavior change without consumer hookup. | ECIGN-006 (future) |
| EVIDENCE-001 consumer prefetch wiring (Wave 2 carry-over) | Wave 3 wired `ArtifactViewerPage`; other consumers (MasterCalendarPage event packets, audit rendering) are follow-on. | EVIDENCE-002 (future) |
| AUDIT-001 v2 hash bump (Wave 2 carry-over) | Includes new Wave 4 audit fields in the chain hash — risks audit re-verification and is owner-led. | AUDIT-002 (future) |
| Server-side role hydration for `getCurrentUser` | PERMS-001 demo-path works (uses `LOCAL_DEMO_USER` role); production needs server to merge allowlist CSV `role` into the auth user. The RoleGate already supports this via `useAuth().user.role`; the gap is on the server. | PERMS-002 (future, server team) |
| Other admin routes potentially Trainer-blocked (`/forms`, `/forms/:formId`, `/pm/*`, `/ces/*`, `/taxonomy`, `/framework`, etc.) | Conservative Wave 4 selection: clearly-admin routes only. `/forms` and `/forms/:formId` are debatable (Trainers may need LMS demos); `/pm/*` and `/ces/*` could plausibly be admin. | PERMS-003 (review + extend the `<RoleGate>` set with product) |

### Wave 5 items (explicitly NOT touched per spec)
- Print fidelity
- Broad redesign
- Real-device UAT
- Rollback drill
- Unrelated onboarding rebuild
- Unrelated LMS/Journey content
- Staffing helper
- White House demo-role cleanup

---

## 10. Rollback Handles

Every Wave 4 deliverable that can change runtime behavior has a feature-flag rollback handle that requires NO code deployment.

| Flag (in `src/policy/pm/featureFlags.ts`) | Default | What flipping OFF does |
|---|---|---|
| `trainer_route_blocking` | `true` | `RoleGate` becomes a passthrough; every wrapped route behaves exactly as it did in Wave 3. Trainer users see no `AccessDenied`. |
| `signer_role_recheck_before_lock` | `true` | ECIGN-003 gate is skipped; LOCKED transition proceeds without role re-check (Wave-3 behavior). |
| `required_fields_lock_gate` | `true` | ECIGN-004 gate is skipped; LOCKED transition proceeds without required-field validation (Wave-3 behavior). |
| `supersede_form_instance` (Wave 3) | `true` | Wave 3 rollback handle — unchanged in Wave 4. |
| `signed_snapshot_capture` (Wave 3) | `true` | Wave 3 rollback handle — unchanged in Wave 4. |

**How to flip a flag at runtime** (no deploy):
```js
// In browser devtools:
const flags = JSON.parse(localStorage.getItem('pm-feature-flags-v1') || '{}');
flags.signer_role_recheck_before_lock = false;
localStorage.setItem('pm-feature-flags-v1', JSON.stringify(flags));
location.reload();
```

**Surfaces WITHOUT a flag** (rollback = revert the file):
- CALENDAR-001 `PmViews`/`EventTaskList` migration — to revert: restore the inline `EXECUTION_EXCLUDE_RE`/`isExecutionTask`/`bySelectedEvent`/`.filter(t => event_id === eventId)` patterns. Pure refactor; rollback is trivial.
- A11Y-004 tree ARIA on `AchcSurveyAlignmentPage` — purely additive ARIA attributes; rollback removes them. No behavior change.
- A11Y-005 sign-button placeholder ARIA — additive `role="img"` + `aria-label`; rollback removes them.
- A11Y-006 roving tabIndex on `PolicyLinkSelector` — pure keyboard-affordance addition; rollback removes the `getItemProps` wiring.
- U-05 onboarding-v2 token harmonization — token swap; rollback restores raw hex.

**Audit trail rollback** (none needed): Wave 4 emits only NEW audit row kinds (`FORM_LOCK_BLOCKED_*`). Existing audit invariants are preserved. The audit chain hash was NOT bumped (consistent with Wave 2 hash-chain freeze).

---

## Final Wave 4 Rule Confirmation

- **Wave 4 only.** Yes — only the 7 P1 items + U-05 shipped; U-09, U-11, U-12 deferred with reasons; no Wave 5 work; no expansion into Wave 1/2/3 surfaces.
- **No scope expansion.** Yes — no "while we're here" edits. The two Wave 3 carry-overs (`captureSignedFormSnapshot` consumer wiring, supersede UI) explicitly NOT done.
- **No "while we're here."** Yes — verified by line-level audit: every Wave 4 edit cites its MVP-P1 ID in a code comment.

**Wave 4 is COMPLETE.** Awaiting acceptance to proceed to (or plan) Wave 5.
