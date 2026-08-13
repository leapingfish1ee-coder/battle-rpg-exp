import type { GameState, PlayerCommand } from '../../domain/game-state';

const PLAYER_SPEED = 180;

export class SimulationWorld {
  private tick = 0;
  private playerX = 320;
  private playerY = 180;

  public step(deltaSeconds: number, command: PlayerCommand): void {
    const magnitude = Math.hypot(command.moveX, command.moveY);
    const scale = magnitude > 1 ? 1 / magnitude : 1;

    this.playerX += command.moveX * scale * PLAYER_SPEED * deltaSeconds;
    this.playerY += command.moveY * scale * PLAYER_SPEED * deltaSeconds;
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
      },
    };
  }
}
