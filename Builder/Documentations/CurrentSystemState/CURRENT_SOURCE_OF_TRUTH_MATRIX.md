# Current Source-of-Truth Matrix

Authoritative mapping by domain with duplication/drift flags.

| Domain | Authoritative source now | Generated output | Runtime consumer | Status notes |
|---|---|---|---|---|
| Policies | `Builder/Policies/extracted_full/*.md` + `src/policy/data/policyCorpus.ts` | `src/policy/data/allPoliciesContent.generated.ts` | Library/detail/print pages | Duplicate generation paths; needs canonical script confirmation |
| Policy body content | `allPoliciesContent.generated.ts` + `specimenContent.generated.ts` | N/A (already generated) | `policyContentMap.ts` and policy pages | Implemented |
| Forms metadata | `Builder/Forns/*.txt` (ingestion), `formsLibraryDataset.ts` (runtime current) | `.cache/forms-build/formsLibraryDataset.generated.ts` | forms pages/viewer | Runtime uses checked-in file; build output can drift |
| Form body content | `src/policy/data/formsLibraryContent*.ts` | none | FormViewer | Implemented; manual content maintenance |
| Workflows | `Builder/Policies/Workflows/*-WORKFLOWS.md` | `workflows.generated.ts` | workflow pages/panels | Implemented |
| Workflow graph | workflow source markdown via compiler | `workflowGraph.generated.ts` | workflow graph/Brad/PM modules | Implemented |
| Events | `src/policy/data/regulatoryEvents.ts`, `mandatedEventsExpanded.ts` | none | dashboard/calendar/audit/PM/CES | Implemented |
| Event execution state | `useRegulatoryExecutionStore` persisted `reg-execution-v2` | derived projections in compliance-execution hooks | workflow/event execution UI | Implemented local-first |
| Evidence metadata | `regulatoryExecutionStore.evidence` and Evidence Center demo store | none | Evidence panel/center/audit packet | Dual stores; partial cloud path |
| Evidence files | local metadata-only mock path; target cloud path contracts | target object keys in comments/contracts | Evidence Center target path | Needs confirmation for real backend/object storage |
| Audit log | local execution audit + `server/audit/*` + `server/ecign/*` JSONL | none | audit pages/routes | Multiple audit systems; taxonomy differs |
| Brad corpus | runtime: `bradAppContext` inputs; backend IA ingest from Builder subset | `.cache/ia-index` | iAdministrator UI + `/api/ia` | Two corpus pipelines can diverge |
| Help center articles | `src/policy/help/articles/*.ts` and `src/policy/data/helpArticles.ts` | none | HelpCenter + contextual help + Brad context | Builder markdown copies are docs-only unless wired |
| Users/roles | auth: Cognito+Dynamo via `server/auth/service.ts`; roles: frontend identity stores | none | auth flows + admin pages | Implemented; mixed identity models across modules |
| AWS config | `infra/demo-auth-cdk/lib/demo-auth-stack.ts` + env vars | `infra/demo-auth-cdk/cdk.out/*` | auth lambdas/stack | cdk.out is generated; do not hand-edit |

## Duplicated / stale / needs-confirmation markers

- `frameworkSeed.generated.ts` vs `policyCorpus.ts` overlap requires governance.
- `achcPrintCrosswalk.generated.ts` and some other generated artifacts have no confirmed active runtime consumer.
- `workflowTemplates.generated.ts` appears underused in active route paths (Needs confirmation).
- `public` contains three copies of master control inventory JSON by design via sync script.
- `/api/compliance-execution` client contracts exist but route is not mounted in local Express.
