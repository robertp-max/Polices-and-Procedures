# Workflow: eCIgn Signature Workflow (ECIGN-SIGN-WF)

**Workflow ID:** `ECIGN-SIGN-WF`  
**Domain:** Cross-domain (All)  
**Linked Policy:** `CO-CA-001` — Electronic Records and Signatures Policy  
**Risk Band:** `high`  
**Cadence Kind:** `event_based`  
**Cadence Interval:** `on_demand`

---

## Trigger

This workflow is triggered whenever a compliance form requiring an electronic signature is opened in the FormSigningWorkspace. Triggered by:
- A workflow step directing a user to complete a form
- A direct navigation to `/forms/:formId`
- An HR or compliance event requiring a signed form

---

## Steps

| # | Step | Role | Required |
|---|---|---|---|
| 1 | System creates form instance with unique `instance_id` | System | Yes |
| 2 | System logs `ECIGN_CREATE` audit entry | System | Yes |
| 3 | First signer (e.g., Employee) is notified | System | Yes |
| 4 | First signer opens the form and reads full content | Employee | Yes |
| 5 | First signer applies signature (draw or type) | Employee | Yes |
| 6 | System records signature: identity, timestamp, document hash | System | Yes |
| 7 | System logs `ECIGN_SIGN` audit entry with hash chain | System | Yes |
| 8 | If multi-party: second signer is notified | System | Conditional |
| 9 | Second signer reads and signs | Supervisor/Manager | Conditional |
| 10 | System records second signature and extends hash chain | System | Conditional |
| 11 | All signatures collected: form instance marked COMPLETE | System | Yes |
| 12 | Completed form linked as evidence to `event_id` (if applicable) | System | Conditional |

---

## Dependencies

- User must be authenticated with a session
- User's role must match the expected signer role for the current stage
- Form definition must be published (not deprecated)

---

## Inputs

| Input | Description |
|---|---|
| `form_id` | The form definition to instantiate |
| `event_id` | Optional — links this signing to a compliance event |
| `workflow_id` | Optional — the workflow step that triggered this signing |
| Signer identity | Current authenticated user session |
| Signature data | Canvas drawing or typed full name |

---

## Outputs

| Output | Type | Where Stored |
|---|---|---|
| Signed form instance | Immutable record | eCIgn DB (server) |
| Audit chain entries | Hash-chained events | `server/ecign/hashChain.ts` |
| Evidence document | If linked to event | `regulatoryExecutionStore` |
| Notification | To next signer (if multi-party) | `notificationStore` |

---

## Linked Forms

This workflow applies to all forms in the system. The specific form is determined by `form_id`.

---

## Evidence Generated

| Evidence Kind | Description | Linked To |
|---|---|---|
| `signed_form` | The completed, signed form instance | `event_id` (if specified) |

---

## Approval Body

The eCIgn signing workflow itself does not have a separate approval body — the signature IS the approval. For forms that require a supervisor signature, the supervisor's signature constitutes the approval.

---

## Timeline & SLA

| Milestone | Timing |
|---|---|
| Form opened | On demand |
| First signature deadline | Defined by the calling workflow's SLA |
| Second signature deadline | 48 hours after first signature notification |
| Auto-escalation | After 72 hours without second signature (notification only) |

---

## Exception Handling

| Exception | Required Action |
|---|---|
| Signer declines to sign | Decline is logged; calling workflow coordinator notified |
| Second signer unavailable | Supervisor assigns alternate signer with Admin override |
| Document hash mismatch detected | Form is locked as INVALID; compliance officer notified |
| Server error during signing | Signature not recorded; user prompted to retry (no partial save) |

---

## Evidence Upload → Validate → Promote → Evidence Lifecycle

This workflow follows the system's evidence lifecycle:

```
1. UPLOAD: Form instance created (ECIGN_CREATE)
2. VALIDATE: First signature applied and hash-chained (ECIGN_SIGN)
3. PROMOTE: All required signatures collected (form status = COMPLETE)
4. EVIDENCE: Signed form linked to event as accepted evidence
```

---

## Quality Indicators

- 100% of required signatures collected within SLA
- Zero signed forms with invalid hash chains
- Zero forms in incomplete state for > 72 hours without escalation

---

## Revision History

| Date | Change | Author |
|---|---|---|
| 2026-01-01 | Initial workflow definition | Compliance Officer |
