# V3 Veil Glass — Navigation Wiring Template

**Purpose**: This document is a required deliverable.  
Claude must complete this mapping so that after the V3 design is transferred, **every sidebar endpoint is properly wired** to real pages in the production application.

## Source of Truth
The navigation structure below is taken directly from `01_Visual_Reference/V3_Dashboard_Reference.tsx`.  
This is the exact menu hierarchy and labels that must exist in the final V3 application.

---

## Current V3 Navigation Structure (Target)

```ts
const navSections = [
  {
    title: 'PRIMARY OPERATIONS',
    items: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'clinicians', label: 'Clinician Profiles' },
      { id: 'patients', label: 'Patient Profiles' },
      { id: 'calendar', label: 'Calendar' },
      { id: 'brad', label: 'Brad AI Copilot' },
      { id: 'ces', label: 'Compliance Execution (CES)' },
    ]
  },
  {
    title: 'COMPLIANCE EXECUTION',
    items: [
      { id: 'taxonomy', label: 'Taxonomy' },
      { id: 'onboarding', label: 'Onboarding' },
      { id: 'policy', label: 'Policy Lifecycle' },
      { id: 'evidence', label: 'Evidence Locker' },
    ]
  }
];
```

> **Note**: If the reference code contains deeper submenus (Profiles → Clinician Profiles / Patient Profiles / Referring Physicians, etc.), they must also be included in the mapping below.

---

## Navigation Wiring Map (To Be Completed by Claude)

For every item above, fill in the following columns:

| Nav ID          | Label                        | Target Route (Production) | Target Page / Component                  | Status                  | Notes / Special Requirements |
|-----------------|------------------------------|---------------------------|------------------------------------------|-------------------------|------------------------------|
| dashboard       | Dashboard                    | /                         | DashboardPage                            |                         | Main V3 entry point          |
| clinicians      | Clinician Profiles           |                           |                                          |                         |                              |
| patients        | Patient Profiles             |                           |                                          |                         |                              |
| calendar        | Calendar                     |                           |                                          |                         |                              |
| brad            | Brad AI Copilot              |                           |                                          |                         |                              |
| ces             | Compliance Execution (CES)   |                           |                                          |                         |                              |
| taxonomy        | Taxonomy                     |                           |                                          |                         |                              |
| onboarding      | Onboarding                   |                           |                                          |                         |                              |
| policy          | Policy Lifecycle             |                           |                                          |                         |                              |
| evidence        | Evidence Locker              |                           |                                          |                         |                              |

### Additional Columns (Recommended)

- **Exists in Production?** (Yes / Partial / No)
- **V3 Glass Treatment Needed?** (Yes / Needs update)
- **Permissions / Role Restrictions**
- **Special Behavior** (e.g. opens drawer, shows sub-tabs, etc.)

---

## Requirements for Claude

When completing this document, you must:

1. **Use the exact labels and IDs** from the V3 reference code — do not invent or change menu names.
2. Provide a realistic production route for every item.
3. Identify which pages already exist and which need to be created or updated.
4. Explain how the transparent sidebar + collapsible submenus + interrupted divider will be implemented in the real `CommandCenterLayout.tsx` / shell.
5. Ensure that clicking any item in the V3 sidebar actually navigates (or opens the correct view) in the production app.
6. Consider how to keep the navigation data as a **single source of truth** going forward.

---

## Output Expectation

A completed version of this file (or a generated `V3_Nav_Wiring_Completed.md`) must be delivered as part of any serious implementation plan.

This ensures that after the V3 design is transferred, **all endpoints are wired and functional**.

---

**Claude: Do not skip or summarize this section. A proper mapping is mandatory.**