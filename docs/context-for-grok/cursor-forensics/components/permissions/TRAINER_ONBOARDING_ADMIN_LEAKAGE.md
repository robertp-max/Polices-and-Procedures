# Permissions — Trainer/Onboarding Admin UI Leakage

**Component**: Permission Catalog / User Groups / Role-Based Access Control  
**Severity**: P1 — trainer-role users have implicit admin UI access; DON Assistant signing not enforced  
**Status**: Unresolved as of 2026-05-14  

---

## 1. Symptoms Reported by User

- Users with a Trainer or Onboarding role can see and interact with admin UI elements they should not have access to
- Admin features (user management, system configuration, or similar) are visible to trainer-role users
- Elevated access was not intentionally granted; the behavior emerged from a permission association change

**CES UAT (transcript `3cf17f83`, May 10–11, 2026) — additional role violation found:**

The UAT specification explicitly stated:
> *"DON Assistant may fill out forms and save drafts. DON Assistant must NOT be allowed to sign."*
> *"Role switching must refresh the task/form/signature state."*
> *"Forms must not allow the same user/role to sign twice unless the workflow explicitly requires it."*

DEFECT-Q2-005 (Sprint board sign button not found) is partially related to this: the sign button was absent in the test, but this was attributed to a missing `data-testid`, not a confirmed role gate. The actual role enforcement for DON Assistant was never browser-validated — it is unknown whether the DON Assistant role correctly blocks signing or whether the absence of the button was coincidental.

---

## 2. Prior Attempted Fixes

- No confirmed targeted fix was applied to the permission catalog or user group definitions
- General UI visibility changes may have been made in prior passes without tracing the permission path
- DON Assistant role constraints were specified in the UAT instructions but were not verified to be enforced in the application

---

## 3. Why Prior Fixes Likely Failed

The `user.provision` permission appears to have been added to the Trainer/Onboarding group to support a legitimate trainer workflow (e.g., provisioning demo or onboarding users). However, `user.provision` was wired in the permission catalog or feature catalog to also gate access to the broader admin UI — meaning any user with `user.provision` implicitly gains access to admin features.

This is a **permission scope mismatch**: a narrow operational permission (`user.provision`) was coupled to a broad UI gate (admin panel visibility) without an intermediate scope check. Fixes that addressed the surface-level UI visibility (hiding a button or panel) without fixing the underlying permission catalog coupling would not prevent the leakage from reappearing when UI conditions change.

For DON Assistant: the role definition in `userGroups.ts` may not explicitly block signing. The form signing flow in `FormSignatureFlow.tsx` may check only whether a signature field exists for the user's role, rather than actively blocking signing for roles where it is prohibited.

---

## 4. Exact Files and Components Involved

| File | Role |
|------|------|
| `src/policy/security/identity/permissionCatalog.ts` | Defines all permissions and their scope; `user.provision` definition |
| `src/policy/security/identity/userGroups.ts` | Defines which groups receive which permissions; Trainer/Onboarding and DON Assistant group |
| Feature catalog | Maps permissions to UI feature visibility; where `user.provision` was incorrectly coupled to admin panel |
| Admin UI component(s) | Checks permissions before rendering admin features; may rely on feature catalog gate |
| `FormSignatureFlow.tsx` | Signature flow component; DON Assistant role gate may be absent or unenforced |

---

## 5. Current Suspected Root Cause

1. **Trainer Admin Leakage**: `user.provision` is defined broadly enough in the permission catalog or feature catalog that it triggers admin UI visibility checks. The Trainer/Onboarding group was assigned `user.provision` for a specific, narrow purpose, but the downstream gating logic uses the presence of `user.provision` as a proxy for "is admin."

2. **DON Assistant Signing**: The role definition for DON Assistant may not include an explicit `cannotSign: true` or equivalent flag. The form signing flow checks for a positive permission (e.g., `can.sign`) rather than checking for a prohibition. DON Assistant may fall through to the default "can sign" path if `can.sign` is undefined rather than explicitly `false`.

---

## 6. Validation That Was Claimed

- No targeted validation of this specific issue was documented in any prior session

---

## 7. Validation That Was Missing

- No test of logging in as a trainer-role user and confirming admin UI elements are not visible
- No audit of which permissions are assigned to the Trainer/Onboarding group in `userGroups.ts`
- No check of which UI features are gated by `user.provision` in the feature catalog
- No test confirming that removing `user.provision` from trainers does not break legitimate trainer workflows
- No test of logging in as DON Assistant and confirming the Sign button is absent or disabled on a form that requires DON signing
- No test of DON Assistant role state being refreshed after role switching

---

## 8. Acceptance Criteria for Future Fix

**Trainer Admin Leakage:**
- [ ] A user in the Trainer or Onboarding group cannot see admin UI panels, user management features, or system configuration screens
- [ ] A user in the Trainer or Onboarding group can still perform all legitimate trainer actions (onboarding new users, accessing training materials, etc.)
- [ ] `user.provision` is either narrowed in scope or replaced with a purpose-specific permission in the Trainer/Onboarding group
- [ ] The admin UI visibility gate does not rely on `user.provision` as a proxy for admin status
- [ ] All permission changes are validated in-browser by logging in with a trainer-role test account
- [ ] An audit of all permissions in `userGroups.ts` is completed and documented to confirm no other group has unintended admin access

**DON Assistant Signing:**
- [ ] Log in as DON Assistant role
- [ ] Navigate to a form that requires DON signature
- [ ] Confirm the Sign button or eCIgn signature field is absent or clearly disabled
- [ ] Confirm DON Assistant can fill form fields and save drafts
- [ ] Confirm DON Assistant cannot submit a signature even if the form is in draft mode
- [ ] After role switch (DON Assistant → DON), confirm Sign button becomes available without page refresh

---

## 9. Priority

**P1** — Permission leakage is a security risk before any real-user demo or compliance review. Trainer users with admin access can inadvertently modify system configuration. DON Assistant signing leakage creates invalid audit signatures — a direct CMS compliance risk.
