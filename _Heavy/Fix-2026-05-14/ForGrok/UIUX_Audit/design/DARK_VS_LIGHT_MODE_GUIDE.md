# Dark vs Light Mode Usage Guide — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Overview

CareIndeed supports both **Dark Mode** (primary for operational/compliance work) and **Light Mode** (secondary, for specific workflows).

The two modes are not just color inversions — they have different elevation strategies and usage contexts.

---

## 2. Primary vs Secondary Mode

| Mode        | Priority     | Recommended For                              | Visual Character                  |
|-------------|--------------|----------------------------------------------|-----------------------------------|
| **Dark Mode**   | Primary      | CES, Evidence, Audit, Governance, Policy Detail, eCign, Reports | Deep, premium, focused, high-end |
| **Light Mode**  | Secondary    | Onboarding flows, simple forms, field clinician quick tasks, acknowledgments | Clean, calm, approachable         |

**Rule of thumb:**
- If the screen is **operationally heavy** or **compliance-critical** → Dark Mode (default)
- If the screen is **form-heavy** or used by **field clinicians** in bright environments → Light Mode

---

## 3. Visual Treatment Differences

### Dark Mode
- Deeper glassmorphism (more opacity + blur)
- Stronger visual depth and layering
- Navy + Charcoal base
- Teal and warm orange stand out clearly
- More forgiving with elevation

### Light Mode
- Shallower glass effect
- **Very subtle hairline borders** (`#E5E4E3` range)
- Stronger reliance on **soft shadows** for elevation
- Slightly cooler background (`#F8FAFC`)
- More conservative use of transparency (to avoid white-on-white)

**Never** use the same glass treatment in both modes without adjustment.

---

## 4. When to Force a Mode

Some flows should **always** appear in a specific mode, regardless of user preference:

| Flow                        | Recommended Mode | Reason |
|----------------------------|------------------|--------|
| eCign Signing              | Light Mode       | High trust, signature clarity, reduced eye strain |
| Evidence Capture (photo)   | Light Mode       | Better camera preview and document visibility |
| Onboarding Activation      | Light Mode       | Feels more welcoming and less intimidating |
| Major Compliance Reports   | Dark Mode        | Feels more serious and premium |
| Audit Readiness Dashboard  | Dark Mode        | High-stakes operational view |

---

## 5. User Preference Handling

- Respect system preference (`prefers-color-scheme`) as the default.
- Allow users to override per session or globally.
- When overriding, clearly communicate that some flows may still appear in the other mode for usability reasons.

---

## 6. Glass & Elevation Adjustments

| Aspect                    | Dark Mode                          | Light Mode                              |
|---------------------------|------------------------------------|-----------------------------------------|
| Glass opacity             | 70–82%                             | 80–90% (less transparent)               |
| Border strength           | Medium                             | Very soft hairline                      |
| Shadow strength           | Moderate                           | Stronger (to compensate for less depth) |
| Background tinting        | Subtle                             | More important for separation           |

---

## 7. Recommendations

- Default the app to **Dark Mode** for most operational users (DONs, compliance, surveyors).
- Default to **Light Mode** for field clinicians during onboarding and signing flows.
- Test critical flows (especially signing and evidence capture) in both modes on real devices.
- Never treat light mode as an afterthought — it must feel equally premium.

---

## 8. Future Work

- Define exact glass opacity and shadow values per mode in the design tokens.
- Create side-by-side examples of the same screen in both modes.
- Decide on default mode per user role (e.g., Clinician vs Compliance Officer).

---

*Dark mode currently carries the premium brand feel. Light mode must match it in quality, not just invert the colors.*