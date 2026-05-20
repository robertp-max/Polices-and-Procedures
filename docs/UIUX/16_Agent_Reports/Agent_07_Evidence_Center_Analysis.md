# Agent 07 — Evidence Center & Capture Workflows Analysis

**Subagent Role:** Evidence Center & Capture Workflows Specialist  
**Primary Lens:** EvidenceCenterPage, evidence capture flows, document-to-PDF, hhcEvidence, cesEvidenceHierarchy, all related mobile/desktop evidence views, signature/form evidence integration with eCign  
**Audit Date:** 2026-05-17  
**References Consulted:** 
- Mocks: `02_EvidenceCenter_Desktop_v2.jpg`, `07_EvidenceCenter_Dark.jpg`, `12_EvidenceCapture_Desktop_v2.jpg`, Mobile evidence mocks (04_Evidence_Document_to_PDF.jpg, 04_Evidence_Light.jpg and v2 equivalents) in `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/mockup/`
- Key code: `src/policy/pages/EvidenceCenterPage.tsx`, `src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx`, `src/policy/evidence/cesEvidenceHierarchy.ts`, `src/policy/evidence/evidenceModel.ts`, `src/policy/ecign/hhcEvidence.ts`, `src/policy/services/hhcFormEvidence.ts`, `src/policy/components/ui/PhotoEvidenceCapture.tsx`, `src/policy/components/regulatory/EvidencePanel.tsx`, `src/policy/pages/ArtifactViewerPage.tsx`, `src/policy/pages/MobileIncidentExecutionPage.tsx`, `src/policy/components/ui/DataGrid.tsx`, `GlassPanel.tsx`, `SurfaceCard.tsx`
- Prior artifacts: `Evidence_Reconstruction_Plan.md`, `Evidence_Canonical_Primitive_Usage.md`, `Evidence_Token_Application_Matrix.md`, `Evidence_Accessibility_Validation_Report.md`, `Agent_01_Glassmorphism_Layering_Analysis.md`, `EVIDENCE_CAPTURE_SPECIFICATION.md`, `CANONICAL_UI_SYSTEM_SPEC.md`, `GLASS_LAYERING_CHEAT_SHEET.md`, `primitives/CATALOG.md`, `LEGACY_DEPRECATION_MATRIX.md`
- Visual contracts in `design/EVIDENCE_CAPTURE_SPECIFICATION.md` and Top-Picks mocks

---

## Part 1 — Current State Assessment (Brutally Honest)

### 1.1 Does the Evidence Experience Feel Like the Calm, Premium, Clearly Layered Glass Treatment?

**Score from Evidence Lens: 4.8/10 (Partial token hygiene, core surfaces remain dense/legacy).**

The reference mocks (especially `02_EvidenceCenter_Desktop_v2.jpg` and `12_EvidenceCapture_Desktop_v2.jpg`) deliver:
- Frosted, translucent Layer 1 glass canvas with visible 4-sided breathing room framing luminous edges and depth.
- Clearly layered elevated `SurfaceCard`-style panels (Layer 2) with soft borders, subtle gradients, and generous internal padding — never dense tables or raw lists.
- Calm visual hierarchy: KPI-style summary cards, media previews in rounded glass containers, action buttons with premium glow (orange/teal accents on dark navy/maroon glass).
- Spacious, non-crowded compositions where evidence items appear as elegant cards/galleries with thumbnails, status pills, and chain-of-custody metadata.
- Mobile: Large thumb-friendly capture sheets with frosted cards, document previews, "Convert to PDF" flows inside elegant glass modals (see `04_Evidence_Document_to_PDF.jpg`).

**Current Reality (Live Code):**
- **EvidenceCenterPage** has adopted many semantic `ci-` utilities (`.ci-bg-overlay-faint`, `.ci-status-pill--*`, `ci-premium-hero/panel`) and updated status pills on 2026-05-17 (index.css:184-205), replacing some raw Tailwind colors. The table rows and filter bar use theme-aware overlays and `backdrop-blur-sm`.
- **However**, the dominant presentation is a **dense, spreadsheet-like `<table>`** (lines 926-1017) with `border-spacing-y-[6px]` and hover shadows on `<tr>` elements — exactly the legacy data-dense pattern the v2 mocks rejected in favor of card/gallery compositions.
- **CesEvidenceHierarchyPanel.tsx** (the CES evidence heart, rendered in multiple views) is almost entirely **hardcoded legacy dark styling**: `bg-[#0a1626]`, `border-white/15`, `text-white/70`, `bg-black/10`, `border-orange-500/40`, `text-orange-200`, `text-teal-200` (dozens of instances, e.g. 98-284, 516-545). Zero `GlassPanel`, `SurfaceCard`, `ci-glass-panel`, or token-driven classes. It bypasses the entire glassmorphism system and looks like a pre-Phase 1 internal tool.
- **No adoption of core primitives** in the main EvidenceCenterPage: 
  - Imports only `StalenessBanner, AriaLiveRegion, LoadingState, EmptyState` (line 28).
  - Zero `GlassPanel`, `SurfaceCard`, `DataGrid` (despite `DataGrid` being the canonical replacement for tables), `PageHeader`, `SectionHeader`, or `KpiCard`-style summaries.
- **ArtifactViewerPage.tsx** (linked from Evidence) uses raw `bg-[#081425]`, `border-white/10`, `bg-black/20` (602-696) — parallel dark system.
- **Inner decorative layering** (flagged by Agent 01): `ci-premium-hero` + `backdrop-blur-sm ci-bg-overlay-faint` (658), `ci-premium-panel` (756), `ci-command-rail` etc. inside the Shell Layer 1 — violating the strict 3-layer model and "magnification" contract.
- **Capture primitive** (`PhotoEvidenceCapture.tsx`): Functional (rear-camera + downscale) but renders with inline `--ci-` styles on bare buttons and divs (281-312). Not wrapped in `SurfaceCard`/`GlassPanel` per its own catalog note.
- **Mobile evidence** (`MobileIncidentExecutionPage.tsx:374+`): Uses `ci-card` in places (good) but the overall flow and `MobileEvidencePanel` remain simple stacked sections without the premium frosted capture sheet treatment in mocks.
- **EvidencePanel.tsx** (embedded in workflows): Mix of `ci-border`, `ci-card` and raw `border-white/10`, `bg-white/[0.02]`, `border-[#FFC107]/50` (206-290).

**Result:** The experience feels like a **functional, improved legacy data view** with a thin coat of `ci-overlay-*` paint — not the calm, premium, clearly layered glass showcase. The hierarchy panel and table are the biggest visual offenders. High-frequency operators (field clinicians capturing photos/signatures daily) see dense lists and raw dark trees, not the elegant layered glass that builds regulatory trust.

### 1.2 Primitive Adoption & Layering Fidelity (Evidence-Specific)

| Area                      | Primitives Used                  | Violations / Legacy                          | Mock Alignment |
|---------------------------|----------------------------------|----------------------------------------------|----------------|
| Main Evidence List        | Raw `<table>`, `ci-bg-overlay-*` | No `DataGrid`, no `SurfaceCard` cards       | Poor (table vs gallery cards) |
| CES Hierarchy Panel       | None (raw hex/rgba)             | Full parallel dark system                    | None |
| Capture (Photo/Signature) | `PhotoEvidenceCapture` / `SignaturePad` (bare) | Inline styles, no glass wrappers            | Partial |
| Detail / Artifact Viewer  | None                            | `bg-[#081425]` raw dark                     | Poor |
| Audit Log / Side Panels   | Custom bordered lists           | No `SurfaceCard` / `SectionHeader`           | Poor |
| Mobile Evidence           | `ci-card` (limited)             | Stacked sections, no BottomSheet premium glass | Partial |
| Layering inside Shell     | `ci-premium-*` + `backdrop-blur-sm` | Decorative nesting (Agent 01 violation)     | Violates 3-layer |

**Shell Framing:** EvidenceCenterPage root uses `flex flex-col h-full` + inner `mx-3 sm:mx-6` and sticky bars (656, 756) — same 4-sided contract violations noted in prior reviews for EvidenceCenterPage.

**Glass Tokens:** Status pills now correct (`ci-status-pill--success` etc. mapping to `--ci-success-*`). Overlays present but applied inconsistently and often as decoration rather than true Layer 2 elevation.

### 1.3 Specific File + Line Evidence (Absolute Paths)

**EvidenceCenterPage.tsx (C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\EvidenceCenterPage.tsx):**
- 658: `ci-bg-overlay-faint backdrop-blur-sm ci-premium-hero` (decorative inner glass).
- 756: Filter bar with `ci-premium-panel ci-command-rail mx-3 sm:mx-6 mt-2 rounded-xl` + sticky.
- 926: `<table className="w-full ... border-separate border-spacing-y-[6px]">` + 943: `<tr className="ci-bg-overlay-soft ... hover:shadow-[0_14px_28px_rgba(2,8,20,0.42)]">` (dense table).
- 1022: Audit as raw `<ul>` with borders.
- 28: Limited UI imports (no SurfaceCard/DataGrid/GlassPanel).
- 149-160: Good `STATUS_PILL` using canonical classes (recent win).

**CesEvidenceHierarchyPanel.tsx (C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\evidence\CesEvidenceHierarchyPanel.tsx):**
- 98: `<div className="rounded border border-white/15 bg-[#0a1626]">`
- 127-284: Repeated `rounded border border-white/10 bg-[#0a1626]` + `bg-black/10`, `border-orange-500/40`, `text-teal-200`, `text-orange-200` across year/quarter/month/event/task nodes, filters, leaderboard table.
- 279: Aside with same raw dark.
- Zero reference to `ci-*`, GlassPanel, or SurfaceCard.

**ArtifactViewerPage.tsx (C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\ArtifactViewerPage.tsx):**
- 602: `<div className="h-full overflow-auto bg-[#081425] px-6 py-5 text-white">`
- 616: `rounded-lg border border-white/10 bg-black/20`

**PhotoEvidenceCapture.tsx (C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\ui\PhotoEvidenceCapture.tsx):**
- 281-312: Inline `style={{ background: 'var(--ci-surface-elevated)', border: '1px solid var(--ci-border)' }}` on bare elements (no wrapper primitive).

**MobileIncidentExecutionPage.tsx (C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\MobileIncidentExecutionPage.tsx):**
- 375-380: Uses `ci-card` for evidence header/panel (partial progress).
- Capture/attach flow remains basic input + store mutation.

**Other integrations:**
- `FormSigningWorkspace.tsx:804` and `captureSignedFormSnapshot.ts` correctly feed `hhcEvidence` for signatures → Evidence Center (good backend linkage).
- `ecign/hhcEvidence.ts` and `services/hhcFormEvidence.ts`: Solid triplet enforcement and audit mirroring, but UI surfaces above do not yet showcase the resulting artifacts in premium glass cards.

**Cross-reference to prior audits:** Confirms Agent 01 (EvidenceCenterPage:658 backdrop nesting), Review_02 (4-sided violations on EvidenceCenterPage:656/756), and Phase 3 plans (none of the recommended primitive replacements executed on this surface).

### 1.4 Mobile vs Desktop Parity & Capture Flows

Desktop capture (via raw input in EvidenceCenter + PhotoEvidenceCapture) lacks the elegant frosted "Document Evidence Capture" card + "Convert to PDF Evidence" flow shown in mocks.

Mobile flows in incident page and CES tasks support attach but do not deliver the large preview + premium glass bottom-sheet experience or document-to-PDF conversion UI that regulators and clinicians expect from the v2 mocks.

Document-to-PDF (pdfAppendUtil, form print snapshots) exists in backend but has no corresponding premium evidence packet viewer in the Evidence Center UI.

---

## Unique Insight from Evidence Lens

> **Evidence Center is the single highest-leverage surface for proving (or disproving) the glassmorphism system to the people who matter most — field clinicians and surveyors.**  
> 
> Unlike Dashboard (mostly internal KPIs), Evidence is touched daily in the field (photo of a signed consent, incident documentation, competency checklist) and scrutinized in every audit ("show me the chain of custody for EVT-XXX"). The hierarchy panel and capture flows are where the "calm premium layered glass" either builds instant trust or feels like yet another clunky compliance tool. Because it mixes structured hierarchy + rich media previews + multi-step capture (camera → preview → PDF → promote → eCign signature linkage), any inconsistency in layering, breathing room, or primitive usage is immediately visible and operationally painful. Rebuilding Evidence early (as the second surface after Dashboard) does double duty: it hardens the most critical compliance artifact surface while simultaneously providing the strongest possible visual demonstration that the glass system is real, calm, and production-ready. The CesEvidenceHierarchyPanel is the canary in the coal mine — while it remains a raw `#0a1626` tree, the entire glass story is broken at the exact point of highest operational and regulatory load.

---

## Part 2 — Gaps vs. Target (Mocks + Specs)

- **Visual Language:** Mocks show spacious card compositions inside framed glass; current = dense table + raw dark tree.
- **Layering:** Mocks respect 3-layer (backdrop → main glass → elevated cards); current has decorative inner blurs + parallel dark systems.
- **Primitives:** Catalog explicitly lists `DataGrid`, `SurfaceCard`, `GlassPanel`, `PhotoEvidenceCapture` as ready — Evidence surfaces ignore most of them.
- **Capture UX:** Spec calls for <15s thumb-friendly native-feeling capture with clear instructions and PDF conversion; current is functional but visually plain.
- **eCign / Signature Integration:** Backend solid (`hhcEvidence`, snapshot capture); UI does not elegantly surface signed artifacts in layered glass cards with provenance.
- **Responsive/4-sided:** Same framing violations as other surfaces; mobile safe-area present but premium glass sheets missing.

**Verdict:** Evidence Center has received more token-level hygiene than some surfaces (status pills, overlays), but the core presentation and subcomponents remain pre-glassmorphism. It does **not** yet feel like the calm, premium, clearly layered treatment in the reference mocks. It still feels dense and legacy where it matters most.

---

**End of Agent 07 Evidence Center Analysis.**

**Next:** `Agent_07_Evidence_Center_4Phase_Plan.md` (4-phase remediation with early Evidence priority) will be produced immediately. All absolute paths, line references, and visual comparisons above are directly from live code + multimodal mock reads.
