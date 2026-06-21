# 14 - iAdministrator (Brad) / Chat View (brad)

**File confirmed:** Exists at `Reference/V6/14-iadministrator-brad.png` (base capture for Agent 10 focus on Brad / iAdministrator).

**View Registration:** `brad` (group: "Brad")
- Label: "Brad"
- Route: `/iadministrator`
- Icon: `bot`
- Template: `chat`
- Description: "Decision-support workspace for primary operations triage, staffing risk, coverage decisions, and generated work products."
- Metrics (in view config):
  ```js
  metric('Risk signals', '3', '1 high severity', 'orange'),
  metric('Actions queued', '8', '4 due this week', 'teal'),
  metric('Docs generated', '12', 'Last 30 days', 'green'),
  metric('Confidence', 'High', 'Grounded to policy corpus', 'teal'),
  ```
- Messages (bradPrimaryOpsMessages seed):
  - User: "What needs attention before end of day in Primary Operations?"
  - Brad: "Three items: SOC backup for Elena Vargas, CHHA weekend coverage, and James Kwon credential renewal evidence. The SOC backup has the highest service-continuity risk."
  - User: "Who should own the SOC backup?"
  - Brad: "Assign to the Clinical Manager with Maria Delgado as primary RN. I would keep Scheduling copied because the visit is inside the same-day coverage window."
- Cards (contextual SurfaceCards):
  - 'Coverage risk' (orange)
  - 'Clinical context' (teal)
  - 'Recommended next action' (teal)

**PNG Confirmation:** File exists at `Reference/V6/14-iadministrator-brad.png`. Static capture shows full shared prototype shell (sidebar + topbar) with prominent **BRAD iADMINISTRATOR** persona welcome card in the main area. The ChatPrototype decision-thread rendering may appear on interaction or in related states.

## Information Architecture (IA) — Brad / iAdministrator Placement
- Positioned as dedicated top-level nav group: **Brad** (label "Brad" / "iAdmin" in visual/sidebar).
- Route: `/iadministrator` — intentional signaling of the intelligent Administrator persona ("iAdministrator").
- Grouped conceptually under **ADMINISTRATION / KNOWLEDGE** layer in visual IA (alongside Policy Command Center, Reports, Settings).
- Sibling to PRIMARY OPERATIONS (Dashboard, Profiles, Calendars, Brief) and COMPLIANCE EXECUTION (CES, Workflows, Taxonomy, Onboarding, Policy Library, Evidence).
- Functions as the AI co-pilot / decision support hub accessible from anywhere (also surfaced via "Ask Brad" quick actions in Personal Ops drawer and other surfaces).
- Sidebar structure (as captured):
  - PRIMARY OPERATIONS
  - COMPLIANCE EXECUTION
  - ADMINISTRATION / KNOWLEDGE → iAdmin (active in this view)
- Purpose: Unified natural-language interface over the entire home health corpus, policies, operational data, risks, and workflows. "Grounded in your internal home health corpus."

## Chat Interface — Persona Welcome State (visible in base PNG)
The focal element is a centered, elevated card (white, rounded-2xl, soft shadow/border) representing the Brad entry experience:

- **Header row**: Robot avatar icon (teal accent), "BRAD iADMINISTRATOR" label, close (×) control.
- **Greeting**: "Hello, TJ, I am Brad!" (personalized, friendly, authoritative tone).
- **Prompt row**:
  - Input-like surface with green puzzle / "sparkles" icon.
  - Placeholder / label: "Ask Brad what you need".
  - Prominent orange primary action button: "→ Run with Brad".
- **SUGGESTED MISSIONS** section:
  - Horizontal / wrapped pill buttons (light bg, subtle borders):
    - "Run pre-survey audit"
    - "Identify QAPI gaps"
    - "Show missing governing body forms"
- **Footer bar**:
  - Lock icon + "GROUNDED IN YOUR INTERNAL HOME HEALTH CORPUS"
- **Bottom actions**:
  - Teal/green-accent "Start Guided Tour"
  - Neutral "Skip For Now"

This welcome card serves as the **ChatPrototype** landing / invocation surface. It emphasizes:
- Zero-friction entry ("Ask Brad..." + direct "Run with Brad").
- Curated, high-value starter missions tied to real compliance/ops pain points.
- Trust signals (grounding, tour option).

## ChatPrototype Render (when engaged / full thread view)
Defined in index.html ~2626:

```jsx
function ChatPrototype({ view }) {
  // Renders:
  // - Left (xl:3): "Brad decision thread" header + conversation bubbles
  // - Right (xl:2): SurfaceCards (risks, citations, actions)
}
```

- Conversation uses alternating bubbles:
  - User: right-aligned, bg-brand-teal-500 + white text.
  - Brad: left-aligned, bg-brand-neutral-50 + teal text + border.
- Header inside thread: bot icon + "Brad decision thread" + "Grounded response with actions, citations, and controls."
- Default fallback messages demonstrate policy/form guardrails (e.g., GV-FM-006 required disclosure).
- Side panel surfaces recommendations, required items, gaps (reuses SurfaceCard pattern with tone, progress, icons).
- Integrates view.cards and view.messages from registration.

Additional ChatPrototype usage appears in policy lifecycle contexts (e.g., publication guardrails).

## Scenarios & Usage Patterns
Brad / iAdministrator is designed for conversational decision support across domains. Core scenarios illustrated by seeds, suggested missions, and data:

1. **Primary Operations Triage**
   - Query: "What needs attention before end of day in Primary Operations?"
   - Response: Enumerates SOC backup, weekend CHHA coverage, credential evidence; flags highest risk item; suggests owner + coordination (Clinical Manager + Scheduling copy).

2. **Coverage & Staffing Risk**
   - Suggested / cards: "SOC backup and CHHA weekend pool are the highest priority service-continuity actions."
   - Actionable output: Specific assignments + checkpoint timing.

3. **Compliance Execution & QAPI**
   - "Identify QAPI gaps"
   - "Run pre-survey audit"
   - Responses include queued forms, owners, rerun controls.

4. **Governance / Policy Lifecycle Guardrails**
   - Example thread: Publication blocked until disclosure (GV-FM-006) attached + Governance assignment.
   - "Show missing governing body forms"
   - Citations + next-step sequencing.

5. **Evidence & Documentation Gaps**
   - Credential watchlists, evidence packet completeness, missing signatures.

6. **Guided / Tour Mode**
   - "Start Guided Tour" entry point for onboarding users to Brad capabilities within the home health context.

Brad always returns:
- Specific items with owners, risks, and due context.
- Recommended actions (assign, collect, verify, rerun).
- Grounding / citation references back to the internal corpus (policies, forms, data objects).
- Confidence / posture indicators.

## Styling & Interaction Notes
- Consistent with global design system: rounded-2xl, shadow-soft, brand-teal (#004142 dark, #06A6AB accents) + brand-orange (#E56E2E) for primary actions / risk.
- ToneBadges, progress indicators, SurfaceCards reused for continuity with dashboard / CES / other prototypes.
- Chat bubbles use max-w limited width + responsive stacking.
- "Run with Brad" and mission pills act as invocation triggers into the thread state.
- Accessible from global shell (top search contextually surfaces Brad actions; Personal Ops drawer exposes "Ask Brad").

## Key UI Elements Visible / Prototype
- Persona card as primary visual affordance (distinct from inline dashboard cards).
- Suggested missions as scannable entry points (reduce blank-slate friction).
- Explicit grounding footer for trust in regulated environment.
- Hybrid: welcome + full threaded chat + side context cards.
- No traditional form inputs beyond the Ask/Run surface (conversational first).

**Related Views / Surfaces:** dashboard (primaryOps context), ces-board, policy-viewer (form guardrails), personal-ops drawer ("Ask Brad" quick action), admin roles (Brad access rules).

**Source Sections:** 
- VIEW_GROUPS registration + brad view ~1195-1211
- bradPrimaryOpsMessages ~302-307
- ChatPrototype definition + render ~2626-2658
- renderTemplate case 'chat' ~4221
- Sidebar nav groups ~4344 (and visual IA grouping)
- Metric / card helpers and tones ~129+
- "Ask Brad" action surface ~3580
- CareIndeedReferenceApp.jsx brad data section (parallel records/metrics) ~278-292

**Agent 10 Notes:** This document captures the dedicated iAdministrator / Brad chat interface and its IA role. The base PNG foregrounds the persona welcome + missions as the key differentiator for the chat view. When documenting future iterations, align suggested missions / seeds to current operational priorities and verify grounding language remains prominent.
