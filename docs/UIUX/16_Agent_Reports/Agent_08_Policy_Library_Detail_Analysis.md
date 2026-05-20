# Agent 08: Policy Library, Detail, Search & Appendices Specialist — Analysis Report

**Subagent:** 08  
**Primary Lens:** Policy-facing surfaces (LibraryPage, PolicyDetailPage, Search, AppendicesPanel, Taxonomy, acknowledgment flows)  
**Reference Mocks:** 03_PolicyDetail_Desktop_v2.jpg, 06_PoliciesLibrary_Desktop_v2.jpg, 13_Policies_Search_Light.jpg, 09_Policies_Appendices_Light.jpg, 16_Policies_Acknowledgment_Light.jpg, 20_Policies_Library_Light_Improved.jpg, 24_Policy_Detail_Light_SoftGlass.jpg and v2/mobile equivalents  
**Code Areas Audited:**  
- `src/policy/pages/LibraryPage.tsx`  
- `src/policy/pages/PolicyDetailPage.tsx`  
- `src/policy/pages/TaxonomyPage.tsx`  
- `src/policy/components/PolicyLibraryDocumentView.tsx`, `SharedPolicyDetailView.tsx`, `PolicyAppendicesPanel.tsx`  
- `src/policy/components/FormViewer.tsx`  
- `src/policy/pages/FormsPage.tsx`, `PrintPage.tsx`, `FormPrintView.tsx`  
- Shell primitives: `src/policy/components/ui/{ShellFrame.tsx,ShellContentFrame.tsx,GlassPanel.tsx,SurfaceCard.tsx}`  
- Global: `src/index.css` (ci-glass-panel, ci-card, --ci-glass-layer1-* tokens), `src/policy/components/CommandCenterLayout.tsx`  
**Date:** 2026-05-17  
**Unique Policy Lens Insight:** Policy consumption is the highest-frequency end-user activity (staff attestation, survey prep, daily reference). The "content heart" must feel like a premium, calm editorial instrument inside the single canonical glass canvas — not a dense document dump that fights the glass or overflows the constrained frame. Poor typography + internal full-bleed surfaces inside the shell's Layer-1 glass destroys the expensive depth and readability the v2 design system promises. The shell's 4-sided inset + one-glass contract (see GLASS_LAYERING_CHEAT_SHEET.md and ShellFrame) is the non-negotiable magnifier; policy surfaces currently violate it more than any other domain.

---

## 1. Executive Summary — Current State vs. Canonical Intent

The policy surfaces are functionally rich (taxonomy-driven library, 10-tab carousel detail with GV-GB-001 specimen fidelity, ACHC filters, linked forms in appendices, embedded signing) but visually and experientially at odds with the premium constrained-glass reading experience defined in the design system.

- **Library browsing** (LibraryPage + FormsPage): Closest to mocks. Uses `.glass-interactive-lib / .glass-panel-lib` cards in responsive grids with domain sidebar, regulatory chips, search. Light-mode overrides force solid `#FAFBF8` / white. Good information density but excessive per-component inline styles and custom scroll hiding.
- **Detail / Reading** (SharedPolicyDetailView + PolicyLibraryDocumentView): The critical surface. Renders inside ShellContentFrame glass but immediately overrides with `bg-white` / `bg-[#FAFBF8]` full surfaces, solid `SCard` (white shadow-sm p-6), tab bars, and action chrome. Content constrained only to `max-w-[1100px] mx-auto` inside a white main — the atmospheric Layer 0 never breathes around the editorial content. Section-by-section carousel + heavy specimen tables/lists create high visual density without premium breathing room.
- **Appendices & Forms** (PolicyAppendicesPanel + FormViewer): Sidebar + bordered white panel hosting FormViewer. Functional but solid chrome; no soft-glass elevation or consistent token usage.
- **Taxonomy / FrameworkShowcase**: Separate dark-mode specimen view; inconsistent with canonical light-glass surfaces used elsewhere.
- **Search / Acknowledgment flows**: SearchField embedded in glass cards; acknowledgments live inside FormSigningWorkspace / eCign flows (solid or glass depending on host). No dedicated premium acknowledgment surface matching 16_Policies_Acknowledgment mock.
- **Print paths**: Separate, correctly constrained (`max-w-[850px]` article) — the one place that gets editorial containment right.

**Core Failure Mode (Policy Lens):** The shell promises "SINGLE deep-maroon translucent glass canvas" + `padding: var(--ci-glass-layer1-inset-desktop)` + rounded Layer-1 surface. Policy pages (especially detail) inject their own `h-full w-full bg-white` and internal white cards, violating the "no stacked sub-cards" and "constrained frame + visible Layer-0 breathing room" rules from GLASS_LAYERING_CHEAT_SHEET.md. Result: long policy prose feels overwhelming and flat rather than calm/premium inside glass.

---

## 2. Visual Density & Reading Experience Audit

### 2.1 Library / Browse Surfaces (06_PoliciesLibrary, 13_Policies_Search, 20_Improved mocks)
- **Strengths**: Domain taxonomy sidebar + filter chips + policy cards with ID badges, regulatory dots, ACHC badges. Grid `gap-5`, `p-5` cards, `line-clamp` titles. SearchField + view toggle (IBM/ACHC) prominent. Count badges and shimmer animations add polish.
- **Issues**:
  - `.glass-interactive-lib` + inline `style` for borders/colors + massive `<style>` block with light-mode `!important` overrides. Not using canonical `<GlassPanel>` or `ci-glass-panel` class consistently.
  - In light mode: all glass becomes solid `#FAFBF8` + hairline borders — acceptable per cheat sheet ("light mode rely on shadows + borders"), but the overrides are brittle and duplicate across LibraryPage / FormsPage.
  - Card density: good on desktop (4-col), but long subdomain names and ACHC multi-line metadata make cards tall. No density toggle.
  - Scroll: custom hidden scrollbars on sidebar + content; works but not canonical.
- **Policy Lens Insight**: Browsing is discovery; the glass cards succeed at "premium surface" feeling. The problem emerges the moment user clicks into detail — the transition from light glass grid to heavy document surface breaks continuity.

### 2.2 Policy Detail / Long-Form Consumption (03_PolicyDetail_Desktop_v2, 24_SoftGlass, 06_Policy_Detail_Light mocks)
- **Structure**: Action bar (back/print/download/help) → Tab bar (overview/statements/procedures/.../appendices) → Scrollable main (`bg-[#FAFBF8]`) → `max-w-[1100px] mx-auto px-6...` container → either SCard or GenericSectionPanel.
- **SCard** (line 549-552): `w-full max-w-[1100px] ... bg-white shadow-sm rounded-xl p-6 mb-6`. Solid white, not glass. Used for every section (overview metadata grid, purpose, scope, procedures tables, compliance checklists, references).
- **Typography & Density**:
  - Headings: `font-montserrat font-semibold text-[28px] md:text-[32px]` (close to TYPOGRAPHY_SCALE "text-title").
  - Body: `font-roboto text-[15px] leading-relaxed`, `text-[14px]`, tables `text-[13px]`.
  - Matches scale reasonably but many hard-coded sizes (`text-[13px]`, `text-[11px]`, `tracking-[0.22em]`) instead of tokens.
  - Long GV-GB-001 specimen (hundreds of lines of procedures, compliance matrices, federal refs) rendered as dense tables + numbered lists + paragraphs inside white cards. No extra breathing, no focus mode, no progressive disclosure beyond tab/section nav.
  - Carousel slide animations + prev/next + section label help, but the frame itself does not feel "premium editorial" — it feels like a Word doc inside a browser.
- **Glass Violation**:
  - Outer `policy-carousel-screen bg-white` + inner `bg-[#FAFBF8]` + SCard white = multiple solid layers stacked inside the ShellContentFrame glass. The shell's `backdrop-filter` and Layer-0 TravelightBG are masked.
  - No use of `GlassPanel` for content sections; SCard is the opposite of the "one-glass" rule.
  - `max-w-[1100px]` is reasonable but the parent scroll container and surrounding chrome do not expose the shell inset breathing room around the prose.
- **Appendices Tab** (PolicyAppendicesPanel): `flex gap-12 max-w-[1200px]`, sticky sidebar, main `border border-[#E5E4E3] bg-white rounded-[8px] min-h-[600px]`. Functional but again solid bordered panel — not elevated glass. FormViewer inside scrolls with fade masks.
- **Policy Lens Insight**: Long policy content (the most common view) is the place where the design system's glass + constraint contract must shine brightest. Currently it fights it. Users experience "overwhelming document" instead of "calm, focused reading surface floating in premium glass." This is the single highest-risk area for the v2 experience promise.

### 2.3 Taxonomy / Framework Surfaces
- `TaxonomyPage` → `FrameworkShowcase`: Separate dark specimen with its own tabbed PolicyDetailView using `text-white` / `border-white/20` chrome. Inconsistent with canonical light-glass + ShellFrame used by `/library`.
- Good domain icons and regulatory filters, but not unified.

### 2.4 Search, Acknowledgment & Form Viewer
- Search: Embedded `SearchField` in library header; results are the same glass cards. No dedicated full-width search results surface matching 13_Policies_Search mock polish.
- Acknowledgment: Lives in FormViewer + FormSigningWorkspace + eCign flows. Surfaces inherit host chrome; no dedicated "Policy Acknowledgment" glass card flow visible in code that matches the mock (signature + attestation inside constrained glass panel).
- FormViewer: Rich but heavy component; renders inside appendices white panel.

### 2.5 Print & Export
- `PrintPage`, `FormPrintView`, `GVGB*Print`: Correctly use dedicated `max-w-[850px]` or similar + print-specific CSS. The one surface that enforces true editorial containment. Good.

### 2.6 Shell Integration Issues (CommandCenterLayout + Shell* primitives)
- Policy pages pass `h-full w-full bg-*` directly into the scroll container inside ShellContentFrame. This bypasses the "painted glass" contract and the 4-sided inset breathing room.
- Light mode: many `!important` resets and solid backgrounds (see LibraryPage lines 429-440, Shared... bg-white).
- Result: the expensive Layer-0/1 glassmorphism (TravelightBG + blur + inset) is only visible on non-policy surfaces or in the library grid chrome, not during the actual policy reading experience.

---

## 3. Typography, Spacing & Density Specific Findings

- Strong alignment with TYPOGRAPHY_SCALE.md in spirit (Montserrat headings, readable body ~15-16px, 1.5+ line-height) but implementation is scattered inline classes rather than reusable tokens.
- No `prose` class or canonical long-form editorial styles for policy body text, tables, checklists.
- High density in procedures/compliance tables (many columns, small text, long wrapping cells) — risk of fatigue on desktop, worse on mobile.
- Good use of `line-clamp`, `truncate`, regulatory color dots for scannability in library.
- Missing: comfortable reading line-length enforcement inside the glass frame, focus/reading-mode, adjustable density, sticky section progress.

---

## 4. Gaps vs. Reference Mocks & Design System

- v2 mocks show soft-glass elevated cards, generous whitespace inside constrained frames, clear hierarchy, subtle elevation on active sections, and visible atmospheric background around the main content pane.
- Current code: library cards approximate the cards; detail and appendices do not approximate the soft-glass editorial container.
- Glass cheat sheet explicitly calls out "Policy Library view" as a positive example of constrained grid — yet the detail view (the next click) destroys it.
- No unified "Policy Consumption Surface" primitive that all paths (library, lifecycle, CES, surveyor, journey acknowledgment) can embed while inheriting full canonical glass + typography.

---

## 5. Risk Assessment (Policy Lens)

**Highest Risk:** Detail reading surfaces — daily use for attestation, surveys, reference. If long content feels "overwhelming inside glass" instead of "premium calm", the entire v2 glassmorphic value prop is undermined for the most important user journey.

**Secondary:** Inconsistent treatment between browse (glass-ish) and consume (solid) creates jarring transitions. Light/dark parity hacks are fragile.

**Opportunity:** Policy surfaces are the perfect early canonicalization target because they are content-heavy, high-frequency, and contain the hardest long-form + form + search + taxonomy cases.

---

## 6. Recommendations Summary

1. Make all policy surfaces strict consumers of ShellContentFrame + ShellFrame insets; remove internal `bg-white` / `h-full w-full bg-*` overrides that mask the glass.
2. Introduce or enforce a `PolicyContentContainer` / editorial `GlassPanel` variant for SCard content with proper max-width, generous padding, premium typography scale, and no internal full-bleed.
3. Canonicalize typography and spacing for policy prose/tables inside the frame (align strictly to TYPOGRAPHY_SCALE + new long-form tokens).
4. Unify appendices, search results, taxonomy, acknowledgment modals under the same glass treatment.
5. Add reading-experience affordances (focus mode, density, progress, print parity) without breaking the glass contract.
6. Treat policy consumption as the Phase-1 canonicalization surface (see companion 4-Phase Plan).

**Conclusion (Unique Insight):** In a glassmorphic system, the library grid can look good even with custom hacks. The true test is whether 40-page regulatory policy prose rendered section-by-section feels like a $2000 editorial product inside frosted glass or like a dense intranet wiki fighting its container. Current implementation tilts toward the latter for the detail view — the exact surface that must be fixed first to protect the entire product's perceived premium quality.

---

*End of Analysis Report. Companion 4-Phase Plan document details the remediation sequence.*