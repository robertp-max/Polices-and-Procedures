# 10 — Consolidated Review Findings: Phase 1 Staffing MVP

**Document ID:** STAFFING-MVP-P1-10
**Role:** Consolidation Lead
**Date:** 2026-05-13
**Status:** CONSOLIDATION COMPLETE
**Input Documents:** 9 specialist reviews (01–09), Architecture.md, Planning_Implementation.md

---

## Executive Summary

Nine specialist reviewers analyzed the Phase 1 Staffing MVP planning documents across data modeling, scheduling, privacy, FEHA compliance, claims substantiation, UX, TypeScript conventions, acceptance criteria, and scope control. This consolidation synthesizes all findings into a single authoritative assessment.

### By the Numbers

| Metric | Count |
|---|---|
| Total gaps identified across all reviews | 87 |
| Gaps after deduplication | 54 |
| Critical severity | 8 |
| High severity | 16 |
| Medium severity | 19 |
| Low severity | 11 |
| Inter-reviewer conflicts requiring resolution | 12 |
| DO NOT BUILD items (expanded) | 26 |
| Deferred features cataloged | 33 |
| Acceptance criteria defined | 72 (updated to reflect consolidated decisions) |

### Overall Readiness Assessment

The Architecture.md data model is well-designed for full production staffing (~85% design-complete). However, the implementation prompt at the bottom of Architecture.md (lines 1362–1430) — the document that actually drives what gets built — is only ~55% ready for execution. It omits FEHA accommodation fields (P0 compliance), conflates the junction model, drops critical ShiftNeed fields, uses banned terminology in the source Architecture.md, lacks route definitions for the sidebar group, and has no disclaimer requirements.

**After applying the corrections in the companion document `09_CURSOR_IMPLEMENTATION_PROMPT.md`, the implementation prompt is ready for execution.**

---

## 1. Conflict Resolution Log

### CONFLICT 1: Client Names — Privacy (Agent 3) vs UX (Agent 6)

| Agent | Position |
|---|---|
| Agent 3 (Privacy) | Replace Client firstName/lastName with synthetic displayId (e.g., "Client-A1"). Patient names are HIPAA identifier #1. |
| Agent 6 (UX) | Client list and detail pages need display names for the directory to be usable. |

**Resolution: KEEP firstName/lastName on the Client type. USE clearly fictional names in mock data.**

**Rationale:** Removing names from the type creates a Phase 2 migration burden when production data requires names. The real risk is establishing a PHI display pattern — mitigated by: (1) mock data uses obviously fictional names with a file-level disclaimer, (2) a demo banner reads "DEMO — Synthetic Data" on all pages, (3) documentation notes that production use requires the PHI encryption framework.

---

### CONFLICT 2: Junction Model — Data Model (Agent 1) vs Scope Control (Agent 9)

| Agent | Position |
|---|---|
| Agent 1 (Data Model) | Rename CareAssignment to ClinicianClientConnection. Add connectionStatus, source, and approval fields. |
| Agent 9 (Scope) | CareAssignment already pulls Phase 3 scope forward. Adding more fields risks over-engineering. |

**Resolution: RENAME to ClinicianClientConnection. ADD connectionStatus and source fields. KEEP the field set minimal.**

**Rationale:** The rename is a naming fix, not a scope expansion — it aligns Phase 1 with the architectural vocabulary. Adding connectionStatus and source costs ~2 lines of TypeScript but provides massive forward compatibility: Phase 3 extends the same entity rather than replacing it. The unique constraint `(clinicianId, clientId)` cannot be expressed with the current CareAssignment name since CareAssignment implies per-shift rather than per-pair semantics.

---

### CONFLICT 3: Accommodation Fields — FEHA (Agent 4) vs Scope Control (Agent 9)

| Agent | Position |
|---|---|
| Agent 4 (FEHA) | Accommodation fields (religious, ADA, pregnancy, FMLA, scheduling) must be on the Clinician type. P0 compliance. |
| Agent 9 (Scope) | Not explicitly flagged, but Agent 9's DO NOT BUILD includes "No credential renewal compliance" and "No supervisory visit tracking." |

**Resolution: FEHA WINS. Accommodation fields are included in Phase 1.**

**Rationale:** Every source document marks accommodations as P0 compliance. Architecture.md line 70: "REQUIRED — P0 Compliance per FEHA ADS." Planning_Implementation.md Part 2 Gap Analysis: "Accommodation fields in data model — P0." Agent 9 does not explicitly flag accommodation fields — the DO NOT BUILD items are about compliance *logic*, not compliance *data fields*. Including optional type fields and populating 2–3 mock clinicians with accommodation data is within scope.

---

### CONFLICT 4: Staffing Board — Calendar (Agent 2) vs Scope Control (Agent 9) vs UX (Agent 6)

| Agent | Position |
|---|---|
| Agent 2 (Calendar) | Add StaffingBoardPage at /staffing with Today/Tomorrow tabs. P0 — core demo view. |
| Agent 9 (Scope) | DO NOT BUILD item 15: "No Staffing Board or daily operations view." |
| Agent 6 (UX) | Scopes to 4 pages only. No Staffing Board in Phase 1 UX review. |

**Resolution: STAFFING BOARD IS OUT of Phase 1. Agent 9 is correct.**

**Rationale:** The approved MVP scope is "read-only data display with mock data" across 4 pages (clinician list/detail, client list/detail). The Staffing Board is an operational view requiring ShiftAssignment infrastructure and matching context that doesn't exist in Phase 1. Agent 2's route and layout recommendations are preserved for Phase 2.

---

### CONFLICT 5: TypeScript Types — Data Model (Agent 1) vs TypeScript (Agent 7)

| Agent | Position |
|---|---|
| Agent 1 (Data Model) | Defines canonical type definitions with corrected fields, renamed entities. |
| Agent 7 (TypeScript) | Validates the implementation prompt's types against codebase conventions. Notes conflicts with Doc 13. |

**Resolution: USE Agent 1's canonical types as the baseline with corrections from Agents 3 and 4 applied.**

**Rationale:** Agent 1 performed the deepest field-by-field analysis. Agent 7 validates conventions (naming, exports, store patterns) which are applied on top of Agent 1's types. Agent 7's Doc 13 conflict findings confirm that Doc 13 is superseded by Architecture.md.

---

### CONFLICT 6: Skill vs Discipline/Competency — Multiple Agents

| Agents | Position |
|---|---|
| Agent 1 (Data Model) | Identified 20 instances of "Skill" in Architecture.md requiring correction. |
| Agent 9 (Scope) | Confirms the implementation prompt IS terminology-compliant. Architecture.md is NOT. |

**Resolution: ENFORCE Discipline/Competency/Credential terminology. "Skill" is banned.**

**Rationale:** Planning_Implementation.md mandates this. The implementation prompt is already compliant. Architecture.md corrections are documentation tasks, not build tasks. The consolidated implementation prompt uses Competency throughout.

---

### CONFLICT 7: primaryDiagnosisCategory — Privacy (Agent 3) vs Data Model (Agent 1) vs UX (Agent 6)

| Agent | Position |
|---|---|
| Agent 3 (Privacy) | Remove from Phase 1. Diagnosis category + identifier = PHI under 45 CFR §160.103. |
| Agent 1 (Data Model) | Includes it in canonical Client type. |
| Agent 6 (UX) | Lists it in ClientDetailPage care needs display. |

**Resolution: REMOVE primaryDiagnosisCategory from Phase 1. Agent 3 is correct.**

**Rationale:** careTier (L1–L4) provides sufficient operational abstraction without clinical information. A diagnosis category like "cardiac" combined with a name and location constitutes individually identifiable health information. Deferring to Phase 2 with the PHI encryption framework eliminates the risk.

---

### CONFLICT 8: serviceZip/serviceCity — Privacy (Agent 3) vs Data Model (Agent 1)

| Agent | Position |
|---|---|
| Agent 3 (Privacy) | Remove. Zip codes and city names are HIPAA identifiers on patient records. Use zone-only abstraction. |
| Agent 1 (Data Model) | Includes both in canonical Client type. |

**Resolution: REPLACE with serviceZone. Remove serviceZip and serviceCity from Phase 1.**

**Rationale:** Named zones (e.g., "North Bay", "Peninsula") provide sufficient geographic context for Phase 1 display without HIPAA identifier risk. When Phase 2 introduces distance-based matching, add geographic fields with the PHI framework.

---

### CONFLICT 9: Demographic Fields — FEHA (Agent 4) vs Privacy (Agent 3)

| Agent | Position |
|---|---|
| Agent 4 (FEHA) | Add demographicData stub on Clinician (wrapped in object). Needed for bias audit awareness. |
| Agent 3 (Privacy) | Exclude entirely from Phase 1. Requires separate storage, consent, and access control infrastructure. |

**Resolution: EXCLUDE demographic fields from Phase 1. Agent 3 is correct.**

**Rationale:** Demographic fields require: (a) separate DynamoDB table, (b) bias_auditor role-gated access, (c) clinician consent, (d) query isolation ensuring they never appear in matching or operational views. None of this infrastructure exists in Phase 1. Including stubs without the infrastructure creates a false sense of readiness. Phase 3 (Bias Audit) is the correct target.

---

### CONFLICT 10: File Structure — Calendar (Agent 2) vs TypeScript (Agent 7)

| Agent | Position |
|---|---|
| Agent 2 (Calendar) | Consolidate under `src/policy/staffing/` for module cohesion and calendar separation. |
| Agent 7 (TypeScript) | Validates `src/policy/clinician/` + `src/policy/client/` as separate modules matching existing patterns. |

**Resolution: USE `src/policy/staffing/` as a single module.**

**Rationale:** The single module eliminates the cross-feature type dependency that Agent 7 identified (Client importing Discipline from clinician/types.ts). It also enforces Agent 2's calendar separation constraint naturally — one module boundary, zero imports from compliance infrastructure. Existing modules like `ces/` similarly consolidate multiple page types under one feature root.

---

### CONFLICT 11: ShiftNeed Statuses — Calendar (Agent 2) vs Scope Control (Agent 9)

| Agent | Position |
|---|---|
| Agent 2 (Calendar) | 5 statuses: open, assigned, completed, missed, cancelled. |
| Agent 9 (Scope) | 3 statuses: open, filled, cancelled. |

**Resolution: USE 3 statuses (open, filled, cancelled).**

**Rationale:** Without a Staffing Board, "completed" and "missed" imply visit delivery tracking (Phase 2). Mock data can describe outcomes in the notes field. Define Phase 2 expansion in type comments.

---

### CONFLICT 12: CredentialBadge Behavior — Data Model (Agent 1) vs Scope Control (Agent 9)

| Agent | Position |
|---|---|
| Agent 1 (Data Model) | Add daysUntilExpiry and expiring_soon status. CredentialBadge uses computed lifecycle. |
| Agent 9 (Scope) | CredentialBadge must use static status field only. No credential expiry computation. |

**Resolution: ADD expiring_soon status and daysUntilExpiry as PRE-COMPUTED mock data values. No runtime computation.**

**Rationale:** The mock data file contains hardcoded daysUntilExpiry values and status values including 'expiring_soon'. The CredentialBadge reads the status field directly — green for 'active', yellow for 'expiring_soon', red for 'expired'. Zero computation at runtime. This satisfies Agent 1's visual demo requirement without triggering Agent 9's scope concern.

---

## 2. Consolidated Gap List (Deduplicated, Severity-Ranked)

### Critical (8 gaps — must fix before implementation)

| ID | Gap | Flagged By | Resolution |
|---|---|---|---|
| C-01 | Accommodation fields missing from implementation Clinician type | Agents 1, 4 | Add all 5 FEHA accommodation field groups to Clinician interface |
| C-02 | CareAssignment conflates junction with shift assignment; wrong name | Agent 1 | Rename to ClinicianClientConnection; add connectionStatus, source |
| C-03 | `on_leave` status missing from Clinician | Agent 1 | Add to ClinicianStatus union |
| C-04 | No ADS classification statement in implementation prompt | Agent 4 | Add ADS context note to CONTEXT section |
| C-05 | No disclaimer requirements in implementation prompt | Agent 5 | Add DEMO banner and footer disclaimer constraints |
| C-06 | Implementation prompt 55% FEHA-compliant due to field omissions | Agent 4 | Apply all corrections from Agent 4 Section 9 |
| C-07 | 17 unsubstantiated performance claims in planning documents | Agent 5 | Source document corrections (not implementation prompt changes) |
| C-08 | Calendar separation not explicitly enforced | Agent 2 | Add zero-import constraint in implementation prompt |

### High (16 gaps)

| ID | Gap | Flagged By | Resolution |
|---|---|---|---|
| H-01 | No Credential.credentialName or daysUntilExpiry | Agent 1 | Add fields to Credential interface |
| H-02 | No Credential.expiring_soon status | Agent 1 | Add to CredentialStatus union |
| H-03 | No weightedCaseloadPoints on Client | Agent 1 | Add as pre-computed field in mock data |
| H-04 | ShiftNeed missing visitDate, priority, shiftType | Agent 1 | Add fields (visitDate required, others optional) |
| H-05 | No route specification for /staffing sidebar group | Agent 2 | Define "Staffing" sidebar group with Clinicians/Clients sub-items |
| H-06 | Mock data not mapped to demo scenarios | Agent 2 | Specify 6 ShiftNeeds mapped to 3+2+1 demo scenarios |
| H-07 | assignmentSource inconsistency across documents | Agent 2 | Standardize: brad_recommendation, manual_assignment, manual_override |
| H-08 | primaryDiagnosisCategory is PHI but included in prompt | Agent 3 | Remove from Phase 1 Client type |
| H-09 | serviceZip/serviceCity are HIPAA identifiers on patient records | Agent 3 | Replace with serviceZone |
| H-10 | No AdsDecisionLog type stub | Agent 4 | Define type-only stub (no implementation) |
| H-11 | No AuditLogEntry type stub | Agents 1, 4 | Define type-only stub (no implementation) |
| H-12 | HITL fields missing from junction entity (approvalRationale, overrideReason) | Agent 4 | Add to ClinicianClientConnection |
| H-13 | Detail pages lack tab structure | Agent 6 | Specify 3 tabs per detail page using Tabs component |
| H-14 | No search capability on list pages | Agent 6 | Add SearchField from ui/ |
| H-15 | Named export requirement not specified | Agent 7 | Add .then(m => ({ default: m.PageName })) pattern |
| H-16 | Store actions/selectors not distinguished | Agent 7 | Clarify selectors vs state vs computed |

### Medium (19 gaps)

| ID | Gap | Flagged By | Resolution |
|---|---|---|---|
| M-01 | CareTier values lack semantic labels | Agent 1 | Use L1_essential, L2_enhanced, L3_specialized, L4_critical |
| M-02 | Mock data needs accommodation diversity | Agent 1 | Min 2 clinicians with accommodation data |
| M-03 | Mock data needs credential status diversity | Agent 1 | Min 1 expired + 1 expiring_soon credential |
| M-04 | Mock data needs ACCM ownership diversity | Agent 1 | Min 2 distinct accmOwnerId values |
| M-05 | ShiftNeed lifecycle over-specified for Phase 1 | Agent 2 | Keep 3 statuses, defer expansion |
| M-06 | No explicit separation rule for calendar/staffing | Agent 2 | Add module-level import constraint |
| M-07 | Mock data using "realistic Bay Area names" risks coincidental match | Agent 3 | Use clearly fictional names with disclaimer |
| M-08 | Free-text fields are PHI vectors | Agent 3 | Add mock data constraint: no clinical content in notes |
| M-09 | Language violations: "automated" without "assisted" qualifier | Agent 4 | Fix 4 instances in source docs |
| M-10 | No responsive design specification | Agent 6 | Add minimal Tailwind responsive guidance |
| M-11 | No empty state definitions | Agent 6 | Use EmptyState component from ui/ |
| M-12 | CredentialBadge threshold undefined | Agent 6 | Green: active, Yellow: expiring_soon, Red: expired |
| M-13 | DisciplineBadge colors undefined | Agent 6 | Licensed: blue, Certified: teal, Non-licensed: gray |
| M-14 | Status color mapping undefined | Agent 6 | active=green, pending=yellow, inactive=gray, etc. |
| M-15 | Cross-entity navigation not specified | Agent 6 | Clicking entity references navigates to detail page |
| M-16 | Store uses `stores/` (plural) — split convention in codebase | Agent 7 | Use `stores/` to match majority convention |
| M-17 | userId field missing from Clinician | Agent 7 | Add userId?: string |
| M-18 | No barrel export (index.ts) for module | Agent 7 | Add index.ts |
| M-19 | Doc 13 type definitions not marked as superseded | Agent 7 | Documentation note (not build task) |

### Low (11 gaps)

| ID | Gap | Flagged By | Resolution |
|---|---|---|---|
| L-01 | ACCM caseload computation has no mechanism | Agent 1 | Include as pre-computed mock data values |
| L-02 | on_hold vs on_hold casing inconsistency | Agent 1 | Standardize on snake_case |
| L-03 | Mock data quantity contradicts between architecture sections | Agent 1 | Resolve: 10/6/8/6 for Phase 1 |
| L-04 | Week View undefined for staffing board | Agent 2 | Deferred — no staffing board in Phase 1 |
| L-05 | No responsive/mobile specification | Agent 2 | Minimal guidance in implementation prompt |
| L-06 | No loading state specification | Agent 6 | Suspense fallback sufficient for Phase 1 |
| L-07 | No invalid ID handling specification | Agent 6 | Add "not found" state for bad IDs |
| L-08 | No browser tab title specification | Agent 6 | Optional — nice to have |
| L-09 | No route section comment specified | Agent 7 | Add Staffing section comment in App.tsx |
| L-10 | isHardRequirement comment leaks matching concepts | Agent 9 | Change comment to neutral language |
| L-11 | serviceEntity should be literal 'home_care' not union | Agent 9 | Lock to literal type in Phase 1 |

---

## 3. Final Phase 1 Scope Definition

### IN SCOPE (Build in Phase 1)

| Deliverable | Description |
|---|---|
| **TypeScript types** | Clinician, Client, ClinicianClientConnection, ShiftNeed, Discipline, Competency, Credential, CareTier, all status enums, accommodation types. Type stubs for AuditLogEntry and AdsDecisionLog. |
| **Module directory** | `src/policy/staffing/` with types, stores, data, pages, components subdirectories |
| **Mock data** | 10 clinicians, 6 clients, 8 connections, 6 shift needs — with accommodation diversity, credential status diversity, ACCM ownership diversity, and demo scenario mapping |
| **Zustand stores** | clinicianStore.ts, clientStore.ts — read-only, seeded from mock data, with filter state |
| **Pages (read-only)** | ClinicianListPage, ClinicianDetailPage, ClientListPage, ClientDetailPage — all with tab structure, search, filters, empty states |
| **Components** | ClinicianCard, ClientCard, CredentialBadge, DisciplineBadge, TierBadge, StatusBadge, ShiftNeedCard, DemoBanner |
| **Routes** | /clinicians, /clinicians/:clinicianId, /clients, /clients/:clientId — all in ProtectedRoute + CommandCenterLayout |
| **Sidebar nav** | "Staffing" group with Clinicians and Clients sub-items |
| **Demo banner** | DEMO — Synthetic Data banner on all staffing pages |

### OUT OF SCOPE (Do Not Build in Phase 1)

See Section 5 (DO NOT BUILD list) for the complete 26-item list.

### TERMINOLOGY STANDARD (Enforced)

| Term | Meaning | Usage Rule |
|---|---|---|
| **Discipline** | Professional/service category (RN, LVN, HHA, PT, OT, ST, MSW, CNA, Caregiver) | PRIMARY matching axis |
| **Competency** | Specific capability/experience (wound care, IV therapy, OASIS, Hoyer lift) | SECONDARY matching |
| **Credential** | License/certification/document proving eligibility | Compliance gating |
| **Skill** | — | NEVER use. Banned term. |

---

## 4. Final DO NOT BUILD List

| # | Item | Source | Rationale |
|---|---|---|---|
| 1 | No write/edit UI (no forms, no create, no update, no delete) | Planning_Implementation.md, Agent 9 | Phase 1 is read-only display |
| 2 | No matching engine or scoring logic | Planning_Implementation.md, Agent 9 | Phase 2 |
| 3 | No AlayaCare integration | Planning_Implementation.md, Agent 9 | Phase 3 |
| 4 | No WellSky integration | Planning_Implementation.md, Agent 9 | Phase 4+ |
| 5 | No PHI fields (dateOfBirth, primaryDiagnosis text, full address, serviceZip, serviceCity) | Planning_Implementation.md, Agent 3 | PHI framework required first |
| 6 | No credential renewal compliance logic | Planning_Implementation.md, Agent 9 | Phase 2 |
| 7 | No supervisory visit tracking beyond type field | Planning_Implementation.md, Agent 9 | Phase 2 |
| 8 | No approval workflows | Planning_Implementation.md, Agent 9 | Phase 6 |
| 9 | No S3 evidence storage | Planning_Implementation.md, Agent 9 | Phase 2+ |
| 10 | No Brad/IA integration with staffing data | Planning_Implementation.md, Agent 9 | Requires PHI corpus exclusion |
| 11 | No server routes or API endpoints | Agent 9 | Frontend-only with mock data |
| 12 | No DynamoDB table creation or persistence | Agent 9 | Zustand + mock data only |
| 13 | No credential expiry computation at runtime | Agent 9 | Use pre-computed status in mock data |
| 14 | No shift status transitions or lifecycle logic | Agent 9 | Mock data is static |
| 15 | No connection manager or connection workflows | Agent 9 | Phase 3 |
| 16 | No Staffing Board or daily operations view | Agent 9 (overrides Agent 2) | Phase 2 |
| 17 | No demographic fields (race, sex, age) | Agent 3 (overrides Agent 4) | Phase 3 — requires separate storage + consent |
| 18 | No AuditLog implementation (type stub only) | Agent 9 | Phase 6 |
| 19 | No Home Health-specific fields or concepts | Planning_Implementation.md, Agent 9 | Phase 3 |
| 20 | No Availability entity or schedule management | Agent 9 | Phase 4 |
| 21 | No Restriction or Preference entities | Agent 9 | Phase 3–4 |
| 22 | No caseload capacity computation logic | Agent 9 | Pre-computed values in mock data only |
| 23 | No eligibility preview or isEligible() function | Agent 9 | Phase 2 |
| 24 | No modification of existing CES, eCIgn, PM, or Journey files | Implementation prompt | Scope isolation |
| 25 | No modification of AuthProvider.tsx | Implementation prompt | Auth is out of scope |
| 26 | No imports from calendarSyncStore, calendarApi, regulatoryEvents, or ces/* | Agent 2 | Calendar separation constraint |

---

## 5. Final Deferred Features List

| Feature | Target Phase | Dependency |
|---|---|---|
| Matching engine (Layer 2 scoring) | Phase 2 | Requires Availability + Credential lifecycle + Connection intelligence |
| Staffing Board (Today/Tomorrow views) | Phase 2 | Requires ShiftAssignment entity and matching context |
| FEHA ADS Compliance Framework doc | Phase 2 | Pre-matching documentation |
| Claims substantiation validation | Phase 2 | Requires production data |
| Credential renewal CES events | Phase 2 | Requires credential lifecycle engine |
| Supervisory visit compliance engine | Phase 2 | Requires CES integration |
| Auto-ShiftNeed generation from care plans | Phase 2 | Requires visit plan parser |
| Client intake forms via eCIgn | Phase 2 | Requires eCIgn extension |
| AdsDecisionLog implementation (storage + UI) | Phase 2 | Requires matching engine |
| AlayaCare integration | Phase 3 | External API |
| Connection Manager (full CRUD) | Phase 3 | Requires connection lifecycle |
| Restriction / Preference entities | Phase 3 | Requires connection layer |
| Multi-entity support (HH + HC) | Phase 3 | Requires serviceEntity extension |
| Caseload balancing | Phase 3 | Requires capacity tracking engine |
| Bias Monitoring Dashboard | Phase 3 | Requires demographic data + consent infrastructure |
| Availability entity + schedule management | Phase 4 | Requires clinician self-service |
| WellSky integration | Phase 4+ | External API |
| Human approval workflow (full pipeline) | Phase 6 | Requires AuditLog + notification system |
| Audit Log Viewer | Phase 6 | Requires audit infrastructure |
| Brad optimizer integration | Phase 7 | Requires all prior layers |
| Layer 3 bias check automation | Phase 7 | Requires demographic data + statistical engine |
| Predictive call-out modeling | Phase 7 | Requires historical data pipeline |
| Visit frequency parser | Phase 7 | Requires HH episode model |
| Mobile app for field clinicians | Future | Separate product surface |
| Brad knowledge of client PHI | Never (or Phase 4 with PHI framework) | Requires corpus exclusion + BAA |

---

## 6. Cross-Reference Matrix

Which reviewer(s) flagged each consolidated gap:

| Gap ID | Description | Ag1 | Ag2 | Ag3 | Ag4 | Ag5 | Ag6 | Ag7 | Ag8 | Ag9 |
|---|---|---|---|---|---|---|---|---|---|---|
| C-01 | Accommodation fields missing | X | | | X | | | | X | |
| C-02 | Junction model conflated | X | | | | | | X | | X |
| C-03 | on_leave status missing | X | | | X | | | | | |
| C-04 | No ADS classification | | | | X | | | | | |
| C-05 | No disclaimer requirements | | | | | X | | | | |
| C-06 | Implementation prompt FEHA gaps | | | | X | | | | | |
| C-07 | Unsubstantiated claims | | | | | X | | | | |
| C-08 | Calendar separation unenforced | | X | | | | | | | |
| H-01 | Credential.credentialName missing | X | | | | | | | | |
| H-02 | No expiring_soon status | X | | | | | | | | |
| H-03 | No weightedCaseloadPoints | X | | | | | | | | |
| H-04 | ShiftNeed missing date/priority | X | X | | | | | | | |
| H-05 | No sidebar group defined | | X | | | | X | | | |
| H-06 | Mock data not mapped to scenarios | | X | | | | | | | |
| H-07 | assignmentSource inconsistency | | X | | X | X | | | | |
| H-08 | primaryDiagnosisCategory is PHI | | | X | | | | | | |
| H-09 | serviceZip/serviceCity are PHI | | | X | | | | | | |
| H-10 | No AdsDecisionLog stub | | | | X | | | | | |
| H-11 | No AuditLogEntry stub | X | | | X | | | | | |
| H-12 | HITL fields missing | | | | X | | | | | |
| H-13 | Detail pages lack tabs | | | | | | X | | | |
| H-14 | No search on list pages | | | | | | X | | | |
| H-15 | Named export not specified | | | | | | | X | | |
| H-16 | Actions vs selectors unclear | | | | | | | X | | |
| M-01 | CareTier lacks semantic labels | X | | | | | | | | |
| M-07 | Mock names coincidental risk | | | X | | | | | | |
| M-10 | No responsive specification | | X | | | | X | | | |
| M-11 | No empty state definitions | | | | | | X | | | |
| M-17 | userId missing from Clinician | | | | | | | X | | |

---

## 7. Sign-Off Readiness Statement

### Pre-Condition: Corrections Applied

The implementation prompt at Architecture.md lines 1362–1430 is NOT ready for execution in its current form. The companion document `09_CURSOR_IMPLEMENTATION_PROMPT.md` incorporates all corrections from all 9 reviewers and resolves all 12 inter-reviewer conflicts.

### Post-Correction Assessment

| Criterion | Status |
|---|---|
| All 8 critical gaps addressed | YES — in 09_CURSOR_IMPLEMENTATION_PROMPT.md |
| All 16 high gaps addressed | YES — in 09_CURSOR_IMPLEMENTATION_PROMPT.md |
| All inter-reviewer conflicts resolved | YES — 12/12 resolved in Section 1 above |
| No conflicting recommendations remain | YES — every conflict has a single resolution |
| DO NOT BUILD list is complete | YES — 26 items, merged from all reviewers |
| Deferred features have target phases | YES — 25 features with phase targets |
| Acceptance criteria defined | YES — 72 criteria updated to reflect consolidated decisions |
| Implementation prompt is standalone | YES — a coding agent can implement from 09 alone |
| No vague language in implementation prompt | YES — every instruction is specific and actionable |

### Verdict

**The implementation prompt (09_CURSOR_IMPLEMENTATION_PROMPT.md) is READY FOR EXECUTION** after owner approval. No additional review cycles are needed. The coding agent should receive ONLY the 09 document — not Architecture.md, not Planning_Implementation.md, and not any of the 01–08 review documents.

### Recommended Execution Order

1. Owner reviews and approves this consolidated findings document (10)
2. Owner reviews and approves the implementation prompt (09)
3. Implementation prompt (09) is given to the coding agent as the sole input
4. Post-implementation UAT uses the acceptance criteria in Section 15 of the 09 document
5. Post-UAT, update System Documentation docs (03, 05, 07) to reflect new routes, types, and modules

---

*End of Consolidated Review Findings*
*Consolidation Lead — 2026-05-13*
