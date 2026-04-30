# Master Calendar — Compliance Reference

**Article:** 03-Compliance  
**Page:** Master Calendar (`/calendar`)

---

## Compliance Purpose

The Master Calendar is the agency's primary instrument for **demonstrating proactive regulatory compliance**. It replaces manual tracking systems (spreadsheets, wall calendars) with an auditable, tamper-evident system.

---

## What Compliance Requirements This Page Supports

| Regulatory Standard | Obligation | Calendar Event Type |
|---|---|---|
| CMS CoP §484.115(a) | Governing body must meet regularly | `governing_body_meeting` |
| CMS CoP §484.65(b) | QAPI program with ongoing data collection | `qapi_review` |
| CMS CoP §484.105(b) | Annual review of all policies and procedures | `policy_review_cycle` |
| CMS CoP §484.75(b) | Supervisory visits for home health aides | `supervisory_visit` |
| 42 CFR Part 2 / State regulations | Infection control monitoring | `infection_control_audit` |
| HIPAA §164.308(a)(5) | Annual security awareness training | `hipaa_training_review` |

---

## What Must Be Completed for Each Event

For an event to be considered **compliant and survey-ready**, all of the following must be true:

1. **All workflow steps completed** — verified by step completion checkmarks
2. **Evidence uploaded and accepted** — at least one `accepted` evidence document linked to the `event_id`
3. **Approval granted** — all required approval stages approved
4. **Event certified** — Administrator has applied certification lock

Events that do not meet all four conditions will appear as gaps in the audit report.

---

## What Is Logged

Every interaction with a calendar event generates an audit log entry. The following are the most compliance-critical entries:

| Action | Audit Code | Where Stored |
|---|---|---|
| Event created (auto-generated) | `EVENT_CREATED` | `autogenStore` + `enforcementStore` |
| Step completed | `STEP_COMPLETE` | `enforcementStore` (client) + `server/audit/writer.ts` |
| Evidence uploaded | `EVIDENCE_UPLOAD` | `enforcementStore` + `/api/ecign` |
| Evidence accepted | `EVIDENCE_ACCEPTED` | `enforcementStore` |
| Event certified | `EVENT_CERTIFIED` | `enforcementStore` (hash-chained) |
| Schedule overridden | `SCHEDULE_OVERRIDE` | `calendarStore` + `enforcementStore` |
| Event locked | `EVENT_LOCKED` | `enforcementStore` |

---

## Audit Implications

### For CMS Surveys

CMS surveyors will ask to see documentation that governing body meetings occurred, QAPI was conducted, and policies were reviewed. The Master Calendar provides:

- **Date and time** of each event's completion
- **Actor** (who completed each step)
- **Evidence** (the actual documents uploaded)
- **Certification timestamp** (when the administrator locked the event)

All of this information is accessible via `/audit` (Auditor Mode) and the Evidence Center.

### For Internal Audits

Use the following identifiers to trace a specific event through the system:

| ID Type | Format | Example |
|---|---|---|
| `event_id` | `{event_type}-{YYYYMMDD}-{seq}` | `qapi_review-20260401-01` |
| `workflow_id` | Links to the workflow used | `QA-QI-001-WF` |
| `policy_id` | The governing policy | `QA-QI-001` |

### Immutability Guarantee

Once an event is in `certified_locked` state:
- No steps can be added, removed, or changed
- No new evidence can be submitted (superseding evidence creates a new version, not a replacement)
- The certification record is hash-chained and cannot be altered without breaking the chain

Chain integrity can be verified at any time via `POST /api/audit/verify-chain`.

---

## Survey Readiness Checklist (Calendar-Specific)

Before a survey, verify that the following are all certified and locked:
- [ ] Most recent Governing Body Meeting
- [ ] Most recent QAPI Review
- [ ] Current year Policy Review Cycle
- [ ] Most recent Infection Control Audit
- [ ] HIPAA Training Review (current year)
- [ ] All supervisory visit logs for active patients (past 12 months)
