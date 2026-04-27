# 06 — Calendar Integration

## 1. Why Calendar is Central, Not Cosmetic

In most project tools the calendar view is a read-only afterthought. In
CES the calendar is **operationally load-bearing**: every Execution Unit
inherits its due date from a real regulatory anchor, and the calendar
view is how owners read the sprint's pressure topology at a glance.

The Compliance Calendar surface lives at
[`src/policy/ces/components/calendar/ComplianceCalendar.tsx`](../../../src/policy/ces/components/calendar/ComplianceCalendar.tsx).

## 2. The 14-Day Grid

The calendar is a strict **2-row × 7-column** grid covering Days 1–14
of the active sprint, Monday-aligned. There is no month view, no
quarter view, no agenda view. The sprint window is the entire context.

```
Mon  Tue  Wed  Thu  Fri  Sat  Sun
─────────────────────────────────
 1    2    3    4    5    6    7      ← Week 1
 8    9   10   11   12   13   14      ← Week 2 (Day 14 = Retrospective)
```

Weekend cells are tinted but not disabled — some compliance events
(notably HR drills and patient safety exercises) intentionally fall on
weekends.

## 3. Marker Types

| Marker | Source | Visual |
|--------|--------|--------|
| **Event Anchor** | `ComplianceEvent.anchorDate` | Domain-tinted pill with left accent bar |
| **Signature Window** | Units in `awaiting_signature` due that day | Orange-tinted dashed block with signer avatars |
| **Recurring** | Events of category `recurring` or `mandated` | Amber `Repeat` icon top-right |
| **Retrospective** | Sprint Day 14 | Red banner + `RotateCcw` icon |

## 4. Domain Color Mapping

```ts
DOMAIN_TONE = {
  clinical:   { bg: '#E8F1FF',           fg: NAVY   },
  compliance: { bg: ORANGE_SOFT,         fg: ORANGE },
  hr:         { bg: GREEN_SOFT,          fg: GREEN  },
  governance: { bg: AMBER_SOFT,          fg: AMBER  },
};
```

The mapping is **stable across all CES surfaces** — the same color
identifies the same domain on the dashboard heatmap, the calendar, the
board domain pill, and the executive reports.

## 5. Anchor Date Sources

| Source | Sync mechanism |
|--------|---------------|
| CMS-mandated events (QAPI, GB, EP) | Configured in compliance calendar service |
| Recurring HR events (recerts) | Computed from credential expiry dates |
| Triennial/biennial events | Computed from prior cycle anchor |
| Trigger-based events (incidents) | Created at incident report time |
| Retrospective remediation | Created automatically at sprint Day 14 |

The CES UI **never authors** these anchor dates. It only consumes them.

## 6. Reading the Calendar

A compliance officer scanning the calendar should be able to answer
within 10 seconds:

1. **What's due today?** — top-anchored event pills + signature blocks.
2. **What's about to escalate?** — orange dashed signature blocks.
3. **What's the retrospective day?** — red banner on Day 14.
4. **Where's the load?** — visual density of markers per day.

The dashboard answers *what's blocked and why*; the calendar answers
*when things are due*. Each surface is optimized for one question.

## 7. Implementation Notes

- The calendar groups events, signature units, and recurrence markers
  into per-day `Map<dayKey, T[]>` structures using `useMemo`.
- Day cells have minimum height `140px` to ensure marker stacking
  remains readable even on dense days.
- The calendar deliberately **does not** support drag-to-reschedule.
  Due dates are regulatory and cannot be moved through the UI; they
  change only through formal anchor-date updates upstream.

## 8. Future Extensions

- Multi-sprint look-ahead (current + next 2 sprints) for governance
  planning.
- Filter chips per domain to declutter on heavy sprints.
- Integration with Master Calendar (`/calendar`) for cross-cycle view.
