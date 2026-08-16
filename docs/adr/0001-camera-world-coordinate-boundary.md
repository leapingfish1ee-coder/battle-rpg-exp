# ADR-0001: Establish world-space movement and rendering camera boundary

Status: Accepted  
Date: 2026-08-16

## Context

The browser client now has a player-controlled 2D world instead of a screen-space countdown demonstration. Movement must remain deterministic in fixed-step Simulation while the camera may use render-frame smoothing. The project architecture already requires Simulation to own world coordinates and Rendering to own camera transforms.

A camera implementation that writes screen coordinates back into gameplay state would couple game truth to viewport size and render cadence. A camera inside Simulation would also make deterministic movement depend on presentation concerns.

## Decision

- Player position and velocity are authoritative world-space values owned by Domain/Simulation.
- `VectorMovementSystem` converts semantic movement vectors into velocity using maximum speed, acceleration, deceleration, and diagonal normalization.
- Presentation interpolates world-space position and velocity between fixed-step snapshots.
- `Camera2D` exists only in Rendering. It follows the interpolated player target with frame-rate-independent exponential smoothing.
- Rendering applies camera translation to a stable `worldRoot`; HUD and debug roots remain in screen space.
- Procedural ground rendering may sample camera position to render an effectively unbounded world-anchored surface, but it cannot modify Simulation state.
- Input remains semantic (`moveX`, `moveY`); Simulation never reads keyboard codes or browser APIs.
- No Scene manager or ECS framework is introduced solely for this feature.

## Alternatives

### Store screen-space player coordinates in Simulation

Rejected because viewport size and camera movement would become gameplay state, breaking world-coordinate purity and future map/network compatibility.

### Put camera smoothing in Simulation

Rejected because camera response is presentation-only and should not affect deterministic replay or fixed-step state.

### Hard-lock the camera to the player every frame

Rejected as the default because a small render-only follow lag communicates movement more clearly while preserving the same gameplay truth. The camera can still snap on first presentation.

### Introduce a Scene manager with the first world view

Rejected because there is still only one real gameplay scene and no lifecycle pressure that justifies Scene orchestration.

## Consequences

- World entities can now use stable coordinates independent of the viewport.
- Future map objects, collisions, and multiplayer snapshots can share the same position model.
- Render-only camera smoothing is non-deterministic by frame timing, but it cannot affect gameplay state.
- Rendering now has an explicit world-root transform and must keep world-space and screen-space layers distinct.
- Camera shake, zoom, bounds, and map streaming can extend the rendering camera later without changing movement truth.

## References

- `docs/architecture/pixijs-2d-architecture.md`
- `docs/architecture/foundation-status.md`
- `src/simulation/movement/VectorMovementSystem.ts`
- `src/rendering/camera/Camera2D.ts`
