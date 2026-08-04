# Nav redesign brief (Legal Evidence quality bar)

## Goal
Bring every sidebar nav item to the **Legal Evidence** quality bar:
master–detail (or rich list + inspector), filters, synthetic honesty, disabled
legal/clinical actions, and **cross-links** so screens talk to each other.

## Gold standard
- `src/screens/LegalEvidenceScreen.tsx` + `leg.css`
- Shared data: `src/data/workspace.ts`
- Cross-nav strip: `<RelatedNav route="/your-route" />` from `src/components/RelatedNav.tsx`

## Non-negotiables (AGENTS.md)
- Tokens only (`var(--…)`), no blue, no raw hex
- One CSS file per screen, registered prefix in `scripts/verify-design.mjs` if new
- `import type` for type-only imports
- Buttons never silently seal/sign/submit — visual only or review drawer
- All data synthetic; keep prototype banner
- `npm run verify` must pass from `apps/ehr-prototype`

## Required screen anatomy
1. `screen-head` + kicker `Domain XXX · …` + primary CTA + secondary link
2. Synthetic banner (`FlaskConical`)
3. 3–4 `StatCard`s from real counts in data
4. `<RelatedNav route="…" />`
5. Main card: search + status filters + rich rows (not a bare 3-row table)
6. Sticky inspector OR drawer with tabs / detail sections
7. Deep links to patients (`/patients/:id`), work queue, legal evidence, etc. via `workspace.ts`
8. Footnote honesty on any write-like control

## Rails removed
Messages, Documents, Forms, Vendors are **in-app built routes** — do not reintroduce
`status: 'substitute'` or external `integrationId` for those four.

## File ownership
Only edit files assigned to your wave. Do not rewrite LegalEvidenceScreen.
Do not run destructive git commands. Commit only if the orchestrator asks.

## Verify
```bash
cd apps/ehr-prototype && npm run verify
```
