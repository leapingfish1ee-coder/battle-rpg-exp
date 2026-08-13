import type { GameState, PlayerCommand } from '../../domain/game-state';

const PLAYER_SPEED = 180;
const COUNTDOWN_DURATION_SECONDS = 5;
const TIMEOUT_DAMAGE_AMOUNT = 128;
const COUNTDOWN_EPSILON = 1e-9;

export class SimulationWorld {
  private tick = 0;
  private playerX = 320;
  private playerY = 180;
  private countdownRemainingSeconds = COUNTDOWN_DURATION_SECONDS;
  private countdownTimedOut = false;
  private timeoutSequence = 0;

  public step(deltaSeconds: number, command: PlayerCommand): void {
    const magnitude = Math.hypot(command.moveX, command.moveY);
    const scale = magnitude > 1 ? 1 / magnitude : 1;

    this.playerX += command.moveX * scale * PLAYER_SPEED * deltaSeconds;
    this.playerY += command.moveY * scale * PLAYER_SPEED * deltaSeconds;

    this.countdownTimedOut = false;
    const nextRemaining = Math.max(0, this.countdownRemainingSeconds - deltaSeconds);

    if (nextRemaining <= COUNTDOWN_EPSILON) {
      this.countdownRemainingSeconds = COUNTDOWN_DURATION_SECONDS;
      this.countdownTimedOut = true;
      this.timeoutSequence += 1;
    } else {
      this.countdownRemainingSeconds = nextRemaining;
    }

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
      countdown: {
        durationSeconds: COUNTDOWN_DURATION_SECONDS,
        remainingSeconds: this.countdownRemainingSeconds,
        timedOut: this.countdownTimedOut,
        timeoutSequence: this.timeoutSequence,
        damageAmount: TIMEOUT_DAMAGE_AMOUNT,
      },
    };
  }
}
