import { describe, expect, it } from 'vitest';
import { PresentationSystem } from '../../src/presentation/PresentationSystem';
import type { GameState } from '../../src/domain/game-state';

const state = (x: number, y: number): GameState => ({
  tick: 0,
  player: { position: { x, y } },
});

describe('PresentationSystem', () => {
  it('interpolates between simulation snapshots', () => {
    const presentation = new PresentationSystem();
    const result = presentation.project(state(0, 10), state(10, 30), 0.5);

    expect(result.player).toEqual({ x: 5, y: 20 });
  });
});
