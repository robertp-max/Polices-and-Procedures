# Policy Data Source Cleanup Inventory

**Scope:** `src/policy/data/` (36 files)  
**Date:** 2026-05-10  
**Mode:** INVENTORY ONLY — No deletions, moves, or refactors.

---

## 1. Executive Summary

The `src/policy/data/` directory contains **36 TypeScript files** serving as the data layer for the policy management application. Analysis reveals:

- **9 generated files** (`.generated.ts`) that should never be manually edited
- **4 forms library content files** forming a single merged registry (canonical + 3 extensions)
- **3 clearly overlapping file pairs** where earlier extractions duplicate generated sources
- **6 orphaned/dead files** with zero active `src/` imports (2 clearly dead, 4 generated but unused by runtime)
- **4 event/workflow alignment files** that are heavily cross-imported by the regulatory execution subsystem
- **Multiple files safely canonical** that must not be touched

**Key findings:**
1. `frameworkSeedData.ts` is a **partial duplicate** of `frameworkSeed.generated.ts` (only 1 consumer remains)
2. `extractedSeedArrays.ts` is **fully orphaned** (zero imports from any file)
3. `formAddendumBindings.ts` is **orphaned** (no imports from external files)
4. `formsCatalog.ts` and `formsLibraryDataset.ts` have **partial overlap** but serve different consumers
5. `policyContentMap.ts` is the **canonical runtime accessor** that merges `allPoliciesContent.generated.ts` + `specimenContent.generated.ts`

---

## 2. File-by-File Inventory

| # | File | Category | Active Usage | Duplicate Overlap | Risk | Recommended Action |
|---|------|----------|-------------|-------------------|------|-------------------|
| 1 | `achcAttachmentCrosswalk.generated.ts` | GENERATED_SOURCE | ORPHAN | NONE | LOW | REVIEW_REQUIRED |
| 2 | `achcHhEvidenceMap.ts` | MANUAL_SOURCE | ACTIVE | NONE | LOW | KEEP_CANONICAL |
| 3 | `achcPrintCrosswalk.generated.ts` | GENERATED_SOURCE | ORPHAN | NONE | LOW | REVIEW_REQUIRED |
| 4 | `achcStandardTargetResolver.ts` | RUNTIME_REGISTRY | ACTIVE | NONE | MEDIUM | KEEP_CANONICAL |
| 5 | `achcSupportAnchors.ts` | MANUAL_SOURCE | ACTIVE | NONE | LOW | KEEP_CANONICAL |
| 6 | `achcSurveyProjection.generated.ts` | GENERATED_SOURCE | ACTIVE | NONE | LOW | KEEP_GENERATED |
| 7 | `achcSurveyTags.generated.ts` | GENERATED_SOURCE | ORPHAN | NONE | LOW | REVIEW_REQUIRED |
| 8 | `allPoliciesContent.generated.ts` | GENERATED_SOURCE | ACTIVE | PARTIAL | LOW | KEEP_GENERATED |
| 9 | `auditRegulatoryEvents.ts` | MANUAL_SOURCE | ACTIVE | PARTIAL | MEDIUM | REVIEW_REQUIRED |
| 10 | `corridorAlignment.generated.ts` | GENERATED_SOURCE | ACTIVE | NONE | LOW | KEEP_GENERATED |
| 11 | `eventAlignmentPolicy.ts` | RUNTIME_REGISTRY | ACTIVE | PARTIAL | MEDIUM | KEEP_CANONICAL |
| 12 | `eventDisplayModel.ts` | RUNTIME_REGISTRY | ACTIVE | NONE | MEDIUM | KEEP_CANONICAL |
| 13 | `eventWorkflowAlignment.ts` | RUNTIME_REGISTRY | ACTIVE | NONE | HIGH | KEEP_CANONICAL |
| 14 | `extractedSeedArrays.ts` | LEGACY_DUPLICATE | ORPHAN | HIGH | LOW | DELETE_AFTER_CONFIRMATION |
| 15 | `formAddendumBindings.ts` | MANUAL_SOURCE | ORPHAN | NONE | LOW | ARCHIVE_AFTER_CONFIRMATION |
| 16 | `formTitles.generated.ts` | GENERATED_SOURCE | ACTIVE | PARTIAL | LOW | KEEP_GENERATED |
| 17 | `formsCatalog.ts` | RUNTIME_REGISTRY | ACTIVE | PARTIAL | MEDIUM | REVIEW_REQUIRED |
| 18 | `formsLibraryContent.ts` | CANONICAL_SOURCE | ACTIVE | NONE | HIGH | KEEP_CANONICAL |
| 19 | `formsLibraryContentCO_More.ts` | PARTIAL_EXTENSION | ACTIVE | NONE | MEDIUM | KEEP_CANONICAL |
| 20 | `formsLibraryContentHR_CL.ts` | PARTIAL_EXTENSION | ACTIVE | NONE | MEDIUM | KEEP_CANONICAL |
| 21 | `formsLibraryContentJD.ts` | PARTIAL_EXTENSION | ACTIVE | NONE | MEDIUM | KEEP_CANONICAL |
| 22 | `formsLibraryDataset.ts` | CANONICAL_SOURCE | ACTIVE | PARTIAL | HIGH | KEEP_CANONICAL |
| 23 | `frameworkSeed.generated.ts` | GENERATED_SOURCE | ACTIVE | HIGH | HIGH | KEEP_GENERATED |
| 24 | `frameworkSeedData.ts` | LEGACY_DUPLICATE | ACTIVE | HIGH | MEDIUM | MERGE_INTO_CANONICAL |
| 25 | `helpArticles.ts` | MANUAL_SOURCE | ACTIVE | NONE | LOW | KEEP_CANONICAL |
| 26 | `hubstaffTasks.ts` | MANUAL_SOURCE | ACTIVE | NONE | LOW | KEEP_CANONICAL |
| 27 | `mandatedEventsExpanded.ts` | RUNTIME_REGISTRY | ACTIVE | PARTIAL | MEDIUM | REVIEW_REQUIRED |
| 28 | `masterControlInventory.ts` | MANUAL_SOURCE | ACTIVE | NONE | LOW | KEEP_CANONICAL |
| 29 | `multiYearEvents.ts` | RUNTIME_REGISTRY | ACTIVE | PARTIAL | MEDIUM | KEEP_CANONICAL |
| 30 | `policyContentMap.ts` | RUNTIME_REGISTRY | ACTIVE | NONE | HIGH | KEEP_CANONICAL |
| 31 | `policyCorpus.ts` | CANONICAL_SOURCE | ACTIVE | NONE | HIGH | KEEP_CANONICAL |
| 32 | `regulatoryEvents.ts` | CANONICAL_SOURCE | ACTIVE | PARTIAL | HIGH | KEEP_CANONICAL |
| 33 | `specimenContent.generated.ts` | GENERATED_SOURCE | ACTIVE | NONE | LOW | KEEP_GENERATED |
| 34 | `workflowGraph.generated.ts` | GENERATED_SOURCE | ACTIVE | NONE | MEDIUM | KEEP_GENERATED |
| 35 | `workflowTemplates.generated.ts` | GENERATED_SOURCE | ORPHAN | NONE | LOW | REVIEW_REQUIRED |
| 36 | `workflows.generated.ts` | GENERATED_SOURCE | ACTIVE | NONE | MEDIUM | KEEP_GENERATED |

---

## 3. Import Graph Findings

### 3A. Forms Library Stack

```
formsLibraryDataset.ts (FORMS_DATASET array — 281 records)
    └─ imported by: FormsPage, FormViewer, FormPrintView, taskProjectionCore,
                    regulatoryExecutionStore, policyFormLinks, ArtifactViewerPage,
                    complianceActionMap, WorkflowExecutionPanel, bradAppContext,
                    useEventExecutionDataflow, forms-templates help article

formsLibraryContent.ts (buildFormContent, FORM_OVERRIDES, types)
    ├─ imported by: FormViewer, FormPrintView, GVGBPrintDocument
    ├─ imports from: formsLibraryContentHR_CL, formsLibraryContentCO_More, formsLibraryContentJD
    └─ merges all 3 extension files via Object.assign at module load

formsLibraryContentHR_CL.ts (FORM_OVERRIDES_EXT — HR+CL overrides)
    └─ imported ONLY by: formsLibraryContent.ts

formsLibraryContentCO_More.ts (FORM_OVERRIDES_EXT2 — CO/QA/FN/IT/OP/RM overrides)
    └─ imported ONLY by: formsLibraryContent.ts

formsLibraryContentJD.ts (FORM_OVERRIDES_JD — 12 Job Description overrides)
    └─ imported ONLY by: formsLibraryContent.ts

formsCatalog.ts (FORMS_CATALOG record + getFormMeta)
    └─ imported by: eventWorkflowAlignment, WorkflowDrawer, taskProjectionCore
```

**Finding:** `formsLibraryDataset.ts` is the canonical **flat registry** (array of 281 records used for iteration/lookup). `formsCatalog.ts` is a **keyed record** with a different interface (`FormMeta`) that includes `workflow`, `section`, and `addendumOf` fields not present in `formsLibraryDataset`. They serve different consumers and are NOT full duplicates.

### 3B. Policy Content Stack

```
allPoliciesContent.generated.ts (allPoliciesContent: PolicyContent[])
    └─ imported ONLY by: policyContentMap.ts

specimenContent.generated.ts (specimenPolicyContent: PolicyContent)
    └─ imported ONLY by: policyContentMap.ts

policyContentMap.ts (getPolicyContent, getPolicyBody)
    └─ imported by: PrintPage, PolicyDetailPage, PolicyDetailModal, LibraryPage,
                    PolicyLibraryDocumentView, AchcSurveyAlignmentPage,
                    achcStandardTargetResolver, bradAppContext, PolicyLifecyclePage
```

**Finding:** `policyContentMap.ts` is the **canonical runtime accessor**. It merges both generated files into a Map. All consumer code imports from `policyContentMap` — never directly from the generated files. Clean architecture.

### 3C. Framework Seed Stack

```
frameworkSeed.generated.ts (LARGE: ~9500 lines — domains, subdomains, policies, versions, tasks)
    └─ imported by: frameworkSeedAdapter.ts, LibraryPage, eventDisplayModel,
                    useEventExecutionDataflow

frameworkSeedData.ts (PARTIAL: ~620 lines — policies + versions only, NO domains/subdomains)
    └─ imported by: policyLinkService.ts (ONLY consumer)

extractedSeedArrays.ts (~173 lines — policies only, extracted subset)
    └─ imported by: NOTHING (ORPHAN)

frameworkSeedAdapter.ts (loadFrameworkSeed — canonical adapter)
    └─ imports from: frameworkSeed.generated.ts
    └─ imported by: PrintPage, policyCorpus (via lifecycle), compliance-execution
```

**Finding:** `frameworkSeed.generated.ts` is the **canonical source**. `frameworkSeedData.ts` is a legacy partial extraction with only 1 remaining consumer (`policyLinkService.ts`) that could be migrated to use `frameworkSeed.generated`. `extractedSeedArrays.ts` is fully dead code.

### 3D. Regulatory Events Stack

```
regulatoryEvents.ts (CANONICAL: base event definitions + utilities)
    └─ imported by: auditRegulatoryEvents, mandatedEventsExpanded, multiYearEvents,
                    eventAlignmentPolicy, eventDisplayModel, eventWorkflowAlignment,
                    WorkflowExecutionPanel, MonthGrid, TimelineMonth, DashboardPage,
                    complianceEngine, autogenStore, triggerEngine, annualGenerator, ...

auditRegulatoryEvents.ts (extends regulatoryEvents with audit scoring/metadata)
    └─ imported by: riskScoring, auditAggregate, auditState, exportReport,
                    dependencyCheck, surveyPacket, AuditModePage

mandatedEventsExpanded.ts (expands events with multi-year recurrence instances)
    └─ imported by: useEventExecutionDataflow, stores, engines, components

multiYearEvents.ts (generates 3-year event projections)
    └─ imported by: calendarSyncStore, WorkflowExecutionPanel, EventWorkspace,
                    complianceExecutionStore, useEventExecutionDataflow, autogen
```

**Finding:** These are NOT duplicates. They form a **pipeline**: `regulatoryEvents` → `auditRegulatoryEvents` (adds audit context) → `mandatedEventsExpanded` (adds recurrence) → `multiYearEvents` (projects across years). All are actively used by different subsystems.

### 3E. Policy Corpus

```
policyCorpus.ts (POLICY_CORPUS, getCorpusPolicy, DOMAIN_LABEL, etc.)
    └─ imported by: lifecycleSeed, bradAppContext, TaskDetailRightPanel,
                    PolicyLibraryDocumentView, PolicyLifecyclePage, complianceActionMap
```

**Finding:** This is the **canonical master registry** of all policies with lifecycle metadata. Distinct from `frameworkSeed.generated.ts` (which is raw framework data). `policyCorpus` enriches policies with operational state.

---

## 4. Duplicate/Overlap Findings

| Pair | Overlap Level | Notes |
|------|--------------|-------|
| `frameworkSeedData.ts` ↔ `frameworkSeed.generated.ts` | **HIGH** | `frameworkSeedData` is a ~620-line subset of the ~9500-line generated file. Contains policies + versions but OMITS domains and subdomains. Only 1 consumer remains. |
| `extractedSeedArrays.ts` ↔ `frameworkSeed.generated.ts` | **HIGH** | `extractedSeedArrays` is a ~173-line extraction of policies only. Zero imports — fully orphaned. |
| `formsCatalog.ts` ↔ `formsLibraryDataset.ts` | **PARTIAL** | Different interfaces, different consumers. `formsCatalog` adds workflow/section/addendum metadata not in `formsLibraryDataset`. Could potentially merge but serves different architectural roles. |
| `auditRegulatoryEvents.ts` ↔ `regulatoryEvents.ts` | **PARTIAL** | Not a true duplicate — `auditRegulatoryEvents` imports FROM `regulatoryEvents` and extends with audit scoring. Pipeline relationship. |
| `mandatedEventsExpanded.ts` ↔ `regulatoryEvents.ts` | **PARTIAL** | Same pattern — derives from `regulatoryEvents`, adds recurrence expansion. |
| `allPoliciesContent.generated.ts` ↔ `specimenContent.generated.ts` | **PARTIAL** | `specimenContent` is a single hand-curated specimen (GV-GB-001). `allPoliciesContent` is all other policies. Both feed into `policyContentMap`. Not duplicative. |

---

## 5. Canonical Source Recommendations

| Domain | Canonical Source | Status |
|--------|-----------------|--------|
| Forms registry (flat array) | `formsLibraryDataset.ts` | ✅ Correct — 281 records, widely imported |
| Forms content (sections/fields) | `formsLibraryContent.ts` + 3 extensions | ✅ Correct — single merge point |
| Forms workflow metadata | `formsCatalog.ts` | ✅ Correct — serves workflow subsystem |
| Policy content (sections/body) | `policyContentMap.ts` (accessor) | ✅ Correct — single entry point for consumers |
| Policy metadata/lifecycle | `policyCorpus.ts` | ✅ Correct |
| Framework structure | `frameworkSeed.generated.ts` (via adapter) | ✅ Correct |
| Regulatory events | `regulatoryEvents.ts` | ✅ Correct — canonical base |
| ACHC survey mapping | `achcSurveyProjection.generated.ts` | ✅ Correct |
| Workflow definitions | `workflows.generated.ts` + `workflowTemplates.generated.ts` | ✅ Correct |

---

## 6. Files Safe to Archive Later

| File | Reason | Consumers |
|------|--------|-----------|
| `extractedSeedArrays.ts` | Fully orphaned; zero imports anywhere in `src/` | NONE |
| `formAddendumBindings.ts` | Zero external imports; data appears unused by runtime | NONE |
| `workflowTemplates.generated.ts` | Zero imports from `src/` or `server/`; only consumed by `scripts/compileWorkflows.ts` build script | Scripts only |
| `achcAttachmentCrosswalk.generated.ts` | Zero imports from `src/`; may be intended for future use | NONE |
| `achcPrintCrosswalk.generated.ts` | Zero imports from `src/`; may be intended for future use | NONE |
| `achcSurveyTags.generated.ts` | Zero imports from `src/`; may be intended for future use | NONE |

---

## 7. Files That Must NOT Be Touched

| File | Reason |
|------|--------|
| `formsLibraryContent.ts` | Central merge point for all 281 form content definitions; breaking changes cascade to FormViewer, FormPrintView, GVGBPrintDocument |
| `formsLibraryDataset.ts` | Master registry; 10+ active consumers across forms, compliance, workflow, and calendar subsystems |
| `regulatoryEvents.ts` | Foundation of the entire regulatory execution pipeline; 30+ downstream consumers |
| `policyContentMap.ts` | Sole accessor for policy content; breaking this breaks all policy print/view paths |
| `policyCorpus.ts` | Master policy lifecycle registry; breaking this breaks library, lifecycle, and brad subsystems |
| `frameworkSeed.generated.ts` | 9500-line generated source; canonical for domains, subdomains, policies, versions |
| `eventWorkflowAlignment.ts` | Critical bridge between regulatory events and workflow execution; highly imported |

---

## 8. High-Risk Cleanup Warnings

| Warning | Details |
|---------|---------|
| **Do NOT delete generated files without verifying generator still exists** | All `.generated.ts` files depend on external generation scripts (often in `scripts/` or source repos). Deleting them without confirming the generator can recreate them is catastrophic. |
| **`formsCatalog.ts` cannot simply merge into `formsLibraryDataset.ts`** | They have different TypeScript interfaces (`FormMeta` vs `FormRecord`) and serve different consumers. Merging requires interface reconciliation. |
| **`frameworkSeedData.ts` has 1 active consumer** | `policyLinkService.ts` imports `frameworkPolicies` and `frameworkPolicyVersions` from this file. Before deletion, migrate that import to `frameworkSeed.generated.ts`. |
| **Regulatory event pipeline is deeply cross-linked** | `regulatoryEvents` → `auditRegulatoryEvents` → `mandatedEventsExpanded` → `multiYearEvents` form a directed pipeline with 60+ total downstream imports. Do NOT merge or restructure without a full regression plan. |
| **`allPoliciesContent.generated.ts` is regenerated externally** | Any manual edits will be overwritten on next generation pass. |

---

## 9. Proposed Phased Cleanup Plan

### Phase 1: Safe Deletions (Zero-risk)
- [ ] Delete `extractedSeedArrays.ts` (orphan, zero imports, confirmed duplicate of `frameworkSeed.generated.ts`)
- [ ] Archive `formAddendumBindings.ts` (orphan, zero external imports)

### Phase 2: Import Migration (Low-risk)
- [ ] Migrate `policyLinkService.ts` to import from `frameworkSeed.generated.ts` instead of `frameworkSeedData.ts`
- [ ] After migration confirmed, delete `frameworkSeedData.ts`

### Phase 3: Consolidation Review (Medium-risk, requires design decision)
- [ ] Evaluate whether `formsCatalog.ts` should be folded into `formsLibraryDataset.ts` (requires interface reconciliation)
- [ ] Evaluate whether `formTitles.generated.ts` data overlaps with `formsLibraryDataset.ts` name field
- [ ] Review whether `auditRegulatoryEvents.ts` → `regulatoryEvents.ts` can be simplified (likely NO — they serve different subsystems)

### Phase 4: Generated File Governance
- [ ] Verify all `.generated.ts` files have corresponding generator scripts in `scripts/` or documented generation source
- [ ] Add `/* DO NOT EDIT — generated by [script] */` header to any generated files missing it
- [ ] Document generation commands in a GENERATION_MANIFEST

### Phase 5: Future Architecture (requires design approval)
- [ ] Consider a barrel file (`src/policy/data/index.ts`) for clean public API
- [ ] Consider moving extension files (`formsLibraryContentHR_CL.ts`, etc.) into a subdirectory

---

## Appendix: Export Inventory

| File | Key Exports |
|------|-------------|
| `achcAttachmentCrosswalk.generated.ts` | `achcAttachmentCrosswalk` |
| `achcHhEvidenceMap.ts` | ACHC evidence mapping data |
| `achcPrintCrosswalk.generated.ts` | `achcPrintCrosswalk` |
| `achcStandardTargetResolver.ts` | Standard target resolution logic |
| `achcSupportAnchors.ts` | `getSupportRefsForPolicy`, `formatAnchorRefsForDisplay` |
| `achcSurveyProjection.generated.ts` | `achcSurveyByPolicyId` |
| `achcSurveyTags.generated.ts` | Survey tag data |
| `allPoliciesContent.generated.ts` | `allPoliciesContent: PolicyContent[]` |
| `auditRegulatoryEvents.ts` | Audit-enriched regulatory events |
| `corridorAlignment.generated.ts` | Corridor alignment data |
| `eventAlignmentPolicy.ts` | Policy ↔ event alignment mapping |
| `eventDisplayModel.ts` | Event display/presentation models |
| `eventWorkflowAlignment.ts` | Event ↔ workflow alignment bridge |
| `extractedSeedArrays.ts` | `frameworkPolicies` (ORPHAN — duplicate) |
| `formAddendumBindings.ts` | Form addendum binding data (ORPHAN) |
| `formTitles.generated.ts` | Form title lookup data |
| `formsCatalog.ts` | `FORMS_CATALOG`, `getFormMeta`, `FormMeta` |
| `formsLibraryContent.ts` | `buildFormContent`, `FORM_OVERRIDES`, `FormContent`, `FormSection`, `FormField`, types |
| `formsLibraryContentCO_More.ts` | `FORM_OVERRIDES_EXT2` |
| `formsLibraryContentHR_CL.ts` | `FORM_OVERRIDES_EXT` |
| `formsLibraryContentJD.ts` | `FORM_OVERRIDES_JD` |
| `formsLibraryDataset.ts` | `FORMS_DATASET`, `FormRecord` |
| `frameworkSeed.generated.ts` | `frameworkDomains`, `frameworkSubdomains`, `frameworkPolicies`, `frameworkPolicyVersions`, `seedCalendarTasks`, `seedUrgentTasks`, typed variants |
| `frameworkSeedData.ts` | `frameworkPolicies`, `frameworkPolicyVersions`, `seedCalendarTasks`, `seedUrgentTasks`, typed variants |
| `helpArticles.ts` | Help article definitions |
| `hubstaffTasks.ts` | Hubstaff task data |
| `mandatedEventsExpanded.ts` | Expanded mandated event instances |
| `masterControlInventory.ts` | Master control inventory data |
| `multiYearEvents.ts` | Multi-year event projections |
| `policyContentMap.ts` | `getPolicyContent`, `getPolicyBody` |
| `policyCorpus.ts` | `POLICY_CORPUS`, `getCorpusPolicy`, `CORPUS_PROVENANCE`, `LIFECYCLE_DOMAIN_ORDER`, `DOMAIN_LABEL` |
| `regulatoryEvents.ts` | Base regulatory event definitions + utilities |
| `specimenContent.generated.ts` | `specimenPolicyContent` |
| `workflowGraph.generated.ts` | Workflow graph data |
| `workflowTemplates.generated.ts` | Workflow template definitions |
| `workflows.generated.ts` | Workflow instance data |

---

*End of inventory. No files were modified, moved, or deleted in this pass.*
