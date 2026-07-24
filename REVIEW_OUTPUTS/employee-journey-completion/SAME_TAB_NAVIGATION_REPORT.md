# Same-Tab Navigation Report

_Master Correction Prompt §16. Status: **VERIFIED / IMPLEMENTED**._

## Findings (journey app)

Static analysis of `apps/employee-journey/app/journey/**` confirms **no** `target="_blank"`,
`window.open`, or `newWindow` in app source (the only string hits are inside a prompt doc).
- Cross-app launches (`MainAppLink`) render a plain `<a href>` (same-tab), or a disabled state
  when `NEXT_PUBLIC_MAIN_APP_URL` is unresolved.
- In-app navigation uses Next `<Link>` with `withPersona(...)`.
- `rel="noopener noreferrer"` appears only on external authority reference links, not on
  module/form launches.

## Env-aware URLs (no prod localhost)

- Journey → main app: `getMainAppOrigin()` (`NEXT_PUBLIC_MAIN_APP_URL`; dev fallback only;
  fails closed in production, never a hard-coded localhost).
- Main app → Training Academy: `trainingAcademyUrl()` (`VITE_TRAINING_ACADEMY_URL`; dev
  fallback; prod-unconfigured falls back to in-app `/journey`, never localhost).

## Nav dedup (this pass)

The main-app primary nav had two learner-facing training entries. **"Training Academy"** is
now the single learner destination; the legacy in-app **"Training"** (`onboarding`) is hidden
from the nav bar (added to `chromeOnlyPrimaryNavItemIds`, removed from the V6Shell dock order).
Its route still resolves by direct URL for module-player launches. Governance and Training
Academy both open same-tab.
