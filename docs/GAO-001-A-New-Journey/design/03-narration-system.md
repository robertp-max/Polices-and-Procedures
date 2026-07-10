# GAO-001 Narration System Design

## 1. NARRATION TIER MODEL

| Tier | Job | Length | Fires on |
|---|---|---|---|
| **scene-start** | Story continuity + orientation: where Alex is, what's at stake, what the learner is about to do. Sets emotional/narrative frame. NOT instructional content delivery. | 60–120 words (~25–45s TTS) | Scene mount, once, before any node unlocked |
| **node-unlock** | **Carries the full instructional payload.** Every regulatory concept, CFR citation, table row, enumerated list item, protocol step from the source inventory must land here, distributed one-to-one across nodes. Story-voiced (Alex's POV/action) but instructionally complete — not paraphrase. | 80–160 words per node (~30–60s); scale to concept density, not a fixed cap | Each hotspot/node interaction, first successful unlock only |
| **feedback** | Reinforces judgment on a decision/choice node (correct vs. incorrect pick). Explains *why*, not just *that*. Where mandatory-reporting exact-sentence requirements live (Scenes 6, 8). | 40–90 words correct; 50–100 words incorrect (must correct the misconception, not just say "wrong") | Every graded/judgment interaction, both branches |
| **scene-complete** | Consolidates what was unlocked (by reference, not re-explaining each concept fully), states the practice-complete status using SAFE wording only, bridges to next scene's stakes. | 50–100 words | All required nodes unlocked |

**Coverage rule (hard requirement):** the **union** of all four tiers within a scene must cover 90–100% of that scene's required-concept checklist (Section 2). Node-unlock is the tier of record for completeness — if a concept appears ONLY in scene-start or scene-complete and not in a node-unlock, that is a defect. Scene-start and scene-complete may reference concepts already covered but must not be the sole source. Feedback covers judgment-application concepts that node-unlock introduced (it reinforces, it doesn't introduce new required concepts unless the concept is decision-specific, e.g. Scenario 1/2 branch logic).

---

## 2. COVERAGE ACCOUNTING

**Method:** every scene ships a **Concept Checklist** derived directly from the source recon inventory (mission phrases, vision pillars, core values, CFR citations, table rows, protocol steps, surveyor Q&A, remediation numbers). Each concept gets exactly one **primary** narration segment; may get exactly one **reinforcement** segment (typically feedback tier). No concept may have zero primary mappings. No segment may claim more than ~4-5 concepts (forces real coverage, not one giant catch-all node).

**Data shape (per narration unit):**

```ts
interface NarrationSegment {
  narrationId: string;        // e.g. "gao001.s2.node.missionPhrase.patientCentered"
  sceneId: string;            // "GAO-001-S2"
  tier: "scene_start" | "node_unlock" | "feedback" | "scene_complete";
  nodeId?: string;            // hotspot/decision id this is bound to (absent for scene_start/complete)
  branch?: "correct" | "incorrect"; // feedback tier only
  text: string;               // full spoken script, story-voiced
  conceptIds: string[];       // e.g. ["mission.patientCentered", "cfr.484.60"]
  transcriptFlag: boolean;    // true = shown in read-along/caption panel verbatim
  audioLocation: string;      // narrationManifest-style key, e.g. "gao-001.s2.node.mission-patient-centered"
  version: number;
  approvedBy?: string;
  approvedAt?: string;
}

interface ConceptChecklistEntry {
  conceptId: string;          // stable slug, one per fact/citation/table-row/protocol-step
  sourceRef: string;          // page/line citation back to recon inventory, e.g. "Page2:table-row-1"
  requiredForScene: string;   // sceneId
  primaryNarrationId: string; // exactly one
  reinforcementNarrationId?: string; // at most one
}
```

**Concept checklist seeding (from recon):** one `conceptId` per: each mission phrase (5), each vision pillar (4), each core value (6, with sub-clauses split if multi-fact — e.g. Integrity gets `values.integrity.truthfulDocs` AND `values.integrity.noFalsify` as separate concepts since both are distinct required facts), each mission-alignment table row (5), each home-health-difference bullet (5), each regulated-agency responsibility (5, with personnel-file sub-items enumerated as their own concepts), each CFR citation (§484.50, §484.60, §484.110 — each its own concept tagged to correct context), each scenario's decision logic (Scenario 1, Scenario 2), the exact mandatory-reporting sentence (Scenes 6 & 8 — tagged `protocol.mandatoryReporting.exactSentence`, verbatim match required, not paraphrase), each surveyor sample question (5), remediation numbers (80%, 3 days, 3 attempts).

**Audit method:** a build-time script joins `ConceptChecklistEntry[]` against `NarrationSegment[]`; fails CI if any `requiredForScene` concept has no `primaryNarrationId`, if `protocol.mandatoryReporting.exactSentence` text doesn't string-match the exact sentence verbatim, or if any forbidden phrase (Policy Attested/Acknowledged/PP Complete) appears in any `text` field. Output is a per-scene coverage percentage — gate at ≥90%.

---

## 3. STORAGE & DELIVERY

**Storage:** `NarrationSegment[]` lives as a versioned data module per scene (e.g. `src/policy/journey/data/narration/gao001.scene02.narration.ts`), not inline JSX strings — mirrors the existing `BaseCard.narration` schema precedent but extended with `tier`/`nodeId`/`conceptIds`/`transcriptFlag`/version metadata so it flows into the same CSV/export path referenced in `trainingContent.types.ts`. This is the audit source of record for training-file defensibility — reviewable independent of code.

**Audio production — recommended fallback order:**
1. **Pre-generated narration audio files** (produced/approved, `.mp3`, one file per `narrationId`, keyed via `audioLocation` through the existing `narrationManifest.ts` pattern — extend `hasNarrationAudio`/`narrationAssetPath` to resolve `gao-001.*` locations the way `cms-485.*` already works). This is the primary path — required for a defensible training record (approved script, fixed timing, captionable).
2. **Browser `SpeechSynthesisUtterance` fallback** only when the approved file is missing (mirrors current `speechSupported` gate) — must be labeled "Preview" in UI exactly as today, never presented as the authoritative narration in training records.
3. Never ship a scene with narration text but zero audio path and zero fallback — silent-text-only nodes are the current defect pattern; disallow it going forward.

**Sync with unlock events:** each node's `node_unlock` audio plays automatically the moment a hotspot is first successfully interacted with (not on hover, not on re-visit) — same trigger point as `completedHotspots.push`/`markExplored` in the existing prototypes. `feedback` tier plays immediately after a graded choice, before the modal advances phase. `scene_complete` plays once when the derived "all required nodes unlocked" boolean flips true (adopt the `useEffect`-watching-derived-boolean pattern flagged as the safer convergence point in the prototype recon, not the `setTimeout`-in-handler pattern).

**Replay:** every played segment gets a persistent play/pause + replay control (bound to the segment's own `narrationId`, not a single global lesson `<audio>` ref) — a learner can re-hear any already-unlocked node's narration at will from the Field Notes/progress panel.

**Skip/resume:** skipping node-unlock audio is allowed (learner can mute/skip playback) but **does not skip the unlock itself** — visual/interaction completion and narration playback are decoupled; muting audio must not block progress, per existing accessibility need, but the transcript text must still render so the concept was textually available. Resume (Save & Exit mid-scene) must restore which nodes were already unlocked and mark their narration as "already delivered" (not re-forced) — this requires the scene-progress persistence gap identified in the shell recon to be closed (currently zero scene state survives unmount); narration delivery status should piggyback on whatever per-node persistence key is added for that fix.

---

## 4. ACCESSIBILITY & RECORDS DEFENSIBILITY

- **Captions/transcript:** every `NarrationSegment` with `transcriptFlag: true` renders verbatim (not summarized) in a read-along panel, synced to the currently-playing segment (highlight-on-play if feasible; at minimum, auto-scroll-into-view). This replaces the current "static full-script dump" pattern with per-tier, per-node granularity.
- **Screen-reader coexistence:** narration audio and any `aria-live` announcement must not both fire spoken content redundantly at the same time for a screen-reader user — use `aria-live="polite"` only for short state changes ("Node unlocked: Patient-Centered Care"), never for full instructional text (that belongs to the transcript panel + audio, read on-demand, not force-announced).
- **Pause/replay/speed:** standard media controls per segment — play/pause, replay-from-start, and a speed control (0.85x–1.25x) satisfying both slower-processing learners and review/audit playback. Speed control must not be TTS-only; applies to pre-generated audio too (requires `<audio playbackRate>`).
- **Reduced motion:** narration system itself is audio/text, not animation, but any node-unlock visual flourish that co-occurs with narration playback must respect `prefers-reduced-motion` independently (per the accessibility gap already flagged in the prototype recon).
- **Training-record logging:** log per learner, per scene: `nodeId`, `narrationId`, `deliveredAt` (timestamp first played or transcript-viewed), `completedViaAudio: boolean`, `completedViaTranscript: boolean`. A learner who muted audio but had transcript rendered still counts as "had access to full instructional narration" — the record must show delivery of text-or-audio, not require both. This log is the artifact that makes "was full instructional content available" auditable without re-deriving it from source code.

---

## 5. WRITING RULES

- **Story-integrated, not story-only:** every node-unlock sentence must do double duty — advance Alex's decision/action AND state the regulatory/operational fact plainly. Pattern: "Alex checks the plan of care before adjusting anything — federal rule 42 CFR 484.60 requires care to follow the individualized plan, not personal judgment in the moment." Never drop the citation to keep the sentence "clean" — speak it in plain cadence ("42 CFR 484.60" spoken as "four-eight-four point six-oh" is fine either way; consistency > cleverness).
- **CFR citations spoken plainly:** always pair the numeral citation with its plain-English label in the same sentence ("...484.50, the Patient Rights rule..." / "...484.110, which governs clinical records, not patient rights..."). Never cite a number with no plain-language anchor — numbers alone are not accessible or memorable.
- **No compression of enumerated content:** if source content is a table/list of N items, node-unlock narration must address all N items across that node's unlocks — either one item per node (preferred) or explicitly enumerated in one segment ("There are five things to check here: first... second...") — never collapsed into a single generic sentence like the current defect ("one missed report... can trigger a finding").
- **Mandatory-reporting exact sentence:** Scenes 6 and 8 must reproduce, character-for-character, in both narration and Field Notes: "Follow agency mandatory reporting protocol immediately; do not investigate or confront — your job stops at reporting the facts." No paraphrase substitute is acceptable — CI-checked (Section 2).
- **Banned patterns:** pure-summary sentences ("this covers what surveyors ask"); "as you can see," "as shown above," "in this image" (narration must stand alone for audio-only/blind learners — never reference visual-only information); reading UI chrome aloud ("click the button," "tap next," "check the box below" — describe the *decision*, not the *widget*); forbidden attestation phrases ("Policy Attested," "Policy Acknowledged," "PP Complete," "assigned P&P complete") — use only SAFE completion wording ("Scene Practice Complete," "Mission Practice Complete," "Core Values Practice Complete," "Training Module Complete," "Ready for Post-Test").
- **Feedback-tier wording:** correct branch reinforces *why* it was right (cite the concept), never just "Correct!"; incorrect branch must name the misconception and redirect to the correct principle, never just "Try again."
