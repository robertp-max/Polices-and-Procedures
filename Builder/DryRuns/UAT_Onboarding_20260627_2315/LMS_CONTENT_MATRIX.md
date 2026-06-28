# LMS_CONTENT_MATRIX

Source inspection of data/modules.ts (canonical catalog), CareIndeedOnboardingLMS.tsx (player data + exams), contentV2Adapter, achc* data, v2ModuleQuiz, advancedTraining/*.

| Module/Group | Lessons Present | Challenge Present | Quiz Present | Answer Key Verified | Active Time Logic | Role Fit | Placeholder? | Result |
|--------------|-----------------|-------------------|--------------|---------------------|-------------------|----------|--------------|--------|
| GAO-001 to GAO-027 (General) | Yes (via CareIndeed or adapter pages) | Some (knowledge checks in player) | GAO-EXAM only (80%) for the group | Yes, client correctIndex exposed | Yes (20s/lesson or flag) | ALL (good) | Some visual "pending", long text | Partial. Many "method: None" = no quiz/challenge required individually. |
| GAO-EXAM | N/A (summary quiz) | N/A | Yes (5-? items from GAO_EXAM_ITEMS in appendices + LMS) | Yes (in JS) | N/A | ALL | No | Passable but client-side. |
| RN-001 to RN-015 + RN-SUP | Role list present | Via player challenges | Some quizzes per module in LMS | Client | Yes | RN only (catalog) | No in catalog | Catalog strong. Player execution does not enforce role. RN-SUP declares supervisedVisitsRequired:2 but no logging UI. |
| LVN-001..LVN-SUP | Same | Same | Same | Client | Yes | LVN | No | Same issues. Min 3 visits. |
| PT/OT/SLP/MSW/HHA/ADM/DON tracks | Defined per role with policyRefs + cmsRefs | Player-provided | Module exams in LMS | Client | Yes | Per-role in data | Some advanced (cms485) have separate verification script | Good regulatory mapping on paper. CMS-485 advanced training has external compare script suggesting content port risk. |
| Annual / ACHC (M01-M12 etc) | ACHC_Annual_Assembled + lesson data | Yes (challenges) | Yes (some) | Mixed | Active time in learner | Mixed annual | Some "archival" | Separate from main journey for employees. |
| Final / Assessment | Final path | Final exam | Yes | Client | N/A | ALL | Simulated labels | "simulated" in gates. |
| Optional Clinical (Supervisor) | N/A (hub) | Checkboxes only | No | N/A | N/A | Optional | Explicit "does not affect certificate" | Correctly marked optional. |

**Content Quality Observations (brutal):**
- Many modules with `method: 'None'` mean "read and advance". Defensible? Marginal for compliance training. No attestation recorded.
- Long prose in CareIndeedOnboardingLMS narrations — suitable for classroom, questionable for field mobile.
- Advanced cms485 and qapi have dedicated data + test scripts (good intent) but still client quiz risk.
- No obvious broken media in inspected paths (mediaManifest + narrationManifest exist), but many "Visual Aid Pending" placeholders.
- Role separation in catalog is the best part of the system.
- Typos / vagueness: not rampant, but "close enough" language appears in examples.

**"complete" claims without enough active content:** Yes — the None modules and the disconnect between player complete and attempts record.

**ACHC-ready / CMS-ready claims:** Unsupported. Code itself labels parts UAT-only / simulated / not validated.
