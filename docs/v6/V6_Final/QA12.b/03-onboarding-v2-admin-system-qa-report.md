# QA12.b — Onboarding v2 + Admin/System Embedded Subviews Design Fidelity Report

**Date:** 2026-06-21  
**Agent:** QA reviewer for V6 design (Onboarding v2 group + related Admin/System)  
**Scope:** Embedded subviews, design fidelity, typography/token rules (300/500 weights only), Veil* usage, no new top-level router routes (preserve 56 total), hardcoded colors, placeholder vs rich content.  
**Routes/Screens Reviewed (per task):**  
- onboarding-v2-dashboard, onboarding-v2-activate  
- onboarding-v2-batches, onboarding-v2-batch (critical: Gate Checklist Expander + Evidence/Signature Sub-tabs)  
- onboarding-v2-audit  
- onboarding-v2-governance (Override Request Modal)  
- Admin: admin-groups, admin-roles, admin-permissions, admin-users (Permission Override Matrix), surveyor-viewer  
- System: policy-lifecycle (incl detail), hubstaff, system-docs, help-center, governance  

**Verification Methods:** Multiple `read_file`, `grep` (pattern searches for components, fonts, colors, gates, modals, routes, Veil*, expanders, tabs, matrix, overrides), `list_dir`. Cited as `path:line`. Routes counted via registry grep (54 entries). Blueprints cross-referenced from:  
- `docs/v6/V6_PHASE_12_2A_MISSING_SUBVIEW_BLUEPRINTS.md:202-280` (Gate Checklist Expander §9, Evidence/Signature §10, Override Modal §11, Permission Matrix §12)  
- `docs/v6/V6_MISSING_LAYOUTS_SPECIFICATION.md:67-123` (exact visual specs for gates, tabs, modal, matrix)  
- `docs/v6/V6_APP_MAP.md:222-230` (state map decisions)  
- `docs/v6/V6_Final/06-onboarding-v2.md` (intended gate tiles, evidence/signature tabs, overrides)  
- `docs/v6/V6_Final/QA12.b/00-QA-OVERVIEW.md`  
- `src/v6/tokens.ts`, `src/v6/V6_TOKEN_REGISTRY.md:66-87` (typography LOCK: 300 body / 500 titles+status/nav only; no 400/700+), `tailwind.config.js`, `src/index.css` (tokens via Tailwind).  
- Route source: `src/v6/routing/routeRegistry.ts` (all 54 listed; listed screens pre-exist).  
- Primitives: `VeilModal.tsx`, `VeilDrawer.tsx`.  

**Route Count & No New Routes:**  
`grep -c 'path: "/' src/v6/routing/routeRegistry.ts` → **54 entries**. Matches `V6_ROUTES.length` (includes `/login`). Conceptual 56 = 54 + overlays/auth (per 00-QA-OVERVIEW.md:17-18 and APP_MAP.md:273).  
- All target routes **pre-exist** in registry (lines 80-96): onboarding-v2-* (80-85), policy-lifecycle* (86,96), hubstaff(87), system-docs(88), help-center(89), governance(90), admin-*(91-95), surveyor(95).  
- `routePresentation.ts` and `router.tsx` (via registry) expose **only** these; no additions, no top-level subview routes (e.g. no `/onboarding-v2/batches/:batchId/gates`). Subviews are **embedded state only**.  
- Sidebar/nav (presentation) correctly limits top-levels. **Status: PASS (preserved).**

**Typography/Token Rules (300/500 only):**  
- Per TOKEN_REGISTRY.md:66 ("weights 300 & 500 ONLY. ... Weight 500 (`--weight-title`) permitted ONLY on: page titles / h1–h2, sidebar/nav labels, status/ToneBadge text. Everything else is 300").  
- Screens heavily use `text-h2 font-medium`, `text-h3 font-medium`, `text-sm text-secondary`, `text-xs text-muted`, `font-light` (explicit in AdminPermissions, Help etc.).  
- Veil* components use `font-medium` on titles (correct).  
- Components (DataTable, SurfaceCard, ToneTag, BoardLane): mix of `font-light` (headers/body) + `font-medium` (IDs/titles/status) — consistent.  
- **Violations flagged:**  
  - `<strong>` tags (browser default 700 weight) in:  
    - `src/v6/screens/pageviews/SurveyorViewerScreen.tsx:41-43,75-77` (multiple policy body/metadata)  
    - `src/v6/screens/pageviews/PolicyLifecycleDetailScreen.tsx:51-53` (draft preview)  
  - Non-title `font-medium` (borderline):  
    - `src/v6/screens/pageviews/OnboardingV2BatchScreen.tsx:90` (`gate.label` span), `131` (timeline label)  
    - Similar in AdminRoles/others on preview items (raw keys use `font-mono text-xs`).  
  - Dynamic inline style (non-token) in Governance (bar heights): `src/v6/screens/pageviews/GovernanceScreen.tsx:81` (`style={{ height: ... }}`).  
- **No raw hex/rgb/#[...] in any target screens** (grep across OnboardingV2*/Admin*/System* confirmed zero; all use `bg-surface`, `border-card`, `bg-tone-*-bg`, `text-tone-*-text`, `text-brand-teal` via config).  
- **Status:** Mostly compliant. Fix `<strong>` → semantic or `font-medium` spans. Enforce via designless check.

**VeilDrawer / VeilModal Usage (inside these screens):**  
- **None** in target OnboardingV2*, Admin*, System listed screens (broad grep + per-file grep returned zero `<Veil|useState.*(modal|drawer)` in globbed screens).  
- Veil* exist and exported (`src/v6/components/index.ts:9-10`; impl use portals, ToneBadge, `font-medium`, `max-w-modal-md`, focus-trap, `bg-brand-teal/15 backdrop-blur`).  
- Used elsewhere (not in scope): `AppendixFScreen.tsx:609`, `SupervisorScreen.tsx:602` (good precedent).  
- Specs (BLUEPRINTS:392, MISSING_LAYOUTS:50) mandate **VeilModal variant for Override Request Modal**; **none present**.  
- **Gaps:** Subviews (expander/modal/matrix/tabs) are **not** using the shared primitives yet.  

**Hardcoded Colors / Design Fidelity:**  
- No raw color literals in target .tsx.  
- Consistent use of V6 primitives: MetricGrid, DataTable, SurfaceCard, ToneTag, ToneBadge, Button, FormField, ProgressMeter.  
- Tokens: `bg-surface`, `border-card`, `shadow-rest/lift`, `text-ink`, tone-*, brand-teal via classes.  
- Matches high-level structure from `06-onboarding-v2.md` (metrics, tables left + cards rail, gate tiles, timeline).  
- Rich mock data (not placeholders): populated tables (e.g. 5+ rows), metrics (e.g. 47 activations), SurfaceCards with body/progress.  

**Per-Screen Status, Gaps vs Blueprints, Suggestions**

### Onboarding v2 Screens

1. **OnboardingV2DashboardScreen.tsx** (`/onboarding-v2/dashboard`, template dashboard)  
   - **Status:** Good structure/fidelity. Uses MetricGrid (5 metrics), DataTable (queue), SurfaceCard gate-like cards. Rich content, correct typography (`font-medium` on h2/h3), tokens.  
   - **Gaps vs blueprints (06-onboarding-v2.md:36-51, PHASE_12_2A:202):** Gate tiles are static SurfaceCard (no click-to-expander); no inline Gate Checklist Expander. Dashboard mentions gates but no subview hooks.  
   - **Veil usage:** None.  
   - **Suggestions:** Add gate tile onClick to open inline expander (reuse future GateChecklistExpander). Wire real onboardingV2Store data. Line cites: `src/v6/screens/pageviews/OnboardingV2DashboardScreen.tsx:126-149`.

2. **OnboardingV2ActivateScreen.tsx** (`/onboarding-v2/activate`, template detail)  
   - **Status:** Form-heavy (inputs, selects); uses FormField/Input/Select/Button/ToneBadge. Rich preview cards. Good fonts/tokens.  
   - **Gaps:** Not a focus for 12.2.a subviews (no gates/modal). Minor: icons use `text-brand-teal` directly.  
   - **Suggestions:** Ensure activation triggers feed batch detail. Cite: `src/v6/screens/pageviews/OnboardingV2ActivateScreen.tsx:52-86`.

3. **OnboardingV2BatchesScreen.tsx** (`/onboarding-v2/batches`, template matrix)  
   - **Status:** Strong matrix fidelity (MetricGrid + DataTable + SurfaceCards). Matches 06-onboarding-v2.md batch roster. Typography/tokens clean.  
   - **Gaps:** List only; no link to expander logic (detail has gates).  
   - **Suggestions:** Ensure row clicks navigate to batch with state for subviews. Cite: `src/v6/screens/pageviews/OnboardingV2BatchesScreen.tsx:93-117`.

4. **OnboardingV2BatchScreen.tsx** (`/onboarding-v2/batches/:batchId`, template detail; **CRITICAL**)  
   - **Status:** Has gate grid (5 tiles with icons + ToneBadge + labels), DataTable roster (gate cols), SurfaceCard progress, timeline (hash-chain). Rich populated data. Data attributes correct. Matches high-level "Subject roster, gate status..., audit timeline" (06-onboarding-v2.md:14, BLUEPRINTS:202).  
   - **Critical Gaps vs Phase 12.2.a specs (§9 Gate Checklist Expander, §10 Evidence/Signature Sub-tabs; MISSING_LAYOUTS:67-95):**  
     - Gate tiles: static `<div>` grid (`:83-94`); **no onClick**, **no inline accordion expander** below clicked tile. No GateChecklistExpander component. Expected: "Accordion folder container expanding directly below... Checklist rows table... status badge (PASS green / PENDING amber / FAILED orange)... Button to force rerun" (BLUEPRINTS:208-217).  
     - **No Evidence vs Signature sub-tabs anywhere.** Expected: "Segmented horizontal tab control: `Evidence File` and `Signature Log` (500 active / 300 inactive)... Tab1: PDF detail + preview + hash + Verify/Download; Tab2: vertical signer timeline + eCIgn token + attestation" (BLUEPRINTS:228-238; MISSING_LAYOUTS:85-94). Roster table shows gate strings but no unit detail panel with tabs.  
     - Timeline uses inline dot `bg-brand-teal` (`:129`) + `font-medium` on labels (`:131`).  
   - **Veil usage:** None (expander is "inline" per spec, not drawer).  
   - **Font/Colors:** `font-medium` on gate labels (potential over-use); no raw colors.  
   - **Placeholder vs Rich:** Rich (realistic SUB- IDs, dates, statuses).  
   - **Suggestions:** Implement clickable gates → local state `expandedGate` rendering inline checklist (use ToneBadge for PASS/PENDING/FAILED per spec). Add right-panel or below-roster unit selector + segmented tabs (Evidence/Signature) using conditional panels (no new routes). Add "Request Override" CTA that could feed governance modal. Extract shared GateChecklistExpander. Cite lines: `src/v6/screens/pageviews/OnboardingV2BatchScreen.tsx:76-95` (gates), `106` (roster), `124-136` (timeline).

5. **OnboardingV2AuditScreen.tsx** (`/onboarding-v2/audit`, template evidence)  
   - **Status:** DataTable + side panels with overrides snapshot + integrity. Uses tone-* classes. Rich hashes/data. Good fidelity to "hash-chain verification, ... overrides" (06-onboarding-v2.md).  
   - **Gaps:** No sub-tabs/expanders. Overrides shown statically (no trigger to governance).  
   - **Suggestions:** Link override rows to governance modal. Add preview toolbar if evidence files (per other blueprints). Cite: `src/v6/screens/pageviews/OnboardingV2AuditScreen.tsx:83-127`.

6. **OnboardingV2GovernanceScreen.tsx** (`/onboarding-v2/governance`, template reports; **CRITICAL for modal**)  
   - **Status:** Metrics + DataTable of overrides (OVR- IDs, subject/gate/reason/approvers). Side panels (alerts + constraints). Rich data. Matches "active overrides table" (APP_MAP:224). Typography/tokens good (tone-orange-bg etc.).  
   - **Gaps vs §11 Override Request Modal (BLUEPRINTS:242-260; MISSING_LAYOUTS:97-108):**  
     - **No "Request Override" button/CTA.**  
     - **No VeilModal** (spec: "Centered overlay modal (w-full max-w-[500px]) ... Header: `Request Compliance Override` (500,18px) orange border. Body: Target, Reason Dropdown (Credential Delay etc), Expiration, dual Approver selects, amber security banner, attestation checkbox. Footer: Issue Override (orange, disabled), Cancel (teal).").  
     - Table only; no modal state or trigger (even from batch).  
   - **Veil usage:** None.  
   - **Suggestions:** Add floating or header Button "Request Override" → `const [isOverrideOpen, set...] = useState(false);` + `<VeilModal open={isOverrideOpen} ... eyebrow="Override request" title="Request Compliance Override" tone="orange" maxWidthClass="max-w-[500px]">` with form controls matching spec exactly. Use existing primitives (Select, Checkbox via FormField, Button). Make triggerable from batch too. Cite: `src/v6/screens/pageviews/OnboardingV2GovernanceScreen.tsx:65-111` (current content), `82` (table).

### Admin Screens

7. **AdminGroupsScreen.tsx** (`/admin/user-groups`, matrix)  
   - **Status:** Excellent matrix fidelity (DataTable + summary tiles + preview cards with raw keys). Uses tone classes, font-medium on titles, font-light in places. Rich (7 groups, members).  
   - **Gaps:** Preview of permission keys (raw like `user.provision`) but **not** the user override matrix (that's in Users). Matches "placeholder matrix exists" note in APP_MAP.  
   - **Veil:** None needed here.  
   - **Suggestions:** Keep as-is for groups; link to Users matrix. Cite: `src/v6/screens/pageviews/AdminGroupsScreen.tsx:222-273` (previews).

8. **AdminRolesScreen.tsx** (`/admin/roles`, matrix)  
   - **Status:** Detailed role matrix + posture preview (raw keys table), scope reviews. Consistent tokens/typography. Rich.  
   - **Gaps:** Similar to groups; no override editing UI (spec targets Users page).  
   - **Suggestions:** Add "Edit Scopes" CTA per role row that could navigate or open matrix context in users. Cite: `src/v6/screens/pageviews/AdminRolesScreen.tsx:236-288`.

9. **AdminPermissionsScreen.tsx** (`/admin/permissions`, matrix)  
   - **Status:** Very rich catalog (64 perms table + roles-using + governance cards with meta). Explicit `font-light` usage (correct for body). References design assets. Good fidelity.  
   - **Gaps:** Catalog view; no *override* editing (per-user).  
   - **Suggestions:** Good base for matrix reference. Cite: `src/v6/screens/pageviews/AdminPermissionsScreen.tsx:299-331`.

10. **AdminUsersScreen.tsx** (`/admin/users`, matrix; **CRITICAL for Permission Override Matrix**)  
    - **Status:** Comprehensive: user matrix table (9 cols incl status), security summaries, MFA/assignment lanes, SurfaceCard with raw permission keys preview at end. Very rich populated data (96 users). Uses tokens well.  
    - **Gaps vs §12 Admin User Permission Override Matrix (BLUEPRINTS:266-281; MISSING_LAYOUTS:112-122; APP_MAP:230):**  
      - **No matrix UI.** Current has "Permission matrix preview" SurfaceCard with raw keys + badges (`:347-363`): `['Provisioning key', 'user.provision', ...]`.  
      - Expected: Context header (user name/email/role), Scope Table Grid (rows: Policy Management / Evidence Logs / eCIgn Forms / Supervisor Actions; columns: Scope Name, Inherited indicator, checkboxes Default/Force Grant/Force Revoke; amber highlight on overrides), Toolbar: "Save Matrix Overrides" (teal), "Restore Role Defaults".  
    - **Veil/Modal:** None (matrix may be inline or triggered by "Edit Scopes" CTA — currently absent).  
    - **Font:** Raw keys use `font-mono text-xs`. No <strong>.  
    - **Suggestions:** Add per-user "Edit Scopes" / "Override Permissions" button → local state or VeilDrawer showing the human-label matrix (use checkboxes from primitives). Highlight overrides amber (`bg-tone-amber-bg`). Store mock overrides. Replace raw preview. Cite lines: `src/v6/screens/pageviews/AdminUsersScreen.tsx:240` (main table), `335-364` (preview card needing replacement).

11. **SurveyorViewerScreen.tsx** (`/surveyor/policy/:policyId`, detail)  
    - **Status:** Read-only policy viewer + checklist + metadata. Rich sample content. Matches admin/surveyor use.  
    - **Gaps:** Uses `<strong>` (weight violation). Static.  
    - **Suggestions:** Replace `<strong>` with `<span className="font-medium">` or components. Add read-only badge enforcement. Cite: `src/v6/screens/pageviews/SurveyorViewerScreen.tsx:39-78`.

### System Screens

12. **PolicyLifecycleScreen.tsx** + **PolicyLifecycleDetailScreen.tsx** (`/policy-lifecycle*`, lifecycle)  
    - **Status:** Good: horizontal stage board, metrics, cards, detail with preview + audit log. Rich. Includes detail as required.  
    - **Gaps:** `<strong>` in detail preview. No subviews (lifecycle not 12.2.a focus). Inline style absent here.  
    - **Suggestions:** Fix `<strong>`. Cite: `src/v6/screens/pageviews/PolicyLifecycleScreen.tsx:82-95`, `PolicyLifecycleDetailScreen.tsx:49-54,66-84`.

13. **HubstaffScreen.tsx** (`/hubstaff`, reports)  
    - **Status:** Standard reports: metrics + DataTable logs + anomaly cards. Rich. Tokens/typography clean.  
    - **Gaps:** None specific to subviews.  
    - **Suggestions:** N/A (or link logs to evidence). Cite: `src/v6/screens/pageviews/HubstaffScreen.tsx:94-120`.

14. **SystemDocsScreen.tsx** (`/system-documentation/:sectionId`, docs)  
    - **Status:** Index table + search input + guide. Rich chapters.  
    - **Gaps:** Minor.  
    - **Suggestions:** N/A.

15. **HelpCenterScreen.tsx** (`/help/*`, docs)  
    - **Status:** Category cards + search + support. Rich. Good hover states.  
    - **Gaps:** None.  
    - **Suggestions:** N/A.

16. **GovernanceScreen.tsx** (`/governance`, reports; distinct from onboarding)  
    - **Status:** Metrics + bar chart (uses `toneBarClasses`), review cards. Rich.  
    - **Gaps:** Inline style for bars (`:81`). Uses `font-light` explicitly (good).  
    - **Suggestions:** Extract bar to component. Cite: `src/v6/screens/pageviews/GovernanceScreen.tsx:74-89`.

**Overall Gaps vs Blueprints (Phase 12.2.a):**  
- **Critical missing (4/4 for Onboarding v2 critical + Admin):** Gate Checklist Expander, Evidence/Signature Sub-tabs (batch), Override Request Modal (governance), Permission Override Matrix (admin-users).  
- Subviews remain "placeholder" in spec sense (tables present, interactive subviews absent). Matches pre-QA status in APP_MAP ("expander absent", "placeholder matrix").  
- No Veil* adoption in group (though primitives ready).  
- Typography 95%+ compliant; minor tag/weight + non-title font-medium.  
- No route pollution. Design tokens respected (no hardcodes). Content rich (not scaffold placeholders).  
- Embedded subviews do not alter 54-route count.

**Suggestions (Actionable):**  
1. Implement GateChecklistExpander as inline component (accordion below tiles) per exact BLUEPRINTS:207-218 layout; wire to batch gates.  
2. Add segmented tabs (Evidence File | Signature Log) inside batch detail right panel or below roster (use state + conditional render).  
3. Add VeilModal override form to governance + batch (exact fields/attestation from spec).  
4. Build inline PermissionMatrix for admin-users (scopes/groups + 3-state checkboxes + amber overrides).  
5. Replace all `<strong>` with `font-medium text-ink` spans. Audit `font-medium` usage strictly (only titles/nav/status).  
6. Centralize subview triggers (e.g. shared hook for override modal).  
7. Add `data-subview="gate-expander"` etc. for QA.  
8. Run `npm run build` + `npm run lint` + designless checks post-fix. Update QA12.b/ and APP_MAP when green.  
9. Consider shared components in `src/v6/components/` for GateChecklistExpander, PermissionMatrix (avoid duplication).  

**Files Inspected (with cites):**  
- Screens: `src/v6/screens/pageviews/{OnboardingV2*.tsx:1-155, OnboardingV2BatchScreen.tsx:46-141 (core), Admin*.tsx:178-416, SurveyorViewerScreen.tsx:5-84, *Lifecycle*.tsx, HubstaffScreen.tsx, SystemDocsScreen.tsx, HelpCenterScreen.tsx, GovernanceScreen.tsx}`  
- Routing: `src/v6/routing/routeRegistry.ts:43-98 (54 routes), routePresentation.ts`  
- Primitives: `src/v6/components/Veil*.tsx:16-61`, `index.ts`  
- Specs: `docs/v6/V6_PHASE_12_2A_MISSING_SUBVIEW_BLUEPRINTS.md:202`, `V6_MISSING_LAYOUTS_SPECIFICATION.md:67`, `V6_APP_MAP.md:222`, `V6_Final/06-onboarding-v2.md:14-163`, `QA12.b/00-QA-OVERVIEW.md`  
- Tokens: `src/v6/tokens.ts`, `V6_TOKEN_REGISTRY.md:4-100`  

**Final Status:** Routes preserved (PASS). Structure fidelity high. **Critical subviews (expander/tabs/modal/matrix) not implemented** → major gap vs 12.2.a blueprints. Typography nearly clean. Recommend priority implementation of 4 missing subviews using Veil* + tokens only before further work.  

**Report path (absolute):** `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2\docs\v6\V6_Final\QA12.b\03-onboarding-v2-admin-system-qa-report.md`  
(Also referenced 00-QA-OVERVIEW.md for context.)

*End of QA report.*