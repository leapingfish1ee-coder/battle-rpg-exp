# ADR-0002: Keep automatic encounters and weapon timing in fixed-step Simulation

Status: Accepted  
Date: 2026-08-16

## Context

The world now needs periodically refreshed enemies, stationary enemy groups, automatic target acquisition, ranged trajectories with deterministic angular spread, timed melee sweeps, and game-space ballistic energy behavior. These features affect authoritative positions, hit results, entity lifetime, and repeatability, so they cannot be implemented as render-frame timers or PixiJS callbacks.

Spawning must also occur outside the currently visible viewport. Viewport dimensions are presentation-environment data, but the resulting spawn position is gameplay state. The dependency therefore needs an explicit boundary that preserves Simulation purity and deterministic replay.

## Decision

- Enemy spawn cadence, enemy behavior, weapon clocks, target selection, projectile trajectories, melee sectors, hit resolution, health, and entity removal are owned by fixed-step Simulation.
- Every weapon owns an independent repeating timer. A timer advances and cycles even when no target is available; target acquisition happens at the cycle boundary and an attack is emitted only when a valid target exists.
- The automatic sidearm selects the nearest valid enemy, applies deterministic seeded angular spread, and creates a real moving projectile. Projectile collision uses swept segment-vs-circle testing rather than hitscan or render-frame overlap checks.
- Sidearm projectiles use abstract game-space ballistic parameters: initial speed, mass scale, exponential drag, normalized kinetic-energy retention, energy-scaled damage, and directional impact impulse. These values are gameplay tuning units rather than a reconstruction of a real firearm or cartridge.
- Projectile travel integrates exponential velocity decay analytically within each fixed step so displacement and retained velocity remain stable at 60 Hz. Impact energy is derived from the projectile's retained kinetic energy relative to its initial kinetic energy.
- Ballistic impact impulse may temporarily alter solo chaser motion and then decays exponentially. Members of stationary enemy groups explicitly reject that displacement impulse so their fixed-position behavior remains authoritative.
- Projectile impacts are short-lived Simulation events carrying position, direction, and normalized energy. Presentation/Rendering may use those values for trails, impact flashes, and other feedback but cannot alter damage or impulse results.
- The automatic saber selects a nearby target and applies one fixed angular sector per cycle. The same sector data is exposed as a short-lived presentation event for the visible sweep.
- Solo enemies use a chase behavior in Simulation. Members of spawned enemy groups use a stationary behavior and do not receive chase velocity.
- The Application passes logical viewport width and height into each Simulation step as plain numeric input. The spawn system uses those values only to place new entities beyond the visible rectangle plus an overscan margin. Simulation imports no Renderer, PixiJS, DOM, or Camera types.
- Deterministic replay that includes spawning must record the viewport dimensions alongside semantic player input whenever those dimensions change.
- Spawn randomness and weapon spread use separate seeded RNG streams so changes in one system do not reorder the other system's random sequence.
- Entity storage remains bounded arrays operated on by systems for the current cap. A general ECS framework is still deferred until profiling or substantially higher entity counts justify it.
- Rendering consumes Presentation state and draws enemies, projectile trails, impact feedback, and melee sweep effects. Held weapon geometry is optional presentation and is currently omitted from the player unit. Rendering does not decide targets, timing, trajectories, energy, damage, impulse, or hit results.

## Alternatives

### Run weapon timers in PixiJS Ticker

Rejected because attack cadence would depend on render frame rate and background-tab behavior instead of the 60 Hz simulation clock.

### Spawn enemies in Rendering when a location is outside the camera

Rejected because entity creation and world position are authoritative gameplay state. Rendering may observe camera state but must not create game entities.

### Use hitscan for the sidearm

Rejected because the requested behavior includes a visible trajectory and angular variation. A simulated projectile also gives future collision and effect systems a stable entity boundary.

### Make ballistic feedback rendering-only

Rejected for retained energy, damage scaling, and impact impulse because those values affect authoritative combat results. Only the visual trail and impact drawing remain rendering-only.

### Introduce a full ECS immediately

Rejected because the current enemy cap and number of entity types do not yet demonstrate an ECS storage/query bottleneck. Systems and stable numeric IDs provide a migration path without adding framework cost prematurely.

## Consequences

- Automatic combat remains deterministic with fixed inputs, seeds, and viewport history.
- Both weapons keep cycling without manual attack input.
- Enemy spawning responds correctly to viewport size without coupling Simulation to PixiJS.
- Projectile speed and kinetic energy decay over travel rather than remaining constant until deletion.
- Solo chasers can visibly react to projectile impact while stationary enemy groups preserve their fixed-position contract.
- Projectile and melee rendering can be changed without altering attack truth.
- The player unit does not need to display held weapon geometry for weapon systems to remain active.
- Future enemy AI, weapon variants, pooling, spatial indexing, or ECS storage can replace individual systems behind the same Domain/Presentation contracts.
- Viewport changes are now part of the deterministic input surface for encounter spawning and must be captured by future replay tooling.

## References

- `docs/adr/0001-camera-world-coordinate-boundary.md`
- `docs/architecture/pixijs-2d-architecture.md`
- `src/simulation/enemies/EnemySpawnSystem.ts`
- `src/simulation/enemies/EnemyMovementSystem.ts`
- `src/simulation/combat/AutoWeaponSystem.ts`
- `src/simulation/combat/ProjectileSystem.ts`
