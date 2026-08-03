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
| Prototype at `127.0.0.1:5191` | **No source exists on this machine.** It is a compiled static build (vinext/Codex family) served by `python -m http.server` from `%TEMP%\care-indeed-ehr-prototype-local`. A copy was preserved to the session scratchpad because `%TEMP%` can be cleaned at any time. `launch.json`'s `gbp-web`→5191 mapping is a red herring. |
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

## Known limitations

- Synthetic dataset is Elena-centric: `integrityChecks`, `elenaTimeline`,
  `assessments`, and `documents` are single-patient, so other patients fall back
  to simplified summaries or empty states on those tabs.
- Mobile (<900px) is usable but not tuned; the design system's mobile radius and
  type scales are documented in the spec but not yet applied.
- No persistence, auth, or backend — all interaction is client-side state.
