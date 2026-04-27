# 09 — Metrics and Reporting

## 1. The Metrics Philosophy

CES metrics are **regulatory commitments**, not vanity dashboards.
Every KPI corresponds to an obligation the agency has made — to CMS,
to HIPAA, to its accreditor, or to its own Quality Assurance and
Performance Improvement (QAPI) program.

Targets are surveyor-defensible thresholds, not aspirational goals.

## 2. The Five Sprint KPIs

Defined in [`SprintMetrics`](../../../src/policy/ces/types.ts):

| KPI | Target | Source | Failure mode |
|-----|--------|--------|--------------|
| Compliance Completion % | ≥ 85% | Closed units ÷ planned units | Sprint scope failure |
| Audit Readiness Score | ≥ 85 | Weighted readiness across closed + in-flight | Evidence defect risk |
| Active Blocker Count | ≤ 2 | Units in `blocked` at retrospective | Operational throughput risk |
| Signature SLAs Missed | 0 | Signers who exceeded escalation window | eCIgn / signer accountability |
| Upcoming Deadlines (48h) | informational | Units with due date within 48h | Owner load signal |

These are surfaced on the **Executive Dashboard** as `MetricCard`s with
trend deltas vs. the prior sprint.

## 3. Sprint Trend Series

```ts
interface SprintTrendPoint {
  sprintNumber:           number;
  completionRatePct:      number;
  onTimeRatePct:          number;
  blockedResolutionHours: number;
  auditReadinessScore:    number;
  signatureSlaPct:        number;
  carryOverCount:         number;
}
```

A new `SprintTrendPoint` is appended at every retrospective. The
**Executive Reports** page renders six chart panels from this series:

| Chart | Type | Direction |
|-------|------|-----------|
| Compliance Completion Rate (%) | Bar | Higher is better |
| On-Time Completion (%) | Bar | Higher is better |
| Audit Readiness Score | Line | Higher is better |
| Signature SLA Compliance (%) | Line | Higher is better |
| Blocked Resolution Time (hours) | Bar | Lower is better |
| Carry-Over Units Across Sprints | Bar | Lower is better |

Each chart includes the prior-sprint delta and a target reference line
where applicable.

## 4. Domain Risk Heatmap

The dashboard's **Compliance Risk Heatmap** aggregates Execution Units
by `ComplianceDomain` and emits a per-domain risk level:

```ts
type DomainRiskLevel = 'green' | 'yellow' | 'red';
```

Risk inputs per domain:

- Open units count
- Blocked units count
- Average days to escalation across in-flight units
- Carry-over count from prior sprint

The narrative `reason` text is operator-written so executives see
**why** a domain is red, not just **that** it is red.

## 5. Critical Risk Banner

When the system detects:

```
EXECUTION_UNITS.some(u =>
  (u.complianceState === 'awaiting_signature' && u.escalationTimer < 0) ||
  (u.complianceState === 'blocked' && u.workflowPhase === 'audit')
)
```

…the dashboard renders a top **Critical Risk Banner** in red with a
one-click jump to the board. This is the surface that converts a
casual dashboard glance into immediate operator action.

## 6. Workload Distribution Reporting

The **Workload Distribution** page provides per-owner accountability:

| Column | Computation |
|--------|------------|
| Allocated | Total units owned this sprint |
| In Flight | `in_progress` + `awaiting_signature` |
| Awaiting Signature | Units this owner is signature owner for, in `awaiting_signature` |
| Blocked | Owned units in `blocked` |
| Overdue | Owned units past due date |
| Capacity Risk | Aggregated indicator: green / yellow / red |

This is the data the Compliance Officer uses to negotiate
re-assignment **mid-sprint** rather than waiting for the retrospective
to discover overload.

## 7. What CES Does Not Measure

CES intentionally does not track:

- **Velocity / story points** — incompatible with regulatory mandates.
- **Burndown to scope completion** — CES sprints have fixed regulatory
  scope; the relevant question is closure rate, not "remaining work".
- **Throughput / cycle time as primary KPIs** — these are diagnostic
  inputs, not commitments.

Adding these metrics would dilute the regulatory framing and invite
the project-management vocabulary that CES exists to displace.

## 8. Reporting Cadence

| Report | Cadence | Audience |
|--------|---------|----------|
| Sprint Dashboard snapshot | Continuous | Owners, Compliance Officer |
| Sprint Retrospective metrics | Day 14 of each sprint | Administrator, Compliance Officer |
| Sprint Trend Series | After each retrospective | Executive |
| Cross-sprint Audit Index extract | On surveyor request | External / Surveyor |

The Executive Reports surface is the canonical view for the third
report; the first and second are derivable from it.
