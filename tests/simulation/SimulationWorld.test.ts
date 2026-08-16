import { describe, expect, it } from 'vitest';
import { SimulationWorld } from '../../src/simulation/world/SimulationWorld';

const VIEWPORT = { width: 800, height: 600 };

const step = (
  world: SimulationWorld,
  ticks: number,
  command = { moveX: 0, moveY: 0 },
): void => {
  for (let tick = 0; tick < ticks; tick += 1) {
    world.step(1 / 60, command, VIEWPORT);
  }
};

describe('SimulationWorld', () => {
  it('advances vector movement deterministically at 60 Hz', () => {
    const world = new SimulationWorld();
    step(world, 60, { moveX: 1, moveY: 0 });

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
    step(axial, 60, { moveX: 1, moveY: 0 });
    step(diagonal, 60, { moveX: 1, moveY: 1 });

    const axialState = axial.snapshot();
    const diagonalState = diagonal.snapshot();
    const axialDistance = Math.hypot(axialState.player.position.x, axialState.player.position.y);
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
    step(world, 12, { moveX: 1, moveY: 0 });
    step(world, 6);

    const stopped = world.snapshot();
    expect(stopped.player.velocity).toEqual({ x: 0, y: 0 });

    const x = stopped.player.position.x;
    step(world, 1);
    expect(world.snapshot().player.position.x).toBeCloseTo(x, 6);
  });

  it('spawns outside the viewport and runs both weapon clocks automatically', () => {
    const world = new SimulationWorld();
    step(world, 120);

    const state = world.snapshot();
    expect(state.spawn.soloSequence).toBeGreaterThanOrEqual(2);
    expect(state.spawn.groupSequence).toBeGreaterThanOrEqual(1);
    expect(state.enemies.length).toBeGreaterThan(0);
    expect(state.enemies.some((enemy) => enemy.behavior === 'stationary-group')).toBe(true);

    const sidearm = state.weapons.find((weapon) => weapon.kind === 'sidearm');
    const saber = state.weapons.find((weapon) => weapon.kind === 'saber');
    expect(sidearm?.cycleSequence).toBeGreaterThan(3);
    expect(sidearm?.attackSequence).toBeGreaterThan(0);
    expect(saber?.cycleSequence).toBeGreaterThan(1);
  });
});
