# Print & PDF Consistency Guidelines — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Critical For:** Legal defensibility, compliance artifacts, eCign packets, audit exports

---

## 1. Philosophy

Print and PDF outputs from the CareIndeed platform are **legal and regulatory artifacts**. They must be:

- Visually consistent
- Legally defensible
- Easy to read on paper or as a PDF
- Clearly branded as Care Indeed (single brand only)

**Never** allow visual drift between on-screen and printed versions of the same document.

---

## 2. Core Rules

### 2.1 Single Source of Truth for Headers & Footers

- **eCign signed packets** must use the single `buildPrintablePacketHtml` renderer in [FormSigningWorkspace.tsx](/src/policy/components/FormSigningWorkspace.tsx).
- The `.ci-brand-header` (fixed top bar) and `.ecign-footer` must appear on **every printed page**.
- Do **not** allow `.form-frame` (embedded) and `.form-page` (standalone) to render different header treatments.

### 2.2 Brand Header (Mandatory on All Printed Pages)

The Care Indeed brand header must contain:
- Care Indeed logo (mark + wordmark)
- "Care Indeed Home Health Care, Inc."
- "Enterprise Forms Library · Signed Document Package"
- Form title (right aligned)
- Subtle teal bottom border

**Color rules on print:**
- Background: near-white with slight opacity
- Text: Navy primary, Muted secondary
- Accent: Teal for the bottom border

### 2.3 Footer Requirements

Every printed compliance document must show:
- Small Care Indeed logo
- Certificate / Document ID (monospace)
- Signer name
- Signed timestamp
- "SIGNED" badge (bold, orange accent)

---

## 3. eCign Packet Specific Rules

### Approved Structure (Signed Locked State)

1. Care Indeed fixed brand header (every page)
2. Form content (the actual eCign form)
3. Appended certificate page(s) — if any
4. Fixed footer with signature metadata (every page)

### Prohibited

- Dual header systems (old CI-ION + new Care Indeed)
- Hard black borders on any printed element
- Different typography or spacing between the form body and the certificate
- Overlapping content under the fixed header/footer

---

## 4. CES Reports & Audit Exports

When exporting CES reports, Audit Readiness, or Onboarding Activation summaries to PDF:

- Use the same typography scale as the design system (Montserrat headings, Inter body)
- Maintain 3-layer glass hierarchy visually (via soft shadows or subtle tints)
- Include the Care Indeed brand header + timestamp + generated-by line
- Use restrained orange only for high-urgency items (overdue, failed, blocked)
- Teal for completed / compliant items

---

## 5. Technical Implementation Requirements

- All print styles must live in the component that owns the printable artifact (never global `* {}` overrides).
- Use `@media print` + `@page` rules.
- Force `page-break-inside: avoid` on cards, sections, and tables that should stay together.
- Test on both Chrome and Edge (most common for field users).

---

## 6. QA Checklist Before Shipping Any Print/PDF Feature

- [ ] Header appears on every page
- [ ] Footer appears on every page
- [ ] No content overlaps header/footer
- [ ] Form title is accurate
- [ ] Certificate ID matches the signed record
- [ ] Signature image is clear and not distorted
- [ ] All required legal text is present and legible
- [ ] No CI-ION maroon/gold appears anywhere

---

## 7. Known Historical Issues (Do Not Reintroduce)

- Conflicting `.form-frame` vs `.form-page` renderers (caused white-screen / header duplication on signed_locked packets).
- Two different brand headers in the same print job.
- Missing or incorrect `ciLogoSrc` / `logoSrc` paths.

---

**Print and PDF outputs are the final legal record.** Treat them with the same rigor as the signing experience itself.

---

*Next:* Add automated visual regression tests for signed eCign packets.