# Source of Truth Review

Authoritative source review by domain with drift and cleanup recommendations.

| Domain | Authoritative source | Generated output | Runtime consumer | Duplicate/stale sources | Drift risk | Recommended guardrail |
|---|---|---|---|---|---|---|
| Policy metadata | `src/policy/data/policyCorpus.ts` + `frameworkSeed.generated.ts` (shared) | N/A | Library, Brad, framework pages | overlap between corpus and framework seed | Medium/High | define single canonical metadata owner |
| Policy body content | `allPoliciesContent.generated.ts` + `specimenContent.generated.ts` | N/A | policyContentMap + policy pages | generator overlap scripts | Medium | lock canonical generation path |
| Corridor alignment/crosswalks | corridor strategy files + generator input IDs | `corridorAlignment.generated.ts`, CSV | ACHC/alignment modules | strategy docs vs runtime generated output | Medium | script ownership + validation CI |
| Forms metadata | Forns text source; runtime checked-in dataset | `.cache/forms-build/formsLibraryDataset.generated.ts` | Forms pages/viewer | build output vs runtime file | High | enforce promotion/check step |
| Form body content | `formsLibraryContent*.ts` | none | FormViewer | multiple content modules | Medium | content ownership matrix |
| Workflows | Builder workflow markdown | generated workflow files | workflow pages/PM/CES | template file underuse possible | Medium | remove or validate unused outputs |
| Workflow graph | workflow compile output | `workflowGraph.generated.ts` | workflow relations/Brad | none major | Low | keep compile verification |
| Event definitions | `regulatoryEvents.ts`, `mandatedEventsExpanded.ts` | none | calendar/dashboard/execution | potential external script payload duplication | Medium | event source centralization |
| Event instances | `useRegulatoryExecutionStore` state | derived projections | execution/audit views | local-only state | Medium | backend parity roadmap |
| Task definitions | derived from workflows + runtime overrides | derived tasks in state | PM/CES/workflow panels | no single backend authoritative store | Medium | explicit task contract and migration path |
| Task instances | store overrides by event | derived dataflow | same as above | local/browser persistence | Medium | add server-backed source for production |
| Evidence metadata | execution store + evidence center demo store | none | evidence/audit/export UIs | dual stores | High | unify canonical evidence store |
| Evidence files | target cloud object keys (contracts), local metadata-only in demo | none | evidence center target flow | not confirmed local backend implementation | High | implement storage contract + reconcile checks |
| Audit entries | execution local chain + server audit/eCIGN JSONL | none | audit pages/routes | multiple schemas | Medium/High | canonical audit schema |
| Users | Cognito + registration records | none | auth provider, admin pages | local demo identity headers in eCIGN | High | auth model unification |
| Roles | frontend identity catalogs/assignment store | none | admin pages + route guards | client and server role logic may diverge | Medium | backend-authoritative RBAC plan |
| Brad corpus | runtime context datasets + IA index corpus | `.cache/ia-index` | iAdministrator + IA APIs | dual corpus definitions | Medium | corpus manifest and drift checker |
| Help center content | `src/policy/help/articles` + `src/policy/data/helpArticles.ts` | none | help center/contextual help/Brad | Builder markdown copies | Medium | runtime/docs sync ownership |
| Generated docs | `Builder/Documentations/MigratedRepoRoot/docs/` and other `Builder/Documentations` outputs | many generated reports | documentation users only | stale report accumulation | Low/Medium | generated-doc stamp and retention policy |
| AWS config | `infra/demo-auth-cdk` + runtime env vars | `cdk.out` generated | auth backend/lambdas | generated synth output in repo | Medium | do-not-edit generated outputs rule |

## Priority cleanup/guardrails

1. Formalize canonical policy/forms/workflow generation ownership.
2. Unify evidence metadata source and lifecycle model.
3. Add generated artifact manifest with producer/consumer mapping.
4. Separate runtime-critical docs from staging-only Builder artifacts with explicit labels.
