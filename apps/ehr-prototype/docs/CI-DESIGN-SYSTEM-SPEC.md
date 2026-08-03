# Care Indeed Design System — extracted spec

Extracted 2026-08-03 from `CI Design System.pdf` (10 boards) by visual transcription.
This is the source of truth for the EHR prototype rebrand.



---

<!-- BOARD 001: Color -->

# CI Design System — Board 001: COLOR

Source: CareIndeed ("The Heart of Home Care.") DESIGN SYSTEM board, page "COLOR". Sidebar navigation on the board (for context of the full system): Color (subsections: Primary, Secondary, Neutral, Sentiment), Color Combinations, Core Buttons, Creatives, Fields, Icons, Padding, Radius, Typography, Utility Buttons. This board covers the four Color subsections only.

## PRIMARY

Two large hero cards, then a 6-step "Color Variations" ramp.

### Hero card 1 — Orange 500
- Swatch: solid dark orange fill, white text.
- HEX: C74601
- HSB: 21 / 100 / 78
- Usage: Reserved for the most critical and prominent elements, such as primary call-to-action (CTA) buttons or key text that requires emphasis or highlighting. Use exclusively on light backgrounds to maintain readability and contrast.

### Hero card 2 — Orange 200
- Swatch: very light peach fill, dark text.
- Printed values on the board: HEX: C74601, HSB: 21 / 100 / 78 — **NOTE: this is almost certainly a typo on the source board.** The printed values duplicate Orange 500, while the card's actual swatch color and the Color Variations row below give Orange 200 = HEX FFEEE5, HSB 21 / 10 / 100. Use FFEEE5 as the true Orange 200 value.
- Usage: A lighter variant of the primary color, designed for prominent elements like CTAs or highlighted text when placed on dark backgrounds. Ensure sufficient contrast by avoiding usage on light backgrounds.

### Color Variations (Orange ramp, darkest → lightest; 600/500/400 show white text, 300/200/100 show dark text)
| Step | HEX | HSB |
|---|---|---|
| Orange 600 | 421700 | 21 / 100 / 26 |
| Orange 500 | C74601 | 21 / 100 / 78 |
| Orange 400 | E56E2E | 21 / 80 / 90 |
| Orange 300 | FFD5BF | 21 / 25 / 100 |
| Orange 200 | FFEEE5 | 21 / 10 / 100 |
| Orange 100 | FFFAF7 | 21 / 3 / 100 |

- Ramp usage rule: Orange includes six variations designed to accommodate different UI component states and styling needs. Darker or lighter shades are used to indicate interactivity. Lighter variations can also be used for borders, shadows, or decorative elements, ensuring brand consistency.

## SECONDARY

Two large hero cards, then a 6-step "Color Variations" ramp. Secondary color = Teal.

### Hero card 1 — Teal 500
- Swatch: solid teal fill, white text.
- HEX: 00797D
- HSB: 182 / 100 / 49
- Usage: Reserved for critical and prominent elements, such as call-to-action (CTA) buttons or key text, when the primary color is not used on the same page or section. Use exclusively on light backgrounds to maintain readability and contrast.

### Hero card 2 — Teal 200
- Swatch: very light cyan fill, dark text.
- HEX: E5FEFF
- HSB: 182 / 10 / 100
- Usage: A lighter variant of the secondary color, designed for prominent elements like CTAs or highlighted text when placed on dark backgrounds. This color functions as an alternative to the primary color (Orange 200), ensuring it catches users' attention in sections where the primary color is not applied.

### Color Variations (Teal ramp, darkest → lightest; 600/500/400 show white text, 300/200/100 show dark text)
| Step | HEX | HSB |
|---|---|---|
| Teal 600 | 004142 | 182 / 100 / 26 |
| Teal 500 | 00797D | 182 / 100 / 49 |
| Teal 400 | 06A6AB | 182 / 96 / 67 |
| Teal 300 | C4F4F5 | 182 / 20 / 96 |
| Teal 200 | E5FEFF | 182 / 10 / 100 |
| Teal 100 | F7FEFF | 182 / 3 / 100 |

- Ramp usage rule: Teal has six variations that serve as an alternative to the primary color. Darker or lighter shades are used to indicate interactivity. Lighter variations can also be used for borders, shadows, or decorative elements, ensuring brand consistency.

## NEUTRAL

Six grays split into two sub-groups of three. Note: all grays are warm — hue 21 (same hue as the brand orange).

### Dark (white text on swatches)
| Step | HEX | HSB |
|---|---|---|
| Gray 600 | 1F1C1B | 21 / 13 / 12 |
| Gray 500 | 524D4B | 21 / 8 / 32 |
| Gray 400 | 7A7470 | 21 / 8 / 48 |

- Usage: The darker neutral shades are primarily used for text, ensuring a clear visual hierarchy. Each variation is suited for specific purposes, such as distinguishing headings, body text, and secondary content. These shades should only be used on light backgrounds to maintain readability and contrast. (Implied mapping: 600 = headings/strongest text, 500 = body text, 400 = secondary content.)

### Light (dark text on swatches)
| Step | HEX | HSB |
|---|---|---|
| Gray 300 | D9D6D5 | 21 / 2 / 85 |
| Gray 200 | E5E4E3 | 21 / 1 / 90 |
| Gray 100 | FAF8F8 | 21 / 1 / 98 |

- Usage: The lighter neutral shades are designed for subtle elements that do not need to be prominent, such as input field borders, placeholder text, and decorative elements. These shades should NOT be used for text on light backgrounds, as they may compromise readability, and are best suited for subtle accents in the UI.

## SENTIMENT

General rules (verbatim intent):
1. The sentiment colors are used to indicate positive, negative, or warning states.
2. They are typically applied to components like alerts and error messages but should be avoided elsewhere on screens to minimize distractions.
3. The darkest shades (the 300 steps) are NOT intended for text and should only be used for non-accessible UI elements, such as borders or icons.

Three sentiment families, each with a large 300 swatch (white text) and two smaller 200/100 swatches (dark text). **There is no Info/blue sentiment color anywhere on this board** — the system defines only success (Green), warning (Yellow), and error (Red).

### Green — Success
- Meaning: Represents positive outcomes, such as success states or correct actions.

| Step | HEX | HSB |
|---|---|---|
| Green 300 | 00854D | 155 / 100 / 52 |
| Green 200 | 73C5A3 | 155 / 42 / 77 |
| Green 100 | E5F4EE | 155 / 6 / 96 |

### Yellow — Warning
- Meaning: Indicates warnings or cautionary messages, such as alerts.

| Step | HEX | HSB |
|---|---|---|
| Yellow 300 | FFC700 | 47 / 100 / 100 |
| Yellow 200 | FFE073 | 47 / 55 / 100 |
| Yellow 100 | FFF9E5 | 46 / 10 / 100 |

(Note: Yellow 100 hue is printed as 46, not 47 — transcribed exactly as shown.)

### Red — Error
- Meaning: Conveys negative states, such as errors or destructive actions.

| Step | HEX | HSB |
|---|---|---|
| Red 300 | D70101 | 0 / 100 / 84 |
| Red 200 | E97474 | 0 / 50 / 91 |
| Red 100 | FBE6E6 | 0 / 8 / 98 |

## Cross-cutting observations
- Scale convention: brand ramps (Orange, Teal, Gray) run 100–600; sentiment ramps run 100–300 only.
- Text-on-swatch convention observed across the board: steps 400+ (and sentiment 300) use white text; steps 300 and below (sentiment 200/100) use dark text — a usable proxy for which steps support white vs dark foreground text.
- All neutral grays share hue 21 with the primary orange (warm gray system).
- Known board defect: Orange 200 hero card prints Orange 500's HEX/HSB (C74601, 21/100/78); correct Orange 200 values are FFEEE5, 21/10/100 per the variations ramp and the swatch's actual rendered color.

### Tokens
- `color-orange-600`: #421700  — Primary ramp darkest; HSB 21/100/26; darker shades indicate interactivity states
- `color-orange-500`: #C74601  — Primary brand color; HSB 21/100/78; primary CTAs / emphasized key text; light backgrounds only
- `color-orange-400`: #E56E2E  — Primary ramp; HSB 21/80/90; interactivity state shade
- `color-orange-300`: #FFD5BF  — Primary ramp light; HSB 21/25/100; borders, shadows, decorative elements
- `color-orange-200`: #FFEEE5  — Light primary variant; HSB 21/10/100; CTAs/highlighted text on dark backgrounds (board's hero card mistakenly prints C74601 for this step)
- `color-orange-100`: #FFFAF7  — Primary ramp lightest; HSB 21/3/100; subtle decorative/border use
- `color-teal-600`: #004142  — Secondary ramp darkest; HSB 182/100/26; interactivity state shade
- `color-teal-500`: #00797D  — Secondary color; HSB 182/100/49; CTAs/key text when primary orange not used on same page/section; light backgrounds only
- `color-teal-400`: #06A6AB  — Secondary ramp; HSB 182/96/67; interactivity state shade
- `color-teal-300`: #C4F4F5  — Secondary ramp light; HSB 182/20/96; borders, shadows, decorative elements
- `color-teal-200`: #E5FEFF  — Light secondary variant; HSB 182/10/100; CTAs/highlighted text on dark backgrounds; alternative to Orange 200
- `color-teal-100`: #F7FEFF  — Secondary ramp lightest; HSB 182/3/100; subtle decorative/border use
- `color-gray-600`: #1F1C1B  — Darkest neutral; HSB 21/13/12; text/headings; light backgrounds only; warm gray (hue 21)
- `color-gray-500`: #524D4B  — Dark neutral; HSB 21/8/32; body text; light backgrounds only
- `color-gray-400`: #7A7470  — Dark neutral; HSB 21/8/48; secondary content text; light backgrounds only
- `color-gray-300`: #D9D6D5  — Light neutral; HSB 21/2/85; input field borders, placeholder, decorative; never as text on light backgrounds
- `color-gray-200`: #E5E4E3  — Light neutral; HSB 21/1/90; subtle UI accents; never as text on light backgrounds
- `color-gray-100`: #FAF8F8  — Lightest neutral; HSB 21/1/98; subtle surfaces/accents
- `color-green-300`: #00854D  — Success/sentiment darkest; HSB 155/100/52; borders or icons only, NOT text (non-accessible)
- `color-green-200`: #73C5A3  — Success mid; HSB 155/42/77; success states/correct actions in alerts
- `color-green-100`: #E5F4EE  — Success lightest; HSB 155/6/96; success alert backgrounds
- `color-yellow-300`: #FFC700  — Warning/sentiment darkest; HSB 47/100/100; borders or icons only, NOT text (non-accessible)
- `color-yellow-200`: #FFE073  — Warning mid; HSB 47/55/100; warnings/cautionary alerts
- `color-yellow-100`: #FFF9E5  — Warning lightest; HSB 46/10/100 (hue printed 46 on board); warning alert backgrounds
- `color-red-300`: #D70101  — Error/sentiment darkest; HSB 0/100/84; borders or icons only, NOT text (non-accessible)
- `color-red-200`: #E97474  — Error mid; HSB 0/50/91; errors/destructive actions in alerts
- `color-red-100`: #FBE6E6  — Error lightest; HSB 0/8/98; error alert backgrounds


---

<!-- BOARD 002: Color Combinations -->

# Board 002 — COLOR COMBINATIONS (CareIndeed Design System)

Page header: large near-black display heading "COLOR COMBINATIONS" (all caps). Left sidebar: CareIndeed logo (orange person-with-radiating-arcs mark) with tagline "The Heart of Home Care.", label "DESIGN SYSTEM", and nav: Color, **Color Combinations** (current page, with sub-items Primary Monotone, Primary Contrast, Secondary Monotone, Secondary Contrast), Core Buttons, Creatives, Fields, Icons, Padding, Radius, Typography, Utility Buttons.

The board defines the four allowed color-pairing systems. Each section = intro copy + a palette strip of allowed swatches (each swatch shows weight number, HEX, HSB) + a rendered example hero card captioned "Example" in small italic gray text.

All four example heroes reuse identical content so only the color treatment differs: headline "Transforming Care, Uplifting Lives.", body "Personalized care plans and expert staffing solutions to improve the lives of seniors.", a filled pill button "Get Started", an outlined pill button "Inquire Now", and a rounded-corner photo (nurse with senior man) that sits on an offset solid-color drop-shadow plate.

## Primary Monotone

Usage rules (paraphrased losslessly):
- Primary Monotone uses the primary color and its six variations, complemented by neutral colors, to create a cohesive and focused design.
- Ensures visual consistency: primary color for key elements (buttons, headlines); neutral colors for text, borders, and subtle accents.
- Darker primary shades emphasize important components; lighter variations and neutrals are for backgrounds, shadows, and non-prominent elements.

Allowed palette strip (6 swatches, darkest → lightest; white label text on 600/500/400, dark text on 300/200/100):

| Weight | HEX | HSB |
|---|---|---|
| 600 | #421700 | 21 / 100 / 26 |
| 500 | #C74601 | 21 / 100 / 78 |
| 400 | #E56E2E | 21 / 80 / 90 |
| 300 | #FFD5BF | 21 / 25 / 100 |
| 200 | #FFEEE5 | 21 / 10 / 100 |
| 100 | #FFFAF7 | 21 / 3 / 100 |

Example hero treatment:
- Card background: very light primary peach tint (primary 100/200 family, ~#FDF3ED (estimated)).
- Headline: primary-500 orange (#C74601, estimated match to swatch).
- Body text: dark warm neutral gray (~#4A4644 (estimated)).
- "Get Started": filled pill, primary-500 background (#C74601 estimated), white text.
- "Inquire Now": outlined pill, thin dark-neutral border (~#524D4B estimated), transparent/white fill, dark neutral text.
- Photo card: large rounded corners, offset solid drop-shadow plate in light peach (primary-300 #FFD5BF (estimated)).
- Caption below card: "Example" (small italic gray).

## Primary Contrast

Usage rules:
- Primary Contrast combines the primary color with subtle accents of the secondary color to create a visually dynamic and engaging design.
- The primary color remains the focal point; the secondary color adds contrast and emphasis to specific elements, such as highlights or secondary buttons.

Allowed palette strip (5 swatches — the allowed pair set):

| Weight | HEX | HSB | Family |
|---|---|---|---|
| 500 | #C74601 | 21 / 100 / 78 | Primary orange |
| 300 | #FFD5BF | 21 / 25 / 100 | Primary peach tint |
| 100 | #FFFAF7 | 21 / 3 / 100 | Primary near-white tint |
| 500 | #00797D | 182 / 100 / 49 | Secondary teal (accent) |
| 500 | #524D4B | 21 / 8 / 32 | Neutral dark gray-brown |

Example hero treatment:
- Card background: same very light primary peach tint as Primary Monotone (~#FDF3ED (estimated)).
- Headline: secondary-500 teal (#00797D estimated) — the secondary accent applied to a highlight element.
- Body text: dark warm neutral (~#4A4644 (estimated)).
- "Get Started": filled pill, primary-500 (#C74601 estimated) background, white text (primary stays the focal CTA).
- "Inquire Now": outlined pill, teal border and teal text (secondary-500 #00797D estimated) on light background (secondary button carries the accent).
- Photo card: rounded, offset peach shadow plate (primary-300 #FFD5BF (estimated)).
- Caption: "Example".

## Secondary Monotone

Usage rules:
- Secondary Monotone uses the secondary color and its six variations, complemented by neutral colors, to create a cohesive and focused design.
- Ensures visual consistency: secondary color for key elements (buttons, headlines); neutral colors for text, borders, and subtle accents.
- Darker secondary shades emphasize important components; lighter variations and neutrals are for backgrounds, shadows, and non-prominent elements.

Allowed palette strip (6 swatches, darkest → lightest; white label text on 600/500/400, dark text on 300/200/100):

| Weight | HEX | HSB |
|---|---|---|
| 600 | #004142 | 182 / 100 / 26 |
| 500 | #00797D | 182 / 100 / 49 |
| 400 | #06A6AB | 182 / 96 / 67 |
| 300 | #C4F4F5 | 182 / 20 / 96 |
| 200 | #E5FEFF | 182 / 10 / 100 |
| 100 | #F7FEFF | 182 / 3 / 100 |

Example hero treatment:
- Card background: very light teal tint (secondary 100/200 family, ~#EFFBFC (estimated)).
- Headline: secondary-500 teal (#00797D estimated).
- Body text: dark neutral (~#4A4644 (estimated)).
- "Get Started": filled pill, secondary-500 teal background (#00797D estimated), white text.
- "Inquire Now": outlined pill, thin dark-neutral border, dark neutral text, transparent/white fill.
- Photo card: rounded, offset solid shadow plate in light teal (secondary-300 #C4F4F5 (estimated)).
- Caption: "Example".

## Secondary Contrast

Usage rules:
- Secondary Contrast combines the secondary color with subtle accents of the primary color to create a visually dynamic and engaging design.
- The secondary color remains the focal point; the primary color adds contrast and emphasis to specific elements, such as highlights or secondary buttons.

Allowed palette strip (4 swatches — the allowed pair set):

| Weight | HEX | HSB | Family |
|---|---|---|---|
| 500 | #00797D | 182 / 100 / 49 | Secondary teal |
| 400 | #06A6AB | 182 / 96 / 67 | Secondary teal (lighter) |
| 200 | #E5FEFF | 182 / 10 / 100 | Secondary near-white tint |
| 200 | #FFEEE5 | 21 / 10 / 100 | Primary peach tint (accent) |

Example hero treatment (only example with a saturated full-bleed background):
- Card background: solid secondary-500 teal (#00797D estimated) filling the whole hero.
- Headline: white (#FFFFFF estimated).
- Body text: white (#FFFFFF estimated).
- "Get Started": filled pill in very light teal (secondary-200 #E5FEFF (estimated)) with teal text (secondary-500 estimated) — inverted CTA on dark ground.
- "Inquire Now": outlined pill, white border, white text, transparent over teal.
- Photo card: rounded, offset solid shadow plate in lighter teal (secondary-400 #06A6AB (estimated)).
- Caption: "Example".

## Cross-board observations

- Swatch label anatomy is uniform: weight number (top), "HEX: <value>", "HSB: <H / S / B>".
- Hue is constant per family: primary family H=21 (orange), secondary family H=182 (teal); tints reduce S while B rises to 100.
- #00797D (secondary-500) appears in both contrast strips as the bridge accent; #FFEEE5 / #FFD5BF are the primary-tint counterparts.
- The only neutral given a printed value on this board is 500 #524D4B (HSB 21/8/32), listed inside the Primary Contrast set for text/neutral duty.
- Buttons in every example are full pill radius; primary CTA is always filled, secondary CTA always outlined.
- No explicit "don't" rows appear on this board; allowed combinations are expressed positively via the palette strips.

### Tokens
- `color-primary-600`: #421700  — Primary Monotone strip; HSB 21/100/26; darkest primary, emphasis components
- `color-primary-500`: #C74601  — Primary Monotone + Primary Contrast strips; HSB 21/100/78; core brand orange, filled CTA background, monotone headline
- `color-primary-400`: #E56E2E  — Primary Monotone strip; HSB 21/80/90
- `color-primary-300`: #FFD5BF  — Primary Monotone + Primary Contrast strips; HSB 21/25/100; peach tint, photo-card offset shadow plate in primary examples
- `color-primary-200`: #FFEEE5  — Primary Monotone + Secondary Contrast strips; HSB 21/10/100; primary accent tint allowed on teal grounds
- `color-primary-100`: #FFFAF7  — Primary Monotone + Primary Contrast strips; HSB 21/3/100; near-white primary tint for backgrounds
- `color-secondary-600`: #004142  — Secondary Monotone strip; HSB 182/100/26; darkest teal
- `color-secondary-500`: #00797D  — Secondary Monotone, Primary Contrast, Secondary Contrast strips; HSB 182/100/49; core teal — accent headlines/outlined buttons in Primary Contrast, hero background in Secondary Contrast
- `color-secondary-400`: #06A6AB  — Secondary Monotone + Secondary Contrast strips; HSB 182/96/67; photo-card shadow plate on teal hero
- `color-secondary-300`: #C4F4F5  — Secondary Monotone strip; HSB 182/20/96; light teal, photo-card shadow plate in Secondary Monotone example
- `color-secondary-200`: #E5FEFF  — Secondary Monotone + Secondary Contrast strips; HSB 182/10/100; inverted CTA fill on teal ground
- `color-secondary-100`: #F7FEFF  — Secondary Monotone strip; HSB 182/3/100; near-white teal tint for backgrounds
- `color-neutral-500`: #524D4B  — Primary Contrast strip; HSB 21/8/32; dark warm neutral for text/borders/subtle accents
- `color-example-body-text`: #4A4644 (estimated)  — Body copy color in all four example heroes; no printed value on board
- `color-example-bg-primary-tint`: #FDF3ED (estimated)  — Hero card background in Primary Monotone and Primary Contrast examples; light primary tint, no printed value
- `color-example-bg-secondary-tint`: #EFFBFC (estimated)  — Hero card background in Secondary Monotone example; light teal tint, no printed value
- `color-white`: #FFFFFF (estimated)  — Filled-button label text; headline/body/outline-button on Secondary Contrast teal hero
- `color-heading-display`: #262220 (estimated)  — Page title COLOR COMBINATIONS and section headings; near-black warm neutral, no printed value
- `combo-primary-monotone`: primary 600/500/400/300/200/100 + neutrals  — Allowed pair set: primary family only, neutrals for text/borders/accents
- `combo-primary-contrast`: primary-500 + primary-300 + primary-100 + secondary-500 + neutral-500  — Allowed pair set: primary focal, secondary-500 as accent
- `combo-secondary-monotone`: secondary 600/500/400/300/200/100 + neutrals  — Allowed pair set: secondary family only, neutrals for text/borders/accents
- `combo-secondary-contrast`: secondary-500 + secondary-400 + secondary-200 + primary-200  — Allowed pair set: secondary focal, primary-200 as accent
- `button-shape`: full pill radius  — All example CTAs; filled = primary action, 1px-outline = secondary action (no px value printed on this board)


---

<!-- BOARD 003: Core Buttons -->

# CI Design System — Board 003: CORE BUTTONS

> Source: 4 overlapping tiles (p003-t01..t04, 2048px-wide renders). No hex/px values are printed on the board; every color below was pixel-sampled from the renders and every dimension measured in render pixels. The board renders at ~1.71x of a ~1200px logical layout (derived from the clean 30/45/60 size progression); "logical" values are estimates at that scale and are marked (estimated). Page chrome: left sidebar with CareIndeed logo (orange person-with-radiating-arcs mark), tagline "The Heart of Home Care.", heading "DESIGN SYSTEM", nav items: Color, Color Combinations, **Core Buttons** (active/darker, with sub-items Types, Colors, Sizes, States, Shades), Creatives, Fields, Icons, Padding, Radius, Typography, Utility Buttons. Sidebar/body text #524D4B; active nav item and H1/H2 headings #1F1C1B.

## CORE BUTTONS (intro)
"Use the core buttons to enable users to perform actions or navigate the interface. They come in various styles and states to support tasks like submitting forms, triggering events, or linking to new pages."

All example buttons on the board are pill-shaped (fully rounded, radius = height/2) with a download icon (down-arrow into tray, stroke style, same color as label, ~1.2x cap-height) + the label "Download".

## TYPES
Intro (repeated for section): primary buttons are for the most important actions on a page (submitting a form, completing a key task); they stand out visually to guide users toward critical interactions.

- **Primary** — filled pill: background #C74601 (orange), white #FFFFFF label + icon, no border. Rule: use for the most important actions on a page, such as submitting a form or completing a key task; stands out to guide users toward critical interactions.
- **Secondary** — outline pill: white/transparent background, 1px (logical, est.) border #C74601, label + icon #C74601. Rule: use for actions of lesser importance or as an alternative to a primary button; provides clear visual hierarchy while maintaining functionality.
- **Inline** — text link: label + icon #C74601 with #C74601 underline, no container. Rule: inline buttons are embedded within text, allowing actions without breaking content flow; used for actions of the least importance; subtle interactivity within the design.

Type examples are medium size (76px render / ~45px logical tall).

## COLORS
Rules: "Buttons come in three colors: orange, teal, and gray. Orange and teal are used for most actions, ensuring they stand out as primary or secondary buttons." / "Gray is reserved for cases where subtlety or equal emphasis is required, such as additional call-to-actions. All button colors must adhere to the provided color palettes for consistency and accessibility."

Each color row shows filled / outline / inline variants:
- **Orange**: filled bg #C74601 + white text; outline border+text #C74601; inline underlined text #C74601.
- **Teal**: filled bg #00797D + white text; outline border+text #00797D; inline underlined text #00797D.
- **Gray**: filled bg #524D4B + white text. NOTE (as rendered on the board): the Gray row's outline and inline examples are shown in ORANGE (#C74601), not gray — gray appears to exist only as the solid/filled variant; outline/inline fall back to orange.

## SIZES
Rules: "Buttons are available in three sizes: large, medium, and small. Medium is the default size, commonly used on desktop and tablet." / "Small is primarily used on mobile, where space is limited and a more compact design is needed." / "Large is rarely used but is ideal for scenarios like a marketing landing page with a single, prominent call-to-action."

Size examples are teal (#00797D) and each row shows filled / outline / inline (inline text scales with the size):
| Size | Height (render px) | Height (logical, est. @1200px layout) | Label cap-height (render) | Font size (est.) |
|---|---|---|---|---|
| Large | 102px | ~60px | 28px | ~22–24px |
| Medium (default) | 76px | ~45px | 18px | ~15–16px |
| Small | 51px | ~30px | 15px | ~12px |

Clean 2 : 1.5 : 1 height ratio (Large = 2x Small; Medium = 1.5x Small). Measured large-button metrics (render px): total width 329; left padding 42 (~25 logical); icon 31px square (~18 logical); icon-to-label gap 22 (~13 logical); right padding 45 (~26 logical). Radius always height/2 (full pill). Medium is used for every other example on the board (types, colors, states, shades rows all measure 76–77px render).

## STATES
Intro: "Use states to indicate a button's interaction status, providing users visual feedback to ensure clarity and usability and guiding their actions effectively." States are demonstrated on the orange family, one row per state with filled / outline / inline variants. (No Focus state is documented on this board; the five states are Default, Hover, Pressed, Active, Disabled.)

- **Default** — "The button's resting appearance, ready for interaction."
  - Filled: bg #C74601, text/icon #FFFFFF.
  - Outline: 1px border #C74601, text/icon #C74601, white bg.
  - Inline: text/icon #C74601 with #C74601 underline.
- **Hover** — "Indicates interactivity when a pointer is placed over the button."
  - Filled: bg darkens to #421700 (very dark brown), text/icon #FFFFFF.
  - Outline: border and text/icon both darken to #421700, white bg.
  - Inline: text/icon #421700; no underline visible in render.
- **Pressed** — "The appearance when the button is clicked or tapped."
  - Filled: bg #FFD5BF (light peach), text/icon #421700, no border.
  - Outline: thicker border (~2px logical, est.) #E56E2E (brighter orange), text/icon #421700, white bg.
  - Inline: becomes a small rounded-rect box — thin ~1px #E56E2E border, white bg, text/icon #421700, small corner radius (~6px logical, est.), no underline.
- **Active** — "Shows the button is selected or currently in use."
  - Filled: bg #421700, text/icon #FFFFFF, plus an outer ring/halo of #FFD5BF (~3px logical, est.) hugging the pill edge.
  - Outline: 1px border #C74601, text/icon #421700, white bg.
  - Inline: rounded-rect background tint #FFEEE5 (pale cream/peach), text/icon #421700, no border, no underline.
- **Disabled** — "Indicates the button is inactive and cannot be interacted with."
  - Filled: bg #E5E4E3 (light gray), text/icon #7A7370 (warm gray).
  - Outline: 1px gray border #7A7370 (renders slightly lighter, ~#8D8785 at edges), text/icon #7A7370, white bg.
  - Inline: text/icon #D9D6D5 (very light gray), no underline.

## SHADES
Rules: "Dark-shaded buttons on light surfaces are the default choice, ensuring strong contrast and readability." / "Light-shaded buttons are typically avoided unless a dark background is necessary to strongly emphasize an entire section or UI component that need to stand out."

- **Dark** (shown on white page background): filled bg #C74601 + white text; outline border+text #C74601; inline underlined #C74601. (= the standard dark-on-light set.)
- **Light** (shown on a full-width solid teal #00797D band): filled bg #FFEEE5 (cream) with text/icon #421700 (dark brown); outline 1px border #FFEEE5 with text/icon #FFEEE5; inline text/icon #FFEEE5, no underline visible.

## Cross-cutting observations
- Shape language: every button is a full pill (radius = height/2); only pressed-inline and active-inline use small-radius rectangles.
- The dark interaction color #421700 (hover/active fills, pressed/active text) is a very dark brown derived from the orange hue, not black.
- Interaction tints ladder for orange: #C74601 (default) → #421700 (hover/active dark) → #FFD5BF (pressed fill / active ring) → #FFEEE5 (active-inline tint / light-shade fill) → #E56E2E (pressed border accent).
- Gray fill #524D4B doubles as the board's body-text color; heading color is #1F1C1B.
- Download icon is stroked, always matches label color, vertically centered, placed left of the label.
- Typography (context, estimated): geometric sans (Montserrat-like) for headings and button labels; H1 "CORE BUTTONS" cap-height 73px render (~60px font est.), H2 section heads (TYPES/COLORS/SIZES/STATES/SHADES) cap 36px render (~30px font est.), H3 row labels (Primary/Orange/Large/Default/Dark, etc.) cap 27px render (~22px font est., color #524D4B), body cap 19px render (~16px font est., color #524D4B).

### Tokens
- `color-orange-500`: #C74601  — Primary brand orange — primary filled bg, secondary border/text, inline text+underline, active-outline border (sampled)
- `color-teal-500`: #00797D  — Teal — filled bg, outline border/text, inline text; also the dark band behind light-shade examples (sampled)
- `color-gray-700`: #524D4B  — Gray filled button bg; also body/sidebar text color (sampled)
- `color-brown-900`: #421700  — Hover+active filled bg; hover outline border/text; pressed/active text; light-shade filled text (sampled)
- `color-peach-300`: #FFD5BF  — Pressed filled bg; active filled outer ring (sampled)
- `color-cream-100`: #FFEEE5  — Active inline bg tint; light-shade filled bg and light-shade outline border/text (sampled)
- `color-orange-400-pressed-border`: #E56E2E  — Pressed outline thick border; pressed inline box border (sampled)
- `color-disabled-bg`: #E5E4E3  — Disabled filled background (sampled)
- `color-disabled-fg`: #7A7370  — Disabled text/icon and disabled outline border (sampled)
- `color-disabled-inline`: #D9D6D5  — Disabled inline text (sampled)
- `color-white`: #FFFFFF  — Filled-button label/icon; outline button bg; page bg
- `color-heading`: #1F1C1B  — H1/H2 headings and active sidebar nav item (sampled)
- `color-body-text`: #524D4B  — Body copy, H3 labels, sidebar items (sampled)
- `button-height-large`: ~60px (102px @ board render; estimated logical @1200px layout)  — Large — rare, marketing landing single prominent CTA
- `button-height-medium`: ~45px (76px @ board render; estimated)  — Medium — default size, desktop/tablet; used by all type/color/state/shade examples
- `button-height-small`: ~30px (51px @ board render; estimated)  — Small — primarily mobile/compact; heights ratio Large:Medium:Small = 2:1.5:1
- `button-radius`: height/2 (full pill)  — All button sizes and states
- `button-radius-inline-box`: ~6px (estimated)  — Pressed-inline box and active-inline tint rect
- `button-border-width`: 1px (estimated from 1-2px render)  — Outline buttons: default, hover, active, disabled
- `button-border-width-pressed`: ~2px (estimated from 2-4px render)  — Pressed outline button thicker border, color #E56E2E
- `button-active-ring`: #FFD5BF, ~3px (estimated)  — Halo ring around active filled button
- `button-font-size-large`: ~22-24px (cap-height 28px render; estimated)  — Large button label
- `button-font-size-medium`: ~15-16px (cap-height 18px render; estimated)  — Medium/default button label
- `button-font-size-small`: ~12px (cap-height 15px render; estimated)  — Small button label
- `button-padding-x-large`: ~25px (42-45px render; estimated)  — Large button horizontal padding; paddings scale down with size
- `button-icon-gap`: ~13px (22px render; estimated)  — Gap between download icon and label, large button
- `button-icon-size`: ~18px at large (31px render; estimated), scales with label  — Stroked download (arrow-into-tray) icon, matches label color
- `font-size-h1`: ~60px (cap 73px render; estimated) Montserrat-like geometric sans  — Board title CORE BUTTONS, color #1F1C1B
- `font-size-h2`: ~30px (cap 36px render; estimated)  — Section headings TYPES/COLORS/SIZES/STATES/SHADES, uppercase, #1F1C1B
- `font-size-h3`: ~22px (cap 27px render; estimated)  — Row labels (Primary, Orange, Large, Default, Dark...), #524D4B
- `font-size-body`: ~16px (cap 19px render; estimated)  — Paragraph copy, #524D4B


---

<!-- BOARD 004: Creatives -->

# CI Design System — Board 004: CREATIVES

Page context: left sidebar shows the CareIndeed logo (angel icon + "CareIndeed" wordmark + tagline "The Heart of Home Care.") above a "DESIGN SYSTEM" nav. Nav items in order: Color, Color Combinations, Core Buttons, **Creatives** (active section, dark/bold text; sub-items indented beneath it: Images, Illustrations, Logos), Fields, Icons, Padding, Radius, Typography, Utility Buttons. Inactive items are mid-gray; the active "Creatives" item is near-black. A thin light-gray vertical rule separates sidebar from content.

## CREATIVES (page title, large near-black display heading, all caps)

Intro copy (carried over from the Icons section, printed at the top of this board):
- "All icons are designed in an outline style to maintain visual consistency."
- "Icons should always follow the provided sizes whenever possible. If a different size is needed, ensure the ratio between the icon size and line stroke is preserved."
- "New icons can be added as long as they adhere to the same outline style and design principles."

## IMAGES (section heading, all caps)

Lead: "Our images reflect our brand's commitment to positivity, warmth, and connection with our target audiences."

### Target Audiences
- All images should resonate with one or more of the key audiences: **seniors and their families, healthcare workers, or medical staffing facilities**.
- Images should feel relevant, relatable, and appealing to these groups.
- Example photo alongside: caregiver assisting a smiling senior woman exercising with small pink dumbbells in a bright living room.

### Quality of Life
- Images should portray individuals enjoying a great quality of life.
- They need not exude wealth, but should reflect comfort, care, and well-being — an aspirational yet approachable tone.

### Emotional Tone
- Joy and positivity are essential.
- Images should feature people smiling and engaging warmly, conveying hope and satisfaction.
- **Avoid** visuals that depict sadness, pain, or struggle.
- Example photo alongside: two doctors/clinicians smiling and talking in a bright clinic hallway.

### Color and Lighting
- Warm colors and lighting should dominate to evoke feelings of comfort and happiness.
- This creates a welcoming and reassuring visual atmosphere.

### Inclusivity
- All images should prioritize inclusivity in race, gender, and cultural representation, to reflect the diversity of the audiences and foster a sense of belonging and connection.
- Example photo alongside: multi-generational family (four adults, mixed ages) embracing outdoors under blossoming trees.

### Stand-Alone Images
- Images that stand alone — outside of cards or other UI components — must have **rounded corners**, with the **radius determined by the image size**.
- They must also include a **solid (non-blurred) shadow**, with the **shadow color drawn from the relevant color palette for the page** to ensure visual harmony.
- Visual treatment shown on all three example photos on this board: large rounded corners; a solid flat peach shadow (#FFD5BF, estimated) offset down-and-right behind the photo (shadow itself also has rounded corners). Note the bottom-left corner of the photo appears square where it meets the shadow while other corners are rounded, i.e. shadow offset ~8–12px right/down at this render size.

## ILLUSTRATIONS (section heading, all caps)

- "All illustrations are custom-made and adhere to the brand's color palette. **Teal is the primary color used, with orange as an accent** to add visual interest."
- "Colors can be adjusted based on the context of use, such as using **darker shades on light backgrounds**, to ensure clarity and harmony within the design."

Illustration library shown as a 4-column gallery (flat vector style, white/transparent background, soft light-teal blob backdrops, characters in teal scrubs/clothing with orange accents). Subjects, left-to-right, top-to-bottom:
1. Woman with laptop at a standing desk beside a large browser/screen mockup (teal UI blocks, orange content block).
2. Two people arranging sticky notes on a giant spiral-bound calendar (teal calendar, orange circle annotation).
3. Team meeting: three people seated viewing a presentation board with charts (orange up-trending line chart, teal pie chart), potted plant in orange pot.
4. Error/empty state: large monitor with X close boxes, magnifier with orange X, gear icons, "NO DATA" orange document with sad face.
5. Stack of books (teal + orange spines), apple, person sitting atop with a lightbulb balloon (peach/orange) in clouds.
6. 24/7 support: woman with headscarf at laptop beside a giant phone with handset icon, "24/7" teal speech bubble, quote bubble, orange "?" tile.
7. Steps/pathway to care: person climbing teal stair-spiral toward a large orange circular cross (medical plus) badge; chat, heart, checklist icons around.
8. Caregivers with senior: elderly patient in wheelchair assisted by two caregivers in teal scrubs, orange plus speech bubble above.
9. Seniors on sofa: elderly couple seated on a peach couch with a caregiver, teal shield-with-cross badge in a thought bubble above.
10. Payments/wallet: woman at a giant phone showing a teal "WALLET" app screen with checkmark, PAY button, teal credit card and orange money fan.
11. Security/biometrics: man leaning on giant teal credit card beside phone showing a fingerprint, teal shield with cross (medical plus) in front.
12. Education/analytics: person standing on stacked orange books pointing at a bar chart screen, two students at desks watching, teal clock behind.
13. Community/team: large diverse group of people (teal and orange clothing) cheering, including a person in a wheelchair and a person with a bicycle.
14. Email (teal variant): laptop with open envelope on screen, teal envelopes flying above, plant with orange leaves.
15. Email (orange variant): same laptop/envelope composition mirrored with orange envelopes and teal-leaved plant.

Estimated illustration palette (sampled from artwork, no hex printed on board):
- Primary teal #06A6AB (estimated)
- Dark teal (darker shade for light backgrounds) #00797D (estimated)
- Deepest teal/ink #004142 (estimated)
- Light teal tint (backdrops/blobs) #9FE2E4 (estimated)
- Accent orange #E56E2E (estimated)
- Deep orange #C74601 (estimated)
- Peach tint #FFD5BF (estimated)
- Dark brown line/ink accents #421700 (estimated)

## LOGOS (section heading, all caps)

Lead: "The Care Indeed logo is the **only UI element that retains the bright orange color**, ensuring brand recognition and consistency. There are **two variations, each with dark and light versions** to suit different backgrounds."

### Complete Logo
- Includes both the company name and the angel icon; primarily used on **desktop screens**.
- Lockup composition: orange angel icon (a circle head above a second stroked circle, flanked by three concentric arc "wings" per side) at left, overlapping the wordmark "CareIndeed"; tagline "The Heart of Home Care." set smaller, right-aligned under "Indeed".
- Shown in two side-by-side specimens:
  - **Light version (for light backgrounds):** white background panel (thin light-gray border); icon strokes bright orange (#F36221, estimated); wordmark near-black (#2E2E2E, estimated); tagline same near-black.
  - **Dark version (for dark backgrounds):** dark warm-gray/brown panel (#524D4B, estimated); icon strokes stay bright orange (#F36221, estimated); wordmark and tagline switch to white (#FFFFFF).

### Small Logo
- Features **only the angel icon**; primarily used on **mobile screens**.
- Can also serve as a **decorative element** or be **incorporated into animations**.
- Shown in two side-by-side specimens:
  - **Light version:** white panel (thin light-gray border), icon entirely bright orange (#F36221, estimated), drawn at a heavier stroke weight than in the complete lockup.
  - **Dark version:** dark warm-gray/brown panel (#524D4B, estimated), icon entirely white (#FFFFFF).

Note: the board topic listing mentions clearspace and misuse rules, but no clearspace diagrams or misuse (don't) examples are rendered anywhere on this board's tiles — the Logos section ends after the Small Logo specimens. The tagline appears only as part of the Complete Logo lockup: "The Heart of Home Care."

### Tokens
- `color-logo-orange`: #F36221 (estimated)  — Brand/logo orange — angel icon strokes in both Complete and Small logo, light and dark versions; the only UI element allowed to retain bright orange
- `color-logo-wordmark-dark`: #2E2E2E (estimated)  — 'CareIndeed' wordmark and tagline color on light backgrounds
- `color-logo-wordmark-light`: #FFFFFF  — Wordmark, tagline, and Small Logo icon color on dark backgrounds
- `color-logo-dark-bg`: #524D4B (estimated)  — Dark warm-gray panel used behind dark logo versions
- `color-image-shadow-peach`: #FFD5BF (estimated)  — Solid offset shadow behind stand-alone photos on this page; rule: shadow color drawn from the page's relevant palette
- `color-illustration-teal-primary`: #06A6AB (estimated)  — Primary teal of custom illustrations
- `color-illustration-teal-dark`: #00797D (estimated)  — Darker teal shade, used for contrast/outlines and per rule 'darker shades on light backgrounds'
- `color-illustration-teal-deepest`: #004142 (estimated)  — Deepest teal ink accents in illustrations
- `color-illustration-teal-light`: #9FE2E4 (estimated)  — Light teal tint used for background blobs in illustrations
- `color-illustration-orange-accent`: #E56E2E (estimated)  — Orange accent color in illustrations
- `color-illustration-orange-deep`: #C74601 (estimated)  — Deep orange used in illustrations (e.g. envelopes, badges)
- `color-illustration-peach-tint`: #FFD5BF (estimated)  — Peach tint in illustrations (couch, bubbles, backdrops); same value as image shadow peach
- `color-illustration-ink-brown`: #421700 (estimated)  — Dark brown line/ink accents in illustrations
- `logo-tagline-text`: The Heart of Home Care.  — Tagline string, part of the Complete Logo lockup, right-aligned under 'Indeed'
- `radius-standalone-image`: proportional to image size (no px printed)  — Stand-alone images: rounded corners with radius determined by image size
- `shadow-standalone-image`: solid flat shadow, offset down-right ~8-12px at render size (estimated), color from page palette  — Stand-alone images must include a solid shadow drawn from the page's color palette


---

<!-- BOARD 005: Fields -->

# Board 005 — FIELDS

> CareIndeed Design System ("The Heart of Home Care."). Sidebar navigation on this page: Color, Color Combinations, Core Buttons, Creatives, **Fields** (active — sub-items: Anatomy, States, Examples), Icons, Padding, Radius, Typography, Utility Buttons. Active sidebar item is near-black (#1F1C1B); inactive items are warm gray (~#524D4B). Logo mark is orange (~#F36221, sampled).

**Intro:** Use fields to allow users to input information, such as text or numbers. These components are used to build forms and are typically paired with buttons like "Submit" or "Subscribe" to complete actions.

*Note: this board prints no hex/px values anywhere — every color below was pixel-sampled from the rendered board and is marked (estimated).*

## ANATOMY

Annotated diagram: a text field with top label "Label", a search (magnifier) left icon, placeholder "Label", a location-pin right icon, and "Help text" below-left. Numbered callout badges are peach circles (#FFD5BF fill, estimated) with thin peach connector lines (#FFEEE5, estimated). The anatomy specimen field itself: white fill, 1px light-gray border (#D9D6D5, estimated), large rounded corners (~10px radius at render scale, estimated); icons and placeholder are mid warm-gray (#7A7370, estimated); the top label and help text are near-black (#1F1C1B, estimated).

1. **Top Label** — A title above the text field that indicates its purpose. It can be removed only if the placeholder text serves as a replacement to ensure the field's purpose is still clear to the user.
2. **Placeholder Text** — A hint displayed within the text field, typically matching the top label. It disappears in the active state and cannot be removed to ensure accessibility.
3. **Left Icon** — A visual aid that provides context for the input's content. This is optional and can be removed.
4. **Help Text** — Additional information to assist users in completing the field. It is optional, except in error states where it explains the issue.
5. **Right Icon** — Another visual aid for the input's content, often used for functionality like clearing the field or revealing the input. This can also be removed.

## STATES

All state specimens use a top label "First Name" and a full-width rounded-rectangle input (~8px corner radius at render scale, estimated), white background, with label above in near-black (#1F1C1B, estimated) regular weight.

### Default
Rule: A text field in its default state displays placeholder text in a light font color, signaling readiness for user interaction.
- Border: 1px light gray — **#D9D6D5 (estimated)**
- Background: **#FFFFFF**
- Placeholder text "First Name": mid warm-gray — **#7A7370 (estimated)**
- Label: near-black **#1F1C1B (estimated)**

### Hover
Rule: When a user hovers over a text field, the border darkens slightly to indicate interactivity.
- Border: ~1.5px mid warm-gray — **#7A7370 (estimated)**
- Background: **#FFFFFF**; placeholder unchanged (#7A7370)

### Active
Rule: An active text field has a darker, slightly thicker border and displays a type bar (text cursor), indicating it is ready for input.
- Border: ~2px near-black — **#1F1C1B (estimated)**
- Background: **#FFFFFF**
- Shows partial user input "Jan" with a text caret; input text near-black **#1F1C1B (estimated)**; placeholder is gone.

### Filled
Rule: A filled text field contains user input, replacing the placeholder text with the entered information.
- Border: ~1.5px near-black/dark charcoal — sampled **#353332 (estimated; visually the same near-black as Active rendered at a thinner stroke, i.e. likely the same #1F1C1B token)**
- Background: **#FFFFFF**
- Entered value "Janella" in near-black **#1F1C1B (estimated)**

### Error
Rule: An error text field highlights invalid input with a red label and border, accompanied by a red error message to prompt correction.
- Border: ~1.5px red — sampled **#DC2121 (estimated; core red reads #D70101)**
- Label "First Name": red — **#D70101 (estimated)**
- Background: **#FFFFFF**; invalid value shown "0912948402" in near-black
- Error/help message below field: "Please enter a valid first name." in red **#D70101 (estimated)**

### Disabled
Rule: A disabled text field is visually muted and indicates that interaction is unavailable. It does not respond to user actions, cannot be focused, and is excluded from assistive technologies like screen readers.
- Background: light gray fill — **#E5E4E3 (estimated)**
- Border: none visible (flat gray fill, same #E5E4E3)
- Label "First Name": muted gray **#7A7370 (estimated)**
- Placeholder "First Name": gray-on-gray, darkest glyph pixels ~**#7A7370 (estimated; appears lighter/muted)**

Body copy for all rules is set in warm dark-gray (~#5C5755, estimated); section headings ("STATES", "ANATOMY", "EXAMPLES") and state sub-headings ("Default", "Hover"…) are near-black/dark gray in the display typeface.

## EXAMPLES

### Example 1 — Newsletter signup card (light)
Rounded card with very light cyan/ice background (**#F7FEFF, estimated**). Copy: "Learn more by joining the 34,000+ Care Indeed Community!" (dark text). Three stacked default-state fields with white fill and light gray borders (**#CBC9C8 border, estimated**; ~12px radius): placeholders "First Name", "Last Name", "Email Address" (#7A7370). Below: full-width pill button, teal background **#00797D (estimated)**, white label "Subscribe to Our Newsletter".

### Example 2 — Newsletter banner (on-teal)
Solid teal banner **#00797D (estimated)**. White display heading: "JOIN the 34,000+ Care Indeed Community". White body copy: "Get the latest home care news, tips, and resources straight to your inbox." One pill-shaped field, white fill **#FFFFFF**, center-aligned placeholder "First Name" (#7A7370, estimated), no visible border on teal. Below it a pill button with peach background **#FFEEE5 (estimated)** and very dark brown/maroon label text **#421700 (estimated)**: "Subscribe to Our Newsletter". (Shows the on-teal inverse pairing: white field + peach button.)

### Example 3 — Mobile "Create Your Account" screen (iOS)
Status bar: 5:13, cellular/wifi icons, battery 76. Screen background is warm off-white/cream **#FFFAF7 (estimated)** in the header area, white **#FFFFFF** behind the form. Orange serif-ish heading "Create Your Account" — **#CC4801 (estimated)**. Below it a 3-segment step/progress indicator: first segment active teal **#06AEB3 (estimated)**, remaining segments inactive light gray **#D1CECD (estimated)**.

Form fields (all with required asterisk `*` on the label):
- "First Name *" — filled state, value "John", near-black border **#1F1C1B (estimated)**, white fill, ~12px radius.
- "Last Name *" — filled state, value "Doe", same styling.
- "Email Address *" — error state: red label (**#D70101/#DB1F1E family, estimated**), red border (**#D91313, estimated**), value "used@gmail.com", red error help text below: "This email already exists. Please log in to continue."
- "Phone Number *" — default state: light gray border **#DCDAD9 (estimated)**, placeholder "Phone Number *" in #7A7370.

Legal copy (dark warm gray **#534E4C, estimated**): "By creating an account, you agree to Care Indeed's Terms of Use and Privacy Policy." — "Terms of Use" and "Privacy Policy" are underlined links.

Primary CTA in disabled state (form has an error / incomplete): pill button "Create Account", background **#E5E4E3 (estimated)**, label text muted gray **#9E9691 (estimated)** — demonstrates the disabled button pairing with invalid form state.

Below: "Already have an account?  Log In" — "Log In" underlined, dark warm gray (#534E4C, estimated). CareIndeed logo (orange mark + wordmark, tagline "The Heart of Home Care."). Bottom-right: circular teal chat FAB (**#026366, estimated — darker teal**) with a white chat/messages icon. iOS home indicator bar at bottom.

## Implied usage rules (synthesis of board content)
- Field states progression: border D9D6D5 (default) → 7A7370 (hover) → 1F1C1B thick + caret (active) → near-black thin (filled); red family for error (border + label + message all red); flat #E5E4E3 fill with no border for disabled.
- Error state always pairs the red border with a red label AND a red explanatory help message.
- Help text is optional everywhere except error states, where it is required to explain the issue.
- Placeholder can never be removed (accessibility); top label may be removed only when the placeholder fully conveys the field purpose.
- Both icons are optional and removable; right icon is preferred for functional actions (clear field, reveal password).
- Required fields are marked with an asterisk on the label (mobile example).
- A form containing an error/incomplete required fields shows its submit button in the disabled style (#E5E4E3 bg / #9E9691 text).

### Tokens
- `field-bg-default`: #FFFFFF  — Input background in default/hover/active/filled/error states (estimated, sampled)
- `field-border-default`: #D9D6D5  — 1px border, default state (estimated, sampled)
- `field-border-hover`: #7A7370  — Slightly darker border on hover (estimated, sampled)
- `field-border-active`: #1F1C1B  — Darker, slightly thicker (~2px) border with text caret (estimated, sampled)
- `field-border-filled`: #353332  — Filled-state border; visually same near-black as active at thinner stroke — likely same #1F1C1B token (estimated, sampled)
- `field-border-error`: #DC2121  — Error-state border; core red reads #D70101 (estimated, sampled); mobile example sampled #D91313
- `field-bg-disabled`: #E5E4E3  — Disabled field flat fill, no border (estimated, sampled)
- `field-label-text`: #1F1C1B  — Top label, near-black (estimated, sampled)
- `field-label-text-error`: #D70101  — Red label in error state (estimated, sampled)
- `field-label-text-disabled`: #7A7370  — Muted label on disabled field (estimated, sampled)
- `field-placeholder-text`: #7A7370  — Placeholder / left+right icon color (estimated, sampled)
- `field-input-text`: #1F1C1B  — Entered value text in active/filled states (estimated, sampled)
- `field-error-message-text`: #D70101  — Red help/error message under field (estimated, sampled)
- `body-text`: #5C5755  — Board body copy gray (estimated, sampled); mobile legal copy sampled #534E4C
- `heading-text`: #1F1C1B  — Section headings FIELDS/ANATOMY/STATES/EXAMPLES (estimated, sampled)
- `anatomy-badge-fill`: #FFD5BF  — Peach numbered callout circles in anatomy diagram (estimated, sampled)
- `anatomy-connector-line`: #FFEEE5  — Peach callout connector lines (estimated, sampled)
- `example-card-bg`: #F7FEFF  — Newsletter card very light cyan/ice background (estimated, sampled)
- `example-card-field-border`: #CBC9C8  — Field border inside light newsletter card (estimated, sampled)
- `color-teal-primary`: #00797D  — Primary teal — 'Subscribe to Our Newsletter' button bg and teal banner bg (estimated, sampled)
- `button-primary-text`: #FFFFFF  — White label on teal button
- `button-peach-bg`: #FFEEE5  — Peach button on teal banner (estimated, sampled)
- `button-peach-text`: #421700  — Very dark brown/maroon label on peach button (estimated, sampled)
- `button-disabled-bg`: #E5E4E3  — Disabled 'Create Account' button bg (estimated, sampled)
- `button-disabled-text`: #9E9691  — Disabled button label (estimated, sampled)
- `mobile-screen-bg`: #FFFAF7  — Cream/off-white mobile header background; form body is #FFFFFF (estimated, sampled)
- `color-orange-heading`: #CC4801  — 'Create Your Account' mobile heading orange (estimated, sampled)
- `progress-segment-active`: #06AEB3  — Active step-indicator segment, bright teal (estimated, sampled)
- `progress-segment-inactive`: #D1CECD  — Inactive step-indicator segments (estimated, sampled)
- `mobile-field-border-default`: #DCDAD9  — Default field border in mobile example (estimated, sampled)
- `chat-fab-bg`: #026366  — Dark teal circular chat FAB, white icon (estimated, sampled)
- `logo-orange`: #F36221  — CareIndeed logo mark orange (estimated, sampled)
- `sidebar-text-active`: #1F1C1B  — Active nav item 'Fields' (estimated, sampled)
- `sidebar-text-inactive`: #524D4B  — Inactive sidebar nav items (estimated, sampled)
- `field-radius-desktop`: ~8px  — State-example inputs corner radius at render scale (estimated, not printed)
- `field-radius-examples`: ~12px  — Newsletter/mobile example inputs corner radius (estimated, not printed)
- `button-radius`: pill (fully rounded)  — Subscribe/Create Account buttons (observed, not printed)


---

<!-- BOARD 006: Icons -->

# Board 006 — ICONS

Sidebar context (visible on this board): CareIndeed logo (orange abstract person mark with radiating arcs, tagline "The Heart of Home Care.") above the label "DESIGN SYSTEM". Nav items: Color, Color Combinations, Core Buttons, Creatives, Fields, **Icons** (active, with sub-items **Size, Feather, Custom, Round**), Padding, Radius, Typography, Utility Buttons.

## ICONS (page intro)

Three usage rules printed at the top of the board:

1. All icons are designed in an **outline style** to maintain visual consistency.
2. Icons should **always follow the provided sizes** whenever possible. If a different size is needed, **preserve the ratio between icon size and line stroke** (every provided pair is a 16:1 size-to-stroke ratio).
3. **New icons may be added** as long as they adhere to the same outline style and design principles.

## SIZE

Table with teal column headers (Name / Value / Line Stroke — header text ≈ #00797D):

| Name | Value | Line Stroke |
|---|---|---|
| Small | 16px | 1 |
| Medium | 24px | 1.5 |
| Large | 32px | 2 |
| X-Large | 64px | 4 |
| 2X-Large | 80px | 5 |

Derived rule (implicit in the table, reinforced by intro rule 2): icon size ÷ line stroke = 16 at every step; any non-standard size must keep that ratio.

## FEATHER

- The full **Feather open-source icon set** is shown as the base utility/UI icon library, rendered in a single warm gray outline color (≈ #7A7370, estimated) on a white rounded-corner card with a light gray border.
- Icons are monochrome, single-weight outline glyphs, consistent with the outline-style rule.
- The grid displays the complete Feather library (~280+ glyphs) in alphabetical order, including (by row groups visible on the board): activity, airplay, alert-circle, alert-octagon, alert-triangle, align-center/justify/left/right, anchor, aperture, archive, all arrow directions and circle-arrow variants, at-sign, award, bar-chart, bar-chart-2, battery, battery-charging, bell, bell-off, bluetooth, bold, book, book-open, bookmark, box, briefcase, calendar, camera, camera-off, cast, check, check-circle, check-square, chevron up/down/left/right, chevrons variants, chrome, circle, clipboard, clock, cloud, cloud-drizzle, cloud-lightning, cloud-off, cloud-rain, cloud-snow, code, codepen, codesandbox, coffee, columns, command, compass, copy, corner arrows (all 8 variants), cpu, credit-card, crop, crosshair, database, delete, disc, dollar-sign, download, download-cloud, droplet, edit, edit-2, edit-3, external-link, eye, eye-off, facebook, fast-forward, feather, figma, file, file-minus, file-plus, file-text, film, filter, flag, folder, folder-minus, folder-plus, framer, frown, gift, git-branch, git-commit, git-merge, git-pull-request, github, gitlab, globe, grid, hard-drive, hash, headphones, heart, help-circle, hexagon, home, image, inbox, info, instagram, italic, key, layers, layout, life-buoy, link, link-2, linkedin, list, loader, lock, log-in, log-out, mail, map, map-pin, maximize, maximize-2, meh, menu, message-circle, message-square, mic, mic-off, minimize, minimize-2, minus, minus-circle, minus-square, monitor, moon, more-horizontal, more-vertical, mouse-pointer, move, music, navigation, navigation-2, octagon, package, paperclip, pause, pause-circle, pen-tool, percent, phone plus all phone variants (call, forwarded, incoming, missed, off, outgoing), pie-chart, play, play-circle, plus, plus-circle, plus-square, pocket, power, printer, radio, refresh-ccw, refresh-cw, repeat, rewind, rotate-ccw, rotate-cw, rss, save, scissors, search, send, server, settings, share, share-2, shield, shield-off, shopping-bag, shopping-cart, shuffle, sidebar, skip-back, skip-forward, slack, slash, sliders, smartphone, smile, speaker, square, star, stop-circle, sun, sunrise, sunset, tablet, tag, target, terminal, thermometer, thumbs-down, thumbs-up, toggle-left, toggle-right, tool, trash, trash-2, trello, trending-down, trending-up, triangle, truck, tv, twitter, type, umbrella, underline, unlock, upload, upload-cloud, user, user-check, user-minus, user-plus, user-x, users, video, video-off, voicemail, volume, volume-1, volume-2, volume-x, watch, wifi, wifi-off, wind, x, x-circle (and x-octagon), x-square, youtube, zap, zap-off, zoom-in, zoom-out — plus two non-standard trailing glyphs appended to the set: a **heart-with-plus** (care/add-to-favorites) and an **infinity** symbol.

## CUSTOM

- Brand-proprietary illustrative icon set, drawn in the same outline style but **two-tone brand colors**: bright teal ≈ **#06A6AB** (estimated) and dark teal ≈ **#00797D** (estimated) for primary linework, with orange ≈ **#E56E2E** (estimated) accent elements. Presented on a white rounded card with light gray border.
- Larger, more detailed than Feather glyphs (illustrative spot-icon scale, consistent with the X-Large/2X-Large sizes).
- Glyph inventory (8 per row, described left→right):
  - **Row 1:** clock inside gear (scheduled care); open hand with orange heart above (compassionate care); two birds, one teal one orange (community/social); speeding stopwatch with motion lines (fast response); person pushing wheelchair inside circular arrows (continuous care cycle); wheelchair user and companion talking at a table with speech bubbles (care consultation); headphones around orange "24/7" speech bubble (24/7 support); head profile with brain and orange peace detail (peace of mind / mental wellness).
  - **Row 2:** person with orange checkmark (verified caregiver); thumbs-up with orange accent line (approval); two nurses/caregivers framed in an arch (care team); document with orange heart on the corner and teal text lines (care plan); small figure assisting an elderly person walking with cane (mobility assistance); large circle with orange checkmark (completion); caregiver with arm around elderly person seated on a bench, orange accents (companionship); person (orange head) with clock (timely arrival / shift time).
  - **Row 3:** nurse with badge/seal containing orange thumbs-up (certified caregiver); interlocking puzzle pieces, teal and orange (fit/matching); person portrait inside double circle, orange head (profile); pills/tablets with clock in overlapping circles (medication timing); smiling person with orange sparkles and thought details (positive wellbeing); dollar sign inside scalloped circle with circular arrows (payment cycle / value); person with backpack and clock (punctual arrival); two people interviewing at a table with speech bubbles above (consultation/interview).
  - **Row 4:** caregiver walking arm-in-arm with elderly woman using a cane (walking assistance); clipboard with orange clip and teal checklist lines (assessment checklist); syringe with teal checkmark circle and orange drop (approved vaccination); person holding clipboard inside a gear/scalloped ring (care assessment); person at center of a three-node network with utensils/nutrition symbols (nutrition/care coordination); dancing/active person with small orange heart (active living); person with orange plus signs and teal double-chevrons rising (health improvement); person with medical shield with cross (health protection).
  - **Row 5:** smiling sun face inside scalloped/gear circle (comfort/warmth); house with circled checkmark (approved home); handshake with one teal and one orange sleeve (partnership); house at end of a winding path with orange horizon line (journey home); shield containing brain (cognitive protection / memory care); house containing hearts with orange sun above (loving home); heart with EKG pulse line and orange checkmark circle (heart health verified); open hand with three orange dollar-coins arcing above (affordable payment).
  - **Row 6:** person celebrating between two upward arrows with orange lightbulb overhead (empowerment/ideas); graduation cap (orange tassel detail) on open book (education/training); two people at a laptop with speech bubbles (online learning/collaboration); head profile with auction-gavel motif and orange "360°" label (360° skills evaluation); clipboard with orange clapperboard/video play element (training video plan); lightbulb surrounded by three people nodes, orange accents (shared ideas / brainstorm); VR headset with orange checkmark circle (VR-verified training); "4K ULTRA HD" rounded badge, dark teal with 4K wordmark (video quality).
  - **Row 7:** VR/smart headset with orange Wi-Fi signal inside (connected device); two hands cradling a family — two teal adults and orange child (family care); therapist kneeling to assist a person walking with orange crutches/parallel-bar supports (physical therapy/rehab).

## ROUND

- Round icon style = custom glyph enclosed in a **circular badge**.
- **Ring:** thin circular outline stroked with an **orange gradient** running left→right from ≈ **#E56E2E** (estimated) through ≈ **#F2A276** (estimated, mid) to a very light peach ≈ **#FED2BB** (estimated) on the right edge — the ring visibly fades from full orange to pale peach across the circle.
- **Background inside the ring:** plain white (#FFFFFF) / transparent — no fill tint.
- **Glyphs:** drawn in dark teal ≈ **#00797D** (estimated) outline, occasionally with orange accents (e.g., family icon), same outline stroke language as the Custom set.
- Presented on the same white rounded card container.
- Glyph inventory (left→right):
  - **Row 1 (7):** hand with heart; three-person audience row; VR headset; group of three people (heads and shoulders); family celebrating — two adults with raised arms and child in the middle (orange accents); hospital building with cross; magnifying glass over a briefcase (job search).
  - **Row 2 (7):** lightbulb over an open book (learning ideas); three circles connected in a triangle network (team/network); bold medical cross; shield with cross and small clock (timely protection/insurance); handshake; person offering/receiving a heart (giving care); three stars bursting upward (celebration/excellence).
  - **Row 3 (5):** person with briefcase climbing rising bar-chart columns (career growth); cycle of heart, briefcase, and house connected by arrows (work–life–home balance); hand holding the globe (global/community care); group of three people; browser window with a speeding clock (fast online access/portal).

## Container / layout notes

- Both icon-set showcases (Feather, Custom, Round) sit inside white cards with a 1px light-gray border and large rounded corners (radius ≈ 16px, estimated).
- Page heading "ICONS" and section headings "SIZE", "FEATHER", "CUSTOM", "ROUND" are set in near-black ≈ #1F1C1B (estimated), all-caps display style.
- Table column headers use the dark teal link color ≈ #00797D (estimated).
- No hex values are printed anywhere on this board; all hex tokens below are sampled estimates from the render.

### Tokens
- `icon-size-small`: 16px  — SIZE table — Small
- `icon-size-medium`: 24px  — SIZE table — Medium
- `icon-size-large`: 32px  — SIZE table — Large
- `icon-size-xlarge`: 64px  — SIZE table — X-Large
- `icon-size-2xlarge`: 80px  — SIZE table — 2X-Large
- `icon-stroke-small`: 1  — Line stroke paired with 16px icons
- `icon-stroke-medium`: 1.5  — Line stroke paired with 24px icons
- `icon-stroke-large`: 2  — Line stroke paired with 32px icons
- `icon-stroke-xlarge`: 4  — Line stroke paired with 64px icons
- `icon-stroke-2xlarge`: 5  — Line stroke paired with 80px icons
- `icon-size-stroke-ratio`: 16:1  — Derived invariant — non-standard sizes must preserve size/stroke ratio
- `color-icon-feather-stroke`: #7A7370 (estimated)  — Warm gray outline color of all Feather set glyphs
- `color-icon-custom-teal-bright`: #06A6AB (estimated)  — Primary bright teal linework in Custom icon set
- `color-icon-custom-teal-dark`: #00797D (estimated)  — Dark teal linework in Custom set and Round icon glyphs; also SIZE table header text
- `color-icon-custom-orange-accent`: #E56E2E (estimated)  — Orange accent linework in Custom icons; start color of Round ring gradient
- `color-round-ring-gradient-start`: #E56E2E (estimated)  — Round icon circular ring, left edge (darkest orange)
- `color-round-ring-gradient-mid`: #F2A276 (estimated)  — Round icon circular ring, top/bottom (mid peach)
- `color-round-ring-gradient-end`: #FED2BB (estimated)  — Round icon circular ring, right edge (pale peach); gradient runs left to right
- `color-round-icon-glyph`: #00797D (estimated)  — Dark teal glyphs inside Round icon badges
- `color-round-icon-background`: #FFFFFF  — Fill inside Round icon ring — plain white / no tint
- `color-heading-text`: #1F1C1B (estimated)  — ICONS / SIZE / FEATHER / CUSTOM / ROUND headings and sidebar text
- `radius-icon-card`: 16px (estimated)  — Rounded corners of white showcase cards holding each icon set


---

<!-- BOARD 007: Padding -->

# Board 007 — PADDING

Left sidebar (constant across boards): CareIndeed logo (orange figure-with-arcs mark, "CareIndeed" wordmark, tagline "The Heart of Home Care.") above "DESIGN SYSTEM" nav: Color, Color Combinations, Core Buttons, Creatives, Fields, Icons, **Padding** (active, with sub-items Horizontal, Vertical, Heading-Subheading, Buttons), Radius, Typography, Utility Buttons.

## PADDING (intro)
"Padding is the internal spacing within components, creating separation between content and external boundaries. It ensures that content has room to breathe, reducing visual clutter and making dense information clearer and easier to consume."

## HORIZONTAL
- Definition: Horizontal padding is the space on either side of the screen that keeps UI components from touching the edges.
- Rule: It creates a margin that ensures elements are visually aligned and well-separated from screen boundaries, making the layout look clean and organized.

| Breakpoint | Value |
|---|---|
| Desktop *(1512px screen size)* | **128px** |
| Tablet *(All sizes)* | **24px** |
| Mobile *(All sizes)* | **16px** |

Example image: hero section ("Transforming … Uplifting Lives" teal heading, gray subheading "Personalized care plans and staffing solutions to improve … seniors.", "Get Started" + "Inquire Now" buttons) with an orange measurement callout **128px** drawn from the left screen edge to the start of the text content.

## VERTICAL
- Definition: Vertical padding is the spacing at the top and bottom of each section on a page. It ensures clear separation between sections, creating a visual hierarchy that helps users navigate and understand the content.
- Rule: This padding maintains a balanced and organized layout while making the page easier to scan.

| Breakpoint | Value |
|---|---|
| Desktop | **40px** |
| Tablet | **32px** |
| Mobile | **16px** |

Example image: a section on a light-peach background containing a rounded-corner photo (nurse in blue scrubs with elderly man at a table), annotated with orange callouts: **40px** at the top of the section (above the photo), **40px** between the bottom of the photo and the section's bottom edge, and **80px** measured from the photo/section area down to the top of the next section's content (a white rounded card with a teal outline and teal double-quote glyph, next to teal text ending "…All" — i.e., adjacent-section content ends up 80px apart because each section carries 40px vertical padding: 40px bottom + 40px top).

## HEADING-SUBHEADING
- Definition: The gap between the heading and subheading ensures proper separation while maintaining their relationship as a unified element.
- Usage: It is commonly used in the hero section of the page to create a strong and balanced visual hierarchy.

| Breakpoint | Value |
|---|---|
| Desktop | **16px** |
| Tablet | **12px** |
| Mobile | **8px** |

Example image: teal hero heading ("…ansforming … plifting Lives…", cropped) with an orange **16px** callout measuring the vertical gap to the gray subheading ("…onalized care plans and …ing solutions to improve …ors.").

## BUTTONS
- Definition: The gap in between buttons ensures adequate spacing to differentiate their functions while maintaining a clean and organized layout.
- Rule: This spacing improves usability by preventing accidental clicks and visually balancing the buttons within the design.

| Breakpoint | Value |
|---|---|
| Desktop | **24px** |
| Tablet | **16px** |
| Mobile | **12px** |

Example image: two pill-shaped (fully rounded) buttons side by side with an orange **24px** callout measuring the horizontal gap between them:
- Primary: "Get Started" — solid burnt-orange fill (≈ #C74601, estimated), white text, no border.
- Secondary: "Inquire Now" — white fill, teal outline, teal text (≈ #1B7F79, estimated).

## Colors observed in example imagery (not printed on board; estimated from pixels)
- Measurement-callout chips: orange-red ≈ #E14E2B (annotation graphic only, not a brand token).
- Hero heading / secondary-button teal ≈ #1B7F79.
- Subheading/body gray ≈ #54565A.
- Primary button burnt orange ≈ #C74601.
- Section background peach ≈ #FBE9DD.

## Notes
- Desktop horizontal padding value is explicitly tied to a 1512px reference screen size; tablet and mobile values apply at "All sizes".
- The 80px annotation in the Vertical example is a derived/observed measurement (two adjacent 40px section paddings), not a separately listed table value.

### Tokens
- `padding-horizontal-desktop`: 128px  — Horizontal screen-edge padding, Desktop at 1512px reference screen size
- `padding-horizontal-tablet`: 24px  — Horizontal screen-edge padding, Tablet (all sizes)
- `padding-horizontal-mobile`: 16px  — Horizontal screen-edge padding, Mobile (all sizes)
- `padding-vertical-section-desktop`: 40px  — Top and bottom padding of each page section, Desktop
- `padding-vertical-section-tablet`: 32px  — Top and bottom padding of each page section, Tablet
- `padding-vertical-section-mobile`: 16px  — Top and bottom padding of each page section, Mobile
- `spacing-section-to-section-desktop`: 80px  — Observed annotation: total gap between adjacent sections' content on desktop (40px bottom + 40px top padding)
- `spacing-heading-subheading-desktop`: 16px  — Gap between heading and subheading (hero usage), Desktop
- `spacing-heading-subheading-tablet`: 12px  — Gap between heading and subheading, Tablet
- `spacing-heading-subheading-mobile`: 8px  — Gap between heading and subheading, Mobile
- `spacing-button-gap-desktop`: 24px  — Horizontal gap between adjacent buttons, Desktop
- `spacing-button-gap-tablet`: 16px  — Horizontal gap between adjacent buttons, Tablet
- `spacing-button-gap-mobile`: 12px  — Horizontal gap between adjacent buttons, Mobile
- `color-button-primary-bg`: #C74601 (estimated)  — 'Get Started' solid primary pill button fill in Buttons example image; white text
- `color-button-secondary-outline`: #1B7F79 (estimated)  — 'Inquire Now' secondary pill button teal border and text on white fill, Buttons example image
- `color-hero-heading-teal`: #1B7F79 (estimated)  — Teal hero heading in Horizontal / Heading-Subheading example images
- `color-subheading-gray`: #54565A (estimated)  — Gray subheading/body text in example imagery
- `color-section-bg-peach`: #FBE9DD (estimated)  — Light peach section background in Vertical padding example image
- `color-annotation-callout`: #E14E2B (estimated)  — Orange measurement callout chips/lines used for px annotations (documentation graphic, not a UI token)


---

<!-- BOARD 008: Radius -->

# Board 008 — RADIUS

**Page context:** CareIndeed ("The Heart of Home Care.") Design System documentation page. Left sidebar nav lists: DESIGN SYSTEM — Color, Color Combinations, Core Buttons, Creatives, Fields, Icons, Padding, **Radius** (current page, with sub-items "Desktop & Tablet" and "Mobile"), Typography, Utility Buttons. Page title (top, large): **RADIUS**.

## Intro copy (verbatim)

> Radius refers to the rounded corners applied to components and content, such as images, cards, or other UI elements.
>
> The roundness depends on the size of the element, with five predefined sizes for desktop, tablet, and mobile. Larger UI components have rounder corners to maintain a balanced and visually appealing design.

**Rules extracted from copy:**
- Radius applies to components AND content (images, cards, other UI elements).
- Exactly five predefined radius sizes per platform group (Desktop & Tablet share one scale; Mobile has its own smaller scale).
- Size selection rule: the larger the UI component/element, the larger the radius ("larger UI components have rounder corners") — to keep the design balanced and visually appealing.

## DESKTOP & TABLET

Five-step radius scale (label → value):

| Size | Value |
|---|---|
| X-Small | 8px |
| Small | 12px |
| Medium | 16px |
| Large | 24px |
| X-Large | 32px |

**Example (right of the scale):** a photograph (caregiver smiling at an elderly woman, outdoor greenery background) shown inside a white example frame with the image's **top-left corner heavily rounded** (illustrating a large-scale radius, approx. Large/X-Large 24–32px) applied to image content. Image is cropped by the board's right edge; no printed px annotation on the example itself.

## MOBILE

Five-step radius scale (label → value):

| Size | Value |
|---|---|
| X-Small | 4px |
| Small | 8px |
| Medium | 12px |
| Large | 16px |
| X-Large | 24px |

**Example (right of the scale):** a testimonial/quote card on white background with a thin (~1px) **teal outline border (≈#2B9DA5, estimated — matches CI brand teal)** and a visibly rounded **top-left corner** (illustrating card radius on mobile, approx. Large/X-Large 16–24px). Card contains dark/near-black testimonial body text, cropped at the left and right board edges; visible fragments read: "…gh good things about the staff and … Indeed. They are easy to deal with … end them." (i.e., a customer testimonial about Care Indeed staff, likely "...nothing but good things about the staff and management at Care Indeed. They are easy to deal with and I highly recommend them." — only the fragments listed are actually visible). A short vertical teal tick/edge mark is visible at the card's bottom-right (continuation of the card border at the crop line). No printed px annotation on the example itself.

## Component application notes

- The board's only explicit component-mapping guidance is the size-proportionality rule (bigger element → bigger radius step) plus the two worked examples: **images** use the large end of the Desktop/Tablet scale; **cards (outlined testimonial card)** use the large end of the Mobile scale on mobile.
- No do/don't panels, no state variants, and no additional usage sentences appear on this board.

## Colors observed on this board (non-token, contextual)

- Card/example outline teal: ≈#2B9DA5 (estimated from swatchless border).
- Body/label text: near-black dark gray (≈#3C4043, estimated).
- Sidebar/nav text: medium gray (≈#5F6368, estimated); page background white #FFFFFF.
- CareIndeed logo: orange mark (≈#F26A21, estimated) with dark wordmark.

### Tokens
- `radius-desktop-tablet-xs`: 8px  — RADIUS — Desktop & Tablet scale, X-Small
- `radius-desktop-tablet-s`: 12px  — RADIUS — Desktop & Tablet scale, Small
- `radius-desktop-tablet-m`: 16px  — RADIUS — Desktop & Tablet scale, Medium
- `radius-desktop-tablet-l`: 24px  — RADIUS — Desktop & Tablet scale, Large
- `radius-desktop-tablet-xl`: 32px  — RADIUS — Desktop & Tablet scale, X-Large
- `radius-mobile-xs`: 4px  — RADIUS — Mobile scale, X-Small
- `radius-mobile-s`: 8px  — RADIUS — Mobile scale, Small
- `radius-mobile-m`: 12px  — RADIUS — Mobile scale, Medium
- `radius-mobile-l`: 16px  — RADIUS — Mobile scale, Large
- `radius-mobile-xl`: 24px  — RADIUS — Mobile scale, X-Large
- `color-card-outline-teal`: #2B9DA5 (estimated)  — Teal border on the mobile testimonial-card radius example; no printed hex on board


---

<!-- BOARD 009: Typography -->

# Board 009 — TYPOGRAPHY (CareIndeed Design System)

Sidebar (left rail, constant across boards): CareIndeed logo (orange person-with-radiating-arcs mark) with tagline "The Heart of Home Care." Below it: "DESIGN SYSTEM" and nav list — Color, Color Combinations, Core Buttons, Creatives, Fields, Icons, Padding, Radius, **Typography** (active/bold, with sub-items Typefaces, Font Styles, Usage), Utility Buttons.

Page title: **TYPOGRAPHY** (large black all-caps Montserrat).

## TYPEFACES

Two side-by-side specimen panels:

1. **Left panel — Montserrat specimen.** Cream/off-white background (approx #FAF2EB, estimated). Large teal display text (approx #0E7C7C, estimated): "Transforming Care, Uplifting Lives." Below it, dark-gray subtitle text: "Personalized care plans and expert staffing solutions to improve the lives of seniors."
2. **Right panel — Roboto specimen.** Solid teal background (approx #0E7C7C, estimated) with white body text: "We are dedicated nurses and caregivers who bring compassion, authenticity, respect, and excellence to every aspect of our work. Our top priority is delivering exceptional home care services across the San Francisco Bay Area."

### Montserrat
"Montserrat is used for all headings and subheadings, always in regular weight, to maintain a clean and consistent typographic style. Usually for section title and subtitle."

> NOTE / board-internal inconsistency: this prose says "always in regular weight", but the Font Styles table below explicitly labels all four Heading styles as **Medium** weight (500) and includes a Medium 16px subheading variant. The table values are the concrete spec.

### Roboto
"Roboto is used for body copy, with light weight preferred for long text. Regular weight can highlight key points but should be avoided in mobile designs."

## FONT STYLES

No letter-spacing values are printed anywhere on this board — only family, weight, size, line height, and target device. Each row shows a left spec block and a right-aligned rendered sample of the style name.

### Heading (all Montserrat)
| Style | Weight | Size | Line height | Device |
|---|---|---|---|---|
| Heading 1 (Large) | Medium | 64px | 72px | Desktop |
| Heading 2 (Medium) | Medium | 40px | 48px | Tablet |
| Heading 3 (Small) | Medium | 32px | 40px | Mobile |
| Heading 4 (X-Small) | Medium | 24px | 32px | Mobile |

### Subheading (all Montserrat)
| Style | Weight | Size | Line height | Device |
|---|---|---|---|---|
| Subheading 1 (Large) | Regular | 32px | 40px | Desktop |
| Subheading 2 (Medium) | Regular | 24px | 32px | Tablet |
| Subheading 3 400 (Small) | Regular (400) | 16px | 24px | Mobile |
| Subheading 3 500 (Small) | Medium (500) | 16px | 24px | Mobile |

### Body (all Roboto; numeric suffix = weight: 300 Light, 400 Regular)
| Style | Weight | Size | Line height | Device |
|---|---|---|---|---|
| Body 1 300 | Light | 16px | 24px | All screen sizes |
| Body 1 400 | Regular | 16px | 24px | All screen sizes |
| Body 2 300 | Light | 12px | 16px | Desktop & Tablet |
| Body 2 400 | Regular | 12px | 16px | Desktop & Tablet |
| Body 3 300 | Light | 8px | 12px | Mobile |
| Body 3 400 | Regular | 8px | 12px | Mobile |

## USAGE

Rule 1: "Headings and subheadings have suggested sizes based on screen dimensions: large for desktop, medium for tablet, and small for mobile. However, these are not strict guidelines. Different sizes can be used across screen types to ensure a clear visual hierarchy."

Rule 2 (example): "For example, an H1 may use heading 1 (large), H2 may use subheading 1 (large), and H3 may use subheading 2 (medium) to create a balanced design on a desktop screen."

### Usage example (full annotated page mockup, captioned "Example" in small italic gray below the frame)
A "Skilled Nursing" service-page mockup inside a thin light-gray-bordered frame demonstrating the type system in situ:
- Breadcrumb (top): "Home > Services for Families > Private Duty Medical Care > **Skilled Nursing**" — teal links (approx #0E7C7C, estimated), chevron separators, current page in dark bold.
- H1 "Skilled Nursing" — very large Montserrat in brand teal (approx #0E7C7C, estimated).
- H2/subheading "Advanced Nursing Care Tailored to Individual Needs" — Montserrat regular, dark gray (approx #3F3F3F, estimated).
- Body paragraph in Roboto light gray-black: "Care Indeed provides exceptional in-home skilled nursing services, ensuring clients receive personalized, high-quality care in the comfort and safety of their homes. Our team of registered nurses (RNs) and licensed vocational nurses (LVNs) delivers compassionate care tailored to each client's unique needs."
- Buttons: primary "Get Care Now" — pill/full-rounded, burnt-orange fill (approx #C74601, estimated), white text, soft glow shadow; secondary "Learn More" — pill, white fill, thin gray outline, dark text.
- In-page tab links: "What is Skilled Nursing?" | "Benefits" | "FAQs" — teal text separated by thin vertical gray divider bars.
- Hero photo right of intro: rounded-corner image (nurse with tablet talking to client) with a soft peach/orange offset shadow behind the rounded rectangle.
- Content section on cream background (approx #FBF1E9, estimated): section heading "What is Skilled Nursing?" in Montserrat, burnt orange/rust (approx #C05600, estimated); two Roboto body paragraphs ("Our skilled nursing services include medication management, accurate injection techniques, and patient education. We also provide specialized post-surgery care, including tracheostomy, nasogastric, and gastrostomy care..." / "By choosing Care Indeed's skilled nursing services, you or your loved one will receive expert clinical care that promotes healing, reduces infection risks, and enhances quality of life...").
- Newsletter card (right column): light-mint/teal-tinted rounded card (approx #DFF6F4, estimated) with soft shadow; text "Learn more by joining the 34,000+ Care Indeed Community!"; three white rounded input fields with light-gray borders and gray placeholder text — "First Name", "Last Name", "Email Address"; full-width pill button "Subscribe to Our Newsletter" in solid dark teal (approx #0E7C7C, estimated) with white text.
- Two-column subsection: subheadings "Medication Management, Administration, and Injection" and "Post Surgery (Tracheostomy, Nasogastric Tube Care, Gastrostomy)" in dark-gray Montserrat, each followed by a Roboto body paragraph describing the service.

Typographic takeaways demonstrated by the example: teal Montserrat for page H1, dark-gray Montserrat regular for subheadings, rust/orange Montserrat for section headings on cream sections, Roboto light/regular for all body copy, teal for links/tabs.

### Tokens
- `font-family-heading`: Montserrat  — All headings and subheadings; board prose says regular weight, Font Styles table specs headings at Medium
- `font-family-body`: Roboto  — Body copy; Light preferred for long text, Regular for key points but avoid Regular in mobile designs
- `font-heading-1-large`: Montserrat Medium 64px / 72px line height  — Heading 1 (Large) — Desktop
- `font-heading-2-medium`: Montserrat Medium 40px / 48px line height  — Heading 2 (Medium) — Tablet
- `font-heading-3-small`: Montserrat Medium 32px / 40px line height  — Heading 3 (Small) — Mobile
- `font-heading-4-x-small`: Montserrat Medium 24px / 32px line height  — Heading 4 (X-Small) — Mobile
- `font-subheading-1-large`: Montserrat Regular 32px / 40px line height  — Subheading 1 (Large) — Desktop
- `font-subheading-2-medium`: Montserrat Regular 24px / 32px line height  — Subheading 2 (Medium) — Tablet
- `font-subheading-3-400-small`: Montserrat Regular 16px / 24px line height  — Subheading 3 400 (Small) — Mobile
- `font-subheading-3-500-small`: Montserrat Medium 16px / 24px line height  — Subheading 3 500 (Small) — Mobile
- `font-body-1-300`: Roboto Light 16px / 24px line height  — Body 1 300 — All screen sizes
- `font-body-1-400`: Roboto Regular 16px / 24px line height  — Body 1 400 — All screen sizes
- `font-body-2-300`: Roboto Light 12px / 16px line height  — Body 2 300 — Desktop & Tablet
- `font-body-2-400`: Roboto Regular 12px / 16px line height  — Body 2 400 — Desktop & Tablet
- `font-body-3-300`: Roboto Light 8px / 12px line height  — Body 3 300 — Mobile
- `font-body-3-400`: Roboto Regular 8px / 12px line height  — Body 3 400 — Mobile
- `color-teal-primary`: #0E7C7C (estimated)  — Teal specimen panel bg, display headline text, breadcrumb/tab links, H1 'Skilled Nursing', newsletter subscribe button — no hex printed on board
- `color-cream-specimen-bg`: #FAF2EB (estimated)  — Montserrat specimen panel background and example page section background — no hex printed
- `color-orange-primary-button`: #C74601 (estimated)  — 'Get Care Now' primary pill button fill, white text — no hex printed
- `color-rust-section-heading`: #C05600 (estimated)  — 'What is Skilled Nursing?' section heading on cream background — no hex printed
- `color-mint-card-bg`: #DFF6F4 (estimated)  — Newsletter signup card background in usage example — no hex printed
- `color-text-dark`: #3F3F3F (estimated)  — Dark gray heading/subheading text and specimen subtitle — no hex printed


---

<!-- BOARD 010: Utility Buttons -->

# Board 010 — UTILITY BUTTONS

> CareIndeed (CI) Design System — "The Heart of Home Care." Left sidebar nav: Color, Color Combinations, Core Buttons, Creatives, Fields, Icons, Padding, Radius, Typography, **Utility Buttons** (active page) with sub-items: Checkbox, Radio, Icon, Image, Tabs, Breadcrumbs, Long Text.
>
> NOTE: No hex/px values are printed anywhere on this board. Every color below was pixel-sampled from the rendered tiles and is marked (estimated). Dimensions were measured on 2048px-wide tile renders; "design px" assumes the board was authored at 1440px width (divide render px by ~1.42).

**Intro copy:** Use utility buttons to support specific interactions and enhance functionality within the interface. These buttons are designed for specialized use cases, providing users with additional ways to navigate, filter, or interact with content efficiently.

---

## CHECKBOX

Use checkboxes to allow users to select one or more options from a list. They are ideal for enabling multiple selections in forms or filters and clearly indicate the selected state.

Control: rounded square, ~26 render px (~18 design px), corner radius ~4px (estimated), label "Label" to the right in near-black body text #1F1C1B (estimated).

### States
| State | Copy on board | Visual (sampled) |
|---|---|---|
| Default | The checkbox appears unselected and ready for user interaction. | White fill; 1–1.5px warm-gray border **#7A7370** (estimated); label near-black **#1F1C1B** (estimated) |
| Hover | Both the border and background slightly change to indicate interactivity when hovered over. | Border turns teal **#00797D** (estimated); fill very light teal **#E5FEFF** (estimated); label unchanged |
| Active | The checkbox is selected, showing a checkmark to indicate the chosen option. | Solid dark-teal fill **#004142** (estimated) with white checkmark; no separate border; label unchanged |
| Disabled | The checkbox is muted and non-interactive, indicating it cannot be selected. | Solid light-gray fill **#E5E4E3** (estimated), no visible border; label muted light gray ~**#C4C1BF** (estimated) |
| Failed | Both the border and background are red to indicate an error. | Border red **#D70101** (estimated); fill light red/pink **#FBE6E6** (estimated); label text also red **#D70101** (estimated) |

---

## RADIO

Use radio buttons to allow users to select only one option from a group. They are ideal for presenting clear, single-choice options in forms.

Control: circle, same ~26 render px (~18 design px) footprint as checkbox; label "Label" to the right.

### States
| State | Copy on board | Visual (sampled) |
|---|---|---|
| Default | The radio button appears unselected and ready for user interaction. | White fill; warm-gray ring **#7A7370** (estimated); label **#1F1C1B** (estimated) |
| Hover | Both the border and background slightly change to indicate interactivity. | Teal ring **#00797D** (estimated); light-teal fill **#E5FEFF** (estimated) |
| Active | The radio button is selected, showing a filled circle to indicate the chosen option. | Dark-teal **#004142** (estimated) — filled inner dot + outer ring in the same dark teal, separated by a thin white gap |
| Disabled | The radio button is muted and non-interactive, indicating it cannot be selected. | Solid light-gray fill **#E5E4E3** (estimated), no ring; muted label |
| Failed | Both the border and background are red to indicate an error. | Ring sampled **#C74601** (estimated — this is the CI brand orange, visibly more orange than the checkbox's #D70101 red; likely a source-file inconsistency, flag for rebrand decision); fill **#FBE6E6** (estimated); label red **#D70101** (estimated) |

---

## ICON

Use icon buttons for simple, visually-driven actions, such as linking to social media or navigating with page arrow controls. They provide functionality while maintaining a minimal design.

### Socials
Copy on board (verbatim, appears to be boilerplate reused from primary buttons): "Use primary buttons for the most important actions on a page, such as submitting a form or completing a key task. They stand out visually to guide users toward critical interactions."

Visual: five circular icon buttons — Facebook, X (Twitter), LinkedIn, YouTube, Instagram. Each is a white circle with a thin (~1px) teal outline **#00797D** (estimated) and a teal **#00797D** glyph. The YouTube glyph renders as a solid teal rounded-rectangle with a white play triangle; all others are line/outline glyphs. Even spacing in a horizontal row.

### Arrows
Use arrow buttons to help users navigate between pages, sections, or content. They are commonly used in carousels, sliders, or pagination for directional navigation.

Two pagination examples shown (each: left arrow circle, page numbers 1 2 3 4 5, right arrow circle):
- **Filled style (row 1):** arrow circles solid teal **#00797D** (estimated) with white arrow glyphs. Current page number ("2") teal **#00797D** (estimated); other numbers near-black **#1F1C1B** (estimated).
- **Outline style (row 2):** arrow circles white with teal **#00797D** outline and teal arrow glyphs. Current page number ("3") teal; others near-black.

---

## IMAGE

Use image buttons to represent locations, such as cities where services are available. These buttons feature city logos, slightly zoom in on hover to indicate interactivity, and should be adjusted in size based on the screen size for optimal display.

Visual: circular white chips with a thin teal ring **#00797D** (estimated), each containing a full-color municipal seal/logo: City of Campbell ("The Orchard City"), City of Menlo Park, City of San Mateo California, City of San Jose ("Capital of Silicon Valley"). Shown in three sizes (measured diameters ~215 / ~150 / ~100 render px ≈ ~150 / ~105 / ~70 design px, estimated). Hover behavior: logo slightly zooms in. Size is responsive to screen size.

---

## TABS

Use tabs for local navigation, helping users move between sections within a page. They organize content efficiently and make navigation intuitive, ensuring users can easily access related information.

Tabs are sharp-cornered (no visible radius) rectangles labeled "Text", white label text on filled states.

### Sizes (measured on 2048px render; design px assumes 1440 board)
| Size | Render px (w×h) | Est. design px (w×h) |
|---|---|---|
| Large | 106×77 | ~75×54 (estimated) |
| Medium | 93×65 | ~65×46 (estimated) |
| Small | 68×52 | ~48×37 (estimated) |

(Same label "Text" in all three, so width differences = padding/type-size steps.)

### States (shown at Medium size)
| State | Visual (sampled) |
|---|---|
| Default | Solid teal fill **#00797D** (estimated), white text |
| Hover | Solid dark-teal fill **#004142** (estimated), white text |
| Active | No container/fill — text only, dark-teal text **#004142** (estimated) |

---

## BREADCRUMBS

Use breadcrumbs to display the user's current location within a hierarchy and provide a quick way to navigate back to previous pages or sections. They improve usability by helping users understand their context and retrace their steps easily.

Example: `Home  >  Services for Families  >  Hourly Care`
- Ancestor links + ">" separators: warm gray **#7A7370** (estimated), regular weight.
- Current page ("Hourly Care"): dark brown/espresso **#421700** (estimated), heavier (medium/semibold) weight.

---

## LONG TEXT

Use long text buttons exclusively for choices in the online assessment form. These buttons can include optional subtext to provide additional context and help users better understand the available options.

Fully-rounded pill buttons. Two variants shown side by side: single-line (title only: "Private Duty Medical Care") and multi-line with subtext (title "Private Duty Medical Care" + subtext "Instrumental Activities of Daily Living and Activities of Daily Living"). Text is center-aligned in both.

### States
| State | Visual (sampled) |
|---|---|
| Default | White fill; thin (~1px) warm-gray border **#7A7370** (estimated; antialiasing sampled in the #7A7370–#97918F range); title near-black **#1F1C1B** (estimated); subtext medium gray ~**#A8A5A2** (estimated) |
| Hover | Very light teal fill **#F7FEFF** (estimated); border fades to a very light gray-teal ~**#E3EAEA** (estimated); text colors unchanged |
| Active | Solid teal fill **#00797D** (estimated); no border; title white **#FFFFFF**; subtext soft white ~**#FAF8F8** (estimated — reads lighter than the title because of regular weight) |

---

## Cross-board color roles observed on this board (all estimated from pixels)
- **#00797D** — CI teal: interactive accent (hover borders, icon buttons, arrows, active pagination number, image-button ring, tab default fill, long-text active fill).
- **#004142** — CI dark teal: selected/active-strong (checkbox check fill, radio selected, tab hover fill, tab active text).
- **#E5FEFF** — light teal hover fill for selection controls; **#F7FEFF** — even lighter teal hover fill for long-text pills.
- **#D70101** — error red (failed borders/labels); **#FBE6E6** — error background tint.
- **#C74601** — brand orange, appears (probably unintentionally) as the radio Failed ring.
- **#7A7370** — warm gray: default control borders, breadcrumb ancestors, muted UI text.
- **#E5E4E3** — disabled fill gray.
- **#1F1C1B** — near-black body/label text.
- **#421700** — dark brown/espresso: breadcrumb current-page text.

### Tokens
- `color-teal-600`: #00797D (estimated)  — Primary interactive teal: checkbox/radio hover border, social + arrow icon buttons, active pagination number, image-button ring, tab default fill, long-text active fill
- `color-teal-900`: #004142 (estimated)  — Dark teal: checkbox active fill, radio selected dot+ring, tab hover fill, tab active text
- `color-teal-100-hover-fill`: #E5FEFF (estimated)  — Checkbox/radio hover background tint
- `color-teal-050-hover-fill`: #F7FEFF (estimated)  — Long-text pill hover background tint
- `color-error-red`: #D70101 (estimated)  — Failed state: checkbox border + failed label text (checkbox and radio)
- `color-error-bg`: #FBE6E6 (estimated)  — Failed state background tint (checkbox and radio)
- `color-orange-500`: #C74601 (estimated)  — Sampled as radio Failed ring color — CI brand orange; deviates from checkbox failed red, flag as source inconsistency
- `color-border-default`: #7A7370 (estimated)  — Warm gray: checkbox/radio default border, long-text pill default border, breadcrumb ancestor + separator text
- `color-disabled-fill`: #E5E4E3 (estimated)  — Disabled checkbox/radio fill (no border)
- `color-text-disabled`: #C4C1BF (estimated)  — Disabled control label text
- `color-text-body`: #1F1C1B (estimated)  — Near-black: control labels, long-text pill title, inactive pagination numbers, body copy
- `color-text-subtext-muted`: #A8A5A2 (estimated)  — Long-text pill subtext on default/hover
- `color-brown-breadcrumb-current`: #421700 (estimated)  — Breadcrumb current-page text, medium/semibold weight
- `color-long-text-hover-border`: #E3EAEA (estimated)  — Long-text pill border in hover state (near-invisible light gray-teal)
- `color-long-text-active-subtext`: #FAF8F8 (estimated)  — Soft-white subtext on teal active long-text pill (title is pure #FFFFFF)
- `size-checkbox-radio-control`: ~18px (estimated; 26px measured on 2048-wide render)  — Checkbox square and radio circle footprint
- `radius-checkbox`: ~4px (estimated)  — Checkbox corner radius
- `radius-long-text-pill`: 9999px (full pill)  — Long-text buttons fully rounded
- `radius-tab`: 0px  — Tabs are sharp-cornered rectangles
- `size-tab-large`: ~75x54px (estimated; 106x77 render px)  — Tab size Large (label 'Text')
- `size-tab-medium`: ~65x46px (estimated; 93x65 render px)  — Tab size Medium; states Default/Hover shown at this size
- `size-tab-small`: ~48x37px (estimated; 68x52 render px)  — Tab size Small
- `size-image-button-large`: ~150px diameter (estimated)  — Image (city logo) button, large
- `size-image-button-medium`: ~105px diameter (estimated)  — Image button, medium
- `size-image-button-small`: ~70px diameter (estimated)  — Image button, small
- `border-icon-image-ring`: 1px solid #00797D (estimated)  — Circle outline on social icon buttons, outline arrow buttons, and image buttons
- `interaction-image-button-hover`: slight zoom-in of logo  — Image button hover behavior; size adjusts responsively to screen size
