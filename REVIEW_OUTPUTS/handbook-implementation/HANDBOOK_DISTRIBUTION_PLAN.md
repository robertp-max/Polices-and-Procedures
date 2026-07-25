# Handbook Distribution Plan

## Current status: no distribution has occurred or is authorized

CI-HR-HB-2026 Draft 1.0 is `COUNSEL_REVIEW_DRAFT_NOT_EFFECTIVE`. Distribution and assignment
to employees is a **post-approval-only** action. This document describes the plan for when
that gate is cleared — it is not a record of any distribution that has taken place.

## Do-not-distribute-while-draft

- The handbook must not be assigned, emailed, printed for signature, or otherwise distributed
  as current policy while any release gate remains `OPEN`/`IN_REVIEW`/`BLOCKED` or any of the 8
  named approvals is unsigned (see `HANDBOOK_RELEASE_GATE_REPORT.md`).
- Every reader surface currently carries a watermark banner (visible, screen-reader accessible,
  and present in print CSS) stating the draft/non-effective status, precisely to prevent a
  printed or screen-captured copy from being mistaken for effective policy.
- Acknowledgment collection is disabled at the application level (`acknowledgmentEnabled = false`,
  baked into the generated projection) — employees cannot be asked to sign off on a draft.

## Planned assignment model (post-approval)

Once an approved, effective build exists:

1. Distribution/assignment will be **version-bound** — an assignment references a specific
   approved version (doc id + version + content hash), not "the handbook" generically.
2. Assignment triggers the acknowledgment flow for that specific version only.
3. A new effective version does **not** automatically inherit prior acknowledgments — it
   requires a fresh assignment and fresh acknowledgment collection.

## 2022 acknowledgments

- Acknowledgments collected against the retired 2022 handbook are **not** carried forward to
  CI-HR-HB-2026. The legacy 2022 PDF is tombstoned in the `/history` route as retired, marked
  do-not-distribute, and explicitly excluded from generating any new acknowledgment obligation.

## Material revisions

- Any material revision made after a version becomes effective requires a **new assignment**
  (and new acknowledgment collection) under the same version-binding rule above — a revised
  document does not silently inherit acknowledgments made against an earlier version.

## Open dependency

Distribution cannot begin until `HANDBOOK_RELEASE_GATE_REPORT.md`'s 21 gates are closed and the
8 approvals in `HANDBOOK_APPROVAL_RECORD.md` are signed. No target date is set in this review.
