# AWS Architecture — Home Health Compliance & Evidence System

**Region (locked):** `us-west-1` (N. California)
**Workload class:** PHI-adjacent / HIPAA-aligned
**Owner:** Compliance Engineering
**Status:** Architecture proposal — **NOT YET EXECUTED**

---

## Document Map

| # | File | Purpose |
|---|------|---------|
| 00 | [00-README-INDEX.md](00-README-INDEX.md) | This index |
| 01 | [01-Architecture-Diagram.md](01-Architecture-Diagram.md) | Text diagrams (Phase 1 + Phase 2) |
| 02 | [02-Phase1-Serverless-Architecture.md](02-Phase1-Serverless-Architecture.md) | Detailed Phase 1 (MVP) design |
| 03 | [03-Phase2-Linux-Controlled-Architecture.md](03-Phase2-Linux-Controlled-Architecture.md) | Detailed Phase 2 (Ubuntu 24.04 / HIPAA) design |
| 04 | [04-Migration-Phase1-to-Phase2.md](04-Migration-Phase1-to-Phase2.md) | Step-by-step migration plan |
| 05 | [05-Security-Cost-Risk-Comparison.md](05-Security-Cost-Risk-Comparison.md) | Security model, cost, and risk comparison |
| 06 | [06-Phase1-Execution-Plan.md](06-Phase1-Execution-Plan.md) | Service-by-service execution plan + CLI commands |
| 07 | [07-Phase2-Execution-Plan.md](07-Phase2-Execution-Plan.md) | Phase 2 service inventory (design only) |
| 08 | [08-eCign-Integration.md](08-eCign-Integration.md) | eCign integration model (both phases) |
| 09 | [09-MVP-Scope-and-Timeline.md](09-MVP-Scope-and-Timeline.md) | MVP scope definition + timeline |
| 10 | [scripts/](scripts) | AWS CLI scripts (review-only, do not run until approved) |

---

## Non-Negotiable Core Requirement

Every evidence artifact MUST trace to:

- `policy_id`
- `workflow_id`
- `event_id`

Optional but stored when present:

- `form_id`
- `user_id`
- `source_system`
- `signature_status`

This invariant is enforced at three layers:

1. **API contract** — `/uploads/init` rejects requests missing the triplet.
2. **S3 key shape** — every prefix encodes the triplet (`{policy_id}/{workflow_id}/{event_id}/...`).
3. **DynamoDB write** — `compliance_objects` records reject items lacking the triplet via a Lambda-side validator and a condition expression on the GSI projection.

---

## Region & Account Discipline

- All resources MUST be created in `us-west-1`.
- No cross-region replication in Phase 1 (defer to Phase 2 backup strategy).
- Bucket names use the form `hhc-{env}-{account_id}-us-west-1` to make region accidents obvious.

---

## Execution Posture

- **I have NOT executed any AWS commands.**
- All CLI commands are written to [scripts/](scripts) for human review.
- Before running any `create-*` command, the architecture must be approved.
- High-cost or always-on services (NAT, EC2, ALB, Aurora, OpenSearch) require explicit approval before creation; none of those are in Phase 1.

---

## Definition of "Done" for the MVP (Phase 1)

1. A compliance officer can request an upload slot for a given `(policy_id, workflow_id, event_id)`.
2. They receive a presigned PUT URL and upload a file.
3. The system validates, hashes, and promotes the file to immutable evidence storage.
4. The file is queryable by event, by policy, by workflow, and by form.
5. A survey export packet (`.zip`) can be produced for a date range.
6. eCign callbacks land signed packets back into the same evidence pipeline.
7. Every step writes an append-only audit row.
