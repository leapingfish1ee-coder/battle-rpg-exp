import type { EnemyBehavior } from '../domain/game-state';

export interface WeaponPresentationState {
  readonly timerProgress: number;
  readonly cycleSequence: number;
  readonly attackSequence: number;
  readonly aimAngle: number;
}

export interface PresentationState {
  readonly player: {
    readonly x: number;
    readonly y: number;
    readonly velocityX: number;
    readonly velocityY: number;
  };
  readonly enemies: readonly {
    readonly id: number;
    readonly groupId: number | null;
    readonly behavior: EnemyBehavior;
    readonly x: number;
    readonly y: number;
    readonly velocityX: number;
    readonly velocityY: number;
    readonly radius: number;
    readonly healthRatio: number;
  }[];
  readonly projectiles: readonly {
    readonly id: number;
    readonly x: number;
    readonly y: number;
    readonly velocityX: number;
    readonly velocityY: number;
    readonly radius: number;
  }[];
  readonly meleeSwings: readonly {
    readonly id: number;
    readonly x: number;
    readonly y: number;
    readonly angle: number;
    readonly arcRadians: number;
    readonly range: number;
    readonly progress: number;
  }[];
  readonly weapons: {
    readonly sidearm: WeaponPresentationState;
    readonly saber: WeaponPresentationState;
  };
  readonly spawn: {
    readonly soloSequence: number;
    readonly groupSequence: number;
  };
}
