import type { GameState } from '../domain/game-state';
import type { PresentationState } from './PresentationState';

const lerp = (from: number, to: number, alpha: number): number => from + (to - from) * alpha;

export class PresentationSystem {
  public project(previous: GameState, current: GameState, alpha: number): PresentationState {
    const interpolation = Math.min(Math.max(alpha, 0), 1);

    return {
      player: {
        x: lerp(previous.player.position.x, current.player.position.x, interpolation),
        y: lerp(previous.player.position.y, current.player.position.y, interpolation),
      },
    };
  }
}
