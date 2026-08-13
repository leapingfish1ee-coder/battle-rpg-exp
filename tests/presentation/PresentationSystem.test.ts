import { describe, expect, it } from 'vitest';
import { PresentationSystem } from '../../src/presentation/PresentationSystem';
import type { GameState } from '../../src/domain/game-state';

const state = (x: number, y: number, remainingSeconds = 5): GameState => ({
  tick: 0,
  player: { position: { x, y } },
  countdown: {
    durationSeconds: 5,
    remainingSeconds,
    timedOut: remainingSeconds <= 0,
    timeoutSequence: remainingSeconds <= 0 ? 1 : 0,
    damageAmount: 128,
  },
});

describe('PresentationSystem', () => {
  it('interpolates between simulation snapshots', () => {
    const presentation = new PresentationSystem();
    const result = presentation.project(state(0, 10), state(10, 30), 0.5);

    expect(result.player).toEqual({ x: 5, y: 20 });
  });

  it('projects clockwise countdown progress', () => {
    const presentation = new PresentationSystem();
    const result = presentation.project(state(0, 0, 4), state(0, 0, 3), 0.5);

    expect(result.countdown.remainingSeconds).toBeCloseTo(3.5, 6);
    expect(result.countdown.progress).toBeCloseTo(0.3, 6);
  });
});
