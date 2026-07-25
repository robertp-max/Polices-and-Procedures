# Care Indeed 2026 Employee Handbook — HTML QA

**Artifact tested:** `Care_Indeed_Employee_Field_Workforce_Handbook_2026_Counsel_Review_Draft.html`  
**QA date:** 2026-07-24  
**Scope:** HTML structure, responsive rendering, interaction, and source integrity. Legal approval is outside this QA.

## Structural validation

- **48** handbook sections detected.
- **104** unique internal policy references detected.
- **52** unique internal form/record references detected.
- **25** official external source notes detected.
- All HTML IDs are unique.
- No unresolved `Title requires verification` reference labels remain.
- One H1 and a consistent section-heading structure are present.
- Tables use header cells and responsive overflow containers.

## Responsive rendering

Rendered successfully in Chromium at:

- 1440 × 1000 desktop
- 390 × 844 mobile

The desktop layout shows the fixed searchable table of contents, controlled-document hero, and Employee Journey visual language. The mobile layout collapses the contents into an accessible bottom control while retaining readable typography and full-width content.

Preview files:

- `PREVIEW_desktop.png`
- `PREVIEW_mobile.png`

## Interaction tests

Passed:

- handbook search and filtered results;
- no-results state;
- expand all policy/form references;
- collapse all policy/form references;
- active table-of-contents state;
- mobile contents drawer;
- Escape-to-close for the mobile contents drawer;
- reading-progress indicator;
- print / Save PDF action;
- no JavaScript console errors at tested desktop or mobile widths.

## Accessibility foundations

Present:

- skip link;
- labeled search field;
- semantic navigation landmarks;
- visible focus-compatible controls;
- `aria-current` for the active section;
- mobile-menu `aria-controls` and `aria-expanded` state;
- Escape close and focus return for the mobile menu;
- text status in addition to color;
- no required external font or image dependency;
- print watermark identifying the document as a counsel-review draft.

## Remaining release gates

This QA does **not** convert the document into an effective handbook. Release remains blocked by `HANDBOOK_RELEASE_CHECKLIST.md`, including counsel review, employer/location facts, wage-order mapping, benefit plan reconciliation, current contacts, local-law overlays, policy reapproval, translations, and formal approval evidence.
