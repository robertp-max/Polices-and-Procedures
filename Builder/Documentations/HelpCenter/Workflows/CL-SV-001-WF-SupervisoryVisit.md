# Workflow: Supervisory Visit (CL-SV-001-WF)

**Workflow ID:** `CL-SV-001-WF`  
**Policy ID:** `CL-SV-001`  
**Domain:** Clinical (CL)  
**Trigger:** Patient episode initiated for applicable discipline  
**Recurrence:** Per episode, per discipline (per CMS CoP requirements)  
**Event Type:** `supervisory_visit`

---

## Overview

The Supervisory Visit workflow ensures that a qualified supervising clinician makes a supervisory home visit to assess the quality of care being delivered by supervised personnel (e.g., a Registered Nurse supervising a Home Health Aide, or a PT supervising a PTA). This workflow satisfies federal requirements for in-home supervision of home health services.

---

## Actors

| Role | Responsibility |
|---|---|
| `staff` (Clinician / HHA) | Provides direct patient care |
| `coordinator` | Assigns and schedules supervisory visits, tracks completion |
| `manager` (Supervising Clinician) | Conducts the supervisory visit, completes documentation |
| `admin` | Reviews audit compliance, certifies the record |

---

## Trigger Conditions

- A new patient episode begins for a discipline requiring supervised staff (e.g., HHA)
- Or: A supervisory visit is scheduled per the established supervision schedule (CMS requires supervisory visits at least every 14 days for HHA services)

---

## Workflow Steps

### Step 1: Supervisory Visit Scheduling

**Actor:** `coordinator`  
**Due:** Within 5 days of episode start or prior supervisory visit  

**Actions:**
1. Create a supervisory visit event on the Master Calendar
2. Assign a supervising clinician (must be RN or appropriate discipline supervisor)
3. Set the scheduled date and patient ID
4. Confirm the assigned HHA/supervised staff member

---

### Step 2: Pre-Visit Preparation

**Actor:** `manager` (Supervising Clinician)  
**Due:** Before visit date  

**Actions:**
1. Review the patient's plan of care
2. Review the supervised staff member's recent visit notes
3. Note any patient complaints or care concerns

---

### Step 3: Conduct Supervisory Home Visit

**Actor:** `manager` (Supervising Clinician)  
**Due:** On scheduled visit date  

**Actions:**
1. Conduct the supervisory visit in the patient's home
2. Observe direct care delivery by supervised staff
3. Assess patient condition and patient/family satisfaction
4. Identify any deficits in care delivery

---

### Step 4: Supervisory Visit Documentation

**Actor:** `manager` (Supervising Clinician)  
**Due:** Within 24 hours of visit  
**Form:** Supervisory Visit Form (`CL-FM-001`)  

**Actions:**
1. Complete the Supervisory Visit Form including:
   - Patient name and ID
   - Visit date
   - Supervised staff member name and ID
   - Care delivery observations
   - Patient condition assessment
   - Patient/family input
   - Identified deficits (if any)
   - Corrective actions taken or recommended
2. Submit the form via eCIgn (electronic signature required)

**Evidence Required:**
- Completed Supervisory Visit Form (eCIgn signed)

---

### Step 5: Supervisory Finding Review

**Actor:** `coordinator`, `admin`  
**Due:** Within 48 hours of documentation submission  

**Actions:**
1. Review the supervisory visit findings
2. If no deficits: proceed to certification
3. If deficits identified:
   - Create a corrective action task for the supervised staff member
   - Schedule a follow-up supervisory visit within 14 days
   - Document corrective action plan

---

### Step 6: Event Certification

**Actor:** `admin`  
**Due:** After findings review is complete and no open corrective actions  

**Actions:**
1. Confirm all steps are complete
2. Confirm supervisory visit form is accepted
3. Click **Certify** to lock the supervisory visit record
4. Record enters `certified_locked` state

---

## Evidence Summary

| Evidence Kind | Required | Step |
|---|---|---|
| Supervisory Visit Form (eCIgn signed) | Yes | 4 |
| Corrective Action Plan | If deficits found | 5 |
| Follow-up Visit Documentation | If follow-up required | 5 |

---

## State Transitions

```
scheduled
    → in_progress (visit conducted)
    → documentation_submitted
    → findings_reviewed
    → certified_locked
    → (if deficits found) → corrective_action_required → certified_locked
```

---

## Compliance Timing Requirements

| Requirement | Frequency |
|---|---|
| HHA supervisory visit | At least every 14 days |
| Initial supervisory visit | Within 14 days of HHA start of care |
| Follow-up if deficit found | Within 14 days of finding |

---

## Regulatory References

- CMS CoP § 484.80(h) — Supervision of Home Health Aides
- 42 CFR § 484.80 — Home Health Aide Services
- State nursing practice acts (for RN supervision requirements)
