# Pages: Admin / Identity Management

**Routes:** `/admin/users`, `/admin/user-groups`, `/admin/roles`, `/admin/permissions`  
**Files:** `src/policy/security/identity/`  
**Access:** `admin`, `super_admin` only

---

## Page Purpose

The Admin / Identity Management pages provide user account management, role assignments, permission configuration, and group management for the entire platform. Only administrators can access these pages.

---

## UI Layout

### `/admin/users` — User Assignments
| Region | Description |
|---|---|
| User Table | All registered users with name, email, role, status |
| Search | Search by name or email |
| Role Assignment | Dropdown to change a user's role |
| Status Toggle | Activate / deactivate a user account |
| User Detail Panel | Right panel showing user's full profile, assignments, and activity |

### `/admin/user-groups` — User Groups
| Region | Description |
|---|---|
| Group List | All defined user groups with domain classification |
| Group Members | Members in the selected group |
| Add/Remove Members | Controls to manage group membership |

### `/admin/roles` — Roles
| Region | Description |
|---|---|
| Role List | All defined roles with permission counts |
| Role Permissions | Expandable list of permissions per role |

### `/admin/permissions` — Permission Catalog
| Region | Description |
|---|---|
| Permission Table | All permissions with resource, action, and PHI flag |
| Role Mapping | Which roles hold each permission |

---

## Key Actions

- Assign or change user roles
- Activate or deactivate user accounts
- Manage group membership
- View role-to-permission mappings
- Audit user access patterns

---

## Permissions

| Action | Required Role |
|---|---|
| View admin pages | `admin`, `super_admin` |
| Change user roles | `super_admin` only |
| Deactivate users | `admin`, `super_admin` |
| Manage groups | `admin`, `super_admin` |
| View permission catalog | `admin`, `super_admin` |

---

## Audit Impact

Every role change, user status change, and group membership change is logged to the server-side audit system with the administrator's identity, the affected user, and the change made.

---

## Articles

- [01-Overview.md](Articles/01-Overview.md)
- [02-How-To.md](Articles/02-How-To.md)
- [03-Compliance.md](Articles/03-Compliance.md)
