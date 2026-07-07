# GAO-002 UX Architecture Specification

## 1. VERDICT: Learning Unlock / Word Reveal Architecture

**ADOPT.** The discover → unlock → Field Notes reveal loop is the core interaction primitive. It turns abstract org chart into practical judgment and reduces redundancy.

Use per-template (flexible inside shell workspace):

- Interactive Org Map for governance roles (L1)
- DecisionBoard for escalation scenarios
- FlowSequence for on-call hierarchy (L2)

No fixed 3-column skin. Panel placement per-template. Leverage GAO-001 Scene 4 benchmark (GAO-001/scene-04-values/v*.png + CoreValuesInteractiveViewer.tsx) for hotspots, phases, feedback, ambient animations (breathe/pulse/steam etc.), self-contained audio, progress chip, completion state, and unlock mechanic. User local screenshots (e.g. 2026-07-06 235846.png) are explicitly NO-GO and must not be referenced.

## 2. WORKSPACE LAYOUT SYSTEM

All templates fill the workspace slot inside the existing shell. Degrade to single-column <lg. Independent of left Content/Narration tabs.

Templates assigned:
- JourneyMap / Interactive Org Map: Scene 1 (roles + map building)
- DecisionBoard: Scenario decisions in Scene 2
- FlowSequence: On-call in Scene 2
- Readiness map assembly in Scene 3

## 3. REDUNDANCY CONTRACT

One fact, one home for its full form:
- Scene surface = the experience (minimal text, hotspots)
- Field Notes = plain-language explanation of what was just unlocked (new phrasing)
- Reference Notes = citation + terse surveyor-facing line only
- Narration = the tier of record for full instructional completeness

## 4. INTERACTION QUALITY BAR (Scene 4+)

At least one consequential choice per node with real wrong-answer feedback.
Understanding-gated unlocks.
Visible progress.
Keyboard operability, ARIA, reduced-motion safety.
Resumability.
Safe completion wording ("Reporting Lines Practice Complete").

## 5. HANDOFF SPLIT

UltraCode/Fable: architecture + engine notes.
Fast Fable: SVG scenes + per-scene unlocks.
