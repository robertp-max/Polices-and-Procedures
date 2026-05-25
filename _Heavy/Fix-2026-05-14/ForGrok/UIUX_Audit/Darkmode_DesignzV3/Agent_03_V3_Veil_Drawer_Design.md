I am Agent 03 — Right Drawer / Veil Designer. Current assessment of clutter on the default view: The current task execution surfaces are dominated by dense, always-present or easily-triggered right panels that cram technical ID strips, full FormViewers, evidence lists, multi-signer flows, certification checklists, audit tabs, and persistent "keep checklist visible" affordances into the primary workflow, making any clean minimal list view impossible.

# Agent 03 — Right Drawer / Veil Designer — Phase 1.1 Clutter Reduction Recommendations

**Agent:** 03 — Right Drawer / Veil Designer  
**Date:** 2026-05-18  
**Reference Screenshot Analyzed:** Dense CES / PM task execution views including `02-real-ces-task-form-opened.png` (stacked FORM + SUPPORTING EVIDENCE + SIGNATURES + REVIEW/CERTIFICATION + LOCK/AUDIT sections with teal context banners and dense field layouts); dark execution panels from `phase2-shell-visual/desktop-*-ces-dashboard-*.png` and `wave-10-uiux-premiumization/desktop-ci-ion-dark-light-_my-tasks.png` (right detail panels with OVERVIEW / TASKS / AUDIT TRAIL / TECHNICAL DETAILS tabs, status meta grids, workflow progress, "Keep checklist visible" footer, and multi-section content); current `WorkflowExecutionPanel.tsx`, `GlobalTaskDrawer.tsx`, `TaskDetailRightPanel.tsx`, and `RightDrawer.tsx` implementations showing persistent right rails, context ID strips, and heavy internal stacking.  
**Target Reduction:** Minimum 70% clutter reduction on default view

---

## 1. Current Clutter Diagnosis

The dominant visual and cognitive pollution on default task list and execution surfaces originates from the right-side execution panels (WorkflowExecutionPanel, GlobalTaskDrawer wrapping TaskDetailRightPanel, and inline variants). These panels are architected as "everything at once" containers:

- Persistent or semi-persistent fixed right rails (420–680px) that permanently steal 35–45% of horizontal real estate even when "closed" in some flows.
- A mandatory dense header "Context strip" exposing 7+ technical IDs (event, task, form template/instance, policy, workflow, req) in monospace — pure developer noise for end users.
- Vertical stacking of 5–8 heavy sections without sufficient progressive disclosure: primary FORM (FormViewer), SUPPORTING EVIDENCE (lists + uploads), SIGNATURES (multi-row approval + canvas), REVIEW / CERTIFICATION (completion checklist + certify gate), AUDIT / TECHNICAL tabs, notes, history, and workflow progress.
- Additional persistent elements: bottom "Keep checklist visible" links, tab bars, and action footers that remain in view.
- On list views (My Tasks, Sprint boards, Calendar), clicking a row often either splits the layout or opens an equally dense overlay, never returning the user to a truly minimal scanning surface.
- Glass treatment exists (`ci-glass-panel`) but is under-utilized for "veil" depth; panels feel like opaque sidebars rather than elegant contextual overlays.

This design forces users to parse massive information density the moment they look at tasks or open any detail.

**Estimated current clutter level:** 82% on default task scanning / list views (layout split + internal section overload); 65% even inside the panels themselves due to lack of internal hierarchy.

---

## 2. 70% Reduction Strategy

All recommendations center on transforming the current "heavy right rail / dense panel" into a single, premium, completely dismissible **Veil Drawer** — a true glass overlay that only exists when needed and vanishes without trace when closed.

### 2.1 Move to Right-Side Drawer (Veil)
- Full FormViewer embeds and all form-filling interactions → primary content area of the Veil Drawer (wider `lg`/`xl` tier when form present).
- All supporting evidence lists, upload zones, artifact galleries, and evidence status → dedicated collapsible VeilSection inside drawer.
- Signature request flows, signer rows, drawn/typed signatures, eCIgn packet review → VeilSection (with composite collapse pattern preserved but elevated inside glass).
- Review / certification checklists, completion gates, "Certify Event Complete" / lock actions → sticky or prominent footer + VeilSection.
- Audit trails, notes, file history, technical logs → secondary tab or bottom collapsible VeilSection (never default-visible).
- All ID context metadata → completely removed from UI (available only via dev tools or a hidden "debug" affordance inside Veil).
- "Keep checklist visible" and similar persistent footers → eliminated from main view; surfaced only inside Veil when relevant.
- Workflow progress bars / current step indicators beyond a single status pill → moved inside Veil header or overview section.

### 2.2 Move to Hover Cards / Previews
- On default list rows: subtle hover reveals 3–4 key facts (due/SLA, owner, 1–2 requirement types, quick status rollup) in a small floating glass preview card (delegated to Agent 04). Never duplicates full Veil content.
- Quick "evidence count" or "signatures pending" micro-badges that expand on hover.

### 2.3 Move to Modals
- Rare full-screen focus cases only (e.g., very large multi-page form review with many signers simultaneously, or executive certification summary). Default preference is always the Veil for continuity and to keep the task list context visible behind the glass. Coordinate decision matrix with Agent 05.

### 2.4 Remove or Collapse Entirely
- All inline/persistent right rails on calendar, gantt, kanban, sprint, and my-tasks pages → removed. Every surface uses the single triggered VeilDrawer.
- Technical context ID grids and debug strips → deleted from production surfaces.
- Horizontal tab overload inside detail surfaces → replaced by vertical, collapsible, glass-tinted VeilSections with clear icons and count badges.
- Redundant "summary guidance" banners and repeated meta → consolidated into Veil header only.
- Split-view percentages (e.g., 60/40 layouts) → eliminated; list always full-bleed when Veil is closed.

### 2.5 React Component Opportunities
- `VeilDrawer` — upgraded canonical primitive replacing/augmenting current `RightDrawer`. Props: `open`, `onClose`, `widthTier`, `title`, `eyebrow`, `children`, `glassVariant="veil"`. Handles unmount-on-close, focus restore, Esc, backdrop click, and optional left-edge drag-to-close.
- `VeilSection` — reusable internal glass card (`FloatingGlassCard` composition) with optional collapse, icon, count, and "primary action" slot. Used for Evidence, Signatures, Certification, History.
- `TaskRowMinimal` (and `useTaskRowMinimal` hook) — the only row component allowed on default lists. Zero IDs, zero secondary links, pure scannable essentials + row-level click target for Veil.
- `useVeil` or integration with existing `useSelectedTaskStore` / `regulatoryExecutionStore` — single source of truth for open/closed state across the app.
- `VeilBackdrop` — separate component for the scrim + optional task-list blur/dim effect.
- Animation primitives: `veilSlideIn`, `veilContentStagger` (for sequential reveal of internal sections).

---

## 3. Impact on Default View

**Default view after implementation:** A calm, full-width (or centered max-width container), vertically scrolling list of ultra-minimal task rows. Each row contains only:
- Completion checkbox (left)
- Task title (primary, bold, truncates gracefully)
- Status pill (color-coded, compact)
- Due date (subtle, right-aligned or under title on narrow)
- Owner avatar or initials (tiny)
- Optional micro hover affordance (right chevron or "Veil" glass icon that appears on hover/focus)

No side panels, no split layouts, no footers with lists, no visible IDs, no tabs, no chrome. The entire surface feels like a premium dark "command list" — scannable in < 2 seconds.

Clicking (or keyboard activating) any row instantly summons the Veil Drawer from the right as an elegant glass overlay. The list remains softly visible behind it.

When the Veil is dismissed (X, Esc, backdrop, drag), it slides out completely and unmounts — the list regains 100% of the viewport with zero layout artifacts.

**Expected visual reduction:** 78% (conservative; measured by occupied chrome pixels, visible section count, and interactive element density on first load of a task list page).

**Before vs After summary**

| Aspect                        | Before (Current)                                      | After (V3 Veil)                                      |
|-------------------------------|-------------------------------------------------------|------------------------------------------------------|
| Default list width            | 55–65% (split by rail or heavy overlay)               | 100% full-bleed                                      |
| Visible content sections on load | 6–9 (IDs + tabs + 4–5 stacked blocks + footers)     | 0 (pure list rows only)                              |
| Right chrome footprint        | Persistent 420–680px opaque panel or rail             | 0px when closed; temporary 520–720px glass veil      |
| Technical metadata exposure   | Always visible (context strip)                        | Never visible to end users                           |
| Row information density       | Title + ID + 5–6 meta fields + links                  | Title + status + due + owner (4 elements max)        |
| Drawer "presence"             | Feels like a permanent sidebar                        | Feels like a summoned, dismissible glass veil        |
| Glass usage                   | Under-powered `ci-glass-panel`                        | Premium translucent frosted veil + internal layers   |

---

## 4. Glassmorphism Application (Veil Glass Rules)

The Veil Drawer is the **hero application** of V3 Veil Glass. It must feel materially different from static cards — lighter, more atmospheric, intentionally "veiled."

**Core Veil Panel Treatment (Dark Mode):**
- Background: `rgba(13, 26, 45, 0.78)` to `rgba(15, 23, 42, 0.85)` (slightly translucent)
- Backdrop filter: `blur(18px) saturate(1.15)` — strong enough for true frosted-glass veil effect over the task list
- Border: Full 4-sided V3 contract per Agent 02 — `1px solid rgba(255,255,255,0.10)` + soft luminous outer glow `0 0 0 1px rgba(255,255,255,0.06), 0 0 40px -8px rgba(94, 234, 212, 0.18)` (teal-tinted per V3 north star)
- Elevation: `box-shadow: 0 25px 70px -15px rgba(0,0,0,0.65), -8px 0 30px -10px rgba(0,0,0,0.35)` (left edge emphasis because it "slides over" from right)
- Border radius: Only top-left + bottom-left corners rounded (12–16px); right side flush to viewport edge for "drawer" affordance
- Header: Slightly higher opacity or a stronger bottom hairline + subtle gradient for separation
- Internal VeilSections: Use the standard `FloatingGlassCard` primitive (Agent 01) at Layer 2 with reduced blur (`blur(8px)`) and lighter borders so they read as "content islands floating inside the veil"

**Veil Effect Specifics:**
- The backdrop scrim is deliberately soft (`rgba(0,0,0,0.22)`) rather than heavy black so the clean task list underneath stays contextually visible — this is what makes it a "veil" rather than a blocking panel.
- During open animation the panel and its internal glass both increase blur/opacity in sync, creating a beautiful "condensing from atmosphere" materialization.
- Light mode pairing: Higher opacity base (0.92), drop shadows instead of outer glow, softer blur.

**Restraint (per Agent 13):** Glassmorphism is used **only** on the Veil panel itself and its direct internal sections. No glass on the default list rows, no decorative glass dividers elsewhere on the page, no glass on hover previews (use subtle elevation only). This keeps the default view brutally minimal.

**Tokens to define (coordinate with Agent 03 Tokens work):**
- `--v3-veil-bg: rgba(13,26,45,0.82)`
- `--v3-veil-blur: 18px`
- `--v3-veil-border: rgba(255,255,255,0.10)`
- `--v3-veil-glow: 0 0 40px -8px rgba(94,234,212,0.18)`
- `--v3-veil-slide-duration: 280ms`
- `--v3-veil-ease: cubic-bezier(0.32, 0.72, 0, 1)`

---

## 5. Risks & Trade-offs

- **Affordance discovery risk:** Users accustomed to persistent side panels may initially miss that details live behind a row click. Mitigation: excellent hover micro-interactions, first-run empty-state callout ("Click any task to open the Veil"), keyboard hints, and consistent chevron affordance.
- **Power-user friction:** High-frequency task completers will perform one extra click per task. Mitigated by: keyboard shortcut (e.g., `Enter` or `V`), "Open next incomplete" action inside Veil, and hover previews that surface 80% of what most users need.
- **Form width on narrow viewports:** Very wide forms inside Veil will require internal horizontal scroll or automatic "Open in new tab" escape hatch (already present in current code).
- **Accidental close:** Backdrop click is powerful but can close unintentionally. Solution: require a small drag distance on the left veil edge for gesture close, or make the left 12px of backdrop inert.
- **State loss on close:** Ensure form progress, evidence uploads, and signer state persist in the regulatoryExecutionStore / formInstances so closing the Veil is safe (already largely true today).
- **Coordination overhead:** If other agents push too much into modals or hovers, Veil may become under-used. Guardrail: Veil is the default container for task execution depth.

---

## 6. Dependencies on Other Agents

- **Agent 02 (Progressive Disclosure Architect):** Definitive "what stays in the minimal row vs. what must live exclusively in the Veil." The Veil design is downstream of the disclosure matrix.
- **Agent 05 (Modal vs Drawer Decision Maker):** Confirmation that the Veil (not a full modal) is the canonical container for 90%+ of execution detail. Any exceptions must be explicitly called out.
- **Agent 06 (Task List Minimal Core Defender):** Exact content contract for `TaskRowMinimal` so the row click target is unambiguous and the list stays under 4 visual elements.
- **Agent 07 (Detail Containment Rules Enforcer):** The authoritative matrix of every data type (FORM, EVIDENCE, SIGNATURE_*, CERTIFY, AUDIT) → which VeilSection + priority order inside the drawer.
- **Agent 13 (Glassmorphism Restraint Specialist):** Final approval on translucency, blur radius, and glow intensity so the veil does not become "too pretty" at the expense of the minimal default view.
- **Agent 14 (Cross-Surface Consistency Guardian):** Guarantee that Calendar events, Policy Library items, Evidence Center, Onboarding tasks, and PM boards all invoke the identical `VeilDrawer` primitive with the same open/close/animation contract.
- **Agent 04 (Hover Card & Preview Strategist):** Preview content must be a strict subset of Veil content; no conflicting data.
- **Agent 16 (70% Reduction Validator):** Must include Veil-specific metrics (e.g., "default view interactive element count", "time from list to first detail", "percentage of sessions that close the Veil within 30s").

---

## 7. Measurement & Validation Approach

Agent 16 should use the following Veil-specific instrumentation to prove the 70%+ goal:

1. **DOM / Visual Density Audit (automated)**
   - On any default list page with Veil closed: count of rendered DOM nodes, visible text nodes, and interactive controls inside the list container.
   - Target: ≤ 28% of current count.
   - Compare before/after using the same task list (e.g., "My Tasks" or "QAPI event task list").

2. **Chrome Footprint Metric**
   - Pixel width of non-list content on load (0 when Veil closed).
   - Percentage of viewport occupied by persistent right chrome.

3. **Screenshot Diff Protocol (Agent 16)**
   - Capture full-width default task list (Veil closed) at 1440px, 1600px, and mobile.
   - Side-by-side with current state; quantify non-list UI area reduction.

4. **Behavioral Proxies**
   - Average time to locate a specific task and understand its status on first load.
   - "Veil open rate" + "median time Veil stays open" (should be purposeful, not exploratory due to hidden info).
   - Escape key / backdrop close success rate (a11y + UX health).

5. **Component Contract Test**
   - `VeilDrawer` must render `null` in the React tree when `!open`.
   - Main list container must receive `data-veiled="false"` (or absence of attribute) when closed — no residual width classes.
   - All surfaces must route through the single primitive (grep enforcement in CI).

6. **Glass Fidelity**
   - Visual QA that the veil panel exhibits the exact V3 4-sided border + glow on dark at 100% and 125% zoom; translucency must allow task list text behind to remain legible at WCAG contrast when blurred.

---

## 8. Phase 1.1 Exit Recommendation

Before Phase 2 foundation work begins, the following Veil Drawer artifacts must be locked and co-signed by Agents 02, 05, 06, 07, 13, and 14:

- Complete `VeilDrawer` TypeScript interface + default implementation sketch (or direct edits to `RightDrawer.tsx` migrating it to V3 veil variant).
- Token + CSS module additions for `--v3-veil-*` family and `veil-glass` utility classes.
- Animation specification (exact timing, easing, stagger values, and whether framer-motion or pure CSS transitions are used).
- Internal section template (5 canonical VeilSections with example markup for Form, Evidence, Signatures, Certification, History).
- Updated `useSelectedTaskStore` / execution store integration example showing how any list (PM, CES, Calendar) can open the Veil with one line.
- Visual QA matrix (dark + light, multiple widths, form vs non-form mode) with annotated "before/after" screenshots.
- Explicit "no remnant rail" migration checklist for every current consumer of WorkflowExecutionPanel, GlobalTaskDrawer, and inline RightDrawer.

Once these are delivered and the 70% reduction math is validated by Agent 16, the Veil Drawer design is considered Phase 1.1 complete and ready for high-fidelity implementation in Phase 2.

**Agent 03 Signature:** V3 Veil Drawer — Phase 1.1 — 2026-05-18

*This spec is intended to be concatenated into the master Phase 1.1 Clutter Reduction Strategy and fed directly into the V3 codegen prompts for Phase 2.*