import type { GameState } from '../domain/game-state';
import type { PresentationState } from './PresentationState';

const lerp = (from: number, to: number, alpha: number): number => from + (to - from) * alpha;
const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);

export class PresentationSystem {
  public project(previous: GameState, current: GameState, alpha: number): PresentationState {
    const interpolation = clamp01(alpha);

    return {
      player: {
        x: lerp(previous.player.position.x, current.player.position.x, interpolation),
        y: lerp(previous.player.position.y, current.player.position.y, interpolation),
        velocityX: lerp(previous.player.velocity.x, current.player.velocity.x, interpolation),
        velocityY: lerp(previous.player.velocity.y, current.player.velocity.y, interpolation),
      },
    };
  }
}
