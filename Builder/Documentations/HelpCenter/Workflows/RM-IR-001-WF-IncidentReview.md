# Workflow: Incident Review (RM-IR-001-WF)

**Workflow ID:** `RM-IR-001-WF`  
**Policy ID:** `RM-IR-001`  
**Domain:** Risk Management (RM)  
**Trigger:** Incident Reported  
**Recurrence:** Ad hoc (on-demand)  
**Event Type:** `incident_review`

---

## Overview

The Incident Review workflow initiates when any staff member reports a clinical, safety, or operational incident. It governs the full incident response lifecycle: initial report, investigation, root cause analysis, corrective action planning, and verification of corrective actions.

---

## Actors

| Role | Responsibility |
|---|---|
| `staff` | Initial incident reporter |
| `coordinator` | Coordinates investigation and documentation |
| `manager` | Approves investigation findings and corrective action plan |
| `admin` | Reviews final disposition, escalates if needed |

---

## Trigger Conditions

- Any staff member submits an incident report
- Triggered events include: patient falls, medication errors, near-misses, safety violations, abuse/neglect reports, equipment failures

---

## Workflow Steps

### Step 1: Initial Incident Report Submission

**Actor:** `staff`, `coordinator`  
**Due:** Immediately upon incident occurrence (required within 24 hours)  
**Form:** Incident Report Form (`RM-FM-001`)  

**Actions:**
1. Complete the Incident Report Form with: date/time, patient/client involved, description of incident, witnesses, immediate actions taken
2. Submit the form via eCIgn (electronic signature required)
3. Form status changes to `pending_review`

**Audit Entry:** `INCIDENT_REPORT_SUBMITTED` with reporter identity, patient ID (PHI), and form instance ID.

---

### Step 2: Manager Acknowledgment

**Actor:** `manager`, `admin`  
**Due:** Within 24 hours of submission  

**Actions:**
1. Receive notification: "Incident report submitted — review required"
2. Open the incident in the Event Workspace
3. Review the initial report for completeness
4. Click **Acknowledge** (or **Return for Revision** if incomplete)

If returned for revision: coordinator notified, must resubmit within 4 hours.

---

### Step 3: Investigation and Root Cause Analysis

**Actor:** `coordinator`  
**Due:** Within 72 hours of incident  

**Actions:**
1. Conduct investigation: interview witnesses, review records
2. Complete the Root Cause Analysis worksheet
3. Document findings in the Investigation Notes evidence field
4. Identify contributing factors and root cause(s)
5. Upload supporting documentation as evidence

**Evidence Required:**
- Investigation Notes (document upload)
- Witness Statements (if applicable)

---

### Step 4: Corrective Action Plan

**Actor:** `coordinator`, `manager`  
**Due:** Within 5 business days of root cause analysis  

**Actions:**
1. Document specific corrective actions to prevent recurrence
2. Assign responsible parties and completion deadlines for each action
3. Manager reviews and approves the Corrective Action Plan
4. Upload the approved plan as evidence (kind: `corrective_action_plan`)

**Evidence Required:**
- Corrective Action Plan (accepted by manager)

---

### Step 5: Staff Education (if applicable)

**Actor:** `coordinator`  
**Due:** Per corrective action plan timeline  

**Actions:**
- If root cause involves staff knowledge/practice gap:
  1. Document in-service or re-training provided
  2. Collect attendance sheet or acknowledgment forms
  3. Upload as evidence (kind: `training_record`)

---

### Step 6: Corrective Action Verification

**Actor:** `manager`, `admin`  
**Due:** Per corrective action deadlines  

**Actions:**
1. Verify each corrective action has been completed
2. Mark each corrective action as **Verified** in the workspace
3. If an action is incomplete past its deadline: escalate

---

### Step 7: Final Disposition and Closure

**Actor:** `admin`  
**Due:** After all corrective actions verified  

**Actions:**
1. Review the complete incident record
2. Select final disposition: `Closed – No Further Action`, `Closed – Action Taken`, or `Escalated to QAPI Review`
3. Click **Certify** to lock the incident record
4. Incident enters `certified_locked` state

**Audit Entry:** `INCIDENT_CERTIFIED` with admin identity and final disposition.

---

## Evidence Summary

| Evidence Kind | Required | Step |
|---|---|---|
| Incident Report Form (eCIgn signed) | Yes | 1 |
| Investigation Notes | Yes | 3 |
| Witness Statements | If applicable | 3 |
| Corrective Action Plan | Yes | 4 |
| Training Records | If applicable | 5 |
| Corrective Action Verification | Yes | 6 |

---

## State Transitions

```
incident_reported
    → report_submitted
    → under_investigation
    → corrective_action_planning
    → corrective_action_implementation
    → verification_in_progress
    → certified_locked
```

---

## Regulatory References

- CMS CoP § 484.65 — Quality Assurance and Performance Improvement
- OSHA 29 CFR 1904 — Recordkeeping requirements
- State home health agency incident reporting regulations (varies by state)
