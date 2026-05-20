# Agent 07 — Evidence Center 4-Phase Remediation Plan

**Subagent Role:** Evidence Center & Capture Workflows Specialist  
**Surface:** Evidence Center (primary) + Capture Flows + CES Hierarchy + eCign/Signature/PDF Evidence Linkage  
**Version:** 1.0  
**Date:** 2026-05-17  
**Rationale for Early Attention:** Evidence is both the highest-frequency daily workflow for field operators (photo capture, signature evidence, document upload) **and** the strongest visual showcase surface for the entire glassmorphism system. Fixing it early delivers disproportionate regulatory trust, clinician delight, and proof that the calm premium layered glass treatment is real — not just shell-level scaffolding.

**Traceability:**
- `Agent_07_Evidence_Center_Analysis.md` (current state baseline)
- `Evidence_Reconstruction_Plan.md`, `Evidence_Canonical_Primitive_Usage.md`, `Evidence_Token_Application_Matrix.md` (prior Phase 3 artifacts — now accelerated)
- `Dashboard_Reconstruction_Plan.md` + `Dashboard_Canonical_Primitive_Usage.md` (reference template)
- `primitives/CATALOG.md`, `CANONICAL_UI_SYSTEM_SPEC.md`, `GLASS_LAYERING_CHEAT_SHEET.md`, `EVIDENCE_CAPTURE_SPECIFICATION.md`
- Mocks: `02_EvidenceCenter_Desktop_v2.jpg`, `07_EvidenceCenter_Dark.jpg`, `12_EvidenceCapture_Desktop_v2.jpg`, Mobile evidence (v2 + `04_Evidence_Document_to_PDF.jpg`)
- Key files: `src/policy/pages/EvidenceCenterPage.tsx`, `src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx`, `src/policy/components/ui/PhotoEvidenceCapture.tsx`, `src/policy/components/ui/DataGrid.tsx`, `GlassPanel.tsx`, `SurfaceCard.tsx`, `src/policy/pages/ArtifactViewerPage.tsx`, `src/policy/pages/MobileIncidentExecutionPage.tsx`, `src/policy/ecign/*`, `src/policy/evidence/*`, `src/policy/services/hhcFormEvidence.ts`
- `LEGACY_DEPRECATION_MATRIX.md`, `SURFACE_CHECKLISTS/` (Evidence entry to be created), `Responsive_Acceptance_Matrix.md`

---

## 1. Mission Statement

Rebuild the Evidence Center and all capture / hierarchy / review / PDF / signature flows as the **second canonical reference surface** (immediately after Dashboard) using only:
- Phase 2 Shell primitives (`ShellFrame` / `ShellContentFrame` + 4-sided constrained contract)
- Canonical UI primitives (`GlassPanel`, `SurfaceCard`, `DataGrid`, `PageHeader`, `SectionHeader`, `CiStatusBadge`, `ActionButton`/`UtilityButton`, `BottomSheetDrawer`, `PhotoEvidenceCapture`, `SignaturePad`)
- Locked glass tokens and strict 3-layer model (no decorative nesting)
- Zero raw visual values (no hex, rgba, arbitrary Tailwind, magic numbers)
- Full mobile-first premium glass treatment matching v2 mocks (frosted cards, thumb-friendly capture sheets, document-to-PDF flows)

**Outcome:** Evidence Center becomes the living demonstration that "calm, premium, clearly layered glass" is production reality for the most operationally critical and regulator-visible workflow.

---

## 2. Non-Negotiable Constraints (Inherited + Evidence-Specific)

- 100% canonical primitives only (promote any missing Evidence-specific variants to `primitives/CATALOG.md` first).
- Strict 3-layer glass: Layer 0 backdrop (TravelightBG) → Layer 1 main glass (`ShellContentFrame` / `GlassPanel`) → Layer 2 elevated `SurfaceCard`s only. No `backdrop-blur-sm` inside Layer 1, no `ci-premium-*` decorative overlays.
- 4-sided breathing room enforced on ≥1024px (visible Layer 0 frame around entire composition).
- Mobile: Bottom-sheet capture + review using `BottomSheetDrawer`; 44px+ targets; safe-area aware; one-handed friendly per `EVIDENCE_CAPTURE_SPECIFICATION.md`.
- All evidence bound to policy/workflow/event/task/requirement triplet (already strong in `evidenceModel` + `hhcEvidence` — preserve and surface elegantly).
- Signature + form evidence from eCign must appear in the same premium card language with provenance/audit links.
- Document-to-PDF packet assembly must feel like the elegant frosted flow in mobile mocks.
- Zero regression on existing backend (AWS Phase-1 demo, local IDB cache, triplet validation).

---

## 3. 4-Phase Plan (Early & Aggressive Evidence Focus)

**Overall Sequence:** Evidence receives **Phase 1 priority** (parallel track with Dashboard cleanup) because of its dual role as daily operator surface + glass showcase. Subsequent phases build on it as the second reference implementation.

### Phase 1: Evidence Shell Lock + Primitive Foundation + Capture Modernization (Week 1 Priority)

**Goal:** Make EvidenceCenterPage and core capture flows the first non-Dashboard surface to fully respect shell + primitives + 3-layer contract. Deliver visible "wow" on desktop + mobile capture.

**Key Work:**
- Wrap / refactor `EvidenceCenterPage.tsx` root inside `ShellContentFrame` (remove `h-full` root + negative mx hacks; enforce internal breathing margin around all card groups).
- Replace header/filter bar with `PageHeader` + `ShellCommandGroup` / `SearchField` + canonical buttons (`ActionButton` for primary Upload, `UtilityButton` for Refresh).
- Introduce `GlassPanel` (Layer 1) + `SurfaceCard` (Layer 2) wrappers for all sections (summary metrics, filters, list area, audit log).
- **Replace the dense table** (lines ~926-1017) with `DataGrid` + `SurfaceCard` per-row compositions or gallery `SurfaceCard` grid (match mock card language for evidence items: filename, triplet chips, status pill, thumbnail, actions).
- Migrate all `ci-premium-*` + inner `backdrop-blur-sm` to proper Layer 2 `SurfaceCard` usage only.
- **Capture flows (highest UX impact):**
  - Wrap `PhotoEvidenceCapture` usage (in EvidenceCenter + WorkflowExecutionPanel + MobileIncident) inside `SurfaceCard` or `BottomSheetDrawer` + premium glass preview area.
  - Add "Convert to PDF Evidence" action (leverage existing `pdfAppendUtil.ts` + `captureSignedFormSnapshot`) presented in elegant frosted card matching `12_EvidenceCapture_Desktop_v2.jpg` and mobile document-to-PDF mock.
  - Ensure `SignaturePad` (already primitive) appears in `SurfaceCard` context for eCign-linked signatures.
- Update `MobileIncidentExecutionPage.tsx` `MobileEvidencePanel` and any inline evidence UIs to use `BottomSheetDrawer` + `SurfaceCard` + `PhotoEvidenceCapture`.
- Create `Evidence_Canonical_Primitive_Usage.md` (update from prior) + `Evidence_Token_Application_Matrix.md` (update) + new `SURFACE_CHECKLISTS/Evidence.md` (modeled on Dashboard.md).
- **Deprecation start:** Flag raw table patterns and Ces raw styles in `LEGACY_DEPRECATION_MATRIX.md`.

**Deliverables:**
- EvidenceCenterPage + capture flows pass visual regression vs `02_EvidenceCenter_Desktop_v2.jpg` + `12_EvidenceCapture_Desktop_v2.jpg` at desktop + mobile breakpoints.
- Zero raw values in EvidenceCenterPage.tsx and capture files.
- 100% primitive usage in main flows.
- First playable "premium glass capture sheet" on mobile.

**Exit Gate:** Evidence surface checklist (new) ≥90% complete; before/after screenshots in `tmp-ui-verify-screenshots/`; sign-off from glass + evidence lenses.

### Phase 2: CES Hierarchy + List/Detail/Gallery Views (Week 2)

**Goal:** Eliminate the biggest legacy offender (CesEvidenceHierarchyPanel) and deliver card-based, filterable, board-style evidence views that feel calm and layered.

**Key Work:**
- **Full refactor of `CesEvidenceHierarchyPanel.tsx`:** Replace every raw `bg-[#0a1626]`, `border-white/15`, `text-white/70`, orange/teal hacks with:
  - `GlassPanel` / `SurfaceCard` for containers and nodes.
  - `CiStatusBadge` + `SectionHeader` for labels.
  - `DataGrid` or `SurfaceCard` grid for leaderboard and requirement lists.
  - Use `Tabs` or accordion primitives for year/quarter/month/event/task expansion (promote if needed).
- Build `EvidenceItemCard` (promoted variant of `SurfaceCard`) for individual evidence rows/galleries — include thumbnail preview, triplet metadata, status, signature provenance, download/artifact links.
- Standardize detail/review panels (in EvidenceCenter right column, drawers, ArtifactViewer) using `SurfaceCard` + `SectionHeader` + `ActionButton`/`UtilityButton`.
- Unify Evidence list (files table replacement) and hierarchy views behind consistent `SurfaceCard` + filter patterns (reuse Dashboard KpiCard-style summaries for "X evidence locked", "Y pending signature", compliance %).
- Update `ArtifactViewerPage.tsx` to compose inside Shell + use `GlassPanel`/`SurfaceCard` (remove `bg-[#081425]`).
- Wire rich media previews (PDF thumbnails, image evidence) inside elegant `SurfaceCard` containers with provenance from `hhcEvidence` / audit log.
- Ensure eCign signature evidence surfaces with the same card treatment (linked from FormSigningWorkspace flows).

**Deliverables:**
- `CesEvidenceHierarchyPanel.tsx` fully canonical (delete or deprecate any raw dark sub-components).
- Gallery + hierarchical evidence views match layered card aesthetic of `07_EvidenceCenter_Dark.jpg` and v2 mocks.
- Updated `Evidence_Canonical_Primitive_Usage.md` with new promoted `EvidenceItemCard`, `EvidenceKpiSummary`, `EvidenceBoardColumn`.

**Exit Gate:** Zero raw values in all evidence/* and related regulatory/ces components; visual match on hierarchy + detail views; accessibility scan pass (focus, status not color-only, live regions for uploads).

### Phase 3: Mobile Capture Excellence + Document-to-PDF + eCign Deep Integration (Week 3)

**Goal:** Make every capture and packet-assembly flow feel native-premium on mobile and desktop, with seamless signature/PDF linkage.

**Key Work:**
- Implement full mobile evidence capture sheet using `BottomSheetDrawer` + `PhotoEvidenceCapture` + frosted `SurfaceCard` preview + "Use this photo" / "Retake" actions (exact visual language of `04_Evidence_Document_to_PDF.jpg`).
- Add "Convert to PDF Evidence" + packet assembly UI (leverage `pdfAppendUtil`, form snapshots, multi-evidence bundling) presented as premium glass step in the capture flow.
- Deepen eCign integration in UI: After signature lock, automatically surface the signed artifact in Evidence Center as a first-class `SurfaceCard` with "Signed by X at Y via eCign — view full chain" link (use `captureSignedFormSnapshot` + `hhcEvidence` record).
- Add rich evidence detail drawers (desktop `RightDrawer`, mobile bottom) for audit log, supersede history, surveyor packet context — all in `SurfaceCard` layers.
- Performance: Lazy-load thumbnails/previews; use existing `demoEvidenceRuntimeCache` + IDB for instant mobile feel.
- Responsive matrix: Tablet 2-col max; desktop multi-card inside framed glass; mobile single column + sheets.
- Update all consumers: `WorkflowExecutionPanel`, `EvidencePanel`, CES task execution, Onboarding evidence, etc.

**Deliverables:**
- Mobile capture + PDF conversion matches or exceeds v2 mock quality.
- Signature evidence from eCign appears automatically in premium Evidence view.
- Full responsive + accessibility validation report for Evidence (modeled on Dashboard template).
- `Evidence_Accessibility_Validation_Report.md` completed with real results.

**Exit Gate:** Playwright + human visual regression on all capture flows vs mocks; <15s end-to-end capture happy path (per spec); 44px touch targets everywhere; live-region announcements for upload/signature success.

### Phase 4: Deprecation, Hardening, Cross-Surface Consistency & Showcase (Week 4)

**Goal:** Remove all legacy evidence families, lock Evidence as second reference surface, publish final validation, and use it to drive remaining surfaces.

**Key Work:**
- Execute deletions per `LEGACY_DEPRECATION_MATRIX.md`: any remaining raw evidence cards, custom tables in evidence contexts, hardcoded dark panels in CesEvidenceHierarchyPanel (once refcount == 0).
- Expand ESLint rules (forbid raw colors/shadows in evidence files) and add runtime guard (dev-only) that warns on non-canonical wrappers inside Evidence routes.
- Create final `Cross_Surface_Consistency_Report.md` section for Evidence (compare vs Dashboard as reference).
- Update `primitives/CATALOG.md`, `UI_PRIMITIVE_OWNERSHIP_MAP.md`, and `UI_TOKEN_CONTRACT_SPEC.md` with any Evidence-driven promotions (`EvidenceItemCard`, PDF packet viewer primitive, etc.).
- Full visual regression package (desktop v2 + mobile + dark/light) + Playwright baselines tied to the exact Top-Picks mocks.
- Hand Evidence off as the "second living reference" — update all Phase 3/4 docs and checklists to cite EvidenceCenterPage + capture flows as examples alongside Dashboard.
- Optional: Add "Evidence Showcase" toggle or tour step that highlights the glass layering in the rebuilt surface.

**Deliverables:**
- Evidence surface checklist 100% + signed.
- Zero legacy evidence code paths remaining.
- Published "Evidence as Glass Showcase" case study (screenshots + code pointers) for team.
- Updated `MASTER_UIUX_IMPLEMENTATION.md`, `Phase4_Final_Readiness_Package.md` with Evidence sign-off.
- All eCign / PDF / signature evidence flows demonstrably premium and compliant.

**Exit Gate:** Evidence passes every gate that Dashboard passed (zero raw, 100% primitives, 4-sided verified, accessibility, responsive matrix, mock fidelity). No new legacy introduced. Physical contraction of legacy LOC in evidence-related files.

---

## 4. Per-Surface / Per-Component Reconstruction Process (Evidence Edition)

For every evidence file/subsystem:
1. **Audit** — Raw value grep + legacy component inventory (use same script as Dashboard).
2. **Map** — Update `Evidence_Canonical_Primitive_Usage.md` + Token Matrix.
3. **Refactor** — Compose exclusively from shell + primitives + tokens.
4. **Wrap** — Ensure entire composition (not just outer) has breathing room inside the glass.
5. **Validate** — Visual vs mocks, a11y, responsive, performance (capture <15s).
6. **Document & Delete** — Update checklists, deprecate matrix; delete definition files when refcount hits zero in prod routes.
7. **Evidence** — Attach before/after + Playwright artifacts.

---

## 5. Risk Areas & Mitigations Specific to Evidence

- **Complex hierarchy state** (CesEvidenceHierarchy): Mitigate by incremental refactor (keep behavior identical while swapping primitives one subtree at a time); extensive unit tests on `cesEvidenceHierarchy.ts`.
- **Capture performance on low-end mobile:** Keep existing downscale logic; add progressive enhancement for preview.
- **eCign integration timing:** Signature completion must still fire `hhcEvidence` POST even during UI migration — backend is unchanged.
- **PDF generation latency:** Show optimistic `SurfaceCard` preview + loading state; actual PDF attachment happens async.
- **Surveyor / auditor expectations:** Preserve every existing filter, audit log entry, triplet link, download URL — only presentation layer changes.
- **Dark-only Ces panel:** Provide light-mode parity using same tokens (glass system already supports Care Indeed light/dark).

---

## 6. Success Definition & Metrics

- **Visual:** EvidenceCenter, capture flows, hierarchy, ArtifactViewer, and mobile evidence panels match or exceed the calm layered premium treatment in `02_EvidenceCenter_Desktop_v2.jpg`, `07_EvidenceCenter_Dark.jpg`, `12_EvidenceCapture_Desktop_v2.jpg`, and mobile document/PDF mocks (4-sided frame, frosted cards, luminous edges, generous breathing).
- **Technical:** 0 raw visual values in all evidence files; 100% canonical primitive usage; DataGrid + SurfaceCard/GlassPanel everywhere tables/cards existed.
- **UX/Compliance:** Capture-to-attach <15s; full triplet + eCign signature provenance visible in elegant cards; chain-of-custody audit log presented in layered glass.
- **Gates:** Evidence surface checklist complete; accessibility + responsive reports signed; visual regression package approved; legacy families in evidence domain physically deleted.
- **Showcase Value:** Evidence becomes the second reference surface cited in all future work (after Dashboard).

**Unique Evidence-Lens Success Signal:** When a field clinician or surveyor opens Evidence Center on a real device and says "this finally feels premium and trustworthy," Phase 1-2 for Evidence is complete.

---

## 7. Immediate Next Actions (Post This Report)

1. Subagent 07 hands off `Agent_07_Evidence_Center_Analysis.md` + this plan.
2. Prioritize Phase 1 work on `EvidenceCenterPage.tsx` + `CesEvidenceHierarchyPanel.tsx` + `PhotoEvidenceCapture` wrappers (parallel to any remaining Dashboard items).
3. Produce updated `Evidence_Canonical_Primitive_Usage.md`, `Evidence_Token_Application_Matrix.md`, and `SURFACE_CHECKLISTS/Evidence.md` within 48h.
4. Run first visual regression capture against the v2 Evidence mocks.
5. Coordinate with shell / primitive owners for any missing `KpiCard` / `BoardColumn` / `EvidenceItemCard` promotions.

---

**End of Agent 07 Evidence Center 4-Phase Plan.**

This plan places Evidence at the front of the Phase 3/4 operational surface wave precisely because of its frequency + showcase power. When complete, the Evidence experience will finally match the calm, premium, clearly layered glass treatment promised by the reference mocks — and will serve as living proof for every subsequent surface.

All absolute file paths, line numbers, and mock references are authoritative and ready for execution handoff.
