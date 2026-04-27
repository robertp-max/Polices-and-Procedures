# 01 — Policy Lifecycle Truth Extraction

> **Source of truth:** Care Indeed Home Health Care, Inc. policy & procedure corpus and enterprise workflow library currently committed to this repository. All requirements below are quoted or paraphrased from those documents — nothing is invented.

**Primary sources reviewed**

| Document | Path | Authority |
|---|---|---|
| Enterprise Workflow Library | [Builder/Policies/Workflows/EN-WORKFLOWS.md](../Workflows/EN-WORKFLOWS.md) | EN-WF-01…EN-WF-13 |
| P&P Amendment Register | [Builder/Policies/Workflows/PP_AMENDMENT_REGISTER.md](../Workflows/PP_AMENDMENT_REGISTER.md) | Audit register |
| Governing Body Authority & Responsibilities (GV-GB-001) | [Builder/Policies/PolicyPrintDownloadDesignLight.html](../PolicyPrintDownloadDesignLight.html) | Governing-body charter |
| Forms Classification Matrix (EN-FM-003) | [Builder/Policies/FormsPrintLightDesign.html](../FormsPrintLightDesign.html) | Tiering authority |
| Regulatory Licensure & Certification (CO-RA-001) | [Builder/Policies/CO-RA-001.md](../CO-RA-001.md) | Licensure controls |
| Domain seed policies | `Builder/RM-*.md`, `Builder/EN-*.md`, `Builder/CO-CA-001.md`, `Builder/CL-OA-006-extracted.txt` | Per-domain content |

---

## 1. Policy Creation Requirements

From **EN-WF-01 — Policy Lifecycle**, every new policy MUST satisfy the following before any draft can be opened:

1. **Master Index entry created** — a row is added to `EN-FM-002 Master Policy Index` with the assigned policy ID (domain-subdomain-sequence, e.g. `CL-OA-007`), tier, owner, review cadence and target effective date.
2. **Change request authorized** — `EN-FM-003 Policy Change Request` is filed by the originating department and accepted by the Compliance Officer.
3. **Authoring template selected** — the policy must be authored on `EN-FM-004 Policy Authoring Template` (purpose, scope, definitions, procedures, references, training, appendices).
4. **Tier classification assigned** — REQUIRED, RECOMMENDED, or OPTIONAL per `EN-FM-003 Forms Classification Matrix`. Tier determines approval authority and acknowledgment frequency.
5. **Owner / Steward designated** — single named role (e.g. "Compliance Officer", "Director of Nursing"). Personally-named individuals are not accepted; only roles.

> **Hard rule:** No draft may be created without a Master Index entry. The lifecycle workspace MUST refuse to instantiate a draft if `EN-FM-002` has no row for that policy ID.

---

## 2. Drafting Requirements

| Requirement | Source | Rule |
|---|---|---|
| Author identity recorded | EN-WF-01 Step 2 | `createdBy` captured on every save; system clock time-stamped |
| Section structure mandated | EN-FM-004 | Sections: Purpose, Scope, Definitions, Procedures, References, Training, Appendices |
| Regulatory anchors required | CO-RA-001 §3, GV-GB-001 §2 | Every REQUIRED policy must cite at least one regulatory citation (42 CFR §, CA H&S §, HIPAA §) |
| Forms cross-referenced | EN-FM-002 | Each procedure step that produces evidence must reference the form ID in the Forms Library |
| Change summary captured | EN-WF-01 Step 2 | A free-text rationale is mandatory before the draft can be sent for review |
| Draft is not enforceable | EN-WF-01 | Drafts MUST be visually marked "Working Draft — Not Enforceable" on every render and print |

---

## 3. Review Requirements

**Two-stage review** is mandated for every REQUIRED- and RECOMMENDED-tier policy.

### 3.1 Stakeholder / Internal Review
- **Time-box:** ≤ **15 business days** (EN-WF-01 Step 3).
- **Participants:** named reviewers from each affected department; minimum one Subject Matter Expert.
- **Deliverable:** `EN-FM-005 Review Comment Log`, including reviewer, comment, suggested revision, resolution.
- **Comment classification:** `Required` (blocking), `Suggestion` (non-blocking), `General` (informational).
- **Required comments must all be Resolved or Dismissed-with-rationale before the policy can advance.**

### 3.2 Legal / Compliance Review
- **Time-box:** ≤ **10 business days** (EN-WF-01 Step 4).
- **Participants:** Compliance Officer + Legal counsel (Legal may delegate to outside counsel for material changes).
- **Deliverable:** `EN-FM-006 Legal & Compliance Review Sign-Off` — captures (a) regulatory adequacy, (b) conflict-of-policy check, (c) language/risk review.
- **Output:** signed sign-off PDF stored as evidence; lifecycle blocks advance until sign-off attached.

### 3.3 Committee Review
- **Compliance Committee** (`CO-FM-024`) — required for all policies in the CO and HR domains.
- **QAPI Committee** (`QA-FM-001`) — required for clinical (CL) and quality (QA) domains.
- **Output:** dated minutes referencing the policy ID and version; minutes are evidence and must be attached to the lifecycle.

---

## 4. Approval Authority (Hard Routing Matrix)

Derived from **GV-GB-001 §6** and **EN-FM-003 Tier definitions**:

| Tier | Approver of record | Secondary signatures | Source |
|---|---|---|---|
| **REQUIRED** | **Governing Body** (Chair signs `GV-FM-005 Governing Body Meeting Minutes`) | Compliance Officer + Administrator co-sign `EN-FM-006` | GV-GB-001 §6.2; CO-RA-001 §6.2.3.1 |
| **RECOMMENDED** | **Administrator** | Compliance Officer | EN-FM-003 |
| **OPTIONAL** | **Department Director** of the owning domain | Compliance Officer | EN-FM-003 |

Additional rules:

- **Governing Body cadence is quarterly minimum** (GV-GB-001 §4.1). REQUIRED policies that miss a quarterly meeting cannot be force-approved by the Administrator — they wait for the next quarterly session or convene a documented special session.
- **Conflict of interest disclosure** (GV-GB-001 Appendix C) MUST be on file for any approver before their signature is accepted.
- **Self-approval is prohibited.** The author / steward cannot serve as the approver of record.

---

## 5. Version Control Rules

From **EN-WF-01 Step 7**, **PP_AMENDMENT_REGISTER**, and the existing `PolicyVersion` schema in [src/policy/types/types.ts](../../../src/policy/types/types.ts):

1. **Major version** (`X.0`) — published, governing-body-approved version. Increments only when a new approval is signed.
2. **Minor version** (`X.Y`) — incremented on each Revision-Requested loop while drafting (`6.0 → 6.1 → 6.2`).
3. **`isLocked = true`** on every approved version. Approved versions are immutable; corrections require a superseding version.
4. **`supersedes`** field MUST point to the prior published version. No orphan versions allowed.
5. **`effectiveDate`** is the date the version becomes enforceable; it cannot be earlier than the approval signature date.
6. **Exactly one Active version per policy ID** at any moment. Prior versions become **Superseded** at the moment the new version becomes Active. There is **no gap**.
7. **Hash-chain evidence** — every state transition is recorded in `ecign.audit_events` with `prev_hash`/`hash` per the existing eCIgn schema ([migrations/001_ecign_schema.sql](../../../migrations/001_ecign_schema.sql)).

---

## 6. Distribution Requirements

From **EN-WF-01 Step 8** and `EN-FM-007 Publication & Distribution Log`:

| Requirement | Detail |
|---|---|
| Publication channels | Internal portal (this app), printed binder, Google Drive mirror, SCORM training module |
| Notification window | Distribution notification MUST be issued within 1 business day of "Approved for Publish" |
| Audience scoping | Audience derived from domain + role assignments in `PolicyAssignment` (RN, LVN, Admin, etc.) |
| Distribution evidence | Each channel produces a `DistributionRecord` with channel, target audience, timestamp, actor, success/fail |
| Translation / accessibility | Patient-facing CL policies must include any required language variants per CA H&S §1336 |

---

## 7. Acknowledgment Requirements

From **EN-WF-03 Universal Policy Acknowledgment** and **GV-GB-001 Appendix C**:

1. **14 calendar days** to acknowledge after the effective date or revision becomes Active.
2. **Per-role assignment** — `PolicyAssignment.role` drives who must acknowledge.
3. **Three-part attestation** for governance and compliance policies: (a) receipt & understanding, (b) understanding of duty, (c) commitment to comply.
4. **eCIgn signature required** — typed name + drawn signature + retained `signature_hash` + `attestation_text_hash`.
5. **Escalation:** Compliance Officer is notified at T+10 days for any unacknowledged assignment; HR is notified at T+14 (overdue).
6. **Acknowledgment evidence** is permanent and is the row of record for surveyor inspection.

---

## 8. Retention & Audit Trail Requirements

| Source | Rule |
|---|---|
| HIPAA §164.316(b)(2)(i) | 6 years from creation OR last effective date, whichever is later |
| CA H&S §123145 | 7 years for clinical-related records |
| 31 U.S.C. §§3729-3733 (False Claims) | 10-year lookback for billing-related policies |
| 42 CFR §484.105 | Governing-body and QAPI records retained for the life of the agency |
| EN-WF-01 Step 10 | Annual review evidence retained for 3 review cycles minimum |

**Operational consequence:** the system retention floor is the **maximum** of the applicable rules per policy domain. Policies in **CL** domain default to 10 years; **GV / QA** retained for life of agency; everything else 7 years. Deletion is **never** allowed before the retention floor; only legal/regulatory archival is permitted.

**Audit trail (EN-WF-01 + eCIgn schema):** every transition (create, edit, comment, resolve, approve, sign, publish, distribute, acknowledge, supersede, archive) MUST be appended to `ecign.audit_events` with actor, subject, action, payload, prev_hash, hash. **The audit log is append-only.** Edits or deletions to historical events are forbidden.

---

## 9. Authoritative Lifecycle Sequence (Truth, not redesign)

Drawing from EN-WF-01 verbatim, the lifecycle today is:

```
Initiate → Draft → Stakeholder Review → Legal/Compliance Review →
Committee Review → Governing-Body Approval (if REQUIRED) →
Assign ID & Version → Publish → Acknowledge → Schedule Next Review
```

Plus the parallel branch:

```
Active version (in force) ──► triggers ──► Under Revision (new draft of next version)
                                                │
                                                ▼
                                         Re-enter lifecycle from Stakeholder Review
                                                │
                                                ▼
                                         Approval & new effective date
                                                │
        Old version: state = Superseded   ◄────┴────► New version: state = Active
```

> **Critical invariant pulled from the corpus:** at no instant may a policy ID have zero Active versions. The new version becomes Active in the same atomic transition that the prior version becomes Superseded. There is no "Deprecated" state in the source corpus — that term does not appear in the P&Ps and is therefore prohibited downstream.

---

## 10. Non-Negotiable Compliance Anchors

| Citation | Constraint enforced on lifecycle |
|---|---|
| 42 CFR §484.105 | Governing Body must approve REQUIRED policies; Administrator and Clinical Manager named in record |
| 42 CFR §484.65 | QAPI plan re-approved annually by Governing Body |
| 42 CFR §489.18 / §489.52 | Change-of-ownership policies re-reviewed on triggering event |
| CA H&S §1725 et seq. | Licensure-impacting policies block publish without active state license on file |
| HIPAA §164.316 | Retention + administrative safeguards documentation |
| 31 U.S.C. §§3729-3733 | Billing/coding policies subject to 10-year audit lookback |

---

**Conclusion of Phase 1.** The lifecycle workspace must enforce the rules above as hard system constraints, not soft guidance. Phase 2 quantifies how today's three-screen split fails to do so.
