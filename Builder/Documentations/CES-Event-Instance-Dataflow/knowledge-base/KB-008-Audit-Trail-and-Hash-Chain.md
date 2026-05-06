# KB-008 — Audit trail and hash chain

## Summary

Significant mutations append **`EventExecutionAuditEvent`** records per `eventId`. Each record includes **entity type/id**, **action**, **actor**, optional **reason**, **recordVersion**, and **hash chain fields** (`prevHash`, `currentHash`) so a future append-only backend can verify ordering and tamper resistance.

## What gets audited

Typical categories (non-exhaustive; see store implementations):

- **Event instance** create/update/cancel/certify
- **Task** create/update/delete/restore/generate/status transitions
- **Form instance** generation / status-impacting changes where instrumented
- **Evidence** create/delete
- **Approval** decisions where wired

## Append-only discipline

**Client demo:** Audit entries are appended to in-memory/local arrays; previous entries are not edited in normal code paths.

**Production target:** DynamoDB conditional writes or S3 WORM prefixes (see AWS CES docs) enforce physical immutability.

## Hash chain per event

For each new audit row:

- **`prevHash`** links to the prior row’s `currentHash` for the same `eventId`
- **`currentHash`** is computed over canonical payload fields (implementation-specific)

Verification endpoint (future AWS): `GET /audit/hash-chain/verify` — local adapter exposes a stub verifier for development parity.

## UI

The **Audit Trail** tab lists events chronologically with enough detail for supervisors. **Technical Details** may show raw structures for support.

## See also

- [KB-012](./KB-012-Troubleshooting-and-FAQ.md)
- `Builder/Documentations/AWS-CES/AWS_CES_API_CONTRACT.md`
