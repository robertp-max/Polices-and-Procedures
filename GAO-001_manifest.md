# GAO-001 Image Generation Manifest

## Model Note

The full batch used FLUX.1-dev because its smoke test produced the cleaner full-frame, SVG-like home-health room direction with no white card or mockup frame. FLUX.2-dev produced a polished card-like smoke test, so it was avoided for the main scenes. Two scene 03 pillar replacements used FLUX.2-dev because it produced the cleanest full-frame four-pillar visuals after targeted prompting.

## Generation Settings

- Primary workflow: FLUX.1-dev checkpoint `flux1-dev.safetensors` with `clip_l.safetensors`, `t5xxl_fp16.safetensors`, and `ae.safetensors`
- Targeted scene 03 replacements: FLUX.2-dev `flux2_dev_fp8mixed.safetensors` with `mistral_3_small_flux2_bf16.safetensors` and `full_encoder_small_decoder.safetensors`
- Size delivered: 1600 x 900 PNG
- Style: full-frame 16:9 flat vector illustration, edge-to-edge composition, no white border, no presentation card, no mockup frame, no embedded UI frame, no text

## Primary LMS Visual Anchor Recommendations

| Scene | Recommended Image | Rationale |
| --- | --- | --- |
| 01 - Welcome to Care Indeed Home Health | `GAO-001/scene-01-welcome/v2.png` | Best onboarding/journey metaphor with clear patient and staff roles. |
| 02 - Our Mission: What It Demands of You | `GAO-001/scene-02-mission/v2.png` | Strongest patient-first mission composition with clean overlay zones. |
| 03 - Our Vision: Four Pillars of Excellence | `GAO-001/scene-03-vision/v2.png` | Clearest four-pillar visual anchor and strongest icon separation. |
| 04 - Core Values in Action | `GAO-001/scene-04-values/v2.png` | Best simple values-in-action home visit anchor. |
| 05 - What Makes Home Health Different | `GAO-001/scene-05-home-health-different/v2.png` | Most readable split between facility-style care and home-health autonomy. |
| 06 - Mandatory Reporting & Escalation | `GAO-001/scene-06-reporting-escalation/v2.png` | Strongest reporting/escalation pathway with clear compliance symbols. |
| 07 - Scenario Challenge 1: Patient Refuses Treatment | `GAO-001/scene-07-refusal/v3.png` | Clearest respectful refusal scenario and branching-decision space. |
| 08 - Scenario Challenge 2: Suspected Neglect or Abuse | `GAO-001/scene-08-neglect-abuse/v1.png` | Most sensitive non-graphic concern scene with reporting symbolism. |
| 09 - Module Summary & Attestation Prep | `GAO-001/scene-09-summary/v3.png` | Best concluding readiness/reflection scene without implying formal attestation. |

## Image Records

### Scene 01 - Welcome to Care Indeed Home Health

- Filename: `GAO-001/scene-01-welcome/v1.png`
  - Prompt summary: Welcoming home-health care moment with clinician and patient in a full-frame home room.
  - Chosen model: FLUX.1-dev
  - Seed: 22001101
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-01-welcome/v2.png`
  - Prompt summary: Orientation journey scene with patient, care staff, dotted path, and icon-only onboarding cues.
  - Chosen model: FLUX.1-dev
  - Seed: 22001102
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-01-welcome/v3.png`
  - Prompt summary: First-day doorway/home-threshold orientation scene with clinician and patient.
  - Chosen model: FLUX.1-dev
  - Seed: 22011103
  - Width x height: 1600 x 900

### Scene 02 - Our Mission: What It Demands of You

- Filename: `GAO-001/scene-02-mission/v1.png`
  - Prompt summary: Mission scene with patient-first care and surrounding symbolic concept cues.
  - Chosen model: FLUX.1-dev
  - Seed: 22001201
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-02-mission/v2.png`
  - Prompt summary: Patient-centered mission conversation in a home setting with calm overlay space.
  - Chosen model: FLUX.1-dev
  - Seed: 22001202
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-02-mission/v3.png`
  - Prompt summary: Mission action scene with handoff/support cues and patient/home context.
  - Chosen model: FLUX.1-dev
  - Seed: 22001203
  - Width x height: 1600 x 900

### Scene 03 - Our Vision: Four Pillars of Excellence

- Filename: `GAO-001/scene-03-vision/v1.png`
  - Prompt summary: Four-pillar vision scene with large classical columns and home-health context.
  - Chosen model: FLUX.1-dev
  - Seed: 22001301
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-03-vision/v2.png`
  - Prompt summary: Clean four-pillar excellence framework with icons for care, growth, teamwork, and trust.
  - Chosen model: FLUX.2-dev fp8 mixed
  - Seed: 33021302
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-03-vision/v3.png`
  - Prompt summary: Four vertical pillar panels with icon-only vision symbols, strong overlay zones.
  - Chosen model: FLUX.2-dev fp8 mixed
  - Seed: 33021304
  - Width x height: 1600 x 900

### Scene 04 - Core Values in Action

- Filename: `GAO-001/scene-04-values/v1.png`
  - Prompt summary: Values in action during a home visit with clinician, patient, and care interaction.
  - Chosen model: FLUX.1-dev
  - Seed: 22001401
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-04-values/v2.png`
  - Prompt summary: Respectful clinician-patient support scene with subtle values symbolism.
  - Chosen model: FLUX.1-dev
  - Seed: 22001402
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-04-values/v3.png`
  - Prompt summary: Listening-focused home visit scene with patient, clinician, and calm support cues.
  - Chosen model: FLUX.1-dev
  - Seed: 22001403
  - Width x height: 1600 x 900

### Scene 05 - What Makes Home Health Different

- Filename: `GAO-001/scene-05-home-health-different/v1.png`
  - Prompt summary: Split facility/home-health comparison with clinician, patient, and home-care context.
  - Chosen model: FLUX.1-dev
  - Seed: 22001501
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-05-home-health-different/v2.png`
  - Prompt summary: Two-sided home-health difference scene with documentation and independent decision cues.
  - Chosen model: FLUX.1-dev
  - Seed: 22001502
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-05-home-health-different/v3.png`
  - Prompt summary: Facility-to-home-health contrast with patient mobility and coordination cues.
  - Chosen model: FLUX.1-dev
  - Seed: 22001503
  - Width x height: 1600 x 900

### Scene 06 - Mandatory Reporting & Escalation

- Filename: `GAO-001/scene-06-reporting-escalation/v1.png`
  - Prompt summary: Reporting/escalation chain with shield, alert, clipboard, and connected nodes.
  - Chosen model: FLUX.1-dev
  - Seed: 22021601
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-06-reporting-escalation/v2.png`
  - Prompt summary: Clinician-led reporting pathway with documentation, alerts, and compliance symbols.
  - Chosen model: FLUX.1-dev
  - Seed: 22011602
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-06-reporting-escalation/v3.png`
  - Prompt summary: Home-health escalation context with documentation and supervisor/reporting cues.
  - Chosen model: FLUX.1-dev
  - Seed: 22001603
  - Width x height: 1600 x 900

### Scene 07 - Scenario Challenge 1: Patient Refuses Treatment

- Filename: `GAO-001/scene-07-refusal/v1.png`
  - Prompt summary: Respectful refusal scenario with clinician, patient, and communication space.
  - Chosen model: FLUX.1-dev
  - Seed: 22001701
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-07-refusal/v2.png`
  - Prompt summary: Patient choice conversation with calm branching/speech-bubble decision cues.
  - Chosen model: FLUX.1-dev
  - Seed: 22001702
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-07-refusal/v3.png`
  - Prompt summary: Patient refusal moment with clinician responding professionally in a home setting.
  - Chosen model: FLUX.1-dev
  - Seed: 22001703
  - Width x height: 1600 x 900

### Scene 08 - Scenario Challenge 2: Suspected Neglect or Abuse

- Filename: `GAO-001/scene-08-neglect-abuse/v1.png`
  - Prompt summary: Sensitive suspected neglect concern with shield/reporting cue and subtle home indicators.
  - Chosen model: FLUX.1-dev
  - Seed: 22001801
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-08-neglect-abuse/v2.png`
  - Prompt summary: Non-graphic concern scene with vulnerable patient and home-health observation.
  - Chosen model: FLUX.1-dev
  - Seed: 22001802
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-08-neglect-abuse/v3.png`
  - Prompt summary: Calm reporting scenario with patient support and subtle escalation-ready space.
  - Chosen model: FLUX.1-dev
  - Seed: 22001803
  - Width x height: 1600 x 900

### Scene 09 - Module Summary & Attestation Prep

- Filename: `GAO-001/scene-09-summary/v1.png`
  - Prompt summary: Summary/readiness scene bringing together care, reporting, and patient support cues.
  - Chosen model: FLUX.1-dev
  - Seed: 22001901
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-09-summary/v2.png`
  - Prompt summary: Recap path scene with care-team and readiness symbols across the home-health setting.
  - Chosen model: FLUX.1-dev
  - Seed: 22001902
  - Width x height: 1600 x 900

- Filename: `GAO-001/scene-09-summary/v3.png`
  - Prompt summary: Prepared care-team and patient reflection scene for module closeout.
  - Chosen model: FLUX.1-dev
  - Seed: 22001903
  - Width x height: 1600 x 900
