# M01 FLUX + PuLID Prompt Pack

## Objective

Maintain strict visual continuity for Marites and produce healthcare-documentary realism across all slides.

## Character Lock (PuLID Reference Profile)

- **Name:** Marites
- **Identity:** Filipina nurse, early 30s
- **Core look:** tied-back dark hair, natural complexion, minimal makeup, navy scrubs
- **Continuity anchor:** woven bracelet on left wrist (must appear in stress/reflection/success scenes)
- **Accessories:** consistent badge layout, stethoscope style, practical shoes
- **Expression style:** calm, compassionate, emotionally grounded

## Global FLUX Style Prefix

Use this prefix in all still prompts:

`Ultra photorealistic healthcare documentary photograph, true skin texture, realistic facial anatomy, natural color science, cinematic but believable lighting, 35mm or 50mm lens, shallow depth of field, subtle film grain, no stylization.`

## Global Negative Prompt

`anime, cartoon, CGI, 3d render look, plastic skin, over-smoothed faces, malformed hands, extra fingers, distorted anatomy, over-saturated colors, neon fantasy lighting, text watermark, logo artifacts, stock-photo grin poses`

## PuLID Consistency Guidance

- Keep one primary face embedding for Marites across all scenes.
- Use one secondary embedding for Mr. Henderson.
- Reuse seed neighborhood by act:
  - Act 1 seeds: 1100-1199
  - Act 2 seeds: 2100-2299
  - Act 3 seeds: 3100-3299
- Lock wardrobe tokens for Marites in all scenes.
- Preserve bracelet token in prompt and composition notes.

## Camera and Mood Progression

- **Act 1:** wider frames, softer motion feeling, hopeful realism.
- **Act 2:** tighter framing, environmental pressure, practical contrast.
- **Act 3:** balanced framing, warmer light, calm confidence.

## Shot Rules for Compliance Realism

- Show believable clinical tools only when context requires them.
- Avoid theatrical conflict visuals; prioritize plausible workplace behavior.
- Capture documentation moments with realistic interfaces and neutral composition.
- Keep patient dignity in framing (no exploitative patient angles).

## Reusable Prompt Blocks

### Marites Reflection Insert

`Close documentary insert of Marites touching a woven bracelet on her left wrist, realistic skin detail, ambient natural light, emotionally restrained expression, 50mm lens, shallow depth of field, healthcare realism.`

### Interpreter Workflow Scene

`Photorealistic home health scene where Marites activates a qualified interpreter on speakerphone while seated at eye level with patient, natural indoor daylight, realistic paperwork and tablet, documentary composition, clinical trust atmosphere.`

### Documentation Defensibility Scene

`Over-shoulder documentary shot of Marites entering objective visit documentation into EHR with visible structured fields, realistic monitor glow, neutral office lighting, precise hand posture, authentic healthcare workflow realism.`

### Final Success Scene

`Warm photorealistic doorway scene of Marites and Mr. Henderson sharing respectful gratitude, woven bracelet visible, late-afternoon natural light, subtle film grain, balanced composition, emotionally grounded healthcare documentary style.`
