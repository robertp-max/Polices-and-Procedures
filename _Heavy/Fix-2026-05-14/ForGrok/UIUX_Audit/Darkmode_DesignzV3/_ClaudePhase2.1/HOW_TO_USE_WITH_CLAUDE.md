# How to Use This Package With Claude

## Recommended Way to Start Phase 2.1

1. **Create a new Claude conversation** (or Project).

2. **Upload / paste the entire contents** of this `_ClaudePhase2.1` folder.

3. Start with this exact message:

```
Read every file in this folder. 

Begin by reading:
- README.md
- Phase2.1_Claude_Foundation_Build_Prompt.md

Then tell me you have understood the full scope and the strict build order.

Once you confirm, we will start with Phase 2.1.1 — Token System.
```

4. Let Claude confirm it has read everything before allowing it to write any code.

---

## Tips for Best Results

- Keep all the spec files in the same conversation context.
- When asking for a component, always say: "Build this according to the contracts in `Phase2_Core_Primitives_Spec.md` and the latest tokens in `V3_Veil_Glass_Theme_Tokens_Spec.md` v1.1"
- Use the `Phase2.1_Build_Order_and_Deliverables.md` as your progress tracker.
- After each major primitive, ask Claude to do a self-review against the behavior and theme specs.

---

This package is complete and ready.

You can now hand this folder to Claude and begin the actual foundation build for V3 Veil Glass.