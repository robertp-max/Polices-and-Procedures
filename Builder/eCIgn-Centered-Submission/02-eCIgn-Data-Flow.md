# 02 — eCIgn Data Flow

## Purpose
Describe the end-to-end runtime data flow for a form submission task — from the moment CES exposes a required form to the moment evidence is stored and the PM views reflect completion.

## Sequence

```
CES Event "QAPI Meeting 2026-05-07" requires form QA-FM-021
    │
    ▼
Task Projector emits Task { task_id: "qapi_meeting-20260507-08", source: "ces",
                            event_id, workflow_id, policy_id, form_id, ecign_packet_id?, status: "todo" }
    │
    ▼
User opens task in Event View / My Tasks / Kanban / Sprint
    │ (single TaskDetailRightPanel component)
    ▼
"Open Form" → ecignApi.forms.create({ form_id, event_id, workflow_id, ... })
    │
    ▼
Backend creates FormInstance (state: created) — packet_id = instance_id
    │
    ▼
Disclosure → Identity → Review → Signature → Attestation → Lock
   (each step → POST /api/ecign/forms/:id/<step> + audit append + state machine assert)
    │
    ▼
state = signed_locked
    │
    ▼
evaluateOnLock(instance) → compliance rule fires → recordEsignCompletion()
    │
    ▼
POST /api/esign/complete (AWS Lambda)
    │
    ▼
S3: s3://{bucket}/esign/{policy_id}/{workflow_id}/{form_id}/{sha256}.json
DynamoDB: EVIDENCE table row (evidence_id, status APPROVED_EVIDENCE)
Audit: SIGNATURE_RECEIVED appended to hash-chained log
    │
    ▼
CES sync: addEvidenceDoc(eventId, { id: evidence_id, linkedFormId: form_id, ... })
          decideApproval if approval rule applies
          → effectiveFormStatus recomputes → "complete"
          → step/event recompute → "complete" if all required forms complete
    │
    ▼
Task Projector re-emits → status flips to "done" across ALL views simultaneously
```

## Data sources at each layer

| Layer | Reads | Writes |
|---|---|---|
| Projector | CES events/forms; eCIgn packet status; PM overlay | none |
| Right Panel | Task; Evidence; Audit refs | overlay only (assignee, sprint, points, deps) |
| eCIgn workspace | FormInstance | FormInstance state, signatures, audit, evidence |
| CES validation | All event state | step/event status (derived) |
| Audit | nothing | append-only to hash-chained log |

## Idempotency rules
- Packet creation per `(event_id, form_id, instance_seq)` is idempotent — repeated POSTs with the same composite key return existing instance.
- `recordEsignCompletion()` is idempotent on `(form_id, signature_hash)`.
- CES `addEvidenceDoc` rejects duplicates by evidence_id.

## Failure paths (see [13](13-eCIgn-Failure-Modes-and-Controls.md))
- Lock succeeds but Lambda call fails → retry queue; CES form status remains `requires-review` until evidence acknowledged.
- Lock denied (state machine assert fails) → 409 to client; UI shows the missing prerequisite step.
- Network loss mid-signature → partial signature row not committed; user resumes from last good state.

## Backend contract impact
- No new endpoints. Confirms the contract:
  - `POST /api/ecign/forms/:id/lock` triggers `evaluateOnLock` (existing).
  - `POST /api/esign/complete` is called inside `evaluateOnLock` (existing pipeline).
  - CES side acknowledges via local store + `addEvidenceDoc` (existing).

## UI behavior
- Right Panel shows live status; updates on store events.
- Stepper inside eCIgn workspace remains unchanged (existing six-step flow).
- Optimistic status changes only for overlay fields (sprint pin, label); never for compliance status.

## Risks
| # | Risk | Mitigation |
|---|---|---|
| F1 | Race between Lambda evidence write and CES validation | CES validation tolerates "evidence pending" state; reconciles on next selector tick |
| F2 | Duplicate task_id from misuse of projector | Projector is the only constructor; lint guard |
| F3 | Concurrent signers double-locking | Backend `assertTransition()` rejects second lock |

## Acceptance criteria
- One sequence diagram, end to end, with no branches that bypass eCIgn.
- Idempotency rules documented and respected.
- Every external write goes through a known endpoint.

## Verification checklist
- [ ] Sequence reproducible in [scripts/verifyEcignFlow.ts](../../scripts/verifyEcignFlow.ts) (added by this initiative).
- [ ] Failed Lambda call leaves CES in `requires-review`, not `complete`.
- [ ] Re-locking a locked instance returns 409.
- [ ] Projector observed to re-emit on every relevant store change.
