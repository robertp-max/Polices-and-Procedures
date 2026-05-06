# Corridor Alignment — Implementation Report

**Date:** 2026-04-30
**Strategy doc:** [../Corridor-Alignment-Strategy/corridor-alignment-strategy.md](../Corridor-Alignment-Strategy/corridor-alignment-strategy.md)
**Mode:** Execution (no UI changes; metadata sidecar + source-of-truth patches + validation)

---

## 1 · Headline Metrics

| Metric | Count |
|---|---:|
| Total policies in canonical framework | **253** |
| Alignment records produced | **253** *(100% coverage)* |
| Policies with **authored** Corridor crosswalk + addendums | **68** |
| Policies marked **REQUIRES REVIEW** (subdomain-default crosswalk only) | **185** |
| New gap-content patches written for high-risk policies | **9** *(in `CORRIDOR-PATCHES.md`)* |
| Forms bound to parent policies as Corridor-style addendums | **15** *(of 20 in `FORMS_CATALOG`)* |
| New policy IDs created | **0** *(per "preserve IDs" rule)* |
| Files renamed / deleted | **0** |
| UI files modified | **0** |
| Build / typecheck | **PASS** *(`tsc --noEmit` exit 0; `npm run build` exit 0)* |

> **Why 0 new policy IDs:** the framework seed (`frameworkSeed.generated.ts`) is auto-generated upstream. New IDs would have to flow from that generator. Instead, gap content is patched into existing IDs via `CORRIDOR-PATCHES.md` and surfaced through metadata.

---

## 2 · Files Changed / Added

| Path | Type | Purpose |
|---|---|---|
| [Builder/Policies/generate_corridor_alignment.py](../Builder/Policies/generate_corridor_alignment.py) | NEW | Reproducible generator: subdomain defaults + per-policy overrides → typed sidecar + CSV |
| [Builder/Policies/corridor-crosswalk.csv](../Builder/Policies/corridor-crosswalk.csv) | NEW | Corridor-section ↔ our-policy-ID mapping with status (COVERED / PARTIAL) |
| [Builder/Policies/extracted_full/CORRIDOR-PATCHES.md](../Builder/Policies/extracted_full/CORRIDOR-PATCHES.md) | NEW | Additive PURPOSE/POLICY/PROCEDURE patches for 9 high-risk policies (Bag Technique, Fire Extinguishers, EP exercises, RCA, verbal orders, grievance SLA, BBP, TB, HIPAA breach) |
| [src/policy/data/corridorAlignment.generated.ts](../src/policy/data/corridorAlignment.generated.ts) | NEW | Typed sidecar exporting `CorridorAlignment` for all 253 policies (crosswalk, evidence codes P/D/I/O/S, addendums with formId, related policies, requiresReview flag) |
| [src/policy/data/formAddendumBindings.ts](../src/policy/data/formAddendumBindings.ts) | NEW | Inverted form→parent-policy binding helper derived from the sidecar |
| [scripts/validateCorridorAlignment.ts](../scripts/validateCorridorAlignment.ts) | NEW | Validator: coverage, orphans, broken refs, unregistered forms |
| [../Corridor-Alignment-Strategy/corridor-alignment-strategy.md](../Corridor-Alignment-Strategy/corridor-alignment-strategy.md) | (prior) | Controlling strategy doc |

**Files NOT modified (per rules):** `frameworkSeed.generated.ts`, `allPoliciesContent.generated.ts`, any `src/policy/components/**`, any `src/pages/**`. Existing approved policy content is untouched.

---

## 3 · Domain-by-Domain Summary

| Domain | Total | Authored (COVERED) | Subdomain-default (REQUIRES REVIEW) |
|---|---:|---:|---:|
| **CL** Clinical Operations | 70 | 15 | 55 |
| **CO** Compliance & Regulatory | 30 | 7 | 23 |
| **EN** Enterprise Control | 3 | 3 | 0 |
| **FN** Finance & Revenue Cycle | 19 | 4 | 15 |
| **GV** Governance & Administration | 20 | 11 | 9 |
| **HR** Human Resources | 39 | 4 | 35 |
| **IT** Technology & Information Security | 20 | 3 | 17 |
| **OP** Operations | 20 | 5 | 15 |
| **QA** QAPI | 19 | 3 | 16 |
| **RM** Risk Management & Safety | 13 | 13 | 0 |
| **TOTAL** | **253** | **68** | **185** |

**Authored coverage prioritized the 10 high-risk areas the user listed**; HR/IT/CL-SD have the highest review backlog because they're depth-heavy domains where Corridor is comparatively thin.

---

## 4 · Crosswalk Schema Applied (every policy)

```ts
interface CorridorAlignment {
  policyId: string;
  summary: string;
  corridorRef: string | null;            // e.g. "1-002 Governing Body"
  crosswalk: {
    achc: string[];                      // e.g. ["HH1-1A","HH1-2A"]
    cop: string[];                       // e.g. ["§484.105(a)","§484.65(e)"]
    title22: string[];                   // e.g. ["74717","74721","SB 188"]
  };
  evidenceTypes: ('P'|'D'|'I'|'O'|'S')[];
  addendums: { key: string; label: string; formId?: string }[];
  relatedPolicies: string[];
  requiresReview: boolean;               // true = subdomain-default applied; SME sign-off needed
}
```

---

## 5 · High-Risk Area Closure

| High-risk area | Authored policy ID(s) | Procedure patch | Form/Addendum |
|---|---|---|---|
| Fire safety + extinguisher inspection (monthly / annual / 6-yr / 12-yr) | `RM-OS-001` | ✅ CORRIDOR-PATCHES.md → "Office Fire Safety" | RM-OS-001.B `RM-F-010` Monthly Log; .C Lifecycle Log; .D AAR `RM-F-011` |
| Emergency preparedness drills + AAR (≥2/yr; full-scale or community-integrated) | `RM-EP-001` | ✅ CORRIDOR-PATCHES.md → "Exercises" | .A HVA · .B Tier Roster · .C Cascade Test · .D Activation · .E Patient Ed · .F AAR · .G Cease-Ops |
| Equipment management & SMDA / MedWatch | `RM-OS-001`, `RM-OS-004` | ✅ CORRIDOR-PATCHES.md → "Equipment & SMDA" | RM-OS-001.G SMDA Log |
| DME / vendor responsibility | `RM-OS-001` (.F), `GV-EA-002` | ✅ Vendor agreement addendum | RM-OS-001.F |
| Infection control + bag technique (observable on every visit) | `RM-ER-001`, `RM-ER-002` | ✅ CORRIDOR-PATCHES.md → "Bag Technique §6-013" | RM-ER-002.A Cleaning Log · .B Competency Checklist |
| Bloodborne pathogens / Hep B exposure logs | `RM-ER-003` | ✅ CORRIDOR-PATCHES.md → "BBP & Hep B" | OSHA sharps log |
| TB exposure surveillance | `RM-ER-004` | ✅ CORRIDOR-PATCHES.md → "TB" | TB testing log |
| Incident → RCA → QAPI loop (24h sentinel; 30d plan; 90d closure) | `QA-AE-001`, `RM-OS-002` | ✅ CORRIDOR-PATCHES.md → "Sentinel-Event Loop" | QA-AE-001.A RCA · .B Sentinel Notification |
| Medication reconciliation / high-alert / errors | `CL-SD-*` (REQUIRES REVIEW for individual SD entries) | (deferred — needs SME pass on CL-SD subdomain) | Dedicated `RM-MM-` subdomain not yet in framework; flagged below |
| Patient rights & grievance (5d ack / 30d close) | `CL-PR-001..006`, `OP-IM-002` | ✅ CORRIDOR-PATCHES.md → "Grievance Lifecycle" | OP-IM-002.B Grievance Log |
| Record retention | `CL-CD-001`, `CO-DC-001` | (default crosswalk applied; SME content review) | — |
| OSHA compliance | `RM-ER-003`, `RM-OS-001` | ✅ via BBP and EOC | OSHA 300/300A logs |
| HIPAA privacy / security | `CO-HP-001`, `CO-HP-004`, `IT-SC-001` | ✅ CORRIDOR-PATCHES.md → "HIPAA Breach Notification" | — |
| Billing notices: ABN / HHCCN / NOMNC / DENC | `FN-BC-001..004` | ✅ Authored override on FN-BC-001 | FN-F-001/002/003/004 bound as addendums |

---

## 6 · Forms Bound to Parent Policies (Corridor-style addendums)

| Form ID | Parent Policy | Addendum Key | Label |
|---|---|---|---|
| `GV-F-001` | GV-GB-001 | A | Governing Body Roster |
| `GV-F-002` | GV-GB-001 | B | GB Orientation Checklist |
| `CO-F-004` | GV-GB-002 | A | Conflict of Interest Attestation |
| `CL-F-001` | CL-CP-001 | A | POC Template (485-equivalent) |
| `QA-F-010..014` | QA-PG-001 | B–F | QAPI agenda / attendance / minutes / actions / dashboard |
| `RM-F-010` | RM-OS-001 | B | Extinguisher Monthly Log |
| `RM-F-011` | RM-OS-001 | D | Fire Drill After-Action Report |
| `OP-F-001` | OP-IM-001 | A | Admission Decision Worksheet |
| `FN-F-001` | FN-BC-001 | C | Annual Disclosure Statement |
| `FN-F-002` | FN-BC-001 | B | NOMNC Issuance Log |
| `FN-F-003` | FN-BC-001 | D | ABN/HHCCN Issuance Log |
| `FN-F-004` | FN-BC-001 | E | 60-Day Overpayment Tracker |

Forms not yet bound: `QA-F-020` (cross-cutting QAPI dashboard — to be assigned), `IS-F-001/002` and `GV-F-010` (need clinical-SME confirmation of parent).

---

## 7 · Validation Commands & Results

```powershell
# 1. Generate sidecar + crosswalk CSV
python Builder\Policies\generate_corridor_alignment.py
# → WROTE corridorAlignment.generated.ts (253 records)
# → WROTE corridor-crosswalk.csv

# 2. Run alignment validator (dup IDs, coverage, orphans, broken refs, unregistered forms)
npx tsx --tsconfig tsconfig.app.json scripts\validateCorridorAlignment.ts
# → Framework policy IDs       : 253
# → Alignment records          : 253
# → Missing alignment coverage : 0
# → Orphan alignment records   : 0
# → Broken cross-references    : 0
# → Unregistered form IDs      : 0
# → ✔ Alignment integrity: OK

# 3. Typecheck
npx tsc -p tsconfig.app.json --noEmit
# → EXIT=0  (no errors)

# 4. Production build
npm run build
# → ✓ built in 2.82s
# → EXIT=0  (chunk-size warning is informational, not an error)
```

---

## 8 · REQUIRES REVIEW backlog (185 policies)

These have a **subdomain-default crosswalk** (correct ACHC chapter, CoP anchor, Title 22 anchor, evidence codes) but no per-policy authored summary, addendum binding, or Corridor section pointer. They render with `requiresReview: true` so the UI / surveyor view can flag them for clinical SME sign-off without ever showing a missing field.

Largest review queues by domain:
- **CL-SD** (Service Delivery, 25 policies) — discipline-specific service procedures (RN, LVN, PT, OT, ST, MSW, HHA)
- **CL-OA** (OASIS, 19 policies) — OASIS data accuracy specimens
- **HR-JD** (Job Descriptions, 12) and **HR-WM** (Workforce Mgmt, 7)
- **IT-SA / IT-SC / IT-SC** (Security & Admin, 17 policies)

These domains weren't represented in Corridor at one-to-one granularity (Corridor handles HR via a separate binder; IT was Corridor §2-014 only). Subdomain defaults are accurate; SME review is to add Corridor-section pointers and addendum bindings.

---

## 9 · Remaining Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **No `RM-MM-*` subdomain** in framework seed | Medication Management lives across `CL-SD-*` instead of a dedicated subdomain | Flagged for next framework-seed regeneration; CORRIDOR-PATCHES.md slot reserved |
| **`allPoliciesContent.generated.ts` not yet rebuilt** with CORRIDOR-PATCHES.md content | Procedure text in patches is authoritative on disk but not yet rendered in policy detail pages | Run `python Builder\Policies\generate_from_extracted.py` in next maintenance cycle |
| **185 REQUIRES REVIEW** policies | Subdomain-default crosswalk shown until SME signs off | Validator reports the count; UI flag drives a remediation queue |
| **Forms catalog `parentPolicyId` not native** to `FormMeta` | Binding lives in derived helper instead of catalog itself | `formAddendumBindings.ts` provides O(1) lookup; no UI change required |
| **HR / IT depth** | Corridor itself has thin HR/IT coverage; our framework is deeper | Defaults are conservative; per-policy review will surface where Corridor's IPC/EP cross-applies (e.g., HR-TD-001 carries IPC/EP training requirements) |

---

## 10 · Next-Cycle Execution Plan

1. **SME review pass** on 185 REQUIRES REVIEW policies — re-run `generate_corridor_alignment.py` with new entries appended to `OVERRIDES`. Each pass increments the COVERED count without code changes elsewhere.
2. **Generator integration:** run `generate_from_extracted.py` to merge `CORRIDOR-PATCHES.md` into `allPoliciesContent.generated.ts`.
3. **Surveyor view:** add a "Crosswalk" tab in `SharedPolicyDetailView` that reads `corridorAlignment[policyId]` (read-only; trivial UI add — explicitly out of scope here per rules).
4. **Forms catalog augmentation:** add an optional `parentPolicyId` field to `FormMeta` and back-fill from `formAddendumBindings`; allows the forms registry to natively know its parents.
5. **CI gate:** add `npx tsx scripts/validateCorridorAlignment.ts` to the build pipeline so coverage cannot regress.

---

*All deliverables build, typecheck, and validate against the canonical framework. Existing approved policy content is unchanged.*
