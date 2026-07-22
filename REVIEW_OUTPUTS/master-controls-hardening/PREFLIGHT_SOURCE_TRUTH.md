# PREFLIGHT_SOURCE_TRUTH — Control Register hardening

Generated: 2026-07-22. Verified by direct inspection, not assumed.

## Source line
| | |
|---|---|
| Repository | robertp-max/Polices-and-Procedures |
| Worktree | `…_worktrees/master-control-register-hardening` |
| Branch | `feature/master-control-register-hardening` |
| Base SHA | `c323f071` (off `release/myjourney-brad-nolan-live-fix-2026-07`; the current line that owns `/compliance/master-controls`) |
| Route owner | `src/v6/screens/pageviews/MasterControlsScreen.tsx` → `/compliance/master-controls` |

> NOTE: the prompt's cited baseline `feat/admin-access-signature-authority @ 5be3589…` is **not** the current line. The live master-controls owner today is the release line above (it carries the Vendor/Contractor UI + Registry nav just committed). Confirmed drift — working against the current owner.

## Control counts (proven)
- **Public JSON metadata: 104 controls** (`MASTER_CONTROL_INVENTORY_DATA_MODEL.json`).
- **Generated documentation TS** (`masterControlDocumentation.generated.ts`) references control IDs **up to CTRL-116**, but only **~19 distinct IDs** carry doc records → large documentation backlog (most controls have no approved doc body).
- The historical "104 JSON + 12 TS (CTRL-105…116) = 116 runtime" split is **plausible but must be confirmed** in the reference phase: where CTRL-105…116 are *defined as controls* (vs. only documented) is the next check.

## Duplicate registry copies (CONFIRMED — key finding)
Four byte-identical copies of the canonical JSON exist (all sha256 prefix `9983d8cc04ac`, all 104 controls):
```
public/MASTER_CONTROL_INVENTORY_DATA_MODEL.json
public/data/MASTER_CONTROL_INVENTORY_DATA_MODEL.json
public/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json
public/Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json
```
They are in sync **now**, but there is **no single canonical source** and no drift gate — exactly the maintenance hazard the mission targets.

## Data-source topology (proven)
- `src/policy/data/masterControlInventory.ts` — loads controls **at runtime from the public JSON** via `attemptedPaths` fallbacks (`payload.controls`), imports doc records from `masterControlDocumentation.generated.ts`, and contains an **inline prototype readiness heuristic** (`computeReadiness`: returns based on `requiredDocumentRefs.length===0 || evidenceRequirements.length===0 || signoffRequirements.length===0`). `FALLBACK_CONTROLS = []`.
- Runtime authority is therefore **client-side public JSON**, not a server-authoritative store — matches the mission's core gap.

## Confirmed gaps (this preflight)
1. No single canonical registry — 4 duplicate public JSON copies, no generator provenance header, no drift gate.
2. Client-JSON is the runtime authority (no server API / persistence for operational state).
3. Prototype readiness heuristic inline in `masterControlInventory.ts` (not a dedicated deterministic engine; overloaded status).
4. Documentation backlog — only ~19 of 104 controls have doc records.
5. Split definition surface (104 JSON vs. CTRL-105…116 in TS) — to be reconciled with IDs preserved.

## To verify next (Phase: references + identity)
- Exact definition source of CTRL-105…116 (control vs. doc-only).
- Every policy/form/workflow reference resolved against `policyCorpus.ts`, `formTitles.generated.ts`, `formsLibraryDataset.ts`, workflow/event registries → `CONTROL_REFERENCE_RECONCILIATION.{md,json}`.
- Known suspects: CTRL-001 (`CL-PA-*` / `CL-FM-001-003`), CTRL-002 (`OP-FM-011`), CTRL-032 (`CO-FM-020`), CTRL-042 (BAA policy + template).

## Phased execution plan (this is a multi-phase program — not one pass)
- **P1 (done):** preflight truth + focused branch. ← this file
- **P2:** reference + identity reconciliation (typed `ControlReference`, resolve all refs, preserve IDs) + gap reports.
- **P3:** one canonical registry + generator + drift gates (`controls:generate`/`verify`), consolidate the 4 JSON copies to generated outputs.
- **P4:** deterministic readiness engine (single source consumed by every screen/report) + content-status on docs.
- **P5:** server-authoritative API + approved persistence; entities (definition/scope/evidence/verification/deficiency/CAP/signoff/audit) behind the existing auth boundary.
- **P6:** evidence/verification/deficiency-CAP/signoff wiring; Facility Life-Safety + Required Postings child registers.
- **P7:** canonical UI (full register, dossier, route-backed, a11y) + adjacent-workspace links.
- **P8:** full test suite + all gates + remaining deliverable reports; push.

No deployment. No destructive git. Stage explicit paths only.
