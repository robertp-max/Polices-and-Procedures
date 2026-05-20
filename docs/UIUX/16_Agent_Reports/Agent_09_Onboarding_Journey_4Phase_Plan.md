# Agent 09: Onboarding, Journey & Batch Management — 4-Phase Reconstruction Plan

**Subagent:** 09 — Onboarding, Journey & Batch Management Specialist  
**Workstream:** Onboarding v2 Visual & Experience Reconstruction (Major)  
**Goal:** Achieve pixel-and-feel parity with approved v2 mocks (Desktop/v2 + Mobile/v2 + Top Picks) while preserving the rock-solid Compliance Activation Engine. Deliver the calm, progressive, glass-elevated experience across all surfaces.  
**Duration Target:** 6-8 weeks (parallelizable with CES/PM streams)  
**Checkpoints:** Explicit visual + functional gates against specific mock files and design artifacts.  
**References:**  
- Mocks: `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/mockup/Desktop/v2/{05_OnboardingBatchView_Desktop_v2.jpg, 07_OnboardingDashboard_Desktop_v2.jpg}`, `Mobile/v2/{05_..., 07_OnboardingActivation_Mobile_v2.jpg, 09_AuditReadiness_Mobile_v2.jpg}`, `Top Picks/11_OnboardingActivation_Desktop_v2.jpg`  
- Design: `GLASS_LAYERING_CHEAT_SHEET.md`, `ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md`, `12-UIUX-Design-Specification.md`, `CANONICAL_UI_SYSTEM_SPEC.md`, `Builder/Onboarding/V2/` series (esp. 07-UI-UX-Architecture.md, 12-...)  
- Code: `src/policy/onboarding-v2/`, `src/policy/journey/`, CommandCenterLayout, Shell* primitives, `src/policy/components/ui/{GlassPanel.tsx, SurfaceCard.tsx}`

---

## Strategic Principles (Non-Negotiable)

1. **Glass-Elevated First** — Every major surface must follow the 3-layer system. Desktop: constrained max-width Layer 1 container + visible atmospheric Layer 0 margins. Cards = Layer 2 frosted glass (GlassPanel / ci-glass-panel + overlay tokens).
2. **Progressive Disclosure** — Never overwhelm. Phase accordions, bottom sheets on mobile, "Next Step" guidance, calm urgency (orange only for real blockers).
3. **Canonical Primitives Only** — No new hardcoded hex in onboarding-v2 or journey. Consume `--ci-*`, `ci-glass-*`, `ci-status-pill-*`, GlassPanel, SurfaceCard.
4. **Theme Coherence** — Full participation in Care Indeed light + dark (teal-accent dark glass treatment matching mocks). Journey already leads here; bring onboarding-v2 to parity.
5. **Audit-Grade Calm** — Visual language must convey trust and defensibility. Evidence and signatures remain first-class.
6. **Journey ↔ Onboarding v2 Unification** — Training completion (Journey) auto-advances onboarding units and creates CES tasks. Single source of truth for LMS-style flows inside batches.
7. **CES / PM Seamless Handoff** — Batch units surface as sprint tasks; activation triggers feed calendar and evidence center without context loss.

---

## Phase 1: Foundation — Token Adoption, Shell Integration & Visual Contract Lock (Week 1-2)

**Objective:** Eliminate visual drift at the source. Make every onboarding surface a first-class citizen of the glass system.

**Key Deliverables:**
- Replace all hardcoded colors in `onboarding-v2/components/*`, `pages/*`, `OnboardingV2Layout.tsx` with canonical tokens and `GlassPanel`/`SurfaceCard`.
- Update `OnboardingV2Layout` sub-rail to full glass treatment (match ShellNavRail / Journey rail patterns) and enforce desktop breathing room via `.ci-page-container` + max-width constraints.
- Add explicit `data-ci-mode` / theme support so dark glass (teal accents) activates for onboarding-v2 when user selects Care Indeed dark.
- Create `OnboardingGlassCard.tsx` (thin wrapper) and status/progress variants that match teal/cyan from mocks (progress bars, pills).
- Audit & update StatusPill, KpiTile, GateTile, UnitRow, etc. to use `.ci-status-pill--*` + overlay tints.
- Wire Journey components to share the same elevated card language.
- Update CommandCenterLayout nav item + sub-rail to reflect "Compliance Activation" branding from mocks.
- Establish side-by-side reference rig in `tmp-ui-verify-screenshots/onboarding-v2/` using the exact mock filenames.

**CES/PM Integration Checkpoint:**
- Document exact event emission points from `onboardingV2Store.ingest` / engine → CES sprint + PM taskProjection.

**Visual Checkpoint Gate (End of Phase 1):**
- All surfaces render with GlassPanel/SurfaceCard + no raw hex in onboarding-v2 source.
- Desktop surfaces exhibit visible Layer 0 margins when in dark mode (compare to Dashboard mock).
- Light mode remains clean white per spec but uses token surfaces.
- **Sign-off:** Subagent 09 + UIUX lead review of 3 representative screens vs mock references.

**Success Criteria:**
- Zero new hardcoded colors introduced.
- `onboarding-v2/**` passes token application matrix (see Implementation/ in _Heavy audit folder).
- Journey glass-interactive components remain untouched or enhanced.

---

## Phase 2: Dashboard + BatchView / Batch Management Reconstruction (Week 2-4)

**Objective:** Deliver pixel-feel parity on the two highest-traffic operational surfaces (Dashboard & BatchView) against the strongest mocks.

**Key Deliverables:**
- **DashboardPage.tsx**:
  - KPI strip → elevated glass KpiTiles with sparklines / deltas (or minimal SVG per mock).
  - Active batches list → glass cards with teal progress bars (units done/total), subject chips, status pills matching mock exactly.
  - Live audit feed → glass sidebar.
  - Phase distribution grid → refined glass tiles.
  - Add radial readiness gauge (or bar set) for overall contribution (per spec 3.1).
  - Constrained container + atmospheric background exposure.
- **BatchViewPage.tsx + BatchListPage.tsx**:
  - Header with subject chip, gate strip (GateTile → elevated glass version with teal states).
  - Phase accordions → frosted glass containers with subtle expand icons.
  - Unit rows inside phases → clean glass list rows with inline progress, evidence/signature counts, owner.
  - Right audit timeline → elevated glass panel.
  - UnitDrawer → slide-in glass drawer (560px) with tabs (Overview | Evidence | Signatures | Audit Timeline) matching spec 3.3.
  - "Start Batch" / action CTAs in teal per mock.
- **UnitDrawer.tsx & supporting** (EvidencePanel, SignerStrip, AuditTimeline): Full glass treatment + inline capture flows.
- Mobile: Segmented controls / bottom sheets for Units/Gates/Evidence per `ONBOARDING_V2_MOBILE_PATTERN_LIBRARY.md`.
- Add FAB on mobile Batch Detail for "Add Unit / Capture Evidence".

**Checkpoints (Explicit Mock Alignment):**
- **CP2.1 (Dashboard):** Visual side-by-side against `Desktop/v2/07_OnboardingDashboard_Desktop_v2.jpg` + Mobile equivalent. KPI count, batch cards, teal accents, glass depth, no full-bleed.
- **CP2.2 (BatchView):** Visual + interaction parity vs `Desktop/v2/05_OnboardingBatchView_Desktop_v2.jpg` and `Mobile/v2/05_OnboardingBatchView_Mobile_v2.jpg`. Gate strip, phase sections, unit list, side audit, drawer behavior.
- **CP2.3 (BatchList):** Filterable glass list matching batch overview patterns in mocks.
- Functional: Gate evaluation, phase toggle, drawer open, status transitions still 100% working via existing engine.

**Journey Tie-in (Phase 2 parallel):**
- Expose Journey completion events that can mark training/competency units complete in a batch.

**CES/PM Checkpoint:**
- Units from a batch appear in Sprint Board / MyTasks with correct gate metadata.

**Success Criteria:**
- Operator can navigate from Dashboard → BatchView → UnitDrawer without visual jarring.
- Progress bars and status exactly mirror mock color language (teal for in-progress/approved).
- Desktop breathing room + glass elevation visible in dark mode.

---

## Phase 3: Activation + AuditReadiness + Mobile-First Patterns (Week 4-6)

**Objective:** Reconstruct the high-stakes entry and exit surfaces (Activation, Audit Readiness) to the elegant glass treatment shown in Top Picks and Mobile v2 mocks. Complete mobile pattern library implementation.

**Key Deliverables:**
- **ActivationPage.tsx**:
  - Centered elevated glass form panel on dark atmospheric background (exact language from `11_OnboardingActivation_Desktop_v2.jpg` and Mobile v2 07).
  - Left: Subject card, trigger segmented control, role multi-select (domain grouped), effective date, scope selectors.
  - Right (sticky): Template preview + reconciliation preview (suppressed requirements) with teal progress bar.
  - Primary "Activate" CTA in teal/cyan with confirmation modal (audit-event preview).
  - Live updates as roles change (existing engine already supports).
- **AuditReadinessPage.tsx**:
  - Subject header + role timeline (horizontal) in glass.
  - Tab strip (Credentials, Acknowledgments, Competencies, Trainings, Gates, Overrides, Evidence, Audit chain) using glass chips.
  - Per-tab content as glass cards (credentials with expiry, signed policy links via PolicyVersionLink, evidence explorer).
  - Hash-chain verification banner (green/red glass tile).
  - Right rail: Surveyor Quick Answers (canned queries with citations).
  - Export bar (Signed Dossier PDF + CSV) — produce watermarked output.
- **Mobile Patterns (all surfaces):**
  - Bottom sheets for Unit Detail / Evidence Capture / Assignment (instead of desktop drawer).
  - Large thumb targets, pull-to-refresh on lists.
  - Segmented controls for Overview / Gates / Evidence / Audit Readiness.
  - Long-press quick actions on units.
  - Empty states per pattern library ("Add your first unit...", "This unit has cleared all gates").
- **GovernancePage.tsx**: Elevated ledger for overrides/vendors with multi-sig eCIgn preview.

**Checkpoints:**
- **CP3.1 (Activation):** Side-by-side vs `Top Picks/11_OnboardingActivation_Desktop_v2.jpg` and `Mobile/v2/07_OnboardingActivation_Mobile_v2.jpg`. Glass panel depth, teal buttons, requirements checklist, form elegance.
- **CP3.2 (AuditReadiness):** Parity vs `Mobile/v2/09_AuditReadiness_Mobile_v2.jpg`. Tab polish, timeline, export, surveyor rail.
- **CP3.3 (Mobile End-to-End):** Run through full flow (Activation → BatchView on phone) using mobile mock references. One-handed friendly, no desktop drawer leakage.
- **CP3.4 (Journey Integration):** Journey module completion auto-creates / advances onboarding unit evidence; visible in BatchView.

**CES/PM / eCIgn Checkpoint:**
- Activation emits properly typed trigger that lands in CES and triggers signature workflows.
- Evidence capture in drawer/sheet uses existing eCIgn + Forms library.

**Success Criteria:**
- Activation feels "deliberate and important" (confirmation + summary).
- Audit Readiness dossier is surveyor-ready and visually premium.
- Full responsive parity with approved Mobile/v2 onboarding mocks.

---

## Phase 4: Unification, Governance Polish, End-to-End Validation & Handover (Week 6-8)

**Objective:** Close the loop — make Onboarding v2 + Journey the authoritative, calm activation + learning fabric fully wired into CES/PM/Calendar/Audit Mode. Production readiness + audit defensibility sign-off.

**Key Deliverables:**
- **Batch Management Enhancements:** Saved views/filters, bulk actions (Capture Evidence for All), override request multi-sig flow (eCIgn), withdraw (gated), reassign.
- **Governance & Overrides:** Full visual treatment + enforcement engine hooks (per `06-Enforcement-Rules.md`).
- **Journey ↔ Onboarding v2 ↔ CES Unification:**
  - SCORM / training completion events → unit status + evidence object (hash + timestamp).
  - Competency validation workspace (spec 3.5) — skill grid + dual signatures.
  - Signature / Acknowledgment flows (spec 3.6) unified with eCIgn.
- **Performance & Empty States:** Skeletons, all empty states per library, loading polish.
- **Accessibility & Field Hardening:** WCAG 2.1 AA (already targeted), large targets, voice labels, sunlight contrast.
- **Cross-Surface Consistency:** Status colors, subject chips, unit rows identical to CES Board / Evidence Center / Calendar.
- **Audit & Export Hardening:** Every action emits correct audit events; dossier PDF is watermarked + hash-verifiable.
- **Documentation:** Update Builder/Onboarding/V2/ with "as-built" notes; add to Help Center articles.
- **Demo / Validation Script:** End-to-end from trigger → activation → journey training → gate clearance → batch activate → audit dossier export. Run against all 4 checkpoint mocks.

**Final Checkpoints:**
- **CP4.1 (Full Visual Audit):** All 4 primary surfaces (Dashboard, BatchView, Activation, AuditReadiness) pass side-by-side review against the referenced Desktop/v2 + Mobile/v2 + Top Picks images + dark glass treatment.
- **CP4.2 (Integration):** Journey completion → onboarding unit → CES task visible end-to-end with no manual steps.
- **CP4.3 (Audit Defensibility):** Export signed dossier from AuditReadiness; verify hash chain and policy version bindings.
- **CP4.4 (Mobile Field):** Physical device test (or responsive emulation) of full flow using Mobile/v2 mocks as acceptance criteria.
- **CP4.5 (Governance):** Override + dual-sign flow exercised and audited.
- **Executive Sign-off:** Subagent 09 + CES lead + PM lead + UIUX lead + Compliance Director.

**Success Criteria:**
- Onboarding v2 is the **calm, progressive, glass-elevated Compliance Activation Engine** — visually and functionally indistinguishable from the approved mocks.
- Zero drift from CANONICAL_UI_SYSTEM_SPEC and GLASS_LAYERING rules.
- Journey is the trusted LMS delivery layer inside the same fabric.
- Full traceability from HR trigger through policy → evidence → signature → CES execution → surveyor dossier.

---

## Risk Mitigation & Parallel Streams

- **Risk: Token migration breaks existing light UIs** — Phase 1 scoped only to onboarding-v2 + journey; use feature flag for dark glass preview.
- **Risk: Engine changes during visual work** — Freeze engine after Phase 1; all UI work consumes existing store/engine APIs.
- **Parallel:** CES board reconstruction and PM task projection can proceed simultaneously (shared status tokens).
- **Rollback:** Each phase produces a clean commit; visual changes behind `featureFlags.onboardingV2Glass` until CP2.1.

---

## Resource & Ownership

- **Subagent 09 (this plan owner):** All onboarding-v2 pages/components, journey harmonization, mock checkpoints, integration points.
- **UIUX Primitives Team:** GlassPanel / token extensions if gaps found.
- **CES / PM Owners:** Event contracts and task projection.
- **eCIgn / Evidence:** Signature and capture flows inside drawers/sheets.
- **Testing:** Playwright flows for each checkpoint surface + mobile emulation.

---

## Outcome Vision (Unique Lens)

When complete, an operator opening `/onboarding-v2/dashboard` will experience exactly the calm authority shown in the v2 mocks: atmospheric dark glass, teal progress quietly advancing, every gate and unit state instantly legible, activation feeling deliberate, audit dossier feeling surveyor-proof.

**Batch management becomes the single pane of glass for "who is ready, why they are blocked, and what evidence closes the gate."**

**Journey becomes the progressive learning companion that feeds the same engine without friction.**

This is not a UI refresh. It is the final step that makes the Compliance Activation Engine **feel** as strong as it already is in code.

---

**Plan Version:** 1.0  
**Next Action:** Phase 1 kickoff — token audit of `src/policy/onboarding-v2/` + reference screenshot capture of current state vs mocks.

*Prepared by Subagent 09 — Onboarding, Journey & Batch Management Specialist*  
*References locked to approved Desktop/v2, Mobile/v2, and Top Picks onboarding images.*