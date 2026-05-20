# Agent 16 — Mockup Fidelity & Phase Readiness Risk: 4-Phase Implementation Roadmap

**Subagent:** Overall Mockup Fidelity & Phase Readiness Risk Specialist  
**Role of This Document:** The single most synthesized, risk-prioritized, and authoritative 4-phase plan of the 16. This is the plan I would actually sign and own as the program owner if accountable for delivering a live application that passes direct visual comparison to the approved mockup contracts.  
**Guiding Principle:** Front-load highest business value + highest visual risk surfaces. Every phase exit is gated by objective "does the live UI match the pictures" evidence, not checklists.  
**References:** Top Picks + Desktop/v2 + Mobile/v2 image sets; all prior reality reports, 16_POINT series, DRIFT_REGISTER, CANONICAL_UI_SYSTEM_SPEC.md (esp. Section 4 Constrained Page View + one-glass), SURFACE_CHECKLISTS, Implementation/*_Reality_Report*.md, Phase*_*Checklist*.md.

---

## 1. Minimum Lovable Canonical Surface Set (MLCSS) — Non-Negotiable Before Any Broader Rollout

The MLCSS is the smallest set of surfaces that **must** be pixel-perfect (or Design-approved delta) against their corresponding Top Picks / v2 mock images before the design system can be declared "in production" or any Phase 3/4 exit can be claimed.

**MLCSS (5 Core + Shell + Variants):**

1. **Shell Foundation** — `CommandCenterLayout.tsx` + `ShellTopbar.tsx` + `ShellNavRail.tsx` + `ShellContentFrame.tsx` (all themes, 3 breakpoints)
   - Must demonstrate strict 4-sided constrained framing (`clamp(16px, 1.6vw, 28px)`) on desktop that visibly magnifies glass depth.
   - Single-layer glass treatment only (no stacked sub-cards inside main glass).

2. **Dashboard (Command Center)** — Primary narrative + operational surface
   - Must match: Desktop `01_Dashboard_Desktop_v2.jpg` (and Top Picks dark variants), Mobile `01_Dashboard_Mobile_v2.jpg`.
   - Hero stats, Action Board, KPI tiles, Task overview, Brad integration — exact glass, typography, spacing, accents, elevation.

3. **Policy Library + Policy Search + Policy Detail (incl. GVGB special case)**
   - Must match: `06_PoliciesLibrary_Desktop_v2.jpg`, `03_PolicyDetail_Mobile_v2.jpg`, `13_PolicySearch_Mobile_v2.jpg`, `09_Policies_Appendices_Light.jpg`, and Top Picks equivalents.
   - Includes LibraryPage, SharedPolicyDetailView, PolicyDetailPage, GVGBDetailView (preserved special treatment inside canonical shell).

4. **Evidence Center + Evidence Capture / Hierarchy**
   - Must match: `12_EvidenceCapture_Desktop_v2.jpg`, `11_EvidenceList_Mobile_v2.jpg`, Top Picks Evidence mocks.
   - Full hierarchy, capture flows, document-to-PDF.

5. **CES Operational Core** — CES Board + My Tasks + Calendar (Compliance Execution heart)
   - Must match: `02_CES_Board_Mobile_v2.jpg`, `10_CESMyTasks_Desktop_v2.jpg`, `09_CESReports_Desktop_v2.jpg`, `08_CESTaskDetail_Mobile_v2.jpg`, and Desktop CES equivalents.
   - Includes CesBoardPage, MyTasks/PM surfaces, MasterCalendarPage, ComplianceCalendar, inner review layers (RobertCesReviewLayer, CesRoleReviewSwitcher).
   - `--ces-*` sub-brand exception allowed only where explicitly documented; must visually converge on canonical glass language.

**Stretch but Required for "Lovable":**
- Onboarding Activation / AuditReadiness / BatchView (`11_OnboardingActivation_Desktop_v2.jpg`, `07_OnboardingActivation_Mobile_v2.jpg`, `05_OnboardingBatchView_Desktop_v2.jpg`)
- eCign Signing entry points (minimum landing + basic flow alignment)

**MLCSS Rule:** No surface outside this set may be promoted or claimed "new design system" until the above pass independent visual QA. All other surfaces remain "legacy with guardrails" or explicitly marked "pre-v2" in UI.

---

## 2. Go / No-Go Visual QA Gates (Using the Actual Mockup Images)

Every phase exit and the final production rollout requires **objective, image-based gates**. Narrative checklists are necessary but insufficient.

**Mandatory Gate Artifacts (per surface in scope):**
- Side-by-side comparison gallery (live browser capture at exact matching viewport/theme vs the precise mock image file, e.g., `01_Dashboard_Desktop_v2.jpg`).
- Design Lead + Product Owner + Accessibility Lead sign-off on each comparison (checkbox + signature + date + notes on approved deltas only).
- Automated + manual verification:
  - Grep/ ESLint: zero raw hex/rgba, zero arbitrary Tailwind opacity/typography/spacing outside documented exceptions.
  - Visual: glass layering (≤1 layer on main surfaces), 4-sided constrained margins clearly visible with breathing room, typography scale exact, accent usage (teal/orange) correct, component primitives only (ui/*), hover/focus/active states per spec, spacing rhythm per TYPOGRAPHY_SCALE + spacing tokens.
  - Mobile: all 3 breakpoints (375, 768, 1024+) pass RESPONSIVE_ACCEPTANCE_MATRIX and match v2 mobile mocks.
  - Dark + Light + CI-mode parity.

**Explicit No-Go Criteria (any one triggers block):**
- Any stacked sub-glass / nested bright cards inside main glass panels (violates one-glass contract).
- Missing or inconsistent 4-sided constrained framing on desktop (full-bleed kills glass magnification).
- Typography, sizing, or spacing that does not match the token system or the specific mock.
- Raw color values or legacy component usage visible in the capture.
- Mobile experience that regresses field usability vs the v2 mobile mocks.
- Missing or mismatched glass blur / elevation / translucency treatment.

**Phase 4 Exit Gate (360° Mockup Regression Gallery):**
- Complete gallery containing:
  - Every image in Top Picks/, Desktop/v2/, Mobile/v2/.
  - 10 additional high-traffic surfaces not covered by the v2 set (e.g., PolicyLifecycle, Forms landing, Journey module player, Staffing cards, iAdministrator key views — captured in "minimal viable" or explicitly "legacy" treatment).
  - Every surface in both Light + Navy Dark, at 375/768/1440/1600 widths.
  - Stored in a dedicated `/visual-qa-regression-gallery/` (or equivalent) with diff annotations.
- Full sign-off by Design Lead (blind review recommended), Engineering, PO, Accessibility.
- Only after this gallery is approved may any "Phase X Complete" or production design system rollout be declared.

**Tooling Enforcement:** Wire Playwright visual regression (update-snapshots gated behind the gallery) + ESLint expansion + PR template Phase 4 Closure checkbox into CI before Phase 2 exit.

---

## 3. Recommended 4-Phase Sequencing (Risk-Prioritized, Business Value Front-Loaded)

Sequencing prioritizes:
- Highest daily business value for core users (compliance officers, field clinicians, surveyors): Dashboard → Policies → Evidence → CES/MyTasks/Calendar.
- Highest visual risk / drift first (CES parallel system, eCign, Journey/Onboarding split) to prevent sunk-cost rework.
- Reference surface (Dashboard + Shell) built perfectly first so it becomes the template.
- Mobile parity addressed in every phase (v2 mocks are mobile-aware).
- Phase 4 is **exclusively** polish + legacy deletion + definitive 360° sign-off (no new feature work).

### Phase 1 — Foundation & Reference Surface Perfection (Est. 2–3 weeks)
**Goal:** Establish the single source of truth that everything else copies. Prove the visual contract is achievable in production code.

**Scope:**
- Full Shell + Dashboard to 100% MLCSS fidelity (all themes/breakpoints) against the specific v2/Top Picks images.
- Token system, primitives catalog, glass layering cheat sheet enforcement.
- 4-sided constrained framing + one-glass rule proven on the reference surface.
- Guardrails: Expanded ESLint (full `src/policy`), CI visual regression baseline, PR template Phase Closure section.
- SURFACE_CHECKLISTS/Dashboard.md completed with visual evidence.
- Decision Log entries for CES exception scope and Journey/Onboarding unification.

**Exit Criteria (Go Gate):**
- Live Dashboard (light + dark + mobile) passes side-by-side against `01_Dashboard_Desktop_v2.jpg` + Mobile equivalent + Top Picks selections. Design + PO sign-off.
- Zero violations on Shell + Dashboard files.
- MLCSS definition + this plan approved.
- First 3 entries in the 360° regression gallery (Shell + Dashboard variants) captured and approved.

**Key Risk Mitigated:** Prevents the rest of the program from copying a flawed reference.

### Phase 2 — Core Business Value Surfaces (Est. 3–4 weeks)
**Goal:** Deliver the surfaces that matter most to daily Home Health compliance and policy operations. Front-load value + close highest-traffic drift.

**Scope (MLCSS priority order):**
1. Policy Library + Search + Detail (incl. GVGB) — match v2 mocks.
2. Evidence Center + Capture flows.
3. CES Board + My Tasks + Calendar + inner review layers (resolve visual convergence of `--ces-*` to canonical glass).
4. Onboarding V2 Activation / Batch / AuditReadiness (minimum alignment to v2 Onboarding mocks; begin Journey unification decision execution).

**Mobile-first reconstruction** on every surface in this phase using the v2 Mobile mocks as acceptance criteria.
Re-use Dashboard template/patterns for all new work.

**Exit Criteria (Go Gate):**
- All Phase 2 surfaces in MLCSS pass individual side-by-side visual QA against their exact corresponding mock images (e.g., CES Board vs `02_CES_Board_Mobile_v2.jpg` + Desktop v2).
- 326 violation count reduced by ≥60% (focus on these surfaces first).
- Cross-surface consistency report (honest version) updated with evidence.
- Mobile readiness on these surfaces ≥8/10 vs v2 mocks.

**Key Risk Mitigated:** Highest-value user journeys now look like the approved pictures. CES parallel drift contained.

### Phase 3 — High Visual Risk & Unification Surfaces (Est. 3 weeks)
**Goal:** Close the remaining high-risk gaps that would undermine a production rollout (legal signing, training engagement, mobile field experience).

**Scope:**
- eCign / Forms signing full convergence to Navy Glass language (or explicit scoped exception with visual treatment rules). Match any available v2 eCign mocks and Top Picks.
- Journey vs Onboarding V2 unification decision executed (deprecate cinematic V1 or migrate key engagement patterns; align both to the canonical glass + v2 mocks where possible).
- Audit Mode polish + remaining WorkflowExecutionPanel / dependent components.
- Mobile parity push on all MLCSS surfaces + key field flows (MobileIncidentExecution, etc.).
- Begin minimal reconstruction or explicit "legacy" visual treatment on zero-attention surfaces that are high-traffic (e.g., Forms landing grid, basic Staffing cards).

**Exit Criteria (Go Gate):**
- eCign and unified onboarding flows pass visual QA against relevant mocks.
- All MLCSS surfaces maintain fidelity (regression check).
- 326 violation count reduced by ≥85%.
- Decision on Journey/Onboarding + CES scope finalized in Decision Log + DRIFT_REGISTER closed for these items.
- First draft of full 360° regression gallery (all v2 + Top Picks) captured.

**Key Risk Mitigated:** Legal (eCign) and brand-coherence risks addressed before broad exposure.

### Phase 4 — Polish, Legacy Deletion, Full 360° Mockup Regression Gallery Sign-Off (Est. 2 weeks)
**Goal:** Only cleanup and definitive proof. No new reconstruction work. This is the true "production ready" gate.

**Scope (strictly limited):**
- Remaining low-priority surfaces brought to "minimal viable fidelity" or explicitly marked legacy with visual treatment guardrails (Staffing, iAdministrator key views, Admin, Workflows, Taxonomy/Framework, Help deep pages, prints, etc.).
- Aggressive legacy deletion: remove all `.backup` files, deprecated components (legacy StatusBadge, old Card families, duplicate Tabs, old CES cards if superseded), orphaned code paths, parallel theme files no longer needed.
- Expand guardrails to permanent (ESLint on entire `src/`, CI enforcement, PR template mandatory).
- **Full 360° Mockup Regression Gallery** completed and signed:
  - Every image in Top Picks/, Desktop/v2/, Mobile/v2/.
  - All additional surfaces listed in UIUX_SURFACE_INVENTORY.md.
  - All themes + breakpoints.
  - Side-by-side + diff annotations + independent Design Lead blind review.
- Final honest updates to all Phase* checklists, DRIFT_REGISTER (all D items closed or explicitly accepted), CANONICAL spec, reality reports.
- Accessibility edge cases, motion/theme parity, responsive parity, cross-surface consistency — all re-validated against the gallery with evidence.
- Production rollout playbook (feature flags, gradual exposure, rollback criteria based on visual complaints).

**Exit Criteria (Final Go Gate — Only After This Is The Product Declared "New Design System Live"):**
- 360° gallery 100% approved by Design Lead + PO + Accessibility + Engineering.
- Zero critical visual debt in MLCSS.
- All 326+ violations either fixed or explicitly accepted with owner + date + visual treatment rule.
- Legacy deletion complete and verified (no dead code paths).
- Full program sign-off in updated `Phase4_Final_Readiness_Package.md` v3.0 (or equivalent) referencing the gallery.

**Phase 4 contains ONLY polish, deletion, and sign-off.** Any new feature or surface work is out of scope and deferred to post-rollout.

---

## 4. Sequencing Rationale & Risk Prioritization Logic

- **Why Dashboard + Shell first:** It is the daily landing surface and the only credible template. Everything else copies its patterns.
- **Why Policies + Evidence + CES next:** These are the highest business value surfaces for the Home Health compliance workflow (policy management, evidence, CES board execution, tasks, calendar). They also carry the highest visual risk if left in hybrid state.
- **Why eCign / Journey unification in Phase 3:** They are high legal/engagement risk but lower daily ops volume than CES/Policy. Fixing them early prevents expensive rework once users are on the new system.
- **Why Phase 4 is pure cleanup + gallery:** Any earlier "complete" declaration would be based on incomplete evidence. The 360° gallery is the only objective proof the entire product matches the visual contracts.
- **Mobile embedded throughout:** v2 mocks explicitly include strong mobile examples; field users cannot wait until the end.
- **Explicitly avoids:** Spreading effort evenly (past mistake), declaring exits on token counts alone, touching low-value surfaces before the MLCSS is perfect.

**Overall Timeline Realism:** 10–12 weeks for full MLCSS + Phase 4 gallery assuming dedicated team. Any attempt to compress below this while skipping visual gates will reproduce the over-claim pattern documented in the reality reports.

---

## 5. Unique Overall Fidelity Lens Final Callouts

- **Checklists lie; pictures do not.** Every prior phase exit that did not include side-by-side mock comparison is now known to have been premature.
- **The 7 attested files are the only truly clean core.** Everything else is still carrying debt. The MLCSS + gallery process is the only way to expand that clean core safely.
- **This plan is the one I would defend to executives and auditors.** It is the minimum defensible path to a production design system that actually delivers the premium glassmorphic experience shown in the approved contracts.
- **Success metric:** When a new user opens the app in dark mode on desktop or mobile and says "this looks exactly like the pictures we approved," the program has succeeded.

**Program Owner Signature Recommendation:** Adopt this 4-phase plan, the MLCSS definition, and the strict image-based Go/No-Go gates as the binding implementation roadmap. Update all prior Phase* documents to reference this plan and downgrade any optimistic "complete" language.

**End of Agent 16 Mockup Fidelity Risk 4-Phase Plan**

*This document + the accompanying Analysis represent the authoritative synthesis across all 16 perspectives and all available evidence.*