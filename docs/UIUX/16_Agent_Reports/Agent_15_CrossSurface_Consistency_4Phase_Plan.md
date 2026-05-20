# Agent 15: Cross-Surface Consistency 4-Phase Unification Plan

**Subagent:** 15 — Cross-Surface Consistency & Visual Language Unification Specialist  
**Purpose:** Deliver a rigorous, executable 4-phase program that enforces a single visual philosophy ("calm authority, task-first, glassmorphism-magnified") across all 16+ operational surfaces so that every surface is recognizably a member of the same family defined by the Top Picks mockups (`Top-Picks/11_OnboardingActivation_Desktop_v2.jpg`, `12_EvidenceCapture_Desktop_v2.jpg`, `01_Dashboard_Mobile_v2.jpg`, `02_CES_Board_Mobile_v2.jpg`, etc.).  
**Governing Documents:** CANONICAL_UI_SYSTEM_SPEC.md (esp. §2 System over styling, §3–4 Layer Model + Constrained Page View Contract, §10 Primitives, §11 Acceptance Criteria) + DRIFT_REGISTER.md + Top Picks visual contract.  
**Core Mechanism:** The **Visual Language Police** — a permanent, gated review + tooling + gallery process that treats visual family membership as a first-class, non-negotiable deliverable.

---

## Phase 0 Context (Current Reality — From Agent 15 Audit)

- Partial reconstruction has produced **glass islands** and at least 6 visual dialects (CI-ION Glass, CES Navy Canvas, Onboarding V2 Light Rail, Legacy Wave Glass-Lib, eCign Paper, Cinematic Journey).
- Only Dashboard reliably honors ShellContentFrame + canonical primitives + 4-sided constraint.
- Library, Evidence, CES, Onboarding V2, and most others contain unauthorized local inventions (glass-*-lib classes, CesCard/CesLayout, OnboardingV2Layout sub-rail, raw hex, duplicate nav chrome).
- Urgency colors, card treatments, spacing rhythm, glass elevation, and nav behavior are inconsistent.
- DRIFT_REGISTER items D01–D08, D10–D14, D18–D22 remain open and directly block family coherence.
- **Risk**: Further surface work without unification will multiply dialects.

This 4-phase plan corrects the trajectory with explicit cross-surface checkpoints and an institutionalized Visual Language Police.

---

## The Visual Language Police (Permanent Governance Layer)

The Police is **not** a one-time review. It is an ongoing process embedded in every phase and in the development lifecycle.

### Police Components
1. **Screenshot Gallery Mandate** (Top Picks as Ground Truth)
   - Canonical reference set: All Top Picks desktop + mobile JPGs (especially 01, 02, 11, 12).
   - For every surface: Capture "before" (current) + "after" (target) at 375px, 768px, 1024px, 1440px, 1600px (Playwright or manual).
   - Galleries stored in `docs/UIUX/visual-language-galleries/{surface-name}/` with side-by-side comparisons and delta annotations.
   - **Gate**: No surface may advance past a phase checkpoint without a Police-approved gallery showing ≤10% perceptual delta from the nearest Top Picks reference (or explicit governed exception).

2. **Automated Linting & Static Enforcement**
   - ESLint / custom rule: No raw hex, `text-[0-9]+px`, `p-[0-9]+`, `border-[#` anywhere under `src/policy/` except inside `ui/` primitives or explicitly grandfathered files listed in DRIFT_REGISTER.
   - Import guard: Only `from '@/policy/components/ui'` for GlassPanel, SurfaceCard, ShellContentFrame, ActionButton, CiStatusBadge, EmptyState, LoadingState, etc. Ban direct imports of ces/theme or local glass classes on non-CES surfaces.
   - Token usage scan: All color/spacing/typography must resolve through `--ci-*`, `--ci-color-glass-*`, or approved semantic urgency tokens.
   - CI job: `visual-language-lint` fails PRs that touch UI surfaces without passing the above.

3. **Mandatory Cross-Surface Design + Engineering Reviews**
   - Bi-weekly "Visual Language Police Stand-up" (30 min): Review 2–3 surfaces against current gallery baseline. Attendees: Design Lead, Eng Lead (Primitives owner), Surface owner, Subagent 15 (or successor).
   - PR template checkbox (enforced): "This change has been reviewed against the Visual Language Police checklist and Top Picks gallery for the affected surface(s). Screenshots attached."
   - Exception process: Any sub-brand or layout exception (CES, Onboarding V2) requires written Police approval + documented boundary rules (e.g., "CES remains opaque canvas but must adopt canonical urgency tokens and 4-sided outer margin").

4. **Visual Regression Baseline + Playwright Integration**
   - Playwright config extended with "visual-language" project.
   - Baseline screenshots regenerated only on Police approval after a unification milestone.
   - Every CI run diffs key surfaces (Dashboard, Library, Evidence, CES Board, Onboarding V2 Activate, Calendar, Forms) against the approved family baseline.
   - Failures block merge; human Police review required for any intentional delta.

5. **Living Artifacts Owned by Police**
   - `docs/UIUX/visual-language-galleries/` (source of truth images + annotations)
   - `VISUAL_LANGUAGE_POLICE_CHECKLIST.md` (derived from this plan + Spec §11)
   - Updated DRIFT_REGISTER entries with "Police Review Date" and "Gallery Link"
   - Quarterly "State of the Visual Family" report (fed into 16-point alignment reviews)

**Police Authority**: Surface owners cannot self-certify. Police sign-off is required for Phase checkpoints and for any production release touching UI surfaces.

---

## Phase 1: Forensic Baseline & Exception Decisions (Duration: 1–2 weeks)

**Goal**: Establish irrefutable current-state evidence and lock the two highest-risk dialect decisions (CES and Onboarding/Journey).

### Activities
- Run full 8-surface (expandable to 16+) screenshot capture against Top Picks references using current Playwright setup + manual desktop/mobile.
- Produce "Visual Dialect Map" (update/extend this analysis) with annotated callouts on every violation (card family, color, glass layer, spacing, nav chrome).
- Tag every open DRIFT_REGISTER item with owning surface(s) and Police priority.
- **Critical Decision Gates** (must be recorded in CANONICAL_UI_SYSTEM_SPEC.md updates + DRIFT_REGISTER):
  - CES: Re-affirm or reverse "sub-brand exception." If exception retained: define strict visual boundary rules (e.g., CES must still respect outer ShellContentFrame 4-sided inset and adopt canonical urgency tokens; no new Ces* primitives allowed).
  - Onboarding: Declare V2 the long-term canonical (per Spec §17) and define migration/deprecation path for Journey cinematic elements. Decide whether V2Layout becomes a governed "light professional" variant that still uses ShellContentFrame + shared primitives or is fully absorbed.
- Stand up initial Visual Language Police (charter, first gallery repo, lint rules skeleton).
- Produce Phase 1 exit gallery package (side-by-side for all 7+ surfaces).

### Explicit Cross-Surface Unification Checkpoint (End of Phase 1)
- [ ] 8-surface screenshot gallery published and Police-approved (≤ current delta recorded; no claims of "improvement" without images).
- [ ] CES and Onboarding/Journey policy decisions written into CANONICAL_UI_SYSTEM_SPEC.md with migration timelines.
- [ ] All high-priority drift items (D03, D07, D06, D13, D01) assigned surface owners + target sub-phase.
- [ ] Visual Language Police checklist v1 published and added to PR template.
- [ ] Lint rule prototype running locally on 3 surfaces (Dashboard + Library + one CES page) with zero false positives.

**Exit Criteria**: Police certifies that baseline evidence is complete and the two largest dialect forks have formal decisions. No surface reconstruction work may begin on additional surfaces until this checkpoint passes.

---

## Phase 2: Core Primitive & Shell Enforcement (Duration: 3–4 weeks)

**Goal**: Force every non-exception surface onto the canonical Layer 1 glass + primitives. Eliminate the most visible local inventions (glass-*-lib, custom rails, raw values).

### Activities
- **Universal ShellContentFrame Mandate**: Update every page route (Library, EvidenceCenter, Forms, Calendar, PolicyDetail, Audit, etc.) to wrap primary content in `<ShellContentFrame>` (respecting the 4-sided inset contract). Remove any page-level full-bleed or competing background.
- **Card Unification**: Replace all `.glass-interactive-lib`, `.glass-panel-lib`, custom div cards, and non-CesCard surfaces with `SurfaceCard` (Layer 2) or `GlassPanel` where elevation is required. Deprecate the "lib" classes.
- **Library + Evidence + Forms + Calendar Hardening**: Full migration pass. Remove ci-premium-hero, ci-command-rail, raw hex borders, arbitrary text sizes.
- **Urgency Token Consolidation**: Define and implement single semantic urgency tokens (e.g. `--urgency-critical`, `--urgency-warning`, `--urgency-success`, `--urgency-info`) in the token pipeline. Map all surfaces (including CES where possible) to them. Remove hard-coded CES_* and #FFC107 usage on non-CES surfaces.
- **Nav Behavior Normalization**: For sub-layouts that remain (CES, Onboarding V2), enforce that they compose *inside* ShellContentFrame without duplicating topbar/rail chrome. Inner context bars must be visually subordinate (smaller type, hairline borders, same spacing rhythm).
- **Onboarding V2 & CES Boundary Work** (per Phase 1 decisions): If exception retained, apply minimal canonical compliance (outer frame, shared primitives for cards/buttons, unified urgency). If consolidation chosen, begin incremental migration of CesCard → SurfaceCard and Onboarding rail → canonical patterns.
- Expand lint rules to CI gate. Regenerate regression baselines only for surfaces that pass Police review.

### Explicit Cross-Surface Unification Checkpoint (End of Phase 2)
- [ ] All 8 audited surfaces (plus any new ones touched) render inside `ShellContentFrame` with visible 4-sided backdrop frame (verified in gallery).
- [ ] Zero instances of `glass-*-lib` or equivalent local glass classes on target surfaces (lint + manual scan).
- [ ] At least 5 surfaces (Dashboard, Library, Evidence, Calendar, Forms) use only `SurfaceCard`/`GlassPanel` + `ActionButton` + `CiStatusBadge` for primary UI.
- [ ] Single urgency token set live and adopted by all non-exception surfaces; CES/Onboarding V2 either migrated or explicitly scoped in tokens.
- [ ] Updated gallery shows clear convergence on Top Picks visual signature (glass depth, card elevation, spacing 16/24/32 rhythm, same status colors) for the 5 core surfaces.
- [ ] Police has performed at least 2 cross-surface reviews and signed off on the "family resemblance" delta for each.

**Exit Criteria**: The majority of high-traffic operational surfaces are visually and structurally members of the same glass family. Exceptions are bounded and documented. Further work on remaining surfaces (staffing, journey modules, admin, etc.) may now proceed safely.

---

## Phase 3: Cross-Surface Harmonization & Police Activation (Duration: 4–6 weeks)

**Goal**: Bring the remaining 16+ surfaces into the family, activate full Police enforcement, and achieve retina-level consistency across the entire product.

### Activities
- **Complete Surface Sweep**: Apply Phase 2 patterns to all remaining surfaces (Journey variants, Staffing, iAdministrator, Taxonomy/Framework, Governance, Master Control Inventory, PM overlays, Admin pages, Help, System Documentation, etc.). Every surface must pass the same 4-sided + primitives test.
- **Exception Hardening or Elimination**:
  - If CES exception lives: Police defines and enforces "CES Sub-Brand Boundary Spec" (e.g., must use canonical outer frame + urgency tokens; internal navy canvas permitted only within clearly demarcated CES nav section; no bleed into main Command Center glass).
  - If Onboarding V2 exception lives: Define it as the canonical "light professional activation" variant with shared primitives and consistent spacing/urgency; Journey cinematic elements deprecated or isolated.
- **Spacing & Rhythm Unification**: Publish and enforce single density profiles + spacing scale (via tokens). Audit and fix all remaining `text-[xxpx]`, arbitrary padding.
- **Nav & Chrome Unification**: Eliminate duplicate inner nav bars where possible. Where sub-context is required, it must be implemented as `ShellCommandGroup` or subordinate panels using the same tokens and elevation rules.
- **Full Gallery & Regression Coverage**: Expand Police gallery to all 16+ surfaces. Regenerate master visual regression baseline once per Police-approved unification wave.
- **eCign / Print Fidelity Convergence**: Align FormSigningWorkspace, FormPrintView, packet builders, and GVGB prints to the same header/footer + color rules (ties into Spec §15). These artifacts must visually belong to the family even in print.
- **Accessibility + Responsive Pass**: Every surface must simultaneously pass WCAG 2.2 AA and the Responsive Behavior Matrix while matching the glass language (mobile bottom sheets, 44px targets, constrained insets inside device bezel).
- **Bi-weekly Police Reviews** become mandatory gates. Any surface owner who ships without Police sign-off triggers rollback process.

### Explicit Cross-Surface Unification Checkpoint (End of Phase 3)
- [ ] Every one of the 16+ operational surfaces has a Police-approved screenshot gallery entry showing membership in the Top Picks visual family (glass depth, card treatment, urgency colors, spacing rhythm, nav subordination).
- [ ] Zero unauthorized local design inventions remain in production paths (verified by lint + Police manual audit). All exceptions are explicitly listed in CANONICAL_UI_SYSTEM_SPEC.md with boundary rules.
- [ ] Visual regression suite passes on all key surfaces against the approved family baseline.
- [ ] At least one full end-to-end user journey (e.g., Dashboard → Library → Evidence → CES Board → Onboarding V2 Activate → Calendar) has been captured as a "single-family" storyboard gallery.
- [ ] 16-point alignment review refresh shows average ≥ 9.3 with no perspective below 8.5 on "Visual Language Coherence" and "Cross-Surface Consistency" items.
- [ ] Police process is fully operational (lint in CI, PR gate active, bi-weekly reviews running, gallery maintained).

**Exit Criteria**: The product finally "hangs together." A clinician or administrator can no longer tell (visually) which surface they are on — only by the task content. All surfaces are recognizably the same family defined by the Top Picks mocks.

---

## Phase 4: Continuous Guard & Family Certification (Ongoing — Post-Program)

**Goal**: Prevent regression and institutionalize the single visual philosophy as the permanent state of the platform.

### Activities
- **PR & Release Gates**: Every UI-touching PR requires:
  - Screenshot diff of affected surface(s) vs current Police baseline.
  - Explicit "Visual Language Police" approval checkbox (human sign-off for non-trivial changes).
  - Lint + regression job green.
- **Quarterly State of the Visual Family Audit**: Full re-run of 8+ surface gallery + 16-point review. Publish public "Family Coherence Score."
- **Deprecation & Cleanup**: Remove all grandfathered code paths, backup files, and legacy classes. Update DRIFT_REGISTER to "Closed — Visual Unification."
- **Documentation & Onboarding**: 
  - "Visual Language Bible" (living doc) with exact usage of every primitive + do/don't examples tied to Top Picks.
  - New engineer / designer onboarding includes mandatory Police gallery walkthrough and "build a surface that matches the family" exercise.
- **Exception Review Cadence**: Any retained sub-brand (CES, etc.) must be re-justified annually by Police. Default is convergence.
- **Tooling Maturation**: Full token pipeline (`tokens.json` → CSS/TS) with visual-language linter rules generated from it. Figma-to-code parity contract.

### Explicit Cross-Surface Unification Checkpoint (End of Every Quarter + Major Release)
- [ ] All 16+ surfaces continue to pass current gallery + regression tests with no new dialects introduced.
- [ ] Zero open drift items related to visual language or primitives.
- [ ] Police has certified that the product remains a single visual family.
- [ ] "This surface is a certified member of the Top Picks family" status is tracked per surface in a living dashboard (PHASE1_READINESS_DASHBOARD.md successor).

**End-State Definition of Success**: By the conclusion of the program (end of Phase 4), opening any operational surface (Dashboard, Library, Evidence, CES Board, Onboarding V2, Calendar, Forms, Staffing, Journey, Admin, etc.) produces the immediate, unmistakable impression of **the same product** — calm authority, task-first hierarchy, the same glass elevation language with visible backdrop framing, the same urgency color semantics, the same spacing rhythm, and the same nav behavior philosophy — exactly as defined by the Top Picks mockups. No user or auditor should be able to detect a "visual dialect."

---

## Integration with Broader Program & Risk Mitigation

- This plan **must** be adopted before or in parallel with any remaining Phase 2 shell or Phase 3 surface reconstruction work. Unification is a prerequisite, not a follow-up.
- Ties directly to existing artifacts: updates CANONICAL_UI_SYSTEM_SPEC.md, feeds 16_POINT_VALIDATION_ROUND_* reviews, closes DRIFT_REGISTER items, satisfies Spec §11 acceptance criteria for every surface.
- **Risk**: If CES or Onboarding exceptions are retained without strict Police boundaries, the "single family" goal is definitionally impossible. Phase 1 decision gates are non-negotiable.
- **Success Metrics** (quantitative):
  - % of surfaces with approved gallery entry (target 100% by end Phase 3)
  - Number of raw hex / ad-hoc class violations (target 0 in policed paths)
  - Cross-surface perceptual delta score (via gallery review, target ≤10%)
  - Time for a new surface to reach family membership (target < 1 sprint once primitives are stable)

---

## Appendices (Living)

- **Top Picks Reference Map**: 01_Dashboard, 02_CES_Board, 11_OnboardingActivation, 12_EvidenceCapture, 13_PolicySearch + mobile counterparts.
- **Police Checklist v1** (to be extracted into separate file): Constrained inset? Primitives only? Single urgency palette? Same card padding/elevation? Nav subordination? Screenshot gallery attached?
- **Surface Ownership Matrix**: Map every route to owner + current Police status.
- **Exception Registry**: Only CES and Onboarding V2 (with strict rules) may diverge; all others must converge.

---

**This plan, executed with the Visual Language Police as the enforcement backbone, guarantees that the 16+ operational surfaces cease to be a collection of dialects and become one coherent product family — the calm, authoritative, glassmorphism-magnified experience promised by the Canonical Spec and embodied in the Top Picks mocks.**

*Prepared by Subagent 15 — Cross-Surface Consistency & Visual Language Unification Specialist. All references trace to absolute paths in the workspace and the governing Canonical Spec.*

**Absolute paths for key artifacts**:
- `docs/UIUX/Agent_15_CrossSurface_Consistency_Analysis.md` (companion forensic baseline)
- `docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md`
- `docs/UIUX/DRIFT_REGISTER.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/Implementation/mocks/Top-Picks/`
- `src/policy/components/ui/` (the single source primitives)
- `src/policy/ces/theme.ts` and `src/policy/onboarding-v2/pages/OnboardingV2Layout.tsx` (primary dialect sources to be governed)
