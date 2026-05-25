# V3HF — High Fidelity Image Generation Master Prompt (22 Images)

**Target Folder:** `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\v3hf`

**Objective:**  
Generate 22 high-fidelity, production-quality UI screenshot images. Each image must be a polished, consistent V3 Veil Glass version of one of the 22 provided reference screenshots, while strictly following the current V3 design system.

---

## 1. Mandatory References (You Must Internalize These)

Before generating any image, deeply analyze and follow these documents:

- `V3_Veil_Glass_Theme_Tokens_Spec.md` (latest v1.1) — especially:
  - Stronger glassmorphism values (22px blur, richer frost, enhanced glow)
  - Merged navigation + logo inside the main container
  - Broken / interrupted line separation (segmented vertical and horizontal lines instead of solid borders)
  - Exact color palette, typography, and spacing

- `V3_Veil_Drawer_Behavior_Spec.md` (v1.1) — Veil behavior and shell rules

- The 4 approved visual references (in `_approved_visual_references/` or previously provided)

- All 22 provided screenshots (the executive dashboard series + any other screens you are given in this session)

---

## 2. Core Style Requirements (Non-Negotiable)

For every generated image:

- **Overall Aesthetic**: Premium, cinematic dark executive dashboard style — exactly matching the visual quality and feeling of the provided screenshots, but elevated with current V3 Veil Glass rules.
- **Main Container**: One cohesive main content area. Navigation merges into it.
- **Navigation Treatment**: 
  - Logo + Hamburger integrated at top-left inside the main container.
  - Use **broken/interrupted vertical lines** (segmented, gapped strokes with breathing room) to separate the left nav from the main content area.
  - Occasional subtle horizontal broken lines for section division.
  - No solid continuous sidebar borders.
- **Glassmorphism**: 
  - Significantly stronger and more premium glass on the Veil Drawer (when visible) — use the v1.1 token values (22px blur, richer translucency, stronger teal glow).
  - Subtle, tasteful glass can appear on the main container surface to help the merged nav feel cohesive.
- **Default View Minimalism**: When the Veil is closed, the interface must feel extremely calm and sparse (high negative space, minimal elements).
- **Color & Lighting**: Match the dramatic dark carbon base with soft side gradient light leaks from the reference screenshots, while staying within the V3 token palette.
- **Typography & Hierarchy**: Large, impactful glowing metrics when present. Clean, highly legible sans-serif. Strong visual weight on key numbers.
- **Consistency**: All 22 images must feel like they belong to the exact same design system. Same glass treatment, same line style, same spacing language, same accent usage.

---

## 3. Image Generation Rules & Constraints (For Maximum Control)

Apply these constraints to every single image:

- **Format**: High-resolution UI screenshot style (photorealistic product interface render). No device frames, no browser chrome unless the original screenshot shows it.
- **Aspect Ratio**: Match the original screenshot as closely as possible (most will be 16:9 or similar widescreen dashboard views).
- **Resolution**: Ultra high fidelity — sharp typography, clean edges, premium anti-aliasing.
- **Lighting & Depth**: Preserve the cinematic side lighting and soft glows from the reference screenshots, but translate them into the V3 glass language.
- **Veil Drawer Treatment (when present in original)**: 
  - Use the stronger v1.1 glass treatment.
  - Show correct two-layer behavior if multiple layers are visible.
  - If showing Layer 1, use soft yellow highlights on brief text.
  - If showing Layer 2, use warm red highlights on important content.
- **No Style Drift**: Do not introduce new visual elements, new colors, or different card treatments not defined in the V3 specs.
- **Content Fidelity**: Keep the exact same layout structure, number of cards, nav items, metric values, and text as the original screenshot (translate only the visual treatment to V3).
- **File Naming**: Save every image using this convention:
  `V3HF_XX_Description.jpg` (e.g. `V3HF_01_Executive_Overview.jpg`, `V3HF_05_Calendar_With_Veil_Layer1.jpg`)

---

## 4. Process Instructions

1. **First Step**: Carefully study all 22 provided screenshots one by one.
2. For each screenshot, create a short internal analysis:
   - What is the main view type? (Overview, Calendar, Tasks, Metrics, etc.)
   - Is the Veil open? Which layer?
   - What is the nav state? (collapsed or expanded)
   - Key elements to preserve exactly.
3. Then generate the high-fidelity V3 version applying all constraints above.
4. Output the image and confirm the file name and location.

**Recommended workflow**:
- User uploads 1–3 screenshots at a time.
- Ask the model: "Generate V3HF version for screenshot #XX"
- The model generates the image using the constraints in this prompt.

---

## 5. Quality Checklist (Run This Mentally Before Outputting Each Image)

- [ ] Uses stronger 22px+ glass treatment on any Veil
- [ ] Nav is merged with broken/interrupted line separation
- [ ] Matches the exact layout and content of the source screenshot
- [ ] Consistent with the other generated images in this batch
- [ ] Feels premium, expensive, and calm (the user's definition of clean)
- [ ] No solid continuous borders between nav and content
- [ ] Follows current V3 Veil Glass v1.1 rules exactly

---

## 6. Output Location

All generated images must be saved to:  
`C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\v3hf`

---

**This prompt must be used together with the V3 Veil Glass specification documents (especially v1.1 versions of the Theme Tokens and Behavior specs).**

You now have full control instructions. Begin analysis of the provided screenshots when they are uploaded.