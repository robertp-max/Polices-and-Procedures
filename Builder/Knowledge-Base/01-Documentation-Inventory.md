# 01 — Documentation Inventory

> **Location:** `Builder/Knowledge-Base/01-Documentation-Inventory.md`
> **Author:** Information Architecture
> **Status:** Authoritative inventory of all documentation assets discovered in the workspace.
> **Date of inventory:** Apr 24, 2026.

This file inventories every documentation source already present in the workspace, classifies it, and recommends a new home in the Help Center / Knowledge Base structure defined in `02-Knowledge-Base-Architecture.md`.

Classification keys:

| Code | Meaning |
|---|---|
| `CONCEPT` | Conceptual / architectural specification |
| `TECH`    | Technical / data-model / API documentation |
| `COMP`    | Component-level documentation |
| `USER`    | End-user facing instruction or KB article |
| `OPS`     | Operational runbook / governance / lifecycle |
| `LEGAL`   | Legal/regulatory frame, attestation, defensibility |
| `OUTDATED`| Superseded or no longer authoritative |
| `DUP`     | Duplication risk with another doc |

Recommended target folders are defined in `02-Knowledge-Base-Architecture.md` and `03-Conceptual-Documentation-Map.md`.

---

## 1. Compliance Execution Sprints (CES) — `Builder/Compliance-Execution-Sprints/`

CES is the **primary operational system** of the platform. These docs are the source of truth for execution architecture.

| File | Class | Purpose | Recommended Home |
|---|---|---|---|
| `00-README.md` | CONCEPT | Program charter, non-negotiables, doc index | `Architecture/CES/00-Charter.md` |
| `01-Execution-Model.md` | CONCEPT | Calendar-driven sequential model | `Architecture/CES/` |
| `02-Sprint-Structure.md` | CONCEPT | 2-week cadence, naming, boundaries | `Architecture/CES/` |
| `03-Workflow-Based-Execution.md` | CONCEPT | Event → Workflow → Execution Unit decomposition | `Architecture/CES/` |
| `04-Assignment-Model.md` | CONCEPT | Owner / Role / Approver / Signer | `Architecture/CES/` |
| `05-Work-Bundling-Strategy.md` | CONCEPT | Bundling for efficiency (QAPI worked example) | `Architecture/CES/` |
| `06-Sprint-Board-and-States.md` | CONCEPT + UIUX | Columns, state mapping, audit-readiness | `Architecture/CES/` + `UIUX/CES-Board.md` |
| `07-Recurring-Execution.md` | CONCEPT | Mandatory recurring items | `Architecture/CES/` |
| `08-Monthly-Retrospective.md` | OPS | Last-sprint-of-month retrospective rules | `Architecture/CES/` |
| `09-Calendar-Integration.md` | CONCEPT | Calendar primacy | `Architecture/CES/` |
| `10-Enforcement-and-Rules.md` | CONCEPT | Automation, blocking, gates | `Architecture/CES/` |
| `11-Metrics-and-Reporting.md` | CONCEPT | Compliance/on-time/blocked/audit-readiness metrics | `Architecture/CES/` |
| `Documentation/00-README.md` | CONCEPT | CES system documentation index | Link from `Architecture/CES/00-Charter.md`; do not duplicate |
| `Documentation/01-System-Overview.md` | CONCEPT | High-level CES system overview | `Architecture/CES/Overview.md` (link only) |
| `Documentation/02-Architecture-and-Data-Model.md` | TECH | Data model | `Developer-Reference/CES/Data-Model.md` (link) |
| `Documentation/03-Sprint-Execution-Model.md` | DUP of 01-Execution-Model | Duplication risk | Keep canonical at `01-Execution-Model.md`; mark `Documentation/03-...` as deprecated link |
| `Documentation/04-Workflow-and-Execution-Units.md` | DUP of 03-Workflow-Based-Execution | Duplication risk | Same as above |
| `Documentation/05-Enforcement-and-Compliance-Rules.md` | DUP of 10-Enforcement | Duplication risk | Same as above |
| `Documentation/06-Calendar-Integration.md` | DUP of 09-Calendar-Integration | Duplication risk | Same as above |
| `Documentation/07-Signature-and-eCIgn-Integration.md` | CONCEPT | CES↔eCIgn boundary | `Architecture/Integrations/CES-eCIgn.md` |
| `Documentation/08-Audit-and-Evidence-Model.md` | CONCEPT | Evidence rollup | `Architecture/Audit/Evidence-Model.md` |
| `Documentation/09-Metrics-and-Reporting.md` | DUP of 11-Metrics | Duplication risk | Keep canonical |
| `Documentation/10-Risk-and-Escalation-Model.md` | CONCEPT | Risk + escalation | `Architecture/CES/Risk-and-Escalation.md` |
| `UIUX/00-README.md` | UIUX | UI spec index | `UIUX/CES/` |
| `UIUX/01-UI-to-Execution-Mapping.md` | UIUX | Screen → execution-unit mapping | `UIUX/CES/` |
| `UIUX/02-Enforcement-Implementation.md` | UIUX | UI-side enforcement | `UIUX/CES/` |
| `UIUX/03-Board-Operation-In-Use.md` | UIUX | Board operation walkthrough | `UIUX/CES/` |
| `UIUX/04-eCIgn-Integration.md` | UIUX | Signature handoff UI | `UIUX/CES/` |
| `UIUX/05-Audit-and-Evidence-Generation.md` | UIUX | Evidence generation UI | `UIUX/CES/` |

> **Duplication risk:** `Compliance-Execution-Sprints/Documentation/` partially restates the top-level CES specs. The numbered files at the root remain canonical. The nested `Documentation/` folder must either be (a) re-scoped to integration-only docs (07, 08, 10) and the duplicates removed, or (b) replaced with a `README` that links into the canonical files.

---

## 2. eCIgn — `Builder/eCIgn/`

eCIgn is **one subsystem** of the platform. It must not dominate the Help Center.

| File | Class | Purpose | Recommended Home |
|---|---|---|---|
| `README.md` | CONCEPT + LEGAL | Scope, regulatory frame, doc index | `Architecture/eCIgn/00-Charter.md` |
| `01-System-Architecture.md` | CONCEPT | Frontend/backend topology | `Architecture/eCIgn/` |
| `02-Signature-Workflow.md` | CONCEPT | 6-step lifecycle | `Architecture/eCIgn/` |
| `03-Audit-and-Compliance-Model.md` | CONCEPT | Audit trail + compliance events | `Architecture/eCIgn/` + reference from `Architecture/Audit/` |
| `04-UI-Components.md` | COMP | Component inventory (file map) | `Developer-Reference/eCIgn/Components.md` |
| `05-Failure-Prevention.md` | CONCEPT | Hard guardrails | `Architecture/eCIgn/` |
| `06-Outputs-Templates-Watermarks.md` | CONCEPT + LEGAL | Template preservation contract | `Architecture/eCIgn/` |
| `07-Data-Models-and-API.md` | TECH | Types + REST/RPC surface | `Developer-Reference/eCIgn/API.md` |
| `08-Validation-and-Defensibility.md` | LEGAL | Legal Binding Eligibility certificate | `Compliance-Rationale/eCIgn-Defensibility.md` |
| `09-Multi-Signature-Flow.md` | CONCEPT | Roster, sequencing, decline & re-issue | `Architecture/eCIgn/` |

---

## 3. In-app Help Center — `src/policy/help/`

This is the **current shipping** Help Center. It is implementation, not architecture. The article registry will be re-shaped per `02-Knowledge-Base-Architecture.md` and `04-Knowledge-Base-Article-Plan.md`.

| File | Class | Purpose | Recommended Home / Action |
|---|---|---|---|
| `articles/index.ts` | TECH (registry) | Article registry + types | Keep; expand category list to match new IA |
| `articles/getting-started.ts` | USER | Welcome, roles, navigation | Keep; rewrite leads so eCIgn is one of many subsystems, not the headline |
| `articles/signing-documents.ts` | USER | eCIgn signing tasks | Move under category `signatures-ecign` |
| `articles/compliance-audit.ts` | USER | Audit & compliance tasks | Split: CES-related → `audit-reporting`; eCIgn-specific stays |
| `articles/workflows-events.ts` | USER | Workflow & event handling | Move under `workflows-evidence` |
| `articles/forms-templates.ts` | USER | Forms library tasks | Move under `forms-library` |
| `articles/developer-ecign.ts` | TECH | Developer reference for eCIgn | Move under `developer-reference` (eCIgn subsection) |
| `HelpCenterPage.tsx` | COMP | Help center page | Update to render new IA (categories, breadcrumbs, contextual links) |
| `HelpContextLink.tsx` | COMP | In-app contextual help link | Keep; adopt new article-slug scheme |

> **Risk:** Today the Help Center categories are eCIgn-leaning. Article rehoming is required (see `04-Knowledge-Base-Article-Plan.md`).

---

## 4. Component-level / system documentation — `Builder/Documentations/`

| File | Class | Purpose | Recommended Home |
|---|---|---|---|
| `App_Component_Documentation/Component_Registry.md` | COMP | Component registry | `Developer-Reference/Components/Registry.md` |
| `App_Component_Documentation/Component_Detail_Docs.md` | COMP | Per-component details | `Developer-Reference/Components/` |
| `App_Component_Documentation/Page_and_Route_Map.md` | TECH | Route/page map | `Developer-Reference/Routes.md` |
| `App_Component_Documentation/Universal_Navigation_System.md` | COMP | Nav system | `Developer-Reference/Components/Navigation.md` |
| `App_Component_Documentation/Workflow_and_Events_System.md` | CONCEPT | Workflow/event system | `Architecture/Workflows/` |
| `App_Component_Documentation/Print_System_Architecture.md` | CONCEPT | Print pipeline | `Architecture/Print/` |
| `App_Component_Documentation/Internal_Signature_Flow.md` | CONCEPT | Signature internals | Cross-link from `Architecture/eCIgn/` (do not duplicate) |
| `App_Component_Documentation/Third_Party_Audit_Trail_Simulation.md` | OPS | Audit simulation | `Compliance-Rationale/Audit-Simulations.md` |
| `App_Component_Documentation/Integration_Map.md` | TECH | System integrations | `Architecture/Integrations/Map.md` |
| `App_Component_Documentation/Data_Model_and_Files.md` | TECH | Data models + file layout | `Developer-Reference/Data-Model.md` |
| `App_Component_Documentation/Developer_Maintenance_Guide.md` | TECH | Maintenance | `Developer-Reference/Maintenance-Guide.md` |
| `App_Component_Documentation/aws-phase1-component-mapping.md` | TECH | AWS migration mapping | `Developer-Reference/Infrastructure/AWS-Mapping.md` |
| `App_Component_Documentation/Brad_System_Architecture.md` | CONCEPT | Brad subsystem architecture | `Architecture/Brad/` |
| `Survey-Simulation/01-...→06-...` | OPS + CONCEPT | Survey simulation roadmap | `Architecture/Survey-Simulation/` |
| `iAdministrator-Manual.md` | USER | iAdministrator end-user guide | Source for `End-User-Manuals/Administrator/` |
| `iAdministrator-Operator Guide.md` | USER | iAdministrator operator guide | Source for `End-User-Manuals/Administrator/` |
| `MASTER_CONTROL_INVENTORY.md` (+ JSON) | TECH | Master control inventory | `Developer-Reference/Master-Control-Inventory.md` |
| `MASTER_CONTROL_INVENTORY_DATA_MODEL.json` | TECH | Inventory data model | Same |
| `WORKFLOW_LIBRARY_ARCHITECTURE.md` | CONCEPT | Workflow library architecture | `Architecture/Workflows/Library.md` |
| `LIBRARY_COVERAGE_9_POLICIES.md` | OPS | Coverage report | `Compliance-Rationale/Coverage-Reports/` |
| `R2_STORAGE_ARCHITECTURE.md` | TECH | Storage | `Developer-Reference/Infrastructure/R2-Storage.md` |
| `RegulatoryPlannerOverview.txt` | CONCEPT | Regulatory planner | `Architecture/Regulatory-Planner/Overview.md` |
| `PP_AMENDMENT_REGISTER.md` | OPS | Amendment register | `Compliance-Rationale/Amendment-Register.md` |
| `Brad_QA_*` (3 files) | OPS | Brad QA reports | `Architecture/Brad/QA/` |
| `Brad2-01..17-*` | CONCEPT + OPS | Brad 2.0 architecture sprint set | `Architecture/Brad/2.0/` |
| `Brad2-README.md`, `Brad-README.md`, `BizRisk-README.md`, `README.md` | INDEX | READMEs | Link from `Architecture/Brad/` |
| `01..10-*` (Executive Security, Threat Model, etc.) | LEGAL + CONCEPT | Security & compliance documents | `Compliance-Rationale/Security/` |
| `CO-CA-001.md`, `EN-CM-001.md`, `EN-LC-001.md`, `EN-TG-001.md`, `RM-EP-001.md`, `RM-OS-001..004.md` | OPS | Policy source docs | Stay in `Builder/Compliance/` (policies are not KB articles); link from KB |
| `ChatGPTmandatedEvents.md` | OPS | Mandated events ledger | `Architecture/Regulatory-Planner/Mandated-Events.md` |
| `AUDIT_REPORT.md` | OPS | Internal audit report | `Compliance-Rationale/Internal-Audits/` |
| `AWS_Phase1_Foundation_Build_Plan.md` | TECH | AWS build plan | `Developer-Reference/Infrastructure/AWS-Build-Plan.md` |

> **Duplication risk:** Several Brad/Brad2 documents and the security/threat-model series exist in **two roots** (`Builder/Documentations/` and `Builder/Brad/`, `Business Risk & Analytics Director Brad2.0/`). The Knowledge Base must point at **one canonical copy** per document and mark the others as superseded. See `03-Conceptual-Documentation-Map.md` § "Brad lineage".

---

## 5. Other top-level Builder docs

| File | Class | Purpose | Recommended Home |
|---|---|---|---|
| `Builder/CO-CA-001.md`, `EN-CM-001.md`, `EN-LC-001.md`, `EN-TG-001.md`, `RM-EP-001.md`, `RM-OS-00x.md` | OPS | Policy sources | Stay in `Builder/Compliance/`; link from KB articles, do not duplicate |
| `Builder/CL-OA-006-extracted.txt` | OPS | Extracted policy text | Same |
| `Builder/FinalPolicylbrary.html`, `FormsLibraryFindal.html`, `PolicyDetailView.html`, `TaxonomyCoverPage.html`, `GlassmorphicDesign.html` | UIUX (legacy mocks) | Static HTML mocks | `Architecture/UIUX/Legacy-Mocks/` (reference only; not KB) |
| `Builder/framework.tsx` | TECH (legacy) | Legacy framework prototype | Out of scope; tag as `OUTDATED` |
| `Builder/patch_docx_wordcount.py` | TECH (script) | Utility script | `Developer-Reference/Scripts/` |
| `Builder/Brad/FinalUpgradeBrad421.txt` | CONCEPT | Brad upgrade notes | `Architecture/Brad/Upgrade-Notes/` |
| `Builder/Compliance/Documents/` | OPS | Compliance source documents | Stays; cross-linked from KB |
| `Builder/Compliance/ChatGPTmandatedEvents.md` | DUP | Same as `Documentations/ChatGPTmandatedEvents.md` | Keep canonical at `Documentations/`; remove or link from `Compliance/` |
| `Builder/iAdministrator/` (empty) | — | Empty | Drop |
| `Builder/Forns/`, `Builder/PolicyandForms/`, `Builder/Policies/`, `Builder/Journey/`, `Builder/Main/`, `Builder/Taxonomy_Policies/`, `Builder/Framework`, `Builder/ci-ion/` | UIUX/legacy | Source mocks, screenshots, taxonomy | `Architecture/UIUX/Legacy-Mocks/` (preserve for reference; not KB) |
| `Builder/Documentations/Survey-Simulation/Medicare ... .docx` | OPS | Binary roadmap | Keep in source folder; link only |
| `Builder/Compliance-Execution-Sprints/UIUX` (file, not folder) | UIUX | Single UIUX index | Move into `UIUX/CES/` after confirming structure |
| `Builder/Documentations/Brad_QA_Interaction_Samples.md`, `Brad_QA_Remediation_Plan.md`, `Brad_QA_Simulation_Report.md` | OPS | Brad QA | Canonical at `documentation/` (root), link only |

---

## 6. Root-level documentation — `documentation/`

| File | Class | Purpose | Recommended Home |
|---|---|---|---|
| `documentation/Brad_Model_Usage_Policy.md` | OPS | Brad usage policy | `Architecture/Brad/Policies/` |
| `documentation/Brad_QA_100_Test_Cases.csv` | OPS | Test cases | `Architecture/Brad/QA/` |
| `documentation/Brad_QA_Interaction_Samples.md` | OPS | Sample interactions | Same |
| `documentation/Brad_QA_Remediation_Plan.md` | OPS | Remediation plan | Same |
| `documentation/Brad_QA_Simulation_Report.md` | OPS | Simulation report | Same |

> Canonical Brad QA documents live in `documentation/`. The duplicates under `Builder/Documentations/` should be removed or reduced to a one-line link.

---

## 7. Root README + standalone

| File | Class | Purpose | Recommended Home |
|---|---|---|---|
| `README.md` | INDEX | Repo readme | Keep; add link to Knowledge Base index |
| `HUBSTAFF_USER_MANUAL.html` | USER | Hubstaff manual (HTML) | `End-User-Manuals/Integrations/Hubstaff/` (convert to MD link) |
| `migrations/001_ecign_schema.sql` | TECH | DB schema | `Developer-Reference/eCIgn/Schema.sql` (link) |
| `scripts/*.ts` | TECH | Operational scripts | `Developer-Reference/Scripts/` |

---

## 8. Outdated / supersession candidates

| File | Status | Action |
|---|---|---|
| `Builder/Documentations/Brad_System_Architecture.md` vs `Builder/Brad/FinalUpgradeBrad421.txt` vs `Brad2-*` | Three generations | Mark earlier as superseded; canonical = Brad2 set |
| `Builder/Compliance-Execution-Sprints/Documentation/03..06,09` | Duplicates of root CES docs | Mark deprecated; redirect to canonical |
| `src/policy/pages/DashboardPage.tsx.backup`, `MasterCalendarPage.tsx.backup`, `TaxonomyPage.old.tsx` | OUTDATED | Out of scope for KB |
| `Builder/framework.tsx`, `Builder/Framework` (file), `Builder/Forns/`, legacy HTML mocks | OUTDATED for end-user docs | Reference only in `UIUX/Legacy-Mocks/` |

---

## 9. Summary — counts

| Class | Count (approx) |
|---|---|
| CONCEPT (architecture) | ~45 |
| TECH (data/API/registry) | ~15 |
| COMP (component-level) | ~10 |
| USER (end-user / KB) | ~7 (current articles) + iAdministrator manuals |
| OPS / LEGAL | ~25 |
| Duplication risks identified | 9 |
| Outdated candidates | 6 |

These counts drive the article-plan and rehoming work in `02..07`.
