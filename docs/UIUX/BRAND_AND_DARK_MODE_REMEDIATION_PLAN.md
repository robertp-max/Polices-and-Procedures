# Brand & Dark Mode Remediation Plan
**Care Indeed Home Health – UI/UX Reconstruction**

**Status:** Phase 1 Remediation (Must be completed before any other work)
**Priority:** Critical – Blocking Item
**Owner:** To be assigned
**Target:** Deliver a clean, first-class Care Indeed Navy Dark glassmorphic experience that matches the Top Picks mocks.

---

## 1. Current State (Honest Assessment)

- Two orthogonal systems still exist:
  - `useShellStore.theme` → `care-indeed-light` | `ci-ion-dark`
  - `useCiModeStore.mode` → `light` | `dark`

- `ShellFrame.tsx` decides the backdrop **only** from `ciModeStore`, completely ignoring brand.
- The "Care Indeed dark" path (`care-indeed-light` + `dark`) has only partial CSS remaps. The rich glassmorphic foundation (proper deep navy backdrop + constrained single glass canvas) does **not** exist in a production-ready form.
- The old CI-ION maroon/gold Travelight experience is still the best-looking dark mode available.
- Toggling the logo still offers the old CI-ION dark as a first-class option.

This directly violates the Phase 1 requirements in `CANONICAL_UI_SYSTEM_SPEC.md` and the Master Plan.

---

## 2. Target State (Non-Negotiable)

### 2.1 Single Brand System
- Remove `ci-ion-dark` as a production brand option for Care Indeed surfaces.
- The only brand in production = **Care Indeed**.
- Dark mode for Care Indeed must be a proper **Navy Glassmorphic Dark** (deep navy/charcoal background + teal accents + constrained glassmorphism), matching the visual language of the Top Picks mocks.

### 2.2 Unified Mode System
- Collapse the two stores into one clean system.
- Recommended approach:
  - Keep or create a single source of truth: `useCareIndeedModeStore` or similar.
  - Values: `light` | `dark`
  - Dark = Navy Glassmorphic Dark (the new canonical experience).

### 2.3 Backdrop & Glassmorphism Logic
- `ShellFrame.tsx` must decide the backdrop based on the **Care Indeed brand + current mode**.
  - Light → Flat professional light backdrop (current Care Indeed light behavior).
  - Dark → Rich navy glassmorphic backdrop (new experience that matches the mocks).

- The constrained 4-sided page view contract must work properly in both light and the new Navy Dark.

### 2.4 Visual Target
- The new Care Indeed Navy Dark must visually match the dark glass aesthetic shown in:
  - `mocks/Top-Picks/11_OnboardingActivation_Desktop_v2.jpg`
  - `mocks/Top-Picks/12_EvidenceCapture_Desktop_v2.jpg`
  - And the mobile equivalents.

---

## 3. Execution Steps (Strict Order)

### Step 1: Architecture Decision & Store Cleanup
- Decide final store structure (recommend collapsing into one store).
- Remove or deprecate `ci-ion-dark` from production paths.
- Update all `data-theme` / `data-ci-mode` usage to the new unified model.

### Step 2: Rebuild Backdrop Logic in ShellFrame
- Modify `ShellFrame.tsx` so backdrop choice is driven by the Care Indeed brand + mode.
- Create or finalize the Navy Dark backdrop treatment (deep navy + proper blur, depth, and glass magnification).

### Step 3: Update CommandCenterLayout + Logo Toggle
- Remove the ability to toggle to CI-ION dark in production Care Indeed flows.
- Logo should only toggle Light ↔ Navy Dark (Care Indeed).

### Step 4: CSS & Token Cleanup
- Clean up the complex data-attribute combinations in `index.css`.
- Make sure the Navy Dark variant has complete, high-quality glass treatments (not just partial remaps).

### Step 5: Surface Adoption Pass
- Go through major surfaces (Dashboard, Evidence, Audit, Calendar, My Tasks, Onboarding V2, etc.) and ensure they render correctly and beautifully in the new Navy Dark.
- Remove any remaining code that assumes the old dual-brand behavior.

### Step 6: Testing & Visual Regression
- Capture before/after against the Top Picks mocks.
- Verify no regressions in Light mode.
- Verify reduced-motion and accessibility in the new Dark.

---

## 4. Exit Criteria (Must be Green Before Proceeding)

- [ ] Only one brand exists in production: Care Indeed.
- [ ] Only two modes: Light and Navy Dark.
- [ ] `ShellFrame` correctly renders the rich navy glassmorphic backdrop when in Dark mode.
- [ ] The new Navy Dark visually matches the Top Picks mocks at the glassmorphism level.
- [ ] No more logo toggle that surfaces the old CI-ION maroon/gold experience.
- [ ] All major operational surfaces look production-ready in both Light and the new Navy Dark.
- [ ] No regressions in Light mode.
- [ ] `CANONICAL_UI_SYSTEM_SPEC.md` Section on Brand/Mode is updated to reflect the final implemented state.

---

**This remediation must be treated as the new Phase 1 gate.**  
No other reconstruction work should proceed until the above exit criteria are met and verified against the mocks.