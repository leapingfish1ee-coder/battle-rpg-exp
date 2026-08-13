import type { GameState } from '../domain/game-state';
import type { PresentationState } from './PresentationState';

const lerp = (from: number, to: number, alpha: number): number => from + (to - from) * alpha;
const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);

export class PresentationSystem {
  public project(previous: GameState, current: GameState, alpha: number): PresentationState {
    const interpolation = clamp01(alpha);
    const durationSeconds = current.countdown.durationSeconds;
    const remainingSeconds = current.countdown.timedOut
      ? 0
      : lerp(
          previous.countdown.remainingSeconds,
          current.countdown.remainingSeconds,
          interpolation,
        );
    const progress = durationSeconds > 0 ? clamp01(1 - remainingSeconds / durationSeconds) : 1;

    return {
      player: {
        x: lerp(previous.player.position.x, current.player.position.x, interpolation),
        y: lerp(previous.player.position.y, current.player.position.y, interpolation),
      },
      countdown: {
        progress,
        remainingSeconds,
        timedOut: current.countdown.timedOut,
      },
      damagePopup: {
        sequence: current.countdown.timeoutSequence,
        amount: current.countdown.damageAmount,
      },
    };
  }
}
