# Agent 10 — Calendar, Scheduling & Task Projection Surfaces (V3) — Phase 1 Design Application Specification

**Agent:** 10 — Calendar & Scheduling (V3)  
**Primary Surfaces Owned:** MasterCalendarPage (all URL sub-states), StaffingCalendar, event/task projections, Sprint toggles.  
**Date:** 2026-05-18  
**Visual North Star Reference:** V3 floating cards applied to temporal views (day cells, event chips, right panels as elevated cards).  
**Status:** Claude-Ready (V3)

## 1. V3 Translation for Calendar

Temporal surfaces must feel calm and scannable:

- Day cells and event items = `CalendarEventCardV3` (thin `FloatingGlassCard variant="task"` or dedicated minimal variant).
- Main calendar grid lives inside a large floating host card.
- Right detail panels and task projections = elevated floating cards.
- Filters = `FilterBarV3`.

Strong coordination with Agent 06 (CES) and Agent 15 (shared TaskCardV3 / CalendarEventCardV3).

## 2. Current State

Mixed adoption, custom chips, inline styles on day cells, edge-touching in some views.

## 3. Codegen Direction

Use only the V3 pattern library. CalendarEventCardV3 must be pixel/perceptually identical to TaskCardV3 in other contexts (Agent 15 visual regression matrix).

## 4. Claude-Ready Certification

- [x] V3 floating language mapped to temporal + projection surfaces
- [x] Explicit dependency on Agent 15 shared event/task patterns

**Agent 10 Signature:** V3 Execution — 2026-05-18
