import { describe, expect, it } from 'vitest';
import { SimulationWorld } from '../../src/simulation/world/SimulationWorld';

describe('SimulationWorld', () => {
  it('advances vector movement deterministically at 60 Hz', () => {
    const world = new SimulationWorld();

    for (let tick = 0; tick < 60; tick += 1) {
      world.step(1 / 60, { moveX: 1, moveY: 0 });
    }

    const state = world.snapshot();
    expect(state.tick).toBe(60);
    expect(state.player.position.x).toBeCloseTo(226, 6);
    expect(state.player.position.y).toBeCloseTo(0, 6);
    expect(state.player.velocity.x).toBeCloseTo(240, 6);
    expect(state.player.velocity.y).toBeCloseTo(0, 6);
  });

  it('keeps diagonal travel speed equal to axial travel speed', () => {
    const axial = new SimulationWorld();
    const diagonal = new SimulationWorld();

    for (let tick = 0; tick < 60; tick += 1) {
      axial.step(1 / 60, { moveX: 1, moveY: 0 });
      diagonal.step(1 / 60, { moveX: 1, moveY: 1 });
    }

    const axialState = axial.snapshot();
    const diagonalState = diagonal.snapshot();
    const axialDistance = Math.hypot(
      axialState.player.position.x,
      axialState.player.position.y,
    );
    const diagonalDistance = Math.hypot(
      diagonalState.player.position.x,
      diagonalState.player.position.y,
    );

    expect(diagonalDistance).toBeCloseTo(axialDistance, 6);
    expect(Math.hypot(diagonalState.player.velocity.x, diagonalState.player.velocity.y)).toBeCloseTo(
      240,
      6,
    );
  });

  it('comes to rest after input is released', () => {
    const world = new SimulationWorld();

    for (let tick = 0; tick < 12; tick += 1) {
      world.step(1 / 60, { moveX: 1, moveY: 0 });
    }

    for (let tick = 0; tick < 6; tick += 1) {
      world.step(1 / 60, { moveX: 0, moveY: 0 });
    }

    const stopped = world.snapshot();
    expect(stopped.player.velocity).toEqual({ x: 0, y: 0 });

    const x = stopped.player.position.x;
    world.step(1 / 60, { moveX: 0, moveY: 0 });
    expect(world.snapshot().player.position.x).toBeCloseTo(x, 6);
  });
});
