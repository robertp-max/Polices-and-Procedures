# A05 — CMS Surveyor — Emergency preparedness

- **Agent:** A05 (CMS Surveyor persona)
- **Routes:** `/emergency`, `/patients`, `/qapi` (HashRouter base `http://127.0.0.1:5194/#`)
- **Worktree:** `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1`
- **App path:** `apps/ehr-prototype`
- **Branch context:** ehr_phase1 design prototype (synthetic data)
- **Method:** Static screen/data review of live-route sources (`EmergencyPrepScreen.tsx`, `PatientsScreen.tsx`, `PatientChartScreen.tsx`, `QapiProgrammeScreen.tsx`, `clinical.ts`, `patients.ts`, `workspace.ts`, `requirementsSpec.ts`, RelatedNav). Vite log shows `127.0.0.1:5194` was serving this app; browser automation against localhost was not available to this agent (SSRF policy), so UI claims are source-backed.
- **Verdict:** **CONDITIONAL**
- **Summary:** The Emergency preparedness screen is a credible **patient-profile** prototype: incomplete/needs-refresh states are visible, save/load/drill-log actions are disabled with footnotes, and RelatedNav reaches Patients and QAPI. As a **CMS surveyor** walking §484.102, the workspace under-represents **agency-level** emergency plan, risk assessment, communications, training, and exercise governance; census coverage math **omits patients without any profile**; patient chart integrity can **contradict** EMP status; and CoP/regulatory cues are almost entirely missing on-route.

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| `/emergency` loads / title / domain kicker | OK | `Domain EMP · emergency preparedness`; title “Emergency preparedness”; sub describes patient profiles, priority, power, command posture, exercises. |
| RelatedNav present on `/emergency` | OK | QAPI · Patients · Security (`ROUTE_RELATED['/emergency']`). |
| StatCards + filters + inspector | OK | 4 StatCards; status + priority filter toolbars; registry listbox + sticky inspector with Overview / Dependencies / Plan & drills / Related tabs. |
| Patient-level vs agency preparedness | FAIL | Screen is almost entirely **patient EMP profiles** (EMP-002). Agency layer is two visual exercise rows only — no all-hazards risk assessment, written plan elements, P&P set, agency communication plan, training roster, ICS/command board, or COOP. Domain description in register promises “agency command, communications, continuity…” but UI does not. |
| Drills / plans status honesty | CONDITIONAL | Strong: synthetic banner; Save disabled + footnote; Load disabled; incomplete callouts; exercises “visual samples only.” Weak: **Exercises YTD = 2** uses `accent="good"` (reads as compliant success); after-action “filed (sample)” still easy to over-read if banner is scrolled away. |
| Coverage / incomplete honesty | FAIL | `coveragePct = current / patients.length` → 2 current / **8** census = 25%. `Missing / incomplete` counts only profiles with `status: 'incomplete'` (**2**). Two census patients (**pt-raymond**, **pt-samuel**) have **no EMP profile row at all** and are invisible to incomplete/missing. Needs-refresh (2) also not rolled into missing metric. |
| Chart integrity vs EMP status | FAIL | Elena integrity `chk-8` “Emergency preparedness plan · **passed**” matches EMP current. **June** EMP = **Incomplete** while roster integrity is **13/13**. **Walter** EMP = **Needs refresh** while integrity **13/13**. Only Elena expands full checklist — others show aggregate ring that can imply readiness. |
| Cross-links `/emergency` → patients / QAPI | OK | Header Patients; inspector Open chart; Plan & drills → QAPI; Related → QAPI / Patients / Security / Competency. |
| Cross-links `/patients` → emergency | FAIL | RelatedNav: Intake · Schedule · Episodes only. No EMP chip, no emergency priority column, no incomplete-profile flag on roster. |
| Cross-links `/qapi` → emergency | CONDITIONAL | Route-level RelatedNav: Quality · Incident packages · Competency — **no Emergency prep**. PIP-2 (Falls) related includes Emergency prep. PIP-3 countermeasure is **Call-tree drill** and measures include “Call-tree drill pass” but related links **omit** `/emergency` (goes to field visits / messages / work queue). |
| Missing CoP cues (§484.102) | FAIL | No on-screen cite of **42 CFR §484.102** or the four core elements (plan, policies/procedures, communication plan, training & testing). No biennial review, full-scale vs tabletop distinction, MAC/notification, hazard profile (wildfire/earthquake/PSPS), or continuity-list distribution status. Screen comment “Anchors EMP-002” only; register contains **only EMP-002** under domain EMP. |
| Destructive / false completeness controls | OK | Primary “Save profile” disabled when already current; title + footnote for visual-only save; drawer “Load from assessment” disabled; banner states no profile saved / no drill logged / no continuity list distributed. |
| Patients route survey utility | CONDITIONAL | Usable census for chart drill-down; high-risk filter exists but is clinical risk, not emergency priority/power dependency. Export/Add patient appear non-disabled without honesty footnote (secondary to EMP topic). |
| QAPI route EP linkage | CONDITIONAL | Honest PIP close gates; call-tree appears as sustained PIP measure at 100% — good as improvement signal, but not framed as EP CoP evidence package or linked back to EMP exercise registry. |

## Findings

### P0

1. **Census without EMP profiles is under-reported as “missing.”**  
   - **Where:** `EmergencyPrepScreen.tsx` StatCards (`currentCount`, `incompleteCount`, `coveragePct`) vs `patients` (8) vs `PROFILES` (6).  
   - **Issue:** Incomplete/missing metric = profiles already tagged incomplete only. **Raymond Delgado** and **Samuel Adeyemi** have no emergency profile object; a surveyor reviewing the KPI strip would not see them as gaps. Coverage uses full census in the denominator but the gap register does not.  
   - **Survey risk:** False sense of known incomplete set; “2 missing” is wrong if 4 patients are not current (2 incomplete + 2 absent + needs-refresh separate).  
   - **Prototype fix direction:** Derive gap list as `patients` without `status === 'current'` (or without a profile), and label the incomplete card “Not current / no profile.”

2. **Patient chart integrity can show full pass while EMP says incomplete.**  
   - **Where:** `patients.ts` integrity aggregates; `clinical.ts` `chk-8` (Elena only); `EmergencyPrepScreen` PROFILES for June/Walter.  
   - **Issue:** June incomplete EMP vs 13/13 integrity; Walter needs-refresh vs 13/13. Elena’s detailed check is “passed” with Level 2 language that sounds survey-final.  
   - **Survey risk:** Two systems of truth for “is the patient emergency-ready?” — record integrity vs EMP domain.  
   - **Prototype fix direction:** Align integrity emergency check with EMP status; link chip to `/emergency` with patient context; do not show 13/13 without EP sub-check for incomplete profiles.

### P1

3. **Agency-level §484.102 program surface is missing on `/emergency`.**  
   Patient profiles are necessary but not sufficient for HHA EP CoP. Surveyors expect: facility/community **risk assessment**, written **emergency plan**, **policies/procedures**, **communication plan** (staff, patients, external/MAC), **training & testing program**, exercise schedule with after-action/CAP, and plan review cadence. UI offers only a short exercise list under patient inspector “Plan & drills.” Domain register text acknowledges agency command/continuity; implementation does not.

4. **No CoP / regulatory cues on the EMP workspace.**  
   No `§484.102`, no four-element checklist, no “evidence: plan / training roster / AAR” framing. Product leadership cannot use this screen as a survey-readiness map. Requirements register only lists **EMP-002** (patient profile) — agency requirements are absent from the EMP domain slice shown to the prototype.

5. **`/patients` has no emergency preparedness cross-link or status.**  
   RelatedNav and roster columns ignore EMP priority, power dependency, and profile currency. Surveyor path from census → EMP is only via global nav or emergency header, not in-context.

6. **`/qapi` RelatedNav omits Emergency prep; call-tree PIP does not link back to EMP.**  
   Asymmetric linking: EMP → QAPI is strong; QAPI → EMP is only on Falls PIP. Missed-visit / call-tree PIP is the natural EP-adjacent project and should surface `/emergency` (and ideally a specific exercise id).

7. **“Exercises YTD” StatCard is success-colored without EP compliance caveats.**  
   Value `EXERCISES.length` (2) with `accent="good"` and sub “With after-action labels” can read as “agency is drill-compliant.” Banner honesty is present but the KPI tone fights it. Prefer neutral/warn and explicit “sample rows · not filed.”

8. **Plan & drills is patient-scoped but shows agency-wide exercises only.**  
   Selecting any patient shows the same two exercises; no patient-specific shelter plan document, education packet status, or continuity-list inclusion. Tab name “Plan & drills” blurs **patient emergency plan** vs **agency testing program**.

### P2

9. **Security as top-level EMP related destination is a stretch for surveyor mental model.** Continuity/field safety may justify it; Competency + Requirements (EMP domain) would be clearer CoP neighbors.

10. **Primary CTA “Open patient profile” opens an empty review-only drawer** rather than focusing the selected registry row — slightly confusing vs “Open chart.”

11. **Future exercise dates (Mar 2026 / Jun 2026) relative to prototype “now”** may confuse chronology depending on session date; label “sample calendar” more explicitly.

12. **Patients “Export list” / “Add patient”** lack the synthetic/disabled honesty pattern used heavily on EMP/QAPI (secondary for this persona topic).

## What works

- Clear domain EMP framing and patient emergency profile registry with priority + status chips.
- Power-dependent patients called out (Walter · O2 concentrator) with warn callout on Dependencies tab.
- Honest incomplete callouts citing EMP-002 acceptance language (“every active patient needs a reviewed profile…”).
- Synthetic banner and disabled save/load/drill-log with footnotes — appropriate prototype honesty for survey optics.
- RelatedNav and in-inspector links from EMP to Patients, QAPI, Competency.
- QAPI programme enforces “no close on task completion alone” and surfaces a call-tree drill measure under a sustained PIP — good QAPI–EP adjacency seed.
- Elena chart integrity includes an “Emergency preparedness plan” line item (even if not deep-linked).
- Competency screen separately links to `/emergency` (adjacent rail; not in assigned routes but supports training/testing story).

## Persona quote

> “I can see who is power-dependent and whose emergency profile is incomplete — good — but I still cannot walk the four Conditions of Participation elements for the agency emergency program from this screen, and your coverage numbers do not admit the patients with no profile at all.”

## Route evidence (source anchors)

| Route | Primary file | Key honesty / link notes |
|-------|--------------|---------------------------|
| `/emergency` | `apps/ehr-prototype/src/screens/EmergencyPrepScreen.tsx` | Banner L246–250; coverage L208–211; exercises L154–157, 555–575; save L611–634; RelatedNav L253 |
| `/patients` | `apps/ehr-prototype/src/screens/PatientsScreen.tsx` | RelatedNav → intake/schedule/episodes only (`workspace.ts` `/patients`) |
| `/patients/:id` | `apps/ehr-prototype/src/screens/PatientChartScreen.tsx` + `data/clinical.ts` chk-8 | EP integrity only expanded for Elena; no navigate to `/emergency` |
| `/qapi` | `apps/ehr-prototype/src/screens/QapiProgrammeScreen.tsx` + `data/workspace.ts` QAPI_PIPS | PIP-2 → emergency; PIP-3 call-tree without EMP link; route RelatedNav omits EMP |

## Recommended product moves (report-only; not implemented)

1. Split EMP workspace into **Patient profiles** | **Agency EP programme** (§484.102 four elements + exercise register).  
2. Fix coverage KPIs to include **no-profile** census members; never paint Exercises YTD green without “sample” tone.  
3. Bidirectional RelatedNav: `/patients` and `/qapi` → Emergency prep; PIP-3 related → `/emergency`.  
4. Align chart integrity EP check with EMP profile status; deep-link to EMP inspector.  
5. Surface CoP cue strip: `42 CFR §484.102` · Plan · P&P · Communications · Training/Testing · last review / next exercise.  
6. Expand requirements register EMP beyond EMP-002 so domain description matches built surfaces.

---

**Report-only.** No app source changes. No commit.
