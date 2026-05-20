# Agent 16 — Mockup Fidelity & Phase Readiness Risk Analysis

**Subagent Role:** Overall Mockup Fidelity & Phase Readiness Risk Specialist  
**Primary Lens:** End-to-end fidelity of the live application to the strongest approved visual contracts (Top Picks set + v2 Desktop and Mobile collections). Honest, risk-based assessment of whether the product is truly ready for any declared "Phase X exit" or production rollout of the new design system.  
**Date:** 2026-05-19 (synthesized from all available artifacts as of latest reality reports)  
**References Used:** All images in `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/mockup/{Top Picks/, Desktop/v2/, Mobile/v2/}`; every `*Exit_Criteria_Checklist.md`, `*Readiness*.md`, `Phase4_Current_Reality_Report.md`, `Phases_234_Catchup_Reality_Report.md`, and sibling reports in `Implementation/`; `16_POINT_*` series and `DRIFT_REGISTER.md` in `docs/UIUX/`; `SURFACE_CHECKLISTS/`; `CANONICAL_UI_SYSTEM_SPEC.md`; `UIUX_SURFACE_INVENTORY.md`; current screenshots in `tmp-ui-verify-screenshots/` (including navy-dark/ and policy-layout-parity/); code-level greps and violation counts from reality reports.

---

## Executive Summary — The "Trust But Verify Against Pictures" Verdict

The program has made measurable progress on **token hygiene and primitive adoption** on a narrow set of surfaces (Dashboard reference, Evidence, Audit, Calendar, MyTasks, CES inner components). Engineering checklists repeatedly declared "code-complete" and "zero raw-color matches" (Phase3 v2.2/v2.3 attestations on 7 files). Guardrails (ESLint no-restricted-syntax on attested files) now exist.

**However, the live application remains only loosely aligned with the actual pictures in the approved visual contracts.** 

The strongest contracts — the Top Picks selections (e.g., `01_Dashboard_Mobile_v2.jpg`, `02_CES_Board_Mobile_v2.jpg`, `03_PolicyDetail_Mobile_v2.jpg`, `11_OnboardingActivation_Desktop_v2.jpg`, `12_EvidenceCapture_Desktop_v2.jpg`, `13_PolicySearch_Mobile_v2.jpg` and the full v2 Desktop/Mobile sets) — define a precise **Navy Dark glassmorphic language** (deep navy/charcoal glass panels with controlled translucency, teal/orange accents, single-layer "one-glass" treatment, strict 4-sided constrained framing with `clamp(16px, 1.6vw, 28px)` breathing room that magnifies blur/depth, specific typography scale, consistent elevation, no arbitrary hex or stacked sub-cards) or the matching light professional variant.

**Current true state (aggregated from reality reports + visual sampling of screenshots vs mocks):**
- Average **true visual fidelity / completeness across all major surfaces: ~35-42%**.
- "Reconstructed" surfaces (Dashboard, Evidence, Audit, Calendar, CES partial): code-level token discipline 75-90%, **visual/pixel fidelity to mocks 40-60%**.
- Untouched or minimally touched surfaces (the majority): **10-25%**.
- Persistent structural violations (one-glass rule, constrained container, legacy component usage, raw values outside the 7 attested files) mean the "premium glassmorphic experience" promised by the mocks is **not yet visible** on most user journeys.

**Strongest Risk Callout:** Multiple "Phase 3 complete" and "Phase 4 readiness" declarations were based on checklists and greps that did not include direct side-by-side comparison to the mockup image files themselves. The gap between "tokens migrated" and "looks like the picture" (glass depth, spacing rhythm, exact component treatment, mobile behavior, dark/light parity) is the dominant remaining risk. Rolling out the "new design system" on this basis will deliver a hybrid experience that fails the visual contract for field users, compliance teams, and executives who were sold the v2 aesthetic.

**Unique Overall Fidelity Lens Insight:** This is not a code-complete problem anymore — it is a **visual contract enforcement problem**. The 16-agent audit and DRIFT_REGISTER correctly flagged parallel systems (CES, eCign, Journey V1 vs Onboarding V2) and "one-glass" violations on "most pages." Subsequent execution narrowed the attested clean set to 7 files while 57 other files still carry 326+ design-system violations. The pictures in Top Picks and v2/ remain the only objective source of truth. Until a full regression gallery pass against those exact images is complete and signed, no phase exit or production claim is defensible.

---

## Aggregated Current True Completeness % by Surface

Synthesized from:
- `Phase3_Exit_Criteria_Checklist.md` (v2.3 corrections)
- `Phase4_Current_Reality_Report.md`
- `Phases_234_Catchup_Reality_Report.md` (326 violations / 57 files)
- `UIUX_SURFACE_INVENTORY.md` (original 35+ surfaces with pre-recon scores)
- `DRIFT_REGISTER.md` (D01–D25 open items)
- `16_POINT_*` reviews and `Review_02/12` analyses
- Direct mock vs current screenshot sampling (navy-dark/dashboard-dark.png, 01-dashboard.png, policy detail captures, etc.)
- SURFACE_CHECKLISTS/Dashboard.md and Implementation plans

| Surface / Route Family | Code/Token/Primitive Hygiene | Visual Fidelity to Top Picks + v2 Mocks (layout/glass/spacing/typo/color) | Mobile Fidelity | Overall True % | Reconstruction Attention Level | Key Evidence / Gaps |
|------------------------|------------------------------|-------------------------------------------------------------|-----------------|----------------|--------------------------------|---------------------|
| **Shell (CommandCenterLayout, Topbar, NavRail, ContentFrame)** | 95% | 65% | 55% | 72% | High (Phase 2) | Tokens declared; dark mode present in screenshots. Persistent inner-frame duplication on Dashboard; 4-sided breathing room not consistently enforced in all views. |
| **Dashboard (Command Center)** | 85% (primitives + tokens post-Pass 2) | 50% | 45% | 55% | Highest (reference surface) | KPI/Action Board present. Screenshots show stacked white sub-cards inside dark glass (violates one-glass per CANONICAL spec §4 + cheat sheet). Spacing/hero typography closer but not exact match to v2 Desktop mock. Nested cards break depth magnification. |
| **Evidence Center** | 90% (Pass 2 + ESLint) | 55% | 40% | 58% | High | Token migration confirmed in reality report. Visual still lacks full constrained glass treatment and exact card hierarchy vs `12_EvidenceCapture_Desktop_v2.jpg` / Top Picks. |
| **Audit Mode + WorkflowExecutionPanel** | 75% (post-Phase4 B-2/B-3 fixes) | 40% | 35% | 45% | Medium-High | 91 raw hits originally in drawer; many fixed but legacy patterns remain in dependent components. Visual QA never performed against mocks. |
| **Master Calendar** | 80% (3 opacity fixes applied) | 50% | 45% | 55% | Medium-High | Grep clean on main page post-correction. Still uses bespoke composition; not yet verified against v2 calendar expectations. |
| **CES Vertical (Board, Reports, Workloads, Dashboard, inner review layers)** | 70% (theme.ts exception + 28 token pairs) | 35% | 30% | 42% | Medium (parallel system) | Own `--ces-*` palette sanctioned but visual weight, card treatments, urgency hierarchy still drift from canonical glass + v2 CES mocks (`02_CES_Board_Mobile_v2.jpg`). High business risk surface. |
| **My Tasks / PM Overlay** | 70% | 45% | 35% | 48% | Medium | Some primitive adoption. Dense inline styles persist per violation counts. |
| **Policy Library + Search + Appendices** | 60% | 45% | 40% | 48% | Low-Medium | LibraryPage uses some glass-interactive; not fully aligned to v2 PoliciesLibrary mocks. Search/appendices have legacy elements. |
| **Policy Detail (incl. Shared + GVGB special)** | 65% | 50% | 40% | 52% | Medium | Stronger canonical usage on most policies; GVGB honored special case. Still typography/spacing/raw value leaks vs `03_PolicyDetail_Mobile_v2.jpg` and `06_Policy_Detail_Light.jpg`. |
| **eCign / Form Signing / FormsPage / FormViewer / SigningWorkspace** | 30% | 20% | 15% | 22% | Near-zero | Separate navy/orange paper aesthetic (D08). No convergence to Navy Glass. High legal/compliance risk. Core signing flows untouched. |
| **Onboarding V2 (Dashboard, BatchView, Activation, AuditReadiness, Governance)** | 65% | 55% | 35% | 50% | Medium (V2 modern) | Light professional audit-grade treatment is "strongest modern UX" per inventory but stark drift from Journey V1 and from dark glass v2 mocks (`11_OnboardingActivation_Desktop_v2.jpg`). Mobile weak. |
| **Journey (Home, V1, ModulePlayer, StagingM01, etc.)** | 20% | 15% | 10% | 15% | Near-zero | Cinematic dark glass vs Onboarding V2 light professional incompatibility (D07, D20). Zero reconstruction attention on most journey surfaces. High engagement surface left behind. |
| **Staffing (Clinician/Patient/Shift cards, calendar)** | <15% | <10% | <10% | 12% | Zero | Uses some SurfaceCard but domain-specific patterns; heavy violation counts in related components. |
| **iAdministrator (full suite + subcomponents)** | <10% | <8% | <8% | 9% | Zero | Top violation offender (ReferenceCards, RightPanelPreview, ChatThread, index). 50+ raw hits. Completely outside reconstruction scope. |
| **Admin / Workflows / Taxonomy / Framework / AchcSurvey** | 15-25% | 10-15% | <10% | 15% | Zero-Low | Separate apps or data-heavy tables. No token/primitive migration. |
| **Print / Packet Renderers (multiple)** | 40% | 30% | N/A | 25% | Low | Inconsistent headers/footers (D09, D23, D24). Fidelity depends on packet HTML builders. |
| **Help, Governance, System Docs, MasterControlInventory** | 40% | 35% | 30% | 35% | Low | Basic shell integration but low polish and no mock alignment. |

**Aggregate across 35+ surfaces (weighted by traffic/risk):** True completeness **~38%**. "Reconstruction attention" has been narrowly focused; the majority of the surface inventory has received almost zero attention.

**Surfaces with almost zero reconstruction attention despite being in scope (high visibility or user impact):**
- All Journey surfaces (cinematic engagement path for training)
- Full iAdministrator / Brad proposal tooling
- Staffing domain pages
- Admin identity & permissions UI
- WorkflowLibraryApp
- Taxonomy/Framework surveyor alignment surfaces
- Most eCign deep signing + multi-signer flows
- Many print packet variants
- Mobile-first field execution surfaces (MobileIncidentExecutionPage, etc.)

---

## Detailed "Mockup vs Current" Gap Analysis — Selected High-Impact Surfaces

**1. Dashboard (Reference Surface) — Top Picks / v2 Desktop: `01_Dashboard_Desktop_v2.jpg`, Mobile `01_Dashboard_Mobile_v2.jpg`; current: `tmp-ui-verify-screenshots/01-dashboard.png` + `navy-dark/dashboard-dark.png`**

- **Layout/Framing:** Mock shows clear 4-sided constrained content area with breathing room magnifying glass depth. Current dark screenshot has left nav + full-width main content; inner Action Board cards create stacked layers. DashboardPage still wraps a second `<ShellContentFrame>` (architectural duplication flagged in catchup report).
- **Glass Treatment:** Mock: unified deep navy glass panels with soft blur, subtle edges, single-layer premium depth. Current: dark glass outer + bright white/light sub-cards (QAPI, Governance, etc.) inside — direct violation of "one-glass, no stacked sub-cards" (CANONICAL spec §4, index.css comments, DRIFT D13, Review_02).
- **Typography/Spacing:** Closer on stats but arbitrary remnants and inconsistent rhythm vs TYPOGRAPHY_SCALE + token classes in spec.
- **Color/Component:** Teal/orange accents present; many legacy cards/buttons. Brad overlay present in both but treatment differs.
- **Fidelity Gap:** High visual delta. Looks "improved dark mode" but not the precise v2 glassmorphic contract.
- **Completeness %:** 55% (as table).

**2. CES Board — v2: `02_CES_Board_Mobile_v2.jpg` + Desktop equivalents; current CES pages via CesBoardPage + board/ components**

- Parallel `--ces-*` navy/orange system remains visually distinct from canonical `--ci-*` glass.
- Card urgency hierarchy and treatments do not match the constrained glass language of the mocks.
- High business value (compliance execution) + high drift = critical risk.
- Completeness: 42%.

**3. Policy Detail & Library — v2: `03_PolicyDetail_Mobile_v2.jpg`, `06_PoliciesLibrary_Desktop_v2.jpg`; current: `tmp-ui-verify-screenshots/policy-layout-parity/` captures + LibraryPage / PolicyDetailPage / SharedPolicyDetailView / GVGBDetailView**

- Some progress toward canonical metadata grids and SurfaceCard usage.
- Persistent typography leaks, header treatments, and glass layering inconsistencies vs the clean v2 mocks.
- GVGB special case is preserved but surrounding chrome drifts.
- Completeness: ~48-52%.

**4. Evidence & eCign Signing — Evidence mocks in Top Picks + v2; eCign in separate aesthetic**

- Evidence has token progress.
- Signing flows (FormSigningWorkspace, eCign paper) remain in the old navy/orange + physical paper metaphor — zero alignment to the glassmorphic v2 language. This is a legal surface.
- Completeness: Evidence 58%, eCign 22%.

**5. Onboarding V2 vs Journey — v2 OnboardingActivation mock present; current OnboardingV2Layout (light rail + white) vs Journey cinematic**

- Explicit incompatibility documented (D07). Onboarding V2 is the stronger modern base but does not match the dark glass v2 mocks and conflicts with Journey.
- Mobile readiness for both families is poor (inventory scores 3-4/10).
- Completeness: Onboarding V2 50%, Journey 15%.

**General Patterns Across Sampled Surfaces:**
- Constrained 4-sided rule rarely visible in live captures.
- Glass-on-glass alpha literals and arbitrary Tailwind opacity classes were the dominant pre-fix anti-pattern (now mechanically blocked only on 7 files).
- Component usage: ui/ primitives (ActionButton, CiStatusBadge, etc.) adopted on reference surfaces; legacy SCard/Card families, custom tabs, spinners, badges still proliferate elsewhere.
- Mobile: v2 mocks are deliberately mobile-first in several Top Picks; live app remains desktop-biased with poor field UX.

---

## Risk-Based Synthesis & Strongest Callouts

1. **False Phase Readiness:** Phase 3 v2.2 engineering attestation and early Phase 4 scaffolds over-claimed visual and cross-surface completeness. Reality reports (Phase4_Current_Reality, Catchup) were required to correct them. Human Design/A11y/PO sign-offs (P3-SO-01..04) remain the true gate — and have not occurred against the pictures.
2. **Visual Debt Concentration:** 57 files / 326 violations outside the attested clean core. iAdministrator and Journey/Staging are the worst offenders and also the least reconstructed.
3. **Brand & Legal Exposure:** CES (parallel system) + eCign (signing) + Journey/Onboarding split create three competing visual languages on high-stakes surfaces.
4. **Mobile Field User Penalty:** Average mobile readiness ~5/10 in inventory; v2 mocks explicitly address this. Field clinicians and surveyors will experience the weakest version.
5. **Enforcement Fragility:** Guardrails are file-scoped or honor-system outside the 7. Any broader rollout leaks legacy immediately.
6. **No Objective Visual Baseline:** No comprehensive side-by-side gallery against the exact Top Picks + v2 image set exists yet. All "approved" claims are narrative until this artifact is produced and signed.

**Overall Program Fidelity Risk Level:** High. The product is not ready for a declared "Phase X exit" or production design system rollout. The current state is "token-disciplined core + legacy everywhere else + aspirational pictures."

---

## Recommended Next Immediate Actions (Pre-Phase Planning)

- Produce the authoritative **Minimum Lovable Canonical Surface Set** definition and force a blind visual QA pass (live vs exact mock images) on it.
- Expand ESLint rule + CI visual regression to cover the full surface inventory (or explicitly flag legacy surfaces).
- Commission the full 360° mockup regression gallery (all v2 + Top Picks + 10 high-traffic additions, all themes/breakpoints) as the Phase 4 exit artifact.
- Resolve the Journey vs Onboarding V2 unification decision (and CES sub-brand exception scope) before Phase 3 exit.

This analysis positions the two follow-on 4-Phase Plan as the only credible path forward. No prior phase exit checklist or readiness package has performed the "mockup vs current" pixel test at the required breadth.

**End of Agent 16 Mockup Fidelity Risk Analysis**