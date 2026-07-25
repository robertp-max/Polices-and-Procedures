# Canonical Care Indeed Logo Audit — Employee Journey App

Scope: `apps/employee-journey` (Next.js App Router app), worktree
`Policies_and_Procedures_V2_worktrees/GOVERNING_BODY_PORTAL`.

This audit is read-only. It establishes ONE approved Care Indeed logo
asset, catalogs every current usage / brand-mark approximation found in
the app, and defines the rendering rules now enforced by a shared
component and an automated scanner.

## 1. Canonical asset

| Property | Value |
|---|---|
| Path | `apps/employee-journey/public/assets/logo-careindeed-orange.png` |
| SHA-256 | `d3286ff3d440da235566f66fed2a43a9f355fff7ca29a859a4044b9970549569` |
| Dimensions | 768 x 768 px |
| Format | PNG, 8-bit/color RGBA, non-interlaced |
| Served at | `/assets/logo-careindeed-orange.png` |

This is the **only** logo asset present in `apps/employee-journey/public/assets/`
(the directory also contains unrelated GAO-001 scene art:
`gao001-home-visit.{avif,png,webp}`, and there is no separate `navigation/`
asset subfolder or remote/CDN logo URL anywhere in the app). It is
therefore adopted as the single canonical Care Indeed brand asset for
this app.

## 2. Usages found

All occurrences of `logo`, `Care Indeed` wordmark text near a graphical
mark, inline `<svg>` brand marks, and remote logo URLs were searched
across `apps/employee-journey/app/**`.

| # | File | Line(s) | Treatment | Status |
|---|---|---|---|---|
| 1 | `app/journey/_components/EmployeePortalShell.tsx` | 58 | Desktop sidebar `<img src="/assets/logo-careindeed-orange.png" alt="Care Indeed">` inside a `<Link>` labelled "Care Indeed Employee Journey home" | Correct asset/path already. **Needs swap** to `<CareIndeedBrand />` (not touched by this change — main dev owns this file per task scope). |
| 2 | `app/journey/_components/EmployeePortalShell.tsx` | 95 | Mobile header `<img src="/assets/logo-careindeed-orange.png" alt="Care Indeed">` inside a `<Link>` labelled "Care Indeed Employee Journey home" | Correct asset/path already. **Needs swap** (same file, out of scope here). |
| 3 | `app/gao001/components/GAO001Scene01WelcomeDesk.tsx` | 199, 234 | `CARE_INDEED_LOGO` constant = canonical path; rendered as the badge-mockup logo, `alt="Care Indeed"` | Correct asset/path already. **Candidate for swap** to `<CareIndeedBrand compact />` in a future pass. |
| 4 | `app/gao001/components/GAO001Scene01WelcomeDesk.tsx` | 263 | Same `CARE_INDEED_LOGO` constant used as a placeholder watermark inside the empty photo-capture area, `alt=""` (decorative, adjacent copy doesn't name Care Indeed but image is a filler graphic, not identity-bearing) | Correct asset/path already. **Candidate for swap** to `<CareIndeedBrand decorative />`. |
| 5 | `app/gao001/components/GAO001Scene01WelcomeDesk.tsx` | 437, 519–520 | UI copy/handler lets the learner set their badge preview photo to "the Care Indeed logo" (`setPhoto(CARE_INDEED_LOGO)`) | Uses the canonical constant/path already; this is a scene-interaction affordance, not a header/brand placement. No change needed beyond what happens automatically via the shared constant if a future pass refactors `CARE_INDEED_LOGO` to import from `CareIndeedBrand`'s asset path. |
| 6 | `app/gao001/components/GAO001Scene01WelcomeDesk.tsx` | 281 | Small pill reading `"Care Indeed"` as **plain text**, no graphical mark, styled as a colored label inside a mock ID badge | Text-only, not a logo image or inline SVG mark — no swap needed. Flagged here for completeness since it sits directly beside badge/brand chrome. |
| 7 | `app/gao001/components/GAO001Scene01WelcomeDesk.tsx` | 1203 | `"CARE INDEED"` rendered as **plain text** (uppercase, bold, teal) at the top of a zoomed badge-mockup modal, standing in for a mini wordmark inside the illustration | Text-only CSS/typography approximation of a wordmark, not an image or SVG logo mark. Cosmetic illustration detail inside a scene mockup, not the site's brand-identity placement — left as-is; scanner does not (and should not) flag plain text. |
| 8 | `app/journey/(player)/training/gao-001/Gao001Preview.tsx` | 20 | `<img src="/assets/logo-careindeed-orange.png" alt="Care Indeed">` | Correct asset/path already. **Candidate for swap** to `<CareIndeedBrand />`. |
| 9 | `app/layout.tsx` | 11–12 | `icon: "/favicon.svg"`, `shortcut: "/favicon.svg"` (Next.js metadata favicon) | Separate asset class (browser-tab favicon, not an in-page brand mark) — out of scope for this audit/component; not a duplicate logo. |

### Other patterns checked, none found

- **Remote/CDN logo URLs** (`http(s)://...logo...`): none found anywhere
  under `app/`.
- **`/assets/navigation/` logo assets**: no such directory exists in
  `public/`.
- **Inline `<svg>` used as a brand mark**: the only inline `<svg>` blocks
  in the app are a loading spinner (`GAO001SharedOverlay.tsx:559`) and a
  scene-illustration background (`GAO001Scene01WelcomeDesk.tsx:915`) —
  neither contains a Care Indeed wordmark or is used as a logo/brand
  placement.
- **CSS-drawn logo approximations**: none found. `app/styles/appendix-forms.css`
  references "Care Indeed controlled-document look" only as a comment
  describing a teal/orange color scheme, not a drawn logo shape.
- **Plain-text "Care Indeed" mentions** (narration copy, form titles,
  metadata descriptions) are extremely common throughout
  `app/gao001/data/**`, `app/journey/_generated/**`, and `app/layout.tsx`
  — these are copy/content, not logo usages, and are out of scope.

## 3. Summary: correct vs needs-swap

- **Already using the canonical asset/path** (all 6 image usages found):
  `EmployeePortalShell.tsx` (x2), `GAO001Scene01WelcomeDesk.tsx` (x2 image
  renders, via the `CARE_INDEED_LOGO` constant), `Gao001Preview.tsx` (x1).
  No unapproved/duplicate/remote logo asset exists anywhere in the app
  today.
- **Needs swap to `<CareIndeedBrand />`**: all of the above, so that
  future logo changes only ever touch one component. Per task scope,
  this pass does **not** edit `EmployeePortalShell.tsx` or any other
  consumer — the main developer owns those swaps to avoid merge
  conflicts.
- **No swap needed**: the two plain-text "CARE INDEED" / "Care Indeed"
  labels (lines 281, 1203 of `GAO001Scene01WelcomeDesk.tsx`) are
  typography, not logo images/marks, and `app/layout.tsx`'s favicon
  (different asset class).

## 4. New guardrails introduced by this change

1. **`app/journey/_components/CareIndeedBrand.tsx`** — the single
   approved brand component. Renders the canonical bundled asset only
   (`/assets/logo-careindeed-orange.png`), never a remote URL. Supports:
   - `variant`: `"wordmark" | "mark"` (both currently map to the one
     bundled file; the prop exists so a future dedicated mark-only asset
     can be introduced without a call-site rewrite).
   - `theme`: `"light" | "dark" | "print"`.
   - `compact`: smaller fixed height for tight layouts.
   - `decorative`: sets `alt=""` when adjacent copy already names Care
     Indeed; otherwise defaults to `alt="Care Indeed"`.
   - Aspect ratio is always preserved (`height` set explicitly, `width:
     auto`, `object-fit: contain`) — the mark is never stretched.
   - No baked-in drop-shadow or border.

2. **`scripts/verifyBrandLogo.ts`** — a dependency-free `tsx`-runnable
   scanner that recursively walks `apps/employee-journey/app/` and fails
   (`process.exit(1)`) if it finds:
   - any `src="..."` / `url(...)` reference matching `/logo/i` that is
     not the canonical `/assets/logo-careindeed-orange.png` path, or
   - any inline `<svg>...</svg>` block whose contents match a
     "Care Indeed" text pattern (a hand-drawn wordmark/brand mark).
   `CareIndeedBrand.tsx` itself and the canonical asset path are
   allowlisted. Verified to run clean (PASS, 0 findings) against the
   current app tree — confirming no unapproved logo references exist
   today.

## 5. Files touched by this change

Only the following three files were created/edited, per task scope:

1. `apps/employee-journey/app/journey/_components/CareIndeedBrand.tsx` (new)
2. `apps/employee-journey/scripts/verifyBrandLogo.ts` (new)
3. `REVIEW_OUTPUTS/handbook-implementation/CANONICAL_LOGO_AUDIT.md` (new, this file)

No existing consumer (`EmployeePortalShell.tsx`, `GAO001Scene01WelcomeDesk.tsx`,
`Gao001Preview.tsx`, etc.) was modified. No `git` commands were run.
