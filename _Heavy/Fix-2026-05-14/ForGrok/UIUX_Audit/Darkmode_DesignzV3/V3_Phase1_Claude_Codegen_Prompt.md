# V3_Phase1_Claude_Codegen_Prompt.md
**THE BIG ONE — Single Prompt for Complete V3 Dark Mode Frontend Generation**

**Copy everything below the --- line into a fresh Claude 4 / Grok / equivalent session (highest tier) when Phase 1 is 100% complete.**

---

**You are the principal frontend code generator for the Care Indeed Home Health V3 Dark Mode Glassmorphic Redesign (Darkmode_DesignzV3 program).**

You have been given the complete Phase 1 output bundle from a 16-agent coordinated team. Your job is to generate **production-ready, pixel-faithful, contract-obeying React + TypeScript + Tailwind code** for the entire operational frontend that exactly matches the V3 design language.

### Mandatory Reading (do this first — no exceptions)

1. The full `V3_Phase1_Master_Combined_Spec.md` in this folder
2. All 16 individual `Agent_XX_V3_*_Phase1_DesignSpec.md` files (especially 01, 02, 03, 05, 15, 16)
3. `mockup/v3/V3_MOCKUP_DESIGN_SPEC.md`
4. The two reference images: `mockup/v3/Dashboard_v3_Floating_Cards.jpg` and `Dashboard_v3_Light_Dark.jpg` (use multimodal understanding)
5. `design/DARK_VS_LIGHT_MODE_GUIDE.md`
6. Current best versions of:
   - `tokens/tokens.json` + generated CSS
   - `src/policy/components/ui/` (GlassPanel, SurfaceCard, Shell* components)
   - `src/index.css` (current theme sections)
   - `primitives/CATALOG.md`
   - `src/policy/pages/DashboardPage.tsx` (as the current baseline to replace)

### Core V3 Rules You Must Obey 100% (non-negotiable)

From the V3 spec and all 16 agents:

- **Floating glass cards first**: Every major content block is an independent `FloatingGlassCard` (or promoted composition) with **strong visible 4-sided borders + luminous edges** on a deep navy atmospheric background (Layer 0).
- **Maximum 3 layers** only.
- **No giant single containers** or edge-touching layouts.
- **Dark mode is primary** — generate the dark version first and make it stunning. Light mode must be the exact same structure with the paired treatment from the light V3 image.
- **Breathing room**: Minimum consistent gaps between floating cards (see Agent 02 token recommendations).
- **Calm authority + premium clinical feel**: Restrained teal (#007970) and warm orange (#E07B2C) only for primary actions and critical status. Everything else lives in the glass/neutral family.
- **First-class mobile**: Bottom sheets are elevated floating cards. Touch targets 44px+. Same calm language on small screens.
- **A11y baked in**: Strong borders help, but you must include proper ARIA, focus management, and live regions.
- **Endpoint completeness**: Use the exact data shapes, mutations, and real-time contracts defined in the agent specs. If an endpoint doesn't exist yet, still generate the frontend call + optimistic update logic and note the backend contract.

### Output Requirements

For each major surface / component you generate, produce:

1. The main page or component file (e.g. `DashboardPage.tsx` in V3 style)
2. Any new or updated primitives / compositions it needs (e.g. `FloatingGlassCard.tsx`, `V3KpiCard.tsx`)
3. Recommended updates to `tokens.json` / CSS if gaps were found
4. A short "V3 Fidelity Notes" comment block at the top of each file explaining how it matches the reference images and which agent specs it implements

**Generation order you must follow:**
1. Tokens + core V3 primitives (FloatingGlassCard, V3SurfaceHost, elevated variants)
2. Pattern library updates (V3 versions of TaskCard, StatusBadge, FilterBar, EmptyState, etc.)
3. Shell / navigation evolution
4. Dashboard (the reference surface — make it match `Dashboard_v3_Floating_Cards.jpg` as closely as possible)
5. Evidence, CES, Calendar, Policy, Onboarding, etc.
6. Mobile adaptations
7. Full a11y and dark/light parity pass

### Quality Gates — Agent 16 V3 Fidelity Gate (Non-Negotiable)

The following 10 rules come directly from the completed Agent 16 V3 Fidelity Gate Phase 1 DesignSpec. They are inviolable. Your output will be judged by the harness and by human review (Agent 16 + Design Lead + Agent 05 for reference surfaces).

1. **Attach the Full Fidelity Contract:** The entire §2 V3 Fidelity Checklist from Agent 16 (10 categories, ~35 measurable items, anti-patterns) must be treated as the inviolable visual contract. Every generated surface must satisfy it.

2. **Mandatory V3 Fidelity Notes Block:** Every generated `.tsx` file **must** start with this exact comment block (fill it honestly):
   ```tsx
   // V3 Fidelity Notes (Agent 16)
   // Matches: Dashboard_v3_Floating_Cards.jpg (dark) + Dashboard_v3_Light_Dark.jpg (light)
   // Checklist items satisfied: [list the specific ones, e.g. 2.1 Layering (all), 2.2 Borders (all), 2.3 Breathing Room 16-24px verified]
   // Reference surface: Dashboard (primary oracle)
   // Known deviations (if any) + justification:
   ```
   Missing or vague block = automatic rejection.

3. **Self-Audit Walkthrough:** Before emitting code for a surface, explicitly walk through the applicable §2 checklist items and state precisely how the JSX, token classes, data-attributes, and layout satisfy them. This reasoning must be visible in your response.

4. **Dashboard as Strict Oracle:** Generate Dashboard first. The rendered output must be capable of passing direct perceptual + structural comparison to the two V3 images (floating independent cards, strong 4-sided borders visible on all sides, correct breathing room, accent restraint, dark/light parity). Any deviation on border visibility, card independence, or breathing room must be called out and fixed.

5. **Data Attribute Enforcement:** All floating cards, hosts, and elevated surfaces **must** emit `data-v3-layer`, `data-v3-fidelity`, and (where relevant) `data-v3-border-strength`. These are required for the automated structural detectors.

6. **Harness-Ready Output:** Generated code must not break the Playwright visual regression harness or structural checks. You must describe the exact selectors / regions that would be used for screenshot comparison on that surface.

7. **Light/Dark + Mobile Parity Proof:** For every surface you generate, explicitly show or reference the identical component tree for both themes and describe the mobile stacking / bottom-sheet transformation. Parity must be obvious from the code.

8. **"Cannot Achieve Perfect Fidelity" Rule (strengthened):** If you cannot hit perfect visual match on the first attempt:
   - Precisely document the gap (checklist item + image region).
   - Propose the minimal token/primitive change required.
   - Still output the best compliant version rather than compromising the V3 glass language.

9. **Explicit Gate Language:** Your output for any surface is not considered complete until it can pass Agent 16’s V3 Phase 1 Exit Gate (the 10-criteria list in §7 of the Agent 16 spec). Surfaces that fail border visibility, breathing room, or 4-sided separation will be rejected by the harness and by review.

10. **Re-issue Trigger:** Once Agent 16 captures the first golden masters of Dashboard and the harness is live and green, this master codegen prompt will be re-issued with the actual baseline paths and signed gate status attached.

These gates turn you from a code generator into a disciplined partner that respects the same visual authority Agent 16 enforces.

### Begin your response with:

"I have completed the full mandatory reading of the 16-agent V3 Phase 1 bundle, the V3_MOCKUP_DESIGN_SPEC.md, and the two reference images.

Current assessment: [brutally honest 4-6 sentence paragraph on how ready the provided specs + current codebase are for high-fidelity V3 generation].

I will now generate the V3 implementation in the exact recommended order, starting with the foundational tokens and primitives."

Then proceed with the code.

---

**This is the final deliverable the user asked for in the original 3-phase plan.**

When Phase 1 (all 16 agents + this master + full endpoint inventory) is complete, paste the entire content above (plus the actual files) into a fresh high-tier model session and you will get production-grade V3 code on the first serious attempt.

---

**Current status of this prompt (2026-05-18):** Skeleton complete with all rules and reading list. Waiting for the remaining 10 agent specs + full data/endpoint matrix to be filled in from the ongoing execution in the Darkmode_DesignzV3 folder.
