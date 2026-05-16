# QA/UAT Audit — Executive Summary
**Date:** 2026-05-14  
**Auditor:** Grok (read-only exploration agent, locked mode)  
**Repo:** C:\AI\Git\training\HomeHealth\Policies_and_Procedures (main branch)  
**Scope:** Complete QA/UAT audit — code inspection only (no runtime browser validation unless explicitly noted)

---

## Overall Status

**CODEBASE IS STRUCTURALLY SOUND BUT HAS MULTIPLE KNOWN INTEGRATION GAPS IN THE CES → eCign → Evidence → Audit Trail chain.**

The application has a sophisticated, multi-layer compliance architecture (CES execution, signer tasks, eCign artifact generation, regulatory execution store, evidence hierarchy, audit events). However, the **end-to-end identity chain** for form instances that require multiple signers is fragile.

**Typecheck:** PASSED (exit 0, clean)  
**Feature Access Matrix:** PASSED (all acceptance checks)  
**Build:** Not yet executed in this session (see QA_UAT_BUILD_RESULTS.md)

**Git Hygiene:** Good — `.gitignore` correctly excludes `Builder/`, `Bin-(thrash)/`, screenshots, uat-results, current_state exports, and Project_Intelligence.

---

## Top P0 Blockers (Must fix before any public demo or UAT)

1. **Multi-signer eCign artifact identity drift** — Each subsequent signer (e.g., DON after DON Assistant) generates a *new* `signedPackageArtifactId` via `uploadEvidence`. Prior artifacts are removed, but earlier audit events and any external references retain the old ID. Evidence Center may show the latest, but Audit Trail links and deep permalinks break.
2. **form_instance_id not reliably propagated on "Complete Form" navigation from WorkflowExecutionPanel** — While `buildArtifactRoute` and `requirement.form_instance_id` exist in code, the initial creation path for DON Assistant → DON signer tasks does not guarantee the `form_instance_id` is present on the requirement object before the user clicks "Complete Form".
3. **Second signer flow creates detached evidence** — Violates the explicit source-of-truth rule: "No detached third evidence record." The `isSubsequentSigner` path still calls `uploadEvidence` instead of *updating* the existing artifact record for the same `canonicalFormInstanceId`.

---

## Top P1 High Defects

1. **Audit Trail `targetKind` / `targetId` population incomplete** — Multiple call sites of `appendTaskAuditEvent` still nest `formInstanceId` inside `after` instead of passing `targetKind: 'form_instance'`, `targetId: formInstanceId` at the top level. `ArtifactViewerPage` and Evidence Center rely on top-level fields.
2. **ArtifactViewerPage resolution for multi-signer packages is heuristic** — It uses `resolveFormInstanceFromArtifactCandidates` + legacy `--` double-dash fallback, but does not have a deterministic reverse lookup from the *latest* signed package artifact back to the canonical form instance + all signer certificates.
3. **Vercel Static Demo Entry is incomplete** — `vercel.json` + prebuild script exist, but there is no documented "demo mode only" entry path that disables backend-dependent features (auth real calls, ia RAG, calendar sync, Hubstaff, real eCign). Demo bypass exists but is not surfaced as a first-class "Try the static demo" experience.
4. **Calendar / Sprint / Kanban / Gantt task sync has known Q2 regressions** (documented in `CES_TASK_IDENTITY_AND_Q2_FAILURES.md`) — `taskOverridesByEventId` canonical ID collision risk remains.
5. **Print/Download for policy documents vs eCign signed artifacts share some code paths** — Risk of branding or layout leakage between "policy print view" (GV-GB-001 target) and "signed artifact print".

---

## Top P2 Cleanup Items

- Inconsistent naming of signed package artifacts (`-signed-package.html` vs `-signed-package-v2.html`).
- No canonical filename standard enforced for downloaded signed artifacts.
- `regulatoryExecutionStore` still has in-memory-only form instance state in some paths (refresh loses draft values).
- Trainer/Onboarding role has `user.provision` granted in the matrix but the UI surface for it may be too broad.
- Many "verify" and "check" scripts in `/scripts` have no corresponding Playwright or CI gate.
- Builder/ directory contains hundreds of architecture docs that are treated as source-of-truth by some agents but are excluded from runtime.

---

## What Is Testable Now (Code Inspection + Safe Commands)

- TypeScript build/typecheck
- Feature/permission matrix via `scripts/verify-feature-access.mjs`
- Static file structure and identity logic (taskIdentity, cesFormInstanceId, cesRoles, signerTaskFactory)
- Git hygiene rules
- Role boundary logic (DON Assistant cannot sign)

## What Is Blocked (Requires Runtime / Browser)

- All "Vercel Static Demo Entry" flows
- DON Assistant → DON two-signer CES form completion + signature flow
- eCign Download / Print / Open Signed Artifact end-to-end
- Evidence Center refresh + artifact retrieval after multi-signer
- Audit Trail link resolution to correct artifactId
- Form URL hydration with `?form_instance_id=...`
- Policy print view vs browser print preview vs downloaded PDF visual match against GV-GB-001
- Calendar/Sprint/Kanban/Gantt live sync after task status change
- Trainer permission boundary enforcement in real UI

---

## Recommended Fix Order (Surgical)

1. **P0-01** — Enforce single canonical `signedPackageArtifactId` per `canonicalFormInstanceId` (even across multiple signers). Subsequent signers must *update* the existing evidence record instead of removing + re-uploading.
2. **P0-02** — Guarantee `form_instance_id` is present on every requirement row rendered in `WorkflowExecutionPanel` before "Complete Form" is clickable (backfill in `useEventExecutionDataflow` or requirement projector).
3. **P1-01** — Standardize `appendTaskAuditEvent` call sites to always pass `targetKind` + `targetId` at top level when a form_instance or artifact is involved.
4. **P1-02** — Add deterministic reverse lookup in `cesFormInstanceId.ts` / `ArtifactViewerPage` from any signed package artifact back to its canonical form instance.
5. **P2-01** — Create a documented "Vercel Static Demo Entry" bootstrap that forces demo auth bypass + mocks all backend services.
6. **P2-02** — Separate policy print branding completely from eCign signed artifact print (different components, different CSS).

---

## Confirmation

- No source code was modified during this audit.
- No commits, pushes, or deployments performed.
- All inspection limited to read-only tools.
- Output saved exclusively under `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/`.

**Next step:** Run the full manual browser test plan in `QA_UAT_TEST_PLAN.md` against a clean `npm run dev` instance with demo auth bypass enabled.
