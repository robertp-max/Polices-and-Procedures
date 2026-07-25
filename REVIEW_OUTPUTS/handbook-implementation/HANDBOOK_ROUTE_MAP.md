# Handbook Route Map

_Handbook plan §5. All routes are native Next.js App Router pages under
`apps/employee-journey/app/journey/(portal)/handbook/`, same-tab, wrapped in the
Employee Journey portal shell. Status: **IMPLEMENTED / VERIFIED (HTTP 200 + live render)**._

| Route | Page → component | Purpose | Audience |
|---|---|---|---|
| `/journey/handbook` | `page.tsx` → `HandbookHome` | Overview: draft banner, document-control card, quicklinks, disabled-acknowledgment notice, lifecycle map, full contents | All |
| `/journey/handbook/contents` | `contents/page.tsx` → `HandbookHome` | Full 48-section contents | All |
| `/journey/handbook/section/[sectionId]` | `section/[sectionId]/page.tsx` → `HandbookReader` | Native section reader (3-rail); `notFound()` on unknown id | All |
| `/journey/handbook/references` | `references/page.tsx` → `HandbookReferences` | Policy (104) / form (52) / authority (25) index, same-tab links | All |
| `/journey/handbook/release-status` | `release-status/page.tsx` → `HandbookReleaseStatus` | 21 gates + 8 approvals; BLOCKED banner | Reviewers |
| `/journey/handbook/acknowledgment` | `acknowledgment/page.tsx` → `HandbookAcknowledgment` | Attestation spec — DISABLED while draft | All (locked) |
| `/journey/handbook/history` | `history/page.tsx` → `HandbookHistory` | Current draft + retired-2022 tombstone | All |

Nav: a "Handbook" item was added to the portal sidebar (`EmployeePortalShell`).
Reader launch targets for policy/form references resolve same-tab to the main app
(`/library/<POLICY_ID>`, `/forms/<FORM_ID>`) via the env-aware `getMainAppOrigin()`
resolver (dev fallback; fails closed in production — never a hard-coded localhost).

Verified live (persona taylor-rn): `/handbook`, `/handbook/section/contacts`,
`/handbook/release-status`, `/handbook/references` → HTTP 200, render correctly,
console had no errors.
