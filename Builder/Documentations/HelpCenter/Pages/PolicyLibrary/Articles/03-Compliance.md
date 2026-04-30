# Policy Library — Compliance Reference

**Article:** 03-Compliance  
**Page:** Policy Library (`/library`)

---

## Compliance Purpose

The Policy Library fulfills the CMS requirement that agencies maintain accessible, current, written policies and procedures. Surveyors routinely request specific policies during site visits; the Library allows immediate retrieval of any policy with its full version history.

---

## What Compliance Requirements This Page Supports

| Regulatory Standard | Requirement | Library Role |
|---|---|---|
| CMS CoP §484.105(b)(1) | Agency must have written P&Ps governing all operations | All policies stored here |
| CMS CoP §484.105(b)(2) | P&Ps must be reviewed at least annually | Review dates tracked per policy |
| CMS CoP §484.75(a) | Clinical policies must be accessible to clinical staff | Library accessible to all authenticated staff |
| HIPAA §164.316(a) | Security policies must be maintained in written form | IT and CO domain policies |
| State licensing requirements | Policies must reflect current regulatory standards | Version history proves currency |

---

## What Must Be Completed for Policy Compliance

For the Policy Library to be in a compliant state:

1. **All required policies must have `Published` status** — no required policy should be in `Draft` or `Under Review` during a survey
2. **Policies must have a current effective date** — policies older than the review cycle (usually 1 year) without a review event are a gap
3. **Policy review events must be certified** — each Annual Policy Review cycle must have a certified calendar event as evidence

---

## What Is Logged

| Action | Audit Code | Notes |
|---|---|---|
| Policy published | `POLICY_PUBLISHED` | `policy_id`, version, actor, timestamp |
| Policy archived | `POLICY_ARCHIVED` | `policy_id`, reason, actor |
| Policy viewed (Tier 3/4) | `POLICY_VIEW` | `policy_id`, user, timestamp |
| Policy downloaded | `POLICY_DOWNLOAD` | `policy_id`, user, format |
| Policy attestation | `POLICY_ATTEST` | `policy_id`, staff ID, timestamp |

---

## Audit Traceability

To trace a policy in an audit:

| ID Type | Where to Find | Format |
|---|---|---|
| `policy_id` | Policy header, URL (`/library/{policy_id}`) | `GV-GB-001` |
| `workflow_id` | Linked workflow section of the policy | `GV-GB-001-WF` |
| `event_id` | Calendar events linked to this policy's review | `policy_review_cycle-{YYYYMMDD}-01` |

### Example audit trace for a governing body policy:
1. Policy: `GV-GB-001` (Governing Body Charter)
2. Annual review event: `policy_review_cycle-20260101-01`
3. Workflow: `GV-GB-001-WF`
4. Evidence: Meeting minutes uploaded and accepted under event `governing_body_meeting-20260514-01`

---

## Surveyor Quick-Access

When a surveyor requests a policy:
1. Navigate to `/library`
2. Search by policy ID or name
3. Open the policy and show the effective date and version
4. If they ask "when was this last reviewed?", click the version selector to show the review history
5. If they ask for evidence the policy was implemented, navigate to `/audit` and filter by `policy_id`
