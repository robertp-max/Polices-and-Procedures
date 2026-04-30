# Dashboard — Compliance Reference

**Article:** 03-Compliance  
**Page:** Dashboard (`/dashboard`)

---

## Compliance Purpose

The Dashboard serves as the **primary compliance monitoring interface** for the agency's ongoing survey readiness. CMS Conditions of Participation (CoPs) for Home Health Agencies require that agencies maintain active, documented evidence of ongoing quality improvement, governance oversight, and clinical compliance.

The Dashboard operationalizes these requirements by surfacing the real-time gap state of all tracked compliance obligations.

---

## What Compliance Requirements This Page Supports

| Regulatory Standard | Requirement | Dashboard Role |
|---|---|---|
| CMS CoP §484.65 | Quality Assessment and Performance Improvement (QAPI) — agency must have an ongoing program | Surfaces QAPI events and their completion status |
| CMS CoP §484.115 | Governing Body must meet and oversee the agency | Surfaces Governing Body meeting events and certification state |
| CMS CoP §484.105 | Comprehensive Assessment — policies must be current | Surfaces policy review cycle events |
| State Licensing Requirements | Annual policy review, training completion | Surfaces annual review events |
| HIPAA §164.308 | Risk management and workforce training | Surfaces HIPAA training completion events |

---

## What Must Be Completed

For the Dashboard to reflect a healthy compliance state (`audit_ready`), the following conditions must be met for each active event:

1. All workflow steps must be marked complete
2. At least one accepted evidence document must be attached
3. All required approvals must be granted
4. The event must be certified by an Administrator

Any event that does not meet these conditions contributes to the "Evidence Gaps" or "Overdue Events" count on the Dashboard.

---

## What Is Logged

The Dashboard itself does not generate audit log entries. However, every action taken from the Dashboard (opening an event, completing a task, uploading evidence) generates audit entries in the following systems:

| System | Log Location | Entry Type |
|---|---|---|
| Client-side enforcement | `enforcementStore` (localStorage) | `STEP_COMPLETE`, `EVIDENCE_UPLOAD`, `EVENT_CERTIFIED` |
| Server-side audit | DynamoDB / SQLite (`server/audit/writer.ts`) | All critical actions |
| eCIgn chain | `server/ecign/hashChain.ts` | Signature events only |

---

## Audit Implications

The state shown on the Dashboard at any point in time is a direct reflection of the organization's **survey readiness posture**. If a surveyor requests evidence of an event:

1. Navigate to `/audit` (Auditor Mode) to see the immutable, locked view of all certified events
2. Use `event_id` to locate the specific event
3. Retrieve evidence via the Evidence Center (`/evidence`)
4. The full audit trail (including who completed each step, when, and what evidence was attached) is accessible via the Audit Guide (`Audit/AuditGuide.md`)

---

## Key IDs for Audit Traceability

When reviewing Dashboard-surfaced events for audit purposes, use these IDs:

| ID Type | Format | Example | Where to Find |
|---|---|---|---|
| `event_id` | `{event_type}-{YYYYMMDD}-{seq}` | `governing_body_meeting-20260514-01` | Event Workspace header |
| `workflow_id` | `{domain}-{abbrev}-{seq}-WF` | `GV-GB-001-WF` | Workflow Detail View |
| `policy_id` | `{domain}-{abbrev}-{seq}` | `GV-GB-001` | Policy Library |

---

## Survey Readiness Test

Before a survey, the following Dashboard conditions must be true:
- "Overdue Events" = 0
- "Evidence Gaps" = 0
- "Blocked Events" = 0
- "SLA Warning" count is manageable (ideally 0)

If any of these counts are non-zero, work must be completed before the survey window.
