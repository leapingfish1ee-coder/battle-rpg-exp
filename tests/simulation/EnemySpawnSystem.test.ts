import { describe, expect, it } from 'vitest';
import type { EnemyRuntime } from '../../src/simulation/combat/RuntimeTypes';
import { EnemySpawnSystem } from '../../src/simulation/enemies/EnemySpawnSystem';

const outside = (enemy: EnemyRuntime): boolean =>
  Math.abs(enemy.position.x) > 400 || Math.abs(enemy.position.y) > 300;

describe('EnemySpawnSystem', () => {
  it('places solo enemies and stationary groups beyond the current viewport', () => {
    const system = new EnemySpawnSystem();
    const enemies: EnemyRuntime[] = [];
    let nextId = 1;
    const allocate = (): number => nextId++;
    const player = { x: 0, y: 0 };
    const viewport = { width: 800, height: 600 };

    system.step(0.4, player, viewport, enemies, allocate);
    expect(system.snapshot().soloSequence).toBe(1);
    expect(enemies).toHaveLength(1);
    expect(enemies[0]?.behavior).toBe('chaser');
    expect(enemies[0] ? outside(enemies[0]) : false).toBe(true);

    system.step(0.6, player, viewport, enemies, allocate);
    expect(system.snapshot().groupSequence).toBe(1);

    const groupMembers = enemies.filter((enemy) => enemy.behavior === 'stationary-group');
    expect(groupMembers.length).toBeGreaterThanOrEqual(4);
    expect(groupMembers.every(outside)).toBe(true);
    expect(new Set(groupMembers.map((enemy) => enemy.groupId)).size).toBe(1);
  });
});
