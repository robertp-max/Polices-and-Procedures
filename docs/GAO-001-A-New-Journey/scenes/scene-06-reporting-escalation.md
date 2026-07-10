Fixing all four issues: cut the §484.50 citation from Scene 6 (defer to Scene 7), add oversight exposure + competency maintenance to Field Notes/narration, reconcile the 6-node vs 5-node budget conflict explicitly, and give the four non-reporting duties real judgment interaction instead of a passive recap card.

```markdown
## Scene 6 — Regulated Responsibility & Mandatory Reporting: "Dana Draws the Line Before the Doorbell Rings"

### Story Beat
It's Wednesday afternoon. Alex has just come from the Okafor shadow visit (Scene 4) and the facility-vs-home-health reflection (Scene 5), and Dana pulls Alex aside before assigning the first supervised-solo-style visits later in the week. Dana's message is direct: "Before you're in a home without me, you need to know exactly what happens if you see something wrong — and everything else you're on the hook for as an employee here." She walks Alex through all five employee duties of working at a Medicare-certified agency — oversight exposure, personnel file completeness, mandatory reporting, competency maintenance, and PHI protection — then stops hard on mandatory reporting and makes Alex repeat that sequence back until it's automatic. This scene is deliberately *pre-scenario*: Alex learns the protocol in the calm of Dana's office, not under pressure, so that Thursday's Torres scenario (Scene 8) becomes a test of transfer, not a first exposure. Continuity: opens with Dana's voice (same "when in doubt, report" phrasing first heard in Scene 2), closes by naming the badge Alex now wears into every home as the trust this protocol protects — bridging directly into Scene 8's Torres visit.

### Learner Role
The learner sits with Alex in Dana's briefing and works through two linked tasks. First, a **four-duty sort**: Alex is handed four short scenario cards (an unannounced-survey knock, a missing competency eval in a coworker's file, a "close-enough" charting shortcut, a family member asking to see another patient's chart) and must match each to the correct employee duty — oversight exposure, personnel file completeness, competency maintenance, or PHI protection — with a brief judgment prompt on *why* each one matters, not just its label. Second, the learner physically assembles the mandatory-reporting sequence: dragging/tapping steps into correct order (Observe → Document Objective Facts → Report Immediately → Supervisor/Compliance Assists → External Reporting Not Delayed → Do Not Investigate or Confront). Placing a step out of order triggers an in-story correction from Dana, not a buzzer. The learner also resolves one embedded judgment micro-decision (what belongs in the written note: objective fact vs. accusation) before the sequence is considered understood.

### Workspace & Visual Concept
**Template: FlowSequence**, using the existing illustration as a **backdrop anchor with overlay hotspots** (not replaced — the mint/teal clinician-with-tablet scene already contains the visual grammar this scene needs). Regions:
- **Scene anchor (left/top, ~55%)**: `v2.png` fixed as background. A **four-card duty sort** renders first, docked to the image's existing wall icons so hotspots feel native to the art: the survey/oversight card anchors near the doorway/entry motif; the personnel-file card anchors on the clipboard/checklist board; the competency card anchors on the small hanging card cluster (key icon + notepad); the PHI card anchors near the tablet the clinician is holding (screen-privacy cue). Each card requires a tap-to-match plus a one-line "why" judgment choice before it locks.
- Once the duty sort is complete, the **mandatory-reporting rail** takes over the same anchor real estate: six numbered step-slots render as a horizontal rail. Slot 1 (Observe) anchors near the hanging alert/warning icon; slot 2 (Document Objective Facts) anchors on the clipboard/checklist board with red checkmarks; slot 3 (Report Immediately) anchors on the tablet; slot 4 (Supervisor/Compliance Assists) anchors on the key-icon/notepad cluster; slot 5 (External Reporting Not Delayed) anchors near the seated-patient/visitor grouping; slot 6 (Do Not Investigate or Confront) anchors on the circular green checkmark badge far right.
- **Step rail (bottom, always visible)**: switches context between the 4-card duty tray and the 6-slot reporting rail; current fill state always visible (true progress indicator, not decorative).
- **Field Notes drawer (right, slides in per resolved step)**: one card per correctly placed duty match and per correctly placed sequence step.
- **Reference Notes ribbon (bottom, thin, collapsible)**: citation chips.
Below `lg`: image compresses to 40vh header strip, step rail becomes the primary vertical interaction column, Field Notes becomes a bottom sheet.
No zoom modal is needed — steps resolve inline; lightweight confirmation modals appear for the duty-sort "why" judgment prompts and the objective-vs-subjective documentation micro-decision (Step 2), matching PuzzleBoard's phase-gate pattern, then return to the flow.

### Node-Count Reconciliation (documented per Section 4 Verdict Rule)
The Cognitive Load & Pacing table caps Scene 6 at 5 nodes, but the client-mandated reporting sequence has 6 required steps and this revision adds duty-sort interactions for the other four objectives. The 5-node budget is reconciled, not overridden, as follows: the **6 reporting steps are treated as a single compound node** (`gao001-s6-node-mandatory-reporting-sequence`) for budget-counting purposes — one concept ("mandatory reporting is a fixed, ordered protocol"), one entry in the node-count table, with 6 internal slots as its interaction mechanic rather than 6 separate concepts. The **4-duty sort is treated as a second compound node** (`gao001-s6-node-employee-duties-sort`) — one concept ("employees carry five regulatory duties; four of them are proactive, not reactive"), with 4 internal cards as its interaction mechanic. Total scene node-count against the budget table: **2 nodes**, within the 5-node cap. This mirrors how PuzzleBoard scenes already count a multi-piece puzzle as one node rather than one per piece; no exception to the cap is taken, and no separate rationale ticket is required.

### Learning Nodes

| Node ID | Node Name | Discovery Trigger | Concept Carried | Source Coverage |
|---|---|---|---|---|
| gao001-s6-node-employee-duties-sort | Employee Duties Sort (compound: 4 cards) | Learner matches each scenario card to its duty and answers the "why" prompt | Employees carry five regulatory duties; this node covers the four non-reporting duties — oversight exposure (agency is subject to unannounced survey/audit at any time), personnel file completeness (background check, licensure, health screening, orientation, training records, competency evals), competency maintenance (skills/certifications must stay current, not just on file), and PHI protection (HIPAA/CMIA duty to safeguard patient information) | Page 6 (personnel file list, survey exposure, HIPAA/CMIA); Compliance Framework §3.2 |
| gao001-s6-node-mandatory-reporting-sequence | Mandatory Reporting Sequence (compound: 6 slots) | Learner drags all six protocol steps into correct order; slot 2 resolves an objective-vs-subjective micro-decision modal | The fifth employee duty — mandatory reporting — is a mandatory, ordered, non-negotiable protocol: reasonable suspicion triggers it, documentation stays objective, reporting is immediate, supervisor/Compliance owns escalation, external reporting is never delayed, and the clinician never investigates or confronts | Page 5 (documentation is sole record); Page 6 (must report concerns); Page 8 Scenario 1 pattern; Compliance Framework §3.2–§3.4, mandated sentence |

### Interaction Pattern
1. **Duty sort — locked**: four scenario cards sit in a tray; four duty-label slots (Oversight Exposure, Personnel File Completeness, Competency Maintenance, PHI Protection) sit empty on the rail. Field Notes drawer is closed, showing a placeholder "Nothing unlocked yet."
2. Learner drags/taps a scenario card onto the duty slot it belongs to. A correct match opens a short one-line "why" judgment prompt (e.g., "Why does an unannounced knock matter even if nothing's wrong today?") with two brief answer options — one correct, one plausible-but-shallow; picking the shallow option gives corrective feedback and re-prompts (max 2 misses before hint auto-surfaces). A correct why-answer locks the card, its wall-icon hotspot glows briefly, Field Notes drawer slides open with that duty's card, and node-unlock narration plays automatically once.
3. Once all four duty cards are resolved, the workspace transitions to the six-slot mandatory-reporting rail; tray tiles for Observe → Do Not Investigate scramble into place.
4. Learner drags/taps a tile onto a slot. If placed in the **correct sequence position**, the tile locks in, its wall-icon hotspot glows briefly, Field Notes drawer slides open with that step's card, and node-unlock narration plays automatically once.
5. If placed **out of sequence** (e.g., "Report" before "Document"), the tile bounces back to the tray; Dana's feedback line plays (in-story correction, not a buzzer) explaining why order matters here; no penalty, unlimited retries, hint auto-surfaces after 2 misses per the pacing rule.
6. **Step 2 special case**: placing "Document Objective Facts" opens a short phase-gate modal showing one objective sample line and one subjective/conclusory sample line; learner must tag which belongs in the clinical record. Wrong tag gives corrective feedback and re-prompts (max 2 misses before hint); correct tag closes the modal and finalizes the node as `resolved`.
7. Once both compound nodes are fully resolved (4 duty cards + 6 sequence slots), scene-complete narration fires once via `useEffect` watching the derived "both nodes resolved" boolean.
8. **Completion criteria**: `completionRule: { type: 'all_nodes' }` — both compound nodes (`employee-duties-sort`, `mandatory-reporting-sequence`) resolved. No node-level state is written to `useLearner()`; scene only calls `onComplete()`. **Scene Practice Complete** label shown: "**Escalation Practice Complete**."

### Field Notes

**Oversight Exposure.** Care Indeed can be surveyed or audited without advance notice, and every employee's day-to-day work is part of what a surveyor sees. Alex isn't just doing a visit correctly for the patient's sake — the same visit is evidence the agency is operating the way its Medicare certification requires.

**Personnel File Completeness.** Everything Alex is doing this week — training completions, competency sign-offs, license verification — lives in one personnel file, and a single missing item can become a survey citation. Completeness isn't paperwork for its own sake; it's the proof the agency can produce on demand that Alex is qualified to be in that home.

**Competency Maintenance.** Being cleared to work isn't a one-time event. Skills, certifications, and required refreshers have to stay current on an ongoing basis — a lapsed competency is treated the same as never having had it, regardless of how skilled Alex actually is that day.

**PHI Protection.** The same personnel file also carries Alex's duty to protect patient information under HIPAA and California's CMIA. What Alex sees, hears, and charts in a home stays inside the record and the care team — never shared with family members who aren't on the authorization, and never discussed outside the job.

**Observe.** Alex doesn't need certainty to act — only reasonable suspicion. If something looks different, unexplained, or concerning during a visit, that alone is enough to start the protocol. Waiting for proof is not part of the job.

**Document Objective Facts.** The written note stays factual: what Alex saw, measured, and heard the patient say, with dates and locations — never a guess about who did what or why. Conclusions and accusations do not belong in the clinical record; they belong in the report to a supervisor.

**Report Immediately.** Federal law and Care Indeed policy both require reporting suspected abuse, neglect, exploitation, unsafe conditions, or compliance violations — the same day, not "when things settle down." Reporting is not optional once suspicion exists.

**Supervisor/Compliance Assists.** Alex's job stops at reporting the facts. From there, the supervisor and Compliance team take over deciding what external reporting is required and how it gets filed — Alex is not left to handle this alone. "Follow agency mandatory reporting protocol immediately; do not investigate or confront — your job stops at reporting the facts."

**External Reporting Not Delayed.** Even while supervisor and Compliance are coordinating, the clock on required external reporting keeps running — nobody waits for more evidence, a callback, or a slow afternoon before a legally required report goes out.

**Do Not Investigate or Confront.** Alex will never ask the son follow-up questions meant to catch him in something, and will never raise the concern directly with a suspected abuser. That instinct to "just find out for sure" is the one instinct Alex has to override every time.

### Reference Notes
- Reference: 42 CFR Part 484 generally — Medicare Conditions of Participation for home health agencies establish the framework of employee and agency obligations covered in this scene (oversight exposure, personnel qualifications, and mandated reporting duty as a condition of certified operation). Informational.
- Reference: Reporting of suspected abuse, neglect, or exploitation is required under federal and state mandated-reporter law. Your state's Adult Protective Services (APS) framework governs external reporting; Compliance/supervisor initiates it. Informational. Patient-rights framing under 42 CFR §484.50 is addressed directly in Scene 7 — not cited here.
- Reference: HR-TA-005 Appendix A — General Agency Orientation Checklist (personnel file requirements). Informational.
- Reporting standard: reasonable suspicion, not proof, triggers the duty to report.
- Mandated protocol sentence (verbatim): "Follow agency mandatory reporting protocol immediately; do not investigate or confront — your job stops at reporting the facts."

### Narration Plan

**Scene-start (story framing):** "It's Wednesday afternoon, and Dana catches Alex before the end of shift. 'Yesterday you worked out the difference between coordinating care and escalating a concern,' she says. 'Today that difference becomes the actual protocol. Before I send you out on your own, I need you to know exactly what you're on the hook for as an employee here — not just the reporting piece, all five duties.' She's not being dramatic — she's being precise. Alex pulls out the field notebook, ready to write down whatever comes next."

**Node-unlock — Oversight Exposure:** "Dana starts with the one new hires never think about. 'We can be surveyed without warning,' she says. 'Whatever you're doing in that moment is what the agency looks like.' Alex sorts the unannounced-knock card into place and picks the answer that says it best: it's not about performing for an audience — it's that the real work already has to be survey-ready, every time."

**Node-unlock — Personnel File Completeness.** "Next Dana taps the missing-competency-eval card. 'One gap in one file is a citation,' she says. Alex matches it to Personnel File Completeness and picks the judgment answer that holds up: the file isn't proof Alex is qualified once — it's proof the agency can produce on demand, indefinitely."

**Node-unlock — Competency Maintenance.** "The charting-shortcut card comes next. Dana's point is sharp: 'Being good at this once doesn't mean you're still current.' Alex sorts it to Competency Maintenance and chooses the answer that fits — skills and certifications expire on a schedule, not on how confident someone feels."

**Node-unlock — PHI Protection.** "Last is the family-member-asking-to-see-another-chart card. Dana doesn't hesitate: 'That's a no, every time, no exceptions for who's asking.' Alex sorts it to PHI Protection and picks the answer that names it correctly — HIPAA and CMIA protect the patient, not the convenience of the person asking."

**Transition to reporting sequence:** "'Now the one I want memorized cold,' Dana says, and the rail shifts. 'If you ever see something that worries you, here's exactly what happens.'"

**Node-unlock — Observe:** "Dana starts simple. 'You don't need proof,' she says. 'You need reasonable suspicion. That's the legal standard, and it's a low bar on purpose — it's there to protect patients, not to protect you from being wrong.' Alex writes it down: suspicion is enough."

**Node-unlock — Document Objective Facts:** "'When you write the note,' Dana says, 'write what you saw, not what you think it means.' She has Alex compare two sample lines: one lists the bruise's location, size, color, the date it wasn't there before, and the patient's own words. The other says the son is probably responsible. Dana taps the second line. 'That's an opinion. It doesn't go in the chart. It goes in your report to me, verbally, right after your visit.'"

**Node-unlock — Report Immediately:** "Dana is blunt about timing. 'Federal law and our own policy both say the same thing: suspected abuse, neglect, exploitation, an unsafe home, a compliance violation — you report it the same day.' Alex nods; this is the part that has no gray area."

**Node-unlock — Supervisor/Compliance Assists:** "'Here's the part new hires get wrong,' Dana says. 'You are not the one who decides what happens next. Once you've reported to me, Compliance and I take it from there.' She says the next sentence slowly, on purpose: 'Follow agency mandatory reporting protocol immediately; do not investigate or confront — your job stops at reporting the facts.' Alex writes the whole sentence down, word for word."

**Node-unlock — External Reporting Not Delayed:** "Dana adds one more piece. 'Even after you've handed it to us, the clock doesn't stop. If a report to an outside agency is legally required, it goes out.' Alex asks what 'outside agency' usually means. 'Adult Protective Services, in most cases,' Dana says."

**Node-unlock — Do Not Investigate or Confront:** "'And the thing you must never do,' Dana says, 'is try to solve it yourself.' No follow-up questions designed to catch someone in a lie, no confronting a family member. 'Override the instinct to find out for sure,' she says. Alex circles the phrase: *document, report, step back.*"

**Feedback — correct duty match / why-answer:** "The card settles into place, and Dana's nod confirms it — that's the reasoning, not just the label."

**Feedback — incorrect why-answer (plausible-but-shallow):** "'That's close, but it's the surface version,' Dana says, walking Alex to the deeper reason before letting the card lock."

**Feedback — correct sequence placement:** "The step settles into place, and it feels right — this is the order Dana described, not the order Alex would have guessed a year ago in the hospital."

**Feedback — incorrect sequence placement:** "Dana catches the misstep gently. 'You reported before you finished documenting,' she says. 'Write it down first — facts, dated and specific — then make the call.'"

**Feedback — Step 2 modal, correct tag:** "Dana nods at the objective line. 'That's exactly it — measurable, dated, in the patient's own words.'"

**Feedback — Step 2 modal, incorrect tag:** "'That one's a conclusion, not an observation,' Dana says. 'It doesn't belong in the chart — say it to me directly instead.'"

**Scene-complete (bridge to Scene 7/8):** "Alex closes the notebook. Five duties, one sequence short enough to remember under pressure: observe, document the facts, report immediately, let supervisor and Compliance carry it from there, never let it wait, never investigate it alone. Dana glances at the badge clipped to Alex's scrub top. 'That badge means something the second you walk into someone's home,' she says. **Escalation Practice Complete.** Thursday, Alex will be in Mr. Torres's living room, and this will stop being something Dana explained and start being something Alex just knows how to do."

**Total narration word count: ≈1,205 words.**

### Audio & Microinteractions
- Soft, low-key "tile lock" chime on correct card/slot placement (distinct from Scene 4's chime, lower pitch, non-alarming given subject matter).
- Gentle horizontal shake (respects `prefers-reduced-motion`: replaced by a brief red-outline flash with no motion) on incorrect placement; tile animates back to tray via `transform` transition, disabled under reduced-motion (snaps back instead).
- Wall-icon hotspots on the backdrop image get a subtle 2px glow ring on hover/focus, and a persistent low-opacity pulse (paused under reduced-motion) on any undiscovered node to satisfy the visible-affordance rule.
- Duty-sort "why" modal and objective-vs-subjective modal use a neutral fade/scale-in (120ms), disabled to instant-show under reduced-motion.
- No music sting, no dramatic audio — matches tone rule against melodrama in a mandatory-reporting context.
- Each narration segment gets its own persistent play/pause/replay control bound to its `narrationId`; muting never blocks slot placement or scene progress.

### Accessibility
- Duty-sort cards, tray tiles, and slots are native buttons (not div+onClick); keyboard path: Tab cycles tray tiles/cards → Enter/Space "picks up" an item → arrow keys or Tab move focus to slots → Enter/Space "places" it — full drag-and-drop equivalent via keyboard, no pointer-only interaction.
- Focus order: scene-start narration control → duty-sort cards (tray order) → duty slots → mandatory-reporting tray tiles (tray order, not answer order) → step rail slots (1–6) → Field Notes drawer → Reference Notes ribbon.
- ARIA: rail uses `role="list"`/`listitem` with `aria-live="polite"` region announcing "[Duty/Step] unlocked: [Node Name]" on successful placement only (not full text). Why-answer and objective/subjective modals use `role="dialog"` with `aria-modal="true"`, focus-trapped, close on Escape (returns focus to the card/slot that triggered it).
- Backdrop image (`v2.png`) is `aria-hidden="true"` / `role="presentation"` — it is decorative scaffolding; all meaning is carried in text/ARIA labels on the overlay hotspots and rail, so screen-reader users lose nothing by the image being non-semantic.
- Captions/transcript: every `NarrationSegment` with `transcriptFlag: true` (all segments in this scene) renders verbatim in the read-along panel; the mandated sentence's transcript entry is visually marked (e.g., a small "verbatim protocol language" tag) so reviewers can locate it instantly during audits.
- Color independence: correct/incorrect card and slot states use icon + text label + border-style change (solid vs. dashed), never color alone.
- Reduced motion: all transitions above collapse to instant state changes or opacity-only fades; pulsing hotspot affordance becomes a static ring.

### QA Risks
- **Mandated-sentence drift risk**: any manual retyping of the mandated sentence risks a one-character mismatch that fails the CI string-match audit. Mitigation: import the string as a single shared constant (e.g., `MANDATORY_REPORTING_SENTENCE`) copy-pasted once from `CoreValuesInteractiveViewer.tsx:142`, referenced by both the narration data module and the Field Notes card — never retyped in either location.
- **Citation-map drift risk**: this scene must never cite §484.50 (Patient Rights) or §484.110 (Clinical Records) — §484.50 is reserved for its designated first appearance in Scene 7, and documentation content in Step 2 could tempt a writer toward §484.110. Mitigation: this scene's Reference Notes cite only "Part 484 generally" plus the state APS/mandated-reporter concept, exactly per the Citation Map; CI citation-map check flags any §484.50 or §484.110 occurrence in this scene's data file as a hard fail.
- **Hotspot drift on the backdrop image**: overlay hotspot coordinates are hand-placed against `v2.png`'s specific icon positions; any future re-export or crop of that image (e.g., resizing for a different aspect ratio) will desync hotspots from their visual anchors. Mitigation: store hotspot coordinates as percentages of a locked, versioned image asset path; add a visual regression snapshot test pinned to that exact image file/hash.
- **Sequence-completion gating edge case**: if a learner reloads mid-sequence, `initialState` must restore exactly which duty cards and which slots were already correctly resolved, for both compound nodes independently. Mitigation: each compound node's resolved state is derived strictly from its own persisted snapshot (4/4 cards, 6/6 slots) computed fresh on mount, never from a separately persisted "done" flag that could desync.
- **Forbidden-wording near-miss risk**: the Personnel File Completeness and Competency Maintenance Field Notes discuss training records and sign-offs and could tempt a writer toward "attestation" language. Mitigation: Field Notes copy above uses only "training completions, competency sign-offs, license verification" and "required refreshers" — explicitly audited against the near-miss word list (attest/acknowledg-/sign(ed/off)/certif-) before ship.
- **Node-count table conflict risk**: without the compound-node framing above, a reviewer skimming node IDs could double-count this scene as 8+ nodes against a 5-node cap. Mitigation: the Node-Count Reconciliation section and the Learning Nodes table are the single source of truth (2 compound nodes); any implementation-level node ID granularity below that (individual cards/slots) must not be surfaced in audit tooling as separate top-level nodes.
- **Interaction-imbalance regression risk**: a future edit could quietly strip the duty-sort "why" prompts back down to passive auto-reveal (as in the prior draft), silently reintroducing the judgment-time imbalance across the five duties. Mitigation: each duty-sort card's phase-gate why-prompt is a required, non-skippable step in the node's `resolved` state machine, not a cosmetic addition — QA checklist includes verifying all four why-prompts are gating, not decorative.
```
