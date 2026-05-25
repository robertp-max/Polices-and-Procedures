# CES Decision Brief — Migrate vs. Bound

**Decision required by:** 2026-05-31 (2-week SLA from 2026-05-17)
**Decision owner:** Program Owner + Executive Sponsor (joint)
**Status:** OPEN

## Why this is a Phase 0 blocker

CES is the largest of the 6 active visual dialects (full parallel navy token system, `CesCard`/`CesLayout`, opaque canvas, no 4-sided frame, custom Kanban). Every Phase 1 enforcement artifact — ESLint rules, runtime shell-frame assertion, visual regression baselines, `no-restricted-imports` boundary — must know whether CES is:

- **(a) In-contract**, in which case it is a Phase 2/3 migration target and `CesCard` enters the legacy retirement list; or
- **(b) Out-of-contract**, in which case it is a documented sub-product with its own visual rules, a sunset date, and an explicit lint allow-list for its file tree.

Building enforcement infrastructure without this answer guarantees that the lint rules and Visual Language Police are born already compromised by an unresolved exception. **This is the precise mechanism that produced the current drift.**

## Option A — Full Migration to Canonical Glass

**Scope:** CES Board, MyTasks, Hierarchy, Layout, EvidenceHierarchyPanel rebuilt on `ShellContentFrame` + `SurfaceCard`/`GlassPanel` + canonical tokens. `CesCard`, `CesLayout`, navy palette deleted.

**Cost:** ~8–12 weeks of focused work in Phase 2/3. High visual win.
**Risk:** CES domain team disruption; potential workflow regression for operational users mid-shift.
**Mitigation:** Per-surface flag; CES domain team embedded in rebuild; engine/data contract tests.

## Option B — Formally Bounded Sub-Product

**Scope:** CES file tree (`src/policy/**/ces/**` and named siblings) is declared a sub-product with documented visual rules. ESLint allow-list permits navy tokens *only* within the bounded tree. Sunset date set (recommended ≤12 months).

**Cost:** ~2 weeks to document, set up allow-list, and publish sub-product spec. Low visual win in the short term.
**Risk:** Permanent fracture if the sunset date slips; precedent for other domains to demand the same treatment.
**Mitigation:** Hard sunset clause; no other sub-product carve-outs permitted; quarterly re-justification in Exception Registry.

## Recommendation (Architect)

**Option A**, conditional on the CES domain team committing 1 embedded engineer for the duration of the rebuild. Option B is acceptable only if Option A is operationally infeasible, and must carry a sunset date no later than end of Phase 4.

## Decision Record (to be completed)

| Field | Value |
|-------|-------|
| Decision (A or B) | |
| Signatory (Program Owner) | |
| Signatory (Executive Sponsor) | |
| Date | |
| Sunset date (if B) | |
| Embedded CES engineer (if A) | |
| Exception Registry entry # | 1 |
