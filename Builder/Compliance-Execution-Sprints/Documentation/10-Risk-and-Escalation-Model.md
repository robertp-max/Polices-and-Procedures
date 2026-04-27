# 10 — Risk and Escalation Model

## 1. Three Layers of Risk

CES tracks risk at three layers, each with its own surface:

| Layer | Object | Surface |
|-------|--------|---------|
| Per-unit | Execution Unit | Card · Drawer |
| Per-domain | Compliance Domain | Dashboard heatmap |
| Per-owner | Owner | Workload Distribution |

A unit can be healthy while its domain is red (other units in the
domain are blocked). An owner can be overloaded while their individual
units are healthy (they are heading toward overload). The three layers
prevent any single signal from masking systemic risk.

## 2. Per-Unit Risk Indicators

| Signal | Surface | Action |
|--------|---------|--------|
| `complianceState === 'blocked'` | Red top-bar on card; explicit reason chip | Compliance Officer triages |
| `escalationTimer < 0` | Red overdue chip on card and drawer | Auto-escalates to manager |
| `auditReadiness === 'not_ready'` near closure | Red audit tag | Owner must remediate before closure attempt |
| Past `dueDate` | Red due-date in card footer | Increments `overdueUnitCount` for owner |

## 3. Per-Domain Risk

Defined in [`DomainRisk`](../../../src/policy/ces/types.ts):

```ts
interface DomainRisk {
  domain:       ComplianceDomain;
  level:        DomainRiskLevel;
  openUnits:    number;
  blockedCount: number;
  reason:       string;
}
```

Heuristics for assigning `level`:

| Level | Trigger |
|-------|---------|
| **green** | No blockers, no overdue units, completion trending ≥ 85% |
| **yellow** | 1–2 blockers OR 1+ overdue, OR completion trending 70–85% |
| **red** | 3+ blockers OR audit-phase blocker OR completion < 70% |

The dashboard heatmap visualizes all four domains in parallel; the
dominant color drives the executive's attention. The narrative
`reason` field is required — a red tile with no explanation is a
process bug.

## 4. Per-Owner Capacity Risk

Defined in [`OwnerAssignment`](../../../src/policy/ces/types.ts):

```ts
interface OwnerAssignment {
  owner:                 Owner;
  allocatedUnitCount:    number;
  overdueUnitCount:      number;
  pendingSignatureCount: number;
  capacityRisk:          DomainRiskLevel;
}
```

Capacity-risk inputs:

- Allocated unit count vs. owner's historical sustainable load
- Overdue unit count
- Pending-signature count where this owner is signature owner
- Blocked unit count where this owner is operational owner

The Workload Distribution table sorts by `capacityRisk` descending so
the most exposed owners appear first.

## 5. Escalation Policy

### 5.1 Signature Escalation (Per Required Signer)

Each `RequiredSigner` carries `hoursToEscalation`. Behavior:

| State | Action |
|-------|--------|
| `> 24h` to escalation | Quiet. No notifications beyond original request. |
| `≤ 24h` to escalation | Reminder sent to signer. |
| `0` to escalation | Escalation triggered: signer's manager notified. |
| `< 0` (overdue) | Continuous escalation; counted in `signatureSlasMissed`; surfaces in dashboard Critical Risk Banner. |

### 5.2 Blocker Escalation

| Blocker age | Action |
|-------------|--------|
| 0–24h | Owner expected to resolve. |
| 24–48h | Surfaces in dashboard Risk Indicators panel. |
| 48–72h | Compliance Officer takes ownership of resolution. |
| > 72h | Administrator review required at retrospective. |

### 5.3 Overdue Unit Escalation

A unit past its `dueDate`:

1. Increments owner's `overdueUnitCount`.
2. Contributes to owner's capacity risk.
3. Surfaces in the dashboard's Risk Indicators panel.
4. If still overdue at retrospective: generates a remediation
   Execution Unit owned by the Compliance Officer.

## 6. The Urgent Counter (Top Context Bar)

The bell button in the top context bar (`CesLayout`) computes:

```ts
overdueSignatures + criticalBlockers
```

…and renders the count with an orange-soft background when > 0.
Clicking it (in production) opens a triage panel listing the urgent
items with deep links to their drawers. This is the single most
important number on the screen for an actively-engaged Compliance
Officer.

## 7. Risk Surfacing Hierarchy

| Severity | Surface |
|----------|---------|
| Catastrophic | Dashboard Critical Risk Banner (red, full-width) |
| High | Top-bar Urgent Escalations counter (orange) |
| Medium | Domain heatmap red/yellow tiles |
| Low | Per-card visual indicators (chip, badge) |
| Informational | Workload table capacity risk dots |

The hierarchy is intentionally redundant: a single critical risk is
visible from at least three surfaces simultaneously. This guards
against attention failure modes (operator on a single page, modal
open, etc.).

## 8. What CES Refuses to Do

- **Auto-resolve blockers** — every blocker requires a human-recorded
  resolution.
- **Hide stale risk** — there is no "snooze" or "dismiss" for any
  surfaced risk; it stays visible until the underlying condition is
  resolved.
- **Allow confidential risk channels** — all risk is shared with the
  Compliance Officer role at minimum. There is no private escalation
  path that bypasses the audit log.

## 9. Risk Telemetry Retention

Risk events (state transitions, escalations, blocker mark/clear) are
written to the same audit log as evidence events. They are
queryable retrospectively for sprint-over-sprint pattern analysis —
the substrate for the Executive Reports trend charts.
