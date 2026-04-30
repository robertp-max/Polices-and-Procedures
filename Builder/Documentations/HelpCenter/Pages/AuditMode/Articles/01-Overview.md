# Audit Mode — Overview

**Article:** 01-Overview  
**Page:** Audit Mode (`/audit`)

---

## What This Page Does

Audit Mode presents the compliance system in the exact state that a CMS surveyor or state inspector would see if they requested access to the agency's compliance records. Every event is displayed with its current status, evidence, and history — all in read-only format.

---

## Why It Exists

During a survey, agency staff often need to quickly navigate to and display compliance records without risking accidental modification. Audit Mode provides this by:
- Locking all mutation controls
- Displaying the cleanest possible view of compliance state
- Making evidence immediately downloadable
- Showing risk scores so staff can anticipate surveyor focus areas

---

## Where It Fits in the System

Audit Mode is the **final read layer** of the system — it reads from all stores but writes to none (except toggling the mode itself).

```
All compliance activities (Calendar, Evidence, Lifecycle)
                    ↓
              Enforcement Store
              Execution Store
                    ↓
            Audit State Engine
                    ↓
              Audit Mode Page
                    ↓
         Surveyor / Internal Review
```

---

## The Risk Score

The **Risk Score** (0–100) shown on the Audit Mode page is a computed metric from `riskScoring.ts`. A higher score indicates higher compliance risk. Components include:

| Driver | Weight | Description |
|---|---|---|
| Overdue events | 30% | Number and severity of overdue items |
| Evidence gaps | 25% | Events missing accepted evidence |
| SLA warnings | 20% | Items approaching deadlines |
| Blocked events | 15% | Unresolvable blockers present |
| Uncertified completions | 10% | Work done but not certified |

A score of **0** means perfect compliance posture. A score above **70** indicates immediate jeopardy risk.

---

## Who Uses This Page

- **Administrators:** Daily review before surveys
- **Surveyors/Auditors:** During a site visit
- **Compliance Officers:** Monthly reporting
- **Executive leadership:** Quarterly compliance review
