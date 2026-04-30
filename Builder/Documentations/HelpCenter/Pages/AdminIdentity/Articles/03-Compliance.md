# Admin / Identity Management — Compliance Reference

**Article:** 03-Compliance  
**Page:** Admin Identity (`/admin/*`)

---

## Compliance Purpose

Access control management is a **core HIPAA Security Rule requirement**. The Admin pages provide the tools to implement and document the agency's access control policies.

---

## What Compliance Requirements This Page Supports

| Regulatory Standard | Requirement | Admin Page Role |
|---|---|---|
| HIPAA §164.308(a)(3) | Workforce authorization and access controls | Role-based access control |
| HIPAA §164.308(a)(4) | Information access management | Permission catalog |
| HIPAA §164.312(a)(1) | Unique user identification | One account per user, no sharing |
| HIPAA §164.312(a)(2) | Emergency access procedure | `super_admin` override capability |
| CMS CoP §484.105 | Only authorized personnel can approve P&Ps | Role guard on approval actions |
| CMS CoP §484.115 | Governing body members identified | Group membership for GB role |

---

## What Must Be Completed for Access Control Compliance

1. **Every user must have a unique account** — no shared logins
2. **Roles must reflect actual job responsibilities** — review role assignments quarterly
3. **Terminated employees must be deactivated immediately** — not deleted
4. **PHI access must be limited to minimum necessary** — audit PHI-flagged permission assignments
5. **Role changes must be documented** — the audit log provides this automatically

---

## What Is Logged

| Action | Audit Code | Priority |
|---|---|---|
| User role changed | `USER_ROLE_CHANGED` | HIGH |
| User account deactivated | `USER_DEACTIVATED` | HIGH |
| User account activated | `USER_ACTIVATED` | MEDIUM |
| Group membership changed | `GROUP_MEMBERSHIP_CHANGED` | MEDIUM |
| Login success | `LOGIN_SUCCESS` | HIGH (CRITICAL_ACTIONS) |
| Login failure | `LOGIN_FAILURE` | HIGH (CRITICAL_ACTIONS) |
| PHI access | `PHI_ACCESS` | CRITICAL |

---

## Audit Traceability

To demonstrate access control compliance:

| Surveyor Request | How to Respond |
|---|---|
| "Show who has access to patient information" | `/admin/permissions` → filter by `phi=true` → shows roles |
| "Show who accessed patient records" | `/api/audit/events` filtered by `PHI_ACCESS` action |
| "Show how you control access for terminated employees" | Deactivation log entries in audit trail |
| "Show your role assignment review process" | Role change log entries + quarterly review documentation |

---

## Minimum Necessary Standard (HIPAA)

The Permission Catalog includes a `phi` flag for each permission. Administrators must:
1. Regularly review which roles have `phi=true` permissions
2. Ensure only staff who directly need PHI to do their job hold those permissions
3. Document the review and its findings quarterly

This review should be part of the **Annual HIPAA Security Review** calendar event.
