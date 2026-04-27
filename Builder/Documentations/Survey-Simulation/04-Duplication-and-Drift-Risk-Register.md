# Duplication and Drift Risk Register

## Purpose
This register identifies places where implementation reality can diverge from documentation, generated artifacts, or parallel code paths.

## Risk Table

| ID | Risk | Severity | Evidence | Why It Matters | Suggested Control |
|---|---|---|---|---|---|
| DR-01 | Workflow scheduling source split (`templateRegistry.ts` vs generated templates) | High | `src/policy/stores/autogenStore.ts`, `src/policy/autogen/templateRegistry.ts`, `src/policy/data/workflowTemplates.generated.ts`, `scripts/compileWorkflows.ts` | Compiler emits `workflowTemplates.generated.ts`, but scheduler uses hand-authored registry; generated data can drift unnoticed. | Enforce single scheduling source and CI assert on generated/used parity. |
| DR-02 | Master control markdown vs JSON dual artifacts | High | `Builder/Documentations/MASTER_CONTROL_INVENTORY.md`, `Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json`, `src/policy/data/masterControlInventory.ts` | Runtime uses JSON, governance reads markdown; mismatches can produce conflicting truths. | Add schema + ID/count diff checks in CI; define JSON as runtime authority. |
| DR-03 | Runtime model drops verification fields from control source | Medium | `src/policy/types/masterControlInventory.ts`, `src/policy/data/masterControlInventory.ts` | Operational metadata exists but is not surfaced in UI model, reducing audit utility. | Expand `MasterControlItem` projection incrementally. |
| DR-04 | IA operational intelligence marked as “seed” while used in responses | High | `server/ia/operational/service.ts`, `server/ia/operational/seed.ts`, `server/ia/session/envelope.ts`, `server/ia/service.ts` | Representative seed gaps can be interpreted as live fact if governance controls are weak. | Introduce live adapters and hard response label for seed records. |
| DR-05 | IA regulatory update feed is curated seed, not live ingestion | Medium | `server/ia/regulatory/feed.ts`, `server/ia/regulatory/matcher.ts`, `server/ia/responder.ts` | Regulatory freshness risk; response quality depends on manual feed upkeep. | Implement live update ingestion + staleness alarms. |
| DR-06 | Trigger engine exists without active ingestion path | High | `src/policy/autogen/triggerEngine.ts`, `src/policy/stores/autogenStore.ts`, `src/policy/pages/MasterCalendarPage.tsx` | Trigger-only workflows are described but may never materialize operationally. | Add event ingestion adapters and runtime trigger telemetry. |
| DR-07 | Browser-local persistence for critical execution/audit state | High | `src/policy/stores/regulatoryExecutionStore.ts`, `src/policy/stores/enforcementStore.ts`, `src/policy/stores/autogenStore.ts` | LocalStorage is non-authoritative and non-centralized for compliance evidence. | Move critical state to server-side datastore with immutable audit trail. |
| DR-08 | Calendar/hubstaff sync persistence is local file-based | Medium | `server/sync/eventStore.ts`, `server/sync/auditLog.ts`, `server/routes/hubstaff.ts` | Multi-instance and durability limits; file collisions/ops complexity possible. | Migrate to database-backed store and append-only audit sink. |
| DR-09 | Parallel route definitions (`App.tsx` and `PolicyCommandCenterApp.tsx`) | Medium | `src/App.tsx`, `src/policy/PolicyCommandCenterApp.tsx`, `src/main.tsx` | Unused route map can become stale and confuse maintenance/integration. | Consolidate to one authoritative route file or annotate legacy status. |
| DR-10 | Backup/old page files adjacent to active routes | Medium | `src/policy/pages/TaxonomyPage.old.tsx`, `src/policy/pages/DashboardPage.tsx.backup`, `src/policy/pages/MasterCalendarPage.tsx.backup` | High chance of accidental edits to wrong file and future merge confusion. | Archive outside active source tree or remove after approval. |
| DR-11 | Unreferenced temp payload files in repo root | Low | `tmp-billing.json`, `tmp-e1.json`, `tmp-e2.json`, `tmp-edge*.json`, `tmp-form.json`, `tmp-payload.json` | Noise + mistaken dependence risk + accidental stale data usage. | Move to dedicated transient folder or git-ignore temporary payloads. |
| DR-12 | Manual generation scripts not tied to build/CI | High | `package.json`, `scripts/compileWorkflows.ts`, `scripts/formsSystemBuild.ts` | Generated datasets can become stale if scripts are not run consistently. | Add prebuild/CI generation + drift checks + hash stamping. |
| DR-13 | Scope creep into full native EHR features | High | Current roadmap expansion pressure in clinical domain | Building charting/claims/MAR/scheduling modules would fragment authority with the external EHR and create compliance risk. | Enforce architecture guardrail: adapter + read-only evidence pattern only. |
| DR-14 | OASIS/POC features built without evidence-source dependency | High | OASIS/POC feature direction without adapter requirement | Standalone authoring features can become shadow records if not tied to EHR evidence ingestion/de-identified imports. | Require EHR adapter or de-identified import source contract before enabling OASIS/POC production workflows. |

## Highest Priority Drift Controls
1. Resolve DR-01 (workflow scheduling source split).
2. Resolve DR-02 (master control dual artifact governance).
3. Resolve DR-07 (operational/audit state central persistence).
4. Resolve DR-12 (automated generation and validation pipeline).
5. Resolve DR-13/DR-14 (EHR boundary enforcement and evidence-source dependency).
