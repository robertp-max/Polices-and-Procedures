# Audit Store — Firestore Backend (P1-C)

Implements ADR-0001: durable audit ledger on Firestore. This is an **opt-in,
inactive** backend. JSONL remains the runtime default; Firestore runs only when
explicitly selected, and is validated against the Firestore **emulator** only —
not real dev Firestore, not a deployed multi-instance runtime.

## Canonical hashing note (P1-B)
The JSONL backend preserves the existing JSONL storage location and public
facade while using **version-2 round-trip-stable canonical hashing** for new
events (`canon_version: 2`, undefined-valued object keys omitted). It is **not**
byte-identical to the pre-P1-B writer; pre-versioning events whose undefined
fields were dropped by `JSON.stringify` are reported `LEGACY_UNVERIFIABLE` (suspected_reason: JSON_DROP, diagnostic only)
and are never rewritten.

## Backend selection (fail-closed)
| `AUDIT_STORE_BACKEND` | Behavior |
|---|---|
| absent | JSONL (default) |
| `jsonl` | JSONL |
| `firestore` | real Firebase Admin Firestore adapter (or an injected binding in tests) |
| any other value | startup/configuration failure |

- Firestore initialization failure → hard failure (`AuditStoreInitError`); **never** a silent JSONL fallback.
- Firestore is **not** selected merely because Firebase env vars exist — only `AUDIT_STORE_BACKEND=firestore` activates it.

## Accepted configuration (server-side only)
| Variable | Purpose |
|---|---|
| `GOOGLE_CLOUD_PROJECT` / `GCLOUD_PROJECT` | GCP project id (Application Default Credentials) |
| `FIRESTORE_DATABASE_ID` | optional named database (default `(default)`) |
| `FIRESTORE_EMULATOR_HOST` | `host:port` of the Firestore emulator; auto-detected by the Admin SDK |
| `AUDIT_STORE_BACKEND` | `jsonl` (default) or `firestore` |

Credentials use ADC only — no service-account JSON key is read from the repo.
No browser Firebase SDK, no client Firestore access, no Security Rules, no App
Check are added by this work.

## Document layout (safe, hashed, path-safe ids)
```
audit_streams/{sha256(stream)}                        -> stream head { stream, last_hash, sequence }
audit_streams/{sha256(stream)}/events/{zeroPad(seq)}  -> immutable event document
audit_idempotency/{sha256(stream::idempotency_key)}   -> reservation { stream, sequence }
```
Raw stream names, emails, patient/employee names, policy content, PHI, and
secrets never appear in document ids/paths — only sha256 hashes and zero-padded
sequence numbers.

## Transaction (one atomic append)
1. Read idempotency reservation → return the existing event on a repeat.
2. Read stream head.
3. Allocate next sequence; preserve prior hash.
4. Construct the canonical v2 event with **retry-stable** input (event_id,
   timestamp, correlation_id fixed before the transaction).
5. Compute event hash.
6. `create()` the event doc at `events/{zeroPad(seq)}` — create-only, so a
   duplicate sequence from a concurrent instance collides and retries (no
   overwrite, append-only immutability enforced at the DB layer).
7. `create()` the idempotency reservation (create-only).
8. `set()` the stream head.
9. Commit atomically.

A transaction retry does not change the event_id, timestamp, actor, correlation
id, causation id, idempotency key, or canonical payload; the hash is
deterministic for a given allocated sequence + prior hash.

## Queries and verification (bounded)
`readAll`, `queryEvents`, and `verifyChains*` page through each stream's events
subcollection ordered by document id (zero-padded sequence) with an explicit
page size (default 500). There is **no** unbounded global scan; a full-ledger
integrity sweep is O(events) and must be treated as a deliberate, bounded job.

### Required Firestore indexes
- The events subcollection is read ordered by `__name__` (document id) — served
  by the automatic single-field index; no composite index required for the
  current read/verify paths.
- Add composite indexes only if/when field-filtered queries are introduced.

## Validation status
- Fake-backed unit tests: PASS (transaction/create-only/concurrency/idempotency/pagination/PHI/doc-path).
- Emulator-backed suite: present and runnable when `FIRESTORE_EMULATOR_HOST` is set; **UNPROVEN** in CI without a JVM (the gcloud Firestore emulator requires Java).
- Real dev Firestore / deployed multi-instance: UNPROVEN (not provisioned, not deployed).

Runtime remains inactive: JSONL default, Firestore opt-in, no provisioning, no
deployment, no data migration.
