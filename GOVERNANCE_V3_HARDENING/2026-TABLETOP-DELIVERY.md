# Governing Body Boardroom Simulation (2026) — Delivery Report

**Scope:** ground-up rebuild of the V3 tabletop as an interactive Governing Body boardroom
operating simulation. New isolated feature at `src/v6/screens/governance/v33/tabletop2026/`.
**No V1/V2 implementation was used. No old-tabletop layout/assessment CSS was imported.**
**Nothing committed, pushed, merged, or deployed** — awaiting user validation.

## Verification (at delivery)
- `tsc -p tsconfig.app.json` → **0 errors**
- `vitest` (tabletop2026) → **67/67 pass** across 7 files (workflow coverage, source cutoff,
  quorum/conflict, scoring/critical-failures, remediation, group mode, records)
- `vite build` → **success**
- Live UAT (worktree dev server, `localhost:5188`): Hub mounts (`.bs-root`) with **5 pack cards**
  (Q1–Q4 + Annual); Solo session mounts with forest command bar, meeting clock, packet-readiness
  gate, KPI stat tiles, contradiction highlights, evidence inspector, and the Decision & Record
  rail (disposition chips + motion builder); **0 console errors; no horizontal overflow at 1592px.**

## Architecture
- `engine/` — `caseTypes.ts` (root contract: Exhibit, DecisionNode, Inject, CasePack,
  TabletopDiagnostic, 7-dimension 1000-pt scoring), `scoring.ts`, `diagnostics.ts`, `sourceCutoff.ts`,
  `workflowTriggerEngine.ts`, `attemptVariants.ts`, `groupState.ts` (quorum/recusal-aware reducer),
  `evidenceSnapshot.ts` (commits via canonical compliance store; disconnected ⇒ no completion).
- `data/` — `qapi2026Normalized.ts` (re-exports `QAPI_2026`), `qapi2026Supplemental.ts` (labeled
  GB-SUP records), `workflowCoverage.ts` (GV-WF-01…14 matrix), `remediationBank.ts` (11 competencies,
  ~20 True/False items, targeted selection).
- 22 UI components — `TabletopHub`, `TabletopSession` (+ `BoardBookPanel`, `BoardTableWorkspace`,
  `DecisionAndRecordRail`, `MeetingRecordTimeline`, `EvidenceInspector`, `PacketReadinessGate`,
  `MotionBuilder`, `VotePanel`, `ExecutiveSessionWorkspace`, `MinutesComposer`, `ActionRegister`,
  `SurveyorDefense`, `QuorumConflictEngine`, `AttemptResults`, `RemediationChoiceDialog`,
  `GuidedTrueFalseRemediation`, `RemediationCenter`, `GroupSessionLobby`, `FacilitatorConsole`,
  `ParticipantWorkspace`).
- `tabletop2026.css` — single stylesheet, `.bs-*` classes scoped under `.bs-root` inside `.v33-scope`
  (forest/ivory/bronze/gold, editorial numerals, 8px micro-labels, responsive, reduced-motion).
- `tests/` — 7 vitest files.
- **Wiring (orchestrator):** `MyJourneyApp` routes the tabletop assignment → `TabletopHub`
  (`onLaunch(caseId, mode)` → `TabletopSession`); `GovernanceScreen` imports the one CSS file.

## Five-case manifest (authored volume)
| Pack | Exhibits | Decision nodes | Pass |
|------|---------:|---------------:|-----:|
| Q1 — Baseline Under Pressure | ~40 | 18 | 950 |
| Q2 — The Packet Cannot Be Trusted | ~36 | 18 | 950 |
| Q3 — Growth Outruns Control | ~37 | 18 | 950 |
| Q4 — Closure Is Not the Same as Control | ~30 | 20 | 950 |
| Annual — The Year the Board Must Defend | ~59 | 32 | 970 |

Quarterly packs meet the 35–45 exhibit / 14–18 node minimums (Q4 exhibits ~30, slightly under).
The Annual pack meets the 32-node minimum but its ~59 exhibits are **below** the 90–120 target
(representative, not full volume) — see Remaining.

## Scoring & gates
1000-pt model over 7 dimensions (evidence integrity 150, meeting legality 150, QAPI judgment 200,
workflow authority 150, decision proportionality 150, records/forms 100, surveyor/transfer 100).
Quarterly pass ≥950 + zero critical errors; Annual ≥970 + zero critical + all 14 workflows.
The critical-error gate overrides numeric score; overreach and under-response are scored.

## Remediation
`RemediationChoiceDialog` (Try another full case / Guided True/False / Review evidence) →
`GuidedTrueFalseRemediation` (one statement, immediate feedback, controlling workflow + forms + why,
100% correction required, never substitutes for a fresh primary) → `RemediationCenter` (progressive
depth by failure count). Deterministic alternate forms via `attemptVariants`.

## Honest remaining work
- **Annual exhibit volume** ~59 vs 90–120 target; **supplemental records** need a count/label audit
  (foundation reported 12 GB-SUP; verify all are surfaced as exhibits). Q4 exhibits ~30 (low end).
- **Live UAT depth:** verified hub + Solo session mount, Round-0 gate, board table (KPIs/
  contradictions/inspector), decision rail, and code-composed board-book + meeting-record + results;
  did **not** yet manually drive all five packs and both modes through every round to a scored
  pass/fail + surveyor + transfer, nor a full Facilitated Group vote-matrix run.
- **Screenshots:** the preview pane cannot composite frames here, so UAT used DOM/accessibility
  inspection instead of image capture.
