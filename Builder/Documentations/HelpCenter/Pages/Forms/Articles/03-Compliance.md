# Forms — Compliance Reference

**Article:** 03-Compliance  
**Page:** Forms (`/forms`)

---

## Compliance Purpose

The Forms system provides **electronically signed, tamper-evident documentation** for compliance activities requiring written acknowledgment or authorization. Electronic signatures via eCIgn meet the requirements of applicable federal and state laws governing electronic records.

---

## What Compliance Requirements This Page Supports

| Regulatory Standard | Requirement | Forms Role |
|---|---|---|
| CMS CoP §484.75 | Supervisory visit records must be maintained | Supervisory visit forms |
| CMS CoP §484.55 | Patient consent and care plan acknowledgment | Patient consent forms |
| HIPAA §164.508 | Authorization forms for PHI use/disclosure | HIPAA authorization forms |
| CMS CoP §484.80 | HHA competency evaluation documentation | Competency evaluation forms |
| State regulations | Employment acknowledgment for critical policies | Policy acknowledgment forms |
| 21 CFR Part 11 | Electronic records must meet federal standards | eCIgn system compliance |

---

## What Must Be Completed

For a signed form to be compliance-valid:
1. Form must be the current active version (not deprecated)
2. All required signers must have signed in the correct order
3. The signing session must have captured a typed name or drawn signature
4. The form content must not have been altered after any signature was applied (hash verification)

---

## What Is Logged

The eCIgn system maintains a **separate server-side hash-chained audit log** for all form events:

| Event | Audit Code | Where Stored |
|---|---|---|
| Form instance created | `ECIGN_CREATE` | `server/ecign/hashChain.ts` → DB |
| Form signed | `ECIGN_SIGN` | `server/ecign/hashChain.ts` → DB |
| Form voided | `ECIGN_VOID` | `server/ecign/hashChain.ts` → DB |
| Form chain verified | `ECIGN_VERIFY` | Server audit log |
| Form viewed | Not logged | — |
| Form printed | Not logged | — |

---

## Audit Traceability

To trace a specific form completion:

| ID | Format | Example | Location |
|---|---|---|---|
| `form_id` | `{DOMAIN}-FM-{SEQ}` | `EN-FM-002` | Form header, URL |
| `instance_id` | UUID v4 | `a3f2c1b4-...` | Form instance record |
| `event_id` | `{type}-{YYYYMMDD}-{seq}` | `supervisory_visit-20260412-03` | Event workspace |

### Verifying a Signed Form's Integrity

To confirm a form has not been altered since signing:
1. Get the `instance_id` from the form record
2. Call `POST /api/audit/verify-chain` with the `instance_id`
3. A `valid` response confirms the hash chain is intact
4. An `invalid` response indicates tampering — escalate immediately to the compliance officer

---

## Electronic Signature Legal Basis

The eCIgn system's electronic signatures are designed to comply with:
- **E-SIGN Act (15 U.S.C. § 7001)** — federal law governing electronic signatures
- **UETA (Uniform Electronic Transactions Act)** — adopted in most states
- **21 CFR Part 11** — FDA electronic records requirements (applicable to certain clinical forms)

The system captures:
1. Signer identity (authenticated user session)
2. Intent to sign (explicit button click after document review)
3. Timestamp (UTC)
4. Document hash at time of signing (tamper detection)

These four elements together constitute a legally valid electronic signature record.
