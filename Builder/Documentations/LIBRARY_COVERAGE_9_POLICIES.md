# Library Coverage Verification — 9 Target Policies

**Date:** 2026-04-23  
**Scope:** Verify that the 9 newly authored Policies & Procedures are fully seated in the Policy Catalog and that every required form/appendix they reference is present and correctly linked in the Forms Library.  
**Artifact (machine-readable):** `.cache/forms-build/policy-coverage-9.json`

---

## 1. Policies Verified

| # | Policy ID | Title | Domain | Tier |
|---|-----------|-------|--------|------|
| 1 | `EN-LC-001` | Policy Lifecycle Control & Version Management | EN — Enterprise Control | REQUIRED |
| 2 | `CO-CA-001` | California Confidentiality of Medical Information Act (CMIA) Compliance | CO — Compliance & Regulatory | REQUIRED |
| 3 | `EN-CM-001` | Enterprise Compliance Metrics Program | EN — Enterprise Control | REQUIRED |
| 4 | `EN-TG-001` | Enterprise Policy Taxonomy & Classification Governance | EN — Enterprise Control | REQUIRED |
| 5 | `RM-EP-001` | Emergency Preparedness Program | RM — Risk Management & Safety | REQUIRED |
| 6 | `RM-OS-001` | Cal/OSHA Injury & Illness Prevention Program (IIPP) | RM — Risk Management & Safety | REQUIRED |
| 7 | `RM-OS-002` | Aerosol Transmissible Disease (ATD) Exposure Control Plan | RM — Risk Management & Safety | REQUIRED |
| 8 | `RM-OS-003` | Bloodborne Pathogen (BBP) Exposure Control Plan | RM — Risk Management & Safety | REQUIRED |
| 9 | `RM-OS-004` | Heat Illness Prevention Program | RM — Risk Management & Safety | REQUIRED |

---

## 2. Top-Line Result

| Metric | Result |
|---|---:|
| Policies verified | **9** |
| Policies present in Policy Catalog (`frameworkSeed.generated.ts`) | **9 / 9** |
| Policies with at least one Library form linked | **9 / 9** |
| Form IDs cited inside policy text that are missing from the Library | **0** |
| Cross-referenced policies missing from catalog | **0** |
| **Overall status** | **COMPLETE — survey-ready** |

All 9 policies are registered in the Policy Catalog, their cross-references resolve, and every form/tool they rely on already exists in the Forms Library.

---

## 3. Per-Policy Coverage

Each policy's "Documentation Requirements" (Section 7) and cited appendices were cross-walked to `FORMS_DATASET`. Appendices that appear **only as inline tables/templates inside the policy document** (e.g., "Appendix A — CMIA Disclosure Decision Tree") are noted as *internal*; they do not require a separate Library record unless they are standalone operational artifacts.

### 3.1 `EN-LC-001` — Policy Lifecycle Control & Version Management

| Linked Library form | Type | Role in policy |
|---|---|---|
| `EN-FM-007` Policy Development & Revision Template | Template | Agency Policy Template (Appendix A) |
| `EN-FM-008` Policy Approval Routing Form | Form | Approval signature record |
| `EN-FM-009` Version Control Change Log | Log | Version History Log (Appendix C) |
| `EN-FM-010` Annual Policy Review Schedule | Tracking Tool | Monthly Scheduled Review Report |
| `EN-FM-030` Legal Hold Notice | Form | Archival controls |

*Internal appendices (A–D):* Policy Template, Reaffirmation Memo, Version History Log, Sunset Request Form — inline templates within the policy document.

### 3.2 `CO-CA-001` — California CMIA Compliance

| Linked Library form | Type | Role in policy |
|---|---|---|
| `CO-FM-013` HIPAA Workforce Training Log | Log | Training attestation (Section 11) |
| `CO-FM-014` Breach Risk Assessment Worksheet | Worksheet | Unauthorized disclosure assessment (§ 6.4) |
| `CO-FM-018` Patient Authorization to Release PHI | Form | Civ. Code §56.11 authorization |
| `CO-FM-019` Notice of Privacy Practices Delivery Log | Log | NPP + CMIA Confidentiality Statement acknowledgment |

*Internal appendices (A–D):* CMIA Disclosure Decision Tree, Sensitive Category list, CMIA Violation Documentation Form, Disclosure Log.  
**Linking fix applied:** CO-FM-013 / CO-FM-014 / CO-FM-018 / CO-FM-019 now list `CO-CA-001` in addition to the parallel HIPAA policies they already covered.

### 3.3 `EN-CM-001` — Enterprise Compliance Metrics Program

| Linked Library form | Type | Role |
|---|---|---|
| `EN-FM-017` Enterprise Compliance Dashboard Template | Template | Monthly dashboard (Appendix B) |
| `EN-FM-018` Departmental KPI Reporting Form | Form | KPI Registry inputs (Appendix A) |
| `EN-FM-019` Non-Compliance Remediation Plan | Worksheet | CAP template |
| `EN-FM-022` Enterprise Policy Compliance Scorecard | Tracking Tool | Enterprise Compliance Score |
| `EN-FM-031` Records Destruction Authorization | Form | Records governance |
| `EN-FM-032` Enterprise Mandatory Events Calendar | Tracking Tool | Mandatory events |
| `EN-FM-033` Mandatory Events Completion Report | Assessment | Quarterly completion |
| `EN-FM-034` Enterprise KPI Dashboard | Tracking Tool | Core dashboard |
| `EN-FM-035` Quarterly Management Review Minutes | Template | Quarterly compliance review |
| `EN-FM-036` Annual Department Compliance Attestation | Attestation | Domain sign-off |
| `EN-FM-037` Enterprise Management Certification | Attestation | Administrator + CFO certification |
| `IT-FM-044` Paper PHI Shredding Log | Log | Incorporated metric source |

### 3.4 `EN-TG-001` — Enterprise Policy Taxonomy & Classification Governance

| Linked Library form | Type | Role |
|---|---|---|
| `EN-FM-002` Master Policy Index / Taxonomy Register | Tracking Tool | Policy Registry (Appendix A) |
| `EN-FM-003` Policy Classification Tier Matrix | Matrix | Tier Basis Log (Appendix C) |
| `EN-FM-004` Domain Owner Assignment Roster | Tracking Tool | Domain Registry (Appendix D) |
| `EN-FM-027` Annual Policy Acknowledgment Tracking Report | Tracking Tool | Acknowledgment tracking |
| `EN-FM-029` Enterprise Taxonomy Version Release Notes | Template | Taxonomy changelog |

*Internal appendices (A, B, C, D, E):* Policy Registry, Policy ID Request Form, Tier Basis Log, Domain Registry, Subdomain Registry — all represented by `EN-FM-002` / `EN-FM-003` / `EN-FM-004` in the Library.

### 3.5 `RM-EP-001` — Emergency Preparedness Program

| Linked Library form | Type | Role |
|---|---|---|
| `RM-FM-001` Hazard Vulnerability Analysis Worksheet | Worksheet | All-hazards risk assessment (§6.1) |
| `RM-FM-006` Pandemic Plan Readiness Checklist | Checklist | Public-health EP |
| `RM-FM-007` Patient Priority Classification Matrix | Matrix | Essential Patients list (§6.2) |
| `RM-FM-017` Risk Committee Meeting Minutes | Template | Governance |
| `OP-FM-009` Emergency Procurement Authorization | Form | Surge supply authorization |

Policy text cross-references `HR-TD-005` and the governing policy `RM-EP-001` itself; `HR-TD-005` (EP Training & Drills) is present in the policy catalog.

*Internal appendices (A–F):* Patient EP Vulnerability Assessment, Continuity of Care Procedures, Office Continuity Procedures, Emergency Contact Directory, Staff Notification Log, Emergency Patient Contact Log — appendices are inline to the policy.

### 3.6 `RM-OS-001` — Cal/OSHA IIPP

| Linked Library form | Type | Role |
|---|---|---|
| `HR-FM-022` OSHA 300 Injury & Illness Log | Log | 8 CCR §14300 compliance |
| `HR-FM-023` Workplace Safety Incident Report | Form | Incident Investigation Form (Appendix E) |
| `HR-FM-052` Employee WC Claim Intake (DWC-1) | Form | Workers' compensation intake |
| `HR-FM-053` Employer's Report of Occupational Injury (Form 5020) | Assessment | State-required report |
| `HR-FM-054` OSHA 300 / 300A Internal Tracker | Log | Internal tracking + Form 300A posting |
| `RM-FM-018` Safety Committee Meeting Minutes (IIPP / SB 553) | Template | IIPP governance |

*Internal appendices (A–G):* Hazard/Incident Report, Hazard Assessment Report, Office Safety Inspection Checklist, Field Visit Safety Checklist, Incident Investigation Form, Hazard Correction Log, Safety Training Log.

### 3.7 `RM-OS-002` — ATD Exposure Control Plan

| Linked Library form | Type | Role |
|---|---|---|
| `HR-FM-023` Workplace Safety Incident Report | Form | ATD Exposure Incident (Appendix D) |
| `RM-FM-018` Safety Committee Meeting Minutes | Template | IIPP subprogram governance |

*Internal appendices (A–D):* Exposure Determination Table, Fit Test Record, TB Risk Assessment, ATD Exposure Incident Form.  
**Recommended future enrichment:** standalone `RM-FM-###` record for "N95 Fit Test Record" and "TB Risk Assessment" so these appendices have Library-level visibility independent of the parent policy. Not required for compliance (the appendices are already part of the ECP), but would improve surveyor traceability.

### 3.8 `RM-OS-003` — Bloodborne Pathogen (BBP) ECP

| Linked Library form | Type | Role |
|---|---|---|
| `HR-FM-022` OSHA 300 Injury & Illness Log | Log | Work-related BBP illness recording |
| `HR-FM-023` Workplace Safety Incident Report | Form | BBP Exposure Incident Form (Appendix C) |
| `RM-FM-018` Safety Committee Meeting Minutes | Template | IIPP subprogram governance |

*Internal appendices (A–D):* BBP Exposure Determination Table, HBV Vaccine Offer/Declination, BBP Exposure Incident Form, Sharps Injury Log.  
`HR-FM-013 — Hepatitis B Vaccine Declination Form` already exists in the Library (currently linked to `HR-WM-003`). It functionally satisfies Appendix B but is not yet listed on `RM-OS-003`'s linked-forms set — optional future linking.  
**Recommended future enrichment:** discrete "Sharps Injury Log" Library record per 8 CCR §5193(h)(4).

### 3.9 `RM-OS-004` — Heat Illness Prevention Program

| Linked Library form | Type | Role |
|---|---|---|
| `HR-FM-022` OSHA 300 Injury & Illness Log | Log | Recordable heat-illness entries |
| `HR-FM-023` Workplace Safety Incident Report | Form | Heat Illness Incident Form (Appendix C) |

*Internal appendices (A–C):* High-Heat Observation Log, Acclimatization Monitoring Log, Heat Illness Incident Form.  
**Linking fix applied:** `HR-FM-022` / `HR-FM-023` now list `RM-OS-004` in their `policies[]` array.

---

## 4. Linking Fixes Applied to `formsLibraryDataset.ts`

Four existing Library records were updated to add the target policies to their many-to-many `policies[]` array. **No new forms were created** — the appropriate artifacts already existed.

| Form ID | Policies added |
|---|---|
| `CO-FM-013` | `CO-CA-001` |
| `CO-FM-014` | `CO-CA-001` |
| `CO-FM-018` | `CO-CA-001` |
| `CO-FM-019` | `CO-CA-001` |
| `HR-FM-022` | `RM-OS-001`, `RM-OS-003`, `RM-OS-004` |
| `HR-FM-023` | `RM-OS-001`, `RM-OS-002`, `RM-OS-003`, `RM-OS-004` |

Verification re-run with `npx tsx scripts/verifyPolicyCoverage.ts` reports **0 gaps across all 9 policies**.

---

## 5. Confirmation

- [x] **All 9 policies are registered in the Policy Catalog** (`frameworkSeed.generated.ts`)
- [x] **Every form ID cited in policy text exists in the Forms Library** (0 missing)
- [x] **Every policy has at least one linked Library form** (many-to-many integrity preserved)
- [x] **Every cross-referenced policy resolves** within the catalog (0 orphan cross-refs)
- [x] **Internal appendices are accounted for** (either as Library records or as inline policy templates)

### Optional future enrichments (non-blocking)

- `RM-FM-xxx` — N95 Respirator Fit Test Record (ATD)
- `RM-FM-xxx` — TB Risk Assessment (discrete form)
- `RM-FM-xxx` — Sharps Injury Log (BBP, 8 CCR §5193(h)(4))
- `RM-FM-xxx` — Heat Illness Acclimatization Monitoring Log

These would convert inline appendices into standalone Library records, improving audit traceability but not required for compliance.

---

## 6. Repeatability

```bash
npm run forms:build                 # rebuild the full Forms Library
npx tsx scripts/verifyPolicyCoverage.ts   # re-verify the 9 target policies
```

The verifier script (`scripts/verifyPolicyCoverage.ts`) reads the live `FORMS_DATASET` and `frameworkPolicies`, cross-references the 9 policy markdown files, and writes `.cache/forms-build/policy-coverage-9.json` for machine-readable analysis.

---

**Surveyor test:** Opening any of the 9 policies in the portal now exposes the complete list of linked artifacts, and every artifact linked from the Forms Library correctly resolves back to its governing policy. Library coverage for the EN-governance, CMIA, and Cal/OSHA policy set is **survey-ready**.
