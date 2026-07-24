# Visual QA

## Surfaces reviewed

| Surface | Viewports reviewed | Result |
|---|---|---|
| Employee Home | 320, 375, 1363 | Compact Continue card, clear priority list, no large mobile artwork |
| Documents & credentials | 1363 | Status tabs, paired cards, renewal action, readable field hierarchy |
| Policies | 1363 | Task-oriented cards, policy IDs, version/action detail, no internal hold language |
| Training | 1363 | Complete assignment fields, disabled unavailable state, restrained horizontal tab scrollbar |
| My Journey | 1363 | Current milestone depth is emphasized without applying heavy elevation to every phase |
| Mobile More sheet | 375 | Bottom sheet, readable five-link list, clear close target and backdrop |
| GAO cover | 1363 | Full-page route, local optimized art, one exit control |
| GAO readiness scene | 1363 | Local scene art loads at native quality; hotspots remain visible |
| GAO badge | 1363 | Static synthetic identity, optional local image preview, no camera prompt |

## Visual-system findings

- Warm ivory is limited to the canvas and supporting soft surfaces.
- Cards use white surfaces, subtle borders, and one restrained default shadow.
- Stronger depth is reserved for Continue, the current milestone, and important document alerts.
- Deep orange is used for primary actions and small orange labels.
- Teal defines navigation, structure, selected state, and positive/current state.
- Montserrat is used for headings and Roboto for body copy through bundled local font files.
- Card radii remain within the 18–24px target range.
- Essential gray text uses the stronger muted token, not low-contrast `#A0A0A0`.
- Statuses include text and iconography, so hue is never the only differentiator.

## Image reliability

- No broken images were detected in the employee route matrix.
- No employee route referenced a remote required image.
- GAO cover and desk art reported non-zero natural dimensions.
- GAO cover, desk, and home-visit visuals include local WebP and AVIF variants.
- The only Care Indeed logo path in the corrected journey/GAO UI is `/assets/logo-careindeed-orange.png`.

