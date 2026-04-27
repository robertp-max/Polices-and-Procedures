# Third-Party Audit Trail Simulation — ARCHIVED

> **This design has been superseded.**  
> The third-party audit trail simulation and all Dropbox/ESIGN/provider references have been removed from the codebase.  
> The active signature system is documented in `Internal_Signature_Flow.md`.

**Previous Component:** `FormSignatureFlow`  
**Status:** Archived — no longer implemented  
**Last updated:** April 2026  
**Replaced by:** `Internal_Signature_Flow.md`

---

---

## Overview

The `FormSignatureFlow` component adds a simulation-only signature flow to the Enterprise Forms Library's standalone form viewer (`/forms/:formId`). It presents two parallel evidence tracks without calling any external APIs.

| Evidence Track | Provider | Legal Binding | API Calls |
|---|---|---|---|
| Internal Certificate | Care Indeed Policy App | No | None |
| Third-Party Audit Trail | `dropbox_sign_simulated` | No (simulation only) | None |

---

## Simulation Warning

All third-party data in this component is **simulated**:

- No Dropbox Sign API calls are made
- No signature requests are sent
- No legal e-signature is created under ESIGN or UETA
- All request IDs, hashes, timestamps, and storage paths are generated placeholders

---

## User Interface

### Action Banner

Rendered between the top nav bar and the paper form card in standalone mode. Displays progressive buttons based on flow state.

**States:**

| State | Badge | Primary Action | Additional Actions |
|---|---|---|---|
| `idle` | Ready to Sign | Sign Now | Preview Third-Party Audit Trail |
| `signed` | Signed — [Name] | Generate Internal Certificate | Preview Third-Party Audit Trail |
| `certified` | Certificate Generated | View Certificate, Complete / Lock Form | Print, Save, Mock Email, Preview Third-Party Audit Trail |
| `locked` | Form Locked | View Certificate | Print, Save, Mock Email, Preview Third-Party Audit Trail |

The **Preview Third-Party Audit Trail** button is always visible at the right edge of the banner regardless of state.

### Sign Now Modal

A dark-glass overlay modal (`ModalShell`) with three required fields:

- Printed Name
- Role / Title  
- Email Address

Includes a simulation warning banner. On confirm, generates a `SignatureRecord` and a `DropboxSignSimulatedEvent`.

### Internal Certificate Modal

Displays the `InternalCertificate` record as structured fields. Includes:

- Certificate ID, Form ID, Version, Title
- Signer name, role, email
- Signed At, Certified At, Certified By
- Method: `internal_workflow`
- Status: `certified` or `locked`
- Evidence type comparison table (Internal vs Third-Party)

### Third-Party Audit Trail Modal

Wide modal (`width: 700`) displaying the full simulated Dropbox Sign record. Sections:

1. **Simulation Warning** — orange callout, always visible
2. **Provider Badge** — `dropbox_sign_simulated` tag + completion status
3. **Status Timeline** — 8-step timeline with timestamps
4. **Signer Details** — populated after signing
5. **Document** — request ID, event ID, hash placeholder
6. **Storage Placeholders** — S3 path placeholders (AWS Phase 1)
7. **AWS Phase 1 Integration Map** — DynamoDB + S3 + Audit Log mapping
8. **Provider Event Schema** — field-by-field breakdown

Before signing, the timeline renders in "awaiting" state with step labels but no timestamps. A prompt directs users to Sign Now.

---

## Data Models

### `SignatureRecord`

```typescript
interface SignatureRecord {
  signer_name:  string;
  signer_role:  string;
  signer_email: string;
  signed_at:    string; // ISO 8601
}
```

### `InternalCertificate`

```typescript
interface InternalCertificate {
  certificate_id: string;        // CERT-{formId}-{nanoid(8)}
  form_id:        string;
  form_title:     string;
  form_version:   string;
  signer_name:    string;
  signer_role:    string;
  signer_email:   string;
  signed_at:      string;        // ISO 8601
  certified_at:   string;        // ISO 8601
  certified_by:   string;        // 'Care Indeed Policy Application'
  method:         'internal_workflow';
  status:         'certified' | 'locked';
  note:           string;        // disclaimer text
}
```

### `DropboxSignSimulatedEvent`

```typescript
interface DropboxSignSimulatedEvent {
  provider:                          'dropbox_sign_simulated';
  provider_label:                    string;   // 'Third-Party Audit Trail Simulation'
  signature_request_id:              string;   // sr_sim_{nanoid(24)}
  signer_name:                       string;
  signer_email:                      string;
  signer_role:                       string;
  document_name:                     string;   // {formId} — {formTitle}.pdf
  status:                            'completed';
  sent_at:                           string;   // ISO 8601 — 30 min before signed_at
  viewed_at:                         string;   // ISO 8601 — 10 min before signed_at
  signed_at:                         string;   // ISO 8601 — from SignatureRecord
  completed_at:                      string;   // ISO 8601 — 2 min after signed_at
  ip_address:                        string;   // placeholder text
  user_agent:                        string;   // placeholder text
  provider_event_id:                 string;   // evt_sim_{nanoid(20)}
  provider_document_hash:            string;   // sha256 placeholder
  completed_pdf_storage_placeholder: string;   // s3://... path
  audit_certificate_placeholder:     string;   // s3://... path
}
```

### `ThirdPartyTimelineStep`

```typescript
interface ThirdPartyTimelineStep {
  step:      number;   // 1–8
  label:     string;
  timestamp: string;   // formatted locale string
}
```

---

## Simulated Status Timeline

The 8-step timeline is generated from `signed_at` with fixed offsets:

| Step | Label | Offset from `signed_at` |
|---|---|---|
| 1 | Draft Created | −30 min |
| 2 | Sent to Signer | −30 min (same as Draft) |
| 3 | Email Delivered | −30 min + 30 seconds |
| 4 | Viewed by Signer | −10 min |
| 5 | Signed by Signer | 0 (signed_at) |
| 6 | Completed | +2 min |
| 7 | Final PDF Available | +3 min |
| 8 | Third-Party Audit Certificate Available | +4 min |

---

## Internal vs Third-Party Evidence Comparison

| Aspect | Internal Certificate | Third-Party Audit Trail |
|---|---|---|
| Generated by | Care Indeed app | Dropbox Sign (provider) |
| Legally binding | No | Yes (when live) |
| IP capture | Not captured | Yes — per signer event |
| Document hash | Not computed | SHA-256 by provider |
| Audit certificate | Internal record only | Provider-issued PDF cert |
| AWS storage | Future: DynamoDB | Future: S3 + DynamoDB |

---

## Simulated Provider Event Schema

| Field | Simulated Value | Live Source |
|---|---|---|
| `signature_request_id` | `sr_sim_…` | Dropbox Sign API response |
| `provider_event_id` | `evt_sim_…` | Dropbox Sign webhook payload |
| `ip_address` | `[placeholder]` | Dropbox Sign signer audit data |
| `user_agent` | `[placeholder]` | Dropbox Sign signer audit data |
| `provider_document_hash` | `[sha256:placeholder]` | Dropbox Sign completed document |
| `completed_pdf_storage` | `s3://…-completed.pdf` | S3 after download + upload |
| `audit_certificate_storage` | `s3://…-dropbox-audit.pdf` | S3 after download + upload |

---

## AWS Phase 1 Future Integration Points

When Dropbox Sign is implemented in AWS Phase 1, the following storage and event handling must be added:

### DynamoDB
- Table: `SignatureRequests`
- Store: `signature_request_id`, `form_id`, `signer_email`, `signer_role`, `status`, all timestamps
- Partition key: `signature_request_id`
- GSI on `form_id` for lookup by form

### S3 — Signed Documents
- Bucket: `care-indeed-signed-docs`
- Key pattern: `{formId}/{requestId}-completed.pdf`
- Source: Download from Dropbox Sign after `signature_request_all_signed` webhook

### S3 — Audit Certificates
- Bucket: `care-indeed-audit-certs`
- Key pattern: `{formId}/{requestId}-dropbox-audit.pdf`
- Source: Dropbox Sign audit trail download endpoint

### Audit Log
- Append all Dropbox Sign webhook events (`sent`, `viewed`, `signed`, `completed`) to the existing workflow audit log
- Event structure mirrors `DropboxSignSimulatedEvent` with live values populated

---

## Future Dropbox Sign Integration Points

When transitioning from simulation to live:

1. **Replace `generateThirdPartyRecord()`** with a real API call to `POST /signature_request/send`
2. **Add webhook handler** to receive Dropbox Sign status events and update DynamoDB
3. **Download and store** completed PDF + audit certificate to S3 on `signature_request_completed`
4. **Populate `ip_address`, `user_agent`, `provider_document_hash`** from Dropbox Sign audit data endpoint
5. **Update `DropboxSignSimulatedEvent`** type to remove placeholder fields; add live response fields
6. **Add legal disclaimer** and compliance disclosure per ESIGN/UETA requirements

---

## Component Props

```typescript
interface FormSignatureFlowProps {
  formId:      string;   // Form ID (e.g. 'GV-FM-001')
  formTitle:   string;   // Human-readable form title
  formVersion: string;   // Version string (e.g. '1.0')
  maxW:        string;   // Tailwind max-width class, matches parent FormViewer
  onPrint:     () => void;
}
```

---

## Exported Utilities

These functions are exported for potential reuse in tests or future integration work:

| Export | Purpose |
|---|---|
| `generateThirdPartyRecord(formId, formTitle, sig)` | Build a `DropboxSignSimulatedEvent` from a `SignatureRecord` |
| `buildTimeline(record)` | Convert a `DropboxSignSimulatedEvent` into an 8-step timeline array |
| `FormSignatureFlow` | Main component |
| Types: `SignFlowState`, `SignatureRecord`, `InternalCertificate`, `DropboxSignSimulatedEvent`, `ThirdPartyTimelineStep` | All exported for external use |

---

## Sample Audit Trail Output

```json
{
  "provider": "dropbox_sign_simulated",
  "provider_label": "Third-Party Audit Trail Simulation",
  "signature_request_id": "sr_sim_A3fKmP9nQrXzV2wYuB8jLe",
  "signer_name": "Maria Santos",
  "signer_email": "msantos@careindeed.com",
  "signer_role": "Registered Nurse",
  "document_name": "GV-FM-001 — Employee Information Form.pdf",
  "status": "completed",
  "sent_at": "2026-04-23T14:00:00.000Z",
  "viewed_at": "2026-04-23T14:20:00.000Z",
  "signed_at": "2026-04-23T14:30:00.000Z",
  "completed_at": "2026-04-23T14:32:00.000Z",
  "ip_address": "[placeholder — captured by Dropbox Sign during live signing]",
  "user_agent": "[placeholder — captured by Dropbox Sign during live signing]",
  "provider_event_id": "evt_sim_T7nZqW4aKxRp2mBvLcFj",
  "provider_document_hash": "[sha256:placeholder — computed by Dropbox Sign after live signing]",
  "completed_pdf_storage_placeholder": "s3://care-indeed-signed-docs/GV-FM-001/Bh3nK7pQ-completed.pdf",
  "audit_certificate_placeholder": "s3://care-indeed-audit-certs/GV-FM-001/Bh3nK7pQ-dropbox-audit.pdf"
}
```

---

## Known Limitations

1. **No persistence** — all signature state is in-component React state. Navigating away resets the flow.
2. **No real IP / user agent capture** — these fields are placeholders.
3. **No document hash** — the simulated SHA-256 is a placeholder string, not a computed hash.
4. **No PDF generation** — the "Final PDF Available" step in the timeline does not produce a downloadable signed PDF.
5. **No email delivery** — "Mock Email" shows a 3-second UI confirmation only; no email is sent.
6. **Save is a stub** — the Save button renders but does not persist data.
7. **Not legally compliant** — this component cannot be used as evidence of legal e-signature under ESIGN, UETA, or any equivalent regulation.
8. **Single signer only** — the simulation models one signer per form. Multi-party signing is not represented.

---

## QA Checklist

### Simulation Warning Visibility
- [ ] Orange simulation warning banner visible in Third-Party Audit Trail modal
- [ ] Simulation warning present in Sign Now modal
- [ ] Explanation strip below action banner shows both evidence track descriptions

### Sign Now Flow
- [ ] "Sign Now" button visible in `idle` state
- [ ] Sign Now modal opens on click
- [ ] All three fields (Name, Role, Email) are required — form rejects empty fields
- [ ] On confirm: state advances to `signed`, signer name appears in badge

### Internal Certificate
- [ ] "Generate Internal Certificate" appears only in `signed` state
- [ ] Certificate modal opens automatically after generation
- [ ] Certificate ID follows `CERT-{formId}-{8chars}` format
- [ ] "View Certificate" button opens the modal in `certified` and `locked` states
- [ ] Evidence comparison table renders with all 6 rows

### Complete / Lock Form
- [ ] "Complete / Lock Form" appears only in `certified` state
- [ ] On click: state advances to `locked`, badge shows lock icon + green color
- [ ] Certificate status updates to `locked` in View Certificate modal

### Third-Party Audit Trail Modal
- [ ] "Preview Third-Party Audit Trail" button always visible (all states)
- [ ] Before signing: timeline shows 8 steps with "—" timestamps, "awaiting" badge, sign prompt
- [ ] After signing: full timeline with timestamps, all signer details populated
- [ ] Provider badge shows `dropbox_sign_simulated`
- [ ] AWS Phase 1 integration map visible
- [ ] Provider schema table visible
- [ ] Storage placeholders follow `s3://care-indeed-…` format

### Common Actions
- [ ] Print, Save, Mock Email buttons only visible after signing
- [ ] Mock Email shows "Email Sent!" for 3 seconds then resets
- [ ] Print triggers `printForm(formId)`

### Embedded Mode
- [ ] `FormSignatureFlow` does NOT render in embedded mode (inside `SharedPolicyDetailView` appendices)
- [ ] Only standalone mode (`/forms/:formId`) shows the signature flow banner

---

## Related Components

| Component | Relationship |
|---|---|
| `FormViewer` (`FormViewer.tsx`) | Parent — renders `FormSignatureFlow` in standalone mode |
| `ModalShell` (`regulatory/ModalShell.tsx`) | Used for Sign Now, Internal Certificate, and Third-Party Audit Trail modals |
| `WorkflowExecutionPanel` | Separate regulatory audit/certification flow — not connected to Forms signature flow |
| `regulatoryExecutionStore` | Separate regulatory certification — not used by Forms signature flow |

---

*This document covers the Forms Library signature simulation only. For the regulatory event certification flow, see `Workflow_and_Events_System.md`.*
