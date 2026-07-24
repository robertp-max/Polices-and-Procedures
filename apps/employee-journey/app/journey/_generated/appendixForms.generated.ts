/* ═══════════════════════════════════════════════════════════════
   AUTO-GENERATED — DO NOT EDIT
   File: appendixForms.generated.ts
   Generator: apps/employee-journey/scripts/generateJourneyMappings.ts
   Source branch: feature/governing-body-portal
   Schema version: 1.0.0
   Regenerate with: npm run journey:map:generate (from apps/employee-journey)
   Baked FormContent (buildFormContent) for the 9 form ids referenced by appendixFormCrosswalk.generated.ts: CL-FM-016, CL-FM-042, HR-FM-005, HR-FM-006, HR-FM-007, HR-FM-016, HR-FM-018, HR-FM-038, RM-FM-005.
   Source: src/policy/data/formsLibraryDataset.ts (FORMS_DATASET) + src/policy/data/formsLibraryContent.ts (buildFormContent).
   ═══════════════════════════════════════════════════════════════ */

import type { FormContent } from './sharedTypes.generated';

export const APPENDIX_FORMS: FormContent[] = [
  {
    "id": "CL-FM-016",
    "title": "HHA Competency Evaluation Checklist",
    "type": "Checklist",
    "domainCode": "CL",
    "policies": [
      "CL-SD-007"
    ],
    "purpose": "Standardized checklist capturing the required data elements for HHA Competency Evaluation Checklist, aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).",
    "instructions": "Completed by the responsible workforce member (annual). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.",
    "version": "6.0",
    "effectiveDate": "2025-07-10",
    "revisionDate": "2026-07-10",
    "orientation": "portrait",
    "sections": [
      {
        "title": "Section 1 — Identification",
        "layout": "grid",
        "fields": [
          {
            "label": "Form Completed By (Full Name)",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Title / Role",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Department / Branch",
            "type": "text",
            "col": 2
          },
          {
            "label": "Date Completed",
            "type": "date",
            "required": true,
            "col": 2
          }
        ]
      },
      {
        "title": "Section 2 — HHA Competency Evaluation Checklist Checklist",
        "layout": "checklist",
        "items": [
          "HHA Competency Evaluation Checklist — Regulatory requirement reviewed and understood",
          "HHA Competency Evaluation Checklist — Applicable policy section located and re-read",
          "HHA Competency Evaluation Checklist — Required documentation identified and accessible",
          "HHA Competency Evaluation Checklist — All data fields confirmed complete and accurate",
          "HHA Competency Evaluation Checklist — Signatures / attestations obtained from required parties",
          "HHA Competency Evaluation Checklist — Copy filed in the appropriate record per retention schedule",
          "HHA Competency Evaluation Checklist — Completion entered in tracking log / dashboard",
          "HHA Competency Evaluation Checklist — Any deficiencies escalated to supervisor / Compliance Officer",
          "HHA Competency Evaluation Checklist — Corrective action documented and tracked to closure",
          "HHA Competency Evaluation Checklist — Annual review date set and added to calendar"
        ]
      },
      {
        "title": "Section — Signatures & Attestation",
        "layout": "signature",
        "fields": [
          {
            "label": "Completed By — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Completed By — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Completed By — Date",
            "type": "date",
            "col": 1
          },
          {
            "label": "Supervisor / Reviewer — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Supervisor / Reviewer — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Supervisor / Reviewer — Date",
            "type": "date",
            "col": 1
          }
        ]
      }
    ],
    "signatures": [
      {
        "role": "Completed By",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      },
      {
        "role": "Supervisor / Reviewer",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      }
    ],
    "footerNotes": [
      "Care Indeed Home Health Care, Inc. · Form CL-FM-016 · Version 6.0 · Effective 2025-07-10 · Next Review 2026-07-10",
      "Linked Policies: CL-SD-007"
    ]
  },
  {
    "id": "CL-FM-042",
    "title": "Supervisory Visit Documentation (RN)",
    "type": "Template",
    "domainCode": "CL",
    "policies": [
      "CL-SD-008"
    ],
    "purpose": "Standardized template capturing the required data elements for Supervisory Visit Documentation (RN), aligned with Care Indeed policy, applicable federal/state regulation, and the enterprise gold standard (GV-GB-001).",
    "instructions": "Completed by the responsible workforce member (triggered). All fields are mandatory unless marked optional. Retained per agency record-retention schedule and made available for internal audit, state licensure, and CMS survey review.",
    "version": "6.0",
    "effectiveDate": "2025-07-10",
    "revisionDate": "2026-07-10",
    "orientation": "portrait",
    "sections": [
      {
        "title": "Section 1 — Identification",
        "layout": "grid",
        "fields": [
          {
            "label": "Form Completed By (Full Name)",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Title / Role",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Department / Branch",
            "type": "text",
            "col": 2
          },
          {
            "label": "Date Completed",
            "type": "date",
            "required": true,
            "col": 2
          }
        ]
      },
      {
        "title": "Section 2 — Content",
        "layout": "grid",
        "fields": [
          {
            "label": "Title / Subject",
            "type": "text",
            "col": 4
          },
          {
            "label": "Date",
            "type": "date",
            "col": 2
          },
          {
            "label": "Prepared By",
            "type": "text",
            "col": 2
          },
          {
            "label": "Body / Narrative",
            "type": "textarea",
            "col": 4
          },
          {
            "label": "Attachments / References",
            "type": "textarea",
            "col": 4
          }
        ]
      },
      {
        "title": "Section — Signatures & Attestation",
        "layout": "signature",
        "fields": [
          {
            "label": "Completed By — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Completed By — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Completed By — Date",
            "type": "date",
            "col": 1
          },
          {
            "label": "Supervisor / Reviewer — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Supervisor / Reviewer — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Supervisor / Reviewer — Date",
            "type": "date",
            "col": 1
          }
        ]
      }
    ],
    "signatures": [
      {
        "role": "Completed By",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      },
      {
        "role": "Supervisor / Reviewer",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      }
    ],
    "footerNotes": [
      "Care Indeed Home Health Care, Inc. · Form CL-FM-042 · Version 6.0 · Effective 2025-07-10 · Next Review 2026-07-10",
      "Linked Policies: CL-SD-008"
    ]
  },
  {
    "id": "HR-FM-005",
    "title": "OIG/SAM Monthly Exclusion Verification Log",
    "type": "Log",
    "domainCode": "HR",
    "policies": [
      "HR-TA-003"
    ],
    "purpose": "Monthly exclusion verification log documenting search of OIG LEIE, SAM.gov, and state Medicaid exclusion lists for every workforce member per 42 CFR § 1001.1901.",
    "instructions": "Performed monthly by HR/Compliance for ALL active workforce members (employees, contractors, volunteers, students). Screenshots retained for 7 years. Any exclusion hit triggers immediate suspension and 60-day notification to OIG.",
    "version": "6.0",
    "effectiveDate": "2025-07-10",
    "revisionDate": "2026-07-10",
    "orientation": "landscape",
    "sections": [
      {
        "title": "Section 1 — Identification",
        "layout": "grid",
        "fields": [
          {
            "label": "Form Completed By (Full Name)",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Title / Role",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Department / Branch",
            "type": "text",
            "col": 2
          },
          {
            "label": "Date Completed",
            "type": "date",
            "required": true,
            "col": 2
          }
        ]
      },
      {
        "title": "Section 2 — Log Entries",
        "layout": "table",
        "columns": [
          "Month / Year",
          "Workforce Member",
          "NPI / SSN (last 4)",
          "OIG LEIE Result",
          "SAM.gov Result",
          "State Exclusion Result",
          "Verifier",
          "Evidence File",
          "Action (if Hit)"
        ],
        "rowCount": 15
      },
      {
        "title": "Section — Signatures & Attestation",
        "layout": "signature",
        "fields": [
          {
            "label": "Completed By — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Completed By — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Completed By — Date",
            "type": "date",
            "col": 1
          },
          {
            "label": "Supervisor / Reviewer — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Supervisor / Reviewer — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Supervisor / Reviewer — Date",
            "type": "date",
            "col": 1
          }
        ]
      }
    ],
    "signatures": [
      {
        "role": "Completed By",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      },
      {
        "role": "Supervisor / Reviewer",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      }
    ],
    "footerNotes": [
      "Care Indeed Home Health Care, Inc. · Form HR-FM-005 · Version 6.0 · Effective 2025-07-10 · Next Review 2026-07-10",
      "Linked Policies: HR-TA-003"
    ]
  },
  {
    "id": "HR-FM-006",
    "title": "License & Cert Primary Source Verification",
    "type": "Checklist",
    "domainCode": "HR",
    "policies": [
      "HR-TA-004"
    ],
    "purpose": "Primary Source Verification (PSV) checklist confirming the authenticity of every clinical license, certification, or credential required for the role, via the issuing authority.",
    "instructions": "Completed before the first patient visit and at each renewal. PSV screenshots / printouts stored in personnel file. Expiration dates added to HR-FM-021.",
    "version": "6.0",
    "effectiveDate": "2025-07-10",
    "revisionDate": "2026-07-10",
    "orientation": "portrait",
    "sections": [
      {
        "title": "Section 1 — Identification",
        "layout": "grid",
        "fields": [
          {
            "label": "Form Completed By (Full Name)",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Title / Role",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Department / Branch",
            "type": "text",
            "col": 2
          },
          {
            "label": "Date Completed",
            "type": "date",
            "required": true,
            "col": 2
          }
        ]
      },
      {
        "title": "Section 2 — License & Cert Primary Source Verification Checklist",
        "layout": "checklist",
        "items": [
          "License / credential type identified and required for role",
          "Verification source confirmed (state board, DEA, AHA, ANA, etc.)",
          "Direct primary-source query executed (not third-party copy)",
          "Licensee identity matched (full name + DOB + license number)",
          "License active and unrestricted — no disciplinary action",
          "Expiration date recorded and added to tracking log",
          "Screenshot / confirmation saved to personnel file",
          "OIG / SAM exclusion check completed on same date",
          "Verification signed and dated by HR",
          "Employee notified of next renewal deadline"
        ]
      },
      {
        "title": "Section — Signatures & Attestation",
        "layout": "signature",
        "fields": [
          {
            "label": "HR Verifier — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "HR Verifier — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "HR Verifier — Date",
            "type": "date",
            "col": 1
          },
          {
            "label": "Clinical Manager — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Clinical Manager — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Clinical Manager — Date",
            "type": "date",
            "col": 1
          }
        ]
      }
    ],
    "signatures": [
      {
        "role": "HR Verifier",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      },
      {
        "role": "Clinical Manager",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      }
    ],
    "footerNotes": [
      "Care Indeed Home Health Care, Inc. · Form HR-FM-006 · Version 6.0 · Effective 2025-07-10 · Next Review 2026-07-10",
      "Linked Policies: HR-TA-004"
    ]
  },
  {
    "id": "HR-FM-007",
    "title": "New Hire Onboarding & Orientation Checklist",
    "type": "Checklist",
    "domainCode": "HR",
    "policies": [
      "HR-TA-005"
    ],
    "purpose": "Comprehensive checklist of mandatory orientation topics, documents, trainings, and attestations required before a new hire independently performs patient-facing duties.",
    "instructions": "Completed jointly by HR and supervisor within the first 30 days of employment. No independent patient care until checklist is 100% signed off.",
    "version": "6.0",
    "effectiveDate": "2025-07-10",
    "revisionDate": "2026-07-10",
    "orientation": "portrait",
    "sections": [
      {
        "title": "Section 1 — Identification",
        "layout": "grid",
        "fields": [
          {
            "label": "Form Completed By (Full Name)",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Title / Role",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Department / Branch",
            "type": "text",
            "col": 2
          },
          {
            "label": "Date Completed",
            "type": "date",
            "required": true,
            "col": 2
          }
        ]
      },
      {
        "title": "Section 2 — New Hire Onboarding & Orientation Checklist Checklist",
        "layout": "checklist",
        "items": [
          "I-9, W-4, and direct-deposit forms completed",
          "Background check clear / OIG-SAM clear",
          "Required license(s) verified via Primary Source",
          "HIPAA training completed",
          "Bloodborne Pathogens & OSHA training completed",
          "Infection Control & Hand Hygiene training completed",
          "TB screening and HepB declination / vaccine",
          "Emergency Preparedness orientation",
          "Patient Rights & Ethics orientation",
          "Policy Acknowledgments (Code of Conduct, Anti-Harassment, FWA, Privacy) signed",
          "Job description acknowledged and signed",
          "System access & badge issued",
          "Skills competency assessment completed and passed",
          "Supervised field visit(s) completed and documented",
          "Orientation sign-off by supervisor and new hire"
        ]
      },
      {
        "title": "Section — Signatures & Attestation",
        "layout": "signature",
        "fields": [
          {
            "label": "New Hire — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "New Hire — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "New Hire — Date",
            "type": "date",
            "col": 1
          },
          {
            "label": "Supervisor — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Supervisor — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Supervisor — Date",
            "type": "date",
            "col": 1
          },
          {
            "label": "HR Representative — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "HR Representative — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "HR Representative — Date",
            "type": "date",
            "col": 1
          }
        ]
      }
    ],
    "signatures": [
      {
        "role": "New Hire",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      },
      {
        "role": "Supervisor",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      },
      {
        "role": "HR Representative",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      }
    ],
    "footerNotes": [
      "Care Indeed Home Health Care, Inc. · Form HR-FM-007 · Version 6.0 · Effective 2025-07-10 · Next Review 2026-07-10",
      "Linked Policies: HR-TA-005"
    ]
  },
  {
    "id": "HR-FM-016",
    "title": "Clinical Staff Competency Validation Checklist",
    "type": "Checklist",
    "domainCode": "HR",
    "policies": [
      "HR-TD-003",
      "CL-SD-007"
    ],
    "purpose": "Documents initial and annual clinical competency validation for every clinical staff member (RN, LVN, PT, OT, SLP, MSW, HHA).",
    "instructions": "Initial validation within 90 days of hire; annual thereafter. Competency gaps trigger remediation plan (HR-FM-038). Records retained in personnel file.",
    "version": "6.0",
    "effectiveDate": "2025-07-10",
    "revisionDate": "2026-07-10",
    "orientation": "portrait",
    "sections": [
      {
        "title": "Section 1 — Identification",
        "layout": "grid",
        "fields": [
          {
            "label": "Form Completed By (Full Name)",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Title / Role",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Department / Branch",
            "type": "text",
            "col": 2
          },
          {
            "label": "Date Completed",
            "type": "date",
            "required": true,
            "col": 2
          }
        ]
      },
      {
        "title": "Section 2 — Clinical Staff Competency Validation Checklist Checklist",
        "layout": "checklist",
        "items": [
          "Clinical Staff Competency Validation Checklist — Regulatory requirement reviewed and understood",
          "Clinical Staff Competency Validation Checklist — Applicable policy section located and re-read",
          "Clinical Staff Competency Validation Checklist — Required documentation identified and accessible",
          "Clinical Staff Competency Validation Checklist — All data fields confirmed complete and accurate",
          "Clinical Staff Competency Validation Checklist — Signatures / attestations obtained from required parties",
          "Clinical Staff Competency Validation Checklist — Copy filed in the appropriate record per retention schedule",
          "Clinical Staff Competency Validation Checklist — Completion entered in tracking log / dashboard",
          "Clinical Staff Competency Validation Checklist — Any deficiencies escalated to supervisor / Compliance Officer",
          "Clinical Staff Competency Validation Checklist — Corrective action documented and tracked to closure",
          "Clinical Staff Competency Validation Checklist — Annual review date set and added to calendar"
        ]
      },
      {
        "title": "Section — Signatures & Attestation",
        "layout": "signature",
        "fields": [
          {
            "label": "Completed By — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Completed By — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Completed By — Date",
            "type": "date",
            "col": 1
          },
          {
            "label": "Supervisor / Reviewer — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Supervisor / Reviewer — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Supervisor / Reviewer — Date",
            "type": "date",
            "col": 1
          }
        ]
      }
    ],
    "signatures": [
      {
        "role": "Completed By",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      },
      {
        "role": "Supervisor / Reviewer",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      }
    ],
    "footerNotes": [
      "Care Indeed Home Health Care, Inc. · Form HR-FM-016 · Version 6.0 · Effective 2025-07-10 · Next Review 2026-07-10",
      "Linked Policies: HR-TD-003, CL-SD-007"
    ]
  },
  {
    "id": "HR-FM-018",
    "title": "Background Check Authorization & Summary",
    "type": "Form",
    "domainCode": "HR",
    "policies": [
      "HR-TA-002"
    ],
    "purpose": "Authorizes the agency to obtain a criminal-background check, fingerprint screening, driving record, and credit check where role-appropriate.",
    "instructions": "Signed prior to any background check. FCRA-compliant disclosures provided. Results retained separately from the personnel file.",
    "version": "6.0",
    "effectiveDate": "2025-07-10",
    "revisionDate": "2026-07-10",
    "orientation": "portrait",
    "sections": [
      {
        "title": "Section 1 — Identification",
        "layout": "grid",
        "fields": [
          {
            "label": "Form Completed By (Full Name)",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Title / Role",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Department / Branch",
            "type": "text",
            "col": 2
          },
          {
            "label": "Date Completed",
            "type": "date",
            "required": true,
            "col": 2
          }
        ]
      },
      {
        "title": "Section 2 — Data Capture",
        "layout": "grid",
        "fields": [
          {
            "label": "Applicant Full Legal Name (incl. former names)",
            "type": "text",
            "required": true,
            "col": 4
          },
          {
            "label": "Date of Birth",
            "type": "date",
            "required": true,
            "col": 2
          },
          {
            "label": "SSN (last 4)",
            "type": "text",
            "col": 2
          },
          {
            "label": "Current Address",
            "type": "text",
            "col": 4
          },
          {
            "label": "Prior Addresses (7 years)",
            "type": "textarea",
            "col": 4
          },
          {
            "label": "Driver's License # / State",
            "type": "text",
            "col": 4
          }
        ]
      },
      {
        "title": "Section — Signatures & Attestation",
        "layout": "signature",
        "fields": [
          {
            "label": "Applicant — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Applicant — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Applicant — Date",
            "type": "date",
            "col": 1
          },
          {
            "label": "HR Representative — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "HR Representative — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "HR Representative — Date",
            "type": "date",
            "col": 1
          }
        ]
      }
    ],
    "signatures": [
      {
        "role": "Applicant",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      },
      {
        "role": "HR Representative",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      }
    ],
    "footerNotes": [
      "Care Indeed Home Health Care, Inc. · Form HR-FM-018 · Version 6.0 · Effective 2025-07-10 · Next Review 2026-07-10",
      "Linked Policies: HR-TA-002"
    ]
  },
  {
    "id": "HR-FM-038",
    "title": "Competency Remediation Plan",
    "type": "Form",
    "domainCode": "HR",
    "policies": [
      "HR-TD-003"
    ],
    "purpose": "Remediation plan for an employee failing a clinical competency validation, specifying training, supervised practice, and re-validation.",
    "instructions": "Issued within 5 business days of failed validation. Maximum remediation period 60 days; failure to achieve competency may result in reassignment or termination.",
    "version": "6.0",
    "effectiveDate": "2025-07-10",
    "revisionDate": "2026-07-10",
    "orientation": "portrait",
    "sections": [
      {
        "title": "Section 1 — Identification",
        "layout": "grid",
        "fields": [
          {
            "label": "Form Completed By (Full Name)",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Title / Role",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Department / Branch",
            "type": "text",
            "col": 2
          },
          {
            "label": "Date Completed",
            "type": "date",
            "required": true,
            "col": 2
          }
        ]
      },
      {
        "title": "Section 2 — Data Capture",
        "layout": "grid",
        "fields": [
          {
            "label": "Employee Name / Role",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Failed Competency",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Date of Initial Validation",
            "type": "date",
            "col": 2
          },
          {
            "label": "Remediation Period",
            "type": "text",
            "col": 2
          },
          {
            "label": "Required Training / Study",
            "type": "textarea",
            "col": 4
          },
          {
            "label": "Supervised Practice (# visits / hours)",
            "type": "text",
            "col": 2
          },
          {
            "label": "Preceptor Assigned",
            "type": "text",
            "col": 2
          },
          {
            "label": "Re-validation Date / Method",
            "type": "text",
            "col": 4
          },
          {
            "label": "Consequences of Continued Failure",
            "type": "textarea",
            "col": 4
          }
        ]
      },
      {
        "title": "Section — Signatures & Attestation",
        "layout": "signature",
        "fields": [
          {
            "label": "Employee — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Employee — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Employee — Date",
            "type": "date",
            "col": 1
          },
          {
            "label": "Preceptor — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Preceptor — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Preceptor — Date",
            "type": "date",
            "col": 1
          },
          {
            "label": "Clinical Manager — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Clinical Manager — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Clinical Manager — Date",
            "type": "date",
            "col": 1
          }
        ]
      }
    ],
    "signatures": [
      {
        "role": "Employee",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      },
      {
        "role": "Preceptor",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      },
      {
        "role": "Clinical Manager",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      }
    ],
    "footerNotes": [
      "Care Indeed Home Health Care, Inc. · Form HR-FM-038 · Version 6.0 · Effective 2025-07-10 · Next Review 2026-07-10",
      "Linked Policies: HR-TD-003"
    ]
  },
  {
    "id": "RM-FM-005",
    "title": "After-Action Review (AAR) Form",
    "type": "Assessment",
    "domainCode": "RM",
    "policies": [
      "OP-FM-005",
      "RM-EP-002",
      "QA-AE-002"
    ],
    "purpose": "After-Action Review (AAR) of an actual incident or activation of the EP plan, capturing lessons learned.",
    "instructions": "Completed within 5 business days of event.",
    "version": "6.0",
    "effectiveDate": "2025-07-10",
    "revisionDate": "2026-07-10",
    "orientation": "portrait",
    "sections": [
      {
        "title": "Section 1 — Identification",
        "layout": "grid",
        "fields": [
          {
            "label": "Form Completed By (Full Name)",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Title / Role",
            "type": "text",
            "required": true,
            "col": 2
          },
          {
            "label": "Department / Branch",
            "type": "text",
            "col": 2
          },
          {
            "label": "Date Completed",
            "type": "date",
            "required": true,
            "col": 2
          }
        ]
      },
      {
        "title": "Section 2 — Assessment Responses",
        "layout": "grid",
        "fields": [
          {
            "label": "Event / Incident",
            "type": "text",
            "required": true,
            "col": 4
          },
          {
            "label": "Event Date",
            "type": "date",
            "col": 2
          },
          {
            "label": "AAR Facilitator",
            "type": "text",
            "col": 2
          },
          {
            "label": "Summary of Event",
            "type": "textarea",
            "col": 4
          },
          {
            "label": "What Went Well",
            "type": "textarea",
            "col": 4
          },
          {
            "label": "What Did Not Go Well",
            "type": "textarea",
            "col": 4
          },
          {
            "label": "Why — Root Causes",
            "type": "textarea",
            "col": 4
          },
          {
            "label": "Corrective / Preventive Actions",
            "type": "textarea",
            "col": 4
          }
        ]
      },
      {
        "title": "Section — Signatures & Attestation",
        "layout": "signature",
        "fields": [
          {
            "label": "Facilitator — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Facilitator — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Facilitator — Date",
            "type": "date",
            "col": 1
          },
          {
            "label": "Administrator — Printed Name",
            "type": "text",
            "col": 2
          },
          {
            "label": "Administrator — Signature",
            "type": "signature",
            "col": 1
          },
          {
            "label": "Administrator — Date",
            "type": "date",
            "col": 1
          }
        ]
      }
    ],
    "signatures": [
      {
        "role": "Facilitator",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      },
      {
        "role": "Administrator",
        "includeName": true,
        "includeTitle": true,
        "includeDate": true
      }
    ],
    "footerNotes": [
      "Care Indeed Home Health Care, Inc. · Form RM-FM-005 · Version 6.0 · Effective 2025-07-10 · Next Review 2026-07-10",
      "Linked Policies: OP-FM-005, RM-EP-002, QA-AE-002"
    ]
  }
];

export function getAppendixForm(formId: string): FormContent | undefined {
  return APPENDIX_FORMS.find((f) => f.id === formId);
}

