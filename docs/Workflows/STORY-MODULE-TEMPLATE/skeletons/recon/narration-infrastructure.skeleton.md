# Skeleton — recon/narration-infrastructure.md

**Purpose:** document how narration is stored, keyed, and played today, so design/03's segment plan lands on real infrastructure.
**Exemplar:** `docs/GAO-001-A-New-Journey/recon/narration-infrastructure.md`

## Required sections

1. **Storage & schema** — where narration text lives for this module today (inline strings, data modules, `BaseCard.narration`), and whether the versioned `NarrationSegment` schema (invariants §9.2) is available yet.
2. **Audio manifest & assets** — the `narrationManifest.ts` pattern, `hasNarrationAudio`/`narrationAssetPath` key conventions, which asset families already resolve (e.g. `cms-485.*`), and whether any audio exists for this module.
3. **Playback & fallback** — the current player component(s), TTS "Preview" fallback gate, transcript rendering, replay/speed controls, and accessibility behavior.
4. **CI/verification hooks** — whether the coverage/forbidden-string/verbatim-sentence build checks (invariants §9.2) exist yet; if so, how a new module registers its concept checklist with them.
5. **Delta for this module** — the shortest path from today's state to the invariants-§9 system for this module (new keys, new data modules, audio production needs).

## Done when

Design/03 can name every narration segment and audio key without guessing conventions, and the audio-production open item is precisely scoped.
