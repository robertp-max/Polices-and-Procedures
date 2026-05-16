# Tess's Journey — ComfyUI Production Pipeline Runbook

## Overview
Production workflow for Flux Dev 1.0 + PuLID identity lock + IPAdapter secondary character support. Designed for documentary-realism cinematic healthcare training generation across 71+ scenes with locked multi-character identity.

---

## 1. Required Node Packages

Install these via ComfyUI Manager or clone into `ComfyUI/custom_nodes/`:

| Package | Repository | Purpose |
|---------|-----------|---------|
| **ComfyUI-PuLID** | `github.com/cubiq/ComfyUI-PuLID` | Primary identity lock (face embedding) |
| **ComfyUI_IPAdapter_plus** | `github.com/cubiq/ComfyUI_IPAdapter_plus` | Secondary character guidance |
| **ComfyUI-Manager** | `github.com/ltdrdata/ComfyUI-Manager` | Node package management |
| **ComfyUI-Impact-Pack** | `github.com/ltdrdata/ComfyUI-Impact-Pack` | Face detailer, inpaint, compositing (optional post-process) |
| **rgthree-comfy** | `github.com/rgthree/rgthree-comfy` | Utility nodes (seed, switches, muting) |

### Installation Commands
```bash
cd ComfyUI/custom_nodes
git clone https://github.com/cubiq/ComfyUI-PuLID.git
git clone https://github.com/cubiq/ComfyUI_IPAdapter_plus.git
git clone https://github.com/ltdrdata/ComfyUI-Impact-Pack.git
git clone https://github.com/rgthree/rgthree-comfy.git

# Install Python deps for each
pip install -r ComfyUI-PuLID/requirements.txt
pip install -r ComfyUI_IPAdapter_plus/requirements.txt
pip install -r ComfyUI-Impact-Pack/requirements.txt
```

---

## 2. Required Models

### Core Flux Dev 1.0
| File | Location | Download |
|------|----------|----------|
| `flux1-dev.safetensors` | `models/unet/` (or `models/diffusion_models/`) | HuggingFace: `black-forest-labs/FLUX.1-dev` |
| `clip_l.safetensors` | `models/clip/` | HuggingFace: `comfyanonymous/flux_text_encoders` |
| `t5xxl_fp16.safetensors` | `models/clip/` | HuggingFace: `comfyanonymous/flux_text_encoders` (use fp8 if VRAM < 24GB) |
| `ae.safetensors` | `models/vae/` | HuggingFace: `black-forest-labs/FLUX.1-dev` |

### PuLID
| File | Location | Download |
|------|----------|----------|
| `pulid_flux_v0.9.1.safetensors` | `models/pulid/` | HuggingFace: `guozinan/PuLID` |
| `antelopev2` (InsightFace) | `models/insightface/models/antelopev2/` | Auto-downloaded by PuLID on first run, or manual from InsightFace |
| EVA-02-CLIP-L-14-336 | `models/clip/` or auto-downloaded | Required by PuLID EVA-CLIP loader |

### IPAdapter (secondary characters)
| File | Location | Download |
|------|----------|----------|
| `ip-adapter-flux.safetensors` | `models/ipadapter/` | HuggingFace: `h94/IP-Adapter` (Flux variant) |

### Optional Post-Processing
| File | Location | Purpose |
|------|----------|---------|
| `GFPGANv1.4.pth` | `models/facerestore_models/` | Face restoration if needed |
| `codeformer-v0.1.0.pth` | `models/facerestore_models/` | Alternative face restoration |

---

## 3. Workflow Architecture

### Primary Paths

The workflow has **two generation paths** — use one at a time:

#### Path A: Multi-Character (PuLID + IPAdapter)
```
UNETLoader(flux-dev) → ApplyPulidFlux(Tess, 0.85) → IPAdapter(Secondary, 0.55) → KSampler → VAEDecode → Save
```
Use for: Tess + Aldrin scenes, Tess + Henderson daughter, any two-character frame.

#### Path B: Solo Character (PuLID only)
```
UNETLoader(flux-dev) → ApplyPulidFlux(Tess, 0.85) → KSampler → VAEDecode → Save
```
Use for: Tess-only scenes, close-ups, emotional beats, bracelet close-ups.

#### Path C: Hybrid Compositing (identity-collapse fallback)
When direct multi-character render produces identity bleed:
1. Generate environment plate (no PuLID, no IPAdapter — pure Flux prompt)
2. Inpaint Character A into plate with PuLID active
3. Inpaint Character B into plate with different PuLID ref
4. Harmonize shadows and color temperature
5. Optional upscale

### Node Graph Summary

```
                    ┌──────────────┐
                    │  LoadImage   │ Tess reference
                    │  (node 10)   │
                    └──────┬───────┘
                           │
┌──────────────┐    ┌──────▼───────┐
│  UNETLoader  │───▶│ ApplyPuLID   │ weight 0.85
│  Flux Dev    │    │  (node 14)   │
│  (node 1)    │    └──────┬───────┘
└──────────────┘           │
                    ┌──────▼───────┐     ┌──────────────┐
                    │  IPAdapter   │◀────│  LoadImage   │ Secondary ref
                    │  (node 22)   │     │  (node 20)   │
                    └──────┬───────┘     └──────────────┘
                           │
┌──────────────┐    ┌──────▼───────┐     ┌──────────────┐
│ DualCLIP     │───▶│  KSampler    │◀────│ EmptyLatent  │
│ (node 2)     │    │  (node 30)   │     │ 1344×768     │
│ → FluxGuide  │    └──────┬───────┘     │ (node 7)     │
│ → CLIPEncode │           │             └──────────────┘
└──────────────┘    ┌──────▼───────┐
                    │  VAEDecode   │
┌──────────────┐    │  (node 31)   │
│  VAELoader   │───▶└──────┬───────┘
│  (node 3)    │           │
└──────────────┘    ┌──────▼───────┐
                    │  SaveImage   │
                    │  (node 40)   │
                    └──────────────┘
```

---

## 4. Recommended Generation Settings

### KSampler Settings (Flux Dev Realism)

| Parameter | Value | Notes |
|-----------|-------|-------|
| **sampler** | `euler` | Cleanest for Flux. Avoid `dpmpp_2m` — adds oil-painting drift. |
| **scheduler** | `simple` | Most stable. `normal` is acceptable. Avoid `karras` — over-smooths skin. |
| **steps** | 28 | Sweet spot. Below 20 = undercooked faces. Above 35 = diminishing returns + overcooking. |
| **cfg** | 1.0 | Flux guidance is handled by FluxGuidance node (set to 3.5). KSampler CFG stays at 1.0. |
| **denoise** | 1.0 | Full denoise for txt2img. For inpaint passes use 0.65–0.80. |
| **resolution** | 1344 × 768 | Cinematic 16:9. Flux trained at 1024-range. Don't exceed 1536 on any axis. |

### FluxGuidance Settings

| Parameter | Value | Notes |
|-----------|-------|-------|
| **guidance** | 3.5 | Documentary realism sweet spot. Below 2.0 = prompt-deaf. Above 5.0 = over-saturated, HDR look. |

### PuLID Settings

| Parameter | Tess (Primary) | Secondary Characters |
|-----------|---------------|---------------------|
| **weight** | 0.85 | N/A (use IPAdapter instead) |
| **start_at** | 0.0 | N/A |
| **end_at** | 1.0 | N/A |

Higher PuLID weight = stronger identity lock but less prompt flexibility.
- 0.70 = mild guidance, prompt-dominant
- 0.85 = strong lock, good prompt balance (recommended for Tess)
- 1.0 = maximum lock, may resist environment changes

### IPAdapter Settings (Secondary Characters)

| Parameter | Value | Notes |
|-----------|-------|-------|
| **weight** | 0.55 | Lower than PuLID — prevents bleed into primary character |
| **weight_type** | linear | Most predictable |
| **start_at** | 0.0 | |
| **end_at** | 0.80 | Stop before final refinement steps to prevent identity contamination |

---

## 5. Prompt Engineering for Documentary Realism

### Positive Prompt Template
```
Cinematic documentary photograph. [SCENE DESCRIPTION FROM CANONICAL CSV].
Natural available light, [LIGHTING CONDITION].
Realistic skin texture with pores and subtle imperfections.
35mm film grain. Muted color grading.
[ENVIRONMENT DESCRIPTION].
[CHARACTER WARDROBE AND POSTURE].
Shallow depth of field. Documentary realism.
ISO 800 grain. Warm-neutral color temperature.
```

### Mandatory Realism Anchors
Always include at least three of these in every positive prompt:
- `realistic skin texture with pores`
- `35mm film grain`
- `muted color grading`
- `natural available light`
- `documentary realism`
- `shallow depth of field`
- `ISO 800`

### Anti-Stylization Terms
Flux Dev does not use traditional negative prompts. Instead, embed anti-stylization directly in the positive prompt by including terms like:
- `No makeup glamor`
- `No fashion lighting`
- `No HDR bloom`
- `No cinematic color grading`
- `No beauty retouch`
- `Not a movie poster`

Or use a soft negative with very low weight in the negative CLIP encode:
```
anime, cartoon, painting, illustration, CGI render, plastic skin, glossy,
HDR, oversaturated, beauty retouch, fashion editorial, glamor lighting,
smooth skin, airbrushed, dreamlike, fantasy, bokeh balls, lens flare,
neon, cyberpunk, steampunk, dark fantasy, superhero, magazine cover
```

### Environment-Specific Prompt Fragments

**Filipino Home (Prologue):**
```
Modest Filipino home interior, warm incandescent light, louvered windows,
concrete walls painted cream, wooden furniture, religious imagery on walls,
lived-in and clean, morning pre-dawn blue-to-warm light transition
```

**Agency Nursing Station:**
```
Healthcare agency nursing station, fluorescent overhead lighting,
shared workstations with monitors, coffee cups, stethoscopes,
bulletin board with printed schedules, fire extinguisher on wall,
institutional carpet, functional and unglamorous
```

**Patient Home (Suburban US):**
```
Modest American suburban home interior, converted living room for patient care,
hospital bed near window, family photos still on walls, rolling medical supply tray,
natural daylight through half-closed blinds, mixed light sources,
ordinary and lived-in, not staged or cleaned for camera
```

---

## 6. Multi-Character Scene Protocol

### Direct Render (Try First)
1. Set PuLID to primary character (Tess) at weight 0.85
2. Set IPAdapter to secondary character at weight 0.55
3. Describe both characters clearly in prompt with spatial positioning
4. Generate

### Identity Bleed Detection
After generation, check for:
- [ ] Primary character face matches reference?
- [ ] Secondary character face is distinct from primary?
- [ ] No facial feature averaging (mixed eyes, blended jawlines)?
- [ ] Correct ethnicity maintained for each character?
- [ ] Age looks correct for each character?

### Hybrid Compositing (Fallback)
If direct render fails identity check:

**Step 1 — Environment plate:**
- Disable PuLID and IPAdapter (mute nodes)
- Generate the scene composition with character descriptions but no identity lock
- The faces will be random — that's fine, we only want the room/lighting/composition

**Step 2 — Inpaint primary character:**
- Enable PuLID with Tess reference
- Mask over Character A's face + upper body
- Inpaint at denoise 0.70–0.80
- Tess's face will render correctly in the masked region

**Step 3 — Inpaint secondary character:**
- Switch PuLID to secondary character reference (or use IPAdapter)
- Mask over Character B's face + upper body
- Inpaint at denoise 0.65–0.75

**Step 4 — Harmonize:**
- Full-image denoise pass at 0.15–0.25 with all identity nodes active
- This blends lighting/shadows without destroying the inpainted faces

---

## 7. Production Batch Processing

### CSV-Driven Generation
The `scene_batch_template.csv` defines per-scene parameters. A batch runner script reads each row and injects values into the workflow API:

```
scene_id → output filename
prompt → node 4 (CLIPTextEncode) text
seed → node 30 (KSampler) seed
character_1 → node 10 (LoadImage) reference selection
character_2 → node 20 (LoadImage) reference selection
aspect_ratio → node 7 (EmptyLatentImage) width/height
```

### Recommended Generation Order
1. **Environment plates first** (no identity lock — establish setting consistency)
2. **Tess solo scenes** (PuLID only — lock her face across all environments)
3. **Two-character scenes** (PuLID + IPAdapter — starting with most important)
4. **Challenge/debrief overlay scenes** (may use simpler compositions)
5. **Close-ups and inserts** (bracelet, hands, documents — lower PuLID weight OK)
6. **QA pass** — review all outputs for identity drift, then re-render failures

### Output Structure
```
ComfyUI/output/tess-journey/
├── plates/          # Environment-only renders (no identity)
├── drafts/          # First-pass renders with identity
├── accepted/        # QA-approved renders
├── final/           # Post-processed final images
└── metadata/        # JSON sidecars with generation settings
```

---

## 8. Troubleshooting

### Faces Look Waxy / Plastic
- **Cause**: PuLID weight too high OR guidance too high OR steps too many
- **Fix**: Lower PuLID weight to 0.75. Lower FluxGuidance to 3.0. Reduce steps to 24. Add `realistic skin texture with pores and imperfections` to prompt.

### Identity Bleed (Two Faces Merge)
- **Cause**: IPAdapter weight too high OR end_at too late
- **Fix**: Lower IPAdapter weight to 0.45. Set end_at to 0.70. If still bleeding, switch to Hybrid Compositing path.

### Wrong Ethnicity
- **Cause**: Prompt description overriding PuLID, or PuLID weight too low
- **Fix**: Increase PuLID weight to 0.90. Explicitly state ethnicity in prompt. Check that reference image is the correct character.

### Over-Saturated / HDR Look
- **Cause**: FluxGuidance too high
- **Fix**: Lower guidance from 3.5 to 2.5–3.0. Add `muted color grading, available light, no HDR` to prompt.

### Bloom / Glow on Faces
- **Cause**: Prompt mentions "cinematic lighting" without grounding OR sampler/scheduler mismatch
- **Fix**: Remove `cinematic lighting`. Use `natural available light` or `fluorescent overhead`. Confirm sampler is `euler` and scheduler is `simple`.

### Faces Deform at High Resolution
- **Cause**: Flux latent space struggles above ~1536px on any axis
- **Fix**: Generate at 1344×768. If you need higher resolution, generate at base res then use a conservative upscaler (2× maximum, Real-ESRGAN or similar) with a face-restore pass (GFPGAN or CodeFormer at low strength 0.3–0.5).

### Secondary Character Disappears
- **Cause**: IPAdapter weight too low OR prompt doesn't describe the character's position
- **Fix**: Increase IPAdapter weight to 0.60. Add explicit spatial description: "Character B stands to the right, facing Character A."

### Bracelet Missing
- **Cause**: Small detail gets lost in generation
- **Fix**: Include `woven thread bracelet visible on left wrist` in every Tess scene prompt. For close-ups, use an inpaint pass focused on the wrist area with bracelet reference image.

### Inconsistent Environment Between Scenes
- **Cause**: Different seeds with different prompt wording
- **Fix**: Use environment seed sub-ranges (see SEED_STRATEGY.md). Keep environment description identical across scenes in the same location. Generate environment plates first, then inpaint characters.

---

## 9. File Reference

| File | Purpose |
|------|---------|
| `workflows/tess-journey-flux-pulid-v1.json` | Main ComfyUI workflow (API format) |
| `characters/Tess/CHARACTER_SHEET.md` | Primary character reference + settings |
| `characters/Aldrin/CHARACTER_SHEET.md` | Secondary character reference + settings |
| `characters/Grandmother/CHARACTER_SHEET.md` | Secondary character reference + settings |
| `characters/Henderson_Daughter/CHARACTER_SHEET.md` | Secondary character reference + settings |
| `SEED_STRATEGY.md` | Seed family assignment guide |
| `scene_batch_template.csv` | Per-scene parameter CSV for batch generation |

---

## 10. Quick-Start Checklist

- [ ] ComfyUI installed and running
- [ ] All custom node packages installed (PuLID, IPAdapter, Impact Pack)
- [ ] All models downloaded to correct locations
- [ ] Character reference images placed in `characters/` folders
- [ ] Workflow JSON loaded into ComfyUI
- [ ] Test single Tess solo scene (Path B)
- [ ] Test Tess + Aldrin scene (Path A)
- [ ] Verify PuLID is locking identity across 3+ different seeds
- [ ] Verify documentary realism quality (no HDR, no glow, natural skin)
- [ ] Begin batch generation following recommended order
