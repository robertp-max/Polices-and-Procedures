# Policy Lifecycle — Overview

**Article:** 01-Overview  
**Page:** Policy Lifecycle (`/policy-lifecycle`)

---

## What This Page Does

The Policy Lifecycle page manages the formal approval and publication process for every policy in the agency. It is the control room for taking a policy from initial draft through final publication to staff.

---

## Why It Exists

CMS requires that policies be reviewed by appropriate authority before being used operationally. Simply writing a policy is not sufficient — it must be reviewed, approved, and formally published. The Lifecycle page creates an auditable trail for each of these steps.

---

## The Five Lifecycle States

| State | Meaning | Who Acts |
|---|---|---|
| `DRAFT` | Policy is being written or edited | Author, Manager |
| `REVIEW` | Policy is under formal review | Reviewers, Manager |
| `APPROVED` | Policy is approved but not yet live | Admin |
| `PUBLISHED` | Policy is live and enforceable | All staff read it |
| `ARCHIVED` | Policy is retired but retained for history | Super Admin |

**Key rule:** A policy must pass through every state in order. You cannot skip from `DRAFT` directly to `PUBLISHED`.

---

## Where It Fits in the System

```
Policy Lifecycle Page (DRAFT → PUBLISHED)
            ↓
Policy Library (PUBLISHED policies visible here)
            ↓
Calendar Events + Workflows (reference policy_id)
            ↓
Evidence (proves policy was reviewed/acknowledged)
            ↓
Audit Mode (shows policy currency)
```
