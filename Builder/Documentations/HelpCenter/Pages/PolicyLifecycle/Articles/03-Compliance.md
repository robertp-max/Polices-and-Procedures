# Policy Lifecycle — Compliance Reference

**Article:** 03-Compliance  
**Page:** Policy Lifecycle (`/policy-lifecycle`)

---

## Compliance Purpose

The Policy Lifecycle page documents the formal governance process required to make any policy enforceable. Without a documented approval process, a policy has no legal/regulatory standing, even if its content is correct.

---

## What Compliance Requirements This Page Supports

| Regulatory Standard | Requirement | Lifecycle Role |
|---|---|---|
| CMS CoP §484.105(b)(1) | P&Ps must be reviewed by governing body or appropriate authority | Approval stage with designated approver |
| CMS CoP §484.105(b)(2) | Annual review required | Review cycle tracked via lifecycle transitions |
| HIPAA §164.316(b)(1) | Documentation must be retained for 6 years | Lifecycle history retained indefinitely |
| State licensing | Policies must be approved before implementation | Published state requirement |
| Accreditation bodies | Documented approval process required | Lifecycle audit trail |

---

## What Is Logged

Every lifecycle transition generates an audit entry:

| Transition | Audit Code | Notes |
|---|---|---|
| DRAFT → REVIEW | `POLICY_SUBMIT_REVIEW` | `policy_id`, actor, timestamp |
| REVIEW → APPROVED | `POLICY_APPROVED` | `policy_id`, approver, timestamp |
| REVIEW → REJECTED | `POLICY_REJECTED` | `policy_id`, reason, rejector, timestamp |
| REVIEW → DRAFT | `POLICY_REVISION_REQUESTED` | `policy_id`, reason, actor |
| APPROVED → PUBLISHED | `POLICY_PUBLISHED` | `policy_id`, effective date, actor |
| PUBLISHED → ARCHIVED | `POLICY_ARCHIVED` | `policy_id`, reason, replacing policy ID, actor |

---

## Audit Traceability

To prove a policy went through proper governance:

| Question | Where to Find |
|---|---|
| "Who approved this policy?" | Lifecycle History → `POLICY_APPROVED` entry → approver field |
| "When was this policy last reviewed?" | Lifecycle History → most recent `POLICY_SUBMIT_REVIEW` entry |
| "What is the policy's effective date?" | Policy header → Effective Date field |
| "What replaced this archived policy?" | Archive audit entry → replacing_policy_id |

**Key IDs:**
- `policy_id`: The permanent identifier (e.g., `CL-AM-001`)
- `workflow_id`: The review workflow used (e.g., `CL-AM-001-REVIEW-WF`)
- Lifecycle history entries in `lifecycleStore.history[]`

---

## Compliance Risk: Unpublished Policies

> **Critical:** If a policy required by CMS is in `DRAFT` or `REVIEW` state during a survey, the surveyor will cite this as a deficiency — even if the content is correct. All required policies must be in `PUBLISHED` state before any survey window.

Required-state check before any survey:
1. Go to `/library`
2. Filter by Status = "Draft" or "Under Review"
3. Any result that matches a CMS-required policy is a compliance risk
4. Escalate to the administrator immediately
