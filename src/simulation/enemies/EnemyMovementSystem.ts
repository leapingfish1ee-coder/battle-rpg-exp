import type { EnemyRuntime, MutableVector2 } from '../combat/RuntimeTypes';

export const CHASER_SPEED = 105;
const STOP_DISTANCE = 20;
const DISTANCE_EPSILON = 1e-9;
const IMPULSE_DECAY_PER_SECOND = 10;

export class EnemyMovementSystem {
  public step(enemies: EnemyRuntime[], player: MutableVector2, deltaSeconds: number): void {
    const delta = Math.max(deltaSeconds, 0);
    const impulseRetention = Math.exp(-IMPULSE_DECAY_PER_SECOND * delta);

    for (const enemy of enemies) {
      if (enemy.behavior === 'stationary-group') {
        enemy.velocity.x = 0;
        enemy.velocity.y = 0;
        enemy.impulseVelocity.x = 0;
        enemy.impulseVelocity.y = 0;
        continue;
      }

      const deltaX = player.x - enemy.position.x;
      const deltaY = player.y - enemy.position.y;
      const distance = Math.hypot(deltaX, deltaY);
      let chaseX = 0;
      let chaseY = 0;

      if (distance > STOP_DISTANCE && distance > DISTANCE_EPSILON) {
        const inverseDistance = 1 / distance;
        chaseX = deltaX * inverseDistance * CHASER_SPEED;
        chaseY = deltaY * inverseDistance * CHASER_SPEED;
      }

      enemy.impulseVelocity.x *= impulseRetention;
      enemy.impulseVelocity.y *= impulseRetention;
      enemy.velocity.x = chaseX + enemy.impulseVelocity.x;
      enemy.velocity.y = chaseY + enemy.impulseVelocity.y;
      enemy.position.x += enemy.velocity.x * delta;
      enemy.position.y += enemy.velocity.y * delta;
    }
  }
}
