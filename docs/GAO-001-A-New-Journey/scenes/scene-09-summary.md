I'll produce the revised storyboard, fixing each flagged issue while preserving everything else.

Key fixes: (1) Patient Rights node retagged to §484.60 with §484.50 removed from that scenario; (2) all "attestation" language removed and replaced with non-triggering phrasing; (3) completion narration changed to a single Scene-9-specific label with rationale; (4) Vision Pillars Recap aligned to canon (Clinical Excellence, Workforce Growth, Regulatory Leadership, Community Trust) and Torres/Chen names restored per confirmed Scene 6-8 canon; (5) Home Health Difference and Survey Readiness Field Notes reframed as Alex's recall or Dana's words rather than disembodied exposition, and the Readiness pin now names all five sample surveyor questions distinctly.

# Scene 9 — Module Summary & Readiness: "The Friday Debrief"

### Story Beat
It's Friday afternoon. Alex sits down with Dana for a short end-of-week debrief before the post-test opens. Dana doesn't re-teach anything — she asks Alex to walk back through the week out loud, the way a surveyor might ask cold. Alex flips open the same field notebook seeded in Scene 1, now filled with a week of notes, and uses it to retrace eight stops: the welcome desk, the mission, the vision, the values practiced in the field, the home-health differences, the reporting protocol, the patient-rights judgment call, and the readiness conversation itself. Dana's closing line calls back to the badge from Scene 1 ("you'll wear this into every home — it's the trust CI has already placed in you") and confirms Alex is oriented, not finished learning. The scene ends with Alex clicking into the post-test, not into any policy sign-off.

### Learner Role
The learner acts as Alex revisiting the week: clicking each of the 8 map waypoints in any order to have Alex recall (in one or two sentences) what happened there and why it mattered, then confirming readiness. There are no new right/wrong judgment calls here — the one light interactive check is a single "surveyor might ask you this" recall prompt per node (self-check, ungraded, immediate reveal) rather than a scored quiz. The learner's real "decision" is procedural: unlock all 8 stops, then press the final action.

### Workspace & Visual Concept
**Template: JourneyMap.** The `v3.png` illustration is used as a **soft, dimmed backdrop** (opacity ~35%, fixed, non-interactive) behind a foreground week-map — it supplies warmth and continuity (a home-visit room, a clinician with a clipboard, a family, a couple) without needing per-object hotspot alignment, since none of its literal objects (clock, plant, framed chart) correspond to the 8 recap concepts. Layering a literal hotspot onto the clock or the couple would misrepresent them as new content, which the pacing budget forbids ("0 new nodes" for Scene 9).

Regions:
- **Center-stage map path**: a horizontal "week trail" (Mon → Fri) rendered as a dotted line with 8 waypoint markers (pins), each labeled with its scene's short title (Welcome, Mission, Vision, Values, Home Health Difference, Reporting, Patient Rights, Readiness). Pins use icons already thematically tied to their scene (badge, compass, four-pillar mark, handshake, house, shield, scales, checkmark).
- **Right-side Field Notes drawer**: slides in on pin click; shows the one-paragraph recap + the self-check prompt.
- **Bottom Reference ribbon**: collapsible strip showing citation chips only for pins that carry one (Mission=§484.60 informational, Home Health Difference=§484.110, Patient Rights=§484.60); non-legal pins show no chip.
- **Header strip**: "Alex's First Week" progress counter (n/8 stops revisited) and Dana's small avatar/quote line.
- On <lg viewport: backdrop image hidden entirely (decorative only, first to drop), map path becomes a vertical list, Field Notes becomes a bottom sheet.
- No zoom modal needed — this is a low-density recap scene; a modal would add friction to a scene budgeted at only 2 minutes.

### Learning Nodes

| Node ID | Node Name | Discovery Trigger | Concept Carried | Source Coverage |
|---|---|---|---|---|
| gao001-s9-node-welcome | Welcome & Accreditation | Click "Welcome" pin | Medicare-certified/ACHC-accredited status; personal accountability framing | Page 1 |
| gao001-s9-node-mission | Mission Recap | Click "Mission" pin | Mission statement + "when in doubt, report" rule (retrieval, not re-teach) | Page 2 / table row 5 |
| gao001-s9-node-vision | Vision Pillars Recap | Click "Vision" pin | Regulatory Leadership = survey-ready every day (retrieval) | Page 3 |
| gao001-s9-node-values | Core Values Recap | Click "Values" pin | Values as evaluative standard (performance reviews, incident reviews, survey findings) | Page 4 |
| gao001-s9-node-hh-diff | Home Health Difference Recap | Click "Home Health Difference" pin | Documentation-as-sole-record; §484.110 correct usage | Page 5 |
| gao001-s9-node-reporting | Reporting Protocol Recap | Click "Reporting" pin | Mandatory reporting sequence (observe→document→report, not investigate/confront) — Mr. Torres | Page 6 / Scenario 1 |
| gao001-s9-node-patient-rights | Patient Rights Recap | Click "Patient Rights" pin | §484.60 correct usage; scope-of-practice/plan-of-care boundary — Mrs. Chen and Grace Chen | Page 8, Scenario 2 |
| gao001-s9-node-readiness | Survey Readiness & Remediation | Click "Readiness" pin | 5 surveyor sample questions + "answer honestly" rule; remediation numbers (80%/3 days/3 attempts) | Page 9 |

### Interaction Pattern
1. **Locked** state on load: all 8 pins visible with icon + label, none opened; header shows "0/8." Guided-sequence affordance: the leftmost unopened pin has a subtle persistent pulse (reduced-motion-safe: static ring instead of pulse when `prefers-reduced-motion` is set).
2. Learner clicks any pin → pin transitions **discovered**: Field Notes drawer slides in with that node's recap text and a one-line ungraded self-check prompt ("A surveyor asks you X — what's your first move?") with a "Reveal Dana's answer" toggle (immediate reveal on click, no scoring, no wrong-path branching — this scene has zero judgment nodes per the pacing table's "0 new" allowance).
3. Pin transitions **complete** the moment its Field Notes has been opened once; header counter increments; pin icon fills solid color and gets a small checkmark badge.
4. Order is free-choice; nothing gates progression between pins.
5. **Scene completion criteria**: `completionRule: { type: 'all_nodes' }` — all 8 pins reach `complete`. When the derived boolean flips true (via `useEffect` watching derived state, per engine spec — not a setTimeout), the "Ready for Post-Test" button (previously disabled/dim) becomes enabled and a short scene-complete narration plays once.
6. Clicking "Ready for Post-Test" fires `onComplete()` only — no `useLearner()` call from this component; it feeds `sceneComplete` upward through the existing `handleNext`/training-record path exactly like every other scene. No checkbox, no signature line, no "I confirm" anywhere in this scene.
7. **Resumable**: `initialState` snapshot restores which of the 8 pins were already opened if the learner exits and returns (Save & Exit mid-scene reloads with prior pins pre-marked complete, matching engine persistence contract).

### Field Notes
**Welcome & Accreditation** — "This week started with a simple but important fact: Care Indeed is Medicare-certified and ACHC-accredited, which means every employee carries real responsibility for patient safety and regulatory compliance. Completing this module documents your orientation competency in your personnel file — it is a training record, separate from the assigned policy acknowledgment process."

**Mission Recap** — "The mission is your job description in one sentence: patient-centered, evidence-based, independence-promoting, dignity-protecting, and regulatory-integrity-driven care. The rule that ties it all together is the one you'll use most often in the field: when in doubt, report."

**Vision Pillars Recap** — "The four vision pillars are Clinical Excellence, Workforce Growth, Regulatory Leadership, and Community Trust. Of the four, Regulatory Leadership is the one that defines your daily posture — being survey-ready every single day, not periodically. Documentation complete today, not later; training current today, not next week; a surveyor could walk in tomorrow. That's what the pillar actually asks of you."

**Core Values Recap** — "The six core values you practiced this week are not slogans — they are behavioral expectations that show up in your performance reviews, in incident investigations, and in survey findings. That's what makes them evaluative, not aspirational."

**Home Health Difference Recap** — Alex remembers Dana's words from earlier in the week: "In home health, you're often the only professional present, which means there's no second set of eyes to fall back on later — your written note has to stand on its own as the full account." Reference 42 CFR §484.110, the Clinical Records requirement, sets the federal floor for what that documentation has to include.

**Reporting Protocol Recap** — Alex thinks back to Mr. Torres's visit: observe objectively, document the facts, and report to your supervisor the same day. Follow agency mandatory reporting protocol immediately; do not investigate or confront; supervisor/Compliance assists with required external reporting, but required reporting must not be delayed.

**Patient Rights Recap** — Alex thinks back to Grace Chen's request on behalf of her mother, Mrs. Chen: the correct move — decline, explain, refer to the patient's own physician — kept the plan of care intact and protected both the patient and Alex. Reference 42 CFR §484.60 governs the individualized plan of care, including who is authorized to provide care under it and why staying inside that plan matters.

**Survey Readiness & Remediation** — Dana's words, the ones Alex now has memorized: "Surveyors can stop any staff member and ask: what is the agency's mission; how would you report a patient-safety concern; what training did you receive during orientation; how do you handle a request outside your scope; and what are your documentation responsibilities. The right answer is always your own honest words, or 'I'd check with my supervisor' if you're not sure." The quiz ahead needs 80% to pass, with a 3-business-day retake window and a 3-attempt cap before supervisor escalation.

### Reference Notes
- Mission pin: *"Reference: 42 CFR §484.60 — individualized plan of care. Informational; supports the mission's patient-centered standard."*
- Home Health Difference pin: *"Reference: 42 CFR §484.110 — Conditions of Participation: Clinical Records. Governs documentation completeness, not patient rights. Informational."*
- Reporting pin: *"Reference: Federal and state law require reporting of suspected abuse, neglect, or exploitation. Your state's APS framework governs external reporting; Compliance/supervisor initiates it. Informational."*
- Patient Rights pin: *"Reference: 42 CFR §484.60 — Conditions of Participation: individualized plan of care. Governs who is authorized to provide care and the scope boundaries around it. Not a Patient Rights (§484.50) citation — this scenario is a plan-of-care/scope question, not a dignity/refusal/informed-participation question. Informational."*
- Readiness pin: *"Reference: Surveyors may ask any staff member about mission, reporting, and documentation practices at any time. Informational; not legal advice."*
- Welcome/Vision/Values pins carry no citation chip (none assigned by the Citation Map).

### Narration Plan

**Scene-start** (story framing): "It's Friday afternoon, and Alex's first week is almost over. Dana pulls up a chair. 'Before you head into the post-test,' she says, 'walk me through your week — the way a surveyor would ask it, cold, no notes.' Alex opens the field notebook, the same one from Monday morning, now full. Eight stops on the trail behind them: Welcome, Mission, Vision, Values, Home Health Difference, Reporting, Patient Rights, and this conversation itself. Dana isn't testing Alex today. She's confirming what's already there." *(96 words)*

**Node-unlock — Welcome & Accreditation**: "Alex starts at the beginning. 'Care Indeed is Medicare-certified and ACHC-accredited,' Alex says, 'which means every employee — clinical or not — carries real responsibility for patient safety and compliance.' Dana nods. 'And this module?' she asks. 'It's documented in my personnel file as evidence of orientation competency,' Alex says. 'That's separate from the assigned policy acknowledgment process — this doesn't replace that.' Dana taps the notebook. 'Good. That distinction matters more than people think.'" *(80 words)*

**Node-unlock — Mission Recap**: "Alex recites it without hesitating: patient-centered, evidence-based, promotes independence, protects dignity and quality of life, built on regulatory integrity. 'And the rule underneath all five words,' Alex adds, 'is the one you gave me the first day — when in doubt, report. Don't wait, don't guess, don't ask the family to referee it. Document what you saw, and take it to you or Compliance the same day.' Dana says, 'That sentence alone will get you through more Fridays than any policy binder.'" *(86 words)*

**Node-unlock — Vision Pillars Recap**: "'Four pillars,' Alex says. 'Clinical Excellence, Workforce Growth, Regulatory Leadership, Community Trust. The one I think about daily is Regulatory Leadership — being survey-ready every single day, not just when an inspection's scheduled. That means my documentation is done today, not Monday, and my training stays current instead of catching up later.' Dana adds, 'A surveyor could walk in tomorrow morning. That pillar is why that thought doesn't scare you anymore.'" *(74 words)*

**Node-unlock — Core Values Recap**: "'Six values,' Alex says, thinking back over the week. 'Integrity, Compassion, Excellence, Teamwork, Accountability, Compliance. They're not posters on a wall — they're what gets referenced when someone reviews my performance, investigates an incident, or a surveyor asks how I handled something. I felt that first-hand practicing them in the field — naming the value wasn't the hard part. Acting on it under a little pressure was.'" *(70 words)*

**Node-unlock — Home Health Difference Recap**: "'The single biggest adjustment from my last job,' Alex says, 'is that I'm usually the only professional in the room. There's no second nurse who also witnessed it. My documentation is the record — full stop. That falls under 42 CFR §484.110, the federal Clinical Records requirement, which sets the baseline for what a home health note has to include. If it isn't written down, for legal and clinical purposes, it didn't happen.'" *(75 words)*

**Node-unlock — Reporting Protocol Recap**: "Alex's voice steadies here, the way it did earlier this week at Mr. Torres's. 'I noticed bruising that wasn't there last visit. I didn't confront Mr. Torres's son about it and I didn't call anyone outside the agency. I documented exactly what I saw — location, size, color, what Mr. Torres said, who else was present — and I reported it to my supervising RN that same day.' Dana finishes the thought with the line she's repeated all week: 'Follow agency mandatory reporting protocol immediately; do not investigate or confront; supervisor/Compliance assists with required external reporting, but required reporting must not be delayed. You didn't need proof, Alex. Reasonable suspicion was enough, and it was required.'" *(112 words)*

**Node-unlock — Patient Rights Recap**: "'Grace Chen asked me to look at her own knee while I was there for her mother, Mrs. Chen,' Alex says. 'I declined, told her I'm only authorized to treat the patient of record, and suggested she call her own physician.' Dana nods. 'That's 42 CFR §484.60, the plan-of-care rule — it's about care staying inside Mrs. Chen's actual authorized plan, and about you not creating liability by stepping outside your scope. Kind and firm aren't opposites. You did both.'" *(80 words)*

**Node-unlock — Survey Readiness & Remediation**: "'If a surveyor stopped me in the hallway,' Alex says, 'they might ask five things: what is the agency's mission, how would I report a patient-safety concern, what training did I receive during orientation, how do I handle a request outside my scope, or what my documentation responsibilities are. My job is to answer honestly, in my own words — and it's fine to say I'd check with my supervisor if I'm not sure.' Dana adds the numbers Alex already has memorized: 'Eighty percent to pass. Three business days to retake if you don't. Three attempts total before it comes to me directly.'" *(99 words)*

**Feedback (self-check reveal, generic across all 8 — one shared pattern, not per-node duplication)**: "That's exactly the kind of answer that holds up in a real conversation with a surveyor — specific, honest, and yours." *(19 words — used for the ungraded reveal toggle; no incorrect branch exists in this scene since no choice is judged)*

**Scene-complete**: "Dana closes her notes. 'You're oriented, Alex — not finished learning, nobody ever is, but oriented. That badge you picked up Monday goes into every home you visit now. It's the trust this agency already placed in you.' Alex closes the notebook. **Survey Readiness Practice Complete. Training Module Complete. Ready for Post-Test.**" *(48 words — a single Scene-9-specific completion label ("Survey Readiness Practice Complete") replaces the prior per-scene callback pattern; because Scene 9 is a cumulative recap of all 8 prior nodes rather than a single new concept, re-firing only 2 of 8 earlier per-scene labels had no design rationale and read as arbitrary. One scene-level label plus the existing "Training Module Complete" / "Ready for Post-Test" pair cleanly closes out the recap without selectively favoring two of eight prior scenes.)*

**Total narration word count: approximately 738 words** across scene-start (96) + 8 node-unlocks (80+86+74+70+75+112+80+99=676) + feedback (19, reusable) + scene-complete (48) ≈ 739.

### Audio & Microinteractions
- Pin discovery: soft single chime (distinct from Scene 4/6/8's judgment-correct chime — lower pitch, "settling" tone, since nothing is graded here).
- Header counter increments with a subtle number-tick, no confetti/burst (this is a calm consolidation scene, not a win-state).
- Backdrop image: static, no parallax or ambient motion, respecting `prefers-reduced-motion` by default even without the media query (this scene has no motion budget to begin with).
- Pulse affordance on next-suggested pin: replaced with a static outlined ring when `prefers-reduced-motion` is set.
- "Ready for Post-Test" button: disabled state is visually muted (not just `aria-disabled`); enabling triggers a brief, subtle glow-in (not a bounce/shake) — reduced-motion users get an instant solid-state change instead.
- Optional narration replay icon sits on each open Field Notes card, per-segment (not a single global play head).

### Accessibility
- Each pin is a `role="button"` with `aria-pressed` reflecting discovered/complete state and `aria-label` naming the stop ("Mission Recap, completed").
- Focus order follows visual map order left-to-right (Welcome → Readiness); Tab reaches all 8 pins, then the Field Notes drawer's reveal toggle, then the "Ready for Post-Test" button last.
- Field Notes drawer is a `role="region"` with `aria-live="polite"` firing only a short state announcement ("Reporting Protocol Recap unlocked") — never the full instructional text via live-region (full text lives in the on-screen transcript panel + narration audio, consistent with the accessibility spec's screen-reader coexistence rule).
- All narration segments have `transcriptFlag: true` and render verbatim in a read-along panel beneath the Field Notes card, auto-scrolled to the active segment.
- Color is never the sole state indicator: complete pins get both a fill change and a checkmark glyph; incomplete pins are outline-only with a text label.
- Backdrop image has no interactive semantics (`aria-hidden="true"`, `role="presentation"`) since it carries no informational content.
- Keyboard: Enter/Space opens a pin's Field Notes; Escape returns focus to the map from an open drawer; no modal focus-trap needed since the drawer is a persistent side panel, not a blocking modal.

### QA Risks
- **Forbidden-wording drift**: "readiness," "attestation," and "completion" language cluster in this scene more than any other — high risk a future edit reintroduces "attestation" (echoing legacy Page 9's "Onboarding Attestation" callout). This draft's own copy has been scrubbed of the word "attestation" in every instance (Field Notes and narration both now read "separate from the assigned policy acknowledgment process" / "separate, assigned process"). Mitigation: CI string-match against the forbidden/near-miss list (Section 1.1) specifically scoped to this scene's copy before every merge, with no carve-out for negated or contrastive phrasing.
- **Button-gating bug**: "Ready for Post-Test" must stay disabled until genuinely all 8 nodes are `complete`; a stale/cached `initialState` snapshot could pre-populate a false-complete count on resume. Mitigation: derive completion from the authoritative node-state array on every mount, never trust a cached boolean alone.
- **Mandated-sentence corruption**: the Reporting Protocol Recap node-unlock narration embeds the exact mandated sentence inline with story text before/after it — any future trim-for-length edit risks clipping a word from the middle. Mitigation: store the mandated sentence as an atomic, non-editable string constant imported from the single source (`CoreValuesInteractiveViewer.tsx:142`), never retyped inline in this scene's data file.
- **Citation mislabeling on reuse**: because this scene recaps §484.110 and §484.60 side by side (Clinical Records vs. plan-of-care/scope pins), a careless copy edit could swap their one-line descriptors or drift the Patient Rights pin back onto §484.50. Mitigation: pull both descriptor strings from the shared Citation Map constants rather than hand-writing them per scene, and add a lint rule that the Patient Rights Recap node ID may never co-occur with the literal string "§484.50" in this scene's data file.
- **Character/scenario continuity drift**: this scene's Reporting Protocol Recap and Patient Rights Recap nodes name Mr. Torres (bruising observation, Scenes 6-7) and Mrs. Chen / Grace Chen (off-scope request, Scene 8) per canon. Mitigation: pull these names from the shared cast/character constants rather than hand-typing them per scene, so a future rename in Scenes 6-8 propagates here automatically instead of drifting.
- **Backdrop image treated as content by future editors**: since `v3.png` shows a clock, a framed chart, a couple, and an entry table, a future contributor might be tempted to hotspot those objects to "use the art fully." Mitigation: code comment + design-doc note (this document) stating the image is `aria-hidden` decorative backdrop only, not a hotspot surface, because none of its objects map to the 8 required recap concepts.
- **Resume/replay narration double-fire**: if a learner resumes with 5/8 nodes already complete, node-unlock audio must not auto-replay for already-delivered nodes. Mitigation: persist `deliveredAt` per node (per narration accessibility spec) and gate autoplay on `!alreadyDelivered`.
- **Self-check reveal miscast as graded**: the ungraded reveal toggle must never emit a right/wrong visual (checkmark-vs-X) since nothing is judged in this scene. Mitigation: use a neutral "Reveal Dana's take" affordance with no red/green styling anywhere in this component.