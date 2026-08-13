# Page Layout and Typography Standard

The 32 px countdown timer is the reference unit for page-level spatial layout.

## Spatial scale

- `1u = 32 px` in PixiJS logical screen coordinates.
- `0.25u = 8 px`
- `0.5u = 16 px`
- `1u = 32 px`
- `2u = 64 px`
- `3u = 96 px`
- `4u = 128 px`

Device pixel ratio must not change these logical layout values. Renderer resolution may scale the backing buffer independently.

## Typography and effects

Typography is a separate semantic scale and must not be derived by multiplying `PAGE_LAYOUT_UNIT`.

- Countdown label: `12 px`
- Standard floating feedback: `24 px`
- Emphasized floating feedback: at most `32 px`
- Standard feedback stroke: `2 px`
- Standard feedback shadow offset: `2 px`

Typography lives in `rendering/style/PageTypography.ts`. Stroke and shadow values are visual-effect style tokens, not spacing tokens.

## Rules

1. Page-level spatial layout is resolved in `rendering/layout/PageLayout.ts`.
2. Views consume resolved anchors and spatial metrics instead of inventing viewport math or spacing constants.
3. The default page inset is `1u`.
4. The primary page anchor is the viewport center unless a screen defines another named anchor.
5. The countdown timer is exactly `1u` in diameter and is the canonical component-size reference.
6. Compact internal spacing uses `0.25u` or `0.5u`; normal spacing uses `1u`; section separation uses `2u` or more.
7. Typography must use semantic typography tokens. Never derive a font size from `PAGE_LAYOUT_UNIT` or `PAGE_SPACING`.
8. Stroke width, shadow distance, shadow blur, and similar effects must use effect-style tokens rather than spacing tokens.
9. Motion distances may use the spatial scale. Motion timing, easing, opacity, and animation scale are dimensionless and remain separate.
10. Domain and simulation code must not depend on page layout, typography, or visual-effect metrics.

The current floating feedback starts `1.5u` above the page center, rises `2u`, sways at most `0.25u`, and peaks at `1.05x` scale. This keeps the 32 px timer as the stable visual anchor instead of allowing transient feedback to dominate the screen.

When new HUD or page elements are added, extend the shared layout and semantic style models rather than adding unrelated pixel constants inside individual views.
