import type { GameState, WeaponKind, WeaponTimerState } from '../domain/game-state';
import type { PresentationState, WeaponPresentationState } from './PresentationState';

const lerp = (from: number, to: number, alpha: number): number => from + (to - from) * alpha;
const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);

const weaponOf = (state: GameState, kind: WeaponKind): WeaponTimerState => {
  const weapon = state.weapons.find((candidate) => candidate.kind === kind);
  if (!weapon) {
    throw new Error(`Missing weapon timer: ${kind}`);
  }
  return weapon;
};

const presentWeapon = (weapon: WeaponTimerState): WeaponPresentationState => ({
  timerProgress:
    weapon.intervalSeconds > 0
      ? clamp01(1 - weapon.remainingSeconds / weapon.intervalSeconds)
      : 1,
  cycleSequence: weapon.cycleSequence,
  attackSequence: weapon.attackSequence,
  aimAngle: weapon.aimAngle,
});

export class PresentationSystem {
  public project(previous: GameState, current: GameState, alpha: number): PresentationState {
    const interpolation = clamp01(alpha);
    const previousEnemies = new Map(
      previous.enemies.map((enemy) => [enemy.id, enemy] as const),
    );
    const previousProjectiles = new Map(
      previous.projectiles.map((projectile) => [projectile.id, projectile] as const),
    );

    return {
      player: {
        x: lerp(previous.player.position.x, current.player.position.x, interpolation),
        y: lerp(previous.player.position.y, current.player.position.y, interpolation),
        velocityX: lerp(previous.player.velocity.x, current.player.velocity.x, interpolation),
        velocityY: lerp(previous.player.velocity.y, current.player.velocity.y, interpolation),
      },
      enemies: current.enemies.map((enemy) => {
        const before = previousEnemies.get(enemy.id) ?? enemy;
        return {
          id: enemy.id,
          groupId: enemy.groupId,
          behavior: enemy.behavior,
          x: lerp(before.position.x, enemy.position.x, interpolation),
          y: lerp(before.position.y, enemy.position.y, interpolation),
          velocityX: lerp(before.velocity.x, enemy.velocity.x, interpolation),
          velocityY: lerp(before.velocity.y, enemy.velocity.y, interpolation),
          radius: enemy.radius,
          healthRatio: enemy.maxHealth > 0 ? clamp01(enemy.health / enemy.maxHealth) : 0,
        };
      }),
      projectiles: current.projectiles.map((projectile) => {
        const before = previousProjectiles.get(projectile.id) ?? projectile;
        return {
          id: projectile.id,
          x: lerp(before.position.x, projectile.position.x, interpolation),
          y: lerp(before.position.y, projectile.position.y, interpolation),
          velocityX: projectile.velocity.x,
          velocityY: projectile.velocity.y,
          radius: projectile.radius,
          energyRatio: clamp01(projectile.energyRatio),
        };
      }),
      projectileImpacts: current.projectileImpacts.map((impact) => ({
        id: impact.id,
        x: impact.position.x,
        y: impact.position.y,
        directionX: impact.direction.x,
        directionY: impact.direction.y,
        energyRatio: clamp01(impact.energyRatio),
        progress:
          impact.durationSeconds > 0
            ? clamp01(1 - impact.remainingSeconds / impact.durationSeconds)
            : 1,
      })),
      meleeSwings: current.meleeSwings.map((swing) => ({
        id: swing.id,
        x: swing.origin.x,
        y: swing.origin.y,
        angle: swing.angle,
        arcRadians: swing.arcRadians,
        range: swing.range,
        progress:
          swing.durationSeconds > 0
            ? clamp01(1 - swing.remainingSeconds / swing.durationSeconds)
            : 1,
      })),
      weapons: {
        sidearm: presentWeapon(weaponOf(current, 'sidearm')),
        saber: presentWeapon(weaponOf(current, 'saber')),
      },
      spawn: {
        soloSequence: current.spawn.soloSequence,
        groupSequence: current.spawn.groupSequence,
      },
    };
  }
}
