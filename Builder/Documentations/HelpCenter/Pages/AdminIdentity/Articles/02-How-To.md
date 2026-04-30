# Admin / Identity Management — How-To Guide

**Article:** 02-How-To  
**Page:** Admin Identity (`/admin/*`)

---

## Managing Users

### Viewing all users
1. Navigate to `/admin/users`
2. All registered users are shown in the table
3. Use the search bar to find a specific user by name or email

### Changing a user's role
1. Find the user in the table
2. Click the **Role** dropdown in their row
3. Select the new role
4. Click **Save** — change takes effect immediately
5. The change is logged with your identity and timestamp

### Deactivating a user account
1. Find the user in the table
2. Click the **Active** toggle to deactivate
3. Confirm in the dialog
4. The user can no longer log in; their prior actions remain in the audit log

### Re-activating a user account
1. Find the user (filter by "Inactive" status)
2. Click the **Inactive** toggle to re-activate
3. The user can log in again with their existing credentials

---

## Managing Groups

### Viewing groups
Navigate to `/admin/user-groups` to see all groups.

### Adding a user to a group
1. Select the target group
2. Click **Add Member**
3. Search for the user by name or email
4. Click **Add** — user is added to the group immediately

### Removing a user from a group
1. Select the group
2. Find the user in the members list
3. Click the **Remove** icon
4. Confirm the removal

---

## Viewing Roles and Permissions

### View what a role can do
1. Navigate to `/admin/roles`
2. Click a role to expand its permission list
3. Permissions show: resource, action, and whether it involves PHI

### View which roles hold a permission
1. Navigate to `/admin/permissions`
2. Find the permission in the table
3. The Role Mapping column shows which roles have this permission

---

## Common Admin Questions

**A user says they cannot access a page they should be able to access**
1. Go to `/admin/users` and find the user
2. Verify their role is correct
3. Check if they are active
4. Check if the page requires group membership vs. just role

**A user left the organization**
1. Deactivate their account immediately (do not delete — their audit history must be preserved)
2. Remove them from any user groups
3. Document the deactivation in your offboarding records
