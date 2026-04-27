# A-F System Categorization Matrix

## Legend
- **A**: Operational in current runtime path for intended scope.
- **B**: Operational but constrained by local/file persistence or deployment limitations.
- **C**: Operational UI/API path, but materially seed/demo-backed.
- **D**: Foundational engine exists; critical runtime connectors are missing.
- **E**: Script/doc/generated artifact exists but is not an authoritative runtime path.
- **F**: Capability is effectively missing from runtime implementation.

## EHR Boundary Note
Clinical expansion is evaluated under an external-EHR assumption. Full native EHR functions (charting, full records, MAR, claims, and scheduling) are out of scope. In-scope capabilities are adapters, read-only evidence ingestion, de-identified imports, and metadata-linked traceability.

## Matrix

| System | Grade | Reason | Evidence |
|---|---|---|---|
| Route map and core shell | A | Main app routes are active and reachable for policy, form, calendar, workflow, and IA surfaces. | `src/App.tsx` |
| Master Control Inventory viewer | A | End-to-end fetch + mapping + UI table/detail view is live. | `src/policy/data/masterControlInventory.ts`, `src/policy/components/MasterControlInventory.tsx` |
| Policy library browsing | A | Policy browsing/detail routes and data rendering are implemented. | `src/policy/pages/LibraryPage.tsx`, `src/policy/pages/PolicyDetailPage.tsx` |
| Forms library + renderer | A | Forms dataset and renderer are active and route-mounted. | `src/policy/pages/FormsPage.tsx`, `src/policy/components/FormViewer.tsx` |
| Workflow library browsing | A | Generated workflow catalog and detail viewing are implemented. | `src/policy/workflows/WorkflowLibraryApp.tsx`, `src/policy/workflows/components/LandingView.tsx` |
| Regulatory execution state machine | B | Rich execution lifecycle exists (steps/forms/evidence/approvals/certification), but persistence is browser-local. | `src/policy/stores/regulatoryExecutionStore.ts`, `src/policy/stores/enforcementStore.ts` |
| Calendar sync subsystem | B | API + sync engine + audit exist, but store/audit persistence is local JSON files under `.cache`. | `server/routes/calendar.ts`, `server/sync/eventStore.ts`, `server/sync/auditLog.ts` |
| IA query/chat API and UI | B | Full request/streaming/session flow exists but remains local-runtime oriented and not multi-instance hardened. | `src/policy/pages/iAdministrator/lib/iaClient.ts`, `server/ia/routes.ts`, `server/ia/session/store.ts` |
| Autogen annual schedule projection | B | July readiness preview/commit works, but generated state is localStorage and not centrally persisted. | `src/policy/pages/MasterCalendarPage.tsx`, `src/policy/stores/autogenStore.ts` |
| Form signature flow | C | Works in UI, but modeled as demo/internal attestation with demo identities and no production trust chain. | `src/policy/components/FormViewer.tsx`, `src/policy/components/FormSignatureContext.tsx` |
| IA operational gap intelligence | C | Explicitly phase-marked seed data. | `server/ia/operational/service.ts`, `server/ia/operational/seed.ts` |
| IA regulatory update awareness | C | Curated seed feed; live adapter pending. | `server/ia/regulatory/feed.ts`, `server/ia/responder.ts` |
| Trigger event engine | D | Trigger materialization logic exists but no active signal-ingestion wiring/caller found in runtime. | `src/policy/autogen/triggerEngine.ts`, `src/policy/stores/autogenStore.ts` |
| Survey simulation engine/module | F | No dedicated survey simulation route/module/workspace found; when implemented it should consume EHR evidence and remain non-EHR. | `src/App.tsx`, codebase search results |
| Live EHR adapter + read-only clinical evidence ingestion | F | Explicitly flagged as Phase 3 not integrated. | `server/ia/responder.ts`, `server/ia/session/envelope.ts` |
| EHR evidence reference model | F | No dedicated model was found to map policy/workflow/event context to external clinical evidence links and metadata. | Runtime model scan |
| OASIS/POC evidence traceability assistants | F | No dedicated assistant workspace found; should depend on EHR adapter or de-identified imported data. | `src/App.tsx`, route/component scan |
| Workflow template generated file in scheduler path | D | Compiler emits template artifact, but runtime scheduler uses hand-authored template registry instead. | `scripts/compileWorkflows.ts`, `src/policy/stores/autogenStore.ts` |
| Master control markdown narrative as runtime source | E | Present as documentation artifact; runtime consumes JSON model, not markdown. | `Builder/Documentations/MASTER_CONTROL_INVENTORY.md`, `src/policy/data/masterControlInventory.ts` |
| Forms source-to-runtime reconciliation | E | Builder/Forns ingestion exists as manual script; not integrated into build/CI. | `scripts/formsSystemBuild.ts`, `package.json` |
| Alternate route shell (`PolicyCommandCenterApp`) | E | Duplicate/parallel route declaration exists but app entry uses `App.tsx`. | `src/policy/PolicyCommandCenterApp.tsx`, `src/main.tsx` |
| Backup/temporary artifacts | E | Backup route files and root temp JSON payload files are present and unreferenced. | `src/policy/pages/TaxonomyPage.old.tsx`, `src/policy/pages/DashboardPage.tsx.backup`, `src/policy/pages/MasterCalendarPage.tsx.backup`, `tmp-*.json` |

## Readout
Most critical survey-readiness risk is not lack of screens; it is **data authority and execution durability**:
1. Seed/demo reliance in IA and readiness views.
2. Local/file persistence for operational state.
3. Missing ingestion connectors for triggered events and live systems.
4. Missing EHR evidence adapter/reference layer for clinical traceability without EHR replacement.
