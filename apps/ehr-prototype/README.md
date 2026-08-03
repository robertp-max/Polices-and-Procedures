# Care Indeed · Home Health EHR — design prototype

A premium, CI-brand-faithful redesign of the Home Health EHR prototype.
**Synthetic data only — not approved for clinical use or PHI.**

## Run

```bash
npm install
npm run dev   # http://localhost:5194
```

Or from the repo root via the Claude launch config `ehr-prototype` (port 5194).

## What's inside

- **Design system**: extracted from the 10-board *CI Design System* PDF —
  see [docs/CI-DESIGN-SYSTEM-SPEC.md](docs/CI-DESIGN-SYSTEM-SPEC.md). All tokens
  live in [src/styles/tokens.css](src/styles/tokens.css): orange `#C74601`
  primary, teal `#00797D` secondary, warm hue-21 neutrals, green/yellow/red
  sentiment (no blue anywhere), Montserrat medium headings, Roboto body,
  pill buttons, 8–32px radius scale.
- **Modes** (top bar): Business Plan · Requirements · Prototype (the EHR).
- **EHR screens**: Today, Patients, Patient chart (8 tabs), Referral & intake
  pipeline, Schedule, Clinical documentation, Orders, Quality & compliance,
  Billing, Reports.
- **Brad clinical assist**: "Review, don't replace" — drafts and flags are
  always routed through clinician review; nothing files without a signature.

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
