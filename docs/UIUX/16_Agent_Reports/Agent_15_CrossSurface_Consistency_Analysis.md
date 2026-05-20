# Agent 15: Cross-Surface Consistency & Visual Language Unification Analysis

**Subagent:** 15 — Cross-Surface Consistency & Visual Language Unification Specialist  
**Primary Lens:** "Does it all hang together?" — Testing whether the 16+ operational surfaces feel like one product with one visual philosophy ("calm authority, task-first, glassmorphism-magnified") after partial reconstruction work.  
**Reference:** CANONICAL_UI_SYSTEM_SPEC.md (Sections 2–4, 10–11, 16–17) + Top Picks mockups (`_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/Implementation/mocks/Top-Picks/`: 11_OnboardingActivation_Desktop_v2.jpg, 12_EvidenceCapture_Desktop_v2.jpg, 01_Dashboard_Mobile_v2.jpg, 02_CES_Board_Mobile_v2.jpg, etc.)  
**Date of Audit:** 2026-05-17 (current codebase state post-Phase 1 partial hardening)  
**Surfaces Audited:** 7 representative (selected for coverage of high-traffic, high-drift, and reference-mock surfaces)

---

## 1. Surfaces Selected for Consistency Audit

1. **Dashboard** (`src/policy/pages/DashboardPage.tsx`) — Reference "best case" post-reconstruction surface.
2. **Policy Library** (`src/policy/pages/LibraryPage.tsx`) — High-frequency policy discovery surface.
3. **Evidence Center** (`src/policy/pages/EvidenceCenterPage.tsx` + CesEvidenceHierarchyPanel) — Core compliance artifact surface (maps to Top Picks 12).
4. **CES Board / CES surfaces** (`src/policy/ces/pages/CesBoardPage.tsx`, `CesDashboardPage.tsx`, `CesLayout.tsx`, `ces/components/primitives.tsx`) — Maps to Top Picks 02_CES_Board.
5. **Onboarding V2** (`src/policy/onboarding-v2/pages/OnboardingV2Layout.tsx` + pages/*) — Modern activation engine (maps to Top Picks 11_OnboardingActivation).
6. **Master Calendar** (`src/policy/pages/MasterCalendarPage.tsx`) — Unified time + task surface.
7. **Forms / eCign Flow** (`src/policy/pages/FormsPage.tsx`, `FormViewer.tsx`, `FormSigningWorkspace.tsx`) — Legal signing surface.

(Additional context drawn from Journey variants, SharedPolicyDetailView, PM overlays, and ShellContentFrame behavior.)

---

## 2. Consistency Audit Results (Key Dimensions)

### 2.1 Card Treatments
- **Dashboard**: Uses `ShellContentFrame` + `SurfaceCard` (via `ci-card` class) + `ActionButton`, `CiStatusBadge`, `EmptyState`. Consistent padding (`lg`=24px default), elevation via glass tokens. KPI cards and boards follow tokenized rhythm.
- **Policy Library**: Heavy use of custom `.glass-interactive-lib`, `.glass-panel-lib` (rounded-2xl, p-5/p-6, border-[0.77px], hover:border-[#FFC107]/40). Multiple ad-hoc card variants. No `SurfaceCard` or `GlassPanel`. Local "lib" naming indicates wave-era invention.
- **Evidence Center**: Custom `ci-premium-hero`, `ci-command-rail`, `ci-maturity-section`, `ci-bg-overlay-*`, `ci-status-pill--danger`. Hierarchy panel (CES-flavored). No `ShellContentFrame` wrapper in page root; relies on layout children slot. Mixed card styles.
- **CES surfaces**: Dedicated `CesCard` (in `ces/components/primitives.tsx`) — `rounded-xl shadow-sm` + `background: t.white`, `border: 1px solid ${t.border}` (navy/orange family). Independent from `SurfaceCard`. Board columns and task cards follow CES palette exclusively.
- **Onboarding V2**: Sub-layout cards use `bg-white/80`, custom rail items, `UnitDrawer`, `KpiTile`, `StatusPill`, `GateTile`. Not mapped to `SurfaceCard`/`GlassPanel`. Fixed 260px rail + white main creates panel-in-panel effect.
- **Master Calendar**: Partial adoption — imports and uses `SurfaceCard` for empty states and some containers. Calendar cells and event cards still contain custom visuals and inline styles.
- **Forms/eCign**: Form cards in grid use shell glass + custom; signing workspace uses separate "paper" + navy/orange modal treatments (distinct from main glass cards).

**Finding**: At least 4 distinct card families in active use (ci-card/SurfaceCard, glass-*-lib, CesCard, Onboarding custom tiles). Violates "8+ different Card/Surface families" drift (D06) and "System over styling" rule.

### 2.2 Urgency Colors / Status Signaling
- **Canonical intent** (from design refs + TASK_URGENCY_HIERARCHY_SPEC.md + Top Picks): Single governed semantic set (gold/teal accents for highlights, clear critical/warning/success, no color-alone meaning). Task-first scannability in <500ms.
- **Dashboard**: Leverages `CiStatusBadge`, tone props on KPI, regulatory event colors (green/amber/red mapped via tokens/vars).
- **Policy Library**: Hard-coded `bg-[#0f766e]/10 text-[#0f766e]`, `bg-[#ea580c]/10 text-[#ea580c]`, gold `#FFC107` borders/hovers. ACHC mapping badges use teal/orange literals.
- **Evidence Center**: `ci-status-pill--danger`, overlay colors, mixed `--ci-accent` + custom.
- **CES surfaces** (`ces/theme.ts` + primitives): Full parallel — `CES_ORANGE_LIGHT=#C74601`, `CES_NAVY_LIGHT=#1F4A8A`, own `green/amber/red` (CES_GREEN_LIGHT=#0F766E, CES_AMBER=#B45309, CES_RED=#B91C1C). Overdue/escalation uses orangeSoft + orange. Documented "sub-brand" but creates competing urgency dialect. Dark variants flip navy→teal.
- **Onboarding V2**: Uses `--ces-navy-deep` for active states + orange accent (`#E07B2C`), StatusPill/GateTile with domain-specific readiness colors.
- **Other**: Legacy `StatusBadge` coexists with `CiStatusBadge` (D11). Multiple orange/teal/gold variants across files.

**Finding**: At least three urgency palettes (CI gold/teal primary, CES navy/orange + muted professional, Onboarding hybrid). Direct violation of single semantic token contract and "same urgency colors" requirement. Task prioritization signals fracture across surfaces.

### 2.3 Glass Elevation Language & Layer Model (Critical)
- **Canonical** (Spec §3–4): Max 3 layers. Layer 0 = TravelightBG/atmospheric. Layer 1 = single `ShellContentFrame` translucent glass (var(--ci-color-glass-main), backdrop blur, constrained 4-sided inset via `--ci-glass-layer1-inset-desktop`). Layer 2 = `SurfaceCard`/`GlassPanel` elevated cards. **No full-bleed, no opaque canvas, no nested glass inside glass**. "Glassmorphism magnification" depends on visible backdrop frame.
- **Dashboard**: Best — uses `ShellContentFrame` (painted glass via CSS vars + rounded-3xl on desktop). Content composes inside constrained frame.
- **Policy Library**: Renders custom glass divs (`.glass-panel-lib`) directly in shell main slot. Creates nested or competing glass layers; borders use raw hex. Violates constrained view (content "kisses" or overrides frame).
- **Evidence Center**: Header uses `ci-premium-hero` + `backdrop-blur-sm` + `ci-bg-overlay-faint`. Content area not wrapped in `ShellContentFrame`. Hierarchy panel introduces additional elevation. Breaks single-glass illusion.
- **CES surfaces**: `CesLayout` sets `background: t.canvas` (solid `#F8FAFC` light / `#11242A` dark) + solid white topbar + `CesCard` solids. **Opaque canvas completely overrides the translucent Layer 1 glass**. No backdrop blur visible; elevation is flat shadow-sm. Major Layer Model violation. (Even with documented exception in ces/theme.ts header.)
- **Onboarding V2**: `OnboardingV2Layout` renders `bg-white/80 backdrop-blur-sm` 260px rail + white main content area. Inside CommandCenterLayout children slot but punches through glass aesthetic with solid/light panels. Sub-rail chrome duplicates shell nav behavior.
- **Calendar/Forms**: Mixed — some `SurfaceCard` adoption, but many event cards and form viewers use custom or legacy glass treatments.

**Finding**: Only Dashboard reliably honors the Constrained Page View Contract and Layer Model. Most surfaces either (a) render their own glass, (b) use opaque canvases, or (c) nest panels, destroying the "magnified" depth that defines the identity in Top Picks mocks. "One-glass" philosophy (see CommandCenterLayout header comment) is aspirational only.

### 2.4 Spacing Rhythm & Density
- Dashboard / Calendar: Tokenized comfortable-to-compact (16/24/32px via SurfaceCard padding, ShellContentFrame insets).
- Library: Inconsistent p-5 / p-6 / px-3 on cards, custom 0.77px borders, dense filter chips.
- CES: px-5/py-3 headers, px-6 on CesLayout main, own density (professional but heavier than glass cards).
- Onboarding V2: 260px rail + gap-4, py-2.5 items, fixed widths that violate responsive matrix on desktop (D19).
- Evidence: px-6 pt-5 pb-4 headers + custom section padding.
- General: Widespread raw `text-[26px]`, `px-3 py-2.5`, arbitrary tracking values. No single spacing scale enforcement yet (D12, D01).

**Finding**: Rhythm exists within surfaces but not across. Mobile 44px targets present in places but not universal. "Comfortable command surfaces vs compact lists" density profiles not consistently applied.

### 2.5 Nav Behavior
- **Global**: CommandCenterLayout + ShellNavRail / ShellTopbar / mobile 5-slot tabs consistent for top-level (Dashboard, Library, Evidence, Calendar, CES entry, Onboarding v2 entry, etc.).
- **Fractures**:
  - CES: `CesLayout` adds its own top context bar (Active Sprint dropdown, search, escalations bell, profile) + sub-navigation via CES menu items. Duplicates chrome.
  - Onboarding V2: `OnboardingV2Layout` inserts dedicated 260px left rail (Dashboard/Activate/Batches/Audit/Governance) with descriptions. Bypasses ShellNavRail for its subtree.
  - PM overlays / My Tasks: Additional task drawers and sprint selectors.
  - Journey: Own PhaseRail / cinematic nav in some modules.
- All live inside the outer shell, but inner "sub-shells" create inconsistent mental model and visual weight.

**Finding**: Top-level nav unified; intra-surface nav is a free-for-all. Violates "Zone rhythm and spacing must be consistent across Dashboard, Evidence Center, Audit Mode, Calendar, My Tasks..." (Spec §5).

---

## 3. Visual Dialects That Have Emerged

After partial reconstruction (primitives introduced, Dashboard/Calendar improved, some token usage), the product has **fractured into distinct visual dialects** rather than converging on the single "calm authority, task-first, glassmorphism-magnified" family defined by Top Picks:

1. **CI-ION Command Center Glass (Emerging Canonical)**: Dashboard + partial Calendar/PolicyDetail. Translucent Layer-1 glass, SurfaceCard elevations, constrained insets, gold/teal accents. Closest to Top Picks 01/12.
2. **CES Navy Canvas Sub-Brand (Approved Exception but Dialect)**: Full parallel system (`ces/theme.ts`, `CesCard`, `CesLayout`, navy `#1F4A8A`/deep + orange `#C74601` + own status greens). Opaque professional surfaces. Explicitly "intentionally distinct" per file header (Lead 16 C14). Visually reads as a different product. Strongest violation of single-family goal.
3. **Onboarding V2 Light Professional Audit Rail**: 260px white/80 rail + clean white content, ces-navy accents, modern tiles (KpiTile/StatusPill/GateTile). "Audit-grade" aesthetic that contrasts with both main glass and Journey cinematic. Light-mode dominant while main product emphasizes dark glass magnification.
4. **Legacy Wave Glass-Lib (Policy Library + Evidence)**: Custom `.glass-interactive-lib` / `.glass-panel-lib`, `ci-premium-hero`, `ci-command-rail`, raw hex borders and status tints. Pre-primitive wave styling that survived reconstruction.
5. **eCign Paper + Signing (Legal Surface)**: Separate paper treatment + navy/orange signing modals (D08). Critical for compliance artifacts but diverges from glass language.
6. **Cinematic Journey / Staging**: High-polish absolute carousels, theatrical dark glass (StagingM01), different from V2 and main shell. (D07, D20)

**Result**: A user moving from Dashboard → Library → Evidence → CES Board experiences 3–4 visual languages in one session. The product does **not** "feel like one product."

---

## 4. Unauthorized Local Design Inventions (Violations of "System over styling")

Per Spec §2: "No route-specific visual invention. All surfaces are built from canonical primitives + tokens."

Violations observed (non-exhaustive, cross-referenced to DRIFT_REGISTER.md):

- **Custom glass class systems**: `glass-interactive-lib`, `glass-panel-lib`, `glass-interactive` (Library + Evidence) — direct local reinvention of GlassPanel.
- **CES parallel primitive + theme system**: `ces/theme.ts` (CES_TOKENS, useCesTokens), `CesCard`, `CesLayout` — complete fork justified only by sub-brand exception. Still a dialect.
- **OnboardingV2Layout sub-rail**: Fixed 260px aside with bespoke bg-white/80 + backdrop-blur + ces-navy styling + own NavLink active states. Duplicates shell responsibilities.
- **Raw values & ad-hoc utilities**: Hundreds of `#FFC107`, `text-[26px]`, `border-[0.77px]`, `bg-[#0f766e]/10`, `px-3 py-1.5 rounded-full` (D01). Still present in Library, Evidence, CES, OnboardingV2.
- **Legacy ci-* wave classes**: `ci-premium-hero`, `ci-command-rail`, `ci-maturity-section`, `ci-bg-overlay-*`, `ci-status-pill--danger` (Evidence, Library).
- **Multiple badge / status families**: Legacy StatusBadge + CiStatusBadge + CES status + Onboarding StatusPill + domain chips (D11, D25).
- **Independent layouts**: CesLayout, OnboardingV2Layout, various PM pages, Journey modules — each reimplements chrome, spacing, and elevation.
- **Per-surface color overrides**: GVGB special casing, FrameworkShowcase, iAdministrator, staffing cards (D02, D18).
- **Form signing divergence**: eCign palette and packet HTML separate from canonical print contract (D08, D09, D23, D24).

These are not "temporary" — many are actively maintained and even documented as intentional (CES header).

---

## 5. Unique Consistency Lens Insight

**The "glassmorphism magnification" contract (Canonical Spec Section 4) is not a layout nicety — it is the perceptual DNA of the entire product identity.**

Top Picks mocks (especially 11_OnboardingActivation_Desktop_v2.jpg and 12_EvidenceCapture_Desktop_v2.jpg) derive their "calm authority" and premium task-first feel **entirely from the visible Layer-0 backdrop framing the inset Layer-1 glass panel**. Blur, luminous edges, depth shadows, and floating elevation only exist because content never kisses the viewport or shell boundary.

Every surface that:
- Supplies its own opaque canvas (CES `t.canvas`),
- Punches a white rail through the glass (Onboarding V2),
- Renders competing glass panels directly against the shell children slot (Library `.glass-panel-lib`, Evidence custom hero),

...does more than "look different." It **destroys the single visual illusion** that makes the 16+ surfaces members of one family. Token adoption and primitive imports are necessary but insufficient; without universal participation in the **constrained 4-sided inset + single translucent glass** model, the product remains a portfolio of themed micro-apps rather than one authoritative compliance platform.

**Unique insight from this lens**: Partial reconstruction has produced "glass islands" — surfaces that consume a few --ci-* tokens or import one primitive while violating the Layer Model. These islands create higher cognitive load than the pre-reconstruction chaos because they *promise* unity while delivering fractured depth perception. The Visual Language Police must therefore treat the Constrained Page View Contract as a hard gate (equal in weight to WCAG AA or print fidelity), not a nice-to-have. Only when every surface — including the documented exceptions — either fully joins the glass family or is explicitly branded as a governed sub-product with deliberate visual separation rules, will the product "hang together" as the calm, task-first authority defined by the Top Picks.

---

## 6. Summary of Current State vs. Canonical Goal

- **Progress**: Dashboard demonstrates the target (ShellContentFrame + primitives + tokens). Calendar has begun adoption. Token/CSS var infrastructure and Shell* components exist.
- **Blockers**: CES (D03, D14), Onboarding fragmentation (D07, D19), Library/Evidence legacy glass (D06, D13), raw values (D01), multiple renderers/navs.
- **Risk**: Without aggressive cross-surface unification, Phase 3 surface work will simply multiply dialects. The "single family" promise of the reconstruction program will fail at the retina level.
- **DRIFT_REGISTER linkage**: Directly maps to D01–D08, D10–D14, D18–D22, D25. Many remain "Open."

**Recommendation from Lens**: Elevate Visual Language Police to first-class governance process (detailed in companion 4-Phase Plan) before any further surface reconstruction proceeds. Screenshot galleries against Top Picks must become the universal acceptance artifact.

---

*Analysis performed by Subagent 15 using direct code inspection of primitives, layouts, pages, ces/theme, index.css tokens, CommandCenterLayout, App.tsx routing, DRIFT_REGISTER.md, CANONICAL_UI_SYSTEM_SPEC.md, and Top Picks mock references. All claims traceable to source files and spec sections.*

**Absolute paths referenced**:
- `docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md`
- `docs/UIUX/DRIFT_REGISTER.md`
- `src/policy/components/CommandCenterLayout.tsx`
- `src/policy/components/ui/{GlassPanel.tsx,SurfaceCard.tsx,ShellContentFrame.tsx,...}`
- `src/policy/ces/theme.ts` + `ces/layouts/CesLayout.tsx` + `ces/components/primitives.tsx`
- `src/policy/onboarding-v2/pages/OnboardingV2Layout.tsx`
- `src/policy/pages/{DashboardPage.tsx,LibraryPage.tsx,EvidenceCenterPage.tsx,MasterCalendarPage.tsx}`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/Implementation/mocks/Top-Picks/`
