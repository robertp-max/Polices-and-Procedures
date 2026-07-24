# Accessibility QA

## Implemented accessibility contracts

| Requirement | Implementation | Verification |
|---|---|---|
| Skip link | First focusable link targets `#main-content` | Present in every portal route DOM |
| Semantic headings | One H1 per workspace; card sections use H2/H3 | Browser route matrix inspected |
| Tabs | `role=tab`, `aria-selected`, `aria-controls`; panel uses matching `aria-labelledby` | Expiring → Under review changed with ArrowRight and moved focus |
| Dialogs / drawers | `role=dialog`, `aria-modal`, title and optional description IDs | DOM inspected for policy modal, renewal drawer, More sheet, and GAO badge dialog |
| Focus trap | Shared Tab/Shift+Tab loop | Source reviewed in `useDialogFocus` |
| Escape close | Shared Escape handler | Browser tested on More sheet, policy modal, and renewal drawer |
| Focus restore | Opening trigger receives focus after close | Browser confirmed `More`, `View assignment`, and `Upload / renew preview` |
| Scroll lock | Body overflow is hidden while open and restored after close | Browser confirmed restoration to visible |
| Live region | Polite atomic status region | Present on every portal route |
| Visible focus | 3px focus outline with offset | CSS reviewed |
| No color-only state | Status badge includes icon and text | DOM and visual review |
| Reduced motion | Global media query and GAO `useReducedMotion` | Source reviewed |
| Minimum text | Visible-text scan found no rendered text below 12px | 320, 375, 682, 768, 1024, 1363, 1440, 1600 width checks |
| Touch targets | Mobile navigation is 53px high; shared buttons are at least 44px; GAO interactive buttons have a 44px minimum | Browser metrics and CSS review |

## Keyboard scenarios completed

1. Tab activation with mouse, then ArrowRight to the adjacent document filter.
2. More sheet opened from the mobile navigation and closed with Escape.
3. Policy assignment modal opened, closed with Escape, and focus returned to `View assignment`.
4. Renewal drawer opened, closed with Escape, and focus returned to `Upload / renew preview`.
5. GAO badge practice completed through the keyboard-accessible `Complete badge practice` button; drag is not required.

## Screen-reader naming

- Desktop and mobile navigation have distinct accessible labels.
- Persona selection is exposed as `Preview persona`.
- Dialog names match their visible headings.
- The mobile sheet is named `More`.
- GAO hotspots have explicit button names.
- GAO images have contextual alternative text.

