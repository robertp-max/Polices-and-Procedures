# Copilot / LLM Page View Generation Success Pack

**Purpose:**  
Feed this entire document (or the referenced files) at the **start** of any new Copilot, Cursor, Claude, or LLM session when you want the AI to generate new page views / staging surfaces.

This pack was created because previous attempts failed due to:
- Content hallucination (AI inventing wrong sections, wrong data, wrong hierarchy)
- Ignoring the canonical 4-sided glass contract
- Using random colors and styles instead of the locked system
- Not matching the actual production page intent

---

## 1. Core Non-Negotiable Rules (Always Include These)

### A. The Constrained Page View Contract (Most Important Rule)

From `CANONICAL_UI_SYSTEM_SPEC.md` Section 4:

**Rule:**  
No operational page view may ever render its primary content as full-bleed against the viewport or the shell’s inner boundary.

Every page view **MUST** preserve a consistent, visible border/margin on **all four sides** between the outermost glass content and the containing frame.

This rule exists to magnify the glassmorphism effect. Full-bleed glass kills the intended depth, blur, and premium floating-panel feeling.

Implementation:
- Desktop: `clamp(16px, 1.6vw, 28px)` inset on all sides (see `ShellFrame.tsx` and `ShellContentFrame.tsx`)
- The main content lives inside a rounded glass surface that never touches the edges on desktop.

### B. Layer Model (Strict — Max 3 Layers)

- Layer 0: Atmospheric backdrop (TravelightBG or subtle gutter)
- Layer 1: Main shell / primary glass panel
- Layer 2: Elevated cards and surfaces inside Layer 1
- Layer 3: Only for true exceptions (never for decoration)

### C. "Same Content, New Design" Principle

When generating a page view with a new visual treatment:

- The **information architecture, sections, data fields, primary tasks, and hierarchy** must match the real production page (or the canonical intent for that surface).
- Only the visual language (colors, depth treatment, separators, glass style, motion) may change.
- Never invent new tabs, new metrics, new flows, or different mental models unless explicitly asked.

---

## 2. Ground Truth Content Sources (Feed These When Building Specific Pages)

When generating any of the following surfaces, the AI **must** be shown the real implementation so it copies the correct content structure.

### Clinician Profile / Detail View
- Real source: `src/policy/staffing/pages/ClinicianDetailPage.tsx`
- Key structure it must respect:
  - Hero header (avatar, name + credentials, role, status, license, accuracy)
  - At-a-glance metrics row
  - Tabs: Overview, Credentials & Competencies, Assignments, Availability, History
  - Connections / patient load / upcoming schedule

### Patient Profile / Detail View
- Real source: `src/policy/staffing/pages/PatientDetailPage.tsx`
- Key structure:
  - Hero header (name, DOB/age, primary diagnosis, status, assigned clinician)
  - Metrics: Care Status, Allergies/Flags, Risk/Acuity
  - Recent Clinical Files
  - Planned Treatments / Visits
  - Tabs: Overview, Care Needs, Assignments, Preferences, History

### Staffing / Operational Calendar
- Real sources: `src/policy/staffing/pages/StaffingCalendarPage.tsx` + `src/policy/pages/MasterCalendarPage.tsx`
- Must include: Month/Week navigation, view toggles (Day/Week/Month), dense event cells, two-tone events (clinical vs regulatory), filters, shift cards

### Brad / iAdministrator Workspace
- Real source: `src/policy/pages/iAdministrator/index.tsx`
- Critical elements that must appear:
  - Health / corpus status strip
  - Large context-aware command bar
  - Studio / reasoning mode tabs or chips
  - Structured response area (Requirements Snapshot, Citations, Recommended Actions)
  - Right/side preview + execution rail
  - Not a generic chatbot — it is a compliance intelligence surface

### Login / Auth
- Real source: `src/auth/pages/LoginPage.tsx`
- Standard identifier + credential form + security messaging

### Dashboard / Executive Overview
- Real source: `src/policy/pages/DashboardPage.tsx`
- KPI row + board columns (Critical / At Risk / etc.) or planner view + alerts rail

**Rule for the AI:** Before generating any of the above, you must first read the real source file listed and replicate its primary content blocks and data concepts exactly.

---

## 3. Visual System Rules

- All surfaces must ultimately live inside the canonical `CommandCenterLayout` + `ShellFrame` + `ShellContentFrame`.
- Use the `--ci-*` token system (see `src/policy/components/ui/` and the theme variables).
- Broken-line / dashed separators are allowed as a visual motif in experimental treatments, but the 4-sided frame contract is never violated.
- Maximum two meaningful elevation layers inside the main glass surface for calm depth.

---

## 4. How to Prompt Effectively (Copy This Pattern)

When starting a new generation session, paste something like this at the top:

```
You are an expert frontend engineer working on the Care Indeed Home Health platform.

You have been given the COPILOT_PAGEVIEW_SUCCESS_PACK.md document. Follow it strictly.

Task:
Create a new visual treatment (experimental V3 glassmorphic workbench style with broken-line separators, deep navy base, teal and orange accents, premium constrained-frame glass) for the [Clinician Profile / Patient Profile / Calendar / Brad Workspace] page.

Constraints:
- Content, sections, data, and hierarchy MUST match the real production page at [path to real file]. Do not invent new elements.
- The page must respect the 4-sided constrained frame contract from the Canonical Spec.
- Use only the allowed visual language described in the pack.
- Output must be ready to drop into a fresh staging route for visual exploration only.

First, confirm you have internalized the content contract for this surface by listing the required blocks you will include.
```

Then continue the conversation with the specific request.

---

## 5. Documents You Should Also Attach / Reference

For maximum success, also give the model access to these files:

1. `docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md` — especially Sections 3 and 4
2. `docs/UIUX/16_AGENT_COORDINATED_FRONTEND_INTEGRATION_PLAN.md` — the page inventory and contracts
3. The specific real page file(s) you want replicated in content
4. `src/policy/components/ui/ShellFrame.tsx` and `ShellContentFrame.tsx` — for the exact inset + glass implementation
5. `src/policy/components/CommandCenterLayout.tsx` — to understand the real shell

---

## 6. Common Failure Modes (Tell the AI to Avoid These)

- Inventing new tabs or sections that don't exist in the real page
- Making the content area full-bleed
- Using random Tailwind colors instead of the locked tokens
- Turning Brad into a generic chat UI
- Making the calendar sparse instead of dense like the real one
- Forgetting the "assigned clinician", "upcoming schedule", "recent files", or "structured response + citations" patterns

---

**End of Pack**

When you start a new session with Copilot / Claude / Cursor, paste the relevant parts of this document + the specific real source files. This dramatically reduces content drift.

If you want me to expand any section, add more content contracts for specific surfaces, or create a shorter "paste this first" version, just tell me.