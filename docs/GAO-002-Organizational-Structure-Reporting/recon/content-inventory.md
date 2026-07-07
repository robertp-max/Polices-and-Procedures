# GAO-002 Content Inventory (Recon)

**Primary Source:** src/policy/journey/data/trainingContent.gao.001-007.ts (full block lines ~342–599)
**Parallel Source:** src/v6/screens/pageviews/CareIndeedOnboardingLMS.tsx (GAO-002 at lines 768–958)
**Module Catalog:** src/policy/journey/data/modules.ts (line 18)

## Module Metadata (Journey Data - Canonical)
- moduleId: 'GAO-002'
- policyRefs: ['GV-OG-001']
- cmsRefs: [] (note: content heavily cites 42 CFR 484.105(a/b/c))
- estimatedDurationMin: 45
- splash.title: 'Organizational Structure and Reporting'
- splash.subtitle: 'Who you report to and who reports to whom'
- splash.whyItMatters: 'Surveyors will ask any staff member to identify the Administrator, the DON, and the Compliance Officer, and to describe the chain of escalation. Inability to answer is a survey finding under 42 CFR 484.105.'
- splash.narration: 'In this module you will learn the organizational structure of the agency, the reporting lines, and how to escalate clinical, compliance, and HR concerns. Surveyors will ask any staff member to identify key leaders. Knowing this is not optional.'

## Navigation
'One card at a time. Audio narration plays on every card. Challenges must be answered. Final test requires 80%.'

## Lessons & Cards (Journey Data)

**Lesson 1: GAO-002-L1 — "Governing Body and Executive Roles"**
Objectives: Identify GB, Admin, DON, CO roles; describe dual-reporting of CO.

Cards (key verbatim):
- Summary: Learn four governance pillars and reporting lines.
- C1: Governing Body (final authority under 42 CFR 484.105(a); approves budget/scope/QAPI/CO appointment; meets quarterly and reviews compliance/quality reports).
- C2: Administrator and Director of Nursing (Admin day-to-day ops 484.105(b); DON supervises clinical 484.105(c); both available during operating hours + designate qualified alternates).
- C3: Compliance Officer Dual Reporting (reports to BOTH Admin AND Governing Body per OIG; direct report OK; prevents suppression).
- C4: Field Example (HHA observes RN skipping wound measurements → documents objectively → calls CO hotline per GV-OG-001 (not just HHA sup or direct confrontation) → confirmation + no retaliation).
- C5: Knowing Your Chain for Surveys (surveyors ask on spot: names of Admin/DON/CO + how to report if sup unavailable; must answer from memory; names/hotline posted in office/portal).
- CH: Escalation Pathway (scenario: suspect billing fraud, supervisor seems involved → correct: direct to CO hotline; policy GV-OG-001; feedback on dual reporting/whistleblower protection; complianceImpact: suspected false claims under CO-CP-005; realWorld: False Claims Act treble damages).

**Lesson 2: GAO-002-L2 — "Coverage and Continuity"**
Objectives: Identify required leadership coverage; describe how to find on-call hierarchy.

Cards (key verbatim):
- Summary: Documented coverage hierarchy, on-call schedule, locate alternates in real time.
- C1: On-Call Hierarchy (primary on-call clinician → on-call DON → on-call Administrator; roster posted weekly in EMR and texted to all field staff; outdated rosters trigger survey finding).
- C2: Designated Alternates (written designation when Admin or DON absent >1 business day; workforce notified; alternates meet HR-JD-001/002 quals).
- C3: Field Example (on-call LVN 10 PM call: patient unresponsive → direct HHA to call 911 and stay on scene, reach on-call DON; per GV-OG-001 document every call attempt/decision in real time in EMR; next morning on-call Administrator receives summary via compliance log).
- C4: Practical Tip (Friday afternoon screenshot current on-call roster to agency phone; prevents "could not reach anyone" finding if cell service fails in field).
- CH: Find the On-Call (Saturday 21:00: need clinical guidance on possible adverse event → correct first call: on-call clinician per posted roster).

## Final Test (Journey Data)
- 80%, failAction: 'remediation'
- Q1 (matching): GB (approve scope + CO appt), Admin (day-to-day 484.105(b)), DON (supervise all clinical), CO (receive/investigate; dual to Admin + GB).
- Q2 (true_false): "The Compliance Officer reports only to the Administrator." (False — dual required).
- Q3 (sequencing): Stabilize patient/immediate safety → Contact on-call DON or designated alternate → Document objectively → Brief regular supervisor on return.
- Q4 (structured_input): Name the role(s) required to be available during all operating hours and designate qualified alternate (Administrator and/or DON per 484.105).

## v6 LMS Version (Parallel Implementation)
- Title: "Organizational Structure & Reporting Lines"
- durationMinutes: 30
- policyMapped: ["GV-OG-001"]
- 8 pages + summary + 5-question exam (80%):
  1. Why Organizational Structure Matters (42 CFR § 484.105; patient safety requirement; know supervisor, escalate, surveyors verify).
  2. Governing Body (484.105(a); full legal authority; GV-GB-001 responsibilities).
  3. Administrator Role (484.105(b); day-to-day; table of responsibilities).
  4. Director of Nursing (484.105(c); RN; all patient care services; core functions).
  5. Clinical Staff Structure (484.115 table: positions, CoP, reports to, supervises; PTA/COTA direct supervision warning).
  6. Your Reporting Chain (Day 1 questions: direct sup, DON, Admin, CO, hotline CO-CP-006; surveyors will ask).
  7. Communication Pathways (clinical: You → Sup → DON → Admin → GB; compliance: CO or hotline; workplace: HR; bypass only for patient safety emergencies or compliance violations).
  8. Module Summary (key takeaways box).
- Exam: GB authority, DON RN credential, PTA supervision (permanent), primary compliance channel (CO/hotline), when to bypass.

## Key Concepts (for coverage)
- Four governance pillars + reporting lines.
- 42 CFR 484.105 requirements (GB authority, Admin/DON availability + alternates).
- CO dual reporting (OIG; direct OK; prevents suppression).
- On-call hierarchy and roster practices.
- Designated alternates and qualifications.
- Surveyor verification (names + hotline from memory; escalation description).
- Bypass chain only for patient safety/compliance.
- Documentation of escalations.
- Field examples and practical tips.
- Whistleblower protection.

## Gaps / needs_review (from extraction)
- cmsRefs: [] at module level (content cites 484.105 heavily — recommend adding).
- Splash image uses mission-values asset (thematic mismatch for org structure; dedicated org chart PNG exists but unused in training).
- No explicit org chart maintenance cadence in training content.
- Roster location instructions needed ("posted in office and on employee portal").
- Cross-module refs (CO-CP-005, HR-JD-*) correct but may need prereq notes.
- Two sources are complementary (journey more governance + interactive challenges; v6 more visual tables + comms paths). No contradictions on core facts.

**All verbatim from sources. No invention. Source of truth for architecture: journey data for interactive structure; v6 for additional detail where richer.**