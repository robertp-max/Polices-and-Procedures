# 05 — Enforcement and Compliance Rules

## 1. Why Enforcement is a First-Class Module

CES treats enforcement as a **pure functional module** — `useExecutionEnforcement` —
that the UI must consult before mutating state. The board, the drawer, and any
future API surface all share the same rules engine. A move that the engine
denies is denied everywhere.

This document is the canonical specification of those rules. The
implementation lives in
[`src/policy/ces/hooks/useExecutionEnforcement.ts`](../../../src/policy/ces/hooks/useExecutionEnforcement.ts).

## 2. The State Machine

### 2.1 Adjacency Map

```ts
const STATE_TRANSITIONS = {
  upcoming:           ['ready', 'blocked'],
  ready:              ['in_progress', 'blocked'],
  in_progress:        ['awaiting_signature', 'blocked'],
  awaiting_signature: ['completed', 'blocked'],
  blocked:            ['ready', 'in_progress', 'awaiting_signature'],
  completed:          [],
};
```

### 2.2 Diagram

```
upcoming ──► ready ──► in_progress ──► awaiting_signature ──► completed
    │          │            │                  │
    └──────────┴────────────┴──────────────────┘
                            ▼
                         blocked
                            │
                            ▼
              (resume into ready / in_progress / awaiting_signature)
```

### 2.3 Invariants

| # | Invariant |
|---|-----------|
| I1 | `completed` is terminal — no outbound transitions, ever |
| I2 | `blocked` cannot be entered without a typed `BlockedReason` |
| I3 | A unit cannot leave `blocked` while `blockedReason` is still set |
| I4 | `awaiting_signature` requires all required forms filed |
| I5 | `completed` requires forms + signatures + `auditIndexCreated` |
| I6 | All transitions must be **adjacent** per `STATE_TRANSITIONS` |

## 3. Phase Advancement Rules

`canAdvancePhase(unit, target)` enforces:

- **No skip**: cannot jump from `preparation` directly to `signature`.
- **No rewind**: cannot move from `review` back to `documentation`.
  A correction requires a new corrective Execution Unit.
- **Single step only**: phases advance one at a time.

This is the surveyor-defensible reason CES is not a Kanban tool. A
ticket tracker would let an owner backdate a phase. CES does not.

## 4. The Closure Gate

The single most consequential rule. To close a unit
(`canTransitionState(unit, 'completed')`):

```ts
ev.requiredFormsComplete  >= ev.requiredFormsTotal
&& ev.signaturesComplete  >= ev.signaturesRequired
&& ev.auditIndexCreated   === true
```

If any condition fails, the engine returns:

```ts
{ allowed: false, reason: '<surveyor-grade explanation>',
  shortReason: '<UI hint>' }
```

The board displays the `shortReason` in an inline warning bar; the drawer
disables the action button with the `shortReason` as tooltip.

| Failure | shortReason |
|---------|------------|
| Missing forms | "Evidence incomplete" |
| Missing signatures | "Signatures required before completion" |
| No audit index | "Audit index not created" |

## 5. Blocking Rules

`canMarkBlocked(unit)` allows blocking from any state **except**
`completed`. Completed units cannot be re-blocked — open a corrective
Execution Unit instead.

When a unit is blocked, the UI requires the user to specify a
`BlockedReasonKind`:

| Kind | Resolution required before unblock |
|------|------------------------------------|
| `missing_signature` | Signature captured |
| `missing_form` | Form filed and linked |
| `dependency_incomplete` | Upstream unit closed |
| `awaiting_external_input` | External input recorded |

The engine refuses to leave `blocked` while `blockedReason` is still set.

## 6. Signature Request Rules

`canRequestSignature(unit)` is gated by:

```
ev.requiredFormsComplete >= ev.requiredFormsTotal
```

You cannot request signatures on incomplete documentation. This prevents
the antipattern of "sign now, fill in later" — every signature in CES is a
signature on a completed evidence package.

## 7. Verdict Type

```ts
interface EnforcementVerdict {
  allowed:     boolean;
  reason:      string;   // long form — surveyor-grade
  shortReason: string;   // short form — UI surface
}
```

The dual-channel verdict allows the UI to show a short toast/banner while
preserving the auditable explanation in the action log.

## 8. Audit Trail Requirement

Every denied transition must be recorded in the audit log with:

- Unit id
- Source state, attempted target state
- `EnforcementVerdict.reason`
- Actor user id
- Timestamp

This creates a **provenance trail of attempted shortcuts** — surveyors
can demonstrate the system actively enforced the rule, not just that it
was followed by accident.

## 9. Why "Blocked" is its Own Column

Some compliance teams hide blocked items inside their parent column with
a red border. CES rejects that approach because:

1. Blockers are **not exceptions** — they are operational data with SLA.
2. Surveyors ask: *"Show me everything that was blocked this sprint and
   why."* That is a column query, not a filter query.
3. Capacity decisions depend on blocker counts at a glance.

The Blocked column is therefore first-class with its own background tint
(`#FCF5F4`) and per-card explicit reason chip.
