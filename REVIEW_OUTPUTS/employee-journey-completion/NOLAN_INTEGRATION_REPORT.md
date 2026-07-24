# Nolan Integration Report

_Master Correction Prompt §15. Source: `apps/employee-journey/app/journey/_components/NolanAssistant.tsx`. Status: **IMPLEMENTED / VERIFIED**._

## What changed

The generic "Need help?" treatment is replaced by **Nolan** — a floating "Ask Nolan"
launcher + chat panel mirroring the main app's Nolan visual (teal `#007970` / orange
`#F06923`, Montserrat/Roboto). It is mounted in `EmployeePortalShell`, so it is reachable
from **every portal route**, plus via the shared `nolan:open` window event (fired by the
sidebar "Ask Nolan" button and the Support page).

## Backend (no new backend created)

Nolan POSTs to the **existing** main-app endpoint: `POST {mainAppOrigin}/api/nolan/tutor/ask`,
where `mainAppOrigin` comes from `getMainAppOrigin()` (env-aware; never a hard-coded prod
localhost). Request body: `{ question, context }`. Response: `{ text }`.

> Note: `GET /api/nolan/tutor/health` does not exist in the main-app source, and §3 forbids
> modifying Nolan server routes, so no health probe is added — availability is inferred from
> the `/ask` response and the client degrades gracefully.

## Safe context (no PHI)

Nolan receives only: `surface`, `role`, `roleCode`, `journeyStage`, `currentPath`, and the
current `courseId` / `policyId` / `appendixKey` / `formId` parsed from the route. No patient
data, no PHI.

## Guardrails

Intro copy states Nolan explains assignments, due dates, quiz/attempt rules, and supervised-
visit prep — and explicitly does **not** answer quiz questions, submit work, mark completion,
grant competency/clearance, or handle patient information. Nolan is not wired into any quiz
submission or completion flow.

## Graceful degradation (verified live)

When the origin is unconfigured or the endpoint is unreachable/404/503, Nolan shows an honest
"Nolan is temporarily unavailable…" message **plus support alternatives** (supervisor /
clinical educator / People Team) — never a raw 404 or a crash. Verified live: the panel opens
with 4 suggestions; a failed `/ask` renders the unavailable message + alternatives.
