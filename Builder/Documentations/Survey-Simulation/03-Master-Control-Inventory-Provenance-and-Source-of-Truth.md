# Master Control Inventory Provenance and Source-of-Truth Decision

## Executive Answer
`Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json` is **not orphaned** and should be treated as the **runtime source of truth for the app-facing master-control dataset**.

`Builder/Documentations/MASTER_CONTROL_INVENTORY.md` should be treated as a **human-readable companion export** (governance/audit narrative), not the runtime source.

No file moves are required.

## Evidence Chain

### 1) Runtime directly consumes the JSON model
- `src/policy/data/masterControlInventory.ts` sets `MASTER_CONTROL_INVENTORY_SOURCE_PATH` to `/Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json` and fetches it at runtime.
- `src/policy/components/MasterControlInventory.tsx` calls `loadMasterControlInventorySeed()` on mount and renders the controls table/detail drawer.
- Route is active at `/compliance/master-controls` in `src/App.tsx`.

### 2) Markdown inventory is not consumed by runtime
- No runtime importer/path points to `Builder/Documentations/MASTER_CONTROL_INVENTORY.md`.
- The markdown file functions as narrative control inventory documentation.

### 3) The JSON and markdown appear sibling outputs from the same authoring cycle
- Both show generated date `2026-04-23`.
- Both align on 104 total controls.
- Markdown describes source scope and extraction rules; JSON carries machine fields (`status`, `trigger_condition`, `data_source`, `system_module`) required for structured consumption.

## What the JSON Represents
Best interpretation from current evidence:
- **Primary runtime seed artifact** for master-control inventory visualization.
- Likely **generated/exported from an upstream authoring process** (manual or scripted), then stored in-repo for app fetch.
- Not yet tied to a visible compiler script equivalent to `compileWorkflows.ts`.

## Current Drift/Duplication Risks

### Risk 1: Parallel artifacts without enforced synchronization
- JSON and markdown can diverge because there is no observed compile/validation job coupling them.

### Risk 2: Runtime mapping truncates source fields
- `MasterControlSourceRecord` includes `last_verified_date`, `next_verification_date`, `trigger_condition`, `escalation_owner`, `system_module`.
- `mapMasterControlRecord()` projects only a subset into `MasterControlItem`, dropping operational verification fields.

### Risk 3: Status semantics are static unless external updater exists
- JSON status defaults can remain `UNKNOWN` without a validated ingestion/update loop.

### Risk 4: App conveys “control inventory” authority while relying on a static file
- Operational confidence can be overstated unless source freshness and update provenance are governed.

## Recommendation (No File Moves)

### Decision
Keep files where they are. Assign clear authority:
- **Authority A (runtime):** `MASTER_CONTROL_INVENTORY_DATA_MODEL.json`
- **Authority B (narrative):** `MASTER_CONTROL_INVENTORY.md`

### Governance Controls to Add
1. Add a single build script (for example `scripts/buildMasterControls.ts`) that:
   - validates JSON schema,
   - verifies control ID uniqueness and count consistency,
   - regenerates or validates markdown summary sections.
2. Add CI checks to fail when:
   - JSON/markdown control counts differ,
   - control IDs differ,
   - schema validation fails.
3. Extend runtime model gradually to include at least:
   - `last_verified_date`,
   - `next_verification_date`,
   - `trigger_condition`,
   - `escalation_owner`.
4. Add explicit provenance metadata to JSON `meta`:
   - generation script name/version,
   - commit hash,
   - source snapshot timestamp.

## Final Position
- JSON exists where it is because it is the app-consumed structured control model.
- It behaves as runtime seed/source in the current architecture.
- Duplication risk exists between JSON and markdown due to missing enforced synchronization.
- Recommended path is **authority clarification + validation pipeline**, not relocation or refactor.
