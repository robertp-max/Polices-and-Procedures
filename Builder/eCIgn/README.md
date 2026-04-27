# eCIgn — Compliance-Grade Electronic Signature System

**Scope.** Legally enforceable, audit-ready electronic signature subsystem of CI-App for
Care Indeed Home Health Care, Inc. (a Medicare-certified home health agency).

**Regulatory frame.**

| Frame | Authority |
|---|---|
| ESIGN Act | 15 U.S.C. §§ 7001–7031 |
| UETA | Uniform Electronic Transactions Act (CA Civil Code §§ 1633.1–1633.17) |
| HIPAA | 45 CFR Parts 160, 162, 164 |
| CMS Home Health CoPs | 42 CFR Part 484 |

**Non-negotiable design constraint.** The published form templates rendered at
`/forms/:formId/print` (e.g. EN-FM-003, EN-FM-033) are the system of record. They are
**byte-identical** between the unsigned and signed PDF. eCIgn never alters template
geometry, header, footer, paging, fields, or content. Identity, intent, timestamp,
device, and integrity evidence are added through:

1. A subtle **watermark stamp** in the form footer band (does not displace any field).
2. **Appended pages** after the last template page:
   - Page N+1 — Attestation Certificate
   - Page N+2 — Signer Identity & Device Evidence
   - Page N+3 — Audit Trail Timeline (consent → identity → review → sign → lock; second-sig events when present)
   - Page N+4 — Signers Roster (multi-signature ledger; see [09-Multi-Signature-Flow.md](09-Multi-Signature-Flow.md))

> If a deliverable would force editing template geometry or fields, the system rejects
> the print job rather than silently mutate the template.

---

## Document Set (read in order)

| # | File | Purpose |
|---|---|---|
| 1 | [01-System-Architecture.md](01-System-Architecture.md) | Frontend + backend topology, design system, integration map (Phases 1, 2, 6) |
| 2 | [02-Signature-Workflow.md](02-Signature-Workflow.md) | Mandatory 6-step lifecycle (Phase 3) |
| 3 | [03-Audit-and-Compliance-Model.md](03-Audit-and-Compliance-Model.md) | Audit trail + compliance event model (Phases 4, 5, 11) |
| 4 | [04-UI-Components.md](04-UI-Components.md) | Component inventory mapped to source files (Phase 7) |
| 5 | [05-Failure-Prevention.md](05-Failure-Prevention.md) | Hard guardrails the system must enforce (Phase 8) |
| 6 | [06-Outputs-Templates-Watermarks.md](06-Outputs-Templates-Watermarks.md) | **Template preservation contract**, watermark spec, appended-page spec (Phases 9, 10) |
| 7 | [07-Data-Models-and-API.md](07-Data-Models-and-API.md) | TypeScript types + REST/RPC surface |
| 8 | [08-Validation-and-Defensibility.md](08-Validation-and-Defensibility.md) | Validation framework, auto-remediation, **Legal Binding Eligibility & Audit Defensibility Certificate** (Phase 12) |
| 9 | [09-Multi-Signature-Flow.md](09-Multi-Signature-Flow.md) | Roster contract, sequencing, per-task lifecycle, decline & re-issue, multi-signer packet impact |

---

## Existing implementation pointers

| Concern | File |
|---|---|
| Workspace shell, signing canvas, camera capture, certificate HTML | [src/policy/components/FormSigningWorkspace.tsx](../../src/policy/components/FormSigningWorkspace.tsx) |
| Shared types, demo session, geo info, field-edit log | [src/policy/components/FormSignatureContext.tsx](../../src/policy/components/FormSignatureContext.tsx) |
| Post-sign action banner + second-signature modal | [src/policy/components/FormSignatureFlow.tsx](../../src/policy/components/FormSignatureFlow.tsx) |
| Print view (template, must remain unmodified) | [src/policy/pages/FormPrintView.tsx](../../src/policy/pages/FormPrintView.tsx) |
| Audit aggregation + survey packet | [src/policy/audit/](../../src/policy/audit) |
| Compliance engine + event evaluator | [src/policy/compliance/](../../src/policy/compliance) |

---

## Final determination (preview)

> This system is **designed to meet** the requirements for legal enforceability under
> ESIGN/UETA and CMS audit defensibility under 42 CFR Part 484, contingent upon proper
> implementation of the controls in this documentation set and operational adherence
> by Care Indeed staff. Full certificate in [08-Validation-and-Defensibility.md](08-Validation-and-Defensibility.md).
