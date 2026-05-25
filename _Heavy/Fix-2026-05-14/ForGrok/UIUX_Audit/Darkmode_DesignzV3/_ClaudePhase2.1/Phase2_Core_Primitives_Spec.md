# Phase 2 — Core Primitives Specification

**Purpose:** Detailed contracts for the foundational React components that must be built first in Phase 2.  
**References:** 
- `V3_Veil_Drawer_Behavior_Spec.md`
- `V3_Veil_Glass_Theme_Tokens_Spec.md`
- Approved visual references in `_prototypes/_approved/`

---

## 1. VeilDrawer (Highest Priority Primitive)

**File suggestion:** `src/components/ui/VeilDrawer.tsx`

### Props

```ts
interface VeilDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;                    // e.g. "Event • Task 3 of 7"
  widthTier?: 'md' | 'lg' | 'xl';      // default 'lg'
  layer?: 1 | 2;                       // Controls yellow vs red content treatment
  children: React.ReactNode;
  onLayerTransition?: () => void;      // Called when moving 1 → 2
}
```

### Required Behavior (from Behavior Spec)

- Slides in from right
- When `layer` changes from 1 to 2:
  - Current drawer must fully animate out to the right first
  - New drawer (layer 2) then animates in from the right
- Rich V3 Veil Glass treatment (see theme spec)
- Backdrop scrim: `rgba(0,0,0,0.22)`
- Close methods: X, ESC, backdrop click (with small left-edge dead zone)
- Focus trap + restore
- Unmount when closed

### Visual Treatment

- Background: `--v3-veil-bg`
- Border + glow: `--v3-veil-border` + `--v3-veil-glow-teal`
- Left corners rounded (12–16px), right side flush
- Strong left-edge shadow
- Header with title + close button

### Internal Structure

```tsx
<VeilDrawer>
  <VeilDrawerHeader title="..." eyebrow="..." />
  
  <div className="veil-content">
    {children}   {/* Usually composed of VeilSection components */}
  </div>
</VeilDrawer>
```

---

## 2. VeilSection

**Purpose:** Collapsible content islands inside the Veil (Evidence, Signatures, Certification, Audit Trail, etc.)

```ts
interface VeilSectionProps {
  title: string;
  icon?: ReactNode;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}
```

**Visual**
- Slightly stronger glass than the main Veil (`blur(8-10px)`)
- Clean collapse chevron
- Count badge when applicable

---

## 3. TaskRowMinimal

**The atomic unit of all default list views.**

```ts
interface TaskRowMinimalProps {
  id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'blocked' | 'complete';
  dueDate?: string;
  owner?: { name: string; avatar?: string };
  onClick: () => void;           // Opens Veil Layer 1
  isSelected?: boolean;
}
```

**Visual Rules**
- Extremely sparse (max 5–6 visual elements)
- Generous padding (52–60px height)
- Clean border
- On hover: subtle lift + title color shift toward teal
- Click target is the entire row

**Yellow Highlight Rule**
- When this row appears *inside* Veil Layer 1, the title/description gets the soft yellow treatment (`--v3-text-yellow`)

---

## 4. EvidenceFolderRow

**Strict folder-only representation.**

```ts
interface EvidenceFolderRowProps {
  id: string;
  name: string;
  level: 'year' | 'event' | 'task' | 'form';
  completionPercent: number;     // Displayed large on the folder icon
  itemCount?: number;
  onDoubleClick: () => void;     // Opens next level or Veil
}
```

**Visual**
- Google Drive / Windows Explorer style folder icon
- Large percentage badge directly on or next to the folder
- No loose files visible at folder level
- Clean, minimal metadata

---

## 5. MainBorderedCard / AppShell

Enforces the single-card global shell rule.

**Key structural requirements**
- Hamburger top-left (inside card)
- Logo + Search (with live preview dropdown) top area
- Left nav collapsed by default, icons only
- Notification + Profile icons at bottom of nav
- All page content lives inside this bordered container

---

## 6. Supporting Atoms (Phase 2 Wave 1)

- `StatusPillV3` — compact, only teal/orange + neutral variants
- `MinimalHoverCard` — small glass or elevated card for quick facts
- `SearchPreviewDropdown` — dark subtle glass, max 6 results
- `ComplianceHeaderStrip` — STEP / SLA / RISK / AUDIT READINESS row + tabs + GENERATE TASK button

---

## 7. Animation Contracts

All motion must use tokens defined in the theme spec:

- Veil slide duration: 280–320ms
- Easing: `cubic-bezier(0.32, 0.72, 0, 1)`
- Layer transition: sequential (never overlapping glass)

---

## 8. State Management Recommendation

Create a small dedicated store (Zustand recommended):

```ts
interface VeilState {
  isOpen: boolean;
  currentLayer: 1 | 2;
  context: VeilContext | null;   // { type: 'calendar' | 'ces' | ..., id: string }
  openVeil: (context: VeilContext) => void;
  closeVeil: () => void;
  openLayerTwo: () => void;      // Triggers the sequential transition
}
```

This ensures the non-stacking rule is enforced at the data layer.

---

## 9. Testing & Fidelity Requirements

Every primitive must include:

1. Storybook / visual test stories for both dark and light
2. Comment block referencing the two V3 spec docs
3. Visual regression snapshots against the approved prototype references

---

**These primitives are the foundation.**  
Once they exist and pass the Phase 2 exit gate, the rest of the application can be built at high speed with extremely low risk of visual or behavioral drift.