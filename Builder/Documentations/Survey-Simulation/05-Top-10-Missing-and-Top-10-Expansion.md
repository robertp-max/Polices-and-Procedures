# Top-10 Missing Components and Top-10 Components Needing Expansion

## Top-10 Missing Components (Not Implemented or Effectively Absent)

| Rank | Missing Component | Why It Is Missing | Evidence |
|---|---|---|---|
| 1 | Live EHR adapter for IA Phase 3 | IA explicitly reports Phase 3 not integrated. | `server/ia/responder.ts`, `server/ia/session/envelope.ts` |
| 2 | EHR evidence reference model (metadata + links) | No explicit model found to map policy/workflow/event to external clinical evidence references. | Runtime model scan |
| 3 | OASIS-E2 review assistant (evidence-linked) | No dedicated assistant exists; should be adapter/import-data dependent. | `src/App.tsx`, route/component scan |
| 4 | POC draft/review assistant (evidence-linked) | No dedicated assistant exists; should be adapter/import-data dependent. | `src/App.tsx`, route/component scan |
| 5 | Clinical record traceability view | No dedicated view mapping regulatory events to EHR evidence objects. | `src/App.tsx`, runtime view scan |
| 6 | Documentation gap detector against imported clinical evidence | No gap-detector pipeline found tied to EHR evidence ingestion. | Runtime/service scan |
| 7 | Dedicated survey simulation runtime module/workspace | No dedicated route/module for end-to-end survey day simulation execution state. | `src/App.tsx`, codebase route scan |
| 8 | Centralized operational datastore for workflow execution evidence | Critical execution state currently browser-local. | `src/policy/stores/regulatoryExecutionStore.ts`, `src/policy/stores/enforcementStore.ts` |
| 9 | Runtime trigger ingestion pipeline (incident/complaint/sentinel connectors) | Trigger engine exists but no active signal ingestion wiring found. | `src/policy/autogen/triggerEngine.ts`, `src/policy/stores/autogenStore.ts` |
| 10 | Immutable evidence object storage + retention controls | Evidence is represented in local state and metadata, not immutable object storage. | `src/policy/stores/regulatoryExecutionStore.ts` |

## Top-10 Components Needing Expansion (Implemented but Not Yet Audit-Grade)

| Rank | Component to Expand | Current State | Expansion Needed | Evidence |
|---|---|---|---|---|
| 1 | Regulatory execution + enforcement stores | Rich logic exists, but localStorage persistence limits authority. | Server-side persistence, immutable audit records, actor identity binding. | `src/policy/stores/regulatoryExecutionStore.ts`, `src/policy/stores/enforcementStore.ts` |
| 2 | IA operational intelligence | Operational gaps are seed records with explicit phase caveats. | Live adapters, confidence policy tied to source freshness, and explicit EHR-evidence provenance labels. | `server/ia/operational/service.ts`, `server/ia/operational/seed.ts` |
| 3 | IA regulatory intelligence | Curated seed feed used for updates. | Live ingestion/parsing pipeline and recency guarantees. | `server/ia/regulatory/feed.ts`, `server/ia/regulatory/matcher.ts` |
| 4 | Master Control Inventory UI model | Source has rich fields, UI projection is reduced. | Surface verification dates, trigger conditions, escalation owners, module lineage. | `src/policy/types/masterControlInventory.ts`, `src/policy/data/masterControlInventory.ts` |
| 5 | Calendar sync subsystem | API and sync engine are strong but local file-backed. | DB-backed store, robust ops telemetry, multi-instance safe locking. | `server/routes/calendar.ts`, `server/sync/eventStore.ts`, `server/sync/auditLog.ts` |
| 6 | Workflow library | Excellent browse/detail UX over generated data. | Execution integration, stateful runbooks, direct completion/evidence hooks, and references to linked EHR evidence artifacts. | `src/policy/workflows/components/LandingView.tsx`, `src/policy/workflows/components/WorkflowDetailView.tsx` |
| 7 | Survey simulation workspace | Not yet implemented as a dedicated module. | Build as evidence-consumption and packet-assembly workflow; do not add native EHR authoring modules. | `src/App.tsx` |
| 8 | Forms system build process | Ingestion and reconciliation script exists but manual. | Scheduled build + validation + publish pipeline into runtime datasets. | `scripts/formsSystemBuild.ts`, `package.json` |
| 9 | IA session store | In-memory with optional JSON-file persistence. | Durable transactional storage and lifecycle controls for production. | `server/ia/session/store.ts` |
| 10 | Source artifact governance | Multiple generated/docs artifacts and backup files coexist. | Clear authority labels, retirement policy for stale artifacts, drift checks, and EHR-boundary architecture checks in review gates. | `src/policy/PolicyCommandCenterApp.tsx`, `src/policy/pages/*.backup`, `src/policy/pages/*.old.tsx` |

## EHR Boundary Constraint
The missing/expansion list intentionally avoids recommending a native replacement EHR. Clinical-domain additions should be assistants and evidence-traceability tools that consume external EHR data via adapters, de-identified imports, and metadata links.

## Single Most Important Next Move
Start with a **data authority + EHR-boundary hardening sprint**:
1. Choose authoritative sources per subsystem.
2. Enforce generation/validation in CI.
3. Establish adapter-driven clinical evidence ingestion with an explicit EHR evidence reference model.
4. Move critical execution state from local/file storage to centralized persistence.

This unlocks credible survey-readiness simulation and prevents evidence drift across UI, scripts, and documentation.
