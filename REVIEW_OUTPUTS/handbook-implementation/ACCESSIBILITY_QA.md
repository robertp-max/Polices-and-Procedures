# Handbook — Accessibility QA

_Handbook plan §10. Status: **semantics built-in; full AT sweep pending**._

## Built in

- Draft status is conveyed in text + a dedicated `.sr-only` line ("Counsel-review
  draft. Not effective. Employee acknowledgment is disabled.") — not colour alone.
- Reader: search `<input type="search">` labelled; TOC is a labelled `<nav><ol>` with
  `aria-current` on the active section; progress bar is `aria-hidden` decorative.
- Content renders as **semantic HTML** (headings `<h3/h4>`, `<table>` with `<th>`,
  `<ul>/<ol>`, `<strong>`) — no raw markup shown as text.
- Right-rail cards use `<h2>` headings; reference chips are links or static spans.
- Release status: gates use text status pills (word, not colour-only); the BLOCKED
  banner has `role="status"`.
- Acknowledgment controls are `disabled` + `aria-disabled` while draft.
- Icons are `aria-hidden`; the brand image alt follows the decorative/identity rule.

## Not yet run

Keyboard-only walkthrough, NVDA/VoiceOver semantics pass, focus-visibility audit,
reduced-motion, and contrast checks across all handbook routes are pending. Console
was error-free on every route exercised.
