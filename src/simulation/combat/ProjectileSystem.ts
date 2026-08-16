import type { EnemyRuntime, ProjectileRuntime } from './RuntimeTypes';

const segmentCircleHit = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  centerX: number,
  centerY: number,
  radius: number,
): number | undefined => {
  const segmentX = endX - startX;
  const segmentY = endY - startY;
  const lengthSquared = segmentX * segmentX + segmentY * segmentY;

  if (lengthSquared <= 1e-12) {
    return Math.hypot(centerX - startX, centerY - startY) <= radius ? 0 : undefined;
  }

  const projection = Math.min(
    Math.max(
      ((centerX - startX) * segmentX + (centerY - startY) * segmentY) / lengthSquared,
      0,
    ),
    1,
  );
  const closestX = startX + segmentX * projection;
  const closestY = startY + segmentY * projection;
  return Math.hypot(centerX - closestX, centerY - closestY) <= radius ? projection : undefined;
};

export class ProjectileSystem {
  public step(
    projectiles: ProjectileRuntime[],
    enemies: EnemyRuntime[],
    deltaSeconds: number,
  ): ProjectileRuntime[] {
    const delta = Math.max(deltaSeconds, 0);
    const survivors: ProjectileRuntime[] = [];

    for (const projectile of projectiles) {
      const startX = projectile.position.x;
      const startY = projectile.position.y;
      const endX = startX + projectile.velocity.x * delta;
      const endY = startY + projectile.velocity.y * delta;
      let hitEnemy: EnemyRuntime | undefined;
      let hitT = Number.POSITIVE_INFINITY;

      for (const enemy of enemies) {
        if (enemy.health <= 0) continue;
        const candidateT = segmentCircleHit(
          startX,
          startY,
          endX,
          endY,
          enemy.position.x,
          enemy.position.y,
          enemy.radius + projectile.radius,
        );

        if (candidateT !== undefined && candidateT < hitT) {
          hitEnemy = enemy;
          hitT = candidateT;
        }
      }

      if (hitEnemy) {
        projectile.position.x = startX + (endX - startX) * hitT;
        projectile.position.y = startY + (endY - startY) * hitT;
        hitEnemy.health -= projectile.power;
        continue;
      }

      projectile.position.x = endX;
      projectile.position.y = endY;
      projectile.remainingSeconds -= delta;

      if (projectile.remainingSeconds > 0) {
        survivors.push(projectile);
      }
    }

    return survivors;
  }
}
