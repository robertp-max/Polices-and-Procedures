# Handbook Approval Record

## Current state

All 8 required named approver roles are **unsigned**. No approval has been captured for
CI-HR-HB-2026 Draft 1.0. This document is a record of the approval mechanism and its current
(empty) state — it is not itself an approval.

| # | Approver role | Status |
|---|---|---|
| 1–8 | 8 required named approval slots | Unsigned |

Because none of the 8 approvals are signed, and none of the 21 release gates are closed (see
`HANDBOOK_RELEASE_GATE_REPORT.md`), the handbook remains blocked from becoming effective.

## What an approved build will capture

Once all approvals are signed and all gates close, an approval record for a given build is
expected to capture the following fields:

| Field | Purpose |
|---|---|
| Doc id | Stable identifier (e.g. `CI-HR-HB-2026`) |
| Version | The specific draft/release version approved (e.g. `1.0`) |
| Effective date | Date the handbook becomes policy |
| Approval date | Date the approval was signed |
| Next review date | Date by which the handbook must be reviewed again |
| Content hash | SHA-256 of the approved content, binding the approval to exact content |
| Source-manifest hash | SHA-256 of the source manifest, binding the approval to the exact source package |
| Superseded id | The prior effective handbook id/version this approval replaces (if any) |

## Status today

None of these fields have been populated for CI-HR-HB-2026 — there is no approved build yet.
This section describes the intended data model for a future approval event, not a record that
currently exists.
