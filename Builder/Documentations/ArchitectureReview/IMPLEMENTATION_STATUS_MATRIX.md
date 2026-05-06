# Implementation Status Matrix

Status legend:

- `Implemented`
- `Partial`
- `Stub`
- `Planned`
- `Not Found`
- `Needs confirmation`

| System | Current status | Runtime files involved | Data sources | User-facing route/page | Backend dependency | Known issues | Recommendation |
|---|---|---|---|---|---|---|---|
| Dashboard | Implemented | `src/policy/pages/DashboardPage.tsx` | events + execution stores | `/dashboard` | optional API | multiple data layers | add source-boundary tests |
| Policy Library | Implemented | `LibraryPage.tsx` | framework/policy datasets | `/library` | no | generated/manual drift | add coverage validation |
| Policy Detail | Implemented | `PolicyDetailPage.tsx` | policy content map | `/library/:policyId` | no | generator overlap risk | canonicalize policy generator |
| Policy Print | Implemented | `PrintPage.tsx` | policy content map | `/print/:policyId` | no | none major | keep print-route tests |
| Forms Library | Implemented | `FormsPage.tsx` | `formsLibraryDataset.ts` | `/forms` | no | build output drift | automate promotion/validation |
| Form Viewer | Implemented | `FormViewer.tsx` | forms content + dataset | `/forms/:formId` | eCIGN optional | complex state paths | add form-state regression tests |
| Form Print | Implemented | `FormPrintView.tsx` | forms content | `/forms/:formId/print` | no | none major | keep stable |
| Workflow Library | Implemented | `WorkflowLibraryApp.tsx` | `workflows.generated.ts` | `/workflows/*` | no | dependency drift | compile validation in CI |
| Workflow Graph | Implemented | workflow components + graph data | `workflowGraph.generated.ts` | `/workflows/*` | no | template usage unclear | prune/confirm unused graph outputs |
| Regulatory Calendar | Implemented | `MasterCalendarPage.tsx` | events + execution state | `/calendar` | `/api/calendar` optional | sync dependencies | calendar sync health checks |
| Event Instance System | Implemented | compliance-execution + store | events + local state | calendar/workflow panels | no required | local persistence only | backend parity plan |
| Task System | Implemented | store + PM/CES components | derived + manual tasks | `/my-tasks`, `/pm/*` | optional | source rule complexity | enforce task schema contracts |
| Evidence Center | Partial | `EvidenceCenterPage.tsx` | demo local store / target API | `/evidence` | target API | lambda disabled by default | explicit mode control + backend readiness gate |
| Evidence Upload | Partial | Evidence panel + center | local metadata, target upload contracts | workflow/evidence pages | target API partial | simulated upload in panel | unify upload behavior |
| Evidence Validation | Stub | center target endpoints | target API contracts | `/evidence` | target API | no local full validator | implement backend validators |
| Evidence Locking | Partial | event lock + statuses | event lock state | workflow/evidence | local store | no unified evidence lifecycle | add explicit evidence lock state model |
| Evidence Audit Trail | Partial | local audit chain + center audit + backend audit | local store + JSONL | audit pages | backend partial | taxonomy mismatch | standardize audit event schema |
| Survey Packet Export | Implemented | `surveyPacket.ts`, `WorkflowExecutionPanel.tsx` | runtime event/form/evidence state | audit/workflow views | no | depends on linkage quality | add completeness assertions |
| Audit Mode | Implemented | `AuditModePage.tsx` | execution + compliance data | `/audit` | optional | depends on local state integrity | add data provenance labels |
| Master Control Inventory | Implemented | `MasterControlInventoryPage.tsx` | synced JSON in `public` | `/compliance/master-controls` | no | triple-copy static file | keep sync script as single source |
| Brad / iAdministrator Query | Implemented | iAdministrator + IA routes | Brad context + IA index | `/iadministrator` | `/api/ia` | dual corpus drift | unify corpus governance |
| Brad / iAdministrator Chat | Implemented | iAdministrator components | runtime context/API | `/iadministrator` | `/api/ia` optional | answer source drift | citation quality checks |
| Brad References | Implemented | iAdministrator components | policy/forms/workflow/help refs | `/iadministrator` | optional | mixed source pathways | reference confidence labeling |
| Help Center / Knowledge Base | Implemented | help pages/articles | TS article modules | `/help/*` | no | Builder markdown mismatch risk | runtime docs ownership policy |
| Guided Tour | Implemented | onboarding overlays/gate | session storage + card data | shell overlay | no | completion tracking nuances | add admin reset control |
| User/Auth System | Implemented | `src/auth/*`, `server/routes/auth.ts` | local session + Cognito flows | auth routes | yes | mixed auth models in app | unify identity enforcement |
| Role/Permission System | Implemented | `src/policy/security/*` | role catalogs + assignments | `/admin/*` | optional | client-driven enforcement paths | backend-backed RBAC expansion |
| AWS API Gateway | Partial | CDK auth stack | infra config | N/A | yes | focused on auth only | expand only after API scope finalized |
| Lambda Functions | Partial | `infra/demo-auth-cdk/lambda/*` | auth request payloads | auth-related | yes | limited domain (auth) | add domain-specific lambdas as planned |
| DynamoDB Metadata | Partial | auth service + lambdas | registration/setup tokens | auth flow | yes | evidence metadata table not confirmed | design unified evidence schema |
| S3 Evidence Storage | Planned | target contracts in frontend | target object keys | evidence routes | target API | not confirmed in local server | implement storage pipeline |
| EventBridge Scheduler | Not Found | N/A (in reviewed runtime path) | N/A | N/A | N/A | docs mention only | add or remove from roadmap explicitly |
| Cognito | Implemented | auth service + CDK | Cognito user pool | auth pages | yes | env sensitivity | add deployment hardening checks |
| Google Calendar Integration | Implemented | calendar API client + routes | event payloads | calendar/workflow | `/api/calendar` | credential/config dependent | integration health diagnostics |
| eCIgn / eSignature | Implemented | FormViewer/eCIGN modules + server routes | form/signature/audit data | form workflows | `/api/ecign` | separate auth/session model | consolidate auth checks |
| Training/Journey | Implemented | `src/policy/journey/*`, onboarding-v2 | journey datasets/stores | `/journey/*`, `/onboarding-v2/*` | optional | broad scope; variable maturity | module-level acceptance tests |
| Sprint Board | Implemented | CES/PM sprint components | projected tasks/events | `/pm/*`, `/ces/board` | optional | data source consistency | enforce single task source |
| Kanban Board | Partial | PM/CES board views | projected tasks | `/ces/board` and PM screens | optional | explicit "kanban" artifact naming limited | clarify board mode taxonomy |
| Gantt View | Needs confirmation | references in PM views | projected timelines | PM module | optional | no dedicated canonical route found | confirm if intended feature or remove claim |
| Dark/Light Mode | Implemented | `uiStore.ts`, `index.css` | localStorage theme state | global | no | none major | keep visual regression checks |
| Responsive Layout | Implemented | shell/pages CSS + breakpoints | runtime viewport | global | no | module-specific mobile gaps | add responsive QA checklist |
