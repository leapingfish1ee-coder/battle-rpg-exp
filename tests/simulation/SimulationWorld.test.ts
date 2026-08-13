import { describe, expect, it } from 'vitest';
import { SimulationWorld } from '../../src/simulation/world/SimulationWorld';

 describe('SimulationWorld', () => {
  it('advances movement deterministically at a fixed timestep', () => {
    const world = new SimulationWorld();

    for (let tick = 0; tick < 60; tick += 1) {
      world.step(1 / 60, { moveX: 1, moveY: 0 });
    }

    const state = world.snapshot();
    expect(state.tick).toBe(60);
    expect(state.player.position.x).toBeCloseTo(500, 6);
    expect(state.player.position.y).toBeCloseTo(180, 6);
  });

  it('normalizes diagonal movement', () => {
    const axial = new SimulationWorld();
    const diagonal = new SimulationWorld();

    axial.step(1, { moveX: 1, moveY: 0 });
    diagonal.step(1, { moveX: 1, moveY: 1 });

    const axialDistance = axial.snapshot().player.position.x - 320;
    const diagonalState = diagonal.snapshot();
    const diagonalDistance = Math.hypot(
      diagonalState.player.position.x - 320,
      diagonalState.player.position.y - 180,
    );

    expect(diagonalDistance).toBeCloseTo(axialDistance, 6);
  });
});
