# 13-framework-achc.png — Framework / ACHC / Taxonomy Pageviews

**File confirmed:** Exists at `Reference/V6/13-framework-achc.png` (shared shell capture size). Analyzed as visual reference for Taxonomy module views (Framework, ACHC Survey Alignment, ACHC Crosswalk) + related Policy Library matrix. PNG depicts overall shell (sidebar showing Taxonomy nav entry under Compliance Execution, light teal gradients, Brad modal overlay in some captures) with dynamic content from React prototypes.

**Base source:** `index.html` (primary prototype implementation). Redirects via `Taxonomy.html` (`#/framework`), `PolicyLibrary.html` (`#/library`).

## Taxonomy Navigation Group (VIEW_GROUPS registration ~1341)
Under "Taxonomy" group (appears in sidebar under COMPLIANCE EXECUTION section):
- **Framework** (`id: 'framework'`, route: `/framework`, icon: `network`, template: `framework`)
  - Description: "Architecture map tying domains, subdomains, policies, forms, workflows, and regulatory authorities together."
- **ACHC Survey Alignment** (`id: 'achc-survey'`, route: `/framework/achc-survey`, icon: `award`, template: `achc-survey`)
  - Description: "Surveyor evidence explorer for ACHC HH standards, policy support, open gaps, and readiness notes."
- **ACHC Crosswalk** (`id: 'achc-crosswalk'`, route: `/framework/achc-survey/crosswalk`, icon: `network`, template: `achc-crosswalk`)
  - Description: "Crosswalk table connecting ACHC standards, CMS/Title 22 references, policies, forms, and evidence type."
- **Policy Library** (`id: 'policy-library'`, route: `/library`, icon: `book-open`, template: `matrix`)
  - Related: Policy Viewer (`policy-detail`), Forms Library, etc.
  - Description focuses on library architecture scope + survey-ready context.

Sidebar rendering (Sidebar ~4308): Group header "Taxonomy" (uppercase tracking), icon+label buttons. Active uses `bg-[#004142] text-white`. Collapsible to 88px. Filter search applies across views.

Metrics row (generic, rendered above content unless dashboard): 4 `MetricCard` / `MetricTile` from `activeView.metrics`.

## Framework View (FrameworkPrototype ~2796)
**Layout:** `space-y-6`
- Top: `grid grid-cols-2 gap-4 lg:grid-cols-4` → 4 `MetricTile`s (from view.frameworkMetrics or fallback).
- Below: `grid grid-cols-1 gap-4 lg:grid-cols-3` → Domain cards.

**Metrics (seeded in view registration):**
```js
metric('Domains', '10', 'Top-level strategic pillars', 'teal'),
metric('Subdomains', '54', 'Framework structure', 'orange'),
metric('Framework policies', '269', 'Policy architecture scope', 'teal'),
metric('Lifecycle corpus', '279', 'Draft records tracked separately', 'green'),
```
(Prototype also defines fallback 4 metrics.)

**Domain Cards (frameworkDomains ~556):**
10 items rendered as white `rounded-2xl border border-brand-neutral-200 bg-white p-5 shadow-soft`:
- `ToneBadge tone="orange"` for code (GV, CL, QA, HR, CO, FN, OP, IT, RM, EN)
- h3 title (e.g. 'Governance', 'Clinical Operations')
- desc text (small neutral)
- Optional subdomain count in orange uppercase (e.g. '4 subdomains')
- Footer: "Inspect architecture" + chevron icon (teal-500)

Example domains:
- GV: Governance — Governing body, policy ownership, organizational authority — 4 subdomains
- CL: Clinical Operations — Assessment, care planning, OASIS... — 9 subdomains
- ...
- EN: Enterprise — Taxonomy, lifecycle, coordination, compliance metrics — 4 subdomains

**UI Notes:** Cards use `hover-lift` effects implicitly via shell. No deep links in prototype (static).

## ACHC Survey Alignment UI (AchcSurveyPrototype ~3763) — Surveyor-facing
**Main section (xl:col-span-4):** `rounded-2xl border ... bg-white shadow-soft`
- Header: "ACHC HH evidence explorer" + sub "Surveyor-facing matrix with policy support, evidence type, confidence, and owner action state."
- Mode tabs (inline-flex, teal bg): `['Evidence', 'Matrix', 'Crosswalk']` — first active (teal-500 white), Crosswalk styled orange text.
- Filter bar: `grid ... md:grid-cols-3 xl:grid-cols-5` — 5 pill buttons (default neutral, one highlighted orange): "HH Standard: All", "Policy ID: All", "Mapping confidence: All", "Evidence method: All", "Owner: All".
- Search: Icon-prefixed input, read-only value e.g. "governing body evidence", focus styles to teal border/white bg.

**Rows list (divide-y):** Each `article` grid (responsive lg: 110px | 1fr | 130px | 130px):
- Col1: `<ToneBadge tone={toneName}>{standard}</ToneBadge>` (e.g. HH5-2A.01)
- Col2: h4 prompt (bold), small evidence/desc text.
- Col3: Policy ID (teal-600 bold xs).
- Col4: Status `<ToneBadge tone={toneName}>{status}</ToneBadge>` (Supported=teal, Review/Gap=orange).

**Seeded data (achcSurveyRowsSeed ~569):**
```js
['HH5-2A.01', 'Comprehensive assessment...', 'CL-CA-001', 'SOC OASIS, RN assessment...', 'Supported', 'teal'],
['HH1-1A.01', 'Governing body authority...', 'GV-GB-001', 'Minutes, roster...', 'Supported', 'teal'],
['HH1-12A.01', 'Contract and vendor...', 'GV-EA-001', ..., 'Review', 'orange'],
...
```

**Aside (xl:col-span-2):**
- "Surveyor prompt" `ToneBadge tone="orange"` + h3 (from view.surveyPrompt e.g. "Show evidence that governing body authority...") + explanatory text.
- Checklist items (promptItems): flex between label + check-circle-2 (teal) or circle (orange) icons in neutral-50 bg.
- SurfaceCard: "Readiness note" (teal, shield-check).

**Filters default:** `['HH Standard', 'Policy ID', 'Mapping confidence', 'Evidence method', 'Owner']`
**Survey prompt items example:** ['Direct text support', 'Meeting minutes', 'Source documentation', 'Reviewer-required mappings']

## ACHC Crosswalk Tables (AchcCrosswalkPrototype ~3836)
**Main section:** Header with title "Regulatory crosswalk" + description + orange "Export CSV" button (uppercase tracking).

**Crosswalk table:**
- Header row: `grid grid-cols-[.72fr_.92fr_.9fr_.9fr_.65fr_.78fr] bg-neutral-50` with uppercase small tracking headers.
  Default headers: `['ACHC', 'CMS / State', 'Policy', 'Form', 'Evidence', 'Mapping']`
- Body rows (hover:bg-teal-50/40): same grid, items-center px-4 py-4 text-sm.
  - ACHC: `<ToneBadge tone={toneName}>{standard}</ToneBadge>`
  - CMS/State: xs neutral text (e.g. '42 CFR 484.55 / 22 CCR 74695')
  - Policy: font-heading xs bold teal-600
  - Form: xs bold teal-600
  - Evidence: xs neutral (e.g. 'P, D, S')
  - Mapping: `<ToneBadge tone={toneName}>{mapping}</ToneBadge>` (Exact=green, Partial=orange, Review=orange)

**Seeded crosswalkRows (achcCrosswalkRowsSeed ~577 + prototype defaults):**
```js
['HH5-2A.01', '42 CFR 484.55 / 22 CCR 74695', 'CL-CA-001', 'CL-FM-001', 'P, D', 'Exact', 'green'],
['HH1-1A.01', '42 CFR 484.105 / 22 CCR 74659', 'GV-GB-001', 'GV-FM-005', 'P, D, S', 'Exact', 'green'],
['HH1-12A.01', '42 CFR 484.105(e)', 'GV-EA-001', ..., 'Partial', 'orange'],
...
```

**Aside (xl:col-span-2):**
- Reviewer queue card: orange ToneBadge "Partial mappings" + h3, then stack of orange-50 border cards: standard + note text (e.g. "Disaster recovery note needs parent relationship.").
  Seeded examples include HH5-1B, HH7-2A, HH9-4D notes.
- SurfaceCard: "Crosswalk source" (teal, network icon) describing traceability.

**Metrics (for crosswalk view):**
Crosswalk rows 312, Exact matches 218 (green), Partial 64 (orange), Unmapped 9 (orange).

**Table styling:** Consistent with DataTable but custom grid (not using shared DataTable). Status via ToneBadge dots + colors. Evidence codes (P=Policy, D=Doc, S=Signature, I=etc.) visible.

## Policy Library (Related, MatrixPrototype + DataTable ~4203, 1911)
**Registration metrics/cards:**
- Metrics: Framework policies 269 (teal), Active 269 (green), Review cycle Annual (orange), Regulatory boards 7 (teal).
- Cards (3 SurfaceCards):
  - 'Canonical corpus' (teal): Library rows expose policy ID, domain/subdomain, title...
  - 'Survey-ready context' (orange, network): "Policies show linked ACHC, CMS CoP, Title 22, forms, workflows, and evidence anchors."
  - 'Version control' (teal).

**Matrix layout:** `grid grid-cols-1 gap-6 xl:grid-cols-5`
- Left (col-span-3): `<DataTable view={view} />`
- Right (col-span-2): SurfaceCards.

**DataTable (shared):**
- Header: grid with `tableHeaders: ['Policy ID', 'Policy title', 'Owner steward', 'Status']`
- Records (policyRecords ~213): e.g.
  - ['GV-GB-001', 'Governing Body Authority & Responsibilities', 'Governing Body / Administrator', 'ACTIVE'],
  - ['CL-OA-101', 'OASIS Data Accuracy...', 'Director of Nursing', 'ACTIVE'],
  - ...
- Rendering: First col bold teal heading, title teal, last col ToneBadge (status logic via regex for orange vs teal).
- Hover rows, divide-y, overflow-hidden rounded-2xl.

**Related policy-detail:** Shows ACHC/CMS in metadata table + "Survey Evidence" sections + linkedForms.

## Shared UI Components (used across these views)
- **ToneBadge({children, tone})**: Dot + uppercase border bg (teal/orange/green/amber/slate per tones ~129). Used heavily for IDs, statuses, mappings.
- **MetricTile**: Large value + label/note in tone tile.
- **SurfaceCard**: Icon tile (tone bg), ToneBadge, title, body, optional progress bar.
- Icons: lucide via `<Icon name="..." />` (network, award, book-open, search, check-circle-2, etc.).
- General: rounded-2xl, shadow-soft, brand-teal-*/orange-*, hover states, responsive grids (xl:6 cols often).

## Colors & Styling (from shell + tones)
- Teal dominant for ready/supported/exact (#06A6AB base).
- Orange for review/gaps/partial/risk.
- Green for exact/ready metrics.
- Neutrals for secondary text/borders.
- Body bg light (#EEF9F9 / gradients), cards white.
- Consistent with main shell (see 01-main-shell.md).

## Screenshot Notes (from 13-framework-achc.png + code)
- Shell visible: CareIndeed logo, global search "Search policies, tasks, evidence...", user avatar (TP), collapsible sidebar with "COMPLIANCE EXECUTION" > Taxonomy entry.
- Content area: May show Framework domain grid, ACHC explorer rows, or crosswalk table depending on capture state; Brad "Hello, TJ, I am Brad!" welcome + suggested missions often overlays (as seen in multimodal read).
- Evidence of survey/crosswalk: Filters, row lists, export buttons, reviewer queue, ACHC HH stds visible in prototype.
- Policy library context: Tables/cards emphasize ACHC linkage ("survey-ready context").
- Clean compliance aesthetic: card-heavy, badge-driven, no heavy chrome.

## Cross-References & Related
- Policy Viewer / Surveyor Policy Viewer (~2694, 4031): Show ACHC anchors, crosswalk refs, survey prompts, deficiency sections.
- EN-FM-005 "Regulatory Crosswalk Template" in forms.
- Governance / Admin views mention crosswalk stewardship.
- All tied to "Taxonomy" as the single source for regulatory alignment, policy corpus, and surveyor evidence.

**Sources (index.html):** VIEW_GROUPS ~1341-1380, frameworkDomains ~556, achc*Seeds ~569/577, Framework/Achc*Prototypes ~2796/3763/3836, DataTable ~1911, Matrix ~4203, renderTemplate ~4224, tones/Metric/Surface/ToneBadge ~129/1875/1885/1866, Sidebar/App ~4308/4578. Full prototype is client-side React-in-HTML served statically.

**Actionable:** This pageview group demonstrates taxonomy as the connective tissue between internal policy architecture and external ACHC/CMS survey requirements. Crosswalk tables and survey UI prioritize traceability + gap identification for audit readiness.

(Generated via code analysis of redesign prototype for Agent 09 / Framework / ACHC / Taxonomy task.)

---

# Agent 27: New UI Plan — Framework, ACHC Survey Alignment, Crosswalks (V6 #22, #2, #1, #13)

**Task:** Plan new UI for framework, survey alignment, crosswalks.  
**Date/Context:** 2026-06-19 (parallel with migration from Agent 15).  
**References:** 
- V6 screenshots: 22-framework.png (domain grid + metrics), 02-achc-survey.png (evidence explorer + prompt sidebar), 01-achc-crosswalk.png (regulatory table + reviewer queue)
- Analysis: 13-framework-achc.md
- Design: Reference/CareIndeed Production Light Mode Design Spec.md (tokens, light layers, Montserrat/Roboto, teal #00797D / orange #E56E2E restraint, radii 8/12/16/24, outline icons)
- Shell: 01-main-shell.md + current index.html prototype (hash views, static seeds)
- Related: Taxonomy nav group, Policy Library "survey-ready context", surveyor-viewer, policy-detail ACHC anchors, EN-FM-005 crosswalk template.

## Executive Summary
Current V6 prototype provides a solid static foundation: clean card grid for Framework (10 domains), filterable row list + sidebar for ACHC Survey Alignment, grid-table + queue for Crosswalk. All under "Taxonomy" group in sidebar. However, it is read-only demo data with non-functional controls, no cross-navigation, limited hierarchy, and no action flows.

**New UI Plan** elevates Taxonomy to a fully actionable regulatory alignment hub:
- Interactive Framework with drill-down and alignment signals.
- Live, filterable Survey Alignment explorer (surveyor-optimized).
- Editable/maintainable Crosswalk with stewardship tools.
- Unified patterns, real interactions (in-proto + future React), strict fidelity to V6 visuals + production spec.
- Prepares modular extraction (see Agent 15 Phase taxonomy core).

Goal: Make "survey readiness" and "regulatory traceability" first-class, scannable, and operable without leaving the module.

## Current State Limitations (from code + screenshots)
- **Framework (22-framework.png / FrameworkPrototype):** 4 top metrics + 4 domain metrics + static 10 domain cards (code badge, title, desc, subdomain count, "Inspect architecture" footer). No subdomains visible, no % coverage, no links to ACHC/Policy/Form counts per domain, no hover/selection state driving other views. Duplicate domain list in seeds vs prototype fallback.
- **ACHC Survey Alignment (02-achc-survey.png / AchcSurveyPrototype):** Evidence tab active; 4 metrics; static filter pills (some orange-highlighted); read-only search; 4-5 hardcoded rows (badge, prompt, policy, evidence, status); sidebar with fixed surveyor prompt checklist + readiness note. Mode tabs present ("Matrix", "Crosswalk") but non-navigable in place. No row selection, no live filter, no evidence preview/attach, no gap bulk ops.
- **ACHC Crosswalk (01-achc-crosswalk.png / AchcCrosswalkPrototype):** 4 metrics; export button; custom CSS-grid table (6 cols: ACHC/CMS/Policy/Form/Evidence/Mapping) with badges; right reviewer queue (3 static partials) + source card (progress). Hardcoded 5 rows. No sorting, editing, column config, provenance details, or linked navigation.
- **General:** Static JS arrays (frameworkDomains, achcSurveyRowsSeed, achcCrosswalkRowsSeed). No useState for filters/search/selection. Shared components (MetricTile, SurfaceCard, ToneBadge, Icon) good but applied inconsistently (crosswalk avoids DataTable). Canonical crosswalk route is `/framework/achc-survey/crosswalk`; the prior query-string route is obsolete. No deep links, no domain-to-filter wiring, minimal mobile adaptation in grid, Brad overlay interference noted in captures. No visual coverage indicators or traceability graphs.
- **Shell integration:** Taxonomy group under COMPLIANCE EXECUTION; PageHeader + metrics row generic; PersonalOpsDrawer unrelated.

**Visual fidelity good** (teal/orange/neutral, rounded-2xl, soft shadows per light mode) but density and interactivity lag V6 intent for "connective tissue".

## Design Goals & Principles
1. **Traceability & Actionability First**: Every ACHC row / domain links to policy, form, evidence, CMS ref. Primary CTAs are orange, secondary teal/outline.
2. **Live & Filter-Aware**: All pills, search, tabs drive real filtered/selected state (proto React hooks).
3. **Hierarchy + Overview**: Framework shows top-level + quick subdomain + coverage rollups. Drill to filtered Survey/Crosswalk.
4. **Role-Aware Surfaces**: Default surveyor lens (read + flag); steward mode (edit mappings, bulk resolve). Toggle or based on global user.
5. **V6 + Spec Fidelity**:
   - Exact layout grids from screenshots (metrics top, main xl:4/2 or 6, side panels).
   - Colors: primary teal for positive/structural, orange for gaps/review/primary action; no black borders.
   - Typography/spacing/radii from Production Light Mode Spec.
   - White cards on pale teal-tinted bg, subtle borders.
6. **Migration Ready**: Extractable components (DomainCard, AlignmentTable, FilterBar, AlignmentSidebar). Seed data in stores. Side-by-side verify vs V6 PNGs.
7. **Responsive + A11y**: Stack on mobile, ARIA table roles, keyboard filter chips, focus states.
8. **Cross-View Consistency**: Same ToneBadge, MetricTile, SurfaceCard, search icon treatment. Add shared "RegulatoryAnchor" pill.

## Proposed UI Architecture

### Navigation & Entry
- Sidebar (Taxonomy group, ref 13-framework-achc.md):
  - Framework (`/framework`)
  - ACHC Survey Alignment (`/framework/achc-survey`)
  - ACHC Crosswalk (promote to top-level or `/framework/crosswalk`; keep param for now)
  - Policy Library (already linked)
- Add subnav tabs or chips inside views for "Overview | Domains | Subdomains" (Framework) and "Evidence | Matrix | Crosswalk" (Alignment).
- Global header actions per view: "Export" (orange for primary), "Refresh Projection", "Open in Brad".

### 1. Framework View (enhance #22)
**Layout:** space-y-6
- PageHeader: "Framework" + "Architecture map tying domains..." (keep)
- **Metrics Row** (grid 2/4): Keep/enhance 8 values split:
  - Top row (pale): OPEN WORK, RISK, DUE SOON, EVIDENCE % (from image)
  - Standard: Domains 10, Subdomains 54, Framework Policies 269, Lifecycle Corpus 279 (or dynamic)
- **Domains Section Header** + view toggle (Grid | Hierarchy Tree | Coverage Heat)
- **Domain Grid** (lg:grid-cols-3 or 4, ref current):
  Each **EnhancedDomainCard** (white rounded-2xl border p-5):
    - Top: ToneBadge(orange) code + subdomain count chip
    - h3 title, desc (clamp 2 lines)
    - New: mini metrics row or bars: "Policies: 27 | ACHC Anchors: 12 | Coverage 94%"
    - Progress bar: survey-readiness % (teal fill)
    - Footer actions: "Inspect architecture" (primary) | "View ACHC" (teal outline) | "Policies (269)" (link)
  - Hover: lift + subtle border-teal
  - Click "View ACHC": navigate to achc-survey with ?domain=GV&filter=... pre-applied.
- Optional: "Enterprise" domain card special (links to taxonomy lifecycle).
- Bottom: "Regulatory Alignment Summary" SurfaceCard grid (3): CoP coverage, State regs, Form linkage health.

**New Interactions (proto + future):**
- Expand card inline or modal showing 4-9 subdomains (simple list or small cards) with policy counts.
- Search bar at top of domains filters cards live.
- "Rebuild Framework Projection" mock CTA.

### 2. ACHC Survey Alignment View (new UI for #2)
**Layout:** grid xl:6 (main 4 + aside 2)
- PageHeader + 4 **live** metrics (Projection rows, Direct support, Reviewer required, Evidence gaps). Update on filter.
- **Toolbar** (border-b p-5):
  - Mode tabs (Evidence | Matrix | Crosswalk) — clicking Crosswalk can deep-link or switch pane.
  - 5 filter chips (pills): functional buttons that toggle and filter rows below. Highlight active (orange for "needs attention" filters).
  - Search input (wired, icon prefixed) — filters prompt/standard/policy live.
  - Secondary: "Bulk actions" dropdown, "Export Readiness Report" (orange).
- **Main List / Explorer** (divide-y, or upgrade to DataTable):
  Rows as articles (responsive grid cols like current):
    - ToneBadge ACHC std (clickable -> detail)
    - h4 prompt + small evidence meta
    - Policy ID (click -> open policy-detail in new context or drawer)
    - Evidence summary
    - Status ToneBadge (Supported teal, Review/Gap orange)
  - New columns/adds: Confidence score (visual dot/bar), Last updated, "Actions" (flag, attach, link form).
- **Matrix Mode** (new): Pivot view — grouped by domain or evidence method, with count cells color-coded (teal=good, orange=review). Click cell opens filtered list.
- **Right Aside** (dynamic):
  - If no selection: default "Surveyor prompt" + example (as current) + overall checklist.
  - On row select: 
    - Full standard text (if seeded) or expanded prompt.
    - Checklist items (checkable in proto; update readiness).
    - Linked artifacts preview (forms, policies — thumbnails or list).
    - "Readiness note" + editable textarea (SurfaceCard).
    - CTAs: "Mark Supported", "Request SME Review" (orange), "Open Evidence Center".
- Add "Gaps Summary" callout at top or bottom when filters active.

**Seeded data enhancements:** Expand achcSurveyRowsSeed to 12-15 realistic HH standards; add fields for filtering (domain, confidence numeric).

### 3. Crosswalk View (new UI for #1)
**Layout:** grid xl:6 main 4 + aside 2 (matches screenshot)
- Header + metrics (rows, exact/partial/unmapped) + health %.
- Toolbar: Search + column filters + "Mapping confidence" selector + "Export CSV" (orange primary).
- **Regulatory Crosswalk Table**:
  - Upgrade to sortable (click headers), filter-aware rows.
  - Columns (ref current + enhancements):
    - ACHC: badge (clickable)
    - CMS / State: ref (with tooltip full reg text)
    - Policy: link (teal heading)
    - Form: link
    - Evidence: code pills (P, D, S, I) — legend inline
    - Mapping: ToneBadge (Exact=green, Partial/Review=orange) + small edit icon
  - Row hover: highlight + quick "Resolve" / "Add note".
  - Row select: loads aside with full mapping editor.
- **Table footer**: "Showing X of Y | Last projected: <date>" + "Rebuild from corpus" button.
- **Aside**:
  - Reviewer Queue (actionable cards): Each partial has "Resolve mapping", "View discrepancy", "Assign" buttons. Queue updates live when resolved.
  - "Crosswalk source" SurfaceCard + version + "88% traceable" progress.
  - New: "Mapping Rules" or "Suggested Matches" (teal) list (3 auto suggestions).
  - "Import / Sync" controls (for stewards).
- **Visual Layer (new below or side tab)**: Simple breakdown bars or chips: "By Domain" coverage or "Evidence Type Distribution".

**Data:** Expand seed to realistic volume; include editable fields (mapping state, notes) in future state.

### Unified / Advanced Features Across Views
- **Selection Sync**: Framework domain click pre-filters Survey + Crosswalk.
- **Brad Integration**: Context-aware suggestions e.g. "3 partials in HR domain need attention".
- **Drawer/Modal Extensions**: Row clicks can open full "Standard Detail" drawer (ACHC text + linked policies matrix + evidence gallery mock).
- **Export Suite**: CSV + PDF readiness packet + "Print for Surveyor".
- **Audit Mode Toggle** (ref other views): Read-only surveyor vs edit steward.
- **Gap Dashboard Add-on**: Dedicated surface showing top 5 unmapped + trend.
- **Mobile**: Vertical stack, collapsible filters/aside into bottom sheet or accordions.

## Component & Data Recommendations (for index.html proto + migration)
- New/reused: `DomainCard`, `AlignmentFilterBar`, `RegulatoryRow`, `MappingEditor`, `SurveyPromptPanel`, `CoverageBar`.
- Enhance seeds in index.html: 
  - Add `domain` key to achc rows.
  - More complete frameworkDomains with counts.
- Make prototypes stateful: add `useState` for `activeFilters`, `selectedStandard`, `searchTerm`, `crosswalkRows` (mutable for edits).
- Wire navigation: update `goTo` / hash logic to preserve query params for filters.
- Use existing `DataTable` where possible for crosswalk/survey consistency.
- For prod migration (Agent 15): map to stores (e.g. TaxonomyStore with crosswalk projection, AlignmentState).

## Textual Wireframe Highlights (matching V6 PNG density)
Framework:
[Metrics 8-up] 
[Search + Toggle]
[GV | CL | QA | ... 10 cards with progress]

Survey:
[Metrics 4]
[Evidence|Matrix|Crosswalk tabs] [HH Std pill] [Policy pill] ... [search]
[Row1] [Row2]...
[Aside: Prompt + 4 checklist items + readiness 92%]

Crosswalk:
[Metrics 4]
[Table header grid]
[5+ rows]
[Aside: Reviewer queue 3 cards + source progress]

## Implementation Phasing (align Agent 15)
1. **Proto Update (immediate)**: Add useState interactivity to existing prototypes in index.html. Wire 2-3 cross links. Expand seeds. Update screenshots.
2. **Visual Polish**: Match exact spacing/colors from spec + screenshots (e.g., filter pill states, row grid fractions).
3. **Advanced Modes**: Implement Matrix pivot + editable crosswalk (minimal).
4. **Migration**: Extract to /pages/taxonomy/* + components. Integrate real data later.
5. **Verify**: Capture new #framework #achc-survey etc. against original V6 PNGs + side-by-side in tmp-ui-verify...

## Risks & Mitigations
- Over-complexity in proto: Keep scope to filters + selection + 1 editable field.
- Data volume: Limit to 10-15 rows for demo.
- Fidelity drift: Strict pixel review using existing capture process.
- Scope creep: Prioritize Framework + Survey list + Crosswalk table; unify later.

## Acceptance Criteria for "New UI"
- [ ] Framework cards show per-domain ACHC/policy metrics + progress; domain action filters other views.
- [ ] Survey: Live filters/search update visible rows + metrics + dynamic sidebar. Mode tabs functional.
- [ ] Crosswalk: Table sortable/filtered; queue actions update list and metrics; links navigable.
- [ ] All views match V6 PNG layouts, use only approved palette/radii/typography from spec.
- [ ] No regressions in shell or other taxonomy views (library etc.).
- [ ] Documented in this file + updated COVERAGE_AND_QA_REPORT.md.
- [ ] Side-by-side runnable prototype vs V6 screenshots.

**Next Steps for Agent 27 follow-up:** 
- Implement prototype enhancements in index.html (search_replace targeted).
- Update seeds and VIEW registration.
- Generate verification screenshots for 22/02/01.
- Sync with migration agent on component extraction for Taxonomy.

**Sources for Plan:** Full index.html analysis (lines 556-583 seeds; 1341-1380 views; 2796 Framework; 3763 AchcSurvey; 3836 AchcCrosswalk; 4308 Sidebar; 4371 PageHeader; shared components ~1862+), V6 PNG multimodal reads, 13-framework-achc.md, Production Light Mode Spec, AGENT15 plan.

*Generated for Agent 27 — Framework/ACHC/Taxonomy/Crosswalk UI planning.*
