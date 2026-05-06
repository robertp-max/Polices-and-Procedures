# Current Data Map

Entity map of major domains with source locations, IDs, relationships, consumers, persistence, and known gaps.

## 1) Policies

- Source file/location:
  - `Builder/Policies/extracted_full/*.md` (ingestion source)
  - `src/policy/data/policyCorpus.ts` (runtime policy registry)
- Generated file/location:
  - `src/policy/data/allPoliciesContent.generated.ts`
- Primary ID:
  - `policy.id` (for example `GV-GB-001`)
- Relationships:
  - policy -> workflows (`policyRefs`)
  - policy -> forms (`formsLibraryDataset` link arrays)
  - policy -> events (`policyRefs` on event definitions)
  - policy -> evidence (`policy_id`/`policyIds`)
- Runtime consumers:
  - Library, detail, print pages, Brad context, audit pages.
- Persistence layer:
  - static TS modules in frontend bundle.
- Known gaps:
  - overlapping generation scripts and potential drift (Needs confirmation on canonical script).

## 2) Forms metadata/content

- Source file/location:
  - `Builder/Forns/*.txt`
- Generated file/location:
  - `.cache/forms-build/formsLibraryDataset.generated.ts` (tool output)
- Runtime file:
  - `src/policy/data/formsLibraryDataset.ts` (consumed now)
- Primary ID:
  - `form.id` (for example `CL-FM-009`)
- Relationships:
  - forms -> policies (policy id arrays)
  - forms -> workflows (required forms in workflows)
  - forms -> tasks/form instances/evidence links
- Runtime consumers:
  - Forms page, FormViewer, workflow and event execution tabs, Brad context.
- Persistence:
  - static TS datasets + runtime form state in local store.
- Known gaps:
  - generated output not auto-promoted to runtime dataset (drift risk).

## 3) Workflows

- Source:
  - `Builder/Policies/Workflows/*-WORKFLOWS.md`
- Generated:
  - `src/policy/data/workflows.generated.ts`
  - `src/policy/data/workflowGraph.generated.ts`
  - `src/policy/data/workflowTemplates.generated.ts`
  - `src/policy/data/formTitles.generated.ts`
- Primary ID:
  - `workflow.id` (for example `CL-WF-003`)
- Relationships:
  - workflow -> policy refs
  - workflow -> required forms
  - workflow -> event definitions and tasks
  - workflow -> evidence via task/form context
- Consumers:
  - workflows routes, execution panel, PM/CES projections, Brad context.
- Persistence:
  - generated static TS + runtime state overlays.
- Known gaps:
  - template output may be underused (Needs confirmation).

## 4) Regulatory events and event instances

- Source:
  - `src/policy/data/regulatoryEvents.ts`
  - `src/policy/data/mandatedEventsExpanded.ts`
- Generated output:
  - none required for base event list (runtime TS source).
- Primary IDs:
  - source event id (for example `EVT-*`)
  - event instance id (derived in compliance-execution layer)
- Relationships:
  - event -> workflow
  - event -> policy refs
  - event -> tasks/forms/evidence/approvals/audit rows
- Consumers:
  - dashboard, master calendar, mobile execution, audit, CES/PM.
- Persistence:
  - local store `reg-execution-v2`, plus optional backend APIs.
- Known gaps:
  - remote `/api/compliance-execution` backend route not found in local Express.

## 5) Tasks

- Source:
  - derived from workflows/forms/process steps; manual creation allowed.
- Runtime file(s):
  - `src/policy/stores/regulatoryExecutionStore.ts`
  - `src/policy/compliance-execution/useEventExecutionDataflow.ts`
- Primary ID:
  - `task.id` stable derived/manual IDs.
- Relationships:
  - task -> event
  - task -> form ids
  - task -> workflow/policy refs
  - task -> evidence rows
- Consumers:
  - workflow execution tabs, PM views, CES dashboards.
- Persistence:
  - local store event task override map.
- Known gaps:
  - evidence requirement logic differs by task source type; may not enforce uniform chain.

## 6) Evidence files/metadata

- Source:
  - user-upload metadata actions in runtime UI.
- Runtime files:
  - `regulatoryExecutionStore.ts`, `EvidencePanel.tsx`, `EvidenceCenterPage.tsx`.
- Generated output:
  - none as separate source files; runtime metadata persisted locally.
- Primary ID:
  - `EvidenceDoc.id` and/or `evidence_id`.
- Relationships:
  - evidence -> event, task, workflow, policy, forms, audit chain.
- Consumers:
  - Evidence panel, Evidence Center, audit packet builders.
- Persistence:
  - localStorage stores (`reg-execution-v2`, `evidence-center-demo-store-v1`).
- Known gaps:
  - dual evidence stores, cloud path mostly target contracts, lifecycle status misalignment.

## 7) Audit entries

- Source:
  - execution actions, eCIGN actions, calendar sync actions.
- Runtime/backend files:
  - `regulatoryExecutionStore.ts` (front-end event execution chain)
  - `server/ecign/hashChain.js`, `server/routes/audit.ts`
  - `server/audit/writer.ts`, `server/audit/routes.ts`
  - `server/sync/auditLog.ts`
- Primary ID:
  - varies by subsystem (`auditId`, chain event ids, etc.).
- Relationships:
  - audit rows reference event/entity/action transitions.
- Consumers:
  - audit pages and validators.
- Persistence:
  - local store + JSONL files in server directories.
- Known gaps:
  - taxonomy differs between subsystems; canonical event map not unified.

## 8) Users and roles

- Source:
  - demo identity data + auth profile + role assignment stores.
- Files:
  - frontend: `src/auth/*`, `src/policy/security/identity/*`
  - backend: `server/auth/service.ts`, `server/routes/auth.ts`
  - infra: `infra/demo-auth-cdk/*`
- Primary ID:
  - email/cognito username/user id depending path.
- Relationships:
  - user -> session -> authorization -> task/approval/audit actors.
- Consumers:
  - protected routing, admin pages, audit actor display.
- Persistence:
  - Cognito + Dynamo (auth), localStorage session client-side.
- Known gaps:
  - multiple auth/identity models between eCIGN headers and auth bearer flows.

## 9) Brad knowledge sources

- Source:
  - runtime context: policy/forms/workflows/events/help/control datasets.
  - IA ingestion source: selected Builder policy/form files.
- Files:
  - `src/services/bradAppContext.ts`
  - `server/ia/ingest/sources.ts`
- Primary IDs:
  - policy/workflow/form/event IDs; article IDs.
- Relationships:
  - Brad responses and references map across multiple corpora.
- Consumers:
  - iAdministrator UI and IA APIs.
- Persistence:
  - static TS runtime context + `.cache/ia-index`.
- Known gaps:
  - runtime context and IA index sources can drift.

## 10) Help center articles

- Source:
  - `src/policy/help/articles/*.ts`
  - `src/policy/data/helpArticles.ts` (structured contextual help)
- Generated output:
  - none required.
- Primary ID:
  - article id string.
- Relationships:
  - article -> policy/event/module references.
- Consumers:
  - Help center pages, contextual bulbs, Brad context.
- Persistence:
  - static TS modules.
- Known gaps:
  - Builder help markdown exists but is not proven as runtime source-of-truth.

## 11) Generated registries

- Sources:
  - workflow compiler and policy/forms generation scripts.
- Files:
  - `src/policy/data/*.generated.ts`
- ID fields:
  - workflowId, policyId, formId, mapping keys.
- Relationships:
  - feed runtime components and selectors.
- Consumers:
  - multiple modules in `src/policy`.
- Persistence:
  - checked-in generated TS files.
- Known gaps:
  - some generated files show low/no runtime usage (Needs confirmation).
