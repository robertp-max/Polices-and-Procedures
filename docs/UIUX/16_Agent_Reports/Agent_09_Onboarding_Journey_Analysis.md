# Agent 09: Onboarding, Journey & Batch Management — Analysis Report

**Subagent:** 09 — Onboarding, Journey & Batch Management Specialist  
**Primary Lens:** All Onboarding v2 / Journey surfaces, batch views, activation, audit readiness, governance, and LMS-style learning flows.  
**Date:** 2026-05-17  
**Reference Mocks (Approved Baseline):**  
- Desktop/v2: `05_OnboardingBatchView_Desktop_v2.jpg`, `07_OnboardingDashboard_Desktop_v2.jpg`  
- Mobile/v2: `05_OnboardingBatchView_Mobile_v2.jpg`, `07_OnboardingActivation_Mobile_v2.jpg`, `09_AuditReadiness_Mobile_v2.jpg`  
- Top Picks: `11_OnboardingActivation_Desktop_v2.jpg`  
- Supporting: `Builder/Onboarding/V2/`, `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md`, `GLASS_LAYERING_CHEAT_SHEET.md`, `12-UIUX-Design-Specification.md`

---

## Executive Summary

Onboarding v2 is both the **most critical business flow** (Compliance Activation Engine converting role/policy triggers into governed, evidence-producing, hash-chained CES execution units) and one of the **most visually complex multi-state surfaces** in the system. 

**Current Fidelity Assessment (to calm, progressive, glass-elevated experience in approved v2 mocks):**

- **Functional / Data Model / Engine Fidelity: HIGH (85%)**  
  Catalog (roles, templates, requirements, policies), engine (gates, reconciler, audit, hash), store, and page skeletons closely follow the architecture in `Builder/Onboarding/V2/03-Onboarding-Execution-Engine.md` and `08-Data-Model.md`. Trigger ingestion, gate evaluation, unit phases (PreHire→PostActivation), evidence/signature capture, batch status, and audit chaining are present and wired.

- **Navigation & Structure Fidelity: MEDIUM-HIGH (70%)**  
  OnboardingV2Layout provides sub-rail (Dashboard / Activation / Batches / Audit Readiness / Governance). Routes exist in App.tsx and CommandCenterLayout. BatchViewPage delivers 3-region layout (header + gates + phases + side audit), Activation has reconciliation preview, AuditReadiness has tabbed dossier. Matches high-level spec in `12-UIUX-Design-Specification.md`.

- **Visual / Experience Fidelity: LOW (20-25%)**  
  The defining "calm, progressive, glass-elevated" character of the approved mocks is **largely absent**.  
  - Current surfaces are **light-mode flat cards** (white `bg-white`, hard `#E5E7EB` borders, navy `#0B2545` text, orange `#E07B2C` accents) with minimal `backdrop-blur-sm` only on the sub-rail.  
  - No adoption of canonical glass primitives (`GlassPanel`, `SurfaceCard`, `ci-glass-panel`, `ci-card`, overlay tokens).  
  - Hard-coded hex literals dominate `onboarding-v2/**` (KpiTile, GateTile, StatusPill, BatchViewPage, DashboardPage, AuditReadinessPage, etc.) while the rest of the app has migrated to `--ci-*` tokens and theme-aware dark glass (Care Indeed dark / CI-ION).  
  - Missing: 3-layer glass system (atmospheric Layer 0 dark bg + constrained max-width Layer 1 + elevated Layer 2 frosted cards), breathing room on desktop per GLASS_LAYERING_CHEAT_SHEET, teal/cyan accent progress bars and CTAs visible in all v2 mocks, progressive disclosure polish, mobile-first bottom-sheet/accordion patterns, calm urgency (restrained blockers), and the elegant centered glass form panels shown in Activation mock (`11_OnboardingActivation_Desktop_v2.jpg`).

**Journey surfaces** (LMS-style) show **higher visual alignment** (`glass-interactive`, `border-white/10`, backdrop-blur in ModuleCard/PhaseRail/StagingM01Page/JourneyHomePage) and dark progressive flows, but lack tight handoff to v2 batch activation and full mobile pattern library from `ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md`.

**Key Gap Summary (by mock checkpoint surface):**
- **Dashboard**: KPI strip + batch list + live feed exist; missing glass-elevated cards, radial readiness gauge, sparklines, constrained container exposing atmospheric dark background, teal progress.
- **BatchView**: Gate strip + phase accordions + UnitDrawer + AuditTimeline present structurally; rendered as flat light panels instead of elevated frosted glass on dark, no teal progress visuals or pill styling from `05_OnboardingBatchView_Desktop_v2.jpg`.
- **Activation**: Reconciliation preview + trigger/role picker + template side panel functional; light flat form vs the sophisticated dark glass modal-style panel with teal CTAs, requirements checklist, and subtle depth in Top Picks / Mobile v2 mocks.
- **AuditReadiness**: Tabbed dossier (credentials/acknowledgments/gates/evidence) + chain verification + export present; lacks glass cards, horizontal role timeline polish, surveyor quick-answer rail, and visual calm of `09_AuditReadiness_Mobile_v2.jpg`.
- **BatchList / Governance**: Basic filtering and override ledger; no elevated treatment.

**CES / PM Integration Points:**  
- CommandCenterLayout surfaces Onboarding v2 in main nav (with sub-items).  
- Engine is designed to emit units into CES sprints/calendar (per `04-CES-Integration.md`), but live bidirectional wiring and PM task projection handoff remain thin.  
- Journey (training modules/scorm) is intended to feed competency/training units but currently operates as a parallel LMS surface.

---

## Unique Onboarding Lens Insight

**"Onboarding v2 is the single point where policy governance becomes live, auditable work."**

Under this lens, every surface is not merely a UI — it is an **activation contract**:
- Activation page = the moment a human (or vendor) is bound to a role × policy matrix with immutable reconciliation.
- BatchView = the live execution cockpit where gates, evidence, and signatures convert abstract requirements into CES-enforceable units.
- AuditReadiness = the surveyor-ready, hash-chained dossier proving defensibility.
- Journey = the LMS delivery mechanism that satisfies training/competency gates with SCORM + evidence capture.

The **calm, progressive, glass-elevated aesthetic** is not cosmetic. It directly supports:
- Operator cognitive load reduction during complex multi-phase, multi-gate work.
- Trust in the system for high-stakes decisions (overrides require dual eCIgn; every state change is audited).
- Visual separation that makes evidence/signature first-class citizens (as required by the spec: "evidence and signatures are first-class citizens, not afterthoughts").
- Mobile field use (one-handed, gloved-hand friendly, sunlight-readable per the pattern library).

Current implementation delivers the **engine promise** but presents it inside a legacy light flat-card wrapper that fights the approved visual contract. This creates a dangerous perception gap: the backend is audit-grade; the frontend does not yet *look and feel* audit-grade or calm.

**Journey** provides the complementary progressive learning rails (PhaseRail, ModuleCard with glass) but must be unified so training completion automatically advances onboarding units without context switch.

---

## Detailed Surface-by-Surface Fidelity Matrix

| Surface              | Mock References                          | Structural Match | Visual/Glass Match | Progressive Disclosure | Mobile Patterns | Notes / Gaps |
|----------------------|------------------------------------------|------------------|--------------------|------------------------|-----------------|--------------|
| Dashboard            | Desktop/v2 07, design spec 3.1           | High             | Low                | Medium                 | Low             | KPI strip + tabs present; no glass cards, no max-width breathing room, hardcoded colors |
| Activation           | Top Picks 11, Mobile/v2 07, spec 3.2     | High             | Low                | Medium                 | Medium          | Reconciliation live preview good; flat light form vs centered elevated glass panel + teal CTAs |
| BatchView / Batches  | Desktop/v2 05, Mobile/v2 05, spec 3.3    | High             | Low                | High (phases)          | Low             | Gate strip + accordion phases + drawer + side timeline; missing frosted elevation & teal visuals |
| AuditReadiness       | Mobile/v2 09, spec 3.7                   | Medium-High      | Low                | Medium                 | Low             | Full tab set + chain verify + export; missing glass dossier polish & timeline |
| Governance           | spec 3.7 (overrides)                     | Medium           | Low                | Low                    | Low             | Basic ledger; needs elevated treatment |
| Journey (LMS)        | Related training flows                   | Medium           | Medium-High        | High                   | Medium          | glass-interactive present; needs batch handoff & full v2 mobile patterns |
| UnitDrawer / Evidence / Signature | spec 3.4-3.6                    | Medium           | Low                | High                   | Low             | Inline tabs exist; styling not glass-elevated |

**Hardcoded Color Inventory (onboarding-v2 only):** Extensive use of `#0B2545`, `#E5E7EB`, `#E07B2C`, `#1F8A4C`, etc. across 8+ files. Contrast with canonical `--ci-*` + `ci-glass-*` used in Shell*, Journey, CES.

**Layout Violations vs Glass Cheat Sheet:**
- No constrained `max-width` + visible Layer 0 margins on desktop surfaces.
- Main content often full-bleed within the sub-rail surface instead of breathing room for premium glass depth.

---

## Journey & Batch Management Observations

- Journey store + data (achcLessons, modules, scorm runtime) provide solid LMS backbone with phase gating and evidence capture.
- Components (ModuleCard, PhaseRail, GateBanner) already employ glass-interactive language — a head start for harmonization.
- Missing: Direct surface from Journey completion → Onboarding v2 unit advancement and CES task creation.
- Batch management (list, view, drawer) is the operational heart; current implementation is usable for demo but not yet the "calm assistant" described in the mobile pattern library.

---

## Risks & Audit-Readiness Implications

1. **Perception vs Reality Risk**: Strong engine + weak visual presentation undermines trust during ACHC surveys or internal audits (surveyors will interact with the UI).
2. **Inconsistency Risk**: Onboarding surfaces diverge from CES, Evidence Center, and Journey, violating cross-surface consistency rules in the design spec.
3. **Mobile Field Risk**: Operators in home health (bright sunlight, gloves) will struggle with current light flat design.
4. **Integration Debt**: Until CES/PM handoff is visually and data-wise seamless, batch activation remains a silo.

---

## Recommended Immediate Actions (Pre-Phase Work)

- Audit every file under `src/policy/onboarding-v2/` for raw hex and replace with canonical tokens / GlassPanel / SurfaceCard.
- Add `data-theme` / `data-ci-mode` awareness so onboarding surfaces participate in Care Indeed dark glass treatment.
- Constrain main content containers per GLASS_LAYERING_CHEAT_SHEET (expose atmospheric background).
- Align StatusPill / progress visuals with teal/cyan language from the v2 mocks.
- Create side-by-side reference captures in `tmp-ui-verify-screenshots/` against the exact mock files.

**Overall Grade (Unique Lens):**  
**Engine & Logic: A-** | **Surfaces & Experience: D+** | **Integration: C** | **Audit-Visual Coherence: C-**

The foundation is excellent. The visual contract is the blocker preventing Onboarding v2 from delivering on its promise as the calm, progressive, glass-elevated Compliance Activation Engine.

---

*End of Analysis — See companion 4-Phase Plan for sequenced reconstruction workstream.*