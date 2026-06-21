# QA12.b — 56-View Design QA & Subview Consistency Report

**Date:** 2026-06-21
**Context:** Canonical 56 views (54 router-mapped routes + overlays/auth conceptual). The 17 missing states (20 subviews) from Phase 12.2.a are **embedded subviews/drawers/modals/toggles inside existing parent routes**, NOT new parent routes. Total router views/pages remain 56.

**Commanded:** Agents working in parallel reviewing each page view. Output here immediately after QA.

## Executive Summary
- Route registry: 54 entries (confirmed via source count).
- Shell routes (excl. login): 53 + login separate.
- No new top-level routes introduced for Phase 12.2.a subviews.
- Core subview primitives (VeilDrawer, VeilModal) exist and are used.
- Many parent pages have partial-to-good implementations of required embedded states (e.g. Supervisor, AppendixF).
- Inconsistencies and gaps remain in full fidelity to blueprints, typography enforcement, and complete subview coverage.
- Build & no-litter checks passed (see separate logs).

## Verified Route Count & Structure
- V6_ROUTES.length = 54 (includes /login as auth).
- No bare /:param , good.
- All 17 subview examples map inside:
  - /journey/supervisor : Supervised Visit Logging Drawer + Learner Picker (2 subviews)
  - /journey/appendix-f : Signature Drawing Overlay (Preceptor/Journey Signature Canvas)
  - /journey/admin : Syllabus / Course Path Timeline builder (toggle view)
  - /workflows + /workflows/:id/swimlane : Workflow Detail Drawer + Swimlane Card Modal
  - /onboarding-v2/batches/:batchId : Gate Checklist Expander + Evidence/Signature sub-tabs
  - /onboarding-v2/governance : Override Request Modal
  - /admin/users : Permission Override Matrix
  - Calendars, ces/calendar, evidence viewers, eSign: other drawers/modals/agendas/toolbars
- Sidebar (routePresentation.ts) correctly exposes only canonical top-levels; detail routes hidden from primary nav.

## High-Level Inconsistencies Found (initial)
1. Documentation count drift: Some docs say "54 router +2", registry is 54 total including login. Shell view count messaging slightly ambiguous vs "56 in the application shell".
2. Subviews partially implemented: Supervisor implements picker+drawer states but layout/details may diverge from exact spec (e.g. checklist grid, signature link). Need per-screen deep review.
3. Typography: Heavy use of `font-light` good; occasional `font-medium` on titles ok. Check no 600+ or bold violations.
4. Missing full subview coverage in:
   - Syllabus builder toggle in JourneyAdmin (mostly static table + metrics).
   - Gate expander / sub-tabs in OnboardingV2Batch.
   - Workflow drawers/modals.
   - Agenda views, conflict drawer, CES flowchart inline, preview toolbar, eCIgn overlay.
5. Some screens still use V6RoutePlaceholder (incomplete visual parity).
6. Hardcoded colors / non-token usage may exist in custom markup; review agents to flag.
7. TOC active state in Appendix F / Guide is present (good).
8. No evidence of new parent routes violating "subviews only".

## Next: Parallel Agent Reports
Agents 1-5 will produce:
- group-specific findings
- per-page inconsistencies vs V6 design (tokens, motion, a11y, states)
- subview implementation gap analysis vs Phase 12.2.a blueprints
- Suggestions

Reports appended as *-qa-report.md .

See individual agent outputs below / in sibling files.

## Recommendations (prelim)
- Enforce subview completeness before further seeding.
- Add unit or visual tests asserting exact subview triggers and states for the 17.
- Centralize more subview orchestration (e.g. shared LearnerPicker component).
- Audit all .tsx for `font-(semibold|bold|[6-9]00)` violations + replace with designless-approved (300/500 only).
- Update V6_APP_MAP and V6_PHASE_... to lock "56 total router-mapped views" language consistently.
- Provide a "56-view health" dashboard badge or dev overlay.

**Status:** In-progress. Full agent output + detailed suggestions to follow.
