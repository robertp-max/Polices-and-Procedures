# D-04: Parallel-Component Deprecation Plan

**Task ID:** D-04 (Stabilization Phase 1)
**Scope:** Documentation only — no source files are modified by this document.
**Feeds:** MVP Wave 0 visual sprint (primitives enforcement MVP plan L74 + deprecation-begin L813)
**Authority:** Cross-references `D-06_DESIGN_SYSTEM_CONTRIBUTION_GUIDELINES.md` (Phase 1 output)
**Date:** 2026-05-16

---

## 1. Purpose & Scope

This document is an executable migration plan for eliminating the set of parallel, locally-defined UI primitives that duplicate canonical components already available in `src/policy/components/ui/`. It is a planning artefact only: no source code is changed here. Engineers performing the migration should treat each section below as a specification, not a diff.

**Why this matters.** The MVP plan (L63–64) documents 2,313+ inline-style occurrences and a proliferation of local one-off components that bypass design tokens. The primitives listed in Section 2 are the highest-value targets: they introduce hex literals, bespoke padding schemas, and shadow values outside the canonical token set, and they create a maintenance split where the same badge pattern exists in three different files with three slightly different implementations.

**What this plan governs:**
- All `To Migrate` entries in the inventory table (Section 2)
- Migration order, owner assignment, and wave scheduling (Section 4)
- Per-primitive before/after recipes (Section 3)
- Validation gates each migration PR must pass (Section 7)

**What this plan does NOT govern:**
- Protected Subsystems (eCign, Evidence Center, CES identity routing) — see Section 5
- Introduction of new `ui/` primitives — requires Design Systems Lead RFC per D-06 §8
- New tooling or verification scripts — out of scope for Stabilization

---

## 2. Component Inventory

| # | File | Line | Local Component | Status | Migration Target | Owner | Wave |
|---|---|---|---|---|---|---|---|
| 1 | `src/policy/ces/components/primitives.tsx` | 14 | `CesCard` | **To Migrate** | `<SurfaceCard>` (solid); `<GlassPanel>` for translucent variant | CES Lead | Wave 0 |
| 2 | `src/policy/ces/components/primitives.tsx` | 54 | `ComplianceStateBadge` | **To Migrate** | `<CiStatusBadge>` — keep domain labels, map state → tone | CES Lead | Wave 0 |
| 3 | `src/policy/ces/components/primitives.tsx` | 72 | `PhaseIndicator` | **To Migrate** | `<CiStatusBadge tone="neutral">` | CES Lead | Wave 0 |
| 4 | `src/policy/ces/components/primitives.tsx` | 99 | `AuditReadinessTag` | **To Migrate** | `<CiStatusBadge>` with severity-mapped tone | CES Lead | Wave 0 |
| 5 | `src/policy/ces/components/primitives.tsx` | 118 | `DomainRiskDot` | **Keep** | No canonical equivalent (micro-indicator, domain-specific) | CES Lead | — |
| 6 | `src/policy/ces/components/primitives.tsx` | 125 | `UserAvatar` | **Keep** | No canonical avatar primitive exists | CES Lead | — |
| 7 | `src/policy/ces/components/primitives.tsx` | 150 | `EscalationTimer` | **Keep** | Domain-specific timer display; no canonical equivalent | CES Lead | — |
| 8 | `src/policy/ces/components/primitives.tsx` | 172 | `KV` | **Keep** | Utility label/value row; domain-specific layout | CES Lead | — |
| 9 | `src/policy/pages/GVGBDetailView.tsx` | 224 | local `Card` | **To Migrate** | `<SurfaceCard>` | Policy Pages Lead | Wave 0 |
| 10 | `src/policy/pages/GVGBDetailView.tsx` | 230 | local `SectionTitle` | **To Migrate** | `<SectionHeader>` | Policy Pages Lead | Wave 0 |
| 11 | `src/policy/pages/GVGBDetailView.tsx` | 261 | local `TabButton` | **To Migrate** | `<Tabs>` canonical | Policy Pages Lead | Wave 0 |
| 12 | `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` | 367 | local `TabButton` | **To Migrate** | `<Tabs variant="segmented">` | Regulatory Lead | Wave 1 |
| 13 | `src/policy/pages/PolicyLifecyclePage.tsx` | 651 | local `SectionTitle` | **To Migrate** | `<SectionHeader>` | Policy Pages Lead | Wave 0 |

**Wave definitions:**
- **Wave 0** — MVP visual sprint; low eCign proximity; low blast radius; target: all Policy Pages + CES badge primitives
- **Wave 1** — Regulatory/workflow surfaces; higher blast radius due to nested state; owner-led; after Wave 0 validation

---

## 3. Migration Recipes

Each recipe lists: canonical import path, required vs optional props, a concrete before/after snippet sourced from the actual file location, and known pitfalls.

---

### 3.1 `CesCard` → `<SurfaceCard>`

**Canonical import:**
```tsx
import { SurfaceCard } from '@/policy/components/ui/SurfaceCard';
```

**Props:**

| Prop | Required | Type | Notes |
|---|---|---|---|
| `children` | Yes | `ReactNode` | — |
| `padding` | No | `'none' \| 'sm' \| 'md' \| 'lg'` | Defaults to `'lg'` (24 px) |
| `className` | No | `string` | Forwarded to outer div |
| All `HTMLAttributes<HTMLDivElement>` | No | — | Spread via `...rest` |

**Before** (`src/policy/ces/components/primitives.tsx` L14–39):
```tsx
<CesCard title="Compliance Overview" action={<RefreshButton />}>
  {children}
</CesCard>
```

**After:**
```tsx
<SurfaceCard>
  <header className="flex items-center justify-between mb-4">
    <span className="text-[12px] font-bold uppercase tracking-[0.14em]"
          style={{ color: 'var(--ci-text-primary)' }}>
      Compliance Overview
    </span>
    <RefreshButton />
  </header>
  {children}
</SurfaceCard>
```

> **Note on title/action pattern.** `SurfaceCard` is a layout primitive — it does not include a built-in title bar. Pair it with `<SectionHeader>` (see §3.5) when a titled card header is needed.

**Pitfalls:**
- `CesCard` accepted `padding` as a `boolean` (`true`/`false`). `SurfaceCard.padding` is a named enum `'none' | 'sm' | 'md' | 'lg'`. Map: `padding={false}` → `padding="none"`, `padding={true}` → `padding="lg"` (or choose `'md'`/`'sm'` based on context). Verify spacing visually when implementing.
- `CesCard` applied border + background from `useCesTokens()` via inline `style`. `SurfaceCard` applies these through the `.ci-card` CSS class. After migration, remove any residual inline `background` or `border` overrides that duplicate the class.
- `CesCard` uses `<section>` as its root element. `SurfaceCard` uses `<div>`. If ARIA landmark semantics are needed at the callsite, add `role="region"` and `aria-label` to `<SurfaceCard>` via the `...rest` spread.

---

### 3.2 `ComplianceStateBadge` → `<CiStatusBadge>`

**Canonical import:**
```tsx
import { CiStatusBadge } from '@/policy/components/ui/CiStatusBadge';
```

**Props:**

| Prop | Required | Type | Notes |
|---|---|---|---|
| `children` | Yes | `ReactNode` | The label text |
| `tone` | No | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger'` | Defaults to `'neutral'` |
| `className` | No | `string` | — |

**State → tone mapping:**

| `ComplianceState` | `CiBadgeTone` |
|---|---|
| `upcoming` | `neutral` |
| `ready` | `info` |
| `in_progress` | `info` |
| `awaiting_signature` | `warning` |
| `blocked` | `danger` |
| `completed` | `success` |

**Before** (`src/policy/ces/components/primitives.tsx` L54–68):
```tsx
<ComplianceStateBadge state={state} compact={false} />
```

**After:**
```tsx
<CiStatusBadge tone={COMPLIANCE_TONE_MAP[state]}>
  {COMPLIANCE_STATE_LABEL[state]}
</CiStatusBadge>
```

Define `COMPLIANCE_TONE_MAP` as a local constant in the consuming file (or in a CES-domain utility) using the table above. **Do not move the label constants** — `COMPLIANCE_STATE_LABEL` stays in `ces/types`.

**Pitfalls:**
- `ComplianceStateBadge` had a `compact` prop that changed `padding` and `fontSize`. `CiStatusBadge` has no such prop — it is sized via the `.ci-badge` CSS class. If a visually smaller badge is required at a specific callsite, apply `className="ci-badge--sm"` if that modifier exists, or verify with the Design Systems Lead before adding new CSS.
- The old component drew colours directly from `useCesTokens()` hex values. After migration, the `.ci-badge--{tone}` class owns those colours via tokens. Do not add inline `style` to re-apply colours.

---

### 3.3 `PhaseIndicator` → `<CiStatusBadge tone="neutral">`

**Canonical import:** same as §3.2.

**Before** (`src/policy/ces/components/primitives.tsx` L72–88):
```tsx
<PhaseIndicator phase={phase} />
```

**After:**
```tsx
<CiStatusBadge tone="neutral">
  {WORKFLOW_PHASE_LABEL[phase]}
</CiStatusBadge>
```

**Pitfalls:**
- `PhaseIndicator` used `t.paper` background and `t.navy` text from `useCesTokens()`. The `neutral` tone on `CiStatusBadge` uses `--ci-surface-muted` and `--ci-text-muted-2`. These may differ slightly in light vs. dark themes — verify visually after migration.
- `WORKFLOW_PHASE_LABEL` stays in `ces/types`; do not inline the string literals.

---

### 3.4 `AuditReadinessTag` → `<CiStatusBadge>`

**Canonical import:** same as §3.2.

**Readiness → tone mapping:**

| `AuditReadiness` | `CiBadgeTone` |
|---|---|
| `not_ready` | `danger` |
| `partial` | `warning` |
| `ready` | `success` |

**Before** (`src/policy/ces/components/primitives.tsx` L99–114):
```tsx
<AuditReadinessTag readiness={readiness} />
```

**After:**
```tsx
<CiStatusBadge tone={AUDIT_TONE_MAP[readiness]}>
  {AUDIT_READINESS_LABEL[readiness]}
</CiStatusBadge>
```

**Pitfalls:**
- `AuditReadinessTag` rendered a coloured dot (`<span className="w-1.5 h-1.5 rounded-full">`) before the label. `CiStatusBadge` does not. If the dot is load-bearing for scannability (e.g. in a dense table), keep it as a sibling element alongside `<CiStatusBadge>`, not inside it.
- The `title` attribute (`title="Audit readiness: …"`) on the old tag provided a tooltip for the dot. Preserve this on the wrapper element if accessibility requires it.

---

### 3.5 Local `Card` and `SectionTitle` in `GVGBDetailView` → `<SurfaceCard>` + `<SectionHeader>`

**Canonical imports:**
```tsx
import { SurfaceCard }   from '@/policy/components/ui/SurfaceCard';
import { SectionHeader } from '@/policy/components/ui/SectionHeader';
```

**`SectionHeader` props:**

| Prop | Required | Type | Notes |
|---|---|---|---|
| `title` | Yes | `ReactNode` | Rendered as `<h3>` |
| `eyebrow` | No | `string` | JetBrains Mono uppercase label above title |
| `actions` | No | `ReactNode` | Right-side action cluster |
| `className` | No | `string` | — |

**Before — local `Card`** (`src/policy/pages/GVGBDetailView.tsx` L224–228):
```tsx
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white shadow-sm rounded-xl p-6 mb-6 ${className}`}>
    {children}
  </div>
);

// callsite:
<Card className="some-extra-class">…</Card>
```

**After:**
```tsx
<SurfaceCard className="mb-6 some-extra-class">…</SurfaceCard>
```

**Before — local `SectionTitle`** (`src/policy/pages/GVGBDetailView.tsx` L230–236):
```tsx
const SectionTitle = ({ icon: Icon, title, color = 'text-[#1F1C1B]' }: …) => (
  <h2 className={`font-montserrat font-semibold text-[13px] tracking-[0.22em] uppercase mb-8 …`}>
    {Icon && <Icon className="shrink-0 text-[#007970]" size={20} />}
    <span className="shrink-0">{title}</span>
    <span className="flex-grow h-px bg-[#007970]"></span>
  </h2>
);

// callsite:
<SectionTitle icon={ShieldCheck} title="Governing Body Composition" />
```

**After:**
```tsx
<SectionHeader title="Governing Body Composition" />
```

> The decorative horizontal rule and the inline icon are not reproduced by `<SectionHeader>`. If the visual rule is load-bearing, add it as a sibling `<hr>` styled with `var(--ci-border)` — do not inline hex. The teal icon may be passed via the `actions` slot or omitted.

**Pitfalls:**
- The local `SectionTitle` used hex literals (`text-[#007970]`, `bg-[#007970]`, `text-[#1F1C1B]`). These will be flagged by `verify:ui` rule `tokens.hex-literal` — they must not be reproduced in the migration.
- `SurfaceCard` defaults to `padding="lg"` (24 px). The local `Card` used Tailwind `p-6` (also 24 px / 1.5 rem). These are equivalent; no layout shift is expected.
- The local `Card` also applied `mb-6` (margin-bottom). Pass this through `className="mb-6"` on `<SurfaceCard>` — it spreads via `...rest`.

---

### 3.6 Local `SectionTitle` in `PolicyLifecyclePage` → `<SectionHeader>`

**Canonical import:** same as §3.5.

**Before** (`src/policy/pages/PolicyLifecyclePage.tsx` L651–657):
```tsx
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">
      {children}
    </div>
  );
}
```

**After:**
```tsx
<SectionHeader title={children} />
```

> The local variant is purely a label (`div` with 10 px uppercase text), not a full section heading. `SectionHeader` renders an `<h3>` at 16 px. If the callsite context is inside a dense sidebar where the larger heading is visually out of place, use `SectionHeader` with `className` to override `fontSize` via a token-driven class — do not add inline `style` with raw sizes. Verify visually when implementing.

**Pitfalls:**
- `text-gray-500` is a Tailwind grey literal that will eventually be flagged under design-token enforcement. `<SectionHeader>` resolves to `var(--ci-text-primary)`, which is correct.
- This `SectionTitle` is module-local (not exported). Delete it entirely after callsites migrate.

---

### 3.7 Local `TabButton` in `GVGBDetailView` → `<Tabs>`

**Canonical import:**
```tsx
import { Tabs, type TabItem } from '@/policy/components/ui/Tabs';
```

**`Tabs` props:**

| Prop | Required | Type | Notes |
|---|---|---|---|
| `items` | Yes | `TabItem[]` | Each: `{ id, label, badge?, disabled? }` |
| `value` | Yes | `string` | Currently-active tab id |
| `onChange` | Yes | `(id: string) => void` | — |
| `variant` | No | `'segmented' \| 'underline'` | Defaults to `'underline'` |
| `ariaLabel` | No | `string` | Accessibility label for the `tablist` |
| `className` | No | `string` | — |

**Before** (`src/policy/pages/GVGBDetailView.tsx` L261–272):
```tsx
const TabButton = ({ active, onClick, children }: …) => (
  <button
    onClick={onClick}
    className={`px-5 py-3 font-montserrat font-semibold text-[13px] … border-b-[3px] ${
      active ? 'text-[#C74601] border-[#C74601]' : 'text-[#524048] border-transparent …'
    }`}
  >
    {children}
  </button>
);

// callsite (inferred):
<div className="flex border-b …">
  <TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>Overview</TabButton>
  <TabButton active={tab === 'policy'}   onClick={() => setTab('policy')}>Policy Text</TabButton>
</div>
```

**After:**
```tsx
const TAB_ITEMS: TabItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'policy',   label: 'Policy Text' },
];

<Tabs
  items={TAB_ITEMS}
  value={tab}
  onChange={setTab}
  variant="underline"
  ariaLabel="GVGB Detail View sections"
/>
```

**Pitfalls:**
- The local `TabButton` used hardcoded `#C74601` for the active border — this is the canonical CTA orange but expressed as a hex literal, which `verify:ui` will flag in new code. `<Tabs>` uses `var(--ci-accent)` which resolves to the same value through the token system.
- Delete the local `TabButton` declaration and its surrounding `<div className="flex border-b …">` wrapper — `<Tabs variant="underline">` renders its own border-bottom container.
- If `TabButton` is used elsewhere in `GVGBDetailView.tsx` (grep before deleting).

---

### 3.8 Local `TabButton` in `WorkflowExecutionPanel` → `<Tabs>`

**Canonical import:** same as §3.7.

**Before** (`src/policy/components/regulatory/WorkflowExecutionPanel.tsx` L367–404):
```tsx
function TabButton({ active, onClick, icon, label, count, accent }: …) {
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  return (
    <button
      type="button"
      onClick={onClick}
      className="ci-touch-target flex … font-montserrat font-bold uppercase …"
      style={{
        color: active ? accent : (isLight ? 'var(--ci-text-muted-2)' : '#475569'),
        background: active ? `${accent}1a` : …,
        borderBottom: active ? `2px solid ${accent}` : '2px solid transparent',
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {count > 0 && <span …>{count}</span>}
    </button>
  );
}
```

**After:**
```tsx
const PANEL_TABS: TabItem[] = [
  { id: 'tasks',  label: <><TaskIcon /> Tasks</>,    badge: taskCount  > 0 ? taskCount  : undefined },
  { id: 'events', label: <><EventIcon /> Events</>,  badge: eventCount > 0 ? eventCount : undefined },
  // … etc.
];

<Tabs
  items={PANEL_TABS}
  value={activeTab}
  onChange={setActiveTab}
  variant="segmented"
  ariaLabel="Workflow execution panel tabs"
/>
```

> **Wave 1 caution.** This `TabButton` is deeper in the regulatory workflow surface (higher blast radius). It reads `useShellStore` for theme and applies an `accent` prop that is passed per-tab from the parent. The canonical `<Tabs>` does not expose a per-tab accent colour — it uses `var(--ci-accent)` globally. Verify with the Regulatory Lead whether per-tab accent colours are intentional or incidental before migrating. If intentional, escalate to Design Systems Lead per D-06 §8 before proceeding — do not extend `<Tabs>` props unilaterally.

**Pitfalls:**
- The local component used `#475569` as a hardcoded hex for muted text in dark mode. `<Tabs>` resolves this through `var(--ci-text-muted-2)`.
- The `ci-touch-target` class on the local `<button>` enforces ≥48 px touch target. Confirm `<Tabs>` buttons satisfy this requirement via the touch-target audit gate (Section 7).

---

## 4. Migration Order

Sequence is determined by blast radius (number of callsites + downstream component depth) and Protected Subsystem proximity (eCign-adjacent files go last, under Architecture-led patches).

| Priority | Entry | Rationale |
|---|---|---|
| **1st** | `GVGBDetailView.tsx` — `Card`, `SectionTitle`, `TabButton` | Entirely self-contained in one page file; three primitives in one PR; lowest blast radius; no Protected Subsystem proximity |
| **2nd** | `PolicyLifecyclePage.tsx` — `SectionTitle` | Single local function, module-only scope; trivial migration; no downstream consumers |
| **3rd** | `ces/components/primitives.tsx` — `CesCard` | Moderate blast radius (CES-wide consumers); do after the simpler page files to build confidence in `<SurfaceCard>` at callsites |
| **4th** | `ces/components/primitives.tsx` — `PhaseIndicator`, `AuditReadinessTag` | Badge-family migrations; do together in one PR after `ComplianceStateBadge` |
| **5th** | `ces/components/primitives.tsx` — `ComplianceStateBadge` | Highest CES blast radius; most callers; migrate after card and simpler badge migrations are validated |
| **6th (Wave 1)** | `WorkflowExecutionPanel.tsx` — `TabButton` | Regulatory surface; higher blast radius; per-tab accent colour needs Design Systems Lead sign-off first; owner-led patch |

**General rule:** do not start a new migration before the previous PR has passed `verify:ui` and has a visual regression artifact attached. Do not batch Wave 0 and Wave 1 entries into a single PR.

---

## 5. Out of Scope — Protected Subsystems

The following files and subsystems are **Protected** per MVP plan §C6. They must not be touched as part of this deprecation effort. Any changes to these surfaces require Architecture + Compliance approval.

| Surface | Reason Protected |
|---|---|
| `FormSigningWorkspace.tsx`, `FormViewer.tsx`, `src/policy/ecign/*` | eCign Protected Subsystem (MVP §C6); eCign brand navy/orange palette must be preserved |
| Evidence Center capture / storage / retrieval primitives | Protected Subsystem; IndexedDB blob persistence is out of scope |
| CES identity / `form_instance_id` routing | Protected Subsystem per MVP §3 |
| Brand-owned navy/orange surfaces inside eCign | eCign brand owns its palette; CI teal must not bleed in (D-06 §1) |

If a migration PR accidentally touches a file in the above list, it must be blocked in review and re-scoped.

---

## 6. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Style regression on `CesCard` → `<SurfaceCard>` migration** | Medium | Medium | `SurfaceCard` applies `.ci-card` class; verify border-radius, shadow, and background match visually in both themes before merging |
| **Glass-stack budget exceeded (MVP §C1, D-06 §3)** | Low | High | If `<GlassPanel>` is chosen over `<SurfaceCard>` for CES cards, audit the nesting depth — the max-3-layer rule still applies; do not nest `<GlassPanel>` inside `<GlassPanel>` |
| **Badge label text changes** | Medium | Low | `COMPLIANCE_STATE_LABEL`, `WORKFLOW_PHASE_LABEL`, and `AUDIT_READINESS_LABEL` remain in `ces/types` — they are not moved or renamed; the migration only changes the wrapper element |
| **`TabButton` interaction differences in `WorkflowExecutionPanel`** | High | Medium | The per-tab `accent` prop has no equivalent in canonical `<Tabs>`; escalate before Wave 1 begins; do not migrate without Design Systems Lead approval |
| **`verify:ui` hex-literal warnings promoted to FAILs** | Low | Medium | The hex scan is currently WARN; it promotes to FAIL after the Wave 0 token-cleanup pass (D-06 §2); complete migration before that promotion lands |
| **Touch-target regression** | Low | High | The local `TabButton` in `WorkflowExecutionPanel` used `.ci-touch-target`; confirm `<Tabs>` buttons meet ≥48 px during Wave 1 audit |

---

## 7. Validation Gates

Every migration PR must pass all of the following before merge.

### 7.1 `npm run verify:ui`

```bash
npm run verify:ui
```

- Must not introduce any **new FAILs** compared to the pre-migration baseline.
- New WARNs must be explained in the PR description.
- Pay special attention to rules: `tokens.hex-literal`, `tokens.rgb-literal`, `glass.stack-budget`.

### 7.2 Visual Regression Artifact

Per `.github/PULL_REQUEST_TEMPLATE.md` Design System Compliance section:

- Attach a side-by-side screenshot (before/after) for every migrated component in both `care-indeed-light` and `ci-ion` (dark) themes.
- If Playwright baselines exist, attach the diff output.
- A PR with no visual artifact is blocked from merge regardless of CI status.

### 7.3 Touch-Target Audit

- At least one `<button>` per migrated `<Tabs>` strip must be audited for ≥48 px height (primary CTA floor per MVP L1042 and D-06 §5).
- Record the measured value in the PR description.

### 7.4 Design System Compliance Checklist (from PR template)

| Item | Requirement |
|---|---|
| No new raw hex / `rgb()` literals | Required |
| No new glass surfaces beyond MVP §C1 (3-layer cap) | Required |
| No new parallel component families introduced | Required |
| CTA orange = `var(--ci-cta)` / `#C74601` only | Required |
| Touch targets meet floor (≥48 px primary, ≥44 px floor) | Required |
| `verify:ui` passes or new warnings explained | Required |

---

## 8. When a Parallel Component Is Still Appropriate

Not every locally-defined component needs migration. The following entries in `src/policy/ces/components/primitives.tsx` are **intentionally kept**:

| Component | Reason to Keep |
|---|---|
| `DomainRiskDot` (L118) | Micro-indicator (coloured dot by risk level) with no canonical equivalent in `ui/`; domain-specific semantics; tiny, stable, no hex drift risk |
| `UserAvatar` (L125) | No canonical avatar primitive exists in `ui/`; if one is needed at scale, file an RFC with the Design Systems Lead per D-06 §8 — do not create one ad-hoc |
| `EscalationTimer` (L150) | Domain-specific display logic (overdue/escalating states, days/hours formatting); no generic equivalent appropriate |
| `KV` (L172) | Utility label/value row specific to CES detail layouts; no canonical equivalent; low token-drift risk (uses `useCesTokens()` without hex literals) |

**Rule of thumb:** keep a local component when it (a) has no canonical equivalent, (b) encodes domain logic that does not belong in a general primitive, and (c) uses tokens correctly without introducing hex literals or glass-stack budget violations. When in doubt, consult D-06 §8 escalation paths before either keeping or creating.

---

## 9. Migration Tracking

Use this table to track progress. Update checkboxes in-place as PRs land.

| # | Migration | PR | Status |
|---|---|---|---|
| 1 | `GVGBDetailView.tsx` — local `Card` → `<SurfaceCard>` | — | `[ ]` |
| 2 | `GVGBDetailView.tsx` — local `SectionTitle` → `<SectionHeader>` | — | `[ ]` |
| 3 | `GVGBDetailView.tsx` — local `TabButton` → `<Tabs>` | — | `[ ]` |
| 4 | `PolicyLifecyclePage.tsx` — local `SectionTitle` → `<SectionHeader>` | — | `[ ]` |
| 5 | `ces/primitives.tsx` — `CesCard` → `<SurfaceCard>` | — | `[ ]` |
| 6 | `ces/primitives.tsx` — `PhaseIndicator` → `<CiStatusBadge tone="neutral">` | — | `[ ]` |
| 7 | `ces/primitives.tsx` — `AuditReadinessTag` → `<CiStatusBadge>` + tone map | — | `[ ]` |
| 8 | `ces/primitives.tsx` — `ComplianceStateBadge` → `<CiStatusBadge>` + tone map | — | `[ ]` |
| 9 | `WorkflowExecutionPanel.tsx` — local `TabButton` → `<Tabs>` (Wave 1) | — | `[ ]` |
| 10 | `ces/primitives.tsx` — `DomainRiskDot` — **Keep** (no action) | n/a | `[x]` |
| 11 | `ces/primitives.tsx` — `UserAvatar` — **Keep** (no action) | n/a | `[x]` |
| 12 | `ces/primitives.tsx` — `EscalationTimer` — **Keep** (no action) | n/a | `[x]` |
| 13 | `ces/primitives.tsx` — `KV` — **Keep** (no action) | n/a | `[x]` |

---

**Status: Ready for Phase 2 close-out**
**Date: 2026-05-16**
