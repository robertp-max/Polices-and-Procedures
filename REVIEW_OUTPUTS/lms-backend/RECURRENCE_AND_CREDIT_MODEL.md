# Recurrence & Credit Model — Care Indeed LMS Backend

Covers architecture **§13 (credit and hours ledger)** and **§14 (recurrence architecture)**,
mapped to the pure domain logic in `src/learning/domain/recurrence.ts`. Core principle
(§14): *"Annual" is not one boolean* — cycles are deterministic, hours accumulate from
validated evidence, and **current readiness never erases historical completion**.

---

## 1. Recurrence anchors and deterministic cycle keys (§14.1)

A recurrence rule pins an **anchor** that decides which window a reference date falls into.
`computeCycleKey(anchor, at)` returns a stable, collision-free segment key. Because it is a
pure function of `(anchor, UTC date)`, the same subject re-evaluated on the same day always
lands in the same cycle — this is what prevents duplicate annual assignments.

| Anchor (`RecurrenceAnchor`)        | Extra input                       | `computeCycleKey` result             | Example        |
| ---------------------------------- | --------------------------------- | ------------------------------------ | -------------- |
| `CALENDAR_YEAR`                    | —                                 | `CY-<year>`                          | `CY-2026`      |
| `HIRE_ANNIVERSARY`                 | `hireDate`                        | `HIRE-<windowYear>`                  | `HIRE-2025`    |
| `ROLLING_12_MONTHS`                | —                                 | `ROLL-<year>-<MM>`                   | `ROLL-2026-07` |
| `QUARTER`                          | —                                 | `Q<n>-<year>`                        | `Q3-2026`      |
| `CREDENTIAL_EXPIRY`                | `expiry`                          | `CRED-<YYYY-MM-DD>`                  | `CRED-2027-01-31` |
| `POLICY_PUBLICATION`               | `publishedAt`, `policyVersion`    | `POL-<version>-<YYYY-MM-DD>`         | `POL-3.2-2026-07-01` |

**Hire-anniversary window logic** (`recurrence.ts` lines ~29–35): the anniversary date is
recomputed in the current UTC year; if the reference date is on/after that anniversary the
window is the current year, otherwise it belongs to the prior year. This keeps a person's
cycle boundary on their hire month/day rather than Jan 1.

All date math is **UTC** (`getUTC*`) so cycle keys are timezone-stable — satisfying the §22
build gate "a recurrence rule lacks timezone/cycle strategy".

### 1.1 Unique key composition (§14.2)

```ts
cycleUniqueKey(subjectId, requirementRef, ruleRef, cycleKey)
// → `${subjectId}#REQ:${req.id}v${req.version}#RULE:${rule.id}v${rule.version}#${cycleKey}`
```

The uniqueness tuple is exactly the architecture's:

```
subject + requirement revision + recurrence-rule revision + cycleKey
```

Both the requirement **and** the recurrence-rule versions are part of the key, so republishing
a rule opens a genuinely new cycle instead of colliding with the old one. This string is the
natural Firestore document id for a `RecurrenceCycle` and the idempotency guard against
duplicate annual assignments.

---

## 2. RecurrenceCycle status machine (§14.2)

`deriveCycleStatus({ availableAt, dueAt, windowEnd, satisfied, now })` is a pure projection
of a cycle's timestamps against the clock. `satisfied` short-circuits everything —
completion is sticky and cannot revert to a live state.

| Condition (evaluated in order)          | Status      |
| --------------------------------------- | ----------- |
| `satisfied === true`                    | `SATISFIED` |
| `now < availableAt`                     | `SCHEDULED` |
| `now > windowEnd`                       | `OVERDUE`   |
| `now > dueAt` (and ≤ windowEnd)         | `DUE`       |
| otherwise (availableAt ≤ now ≤ dueAt)   | `OPEN`      |

```
        now < availableAt        availableAt ≤ now ≤ dueAt      dueAt < now ≤ windowEnd     now > windowEnd
SCHEDULED ───────────────► OPEN ─────────────────────────► DUE ───────────────────────► OVERDUE
     │                       │                               │                              │
     └───────────────────────┴──────── satisfied=true ───────┴──────────────────────────────┘
                                        ▼
                                    SATISFIED   (terminal; CLOSED is the archival/rollover state)
```

`CLOSED` (present in the `CycleStatus` union and the §14.2 interface) is the administrative
terminal state used when a cycle is rolled over or superseded; `deriveCycleStatus` itself
only emits the five live/terminal-by-time states plus `SATISFIED`, and callers set `CLOSED`
on rollover.

---

## 3. Credit / hours ledger (§13)

The ledger is append-only and **accepted-only** for accumulation. `CreditLedgerEntry`
(`types.ts`) carries a `status` of `ACCEPTED | REJECTED | REVERSED` and a `creditType`:

| `creditType`          | Meaning                                   | Feeds                          |
| --------------------- | ----------------------------------------- | ------------------------------ |
| `TRAINING_HOUR`       | General training hours                    | Transcript hours              |
| `HHA_INSERVICE_HOUR`  | HHA in-service education hours            | HHA rolling 12-hour gate      |
| `CEU`                 | Continuing-education units                 | CEU reporting                 |

### 3.1 Accepted-only summation

```ts
sumAcceptedCredit(entries, creditType, start, end)
```

Filters to `status === 'ACCEPTED'` **and** matching `creditType`, keeps entries whose
`occurredAt` is within the inclusive window `[start, end]`, and sums `value`. `REJECTED` and
`REVERSED` (and pending/unaccepted external certificates) contribute **zero** — directly
enforcing §13 "external certificates remain pending until reviewed" and §11.7 "must not be
calculated from a single boolean".

### 3.2 HHA rolling 12-hour in-service (§11.7, §13)

```ts
hhaInserviceHours(entries, now) // → { total, meets12 }
```

- Window = `[subtractMonths(now, 12), now]`, computed with UTC-safe month arithmetic
  (`subtractMonths`, lines ~74–76).
- `total` = `sumAcceptedCredit(entries, 'HHA_INSERVICE_HOUR', start, now)`.
- `meets12` = `total >= 12`.

This is the ledger input to the `HHA_INSERVICE_12H` certificate gate
(`ACCUMULATED_VALUE` gate rule, §10.1 / §11.7). The gate reads a **validated rolling total**,
never a completion flag; a single module completion is not one hour unless the published
credit definition says so (§13).

---

## 4. Readiness vs. historical completion (§14.3)

`lapseImpact()` encodes the non-negotiable separation between *current readiness* and
*immutable history*:

| A current annual lapse **affects** | A current annual lapse **preserves**   |
| ---------------------------------- | -------------------------------------- |
| `ANNUAL_READINESS`                 | `HISTORICAL_ONBOARDING_COMPLETION`     |
| `FIELD_CLEARANCE`                  | `HISTORICAL_CERTIFICATE`               |
| `SCHEDULING_ELIGIBILITY`           | `PAST_ATTEMPT`                         |
|                                    | `PAST_EVIDENCE`                        |

An overdue annual cycle may flip a `FIELD_CLEARANCE` / `ANNUAL_READINESS` gate to `FAIL`, but
it can never rewrite a historical onboarding `CertificateRecord` or delete a past attempt —
the property-test invariant "annual lapse never edits historical onboarding certificate"
(§24.2). This is the ledger/recurrence counterpart to the §12.6 rule that a later annual
lapse does not rewrite the historical onboarding certificate.

---

## 5. Transcript projection (§19.1)

`buildTranscript(input)` is a read-model shaper (not authoritative state). Given
`{ completed, current, hoursLedger }` it returns counts plus the passthrough rows and the
per-`creditType` hour totals:

```ts
buildTranscript({ completed, current, hoursLedger })
// → { completedCount, currentCount, completed, current, hours }
```

Each `TranscriptRow` links an assignment to its status and, when issued, its
`certificatePublicId` — so the learner transcript surfaces certificate links (§19.1) without
exposing any authoritative decision logic. The hours block is fed by the accepted-only ledger
totals from §3, keeping displayed hours consistent with what the gates actually counted.

---

## 6. Function → architecture map

| `recurrence.ts` symbol      | Architecture ref | Role                                                    |
| --------------------------- | ---------------- | ------------------------------------------------------- |
| `computeCycleKey`           | §14.1            | Deterministic cycle segment key per anchor              |
| `cycleUniqueKey`            | §14.2            | Duplicate-cycle guard (subject+req+rule+cycleKey)       |
| `deriveCycleStatus`         | §14.2            | Cycle status machine                                    |
| `subtractMonths`            | §13              | UTC-safe rolling-window bound                           |
| `sumAcceptedCredit`         | §13              | Accepted-only credit summation by type/window           |
| `hhaInserviceHours`         | §11.7, §13       | Rolling 12-month HHA in-service total + `meets12`       |
| `lapseImpact`               | §14.3            | Readiness-affects vs. history-preserves partition       |
| `buildTranscript`           | §19.1            | Learner transcript read model                           |
