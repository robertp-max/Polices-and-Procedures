# 07 — Implementation Recommendation

> **Location:** `Builder/Knowledge-Base/07-Implementation-Recommendation.md`
> **Status:** Authoritative build sequence for the Knowledge Base, Help Center IA, component docs, end-user manuals, contextual help, and in-app Help Center UI changes. **No application code is to be written before this sequence is followed.**

---

## 1. Build sequence (do not reorder)

| Step | Output | Owner | Exit criterion |
|---|---|---|---|
| 1 | **Information architecture finalized** (`02-Knowledge-Base-Architecture.md`) | Information Architect | Categories 1–9 ratified by Compliance Officer + Administrator |
| 2 | **Documentation rehoming map executed** (per `03-Conceptual-Documentation-Map.md`) | Doc Engineer | Every architecture doc has a stub at its target path; duplicates marked DEPRECATE |
| 3 | **KB article registry expanded** (per `04-Knowledge-Base-Article-Plan.md`) | Doc Engineer + Compliance Officer | TS registry types updated; 59 article slugs reserved; placeholder MD files created in `KB-Articles/` |
| 4 | **Component docs scaffolded** (per `05-Component-Documentation-Plan.md`) | Engineering | One MD per major component; sections per template; source-path links validated |
| 5 | **End-user manuals scaffolded** (per `06-End-User-Manual-Structure.md`) | Compliance Officer + Doc Engineer | Six role folders + checklists |
| 6 | **Contextual help links wired** | Engineering | Every surface in `02-Knowledge-Base-Architecture.md` § 7 has a `helpSlug`; `HelpContextLink` resolves to `/help/:category/:slug` |
| 7 | **In-app Help Center UI updated** | Engineering | Renderer reflects new categories, audience facets, related panel, MD body source |

> **Anti-pattern:** writing articles before IA is ratified. Articles will sit in the wrong category and require rewriting. Hold the line at step 1.

---

## 2. Folder + file scaffold (canonical layout)

```
Builder/Knowledge-Base/
├── 00-README.md                               (index → these 7 docs)
├── 01-Documentation-Inventory.md
├── 02-Knowledge-Base-Architecture.md
├── 03-Conceptual-Documentation-Map.md
├── 04-Knowledge-Base-Article-Plan.md
├── 05-Component-Documentation-Plan.md
├── 06-End-User-Manual-Structure.md
├── 07-Implementation-Recommendation.md
├── Architecture/
│   ├── CES/                                   (link stubs to canonical CES docs)
│   ├── eCIgn/                                 (link stubs to canonical eCIgn docs)
│   ├── Workflows/
│   ├── Audit/
│   ├── Print/
│   ├── Regulatory-Planner/
│   ├── Brad/
│   ├── Survey-Simulation/
│   └── Integrations/
├── System/
│   ├── Data-Model/
│   ├── Routes/
│   └── Infrastructure/
├── UIUX/
│   ├── CES/
│   ├── eCIgn/
│   ├── Forms/
│   └── Legacy-Mocks/
├── Compliance-Rationale/
│   ├── Security/
│   ├── Coverage-Reports/
│   ├── Internal-Audits/
│   └── Control-Matrices/
├── Developer-Reference/
│   ├── CES/
│   ├── eCIgn/
│   ├── Components/
│   ├── Server/
│   ├── Infrastructure/
│   └── Scripts/
├── KB-Articles/
│   ├── 01-getting-started/
│   ├── 02-ces/
│   ├── 03-workflows-evidence/
│   ├── 04-forms-library/
│   ├── 05-signatures-ecign/
│   ├── 06-audit-reporting/
│   ├── 07-administration/
│   ├── 08-troubleshooting/
│   └── 09-developer-reference/
└── End-User-Manuals/
    ├── Compliance-Officer/
    ├── Administrator/
    ├── Workflow-Owner/
    ├── Staff/
    ├── Approver-Signer/
    ├── Auditor/
    └── Integrations/
        └── Hubstaff/
```

---

## 3. Naming conventions (binding)

| Asset | Convention | Example |
|---|---|---|
| Architecture KB doc | `NN-Title-Case-Hyphenated.md` | `06-Sprint-Board-and-States.md` |
| Architecture stub (KB) | mirrors canonical name | `Architecture/CES/06-Sprint-Board-and-States.md` |
| KB article folder | `NN-category-slug` | `02-ces` |
| KB article file | `<slug>.md`, kebab-case | `working-an-execution-unit.md` |
| Component doc | `<ComponentName>.md` (PascalCase) | `SprintExecutionBoard.md` |
| End-user manual section | `NN-Section-Name.md` | `03-What-You-Must-Do.md` |
| Role folder | `Title-Case` | `Compliance-Officer/` |
| Asset / image | `<slug>-NN.png` | `working-an-execution-unit-01.png` |

> **Hard rule:** No spaces in file names. No mixed casing within a folder. Slugs match between MD file, TS registry, and Help Center URL.

---

## 4. Article registry update (TypeScript)

The TS registry under `src/policy/help/articles/` is the runtime contract. The minimum viable change list:

1. Extend `HelpArticle` per `02-Knowledge-Base-Architecture.md` § 4 (`audience`, `contextualPlacement`, `related.architecture`).
2. Replace the current six categories with the nine defined in this plan.
3. Reorder `CATEGORIES` so CES appears second (after Getting Started) and `signatures-ecign` appears fifth.
4. Split `compliance-audit.ts` into `audit-reporting.ts` (CES + audit) and additions to `signatures-ecign.ts`.
5. Rename `signing-documents.ts` → `signatures-ecign.ts`.
6. Add `ces.ts`, `forms-library.ts`, `administration.ts`, `troubleshooting.ts`.
7. Move `developer-ecign.ts` → `developer-reference.ts` (eCIgn becomes a subcategory).
8. Add a build-time step that loads the MD body for each article from `KB-Articles/<NN>-<category>/<slug>.md`.

> **Schema migration is breaking.** Add a single TypeScript change-set; do not partially migrate.

---

## 5. In-app Help Center UI updates

Required updates to `HelpCenterPage.tsx` and `HelpContextLink.tsx`:

| Change | Why |
|---|---|
| Render nine top-level categories with the order in § 2 of `02-Knowledge-Base-Architecture.md` | CES-first, eCIgn = subsystem |
| Show audience filter chips | Lets staff filter to "Staff" view |
| Show "Related" panel: policies / workflows / components / architecture | Cross-system navigation |
| Surface contextual deep-links via `HelpContextLink` from every screen in § 7 of the IA doc | Operational help |
| Add breadcrumbs (`Help / <Category> / <Article>`) | Findability |
| MD body rendering with safe HTML, code, tables | Article authoring lives in MD |
| 404 state with category fallback | Robust routing |

---

## 6. Quality gates (block merge until met)

| Gate | Check |
|---|---|
| IA gate | All 9 categories present; eCIgn not first |
| No-duplication gate | No KB article duplicates > 50 lines from any architecture doc |
| Coverage gate | Every architecture doc has at least one inbound link from KB or `Developer-Reference/` |
| Contextual-placement gate | Every article has `contextualPlacement.route` and at least one in-app surface points to it |
| Tier-and-audience gate | Every article lists `audience`; every component doc lists tier-aware enforcement |
| Source-link gate | All component-doc source paths resolve in CI |
| Lifecycle gate | All documents follow `EN-LC-001` versioning when changes are non-trivial |

---

## 7. Out-of-scope (intentionally)

- Writing the actual KB article bodies (this plan defines slugs and metadata, not content).
- Refactoring the article registry implementation beyond the schema change above.
- Migrating Brad / security documents into a new structure beyond the LINK / DEPRECATE actions in `03-Conceptual-Documentation-Map.md`.
- Building new in-app help features (search ranking, AI assist, telemetry). These are post-day-1.

---

## 8. Day-1 acceptance

The Knowledge Base is "done for day-1" when:

1. The seven `Builder/Knowledge-Base/0X-*.md` files exist and are ratified.
2. The `Builder/Knowledge-Base/Architecture/`, `System/`, `UIUX/`, `Compliance-Rationale/`, `Developer-Reference/`, `KB-Articles/`, `End-User-Manuals/` skeletons exist with stub READMEs.
3. The TS article registry exposes the nine categories and the `HelpArticle` schema in this plan.
4. Every screen in § 7 of the IA doc renders a `HelpContextLink` to the right slug (slug may resolve to a placeholder article on day 1).
5. The Compliance Officer and Administrator have signed off on the IA in `02-Knowledge-Base-Architecture.md`.

> Subsequent sprints fill in article bodies, component docs, and end-user manual content per the standard CES execution model.
