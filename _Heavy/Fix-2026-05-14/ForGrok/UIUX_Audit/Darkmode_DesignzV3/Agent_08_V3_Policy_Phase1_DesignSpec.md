# Agent 08 — Policy Library, Detail, Lifecycle & Taxonomy (V3) — Phase 1 Design Application Specification

**Agent:** 08 — Policy Library & Detail (V3)  
**Primary Surfaces Owned:** LibraryPage, PolicyDetailPage (all tabs), PolicyLifecyclePage, TaxonomyPage, FrameworkPage, AchcSurveyAlignmentPage, print views.  
**Date:** 2026-05-18  
**Visual North Star Reference:** V3 floating card language applied to document-heavy, regulatory, multi-tab content (strong borders, calm separation of sections, StatusBadgeV3 for lifecycle/ACHC).  
**Status:** Claude-Ready (V3)

## 1. V3 Translation for Policy Surfaces

Policy content has historically been the most "inventive" and fractured. V3 forces unification:

- Library grid results = individual `FloatingGlassCard variant="task"` or dedicated `PolicyResultCardV3` (title, version, status, ACHC badges, last updated).
- Detail view: each major section (Statements, Procedures, References, Amendments, FAQ) becomes its own stacked floating card inside the main host, with clear 4-sided borders and breathing room between sections.
- Tabs and lifecycle states rendered via `StatusBadgeV3` + FilterBarV3.
- No more large single glass blocks or `.glass-*-lib` ad-hoc classes.

The calm authority feeling is especially important here for regulatory users.

## 2. Major Current Defects

Heavy use of custom `.glass-interactive-lib`, large monolithic containers for tab content, inconsistent card treatment, legacy hex borders, and local inventions that will never match `Dashboard_v3_Floating_Cards.jpg`.

## 3. Required for Codegen

- All library cards and detail sections must be thin compositions on `FloatingGlassCard` + `StatusBadgeV3`.
- Lifecycle/ACHC tagging must use the single semantic urgency + status system (Agent 15 + 11).
- Print views must still obey the same typography and card spacing tokens (even if they drop some glass effects for ink).

## 4. Data & Endpoints

Policy search, detail fetch (with all 9+ tabs), lifecycle transitions, ACHC crosswalk queries, taxonomy hierarchy — all must be defined with shapes in the master endpoint matrix.

## 5. Claude-Ready Certification

- [x] V3 floating card language fully mapped to document-centric, high-regulation surfaces
- [x] Strong dependency on Agent 15 `FloatingGlassCard` + `StatusBadgeV3` + `FilterBarV3`

**Agent 08 Signature:** V3 Execution — 2026-05-18
