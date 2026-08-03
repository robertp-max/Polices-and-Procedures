# W1-A05 — Reception QA (static)

## Agent ID

W1-A05

## Role

Reception QA — verify only; do not implement merges.

## Checks

| # | Check | Result |
|---|--------|--------|
| 1 | `router.tsx` index `Navigate` to `"/reception"` | PASS |
| 2 | `safeRedirect` `BRAD_DEFAULT_ROUTE = '/reception'` | PASS |
| 3 | `routeRegistry` has `/reception`, `/find-home-care`, `/ehr-prototype` | PASS |
| 4 | `ReceptionScreen` WORKSPACES: Find Home Care and EHR Prototype separate; EHR route exactly `http://127.0.0.1:5191` | PASS |
| 5 | `RepresentativeScreens` cases for `reception`, `find-home-care`, `ehr-prototype` | PASS |
| 6 | `V6Shell` chrome-free for `/reception` | PASS |

## Commands

None (static file verification only).

Evidence gathered via repository search and line-level reads of:

- `src/v6/routing/router.tsx`
- `src/v6/utils/safeRedirect.ts`
- `src/v6/routing/routeRegistry.ts`
- `src/v6/screens/pageviews/ReceptionScreen.tsx`
- `src/v6/screens/RepresentativeScreens.tsx`
- `src/v6/shell/V6Shell.tsx`

## Files

| File | Absolute path |
|------|----------------|
| router | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\src\v6\routing\router.tsx` |
| safeRedirect | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\src\v6\utils\safeRedirect.ts` |
| routeRegistry | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\src\v6\routing\routeRegistry.ts` |
| ReceptionScreen | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\src\v6\screens\pageviews\ReceptionScreen.tsx` |
| RepresentativeScreens | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\src\v6\screens\RepresentativeScreens.tsx` |
| V6Shell | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\src\v6\shell\V6Shell.tsx` |
| pageviews index (export) | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\src\v6\screens\pageviews\index.ts` |

## Evidence

### 1. router.tsx index Navigate → `/reception`

```38:38:src/v6/routing/router.tsx
      { index: true, element: <Navigate replace to="/reception" /> },
```

Authenticated shell root index redirects to `/reception`.

### 2. safeRedirect BRAD_DEFAULT_ROUTE

```9:9:src/v6/utils/safeRedirect.ts
export const BRAD_DEFAULT_ROUTE = '/reception';
```

```18:18:src/v6/utils/safeRedirect.ts
export function safeReturnTo(raw: string | null | undefined, fallback: string = BRAD_DEFAULT_ROUTE): string {
```

Default post-login / safe-return fallback is Reception.

### 3. routeRegistry entries

```47:47:src/v6/routing/routeRegistry.ts
  { path: '/reception', hashId: 'reception', template: 'reception', group: 'System', title: 'Reception', description: 'Secure post-login workspace launcher for Care Indeed products.' },
```

```141:142:src/v6/routing/routeRegistry.ts
  { path: '/find-home-care', hashId: 'find-home-care', template: 'prototype', group: 'System', title: 'Find Home Care', description: 'Standalone Find Home Care prototype, separate from the EHR prototype.' },
  { path: '/ehr-prototype', hashId: 'ehr-prototype', template: 'prototype', group: 'System', title: 'EHR Prototype', description: 'Local EHR prototype handoff route; primary launcher opens the live prototype service.' },
```

All three paths present with distinct `hashId` values.

### 4. ReceptionScreen WORKSPACES — Find Home Care vs EHR Prototype

IDs and routes are separate entries in `WORKSPACES`:

```89:112:src/v6/screens/pageviews/ReceptionScreen.tsx
  {
    id: 'find-home-care',
    name: 'Find Home Care',
    description: 'A separate consumer-facing service finder concept for care needs, location, and intake routing.',
    route: '/find-home-care',
    status: 'prototype',
    requiredRoles: ['Administrator', 'Product', 'Intake', 'Sales'],
    capabilities: ['Care matching', 'Service area', 'Intake lead', 'Family view'],
    accent: 'navy',
    icon: Home,
    cta: 'Open Finder',
  },
  {
    id: 'ehr-prototype',
    name: 'EHR Prototype',
    description: 'A standalone clinical record concept for chart navigation, documentation, scheduling, and secure tasks.',
    route: 'http://127.0.0.1:5191',
    external: true,
    status: 'prototype',
    requiredRoles: ['Administrator', 'Product', 'Clinician', 'RN', 'LVN', 'PT', 'OT'],
    capabilities: ['Charts', 'Visits', 'Orders', 'Messages'],
    accent: 'clinical',
    icon: Activity,
    cta: 'Open EHR',
  },
```

- Find Home Care: internal route `/find-home-care` (not EHR).
- EHR Prototype: external route exactly `http://127.0.0.1:5191` (no trailing slash required by check; exact match accepted).
- `external: true` only on EHR entry.

In-app prototype screens also assert product separation:

```601:640:src/v6/screens/pageviews/ReceptionScreen.tsx
export function FindHomeCareScreen() {
  return (
    <PrototypeWorkspaceShell
      ...
      route="/find-home-care"
      ...
    >
...
export function EhrPrototypeScreen() {
  return (
    <PrototypeWorkspaceShell
      ...
      route="/ehr-prototype"
```

### 5. RepresentativeScreens switch cases

```1670:1672:src/v6/screens/RepresentativeScreens.tsx
    case 'reception':
      child = <ReceptionScreen />;
      break;
```

```1724:1729:src/v6/screens/RepresentativeScreens.tsx
    case 'find-home-care':
      child = <FindHomeCareScreen />;
      break;
    case 'ehr-prototype':
      child = <EhrPrototypeScreen />;
      break;
```

Also listed in hashId coverage array:

- `'reception'` at line 1989
- `'find-home-care'` at line 2045
- `'ehr-prototype'` at line 2046

### 6. V6Shell chrome-free for `/reception`

```67:80:src/v6/shell/V6Shell.tsx
  const isReceptionRoute = pathname === '/reception';
  // ?embed=1 renders the route content with no shell chrome — used when a
  // screen embeds another route in an iframe (e.g. policy appendices modal
  // showing an actual form workspace).
  const isEmbedRequest = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
  ...
  const isChromeFreeRoute = isPlayerRoute || isDocumentPrintRoute || isPersonalProfileRoute || isReceptionRoute || isEmbedRequest || isPolicyDetailRoute;
  // Keep the dock visible during a guided tour so its nav targets stay anchorable.
  const showDock = !isChromeFreeRoute && (!pathname.startsWith('/iadministrator') || bradLanding || tourActive);
  const showRouteChrome = !isChromeFreeRoute;
```

`/reception` is treated as chrome-free (`isChromeFreeRoute` includes `isReceptionRoute`), so dock and route chrome are suppressed.

## Findings

- No defects for the six static checks.
- EHR launcher URL is exactly `http://127.0.0.1:5191` (check allows optional trailing slash; none present — still valid).
- Find Home Care and EHR Prototype are distinct workspace IDs, routes, accents, and screen components.
- Index route and default redirect both land on Reception.

## Result

**PASS** — all six static checks hold.
