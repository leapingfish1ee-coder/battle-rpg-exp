# Page Layout Standard

The project keeps a 32 px logical unit for future page-level HUD and browser-canvas layout. The unit is a spacing and component-size reference only; it is not tied to any currently rendered widget.

## Spatial scale

- `0.25u = 8 px`
- `0.5u = 16 px`
- `1u = 32 px`
- `2u = 64 px`
- `3u = 96 px`
- `4u = 128 px`

Device pixel ratio must not change these logical layout values. Renderer resolution may scale the backing buffer independently.

## Typography and effects

Typography, stroke, shadow, animation scale, and timing are semantic visual tokens. They must not be derived by multiplying the spatial unit.

No global runtime typography token module is kept while the current gameplay view has no HUD text. Feature-specific typography should be introduced only when a real UI component requires it.

## Rules

1. `1u = 32 px` is the project-wide logical spacing reference for page/HUD composition.
2. Compact internal spacing uses `0.25u` or `0.5u`; normal spacing uses `1u`; section separation uses `2u` or more.
3. New page/HUD views should consume a shared layout resolver when multiple elements need common anchors. Do not create a resolver before that need exists.
4. The default page inset is `1u` unless a screen defines another explicit layout contract.
5. Typography must use semantic typography tokens and must never be derived from spacing values.
6. Stroke width, shadow distance, blur, opacity, and similar effects use effect-style tokens rather than spacing tokens.
7. Motion distances may use the spatial scale. Motion timing, easing, opacity, and animation scale remain separate.
8. World-space gameplay coordinates, movement, camera position, and map geometry are not page layout and must not depend on this scale.
9. Domain and Simulation code must not depend on page layout or visual-effect metrics.

The current gameplay world has no page-level HUD components, so no runtime `PageLayout` or `PageTypography` module is retained. Reintroduce shared layout code when a real screen contains multiple page/HUD elements that need common anchors or spacing.
