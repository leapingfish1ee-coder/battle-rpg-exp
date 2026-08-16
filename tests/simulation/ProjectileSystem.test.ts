import { describe, expect, it } from 'vitest';
import type {
  EnemyRuntime,
  ProjectileImpactRuntime,
  ProjectileRuntime,
} from '../../src/simulation/combat/RuntimeTypes';
import {
  projectileEnergyRatio,
  ProjectileSystem,
} from '../../src/simulation/combat/ProjectileSystem';

const enemy = (behavior: EnemyRuntime['behavior'] = 'chaser'): EnemyRuntime => ({
  id: 1,
  groupId: behavior === 'chaser' ? null : 1,
  behavior,
  position: { x: 50, y: 0 },
  velocity: { x: 0, y: 0 },
  impulseVelocity: { x: 0, y: 0 },
  radius: 10,
  health: 2,
  maxHealth: 2,
});

const projectile = (): ProjectileRuntime => ({
  id: 1,
  position: { x: 0, y: 0 },
  velocity: { x: 1000, y: 0 },
  radius: 2,
  remainingSeconds: 1,
  initialSpeed: 1000,
  massScale: 1,
  dragPerSecond: 0.2,
  basePower: 1,
});

describe('ProjectileSystem', () => {
  it('uses swept collision, energy-scaled damage, and impact impulse for moving enemies', () => {
    const system = new ProjectileSystem();
    const target = enemy();
    const shot = projectile();
    const impacts: ProjectileImpactRuntime[] = [];

    const survivors = system.step([shot], [target], impacts, 0.1, () => 7);

    expect(survivors).toHaveLength(0);
    expect(target.health).toBeLessThan(2);
    expect(target.impulseVelocity.x).toBeGreaterThan(0);
    expect(shot.position.x).toBeGreaterThan(0);
    expect(shot.position.x).toBeLessThan(100);
    expect(impacts).toHaveLength(1);
    expect(impacts[0]?.id).toBe(7);
    expect(impacts[0]?.energyRatio).toBeGreaterThan(0.9);
  });

  it('loses speed and kinetic energy continuously under drag', () => {
    const system = new ProjectileSystem();
    const shot = projectile();
    const impacts: ProjectileImpactRuntime[] = [];

    const survivors = system.step([shot], [], impacts, 0.5, () => 1);
    const survivor = survivors[0];
    expect(survivor).toBeDefined();
    if (!survivor) return;

    const speed = Math.hypot(survivor.velocity.x, survivor.velocity.y);
    expect(speed).toBeLessThan(1000);
    expect(projectileEnergyRatio(survivor, speed)).toBeLessThan(1);
    expect(projectileEnergyRatio(survivor, speed)).toBeGreaterThan(0.7);
  });

  it('keeps stationary group members fixed by withholding ballistic impulse', () => {
    const system = new ProjectileSystem();
    const target = enemy('stationary-group');
    const impacts: ProjectileImpactRuntime[] = [];

    system.step([projectile()], [target], impacts, 0.1, () => 1);

    expect(target.impulseVelocity).toEqual({ x: 0, y: 0 });
  });
});
