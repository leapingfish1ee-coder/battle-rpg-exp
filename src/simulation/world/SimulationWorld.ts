import type { GameState, PlayerCommand, Vector2 } from '../../domain/game-state';
import { AutoWeaponSystem } from '../combat/AutoWeaponSystem';
import { ProjectileSystem } from '../combat/ProjectileSystem';
import type {
  EnemyRuntime,
  MeleeSwingRuntime,
  ProjectileRuntime,
  SimulationViewport,
} from '../combat/RuntimeTypes';
import { EnemyMovementSystem } from '../enemies/EnemyMovementSystem';
import { EnemySpawnSystem } from '../enemies/EnemySpawnSystem';
import { VectorMovementSystem } from '../movement/VectorMovementSystem';

export type { SimulationViewport } from '../combat/RuntimeTypes';

export class SimulationWorld {
  private readonly movement = new VectorMovementSystem();
  private readonly enemySpawner = new EnemySpawnSystem();
  private readonly enemyMovement = new EnemyMovementSystem();
  private readonly weapons = new AutoWeaponSystem();
  private readonly projectileSystem = new ProjectileSystem();

  private tick = 0;
  private playerX = 0;
  private playerY = 0;
  private playerVelocity: Vector2 = { x: 0, y: 0 };
  private enemies: EnemyRuntime[] = [];
  private projectiles: ProjectileRuntime[] = [];
  private meleeSwings: MeleeSwingRuntime[] = [];
  private nextEnemyId = 1;
  private nextProjectileId = 1;
  private nextSwingId = 1;

  private readonly allocateEnemyId = (): number => this.nextEnemyId++;
  private readonly allocateProjectileId = (): number => this.nextProjectileId++;
  private readonly allocateSwingId = (): number => this.nextSwingId++;

  public step(
    deltaSeconds: number,
    command: PlayerCommand,
    viewport: SimulationViewport,
  ): void {
    const delta = Math.max(deltaSeconds, 0);
    this.playerVelocity = this.movement.step(this.playerVelocity, command, delta);
    this.playerX += this.playerVelocity.x * delta;
    this.playerY += this.playerVelocity.y * delta;

    const player = { x: this.playerX, y: this.playerY };
    this.ageMeleeSwings(delta);
    this.enemySpawner.step(delta, player, viewport, this.enemies, this.allocateEnemyId);
    this.enemyMovement.step(this.enemies, player, delta);
    this.weapons.step(
      delta,
      player,
      this.enemies,
      this.projectiles,
      this.meleeSwings,
      this.allocateProjectileId,
      this.allocateSwingId,
    );
    this.projectiles = this.projectileSystem.step(this.projectiles, this.enemies, delta);
    this.enemies = this.enemies.filter((enemy) => enemy.health > 0);
    this.tick += 1;
  }

  public snapshot(): GameState {
    const spawn = this.enemySpawner.snapshot();

    return {
      tick: this.tick,
      player: {
        position: { x: this.playerX, y: this.playerY },
        velocity: { x: this.playerVelocity.x, y: this.playerVelocity.y },
      },
      enemies: this.enemies.map((enemy) => ({
        id: enemy.id,
        groupId: enemy.groupId,
        behavior: enemy.behavior,
        position: { x: enemy.position.x, y: enemy.position.y },
        velocity: { x: enemy.velocity.x, y: enemy.velocity.y },
        radius: enemy.radius,
        health: enemy.health,
        maxHealth: enemy.maxHealth,
      })),
      projectiles: this.projectiles.map((projectile) => ({
        id: projectile.id,
        position: { x: projectile.position.x, y: projectile.position.y },
        velocity: { x: projectile.velocity.x, y: projectile.velocity.y },
        radius: projectile.radius,
        remainingSeconds: projectile.remainingSeconds,
      })),
      meleeSwings: this.meleeSwings.map((swing) => ({
        id: swing.id,
        origin: { x: swing.origin.x, y: swing.origin.y },
        angle: swing.angle,
        arcRadians: swing.arcRadians,
        range: swing.range,
        durationSeconds: swing.durationSeconds,
        remainingSeconds: swing.remainingSeconds,
      })),
      weapons: this.weapons.snapshot(),
      spawn: {
        soloSequence: spawn.soloSequence,
        groupSequence: spawn.groupSequence,
      },
    };
  }

  private ageMeleeSwings(deltaSeconds: number): void {
    for (const swing of this.meleeSwings) {
      swing.remainingSeconds -= deltaSeconds;
    }
    this.meleeSwings = this.meleeSwings.filter((swing) => swing.remainingSeconds > 0);
  }
}
