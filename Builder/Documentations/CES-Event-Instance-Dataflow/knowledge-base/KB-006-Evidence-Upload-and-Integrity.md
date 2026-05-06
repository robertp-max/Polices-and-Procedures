# KB-006 — Evidence upload and integrity

## Summary

Every evidence document is tied to **`eventId` and `taskId`**, carries **policy/workflow/form** traceability, stores a canonical **`objectPath`**, and records **integrity metadata** (`checksum`, `fileSize`, `mimeType`, `uploadedAt`) that must not be altered after creation.

## Binding rules

- **No floating evidence:** Upload flows require a task (explicitly or via generated “anchor” tasks from forms/steps).
- **Folder path** must include the **event id** segment under the logical `/events/{eventId}/evidence/...` tree.
- **Object path** follows `evidence/{policy}/{workflow}/{eventId}/{evidenceId}/{filename}` pattern (with UNASSIGNED fallbacks when needed).

## Integrity fields

| Field | Role |
|-------|------|
| `checksum` | Detect tampering or accidental corruption. |
| `fileSize` | Prove payload size at ingest. |
| `mimeType` | Classify file type for review tooling. |
| `uploadedAt` | Immutable ingest timestamp (distinct from `createdAt` where both exist). |

**Immutability:** After evidence is created, application logic should not allow mutating integrity fields; corrections happen via **supersede** or **new upload** patterns (per future policy), always leaving an audit trail.

## Operator checklist

1. Pick the **correct task** (the requirement you are proving).
2. Confirm **policies** and **workflow** context if the upload dialog exposes them.
3. After upload, verify the file appears under that task in the **Evidence** tab.

## See also

- [KB-004](./KB-004-Tasks-Derivation-and-Stable-Identity.md)
- [KB-008](./KB-008-Audit-Trail-and-Hash-Chain.md)
