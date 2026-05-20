# Agent 05 — Patient Profiles (List + Detail) Auditor Report

**Agent ID:** 019e44e7-30f8-7981-80f5-03affa672aa4  
**Type:** explore  
**Duration:** 250.21s | Tool calls: 29 | Turns: 1  
**Task:** Patient List+Detail deep comparison (Claude vs ui-staging vs real production)

---

## Scope

- Full spec + implementation from `ClaudeExecute1`
- Side-by-side vs `src/ui-staging/V3PatientListPreview.tsx` and `V3PatientDetailPreview.tsx`
- Side-by-side vs real production in `src/policy/staffing/pages/PatientListPage.tsx`, `PatientDetailPage.tsx` + supporting stores/types/components
- Quantified missing fields, sections, interactions, data fidelity, architectural gaps

**Key Source Files:**
- Claude spec: `.../_Heavy/Fix-2026-05-14/___claudeMCP/gemini/Send_To_Claude/Claude_Resonse/ClaudeExecute1` (FILE 11 PatientListPage ~1834, FILE 12 PatientDetailPage ~1944)
- ui-staging: `src/ui-staging/V3PatientListPreview.tsx`, `V3PatientDetailPreview.tsx`
- Production: `src/policy/staffing/pages/PatientListPage.tsx`, `PatientDetailPage.tsx`, `types.ts`, `stores/patientStore.ts`, `data/mockPatients.ts`, `components/PatientCard.tsx`, routing in `App.tsx` + `CommandCenterLayout.tsx`

---

## ClaudeExecute1 Patient Spec Summary

**List:**
- HIPAA lock + "HIPAA PROTECTED" eyebrow
- 6 columns: PATIENT / DIAGNOSIS / CLINICIAN / START OF CARE / EPISODE / STATUS + chevron
- 6 rich patients (7 fields each including startOfCare, episodeStatus, Hold status)
- Live search (name+diagnosis), row click → navigate, hover glass, status colors, lucide icons

**Detail:**
- Header with avatar + HIPAA lock + name/status/ID/DOB
- 4 tabs: Overview | Care Plan | Visits | Documents (with icons + V3SubViewTransition)
- Rich fields: primary/secondary diagnoses, contacts, physician, emergency, care plan goals+interventions, visits[], documents[]
- Full V3 tokens + lucide + transitions + back nav

---

## Patient List — Quantified Gaps

**Claude spec:** 6 columns, 6 patients (rich fields), real navigation, lucide, full tokens, HIPAA theme.

**ui-staging `V3PatientListPreview.tsx`:**
- Only 4/6 columns (missing START OF CARE + EPISODE)
- Only 4 patients (vs 6), stripped interface (no startOfCare, episodeStatus, Hold)
- Emoji 🔒 instead of lucide Lock
- Search present but static preview only (no real `useNavigate`)
- No chevron
- Local minimal `const V3` (not shared tokens)
- Rendered inside forced `V3PagePreview` 77.7% wrapper (architectural mismatch — Claude list lived inside shell)
- **Missing ~33% columns, 33% patients, 100% richer fields, real nav, full tokens, lucide**

**Production `PatientListPage.tsx`:**
- Completely different data model (staffing-focused): AcuityLevel, serviceSetting, serviceZone, accmOwner, assignment count. No diagnosis/SOC/episode in list UI.
- 6 columns but different set (Name, Acuity, Setting, Zone, ACCM, Assignments)
- Richer real interactions: search + 4 dynamic acuity filters + 2 settings + dynamic ACCM list from store, Clear filters, responsive (mobile PatientCard stack vs desktop DataGrid)
- Real navigation + param routing
- No V3 Veil Glass (uses existing design system)
- "Phase 1 · Read-only" + synthetic data banner instead of HIPAA lock

**Quantification (ui-staging vs Claude):**
- 2/6 columns missing
- 2/6 patients missing
- Multiple fields (startOfCare, episodeStatus, Hold) + chevron + real nav + full tokens missing
- Weakest port in the batch (emoji fallbacks, static only)

---

## Patient Detail — Quantified Gaps

**Claude spec:** 4 tabs (Overview/Care Plan/Visits/Documents), rich clinical fields (diagnoses, contacts, care plan, visits, documents), V3SubViewTransition, lucide.

**ui-staging `V3PatientDetailPreview.tsx`:**
- Extremely reduced static JSX only
- Header "Elena Delgado • 72" + 2 info cards (PRIMARY CLINICIAN, OPEN CES TASKS=2) + one evidence note
- **0 tabs**, **0 of Claude's sections**
- Different example data
- **0/4 tabs, ~0/10+ fields from Overview, 100% of care/visit/doc data missing**
- Comment claims "Faithful... layout" but is minimal static block

**Production `PatientDetailPage.tsx`:**
- 5 tabs: Overview | Care Needs | Assignments | Preferences (disabled "Phase 2") | History (disabled)
- Completely different tab set from Claude (no Care Plan/Visits/Documents)
- Overview: Patient Information (Setting, Zone, Admission/Discharge) + Care Team (real links to clinicians)
- Care Needs: Required Disciplines/Competencies, Continuity Priority, Shift Needs list
- Assignments: Full Connection list with Discipline/Status badges, rationale, override warnings, real cross-links
- Real store-driven data (Patient + ClinicianPatientConnection + ShiftNeed), live tab switching, empty states, breadcrumbs, responsive
- Different focus: staffing/assignments/shift needs vs Claude's clinical record (diagnosis, visits, care plan, documents)
- 2 tabs disabled (future phases)

**Quantification:**
- ui-staging vs Claude: 4/4 tabs missing, 10+ fields/sections missing, 0 interactions (static vs tabbed + nav)
- Production vs Claude: Tab structure 1/4 match at best; 0 clinical detail fields (diagnosis/visits/careplan/docs); rich but orthogonal staffing data
- Preview has none of the tabbed richness; production is fully functional for its purpose

---

## Cross-Cutting Architectural Gaps

- **Styling**: ui-staging = local V3 const + emojis + forced 77.7% wrapper. Production = established CSS vars + components. Claude = shared V3Tokens + V3PageTransition + lucide + framer-motion.
- **Data**: Claude = static rich clinical mocks. ui-staging = further stripped static. Production = real typed store-driven with live filtering, connections, 6+ patients.
- **Navigation**: Claude + production = real `useNavigate` + params. ui-staging = none (static or alerts).
- **HIPAA Theme**: Prominent in Claude (weak in preview). Absent in production (demo banner instead).
- **Completeness**: Patient previews are the weakest in the batch. Production is complete for staffing domain but semantically diverges from Claude's clinical profile vision.

**Summary Counts (ui-staging vs Claude for Patient pair):**
- List: 2/6 columns, 2/6 patients, 3+ fields, real nav, full tokens, lucide missing
- Detail: 4/4 tabs, 10+ fields/sections, 100% tab content + transitions missing
- Production: Fully implemented but orthogonal (staffing vs clinical); excellent interlinking/responsiveness; 0 direct fidelity to Claude's clinical fields/tabs

---

**Conclusion from Agent 05:**  
The ui-staging Patient pages are visual stubs (cherry-picked JSX inside invented harness) rather than faithful ports. Production delivers a real, typed, filtered, linked staffing feature — but neither matches Claude's V3 clinical profile vision.

Absolute paths provided for direct verification.

<subagent_meta>
id=019e44e7-30f8-7981-80f5-03affa672aa4
type=explore
tool_calls=29
turns=1
duration_ms=250213
</subagent_meta>
