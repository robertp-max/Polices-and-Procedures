# Workflow Referenced Policies & Procedures (PPS) Audit Report

**Report Date:** 2026-06-12  
**Source Workspace:** C:\AI\Git\training\HomeHealth\Policies_and_Procedures  
**Focus Area:** Policies & Procedures (PPS) explicitly referenced within the workflows subsystem  
**Author:** Grok analysis (no modifications to source files performed)  
**Purpose:** Provide a comprehensive inventory of all PPS referenced by the workflow engine, cross-reference against known policy documents and canonical lists, and identify gaps (non-existent or un-materialized PPS).

---

## Executive Summary

The workflows subsystem (primarily under `src/policy/workflows/` and driven by `src/policy/autogen/templateRegistry.ts`) declares **22 unique PPS IDs** via `policyRefs` arrays in its event and workflow templates.

These references are propagated through:
- Swimlane builders (`buildSwimlaneFromWorkflow.ts`, `buildSwimlaneFromEvent.ts`, etc.)
- `WorkflowDetailView.tsx` (displayed as "Policy references")
- `LinkedWorkflows.tsx` (reverse lookup by policyId)
- Event scheduling, compliance flags, regulatoryDriver citations, and downstream QAPI/Governing Body packaging
- `brad/workflowKnowledge.ts` (for Brad-side rendering)

**Existence Findings (as of this report):**
- **10 PPS** have clear evidence of existence (present in `tmp-policy-ids.txt` + dedicated or domain-level extracted documents in `Builder/Policies/`).
- **12 PPS** appear to have **no dedicated standalone documents** (missing from `tmp-policy-ids.txt`, no matching extracted `.md`/`.txt` files in `Builder/Policies/extracted_full/` or `extracted_docx/`, and minimal or zero mentions in workflow audit summaries).
- Some "missing" PPS have indirect coverage (e.g., via broader domain manuals like "HR Policy.md" or "OP - OPERATIONS DOMAIN", or related HR-TA-* series).
- Numbering discrepancies exist (workflow templates often use older/legacy IDs like `CL-OA-006`, while current policy corpus uses higher numbers like `CL-OA-101`).

This creates risk for the workflow engine, which assumes these PPS exist for regulatory citations, process flows, and linking.

**Key Gaps (High Priority):**
- CL-HHA-001, CL-HHA-002 (HHA In-Service & Observations)
- CO-QR-001 (HHCAHPS)
- IS-VM-001 (Vulnerability Scans)
- OP-EP-001, OP-EP-002 (Emergency Preparedness)
- RM-IC-001 (Infection Control)
- All HR-specific: HR-TR-010, HR-TR-011, HR-CR-020, HR-CV-040
- RM-IR-001 (partial — has a workflow doc but weak policy document)

---

## Methodology

### Sources of References (Workflow-Focused)
1. **Primary:** `src/policy/autogen/templateRegistry.ts` (TEMPLATE_REGISTRY + TRIGGER_TEMPLATES) — explicit `policyRefs: [...]` arrays.
2. **Propagation:** 
   - `src/policy/workflows/swimlanes/` (buildSwimlaneFromWorkflow.ts, buildSwimlaneFromEvent.ts, buildFallbackSwimlane.ts, types.ts)
   - `src/policy/workflows/components/WorkflowDetailView.tsx` and `LinkedWorkflows.tsx`
   - `src/policy/autogen/triggerEngine.ts` and `types.ts`
3. **Supporting Workflow Code:**
   - `src/policy/brad/workflowKnowledge.ts`
   - `src/policy/workflows/components/QAWorkflow03SwimlanePage.tsx` (primarily forms, but cross-checked)
   - `src/policy/workflows/WorkflowLibraryApp.tsx`, `workflowNav.ts`
4. **Broader but Workflow-Adjacent (for context):**
   - `src/policy/ces/data/V3_CES_SnapshotBuilder.ts`
   - `src/policy/onboarding/onboardingExecutionEngine.ts`
   - `src/policy/help/articles/master-controls.ts`
   - `server/ia/scenarioClassifier.ts`
5. **Canonical & Existence Sources:**
   - `tmp-policy-ids.txt` (running list of known policy IDs)
   - `Builder/Policies/` (extracted_full/*.md, extracted_docx/*.txt, domain manuals)
   - `Builder/Policies/Workflows/*.md` (ALL-WORKFLOWS-COMBINED.md, domain-specific, AUDIT reports)
   - `Builder/Documentations/HelpCenter/Workflows/*-WF-*.md`
   - Root `.md` files (RM-*.md, EN-*.md, etc.)
   - Scattered extractions in `_Heavy/`, `Bin-(thrash)/`, `_chatGPT/`, UAT reports, etc.
6. **Search Methods:** Regex for patterns like `[A-Z]{2,3}-[A-Z]{2,3}-\d{3,}`, exact ID greps, file name matches, content scans across `.md`/`.txt`/`.ts`/`.tsx`.

**Scope Note:** This report prioritizes PPS (policyRefs) **in the workflows**. Forms (FM-*/FRM-*) and non-workflow references (e.g., pure CES or onboarding) are noted only when they overlap or provide context. "Existence" means a dedicated or clearly attributable policy document, not just a mention in a summary or audit.

---

## Complete List of Referenced PPS in Workflows

Extracted uniquely from `templateRegistry.ts` `policyRefs` (22 total, sorted alphabetically):

**Governance (GV)**
- GV-GB-001 (multiple templates, e.g., TPL-GV-QUARTERLY-GB, TPL-GV-ANNUAL-GOVPKT)
- GV-GB-002
- GV-GB-003

**QAPI**
- QA-PI-001 (multiple, e.g., TPL-QA-MONTHLY-QAPI, TPL-QA-QUARTERLY-GOVREVIEW)
- QA-PI-002

**Clinical (CL)**
- CL-OA-006 (TPL-CL-MONTHLY-AUDIT)
- CL-OA-007 (TPL-CL-WEEKLY-PHYSIGN)
- CL-HHA-001 (TPL-CL-ANNUAL-HHA-INSERVICE)
- CL-HHA-002 (TPL-CL-ANNUAL-HHA-SKILLOBS + semi-annual)

**Compliance (CO)**
- CO-CP-001 (TPL-CO-MONTHLY-REPORT)
- CO-CP-002 (TPL-CO-ANNUAL-EFFECTIVENESS)
- CO-QR-001 (TPL-CO-ANNUAL-HHCAHPS)

**IT/Security (IS)**
- IS-VM-001 (TPL-IT-QUARTERLY-VULN)

**Operations (OP)**
- OP-EP-001 (multiple, e.g., TPL-OP-ANNUAL-EP, TPL-OP-BIENNIAL-EP-REVIEW, TPL-OP-BIENNIAL-EP-TRAINING)
- OP-EP-002 (TPL-OP-BIENNIAL-EP-REVIEW)

**Finance (FN)**
- FN-BC-001 (TPL-FN-WEEKLY-CLAIMS)

**Risk (RM)**
- RM-IC-001 (TPL-RM-MONTHLY-IC)
- RM-IR-001 (TPL-RM-TRIGGER-RCA)

**HR/Training**
- HR-TR-010 (TPL-HR-ANNUAL-OSHA-BBP)
- HR-TR-011 (TPL-HR-ANNUAL-HIPAA)
- HR-CR-020 (TPL-HR-MONTHLY-OIG)
- HR-CV-040 (TPL-HR-QUARTERLY-COMPETENCY)

These are used for:
- Regulatory citations (e.g., CoP §484.105 for GV-GB-001)
- Process flows and required documentation
- Compliance flags (critical/high/medium audit risk)
- Linking in UI and swimlanes

**Additional Form References (for context, not pure PPS):**
From QAWorkflow03SwimlanePage.tsx and templates: QA-FM-001 to QA-FM-006, GV-FM-023, plus many FRM-* (e.g., FRM-GV-001, FRM-QA-001, etc.). These are tracked in forms libraries but often tied to the above policies.

---

## Detailed Existence Matrix

| Policy ID     | Primary Workflow References (File + Context) | In tmp-policy-ids.txt? | Dedicated Extracted Doc? (Builder/Policies/) | Mentions in Builder/Policies/Workflows/*.md or HelpCenter? | Other Evidence / Notes | Status |
|---------------|----------------------------------------------|------------------------|----------------------------------------------|-------------------------------------------------------------|------------------------|--------|
| GV-GB-001    | templateRegistry.ts (multiple templates); swimlanes; WorkflowDetailView; CES snapshots; help articles | Yes | Yes (multiple in extracted_full + extracted_docx; special GVGB* handling in src/policy) | Heavy (Governing Body workflows, ALL-WORKFLOWS-COMBINED.md) | Domain doc "Governing Body Authority & Responsibilities"; UI special-casing; UAT reports | **Exists** (best supported) |
| GV-GB-002    | templateRegistry.ts (TPL-GV-ANNUAL-GOVPKT) | Yes | Partial (covered in GV domain series) | Yes (gov pkt, acceptance-to-service) | In workflow audits as part of GV-GB-001..005 series | **Exists** (via series) |
| GV-GB-003    | templateRegistry.ts (TPL-GV-ANNUAL-COI, TPL-GV-ANNUAL-GOVPKT) | Yes | Partial (domain-level) | Yes (COI, conflict register) | Referenced in CES and master-controls | **Exists** (via series) |
| QA-PI-001    | templateRegistry.ts (TPL-QA-MONTHLY-QAPI, TPL-QA-QUARTERLY-GOVREVIEW) | Yes | Partial (in QA domain workflows) | Yes (PIP/QAPI governance) | Widespread in audits and help | **Exists** |
| QA-PI-002    | templateRegistry.ts (TPL-QA-QUARTERLY-GOVREVIEW) | Yes | Partial | Yes | Tied to annual PIP | **Exists** |
| CL-OA-006    | templateRegistry.ts (TPL-CL-MONTHLY-AUDIT) | Yes | **Yes** (dedicated: "CL-OA-006 - Documentation Hierarchy..." in extracted_full, extracted_docx, and "missing-claude..." subfolder) | Yes (documentation hierarchy in CL/ALL workflows) | In UAT and audit bundles; compile scripts | **Exists** (strong evidence) |
| CL-OA-007    | templateRegistry.ts (TPL-CL-WEEKLY-PHYSIGN) | Yes | Yes (CL-OA series) | Indirect (clinical audit) | Signature tracking | **Exists** |
| CL-HHA-001   | templateRegistry.ts (TPL-CL-ANNUAL-HHA-INSERVICE) | **No** | **No** | **No** | Only in templateRegistry and form refs (CL-FM-040 etc.) | **Does not exist** (as standalone PPS) |
| CL-HHA-002   | templateRegistry.ts (TPL-CL-ANNUAL-HHA-SKILLOBS + semi) | **No** | **No** | **No** | Only in templateRegistry | **Does not exist** (as standalone PPS) |
| CO-CP-001    | templateRegistry.ts (TPL-CO-MONTHLY-REPORT) | Yes | **Yes** (dedicated "CO-CP-001 - Corporate Compliance Program") | Yes (compliance reports, audits) | In PP_AMENDMENT_REGISTER, UAT | **Exists** (strong) |
| CO-CP-002    | templateRegistry.ts (TPL-CO-ANNUAL-EFFECTIVENESS) | Yes | Yes (CO-CP series) | Yes | Effectiveness review | **Exists** |
| CO-QR-001    | templateRegistry.ts (TPL-CO-ANNUAL-HHCAHPS) | **No** | **No** | **No** | Only in templateRegistry + form refs (CO-FM-030 etc.) | **Does not exist** (as standalone PPS) |
| IS-VM-001    | templateRegistry.ts (TPL-IT-QUARTERLY-VULN) | **No** | **No** | **No** | Only in templateRegistry + form refs (FRM-IS-*) | **Does not exist** (as standalone PPS) |
| OP-EP-001    | templateRegistry.ts (multiple: TPL-OP-ANNUAL-EP, biennial review/training) | **No** | **No** (high-level mentions in OP domain manuals) | Indirect (EP drills in OP-WORKFLOWS) | Name mapping in server/ia/scenarioClassifier.ts | **Does not exist** (as standalone PPS; high-level coverage only) |
| OP-EP-002    | templateRegistry.ts (TPL-OP-BIENNIAL-EP-REVIEW) | **No** | **No** | **No** | Only in templateRegistry | **Does not exist** (as standalone PPS) |
| FN-BC-001    | templateRegistry.ts (TPL-FN-WEEKLY-CLAIMS) | Yes | **Yes** (dedicated "FN-BC-001 - Medicare Billing & Claims Submission") | Yes (billing/claims in FN/ALL workflows) | In compile scripts, audits | **Exists** (strong) |
| RM-IC-001    | templateRegistry.ts (TPL-RM-MONTHLY-IC) | **No** | **No** | **No** | Only in templateRegistry | **Does not exist** (as standalone PPS) |
| RM-IR-001    | templateRegistry.ts (TPL-RM-TRIGGER-RCA) | Partial (RM-ER* exist) | Partial (has dedicated workflow doc: RM-IR-001-WF-IncidentReview.md in HelpCenter) | Yes (risk workflows) | In master-controls, UAT dumps | **Partial** (workflow doc exists; full policy weak) |
| HR-TR-010    | templateRegistry.ts (TPL-HR-ANNUAL-OSHA-BBP) | **No** | **No** | **No** (HR workflows reference HR-TA-* series instead) | Indirect in audit/UAT (HR-TA-003 etc. exist) | **Does not exist** (as standalone PPS) |
| HR-TR-011    | templateRegistry.ts (TPL-HR-ANNUAL-HIPAA) | **No** | **No** | **No** | Only in templateRegistry | **Does not exist** (as standalone PPS) |
| HR-CR-020    | templateRegistry.ts (TPL-HR-MONTHLY-OIG) | **No** | **No** | **No** | Only in templateRegistry | **Does not exist** (as standalone PPS) |
| HR-CV-040    | templateRegistry.ts (TPL-HR-QUARTERLY-COMPETENCY) | **No** | **No** | **No** | Only in templateRegistry | **Does not exist** (as standalone PPS) |

**Notes on Table:**
- "Dedicated" = exact or near-exact filename match in extracted policies (e.g., "CL-OA-006 - ...").
- Many HR references in broader corpus use `HR-TA-*` (Training & Assignment) or `HR-ER-*` (Employee Relations), which **do** appear in tmp-policy-ids.txt and onboarding docs — these are related but distinct from the exact workflow IDs.
- GV policies are frequently treated as a series in audits ("GV-GB-001 through GV-GB-005/014").
- Numbering drift: Workflow templates reference legacy IDs; current extracted policies often use 100-series (e.g., CL-OA-101 for OASIS work).

---

## Broader Context & Additional References

While focusing on workflows, deeper searches revealed overlapping references in related systems:

- **CES Snapshots** (`V3_CES_SnapshotBuilder.ts`): Additional policyRefs like CL-IPC-*, HR-PF-*, FIN-*, GV-POL-*, etc. These feed events that can trigger workflows.
- **Onboarding** (`onboardingExecutionEngine.ts`): Heavy use of HR-TA-001..006, HR-TD-*, CO-*, IT-*. Many tie back to policy acknowledgments (EN-FM-001) and competency (HR-CV-040).
- **Help & Master Controls**: `master-controls.ts` lists GV-GB-001, CL-CC-001, QA-QI-001, CO-HIPAA-001, RM-IR-001.
- **Workflow Audit Docs** (`Builder/Policies/Workflows/`): Frequently cross-reference the supported IDs (GV, QA-PI, CL-OA-006, CO-CP, FN-BC) and note "systemic gaps" or mappings. E.g., PP_AMENDMENT_REGISTER calls out CO-CP-001 and FN-BC-001 explicitly.
- **UAT/Audit Bundles** (in _Heavy_, Bin, _system/UAT_AGENT_FINDINGS): Lots of HR-TA-003 (OIG/SAM) references, often tied to regulatory drivers.
- **tmp-policy-ids.txt**: Comprehensive but incomplete relative to workflows (only ~10/22 of the core list are present; many CL-*/CO-*/FN-*/GV-*/QA-*/RM-* variants exist, but not the exact workflow ones listed as missing above).

**Forms vs. PPS Distinction:**
Workflows distinguish `policyRefs` (PPS) from `requiredForms` (FRM-*/FM-*). The latter are more numerous and often have their own tracking (e.g., in forms library, eCign). Some forms are explicitly tied to missing PPS (e.g., CL-FM-040..043 for CL-HHA).

---

## Identified Gaps & Risks

1. **12 Standalone Missing PPS** (as detailed in matrix). These are "declared but not delivered" — the workflow engine will reference them in UI, swimlanes, and compliance logic, but no authoritative document exists to link to or enforce.
2. **Risk Areas:**
   - Regulatory citations in templates (e.g., for CL-HHA under 42 CFR §484.80) have no backing PPS.
   - Linking in `LinkedWorkflows` and detail views will be incomplete.
   - Onboarding/CES events that feed workflows may assume coverage that isn't there.
3. **Partial Coverage Examples:**
   - HR series: Workflows declare HR-TR-*/HR-CR-*/HR-CV-*, but actual docs cover HR-TA-*/HR-ER-* and domain manuals.
   - OP-EP: High-level domain coverage + workflow docs, but no exact numbered files.
4. **Data Quality Issues:**
   - Duplicate/legacy extractions (e.g., CL-OA-006 appears in "missing-claude-..." folder).
   - Inconsistent numbering between templates and current policy corpus.
   - Some IDs only surface in generated reports or chat logs (not primary sources).

---

## Recommendations (For Future Action)

- **Inventory Completion:** Author or extract dedicated PPS for the 12 gaps, using the regulatoryDriver and processFlow details from the templates as starting points.
- **Registry Alignment:** Update `templateRegistry.ts` or add mapping if some references are intentionally covered by domain policies.
- **Tooling:** Enhance `tmp-policy-ids.txt` or policy generators to include workflow-declared IDs automatically.
- **Validation:** Add a check in build/audit scripts to flag declared policyRefs without corresponding documents.
- **UI/Linking:** Consider graceful handling in WorkflowDetailView/LinkedWorkflows for missing policies (e.g., "Declared but no document found").

---

## Appendices

### A. Full Unique PolicyRefs from templateRegistry.ts (raw extraction)
CL-HHA-001, CL-HHA-002, CL-OA-006, CL-OA-007, CO-CP-001, CO-CP-002, CO-QR-001, FN-BC-001, GV-GB-001, GV-GB-002, GV-GB-003, HR-CR-020, HR-CV-040, HR-TR-010, HR-TR-011, IS-VM-001, OP-EP-001, OP-EP-002, QA-PI-001, QA-PI-002, RM-IC-001, RM-IR-001

### B. Key File Locations
- Core references: `src/policy/autogen/templateRegistry.ts`
- Propagation: `src/policy/workflows/swimlanes/*.ts`, `src/policy/workflows/components/*.tsx`
- Canonical list: `tmp-policy-ids.txt`
- Policy corpus: `Builder/Policies/extracted_full/`, `Builder/Policies/Workflows/`
- Workflow docs: `Builder/Documentations/HelpCenter/Workflows/`

### C. Sources & Searches Performed
- Regex/content scans for policy ID patterns across src/policy/ (limited to .ts/.tsx), Builder/Policies/, tmp-*.txt, root .md.
- File existence checks for exact/partial name matches.
- Cross-references in CES, onboarding, help, UAT, and audit bundles.
- No source files were modified during this analysis.

---

**Report generated via static codebase analysis on 2026-06-12. For questions or follow-up extraction (e.g., full context dumps per ID), provide further instructions.**