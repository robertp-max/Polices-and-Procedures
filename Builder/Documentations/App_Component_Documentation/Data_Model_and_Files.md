# Data Model and Files

## 1) Core Runtime Data Structures

## Forms

### `FormRecord` (`src/policy/data/formsLibraryDataset.ts`)

- `id: string` (form ID, e.g., `GV-FM-003`)
- `name: string`
- `type: string`
- `policies: string[]` (many-to-many linkage: form -> policy IDs)
- `domainCode: string`
- `usage: string`
- `frequency: string`
- `classifications: string[]`

### `FormContent` model (`src/policy/data/formsLibraryContent.ts`)

- `id`, `title`, `type`, `domainCode`, `policies`
- `purpose`, `instructions`
- `version`, `effectiveDate`, `revisionDate`
- `orientation: 'portrait' | 'landscape'`
- `sections: FormSection[]`
- optional `signatures`, `footerNotes`

Section/field contracts:
- `FormSection.layout` supports `grid`, `table`, `checklist`, `attestation`, `narrative`, `matrix`, `signature`.
- `FormField.type` supports text/date/select/checkbox/radio/textarea/number/signature/email/tel.

## Policies

### Policy content map (`src/policy/data/policyContentMap.ts`)

- Exposes `getPolicyBody(policyId)` and `getPolicyContent(policyId)`.
- Current map shape is `Record<string, PolicyContent>`.
- Seeded from generated `specimenContent.generated.ts`.

### Policy state (`src/policy/stores/policyStore.ts`)

- `policies: Policy[]`
- `versions: PolicyVersion[]`
- `assignments: PolicyAssignment[]`
- `publishJobs: PublishJob[]`
- `auditTrail: AuditTrailEvent[]`

Lifecycle operations:
- `setLifecycleStatus(...)`
- `beginDraftEdit(...)`
- `createPublishJob(...)`

## Regulatory events and execution

### `RegulatoryEvent` (`src/policy/data/regulatoryEvents.ts`)

Key fields:
- `id`, `title`, `domain`, `date`, `cadence`, `urgency`
- `policyRefs: string[]` (event -> policy linkage)
- `processFlow: EventProcessStep[]`
- `requiredForms: EventEvidenceItem[]` (event -> form linkage)
- optional `minutes`, `helpArticle`, `regulatoryDriver`
- optional standardized extensions: `agenda`, `approvals`, `complianceFlags`, `followUps`, `dependencies`, `sourceOfTruth`, `mandateType`

### Execution state (`src/policy/stores/regulatoryExecutionStore.ts`)

- Form, step, minutes, evidence, approvals, notes, completion, certification state keyed by `eventId`.
- Includes validation, completion, certification, lock-aware mutation guards.

## Workflows

### Canonical workflow types (`src/policy/types/workflow.ts`)

- `Workflow`: compiled 13-section workflow contract with computed metrics.
- `WorkflowStep`, `WorkflowTrigger`, `WorkflowRoles`, `WorkflowApproval`, `WorkflowCadence`.
- `WorkflowGraph`: reverse indices by form/policy/role/domain/regulation + downstream adjacency.
- `WorkflowTemplate`: projection for event autogen integrations.

Generated workflow files:
- `workflows.generated.ts`
- `workflowGraph.generated.ts`
- `workflowTemplates.generated.ts`
- `formTitles.generated.ts`

## Master control inventory

### Source payload (`src/policy/types/masterControlInventory.ts`)

- Source model: `MasterControlSourceRecord` from JSON payload.
- Runtime model: `MasterControlItem`.
- Mapping normalizes:
  - risk level (`H/M/L` -> `HIGH/MATERIAL/LOW`)
  - status (`COMPLIANT/AT_RISK/...` -> `active/deficient/unknown`)

Loader:
- `loadMasterControlInventorySeed()` fetches `MASTER_CONTROL_INVENTORY_DATA_MODEL.json`.

---

## 2) Generated, Static, and Seed Files

## Generated files (frontend)

- `src/policy/data/frameworkSeed.generated.ts`
- `src/policy/data/specimenContent.generated.ts`
- `src/policy/data/workflows.generated.ts`
- `src/policy/data/workflowGraph.generated.ts`
- `src/policy/data/workflowTemplates.generated.ts`
- `src/policy/data/formTitles.generated.ts`

## Static datasets

- `src/policy/data/formsLibraryDataset.ts`
- `src/policy/data/formsLibraryContent.ts`
- `src/policy/data/formsLibraryContentHR_CL.ts`
- `src/policy/data/formsLibraryContentCO_More.ts`
- `src/policy/data/formsCatalog.ts`
- `src/policy/data/regulatoryEvents.ts`
- `src/policy/data/mandatedEventsExpanded.ts`
- `src/policy/data/helpArticles.ts`
- `src/policy/data/hubstaffTasks.ts`
- `src/policy/data/masterControlInventory.ts`

## Build/cache outputs

- `.cache/forms-build/canonical-forms.json`
- `.cache/forms-build/formsLibraryDataset.generated.ts`
- `.cache/forms-build/policy-to-forms.json`
- `.cache/forms-build/reconciliation.json`
- `.cache/forms-build/RECONCILIATION_REPORT.md`
- `.cache/ia-index/manifest.json`
- `.cache/ia-index/docs.json`
- `.cache/ia-index/docs-content.json`
- `.cache/ia-index/chunks.json`

---

## 3) Relationship Map (Many-to-Many and Cross-System)

## Policy ↔ Forms

- Primary mapping source: `FormRecord.policies: string[]` in `FORMS_DATASET`.
- Validation script: `scripts/verifyPolicyCoverage.ts`.
- Relationship type: many policies can require one form; one form can link many policies.

## Workflow ↔ Forms

- Workflow step-level: `WorkflowStep.formIds: string[]`
- Workflow-level: `Workflow.requiredForms: string[]`
- Graph index: `WORKFLOW_GRAPH.byForm`

## Workflow ↔ Policies

- Workflow references: `Workflow.policyRefs: string[]`
- Graph index: `WORKFLOW_GRAPH.byPolicy`

## Events ↔ Forms

- Event required forms: `RegulatoryEvent.requiredForms[].formId`
- Execution state tracks form completion per event/form key.

## Events ↔ Policies

- Event-level policy references: `RegulatoryEvent.policyRefs`.

## Master Controls ↔ Policies

- `MasterControlItem.sourcePolicyIds: string[]`
- Source file path: `Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json`

## Brad IA ↔ Corpus Data

- Ingest source roots: `Builder/`, `Builder/Policies/`, `Builder/Forns/`.
- Indexed output: `.cache/ia-index/*`.

---

## 4) Where Data Is Stored and Loaded

- **Frontend memory/persistence**
  - Zustand stores in browser memory, several persisted to localStorage.
  - `regulatoryExecutionStore` persists under `reg-execution-v2`.
- **Static/generator source files**
  - `src/policy/data/*` and generated `*.generated.ts`.
- **Backend IA index**
  - File-based index under `.cache/ia-index`.
- **Master control inventory**
  - Browser fetch from `/Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json`.

---

## 5) Needs Confirmation

1. `frameworkSeedData.ts` and `extractedSeedArrays.ts` appear legacy/non-primary.
2. `workflowTemplates.generated.ts` appears underused in current frontend path.
3. Runtime accessibility of `/Builder/Documentations/*` in production hosting must be confirmed.

