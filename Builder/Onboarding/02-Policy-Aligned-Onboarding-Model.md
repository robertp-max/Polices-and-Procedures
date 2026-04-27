# 02 — Policy-Aligned Onboarding Model

## Purpose

Define onboarding by **role × compliance obligation**. Every role's onboarding is the deterministic projection of the policies that govern that role onto workflows, forms, training, competency, signatures, evidence, and deadlines.

---

## 1. Modeling Rule

For every role:

```
Role
 ├── Governing Policies          (which policies bind this role)
 ├── Required Workflows          (which workflows the role must execute)
 ├── Required Forms              (forms produced or signed)
 ├── Required Training           (didactic + knowledge check)
 ├── Required Competencies       (observed/validated skills)
 ├── Required Signatures         (eCIgn, version-bound)
 ├── Evidence Generated          (artifacts persisted to dossier)
 └── Deadlines                   (initial + recurring + role-change)
```

Every cell must resolve to a concrete artifact ID (policy ID, workflow ID, form ID, competency ID).

---

## 2. Role Catalog

| Role | Domain | Governance Source |
|------|--------|-------------------|
| Administrator | EN — Enterprise Control | Governing Body Authority & Responsibilities; EN policy suite |
| Clinical Manager (DON / Director of Patient Care Services) | CL — Clinical Operations | CL domain; QA; CoP §484.105 |
| Registered Nurse (RN) | CL | CL domain; QA; HR; CL-OA-006 |
| LVN/LPN | CL | CL domain; supervision policies |
| Home Health Aide (HHA) | CL | CL domain; HHA competency CoP §484.80 |
| Therapist (PT/OT/SLP) | CL | CL domain; discipline-specific scope |
| QAPI Committee Participant | QA | QA policies; QAPI charter |
| Compliance Officer | CO | CO-CP-001 Corporate Compliance Program |
| Privacy/Security Officer | IT/CO | IT domain; HIPAA |
| Office / Admin Staff | OP | OP domain; HR |
| Intake / Scheduling | OP | OP domain; CL intake |
| Billing / Coding | FN | FN-BC-001 |
| Governing Body Member | EN | Governing Body policy |
| Medical Director / Advisory Physician | EN/CL | Governing Body; CL |
| Contractor / Vendor (BA) | CO/IT | BAA; OIG/SAM; Vendor Mgmt |
| Volunteer / Student | HR/CL | HR; supervision |

---

## 3. Role Requirement Matrices

> Each row below is the canonical **RoleRequirement bundle**. IDs in brackets refer to source artifacts; placeholders are noted where the artifact must be authored/linked during implementation.

### 3.1 Administrator

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | Governing Body Authority & Responsibilities; EN-CM-001; EN-LC-001; EN-TG-001; CO-CP-001; CO-RA-001 |
| Workflows | WF-ADMIN-APPOINTMENT; WF-DELEGATION-OF-AUTHORITY; WF-ANNUAL-EXEC-ATTESTATION |
| Forms | FRM-ADMIN-APPOINTMENT-LETTER; FRM-DELEGATION-MATRIX; FRM-CONFLICT-OF-INTEREST |
| Training | Governing Body orientation; CoP overview; Compliance Program training |
| Competency | Operational oversight attestation |
| Signatures | Acceptance of appointment (eCIgn); COI; Annual attestation |
| Evidence | Appointment letter; delegation matrix; COI form; training completion |
| Deadlines | T+0 acceptance; T+30 full orientation; annual COI + attestation |

### 3.2 Clinical Manager (DON)

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | CL domain (DOMAIN_CL); QA policies; CL-OA-006; CoP §484.105 |
| Workflows | WF-CLINICAL-LEADERSHIP-ACTIVATION; WF-SUPERVISORY-VISIT-OVERSIGHT; WF-QAPI-PARTICIPATION |
| Forms | FRM-CLINICAL-LEADER-APPOINTMENT; FRM-SUPERVISORY-VISIT-LOG; FRM-QAPI-MEMBER |
| Training | Clinical leadership orientation; QAPI; documentation hierarchy (CL-OA-006) |
| Competency | Chart review competency; supervisory visit competency |
| Signatures | Appointment acceptance; QAPI member signature; documentation policy ack |
| Evidence | License PSV; appointment letter; competency packet; QAPI roster entry |
| Deadlines | Pre-activation: license PSV; T+30: competency; annual: revalidation |

### 3.3 Registered Nurse (RN)

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | CL domain; HR; CL-OA-006; Infection Control; HIPAA; Med-Mgmt |
| Workflows | WF-RN-ACTIVATION; WF-CLINICAL-COMPETENCY-VALIDATION; WF-FIELD-CLEARANCE |
| Forms | FRM-RN-COMPETENCY-CHECKLIST; FRM-OASIS-COMPETENCY; FRM-MED-RECON-COMPETENCY; FRM-INFECTION-CONTROL-ATTESTATION |
| Training | Orientation; OASIS; documentation; HIPAA; bloodborne pathogens; emergency prep |
| Competency | Skills checklist; OASIS validation; medication reconciliation; wound care (if applicable) |
| Signatures | Per-policy acknowledgments (eCIgn, version-bound); competency observer signature |
| Evidence | Active license (PSV); BLS; TB; drug screen; OIG/SAM; competency artifacts |
| Deadlines | Pre-field: license PSV, TB, BLS, competency; annual: in-service hrs, TB, competency revalidation |

### 3.4 LVN / LPN

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | CL domain (LVN scope); supervision policy; CL-OA-006 |
| Workflows | WF-LVN-ACTIVATION; WF-LVN-SUPERVISION-PLAN; WF-FIELD-CLEARANCE |
| Forms | FRM-LVN-COMPETENCY-CHECKLIST; FRM-SUPERVISION-AGREEMENT |
| Training | Orientation; scope of practice; documentation; HIPAA; bloodborne pathogens |
| Competency | Skills checklist within LVN scope; supervised visit pass |
| Signatures | Scope-of-practice ack; supervision agreement; per-policy ack |
| Evidence | License PSV; BLS; TB; drug screen; competency; supervision plan |
| Deadlines | Pre-field gate; annual revalidation |

### 3.5 Home Health Aide (HHA)

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | CL §484.80 (HHA training, competency, in-service); HR; Infection Control |
| Workflows | WF-HHA-ACTIVATION; WF-HHA-COMPETENCY-12-SUBJECTS; WF-HHA-INSERVICE-12HR |
| Forms | FRM-HHA-COMPETENCY-12; FRM-HHA-INSERVICE-LOG; FRM-HHA-SUPERVISION-VISIT |
| Training | HHA training program completion or competency exam; orientation; HIPAA |
| Competency | All 12 CoP subject areas; observed in patient/simulated setting |
| Signatures | Competency observer (RN); HHA acknowledgment; per-policy ack |
| Evidence | Training certificate or registry verification; competency packet (12 subjects); TB; criminal background |
| Deadlines | Pre-field gate; 12 in-service hours per 12-month period; supervisory visit cadence |

### 3.6 Therapist (PT/OT/SLP)

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | CL domain (discipline scope); supervision of PTA/COTA; documentation |
| Workflows | WF-THERAPIST-ACTIVATION; WF-DISCIPLINE-COMPETENCY |
| Forms | FRM-THERAPIST-COMPETENCY; FRM-PTA-COTA-SUPERVISION |
| Training | Orientation; documentation; HIPAA; emergency prep |
| Competency | Discipline-specific skills; documentation competency |
| Signatures | Scope ack; supervision plan (if PTA/COTA); per-policy ack |
| Evidence | License PSV; CPR; competency; supervision plan |
| Deadlines | Pre-field; annual revalidation |

### 3.7 QAPI Participant

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | QA policies; QAPI charter; CO-CP-001 |
| Workflows | WF-QAPI-MEMBER-ONBOARDING |
| Forms | FRM-QAPI-MEMBER; FRM-QAPI-CONFIDENTIALITY |
| Training | QAPI methodology; PI cycle; data privacy |
| Competency | PI tool literacy attestation |
| Signatures | QAPI confidentiality; charter ack |
| Evidence | Roster entry; training; signed confidentiality |
| Deadlines | Pre-meeting; annual reaffirmation |

### 3.8 Compliance Officer

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | CO-CP-001; CO-RA-001; HIPAA; OIG guidance |
| Workflows | WF-COMPLIANCE-OFFICER-APPOINTMENT; WF-COMPLIANCE-WORKPLAN |
| Forms | FRM-CO-APPOINTMENT; FRM-CO-CHARTER |
| Training | Compliance program; OIG seven elements; HIPAA |
| Competency | Risk assessment; investigation method |
| Signatures | Appointment; charter; COI |
| Evidence | Appointment letter; training; charter |
| Deadlines | T+0 appointment; annual workplan |

### 3.9 Privacy / Security Officer

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | IT domain; HIPAA Privacy/Security |
| Workflows | WF-PRIVACY-OFFICER-APPOINTMENT; WF-SECURITY-OFFICER-APPOINTMENT |
| Forms | FRM-PRIVACY-APPOINTMENT; FRM-SECURITY-APPOINTMENT |
| Training | HIPAA Privacy + Security; breach response |
| Competency | Risk analysis methodology |
| Signatures | Appointment; charter |
| Evidence | Appointment; training; risk analysis sign-off |
| Deadlines | T+0; annual risk analysis |

### 3.10 Office / Admin Staff

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | OP domain; HR; HIPAA (workforce member) |
| Workflows | WF-WORKFORCE-ACTIVATION |
| Forms | FRM-CONFIDENTIALITY; FRM-ACCEPTABLE-USE |
| Training | Orientation; HIPAA workforce; cybersecurity awareness |
| Competency | Role-specific SOP attestation |
| Signatures | Confidentiality; AUP; per-policy ack |
| Evidence | Background; training; signatures |
| Deadlines | Pre-system-access; annual refresh |

### 3.11 Intake / Scheduling

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | OP intake; CL intake; HIPAA; eligibility |
| Workflows | WF-INTAKE-ACTIVATION |
| Forms | FRM-INTAKE-SOP-ACK |
| Training | Intake SOP; eligibility/coverage; HIPAA |
| Competency | Intake-form competency |
| Signatures | SOP ack; HIPAA ack |
| Evidence | Training; SOP ack |
| Deadlines | Pre-system-access |

### 3.12 Billing / Coding

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | FN-BC-001; CO-CP-001; HIPAA |
| Workflows | WF-BILLING-ACTIVATION |
| Forms | FRM-BILLING-SOP-ACK; FRM-CODER-CREDENTIAL |
| Training | FN-BC-001; coding updates; fraud/waste/abuse |
| Competency | Coding accuracy sample |
| Signatures | SOP ack; FWA ack |
| Evidence | Credential; training; competency sample |
| Deadlines | Pre-billing-access; annual FWA + coding update |

### 3.13 Governing Body Member

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | Governing Body Authority & Responsibilities; CO-CP-001 |
| Workflows | WF-GOVERNING-BODY-APPOINTMENT |
| Forms | FRM-GB-APPOINTMENT; FRM-GB-COI |
| Training | Governing body orientation; compliance program overview |
| Competency | Attestation of fiduciary responsibilities |
| Signatures | Appointment; COI |
| Evidence | Appointment letter; COI; training |
| Deadlines | T+0 appointment; annual COI |

### 3.14 Medical Director / Advisory Physician

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | Governing Body; CL clinical oversight |
| Workflows | WF-MEDICAL-DIRECTOR-APPOINTMENT |
| Forms | FRM-MD-APPOINTMENT; FRM-MD-AGREEMENT |
| Training | Agency CoP overview; QAPI |
| Competency | Clinical oversight attestation |
| Signatures | Appointment; agreement; COI |
| Evidence | License PSV; DEA (if applicable); appointment; agreement |
| Deadlines | T+0; annual revalidation |

### 3.15 Contractor / Vendor (BA)

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | CO-CP-001; HIPAA; Vendor Mgmt |
| Workflows | WF-VENDOR-ONBOARDING; WF-VENDOR-MONTHLY-EXCLUSION |
| Forms | FRM-BAA; FRM-VENDOR-COI; FRM-INSURANCE-COI |
| Training | (If accessing PHI) HIPAA module |
| Competency | N/A (entity attestation) |
| Signatures | BAA; vendor agreement; per-policy ack (if applicable) |
| Evidence | BAA; W-9; insurance COI; OIG/SAM/state exclusion checks |
| Deadlines | Pre-engagement; monthly exclusion; annual insurance/BAA review |

### 3.16 Volunteer / Student

| Dimension | Requirement |
|-----------|-------------|
| Governing Policies | HR; CL supervision; HIPAA |
| Workflows | WF-VOLUNTEER-ONBOARDING |
| Forms | FRM-VOLUNTEER-AGREEMENT; FRM-CONFIDENTIALITY |
| Training | Orientation; HIPAA workforce |
| Competency | N/A or scope-limited |
| Signatures | Agreement; HIPAA |
| Evidence | Background (if required); signatures; training |
| Deadlines | Pre-shadow; term-limited |

---

## 4. Cross-Role Universal Requirements

Applied to **every workforce member**:

- HIPAA workforce training + acknowledgment
- Code of Conduct acknowledgment (CO-CP-001)
- Acceptable Use Policy acknowledgment
- OIG/SAM/state Medicaid exclusion screening (initial + monthly)
- Background check (per HR policy and state)
- Emergency Preparedness orientation
- Reporting obligations acknowledgment (compliance, abuse, incident)

---

## 5. Output of This Model

This matrix is the **input to the Execution Engine** (doc 03). Each cell becomes:

- a `RoleRequirement` row (doc 08)
- a generated `OnboardingExecutionUnit` (doc 03)
- a workflow invocation (doc 11)
- one or more evidence objects + signatures (doc 05)
