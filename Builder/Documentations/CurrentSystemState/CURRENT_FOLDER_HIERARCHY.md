# Current Folder Hierarchy (Current State)

This document reflects the repository as currently implemented.  
`Builder/` is treated as ingestion/staging/documentation source unless runtime imports prove otherwise.

## 1) Top-Level Classification

- `src/` — Active runtime frontend application (React + TypeScript).
- `server/` — Active runtime backend (Express API, IA/RAG service, auth routes, eCIGN routes, calendar sync routes).
- `public/` — Runtime static assets served by the frontend.
- `infra/` — AWS/serverless infrastructure code (CDK demo auth stack) and generated synth output.
- `scripts/` — Build, compile, validation, and sync tooling.
- `Builder/` — Ingestion/staging/documentation dump; not runtime hierarchy by default.
- `Builder/Documentations/MigratedRepoRoot/docs/` — Documentation-only artifacts and report outputs (migrated from former repo-root `docs/`).
- `Builder/Documentations/MigratedRepoRoot/Corridor-Alignment-Strategy/` — Strategy and implementation notes (migrated from former repo-root folder).
- `Bin-(thrash)/` — Historical/experimental/needs-confirmation content.
- `.cache/` — Generated local artifacts and runtime/tool caches.

## 2) Runtime Application Structure

### Frontend runtime (active)

- `src/App.tsx` — Route registry for all runtime pages.
- `src/auth/` — Auth provider, auth API client, auth pages, protected route guard.
- `src/policy/pages/` — Core pages (dashboard, library, forms, workflows, audit, evidence, calendar, iAdministrator, help/system docs, PM/CES routes).
- `src/policy/components/` — Shared UI, regulatory workflow/evidence panels, onboarding overlays.
- `src/policy/compliance-execution/` — Event/task/form execution dataflow and state-machine logic.
- `src/policy/security/` — Authorization, identity/admin pages, permission models.
- `src/policy/data/` — Runtime datasets (generated and hand-maintained).
- `src/policy/help/` — Runtime Help Center article registry/content.
- `src/services/` — Brad context and mock engine integration layer.

### Backend runtime (active)

- `server/index.ts` — Express composition and mounted routes.
- `server/routes/` — Calendar, auth, eCIGN, compliance, PM, hubstaff, audit.
- `server/audit/` — Audit v2 routes, writer, anomaly scanner.
- `server/ecign/` — eCIGN storage, hash chain, state machine, compliance evaluator, bundle export.
- `server/ia/` — IA/RAG ingest/index/query APIs.
- `server/sync/` — Calendar sync and local event/audit stores.
- `server/auth/` — Cognito/SES/Dynamo-backed demo auth service.

### Runtime static / asset layers

- `public/MASTER_CONTROL_INVENTORY_DATA_MODEL.json` (and duplicates under `public/Builder/...` and `public/Documentations/...`) — consumed by master control inventory runtime page.

## 3) Source-of-Truth Data Locations

- Policies text source: `Builder/Policies/extracted_full/*.md`.
- Policy compiled outputs consumed by runtime: `src/policy/data/allPoliciesContent.generated.ts`, `src/policy/data/specimenContent.generated.ts`.
- Workflow authored source: `Builder/Policies/Workflows/*-WORKFLOWS.md`.
- Workflow generated outputs consumed by runtime:  
  `src/policy/data/workflows.generated.ts`,  
  `src/policy/data/workflowGraph.generated.ts`,  
  `src/policy/data/workflowTemplates.generated.ts`,  
  `src/policy/data/formTitles.generated.ts`.
- Forms ingestion source: `Builder/Forns/*.txt`.
- Runtime forms dataset currently consumed: `src/policy/data/formsLibraryDataset.ts`.
- Runtime events/tasks source: `src/policy/data/regulatoryEvents.ts`, `src/policy/data/mandatedEventsExpanded.ts`, `src/policy/data/hubstaffTasks.ts`.

## 4) Generated vs Hand-Maintained vs Staging

### Generated and actively consumed

- `src/policy/data/frameworkSeed.generated.ts` (active runtime consumer).
- `src/policy/data/allPoliciesContent.generated.ts` (active runtime consumer).
- `src/policy/data/workflows.generated.ts` (active runtime consumer).
- `src/policy/data/workflowGraph.generated.ts` (active runtime consumer).
- `src/policy/data/formTitles.generated.ts` (active runtime consumer).
- `src/policy/data/achcAttachmentCrosswalk.generated.ts` (active runtime consumer).

### Generated but appears unused/orphan (needs confirmation)

- `src/policy/data/workflowTemplates.generated.ts` (no direct runtime use found in route-level paths).
- `src/policy/data/achcPrintCrosswalk.generated.ts` (no active runtime import found).
- `src/policy/data/achcSurveyTags.generated.ts` (no active runtime import found).
- `src/policy/data/formAddendumBindings.ts` + `corridorAlignment.generated.ts` link exists; broader runtime consumers need confirmation.

### Staging / ingestion / docs-only (non-runtime by default)

- `Builder/System-Documentation-for-Ingestion/`
- `Builder/Documentations/`
- `Builder/Knowledge-Base/`
- `Builder/eCIgn-Centered-Submission/`
- `Builder/AWS-Architecture/`

## 5) AWS / Serverless Backend Structure

- `infra/demo-auth-cdk/lib/demo-auth-stack.ts` — CDK stack for auth components.
- `infra/demo-auth-cdk/lambda/*.ts` — Lambda handlers for auth flows.
- `infra/demo-auth-cdk/cdk.out/*` — generated synth outputs (generated artifacts, not source-of-truth).
- `server/auth/service.ts` — local Express auth service using Cognito/SES/Dynamo APIs.

## 6) Evidence and Upload Storage Paths

### Implemented local/dev logical paths

- Event folder model: `src/policy/compliance-execution/eventFolders.ts`
  - `/events/{eventId}/evidence`
  - `/events/{eventId}/audit/audit-log.jsonl`
- Local store key for execution layer: `localStorage` key `reg-execution-v2`.
- Local store key for Evidence Center demo mode: `localStorage` key `evidence-center-demo-store-v1`.

### Target cloud path references (frontend target contracts; needs confirmation)

- API base defaults to external gateway URL in evidence-related clients/pages.
- Target key conventions appear in comments and request payload contracts, but runtime default is demo-local stub mode.

## 7) Folder Status Flags

- **Active runtime:** `src/`, `server/`, `public/`, parts of `infra/`.
- **Generated:** `src/policy/data/*.generated.ts`, `infra/demo-auth-cdk/cdk.out/*`, `.cache/*`.
- **Historical/experimental:** `Bin-(thrash)/`, multiple `tmp-*` root files.
- **Duplicate paths:** master control JSON copied into three `public` locations.
- **Unused/needs confirmation:** generated datasets listed above; old backup files like `src/policy/pages/DashboardPage.tsx.backup`.
- **Builder ingestion/staging:** `Builder/*` (except where runtime imports explicitly consume copied artifacts in `public`).

## 8) Important Boundary Clarification

- `Builder/` is not the runtime architecture root.
- Runtime reads from `src/`, `server/`, `public/`, and optionally `infra` outputs.
- Builder content is pipeline input, staging material, generated documentation, and archival source data.
