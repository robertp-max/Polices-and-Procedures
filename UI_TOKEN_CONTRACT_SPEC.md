# UI Token Contract Spec (Phase 1 Lock)

## Purpose

Define the canonical token contract and enforcement model for all target operational surfaces.

---

## 1. Single Source of Truth

Authoritative source:
- `tokens.json` (design-system canonical source)

Generated outputs:
- `tokens.css` (CSS custom properties)
- `tokens.ts` (web component usage)
- `tokens.native.ts` (if mobile native consumers exist)

No manual divergence between generated outputs and source contract.

---

## 2. Canonical Token Domains

- `color.*`
- `surface.*`
- `text.*`
- `border.*`
- `radius.*`
- `spacing.*`
- `shadow.*`
- `motion.duration.*`
- `motion.easing.*`
- `typography.family.*`
- `typography.size.*`
- `typography.lineHeight.*`
- `zIndex.*`

---

## 3. Naming Contract

CSS variable pattern:
- `--ci-{domain}-{subdomain}-{variant}-{state?}`

Examples:
- `--ci-color-brand-teal`
- `--ci-surface-level-1-dark`
- `--ci-spacing-card-md`
- `--ci-motion-duration-fast`

Rules:
- semantic naming required
- no direct literal references in component code
- no one-off token names per route

---

## 4. Token Usage Rules

Allowed:
- canonical token references in components, pages, shell primitives

Disallowed on target surfaces:
- raw hex values
- raw rgb/rgba values
- magic spacing numbers outside token map
- ad-hoc shadows/borders/motion values

Legacy exception process:
- explicit temporary waiver with owner + expiration date

---

## 5. Mode + Elevation Token Policy

- Light/dark mode uses explicit token branches, not ad-hoc conditional literals.
- Layer 0/1/2 behavior derives from surface/elevation tokens.
- Constrained page view contract must be validated with tokenized spacing + shell tokens.

---

## 6. Token Enforcement Gates

Required checks in CI for target surfaces:
1. raw-value lint (colors, spacing, shadows, timing)
2. token coverage check (required token families referenced)
3. regression check for token drift

PR checklist:
- token diff reviewed
- no new raw literals
- semantic status mapping preserved

---

## 7. Migration Policy

Phased migration order:
1. shell + shared primitives
2. Dashboard, Evidence, Audit, Calendar, My Tasks
3. onboarding/UAT surfaces

During migration:
- old literals may exist only outside active reconstruction scope
- no new literals may be introduced anywhere

---

## 8. Ownership

- Design System owner: token schema + semantic mapping
- Frontend Platform owner: generation pipeline + lint enforcement
- Feature teams: consumption only, no schema branching

---

## 9. Exit Criteria (Phase 1 Token Lock)

- canonical `tokens.json` approved
- generation pipeline defined
- lint policy defined and adopted
- target surface token-readiness checklist created
- exception workflow documented
