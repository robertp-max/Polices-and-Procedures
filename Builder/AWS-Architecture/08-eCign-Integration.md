# eCign Integration (Both Phases)

## Non-Negotiable Rules

1. **eCign artifacts NEVER bypass the evidence pipeline.** Signed PDFs and signature manifests land in S3 under the same triplet-keyed prefix as any other evidence.
2. **Mandatory mapping** on every signed artifact:
   - `policy_id`
   - `workflow_id`
   - `event_id`
   - `form_id`
3. **Signature metadata recorded** in `compliance_objects`.
4. **Audit trail row written** for every state change (`PENDING` → `SIGNED` / `DECLINED` / `EXPIRED`).

---

## Object Identity & S3 Layout

```
esign/{policy_id}/{workflow_id}/{event_id}/{form_id}/{signature_packet_id}/
  ├── envelope.json            # vendor manifest (canonicalized)
  ├── signed.pdf               # signed document (final)
  ├── certificate-of-completion.pdf
  └── signers/{signer_id}.json # per-signer evidence
```

All objects are **SSE-KMS** encrypted with `alias/hhc-evidence` and (in prod) protected by **S3 Object Lock Compliance mode**.

---

## DynamoDB Records

| Purpose | pk | sk | Key fields |
|---|---|---|---|
| Signature packet header | `ESIGN#{signature_packet_id}` | `EVENT#{event_id}#FORM#{form_id}` | `status`, `vendor`, `envelope_id`, `policy_id`, `workflow_id`, `event_id`, `form_id`, `signers[]`, `created_at`, `updated_at` |
| Evidence row for signed PDF | `EVENT#{event_id}` | `EVIDENCE#{evidence_id}` | normal evidence row + `signature_status=SIGNED`, `signature_packet_id` |
| Cross-cut: form view | `FORM#{form_id}` | `EVENT#{event_id}#EVIDENCE#{evidence_id}` | GSI projection |
| Audit | `AUDIT#{event_id}` | `{ISO_TS}#{audit_id}` | `actor=ecign`, `action=SIGN_COMPLETED`, etc. |

---

## Phase 1 — Lambda `esign-callback` Flow

```
Vendor (eCign) ──► API Gateway POST /esign/callback
                     │
                     │ HMAC-SHA256(body, X-Timestamp) verified
                     │ Replay nonce checked in DDB (pk=ESIGN_NONCE#{n})
                     │ IP allow-list enforced
                     ▼
                 Lambda esign-callback
                     │ 1. Resolve packet → look up DDB ESIGN# row by envelope_id
                     │ 2. Validate triplet present in stored packet
                     │ 3. Pull signed PDF from vendor (server-side, no client involvement)
                     │ 4. Compute SHA-256
                     │ 5. PutObject to s3://hhc-prod/.../esign/{...}/signed.pdf  (SSE-KMS)
                     │ 6. Create EVIDENCE row + projections
                     │ 7. Append AUDIT row
                     │ 8. (placeholder) Put event onto EventBridge bus hhc-events
                     ▼
                 Return 200 { "status": "RECEIVED" }
```

If any step fails, **return 5xx so the vendor retries** and write a `FAILED_INGEST` audit row. Do not write a partial evidence record.

---

## Phase 2 — `esign-ingest-svc` Flow

Same logic, but as an always-on container:

- Vendor → WAF → API Gateway (or ALB) → `esign-ingest-svc` (private subnet).
- Outbound vendor pulls go through NAT, restricted by **prefix list** containing only the eCign vendor IP ranges.
- HMAC secret pulled from Secrets Manager at task start; rotated every 30 days.
- Same DDB + S3 writes, plus emit a `SignatureCompleted` event on EventBridge for downstream subscribers (workflow engine, notifications).

---

## Pre-Sign Initiation (Outbound to eCign)

Triggered when a workflow step says "request signature":

1. `workflow-engine` (Phase 2) or a `esign-init` Lambda (if added to Phase 1) creates a `signature_packet_id` (ULID) and writes `ESIGN#...` row with `status=PENDING`.
2. Calls eCign API to create envelope, passing `signature_packet_id` as the **vendor envelope's external reference** so the callback can resolve it.
3. Persists the source form PDF under `forms/{policy_id}/{workflow_id}/{event_id}/{form_id}/source.pdf` first — this guarantees we always have the *unsigned* original even if signing never completes.
4. Audit row: `action=SIGN_REQUESTED`.

---

## Failure & Edge Cases

| Case | Handling |
|---|---|
| Vendor sends callback for unknown envelope | 404, audit `UNKNOWN_ENVELOPE` |
| Triplet missing from packet record | 422, audit `BAD_TRIPLET` (should never happen — gate at init) |
| Duplicate callback (replay) | 200 + idempotent no-op (nonce match); audit `DUPLICATE_CALLBACK` |
| Vendor PDF download fails | Retry up to 3 with backoff; on final failure write `FAILED_INGEST` and alert |
| Signer declines | Write `signature_status=DECLINED`, keep packet, do **not** create EVIDENCE row |
| Envelope expires | Sweep job (EventBridge schedule) marks `EXPIRED`; audit row written |

---

## Surveyor Export Behavior

When `export-builder` produces a survey packet for an event, it includes:

- The signed PDF.
- The vendor `envelope.json`.
- The certificate of completion.
- The DDB `ESIGN#` record (serialized).
- Relevant `AUDIT#{event_id}` rows in chronological order.

This guarantees an auditor can reconstruct the full chain of custody from a single ZIP.
