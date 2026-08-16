import { describe, expect, it } from 'vitest';
import type { GameState } from '../../src/domain/game-state';
import { PresentationSystem } from '../../src/presentation/PresentationSystem';

const state = (
  x: number,
  y: number,
  velocityX: number,
  velocityY: number,
): GameState => ({
  tick: 0,
  player: {
    position: { x, y },
    velocity: { x: velocityX, y: velocityY },
  },
});

describe('PresentationSystem', () => {
  it('interpolates player world position and velocity', () => {
    const presentation = new PresentationSystem();
    const result = presentation.project(state(0, 10, 20, 0), state(10, 30, 40, 20), 0.5);

    expect(result.player).toEqual({
      x: 5,
      y: 20,
      velocityX: 30,
      velocityY: 10,
    });
  });

  it('clamps interpolation to the snapshot interval', () => {
    const presentation = new PresentationSystem();

    expect(presentation.project(state(0, 0, 0, 0), state(10, 20, 30, 40), -1).player).toEqual({
      x: 0,
      y: 0,
      velocityX: 0,
      velocityY: 0,
    });
    expect(presentation.project(state(0, 0, 0, 0), state(10, 20, 30, 40), 2).player).toEqual({
      x: 10,
      y: 20,
      velocityX: 30,
      velocityY: 40,
    });
  });
});
