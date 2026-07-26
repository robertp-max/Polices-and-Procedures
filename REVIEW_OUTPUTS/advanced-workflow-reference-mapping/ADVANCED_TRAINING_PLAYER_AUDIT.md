# Advanced Training — Player Audit

Source: `apps/employee-journey/app/journey/_data/advancedTraining.ts`.

## The 4 modules (exact order)

| # | Module ID | Purpose | Launch mechanism |
|---|---|---|---|
| 1 | `cms-485` | Build and defend the CMS-485 Plan of Care and its compliance linkages | Canonical player via `getModulePlayerEntry(id).launchRef`, same tab |
| 2 | `qapi` | Lead and take part in Quality Assessment & Performance Improvement | Canonical player via `getModulePlayerEntry(id).launchRef`, same tab |
| 3 | `oasis-e2-soc` | Complete an OASIS-E2 Start of Care assessment accurately | Canonical player via `getModulePlayerEntry(id).launchRef`, same tab |
| 4 | `documentation-matters` | Apply CMS documentation-defensibility standards to your notes | Canonical player via `getModulePlayerEntry(id).launchRef`, same tab |

## Launch behavior
- Each `AdvancedTrainingCard` carries `launchRef` (resolved from `getModulePlayerEntry(id)`) and `playerAvailable` (boolean).
- Cards launch the **canonical main-app player** — the same player used by the module's regular (non-Advanced) assignment — in the **same browser tab**. There is no separate "Advanced-only" player implementation; Advanced Training is a curated launch surface over the existing canonical players.
- `verifyJourneyCorrections.ts` asserts "every Advanced card launches a canonical player route": for RN, all 4 modules resolve `playerAvailable === true` and a non-null `launchRef`.

## Role scope notes shown alongside the cards
| Role | Scope note |
|---|---|
| RN | Clinical assessment, Plan of Care, OASIS, QAPI, and documentation application within RN scope and agency assignment. |
| DON | Clinical oversight, survey readiness, QAPI leadership, Plan of Care governance, OASIS oversight, and documentation defensibility. |
| PT | Therapy assessment and Plan of Care application. OASIS activity remains limited to authorized therapy assessors and applicable episodes. |
| ADM | Leadership / oversight learning. Completion does not expand clinical scope, authorize OASIS assessment, or replace the DON/qualified clinician. |

Note: the ADM scope note explicitly disclaims scope expansion — ADM's inclusion is leadership/oversight learning, not a grant of clinical authority.

## Duration / prerequisites / policy refs
Each card also surfaces `durationMinutes`, `passThreshold`, `prerequisites`, and `policyRefs`, all pulled live from the generated module/policy catalogs (`getGeneratedModule`, `getGeneratedPolicy`) rather than hard-coded — so the Advanced view stays consistent with the canonical module data if it changes.
