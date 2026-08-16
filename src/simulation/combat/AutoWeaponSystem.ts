import type { WeaponTimerState } from '../../domain/game-state';
import { DeterministicRng } from '../rng/DeterministicRng';
import type {
  EnemyRuntime,
  MeleeSwingRuntime,
  MutableVector2,
  ProjectileRuntime,
  WeaponTimerRuntime,
} from './RuntimeTypes';

const SIDEARM_INTERVAL_SECONDS = 0.36;
const SIDEARM_INITIAL_DELAY_SECONDS = 0.12;
const SIDEARM_TARGET_RANGE = 2600;
const SIDEARM_PROJECTILE_SPEED = 920;
const SIDEARM_PROJECTILE_LIFETIME_SECONDS = 3.4;
const SIDEARM_PROJECTILE_RADIUS = 2;
const SIDEARM_PROJECTILE_POWER = 1;
const SIDEARM_MUZZLE_OFFSET = 18;
export const SIDEARM_SPREAD_RADIANS = (6 * Math.PI) / 180;

const SABER_INTERVAL_SECONDS = 0.78;
const SABER_INITIAL_DELAY_SECONDS = 0.32;
export const SABER_RANGE = 84;
export const SABER_ARC_RADIANS = (100 * Math.PI) / 180;
const SABER_DURATION_SECONDS = 0.16;
const SABER_POWER = 2;
const SABER_TARGET_PADDING = 14;

const normalizeAngle = (angle: number): number => Math.atan2(Math.sin(angle), Math.cos(angle));

const findNearestEnemy = (
  enemies: EnemyRuntime[],
  origin: MutableVector2,
  maxDistance: number,
): EnemyRuntime | undefined => {
  let nearest: EnemyRuntime | undefined;
  let nearestDistanceSquared = maxDistance * maxDistance;

  for (const enemy of enemies) {
    if (enemy.health <= 0) continue;
    const deltaX = enemy.position.x - origin.x;
    const deltaY = enemy.position.y - origin.y;
    const distanceSquared = deltaX * deltaX + deltaY * deltaY;

    if (
      distanceSquared < nearestDistanceSquared ||
      (distanceSquared === nearestDistanceSquared && nearest !== undefined && enemy.id < nearest.id)
    ) {
      nearest = enemy;
      nearestDistanceSquared = distanceSquared;
    }
  }

  return nearest;
};

export class AutoWeaponSystem {
  private readonly rng = new DeterministicRng(0x9d3f1b27);
  private readonly sidearm: WeaponTimerRuntime = {
    kind: 'sidearm',
    intervalSeconds: SIDEARM_INTERVAL_SECONDS,
    remainingSeconds: SIDEARM_INITIAL_DELAY_SECONDS,
    cycleSequence: 0,
    attackSequence: 0,
    aimAngle: 0,
  };
  private readonly saber: WeaponTimerRuntime = {
    kind: 'saber',
    intervalSeconds: SABER_INTERVAL_SECONDS,
    remainingSeconds: SABER_INITIAL_DELAY_SECONDS,
    cycleSequence: 0,
    attackSequence: 0,
    aimAngle: Math.PI / 4,
  };

  public step(
    deltaSeconds: number,
    player: MutableVector2,
    enemies: EnemyRuntime[],
    projectiles: ProjectileRuntime[],
    meleeSwings: MeleeSwingRuntime[],
    allocateProjectileId: () => number,
    allocateSwingId: () => number,
  ): void {
    const delta = Math.max(deltaSeconds, 0);

    this.advanceTimer(this.sidearm, delta, () => {
      this.fireSidearm(player, enemies, projectiles, allocateProjectileId);
    });
    this.advanceTimer(this.saber, delta, () => {
      this.swingSaber(player, enemies, meleeSwings, allocateSwingId);
    });
  }

  public snapshot(): readonly WeaponTimerState[] {
    return [this.sidearm, this.saber].map((timer) => ({
      kind: timer.kind,
      intervalSeconds: timer.intervalSeconds,
      remainingSeconds: timer.remainingSeconds,
      cycleSequence: timer.cycleSequence,
      attackSequence: timer.attackSequence,
      aimAngle: timer.aimAngle,
    }));
  }

  private advanceTimer(timer: WeaponTimerRuntime, deltaSeconds: number, onCycle: () => void): void {
    timer.remainingSeconds -= deltaSeconds;

    while (timer.remainingSeconds <= 0) {
      timer.remainingSeconds += timer.intervalSeconds;
      timer.cycleSequence += 1;
      onCycle();
    }
  }

  private fireSidearm(
    player: MutableVector2,
    enemies: EnemyRuntime[],
    projectiles: ProjectileRuntime[],
    allocateProjectileId: () => number,
  ): void {
    const target = findNearestEnemy(enemies, player, SIDEARM_TARGET_RANGE);
    if (!target) return;

    const targetAngle = Math.atan2(target.position.y - player.y, target.position.x - player.x);
    const spread = (this.rng.nextFloat() * 2 - 1) * SIDEARM_SPREAD_RADIANS;
    const angle = targetAngle + spread;
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);
    this.sidearm.aimAngle = angle;
    this.sidearm.attackSequence += 1;

    projectiles.push({
      id: allocateProjectileId(),
      position: {
        x: player.x + directionX * SIDEARM_MUZZLE_OFFSET,
        y: player.y + directionY * SIDEARM_MUZZLE_OFFSET,
      },
      velocity: {
        x: directionX * SIDEARM_PROJECTILE_SPEED,
        y: directionY * SIDEARM_PROJECTILE_SPEED,
      },
      radius: SIDEARM_PROJECTILE_RADIUS,
      remainingSeconds: SIDEARM_PROJECTILE_LIFETIME_SECONDS,
      power: SIDEARM_PROJECTILE_POWER,
    });
  }

  private swingSaber(
    player: MutableVector2,
    enemies: EnemyRuntime[],
    meleeSwings: MeleeSwingRuntime[],
    allocateSwingId: () => number,
  ): void {
    const target = findNearestEnemy(enemies, player, SABER_RANGE + SABER_TARGET_PADDING);
    if (!target) return;

    const angle = Math.atan2(target.position.y - player.y, target.position.x - player.x);
    this.saber.aimAngle = angle;
    this.saber.attackSequence += 1;

    meleeSwings.push({
      id: allocateSwingId(),
      origin: { x: player.x, y: player.y },
      angle,
      arcRadians: SABER_ARC_RADIANS,
      range: SABER_RANGE,
      durationSeconds: SABER_DURATION_SECONDS,
      remainingSeconds: SABER_DURATION_SECONDS,
    });

    const halfArc = SABER_ARC_RADIANS / 2;
    for (const enemy of enemies) {
      if (enemy.health <= 0) continue;
      const deltaX = enemy.position.x - player.x;
      const deltaY = enemy.position.y - player.y;
      const distance = Math.hypot(deltaX, deltaY);
      if (distance > SABER_RANGE + enemy.radius) continue;

      const enemyAngle = Math.atan2(deltaY, deltaX);
      if (Math.abs(normalizeAngle(enemyAngle - angle)) <= halfArc) {
        enemy.health -= SABER_POWER;
      }
    }
  }
}
