import type { EnemyBehavior, WeaponKind } from '../../domain/game-state';

export interface MutableVector2 {
  x: number;
  y: number;
}

export interface EnemyRuntime {
  id: number;
  groupId: number | null;
  behavior: EnemyBehavior;
  position: MutableVector2;
  velocity: MutableVector2;
  radius: number;
  health: number;
  maxHealth: number;
}

export interface ProjectileRuntime {
  id: number;
  position: MutableVector2;
  velocity: MutableVector2;
  radius: number;
  remainingSeconds: number;
  power: number;
}

export interface MeleeSwingRuntime {
  id: number;
  origin: MutableVector2;
  angle: number;
  arcRadians: number;
  range: number;
  durationSeconds: number;
  remainingSeconds: number;
}

export interface WeaponTimerRuntime {
  kind: WeaponKind;
  intervalSeconds: number;
  remainingSeconds: number;
  cycleSequence: number;
  attackSequence: number;
  aimAngle: number;
}

export interface SimulationViewport {
  readonly width: number;
  readonly height: number;
}
