# Agent 05 — Dashboard Surface 4-Phase Plan

**Subagent:** 05 — Dashboard & Overview Surfaces Specialist  
**Mandate:** Treat Dashboard as the reference surface (per `DASHBOARD_RECONSTRUCTION_KICKOFF.md`). Phase 1 or 2 **must** deliver a pixel-near mockup-faithful Dashboard. Subsequent phases propagate the proven pattern.  
**Primary References:** `Desktop/v2/01_Dashboard_Desktop_v2.jpg`, `DASHBOARD_RECONSTRUCTION_KICKOFF.md`, `Dashboard_Reconstruction_Plan.md`, `Dashboard_Canonical_Primitive_Usage.md`, `CANONICAL_UI_SYSTEM_SPEC.md` §4 (Constrained Page View), `TASK_URGENCY_HIERARCHY_SPEC.md`, `Review_02_Analysis_PostCompletion_4Sided_Contract_Violations.md`  
**Date:** 2026-05-17

---

## Executive Summary

This 4-Phase Plan makes the **Command Center Dashboard the first and only true reference implementation** of the full hardened system (tokens + shell primitives + glass layering + urgency hierarchy + mockup fidelity). 

Unlike prior partial efforts (token cleanups without inset fixes, premium classes without primitive promotion), **Phase 2 ends with a Dashboard that is visually and structurally indistinguishable from the approved v2 mockup at the pixel level** when viewed at 1440px desktop and key mobile breakpoints, while strictly obeying the canonical contract.

All later surfaces (CES boards/dashboards, Evidence Center, Calendar, PM views, Onboarding V2, Audit, Library, etc.) will be required to replicate the exact Dashboard-derived patterns rather than inventing their own.

**Unique Insight (Dashboard Lens):**  
The Dashboard surface is the **enforcement oracle** for the entire UI system. Because it is the only surface that must simultaneously deliver (a) high-density task-first triage in the first 500ms and (b) the single most demanding demonstration of "multi-card glass composition inside a 4-sided inset Layer-1 frame", any defect here is magnified across the product. Prior work treated Dashboard as "just another page to premiumize." This plan treats it as the **living specification** — once pixel-faithful and contract-clean, it becomes the immutable template. The moment the Dashboard correctly renders the v2 mockup with proper breathing room, left-border urgency, and `KpiCard`/`BoardColumn` primitives, the glassmorphism contract, token contract, and primitive contract are proven real. Everything else is derivative.

---

## Phase 0 — Pre-Work (Complete Before Phase 1 Starts — 1–2 Days)

**Owner:** Subagent 05 + Design Lead + Shell Primitives owner

1. **Baseline Capture**
   - Capture fresh "Before" screenshots of current Dashboard at 1440px, 1024px, 768px, 375px using `REFERENCE_CAPTURE_PROTOCOL.md`.
   - Store in `docs/UIUX/16_Agent_Reports/Agent_05_Baselines/2026-05-17-before/`.
   - Include side-by-side with `Desktop/v2/01_Dashboard_Desktop_v2.jpg` + closest Top-Picks mobile reference.

2. **Primitive Promotion Gate**
   - Create `KpiCard.tsx` and `BoardColumn.tsx` (plus supporting `TaskCard` / `KanbanItemCard`) in `src/policy/components/ui/` following `primitives/CATALOG.md` process.
   - Export from `ui/index.ts`.
   - Add `layer` prop support and lint guard against misuse (per Agent 01 glass layering rules).

3. **Token / Inset Audit Script**
   - Add or run existing audit that flags any `-mx-*`, `mx-0` on direct children of `ShellContentFrame`, nested `ShellContentFrame`, or `h-full w-full` page roots inside `/policy/pages/`.

4. **Decision Record**
   - Record in Decision Log: "Dashboard is the sole source of truth for KPI composition, board column layout, urgency left-border treatment, and 4-sided multi-card glass framing."

**Exit Gate:** All baselines captured, new primitives stubbed and typed, audit script green on current tree.

---

## Phase 1 — Structural Contract Restoration + Mockup Layout Alignment (Dashboard as Reference)

**Goal:** Make the Dashboard obey the Constrained Page View + single authoritative glass frame. Realign top-level layout and sectioning to the v2 mockup structure (compact KPIs + Task Overview pattern) **without yet pixel-perfect styling**.

**Duration:** 3–5 days (parallel with primitive finalization).

**Deliverables:**

1. **Remove All Inset Violations**
   - Delete the inner `<ShellContentFrame>` wrapper in `DashboardPage.tsx:413`.
   - Remove the entire `-mx-3 sm:mx-0 ...` expression and `ci-premium-panel` hack at line 463.
   - Replace the Action Board container with a single `GlassPanel` (data-layer="1") or `SurfaceCard` + proper internal padding using `--ci-glass-layer1-inset-desktop`.
   - Ensure **every** direct child of the (now single) `ShellContentFrame` receives uniform `px-[var(--ci-glass-layer1-inset-desktop)]` rhythm or uses `ShellCommandGroup` / promoted section primitives.
   - Verify with live dev + Playwright that a visible backdrop gutter now frames the entire KPI + board composition on desktop.

2. **Recompose Top-Level Sections to Match v2 Mockup Hierarchy**
   - Replace the current 7-KPI grid + separate hero stats with a compact horizontal KPI row (target 3–4 primary metrics surfaced exactly as in `01_Dashboard_Desktop_v2.jpg`).
   - Introduce a "Task Overview" section header (or use `SectionHeader`).
   - Add left filter rail / segmented control (using `Tabs` or new `FilterBar` primitive) that can later drive the board columns or lists.
   - Keep the 4 urgency columns for now (they provide the strongest "first 500ms" critical-first scan), but wrap each in the new `BoardColumn` primitive.
   - Move `AgencyReadinessBanner` into a canonical status region (perhaps as a `StalenessBanner` variant or promoted `ReadinessBanner`).

3. **Wire New Primitives (KpiCard + BoardColumn)**
   - Refactor all local `KpiCard`, `BoardColumn`, `TaskCard` into thin wrappers around the promoted primitives.
   - Pass `tone`, `emphasize`, `urgencyLevel` props that map to token classes + left-border logic.
   - Delete or deprecate the old local component functions.

4. **Urgency Hierarchy First Pass**
   - Implement left-border accent rules from `TASK_URGENCY_HIERARCHY_SPEC.md` inside the new `TaskCard` / `BoardColumn` items (Level 3 orange border + badge, Level 4 red).
   - Ensure badges never rely on color alone (text + icon).

5. **Responsive & Accessibility Pass**
   - Mobile: single-column stack, 44px targets on all cards/buttons, no horizontal scroll.
   - Verify against `RESPONSIVE_ACCEPTANCE_MATRIX.md` + `Dashboard_Accessibility_Validation_Report.md` items.
   - Add proper heading hierarchy (`<h1>` for page, `SectionHeader` for "Task Overview", etc.).

**Visual Success Criteria (Phase 1):**
- 4-sided breathing room **visibly present** around the entire Dashboard composition (screenshot proof).
- No more nested frames or negative margins.
- Layout skeleton matches v2 mockup zones (top KPI band, Task Overview header + rail + content area).
- All new primitives are the only card constructs used.

**Exit Gate:** Design Lead + Subagent 05 sign-off on "structural + contract" review. Before/after diff set published.

---

## Phase 2 — Pixel-Near Mockup-Faithful Dashboard (The Non-Negotiable Reference Delivery)

**Goal:** Deliver a Dashboard that, at the defined breakpoints, is **pixel-near identical** in spacing, card proportions, elevation stacking, color accents, glass translucency, and urgency signaling to `Desktop/v2/01_Dashboard_Desktop_v2.jpg` (and the corresponding mobile Top-Picks reference) **while using 100% canonical primitives and zero raw values**.

**Duration:** 4–7 days (includes heavy visual iteration).

**Key Workstreams:**

1. **Exact Visual Calibration**
   - Use the v2 mockup as the single source of truth for:
     - KPI card width/height ratios, border-radius, inner padding, accent pill placement, trend typography.
     - Gap and section spacing values (map to nearest `--ci-*` tokens; propose minimal additions only via governance).
     - Glass layer translucency, luminous edge strength, shadow.elevation values.
     - Left filter rail width, list item density, progress bar styling (if present in final mock).
   - Iterate in dev until side-by-side (live vs mock) at 100% zoom shows <5% measurable deviation on critical dimensions (use browser ruler + Figma overlay if available).

2. **Full Primitive & Token Purity**
   - Every visual element must trace to:
     - `KpiCard`, `BoardColumn`, `SurfaceCard`/`GlassPanel` (with correct `layer`), `ActionButton`/`UtilityButton`, `CiStatusBadge`, `SectionHeader`, `EmptyState`.
     - Only `--ci-*` custom properties or the 19+ `ci-text-*` / `ci-shadow-elev-*` utilities.
   - Run raw-value + inline-style audit; must be zero.

3. **Urgency & First-500ms Scan Perfection**
   - Critical & Overdue column (or equivalent prioritized list) must be the dominant visual on load.
   - Per-item left-border + badge treatment exactly per spec.
   - Hero / KPI numbers must surface the most urgent counts first (Critical, At-Risk, Overdue) in the exact visual weight shown in the mock.

4. **Glass Layering Correctness (per Agent 01 rules)**
   - Single authoritative `ShellContentFrame` / Layer-1 glass.
   - KPI cards and board columns are Layer-2 elevated surfaces with proper `backdrop-filter` inheritance and no nesting violations.
   - Backdrop is clearly visible on all four sides; cards "float" inside it with correct luminous edges.

5. **Cross-Breakpoint & Theme Parity**
   - Light (`care-indeed-light`) + CI-ION dark + any care-indeed-dark mode must all match the spirit of the mock (mock is dark; light variant must be approved equivalent).
   - Tablet and mobile must gracefully degrade while preserving scan priority.

**Deliverables:**
- `DashboardPage.tsx` (and any tiny extracted components) now <= ~450 lines (down from 893 via primitive extraction).
- Updated `Dashboard_Canonical_Primitive_Usage.md` with final mapping.
- Complete before/after + mock-comparison screenshot set in `Agent_05_Baselines/phase2-final/`.
- Playwright visual regression baseline updated and passing against new reference images.
- Zero open items in `SURFACE_CHECKLISTS/Dashboard.md` for Phase 2 gates.

**Exit Gate (Mandatory for Whole Program):**
- **Design Lead physical sign-off** that the live Dashboard at 1440px is pixel-near the approved `01_Dashboard_Desktop_v2.jpg`.
- Engineering + A11y sign-off on contract compliance.
- This gate **blocks** any further surface work until green.

---

## Phase 3 — Pattern Extraction, Promotion & Governance Hardening

**Goal:** Turn the now-perfect Dashboard into the reusable template and close all loopholes that allowed the previous drift.

**Activities:**

1. **Finalize & Harden Primitives**
   - Move any Dashboard-specific variants (e.g. `emphasize` on `KpiCard`, urgencyLevel on cards) into the canonical components with full prop documentation.
   - Add Storybook / showcase entries in `FrameworkShowcase.tsx` or new `PrimitivesShowcase`.
   - Add ESLint rule: "no direct use of `ci-operational-card`, `ci-premium-*`, or manual rounded-2xl + border + shadow inside `/policy/pages/` or `/policy/components/**` (except inside the promoted primitives themselves)."

2. **Update All Governance Artifacts**
   - `UI_PRIMITIVE_OWNERSHIP_MAP.md`, `CANONICAL_UI_SYSTEM_SPEC.md`, `Dashboard_Token_Application_Matrix.md` — mark Dashboard as "Reference — Do Not Deviate".
   - Add "Dashboard Pattern" section to `primitives/CATALOG.md`.

3. **Create Propagation Kit**
   - Document exactly how Evidence Center, CES MyTasks / Board, Calendar agenda, PM sprint views, OnboardingV2 dashboard must copy the KPI + board + rail + urgency + inset pattern.
   - Produce `DASHBOARD_REFERENCE_PATTERN.md` (or extend existing checklist) with copy-paste JSX + token usage examples taken from the final `DashboardPage.tsx`.

4. **Drift Closure**
   - Close all Dashboard-assigned drift items (D01, D12, D13, D21, D22, and any new ones discovered in Phase 2).
   - Update `DRIFT_REGISTER.md`.

**Exit Gate:** All artifacts updated; lint rule active; propagation kit published.

---

## Phase 4 — Propagation to All Other Surfaces + Final System Validation

**Goal:** Every operational surface now matches the Dashboard reference in glass fidelity, primitive usage, spacing rhythm, urgency language, and inset contract.

**Surfaces in Order (Dashboard already complete):**

1. **Evidence Center** (`EvidenceCenterPage.tsx`) — KPI rollups + evidence lists → use `KpiCard` + `BoardColumn` pattern.
2. **CES Surfaces** (`CesDashboardPage.tsx`, `CesBoardPage.tsx`, `MyTasks*`, `Sprint*` views) — align urgency cards to the left-border spec proven on Dashboard.
3. **PM Dashboard & Views** (`PmDashboardPage.tsx`, `PmViews.tsx`, `SprintReviewPage.tsx`) — identical KPI + board treatment.
4. **Calendar / MasterCalendarPage** — agenda items as `TaskCard` instances with urgency borders.
5. **Onboarding V2** (multiple dashboard / batch / activation pages) — adopt the same glass + rail + scan hierarchy.
6. **AuditModePage**, `LibraryPage`, `FormsPage`, `PolicyDetailPage`, etc. — secondary surfaces adopt spacing / card / inset rules even if lighter.

**Cross-Cutting Enforcement:**
- Run the glass-layering audit + raw-value audit + primitive-usage linter across the entire `src/policy/` tree after each surface.
- Produce `Cross_Surface_Consistency_Report.md` (update of existing) with Dashboard as the 100% baseline.
- Final visual regression suite covering all 14+ surfaces against their respective v2 mocks, always referencing the Dashboard pattern for shared elements.

**Final Success Criteria (Program Level):**
- 100% of operational pages pass the Constrained Page View contract with visible 4-sided framing.
- Zero raw visual values or ad-hoc card families anywhere in policy surfaces.
- All surfaces use only primitives promoted from the Dashboard reference.
- Design + Engineering + A11y final sign-off package that explicitly states "Dashboard reference pattern has been propagated and verified."

---

## Risk Register & Mitigations

- **Risk:** Design changes to mock after Phase 2 lock. → Mitigation: Freeze `01_Dashboard_Desktop_v2.jpg` as immutable reference for Phase 2 exit; any future mock evolution requires new versioned file + re-baseline.
- **Risk:** Performance cost of extra glass layers on dense board. → Mitigation: Keep Layer 2 cards lightweight; profile blur cost; fall back to `SurfaceCard` (solid) for very long lists if needed (documented exception).
- **Risk:** Mobile first-500ms scan degraded by rail. → Mitigation: Phase 1/2 explicitly tests mobile rail collapse to tabs or bottom-sheet filters.
- **Risk:** Parallel dashboards (CesDashboard, PmDashboard, OnboardingV2 Dashboard) diverge. → Mitigation: Phase 4 requires them to import and reuse the exact same `KpiCard` / `BoardColumn` components with only data differences.

---

## Success Metrics & Sign-Off

| Phase | Key Metric                              | Owner Sign-off Required          |
|-------|-----------------------------------------|----------------------------------|
| 1     | Zero inset violations + layout skeleton match | Subagent 05 + Shell Owner       |
| 2     | Pixel-near v2 mock + 100% primitive + 4-sided proof | **Design Lead (blocking)**      |
| 3     | Primitives hardened + lint rule live    | Engineering + Subagent 05       |
| 4     | All surfaces audited against Dashboard pattern | Full team (final)               |

**This plan supersedes prior partial Dashboard reconstruction plans for the purpose of Subagent 05 execution.** The kickoff documents remain the historical foundation; this 4-Phase plan is the actionable delivery vehicle that guarantees the reference surface finally fulfills its contract.

---

**End of Agent 05 Dashboard Surface 4-Phase Plan**

*Dashboard is no longer "the page we keep tweaking." It is the contract made visible.*
