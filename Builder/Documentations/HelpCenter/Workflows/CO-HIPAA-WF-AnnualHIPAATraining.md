# Workflow: Annual HIPAA Training (CO-HIPAA-WF)

**Workflow ID:** `CO-HIPAA-WF`  
**Policy ID:** `CO-HIPAA-001`  
**Domain:** Compliance (CO)  
**Trigger:** Annual (auto-generated each January)  
**Recurrence:** Annual  
**Event Type:** `annual_hipaa_training`

---

## Overview

The Annual HIPAA Training workflow ensures all agency staff complete required HIPAA Privacy and Security training every calendar year. This satisfies HIPAA § 164.530(b)(1) requirements for covered entity workforce training. The workflow uses the Journey/Onboarding module system for training delivery and eCIgn for acknowledgment signatures.

---

## Actors

| Role | Responsibility |
|---|---|
| `staff` | Completes the training and signs the acknowledgment |
| `coordinator` | Monitors staff completion status, follows up on non-completers |
| `admin` | Certifies the annual training record, confirms 100% completion |

---

## Trigger Conditions

- Auto-generated annually by the `autogenStore` annual event scheduler
- Event ID format: `annual_hipaa_training-{YYYY}0101-01`
- Typical deadline: December 31 of the current calendar year

---

## Workflow Steps

### Step 1: Training Content Activation

**Actor:** `admin`  
**Due:** By January 15 of the training year  

**Actions:**
1. Verify the HIPAA training module is active in the Journey system
2. Confirm training content is current (verify regulatory updates since last year)
3. If content updates are needed: contact the content administrator to revise
4. Click **Activate Training Year** to push the assignment to all active staff

---

### Step 2: Staff Assignment Notification

**Actor:** System (automated on Step 1 activation)  

**What Happens:**
- All active staff receive a notification: "Your annual HIPAA training is now due"
- A CEU assignment is created for each staff member (`POST /api/ceu/assignments`)
- The training appears in each user's Journey dashboard

---

### Step 3: Staff Completes HIPAA Training Module

**Actor:** `staff`  
**Due:** Per individual assignment deadline (December 31)  

**Training Module Contents:**
1. HIPAA Privacy Rule overview
2. HIPAA Security Rule overview
3. Patient rights and PHI access rules
4. How to handle PHI in home health settings
5. Breach reporting obligations
6. Agency-specific policies and sanctions

**Completion Requirements:**
- Watch all module videos to completion
- Pass the post-training quiz (minimum score: 80%)
- Complete the HIPAA Acknowledgment Form via eCIgn (signature required)

---

### Step 4: HIPAA Acknowledgment Signature

**Actor:** `staff`  
**Due:** Immediately after passing the quiz  
**Form:** HIPAA Acknowledgment Form (`CO-FM-001`)  

**Actions:**
1. Review the HIPAA Acknowledgment statement
2. Sign electronically via eCIgn
3. Confirmation email sent to staff member

**Evidence Created:**
- eCIgn instance with completed signature, document hash, timestamp

---

### Step 5: Completion Monitoring

**Actor:** `coordinator`  
**Due:** Ongoing through December 15  

**Actions:**
1. Navigate to the HIPAA training event workspace
2. Review the completion dashboard: completed vs. pending per staff member
3. Send reminder notifications to non-completers (30 days before deadline, 7 days before deadline)
4. Document follow-up actions taken

**Evidence Required:**
- Completion tracking report (uploaded at December 15)

---

### Step 6: Address Non-Completers

**Actor:** `coordinator`, `admin`  
**Due:** December 16 – December 31  

**Actions:**
- For each non-completer at December 15:
  1. Issue formal written notice requiring completion by December 31
  2. Document notice issued as evidence (kind: `compliance_notice`)
  3. If still not complete by December 31: escalate for disciplinary review

---

### Step 7: Final Completion Verification

**Actor:** `admin`  
**Due:** January 7 of following year (grace period)  

**Actions:**
1. Confirm all active staff have completed training
2. For staff who did not complete: document exception with reason (e.g., LOA, terminated)
3. Upload the final completion roster as evidence
4. Confirm 100% required completion (excluding documented exceptions)

**Evidence Required:**
- Final Completion Roster (document upload, kind: `completion_roster`)

---

### Step 8: Event Certification

**Actor:** `admin`  
**Due:** January 7 of following year  

**Actions:**
1. Verify all evidence accepted
2. Click **Certify** to lock the annual training record
3. Record enters `certified_locked` state
4. Audit entry: `ANNUAL_HIPAA_TRAINING_CERTIFIED` with admin identity, year, completion rate

---

## Evidence Summary

| Evidence Kind | Required | Step |
|---|---|---|
| HIPAA Acknowledgment Form (eCIgn, per staff) | Yes (all staff) | 4 |
| Completion Tracking Report | Yes | 5 |
| Compliance Notices | If applicable | 6 |
| Final Completion Roster | Yes | 7 |

---

## State Transitions

```
scheduled (auto-generated)
    → in_progress (training activated)
    → monitoring (ongoing completions)
    → final_verification
    → certified_locked
    → (if gaps) → sla_warning → sla_urgent → overdue → grace_period
```

---

## Completion Rate Standards

| Threshold | Status |
|---|---|
| 100% required staff | Compliant |
| 95-99% | Minor gap — document exceptions |
| < 95% | Non-compliant — escalate to compliance officer |

---

## Regulatory References

- HIPAA § 164.530(b)(1) — Training requirements for covered entities
- HIPAA § 164.308(a)(5) — Security awareness and training
- CMS CoP § 484.105(c) — Organizational structure — personnel qualification requirements
