# 01-main-shell.png — Main Shell / Dashboard Entry Point

**File confirmed:** Exists at `Reference/V6/01-main-shell.png` (initial load of http://localhost:5173/index.html).

## Layout & Structure (from index.html shell + view code)
- **Full prototype-shell wrapper**: `min-h-screen`, light teal-tinted background (`#EEF9F9` body; `.prototype-shell` uses radial gradients + `#F7FEFF` / `#F0FAFA`).
- **Left sidebar nav** (`.bg-white/70 backdrop-blur-xl`, `border-r border-[#004142]/10`, sticky, 292px wide or collapsed 88px):
  - Top: CareIndeed logo (or mark when collapsed) + collapse toggle button.
  - View count badge ("X Views").
  - Filter search input ("Filter views...").
  - Grouped nav sections (uppercase small labels, icon + label buttons):
    - Dashboard / Primary Operations items (Dashboard active by default).
    - Clinician / Patient Profiles.
    - Calendar.
    - Brad.
    - Compliance Execution (CES).
    - Taxonomy.
    - Onboarding / Onboarding v2.
    - Policy Lifecycle, Hubstaff, System Documentation.
    - **Admin**.
    - **Prototypes & Overlays** (focus area: Modal System, Drawer System, Popover and Menu System — uses `prototype://` routes + 'overlays' template).
  - Active nav item: `bg-[#004142] text-white` (dark teal); others `hover:bg-brand-teal-50`.
- **Main content area** (`flex-1`, scrollable):
  - TopBar / PageHeader (unless swimlane): teal `ToneBadge` for group, large heading, description paragraph.
  - For default **Dashboard** (id='dashboard', template='dashboard', group='Dashboard'):
    - Special-cased: **no** top metric grid in header (metrics rendered inside prototype).
    - **DashboardPrototype** content:
      - Row of **4 MetricTiles** (rounded-2xl, colored borders/bg per tone, large value, label + note):
        - Active census: 128 (teal) — "36 recert windows open"
        - Visits today: 74 (orange) — "6 need schedule attention"
        - Coverage: 92% (green) — "Weekend pool pending"
        - High acuity: 17 (orange) — "CHF, wound, post-CVA"
      - Split grid (xl: 3/2 cols):
        - Left: Action/work queue card ("Today in Primary Operations" or equiv; from `primaryOpsActionRows`): 4 rows with icon tile, title, meta text, owner, ToneBadge due date (orange/teal), progress bar fill.
          Visible example rows (seeded): "Reassign SOC coverage...", "Close Robert Hale recert...", "Resolve CHHA weekend...", "Approve wound photo...".
        - Right: Signals tiles (if present: SOC starts 9, High-acuity census 17, etc.) + 2–3 **SurfaceCards** (white, rounded-2xl, soft shadow, icon in colored tile, ToneBadge, title, body, optional progress):
          - Service continuity, Clinical readiness, Staff posture (per dashboard view config).
  - Font: Roboto (light 300 base, 500 for headings), no visible scrollbars.
- **Prototypes & Overlays** emphasis in sidebar (last group): highlights overlay prototypes (modals, drawers, popovers) with glass/veil styles, separate from core dashboard entry.

## Colors & Styling
- Brand teal: `#06A6AB` (400), `#00797D` (500), `#004142` (dark/600).
- Accent orange: `#E56E2E` (400) for actions/risk.
- Neutrals: white cards, `#FAF8F8` / `#F3F0EF` borders, text `#524D4B` / `#004142`.
- Effects: `shadow-soft`, `hover-lift`, rounded-2xl / xl, backdrop blur on shell/sidebar.

## Screenshot Notes (inferred + visual)
- Shows full entry shell on load (sidebar + dashboard view active by default via `getInitialViewId()` fallback + hash).
- Sidebar fully lists "Prototypes & Overlays" group for quick nav to overlay demos.
- Visible data: metric KPIs, action queue cards with progress, SurfaceCards.
- Clean, calm compliance dashboard aesthetic — light, card-heavy, progress + tone badges dominant.
- (Capture may surface Brad welcome card overlay on main area depending on state/personal panel.)

**Actionable:** Use as baseline for all V6 redesign shots. Next shots (02-dashboard.png etc.) drill into specific views.

(Generated from index.html view registrations ~lines 1072-1850, shell/App ~4298-4606, DashboardPrototype ~4127-4201, styles head ~57-117.)