# Recommendation and Execution Sequence

## Primary Recommendation
Adopt a **source-authority + durability-first** remediation strategy before adding new survey simulation features.

In short:
1. Stabilize data authority.
2. Centralize operational persistence.
3. Wire live adapters.
4. Then expand simulation UX.

## EHR Boundary (Mandatory)
Assume an external EHR remains the clinical system of record.

Do not implement as native modules in this app:
- Full patient charting.
- Full clinical records system.
- Medication administration workflow.
- Claims processing.
- Clinician scheduling as a replacement calendar/EHR scheduler.

Allowed clinical-domain expansion:
- EHR adapter and read-only clinical evidence ingestion.
- De-identified/demo imported records for simulation and testing.
- EHR evidence reference model (metadata + links).
- OASIS-E2 review assistant, POC draft/review assistant, documentation-gap detector, clinical traceability views, and evidence packet builder that consume imported/EHR evidence.

## Why This Sequence
Current blockers are not mostly UI gaps. The highest risk is that compliance state is split across:
- runtime local/browser state,
- local file-backed backend stores,
- seed datasets,
- generated artifacts,
- narrative documentation.

Adding more features before resolving this will amplify drift and reduce audit defensibility.

## Execution Plan

### Phase 0 (Immediate, 1-2 weeks): Authority Declaration and Drift Gates
- Declare authoritative artifacts per subsystem (master controls, workflows, forms, operational gaps).
- Add CI checks for:
  - generated artifact freshness,
  - schema validation,
  - cross-artifact parity (counts/IDs).
- Deprecate/label stale route backups and old pages.

**Exit criteria**
- Build fails on artifact drift.
- Every key dataset has explicit authority metadata and owner.

### Phase 1 (2-4 weeks): Persistence Hardening
- Move critical execution/audit state from localStorage and local JSON files to centralized storage.
- Add immutable audit append semantics for evidence lifecycle actions.
- Add actor identity binding for workflow actions.
- Define and implement an EHR evidence reference model (policy/workflow/event -> external evidence metadata/link bindings).

**Exit criteria**
- Workflow state survives browser/device changes and server restarts.
- Audit trail can be queried centrally for survey evidence.

### Phase 2 (3-6 weeks): Live Adapter Integration
- Implement IA operational live adapters replacing seed-only operational gaps.
- Implement regulatory live feed adapter replacing curated seed feed.
- Implement trigger ingestion adapters (incident/complaint/sentinel sources) to call trigger materialization.
- Implement live EHR adapter and read-only clinical evidence ingestion pipeline.
- Implement de-identified import path for simulation fallback when live integration is unavailable.

**Exit criteria**
- IA phase status transitions from seed-only to live-backed for operational/regulatory context.
- Trigger-based workflows can be produced from real system signals.
- Clinical evidence references resolve through adapter/import pipelines without creating native chart records.

### Phase 3 (4-8 weeks): Survey Simulation Productization
- Build dedicated survey simulation workspace/module:
  - scenario setup,
  - deficiency scoring,
  - corrective action simulation,
  - evidence packet output,
  - OASIS-E2 review assistant,
  - POC draft/review assistant,
  - clinical record traceability view,
  - documentation-gap detector.
- Integrate with hardened persistence and live adapters from prior phases.
- Enforce read-only clinical evidence consumption and prohibit native EHR record authoring.

**Exit criteria**
- End-to-end survey rehearsal uses centralized, auditable state.
- Deficiency outputs are reproducible and traceable to source evidence.
- Survey simulation consumes EHR/imported evidence and does not function as a replacement EHR.

## Suggested Program KPIs
- Drift incidents per release (target: 0 after Phase 0).
- % critical workflow actions server-persisted (target: 100% after Phase 1).
- % IA responses using live adapters vs seed records (target: >80% after Phase 2).
- Survey rehearsal reproducibility pass rate (target: >=95% after Phase 3).

## Implementation Guardrails
- No file moves required for current remediation.
- Prioritize compatibility wrappers rather than broad refactors.
- Keep read-only UX stable while migrating storage and adapter layers.
- Add architecture review gate: reject features that introduce native charting, MAR, claims, full records, or scheduling replacement behavior.

## Final Position
A credible survey-readiness platform is achievable with the existing foundation, but only if the next increments prioritize **authority, durability, adapter-driven clinical evidence connectivity, and strict non-EHR-replacement boundaries** before additional presentation-layer expansion.
