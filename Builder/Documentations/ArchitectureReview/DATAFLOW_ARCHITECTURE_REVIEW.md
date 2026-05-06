# Dataflow Architecture Review

Review of current dataflow implementation with broken/duplicated/unclear flow markers.

## 1) Policy dataflow

```mermaid
flowchart LR
  P1[Builder/Policies/extracted_full] --> P2[policy generation scripts]
  P2 --> P3[src/policy/data/allPoliciesContent.generated.ts]
  P3 --> P4[policyContentMap.ts]
  P4 --> P5[Library/PolicyDetail/Print pages]
```

- Broken/unclear:
  - two policy generation scripts overlap responsibilities.
- Duplicated:
  - policy metadata exists in multiple runtime files (`policyCorpus.ts`, `frameworkSeed.generated.ts`).

## 2) Form dataflow

```mermaid
flowchart LR
  F1[Builder/Forns/*.txt] --> F2[scripts/formsSystemBuild.ts]
  F2 --> F3[.cache/forms-build/formsLibraryDataset.generated.ts]
  F3 -.manual sync required.-> F4[src/policy/data/formsLibraryDataset.ts]
  F4 --> F5[FormsPage/FormViewer]
```

- Broken:
  - no guaranteed automated promotion from `.cache` artifact to runtime dataset.

## 3) Workflow dataflow

```mermaid
flowchart LR
  W1[Builder/Policies/Workflows/*.md] --> W2[scripts/compileWorkflows.ts]
  W2 --> W3[workflows.generated.ts]
  W2 --> W4[workflowGraph.generated.ts]
  W2 --> W5[workflowTemplates.generated.ts]
  W2 --> W6[formTitles.generated.ts]
  W3 --> W7[Workflow runtime pages/panels]
  W4 --> W7
  W6 --> W7
```

- Unclear:
  - `workflowTemplates.generated.ts` active usage scope needs confirmation.

## 4) Event/task dataflow

```mermaid
flowchart TD
  E1[regulatoryEvents.ts + mandatedEventsExpanded.ts] --> E2[regulatoryExecutionStore]
  E2 --> E3[derive tasks/forms/instances]
  E3 --> E4[calendar/workflow/PM/CES pages]
  E3 --> E5[audit checklist and certification]
```

- Implemented local-first.
- Risk:
  - backend parity with local execution state is partial.

## 5) Evidence dataflow

```mermaid
flowchart TD
  V1[EvidencePanel upload action] --> V2[local EvidenceDoc write]
  V2 --> V3[task/event evidence rollups]
  V2 --> V4[local execution audit chain]
  V3 --> V5[survey packet export]
  V6[EvidenceCenter upload flow] --> V7[target init/validate/promote API contracts]
  V6 --> V8[demo local store when LAMBDA_DISABLED]
```

- Broken:
  - dual store model can diverge.
- Unclear:
  - target endpoint implementation in local backend not found.

## 6) Brad dataflow

```mermaid
flowchart LR
  B1[src datasets: policy/forms/workflows/events/help] --> B2[buildBradAppContext]
  B2 --> B3[iAdministrator frontend runtime]
  B4[Builder selected corpus files] --> B5[server/ia ingest/index]
  B5 --> B6[.cache/ia-index]
  B6 --> B7[/api/ia query responses]
```

- Duplicate/unclear:
  - two knowledge pipelines can return different grounding.

## 7) AWS/serverless dataflow

```mermaid
flowchart LR
  A1[Auth requests] --> A2[server/routes/auth.ts]
  A2 --> A3[DemoAuthService]
  A3 --> A4[Cognito]
  A3 --> A5[DynamoDB]
  A3 --> A6[SES]
  A7[CDK stack/lambdas] --> A4
  A7 --> A5
  A7 --> A6
```

- Implemented:
  - auth serverless path.
- Not implemented in reviewed local server:
  - full compliance-execution/evidence API route group.

## 8) Print/export dataflow

```mermaid
flowchart LR
  X1[Workflow/Audit state] --> X2[surveyPacket.ts builders]
  X2 --> X3[Markdown/HTML packet output]
  X3 --> X4[user download via browser]
  X5[Policy/Form print routes] --> X6[print views]
```

- Implemented frontend export path.
- Gap:
  - backend immutable export pipeline not confirmed.

---

## Broken, Duplicated, or Unclear Flows Summary

- Broken:
  - awsRemote compliance-execution API flow unresolved in local server.
  - forms `.cache` build output can drift from runtime dataset.
- Duplicated:
  - master control JSON mirrored to three `public` paths.
  - Brad runtime context and IA corpus indexing pipelines.
- Unclear:
  - ownership and runtime necessity of some generated artifacts.
  - canonical policy generation script choice.
