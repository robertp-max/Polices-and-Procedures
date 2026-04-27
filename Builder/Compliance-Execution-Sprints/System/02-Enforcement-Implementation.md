# 02 — Enforcement Implementation

This document is a code-level walkthrough of
[`useExecutionEnforcement`](../../../src/policy/ces/hooks/useExecutionEnforcement.ts).
The hook is the single chokepoint through which every state transition
flows. UI surfaces consult it; they never decide independently.

## 1. Public Surface

```ts
useExecutionEnforcement() returns {
  canAdvancePhase(unit, target):    EnforcementVerdict
  canTransitionState(unit, target): EnforcementVerdict
  canMarkBlocked(unit):             EnforcementVerdict
  canRequestSignature(unit):        EnforcementVerdict
  canCloseUnit(unit):               EnforcementVerdict
  legalTargets(state):              ComplianceState[]
  COMPLIANCE_STATE_ORDER
}
```

Every method returns the same shape:

```ts
interface EnforcementVerdict {
  allowed:     boolean;
  reason:      string;   // long-form, surveyor-grade
  shortReason: string;   // short-form, UI-suitable
}
```

The dual-channel verdict means UIs never have to reformat error text —
they pick the channel appropriate for their surface.

## 2. The Adjacency Map

```ts
const STATE_TRANSITIONS: Record<ComplianceState, ComplianceState[]> = {
  upcoming:           ['ready', 'blocked'],
  ready:              ['in_progress', 'blocked'],
  in_progress:        ['awaiting_signature', 'blocked'],
  awaiting_signature: ['completed', 'blocked'],
  blocked:            ['ready', 'in_progress', 'awaiting_signature'],
  completed:          [],
};
```

This is the single source of truth for **which transitions are even
considered**. Before any other rule runs, the engine checks adjacency:

```ts
if (!STATE_TRANSITIONS[unit.complianceState].includes(target)) {
  return deny('Invalid transition', `Cannot move from "${...}" to "${...}".`);
}
```

If you need to allow a new transition, change this map first — every
downstream check assumes adjacency was already validated.

## 3. Phase Advancement (`canAdvancePhase`)

```ts
const cur  = WORKFLOW_PHASE_ORDER.indexOf(unit.workflowPhase);
const next = WORKFLOW_PHASE_ORDER.indexOf(target);

if (next === cur)        return ALLOW;
if (next < cur)          return deny('Cannot rewind phase',  ...);
if (next > cur + 1)      return deny('Cannot skip phases',   ...);
return ALLOW;
```

Three deny conditions, in this exact order: invalid index → rewind →
skip. Phase advancement is intentionally separate from state transition
because phases describe **process stage** while states describe
**operational lifecycle** (see Doc 04 of the Documentation layer).

## 4. State Transition Hard Rules (`canTransitionState`)

After adjacency is validated, three layered hard rules run.

### 4.1 Closure Gate

```ts
if (target === 'completed') {
  if (ev.requiredFormsComplete < ev.requiredFormsTotal) return deny(...);
  if (ev.signaturesComplete   < ev.signaturesRequired)  return deny(...);
  if (!ev.auditIndexCreated)                            return deny(...);
}
```

The order matters for UX: forms first (most common gap), then
signatures, then audit index. Each `deny` includes the **specific
counts** so the operator knows precisely what is missing. The forms
check additionally lists the missing form IDs from
`ev.missingFormIds` — eliminating "what was missing again?" round trips.

### 4.2 Blocker Gate

```ts
if (unit.complianceState === 'blocked' && unit.blockedReason) {
  return deny('Resolve blocker first',
              `Cannot move blocked unit: ${unit.blockedReason.label}.`);
}
```

A blocked unit cannot leave the blocked column without first having its
`blockedReason` cleared. This is what enforces invariant I3 from
Documentation/05.

### 4.3 Signature-Request Gate

```ts
if (target === 'awaiting_signature') {
  if (ev.requiredFormsComplete < ev.requiredFormsTotal) return deny(...);
}
```

This prevents "sign now, fill later". The same rule is **also** invoked
indirectly when a user clicks `Request Signatures` in the drawer
(`canRequestSignature` calls `canTransitionState(_, 'awaiting_signature')`).

## 5. Action-Specific Predicates

These are thin wrappers around `canTransitionState`, kept separate for
UI clarity:

```ts
canMarkBlocked(u)       → deny if u.complianceState === 'completed' else ALLOW
canRequestSignature(u)  → forms check + canTransitionState(u, 'awaiting_signature')
canCloseUnit(u)         → canTransitionState(u, 'completed')
```

The drawer's `ComplianceActionPanel` (in `WorkflowDrawer.tsx`) calls
each predicate to drive button enabled/disabled state, with the
`shortReason` providing the tooltip text on disabled buttons.

## 6. Pure-Function Property

Every method is declared with `useCallback` over **pure functions of
`unit` and `target`**. There is no I/O, no global state, no reads from
the data layer. Consequence:

- Trivially unit-testable.
- Safe to call from any render path without re-render churn.
- Identical behavior on the board (drag/drop) and in the drawer
  (button click).

The hook return is stable across re-renders — a downstream component
that subscribes to `useExecutionEnforcement()` does not re-render
unless its own props change.

## 7. Adding a New Rule

To add a new enforcement rule:

1. Decide whether it gates a state transition or an action.
2. If state: add it inside `canTransitionState` with the existing
   `deny(short, full)` helper.
3. If action: add a new `canX` function and call `canTransitionState`
   from inside it for the underlying transition.
4. Cover the new rule with a test against the mock dataset's
   pre-shaped failure cases (e.g., `eu-009` for missing-form,
   `eu-010` for dependency-incomplete, `eu-011` for external-input).

## 8. What The Engine Deliberately Does Not Do

- **Persist state** — it is a pure verdict engine. The caller mutates
  state after consulting the verdict.
- **Emit notifications** — escalations and notifications live in the
  signature/eCIgn layer, not in the enforcement layer.
- **Reorder columns or items** — visual ordering is the board's
  concern.
- **Backfill audit log entries** — that is the audit layer's
  responsibility on commit of an allowed transition.

This separation keeps the rule engine small, obvious, and impossible
to subvert by accident.
