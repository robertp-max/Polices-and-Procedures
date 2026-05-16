# Empty State Patterns — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Philosophy

Empty states are not failures — they are **opportunities to guide the user**.

In a high-stakes compliance environment, a blank screen creates anxiety. Every empty state must:

- Clearly explain **why** the area is empty
- Tell the user what they can do next (even if the action is "wait for someone else")
- Use calm, professional, non-alarmist language
- Maintain the premium glass aesthetic

---

## 2. Three Types of Empty States

### Type A — First Use / Onboarding
**Example:** New clinician has no assigned tasks yet.

- Friendly illustration or icon
- Clear headline ("You’re all set for now")
- One primary action ("Browse Available Training" or "View Your Schedule")
- Helpful secondary text

### Type B — No Results from Filter / Search
**Example:** CES board filtered to "Overdue" with nothing showing.

- Simple icon (magnifying glass or filter)
- "No results match your filters"
- Clear "Clear Filters" button (primary action)
- Optional "Adjust your search" helper text

### Type C — System / Workflow State
**Example:** No evidence uploaded for a specific requirement yet, or no signatures on a policy.

- More serious but still calm tone
- Explain the compliance implication briefly ("This requirement is not yet satisfied")
- Strongest possible next action ("Upload Evidence" or "Request Signature")

---

## 3. Visual Treatment (v2 Glass System)

- Use **Layer 1** glass surface
- Centered content with generous whitespace (never cramped)
- One large, meaningful icon (never tiny)
- Headline in `--color-text-primary`
- Body text in `--color-text-muted`
- Primary action button (usually Teal or Orange depending on urgency)
- Never use hard black borders — soft hairline only in light mode

**Recommended layout:**
```
[ Large calm icon ]
[ Clear headline ]
[ Helpful explanation (2–3 lines max) ]
[ Primary action button ]
[ Optional secondary link ]
```

---

## 4. Tone & Microcopy Rules

**Good:**
- "No tasks due today — you’re ahead of schedule."
- "This policy has not received any signatures yet."
- "No evidence has been captured for this requirement."

**Bad:**
- "Nothing here."
- "Empty."
- "No data." (too cold)
- "Error loading content." (when it’s not an error)

---

## 5. Component Ownership

- Prefer the **canonical `ui/EmptyState`** component.
- Do **not** create local empty states inside CES cards, PolicyDetail, EvidenceCenter, or OnboardingV2 unless absolutely necessary.
- All new empty states must go through design systems review.

---

## 6. Special Cases

### Evidence Center
- Distinguish between "No evidence ever uploaded" vs "No evidence for this specific requirement".
- Offer "Capture Evidence" as the primary action when appropriate.

### CES Board
- When a clinician has zero active tasks: "You have no active tasks. Great job staying on top of things."
- When filtered to zero: "No tasks match the current filters."

### Onboarding V2
- When a batch has no units yet: "This batch has no units assigned. Add units to begin the activation process."

---

## 7. Do’s and Don’ts

**✅ Do**
- Always provide a clear next step
- Use illustrations sparingly and only when they add warmth (never clipart)
- Keep copy short and scannable
- Respect `prefers-reduced-motion`

**❌ Don’t**
- Use alarming language ("Failed", "Missing", "Error") for normal empty states
- Leave the user with no action
- Use tiny icons or cramped layouts
- Show different empty states for the same situation across mobile and desktop

---

*An empty state should reduce anxiety, not create it.*

---

**Next:** Create illustrated empty state library for the Figma kit.