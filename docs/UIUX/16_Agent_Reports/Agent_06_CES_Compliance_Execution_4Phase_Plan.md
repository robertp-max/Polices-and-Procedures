# Agent 06 — CES Compliance Execution 4-Phase Plan

**Subagent:** 06 — Compliance Execution System (CES) Surfaces Specialist  
**Mandate:** Prioritize CES early (core to "compliance-defensible" value prop). Deliver board layouts, task card anatomy, and workload visualizations that match the v2 mockups (04_CESBoard_Desktop_v2.jpg, 10_CESMyTasks_Desktop_v2.jpg, 02_CES_Board_Mobile_v2.jpg + CES_BOARD_VISUAL_LANGUAGE.md + TASK_URGENCY_HIERARCHY_SPEC.md).  
**Guiding Constraints:** 
- Preserve CES navy sub-brand identity (Lead 16 C14) — do not replace with CI teal; teal remains accent only.
- Bridge to canonical glass system (one-glass + premium surfaces) without breaking the `--ces-*` contract.
- Every deliverable must pass visual regression against locked v2 mocks (desktop + mobile, light + Navy Dark).
- No parallel CES design system — converge on shared primitives where possible (new scoped `CesGlass*` family).

**Overall Strategy:** 4-phase, CES-first. Phase 1-2 front-loaded because CES is the daily operational surface whose visual authority directly sells the compliance story. Use incremental glass adoption + new card primitive.

---

## Phase 0 — Pre-Work (Immediate, 1-2 days, Parallelizable)

**Goal:** Establish single source of truth and guardrails.

1. **Visual Baseline Capture**
   - Screenshot current CES Board, MyTasks, Workloads, Reports, Drawer, Calendar in both light and Navy Dark modes.
   - Store in `tmp-ui-verify-screenshots/` or dedicated `ces/v2-baseline/`.
   - Tag against specific mock filenames.

2. **Token & Primitive Audit**
   - Confirm `ces/theme.ts` + `index.css` `--ces-*` block are in sync (remap contract).
   - Create `ces/components/glass/` folder (or extend `ui/`) for new primitives.
   - Draft `CesGlassCard` interface (props: urgencyLevel, elevation, leftAccent, progress, glassTint="navy" | "canvas").

3. **Spec Alignment Workshop (mental)**
   - Re-read + print: CES_BOARD_VISUAL_LANGUAGE.md (card layers, calm glass, 4-col desktop vs vertical mobile), TASK_URGENCY_HIERARCHY_SPEC.md (0-4 levels with exact treatments), GLASS_LAYERING_CHEAT_SHEET.md.

4. **Decision Log**
   - Board column model: Hybrid — keep 6 compliance states internally; surface as 4 grouped columns (Backlog = upcoming+ready, In Progress, Review = awaiting+blocked, Done) or direct 6 with glass tints. **Recommendation:** Glass 6-col with subtle swimlane headers for fidelity to enforcement model, but generous card spacing matching mock density.
   - Mobile: Vertical lists + bottom sheets (per spec).

**Exit Gate:** Baselines captured + primitive spec reviewed + no code changes yet.

---

## Phase 1 — CES Glass Foundation & Token Unification (Highest Priority — 4-5 days)

**Why first:** Everything else builds on surfaces. Without this, later card work will be bolted on legacy.

**Objectives:**
- Bring CES surfaces onto the canonical glass canvas where possible while respecting navy sub-brand.
- Introduce `CesGlassCard` + `CesGlassPanel` as the single primitive for all CES cards, sections, columns.
- Update `CesLayout` to support glass-aware modes (canvas vs glass shell).
- Migrate 100% of `CesCard` + primitive inline styles to new glass primitives + utility classes.
- Ensure dark mode (Navy) glass reads correctly per mocks.

**Detailed Work Items:**

1. **New Primitives (ces/components/primitives.tsx or new glass/ subdir)**
   - `CesGlassCard`:
     - Uses `background: color-mix` or CSS var for frosted navy glass effect scoped to CES (e.g., `rgba(31,74,138,0.12)` on dark canvas or appropriate light variant).
     - Props: `urgency: 0|1|2|3|4`, `selected`, `interactive`, `leftAccentColor` (auto from urgency: teal/orange/red).
     - Elevation ladder matching mock (subtle shadow for L1, stronger for L2/L3).
     - Progress bar slot (teal fill per mock).
     - Inner padding, border, hover states per `.glass-interactive` + premium.
   - `CesGlassColumn` / `CesGlassSection` for board columns and panels (frosted container with header tint).
   - `CesUrgencyBadge`, `CesProgress`, `CesAvatarRing` — composed from glass tokens.
   - Update existing badges (`ComplianceStateBadge` etc.) to accept glass context and render inside cards correctly.

2. **CesLayout Modernization**
   - Add `glassMode` prop or detect via ciModeStore.
   - Header becomes subtle glass or premium rail on the canvas.
   - Content area supports full glass children without double-stacking.
   - Preserve white/light context bar for operational density where needed, but allow dark glass variant.

3. **Theme / CSS Bridge**
   - Extend `index.css` with `.ces-glass-card`, `.ces-glass-column`, `.ces-urgency-left-border-2` etc.
   - Ensure `--ces-navy-soft` etc. work inside glass layers.
   - Add Navy Dark specific overrides that match the rich navy glass + teal accent in v2 mocks.

4. **Migration of Low-Risk Surfaces (parallelizable)**
   - `CesExecutiveDashboard`, `ComplianceCalendar`, `ExecutiveReports` (wrap charts in glass cards).
   - `WorkloadDistribution` SummaryStat → glass stat cards.
   - `CesCard` becomes thin wrapper or deprecate in favor of `CesGlassCard`.

5. **Validation**
   - Visual diff vs baselines.
   - Light + Dark mode regression on key pages.
   - No breakage to enforcement or drag logic.

**Specific Recommendations — Board Layout (Phase 1 foundation enables Phase 2):**
- Keep internal 6-state model (enforcement contract).
- Render as horizontal scrollable grid of 6 `CesGlassColumn` (tinted headers using navySoft / orangeSoft / redSoft / greenSoft glass variants).
- Or grouped 4-column presentation (Backlog | Active | Review | Done) with internal state pills inside cards — decision in Phase 0/1.

**Exit Gate:** All CES surfaces use only `CesGlassCard` / new primitives (no raw `style` background white). `CesLayout` supports glass. Visuals directionally match v2 glass aesthetic in light/dark. 0 regressions in logic.

---

## Phase 2 — Board & Kanban + Task Card Anatomy (Core Deliverable — 5-6 days)

**Goal:** Deliver the CES Board that looks and feels like 04_CESBoard_Desktop_v2.jpg + mobile equivalent. Implement exact card anatomy and urgency hierarchy.

**Objectives:**
- Rebuild `SprintExecutionBoard` + `ExecutionUnitCard` using Phase 1 glass primitives.
- Implement layered card elevation + left accent urgency system per spec.
- Align visual grouping, progress bars, avatars, escalation, badges to mock.
- Preserve full drag/drop + enforcement (snap-back, warnings).
- Mobile: vertical list + FAB + bottom sheet detail.

**Detailed Work Items & Card Anatomy (Mandatory Match to Mocks + Spec)**

**Task Card Anatomy (ExecutionUnitCard + CesGlassCard):**
1. **Outer:** `CesGlassCard` (urgency-driven left border: none for L1, teal for L2, orange for L3, red for L4 — subtle 3-4px).
2. **Header row:** Title (bold 13-14px, ink), PhaseIndicator (small pill), ComplianceStateBadge.
3. **Meta line:** Patient / Event / Workflow name (muted).
4. **Progress / Evidence row:** Teal or orange progress bar (percentage or signatures complete / required) + AuditReadinessTag.
5. **Signers / Escalation (if awaiting):** Avatars with status rings (green/orange/red) + `EscalationTimer` badge.
6. **Blocked reason** (if blocked): Soft red glass pill with icon + text.
7. **Footer:** Owner avatar + name (left), Due date (right, bold when urgent) + quick actions (icons only: eye, pen, upload).
8. **Hover / Drag:** Lift (stronger glass shadow), drag affordance cursor, column drop targets with glass highlight.

**Board Layout Recommendations (match v2 calm authority):**
- Desktop: 6 (or grouped 4) glass columns, generous min-width cards, subtle event swimlane headers (navy muted pill + chevron, low visual weight).
- Column headers: Glass-tinted, uppercase tracking, count badge in white/contrast glass.
- Empty state: Calm centered text + icon inside column.
- Header bar above board: Sprint selector (glass pill), open/closed counts, search (glass input).
- Inline enforcement warnings: Glass orange/red banner (not jarring).
- Drawer (WorkflowDrawer): Slide-in glass panel (right) with timeline, evidence, signature roster — frosted navy glass, matching mock detail density.
- Mobile: Vertical stacked `CesGlassCard` list, grouped by state or due urgency. Pull-to-refresh. Tap → bottom sheet (SprintTaskPanel glass variant).

**Additional Board Polish:**
- `SwimlaneHeader` → subtle glass or on-glass section.
- Drag preview uses glass lift.
- Full keyboard + ARIA (already partially present via AriaLiveRegion).

**My Tasks Integration (early in this phase):**
- Convert list rows to `CesGlassCard` instances or premium glass list items.
- Filters as glass segmented control or maturity toolbar.
- Role chips (Robert) as glass pills.
- Match 10_CESMyTasks mock table density with glass cards where appropriate (or clean glass table).

**Exit Gate:** CES Board (desktop + simulated mobile) visually matches 04_CESBoard_*_v2 mocks within 95% pixel/treatment fidelity (glass, left accents, progress, badges, spacing, calm navy tone). All urgency levels implemented per spec. Drag still 100% functional. Visual regression sign-off.

---

## Phase 3 — Workloads, Reports, Calendar, Details, My Tasks Full Polish (4-5 days)

**Objectives:** Bring remaining high-traffic CES surfaces to same glass + mock fidelity.

**Work Items:**

1. **Workloads (CesWorkloadsPage + WorkloadDistribution)**
   - Replace table with responsive grid of owner `CesGlassCard` (avatar + name + role header).
   - Visual capacity indicators: Glass progress bars or mini radial (teal/amber/red) matching mock workload viz.
   - SummaryStat cards become glass stat tiles (large number + icon + risk).
   - CapacityRiskCell → integrated urgency badge + dot.
   - Recommendation: Owner cards with stacked bars (allocated vs in-flight vs overdue) inside glass surface. Sort by risk (red first) with calm ordering.

2. **Reports (ExecutiveReports)**
   - Wrap each chart in `CesGlassCard` (title in glass header).
   - Enhance SVG charts with glass-friendly colors (navy lines, teal targets, soft fills).
   - Add glass KPI hero tiles for current sprint metrics (completion %, SLA, audit score) above grid.
   - Trend deltas use glass subtle callouts.
   - Recommendation: Match any chart visuals in mocks with calm grid of glass panels.

3. **Calendar (ComplianceCalendar)**
   - Day cells as subtle glass or on-glass sections.
   - Events as glass mini-cards or pills with domain tints.
   - Signature windows highlighted with orange glass accent.
   - Retrospective day special glass treatment.
   - Legend as glass toolbar.

4. **Task Detail / Drawer / SprintTaskPanel**
   - Full glass panel treatment (backdrop + frosted slide-in or bottom sheet).
   - Sections (Ready / In Progress / Awaiting / Blocked / Completed) as glass sub-panels or accordions.
   - Form viewer inline inside glass container.
   - Timeline / evidence / signatures use glass KV rows + avatar lists.
   - Maximize form → centered glass modal.

5. **Review Components**
   - `CesRoleReviewSwitcher`, diagnostics panel → glass floating panel (subtle navy glass, high contrast for Robert-only).

6. **Cross-Cutting**
   - Full inline-style removal (replace with className + CSS vars).
   - Typography scale, spacing, icon sizes aligned to DESIGN_SYSTEM docs.
   - Mobile responsive matrix for all CES pages.
   - Empty states, loading skeletons as glass variants.

**Exit Gate:** All CES surfaces (Board, MyTasks, Workloads, Reports, Calendar, Detail) pass side-by-side visual comparison to corresponding v2 mocks (including 10_CESMyTasks, 09_CESReports, 11_CES_TaskDetail, etc.). Navy Dark mode matches "Top Picks" dark glass aesthetic.

---

## Phase 4 — Validation, Mobile Convergence, Documentation & Handoff (3-4 days)

**Objectives:** Production-ready, documented, regression-proof, handed off with living spec.

**Work Items:**

1. **Full Visual Regression & UAT**
   - Capture after screenshots for every CES page in light + Navy Dark, desktop + mobile viewports.
   - Diff against v2 mock references + baselines.
   - Stakeholder / Robert review sign-off (especially role diagnostics + enforcement).
   - Playwright or manual matrix for drag, signatures, blocked flows, escalations.

2. **Mobile-First Convergence**
   - Verify vertical lists, bottom sheets, FABs, large tap targets per spec.
   - Touch drag or swipe actions for board states (optional stretch).
   - Responsive column collapse (horizontal scroll on tablet, vertical on phone).

3. **Documentation & Governance**
   - Update `CES_BOARD_VISUAL_LANGUAGE.md` and `TASK_URGENCY_HIERARCHY_SPEC.md` with "Implemented" notes + code pointers.
   - Add `CesGlassCard` usage examples to `COMPONENT_USAGE_EXAMPLES.md` and `ces/` README (create if absent).
   - Update `DRIFT_REGISTER.md` / `UIUX_DESIGN_SYSTEM_AUDIT.md` to close CES parallel-system debt items.
   - Single-point-of-change note: future CES glass refinements go through the new primitives + theme.ts.

4. **Performance & Polish**
   - Ensure glass effects (if backdrop-filter) are performant (use sparingly or CSS-only).
   - Dark mode contrast AAA verified for all urgency states.
   - Accessibility: ARIA on cards/columns, focus rings, keyboard drag fallbacks.

5. **Handoff**
   - Subagent 06 sign-off report.
   - Pair with FE owner on any remaining shared primitive evolution (e.g., promote successful `CesGlassCard` patterns into global `ui/`).
   - Flag any future CES-specific glass tokens needed.

**Exit Gate:** 
- 100% visual match to v2 mocks (or documented intentional deltas approved).
- Zero open visual debt for CES.
- All surfaces use glass primitives.
- Living documentation updated.
- "This is the calm authoritative compliance engine" — immediate impression test passed by designer/exec.

---

## Phase Sequencing & Resource Notes

- **CES Priority:** Phases 1+2 must start immediately and complete before or in parallel with non-CES glass work. CES is the proof point for the entire compliance platform.
- **Dependencies:** Phase 1 primitives before Phase 2 cards. Global glass shell stability assumed.
- **Risks & Mitigations:**
  - Navy vs global glass conflict → Scoped CES glass tokens + explicit "CES glass variant" in docs.
  - Drag/drop complexity → Freeze board logic in Phase 1; only wrap visuals in Phase 2.
  - Review mode / Robert diagnostics → Treat as overlay; keep functional while glass-polishing.
- **Success Metrics:**
  - Visual regression pass rate ≥ 95% vs mocks.
  - Zero new inline styles in CES.
  - Clinician / auditor "calm authority" qualitative feedback.
  - Reduced CesCard / primitive duplication (target: single source).

---

## Unique CES Lens Recommendations (Embedded)

- **Board Layout:** Favor fidelity to enforcement (6 states) rendered in calm glass columns rather than forcing 4-col if it hides state machine. Use subtle grouping headers.
- **Task Card Anatomy:** Left accent border + layered glass elevation is non-negotiable for urgency hierarchy (spec + mock). Progress bar + signature count is the single most important visual signal.
- **Workload Visualizations:** Move from table to owner glass cards with visual bars/radials. Capacity risk must be instantly scannable (red first, calm ordering).
- **Reports:** Glass cards around charts + hero KPIs create executive calm vs data dump.
- **Overall:** Every CES surface should whisper "this will never let a signature or blocker fall through" through its visual language.

---

**End of 4-Phase Plan — Subagent 06**

*CES surfaces are now positioned to become the visual crown jewel of the compliance-defensible platform. Execute Phase 1 immediately.*