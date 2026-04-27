# 03 — Conceptual Documentation Map

> **Location:** `Builder/Knowledge-Base/03-Conceptual-Documentation-Map.md`
> **Status:** Authoritative mapping of conceptual / architecture documents into the Knowledge Base structure defined in `02-Knowledge-Base-Architecture.md`.

---

## 1. Action verbs

| Verb | Meaning |
|---|---|
| **MOVE** | Relocate the file. The original is gone (git history preserved). |
| **COPY** | Duplicate a file. Use only when one canonical cannot serve two audiences. |
| **LINK** | Leave the file where it is. Add a Markdown link from the KB. |
| **SUMMARIZE** | Create a short KB-side summary that links to the full canonical. |
| **DEPRECATE** | Mark superseded; replace body with a one-line redirect. |

> Default verb is **LINK** (cheapest, zero risk of drift). Use MOVE only where ownership truly transfers.

---

## 2. Architecture/

### 2.1 Architecture/CES/  (canonical = `Builder/Compliance-Execution-Sprints/`)

| Source | Verb | Target |
|---|---|---|
| `Compliance-Execution-Sprints/00-README.md` | LINK | `Architecture/CES/00-Charter.md` (one-line index → original) |
| `Compliance-Execution-Sprints/01-Execution-Model.md` | LINK | `Architecture/CES/` |
| `Compliance-Execution-Sprints/02-Sprint-Structure.md` | LINK | `Architecture/CES/` |
| `Compliance-Execution-Sprints/03-Workflow-Based-Execution.md` | LINK | `Architecture/CES/` |
| `Compliance-Execution-Sprints/04-Assignment-Model.md` | LINK | `Architecture/CES/` |
| `Compliance-Execution-Sprints/05-Work-Bundling-Strategy.md` | LINK | `Architecture/CES/` |
| `Compliance-Execution-Sprints/06-Sprint-Board-and-States.md` | LINK | `Architecture/CES/` (and link from `UIUX/CES/`) |
| `Compliance-Execution-Sprints/07-Recurring-Execution.md` | LINK | `Architecture/CES/` |
| `Compliance-Execution-Sprints/08-Monthly-Retrospective.md` | LINK | `Architecture/CES/` |
| `Compliance-Execution-Sprints/09-Calendar-Integration.md` | LINK | `Architecture/CES/` |
| `Compliance-Execution-Sprints/10-Enforcement-and-Rules.md` | LINK | `Architecture/CES/` |
| `Compliance-Execution-Sprints/11-Metrics-and-Reporting.md` | LINK | `Architecture/CES/` |
| `Compliance-Execution-Sprints/Documentation/01-System-Overview.md` | SUMMARIZE | `Architecture/CES/Overview.md` (5–10 lines + link) |
| `Compliance-Execution-Sprints/Documentation/02-Architecture-and-Data-Model.md` | LINK | `Developer-Reference/CES/Data-Model.md` |
| `Compliance-Execution-Sprints/Documentation/03..06,09` | DEPRECATE | Replace body with redirect to canonical at root |
| `Compliance-Execution-Sprints/Documentation/07-Signature-and-eCIgn-Integration.md` | LINK | `Architecture/Integrations/CES-eCIgn.md` |
| `Compliance-Execution-Sprints/Documentation/08-Audit-and-Evidence-Model.md` | LINK | `Architecture/Audit/Evidence-Model.md` |
| `Compliance-Execution-Sprints/Documentation/10-Risk-and-Escalation-Model.md` | LINK | `Architecture/CES/Risk-and-Escalation.md` |

### 2.2 Architecture/eCIgn/  (canonical = `Builder/eCIgn/`)

| Source | Verb | Target |
|---|---|---|
| `eCIgn/README.md` | LINK | `Architecture/eCIgn/00-Charter.md` |
| `eCIgn/01-System-Architecture.md` | LINK | `Architecture/eCIgn/` |
| `eCIgn/02-Signature-Workflow.md` | LINK | `Architecture/eCIgn/` |
| `eCIgn/03-Audit-and-Compliance-Model.md` | LINK | `Architecture/eCIgn/` (cross-link from `Architecture/Audit/`) |
| `eCIgn/04-UI-Components.md` | LINK | `Developer-Reference/eCIgn/Components.md` |
| `eCIgn/05-Failure-Prevention.md` | LINK | `Architecture/eCIgn/` |
| `eCIgn/06-Outputs-Templates-Watermarks.md` | LINK | `Architecture/eCIgn/` |
| `eCIgn/07-Data-Models-and-API.md` | LINK | `Developer-Reference/eCIgn/API.md` |
| `eCIgn/08-Validation-and-Defensibility.md` | LINK | `Compliance-Rationale/eCIgn-Defensibility.md` |
| `eCIgn/09-Multi-Signature-Flow.md` | LINK | `Architecture/eCIgn/` |

### 2.3 Architecture/Workflows/

| Source | Verb | Target |
|---|---|---|
| `Builder/Documentations/App_Component_Documentation/Workflow_and_Events_System.md` | LINK | `Architecture/Workflows/System.md` |
| `Builder/Documentations/WORKFLOW_LIBRARY_ARCHITECTURE.md` | LINK | `Architecture/Workflows/Library.md` |
| `Builder/Compliance/ChatGPTmandatedEvents.md` (canonical) | LINK | `Architecture/Regulatory-Planner/Mandated-Events.md` |
| `Builder/Documentations/ChatGPTmandatedEvents.md` | DEPRECATE | redirect to canonical |

### 2.4 Architecture/Audit/

| Source | Verb | Target |
|---|---|---|
| `Compliance-Execution-Sprints/Documentation/08-Audit-and-Evidence-Model.md` | LINK | `Architecture/Audit/Evidence-Model.md` |
| `eCIgn/03-Audit-and-Compliance-Model.md` | LINK | `Architecture/Audit/eCIgn-Audit-Model.md` |
| `Builder/Documentations/App_Component_Documentation/Third_Party_Audit_Trail_Simulation.md` | LINK | `Compliance-Rationale/Audit-Simulations.md` |
| `Builder/Documentations/AUDIT_REPORT.md` | LINK | `Compliance-Rationale/Internal-Audits/Latest.md` |

### 2.5 Architecture/Print/

| Source | Verb | Target |
|---|---|---|
| `Builder/Documentations/App_Component_Documentation/Print_System_Architecture.md` | LINK | `Architecture/Print/System.md` |
| `eCIgn/06-Outputs-Templates-Watermarks.md` | LINK | `Architecture/Print/Template-Preservation-Contract.md` (cross-link) |

### 2.6 Architecture/Regulatory-Planner/

| Source | Verb | Target |
|---|---|---|
| `Builder/Documentations/RegulatoryPlannerOverview.txt` | SUMMARIZE | `Architecture/Regulatory-Planner/Overview.md` (convert + link) |
| `Builder/Compliance/ChatGPTmandatedEvents.md` | LINK | `Architecture/Regulatory-Planner/Mandated-Events.md` |

### 2.7 Architecture/Brad/

| Source | Verb | Target |
|---|---|---|
| `Builder/Documentations/Brad_System_Architecture.md` | DEPRECATE (superseded by Brad2) | redirect to Brad2 set |
| `Builder/Brad/FinalUpgradeBrad421.txt` | LINK | `Architecture/Brad/Upgrade-Notes/421.md` |
| `Builder/Documentations/Brad2-01..17-*.md` | LINK | `Architecture/Brad/2.0/` (preserve numbering) |
| `Business Risk & Analytics Director Brad2.0/` content | LINK | `Architecture/Brad/2.0/` (canonical Brad2 lineage) |
| `Business_Risk_&_Analytics_Director/` content | DEPRECATE if pre-Brad2 | redirect |
| `documentation/Brad_Model_Usage_Policy.md` | LINK | `Architecture/Brad/Policies/Model-Usage.md` |
| `documentation/Brad_QA_*` (4 files) | LINK | `Architecture/Brad/QA/` (canonical at root `documentation/`) |
| `Builder/Documentations/Brad_QA_*` (3 files) | DEPRECATE | redirect to root canonicals |

> **Brad lineage rule:** the Brad2 set is canonical. The earlier Brad set is preserved by git history; the doc tree presents only Brad2 unless a reader explicitly opens the Upgrade Notes.

### 2.8 Architecture/Survey-Simulation/

| Source | Verb | Target |
|---|---|---|
| `Builder/Documentations/Survey-Simulation/01..06-*.md` | LINK | `Architecture/Survey-Simulation/` |
| `Builder/Documentations/Survey-Simulation/Medicare ... .docx` | LINK | `Architecture/Survey-Simulation/` (binary; reference link) |

### 2.9 Architecture/Integrations/

| Source | Verb | Target |
|---|---|---|
| `Builder/Documentations/App_Component_Documentation/Integration_Map.md` | LINK | `Architecture/Integrations/Map.md` |
| `Compliance-Execution-Sprints/Documentation/07-Signature-and-eCIgn-Integration.md` | LINK | `Architecture/Integrations/CES-eCIgn.md` |
| `Compliance-Execution-Sprints/UIUX/04-eCIgn-Integration.md` | LINK | `Architecture/Integrations/CES-eCIgn.md` (UIUX cross-link) |
| `HUBSTAFF_USER_MANUAL.html` | LINK | `End-User-Manuals/Integrations/Hubstaff/Manual.md` (manual conversion later) |

---

## 3. System/

| Source | Verb | Target |
|---|---|---|
| `Builder/Documentations/App_Component_Documentation/Data_Model_and_Files.md` | LINK | `System/Data-Model/Index.md` |
| `Builder/Documentations/MASTER_CONTROL_INVENTORY.md` | LINK | `System/Data-Model/Master-Control-Inventory.md` |
| `Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json` | LINK | Same (binary/JSON link) |
| `Builder/Documentations/App_Component_Documentation/Page_and_Route_Map.md` | LINK | `System/Routes/Map.md` |
| `Builder/Documentations/R2_STORAGE_ARCHITECTURE.md` | LINK | `System/Infrastructure/R2-Storage.md` |
| `Builder/Documentations/AWS_Phase1_Foundation_Build_Plan.md` | LINK | `System/Infrastructure/AWS-Phase1-Build-Plan.md` |
| `Builder/Documentations/App_Component_Documentation/aws-phase1-component-mapping.md` | LINK | `System/Infrastructure/AWS-Phase1-Component-Mapping.md` |
| `migrations/001_ecign_schema.sql` | LINK | `System/Data-Model/eCIgn-Schema.sql` |

---

## 4. UIUX/

| Source | Verb | Target |
|---|---|---|
| `Compliance-Execution-Sprints/UIUX/00-README.md` | LINK | `UIUX/CES/00-README.md` |
| `Compliance-Execution-Sprints/UIUX/01-UI-to-Execution-Mapping.md` | LINK | `UIUX/CES/` |
| `Compliance-Execution-Sprints/UIUX/02-Enforcement-Implementation.md` | LINK | `UIUX/CES/` |
| `Compliance-Execution-Sprints/UIUX/03-Board-Operation-In-Use.md` | LINK | `UIUX/CES/` |
| `Compliance-Execution-Sprints/UIUX/04-eCIgn-Integration.md` | LINK | `UIUX/CES/` |
| `Compliance-Execution-Sprints/UIUX/05-Audit-and-Evidence-Generation.md` | LINK | `UIUX/CES/` |
| `eCIgn/04-UI-Components.md` | LINK | `UIUX/eCIgn/Components.md` (developer cross-link) |
| `Builder/FinalPolicylbrary.html`, `FormsLibraryFindal.html`, `PolicyDetailView.html`, `TaxonomyCoverPage.html`, `GlassmorphicDesign.html` | LINK | `UIUX/Legacy-Mocks/` (preserve as reference; mark legacy) |

---

## 5. Compliance-Rationale/

| Source | Verb | Target |
|---|---|---|
| `eCIgn/08-Validation-and-Defensibility.md` | LINK | `Compliance-Rationale/eCIgn-Defensibility.md` |
| `Builder/Documentations/01-Executive-Security-Summary.md` … `10-Operational-Recommendations.md` | LINK | `Compliance-Rationale/Security/Brad1/` (DEPRECATE if Brad2 set is current) |
| `Builder/Documentations/Brad2-01..10-*.md` | LINK | `Compliance-Rationale/Security/Brad2/` (canonical) |
| `Builder/Documentations/HIPAA-SOC2 Control Matrix*` | LINK | `Compliance-Rationale/Control-Matrices/` |
| `Builder/Documentations/LIBRARY_COVERAGE_9_POLICIES.md` | LINK | `Compliance-Rationale/Coverage-Reports/Policies-9.md` |
| `Builder/Documentations/PP_AMENDMENT_REGISTER.md` | LINK | `Compliance-Rationale/Amendment-Register.md` |
| `Builder/Documentations/AUDIT_REPORT.md` | LINK | `Compliance-Rationale/Internal-Audits/Latest.md` |

---

## 6. Developer-Reference/

| Source | Verb | Target |
|---|---|---|
| `eCIgn/07-Data-Models-and-API.md` | LINK | `Developer-Reference/eCIgn/API.md` |
| `eCIgn/04-UI-Components.md` | LINK | `Developer-Reference/eCIgn/Components.md` |
| `Builder/Documentations/App_Component_Documentation/Component_Registry.md` | LINK | `Developer-Reference/Components/Registry.md` |
| `Builder/Documentations/App_Component_Documentation/Component_Detail_Docs.md` | LINK | `Developer-Reference/Components/Details.md` |
| `Builder/Documentations/App_Component_Documentation/Universal_Navigation_System.md` | LINK | `Developer-Reference/Components/Navigation.md` |
| `Builder/Documentations/App_Component_Documentation/Internal_Signature_Flow.md` | LINK | `Developer-Reference/eCIgn/Internal-Signature-Flow.md` |
| `Builder/Documentations/App_Component_Documentation/Developer_Maintenance_Guide.md` | LINK | `Developer-Reference/Maintenance-Guide.md` |
| `scripts/*.ts` | LINK | `Developer-Reference/Scripts/` (one MD index that lists each script + purpose) |
| `Builder/patch_docx_wordcount.py` | LINK | Same |
| `server/cli/`, `server/routes/`, `server/sync/`, `server/ecign/`, `server/ia/` | LINK | `Developer-Reference/Server/` (one MD per subfolder) |

---

## 7. End-User-Manuals/

| Source | Verb | Target |
|---|---|---|
| `Builder/Documentations/iAdministrator-Manual.md` | LINK | `End-User-Manuals/Administrator/iAdministrator-Manual.md` |
| `Builder/Documentations/iAdministrator-OperatorGuide.md` | LINK | `End-User-Manuals/Administrator/iAdministrator-Operator-Guide.md` |
| `HUBSTAFF_USER_MANUAL.html` | SUMMARIZE | `End-User-Manuals/Integrations/Hubstaff/Manual.md` (MD wrapper that links the HTML) |

---

## 8. Files explicitly NOT mapped into the KB

| File / Folder | Reason |
|---|---|
| `Builder/CO-CA-001.md`, `EN-*-001.md`, `RM-*-00x.md`, `Builder/Compliance/Documents/*` | These are **policies / forms**, not documentation. KB articles link to them; they are not part of the doc tree. |
| `Builder/framework.tsx`, `Builder/Framework`, `Builder/Forns/`, `Builder/PolicyandForms/`, `Builder/Policies/`, `Builder/Journey/`, `Builder/Main/`, `Builder/Taxonomy_Policies/`, `Builder/ci-ion/`, legacy HTML pages | Legacy mocks / source artifacts. Reference only via `UIUX/Legacy-Mocks/`. |
| `tmp-*.json`, `_rewrite_demo.cjs`, `tailwind.config.js`, `vite.config.ts`, `eslint.config.js`, `postcss.config.js` | Build / runtime artifacts. Not docs. |
| `*.ipynb` (none here) | N/A |
| `src/policy/pages/*.backup`, `*.old.tsx` | Out-of-date code; ignore. |
| `Builder/iAdministrator/` (empty) | Drop. |

---

## 9. Resulting Architecture/ tree (post-mapping, abbreviated)

```
Architecture/
├── CES/
│   ├── 00-Charter.md                  → Compliance-Execution-Sprints/00-README.md
│   ├── 01-Execution-Model.md          → ...
│   ├── ...
│   ├── Overview.md                    (SUMMARIZE)
│   ├── Risk-and-Escalation.md
├── eCIgn/
│   ├── 00-Charter.md
│   ├── 01-System-Architecture.md
│   ├── 02-Signature-Workflow.md
│   ├── 03-Audit-and-Compliance-Model.md
│   ├── 05-Failure-Prevention.md
│   ├── 06-Outputs-Templates-Watermarks.md
│   ├── 09-Multi-Signature-Flow.md
├── Workflows/
│   ├── System.md
│   └── Library.md
├── Audit/
│   ├── Evidence-Model.md
│   └── eCIgn-Audit-Model.md
├── Print/
│   ├── System.md
│   └── Template-Preservation-Contract.md
├── Regulatory-Planner/
│   ├── Overview.md
│   └── Mandated-Events.md
├── Brad/
│   ├── 2.0/                           (canonical Brad2 set)
│   ├── Upgrade-Notes/
│   ├── Policies/
│   └── QA/
├── Survey-Simulation/
└── Integrations/
    ├── Map.md
    └── CES-eCIgn.md
```

> Each leaf file is a **stub MD** that contains: title, one-paragraph summary, and a relative link to the canonical document under `Builder/`. This avoids duplication and prevents drift while still letting the KB and Help Center deep-link into a clean tree.
