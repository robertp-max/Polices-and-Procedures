# Care Indeed · Home Health EHR — design prototype

A premium, CI-brand-faithful redesign of the Home Health EHR prototype.
**Synthetic data only — not approved for clinical use or PHI.**

## Run

```bash
npm install
npm run dev   # http://127.0.0.1:5194/
```

This directory is the canonical editable EHR app. It runs independently on
strict port 5194; the compiled app in `../ehr-prototype-static/` is a preserved
port-5191 fallback, not the Reception target or editable source.

## What's inside

- **Design system**: extracted from the 10-board *CI Design System* PDF —
  see [docs/CI-DESIGN-SYSTEM-SPEC.md](docs/CI-DESIGN-SYSTEM-SPEC.md). All tokens
  live in [src/styles/tokens.css](src/styles/tokens.css): orange `#C74601`
  primary, teal `#00797D` secondary, warm hue-21 neutrals, green/yellow/red
  sentiment (no blue anywhere), Montserrat medium headings, Roboto body,
  pill buttons, 8–32px radius scale.
- **Modes** (top bar): Business Plan · Requirements · MVP Policy · Prototype (the EHR).
- **EHR screens**: Today, Patients, Patient chart (8 tabs), Referral & intake
  pipeline, Schedule, Clinical documentation, Orders, Quality & compliance,
  Billing, Reports.
- **Brad clinical assist**: "Review, don't replace" — drafts and flags are
  always routed through clinician review; nothing files without a signature.

## Wizard-of-Oz MVP

Open `http://127.0.0.1:5194/#/mvp-policy` for the substitution policy and
handoff register. The EHR remains the clinical facade while existing Care
Indeed systems retain authority for their records:

- Signatures → eCign (`/forms/CL-FM-029/esign` on the Policy Suite)
- Forms → Forms Library (`/forms` on the Policy Suite)
- Messages → Connect (`http://127.0.0.1:5192/`)
- Vendor BAAs → Master Control `CTRL-042`

These are new-tab handoffs, not copied implementations. The owning rail keeps
its record, permissions, status, and audit evidence; the EHR may retain a
reference only after an accepted response exists.

## Structure

```
src/
  styles/     tokens.css (design tokens) · base.css (primitives)
  shell/      AppShell (teal sidebar, top bar, modes, ribbon)
  ui/         kit: StatCard, StatusChip, Tabs, ProgressRing, Drawer, Sparkline…
  components/ PatientBanner
  data/       synthetic clinical dataset (types, patients, clinical)
  screens/    one file per screen + scoped css
```

The app is intentionally dependency-light: React 19, react-router-dom 7,
lucide-react (Feather-style outline icons per the DS icon board).
