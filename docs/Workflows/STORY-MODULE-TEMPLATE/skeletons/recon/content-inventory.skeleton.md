# Skeleton — recon/content-inventory.md

**Purpose:** ground truth of everything the module currently teaches, so design/storyboards convert content instead of inventing it. This file seeds the concept checklist (design/03) and the coverage audit.
**Exemplar:** `docs/GAO-001-A-New-Journey/recon/content-inventory.md`
**Method:** read-only codebase recon. Cite `file:line` for every claim. If you can't find it, say so — never infer content.

## Required sections

1. **Source location & shape** — where the module's content lives (component file, data file, both), how pages/cards/lessons are structured, and the catalog row (`modules.ts`) verbatim.
2. **Page-by-page inventory** — for each source page: every concept, mission/definition phrase, table (row by row), enumerated list (item by item), citation (with the exact label the source uses — flag mislabels against invariants §4), named scenario, and image/media asset. Number concepts for later `conceptId` seeding.
3. **Assessment inventory** — the module's quiz/assessment verbatim (questions, options, correct answers, thresholds) or its `method` behavior if not quiz-based. Note any secondary/legacy question pools and whether they're reconciled.
4. **Current narration inventory** — existing narration text per page, verbatim or closely summarized, with a page-by-page **coverage verdict**: which inventory concepts the current narration covers vs. omits.
5. **Current-delivery defects** — anything shipping today that violates the invariants (forbidden wording, citation mislabels, coverage gaps), with `file:line`. These become independent fix tasks, not redesign scope.
6. **Richness verdict** — one of: `rich` (full page content exists), `partial` (outline/stubs), `thin` (title + method only). `thin` triggers the Phase-1 stop gate.

## Done when

- Every concept is enumerated and numbered with a source ref — a coverage auditor could verify "concept #23 exists at file:line" without re-reading the source.
- The assessment is captured verbatim.
- The richness verdict is stated explicitly.
