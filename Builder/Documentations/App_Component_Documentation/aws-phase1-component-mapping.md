# AWS Phase 1 Component Mapping

**Date:** 2026-04-23
**Scope:** Maps every major app component to its current implementation state and the AWS Phase 1 target architecture. No backend AWS code is implemented in the repo yet — all AWS-side items are PLANNED documentation unless explicitly noted.

---

## Legend

| Status | Meaning |
|---|---|
| `NOT STARTED` | Exists as local/static/localStorage prototype; no AWS work begun |
| `IN PROGRESS` | AWS work is under active design or partial scaffolding |
| `IMPLEMENTED` | Component is running against real AWS backend |

All AWS-side items are **NOT STARTED** unless noted otherwise.

---

## Full Component → AWS Phase 1 Mapping Table

| Component / Module | Current State | AWS Phase 1 Target | AWS Services | Status |
|---|---|---|---|---|
| `regulatoryExecutionStore` | Zustand + localStorage (`reg-execution-v2`). Single-browser scope. | API-backed persistence per authenticated user/session. State writes call Lambda; reads hydrate from DynamoDB. | DynamoDB (`compliance_objects` table), Lambda `workflow-runner`, API Gateway | NOT STARTED |
| Regulatory event catalog (`regulatoryEvents.ts`, `mandatedEventsExpanded.ts`) | Static TS datasets bundled at build time. No runtime update path. | EventBridge Scheduler triggers `mandated-event-generator` Lambda to write canonical event items; frontend reads from Lambda `metadata-api`. | DynamoDB (`WORKFLOW#` / `EVENT#` item patterns), EventBridge Scheduler, Lambda `mandated-event-generator` | NOT STARTED |
| Calendar sync (`server/sync/eventSync.ts`) | Express-based Google Calendar push/pull. Filesystem audit log. JSONL under `.cache/audit/`. | Serverless calendar integration or direct DynamoDB event writes; audit stream to S3 `prod/audit/` prefix. | Lambda, S3 audit prefix, DynamoDB audit items | NOT STARTED |
| Workflow library (compiled, `workflows.generated.ts`) | Static generated TS. Updated by `scripts/compileWorkflows.ts` at dev time. | Workflow metadata served from DynamoDB; workflow execution state tracked per event/user. | DynamoDB workflow items, Lambda `workflow-runner` | NOT STARTED |
| `policyStore` (draft/review/publish lifecycle) | Zustand in-memory. Lifecycle mutations are client-only. No server state. | Policy metadata and lifecycle in DynamoDB. Publish pipeline writes approved policy body to S3 evidence/forms prefix. | DynamoDB (`POLICY#META`), S3 `prod/evidence/{policy_id}/` | NOT STARTED |
| `FORMS_DATASET` + `FormViewer` + print system | Static TS datasets. Print is browser-native (iframe + `window.print()`). No durable PDF generation. | Forms metadata in DynamoDB. Filled form instances saved via Lambda upload flow; generated PDFs stored in S3 `forms/` prefix. | DynamoDB form metadata items, S3 `hh-prd-forms`, Lambda `upload-init` + `upload-validate-promote` | NOT STARTED |
| Master Control Inventory | Static JSON fetched from `/Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json`. | MCI records as DynamoDB items keyed `MCI#{control_id}`; served by `metadata-api` Lambda. | DynamoDB, Lambda `metadata-api` | NOT STARTED |
| Onboarding / Journey system (`journeyStore`) | Zustand + localStorage (`ci-journey-v1`). Evidence and signatures are client metadata. | API-backed progression, immutable sign-off records, evidence object store. Identity-bound via Cognito. | DynamoDB (`USER#`, `ONBOARDING#`, `SIGNOFF#`, `VISIT#`, `EVIDENCE#`), S3, Cognito | NOT STARTED |
| `DashboardPage` aggregation | Reads from multiple local Zustand stores and static event catalog. No real-time server data. | Reads from `metadata-api` Lambda which queries DynamoDB GSI1 (event-centric) for live status. | Lambda `metadata-api`, DynamoDB GSI1 | NOT STARTED |
| `AuditModePage` + audit modules | Client-side audit state classification. Export via browser download (JSON/Markdown). Enforcement audit log in localStorage. | Audit log items in DynamoDB append-only (`AUDIT#` items). Export via Lambda `export-zip` → S3 `exports/` → presigned GET URL. | DynamoDB audit items, Lambda `export-zip`, S3 `hh-prd-exports` | NOT STARTED |
| Brad iAdministrator (`server/ia/*`) | Local Express server + Ollama LLM. File-based IA index (`.cache/ia-index`). Session data in-process. | Lambda-backed RAG service or managed inference API. Index in S3. Session metadata in DynamoDB. | S3 index bucket, DynamoDB session items, Lambda or managed LLM endpoint | NOT STARTED |
| `/api/calendar` routes | Express router, `routes/calendar.ts`. Google Calendar integration. | API Gateway HTTP API + Lambda handler. Auth via Cognito JWT. | API Gateway, Lambda, Cognito | NOT STARTED |
| `/api/hubstaff` routes | Express proxy to Hubstaff REST API. PAT-auth. | Lambda proxy or direct webhook integration. | Lambda, API Gateway | NOT STARTED |
| `/api/ia` routes | Local Express + SSE streaming. No external auth. | API Gateway + Lambda with SSE via HTTP API streaming or WebSocket. Cognito-gated. | API Gateway (HTTP API / WebSocket), Lambda, Cognito | NOT STARTED |
| Navigation / session state (`navStore`, `useShellStore`) | Client-only Zustand stores. Not persisted to any server. | No immediate AWS requirement. Phase 1 does not require server-side session nav state. | N/A (client-only, no server target in Phase 1) | N/A |
| Evidence upload path | No blob upload exists today. `EvidenceDoc` is metadata-only in Zustand stores. | Lambda `upload-init` returns presigned PUT URL → S3 sandbox upload → Lambda `upload-validate-promote` copies to production bucket. | S3 `hh-sbx-uploads`, `hh-prd-evidence`, Lambda `upload-init` + `upload-validate-promote`, DynamoDB file items | NOT STARTED |
| Presigned evidence download | Not implemented. | Lambda `export-zip` / metadata-api returns short-lived presigned GET URL for each evidence file. | S3, Lambda, IAM presigned URL | NOT STARTED |
| Identity / auth | Optional shared-secret `Bearer` token on Express API. No user identity in app. | Cognito User Pool. JWT passed to API Gateway. Groups map to app roles. | Cognito User Pool + App Client, API Gateway JWT authorizer | NOT STARTED |
| Audit logging (server) | Filesystem JSONL under `.cache/audit/`. | Append-only DynamoDB `AUDIT#{event_id}` items with time-sorted SK. Optional hash chain. Lifecycle: never expire for compliance evidence. | DynamoDB, CloudWatch Logs | NOT STARTED |

---

## Identified Gaps

1. **R2 vs AWS S3 plan conflict** — `R2_STORAGE_ARCHITECTURE.md` describes 6 Cloudflare R2 buckets + SQL index; `AWS_Phase1_Foundation_Build_Plan.md` describes 2 AWS S3 buckets + DynamoDB. These are parallel but incompatible designs. Phase 1 must pick one. *Needs confirmation.*
2. **User profile and onboarding item patterns missing from DynamoDB model** — Phase 1 DynamoDB design (in `AWS_Phase1_Foundation_Build_Plan.md`) specifies `POLICY#`, `WORKFLOW#`, `EVENT#`, `FILE#`, and `AUDIT#` patterns but does not include `USER#`, `ONBOARDING#`, `SIGNOFF#`, or `VISIT#`. These need to be added before onboarding migration begins.
3. **Supervisor sign-off as DynamoDB item type** — No canonical item type defined for supervisor signature attestation. Currently captured in `journeyStore` as `SignatureRecord`. Must be designated as `SIGNOFF#` sub-type or folded into `EVIDENCE#`. *Needs confirmation.*
4. **`upload_sessions` secondary table** — Architecture diagram references `DynamoDB: upload_sessions` but the key schema for this table is not defined. Could be a second table or same-table `UPLOAD#` item pattern. *Needs confirmation.*
5. **Brad/IA migration complexity** — The iAdministrator system is the most complex migration because it combines local LLM (Ollama), file-based vector index, and SSE streaming. Phase 1 should defer this to a separate sub-track. Consider managed embedding API + DynamoDB/S3 index store before committing to full Lambda LLM hosting.
6. **No CI/CD pipeline for Lambda deploys defined** — Phase 1 docs describe architecture but no deployment pipeline is specified. *Needs confirmation.*

---

## Component Dependencies (implementation ordering)

Phase 1 must proceed in this order to avoid blocking dependencies:

```
1. Identity (Cognito)
   └─► All other components depend on authenticated user identity

2. DynamoDB table + GSI design
   └─► Required before any Lambda can write items

3. API Gateway + Lambda baseline (metadata-api)
   └─► Foundation for all frontend API calls

4. Evidence upload path (upload-init + upload-validate-promote)
   └─► Needed before regulatory event execution can store real evidence

5. Regulatory event catalog migration
   └─► Seeds DynamoDB; enables live event-centric queries

6. regulatoryExecutionStore → API-backed
   └─► Replaces localStorage execution state; depends on event catalog items

7. AuditModePage → server-side audit log
   └─► Depends on DynamoDB audit items being written by Lambda

8. Onboarding / Journey → API-backed
   └─► Depends on identity (Cognito) + evidence upload path + DynamoDB user items

9. policyStore → API-backed
   └─► Can proceed in parallel with items 5–8 once DynamoDB is ready

10. Brad iAdministrator → deferred to Phase 1b or Phase 2
    └─► Highest complexity; local Ollama model replacement requires separate planning
```

---

## Required Implementation Order (Priority List)

| Priority | Component | Blocking Dependency | Estimated Complexity |
|---|---|---|---|
| 1 | Cognito identity + JWT auth | None | Medium |
| 2 | DynamoDB table + GSI design | Cognito | Low |
| 3 | Lambda `metadata-api` | DynamoDB | Medium |
| 4 | Lambda `upload-init` + `upload-validate-promote` | DynamoDB + S3 | High |
| 5 | Regulatory event catalog in DynamoDB | `metadata-api` | Medium |
| 6 | `regulatoryExecutionStore` → API | Event catalog | High |
| 7 | Audit log (DynamoDB `AUDIT#`) | Lambda + DynamoDB | Medium |
| 8 | Onboarding / Journey state → API | Identity + upload path | High |
| 9 | `policyStore` → API | DynamoDB + `metadata-api` | Medium |
| 10 | Forms filled-instance storage | Upload path | Medium |
| 11 | Export-zip Lambda | Audit + evidence | Medium |
| 12 | Brad IA migration | All above stable | Very High |

---

## Alignment Notes

- The current frontend app is a **rich client prototype** with Zustand stores, static TS data, and a narrow local Express backend. All AWS Phase 1 targets are additive; the prototype continues to function as the client.
- No existing source files are deleted in Phase 1. API calls are layered in as store action replacements.
- `navStore` and shell state stores are **client-only** and have no AWS Phase 1 impact.
- Docs above reflect confirmed architectural intent from `AWS_Phase1_Foundation_Build_Plan.md` and `R2_STORAGE_ARCHITECTURE.md`. Differences between the two docs are flagged in the Gaps section above.
