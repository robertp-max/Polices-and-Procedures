# QAPI Slice 1 — Durable Registries + Ingest/Dedup + Generate-from-Registries

**Goal:** Change Packet Studio so that selecting a QAPI quarterly packet lets Brad/server pull existing period-scoped records and generate the packet (or forms) without requiring a fresh free-text dump every time.

**New workflow:**
1. Data dump **or** manual entry first → durable registries (with dedup).
2. New dump checks natural keys against existing rows → import / merge / reject + audit.
3. Packet Studio → select QAPI quarterly → generate from registries for the chosen reporting period.
4. Users re-generate on demand; only prompt for a new dump when required sources are missing or user explicitly refreshes.

## Deliverables in this slice

| Artifact | Path (target in repo) | Purpose |
|----------|-----------------------|---------|
| Registry types | `src/policy/packets/qapi/registries/qapiRegistries.ts` | SoR shapes for complaints, feeder audits, AE/RCA, infections, PIPs, CAPs, KPIs, population, meeting, sources |
| Ingest + dedup | `src/policy/packets/qapi/ingest/ingestQapiDump.ts` | Parse raw mock / dump → upsert into registries with natural-key dedup |
| Period pull | `src/policy/packets/qapi/registries/loadPeriodRegistries.ts` | Load `QapiPeriodRegistries` for a reporting period |
| Studio adapter | `src/v6/screens/packets/generateFromRegistries.ts` | New generate path that prefers registries over free-text dump |
| PacketStudio wiring notes | docs | How to change PacketStudioScreen so generate uses registries when complete |

## Natural keys used for dedup

- ComplaintCase: `complaint_id`
- FeederAudit: `audit_id` + `workflow_id`
- AdverseEvent: `event_id`
- RootCauseAnalysis: `rca_id`
- InfectionCase: `infection_id`
- PipTrigger: `trigger_id`
- PipMaster: `pip_id`
- CAP: `cap_id`
- ActionItem: `action_id`
- KpiObservation: `metric_id` + `month`
- PopulationSnapshot: `reporting_period_id`
- SourceRegisterEntry: `source_label`

## Production rules enforced

- Missing numeric → `null` (never invent 0).
- Display of 0 complaints requires `ZeroComplaintAttestation`.
- Missing complaint source → blocking `MISSING_SOURCE` finding (not shown as verified zero).
- PHI narratives stay in `*_restricted` / vault fields; packet only gets `packet_summary_deid`.
- Every row carries `RecordStamp` (agency, period, source_artifact_id, integrity hash, version).

## Mapping to Q2 mock (attached)

Your `QAPI Q2 2026 — SYNTHETIC RAW MOCK D.txt` and `mockq2synth.md` already contain the rows needed for:

- 7 complaints (CMP-Q2-001 … 007)
- 7 adverse events + RCAs
- 7 infections (5 HAI + 2 community)
- 8 PIP triggers + 8 PIPs
- 5 open CAPs/RCAs
- 40 feeder audits (batched)
- Population 112 reviewed / 100 active
- Visit utilization Apr–Jun
- KPI dashboard rows
- Attendance / quorum
- GBE-001 … 005

These become the first end-to-end test case for ingest → registries → generate.

## Next steps after this slice

1. Wire real store (Dynamo or existing multi-writer packet store) behind the registry interfaces.
2. Server `POST /api/packets/:id/rebuild-model` that consumes `QapiPeriodRegistries`.
3. Remove EMPTY_VALIDATION from Studio generate path.
4. Add ComplaintCase lock-gate reconciliation + ZeroComplaintAttestation UI.
5. B21 fact ledger.

## How to land in the repo

Copy the files under `artifacts/qapi-slice1/` into the corresponding paths on the `qapi` branch, then:

1. Implement a thin in-memory or file-backed store for UAT (replace with Dynamo later).
2. Add a “Load period registries” action in PacketStudioScreen when template = QAPI quarterly.
3. If registries completeness is green → enable Generate without requiring a new dump.
4. Keep the existing dump path as “Ingest / Refresh sources”.
