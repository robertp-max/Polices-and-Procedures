# App Inventory and Implementation Reality

## Scope
This inventory assesses what is implemented in runtime code today versus what is seed/demo/script-only. It is based on direct inspection of frontend routes, stores, backend routes, IA services, and build scripts.

## EHR Boundary (Updated)
This platform is not intended to replace the external EHR.

Non-goals:
- Native patient charting system.
- Full clinical record system of record.
- Native medication administration record workflow.
- Native claims submission engine.
- Native clinician scheduling system.

In-scope clinical pattern:
- EHR adapter integration.
- Read-only clinical evidence ingestion.
- Imported/de-identified demo clinical records for simulation.
- Metadata references and document/evidence links.
- OASIS-E2 review assistant, POC draft/review assistant, clinical traceability views, and documentation-gap detection that depend on adapter/imported evidence.

## Runtime Inventory Snapshot

| Capability | Current Reality | Evidence | Notes |
|---|---|---|---|
| App shell + route map | Implemented | `src/App.tsx` | Primary runtime routes are active; includes dashboard, calendar, audit, workflows, forms, iAdministrator, and master controls. |
| Master Control Inventory page | Implemented (read-only seed view) | `src/App.tsx`, `src/policy/pages/MasterControlInventoryPage.tsx`, `src/policy/components/MasterControlInventory.tsx`, `src/policy/data/masterControlInventory.ts` | UI loads dataset from `/Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json`. |
| Policy library + policy details | Implemented | `src/policy/pages/LibraryPage.tsx`, `src/policy/pages/PolicyDetailPage.tsx` | Operational browsing exists. |
| Forms library + form rendering | Implemented | `src/policy/pages/FormsPage.tsx`, `src/policy/components/FormViewer.tsx`, `src/policy/data/formsLibraryDataset.ts` | Large form catalog and renderer are active. |
| Form signature flow | Implemented but demo-profiled | `src/policy/components/FormViewer.tsx`, `src/policy/components/FormSignatureContext.tsx` | Signature flow uses demo session identities and browser-local behavior; not enterprise signer identity. |
| Workflow library browsing | Implemented | `src/policy/workflows/WorkflowLibraryApp.tsx`, `src/policy/workflows/components/LandingView.tsx`, `src/policy/workflows/components/WorkflowDetailView.tsx`, `src/policy/data/workflows.generated.ts` | Library and detail rendering are active. |
| Workflow execution workspace | Partially implemented | `src/policy/components/regulatory/WorkflowDrawer.tsx`, `src/policy/stores/regulatoryExecutionStore.ts`, `src/policy/stores/enforcementStore.ts` | Execution, approvals, evidence, and locks exist, but persistence is localStorage. |
| Calendar sync engine (Google) | Implemented | `server/routes/calendar.ts`, `server/sync/eventSync.ts`, `server/sync/eventStore.ts`, `server/sync/auditLog.ts` | Robust sync layer exists; persistence is local JSON in `.cache`. |
| Hubstaff API proxy | Implemented | `server/routes/hubstaff.ts` | PAT-backed proxy exists for project/task operations. |
| iAdministrator query/chat surface | Implemented | `src/policy/pages/iAdministrator/index.tsx`, `src/policy/pages/iAdministrator/lib/useIa.ts`, `server/ia/routes.ts` | Query + chat + references + sessions endpoints are active. |
| IA operational gap intelligence | Implemented with seed data | `server/ia/operational/service.ts`, `server/ia/operational/seed.ts` | Service explicitly states Phase 1 seed data with future live adapters pending. |
| IA regulatory update intelligence | Implemented with curated seed feed | `server/ia/regulatory/matcher.ts`, `server/ia/regulatory/feed.ts`, `server/ia/responder.ts` | Curated seed updates, no live feed adapter yet. |
| IA phase status/data quality disclosure | Implemented | `server/ia/responder.ts`, `server/ia/session/envelope.ts`, `server/ia/service.ts` | Runtime explicitly marks Phase 1/2 as seed and Phase 3 as not integrated. |
| EHR adapter for clinical evidence | Missing/needed | `server/ia/responder.ts`, `server/ia/session/envelope.ts` | Phase 3 is explicitly not integrated; clinical evidence should be consumed from external EHR, not authored natively. |
| EHR evidence reference model (metadata + links) | Missing/needed | Runtime data model scan (no dedicated EHR evidence reference schema) | Needed to map policy/workflow/event to external clinical evidence artifacts without duplicating EHR records. |
| OASIS-E2/POC traceability assistants | Missing/dependent | Route and component scan (`src/App.tsx`) | Should be built as evidence-linked assistants only, dependent on live EHR adapter or de-identified imported data. |
| Autogen annual schedule (July readiness) | Implemented (local state) | `src/policy/pages/MasterCalendarPage.tsx`, `src/policy/stores/autogenStore.ts`, `src/policy/autogen/annualGenerator.ts` | Preview/commit logic exists; generated events stored in localStorage. |
| Triggered workflow materialization | Engine exists; ingress wiring missing | `src/policy/autogen/triggerEngine.ts`, `src/policy/stores/autogenStore.ts` | `fireTrigger` exists but no active runtime caller found; trigger events are described but not operationally ingested. |
| Survey-day simulation module | Not found as dedicated runtime module | Route scan in `src/App.tsx`; codebase search on survey simulation terms | Survey readiness logic appears in data/scripts/help text, not as a dedicated execution module/page; when added, it must consume EHR evidence and must not become a charting system. |
| Workflow template generated artifact usage | Not wired to runtime scheduling | `scripts/compileWorkflows.ts`, `src/policy/data/workflowTemplates.generated.ts`, `src/policy/stores/autogenStore.ts` | Compiler emits `workflowTemplates.generated.ts`, but scheduling uses `templateRegistry.ts` instead. |
| Forms build pipeline | Scripted/manual | `scripts/formsSystemBuild.ts`, `package.json` | Exists as manual script (`forms:build`), not integrated into build pipeline. |

## Key Observation
The app has substantial operational surface area, but core survey-readiness claims are split across:
1. Runtime UI and stores,
2. Seed/generated data models,
3. Offline scripts and documentation.

This split is the primary source of gap and drift risk.

Clinical-domain expansion should follow an adapter-and-evidence pattern only. Survey simulation, OASIS review, and POC review capabilities should consume external EHR evidence (or de-identified imported records), not create a second clinical system of record.
