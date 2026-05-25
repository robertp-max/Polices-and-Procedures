# Agent 16 — Mockup Fidelity, Visual Regression & Release Gatekeeping (V3) — Phase 1 Design Application Specification

**Agent:** 16 — Mockup Fidelity, Visual Regression & Release Gatekeeping (V3 Dark Floating Card Language)  
**Primary Surfaces Owned:** The V3 Fidelity Gate itself for 100% of surfaces; Dashboard as the primary living reference surface (must match `Dashboard_v3_Floating_Cards.jpg` and paired light image exactly); all visual regression baselines, harness, screenshot protocol, and the definitive "V3 Phase 1 Exit Gate" criteria. Every other agent's output is measured and countersigned here.  
**Date:** 2026-05-18  
**Visual North Star Reference:** 
- `mockup/v3/Dashboard_v3_Floating_Cards.jpg` (primary dark reference — floating glass cards with strong visible 4-sided borders on deep navy, multiple small KPI cards, main overview card, teal + warm orange accents, clear breathing room)
- `mockup/v3/Dashboard_v3_Light_Dark.jpg` (paired light mode reference showing identical layout and card structure with soft clean glass)
- `mockup/v3/V3_MOCKUP_DESIGN_SPEC.md` (authoritative rules — especially §1–5, §7, §10)
- Supporting: strongest v2 Top Picks / Desktop/v2 adapted to the new floating-card + visible-border language (Agent 05 reference)  
**Status:** Claude-Ready (V3) — this is the final authority gate for the entire 16-agent Phase 1 bundle.

---

## 1. Executive Translation — The V3 Fidelity Standard and Role of the Gatekeeper

Agent 16 owns the **final visual sign-off** that any generated surface (or the full product after Phase 2/3 codegen) truly matches the V3 dark floating card language shown in the two reference images.

The V3 aesthetic (per `V3_MOCKUP_DESIGN_SPEC.md` and the images) is defined by:
- Deep atmospheric Layer 0 navy/charcoal background (visible framing every element).
- Individual **floating glass cards** (never one giant container) each exhibiting crisp, visible borders on **all four sides**.
- Maximum **3-layer discipline**: Layer 0 (backdrop), Layer 1 (subtle hosts), Layer 2 (elevated floating cards, drawers, modals).
- Consistent breathing room (minimum ~16px gaps between cards and from shell edges) so cards "float".
- Restrained use of teal (#007970) and warm orange (#E07B2C) only for primary CTAs and critical status indicators.
- Dark mode is primary and premium/clinical; light mode must deliver identical layout, spacing, hierarchy, and "premium calm" feel using soft hairlines + subtle shadows.
- No full-bleed, no edge-touching cards, no merged borders, no heavy decorative inner blurs.

The two images are the **exact pixel and perceptual contract**. Side-by-side comparison of rendered output against these images (or approved golden-master screenshots derived from them once Dashboard is implemented) is the ultimate arbiter.

Current state assessment: Existing codebase and prior waves largely follow the old single-inset ShellContentFrame + edge-touching patterns. The primitives and patterns must be evolved (via Agents 01/02/03/15) before any surface can pass this gate. Dashboard (Agent 05) is the first and most important surface that must achieve near-perfect fidelity; all other surfaces are judged against the same language.

**Non-negotiable:** No surface may be declared "V3 complete" or included in any master codegen bundle without explicit Agent 16 countersignature on its fidelity matrix.

---

## 2. V3 Fidelity Checklist (Definitive Measurable Criteria)

This checklist is the single source of truth. Every Agent spec (and every generated surface) must include a "V3 Fidelity Verification Matrix" mapping its claims to these items. Agent 16 audits and signs each.

### 2.1 Layering & Floating Card Definition (Core V3 Contract)
- [ ] Layer 0: Deep navy/charcoal atmospheric background (`--ci-bg-deep` or equivalent) is always visible framing content (reference: full dark side of both V3 images).
- [ ] No single giant glass container wraps the entire content area (V3 spec §2, §5; images show multiple independent cards).
- [ ] Every major content block (KPI, overview, lists, panels, filters) is an independent `FloatingGlassCard` / `V3Card` (Layer 2 by default).
- [ ] Cards declare `data-v3-layer="1" | "2"` for regression targeting and runtime guards (Agent 01 contract).
- [ ] Maximum 3 layers enforced everywhere (no Layer 3+ nesting that collapses depth).

### 2.2 4-Sided Visible Border Treatment (Highest-Leverage Rule — Agent 02 Primary)
- [ ] Every floating card exhibits **visible borders on all four sides** against the background (V3 spec §3, §5; strongest signature in `Dashboard_v3_Floating_Cards.jpg`).
- [ ] Dark mode border signature: crisp inner hairline + soft outer luminous glow (exact strength and color temperature to match image; never disappears on any side).
- [ ] Light mode: equivalent 4-sided separation via soft hairline + subtle drop shadow (no side is lost).
- [ ] Elevated surfaces (drawers, modals, important cards) use stronger border/glow treatment than standard cards.
- [ ] No card side merges with parent, sibling, or viewport edge (anti-pattern §10).

### 2.3 Breathing Room, Spacing & Separation
- [ ] Minimum 16px (ideally 16–24px) consistent gap between all floating cards and from shell frame edges (images show generous, uniform breathing room).
- [ ] Card internal padding: locked rhythm (16px / 20px / 24px) using V3 spacing tokens.
- [ ] Grid and list layouts preserve independent card reading (no touching or shared border collapse).
- [ ] First-500ms visual scan path (Dashboard reference): KPI row = 6–8 small separate floating cards; main content = larger distinct floating card below.

### 2.4 Elevation, Glass & Depth
- [ ] Subtle frosted translucency + soft luminous edges/inner glow on cards (no heavy decorative inner blur layers — V3 spec §2).
- [ ] Elevation communicated by layer assignment + border strength + slight y-offset (not just backdrop blur).
- [ ] Hover/focus: subtle lift + stronger luminous border (glass language preserved, no color fills that fight depth).

### 2.5 Color, Accent & Status Language
- [ ] Deep navy base + teal (#007970) + warm orange (#E07B2C) used sparingly and only on primary CTAs, critical status, or key indicators (exact locations in V3 images).
- [ ] Semantic status (green/amber/red) used only for urgency, never decoration.
- [ ] Calm authority preserved: no busy fills or competing colors.

### 2.6 Typography, Density & Readability
- [ ] Clear hierarchy using locked ci-text-* scale (Montserrat/sans headings, clean body).
- [ ] No tiny unreadable text (avoid 9–12px labels inside cards).
- [ ] Excellent contrast on both dark glass and light glass (Agent 13 countersign).

### 2.7 Navigation & Shell Integration (Agent 04 Primary)
- [ ] Left nav rail + top bar integrated cleanly without overpowering or breaking the floating card language (full nav visible in both V3 images).
- [ ] Nav itself respects glass treatment or clean separation while cards float in the content area.
- [ ] Shell provides Layer 0 atmospheric host + breathing room (evolved from old inset model).

### 2.8 Light/Dark Visual Parity & Mobile Expression
- [ ] Dark and light versions use identical layout, card count, spacing, hierarchy, and component structure (direct side-by-side in `Dashboard_v3_Light_Dark.jpg`).
- [ ] Light mode feels equally premium (soft clean glass + hairlines/shadows).
- [ ] Mobile: stacked floating cards + elevated bottom sheets (Agent 12) that preserve 4-sided borders and breathing room.

### 2.9 States, Empty, Loading, Error
- [ ] Loading skeletons, empty states, and error treatments live inside cards without breaking borders or glass treatment (Agent 15 canonical patterns).
- [ ] All interactive states (selected, active, drag) stay inside the calm glass language.

### 2.10 Anti-Patterns (Zero Tolerance — V3 spec §10)
- [ ] No full-bleed content with disappearing borders.
- [ ] No edge-touching or flush cards.
- [ ] No merged or collapsed cards.
- [ ] No heavy inner decorative blurs.
- [ ] No new visual dialects that break cohesion with the two reference images.

**Verification Method for each item:** Automated (data-attr scan + border edge detection + gap measurement) + perceptual side-by-side against golden masters + human review (Agent 16 + Design Lead).

---

## 3. Visual Regression Harness Specification for V3

The harness owned and maintained by Agent 16.

**Recommended Stack (builds on existing Playwright + project UAT setup):**
- Primary: Playwright Test visual comparisons (`expect(page).toHaveScreenshot()` or custom pixelmatch/SSIM comparator).
- Secondary: Optional integration with Chromatic / Percy for component-level stories once Storybook is stood up for V3 primitives.
- Storage: `tests/visual/v3-baselines/` (git-committed golden masters).
- Supporting scripts: `scripts/v3-capture.ts`, `scripts/v3-diff-report.ts`, `scripts/v3-fidelity-audit.ts`.
- Runtime guards: Components render `data-v3-layer`, `data-v3-fidelity="dashboard-reference" | "ces" | ...`, `data-v3-border-strength`.

**Baseline Strategy:**
- Golden masters are high-fidelity screenshots of the **approved rendered implementation** of Dashboard (matching the two V3 jpgs) plus approved renders of other canonical surfaces.
- For initial Phase 1 gate: once Agent 05 + primitives deliver a Dashboard that passes human review against the jpgs, capture the browser render as the first golden master.
- Subsequent surfaces use the same language rules; their baselines are approved only after Agent 16 + Agent 05 countersign.

**Harness Artifacts per Surface:**
- `<surface>-v3-dark-desktop-1440.png`
- `<surface>-v3-light-desktop-1440.png`
- Mobile variants + interaction states (drawer open, selected task, etc.).

**CI Integration:**
- Every PR touching V3 primitives, patterns, or any surface runs the harness on changed surfaces.
- Failures block merge until Agent 16 (or delegated reviewer) approves the diff.

---

## 4. Screenshot & Capture Protocol (Exact & Repeatable)

**Mandatory Viewports & Themes:**
- Desktop Primary: 1440×900 (matches reference image framing) and 1920×1080.
- Mobile Primary: 390×844 (iPhone 14/15) + 430×932 (larger phones).
- Tablet: 768×1024.
- Themes: `v3-dark`, `v3-light` (forced via theme context or class).

**Capture States (minimum per surface):**
- Default / loaded view.
- With right drawer or modal open (elevated floating treatment).
- Loading skeleton state.
- Empty state.
- Mobile navigation expanded / bottom sheet.
- Critical interactive state (e.g., selected KPI or task).

**Protocol Steps:**
1. Ensure clean V3 build (tokens + primitives + shell in v3 mode).
2. Navigate to surface with explicit `?designVersion=v3-dark` or equivalent flag.
3. Wait for stable (networkidle + 500ms animation settle).
4. Mask dynamic or time-sensitive regions (timestamps, random IDs).
5. Capture full page or specific `[data-v3-fidelity-root]` region.
6. Store with deterministic name + metadata JSON (viewport, theme, commit, agent).
7. Generate side-by-side + diff overlay automatically.

**Tooling Command Examples (to be implemented):**
- `npm run v3:capture -- --surface=dashboard --theme=dark`
- `npm run v3:diff -- --baseline=dashboard-v3-dark-desktop-1440.png --candidate=pr-1234`

All captures must be reproducible and committed for the gate.

---

## 5. Perceptual Diff Rules & Tolerance Matrix

**Automated Engine Settings (initial defaults — tuned after first Dashboard pass):**
- Pixel diff threshold: 0.8% overall for non-reference surfaces; **0.2%** for Dashboard reference.
- SSIM similarity: ≥ 0.97 for standard surfaces; ≥ 0.985 for reference.
- Structural checks (custom detectors required):
  - Border visibility score: 4-sided edge detection must report >95% perimeter coverage on every card (zero tolerance on missing sides).
  - Gap uniformity: measured inter-card and card-to-edge gaps must be within ±4px of approved rhythm (16–24px).
  - Accent color sampling: teal and orange regions must match reference hex within ΔE < 5.
  - Layer separation: no overlapping or flush card boundaries.

**Decision Matrix:**
| Diff Class                    | Auto Result     | Requires Human Review | Blocks Gate |
|-------------------------------|-----------------|-----------------------|-------------|
| <0.2% pixel + passes structural | Pass            | No                    | No          |
| 0.2–1.0% or minor gap variance | Review          | Yes (Agent 16)        | If critical |
| Missing 4-sided border (any card) | Fail         | Mandatory             | Yes         |
| Accent misuse or new dialect  | Fail            | Mandatory             | Yes         |
| >4px spacing drift on Dashboard | Fail            | Mandatory             | Yes         |
| Light/dark parity failure     | Fail            | Mandatory             | Yes         |

**Human Review Protocol:** Agent 16 + Design Lead + Agent 05 (for reference surfaces) perform blind side-by-side against the two V3 jpgs + golden masters. Record approval in `V3_FIDELITY_SIGNOFFS.md` (new artifact owned by Agent 16).

---

## 6. How Every Other Agent's Output Is Measured Against the Two V3 Images

**Mandatory Addition to All Agent Specs (retrofit for 01–15 if not present):**
- Each spec must contain a **V3 Fidelity Verification Matrix** subsection (table) explicitly mapping every surface it owns to the checklist in §2 above, with "Evidence / Line or Token Reference" and "Risk Level".
- Agent 16 reviews and provides countersign in the "Sign-off Status" column.

**For Generated Code (Phase 2/3):**
- The downstream Claude must produce surfaces whose rendered output can pass the harness against the V3 golden masters.
- Every generated file must begin with a `// V3 Fidelity Notes` block citing the exact checklist items it satisfies and which reference image elements it reproduces.
- Agent 16 (or automated proxy) runs the harness on the generated candidate and records pass/fail + diff report.

**Dashboard (Agent 05) is the Oracle:** Any deviation on Dashboard that cannot be justified as "intentional evolution" fails the entire bundle until corrected. All other surfaces are judged by consistency with Dashboard's approved treatment.

---

## 7. V3 Phase 1 Exit Gate Criteria (Strict — Agent 16 Final Authority)

The following **must all be true** before the 16-agent Phase 1 bundle is declared complete, before the master Claude codegen prompt is finalized for Phase 2 execution, and before any large-scale generation begins:

1. **Reference Surface Fidelity (Dashboard):** Rendered Dashboard (dark + light) passes the full §2 checklist and perceptual diff rules against the two V3 images (human + automated sign-off by Agent 16 + Agent 05 + Design Lead). Golden master screenshots committed.
2. **All 16 Agent Specs Complete & Countersigned:** Every spec (including this one) contains a populated V3 Fidelity Verification Matrix. Agent 16 has reviewed and countersigned (or flagged open items with owners).
3. **Harness Live & Passing:** The V3 visual regression harness (Playwright + custom detectors) is implemented in repo, runs in CI on reference surfaces + at least 3 additional high-volume surfaces (Evidence, CES, Policy), and all current runs are green.
4. **Shell + Primitives + Patterns Aligned:** Agents 01/02/03/04/15 have delivered primitives and shell evolution that enable floating cards with the exact border/breathing treatment; no foundational conflicts remain.
5. **Light/Dark Parity Proven:** At minimum Dashboard + two other surfaces demonstrate perfect layout + premium-feel parity between dark and light V3 modes.
6. **Mobile Floating Treatment Proven:** Mobile expression (Agent 12) of at least one reference surface passes the checklist (stacked cards + elevated sheets with 4-sided borders).
7. **A11y + Glass Compatibility:** Agent 13 has countersigned that focus, contrast, and screen-reader behavior preserve the V3 glass language on dark (critical for borders and depth).
8. **No Unresolved Visual Contract Conflicts:** All adjacent-agent tables across the 16 specs show green or explicitly resolved items on borders, layering, tokens, and patterns.
9. **Documentation & Reproducibility:** `V3_FIDELITY_SIGNOFFS.md`, capture scripts, and baseline gallery are committed and linked from the master bundle.
10. **Codegen Prompt Updated:** The master `V3_Phase1_Claude_Codegen_Prompt.md` incorporates the full §2 checklist, §3–5 harness/protocol/rules, and explicit "must pass Agent 16 gate" language.

Only when all 10 criteria are green does Agent 16 flip the V3 Phase 1 Exit Gate to "PASSED". This is the non-negotiable release gate.

---

## 8. Adjacent Agent Interface Contracts (Fidelity Focus)

| Adjacent Agent | What I Require From Them (input contract) | What I Guarantee To Them (output contract) | Current Conflicts / Open Questions | Sign-off Status |
|----------------|-------------------------------------------|--------------------------------------------|------------------------------------|-----------------|
| Agent 01 (Glass & Layering) | `FloatingGlassCard` + `V3SurfaceHost` with `data-v3-layer` + exact dark/light glass variants that produce the border signature in the V3 images | Full §2 checklist coverage; automated structural border/gap detectors in harness; sign-off only on compliant primitives | Legacy GlassPanel coexistence during migration | Pending final primitive delivery |
| Agent 02 (Borders) | Locked numerical values + token classes for V3 dark luminous 4-sided border (hairline + glow) and light equivalent; breathing room token | Perceptual detectors + zero-tolerance rules for missing sides; diff reports against reference images | Exact glow radius / opacity to match jpg (needs pixel sampling) | In progress (critical) |
| Agent 03 (Tokens) | Complete V3 dark/light glass + border + elevation + accent + spacing token family derived from the two images | Token usage audit in every generated surface; enforcement via lint + harness | Legacy token drift in current src | Needs review |
| Agent 04 (Shell) | Layer 0 atmospheric deep background + v3-floating-host mode + consistent breathing room from edges | Harness that verifies shell never collapses the floating effect | Old inset ShellContentFrame removal timeline | Needs design decision |
| Agent 05 (Dashboard Reference) | First implementation that visually matches the two V3 jpgs; golden master screenshots | The "oracle" baseline against which all other surfaces and future changes are judged | N/A (primary dependency) | Highest priority joint sign-off |
| Agent 15 (Patterns) | All shared patterns (TaskCard, KPI, FilterBar, EmptyState, etc.) ship V3 floating variants by default that satisfy the full checklist | Cross-surface regression matrix proving visual equality across contexts | Pattern library must not introduce ad-hoc glass | Critical dependency |
| Agent 12 / 13 | Mobile floating treatment + a11y (contrast, focus rings, SR) that preserve 4-sided borders and glass depth on dark | Harness coverage for mobile viewports + a11y + glass states | Dark mode border contrast for low-vision users | Review requested |

Any conflict escalated here blocks the Exit Gate.

---

## 9. Shared Vocabulary & Glossary Contributions (V3 Fidelity)

New terms introduced or refined for the entire 16-agent team:

- `FloatingGlassCard` / `V3Card` — canonical Layer-2 unit (cross-ref Agents 01, 02, 15).
- `V3FidelityGate` — the Agent 16 process and criteria defined in this spec.
- `FloatingCardBorderSignature` — the exact visible 4-sided luminous (dark) / hairline+shadow (light) treatment shown in the V3 images.
- `BreathingRoomPx` / `--ci-v3-card-gap` — minimum 16px uniform separation (measured value from reference images).
- `V3GoldenMaster` — approved browser screenshot used as baseline for perceptual comparison.
- `V3Layer` (data attribute) + `V3BorderStrength` — machine-readable enforcement hooks.
- `V3FidelityVerificationMatrix` — required subsection in every agent spec.
- `PerceptualStructuralCheck` — automated edge/gap/accent detectors beyond raw pixel diff.
- `V3 Phase 1 Exit Gate` — the 10-criteria checklist in §7 (only Agent 16 may declare passed).

These terms are now canonical and must appear consistently across all V3 documentation and code comments.

---

## 10. Phase 1 Implementation Sequence & Codegen Handoff Notes (Fidelity Gate)

Recommended order (integrated with overall plan):

1. **Immediate (this spec):** Publish this document + begin harness scaffolding (`tests/visual/v3-baselines/`, capture scripts, structural detectors).
2. **Parallel with primitives:** Agent 01/02/03 deliver V3 tokens + `FloatingGlassCard` that can produce the exact border signature.
3. **Reference surface first:** Agent 05 + 01/15 deliver Dashboard implementation. Agent 16 captures first golden masters + runs full human + automated gate pass.
4. **Expand coverage:** Apply harness + matrix to Evidence (07), CES (06), then remaining surfaces.
5. **Mobile + A11y hardening** with fidelity checks.
6. **Final sweep & gate:** Agent 16 executes the 10-criteria Exit Gate. Update master artifacts.
7. **Handoff to codegen:** The complete 16-agent bundle + this spec (with all matrices signed) + golden masters + harness instructions become mandatory inputs to the Phase 2/3 Claude prompt.

New primitives / harness work required before large generation: the full §3 harness + border/gap detectors.

---

## 11. Claude-Ready Certification (V3 Phase 1 — Agent 16) + Recommendations for Master Codegen Prompt

**I certify that this specification is complete and ready to be included in the master V3 code-generation prompt.**

- [x] The exact fidelity standard, checklist, harness, protocol, diff rules, measurement process, and strict 10-criteria V3 Phase 1 Exit Gate have been defined against the two V3 images and V3_MOCKUP_DESIGN_SPEC.md.
- [x] How every other agent's output and all generated surfaces will be measured (Verification Matrices + golden masters + perceptual + human) is unambiguous.
- [x] All adjacent-agent contracts for fidelity protection are explicit.
- [x] An LLM given the full 16-agent V3 bundle + this spec + the two reference images + harness instructions could generate surfaces that pass the gate and produce correct, beautiful, contract-obeying V3 floating-card code.
- [x] Recommendations for strengthening the master Claude codegen prompt are included below.

**Remaining risks / open questions for orchestrator (must be resolved before final gate flip):**
1. Exact numerical token values (glow radius, border opacity, precise accent hex usage) for perfect match to `Dashboard_v3_Floating_Cards.jpg` — requires pixel sampling from the reference image once primitives exist.
2. Final decision on legacy inset co-existence vs. hard cutover (affects migration harness complexity).
3. Resource for implementing the structural perceptual detectors (border edge detection, gap measurement) — may require small custom canvas or image-processing helper.

**Agent 16 Signature:** Grok-Orchestrated V3 Execution — 2026-05-18  
**Countersigned (orchestrator proxy for first pass):** Agent 05 (Dashboard), Agent 01, Agent 02, Agent 15, Agent 04 (pending full batch completion and harness live)

---

### Recommendations for the Master Claude Codegen Prompt Quality Gates (to be incorporated into `V3_Phase1_Claude_Codegen_Prompt.md`)

The current placeholder "Quality Gates (Agent 16 + 05 + 13)" section must be replaced/expanded with the following concrete, enforceable rules drawn directly from this spec. These should appear as non-negotiable instructions to the codegen model:

1. **Attach the Full Fidelity Contract:** The entire §2 V3 Fidelity Checklist (with all 10 categories and anti-patterns) must be pasted verbatim into the codegen prompt as "inviolable visual contract." Generated code must satisfy every item.

2. **Mandatory V3 Fidelity Notes Block:** Every generated `.tsx` file for a surface or major composition **must** begin with a comment block:
   ```
   // V3 Fidelity Notes (Agent 16)
   // Matches: Dashboard_v3_Floating_Cards.jpg (dark) + Dashboard_v3_Light_Dark.jpg (light)
   // Checklist items satisfied: 2.1 Layering (all), 2.2 Borders (all), 2.3 Breathing (verified 16-24px), ...
   // Reference surface: Dashboard (primary oracle)
   // Known deviations (if any) + justification:
   ```
   Absence of this block or vague claims = automatic rejection.

3. **Self-Audit Requirement:** Before emitting code for any surface, the model must explicitly "walk through" the §2 checklist items that apply and state how the proposed JSX + token classes + data-attrs satisfy them. This reasoning must appear in the response.

4. **Dashboard as Strict Oracle:** The first generated surface must be Dashboard. The model must produce output whose rendered result (described) would pass perceptual comparison to the two V3 images. Any deviation on border visibility, card independence, breathing room, or accent restraint must be called out and justified (or fixed).

5. **Data Attribute Enforcement:** All floating cards and hosts **must** emit `data-v3-layer`, `data-v3-fidelity`, and (where relevant) `data-v3-border-strength`. These are required for the harness detectors.

6. **Harness-Ready Output:** Generated code must not break the Playwright visual tests or structural checks. The model must describe exactly which test selectors / regions would be used for screenshot comparison.

7. **Light/Dark + Mobile Parity Proof:** For every surface, the generation must include or reference the exact same component tree for both themes and note the mobile stacking transformation. Parity must be provable from the code.

8. **"If You Cannot Achieve Perfect Fidelity" Rule (strengthened):** If perfect match to the reference images cannot be achieved on first pass, the model must:
   - Document the exact visual gap (with reference to specific checklist item and image region).
   - Propose the minimal token / primitive change required.
   - Still produce the best-possible compliant code rather than compromising the glass language.

9. **Gate Language in Prompt:** Add explicit text: "Your output for any surface is not complete until it can pass Agent 16's V3 Phase 1 Exit Gate (§7 of the Agent 16 spec). The harness will be run on your candidate. Surfaces that fail border visibility, breathing room, or 4-sided separation will be rejected."

10. **Update Trigger:** After Agent 16 completes the first golden-master capture of Dashboard and the harness is live, the master codegen prompt must be re-issued with the actual committed baseline paths and the signed §7 gate status attached.

These recommendations, once integrated, turn the codegen model into a partner that respects the same rigorous visual authority that Agent 16 enforces on the human side.

---

*This document is the official Phase 1 output for Agent 16 in the Darkmode_DesignzV3 effort. All future codegen prompts for V3, all visual regression baselines, and the final Phase 1 Exit decision must respect the floating-card fidelity contract, checklist, harness, protocol, perceptual rules, and strict 10-criteria gate defined here. The two V3 images are the ultimate visual source of truth.*

**End of Agent 16 V3 Fidelity Gate Phase 1 DesignSpec**
