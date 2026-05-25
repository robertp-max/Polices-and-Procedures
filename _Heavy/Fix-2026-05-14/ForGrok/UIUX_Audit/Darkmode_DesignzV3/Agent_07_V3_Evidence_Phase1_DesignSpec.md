# Agent 07 — Evidence Center & Capture Workflows (V3) — Phase 1 Design Application Specification

**Agent:** 07 — Evidence Center & Capture (V3)  
**Primary Surfaces Owned:** EvidenceCenterPage (all filter/hierarchy states), ArtifactViewer, signature flows, upload, detail drawers, MobileIncidentExecution evidence stage.  
**Date:** 2026-05-18  
**Visual North Star Reference:** V3 dark floating cards (adapt the calm, bordered card language to heavy document + image + PDF workflows)  
**Status:** Claude-Ready (V3)

## 1. V3 Translation for Evidence (High-Volume Regulatory Surface)

Evidence is one of the most important daily surfaces. V3 must make grids of evidence items, detail panels, and upload zones feel like collections of calm, floating, bordered glass cards — never dense or edge-flush.

- Evidence cards in grid view: each item is its own `FloatingGlassCard` with strong borders, thumbnail + metadata.
- Detail / viewer: the PDF/image viewer area becomes a large elevated floating card.
- Filters and hierarchy: left rail or top floating control cards.
- Upload zones and signature areas: distinct floating cards with clear separation.

This will dramatically improve the "premium regulatory" feel compared to current dense layouts.

## 2. Major Gaps vs V3

Current Evidence uses many flush tables, single large containers, and legacy glass classes. Almost none of the cards have the full visible 4-sided floating treatment shown in the V3 Dashboard mock.

## 3. Specific Recommendations for Codegen

- New or heavily updated `EvidenceItemCard`, `EvidenceGrid`, `ArtifactViewerPanel` as V3 floating compositions.
- Drawer content for detail must use elevated V3 floating treatment.
- Strong coordination with Agent 15 for document-specific pattern variants.

## 4. Data & Endpoints (Evidence V3)

Full inventory of evidence queries, upload mutations, signature flows, folder hierarchy — all must be listed with recommended shapes in the master prompt. (See existing Evidence_Reconstruction_Plan for baseline shapes; they remain valid but UI wrapping changes to floating cards.)

## 5. Claude-Ready Certification

- [x] V3 floating card language fully mapped to the unique needs of evidence grids, viewers, and capture flows
- [x] Clear primitive and pattern needs called out for Agents 01/15

**Agent 07 Signature:** V3 Execution — 2026-05-18
