# Master Calendar — Overview

**Article:** 01-Overview  
**Page:** Master Calendar (`/calendar`)

---

## What This Page Does

The Master Calendar provides a month-by-month view of every compliance event the agency is required to complete. Each event appears on its scheduled date with a color-coded status badge indicating whether it is on track, at risk, or overdue.

---

## Why It Exists

Regulatory compliance for a home health agency involves dozens of time-sensitive obligations each year — governing body meetings, QAPI reviews, infection control audits, policy reviews, and more. Without a centralized calendar, these obligations can be missed, mismanaged, or completed without proper documentation.

The Master Calendar ensures:
- Every obligation is visible on a single screen
- Deadlines cannot be accidentally ignored (SLA warnings are surfaced)
- Completed events are certified and locked, providing survey-ready proof of completion

---

## Where It Fits in the System

The Master Calendar sits at the intersection of **scheduling** and **execution**:

```
Event Definitions (autogenStore)
        ↓
Master Calendar (display & access)
        ↓
Event Workspace (execution: steps, evidence, approval)
        ↓
Enforcement Store (audit log)
        ↓
Audit Mode (read-only review)
```

---

## Event Status Colors

| Color | Status | Meaning |
|---|---|---|
| Gray | `scheduled` | Upcoming, no action started |
| Blue | `in_progress` | Work has begun |
| Yellow | `sla_warning` | Deadline within 7 days |
| Orange | `overdue` | Past due date |
| Green | `completed` | All steps done, evidence uploaded |
| Teal/Lock | `certified_locked` | Certified by admin, immutable |
| Red | `blocked` | Cannot proceed |

---

## Event Types on the Calendar

| Event Type | Regulatory Basis | Typical Frequency |
|---|---|---|
| Governing Body Meeting | CMS CoP §484.115 | Quarterly |
| QAPI Review | CMS CoP §484.65 | Monthly/Quarterly |
| Policy Review Cycle | CMS CoP §484.105 | Annual |
| Infection Control Audit | State regulations | Quarterly |
| HIPAA Training Review | HIPAA §164.308 | Annual |
| Incident Review | Triggered | As needed |
| Supervisory Visit | CMS CoP §484.75 | Per-case schedule |
