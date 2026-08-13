# Page Layout Standard

The 32 px countdown timer is the reference unit for page-level rendering layout.

## Base unit

- `1u = 32 px` in PixiJS logical screen coordinates.
- `0.25u = 8 px`
- `0.5u = 16 px`
- `1u = 32 px`
- `2u = 64 px`
- `3u = 96 px`
- `4u = 128 px`

Device pixel ratio must not change these logical layout values. Renderer resolution may scale the backing buffer independently.

## Rules

1. Page-level visual layout is resolved in `rendering/layout/PageLayout.ts`.
2. Views consume resolved anchors and metrics instead of inventing viewport math or spacing constants.
3. The default page inset is `1u`.
4. The primary page anchor is the viewport center unless a screen defines another named anchor.
5. The countdown timer is exactly `1u` in diameter and is the canonical size reference.
6. Compact internal spacing uses `0.25u` or `0.5u`; normal spacing uses `1u`; section separation uses `2u` or more.
7. Motion offsets and typography sizes should use the same scale where they are layout dimensions.
8. Animation timing, angles, opacity, and easing are not layout dimensions and do not need to use this scale.
9. Domain and simulation code must not depend on page layout metrics. The standard belongs to the rendering boundary.

When new HUD or page elements are added, extend the shared layout model with named anchors or component metrics rather than adding unrelated pixel constants inside individual views.
