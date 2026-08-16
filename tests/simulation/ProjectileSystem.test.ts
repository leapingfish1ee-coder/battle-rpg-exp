import { describe, expect, it } from 'vitest';
import type { EnemyRuntime, ProjectileRuntime } from '../../src/simulation/combat/RuntimeTypes';
import { ProjectileSystem } from '../../src/simulation/combat/ProjectileSystem';

const enemy = (): EnemyRuntime => ({
  id: 1,
  groupId: null,
  behavior: 'chaser',
  position: { x: 50, y: 0 },
  velocity: { x: 0, y: 0 },
  radius: 10,
  health: 2,
  maxHealth: 2,
});

describe('ProjectileSystem', () => {
  it('uses segment collision so a fast projectile does not tunnel through a target', () => {
    const system = new ProjectileSystem();
    const target = enemy();
    const projectile: ProjectileRuntime = {
      id: 1,
      position: { x: 0, y: 0 },
      velocity: { x: 1000, y: 0 },
      radius: 2,
      remainingSeconds: 1,
      power: 1,
    };

    const survivors = system.step([projectile], [target], 0.1);

    expect(survivors).toHaveLength(0);
    expect(target.health).toBe(1);
    expect(projectile.position.x).toBeGreaterThan(0);
    expect(projectile.position.x).toBeLessThan(100);
  });
});
