# GAO-001 Scene 1 narration audio

Voice-cloned with local Qwen3-TTS (`scripts/narrationTts/generate_narration_audio.py`)
from reference: Bay Area man sample (x-vector only).

## Layout

```
scene-01/
  scene-start.wav          Main scene / shell delivery narration
  scene-complete.wav       Scene practice complete bridge
  overlays/
    email.wav              Welcome email field notes
    checklist.wav          Orientation checklist field notes
    packet.wav             Orientation packet field notes
    badge.wav              ID badge field notes
    notebook.wav           Field notebook field notes
  segments.json            Source scripts used for generation
  generation-results.json  Durations / generation log
  _staging/                Raw generator output (safe to ignore)
```

## Rules

- Transcript text in `src/policy/journey/data/gao001/scene01/narration.ts` is authoritative
- Audio files are replaceable under the same names
- No PHI; Alex (not Lina) wording
- Supports the scene — not competency evidence

## Regenerate

```bat
C:\AI\qwen3-tts-env\Scripts\python.exe scripts\narrationTts\generate_narration_audio.py ^
  --manifest scripts\narrationTts\gao001-scene01-segments.json ^
  --ref-audio "C:\Users\razer\Documents\Audacity\bayarea man.wav" ^
  --ref-text "This is a short Bay Area voice sample used for training narration voice cloning." ^
  --out-dir public\training\gao-001\audio\scene-01\_staging ^
  --ext wav ^
  --results public\training\gao-001\audio\scene-01\generation-results.json
```

Then rename/copy from `_staging/` into this layout (see filenames above).
