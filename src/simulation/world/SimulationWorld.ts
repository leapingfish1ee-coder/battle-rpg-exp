import type { GameState, PlayerCommand, Vector2 } from '../../domain/game-state';
import { VectorMovementSystem } from '../movement/VectorMovementSystem';

export class SimulationWorld {
  private readonly movement = new VectorMovementSystem();
  private tick = 0;
  private playerX = 0;
  private playerY = 0;
  private playerVelocity: Vector2 = { x: 0, y: 0 };

  public step(deltaSeconds: number, command: PlayerCommand): void {
    this.playerVelocity = this.movement.step(this.playerVelocity, command, deltaSeconds);
    this.playerX += this.playerVelocity.x * deltaSeconds;
    this.playerY += this.playerVelocity.y * deltaSeconds;
    this.tick += 1;
  }

  public snapshot(): GameState {
    return {
      tick: this.tick,
      player: {
        position: {
          x: this.playerX,
          y: this.playerY,
        },
        velocity: {
          x: this.playerVelocity.x,
          y: this.playerVelocity.y,
        },
      },
    };
  }
}
