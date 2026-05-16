# localStorage quota and eCIgn loop mitigation

## Summary

`reg-execution-v2` could exceed the browser quota because Zustand `partialize` persisted full **`EvidenceDoc`** rows including **`localDataUrl`** (large `data:` HTML from certificates and signed packages). Repeated eCIgn finalization appended multiple audit rows with large `before` / `after` payloads. Failed `setItem` surfaced as `QuotaExceededError` and broke the execution UI.

## What changed

1. **Persist serialization**
   - **`partialize`** now maps **`evidence`** through **`stripEvidenceLargePayloads`** so **`localDataUrl`** is never written to `localStorage`.
   - **`taskAuditByEventId`** is capped and each row’s **`before`** / **`after`** values are compacted when they exceed a safe serialized size.

2. **Same-session preview**
   - **`uploadEvidence`** calls **`stashDemoEvidenceDataUrl(evidenceId, dataUrl)`** so in-memory rows and the runtime cache still support preview and download links during the session without persisting the blob.
   - **`resolveEvidenceDataUrl`** (used from **`ArtifactViewerPage`** and **`WorkflowExecutionPanel`**) prefers `doc.localDataUrl` when present, then the session cache.

3. **eCIgn duplicate uploads**
   - Before creating new evidence, **`uploadEvidence`** returns an existing locked row when **`linkedFormInstanceId`**, **`artifactType`**, and session id match, so repeated effect runs do not allocate new artifacts or audit chains for the same finalized signing session.

4. **Persist `version: 3` migration**
   - **`migrateRegExecutionV3Shape`** strips large evidence payloads from rehydrated state and runs the same task-id remap as identity migration so metadata stays coherent.

5. **Quota-safe `setItem`**
   - The JSON storage wrapper catches **`QuotaExceededError`** (and code `22`), logs in development, and skips the write so the in-memory store can continue; metadata-first persistence reduces how often this triggers.

## What was not done

- IndexedDB or S3-backed binary storage is not wired; the product remains demo-local with metadata-first persistence and session-only payload cache. A future adapter can replace **`stashDemoEvidenceDataUrl`** without changing the evidence metadata model.

## Acceptance notes

- Operators should not need to clear `localStorage` for normal recovery; migration and stripped persists shrink stored JSON automatically.
