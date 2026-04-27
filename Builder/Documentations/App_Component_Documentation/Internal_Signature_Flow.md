# CI-App Internal Signature Flow

**Component:** `FormSignatureFlow` + `FormViewer` (modified)  
**Context:** `FormSignatureContext`  
**Mode:** Standalone form route only (`/forms/:formId`)  
**Design:** Light mode — white background, teal accents, thin borders, rounded corners  
**Last updated:** April 2026

---

## Overview

The CI-App Internal Signature Flow is a simulation-only, light-mode workflow embedded in the Enterprise Forms Library standalone form viewer. It enables users to:

1. Sign directly inside signature fields using a canvas drawing pad
2. Review auto-populated signer metadata from the demo session
3. Request a second signature from a role-appropriate approver
4. Print or download the completed form including a CI-App Internal Attestation Certificate

---

## File Structure

| File | Role |
|---|---|
| `src/policy/components/FormSignatureContext.tsx` | Shared types, demo session data, React context |
| `src/policy/components/FormSignatureFlow.tsx` | Light-mode action banner + second signature modal |
| `src/policy/components/FormViewer.tsx` | Sign modal, certificate page, context provider, Field updates |

---

## Signature Behavior

### Sign Button Location

Sign buttons appear **inside each signature field** in the form. In forms using `layout: 'signature'` sections, every field with `type: 'signature'` renders a dashed-border teal button:

```
[ ✏  Sign ]   ← replaces the dashed underline
```

This replaces the previous static dashed underline (`SIG_DASHED_CLS`) when the signature flow is enabled (standalone mode only). In embedded mode (policy appendices), the dashed underline is preserved.

### Sign Now Modal

When a Sign button is clicked:

1. A light-mode modal opens (`SignatureModal`)
2. Signer metadata is auto-populated from `DEMO_SESSION`:
   - Signing As
   - Role
   - Email
   - Date (today)
3. User draws their signature on a canvas drawing pad
4. User clicks **Confirm Signature**

No text entry is required. All metadata is pre-filled.

### After Signing

- The dashed Sign button is replaced by the signature image + timestamp + checkmark
- The action banner updates from "Awaiting Signature" → "Signed"
- Post-sign actions appear in the banner: Send for Second Signature, Print / Download, Save Draft
- The CI-App Internal Attestation Certificate section renders below the form card

---

## Action Banner States

| `flowState` | Banner Label | Primary Actions |
|---|---|---|
| `unsigned` | Awaiting Signature | *(none — Sign buttons are inside the form)* |
| `signed` | Signed | Send for Second Signature, Print / Download, Save Draft |
| `pending_second` | Pending Second Signature | Task summary, Print / Download, Save Draft |
| `completed` | Completed | Print / Download, Save Draft |

---

## Second Signature Flow

### Triggering

From the action banner in `signed` state, click **Send for Second Signature**.

### Staff Selector Modal

A light-mode modal opens with the full staff directory. Role hierarchy enforcement:

- **Only users exactly one tier above the current session user are selectable**
- All other staff members are greyed out with `opacity-40` and `cursor-not-allowed`
- The current user (self) is labeled "You" and is not selectable

### Demo Role Hierarchy

| Tier | Role | User |
|---|---|---|
| 1 | Administrator | Donald Trump |
| 2 | Administrator Designee | JD Vance *(current session)* |
| 3 | Compliance Officer | Marco Rubio |
| 4 | Clinical Manager | Pete Hegseth |
| 4 | Compliance Liaison | Pam Bondi |
| 5 | Staff RN | Kristi Noem |
| 5 | CHHA Supervisor | Brooke Rollins |

For the current demo session (JD Vance, tier 2), **only Donald Trump (tier 1)** is selectable as the second signer. All other staff members are greyed out.

### Approval Rule

```typescript
const isApprover = (u: DemoUser) => u.tier === DEMO_SESSION.tier - 1;
```

### Task Model

When the approver is selected and "Send Request" is clicked, a `SecondSigTask` is created:

```typescript
interface SecondSigTask {
  taskId:         string;            // task_{nanoid(12)}
  type:           'signature_request';
  formInstanceId: string;            // fi_{nanoid(12)} — per form session
  assignedTo:     string;            // DemoUser.id of selected approver
  assignedBy:     string;            // DemoUser.id of current session user
  status:         'pending';
  createdAt:      string;            // ISO 8601
  dueDate?:       string;            // ISO 8601 — optional
}
```

**Example:**
```json
{
  "taskId": "task_A3fKmP9nQrXz",
  "type": "signature_request",
  "formInstanceId": "fi_T7nZqW4aKxRp",
  "assignedTo": "user_trump",
  "assignedBy": "user_vance",
  "status": "pending",
  "createdAt": "2026-04-23T14:30:00.000Z"
}
```

After task creation:
- `flowState` → `'pending_second'`
- Banner shows task ID and assignee name
- The Print / Download and Save Draft buttons remain active

---

## Print / Download Flow

### Trigger

Click **Print / Download** in the action banner. This calls `window.print()` directly on the current page.

### What Prints

1. **Completed form** — all manual input field values are captured as-is from the live DOM (uncontrolled inputs retain their current values for printing)
2. **Signature images** — the PNG canvas drawings replace the Sign buttons in the printed output
3. **CI-App Internal Attestation Certificate** — the certificate section below the form card is included

### What Does Not Print

- Action banners (`.no-print` class)
- Top navigation bars (`.no-print` class)
- Universal navigation (excluded via `navExclusions`)

---

## CI-App Internal Attestation Certificate

### When It Renders

The certificate section renders below the form card on screen as soon as at least one signature field has been signed. It also prints with the form via `window.print()`.

### Certificate Page Title

**CI-App Internal Attestation Certificate**

### Certificate Wording

> "This certificate records completion, acknowledgment, and signature activity captured within the CI-App workflow system."

### Certificate Fields

| Field | Source |
|---|---|
| Certificate ID | `CERT-{formId}-{nanoid(8)}` — generated on first render |
| Form ID | `content.id` |
| Form Version | `content.version` |
| Form Title | `content.title` |
| Form Instance ID | `fi_{nanoid(12)}` — per session |
| System | `CI-App` (hardcoded) |
| Certified At | Time of first signature |
| Policy ID(s) | `content.policies` array (if present) |
| Task ID | `secondSigTask.taskId` (if second signature was requested) |

### Per Signer

For each signature field that was signed:

| Field | Source |
|---|---|
| Signature image | PNG canvas data URL |
| Signer Name | `DEMO_SESSION.name` |
| Role | `DEMO_SESSION.role` |
| Email | `DEMO_SESSION.email` |
| Signed At | ISO timestamp, formatted locale string |

### Second Signature Request Block (if applicable)

| Field | Source |
|---|---|
| Task ID | `secondSigTask.taskId` |
| Assigned To | Resolved name from `DEMO_STAFF` |
| Assigned By | Resolved name from `DEMO_STAFF` |
| Status | `pending` |
| Created At | Formatted timestamp |

---

## Data Models

### `SignatureRecord`

```typescript
interface SignatureRecord {
  fieldId:          string;  // e.g. "1-sig-1" (sectionIdx-sig-fieldIdx)
  signerName:       string;
  signerRole:       string;
  signerEmail:      string;
  signedAt:         string;  // ISO 8601
  signatureDataUrl: string;  // PNG data URL from canvas
}
```

### `SignFlowState`

```typescript
type SignFlowState = 'unsigned' | 'signed' | 'pending_second' | 'completed';
```

### `DemoUser`

```typescript
interface DemoUser {
  id:    string;
  name:  string;
  role:  string;
  email: string;
  tier:  number; // 1 = highest authority
}
```

---

## Context Architecture

`SignatureCtx` provides signature state to all child components, particularly `Field`:

```typescript
interface SignatureCtxValue {
  enabled:     boolean;  // false in embedded mode
  signatures:  Map<string, SignatureRecord>;
  requestSign: (fieldId: string) => void;
}
```

The context is provided by `FormViewer` in standalone mode with `enabled: true`. In embedded mode (used by `SharedPolicyDetailView` appendices), the default context has `enabled: false`, which preserves the existing dashed underline behavior for signature fields.

### Field ID Format

Each signature field receives a unique `fieldId` based on its position:

| Layout | fieldId Format | Example |
|---|---|---|
| `signature` | `{sectionIdx}-sig-{fieldIdx}` | `2-sig-1` |
| `grid` | `{sectionIdx}-grid-{fieldIdx}` | `0-grid-3` |

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Background | `#F2F2F0` | Page shell |
| Card | `#FFFFFF` | Form paper + certificate |
| Border | `#E5E4E3` | All borders |
| Teal primary | `#007970` | Buttons, accents, cert left-border |
| Teal light | `#E5FEFF`, `#F0FFFE` | Hover states, avatar backgrounds |
| Surface alt | `#F8FAF9` | Modal info strips, canvas bg |
| Text primary | `#1F1C1B` | Main content |
| Text muted | `#747470` | Labels, secondary info |
| Amber | `#B45309` | Pending second sig state |

**No dark overlays. No heavy shadows. No red backgrounds. Modal overlay: `bg-black/20`.**

---

## Component Integration Map

```
FormViewer (standalone)
  └─ SignatureCtx.Provider  (enabled: true)
       ├─ FormSignatureFlow  (action banner + second sig modal)
       ├─ FormBody
       │    └─ SectionRenderer
       │         └─ Field (f.type === 'signature')
       │              └─ reads SignatureCtx → Sign button or signed image
       ├─ FormCertificatePage  (visible once hasSigned === true)
       └─ SignatureModal  (fixed overlay, shown when activeFieldId !== null)

FormViewer (embedded)
  └─ SignatureCtx.Provider  (enabled: false — default)
       └─ FormBody  (Field renders dashed underline as before)
```

---

## Demo Behavior Summary

1. Open any form at `/forms/:formId`
2. Scroll to a signature section — each signature field shows a `[ ✏ Sign ]` button
3. Click Sign — light modal opens with JD Vance's info pre-populated
4. Draw signature on canvas — click **Confirm Signature**
5. Signature image + timestamp appear in the field
6. Banner updates to "Signed" — **Send for Second Signature**, **Print / Download**, **Save Draft** appear
7. Certificate section renders below the form
8. Click **Send for Second Signature** — staff modal opens; only Donald Trump is selectable
9. Select Donald Trump — click **Send Request** — task is created, banner shows task ID
10. Click **Print / Download** — `window.print()` fires; form + certificate prints

---

## Known Limitations

1. **No persistence** — all signature state lives in React component state. Navigating away resets the flow.
2. **Single session user** — the demo is hard-coded to JD Vance. No login system is implemented.
3. **Uncontrolled form fields** — text inputs are uncontrolled. Values print correctly via DOM capture but are not stored in JavaScript state.
4. **Save Draft is a stub** — shows "Saved" confirmation for 2.5 seconds but does not persist data.
5. **Second signature is demo-only** — tasks are in-memory objects. No backend, no email delivery.
6. **Single signer per session** — multiple signers would require a session hand-off, not implemented.
7. **No form instance persistence** — `formInstanceId` regenerates on component remount.

---

## QA Checklist

### Sign Button in Form
- [ ] Signature fields in `layout: 'signature'` sections show `[ ✏ Sign ]` dashed-border button
- [ ] Button is teal-bordered, white background, no heavy styling
- [ ] In embedded mode (policy appendices), dashed underline renders as before — no Sign button

### Sign Modal
- [ ] Modal is white with thin border — no dark overlay, no red background
- [ ] Signer info auto-populated: JD Vance, Administrator Designee, jvance@careindeed.com, today's date
- [ ] Canvas drawing works with mouse and touch
- [ ] Clear button resets the canvas
- [ ] Confirm Signature is disabled when canvas is empty
- [ ] On confirm: modal closes, signature image appears in the field, timestamp shown, checkmark icon present

### Action Banner
- [ ] "Awaiting Signature" shown before any field is signed
- [ ] Banner updates to "Signed" after first signature
- [ ] Send for Second Signature, Print / Download, Save Draft appear after signing
- [ ] Banner border changes color based on state (default → amber → green)

### Second Signature Modal
- [ ] Modal is white, light backdrop
- [ ] All 7 staff members listed
- [ ] Only Donald Trump (tier 1) is selectable — all others are greyed out
- [ ] JD Vance has "You" label and is not selectable
- [ ] Radio indicator visible next to selectable user
- [ ] Send Request disabled until selection is made
- [ ] On confirm: task object created with correct fields, banner shows task ID + assignee

### Certificate Page
- [ ] Certificate renders below the form card after first signature
- [ ] Title: "CI-App Internal Attestation Certificate"
- [ ] Wording matches spec exactly
- [ ] Certificate ID follows `CERT-{formId}-{8chars}` format
- [ ] Form ID, version, title, instance ID, system all correct
- [ ] Signature image, signer name, role, email, signed-at present
- [ ] Second sig task block appears if task was created
- [ ] Left teal border accent present

### Print
- [ ] `window.print()` triggered from Print / Download button
- [ ] Action banners are hidden in print (`.no-print`)
- [ ] Form content visible in print
- [ ] Certificate section visible in print
- [ ] Signature images visible in print

---

## Related Components

| Component | Relationship |
|---|---|
| `FormViewer` | Parent — hosts state, context, sign modal, cert page |
| `FormSignatureContext` | Provides types, context, and demo data |
| `FormSignatureFlow` | Action banner + second sig modal |
| `FormPrintView` | Separate print route — not affected by signature flow |
| `WorkflowExecutionPanel` | Separate regulatory certification — unrelated |
| `SharedPolicyDetailView` | Uses FormViewer in embedded mode — unaffected |

---

*Previous third-party audit trail simulation has been removed. See `Third_Party_Audit_Trail_Simulation.md` for the archived design.*
