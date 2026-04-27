# 02 · Signature Workflow (Mandatory Lifecycle)

Implements Phase 3. Every signature event MUST traverse the six steps below.
A signing session that skips, reorders, or short-circuits any step is **invalid**
and rejected at the API boundary, regardless of UI state.

---

## Step 1 — Disclosure & Consent (ESIGN/UETA §7001(c))

| Item | Requirement |
|---|---|
| What is presented | Plain-language electronic-records consent disclosure (versioned) |
| User action | Explicit "I agree" checkbox + button click (no implied consent) |
| What is logged | `consent_id`, `disclosure_version`, `user_id`, `accepted_at_utc`, `ip`, `user_agent` |
| Persistence | Append-only `consents` table; one row per user × disclosure_version |
| Re-prompt rule | If `disclosure_version` changes, consent must be re-captured before next signature |

> Failure mode: user cannot proceed past Step 1 without an accepted consent record
> for the current disclosure version. Server validates on every subsequent call.

---

## Step 2 — Identity Verification

| Method | Assurance level | Where enforced |
|---|---|---|
| Authenticated session (SSO / username + password) | Baseline | Every API call |
| Email-link or OTP re-confirmation | Step-up for high-impact signatures (POC, physician orders) | `server/ia/` |
| Device fingerprint | Bound to session | Captured client-side, signed server-side |
| IP + geo + ASN | Captured | `GeoInfo` (ipapi.co), persisted with signature |

Captured fields (exact keys in `FormSignatureContext.GeoInfo` + signing payload):

```
ip, city, region, country, postal, org,
user_agent, platform, device_name, system_manufacturer,
system_model, processor, os, os_version,
session_id, mfa_verified_at, mfa_method
```

The combination of authenticated session + captured network/device evidence
satisfies the ESIGN attribution requirement (15 U.S.C. § 7006(5)).

---

## Step 3 — Document Review

| Requirement | Implementation |
|---|---|
| Full document viewable | `FormViewer` renders all template pages before any signature button is enabled |
| Interaction proof | Scroll-to-bottom OR explicit "I have reviewed all pages" acknowledgment |
| Field edits tracked | Each form field change appended to `FieldEdit[]` with seq, old, new, ts, signer |
| Blind-signing prevention | Signature endpoint requires `review_acknowledged_at` ≥ `consent_at` |

---

## Step 4 — Signature Application

The signing canvas (`FormSigningWorkspace.tsx`) supports three modes — all produce
a unified PNG dataURL stored on the `SignatureRecord`:

1. **Draw** — pointer/touch canvas
2. **Type** — rendered to image with cursive font (parity with draw output)
3. **Upload** — image file converted to dataURL

Attached to every signature image:

```
signature_id      // server-issued ULID
signer_name
signer_role
signer_email
signed_at_utc     // server clock, not client
signature_png     // dataURL, hashed
signature_hash    // sha256(png bytes)
```

---

## Step 5 — Final Attestation

The user must perform **two** distinct actions:

1. Tick the attestation checkbox:
   > "I agree to use an electronic signature, I have reviewed this document
   > in full, and I intend to sign it."
2. Click "Apply Signature & Lock Document".

Both actions are logged with timestamps. The button is disabled until the
checkbox is ticked **and** all upstream steps have logged events.

---

## Step 6 — Lock & Finalize

On successful attestation:

1. The form instance transitions `state: open → signed_locked` (irreversible).
2. SHA-256 is computed over the canonical PDF bytes (template + values, no
   appended pages) and stored as `document_hash`.
3. A `signature_certificate` page set is generated and appended (see
   [06-Outputs-Templates-Watermarks.md](06-Outputs-Templates-Watermarks.md)).
4. A compliance event is emitted to `evaluateEvent.ts` for downstream effects
   (billing unlock, employee compliance flag, QAPI event closure).
5. The watermark stamp is rendered into the form footer band on every
   subsequent print of the signed instance.

> After this point, **no field on the form template may be modified**. Any
> attempt routes to a `void & re-issue` flow which produces a new
> `form_instance_id` and a new signing session; the original signed instance
> remains intact in the audit trail.

---

## State machine

```
        ┌─────────┐  consent      ┌────────────┐  identity   ┌──────────┐
  start │ created │ ───────────► │ disclosed  │ ──────────► │ verified │
        └─────────┘                └────────────┘             └────┬─────┘
                                                                   │ review ack
                                                                   ▼
        ┌──────────┐   reject     ┌────────────┐  attest     ┌──────────┐
        │  voided  │ ◄────────── │  reviewed  │ ──────────► │ attested │
        └──────────┘                └────────────┘             └────┬─────┘
                                                                   │ apply sig
                                                                   ▼
                                                             ┌─────────────┐
                                                             │signed_locked│
                                                             └─────────────┘
```

The state machine is the source of truth; UI state is derived. The server
re-derives state on every request and rejects out-of-order transitions.
