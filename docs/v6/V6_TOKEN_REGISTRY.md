# V6 Token Registry — Canonical (Implementation-Ready)

> **Status:** Token architecture / specification **only**. This is documentation. It does **not**
> modify `src/index.css`, `tailwind.config.js`, components, routes, or the original repo. GPT
> implements it during **V6-0** (handoff at the end of this doc).
>
> **Authority:** Conforms to `V6_DESIGN_VISUALIZATION.md` §4/§8 (canonical design-system authority),
> `V6_IMPLEMENTATION_PLAN.md` (build order/gates — authoritative), and the audit's canonical
> contracts. Values are distilled from the V6 prototype/reference, not invented; placeholder slots
> the spec left "tokenized when first used" (blue/violet/red tones, chart, z-index, breakpoints,
> density, focus) are filled here with consistent on-palette light-mode values.
>
> **One token home:** `src/index.css` (CSS custom properties). `tailwind.config.js` `theme.extend`
> **references** those vars. There is **no** second source (`src/v6/theme/tokens.css` is deleted).
> Hex literals live **only** in this registry / `src/index.css`. Components consume tokens — never raw hex.

---

## 0. Token rules (gate-enforced)

1. **No raw hex / arbitrary values in components** (`bg-[#..]`, `text-[#..]`, `duration-[..]`, off-scale radii).
2. **No stock-Tailwind palette classes for semantic state** (`emerald-/amber-/slate-/violet-/blue-/red-/gray-`). Use tone tokens.
3. **Tone = text + glyph, never color alone.** Status flows through the typed `STATUS→TONE→LABEL` map (§17), never a substring regex; unknown → `slate` + dev warning.
4. **Typography LOCK** (§2): Roboto only, weights **300 & 500** — nothing else.
5. **No CDNs** — Roboto + Lucide + logo are self-hosted; tokens never reference remote URLs.
6. The upgraded gate (`scripts/check-designless.mjs`) enforces 2/4/5 on active source + `dist/`.

---

## 1. Brand & core color

| Token | Value | Use |
|---|---|---|
| `--brand-teal` | `#00797D` | Primary brand; active-nav background (with `--text-on-brand`), links, teal-tone text |
| `--brand-teal-deep` | `#004142` | Border/shadow base (`rgba(0,65,66,*)`), hover-dark, deep accents |
| `--brand-orange` | `#C74601` | Attention/CTA accent (reserved — not decorative) |
| `--ecign-navy` | `#1A3778` | **eCIgn palette exception** — eCIgn signing surfaces only (still obeys weight 300/500) |
| `--ecign-orange` | `#F04B22` | eCIgn accent (eCIgn surfaces only) |

### Surfaces
| Token | Value | Use |
|---|---|---|
| `--surface-canvas` | `#F7FEFF` | Page background (pale, light-teal cast) |
| `--surface-base` | `#FFFFFF` | Cards / containers / work surfaces |
| `--surface-glass` | `rgba(255,255,255,0.70)` | Sidebar / glass panels (`backdrop-blur-xl`) |
| `--surface-hover-teal` | `#F7FEFF` | Teal-50 nav/row hover surface |

### Text hierarchy (hierarchy via size/color/opacity — never weight)
| Token | Value | Use |
|---|---|---|
| `--text-primary` | `#1C2422` | Body-strong, page titles |
| `--text-secondary` | `#524D4B` | Descriptions, secondary copy |
| `--text-muted` | `#8A8583` | Metadata, captions, timestamps |
| `--text-disabled` | `#B8B3B1` | Disabled |
| `--text-on-brand` | `#FFFFFF` | Text on `--brand-teal` (active nav, primary button) |

### Borders
| Token | Value | Use |
|---|---|---|
| `--border-hairline` | `rgba(0,65,66,0.10)` | Hairline dividers, sidebar edge |
| `--border-card` | `#E5E4E3` | Card edge `1px solid` |
| `--border-strong` | `rgba(0,65,66,0.18)` | Emphasis dividers |

---

## 2. Typography (LOCKED — Roboto 300 & 500 only)

- **Family:** `Roboto`, self-hosted `woff2`, **weights 300 and 500 ONLY**. No 400, **no 700**. No Inter, no Montserrat, no CDN.
- **Weight 500 (`--weight-title`) permitted ONLY on:** page titles / `h1`–`h2`, sidebar/nav labels, status/`ToneBadge` text.
- **Everything else is 300 (`--weight-body`):** body, tables, KPI numbers, card titles, subheadings (incl `h3`+), chips, fields, helper text.
- Hierarchy comes from **size / color / opacity / spacing / casing** — never heavier weight. The prototype's ~236 bold usages are a defect; reproduce their look via the size ramp.

| Token | Value | Weight |
|---|---|---|
| `--font-family` | `'Roboto', system-ui, sans-serif` | — |
| `--weight-body` | `300` | body / everything |
| `--weight-title` | `500` | page titles, nav labels, tone/status text only |
| `--text-display` | `24px` / line-height `1.25` | h1 page title (weight 500) |
| `--text-h2` | `20px` / `1.3` | section header (weight 500) |
| `--text-h3` | `16px` / `1.4` | subheading (**weight 300** — size, not weight) |
| `--text-body` | `14px` / `1.5` | body (300) |
| `--text-sm` | `13px` / `1.45` | secondary (300) |
| `--text-xs` | `12px` / `1.4` | meta/caption (300) |
| `--text-tag` | `11px` uppercase | ToneBadge tag (weight 500) |
| `--tracking-tag` | `0.06em` | uppercase tags/labels |
| `--tracking-normal` | `0` | default |

---

## 3. Canonical 8-tone set (semantics fixed; no screen invents a tone)

Each tone ships `bg / border / text / dot / bar`. `dot`/`bar` default to the tone's `text` value.

| Tone | Semantics | `--tone-*-bg` | `--tone-*-border` | `--tone-*-text` (= dot/bar) |
|---|---|---|---|---|
| **teal** | ready / complete | `#F7FEFF` | `#C4F4F5` | `#00797D` |
| **orange** | attention / blocked | `#FFFAF7` | `#FFD5BF` | `#C74601` |
| **green** | pass / certified | `#E6F4ED` | `#A3D9B8` | `#006B3A` |
| **amber** | awaiting / pending | `#FFF8E6` | `#F0D9A3` | `#8A5C00` |
| **slate** | upcoming / backlog · **unknown fallback** | `#FAF8F8` | `#F3F0EF` | `#524D4B` |
| **blue** | informational | `#EAF2FB` | `#BBD6F2` | `#1A4E8A` |
| **violet** | special / review | `#F1ECFB` | `#D6C6F0` | `#5B3A9B` |
| **red** | destructive / error | `#FCEBEA` | `#F2C4C0` | `#B3261E` |

---

## 4. Chart / dataviz (replaces ~40 raw hexes in the CES board)

| Token | Value |
|---|---|
| `--chart-grid` | `rgba(0,65,66,0.08)` |
| `--chart-axis` | `#8A8583` |
| `--chart-teal` | `#00797D` |
| `--chart-orange` | `#C74601` |
| `--chart-green` | `#006B3A` |
| `--chart-amber` | `#8A5C00` |
| `--chart-blue` | `#1A4E8A` |
| `--chart-violet` | `#5B3A9B` |

Series order: `teal → orange → green → amber → blue → violet`.

---

## 5. Spacing scale
`--space-xs 4` · `--space-sm 8` · `--space-md 12` · `--space-lg 16` · `--space-xl 20` · `--space-2xl 24` · `--space-3xl 32` (px).

## 6. Radius (only these)
`--radius-sm 8` · `--radius-md 12` · `--radius-lg 16` · `--radius-xl 24` · `--radius-2xl 32` (px). Off-scale radii are banned.

## 7. Shadows (exactly two)
- `--shadow-rest`: `0 8px 24px -16px rgba(0,65,66,0.10), 0 3px 10px -5px rgba(0,65,66,0.05)`
- `--shadow-hover`: `0 14px 36px -20px rgba(0,65,66,0.14), 0 8px 20px -12px rgba(0,65,66,0.08)`

Arbitrary `box-shadow` in screens is banned.

## 8. Motion (one language; no raw ms / cubic-beziers in screens)
| Token | Value | Use |
|---|---|---|
| `--motion-fast` | `120ms` | hover / press / tab / row |
| `--motion-base` | `200ms` | cards / popovers / toasts / route content |
| `--motion-slow` | `280ms` | drawers / sidebar width / bottom-sheet |
| `--ease-standard` | `cubic-bezier(0.2,0.8,0.2,1)` | enter / move |
| `--ease-exit` | `cubic-bezier(0.4,0,1,1)` | leave |
| `--duration-toast` | `3000ms` | toast lifetime (single value) |
| `--press-scale` | `0.98` | one press-scale token |
| `--hover-lift` | `-2px` | elevatable cards only (never active nav / full-width panels) |

**Ceiling:** no enter/exit > 300ms. **Reduced motion (mandatory):** global
`@media (prefers-reduced-motion: reduce)` collapses durations to `0.01ms` and sets `animation: none`.

## 9. Z-index
`--z-base 0` · `--z-dropdown 1000` · `--z-sticky 1100` · `--z-shell 1100` · `--z-backdrop 1200` · `--z-drawer 1300` · `--z-modal 1400` · `--z-popover 1500` · `--z-toast 1600` · `--z-command 1700`.

## 10. Breakpoints & shell dimensions
| Token | Value | |
|---|---|---|
| `--bp-narrow` | `360px` | narrow mobile |
| `--bp-mobile` | `480px` | mobile |
| `--bp-tablet-p` | `640px` | tablet portrait |
| `--bp-tablet-l` | `768px` | tablet landscape |
| `--bp-laptop` | `1024px` | laptop |
| `--bp-desktop` | `1280px` | desktop |
| `--bp-large` | `1536px` | large desktop |
| `--sidebar-w` | `292px` | expanded sidebar |
| `--sidebar-collapsed` | `88px` | collapsed sidebar |
| `--topbar-h` | `64px` | topbar |
| `--content-max` | `1440px` | content max-width |
| `--drawer-w` | `480px` | right drawer |
| `--modal-w-sm / md / lg` | `420 / 640 / 880px` | modal widths |

## 11. Icon ramp (lucide-react only)
`--icon-xs 14` · `--icon-sm 16` (default) · `--icon-md 20` · `--icon-lg 24` · `--icon-xl 32` (px).

## 12. Density & targets
`--row-h 44px` · `--row-h-compact 36px` · `--control-h 40px` · `--tap-min 44px` (a11y minimum target).

## 13. Focus ring (visible, token-driven)
`--focus-ring-color #00797D` · `--focus-ring: 0 0 0 2px #FFFFFF, 0 0 0 4px var(--focus-ring-color)` (apply on `:focus-visible`).

---

## 14. Component → token mapping (14-family catalog)

| Component | Consumes |
|---|---|
| **AppShell** | `--surface-canvas`, `--content-max`, `--z-shell` |
| **Sidebar** | `--surface-glass`, `--sidebar-w`/`--sidebar-collapsed`, `--border-hairline`, `--brand-teal` (active), `--surface-hover-teal`, `--motion-slow` (width), `--weight-title` (labels) |
| **Topbar / PageHeader** | `--topbar-h`, `--text-display` (single `h1`, 500), `--text-body` (description, 300), `--space-*` |
| **Button** | `--brand-teal`/`--text-on-brand` (primary), teal outline (secondary), ghost (tertiary); `--brand-orange` (attention only); `--radius-md`, `--control-h`, `--motion-fast`, `--press-scale`, `--focus-ring` |
| **Input / Select** | `--surface-base`, `--border-card`, `--radius-md`, `--control-h`, `--text-body`, `--focus-ring` |
| **Badge / ToneBadge** | tone `bg/border/text/dot`, `--text-tag` + `--tracking-tag` (weight 500), text+glyph |
| **MetricTile** | `--text-display` (number via size, weight 300), `--text-xs` (label), tone border, `--shadow-rest` |
| **SurfaceCard** | `--surface-base`, `--border-card`, `--radius-lg`, `--shadow-rest`/`--shadow-hover`, `--hover-lift`, `--space-*` |
| **DataTable** | semantic `<table>`; `--row-h`, `--border-hairline`, `--text-body`, status via tone text+glyph |
| **BoardLane** | column-config param; `--surface-base`, `--radius-lg`, tone accents, `--space-*` |
| **VeilModal** | `--z-modal`/`--z-backdrop`, `--modal-w-*`, `--radius-xl`, `--shadow-hover`, fade+scale `0.98→1` `--motion-base` |
| **VeilDrawer** | `--z-drawer`, `--drawer-w`, slide `--motion-slow`/`--ease-standard` in, `--motion-base`/`--ease-exit` out |
| **CommandPalette** | `--z-command`, fade+`translateY(4px)` `--motion-fast`, `--surface-base`, `--radius-lg` |
| **ChatThread / ProgressMeter / ChecklistTable** | `--surface-base`, tones, `--text-body`, `--space-*`, `--radius-md` |

---

## 15. `src/index.css` — ready-to-implement (V6-0 authors this; replaces the 13-line stub)

```css
/* V6 token registry — single source of truth. Light mode. */
@font-face { font-family:'Roboto'; font-weight:300; font-style:normal; font-display:swap;
  src:url('/src/assets/fonts/roboto-light.woff2') format('woff2'); }
@font-face { font-family:'Roboto'; font-weight:500; font-style:normal; font-display:swap;
  src:url('/src/assets/fonts/roboto-medium.woff2') format('woff2'); }

:root {
  /* brand */
  --brand-teal:#00797D; --brand-teal-deep:#004142; --brand-orange:#C74601;
  --ecign-navy:#1A3778; --ecign-orange:#F04B22;
  /* surface */
  --surface-canvas:#F7FEFF; --surface-base:#FFFFFF; --surface-glass:rgba(255,255,255,0.70);
  --surface-hover-teal:#F7FEFF;
  /* text */
  --text-primary:#1C2422; --text-secondary:#524D4B; --text-muted:#8A8583;
  --text-disabled:#B8B3B1; --text-on-brand:#FFFFFF;
  /* border */
  --border-hairline:rgba(0,65,66,0.10); --border-card:#E5E4E3; --border-strong:rgba(0,65,66,0.18);
  /* tones: bg / border / text(=dot=bar) */
  --tone-teal-bg:#F7FEFF;   --tone-teal-border:#C4F4F5;   --tone-teal-text:#00797D;
  --tone-orange-bg:#FFFAF7; --tone-orange-border:#FFD5BF; --tone-orange-text:#C74601;
  --tone-green-bg:#E6F4ED;  --tone-green-border:#A3D9B8;  --tone-green-text:#006B3A;
  --tone-amber-bg:#FFF8E6;  --tone-amber-border:#F0D9A3;  --tone-amber-text:#8A5C00;
  --tone-slate-bg:#FAF8F8;  --tone-slate-border:#F3F0EF;  --tone-slate-text:#524D4B;
  --tone-blue-bg:#EAF2FB;   --tone-blue-border:#BBD6F2;   --tone-blue-text:#1A4E8A;
  --tone-violet-bg:#F1ECFB; --tone-violet-border:#D6C6F0; --tone-violet-text:#5B3A9B;
  --tone-red-bg:#FCEBEA;    --tone-red-border:#F2C4C0;    --tone-red-text:#B3261E;
  /* chart */
  --chart-grid:rgba(0,65,66,0.08); --chart-axis:#8A8583;
  --chart-teal:#00797D; --chart-orange:#C74601; --chart-green:#006B3A;
  --chart-amber:#8A5C00; --chart-blue:#1A4E8A; --chart-violet:#5B3A9B;
  /* typography */
  --font-family:'Roboto',system-ui,sans-serif; --weight-body:300; --weight-title:500;
  --text-display:24px; --text-h2:20px; --text-h3:16px; --text-body:14px;
  --text-sm:13px; --text-xs:12px; --text-tag:11px;
  --tracking-tag:0.06em; --tracking-normal:0;
  /* spacing */
  --space-xs:4px; --space-sm:8px; --space-md:12px; --space-lg:16px;
  --space-xl:20px; --space-2xl:24px; --space-3xl:32px;
  /* radius */
  --radius-sm:8px; --radius-md:12px; --radius-lg:16px; --radius-xl:24px; --radius-2xl:32px;
  /* shadow */
  --shadow-rest:0 8px 24px -16px rgba(0,65,66,0.10),0 3px 10px -5px rgba(0,65,66,0.05);
  --shadow-hover:0 14px 36px -20px rgba(0,65,66,0.14),0 8px 20px -12px rgba(0,65,66,0.08);
  /* motion */
  --motion-fast:120ms; --motion-base:200ms; --motion-slow:280ms;
  --ease-standard:cubic-bezier(0.2,0.8,0.2,1); --ease-exit:cubic-bezier(0.4,0,1,1);
  --duration-toast:3000ms; --press-scale:0.98; --hover-lift:-2px;
  /* z-index */
  --z-base:0; --z-dropdown:1000; --z-sticky:1100; --z-shell:1100; --z-backdrop:1200;
  --z-drawer:1300; --z-modal:1400; --z-popover:1500; --z-toast:1600; --z-command:1700;
  /* shell dims */
  --sidebar-w:292px; --sidebar-collapsed:88px; --topbar-h:64px; --content-max:1440px;
  --drawer-w:480px; --modal-w-sm:420px; --modal-w-md:640px; --modal-w-lg:880px;
  /* icon ramp */
  --icon-xs:14px; --icon-sm:16px; --icon-md:20px; --icon-lg:24px; --icon-xl:32px;
  /* density / targets */
  --row-h:44px; --row-h-compact:36px; --control-h:40px; --tap-min:44px;
  /* focus */
  --focus-ring-color:#00797D; --focus-ring:0 0 0 2px #FFFFFF,0 0 0 4px var(--focus-ring-color);
}

html,body,#root{margin:0;min-height:100vh;background:var(--surface-canvas);
  color:var(--text-primary);font-family:var(--font-family);font-weight:var(--weight-body);}
:focus-visible{outline:none;box-shadow:var(--focus-ring);}

@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;
    transition-duration:.01ms!important;scroll-behavior:auto!important;}
}

@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 16. `tailwind.config.js` `theme.extend` — ready-to-implement

```js
/** V6 — references the CSS vars in src/index.css. No hex here. */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-family)'] },
      fontWeight: { light: '300', medium: '500' }, // only two
      colors: {
        canvas:'var(--surface-canvas)', surface:'var(--surface-base)',
        'brand-teal':'var(--brand-teal)', 'brand-teal-deep':'var(--brand-teal-deep)',
        'brand-orange':'var(--brand-orange)',
        'ecign-navy':'var(--ecign-navy)', 'ecign-orange':'var(--ecign-orange)',
        ink:'var(--text-primary)', muted:'var(--text-muted)', 'on-brand':'var(--text-on-brand)',
        tone:{
          'teal-bg':'var(--tone-teal-bg)','teal-border':'var(--tone-teal-border)','teal-text':'var(--tone-teal-text)',
          'orange-bg':'var(--tone-orange-bg)','orange-border':'var(--tone-orange-border)','orange-text':'var(--tone-orange-text)',
          'green-bg':'var(--tone-green-bg)','green-border':'var(--tone-green-border)','green-text':'var(--tone-green-text)',
          'amber-bg':'var(--tone-amber-bg)','amber-border':'var(--tone-amber-border)','amber-text':'var(--tone-amber-text)',
          'slate-bg':'var(--tone-slate-bg)','slate-border':'var(--tone-slate-border)','slate-text':'var(--tone-slate-text)',
          'blue-bg':'var(--tone-blue-bg)','blue-border':'var(--tone-blue-border)','blue-text':'var(--tone-blue-text)',
          'violet-bg':'var(--tone-violet-bg)','violet-border':'var(--tone-violet-border)','violet-text':'var(--tone-violet-text)',
          'red-bg':'var(--tone-red-bg)','red-border':'var(--tone-red-border)','red-text':'var(--tone-red-text)',
        },
      },
      borderColor:{ card:'var(--border-card)', hairline:'var(--border-hairline)', strong:'var(--border-strong)' },
      spacing:{ xs:'var(--space-xs)',sm:'var(--space-sm)',md:'var(--space-md)',lg:'var(--space-lg)',
        xl:'var(--space-xl)','2xl':'var(--space-2xl)','3xl':'var(--space-3xl)' },
      borderRadius:{ sm:'var(--radius-sm)',md:'var(--radius-md)',lg:'var(--radius-lg)',
        xl:'var(--radius-xl)','2xl':'var(--radius-2xl)' },
      boxShadow:{ rest:'var(--shadow-rest)', hover:'var(--shadow-hover)', focus:'var(--focus-ring)' },
      fontSize:{ display:'var(--text-display)', h2:'var(--text-h2)', h3:'var(--text-h3)',
        body:'var(--text-body)', sm:'var(--text-sm)', xs:'var(--text-xs)', tag:'var(--text-tag)' },
      transitionTimingFunction:{ standard:'var(--ease-standard)', exit:'var(--ease-exit)' },
      transitionDuration:{ fast:'var(--motion-fast)', base:'var(--motion-base)', slow:'var(--motion-slow)' },
      zIndex:{ dropdown:'1000', shell:'1100', backdrop:'1200', drawer:'1300',
        modal:'1400', popover:'1500', toast:'1600', command:'1700' },
      screens:{ narrow:'360px', mobile:'480px', 'tablet-p':'640px', 'tablet-l':'768px',
        laptop:'1024px', desktop:'1280px', large:'1536px' },
      width:{ sidebar:'var(--sidebar-w)', 'sidebar-collapsed':'var(--sidebar-collapsed)', drawer:'var(--drawer-w)' },
      height:{ topbar:'var(--topbar-h)', row:'var(--row-h)', control:'var(--control-h)' },
      maxWidth:{ content:'var(--content-max)' },
    },
  },
  plugins: [],
}
```

---

## 17. TypeScript token maps — ready-to-implement (`src/v6/tokens.ts` + `statusTone.ts`)

```ts
// src/v6/tokens.ts — typed access for TS consumers (values mirror src/index.css vars).
export const TONES = ['teal','orange','green','amber','slate','blue','violet','red'] as const;
export type Tone = typeof TONES[number];

export const MOTION = { fast:'var(--motion-fast)', base:'var(--motion-base)', slow:'var(--motion-slow)',
  easeStandard:'var(--ease-standard)', easeExit:'var(--ease-exit)', toast:3000, pressScale:0.98 } as const;

export const RADIUS = { sm:8, md:12, lg:16, xl:24, '2xl':32 } as const;
export const SPACE  = { xs:4, sm:8, md:12, lg:16, xl:20, '2xl':24, '3xl':32 } as const;
export const SHELL  = { sidebar:292, sidebarCollapsed:88, topbar:64, drawer:480, contentMax:1440 } as const;
export const ICON   = { xs:14, sm:16, md:20, lg:24, xl:32 } as const;
```

```ts
// src/v6/statusTone.ts — the ONLY status→tone source. No substring regex.
import type { Tone } from './tokens';

interface ToneEntry { tone: Tone; label: string }

// Extend as real statuses are wired (Stage B). Keys are canonical status codes.
export const STATUS_TONE: Record<string, ToneEntry> = {
  ready:        { tone:'teal',   label:'Ready' },
  complete:     { tone:'teal',   label:'Complete' },
  blocked:      { tone:'orange', label:'Blocked' },
  attention:    { tone:'orange', label:'Needs Attention' },
  passed:       { tone:'green',  label:'Passed' },
  certified:    { tone:'green',  label:'Certified' },
  pending:      { tone:'amber',  label:'Pending' },
  awaiting:     { tone:'amber',  label:'Awaiting' },
  upcoming:     { tone:'slate',  label:'Upcoming' },
  backlog:      { tone:'slate',  label:'Backlog' },
  info:         { tone:'blue',   label:'Info' },
  review:       { tone:'violet', label:'In Review' },
  error:        { tone:'red',    label:'Error' },
};

export function resolveStatus(status: string): ToneEntry {
  const hit = STATUS_TONE[status?.toLowerCase?.()];
  if (hit) return hit;
  if (import.meta.env?.DEV) console.warn(`[statusTone] unknown status "${status}" → slate fallback`);
  return { tone:'slate', label: status ?? 'Unknown' }; // unknown → slate + dev warning
}
```

---

## 18. GPT IMPLEMENTATION HANDOFF — V6-0 (token foundation)

**Do this in order. Each step gate-green before the next. No screens, no logic reconnection.**

| # | File to update/create | Action | Owner |
|---|---|---|---|
| 1 | `src/assets/fonts/roboto-light.woff2`, `roboto-medium.woff2` | Self-host Roboto **300 & 500** (no other weights, no CDN). | Codex |
| 2 | `src/index.css` | Replace the 13-line stub with the full §15 block (`@font-face` + `:root` registry + base + `:focus-visible` + reduced-motion). Keep `@tailwind` directives. | Claude (token registry author) |
| 3 | `tailwind.config.js` | Replace `theme.extend` with §16 (references CSS vars; two font weights only; no hex). | Claude |
| 4 | `src/v6/tokens.ts` | Create from §17 (typed token mirrors). | Composer |
| 5 | `src/v6/statusTone.ts` | Create from §17 (typed `STATUS→TONE→LABEL`, unknown→slate+warn). | Composer |
| 6 | `index.html` | Confirm no Google-Fonts/CDN links; `<title>` neutral; no theme script. (Already clean — verify only.) | Codex |

**Acceptance checks (all must pass before V6-1 shell):**
1. `npm run verify:designless` → build green **and** gate `✅` (no banned fonts/weights, no CDN, no legacy, no stale `.js`).
2. `grep -riE "Inter|Montserrat|font-(semibold|bold|extrabold|black)|font-weight:\s*(400|600|700|800|900)" src/index.css src/v6 tailwind.config.js` → **no matches** (only 300/500 ship).
3. `grep -riE "#[0-9a-fA-F]{6}" src/v6` → **no raw hex in TS** (hex lives only in `src/index.css`).
4. No CDN strings (`googleapis|gstatic|cdn\.|jsdelivr|fontawesome|cloudfront`) in `src/index.css`, `index.html`, `tailwind.config.js`.
5. A throwaway probe component using `bg-canvas`, `text-ink`, `shadow-rest`, `rounded-lg`, `font-medium` (title) / `font-light` (body), and a `ToneBadge` for each of the 8 tones renders correctly in light mode; **then delete the probe** (no screens in V6-0).
6. `prefers-reduced-motion` block present in `src/index.css`.
7. `resolveStatus('nonsense')` returns `{tone:'slate'}` and logs a dev warning.

**Definition of done (V6-0 tokens):** one token home (`src/index.css`), Tailwind references vars, typed maps exist, Roboto 300/500 self-hosted, gate green. → proceed to V6-0 primitives, then V6-1 shell.

---

*Token architecture only. No runtime code, components, routes, or original repo were modified by this document.*
