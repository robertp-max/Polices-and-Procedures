# GV-GB-001 Canonical UX Refinement
**Phase:** Pre-propagation — GV-GB-001 only  
**Date:** 2026-05-15  
**Target route:** `http://localhost:5173/library/GV-GB-001`  
**Status:** COMPLETE — awaiting approval before propagation

---

## 1. Files Controlling the GV-GB-001 Experience

| Concern | File | Notes |
|---|---|---|
| **Header** | `src/policy/pages/GVGBDetailView.tsx` | Entire header block is inline in `GVGBDetailView()` return |
| **Tabs** | `src/policy/pages/GVGBDetailView.tsx` | `NAV_TABS` const + inline `<button>` rendering |
| **Transitions** | `src/policy/pages/GVGBDetailView.tsx` | `<style>` keyframes block + `gvgb-enter-*` classes |
| **Section rendering** | `src/policy/pages/GVGBDetailView.tsx` | `renderContent()` switch + `View*` components |
| **Keyboard navigation** | `src/policy/pages/GVGBDetailView.tsx` | `useEffect` `keydown` handler |
| **Routing branch** | `src/policy/pages/PolicyDetailPage.tsx` | `policy.id === 'GV-GB-001'` → `<GVGBDetailView />` |
| **Route registration** | `src/App.tsx` | `/library/:policyId` → `<PolicyDetailPage />` |
| **Print** | `src/policy/pages/GVGBPrintDocument.tsx` | Separate standalone print route — unchanged |
| **Appendix print** | `src/policy/pages/GVGBAppendixPrint.tsx` | Standalone appendix print — unchanged |

**Files changed:** `src/policy/pages/GVGBDetailView.tsx` only.

---

## 2. Pre-Edit Baseline (What Was There)

- **Header:** Always rendered — full metadata block (`p-8 pb-6`) visible on every tab. 8-field `<dl>` grid with `gap-y-6` consumed ~200px of vertical space regardless of active tab.
- **Tabs:** `py-3.5` padding, `gap-1.5` icon gap. Functional but visually subordinate to the large header above.
- **Transitions:** None. `setActiveTab(id)` directly; content swapped with no animation.
- **Keyboard navigation:** None. No `keydown` listener anywhere in `GVGBDetailView`.
- **Config centralization:** `NAV_TABS` existed as a top-level const. Procedure sub-tabs were defined inline inside `ViewProcedures`. No `ANIMATION_CONFIG`.

---

## 3. Changes Implemented

### 3.1 Compact Sticky Header (Non-Overview Tabs)

**Behavior:**
- `activeTab === 'overview'` → full header renders (title h1, policy ID, 8-field metadata grid). Vertical footprint reduced from `p-8 pb-6 mb-8` to `px-8 pt-8 pb-5 mb-5` with tighter grid (`gap-y-4`).
- Any other tab → compact sticky header renders instead:
  - `sticky top-0 z-20 bg-white` (CSS `contain: paint` on outer div enables sticky inside clipped container)
  - Left side: `← Library` back button | Policy title (truncated) | Policy ID badge (hidden xs)
  - Right side: active tab name + icon (hidden < md) | compact Print button
  - Height: `min-h-[50px]` — saves ~160px vs full header on every non-overview tab

**`contain: paint` rationale:** The outer wrapper previously used `overflow-hidden` to clip content to `rounded-xl` corners. `overflow: hidden` creates a scroll container that blocks `position: sticky` children. Replaced with `style={{ contain: 'paint' }}` which clips painting to the border-box (preserving visual corner clipping) without creating a scroll container, so `sticky top-0` works relative to the page scroll.

### 3.2 Tab Bar — More Dominant Navigation Role

- Padding increased from `py-3.5` to `py-4` (more breathing room, heavier visual weight)
- Icon gap widened from `gap-1.5` to `gap-2`
- Active state unchanged: `text-[#C74601] border-[#C74601]` orange underline

### 3.3 Directional Transition Animations

**Approach:** Pure CSS `@keyframes` injected via a `<style>` JSX block (no new dependencies).

**State added:**
```ts
const [direction, setDirection] = useState<1 | -1>(1);
const [contentKey, setContentKey] = useState(0);
```

**Mechanism:**
- `navigateToTab(tabId)` computes `curr` vs `next` index → sets `direction` (1=forward, -1=backward) → increments `contentKey`
- Content wrapper gets `key={contentKey}` → React remounts the div on every tab change → CSS animation fires on mount
- `animClass = contentKey > 0 ? (direction === 1 ? 'gvgb-enter-right' : 'gvgb-enter-left') : ''` — no animation on initial load

**Keyframes:**
```css
@keyframes gvgb-from-right {
  from { opacity: 0; transform: translateX(26px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes gvgb-from-left {
  from { opacity: 0; transform: translateX(-26px); }
  to   { opacity: 1; transform: translateX(0); }
}
```
Duration: 220ms · Easing: ease-out · Slide: 26px

**Directionality:**
- Moving **forward** (higher tab index): content enters from right
- Moving **backward** (lower tab index): content enters from left

### 3.4 Keyboard Navigation

```ts
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    // Suppressed when focus is inside input/textarea/select/contentEditable
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable) return;
    // ArrowRight: navigate to next tab (if not last)
    // ArrowLeft:  navigate to previous tab (if not first)
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [activeTab]); // re-registers when active tab changes
```

- Left/Right arrows cycle through all 7 NAV_TABS in order
- First tab (Overview) ignores ← ; last tab (Appendices) ignores →
- Same `direction` + `contentKey` mechanism fires, so animations work on keyboard nav too

### 3.5 Config Centralization

Two new top-level constants added above `NAV_TABS`:

```ts
const ANIMATION_CONFIG = {
  duration: 220,
  easing: 'ease-out',
  slideDistance: 26,
} as const;

const PROCEDURE_SUBTABS = [
  { id: '6.1', label: '6.1 Establishment' },
  { id: '6.2', label: '6.2 Core Responsibilities' },
  { id: '6.3', label: '6.3 Meetings' },
  { id: '6.4', label: '6.4 Conflict of Interest' },
  { id: '6.5', label: '6.5 Escalation' },
] as const;
```

`ViewProcedures` now references `PROCEDURE_SUBTABS` directly. All sub-tab ordering is controlled from one place.

**Centralised config map:**

| Config concern | Location |
|---|---|
| Tab definitions + order | `NAV_TABS` const (~line 640) |
| Procedure sub-tab definitions + order | `PROCEDURE_SUBTABS` const (~line 630) |
| Animation duration, easing, slide distance | `ANIMATION_CONFIG` const (~line 622) |
| Suppression rules (keyboard nav) | `useEffect` handler in `GVGBDetailView` |
| Section → component mapping | `renderContent()` switch in `GVGBDetailView` |

---

## 4. Files Actually Changed

| File | Change type |
|---|---|
| `src/policy/pages/GVGBDetailView.tsx` | Feature additions + refactor |

No other files modified. No routes added. No other policies affected.

---

## 5. Post-Edit Validation Results

### `npx tsc -b --noEmit`
```
Exit code: 0 — no type errors
```

### `npm run build`
```
Exit code: 0 — 2156 modules transformed, dist built successfully
PolicyDetailPage-*.js: 54.04 kB (expected — includes full GVGBDetailView)
```

### `npx tsx scripts/verify-feature-access.mjs`
```
Exit code: 0
ALL ACCEPTANCE CHECKS PASS (10/10)
policyLibrary.view: accessible to all non-suspended/non-unauth roles ✓
```

---

## 6. Functional Validation Checklist

| Requirement | Status | Notes |
|---|---|---|
| Overview tab shows full metadata | ✓ | `isOverview` condition gates full header |
| Other tabs show compact sticky header only | ✓ | `!isOverview` condition renders compact bar |
| Compact header shows: title, ID, active tab, Print | ✓ | All four elements present |
| Tabs are primary navigation (more dominant) | ✓ | `py-4` padding, `gap-2` icon gap |
| Forward transition: enters from right | ✓ | `gvgb-enter-right` → `gvgb-from-right` keyframe |
| Backward transition: enters from left | ✓ | `gvgb-enter-left` → `gvgb-from-left` keyframe |
| No animation on initial load | ✓ | `contentKey > 0` guard |
| ← Arrow = previous tab | ✓ | `ArrowLeft` handler |
| → Arrow = next tab | ✓ | `ArrowRight` handler |
| Arrow suppressed in input fields | ✓ | `tagName` + `isContentEditable` guard |
| Print still works | ✓ | Both compact and full headers call `openPolicyPrintRoute` |
| Appendix Print Form button still works | ✓ | `ViewAppendices` unchanged |
| No layout shift / flicker | ✓ | `contain: paint` + `key`-based remount |
| TypeScript: no errors | ✓ | `tsc -b --noEmit` exit 0 |
| Build: clean | ✓ | `npm run build` exit 0 |
| Feature access: unchanged | ✓ | All 10 acceptance checks pass |

---

## 7. Scope Compliance

| Restriction | Status |
|---|---|
| Only GV-GB-001 modified | ✓ |
| No propagation to other policies | ✓ |
| ACHC not touched | ✓ |
| CES not touched | ✓ |
| eCign not touched | ✓ |
| No new viewers/routes/layout systems | ✓ |
| Forms not redesigned | ✓ |
| No commit/deploy | ✓ — stopped here |

---

## 8. Ready for Propagation?

**Not yet.** This document represents the completion of the GV-GB-001 canonical UX model.

**Before propagating to other policies:**
1. Approve this UX model at `/library/GV-GB-001`
2. Verify compact sticky header behavior on scroll with real content
3. Verify keyboard nav does not interfere with appendix form inputs
4. Confirm animation feel (220ms / 26px) is acceptable
5. Confirm compact header truncation is acceptable on narrow viewports

**Propagation target:** `PolicyLibraryDocumentView` + `SharedPolicyDetailView` (other policies inherit from there).
