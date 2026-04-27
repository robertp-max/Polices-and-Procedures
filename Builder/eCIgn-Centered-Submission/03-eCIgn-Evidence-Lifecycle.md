# 03 — eCIgn Evidence Lifecycle

## Purpose
Define the lifecycle of an evidence artifact produced by an eCIgn submission, including creation, storage, linkage, immutability, and audit visibility.

## Lifecycle states
```
pending  ──►  generated  ──►  stored  ──►  linked  ──►  validated  ──►  archived
                  │              │           │             │
                  │              │           │             └─ CES validation passes; counts toward completion
                  │              │           └─ attached to event_id, form_id, workflow_id, policy_id
                  │              └─ S3 + DynamoDB write succeeded
                  └─ EvidenceArtifact constructed in evaluateOnLock()
```

## Artifact shape
Reuses [`EsignEvidenceResponse`](../../src/policy/ecign/hhcEvidence.ts) and [`EvidenceDoc`](../../src/policy/stores/regulatoryExecutionStore.ts):

```ts
EvidenceArtifact {
  evidence_id:   string;        // UUID/ULID, immutable
  form_id:       string;
  policy_id:     string;
  workflow_id:   string;
  event_id?:     string;
  s3_bucket:     string;
  s3_key:        string;
  sha256:        string;        // bytes hash of bundle
  signature_status: string;
  status:        string;        // 'APPROVED_EVIDENCE' on success
  created_at:    string;
}
```

CES local mirror (in regulatoryExecutionStore):
```ts
EvidenceDoc {
  id: string;            // == evidence_id
  eventId: string;
  name: string;          // form display title + signer summary
  kind: 'form';
  uploadedAt: string;
  uploadedBy: string;    // signer (and second signer if applicable)
  sizeLabel: string;
  linkedFormId: string;  // == form_id
  note?: string;         // e.g. 'eSign receipt, instance <id>'
}
```

## Storage
- **S3 (canonical bytes):** `s3://{bucket}/esign/{policy_id}/{workflow_id}/{form_id}/{sha256}.json`
- **DynamoDB (queryable index):** `EVIDENCE` table partitioned by `evidence_id` with GSIs for `event_id`, `policy_id`, `signer_id`.
- **Local CES mirror:** added via `addEvidenceDoc(eventId, doc)` for immediate UI rendering and offline survey packet.

## Immutability
- S3 objects written with object-lock (governance mode) where supported.
- `EvidenceDoc` in CES is treated immutable: no update API, only insert. Corrections are issued as **superseding** evidence with `note: 'Supersedes <evidence_id>'`.
- Hash-chained audit log ([server/ecign/hashChain.ts](../../server/ecign/hashChain.ts)) preserves order of receipt.

## Linkage
- `evidence_id` → `event_id`: enables `useEventEvidence(eventId)`.
- `evidence_id` → `form_id`: surfaces in Right Panel "Evidence" section.
- `evidence_id` → `policy_id` + `workflow_id`: included for audit-readiness reports and survey packet builder ([src/policy/audit/surveyPacket.ts](../../src/policy/audit/surveyPacket.ts)).

## Validation
Evidence is *valid* when:
1. S3 + DynamoDB write succeeded (`status === 'APPROVED_EVIDENCE'`).
2. SHA256 matches bundle bytes recomputed at audit time.
3. Hash-chain entry exists for `SIGNATURE_RECEIVED` referencing the evidence_id.

CES treats a required form as **complete** only when:
- Approval (if required) is `approved`, AND
- An `EvidenceDoc` linked to that `form_id` exists for the event.

(See [src/policy/stores/regulatoryExecutionStore.ts → effectiveFormStatus](../../src/policy/stores/regulatoryExecutionStore.ts).)

## Backend contract impact
- No new endpoints. `POST /api/esign/complete` already returns the canonical artifact metadata.
- CES sync handler ensures `addEvidenceDoc` is invoked from the lock pipeline (gap noted in audit; closed by the small change in eCIgn lock handler — see [15](15-eCIgn-Developer-Implementation-Notes.md)).

## UI behavior
- Right Panel "Evidence" section shows: status chip (Missing | Generated | Validated), download link (signed S3 URL), timestamp.
- "View evidence" opens a read-only viewer (PDF or JSON receipt).
- Evidence cannot be deleted from the UI; superseding is a separate flow with audit reason.

## Risks
| # | Risk | Mitigation |
|---|---|---|
| E1 | S3 write succeeds, DynamoDB fails | Two-phase: S3 first; on Dynamo failure, retry queue; CES marks `requires-review` |
| E2 | Evidence orphaned if event deleted | Events are not deleted — only voided; voiding preserves evidence linkage |
| E3 | Tampered S3 bytes | SHA256 verification on read; mismatch → audit flag |

## Acceptance criteria
- Lifecycle states explicit; transitions defined.
- Immutability rules unambiguous.
- CES recognizes only `validated` evidence for completion.
- Linkage covers event/workflow/policy/form.

## Verification checklist
- [ ] On successful lock, an `EvidenceDoc` appears in CES via `useEventEvidence(eventId)`.
- [ ] SHA256 verification path documented and exercised in audit verification job.
- [ ] No code path mutates an existing `EvidenceDoc` row.
- [ ] Survey packet builder includes evidence S3 keys + SHA256.
