# QA/UAT File Map — Verified Source-of-Truth Locations

**Purpose:** Definitive map of where each critical subsystem lives. Use this to locate code during fixes. All paths are relative to repo root and were verified via direct file reads on 2026-05-14.

---

## 1. Auth / Login / Session

| Component | File(s) | Notes |
|-----------|---------|-------|
| Auth Provider & Demo Bypass | `src/auth/AuthProvider.tsx` | `LOCAL_DEMO_AUTH_BYPASS`, `LOCAL_DEMO_USER`, localStorage key `ci_demo_auth_v1` |
| Login UI | `src/auth/pages/LoginPage.tsx`, `CheckEmailPage.tsx`, `RegisterPage.tsx` | Demo-only flow |
| Protected Route | `src/auth/ProtectedRoute.tsx` | Wraps routes requiring auth |
| Backend Identity Middleware | `server/identity/middleware.ts`, `server/identity/session.ts` | Real session + PDP/PEP (not used in pure static Vercel demo) |
| Auth API client | `src/auth/api.ts` | Calls `/api/auth/*` |

**Vercel Static Demo Implication:** Auth is entirely client-side demo unless `VITE_LOCAL_DEMO_AUTH_BYPASS=true` or the Express backend is available.

---

## 2. CES Execution Core

| Component | File(s) | Notes |
|-----------|---------|-------|
| Task Identity Normalization | `src/policy/compliance-execution/taskIdentity.ts` | `normalizeEventTaskIdentity`, `dedupeEventTasksByCanonicalId`, special case for `SIGN-` tasks |
| Form Instance ID Format | `src/policy/compliance-execution/cesFormInstanceId.ts` | `formatCesFormInstanceId(eventId, formId, sequence)`, legacy `--` parser, `resolveFormInstanceFromArtifactCandidates` |
| Regulatory Execution Store | `src/policy/stores/regulatoryExecutionStore.ts` | Central store for events, tasks, form instances, signer tasks, evidence, audit events |
| Event Execution Dataflow Hook | `src/policy/compliance-execution/useEventExecutionDataflow.ts` | Projects requirements, attaches `form_instance_id` to rows |
| Signer Task Factory | `src/policy/ces/signerTaskFactory.ts` | Deterministic `CesSignerTask` ID: `[EVENT_ID]::[FORM_ID]::SIGNER::[ROLE]`, `parentFormTaskId` |
| CES Roles & Boundaries | `src/policy/ces/cesRoles.ts` | `CES_SIGNER_ROLES` excludes `DON Assistant`, `canRoleSign`, `buildCesRoleAssignment` |
| CES State Machines | `src/policy/compliance-execution/stateMachine.ts`, `src/policy/lifecycle/stateMachine.ts` | Task and event state transitions |

---

## 3. eCign Signing & Artifact Creation

| Component | File(s) | Notes |
|-----------|---------|-------|
| Main Signing Workspace | `src/policy/components/FormSigningWorkspace.tsx` | **Critical file** — `finalizeSigning`, `isSubsequentSigner` logic, `uploadEvidence` calls, `appendTaskAuditEvent` for `SIGNED_PACKAGE_CREATED` / `ARTIFACT_LOCKED` |
| Form Viewer (rendering inside signer) | `src/policy/components/FormViewer.tsx` | Renders the actual form for signing, captures snapshot HTML |
| eCign Session / Instance | `src/policy/ecign/useEcignSession.ts`, `src/policy/ecign/useEcignInstance.ts` | Manages the eCign session state and hash chain |
| Backend eCign Routes | `server/ecign/` (multiple files) | PDF generation, hash chain, integrity (not reached in static demo) |
| Signer Task Status Update | Called from `FormSigningWorkspace.tsx:1550` → `regulatoryExecutionStore.updateSignerTaskStatus` | |

**Source-of-Truth Risk Location:** Lines 1514–1564 in `FormSigningWorkspace.tsx` (the `isSubsequentSigner` branch).

---

## 4. Evidence Center & Storage

| Component | File(s) | Notes |
|-----------|---------|-------|
| Evidence Model | `src/policy/evidence/evidenceModel.ts` | Types, `isEvidenceImmutable` |
| CES Evidence Hierarchy | `src/policy/evidence/cesEvidenceHierarchy.ts` | `buildCesEvidenceHierarchy`, special matching for signer tasks via `parentFormTaskId` |
| Evidence Storage Adapters | `src/policy/evidence/storage/localDemoAdapter.ts`, `awsStagingAdapter.ts` | In-memory vs S3 |
| Evidence Center Page | `src/policy/pages/EvidenceCenterPage.tsx` | UI listing + links to `buildArtifactRoute` |
| Hierarchy Panel | `src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx` | Visual tree of evidence |
| Upload Evidence | `regulatoryExecutionStore.uploadEvidence` (called from FormSigningWorkspace) | Returns the `artifactId` |

---

## 5. Artifact Viewer (Universal Resolver)

| Component | File(s) | Notes |
|-----------|---------|-------|
| Artifact Route Builder | `src/policy/artifacts/artifactRoute.ts` | `buildArtifactRoute(id, { formInstanceId, eventId, ... })` — appends `?form_instance_id=...` |
| Artifact Viewer Page | `src/policy/pages/ArtifactViewerPage.tsx` | **Central resolver** — `resolveFormInstanceFromArtifactCandidates`, handles form_instance, evidence, approval, certification, audit_packet kinds |
| Artifact Link Aliases | `cesFormInstanceId.formInstanceLinkAliases` | Supports legacy `--` double-dash IDs |

---

## 6. Audit Trail

| Component | File(s) | Notes |
|-----------|---------|-------|
| Audit Mode Page | `src/policy/pages/AuditModePage.tsx` | Renders audit rows, "View Artifact" links using `artifactRouteForAuditEntry` |
| Append Audit Event | `regulatoryExecutionStore.appendTaskAuditEvent` | Multiple call sites; critical that `targetKind`/`targetId` are top-level |
| Backend Audit Writer | `server/audit/writer.ts`, `server/audit/routes.ts` | Persistent audit log |
| Anomaly Detection | `server/audit/anomaly.ts` | Scheduled anomaly jobs |

**Known Weakness:** Many `appendTaskAuditEvent` calls still put the important ID inside the `after` blob.

---

## 7. Form Routing & URL Hydration

| Component | File(s) | Notes |
|-----------|---------|-------|
| Forms Library Page | `src/policy/pages/FormsPage.tsx` | Reads `?form_instance_id`, `?event_id`, `?task_id` from URL |
| Form Instance Core | `src/policy/pm/formInstancesCore.ts` | `getOrCreateFormInstance` logic |
| Workflow Execution Panel (requirement rows) | `src/policy/components/regulatory/WorkflowExecutionPanel.tsx:1306-1378` | Builds "Complete Form" / "View completed form" links using `buildRowArtifactRoute` |
| Event Workspace | `src/policy/components/regulatory/EventWorkspace.tsx`, `WorkflowDrawer.tsx` | Where requirements are rendered for an event |

---

## 8. Print / Download (Policy vs eCign)

| Component | File(s) | Notes |
|-----------|---------|-------|
| Policy Print Page | `src/policy/pages/PrintPage.tsx` | General policy print route |
| GV-GB Specific Print | `src/policy/pages/GVGBPrintDocument.tsx`, `GVGBAppendixPrint.tsx` | Target for GV-GB-001 visual match test |
| Form Print View (eCign) | `src/policy/pages/FormPrintView.tsx` | Used when printing a signed form instance |
| Print Utilities | `src/policy/utils/printForm.ts`, `openPolicyPrintRoute.ts` | Shared print trigger logic |
| GV Policy Detail | `src/policy/pages/GVPolicyDetailView.tsx`, `GVGBDetailView.tsx` | Detail view that launches print |

**Separation Rule:** Policy print (card view untouched) must remain visually independent from eCign signed artifact print.

---

## 9. Calendar / Sprint / Kanban / Gantt Sync

| Component | File(s) | Notes |
|-----------|---------|-------|
| Calendar Store | `src/policy/stores/calendarStore.ts` | Core calendar events |
| Calendar Sync Store | `src/policy/stores/calendarSyncStore.ts` | Sync with Google Calendar + PM tasks |
| Task Projection | `src/policy/pm/taskProjection.ts`, `taskProjectionCore.ts` | Unified task view for PM + CES |
| Sprint / Kanban Pages | `src/policy/components/pm/SprintPlanPage.tsx`, `SprintReviewPage.tsx`, `PmViews.tsx` | UI for sprint planning |
| My Tasks | `src/policy/components/pm/MyTasksPmPage.tsx`, `src/policy/ces/pages/MyTasksPage.tsx` | Dual My Tasks (PM vs CES) |
| Master Calendar Page | `src/policy/pages/MasterCalendarPage.tsx` | Gantt + month view |

**Risk Area:** `taskOverridesByEventId` and canonical ID collisions (documented in forensics).

---

## 10. Permissions / Trainer Boundaries

| Component | File(s) | Notes |
|-----------|---------|-------|
| Feature Access Matrix | `src/policy/security/features/featureAccess.ts`, `catalog.ts` | `canViewFeature`, `canPerformAction` |
| Verify Script | `scripts/verify-feature-access.mjs` | Deterministic matrix test (PASSED in this audit) |
| Security Middleware | `server/access/pdp.ts`, `pep.ts`, `sod.ts` | Policy Decision / Execution Points |
| CES Role Enforcement | `src/policy/ces/cesRoles.ts:20-38` | `CES_SIGNER_ROLES` excludes DON Assistant |
| Onboarding / Trainer Role | Treated as `role: 'onboarding'` in the matrix | Correctly denied most admin features |

---

## 11. Git Hygiene & Exclusions

| Item | Location | Status |
|------|----------|--------|
| Root .gitignore | `.gitignore:30-54` | **Correctly excludes** `Builder/`, `Bin-(thrash)/**`, `screenshots/`, `uat-results/`, `uat-html-report/`, `downloads/`, `current_state_*.md`, `Project_Intelligence/`, `tmp-*` |
| Builder/ directory | `Builder/` (large) | Documentation / proposed architecture only. Never imported at runtime. |
| Bin-(thrash)/ | Mentioned only in .gitignore | Should never exist in a clean clone. |
| _Heavy/ | `_Heavy/Fix-2026-05-14/` | Approved location for this audit output and prior fix checkpoints. |
| Screenshots / Reports | Any `**/screenshots/`, `**/uat-results/` | Excluded — correct. |

---

## 12. Build & Verification Entry Points

| Command | File | Purpose |
|---------|------|---------|
| `npm run build` | `package.json` + `vercel.json` | Runs `prebuild: syncMasterControlInventory.mjs` then Vite build |
| `npx tsc -b --noEmit` | tsconfig files | Typecheck (PASSED) |
| `npx tsx scripts/verify-feature-access.mjs` | `scripts/verify-feature-access.mjs` | Permission matrix (PASSED) |
| `npm run verify:task-identity` | `scripts/verifyTaskIdentity.ts` | CES task ID canonicalization |
| `npm run verify:pm-unified` | `scripts/verifyUnifiedTaskProjection.ts` | PM + CES task projection |
| `npm run verify:alignment` | `scripts/verifyAlignment.ts` | Event/task alignment |

---

**Usage Note:** When performing future fixes, always cross-reference this map. Never assume a path — verify with `grep` or direct read first.
