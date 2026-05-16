# Seed Family Strategy — Tess's Journey Production Pipeline

## Core Principle
Seeds control the latent noise pattern. Same seed + same model + same dimensions = same structural composition. But identity, face shape, and fine detail are NOT reliably locked by seed alone. Seeds provide **compositional stability** — PuLID and IPAdapter provide **identity stability**.

Use seeds for: repeatable layout, consistent environmental framing, batch reproducibility.
Do NOT use seeds for: face identity, character consistency, expression control.

---

## Seed Architecture

### Per-Character Seed Families

| Character | Seed Range | Purpose |
|-----------|-----------|---------|
| **Tess** | 380000–389999 | All Tess-primary scenes |
| **Aldrin** | 390000–399999 | Aldrin coaching/mentoring scenes |
| **Grandmother** | 400000–409999 | Prologue family scenes |
| **Henderson Daughter** | 410000–419999 | Patient home / accommodation arc |
| **Agency Environment** | 420000–429999 | Empty environment plates |
| **Patient Homes** | 430000–439999 | Empty environment plates |
| **Challenges/Debriefs** | 440000–449999 | Assessment UI overlay scenes |
| **Reserve** | 450000–499999 | Future characters, M02+ scenes |

### Per-Environment Sub-Ranges (Tess example)

| Sub-Range | Environment |
|-----------|-------------|
| 380000–380999 | Philippines home (prologue) |
| 381000–381999 | Agency nursing station |
| 382000–382999 | Patient homes (clinical visits) |
| 383000–383999 | Transitions / emotional beats |
| 384000–384999 | Break room / hallway |
| 385000–385999 | Supervisor office |

---

## How to Assign Seeds

### Step 1: Pick character range
The primary character in the scene determines the top-level range.

### Step 2: Pick environment sub-range
The scene location determines the sub-range within the character family.

### Step 3: Increment within sub-range
Each new scene in the same environment gets the next sequential seed.

**Example — Act 1 Prologue:**
```
M01-S01a (kitchen, no Tess)    → 380001
M01-S01b (bedroom, Tess)       → 380002
M01-S01c (bedroom window)      → 380003
M01-S02  (kitchen, grandmother) → 400001  (grandmother primary)
M01-S03a (dining table)        → 380004
M01-S03b (dining table cont.)  → 380005
M01-S03c (Tess + mother close) → 380006
M01-S04  (sala, parol)         → 380007
M01-S05a (sala, grandmother)   → 400002
M01-S05b (hands close-up)      → 400003
M01-S05c (bracelet given)      → 400004
```

**Example — Act 2 Agency:**
```
M01-S18-Qa (porch, Henderson)  → 382001
M01-S18-Qb (POV wound)         → 382002
M01-S18-Qc (decision moment)   → 382003
M01-S18-Da (agency next day)   → 381001
M01-S18-Db (EHR screen)        → 381002
M01-S18-Dc (patient home doc)  → 382004
```

---

## Seed Locking Rules

1. **Once a seed produces an accepted composition, LOCK IT.** Record it in the scene CSV. Never randomize locked seeds.

2. **Never reuse a seed across different environments.** A kitchen seed should not be used for an agency scene — the latent pattern will fight the new composition.

3. **Increment by 1 within a sub-range.** Jumping randomly within a range wastes reproducibility.

4. **If a seed produces artifacts, skip it.** Move to the next integer. Mark the bad seed in the CSV `notes` column.

5. **Multi-character scenes: use the primary character's range.** If Tess and Aldrin are both in frame, use Tess's range (she's the protagonist). IPAdapter handles Aldrin's identity — the seed handles the room layout.

---

## Seed + PuLID Interaction

PuLID modifies the model weights to steer face identity. The seed controls the initial noise pattern. Their interaction is multiplicative:

- **Same seed + same PuLID ref** = very high consistency (layout + identity stable)
- **Different seed + same PuLID ref** = different composition, same face (this is the normal production mode)
- **Same seed + different PuLID ref** = same layout, different face (useful for swapping characters in identical framing)
- **Different seed + different PuLID ref** = different everything (avoid this for continuity)

### Practical Implication
When generating draft variants of the same scene, change the seed within the sub-range while keeping PuLID locked. This gives you compositional variety without identity drift.

---

## Batch CSV Seed Column

The `scene_batch_template.csv` has a `seed` column. Populate it from this strategy:

```csv
scene_id,seed,notes
M01-PA-INTRO,380001,prologue intro — Tess sala evening
M01-PA-Q1,382001,patient home — Quezon City
M01-PA-D1,381001,agency hallway — charge nurse
M01-S01,380002,bedroom — Tess packing
M01-S02,400001,kitchen — grandmother Mano Po
...
```

When running batch generation, the CSV seed is injected into the KSampler. If the seed column is empty, the batch runner should auto-assign the next available integer in the correct range based on the scene's primary character and environment.

---

## Anti-Patterns

| Do NOT | Why |
|--------|-----|
| Use one global seed for all scenes | Compositions will fight each other; environments will look wrong |
| Rely on seed alone for face consistency | Seeds control noise, not identity — PuLID controls identity |
| Randomize seeds without recording them | Unreproducible; you lose the ability to regenerate or refine |
| Skip seed logging in the CSV | The seed is part of the production manifest — you need it for QA and re-renders |
| Use seeds from one character range for another | Latent patterns are environment-tuned; cross-contamination degrades coherence |
