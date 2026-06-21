# 15 - Modals, Drawers, Overlays, Popovers (modal-system / drawer-system / popover-system)

**View Registrations (Prototypes & Overlays group):**
- `modal-system` → Label: "Modal System", Route: `prototype://modal`, Icon: `panel-top-open`, Template: `overlays`
  - Description: 'Blocking policy/evidence review modals and confirmation dialogs. V3 veil glass, spotlight, orange primary on compliance workflows. States: idle/open/exiting.'
  - Metrics: Modal states (3: Review/confirm/override), Blocking (Yes: Policy gate), Glass (v3-veil: Spotlight shell)
  - Cards: Request Approval (orange), Form Signing (VeilModal lg + SignaturePad), Artifact Viewer (Spotlight locked PDF)
  - modalExamples provided for registration.
- `drawer-system` → Label: "Drawer System", Route: `prototype://drawer`, Icon: `panel-right-open`, Template: `overlays`
  - Description: 'Right drawer (md/lg) and bottom sheets for task detail, evidence, workflow execution. Responsive (VeilDrawer). Stacked layers for progressive disclosure. V3 glass + 0.7s ease.'
  - Metrics: Drawer depth (1-2), Responsive (Right/Bottom)
  - Cards: QAPI Workflow Drawer, Task + Evidence Drawer, Evidence Center
  - drawerExamples provided.
- `popover-system` → Label: "Popover and Menu System", Route: `prototype://popover`, Icon: `message-square-more`, Template: `overlays`
  - Description: 'Popover, command palette (search policies/tasks), toast notifications, hover cards with compliance context.'
  - Metrics: Command palette (Search), Toasts (Non-blocking)
  - Cards: Command palette

**PNG Confirmation:** File exists at `Reference/V6/15-modals-overlays.png` (96,948 bytes, LastWriteTime 2026-06-19 5:20:47 PM). Visual read shows the shared prototype shell (sidebar + top search bar + CareIndeed branding + "TP" avatar) with a prominent floating white rounded Brad AI assistant card/popover visible in the main content area (demonstrating popover/modal glass surface patterns in context of the overlays prototype section).

## Layout & Structure
- All three sub-views share the single `OverlayPrototype` renderer (registered under template 'overlays', dispatched in `renderTemplate`).
- Content area receives standard top metrics grid (from view.metrics) + header + the prototype body.
- **OverlayPrototype** (lines ~3237-3440) renders a catalog of visual examples using a grid of `OverlayPanel` wrappers:
  - 2-col: Centered Review Modal + Confirmation Dialog
  - 3-col: Right Drawer + Bottom Sheet + Popover and Inline Menu
  - 2-col: Command Palette + Toast Stack and Hover Card
- Examples are static previews (no live open/close state toggles); they embed simulated surfaces inside tinted containers.
- Real interactive overlays elsewhere:
  - `PersonalOpsDrawer` (aside right, 380px, bg-white + shadow-[-10px_0...] + z-20)
  - `CalendarHoverCard` (portal fixed z-50 with motion classes)
  - Toast state exists (timeout 3000) but visuals demonstrated statically.
- Sidebar always lists "Prototypes & Overlays" as final nav group.

## OverlayPrototype Examples (Detailed)
1. **Centered Review Modal**
   - Outer: `rounded-2xl border ... bg-brand-neutral-50 p-4`
   - Inner: `max-w-md rounded-2xl border ... bg-white p-6 shadow-lift`
   - Content: ToneBadge "Review required" (orange), heading, policy/meta grid (teal/orange tiles), primary orange "Request override" + quiet "Return" actions.
2. **Confirmation Dialog**
   - Tinted orange veil container + inner white panel.
   - Orange ToneBadge + semantic orange heading/text, full-width orange primary action.
3. **Right Drawer**
   - `ml-auto max-w-sm` aligned to simulate right side panel.
   - Task metadata list with check/circle icons, primary attach button.
4. **Bottom Sheet**
   - Simulated mobile: rounded-[28px] + grab handle bar (`h-1.5 w-12`) + inner action grid (Camera/Files/Sign).
5. **Popover and Inline Menu**
   - Relative wrapper + button trigger + absolute-style `w-64` menu card with icon + label rows (teal hover, orange intervention).
6. **Command Palette**
   - Search input + ESC badge + result rows (active teal highlight).
7. **Toast Stack and Hover Card**
   - 3 toast-like cards (dot + title/body) + hover preview tile with progress.

## UI Patterns Shown (Glass, Veil, Panels)

**Glass (Frosted / Translucent Surfaces):**
- Ubiquitous use of opacity variants on white: `bg-white/95`, `bg-white/80`, `bg-white/75`, `bg-white/70`, `bg-white/60`, `bg-white/40`.
- Combined with Tailwind `backdrop-blur-xl` (or lg/md) to produce modern glassmorphism.
- Borders frequently `border-white/95` or `border-brand-teal-100/50` + `border-brand-neutral-...`.
- Applied to: Sidebar (`bg-white/70 backdrop-blur-xl`), RightRail, hover cards (`bg-white/95 ... backdrop-blur-xl shadow-lift`), calendar boards, action buttons, toasts.
- Background shell itself uses subtle radial + linear gradients over `#F7FEFF` / `#F0FAFA` to support the effect.
- Shadow definitions (head script):
  - `shadow-soft: 0 10px 32px -18px rgba(0, 65, 66, 0.237)`
  - `shadow-lift: 0 18px 45px -24px rgba(0, 65, 66, 0.280)`

**Veil (Modal / Overlay Scrim + Tinted Containers):**
- Explicitly documented as "V3 veil glass" + "spotlight shell" in modal-system and drawer-system descriptions.
- In demo previews: outer wrapper divs provide the "veil" — `bg-brand-neutral-50` or `bg-brand-orange-100/50` (or `-50`) with padding/border, surrounding the crisp inner `bg-white` modal surface. Creates soft focused "spotlight" without hard black scrim (no `fixed inset-0` full veils implemented in current prototype code).
- Blocking intent noted in registrations: "Blocking", "Policy gate".
- Named components referenced conceptually: `VeilModal`, `VeilDrawer`.
- Transitions/ease referenced: "V3 glass + 0.7s ease".
- Orange semantic treatment reserved for warnings/overrides (not dark or red surfaces).
- Hover/popover surfaces also use glass but positioned (fixed z-50 portals) rather than full veil.

**Panels (Core Content Containers):**
- Consistent elevated panel primitive: `rounded-2xl border border-brand-neutral-200 bg-white p-5 shadow-soft` (or p-6, shadow-lift for emphasis).
- Used everywhere for cards, drawers, modals, palettes, toasts.
- `OverlayPanel` helper itself is this pattern + icon tile + title/subtitle header.
- Inner elements: `rounded-xl` sub-tiles (`bg-brand-neutral-50`, `bg-brand-teal-50`, `bg-brand-orange-50`), grid layouts for metadata.
- Buttons follow strict pattern:
  - Primary (action): `rounded-xl bg-brand-orange-500 ... text-white`
  - Secondary (quiet): `rounded-xl border border-brand-neutral-200 bg-white ... text-brand-teal-600`
- ToneBadge component for status: small pill + dot using brand tone maps.
- Responsive handling: `xl:grid-cols-*`, `max-w-sm`, `ml-auto` for drawer simulation; bottom sheets emphasize mobile affordances (handle).
- Progressive disclosure: stacked layers, dense info rows, icon+text list items.

**Additional Shared Traits:**
- All use brand palette (teal #00797D / #004142 dominant, orange #C74601 for interventions/risk).
- No visible scrollbars (global * { scrollbar-width: none }).
- Font: Roboto (headings 500, body light 300).
- Interactive hints: hover-lift, focus states on inputs/buttons, transition classes on fixed overlays.
- Z-layering: sidebar/panels low, popovers/hover z-50, drawers z-20.

## Screenshot Notes (Base 15-modals-overlays.png + Code)
- PNG capture emphasizes the prototype shell in context of overlays group (sidebar highlights "Prototypes & Overlays").
- Visible overlay demo: Brad welcome card (glass panel: white rounded surface, teal/orange accents, close X, pill buttons, footer actions) — representative of popover/modal glass pattern.
- No live veil scrim or JS-triggered modals/drawers visible in static PNG; previews live inside the rendered `OverlayPrototype` grid when that view is active.
- Demonstrates calm, card-forward, compliance-oriented aesthetic. Focus on legibility for high-stakes decisions (policy gates, evidence, signatures).
- Other overlays (toasts, palettes, bottom sheets) are represented only in source previews for this capture.

## Implementation Sources (index.html)
- View defs: ~1807-1849 (Prototypes & Overlays group)
- view() helper + metric/card factories: ~1027-1068
- OverlayPrototype + OverlayPanel: ~3220-3440
- renderTemplate switch: ~4237 (case 'overlays')
- Glass classes examples: sidebar ~4310, hover card ~2075 (fixed + backdrop-blur + portal), RightRail ~4256, various cards ~2311 etc.
- PersonalOpsDrawer (real drawer example): ~4407-4488
- Tones + shadows: ~129-150 (tones), ~45-48 (boxShadow)
- Prototype shell + styles: ~70-117 (head), ~4299 (AppShell)
- Brad/Chat related (overlay appearance in PNG): ~1197 (view), ~2626 (ChatPrototype), ~302 (seed messages)

**Actionable:** These patterns establish the "V3" overlay system vocabulary. Future iterations should implement live `VeilModal` / `VeilDrawer` wrappers with real `fixed inset-0` veil + backdrop + escape handlers + portal mounting for production fidelity. Use the catalog in OverlayPrototype as living spec.

(Generated from index.html analysis + PNG visual + V6 conventions.)