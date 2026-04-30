# Workflow: Governing Body Meeting (GV-GB-001-WF)

**Workflow ID:** `GV-GB-001-WF`  
**Domain:** Governance (GV)  
**Linked Policy:** `GV-GB-001` — Governing Body Charter  
**Risk Band:** `high`  
**Cadence Kind:** `time_based`  
**Cadence Interval:** `quarterly`

---

## Trigger

This workflow is triggered **quarterly** by the auto-generation engine (`autogenStore`). The first event of each year is also triggered on January 1. The `event_id` format is `governing_body_meeting-{YYYYMMDD}-{seq}`.

The workflow may also be triggered **on-demand** by an administrator for an emergency governing body meeting.

---

## Steps

| # | Step | Responsible Role | Required |
|---|---|---|---|
| 1 | Schedule the meeting and notify all governing body members | Administrator | Yes |
| 2 | Prepare and distribute the meeting agenda (min. 7 days in advance) | Administrator | Yes |
| 3 | Confirm quorum of governing body members (minimum 50%+1) | Administrator | Yes |
| 4 | Conduct the meeting | Governing Body Chair | Yes |
| 5 | Record attendance on the official roster | Secretary/Administrator | Yes |
| 6 | Document meeting minutes (all agenda items, decisions, votes) | Secretary/Administrator | Yes |
| 7 | Obtain signature on meeting minutes from the Chair | Governing Body Chair | Yes |
| 8 | Upload attendance roster as evidence | Administrator | Yes |
| 9 | Upload signed meeting minutes as evidence | Administrator | Yes |
| 10 | Submit for Administrator approval | Coordinator | Yes |
| 11 | Administrator certifies and locks the event | Administrator | Yes |

---

## Dependencies

- Governing body member list must be current in the system
- Prior quarter's governing body meeting must be certified before this workflow begins (enforced by `enforcementStore` blocker check)
- `GV-GB-001` policy must be in `PUBLISHED` state

---

## Inputs

| Input | Description | Required |
|---|---|---|
| Meeting date and time | Scheduled meeting datetime | Yes |
| Attendee list | Names and roles of all participants | Yes |
| Agenda document | Pre-meeting agenda (PDF or Word) | Yes |
| Meeting minutes document | Post-meeting signed minutes (PDF) | Yes |

---

## Outputs

| Output | Type | Where Stored |
|---|---|---|
| Completed step record | Step completion entries | `regulatoryExecutionStore` |
| Accepted meeting minutes | Evidence document | `evidence` under `event_id` |
| Accepted attendance roster | Evidence document | `evidence` under `event_id` |
| Certified event record | Lock entry | `enforcementStore` |
| Audit trail entries | Hash-chained log entries | `enforcementStore` |

---

## Linked Forms

| Form ID | Form Name | Required Stage |
|---|---|---|
| `GV-FM-001` | Governing Body Meeting Minutes Template | Step 6 |
| `GV-FM-002` | Meeting Attendance Roster | Step 5 |

---

## Linked Tasks

- Scheduler creates tasks automatically for assigned coordinator and administrator
- Tasks appear in My Tasks (`/ces/my-tasks`) under the `GV` domain
- Task IDs are linked to `event_id` via `pmApiClient`

---

## Evidence Generated

| Evidence Kind | Description | Linked `event_id` |
|---|---|---|
| `meeting_minutes` | Signed minutes document | `governing_body_meeting-{date}-{seq}` |
| `attendance_roster` | Signed roster of attendees | `governing_body_meeting-{date}-{seq}` |

---

## Approval Body

| Stage | Approver Role | CMS Basis |
|---|---|---|
| Final approval | `admin` or `super_admin` | CMS CoP §484.115(a) |

---

## Timeline & SLA

| Milestone | Timing |
|---|---|
| Workflow trigger | First day of the quarter |
| Meeting must occur | Within 30 days of trigger |
| Minutes upload deadline | Within 14 days after the meeting |
| Certification deadline | Within 30 days of meeting date |
| SLA warning | 7 days before certification deadline |
| SLA urgent | 3 days before certification deadline |

---

## Exception Handling

| Exception | Required Action |
|---|---|
| Quorum not achieved | Meeting must be rescheduled; cannot certify without quorum |
| Key member absent | Document in minutes; meeting may proceed if quorum is met |
| Minutes not approved by Chair | Chair must sign revised minutes before certification |
| Emergency meeting required | Administrator creates an on-demand event with `triggered` cadence |

---

## Quality Indicators

- 100% of quarterly meetings certified on time
- Zero meetings certified without uploaded minutes and attendance roster
- All governing body members informed at least 7 days in advance
- Meeting frequency compliant with charter (minimum quarterly)

---

## Revision History

| Date | Change | Author |
|---|---|---|
| 2026-01-01 | Initial workflow definition | Compliance Officer |
| 2026-04-01 | Added Step 3 (quorum confirmation) | Compliance Officer |
