import { describe, expect, it } from 'vitest';
import {
  AutoWeaponSystem,
  SABER_ARC_RADIANS,
  SABER_RANGE,
  SIDEARM_PROJECTILE_DRAG_PER_SECOND,
  SIDEARM_PROJECTILE_SPEED,
  SIDEARM_SPREAD_RADIANS,
} from '../../src/simulation/combat/AutoWeaponSystem';
import type {
  EnemyRuntime,
  MeleeSwingRuntime,
  ProjectileRuntime,
} from '../../src/simulation/combat/RuntimeTypes';

const enemy = (x: number, y: number, health = 3): EnemyRuntime => ({
  id: 1,
  groupId: null,
  behavior: 'chaser',
  position: { x, y },
  velocity: { x: 0, y: 0 },
  impulseVelocity: { x: 0, y: 0 },
  radius: 10,
  health,
  maxHealth: health,
});

describe('AutoWeaponSystem', () => {
  it('cycles every weapon even when no target exists', () => {
    const system = new AutoWeaponSystem();
    const projectiles: ProjectileRuntime[] = [];
    const swings: MeleeSwingRuntime[] = [];

    system.step(0.8, { x: 0, y: 0 }, [], projectiles, swings, () => 1, () => 1);

    const sidearm = system.snapshot().find((weapon) => weapon.kind === 'sidearm');
    const saber = system.snapshot().find((weapon) => weapon.kind === 'saber');
    expect(sidearm?.cycleSequence).toBeGreaterThanOrEqual(2);
    expect(saber?.cycleSequence).toBeGreaterThanOrEqual(1);
    expect(sidearm?.attackSequence).toBe(0);
    expect(saber?.attackSequence).toBe(0);
  });

  it('fires a kinetic projectile with deterministic bounded angular spread', () => {
    const system = new AutoWeaponSystem();
    const target = enemy(400, 0);
    const projectiles: ProjectileRuntime[] = [];
    const swings: MeleeSwingRuntime[] = [];

    system.step(0.13, { x: 0, y: 0 }, [target], projectiles, swings, () => 7, () => 1);

    expect(projectiles).toHaveLength(1);
    expect(projectiles[0]?.id).toBe(7);
    const projectile = projectiles[0];
    expect(projectile).toBeDefined();
    if (!projectile) return;

    const speed = Math.hypot(projectile.velocity.x, projectile.velocity.y);
    const angle = Math.atan2(projectile.velocity.y, projectile.velocity.x);
    expect(speed).toBeCloseTo(SIDEARM_PROJECTILE_SPEED, 6);
    expect(projectile.initialSpeed).toBe(SIDEARM_PROJECTILE_SPEED);
    expect(projectile.dragPerSecond).toBe(SIDEARM_PROJECTILE_DRAG_PER_SECOND);
    expect(projectile.massScale).toBeGreaterThan(0);
    expect(Math.abs(angle)).toBeLessThanOrEqual(SIDEARM_SPREAD_RADIANS + 1e-9);
  });

  it('creates a fixed-angle saber sector and applies it only when a target is in range', () => {
    const system = new AutoWeaponSystem();
    const target = enemy(60, 0);
    const projectiles: ProjectileRuntime[] = [];
    const swings: MeleeSwingRuntime[] = [];

    system.step(0.33, { x: 0, y: 0 }, [target], projectiles, swings, () => 1, () => 9);

    expect(swings).toHaveLength(1);
    expect(swings[0]).toMatchObject({
      id: 9,
      range: SABER_RANGE,
      arcRadians: SABER_ARC_RADIANS,
    });
    expect(target.health).toBe(1);
  });
});
