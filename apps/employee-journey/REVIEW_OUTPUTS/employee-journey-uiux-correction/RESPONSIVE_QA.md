# Responsive QA

## Width matrix

The portal was rendered inside exact-width browser contexts. The 682px case is the reflow proxy for 200% zoom from a 1364px desktop viewport.

| Width | Navigation mode | Horizontal overflow | Visible text below 12px | Broken images | Result |
|---:|---|---:|---:|---:|---|
| 320px | Five-item mobile | No | 0 | 0 | Pass |
| 375px | Five-item mobile | No | 0 | 0 | Pass |
| 682px / 200% reflow proxy | Five-item mobile | No | 0 | 0 | Pass |
| 768px | Five-item mobile | No | 0 | 0 | Pass |
| 1024px | Eight-item desktop | No | 0 | 0 | Pass |
| 1363px native review viewport | Eight-item desktop | No | 0 | 0 | Pass |
| 1440px | Eight-item desktop | No | 0 | 0 | Pass |
| 1600px | Eight-item desktop | No | 0 | 0 | Pass |

## Mobile-specific checks

- Mobile navigation is exactly Home, Journey, Training, Documents, More.
- More contains Policies, Competencies, Performance, History, Support.
- Navigation targets measured 53px high.
- Safe-area inset padding is included below the fixed navigation.
- The portal content includes bottom padding so the fixed navigation does not hide the final content.
- At 320px, the full persona name fits in the stacked selector and the entire Continue card ends above the bottom navigation.
- The large mobile artwork treatment is absent; the compact local image is hidden in the Continue card.
- Drawers become bottom sheets with a bounded `90dvh` height.

## Desktop-specific checks

- The sidebar remains fixed while workspace content scrolls.
- The preview toolbar remains visible and does not overlap headings.
- Two-column requirement cards collapse before content becomes cramped.
- The 1600px rule adds horizontal workspace breathing room while preserving the 1500px content maximum.

## Reflow notes

The 200% proxy exercises the same responsive reflow breakpoint a 1364px browser reaches at 200% zoom. Content remains in normal document order, the mobile navigation activates, and no horizontal overflow or sub-12px visible copy was detected.

