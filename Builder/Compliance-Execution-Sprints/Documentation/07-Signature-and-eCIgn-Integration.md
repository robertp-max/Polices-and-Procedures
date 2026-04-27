# 07 — Signature and eCIgn Integration

## 1. Why Signature is its Own Phase

CES treats `signature` as a distinct **Workflow Phase** and
`awaiting_signature` as a distinct **Compliance State** because the
signature step has properties no other phase has:

- It involves people **outside** the operational owner's team.
- It has a per-signer SLA with escalation.
- It is the **last gate** before evidence is sealed for audit.
- It cannot be self-served — the owner cannot sign on behalf of the
  required signer.

The Forms Library captures content; eCIgn captures **commitment**.

## 2. The Required Signer Roster

Every Execution Unit carries an explicit `requiredSigners[]` array:

```ts
interface RequiredSigner {
  userId:             string;
  name:               string;
  initials:           string;
  role:               string;
  status:             'signed' | 'pending' | 'overdue';
  signedAt?:          string;     // ISO timestamp
  hoursToEscalation?: number;     // negative when overdue
}
```

The roster is **declared at workflow definition time**, not improvised.
Example: `wf-gb-min` (Governing Body Minutes) always requires:

1. Board Chair (`shen`)
2. Administrator (`thompson`)
3. QAPI Lead (`kwan`)

If a signer is unavailable (PTO, role transition), the **only** legal
remediations are:

- Update the workflow definition (governance change, audit-logged)
- Mark the unit `blocked` with kind `missing_signature`

There is no field for "delegate to". Delegation requires a workflow
definition update of record.

## 3. eCIgn Handoff

When the drawer's "Request Signatures" action fires:

1. Engine validates `canRequestSignature(unit)`:
   - All required forms must be filed.
2. Unit transitions: `in_progress → awaiting_signature`.
3. eCIgn is invoked with:
   - The signed evidence package (forms + audit metadata)
   - The required signer roster
   - The per-signer escalation policy
4. eCIgn issues signature-request notifications.
5. eCIgn webhooks update the unit's `RequiredSigner.status` as each
   signature is captured.

The CES UI **does not** render the signature ceremony itself. That
runs inside `FormSigningWorkspace` (the existing eCIgn surface).
CES owns the **request, tracking, and SLA**; eCIgn owns the
**capture, attestation, and certificate generation**.

## 4. SLA and Escalation

Each `RequiredSigner` has an `hoursToEscalation` countdown. Behavior:

| Hours | UI behavior | System action |
|-------|------------|---------------|
| `> 24` | Pending badge, no warning | None |
| `≤ 24, > 0` | Pending badge, escalation timer chip in orange | Reminder sent to signer |
| `< 0` (overdue) | Overdue badge in red | Escalates to signer's manager + counts against sprint Signature SLA |

Overdue signers contribute to:

- Top context bar's **Urgent Escalations** counter (`CesLayout`)
- Dashboard **Critical Risk Banner**
- Sprint metric `signatureSlasMissed`

## 5. Closure on Last Signature

When the final required signer signs:

1. eCIgn webhook arrives → `signaturesComplete = signaturesRequired`.
2. The system attempts auto-closure:
   - If `requiredFormsComplete === requiredFormsTotal` and
     `auditIndexCreated === true` → unit transitions to `completed`.
   - Otherwise, unit remains in `awaiting_signature` until the missing
     condition is satisfied (typically the audit index, which is generated
     synchronously on the signature event).

## 6. Audit Properties Inherited from eCIgn

For every signature CES inherits the eCIgn attestation bundle:

- Cryptographic signature certificate
- Signer identity verification record
- Timestamp of signature
- IP / device metadata at signing time
- Signed-document hash

These flow into the Audit Index entry on closure (see Doc 08).

## 7. Why CES Does Not Build Its Own Signature Layer

Three reasons:

1. **Single source of truth** — eCIgn is already the agency's
   surveyor-defensible signature substrate.
2. **Separation of concerns** — CES is workflow orchestration, not
   cryptography.
3. **Print/packet preservation** — eCIgn has the print packet, the
   stamp logic, and the certificate page generation. CES would
   regress that asset.

## 8. The Signature Owner is Not a Signer

A subtle but important distinction:

- `signatureOwner` = the person responsible for **routing** the unit
  through eCIgn and chasing signatures.
- `requiredSigners[]` = the people who **must sign**.

These may overlap (the Compliance Officer often is both) but the roles
are independently audited. A signature owner who fails to route within
SLA appears in the `Workload Distribution` table's overdue column;
a signer who fails to sign within SLA contributes to
`signatureSlasMissed`.
