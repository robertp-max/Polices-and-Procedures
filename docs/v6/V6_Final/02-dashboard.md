# 02 - Dashboard (Primary Operations Command Center)

**View Registration:** `dashboard` (group: "Dashboard")
- Route: `/dashboard`
- Icon: `layout-dashboard`
- Template: `dashboard`
- Eyebrow: "Command Center"
- Description: "Primary operations command center for census pressure, staffing coverage, urgent tasks, and clinical risk."

**PNG Confirmation:** File exists at `Reference/V6/02-dashboard.png` (96,948 bytes, timestamp 2026-06-19). Static capture primarily shows the shared prototype shell (sidebar navigation, top search bar, CareIndeed logo, user "TP" avatar) with a Brad chat modal overlay visible in the read; dynamic UI content (metrics, cards, action queue) is rendered client-side via React-in-HTML in index.html.

## Layout & Structure
- **Overall App Shell:** 
  - Collapsible left sidebar (292px expanded; groups labeled "Dashboard", "Clinician Profiles", ..., "Compliance Execution (CES)", "Taxonomy", etc.). Active nav item uses `bg-[#004142] text-white`.
  - Main content area with `TopBar` (group badge + h2 title + description + icon buttons).
  - Special handling: Dashboard omits the generic metrics row above content (see `activeView.template !== 'dashboard'` guard).
- **DashboardPrototype render (lines ~4127-4201):**
  - Top row: `grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4` → 4 `MetricTile` components.
  - Main section: `grid grid-cols-1 gap-6 xl:grid-cols-5`
    - Left (xl:col-span-3): "Today in Primary Operations" panel (white card with border/shadow).
      - Header + orange ToneBadge count of action items.
      - List of action row cards (space-y-3).
    - Right (xl:col-span-2): Optional signals grid + up to 3 `SurfaceCard` components.

## Metrics (Top Tiles)
Defined in VIEW_GROUPS:
```js
metrics: [
  metric('Active census', '128', '36 recert windows open', 'teal'),
  metric('Visits today', '74', '6 need schedule attention', 'orange'),
  metric('Coverage', '92%', 'Weekend pool pending', 'green'),
  metric('High acuity', '17', 'CHF, wound, post-CVA', 'orange'),
]
```
- `MetricTile`: Colored tile backgrounds per `tones` (teal/orange/green), large value, small label + note.

## Action Queue / Work Items (Primary left panel)
Uses `primaryOpsActionRows` (or fallback):
- Each row: icon tile (tone-colored), title (teal-600), meta desc, right: `ToneBadge` (due date + owner below).
- **Progress bars:** `h-1.5 rounded-full bg-white` container; inner `h-1.5 rounded-full` using `tones[item.tone].bar` (width = progress %).
- Examples (teal/orange tones):
  - "Reassign SOC coverage for Elena Vargas" (orange, 64%)
  - "Close Robert Hale recert plan review" (teal, 82%)
  - "Resolve CHHA weekend coverage gap" (orange, 48%)
  - "Approve wound photo protocol evidence" (teal, 76%)

Default fallback actionRows also include QAPI/governing body items (orange/teal).

## Right Sidebar Content
- **Signals** (if present, e.g. `primaryOpsSignals`): 2-col grid of tone-colored mini cards.
  - Examples: ['SOC starts', '9', ..., 'orange'], ['High-acuity census', '17', ..., 'teal'], etc.
- **SurfaceCards** (from `cards` or sliced view):
  ```js
  cards: [
    card('Service continuity', '...', 'orange', 'route', 64),
    card('Clinical readiness', '...', 'teal', 'stethoscope', 82),
    card('Staff posture', '...', 'teal', 'users', 76),
  ]
  ```
  - SurfaceCard: Icon tile (tone bg), ToneBadge, bold title, body text, optional progress bar (h-2, teal/orange bar color).
  - Hover: `-translate-y-0.5 shadow-lift`.

## Status Colors (Teal / Orange Primary)
Defined in `tones` object (index.html ~129):
- **teal**: bg-brand-teal-50 / border-teal-100, dot/bar = bg-brand-teal-500, used for "ready", coverage, clinical items.
- **orange**: bg-brand-orange-50 / border-orange-100, dot/bar = bg-brand-orange-500, used for urgent actions, visits, high-acuity.
- Others: green (emerald), amber, slate (backlog), etc. for variety.
- `ToneBadge`: small pill with colored dot + uppercase text.
- Progress and status dots consistently use matching tone.

## Tables / Other
- **No traditional `<table>`** here (unlike Matrix/Profiles views which use `DataTable`).
- Focus on cards, metric tiles, inline progress bars, action rows.
- CTA buttons: "Open command", "Export snapshot" (configured).

## Key UI Elements Visible in Prototype
- Rounded-2xl cards, soft shadows (`shadow-soft`).
- Brand colors via Tailwind-like `brand-teal-*`, `brand-orange-*`, `brand-neutral-*`.
- Icons via lucide (injected).
- Responsive: stacks on small, 4-col metrics, 5-col main on xl.
- Progress is a recurring motif across dashboard cards and action items.

**Source Sections:** VIEW_GROUPS ~1076 (registration), primaryOpsActionRows ~251, primaryOpsSignals ~258, DashboardPrototype ~4127, MetricTile ~1875, SurfaceCard ~1885, renderTemplate ~4214, tones ~129, App/Shell ~4490+.
