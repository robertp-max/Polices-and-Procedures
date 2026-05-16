# Glass Layering Cheat Sheet — CareIndeed Home Health (v2)

**One-page reference for the entire team**

---

## The 3-Layer System (Hard Limit)

| Layer | Name                    | What it is                          | Typical Use                          | Elevation Treatment |
|-------|-------------------------|-------------------------------------|--------------------------------------|---------------------|
| **0** | Atmospheric Background  | Deepest dark background             | Page background                      | Subtle texture/gradient |
| **1** | Main App Surface        | Primary working area                | Most page content, lists, dashboards | Frosted glass, base level |
| **2** | Elevated Surface        | Cards, dialogs, focused areas       | Task cards, forms, modals, bottom sheets | Stronger shadow + more opacity |
| **3** | Exception Only          | Rare functional necessity           | Critical floating menus, complex confirmations | Maximum elevation |

**Layer 3 is not for decoration.** It is only used when it directly enables a function that cannot be solved with Layer 2.

---

## Golden Rules

- **Never exceed 3 layers.**
- On **desktop**, the main Layer 1 surface **must not** take up the full screen width.
  - Use a constrained `max-width` container + visible side margins.
  - This exposes Layer 0 around the main glass panel and dramatically improves the premium glassmorphic feeling.
- In **light mode**, rely on layered shadows + subtle hairline borders rather than heavy transparency.
- Do not stack glass endlessly (e.g., glass card inside glass card inside glass panel).

---

## Desktop Container Rule (Enhances Glassmorphism)

**On desktop (≥1024px):**

The main Layer 1 working surface **must have breathing room**.

- Apply `max-width` (1280px–1600px recommended) + side margins/padding.
- Let the rich dark **Layer 0** background show on the left, right, top, and bottom of the main content area.

**This is mandatory** for v2 desktop experiences. Full-bleed main surfaces kill the expensive glass depth.

Reference example: Current desktop Policy Library view — the main card grid is nicely contained with dark atmospheric background visible around it.

---

**Print this page. Follow it on every screen.**