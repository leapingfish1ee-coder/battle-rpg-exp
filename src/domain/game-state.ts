export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export type EnemyBehavior = 'chaser' | 'stationary-group';
export type WeaponKind = 'sidearm' | 'saber';

export interface PlayerState {
  readonly position: Vector2;
  readonly velocity: Vector2;
}

export interface EnemyState {
  readonly id: number;
  readonly groupId: number | null;
  readonly behavior: EnemyBehavior;
  readonly position: Vector2;
  readonly velocity: Vector2;
  readonly radius: number;
  readonly health: number;
  readonly maxHealth: number;
}

export interface ProjectileState {
  readonly id: number;
  readonly position: Vector2;
  readonly velocity: Vector2;
  readonly radius: number;
  readonly remainingSeconds: number;
}

export interface MeleeSwingState {
  readonly id: number;
  readonly origin: Vector2;
  readonly angle: number;
  readonly arcRadians: number;
  readonly range: number;
  readonly durationSeconds: number;
  readonly remainingSeconds: number;
}

export interface WeaponTimerState {
  readonly kind: WeaponKind;
  readonly intervalSeconds: number;
  readonly remainingSeconds: number;
  readonly cycleSequence: number;
  readonly attackSequence: number;
  readonly aimAngle: number;
}

export interface SpawnState {
  readonly soloSequence: number;
  readonly groupSequence: number;
}

export interface GameState {
  readonly tick: number;
  readonly player: PlayerState;
  readonly enemies: readonly EnemyState[];
  readonly projectiles: readonly ProjectileState[];
  readonly meleeSwings: readonly MeleeSwingState[];
  readonly weapons: readonly WeaponTimerState[];
  readonly spawn: SpawnState;
}

export interface PlayerCommand {
  readonly moveX: number;
  readonly moveY: number;
}
