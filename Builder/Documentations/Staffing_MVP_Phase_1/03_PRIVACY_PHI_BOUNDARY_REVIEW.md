# 03 — Privacy & PHI Boundary Review: Staffing MVP Phase 1

**Reviewer Role:** Privacy / No-PHI Reviewer
**Review Date:** 2026-05-13
**Documents Reviewed:**
- `Builder/UserProfiles/Architecture.md` (1,430 lines — full data model)
- `Builder/UserProfiles/Planning_Implementation.md` (223 lines — gap analysis and implementation prompt)
- `Builder/Documentations/System_Documentation/10_SECURITY_PRIVACY_AND_PHI_BOUNDARY.md` (existing PHI posture)
- `Builder/Documentations/System_Documentation/13_IMPLEMENTATION_READINESS_FOR_CLINICIAN_CLIENT_PROFILE.md` (implementation risks)

**Scope:** Phase 1 Staffing MVP — data model fields, mock data, display layer, and Brad/AI access boundary.

**Disclaimer:** This review identifies PHI/PII risks and recommends corrections for planning documents only. It does not constitute a HIPAA compliance certification or legal opinion.

---

## Executive Summary

The Phase 1 Staffing MVP planning documents contain **19 PHI fields**, **14 PII fields**, and **12 free-text fields with PHI/PII leakage risk** across the data model. Three PHI fields (dateOfBirth, primaryDiagnosis, address) are explicitly deferred in `Planning_Implementation.md`, which is correct. However, **16 additional PHI fields remain in the Architecture.md data model without deferral or mitigation**, including patient names, geographic coordinates, diagnosis categories, risk factors, care notes, payer information, and episode data.

Critical findings:

1. **Patient `displayName` is PHI** — present in the Client entity as a required field, included in the implementation prompt, and displayed on the Client detail page. This is the most direct PHI exposure in Phase 1.
2. **`primaryDiagnosisCategory` is PHI** — listed as "NOT the actual diagnosis" in the implementation prompt, but a diagnosis category combined with any identifier constitutes PHI under HIPAA's definition (45 CFR §160.103).
3. **Client geographic fields (`city`, `coordinates`, `serviceZip`, `serviceCity`) are PHI** — patient home address and precise GPS coordinates are explicitly listed as PHI identifiers under HIPAA Safe Harbor.
4. **Demographic fields for bias audit** (`demographicRace`, `demographicSex`, `demographicAge`) lack architectural enforcement of their "bias audit only" restriction. No access control, separate storage, or query-path isolation is defined.
5. **Brad/AI corpus exclusion** is stated as a requirement but has no enforcement mechanism in the architecture. The existing IA index (`.cache/ia-index/`) could index staffing data without guardrails.
6. **Mock data using "realistic Bay Area names"** creates identification risk if names coincidentally match real Care Indeed employees or clients.
7. **Free-text fields** (`profileNotes`, `careNotes`, `accessNotes`, `approvalRationale`, `restrictionReason`, `notes`) are uncontrolled PHI vectors — users can enter any content including diagnoses, addresses, and patient details.

**Verdict:** The implementation prompt requires corrections before it is safe to execute. Seven specific corrections are documented in Section 8 below.

---

## 1. Field-by-Field PHI/PII/Safe Classification

### 1.1 CLINICIAN Entity (Architecture.md §2.1)

#### Required Fields

| Field | Type | Classification | Rationale |
|---|---|---|---|
| `id` | UUID | **Safe** | System-generated synthetic identifier |
| `firstName` | string | **PII** | Legal name — employee PII under CCPA, not PHI |
| `lastName` | string | **PII** | Legal name — employee PII under CCPA |
| `primaryDiscipline` | enum | **Safe** | Professional category, not individually identifying |
| `employmentType` | enum | **Safe** | Operational classification |
| `status` | enum | **Safe** | Operational lifecycle state |
| `homeBaseCity` | string | **PII** | Employee residential city — PII, not PHI |
| `homeCoordinates` | {lat, lng} | **PII** | Precise employee home location — elevated PII risk |
| `preferredRadius` | number | **Safe** | Operational preference |
| `maxRadius` | number | **Safe** | Operational constraint |
| `maxVisitsPerDay` | number | **Safe** | Capacity parameter |
| `maxVisitsPerWeek` | number | **Safe** | Capacity parameter |
| `createdAt` | timestamp | **Safe** | Audit metadata |
| `updatedAt` | timestamp | **Safe** | Audit metadata |
| `createdBy` | UUID | **Safe** | Audit metadata |

#### Optional Fields

| Field | Type | Classification | Rationale |
|---|---|---|---|
| `additionalDisciplines[]` | enum[] | **Safe** | Professional category |
| `serviceZones[]` | string[] | **Safe** | Named coverage zones, not addresses |
| `travelTolerance` | enum | **Safe** | Operational preference |
| `languages[]` | string[] | **PII (Bias-Sensitive)** | Cultural/ethnic indicator; FEHA-regulated when used in matching |
| `experienceYears` | number | **Safe** | Professional metric |
| `weekendAvailability` | boolean | **Safe** | Scheduling preference |
| `patientFeedbackAvg` | number | **Safe (Bias-Sensitive)** | Must be bias-audited per Architecture.md note |
| `documentationTimeliness` | number | **Safe** | Performance metric |
| `missedVisitRate` | number | **Safe** | Performance metric |
| `continuityScore` | number | **Safe** | Performance metric |
| `profileNotes` | text | **PII Leakage Risk** | Free-text — could contain any PII/PHI entered by admin |
| `profilePhotoUrl` | string | **PII** | Biometric-adjacent — photo is PII under CCPA/BIPA |

#### Accommodation Fields (FEHA Layer 1)

| Field | Type | Classification | Rationale |
|---|---|---|---|
| `religiousRestrictions[]` | JSON | **PII (Protected Characteristic)** | Religious belief is a protected category under FEHA/Title VII; must be access-controlled |
| `adaAccommodations[]` | JSON | **PII (Protected Characteristic)** | Disability information is protected under ADA and FEHA; elevated sensitivity |
| `pregnancyAccommodation` | JSON | **PII (Protected Characteristic)** | Protected under CFRA/FMLA/FEHA |
| `fmlaLeave` | JSON | **PII (Medical-Adjacent)** | FMLA leave implies medical condition; access-restricted |
| `schedulingLimitations[]` | JSON | **PII (Potential)** | Description field could expose protected characteristics |

#### Demographic Fields (Bias Audit Only)

| Field | Type | Classification | Rationale |
|---|---|---|---|
| `demographicRace` | string | **PII (Protected Characteristic)** | EEOC/FEHA protected; self-reported; never in matching |
| `demographicSex` | string | **PII (Protected Characteristic)** | EEOC/FEHA protected; self-reported; never in matching |
| `demographicAge` | number | **PII (Protected Characteristic)** | ADEA/FEHA protected; self-reported; never in matching |

---

### 1.2 CLIENT Entity (Architecture.md §2.2)

#### Required Fields

| Field | Type | Classification | Rationale |
|---|---|---|---|
| `id` | UUID | **Safe** | System-generated synthetic identifier |
| `clientType` | enum | **Safe** | Operational classification |
| `displayName` | string | **PHI** | Patient name is one of the 18 HIPAA identifiers (45 CFR §164.514(b)(2)) |
| `status` | enum | **Safe** | Operational lifecycle state |
| `acuityLevel` | enum | **PHI (Indirect)** | Indicates medical complexity of patient's condition; combined with name = PHI |
| `city` | string | **PHI** | Geographic subdivision smaller than state is a HIPAA identifier |
| `zone` | string | **Safe** | Abstracted service zone — not individually identifying |
| `coordinates` | {lat, lng} | **PHI** | Precise patient location — equivalent to full address; HIPAA identifier |
| `primaryDisciplineNeeded` | enum | **Safe** | Service category, not clinical detail |
| `createdAt` | timestamp | **Safe** | Audit metadata |
| `updatedAt` | timestamp | **Safe** | Audit metadata |
| `createdBy` | UUID | **Safe** | Audit metadata |

#### Optional Fields

| Field | Type | Classification | Rationale |
|---|---|---|---|
| `additionalDisciplinesNeeded[]` | enum[] | **Safe** | Service category |
| `visitFrequencyString` | string | **PHI** | Derived from physician order (§484.60); constitutes treatment information |
| `requiredSkills[]` | string[] | **Safe** | Operational staffing requirement |
| `requiredCredentials[]` | string[] | **Safe** | Operational staffing requirement |
| `riskFactors[]` | string[] | **PHI** | Clinical risk factors directly relate to health condition |
| `diagnosisCategory` | string | **PHI** | Even a category (e.g., "cardiac", "neurological") relates to health condition; combined with identifier = PHI |
| `preferredLanguage` | string | **PII** | Cultural/ethnic indicator; not PHI alone |
| `continuityPriority` | enum | **Safe** | Operational preference |
| `parkingDifficulty` | number | **Safe** | Logistical data |
| `accessNotes` | text | **PHI Leakage Risk** | Free-text about patient's home (gate codes, wheelchair access) — could describe health-related features |
| `careNotes` | text | **PHI** | "Clinical/care notes visible to schedulers" per Architecture.md — directly clinical |
| `payerType` | string | **PHI** | Insurance/payer information is PHI under HIPAA when linked to patient |
| `certPeriodStart` | date | **PHI** | Medicare certification period — constitutes treatment/coverage information |
| `certPeriodEnd` | date | **PHI** | Medicare certification period |
| `currentWeek` | number | **PHI** | Episode timing reveals treatment progression |
| `authorizationLimit` | number | **PHI** | Insurance authorization constitutes coverage information |
| `weightedCaseloadPoints` | number | **Safe** | Computed operational metric |

#### Episode Classification Fields

| Field | Type | Classification | Rationale |
|---|---|---|---|
| `episodePattern` | string | **PHI** | Treatment classification pattern |
| `visitIntensity` | string | **PHI** | Care intensity directly relates to medical condition |
| `taperType` | string | **PHI** | Treatment progression plan |
| `frontloadIndex` | number | **PHI** | Treatment front-loading relates to clinical need |
| `interdisciplinaryComplexity` | number | **PHI** | Medical complexity indicator |
| `missedVisitSensitivity` | enum | **Safe** | Operational priority flag; abstracted from clinical detail |

---

### 1.3 CLINICIAN-CLIENT CONNECTION (Architecture.md §2.3)

| Field | Type | Classification | Rationale |
|---|---|---|---|
| `id` | UUID | **Safe** | System-generated |
| `clinicianId` | UUID (FK) | **Safe** | Reference key |
| `clientId` | UUID (FK) | **Safe** | Reference key |
| `connectionStatus` | enum | **Safe** | Operational state |
| `source` | enum | **Safe** | Operational metadata |
| `matchScore` | number | **Safe** | Computed metric |
| `matchFactors` | JSON | **PHI Leakage Risk** | Factor breakdown could include clinical details (e.g., "wound care match") |
| `distanceMiles` | number | **Safe** | Computed distance |
| `estimatedDriveMinutes` | number | **Safe** | Computed travel time |
| `approvalStatus` | enum | **Safe** | Workflow state |
| `approvedBy` | UUID | **Safe** | Audit reference |
| `approvedAt` | timestamp | **Safe** | Audit metadata |
| `approvalRationale` | text | **PHI Leakage Risk** | Free-text — approver could reference diagnosis, condition, or clinical factors |
| `effectiveDate` | date | **Safe** | Operational date |
| `expirationDate` | date | **Safe** | Operational date |
| `restrictionReason` | text | **PHI Leakage Risk** | Free-text — could reference clinical incidents, patient complaints with health details |
| `preferenceReason` | text | **PHI Leakage Risk** | Free-text — could reference clinical preferences |
| `priorAssignmentCount` | number | **Safe** | Operational metric |
| `lastWorkedDate` | date | **Safe** | Operational date |
| `continuityFlag` | boolean | **Safe** | Operational flag |
| `notes` | text | **PHI Leakage Risk** | Free-text — no content control |
| `createdAt` | timestamp | **Safe** | Audit metadata |
| `updatedAt` | timestamp | **Safe** | Audit metadata |
| `createdBy` | UUID | **Safe** | Audit metadata |

---

### 1.4 AVAILABILITY Entity (Architecture.md §2.4)

| Field | Type | Classification | Rationale |
|---|---|---|---|
| `id` | UUID | **Safe** | System-generated |
| `clinicianId` | UUID (FK) | **Safe** | Reference key |
| `availabilityType` | enum | **Safe** | Pattern type |
| `dayOfWeek` | enum | **Safe** | Schedule data |
| `specificDate` | date | **Safe** | Schedule data |
| `startTime` | time | **Safe** | Schedule data |
| `endTime` | time | **Safe** | Schedule data |
| `status` | enum | **Safe** | Availability state |
| `reason` | text | **PII Leakage Risk** | Could expose religious observance or medical reason |
| `isAccommodation` | boolean | **PII (Indirect)** | When true, implies protected characteristic |
| `createdAt` | timestamp | **Safe** | Audit metadata |
| `updatedAt` | timestamp | **Safe** | Audit metadata |
| `createdBy` | UUID | **Safe** | Audit metadata |

---

### 1.5 SKILL Entity (Architecture.md §2.5)

All fields **Safe** — skill names, categories, proficiency levels, and verification metadata do not contain PHI or PII.

---

### 1.6 CREDENTIAL Entity (Architecture.md §2.6)

| Field | Type | Classification | Rationale |
|---|---|---|---|
| `id` | UUID | **Safe** | System-generated |
| `clinicianId` | UUID (FK) | **Safe** | Reference key |
| `credentialType` | enum | **Safe** | Credential category |
| `credentialName` | string | **Safe** | Credential description |
| `issuingAuthority` | string | **Safe** | Institutional name |
| `licenseNumber` | string | **PII** | License number is a unique identifier — regulated under state licensing boards |
| `issueDate` | date | **Safe** | Credential metadata |
| `expirationDate` | date | **Safe** | Credential metadata |
| `status` | enum | **Safe** | Lifecycle state |
| `daysUntilExpiry` | number | **Safe** | Computed metric |
| `documentUrl` | string | **PII (Indirect)** | Links to credential document that may contain PII (name, license number, photo) |
| `verifiedBy` | UUID | **Safe** | Audit reference |
| `verifiedDate` | date | **Safe** | Audit metadata |
| `createdAt` | timestamp | **Safe** | Audit metadata |
| `updatedAt` | timestamp | **Safe** | Audit metadata |

---

### 1.7 RESTRICTION Entity (Architecture.md §2.7)

| Field | Type | Classification | Rationale |
|---|---|---|---|
| `reason` | text | **PHI Leakage Risk** | Free-text — could reference clinical incidents, safety concerns with health details |
| `removalReason` | text | **PHI Leakage Risk** | Free-text — same risk |
| All other fields | various | **Safe** | Operational metadata, enums, UUIDs, timestamps |

---

### 1.8 PREFERENCE Entity (Architecture.md §2.8)

| Field | Type | Classification | Rationale |
|---|---|---|---|
| `description` | text | **PHI Leakage Risk** | Free-text — could reference clinical needs or patient health details |
| All other fields | various | **Safe** | Operational metadata, enums, UUIDs, timestamps |

---

### 1.9 SHIFT NEED Entity (Architecture.md §2.9)

| Field | Type | Classification | Rationale |
|---|---|---|---|
| `clientId` | UUID (FK) | **Safe** | Reference key (PHI linkage is through client record) |
| `requiredDiscipline` | enum | **Safe** | Service category |
| `requiredSkills[]` | string[] | **Safe** | Operational requirement |
| `requiredCredentials[]` | string[] | **Safe** | Operational requirement |
| `visitDate` | date | **Safe** | Schedule data |
| `visitWindow` | JSON | **Safe** | Schedule data |
| `shiftType` | enum | **Safe** | Operational classification |
| `priority` | enum | **Safe** | Operational priority |
| `status` | enum | **Safe** | Lifecycle state |
| `cancellationSource` | enum | **Safe** | Operational classification |
| `cancellationReason` | text | **PHI Leakage Risk** | Free-text — could reference clinical or personal reasons |
| `acuityLevel` | enum | **PHI (Indirect)** | Inherited from client — indicates medical complexity |
| `missedVisitSensitivity` | enum | **Safe** | Operational priority |
| `estimatedDuration` | number | **Safe** | Scheduling parameter |
| `notes` | text | **PHI Leakage Risk** | Free-text — could contain clinical instructions |
| All other fields | various | **Safe** | Timestamps, UUIDs |

---

### 1.10 SHIFT ASSIGNMENT Entity (Architecture.md §2.10)

| Field | Type | Classification | Rationale |
|---|---|---|---|
| `matchFactors` | JSON | **PHI Leakage Risk** | Scoring breakdown could include clinical detail |
| `approvalRationale` | text | **PHI Leakage Risk** | Free-text — could reference clinical judgment |
| `clinicianDeclineReason` | text | **PII/PHI Leakage Risk** | Could reference patient condition or personal reasons |
| `completionNotes` | text | **PHI Leakage Risk** | Visit notes likely contain clinical information |
| `overrideReason` | text | **PHI Leakage Risk** | Could reference clinical justification |
| `biasFlags[]` | JSON | **PII (Indirect)** | References demographic groups |
| `accommodationCheck` | JSON | **PII** | References protected characteristics (religious, ADA, pregnancy) |
| `risks[]` | JSON | **PHI Leakage Risk** | Risk assessment could include clinical details |
| `consequences[]` | JSON | **PHI Leakage Risk** | Could include clinical consequences |
| `citationCard` | JSON | **PHI Leakage Risk** | The example in Architecture.md §10 includes patient ID "HH-023" and clinician name "LVN Rosa Martinez" — directly identifying |
| All other fields | various | **Safe** | UUIDs, enums, timestamps, computed numbers |

---

### 1.11 AUDIT LOG Entity (Architecture.md §2.11)

| Field | Type | Classification | Rationale |
|---|---|---|---|
| `previousValue` | JSON | **PHI/PII Risk** | Contains old field value — if the field is PHI/PII, the audit log inherits that classification |
| `newValue` | JSON | **PHI/PII Risk** | Contains new field value — same inheritance |
| `rationale` | text | **PHI Leakage Risk** | Free-text — could contain clinical justification |
| `ipAddress` | string | **PII** | IP address is PII under GDPR/CCPA |
| All other fields | various | **Safe** | Operational metadata |

---

### Classification Summary

| Category | Count | Fields |
|---|---|---|
| **PHI (Direct)** | 19 | Client: displayName, city, coordinates, visitFrequencyString, riskFactors[], diagnosisCategory, careNotes, payerType, certPeriodStart, certPeriodEnd, currentWeek, authorizationLimit, episodePattern, visitIntensity, taperType, frontloadIndex, interdisciplinaryComplexity; Client (deferred): dateOfBirth, primaryDiagnosis, address |
| **PII (Direct)** | 14 | Clinician: firstName, lastName, homeBaseCity, homeCoordinates, profilePhotoUrl, languages[], religiousRestrictions[], adaAccommodations[], pregnancyAccommodation, fmlaLeave, demographicRace, demographicSex, demographicAge; Credential: licenseNumber |
| **PHI/PII Leakage Risk (Free Text)** | 12 | profileNotes, accessNotes, approvalRationale, restrictionReason, preferenceReason, notes (connection), reason (availability), cancellationReason, completionNotes, overrideReason, rationale (audit), description (preference) |
| **PHI (Indirect via computed/inherited)** | 3 | Client: acuityLevel; ShiftNeed: acuityLevel; matchFactors JSON |
| **Safe** | ~80+ | All UUIDs, enums, timestamps, computed numbers, operational flags |

---

## 2. Deferred PHI Fields — Confirmation Checklist

`Planning_Implementation.md` explicitly defers three PHI fields from Phase 1. Verification against the implementation prompt in Architecture.md (lines 1228–1267):

| Field | Deferred in Planning_Implementation.md? | Deferred in Architecture.md Implementation Prompt? | Status |
|---|---|---|---|
| `Client.dateOfBirth` | Yes — commented out with `// DEFER` | Yes — commented out at line 1261 | **CONFIRMED DEFERRED** |
| `Client.primaryDiagnosis` | Yes — commented out with `// DEFER` | Yes — commented out at line 1262 | **CONFIRMED DEFERRED** |
| `Client.address` | Yes — commented out with `// DEFER` | Yes — commented out at line 1263 | **CONFIRMED DEFERRED** |

### PHI Fields NOT Deferred That Should Be

The following PHI fields remain in the Architecture.md data model and/or the implementation prompt WITHOUT deferral:

| Field | Entity | Present in Implementation Prompt? | Risk | Recommendation |
|---|---|---|---|---|
| `displayName` | Client | Yes (`firstName`, `lastName` in prompt) | **CRITICAL** — patient name is HIPAA identifier #1 | Replace with synthetic display ID (e.g., "Client-A7B2") for Phase 1. Defer real names. |
| `primaryDiagnosisCategory` | Client | Yes (line 1259, 1391) | **HIGH** — diagnosis category + identifier = PHI | Defer to Phase 2. Use acuity tier only for Phase 1 matching. |
| `city` / `serviceCity` | Client | Yes (`serviceCity` in prompt) | **HIGH** — geographic subdivision < state is HIPAA identifier | Replace with `zone` only. Defer city-level data. |
| `coordinates` / `serviceZip` | Client | `serviceZip` in prompt | **HIGH** — zip code is a HIPAA identifier (especially 3-digit prefix restrictions) | Defer. Use zone-based abstraction only. |
| `visitFrequencyString` | Client (full model) | Not in Phase 1 prompt | Low (not in Phase 1 scope) | Confirm excluded from mock data |
| `riskFactors[]` | Client (full model) | Not in Phase 1 prompt | Low (not in Phase 1 scope) | Confirm excluded from mock data |
| `careNotes` | Client (full model) | Not in Phase 1 prompt | Low (not in Phase 1 scope) | Confirm excluded from mock data |
| `payerType` | Client (full model) | Not in Phase 1 prompt | Low (not in Phase 1 scope) | Confirm excluded from mock data |
| `certPeriodStart/End` | Client (full model) | Not in Phase 1 prompt | Low (not in Phase 1 scope) | Confirm excluded from mock data |
| Episode fields (6 fields) | Client (full model) | Not in Phase 1 prompt | Low (not in Phase 1 scope) | Confirm excluded from mock data |

**Verdict:** Three of three explicitly deferred fields are confirmed deferred. However, **four additional PHI fields are present in the Phase 1 implementation prompt and should also be deferred or mitigated**: `displayName`/`firstName`/`lastName` on Client, `primaryDiagnosisCategory`, `serviceCity`, and `serviceZip`.

---

## 3. Mock Data Safety Assessment

### 3.1 "Realistic Bay Area Names" Risk

The implementation prompt (Architecture.md line 1394) specifies:

> "10 clinicians: ... Realistic Bay Area names."
> "6 clients: ..."

**Risk Assessment:**

| Risk | Severity | Analysis |
|---|---|---|
| **Coincidental identity match** | Medium | The San Francisco Bay Area has ~8 million residents. "Realistic" names combined with discipline (RN, LVN), city, and employer context could accidentally match a real Care Indeed employee. |
| **Client name as PHI** | High | If mock clients have "realistic" names, these mock records establish a UI pattern where patient names are displayed. When transitioning to production, this creates expectation and habit of displaying PHI. |
| **Demographic inference from names** | Medium | Realistic names carry implicit racial/ethnic signals. If mock data uses names commonly associated with specific demographics alongside discipline data, it could create appearance of stereotyping. |

**Recommendations:**

1. **Clinician mock names:** Use clearly fictional but culturally diverse names. Add a code comment in the mock data file: `// ALL NAMES ARE FICTIONAL. Any resemblance to real persons is coincidental.`
2. **Client mock names:** Do NOT use realistic client names. Use synthetic identifiers: "Client-A1", "Client-B2", or codenames ("Maple House", "Cedar Home"). This enforces the no-PHI habit from day one.
3. **Add a `MOCK_DATA_DISCLAIMER` constant** to the mock data files that displays on any page using mock data.

### 3.2 Mock Data Field Inclusion

The implementation prompt specifies mock data should include:

| Mock Data Element | PHI/PII Status | Safe for Mock? |
|---|---|---|
| Clinician names | PII | **Yes** — employee PII in demo is acceptable if clearly fictional |
| Clinician disciplines | Safe | Yes |
| Clinician status values | Safe | Yes |
| Clinician competencies | Safe | Yes |
| Client names (firstName/lastName) | **PHI** | **NO** — establishes PHI display pattern; use synthetic IDs |
| Client `careTier` (L1-L4) | PHI (Indirect) | **Acceptable** — operational tier, no clinical detail |
| Client `serviceSetting` | Safe | Yes |
| Client `accmOwnerId` | Safe | Yes |
| Client `primaryDiagnosisCategory` | **PHI** | **NO** — even mock categories establish PHI display pattern |
| Client `requiredDisciplines` | Safe | Yes |
| CareAssignment linking data | Safe | Yes |
| ShiftNeed operational data | Safe | Yes |

---

## 4. Demographic Data Handling Recommendation

Architecture.md §2.1 includes three demographic fields on Clinician:

```
demographicRace    — string (optional, self-reported)
demographicSex     — string (optional)
demographicAge     — number (optional)
```

The Architecture.md correctly labels these "FOR BIAS AUDIT ONLY — Never Used in Matching." However, this is a comment, not an architectural enforcement. The implementation prompt (lines 1362–1430) does **not** include these fields in the Phase 1 Clinician type, which is correct.

### Required Architectural Enforcement (for Phase 2+)

When these fields are implemented, the following architectural controls are mandatory:

| Control | Description | Enforcement Mechanism |
|---|---|---|
| **Separate storage** | Demographic data stored in a separate DynamoDB table or item collection, not in the main Clinician record | Table design: `clinician_demographics` with clinicianId FK |
| **Access control** | Only users with `bias_auditor` or `compliance_director` role can read demographic data | Server-side role check on `/api/clinicians/:id/demographics` |
| **Query isolation** | Demographic fields NEVER included in matching queries, clinician directory queries, or any operational API response | Separate API endpoint; demographic data never joined into matching or list responses |
| **No display in operational UI** | Demographic data never shown on Clinician profile pages, directory views, or assignment panels | Render only in dedicated Bias Audit Dashboard (Phase 3+) |
| **Collection consent** | Self-reported only; clinician can decline; stored consent record | Consent form via eCIgn before collection |
| **No mock demographic data** | Phase 1 mock data must NOT include demographic fields | Implementation prompt already excludes these — confirm enforcement |
| **Audit logging** | Every access to demographic data logged | AuditLog entry with entityType: 'clinician_demographic' |

### Implementation Prompt Correction

Add to the "CONSTRAINTS" section of the implementation prompt:

> Do NOT include demographicRace, demographicSex, or demographicAge in any TypeScript type, mock data, store, or UI component. These fields are deferred to Phase 3 Bias Audit implementation and require separate storage, access control, and consent infrastructure.

---

## 5. New Risks Introduced by Staffing Module

Comparing the existing PHI posture (Doc 10) against the staffing module's data model:

### Existing Posture (Pre-Staffing)

Per Doc 10 (§ PHI Boundary Analysis):
- "No real patient data (clinical PHI) was detected in the codebase during this review."
- Primary concern is employee PII and operational data in JSONL files.
- The platform handles policy/training content — no patient-facing data.

### New Risks Introduced

| Risk | Severity | Description |
|---|---|---|
| **First patient data in the system** | **Critical** | The staffing module is the FIRST component that introduces patient/client records. This fundamentally changes the PHI posture of the entire application. Even with mock data, the data model and UI patterns establish the infrastructure for PHI handling. |
| **Client name display pattern** | **Critical** | Displaying `firstName` / `lastName` for clients on list and detail pages creates a production-ready UI that will display PHI the moment real data replaces mock data. The habit must be stopped at the mock stage. |
| **Geographic precision escalation** | **High** | Doc 10 found no geographic PHI in the codebase. The staffing module introduces patient GPS coordinates, city, zip code, and zone data — a significant geographic precision increase. |
| **Free-text PHI vectors** | **High** | The data model introduces 12+ free-text fields (notes, reasons, rationale) that cannot be programmatically controlled for PHI content. Users will enter clinical details into these fields. |
| **Cross-entity PHI linkage** | **High** | The ClinicianClientConnection junction entity creates linkages between clinician identity and patient identity. Even if individual records are de-identified, the connection itself reveals "who treated whom" — which is PHI. |
| **Audit log PHI inheritance** | **High** | The AuditLog stores `previousValue` and `newValue` for field changes. If a PHI field is modified, the audit log contains PHI. Audit logs are explicitly append-only and immutable — meaning PHI in audit logs cannot be deleted even under a data deletion request. |
| **Brad/AI index contamination** | **Medium** | If staffing module data (client profiles, care notes, assignment rationale) is indexed by the IA module's RAG pipeline, Brad would have access to PHI. Doc 10 already flags `.cache/ia-index/` as a risk area. |
| **Mock-to-production transition gap** | **Medium** | The implementation prompt specifies mock data with clear disclaimers, but no architectural mechanism prevents production data from being loaded into the same Zustand stores without encryption, access control, or BAA enforcement. |
| **JSONL anti-pattern risk** | **Medium** | Doc 13 warns "Do not store clinician or client data in JSONL." If the staffing module follows the eCIgn precedent of JSONL persistence, patient data would be stored in unencrypted plaintext files in the project directory. |

---

## 6. Brad/AI Access to PHI — Enforcement Assessment

### Stated Requirement

`Planning_Implementation.md` (Part 1) states:
> "Brad should NOT have access to PHI fields in client profiles. Corpus exclusion required."

`Planning_Implementation.md` (Legal/Compliance Risks table):
> "HIPAA minimum necessary — High — Brad should NOT have access to PHI fields in client profiles. Corpus exclusion required."

### Current Enforcement

| Enforcement Mechanism | Status | Assessment |
|---|---|---|
| **Corpus exclusion in IA indexer** | Not implemented | The IA module indexes content from `Builder/` files. No exclude-list exists for staffing data paths. |
| **`.cursorignore` for staffing data** | Not configured | Doc 10 recommends `.cursorignore` entries for sensitive files but does not include `src/policy/clinician/` or `src/policy/client/` paths |
| **API-level PHI field filtering** | Not designed | No mechanism to strip PHI fields from responses served to Brad's context window |
| **DynamoDB IAM separation** | Not designed | No separate IAM role or table-level access control preventing Brad's backend from reading client PHI columns |
| **Field-level `phi: true` marker** | Mentioned in Doc 13 | "Add `phi: true` marker on fields" — but this is a recommendation, not implemented |

### Recommendations

1. **Add to `.cursorignore`** (immediate):
   ```
   src/policy/client/data/
   src/policy/clinician/data/
   ```

2. **Add `phi: true` field marker** to TypeScript types (Phase 1 — in type comments or JSDoc):
   ```typescript
   /** @phi true — Do not index, do not expose to AI/Brad context */
   primaryDiagnosisCategory?: string;
   ```

3. **Design a PHI field filter** for the API layer (Phase 2): Any endpoint consumed by Brad must strip fields marked `phi: true` before including in AI context.

4. **Exclude staffing data paths from IA indexer** (Phase 1): The IA indexer should have an explicit deny-list for any directory containing patient data.

---

## 7. Display-Layer PHI — Read-Only Demo Assessment

### Question: Is `primaryDiagnosisCategory` PHI?

The implementation prompt (Architecture.md line 1259) includes:

> `primaryDiagnosisCategory?: string;    // NOT the actual diagnosis — just category for matching`

**Legal analysis under HIPAA (45 CFR §160.103):**

PHI is defined as individually identifiable health information that:
1. Is created or received by a covered entity, AND
2. Relates to the past, present, or future physical or mental health or condition of an individual, AND
3. Identifies the individual or provides a reasonable basis to believe the individual can be identified.

A "diagnosis category" such as "cardiac", "wound care", "respiratory", "neurological", or "orthopedic" **does relate to the health condition** of the individual (criterion 2). When displayed on a client profile page alongside the client's name, city, and acuity level, the individual is identified (criterion 3).

**Verdict:** `primaryDiagnosisCategory` **is PHI** when displayed in context with any patient identifier. Even "wound care" combined with a name and city constitutes individually identifiable health information.

### Client Detail Page PHI Assessment

The implementation prompt specifies for `ClientDetailPage.tsx`:

> "Full profile: info section, care needs section (required disciplines + competencies), shift needs section, active assignments section (linked to clinicians)."

| Displayed Element | PHI? | Safe for Demo? | Recommendation |
|---|---|---|---|
| Client `firstName` + `lastName` | Yes | **NO** | Replace with synthetic ID |
| Client `careTier` (L1-L4) | Indirect | Acceptable | OK — tier is sufficiently abstracted |
| Client `serviceSetting` (home/facility) | No | Yes | OK |
| Client `serviceCity` | Yes | **NO** | Replace with zone name only |
| Client `primaryDiagnosisCategory` | Yes | **NO** | Remove from Phase 1 display |
| Client `requiredDisciplines[]` | No | Yes | OK — service category, not clinical detail |
| Client `requiredCompetencies[]` | No | Yes | OK — skill requirements |
| Linked clinician names | PII | Acceptable | Employee PII in staffing context is operational |
| ShiftNeed details | No | Yes | OK — operational scheduling data |
| ACCM owner name | PII | Acceptable | Employee PII in operational context |

---

## 8. Encryption-at-Rest Requirements

When real data replaces mock data, the following fields require encryption at rest. Grouped by encryption tier:

### Tier 1: PHI Fields — Require Field-Level Encryption + Access Control

| Entity | Field | Encryption Method | Access Control |
|---|---|---|---|
| Client | `firstName` | AES-256 field-level | Clinical staff + admin |
| Client | `lastName` | AES-256 field-level | Clinical staff + admin |
| Client | `dateOfBirth` (deferred) | AES-256 field-level | Clinical staff only |
| Client | `primaryDiagnosis` (deferred) | AES-256 field-level | Clinical staff only |
| Client | `address` (deferred) | AES-256 field-level | Clinical staff + scheduling |
| Client | `city` / `serviceCity` | AES-256 field-level | Scheduling + admin |
| Client | `coordinates` / GPS | AES-256 field-level | Matching engine only (never displayed raw) |
| Client | `serviceZip` | AES-256 field-level | Scheduling + admin |
| Client | `diagnosisCategory` | AES-256 field-level | Clinical staff + matching engine |
| Client | `visitFrequencyString` | AES-256 field-level | Clinical staff |
| Client | `riskFactors[]` | AES-256 field-level | Clinical staff only |
| Client | `careNotes` | AES-256 field-level | Clinical staff only |
| Client | `payerType` | AES-256 field-level | Billing + admin |
| Client | `certPeriodStart/End` | AES-256 field-level | Clinical staff |
| Client | Episode fields (6) | AES-256 field-level | Clinical staff |
| ShiftAssignment | `citationCard` | AES-256 field-level | Audit access only |
| ShiftAssignment | `completionNotes` | AES-256 field-level | Clinical staff |
| AuditLog | `previousValue` / `newValue` (when containing PHI) | AES-256 field-level | Audit access only |

### Tier 2: PII Fields — Require Table-Level Encryption

| Entity | Field | Encryption Method | Access Control |
|---|---|---|---|
| Clinician | `firstName` | DynamoDB SSE (AWS-managed) | All authenticated users |
| Clinician | `lastName` | DynamoDB SSE | All authenticated users |
| Clinician | `homeBaseCity` | DynamoDB SSE | Admin + scheduling |
| Clinician | `homeCoordinates` | DynamoDB SSE + field-level for GPS | Matching engine only |
| Clinician | `profilePhotoUrl` | DynamoDB SSE | All authenticated users |
| Clinician | `religiousRestrictions[]` | DynamoDB SSE + field-level | HR + compliance only |
| Clinician | `adaAccommodations[]` | DynamoDB SSE + field-level | HR + compliance only |
| Clinician | `pregnancyAccommodation` | DynamoDB SSE + field-level | HR + compliance only |
| Clinician | `fmlaLeave` | DynamoDB SSE + field-level | HR + compliance only |
| Credential | `licenseNumber` | DynamoDB SSE | HR + compliance |
| AuditLog | `ipAddress` | DynamoDB SSE | Security audit only |

### Tier 3: Protected Characteristics — Require Separate Table + Field-Level Encryption

| Entity | Field | Encryption Method | Access Control |
|---|---|---|---|
| Clinician | `demographicRace` | AES-256 in separate table | Bias auditor role ONLY |
| Clinician | `demographicSex` | AES-256 in separate table | Bias auditor role ONLY |
| Clinician | `demographicAge` | AES-256 in separate table | Bias auditor role ONLY |

### Infrastructure Requirements

| Requirement | Details |
|---|---|
| **AWS BAA** | Business Associate Agreement with AWS must be in place before ANY real PHI enters DynamoDB |
| **DynamoDB SSE** | Enable server-side encryption on ALL staffing tables (default: AWS-managed keys; recommended: customer-managed KMS keys) |
| **Field-level encryption** | Implement application-layer encryption for Tier 1 and Tier 3 fields using AWS KMS with separate key policies |
| **Key rotation** | Annual rotation of KMS keys; automated via AWS KMS |
| **Encryption in transit** | All API calls over HTTPS (already the case per Doc 10) |
| **Backup encryption** | DynamoDB backups inherit table encryption; verify PITR encryption settings |

---

## 9. Recommended Corrections for the Implementation Prompt

The following specific corrections should be applied to the implementation prompt (Architecture.md lines 1362–1430) before execution:

### Correction 1: Client Identity — Replace Names with Synthetic IDs

**Current** (line 1391):
> `Client interface: { id, firstName, lastName, preferredName?, ...`

**Corrected:**
> `Client interface: { id, displayId, preferredName?, ...`

Where `displayId` is a synthetic, non-identifying label (e.g., "Client-A1", "Maple-7B"). Defer `firstName` and `lastName` to Phase 2 alongside the PHI encryption framework.

**Rationale:** Patient names are the #1 HIPAA identifier. Establishing a name-based display pattern in Phase 1 creates PHI exposure risk in production.

### Correction 2: Remove `primaryDiagnosisCategory` from Phase 1

**Current** (line 1259/1391):
> `primaryDiagnosisCategory?: string;    // NOT the actual diagnosis — just category for matching`

**Corrected:** Remove entirely from Phase 1 Client type. Add to deferred fields list alongside `dateOfBirth`, `primaryDiagnosis`, and `address`.

**Rationale:** Diagnosis category combined with any identifier constitutes PHI. The `careTier` field (L1-L4) provides sufficient abstraction for Phase 1 operational display without clinical information.

### Correction 3: Replace Geographic Fields with Zone-Only Abstraction

**Current** (line 1391):
> `serviceZip?, serviceCity?, ...`

**Corrected:** Remove `serviceZip` and `serviceCity`. Retain only `serviceZone?: string` (named zone, e.g., "North Bay", "Peninsula", "East Bay").

**Rationale:** Zip codes and city names are HIPAA identifiers when associated with patient records. Named zones provide sufficient geographic abstraction for Phase 1 display and future matching.

### Correction 4: Mock Data Name Safety

**Current** (line 1394):
> "Realistic Bay Area names."

**Corrected:**
> "Clearly fictional clinician names with cultural diversity (e.g., 'Ana Reyes', 'James Park'). Add file-level comment: ALL NAMES ARE FICTIONAL. For client mock data, use synthetic display IDs only (e.g., 'Client-A1', 'Client-B2'). Do NOT generate mock client names."

**Rationale:** Eliminates risk of coincidental identification. Enforces no-PHI display pattern from Phase 1.

### Correction 5: Add PHI Guard Comments to Deferred Fields

**Current** (lines 1261–1263):
> ```
> // dateOfBirth?: string;              // DEFER
> // primaryDiagnosis?: string;         // DEFER
> // address?: ClientAddress;           // DEFER
> ```

**Corrected:**
> ```
> // === PHI FIELDS — DEFERRED TO PHASE 2 ===
> // Requires: field-level encryption, AWS BAA, access control middleware
> // dateOfBirth?: string;
> // primaryDiagnosis?: string;
> // primaryDiagnosisCategory?: string;
> // address?: ClientAddress;
> // serviceCity?: string;
> // serviceZip?: string;
> // firstName?: string;  (use displayId until PHI framework ready)
> // lastName?: string;   (use displayId until PHI framework ready)
> // === END PHI FIELDS ===
> ```

### Correction 6: Add Explicit Demographic Field Exclusion Constraint

**Add to CONSTRAINTS section** (after line 1427):

> Do NOT include demographicRace, demographicSex, or demographicAge in any TypeScript type, mock data, Zustand store, component, or page. These fields are deferred to Phase 3 (Bias Audit) and require separate storage, role-based access control, and clinician consent infrastructure that does not exist in Phase 1.

### Correction 7: Add Free-Text Field PHI Warning

**Add to CONSTRAINTS section:**

> All free-text fields (notes, reason, rationale, description) in mock data must contain ONLY operational content — never clinical details, diagnoses, or health conditions. Example safe values: "Prefers morning shifts", "Lives in hilly area — allow extra travel time." Example unsafe values: "Patient has diabetes and fall risk", "Clinician has back problems."

---

## Appendix A: PHI Definition Reference

Per 45 CFR §160.103, Protected Health Information (PHI) includes individually identifiable health information that relates to:
- Past, present, or future physical or mental health or condition
- Provision of health care to the individual
- Past, present, or future payment for health care

The 18 HIPAA identifiers (45 CFR §164.514(b)(2)):
1. Names
2. Geographic data smaller than state
3. Dates (except year) related to an individual
4. Phone numbers
5. Fax numbers
6. Email addresses
7. Social Security numbers
8. Medical record numbers
9. Health plan beneficiary numbers
10. Account numbers
11. Certificate/license numbers
12. Vehicle identifiers
13. Device identifiers
14. Web URLs
15. IP addresses
16. Biometric identifiers (including photos)
17. Full-face photographs
18. Any other unique identifying number

---

## Appendix B: Relevant Regulatory Citations

| Regulation | Relevance to This Review |
|---|---|
| **HIPAA Privacy Rule (45 CFR §164)** | Defines PHI, minimum necessary standard, access controls |
| **HIPAA Security Rule (45 CFR §164.312)** | Requires encryption at rest and in transit for ePHI |
| **California CCPA/CPRA** | Clinician PII rights (access, deletion, correction) |
| **California FEHA ADS Regs (Oct 2025)** | Demographic data handling in automated employment decisions |
| **EEOC AI Guidance** | Disparate impact monitoring requirements for automated staffing |
| **42 CFR §484** | Medicare Conditions of Participation — staffing documentation requirements |
| **FTC Section 5** | Substantiation requirements for AI performance claims |

---

## Appendix C: Document Cross-Reference

| Finding | Source Document | Section |
|---|---|---|
| Client data model with PHI fields | Architecture.md | §2.2 |
| Clinician demographic fields | Architecture.md | §2.1 Demographic Fields |
| PHI deferral statement | Planning_Implementation.md | Part 1 Legal/Compliance Risks |
| Brad corpus exclusion requirement | Planning_Implementation.md | Part 1 Legal/Compliance Risks |
| Existing PHI posture (no patient data) | 10_SECURITY_PRIVACY_AND_PHI_BOUNDARY.md | PHI Boundary Analysis |
| JSONL anti-pattern warning | 13_IMPLEMENTATION_READINESS.md | Risks From Current Architecture |
| Mock data specification | Architecture.md | Lines 1393–1398 (Implementation Prompt) |
| `primaryDiagnosisCategory` inclusion | Architecture.md | Line 1259, 1391 |

---

*End of Privacy & PHI Boundary Review*
*Reviewer: Privacy / No-PHI Reviewer (AI-Assisted)*
*Classification: Internal — Planning Document Review*
*Next Action: Apply Corrections 1–7 to implementation prompt before execution*
