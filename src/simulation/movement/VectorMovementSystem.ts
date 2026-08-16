import type { PlayerCommand, Vector2 } from '../../domain/game-state';

export interface VectorMovementConfig {
  readonly maxSpeed: number;
  readonly acceleration: number;
  readonly deceleration: number;
}

export const DEFAULT_PLAYER_MOVEMENT: VectorMovementConfig = {
  maxSpeed: 240,
  acceleration: 1800,
  deceleration: 2400,
};

const ZERO_THRESHOLD = 1e-9;

const moveToward = (current: Vector2, target: Vector2, maxDelta: number): Vector2 => {
  const deltaX = target.x - current.x;
  const deltaY = target.y - current.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance <= maxDelta || distance <= ZERO_THRESHOLD) {
    return target;
  }

  const scale = maxDelta / distance;
  return {
    x: current.x + deltaX * scale,
    y: current.y + deltaY * scale,
  };
};

export class VectorMovementSystem {
  public constructor(private readonly config: VectorMovementConfig = DEFAULT_PLAYER_MOVEMENT) {}

  public step(velocity: Vector2, command: PlayerCommand, deltaSeconds: number): Vector2 {
    const inputMagnitude = Math.hypot(command.moveX, command.moveY);
    const inputScale = inputMagnitude > 1 ? 1 / inputMagnitude : 1;
    const targetVelocity = {
      x: command.moveX * inputScale * this.config.maxSpeed,
      y: command.moveY * inputScale * this.config.maxSpeed,
    };
    const hasInput = inputMagnitude > ZERO_THRESHOLD;
    const response = hasInput ? this.config.acceleration : this.config.deceleration;

    return moveToward(velocity, targetVelocity, response * Math.max(deltaSeconds, 0));
  }
}
