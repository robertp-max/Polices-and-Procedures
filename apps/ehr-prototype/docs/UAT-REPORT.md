# EHR prototype — build & UAT report

Date: 2026-08-03 · Branch `EHR_Prototype` · App `apps/ehr-prototype` · Dev server port **5194**

## Scope

Rebuild of the Care Indeed Home Health EHR prototype as a premium, professional
healthcare application, rebranded to the *CI Design System* (10-board PDF).
The user's direction was an explicit redesign — not a pixel copy of the previous
prototype.

## Provenance of the source material

| Input | Finding |
|---|---|
| `CI Design System.pdf` | 206 "pages" is really **10 tall boards**; all text is vector outline, so no text layer exists. Extracted by rendering at 1.6× and slicing into 40 overlapping tiles, then transcribing each visually. Consolidated spec: [CI-DESIGN-SYSTEM-SPEC.md](CI-DESIGN-SYSTEM-SPEC.md). |
| Prototype at `127.0.0.1:5191` | This specific artifact is a compiled static build (vinext/Codex family) served from `%TEMP%\care-indeed-ehr-prototype-local`; it contains no editable source. It remains preserved as a fallback alongside the separate source app now under `apps/ehr-prototype`. |
| `Care_Indeed_EHR_Business_Plan_Complete_App_*.zip` | The canonical Business Plan (v2.2, 2026-07-29) and Requirements addendum (v1.1) documents, shipped as static HTML inside the app's `public/`. These are the content authority for the two document pageviews. |

## Design tokens applied

From the design system boards, not invented:

- Primary orange `#C74601`; hover/pressed ladder `#421700` / `#FFD5BF`
- Secondary teal `#00797D`; ramp `#004142` → `#F7FEFF`
- Warm neutrals, all hue 21: `#1F1C1B` headings, `#524D4B` body, `#7A7470` secondary
- Sentiment green/yellow/red only — **the brand defines no blue**, and none is used
- Montserrat medium headings, Roboto body; pill buttons; radius scale 8/12/16/24/32

The 300-step sentiment colors are used only for icons and borders, never as text,
per the board's accessibility rule.

### Data-visualization palette

Validated with the dataviz six-checks validator rather than by eye. The
categorical pair in use is `#06A6AB` + `#E56E2E` (all checks pass; the teal
carries a contrast WARN, so **every chart direct-labels its marks**). More than
two series folds into a gray "Other" or facets — no cycled hues.

## Architecture

```
apps/ehr-prototype/
  src/styles/     tokens.css · base.css
  src/shell/      AppShell (clinical shell) · DocShell (standalone document pageview) · CommandPalette
  src/ui/         StatCard StatusChip Tabs ProgressBar ProgressRing Drawer Sparkline EmptyState
  src/components/ PatientBanner
  src/data/       types · patients · clinical (all synthetic)
  src/screens/    12 screens, each with a scoped prefixed stylesheet
```

**Two shells by design.** The EHR runs in `AppShell` (teal sidebar, clinical
chrome). *Business Plan* and *Requirements* render in `DocShell` — their own
standalone pageviews with a light CI-lockup header, the mode switcher, and a
"Back to the EHR" action, with **no clinical sidebar**.

## Verification performed

| Check | Result |
|---|---|
| `npx tsc --noEmit -p .` | **Pass** — zero errors |
| `npm run build` | **Pass** — Vite 6.4.3 production build, 1,633 modules transformed |
| Vite transform, all 12 screens | **200** each |
| Route render sweep (13 routes) | All render substantive content; no blank screens |
| Patient chart tabs (8) | All 8 render real content for Elena; non-flagship patient (Walter Feld) renders his own data |
| Unknown patient `/patients/nope` | Correctly shows "Patient not found" empty state |
| Brand fonts | Montserrat + Roboto both confirmed loaded |
| Console errors after clean reload | None current |
| Horizontal page overflow @1440 and @1024 | None on any screen |
| Truncation audit | Only secondary descriptive text (diagnosis labels, which carry tooltips); no clipped primary identifiers |

### Defects found and fixed during UAT

1. **All CSS returned HTTP 500.** Vite walked up and loaded the parent repo's
   tailwind PostCSS config, which isn't installed in this sub-app. Fixed with a
   local empty `postcss.config.js`. Note: Vite caches that resolution — the dev
   server must be restarted after changing it.
2. **Visits sorted incorrectly.** Times were compared as strings, so `9:00 AM`
   sorted after `11:00 AM`. Replaced with a 12-hour time parser.
3. **"QAPI" step label clipped** under the walkthrough button on the vertical
   slice stepper. Fixed the flex basis so the row wraps instead of clipping.
4. **Referral names truncated** ("Frank More…") on the intake board. Patient
   names are the card's identifier — they now wrap instead of ellipsing.

## Clinical-safety posture

This is a design prototype on synthetic data, and the UI says so in three
places: the sidebar environment card, a persistent ribbon, and the document
pageview header. No control fabricates a completed clinical or legal action —
buttons that would file, sign, or submit are visual only or open a review
drawer. The Brad assist panel is framed throughout as *"Review, don't
replace"*: it drafts and cites sources, and nothing files without a clinician.

## Later passes (after the initial build)

### Content rebuild from the canonical documents

The Business Plan and Requirements screens were first built from invented
content. They were rebuilt from the authoritative source the user supplied —
`Care_Indeed_EHR_Business_Plan_Complete_App_*.zip`, whose `public/` ships the
real documents as static HTML. (The live site loads the plan in an **iframe**,
which is why fetching the page URL returns only navigation — read the zip.)

| Screen | Source | Result |
|---|---|---|
| Business Plan | `Care_Indeed_Home_Health_Owned_EHR_Business_Plan.html` — Board business plan v2.2, 2026-07-29 | 22 chapters, sticky TOC. Five-year financial cells left empty **exactly as the source ships them** — the source says they are intentionally blank so the board sees evidence rather than invented savings. |
| Requirements | `Care_Indeed_Home_Health_EHR_Complete_Requirements.html` — Requirements addendum v1.1 | 18-workspace project-management tool: `CI-EHR-SRS-PM-001`, epics, stories, backlog, sprint board, register (42 verbatim shall-statements sampled from 170, labelled as a sample). |

Both keep the rule the user set twice: **content from the source, design from
our system**. Nothing visual was copied from the source documents.

### Styling pass

- Canvas moved from warm orange to light teal; all card containers are pure
  white, with inner panels separated by hairlines rather than a fill.
- The DS light neutrals are all hue 21 — the same hue as the brand orange — so
  they read as an orange cast against a teal canvas. The three light steps were
  re-struck cool and the shadows (previously tinted brown) cooled to match.
  Verified by scanning every rendered element's computed background: the only
  warm surfaces remaining are semantic status chips and brand accent tiles.
- The Requirements nav became a true full-height side nav bar flush to the
  viewport edge (square, no shadow), with the gate status pinned at its top and
  its scrollbar hidden.

## Deferred — pick up here next session

Verification not yet performed, in rough priority order:

1. **Keyboard and screen-reader pass.** Tab order through the app shell,
   command palette, patient chart tabs, and the Requirements side nav; visible
   focus on every interactive element; `aria-current` on nav items; drawer
   focus trapping and restore-on-close.
2. **Requirements workspace deep UAT.** Only workspace switching and content
   distinctness were checked. Each of the 18 views still needs its filters,
   search, drawers, and empty states exercised.
3. **Business Plan chapter-by-chapter proofread** against the extract at
   `scratchpad/bp-extract/business-plan.txt` — spot checks passed, but all 22
   chapters have not been read line by line.
4. **Mobile (<900px).** Usable but untuned; the DS mobile radius and type
   scales are documented in the spec and not yet applied.
5. **Cross-browser.** Verified in the in-app Chromium preview only. Note
   `req.css` uses `:has()` for the full-bleed layout.
6. **Contrast audit.** The palette was validated for charts; body and chip text
   pairings have not been run through a WCAG checker.

## Known limitations

- Synthetic dataset is Elena-centric: `integrityChecks`, `elenaTimeline`,
  `assessments`, and `documents` are single-patient, so other patients fall back
  to simplified summaries or empty states on those tabs.
- Mobile (<900px) is usable but not tuned; the design system's mobile radius and
  type scales are documented in the spec but not yet applied.
- No persistence, auth, or backend — all interaction is client-side state.
- `npm audit` reports the React Router RSC-mode CSRF advisory
  `GHSA-qwww-vcr4-c8h2` against the latest published release (`7.18.2`). This
  client-only prototype does not use RSC actions, and no patched npm release is
  currently available; recheck before a production deployment.
