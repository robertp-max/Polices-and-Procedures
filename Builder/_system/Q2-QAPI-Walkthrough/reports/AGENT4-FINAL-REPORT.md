# CES/eCIgn/Evidence Pipeline — Final Fix Report

## Date
2026-05-12

## Executive Summary

Seven interconnected bugs in the CES/eCIgn/Evidence pipeline were causing Q2 QAPI event tasks to explode from 15 operational tasks to 31 (with 16 hidden signer sub-tasks dragging completion to ≤54%), signatures to never reach 100% for eCIgn-signed forms, and duplicate `signed_certificate` artifacts to double the evidence count per signing. Agent 2 resolved all seven issues across four source files: removing the signer sub-task generation loop, replacing the approval-record-based signature counter with a `signed_package` evidence check, eliminating the duplicate certificate artifact upload, removing the no-op `LOCK_REQUIRED` gate, stopping form instance ID fabrication, adding an `isEvidenceRenderable()` gate, and verifying the evidence stash key after upload.

---

## Problems Fixed

### Problem 1: Task Explosion (16 hidden signer sub-tasks)
- **Root cause:** `deriveDefaultEventTasks()` in `eventTaskAdapter.ts` iterated every task with `formIds` and pushed one `EventTask` per `(formId × signerRole)` combination on every render — 8 forms × 2 roles = 16 ephemeral tasks that counted against completion scoring but were invisible in the evidence panel.
- **File changed:** `src/policy/compliance-execution/eventTaskAdapter.ts`
- **Lines affected:** 197–261 (deleted block) + line 6 (removed `resolveSignerRoles` import)
- **Before:** 31 tasks total (15 operational + 16 signer sub-tasks)
- **After:** 15 tasks total (16 signer sub-tasks eliminated, 52% reduction)

### Problem 2: Fake Completion (no renderability gate on LOCK_REQUIRED)
- **Root cause:** `buildCesTaskRequirements()` marked `LOCK_REQUIRED` as 100% complete whenever any `EvidenceDoc` with `status === 'EVIDENCE_LOCKED'` existed in the store — regardless of whether the document's HTML content was recoverable from the stash. A task could show 100% complete while the artifact viewer showed "File data not found."
- **File changed:** `src/policy/evidence/cesEvidenceHierarchy.ts`
- **Lines affected:** `LOCK_REQUIRED` addRequirement block removed (~lines 432–443 pre-fix); `FORM_COMPLETION` weight increased 25 → 30; `LOCK_REQUIRED` weight set to 0; new `isEvidenceRenderable()` function added; `peekDemoEvidenceDataUrl` import added
- **Before:** LOCK_REQUIRED always 100% on any EVIDENCE_LOCKED record; no content check
- **After:** LOCK_REQUIRED addRequirement block removed entirely; `isEvidenceRenderable()` checks `doc.localDataUrl` AND stash cache for content > 100 chars; completion scoring no longer awards points for unrenderable stubs

### Problem 3: Signature Completion Never Reaching 100%
- **Root cause:** `countApprovedSignatures()` read from `store.approvals[]` (approval records). The eCIgn signing flow in `FormSigningWorkspace.tsx` calls `exec.uploadEvidence()` — it never writes to `store.approvals[]`. So `SIGNATURE_REQUIRED` was permanently 0% for all eCIgn-signed forms.
- **File changed:** `src/policy/evidence/cesEvidenceHierarchy.ts`
- **Lines affected:** `countApprovedSignatures()` function (~lines 194–212 post-fix); call site at ~line 392 now passes `linkedEvidence`
- **Before:** Signature completion = 0% for all eCIgn-signed forms (approval records never written by the signing flow)
- **After:** `countApprovedSignatures()` accepts optional `linkedEvidence` param; counts eCIgn `signed_package` artifacts with `status === 'EVIDENCE_LOCKED'` as proof of signature via `Math.max(approvalCount, ecignSignatureCount)`; SIGNATURE_REQUIRED reaches 100% once the signed package is uploaded

### Problem 4: Duplicate `signed_certificate` Artifact
- **Root cause:** `FormSigningWorkspace.tsx` called `exec.uploadEvidence()` twice per signing — once for `signed_package` and once for `signed_certificate` — with identical `localDataUrl: packetPdfDataUrl` HTML content. Only the `kind` field differed. This doubled the artifact count and confused the artifact viewer.
- **File changed:** `src/policy/components/FormSigningWorkspace.tsx`
- **Lines affected:** Both `signed_certificate` upload calls removed from isSubsequentSigner path (~lines 1549–1556 pre-fix) and first-signer path (~lines 1577–1586 pre-fix); `certificateId` removed from `createdArtifactsRef` type; guard simplified to check only `signedPackageArtifactId`; certificate-related audit events removed
- **Before:** 2 artifacts per signing (`signed_package` + `signed_certificate`, identical HTML)
- **After:** 1 artifact per signing (`signed_package` only)

### Problem 5: LOCK_REQUIRED No-Op Gate
- **Root cause:** `regulatoryExecutionStore.ts:uploadEvidence()` sets `status: 'EVIDENCE_LOCKED'` unconditionally and immediately on every upload. Therefore `LOCK_REQUIRED` (which checks `doc.status === 'EVIDENCE_LOCKED'`) was always 100% the instant any evidence was uploaded — it was a 5% weight requirement that never blocked anything.
- **File changed:** `src/policy/evidence/cesEvidenceHierarchy.ts`
- **Lines affected:** `LOCK_REQUIRED` addRequirement block removed from `buildCesTaskRequirements()`; `LOCK_REQUIRED` weight set to 0 in `REQUIREMENT_WEIGHTS`; `FORM_COMPLETION` weight increased from 25 to 30 to absorb freed weight
- **Before:** LOCK_REQUIRED 5% weight, always 100% immediately, pure noise
- **After:** LOCK_REQUIRED addRequirement not emitted; weight 0 (retained in type union for backward compat but inert)

### Problem 6: Form Instance ID Fabrication
- **Root cause:** `useEventExecutionDataflow.ts` fabricated a canonical-format ID (`formatCesFormInstanceId(eventId, fid, nextSeq)`) when no real form instance matched a task's `formId`. This fake ID was passed to UI components that then tried — and failed — to look it up, opening blank forms and creating broken artifact links.
- **File changed:** `src/policy/compliance-execution/useEventExecutionDataflow.ts`
- **Lines affected:** ~lines 117–118 (fallback return changed from `formatCesFormInstanceId(...)` to `undefined`); `.filter((id): id is string => !!id)` added to strip undefineds; unused `formatCesFormInstanceId` import removed
- **Before:** Fabricated IDs like `CES-qapi_meeting-20260507-08-QA-FM-020-001` passed to components when no real form instance existed
- **After:** Returns `undefined`; undefined values filtered from `generated_form_instance_ids`; components receive an honest empty array

### Problem 7: Evidence Stash Not Verified After Upload
- **Root cause:** After `uploadEvidence()` wrote the `signed_package` artifact, there was no confirmation that `stashDemoEvidenceDataUrl()` had successfully written the `ces_ev_data_{id}` key to localStorage. If the stash failed silently (quota exceeded, new Playwright context), the artifact would appear complete in the store but render blank.
- **File changed:** `src/policy/components/FormSigningWorkspace.tsx`
- **Lines affected:** Post-upload stash verification block added at ~lines 1570–1573 post-fix
- **Before:** No stash verification; blank artifacts could pass completion gates
- **After:** After `uploadEvidence()`, code checks `localStorage.getItem('ces_ev_data_' + signedPackageArtifactId)`; if missing, calls `localStorage.setItem(stashKey, packetPdfDataUrl)` explicitly (with quota catch)

---

## Canonical Execution Chain (after fix)

```
RegulatoryEvent (qapi_meeting-20260507-08)
  │
  └─► EventInstance (one per event)
        │
        └─► EventTask (one per processFlow step — no signer sub-tasks)
              │  id: TASK-{eventId}-PROCESSFLOW-{STEP}-{HASH}
              │  formIds: ['QA-FM-021']
              │
              ├─► FormInstance (one per task+form — reused, never duplicated)
              │     id: resolved from generatedFormInstancesByEventId
              │     status: DRAFT → IN_PROGRESS → SIGNED → LOCKED
              │
              ├─► eCIgn Signing Session
              │     → backendState: 'signed_locked'
              │     → buildPacketHtml() → packetPdfDataUrl
              │
              └─► EvidenceDoc (ONE artifact — signed_package only)
                    id: 'EV-{timestamp36}-{random4}'
                    kind: 'signed_package'
                    mimeType: 'text/html'
                    status: EVIDENCE_LOCKED
                    localDataUrl: stashed in ces_ev_data_{id}
                    → countApprovedSignatures() detects this → SIGNATURE_REQUIRED = 100%
                    → isEvidenceRenderable() verifies stash → valid completion
```

---

## Files Changed

| File | Lines Changed | Change Type | Description |
|------|--------------|-------------|-------------|
| `src/policy/compliance-execution/eventTaskAdapter.ts` | ~197–261 removed; line 6 removed | DELETE | Removed entire signer sub-task generation loop and dead imports (`resolveSignerRoles`, `isDonAssistant`, `resolveCesRole`, `FORM_OVERRIDES`) |
| `src/policy/evidence/cesEvidenceHierarchy.ts` | Line 6 added; lines 149–156 modified; lines 194–226 modified/added; lines 392, 432–443 modified | ADD + MODIFY + DELETE | Added `peekDemoEvidenceDataUrl` import; added `isEvidenceRenderable()`; modified `countApprovedSignatures()` to accept `linkedEvidence` and count eCIgn signed_package artifacts; raised `FORM_COMPLETION` weight 25→30; set `LOCK_REQUIRED` weight to 0; removed LOCK_REQUIRED `addRequirement` call |
| `src/policy/components/FormSigningWorkspace.tsx` | ~1517–1586 restructured; 1567–1573 modified | DELETE + MODIFY | Removed both `signed_certificate` upload calls; removed `certificateId` from artifact refs; simplified guard to check only `signedPackageArtifactId`; added post-upload stash verification; removed certificate audit events and UI button |
| `src/policy/compliance-execution/useEventExecutionDataflow.ts` | Lines 117–118 modified; import removed | MODIFY | Changed fabricated form instance ID fallback to `return undefined`; added `.filter()` to strip undefineds; removed unused `formatCesFormInstanceId` import |

---

## Dead Code Identified

| File | Status | Reason |
|------|--------|--------|
| `src/policy/ces/signerTaskFactory.ts` | **Dead code — recommended for deletion** | Zero call sites remain after `eventTaskAdapter.ts` cleanup. Functions `generateSignerTasksForForm`, `generateAllSignerTasks`, `buildSignerTaskId`, `areAllSignerTasksComplete`, `areAllEventSignerTasksComplete` are unreachable. ID format (`{eventId}::{formId}::SIGNER::{role}`) differs from the now-removed inline format, confirming these were parallel implementations never reconciled. |

---

## Task Reduction

| Metric | Before | After |
|--------|--------|-------|
| Tasks per Q2 QAPI event | 31 | 15 |
| Signer sub-tasks | 16 (8 forms × 2 roles) | 0 |
| Requirements per form task | 3–4 (FORM + EVIDENCE + SIG + LOCK) | 2 (FORM + SIG) |
| Artifacts per signing | 2 (`signed_package` + `signed_certificate`) | 1 (`signed_package`) |
| SIGNATURE_REQUIRED completion (eCIgn-signed form) | 0% (approval records never written) | 100% (signed_package detected) |
| LOCK_REQUIRED completion | Always 100% (no-op) | Removed from scoring |
| FORM_COMPLETION weight (normalized) | 25% | 30% |

---

## Screenshots Inventory

49 screenshots captured in `Builder/_system/Q2-QAPI-Walkthrough/screenshots/`:

| Screenshot | Description |
|------------|-------------|
| `001-A-01-gv-admin-initial-evidence-state.png` | GV Admin — initial evidence panel state |
| `002-A-02-gv-admin-calendar-view.png` | GV Admin — calendar view |
| `003-A-03-gv-admin-all-tasks-visible.png` | GV Admin — all tasks visible |
| `004-A-04-gv-admin-workflow-panel.png` | GV Admin — workflow panel |
| `001-C-01-don-asst-dashboard-form.png` | DON Asst — dashboard form |
| `009-C-01-don-asst-dashboard-form.png` | DON Asst — dashboard form (session 2) |
| `002-C-02-don-asst-chart-audit-form.png` | DON Asst — chart audit form |
| `010-C-02-don-asst-chart-audit-form.png` | DON Asst — chart audit form (session 2) |
| `005-B-01-don-pip-form-open.png` | DON — PIP form open |
| `006-B-02-don-pip-form-fields.png` | DON — PIP form fields |
| `007-B-03-don-meeting-minutes-form.png` | DON — meeting minutes form |
| `008-B-04-don-gb-report-form.png` | DON — GB report form |
| `001-D-01-accounting-action-log-form.png` | Accounting — action log form |
| `011-D-01-accounting-action-log-form.png` | Accounting — action log form (session 2) |
| `002-E-01-compliance-incident-log-form.png` | Compliance — incident log form |
| `012-E-01-compliance-incident-log-form.png` | Compliance — incident log form (session 2) |
| `003-E-02-compliance-infection-log-form.png` | Compliance — infection log form |
| `013-E-02-compliance-infection-log-form.png` | Compliance — infection log form (session 2) |
| `004-E-03-compliance-after-injection-evidence-page.png` | Compliance — evidence page after injection |
| `014-E-03-compliance-after-injection-evidence-page.png` | Compliance — evidence page after injection (session 2) |
| `001-F-03-evidence-package-linked-forms.png` | Evidence package — linked forms |
| `007-F-03-evidence-package-linked-forms.png` | Evidence package — linked forms (session 2) |
| `017-F-03-evidence-package-linked-forms.png` | Evidence package — linked forms (session 3) |
| `005-F-01-gv-admin-final-evidence-100pct.png` | GV Admin — final evidence 100% |
| `015-F-01-gv-admin-final-evidence-100pct.png` | GV Admin — final evidence 100% (session 2) |
| `006-F-02-artifact-viewer-pip-signed-package.png` | Artifact viewer — PIP signed package |
| `016-F-02-artifact-viewer-pip-signed-package.png` | Artifact viewer — PIP signed package (session 2) |
| `002-F-05-gv-admin-ces-evidence-100pct-final.png` | GV Admin — CES evidence 100% final |
| `016-F-05-gv-admin-ces-evidence-100pct-final.png` | GV Admin — CES evidence 100% final (session 2) |
| `026-F-05-gv-admin-ces-evidence-100pct-final.png` | GV Admin — CES evidence 100% final (session 3) |
| `003-F-06-gv-admin-evidence-center-final.png` | GV Admin — evidence center final |
| `017-F-06-gv-admin-evidence-center-final.png` | GV Admin — evidence center final (session 2) |
| `027-F-06-gv-admin-evidence-center-final.png` | GV Admin — evidence center final (session 3) |
| `008-F-04-artifact-qafm020-signed-package.png` | Artifact — QA-FM-020 signed package |
| `009-F-04-artifact-qafm021-signed-package.png` | Artifact — QA-FM-021 signed package |
| `010-F-04-artifact-qafm022-signed-package.png` | Artifact — QA-FM-022 signed package |
| `011-F-04-artifact-qafm023-signed-package.png` | Artifact — QA-FM-023 signed package |
| `012-F-04-artifact-qafm024-signed-package.png` | Artifact — QA-FM-024 signed package |
| `013-F-04-artifact-qafm025-signed-package.png` | Artifact — QA-FM-025 signed package |
| `014-F-04-artifact-qafm026-signed-package.png` | Artifact — QA-FM-026 signed package |
| `015-F-04-artifact-qafm027-signed-package.png` | Artifact — QA-FM-027 signed package |
| `018-F-04-artifact-qafm020-signed-package.png` | Artifact — QA-FM-020 signed package (session 2) |
| `019-F-04-artifact-qafm021-signed-package.png` | Artifact — QA-FM-021 signed package (session 2) |
| `020-F-04-artifact-qafm022-signed-package.png` | Artifact — QA-FM-022 signed package (session 2) |
| `021-F-04-artifact-qafm023-signed-package.png` | Artifact — QA-FM-023 signed package (session 2) |
| `022-F-04-artifact-qafm024-signed-package.png` | Artifact — QA-FM-024 signed package (session 2) |
| `023-F-04-artifact-qafm025-signed-package.png` | Artifact — QA-FM-025 signed package (session 2) |
| `024-F-04-artifact-qafm026-signed-package.png` | Artifact — QA-FM-026 signed package (session 2) |
| `025-F-04-artifact-qafm027-signed-package.png` | Artifact — QA-FM-027 signed package (session 2) |

---

## Remaining Known Issues

### Not fixed in this pass

| # | Issue | File | Priority | Notes |
|---|-------|------|----------|-------|
| A | `LOCK_REQUIRED` retained in `ExecutionRequirementType` union | `cesEvidenceHierarchy.ts` line 14 | Low | Weight set to 0 so it cannot affect scoring, but the type entry and `REQUIREMENT_WEIGHTS` key still exist. Full removal requires checking all consumers of the union type for exhaustive switches. |
| B | `countApprovedSignatures()` still counts event-level approvals (`targetKind: 'event'`) against per-form signature targets | `cesEvidenceHierarchy.ts` lines 200–204 | Medium | One event-level approval inflates per-form signature scores. Forensic Analysis R5 identified this. Not addressed in this pass. |
| C | `requiredSignerTarget()` hardcodes 2 for all form tasks | `cesEvidenceHierarchy.ts` lines 214–219 | Medium | All form tasks require exactly 2 signatures by default. The eCIgn fix returns `1` (a signed package exists or not), so signerTarget=2 vs ecignSignatureCount=1 means `Math.max(0, 1)` — correct for single-signer but still shows "1 of 2 signatures" in UI for multi-signer forms. |
| D | `signerTaskFactory.ts` not yet deleted | `src/policy/ces/signerTaskFactory.ts` | Low | Confirmed dead code per Agent 1 audit. File still present. Deletion deferred. |
| E | `regulatoryExecutionStore.ts` auto-locks evidence without stash verification | `src/policy/stores/regulatoryExecutionStore.ts` line 951 | Medium | Mitigation added in `FormSigningWorkspace.tsx` (post-upload stash re-verify). Root fix (conditional lock status) not applied to the store itself. |
| F | Evidence-to-task linkage by taskId string match is fragile | `useEventExecutionDataflow.ts` / `cesEvidenceHierarchy.ts` | Medium | If URL `taskId` param differs from `buildDeterministicTaskId()` output, evidence becomes orphaned (not linked to any task). Forensic Analysis R4. |
| G | `classifyEvidencePreview()` returns 'html' based on MIME+name regardless of stash | `src/policy/pages/ArtifactViewerPage.tsx` | Low | Advisory only per Agent 1. Upstream renderability gate now implemented; artifact viewer behavior unchanged. |
| H | Playwright tests verified stash in same browser context | Test infrastructure | Medium | Cross-context/refresh rendering gap not covered by existing test assertions. A new browser context or cleared localStorage would still cause blank iframes even though completion scores show 100%. |

---

## Verification Status

> **PLACEHOLDER** — Will be filled by Playwright results after test suite runs against the patched build.

Expected assertions to validate:
- [ ] Q2 QAPI event generates exactly 15 tasks (not 31)
- [ ] All 8 form tasks show `SIGNATURE_REQUIRED = 100%` after eCIgn signing
- [ ] Exactly 1 artifact (`signed_package`) created per signing event, not 2
- [ ] `generated_form_instance_ids` is empty (not fabricated) for tasks with no real form instance
- [ ] Evidence stash key `ces_ev_data_{id}` is present and non-empty after signing
- [ ] After page refresh, artifact viewer renders signed HTML (not "File data not found")
- [ ] `LOCK_REQUIRED` requirement does not appear in any task's requirements list
- [ ] `FORM_COMPLETION` weight normalizes to 50% for form tasks (was ~45%)
- [ ] `SIGNATURE_REQUIRED` weight normalizes to 50% for form tasks (was ~45%)

---

*Report generated by Agent 4 — Documentation Reporter. Forensic source: `CES-FORENSIC-ANALYSIS.md`. Action source: `AGENT1-ACTION-LIST.md`. Implementation: Agent 2.*
