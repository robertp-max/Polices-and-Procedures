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

---

## 6) Onboarding Data Model (Existing Runtime)

### Core onboarding types (`src/policy/journey/types/journey.ts`)

- `JourneyEmployee` (role, supervisor linkage, clearance flags)
- `JourneyModule` (phase/group/role targeting, prerequisites, policy refs, assessment method)
- `ModuleAttempt` (status, score, timing, scorm progress fields)
- `JourneyEvidence` (module/event-linked evidence metadata)
- `JourneyEscalation` (severity, state, assignment metadata)
- `SupervisedVisit` (visit type/date/rating/comments/signatures)
- `SignatureRecord` (role, signer identity label, signature image metadata, timestamp)

### Store and persistence (`src/policy/journey/stores/journeyStore.ts`)

- Persisted key: `ci-journey-v1` (localStorage via Zustand persist).
- Tracks:
  - employee progression
  - attempts and completions
  - Appendix F records and signatures
  - supervised visits
  - escalations
  - clearance state and related evidence
- Important note in code: local persistence is explicitly marked as a prototype pattern intended for secure API replacement in production.

### Evidence/sign-off structures now vs target

- **Implemented now**
  - Evidence and signature records are kept in browser-persisted state.
  - Sign-off gates are enforced in client business logic.
- **Backend/AWS Phase 1 target gap**
  - No durable server persistence for onboarding evidence and signatures.
  - No immutable object storage linkage (object key/hash/retention metadata) in onboarding runtime records.

---

## 7) AWS Phase 1 Data Mapping Considerations (Onboarding)

Planning references:
- `Builder/Documentations/AWS_Phase1_Foundation_Build_Plan.md`
- `Builder/Documentations/R2_STORAGE_ARCHITECTURE.md`

### Candidate object families for DynamoDB modeling

- `USER#{user_id}` -> profile/role baseline
- `ONBOARDING#{employee_id}` -> phase and gate progression
- `SIGNOFF#{employee_id}` -> Appendix F and clearance signatures
- `VISIT#{employee_id}` -> supervised visit records
- `EVIDENCE#{evidence_id}` -> metadata mapped to object-store location
- `AUDIT#{employee_id}` -> append-only onboarding action trail

### Required metadata parity for compliance traceability

- `policy_id`
- `workflow_id`
- `event_id`
- `created_at` / `created_by`
- `integrity_sha256` (for immutable evidence)
- object store locator (bucket/prefix/key equivalent)

### Needs confirmation

1. AWS Phase 1 doc uses S3 + DynamoDB while R2 architecture doc uses R2 + SQL-style indexing model; canonical Phase 1 storage stack selection must be finalized.
2. Whether onboarding sign-offs are modeled as dedicated records or as a specialized evidence subtype.

---

## 8) AWS Phase 1 — Current vs Target State per Data Domain

### Status legend: NOT STARTED | IN PROGRESS | IMPLEMENTED

| Data Domain | Current State | Target (AWS Phase 1) | Status |
|---|---|---|---|
| Regulatory execution state | Zustand localStorage `reg-execution-v2` | DynamoDB items keyed per event/user; Lambda `workflow-runner` writes state updates | NOT STARTED |
| Regulatory event catalog | Static TS bundles (`regulatoryEvents.ts`) | DynamoDB `WORKFLOW#` / `EVENT#` items seeded by `mandated-event-generator` Lambda | NOT STARTED |
| Policy lifecycle state | Zustand in-memory (`policyStore`) | DynamoDB `POLICY#META` items; published artifacts in S3 `prod/evidence/{policy_id}/` | NOT STARTED |
| Forms catalog + content | Static TS datasets | DynamoDB form metadata items; filled PDFs in S3 `hh-prd-forms` bucket | NOT STARTED |
| Evidence metadata | Client-side `EvidenceDoc` (metadata only) | DynamoDB `FILE#` items with `integrity_sha256`, S3 object key, and retention metadata | NOT STARTED |
| Evidence blobs | Not stored anywhere | S3 sandbox bucket → validate/promote → S3 prod evidence bucket | NOT STARTED |
| Master Control Inventory | Static JSON fetch from `/Builder/` path | DynamoDB `MCI#{control_id}` items; served by `metadata-api` Lambda | NOT STARTED |
| Onboarding / journey progression | Zustand localStorage `ci-journey-v1` | DynamoDB `USER#` / `ONBOARDING#` / `SIGNOFF#` / `VISIT#` items | NOT STARTED |
| Audit log | localStorage (enforcement) + filesystem JSONL (calendar) | DynamoDB `AUDIT#{event_id}` append-only items; calendar audit to S3 `prod/audit/` prefix | NOT STARTED |
| IA / Brad index | File-based `.cache/ia-index` | S3 index bucket; session metadata in DynamoDB | NOT STARTED |
| Navigation state | Client-only Zustand (no persist) | No AWS target; intentionally client-only in Phase 1 and beyond | N/A |
| Shell theme state | `localStorage` key `ci-shell-theme` | No AWS target; user preference, remains client-only | N/A |
