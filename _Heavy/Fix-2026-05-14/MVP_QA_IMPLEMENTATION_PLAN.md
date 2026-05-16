# MVP QA Implementation Plan

**Date:** 2026-05-15
**Mode:** PLAN ONLY — no source code changed, no commits, no deploys.
**Source:** Synthesis of 7 parallel Grok 4.3 review agents over the QA/UAT audit corpus + cross-cutting forensics.

---

## 1. Executive Summary

The QA/UAT corpus is internally consistent. The MVP is blocked by a small, tightly coupled set of failures concentrated in three subsystems: **eCign signing**, **Vercel auth bootstrap**, and **task/artifact identity** (which feeds Evidence Center, Audit Trail, Print, and the four planning views). Accessibility and task-model declutter are P1 — should ship for demo, must ship before any external-user trial.

Key finding from the test/build agent: **the build is green, but zero of the 9 manual browser tests in the QA plan have execution records.** Every claimed P0/P1 fix in this codebase has historically been declared "done" after `tsc` + `npm run build` passed, then reopened by the user when the browser still showed the bug. This pattern (the "Claude false-fix loop" documented in `docs/context-for-grok/cursor-forensics/components/qa_uat/CLAUDE_FALSE_FIX_REPORTS.md`) is the highest meta-risk to MVP. Every package below requires a browser validation gate before being marked complete.

The recently rebuilt registration system (SF Org ID allowlist) is the only confirmed-stable area. It is fail-closed and waiting on the real approved-users CSV.

---

## 2. Current MVP Stability Assessment

| Subsystem | State | Confidence | Notes |
|-----------|-------|------------|-------|
| Auth — login, session, refresh | Green (code) / Unknown (Vercel) | Med | Cognito flow stable locally; Vercel demo bootstrap unverified |
| Auth — registration (SF Org ID) | Green, fail-closed | High | CSV not yet provided → no users can register |
| Policy view / library | Stable | High | Canonical owners established; deletes complete |
| GV-GB-001 specimen view | Stable | High | UX refinement landed; needs browser sign-off |
| eCign signing — single signer | Drifting | Med | Renders live HTML instead of stored PDF |
| eCign signing — multi signer | BROKEN | High | Per-signer artifact ID drift; chain-of-custody broken |
| Evidence Center | Metadata-only | High | Blob lost on refresh; sandbox reset incomplete |
| Audit Trail links | Broken | High | targetKind/targetId nested instead of top-level |
| CES task identity | Drifting | High | Q2 Playwright defects; form_instance_id not threaded |
| Calendar / Sprint / Kanban / Gantt | Out of sync | Med | Divergent projections, ID collision risk |
| Print / signed PDF routes | Drifting | High | Resolves to wrong content silently |
| Accessibility | Below WCAG floor | High | Form labels, drawer dialog semantics, aria-live missing |
| Task model | Bloated | High | 25–40 tasks per event; user-reported "too many objects" |
| ACHC / surveyor mode | Untested | Low | No execution log; assumed stable |
| Permissions / Trainer leakage | Drifting | Med | user.provision over-broad; not validated in browser |
| Builder / Bin git hygiene | Polluted | High | 80+ tracked files that should be ignored |

---

## 3. P0 Issues — Must Fix Before Demo / Release

| ID | Title | Owner File | Type |
|----|-------|------------|------|
| MVP-P0-AUTH-001 | Vercel demo bootstrap: env not present at build time + `vercel.json` wildcard rewrite intercepts `/api/*` | `vercel.json`, `src/auth/AuthProvider.tsx` | auth_security |
| MVP-P0-AUTH-002 | Approved-users CSV not deployed → registration permanently fails closed | `config/approved-users.csv` (missing) | auth_security |
| MVP-P0-ECIGN-001 | Multi-signer artifact identity drift: `removeEvidence`+`uploadEvidence` produces N artifacts per canonical form_instance, breaking audit + print + retrieval | `src/policy/ecign/api.ts`, `src/policy/components/FormSigningWorkspace.tsx` | ecign_legal |
| MVP-P0-ECIGN-002 | Post-sign Download/Print/Open renders live HTML template instead of stored signed PDF | `src/policy/components/FormSigningWorkspace.tsx` (`finalizeSigning`, `isSubsequentSigner` branch) | ecign_legal |
| MVP-P0-CES-001 | `form_instance_id` not propagated on Complete Form from WorkflowExecutionPanel (DON Assistant → DON path) | `src/policy/compliance-execution/cesFormInstanceId.ts`, `useEventExecutionDataflow.ts`, `WorkflowExecutionPanel.tsx` | workflow_task_logic |
| MVP-P0-A11Y-001 | Form fields lack `htmlFor`/`id`/`aria-labelledby` — blocks any screen-reader user from completing a signing attestation | `src/policy/components/FormViewer.tsx` (Field component) | accessibility |
| MVP-P0-A11Y-002 | WorkflowExecutionPanel drawer lacks dialog role, focus trap, and focus return | `src/policy/components/WorkflowExecutionPanel.tsx` | accessibility |
| MVP-P0-A11Y-003 | No aria-live regions for signing progress, evidence updates, form section changes | `FormViewer.tsx`, `FormSigningWorkspace.tsx`, `EvidenceCenterPage.tsx` | accessibility |
| MVP-P0-TASK-001 | Composite "Form + Signers" card collapse — collapse per-role SIGN- tasks under parent form in projector views (no backend change) | `src/policy/pm/taskProjectionCore.ts`, `taskProjection.ts`, `WorkflowExecutionPanel.tsx` | workflow_task_logic |

---

## 4. P1 Issues — Should Fix Before Demo / Release

| ID | Title | Owner File | Type |
|----|-------|------------|------|
| MVP-P1-EVIDENCE-001 | Evidence Center artifacts metadata-only after reload (in-memory cache, blob lost) | `src/policy/evidence/storage/localDemoAdapter.ts`, `regulatoryExecutionStore.ts` | evidence_integrity |
| MVP-P1-AUDIT-001 | Audit event `targetKind` / `targetId` populated under `after.*` instead of top-level — Evidence + deep links cannot resolve | `server/identity/...` audit emitter, `taskAuditEvent.ts` | evidence_integrity |
| MVP-P1-ARTIFACT-001 | ArtifactViewerPage uses heuristic `resolveFormInstanceFromArtifactCandidates` + legacy fallback; no deterministic reverse lookup | `src/policy/pages/ArtifactViewerPage.tsx`, `cesFormInstanceId.ts` | source_of_truth_drift |
| MVP-P1-PRINT-001 | Print + signed-PDF route drift; policy print and eCign signed packet share components causing branding/layout leakage | `src/policy/pages/PrintPage.tsx`, `GVGBPrintDocument.tsx`, `artifactRoute.ts` | print_export |
| MVP-P1-CALENDAR-001 | Calendar / Sprint / Kanban / Gantt show divergent task counts; `taskOverridesByEventId` ID collision risk | `src/policy/compliance-execution/taskProjection*`, `obligationSelectors` | workflow_task_logic |
| MVP-P1-ECIGN-003 | No server-side role re-check on `attested → signed_locked` transition (client-only DON Assistant exclusion) | `src/policy/security/stateMachine.ts`, `ces/cesRoles.ts`, `ecign/api.ts` | ecign_legal |
| MVP-P1-ECIGN-004 | No required-fields completeness gate before signature lock | `src/policy/ecign/api.ts`, `useEcignInstance.ts`, `FormViewer.tsx` | ecign_legal |
| MVP-P1-A11Y-004 | Requirement / evidence rows lack list/tree/grid roles + expanded state | `CesEvidenceHierarchyPanel.tsx`, `WorkflowExecutionPanel.tsx` | accessibility |
| MVP-P1-A11Y-005 | Multi-signer static snapshot loses ARIA semantics for signer N+1 | `FormSigningWorkspace.tsx` (`getPrintableFormHtml`) | accessibility |
| MVP-P1-A11Y-006 | Keyboard navigation incomplete in dense lists / conditional sections | `WorkflowExecutionPanel.tsx`, `CesEvidenceHierarchyPanel.tsx` | accessibility |
| MVP-P1-PERMS-001 | Trainer/Onboarding `user.provision` grant + DON Assistant signing not blocked in UI | `permissionCatalog.ts`, `userGroups.ts` | auth_security |
| MVP-P1-OPS-001 | All 9 QA browser tests have zero execution records; need disciplined runtime validation gate | (process) | documentation_only |

---

## 5. P2 / P3 Issues — Defer Unless Fast and Safe

| ID | Title | Severity | Notes |
|----|-------|----------|-------|
| MVP-DEFER-001 | Inconsistent signed-package filenames (`-signed-package.html` vs `-v2.html`) | P2 | Fix only if MVP-P0-ECIGN-002 scope catches it for free |
| MVP-DEFER-002 | regulatoryExecutionStore drafts in-memory only | P2 | Mitigated once MVP-P1-EVIDENCE-001 lands |
| MVP-DEFER-003 | Color contrast remediation across PM/Calendar surfaces | P2 | Requires design-token sweep; defer post-MVP |
| MVP-DEFER-004 | Skip links + filter landmarks on Evidence Center | P2 | Helpful, not blocking |
| MVP-DEFER-005 | Granular eCign review telemetry (scroll depth, section timing) | P3 | Legal accepts current attestation model for MVP |
| MVP-DEFER-006 | Sub-section ack opt-in (`sectionAck` block) | P3 | Already wired; no JD form opts in |
| MVP-DEFER-007 | Builder / Bin git hygiene cleanup (`git rm --cached` 80+ files) | P2 | Documentation-only impact; defer until cleanup window |
| MVP-DEFER-008 | Consolidate "Work To Do" surfaces into single canonical view | P2 | Cross-team ownership decision required; post-MVP |
| MVP-DEFER-009 | Generic `PrintPage.tsx` alignment with GVGBPrintDocument pattern | P3 | After MVP-P1-PRINT-001 stabilizes |
| MVP-DEFER-010 | Propagate GV-GB-001 compact-sticky-header model to other policy specimens | P3 | Awaiting UX approval at `/library/GV-GB-001` |

---

## 6. Canonical Ownership Map

### 6.1 Auth
| Concern | Canonical File |
|---------|----------------|
| Login / session | `src/auth/AuthProvider.tsx` |
| API client | `src/auth/api.ts` |
| Backend service | `server/auth/service.ts` |
| Backend routes | `server/routes/auth.ts` |
| Allowlist | `server/auth/approvedUsers.ts` (CSV-driven) |
| Vercel demo bootstrap | `vercel.json` + build-time env `VITE_LOCAL_DEMO_AUTH_BYPASS` |

### 6.2 Policy view layer
| Concern | Canonical File | Status |
|---------|----------------|--------|
| Generic policy detail | `src/policy/pages/PolicyDetailPage.tsx` | Stable |
| GV-GB-001 specimen | `src/policy/pages/GVGBDetailView.tsx` | Stable |
| Library page | `src/policy/pages/LibraryPage.tsx` | Stable |
| Print document | `src/policy/pages/GVGBPrintDocument.tsx` | Stable |
| Appendices panel | `src/policy/components/PolicyAppendicesPanel.tsx` | Stable |
| Artifact viewer | `src/policy/pages/ArtifactViewerPage.tsx` | Drifting (heuristic resolution) |
| Form viewer | `src/policy/components/FormViewer.tsx` | Stable (a11y debt) |
| Specialized wrapper | `src/policy/components/SharedPolicyDetailView.tsx` | Stable for ACHC/lifecycle/surveyor only |

### 6.3 eCign / signing
| Concern | Canonical File |
|---------|----------------|
| Signing workspace | `src/policy/components/FormSigningWorkspace.tsx` |
| eCign API | `src/policy/ecign/api.ts` |
| State machine | `src/policy/security/stateMachine.ts` |
| Role gates | `src/policy/ces/cesRoles.ts` |
| PDF utilities | `src/policy/ecign/pdfAppendUtil.ts` |
| Evidence hierarchy | `src/policy/evidence/cesEvidenceHierarchy.ts` |

### 6.4 CES / task identity
| Concern | Canonical File |
|---------|----------------|
| Form instance ID | `src/policy/compliance-execution/cesFormInstanceId.ts` |
| Task identity | `src/policy/compliance-execution/taskIdentity.ts` |
| Task projection (core) | `src/policy/pm/taskProjectionCore.ts` |
| Task projection (PM) | `src/policy/pm/taskProjection.ts` |
| Event task adapter | `src/policy/compliance-execution/eventTaskAdapter.ts` |
| Signer task factory | `src/policy/compliance-execution/signerTaskFactory.ts` |
| Execution dataflow | `src/policy/compliance-execution/useEventExecutionDataflow.ts` |
| Workflow drawer | `src/policy/components/WorkflowExecutionPanel.tsx` |
| Runtime store | `src/policy/stores/regulatoryExecutionStore.ts` |

### 6.5 Evidence
| Concern | Canonical File |
|---------|----------------|
| Local demo storage | `src/policy/evidence/storage/localDemoAdapter.ts` |
| Storage mode boundary | `src/policy/evidence/storageMode.ts` |
| Hierarchy | `src/policy/evidence/cesEvidenceHierarchy.ts` |
| Center page | `src/policy/pages/EvidenceCenterPage.tsx` |
| Runtime cache | `demoEvidenceRuntimeCache` (in `localDemoAdapter`) |

### 6.6 Audit
| Concern | Canonical File |
|---------|----------------|
| Audit event emitter (server) | `server/identity/...` audit utilities |
| CES task audit | `taskAuditEvent.ts` |
| Audit mode page | `src/policy/pages/AuditModePage.tsx` |

---

## 7. Protected Systems / Do NOT Freestyle

These directories and files are out of scope for MVP unless a work package explicitly names them. No drive-by edits, no formatting passes, no comment additions.

**Hard-frozen (do not touch):**
- `Builder/` (entire tree)
- `Bin-(thrash)/` and all `Bin-*` variants
- `public/Builder/`, `public/Documentations/` (generated)

**Architecturally-frozen (touch only via owning work package):**
- `src/policy/compliance-execution/taskIdentity.ts`
- `src/policy/compliance-execution/cesFormInstanceId.ts`
- `src/policy/compliance-execution/stateMachine.ts`
- `src/policy/stores/regulatoryExecutionStore.ts`
- `src/policy/components/FormSigningWorkspace.tsx`
- `src/policy/components/FormViewer.tsx`
- `src/policy/components/FormSignatureFlow.tsx`
- `src/policy/evidence/storage/localDemoAdapter.ts`
- `src/policy/evidence/cesEvidenceHierarchy.ts`
- `vercel.json`
- `src/auth/AuthProvider.tsx`
- `src/policy/pages/LibraryPage.tsx`
- `src/policy/pages/GVGBDetailView.tsx`
- `src/policy/pages/PolicyDetailPage.tsx`
- `src/policy/pages/PrintPage.tsx`
- `src/policy/pages/GVGBPrintDocument.tsx`

**Out of scope for MVP entirely:**
- `src/policy/pages/AchcSurveyAlignmentPage.tsx`
- `src/policy/pages/SurveyorPolicyViewerPage.tsx`
- `src/policy/pages/PolicyLifecyclePage.tsx`
- Calendar, Staffing, Journey/onboarding-v2, iAdministrator (Brad), Hubstaff, Demo page

**Newly-built and confirmed stable — do not modify in this round:**
- `server/auth/approvedUsers.ts`
- `server/auth/service.ts` (auth surface only)
- `server/routes/auth.ts`
- `src/auth/api.ts` (auth surface only)
- `src/auth/pages/RegisterPage.tsx`

---

## 8. Recommended Execution Waves

Each wave must complete with a passing browser validation gate before the next begins. No parallelizing across waves; parallelization within a wave is allowed if file boundaries are disjoint.

### Wave 0 — Reality check (no code, ~30 min)
- Stand up local dev server.
- Run all 9 manual QA tests against current `main` to capture a baseline of what is actually broken vs claimed.
- Capture screenshots / console logs into `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/baseline-screenshots/`.

### Wave 1 — Auth unblock (P0 AUTH)
- `MVP-P0-AUTH-001` (Vercel bootstrap) → demo accessible at all.
- `MVP-P0-AUTH-002` (deploy approved-users CSV) → registration usable.

### Wave 2 — eCign defensibility (P0 ECIGN)
- `MVP-P0-ECIGN-001` (artifact identity) → single canonical artifact per form_instance.
- `MVP-P0-ECIGN-002` (signed PDF storage + retrieval) → Download/Print/Open returns the actual signed PDF.
- Then immediately `MVP-P0-CES-001` (form_instance_id propagation), since both P0-ECIGN packages depend on a stable form_instance reference.

### Wave 3 — A11y floor (P0 A11Y)
- `MVP-P0-A11Y-001`, `-002`, `-003` together (form labels, drawer dialog, aria-live).
- Manual screen-reader pass after.

### Wave 4 — Task declutter (P0 TASK)
- `MVP-P0-TASK-001` composite Form+Signers projection (view-only collapse).
- Snapshot before/after task counts on a representative event.

### Wave 5 — Evidence + Audit + Print (P1 cluster)
- `MVP-P1-EVIDENCE-001`, `MVP-P1-AUDIT-001`, `MVP-P1-ARTIFACT-001`, `MVP-P1-PRINT-001`.
- These are interdependent: artifact ID + audit `targetId` + print routing all consume the canonical form_instance ID.

### Wave 6 — Calendar sync + remaining P1 (P1 cluster)
- `MVP-P1-CALENDAR-001`, `MVP-P1-PERMS-001`, `MVP-P1-A11Y-004/005/006`, `MVP-P1-ECIGN-003/004`.

### Wave 7 — Defer triage
- Re-score P2/P3 against remaining time budget. Do nothing else without explicit approval.

---

## 9. Issue → File Map

| Issue ID | Primary file(s) | Adjacent files (read-only context) | Files that must NOT be touched |
|----------|-----------------|-----------------------------------|--------------------------------|
| MVP-P0-AUTH-001 | `vercel.json`, `src/auth/AuthProvider.tsx` | `.env.production`, Vercel project settings | All other auth files |
| MVP-P0-AUTH-002 | `config/approved-users.csv` (new) | `server/auth/approvedUsers.ts` | All allowlist code |
| MVP-P0-ECIGN-001 | `src/policy/ecign/api.ts`, `FormSigningWorkspace.tsx` | `cesEvidenceHierarchy.ts`, `cesFormInstanceId.ts` | `taskIdentity.ts`, `regulatoryExecutionStore.ts` |
| MVP-P0-ECIGN-002 | `FormSigningWorkspace.tsx` (`finalizeSigning`, `isSubsequentSigner`), `pdfAppendUtil.ts` | `localDemoAdapter.ts` | `FormViewer.tsx`, audit emitter |
| MVP-P0-CES-001 | `cesFormInstanceId.ts`, `useEventExecutionDataflow.ts`, `WorkflowExecutionPanel.tsx` | `taskProjectionCore.ts` | `taskIdentity.ts` |
| MVP-P0-A11Y-001 | `FormViewer.tsx` (Field) | `FormSigningWorkspace.tsx` | Signature canvas internals |
| MVP-P0-A11Y-002 | `WorkflowExecutionPanel.tsx` (drawer container) | `CesEvidenceHierarchyPanel.tsx` | drawer state store |
| MVP-P0-A11Y-003 | `FormViewer.tsx`, `FormSigningWorkspace.tsx`, `EvidenceCenterPage.tsx` | toast / notification store | none |
| MVP-P0-TASK-001 | `taskProjectionCore.ts`, `taskProjection.ts`, `WorkflowExecutionPanel.tsx` | `signerTaskFactory.ts` (read), `My Tasks` views | `taskIdentity.ts`, `eventTaskAdapter.ts` business logic |
| MVP-P1-EVIDENCE-001 | `localDemoAdapter.ts`, `regulatoryExecutionStore.ts` | `storageMode.ts`, `EvidenceCenterPage.tsx` | `cesEvidenceHierarchy.ts` |
| MVP-P1-AUDIT-001 | server audit emitter, `taskAuditEvent.ts` | `AuditModePage.tsx` | none |
| MVP-P1-ARTIFACT-001 | `ArtifactViewerPage.tsx`, `cesFormInstanceId.ts` | `artifactRoute.ts` | `taskIdentity.ts` |
| MVP-P1-PRINT-001 | `PrintPage.tsx`, `artifactRoute.ts` | `GVGBPrintDocument.tsx` (read) | `LibraryPage.tsx`, `GVGBDetailView.tsx` |
| MVP-P1-CALENDAR-001 | `taskProjection.ts`, `obligationSelectors.ts` | `MasterCalendarPage.tsx` (read) | `taskIdentity.ts` |
| MVP-P1-PERMS-001 | `permissionCatalog.ts`, `userGroups.ts` | `cesRoles.ts` (read), `useFeatureAccess.ts` | none |
| MVP-P1-A11Y-004/5/6 | `CesEvidenceHierarchyPanel.tsx`, `WorkflowExecutionPanel.tsx`, `FormSigningWorkspace.tsx` | none | none |
| MVP-P1-ECIGN-003/4 | `stateMachine.ts`, `ecign/api.ts` | `cesRoles.ts` (read) | `FormSigningWorkspace.tsx` (presentation) |

---

## 10. Browser Validation Matrix

Every package below requires browser validation at the listed gate. **No package may be marked complete on `tsc` + `npm run build` alone.**

| Package | Browser Test (from QA plan) | Gate |
|---------|----------------------------|------|
| MVP-P0-AUTH-001 | Test 1 — Vercel Static Demo Entry | Login screen renders on Vercel preview, no `/api/*` 405 |
| MVP-P0-AUTH-002 | (n/a — config) | One real approved user can complete `verify` + `setup-account-direct` end-to-end |
| MVP-P0-ECIGN-001 | Test 2 — DON Assistant → DON Two-Signer | Single artifact ID across both signers; Evidence Center shows one row |
| MVP-P0-ECIGN-002 | Test 3 — Download/Print/Open Signed Artifact | Bytes returned match the PDF generated at signing; works after refresh |
| MVP-P0-CES-001 | Test 6 — Form URL Hydration `?form_instance_id` | Deep link restores form to saved state |
| MVP-P0-A11Y-001 | Manual screen-reader (NVDA / VoiceOver) | Every form field is announced with label + required state |
| MVP-P0-A11Y-002 | Manual keyboard | Tab into drawer is trapped; Esc closes; focus returns to opener |
| MVP-P0-A11Y-003 | Manual screen-reader | Signing progress and evidence updates are announced |
| MVP-P0-TASK-001 | Manual review of WorkflowExecutionPanel + My Tasks | Task count per event drops from ~25–40 to ≤10; backend task IDs unchanged in network calls |
| MVP-P1-EVIDENCE-001 | Test 4 — Evidence Center Refresh + Artifact Retrieval | Artifact opens and downloads after hard refresh |
| MVP-P1-AUDIT-001 | Test 5 — Audit Trail Link | "View Artifact" resolves; audit row has top-level `targetKind`/`targetId` |
| MVP-P1-PRINT-001 | Test 7 — GV-GB-001 Print Fidelity | Policy print and signed-packet print do not share branding/layout |
| MVP-P1-CALENDAR-001 | Test 8 — Calendar/Sprint/Kanban/Gantt Sync | Same event/task counts in all four views |
| MVP-P1-PERMS-001 | Test 9 — Trainer/Onboarding Permission Boundary | Trainer cannot reach Admin UI via direct URL |

---

## 11. Regression Risk Matrix

| Package | Could break | Mitigation |
|---------|-------------|------------|
| MVP-P0-AUTH-001 | All API calls on Vercel; existing logged-in sessions | Test on Vercel preview deploy first; do not redeploy production until verified |
| MVP-P0-AUTH-002 | Existing demo users not in CSV cannot register | Audit existing-user list against CSV; do not auto-disable any user |
| MVP-P0-ECIGN-001 | Already-signed packages with old artifact IDs | Add migration / lookup fallback that resolves legacy IDs to canonical form_instance |
| MVP-P0-ECIGN-002 | Storage size growth from real PDF bytes | Limit demo PDF size; document storage mode boundary |
| MVP-P0-CES-001 | Sprint/Kanban/Gantt views (use same projection); audit `targetId` | Run `verify:task-identity`, `verify:pm-unified`, `verify:alignment` after; compare snapshot of projector output before/after |
| MVP-P0-A11Y-001/2/3 | Visual layout if labels reflow | Use `sr-only` class; visual diff library, GV-GB-001 page before/after |
| MVP-P0-TASK-001 | Any consumer counting tasks (audit, dashboard) | Composite is view-only; backend task list unchanged → run `verify:pm-unified` |
| MVP-P1-EVIDENCE-001 | Reset / sandbox flow; existing demo evidence in browsers | Bump cache version key so old browsers re-init |
| MVP-P1-AUDIT-001 | Audit consumers expecting old shape | Write both old `after.targetId` and new top-level for one release; deprecate later |
| MVP-P1-ARTIFACT-001 | Deep links into artifact viewer | Keep heuristic resolver as fallback for one release |
| MVP-P1-PRINT-001 | Both print paths | Snapshot test on each before edit; visual review after |
| MVP-P1-CALENDAR-001 | Master Calendar visual; iAdministrator (Brad) | Lock owner files; run all `verify:*` scripts |
| MVP-P1-PERMS-001 | Trainer workflows that legitimately need provisioning | Re-run `verify-feature-access.mjs`; keep scoped grant for hire workflow |

---

## 12. Rollback Strategy

- Each package is a single feature branch off `main` named after its package ID (e.g. `mvp-p0-ecign-001-artifact-identity`).
- No package merges to `main` without: (a) all listed validation commands passing, (b) browser validation gate confirmed by user, (c) screenshot/log artifact saved under `_Heavy/Fix-2026-05-14/wave-N/<package-id>/`.
- Rollback = `git revert` of the package's merge commit. No package is allowed to rewrite migration data without an explicit reverse-migration script.
- For MVP-P0-AUTH-001 specifically: keep prior `vercel.json` as `vercel.json.bak` in the same commit so a one-line revert is possible without git history hunting.
- For MVP-P0-ECIGN-001: legacy artifacts are read-only fallback for at least one release window.

---

## 13. Grok Agent Findings Summary

**Agents dispatched: 7 × Grok 4.3 (parallel, readonly).**

| Agent | Scope | Headline |
|-------|-------|----------|
| Grok-A | Master findings register, executive summary, recommendations, final report | 12 issues classified; 3 P0, 7 P1, 2 P2; no contradictions across the 5 source reports |
| Grok-B | eCign legal defensibility | 6 gaps; cross-system artifact identity is the only P0; 4 P1s around server gating + snapshot fidelity |
| Grok-C | Two accessibility audits | 10 deduplicated issues; 4 P0 (form labels, drawer dialog, aria-live, focus mgmt); a11y floor of 6 items defined |
| Grok-D | Canonical policy / viewer / layout | Canonical owner table built; flagged a real contradiction between `CANONICAL_POLICY_VIEW_CONSOLIDATION_REPORT` and `POLICY_VIEWER_CONSOLIDATION_DELETE_REPORT` (deletion described as "not deleted" in one, "executed" in the other; current glob proves deletion happened) |
| Grok-E | Test plan, build, execution log | Build is green; **0 of 9 manual browser tests have been executed**; `CLAUDE_FALSE_FIX_REPORTS.md` confirms a recurring "build green ≠ fixed" anti-pattern |
| Grok-F | Task model + JD acknowledgment | Composite Form+Signers card + JD per-line removal both safe for MVP; backend task model and identity logic must NOT be touched |
| Grok-G | Cross-cutting forensics + auth | Top-5 confirmed P0/P1 blockers identified; `vercel.json` wildcard + AuthProvider build-time constant identified as the auth root cause; eCign signed-PDF rendering live HTML confirmed as the artifact root cause |

**Cross-agent convergence:** Six of seven agents independently identified eCign artifact identity drift as the single highest-risk MVP blocker. Five of seven independently identified the form_instance_id propagation failure. All four agents that touched a11y agree the form-label gap is P0.

**Cross-agent divergence to flag:** Grok-D found a contradiction in the policy-viewer report set (one report says "not deleted", another says "executed"). User should confirm which report reflects truth before any further consolidation work.

---

## 14. Claude Implementation Work Packages

Each package below is the spec for a future implementation turn. **Nothing in this section has been implemented.**

---

### MVP-P0-AUTH-001 — Vercel demo bootstrap unblock

- **Goal:** Demo users can reach `/login` on Vercel and complete a Cognito or bypass login round-trip without `/api/*` 405s.
- **Severity addressed:** P0_BLOCKER, auth_security
- **Files expected to change:**
  - `vercel.json` (scope or remove the wildcard `/api/*` rewrite)
  - `src/auth/AuthProvider.tsx` (only if the bypass constant must be made dynamic — ideally not)
  - `.env.production` (add `VITE_LOCAL_DEMO_AUTH_BYPASS=true` for the demo build)
- **Files intentionally untouched:** all other auth surface, all server code, all policy pages.
- **Canonical owner:** `vercel.json` + Vercel project env settings.
- **Risk level:** Med (changes site-wide routing).
- **Rollback plan:** Restore `vercel.json` from `vercel.json.bak`; revert merge commit.
- **Validation commands:** `npx tsc -b --noEmit`; `npm run build`; `npx vercel build`.
- **Browser validation steps:** (a) Vercel preview URL loads `/login` with no console errors. (b) Click into `/register`, `/login`, `/dashboard` (post-login) — no `405` in network panel. (c) Hard refresh on each route.
- **Stop conditions:** STOP if removing the rewrite breaks any non-auth client route; STOP if the preview build does not pick up the env var (rebuild required).

### MVP-P0-AUTH-002 — Deploy approved-users CSV

- **Goal:** Move registration from "fail-closed always" to "fail-closed unless on approved list".
- **Severity addressed:** P0_BLOCKER, auth_security
- **Files expected to change:** `config/approved-users.csv` (new). No code changes.
- **Files intentionally untouched:** all of `server/auth/approvedUsers.ts` and all other allowlist code.
- **Canonical owner:** Operations / Marites.
- **Risk level:** Low (data only).
- **Rollback plan:** Delete the CSV → registration returns to fail-closed.
- **Validation commands:** `POST /api/auth/validate-allowlist-csv` (dry-run); `POST /api/auth/reload-allowlist`; check server log for `auth.approved_users.startup { available: true, activeRows: N }`.
- **Browser validation steps:** Two test users from the CSV complete the verify→setup flow end-to-end and can subsequently log in. Two unknown emails are rejected with the generic message.
- **Stop conditions:** STOP if startup log shows `malformedRows > 0` for any expected user; reject the CSV.

### MVP-P0-ECIGN-001 — Multi-signer artifact identity

- **Goal:** A single canonical signed-package artifact represents a form_instance across all signers; Evidence Center, Audit Trail, and Print resolve through one ID.
- **Severity addressed:** P0_BLOCKER, ecign_legal
- **Files expected to change:**
  - `src/policy/ecign/api.ts` (eliminate `removeEvidence` + `uploadEvidence` pattern; introduce supersede/append-in-place)
  - `src/policy/components/FormSigningWorkspace.tsx` (call sites)
  - `src/policy/evidence/cesEvidenceHierarchy.ts` (resolution path; read-only changes preferred)
- **Files intentionally untouched:** `taskIdentity.ts`, `cesFormInstanceId.ts` (consumer only), `regulatoryExecutionStore.ts`, `FormViewer.tsx`.
- **Canonical owner:** `src/policy/ecign/api.ts`.
- **Risk level:** High (touches signing + evidence integrity).
- **Rollback plan:** Feature branch revert; legacy artifacts continue to resolve via fallback for one release.
- **Validation commands:** `npx tsc -b --noEmit`; `npm run build`; `npm run check:evidence-phase23`; `npm run check:evidence-phase235`; `npx tsx scripts/checkEcignRouteHealth.ts`.
- **Browser validation steps:** QA Test 2 (DON Assistant → DON two-signer) yields exactly one row in Evidence Center; both signer audit events reference the same `targetId`; Download/Print on the row returns the same artifact regardless of which signer is logged in.
- **Stop conditions:** STOP if any legacy artifact in the demo dataset becomes unresolvable; add fallback resolver before re-attempting.

### MVP-P0-ECIGN-002 — Signed PDF storage and retrieval

- **Goal:** Download / Print / Open Signed Artifact returns the actual PDF that was signed, not a freshly-rendered HTML template.
- **Severity addressed:** P0_BLOCKER, ecign_legal
- **Files expected to change:**
  - `src/policy/components/FormSigningWorkspace.tsx` (`finalizeSigning`, `isSubsequentSigner` branch)
  - `src/policy/ecign/pdfAppendUtil.ts`
  - `src/policy/evidence/storage/localDemoAdapter.ts` (only if blob persistence is required for retrieval)
- **Files intentionally untouched:** `FormViewer.tsx`, audit emitter, `regulatoryExecutionStore.ts` (state only).
- **Canonical owner:** `FormSigningWorkspace.tsx`.
- **Risk level:** High.
- **Rollback plan:** Feature branch revert.
- **Validation commands:** `npx tsc -b --noEmit`; `npm run build`; `npx tsx scripts/checkEcignRouteHealth.ts`.
- **Browser validation steps:** QA Test 3. After signing, Download returns a PDF with the signed signature glyph and timestamp; Print preview shows the same; Open Artifact shows the same PDF (not the live form).
- **Stop conditions:** STOP if the same flow breaks single-signer happy path.

### MVP-P0-CES-001 — Propagate form_instance_id from drawer

- **Goal:** Clicking "Complete Form" from WorkflowExecutionPanel always navigates with the canonical `form_instance_id` in the URL; deep links restore state.
- **Severity addressed:** P0_BLOCKER, workflow_task_logic
- **Files expected to change:**
  - `src/policy/compliance-execution/cesFormInstanceId.ts` (centralize ID build)
  - `src/policy/compliance-execution/useEventExecutionDataflow.ts` (thread ID into navigation handler)
  - `src/policy/components/WorkflowExecutionPanel.tsx` (call site)
- **Files intentionally untouched:** `taskIdentity.ts` business logic.
- **Canonical owner:** `cesFormInstanceId.ts`.
- **Risk level:** Med.
- **Rollback plan:** Feature branch revert.
- **Validation commands:** `npm run verify:task-identity`; `npm run verify:pm-unified`; `npm run verify:alignment`.
- **Browser validation steps:** QA Test 6. Click Complete Form on a task → URL contains `?form_instance_id=`. Reload → form rehydrates to same state. Deep-link from a fresh tab → same.
- **Stop conditions:** STOP if `verify:pm-unified` regresses any existing pass.

### Other packages (specs follow the same template)

- `MVP-P0-A11Y-001` (form labels), `MVP-P0-A11Y-002` (drawer dialog), `MVP-P0-A11Y-003` (aria-live), `MVP-P0-TASK-001` (composite cards) — to be expanded in Wave 3 / Wave 4 prep.
- All P1 packages — to be expanded once the P0 wave completes.

Detailed specs for each remaining package will be drafted at the start of its wave so the spec reflects code state at that time.

---

## 15. User Validation Checklist

Before approving the plan, confirm:

- [ ] The 7 Grok agents' classifications match your understanding of where the project is.
- [ ] The P0 list is complete — nothing missing that you consider a blocker.
- [ ] The "Do NOT touch" list is complete — nothing wrongly listed as touchable.
- [ ] The reconciliation question from Grok-D (canonical-policy report contradiction) has a real answer (which report is current).
- [ ] You can produce the approved-users CSV before MVP-P0-AUTH-002 starts (or accept that registration stays fail-closed for the demo).
- [ ] You accept that no package can be marked done without a browser validation gate.
- [ ] You accept the wave order, or want it reshuffled.

After approval, the first execution turn will begin with **MVP-P0-AUTH-001** — Vercel bootstrap. Until you say "go", no source code is touched.

---

## End of Plan
