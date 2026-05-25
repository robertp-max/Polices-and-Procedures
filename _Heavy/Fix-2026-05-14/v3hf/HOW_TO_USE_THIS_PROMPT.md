# How to Use the V3HF Image Generation Prompt

## Goal
Generate 22 high-fidelity V3 Veil Glass versions of your provided screenshots with strong consistency and control.

## Recommended Process

1. Copy or move all 22 original screenshots into this `v3hf` folder (or keep them in your Pictures folder).

2. Open the file `V3HF_22_Image_Generation_Master_Prompt.md`.

3. Start a new conversation with Claude or Grok and paste the **entire content** of `V3HF_22_Image_Generation_Master_Prompt.md`.

4. Also upload / attach the following for context:
   - The two main V3 specs (Theme Tokens v1.1 + Behavior Spec v1.1)
   - The 4 approved visual references (if needed)
   - Your 22 screenshots

5. Use this format to request images one by one or in small batches:

```
Using the V3HF master prompt and all attached references:

Generate the high-fidelity V3 version for screenshot number 03.

Source file: Screenshot 2026-05-18 1936XX.png
```

6. The model will generate the image using all the strict constraints.

## Tips for Best Control

- Do **not** ask for all 22 at once. Generate 2–4 at a time so you can review consistency.
- After the first 3–4 images, you can say: "Continue using the same style and constraints for the rest of the batch."
- If something drifts, reply with: "Apply stronger constraint X from the master prompt" and re-generate.

## Output Naming

The prompt enforces consistent naming: `V3HF_XX_Description.jpg`

---

You now have a very constrained, high-control prompt for creating a cohesive set of 22 V3 high-fidelity images.