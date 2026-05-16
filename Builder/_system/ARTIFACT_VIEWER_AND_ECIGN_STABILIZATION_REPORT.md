# Artifact Viewer and eCIgn Stabilization Report

## Scope
- Added and stabilized a general read-only artifact viewer at `/artifacts/:artifactId`.
- Traced the eCIgn HTTP 502 failure path and implemented local/demo reliability guardrails.
- Added route parity checks so missing backend routes fail in dev/test before demo runtime.

## Artifact Viewer Routes Added
- Primary route: `/artifacts/:artifactId`
- Existing route wiring confirmed in `src/App.tsx`.
- Canonical route builder used across UI: `src/policy/artifacts/artifactRoute.ts`

## Artifact Resolution Strategy
- Artifact viewer resolves `artifactId` from canonical CES execution store first:
  - `generatedFormInstancesByEventId` for completed form instances
  - `evidence` for uploaded files/images/PDF/document evidence
  - approval/signature records for eCIgn signature artifacts
  - certification packet references for audit/export packet metadata
- Always renders metadata panel fields:
  - artifact id/type, event id, task id, requirement id
  - form id, form instance id, evidence id
  - policy id, workflow id
  - uploaded/completed by, uploaded/completed date
  - status, version, linked audit events
- Preview behavior:
  - image: inline image preview
  - PDF: embedded iframe preview
  - other file: metadata + open/download actions
  - missing local blob after refresh: explicit message
    - "File metadata is available, but demo-local file content is not available after refresh."

## Link Updates to Artifact Viewer
- Task and hierarchy links now prefer artifact routes for form instances and evidence.
- Audit Mode evidence table includes "View Artifact".
- Audit timeline and audit-trail events include "open artifact" links when an artifact target is present.
- Evidence Center file ledger rows and action buttons open `/artifacts/{evidence_id}`.
- Evidence package links in CES hierarchy use artifact viewer context.

## eCIgn Failing URL and Root Cause
- Failing URL observed: `GET /api/ecign/network-info`
- Method: `GET`
- Frontend caller: `src/policy/ecign/api.ts` via `ecignApi.getNetworkInfo()`, triggered by `FormViewer`.
- Expected response: JSON network metadata payload.
- Actual response: HTTP 502 in browser with Vite proxy errors.
- Proxy/server trace (from terminal logs):
  - `vite.config.ts` proxies `/api` to `http://localhost:8787`
  - Vite output: `http proxy error: /api/ecign/network-info`
  - error: `AggregateError [ECONNREFUSED]`
- Root cause:
  - Backend API endpoint exists in `server/routes/ecign.ts`, but local backend process was not reachable at `localhost:8787`.
  - Frontend was hardwired to live proxy behavior, so local/demo signing surfaced raw 502s.

## Exact Fix Applied
- Added explicit eCIgn runtime mode gate in `src/policy/ecign/api.ts`:
  - `DEMO_LOCAL`
  - `BACKEND_LIVE`
- Added demo-local eCIgn implementation:
  - `src/policy/ecign/demoLocalApi.ts`
  - Persisted/reloadable local sessions and audit events in localStorage
  - Full local progression:
    1. consent
    2. identity
    3. review
    4. signature
    5. attestation
    6. finalize
- Added local/demo finalize outputs:
  - signed document hash + manifest hash
  - certificate artifact id
  - signed package artifact id
- Added safe backend-unavailable handling:
  - clear `ECIGN_BACKEND_UNAVAILABLE` error
  - optional configured fallback (if enabled)
  - no raw 502 surfaced as user-facing state text
- Removed direct raw fetch calls in eCIgn hooks where possible:
  - version registration now uses `ecignApi.registerVersion(...)`
  - verify now uses `ecignApi.verify(...)` with MFA token support

## Demo/Live Mode Behavior
- Default mode: `DEMO_LOCAL` (stable for local/demo signing without backend dependency).
- `BACKEND_LIVE` mode:
  - uses `/api/ecign/*` endpoints
  - on missing route: throws `ECIGN_ROUTE_MISSING` with dev-console error
  - on backend unavailable: throws `ECIGN_BACKEND_UNAVAILABLE`
  - optional fallback only if explicitly configured

## Guardrails Added

### 1) Route health check
- New script: `scripts/checkEcignRouteHealth.ts`
- New npm command: `npm run check:ecign-routes`
- Verifies all frontend eCIgn routes are mounted in `server/routes/ecign.ts`.
- Fails non-zero with missing route list.

### 2) Demo/live mode gate
- Implemented explicit requested/resolved mode in eCIgn API client.
- Workspace now displays active mode in-session.

### 3) API contract validation
- Request/response shape checks added for key eCIgn operations (create/load/sign/finalize).
- Dev warnings + explicit contract errors on invalid shape.

### 4) No silent success
- `useEcignInstance` now verifies created session is reloadable (`getInstance`) before accepting creation.

### 5) Artifact requirement on finalize
- Finalization path writes certificate/signed package artifacts into CES evidence store.
- Finalization also appends signature lifecycle audit actions.

### 6) Task/readiness update after finalize
- On finalized signature:
  - linked form instance status transitions to `SIGNED` then `LOCKED` when context exists
  - linked task completion gate is attempted (`attemptCompleteTask`)
  - audit events appended for signature lifecycle milestones

## Audit Events Covered
- `SIGNATURE_SESSION_CREATED`
- `CONSENT_ACCEPTED`
- `IDENTITY_CONFIRMED`
- `DOCUMENT_REVIEWED`
- `SIGNATURE_APPLIED`
- `ATTESTATION_ACCEPTED`
- `SIGNATURE_FINALIZED`
- `CERTIFICATE_CREATED`

## Tests/Checks Run
- `npm run check:ecign-routes`
  - Result: pass (`[ecign-route-health] OK (18 routes verified)`)
- `npm run check:ecign-demo-local`
  - Result: pass (`8 audit markers + fallback/artifact markers verified`)
  - Coverage intent: verifies demo-local lifecycle markers, fallback gate markers, and finalized artifact/audit hooks are present in source.
- `node scripts/browserAcceptanceDelta.mjs`
  - Result: pass (browser-driven artifact/eCIgn delta acceptance with screenshots)
- IDE lint diagnostics on touched files
  - Result: no lint errors reported

## Browser Acceptance Delta Results

### Completed form artifact review
- PASS/FAIL: **PASS**
- Exact route tested: `/artifacts/qapi_meeting-20260507-08-QA-FM-021-001?event_id=qapi_meeting-20260507-08&task_id=qapi_meeting-20260507-08-29&form_id=QA-FM-021&form_instance_id=qapi_meeting-20260507-08-QA-FM-021-001&type=form_instance`
- Exact artifact ID tested: `qapi_meeting-20260507-08-QA-FM-021-001`
- Exact screenshot path: `Builder/_system/screenshots/browser-acceptance-delta/Completed-form-artifact-review.png`
- Exact blocker if failed: `None`
- Exact file fixed: `src/policy/pages/ArtifactViewerPage.tsx`

### Uploaded evidence artifact review
- PASS/FAIL: **PASS**
- Exact route tested: `/artifacts/EV-mow28jgi-g2kg?event_id=qapi_meeting-20260507-08&task_id=qapi_meeting-20260507-08-29&form_id=QA-FM-021&form_instance_id=qapi_meeting-20260507-08-QA-FM-021-001&evidence_id=EV-mow28jgi-g2kg&type=evidence`
- Exact artifact ID tested: `EV-mow28jgi-g2kg`
- Exact screenshot path: `Builder/_system/screenshots/browser-acceptance-delta/Uploaded-evidence-artifact-review.png`
- Exact blocker if failed: `None`
- Exact file fixed: `src/policy/pages/ArtifactViewerPage.tsx`

### Evidence package review
- PASS/FAIL: **PASS**
- Exact route tested: `/artifacts/qapi_meeting-20260507-08-29?event_id=qapi_meeting-20260507-08&task_id=qapi_meeting-20260507-08-29&form_id=QA-FM-021&form_instance_id=qapi_meeting-20260507-08-QA-FM-021-001&type=evidence_package`
- Exact artifact ID tested: `qapi_meeting-20260507-08-29`
- Exact screenshot path: `Builder/_system/screenshots/browser-acceptance-delta/Evidence-package-review.png`
- Exact blocker if failed: `None`
- Exact file fixed: `src/policy/pages/ArtifactViewerPage.tsx; src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx`

### Evidence Center artifact link review
- PASS/FAIL: **PASS**
- Exact route tested: `/evidence?event_id=qapi_meeting-20260507-08&task_id=qapi_meeting-20260507-08-29&evidence_id=EV-mow28jgi-g2kg&form_id=QA-FM-021&form_instance_id=qapi_meeting-20260507-08-QA-FM-021-001`
- Exact artifact ID tested: `EV-mow28jgi-g2kg`
- Exact screenshot path: `Builder/_system/screenshots/browser-acceptance-delta/Evidence-Center-artifact-link-review.png`
- Exact blocker if failed: `None`
- Exact file fixed: `src/policy/pages/EvidenceCenterPage.tsx`

### Task row/details artifact link review
- PASS/FAIL: **PASS**
- Exact route tested: `/calendar/event/qapi_meeting-20260507-08/task/qapi_meeting-20260507-08-29`
- Exact artifact ID tested: `EV-mow28jgi-g2kg`
- Exact screenshot path: `Builder/_system/screenshots/browser-acceptance-delta/Task-row-details-artifact-link-review.png`
- Exact blocker if failed: `None`
- Exact file fixed: `src/policy/pages/MobileIncidentExecutionPage.tsx; src/policy/components/regulatory/WorkflowExecutionPanel.tsx`

### Audit Mode evidence link review
- PASS/FAIL: **PASS**
- Exact route tested: `/audit?event=qapi_meeting-20260507-08`
- Exact artifact ID tested: `EV-mow28jgi-g2kg`
- Exact screenshot path: `Builder/_system/screenshots/browser-acceptance-delta/Audit-Mode-artifact-link-review.png`
- Exact blocker if failed: `None`
- Exact file fixed: `src/policy/pages/AuditModePage.tsx`

### Audit trail lifecycle artifact review
- PASS/FAIL: **PASS**
- Exact route tested: `/audit?event=qapi_meeting-20260507-08`
- Exact artifact ID tested: `EV-mow28jgi-g2kg`
- Exact screenshot path: `Builder/_system/screenshots/browser-acceptance-delta/Audit-trail-lifecycle-artifact-review.png`
- Exact blocker if failed: `None`
- Exact file fixed: `src/policy/pages/AuditModePage.tsx; src/policy/components/regulatory/WorkflowExecutionPanel.tsx`

### eCIgn browser flow
- PASS/FAIL: **PASS**
- Exact route tested: `/forms/QA-FM-021?event_id=qapi_meeting-20260507-08&task_id=qapi_meeting-20260507-08-29&form_id=QA-FM-021&form_instance_id=qapi_meeting-20260507-08-QA-FM-021-001&workflow_id=QA-WF-03&requirement_id=qapi_meeting-20260507-08-29%3A%3AFORM_COMPLETION%3A%3AQA-FM-021`
- Exact artifact ID tested: `EV-mow28nxr-wav0`
- Exact screenshot path: `Builder/_system/screenshots/browser-acceptance-delta/eCIgn-browser-flow.png`
- Exact blocker if failed: `None`
- Exact file fixed: `src/policy/components/FormSigningWorkspace.tsx; src/policy/ecign/api.ts`

## Remaining Gaps
- Live backend fallback policy is env-driven; deployment defaults should be documented in environment configuration docs if production-live mode is required.

## eCIgn Artifact Persistence Failure Remediation
- Canonical persistence on finalize now creates explicit CES artifacts in `regulatoryExecutionStore.evidence`:
  - `signed_certificate`
  - `signed_package`
  - `signed_form_instance`
- Finalization no longer relies on transient workspace-only references; artifact links resolve from canonical persisted records.
- STUB eCIgn IDs are no longer used as primary review artifacts for finalize UX. Viewer/open actions prefer canonical persisted artifact IDs.
- Canonical form instance binding enforced:
  - Finalized artifacts bind to CES `form_instance_id` format `{event_id}-{form_id}-{sequence}`.
  - eCIgn runtime/session ID is stored separately as `ecignSessionId`/`signatureSessionId`.
- Finalize audit linkage now includes:
  - `SIGNATURE_FINALIZED`
  - `CERTIFICATE_CREATED`
  - `SIGNED_PACKAGE_CREATED`
  - `ARTIFACT_REGISTERED`
  - `ARTIFACT_LOCKED`
- Artifact metadata hydration now includes separated eCIgn session metadata and canonical form instance metadata in Artifact Viewer.

## Manual QA Defects — 2026-05-08

**Note:** Rows below reflect code fixes applied in-repo after the 2026-05-08 manual QA session. **Browser retest** was not re-executed in this agent environment (no automated Playwright run for the full A–F matrix). Re-run cases A–F locally before treating any item as production-verified. Screenshots referenced are from the user’s QA session (paths under Cursor workspace storage / shared captures), not all committed into this repository.

### 1. Completed form opens blank / black; workspace vs snapshot

| Field | Value |
|--------|--------|
| **PASS/FAIL** | **PARTIAL — retest required** (logic fixed; not re-run in browser here) |
| **Screenshot reference** | QA capture: Artifact Viewer — blank “Completed form rendering” + console “Maximum update depth exceeded” (`FormSigningWorkspace` / `uploadEvidence`) |
| **Route tested** | `/artifacts/{form_instance_id}?event_id=…&task_id=…&form_instance_id=…&type=form_instance` (example pattern from QA) |
| **Button clicked** | Open Artifact from **Form** requirement row; “Open form workspace” |
| **Expected artifact ID** | `form_instance_id` for that row |
| **Actual artifact ID opened (before fix)** | Correct ID in URL but iframe pointed at **editable** `/forms/...` workspace → blank/black when workspace or signing loop failed |
| **Root cause** | (a) Artifact viewer used **form workspace** iframe for completed instances instead of persisted **signed_form_instance** HTML when available. (b) **Infinite re-render** from `uploadEvidence` in `FormSigningWorkspace` when effect deps included live store / widening hashes. |
| **Files fixed** | `src/policy/pages/ArtifactViewerPage.tsx`; `src/policy/components/FormSigningWorkspace.tsx` |
| **Browser retest result** | **Not run** in this session — please confirm completed instance shows signed HTML snapshot when `signed_form_instance` evidence exists, and that max-depth error is gone. |

### 2. Supporting evidence opens wrong artifact (latest vs row)

| Field | Value |
|--------|--------|
| **PASS/FAIL** | **PARTIAL — retest required** |
| **Screenshot reference** | QA: multiple “Open Artifact” rows; Evidence Center metadata showing wrong-size / wrong file association |
| **Route tested** | `/artifacts/{evidence_id}?…` vs `/artifacts/{form_instance_id}?…` |
| **Button clicked** | Open Artifact on **Supporting evidence** row |
| **Expected artifact ID** | Row `evidence_id` |
| **Actual artifact ID opened (before fix)** | Often **form instance** or first “usable” evidence doc because `SUPPORTING_EVIDENCE_UPLOAD` used `usableEvidence[0]` after signed artifacts existed |
| **Root cause** | `buildCesTaskRequirements` picked first usable evidence **including** signed eCIgn artifacts for the supporting slot. Row `artifactRoute` also preferred `evidence_id` over `form_instance_id` for **all** types. |
| **Files fixed** | `src/policy/evidence/cesEvidenceHierarchy.ts`; `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` (`buildRowArtifactRoute`) |
| **Browser retest result** | **Not run** here — confirm supporting row opens **only** its `evidence_id`. |

### 3. Uploaded evidence metadata-only / inaccessible preview

| Field | Value |
|--------|--------|
| **PASS/FAIL** | **PARTIAL — retest required** |
| **Screenshot reference** | QA: Evidence Center file metadata with tiny `size` (e.g. 16 B / 24 B); Artifact Viewer “demo-local preview unavailable after refresh” |
| **Route tested** | `/artifacts/{evidence_id}`; `/evidence?event_id=…&evidence_id=…` |
| **Button clicked** | Open Artifact from evidence row / Evidence Center “View in Artifact Viewer” |
| **Expected** | Preview or download when `localDataUrl` / runtime cache has bytes; clear demo-local disclaimer when bytes are missing |
| **Root cause** | Demo-local storage limits; copy updated in viewer for **explicit non–CMS-grade** wording when bytes are missing |
| **Files fixed** | `src/policy/pages/ArtifactViewerPage.tsx` (warning copy) |
| **Browser retest result** | **Not run** here |

### 4. eCIgn / signed PDF package / STUB artifacts

| Field | Value |
|--------|--------|
| **PASS/FAIL** | **PARTIAL — retest required** |
| **Screenshot reference** | QA: console `STUB-ESIGN-…`; signed package metadata with minimal size |
| **Route tested** | `/artifacts/{evidence_id}` for `signed_form_instance` / `signed_package` |
| **Root cause** | Finalize loop could **re-enter** `uploadEvidence`; finalize now uses **one-shot guard** + `getState()` to stabilize; signed HTML still depends on demo-local persistence of `localDataUrl` |
| **Files fixed** | `src/policy/components/FormSigningWorkspace.tsx` |
| **Browser retest result** | **Not run** here — confirm three artifacts (certificate, package, signed form instance) appear with non-empty HTML data URLs before refresh |

### 5. Request Signature — assignment clarity

| Field | Value |
|--------|--------|
| **PASS/FAIL** | **PARTIAL — retest required** |
| **Screenshot reference** | QA: “Request Signature” drawer — `form instance: —`, status PENDING only |
| **Route tested** | CES calendar / task drawer (inline panel) |
| **Root cause** | `formInstanceId` only resolved for `FORM_COMPLETION`; signature row had no `signature_id` for Open Artifact |
| **Files fixed** | `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` (resolve `formInstanceId` for all requirement types; list approval rows in signature drawer); `src/policy/evidence/cesEvidenceHierarchy.ts` (`signature_id` on requirement when an approval exists) |
| **Browser retest result** | **Not run** here |

### 6. Audit trail opens full page

| Field | Value |
|--------|--------|
| **PASS/FAIL** | **PARTIAL — retest required** |
| **Screenshot reference** | QA: sub-task “View Audit Trail” navigating to `/audit?…` |
| **Button clicked** | View Audit Trail on a requirement row |
| **Expected** | Contextual drawer filtered to requirement/task |
| **Root cause** | Row button always `window.open` full audit URL |
| **Files fixed** | `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` (`RequirementAuditModal` + row handler); duplicate React keys mitigated in artifact viewer audit list |
| **Browser retest result** | **Not run** here |

### 7. Certify Package — unclear contents

| Field | Value |
|--------|--------|
| **PASS/FAIL** | **PARTIAL — retest required** |
| **Screenshot reference** | QA: Certify drawer — metadata + PENDING only |
| **Root cause** | Drawer body had no package checklist |
| **Files fixed** | `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` (checklist + open links for form instances, supporting evidence, signing artifacts; attestation disclaimer) |
| **Browser retest result** | **Not run** here |

### 8. Lock Package — unclear contents

| Field | Value |
|--------|--------|
| **PASS/FAIL** | **PARTIAL — retest required** |
| **Screenshot reference** | QA: Lock / certify drawers with empty grids (annotated) |
| **Root cause** | Same thin drawer as certify; lock **Open in new tab** fell through to full audit instead of locked evidence |
| **Files fixed** | `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` (`openInNewTab` for `LOCK_REQUIRED`; shared checklist UI) |
| **Browser retest result** | **Not run** here |

### 9. Artifact routing bug (row-specific IDs)

| Field | Value |
|--------|--------|
| **PASS/FAIL** | **PARTIAL — retest required** |
| **Screenshot reference** | QA: multiple OPEN ARTIFACT buttons per task |
| **Root cause** | Generic `evidence_id` ?? `form_instance_id` ordering; supporting evidence ID selection; review/lock fallthrough routes |
| **Files fixed** | `buildRowArtifactRoute` in `WorkflowExecutionPanel.tsx`; `cesEvidenceHierarchy.ts`; evidence package path in `CesEvidenceHierarchyPanel.tsx` (`buildArtifactRoute('ces-evidence-package', …)`) |
| **Browser retest result** | **Not run** here |

### QA matrix (A–F) — agent status

| Case | Status |
|------|--------|
| A. Completed form artifact | **Retest required** after snapshot + loop fixes |
| B. Supporting evidence artifact | **Retest required** after supporting-ID + routing fixes |
| C. Signature package | **Retest required** |
| D. Certify package | **Retest required** |
| E. Lock package | **Retest required** |
| F. Audit trail drawer | **Retest required** |

**Defensibility note (unchanged policy):** Demo-local metadata without durable file bytes is **not** represented as CMS- or ACHC-defensible production evidence; UI copy reinforces “audit simulation” when bytes are missing.

## Finalize pass — 2026-05-08 (immutable record + loop hardening)

**Browser re-verification still required** (sign → refresh → reopen artifact → navigation stress). Changes applied in this pass:

| Priority | Change | Files |
|----------|--------|--------|
| P1 Loops | `canonicalFormInstanceId` no longer subscribes to the whole Zustand store (`getState().getOrCreateFormInstance` in `useMemo`). `appendExecutionAudit` uses `getState()` so callback identity does not churn on every store write. Finalize `uploadEvidence` effect: removed faulty early `cesFinalizedArtifactsBootstrapRef` gate that could skip uploads after a re-run; added `try/finally` sync lock + post-success commit key. HHC mirror effect deps narrowed off full `instance` object. | `FormSigningWorkspace.tsx` |
| P1 Loops | Large HTML `data:` payloads converted to **blob URLs** before `stashDemoEvidenceDataUrl`; `localDataUrl` omitted from persisted evidence rows to avoid giant JSON. | `regulatoryExecutionStore.ts`, `demoEvidenceRuntimeCache.ts` |
| P1/P3 Blank iframe | Artifact viewer uses `useIframeSafeSrc` for form-instance and HTML evidence iframes (blob URL when `data:text/html` is large). Form snapshot resolution: **signed_form_instance → signed_package (prefer locked)** before any workspace. | `ArtifactViewerPage.tsx` |
| P2 Terminal | Task requirements patch sets **FORM_COMPLETION** to 100% when a linked instance is `COMPLETED`/`SIGNED`/`LOCKED`. Row UI: only **View completed form (read-only)** when complete; drawer hides `FormViewer` when terminal and opens artifact viewer from “Open in new tab”. Workspace link hidden in artifact viewer when immutable snapshot or terminal. | `WorkflowExecutionPanel.tsx`, `ArtifactViewerPage.tsx` |
| P4 STUB | Lambda-disabled mirror id renamed to `ECIGN-INTERNAL-MIRROR-*` (session-only). UI and artifact buttons do not promote it; finalize UX explains mirror vs canonical CES IDs. Dev `console.info` of mirror payload removed. | `hhcEvidence.ts`, `FormSigningWorkspace.tsx` |
| P5 / P6 | Signature list: **ordered slots**, status, prior-signer gate note, reassignment note. Certify/Lock/Review: **readiness summary** (forms, supporting, signed artifacts, approvals, locked count) + adjudication copy. | `WorkflowExecutionPanel.tsx` |
