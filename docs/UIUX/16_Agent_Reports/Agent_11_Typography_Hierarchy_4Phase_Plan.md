# Agent 11: Typography, Visual Hierarchy & Content Density — 4-Phase Remediation Plan

**Subagent:** 11 — Typography, Visual Hierarchy & Content Density Specialist  
**Date:** 2026-05-17  
**Mandate:** Deliver calm-authority typography that makes the one-glass premium surfaces feel spacious, scannable, and authoritative — never noisy or cramped.  
**Constraints:** Must include (1) early typography hardening pass, (2) content-density audit + explicit reduction targets per surface, (3) final validation against reference mockup-style glass panels.

---

## Phase Overview

| Phase | Name                              | Duration (est.) | Key Deliverable                              | Typography Hardening | Density Audit | Mockup Validation |
|-------|-----------------------------------|-----------------|----------------------------------------------|----------------------|---------------|-------------------|
| 1     | Typography Hardening & Token Lock | 2–3 days        | Enforced scale + line-height tokens + font stack migration | **Primary**          | Light         | —                 |
| 2     | Content Density Audit + Reduction | 3–4 days        | Per-surface inventory + concrete reduction targets + content pruning | Supporting           | **Primary**   | —                 |
| 3     | Implementation & Hierarchy Repair | 4–5 days        | Component-level fixes, microcopy alignment, urgency visual strengthening | Full enforcement     | Ongoing       | Initial spot-checks |
| 4     | Validation & Polish               | 2 days          | Side-by-side comparison with v2 mockups + 500 ms scan tests + sign-off | Hardening lock       | Final audit   | **Primary**       |

**Total:** ~11–14 working days (can run in parallel with other agents on non-overlapping surfaces).

---

## Phase 1: Typography Hardening Pass (Early — Highest Leverage)

**Goal:** Establish an unbreakable, token-driven type system that matches or exceeds TYPOGRAPHY_SCALE.md before any density or visual work touches text.

### 1.1 Token & CSS Foundation
- **Extend/align** `--ci-font-*` and new `--ci-line-height-*` tokens in `src/index.css` (and sync to audit/Implementation/tokens/tokens.json + generators).
  - Add full line-height scale:
    - `--ci-line-height-display`: 1.15–1.2
    - `--ci-line-height-title`: 1.25
    - `--ci-line-height-subtitle/card`: 1.3–1.35
    - `--ci-line-height-body`: 1.55 (desktop) / 1.5 (mobile)
    - `--ci-line-height-body-sm`: 1.5
    - `--ci-line-height-label/caption`: 1.4
  - Enforce font families per spec:
    - Headings & important titles: `font-family: var(--ci-font-family-heading)` → Montserrat 600/700
    - Body & UI: `Inter` (or current Outfit fallback with plan to swap) 400/500
    - Mono: JetBrains Mono
- Create utility classes:
  - `.ci-text-display`, `.ci-text-title`, `.ci-text-subtitle`, `.ci-text-body-lg`, `.ci-text-body`, `.ci-text-body-sm`, `.ci-text-label`, `.ci-text-caption`, `.ci-text-mono`
  - All must resolve **only** to CSS var tokens (no literals).
- Add `font-weight` and `letter-spacing` tokens to match TYPOGRAPHY_SCALE exactly.
- **Lint rule addition** (eslint + CI): ban raw `text-[0-9]px`, `text-xs` (except inside approved status pills), `text-sm` on body content inside glass surfaces. Route all through ci-text-*.

### 1.2 Font Stack & Rendering Hardening
- Update `@import` and `body` / `.font-heading` / `.font-body` in `index.css` and `tailwind.config.js` to prioritize **Inter** for body (add Google Fonts or self-host as needed) while keeping Montserrat for headings.
- Add `text-rendering: optimizeLegibility; font-feature-settings` for clinical clarity.
- Ensure 600/700 weights load for headings; 500 for medium-emphasis card titles per spec.
- Dark/light contrast pass: guarantee ≥ 4.5:1 on all new body sizes at 12 px+ on glass.

### 1.3 Early Adoption on Core Shell
- Migrate **CommandCenterLayout.tsx** nav/menu text, **DashboardPage.tsx** hero/section titles, KPI labels, and **Shell* primitives** first.
- This gives immediate visual win and proves the system before touching high-risk dense cards.
- **Exit criteria:** Zero raw size literals in shell + dashboard hero surfaces. All text uses new ci-text-* + line-height utilities. Verified in both themes.

**Typography Hardening is deliberately first** so that subsequent density reduction work has a correct target scale to design against (prevents "make it 13 px and call it done").

---

## Phase 2: Content Density Audit + Reduction Target per Surface

**Goal:** Quantify and cut information volume so that the (now-hardened) larger, breathing typography actually fits without cramping the glass.

### 2.1 Systematic Audit Process
- Inventory every glass/operational card and panel:
  - List every text node (eyebrow, title, meta, badge, helper, blocked reason, etc.)
  - Measure current font-size + line-height + gap/padding
  - Score "first 500 ms scan success" (can a clinician identify state + owner + urgency + next action in <1 s?)
- Use screenshots from `tmp-ui-verify-screenshots/` + v2 mockups for baseline.
- Produce **Surface Density Report** (add to docs/UIUX/16_Agent_Reports/ or new Agent_11_Density_Inventory.md).

### 2.2 Explicit Reduction Targets (Non-Negotiable)

| Surface / Component                  | Current Approx. Text Elements per Card | Target Max Elements | Size Floor | Line-Height Floor | Padding/Gap Target | Notes / Pruning Tactics |
|--------------------------------------|---------------------------------------|---------------------|------------|-------------------|--------------------|-------------------------|
| CES ExecutionUnitCard                | 8–10                                  | **5 max**           | 12 px      | 1.45              | p-4, gap-2, space-y-1.5 | Collapse 3 status badges into 1 composite pill; move audit score to hover/tooltip or footer only; shorten blocked reason to 1 line max |
| Dashboard TaskCard                   | 6                                     | **4 max**           | 12 px      | 1.5               | p-4                  | Demote domain to icon+tooltip or merged badge; keep title + owner + due at body-sm or larger; remove one divider |
| EvidenceCenter filter/metadata panels| 12+ labels                            | **6–7**             | 12 px      | 1.45              | Increased row gap    | Group into 2–3 semantic sections; promote critical IDs to body text; hide secondary in "More" disclosure |
| Onboarding V2 phase rails & timeline | 7–9                                   | **4–5**             | 12 px      | 1.5               | py-2.5               | Reduce "v2 · Audit-grade..." to single line or remove; collapse timeline events to 2 lines max + icon |
| BoardColumn headers + count badges   | 3                                     | 2                   | 13 px      | 1.4               | —                    | Keep title + count; use icon accent only |
| Account menus / secondary nav        | 4–5                                   | 3                   | 13 px      | 1.5               | —                    | Standardize all to ci-text-body-sm |
| KPI cards & Agency Banner            | 3–4                                   | 3                   | 12 px      | 1.5               | —                    | Already better; only minor tightening |
| Policy Detail / Library cards        | Varies                                | Enforce body 15 px  | 13 px min  | 1.55              | —                    | Apply same rules |

**Global Rules (enforced in Phase 3):**
- No text smaller than 12 px anywhere on glass operational surfaces (11 px allowed only for true captions inside very constrained mobile contexts with explicit waiver).
- All body text in cards/panels: minimum `leading-[1.5]` or token equivalent.
- Urgency badges/due labels: minimum `text-[13px]` or ci-text-body-sm + semibold.
- Maximum 2 lines for any title inside a card.
- "First 500 ms" test: after changes, the dominant visual must be the **title + urgency signal**, not a field of labels.

### 2.3 Content Pruning Tactics (Microcopy Alignment)
- Apply CONTENT_MICROCOPY_GUIDELINES.md ruthlessly:
  - Shorten domain labels, use icons + one-word status where possible.
  - Turn long blocked reasons into "Blocked: <short phrase>" + detail on tap/click.
  - Replace repetitive metadata ("Event ID", "Workflow") with semantic grouping or progressive disclosure.
- Align urgency language exactly to TASK_URGENCY_HIERARCHY_SPEC.md (no invented labels).

**Phase 2 Exit Criteria:** Signed-off Density Reduction Matrix with before/after counts and explicit "this text was removed or merged" list per surface. No component may proceed to Phase 3 implementation without its row approved.

---

## Phase 3: Implementation & Hierarchy Repair

**Goal:** Execute the hardened typography + reduced content across all surfaces while preserving (or improving) functionality.

### 3.1 Order of Attack (Dependency-Aware)
1. Shell primitives & Dashboard (hero, KPI, TaskCard, BoardColumn) — immediate user-visible calm.
2. CES board cards (ExecutionUnitCard, primitives, SprintExecutionBoard).
3. EvidenceCenter (highest form density).
4. Onboarding V2 layouts, rails, timelines.
5. Remaining: Library, PolicyDetail, Journey/Onboarding V1, staffing, reports, modals.
6. Global sweep for any remaining raw text-[xx] or text-xs on content surfaces.

### 3.2 Hierarchy & Urgency Strengthening
- Apply correct weights: 700 for display/title, 600 for card titles/subtitles (per TYPOGRAPHY_SCALE), 500 for emphasis, 400 default body.
- Urgency treatment: 
  - Overdue/due-today: use `ci-text-body-sm font-semibold` + stronger badge treatment (never drop below 13 px).
  - Level 3/4 cards: slightly increased internal padding or left border width to give visual "weight" matching the importance.
- Add explicit line-height to every ci-text-* utility.
- Microcopy pass: rewrite any remaining vague or cramped helper text per guidelines (e.g., replace "text-xs uppercase tracking-wider" labels with clearer sentence-case where space allows after density cuts).

### 3.3 Technical Guardrails
- All changes go through the new ci-text-* + line-height utilities only.
- Theme-aware (light/dark) verified on every card.
- Responsive: mobile gets the mobile scale from TYPOGRAPHY_SCALE (slightly tighter but never <12 px on primary content).
- Accessibility: re-check contrast after size increases (larger text usually helps).
- Performance: no new font loads beyond planned Inter addition.

### 3.4 Coordination
- Work with Agent (Glass / Surface) and Agent (CES / Onboarding) subagents.
- Provide updated token matrix for their surfaces.
- Daily token-usage diff reviews.

**Phase 3 Exit Criteria:** 100% of prioritized surfaces using only hardened tokens. Zero violations of size floor or line-height floor inside glass cards. Visual diff baseline captured.

---

## Phase 4: Final Validation on Reference Mockup-Style Glass Panels

**Goal:** Prove that text inside the premium glass panels is now highly readable, scannable, and delivers calm-authority. Compare directly to reference v2 mockups.

### 4.1 Reference Mockup Set
- Desktop v2 glass examples: `01_Dashboard_Desktop_v2.jpg`, `02_EvidenceCenter_Desktop_v2.jpg`, `04_CESBoard_Desktop_v2.jpg`, `07_OnboardingDashboard_Desktop_v2.jpg`, `10_CESMyTasks_Desktop_v2.jpg`, `25_Dashboard_Light_SoftGlass.jpg`, `22_CES_MyTasks_Light_SoftGlass.jpg`
- Mobile v2 equivalents for responsive parity.
- "Top Picks" and Implementation/ folders for intended final visual language.

### 4.2 Validation Protocol
1. **Side-by-Side Pixel + Optical Comparison**
   - Render current (post-Phase 3) live surfaces at same viewport as mockups.
   - Measure: title size, body size, gaps between text blocks, line-heights (via dev tools or screenshots).
   - Target: live text must feel **at least as spacious** as the mockups while containing the required operational data (after density pruning).

2. **First 500 ms Scan Test (Human + Simulated)**
   - For each critical surface (CES card, TaskCard, Evidence panel, Onboarding rail):
     - Show screenshot for 500 ms → ask "What is the state? Who owns it? Is it urgent? What should I do next?"
     - Success threshold: ≥ 85% correct identification on 10 representative items per surface.
   - Include urgency hierarchy cases (overdue, blocked, due today).

3. **Readability & Calm-Authority Rubric**
   - Breathing room: no text block feels "full."
   - Hierarchy clarity: dominant element is always the most important (title or urgency).
   - Glass enhancement: increased type size + line-height makes the translucent surface feel more premium, not less.
   - Low contrast at edges: all body text ≥ 12 px with proper weight/opacity.

4. **Regression & Cross-Surface**
   - Full surface matrix re-audit (Phase 2 table).
   - Light mode + dark mode + mobile.
   - Print/PDF consistency (small text on glass can break print views).
   - Performance/lint gate: no new raw literals introduced.

5. **Sign-off Artifacts**
   - Updated screenshots in `tmp-ui-verify-screenshots/` or new `Agent_11_Validation_Screenshots/`
   - Pass/fail matrix against each reference mockup.
   - Final "Typography Health Dashboard" entry (see DESIGN_SYSTEM_METRICS_DASHBOARD.md).

**Phase 4 Exit Criteria:** 
- All reference glass panels pass 500 ms scan + readability rubric.
- No surface regresses below the hardened scale.
- Documented "before vs after" with unique typography lens commentary.
- Ready for handoff to broader visual regression testing (per VISUAL_REGRESSION_TESTING_STRATEGY.md).

---

## Risk & Mitigation

- **Risk:** Density cuts remove too much context → users lose critical info.
  - **Mitigation:** Progressive disclosure (tooltips, drawers, "View details") + strong Phase 2 sign-off with domain experts (compliance).
- **Risk:** Font swap (Inter) causes layout shifts.
  - **Mitigation:** Phase 1 early, with generous line-height buffer.
- **Risk:** Timeline pressure pushes typography hardening later.
  - **Mitigation:** This plan makes hardening Phase 1 — non-negotiable for premium outcome.
- **Risk:** Mobile cramped even after cuts.
  - **Mitigation:** Separate mobile scale (per TYPOGRAPHY_SCALE) + touch-target validation (44 px min).

---

## Success Metrics (Typography Lens)

- 0 instances of <12 px text on primary glass content surfaces.
- 100% body/card text using ≥ 1.5 line-height token.
- Average text nodes per card reduced by ≥ 35–40% on high-density surfaces (CES, TaskCard).
- First 500 ms scan accuracy ≥ 85% on audited flows.
- Visual parity or better vs. v2 reference mockups (subjective + measured).
- Token compliance: 0 raw size literals in audited files.

---

## Unique Typography Lens Insight — Embedded in Plan

The 4-phase structure is deliberately front-loaded with hardening because **typography is the foundation on which density decisions must be made**. You cannot decide "how much content fits" until you know the correct size and breathing room the glass demands. By validating last against the mockups that were drawn with the intended calm scale, we close the loop: the delivered UI will not merely be "fixed" — it will finally allow the one-glass surface to perform its designed emotional and operational role.

**Typography is not decoration. In this regulatory product it is patient safety and clinician sanity rendered in pixels.**

---

**Next Actions for Coordination**
- Share Phase 1 token diffs immediately with all surface-owning subagents.
- Schedule joint density audit workshop (Agent 11 + CES/Onboarding + Glass agents).
- Book final mockup validation session with design stakeholders using the v2 reference set.

*Prepared by Subagent 11 — Typography, Visual Hierarchy & Content Density Specialist*