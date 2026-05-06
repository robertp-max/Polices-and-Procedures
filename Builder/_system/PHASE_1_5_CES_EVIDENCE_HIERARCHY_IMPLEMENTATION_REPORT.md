# Phase 1.5 CES Evidence Hierarchy + Weighted Completion Report

## Scope implemented

Implemented Phase 1.5 as an extension of the existing Phase 0/1 evidence foundation.

- No second evidence engine created.
- No second task engine created.
- Canonical evidence core from Phase 0/1 preserved.
- Existing routes/print behavior preserved.

## Files changed

- `src/policy/evidence/cesEvidenceHierarchy.ts` (new)
- `src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx` (new)
- `src/policy/pages/EvidenceCenterPage.tsx`
- `scripts/checkEvidencePhase15.ts` (new)
- `package.json`

## Hierarchy model implemented

Evidence Center now supports CES operational hierarchy rendering:

- Year
- Quarter
- Month
- Event Instance
- CES Task
- Execution Requirements

Hierarchy rollups include:

- total events/tasks/requirements
- completed tasks/requirements
- total/completed story points
- completion %
- audit readiness %
- required/certified/missing/locked evidence counts
- pending signature count
- blocked task count

## Execution requirement model

Implemented virtual execution requirements on top of existing CES tasks (computed, not persisted as a second engine):

- `FORM_COMPLETION`
- `SUPPORTING_EVIDENCE_UPLOAD`
- `SIGNATURE_REQUIRED`
- `REVIEW_REQUIRED`
- `CERTIFICATION_REQUIRED`
- `LOCK_REQUIRED`

Each requirement includes:

- `requirement_id`
- `task_id`
- `event_id`
- `policy_id`
- `workflow_id`
- optional `form_id`, `evidence_id`, signer fields
- `title`, `type`, `status`
- `completionPercentage`
- `weightPercentage`
- story points context
- assignment/due context
- audit trail references
- action needed guidance

## Weighted scoring model

- Tasks keep story points from canonical CES projection; fallback defaults to `1` when missing.
- Requirement-level completion is weighted inside each task.
- Task weighted completion derives from requirement completion × requirement weight.
- Event operational completion derives from weighted task completion × story points.
- Audit readiness is calculated separately using requirement completion rollups (not identical to operational completion).

## eCign signature progression behavior

Signature requirement progression implemented as partial-capable completion:

- default signer target = `2` for form tasks unless explicit signer set is present
- one approved signature = partial completion (`50%` for two-signature flow)
- full signer target reached = `100%`

This behavior feeds:

- task weighted completion
- package state progression
- pending-signature counts in hierarchy metrics

## Evidence package state mapping

Task package state mapping implemented:

- `DRAFT`
- `IN_PROGRESS`
- `PARTIAL_CERTIFICATION`
- `CERTIFIED`
- `LOCKED`
- `SUPERSEDED`
- `EXPIRED` (reserved)
- `REJECTED`

Rule highlights:

- uploaded evidence + incomplete signatures => `IN_PROGRESS`
- partial signatures => `PARTIAL_CERTIFICATION`
- all required requirements complete => `CERTIFIED`
- locked evidence present => `LOCKED`
- rejected evidence => `REJECTED`
- superseded evidence preserved historically and mapped accordingly

Orphan evidence behavior:

- shown separately as “Needs Review / Orphan Evidence”
- excluded from completion, audit readiness, and leaderboard scoring contributions

## Leaderboard scoring

Added enterprise performance panel using story points plus quality/compliance factors.

Tracked metrics:

- story points completed
- evidence packages certified
- on-time completion %
- overdue items
- rejected evidence count
- audit-perfect events

Implemented scoring formula:

- `performanceScore = storyPointsCompleted + certificationBonus + zeroDefectBonus + onTimeBonus - overduePenalty - rejectedEvidencePenalty`

This avoids rewarding raw task count alone.

## Evidence Center UI updates

- Added top-level Evidence Center mode switch:
  - `CES hierarchy`
  - `File ledger`
- Kept existing Phase 0/1 file ledger functionality intact.
- Added hierarchy filters and compact expandable hierarchy rows.
- Added event/task/requirement rows with weighted completion and audit-readiness indicators.
- Added contextual right panel for hierarchy selection guidance.
- Added leaderboard table below hierarchy.

## Tests/checks run

- `npm run check:evidence-phase15`
  - hierarchy renders with current event data
  - weighted task requirement completion
  - missing evidence blocks full audit readiness
  - one-of-two signatures => partial completion
  - two-of-two signatures => complete signature requirement
  - orphan evidence separation/exclusion
  - leaderboard rejected-evidence penalty behavior

- `npm run check:evidence-phase01`
  - all existing Phase 0/1 checks still pass after Phase 1.5 extension

## Known gaps

- Signature progression currently infers signer target for form tasks when explicit signer metadata is absent; deeper eCign packet-level signer binding can further refine this.
- Hierarchy requirements are computed at runtime (intended for this phase), not yet persisted for historical requirement-level trend analytics.
- `EXPIRED` package state is reserved in mapping but requires future backend timing/TTL semantics for full activation.
- Evidence Center still maintains its existing file-ledger demo store path for local demo mode and does not yet fully unify physical metadata storage with CES hierarchy projections.

## Recommended next phase

Proceed to **Phase 2 — Event/task/form binding enforcement and certification gate hardening**:

- enforce requirement-complete gates for certification/close actions across all execution surfaces
- persist requirement-level snapshots for audit-history comparison
- deepen eCign signer identity binding into requirement rows
- add integration tests across workflow drawer, mobile execution, Evidence Center hierarchy, and audit export views
