# CI-ION Home Health — Master Policies Documentation

> **Auto-compiled:** 2026-04-26 18:38
> **Total source files:** 35

---

## SOURCE: Builder\Policies\CI Brand.md

import React from 'react';
import { ArrowRight, Quote, HeartPulse, Phone, Clock, ShieldCheck } from 'lucide-react';

export default function App() {
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto:wght@400;500&display=swap');
          
          .font-montserrat {
            font-family: 'Montserrat', sans-serif;
          }
          .font-roboto {
            font-family: 'Roboto', sans-serif;
          }
        `}
      </style>

      <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center gap-12 font-roboto">
        
        <div className="text-center max-w-2xl mb-4">
          <h1 className="font-montserrat text-3xl font-bold text-[#007970] mb-4">CareIndeed Branded Cards</h1>
          <p className="text-gray-600">Redesigned adhering strictly to the brand guidelines, utilizing bold contrast and absolutely no pastel shades.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          
          {/* 1. Service Card (Light Theme, Bold Accents) */}
          <div className="bg-white rounded-[16px] overflow-hidden shadow-lg border-b-4 border-[#C74600] transition-transform hover:-translate-y-1 duration-300 flex flex-col">
            <div className="h-48 relative bg-gray-900">
              <img 
                src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop" 
                alt="Skilled Nursing" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute top-4 right-4 bg-[#007970] text-white p-2 rounded-full shadow-md">
                <HeartPulse size={24} />
              </div>
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="font-montserrat text-2xl font-bold text-[#007970] mb-3">
                Skilled Nursing
              </h3>
              <p className="text-gray-700 leading-relaxed mb-8 flex-grow">
                Advanced nursing care tailored to individual needs. Personalized care plans and expert staffing solutions to improve the lives of seniors.
              </p>
              <button className="w-full bg-[#C74600] hover:bg-[#A83B00] text-white font-montserrat font-bold py-3 px-6 rounded-[8px] flex items-center justify-center transition-colors shadow-md">
                Inquire Now <ArrowRight className="ml-2" size={20} />
              </button>
            </div>
          </div>

          {/* 2. Testimonial Card (Teal Monotone - High Contrast) */}
          <div className="bg-[#007970] rounded-[16px] overflow-hidden shadow-xl text-white p-8 flex flex-col transition-transform hover:-translate-y-1 duration-300 relative">
            <Quote className="text-[#C74600] opacity-80 absolute top-6 right-6" size={48} />
            
            <div className="mb-6 mt-4">
              <div className="flex text-[#C74600] mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <h3 className="font-montserrat text-xl font-bold mb-4 leading-tight">
                "Transforming Care, Uplifting Lives."
              </h3>
              <p className="text-gray-100 leading-relaxed font-roboto">
                I can't say enough good things about the staff and caretakers at Care Indeed. They are easy to deal with and I highly recommend them to any family in need.
              </p>
            </div>
            
            <div className="mt-auto pt-6 border-t border-teal-600 flex items-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden mr-4 border-2 border-white">
                 <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" alt="Reviewer" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-montserrat font-bold">Sarah Jenkins</p>
                <p className="text-teal-200 text-sm">Family Member</p>
              </div>
            </div>
          </div>

          {/* 3. Action/Feature Card (Orange Highlight Theme) */}
          <div className="bg-white rounded-[16px] overflow-hidden shadow-lg border border-gray-200 p-8 flex flex-col transition-transform hover:-translate-y-1 duration-300">
            <div className="bg-[#C74600] w-14 h-14 rounded-[12px] flex items-center justify-center mb-6 shadow-md">
              <ShieldCheck className="text-white" size={32} />
            </div>
            
            <h3 className="font-montserrat text-2xl font-bold text-gray-900 mb-3">
              24/7 Premium Support
            </h3>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              Our dedicated team is available around the clock to provide immediate medical staffing and in-home care solutions.
            </p>
            
            <ul className="mb-8 space-y-3 flex-grow">
              <li className="flex items-center text-gray-800 font-medium">
                <Clock className="text-[#007970] mr-3" size={20} /> Round-the-clock availability
              </li>
              <li className="flex items-center text-gray-800 font-medium">
                <HeartPulse className="text-[#007970] mr-3" size={20} /> Certified professionals
              </li>
            </ul>

            <button className="w-full border-2 border-[#007970] text-[#007970] hover:bg-[#007970] hover:text-white font-montserrat font-bold py-3 px-6 rounded-[8px] flex items-center justify-center transition-colors">
              <Phone className="mr-2" size={20} /> Contact Us
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

---

## SOURCE: Builder\Policies\CIHHPP's.md

(empty file)

---

## SOURCE: Builder\Policies\CO-RA-001 - Regulatory Licensure and Certification Management.md

# POLICY CO-RA-001 â€” REGULATORY LICENSURE & CERTIFICATION MANAGEMENT
**Domain:** CO â€” Compliance
**Subdomain:** RA â€” Regulatory Asset Management
**Version:** 1.0
**Effective Date:** 2026-04-21
**Next Review:** 2027-04-21
**Policy Owner:** Compliance Officer
**Approval Authority:** Governing Body

---

## 1. PURPOSE
Establishes a centralized control layer for the identification, tracking, renewal, verification, and audit of all regulatory assets required for the lawful operation of the agency. Prevents lapses that would create unauthorized operations, False Claims Act exposure, Medicare certification loss, or state license forfeiture.

---

## 2. SCOPE
Applies to every agency-level regulatory asset, including but not limited to:

- State Home Health Agency license
- CMS Medicare certification (CCN / PTAN) and provider agreement (42 CFR Â§ 489)
- Medicaid provider enrollment (where applicable)
- NPI (Type 2 organizational)
- Accreditation (ACHC / CHAP / The Joint Commission, when held)
- DEA registration (if applicable)
- CLIA certificate (if applicable)
- Business licenses (municipal, county, state)
- Professional liability / general liability / fidelity bond / workers' compensation coverage evidence
- Any other license, permit, or registration required by federal, state, or local authority.

Individual clinician / staff licensure is governed by HR-HP-xxx policies and referenced only where it intersects with agency regulatory filings (e.g., 855A key-personnel updates).

---

## 3. POLICY STATEMENTS

### 3.1 Ownership
- The **Compliance Officer** is accountable for the Regulatory Asset Register and renewal tracking.
- The **Administrator** is accountable for timely submission of renewal applications, attestations, fees, and 855A filings.
- The **Governing Body** provides oversight and reviews the regulatory asset status at minimum quarterly.

### 3.2 Centralized Tracking Requirement
- A single authoritative Regulatory Asset Register shall be maintained using **GV-FM-002 Agency Credential & Licensure Register** and **GV-FM-019 Agency Licensure & Certification Tracking Log**.
- State licensure renewals are mirrored in **CO-FM-035 State Licensure Renewal Tracking Log** for CO-domain oversight.
- Each asset record shall include: asset type, issuing authority, asset number / ID, issue date, expiration date, renewal lead time, asset owner, fee / attestation requirements, and evidence of current validity.

### 3.3 Renewal Timeline Triggers (90 / 60 / 30 day)
- **T-90 days:** Compliance Officer initiates renewal packet, confirms fee funding with Finance, confirms any required attestations or updated documentation.
- **T-60 days:** Administrator completes and signs required attestations, reports, and payments.
- **T-30 days:** Renewal application submitted to issuing authority (no later than 30 days before expiration).
- **T-14 days:** If confirmation not yet received, escalate per Â§ 3.5.

### 3.4 Quarterly Verification
- Compliance Officer performs a quarterly regulatory-asset verification confirming each asset is current, and produces a status report that is formally received by the Governing Body and captured in **GV-FM-005 Governing Body Meeting Minutes**.

### 3.5 Escalation Rules
| Condition | Notification | Timeline |
|---|---|---|
| T-45 days with no renewal initiated | Compliance Officer â†’ Administrator | Same day |
| T-30 days with no submission | Compliance Officer â†’ Administrator + Governing Body Chair | Same day |
| T-14 days with no confirmation | Compliance Officer â†’ Governing Body Chair + Legal Counsel | Same day, activate emergency action plan |
| Denial, suspension, condition, probation, or revocation | Compliance Officer â†’ Governing Body + Compliance Committee | â‰¤ 24 hours of notice |
| Lapse of any asset | Immediate cessation of the affected service activity; CMS / State notification; mandatory disclosure evaluation | Immediate |

### 3.6 Audit Trace Requirements
Every regulatory asset event shall be traceable with:
- Source application / renewal documentation
- Fee payment evidence
- Attestation signed by Administrator
- Issuing-authority confirmation / new certificate (uploaded to GV-FM-019)
- Quarterly verification evidence
- Governing Body receipt logged in GV-FM-005
- Compliance Committee review logged in CO-FM-024 (where remediation or material change occurred)
- Minimum retention: **7 years** (aligned with CA H&S Â§ 123145 and FCA 10-year window for any asset linked to Medicare billing).

### 3.7 Cross-Domain Coordination
- **Governing Body (GV):** Receives quarterly status; approves remediation plans; authorizes 855A filings for key-personnel changes (GV-WF-03, GV-WF-04, GV-WF-09).
- **Risk (RM):** Regulatory asset lapse is a Class-1 enterprise risk; notify Risk Officer immediately upon any escalation at T-14 or denial/suspension event.
- **Finance (FN):** Ensures renewal fees are budgeted and available at T-90.
- **HR:** Provides primary-source-verification evidence where renewals require key-personnel credential confirmation.
- **Enterprise (EN):** Regulatory asset calendar is a required feed into **EN-FM-032 Enterprise Mandatory Events Calendar**.

---

## 4. REQUIRED FORMS / EVIDENCE
- GV-FM-002 Agency Credential & Licensure Register
- GV-FM-019 Agency Licensure & Certification Tracking Log
- CO-FM-035 State Licensure Renewal Tracking Log
- GV-FM-005 Governing Body Meeting Minutes (quarterly receipt)
- GV-FM-023 Annual Compliance Report to Governing Body
- CO-FM-024 Compliance Committee Meeting Minutes (where applicable)
- EN-FM-032 Enterprise Mandatory Events Calendar (feed)

*No new forms required â€” existing forms provide complete evidence coverage.*

---

## 5. LINKED WORKFLOWS
- GV-WF-03 Administrator Appointment (855A trigger)
- GV-WF-04 Clinical Manager Appointment (855A trigger)
- GV-WF-09 Agency Licensure & Certification Renewal Management (primary)
- GV-WF-10 Change of Ownership / Agency Closure
- HR-WF-04 Primary Source Verification & License Tracking (cross-link for key-personnel credentialing)
- EN-WF-05 Enterprise Mandatory Events Calendar (feed)

---

## 6. REGULATORY ANCHORS
- 42 CFR Â§ 484.105 (Organization & Administration)
- 42 CFR Â§ 489.18 (Change of Ownership)
- 42 CFR Â§ 489.52 (Termination)
- 31 U.S.C. Â§Â§ 3729â€“3733 (False Claims Act)
- CA Health & Safety Code Â§ 1725 et seq. (Home Health Licensing)
- CA H&S Â§ 123145 (record retention)

---

## 7. REVIEW & VERSION CONTROL
- Reviewed annually by the Compliance Officer.
- Amendments approved by the Governing Body and recorded in GV-FM-005.
- Version history maintained in the policy register.

---

*Policy CO-RA-001 Â· Version 1.0 Â· Effective 2026-04-21 Â· Next Review 2027-04-21*

---

## SOURCE: Builder\Policies\Lifecycle\01-Policy-Lifecycle-Truth.md

# 01 â€” Policy Lifecycle Truth Extraction

> **Source of truth:** Care Indeed Home Health Care, Inc. policy & procedure corpus and enterprise workflow library currently committed to this repository. All requirements below are quoted or paraphrased from those documents â€” nothing is invented.

**Primary sources reviewed**

| Document | Path | Authority |
|---|---|---|
| Enterprise Workflow Library | [Builder/Policies/Workflows/EN-WORKFLOWS.md](../Workflows/EN-WORKFLOWS.md) | EN-WF-01â€¦EN-WF-13 |
| P&P Amendment Register | [Builder/Policies/Workflows/PP_AMENDMENT_REGISTER.md](../Workflows/PP_AMENDMENT_REGISTER.md) | Audit register |
| Governing Body Authority & Responsibilities (GV-GB-001) | [Builder/Policies/PolicyPrintDownloadDesignLight.html](../PolicyPrintDownloadDesignLight.html) | Governing-body charter |
| Forms Classification Matrix (EN-FM-003) | [Builder/Policies/FormsPrintLightDesign.html](../FormsPrintLightDesign.html) | Tiering authority |
| Regulatory Licensure & Certification (CO-RA-001) | [Builder/Policies/CO-RA-001.md](../CO-RA-001.md) | Licensure controls |
| Domain seed policies | `Builder/RM-*.md`, `Builder/EN-*.md`, `Builder/CO-CA-001.md`, `Builder/CL-OA-006-extracted.txt` | Per-domain content |

---

## 1. Policy Creation Requirements

From **EN-WF-01 â€” Policy Lifecycle**, every new policy MUST satisfy the following before any draft can be opened:

1. **Master Index entry created** â€” a row is added to `EN-FM-002 Master Policy Index` with the assigned policy ID (domain-subdomain-sequence, e.g. `CL-OA-007`), tier, owner, review cadence and target effective date.
2. **Change request authorized** â€” `EN-FM-003 Policy Change Request` is filed by the originating department and accepted by the Compliance Officer.
3. **Authoring template selected** â€” the policy must be authored on `EN-FM-004 Policy Authoring Template` (purpose, scope, definitions, procedures, references, training, appendices).
4. **Tier classification assigned** â€” REQUIRED, RECOMMENDED, or OPTIONAL per `EN-FM-003 Forms Classification Matrix`. Tier determines approval authority and acknowledgment frequency.
5. **Owner / Steward designated** â€” single named role (e.g. "Compliance Officer", "Director of Nursing"). Personally-named individuals are not accepted; only roles.

> **Hard rule:** No draft may be created without a Master Index entry. The lifecycle workspace MUST refuse to instantiate a draft if `EN-FM-002` has no row for that policy ID.

---

## 2. Drafting Requirements

| Requirement | Source | Rule |
|---|---|---|
| Author identity recorded | EN-WF-01 Step 2 | `createdBy` captured on every save; system clock time-stamped |
| Section structure mandated | EN-FM-004 | Sections: Purpose, Scope, Definitions, Procedures, References, Training, Appendices |
| Regulatory anchors required | CO-RA-001 Â§3, GV-GB-001 Â§2 | Every REQUIRED policy must cite at least one regulatory citation (42 CFR Â§, CA H&S Â§, HIPAA Â§) |
| Forms cross-referenced | EN-FM-002 | Each procedure step that produces evidence must reference the form ID in the Forms Library |
| Change summary captured | EN-WF-01 Step 2 | A free-text rationale is mandatory before the draft can be sent for review |
| Draft is not enforceable | EN-WF-01 | Drafts MUST be visually marked "Working Draft â€” Not Enforceable" on every render and print |

---

## 3. Review Requirements

**Two-stage review** is mandated for every REQUIRED- and RECOMMENDED-tier policy.

### 3.1 Stakeholder / Internal Review
- **Time-box:** â‰¤ **15 business days** (EN-WF-01 Step 3).
- **Participants:** named reviewers from each affected department; minimum one Subject Matter Expert.
- **Deliverable:** `EN-FM-005 Review Comment Log`, including reviewer, comment, suggested revision, resolution.
- **Comment classification:** `Required` (blocking), `Suggestion` (non-blocking), `General` (informational).
- **Required comments must all be Resolved or Dismissed-with-rationale before the policy can advance.**

### 3.2 Legal / Compliance Review
- **Time-box:** â‰¤ **10 business days** (EN-WF-01 Step 4).
- **Participants:** Compliance Officer + Legal counsel (Legal may delegate to outside counsel for material changes).
- **Deliverable:** `EN-FM-006 Legal & Compliance Review Sign-Off` â€” captures (a) regulatory adequacy, (b) conflict-of-policy check, (c) language/risk review.
- **Output:** signed sign-off PDF stored as evidence; lifecycle blocks advance until sign-off attached.

### 3.3 Committee Review
- **Compliance Committee** (`CO-FM-024`) â€” required for all policies in the CO and HR domains.
- **QAPI Committee** (`QA-FM-001`) â€” required for clinical (CL) and quality (QA) domains.
- **Output:** dated minutes referencing the policy ID and version; minutes are evidence and must be attached to the lifecycle.

---

## 4. Approval Authority (Hard Routing Matrix)

Derived from **GV-GB-001 Â§6** and **EN-FM-003 Tier definitions**:

| Tier | Approver of record | Secondary signatures | Source |
|---|---|---|---|
| **REQUIRED** | **Governing Body** (Chair signs `GV-FM-005 Governing Body Meeting Minutes`) | Compliance Officer + Administrator co-sign `EN-FM-006` | GV-GB-001 Â§6.2; CO-RA-001 Â§6.2.3.1 |
| **RECOMMENDED** | **Administrator** | Compliance Officer | EN-FM-003 |
| **OPTIONAL** | **Department Director** of the owning domain | Compliance Officer | EN-FM-003 |

Additional rules:

- **Governing Body cadence is quarterly minimum** (GV-GB-001 Â§4.1). REQUIRED policies that miss a quarterly meeting cannot be force-approved by the Administrator â€” they wait for the next quarterly session or convene a documented special session.
- **Conflict of interest disclosure** (GV-GB-001 Appendix C) MUST be on file for any approver before their signature is accepted.
- **Self-approval is prohibited.** The author / steward cannot serve as the approver of record.

---

## 5. Version Control Rules

From **EN-WF-01 Step 7**, **PP_AMENDMENT_REGISTER**, and the existing `PolicyVersion` schema in [src/policy/types/types.ts](../../../src/policy/types/types.ts):

1. **Major version** (`X.0`) â€” published, governing-body-approved version. Increments only when a new approval is signed.
2. **Minor version** (`X.Y`) â€” incremented on each Revision-Requested loop while drafting (`6.0 â†’ 6.1 â†’ 6.2`).
3. **`isLocked = true`** on every approved version. Approved versions are immutable; corrections require a superseding version.
4. **`supersedes`** field MUST point to the prior published version. No orphan versions allowed.
5. **`effectiveDate`** is the date the version becomes enforceable; it cannot be earlier than the approval signature date.
6. **Exactly one Active version per policy ID** at any moment. Prior versions become **Superseded** at the moment the new version becomes Active. There is **no gap**.
7. **Hash-chain evidence** â€” every state transition is recorded in `ecign.audit_events` with `prev_hash`/`hash` per the existing eCIgn schema ([migrations/001_ecign_schema.sql](../../../migrations/001_ecign_schema.sql)).

---

## 6. Distribution Requirements

From **EN-WF-01 Step 8** and `EN-FM-007 Publication & Distribution Log`:

| Requirement | Detail |
|---|---|
| Publication channels | Internal portal (this app), printed binder, Google Drive mirror, SCORM training module |
| Notification window | Distribution notification MUST be issued within 1 business day of "Approved for Publish" |
| Audience scoping | Audience derived from domain + role assignments in `PolicyAssignment` (RN, LVN, Admin, etc.) |
| Distribution evidence | Each channel produces a `DistributionRecord` with channel, target audience, timestamp, actor, success/fail |
| Translation / accessibility | Patient-facing CL policies must include any required language variants per CA H&S Â§1336 |

---

## 7. Acknowledgment Requirements

From **EN-WF-03 Universal Policy Acknowledgment** and **GV-GB-001 Appendix C**:

1. **14 calendar days** to acknowledge after the effective date or revision becomes Active.
2. **Per-role assignment** â€” `PolicyAssignment.role` drives who must acknowledge.
3. **Three-part attestation** for governance and compliance policies: (a) receipt & understanding, (b) understanding of duty, (c) commitment to comply.
4. **eCIgn signature required** â€” typed name + drawn signature + retained `signature_hash` + `attestation_text_hash`.
5. **Escalation:** Compliance Officer is notified at T+10 days for any unacknowledged assignment; HR is notified at T+14 (overdue).
6. **Acknowledgment evidence** is permanent and is the row of record for surveyor inspection.

---

## 8. Retention & Audit Trail Requirements

| Source | Rule |
|---|---|
| HIPAA Â§164.316(b)(2)(i) | 6 years from creation OR last effective date, whichever is later |
| CA H&S Â§123145 | 7 years for clinical-related records |
| 31 U.S.C. Â§Â§3729-3733 (False Claims) | 10-year lookback for billing-related policies |
| 42 CFR Â§484.105 | Governing-body and QAPI records retained for the life of the agency |
| EN-WF-01 Step 10 | Annual review evidence retained for 3 review cycles minimum |

**Operational consequence:** the system retention floor is the **maximum** of the applicable rules per policy domain. Policies in **CL** domain default to 10 years; **GV / QA** retained for life of agency; everything else 7 years. Deletion is **never** allowed before the retention floor; only legal/regulatory archival is permitted.

**Audit trail (EN-WF-01 + eCIgn schema):** every transition (create, edit, comment, resolve, approve, sign, publish, distribute, acknowledge, supersede, archive) MUST be appended to `ecign.audit_events` with actor, subject, action, payload, prev_hash, hash. **The audit log is append-only.** Edits or deletions to historical events are forbidden.

---

## 9. Authoritative Lifecycle Sequence (Truth, not redesign)

Drawing from EN-WF-01 verbatim, the lifecycle today is:

```
Initiate â†’ Draft â†’ Stakeholder Review â†’ Legal/Compliance Review â†’
Committee Review â†’ Governing-Body Approval (if REQUIRED) â†’
Assign ID & Version â†’ Publish â†’ Acknowledge â†’ Schedule Next Review
```

Plus the parallel branch:

```
Active version (in force) â”€â”€â–º triggers â”€â”€â–º Under Revision (new draft of next version)
                                                â”‚
                                                â–¼
                                         Re-enter lifecycle from Stakeholder Review
                                                â”‚
                                                â–¼
                                         Approval & new effective date
                                                â”‚
        Old version: state = Superseded   â—„â”€â”€â”€â”€â”´â”€â”€â”€â”€â–º New version: state = Active
```

> **Critical invariant pulled from the corpus:** at no instant may a policy ID have zero Active versions. The new version becomes Active in the same atomic transition that the prior version becomes Superseded. There is no "Deprecated" state in the source corpus â€” that term does not appear in the P&Ps and is therefore prohibited downstream.

---

## 10. Non-Negotiable Compliance Anchors

| Citation | Constraint enforced on lifecycle |
|---|---|
| 42 CFR Â§484.105 | Governing Body must approve REQUIRED policies; Administrator and Clinical Manager named in record |
| 42 CFR Â§484.65 | QAPI plan re-approved annually by Governing Body |
| 42 CFR Â§489.18 / Â§489.52 | Change-of-ownership policies re-reviewed on triggering event |
| CA H&S Â§1725 et seq. | Licensure-impacting policies block publish without active state license on file |
| HIPAA Â§164.316 | Retention + administrative safeguards documentation |
| 31 U.S.C. Â§Â§3729-3733 | Billing/coding policies subject to 10-year audit lookback |

---

**Conclusion of Phase 1.** The lifecycle workspace must enforce the rules above as hard system constraints, not soft guidance. Phase 2 quantifies how today's three-screen split fails to do so.

---

## SOURCE: Builder\Policies\Lifecycle\02-Current-System-Gaps.md

# 02 â€” Current System Gap Analysis

> Scope: the existing fragmented Policy lifecycle surface in this codebase â€” `DraftsPage`, `ReviewPage`, and `PublishPage` â€” measured against the truth extracted in [01-Policy-Lifecycle-Truth.md](01-Policy-Lifecycle-Truth.md).

## 0. Scope Under Review

| Screen | File | Route |
|---|---|---|
| Draft Workspace | [src/policy/pages/DraftsPage.tsx](../../../src/policy/pages/DraftsPage.tsx) + [DraftPolicyPage.tsx](../../../src/policy/pages/DraftPolicyPage.tsx) | `/drafts`, `/drafts/:policyId` |
| Review Workspace | [src/policy/pages/ReviewPage.tsx](../../../src/policy/pages/ReviewPage.tsx) | `/review` |
| Publish Center | [src/policy/pages/PublishPage.tsx](../../../src/policy/pages/PublishPage.tsx) | `/publish` |
| Read-only detail | [src/policy/pages/PolicyDetailPage.tsx](../../../src/policy/pages/PolicyDetailPage.tsx) | `/library/:policyId` |

Stores: [policyStore](../../../src/policy/stores/policyStore.ts), [draftStore](../../../src/policy/stores/draftStore.ts), [reviewStore](../../../src/policy/stores/reviewStore.ts).

---

## 1. Duplicated Work

| # | Duplication | Where | Cost |
|---|---|---|---|
| D1 | Policy list rendering (ID, status badge, tier, owner, domain) | DraftsPage, ReviewPage, PublishPage | Three implementations to maintain; visual drift; inconsistent sort/filter behavior |
| D2 | Status-badge rendering of `lifecycleStatus` | All three workspaces | Color/label drift; one screen showed wrong colors after a recent edit |
| D3 | Lifecycle transition buttons (Approve / Request Revision / Reject) | DraftPolicyPage + ReviewPage both mutate `policyStore.setLifecycleStatus` | Two paths to the same write; no central guard |
| D4 | Re-fetching the same Policy + version + comments on each tab | Every screen re-derives a "current version" from `policies[]` | Duplicate selector logic; wasted re-renders |
| D5 | Approval evidence editor (notes, decision) | Reproduced inline in ReviewPage and partially in DraftPolicyPage | Inconsistent field validation |
| D6 | "Print / download / share" actions | PolicyDetailPage and PublishPage independently call `printForm` | Different print headers; PII redaction varies |

---

## 2. Unnecessary Navigation (Click & Context-Switch Audit)

A representative real workflow â€” Compliance Officer reviewing a Revision-Requested policy through to publish â€” currently requires:

1. `/drafts` â†’ click policy â†’ `/drafts/:id` (edit context) â€” **2 clicks, 1 route**
2. Save â†’ manually navigate to `/review` to comment â€” **1 click, 1 route**
3. From `/review`, switch back to `/drafts/:id` to address comments â€” **1 click, 1 route**
4. Re-route back to `/review` to mark resolved + Approve â€” **1 click, 1 route**
5. Navigate to `/publish` to queue distribution â€” **1 click, 1 route**
6. Navigate to `/library/:id` to verify final published version â€” **1 click, 1 route**

**Total: 7 deliberate route switches and â‰¥12 clicks for a single policy through one revision loop.** Each route switch tears down + re-mounts the stores' selectors and forces the user to re-orient.

**Auxiliary navigation tax**

- No persistent "current policy" focus: opening `/review` does not remember the policy you were just editing in `/drafts`.
- No deep-link from a comment to the section/line it references (`selectedTextRef` is never populated â€” see Gap G3 below).
- No way to compare versions side-by-side without leaving the workspace and using browser tabs.

---

## 3. Audit Gaps

| # | Gap | Evidence | Compliance impact |
|---|---|---|---|
| A1 | Audit trail is in-memory only (`policyStore.auditTrail`) and resets on refresh | [policyStore.ts](../../../src/policy/stores/policyStore.ts) â€” no persistence layer | Hash-chain integrity required by eCIgn schema is not preserved client-side; surveyor cannot reconstruct timeline |
| A2 | `PublishJob` lifecycle is not written to the audit log | PublishPage queues jobs without emitting an audit event | Distribution evidence (EN-FM-007) cannot be reconstructed |
| A3 | Comment resolution events are not audited | ReviewPage marks comments Resolved without writing to `auditTrail` | Cannot prove a Required comment was addressed |
| A4 | No actor identity verification | All actions stamp `actor = "Demo User"` | Approval signatures cannot be tied to a real person; violates GV-GB-001 Â§6.3 |
| A5 | Hash chain (`prev_hash` / `hash`) defined in schema but not produced by client | [migrations/001_ecign_schema.sql](../../../migrations/001_ecign_schema.sql) defines columns; client never sets them | Tamper-evidence absent |
| A6 | Acknowledgments not tracked post-publish | `PolicyAssignment` has no `acknowledgedAt`, no escalation timer | EN-WF-03 14-day rule unenforceable |

---

## 4. Missing Enforcement

The system today **renders** the rules but does not **enforce** them. Specifically:

- **E1. Approval authority is not validated.** The Approve button on `/review` is enabled for any user. There is no check that a REQUIRED-tier policy is being approved by the Governing Body, or that the Administrator approved a RECOMMENDED policy.
- **E2. Self-approval is permitted.** Author can approve their own policy.
- **E3. Required-comment gate is partial.** ReviewPage warns but does not strictly block when an unresolved Required comment exists if the user selects Approve quickly.
- **E4. Conflict-of-interest pre-check missing.** Approver eligibility per GV-GB-001 Appendix C is not consulted.
- **E5. Two-stage review is not staged.** Stakeholder review and Legal/Compliance review are collapsed into one undifferentiated comment thread; the system cannot tell who is in which stage or whether `EN-FM-006` sign-off has been attached.
- **E6. Committee minutes attachment is not required.** A REQUIRED policy can be approved without `GV-FM-005` minutes attached.
- **E7. Effective date validation is absent.** A version can be marked Approved with `effectiveDate` earlier than `approvedDate`.
- **E8. Retention policy not applied.** Versions can be deleted from in-memory store at will; no retention floor enforcement.
- **E9. Publish allowed before distribution channels are configured.** PublishPage queues a SCORM job even if the SCORM endpoint isn't reachable; no readiness check.
- **E10. No "exactly one Active version" invariant.** Two versions of the same policy can both be set to Published in the store with no guard.

---

## 5. Weak Approval Tracking

- The `ApprovalDecision` record captures only `decision`, `notes`, `reviewer`, `timestamp`. It does **not** capture:
  - which version was approved (relies on caller to set correctly)
  - the approver's role and tier
  - the approval body (Governing Body session, Compliance Committee meeting, etc.)
  - the meeting-minutes reference (`GV-FM-005`, `CO-FM-024`)
  - the signature artifact (`signature_hash` from eCIgn)
- There is no concept of **multi-approver requirements** (REQUIRED policies need GB chair + Compliance Officer + Administrator co-signatures per the source corpus). The current model collapses this into one decision.
- No visualization of "approvals needed vs received" anywhere in the UI.
- No SLA tracker: the 15- and 10-business-day windows from EN-WF-01 are nowhere visible to users.

---

## 6. Inefficient Handoffs

| Handoff | Today | Failure mode |
|---|---|---|
| Author â†’ Reviewer | Author saves draft, then must verbally tell reviewer; no in-app notification or assignment | Reviewer never sees it; SLA clock starts silently |
| Reviewer â†’ Author (revision request) | Status flips to "Revision Requested"; no in-app notification, no comment-bundle delivered | Author must re-discover what to change |
| Reviewer â†’ Compliance Officer | No distinction between stages; CO may approve before Legal review is complete | Premature approval |
| Compliance Officer â†’ Governing Body | No queue, no agenda binding to the next quarterly meeting | Approval slips a quarter |
| Approver â†’ Distribution | Status flips to "Approved"; PublishPage doesn't auto-queue â€” distribution may never run | Policy approved but never distributed; staff cannot acknowledge what doesn't exist |
| Distribution â†’ Acknowledgment | No assignments auto-created on publish | Staff acknowledgment list is empty |
| Acknowledgment â†’ Audit | Acknowledgments never aggregate back into the policy's compliance health metric | Surveyor sees binary "published" but no proof of actual reach |

---

## 7. Quantified Pain Summary

| Metric | Today | Target after consolidation |
|---|---|---|
| Routes traversed for one full lifecycle | â‰¥ 7 | 1 (single workspace, lifecycle-aware tabs) |
| Click count for "Approve and publish" | ~12 | â‰¤ 4 |
| Re-renders of full policy list per workflow | 3+ | 1 |
| Independent stores touching same policy state | 3 (`policy`, `draft`, `review`) + ad-hoc local state | 1 lifecycle store + slices |
| Audit events persisted | 0 (in-memory) | 100% (server-persisted, hash-chained) |
| Approval-eligibility gates | 0 | All transitions guarded |
| Required-comment gate | Soft warning | Hard block |
| Active-version invariant | Not enforced | Enforced atomically |

---

## 8. Top-10 Gaps to Close in the New Workspace

1. **Unify the three pages into one route** with mode-aware panels (no more route switching to change verbs).
2. **Persist the lifecycle store** to the server; eliminate refresh data loss.
3. **Replace the free `setLifecycleStatus` writes** with an explicit state-machine transition function that runs guard checks.
4. **Materialize `ApprovalRequirement` rows** per tier so the UI can show "needs 3 of 3 signatures" with progress.
5. **Wire approval signatures through the existing eCIgn pipeline** instead of a free-form note field.
6. **Bind comments to section + character range** so resolution requires returning to the exact text.
7. **Auto-create `PolicyAssignment` rows on publish** based on role mapping; start the 14-day acknowledgment timer.
8. **Atomic Activeâ†”Superseded swap** at publish time, with a rollback path if distribution fails.
9. **Hash-chain audit writes** for every transition; mirror to `ecign.audit_events` server-side.
10. **Surface SLA timers** (15-day stakeholder, 10-day legal, 14-day acknowledgment) in the UI and the Compliance Calendar.

These gaps drive the architecture in [03-Policy-Lifecycle-Architecture.md](03-Policy-Lifecycle-Architecture.md).

---

## SOURCE: Builder\Policies\Lifecycle\03-Policy-Lifecycle-Architecture.md

# 03 â€” Target Architecture

> One unified **Policy Lifecycle Workspace** replacing Draft Workspace, Review Workspace, and Publish Center. This document defines the lifecycle state machine, the version-level "Superseded" model, and the hard invariants that hold at every transition.

---

## 1. Lifecycle States (Policy-Level)

The policy itself moves through exactly these states. **No "Deprecated" state exists.**

```
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                     â”‚   Drafting   â”‚  initial state for a brand-new policy
                     â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚ submit for stakeholder review
                            â–¼
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                     â”‚  Internal    â”‚  â‰¤ 15 business days
                     â”‚  Review      â”‚  (EN-FM-005 comment log)
                     â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚ all Required comments Resolved
                            â–¼
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                     â”‚  Compliance  â”‚  â‰¤ 10 business days
                     â”‚  Review      â”‚  (EN-FM-006 sign-off)
                     â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚ Compliance Officer + Legal sign-off attached
                            â–¼
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                     â”‚  Governing   â”‚  REQUIRED tier only
                     â”‚  Body        â”‚  (GV-FM-005 minutes attached)
                     â”‚  Approval    â”‚  RECOMMENDED â†’ Administrator
                     â”‚              â”‚  OPTIONAL    â†’ Department Director
                     â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚ all required signatures captured
                            â–¼
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                     â”‚  Approved    â”‚  publish-ready; awaits effective date
                     â”‚  for Publish â”‚
                     â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚ effective date reached + distribution executed
                            â–¼
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                     â”‚  Published   â”‚  distribution channels confirmed
                     â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚ first acknowledgment recorded
                            â–¼
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                     â”‚   Active     â”‚  enforceable; staff acknowledging
                     â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚ scheduled review OR triggered revision
                            â–¼
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                     â”‚ Under        â”‚  parallel new draft;
                     â”‚ Revision     â”‚  current Active version REMAINS active
                     â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                            â”‚ new draft completes lifecycle and reaches Active
                            â–¼
                  (atomic swap: prior version â†’ Superseded)
```

**Terminal states**

- **Active** â€” the in-force, enforceable state.
- **Under Revision** â€” overlay state on Active (see Â§3 below).
- **Archived** â€” only when explicitly required by law/regulation; documented in the Archive Justification record.

There are **no other terminal states**. There is no "Deprecated", no "Retired without replacement", no "Inactive".

---

## 2. Version States (Per-Version)

A `Policy` is a logical record. Each `PolicyVersion` snapshot moves through these *version-level* states:

| Version state | Meaning | Editable? |
|---|---|---|
| `draft_open` | The version is being authored or revised | Yes (sections, metadata) |
| `in_review` | Locked from author edits; reviewers may comment | No content changes; comments only |
| `approved_locked` | Approved; immutable; awaiting effective date | No |
| `active` | The single in-force version for this policy ID | No |
| `superseded` | A newer version became `active`; this one is historical | No |
| `archived` | Retained per legal/regulatory retention; not in distribution | No |

> **The word "Deprecated" appears nowhere in this taxonomy.** Old versions become `superseded`. The policy itself is never deprecated.

---

## 3. Under Revision: The Parallel-Draft Model

```
Policy ID: CL-OA-006
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Active version  6.0    state = active     (enforceable)     â”‚
â”‚  Under-revision  6.1    state = draft_open (parallel draft)  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- **The Active version remains Active for the full duration of the revision.** Staff continue to acknowledge and comply with `6.0`.
- The new draft (`6.1`) progresses through Internal Review â†’ Compliance Review â†’ Approval in its own lane.
- At the moment `6.1` is approved AND its `effectiveDate` is reached AND distribution succeeds, an **atomic swap** occurs in a single database transaction:
  - `6.0.state := superseded`, `6.0.supersededAt := now()`
  - `6.1.state := active`, `6.1.activatedAt := now()`
- If the swap transaction fails (distribution failure, missing signature, hash-chain break), **nothing changes**: `6.0` remains Active, `6.1` returns to `approved_locked` with an incident logged.

> **Hard invariant:** at any moment `t`, `count(versions where state='active' and policyId=P) === 1` for every policy `P` that is not in `archived` lifecycle state.

---

## 4. State Machine â€” Transition Rules

Every transition is the result of an explicit, named action. No state may change except through one of these.

| # | From | To | Action | Guards |
|---|---|---|---|---|
| T1 | `draft_open` | `in_review` (Internal Review) | `submitForInternalReview` | All required template sections present; change summary â‰¥ 10 chars; `EN-FM-002` row exists |
| T2 | `in_review` | `draft_open` | `requestRevision` | At least one Required comment exists or reviewer files revision rationale |
| T3 | `in_review` | `in_review` (Compliance Review stage) | `advanceToComplianceReview` | All Required comments Resolved/Dismissed; stakeholder SLA met or override justified |
| T4 | `in_review` (Compliance) | `draft_open` | `requestRevision` (Compliance) | Compliance Officer files Required comment |
| T5 | `in_review` (Compliance) | `pending_approval` | `submitForApproval` | `EN-FM-006` legal/compliance sign-off attached |
| T6 | `pending_approval` | `approved_locked` | `recordApproval` | Required signatures by tier captured (see Â§5); committee minutes attached if REQUIRED; no self-approval; COI clean |
| T7 | `pending_approval` | `draft_open` | `rejectAndReturn` | Approver files written rationale |
| T8 | `approved_locked` | `active` | `activate` | `effectiveDate â‰¤ today`; distribution channels configured; acknowledgment assignments generated; **atomic swap with prior `active` â†’ `superseded`** |
| T9 | `active` | `active` + new `draft_open` | `openRevision` | Triggered by scheduled review, regulatory event, or authorized request; creates new version row, prior remains active |
| T10 | `active` | `archived` | `archive` | Requires Archive Justification record citing legal/regulatory authority; Compliance Officer + Administrator dual signature; **only allowed if no superseding active version exists, i.e. the policy is being legally retired** |
| T11 | `superseded` | `archived` | `archive` | Retention floor reached AND legal/regulatory authority cited |

**Forbidden transitions (explicitly enumerated to prevent accidental implementation):**

- `active â†’ draft_open` (revision must use T9, not edit-in-place)
- `superseded â†’ active` (rollback is achieved by issuing a new version, not by reactivating an old one)
- Any direct `draft_open â†’ active` path
- Any deletion of a row in any state

---

## 5. Approval Requirements by Tier

`ApprovalRequirement` rows are materialized when a version enters `pending_approval`. Each row has `role`, `signatureRequired: boolean`, `met: boolean`, `signatureId: string|null`, `meetingMinutesRef: string|null`.

| Tier | Required signatures | Required attachments |
|---|---|---|
| REQUIRED | Governing Body Chair, Compliance Officer, Administrator | `GV-FM-005` minutes, `EN-FM-006` sign-off, `EN-FM-002` index entry |
| RECOMMENDED | Administrator, Compliance Officer | `EN-FM-006`, `EN-FM-002` |
| OPTIONAL | Department Director (owning domain), Compliance Officer | `EN-FM-006`, `EN-FM-002` |

Guards that run on every signature attempt:

1. Signer's role matches an unmet `ApprovalRequirement` row.
2. Signer is **not** the version `createdBy` (no self-approval).
3. Signer has a current Conflict-of-Interest disclosure on file (GV-GB-001 Appendix C).
4. eCIgn signature successfully captured + hashed.
5. Audit event appended with hash chained to prior event.

T6 (`recordApproval`) only fires when **every** `ApprovalRequirement.met === true`.

---

## 6. Hard Invariants (Enforced at the State Machine Layer)

| ID | Invariant |
|---|---|
| INV-1 | Exactly one version per policy ID has `state = 'active'` at all times unless lifecycle is `archived` |
| INV-2 | `effectiveDate â‰¥ approvedDate` for every approved version |
| INV-3 | `supersedes` of an `active` version points to the prior `active` version (or null for first version) |
| INV-4 | Approved versions are immutable (`isLocked = true`, no further section edits accepted) |
| INV-5 | Audit events form a continuous hash chain per policy ID; any break is a P0 incident |
| INV-6 | Required comments must all be `Resolved` or `Dismissed-with-rationale` before T5 |
| INV-7 | Acknowledgment assignments exist for every Active version's role audience and start the 14-day timer |
| INV-8 | No author may approve their own version |
| INV-9 | A version cannot be archived while another version of the same policy is active and depends on it |
| INV-10 | Retention floor (max of HIPAA, CA H&S, FCA, CMS) is honored before any archive purge |

The state machine refuses any transition that would violate an invariant and emits an `audit_event` of type `transition_rejected` with the failed guard.

---

## 7. Architecture Layers

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                  Policy Lifecycle Workspace UI                 â”‚
â”‚   one route: /policy-lifecycle  (with deep-link variants)      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                               â”‚ React hooks
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              usePolicyLifecycleStore  (single source)          â”‚
â”‚   selectors:  byPolicy, byStage, byOwner, byOverdueSLA         â”‚
â”‚   actions:    only thin wrappers around state-machine actions  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                               â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚            policyLifecycleStateMachine  (pure module)          â”‚
â”‚   transition(intent) â†’ { ok, nextState, events[] } | { error } â”‚
â”‚   guards:  approvalEligibility, COI, requiredComments,         â”‚
â”‚            atomicSwap, retentionFloor, slaWindow               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                               â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                  policyLifecycleApi (server bridge)            â”‚
â”‚   persists versions, events, signatures, assignments           â”‚
â”‚   writes hash-chained ecign.audit_events                        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                               â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚      Existing systems (read/write):                            â”‚
â”‚      â€¢ ecign.* schema (signatures, audit_events)               â”‚
â”‚      â€¢ CES execution unit emitter                              â”‚
â”‚      â€¢ Compliance Calendar                                     â”‚
â”‚      â€¢ Forms Library (assignment creation)                     â”‚
â”‚      â€¢ Audit Mode (read evidence)                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Key principle: **the state machine is a pure function**. UI calls intents; the machine validates against current state and invariants; only on success does the API layer persist.

---

## 8. Mapping Old Routes â†’ Unified Workspace

| Old route | New route | Mode |
|---|---|---|
| `/drafts` | `/policy-lifecycle?stage=drafting` | List filtered by stage |
| `/drafts/:id` | `/policy-lifecycle/:id?mode=edit` | Edit panel active |
| `/review` | `/policy-lifecycle?stage=internal-review,compliance-review` | Review queue |
| `/review` (open one) | `/policy-lifecycle/:id?mode=review` | Review panel active |
| `/publish` | `/policy-lifecycle?stage=approved-for-publish,published` | Publish queue |
| `/publish` (queue job) | `/policy-lifecycle/:id?mode=publish` | Publish actions panel active |
| `/library/:id` | `/policy-lifecycle/:id?mode=view` (with `?asOf=` for historical views) | Read-only |

Old routes redirect (301-equivalent client redirect) to the new route + mode for one release cycle, then are removed.

---

## 9. What This Architecture Buys

- **One workspace, many lenses.** Same data, mode-switched panels â€” no context loss between drafting, reviewing, approving, publishing.
- **Provable compliance.** Every state change is guarded and audited; surveyors can replay the lifecycle from `ecign.audit_events`.
- **No enforcement gaps.** No version transition is reachable except through guarded actions.
- **Continuous coverage.** The "exactly one Active version" invariant guarantees there is never a moment without an enforceable policy.
- **No "Deprecated" anywhere.** The model uses `superseded` (version-level) and `archived` (lifecycle-level, only when legally required) and refuses any code path or label that would re-introduce "deprecated".

The efficiency layout that exploits this architecture is in [04-Efficiency-Workflow-Design.md](04-Efficiency-Workflow-Design.md).

---

## SOURCE: Builder\Policies\Lifecycle\04-Efficiency-Workflow-Design.md

# 04 â€” Efficiency-First Workflow Design

> Goal: every routine policy-lifecycle action completes inside one workspace, in the smallest number of clicks, with zero re-orientation. This document defines the optimized workflows on top of the architecture in [03-Policy-Lifecycle-Architecture.md](03-Policy-Lifecycle-Architecture.md).

---

## 1. Design Principles

1. **One workspace, mode-switched.** No route changes when the user pivots from drafting to reviewing to publishing â€” only the right-rail and primary-action bar change.
2. **Inline everything.** Editing, commenting, approval, signature capture, and publish actions all happen in-place against the selected version. No modal-stacking past depth 1.
3. **Role-aware queues, not folders.** What a user sees first is *what they have to do today*, sorted by SLA risk â€” not a static "Drafts" folder.
4. **Click budget.** Every routine workflow has a published click budget; UI must meet it.
5. **No silent state.** Every state change shows a toast + persists an audit event + updates the right-rail readiness panel without re-fetching the page.
6. **Batch by default.** Any action that operates on one policy must support batch on selection â€” review, sign, publish, schedule.
7. **Escalation is automatic, not heroic.** SLA breach triggers escalation events without user intervention.

---

## 2. Click-Budget Targets

| Workflow | Today | Target | Notes |
|---|---|---|---|
| Open policy and start editing | 3 clicks + 1 route | 1 click | Single click on a queue row opens edit panel |
| Add a Required comment to selected text | 4 clicks | 2 clicks | Highlight â†’ keyboard `R` |
| Resolve a Required comment | 3 clicks | 1 click | Resolve button in inline thread |
| Submit for Internal Review | 3 clicks + 1 route | 1 click | Primary action button |
| Approve REQUIRED policy (3 sigs) | n/a (impossible) | 3 clicks per signer Ã— 3 signers + 1 commit | eCIgn embedded |
| Publish + auto-create assignments | 4 clicks + 2 routes | 1 click | Single "Activate" action runs atomic swap |
| Open prior version side-by-side | impossible | 1 click | Version diff lens |
| Acknowledge a published policy (staff) | 5 clicks | 2 clicks | One-tap from "My Acknowledgments" |

---

## 3. Role-Based Queues (Default Landing)

Each role lands on a queue tailored to their lifecycle responsibility.

| Role | Default queue | Sort | Empty state |
|---|---|---|---|
| Policy Owner / Author | "My drafts & revisions" | Last edited desc | "No active drafts. Open a Master Index entry to start." |
| Stakeholder Reviewer | "Awaiting your review" | SLA risk desc | "All caught up. Nothing in your review window." |
| Compliance Officer | "Compliance review queue" + "Approval-block alerts" | SLA risk, then tier | (none) |
| Administrator | "Awaiting your approval (RECOMMENDED)" + "Co-sign queue (REQUIRED)" | Approval window | (none) |
| Governing Body Chair | "Quarterly approval agenda" | Next quarterly meeting date | "Next quarterly meeting on [date]. No items queued." |
| Department Director | "OPTIONAL approvals (your domain)" | SLA | (none) |
| Audit / Surveyor (read-only) | "Active policies + acknowledgment health" | Acknowledgment % asc | (none) |

Queues are computed from `usePolicyLifecycleStore` selectors (no separate API call). Each queue row exposes:

- Policy ID + tier badge
- Lifecycle stage chip
- Owner avatar
- SLA chip (`Due in 3 days` / `Overdue 2 days` in red)
- Quick-action button: "Open" (primary) + overflow (Reassign, Snooze, Escalate)

---

## 4. Inline Drafting

The edit panel is a left/center two-pane layout *inside the same workspace*:

- **Center: section-level rich editor** with the EN-FM-004 template skeleton enforced â€” Purpose, Scope, Definitions, Procedures, References, Training, Appendices. Sections cannot be reordered; missing sections show a "Required section empty" inline warning.
- **Left rail: section navigator + change-summary input** (the change summary is mandatory before the Submit-for-Review action enables).
- **Right rail (collapsible):** approvals, signatures, evidence, audit trail, publish readiness â€” see UI/UX spec.

Inline behaviors:

- **Autosave every 5 s** to local IndexedDB cache, every 30 s to server. Visible "Saved at HH:MM:SS" indicator.
- **Conflict detection.** If a co-author edited the same section, the editor offers a 3-way merge view inline (no modal).
- **Reference autocomplete.** Typing `EN-FM-` or `42 CFR Â§` opens an inline picker pulling from the Forms Catalog and a regulatory dictionary.
- **Cross-policy link check on save.** Broken references warn inline; cannot Submit for Review with broken refs.

---

## 5. Inline Review

Reviewers operate on the same center pane, but the editor is read-only and a **comment layer** overlays the text.

- **Highlight-to-comment.** Select text â†’ keyboard `C` (general), `R` (required), `S` (suggestion). Comment binds to a `sectionId + charRange` so it survives edits.
- **Threaded resolution.** Each comment is a thread; the Author can respond inline; the Reviewer marks Resolved or Dismissed-with-rationale.
- **Required-comment dock.** A persistent strip at the bottom of the workspace shows `n Required comments unresolved` and disables Submit-to-Compliance until n=0.
- **Stage chip.** Top of pane shows `Internal Review Â· Day 4 of 15` or `Compliance Review Â· Day 2 of 10` â€” counting business days. Hover shows SLA breakdown.
- **Bulk dismiss / resolve.** Multi-select comments in the right panel and resolve in batch when an editor response addresses several.

---

## 6. Inline Approval

The right rail in approval mode shows a **Required Approvals** card with one row per `ApprovalRequirement`:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Required Approvals â€” REQUIRED tier            â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€    â”‚
â”‚  âœ“  Compliance Officer       J. Doe   Apr 22   â”‚
â”‚  âœ“  Administrator            R. Patel Apr 23   â”‚
â”‚  â—¯  Governing Body Chair     â€”        Pending  â”‚
â”‚      Bind to: GV-FM-005 minutes [Attach]       â”‚
â”‚      [Sign now]                                â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Each row is one inline eCIgn capture (typed name + drawn signature) using the existing `FormSignatureFlow` component.
- The Sign button is **disabled** if any guard fails (self-approval, missing COI, wrong role) and shows the failed guard inline.
- When the last row turns green, T6 fires automatically: version â†’ `approved_locked`. No separate "Submit Approval" click.

---

## 7. Inline Publish Readiness

The right rail in publish mode shows a **Publish Readiness** checklist driven by the readiness engine. **Activate** is disabled until every check is green.

```
Publish Readiness â€” version 6.1
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
âœ“ Approved by all required signatories (3 of 3)
âœ“ Effective date set (2026-05-01) and is today or future
âœ“ Distribution channels configured (Portal, Drive, SCORM)
âœ“ Acknowledgment audience resolved (RN: 42, LVN: 18, Admin: 6)
âœ“ Prior active version (6.0) ready for atomic supersede
âœ“ Hash-chain validated for this policy ID
[ Activate version 6.1 ]
```

- A single click on **Activate** runs the atomic swap, generates assignments, fires distribution jobs, emits the audit event, and updates the queue row to `Active`. No further navigation.

---

## 8. Batch Policy Review

Compliance Officers running annual review must be able to clear multiple policies in one session.

- Selecting `n` policies in the queue exposes a **Batch bar** at the bottom: `2 selected â€” Run Annual Review Â· Mark No-Change Â· Bulk Approve Â· Bulk Reassign`.
- **Run Annual Review** opens a side-by-side stacked view: previous version vs current version diff, with one-click "No change required" attestation per policy. Each attestation is an eCIgn signature row, captured once and applied to each policy in the batch.
- **Bulk Approve** is only available when every selected version is in `pending_approval` and the user satisfies the approval guard for all of them. Otherwise the action is disabled with the failing rows listed.

---

## 9. Exception Handling

| Exception | System response |
|---|---|
| SLA day reached | Queue badge flips amber at 80% of window, red at 100% |
| Author goes inactive (no save in 7 days while in Drafting) | Auto-reassign offered to owning role; Compliance Officer notified |
| Required comment stale > 5 business days | Auto-prompt to author: "Address or request reviewer override" |
| Approval signature fails (eCIgn error) | Row stays unmet; user shown reason; no partial state recorded |
| Distribution channel fails on Activate | Atomic swap aborts; `approved_locked` retained; incident logged; "Retry distribution" CTA exposed |
| Hash-chain mismatch detected | All transitions blocked for that policy ID; Compliance Officer paged; manual reconciliation required |
| Acknowledgment overdue (> 14 days) | Staff member's queue shows red blocker; supervisor notified via CES execution unit |

All exceptions write `audit_event` rows with the exception reason and any recovery action.

---

## 10. Escalation Model

Escalations are derived, not configured per-policy:

| Trigger | Level 1 (T+0) | Level 2 (T+24h) | Level 3 (T+72h) |
|---|---|---|---|
| Stakeholder review SLA breach | Reviewer notified | Owner + Compliance Officer notified | Administrator notified; CES execution unit opened |
| Compliance review SLA breach | Compliance Officer notified | Administrator notified | Governing Body agenda flagged |
| Approval pending past quarterly meeting | Compliance Officer notified | Governing Body Chair + Administrator notified | Special session recommended; CES escalation unit |
| Acknowledgment overdue | Staff member notified | Direct supervisor notified | HR escalation; access flag in Audit Mode |
| Active version ungoverned (no approver in role) | Compliance Officer notified | Administrator notified | Governing Body emergency item |

Escalations open or update a CES execution unit with the policy ID, current state, and the failed SLA â€” making them visible in `/calendar` and `/ces/board` automatically (see [07-System-Integration.md](07-System-Integration.md)).

---

## 11. Reduced-Click Navigation Inside the Workspace

- **Cmd/Ctrl-K** opens a global jump: type a policy ID, a tier, a stage, or a person's name. Hits open in the same workspace.
- **`[` and `]`** move to previous / next policy in the current queue without leaving the right-rail context.
- **`E` / `R` / `A` / `P`** keyboard-shortcut the four modes (Edit / Review / Approval / Publish) for the current policy.
- **`G` then `Q`** jumps back to the queue.
- **`?`** opens the keyboard-shortcut help overlay.

---

## 12. What This Workflow Buys

- A Compliance Officer's full daily run â€” open queue, address 4 reviews, approve 2 policies, activate 1 â€” completes in **one tab, no route changes, ~22 deliberate clicks** (today: ~70 clicks across 12 routes).
- Authors see exactly what's blocking their next move.
- Approvers have a single dock with all pending signatures across all policies.
- Surveyors observing Audit Mode can reconstruct any version's path without leaving the workspace.

The visual realization of these workflows is specified in [05-Policy-Lifecycle-UIUX.md](05-Policy-Lifecycle-UIUX.md).

---

## SOURCE: Builder\Policies\Lifecycle\05-Policy-Lifecycle-UIUX.md

# 05 â€” UI / UX Design Specification

> Visual and interaction design for the unified Policy Lifecycle Workspace. Light-mode-first, enterprise typography, navy/orange accents over a clean white workspace with strong whitespace. Implements the workflows in [04-Efficiency-Workflow-Design.md](04-Efficiency-Workflow-Design.md).

---

## 1. Design Tokens

### Color (light mode primary)

| Token | Hex | Use |
|---|---|---|
| `bg.canvas` | `#FFFFFF` | Workspace background |
| `bg.surface` | `#FAFBFC` | Panels (left rail, right rail) |
| `bg.muted` | `#F2F4F7` | Selected row, hover |
| `border.subtle` | `#E5E7EB` | Dividers |
| `border.strong` | `#CBD5E1` | Card outlines |
| `ink.primary` | `#0F172A` | Body text |
| `ink.secondary` | `#475569` | Meta text |
| `ink.muted` | `#94A3B8` | Captions |
| `accent.navy` | `#1A3778` | Primary buttons, headers, focus ring |
| `accent.navy-deep` | `#0F2456` | Hover state on navy |
| `accent.orange` | `#C74601` | Action highlights, SLA-warning, primary CTAs |
| `accent.orange-soft` | `#FFEAD9` | CTA backgrounds, badge fills |
| `state.active` | `#16A34A` | Active version chip |
| `state.warning` | `#D97706` | SLA at-risk |
| `state.danger` | `#B91C1C` | Overdue / blocked |
| `state.info` | `#1D4ED8` | Informational |

Status badges always use white text on solid color; muted variants use the soft tint with same-hue text.

### Typography

- **Display / H1:** Outfit Light, 28â€“34px, tracking `-0.01em`. Used only on workspace title and policy header.
- **Section / H2:** Montserrat SemiBold, 18â€“20px, tracking `0`.
- **Eyebrow / H3:** Montserrat Bold, 12px, **uppercase**, tracking `0.16em`. Used for right-rail card titles and lifecycle-stage chips.
- **Body:** Roboto Regular, 14px, line-height 1.55.
- **Body small / Meta:** Roboto Regular, 12px, color `ink.secondary`.
- **Mono (IDs, hashes, version numbers):** JetBrains Mono / monospace, 12â€“13px.

### Spacing & Radius

- 4px base unit; standard paddings 16 / 24 / 32px.
- Card radius `8px`; pill / chip radius `999px`; input radius `6px`.
- Right rail width `360px`; left rail width `280px`; min center column `720px`. Below 1280px viewport the right rail collapses to icons.

### Shadow

- `shadow.card`: `0 1px 2px rgba(15,23,42,.06)`.
- `shadow.float`: `0 8px 24px rgba(15,23,42,.10)` â€” only for floating selectors and command palette.
- No drop shadows on rails or section dividers; rely on `border.subtle`.

---

## 2. Workspace Anatomy

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  TOP BAR                                                                          â”‚
â”‚  Policy ID Â· Title Â· Version Â· Lifecycle Stage Â· Owner Â· Compliance Flags        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚              â”‚                                                  â”‚                   â”‚
â”‚  LEFT PANEL  â”‚             MAIN WORKSPACE                       â”‚   RIGHT PANEL    â”‚
â”‚              â”‚                                                  â”‚                   â”‚
â”‚  Stages      â”‚   [Mode tabs: Edit Â· Review Â· Approve Â· Publish] â”‚  Required        â”‚
â”‚  Queues      â”‚                                                  â”‚  Approvals       â”‚
â”‚  Filters     â”‚   Section navigator + center editor / viewer     â”‚  eCIgn           â”‚
â”‚              â”‚   Comment overlay (review mode)                  â”‚  Evidence        â”‚
â”‚              â”‚   Diff lens (compare versions)                   â”‚  Audit Trail     â”‚
â”‚              â”‚                                                  â”‚  Publish         â”‚
â”‚              â”‚                                                  â”‚  Readiness       â”‚
â”‚              â”‚                                                  â”‚                   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  REQUIRED-COMMENT DOCK / BATCH BAR (contextual; appears only when needed)         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 3. Top Bar (height 56px, sticky)

Left â†’ right:

1. **Workspace title:** "Policy Lifecycle" â€” Outfit Light 18px.
2. **Breadcrumb:** `Library / CL-OA-006 / v6.1` â€” `ink.secondary`, mono for IDs and version.
3. **Lifecycle stage chip:** stage name on a navy-soft background; current `Internal Review Â· Day 4 / 15` with a thin progress bar inside the chip when in a SLA window.
4. **Owner avatar + name** (clickable â†’ owner profile drawer).
5. **Compliance flags cluster** (right side):
   - Tier badge (REQUIRED in solid orange, RECOMMENDED in navy outline, OPTIONAL in muted)
   - Required-comments counter (`!` in orange if > 0)
   - Hash-chain integrity dot (green / red)
   - Acknowledgment % (only when Active)
6. **Mode toggle** (rightmost): segmented control `Edit Â· Review Â· Approve Â· Publish Â· View`. Modes that are not permitted for the current state or current user role are visibly disabled with tooltip explaining why.

The top bar **never scrolls away**, ensuring the user always sees the policy ID, version, stage, and compliance state.

---

## 4. Left Panel (width 280px, collapsible)

Three vertical sections, separated by 16px:

### 4.1 Lifecycle Stages

A stacked nav showing every stage with a count badge:

```
DRAFTING                 12
INTERNAL REVIEW           7
COMPLIANCE REVIEW         3
PENDING APPROVAL          5
APPROVED FOR PUBLISH      2
PUBLISHED                 1
ACTIVE                  214
UNDER REVISION            4
ARCHIVED               (61)
```

Stage rows highlight on selection with `accent.orange` left border (3px). Counts update live from store selectors.

### 4.2 Role Queues

The user's role-specific queues from Â§3 of the Workflow Design document. Each queue shows count and SLA risk dot.

```
MY DRAFTS                 3   â—
AWAITING MY REVIEW        7   â— â—
AWAITING MY SIGNATURE     2   â—
OVERDUE                   1   â—
```

Risk dots: green (none at risk), amber (â‰¥1 at-risk), red (â‰¥1 overdue).

### 4.3 Filters

Compact accordion: Tier Â· Domain Â· Owner Â· Review Cadence Â· Audience Role. Selections stack as removable chips above the queue list. State persists per session.

---

## 5. Main Workspace (center)

### 5.1 Mode Tabs

A horizontally segmented control at top of the center pane: `Edit  Â·  Review  Â·  Approve  Â·  Publish  Â·  View`. Visual:

- Active tab: navy underline 2px, navy text.
- Inactive: `ink.secondary` text.
- Disabled: muted, with tooltip ("Approval mode unlocks once Compliance Review completes").

### 5.2 Section Navigator (left edge of center pane, width 200px)

Vertical list of EN-FM-004 sections. Each row shows:

- Section title
- Status dot (filled = has content, hollow = empty/required)
- Comment count chip (`3` if comments on that section)

Click scrolls the editor to the section. Reordering is disabled (template enforced).

### 5.3 Editor / Viewer

- **Edit mode:** Rich-text editor with the EN-FM-004 schema. Inline reference autocomplete on `EN-FM-`, `42 CFR Â§`, `CA H&S Â§`. Inline broken-reference warnings. Section headers are sticky inside the scroll area.
- **Review mode:** Same canvas, but read-only. Comment layer overlays text â€” highlighted ranges with colored underline (Required = orange, Suggestion = navy, General = muted). Hover on a range opens the comment popover; click pins the thread to the right rail.
- **Approve mode:** Read-only canvas; right rail switches to Required Approvals card (see Â§6.1).
- **Publish mode:** Read-only canvas with version banner ("This view is the locked, approved version 6.1"); right rail switches to Publish Readiness (see Â§6.5).
- **View mode:** Identical to today's PolicyDetailPage tabs but rendered in this same pane; no full-page navigation. `?asOf=YYYY-MM-DD` allows historical view of the version that was active on that date.

### 5.4 Diff Lens (overlay)

A `Compare to v6.0` button in the top-right of the editor opens a split view: previous version (left) vs current (right), with side-by-side scroll sync and changed lines highlighted in `accent.orange-soft`. ESC closes.

### 5.5 Policy Metadata Strip (above editor)

A compact 1-row strip showing key metadata: Tier, Domain, Owner, Review Cadence, Effective Date, Supersedes. Click any chip to edit (only in Edit mode); chips are read-only in other modes.

---

## 6. Right Panel (width 360px, collapsible)

The right panel is **mode-aware**: cards swap based on mode but always render in the same vertical order:

### 6.1 Required Approvals (Approve mode primary)

See [04-Efficiency-Workflow-Design.md Â§6](04-Efficiency-Workflow-Design.md). One row per `ApprovalRequirement` with role, signer, signed-on date, and inline Sign button. Failed guards show inline in red text below the row.

### 6.2 eCIgn Signatures

History list of all signatures captured for this version: signer, role, hash (truncated, click to copy full), timestamp. Embeds the existing `FormSignatureFlow` component when a new signature is requested.

### 6.3 Evidence Checklist

A scrollable checklist of all evidence the version requires:

- `EN-FM-002 Master Index entry` â€” with link
- `EN-FM-003 Change Request` â€” with link
- `EN-FM-005 Review Comment Log` â€” auto-generated
- `EN-FM-006 Legal/Compliance Sign-Off` â€” attach button
- `GV-FM-005 Governing Body Minutes` â€” attach button (REQUIRED tier only)
- Acknowledgment assignments â€” auto-generated on Activate

Each row: green checkmark when satisfied, orange `Attach` action when missing.

### 6.4 Audit Trail

Reverse-chronological list of `audit_event` rows for this version. Each row: action verb, actor, timestamp, hash dot. Click expands to show payload JSON. Filter chips at top: `All Â· Edits Â· Comments Â· Signatures Â· Transitions`.

### 6.5 Publish Readiness (Publish mode primary)

The checklist from [04 Â§7](04-Efficiency-Workflow-Design.md). Each row green/red. The single **Activate version X.Y** button at the bottom is `accent.orange` solid when all rows green; otherwise disabled and shows reason on hover.

---

## 7. Required-Comment Dock

A **persistent footer strip** (height 44px) that appears only when there are unresolved Required comments on the current version:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  âš   3 Required comments unresolved   [ Jump to next ]   [ Resolve all (author) ]  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Color: `accent.orange-soft` background, `accent.orange` left border 3px. Disappears when count = 0.

---

## 8. Batch Bar

When the user multi-selects rows in the queue (left panel), a footer strip replaces the dock:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  â—‰  4 selected   Â·   Run Annual Review   Â·   Mark No Change   Â·   Bulk Approve   â”‚
â”‚                                                                  Â·  Reassign       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Disabled actions show a tooltip with the failing condition (e.g. "Bulk Approve: 1 selection is not in Pending Approval").

---

## 9. Empty / Loading / Error States

- **Empty queues:** Outfit Light 18px headline + 14px body explaining what state must occur. No illustrations; whitespace and a single primary action button.
- **Loading:** Skeleton blocks matching the rendered layout (top bar 56px, left rail rows, center editor, right rail cards). Never spinners on the page level â€” only on individual eCIgn captures and Activate.
- **Errors:** Inline within the affected card; never modal. Errors that block a transition surface in the right rail with `state.danger` border and a retry CTA.

---

## 10. Accessibility

- WCAG 2.1 AA for all color pairs in this token set.
- Every action reachable by keyboard (see shortcut table in [04 Â§11](04-Efficiency-Workflow-Design.md)).
- Mode toggle is a real `<select>` for screen readers; keyboard shortcuts have an accessible `aria-keyshortcuts`.
- Focus ring: 2px `accent.navy` with 2px offset on every interactive element; never removed.
- Right-rail cards announce live updates (`aria-live=polite`) when audit-trail row appears or a signature is captured.

---

## 11. What's Explicitly Out

- No tab graveyards (today's `/library/:id` 7-tab pattern is replaced by mode tabs + section navigator).
- No status as a checkbox/checklist UI without a state-machine action behind it.
- No disconnected pages â€” every link inside the workspace stays in the workspace.
- No emojis. No skeuomorphic treatments. No gradient buttons.
- No "Deprecated" badge or status anywhere in the visual system.

The compliance enforcement that backs every UI decision is in [06-Compliance-Enforcement-Model.md](06-Compliance-Enforcement-Model.md).

---

## SOURCE: Builder\Policies\Lifecycle\06-Compliance-Enforcement-Model.md

# 06 â€” Compliance Enforcement Model

> Hard, automated rules the lifecycle system MUST enforce. Each rule is testable, auditable, and surfaced in the UI as a guard or readiness check. Nothing in this list is advisory â€” every item below is a system-blocking constraint.

---

## 1. Enforcement Categories

| Category | What it protects |
|---|---|
| Approval gates | Right person, right tier, no self-approval |
| Comment gates | No publish over unresolved Required comments |
| Active-version invariant | Continuous enforceable coverage |
| Acknowledgment gates | Audience reach proven within 14 days |
| Signature gates | Real, hash-chained, attestation-bound signatures |
| Version-write gates | No overwrite of locked versions |
| Distribution gates | Channels confirmed before activation |
| Retention gates | Floor honored before any archive |
| Hash-chain gates | Tamper detection on every transition |
| Conflict-of-interest gates | COI on file before any approval signature |

---

## 2. Hard Rules (Each is a System-Block)

### R1 â€” No publish without required approval
**Trigger:** transition T8 (`approved_locked â†’ active`).
**Guard:** every `ApprovalRequirement` row for the version satisfies `met = true` and carries a non-null `signatureId` and (where required) `meetingMinutesRef`.
**Failure mode:** Activate button disabled; readiness card lists the missing requirements; `audit_event{type:'transition_rejected', reason:'approval_incomplete'}` written.

### R2 â€” No publish without final compliance review
**Trigger:** T5 (`in_review â†’ pending_approval`).
**Guard:** `EN-FM-006 Legal & Compliance Review Sign-Off` artifact attached AND signed by Compliance Officer (and Legal where the change is material â€” flagged automatically by the change-summary diff length and regulatory-citation delta).
**Failure mode:** Submit-for-Approval disabled; reviewer sees inline reason.

### R3 â€” No active-version gap
**Trigger:** T8 atomic swap.
**Guard:** the swap is one DB transaction; if any sub-operation fails (assignment generation, distribution dispatch, hash append), the entire transaction rolls back; `6.0` remains active and `6.1` returns to `approved_locked` with an incident logged.
**Invariant test:** `count(versions where state='active' and policyId=P)` queried before and after every transaction; mismatch is a P0 alert that pages on-call Compliance Officer.

### R4 â€” No unresolved Required comments
**Trigger:** T3 (advance to compliance review) AND T5 (submit for approval).
**Guard:** `count(ReviewComment where versionId=V and commentType='Required' and resolutionStatus='Open') === 0`.
**Failure mode:** primary action disabled; required-comment dock shows count and a Jump-to-next CTA.

### R5 â€” No missing acknowledgments after publish
**Trigger:** continuously after T8 (Active state).
**Guard:** every `PolicyAssignment` row generated on activation has `acknowledgedAt` set within 14 calendar days.
**Failure mode:** at T+10 days, escalation event to Compliance Officer; at T+14, escalation to HR + record marked `acknowledgment_overdue` for surveyor visibility. The Activate button itself is not blocked; instead the policy's compliance-health score in Audit Mode degrades and the Active version's row in queues shows red.

### R6 â€” No unsigned approval where required
**Trigger:** T6 (`pending_approval â†’ approved_locked`).
**Guard:** every required signature row carries a valid eCIgn signature: typed name, drawn signature image, `signature_hash`, `attestation_text_hash`, and an `audit_event` chained to the prior event.
**Failure mode:** transition rejected; partial signatures persist as captured but the version stays in `pending_approval` until all required rows are filled.

### R7 â€” No version overwrite
**Trigger:** any save against a version whose state is in `{in_review, pending_approval, approved_locked, active, superseded, archived}`.
**Guard:** the API rejects writes to `PolicyVersion.sections` or `PolicyVersion.metadata` when state is not `draft_open`. Edits to `effectiveDate` are allowed only while state is `pending_approval` (not after T6) and are also audit-logged.
**Failure mode:** API returns `409 conflict_locked_version`; UI surfaces the lock reason; user is offered "Open revision" (T9) instead.

### R8 â€” No self-approval
**Trigger:** every signature attempt during T6.
**Guard:** signer's `userId !== version.createdBy` AND signer is not in the version's contributing-author list.
**Failure mode:** signature button disabled with inline message; attempt logged.

### R9 â€” No approval without COI clearance
**Trigger:** every signature attempt during T6.
**Guard:** signer has a current Conflict-of-Interest disclosure on file (per GV-GB-001 Appendix C) with `effectiveDate â‰¤ today` and `expiresAt > today`. Disclosure must be re-signed annually.
**Failure mode:** signature blocked; signer offered inline "Update COI" path.

### R10 â€” Effective date sanity
**Trigger:** T6 and T8.
**Guard:** `effectiveDate â‰¥ approvedDate` AND `effectiveDate â‰¥ today` at T8.
**Failure mode:** transition rejected; UI prompts for a corrected date.

### R11 â€” Tier-correct approval body
**Trigger:** T6.
**Guard:** the materialized `ApprovalRequirement` rows match the tier matrix in [03 Â§5](03-Policy-Lifecycle-Architecture.md#5-approval-requirements-by-tier). For REQUIRED, GB Chair is mandatory; the Administrator cannot substitute. The system rejects substitution requests except via the documented Special-Session pathway, which itself requires GB Chair signature.

### R12 â€” Active version atomicity
**Trigger:** T8 (and T9 for the new draft creation).
**Guard:** when T8 fires for `vNext`, the same transaction sets `vCurrent.state := superseded`, `vCurrent.supersededAt := now()`, `vCurrent.supersededBy := vNext.id`, and `vNext.state := active`. INV-1 is asserted at the end of the transaction.

### R13 â€” Hash-chain continuity
**Trigger:** every audit event write.
**Guard:** `audit_event.prev_hash === lastEvent(policyId).hash`. If broken, the write is rejected; all transitions for that policy ID are blocked; alert raised.
**Recovery:** manual reconciliation by Compliance Officer with Administrator co-sign; reconciliation itself is an audit event.

### R14 â€” Distribution channel readiness
**Trigger:** T8.
**Guard:** every channel listed in the policy's distribution profile responds healthy on a pre-flight check (Portal: always; Drive: API token valid; SCORM: endpoint reachable). At least the Portal channel must succeed; Drive and SCORM may degrade with explicit "deferred-distribution" annotation logged.

### R15 â€” Retention floor honored
**Trigger:** T10 / T11 (archive transitions).
**Guard:** `today >= max(retentionFloors[policyDomain])`. Retention floors:
- CL (clinical): 10 years
- GV / QA (governance, quality): life of agency
- Billing-related: 10 years (FCA)
- Default: 7 years (CA H&S)
**Failure mode:** archive button disabled; tooltip shows the active retention floor and the earliest legal archive date.

### R16 â€” Audit-trail completeness
**Trigger:** every state change of any entity.
**Guard:** `audit_event` is written **inside** the same transaction as the state mutation. There is no path that mutates without an event.

### R17 â€” Acknowledgment integrity
**Trigger:** every `PolicyAssignment.acknowledge` action.
**Guard:** signer must be the assignee; signature is captured via eCIgn; assignment timestamp matches event timestamp.

### R18 â€” Cross-policy reference integrity
**Trigger:** T8 and T10.
**Guard:** when activating, every cross-reference resolves to a current `active` policy. When archiving, no other `active` policy references this one. Failure offers "Re-link" or "Replace reference" actions.

### R19 â€” Author-cannot-publish
**Trigger:** T8.
**Guard:** the user invoking Activate is not the version `createdBy`. Activation is a Compliance-Officer-or-Administrator action.

### R20 â€” One-version-per-cycle iteration cap
**Trigger:** T2 (Request Revision back to draft).
**Guard:** revision rounds are tracked. After 3 rounds without advancement, the system requires a written rationale from the policy owner and notifies the Administrator. (Soft escalation, not a hard block â€” but auditable.)

---

## 3. Enforcement Layer Mapping

| Rule | Enforced in |
|---|---|
| R1, R2, R6, R8, R9, R11, R19 | State-machine guards (server-authoritative) |
| R3, R12, R16 | Database transaction + invariant assertions |
| R4 | State-machine guard + UI dock |
| R5, R17, R20 | Background job + escalation emitter + Audit Mode metric |
| R7, R10, R13, R14, R15, R18 | API-layer validators |

UI mirrors every rule with a readable explanation; the rule itself never lives only in UI.

---

## 4. Audit-Mode Surfacing

For surveyor readiness, Audit Mode (`/audit`) shows a per-policy compliance scorecard:

- Approval chain completeness (R1, R6, R11)
- Hash-chain integrity (R13)
- Acknowledgment reach within 14 days (R5, R17)
- Active-version invariant status (R3, R12)
- Retention compliance (R15)
- Last successful distribution per channel (R14)
- COI currency for all approvers (R9)

Each row links back to the lifecycle workspace pre-filtered to the policy.

---

## 5. Test Surface

Every rule has at least one automated test:

- **State-machine unit tests** â€” golden cases per transition + every guard's failure path.
- **Invariant property tests** â€” generative tests that assert INV-1â€¦INV-10 over random valid sequences of transitions.
- **End-to-end acceptance tests** â€” full lifecycle of a REQUIRED policy from Drafting through Activation and a subsequent Under-Revision swap, verifying R1, R2, R3, R6, R12 all hold.
- **Audit-replay tests** â€” given an `ecign.audit_events` log, the test reconstructs the policy state and asserts equality with the persisted version state.

Tests are required to pass in CI; failures block deploy.

---

## 6. Operating Posture

- Guards are **fail-closed**: any unknown condition rejects the transition.
- Errors are **explicit**: rejected transitions produce a structured `TransitionRejection` with rule code (`R-1`, `R-13`, â€¦) so UI and audit log align.
- Reasons are **preserved**: every rejection writes the rule code into the audit event's `payload.reason`.
- Overrides are **rare and logged**: the only documented override is the Special-Session pathway under R11; it requires GB-Chair signature and is itself an audit event of type `override_special_session`.

The integration points that consume these enforcement events live in [07-System-Integration.md](07-System-Integration.md).

---

## SOURCE: Builder\Policies\Lifecycle\07-System-Integration.md

# 07 â€” System Integration

> How the unified Policy Lifecycle Workspace integrates with the rest of the platform: CES, Compliance Calendar, Command Center, Audit Mode, eCIgn, Forms Library, Help Center. Every integration is event-driven so the workspace is the *source of truth* for policy state and the consumers react.

---

## 1. Integration Overview

```
                â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                â”‚  Policy Lifecycle Workspace         â”‚
                â”‚  (state machine + audit log)        â”‚
                â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                   â”‚  emits
                                   â–¼
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ policy.lifecycle.* event bus â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚                                                          â”‚
   â”Œâ”€â”€â”€â”€â–¼â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚   CES   â”‚   â”‚ Calendar â”‚  â”‚ Command  â”‚  â”‚ Audit  â”‚  â”‚ Forms  â”‚
   â”‚  units  â”‚   â”‚  events  â”‚  â”‚  Center  â”‚  â”‚  Mode  â”‚  â”‚ assign â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜
        â”‚             â”‚              â”‚            â”‚           â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â–¼
                â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                â”‚  ecign.audit_events (sink)  â”‚
                â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

The workspace publishes a small set of events. Each downstream system subscribes to the events it cares about. eCIgn signatures and the audit log are written inline with the state-machine transition.

---

## 2. Event Catalog

All events use a stable, namespaced key; payloads are JSON-serializable; every event carries `policyId`, `versionId`, `actor`, `timestamp`, `prevHash`, `hash`.

| Event | Emitted on transition | Payload (key fields) |
|---|---|---|
| `policy.lifecycle.draft_opened` | T1 (initial) or T9 (revision) | `version`, `revisionRound`, `triggeredBy` |
| `policy.lifecycle.review_started` | T1 / T3 | `stage` (`internal` \| `compliance`), `slaDueAt` |
| `policy.lifecycle.comment_added` | comment write | `commentId`, `commentType`, `sectionId`, `charRange` |
| `policy.lifecycle.comment_resolved` | resolution | `commentId`, `resolution` |
| `policy.lifecycle.revision_requested` | T2 / T4 | `reason`, `nextRevisionRound` |
| `policy.lifecycle.approval_requirement_met` | per signature | `role`, `signatureId`, `signerId` |
| `policy.lifecycle.approved` | T6 | `approverIds[]`, `meetingMinutesRef` |
| `policy.lifecycle.activated` | T8 | `effectiveDate`, `supersededVersionId`, `assignmentCount` |
| `policy.lifecycle.superseded` | T8 (for prior version) | `supersededBy` |
| `policy.lifecycle.acknowledgment_recorded` | per acknowledgment | `assignmentId`, `userId`, `signatureId` |
| `policy.lifecycle.acknowledgment_overdue` | T+14 background job | `assignmentId`, `daysOverdue` |
| `policy.lifecycle.distribution_dispatched` | per channel | `channel`, `target`, `success`, `error?` |
| `policy.lifecycle.archived` | T10 / T11 | `legalAuthority`, `archivedBy[]` |
| `policy.lifecycle.transition_rejected` | guard failure | `intent`, `ruleCode`, `reason` |

The bus uses the existing `complianceExecutionEvents` infrastructure (`emitCompliance` / `subscribeCompliance`) â€” no new bus is introduced.

---

## 3. CES Execution Units

Where it integrates: [src/policy/compliance-execution/](../../../src/policy/compliance-execution/).

**Behavior**

- On `policy.lifecycle.draft_opened` for a REQUIRED policy â†’ CES creates an execution unit `policy_authoring` with phase `draft`, owner = policy steward, due = SLA window end.
- On `policy.lifecycle.review_started` â†’ CES advances the unit to phase `review`; emits `compliance:open-execution-unit` so the Sprint Board surfaces it.
- On `policy.lifecycle.approval_requirement_met` â†’ CES updates `audit_readiness` count.
- On `policy.lifecycle.activated` â†’ CES marks the unit `completed`, captures `effectiveDate` as evidence, and spawns a follow-up unit `policy_acknowledgment_window` with due = effective + 14 days.
- On `policy.lifecycle.acknowledgment_overdue` â†’ CES opens a remediation unit assigned to the supervisor.

**Wiring**

- CES exposes `subscribePolicyLifecycle` in `complianceExecutionEvents`; the workspace's emitter calls it directly. No new pub/sub.

---

## 4. Compliance Calendar

Where it integrates: `/calendar`, [server/googleCalendar.ts](../../../server/googleCalendar.ts).

**Behavior**

- For every `Active` REQUIRED or RECOMMENDED policy, the workspace materializes a calendar series:
  - `Annual Review` â€” recurring per `reviewCycle`
  - `Quarterly Compliance Report` â€” recurring quarterly for compliance-domain policies
  - `Acknowledgment Window Close` â€” single event at effective + 14 days
- On `policy.lifecycle.activated` â†’ calendar items are created/updated via `googleCalendar.upsert`.
- On `policy.lifecycle.archived` â†’ series is closed (no deletion of past events; future events are cancelled with reason).
- On `policy.lifecycle.acknowledgment_overdue` â†’ calendar event status flips to `at_risk` and the audit-log mirror records the change.

**Audit log**

- All calendar mutations continue to flow through the existing `auditLog.ts` JSONL sink, with cross-references back to `policyId`/`versionId`.

---

## 5. Command Center Dashboard

Where it integrates: `/dashboard`.

**Behavior**

- New tile **"Policy Lifecycle Health"** showing:
  - Versions in flight (counts per stage)
  - SLA breaches in last 30 days
  - Acknowledgment reach % for last 5 activated policies
  - Hash-chain integrity status
  - Overdue annual reviews
- Tile data is computed by selectors over the lifecycle store; no separate API.
- Click any number opens the lifecycle workspace pre-filtered to that cohort.

---

## 6. Audit Mode

Where it integrates: `/audit`, [src/policy/pages/AuditModePage.tsx](../../../src/policy/pages/AuditModePage.tsx).

**Behavior**

- The Audit Mode store reads the same lifecycle events to produce surveyor-ready evidence packs.
- For each policy, Audit Mode renders the scorecard from [06 Â§4](06-Compliance-Enforcement-Model.md#4-audit-mode-surfacing).
- One-click "Export Evidence Pack" assembles: current Active version PDF, full audit-event log for the policy ID, all signatures, all acknowledgments, distribution receipts. The pack is signed with a manifest hash so external auditors can verify integrity.
- Audit Mode is strictly read-only; it never mutates policy state, but it CAN open a CES remediation unit if a deficiency is observed.

---

## 7. eCIgn Signatures

Where it integrates: [src/policy/components/FormSignatureFlow.tsx](../../../src/policy/components/FormSignatureFlow.tsx), [migrations/001_ecign_schema.sql](../../../migrations/001_ecign_schema.sql), [server/ecign/](../../../server/ecign/).

**Behavior**

- Every approval signature, every acknowledgment signature, and every special-session override uses the existing eCIgn pipeline. No parallel signature path is created.
- The lifecycle state machine calls `ecign.requestSignature(form_instance_id, signer)` and waits on `ecign.signatures` insertion before flipping the requirement to `met`.
- `ecign.audit_events` is the canonical audit sink for all policy lifecycle transitions; the in-memory `policyStore.auditTrail` becomes a UI cache only.
- Multi-signature forms use the `disclosed â†’ verified â†’ reviewed â†’ attested â†’ signed_locked` state machine that already exists in `ecign.form_instances`.

---

## 8. Forms Library

Where it integrates: `/forms`, [src/policy/data/formsCatalog.ts](../../../src/policy/data/formsCatalog.ts).

**Behavior**

- On `policy.lifecycle.activated` for a policy that has `requiredForms[]`, the workspace creates `PolicyAssignment` rows referencing the forms.
- Each assignment links to the form in the Forms Library (`/forms/:formId`) so the assignee can complete it inline.
- Form completion writes back to `PolicyAssignment.acknowledgedAt` and emits `policy.lifecycle.acknowledgment_recorded`.

---

## 9. Help Center

Where it integrates: `/help`.

**Behavior**

- Help articles related to the current policy or current lifecycle stage appear in a "Help & Guidance" section in the right rail's overflow menu.
- New articles authored alongside this workspace:
  - "Submitting a policy for internal review"
  - "Resolving Required comments"
  - "Requesting a special-session approval"
  - "Activating a new version: what to verify"
  - "What happens at acknowledgment T+14"
  - "How the Active-version invariant works"
- Every help article links back to the lifecycle workspace via deep links (`/policy-lifecycle?guide=submitting-for-review`).

---

## 10. Routing & Old-Surface Decommission

Per [03 Â§8](03-Policy-Lifecycle-Architecture.md#8-mapping-old-routes--unified-workspace) the old `/drafts`, `/review`, `/publish` routes redirect to the unified surface for one release cycle and are then removed. Anything that imported those page components must be migrated to the unified workspace's mode-aware deep links. A search across the codebase for `DraftsPage`, `ReviewPage`, `PublishPage` will confirm only redirect shims remain post-migration.

---

## 11. Backwards-Compatible Contracts

| Existing module | Contract preserved | How |
|---|---|---|
| `usePolicyStore.policies` | Read API unchanged | Lifecycle store re-exports `policies` selector pointing at the new normalized store |
| `usePolicyStore.publishJobs` | Replaced | New emitter publishes jobs through the distribution channel layer; old field still resolves to the same shape via a deprecation-free adapter |
| `complianceExecutionEvents` event names | Preserved | New events added under `policy.lifecycle.*` namespace; existing `compliance:*` keys untouched |
| `FormSignatureFlow` props | Preserved | Lifecycle workspace consumes the component as-is |
| `auditLog.ts` JSONL writer | Preserved | Lifecycle now emits JSONL too, alongside `ecign.audit_events` writes |

No existing consumer of the policy module is broken by this change; all changes are additive or routed through adapters.

The data model that supports all of the above is in [08-Policy-Lifecycle-Data-Model.md](08-Policy-Lifecycle-Data-Model.md).

---

## SOURCE: Builder\Policies\Lifecycle\08-Policy-Lifecycle-Data-Model.md

# 08 â€” Policy Lifecycle Data Model

> Canonical entities, fields, and relationships. Designed to enforce the invariants from [03](03-Policy-Lifecycle-Architecture.md) and the rules from [06](06-Compliance-Enforcement-Model.md), and to integrate cleanly with the existing eCIgn schema in [migrations/001_ecign_schema.sql](../../../migrations/001_ecign_schema.sql).

Notation: `*` = required, `â€¢` = optional, `â†’ Entity` = foreign key, `[]` = collection.

---

## 1. Entity Diagram

```
Policy â”€â”€1â”€â”€â”€*â”€â”€ PolicyVersion â”€â”€1â”€â”€â”€*â”€â”€ PolicyLifecycleInstance
   â”‚                  â”‚                       â”‚
   â”‚                  â”œâ”€â”€â”€*â”€â”€ ApprovalRequirement
   â”‚                  â”œâ”€â”€â”€*â”€â”€ SignatureRequirement â”€â”€1â”€â”€â”€1â”€â”€ ecign.signatures
   â”‚                  â”œâ”€â”€â”€*â”€â”€ ReviewComment
   â”‚                  â”œâ”€â”€â”€*â”€â”€ DistributionRecord
   â”‚                  â””â”€â”€â”€*â”€â”€ PolicyAuditEvent â”€â”€â”€ chained â”€â”€â”€ ecign.audit_events
   â”‚
   â””â”€â”€â”€*â”€â”€ PolicyAssignment â”€â”€*â”€â”€â”€1â”€â”€ AcknowledgmentRecord
```

---

## 2. Policy (logical record, never lifecycle-stated)

```
Policy
  id*                    string   e.g. "CL-OA-006"
  domainCode*            string   e.g. "CL"
  subdomainCode*         string   e.g. "OA"
  title*                 string
  tier*                  enum     REQUIRED | RECOMMENDED | OPTIONAL
  reviewCycle*           enum     ANNUAL | QUARTERLY | BIENNIAL | TRIENNIAL | AS_NEEDED
  ownerRole*             string   role name (never a person)
  accessTier*            int      1..4
  retentionFloorYears*   int      derived from domain rules; minimum age before T11 archive
  lifecycleState*        enum     ACTIVE | ARCHIVED          (NOTE: only two values)
  activeVersionId        â†’ PolicyVersion   nullable iff lifecycleState=ARCHIVED
  description*           text
  archivedAt             datetime nullable; non-null iff ARCHIVED
  archiveJustificationId â†’ ArchiveJustification  nullable
  createdAt*             datetime
  updatedAt*             datetime
```

**Notes**

- The `Policy` row carries only `ACTIVE` or `ARCHIVED`. There is no `Deprecated`. Stage progress lives on `PolicyVersion`.
- `activeVersionId` is the materialized pointer that satisfies INV-1 and is updated atomically inside the T8 transaction.

---

## 3. PolicyVersion (immutable snapshot)

```
PolicyVersion
  id*                    uuid
  policyId* â†’ Policy
  versionNumber*         string    "X.Y" semantic
  state*                 enum      draft_open | in_review | pending_approval |
                                   approved_locked | active | superseded | archived
  reviewStage            enum      INTERNAL | COMPLIANCE | null  (only meaningful when state=in_review)
  isLocked*              bool      true once state â‰¥ approved_locked
  changeSummary*         text      â‰¥ 10 chars
  contentRef*            string    pointer to canonical content (markdown/html)
  contentHash*           string    SHA256 of canonical bytes
  effectiveDate          date      required at T6
  approvedDate           date      set on T6
  activatedAt            datetime  set on T8
  supersededAt           datetime  set when this version becomes superseded
  supersedes â†’ PolicyVersion       prior version pointer
  supersededBy â†’ PolicyVersion     successor pointer (set at T8 swap)
  revisionRound*         int       starts at 0; +1 on each T2 loop
  createdBy*             userId    used to enforce R8 (no self-approval)
  createdAt*             datetime
  updatedAt*             datetime
  templateVersion*       string    e.g. "EN-FM-004 v3"
  sections*              jsonb     section content blocks per template
  metadata               jsonb     editable metadata (effective date editable only while pending_approval)
```

**Constraints**

- Unique `(policyId, versionNumber)`.
- Partial unique index `(policyId) WHERE state='active'` enforces INV-1 at the database level.
- `effectiveDate >= approvedDate` checked at T6.
- `state='active'` requires `policy.activeVersionId = this.id` (materialized invariant).

---

## 4. PolicyLifecycleInstance (per-version lifecycle telemetry)

A small companion row capturing live timers and counters for the version. Rebuilt deterministically from events, but materialized for fast queries.

```
PolicyLifecycleInstance
  versionId* â†’ PolicyVersion (1:1)
  internalReviewStartedAt    datetime
  internalReviewDueAt        datetime    +15 business days
  complianceReviewStartedAt  datetime
  complianceReviewDueAt      datetime    +10 business days
  pendingApprovalSince       datetime
  unresolvedRequiredCount    int
  approvalRequirementsMet    int
  approvalRequirementsTotal  int
  acknowledgmentReachPct     decimal(5,2)
  hashChainIntact            bool
  lastEventHash              string
```

This row is the cheap source for queue rendering and dashboard tiles.

---

## 5. ApprovalRequirement

Materialized when a version enters `pending_approval`.

```
ApprovalRequirement
  id*                  uuid
  versionId* â†’ PolicyVersion
  role*                enum      GoverningBodyChair | ComplianceOfficer | Administrator |
                                 DepartmentDirector | Legal
  required*            bool      true means the requirement must be met for T6
  signatureId          â†’ ecign.signatures   nullable until met
  signerUserId         userId    nullable until met
  meetingMinutesRef    string    e.g. "GV-FM-005#2026-Q2-minutes"
  met*                 bool      derived = (signatureId IS NOT NULL AND minutesRefValid)
  metAt                datetime
  rejectedReason       text      if a signer rejected with rationale
```

Unique `(versionId, role)`.

---

## 6. SignatureRequirement (form-level, distinct from approvals)

For acknowledgment forms and bespoke attestations attached to a version (not just approvals).

```
SignatureRequirement
  id*                       uuid
  versionId* â†’ PolicyVersion
  audienceRole*             enum      RN | LVN | Admin | All | Custom
  formInstanceId            â†’ ecign.form_instances
  attestationTextRef*       string    pointer to attestation text
  attestationTextHash*      string    SHA256 of attestation
  required*                 bool
  acknowledgmentDeadlineDays* int     default 14
```

---

## 7. ReviewComment

```
ReviewComment
  id*                 uuid
  versionId* â†’ PolicyVersion
  reviewerUserId*     userId
  reviewerRole*       string
  reviewStage*        enum      INTERNAL | COMPLIANCE
  commentType*        enum      Required | Suggestion | General
  sectionId*          string    section anchor (template section)
  charRangeStart      int
  charRangeEnd        int
  body*               text
  suggestedRevision   text
  resolutionStatus*   enum      Open | Resolved | Dismissed
  resolutionRationale text     required when status=Dismissed
  resolvedByUserId    userId   set on resolution
  resolvedAt          datetime
  createdAt*          datetime
```

Required-comment count for INV / R4 = `count(state.versionId, type='Required', resolutionStatus='Open')`.

---

## 8. DistributionRecord

One row per channel per activation event.

```
DistributionRecord
  id*               uuid
  versionId* â†’ PolicyVersion
  channel*          enum      Portal | GoogleDrive | SCORM | Print | Email
  target*           string    audience or location identifier
  dispatchedAt*     datetime
  status*           enum      success | partial | failed | deferred
  failureReason     text
  retryCount        int       default 0
  artifactRef       string    e.g. drive file id, SCORM upload id
  dispatchedBy*     userId
```

R14 references this table to determine whether T8 may proceed.

---

## 9. PolicyAssignment

Acknowledgment assignment generated automatically on T8 from the audience profile.

```
PolicyAssignment
  id*                  uuid
  policyId* â†’ Policy
  versionId* â†’ PolicyVersion
  assigneeUserId*      userId
  assigneeRole*        string
  assignedAt*          datetime    = activation time
  dueAt*               datetime    = activation + acknowledgmentDeadlineDays
  status*              enum        Assigned | Completed | Waived | Overdue
  waivedReason         text        required when Waived
  waivedByUserId       userId
  acknowledgmentRecordId â†’ AcknowledgmentRecord  nullable
```

R5 background job flips `status` to `Overdue` at `dueAt + 0`.

---

## 10. AcknowledgmentRecord

```
AcknowledgmentRecord
  id*                 uuid
  assignmentId* â†’ PolicyAssignment (1:1)
  signatureId* â†’ ecign.signatures
  attestationTextHash* string
  acknowledgedAt*      datetime
  ipAddressHash        string    optional, for forensic correlation
  userAgentHash        string    optional
  signedSignatureHash* string
```

R17 enforces signer â†” assignee equality at write time.

---

## 11. PolicyAuditEvent  (mirror of ecign.audit_events)

The lifecycle workspace writes to a thin local table that is kept in lockstep with `ecign.audit_events`. This table exists for fast UI rendering of the audit trail; the canonical record is in `ecign.audit_events`.

```
PolicyAuditEvent
  id*                 uuid
  policyId* â†’ Policy
  versionId           â†’ PolicyVersion   nullable for policy-level events
  eventType*          string            namespaced (`policy.lifecycle.activated` etc.)
  actorUserId*        userId
  actorRole*          string
  occurredAt*         datetime
  payload             jsonb
  prevHash            string
  hash*               string
  ecignAuditEventId* â†’ ecign.audit_events   FK back to canonical sink
```

R13 hash-chain check operates over `(policyId, occurredAt asc)`.

---

## 12. ArchiveJustification

```
ArchiveJustification
  id*                  uuid
  policyId* â†’ Policy
  legalAuthority*      text       e.g. "Replaced by federal rule â€¦"
  archivedByUserIds*   userId[]   must include Compliance Officer + Administrator
  archivalSignatures*  signatureId[]   eCIgn signatures of archivers
  retentionFloorMet*   bool       gate from R15
  archiveJustifiedAt*  datetime
```

T10 / T11 require this row.

---

## 13. Cross-Reference & Lookup Tables

```
PolicyCrossReference
  fromVersionId* â†’ PolicyVersion
  toPolicyId*    â†’ Policy
  toVersionId    â†’ PolicyVersion (optional; null = "current Active")
  referenceType  enum    SUPERSEDES | CITES | DEPENDS_ON | RELATED
```

`PolicyApproverEligibility` (derived view, not stored)
- A view computing, for each user, which `(policyId, role)` combinations they can sign for, given current COI status, role, and not-creator constraint.

---

## 14. Mapping to Existing Code

The current types in [src/policy/types/types.ts](../../../src/policy/types/types.ts) map as follows:

| Existing | Replaced by | Migration note |
|---|---|---|
| `LifecycleStatus` enum (7 values incl. Archived) | Split into `Policy.lifecycleState` (2 values) and `PolicyVersion.state` (7 values, none named "Deprecated") | Compatibility shim returns the legacy string from a derived computation |
| `Policy` interface | New `Policy` (logical) | `currentVersion`, `publishedVersion`, `isPublished` removed; replaced by `activeVersionId` lookup |
| `PolicyVersion` | New `PolicyVersion` | Adds `state`, `revisionRound`, `supersededBy`, `templateVersion`, `contentHash` |
| `DraftWorkspace` | Now derived from the active draft `PolicyVersion` row | `unsavedChanges`, `validationFlags` move to client-only state |
| `ReviewComment` | New `ReviewComment` | `reviewStage`, `sectionId`, `charRange*` added; never null |
| `ApprovalDecision` | Replaced by `ApprovalRequirement` rows | Decision logged via audit events |
| `PublishJob` | Replaced by `DistributionRecord` rows | Status semantics preserved |
| `PolicyAssignment` | Extended with `assigneeUserId`, `dueAt`, `acknowledgmentRecordId` | Background job flips Overdue |

A one-time migration script (Phase 1 of [09](09-Implementation-Roadmap.md)) seeds the new tables from existing in-memory data via the existing `frameworkSeedAdapter`.

---

## 15. Required Indexes

- `PolicyVersion (policyId, state)`
- Partial unique `PolicyVersion (policyId) WHERE state='active'`
- `PolicyVersion (policyId, versionNumber)`
- `ReviewComment (versionId, commentType, resolutionStatus)`
- `ApprovalRequirement (versionId, role)`
- `PolicyAssignment (assigneeUserId, status, dueAt)`
- `DistributionRecord (versionId, channel, dispatchedAt)`
- `PolicyAuditEvent (policyId, occurredAt)`

---

## 16. Field-Level Validation Summary

| Field | Rule |
|---|---|
| `Policy.tier` | Immutable after first activation |
| `PolicyVersion.versionNumber` | Format `\d+\.\d+`; minor increments on T2; major increments on T8 |
| `PolicyVersion.changeSummary` | â‰¥ 10 chars; required to leave `draft_open` |
| `PolicyVersion.effectiveDate` | â‰¥ `approvedDate`; â‰¥ `today` at T8 |
| `ReviewComment.body` | Non-empty |
| `ApprovalRequirement.signerUserId` | NOT EQUAL TO `version.createdBy` (R8) |
| `PolicyAssignment.dueAt` | = `assignedAt + acknowledgmentDeadlineDays` |
| `AcknowledgmentRecord.signatureId.signerUserId` | == `assignment.assigneeUserId` (R17) |
| `ArchiveJustification.archivedByUserIds` | must include both Compliance Officer + Administrator role-bearers |

The implementation order to bring this model to life is in [09-Implementation-Roadmap.md](09-Implementation-Roadmap.md).

---

## SOURCE: Builder\Policies\Lifecycle\09-Implementation-Roadmap.md

# 09 â€” Implementation Roadmap

> Phased plan to deliver the unified Policy Lifecycle Workspace. Each phase is sequenced by dependency, has explicit deliverables, exit criteria, and integration touchpoints. No time estimates by request.

---

## Phase Sequencing (dependency order)

```
1. Data Model
2. Lifecycle State Machine
3. Unified Workspace Shell
4. Review / Commenting System
5. Approval & eCIgn Wiring
6. Publish Readiness Engine
7. CES Integration
8. Audit Mode Integration
9. Help Center Integration
10. QA / Testing
```

---

## Phase 1 â€” Data Model

**Deliverables**

- New tables per [08](08-Policy-Lifecycle-Data-Model.md): `Policy` (logical), `PolicyVersion`, `PolicyLifecycleInstance`, `ApprovalRequirement`, `SignatureRequirement`, `ReviewComment` (extended), `DistributionRecord`, `PolicyAssignment` (extended), `AcknowledgmentRecord`, `PolicyAuditEvent`, `ArchiveJustification`, `PolicyCrossReference`.
- Database migration `migrations/00X_policy_lifecycle_schema.sql` with the partial unique index enforcing INV-1.
- Seed migration that converts the current Zustand seed (via `frameworkSeedAdapter`) into the new tables. All existing policies land as `Policy.lifecycleState='ACTIVE'` with one `PolicyVersion.state='active'` per policy.
- TypeScript types in `src/policy/types/lifecycle.ts` mirroring the schema; legacy types kept and aliased.

**Exit criteria**

- All existing policies present in new tables.
- Partial unique index passes seed without conflict.
- Compatibility selectors return the same shape the current UI expects.

---

## Phase 2 â€” Lifecycle State Machine

**Deliverables**

- `src/policy/lifecycle/stateMachine.ts` â€” pure module with `transition(intent, context) â†’ result | rejection`.
- All 11 documented transitions (T1â€“T11) implemented with named guards (R1â€“R20).
- Hash-chain helper writing both `PolicyAuditEvent` and `ecign.audit_events` in one transaction.
- Unit tests: golden cases per transition + every guard's failure path.
- Property tests asserting INV-1â€¦INV-10 over generated valid sequences.

**Exit criteria**

- 100% branch coverage on guard functions.
- Property tests run for â‰¥ 10,000 generated sequences without invariant violation.
- No code path mutates state outside the state machine.

---

## Phase 3 â€” Unified Workspace Shell

**Deliverables**

- New route `/policy-lifecycle` and `/policy-lifecycle/:policyId` mounted in [src/App.tsx](../../../src/App.tsx).
- Three-pane layout per [05](05-Policy-Lifecycle-UIUX.md) â€” top bar, left rail, center, right rail, optional footer dock â€” using existing tokens; new tokens added to `tailwind.config.js`.
- Mode toggle (`Edit Â· Review Â· Approve Â· Publish Â· View`) with mode-aware right-rail card swapping.
- Left-panel queues bound to selectors over `usePolicyLifecycleStore`; role-aware default queue; filter chips persistence.
- Redirect shims at `/drafts`, `/drafts/:id`, `/review`, `/publish` â†’ new route + mode.

**Exit criteria**

- Workspace renders for every policy in the seed without runtime errors.
- All five modes navigable via keyboard shortcuts.
- Old routes redirect with deep-link parameter preservation.

---

## Phase 4 â€” Review / Commenting System

**Deliverables**

- Comment overlay editor in the center pane: highlight-to-comment with `C/R/S` keyboard.
- Threaded comment UI bound to `sectionId + charRange`.
- Required-comment dock (footer strip) wired to live count.
- Comment-resolution actions write through the state machine (no direct store writes).
- Two-stage review (Internal then Compliance) with `reviewStage` chip in the top bar and SLA day counter.

**Exit criteria**

- Cannot advance T3 / T5 with open Required comments (R4 verified end-to-end).
- Comments survive editor saves and version diffs (anchored to section ids).

---

## Phase 5 â€” Approval & eCIgn Wiring

**Deliverables**

- `ApprovalRequirement` materializer fired on entry to `pending_approval`.
- Right-rail Required Approvals card with inline eCIgn signing using `FormSignatureFlow`.
- Guards R8 (no self-approval), R9 (COI clearance), R11 (tier-correct body) wired to the state machine.
- Special-session pathway (R11 override) implemented with extra GB-Chair signature and `override_special_session` audit event.
- Committee-minutes attachment UI (`GV-FM-005`, `CO-FM-024`, `QA-FM-001`).

**Exit criteria**

- A REQUIRED policy reaches `approved_locked` only when all three signatures and the GB minutes reference are captured.
- Self-approval and COI-missing attempts are blocked and audited.

---

## Phase 6 â€” Publish Readiness Engine

**Deliverables**

- Readiness checklist in the right rail driven by selectors (one selector per checklist row).
- Distribution channel pre-flight checks per R14.
- Atomic Activate transaction implementing T8: state swap, assignment generation, distribution dispatch, audit append. Rollback on any sub-failure.
- Background job for `acknowledgment_overdue` (R5) marking assignments and emitting events.

**Exit criteria**

- T8 either fully succeeds or rolls back with no partial state visible to selectors.
- Generated `PolicyAssignment` count matches the audience-profile resolver.
- Acknowledgment overdue job runs and surfaces in queues.

---

## Phase 7 â€” CES Integration

**Deliverables**

- Subscriptions in `complianceExecutionEvents` for the events from [07 Â§2](07-System-Integration.md#2-event-catalog).
- CES execution unit creators for `policy_authoring`, `policy_review`, `policy_acknowledgment_window`, `policy_acknowledgment_remediation`.
- Sprint Board renders policy units alongside existing units; click-through opens the lifecycle workspace.

**Exit criteria**

- Activating a policy in the workspace creates the matching CES units within one event-bus tick.
- CES unit completion writes back to `PolicyAuditEvent`.

---

## Phase 8 â€” Audit Mode Integration

**Deliverables**

- Per-policy compliance scorecard in `/audit` (R1, R5, R12, R13, R14, R15, R17 metrics).
- Evidence Pack export: PDF of Active version + audit-event log + signatures + acknowledgments + distribution receipts + manifest hash.
- Read-only deep links from Audit Mode rows to the lifecycle workspace `?asOf=` for historical-state inspection.

**Exit criteria**

- Audit Mode can replay any version's full lifecycle from `ecign.audit_events` and render the scorecard without contacting the lifecycle store.
- Evidence Pack manifest hash verifies externally.

---

## Phase 9 â€” Help Center Integration

**Deliverables**

- Help articles listed in [07 Â§9](07-System-Integration.md#9-help-center).
- Right-rail overflow â†’ "Help & Guidance" panel showing context-aware articles.
- Deep links from articles back to the workspace.

**Exit criteria**

- Every primary action button has at least one linked help article reachable in two clicks.

---

## Phase 10 â€” QA / Testing

**Deliverables**

- Unit tests: state machine, selectors, guards (carried over from Phase 2 & 5).
- Component tests: editor + comment overlay, approvals card, readiness checklist, queue rendering.
- End-to-end tests covering the four canonical journeys:
  1. New REQUIRED policy from Drafting through Activation, including 1 revision loop.
  2. Active policy entering Under Revision and the resulting Activeâ†”Superseded swap.
  3. Acknowledgment overdue path and HR escalation.
  4. Special-session override.
- Audit-replay test verifying state reconstruction from `ecign.audit_events`.
- Accessibility audit (WCAG 2.1 AA) on every primary surface.
- Performance baseline: queue render for 500 policies < 100 ms; transition round-trip < 250 ms.

**Exit criteria**

- All tests green in CI; coverage thresholds met (lines â‰¥ 90% in `src/policy/lifecycle/`).
- Accessibility audit clean on workspace shell and all mode panels.
- No invariant violation in 50,000 generated property-test sequences.

---

## Cross-Phase Concerns

| Concern | Plan |
|---|---|
| Migration safety | Each schema migration is forward-only and ships with a verification script that asserts INV-1 before declaring success. |
| Backwards compatibility | Old route shims and `usePolicyStore` adapter retained for one release cycle, then removed. |
| Telemetry | Every state transition emits a structured log line with rule code; failed transitions log at `warn`; invariant violations at `error`. |
| Security | No secrets in client; eCIgn flow uses existing server endpoints; signature images stored encrypted at rest per existing eCIgn schema. |
| Documentation | Each phase ships with an update to the [end-user manual](POLICY_LIFECYCLE_USER_MANUAL.md). |

---

## Definition of Done (system-level)

- The four canonical journeys complete without manual intervention.
- All hard rules R1â€“R20 are enforced and tested.
- INV-1 holds across the entire seeded corpus before, during, and after at least one full revision cycle.
- Audit Mode can replay any policy's full history.
- The words "Deprecated" / "Deprecate" / "Deprecation" do not appear in lifecycle code, UI, schema, or documentation.

When all of the above is true, the unified Policy Lifecycle Workspace replaces the legacy Draft / Review / Publish surfaces and the legacy routes are removed.

---

## SOURCE: Builder\Policies\Lifecycle\POLICY_LIFECYCLE_USER_MANUAL.md

# Policy Lifecycle Workspace â€” End-User Manual

> A practical guide for everyone who touches a policy: authors, reviewers, the Compliance Officer, the Administrator, the Governing Body Chair, department directors, and staff acknowledging policies.

---

## 1. What this workspace is

The **Policy Lifecycle Workspace** is the one place where every policy moves from idea to enforceable record. It replaces three older screens â€” Draft Workspace, Review Workspace, and Publish Center â€” with a single page that switches what it shows based on what you need to do.

You always see the same workspace. Only the **mode** changes:

- **Edit** â€” author the policy
- **Review** â€” read and comment on it
- **Approve** â€” sign it where you have authority
- **Publish** â€” activate it for the agency
- **View** â€” read the active version (or any historical one)

You never have to leave the workspace to switch modes. You never have to re-find the policy you were just on.

---

## 2. The shape of the screen

```
â”Œâ”€â”€â”€â”€ Top bar â€” policy ID Â· version Â· stage Â· owner Â· compliance flags Â· mode toggle â”€â”€â”€â”€â”
â”‚                                                                                          â”‚
â”‚  Left panel        Center workspace                            Right panel              â”‚
â”‚  â€¢ Stages           â€¢ Section navigator                         â€¢ Required Approvals    â”‚
â”‚  â€¢ Your queues      â€¢ Editor / viewer / comment overlay         â€¢ eCIgn signatures      â”‚
â”‚  â€¢ Filters          â€¢ Diff lens                                 â€¢ Evidence checklist    â”‚
â”‚                                                                 â€¢ Audit trail           â”‚
â”‚                                                                 â€¢ Publish readiness     â”‚
â”‚                                                                                          â”‚
â”‚  Optional footer dock â€” appears only when there are unresolved Required comments        â”‚
â”‚  Optional batch bar  â€” appears when you select multiple rows in your queue              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 3. Lifecycle stages, in plain language

| Stage | What it means |
|---|---|
| **Drafting** | An author is writing a new version. |
| **Internal Review** | Stakeholders are reading and commenting. 15-business-day window. |
| **Compliance Review** | Compliance Officer / Legal are checking it. 10-business-day window. |
| **Pending Approval** | Waiting on the right signatures (Governing Body for REQUIRED, Administrator for RECOMMENDED, Department Director for OPTIONAL). |
| **Approved for Publish** | Signed, locked, and waiting for its effective date or for distribution to run. |
| **Published** | Distribution has been sent out. |
| **Active** | The version currently in force across the agency. |
| **Under Revision** | A new draft is being written *while the current Active version stays Active*. |
| **Archived** | Only used when the law or a regulator requires the policy to be retired with no replacement. |

> **There is no "Deprecated" state.** Old versions become **Superseded** the instant a new version becomes Active. Coverage is always continuous.

---

## 4. By role: what you'll do here

### 4.1 Author / Policy Owner

Your default queue is **My drafts & revisions**.

To start a new policy:
1. The Master Index entry must already exist. If it doesn't, ask the Compliance Officer to file `EN-FM-002`.
2. From the queue, click **+ New version**.
3. Fill in every required section in the editor. The system marks empty required sections with an inline warning.
4. Type a **change summary** (what is this version changing or introducing). This is mandatory.
5. Click **Submit for Internal Review**. The clock starts.

To revise an Active policy:
1. Open the policy, click **Open Revision**. A new draft version appears alongside the Active version. The Active version is *not affected*.
2. Make your edits, fill in change summary, submit for review.

### 4.2 Reviewer (Stakeholder, Internal Review)

Your default queue is **Awaiting your review**, sorted by SLA risk.

To comment:
- Highlight any text in the editor and press:
  - `R` for a **Required** comment (blocking; must be resolved before the policy advances)
  - `S` for a **Suggestion** (non-blocking)
  - `C` for a **General** comment

To advance: when all Required comments are resolved by the author, the policy moves to Compliance Review automatically when the author clicks **Send to Compliance Review**.

### 4.3 Compliance Officer

Your default queues are **Compliance review queue** and **Approval-block alerts**.

In Compliance Review mode you:
1. Read the version, file Required comments where needed.
2. Attach the **Legal & Compliance Sign-Off** (`EN-FM-006`) from the right rail's Evidence checklist.
3. Click **Submit for Approval**.

You also sign as one of the approvers. You will see the Sign button in the right-rail Required Approvals card when you are eligible.

### 4.4 Administrator

You see two queues: **Awaiting your approval (RECOMMENDED)** and **Co-sign queue (REQUIRED)**.

To approve:
1. Open a policy from your queue.
2. Mode is automatically set to **Approve**.
3. In the right rail's Required Approvals card, click **Sign**. Type your name, draw your signature, confirm the attestation.
4. The card row turns green. When all rows are green, the version becomes Approved.

You **cannot** approve a policy you authored â€” that's blocked by the system.

### 4.5 Governing Body Chair

Your default queue is **Quarterly approval agenda**, sorted by the next quarterly meeting date.

For REQUIRED policies you sign during or after the meeting:
1. Attach the meeting minutes reference (`GV-FM-005#YYYY-Qn-minutes`) in the requirement row.
2. Sign in the same row.
3. The policy moves to Approved as soon as the Compliance Officer and Administrator have also signed.

### 4.6 Department Director

You appear as the OPTIONAL-tier approver for policies in your domain. Your queue is **OPTIONAL approvals (your domain)**. The flow is identical to the Administrator's, with the Compliance Officer co-signing.

### 4.7 Staff (acknowledging a policy)

When a new version becomes Active, you receive an assignment in **My Acknowledgments**. You have **14 calendar days**.

1. Open the assignment. Read the policy.
2. Read the attestation.
3. Sign with eCIgn (typed name + drawn signature).
4. Done. Your acknowledgment is recorded permanently.

If you don't acknowledge in time, your supervisor and HR are notified automatically.

### 4.8 Audit / Surveyor (read-only)

Open `/audit` for the per-policy compliance scorecard, or open the workspace in **View** mode with `?asOf=YYYY-MM-DD` to see the policy as it was on a specific date. From there, **Export Evidence Pack** assembles everything an external auditor needs: the active version, the audit log, all signatures, all acknowledgments, all distribution receipts â€” sealed with a manifest hash.

---

## 5. Doing it faster: shortcuts

| Keys | Action |
|---|---|
| `Cmd/Ctrl + K` | Jump to a policy / person / stage |
| `[` / `]` | Previous / next policy in your current queue |
| `E` / `R` / `A` / `P` | Switch to Edit / Review / Approve / Publish mode |
| `G` then `Q` | Back to your queue |
| `C` / `R` / `S` | (in Review mode) Add a General / Required / Suggestion comment on highlighted text |
| `?` | Show all shortcuts |

---

## 6. The right-rail cards â€” what each one tells you

| Card | What it shows | When you use it |
|---|---|---|
| **Required Approvals** | Each signature the version needs, with status | When in Approve mode |
| **eCIgn Signatures** | History of every signature on this version | Always |
| **Evidence Checklist** | Forms and minutes that must be attached | All stages |
| **Audit Trail** | Every change, comment, signature, transition | Always; surveyor view |
| **Publish Readiness** | The single checklist gating Activate | When in Publish mode |

---

## 7. Why the system blocks you (the most common reasons)

| You're trying to | â€¦and the system says no when |
|---|---|
| Submit for Internal Review | A required section is empty, or change summary is missing |
| Advance to Compliance Review | At least one Required comment is still Open |
| Submit for Approval | The Compliance/Legal sign-off (`EN-FM-006`) isn't attached |
| Sign the approval | You wrote the version (no self-approval), your COI is missing/expired, or you don't hold the role this requirement asks for |
| Approve | A required signature row is still empty |
| Activate | The effective date is in the past, a distribution channel is unhealthy, or the prior Active version isn't ready to be superseded |
| Edit a version | The version is locked (state is past Drafting) â€” you need to **Open Revision** instead |
| Archive a policy | The retention floor for that domain hasn't been reached, or another active policy still references it |

Each block tells you **exactly which rule** stopped you and what to do.

---

## 8. The Active-version promise

At every moment, **exactly one version of every policy is Active**. When a new version is activated, the old one becomes Superseded *in the same instant* â€” there is no gap, no "between policies" state, no enforcement vacuum. If anything goes wrong during activation (a distribution channel fails, a signature is invalid, the audit chain detects tampering), the activation aborts entirely and the previous version stays Active until the issue is resolved.

This is the most important promise the workspace makes.

---

## 9. The Under-Revision promise

When you open a revision on an Active policy:
- The current Active version **keeps being enforced**.
- The new draft runs in parallel, going through Internal Review, Compliance Review, and Approval on its own track.
- Staff continue to acknowledge and follow the current Active version until the new one is fully approved and activated.
- At activation, the swap is atomic. Same instant. No gap.

You do not need to "deactivate" anything. The system handles it.

---

## 10. What's permanent and what isn't

- **Permanent (cannot be edited or deleted):**
  every approved version, every signature, every acknowledgment, every audit event, every distribution record.
- **Editable:**
  drafts in `Drafting` state, comments before they're resolved, your filter selections in the left rail, your queue sort.
- **Retained for years:**
  policies and their evidence are kept for at least 7 years (10 for clinical and billing-related, life of agency for governance and quality). The Archive action is only available after the retention floor is met *and* a legal/regulatory authority is cited.

---

## 11. Getting help

- **? key** â€” keyboard shortcut overlay.
- **Right-rail overflow â†’ Help & Guidance** â€” context-aware articles for the current stage.
- **Help Center (`/help`)** â€” full knowledge base, including step-by-steps for every action in this manual.
- **Compliance Officer** â€” anything blocked, unclear, or unusual.

---

## 12. Glossary (the words this workspace uses, and what they mean)

| Word | Meaning |
|---|---|
| Active | The single, in-force, enforceable version of a policy |
| Superseded | A prior version that has been replaced atomically by a newer Active version |
| Archived | A policy that has been formally retired with no successor (rare; legal/regulatory only) |
| Draft / Drafting | A version still being written; not enforceable |
| Internal Review | Stakeholder review window (15 business days) |
| Compliance Review | Compliance + Legal review window (10 business days) |
| Pending Approval | Waiting on required signatures by tier |
| Approved for Publish | Signed and locked; waiting on effective date and distribution |
| Under Revision | A new draft is in progress while the Active version remains active |
| Required comment | A blocking review note that must be resolved before the policy advances |
| eCIgn | The agency's electronic-signature system; every signature here uses it |
| ApprovalRequirement | A row that says "this role must sign for this version" |
| PolicyAssignment | An acknowledgment task assigned to a staff member when a version activates |
| Evidence Pack | A self-contained, hash-sealed export for surveyors |
| Audit trail | Append-only, hash-chained record of every change |

There is **no "Deprecated"** in this glossary. The workspace does not use that word. If you see it anywhere, please report it as a bug.

---

## SOURCE: Builder\Policies\Lifecycle\README.md

# Policy Lifecycle Workspace â€” Architecture & Design

This folder is the **single, authoritative design package** for the unified Policy Lifecycle Workspace that replaces the legacy Draft Workspace, Review Workspace, and Publish Center.

## Read in order

1. [01 â€” Policy Lifecycle Truth Extraction](01-Policy-Lifecycle-Truth.md) â€” what the actual P&Ps require
2. [02 â€” Current System Gap Analysis](02-Current-System-Gaps.md) â€” how the legacy three-screen split fails
3. [03 â€” Target Architecture](03-Policy-Lifecycle-Architecture.md) â€” unified lifecycle, state machine, parallel-revision model, hard invariants
4. [04 â€” Efficiency-First Workflow Design](04-Efficiency-Workflow-Design.md) â€” click budgets, role-aware queues, inline everything
5. [05 â€” UI / UX Design Specification](05-Policy-Lifecycle-UIUX.md) â€” tokens, layout, modes, every panel
6. [06 â€” Compliance Enforcement Model](06-Compliance-Enforcement-Model.md) â€” the 20 hard rules + invariants
7. [07 â€” System Integration](07-System-Integration.md) â€” CES, Calendar, Audit Mode, eCIgn, Forms, Help Center
8. [08 â€” Policy Lifecycle Data Model](08-Policy-Lifecycle-Data-Model.md) â€” entities, fields, relationships, indexes
9. [09 â€” Implementation Roadmap](09-Implementation-Roadmap.md) â€” phased delivery plan
10. [End-User Manual](POLICY_LIFECYCLE_USER_MANUAL.md) â€” practical guide for every role

## Non-negotiables

- **No "Deprecated" state.** The lifecycle uses `Active`, `Under Revision`, `Superseded` (version-level), and `Archived` (only when legally required).
- **Exactly one Active version per policy** at every instant. Activeâ†”Superseded swaps are atomic.
- **Every transition is guarded** by an explicit rule (R1â€“R20) and audited via the existing `ecign.audit_events` hash chain.
- **Single workspace, no route changes.** Drafting, reviewing, approving, and publishing all happen in `/policy-lifecycle` with mode-aware panels.

---

## SOURCE: Builder\Policies\additional PPs.docx

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\CI Design System.pdf

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\CIHHCBRANDKIT.HTML

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\CL-OA-006 — Documentation Hierarchy and Evidence Source Prioritization (1).docx

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\CO-CP-001 — Corporate Compliance Program.docx

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\DOMAIN_ CL — Clinical Operations (6).docx

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\EN — ENTERPRISE CONTROL DOMAIN_ COMPLETE POLICY SUITE.docx

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\FN-BC-001 — Medicare Billing & Claims Submission.docx

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\FormsPrintLightDesign.html

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\Governing Body Authority & Responsibilities (3).docx

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\HOME HEALTH AGENCY ENTERPRISE POLICY TAXONOMY & CLASSIFICATION FRAMEWORK.docx

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\HR Policy.docx

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\IT Domain Policy Development — Complete Enterprise Package.docx

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\ModalNav.html

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\OP — OPERATIONS DOMAIN_ COMPLETE POLICY MANUAL.docx

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\OrgChart.html

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\PolicyPrintDownloadDesignLight.html

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\PolicyViewer_eCFRReferenceDesignLight.html

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\PolicyViewerDesignLight.html

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\QA.docx

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---

## SOURCE: Builder\Policies\RM — RISK MANAGEMENT & SAFETY DOMAIN (2).docx

_Binary source (.docx/.pdf/.html) not inlined in this master markdown._

---



