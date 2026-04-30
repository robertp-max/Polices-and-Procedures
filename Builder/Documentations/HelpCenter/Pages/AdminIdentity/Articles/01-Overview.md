# Admin / Identity Management — Overview

**Article:** 01-Overview  
**Page:** Admin Identity (`/admin/*`)

---

## What These Pages Do

The Admin pages control who can access the system, what they can do, and how they are organized into groups. This is the access control layer for the entire platform.

---

## Why They Exist

Regulatory compliance requires that access to sensitive information be **limited to those with a legitimate need**. HIPAA requires role-based access control for PHI. CMS requires that only authorized personnel can approve, certify, or modify compliance records.

The Admin pages enforce these requirements by:
- Restricting access to compliance-critical actions by role
- Providing an auditable record of all access changes
- Ensuring only active, authorized personnel can access the system

---

## Role System

The system uses six primary roles:

| Role | Description | Access Level |
|---|---|---|
| `staff` | Front-line staff — read-only access to their own tasks and assigned policies | Minimal |
| `coordinator` | Compliance coordinators — can complete tasks, upload evidence | Operational |
| `manager` | Clinical/compliance managers — can approve, accept evidence | Supervisory |
| `admin` | System administrators — full operational control | Administrative |
| `super_admin` | Super administrators — full system access including destructive actions | Privileged |
| `auditor` | External auditors — read-only access to all compliance records | Read-only |

---

## PHI Permissions

Permissions flagged with `phi=true` in the Permission Catalog are subject to HIPAA access controls. Access to PHI-tagged resources is logged with higher priority in the audit system (`CRITICAL_ACTIONS` set in `auditLog.ts`).

---

## Access Denied Page

If a user attempts to navigate to a page they do not have permission to access, the system redirects to the **Access Denied** page (`AccessDeniedPage`), which explains why access was denied and who to contact.
