# Component: FormSigningWorkspace

**File:** `src/policy/components/FormSigningWorkspace.tsx`  
**Type:** Feature Component (Signature Execution)  
**Used On:** Forms page (`/forms/:formId`), embedded in journey modules

---

## Overview

`FormSigningWorkspace` is the full electronic signature interface used to collect legally binding signatures on compliance forms. It integrates with the eCIgn (Electronic Compliance Ignition) system and provides a role-gated, multi-stage signing experience with a complete audit trail.

---

## UI Breakdown

| Region | Description |
|---|---|
| Document Viewer | Full read-only display of the form content |
| Signer Identification Bar | Current signer's name, role, and date |
| Signature Input | Canvas-based draw or typed name input |
| Stage Indicator | Shows current signature stage (e.g., "Step 1 of 2: Employee Signature") |
| Action Bar | "Sign and Submit", "Decline to Sign", "Return for Correction" buttons |
| Audit Trail Panel | Expandable history of all prior signature actions on this form instance |

---

## User Actions

- Read the full document content
- Draw a signature on the canvas or type full legal name
- Click **Sign and Submit** to apply signature
- Click **Decline to Sign** to reject (requires entering a reason)
- View the prior signature history for multi-party forms

---

## System Behavior

1. **Session initialization:** When the workspace opens, `FormSignatureContext` initializes the signing session with the form's `instance_id`, the expected signer role, and the current user's identity.
2. **Role guard:** If the current user's role does not match the expected signer role for the current stage, the signature input is disabled and an explanatory message is shown.
3. **Signature capture:** On submit, the signature data (canvas PNG or typed name) is combined with:
   - `form_id`
   - `instance_id`
   - Signer identity (user ID, name, role)
   - UTC timestamp
   - SHA-256 hash of the document content at time of signing
4. **Audit chain:** The signature event is appended to the eCIgn audit chain via `server/ecign/hashChain.ts`. The hash of this event becomes the `prevHash` for the next audit entry.
5. **Multi-party flow:** After a signature is captured, `FormSignatureFlow` checks if additional signers are required. If yes, the next signer is notified via the PM notification system.
6. **Void:** An administrator can void a signed form instance. Voiding is logged but does not delete the prior signatures — they remain in the audit chain marked as `VOIDED`.

---

## Data Flow

| Data Element | ID Type | Source / Destination |
|---|---|---|
| Form definition | `form_id` | Static form catalog |
| Form instance | `instance_id` | `regulatoryExecutionStore` + `/api/ecign` |
| Signer identity | `user_id` | Auth session |
| Signature payload | `instance_id` | `POST /api/ecign/sign` |
| Audit chain entry | `instance_id`, `prevHash` | `server/ecign/hashChain.ts` → DynamoDB/SQLite |
| Completion notification | `user_id` (next signer) | `notificationStore` / `/api/pm/notifications` |

---

## Permissions & Roles

| Action | Requirement |
|---|---|
| Sign as Employee | Authenticated user matching the `employee` stage role |
| Sign as Supervisor | Authenticated user with `supervisor` or `manager` role |
| Sign as Administrator | Authenticated user with `admin` or `super_admin` role |
| View audit trail | All authenticated users |
| Void a form instance | `admin`, `super_admin` only |

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Wrong user attempts to sign | Signature input disabled; "Not your turn" message shown |
| Document tampered after prior signature | Hash mismatch detected on load; form rendered as INVALID with red warning |
| Server error on submit | Signature not recorded; error toast shown; user prompted to retry |
| Canvas not supported by browser | Falls back to typed-name input automatically |

---

## Audit & Compliance Impact

The eCIgn system maintains a **separate, server-side hash-chained audit log** for all signature events. This log is independent of the client-side `enforcementStore`.

| Event | Audit Code | Notes |
|---|---|---|
| Form instance created | `ECIGN_CREATE` | Includes `form_id`, initiator, timestamp |
| Signature applied | `ECIGN_SIGN` | Includes signer, role, doc hash, timestamp |
| Signature voided | `ECIGN_VOID` | Includes administrator, reason, timestamp |
| Chain verification | `ECIGN_VERIFY` | Includes chain length, result (valid/invalid) |

> **Compliance Note:** The eCIgn hash chain provides cryptographic proof that signatures have not been altered. This chain can be verified at any time via `POST /api/audit/verify-chain`.

---

## Dependencies

- `FormSignatureContext` — React context providing session state
- `FormSignatureFlow` — Orchestrates multi-party signing sequence
- `server/ecign/hashChain.ts` — Server-side audit chain
- `/api/ecign/*` — All server calls
- `notificationStore` — Next-signer notification
- `regulatoryExecutionStore` — Form completion state

---

## Known Issues / Gaps

- **GAP:** Canvas signature images are not stored as legally admissible biometric data — they are aesthetic representations only. Legal admissibility depends on the typed-name acknowledgment being captured.
- **GAP:** There is no timeout on an open signing session — a user who opens the form and walks away without signing will hold the form in an incomplete state indefinitely.
- **GAP:** PDF export of the signed form is implemented but requires the server to be reachable; offline signing is not supported.
