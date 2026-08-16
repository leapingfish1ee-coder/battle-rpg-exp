import type { EnemyRuntime, MutableVector2 } from '../combat/RuntimeTypes';

export const CHASER_SPEED = 105;
const STOP_DISTANCE = 20;
const DISTANCE_EPSILON = 1e-9;

export class EnemyMovementSystem {
  public step(enemies: EnemyRuntime[], player: MutableVector2, deltaSeconds: number): void {
    const delta = Math.max(deltaSeconds, 0);

    for (const enemy of enemies) {
      if (enemy.behavior === 'stationary-group') {
        enemy.velocity.x = 0;
        enemy.velocity.y = 0;
        continue;
      }

      const deltaX = player.x - enemy.position.x;
      const deltaY = player.y - enemy.position.y;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance <= STOP_DISTANCE || distance <= DISTANCE_EPSILON) {
        enemy.velocity.x = 0;
        enemy.velocity.y = 0;
        continue;
      }

      const inverseDistance = 1 / distance;
      enemy.velocity.x = deltaX * inverseDistance * CHASER_SPEED;
      enemy.velocity.y = deltaY * inverseDistance * CHASER_SPEED;
      enemy.position.x += enemy.velocity.x * delta;
      enemy.position.y += enemy.velocity.y * delta;
    }
  }
}
