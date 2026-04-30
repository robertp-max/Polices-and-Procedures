# Policy Library — Overview

**Article:** 01-Overview  
**Page:** Policy Library (`/library`)

---

## What This Page Does

The Policy Library is the agency's official digital policy repository. It stores and displays every policy document, organized by a 10-domain compliance framework. Users can browse by domain, search by keyword, or filter by policy status.

---

## Why It Exists

CMS Conditions of Participation require that home health agencies maintain written policies and procedures covering all aspects of agency operations, and that these policies be accessible to all staff. The Policy Library fulfills this requirement by providing a searchable, access-controlled, versioned repository.

---

## Where It Fits in the System

The Policy Library is a **reference layer** that supports all other compliance activities:

- Events reference policies via `policy_id`
- Workflows cite policies as their regulatory basis
- Evidence documents are tagged with the policies they support
- Staff attestations are recorded against specific `policy_id` values

---

## The 10 Compliance Domains

| Domain Code | Domain Name | Example Policies |
|---|---|---|
| GV | Governance | Governing Body Charter, Organizational Structure |
| CL | Clinical | Patient Assessment, Medication Management, Wound Care |
| QA | Quality Assurance | QAPI Program, Incident Reporting, Peer Review |
| HR | Human Resources | Employee Screening, Orientation, Disciplinary Action |
| CO | Compliance | HIPAA, Fraud & Abuse, Privacy Practices |
| FN | Finance | Billing, Cost Reporting, Financial Controls |
| OP | Operations | Scheduling, Intake, Discharge |
| EN | Environment | Emergency Preparedness, Infection Control |
| IT | Information Technology | Data Security, EHR Use, System Access |
| RM | Risk Management | Liability, Incident Management, Insurance |

---

## Policy Identification System

Each policy has a unique `policy_id` using the format `{DOMAIN}-{ABBREV}-{SEQ}`:
- `GV-GB-001` — Governance, Governing Body, Policy #1
- `CL-AM-001` — Clinical, Assessment & Monitoring, Policy #1
- `QA-QI-001` — Quality Assurance, Quality Improvement, Policy #1

This ID is the primary reference used throughout the compliance system to trace evidence, events, and audit records back to the governing policy.
