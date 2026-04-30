# Page: Forms

**Route:** `/forms`, `/forms/:formId`  
**File:** `src/policy/pages/FormsPage.tsx`, `src/policy/components/FormViewer.tsx`  
**Access:** All authenticated users

---

## Page Purpose

The Forms page provides the catalog of all compliance forms available in the system, and allows users to complete and electronically sign those forms via the eCIgn system.

---

## UI Layout (Forms Catalog - `/forms`)

| Region | Description |
|---|---|
| Search Bar | Search forms by name, ID, or keyword |
| Domain Filter | Filter by compliance domain |
| Forms Grid | Cards showing form ID, name, domain, required roles, and last-used date |
| Status Badge | Whether the form is active, deprecated, or in draft |

## UI Layout (Form Detail - `/forms/:formId`)

| Region | Description |
|---|---|
| Form Header | Form ID, name, version, effective date |
| Document Body | Full form content (read-only) |
| Signing Workspace | Appears when the form requires a signature — launches `FormSigningWorkspace` |
| Signature History | Prior signatures if form has been signed before |

---

## Key Actions

- Browse and search available forms
- Open a form to read its content
- Complete and electronically sign a form
- Print a blank form
- View prior signature history for a form instance

---

## Linked Workflows

Forms are referenced by workflows. When a workflow step requires a form, it links directly to the form's `form_id`. Completing the form within the workflow context automatically links the signed instance to the `event_id`.

---

## Data Used

| Data | Source |
|---|---|
| Form catalog | Static form registry |
| Form instances | `regulatoryExecutionStore` + `/api/ecign` |
| Signature state | eCIgn system |

---

## Permissions

| Action | Required Role |
|---|---|
| View forms catalog | All authenticated users |
| Sign a form | Role matching the form's required signer |
| View signed instances | All authenticated users |
| Void a signed form | `admin`, `super_admin` |
| Create new form definitions | Not supported in UI (build-time only) |

---

## Audit Impact

All signature actions generate hash-chained audit entries in the eCIgn system. Viewing and printing forms are not individually logged.
