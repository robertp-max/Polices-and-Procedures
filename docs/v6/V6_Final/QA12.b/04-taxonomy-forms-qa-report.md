# QA12.b/04 — Taxonomy Group QA Report (Framework, ACHC, Policies, Forms, eCIgn, Viewers)

**Date:** 2026-06-21  
**Agent:** QA reviewer for V6 design (Taxonomy focus)  
**Scope:**  
- Routes: `/framework`, `/framework/achc-survey`, `/framework/achc-survey/crosswalk`, `/library`, `/library/:policyId`, `/forms`, `/forms/:formId`, `/forms/:formId/esign`, `/artifacts/:artifactId`, `/viewer/:referenceId`  
- Shared: `src/v6/screens/pageviews/` (Framework*, Policy*, Forms*, Ecign*, GenericReference, SurveyorViewer etc.), `src/v6/components/`, `src/v6/primitives/`, document preview/toolbar impls, viewer primitives.  
- Focus areas: Design consistency, V6 design tokens + strict typography (300 light + 500 medium), shared kit reuse (DataTable, SurfaceCard, MetricGrid, etc.), embedded subviews (PDF/Image Preview Toolbar + eCIgn Mobile Signature Drawing Overlay as internal modals/overlays, **not** new routes), registry path fidelity, no route inflation.  
- Cross-reference: V6_Final blueprints (PNG/MD refs), `V6_APP_MAP.md`, `V6_PHASE_12_2A_MISSING_SUBVIEW_BLUEPRINTS.md`, `V6_DESIGN_RECONCILIATION_DEEP.md`, `routeRegistry.ts`, tokens.

**Summary Verdict:**  
Good foundation with strong shared-kit usage and token/typography discipline across Taxonomy pages. All requested routes are registered and render (mix of dedicated pageviews + Representative inline). No route count inflation and registry paths match spec exactly.  

**Major gaps (implementation debt vs blueprints):**  
- PDF/Image Preview Toolbar (DocumentPreviewToolbar per spec) **absent** from artifact + generic reference viewers (and cross-referenced in audit/evidence).  
- eCIgn Mobile Signature Drawing Overlay (SignatureCanvasOverlay) **absent** from `/forms/:formId/esign` (only static placeholder exists; contrast with implemented VeilModal example in Appendix F).  
- Several taxonomy screens defined inline in `RepresentativeScreens.tsx` (organizational drift).  
- Viewers are metadata-only mocks; no embedded document preview frame or toolbar.  
- Minor: non-functional buttons, some static-only sections diverge from detailed prototype layouts.

**Recommendations priority:** Implement the two Phase 12.2.a subview primitives (shareable), extract inline screens, wire basic document preview slot + toolbar inside viewers.

---

## 1. Route Registry & Path Verification (No Inflation)

**Source:** `src/v6/routing/routeRegistry.ts:63-72` (exact match to task list)

```ts
{ path: '/framework', ... group: 'Taxonomy', template: 'framework' },
{ path: '/framework/achc-survey', ... 'achc-survey' },
{ path: '/framework/achc-survey/crosswalk', ... 'achc-crosswalk' },
{ path: '/library', ... 'matrix' },
{ path: '/library/:policyId', ... 'detail' },
{ path: '/forms', ... 'matrix' },
{ path: '/forms/:formId', ... 'form-viewer' },
{ path: '/forms/:formId/esign', ... 'ecign' },
{ path: '/artifacts/:artifactId', ... 'reference-viewer' },
{ path: '/viewer/:referenceId', ... 'reference-viewer' },
```

- `V6_ROUTES.length === 54` (incl. login auth; 53 shell) — matches `00-QA-OVERVIEW.md` and `V6_REAL_ROUTE_COUNT`.
- Taxonomy group: exactly 10 entries. Sidebar (`routePresentation.ts:88-95`) exposes only matrix/landing entries; details + ecign + viewers correctly hidden from primary nav.
- Router wiring: `router.tsx:22-26` + `RepresentativeScreens.tsx:1167` (isRepresentativeRoute decides dedicated vs placeholder).
- **No inflation verified.** All subviews (preview toolbar, eCIgn overlay per `V6_APP_MAP.md:228-229`) remain **embedded** concepts inside existing routes (per Phase spec).

**Files cited:**
- `src/v6/routing/routeRegistry.ts:63-72,102`
- `src/v6/routing/router.tsx:15-38`
- `src/v6/routing/routePresentation.ts:88-95`

---

## 2. Screen Implementations + Shared Kit Usage

### Dedicated Pageviews (good examples of kit + tokens)
- **FrameworkScreen** (`src/v6/screens/pageviews/FrameworkScreen.tsx`):  
  - Uses: `MetricGrid`, `SurfaceCard`, `ToneTag`, `ToneBadge`, `Badge`, `Button`, `ProgressMeter`.  
  - Custom `DomainTile` + `DomainStat` + mapping table (ad-hoc but token classes: `border-card`, `bg-surface`, `bg-tone-slate-bg`, `text-h2 font-medium text-ink`, `text-sm text-muted`).  
  - Line 250: `<div className="grid gap-xl" data-hash-id="framework" ...>`  
  - Line 284: domain grid.  
  - Line 331: "Open crosswalk" button (non-functional; see gaps).  
  - Ref badge pattern absent here but present elsewhere.

- **FormsLibraryScreen** (`src/v6/screens/pageviews/FormsLibraryScreen.tsx:194`):  
  - **Excellent** kit reuse: `MetricGrid` (28-33), `DataTable` (227), `SurfaceCard` (244), `ToneTag`, `Badge`, `ToneBadge`.  
  - Token adherence everywhere (e.g. line 209: `text-h2 font-medium text-ink`; 212: `text-sm font-light text-muted`; 231: `border-card bg-tone-slate-bg`).  
  - Line 206: `<Badge>Reference: 21-forms-library.png</Badge>` (good linkage to design).  
  - Right rail uses SurfaceCard children for meta dl.

- **PolicyDetailScreen** (`src/v6/screens/pageviews/PolicyDetailScreen.tsx:189`):  
  - Uses `MetricGrid`, `DataTable` (linked forms), `SurfaceCard`, `ProgressMeter`, `Tone*`.  
  - Strong layout: sticky TOC (left), article sections, evidence rail.  
  - All classes token-based (`border-card bg-surface shadow-rest`, `text-h2 font-medium`).

- **EcignWorkspaceScreen** (`src/v6/screens/pageviews/EcignWorkspaceScreen.tsx:253`):  
  - Uses: `MetricGrid`, `SurfaceCard`, `ProgressMeter`, `ToneTag`, `ToneBadge`, primitives (`Button`, `Checkbox`, `FormField`, `Input`).  
  - Special eCIgn tokens: `border-ecign-navy`, `bg-ecign-navy`, `border-ecign-orange` (allowed per token registry).  
  - Lines 386-392: static signature pad mock (`border-dashed border-ecign-navy ... "Signature pad ready"`).  
  - No VeilModal/overlay trigger.

- **GenericReferenceScreen** (`src/v6/screens/pageviews/GenericReferenceScreen.tsx:232`):  
  - Uses `MetricGrid`, `DataTable`, `SurfaceCard`, `ToneTag`, `ToneBadge`, `Badge`, `Button`.  
  - Good right-rail SurfaceCards + facts dl.  
  - No document preview frame or toolbar.

**Inline in RepresentativeScreens.tsx (used via switch):**
- `PolicyMatrixScreen` (1386-1415): For `/library`. Uses `ScreenStack` + `DataTable` + `SurfaceCard`. Consistent but duplicated logic.
- `ArtifactViewerScreen` (1913-1969): For `/artifacts/:artifactId`. Metadata cards + SurfaceCards. **No toolbar.**
- `AchcScreen` (1971-2006): For achc-survey + crosswalk. Uses `DataTable` + `SurfaceCard`. Matches registry templates.
- `FormWorkspaceScreen` (2008-2092): For `/forms/:formId`. Sidebar sections + field cards + signers rail. Good kit but less polished than dedicated FormsLibrary.

**Other related:**
- `SurveyorViewerScreen.tsx`: Admin route; uses basic tokens + badges. Read-only policy body.
- `PolicyLifecycle*` and others use similar patterns.

**Shared Kit Verdict:** Strong. All Taxonomy pages consume `DataTable`, `SurfaceCard`, `MetricGrid`/`MetricTile`, tone primitives. Components live in `src/v6/components/` + `primitives/`. No duplication of core table/card rendering.

**Files cited (kit):**
- `src/v6/components/DataTable.tsx:18-69` (uses `ToneBadge`, `font-light`/`font-medium`)
- `src/v6/components/SurfaceCard.tsx:24-49`
- `src/v6/components/MetricTile.tsx:16-38`
- `src/v6/components/index.ts:1-11`
- `src/v6/screens/RepresentativeScreens.tsx:1082-1107` (mapping)

---

## 3. Design Tokens + Typography Adherence (Strict 300/500)

- **CSS source of truth:** `src/index.css:1-2` imports only `@fontsource/roboto/300.css` + `/500.css`.  
- **Tokens:** `--weight-body: 300; --weight-title: 500;` (121-122). Applied via Tailwind (`.text-h2`, `.text-h3`, body defaults).  
  - h2/h1 titles + nav/active: 500 (title).  
  - Body, p, table cells, labels, helpers: 300 (body). See h3 at css:299 uses `--weight-body`.
- **v6 code:**  
  - Exhaustive use of `font-light` (300), `font-medium` (500).  
  - **Zero violations** in `src/v6`: `grep` for `font-(semibold|bold|600|700|...)` returned no matches.
  - Example patterns (Framework 266, Forms 209, Ecign 268, Generic 259, PolicyDetail 207):  
    `text-h2 font-medium text-ink` (titles)  
    `text-sm font-light text-muted` (descriptions)  
    `text-tag uppercase tracking-tag text-muted`  
    `text-body font-light`
- **Primitives:** `Button.tsx`, `ToneBadge`, `DataTable` headers use `font-light` on th, `font-medium` on key cells.
- **eCIgn exception palette** (`--ecign-navy` etc.) used only in EcignWorkspace — allowed.
- **No raw hex** in any `src/v6/` file (grep confirmed).

**Verdict:** Excellent strict adherence. Matches `V6_TOKEN_REGISTRY.md`, `V6_PHASE_12_2A...` typography rules, and AGENTS guidance.

**Files cited:**
- `src/index.css:121-122,286-308,318`
- `src/v6/tokens.ts` (exports tones/spacing but no direct weights)
- `src/v6/screens/pageviews/*.tsx` (multiple)
- `src/v6/components/DataTable.tsx:26,52-53`

---

## 4. Embedded Subviews Status (PDF Toolbar + eCIgn Overlay)

**Requirement (per task + blueprints):** Subviews must be **internal** (modal/overlay inside parent route) using shared `VeilModal`/`VeilDrawer`. No new routes.

### PDF / Image Preview Toolbar
- **Blueprint spec:** `V6_PHASE_12_2A_MISSING_SUBVIEW_BLUEPRINTS.md:344-358` (sticky bar, zoom/rotate/verify-hash/download; shared `DocumentPreviewToolbar` candidate).  
- **APP_MAP:** "Not rendered inside viewer frame" for artifact-viewer + generic-reference. Trigger inside `/artifacts/:...`, `/viewer/...`, etc.  
- **Current impl:**  
  - `GenericReferenceScreen.tsx`: pure metadata + linked table + SurfaceCards. No preview pane, no toolbar.  
  - `ArtifactViewerScreen` (RepresentativeScreens.tsx:1913): metadata cards only + "Download packet" button. No embed frame or toolbar.  
  - Related: legacy policy/ and some evidence mention PDF blobs, but no V6 toolbar component.  
- **Status:** **Missing**. Cross-referenced in `V6_DESIGN_RECONCILIATION_DEEP.md:80` (artifact marked "No" for preview toolbar).

### eCIgn Mobile Signature Drawing Overlay
- **Blueprint spec:** `V6_PHASE_12_2A...md:364-380` (trigger from `/forms/:formId/esign`; full-screen/mobile modal; canvas + clear + attestation + Confirm CTA using eCIgn tokens + VeilModal).  
- **APP_MAP.md:229:** "Typed signature exists, drawing overlay absent".  
- **Current:**  
  - `EcignWorkspaceScreen.tsx:386-392`: static dashed placeholder only (`"Signature pad ready"`). Steps include "Signature" but no `<VeilModal>` or canvas state.  
  - Contrast: `AppendixFScreen.tsx:609-` correctly implements "Preceptor Signature Drawing Overlay" using `<VeilModal>` + canvas sketch.  
- **Status:** **Missing** (typed signature + sequence present; drawing not).

**Primitives available (good):** `VeilModal.tsx:17-61`, `VeilDrawer.tsx` (used in Supervisor, AppendixF).  
**Registry overlays:** `routeRegistry.ts:104-109` lists conceptual overlay hashes (modal/drawer system) — correctly **not** inflating route table.

**Files cited:**
- `src/v6/screens/pageviews/EcignWorkspaceScreen.tsx:353-401` (signature section)
- `src/v6/screens/pageviews/AppendixFScreen.tsx:553,609` (reference impl)
- `src/v6/screens/pageviews/GenericReferenceScreen.tsx:252-412`
- `src/v6/screens/RepresentativeScreens.tsx:1913` (Artifact)
- `src/v6/components/VeilModal.tsx`
- `docs/v6/V6_APP_MAP.md:228-229`
- `docs/v6/V6_PHASE_12_2A_MISSING_SUBVIEW_BLUEPRINTS.md:344-380`
- `docs/v6/V6_DESIGN_RECONCILIATION_DEEP.md:67,80`

---

## 5. Consistency vs Design Docs + Blueprints (Drift Analysis)

**Framework / ACHC (13-framework-achc.md, 22-framework.png refs):**
- Screen delivers domains grid (10 tiles), metrics (4), context cards, mapping snapshot table + mobile cards.
- Aligns with prototype (Domain cards, ACHC anchors, ProgressMeter readiness).
- Drift: "Open crosswalk" button (Framework:331-337) does nothing (should navigate `/framework/achc-survey/crosswalk`). ACHC screens live in Representative (inline) vs dedicated pageview.
- Crosswalk vs survey split correctly uses separate routes (not `?view=` as older prototype).

**Policy Library + Detail (09-policy-library-viewer.md, 44-policy-detail.png, 45-policy-library.png):**
- `/library` → PolicyMatrixScreen (inline DataTable + cards).
- `/library/:policyId` → PolicyDetailScreen (strong TOC + sections + linked forms + evidence; matches split layout descriptions).
- Good. Minor: PolicyMatrix less rich than full prototype filter pills in legacy.

**Forms + eCIgn (10-forms-ecign.md, 21-forms-library.png, 20-form-viewer.png refs):**
- `/forms` → FormsLibraryScreen (excellent matrix + filters + evidence panels; references PNG).
- `/forms/:formId` → FormWorkspaceScreen (inline; sections sidebar, fields, signers — matches 3-col prototype).
- `/forms/:formId/esign` → EcignWorkspaceScreen (signer sequence, document lines, typed sig, steps, actions — good structure; missing canvas overlay per spec).
- Drift: No real interactive form renderer or PDF preview inside form viewer.

**Viewers (08-artifact-viewer.png, 23-generic-reference.png, 50-surveyor-viewer.png):**
- GenericReference + ArtifactViewer: metadata + links + hash state. Matches high-level but omits "document viewer slot" + toolbar.
- No shared viewer primitive (GenericReferenceScreen is monolithic).

**Other references:** Screens include ToneTags / Badges citing PNGs in places (FormsLibrary). All use light teal surfaces, rounded-lg, shadow-rest, consistent with shell.

**V6_Final files consulted:**
- `13-framework-achc.md`, `09-policy-library-viewer.md`, `10-forms-ecign.md`
- `V6_APP_MAP.md`, `V6_PHASE_12_2A...md`, `V6_DESIGN_RECONCILIATION_DEEP.md`, `V6_PAGEVIEW_INVENTORY.md`

---

## 6. Gaps + Issues (with file:line cites)

1. **Missing subview primitives (critical):**
   - PDF Preview Toolbar: absent in `GenericReferenceScreen.tsx:252+`, `RepresentativeScreens.tsx:1913` (ArtifactViewerScreen).
   - eCIgn Drawing Overlay: absent in `EcignWorkspaceScreen.tsx:386` (static pad only).

2. **Organizational drift (inline screens):**
   - `AchcScreen`, `FormWorkspaceScreen`, `ArtifactViewerScreen`, `PolicyMatrixScreen` defined inside `RepresentativeScreens.tsx:1396,1913,1971,2008` instead of `src/v6/screens/pageviews/`.

3. **Non-functional / incomplete interactions:**
   - `FrameworkScreen.tsx:331`: "Open crosswalk" button has no `onClick` / navigate.
   - Ecign: "Seal signature", signature pad, "Reset signature" all static.
   - Viewers: no actual `<iframe>`/object or preview canvas for PDFs/images.

4. **Minor styling / completeness:**
   - Some ad-hoc tables (Framework mapping snapshot) duplicate DataTable patterns.
   - FormWorkspaceScreen uses operationsMetrics (reuse smell?).
   - No "print packet" or evidence download wired in detail viewers beyond buttons.

5. **Docs alignment:**
   - Blueprint calls for `DocumentPreviewToolbar` + `SignatureCanvasOverlay` shared candidates — none exist yet in `src/v6/components/` or primitives.
   - Registry correctly avoids query-param modes for ACHC (good).

**No critical token drift or route violations found.**

---

## 7. Suggestions

1. **Implement shared subview components (Phase 12.2.a gate):**
   - Create `src/v6/components/DocumentPreviewToolbar.tsx` (sticky bar per spec).
   - Create (or generalize) `src/v6/components/SignatureCanvasOverlay.tsx` (model exactly on AppendixFScreen's VeilModal usage + canvas).
   - Embed toolbar inside `GenericReferenceScreen`, `ArtifactViewerScreen`, and (future) evidence viewers.
   - Embed overlay trigger inside `EcignWorkspaceScreen` (e.g. on "typed signature" complete or dedicated "Draw signature" button).

2. **Organize screens:**
   - Extract `AchcScreen`, `FormWorkspaceScreen`, `PolicyMatrixScreen`, `ArtifactViewerScreen` → dedicated files under `src/v6/screens/pageviews/` (e.g. `AchcSurveyScreen.tsx`, `FormViewerScreen.tsx`, `ArtifactViewerScreen.tsx`).
   - Update imports + Representative switch.

3. **Wire navigation + fidelity:**
   - Make Framework crosswalk button navigate to `/framework/achc-survey/crosswalk`.
   - Add minimal document preview slot (placeholder image/PDF frame) + toolbar in viewers.
   - Add state for Ecign signature pad (open VeilModal).

4. **Further consistency:**
   - Centralize any common viewer chrome (e.g. hash verification badge) into a `ReferenceViewerShell` or reuse.
   - Add more PNG reference badges (`<Badge>Reference: 08-artifact-viewer.png</Badge>`) for traceability.
   - Consider shared `ViewerChrome` or toolbar slot prop on GenericReference.

5. **QA follow-ups:**
   - Add visual regression or storybook entries for toolbar + overlay once built.
   - Run `npm run build` + `npm run lint` after changes (per AGENTS.md; use `npx tsc -b` for typecheck).
   - Update `V6_APP_MAP.md` + `V6_PHASE_12_2A...` status columns once subviews land.
   - Verify in `docs/v6/V6_Final/` any new screenshots.

6. **Prevent regression:**
   - Enforce (via script or review) that subviews for taxonomy viewers stay inside the listed routes.
   - Continue strict grep for font weights / raw hex on Taxonomy + viewer files.

---

## 8. Files & Lines Summary (Key Citations)

- Registry + routing: `routeRegistry.ts:63-72,104-109`, `router.tsx:22`, `routePresentation.ts:88-95`
- Dedicated Taxonomy screens:  
  - `FrameworkScreen.tsx:248-471` (esp. 250,266,331,408)  
  - `FormsLibraryScreen.tsx:194-290` (esp. 196,206,227,244)  
  - `PolicyDetailScreen.tsx:189-429`  
  - `EcignWorkspaceScreen.tsx:253-504` (esp. 255,353,386)  
  - `GenericReferenceScreen.tsx:232-444`  
- Inline: `RepresentativeScreens.tsx:1062-1065 (achc), 1082-1089 (library/forms), 1106-1107 (form), 1913-1969 (artifact), 1971-2006 (Achc), 2008-2092 (FormWorkspace)`
- Components/primitives: `DataTable.tsx:18`, `SurfaceCard.tsx:24`, `MetricTile.tsx:30`, `VeilModal.tsx:17`, `Button.tsx:30`, `toneClasses.ts:3`
- Tokens/CSS: `index.css:1-2,121-122,286-308`; `tokens.ts`
- Design refs: `docs/v6/V6_Final/13-framework-achc.md`, `09-policy-library-viewer.md`, `10-forms-ecign.md`; `V6_APP_MAP.md:228`, `V6_PHASE_12_2A_MISSING_SUBVIEW_BLUEPRINTS.md:344-380`, `V6_DESIGN_RECONCILIATION_DEEP.md`
- Other: `src/v6/screens/RepresentativeScreens.tsx:1047` (switch), `src/v6/screens/pageviews/index.ts:5-34`

**Status:** Ready for subview implementation iteration. All core taxonomy surfaces use V6 tokens/kit and match registered routes. The two highlighted embedded subviews are the primary remaining gaps vs blueprints.

End of report. (Append to sibling QA reports as needed.)