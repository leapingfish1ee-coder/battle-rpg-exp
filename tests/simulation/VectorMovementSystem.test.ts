import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PLAYER_MOVEMENT,
  VectorMovementSystem,
} from '../../src/simulation/movement/VectorMovementSystem';

describe('VectorMovementSystem', () => {
  it('normalizes full-strength diagonal input', () => {
    const system = new VectorMovementSystem();
    const axial = system.step({ x: 0, y: 0 }, { moveX: 1, moveY: 0 }, 1);
    const diagonal = system.step({ x: 0, y: 0 }, { moveX: 1, moveY: 1 }, 1);

    expect(Math.hypot(axial.x, axial.y)).toBeCloseTo(DEFAULT_PLAYER_MOVEMENT.maxSpeed, 6);
    expect(Math.hypot(diagonal.x, diagonal.y)).toBeCloseTo(DEFAULT_PLAYER_MOVEMENT.maxSpeed, 6);
    expect(diagonal.x).toBeCloseTo(diagonal.y, 6);
  });

  it('preserves analog vector magnitude below one', () => {
    const system = new VectorMovementSystem();
    const velocity = system.step({ x: 0, y: 0 }, { moveX: 0.3, moveY: 0.4 }, 1);

    expect(Math.hypot(velocity.x, velocity.y)).toBeCloseTo(
      DEFAULT_PLAYER_MOVEMENT.maxSpeed * 0.5,
      6,
    );
  });

  it('accelerates and decelerates toward target velocity', () => {
    const system = new VectorMovementSystem();
    let velocity = { x: 0, y: 0 };

    velocity = system.step(velocity, { moveX: 1, moveY: 0 }, 1 / 60);
    expect(velocity.x).toBeCloseTo(30, 6);

    for (let tick = 0; tick < 7; tick += 1) {
      velocity = system.step(velocity, { moveX: 1, moveY: 0 }, 1 / 60);
    }

    expect(velocity.x).toBeCloseTo(DEFAULT_PLAYER_MOVEMENT.maxSpeed, 6);

    velocity = system.step(velocity, { moveX: 0, moveY: 0 }, 1 / 60);
    expect(velocity.x).toBeCloseTo(200, 6);

    for (let tick = 0; tick < 5; tick += 1) {
      velocity = system.step(velocity, { moveX: 0, moveY: 0 }, 1 / 60);
    }

    expect(velocity).toEqual({ x: 0, y: 0 });
  });
});
