# Universal Navigation System

**Added:** April 2026  
**Scope:** Shell-level back/forward navigation across all eligible internal routes  
**Files:**

| File | Role |
|------|------|
| `src/policy/stores/navStore.ts` | Zustand navigation stack store |
| `src/policy/utils/navExclusions.ts` | Route exclusion predicate + active-input guard |
| `src/policy/components/UniversalNavControls.tsx` | Header Back / Forward button pair |
| `src/policy/components/CommandCenterLayout.tsx` | Integration host — route tracker, keyboard/swipe listeners, control rendering |

---

## 1. Navigation Stack Design

### Why a custom stack?

React Router's `navigate(-1)` delegates entirely to the browser's native History API.  That means:

- It can exit the app (navigating back past the landing page into whatever the user was doing before).
- It cannot be independently queried — there's no reliable `canGoBack` signal.
- The browser stack contains entries from other tabs, reloads, and direct URL changes that don't belong to the in-app navigation intent.

The custom Zustand store (`useNavStore`) maintains an **internal** back/forward stack that only records routes navigated through the shell itself.

### Store structure (`navStore.ts`)

```
_current:      string        — current pathname (mirrors location.pathname)
backStack:     string[]      — older routes (oldest at index 0, newest at end)
forwardStack:  string[]      — forward routes (oldest at index 0, newest at end)
_skipNext:     boolean       — suppresses the next push() call
```

### State transitions

#### User navigates to a new route (via menu, link, etc.)

```
push(newPath) called by RouteTracker useEffect
  if _skipNext → reset _skipNext, return early
  if newPath === _current → no-op (same route)
  else:
    backStack  ← [...backStack, _current]
    forwardStack ← []           ← forward history is always cleared
    _current   ← newPath
```

#### User clicks Back (or presses ←)

```
initiateBack()
  target ← backStack.pop()
  forwardStack ← [...forwardStack, _current]
  _current ← target
  _skipNext ← true             ← suppress the route-change push below
  return target                ← caller navigates to target
                               ← location changes → RouteTracker fires push()
                                  but _skipNext is true so it's swallowed
```

#### User clicks Forward (or presses →)

```
initiateForward() — symmetric to initiateBack()
```

### Why `_skipNext`?

When we programmatically call `navigate(target)` for a back/forward action, the React Router location changes and our `useEffect` in `CommandCenterLayout` fires `push(newPath)`.  Without the guard that would push the target onto `backStack` a second time — corrupting the stack.  `_skipNext` tells `push()` to silently absorb the next call.

---

## 2. Route Exclusions

Defined in `src/policy/utils/navExclusions.ts`.

### Excluded routes

| Pattern | Reason |
|---------|--------|
| `/library/:policyId` | Policy detail/viewer. Shell chrome is hidden (`detailMode`). Keyboard arrows are used for PDF text selection and document navigation. |
| `/gv-policy/:policyId` | Governance policy detail. Same reasons as above. |
| `/forms/:formId` | Form viewer. User may be filling in fields — arrow keys navigate within inputs, dropdowns, date pickers. |
| `/forms/:formId/print` | Form print layout. Rendered outside the shell; guard is defence-in-depth. |
| `/print/*` | Standalone print pages. Outside the shell entirely. |
| `/drafts/:policyId` | Draft policy editor. Active text-editing environment. |
| `/brad-proposal` | Hidden executive view. Outside the shell. |

### How exclusions work

`isNavExcludedRoute(pathname)` is called in three places inside `CommandCenterLayout`:

1. **Keyboard handler** — `keydown` event is silently ignored.
2. **Swipe handler** — `touchend` event is silently ignored.
3. *(The header `Back/Forward` buttons are already hidden on excluded routes because `hideChrome` removes the entire header for detail pages.)*

### Active-input guard

`hasActiveInputFocus()` returns `true` when `document.activeElement` is any of:

- `<input>`, `<textarea>`, `<select>`
- any element with `isContentEditable === true`
- any element with `role="searchbox"`, `"combobox"`, or `"textbox"`

This prevents arrow-key navigation from firing while the user is typing in the global search bar or any in-page form element.

---

## 3. Keyboard Navigation

| Key | Action | Guard |
|-----|--------|-------|
| `←` Arrow Left | Navigate back | Excluded route, active input, menu open, modifier key held |
| `→` Arrow Right | Navigate forward | Same |

Modifier keys (`Meta`, `Alt`, `Ctrl`) are explicitly ignored so browser/OS shortcuts (e.g. `Alt+←` browser back) are never hijacked.

The listener is attached once to `document` in a `useEffect` with no route-specific deps.  Stable refs (`locationRef`, `isMenuOpenRef`) keep the handler closure up-to-date without re-subscribing on every render.

---

## 4. Swipe Navigation

| Gesture | Action | Guard |
|---------|--------|-------|
| Swipe right (≥ 60 px horizontal) | Navigate back | Excluded route, active input, menu open |
| Swipe left (≥ 60 px horizontal) | Navigate forward | Same |

Vertical scrolling is protected: the swipe is only counted as navigation when `|deltaX| > |deltaY|` — i.e. it is **primarily horizontal**.  The minimum travel distance (60 px) filters out accidental micro-swipes.

Listeners are attached to `document` as `{ passive: true }` so they never block the browser's native scroll handling.

---

## 5. UniversalNavControls Placement

The `<UniversalNavControls />` component is rendered in the shell header's **left cluster**, between the hamburger menu button and the page title/logo:

```
[ ☰ Menu ]  [ ← ][ → ]  [ Policy Taxonomy / mobile logo ]
                                                              [ Search ][ ? ][ JD ]
```

The pill border, icon sizes, and hover states intentionally mirror the existing shell chrome tokens:

- Pill border: `1px solid #E5E4E3` (light) / `rgba(255,255,255,0.09)` (dark)
- Active icon: same opacity ladder as Help/Account buttons
- Disabled icon: `text-slate-300` / `text-white/20` — visually muted, `cursor-not-allowed`

The controls are hidden on excluded routes because `hideChrome` removes the entire header for those pages.

---

## 6. Why Policy and Form Viewers Are Excluded

### Policy detail pages (`/library/:policyId`, `/gv-policy/:policyId`)

These pages open a full-screen document viewer (PDF-style).  The shell header and chrome are hidden via `hideChrome = true`.  Users may:

- Select text (keyboard navigation within text)
- Use screen-reader arrow keys to read content
- Use browser native shortcuts (`Alt+←` etc.)

Enabling shell-level arrow-key navigation would interfere with all of the above, and there is no header to display the controls on anyway.  The existing per-page "close" / `navigate(-1)` button handles leaving these views.

### Form viewer (`/forms/:formId`)

Form fields respond to `ArrowLeft`/`ArrowRight` for cursor movement, `ArrowUp`/`ArrowDown` for `<select>` options and date pickers.  Intercepting these keys would break form usability entirely.  The form viewer also hides the shell chrome.

### Print pages (`/print/*`, `/forms/:formId/print`)

These routes render outside `CommandCenterLayout` entirely — they have no shell header and no keyboard/swipe listeners are expected.  They are listed in the exclusion table as a defence-in-depth measure should the listener ever be moved higher in the tree.

---

## 7. Interaction with the Hamburger Menu

When `isMenuOpen === true` (full-screen modal nav), both the keyboard and swipe listeners are short-circuited before any action:

```ts
if (isMenuOpenRef.current) return;
```

This ensures that pressing arrow keys while browsing the nav grid does not also trigger back/forward navigation, and that swiping to dismiss the menu overlay does not cause a route change.

---

## 8. Adding New Excluded Routes

Edit `src/policy/utils/navExclusions.ts`, add a regex to `EXCLUDED_PATTERNS`:

```ts
const EXCLUDED_PATTERNS: RegExp[] = [
  /^\/library\/.+/,
  // ... existing patterns ...
  /^\/your-new-detail-route\/.+/,   // ← add here
];
```

No other changes are needed — the keyboard handler, swipe handler, and control rendering all read from this single list.
