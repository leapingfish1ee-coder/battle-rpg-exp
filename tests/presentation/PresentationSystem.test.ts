import { describe, expect, it } from 'vitest';
import type { GameState } from '../../src/domain/game-state';
import { PresentationSystem } from '../../src/presentation/PresentationSystem';

const state = (
  playerX: number,
  playerY: number,
  enemyX: number,
  projectileX: number,
): GameState => ({
  tick: 0,
  player: {
    position: { x: playerX, y: playerY },
    velocity: { x: 40, y: 20 },
  },
  enemies: [
    {
      id: 1,
      groupId: null,
      behavior: 'chaser',
      position: { x: enemyX, y: 30 },
      velocity: { x: -100, y: 0 },
      radius: 10,
      health: 1,
      maxHealth: 2,
    },
  ],
  projectiles: [
    {
      id: 1,
      position: { x: projectileX, y: 0 },
      velocity: { x: 900, y: 0 },
      radius: 2,
      remainingSeconds: 1,
      initialSpeed: 1000,
      energyRatio: 0.81,
    },
  ],
  projectileImpacts: [
    {
      id: 4,
      position: { x: 70, y: 5 },
      direction: { x: 1, y: 0 },
      energyRatio: 0.9,
      durationSeconds: 0.2,
      remainingSeconds: 0.1,
    },
  ],
  meleeSwings: [
    {
      id: 1,
      origin: { x: playerX, y: playerY },
      angle: 0,
      arcRadians: Math.PI / 2,
      range: 80,
      durationSeconds: 0.2,
      remainingSeconds: 0.1,
    },
  ],
  weapons: [
    {
      kind: 'sidearm',
      intervalSeconds: 1,
      remainingSeconds: 0.25,
      cycleSequence: 4,
      attackSequence: 3,
      aimAngle: 0.2,
    },
    {
      kind: 'saber',
      intervalSeconds: 2,
      remainingSeconds: 1,
      cycleSequence: 2,
      attackSequence: 1,
      aimAngle: 0.8,
    },
  ],
  spawn: {
    soloSequence: 2,
    groupSequence: 1,
  },
});

describe('PresentationSystem', () => {
  it('interpolates moving world entities by stable id', () => {
    const presentation = new PresentationSystem();
    const result = presentation.project(state(0, 0, 100, 10), state(10, 20, 80, 30), 0.5);

    expect(result.player.x).toBe(5);
    expect(result.player.y).toBe(10);
    expect(result.enemies[0]?.x).toBe(90);
    expect(result.enemies[0]?.healthRatio).toBe(0.5);
    expect(result.projectiles[0]?.x).toBe(20);
    expect(result.projectiles[0]?.energyRatio).toBeCloseTo(0.81, 6);
  });

  it('projects weapon clocks, melee progress, ballistic impacts, and spawn sequences', () => {
    const presentation = new PresentationSystem();
    const current = state(0, 0, 100, 10);
    const result = presentation.project(current, current, 1);

    expect(result.weapons.sidearm.timerProgress).toBeCloseTo(0.75, 6);
    expect(result.weapons.sidearm.cycleSequence).toBe(4);
    expect(result.weapons.saber.timerProgress).toBeCloseTo(0.5, 6);
    expect(result.meleeSwings[0]?.progress).toBeCloseTo(0.5, 6);
    expect(result.projectileImpacts[0]).toMatchObject({
      id: 4,
      energyRatio: 0.9,
      progress: 0.5,
    });
    expect(result.spawn).toEqual({ soloSequence: 2, groupSequence: 1 });
  });
});
