# Accessibility QA

_Master Correction Prompt §18.9. Status: **PARTIAL** — semantics built in; full AT sweep not yet executed._

## Built in this pass

- Annual summary strip has `role="status"` + `aria-label`; section nav is a labelled `<nav>`.
- Nolan: launcher and panel have `aria-label`s; panel is `role="dialog"`; input and send
  button are labelled; error state is text (not colour-only) with a support-alternatives line.
- Sidebar "Ask Nolan" is a real `<button>` (keyboard-operable) with visible focus via existing
  shell styles; decorative icons are `aria-hidden`.
- Policy clauses/tables use semantic elements (`<ol>`, `<table>`, `<th>`).

## Not yet executed

Keyboard-only walkthrough, screen-reader semantics pass (NVDA/VoiceOver), reduced-motion, and
contrast audit across all routes are pending. Console was clean on verified routes.
