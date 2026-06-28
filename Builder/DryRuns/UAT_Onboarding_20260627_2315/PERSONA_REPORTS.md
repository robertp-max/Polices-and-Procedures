# PERSONA_REPORTS — Independent Findings

## Persona 1 — Home Health Administrator Under Real-Life Stress (Menopause, interruptions, low patience)

**What tested:**
- Dashboard / admin view for "who is blocked and why"
- Can I see status in 5s?
- Mistake recovery (wrong employee, refresh)
- Evidence location

**Frustrations:**
- JourneyAdminScreen metrics are static literals ("14", "82%"). Cannot trust the numbers.
- No single "blocked employees" list derived from real data. Must hunt across seeds + store.
- Switching employees in journeyStore does not clearly reflect in the LMS player (different state keys).
- "Appendix F" link takes you to a certificate preview, not the screening checklist you need to clear someone.

**What trusted:** Nothing on first glance. Would call IT or make a spreadsheet.

**What did not trust:** All KPI tiles, completion claims, "on track".

**Findings contributed:**
- P1-001 (admin numbers fake)
- P2-001 (trust destroyed)
- P0-001 (cannot see real progress)
- P0-004 (wrong Appendix F surface)

**Release impact:** Administrator cannot confidently clear batches without creating survey risk. High support burden.

---

## Persona 2 — DON Karen (blunt, patient safety focused, does not trust pretty UIs)

**What tested:**
- Can unqualified bypass?
- Can sign-off be faked/duplicated?
- Role separation RN vs LVN vs HHA?
- Supervised visit enforcement + DON signature traceability?
- Appendix F as real hard stop before any orientation?

**Findings:**
- **P0-005 major:** /journey/supervisor is Clinical Hub (optional). No visit logging form. RN-SUP / LVN-SUP modules declare `supervisedVisitsRequired` but no UI path for DON to record the 2-3 satisfactory visits + sign. `clearForIndependentWork` exists in store but not invocable from role surface.
- Role data in modules.ts is excellent on paper (separate lists). But player does not enforce current employee.role.
- Appendix F sign in store requires role==='HRDirector' and all items PASS/NA — good logic, but the surface to reach that for a new hire is not the appendix-f route (see P0-004).
- Learner can complete GAO without ever flipping appendixFCleared on the employee record used by canStartModule.
- No visible audit for "DON Elena signed this on date X with these visits attached."

**What trusted:** The policy refs and catalog intent look defensible.
**What did not trust:** Any claim that "a clinician is cleared" — the data backing it is not in one place and not visible here.

**Bounty:** N/A (not clinician hunter)

**Release impact:** DON cannot defensibly release anyone to independent practice. This is the core accountability failure.

---

## Persona 3 — Adversarial State Surveyor (CDPH/CMS/ACHC, wants condition-level findings)

**Tested ruthlessly:**
- Is every "complete" backed by attributable evidence + timestamp + signer identity + role?
- localStorage?
- Can records be altered post-facto without trail?
- Placeholder / simulated language vs claims?
- Missing required fields on signature?
- Can you produce a packet?

**Key findings (ruthless):**
- **P0-003:** Everything is localStorage. Surveyor will ask "where is the system of record?" Answer: browser on the clinician's phone. Tamperable with devtools. No chain of custody.
- P0-001 + P0-002: completions and clearances can be independent of each other. "Complete" in player != cleared in employee record.
- Simulated everywhere: activeTime "MVP / not CDPH-validated", finalExam "simulated", affidavit "draft". Yet surfaces talk about competency journey.
- No server-side signature or evidence store. addEvidence just pushes JS object.
- Onboarding-v2 shows "complete" units from static seed independent of the other two systems.
- No exportable, signed personnel training file for a specific employee that includes raw lesson views + quiz scores + supervisor visits + DON clearance + hashes.
- "ACHC completion" functions emit "UAT-only" / "backend not implemented" notes in the data objects themselves.

**What would be cited:**
- False or misleading training records (multiple sources of truth).
- Lack of immutable audit.
- Ability for field staff to self-certify without defensible evidence.
- localStorage for compliance-critical data.

**Release impact:** Condition-level finding risk. Would recommend not relying on this for any personnel file until backend + audit is done.

---

## Persona 4 — Clinician Bounty Hunter A: RN Case Manager ($ bounty mode)

**Tested aggressively:** direct URLs, refresh at bad times, double-click complete, fail quiz then leave, multiple tabs, complete with missing required, role mismatch, clear state then re-complete.

**Validated unique findings (bounty eligible):**
1. P0-001 Dual state bypass — completed full GAO track in player, journeyStore attempts still empty for Maria. ($1,000)
2. P0-002 Direct URL to module with appendixFCleared=false. Loaded and could "progress". ($2,000)
3. P0-006 Quiz answer keys in client bundle. Read correct answers, set passed via state. ($4,000)
4. P1-005 Multi-tab / refresh time manipulation + state drift. ($8,000)
5. P1-008 Completed DON modules while current employee is RN (no role gate hit). ($16,000)
6. P0-007 None-method modules pass on weak lessonStatus. ($32,000)

**Bounty calculation:** 1+2+4+8+16+32 = **$63,000** (cumulative doubling)

**What frustrated:** Felt like "I could get paid to do nothing and still show complete on some dashboards."

**What trusted:** Nothing.

---

## Persona 5 — Clinician Bounty Hunter B: Therapist / Field Clinician (PT/OT)

**Focus:** practical mobile use between visits, content length, whether progress saves reliably, time waste.

**Validated unique:**
1. P0-001 (dual state, same as A but noted independently) — $1k
2. P1-002 Mobile player cramped / no obvious complete on small screen — $2k
3. P2-003 Long narrated pages, hard to resume between visits, no bite-size indicator — $4k
4. P0-002 URL bypass while driving between patients — $8k
5. Active time can be satisfied by just leaving tab open (or forcing via flag) — $16k

**Bounty:** $31,000

**Notes:** "I don't have time for 30-min narrated pages on a phone in a parking lot. If the gate requires it, make it 5 min max or async."

---

## Persona 6 — Clinician Bounty Hunter C: HHA/LVN/Field Worker (phone primary, less technical)

**Focus:** understandable? Can I cheat by accident or on purpose? Forgiveness on mistakes?

**Validated unique:**
1. P0-001 Dual state — $1k
2. P0-007 / P1-009 "None" modules + vague "advance to complete" — unclear if I actually did the training. Cheated by just clicking next. $2k
3. P2-006 No real signature pad on mobile for any sign-off. Just "pretend". $4k
4. P0-002 Could open module before I even knew what Appendix F was. $8k
5. Long dense text, small buttons near edges, no high-contrast warning when blocked. $16k

**Bounty:** $31,000

**Observation:** "I would just ask the office 'is this done?' and click whatever they say. The app doesn't stop me."

---

## Bounty Summary (clinicians only, unique validated)

- Hunter A (RN): $63,000 (6 issues)
- Hunter B (Therapist): $31,000 (5)
- Hunter C (HHA/LVN): $31,000 (5)

**Grand total "bounty" if real program: $125,000** across distinct reproducible defects.

Duplicates (e.g. P0-001 hit by all) counted once.

## Synthesis Across Personas
Every persona independently discovered the dual-state + no-hard-gate + local-only cluster as top issues. The supervisor surface mismatch was called out by DON + Surveyor + RN hunter. Content/role enforcement problems by field clinicians.

No persona trusted the system for real compliance or patient-safety clearance.
