# 11 — eCIgn Integration with Evidence Storage

## Purpose
Define how evidence artifacts produced by eCIgn flow into long-term storage (AWS S3 + DynamoDB) and back into CES + PM views.

## Storage layout

### S3 (canonical bytes)
```
s3://{bucket}/esign/{policy_id}/{workflow_id}/{form_id}/{sha256}.json
   - object lock: governance mode
   - versioning: enabled
   - SSE: AES256 (or KMS)
```

### DynamoDB (queryable index — `EVIDENCE` table)
| Attribute | Purpose |
|---|---|
| `evidence_id` (PK) | Unique evidence identifier |
| `form_id` (GSI) | Per-form lookup |
| `event_id` (GSI) | Per-event lookup |
| `policy_id` (GSI) | Per-policy rollup |
| `workflow_id` (GSI) | Per-workflow rollup |
| `signer_id` (GSI) | Per-signer audit |
| `s3_bucket`, `s3_key`, `sha256` | Object pointer + verification |
| `status` | `APPROVED_EVIDENCE` on success |
| `signature_status` | per-signer aggregate |
| `created_at` | ISO timestamp |

### Local CES mirror
`EvidenceDoc` in [regulatoryExecutionStore.ts](../../src/policy/stores/regulatoryExecutionStore.ts) — used for offline UI, survey packet builder, immediate visibility.

## Write pipeline (existing — preserved)
1. `evaluateOnLock(instance)` in [server/ecign/compliance.ts](../../server/ecign/compliance.ts).
2. `recordEsignCompletion()` in [src/policy/ecign/hhcEvidence.ts](../../src/policy/ecign/hhcEvidence.ts) → `POST /api/esign/complete`.
3. AWS Lambda writes S3 + DynamoDB + audit row.
4. Returns `EsignEvidenceResponse`.
5. CES sync: caller invokes `addEvidenceDoc(eventId, mappedDoc)` to mirror locally.

## Read paths
- Right Panel "Evidence" section: per-form via `useEventEvidence(eventId)` + filter by `linkedFormId`.
- EvidencePanel page: full event view.
- Survey packet builder ([src/policy/audit/surveyPacket.ts](../../src/policy/audit/surveyPacket.ts)): manifest of all evidence + S3 keys + SHA256.

## Verification
- On read, optionally GET S3 object → recompute SHA256 → compare to DynamoDB `sha256` attribute.
- Mismatch → audit flag + UI warning ribbon on the evidence row.
- Periodic background job (out of scope for this initiative) can sweep DynamoDB and verify a rolling sample.

## Failure handling
| Failure | Behavior |
|---|---|
| Lambda call timeout | Client retries 3× with backoff; on persistent failure, packet remains `signed_locked` but CES form status remains `requires-review` until evidence acknowledged |
| S3 write fails (Lambda) | Lambda errors out; nothing committed; client sees error; user can retry |
| DynamoDB write fails after S3 success | Lambda compensates (delete S3 object) or queues a reconciliation; logs alert |
| Network offline at sign time | Save-as-evidence is queued client-side; surfaced in Right Panel as "pending sync" with a manual retry |

## Backend contract impact
- No schema change.
- Confirms `POST /api/esign/complete` must return the full `EsignEvidenceResponse`; Lambda implementation is environment-managed.

## UI behavior
- Evidence rows show: name, kind, signer(s), timestamp, SHA256 short, "Open" link to S3 (signed URL).
- Verification badge: ✅ verified / ⚠️ unverified / ❌ tampered.

## Risks
| # | Risk | Mitigation |
|---|---|---|
| EV1 | Lambda outage delays completion | CES form status stays `requires-review` — event cannot complete; manual replay available |
| EV2 | S3 region mismatch | Bucket region pinned in env; surfaced in evidence metadata |
| EV3 | Object lock wrongly omitted | Bucket policy enforces lock on writes; periodic audit |

## Acceptance criteria
- Storage layout deterministic.
- Verification path defined.
- Failure handling explicit.
- CES does not "unblock" itself without evidence.

## Verification checklist
- [ ] Lock + Lambda OK → DynamoDB row exists with all GSI attributes populated.
- [ ] CES `useEventEvidence(eventId)` returns the new row.
- [ ] Lambda failure leaves CES form status as `requires-review`.
- [ ] SHA256 verification path documented and runnable.
