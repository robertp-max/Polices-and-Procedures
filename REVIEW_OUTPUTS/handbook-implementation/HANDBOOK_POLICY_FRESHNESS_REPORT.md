# Handbook Policy Freshness Report

_Handbook plan §6. Source: the package manifest's freshness counts. Status:
**SURFACED AND BLOCKING; per-policy reconciliation not performable here**._

## Aggregate freshness (from the controlled manifest, as of 2026-07-24)

| Metric | Count |
|---|---|
| Policies in supplied corpus | 272 |
| Past recorded next-review date | 205 |
| **Cited by this handbook AND past next-review** | **73** |

## Treatment

Freshness is **not hidden**. It is:
- surfaced on the release-status page as **gate #16 (Policy corpus review)**, which
  is **OPEN**, and therefore
- one of the conditions that keeps the handbook **BLOCKED** from becoming effective.

A handbook section linked to an unresolved controlling policy remains blocked from
release until the policy owner reapproves, updates, or documents an authorized
extension.

## Why a per-policy list is not generated here (honest)

The per-policy freshness detail depends on `policy_metadata2.json` (referenced in the
manifest's `source_policy_metadata`, SHA-256 `72f1dcad…`), which is **not included in
the delivered package**. Only the aggregate counts are available. Producing the exact
list of the 73 cited-and-stale policies (with each policy's recorded next-review date)
requires that metadata source or a live query against the main-app policy corpus, and
is part of the gate-#16 reconciliation — it is not fabricated here.

## Required resolution states (per cited policy, at reconciliation)

`current-and-approved` · `reapproved-without-change` · `revised` ·
`authorized-temporary-extension` · `retired/replaced` · `mapping-review-required`.
