# 02 — Knowledge Base Information Architecture

> **Location:** `Builder/Knowledge-Base/02-Knowledge-Base-Architecture.md`
> **Status:** Authoritative information architecture for the in-app Help Center, the Knowledge Base, and the documentation tree.

---

## 1. Design principles

1. **CES is the operating system.** Compliance Execution Sprints is the primary operational surface. Every other subsystem feeds into or is consumed by CES.
2. **eCIgn is one subsystem.** It is a category, not the Help Center.
3. **Three audiences, three voices.**
   - End users → "do this, don't do that, here is what you'll see."
   - Administrators / Compliance Officers → "configure, govern, escalate, defend."
   - Developers → "shape, contract, fail-mode, integrate."
4. **Conceptual architecture is not a help article.** Architecture lives in `Architecture/`, `System/`, `UIUX/`, `Compliance-Rationale/`, `Developer-Reference/`. KB articles **link** to architecture; they do not duplicate it.
5. **Every article is operational.** Article = task, decision, or check. Not narrative.
6. **Every article is contextual.** Each article has a `contextual placement` (route + UI surface) so `HelpContextLink` can deep-link.
7. **One canonical source per fact.** Duplicates are flagged and reduced to links (see `01-Documentation-Inventory.md`).

---

## 2. Top-level Help Center categories

| # | Category | Slug | Purpose | Primary audience |
|---|---|---|---|---|
| 1 | Getting Started | `getting-started` | Orientation, roles, navigation, first sprint | All |
| 2 | Compliance Execution Sprints | `ces` | Sprint board, execution units, calendar primacy, retrospective | Compliance Officer, Workflow Owner, Staff |
| 3 | Workflows & Evidence | `workflows-evidence` | Workflow engine, execution units, evidence capture | Workflow Owner, Staff |
| 4 | Forms Library | `forms-library` | Form discovery, fill, validate, version | Staff, Compliance Officer |
| 5 | Signatures & eCIgn | `signatures-ecign` | Signing lifecycle, multi-signer, void/re-issue, defensibility | Signer, Approver, Compliance Officer |
| 6 | Audit & Reporting | `audit-reporting` | Audit Mode, evidence rollup, executive reports, survey packets | Compliance Officer, Auditor, Administrator |
| 7 | Administration | `administration` | Roles, tiers, calendar config, governance, lifecycle | Administrator, Compliance Officer |
| 8 | Troubleshooting | `troubleshooting` | Errors, blocked items, remediation, escalation | All |
| 9 | Developer Reference | `developer-reference` | API, data models, components, integration, infra | Developer |

> **Hard rule:** Categories 2 (CES) and 3 (Workflows & Evidence) appear **before** Category 5 (Signatures & eCIgn) in every navigation surface. eCIgn must never be the visual or hierarchical headline.

---

## 3. Subcategories (per top-level)

### 1. Getting Started
- Welcome & platform overview
- Roles, tiers, and permissions
- Navigation & workspace layout
- Your first sprint
- Where to find help

### 2. Compliance Execution Sprints
- Sprint cadence & boundaries
- The Sprint Execution Board
- Execution units & assignment
- Calendar primacy & rescheduling
- Recurring execution items
- Closing a sprint
- Monthly retrospective

### 3. Workflows & Evidence
- Workflow lifecycle (Prep → Doc → Review → Sign → Audit)
- Working an execution unit
- Capturing evidence
- Reassignment and delegation
- Blocked items and gating

### 4. Forms Library
- Browsing and searching forms
- Filling a form
- Saving drafts and versioning
- Form print view
- Linking forms to workflows and policies

### 5. Signatures & eCIgn
- Single signature flow (6-step lifecycle)
- Multi-signature flow (roster, sequencing)
- Decline, void, and re-issue
- Reading the audit trail
- Template preservation contract (why nothing moves)

### 6. Audit & Reporting
- Audit Mode walkthrough
- Survey packet generation
- Executive reports
- Compliance metrics (on-time, blocked, audit-readiness)
- Workload distribution

### 7. Administration
- Configuring tiers and approvers
- Managing the regulatory calendar
- Governing policies and forms (EN-LC-001 lifecycle)
- Amendment register
- iAdministrator manual

### 8. Troubleshooting
- Why is my sprint item blocked?
- Why won't this document sign?
- "Print rejected — template integrity"
- Calendar drift / event missed
- Access denied (tier check failed)

### 9. Developer Reference
- Architecture index (links into `Architecture/`)
- Data model index (links into `Developer-Reference/`)
- Component registry
- API surface (CES, eCIgn, Audit, Calendar)
- Scripts and runbooks

---

## 4. Article schema (binding contract)

The existing registry type in `src/policy/help/articles/index.ts` is the binding contract and must be extended as below:

```ts
export interface HelpArticle {
  slug:        string;
  title:       string;
  category:    'getting-started' | 'ces' | 'workflows-evidence' | 'forms-library'
             | 'signatures-ecign' | 'audit-reporting' | 'administration'
             | 'troubleshooting' | 'developer-reference';
  subcategory?: string;
  audience:    Array<'all' | 'compliance-officer' | 'administrator'
             | 'workflow-owner' | 'staff' | 'signer' | 'approver'
             | 'auditor' | 'developer'>;
  purpose:     string;          // 1 sentence
  whenToUse:   string;          // 1 sentence
  steps?:      string[];        // operational steps (≤ 7)
  systemBehavior:   string;     // what the system does
  complianceImpact: string;     // citation + rule
  evidence:         string;     // artifacts produced
  contextualPlacement: {        // where in the app this article surfaces
    route:    string;           // e.g. '/ces/board'
    surface?: string;           // e.g. 'WorkflowDrawer.assign'
  };
  related: {
    policies?:   string[];      // policy IDs (EN-CM-001, ...)
    workflows?:  string[];      // workflow IDs (QA-WF-01, ...)
    endpoints?:  string[];      // REST/RPC paths
    components?: string[];      // component class names
    articles?:   string[];      // sibling article slugs
    architecture?: string[];    // links into Builder/Knowledge-Base/Architecture/...
  };
}
```

> **Required fields beyond today's schema:** `audience`, `contextualPlacement`, `related.architecture`. These are non-negotiable.

---

## 5. Folder layout under `Builder/Knowledge-Base/`

```
Builder/Knowledge-Base/
├── 00-README.md
├── 01-Documentation-Inventory.md
├── 02-Knowledge-Base-Architecture.md
├── 03-Conceptual-Documentation-Map.md
├── 04-Knowledge-Base-Article-Plan.md
├── 05-Component-Documentation-Plan.md
├── 06-End-User-Manual-Structure.md
├── 07-Implementation-Recommendation.md
│
├── Architecture/                   # CONCEPT — system designs (link to Builder/* canonicals)
│   ├── CES/
│   ├── eCIgn/
│   ├── Workflows/
│   ├── Audit/
│   ├── Print/
│   ├── Regulatory-Planner/
│   ├── Brad/
│   ├── Survey-Simulation/
│   └── Integrations/
│
├── System/                         # TECH — system-level technical references
│   ├── Data-Model/
│   ├── Routes/
│   └── Infrastructure/
│
├── UIUX/                           # UIUX — interaction specs
│   ├── CES/
│   ├── eCIgn/
│   ├── Forms/
│   └── Legacy-Mocks/
│
├── Compliance-Rationale/           # LEGAL — defensibility, audits, control matrices
│   ├── eCIgn-Defensibility.md
│   ├── Security/
│   ├── Coverage-Reports/
│   ├── Internal-Audits/
│   └── Amendment-Register.md
│
├── Developer-Reference/            # TECH — APIs, components, scripts
│   ├── CES/
│   ├── eCIgn/
│   ├── Components/
│   ├── Infrastructure/
│   └── Scripts/
│
├── KB-Articles/                    # USER — source-of-truth Markdown for Help Center
│   ├── 01-getting-started/
│   ├── 02-ces/
│   ├── 03-workflows-evidence/
│   ├── 04-forms-library/
│   ├── 05-signatures-ecign/
│   ├── 06-audit-reporting/
│   ├── 07-administration/
│   ├── 08-troubleshooting/
│   └── 09-developer-reference/
│
└── End-User-Manuals/               # USER — long-form role-based manuals
    ├── Compliance-Officer/
    ├── Administrator/
    ├── Workflow-Owner/
    ├── Staff/
    ├── Approver-Signer/
    ├── Auditor/
    └── Integrations/
```

> Markdown KB articles are authored under `KB-Articles/` (one MD per article). The TS registry under `src/policy/help/articles/` becomes a thin index that imports metadata; article body rendering uses MD via the existing Help Center page (implementation detail covered in `07-Implementation-Recommendation.md`).

---

## 6. Cross-linking rules

| From | Allowed To | Example |
|---|---|---|
| KB Article | Architecture, Component doc, Policy, Workflow, sibling article | A `signatures-ecign/single-signature` article links to `Architecture/eCIgn/02-Signature-Workflow.md` |
| Architecture doc | Other Architecture docs only | `Architecture/CES/Charter` links to `Architecture/Integrations/CES-eCIgn` |
| Component doc | Architecture + KB articles | `Components/SprintExecutionBoard` links to its KB articles |
| End-User Manual | KB articles + Components + escalation paths | `Compliance-Officer/Sprint-Closing` references KB articles + `SprintExecutionBoard` |

> **Forbidden:** A KB article must not contain large block-quoted architecture. Link, do not paste.

---

## 7. Contextual placement (in-app `?` icons)

Every screen surface declares a `helpSlug`. `HelpContextLink` reads the slug and routes to `/help/:category/:slug`.

| Surface | Default helpSlug |
|---|---|
| `/ces/board` (Sprint Execution Board) | `ces/board-overview` |
| `/ces/board` → ExecutionUnitCard | `ces/working-an-execution-unit` |
| `/ces/board` → WorkflowDrawer | `workflows-evidence/workflow-lifecycle` |
| `/ces/calendar` | `ces/calendar-primacy` |
| `/ces/workloads` | `audit-reporting/workload-distribution` |
| `/ces/reports` | `audit-reporting/executive-reports` |
| `/forms` | `forms-library/browsing-forms` |
| `/forms/:id` | `signatures-ecign/single-signature` |
| `/forms/:id` (multi-signer banner) | `signatures-ecign/multi-signature` |
| `/audit` | `audit-reporting/audit-mode-walkthrough` |
| `/dashboard` | `getting-started/welcome` |
| `/help` | `getting-started/where-to-find-help` |

---

## 8. Search & discovery

- Free-text search across `title`, `purpose`, `systemBehavior`, `complianceImpact`, `steps`.
- Faceted filter by `category`, `audience`, `policies`, `workflows`.
- "Related" panel surfaces sibling articles, policies, components, architecture links.
- Empty-state suggestion: top-3 articles per category.

---

## 9. Naming convention

| Asset | Convention |
|---|---|
| KB article slug | `kebab-case`, ≤ 5 tokens, scoped under category folder |
| KB article file | `KB-Articles/<NN>-<category>/<slug>.md` |
| Architecture doc | `NN-Title-Case-Hyphenated.md` |
| Component doc | `Components/<ComponentName>.md` (PascalCase to match TSX) |
| End-User Manual section | `<NN>-<Section-Title>.md` per role folder |

---

## 10. Acceptance criteria for IA work

- All categories 1–9 implemented in registry and renderer.
- eCIgn surfaces never appear before CES in primary navigation.
- Every KB article has a `contextualPlacement.route`.
- No KB article embeds more than 50 lines from any architecture doc.
- Every architecture doc has at least one KB article linking to it (or is justified as developer-only and linked from `Developer-Reference/`).
- All deprecated/duplicate documents identified in `01-Documentation-Inventory.md` either redirect or are removed.
