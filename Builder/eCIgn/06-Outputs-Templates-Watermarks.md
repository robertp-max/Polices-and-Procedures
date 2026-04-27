# 06 · Outputs, Templates & Watermarks

Implements Phase 9 (Outputs) and the **template-preservation contract** the
user explicitly mandated:

> **DO NOT MODIFY TEMPLATES.** Templates must stay the same as IMG 1, 2, 3.
> OUTPUT / PRINT / SAVE / DOWNLOAD / SEND must be exactly the same as IMG 1, 2, 3
> with watermarks and additional pages for the certificate, audit trails, etc.

This document is the binding specification for that contract.

---

## A. Template preservation contract

### A.1 Locked template surfaces

| Surface | Source of truth | Mutation policy |
|---|---|---|
| `/forms/:formId` (interactive) | [`FormViewer.tsx`](../../src/policy/components/FormViewer.tsx) | Read-only template; field values are user data, not template |
| `/forms/:formId/print` (print) | [`FormPrintView.tsx`](../../src/policy/pages/FormPrintView.tsx) + [`buildFormContent()`](../../src/policy/data/formsLibraryContent.ts) | **Frozen.** Geometry, headers, footers, paging, field positions, typography, color, page rules in `@page { size: Letter; margin: 0.5in; }` are immutable |
| Form template content (sections, fields, labels, IDs) | [`formsLibraryDataset.ts`](../../src/policy/data/formsLibraryDataset.ts) | Versioned. Existing version content is immutable; changes require a new version |

### A.2 What may NOT change vs. IMG 1, 2, 3

Reference: the three screenshots of EN-FM-033 *Mandatory Events Completion Report*
v6.0 attached to the original prompt.

- Page 1 — header band, logo position, "ENTERPRISE FORMS LIBRARY · EN-FM-033 · v6.0",
  title, ASSESSMENT · FORM EN-FM-033 caption, the four-column meta block
  (FORM ID / VERSION / EFFECTIVE / NEXT REVIEW), LINKED POLICY IDS pills,
  PURPOSE box, INSTRUCTIONS box, SECTION 1 — IDENTIFICATION layout, page footer
  (`localhost:5173/forms/EN-FM-033` · `1/3`).
- Page 2 — SECTION 2 — ASSESSMENT RESPONSES, every field ordering and spacing.
- Page 3 — SECTION — SIGNATURES & ATTESTATION layout including the printed-name
  / signature / date column structure and the "Care Indeed Home Health Care, Inc."
  footer line.

These are **byte-for-byte preserved** between unsigned and signed PDFs.

### A.3 Allowed additive surfaces

eCIgn is permitted to add only the following **without altering** the template:

1. A watermark stamp inside the existing footer band (Section B).
2. Pages **after** the last template page (Section C).

### A.4 Enforcement

A pre-print gate (`assertTemplateIntegrity()`) compares the rendered template
DOM tree against a captured snapshot for the version. If any difference is
detected the print is aborted with code `TEMPLATE_DRIFT` and an audit event
is appended.

---

## B. Watermark specification

### B.1 Visual

```
┌────────────────────────────────────────────────────────────────┐
│  4/24/26, 6:06 PM   EN-FM-033 — Mandatory Events Completion    │
│                                                                │
│        … (template body — unchanged) …                         │
│                                                                │
│  localhost:5173/forms/EN-FM-033                          1/3   │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ [eCIgn-logo] · CERT-EN-FM-033-A4DfwtSJ · JD Vance ·   │ ←── │
│  │ Apr 24, 2026 5:05 PM PDT · Hash 3f9c…b21a            │      │
│  └──────────────────────────────────────────────────────┘      │
└────────────────────────────────────────────────────────────────┘
```

### B.2 Rules

- Inserted **inside** the existing footer band — does not push any field down.
- Height ≤ 14 px at 96 dpi; opacity 0.85; color: muted slate `#52525B`.
- Brand mark: 18 px tall transparent PNG (`@/assets/eCIgn.png`).
- Content order: `logo · cert_id · signer_name · signed_at_local · hash_short`.
- Appears on **every** page of the signed template (1/3, 2/3, 3/3 in the
  EN-FM-033 example), not on appended pages (which carry full eCIgn branding).
- Implementation: the existing `buildAuditStampHtml()` helper in
  [`FormSigningWorkspace.tsx`](../../src/policy/components/FormSigningWorkspace.tsx).

### B.3 Unsigned vs. signed

| State | Footer band content |
|---|---|
| Unsigned print | Template footer only — identical to IMG 1, 2, 3 today |
| Signed print | Template footer + eCIgn stamp ribbon (above) |

No other element changes between the two prints.

### B.4 Style-asset harvest (regression note)

The packet window is opened via `window.open('', '_blank')` and written
with `document.write(html)`. It does **not** inherit CSS from the host
document. The packet builder MUST inject every stylesheet from the host
`<head>`, including:

- `<link rel="stylesheet">` tags — present in production (Vite-built bundle).
- Inline `<style>` blocks — present in **dev mode** (Vite injects all CSS
  this way for HMR).

Forgetting the `<style>` blocks produces an unstyled brand-less printout
in dev (the symptom previously seen in IMG 1 of the original ticket).
The harvest helper is in `FormSigningWorkspace.tsx → handlePrint`:

```ts
const styleAssets = Array.from(
  document.head.querySelectorAll('link[rel="stylesheet"], style')
).map(node => node.tagName === 'LINK'
  ? `<link rel="stylesheet" href="${(node as HTMLLinkElement).href}"/>`
  : `<style>${(node as HTMLStyleElement).innerHTML}</style>`,
).join('\n');
```

This must be passed as `buildPrintablePacketHtml({ styleAssets })`. A
release-blocking visual-regression test compares signed-output thumbnails
against the IMG 2/3/4 reference for EN-FM-011.

---

## C. Appended pages specification

After the last template page (page `N`, e.g. page 3 for EN-FM-033) the
following pages are appended in this order. Each starts with a CSS `page-break-before`.

### Page N+1 — Attestation Certificate

Header: full eCIgn navy/orange brand band; "eCIgn · Internal Attestation Certificate".

| Block | Fields |
|---|---|
| System | "CI-App / eCIgn", system version, tenant |
| Document | Form ID, title, version, instance ID, governing policies (chips) |
| Signer | Name, role, email, tier, authentication method |
| Signature | Inline PNG of signature, signed-at UTC + local, signature ID, signature hash |
| Attestation statement | Verbatim "I agree to use an electronic signature, I have reviewed this document in full, and I intend to sign it." + checkbox-confirmed-at timestamp |
| Document integrity | Document hash, hash algorithm (SHA-256), canonical byte length |

Implementation: existing `buildCertHtml()` in `FormSigningWorkspace.tsx`.

### Page N+2 — Signer Identity & Device Evidence

| Block | Fields |
|---|---|
| Identity | name, role, email, user_id, session_id, MFA method + verified_at |
| Network | IP, ISP/ASN, geo (city, region, country, postal) |
| Device | device name, manufacturer, model, processor, OS, OS version, user agent |
| Photo (optional) | Captured webcam still, dimensions, captured-at |

### Pages N+3 … M — Audit Trail Timeline

Paginated table of every `audit_events` row tied to the form instance:

| # | UTC | Action | Actor | Subject hash | IP | Device |
|---|---|---|---|---|---|---|

Each page repeats a table header. The table is sorted ascending and includes
a "Hash chain head: `<sha256>`" line at the bottom of the last audit page.

### Page M+1 — Document Integrity & Hash Block

| Block | Fields |
|---|---|
| Document hash | SHA-256 over canonical template bytes |
| Audit chain head | SHA-256 of last audit event |
| Certificate hash | SHA-256 over the certificate page bytes |
| Combined manifest hash | SHA-256(document_hash ‖ audit_chain_head ‖ certificate_hash) |
| Verification instructions | Steps to recompute and verify externally |
| QR code | Encodes `cert_id` + manifest hash for offline verification |

### C.4 — Signers Roster (multi-signature ledger)

Always emitted as the **last** appended page, even for single-signer
forms (in which case it shows one entry). For forms governed by
[09-Multi-Signature-Flow.md](09-Multi-Signature-Flow.md), every required
slot appears in declared order with:

| Block | Fields |
|---|---|
| Index + Name | `1. JD Vance` |
| Role / Email | `Administrator Designee · jd@careindeed.com` |
| Signed-at | Local-time stamp (also recorded UTC in cert page) |
| Field id | `sig_requester` (matches template slot) |
| Signature image | Inline PNG, max-height 54px |
| Pending entries | Dashed border, orange tag "Awaiting signature", task id, due date |
| Declined entries | Crimson tag "Declined", reason, declined-at, regenerated-at |

The roster page anchors the **document_integrity legal block**:
"The form template above this packet is byte-identical to the unsigned
template at `/forms/<formId>/print` for version v<n>. Field values are
user data and are recorded in the cert hash, not in the template snapshot."

---

## D. Output deliverables

For every completed signature event the system produces:

1. **Final signed document (PDF)** — template pages (unchanged) + watermark + appended pages above.
2. **Audit trail report (PDF/JSON)** — standalone export from `exportReport.ts`.
3. **Signature certificate page (PDF)** — standalone export of pages N+1..N+2.
4. **Survey packet (ZIP)** — bundle of all of the above + governing policy snapshot
   + dependency-check report (`surveyPacket.ts`).

All four artifacts include the manifest hash and are independently verifiable.

---

## E. The four post-sign actions

Mapped from the design's `FinalActionsStep`:

| Action | Behavior | Template impact |
|---|---|---|
| Download PDF | Returns the full signed PDF (template + watermark + appended pages) | None — template untouched |
| Print Document | Opens the same PDF via the browser print pipeline | None |
| Save to Drafts | Persists current form state (pre-lock) for later completion | N/A — pre-signature |
| Send for Signature | Routes to `FormSignatureFlow.SecondSignatureModal` to assign next signer | None |

---

## F. Verification check (test before release)

```
diff <(pdf-extract --layout unsigned-EN-FM-033.pdf | head -n LAST_TEMPLATE_LINE) \
     <(pdf-extract --layout signed-EN-FM-033.pdf   | head -n LAST_TEMPLATE_LINE)
# expected: no differences in template region (only watermark line differs)
```

CI pipeline runs this for every form template to confirm Section A.4 holds.
