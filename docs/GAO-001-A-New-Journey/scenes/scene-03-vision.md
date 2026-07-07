```markdown
## Scene 3 — Our Vision: "The Four Pillars"

### Story Beat
It's Tuesday morning. Alex has slept on the mission conversation with Dana and arrives to find a short packet on the desk: four printed pillar cards, laid out like a display Dana uses in every new-hire briefing. Dana walks over with coffee and says the vision isn't a poster in the break room — it's four separate habits Alex will be graded on before the week is out. This scene is a briefing, not a field visit yet: Alex is still building the mental model that Scene 4's shadow visit with Mr. Okafor will put into motion. Continuity: picks up directly from Scene 2's "the mission is operational, not aspirational" close; hands off to Scene 4 by naming Clinical Excellence and Community Trust as the two pillars Alex is about to *practice*, not just recite, with Mr. Okafor that afternoon.

### Learner Role
The learner, alongside Alex, examines each of the four pillars one at a time and must correctly match a concrete daily behavior to its pillar before the pillar is considered "read" — this is a light judgment gate (4-option match-to-pillar), not a pure reveal. Getting a match wrong doesn't penalize; it triggers a short in-story correction from Dana before the learner tries again. Recognition stays the ceiling for this scene, consistent with the framework's "Recognition→Judgment hybrid" placement for Scene 3 — the harder scenario-judgment work (naming which pillar a real-world shortcut violates) is intentionally deferred to Scene 4 and beyond, so this scene ends once the fourth pillar is matched, with no capstone vignette.

### Workspace & Visual Concept
**Anchor image used as persistent full-frame backdrop with overlay hotspots** (not replaced) — the four-column illustration at `GAO-001/scene-03-vision/v2.png` is well-suited: four Ionic columns on a shared stepped platform, each topped with a distinct icon (heart / rising bar-chart / connected-nodes network / rising arrow-loop). Assignment grounded in icon semantics:
- Column 1 (heart icon) → **Community Trust** (relationship/care icon reads as trust-and-warmth, not clinical metrics)
- Column 2 (bar-chart-with-arrow icon) → **Clinical Excellence** (outcomes-above-benchmark reads directly as a rising chart)
- Column 3 (connected-nodes icon) → **Workforce Growth** (network/growth-of-connections reads as expanding capability and career progression)
- Column 4 (upward arrow-loop icon) → **Regulatory Leadership** (a loop-with-an-upward-trend reads as the discipline of staying ahead of the standard — survey-ready every single day, not scrambling to catch up)

**Regions:**
- **Center stage (full-bleed)**: the anchor image, un-cropped, at native aspect. Each of the four icon-tops is a hotspot (circular glow affordance, ~64px hit target centered on the icon). Locked pillars render icon at 60% opacity with a soft pulse; discovered pillars snap to full color/opacity and the icon gets a small checkmark badge.
- **Stepped platform (bottom of image) = progress rail**: the platform's four visually-distinct steps are re-skinned via CSS overlay to literally illuminate left-to-right as pillars are matched — this reuses geometry already in the art instead of adding a separate progress bar.
- **Right-side Field Notes drawer** (slides in on each unlock, per DiscoveryScene template): shows the just-unlocked pillar's operational-behavior explanation.
- **Bottom Reference Notes ribbon** (thin, collapsible): citation chips, populated per pillar.
- **Modal (on each pillar node)**: a lightweight card overlays center-stage without hiding the pillars — the "match the behavior" choice UI renders here, dismissing on Escape/selection.

No zoom needed — the image is simple enough at full-frame that hotspots stay comfortably separated at all breakpoints; under `lg` the image scales down and hotspots reposition via percentage coordinates, Field Notes becomes a bottom sheet.

### Learning Nodes

| Node ID | Node Name | Discovery Trigger | Concept Carried | Source Coverage |
|---|---|---|---|---|
| gao001-s3-pillar-clinical-excellence | Clinical Excellence | Click bar-chart column icon; match behavior card correctly | Outcomes above benchmark, accurate OASIS coding, evidence-based care planning, timely interventions, no rushed/undocumented assessments | Page 3, pillar 1 |
| gao001-s3-pillar-workforce-growth | Workforce Growth | Click connected-nodes column icon; match behavior card correctly | Continuous learning mandatory not optional; orientation + role-specific training + annual refreshers; competency and career pathway tracked | Page 3, pillar 2 |
| gao001-s3-pillar-regulatory-leadership | Regulatory Leadership | Click arrow-loop column icon; match behavior card correctly | Survey-ready every single day — documentation complete today, not later; training current today, not next week; a surveyor could walk in tomorrow; feeds Q03 | Page 3, pillar 3; feeds Q03 |
| gao001-s3-pillar-community-trust | Community Trust | Click heart column icon; match behavior card correctly | Trust built one visit/one accurate note at a time; destroyed by a single failure; referral sources/families/physicians choose CI on trust | Page 3, pillar 4 |

### Interaction Pattern
1. **Locked state**: all four pillar icons render at 60% opacity, gently pulsing (motion-safe: static ring instead, if `prefers-reduced-motion`). Platform steps are dim/uncolored. Reference ribbon shows four empty citation-chip placeholders.
2. **Click a locked pillar** → modal opens: pillar name + a short behavior-card matching challenge (4 behavior statements, only 1 belongs to this pillar; the other 3 are real behaviors pulled from the *other* three pillars, so distractors are plausible, not throwaway).
3. **Correct match** → node transitions `discovered → resolved` in one step (no separate discovered-without-resolved state for this scene, since the match IS the discovery-gate). Modal shows brief in-story Dana confirmation line, plays node-unlock narration, Field Notes drawer slides in, platform step lights up, icon snaps to full color + checkmark.
4. **Incorrect match** → modal stays open, shows Dana's short redirect line naming *why* the chosen behavior belongs to a different pillar (not "wrong, try again"), learner re-selects. No attempt cap beyond the framework's standing "hint after 2 misses" rule — on the 3rd miss, the correct card is visually highlighted as a hint.
5. **Completion rule**: `all_nodes` (4 pillars = 4 total) must reach `resolved`. `onComplete` fires once via `useEffect` watching the derived all-resolved boolean (no setTimeout-in-handler).
6. **Scene Practice Complete**: on completion, a system-styled (visually distinct from the story close) banner reads **"Vision Practice Complete"** — never blended into Dana's or Alex's dialogue line in the same sentence.

### Field Notes
**Clinical Excellence** — "Clinical Excellence means outcomes that beat national benchmarks, not just meet them. That starts with accurate OASIS coding and care plans built on evidence, not habit. It also means no shortcuts on timing: assessments happen in full, and nothing gets documented as done before it's actually done. We don't wait for a survey to find out something's wrong, either — we go looking on purpose, and a near-miss becomes a process fix, not a blame session."

**Workforce Growth** — "This pillar treats your training as ongoing, not a one-time checkbox. Orientation is the start, not the finish — role-specific training and annual refreshers follow, and the agency tracks your competency and career progression the whole way. Growing here isn't optional; it's structural — the standard we hold ourselves to today is expected to be a little better than the one we held last quarter."

**Regulatory Leadership** — "Regulatory Leadership means we're survey-ready every single day, not just the week before an inspection. Documentation is complete today, not later. Training is current today, not next week. If a surveyor walked in tomorrow morning, unannounced, the answer is always the same: we're ready."

**Community Trust** — "Every visit either adds to or draws down a shared account of trust — physicians, discharge planners, and families choose Care Indeed because of it. It's built slowly, one accurate note and one solid visit at a time, and it can be shaken by a single bad outcome traced to one untrained employee."

### Reference Notes
- Clinical Excellence: *"Reference: ACHC Home Health Standards — outcomes measurement and OASIS accuracy expectations. Informational."*
- Workforce Growth: *"Reference: HR-TA-005 Appendix A — General Agency Orientation Checklist; ties ongoing training to competency tracking. Informational."*
- Regulatory Leadership: *"Reference: Agency QAPI Program Description — describes the survey-readiness and performance-improvement cycle referenced by this pillar. Informational."*
- Community Trust: *"Reference: Agency Charter — Vision statement. Informational; not a CFR citation."*

(No §484.50/§484.110 citation appears in this scene, per the Citation Map — those are reserved for Scenes 6/7. §484.60 is not reused here either; it belongs to Scene 2 and is not re-cited to avoid diluting its Scene 2 anchor.)

### Narration Plan

**Scene-start** (Alex's POV, story framing): "Dana sets four printed cards on the desk — heart, chart, network, arrow-loop — and says these aren't decoration, they're the agency's vision, broken into four pillars. Alex recognizes the shape of the conversation from yesterday: another slogan that's actually a job description. Dana taps the first card. 'Read each one like it's asking something of you personally,' she says, 'because it is.'" *(63 words)*

**Node-unlock — Clinical Excellence**: "Alex taps the chart icon, and Dana explains this one first because it's the most measurable. 'Clinical Excellence means our outcomes sit above national benchmarks — not average, above average,' she says. 'That starts with your OASIS coding being accurate, not approximate, and your care plans following evidence, not what you did at your last job. It also means no rushing. If you didn't actually observe something, you don't document it as observed, and you don't skip steps in an assessment because you're behind schedule. Timely interventions matter too — catching a change early is the whole point of skilled care.'" *(98 words)*

**Node-unlock — Workforce Growth**: "Alex taps the network icon. 'This one's about you, specifically,' Dana says. 'Workforce Growth means training isn't a one-time thing you finish at orientation — it continues. Role-specific training, annual refreshers, and the agency actually tracks how your competency and your career progress over time. You're expected to keep growing throughout your employment here, not just through week one.' Alex glances at the module still open on the screen — this is that pillar, happening in real time." *(80 words)*

**Node-unlock — Regulatory Leadership**: "The arrow-loop icon comes next. 'Regulatory Leadership is the one people misunderstand,' Dana says. 'It doesn't mean we scramble before an inspection. It means we're survey-ready every single day — documentation complete today, not later; training current today, not next week. A surveyor could walk in tomorrow morning, unannounced, and the answer has to be the same every time: we're ready.' Alex writes down survey-ready every single day in the notebook, underlining it twice." *(78 words)*

**Node-unlock — Community Trust**: "Last, the heart icon. 'Community Trust is the quietest pillar and the easiest to lose,' Dana says. 'Physicians, discharge planners, families — they choose us because they trust the quality of what we do. That trust gets built one visit and one accurate note at a time. It can also be undone by a single bad outcome traced back to one employee who wasn't trained or wasn't careful. Years of reputation, one failure.'" *(78 words)*

**Scene-complete**: "Alex looks at the four cards again — heart, chart, network, arrow-loop — and for the first time they don't read like poster copy. They read like four separate ways to fail or succeed on any given Tuesday. Dana collects the cards. 'This afternoon you'll see two of these in motion with an actual patient,' she says. 'Clinical Excellence and Community Trust stop being ideas the second you're in Mr. Okafor's living room.' — **Vision Practice Complete.**" *(80 words, system line separated)*

**Total narration word count: approximately 477 words** across 6 segments (1 scene-start, 4 node-unlocks, 1 scene-complete), covering all 4 pillars — 100% of Scene 3's assigned concept checklist (4 pillars, each with its full behavioral detail set including OASIS coding, competency and career tracking, survey-ready-every-day framing, and trust-erosion mechanism).

### Audio & Microinteractions
- **Hotspot idle state**: soft pulsing glow ring on locked icons (CSS `animation`, disabled entirely under `prefers-reduced-motion: reduce` in favor of a static outline).
- **Correct match**: single soft chime + icon color-snap + platform step illuminates with a brief (200ms) fade-in, no bounce/shake.
- **Incorrect match**: low, non-punitive two-tone descending sound (not a harsh buzzer) + card gently shakes (disabled under reduced motion — replaced by a border-color flash only).
- **Field Notes drawer**: slides in from right over 250ms ease-out; under reduced motion, appears instantly with an opacity fade only.
- **Narration playback**: per-segment play/pause/replay controls attached to each Field Notes entry; no single global lesson audio ref.
- **Hover/focus**: focus ring (2px, high-contrast) matches hover glow state exactly, so keyboard users get identical affordance cues to mouse users.

### Accessibility
- **Keyboard path**: Tab cycles through the four pillar hotspots in left-to-right DOM order (Community Trust, Clinical Excellence, Workforce Growth, Regulatory Leadership per the image's actual left-to-right column order), then Field Notes replay controls, then Reference Notes ribbon toggle. Enter/Space opens the match modal; Escape closes it and returns focus to the triggering hotspot.
- **ARIA**: each pillar hotspot is `role="button"` with `aria-pressed` reflecting locked/resolved state and `aria-label` naming the pillar (not just "icon"); the match modal is `role="dialog"` with `aria-modal="true"` and traps focus; a live region (`aria-live="polite"`) announces only short state changes ("Clinical Excellence pillar unlocked") — never full instructional text, which stays in the transcript panel.
- **Captions/transcript**: every `NarrationSegment` with `transcriptFlag: true` renders verbatim in the Field Notes drawer's transcript view, synced to playback with auto-scroll.
- **Color independence**: locked/resolved state is conveyed via opacity + checkmark badge + platform-step fill, never color alone (colorblind-safe: a checkmark glyph is always present on resolved icons).
- **Reduced motion**: all pulse/shake/slide animations degrade to static-state equivalents as noted above; completion banner fade becomes an instant swap.

### QA Risks
- **Icon-to-pillar mapping ambiguity**: the anchor image's icons are generic (heart/chart/network/arrow-loop) and not textually labeled in the art itself — a learner could plausibly guess a different mapping before matching. *Mitigation*: pillar name renders as a persistent on-hover/focus tooltip label even before discovery, and the modal always states the pillar name explicitly before presenting the match challenge, so no learner has to infer the mapping from the icon alone.
- **Distractor-behavior overlap causing false negatives**: because distractor behaviors are real behaviors from the *other three* pillars (per design), a learner familiar with the vision list from a prior read-through could correctly recognize a distractor as "true" and second-guess a right answer. *Mitigation*: modal copy frames the question as "which pillar does this belong to," not "true or false," and feedback for incorrect picks explicitly names why the distractor belongs elsewhere.
- **Compliance wording drift on completion banner**: "Vision Practice Complete" must never appear in the same sentence as Alex's emotional beat. *Mitigation*: enforce via the SceneConfig `safeCompletionLabel` field rendered in a visually separate system banner component, never interpolated into narration string templates.
- **Node-name/framework conflict resolved**: the Learning Framework's Section 1 objectives list "Workforce Growth" and "Regulatory Leadership" for Scene 3, and this storyboard's four pillar names (Clinical Excellence, Workforce Growth, Regulatory Leadership, Community Trust) now match that list exactly — no remaining disagreement between the Learning Framework and this storyboard to flag or reconcile.
- **Quiz Alignment Map — Q03 confirmed, no rewrite needed**: Q03's correct answer ("Regulatory Leadership") now aligns unchanged to the `gao001-s3-pillar-regulatory-leadership` node, whose node-unlock narration speaks the literal tested phrase "survey-ready every single day." No Q03 rewrite or re-map is required; this replaces the prior risk that Q03 pointed at a retired node.
- **Scene 9 recap pillar-name consistency**: Scene 9's recap must reuse these exact same four pillar names — Clinical Excellence, Workforce Growth, Regulatory Leadership, Community Trust — with no renaming or reordering drift. *Mitigation*: treat this storyboard's Learning Nodes table as the single source of truth for pillar names when authoring or reviewing Scene 9's recap copy.
- **Node-budget conformance**: Section 4's Cognitive Load & Pacing table caps Scene 3 at 3 minutes, 4 concepts, 4 nodes. This revision ships exactly 4 nodes (4 pillars, no capstone), matching the cap with no deviation to document.
- **Interaction-pattern conformance**: removing the capstone vignette keeps Scene 3 entirely within recognition→light-judgment (match-to-pillar) interactions, with no narrative scenario-judgment ("which pillar is being violated") node — that interaction class remains reserved starting at Scene 4 per Learning Framework Section 3, so no deviation rationale is needed.
- **Platform-step overlay drift from source image**: the CSS overlay re-skinning the platform's four steps is coordinate-dependent on the specific PNG; any future re-export/re-crop of `v2.png` at different dimensions would misalign the step-highlight overlay. *Mitigation*: store hotspot and step-overlay coordinates as percentages keyed to this exact image's checksum/version tag, and add a visual regression screenshot test against this specific asset.
- **Resume/initialState gap**: if a learner exits after resolving 2 of 4 pillars, reload must restore both resolved icons, their platform-step fill, and mark their narration as "already delivered" without re-forcing autoplay. *Mitigation*: verify `initialState` hydration path explicitly sets each node's status before first render paint, and that narration autoplay only fires on a genuine first-time `discovered` transition, not on hydration-induced state changes.
```