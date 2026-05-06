# KB-003 — Event IDs and folder paths

## Summary

**Event instance ids** follow a predictable `EVT-{DOMAIN}-{CATEGORY}-{YYYYMMDD}-{SEQ}` pattern derived from the regulatory event’s domain, category, and date, with a per-day sequence. **Folder paths** mirror a future object-store layout under `/events/{eventId}/...`.

## Event instance id (`EVT-...`)

**Composition** (see `eventInstanceId.ts`):

- **EVT** prefix
- **Domain code** — Mapped from `RegulatoryEvent.domain` (e.g. Governance → `GV`, QAPI → `QA`)
- **Category token** — Normalized from category / subtype / title (short alphanumeric)
- **Date** — `YYYYMMDD` from `event.date`
- **Sequence** — `001`, `002`, … per domain/category/date bucket; legacy ids may influence parsed sequence

**Stability:** Once assigned for a source event in the index, the id should remain stable for that demo dataset ordering.

## Logical folder layout

`resolveEventFolder(eventId)` returns paths such as:

| Logical artifact | Path pattern |
|------------------|--------------|
| Root | `/events/{eventId}` |
| Metadata | `.../metadata.json` |
| Tasks | `.../tasks` |
| Required forms | `.../forms/required/{formId}.json` |
| Completed forms | `.../forms/completed/{formInstanceId}.json` |
| Evidence | `.../evidence/{evidenceId}/metadata.json` |
| Approvals | `.../approvals/{approvalId}.json` |
| Audit log | `.../audit/audit-log.jsonl` |

These paths are **metadata** today (not necessarily physical disk folders in the browser).

## S3-aligned evidence object path

For binary storage alignment, helper `buildS3EvidenceObjectPath` uses:

`evidence/{policyId}/{workflowId}/{eventId}/{evidenceId}/{filename}`

The operational store also uses fallback tokens **`UNASSIGNED-POLICY`** and **`UNASSIGNED-WORKFLOW`** when policy or workflow is missing, so evidence remains classifiable.

## See also

- [KB-006](./KB-006-Evidence-Upload-and-Integrity.md)
- AWS mapping: `Builder/Documentations/AWS-CES/AWS_CES_DATA_MODEL.md`
