# CareIndeed Production Light Mode Design Spec

## Foundation

The provided source set naturally splits into two roles. The design-system PDF is the canonical source for palette, typography, spacing, radius, buttons, fields, icons, and utility controls. The supplied mobile and desktop reference images show how those primitives are meant to feel in product: calm, premium, clinical, supportive, and operational rather than marketing-only. In practice, production light mode should take **tokens and state rules from the PDF**, then take **surface feel, card composition, and page density from the reference screens**. fileciteturn0file0

The strongest consistent brand read across the files is this: the UI should be **light-first**, with the majority of the canvas carried by white or very pale surfaces; **teal** should do the structural work of navigation, progress, selection, and secondary emphasis; **orange** should remain the strongest action color, used sparingly for the most important CTA or a key highlight. The PDF explicitly reserves orange and teal for critical or prominent elements on light backgrounds, and its approved color combinations keep most of the composition neutral while accents do the communication. fileciteturn0file0

## Brand palette

The canonical orange scale in the design system is: Orange 600 `#421700`, Orange 500 `#C74601`, Orange 400 `#E56E2E`, Orange 300 `#FFD5BF`, Orange 200 `#FFEEE5`, and Orange 100 `#FFFAF7`. This family is meant for the highest-priority actions and highlights. The PDF’s button guidance and color-combination examples make that hierarchy very explicit: orange is not a background system; it is a focal-action system. fileciteturn0file0

The canonical teal scale is: Teal 600 `#004142`, Teal 500 `#00797D`, Teal 400 `#06A6AB`, Teal 300 `#C4F4F5`, Teal 200 `#E5F0EF`, and Teal 100 `#F7FEFF`. In the PDF, teal is the designated secondary brand color and is used for emphasis when orange is not the primary focal point. In the supplied application images, that same logic reads cleanly at product level: teal carries navigation, progress bars, secondary buttons, and selected states without overpowering the screen. fileciteturn0file0

The neutral backbone should be treated as equally important as the accent colors. The dark neutral family includes Gray 600 `#1F1C1B`, Gray 500 `#524D4B`, and Gray 400 `#7A7470`. The light neutral family includes Gray 300 `#D9D6D5` and Gray 100 `#FAF8F8`, with the lighter neutrals intended for borders, placeholder text, and decorative or supporting surfaces rather than dominant content blocks. This is what keeps the interface soft rather than metallic or corporate-gray. fileciteturn0file0

Sentiment colors should remain conventional and limited to state communication: Green 300 `#00854D`, Yellow 300 `#FFC700`, and Red 300 `#D70101`, with their lighter variants used for filled alerts or muted status surfaces. The PDF is clear that these are for positive, cautionary, and negative states, and should not become substitute brand colors elsewhere in the interface. fileciteturn0file0

A hardened production rule from the combined source set is this: **keep only one production orange family and one production teal family in code**, even if some supplied mockups visually drift to near-neighbor hues. The PDF should supply the source-of-truth token names; the screenshots should determine how often those tokens appear, not create additional permanent accent families. fileciteturn0file0

## Typography and rhythm

Typography is straightforward and should not be improvised. **Montserrat** is the heading and subheading typeface. **Roboto** is the body typeface. The PDF explicitly says Montserrat is used across headings and subheadings to preserve a clean, consistent title system, while Roboto is used for body copy, with lighter weights favored for long text and regular weight reserved for emphasis when needed. fileciteturn0file0

The headline scale is already defined and should be ported directly into production tokens: Heading 1 is Montserrat Medium `64/72` on desktop; Heading 2 is Montserrat Medium `40/48` on tablet; Heading 3 is Montserrat Medium `32/40` on mobile; Heading 4 is Montserrat Medium `24/32` on compact mobile contexts. Subheadings follow Montserrat at `32/40` on desktop, `24/32` on tablet, `16/24` on mobile, with a second small mobile subheading style at `16/24` in medium weight. Body styles are Roboto Light or Regular `16/24` for standard reading text, Roboto Light or Regular `12/16` for compact desktop/tablet text, and Roboto Light or Regular `8/12` only for true microcopy. fileciteturn0file0

Spacing is also already defined. The PDF gives a broad-layout outer horizontal padding of `128px` on a `1512px` desktop screen, `24px` on tablet, and `16px` on mobile; vertical section spacing of `40px` desktop, `32px` tablet, and `16px` mobile; a heading-to-subheading gap of `16px`, `12px`, and `8px`; and button-to-button spacing of `24px`, `16px`, and `12px`. These values should become production spacing tokens, not ad hoc per-screen decisions. fileciteturn0file0

The supplied product screens suggest one important hardening interpretation: the PDF’s very large desktop outer padding reads as a **full-page layout rule**, not an instruction to create oversized empty space inside an application shell. In the app views, the shell itself contains the canvas, and spacing is expressed through left rails, right rails, card padding, and content gutters rather than giant exterior margins. So production should preserve the PDF’s **internal rhythm** exactly, while applying the large desktop margin only to full-width marketing-like or standalone views.

## Surface model

Across the supplied screens, the light UI consistently behaves like a **layered neutral system**, not a flat white slab and not a highly glossy glassmorphism experiment. The cleanest way to harden that into production is a three-layer model: an **atmospheric base** behind the app, a **main application plane**, and **elevated cards/drawers** above that. One of the supplied reference images even labels this stack explicitly as a light-tinted atmospheric base plus elevated cards, which is a useful production reading of the entire mockup set.

Layer 0 should be the softest surface in the system: a pale, almost-white background with a faint teal cast. This is where Teal 100 `#F7FEFF` and the lightest warm neutral `#FAF8F8` do their work. Layer 1 should be the application plane itself: largely white, minimally tinted, quiet, and designed to disappear behind content. Layer 2 should be the content surface: opaque or nearly opaque white panels, occasional pale teal panels for grouped context, and restrained elevation created through very subtle borders and short, soft shadows. That keeps the screens calm and “clinical” rather than decorative. fileciteturn0file0

Radii should come from the PDF without improvisation. Desktop and tablet radii are `8`, `12`, `16`, `24`, and `32`. Mobile radii are `4`, `8`, `12`, `16`, and `24`. In the supplied screens, the best-fitting production interpretation is: use `24px` on major cards, modules, and large CTA shells; `16px` on standard cards and drawers; `12px` on compact containers and media blocks; and `8px` or below only for small controls, fields, or dense grid cells. fileciteturn0file0

Borders need to stay quiet. The PDF’s neutral family and field examples support thin, low-contrast lines, and the image references reinforce that by avoiding aggressive keylines almost everywhere. Production light mode therefore should prefer **1px neutral dividers or hairlines**, with active emphasis created by state color rather than thick outlines. Black borders should not appear as a design motif; dark neutral belongs in text and highly deliberate states, not as a global edge treatment. fileciteturn0file0

If any “glass” treatment is preserved from the image references, it should be limited to the shell and large modal/drawer planes: milky white, low blur, low contrast, and always subordinate to legibility. Informational cards should still read as crisp surfaces, not transparent ornaments.

## Component rules

Buttons should follow the PDF’s exact hierarchy. A **primary** button is the one important action on the page. A **secondary** button is a lower-priority alternative. An **inline** button is text-embedded and low emphasis. On light surfaces, the PDF explicitly favors **dark-shaded buttons as the default** and says lighter-shaded buttons should generally be avoided unless the background is dark and the whole section needs contrast. Sizes are large, medium, and small, with medium as the default and large used more selectively. Production light mode should apply that literally: most action clusters should be one filled button plus one outline button, not two competing filled buttons of equal weight. fileciteturn0file0

Fields are equally clear in the source material. They have a top label, placeholder or replacement text, optional left and right icons, and optional help text. Their states are default, hover, active, filled, error, and disabled. The PDF shows default fields with light placeholder text, hover fields with a slightly darker border, active fields with a darker and slightly thicker border, error fields with a red label and red border, and disabled fields as visibly muted. That should become the production standard everywhere instead of page-specific field styling. fileciteturn0file0

Icons should stay **outline-based**, not filled by default. The PDF gives a strict icon-size-to-stroke map: `16px / 1`, `24px / 1.5`, `32px / 2`, `64px / 4`, and `80px / 5`. It also shows three visual families: generic feather-style icons, custom brand illustrations, and round icon buttons. In production application surfaces, that implies a simple rule: default to outline icons in neutral or teal, reserve orange for accent hits or active badges, and use circular icon buttons only where they act as focused utilities rather than decorative tokens. fileciteturn0file0

Utility controls should remain minimal. The PDF’s checkbox, radio, tabs, breadcrumb, icon-button, and long-text button examples show a deliberately quiet system. Tabs are plain and compact; breadcrumbs are small and subordinate; radio and checkbox controls rely on outline-state clarity; long-text buttons are pill-like and meant for options rather than page-level CTA. That aligns well with the supplied product images, where the best screens rely on calm structural controls and let only one or two actions rise to orange. fileciteturn0file0

A useful hardening rule from the application screenshots is this: **progress and status should default to teal, while orange marks intervention, urgency, or the single action to advance**. That pattern appears repeatedly in calendars, compliance cards, journey modules, and signing/task screens, and it keeps the accent hierarchy understandable at a glance.

## Page patterns

The calendar and workload references consistently use a three-part composition: a navigation rail, a dominant white work surface, and a secondary summary rail. Event pills use teal and orange against white calendar cells, which creates scannability without filling the whole interface with status color. Production calendar-like views should follow that model: white grid first, accent pills second, summary rail third.

The journey and training references follow a different but equally consistent structure. On desktop, they use a large progress header or player block at the top, then modular cards or split content below. On mobile, they stack the player, progress, checklist, and CTA into a single vertical flow with strong radii and generous spacing. The main design lesson here is not just “cards,” but **cards with a clear content hierarchy**: thumbnail or media first, label and explanatory text second, progress bar third, primary action last.

The evidence and artifact references are the densest screens in the set, but they still follow the same softened system. Information is grouped into white cards with mild separation, side panels are visually quieter than the main work panel, and accent color is still limited to labels, filters, confirmations, and actions. That means production evidence views should resist the temptation to become gray enterprise dashboards; density can increase, but the surface language should remain white-first and low-noise.

The mobile policy-detail and e-signature references show the intended tone most directly. They use rounded stacked cards, large pill CTAs, soft atmospheric backgrounds, and clear top-level typography. Even when the screen becomes dense, it still feels gentle. That is probably the single most important visual guardrail for production light mode: density is acceptable, but harshness is not.

## Production guardrails

To keep the implementation aligned with the provided sources, the following hard rules should define light mode. The interface should read as **neutral-first**, not accent-first. Teal should be the most common accent, but orange should remain the most forceful accent. Most cards should stay white or near-white. Strong orange should typically appear once per view as the primary call to action, not on every card in a grid. fileciteturn0file0

Do not turn the light theme into a flat gray enterprise dashboard. The PDF’s color combinations, the neutral guidance, and the supplied product screens all point in the opposite direction: soft backgrounds, clear radii, restrained borders, and accents that float above a mostly calm canvas. Likewise, do not turn it into heavy glassmorphism. The screenshots support a **soft atmospheric shell**, not frosted blur everywhere. fileciteturn0file0

Do not let orange and teal compete equally within one component unless the purpose is explicitly comparative, like dual-series progress or a paired status display. The design-system examples use one dominant voice at a time. If orange is filled, teal should typically become outline, text, or progress. If teal owns the section background or the main header emphasis, orange should be reduced to a single CTA or badge. fileciteturn0file0

Brand recognition should come from the **logo, accent restraint, and type hierarchy**, not from filling large surfaces with bright orange. The creatives page is explicit that the logo is the UI element that retains the bright orange brand recognition most strongly. In the application screens, that same restraint is what makes the light theme feel premium instead of promotional. fileciteturn0file0

## Acceptance criteria

A production light-mode implementation should be considered on-spec only if it meets all of these conditions: the type scale follows the Montserrat/Roboto system; primary and secondary buttons follow the PDF’s role hierarchy; fields, error states, and disabled states match the documented behavior; cards and containers use the radius scale instead of arbitrary corner values; and controls use outline-icon logic with consistent sizing and stroke. fileciteturn0file0

At screen level, it should also pass a visual “distance test.” From a quick glance, the screen should read as **pale atmospheric base + white work surfaces + teal structure + orange action**. If it reads instead as gray dashboard, orange-heavy marketing page, or black-outlined utility screen, it has drifted away from the supplied references.

If a single implementation sentence is needed to harden the current production work, it is this: **ship the PDF as the token and state source of truth, and ship the supplied screenshots as the composition and surface-behavior source of truth**. That combination preserves the brand system while also preserving the exact product feeling the reference images are aiming for.

## Implementation Hardening Addendum

### Production non-negotiables

Production light mode must be implemented as a tokenized product theme, not as scattered page-level overrides. Components should consume shared semantic tokens for surfaces, text, borders, actions, warnings, and status states. Raw hex values should be treated as exceptions that require justification.

The production visual target is:

`pale atmospheric base + white work surfaces + teal structure + orange action`

Any page that instead reads as a gray enterprise dashboard, black-bordered utility UI, orange-heavy marketing screen, or maroon/dark-red legacy theme is off-spec.

### Maroon and CI-ION removal rule

Maroon, burgundy, wine, CI-ION dark red, and red-brown glass surfaces are not part of the production Home Health app theme.

The following patterns are considered production defects when used as surfaces, cards, shells, modal backgrounds, drawers, overlays, hover cards, navigation containers, or glass layers:

* maroon / burgundy / wine naming
* CI-ION theme references
* red-brown dark backgrounds
* `#420808`
* `#0A0202`
* `#310707`
* `#5D0E0E`
* `rgba(66, 8, 8, ...)`
* similar dark red or brown-red theme surfaces

These may not be retained as “dark mode” colors. Dark mode should use navy, charcoal, slate, and clinical teal glass, not maroon.

### Semantic status mapping

Do not use maroon/red-brown for unresolved workflow states.

Use this mapping:

* Normal surface: white / near-white in light mode; navy / charcoal / teal glass in dark mode.
* Selected or active: teal.
* Progress or completion: teal.
* Primary action: orange.
* Needs Evidence / unresolved / attention required: amber-orange warning treatment.
* True destructive or clinical error: red, used sparingly and only for semantic error/destructive states.
* Disabled: neutral muted surface and muted text.

“Needs Evidence” is a warning state, not a maroon card theme.

### Token reconciliation rule

The design system names Teal 500 as `#00797D`. Existing production code may use the near-neighbor Care Indeed teal `#007970`.

Do not churn the entire application solely to normalize this difference during a bug fix. For targeted remediation:

* Preserve existing teal tokens unless the file is already being edited for theme correction.
* Do not introduce a third teal.
* Prefer one canonical production teal alias such as `--ci-teal` or `--brand-primary`.
* Record any teal discrepancy as a future token-normalization item, not as a blocker.

The same rule applies to orange. Do not create new orange families. Use the existing approved orange action family.

### Theme boundary rule

Every theme-sensitive overlay must carry or inherit a clear theme boundary.

This includes:

* modals
* drawers
* bottom sheets
* hover cards
* fixed-position previews
* portals rendered into `body`
* swimlane zoom overlays
* task detail overlays
* evidence/artifact viewers

These components must not rely accidentally on body-level inheritance if they render outside the normal shell tree. They should receive either an explicit `data-theme`, an `isLight` boundary, or local semantic CSS variables.

Theme-sensitive components should consume local semantic tokens such as:

* `--surface-page`
* `--surface-card`
* `--surface-elevated`
* `--surface-popover`
* `--text-primary`
* `--text-muted`
* `--border-subtle`
* `--state-warning-bg`
* `--state-warning-border`
* `--state-warning-text`

Avoid mixing raw `--v3-*`, `--ci-*`, and hardcoded colors directly inside deeply nested components unless the variable is explicitly defined for that component boundary.

### Glass and transparency rule

Glass should be restrained and legible.

Allowed:

* soft milky shell surfaces
* subtle modal/drawer depth
* low-opacity teal or white overlays
* short, soft shadows
* readable text on every layer

Avoid:

* glass on every card
* transparent cards over busy backgrounds
* dark-mode glass that reveals maroon beneath
* light-mode glass that reveals dark navy beneath
* stacked blur layers that reduce readability

If a transparent surface shows the wrong theme underneath, the component needs a stronger local surface token, not another global override.

### Border and shadow rule

Light mode should not use black borders as a visual motif.

Use:

* 1px neutral hairlines
* low-opacity teal borders for active/selected surfaces
* amber borders for warning states
* soft shadows for elevation

Avoid:

* thick black outlines
* heavy gray boxes
* high-contrast borders around every card
* four-sided frame borders around major app regions

### Component-specific acceptance rules

Calendar views:

* white or pale work surface first
* event pills second
* teal for structure/selection/progress
* orange for key action or urgent marker only
* hover cards must stay inside viewport and inherit the correct theme

Swimlane views:

* no maroon modal cards
* step-focus cards use normal surface tokens
* Needs Evidence uses amber-orange warning tokens
* completed states use teal
* connectors remain clean and readable in both modes

Evidence and artifact views:

* dense information is allowed
* surfaces remain soft and structured
* Drive/evidence metadata should be readable and not buried in low-contrast glass
* warning/error states must be semantic, not decorative

Modals and drawers:

* must have explicit theme boundary
* must not bleed dark surfaces into light mode
* must not bleed light surfaces into dark mode
* must avoid maroon/red-brown inherited card backgrounds

### Screenshot QA acceptance checklist

A page passes visual QA only if screenshots in both light and dark modes confirm:

* no Brad/chat bubble obstructing the page
* no accidental hover cards/tooltips/toasts unless intentionally captured
* no maroon/CI-ION runtime surfaces
* no dark-mode bleed in light mode
* no light-mode bleed in dark mode
* no black-border motif
* no flat gray enterprise-dashboard feel
* text contrast is readable
* primary CTA hierarchy is obvious
* teal and orange are not competing everywhere
* warning states are amber/orange, not maroon
* dark mode remains V3-compatible navy/slate/teal, not light-mode inverted

### Implementation priority

When fixing theme bleed, patch in this order:

1. Component-local surface tokens for the visibly broken component.
2. Portal/modal/drawer theme boundary.
3. Shared primitive token mapping.
4. Root token cleanup.
5. Global CSS cleanup only when the global rule is proven to be the cause.

Do not start with broad global overrides. Do not add more `!important` rules unless no safer scoped option exists.

### Non-goals

This design spec does not authorize:

* redesigning the app shell
* changing login/auth visuals
* changing CES/eCign/Drive behavior
* changing print/PDF routes
* changing policy/workflow content
* importing prototype/V5 files into production
* replacing all semantic red globally
* flattening the UI into gray dashboards
* turning the app into a heavy glassmorphism showcase
