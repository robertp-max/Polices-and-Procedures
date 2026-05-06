# Current Pipeline Documentation

Current pipeline inventory with implemented vs target behaviors.

## 1) Policy ingestion/extraction pipeline

- Input:
  - `Builder/Policies/extracted_full/*.md`
  - optional legacy aggregate `Builder/Policies/ALL_POLICIES.md`
- Processor/script/service:
  - `Builder/Policies/generate_from_extracted.py`
  - legacy overlap: `Builder/Policies/generate_policy_content.py`
- Output:
  - `src/policy/data/allPoliciesContent.generated.ts`
- Validation step:
  - script parsing checks and generated output sanity.
- Runtime consumer:
  - policy pages through `policyContentMap.ts`.
- Failure modes:
  - malformed extracted markdown, ID parse drift, generator overlap causing schema mismatch.
- Rebuild instructions:
  - run canonical policy generation script (Needs confirmation which of two scripts is canonical), then verify app imports compile.

## 2) Corridor alignment pipeline

- Input:
  - `tmp-policy-ids.txt`
  - corridor strategy references and extracted policy mappings.
- Processor:
  - `Builder/Policies/generate_corridor_alignment.py`
- Output:
  - `src/policy/data/corridorAlignment.generated.ts`
  - `Builder/Policies/corridor-crosswalk.csv`
- Validation:
  - `scripts/validateCorridorAlignment.ts`
- Runtime consumer:
  - via `formAddendumBindings.ts` and related ACHC alignment pages (partial usage needs confirmation).
- Failure modes:
  - stale ID source file, mismatched policy IDs, orphan mapping.
- Rebuild instructions:
  - regenerate with Python script, run validation script.

## 3) Forms build pipeline

- Input:
  - `Builder/Forns/*.txt`
- Processor:
  - `scripts/formsSystemBuild.ts`
- Output:
  - `.cache/forms-build/formsLibraryDataset.generated.ts`
  - reconciliation/report artifacts in `.cache/forms-build/`
- Validation:
  - built-in reconciliation stats and report outputs.
- Runtime consumer:
  - runtime currently consumes `src/policy/data/formsLibraryDataset.ts` (manual sync needed).
- Failure modes:
  - source schema variation, policy link mismatch, unsynced runtime dataset.
- Rebuild instructions:
  - run forms build script, review reconciliation output, manually promote dataset update when appropriate.

## 4) Workflow compilation pipeline

- Input:
  - `Builder/Policies/Workflows/*-WORKFLOWS.md`
  - form metadata from `formsCatalog.ts` + Forns index
- Processor:
  - `scripts/compileWorkflows.ts`
- Output:
  - `workflows.generated.ts`
  - `workflowGraph.generated.ts`
  - `workflowTemplates.generated.ts`
  - `formTitles.generated.ts`
- Validation:
  - required sections, known form references, inferred dependency and risk checks.
- Runtime consumer:
  - workflow app, execution panel, PM/CES, Brad context.
- Failure modes:
  - malformed markdown sections, unknown form IDs, dependency cycles.
- Rebuild instructions:
  - run workflow compiler script, resolve warnings/errors, verify runtime compile.

## 5) Event/task generation pipeline

- Input:
  - static event definitions in `regulatoryEvents.ts`
  - workflow/form/task source rules.
- Processor/service:
  - `regulatoryExecutionStore` + compliance-execution adapters/hooks.
- Output:
  - event instances, generated tasks, form instances, audit chain rows in local state.
- Validation:
  - state machine guards, completion/certification checks, task transition guards.
- Runtime consumer:
  - dashboard/calendar/workflow/PM/CES/audit pages.
- Failure modes:
  - missing source event mapping, invalid transitions, required evidence/form checks bypass by edge path.
- Rebuild instructions:
  - no generator compile step; state rehydrates from local storage or reset.

## 6) Evidence upload/promotion pipeline

- Input:
  - user upload actions in EvidencePanel/EvidenceCenter.
- Processor:
  - local store mutation path (`uploadEvidence`) and EvidenceCenter target endpoint contracts.
- Output:
  - local evidence metadata rows and audit rows (implemented).
  - target promoted evidence rows/object paths in cloud flow (coded target).
- Validation:
  - task context derivation, event lock checks, target validate/promote API contract.
- Runtime consumer:
  - evidence tabs, Evidence Center, survey packet.
- Failure modes:
  - empty task context -> no row, dual store divergence, target API unavailable.
- Rebuild instructions:
  - local: reset state keys as needed.
  - target: requires deployed backend implementing upload endpoints.

## 7) Audit log pipeline

- Input:
  - evidence/task/form/event mutations, eCIGN actions, calendar sync actions.
- Processor:
  - frontend append chain logic and backend audit writers.
- Output:
  - local store audit arrays,
  - server JSONL (`server/audit/data`, `server/ecign/data`, `.cache/audit`).
- Validation:
  - hash chain verification in local API methods and backend audit verification routes.
- Runtime consumer:
  - audit mode, workflow audit tabs, backend audit endpoints.
- Failure modes:
  - taxonomy mismatch, missing request-level metadata across subsystems.
- Rebuild instructions:
  - audit data is append-oriented; verification via audit routes/tools.

## 8) Brad knowledge/indexing pipeline

- Input:
  - runtime context datasets and Builder corpus sources for IA indexer.
- Processor:
  - runtime: `buildBradAppContext()`
  - backend: IA ingest/index service.
- Output:
  - runtime in-memory context object,
  - `.cache/ia-index`.
- Validation:
  - IA index existence check on server startup; query behavior validation via `/api/ia`.
- Runtime consumer:
  - iAdministrator UI and IA route outputs.
- Failure modes:
  - corpus drift between runtime context and IA index data.
- Rebuild instructions:
  - run IA indexing command (`npm run ia:index` per server hint), restart backend.

## 9) AWS/serverless API pipeline

- Input:
  - auth registration/login/setup requests.
- Processor:
  - local Express auth service + CDK/Lambda equivalent auth handlers.
- Output:
  - Cognito users/sessions, Dynamo registration records, SES emails.
- Validation:
  - request validation and service-level checks.
- Runtime consumer:
  - auth pages and auth provider client.
- Failure modes:
  - env misconfiguration, SES delivery failure, mixed auth models in app.
- Rebuild instructions:
  - configure env vars, run backend/auth stack deploy for AWS path, verify auth endpoints.

---

## Pipeline Confidence Labels

- Implemented and active: workflows compile, policy compile, local event/task/evidence execution, audit exports, auth backend.
- Implemented but partially integrated: forms build output promotion, IA indexing integration with runtime context.
- Target/partial: cloud evidence upload/validate/promote lifecycle and `/api/compliance-execution` backend in local server.
