# Documentary Realism Best Practices — Tess's Journey Production

## What This Project Looks Like

This is NOT:
- AI art gallery work
- Instagram aesthetic generation
- Movie poster production
- Fantasy or sci-fi concept art
- Beauty photography

This IS:
- A documentary crew following a real nurse through her first year
- Available-light photography in unglamorous real locations
- Faces that look like real people, not models
- Environments that look lived-in, not staged
- Medical equipment that looks used, not catalog-fresh
- Emotional authenticity without theatrical performance

---

## Visual References (Mental Model)

Think of the visual language of:
- Frederick Wiseman documentaries (institutional realism)
- Hoop Dreams (intimate life documentation)
- The Florida Project (available-light naturalism)
- Any well-shot medical documentary on PBS or BBC

NOT:
- Grey's Anatomy (glamor lighting, model actors)
- House (dramatic shadows, stylized color)
- Any Marvel film (everything is color-graded within an inch of its life)

---

## Lighting Rules

### Available Light First
Every scene should look like it was shot with available light — meaning the light sources visible in the scene ARE the light sources illuminating the characters.

| Location | Light Source | Color Temperature |
|----------|-------------|-------------------|
| Filipino kitchen (pre-dawn) | Fluorescent tube + pre-dawn window | Blue-white + deep blue |
| Filipino sala | Incandescent overhead + parol lantern | Warm yellow-orange |
| Agency nursing station | Fluorescent ceiling panels | Cool white, flat |
| Patient home (daytime) | Window daylight + table lamp | Mixed warm/cool |
| Patient home (evening) | Overhead fixture + lamp | Warm yellow |
| Agency hallway | Fluorescent tubes | Flat institutional white |
| Suburban porch | Overcast sky | Flat grey-white |

### Light Should Never:
- Create visible rays or god-rays
- Produce lens flare
- Create bokeh balls (this is documentary, not portrait photography)
- Cast dramatic shadows unless the environment naturally would
- Glow or bloom around faces
- Make skin look lit from inside (that's the HDR/beauty look)

### Light Should Always:
- Fall naturally from the visible light source
- Create realistic shadow direction
- Allow skin to have natural shadow under cheekbones, nose, chin
- Produce warm-neutral color temperature appropriate to the location
- Feel like a real room, not a studio

---

## Skin and Face Rules

### Skin Must:
- Show pores (especially in close-ups)
- Show subtle imperfections — small marks, uneven tone
- Have natural shadow under eyes (not dramatic dark circles, just real human under-eye)
- Look like real human skin under real light
- Have appropriate texture for the character's age (grandmother: deeply lined; Tess: smooth but not airbrushed)

### Skin Must NOT:
- Look plastic, waxy, or poreless
- Glow or have subsurface scattering bloom
- Look like it's been through a beauty filter
- Be perfectly even in tone
- Be unnaturally smooth for the character's age

### Eyes Must:
- Have catchlight from the scene's actual light source
- Be proportionally correct (no enlargement)
- Have realistic iris detail
- Not glow or have fantasy-style color
- Look tired if the scene calls for it (early morning, late shift)

### Prompt Engineering for Skin
Always include at least one of:
```
realistic skin texture with visible pores
natural imperfections and uneven skin tone
no beauty retouch, no skin smoothing
real human skin under available light
```

---

## Environment Rules

### Environments Must:
- Look lived-in, not staged
- Have visible clutter appropriate to the setting (family home: some clutter; agency: organized but not sterile)
- Have consistent props across scenes in the same location
- Have appropriate wear (scuffed floors, slightly stained counters, yellowed blinds)
- Have realistic scale (rooms are real-world sized, not studio-large)

### Continuity Anchors per Location

**Tess's Philippine Home:**
- Star-shaped parol lantern on wall (every sala scene)
- Mismatched picture frames
- Concrete walls painted cream
- Louvered windows
- Crucifix above bed
- Santo Niño calendar
- Worn cutting board in kitchen
- Datu Puti vinegar on table

**Agency Nursing Station:**
- Fluorescent panels overhead
- Shared workstations with monitors
- Bulletin board with printed schedules
- Coffee cups (especially near Aldrin)
- Fire extinguisher visible in hallway
- "Language Services" poster (hallway)
- Hand sanitizer dispensers
- Wall clock (time-specific scenes)

**Henderson Patient Home:**
- Converted living room with hospital bed
- Bookshelf pushed to wall
- Family photos still hanging
- Half-closed blinds (grey daylight)
- Rolling medical supply tray
- Folded walker in hallway
- American flag sticker on storm door
- Rubber doormat on porch
- Wilting potted plant on porch railing

---

## Color Grading

### Target Palette
- **Muted** — desaturated 10-20% from Flux default
- **Warm-neutral** — neither orange-pushed nor teal-pushed
- **Natural contrast** — not flat, not high-contrast
- **Film grain** — subtle, consistent with ISO 800

### Prompt Modifiers
```
muted color grading
warm-neutral color temperature
35mm film grain
ISO 800
no color grading, no teal and orange
natural contrast
```

### Post-Processing
If Flux output is too saturated:
- Reduce saturation by 10-15% in post
- Add subtle 35mm grain overlay
- Do NOT add vignette (that's a stylization)
- Do NOT add film-emulation LUTs (those push toward cinema, not documentary)

---

## Expression Rules

### Expression Should:
- Be subtle and internal (Tess processes emotions internally)
- Match the scene's emotional beat exactly — not more, not less
- Be readable but not theatrical
- Use micro-expressions: slight jaw set, eyes narrowing, brief wince of recognition

### Expression Should NOT:
- Be dramatically emotional (no open-mouth shock, no tears streaming unless scripted)
- Be performative (characters don't know they're being watched)
- Be generic-model-smile
- Be completely blank (there's always something behind the eyes)

### Character-Specific Expression Notes
- **Tess**: Composed, attentive, occasionally wry. Processes internally. Eyes are always working.
- **Aldrin**: Calm, matter-of-fact. Approving without being warm. Professional distance.
- **Grandmother**: Deliberate, deep familiarity. Every gesture is an old habit.
- **Henderson Daughter**: Respectful but firm. Advocating, not hostile.

---

## Composition Rules

### Camera Framing
- **Medium shots** for most dialogue/interaction scenes
- **Close-ups** for emotional beats and bracelet moments
- **Over-shoulder** for two-character conversations
- **Medium wide** for environment establishment
- **Eye level** for most shots (documentary camera doesn't tilt dramatically)

### Depth of Field
- Shallow DOF for emotional beats (face sharp, background soft)
- Moderate DOF for environment scenes (most of the room readable)
- Deep DOF for wide establishing shots

### Avoid:
- Dutch angle
- Extreme low angle
- Extreme high angle (unless scripted, e.g., document close-up)
- Dramatic rack focus
- Symmetrical center framing (this isn't Wes Anderson)

---

## Generation Order Rationale

1. **Environment plates** — Lock the look of each location without character identity complexity
2. **Tess solo scenes** — Lock her face across every environment while she's the only subject
3. **Two-character scenes** — Now that both the environment and Tess are locked, add the secondary character
4. **Assessment overlay scenes** — These may use simpler compositions or reuse backgrounds
5. **Close-ups and inserts** — Bracelet, documents, pill organizers, chart fields
6. **QA and re-renders** — Fix any drift, re-render failed scenes

This order minimizes identity drift by establishing anchors before introducing complexity.
