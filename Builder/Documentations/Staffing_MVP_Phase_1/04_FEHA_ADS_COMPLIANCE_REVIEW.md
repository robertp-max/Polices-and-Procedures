# FEHA/ADS Compliance Review — Phase 1 Staffing MVP

**Document ID:** 04_FEHA_ADS_COMPLIANCE_REVIEW  
**Version:** 1.0  
**Date:** 2026-05-13  
**Role:** FEHA/ADS Decision-Support Reviewer  
**Scope:** Review of Architecture.md, Planning_Implementation.md, and Requirements (Staffing v2.0) through the lens of California FEHA Automated Decision System regulations, EEOC guidance, and federal employment law.  
**Phase:** Phase 1 — Staffing MVP Foundation (read-only demo, no matching engine)

---

## 1. Executive Summary

The planning documentation demonstrates **strong awareness** of FEHA ADS obligations. The Requirements document (Section 5) establishes a 5-layer compliance architecture, correctly identifies Brad as an ADS under California law, mandates "AI-assisted" language, and defines accommodation fields as P0 hard constraints. The Architecture document (Architecture.md) translates these into a detailed entity model with accommodation fields, demographic audit fields, approval workflows, and an immutable audit log.

**However, six material gaps remain for Phase 1:**

| # | Gap | Severity | Status |
|---|-----|----------|--------|
| 1 | **No formal ADS declaration** exists in the architecture itself — the classification lives only in Planning_Implementation.md prose | Critical | Must fix |
| 2 | **Accommodation fields are defined in Architecture.md but omitted from the Phase 1 implementation prompt** (lines 1361–1430) | Critical | Must fix |
| 3 | **No AdsDecisionLog entity** is defined anywhere — Planning_Implementation.md recommends it but neither Architecture.md nor the implementation prompt include it | High | Recommend Phase 1 stub |
| 4 | **Worker disclosure placeholder** exists in Requirements (line 530) but has no architectural representation — no field, no entity, no UI placeholder | High | Must add |
| 5 | **Disparate impact data model is present** (demographic fields on Clinician, biasFlags on ShiftAssignment) but the **Phase 1 implementation prompt excludes both** | Medium | Must add stubs |
| 6 | **Language inconsistency** — Architecture.md uses "automated" in 3 instances without the "AI-assisted" qualifier mandated by Requirements Section 2 | Medium | Must correct |

**Bottom line:** The architecture is ~85% compliant at the design level but the Phase 1 implementation prompt (the document that actually drives what gets built) is ~55% compliant. The implementation prompt must be corrected before code is written.

---

## 2. ADS Classification Statement

### Current State

Planning_Implementation.md (line 18) states:

> *"Brad's matching engine IS an ADS under California law. It makes or assists in 'employment decisions' — specifically shift assignment, scheduling, and work allocation."*

This is **correct** and well-articulated. However, this classification exists only in an advisory/review document — it does not appear in the Architecture.md that developers will reference, nor in the implementation prompt that Cursor/Sonnet will execute.

### Recommended ADS Declaration (add to Architecture.md Section 1)

The following text should be added as a new subsection immediately after the "Design Principles" list in Architecture.md:

```
### ADS Classification Under California FEHA (Effective Oct 1, 2025)

Brad Workforce AI is classified as an Automated Decision System (ADS) under
California Civil Rights Council regulations implementing the Fair Employment
and Housing Act (FEHA). Specifically:

1. CLASSIFICATION: Brad assists in "employment decisions" — shift assignment,
   scheduling, and work allocation — which are covered employment actions
   under FEHA.

2. FRAMING: Brad is a DECISION SUPPORT tool. It provides recommendations to
   qualified human reviewers. It does NOT make autonomous staffing decisions.
   All outputs must be labeled "AI-assisted recommendation" per Section 2 of
   the Brad Requirements Document.

3. EMPLOYER LIABILITY: Care Indeed (the employer) bears liability for ADS
   outcomes, not the tool vendor. California explicitly holds employers
   responsible for "the actions of their agents, including recruiters,
   staffing firms, or AI software providers."

4. REQUIRED INFRASTRUCTURE (built incrementally across phases):
   - Bias audit methodology (pre- and post-deployment)
   - 4-year retention of ADS-related records
   - Reasonable accommodation enforcement as hard constraints
   - Human oversight with documented rationale
   - Worker disclosure (written notice of ADS use)
   - Clinician appeal mechanism
   - Disparate impact monitoring (four-fifths rule)

5. PHASE 1 OBLIGATIONS: Even though Phase 1 builds NO matching engine, the
   data model MUST support future ADS compliance by including:
   - Accommodation fields (Layer 1 hard constraints)
   - Demographic fields (Layer 3 bias audit, never used in matching)
   - Approval/override fields (Layer 4 human review)
   - Audit log (Layer 5 trail)
   - AdsDecisionLog stub (4-year retention foundation)
```

### Where This Should Live

| Location | Purpose |
|----------|---------|
| Architecture.md Section 1 (new subsection) | Canonical declaration for developers |
| Implementation prompt CONSTRAINTS section | Ensures Cursor/Sonnet respects ADS framing |
| Future: `12_FEHA_ADS_COMPLIANCE_FRAMEWORK.md` | Full compliance framework (per Planning_Implementation.md Part 3, item 1) |

---

## 3. 5-Layer Compliance Readiness Matrix

The Requirements document (Section 5) defines a 5-layer decision flow. The Architecture document maps these to entities. For Phase 1, which builds **no matching engine and no scoring algorithm**, the readiness status is:

| Layer | Name | Phase 1 Active? | Data Support in Architecture.md? | Data Support in Implementation Prompt? | Gap |
|-------|------|-----------------|----------------------------------|---------------------------------------|-----|
| **1** | Hard Constraints | **Partial** — data must exist for future enforcement | **YES** — Clinician accommodation fields (lines 70–79), Credential entity with expiry lifecycle (lines 276–299), Restriction entity with hard/soft severity (lines 300–319) | **PARTIALLY** — Credential interface included; accommodation fields **OMITTED** from Clinician interface (line 1388); Restriction entity **OMITTED** | **CRITICAL GAP in implementation prompt** |
| **2** | Optimization | **NO** — deferred (no matching engine) | YES — matchScore, matchFactors on Connection and ShiftAssignment | Correctly excluded | No gap |
| **3** | Bias Check | **NO** — deferred (no algorithm to audit) | **YES** — demographicRace, demographicSex, demographicAge on Clinician (lines 84–87); biasFlags[] on ShiftAssignment (line 389) | **OMITTED** — no demographic fields in implementation prompt Clinician type | **HIGH GAP** — demographic fields needed even as read-only stubs |
| **4** | Human Review | **YES** — approval fields must exist on assignments | **YES** — approvedBy, approvalRationale, overrideReason on ShiftAssignment (lines 381–388); assignmentSource enum (line 380) | **PARTIALLY** — CareAssignment has approvedBy/approvedAt but **OMITS** approvalRationale and overrideReason (line 1389) | **MUST FIX** — add approvalRationale and overrideReason |
| **5** | Audit Trail | **YES** — design must exist, even if implementation is deferred | **YES** — AuditLog entity with append-only immutability rule (lines 396–415) | **OMITTED** — no AuditLog type in implementation prompt; no audit infrastructure | **HIGH GAP** — at minimum, define the type |

### Readiness Verdict

| Layer | Architecture Design | Implementation Prompt | Action Required |
|-------|--------------------|-----------------------|-----------------|
| Layer 1 | READY | **NOT READY** | Add accommodation fields + restriction entity to prompt |
| Layer 2 | READY (deferred) | Correctly deferred | None |
| Layer 3 | READY | **NOT READY** | Add demographic stub fields to Clinician type in prompt |
| Layer 4 | READY | **PARTIAL** | Add approvalRationale and overrideReason to CareAssignment |
| Layer 5 | READY | **NOT READY** | Add AuditLog type definition to prompt (stub, no implementation) |

---

## 4. Accommodation Fields Gap Analysis

### Architecture.md Definition (lines 70–79)

| Field | Schema | Layer | Classification |
|-------|--------|-------|----------------|
| `religiousRestrictions[]` | `{day, timeRange, description}` | Layer 1 | Hard constraint — no override |
| `adaAccommodations[]` | `{type, description, effectiveDate}` | Layer 1 | Hard constraint — no override |
| `pregnancyAccommodation` | `{active, details, expectedEndDate}` | Layer 1 | Hard constraint — no override |
| `fmlaLeave` | `{active, startDate, endDate}` | Layer 1 | Hard constraint — no override |
| `schedulingLimitations[]` | `{type, description}` | Layer 1 | Hard constraint — no override |

### Schema Sufficiency Assessment

| Field | Schema Sufficient? | Recommendation |
|-------|-------------------|----------------|
| `religiousRestrictions[]` | **Mostly** — `{day, timeRange, description}` covers the scheduling block. Missing: `recurring: boolean` (some restrictions are every week, others are specific dates like holidays). Missing: `confidential: boolean` (FEHA does not require the employee to disclose the specific religion). | Add `recurring` and `confidential` flags |
| `adaAccommodations[]` | **Mostly** — `{type, description, effectiveDate}` covers the accommodation itself. Missing: `reviewDate` (ADA requires periodic interactive process review). Missing: `approvedBy` (who approved the accommodation). | Add `reviewDate` and `approvedBy` |
| `pregnancyAccommodation` | **Yes** — `{active, details, expectedEndDate}` is sufficient for Phase 1. California FEHA pregnancy accommodation (Gov. Code §12945) requires transfer to less strenuous position if requested. The `details` field can capture this. | Sufficient |
| `fmlaLeave` | **Mostly** — `{active, startDate, endDate}` covers the leave period. Missing: `type` (FMLA, CFRA, PDL — different eligibility rules). Missing: `intermittent: boolean` (intermittent FMLA creates complex scheduling patterns). | Add `leaveType` and `intermittent` |
| `schedulingLimitations[]` | **Yes** — `{type, description}` is a catch-all. Adequate for Phase 1. | Sufficient |

### Implementation Prompt Status

**CRITICAL FINDING:** The Phase 1 implementation prompt (Architecture.md lines 1361–1430) defines the Clinician interface as:

> `Clinician interface: { id, firstName, lastName, preferredName?, email?, phone?, primaryDiscipline, secondaryDisciplines?, competencies, credentials, employmentType, hireDate?, status, orgRole?, supervisorId?, cgssId?, serviceAreas?, maxHoursPerWeek?, createdAt, updatedAt }`

**None of the five accommodation fields are included.** This means the Phase 1 build will create clinician records with no capacity to store accommodation data — a structural omission that contradicts:

- Architecture.md line 70: "Accommodation Fields (REQUIRED — P0 Compliance per FEHA ADS)"
- Architecture.md line 24: "Accommodations (religious, ADA, pregnancy, FMLA) are hard constraints — Layer 1, no override"
- Requirements line 141: "Accommodation fields in data model — P0"

### Required Correction

Add to the Clinician interface in the implementation prompt:

```
religiousRestrictions?: { day: string; timeRange?: string; description?: string; recurring?: boolean }[];
adaAccommodations?: { type: string; description: string; effectiveDate: string; reviewDate?: string }[];
pregnancyAccommodation?: { active: boolean; details?: string; expectedEndDate?: string };
fmlaLeave?: { active: boolean; startDate?: string; endDate?: string; leaveType?: string; intermittent?: boolean };
schedulingLimitations?: { type: string; description?: string }[];
```

These should be optional (nullable) since not every clinician has accommodations, but the **fields must exist on the type** for Phase 1 mock data to demonstrate the system's accommodation awareness.

Mock data should include at minimum:
- 1 clinician with a religious scheduling restriction (e.g., Sabbath observance)
- 1 clinician with an ADA accommodation
- 1 clinician on FMLA leave (status: `onLeave`)

---

## 5. Human-in-the-Loop Field Requirements for Phase 1

### Architecture.md Definition

The ShiftAssignment entity (lines 363–395) includes comprehensive HITL fields:

| Field | Type | HITL Purpose |
|-------|------|-------------|
| `assignedBy` | UUID | Who made the assignment (system vs human) |
| `assignmentSource` | enum: `bradRecommendation`, `manualAssignment` | Tracks decision origin |
| `approvedBy` | UUID | Qualified clinical manager |
| `approvedAt` | timestamp | When approved |
| `approvalRationale` | text | Required documentation |
| `overrideReason` | text (nullable) | If human overrode Brad's recommendation |
| `accommodationCheck` | JSON | Conflict check results |
| `biasFlags[]` | JSON (nullable) | From Layer 3 |
| `citationCard` | JSON | Full defensibility citation |

### Implementation Prompt Status

The CareAssignment interface (line 1389) includes:

| Field | Included? | Status |
|-------|-----------|--------|
| `assignedBy` | YES | OK |
| `approvedBy` | YES | OK |
| `approvedAt` | YES | OK |
| `assignmentSource` | **NO** | **MUST ADD** — critical for audit trail |
| `approvalRationale` | **NO** | **MUST ADD** — required for FEHA meaningful review |
| `overrideReason` | **NO** | **MUST ADD** — required for FEHA override documentation |
| `accommodationCheck` | **NO** | Acceptable to defer (no matching engine) |
| `biasFlags` | **NO** | Acceptable to defer (no algorithm) |
| `citationCard` | **NO** | Acceptable to defer (no scoring) |

### Required Correction

Add to CareAssignment interface in the implementation prompt:

```
assignmentSource: 'brad_recommendation' | 'manual_assignment';
approvalRationale?: string;
overrideReason?: string;
```

Mock data should include:
- At least 1 assignment with `assignmentSource: 'manual_assignment'` and `approvalRationale` populated
- At least 1 assignment demonstrating an override scenario with `overrideReason` populated

These fields cost nothing to add but establish the HITL audit pattern from day one.

---

## 6. AdsDecisionLog Recommendation

### Current State

- **Planning_Implementation.md** (Part 5): Explicitly recommends "Add AdsDecisionLog entity (deferred but structurally defined)" to `02_ENTITY_MODEL.md` citing "FEHA 4-year retention requirement"
- **Architecture.md**: The AuditLog entity (lines 396–415) provides a general-purpose audit trail but does **not** define an ADS-specific decision log
- **Requirements** (Section 5): Specifies "4-year retention of ADS-related records (dataset descriptors, scoring outputs, audit findings)" but does not define a specific entity
- **Implementation Prompt**: No mention of AdsDecisionLog

### Analysis

The AuditLog entity tracks field-level changes on any entity. It is necessary but **not sufficient** for FEHA ADS compliance because:

1. **FEHA requires retention of the ADS inputs, not just outputs.** The AuditLog records "what changed" on an entity. It does not record "what data the ADS consumed to produce its recommendation."
2. **FEHA requires retention of scoring outputs.** The matchScore and matchFactors on ShiftAssignment capture the final score but not the full candidate pool that was evaluated and rejected.
3. **4-year retention** is a specific FEHA requirement that must be enforced at the entity level, not implied by general audit policy.

### Recommendation: Phase 1 Type Stub (No Implementation)

Define the type in `src/policy/clinician/types.ts` (or a shared types file) but do **not** implement storage, UI, or population logic in Phase 1:

```typescript
interface AdsDecisionLog {
  id: string;
  decisionType: 'shift_assignment' | 'eligibility_check' | 'connection_recommendation';
  triggerEntityId: string;       // ShiftNeed or ShiftAssignment that triggered
  timestamp: string;
  
  // What Brad considered
  inputSnapshot: {
    candidatePoolSize: number;
    hardConstraintsApplied: string[];
    accommodationsChecked: string[];
  };
  
  // What Brad recommended
  recommendation: {
    recommendedClinicianId?: string;
    matchScore?: number;
    matchFactors?: Record<string, number>;
    alternativesConsidered: number;
  };
  
  // What the human decided
  humanDecision: {
    action: 'approved' | 'overridden' | 'rejected' | 'escalated';
    decidedBy: string;
    rationale?: string;
    overrideClinicianId?: string;  // If human selected a different clinician
  };
  
  // Bias audit data
  biasSnapshot?: {
    demographicDistribution: Record<string, number>;
    flagsRaised: string[];
  };
  
  retentionExpiresAt: string;    // 4 years from timestamp per FEHA
}
```

**Cost of including this stub:** Near zero — it's a type definition only.  
**Cost of omitting this stub:** When Phase 2 builds the matching engine, developers will not have the ADS logging pattern established. The risk is that ADS decisions get logged to the general AuditLog with insufficient detail, requiring expensive retrofitting.

**Verdict: Include the type stub in Phase 1. Do not build storage or UI.**

---

## 7. Disparate Impact Data Readiness

### Four-Fifths Rule Requirements

The EEOC four-fifths (80%) rule requires that for any selection procedure, the selection rate for any protected group must be at least 80% of the rate for the most-selected group. To apply this to staffing:

| Data Needed | Purpose | Source Entity |
|-------------|---------|---------------|
| Clinician demographics (race, sex, age) | Identify protected groups | Clinician — demographic fields |
| Assignment outcomes per clinician | Measure selection rates | ShiftAssignment |
| Assignment quality indicators (mileage, shift desirability, overtime) | Detect disparate burden | ShiftAssignment + ShiftNeed |
| Candidate pool for each decision | Determine who was eligible vs selected | AdsDecisionLog (future) |

### Architecture.md Readiness

| Requirement | Present in Architecture? | Present in Implementation Prompt? |
|-------------|------------------------|-----------------------------------|
| `demographicRace` on Clinician | YES (line 85) | **NO** |
| `demographicSex` on Clinician | YES (line 86) | **NO** |
| `demographicAge` on Clinician | YES (line 87) | **NO** |
| `biasFlags[]` on ShiftAssignment | YES (line 389) | **NO** |
| `biasReport` on StaffingPlan | YES (Requirements lines 299–304) | **NO** (StaffingPlan not in Phase 1) |
| "Never used in matching" annotation | YES (line 80) | N/A |

### Assessment

The Architecture.md correctly:
- Defines demographic fields as **optional, self-reported**
- Labels them "FOR BIAS AUDIT ONLY — Never Used in Matching"
- Separates them from operational fields in the entity definition

The implementation prompt **excludes all demographic fields** from the Clinician type. While Phase 1 has no matching engine to audit, the fields should exist as stubs for two reasons:

1. **Mock data representativeness**: Including demographic fields in mock data allows the demo to show that the system collects this data for audit purposes, demonstrating awareness.
2. **Type completeness**: Adding the fields in Phase 2 requires modifying the Clinician type, all stores, all mock data, and all components that render clinician data. Including them now (even if unpopulated in mock data for most records) avoids this rework.

### Required Correction

Add to Clinician type in implementation prompt:

```
// Bias audit fields — never used in matching logic
demographicData?: {
  race?: string;        // Self-reported, optional
  sex?: string;         // Self-reported, optional
  age?: number;         // Self-reported, optional
};
```

Wrapping in a single `demographicData` object (rather than flat fields) makes the "audit only" boundary explicit in the code.

---

## 8. Language Audit: "Automated" vs "Assisted" in Planning Documents

### Governing Rule

Requirements document (line 25):

> *"Critical language rule: Always 'AI-assisted' — never 'AI-automated.' Brad OPTIMIZES and RECOMMENDS. A qualified clinical manager APPROVES."*

### Audit Results

#### Architecture.md

| Line | Text | Classification | Issue? |
|------|------|---------------|--------|
| 215 | "Clinician meets hard constraints... System (**automated** from matching rules)" | Connection status description | **YES** — should be "system-evaluated" or "system-determined" |
| 797 | "**AI-assisted** recommendation. Assignment subject to clinical manager review..." | Citation card disclaimer | NO — correct usage |
| 894 | "Layer 3 bias check **automation** (statistical analysis on assignments)" | Phase 7 description | **BORDERLINE** — "automation" here refers to the bias check process, not the assignment decision. Acceptable but could be "Layer 3 bias check engine" for consistency |
| 926 | "Shift need generation from visit plans is not **automated**" | Recommendation text | NO — this correctly notes the absence of automation as a gap |

#### Planning_Implementation.md

| Line | Text | Classification | Issue? |
|------|------|---------------|--------|
| 18 | "Brad's matching engine IS an ADS" | ADS classification | NO — correctly identifies ADS status; does not misframe as "automated decision maker" |
| 136 | "assignmentSource: 'brad_filled'" | Mock data suggestion | **YES** — "brad_filled" implies Brad made the assignment autonomously. Should be "brad_recommended" |
| 140–146 | `isEligible()` function concept | Eligibility preview | NO — correctly framed as pass/fail eligibility, not autonomous decision |
| 154 | "Phase 1 should only demo #1 (generating/displaying demand)" | Phase 1 scope | NO — correct framing |
| 200–204 | "Decision Support" not "Decision Making" | Explicit framing guidance | NO — correct; this is the standard to follow |

#### Requirements (Staffing v2.0)

| Line | Text | Classification | Issue? |
|------|------|---------------|--------|
| 9 | "**AI-assisted** home health staffing optimization" | Tagline | NO — correct |
| 25 | "Always **'AI-assisted'** — never **'AI-automated'**" | Governing rule | NO — this IS the rule |
| 115 | "LAYER 3: BIAS CHECK (**Automated**, before human review)" | Layer 3 description | **BORDERLINE** — "Automated" here describes the bias check process (a compliance safeguard), not the staffing decision itself. Technically acceptable because the bias check IS automated. But for consistency, consider "Systematic" or "Algorithmic" |
| 150 | "**AI-assisted** recommendation..." | Required disclaimer | NO — correct |
| 373 | "// Phase 6: BIAS CHECK (Layer 3 — **automated**)" | Algorithm pseudocode | Same as line 115 — acceptable in context |
| 618 | "Core **automation** value + defensibility" | Demo script | **YES** — "automation value" is marketing language that conflicts with "decision support" framing. Should be "Core decision support value" |
| 651 | "**AI-assisted**, not **AI-automated**" | Design decision | NO — this IS the rule |
| 654 | "Users want **automation**, not homework" | Design rationale | **BORDERLINE** — casual language in a design rationale. Acceptable in internal docs but should not propagate to any user/client-facing material |
| 659 | "this IS the **automation** promise" | Design emphasis | **YES** — "automation promise" undermines the "decision support" framing. Should be "this IS the efficiency promise" or "this IS the decision support promise" |

### Language Audit Summary

| Document | Violations | Borderline | Correct | Total Instances |
|----------|-----------|------------|---------|-----------------|
| Architecture.md | 1 | 1 | 2 | 4 |
| Planning_Implementation.md | 1 | 0 | 4 | 5 |
| Requirements | 2 | 2 | 4 | 8 |
| **TOTAL** | **4** | **3** | **10** | **17** |

### Corrections Required

1. **Architecture.md line 215**: Change "automated from matching rules" to "system-evaluated from matching rules"
2. **Planning_Implementation.md line 136**: Change `'brad_filled'` to `'brad_recommended'`
3. **Requirements line 618**: Change "Core automation value" to "Core decision support value"
4. **Requirements line 659**: Change "this IS the automation promise" to "this IS the decision support promise"

---

## 9. Recommended Corrections for the Implementation Prompt

The implementation prompt (Architecture.md lines 1361–1430) is the document that directly drives what Cursor/Sonnet builds. The following corrections are prioritized by compliance risk.

### P0 — Must Fix Before Any Code Is Written

#### 9.1 Add Accommodation Fields to Clinician Interface

**Current** (line 1388):
```
Clinician interface: { id, firstName, lastName, preferredName?, email?, phone?,
primaryDiscipline, secondaryDisciplines?, competencies, credentials,
employmentType, hireDate?, status, orgRole?, supervisorId?, cgssId?,
serviceAreas?, maxHoursPerWeek?, createdAt, updatedAt }
```

**Corrected**:
```
Clinician interface: { id, firstName, lastName, preferredName?, email?, phone?,
primaryDiscipline, secondaryDisciplines?, competencies, credentials,
employmentType, hireDate?, status, orgRole?, supervisorId?, cgssId?,
serviceAreas?, maxHoursPerWeek?,
religiousRestrictions?: { day, timeRange?, description?, recurring? }[],
adaAccommodations?: { type, description, effectiveDate, reviewDate? }[],
pregnancyAccommodation?: { active, details?, expectedEndDate? },
fmlaLeave?: { active, startDate?, endDate?, leaveType?, intermittent? },
schedulingLimitations?: { type, description? }[],
demographicData?: { race?, sex?, age? },
createdAt, updatedAt }
```

#### 9.2 Add HITL Fields to CareAssignment Interface

**Current** (line 1389):
```
CareAssignment interface: { id, clinicianId, clientId, discipline,
assignmentRole, startDate, endDate?, status, assignedBy, approvedBy?,
approvedAt?, lastSupervisoryVisit?, createdAt }
```

**Corrected**:
```
CareAssignment interface: { id, clinicianId, clientId, discipline,
assignmentRole, startDate, endDate?, status, assignedBy, approvedBy?,
approvedAt?, assignmentSource: 'brad_recommendation' | 'manual_assignment',
approvalRationale?, overrideReason?, lastSupervisoryVisit?, createdAt }
```

#### 9.3 Add Mock Data Requirements for Compliance

Add to the mock data section (line 1393):

```
Mock data compliance requirements:
- At least 1 clinician with religiousRestrictions[] populated
  (e.g., Sabbath observer — Saturday unavailable)
- At least 1 clinician with adaAccommodations[] populated
  (e.g., lifting restriction)
- At least 1 clinician with fmlaLeave.active = true and status = 'onLeave'
- At least 1 CareAssignment with assignmentSource = 'manual_assignment'
  and approvalRationale populated
- At least 1 CareAssignment with overrideReason populated
  (demonstrates HITL override documentation)
```

#### 9.4 Add ADS Context to CONSTRAINTS Section

Add to the CONSTRAINTS section (after line 1427):

```
COMPLIANCE CONSTRAINTS:
- Frame ALL system capabilities as "decision support" — never "automated
  decision making"
- Every mock CareAssignment must include assignmentSource documenting
  whether it was system-recommended or manually assigned
- Accommodation fields on Clinician are DISPLAY ONLY in Phase 1 but
  MUST exist in the type definition and mock data
- Demographic fields (race, sex, age) on Clinician are for bias audit
  ONLY — never render in assignment-related views, never use in any
  filtering or sorting logic
```

### P1 — Should Fix Before Phase 1 Demo

#### 9.5 Add AdsDecisionLog Type Stub

Add to the types creation section:

```
CREATE TYPE (src/policy/shared/types.ts):
AdsDecisionLog interface (TYPE ONLY — no store, no UI, no population):
{ id, decisionType, triggerEntityId, timestamp, inputSnapshot?,
  recommendation?, humanDecision?, biasSnapshot?, retentionExpiresAt }
```

#### 9.6 Add AuditLog Type Stub

Add to the types creation section:

```
CREATE TYPE (src/policy/shared/types.ts):
AuditLogEntry interface (TYPE ONLY — no store, no UI, no population):
{ id, entityType, entityId, action, fieldChanged?, previousValue?,
  newValue?, performedBy, performedByRole, rationale?, timestamp }
```

#### 9.7 Add Clinician Detail Page Accommodation Tab

Add to ClinicianDetailPage.tsx description:

```
ClinicianDetailPage.tsx — Full profile with sections:
... (existing sections) ...
- Accommodations section: display religiousRestrictions, adaAccommodations,
  pregnancyAccommodation, fmlaLeave (read-only, clearly labeled
  "FEHA Compliance — Layer 1 Hard Constraints")
```

### P2 — Recommended Enhancements

#### 9.8 Worker Disclosure Placeholder

Add a static component or page note:

```
CREATE COMPONENT:
src/policy/shared/components/AdsDisclosureBanner.tsx
- Static banner component (not a full page) that displays:
  "This system uses AI-assisted decision support for staffing
  recommendations. All assignments are subject to qualified human
  review. For questions about how this system affects your scheduling,
  contact [HR/Compliance contact]."
- Render on ClinicianDetailPage (if clinician-facing views are added
  in future phases)
- This satisfies the architectural placeholder for FEHA worker
  disclosure (Requirements line 530)
```

---

## 10. Summary of All Required Actions

| # | Action | Document to Modify | Priority | Effort |
|---|--------|--------------------|----------|--------|
| 1 | Add ADS Classification section to Architecture.md Section 1 | Architecture.md | P0 | Small |
| 2 | Add accommodation fields to Clinician interface in implementation prompt | Architecture.md (prompt section) | P0 | Small |
| 3 | Add `assignmentSource`, `approvalRationale`, `overrideReason` to CareAssignment | Architecture.md (prompt section) | P0 | Small |
| 4 | Add demographic stub fields to Clinician interface | Architecture.md (prompt section) | P0 | Small |
| 5 | Add compliance-specific mock data requirements | Architecture.md (prompt section) | P0 | Small |
| 6 | Add ADS compliance constraints to implementation prompt | Architecture.md (prompt section) | P0 | Small |
| 7 | Fix 4 language violations ("automated" → "assisted/support") | Architecture.md, Planning_Implementation.md, Requirements | P1 | Small |
| 8 | Add AdsDecisionLog type stub | Implementation prompt | P1 | Small |
| 9 | Add AuditLogEntry type stub | Implementation prompt | P1 | Small |
| 10 | Add accommodations section to ClinicianDetailPage spec | Implementation prompt | P1 | Small |
| 11 | Add AdsDisclosureBanner placeholder component | Implementation prompt | P2 | Small |

**Total estimated effort for all corrections: < 2 hours of planning document edits. Zero code changes required (these are all documentation corrections before implementation begins).**

---

## Appendix A: Regulatory Cross-Reference

| Regulation | Key Requirement | Architecture Coverage | Phase 1 Gap? |
|-----------|----------------|----------------------|--------------|
| CA FEHA ADS (eff. Oct 2025) | Bias audit of ADS in employment decisions | Layer 3 designed; demographic fields in Architecture | Implementation prompt omits demographic fields |
| CA FEHA ADS | 4-year ADS record retention | No specific entity; general AuditLog is insufficient | AdsDecisionLog not defined |
| CA FEHA ADS | Reasonable accommodation as hard constraint | Layer 1 accommodation fields fully designed | Implementation prompt omits accommodation fields |
| CA FEHA ADS | Human oversight of ADS decisions | Layer 4 approval fields fully designed | Implementation prompt partially implements |
| CA FEHA ADS | Worker disclosure of ADS use | Requirements line 530 mentions it | No architectural representation |
| EEOC Title VII | Four-fifths rule / disparate impact | Demographic fields + biasFlags designed | Not in implementation prompt |
| 42 CFR §484 | Qualified clinical manager approval | approvedBy field exists | approvalRationale missing from prompt |
| CA Gov. Code §12945 | Pregnancy accommodation | pregnancyAccommodation field designed | Not in implementation prompt |
| ADA | Disability accommodation in scheduling | adaAccommodations field designed | Not in implementation prompt |
| Title VII (religion) | Religious scheduling accommodation | religiousRestrictions field designed | Not in implementation prompt |
| FMLA/CFRA | Leave tracking | fmlaLeave field designed | Not in implementation prompt |

---

## Appendix B: Document Sources Reviewed

| Document | Location | Sections Reviewed |
|----------|----------|-------------------|
| Architecture.md | Builder/UserProfiles/Architecture.md | Sections 1–14, with focus on 2 (entity model), 7 (matching logic), 8 (approval workflow), 10 (audit), 13 (risks), and the implementation prompt (lines 1361–1430) |
| Planning_Implementation.md | Builder/UserProfiles/Planning_Implementation.md | Part 1 (Legal & Regulatory Risks), Part 2 (Gap Analysis), Part 3 (Recommendations), Part 5 (Quick Wins) |
| Requirements v2.0 | Builder/Documentations/Survey-Simulation/Brad2.0/Staffing/Requirements | Section 5 (Legal & Compliance Architecture), Section 6 (Core Data Model), Section 7 (Algorithm), Section 16 (Design Decisions) |

---

*End of FEHA/ADS Compliance Review — Phase 1 Staffing MVP*
