# Skeleton — audits/coverage-audit.md

**Purpose:** prove (or disprove) that every source concept survived the conversion. Mechanical where possible: join the concept checklist against the storyboards' narration plans.
**Exemplar:** `docs/GAO-001-A-New-Journey/audits/coverage-audit.md`

## Required sections

1. **Method** — inputs used, join keys, what counts as covered (primary segment in a `node_unlock` tier — scene_start/complete-only coverage is a defect per invariants §9.1).
2. **Full coverage table** — every `conceptId` / source ref / assigned scene / primary narration id / verdict (covered / weak / missing). No sampling — every concept.
3. **Assessment coverage** — every quiz question or assessed behavior / its teaching home / strength verdict. Any assessment item without a home is CRITICAL.
4. **Findings** — numbered, severity-rated (CRITICAL / HIGH / MEDIUM), each with the exact scene file and section to fix, and a proposed resolution. Findings must be *actionable by the fix pass without re-auditing*.
5. **Verbatim & forbidden-string scan results** — character-match check on declared verbatim units; forbidden-phrase scan (invariants §2) across all storyboard copy.
6. **Narration volume check** — actual word count of all drafted narration scripts vs the ≥ ~4,800-word floor (invariants §9.5), per scene and total; and **expansion traceability** — every content expansion beyond the source inventory traced to a `policyRefs` citation (invariants §1) — untraceable expansions are CRITICAL.

## Done when

The table is exhaustive over the checklist; every finding names its fix location; a re-run after the fix pass would produce zero CRITICAL/HIGH rows.
