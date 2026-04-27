# 13 — eCIgn Failure Modes and Controls

## Purpose
Catalog the failure modes of the eCIgn-centered submission pipeline and the controls that detect, contain, and recover from each.

## C-1 Lock without CES sync
- **Symptom:** Packet `signed_locked` but CES form status remains `requires-review`.
- **Detection:** Reconciler diff between eCIgn instances and CES form statuses; verification tsx script.
- **Containment:** CES will not allow event completion until form `complete`.
- **Recovery:** Replay sync via admin action; manual `addEvidenceDoc` if Lambda response was lost.
- **Prevention:** Lock pipeline ALWAYS calls CES sync (gap fix in this initiative).

## C-2 Lambda evidence write fails
- **Symptom:** Lock succeeded server-side; Lambda call timed out or errored.
- **Detection:** Non-2xx from `/api/esign/complete`.
- **Containment:** Client retries 3× with backoff; user sees a "pending evidence" badge.
- **Recovery:** Background retry queue; manual replay endpoint.
- **Prevention:** Idempotent endpoint; durable retry queue.

## C-3 S3/DynamoDB inconsistency
- **Symptom:** S3 has bytes; DynamoDB row missing or vice versa.
- **Detection:** Periodic reconciliation job.
- **Containment:** SHA256 verification on read flags mismatches.
- **Recovery:** Compensating action (re-emit the missing side).
- **Prevention:** Two-phase write with compensating delete on partial failure.

## C-4 Concurrent signers double-lock
- **Symptom:** Two clients attempt to lock the same packet.
- **Detection:** Backend `assertTransition()` raises on the loser.
- **Containment:** Loser receives 409; UI refreshes packet state.
- **Recovery:** None needed — packet is locked.
- **Prevention:** Optimistic concurrency on packet state.

## C-5 Decline / return-for-correction misrouted as completion
- **Symptom:** UI shows `completed` despite a decline.
- **Detection:** Status mapper unit test; verification script.
- **Containment:** Mapper rule: any `declined`/`returned`/`rejected` → `blocked`/`returned_for_correction`, never `completed`.
- **Recovery:** Re-derive status on next selector tick.
- **Prevention:** Single mapping module ([05](05-eCIgn-Form-Status-Model.md)).

## C-6 PM marks CES task done
- **Symptom:** CES task transitions to `done` outside CES validation.
- **Detection:** Lint check; runtime assert in projector if a non-CES caller emits `done`.
- **Containment:** Selector overrides PM-claimed status with CES truth on every read.
- **Recovery:** Re-derive on next tick.
- **Prevention:** PM Right Panel and Kanban disable the action.

## C-7 Weekend scheduling without override
- **Symptom:** Compliance task scheduled on Sat/Sun without reason.
- **Detection:** `weekendRule.assertSchedulable` throws.
- **Containment:** UI rejects + shows confirmation modal requiring reason.
- **Recovery:** N/A.
- **Prevention:** Helper enforced in scheduler + Right Panel + projector.

## C-8 Duplicate task IDs
- **Symptom:** Two Tasks share an ID across views.
- **Detection:** `assertNoDuplicateTaskIds(tasks)` in dev mode.
- **Containment:** Render error boundary surfaces the issue.
- **Recovery:** Identify the rogue constructor.
- **Prevention:** Single projector; lint rule.

## C-9 Hash chain break
- **Symptom:** `verifyChain()` returns `{ ok: false }`.
- **Detection:** Periodic verification job; on-demand admin tool.
- **Containment:** Audit-export disabled until reviewed.
- **Recovery:** Restore from S3 backup; investigate.
- **Prevention:** Append-only writes; tamper-evident chain.

## C-10 Stale signers / approver tier change
- **Symptom:** A required signer no longer has tier authority mid-flight.
- **Detection:** Pre-sign permission check.
- **Containment:** Re-issue invite to current authorized signer; old invite revoked.
- **Recovery:** Audit row records substitution.
- **Prevention:** Tier registry consulted at every signature step.

## C-11 Voided packet leaves orphan task
- **Symptom:** Packet voided; PM task still references `ecign_packet_id` that no longer exists.
- **Detection:** Projector reconciles on next tick.
- **Containment:** Task reverts to `not_started`; user can recreate packet.
- **Recovery:** Automatic on next selector tick.
- **Prevention:** Soft-void retains read access; recreate path obvious.

## C-12 Evidence not validated yet at view time
- **Symptom:** Lock + Lambda OK but DynamoDB read lag.
- **Detection:** Read returns no row; status remains `awaiting_approval`.
- **Containment:** Right Panel shows "Evidence pending" with auto-refresh.
- **Recovery:** Next read cycle picks it up.
- **Prevention:** Eventual consistency tolerance.

## Master controls summary
| Control | Type | Owner |
|---|---|---|
| Single status mapper | Architectural | `pm/ecignStatusMap.ts` |
| Single task projector | Architectural | `pm/taskProjection.ts` |
| Single Right Panel | Architectural | `components/pm/TaskDetailRightPanel.tsx` |
| Weekend helper | Architectural | `pm/weekendRule.ts` |
| State machine assertions | Backend | `server/ecign/stateMachine.ts` |
| Hash chain | Backend | `server/ecign/hashChain.ts` |
| Idempotent endpoints | Backend | All eCIgn POSTs |
| Reconciler / verification scripts | Tooling | `scripts/verifyEcignFlow.ts` |
| Lint / convention | Process | Code review checklist |

## Acceptance criteria
- Each failure mode has explicit detection + containment + recovery + prevention.
- Controls are concrete (file/module references).
- Prevention is preferred over recovery.

## Verification checklist
- [ ] Each C-# scenario reproducible in tsx script or documented as manual procedure.
- [ ] Audit verification job runs without errors after a known-good session.
- [ ] Disallowed actions audit-logged with `result: 'denied'`.
