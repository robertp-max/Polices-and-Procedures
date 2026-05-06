# KB-011 — State machine and auto progression

## Summary

**Allowed transitions** for instance status and task status are centralized in `stateMachine.ts`. After many mutations, the store invokes **event state evaluation** (`evaluateEventState`) to advance instance status when gates clear and to compute **certification readiness** blockers.

## Event instance transitions

| From | Allowed to |
|------|------------|
| `scheduled` | `in_progress`, `cancelled` |
| `in_progress` | `completed`, `cancelled` |
| `completed` | `certified` |
| `certified` | _(none — terminal)_ |
| `cancelled` | _(none — terminal)_ |

## Task status transitions (high level)

| From | Allowed to (includes) |
|------|------------------------|
| `not_started` | `in_progress`, `cancelled` |
| `in_progress` | `blocked`, `awaiting_signature`, `completed`, `cancelled` |
| `blocked` | `in_progress` |
| `awaiting_signature` | `completed` |
| `completed` / `cancelled` | Terminal in transition map |

**Note:** Store-level “reopen” or corrective flows may exist alongside these enums; they still must respect certification locks.

## Auto progression (`evaluateEventState`)

Evaluator inputs include required tasks, required forms completeness flag, and approvals completeness flag. It returns:

- **`blockers`** — human-readable list
- **`nextStatus`** — e.g. moves toward `completed` when blockers empty while `in_progress`
- **`canCertify`** — boolean gate

The store applies results after task/evidence/form mutations to keep the **instance status** aligned with reality.

## See also

- [KB-005](./KB-005-Required-Tasks-and-Certification-Gates.md)
- [KB-008](./KB-008-Audit-Trail-and-Hash-Chain.md)
