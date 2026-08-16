import { describe, expect, it } from 'vitest';
import type { EnemyRuntime } from '../../src/simulation/combat/RuntimeTypes';
import { CHASER_SPEED, EnemyMovementSystem } from '../../src/simulation/enemies/EnemyMovementSystem';

const runtimeEnemy = (behavior: EnemyRuntime['behavior'], x: number): EnemyRuntime => ({
  id: behavior === 'chaser' ? 1 : 2,
  groupId: behavior === 'chaser' ? null : 1,
  behavior,
  position: { x, y: 0 },
  velocity: { x: 0, y: 0 },
  radius: 10,
  health: 3,
  maxHealth: 3,
});

describe('EnemyMovementSystem', () => {
  it('moves solo chasers toward the player while group members remain fixed', () => {
    const system = new EnemyMovementSystem();
    const chaser = runtimeEnemy('chaser', 500);
    const stationary = runtimeEnemy('stationary-group', 500);

    system.step([chaser, stationary], { x: 0, y: 0 }, 1);

    expect(chaser.position.x).toBeCloseTo(500 - CHASER_SPEED, 6);
    expect(chaser.velocity.x).toBeCloseTo(-CHASER_SPEED, 6);
    expect(stationary.position.x).toBe(500);
    expect(stationary.velocity).toEqual({ x: 0, y: 0 });
  });
});
