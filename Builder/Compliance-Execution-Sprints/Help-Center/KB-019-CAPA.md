# KB-019 — What Is a Corrective Action Plan (CAPA)?

**Audience:** Everyone whose audit produces failed findings. **Time to read:** 2 minutes.

A **Corrective Action Plan (CAPA)** is the formal remediation workflow
that runs when an audit produces failed findings.

## When CAPA fires

The system **auto-generates** a CAPA execution unit when:

- An audit workflow completes with one or more **failed** findings.
- The parent audit event has `followUps: [{ workflowId: 'QA-WF-CAPA-001', ... }]`
  in its definition (all 32 audit workflows do).

You do **not** need to manually start a CAPA.

## Where CAPA appears

- A new event materializes in the **next sprint** linked to the failed
  audit via `dependencies.dependsOn`.
- It carries the audit's `auditRisk` and citation forward.
- The owner defaults to the audit's owner; reassign per
  [KB-017](KB-017-Reassign-Unit.md) if a different role should drive it.

## CAPA workflow phases

CAPA uses the same 5-phase model:

| Phase | What you do |
|---|---|
| Preparation | Gather all related findings, root-cause data. |
| Documentation | Complete the CAPA form: root cause, action, owner, due date. |
| Review | Compliance Officer reviews the plan. |
| Signature | Administrator signs off. |
| Audit | File the CAPA in Evidence Center linked to the original audit. |

## CAPA closure

A CAPA is closed only when:

- The corrective action is verified executed (next audit cycle).
- A verification entry is filed.

If the next cycle's audit re-fails on the same finding, the CAPA reopens
automatically and escalates to the Administrator.

## Related

- [KB-011 — The 32 Audit Workflows](KB-011-The-32-Audits.md)
- [KB-007 — Blocking and Unblocking Work](KB-007-Block-Unblock.md)
