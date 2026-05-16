# V-06: UAT Feedback Collection Process
**Care Indeed Home Health — MVP Demo / Internal Training Week**

| Field | Value |
|---|---|
| Task ID | V-06 |
| Workstream | 6 — Validation, UAT & Governance Infrastructure |
| Priority | P1 |
| Owner | Stabilization Lead |
| Status | Ready for Phase 1 close-out |
| Date | 2026-05-16 |

---

## 1. Purpose & Scope

### What This Document Covers

This document defines the process for collecting, triaging, and closing feedback from the **~100–120 internal office users** who will access the Care Indeed policy/compliance system during the internal training week (MVP Demo / Internal UAT environment). These users are primarily office staff given self-service access; only a handful will be active power users during the first training week.

The goal is scalable feedback intake that feeds the Stabilization workstream without overwhelming the team or creating duplicate triage queues.

### What This Document Explicitly Defers

The **5-tier Runtime Validation Strategy** in `UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md §11` governs a separate, structured UAT cohort:

- **Tier 3 — Mobile Field UAT Cohort:** 12–15 clinicians + 4–6 DONs + 3–5 surveyors on real devices under one-handed/gloved/weak-signal/interrupted conditions. This cohort has its own test plan, lead ownership (Lead 12), and pass/fail criteria.
- **Tiers 1, 2, 4, 5:** Automated scripts, 9-test manual browser plan, Compliance Lock regression, and visual regression baselines — all governed by Lead 11/12 under the Unified MVP plan.

V-06 does **not** replace or duplicate any of those tiers. It covers the broader, less structured pool of internal office users whose feedback is ad-hoc and opportunistic rather than scripted.

---

## 2. Feedback Channels

Three channels are used in parallel. No new infrastructure is required.

### Channel A — Slack/Teams Thread (Primary)

**Rationale:** Real-time, low-friction, highest adoption rate for office staff.

- Dedicate a single pinned channel: `#care-indeed-uat-feedback` (or Teams equivalent).
- Pin the feedback template (see §3) at the top.
- All incoming feedback is acknowledged by the Triage Owner within the SLA window (see §4).
- This is the only channel for P0/P1 severity items — urgent issues should not go to email.

### Channel B — Shared Feedback Spreadsheet (Structured Log)

**Rationale:** Gives the triage team a single source of truth that can be sorted, filtered, and status-tracked without any new tooling.

- One shared Google Sheet or Excel Online file named `UAT-Feedback-Log_Training-Week.xlsx`.
- Columns mirror the feedback template fields (§3) plus triage status, owner, and closure note.
- Users may submit directly to the sheet, or the Triage Owner transcribes from Slack if the user only posted there.
- Sheet is the canonical record. Slack posts are inputs, not records.

### Channel C — Email Alias (Overflow / Accessibility)

**Rationale:** Catches users who are not active on Slack/Teams or who encounter issues outside working hours.

- Alias: `uat-feedback@[internal-domain]` (route to Stabilization Lead's inbox).
- Email submissions are transcribed to the spreadsheet by the Triage Owner within 4 hours.
- Email is not monitored in real-time; P0 issues must go to Slack.

---

## 3. Feedback Template / Required Fields

Post this template in the Slack channel description and spreadsheet header row. Users must fill all non-optional fields for the report to be triaged.

```
UAT FEEDBACK REPORT
-------------------
Date/Time:
Your Name (or "Anonymous"):
Severity [P0 / P1 / P2 / Suggestion]:
  P0 = Blocking — cannot complete a core task (sign, submit, navigate)
  P1 = Significant — feature broken or badly wrong, workaround exists
  P2 = Minor — cosmetic, wording, minor UX friction
  Suggestion = Not a bug; idea for improvement

Surface / Page:
  (e.g. "Policy Library", "eCign Signing Flow", "Calendar", "Login", "Onboarding")

What you were trying to do:

What actually happened:

Steps to reproduce (if repeatable):
  1.
  2.
  3.

Browser & Device:
  (e.g. "Chrome 124 / Windows 11 laptop" or "Safari / iPhone 15")

Screenshot or screen recording attached? [Yes / No / N/A]
```

**Screenshot/Video expectation:** Strongly encouraged for P0 and P1. For P2/Suggestion, optional. Users on desktop can use the Snipping Tool or ShareX; mobile users can share a photo via Slack.

---

## 4. Triage Workflow & SLAs

### Step-by-Step Triage

1. **Receive** — Feedback arrives via Slack, email, or spreadsheet direct entry.
2. **Acknowledge** — Triage Owner posts a Slack reply or email reply confirming receipt (within SLA).
3. **Transcribe** — If not already in the spreadsheet, Triage Owner adds the row.
4. **Classify** — Triage Owner assigns/confirms severity (P0–P2/Suggestion), surface label, and reproducibility flag (`Confirmed` / `Cannot Reproduce` / `Needs Info`).
5. **Route** — Triaged item is assigned to Engineering Lead (P0/P1 bugs), QA Lead (validation items), or deferred queue (P2/Suggestions).
6. **Resolve** — Engineering Lead or QA Lead updates the spreadsheet row with closure disposition (see §7).
7. **Notify** — Communication Owner sends a brief note back to the submitter (see §5).

### SLA Table

| Severity | Acknowledge | Triage Complete | Target Resolution |
|---|---|---|---|
| P0 — Blocking | 30 minutes (Slack only) | 1 hour | Same day (within training-day hours) |
| P1 — Significant | 2 hours | 4 hours | Within 2 business days |
| P2 — Minor | Next business day | Next business day | Training week end or deferred with note |
| Suggestion | Next business day | Next business day | Added to post-UAT backlog |

> **Note:** SLAs apply during training-week working hours (assumed 8 AM–6 PM). After-hours P0 reports are addressed at the start of the next business day unless the on-call Engineering Lead judges them critical.

### Where Triaged Items Land

- **P0/P1 confirmed bugs** → Engineering Lead's active work queue; linked in the spreadsheet with a fix PR or commit reference when resolved.
- **P2 / Cannot Reproduce** → Deferred section of the spreadsheet with a note.
- **Suggestions** → Post-UAT backlog column in the spreadsheet; not actioned during training week.

---

## 5. Owner Roles

| Role | Responsibility |
|---|---|
| **Triage Owner** (Stabilization Lead or delegate) | Monitors `#care-indeed-uat-feedback` and email alias; acknowledges all incoming reports; transcribes to spreadsheet; assigns severity and surface labels; routes to the correct handler. |
| **Engineering Lead** | Receives routed P0/P1 bug reports; investigates and fixes or formally defers with a written rationale; updates the spreadsheet row. |
| **QA Lead** | Reviews edge cases that need test-plan validation before a fix is accepted; confirms "Cannot Reproduce" calls; signs off on closures for P0/P1 items. |
| **Escalation Owner** (Engineering Lead → Stabilization Lead) | If a P0 is not acknowledged within 1 hour or not resolved within the same business day, the Stabilization Lead takes direct ownership and may pull in additional resources. |
| **Communication Owner** (Triage Owner) | Sends closure notifications back to feedback submitters (Slack reply or email reply). Keeps responses brief and non-technical. |

---

## 6. Daily / Weekly Cadence During Training Week

### Daily (Each Training Day)

| Time | Activity | Who |
|---|---|---|
| Start of day (~8 AM) | Review overnight Slack/email for new reports; triage and route anything that came in after hours | Triage Owner |
| Mid-day (~12 PM) | 10-min sync: any P0/P1 status updates; unblock Engineering Lead if stuck | Stabilization Lead + Engineering Lead |
| End of day (~5:30 PM) | Update spreadsheet with all day's closure statuses; post a brief daily summary in `#care-indeed-uat-feedback` (total received, P0/P1 resolved, open items) | Triage Owner |

### Weekly (End of Training Week)

- **Wrap-up review:** Stabilization Lead + Engineering Lead + QA Lead review the full spreadsheet. Any remaining open P1s are formally triaged to either (a) fix in post-training sprint or (b) defer with written rationale.
- **Metrics snapshot** (see §8) is captured and saved alongside this document.
- **Feedback channel is archived** (no longer monitored for new submissions) once the training week officially closes.

---

## 7. Closure Criteria

A feedback item is considered **closed** under one of three dispositions:

| Disposition | Criteria |
|---|---|
| **Fixed** | A code change addressing the issue has been deployed to the training environment and the fix is verified (by QA Lead or the Triage Owner) to resolve the reported behavior. Spreadsheet row shows commit/PR reference and a "Verified" stamp. |
| **Deferred — with note** | The issue is real but will not be fixed during the training week. The spreadsheet row must include: (a) why it is deferred, (b) which post-UAT sprint or workstream task it maps to, and (c) the date the deferral decision was made. Submitter is notified. |
| **Won't Fix — with rationale** | The reported behavior is intentional or out of scope for the MVP Demo environment. The spreadsheet row must include a plain-language rationale (e.g., "Cosmetic issue deferred to post-MVP design pass" or "Behavior is by design per the compliance lock"). Submitter is notified. |

**Closure is not valid** if the spreadsheet row lacks a disposition note and a named owner. Empty rows are treated as still-open.

---

## 8. Metrics to Capture

Capture the following at the end of each training day and in the final weekly wrap-up:

| Metric | How to Measure |
|---|---|
| **Total feedback volume** | Count of rows in the spreadsheet |
| **Severity mix** | Count of P0 / P1 / P2 / Suggestion rows |
| **Reproducibility rate** | % of P0/P1 reports confirmed reproducible vs. "Cannot Reproduce" |
| **Time-to-triage** | Time between submission timestamp and "Triage Complete" timestamp in spreadsheet (median and worst case) |
| **Time-to-closure** | Time between submission and closure disposition (median and worst case, by severity) |
| **SLA compliance rate** | % of P0 items acknowledged within 30 min; % of P1 items triaged within 4 hours |
| **Open items at week end** | Count of P0/P1 rows still open at training week close |
| **Surface distribution** | Which surfaces generated the most reports (to inform post-UAT prioritization) |

These metrics are not reported externally. They inform the Stabilization Lead's post-training retrospective and feed into V-07 (success metrics for the Stabilization phase).

---

## 9. What This Document Does NOT Cover

The following items are explicitly out of scope for V-06 and are governed by the documents listed:

| Deferred Item | Governed By |
|---|---|
| Mobile Field UAT cohort (clinicians, DONs, surveyors on real devices under degraded conditions) | MVP Plan §11 Tier 3 — Lead 12 |
| Automated validation scripts (`tsc`, `npm run build`, `verify:*`, `check:*`) | MVP Plan §11 Tier 1 |
| 9-test manual browser plan (Tests 1–9, binary pass/fail gates) | MVP Plan §11 Tier 2 — Lead 11/12 |
| Compliance Lock regression on PRs touching forms/eCign/CES/Evidence | MVP Plan §11 Tier 4 |
| Visual regression baselines (Playwright screenshots) | MVP Plan §11 Tier 5 |
| Go/No-Go gate definitions and rollback authority | V-01, V-04 — this Workstream 6 |
| Post-UAT hardening sprint planning | Post-training retrospective; not in scope for training week |
| Feature requests that require new app capabilities | Not in scope for MVP Demo; route to post-UAT backlog only |
| PHI handling, external client access, production security | Not applicable — MVP Demo / Internal UAT environment only |
| Formal validation matrix redesign | MVP Plan §11 (binding) — do not modify |

---

## Appendix: Spreadsheet Column Layout

For reference when setting up `UAT-Feedback-Log_Training-Week.xlsx`:

| Col | Field |
|---|---|
| A | Report ID (auto-increment) |
| B | Date/Time Submitted |
| C | Submitter Name |
| D | Channel (Slack / Email / Direct) |
| E | Severity (P0 / P1 / P2 / Suggestion) |
| F | Surface / Page |
| G | Description (brief) |
| H | Reproducible? (Confirmed / Cannot Reproduce / Needs Info) |
| I | Browser & Device |
| J | Screenshot/Video? (Yes / No) |
| K | Triage Owner |
| L | Acknowledge Timestamp |
| M | Triage Complete Timestamp |
| N | Assigned To (Engineering Lead / QA Lead / Deferred) |
| O | Closure Disposition (Fixed / Deferred / Won't Fix) |
| P | Closure Note / PR Reference |
| Q | Closure Timestamp |
| R | Submitter Notified? (Yes / No) |

---

**Status: Ready for Phase 1 close-out — 2026-05-16**
